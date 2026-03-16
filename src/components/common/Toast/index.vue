<template>
    <!-- Remove all custom toast UI - using vue-sonner's Toaster component instead -->
</template>

<script setup lang="ts">
    import { onMounted, onBeforeUnmount } from "vue"
    import eventBus from "~/util/eventBus"

    const { $toast } = useNuxtApp()

    // Interface for eventBus events
    interface IShowToastEvent {
        message: string
        _type: string // e.g. "success", "error", "warning", "info"
        duration?: number
        position?: string // e.g. "bottom-right", etc.
    }

    // Define the handler function so we can remove it later
    const handleShowToast = ({ message, _type, duration = 2000, position = "bottom-right" }: IShowToastEvent) => {
        const toastOptions = { duration }

        if (_type === "success") {
            $toast.success(message, toastOptions)
        } else if (_type === "error") {
            $toast.error(message, toastOptions)
        } else if (_type === "warning") {
            $toast.warning(message, toastOptions)
        } else if (_type === "info") {
            $toast.info(message, toastOptions)
        }
    }

    // Listen for eventBus toast events and trigger vue-sonner methods
    onMounted(() => {
        eventBus.on("showToast", handleShowToast)
    })

    // Clean up the eventBus listener to prevent duplicates
    onBeforeUnmount(() => {
        eventBus.off("showToast", handleShowToast)
    })
</script>
