<template>
    <div class="flex items-center">
        <span class="mr-2">Status: {{ progress }}%</span>
        <div class="bg-card h-4 w-full overflow-hidden rounded">
            <div :style="{ width: progress + '%' }" class="bg-logoColor h-full transition-all duration-300"></div>
        </div>
    </div>
</template>

<script setup>
    const props = defineProps({
        progress: {
            type: Number,
            required: true,
        },
    })
</script>
