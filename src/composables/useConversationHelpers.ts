import { computed, ref } from "vue"

import { useConversationSwitching } from "./useConversationSwitching"

/**
 * Helper composable that provides utility functions for conversation management
 * and integrates with the enhanced conversation switching system
 */
export function useConversationHelpers() {
    const conversationSwitching = useConversationSwitching()
    const conversationStore = useConversationStore()
    const messageStore = useMessageStore()

    // Recently accessed conversations for quick switching
    const recentConversations = ref<string[]>([])
    const maxRecentConversations = 5

    // Track conversation switching statistics
    const switchingStats = ref({
        successfulSwitches: 0,
        failedSwitches: 0,
        averageSwitchTime: 0,
        totalSwitchTime: 0,
    })

    // Check if conversation has cached messages (for instant switching)
    const hasConversationCached = (conversationId: string): boolean => {
        const messages = messageStore.messagesTree
        return Object.keys(messages).length > 0 && Object.values(messages).some((msg) => msg.conversationId === conversationId)
    }

    // Get conversation type for routing
    const getConversationType = (conversationId: string): string | undefined => {
        return conversationStore.conversations[conversationId]?.metaData?.type
    }

    // Smart conversation switching that chooses the best method
    const smartSwitchToConversation = async (conversationId: string): Promise<boolean> => {
        const startTime = Date.now()

        try {
            let success = false

            // Use quick switch for cached conversations
            if (hasConversationCached(conversationId)) {
                success = await conversationSwitching.quickSwitchToConversation(conversationId)
            } else {
                // Use full switch for non-cached conversations
                success = await conversationSwitching.switchToConversation(conversationId)
            }

            // Update statistics
            const switchTime = Date.now() - startTime
            switchingStats.value.totalSwitchTime += switchTime

            if (success) {
                switchingStats.value.successfulSwitches++
                addToRecentConversations(conversationId)

                // Calculate new average
                switchingStats.value.averageSwitchTime = switchingStats.value.totalSwitchTime / switchingStats.value.successfulSwitches
            } else {
                switchingStats.value.failedSwitches++
            }

            return success
        } catch (error) {
            switchingStats.value.failedSwitches++
            console.error("Smart conversation switch failed:", error)
            return false
        }
    }

    // Add conversation to recent list
    const addToRecentConversations = (conversationId: string) => {
        // Remove if already exists
        const filtered = recentConversations.value.filter((id) => id !== conversationId)

        // Add to beginning
        recentConversations.value = [conversationId, ...filtered].slice(0, maxRecentConversations)
    }

    // Get recent conversations with metadata
    const getRecentConversationsWithMetadata = computed(() => {
        return recentConversations.value
            .map((id) => ({
                id,
                conversation: conversationStore.conversations[id],
                cached: hasConversationCached(id),
            }))
            .filter((item) => item.conversation) // Only include conversations that still exist
    })

    // Batch switch multiple conversations (preload them)
    const batchSwitchConversations = async (
        conversationIds: string[]
    ): Promise<{
        successful: string[]
        failed: string[]
    }> => {
        const results = {
            successful: [] as string[],
            failed: [] as string[],
        }

        // Switch conversations with small delays to prevent overwhelming the system
        for (const id of conversationIds) {
            try {
                const success = await smartSwitchToConversation(id)
                if (success) {
                    results.successful.push(id)
                } else {
                    results.failed.push(id)
                }

                // Small delay between switches
                await new Promise((resolve) => setTimeout(resolve, 100))
            } catch (error) {
                results.failed.push(id)
            }
        }

        return results
    }

    // Check conversation switching health
    const getSwitchingHealthStatus = computed(() => {
        const total = switchingStats.value.successfulSwitches + switchingStats.value.failedSwitches
        if (total === 0) return { status: "unknown", successRate: 0, avgTime: 0 }

        const successRate = (switchingStats.value.successfulSwitches / total) * 100
        const avgTime = switchingStats.value.averageSwitchTime

        let status = "good"
        if (successRate < 80 || avgTime > 2000) {
            status = "poor"
        } else if (successRate < 90 || avgTime > 1000) {
            status = "fair"
        }

        return {
            status,
            successRate: Math.round(successRate),
            avgTime: Math.round(avgTime),
        }
    })

    // Reset switching statistics
    const resetSwitchingStats = () => {
        switchingStats.value = {
            successfulSwitches: 0,
            failedSwitches: 0,
            averageSwitchTime: 0,
            totalSwitchTime: 0,
        }
    }

    // Clear recent conversations
    const clearRecentConversations = () => {
        recentConversations.value = []
    }

    // Get conversation switching state
    const switchingState = computed(() => ({
        isLoading: conversationSwitching.isLoading.value,
        isTransitioning: conversationSwitching.isTransitioning.value,
        loadingProgress: conversationSwitching.loadingProgress.value,
        hasError: conversationSwitching.hasError.value,
        errorMessage: conversationSwitching.errorMessage.value,
    }))

    // Validate conversation before switching
    const validateConversationForSwitch = (
        conversationId: string
    ): {
        valid: boolean
        reason?: string
    } => {
        // Check if conversation exists
        if (!conversationStore.conversations[conversationId]) {
            return {
                valid: false,
                reason: "Conversation not found",
            }
        }

        // Check if already on this conversation
        if (conversationStore.conversationId === conversationId) {
            return {
                valid: false,
                reason: "Already on this conversation",
            }
        }

        // Check if switching is currently in progress
        if (conversationSwitching.isLoading.value) {
            return {
                valid: false,
                reason: "Another conversation switch is in progress",
            }
        }

        return { valid: true }
    }

    return {
        // State
        recentConversations,
        switchingStats,
        switchingState,

        // Computed
        getRecentConversationsWithMetadata,
        getSwitchingHealthStatus,

        // Actions
        smartSwitchToConversation,
        batchSwitchConversations,
        hasConversationCached,
        getConversationType,
        addToRecentConversations,
        clearRecentConversations,
        resetSwitchingStats,
        validateConversationForSwitch,

        // Direct access to switching composable
        ...conversationSwitching,
    }
}
