<template>
    <!-- Outer Wrapper -->
    <div class="m-[10px] box-border flex flex-col gap-[10px] overflow-y-scroll">
        <!-- Session List -->
        <div v-if="userSessions" v-for="session in userSessions" :key="session.tokenHash" class="border-strokeColor box-border flex w-full items-center justify-between rounded-[10px] border px-5 py-3">
            <!-- Device Information -->
            <div>
                <div class="text-[18px]">{{ session.browser.name || "N/A" }} - {{ session.os.name || "N/A" }} - {{ session.cpu.architecture || "N/A" }}</div>
                <div class="text-[18px]">
                    {{ session.clientIPAddress || "N/A" }}
                </div>
                <div class="text-unselectedColor flex flex-col gap-2">Last Login: {{ new Date(session.updatedAt).toLocaleString() }}</div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col items-end gap-2">
                <!-- Revoke Device -->
                <div v-if="!session.thisDevice && !session.revoked" class="border-strokeColor flex cursor-pointer items-center rounded border px-2 py-1 text-[15px]" @click="onLogoutDeviceClicked(session.tokenHash)">
                    <div class="materialSymbolsOutlined pr-1 text-[20px] leading-none">logout</div>
                    Sign Out
                </div>

                <!-- Session Revoked -->
                <div v-if="session.revoked">Revoked Session</div>

                <!-- Current Device -->
                <div v-if="session.thisDevice" class="text-textColor w-fit rounded-[7px] bg-[#2F9D2F] px-2 py-[2px] text-[13px]">Your current session</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from "vue"

    const user = useUser()
    const userStore = useUserStore()

    // Initialize userSessions from the store
    const userSessions = ref(userStore.session)

    // Loading state (optional, for revoking sessions)
    const isLoading = ref(false)

    // Revoke specific user session
    async function onLogoutDeviceClicked(tokenHash: string) {
        try {
            isLoading.value = true
            await user.revokeUserSession(tokenHash)
        } finally {
            isLoading.value = false
        }
    }
</script>
