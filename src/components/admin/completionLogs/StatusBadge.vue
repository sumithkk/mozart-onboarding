<template>
    <span :class="badgeClass" class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium">
        <span v-if="status === 'success'" class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
        <span v-else-if="status === 'error'" class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
        <span v-else class="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
        {{ displayText }}
    </span>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
    status: string
}>()

const badgeClass = computed(() => {
    switch (props.status) {
        case "success":
            return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        case "error":
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        case "aborted":
            return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    }
})

const displayText = computed(() => {
    return props.status.charAt(0).toUpperCase() + props.status.slice(1)
})
</script>
