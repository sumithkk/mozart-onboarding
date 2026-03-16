<template>
    <div class="relative flex h-full w-full flex-col">
        <!-- Conversation Sharing Popup -->
        <ShareConversationPopup :show="conversationStore.triggerShareConversation" @update:show="handleUpdateShow" :module="'conversation'" />

        <!-- Main content container with proper flex layout -->
        <div class="flex h-full w-full flex-col" :class="{ 'pb-32': isMobile }">
            <!-- CHAT SECTION - Takes up all available space -->
            <!-- Shared container -->
            <div class="flex-1 overflow-hidden">
                <Chat ref="chatRef" :fileAttachmentsAvailable="fileAttachmentsAvailable" :inputExpanded="inputExpanded" @updateScrollButton="updateScrollButton" />
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
    import socketService from "../../../../services/socketService"

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
        title: conversationStore.conversations[conversationStore.conversationId]?.title || "Compose",
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
                await useCompletion().completions(data, null, null, UploadedFiles, response, conversationStore.conversations[conversationStore.conversationId].userId, collectionName)
            } else {
                await useCompletion().completions(data, null, null, UploadedFiles, null, conversationStore.conversations[conversationStore.conversationId].userId)
            }
        } else {
            if (ragStore.isDataMode) {
                const response = await getRAGResponse(data, collectionName)
                await useCompletion().completions(data, null, null, null, response, conversationStore.conversations[conversationStore.conversationId].userId, collectionName)
            } else {
                await useCompletion().completions(data, null, null, null, null, conversationStore.conversations[conversationStore.conversationId].userId)
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
        // Collections are already loaded by layout, no need to call again
        await conversationStore.fetchConversations()
        const route = router.currentRoute.value
        const projectId = route.params.projectId as string
        const conversationId = route.params.conversationId as string
        const currentPath = route.fullPath
        updateCurrentModel(conversationId)

        if (conversationId && conversationId !== "undefined" && !conversationId.startsWith("DOC_")) {
            conversationStore.conversationId = conversationId
            if (conversationStore.conversations[conversationId]) {
                const conversation = conversationStore.conversations[conversationId]
                const conversationType = conversation.metaData.type
                
                // Verify projectId matches
                if (conversation.projectId && conversation.projectId !== projectId) {
                    // ProjectId mismatch, redirect to correct route
                    router.push(`/compose/project/${conversation.projectId}/${conversationId}`)
                    return
                }
                
                // If conversation doesn't have projectId, redirect to legacy route
                if (!conversation.projectId) {
                    router.push(`/compose/${conversationId}`)
                    return
                }
                
                if (conversationType === "interaction") {
                    if (!currentPath.includes("workbench")) router.push(`/workbench/${conversationId}`)
                } else if (conversationType === "rag") {
                    if (!currentPath.includes("compose")) router.push(`/compose/${conversationId}`)
                } else {
                    // Ensure we're on the correct project route
                    if (!currentPath.includes(`/project/${projectId}/`)) {
                        router.push(`/compose/project/${projectId}/${conversationId}`)
                    }
                }
                await messageStore.fetchMessages(conversationId, conversation.userId)
            }
        } else {
            router.push("/compose")
        }
        
        const conversation = conversationStore.conversations[conversationId]
        if (conversation?.isShared) {
            setTimeout(async () => {
                await socketService.connectSocket(config.public.apiUrl)
                socketService.joinConversation({
                    chatId: conversationId as string,
                    user: {
                        userId: userStore.userId as string,
                        name: userStore.firstName as string,
                    },
                })
            }, 1000)
            useConversation().getCollaborators(conversationStore.conversationId)
        }
    })

    onUnmounted(() => {
        conversationStore.conversationId = ""
        socketService.disconnectSocket()
    })
</script>

