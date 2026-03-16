<template>
    <div class="relative">
        <button @click="toggleDropdown" :disabled="isExporting" class="bg-secondary hover:bg-secondary/80 text-foreground inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">
            <span v-if="isExporting">Exporting...</span>
            <span v-else>Export</span>
            <svg class="h-4 w-4" :class="{ 'rotate-180': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>

        <div v-if="isOpen" class="border-border bg-card absolute right-0 z-50 mt-2 w-32 rounded-lg border shadow-lg">
            <div class="py-1">
                <button v-for="format in formats" :key="format.value" @click="selectFormat(format.value)" class="hover:bg-secondary text-foreground block w-full px-4 py-2 text-left text-sm">
                    {{ format.label }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"

defineProps<{
    isExporting: boolean
}>()

const emit = defineEmits<{
    export: [format: "json" | "csv" | "xlsx"]
}>()

const isOpen = ref(false)

const formats = [
    { label: "JSON", value: "json" as const },
    { label: "CSV", value: "csv" as const },
    { label: "XLSX", value: "xlsx" as const },
]

function toggleDropdown() {
    isOpen.value = !isOpen.value
}

function selectFormat(format: "json" | "csv" | "xlsx") {
    isOpen.value = false
    emit("export", format)
}

function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (!target.closest(".relative")) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener("click", handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside)
})
</script>
