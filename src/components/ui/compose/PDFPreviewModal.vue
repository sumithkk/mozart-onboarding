<template>
    <div v-if="show" class="bg-background bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center" style="z-index: 999">
        <div class="bg-card relative h-[90vh] w-[95vw] rounded-lg shadow-xl sm:h-[80vh] sm:w-[70vw]">
            <!-- Header -->
            <div class="flex items-center justify-between border-b px-3 py-2 sm:px-4 sm:py-3">
                <h3 class="max-w-[80%] truncate text-base font-semibold sm:text-lg">{{ fileName }}</h3>
                <button @click="$emit('update:show', false)" class="text-muted-foreground hover:text-muted-foreground p-1">
                    <span class="materialSymbolsOutlined text-xl sm:text-2xl">close</span>
                </button>
            </div>

            <!-- PDF Viewer -->
            <div class="h-[calc(100%-3.5rem)] w-full sm:h-[calc(100%-4rem)]">
                <iframe :src="pdfUrl" class="h-full w-full" type="application/pdf" frameborder="0"></iframe>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    defineProps({
        show: {
            type: Boolean,
            required: true,
        },
        pdfUrl: {
            type: String,
            required: true,
        },
        fileName: {
            type: String,
            required: true,
        },
    })

    defineEmits(["update:show"])
</script>
