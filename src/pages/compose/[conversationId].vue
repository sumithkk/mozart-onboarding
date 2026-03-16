<template>
    <div class="relative flex h-full w-full flex-col">
        <!-- Conversation Sharing Popup -->
        <ShareConversationPopup :show="conversationStore.triggerShareConversation" @update:show="handleUpdateShow" :module="'conversation'" />

        <!-- Main content container with proper flex layout -->
        <div class="flex h-full w-full flex-col" :class="{ 'pb-32': isMobile }">
            <!-- CHAT SECTION - Takes up all available space -->
            <!-- Shared container -->
            <div class="flex-1 overflow-hidden">
                <!-- Error UI when conversation not found -->
                <div v-if="conversationNotFound" class="flex h-full items-center justify-center p-4 sm:p-8">
                    <div class="mx-auto w-full max-w-md">
                        <div class="text-textColor bg-card border-strokeColor flex flex-col items-center justify-center rounded-lg border p-8 shadow-sm">
                            <div class="materialSymbolsOutlined mb-4 text-6xl text-textColorSecondary opacity-60">search_off</div>
                            <h2 class="text-textColor mb-3 text-2xl font-semibold">Conversation Not Found</h2>
                            <p class="text-textColorSecondary mb-6 text-center text-sm leading-relaxed">
                                {{ conversationError || "The conversation you're looking for doesn't exist or you don't have access to it." }}
                            </p>
                            <div v-if="retryCount >= maxRetries" class="text-textColorSecondary mb-4 text-center text-xs">
                                Maximum retry attempts reached. Please check the conversation ID or go back to compose.
                            </div>
                            <div class="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                                <button 
                                    @click="goToCompose" 
                                    :disabled="isRetrying"
                                    class="bg-logoColor hover:bg-mozart-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-logoColor focus:ring-offset-2"
                                >
                                    <span class="materialSymbolsOutlined text-base">arrow_back</span>
                                    Go to Compose
                                </button>
                                <button 
                                    @click="retryLoadConversation" 
                                    :disabled="isRetrying || retryCount >= maxRetries"
                                    class="border-strokeColor bg-card hover:bg-surfaceColor disabled:opacity-50 disabled:cursor-not-allowed text-textColor flex items-center justify-center gap-2 rounded-md border px-6 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-strokeColor focus:ring-offset-2"
                                >
                                    <span v-if="isRetrying" class="materialSymbolsOutlined animate-spin text-base">refresh</span>
                                    <span v-else class="materialSymbolsOutlined text-base">refresh</span>
                                    {{ isRetrying ? 'Retrying...' : 'Retry' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Show chat only if conversation exists -->
                <Chat v-else ref="chatRef" :fileAttachmentsAvailable="fileAttachmentsAvailable" :inputExpanded="inputExpanded" @updateScrollButton="updateScrollButton" />
            </div>

            <!-- Sticky/Fixed Composer -->
            <div :class="isMobile ? 'fixed right-0 bottom-0 left-0 z-20 w-full bg-transparent shadow-lg' : 'sticky bottom-0'" style="padding-bottom: env(safe-area-inset-bottom)">
                <div class="mx-auto mb-4 w-full max-w-screen-md px-2 lg:mb-12" :class="{ 'pb-4': isMobile }">
                    <!-- Archived Conversation Banner -->
                    <div v-if="isArchivedConversation" class="mb-4 flex items-center justify-between rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 text-yellow-800 shadow dark:bg-yellow-900/20 dark:text-yellow-300">
                        <div class="flex items-center gap-3">
                            <span class="materialSymbolsOutlined text-xl">archive</span>
                            <div>
                                <strong class="font-semibold">Archived Conversation</strong>
                                <p class="mt-1 text-sm">This conversation is archived. Restore it to continue the conversation.</p>
                            </div>
                        </div>
                        <button @click="handleRestoreConversation" class="ml-4 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600">
                            Restore
                        </button>
                    </div>

                    <AIChatInput v-if="!isArchivedConversation" :placeholderValue="placeholderValue" :showDataMode="true" :showScrollButton="showScrollButton" @onInputSubmit="onInputSubmit" @updateFileAttachments="updateFileAttachments" @updateInputExpanded="updateInputExpanded" @scrollToBottom="handleScrollToBottom" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { inject, computed, type ComputedRef } from "vue"
    import useCompletion from "~/composables/useCompletion"
    import useUser from "~/composables/useUser"
    import { getPlaceHolder } from "~/util/staticData"
    import socketService from "../../services/socketService"

    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    // -------------------| isMobile |-------------------
    const isMobile = inject<ComputedRef<boolean>>("isMobile")

    // -------------------| Router |-------------------
    const router = useRouter()

    // -------------------| Refs |-------------------
    const placeholderValue = ref("Enter message for Mozart...")
    const fileAttachmentsAvailable = ref(false)

    // Add state for input expansion
    const inputExpanded = ref(false)
    const showScrollButton = ref(false)
    const chatRef = ref()
    
    // Error state for invalid conversation
    const conversationNotFound = ref(false)
    const conversationError = ref<string | null>(null)
    const isRetrying = ref(false)
    const retryCount = ref(0)
    const maxRetries = 3

    // -------------------| Store & State |-------------------
    const conversationStore = useConversationStore()
    const messageStore = useMessageStore()
    const userStore = useUserStore()
    const ragStore = useRagStore()
    const modelStore = useModelStore()

    // -------------------| Runtime Config |-------------------
    const config = useRuntimeConfig()

    // -------------------| Composable |-------------------
    const rag = useRag()

    // -------------------| Page Meta |-------------------
    useHead({
        title: (conversationStore.conversationId && conversationStore.conversations[conversationStore.conversationId]?.title) || "Compose",
    })

    // -------------------| Computed Properties |-------------------
    const isArchivedConversation = computed(() => {
        const convId = conversationStore.conversationId
        if (!convId) return false
        
        // Check in regular conversations
        const conv = conversationStore.conversations[convId]
        if (conv && conv.isArchived) return true
        
        // Check in archived conversations
        return conversationStore.archivedConversations.some((c: any) => c.conversationId === convId)
    })

    // -------------------| Functions |-------------------
    const getRAGResponse = async (data: any, collectionName: string) => {
        try {
            ragStore.isProcessing = true
            const response = await rag.ragCompose(data, collectionName)
            return response
        } catch (error) {
            console.error(error)
            return null
        } finally {
            ragStore.isProcessing = false
        }
    }
    const onInputSubmit = async (data: any, documents: any) => {
        const collectionName = ragStore.currentCollection
        const service = ragStore.currentQdrantInstance

        if (documents && documents.length > 0) {
            let UploadedFiles = []
            for (const document of documents) {
                if (document.source === "google-drive") {
                    UploadedFiles.push({
                        documentId: document.id,
                        fileName: document.name,
                        fileSize: document.size || document.sizeBytes,
                        fileType: document.mimeType,
                        url: `https://drive.google.com/uc?id=${document.id}&export=download`,
                        source: { name: "Google Drive", id: "google-drive" },
                    })
                } else {
                    const uploadData = await useUser().uploadFile(document, false)
                    if (uploadData) UploadedFiles.push(uploadData)
                }
            }
            if (ragStore.isDataMode) {
                const response = await getRAGResponse(data, collectionName)
                const userId = conversationStore.conversations[conversationStore.conversationId]?.userId || userStore.userId
                await useCompletion().completions(data, null, null, UploadedFiles, response, userId, collectionName)
            } else {
                const userId = conversationStore.conversations[conversationStore.conversationId]?.userId || userStore.userId
                await useCompletion().completions(data, null, null, UploadedFiles, null, userId)
            }
        } else {
            if (ragStore.isDataMode) {
                const response = await getRAGResponse(data, collectionName)
                const userId = conversationStore.conversations[conversationStore.conversationId]?.userId || userStore.userId
                await useCompletion().completions(data, null, null, null, response, userId, collectionName)
            } else {
                const userId = conversationStore.conversations[conversationStore.conversationId]?.userId || userStore.userId
                await useCompletion().completions(data, null, null, null, null, userId)
            }
        }
    }

    function handleUpdateShow(value: boolean) {
        if (!value) {
            conversationStore.triggerShareConversation = false
        }
    }

    function updateFileAttachments(value: boolean) {
        fileAttachmentsAvailable.value = value
    }

    // Add method to handle input expansion updates
    const updateInputExpanded = (expanded: boolean) => {
        inputExpanded.value = expanded
    }

    // Add method to handle scroll button updates
    const updateScrollButton = (show: boolean) => {
        showScrollButton.value = show
    }

    // Add method to handle scroll to bottom
    const handleScrollToBottom = (forceSmooth: boolean) => {
        // Call the scroll method on the Chat component
        if (chatRef.value) {
            chatRef.value.scrollToBottom(forceSmooth)
        }
    }

    // Handle restore conversation
    const handleRestoreConversation = async () => {
        const convId = conversationStore.conversationId
        if (!convId) return
        
        try {
            const conversationSvc = useConversation()
            await conversationSvc.restoreConversation(convId)
            
            // Refresh conversations to update the UI
            await conversationStore.fetchConversations(true)
        } catch (error) {
            console.error("Failed to restore conversation:", error)
        }
    }

    // Navigate to compose page
    const goToCompose = () => {
        router.push("/compose")
    }

    // Retry loading conversation
    const retryLoadConversation = async () => {
        // Prevent multiple simultaneous retries
        if (isRetrying.value || retryCount.value >= maxRetries) {
            return
        }
        
        isRetrying.value = true
        retryCount.value++
        conversationNotFound.value = false
        conversationError.value = null
        
        try {
            const conversationId = router.currentRoute.value.params.conversationId as string
            if (!conversationId) {
                conversationNotFound.value = true
                conversationError.value = "Invalid conversation ID."
                return
            }
            
            const loaded = await loadConversation(conversationId)
            
            // If successfully loaded, continue with initialization
            if (loaded && conversationStore.conversations[conversationId]) {
                // Reset retry count on success
                retryCount.value = 0
                conversationNotFound.value = false
                
                // Continue with the rest of the initialization
                const conversation = conversationStore.conversations[conversationId]
                const currentPath = router.currentRoute.value.fullPath
                
                // Set conversationId if not already set
                if (!conversationStore.conversationId) {
                    conversationStore.conversationId = conversationId
                }
                
                updateCurrentModel(conversationId)
                
                // Handle routing if needed
                const conversationType = conversation.metaData?.type
                if (conversation.projectId && !currentPath.includes(`/project/${conversation.projectId}/`)) {
                    router.push(`/compose/project/${conversation.projectId}/${conversationId}`)
                    return
                }
                
                if (conversationType === "interaction") {
                    if (!currentPath.includes("workbench")) {
                        router.push(`/workbench/${conversationId}`)
                        return
                    }
                } else {
                    if (!currentPath.includes("compose")) {
                        router.push(`/compose/${conversationId}`)
                        return
                    }
                }
                
                // Fetch messages if needed
                const hasExistingMessages = messageStore.messagesTree && Object.keys(messageStore.messagesTree).length > 0 && Object.values(messageStore.messagesTree).some((msg: any) => msg.conversationId === conversationId)
                if (!hasExistingMessages) {
                    const userId = conversation.userId || userStore.userId
                    if (userId) {
                        await messageStore.fetchMessages(conversationId, userId)
                    }
                } else {
                    messageStore.reRenderMessageTree()
                }
                
                // Handle shared conversations
                if (conversation?.isShared) {
                    setTimeout(async () => {
                        try {
                            await socketService.connectSocket(config.public.apiUrl)
                            socketService.joinConversation({
                                chatId: conversationId as string,
                                user: {
                                    userId: userStore.userId as string,
                                    name: userStore.firstName as string,
                                },
                            })
                        } catch (error) {
                            console.error("Failed to connect socket:", error)
                        }
                    }, 1000)
                    useConversation().getCollaborators(conversationStore.conversationId)
                }
            } else if (retryCount.value >= maxRetries) {
                conversationNotFound.value = true
                conversationError.value = "Unable to load conversation after multiple attempts. Please verify the conversation ID or go back to compose."
            } else {
                conversationNotFound.value = true
            }
        } catch (error: any) {
            console.error("Error during retry:", error)
            conversationNotFound.value = true
            if (retryCount.value >= maxRetries) {
                conversationError.value = "Maximum retry attempts reached. Please check the conversation ID or go back to compose."
            } else {
                conversationError.value = error.message || "Failed to load conversation. Please try again."
            }
        } finally {
            isRetrying.value = false
        }
    }

    // Load conversation with error handling
    const loadConversation = async (conversationId: string) => {
        try {
            conversationNotFound.value = false
            conversationError.value = null
            
            // Fetch conversations if not already loaded
            if (Object.keys(conversationStore.conversations).length === 0) {
                await conversationStore.fetchConversations()
            }
            
            // Check if conversation exists
            if (!conversationStore.conversations[conversationId]) {
                // Try to fetch it directly (might be a shared conversation or not in list)
                const conversationSvc = useConversation()
                
                // Add timeout to prevent hanging
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("Request timeout")), 10000) // 10 second timeout
                })
                
                try {
                    // Try to get messages - if it fails, conversation doesn't exist
                    const messages = await Promise.race([
                        conversationSvc.getMessagesByConversationId(conversationId, userStore.userId),
                        timeoutPromise
                    ]) as any
                    
                    if (messages === false || !messages) {
                        // Conversation doesn't exist
                        conversationNotFound.value = true
                        conversationError.value = "This conversation doesn't exist or you don't have permission to access it."
                        conversationStore.conversationId = ""
                        return false
                    }
                    
                    // If we got here, conversation exists but wasn't in the list
                    // Set conversationId so it can be used
                    conversationStore.conversationId = conversationId
                } catch (fetchError: any) {
                    // Handle timeout or network errors
                    if (fetchError.message === "Request timeout" || fetchError.message?.includes("Network Error")) {
                        conversationNotFound.value = true
                        conversationError.value = "Connection timeout. Please check your network connection and try again."
                        return false
                    }
                    throw fetchError
                }
            }
            
            return true
        } catch (error: any) {
            console.error("Error loading conversation:", error)
            conversationNotFound.value = true
            
            // Better error messages based on error type
            if (error.message?.includes("timeout") || error.message?.includes("Network Error")) {
                conversationError.value = "Network error. Please check your connection and try again."
            } else {
                conversationError.value = error.message || "Failed to load conversation. Please try again."
            }
            
            return false
        }
    }

    function updateCurrentModel(conversationId: string, conversations = conversationStore.conversations) {
        if (conversationStore.creatingNewConversation) {
            conversationStore.updateCreatingNewConversation(false)
            return
        }
        const conversation = conversations[conversationId] || {}
        const modelName = conversation?.modelName || "claude-3-7-sonnet-20250219"
        const selectedModel = modelStore.models.find((model: any) => model.model === modelName)
        if (selectedModel) {
            modelStore.setCurrent(selectedModel)
        }
    }

    // -------------------| Watchers |-------------------
    watch(
        () => isMobile?.value,
        (newVal) => {
            placeholderValue.value = getPlaceHolder(newVal || false)
        }
    )

    watch(
        () => conversationStore.conversations,
        (newVal) => {
            updateCurrentModel(conversationStore.conversationId, newVal)
        }
    )

    // -------------------| Lifecycle Hooks |-------------------
    onMounted(async () => {
        try {
            const conversationId = router.currentRoute.value.params.conversationId as string
            const currentPath = router.currentRoute.value.fullPath

            // Validate conversation ID format
            if (!conversationId || conversationId === "undefined" || conversationId.startsWith("DOC_")) {
                router.push("/compose")
                return
            }

            // Load conversation with error handling
            const conversationLoaded = await loadConversation(conversationId)
            if (!conversationLoaded) {
                // Error UI will be shown by conversationNotFound state
                // Reset retry count on initial load failure
                retryCount.value = 0
                return
            }

        // Collections are already loaded by layout, no need to call again
        await conversationStore.fetchConversations()
        updateCurrentModel(conversationId)

            // Check if conversation exists after loading
            if (!conversationStore.conversations[conversationId]) {
                conversationNotFound.value = true
                conversationError.value = "Conversation not found. It may have been deleted or you don't have access to it."
                return
            }

            // Set conversationId if not already set
            if (!conversationStore.conversationId) {
                conversationStore.conversationId = conversationId
            }

                const conversation = conversationStore.conversations[conversationId]
            if (!conversation) {
                conversationNotFound.value = true
                conversationError.value = "Conversation not found."
                return
            }

            const conversationType = conversation.metaData?.type
                
                // If conversation has projectId, redirect to project-based route
                if (conversation.projectId && !currentPath.includes(`/project/${conversation.projectId}/`)) {
                    router.push(`/compose/project/${conversation.projectId}/${conversationId}`)
                    return
                }
                
                if (conversationType === "interaction") {
                    if (!currentPath.includes("workbench")) router.push(`/workbench/${conversationId}`)
                } else {
                    if (!currentPath.includes("compose")) router.push(`/compose/${conversationId}`)
                }
                
                // Only fetch messages if there are no messages in the tree yet
                // For brand new conversations created on frontend, messages are already added
                const hasExistingMessages = messageStore.messagesTree && Object.keys(messageStore.messagesTree).length > 0 && Object.values(messageStore.messagesTree).some((msg: any) => msg.conversationId === conversationId)
                if (!hasExistingMessages) {
                // Check if conversation has userId before accessing
                const userId = conversation.userId || userStore.userId
                if (!userId) {
                    conversationNotFound.value = true
                    conversationError.value = "Unable to load conversation. Missing user information."
                    return
                }
                await messageStore.fetchMessages(conversationId, userId)
                } else {
                    // Messages exist, ensure currentNode is set for rendering
                    if (!conversationStore.currentNode) {
                        // Find the most recent message in this conversation
                        const conversationMessages = Object.values(messageStore.messagesTree).filter((msg: any) => msg.conversationId === conversationId)
                        if (conversationMessages.length > 0) {
                            // Sort by createdAt to find the most recent
                            const sortedMessages: any[] = conversationMessages.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
                            conversationStore.currentNode = sortedMessages[0].messageId
                        if (conversationStore.conversations[conversationId]) {
                            conversationStore.conversations[conversationId].currentNode = sortedMessages[0].messageId
                        }
                        }
                    }
                    // Re-render messages to ensure they show up
                    messageStore.reRenderMessageTree()
                }

            // Handle shared conversations with safe access
        if (conversation?.isShared) {
            setTimeout(async () => {
                    try {
                await socketService.connectSocket(config.public.apiUrl)
                socketService.joinConversation({
                    chatId: conversationId as string,
                    user: {
                        userId: userStore.userId as string,
                        name: userStore.firstName as string,
                    },
                })
                    } catch (error) {
                        console.error("Failed to connect socket:", error)
                    }
            }, 1000)
            useConversation().getCollaborators(conversationStore.conversationId)
            }
        } catch (error: any) {
            // Catch any unexpected errors
            console.error("Error in onMounted:", error)
            conversationNotFound.value = true
            conversationError.value = "An unexpected error occurred. Please try again."
        }
    })

    onUnmounted(() => {
        conversationStore.conversationId = ""
        socketService.disconnectSocket()
    })
</script>
