<template>
    <div class="relative h-full w-full">
        <canvas ref="canvasRef" class="h-full w-full object-contain"></canvas>
        <div v-if="isLoading" class="bg-secondary/50 absolute inset-0 flex items-center justify-center">
            <div class="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, watch, onBeforeUnmount } from "vue"
    import type { PDFDocumentProxy } from "pdfjs-dist"
    import { usePDFCache } from "~/composables/usePDFCache"

    const props = defineProps<{
        fileUrl: string
        pageNumber: number
        pdfDocument?: PDFDocumentProxy | null
    }>()

    const canvasRef = ref<HTMLCanvasElement | null>(null)
    const isLoading = ref(true)
    const pdfCache = usePDFCache()
    let currentPdfDocument: PDFDocumentProxy | null = null

    async function loadThumbnail() {
        if (!canvasRef.value) return

        try {
            isLoading.value = true

            // Use provided PDF document or get from cache
            let pdf: PDFDocumentProxy
            if (props.pdfDocument) {
                pdf = props.pdfDocument
            } else {
                pdf = await pdfCache.getPDFDocument(props.fileUrl)
                currentPdfDocument = pdf
            }

            // Get the page
            const page = await pdf.getPage(props.pageNumber)

            // Set up canvas with appropriate scale for thumbnail
            const viewport = page.getViewport({ scale: 0.2 })
            const canvas = canvasRef.value
            const context = canvas.getContext("2d")

            if (!context) return

            canvas.height = viewport.height
            canvas.width = viewport.width

            // Render the page
            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            }

            await page.render(renderContext).promise
            isLoading.value = false
        } catch (error) {
            console.error("Error loading thumbnail:", error)
            isLoading.value = false
        }
    }

    onMounted(() => {
        loadThumbnail()
    })

    onBeforeUnmount(() => {
        // Release reference if we loaded from cache
        if (!props.pdfDocument && currentPdfDocument) {
            pdfCache.releasePDFDocument(props.fileUrl)
        }
    })

    watch(
        () => [props.fileUrl, props.pageNumber, props.pdfDocument],
        () => {
            loadThumbnail()
        }
    )
</script>
