<template>
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95 translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 translate-y-2">
        <div v-if="isVisible" class="ring-opacity-5 fixed top-4 right-4 z-50 max-w-sm rounded-lg bg-white shadow-lg ring-1 ring-black dark:bg-gray-800 dark:ring-gray-600">
            <div class="p-4">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <!-- Loading spinner -->
                        <div v-if="isLoading && !hasError" class="flex-shrink-0">
                            <div class="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-mozart-blue"></div>
                        </div>

                        <!-- Error icon -->
                        <div v-else-if="hasError" class="flex-shrink-0">
                            <div class="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                                <svg class="h-3 w-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        <!-- Success icon -->
                        <div v-else class="flex-shrink-0">
                            <div class="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                                <svg class="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium text-gray-900 dark:text-white">
                                {{ title }}
                            </p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                {{ statusMessage }}
                            </p>
                        </div>
                    </div>

                    <!-- Close button -->
                    <button v-if="showCloseButton" @click="handleDismiss" class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>

                <!-- Progress bar -->
                <div v-if="isLoading && !hasError" class="mt-3">
                    <div class="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div class="h-1.5 rounded-full bg-mozart-blue transition-all duration-300 ease-out" :style="{ width: `${loadingProgress}%` }"></div>
                    </div>
                </div>

                <!-- Action buttons -->
                <div v-if="showActionButtons" class="mt-3 flex space-x-2">
                    <button v-if="showCancelButton" @click="handleCancel" class="flex-1 rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-mozart-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">Cancel</button>
                    <button v-if="showRetryButton" @click="handleRetry" class="flex-1 rounded-md border border-transparent bg-mozart-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-mozart-blue-700 focus:ring-2 focus:ring-mozart-blue-500 focus:ring-offset-2 focus:outline-none">Retry</button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
    import { computed, ref, watch, onMounted, onUnmounted } from "vue"
    import { useConversationSwitching } from "~/composables/useConversationSwitching"
    import { useConversationStore } from "~/store/conversations"
    import eventBus from "~/util/eventBus"

    // Props
    interface Props {
        autoHide?: boolean
        autoHideDelay?: number
    }

    const props = withDefaults(defineProps<Props>(), {
        autoHide: true,
        autoHideDelay: 3000,
    })

    // Composables
    const conversationSwitching = useConversationSwitching()
    const conversationStore = useConversationStore()

    // State
    const isVisible = ref(false)
    const conversationTitle = ref("")
    const statusMessage = ref("")
    const autoHideTimeout = ref<NodeJS.Timeout | null>(null)

    // Computed
    const isLoading = computed(() => conversationSwitching.isLoading.value)
    const isTransitioning = computed(() => conversationSwitching.isTransitioning.value)
    const loadingProgress = computed(() => conversationSwitching.loadingProgress.value)
    const hasError = computed(() => conversationSwitching.hasError.value)
    const errorMessage = computed(() => conversationSwitching.errorMessage.value)

    const title = computed(() => {
        if (hasError.value) return "Switch Failed"
        if (isLoading.value) return "Switching Conversation"
        return "Switch Complete"
    })

    const showCloseButton = computed(() => !isLoading.value || hasError.value)
    const showActionButtons = computed(() => hasError.value || isLoading.value)
    const showCancelButton = computed(() => isLoading.value && !hasError.value)
    const showRetryButton = computed(() => hasError.value)

    // Methods
    const getStatusMessage = (progress: number): string => {
        if (progress < 20) return "Checking connection..."
        if (progress < 40) return "Preparing switch..."
        if (progress < 60) return "Loading conversation..."
        if (progress < 80) return "Fetching messages..."
        if (progress < 95) return "Finalizing..."
        return "Complete!"
    }

    const handleCancel = () => {
        conversationSwitching.cancelSwitch()
        isVisible.value = false
    }

    const handleRetry = () => {
        conversationSwitching.retrySwitch()
    }

    const handleDismiss = () => {
        isVisible.value = false
    }

    const clearAutoHideTimeout = () => {
        if (autoHideTimeout.value) {
            clearTimeout(autoHideTimeout.value)
            autoHideTimeout.value = null
        }
    }

    // Watchers
    watch(isLoading, (loading) => {
        if (loading) {
            isVisible.value = true
            clearAutoHideTimeout()
        } else if (props.autoHide && !hasError.value) {
            // Auto-hide after delay when loading completes successfully
            autoHideTimeout.value = setTimeout(() => {
                isVisible.value = false
            }, props.autoHideDelay)
        }
    })

    watch(hasError, (error) => {
        if (error) {
            isVisible.value = true
            clearAutoHideTimeout()
            // Don't auto-hide errors
        }
    })

    watch(loadingProgress, (progress) => {
        if (progress > 0 && !hasError.value) {
            statusMessage.value = getStatusMessage(progress)
        }
    })

    // Event handlers
    const handleConversationSwitchStart = (event: any) => {
        const { to } = event
        const conversation = conversationStore.conversations[to]
        conversationTitle.value = conversation?.title || "Unknown Conversation"
        statusMessage.value = "Initializing..."
    }

    const handleConversationSwitchSuccess = () => {
        statusMessage.value = "Success!"
    }

    const handleConversationSwitchError = (event: any) => {
        const { error } = event
        statusMessage.value = error || "An error occurred"
    }

    // Lifecycle
    onMounted(() => {
        eventBus.on("conversationSwitchStart", handleConversationSwitchStart)
        eventBus.on("conversationSwitchSuccess", handleConversationSwitchSuccess)
        eventBus.on("conversationSwitchError", handleConversationSwitchError)
    })

    onUnmounted(() => {
        eventBus.off("conversationSwitchStart", handleConversationSwitchStart)
        eventBus.off("conversationSwitchSuccess", handleConversationSwitchSuccess)
        eventBus.off("conversationSwitchError", handleConversationSwitchError)
        clearAutoHideTimeout()
    })
</script>
