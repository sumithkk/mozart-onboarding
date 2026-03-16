<template>
    <div ref="fileWrapper" class="relative flex h-full w-full flex-1 items-center justify-center p-4">
        <Loading v-if="isLoading" />
        <div v-else class="h-full w-full overflow-hidden rounded-lg shadow-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-[#0d1117]">
            <pre class="m-0 h-full w-full overflow-auto p-5 font-mono text-[14px] whitespace-pre-wrap text-neutral-900 dark:text-neutral-100" v-html="highlightedCode"></pre>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from "vue"
    import hljs from "highlight.js"
    import "highlight.js/styles/github-dark.min.css" // Syntax highlighting theme

    const props = defineProps({
        fileUrl: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            required: true,
        },
    })

    const highlightedCode = ref("")
    const isLoading = ref(true)

    async function loadCodeFile() {
        isLoading.value = true
        try {
            const response = await fetch(props.fileUrl, { credentials: "include" })
            const code = await response.text()

            // Map common display names to hljs language names
            const langMap: Record<string, string> = {
                'text': 'plaintext',
                'txt': 'plaintext',
                'python': 'python',
                'javascript': 'javascript',
                'sql': 'sql',
                'json': 'json',
                'html': 'xml',
                'css': 'css',
                'typescript': 'typescript',
                'ts': 'typescript',
                'dockerfile': 'dockerfile'
            }

            const targetLang = langMap[props.fileType.toLowerCase()]
            const highlighted = targetLang 
                ? hljs.highlight(code, { language: targetLang }).value
                : hljs.highlightAuto(code).value
                
            highlightedCode.value = highlighted
        } catch (error) {
            console.error("Error loading code file:", error)
        } finally {
            isLoading.value = false
        }
    }

    onMounted(() => {
        loadCodeFile()
    })
</script>
