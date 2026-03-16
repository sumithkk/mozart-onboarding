<script setup lang="ts">
    import { ref, computed } from "vue"
    import { ArrowUpTrayIcon, CheckIcon } from "@heroicons/vue/24/outline"
    import { useFolderDrop } from "@/composables/useFolderDrop"

    const MAX_FILE_SIZE = 50 * 1024 * 1024

    const props = defineProps<{
        multiple?: boolean
        accept?: string
        maxSize?: number
        uploadProgressMap?: Map<string, { percentage: number; state: "uploading" | "completed" | "error" }>
        intent: "file" | "folder"
    }>()

    const emit = defineEmits<{
        (e: "upload", files: File[]): void
    }>()

    const isDragging = ref(false)
    const fileInput = ref<HTMLInputElement | null>(null)
    const selectedFiles = ref<File[]>([])
    const errors = ref<string[]>([])
    const uploadProgressMap = computed(() => props.uploadProgressMap || new Map())
    const maxFileSize = computed(() => props.maxSize || MAX_FILE_SIZE)

    const folderInput = ref<HTMLInputElement | null>(null)
    const intent = computed(() => props.intent)
    const { extractFilesFromDropEvent } = useFolderDrop()

    const handleDragEnter = (e: DragEvent) => {
        e.preventDefault()
        isDragging.value = true
    }

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault()
        if (!e.relatedTarget || !(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
            isDragging.value = false
        }
    }

    const validateUploadFiles = (files: File[]): File[] => {
        errors.value = []

        if (props.intent === "folder") {
            return files
        }

        const validFiles: File[] = []
        for (const file of files) {
            let hasError = false

            if (file.size > maxFileSize.value) {
                errors.value.push(`${file.name} exceeds the maximum file size of ${formatSize(maxFileSize.value)}`)
                hasError = true
                // return false
            }

            if (!hasError && props.accept) {
                const acceptedTypes = props.accept.split(",").map((type) => type.trim())
                const fileType = file.type || ""
                const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`

                const isAccepted = acceptedTypes.some((type) => fileType.startsWith(type.replace("*", "")) || type.toLowerCase() === fileExtension)

                if (!isAccepted) {
                    hasError = true
                    errors.value.push(`${file.name} is not an accepted file type`)
                    // return false
                }
            }

            if (!hasError) {
                validFiles.push(file)
            }
        }

        return validFiles
    }

    const handleDrop = async (e: DragEvent) => {
        e.preventDefault()
        isDragging.value = false

        const allFiles = props.intent === "folder" ? await extractFilesFromDropEvent(e) : Array.from(e.dataTransfer?.files || [])

        const validFiles = validateUploadFiles(allFiles)
        if (validFiles.length > 0) {
            selectedFiles.value = validFiles
            emit("upload", validFiles)
        }
    }

    const handleFileSelect = (e: Event) => {
        const input = e.target as HTMLInputElement
        const files = Array.from(input.files || [])

        const validFiles = validateUploadFiles(files)
        if (validFiles.length > 0) {
            selectedFiles.value = validFiles
            emit("upload", files)
        }

        if (fileInput.value) {
            fileInput.value.value = ""
        }

        if (folderInput.value) {
            folderInput.value.value = ""
        }
    }

    const removeFile = (index: number) => {
        selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index)
    }
    const removeErrorFile = (index: number) => {
        errors.value = errors.value.filter((_, i) => i !== index)
    }
    const formatSize = (bytes: number): string => {
        const units = ["B", "KB", "MB", "GB"]
        let size = bytes
        let unitIndex = 0
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024
            unitIndex++
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`
    }

    const openFileDialog = () => {
        fileInput.value?.click()
    }
    const openFolderDialog = () => {
        folderInput.value?.click()
    }
    defineExpose({
        openFileDialog,
        openFolderDialog,
    })
</script>

<template>
    <div class="w-full">
        <!-- Upload Area -->
        <div
            data-testid="upload-area-dropzone"
            class="relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 transition-all duration-500 sm:px-6 sm:py-10 md:min-h-[220px]"
            :class="{
                'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl dark:border-blue-500 dark:from-blue-950/50 dark:to-indigo-950/50': isDragging,
                'border-neutral-300 bg-white/80 hover:border-neutral-400 hover:bg-white/90 dark:border-neutral-600 dark:bg-neutral-800/80 dark:hover:bg-neutral-800/90': !isDragging,
            }"
            @dragenter="handleDragEnter"
            @dragover.prevent
            @dragleave="handleDragLeave"
            @drop="handleDrop"
        >
            <!-- Upload Icon -->
            <div class="relative mb-4">
                <div class="rounded-full bg-gradient-to-br from-mozart-blue-100 to-mozart-blue-100 p-4 dark:from-mozart-blue-900/30 dark:to-mozart-blue-900/30">
                    <ArrowUpTrayIcon class="h-8 w-8 text-mozart-blue transition-all duration-300 sm:h-10 sm:w-10 dark:text-mozart-blue-400" />
                </div>
            </div>

            <!-- Content -->
            <div class="space-y-3 text-center">
                <h3 class="text-lg font-semibold text-neutral-700 sm:text-xl dark:text-neutral-100">
                    {{ intent === "folder" ? "Upload your folder" : "Upload your files" }}
                </h3>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Drag & drop your files here or</p>
                <button v-if="intent === 'file'" type="button" @click="openFileDialog" class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-mozart-blue to-mozart-blue px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-mozart-blue-700 hover:to-mozart-blue-700 hover:shadow-xl focus:ring-2 focus:ring-mozart-blue-500 focus:ring-offset-2 focus:outline-none">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    Browse Files
                </button>
                <button v-else type="button" @click="openFolderDialog" class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-mozart-blue to-mozart-blue px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-mozart-blue-700 hover:to-mozart-blue-700 hover:shadow-xl focus:ring-2 focus:ring-mozart-blue-500 focus:ring-offset-2 focus:outline-none">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    </svg>
                    Browse Folder
                </button>
            </div>
            <input id="documentUploadInput" ref="fileInput" type="file" :multiple="multiple" :accept="accept" class="hidden" @change="handleFileSelect" />
            <input ref="folderInput" type="file" class="hidden" webkitdirectory directory @change="handleFileSelect" />
            <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Max size: {{ formatSize(maxFileSize) }}</p>
            <p v-if="intent === 'file' && accept" class="w-full text-center text-xs break-words text-zinc-500 dark:text-zinc-400">Accepted: {{ accept }}</p>
        </div>

        <!-- Errors -->
        <div v-if="errors.length" class="mt-4 max-h-16 space-y-3 overflow-y-auto">
            <div v-for="(error, i) in errors" :key="i" class="flex items-start justify-between gap-2 rounded-md bg-red-100 p-3 text-sm text-red-800 dark:bg-red-800 dark:text-red-100">
                <span class="pr-4">{{ error }}</span>
                <span @click="removeErrorFile(i)" class="cursor-pointer text-xs text-zinc-500 dark:text-zinc-400"> ❌ </span>
            </div>
        </div>

        <!-- File List -->
        <transition-group name="fade" tag="div" :class="['mt-6 space-y-3 overflow-y-auto', errors.length > 0 ? 'max-h-24' : 'max-h-40']">
            <div v-for="(file, i) in selectedFiles" :key="file.name + i" class="group flex items-center justify-between overflow-hidden rounded-xl border border-neutral-200/50 bg-white/80 px-3 py-3 text-xs transition-all duration-200 hover:bg-white/90 hover:shadow-md sm:px-4 sm:text-sm dark:border-neutral-600/50 dark:bg-neutral-700/80 dark:hover:bg-neutral-700/90">
                <div class="flex min-w-0 items-center gap-3">
                    <!-- File type icon -->
                    <div class="flex-shrink-0">
                        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                            <FileIcons :fileType="file.type" class="h-4 w-4" />
                        </div>
                    </div>
                    <div class="flex min-w-0 flex-col">
                        <span class="max-w-[120px] truncate font-medium text-neutral-800 sm:max-w-[200px] dark:text-white">{{ file.name }}</span>
                        <span class="text-xs text-neutral-500 dark:text-neutral-400">{{ formatSize(file.size) }}</span>
                    </div>
                </div>
                <div class="flex min-w-0 items-center gap-2">
                    <!-- Progress bar -->
                    <div v-if="uploadProgressMap.has(file.name) && uploadProgressMap.get(file.name)?.percentage > 0 && uploadProgressMap.get(file.name)?.percentage < 100" class="flex min-w-[60px] flex-col items-end">
                        <div class="hover:bg-foreground/10 flex items-center rounded-lg p-2">
                            <svg class="progress-circle" width="20" height="20" viewBox="0 0 32 32">
                                <circle class="progress-bg" cx="16" cy="16" r="14" fill="none" stroke="#e5e7eb" stroke-width="4" />
                                <circle class="progress-bar" cx="16" cy="16" r="14" fill="none" :stroke="uploadProgressMap.get(file.name)?.percentage < 100 ? '#2563eb' : '#22c55e'" stroke-width="4" stroke-linecap="round" :stroke-dasharray="2 * Math.PI * 14" :stroke-dashoffset="2 * Math.PI * 14 * (1 - uploadProgressMap.get(file.name)?.percentage / 100)" style="transition: stroke-dashoffset 0.3s" />
                            </svg>
                            <!-- <span class="ml-2 text-xs text-neutral-700 dark:text-neutral-200">{{ uploadProgressMap.get(file.name)?.percentage }}%</span> -->
                        </div>
                    </div>
                    <div v-else-if="uploadProgressMap.has(file.name) && uploadProgressMap.get(file.name)?.percentage === 100" class="rounded-full p-1">
                        <CheckIcon v-if="uploadProgressMap.get(file.name)?.state == 'completed'" class="size-5 rounded-full bg-green-600 p-1 text-white" />
                        <svg v-else-if="uploadProgressMap.get(file.name)?.state == 'error'" class="size-5 rounded-full bg-red-600 p-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <svg v-else width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="animate-spin fill-yellow-500 stroke-yellow-500 text-white">
                            <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" />
                        </svg>
                    </div>
                    <!-- Remove file button -->
                    <!-- <button @click="removeFile(i)" class="ml-2 rounded p-1 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 dark:hover:bg-red-800" title="Remove file">
                        <svg class="h-4 w-4 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button> -->
                </div>
            </div>
        </transition-group>
    </div>
</template>
