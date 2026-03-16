<template>
    <span class="bg-linkColor/10 text-linkColor border-linkColor/20 hover:bg-linkColor/20 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200">
        <div class="flex items-center gap-1">
            <div class="bg-linkColor/20 text-linkColor flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
                {{ toolName.charAt(0).toUpperCase() }}
            </div>
            <span>{{ toolName }}</span>
        </div>
        <button @click="$emit('remove')" class="hover:bg-linkColor/30 group ml-1 flex h-4 w-4 items-center justify-center rounded-full transition-colors duration-150" type="button">
            <svg class="text-linkColor group-hover:text-linkColor h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    </span>
</template>

<script setup lang="ts">
    defineProps<{
        toolName: string
    }>()

    defineEmits<{
        remove: []
    }>()
</script>

<style scoped>
    /* Additional hover effects */
    .group:hover svg {
        transform: scale(1.1);
    }
</style>
