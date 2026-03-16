<template>
    <div v-if="log.LLMResponse && !log.expandRow">
        <span class="text-muted-foreground text-sm italic"> Expand to Display </span>
    </div>
    <ul v-else class="results-list list-none p-0">
        <h3 class="font-semibold">Section 1</h3>
        <li v-html="renderMarkdown(log.LLMResponse.LLMResponseSectionOne)"></li>
        <h3 class="mt-2 font-semibold">Section 2</h3>
        <li v-html="renderMarkdown(log.LLMResponse.LLMResponseSectionTwo)"></li>
        <h3 class="mt-2 font-semibold">Section 3</h3>
        <li v-html="renderMarkdown(log.LLMResponse.LLMResponseSectionThree)"></li>
        <h3 class="mt-2 font-semibold">Section 4</h3>
        <li v-html="renderMarkdown(log.LLMResponse.LLMResponseSectionFour)"></li>
    </ul>
</template>

<script setup lang="ts">
    const props = defineProps<{
        log: any
        renderMarkdown: (markdown: string) => string
    }>()

    const { log, renderMarkdown } = props
</script>
