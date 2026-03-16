<template>
    <!-- Wrapper: replace .modelsWrapper -->
    <div class="group relative inline-block">
        <slot></slot>

        <!-- Tooltip-like list; only shown if showWritingStyle is true -->
        <span v-if="showWritingStyle" class="/* Base styles */ /* Positioning (bottom + left, with negative margin-left) */ /* Colors and borders, using CSS variables or Tailwind colors */ border-strokeColor bg-sideBarBackgroundColor text-textColor absolute -top-36 bottom-6 left-1/2 z-[1] -ml-7 h-32 w-60 overflow-y-scroll rounded-md border p-1 text-center">
            <!-- Writing Styles loop -->
            <div v-for="writingStyle in writingStyles" :key="writingStyle.value" class="hover:bg-strokeColor my-1 flex w-full cursor-pointer items-center rounded-md" @click="selectWritingStyle(writingStyle)" :style="writingStyle.value === userStore.writingStyle ? 'background-color: var(--itemColor)' : ''">
                <div class="flex w-full items-center justify-between px-2">
                    <div class="flex items-center space-x-2">
                        <!-- Writing Style Text -->
                        <div class="materialSymbolsOutlined text-sm">draw</div>
                        <p class="text-left font-bold">{{ writingStyle.text }}</p>
                    </div>
                    <span v-if="writingStyle.value === userStore.writingStyle" class="bg-logoColor inline-block h-3 w-3 rounded-full"></span>
                </div>
            </div>
        </span>
    </div>
</template>

<script setup lang="ts">
    defineProps({
        showWritingStyle: Boolean,
    })
    const userStore = useUserStore()
    const emit = defineEmits(["toggleWritingStyle"])
    const writingStyles = ref([
        {
            text: "Formal",
            value: "formal",
        },
        {
            text: "Casual",
            value: "casual",
        },
        {
            text: "Concise",
            value: "concise",
        },
        {
            text: "Creative",
            value: "creative",
        },
    ])
    const selectWritingStyle = (writingStyle: any) => {
        userStore.writingStyle = writingStyle.value
        emit("toggleWritingStyle")
    }
</script>
