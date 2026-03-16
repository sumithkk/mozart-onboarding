<template>
    <div class="space-y-4">
        <!-- Skeleton for "Conversations" header -->
        <div class="flex items-center py-6 text-sm">
            <div class="bg-muted h-4 w-32 animate-pulse rounded"></div>
        </div>

        <!-- Skeleton for conversation groups -->
        <div class="space-y-6">
            <!-- First group -->
            <div class="space-y-3">
                <div class="bg-muted h-3 w-24 animate-pulse rounded"></div>
                <div class="space-y-2">
                    <div v-for="i in listCount" :key="i" class="flex items-center justify-between gap-x-3.5 rounded-xl p-2 px-2.5 py-2">
                        <div class="flex items-center gap-2">
                            <div class="bg-muted h-5 w-5 animate-pulse rounded"></div>
                            <div class="bg-muted h-4 w-40 animate-pulse rounded"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Second group -->
            <div class="space-y-3">
                <div class="bg-muted h-3 w-24 animate-pulse rounded"></div>
                <div class="space-y-2">
                    <div v-for="i in Math.floor(listCount * 0.67)" :key="i" class="flex items-center justify-between gap-x-3.5 rounded-xl p-2 px-2.5 py-2">
                        <div class="flex items-center gap-2">
                            <div class="bg-muted h-5 w-5 animate-pulse rounded"></div>
                            <div class="bg-muted h-4 w-40 animate-pulse rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    interface Props {
        listCount?: number;
    }

    withDefaults(defineProps<Props>(), {
        listCount: 3,
    });
</script>
