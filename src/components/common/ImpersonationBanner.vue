<template>
    <div
        v-if="isImpersonating"
        class="bg-warning border-warning-dark sticky top-0 z-50 flex items-center justify-between border-b px-4 py-3 text-white shadow-lg"
        style="background-color: #2844A4"
    >
        <div class="flex items-center gap-3">
            <span class="materialSymbolsOutlined animate-pulse text-2xl">admin_panel_settings</span>
            <div class="flex flex-col">
                <span class="font-semibold">Impersonation Mode Active</span>
                <span class="text-sm opacity-90">
                    You are viewing as {{ impersonatedUserName }}, ID: {{ userStore.id }}
                </span>
            </div>
        </div>

        <button
            @click="handleStopImpersonation"
            :disabled="stopping"
            class="hover:bg-warning-dark flex items-center gap-2 rounded-md bg-white/20 px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
            <span v-if="stopping" class="flex items-center gap-2">
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Stopping...
            </span>
            <span v-else class="flex items-center gap-2">
                <span class="materialSymbolsOutlined text-lg">logout</span>
                Stop Impersonation
            </span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { adminService } from "~/services/better-auth/admin"

const userStore = useUserStore()
const router = useRouter()

const stopping = ref(false)

const isImpersonating = computed(() => {
    return userStore.isImpersonating
})

const impersonatedUserName = computed(() => {
    if (!isImpersonating.value) return ""
    return `${userStore.firstName} ${userStore.lastName}`.trim() || userStore.email
})

async function handleStopImpersonation() {
    if (stopping.value) return

    try {
        stopping.value = true
        
        await adminService.stopImpersonating()
        
        // Refresh user data
        await userStore.hydrateFromBetterAuth()
        
        // Refresh to load user data
        showToast("Impersonation stopped successfully", "success")
        window.location.reload()
    } catch (error: any) {
        console.error("Failed to stop impersonation:", error)
        showToast(error.message || "Failed to stop impersonation", "error")
    } finally {
        stopping.value = false
    }
}

function showToast(message: string, type: "success" | "error") {
    // Placeholder for toast notification
    if (type === "error") {
        console.error(message)
    } else {
        console.log(message)
    }
}
</script>

<style scoped>
.materialSymbolsOutlined {
    font-variation-settings: "FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>

