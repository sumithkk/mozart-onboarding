<template>
    <span v-if="mcp" :class="badgeClass" class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium">
        <span :class="dotClass" class="h-1.5 w-1.5 rounded-full"></span>
        {{ displayText }}
    </span>
    <span v-else class="text-muted-foreground text-sm">-</span>
</template>

<script setup lang="ts">
import { computed } from "vue"

interface McpToolCall {
    id: string
    name: string
    type: string
    arguments: Record<string, any>
    timestamp: number
    truncated: boolean
}

interface McpData {
    enabled: boolean
    tool_calls?: McpToolCall[]
    tool_choice?: string
}

const props = defineProps<{
    mcp?: McpData | null
}>()

const badgeClass = computed(() => {
    if (!props.mcp) return ""
    return props.mcp.enabled
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
})

const dotClass = computed(() => {
    if (!props.mcp) return ""
    return props.mcp.enabled ? "bg-blue-500" : "bg-gray-500"
})

const displayText = computed(() => {
    if (!props.mcp) return "-"
    if (!props.mcp.enabled) return "Disabled"
    const toolCallCount = props.mcp.tool_calls?.length ?? 0
    return toolCallCount > 0 ? `${toolCallCount} calls` : "Enabled"
})
</script>
