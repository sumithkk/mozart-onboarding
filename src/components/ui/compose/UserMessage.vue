<template>
    <div class="user-message-content">
        <div data-artifact="text" class="generated-html-container msg-html" v-html="formattedContent"></div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch } from "vue"
    import { marked } from "marked"
    import DOMPurify from "dompurify"

    const props = defineProps({
        content: {
            type: String,
            required: true,
        },
    })

    // Create a simple renderer for user messages
    const userRenderer = new marked.Renderer()

    // Customize the renderer for better user message formatting
    userRenderer.paragraph = (text) => {
        return `<p class="mb-2 last:mb-0 ">${text}</p>`
    }

    userRenderer.heading = (text, level) => {
        const sizes = {
            1: "text-xl",
            2: "text-lg",
            3: "text-base",
            4: "text-sm",
            5: "text-xs",
            6: "text-xs",
        }
        return `<h${level} class="${sizes[level as keyof typeof sizes]} font-semibold mb-2">${text}</h${level}>`
    }

    userRenderer.strong = (text) => {
        return `<strong class="font-semibold">${text}</strong>`
    }

    userRenderer.em = (text) => {
        return `<em class="italic">${text}</em>`
    }

    userRenderer.codespan = (code) => {
        return `<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">${code}</code>`
    }

    userRenderer.code = (code, language) => {
        return `<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto my-2"><code class="text-sm font-mono">${code}</code></pre>`
    }

    userRenderer.link = (href, title, text) => {
        return `<a href="${href}" class="text-mozart-blue dark:text-mozart-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">${text}</a>`
    }

    userRenderer.list = (body, ordered) => {
        const tag = ordered ? "ol" : "ul"
        const className = ordered ? "list-decimal list-inside" : "list-disc list-inside"
        return `<${tag} class="${className} mb-2">${body}</${tag}>`
    }

    userRenderer.listitem = (text) => {
        return `<li class="mb-1">${text}</li>`
    }

    userRenderer.blockquote = (quote) => {
        return `<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 italic text-gray-700 dark:text-gray-300">${quote}</blockquote>`
    }

    // Simple marked configuration for user messages
    const userMarkedOptions = {
        renderer: userRenderer,
        gfm: true,
        breaks: true,
        sanitize: false, // We'll handle sanitization separately
    }

    const formattedContent = computed(() => {
        if (!props.content) return ""

        // Parse with marked
        const htmlContent = marked(props.content, userMarkedOptions) as string

        // Sanitize the HTML for security
        return DOMPurify.sanitize(htmlContent, {
            ALLOWED_TAGS: ["p", "br", "strong", "em", "code", "pre", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"],
            ALLOWED_ATTR: ["href", "target", "rel", "class"],
            ALLOW_DATA_ATTR: false,
        })
    })
</script>
