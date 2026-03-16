<template>
    <div v-if="log.tokenUsage">
        <span class="font-bold">Total Tokens: </span>{{ log.tokenUsage.totalTokens }}
        <br />
        <span class="font-bold">Prompt Tokens: </span>{{ log.tokenUsage.promptTokens }}
        <br />
        <span class="font-bold">Response Tokens: </span>{{ log.tokenUsage.responseTokens }}
    </div>
</template>

<script setup lang="ts">
    const props = defineProps<{
        log: any
    }>()
    const { log } = props
</script>
