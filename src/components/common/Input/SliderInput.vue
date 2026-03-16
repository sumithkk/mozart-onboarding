<template>
    <div class="text-textColor m-5 w-[300px]">
        <label :for="sliderId" class="mb-2.5 block text-base"> {{ label }}: {{ size }} </label>
        <input
            type="range"
            :id="sliderId"
            v-model="size"
            :min="100"
            :max="max"
            :step="100"
            @input="updateChunkSize"
            :style="{
                background: `linear-gradient(90deg, var(--logoColor) ${sliderPercentage}%, #ddd ${sliderPercentage}%)`,
            }"
            class="[&::-moz-range-thumb]:border-primaryColor [&::-moz-range-thumb]:bg-strokeColor2 [&::-webkit-slider-thumb]:border-primaryColor [&::-webkit-slider-thumb]:bg-strokeColor2 h-[10px] w-full appearance-none rounded bg-[#ddd] opacity-100 transition-opacity duration-200 outline-none [&::-moz-range-thumb]:h-[25px] [&::-moz-range-thumb]:w-[25px] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-webkit-slider-thumb]:h-[25px] [&::-webkit-slider-thumb]:w-[25px] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, defineProps, defineEmits } from "vue"

    // Define props
    const props = defineProps({
        sliderId: String,
        size: {
            type: Number,
            required: true,
        },
        label: String,
        max: {
            type: Number,
            required: true,
        },
        min: Number,
        step: Number,
    })

    // Emit
    const emit = defineEmits(["update:modelValue"])

    // Local state
    const size = ref(props.size)

    // Computed slider fill percentage
    const sliderPercentage = computed(() => (size.value / props.max) * 100)

    // Update chunk size & emit
    const updateChunkSize = (event: Event) => {
        const input = event.target as HTMLInputElement
        size.value = Number(input.value)
        emit("update:modelValue", size.value)
    }
</script>
