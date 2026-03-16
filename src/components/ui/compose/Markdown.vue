<template>
    <div v-html="formattedContent"></div>
</template>

<script setup lang="ts">
    import { ref, watchEffect } from "vue"

    // Props for receiving raw text
    const props = defineProps({
        rawText: String,
    })

    const formattedContent = ref("")

    watchEffect(() => {
        formattedContent.value = formatAndDisplayContent(props.rawText)
    })

    function formatAndDisplayContent(rawText: any) {
        if (!rawText) return ""

        // Split the text into lines for processing
        const lines = rawText.split("\n")
        let formattedContent = ""
        let inCodeBlock = false
        let codeContent = ""
        let language = ""

        lines.forEach((line: any) => {
            if (line.startsWith("```") && inCodeBlock) {
                // End of code block
                formattedContent += createCodeBlockHTML(codeContent, language)
                codeContent = ""
                inCodeBlock = false
                language = ""
            } else if (line.startsWith("```")) {
                // Start of code block
                inCodeBlock = true
                language = line.replace("```", "").trim() // Capture the language
            } else if (inCodeBlock) {
                codeContent += line + "\n"
            } else {
                // Regular text
                formattedContent += `<p class="my-2">${line}</p>`
            }
        })

        return formattedContent
    }

    function createCodeBlockHTML(code: any, language: any) {
        return `
      <div class="overflow-hidden rounded-lg bg-background mb-4">
        <div class="flex items-center justify-between bg-secondary px-4 py-2 border-b border-border/10">
          <div class="font-semibold text-foreground">${language}</div>
          <button
            class="relative cursor-pointer bg-primary text-foreground px-3 py-1 rounded-md text-xs"
            onclick="navigator.clipboard.writeText(${JSON.stringify(code)})"
          >
            Copy
          </button>
        </div>
        <pre class="p-4 overflow-auto text-foreground text-sm"><code>${escapeHTML(code)}</code></pre>
      </div>
    `
    }

    function escapeHTML(str: string) {
        return str.replace(/[&<>'"]/g, (tag) => {
            const map: Record<string, string> = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;",
            }
            return map[tag] || tag
        })
    }
</script>
