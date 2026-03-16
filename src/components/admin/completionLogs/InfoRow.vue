<template>
    <div class="group flex items-center justify-between gap-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 px-3 py-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800">
        <span class="text-gray-500 dark:text-gray-400 text-xs font-medium shrink-0">{{ label }}</span>
        <div class="flex items-center gap-2 min-w-0 flex-1 justify-end">
            <span
                class="text-gray-900 dark:text-gray-100 text-sm font-mono truncate"
                :title="value"
            >
                {{ value || "(none)" }}
            </span>
            <button
                v-if="copyable && value"
                @click="copy"
                class="cursor-pointer shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title="Copy to clipboard"
            >
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import eventBus from "~/util/eventBus"

const props = defineProps<{
    label: string
    value: string
    copyable?: boolean
}>()

function copy() {
    navigator.clipboard.writeText(props.value)
    eventBus.emit("showToast", {
        _type: "success",
        message: "Copied to clipboard",
    })
}
</script>
