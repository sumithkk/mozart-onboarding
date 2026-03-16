<template>
    <button
        @click="handleClick"
        :disabled="localIsLoading"
        class="border-logoColor bg-logoColor transform-gpu cursor-pointer rounded-[0.5rem] border-2 p-[0.2rem] px-3 text-center text-[1rem] font-[800] text-nowrap text-white transition-all duration-300 ease-in-out focus:outline-none focus-visible:scale-105 focus-visible:[box-shadow:0_0_0_2px_var(--strokeColor)]"
        :class="[
            customClass,
            {
                'hover:bg-headerTextColor hover:text-logoColor': !localIsLoading,
                'cursor-not-allowed opacity-50': localIsLoading,
            },
        ]"
    >
        {{ localIsLoading ? "Saving..." : buttonText }}
    </button>
</template>
<script setup lang="ts">
    import { ref, watch, defineProps, defineEmits } from "vue"

    const props = defineProps({
        buttonText: {
            type: String,
            required: true,
        },
        customClass: {
            type: String,
            required: false,
            default: "",
        },
        loaderStatus: {
            type: Boolean,
            default: false,
            required: false,
        },
    })

    const emit = defineEmits(["clicked"])
    const localIsLoading = ref(false)
    watch(
        () => props.loaderStatus,
        (newValue) => {
            localIsLoading.value = newValue
        }
    )
    function handleClick() {
        if (!localIsLoading.value) {
            emit("clicked")
        }
    }
</script>
