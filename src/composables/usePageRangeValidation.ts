import { useMessagePruning } from "~/composables/useMessagePruning"
import { useModelStore } from "~/store/models"

export function usePageRangeValidation() {
    const modelStore = useModelStore()
    const messagePruning = useMessagePruning()

    /**
     * Get the current model's context window and capacity information
     */
    function getModelCapacityInfo() {
        const contextWindow = modelStore.current.context_window || 10000
        const isHighCapacity = contextWindow >= 100000
        const isMediumCapacity = contextWindow >= 50000 && contextWindow < 100000
        const isLowCapacity = contextWindow < 50000

        return {
            contextWindow,
            isHighCapacity,
            isMediumCapacity,
            isLowCapacity,
            maxRecommendedPages: isHighCapacity ? 200 : isMediumCapacity ? 100 : 50,
        }
    }

    /**
     * Validate if a page range request is feasible for the current model
     */
    function validatePageRangeForModel(
        pageRange: [number, number],
        averageTokensPerPage: number
    ): {
        isFeasible: boolean
        reason: string
        suggestedRange?: [number, number]
        maxSafePages: number
    } {
        const capacity = getModelCapacityInfo()
        const pageCount = pageRange[1] - pageRange[0] + 1
        const estimatedTokens = pageCount * averageTokensPerPage

        // Check if the request exceeds the model's capacity
        if (estimatedTokens > capacity.contextWindow * 0.8) {
            const maxSafePages = Math.floor((capacity.contextWindow * 0.8) / averageTokensPerPage)
            const suggestedRange: [number, number] = [pageRange[0], Math.min(pageRange[0] + maxSafePages - 1, pageRange[1])]

            let reason = ""
            if (capacity.isLowCapacity) {
                reason = `This model has limited capacity and can only handle approximately ${maxSafePages} pages at once.`
            } else if (capacity.isMediumCapacity) {
                reason = `This model has moderate capacity and may struggle with very large page ranges.`
            } else {
                reason = `The requested range exceeds the recommended limit for optimal performance.`
            }

            return {
                isFeasible: false,
                reason,
                suggestedRange,
                maxSafePages,
            }
        }

        return {
            isFeasible: true,
            reason: "Page range is within model capacity",
            maxSafePages: Math.floor((capacity.contextWindow * 0.8) / averageTokensPerPage),
        }
    }

    /**
     * Get user-friendly error messages for page range issues
     */
    function getPageRangeErrorMessage(
        pageRange: [number, number],
        reason: string,
        suggestedRange?: [number, number]
    ): {
        title: string
        message: string
        suggestion?: string
        action?: string
    } {
        const pageCount = pageRange[1] - pageRange[0] + 1

        if (pageCount > 100) {
            return {
                title: "Page Range Too Large",
                message: `You're requesting ${pageCount} pages, which exceeds the recommended limit. ${reason}`,
                suggestion: suggestedRange ? `Consider using pages ${suggestedRange[0]}-${suggestedRange[1]} instead.` : "Try selecting a smaller page range.",
                action: "Select a smaller range or start a new conversation for a fresh context.",
            }
        } else if (pageCount > 50) {
            return {
                title: "Large Page Range Warning",
                message: `You're requesting ${pageCount} pages. While this may work, it could affect response quality.`,
                suggestion: "Consider breaking this into smaller requests for better results.",
                action: "You can proceed, but smaller ranges are recommended.",
            }
        }

        return {
            title: "Page Range Issue",
            message: reason,
            action: "Please adjust your page selection.",
        }
    }

    /**
     * Calculate optimal page ranges for large documents
     */
    function calculateOptimalPageRanges(totalPages: number, averageTokensPerPage: number, targetChunkSize: number = 50): Array<[number, number]> {
        const capacity = getModelCapacityInfo()
        const maxPagesPerChunk = Math.min(targetChunkSize, Math.floor((capacity.contextWindow * 0.6) / averageTokensPerPage))

        const ranges: Array<[number, number]> = []
        let currentPage = 1

        while (currentPage <= totalPages) {
            const endPage = Math.min(currentPage + maxPagesPerChunk - 1, totalPages)
            ranges.push([currentPage, endPage])
            currentPage = endPage + 1
        }

        return ranges
    }

    /**
     * Suggest alternative approaches for large page requests
     */
    function suggestAlternatives(
        pageRange: [number, number],
        totalPages: number
    ): Array<{
        title: string
        description: string
        action: string
        pageRange?: [number, number]
    }> {
        const pageCount = pageRange[1] - pageRange[0] + 1
        const alternatives = []

        if (pageCount > 100) {
            // Suggest breaking into chunks
            const chunkSize = Math.ceil(pageCount / 3)
            alternatives.push({
                title: "Break into 3 parts",
                description: `Split your request into smaller, manageable chunks`,
                action: "Process pages in groups of ~" + chunkSize,
                pageRange: [pageRange[0], Math.min(pageRange[0] + chunkSize - 1, totalPages)] as [number, number],
            })

            // Suggest focusing on key sections
            alternatives.push({
                title: "Focus on key sections",
                description: "Select specific important pages rather than entire ranges",
                action: "Choose 20-30 most relevant pages",
                pageRange: [pageRange[0], Math.min(pageRange[0] + 29, totalPages)] as [number, number],
            })
        } else if (pageCount > 50) {
            // Suggest moderate reduction
            alternatives.push({
                title: "Reduce range slightly",
                description: "Cut back by 10-20 pages for better performance",
                action: "Use a smaller range for optimal results",
                pageRange: [pageRange[0], Math.min(pageRange[0] + 39, totalPages)] as [number, number],
            })
        }

        // Always suggest starting fresh
        alternatives.push({
            title: "Start fresh conversation",
            description: "Begin a new conversation for maximum context availability",
            action: "New conversation will have full context window available",
            pageRange: undefined,
        })

        return alternatives
    }

    /**
     * Check if the current model supports large file interactions
     */
    function canHandleLargeFiles(): {
        supported: boolean
        reason: string
        recommendation: string
    } {
        const capacity = getModelCapacityInfo()

        if (capacity.isHighCapacity) {
            return {
                supported: true,
                reason: "This model has a large context window and can handle extensive documents.",
                recommendation: "You can work with large page ranges, but consider breaking very long documents into logical sections.",
            }
        } else if (capacity.isMediumCapacity) {
            return {
                supported: true,
                reason: "This model has moderate capacity and can handle medium-sized documents.",
                recommendation: "Keep page ranges under 100 pages for optimal performance.",
            }
        } else {
            return {
                supported: false,
                reason: "This model has limited capacity and is not recommended for large documents.",
                recommendation: "Switch to a model with a larger context window or break your document into smaller sections.",
            }
        }
    }

    return {
        getModelCapacityInfo,
        validatePageRangeForModel,
        getPageRangeErrorMessage,
        calculateOptimalPageRanges,
        suggestAlternatives,
        canHandleLargeFiles,
    }
}
