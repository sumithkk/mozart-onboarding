import { computed, ref } from "vue"

import type { Router } from "vue-router"
import eventBus from "~/util/eventBus"

interface ConversationSwitchState {
    isLoading: boolean
    isTransitioning: boolean
    loadingProgress: number
    error: string | null
    previousConversationId: string | null
    targetConversationId: string | null
    previousMessages: any[]
    previousMessagesTree: Record<string, any>
    rollbackTimeout: NodeJS.Timeout | null
}

interface ConversationSwitchOptions {
    isSharedConversation?: boolean
    sharedConversationOwnerId?: string
    showLoadingIndicator?: boolean
    transitionDuration?: number
    enableRollback?: boolean
    rollbackTimeout?: number
    preserveScrollPosition?: boolean
    enableProgressTracking?: boolean
}

const defaultOptions: Required<ConversationSwitchOptions> = {
    isSharedConversation: false,
    sharedConversationOwnerId: "",
    showLoadingIndicator: true,
    transitionDuration: 300,
    enableRollback: true,
    rollbackTimeout: 10000, // 10 seconds
    preserveScrollPosition: true,
    enableProgressTracking: true,
}

export function useConversationSwitching() {
    const conversationStore = useConversationStore()
    const messageStore = useMessageStore()
    const userStore = useUserStore()
    const router = useRouter()
    const conversation = useConversation()

    // Switching state management
    const switchState = ref<ConversationSwitchState>({
        isLoading: false,
        isTransitioning: false,
        loadingProgress: 0,
        error: null,
        previousConversationId: null,
        targetConversationId: null,
        previousMessages: [],
        previousMessagesTree: {},
        rollbackTimeout: null,
    })

    // Computed properties for reactive state
    const isLoading = computed(() => switchState.value.isLoading)
    const isTransitioning = computed(() => switchState.value.isTransitioning)
    const loadingProgress = computed(() => switchState.value.loadingProgress)
    const hasError = computed(() => !!switchState.value.error)
    const errorMessage = computed(() => switchState.value.error)
    const targetConversationId = computed(() => switchState.value.targetConversationId)

    // Network connectivity check with multiple fallbacks
    const checkConnectivity = async (): Promise<boolean> => {
        try {
            // Try a lightweight API call to check connectivity
            const response = await fetch("/api/health", {
                method: "HEAD",
                signal: AbortSignal.timeout(3000), // 3 second timeout
            })
            return response.ok
        } catch (error) {
            console.warn("Primary connectivity check failed:", error)

            // Fallback: try a simple fetch to a known endpoint
            try {
                const fallbackResponse = await fetch("/api/ping", {
                    method: "GET",
                    signal: AbortSignal.timeout(2000), // 2 second timeout
                })
                return fallbackResponse.ok
            } catch (fallbackError) {
                console.warn("Fallback connectivity check failed:", fallbackError)

                // Final fallback: check if we're online
                return navigator.onLine
            }
        }
    }

    // Progress tracking helper
    const updateProgress = (progress: number) => {
        if (switchState.value.loadingProgress < progress) {
            switchState.value.loadingProgress = Math.min(100, progress)
        }
    }

    // Clear conversation data comprehensively
    const clearConversationData = () => {
        messageStore.clearConversationData()
    }

    // Preserve current state for rollback
    const preserveCurrentState = () => {
        switchState.value.previousConversationId = conversationStore.conversationId
        switchState.value.previousMessages = [...messageStore.messages]
        switchState.value.previousMessagesTree = { ...messageStore.messagesTree }
    }

    // Rollback to previous state
    const rollbackToPreviousState = async () => {
        if (!switchState.value.previousConversationId) return

        console.log("Rolling back to previous conversation state")

        try {
            // Clear conversation data and redirect to compose page
            clearConversationData()
            conversationStore.setConversationId("")

            // Redirect to compose page instead of restoring previous conversation
            await router.push("/compose")

            // eventBus.emit("showToast", {
            //     message: "Redirected to compose page due to loading failure",
            //     _type: "info",
            // })
        } catch (error) {
            console.error("Failed to redirect to compose page:", error)
            eventBus.emit("showToast", {
                message: "Failed to redirect to compose page",
                _type: "error",
            })
        }
    }

    // Clear rollback timeout
    const clearRollbackTimeout = () => {
        if (switchState.value.rollbackTimeout) {
            clearTimeout(switchState.value.rollbackTimeout)
            switchState.value.rollbackTimeout = null
        }
    }

    // Get route path based on conversation type
    const getRoutePathForType = (type: string | undefined): string => {
        switch (type) {
            case "compose":
                return "/compose"
            case "interaction":
                return "/workbench"
            default:
                return "/compose"
        }
    }

    // Enhanced conversation switching with smooth transitions
    const switchToConversation = async (conversationId: string, options: ConversationSwitchOptions = {}): Promise<boolean> => {
        const opts = { ...defaultOptions, ...options }

        // Prevent concurrent switches
        if (switchState.value.isLoading || switchState.value.isTransitioning) {
            console.warn("Conversation switch already in progress")
            return false
        }

        // Don't switch to the same conversation
        if (conversationStore.conversationId === conversationId) {
            console.log("Already on target conversation")
            return true
        }

        // Check if conversation exists in regular conversations or archived conversations
        let targetConversation = conversationStore.conversations[conversationId]
        let isArchivedConversation = false

        if (!targetConversation) {
            // Check archived conversations
            const archivedConv = conversationStore.archivedConversations.find((c: any) => c.conversationId === conversationId)
            if (archivedConv) {
                targetConversation = archivedConv
                isArchivedConversation = true
                // Temporarily add to conversations store for access during switching
                conversationStore.conversations[conversationId] = archivedConv
            }
        }

        // For file-based conversations (FS_, gd_, DOC_), we need to handle them differently
        // These are not traditional conversations but file interactions
        if (!targetConversation && (conversationId.startsWith("FS_") || conversationId.startsWith("gd_") || conversationId.startsWith("DOC_"))) {
            console.log("Switching to file-based interaction:", conversationId)

            // Clear current conversation data for clean transition
            clearConversationData()

            // Navigate directly to the workbench with the file ID
            // Encode the conversationId to handle special characters in filenames
            const router = useRouter()
            await router.push(`/workbench/${encodeURIComponent(conversationId)}`)
            return true
        }

        if (!targetConversation) {
            console.error("Target conversation not found in store")
            eventBus.emit("showToast", {
                message: "Conversation not found",
                _type: "error",
            })
            return false
        }

        try {
            // Initialize switching state
            switchState.value = {
                isLoading: true,
                isTransitioning: true,
                loadingProgress: 0,
                error: null,
                previousConversationId: conversationStore.conversationId,
                targetConversationId: conversationId,
                previousMessages: [],
                previousMessagesTree: {},
                rollbackTimeout: null,
            }

            // Preserve current state for potential rollback
            preserveCurrentState()
            updateProgress(10)

            // Check network connectivity
            if (opts.enableRollback) {
                const isConnected = await checkConnectivity()
                if (!isConnected) {
                    throw new Error("Network connection unavailable. Please check your internet connection and try again.")
                }
            }
            updateProgress(20)

            // Show loading indicator
            if (opts.showLoadingIndicator) {
                eventBus.emit("conversationSwitchStart", {
                    from: switchState.value.previousConversationId,
                    to: conversationId,
                })
            }
            updateProgress(30)

            // Set rollback timeout if enabled
            if (opts.enableRollback && opts.rollbackTimeout > 0) {
                switchState.value.rollbackTimeout = setTimeout(() => {
                    if (switchState.value.isLoading) {
                        console.warn("Conversation switch timeout, rolling back")
                        switchState.value.error = "Loading timeout exceeded"
                        rollbackToPreviousState()
                    }
                }, opts.rollbackTimeout)
            }

            // Update conversation ID in store
            await conversationStore.setConversationId(conversationId)
            updateProgress(40)

            // Clear current conversation data immediately for clean transition
            clearConversationData()
            updateProgress(45)

            // Determine target route
            const conversationType = targetConversation.metaData?.type
            const basePath = getRoutePathForType(conversationType)

            // Check if conversation has projectId to use project-based route
            let targetRoute: string
            if (targetConversation.projectId && basePath === "/compose") {
                targetRoute = `${basePath}/project/${targetConversation.projectId}/${conversationId}`
            } else {
                targetRoute = `${basePath}/${conversationId}`
            }

            // Update URL first
            await router.push(targetRoute)
            updateProgress(50)

            // Fetch new messages
            const userId = opts.isSharedConversation ? (opts.sharedConversationOwnerId === userStore.userId ? userStore.userId : opts.sharedConversationOwnerId) : (targetConversation.userId || userStore.userId)
            const messages = await conversation.getMessagesByConversationId(conversationId, userId)
            updateProgress(80)

            if (!messages) {
                throw new Error("Unable to load conversation messages. The conversation may not exist or you may not have permission to access it.")
            }

            // Clear rollback timeout since we succeeded
            clearRollbackTimeout()

            // Update messages after successful load
            messageStore.setMessageTree(messages)
            updateProgress(95)

            // Emit success event
            eventBus.emit("conversationSwitchSuccess", {
                conversationId,
                messagesCount: Array.isArray(messages) ? messages.length : Object.keys(messages).length,
            })

            // Complete transition with delay for smooth UX
            setTimeout(() => {
                switchState.value.isTransitioning = false
                switchState.value.loadingProgress = 100

                setTimeout(() => {
                    switchState.value.isLoading = false
                    switchState.value.loadingProgress = 0
                }, opts.transitionDuration)
            }, 100)

            return true
        } catch (error: any) {
            console.error("Conversation switch failed:", error)

            // Clear rollback timeout
            clearRollbackTimeout()

            // Set error state
            switchState.value.error = error.message || "Failed to switch conversation"

            // Show toast alert for failure
            eventBus.emit("showToast", {
                message: "Failed to switch conversation",
                _type: "error",
            })

            // Attempt rollback if enabled
            if (opts.enableRollback) {
                await rollbackToPreviousState()
            }

            // Emit error event
            eventBus.emit("conversationSwitchError", {
                conversationId,
                error: error.message,
                rolledBack: opts.enableRollback,
            })

            // Reset loading states
            switchState.value.isLoading = false
            switchState.value.isTransitioning = false
            switchState.value.loadingProgress = 0

            return false
        }
    }

    // Quick switch without full loading (for recently accessed conversations)
    const quickSwitchToConversation = async (conversationId: string): Promise<boolean> => {
        // Check if messages are already cached
        const cachedMessages = messageStore.messagesTree
        const hasCachedData = Object.keys(cachedMessages).length > 0 && Object.values(cachedMessages).some((msg: any) => msg.conversationId === conversationId)

        if (hasCachedData) {
            // Instant switch for cached conversations
            await conversationStore.setConversationId(conversationId)

            // Clear current conversation data for clean transition
            clearConversationData()

            const conversation = conversationStore.conversations[conversationId]
            const conversationType = conversation.metaData?.type
            const basePath = getRoutePathForType(conversationType)

            // Check if conversation has projectId to use project-based route
            let targetRoute: string
            if (conversation.projectId && basePath === "/compose") {
                targetRoute = `${basePath}/project/${conversation.projectId}/${conversationId}`
            } else {
                targetRoute = `${basePath}/${conversationId}`
            }
            await router.push(targetRoute)

            return true
        }

        // Fallback to full switch
        return switchToConversation(conversationId, { transitionDuration: 150 })
    }

    // Cancel current switching operation
    const cancelSwitch = () => {
        if (!switchState.value.isLoading) return

        clearRollbackTimeout()

        // Reset to previous state if possible
        if (switchState.value.previousConversationId) {
            rollbackToPreviousState()
        }

        // Reset switching state
        switchState.value.isLoading = false
        switchState.value.isTransitioning = false
        switchState.value.loadingProgress = 0
        switchState.value.error = null

        eventBus.emit("conversationSwitchCancelled", {})
    }

    // Retry failed switch with exponential backoff
    const retrySwitch = async (maxRetries: number = 3): Promise<boolean> => {
        if (!switchState.value.targetConversationId) return false

        const targetId = switchState.value.targetConversationId
        switchState.value.error = null

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Retry attempt ${attempt}/${maxRetries} for conversation ${targetId}`)

                // Add exponential backoff delay (except for first attempt)
                if (attempt > 1) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 2), 5000) // Max 5 seconds
                    await new Promise((resolve) => setTimeout(resolve, delay))
                }

                const success = await switchToConversation(targetId, {
                    showLoadingIndicator: true,
                    enableRollback: true,
                    rollbackTimeout: 15000, // Longer timeout for retries
                })

                if (success) {
                    console.log(`Successfully switched to conversation ${targetId} on attempt ${attempt}`)
                    return true
                }
            } catch (error: any) {
                console.warn(`Retry attempt ${attempt} failed:`, error.message)

                if (attempt === maxRetries) {
                    switchState.value.error = `Failed to switch conversation after ${maxRetries} attempts. ${error.message}`
                    return false
                }
            }
        }

        return false
    }

    // Cleanup function
    const cleanup = () => {
        clearRollbackTimeout()
        switchState.value.isLoading = false
        switchState.value.isTransitioning = false
    }

    return {
        // State
        isLoading,
        isTransitioning,
        loadingProgress,
        hasError,
        errorMessage,
        targetConversationId,

        // Actions
        switchToConversation,
        quickSwitchToConversation,
        cancelSwitch,
        retrySwitch,
        cleanup,
        clearConversationData,
    }
}
