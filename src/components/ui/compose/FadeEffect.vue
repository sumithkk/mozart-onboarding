<template>
    <div class="generated-html generated-html-container bg-surfaceColor">
        <div v-for="(block, index) in blocks" :key="index" :class="['text-textColor', streamingDelay !== 0 ? 'animate-blur-fade-in opacity-0 blur-sm' : '']" :style="{ animationDelay: `${index * streamingDelay}ms` }" v-html="block" />
    </div>
</template>

<script setup>
    import { computed } from "vue"
    import { marked } from "marked"

    const props = defineProps({
        markdown: {
            type: String,
            required: true,
        },
        renderer: {
            type: Object,
            required: true,
        },
        defaults: {
            type: Object,
            required: true,
        },
        messageStatus: {
            type: String,
            required: true,
        },
    })

    // Parse markdown into HTML blocks
    const blocks = computed(() => {
        const tokens = marked.lexer(props.markdown, props.defaults)
        return tokens.map((token) => marked.parser([token], { renderer: props.renderer }))
    })

    // Delay for streaming animation
    const streamingDelay = computed(() => {
        const status = props.messageStatus
        if (status === "sent" || status === "finished_with_error" || status === "finished_successfully") {
            return 0
        }
        return props.markdown.length < 10000 ? 4000 : 300
    })
</script>
