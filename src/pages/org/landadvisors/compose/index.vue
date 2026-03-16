<template>
    <div class="mx-[1%] mt-[2%] flex w-full flex-1 flex-col items-center justify-center sm:mx-[10%]">
        <div class="relative bottom-[10px] left-0 flex h-full w-full items-center justify-center sm:bottom-0">
            <DefaultTextInput :placeholderValue="placeholderValue" @onInputSubmit="onInputSubmit" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useRouter } from "vue-router"

    definePageMeta({
        layout: "land-advisors-dashboard",
        middleware: ["auth"],
    })

    const router = useRouter()
    const placeholderValue = "Enter message for Mozart..."

    // -------------------| Store |-------------------
    const messageStore = useMessageStore()
    const conversationStore = useConversationStore()
    // -------------------| Composable |-------------------
    const conversation = useConversation()

    // -------------------| Functions |-------------------
    const onInputSubmit = async (data: any, documents: any) => {
        if (documents && documents.length > 0) {
            let UploadedFiles = []
            for (const document of documents) {
                const uploadData = await useUser().uploadFile(document)
                UploadedFiles.push(uploadData)
            }
            await useCompletion().completions(data, "", "", UploadedFiles)
        } else {
            await useCompletion().completions(data)
        }
    }

    watch(
        () => conversationStore.conversationId,
        (newConversationId) => {
            if (newConversationId !== "") {
                router.push(`/compose/${newConversationId}`)
            }
        }
    )

    onMounted(async () => {
        conversationStore.conversationId = ""
        messageStore.messages = []
        messageStore.messagesTree = {}
        await conversationStore.fetchConversations()
    })
</script>
