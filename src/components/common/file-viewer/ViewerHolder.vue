<template>
    <!-- Conditionally render a viewer if fileUrl and fileType exist -->
    <div v-if="fileUrl && fileType" class="border-strokeColor bg-midGrey relative flex h-full flex-1 items-center justify-center overflow-hidden rounded-[10px] border">
        <PDFViewerModal v-if="fileType.toLocaleLowerCase() === 'pdf'" :fileUrl="fileUrl" :ragFile="ragFile" :initialPageRange="documentStore.selectedPageRange" :totalPages="documentStore.documentParsedData?.numberOfPages || 0" :totalTokens="documentStore.documentParsedData?.totalTokens || 0" :documentParsedData="documentStore.documentParsedData || {}" @pageRangeChange="handlePageRangeChange" />
        <CSVViewer v-else-if="['csv', 'xlsx', 'xls'].includes(fileType.toLowerCase())" :fileUrl="fileUrl" :initialPageRange="documentStore.selectedPageRange" :totalPages="documentStore.documentParsedData?.numberOfPages || 0" :totalTokens="documentStore.documentParsedData?.totalTokens || 0" :documentParsedData="documentStore.documentParsedData || {}" @pageRangeChange="handlePageRangeChange" />
        <ImageViewer v-else-if="fileType.toLocaleLowerCase() === 'image'" :fileUrl="fileUrl" />
        <DocViewer v-else-if="['doc', 'docx'].includes(fileType.toLowerCase())" :fileUrl="fileUrl" />
        <CodeViewer v-else-if="codeFileTypes.includes(fileType.toLocaleLowerCase())" :fileUrl="fileUrl" :fileType="fileType" />
        <HTMLViewer v-else-if="fileType.toLocaleLowerCase().includes('html') || fileType.toLocaleLowerCase() === 'html'" :fileUrl="fileUrl" />
        <PPTXViewer v-else-if="fileType.toLocaleLowerCase().includes('ppt')" :fileUrl="fileUrl" />
    </div>

    <!-- Fallback if fileUrl/fileType are not provided or unknown -->
    <div v-else class="border-strokeColor bg-midGrey relative flex h-full flex-1 items-center justify-center overflow-scroll rounded-[10px] border">
        <ComponentLoading v-if="isLoading || documentStore.isLoading || documentStore.isProcessing" />
        <span v-else>File not found</span>
    </div>
</template>
<script setup lang="ts">
    const documentStore = useDocumentsStore()
    const props = defineProps({
        fileUrl: String,
        fileType: String,
        ragFile: Boolean,
        isLoading: {
            type: Boolean,
            default: false,
        },
    })
    const codeFileTypes = ["sql", "python", "javascript", "text", "json", "typescript", "ts", "dockerfile", "yaml", "yml", "md", "markdown", "toml", "env"]

    // Handle page range changes from PDFViewerModal
    const handlePageRangeChange = (newRange: [number, number]) => {
        documentStore.selectedPageRange = newRange
    }
</script>
