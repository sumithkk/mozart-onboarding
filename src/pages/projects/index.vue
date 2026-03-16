<template>
    <div class="contentWrapper flex h-full flex-1 flex-col overflow-x-hidden" :class="{ 'mx-auto w-[80%] max-w-full': !isMobile, 'w-full': isMobile, 'mt-[2%] sm:mt-0': true }">
        <!-- Header -->
        <div class="flex flex-col gap-6 px-4 py-6 sm:px-6 w-full max-w-full overflow-x-hidden">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-textColor text-3xl font-bold dark:text-white">Projects</h1>
                    <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                        Organize your conversations into projects for better collaboration
                    </p>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full max-w-full overflow-x-hidden">
                <div v-for="i in 8" :key="i" class="animate-pulse min-w-0 w-full">
                    <div class="h-48 w-full rounded-lg bg-gray-200 dark:bg-neutral-800"></div>
                </div>
            </div>

            <!-- Empty State -->
            <div
                v-else-if="!projects.length"
                class="flex flex-col items-center justify-center py-16 text-center"
            >
                <div
                    class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
                >
                    <span class="materialSymbolsOutlined text-4xl text-gray-400">folder_open</span>
                </div>
                <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    No projects yet
                </h3>
                <p class="mb-6 max-w-sm text-sm text-gray-600 dark:text-neutral-400">
                    Use "New Project" button in the sidebar to create your first project
                </p>
            </div>

            <!-- Projects Grid -->
            <div v-else class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full max-w-full overflow-x-hidden">
                <ProjectCard
                    v-for="project in projects"
                    :key="project.projectId"
                    :project="project"
                    class="min-w-0 w-full"
                    @edit="openEditDialog"
                    @delete="confirmDelete"
                    @view="viewProject"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, type ComputedRef } from "vue"

definePageMeta({
    layout: "mozart-rag-service-admin",
    middleware: ["auth"],
})

useHead({
    title: "Projects",
})

// Refs
const isMobile = inject<ComputedRef<boolean>>("isMobile")
const router = useRouter()
const conversationStore = useConversationStore()
const conversationSvc = useConversation()

// State
const isLoading = ref(true)

// Computed
const projects = computed(() => conversationStore.projects || [])

// Methods
const loadProjects = async () => {
    isLoading.value = true
    try {
        await conversationSvc.getProjectsForUser()
    } catch (error) {
        console.error("Failed to load projects:", error)
    } finally {
        isLoading.value = false
    }
}

const openEditDialog = (project: any) => {
    // This will be handled by the layout via event bus
    window.dispatchEvent(new CustomEvent('open-project-dialog', { detail: { project } }))
}

const confirmDelete = (project: any) => {
    // This will be handled by the layout via event bus
    window.dispatchEvent(new CustomEvent('delete-project', { detail: { project } }))
}

const viewProject = (project: any) => {
    router.push(`/compose/project/${project.projectId}`)
}

// Lifecycle
onMounted(async () => {
    await loadProjects()
    // Listen for project updates
    window.addEventListener('project-updated', loadProjects)
})

onUnmounted(() => {
    window.removeEventListener('project-updated', loadProjects)
})
</script>

<style scoped>
.contentWrapper {
    box-sizing: border-box;
}
</style>

