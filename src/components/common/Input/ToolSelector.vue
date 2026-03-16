<template>
    <div class="relative w-full">
        <!-- Modern Textarea with Enhanced Styling -->
        <div class="relative">
            <textarea
                v-model="inputValue"
                @input="onInput"
                @keydown.down.prevent="onArrowDown"
                @keydown.up.prevent="onArrowUp"
                @keydown.enter.prevent="onEnter"
                @keydown.escape="hideDropdown"
                @focus="$emit('focus')"
                @blur="$emit('blur')"
                @dragover.prevent
                @drop.prevent="$emit('drop', $event)"
                @paste="$emit('paste', $event)"
                class="text-textColor h-full w-full resize-none overflow-y-scroll border-none bg-transparent text-[1rem] focus:outline-none"
                :rows="1"
                ref="textareaRef"
                :placeholder="placeholder"
            ></textarea>

            <!-- Tool Trigger Indicator -->
            <div v-if="showTriggerHint && !showDropdown" class="text-unselectedColor absolute top-1/2 right-3 -translate-y-1/2 transform animate-pulse text-sm">@tool</div>
        </div>

        <!-- Modern Dropdown with Animations (now opens upward) -->
        <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0 -translate-y-2" enter-to-class="transform scale-100 opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100 translate-y-0" leave-to-class="transform scale-95 opacity-0 -translate-y-2">
            <div v-if="showDropdown && filteredTools.length > 0" class="bg-backgroundColor border-border absolute bottom-full left-0 z-50 mb-2 max-h-72 w-full overflow-hidden rounded-xl border shadow-2xl backdrop-blur-sm">
                <!-- Header -->
                <div class="border-border bg-headerBackgroundColor/50 border-b px-4 py-3">
                    <div class="flex items-center gap-2">
                        <div class="bg-linkColor h-2 w-2 animate-pulse rounded-full"></div>
                        <span class="text-textColor text-sm font-medium">Available Tools</span>
                        <span class="text-unselectedColor ml-auto text-xs">{{ filteredTools.length }} tools</span>
                    </div>
                </div>

                <!-- Tools List -->
                <div class="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-borderColor hover:scrollbar-thumb-linkColor max-h-48 overflow-y-auto">
                    <div
                        v-for="(tool, idx) in filteredTools"
                        :key="tool.name"
                        :class="[
                            'group relative cursor-pointer border-l-2 px-4 py-3 transition-all duration-150',
                            {
                                'bg-linkColor/10 border-l-linkColor text-linkColor': idx === highlightedIndex,
                                'hover:bg-headerBackgroundColor/30 hover:border-l-linkColor/30 border-l-transparent': idx !== highlightedIndex,
                            },
                        ]"
                        @mousedown.prevent="selectTool(tool)"
                        @mouseenter="highlightedIndex = idx"
                    >
                        <!-- Tool Icon & Name -->
                        <div class="flex items-start gap-3">
                            <div
                                :class="[
                                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all duration-150',
                                    {
                                        'bg-linkColor text-backgroundColor': idx === highlightedIndex,
                                        'bg-headerBackgroundColor text-textColor group-hover:bg-linkColor/20': idx !== highlightedIndex,
                                    },
                                ]"
                            >
                                {{ tool.name.charAt(0).toUpperCase() }}
                            </div>

                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2">
                                    <h3
                                        :class="[
                                            'truncate text-sm font-semibold transition-colors duration-150',
                                            {
                                                'text-linkColor': idx === highlightedIndex,
                                                'text-textColor': idx !== highlightedIndex,
                                            },
                                        ]"
                                    >
                                        {{ tool.name }}
                                    </h3>
                                    <div v-if="idx === highlightedIndex" class="text-linkColor flex-shrink-0 animate-bounce">
                                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                        </svg>
                                    </div>
                                </div>

                                <p
                                    :class="[
                                        'mt-1 line-clamp-2 text-xs transition-colors duration-150',
                                        {
                                            'text-linkColor/80': idx === highlightedIndex,
                                            'text-unselectedColor': idx !== highlightedIndex,
                                        },
                                    ]"
                                >
                                    {{ tool.description }}
                                </p>
                            </div>
                        </div>

                        <!-- Selection Indicator -->
                        <div v-if="idx === highlightedIndex" class="absolute top-1/2 right-2 -translate-y-1/2 transform">
                            <div class="bg-linkColor h-2 w-2 animate-ping rounded-full"></div>
                        </div>
                    </div>
                </div>

                <!-- Footer with Keyboard Hints -->
                <div class="border-border bg-headerBackgroundColor/30 border-t px-4 py-2">
                    <div class="text-unselectedColor flex items-center justify-between text-xs">
                        <div class="flex items-center gap-4">
                            <span class="flex items-center gap-1">
                                <kbd class="bg-backgroundColor border-border rounded border px-1.5 py-0.5 text-xs">↑↓</kbd>
                                Navigate
                            </span>
                            <span class="flex items-center gap-1">
                                <kbd class="bg-backgroundColor border-border rounded border px-1.5 py-0.5 text-xs">Enter</kbd>
                                Select
                            </span>
                            <span class="flex items-center gap-1">
                                <kbd class="bg-backgroundColor border-border rounded border px-1.5 py-0.5 text-xs">Esc</kbd>
                                Close
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Empty State -->
        <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-if="showDropdown && filteredTools.length === 0" class="bg-backgroundColor border-border absolute bottom-full left-0 z-50 mb-2 w-full rounded-xl border p-6 text-center shadow-lg">
                <div class="bg-headerBackgroundColor mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <svg class="text-unselectedColor h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                </div>
                <h3 class="text-textColor mb-1 text-sm font-medium">No tools available</h3>
                <p class="text-unselectedColor text-xs">No tools are currently configured for your account.</p>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch, onMounted } from "vue"
    import { useUserStore } from "@/store/user"

    // Define props and emits
    const props = defineProps<{
        modelValue: string
        selectedTools?: string[]
        placeholder?: string
    }>()

    const emit = defineEmits<{
        "update:modelValue": [value: string]
        toolSelected: [toolName: string]
        toolRemoved: [toolName: string]
        focus: []
        blur: []
        drop: [event: DragEvent]
        paste: [event: ClipboardEvent]
        enter: []
    }>()

    const userStore = useUserStore()
    const showDropdown = ref(false)
    const highlightedIndex = ref(0)
    const showTriggerHint = ref(false)
    const textareaRef = ref<HTMLTextAreaElement | null>(null)

    const TOOL_TRIGGER = "@tool"

    // Computed for input value
    const inputValue = computed({
        get: () => props.modelValue,
        set: (value: string) => emit("update:modelValue", value),
    })

    const filteredTools = computed(() => {
        if (!showDropdown.value) return []
        const selectedToolNames = props.selectedTools || []
        // Filter out already selected tools
        return (userStore.tools || []).filter((tool) => !selectedToolNames.includes(tool.name))
    })

    function onInput(e: Event) {
        const value = (e.target as HTMLTextAreaElement).value
        inputValue.value = value

        if (value.includes(TOOL_TRIGGER)) {
            showDropdown.value = true
            highlightedIndex.value = 0
            showTriggerHint.value = false
        } else {
            showDropdown.value = false
            // Show hint if input is empty or doesn't contain trigger
            showTriggerHint.value = value.length === 0
        }
    }

    function selectTool(tool: { name: string }) {
        // Remove @tool from input and emit tool selection
        inputValue.value = inputValue.value.replace(TOOL_TRIGGER, "").trim()
        emit("toolSelected", tool.name)
        hideDropdown()
        // Refocus textarea after selection
        textareaRef.value?.focus()
    }

    function hideDropdown() {
        showDropdown.value = false
        showTriggerHint.value = inputValue.value.length === 0
    }

    function onArrowDown() {
        if (!showDropdown.value || filteredTools.value.length === 0) return
        highlightedIndex.value = (highlightedIndex.value + 1) % filteredTools.value.length
    }

    function onArrowUp() {
        if (!showDropdown.value || filteredTools.value.length === 0) return
        highlightedIndex.value = (highlightedIndex.value - 1 + filteredTools.value.length) % filteredTools.value.length
    }

    function onEnter() {
        if (showDropdown.value && filteredTools.value.length > 0) {
            selectTool(filteredTools.value[highlightedIndex.value])
        } else {
            // Emit enter event when not selecting a tool
            emit("enter")
        }
    }

    // Watch for input changes
    watch(inputValue, (val) => {
        if (!val.includes(TOOL_TRIGGER)) {
            showDropdown.value = false
        }
        showTriggerHint.value = val.length === 0
    })

    // Show hint on mount if input is empty
    onMounted(() => {
        showTriggerHint.value = inputValue.value.length === 0
    })
</script>

<style scoped>
    /* Custom scrollbar styling */
    .scrollbar-thin::-webkit-scrollbar {
        width: 4px;
    }

    .scrollbar-thin::-webkit-scrollbar-track {
        background: transparent;
    }

    .scrollbar-thin::-webkit-scrollbar-thumb {
        background: var(--border-color, #e5e7eb);
        border-radius: 2px;
    }

    .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background: var(--link-color, #3b82f6);
    }

    /* Line clamp utility */
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* Enhanced focus ring */
    .focus\:ring-linkColor\/20:focus {
        --tw-ring-color: rgb(59 130 246 / 0.2);
    }

    /* Backdrop blur fallback */
    @supports not (backdrop-filter: blur(4px)) {
        .backdrop-blur-sm {
            background-color: rgba(255, 255, 255, 0.95);
        }

        .dark .backdrop-blur-sm {
            background-color: rgba(0, 0, 0, 0.95);
        }
    }

    /* Smooth animations */
    .transition-all {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Keyboard shortcuts styling */
    kbd {
        font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
        font-weight: 500;
    }

    /* Hover effects */
    .group:hover .group-hover\:bg-linkColor\/20 {
        background-color: rgb(59 130 246 / 0.2);
    }

    /* Selection indicator animation */
    @keyframes ping {
        75%,
        100% {
            transform: scale(2);
            opacity: 0;
        }
    }

    .animate-ping {
        animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    /* Bounce animation for selection arrow */
    @keyframes bounce {
        0%,
        100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
        }
        50% {
            transform: none;
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
        }
    }

    .animate-bounce {
        animation: bounce 1s infinite;
    }

    /* Pulse animation for trigger hint */
    @keyframes pulse {
        50% {
            opacity: 0.5;
        }
    }

    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
</style>
