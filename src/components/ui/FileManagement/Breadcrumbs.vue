<script setup lang="ts">
    import { computed, ref } from "vue"
    import { ChevronRightIcon, HomeIcon } from "@heroicons/vue/24/outline"

    const props = defineProps<{
        path: string
    }>()

    const emit = defineEmits<{
        (e: "navigate", path: string): void
        (e: "moveFile", file: FileItem, targetPath: string): void
    }>()

    const dragTarget = ref<string | null>(null)
    const dragCounters = ref<{ [path: string]: number }>({})

    const pathSegments = computed(() => {
        const segments = props.path.split("/").filter(Boolean)
        return [
            { name: "Home", path: "/" },
            ...segments.map((segment, index) => ({
                name: segment,
                path: "/" + segments.slice(0, index + 1).join("/"),
            })),
        ]
    })

    const handleDragEnter = (path: string, event: DragEvent) => {
        event.preventDefault()
        // Initialize counter for this path if it doesn't exist
        if (!dragCounters.value[path]) {
            dragCounters.value[path] = 0
        }
        dragCounters.value[path]++
        dragTarget.value = path
    }

    const handleDragLeave = (path: string, event: DragEvent) => {
        event.preventDefault()
        if (dragCounters.value[path]) {
            dragCounters.value[path]--
            if (dragCounters.value[path] === 0) {
                dragTarget.value = null
            }
        }
    }

    const handleDrop = (e: DragEvent, targetPath: string) => {
        e.preventDefault()
        dragTarget.value = null
        dragCounters.value[targetPath] = 0
        const fileData = e.dataTransfer?.getData("application/json")
        if (fileData) {
            const file = JSON.parse(fileData) as FileItem
            emit("moveFile", file, targetPath)
        }
    }
</script>

<template>
    <nav class="bg-surfaceColor text-textColor flex items-center space-x-2 px-4 py-2">
        <div v-for="(segment, index) in pathSegments" :key="segment.path" class="flex items-center">
            <div
                @dragenter="handleDragEnter(segment.path, $event)"
                @dragleave="handleDragLeave(segment.path, $event)"
                @dragover.prevent
                @drop="handleDrop($event, segment.path)"
                class="relative"
                :class="{
                    'hover:bg-accent/10 rounded': index !== pathSegments.length - 1,
                }"
            >
                <button
                    @click="emit('navigate', segment.path)"
                    class="hover:text-primary flex items-center p-1"
                    :class="{
                        'text-textColorSecondary': index !== pathSegments.length - 1,
                        'text-textColor font-medium': index === pathSegments.length - 1,
                        'bg-primary/10 rounded': dragTarget === segment.path,
                    }"
                >
                    <HomeIcon v-if="index === 0" class="mr-1 h-4 w-4" />
                    <span>{{ segment.name }}</span>
                </button>
                <!-- Drop indicator -->
                <div v-if="dragTarget === segment.path" class="border-primary pointer-events-none absolute inset-0 rounded border-2"></div>
            </div>
            <ChevronRightIcon v-if="index < pathSegments.length - 1" class="text-muted-foreground mx-2 h-4 w-4" />
        </div>
    </nav>
</template>
