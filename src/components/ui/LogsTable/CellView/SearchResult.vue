<template>
    <div v-if="log.search_results && log.search_results.length && !log.expandRow">
        <span class="text-muted-foreground text-sm italic"> Expand to Display </span>
    </div>
    <div v-else-if="log.search_results && log.search_results.length && log.expandRow">
        <ul class="list-inside space-y-3">
            <li v-for="(source, index) in log.search_results" :key="index" class="border-border bg-secondary rounded-md border p-2">
                <p class="text-foreground font-semibold">
                    {{ source.title }}
                    <span v-if="source.pageNumber" class="text-muted-foreground ml-1 text-xs"> (Page {{ source.pageNumber }}) </span>
                </p>
                <p class="text-muted-foreground mt-1 text-sm">
                    {{ source.paragraph }}
                </p>
                <p class="mt-1">
                    <a :href="source.url" target="_blank" class="text-primary hover:text-primary underline"> View Document </a>
                </p>
            </li>
        </ul>
    </div>

    <!-- If no sources, show a simple message -->
    <div v-else>
        <span class="text-muted-foreground text-sm italic"> No sources available </span>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps<{
        log: any
    }>()

    const { log } = props
</script>
