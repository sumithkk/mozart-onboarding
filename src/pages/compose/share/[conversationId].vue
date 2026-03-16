<template>
    <div class="flex h-screen w-full items-center justify-center">
        <!-- If the user is the owner or a collaborator -->
        <div v-if="isOwnerOrCollaborator" class="border-logoColor flex w-[300px] flex-col items-center gap-5 rounded-[10px] border-2 p-5">
            <div>The conversation already exist in your history</div>
        </div>

        <!-- If the user is not an admin -->
        <div v-else-if="!userStore.isAdmin" class="border-logoColor flex w-[300px] flex-col items-center gap-5 rounded-[10px] border-2 p-5">
            <div>This conversation is reserved for admins</div>
        </div>

        <!-- Otherwise, show login button or join conversation -->
        <div v-else class="border-logoColor flex w-[300px] flex-col items-center gap-5 rounded-[10px] border-2 p-5">
            <Button v-if="!isAuthenticated" buttonText="Login to Join" @clicked="goToLogin()" />
            <div v-else class="button medium cursor-pointer" @click="joinConversation">Join Conversation</div>
            <span v-if="!isAuthenticated"> Please login first and then use the link to join the conversation </span>
        </div>
    </div>
</template>

<script setup lang="ts">
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })
    useHead({
        title: "Compose",
    })

    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    const conversationStore = useConversationStore()

    const conversationId = computed(() => route.params.conversationId as string)
    const collaboratorRole = ref("editor")
    const isAuthenticated = computed(() => !!userStore.id)

    const isOwnerOrCollaborator = computed(() => {
        return conversationStore.conversations[conversationId.value]
    })

    const joinConversation = async () => {
        const response = await useConversation().shareConversation(conversationId.value, userStore.email, collaboratorRole.value, true)
        if (response) {
            await conversationStore.fetchConversations(true)
            router.push(`/compose/${conversationId.value}`)
        }
    }

    const goToLogin = () => {
        router.push("/auth/login")
    }

    onBeforeMount(async () => {
        if (isAuthenticated.value) {
            await conversationStore.fetchConversations()
        }
    })
</script>
