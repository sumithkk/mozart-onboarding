<template>
    <div class="flex items-center justify-center">
        <div :class="[spinnerBaseClass, spinnerSizeClass]"></div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from "vue"

    const props = defineProps({
        size: {
            type: String,
            default: "xl",
            validator: (value: string) => ["sm", "md", "lg", "xl"].includes(value),
        },
    })

    const sizeMap: Record<string, string> = {
        sm: "w-5 h-5", // 20px
        md: "w-8 h-8", // 32px
        lg: "w-10 h-10", // 40px
        xl: "w-12 h-12", // 48px
    }

    const spinnerBaseClass = "border-4 border-[rgba(0,0,0,0.1)] border-l-unselectedColor rounded-full animate-spin"

    const spinnerSizeClass = computed(() => {
        return sizeMap[props.size] ?? sizeMap["xl"]
    })
</script>
