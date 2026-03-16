<script setup lang="ts">
    import { computed } from "vue"
    import BaseModal from "./BaseModal.vue"

    const props = defineProps<{
        file: FileItem
        isOpen: boolean
    }>()

    const emit = defineEmits<{
        (e: "close"): void
        (e: "restore", version: FileVersion): void
    }>()

    const versions = computed(() => props.file.versions || [])

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date)
    }

    const formatSize = (size: number) => {
        const units = ["B", "KB", "MB", "GB"]
        let value = size
        let unitIndex = 0

        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024
            unitIndex++
        }

        return `${value.toFixed(1)} ${units[unitIndex]}`
    }
</script>

<template>
    <BaseModal :title="`Version History - ${file.name}`" :is-open="isOpen" @close="emit('close')">
        <div class="space-y-4">
            <div v-if="versions.length === 0" class="text-muted-foreground py-4 text-center">No version history available</div>
            <div v-else class="space-y-2">
                <div v-for="version in versions" :key="version.id" class="border-border hover:bg-card flex items-center justify-between rounded-lg border p-3 transition-colors duration-200">
                    <div class="space-y-1">
                        <div class="flex items-center space-x-2">
                            <span class="text-foreground text-sm font-medium">Version {{ version.version }}</span>
                            <span class="text-muted-foreground text-xs">{{ formatSize(version.size) }}</span>
                        </div>
                        <div class="text-muted-foreground text-xs">Modified by {{ version.createdBy }} on {{ formatDate(version.createdAt) }}</div>
                        <div v-if="version.comment" class="text-muted-foreground text-sm">
                            {{ version.comment }}
                        </div>
                    </div>
                    <button @click="emit('restore', version)" class="text-primary/60 hover:bg-primary hover:text-foreground rounded-md px-3 py-1 text-sm transition-colors duration-200">Restore</button>
                </div>
            </div>
        </div>
    </BaseModal>
</template>
