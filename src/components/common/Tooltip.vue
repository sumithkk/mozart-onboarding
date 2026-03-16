<template>
    <!-- Wrap the tooltip in a "group" to manage hover states -->
    <div class="group relative inline-block">
        <slot></slot>

        <!-- HTML content version -->
        <span v-if="isHTML" v-html="htmlContent" class="text-foreground invisible absolute bottom-full left-1/2 z-10 max-w-[300px] min-w-[120px] -translate-x-1/2 rounded bg-[#555] px-2 py-1 text-center break-words whitespace-normal opacity-0 transition-[bottom,opacity] duration-300 ease-in-out group-hover:visible group-hover:bottom-[125%] group-hover:opacity-100"></span>

        <!-- Plain text version -->
        <span v-else class="text-foreground invisible absolute bottom-full left-[-1.5rem] z-10 max-w-[300px] min-w-[120px] -translate-x-1/2 rounded bg-[#555] px-2 py-1 text-center break-words whitespace-normal opacity-0 transition-[bottom,opacity] duration-300 ease-in-out group-hover:visible group-hover:bottom-[125%] group-hover:opacity-100">
            {{ text }}
        </span>
    </div>
</template>

<script setup lang="ts">
    defineProps({
        text: {
            type: String,
            required: true,
        },
        isHTML: Boolean,
        htmlContent: String,
    })
</script>
