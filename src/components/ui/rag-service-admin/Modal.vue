<template>
    <div class="bg-background/50 fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-sm" @click.self="onClose">
        <div :class="size" class="border-border bg-card m-4 max-h-[90%] overflow-scroll rounded-xl border shadow-lg">
            <!-- Header -->
            <div class="border-border bg-card sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3">
                <h3 class="text-foreground text-lg font-bold">
                    {{ title }}
                </h3>
                <button v-if="closeable" @click="onClose" class="text-muted-foreground hover:bg-secondary inline-flex items-center justify-center rounded-full p-2 focus:outline-none">
                    <svg class="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span class="sr-only">Close</span>
                </button>
            </div>

            <!-- Body -->
            <div class="p-4">
                <slot />
            </div>

            <!-- Footer -->
            <div class="border-border bg-card sticky bottom-0 z-10 flex items-center justify-end gap-x-2 border-t px-4 py-3">
                <slot name="footer">
                    <button v-if="closeable" @click="onClose" class="bg-card text-foreground hover:bg-secondary rounded-lg px-4 py-2 text-sm font-medium">Close</button>
                    <button v-for="action in actionButtons" :key="action.key" :class="action.classes" @click="onAction(action.key)">
                        {{ action.text }}
                    </button>
                </slot>
            </div>
        </div>
    </div>
</template>

<script setup>
    const props = defineProps({
        title: String,
        actionButtons: Array,
        size: String,
        closeable: Boolean,
    })

    const emit = defineEmits(["close", "action"])

    function onClose() {
        emit("close")
    }
    function onAction(key) {
        emit("action", key)
    }
</script>
