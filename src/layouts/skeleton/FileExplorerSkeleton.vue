<template>
    <div class="bg-card bg-card flex h-full flex-col rounded-lg shadow">
        <!-- Loading Indicator -->
        <div class="bg-logoColor h-1 w-full animate-pulse" />

        <!-- Breadcrumbs Skeleton -->
        <div class="flex-none p-4">
            <div class="flex items-center space-x-2">
                <div class="bg-secondary bg-secondary h-4 w-24 animate-pulse rounded"></div>
                <div class="bg-secondary bg-secondary h-4 w-4 animate-pulse rounded"></div>
                <div class="bg-secondary bg-secondary h-4 w-32 animate-pulse rounded"></div>
            </div>
        </div>

        <div class="flex-grow overflow-y-auto p-4">
            <!-- Grid View Skeleton -->
            <div v-if="viewMode === 'grid'" class="grid-view-skeleton-container grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                <div v-for="i in 8" :key="i" class="border-border border-border overflow-hidden rounded-lg border">
                    <div class="bg-secondary bg-secondary h-32 animate-pulse sm:h-40"></div>
                    <div class="space-y-2 p-3">
                        <div class="bg-secondary bg-secondary h-4 w-3/4 animate-pulse rounded"></div>
                        <div class="bg-secondary bg-secondary h-3 w-1/2 animate-pulse rounded"></div>
                        <div class="bg-secondary bg-secondary h-3 w-2/3 animate-pulse rounded"></div>
                    </div>
                </div>
            </div>

            <!-- List View Skeleton -->
            <div v-else class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-card bg-card sticky top-0 z-10">
                        <tr>
                            <th class="px-2 py-3 pl-2 text-start sm:px-6 sm:py-4">
                                <div class="bg-secondary bg-secondary h-4 w-24 animate-pulse rounded"></div>
                            </th>
                            <th class="px-1 py-3 text-start sm:px-6 sm:py-4">
                                <div class="bg-secondary bg-secondary h-4 w-16 animate-pulse rounded"></div>
                            </th>
                            <th class="hidden px-1 py-3 text-start sm:table-cell sm:px-6 sm:py-4">
                                <div class="bg-secondary bg-secondary h-4 w-20 animate-pulse rounded"></div>
                            </th>
                            <th class="hidden px-1 py-3 text-start sm:table-cell sm:px-6 sm:py-4">
                                <div class="bg-secondary bg-secondary h-4 w-24 animate-pulse rounded"></div>
                            </th>
                            <th class="px-1 py-3 text-start sm:px-6 sm:py-4">
                                <div class="bg-secondary bg-secondary h-4 w-32 animate-pulse rounded"></div>
                            </th>
                            <th class="w-8 sm:w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="i in 6" :key="i" class="group">
                            <td class="px-2 py-4 whitespace-nowrap sm:px-6">
                                <div class="flex items-center gap-2">
                                    <div class="bg-secondary bg-secondary h-6 w-6 animate-pulse rounded"></div>
                                    <div class="bg-secondary bg-secondary h-4 w-40 animate-pulse rounded"></div>
                                </div>
                            </td>
                            <td class="px-1 py-4 sm:px-6">
                                <div class="bg-secondary bg-secondary h-4 w-16 animate-pulse rounded"></div>
                            </td>
                            <td class="hidden px-1 py-4 sm:table-cell sm:px-6">
                                <div class="bg-secondary bg-secondary h-4 w-24 animate-pulse rounded"></div>
                            </td>
                            <td class="hidden px-1 py-4 sm:table-cell sm:px-6">
                                <div class="bg-secondary bg-secondary h-4 w-20 animate-pulse rounded"></div>
                            </td>
                            <td class="px-1 py-4 sm:px-6">
                                <div class="bg-secondary bg-secondary h-4 w-32 animate-pulse rounded"></div>
                            </td>
                            <td class="px-1 py-4 sm:px-6">
                                <div class="bg-secondary bg-secondary h-4 w-4 animate-pulse rounded"></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    defineProps<{
        viewMode: "grid" | "list"
    }>()
</script>

<style scoped>
    @media screen and (max-width: 640px) {
        .grid-view-skeleton-container {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>
