<template>
    <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">Density:</span>
        <div class="flex items-center overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
            <button
                v-for="option in densityOptions"
                :key="option.value"
                @click="updateDensity(option.value)"
                :class="[
                    'px-3 py-1.5 text-xs font-medium transition-all duration-200',
                    'hover:bg-gray-50 dark:hover:bg-gray-800',
                    'focus:ring-primary-500 focus:ring-2 focus:ring-offset-1 focus:outline-none',
                    currentDensity === option.value ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 border-primary-200 dark:border-primary-800' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
                ]"
                :title="option.description"
                :aria-label="`Set table density to ${option.label}`"
            >
                {{ option.label }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, watch } from "vue"

    export interface DensityOption {
        value: "small" | "medium" | "large"
        label: string
        description: string
        rowHeight: string
        fontSize: string
        padding: string
    }

    const props = withDefaults(
        defineProps<{
            modelValue?: "small" | "medium" | "large"
            disabled?: boolean
        }>(),
        {
            modelValue: "medium",
            disabled: false,
        }
    )

    const emit = defineEmits<{
        "update:modelValue": [value: "small" | "medium" | "large"]
        "density-change": [option: DensityOption]
    }>()

    const currentDensity = ref<"small" | "medium" | "large">(props.modelValue)

    const densityOptions: DensityOption[] = [
        {
            value: "small",
            label: "Small",
            description: "Compact view with smaller rows and text",
            rowHeight: "h-8",
            fontSize: "text-xs",
            padding: "px-3 py-1.5",
        },
        {
            value: "medium",
            label: "Medium",
            description: "Standard view with balanced spacing",
            rowHeight: "h-10",
            fontSize: "text-sm",
            padding: "px-4 py-2",
        },
        {
            value: "large",
            label: "Large",
            description: "Spacious view with larger rows and text",
            rowHeight: "h-12",
            fontSize: "text-base",
            padding: "px-4 py-3",
        },
    ]

    const updateDensity = (value: "small" | "medium" | "large") => {
        if (props.disabled) return

        currentDensity.value = value
        const option = densityOptions.find((opt) => opt.value === value)

        emit("update:modelValue", value)
        if (option) {
            emit("density-change", option)
        }
    }

    // Watch for external changes to modelValue
    watch(
        () => props.modelValue,
        (newValue) => {
            if (newValue && newValue !== currentDensity.value) {
                currentDensity.value = newValue
            }
        }
    )

    // Get current density option
    const getCurrentOption = () => {
        return densityOptions.find((opt) => opt.value === currentDensity.value) || densityOptions[1]
    }

    // Expose methods for parent components
    defineExpose({
        getCurrentOption,
        updateDensity,
    })
</script>

<style scoped>
    /* Ensure consistent button sizing */
    button {
        min-width: 60px;
        white-space: nowrap;
    }

    /* Smooth transitions for density changes */
    * {
        transition: all 0.2s ease-in-out;
    }
</style>
