<template>
    <span :class="badgeClasses" class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
        <span v-if="showIcon" :class="iconClasses" class="size-2 rounded-full"></span>
        {{ badgeText }}
    </span>
</template>

<script setup lang="ts">
    import { computed } from "vue"

    const props = defineProps<{
        status: string
        showIcon?: boolean
    }>()

    const badgeText = computed(() => {
        switch (props.status) {
            case "pending":
                return "Pending"
            case "running":
                return "Running"
            case "success":
                return "Success"
            case "failed":
                return "Failed"
            case "completed":
                return "Completed"
            default:
                return props.status
        }
    })

    const badgeClasses = computed(() => {
        switch (props.status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
            case "running":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
            case "success":
            case "completed":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            case "failed":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
        }
    })

    const iconClasses = computed(() => {
        switch (props.status) {
            case "pending":
                return "bg-yellow-600 dark:bg-yellow-400"
            case "running":
                return "bg-mozart-blue dark:bg-mozart-blue animate-pulse"
            case "success":
            case "completed":
                return "bg-green-600 dark:bg-green-400"
            case "failed":
                return "bg-red-600 dark:bg-red-400"
            default:
                return "bg-gray-600 dark:bg-gray-400"
        }
    })
</script>
