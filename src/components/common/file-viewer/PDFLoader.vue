<template>
    <VuePDF ref="vuePDFRef" :pdf="pdf" :page="currentPage" :scale="scale" :class="{ 'opacity-0': isLoading }" @text-loaded="onTextLoaded" @loaded="onLoaded" />
</template>

<script setup lang="ts">
    import { ref, watch, onMounted, toRef } from "vue"
    import { VuePDF, usePDF } from "@tato30/vue-pdf"
    import type { PDFDocumentProxy, PDFDocumentLoadingTask } from "pdfjs-dist"

    const props = defineProps({
        fileUrl: {
            type: String,
            required: true,
        },
        currentPage: {
            type: Number,
            default: 1,
        },
        scale: {
            type: Number,
            default: 1,
        },
        containerRef: {
            type: Object as () => HTMLElement | null,
            default: null,
        },
    })

    // Create reactive refs that sync with props
    const currentPage = ref(props.currentPage)
    const scale = toRef(props, "scale")
    const pdfDocument = ref<PDFDocumentProxy | null>(null)

    // Watch for page changes from parent and sync local ref
    watch(
        () => props.currentPage,
        (newPage) => {
            currentPage.value = newPage
        }
    )

    const emit = defineEmits(["progress", "error", "loaded", "text-loaded"])

    const vuePDFRef = ref(null)
    const isLoading = ref(true)

    function onPassword(updatePassword: any, reason: any) {
        console.error(`Reason for callback: ${reason}`)
        updatePassword("password1234")
    }

    function onProgress({ loaded, total }: { loaded: number; total: number }) {
        const progress = (loaded / total) * 100
        emit("progress", { loaded, total, progress })
    }

    function onError(reason: any) {
        console.error(`PDF loading error: ${reason}`)

        let errorMessage = ""
        // Provide user-friendly error messages
        if (typeof reason === "string") {
            if (reason.includes("404") || reason.includes("Not Found")) {
                errorMessage = "The PDF file could not be found. It may have been moved or deleted."
            } else if (reason.includes("403") || reason.includes("Forbidden")) {
                errorMessage = "You don't have permission to access this PDF file."
            } else if (reason.includes("network") || reason.includes("fetch")) {
                errorMessage = "Network error. Please check your internet connection and try again."
            } else if (reason.includes("cors") || reason.includes("CORS")) {
                errorMessage = "Unable to load PDF due to security restrictions."
            } else if (reason.includes("password") || reason.includes("encrypted")) {
                errorMessage = "This PDF is password protected or encrypted."
            } else {
                errorMessage = reason
            }
        } else {
            errorMessage = "An unexpected error occurred while loading the PDF."
        }

        emit("error", errorMessage)
    }

    const { pdf, pages, print } = usePDF({ url: props.fileUrl, enableXfa: false, disableStream: true, disableRange: false, rangeChunkSize: 64 * 1024 }, { onPassword, onProgress, onError })

    function onTextLoaded(value: any) {
        emit("text-loaded", value)
    }

    onMounted(async () => {
        try {
            if (pdf.value) {
                pdfDocument.value = await (pdf.value as PDFDocumentLoadingTask).promise
            }
        } catch (error) {
            console.error("Error loading PDF document:", error)
            emit("error", "Failed to load PDF document")
        }
    })

    function onLoaded() {
        isLoading.value = false
        emit("loaded", { pdf: pdfDocument.value, pages: pages.value })
    }

    // Expose print function to parent
    defineExpose({
        print: () => print(),
        pdfDocument,
        pages,
    })
</script>
