<template>
    <div class="relative flex w-full flex-1 flex-col items-center justify-center">
        <Chat :inputExpanded="inputExpanded" />
        <div class="relative mx-[10px] mb-[15px] w-full max-w-[48rem] sm:mx-0 sm:mb-[15px]">
            <AIChatInput :placeholderValue="placeholderValue" @onInputSubmit="onInputSubmit" @updateInputExpanded="updateInputExpanded" />
        </div>
    </div>
</template>

<script setup lang="ts">
    definePageMeta({
        layout: "land-advisors-dashboard",
        middleware: ["auth"],
    })

    import useCompletion from "~/composables/useCompletion"
    import useUser from "~/composables/useUser"
    import { getPlaceHolder } from "~/util/staticData"
    import { ref, watch, onMounted } from "vue"

    const props = defineProps({
        isMobile: Boolean,
    })

    const router = useRouter()
    const route = useRoute()
    const placeholderValue = ref("Enter message for Mozart...")

    // Add state for input expansion
    const inputExpanded = ref(false)

    // -------------------| Store |-------------------
    const conversationStore = useConversationStore()
    const messageStore = useMessageStore()
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
            await useCompletion().completions(data, null, null, UploadedFiles)
        } else {
            await useCompletion().completions(data)
        }
    }

    // Add method to handle input expansion updates
    const updateInputExpanded = (expanded: boolean) => {
        inputExpanded.value = expanded
    }

    // -------------------| Watchers |-------------------
    watch(
        () => props.isMobile,
        (newVal) => {
            placeholderValue.value = getPlaceHolder(newVal)
        }
    )

    // -------------------| Lifecycle Hooks |-------------------
    onMounted(async () => {
        await conversationStore.fetchConversations()
        const conversationId = router.currentRoute.value.params.conversationId as string
        const currentPath = router.currentRoute.value.fullPath

        if (conversationId && conversationId !== "undefined" && !conversationId.startsWith("DOC_")) {
            conversationStore.conversationId = conversationId
            if (conversationStore.conversations[conversationId]) {
                const conversationType = conversationStore.conversations[conversationId].metaData.type
                if (conversationType === "interaction") {
                    if (!currentPath.includes("workbench")) router.push(`/workbench/${conversationId}`)
                } else {
                    if (!currentPath.includes("compose")) router.push(`/compose/${conversationId}`)
                }
                await messageStore.fetchMessages(conversationId)
            }
        } else {
            router.push("/compose")
        }
    })
</script>
