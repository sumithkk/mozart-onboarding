<template>
    <div ref="fileWrapper" class="relative flex h-full w-full flex-1 flex-col items-center justify-center p-4 min-h-[50vh] md:min-h-0 bg-white dark:bg-[#1e1e1e]" :class="{ 'fullscreen-mode': isFullscreen }">
        <Loading v-if="isLoading" />
        <!-- Concise security status -->
        <div v-if="!isLoading" class="mb-4 w-full max-w-4xl">
            <div class="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 dark:border-green-800 dark:bg-green-900/20">
                <span class="material-symbols-outlined text-base text-green-600">verified_user</span>
                <span class="text-sm text-green-800 dark:text-green-200">
                    Safe rendering • Scripts blocked • External CSS/images allowed
                </span>
            </div>
        </div>

        <div v-if="!isLoading" class="flex h-full w-full flex-col overflow-hidden rounded-lg shadow-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900 min-h-[40vh] md:min-h-0">
            <!-- Toolbar for HTML viewer -->
            <div class="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-800">
                <div class="flex items-center gap-2">
                </div>
                <div class="flex items-center gap-1">
                    <button 
                        @click="toggleViewMode" 
                        class="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-neutral-600 transition-all hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700"
                        :title="viewMode === 'rendered' ? 'Show HTML Source' : 'Show Rendered HTML'"
                    >
                        <span class="material-symbols-outlined text-lg">{{ viewMode === 'rendered' ? 'code' : 'visibility' }}</span>
                        <span>{{ viewMode === 'rendered' ? 'Source' : 'Render' }}</span>
                    </button>
                    <div class="mx-1 h-4 w-px bg-neutral-300 dark:bg-neutral-600"></div>
                    <button 
                        @click="downloadHtml" 
                        class="rounded-md p-1.5 text-sm text-neutral-600 transition-all hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700"
                        aria-label="Download HTML"
                        title="Download HTML file"
                    >
                        <span class="material-symbols-outlined text-lg">download</span>
                    </button>
                    <div class="mx-1 h-4 w-px bg-neutral-300 dark:bg-neutral-600"></div>
                    <button 
                        @click="toggleFullscreen" 
                        class="rounded-md p-1.5 text-sm text-neutral-600 transition-all hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700"
                        :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
                    >
                        <span class="material-symbols-outlined text-lg">{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</span>
                    </button>
                </div>
            </div>

            <!-- Content container for either rendering or source -->
            <div class="html-viewer-content relative flex-1 overflow-hidden bg-white dark:bg-[#0d1117]">
                <iframe
                    v-if="viewMode === 'rendered'"
                    ref="htmlFrame"
                    :src="iframeUrl"
                    class="html-content-frame h-full w-full border-0"
                    sandbox="allow-same-origin"
                    title="HTML file preview (safe full rendering - sanitized)"
                ></iframe>
                <div v-else class="h-full w-full overflow-hidden">
                    <pre class="m-0 h-full w-full overflow-auto p-5 font-mono text-[13px] md:text-[14px] whitespace-pre-wrap text-neutral-900 dark:text-neutral-100" v-html="highlightedSource"></pre>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed, watch, onBeforeUnmount } from "vue"
    import DOMPurify from 'dompurify'
    import hljs from "highlight.js"
    import "highlight.js/styles/github-dark.min.css"

    const props = defineProps({
        fileUrl: {
            type: String,
            required: true,
        },
    })

    const htmlContent = ref("")
    const htmlFrame = ref<HTMLIFrameElement | null>(null)
    const isLoading = ref(true)
    const fileSize = ref(0)
    const iframeUrl = ref("")
    const viewMode = ref<'rendered' | 'source'>('rendered')
    const isFullscreen = ref(false)
    const fileWrapper = ref<HTMLElement | null>(null)

    function toggleViewMode() {
        viewMode.value = viewMode.value === 'rendered' ? 'source' : 'rendered'
    }

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                const el = fileWrapper.value
                if (el?.requestFullscreen) {
                    await el.requestFullscreen()
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen()
                }
            }
        } catch (error) {
            console.error("Error toggling fullscreen:", error)
        }
    }

    function handleFullscreenChange() {
        isFullscreen.value = !!document.fullscreenElement
    }

    const highlightedSource = computed(() => {
        if (!htmlContent.value) return ""
        return hljs.highlight(htmlContent.value, { language: 'xml' }).value
    })

    // Show warning for HTML files larger than 500KB
    const showLargeFileWarning = computed(() => fileSize.value > 500 * 1024)

    // Detect if HTML has external resources (for security notice)
    const hasExternalResources = computed(() => {
        if (!htmlContent.value) return false
        const lower = htmlContent.value.toLowerCase()
        return (
            lower.includes('src="http') || 
            lower.includes("src='http") ||
            lower.includes('href="http') || 
            lower.includes("href='http") ||
            lower.includes('<link') ||
            lower.includes('<script')
        )
    })

    // Helper function to make links safe
    const makeLinksSecure = (node: Element) => {
        if (node.tagName !== 'A') return
        
        const href = node.getAttribute('href')
        if (!href) return
        
        // Force links to open in new tab with security attributes
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
    }

    // Helper function to disable forms
    const disableForms = (node: Element) => {
        if (node.tagName !== 'FORM') return
        
        // Remove submission capability
        node.removeAttribute('action')
        node.removeAttribute('method')
        
        // Visual indicator
        const formElement = node as HTMLElement
        formElement.style.opacity = '0.7'
        formElement.style.filter = 'grayscale(30%)'
        node.setAttribute('title', 'Form submission is disabled for security')
    }

    // Helper function to disable interactive elements
    const disableInteractiveElements = (node: Element) => {
        const interactiveTags = ['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT']
        if (!interactiveTags.includes(node.tagName)) return
        
        node.setAttribute('disabled', 'disabled')
        ;(node as HTMLElement).style.cursor = 'not-allowed'
    }

    // Sanitize HTML content with DOMPurify for safe full rendering
    const sanitizeHtmlContent = computed(() => {
        if (!htmlContent.value) return ""
        
        try {
            // DOMPurify configuration
            const config = {
                ALLOW_UNKNOWN_PROTOCOLS: false,
                ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
                ALLOW_DATA_ATTR: true,
                FORBID_TAGS: ['script', 'noscript', 'iframe', 'object', 'embed', 'applet', 'base'],
                FORBID_ATTR: [
                    'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 
                    'onmouseenter', 'onmouseleave', 'onfocus', 'onblur', 'onchange', 
                    'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress'
                ],
                KEEP_CONTENT: true,
                RETURN_DOM: false,
                RETURN_DOM_FRAGMENT: false,
                RETURN_DOM_IMPORT: false,
                ADD_ATTR: ['target', 'rel'],
            }
            
            // Add security hooks
            DOMPurify.addHook('afterSanitizeAttributes', (node: Element) => {
                try {
                    makeLinksSecure(node)
                    disableForms(node)
                    disableInteractiveElements(node)
                } catch (error) {
                    console.error('Error in DOMPurify hook:', error)
                }
            })
            
            // Sanitize the HTML
            const cleaned = DOMPurify.sanitize(htmlContent.value, config)
            
            // Clean up hooks
            DOMPurify.removeAllHooks()
            
            return cleaned
        } catch (error) {
            console.error('Error sanitizing HTML:', error)
            // Return safe error HTML
            return `
                <div style="padding: 20px; border: 2px solid #ef4444; background: #fef2f2; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #dc2626;">Sanitization Error</h3>
                    <p style="margin: 0; color: #991b1b;">Failed to safely process this HTML file. Please download it to view.</p>
                </div>
            `
        }
    })

    // Wrap HTML content to prevent it from leaking out of the iframe
    const wrappedHtmlContent = computed(() => {
        try {
            const sanitized = sanitizeHtmlContent.value
            if (!sanitized) return ""
            
            // Check if the HTML already has DOCTYPE, html, head, body tags
            const hasHtmlStructure = sanitized.toLowerCase().includes('<!doctype') || 
                                     sanitized.toLowerCase().includes('<html')
            
            if (hasHtmlStructure) {
                return sanitized
            }
            
            // Wrap fragments in proper HTML structure
            return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            width: 100%;
            height: 100%;
            overflow: auto;
        }
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    ${sanitized}
</body>
</html>
            `.trim()
        } catch (error) {
            console.error('Error wrapping HTML content:', error)
            return `
<!DOCTYPE html>
<html>
<body style="padding: 20px; background: #fef2f2;">
    <h3 style="color: #dc2626;">Error Processing HTML</h3>
    <p style="color: #991b1b;">Unable to display this HTML file safely.</p>
</body>
</html>
            `
        }
    })

    // Create blob URL when wrapped content changes
    watch(wrappedHtmlContent, (newContent) => {
        try {
            // Clean up old blob URL
            if (iframeUrl.value) {
                URL.revokeObjectURL(iframeUrl.value)
            }
            
            if (newContent) {
                const blob = new Blob([newContent], { type: 'text/html' })
                iframeUrl.value = URL.createObjectURL(blob)
            }
        } catch (error) {
            console.error('Error creating blob URL:', error)
            iframeUrl.value = ''
        }
    })

    async function loadHtmlFile() {
        isLoading.value = true
        try {
            let fetchUrl = props.fileUrl
            
            if (!fetchUrl.startsWith('http://') && !fetchUrl.startsWith('https://')) {
                console.log('Using relative URL for HTML file:', fetchUrl)
            }
            
            const response = await fetch(fetchUrl, { 
                credentials: "include",
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            })
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            const html = await response.text()
            fileSize.value = new Blob([html]).size
            htmlContent.value = html
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            console.error("Error loading HTML file:", error)
            
            htmlContent.value = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { 
                            font-family: system-ui, -apple-system, sans-serif; 
                            padding: 20px; 
                            background: #fef2f2;
                        }
                        .error { 
                            color: #dc2626; 
                            background: white; 
                            border: 2px solid #fecaca; 
                            padding: 20px; 
                            border-radius: 8px; 
                            max-width: 600px;
                            margin: 40px auto;
                        }
                        h3 { margin-top: 0; }
                        code { 
                            background: #f3f4f6; 
                            padding: 2px 6px; 
                            border-radius: 4px; 
                            font-size: 0.9em;
                        }
                    </style>
                </head>
                <body>
                    <div class="error">
                        <h3>Error Loading HTML File</h3>
                        <p><strong>Error:</strong> ${errorMessage}</p>
                        <p><small>File URL: <code>${props.fileUrl}</code></small></p>
                    </div>
                </body>
                </html>
            `
        } finally {
            isLoading.value = false
        }
    }

    async function downloadHtml() {
        try {
            const response = await fetch(props.fileUrl, { credentials: "include" })
            if (!response.ok) {
                throw new Error(`Failed to download: ${response.statusText}`)
            }
            
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = "document.html"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Failed to download HTML:", error)
            alert('Failed to download the HTML file. Please try again.')
        }
    }

    function openInNewWindow() {
        try {
            const newWindow = window.open('', '_blank', 'noopener,noreferrer')
            
            if (newWindow) {
                newWindow.document.open()
                newWindow.document.write(htmlContent.value)
                newWindow.document.close()
                newWindow.document.title = 'HTML Preview - Full Rendering'
            } else {
                alert('Please allow popups to view the full HTML rendering.')
            }
        } catch (error) {
            console.error("Error opening new window:", error)
            alert('Failed to open the HTML in a new window.')
        }
    }

    onMounted(() => {
        loadHtmlFile()
        document.addEventListener("fullscreenchange", handleFullscreenChange)
    })

    onBeforeUnmount(() => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange)
        try {
            if (iframeUrl.value) {
                URL.revokeObjectURL(iframeUrl.value)
            }
        } catch (error) {
            console.error("Error cleaning up blob URL:", error)
        }
    })
</script>

<style scoped>
    /* Ensure iframe takes full height and is properly contained */
    .html-viewer-content {
        contain: layout style paint;
        isolation: isolate;
    }
    
    .html-content-frame {
        min-height: 0;
        display: block;
        contain: strict;
    }

    .fullscreen-mode {
        padding: 0 !important;
    }
    
    .fullscreen-mode > div {
        border-radius: 0 !important;
        border: none !important;
    }
</style>
