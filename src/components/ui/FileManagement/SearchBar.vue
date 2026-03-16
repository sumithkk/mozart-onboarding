<script setup lang="ts">
    import { ref } from "vue"
    import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline"

    const emit = defineEmits<{
        (e: "search", query: string): void
    }>()

    const searchQuery = ref("")

    const handleSearch = () => {
        emit("search", searchQuery.value)
    }
</script>
<template>
    <div class="relative">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon class="icons-md text-neutral-400 dark:text-neutral-500" />
        </div>
        <input
            type="text"
            v-model="searchQuery"
            @input="handleSearch"
            placeholder="Search in Workbench..."
            class="block w-full rounded-full border border-neutral-300 bg-white py-3 pr-4 pl-12 leading-5 placeholder-neutral-500 focus:border-mozart-blue-500 focus:placeholder-neutral-400 focus:ring-1 focus:ring-mozart-blue-500 focus:outline-none sm:text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400 dark:focus:border-mozart-blue-500 dark:focus:ring-mozart-blue-500"
        />
    </div>
</template>
