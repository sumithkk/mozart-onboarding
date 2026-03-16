import { useConversationStore } from "~/store/conversations"
import { useMessagePruning } from "~/composables/useMessagePruning"
import { useModelStore } from "~/store/models"
import { usePageRangeValidation } from "~/composables/usePageRangeValidation"

export function useCompletionErrorHandling() {
    const modelStore = useModelStore()
    const messagePruning = useMessagePruning()
    const pageRangeValidation = usePageRangeValidation()

    /**
     * Parse error messages to extract relevant information
     */
    function parseErrorMessage(errorMessage: string): {
        type: "context_window_exceeded" | "token_limit_exceeded" | "model_capacity" | "unknown"
        details: {
            requested: number
            limit: number
            model: string
            suggestion?: string
        }
    } {
        // Common error patterns
        const contextWindowPattern = /context length is (\d+) tokens.*?(\d+) tokens/
        const tokenLimitPattern = /maximum.*?(\d+) tokens.*?(\d+) tokens/
        const modelPattern = /model.*?(\w+)/i

        let match = errorMessage.match(contextWindowPattern)
        if (match) {
            return {
                type: "context_window_exceeded",
                details: {
                    requested: parseInt(match[2]),
                    limit: parseInt(match[1]),
                    model: modelStore.current.model || "unknown",
                    suggestion: "The request exceeds the model's context window. Consider reducing the page range or starting a new conversation.",
                },
            }
        }

        match = errorMessage.match(tokenLimitPattern)
        if (match) {
            return {
                type: "token_limit_exceeded",
                details: {
                    requested: parseInt(match[2]),
                    limit: parseInt(match[1]),
                    model: modelStore.current.model || "unknown",
                    suggestion: "The request exceeds the token limit. Try selecting fewer pages or use a model with a larger context window.",
                },
            }
        }

        return {
            type: "unknown",
            details: {
                requested: 0,
                limit: 0,
                model: modelStore.current.model || "unknown",
                suggestion: "An unexpected error occurred. Please try again with a smaller page range.",
            },
        }
    }

    /**
     * Generate user-friendly error messages
     */
    function generateUserFriendlyError(errorMessage: string): {
        title: string
        message: string
        actions: string[]
        canRetry: boolean
        requiresUserAction: boolean
    } {
        const parsed = parseErrorMessage(errorMessage)
        const modelCapacity = pageRangeValidation.canHandleLargeFiles()

        if (parsed.type === "context_window_exceeded" || parsed.type === "token_limit_exceeded") {
            const percentage = Math.round((parsed.details.requested / parsed.details.limit) * 100)

            let title = "Request Too Large"
            let message = `Your request requires ${parsed.details.requested.toLocaleString()} tokens, but the model can only handle ${parsed.details.limit.toLocaleString()} tokens (${percentage}% over limit).`

            const actions = ["Reduce the page range to fewer pages", "Start a new conversation for a fresh context", "Switch to a model with a larger context window"]

            if (!modelCapacity.supported) {
                title = "Model Capacity Insufficient"
                message += ` This model (${parsed.details.model}) is not designed for large documents.`
                actions.unshift("Switch to a high-capacity model like GPT-4 Turbo or Claude 3.5 Sonnet")
            }

            return {
                title,
                message,
                actions,
                canRetry: false,
                requiresUserAction: true,
            }
        }

        // Handle other error types
        if (errorMessage.includes("Internal Error") || errorMessage.includes("Please try again later")) {
            return {
                title: "Service Temporarily Unavailable",
                message: "The service is experiencing high demand. This often happens when requests are too large for the current model.",
                actions: ["Wait a few minutes and try again", "Reduce the page range", "Start a new conversation"],
                canRetry: true,
                requiresUserAction: true,
            }
        }

        return {
            title: "Unexpected Error",
            message: "Something went wrong while processing your request. This may be due to the size or complexity of your document.",
            actions: ["Try with a smaller page range", "Check if the document is properly loaded", "Start a new conversation"],
            canRetry: true,
            requiresUserAction: true,
        }
    }

    /**
     * Suggest optimal page ranges based on error
     */
    function suggestOptimalPageRanges(
        totalPages: number,
        averageTokensPerPage: number,
        currentRange: [number, number]
    ): Array<{
        title: string
        range: [number, number]
        estimatedTokens: number
        description: string
    }> {
        const capacity = pageRangeValidation.getModelCapacityInfo()
        const maxSafePages = Math.floor((capacity.contextWindow * 0.7) / averageTokensPerPage)

        const suggestions = []

        // Suggest a safe range
        if (maxSafePages < totalPages) {
            suggestions.push({
                title: "Safe Range",
                range: [1, Math.min(maxSafePages, totalPages)] as [number, number],
                estimatedTokens: Math.min(maxSafePages, totalPages) * averageTokensPerPage,
                description: `Maximum safe range for this model (${maxSafePages} pages)`,
            })
        }

        // Suggest breaking into chunks
        if (currentRange[1] - currentRange[0] + 1 > 50) {
            const chunkSize = Math.ceil((currentRange[1] - currentRange[0] + 1) / 3)
            suggestions.push({
                title: "First Third",
                range: [currentRange[0], Math.min(currentRange[0] + chunkSize - 1, totalPages)] as [number, number],
                estimatedTokens: chunkSize * averageTokensPerPage,
                description: "Process the document in manageable chunks",
            })
        }

        // Suggest key pages only
        if (totalPages > 20) {
            suggestions.push({
                title: "Key Pages Only",
                range: [1, Math.min(20, totalPages)] as [number, number],
                estimatedTokens: Math.min(20, totalPages) * averageTokensPerPage,
                description: "Focus on the first 20 pages for better results",
            })
        }

        return suggestions
    }

    /**
     * Check if automatic recovery is possible
     */
    function canAutoRecover(errorMessage: string): {
        possible: boolean
        method: "pruning" | "range_reduction" | "none"
        estimatedSuccess: number // 0-100
    } {
        const parsed = parseErrorMessage(errorMessage)

        if (parsed.type === "context_window_exceeded" || parsed.type === "token_limit_exceeded") {
            const conversationId = useConversationStore().conversationId

            if (conversationId) {
                // Check if pruning can help
                const currentTokens = messagePruning.calculateConversationTokens(conversationId)
                const threshold = messagePruning.getContextWindowThreshold()
                const availableAfterPruning = threshold * 0.7 // Leave 30% buffer

                if (currentTokens > availableAfterPruning) {
                    return {
                        possible: true,
                        method: "pruning",
                        estimatedSuccess: Math.min(90, Math.round(((threshold - availableAfterPruning) / parsed.details.requested) * 100)),
                    }
                }
            }

            // Check if range reduction can help
            if (parsed.details.requested > parsed.details.limit * 0.8) {
                return {
                    possible: true,
                    method: "range_reduction",
                    estimatedSuccess: Math.round(((parsed.details.limit * 0.8) / parsed.details.requested) * 100),
                }
            }
        }

        return {
            possible: false,
            method: "none",
            estimatedSuccess: 0,
        }
    }

    /**
     * Get recovery recommendations
     */
    function getRecoveryRecommendations(errorMessage: string): {
        immediate: string[]
        longTerm: string[]
        modelUpgrade?: {
            current: string
            recommended: string[]
            benefits: string[]
        }
    } {
        const parsed = parseErrorMessage(errorMessage)
        const capacity = pageRangeValidation.canHandleLargeFiles()

        const immediate = ["Reduce the page range to fewer pages", "Start a new conversation for a fresh context"]

        const longTerm = ["Use smaller, focused page ranges for better results", "Break large documents into logical sections", "Consider the document structure when selecting pages"]

        let modelUpgrade
        if (!capacity.supported && parsed.type !== "unknown") {
            modelUpgrade = {
                current: modelStore.current.model || "unknown",
                recommended: ["gpt-4-turbo", "claude-3-5-sonnet", "grok-4-0709"],
                benefits: ["Larger context windows (100K+ tokens)", "Better handling of complex documents", "More consistent responses for large page ranges"],
            }
        }

        return {
            immediate,
            longTerm,
            modelUpgrade,
        }
    }

    return {
        parseErrorMessage,
        generateUserFriendlyError,
        suggestOptimalPageRanges,
        canAutoRecover,
        getRecoveryRecommendations,
    }
}
