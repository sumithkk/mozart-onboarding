<template>
    <div ref="fileWrapper" class="relative flex w-full flex-1 justify-center">
        <!-- Loading spinner -->
        <Loading v-if="isLoading" />

        <div class="bg-white m-[20px] h-[94%] w-[90%] overflow-hidden rounded-[10px] p-[10px] shadow-[0_0_5px_0_rgba(0,0,0,0.6)]">
            <!-- Show iframe if content is successfully loaded -->
            <div v-if="!isLoading && iframeSrc" class="h-full w-full overflow-auto">
                <iframe :src="iframeSrc" class="h-full w-full border-0"></iframe>
            </div>

            <!-- Show unsupported message if iframeSrc is empty after loading -->
            <div v-else-if="!isLoading && !iframeSrc" class="h-full w-full overflow-auto">
                <p>Unsupported file type or error loading file.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from "vue"

    const props = defineProps({
        fileUrl: {
            required: true,
            type: String,
        },
    })

    const isLoading = ref(true)
    const iframeSrc = ref("")

    async function loadPPTFile() {
        try {
            // Use Google Docs Viewer to embed PPT/PPTX
            iframeSrc.value = `https://docs.google.com/gview?url=${props.fileUrl}&embedded=true`
            isLoading.value = false
        } catch (error) {
            console.error("Error loading file:", error)
            isLoading.value = false
            iframeSrc.value = "" // Set to empty on error
        }
    }

    onMounted(() => {
        loadPPTFile()
    })
</script>
