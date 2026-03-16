<script setup>
    import { ref, watch, defineProps, defineEmits } from "vue"

    const props = defineProps({
        buttonText: {
            type: String,
            required: true,
        },
        isLoading: {
            type: Boolean,
            default: false,
            required: false,
        },
    })

    const emit = defineEmits(["click"])
    const localIsLoading = ref(false)
    watch(
        () => props.isLoading,
        (newValue) => {
            localIsLoading.value = newValue
        }
    )
    function handleClick() {
        if (!localIsLoading.value) {
            emit("click")
        }
    }
</script>

<template>
    <button @click="handleClick" :disabled="localIsLoading" class="relative flex min-h-10 min-w-28 items-center justify-center rounded-lg bg-[#2839a4] text-white hover:bg-[#2839a4] disabled:cursor-not-allowed disabled:bg-gray-400">
        <span class="absolute transition duration-200" :class="{ 'pointer-events-none opacity-0': localIsLoading }">
            {{ buttonText }}
        </span>
        <div v-if="localIsLoading" class="absolute flex items-center justify-center">
            <div class="border-border h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"></div>
        </div>
    </button>
</template>
