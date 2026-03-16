<script setup lang="ts">
    import { RouterLink } from "vue-router"
    import { FolderIcon, StarIcon, TrashIcon } from "@heroicons/vue/24/outline"

    const navigation = [
        { name: "My Files", to: "/files", icon: FolderIcon },
        { name: "Starred", to: "/files?filter=starred", icon: StarIcon },
        { name: "Trash", to: "/files?filter=trash", icon: TrashIcon },
    ]
</script>

<template>
    <nav class="bg-background bg-background">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex h-16 items-center justify-between">
                <div class="flex items-center">
                    <RouterLink to="/" class="text-foreground text-foreground text-xl font-bold"> File Manager </RouterLink>
                    <div class="ml-10 flex items-baseline space-x-4">
                        <RouterLink v-for="item in navigation" :key="item.name" :to="item.to" class="text-muted-foreground hover:bg-secondary hover:text-foreground text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium" active-class="bg-background bg-card text-foreground">
                            <component :is="item.icon" class="h-5 w-5" />
                            {{ item.name }}
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>
