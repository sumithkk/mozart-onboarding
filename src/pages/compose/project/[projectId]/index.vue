<template>
    <div class="contentWrapper mt-[2%] flex h-full w-full flex-1 flex-col items-center justify-center sm:mx-[1%] sm:mt-0" :class="{ 'mx-[10%]': !isMobile }">
        <!-- Project Header -->
        <div class="shrink-0 w-full px-4 py-4 sm:px-6">
            <div class="flex items-center gap-3">
                <span class="materialSymbolsOutlined text-2xl text-gray-600 dark:text-neutral-400">folder</span>
                <div class="flex-1 min-w-0">
                    <h1 class="text-textColor text-2xl font-bold dark:text-white truncate">{{ project?.name || "Project" }}</h1>
                    <p v-if="project?.description" class="mt-1 text-sm text-gray-600 dark:text-neutral-400 line-clamp-2">
                        {{ project.description }}
                    </p>
                    <p v-else class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                        {{ projectConversations.length }} {{ projectConversations.length === 1 ? 'conversation' : 'conversations' }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Input Component (Centered) -->
        <div class="inputTextPosition mt-28 relative bottom-0 flex w-full flex-col items-center justify-center gap-[10px] sm:bottom-[10px]">
            <DefaultTextInput :placeholderValue="placeholderValue" :showDataMode="true" @onInputSubmit="onInputSubmit" @updateInputExpanded="updateInputExpanded" />
        </div>

        <!-- Conversations List -->
        <div class="flex-1 w-full max-w-3xl mx-auto overflow-y-auto px-4 pb-4 sm:px-6">
            <div v-if="isLoading" class="space-y-4 py-4">
                <div v-for="i in 3" :key="i" class="animate-pulse">
                    <div class="h-16 rounded-lg bg-gray-200 dark:bg-neutral-800"></div>
                </div>
            </div>

            <!-- Empty State -->
            <div
                v-else-if="!projectConversations.length"
                class="flex flex-col items-center justify-center py-12 text-center"
            >
                <div
                    class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
                >
                    <span class="materialSymbolsOutlined text-3xl text-gray-400">chat_bubble_outline</span>
                </div>
                <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    No conversations yet
                </h3>
                <p class="max-w-sm text-sm text-gray-600 dark:text-neutral-400">
                    Start a new conversation by typing in the input above
                </p>
            </div>

            <!-- Conversations List -->
            <div v-else class="space-y-2 py-4">
                <div
                    v-for="conversation in projectConversations"
                    :key="conversation.conversationId"
                    :class="[
                        'group cursor-pointer rounded-lg border p-3 transition-all hover:bg-gray-50 dark:hover:bg-neutral-800',
                        conversationStore.conversationId === conversation.conversationId
                            ? 'border-primaryColor bg-gray-50 dark:bg-neutral-800'
                            : 'border-gray-200 dark:border-neutral-700'
                    ]"
                    @click="openConversation(conversation)"
                >
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 min-w-0">
                            <h3 class="text-textColor truncate font-semibold dark:text-white text-sm">
                                {{ conversation.title || "Untitled Conversation" }}
                            </h3>
                            <p class="mt-1 text-xs text-gray-600 dark:text-neutral-400">
                                {{ formatDate(conversation.updatedAt || conversation.createdAt) }}
                            </p>
                        </div>
                        <span
                            v-if="conversation.isShared"
                            class="materialSymbolsOutlined shrink-0 text-logoColor text-lg"
                            title="Shared conversation"
                        >
                            share
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { inject, computed, type ComputedRef } from "vue"
    import { useRouter } from "vue-router"
    import { useConversationSwitching } from "~/composables/useConversationSwitching"

    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    const route = useRoute()
    const router = useRouter()
    const projectId = route.params.projectId as string

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
    const conversationSwitching = useConversationSwitching()

    // Computed
    const project = computed(() => {
        return conversationStore.projects.find((p: any) => p.projectId === projectId)
    })

    const projectConversations = computed(() => {
        return conversationStore.byProject?.[projectId]?.conversations || []
    })

    const isLoading = computed(() => {
        return !conversationStore.byProject?.[projectId]?.loaded
    })

    // Functions
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`
        if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`
        if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    const openConversation = async (conversation: any) => {
        if (conversationSwitching.isLoading.value) return
        
        let success = false
        if (conversation.isShared) {
            success = await conversationSwitching.switchToConversation(conversation.conversationId, {
                isSharedConversation: conversation.isShared,
                sharedConversationOwnerId: conversation.userId,
            })
        } else {
            success = await conversationSwitching.switchToConversation(conversation.conversationId)
        }
        
        if (success) {
            // Navigation will be handled by useConversationSwitching
        }
    }

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
        
        // Fetch projects if not loaded
        if (!conversationStore.projects.length) {
            const conversationSvc = useConversation()
            await conversationSvc.getProjectsForUser()
        }
        
        // Collections are already loaded by layout, no need to call again
        await conversationStore.fetchConversations()
        
        // Fetch project conversations if not loaded
        if (!conversationStore.byProject?.[projectId]?.loaded) {
            await conversationStore.fetchConversationsByProject(projectId)
        }

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
