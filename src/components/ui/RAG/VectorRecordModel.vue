<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
        <div class="relative h-2/3 w-full max-w-2xl overflow-y-auto rounded-lg border border-neutral-300 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
            <!-- Header -->
            <header class="sticky top-0 flex items-center justify-between border-b border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Vector Content</h2>
                <button class="rounded-md p-1 text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700" @click="handleClose" aria-label="Close">✕</button>
            </header>

            <!-- Content -->
            <div class="p-3">
                <pre class="rounded-md bg-neutral-100 p-3 text-sm break-words whitespace-pre-wrap text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                    >{{ JSON.stringify(props.data, null, 2) }}
        </pre
                >
            </div>

            <!-- Footer -->
            <footer class="sticky bottom-0 flex justify-end border-t border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                <button class="rounded-md bg-mozart-blue px-4 py-2 text-white hover:bg-mozart-blue-700" @click="handleClose">Close</button>
            </footer>
        </div>
    </div>
</template>
<script lang="ts" setup>
    interface Props {
        data: IRagSearchResults[]
    }

    const props = defineProps<Props>()

    const emit = defineEmits<{
        (e: "closeMode"): void
    }>()

    const handleClose = () => {
        emit("closeMode")
    }
</script>
