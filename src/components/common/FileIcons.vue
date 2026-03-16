<template>
    <img :src="iconUrl" :alt="fileType" class="object-contain" :title="fileType" />
</template>

<script setup lang="ts">
    import { computed } from "vue"

    const props = defineProps<{
        fileType: string // MIME type, like "application/pdf"
    }>()

    // Mapping MIME types to icon filenames (from your icons folder)
    const mimeToIconMap: Record<string, string> = {
        // Documents
        "application/pdf": "pdf",
        "application/msword": "microsoft-word",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "microsoft-word",
        "application/vnd.google-apps.document": "microsoft-word",

        // Spreadsheets
        "application/vnd.ms-excel": "microsoft-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "microsoft-excel",
        "text/csv": "microsoft-excel",
        "application/vnd.google-apps.spreadsheet": "microsoft-excel",

        // Presentations
        "application/vnd.ms-powerpoint": "microsoft-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": "microsoft-powerpoint",

        // Archives
        "application/zip": "zip",
        "application/x-rar-compressed": "zip",

        // Text
        "text/plain": "document",
        "text/markdown": "markdown",

        // Code
        "application/javascript": "javascript",
        "application/json": "json",
        "text/html": "html",
        "text/css": "css",
        "application/xml": "xml",

        // Images
        "image/jpeg": "image",
        "image/png": "image",
        "image/gif": "image",
        "image/svg+xml": "image",
        "image/heic": "image",
        "image/heif": "image",

        // Audio/Video
        "audio/mpeg": "audio",
        "video/mp4": "video",

        // Default
        default: "file",
    }

    const iconFileName = computed(() => {
        return mimeToIconMap[props.fileType] || mimeToIconMap.default
    })

    // Dynamic import using import.meta.url
    const iconUrl = computed(() => new URL(`../../assets/icons/${iconFileName.value}.svg`, import.meta.url).href)
</script>
