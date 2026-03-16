<template>
    <div class="bg-background flex h-screen w-screen flex-col overflow-hidden">
        <!-- Impersonation Banner -->
        <ImpersonationBanner />

        <div class="flex flex-1 overflow-hidden">
            <!-- Sidebar (Left) -->
            <div :class="sidebarContainerClass" class="bg-sideBarBackgroundColorDark border-e border-gray-200 dark:border-neutral-700" role="dialog" aria-hidden="true">
                <div class="z-20 mt-[5px] hidden justify-between pr-2 sm:flex">
                    <div class="flex items-center px-5">
                        <!-- Logo - Only visible on desktop when sidebar is open -->
                        <div v-if="!isMobile && sidebarOpen" class="text-logoColor cursor-pointer text-4xl font-medium" @click="goToDashboard">Mozart</div>
                    </div>
                    <button @click="handleSidebarToggle" type="button" class="pt-1 text-xl focus:outline-none" aria-label="Toggle Sidebar">
                        <VTooltip v-if="!sidebarOpen" placement="right">
                            <div class="materialSymbolsOutlined hover:bg-secondary flex items-center justify-center rounded-md transition duration-200" :class="isMobile ? 'p-1' : 'p-2'" :style="{ fontSize: isMobile ? '1rem' : '1.5rem', cursor: 'pointer', color: 'var(--textColor)' }">last_page</div>
                            <template #popper>Open Sidebar</template>
                        </VTooltip>
                        <VTooltip v-else placement="right">
                            <div class="materialSymbolsOutlined hover:bg-secondary flex items-center justify-center rounded-md transition duration-200" :class="isMobile ? 'p-1' : 'p-2'" :style="{ fontSize: isMobile ? '1rem' : '1.5rem', cursor: 'pointer', color: 'var(--textColor)' }">first_page</div>
                            <template #popper>{{ pinSidebar.value && !isMobile ? "Sidebar Pinned (unpin in settings)" : "Close Sidebar" }}</template>
                        </VTooltip>
                    </button>
                </div>

                <!-- Sidebar Content -->
                <GeneralSidebar v-if="isRAG" :class="{ 'pointer-events-none opacity-0': !sidebarOpen }" @showVectorDatabaseConfig="showVectorDatabaseConfig = true" @editProject="handleEditProject" @deleteProject="handleDeleteProject" />
                <GeneralSidebar v-else-if="isProjects" :class="{ 'pointer-events-none opacity-0': !sidebarOpen }" @deleteConversation="deleteConversation" @moveConversationToFolder="moveConversationToFolder" @archiveConversation="archiveConversation" @restoreConversation="restoreConversation" @editProject="handleEditProject" @deleteProject="handleDeleteProject" />
                <GeneralSidebar v-else-if="isWorkbench" :class="{ 'pointer-events-none opacity-0': !sidebarOpen }" @deleteConversation="deleteConversation" @moveConversationToFolder="moveConversationToFolder" @archiveConversation="archiveConversation" @restoreConversation="restoreConversation" @editProject="handleEditProject" @deleteProject="handleDeleteProject" />
                <GeneralSidebar v-else-if="isCompose" :class="{ 'pointer-events-none opacity-0': !sidebarOpen }" @deleteConversation="deleteConversation" @moveConversationToFolder="moveConversationToFolder" @archiveConversation="archiveConversation" @restoreConversation="restoreConversation" @editProject="handleEditProject" @deleteProject="handleDeleteProject" />
                <GeneralSidebar v-else-if="isProfile" :class="{ 'pointer-events-none opacity-0': !sidebarOpen }" @editProject="handleEditProject" @deleteProject="handleDeleteProject" />
            </div>

            <!-- Main Section -->
            <div class="relative flex h-full flex-grow flex-col overflow-hidden transition-all duration-300" :class="{ 'pt-12': isMobile }">
                <!-- Header -->
                <DashboardHeader :isMobile="isMobile" :sidebarOpen="sidebarOpen" @toggleSidebar="handleSidebarToggle" />

                <!-- Main Content -->
                <main class="bg-surfaceColor relative flex-1 overflow-hidden">
                    <slot />
                    <div
                        v-if="isRAG"
                        class="fixed bottom-0 left-0 z-40 w-full transition-all"
                        :class="{
                            'translate-y-[calc(100%-2rem)]': !isVectorBrowserOpen,
                            'translate-y-0': isVectorBrowserOpen,
                        }"
                        :style="{ left: isMobile ? '0' : sidebarOpen ? '282px' : '50px', width: isMobile ? '100%' : sidebarOpen ? 'calc(100% - 282px)' : 'calc(100% - 50px)' }"
                    >
                        <div class="border-border bg-sideBarBackgroundColorDark flex h-10 cursor-pointer items-center justify-center rounded-xl rounded-b-[0px] border-t" @click="isVectorBrowserOpen = !isVectorBrowserOpen">
                            <UIcon :name="isVectorBrowserOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'" class="size-6" variant="subtle" />
                        </div>
                        <div class="bg-background h-[52vh] overflow-auto" v-show="isVectorBrowserOpen">
                            <VectorBrowser />
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- Backdrop overlay for mobile -->
        <div v-if="isMobile && sidebarOpen" class="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 dark:bg-black/60" @click="toggleSidebar"></div>

        <Modal v-if="showVectorDatabaseConfig" @close="showVectorDatabaseConfig = false" title="Vector Database Configuration" closeable>
            <VectorDatabaseConfig />
        </Modal>

        <!-- Project Dialog -->
        <ProjectDialog :show="showProjectDialog" :project="selectedProject" :mode="projectDialogMode" :loading="isSavingProject" @close="closeProjectDialog" @save="handleSaveProject" />

        <ConfirmationPopup
            v-if="confirmModalState.show"
            :show="confirmModalState.show"
            :shortName="confirmModalState.options?.shortName || ''"
            :title="confirmModalState.options?.title || ''"
            :subtitle="confirmModalState.options?.subtitle || ''"
            :closeOnTopRight="confirmModalState.options?.closeOnTopRight || false"
            :confirmButtonText="confirmModalState.options?.confirmButtonText || 'Confirm'"
            :confirmButtonColor="confirmModalState.options?.confirmButtonColor || '#FF5555'"
            @update:show="handleUpdateShow"
            @buttonClick="handleButtonClick"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, provide, watch } from "vue"
    import { useModal } from "~/composables/useConfirmationModel"
    import { useResponsiveSidebarWithDefaults } from "~/composables/useResponsiveSidebar"

    const route = useRoute()
    const router = useRouter()
    const ragStore = useRagStore()
    const userStore = useUserStore()
    const conversationStore = useConversationStore()
    const modelStore = useModelStore()
    const { confirmModalState, confirmModal, cancelModal, showConfirmModal } = useModal()

    // Use the responsive sidebar composable
    const { sidebarOpen, windowWidth, isMobile, isDesktopAutoClose, toggleSidebar, sidebarContainerClass, openSidebar } = useResponsiveSidebarWithDefaults()

    // Provide models store globally
    provide("modelStore", modelStore)
    provide("isMobile", isMobile)

    // Reactive states
    const pinSidebar = ref(userStore.settings.pinSideBar) // If pinned, hover won't auto-close

    // Watch for store changes to sync pin state
    watch(
        () => userStore.settings.pinSideBar,
        (newValue) => {
            pinSidebar.value = newValue
        }
    )

    // On mount, ensure sidebar is open if pinned (not on mobile)
    onMounted(() => {
        if (pinSidebar.value && !isMobile.value && !sidebarOpen.value) {
            openSidebar()
        }
    })

    // Prevent auto-close when pinned
    watch(isDesktopAutoClose, (shouldAutoClose) => {
        if (shouldAutoClose && pinSidebar.value && !isMobile.value) {
            // If pinned, keep sidebar open even when below auto-close threshold
            if (!sidebarOpen.value) {
                openSidebar()
            }
        }
    })

    // When pin setting changes from preferences, ensure sidebar stays open if pinned
    watch(pinSidebar, (isPinned) => {
        if (isPinned && !sidebarOpen.value && !isMobile.value) {
            openSidebar()
        }
    })

    // Custom toggle handler that respects pin setting
    const handleSidebarToggle = () => {
        // If sidebar is pinned and not on mobile, prevent closing
        if (pinSidebar.value && sidebarOpen.value && !isMobile.value) {
            return // Don't close if pinned
        }
        toggleSidebar()
    }

    const showVectorDatabaseConfig = ref(false)
    const isVectorBrowserOpen = ref(false)

    // Project dialog state
    const showProjectDialog = ref(false)
    const selectedProject = ref<any>(null)
    const projectDialogMode = ref<"create" | "edit">("create")
    const projectToDeleteId = ref<string | null>(null)
    const isSavingProject = ref(false)

    // Decide which sidebar to show
    const isWorkbench = computed(() => route.path.includes("/workbench") || route.path.includes("/integrations"))
    const isCompose = computed(() => route.path.includes("/compose") || route.path.includes("/ragCompose"))
    const isProjects = computed(() => route.path.includes("/projects"))
    const isRAG = computed(() => (route.path.includes("/rag") && !route.path.includes("/ragCompose")) || route.path.includes("/admin"))
    const isProfile = computed(() => route.path.includes("/profile"))

    // Modal logic for ConfirmationPopup
    function handleUpdateShow(value: boolean) {
        if (!value) cancelModal()
    }
    function handleButtonClick(action: "confirm" | "cancel") {
        if (action === "confirm") {
            confirmModal()
        } else {
            cancelModal()
        }
    }

    // Example: confirm and delete conversation
    async function deleteConversation(modalInfo: ModalOptions, conversationId: string) {
        try {
            const askForConfirmation = await showConfirmModal({
                shortName: modalInfo.shortName,
                title: modalInfo.title,
                subtitle: modalInfo.subtitle,
                confirmButtonText: modalInfo.confirmButtonText,
                confirmButtonColor: modalInfo.confirmButtonColor,
                closeOnTopRight: modalInfo.closeOnTopRight,
            })

            if (askForConfirmation === "confirm") {
                await useConversation().deleteConversationById(conversationId)

                if (conversationId === conversationStore.conversationId) {
                    conversationStore.conversationId = ""
                    goToDashboard()
                }
            }
        } catch (error) {
            // Still try to navigate if we're in a broken state
            if (conversationId === conversationStore.conversationId) {
                conversationStore.conversationId = ""
                goToDashboard()
            }
        }
    }

    async function moveConversationToFolder(modalInfo: ModalOptions, conversationId: string) {
        const askForConfirmation = await showConfirmModal({
            shortName: modalInfo.shortName,
            title: modalInfo.title,
            subtitle: modalInfo.subtitle,
            confirmButtonText: modalInfo.confirmButtonText,
            confirmButtonColor: modalInfo.confirmButtonColor,
            closeOnTopRight: modalInfo.closeOnTopRight,
        })
        if (askForConfirmation === "confirm") {
            //await useConversation().moveConversationToFolder(conversationId, folderId)
        }
    }
    async function archiveConversation(modalInfo: ModalOptions, conversationId: string) {
        const askForConfirmation = await showConfirmModal({
            shortName: modalInfo.shortName,
            title: modalInfo.title,
            subtitle: modalInfo.subtitle,
            confirmButtonText: modalInfo.confirmButtonText,
            confirmButtonColor: modalInfo.confirmButtonColor,
            closeOnTopRight: modalInfo.closeOnTopRight,
        })
        if (askForConfirmation === "confirm") {
            await useConversation().archiveConversation(conversationId)
        }
    }
    async function restoreConversation(modalInfo: ModalOptions, conversationId: string) {
        const askForConfirmation = await showConfirmModal({
            shortName: modalInfo.shortName,
            title: modalInfo.title,
            subtitle: modalInfo.subtitle,
            confirmButtonText: modalInfo.confirmButtonText,
            confirmButtonColor: modalInfo.confirmButtonColor,
            closeOnTopRight: modalInfo.closeOnTopRight,
        })
        if (askForConfirmation === "confirm") {
            await useConversation().restoreConversation(conversationId)
        }
    }

    function goToDashboard() {
        router.push("/workbench/files")
    }

    // Project management functions
    function handleEditProject(projectId: string | null) {
        if (projectId === null) {
            // Create new project
            projectDialogMode.value = "create"
            selectedProject.value = null
        } else {
            // Edit existing project
            projectDialogMode.value = "edit"
            selectedProject.value = conversationStore.projects?.find((p: any) => p.projectId === projectId)
        }
        showProjectDialog.value = true
    }

    function closeProjectDialog() {
        showProjectDialog.value = false
        selectedProject.value = null
        isSavingProject.value = false
    }

    async function handleSaveProject(projectData: any) {
        isSavingProject.value = true
        try {
            if (projectDialogMode.value === "create") {
                await useConversation().createProject(projectData.name, projectData.description, projectData.scope, projectData.organizationId)
            } else {
                await useConversation().updateProject(selectedProject.value.projectId, projectData.name, projectData.description, projectData.scope, projectData.organizationId)
            }
            closeProjectDialog()

            // Notify the projects page to reload
            window.dispatchEvent(new CustomEvent("project-updated"))

            // Reload projects in the sidebar
            await useConversation().getProjectsForUser()
        } catch (error) {
            console.error("Failed to save project:", error)
        } finally {
            isSavingProject.value = false
        }
    }

    async function handleDeleteProject(modalInfo: ModalOptions, projectId: string) {
        const askForConfirmation = await showConfirmModal({
            shortName: modalInfo.shortName,
            title: modalInfo.title,
            subtitle: modalInfo.subtitle,
            confirmButtonText: modalInfo.confirmButtonText,
            confirmButtonColor: modalInfo.confirmButtonColor,
            closeOnTopRight: modalInfo.closeOnTopRight,
        })
        if (askForConfirmation === "confirm") {
            await useConversation().deleteProject(projectId)

            // Notify the projects page to reload
            window.dispatchEvent(new CustomEvent("project-updated"))

            // Reload projects in the sidebar
            await useConversation().getProjectsForUser()
        }
    }

    // Lifecycle
    onMounted(async () => {
        // Listen for project events from pages
        window.addEventListener("open-project-dialog", (event: any) => {
            const project = event.detail?.project
            if (project) {
                handleEditProject(project.projectId)
            } else {
                handleEditProject(null)
            }
        })

        window.addEventListener("delete-project", async (event: any) => {
            const project = event.detail?.project
            if (project) {
                await handleDeleteProject(
                    {
                        shortName: "Delete Project",
                        title: "Are you sure you want to delete this project?",
                        subtitle: "This action is permanent and cannot be undone.",
                        confirmButtonText: "Delete",
                        confirmButtonColor: "#FF5555",
                        closeOnTopRight: true,
                    },
                    project.projectId
                )
            }
        })
        // Load models and user RAG data on mount (with caching to prevent duplicates)
        try {
            const userStore = useUserStore()
            // Only hydrate if not already loaded
            if (!userStore._sessionLoaded) {
                await userStore.hydrateFromBetterAuth()
            }
            // Load models first (cached), pass session data to avoid duplicate call
            await modelStore.loadModels(userStore._lastSessionData)

            // Load projects
            await useConversation().getProjectsForUser()

            // Load user RAG data (cached)
            const mozartRAGService = useRag()
            await mozartRAGService.getCollectionsForUser()
            const collectionName = ragStore.currentCollection
            if (collectionName) {
                await useRag().getCollectionPointCount(collectionName)
                await useRag().getCollectionData(collectionName)
            }
        } catch (error) {
            // Handle error silently
            console.error("❌ Error loading data:", error)
        }
    })

    onUnmounted(() => {
        window.removeEventListener("open-project-dialog", () => {})
        window.removeEventListener("delete-project", () => {})
    })
</script>
