<template>
    <!-- Only render if there's code -->
    <div v-if="code" class="border-border mb-4 w-full overflow-hidden rounded-lg border">
        <!-- Header with language label and copy button -->
        <div class="bg-secondary flex items-center justify-between px-2 py-1">
            <div class="text-textColor font-bold">
                {{ lang }}
            </div>
            <button class="bg-primary text-secondary hover:bg-primary cursor-pointer rounded-lg border-none px-1 py-0.5 text-xs" @click="copyCode">
                {{ copied ? "Copied" : "Copy Code" }}
            </button>
        </div>

        <div class="p-2">
            <!-- Code content -->
            <pre class="m-0 flex w-full overflow-auto rounded-none border border-none p-4">
        <code
          :class="`language-${lang}`"
          v-html="highlightedCode || code"
          class="whitespace-pre rounded-none"
                ></code>
            </pre>
        </div>
    </div>
</template>

<script setup lang="ts">
    import hljs from "highlight.js"
    import "highlight.js/styles/github-dark.min.css"
    import { computed, ref } from "vue"

    // Props
    const props = defineProps({
        code: {
            type: String,
            required: true,
        },
        lang: {
            type: String,
            required: true,
        },
    })

    // Track if code was just copied
    const copied = ref(false)

    // Copy code to clipboard
    const copyCode = () => {
        copied.value = true
        navigator.clipboard.writeText(props.code)
    }

    // Syntax highlighting logic
    const highlightedCode = computed(() => {
        // If we have a recognized language, highlight; otherwise fallback to auto
        return hljs.highlightAuto(props.code, hljs.getLanguage(props.lang)?.aliases).value || ""
    })
</script>
