<template>
    <div v-if="_fileUrl" class="border-border bg-card border-border bg-card relative flex h-full flex-1 items-center justify-center rounded-lg border">
        <!-- Vue PDF component -->
        <VuePDF :pdf="pdf" text-layer annotation-layer :page="currentPage" />

        <!-- Page switcher -->
        <div class="bg-background text-foreground absolute bottom-5 z-10 flex items-center space-x-3 rounded-full px-2 py-1 shadow-md select-none">
            <!-- Left arrow -->
            <div @click="pageFlipper(-1)" :disabled="currentPage <= 1" class="flex cursor-pointer items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.74587 12.889L5.67087 8.81401C5.18962 8.33276 5.18962 7.54526 5.67087 7.06401L9.74587 2.98901" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>

            <!-- Page index -->
            <div class="px-2">{{ currentPage }} / {{ totalPages }}</div>

            <!-- Right arrow -->
            <div @click="pageFlipper(1)" :disabled="currentPage >= totalPages" class="flex cursor-pointer items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.76764 12.8889L9.84264 8.81389C10.3239 8.33264 10.3239 7.54514 9.84264 7.06389L5.76764 2.98889" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
        </div>
    </div>

    <!-- Fallback if file doesn't exist -->
    <div v-else class="border-border bg-card border-border bg-card relative flex h-full flex-1 items-center justify-center rounded-lg border">File not found</div>
</template>

<script setup lang="ts">
    import { VuePDF, usePDF } from "@tato30/vue-pdf"
    import "@tato30/vue-pdf/style.css"
    import { ref, watch } from "vue"

    const props = defineProps({
        fileUrl: String,
    })

    // Local refs
    const totalPages = ref(0)
    const currentPage = ref(1)
    const _fileUrl = ref(props.fileUrl)

    // Setup PDF
    const { pdf, pages, info } = usePDF({
        url: _fileUrl.value,
        enableXfa: true,
    })

    // Watch the pages ref to update totalPages
    watch(pages, () => {
        totalPages.value = pages.value
    })

    // Pagination function
    const pageFlipper = (move: number) => {
        const newPage = currentPage.value + move
        if (newPage >= 1 && newPage <= totalPages.value) {
            currentPage.value = newPage
        }
    }
</script>
