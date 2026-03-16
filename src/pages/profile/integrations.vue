<template>
    <div class="text-textColor relative flex h-full w-full flex-1 flex-col overflow-y-auto p-5">
        <h2 class="mb-2 text-2xl font-bold">Integrations and connected apps</h2>
        <p class="mb-4">Connect and manage integrations to enhance your workflow.</p>

        <!-- <button class="mb-5 w-fit cursor-pointer rounded bg-mozart-blue px-4 py-2 text-base text-white">+ Add Integration</button> -->

        <!-- Loading State -->
        <div v-if="integrations.isGettingIntegrations" class="flex items-center justify-center py-12">
            <ComponentLoading size="lg" />
        </div>

        <!-- Integrations List -->
        <div v-else class="flex flex-row items-center justify-center flex-wrap gap-3">
            <div v-for="integration in integrations.integrations" :key="integration.name" class="border-strokeColor mt-2 w-[400px] max-w-[400px] rounded-[8px] border p-5 text-left shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                <div class="mb-1 flex items-center justify-between">
                    <div class="text-lg font-bold">{{ integration.name }}</div>
                    <div v-if="integration.isMCP" class="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-200 dark:text-blue-800">MCP</div>
                </div>
                <div class="text-linkColor mb-2 text-sm">
                    <a :href="integration.url" target="_blank">{{ integration.url }}</a>
                </div>
                <div class="text-gray2 mb-5 text-sm line-clamp-3 min-h-[60px]">
                    {{ integration.description }}
                </div>

                <div class="flex items-center justify-between">
                    <button 
                        v-if="integration.connected" 
                        :disabled="disconnectingIntegrationId === integration.id"
                        class="border-strokeColor text-textColor relative flex min-w-[120px] items-center justify-center rounded border px-4 py-2 text-sm transition hover:bg-red-900 hover:border-red-900 disabled:cursor-not-allowed disabled:opacity-50" 
                        @click="disconnectIntegration(integration)"
                    >
                        <span :class="{ 'opacity-0': disconnectingIntegrationId === integration.id }">
                            Disconnect
                        </span>
                        <div v-if="disconnectingIntegrationId === integration.id" class="absolute flex items-center justify-center">
                            <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        </div>
                    </button>
                    <label v-else class="bg-input text-textColor cursor-pointer rounded px-4 py-2 text-sm hover:bg-strokeColor transition" @click="whenConnectButtonClicked(integration)"> {{ getConnectButtonText(integration) }} </label>
                    <transition name="fade" v-if="integration.connected && integration.id === 'google'">
                        <GoogleFilePicker :fileSelection="false" />
                    </transition>
                </div>
            </div>
        </div>
    </div>

    <GoogleDriveOnboarding v-if="!userStore.isLoading && showGoogleDriveOnboarding" @close="closeGoogleDriveOnboarding" />
    <IntegrationConfigModal v-if="showConfigModal" :integration="selectedIntegration" @close="showConfigModal = false" @saved="onIntegrationSaved" />
</template>

<script lang="ts" setup>
    import { getShowPopupForIntegration, updateShowPopupForIntegration } from "~/util/index"
    import IntegrationConfigModal from "~/components/ui/Settings/Integrations/IntegrationConfigModal.vue"
    import ComponentLoading from "~/components/common/ComponentLoading.vue"

    const props = defineProps({
        isMobile: Boolean,
    })
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    const integrations = useIntegrationStore()
    const userStore = useUserStore()

    const code = ref("")
    // Helper for Google Auth state - checking userStore.integrations is legacy but kept for compatibility if needed
    // The source of truth for list rendering is now integrations.integrations which has .connected property
    const isGoogleAuthenticated = computed(() => {
        if (userStore.integrations && userStore.integrations["google"] && userStore.integrations["google"].createdAt + 30 * 24 * 60 * 60 * 1000 >= Date.now()) return true
        return false
    })
    
    const isAuthenticationCompleted = ref(false)

    const getConnectButtonText = (integration: any) => {
        if (integration.id === 'google') {
             if (code.value && !isGoogleAuthenticated.value) return "Continue"
             return isGoogleAuthenticated.value ? "Complete Connection" : "Connect"
        }
        return "Connect"
    }

    const initialShowGoogleDriveOnboarding = () => {
        try {
            const googleIntegration = userStore.integrations["google"]
            if (!googleIntegration) {
                return getShowPopupForIntegration("google", "integrations")
            }
            const isExpired = googleIntegration.createdAt + 30 * 24 * 60 * 60 * 1000 <= Date.now()
            return isExpired && getShowPopupForIntegration("google", "integrations")
        } catch (error) {
            return false
        }
    }
    const showGoogleDriveOnboarding = ref(initialShowGoogleDriveOnboarding())
    const showConfigModal = ref(false)
    const selectedIntegration = ref<any>(null)
    const disconnectingIntegrationId = ref<string | null>(null)

    const getToken = async () => {
        const data = await useUser().getOAuthToken(code.value)
        if (data && data.code === 200) {
            isAuthenticationCompleted.value = true
            if (data.data && data.data.tokens) userStore.integrations["google"] = data.data.tokens
            await integrations.getIntegrations()
        }
    }
    const openGoogleIntegration = (url: string) => {
        window.open(url, "_self")
    }
    const url = ref("")

    const whenConnectButtonClicked = async (integration: any) => {
        if (integration.type === 'oauth' && integration.id === "google") {
            if (!integration.connected) {
                if (!showGoogleDriveOnboarding.value) {
                    showGoogleDriveOnboarding.value = true
                    return
                }
                if (!code.value && !isGoogleAuthenticated.value) {
                    useUser().getGoogleAuthCode("https://www.googleapis.com/auth/drive.readonly", (response) => {
                        if (response.code) {
                            code.value = response.code
                        }
                    })
                } else if (code.value && !isGoogleAuthenticated.value) {
                    await getToken()
                }
            } else if (isGoogleAuthenticated.value) {
                code.value = ""
            } else {
                openGoogleIntegration(url.value)
            }
        } else if (integration.type === 'api_key') {
            selectedIntegration.value = integration
            showConfigModal.value = true
        }
    }

    const closeGoogleDriveOnboarding = async () => {
        if (userStore.integrations["google"]) {
            await integrations.getIntegrations() // Refresh integrations list
        }
        showGoogleDriveOnboarding.value = false
        updateShowPopupForIntegration("google", "integrations", false)
    }


    const disconnectIntegration = async (integration: any) => {
        try {
            disconnectingIntegrationId.value = integration.id
            await integrations.disconnectIntegration(integration.id)
            if(integration.id === 'google') delete userStore.integrations[integration.id]
        } catch (error) {
            console.error('Error disconnecting integration:', error)
        } finally {
            disconnectingIntegrationId.value = null
        }
    }

    const onIntegrationSaved = async () => {
        await integrations.getIntegrations()
    }

    onMounted(async () => {
        await useIntegrationStore().getIntegrations()
    })
</script>
