<template>
    <!-- Main container for the modal/card -->
    <div class="border-border bg-card absolute top-0 left-0 m-4 w-80 rounded-md border p-4 shadow-md">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Connect Your Drive</h3>
        </div>
        <p class="text-muted-foreground mt-2 text-sm">Link Mozart to your Google Drive in 3 steps</p>

        <!-- Steps list -->
        <ul class="mt-4 space-y-2">
            <!-- Step 1 -->
            <li class="flex items-center">
                <span :class="['mr-2 flex h-4 w-4 items-center justify-center rounded-full border', url || code || isAuthenticated ? 'bg-primary' : 'border-border']">
                    <!-- Check Icon -->
                    <svg v-if="url || code || isAuthenticated" xmlns="http://www.w3.org/2000/svg" class="text-foreground h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 00-1.414 0L7 13.586 
                 4.707 11.293a1 1 0 10-1.414 1.414l3 
                 3a1 1 0 001.414 0l9-9a1 
                 1 0 000-1.414z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </span>
                <span :class="['text-sm', url || code || isAuthenticated ? 'text-muted-foreground line-through' : 'text-foreground']"> Sign in to Google </span>
            </li>

            <!-- Step 2 -->
            <li class="flex items-center">
                <span :class="['mr-2 flex h-4 w-4 items-center justify-center rounded-full border', code || isAuthenticated ? 'bg-primary' : 'border-border']">
                    <svg v-if="code || isAuthenticated" xmlns="http://www.w3.org/2000/svg" class="text-foreground h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 00-1.414 0L7 
                 13.586 4.707 11.293a1 1 0 10-1.414 
                 1.414l3 3a1 1 0 001.414 0l9-9a1 
                 1 0 000-1.414z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </span>
                <span :class="['text-sm', code || isAuthenticated ? 'text-muted-foreground line-through' : 'text-foreground']"> Grant access permissions </span>
            </li>

            <!-- Step 3 -->
            <li class="flex items-center">
                <span :class="['mr-2 flex h-4 w-4 items-center justify-center rounded-full border', isAuthenticated ? 'bg-primary' : 'border-border']">
                    <svg v-if="isAuthenticated" xmlns="http://www.w3.org/2000/svg" class="text-foreground h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 00-1.414 
                 0L7 13.586 4.707 11.293a1 1 
                 0 10-1.414 1.414l3 
                 3a1 1 0 001.414 0l9-9a1 
                 1 0 000-1.414z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </span>
                <span :class="['text-sm', isAuthenticated ? 'text-muted-foreground line-through' : 'text-foreground']"> Finish connection setup </span>
            </li>
        </ul>

        <!-- Action Button -->
        <button class="text-foreground hover:bg-primary mt-4 w-full rounded-md py-2" :style="{ backgroundColor: 'var(--logoColor)' }" @click="completeAction">
            {{ code && !isAuthenticated ? "Continue" : isAuthenticated ? "Complete Setup" : "Connect Google Drive" }}
        </button>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from "vue"
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    useHead({
        title: "Google Drive Integration",
    })

    // -------------------------------------------------
    const userStore = useUserStore()
    const router = useRouter()
    const route = useRoute()

    const url = ref("")
    const isAuthenticationCompleted = ref(false)
    const windowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 0)
    const isMobile = computed(() => windowWidth.value < 768)

    if (typeof window !== "undefined") {
        window.addEventListener("resize", () => {
            windowWidth.value = window.innerWidth
        })
    }
    let renderRoute = isMobile.value ? "/compose" : "/workbench/files"

    // Code from the query
    const code = computed(() => {
        return route.query.code as string
    })

    // Check if user is currently authenticated
    const isAuthenticated = computed(() => {
        if (userStore.integrations && userStore.integrations["google"] && userStore.integrations["google"].createdAt + 30 * 24 * 60 * 60 * 1000 > Date.now()) {
            return true
        }
        return false
    })

    watchEffect(() => {
        if (isAuthenticated.value) {
            // e.g., optionally redirect after a short pause
            // setTimeout(() => {
            //   router.push("/workbench/files")
            // }, 3000)
        }
    })

    const openGoogleIntegration = (url: string) => {
        window.open(url, "_self")
    }

    const getToken = async () => {
        const data = await useUser().getOAuthToken(code.value)
        if (data && data.code === 200) {
            isAuthenticationCompleted.value = true
            if (data.data && data.data.tokens) {
                userStore.integrations["google"] = data.data.tokens
            }
        }
    }

    const completeAction = async () => {
        // 1) No code or authentication => get OAuth URL
        if (!code.value && !isAuthenticated.value) {
            const data = await useUser().getOAuthUrl()
            url.value = data.url
            window.open(data.url, "_self")
        }
        // 2) If code is present but not authenticated, get token
        else if (code.value && !isAuthenticated.value) {
            await getToken()
        }
        // 3) If already authenticated, go to the dashboard
        else if (isAuthenticated.value) {
            router.push(renderRoute)
        }
        // 4) Otherwise, open the stored URL
        else {
            openGoogleIntegration(url.value)
        }
    }
</script>
