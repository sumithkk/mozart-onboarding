// TODO: IMessages are also in conversation store, will move them to a separate store
import { defineStore } from "pinia"

export const useMessageStore = defineStore("messages", {
    state: (): any => ({
        messages: [],
        messagesTree: {},
        isProcessing: false,
        isLoading: false,
        isChatLoading: true,
        // Error state to track fetch failures
        fetchError: null as string | null,
        // Retry count for failed fetches
        fetchRetryCount: 0,
    }),
    actions: {
        // ---------------------- FETCHING METHODS ----------------------
        async fetchMessages(conversationId: string, userId?: string, options: { preserveCurrentMessages?: boolean, timeout?: number, maxRetries?: number } = {}) {
            this.isChatLoading = true

            this.fetchError = null
            const timeout = options.timeout || 30000
            const maxRetries = options.maxRetries || 2


            if (!userId) userId = useUserStore().userId
            const conversation = useConversation()

            // Store current messages if preservation is requested (for conversation switching)
            const previousMessages = options.preserveCurrentMessages ? { ...this.messagesTree } : {}

            // Create timeout promise to prevent indefinite hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Message fetch timeout after ${timeout}ms`))
                }, timeout)
            })

            try {
                // Race between fetch and timeout
                const messages: any = await Promise.race([
                    conversation.getMessagesByConversationId(conversationId, userId),
                    timeoutPromise
                ])

                if (messages === false) {
                    // Restore previous messages if fetch failed and we were preserving them
                    if (options.preserveCurrentMessages && Object.keys(previousMessages).length > 0) {
                        this.messagesTree = previousMessages
                        console.log("Restored previous messages after fetch failure")
                    }
                    // Set error state for UI feedback
                    this.fetchError = "Failed to fetch messages"
                    this.isChatLoading = false
                    // Log error for debugging
                    console.error("Failed to fetch messages", { conversationId, userId })
                    return false
                }

                // Validate messages structure before using
                if (messages && typeof messages === 'object' && !Array.isArray(messages)) {
                    // Only set message tree if we got messages back
                    // For new conversations, empty object means preserve existing messages (user message already added)
                    if (Object.keys(messages).length > 0) {
                        this.setMessageTree(messages)
                        // Reset retry count on success
                        this.fetchRetryCount = 0
                    } else {
                        // Log when we get empty messages (might indicate incomplete fetch)
                        console.warn("Received empty messages object", { conversationId })
                    }
                } else {
                    // Handle invalid message structure
                    console.error("Invalid messages structure received", { messages, conversationId })
                    this.fetchError = "Invalid message data received"
                }

                // FIX: Always reset loading state, even if messages is empty
                this.isChatLoading = false
                return messages

            } catch (error: any) {
                // Handle timeout and network errors
                console.error("Error fetching messages:", error)

                // Retry logic for transient failures
                if (this.fetchRetryCount < maxRetries && error.message?.includes("timeout")) {
                    this.fetchRetryCount++
                    console.log(`Retrying message fetch (attempt ${this.fetchRetryCount}/${maxRetries})`)

                    // Exponential backoff (wait 1s, 2s, 4s...)
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, this.fetchRetryCount - 1)))

                    // Retry the fetch
                    return this.fetchMessages(conversationId, userId, { ...options, timeout, maxRetries })
                }

                // Set user-friendly error message
                if (error.message?.includes("timeout")) {
                    this.fetchError = "Loading took too long. Please try refreshing."
                } else {
                    this.fetchError = "Failed to load conversation. Please try again."
                }

                // Restore previous messages if fetch failed and we were preserving them
                if (options.preserveCurrentMessages && Object.keys(previousMessages).length > 0) {
                    this.messagesTree = previousMessages
                    console.log("Restored previous messages after fetch failure")
                }

                // FIX: Always reset loading state on error
                this.isChatLoading = false

                // Log error details for debugging
                console.error("Failed to fetch messages after retries", {
                    conversationId,
                    userId,
                    error: error.message,
                    retryCount: this.fetchRetryCount
                })

                return false
            }
        },
        // ---------------------- LOGICAL METHODS ----------------------
        addMessage(message: any) {
            const currentNode = useConversationStore().currentNode
            if (!currentNode) console.log("No current node found", "addMessage")

            // Check if message already exists
            const existingMessage = this.messagesTree[message.messageId]
            if (existingMessage) {
                // Update existing message instead of replacing
                this.messagesTree[message.messageId] = {
                    ...existingMessage,
                    ...message,
                    // Preserve children array if it exists
                    children: message.children || existingMessage.children || []
                }
            } else {
                // Add new message
                this.messagesTree[message.messageId] = message
            }

            // Update parent's children array if needed
            if (message.parentId) {
                try {
                    const parentMessage = this.messagesTree[message.parentId]
                    if (parentMessage) {
                        if (!parentMessage.children?.includes(message.messageId)) {
                            if (!parentMessage.children) parentMessage.children = []
                            parentMessage.children.push(message.messageId)
                        }
                    }
                } catch (error) {
                    console.error("An error occurred while adding the message:", error)
                }
            }

            // Render once at the end to avoid flickering
            this.messages = newMessagesRenderMethod(this.messagesTree, currentNode)
        },
        setMessageTree(messages: Record<string, any>) {
            // Guard against null/undefined messages
            if (!messages || typeof messages !== 'object' || Array.isArray(messages)) {
                console.warn("Invalid messages passed to setMessageTree", messages)
                return
            }

            const conversationStore = useConversationStore()
            const currentNode = conversationStore.conversations[conversationStore.conversationId]?.currentNode as string
            // console.log(currentNode)
            if (!currentNode) console.log("No current node found", "setMessageTree")
            const messageTree = setMessageTreeWithChecks(messages, this.messagesTree)
            this.messagesTree = messageTree
            this.messages = newMessagesRenderMethod(messageTree, currentNode)
        },
        reRenderMessageTree() {
            const currentNode = useConversationStore().currentNode
            if (!currentNode) console.log("No current node found", "reRenderMessageTree")
            this.messages = newMessagesRenderMethod(this.messagesTree, currentNode)
        },
        switchMessagesTree(fromMessageId: string, toMessageId: string) {
            this.messages = switchChildMessageTree(this.messagesTree, this.messages, fromMessageId, toMessageId)
        },
        setMessageExpanded(messageId: string, expanded: boolean) {
            this.messagesTree[messageId].metaData.expanded = expanded
        },
        updateMessageVisibility(messageId: string, isHidden: boolean) {
            if (!this.messagesTree) return;
            const message = this.messagesTree[messageId]
            if (message) {
                message.isVisuallyHiddenFromConversation = isHidden
                // Trigger re-render to update the UI
                this.reRenderMessageTree()
            }
        },
        flushData() {
            this.messages = []
            this.messagesTree = {}
            this.isProcessing = false
            this.isLoading = false
            this.isChatLoading = true
            return true
        },
        clearConversationData() {
            this.messages = []
            this.messagesTree = {}
            this.isProcessing = false
            this.isLoading = false
        },
    },
})

function newMessagesRenderMethod(messages: Record<string, any>, currentNode: string) {
    const renderedMessages = []
    let currentMessage: any = messages[currentNode]
    while (currentMessage) {
        // Skip messages that are visually hidden
        if (!currentMessage.isVisuallyHiddenFromConversation) {
            if (currentMessage.parentId && messages[currentMessage.parentId]) {
                if (!messages[currentMessage.parentId].children) messages[currentMessage.parentId].children = []
                renderedMessages.push({ ...messages[currentMessage.messageId], siblings: messages[currentMessage.parentId].children })
            } else {
                // This is the root message (no parent), add it and stop
                renderedMessages.push({ ...messages[currentMessage.messageId], siblings: [] })
            }
        }

        // Move to parent message
        if (currentMessage.parentId && messages[currentMessage.parentId]) {
            currentMessage = messages[currentMessage.parentId]
        } else {
            currentMessage = null
        }
    }
    renderedMessages.reverse()
    return renderedMessages
}
function setMessageTreeWithChecks(newMessagesTree: Record<string, any>, oldMessagesTree: Record<string, any>) {
    // Handle null/undefined newMessagesTree
    if (!newMessagesTree || typeof newMessagesTree !== 'object') {
        return oldMessagesTree
    }

    // If old tree is empty, return new tree
    if (!oldMessagesTree || Object.keys(oldMessagesTree).length === 0) {
        return newMessagesTree
    }

    // If new tree is empty, return old tree (user message is already there)
    const newKeys = Object.keys(newMessagesTree)
    if (newKeys.length === 0) {
        return oldMessagesTree
    }

    // Check if conversations match
    const newConversationId = newMessagesTree[newKeys[0]]?.conversationId
    const oldKeys = Object.keys(oldMessagesTree)
    const oldConversationId = oldMessagesTree[oldKeys[0]]?.conversationId

    if (!newConversationId || !oldConversationId || newConversationId !== oldConversationId) {
        return newMessagesTree
    }

    // Merge new messages into old tree
    Object.entries(newMessagesTree).forEach(([messageId, message]) => {
        if (!oldMessagesTree[messageId]) {
            oldMessagesTree[messageId] = message
        }
    })

    return oldMessagesTree
}
function switchChildMessageTree(messages: Record<string, any>, OldMessageArray: Array<any>, fromMessageId: string, toMessageId: string) {
    const ChildMessagesArray = []
    console.log(toMessageId, messages[toMessageId])
    const messageParentId = messages[toMessageId].parentId
    let message: any = messages[toMessageId]
    ChildMessagesArray.push({ ...message, siblings: messageParentId && messages[messageParentId].children })
    while (message) {
        if (message.children && message.children.length > 0) {
            message = messages[message.children[message.children.length - 1]]
            ChildMessagesArray.push({ ...message, siblings: messages[message.parentId].children })
        } else {
            message = null
        }
    }
    const parentMessagesArray = OldMessageArray.slice(
        0,
        OldMessageArray.findIndex((message) => message.messageId === fromMessageId)
    )
    return [...parentMessagesArray, ...ChildMessagesArray]
}
