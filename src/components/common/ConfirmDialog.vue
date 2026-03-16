<template>
    <TransitionRoot :show="show" as="template">
        <Dialog as="div" class="relative z-50" @close="$emit('cancel')">
            <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in duration-200"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <TransitionChild
                        as="template"
                        enter="ease-out duration-300"
                        enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95"
                    >
                        <DialogPanel
                            class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all dark:bg-neutral-900"
                        >
                            <!-- Icon -->
                            <div
                                :class="[
                                    'mx-auto flex h-12 w-12 items-center justify-center rounded-full',
                                    confirmColor === 'danger'
                                        ? 'bg-red-100 dark:bg-red-900/30'
                                        : 'bg-indigo-100 dark:bg-indigo-900/30'
                                ]"
                            >
                                <span
                                    :class="[
                                        'materialSymbolsOutlined text-2xl',
                                        confirmColor === 'danger'
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-indigo-600 dark:text-indigo-400'
                                    ]"
                                >
                                    {{ confirmColor === 'danger' ? 'warning' : 'info' }}
                                </span>
                            </div>

                            <!-- Content -->
                            <div class="mt-4 text-center">
                                <DialogTitle
                                    class="text-lg font-semibold text-gray-900 dark:text-white"
                                >
                                    {{ title }}
                                </DialogTitle>
                                <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                                    {{ message }}
                                </p>
                            </div>

                            <!-- Actions -->
                            <div class="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    @click="$emit('cancel')"
                                    class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    @click="$emit('confirm')"
                                    :disabled="loading"
                                    :class="[
                                        'flex items-center justify-center gap-2 flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all',
                                        confirmColor === 'danger'
                                            ? 'bg-red-600 hover:bg-red-500 disabled:bg-red-400'
                                            : 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400',
                                        loading && 'cursor-not-allowed opacity-75'
                                    ]"
                                >
                                    <span
                                        v-if="loading"
                                        class="materialSymbolsOutlined animate-spin"
                                    >
                                        progress_activity
                                    </span>
                                    <span v-if="!loading">{{ confirmText }}</span>
                                    <span v-else>Loading...</span>
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from "@headlessui/vue"

interface Props {
    show: boolean
    title: string
    message: string
    confirmText?: string
    confirmColor?: "primary" | "danger"
    loading?: boolean
}

withDefaults(defineProps<Props>(), {
    confirmText: "Confirm",
    confirmColor: "primary",
    loading: false,
})

defineEmits(["confirm", "cancel"])
</script>

