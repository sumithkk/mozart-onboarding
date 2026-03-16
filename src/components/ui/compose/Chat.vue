<template>
    <!-- Main chat wrapper with proper sizing -->
    <div class="relative h-full w-full">
        <!-- Adaptive Layout Container -->
        <div class="flex h-full w-full transition-all duration-300 ease-in-out" :class="{ 'flex-row': showReasoning }">
            <!-- Messages container with responsive width -->
            <div class="relative h-full w-full transition-all duration-300" :class="{ 'max-w-[50%]': showReasoning, 'max-w-full': !showReasoning }">
                <!-- Mobile-specific padding to prevent overlap with fixed input -->
                <div class="h-full w-full">
                    <!-- Scrollable messages area -->
                    <div ref="chatContainer" @scroll="onUserScroll" class="chat-container h-full w-full overflow-y-auto overscroll-contain" :class="{ 'pt-20 pb-32': isMobile, 'pb-4': !isMobile }">
                        <div class="text-textColor mx-auto flex w-full max-w-screen-md flex-col gap-2 px-2 py-4 sm:px-4">
                            <!-- Loop messages -->
                            <div v-for="(message, index) in messageStore.messages" :key="index" :class="[index === 0 ? 'mt-2' : '', index === messageStore.messages.length - 1 ? 'mb-2' : '']">
                                <Message v-if="!message.isVisuallyHiddenFromConversation" :message="message" :messageId="message.messageId" :lastMessage="index === messageStore.messages.length - 1" :profilePicture="getProfilePicture(message)" :hide-reasoning="showReasoning" @toggleReasoningPanel="toggleReasoningPanel" @scrollToBottom="scrollToBottom" />
                            </div>
                            <!-- Spinner if no messages and current conversation is not interaction -->
                            <div v-if="messageStore.messages.length === 0 && !isInteraction()" class="mt-2 mb-2">
                                <!-- messages skeleton -->
                                <MessageSkeleton variant="long" showCodeBlock showToolCalls number="4" />
                            </div>

                            <!-- Loading State -->
                            <div class="mt-2 mb-2">
                                <Message v-if="showSkeletonMessage" :message="loadingMessage" :messageId="''" :lastMessage="true" :profilePicture="getProfilePicture(loadingMessage)" :hide-reasoning="false" @toggleReasoningPanel="toggleReasoningPanel" @scrollToBottom="scrollToBottom" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reasoning Panel (right side) -->
            <div v-if="showReasoning" class="border-strokeColor bg-backgroundColor h-full w-[45%] transform overflow-y-auto border-l p-4 transition-all duration-300" :class="reasoningPanelAnimation">
                <div v-if="currentReasoningMessage" class="h-full">
                    <Reasoning :messageId="currentReasoningMessage.messageId" :isSplitView="true" @toggleClose="toggleReasoningPanel" />
                </div>
                <div v-else class="text-textColor flex h-full items-center justify-center opacity-70">
                    <div class="text-center">
                        <div class="materialSymbolsOutlined mb-2 text-3xl">psychology</div>
                        <p>Select a message with reasoning to view details</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { inject, type ComputedRef } from "vue"
    import MessageSkeleton from "./MessageSkeleton.vue"

    const props = defineProps({
        fileAttachmentsAvailable: {
            type: Boolean,
            default: false,
            required: false,
        },
        inputExpanded: {
            type: Boolean,
            default: false,
            required: false,
        },
    })

    const emit = defineEmits(["scrollToBottom", "updateScrollButton", "requestScrollToBottom"])

    const messageStore = useMessageStore()
    const ragStore = useRagStore()
    const conversationStore = useConversationStore()
    const userStore = useUserStore()
    const isMobile = inject<ComputedRef<boolean>>("isMobile")

    // Scrolling state
    const chatContainer = ref<HTMLElement | null>(null)
    const showScrollButton = ref(false)
    const autoScroll = ref(true)
    const smoothScroll = ref(false)

    // State for reasoning panel
    const showReasoning = ref(false)
    const reasoningPanelAnimation = ref("translate-x-0 opacity-100")
    const currentReasoningMessage = ref<IMessage | null>(null)
    const loadingMessage = ref<IMessage>({
        messageId: "",
        conversationId: "",
        children: [],
        author: {
            name: "Mozart",
            role: "assistant",
        },
        content: {
            parts: [],
            contentType: "text",
            thinking: {
                text: "",
                isFinished: false,
            },
        },
        status: "in_progress",
        parentId: null,
        userId: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isVisuallyHiddenFromConversation: false,
        metaData: {
            rag_sources: [],
            tokenUsage: {
                promptTokens: 0,
                responseToken: 0,
                totalTokens: 0,
            },
        },
    })

    const showSkeletonMessage = computed(() => {
        const lastMessage = messageStore.messages[messageStore.messages.length - 1]
        if (lastMessage && lastMessage.author.role === "user") {
            return messageStore.isProcessing || ragStore.isProcessing
        } else return false
    })

    // Handle scrolling logic
    const onUserScroll = () => {
        if (!chatContainer.value) return

        const container = chatContainer.value
        const scrollTop = container.scrollTop
        const scrollHeight = container.scrollHeight
        const clientHeight = container.clientHeight

        // Check if we're near the bottom (within 50px)
        const nearBottom = scrollHeight - scrollTop <= clientHeight + 50

        autoScroll.value = nearBottom

        // Add a small delay to prevent flickering
        if (!nearBottom && !showScrollButton.value) {
            setTimeout(() => {
                showScrollButton.value = true
                emit("updateScrollButton", true)
            }, 100)
        } else if (nearBottom && showScrollButton.value) {
            showScrollButton.value = false
            emit("updateScrollButton", false)
        }
    }

    // Scroll to bottom if autoScroll is enabled
    const scrollToBottom = (forceSmooth = false) => {
        if (!chatContainer.value) return

        autoScroll.value = true
        showScrollButton.value = false
        emit("updateScrollButton", false)

        chatContainer.value.scrollTo({
            top: chatContainer.value.scrollHeight + 100,
            behavior: forceSmooth ? "smooth" : smoothScroll.value ? "smooth" : "auto",
        })
    }

    const isInteraction = () => {
        // check if current conversation is interaction
        //check if the url isn't "workbench/"
        const url = useRoute().path
        return url.includes("workbench/")
    }

    // Expose the scrollToBottom method to parent components
    defineExpose({
        scrollToBottom,
    })

    // Toggle reasoning panel visibility
    const toggleReasoningPanel = (messageId: string, thinking: any) => {
        if (showReasoning.value) {
            // Animate out
            reasoningPanelAnimation.value = "translate-x-full opacity-0"
            setTimeout(() => {
                showReasoning.value = false
                reasoningPanelAnimation.value = "translate-x-0 opacity-100"
            }, 300)
        } else {
            showReasoning.value = true
            currentReasoningMessage.value = messageStore.messagesTree[messageId]
        }
    }

    // If your conversation object has multiple users, we gather them here:
    const collaborators = computed(() => {
        const conversation = conversationStore.conversations[conversationStore.conversationId]
        return conversation && conversation.usersWithAccess ? Object.values(conversation.usersWithAccess) : []
    })

    // Determine the appropriate profile picture for a message
    const getProfilePicture = (message: any) => {
        if (message.author.role === "user") {
            if (collaborators.value && collaborators.value.length > 0) {
                if (message.author.name === userStore.firstName) {
                    return userStore.profilePicture
                }
                const collaborator = collaborators.value.find((collab: any) => collab.username === message.author.name) as any
                return collaborator?.profilePicture || userStore.profilePicture
            }
            return userStore.profilePicture
        } else {
            // For system/bot messages, use a default
            return "https://storage.googleapis.com/mozart_assets/mozart.png"
        }
    }

    // Check if scroll button should be visible
    const checkScrollButtonVisibility = () => {
        if (!chatContainer.value) return

        const container = chatContainer.value
        const scrollTop = container.scrollTop
        const scrollHeight = container.scrollHeight
        const clientHeight = container.clientHeight

        const hasScrollableContent = scrollHeight > clientHeight + 100
        const isNotAtBottom = scrollTop < scrollHeight - clientHeight - 50

        // Show scroll button if there's scrollable content and we're not at the bottom
        // Also consider input expansion state for better positioning
        if (hasScrollableContent && isNotAtBottom && !showScrollButton.value) {
            setTimeout(() => {
                showScrollButton.value = true
                emit("updateScrollButton", true)
            }, 100)
        } else if ((!hasScrollableContent || !isNotAtBottom) && showScrollButton.value) {
            showScrollButton.value = false
            emit("updateScrollButton", false)
        }
    }

    // Watch for new messages and auto-scroll if enabled
    watch(
        () => messageStore.messages,
        () => {
            if (autoScroll.value) {
                nextTick(() => {
                    scrollToBottom()
                })
            }

            // Check if we should show scroll button based on content height
            nextTick(() => {
                checkScrollButtonVisibility()
            })
        },
        { deep: true }
    )

    // Watch for input expansion changes to update scroll button position
    watch(
        () => props.inputExpanded,
        () => {
            // Re-check scroll button visibility when input expands/collapses
            nextTick(() => {
                checkScrollButtonVisibility()
            })
        }
    )

    onMounted(() => {
        nextTick(() => {
            scrollToBottom()
            // Check scroll button visibility after initial render
            setTimeout(() => {
                checkScrollButtonVisibility()
            }, 500)
        })

        // Listen for window resize to check scroll button visibility
        window.addEventListener("resize", checkScrollButtonVisibility)

        // Listen for visual viewport changes (mobile keyboard)
        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", checkScrollButtonVisibility)
        }
    })

    onUnmounted(() => {
        window.removeEventListener("resize", checkScrollButtonVisibility)
        if (window.visualViewport) {
            window.visualViewport.removeEventListener("resize", checkScrollButtonVisibility)
        }
    })
</script>

<style scoped>
    /* Mobile-specific styles for keyboard handling */
    @media (max-width: 768px) {
        /* Ensure chat container doesn't overlap with keyboard */
        .chat-container {
            /* Use viewport height minus estimated keyboard height */
            max-height: calc(100vh - 200px);
            /* Ensure smooth scrolling on mobile */
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
        }

        /* Prevent horizontal scrolling */
        .relative.h-full.w-full {
            overflow-x: hidden;
        }

        /* Ensure messages are properly spaced */
        .mx-auto.flex.w-full.max-w-screen-md.flex-col.gap-2.px-2.py-4 {
            padding-bottom: 100px; /* Extra padding to prevent overlap with input */
        }
    }

    /* iOS Safari specific fixes */
    @supports (-webkit-touch-callout: none) {
        .chat-container {
            /* Prevent rubber band scrolling in iOS */
            -webkit-overflow-scrolling: touch;
        }
    }

    /* Android Chrome specific fixes */
    @media screen and (max-width: 768px) and (-webkit-min-device-pixel-ratio: 1) {
        .chat-container {
            /* Ensure proper scrolling on Android */
            -webkit-overflow-scrolling: touch;
        }
    }
</style>
