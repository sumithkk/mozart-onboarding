<template>
    <div v-if="show" class="bg-background/50 fixed inset-0 z-[1010] flex items-center justify-center backdrop-blur-[2px]">
        <div class="bg-backgroundColor text-textColor m-[15px] flex h-[62vh] w-[50vw] flex-col rounded-md p-5 shadow-[0_4px_10px_rgba(0,0,0,0.3)]" @click.stop>
            <!-- Header with title and close button -->
            <div class="mb-5 flex flex-row items-center justify-between pt-[10px] pb-[10px]">
                <h2 class="text-xl">Upload your files here</h2>
                <div class="cursor-pointer text-2xl" @click="cleanupAndClose">
                    <div class="materialSymbolsOutlined">close</div>
                </div>
            </div>

            <!-- Main content area: file upload + file list + actions -->
            <div class="flex h-[90%] flex-col items-center justify-start gap-5">
                <!-- File drop area -->
                <div class="flex h-[50%] w-[90%] flex-col items-center justify-center gap-5">
                    <div class="border-strokeColor text-textColor flex h-[250px] w-full flex-col items-center justify-center gap-5 rounded border-2 border-dashed" @dragover.prevent @drop.prevent="handleFileDrop">
                        <!-- Placeholder if no files have been selected yet -->
                        <div class="flex h-full w-full flex-row items-center justify-center gap-2" v-if="filesToUpload.length === 0">
                            <div class="materialSymbolsOutlined text-3xl">cloud_upload</div>
                            <p class="text-xl">
                                Drag &amp; Drop or
                                <a href="#" @click.prevent="triggerFileInputClick" class="text-logoColor cursor-pointer"> Browse </a>
                            </p>
                        </div>
                    </div>
                </div>

                <!-- File list -->
                <div class="flex h-[33%] w-[90%] flex-col items-start justify-start gap-2 overflow-y-scroll">
                    <div v-for="(fileObject, index) in selectedDocuments" :key="index" class="bg-Mgray text-textColor flex w-full flex-row items-center justify-start gap-2 rounded py-2" :class="{ 'bg-uploadedFileColor': fileObject.isUploaded }">
                        <!-- File info -->
                        <div class="flex w-full flex-row items-center justify-start gap-2 px-2">
                            <div class="fileName">
                                {{ trimFileName(fileObject.file.name) }}
                            </div>
                            <div class="fileType">
                                {{ convertMimeTypeToType(fileObject.file.type) }}
                            </div>
                            <div class="fileSize">
                                {{ formatBytes(fileObject.file.size) }}
                            </div>
                        </div>

                        <!-- Vectorized icon -->
                        <div v-if="fileObject.isVectorized" class="materialSymbolsFilled" title="Vectorized">mitre</div>

                        <!-- Uploaded icon -->
                        <div v-if="fileObject.isUploaded" class="materialSymbolsFilled" title="Uploaded">upload_file</div>

                        <!-- Loading spinner for uploading or vectorizing -->
                        <div
                            v-if="fileObject.isUploading || fileObject.isVectorizing"
                            class="mx-2 h-4 w-[18px] animate-spin rounded-full border-[3px] border-solid border-[rgba(0,0,0,0.1)]"
                            :class="{
                                'border-l-logoColor': fileObject.isUploading,
                                'border-l-gray2': fileObject.isVectorizing,
                            }"
                            :title="fileObject.isUploading ? 'Uploading' : 'Vectorizing'"
                        ></div>

                        <!-- Remove file icon (only if not uploading/vectorizing) -->
                        <div v-else class="materialSymbolsOutlined cursor-pointer px-2" @click="removeFile(fileObject.file.name)">close</div>
                    </div>
                </div>

                <!-- Action panel: ToggleButton + Done -->
                <div class="flex w-full flex-row items-center justify-end gap-2 p-2">
                    <Switch v-model="canVectorize" :tooltip="'Ennable Vectorization'" :size="'sm'" />
                    Vectorize
                    <div class="button small" @click="cleanupAndClose">Done</div>
                </div>

                <!-- Hidden input for file selection -->
                <input
                    type="file"
                    ref="fileInput"
                    multiple
                    accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv,text/x-python-script,application/x-python-code,application/msword,application/sql,application/x-sql,text/x-sql,application/octet-stream,.sql, text/javascript, text/html, application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    @change="handleFileChange"
                    class="hidden"
                    id="documentUploadInput"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, reactive, computed, defineProps, defineEmits } from "vue"
    import { convertMimeTypeToType, formatBytes } from "~/util"

    const props = defineProps({
        show: Boolean,
    })

    const emit = defineEmits(["update:show"])

    // Stores
    const userStore = useUserStore()
    const ragStore = useRagStore()
    const documentStore = useDocumentsStore()
    const organizationStore = useOrganizationStore()

    // Refs
    const fileInput = ref<HTMLInputElement | null>(null)
    const selectedDocuments = ref<any[]>([])
    const uploadedFiles = ref<any[]>([])
    const filesToUpload = ref<any[]>([])
    const isLoading = ref(false)

    // Vectorization support
    const supportedFileTypesForVectorization = ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream", "text/html", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
    const canVectorize = ref(false)
    const chunkSize = ref<number>(600)
    const batchSize = ref(100)
    const chunkType = ref<string>("char")

    // Computed: Current collection info
    const currentCollectionInfo = computed(() => {
        return ragStore.collections.find((collection) => collection.name === ragStore.currentCollection)
    })

    // Close function
    const emitClose = () => {
        emit("update:show", false)
    }

    // Open file picker
    const triggerFileInputClick = () => {
        if (!fileInput.value) return
        fileInput.value.click()
    }

    // File input change
    const handleFileChange = async (event: Event) => {
        const files = (event.target as HTMLInputElement).files
        if (!files || files.length === 0) return
        isLoading.value = true
        await uploadFiles(files)
        isLoading.value = false
    }

    // Drag-and-drop
    const handleFileDrop = async (event: DragEvent) => {
        const files = event.dataTransfer?.files
        if (!files || files.length === 0) return
        isLoading.value = true
        await uploadFiles(files)
        isLoading.value = false
    }

    // Upload logic
    const uploadFiles = async (files: FileList) => {
        selectedDocuments.value = Array.from(files).map((file) =>
            reactive({
                file,
                isUploading: false,
                isUploaded: false,
                isVectorizing: false,
                isVectorized: false,
            })
        )

        for (const fileObject of selectedDocuments.value) {
            fileObject.isUploading = true

            const data = await useUser().uploadFile(fileObject.file)
            if (data) {
                fileObject.isUploaded = true
                uploadedFiles.value.push(data)

                if (!data.size) {
                    data.size = fileObject.file.size || 1048576
                }

                if (canVectorize.value) {
                    await handleFileVectorization({ file: data, fileObject })
                }
            }

            fileObject.isUploading = false
        }

        await documentStore.fetchDocuments(true)
    }

    // Vectorization logic
    const handleFileVectorization = async (data: any) => {
        const { file, fileObject } = data

        if (!currentCollectionInfo.value) return

        if (file.fileType && supportedFileTypesForVectorization.includes(file.fileType)) {
            fileObject.isVectorizing = true
            const documentId = file.documentId || ""

            await useRag().addFileToVectorizationQueue(file.fileName, file.url, "pdf", file.size, ragStore.currentCollection, currentCollectionInfo.value.alias, "low", currentCollectionInfo.value.distance, currentCollectionInfo.value.embedding, chunkSize.value, chunkType.value, batchSize.value, documentId)

            fileObject.isVectorized = true
            fileObject.isVectorizing = false
        }

        uploadedFiles.value = []
    }

    // Remove file from list
    const removeFile = async (name: string) => {
        const fileToRemove = selectedDocuments.value.find((f) => f.file.name === name)
        if (!fileToRemove) return

        selectedDocuments.value = selectedDocuments.value.filter((f) => f.file.name !== name)

        const uploadedFileToRemove = uploadedFiles.value.find((uploadedFile) => uploadedFile.fileName === name)
        if (!uploadedFileToRemove) return

        uploadedFiles.value = uploadedFiles.value.filter((uploadedFile) => uploadedFile.fileName !== name)

        // Delete from server
        await useUser().deleteDocument(uploadedFileToRemove.documentId, organizationStore.currentOrganizationId)

        // Optionally refetch docs
        await documentStore.fetchDocuments(true)
    }

    // Cleanup on close
    const cleanupAndClose = () => {
        uploadedFiles.value = []
        selectedDocuments.value = []
        canVectorize.value = false
        emitClose()
    }

    // Trim file name if too long
    const trimFileName = (name: string) => {
        if (name.length < 20) return name
        return name.slice(0, 20) + "..."
    }
</script>
