<template>
    <div class="contentWrapper mt-[2%] flex h-full w-full flex-1 flex-col items-center justify-center sm:mx-[1%] sm:mt-0" :class="{ 'mx-[10%]': !isMobile }">
        <div class="inputTextPosition relative bottom-0 flex h-full w-full flex-col items-center justify-center gap-[10px] sm:bottom-[10px]">
            <DefaultTextInput :placeholderValue="placeholderValue" :showDataMode="true" @onInputSubmit="onInputSubmit" @updateInputExpanded="updateInputExpanded" />
        </div>
    </div>
</template>
<script setup lang="ts">
    import { inject, type ComputedRef } from "vue"
    import { useRouter } from "vue-router"

    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    useHead({
        title: "Compose",
    })

    // Refs
    const placeholderValue = ref("Enter message for Mozart...")
    const isMobile = inject<ComputedRef<boolean>>("isMobile")

    // Stores
    const messageStore = useMessageStore()
    const conversationStore = useConversationStore()
    const userStore = useUserStore()
    const ragStore = useRagStore()
    const modelStore = useModelStore()

    // Composable
    const rag = useRag()

    const router = useRouter()

    // Functions
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
        conversationStore.updateCreatingNewConversation(true)
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
                await useCompletion().completions(data, "", "", UploadedFiles, response, "", collectionName)
            } else useCompletion().completions(data, "", "", UploadedFiles)
        } else {
            if (ragStore.isDataMode) {
                const response = await getRAGResponse(data, collectionName)
                await useCompletion().completions(data, "", "", "", response, "", collectionName)
            } else await useCompletion().completions(data)
        }
    }

    // Add method to handle input expansion updates
    const updateInputExpanded = (expanded: boolean) => {
        // This page doesn't have a Chat component, but we'll handle the emit for consistency
        console.log("Input expanded:", expanded)
    }

    watch(
        () => conversationStore.conversationId,
        (newConversationId) => {
            if (newConversationId !== "") {
                const conversation = conversationStore.conversations[newConversationId]
                if (conversation.metaData.type === "compose") {
                    // Check if conversation has projectId to use project-based route
                    if (conversation.projectId) {
                        router.push(`/compose/project/${conversation.projectId}/${newConversationId}`)
                    } else {
                        router.push(`/compose/${newConversationId}`)
                    }
                } else {
                    router.push(`/compose/${newConversationId}`)
                }
            }
        }
    )

    onMounted(async () => {
        conversationStore.conversationId = ""
        messageStore.messages = []
        messageStore.messagesTree = {}
        // Collections are already loaded by layout, no need to call again
        await conversationStore.fetchConversations()

        if (userStore.sharedConversation) {
            conversationStore.conversationId = userStore.sharedConversation
            userStore.sharedConversation = ""
            const conversation = conversationStore.conversations[conversationStore.conversationId]
            if (conversation.metaData.type === "compose") {
                // Check if conversation has projectId to use project-based route
                if (conversation.projectId) {
                    router.push(`/compose/project/${conversation.projectId}/${conversationStore.conversationId}`)
                } else {
                    router.push(`/compose/${conversationStore.conversationId}`)
                }
            } else {
                router.push(`/compose/${conversationStore.conversationId}`)
            }
        }
    })
</script>
