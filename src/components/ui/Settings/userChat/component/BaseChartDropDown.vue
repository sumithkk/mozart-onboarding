<template>
    <div class="relative">
        <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)" class="border-strokeColor bg-surfaceColor text-textColor hover:border-strokeColor2 focus:border-logoColor focus:ring-logoColor w-full cursor-pointer appearance-none rounded-lg border px-4 py-2 pr-8 text-sm transition-colors duration-200 focus:ring-1 focus:outline-none">
            <option v-for="(option, index) in options" :key="option.value" :value="option.value">
                {{ option.label }}
            </option>
        </select>

        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span class="materialSymbolsOutlined text-textColorSecondary text-sm">expand_more</span>
        </div>
    </div>
</template>

<script setup>
    defineProps({
        modelValue: String,
        options: {
            type: Array,
            required: true,
            default: () => [],
        },
    })
    defineEmits(["update:modelValue"])
</script>
