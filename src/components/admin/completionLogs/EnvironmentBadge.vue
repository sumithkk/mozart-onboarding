<template>
    <span :class="badgeClass" class="inline-flex rounded-full px-2 py-1 text-xs font-medium">
        {{ displayText }}
    </span>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
    environment: string
}>()

const badgeClass = computed(() => {
    switch (props.environment) {
        case "production":
            return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
        case "staging":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        case "development":
            return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
        default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    }
})

const displayText = computed(() => {
    switch (props.environment) {
        case "production":
            return "Prod"
        case "staging":
            return "Stg"
        case "development":
            return "Dev"
        default:
            return props.environment
    }
})
</script>
