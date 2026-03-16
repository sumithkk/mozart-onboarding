<template>
    <div class="message-skeleton-container">
        <div v-for="(message, index) in messages" :key="index" class="message-skeleton group text-textColor relative flex items-start py-2" :class="message.isUser ? 'flex-row-reverse' : 'flex-row'" :style="{ animationDelay: `${index * 0.2}s` }">
            <!-- Avatar skeleton -->
            <div :class="message.isUser ? 'ml-2' : 'mr-2'" class="flex size-9 items-center justify-center overflow-hidden rounded-full">
                <div class="skeleton-avatar size-full rounded-full"></div>
            </div>

            <!-- Message content skeleton -->
            <div class="flex w-full flex-col">
                <!-- User message skeleton -->
                <div v-if="message.isUser" class="user mb-2 w-fit max-w-none rounded-xl bg-gray-200 px-4 py-3 lg:max-w-[70%] dark:bg-gray-700" :class="message.isUser ? 'ml-auto' : ''">
                    <div class="skeleton-text h-3.5 w-[90px]"></div>
                </div>

                <!-- Assistant message skeleton -->
                <div v-else class="non-user mb-2 max-w-none px-0">
                    <div class="skeleton-content space-y-3">
                        <!-- Main content lines -->
                        <div class="skeleton-text space-y-2">
                            <div v-for="(line, idx) in assistantSkeletonLines" :key="idx" class="skeleton-line rounded" :style="{ width: line.width, height: line.height }"></div>
                        </div>

                        <!-- Code block skeleton (optional) -->
                        <div v-if="message.showCodeBlock" class="skeleton-code-block rounded-lg p-4">
                            <div class="skeleton-line mb-2 h-4 w-20 rounded"></div>
                            <div class="space-y-2">
                                <div v-for="i in 3" :key="`code-${i}`" class="skeleton-line rounded" :style="{ width: `${Math.random() * 40 + 60}%`, height: '1rem' }"></div>
                            </div>
                        </div>

                        <!-- Tool calls skeleton (optional) -->
                        <div v-if="message.showToolCalls" class="skeleton-tool-calls">
                            <div class="skeleton-line mb-2 h-5 w-24 rounded"></div>
                            <div class="flex gap-2">
                                <div v-for="i in 2" :key="`tool-${i}`" class="skeleton-tool rounded-lg p-3" :style="{ width: '200px', height: '80px' }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    interface SkeletonLine {
        width: string
        height: string
    }

    interface MessageConfig {
        isUser: boolean
        showCodeBlock?: boolean
        showToolCalls?: boolean
    }

    const props = defineProps({
        // Number of messages to display
        number: {
            type: Number,
            default: 1,
            validator: (value: number) => value > 0 && value <= 20, // Reasonable limit
        },

        // Message type (for backward compatibility when number is 1)
        isUser: {
            type: Boolean,
            default: false,
        },

        // Skeleton variants
        variant: {
            type: String,
            default: "default", // 'default', 'short', 'long', 'code', 'tools'
            validator: (value: string) => ["default", "short", "long", "code", "tools"].includes(value),
        },

        // Animation settings
        animationDuration: {
            type: String,
            default: "1.5s",
        },
        fadeDuration: {
            type: String,
            default: "1.2s",
        },

        // Show optional elements
        showCodeBlock: {
            type: Boolean,
            default: false,
        },
        showToolCalls: {
            type: Boolean,
            default: false,
        },
    })

    // Generate messages array with alternating user/assistant messages
    const messages = computed((): MessageConfig[] => {
        const messageArray: MessageConfig[] = []

        for (let i = 0; i < props.number; i++) {
            const isUser = i % 2 === 0 // Start with user message (index 0), then assistant (index 1), etc.

            messageArray.push({
                isUser,
                showCodeBlock: props.showCodeBlock && !isUser, // Only show code blocks for assistant messages
                showToolCalls: props.showToolCalls && !isUser, // Only show tool calls for assistant messages
            })
        }

        return messageArray
    })

    // Generate skeleton lines based on variant
    const userSkeletonLines = computed((): SkeletonLine[] => {
        const variants = {
            short: [
                { width: "80%", height: "0.1rem" },
                { width: "60%", height: "0.1rem" },
            ],
            default: [
                { width: "90%", height: "0.1rem" },
                { width: "85%", height: "0.1rem" },
                { width: "70%", height: "0.1rem" },
            ],
            long: [
                { width: "95%", height: "0.1rem" },
                { width: "90%", height: "0.75rem" },
                { width: "88%", height: "0.1rem" },
                { width: "75%", height: "0.1rem" },
                { width: "60%", height: "0.1rem" },
            ],
        }
        return variants[props.variant as keyof typeof variants] || variants.default
    })

    const assistantSkeletonLines = computed((): SkeletonLine[] => {
        const variants = {
            short: [
                { width: "85%", height: "0.75rem" },
                { width: "70%", height: "0.75rem" },
            ],
            default: [
                { width: "95%", height: "0.75rem" },
                { width: "90%", height: "0.75rem" },
                { width: "85%", height: "0.75rem" },
                { width: "80%", height: "0.75rem" },
            ],
            long: [
                { width: "98%", height: "0.75rem" },
                { width: "95%", height: "0.75rem" },
                { width: "92%", height: "0.75rem" },
                { width: "88%", height: "0.75rem" },
                { width: "85%", height: "0.75rem" },
                { width: "80%", height: "0.75rem" },
                { width: "75%", height: "0.75rem" },
            ],
            code: [
                { width: "90%", height: "0.75rem" },
                { width: "85%", height: "0.75rem" },
            ],
            tools: [
                { width: "80%", height: "0.75rem" },
                { width: "75%", height: "0.75rem" },
            ],
        }
        return variants[props.variant as keyof typeof variants] || variants.default
    })
</script>

<style scoped>
    .message-skeleton-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .message-skeleton {
        animation: skeleton-fade v-bind(fadeDuration) infinite ease-in-out;
    }

    .skeleton-avatar {
        background: linear-gradient(90deg, #e4e4e4 25%, #f6f6f6 50%, #e4e4e4 75%);
        background-size: 200% 100%;
        animation: skeleton-loading v-bind(animationDuration) infinite linear;
    }

    .skeleton-line {
        background: linear-gradient(90deg, #e4e4e4 25%, #f6f6f6 50%, #e4e4e4 75%);
        background-size: 200% 100%;
        animation: skeleton-loading v-bind(animationDuration) infinite linear;
    }

    .skeleton-code-block {
        background: linear-gradient(90deg, #f6f6f6 25%, #ffffff 50%, #f6f6f6 75%);
        background-size: 200% 100%;
        animation: skeleton-loading v-bind(animationDuration) infinite linear;
        border: 1px solid #e4e4e4;
    }

    .skeleton-tool {
        background: linear-gradient(90deg, #f6f6f6 25%, #ffffff 50%, #f6f6f6 75%);
        background-size: 200% 100%;
        animation: skeleton-loading v-bind(animationDuration) infinite linear;
        border: 1px solid #e4e4e4;
    }

    /* Dark theme support */
    [data-theme="dark"] .skeleton-avatar,
    [data-theme="dark"] .skeleton-line {
        background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
    }

    [data-theme="dark"] .skeleton-code-block {
        background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
        border-color: #3a3a3a;
    }

    [data-theme="dark"] .skeleton-tool {
        background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
        border-color: #3a3a3a;
    }

    /* Animations */
    @keyframes skeleton-loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    @keyframes skeleton-fade {
        0%,
        100% {
            opacity: 0.7;
        }
        50% {
            opacity: 1;
        }
    }

    /* Staggered animation for lines */
    .skeleton-line:nth-child(1) {
        animation-delay: 0s;
    }
    .skeleton-line:nth-child(2) {
        animation-delay: 0.1s;
    }
    .skeleton-line:nth-child(3) {
        animation-delay: 0.2s;
    }
    .skeleton-line:nth-child(4) {
        animation-delay: 0.3s;
    }
    .skeleton-line:nth-child(5) {
        animation-delay: 0.4s;
    }
    .skeleton-line:nth-child(6) {
        animation-delay: 0.5s;
    }
    .skeleton-line:nth-child(7) {
        animation-delay: 0.6s;
    }

    /* Hover effects */
    .message-skeleton:hover .skeleton-line {
        transform: scale(1.01);
        transition: transform 0.2s ease-in-out;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .skeleton-tool {
            width: 150px !important;
            height: 60px !important;
        }
    }
</style>
