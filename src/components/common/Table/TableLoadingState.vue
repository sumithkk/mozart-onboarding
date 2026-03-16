<template>
    <div class="bg-backgroundColor flex items-center justify-center" :class="[customClass]">
        <div class="flex flex-col items-center gap-4 p-8">
            <div class="text-center">
                <p class="mb-1 text-lg font-medium text-gray-500">{{ customTitle }}</p>
                <p class="text-sm text-gray-500">Fetching data, please wait...</p>
            </div>
            <div class="flex gap-1">
                <div class="h-2 w-2 animate-bounce rounded-full bg-blue-500" style="animation-delay: 0ms"></div>
                <div class="h-2 w-2 animate-bounce rounded-full bg-blue-500" style="animation-delay: 150ms"></div>
                <div class="h-2 w-2 animate-bounce rounded-full bg-blue-500" style="animation-delay: 300ms"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    defineProps({
        customTitle: {
            type: String,
            required: false,
            default: "",
        },
        customClass: {
            type: String,
            required: false,
            default: "!h-[50vh]",
        },
    })
</script>
