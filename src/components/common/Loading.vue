<template>
    <!-- Outer overlay wrapper -->
    <div class="absolute top-0 right-0 left-0 z-[11000] flex h-full w-full items-center justify-center bg-[rgba(20,20,20,0.589)]">
        <!-- Inner loading overlay -->
        <div :class="['flex flex-col items-center justify-center', 'bg-[rgba(255,255,255,0.589)]', 'rounded-[10px] border border-[#a5a5a5]', 'gap-[20px] p-[20px]', overlaySizeClass]">
            <!-- Spinner -->
            <div :class="['border-2 border-[rgba(0,0,0,0.1)]', 'border-l-primaryColor rounded-full', 'animate-spin', spinnerSizeClass]"></div>

            <!-- Optional loading text -->
            <div v-if="text" class="text-textColor text-center text-[12px]">
                {{ text }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from "vue"

    const props = defineProps({
        text: String,
        size: {
            type: String,
            default: "xl",
            validator: (value: string) => ["sm", "md", "lg", "xl"].includes(value),
        },
    })

    /**
     * Map each size prop to the corresponding Tailwind classes.
     */
    const sizeMap = {
        sm: {
            overlay: "w-[80px] h-[80px]",
            spinner: "w-[20px] h-[20px]",
        },
        md: {
            overlay: "w-[100px] h-[100px]",
            spinner: "w-[25px] h-[25px]",
        },
        lg: {
            overlay: "w-[120px] h-[120px]",
            spinner: "w-[30px] h-[30px]",
        },
        xl: {
            overlay: "w-[150px] h-[150px]",
            spinner: "w-[35px] h-[35px]",
        },
    } as const

    /**
     * Compute the Tailwind classes for overlay size.
     */
    const overlaySizeClass = computed(() => sizeMap[props.size as keyof typeof sizeMap]?.overlay ?? sizeMap["xl"].overlay)

    /**
     * Compute the Tailwind classes for spinner size.
     */
    const spinnerSizeClass = computed(() => sizeMap[props.size as keyof typeof sizeMap]?.spinner ?? sizeMap["xl"].spinner)
</script>
