<template>
    <div
        class="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 w-full min-w-0"
    >
        <!-- Header -->
        <div class="flex items-center justify-between p-4">
            <div class="flex items-center gap-3 min-w-0 flex-1">
                <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/30"
                >
                    <span class="materialSymbolsOutlined text-lg text-indigo-600 dark:text-indigo-400">
                        folder
                    </span>
                </div>
                <div class="min-w-0 flex-1">
                    <h3
                        class="truncate text-sm font-semibold text-gray-900 dark:text-white"
                        :title="project.name"
                    >
                        {{ project.name }}
                    </h3>
                    <p class="text-xs text-gray-500 dark:text-neutral-400">
                        {{ formatDate(project.createdAt) }}
                    </p>
                </div>
            </div>

            <!-- Actions Menu -->
            <div class="ml-2 flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <VTooltip>
                    <button
                        @click="$emit('edit', project)"
                        class="flex h-6 w-6 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                    >
                        <span class="materialSymbolsOutlined text-sm">edit</span>
                    </button>
                    <template #popper>Edit Project</template>
                </VTooltip>

                <VTooltip>
                    <button
                        @click="$emit('delete', project)"
                        class="flex h-6 w-6 items-center justify-center rounded text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    >
                        <span class="materialSymbolsOutlined text-sm">delete</span>
                    </button>
                    <template #popper>Delete Project</template>
                </VTooltip>
            </div>
        </div>

        <!-- Content -->
        <div class="px-4 pb-3">
            <p
                v-if="project.description"
                class="line-clamp-2 text-xs text-gray-600 dark:text-neutral-400"
            >
                {{ project.description }}
            </p>
            <p v-else class="text-xs italic text-gray-400 dark:text-neutral-500">
                No description
            </p>

            <!-- Stats and Badge Row -->
            <div class="mt-3 flex items-center justify-between">
                <!-- Stats -->
                <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-neutral-400">
                    <div class="flex items-center gap-1">
                        <span class="materialSymbolsOutlined text-sm">chat</span>
                        <span>{{ conversationCount }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span
                            :class="[
                                'h-1.5 w-1.5 rounded-full',
                                project.isArchived
                                    ? 'bg-gray-400'
                                    : 'bg-green-500'
                            ]"
                        ></span>
                        <span>{{ project.isArchived ? 'Archived' : 'Active' }}</span>
                    </div>
                </div>

                <!-- Scope Badge -->
                <span
                    :class="[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        project.scope === 'personal'
                            ? 'bg-mozart-blue-100 text-mozart-blue-800 dark:bg-mozart-blue-300 dark:text-mozart-blue'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                    ]"
                >
                    <span class="materialSymbolsOutlined mr-1 text-xs">
                        {{ project.scope === 'personal' ? 'person' : 'groups' }}
                    </span>
                    {{ project.scope === 'personal' ? 'Personal' : 'Org' }}
                </span>
            </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-100 p-3 dark:border-neutral-800">
            <button
                @click="$emit('view', project)"
                class="flex w-full items-center justify-center gap-1.5 rounded-md bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
                <span class="materialSymbolsOutlined text-sm">arrow_forward</span>
                View Conversations
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

interface Props {
    project: {
        projectId: string
        name: string
        description?: string
        scope: "personal" | "organization"
        createdAt: string
        isArchived?: boolean
    }
}

const props = defineProps<Props>()
const emit = defineEmits(["edit", "delete", "view"])

const conversationStore = useConversationStore()

const conversationCount = computed(() => {
    return conversationStore.byProject?.[props.project.projectId]?.conversations?.length || 0
})

const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - d.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`

    return d.toLocaleDateString()
}
</script>

