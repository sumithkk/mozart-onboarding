<template>
    <!-- Outer wrapper -->
    <div class="relative flex h-full w-full">
        <!-- Conversation Sharing Popup -->
        <ShareConversationPopup :show="conversationStore.triggerShareConversation" @update:show="handleUpdateShow" :module="'interaction'" />
        <!-- Workbench content -->
        <div :class="workbenchLayoutClass" class="flex-col md:flex-row min-h-0 overflow-y-auto md:overflow-visible">
            <!-- File Viewer - Takes more space on mobile -->
            <ClientOnly class="relative min-w-0 flex-[2] md:flex-1 basis-0 min-h-[60vh] md:min-h-0 md:h-full order-1">
                <div class="relative h-full w-full z-0">
                    <ViewerHolder class="h-full w-full" :fileUrl="fileUrl" :fileType="fileType" :isLoading="isDocumentFetching" />
                </div>
            </ClientOnly>
            <!-- Chat Section - Shrinks to fit on mobile -->
            <div class="relative flex min-w-0 flex-shrink-0 md:flex-1 md:basis-0 flex-col md:h-full order-2">
                <!-- CHAT SECTION - Takes up all available space minus input height -->
                <div
                    v-show="!isMobile || hasConversations"
                    class="mb-2 flex-1 overflow-hidden order-2 md:order-1 max-[767px]:order-1 min-h-0 !mb-0 md:mb-2 max-[480px]:-mt-2"
                >
                    <Chat :fileAttachmentsAvailable="fileAttachmentsAvailable" :inputExpanded="inputExpanded" />
                </div>
                <!-- AI Chat Input - Fixed at bottom with proper spacing -->
                <div class="mx-auto w-full max-w-3xl order-1 md:order-2 sticky bottom-0 z-20 bg-backgroundColor pb-2 md:pb-0 md:mb-6 md:static md:z-auto shrink-0">
                    <!-- Warning Banner -->
                    <div v-if="showWarning" class="bg-accent/20 mb-4 flex items-center justify-between rounded border-l-4 border-yellow-500 p-4 text-yellow-700 shadow">
                        <div>
                            <strong>Warning:</strong> Your {{ fileType?.toUpperCase() || 'file' }} has more than {{ modelContextWindowThreshold }} tokens. Data after this length will be <span class="text-destructive font-bold">redacted</span> in responses.<br />
                            <span>
                                To use the full document, please
                                <span class="text-primary cursor-pointer underline" @click="onVectorize">vectorize the file</span>
                                or adjust the page range from the file viewer to use for your response.
                            </span>
                        </div>
                        <button @click="dismissWarning" class="ml-4 text-xl font-bold text-yellow-700 hover:text-yellow-900">&times;</button>
                    </div>

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

                    <AIChatInput v-if="!isArchivedConversation" :placeholderValue="placeholderValue" :showDataMode="true" @onInputSubmit="onInputSubmit" @updateFileAttachments="updateFileAttachments" @updateInputExpanded="updateInputExpanded" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch, onMounted, onUnmounted } from "vue"
    import { convertMimeTypeToType, removePrefix } from "~/util"
    import { getPlaceHolder } from "~/util/staticData"
    import socketService from "../../services/socketService"
    import { useResponsiveSidebarWithDefaults } from "~/composables/useResponsiveSidebar"

    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
        key: () => "workbench",
    })

    // -------------------| Composables |-------------------
    const user = useUser()

    // Use responsive sidebar composable for sidebar state awareness
    const { sidebarOpen, windowWidth, isMobile, isDesktopAutoClose, toggleSidebar } = useResponsiveSidebarWithDefaults()

    const fileUrl = ref<string | undefined>(undefined)
    const fileType = ref<string | undefined>(undefined)
    const placeholderValue = ref(getPlaceHolder(isMobile.value))
    const fileAttachmentsAvailable = ref(false)
    const isDocumentFetching = ref(false)

    // Add state for input expansion
    const inputExpanded = ref(false)

    const router = useRouter()

    // -------------------| Composables |-------------------
    const conversation = useConversation()

    // -------------------| Store |-------------------
    const conversationStore = useConversationStore()
    const documentStore = useDocumentsStore()
    const organizationStore = useOrganizationStore()
    const messageStore = useMessageStore()
    const fileSystemStore = useFileSystemStore()
    const userStore = useUserStore()
    const modelStore = useModelStore()

    // -------------------| Runtime Config |-------------------
    const config = useRuntimeConfig()

    // -------------------| Page Meta |-------------------
    useHead({
        title: conversationStore.conversations[conversationStore.conversationId]?.title || "Workbench",
    })

    const modelContextWindowThreshold = ref(modelStore.current.context_window || 10000)

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
    
    // Responsive layout classes based on sidebar state and screen size
    const workbenchLayoutClass = computed(() => {
        const classes = ["relative", "flex", "h-full", "w-full"]

        // Adjust gap and padding based on sidebar state and screen width
        if (isMobile.value) {
            classes.push("gap-2", "px-1", "pt-2", "pb-2")
        } else if (isDesktopAutoClose.value || !sidebarOpen.value) {
            // When sidebar is closed or auto-closed, provide more space
            classes.push("gap-6", "px-4", "pt-4", "pb-2")
        } else {
            // Default spacing when sidebar is open
            classes.push("gap-5", "px-2", "pt-4", "pb-2")
        }

        return classes.join(" ")
    })

    const hasConversations = computed(() => {
        const convs = conversationStore?.conversations || {}
        const activeId = conversationStore?.conversationId

        if (!activeId) return false

        if (Object.prototype.hasOwnProperty.call(convs, activeId)) return true

        return Object.values(convs as Record<string, any>).some(
            (c: any) => c?.conversationId === activeId
        )
    })

    // -------------------| Functions |-------------------
    const onInputSubmit = async (data: any, documents: any) => {
        const documentId = await getDocumentId()
        let uploadedFiles = []
        // Example usage:
        const docId = removePrefix(documentId)
        const file = fileSystemStore.getFileById(docId)

        if (!documentId) return console.log("No document found")

        const userId = conversationStore.conversations[conversationStore.conversationId]?.userId || userStore.userId

        if (documents && documents.length > 0) {
            for (const document of documents) {
                const uploadData = await useUser().uploadFile(document)
                uploadedFiles.push(uploadData)
            }
            await useCompletion().completions(data, documentId, null, uploadedFiles, null, userId, null, file)
        } else {
            await useCompletion().completions(data, documentId, null, null, null, userId, null, file)
        }
    }
    const handleUpdateShow = (value: boolean) => {
        if (!value) {
            conversationStore.triggerShareConversation = false
        }
    }

    const getDocumentId = async () => {
        const workbenchId = router.currentRoute.value.params.conversationId as string
        if (workbenchId.startsWith("DOC_") || workbenchId.startsWith("FS_")) {
            return workbenchId
        } else if (workbenchId.startsWith("gd_")) return workbenchId
        else {
            const documentId = conversationStore.conversations[workbenchId]?.metaData.linkedDocumentId
            return documentId || null
        }
    }

    const getDocumentSource = (source: string | undefined) => {
        if (!source) return ""
        else if (source === "Google Drive") return "google-drive"
        return ""
    }

    const updateFileAttachments = (value: boolean) => {
        fileAttachmentsAvailable.value = value
    }

    // Add method to handle input expansion updates
    const updateInputExpanded = (expanded: boolean) => {
        inputExpanded.value = expanded
    }

    const updateCurrentModel = (conversationId: string, conversations: Record<string, IConversation> = conversationStore.conversations) => {
        if (conversationStore.creatingNewConversation) {
            conversationStore.updateCreatingNewConversation(false)
            return
        }
        const conversation = conversations[conversationId] || {}
        const modelName = conversation?.modelName || localStorage.getItem("currentModel") || "claude-3-7-sonnet-20250219"
        const selectedModel = modelStore.models.find((model: any) => model.model === modelName)
        if (selectedModel) {
            modelStore.setCurrent(selectedModel)
        }
    }

    watch(
        () => isMobile.value,
        (newVal) => {
            placeholderValue.value = getPlaceHolder(newVal)
        }
    )

    watch(
        () => conversationStore.conversations,
        (newVal) => {
            updateCurrentModel(conversationStore.conversationId, newVal)
        }
    )

    watch(
        () => router.currentRoute.value.params.conversationId,
        () => {
            onLoad()
        }
    )

    async function loadDocFile(documentId: string) {
        if (documentStore.documents[documentId]) {
            documentStore.isProcessing = true
            await user.getDocumentParsedData(documentId, organizationStore.currentOrganizationId)
            fileType.value = convertMimeTypeToType(documentStore.documents[documentId].fileType)
            fileUrl.value = documentStore.documents[documentId].viewDocumentUrl
            documentStore.documents[documentId].updatedAt = Date.now()
            await user.updateDocumentDate({ documentId, updatedAt: Date.now() }, organizationStore.currentOrganizationId)
            documentStore.isProcessing = false
        } else {
            router.push("/workbench/files")
        }
    }
    async function loadFSFile(documentId: string) {
        documentStore.isProcessing = true
        await user.getDocumentParsedData(documentId, organizationStore.currentOrganizationId)
        const file = fileSystemStore.getFileById(documentId)
        if (!file) {
            documentStore.isProcessing = false
            return console.log("No file found")
        }
        fileType.value = convertMimeTypeToType(file.mimeType)
        // Always use the explicit backend API URL to avoid Vite dev server interception
        const baseUrl = useUser().getBaseUrl()
        fileUrl.value = `${baseUrl}/api/v1/document/view?id=${encodeURIComponent(documentId)}`

        documentStore.isProcessing = false
    }

    async function loadGDFile(documentId: string) {
        documentId = documentId.replace("gd_", "")
        documentStore.isProcessing = true
        const file = fileSystemStore.getFileById(documentId)
        if (!file) {
            documentStore.isProcessing = false
            return router.push("/workbench/files")
        }

        const source = getDocumentSource(file.source?.name)
        // await useUser().getSourceFileParsedData(source, documentId, file.name, file?.url || "", file.mimeType)
        await useUser().getSourceFileParsedDataFromIntegrationFiles(file.id)
        fileType.value = convertMimeTypeToType(file.mimeType)
        fileUrl.value = `${useUser().getBaseUrl()}/api/v1/document/viewFile?userId=${userStore.userId}&source=${encodeURIComponent(file.url)}`
        documentStore.isProcessing = false
    }

    async function loadConversationLinkedDocument(workbenchId: string) {
        try {
            isDocumentFetching.value = true
            documentStore.isProcessing = true
            const documentId = conversationStore.conversations[workbenchId].metaData.linkedDocumentId
            conversationStore.conversationId = workbenchId
            if (documentId.startsWith("gd_")) {
                const file = fileSystemStore.getFileById(documentId.replace("gd_", ""))
                if (!file) {
                    return console.log("No file found")
                }
                fileType.value = convertMimeTypeToType(file.mimeType)
                fileUrl.value = `${useUser().getBaseUrl()}/api/v1/document/viewFile?userId=${userStore.userId}&source=${encodeURIComponent(file.url)}`
            } else {
                await user.getDocumentParsedData(documentId, organizationStore.currentOrganizationId)
                const file = fileSystemStore.getFileById(documentId)
                if (!file) {
                    return console.log("No file found")
                }
                fileType.value = convertMimeTypeToType(file.mimeType)
                fileUrl.value = `${useUser().getBaseUrl()}/api/v1/document/view?id=${documentId}`
            }
            await messageStore.fetchMessages(workbenchId, conversationStore.conversations[workbenchId].userId)
        } catch (error) {
            console.error(error)
            isDocumentFetching.value = false
            documentStore.isProcessing = false
        } finally {
            documentStore.isProcessing = false
            isDocumentFetching.value = false
        }
    }

    const WORKBENCH_HANDLERS: Record<string, (id: string) => Promise<void>> = {
        DOC_: loadDocFile,
        FS_: loadFSFile,
        gd_: loadGDFile,
    }

    async function onLoad() {
        isDocumentFetching.value = true
        //TO DO: Implement Notes
        //await Promise.all([conversationStore.fetchConversations(), fileSystemStore.fetchRoot(), documentStore.fetchNotes()])
        await Promise.all([conversationStore.fetchConversations(), fileSystemStore.fetchRoot()])

        const workbenchId = router.currentRoute.value.params.conversationId as string
        updateCurrentModel(workbenchId)

        const prefix = Object.keys(WORKBENCH_HANDLERS).find((p) => workbenchId.startsWith(p))

        if (prefix) {
            await WORKBENCH_HANDLERS[prefix](workbenchId)
        } else if (conversationStore.conversations[workbenchId] && documentStore.documents[conversationStore.conversations[workbenchId].metaData.linkedDocumentId]) {
            conversationStore.conversationId = workbenchId
            const documentId = conversationStore.conversations[workbenchId].metaData.linkedDocumentId
            const documentData = documentStore.documents[documentId]
            if (!documentData) return console.log("No document found")

            if (documentData.source) {
                documentStore.isProcessing = true
                const file = fileSystemStore.getFileById(documentId)
                if (!file) {
                    documentStore.isProcessing = false
                    return console.log("No file found")
                }
                const source = getDocumentSource(file.source?.name)
                await useUser().getSourceFileParsedData(source, documentId, file.name, file?.url || "", file.mimeType)
                fileType.value = convertMimeTypeToType(file.mimeType)
                fileUrl.value = `${useUser().getBaseUrl()}/api/v1/document/viewFile?userId=${userStore.userId}&source=${encodeURIComponent(file.url)}`
                documentStore.isProcessing = false
            } else {
                documentStore.isProcessing = true
                await user.getDocumentParsedData(documentId, organizationStore.currentOrganizationId)
                fileType.value = convertMimeTypeToType(documentData.fileType)
                fileUrl.value = documentData.viewDocumentUrl
                documentStore.isProcessing = false
            }
            await messageStore.fetchMessages(workbenchId)
        } else {
            await loadConversationLinkedDocument(workbenchId)
        }

        isDocumentFetching.value = false
        useHead({
            title: conversationStore.conversations[conversationStore.conversationId]?.title || "Workbench",
        })
        if (conversationStore.conversations[conversationStore.conversationId] && conversationStore.conversations[conversationStore.conversationId].isShared) {
            setTimeout(async () => {
                await socketService.connectSocket(config.public.apiUrl)
                socketService.joinConversation({
                    chatId: conversationStore.conversationId as string,
                    user: {
                        userId: userStore.userId as string,
                        name: userStore.firstName as string,
                    },
                })
            }, 1000)
            useConversation().getCollaborators(conversationStore.conversationId)
        }
    }

    onMounted(async () => {
        onLoad()
    })
    onUnmounted(() => {
        conversationStore.conversationId = ""
        socketService.disconnectSocket()
    })

    const showWarning = ref(false)
    const warningDismissed = ref(false)

    function dismissWarning() {
        showWarning.value = false
        warningDismissed.value = true
    }
    function onVectorize() {
        // Implement your vectorize logic or navigation here
        alert("Vectorize action triggered!")
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

    watch(
        () => documentStore.documentParsedData?.totalTokens,
        (newVal) => {
            if (!warningDismissed.value && newVal && newVal > 0) {
                showWarning.value = newVal > modelContextWindowThreshold.value
            }
        },
        { immediate: true }
    )
</script>
