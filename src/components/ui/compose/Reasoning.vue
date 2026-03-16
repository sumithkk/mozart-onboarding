<template>
    <div
        class="border-border flex h-full flex-col overflow-hidden rounded-lg border"
        :class="{
            'fixed inset-0 z-50': expanded,
            'rounded-none': expanded,
        }"
    >
        <div class="bg-white flex items-center justify-between rounded-t-lg p-2">
            <div class="flex items-center">
                <div class="materialSymbolsOutlined mr-2">psychology</div>
                <div class="font-medium">Reasoning</div>
            </div>
            <div class="flex">
                <div class="materialSymbolsOutlined cursor-pointer" @click="copyContent">content_copy</div>
                <div class="materialSymbolsOutlined ml-2 cursor-pointer" @click="toggleClose">close</div>
            </div>
        </div>
        <div
            class="bg-border overflow-auto rounded-b-lg p-4"
            :class="{
                'h-full max-h-[calc(100vh-200px)]': !isSplitView && !expanded,
                'h-[calc(100vh-150px)]': isSplitView && !expanded,
                'max-h-[calc(100vh-50px)]': expanded,
            }"
        >
            <div v-if="tokens.length > 0" class="prose prose-dark max-w-none" style="color: var(--text-color)">
                <div v-for="(token, index) in tokens" :key="index" class="mb-2 font-mono whitespace-pre-wrap">
                    <div class="prose prose-dark max-w-none" style="color: var(--text-color)" v-html="marked.parse(token.raw, { ...defaults, gfm: true, breaks: true, renderer })"></div>
                </div>
            </div>
            <div v-else class="text-muted-foreground text-center">No thinking tokens available yet...</div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { marked } from "marked"
    import { sanitizeResponseContent } from "../../../util/index"

    const emit = defineEmits(["toggleClose"])
    const props = defineProps({
        messageId: {
            type: String,
            required: true,
        },
        isSplitView: {
            type: Boolean,
            default: false,
        },
    })

    const tokens = computed(() => marked.lexer(sanitizeResponseContent(messageStore.messagesTree[props.messageId].content.thinking.text)))

    const { extensions, ...defaults } = marked.getDefaults()

    // Code syntax / inline code customizations
    const renderer = new marked.Renderer()
    const messageStore = useMessageStore()

    const expanded = ref(false)

    const toggleClose = () => {
        emit("toggleClose")
    }

    const copyContent = async () => {
        const content = messageStore.messagesTree[props.messageId].content.thinking.text

        try {
            await navigator.clipboard.writeText(content)
            console.log("Thinking tokens copied to clipboard")
        } catch (err) {
            console.error("Failed to copy thinking tokens:", err)
        }
    }

    /** On change of tokens, re-attach link click handlers */
    watch(tokens, async () => {
        await nextTick()
    })
</script>
