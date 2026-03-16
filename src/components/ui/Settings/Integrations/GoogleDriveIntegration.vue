<template>
    <div class="flex flex-1 flex-col items-center justify-center p-5">
        <h2>Integrate Google Drive</h2>
        <div v-if="isAuthenticated || isAuthenticationCompleted">Authentication completed</div>
        <div v-else>
            <div class="button medium" v-if="url && !code" @click="openGoogleIntegration(url)">Start</div>
            <div class="button medium" v-if="code" @click="getToken">Get Token</div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted } from "vue"
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })
    useHead({
        title: "Google Drive Integration",
    })

    const userStore = useUserStore()

    const route = useRoute()
    const url = ref("")
    const isAuthenticationCompleted = ref(false)
    const code = computed(() => {
        return route.query.code as string
    })
    const isAuthenticated = computed(() => {
        if (userStore.integrations && userStore.integrations["google"]) return true
        return false
    })
    onMounted(async () => {
        if (isAuthenticated.value) return
        const data = await useUser().getOAuthUrl()
        url.value = data.url
    })

    const openGoogleIntegration = (url: string) => {
        window.open(url, "_self")
    }
    const getToken = async () => {
        const data = await useUser().getOAuthToken(code.value)
        if (data && data.code === 200) {
            isAuthenticationCompleted.value = true
        }
    }
</script>
