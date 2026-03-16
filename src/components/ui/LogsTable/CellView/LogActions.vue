<template>
    <div class="log-actions flex">
        <VTooltip>
            <div class="log-action-button cursor-pointer">
                <div class="materialSymbolsOutlined px-1 text-lg" @click="deleteLog(log.logId)">delete</div>
            </div>
            <template #popper>Delete</template>
        </VTooltip>
        <VTooltip>
            <div class="log-action-button cursor-pointer">
                <div class="materialSymbolsOutlined px-1 text-lg" @click="log.expandRow = !log.expandRow">{{ log.expandRow ? "collapse_all" : "expand" }}</div>
            </div>
            <template #popper>{{ log.expandRow ? "Collapse" : "Expand" }}</template>
        </VTooltip>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps<{
        log: any
        deleteLog: (logId: string) => void
    }>()

    const { log, deleteLog } = props
</script>
