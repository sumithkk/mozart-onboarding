<template>
    <div class="space-y-4">
        <!-- Chart skeleton -->
        <div class="border-strokeColor bg-surfaceColor flex h-[280px] w-full items-center justify-center rounded-xl border transition-all duration-300 ease-in-out md:h-80">
            <div class="relative transition-opacity duration-300 ease-in-out">
                <!-- Animated donut skeleton -->
                <div class="border-strokeColor h-48 w-48 animate-pulse rounded-full border-8"></div>
                <div class="border-strokeColor2 absolute inset-4 animate-pulse rounded-full border-8 transition-opacity duration-300 ease-in-out"></div>
                <div class="bg-surfaceColor absolute inset-8 rounded-full transition-opacity duration-300 ease-in-out"></div>
            </div>
        </div>

        <!-- Legend skeleton -->
        <div class="grid grid-cols-2 gap-3 transition-all duration-300 ease-in-out sm:grid-cols-3">
            <div v-for="i in legendItems" :key="i" class="flex items-center gap-2">
                <div class="animate-shimmer bg-strokeColor h-4 w-4 rounded-sm"></div>
                <div class="animate-shimmer bg-strokeColor h-4 w-20 rounded"></div>
            </div>
        </div>

        <!-- Summary skeleton -->
        <div v-if="showSummary" class="border-strokeColor border-t pt-4 transition-all duration-300 ease-in-out">
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div v-for="i in 3" :key="`summary-${i}`" class="text-center">
                    <div class="animate-shimmer bg-strokeColor mb-2 h-6 rounded"></div>
                    <div class="animate-shimmer bg-strokeColor2 mx-auto h-3 w-16 rounded"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    // Define props with defaults
    const props = defineProps({
        legendItems: {
            type: Number,
            default: 6,
        },
        showSummary: {
            type: Boolean,
            default: true,
        },
        chartHeight: {
            type: String,
            default: "h-80",
        },
    })
</script>

<style scoped>
    .animate-shimmer {
        background: linear-gradient(90deg, var(--strokeColor) 25%, var(--strokeColor2) 50%, var(--strokeColor) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
        0% {
            background-position: -200% 0;
        }
        100% {
            background-position: 200% 0;
        }
    }
</style>
