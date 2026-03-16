<script setup lang="ts">
    import { ref, watch, onBeforeUnmount } from "vue"
    import mammoth from "mammoth"

    const props = defineProps<{
        fileUrl: string
    }>()

    const docContent = ref("")
    const isLoading = ref(false)
    const isDocx = ref(false)
    const isDoc = ref(false)
    const iframeSrc = ref("")
    const iframeKey = ref(0) // forces iframe reload when url changes

    let controller: AbortController | null = null

    function resetState() {
        isLoading.value = true
        isDocx.value = false
        isDoc.value = false
        docContent.value = ""
        iframeSrc.value = ""
    }

    function withCacheBuster(url: string) {
        if (!url) return url
        const u = new URL(url, window.location.origin)
        // Helps if the same URL points to new content
        u.searchParams.set("_ts", Date.now().toString())
        return u.toString()
    }

    async function loadDocFile(url: string) {
        resetState()

        // Abort any in-flight fetch if fileUrl flips quickly
        if (controller) controller.abort()
        controller = new AbortController()

        try {
            // Use 'no-store' to avoid stale responses if server supports it
            const response = await fetch(withCacheBuster(url), {
                credentials: "include",
                cache: "no-store",
                signal: controller.signal,
            })

            if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)

            const contentType = (response.headers.get("Content-Type") || "").toLowerCase()
            const arrayBuffer = await response.arrayBuffer()

            // .docx (or octet-stream when servers are lazy)
            if (contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document") || contentType === "application/octet-stream") {
                isDocx.value = true
                const result = await mammoth.convertToHtml({ arrayBuffer })
                docContent.value = result.value
            }
            // .doc via Google viewer
            else if (contentType.includes("application/msword")) {
                isDoc.value = true
                const encodedUrl = encodeURIComponent(url)
                // Add a cache-buster for gview as well
                iframeSrc.value = `https://docs.google.com/gview?embedded=true&url=${encodedUrl}&_ts=${Date.now()}`
                iframeKey.value++ // force iframe to re-render
            } else {
                // Fallback by extension (some servers omit proper Content-Type)
                const lower = url.toLowerCase()
                if (lower.endsWith(".docx")) {
                    isDocx.value = true
                    const result = await mammoth.convertToHtml({ arrayBuffer })
                    docContent.value = result.value
                } else if (lower.endsWith(".doc")) {
                    isDoc.value = true
                    const encodedUrl = encodeURIComponent(url)
                    iframeSrc.value = `https://docs.google.com/gview?embedded=true&url=${encodedUrl}&_ts=${Date.now()}`
                    iframeKey.value++
                } else {
                    console.error("Unsupported file type:", contentType || "(missing)")
                }
            }
        } catch (err) {
            if ((err as any).name !== "AbortError") {
                console.error("Error loading file:", err)
            }
        } finally {
            isLoading.value = false
        }
    }

    // react whenever the prop changes (and also on first render)
    watch(
        () => props.fileUrl,
        (url) => {
            if (url) loadDocFile(url)
            else resetState()
        },
        { immediate: true }
    )

    onBeforeUnmount(() => {
        if (controller) controller.abort()
    })
</script>

<template>
    <div ref="fileWrapper" class="relative flex h-full w-full flex-1 items-center justify-center p-4">
        <Loading v-if="isLoading" />
        <div v-else class="h-full w-full overflow-hidden rounded-lg shadow-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
            <!-- .docx -->
            <div v-if="isDocx" v-html="docContent" class="h-full w-full overflow-y-auto p-10 text-neutral-900 dark:text-neutral-100"></div>

            <!-- .doc via Google Viewer -->
            <div v-else-if="isDoc" class="h-full w-full bg-white dark:bg-neutral-800">
                <iframe :key="iframeKey" :src="iframeSrc" class="h-full w-full border-0"></iframe>
            </div>

            <!-- Unsupported -->
            <div v-else class="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                <p>Unsupported file type.</p>
            </div>
        </div>
    </div>
</template>
