<template>
    <div class="flex h-screen w-full items-center justify-center">
        <div class="border-logoColor flex w-[300px] flex-col items-center gap-5 rounded-[10px] border-2 p-5">
            <h2 class="text-xl font-semibold">Accept Invite</h2>
            <Button v-if="!isAuthenticated" buttonText="Login to Join" @click="goToLogin()" />
            <Button v-else buttonText="Join Conversation" @click="goToConversation()" />
        </div>
    </div>
</template>

<script setup lang="ts">
    definePageMeta({
        layout: "home",
    })
    useHead({
        title: "Accept Invite",
    })

    const router = useRouter()
    const userStore = useUserStore()
    const inviteId = router.currentRoute.value.params.inviteId as string
    const conversationId = ref(null)

    const isAuthenticated = computed(() => !!userStore.id)

    const goToConversation = () => {
        router.push(`/compose/${conversationId.value}`)
    }

    const goToLogin = () => {
        router.push("/auth/login")
    }

    onMounted(async () => {
        const response = await useConversation().validateInvite(inviteId)
        if (response) {
            conversationId.value = response.conversationId
            userStore.sharedConversation = response.conversationId
        }
    })
</script>
