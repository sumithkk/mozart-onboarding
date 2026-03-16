<script setup lang="ts">
    import { onMounted, onUnmounted } from "vue"
    import { XMarkIcon } from "@heroicons/vue/24/outline"

    defineProps<{
        title: string
        isOpen: boolean
    }>()

    const emit = defineEmits<{
        (e: "close"): void
    }>()

    const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            emit("close")
        }
    }

    onMounted(() => {
        document.addEventListener("keydown", handleEscape)
    })

    onUnmounted(() => {
        document.removeEventListener("keydown", handleEscape)
    })
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center">
                <div class="bg-background/50 fixed inset-0 backdrop-blur-sm transition-opacity" @click="emit('close')" />
                <div class="bg-card relative w-full max-w-xl transform overflow-hidden rounded-lg text-left shadow-xl transition-all">
                    <div class="bg-card px-4 pt-5 pb-4 sm:p-6">
                        <div class="mb-4 flex items-center justify-between">
                            <h3 class="text-foreground text-lg font-semibold">{{ title }}</h3>
                            <button @click="emit('close')" class="hover:text-muted-foreground hover:bg-secondary rounded-full p-1">
                                <XMarkIcon class="h-5 w-5" />
                            </button>
                        </div>
                        <slot />
                    </div>
                    <div v-if="$slots.footer" class="bg-input text-secondary px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <slot name="footer" />
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>
