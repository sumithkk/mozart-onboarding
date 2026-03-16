import { useConversationStore } from "~/store/conversations"
import { useMessageStore } from "~/store/messages"
import { useModelStore } from "~/store/models"

export function useMessagePruning() {
    const modelStore = useModelStore()
    const conversationStore = useConversationStore()
    const messageStore = useMessageStore()

    /**
     * Calculate the total token count for a conversation
     */
    function calculateConversationTokens(): number {
        const messages = messageStore.messagesTree || {}
        let totalTokens = 0
        Object.values(messages).forEach((message: any) => {
            // Skip hidden messages in token calculation
            if (message.isVisuallyHiddenFromConversation) return

            if (message.metaData?.tokenUsage) {
                // Use the correct token property
                totalTokens += (message.metaData.tokenUsage.totalTokens || 0)
            }
        })

        return totalTokens
    }

    /**
     * Get the current model's context window threshold
     */
    function getContextWindowThreshold(): number {
        return modelStore.current.context_window || 10000
    }

    /**
     * Check if conversation is approaching context window limit
     */
    function isApproachingContextLimit(bufferPercentage: number = 0.8): boolean {
        const currentTokens = calculateConversationTokens()
        const threshold = getContextWindowThreshold()
        return currentTokens >= threshold * bufferPercentage
    }

    /**
     * Prune oldest messages to stay within context window
     * Returns the number of messages pruned
     */
    function pruneOldestMessages(targetTokens: number): number {
        const messages = messageStore.messagesTree || {}
        const messageArray = Object.values(messages)
            .filter((msg: any) => !msg.isVisuallyHiddenFromConversation)
            .sort((a: any, b: any) => a.createdAt - b.createdAt)

        let currentTokens = calculateConversationTokens()
        let prunedCount = 0

        // Start pruning from oldest messages
        for (const message of messageArray) {
            if (currentTokens <= targetTokens) break

            // Use consistent token property
            const messageTokens = (message as any).metaData?.tokenUsage?.totalTokens || 0

            if (messageTokens > 0) {
                // Update message visibility using the store action
                messageStore.updateMessageVisibility((message as any).messageId, true)
                currentTokens -= messageTokens
                prunedCount++
            }
        }

        return prunedCount
    }

    /**
     * Intelligent pruning that maintains conversation flow
     * Keeps system messages, recent messages, and important context
     */
    function intelligentPruning(requiredTokens: number): {
        prunedCount: number
        remainingTokens: number
        warningMessage?: string
    } {
        try {
            const currentTokens = calculateConversationTokens()
            const threshold = getContextWindowThreshold()
            const totalRequired = currentTokens + requiredTokens

            // Check if we need to prune (current + required exceeds threshold)
            if (totalRequired > threshold) {
                // Target 60% of threshold to leave room for new content
                const targetTokens = Math.floor(threshold * 0.6)

                const prunedCount = pruneOldestMessages(targetTokens)
                const remainingAfterPrune = calculateConversationTokens()

                return {
                    prunedCount,
                    remainingTokens: remainingAfterPrune,
                    warningMessage: `Some older messages were temporarily hidden to accommodate your request. They will be restored when you start a new conversation.`,
                }
            }

            return {
                prunedCount: 0,
                remainingTokens: threshold - totalRequired,
            }
        } catch (error) {
            console.error("Error in intelligentPruning:", error)
            return {
                prunedCount: 0,
                remainingTokens: 0,
                warningMessage: "An error occurred while managing conversation context."
            }
        }
    }

    /**
     * Check if a page range request is feasible
     */
    function validatePageRangeRequest(
        pdfTokens: number,
        documentData: Record<string, { text: string; tokens: number }>,
        pageRange: [number, number]
    ): {
        isFeasible: boolean
        estimatedTokens: number
        warningMessage?: string
        suggestedRange?: [number, number]
    } {
        // Calculate tokens for the requested page range
        const pages = Object.keys(documentData)
            .map((key) => parseInt(key, 10))
            .filter((num) => !isNaN(num))
            .sort((a, b) => a - b)

        const selectedPages = pages.filter((pageNum) => pageNum >= pageRange[0] && pageNum <= pageRange[1])

        let estimatedTokens = 0
        selectedPages.forEach((pageNum) => {
            const doc = documentData[pageNum.toString()]
            if (doc) {
                estimatedTokens += doc.tokens
            }
        })

        const threshold = getContextWindowThreshold()
        const totalRequiredTokens = calculateConversationTokens() + estimatedTokens

        if (totalRequiredTokens <= threshold) {
            return {
                isFeasible: true,
                estimatedTokens,
            }
        }

        // Calculate how many pages we can safely include
        const availableTokens = threshold - calculateConversationTokens()
        let safePageCount = 0
        let safeTokens = 0

        for (const pageNum of selectedPages) {
            const doc = documentData[pageNum.toString()]
            if (doc && safeTokens + doc.tokens <= availableTokens) {
                safeTokens += doc.tokens
                safePageCount++
            } else {
                break
            }
        }

        const suggestedRange: [number, number] = [selectedPages[0], selectedPages[safePageCount - 1] || selectedPages[0]]

        return {
            isFeasible: false,
            estimatedTokens,
            warningMessage: `The requested page range (${pageRange[0]}-${pageRange[1]}) would exceed the model's capacity. Consider using pages ${suggestedRange[0]}-${suggestedRange[1]} instead, or start a new conversation for a fresh context.`,
            suggestedRange,
        }
    }

    /**
     * Get user-friendly context window information
     */
    function getContextWindowInfo(pdfTokens: number): {
        current: number
        limit: number
        percentage: number
        isHighCapacity: boolean
    } {
        const limit = getContextWindowThreshold()
        const current = calculateConversationTokens() + pdfTokens
        const percentage = (current / limit) * 100
        const isHighCapacity = limit >= 100000

        return {
            current,
            limit,
            percentage,
            isHighCapacity,
        }
    }

    /**
     * Restore all hidden messages
     * Returns the number of messages restored
     */
    function restoreHiddenMessages(): number {
        const messages = messageStore.messagesTree || {}
        let restoredCount = 0

        Object.values(messages).forEach((message: any) => {
            if (message.isVisuallyHiddenFromConversation) {
                messageStore.updateMessageVisibility(message.messageId, false)
                restoredCount++
            }
        })

        return restoredCount
    }

    return {
        calculateConversationTokens,
        getContextWindowThreshold,
        isApproachingContextLimit,
        pruneOldestMessages,
        intelligentPruning,
        validatePageRangeRequest,
        getContextWindowInfo,
        restoreHiddenMessages,
    }
}
