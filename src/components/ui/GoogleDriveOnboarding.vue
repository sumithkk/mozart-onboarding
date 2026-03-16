<template>
    <transition name="fade" class="transition-all duration-300 ease-in-out">
        <div class="border-border bg-card/70 fixed inset-x-4 bottom-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:left-auto z-[9999] w-auto sm:w-96 max-w-full sm:max-w-sm max-h-[85vh] sm:max-h-[calc(100vh-3rem)] rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 ease-in-out flex flex-col overflow-hidden">
            <div class="px-3 py-2 flex-1 flex flex-col min-h-0 overflow-hidden">
                <!-- Header -->
                <div class="group flex cursor-pointer items-center justify-between flex-shrink-0" @click="toggleMinimize">
                    <h3 class="text-foreground text-foreground text-base sm:text-lg font-medium">Connect Your Drive</h3>
                    <div class="flex items-center justify-center gap-1">
                        <!-- Close button -->
                        <button @click.stop="$emit('close')" class="opacity-100 sm:opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <span class="material-symbols-outlined text-muted-foreground text-muted-foreground text-xl"> close </span>
                        </button>
                        <!-- Toggle minimize -->
                        <button @click.stop="toggleMinimize" class="rounded-full">
                            <span class="material-symbols-outlined text-muted-foreground text-muted-foreground text-xl">
                                {{ isMinimized ? "expand_circle_down" : "expand_circle_up" }}
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Content -->
                <transition name="slide-fade">
                    <div v-show="!isMinimized" class="mt-3 overflow-y-auto overflow-x-hidden flex-1 min-h-0 pr-1 -mr-1">
                        <div class="pb-2">
                            <p class="text-muted-foreground text-muted-foreground text-sm">Link Mozart to your Google Drive in 3 simple steps:</p>
                            <ul class="mt-4 space-y-3">
                                <li class="flex items-center gap-2">
                                    <div class="bg-primary text-foreground flex size-4 items-center justify-center rounded-full text-xs" :class="{ 'border-border border bg-transparent': !url && !code && !isAuthenticated }">
                                        <svg v-if="url || code || isAuthenticated" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="white">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L7 13.586 4.707 11.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l9-9a1 1 0 000-1.414z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <span class="text-foreground text-foreground text-sm"> Sign in to Google </span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <div class="bg-primary text-foreground flex size-4 items-center justify-center rounded-full text-xs" :class="{ 'border-border border bg-transparent': !code && !isAuthenticated }">
                                        <svg v-if="code || isAuthenticated" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="white">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L7 13.586 4.707 11.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l9-9a1 1 0 000-1.414z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <span class="text-foreground text-foreground text-sm"> Grant access permissions </span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <div class="bg-primary text-foreground flex size-4 items-center justify-center rounded-full text-xs" :class="{ 'border-border border bg-transparent': !isAuthenticated }">
                                        <svg v-if="isAuthenticated" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="white">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L7 13.586 4.707 11.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l9-9a1 1 0 000-1.414z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <span class="text-foreground text-foreground text-sm"> Finish connection setup </span>
                                </li>
                            </ul>
                            <button class="mt-6 w-full transform rounded-lg py-2 text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-md" :style="{ backgroundColor: 'var(--logoColor)' }" @click="completeAction">
                                {{ completeText }}
                            </button>
                            </div>
                        </div>
                </transition>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
    import { ref, computed } from "vue"
    const emit = defineEmits(["close"])

    const visible = ref(true)
    const isMinimized = ref(false)
    const toggleMinimize = () => {
        isMinimized.value = !isMinimized.value
    }
    const steps = ["Sign in to Google", "Grant access permissions", "Finish connection setup"]

    // Dummy reactive properties for demo purposes
    const url = ref("")
    const code = ref("")
    const isUserSubscribed = ref(true)
    const isAuthenticationCompleted = ref(false)
    const userStore = useUserStore()
    const isAuthenticated = computed(() => {
        if (userStore.integrations && userStore.integrations["google"] && userStore.integrations["google"].createdAt + 30 * 24 * 60 * 60 * 1000 >= Date.now()) return true
        return false
    })
    const openGoogleIntegration = (url: string) => {
        window.open(url, "_self")
    }
    const getToken = async () => {
        const data = await useUser().getOAuthToken(code.value)
        if (data && data.code === 200) {
            isAuthenticationCompleted.value = true

            if (data.data && data.data.tokens) userStore.integrations["google"] = data.data.tokens
        }
    }
    const completeAction = async () => {
        if (!isUserSubscribed.value) {
            userStore.showPlanPopup = true
        } else if (!code.value && !isAuthenticated.value) {
            useUser().getGoogleAuthCode("https://www.googleapis.com/auth/drive.readonly", (response: any) => {
                if (response.code) {
                    code.value = response.code
                }
            })
        } else if (code.value && !isAuthenticated.value) {
            await getToken()
        } else if (isAuthenticated.value) {
            code.value = ""
            emit("close")
        } else {
            openGoogleIntegration(url.value)
        }
    }

    // Update button text based on state
    const completeText = computed(() => {
        if (code.value && !isAuthenticated.value) return "Continue"
        return isAuthenticated.value ? "Complete Setup" : "Connect Google Drive"
    })
</script>

<style scoped>
    /* Simple transition classes */
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s ease;
    }
    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
    .slide-fade-enter-active {
        transition: all 0.3s ease;
    }
    .slide-fade-enter-from {
        transform: translateY(-10px);
        opacity: 0;
    }

    /* Smooth scrolling for content area */
    .overflow-y-auto {
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
    }

    .overflow-y-auto::-webkit-scrollbar {
        width: 4px;
    }

    .overflow-y-auto::-webkit-scrollbar-track {
        background: transparent;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb {
        background-color: rgba(155, 155, 155, 0.5);
        border-radius: 2px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
        background-color: rgba(155, 155, 155, 0.7);
    }
</style>
