<template>
    <div v-if="log.text && !log.expandRow">
        <span class="text-muted-foreground text-sm italic"> Expand to Display </span>
    </div>
    <div v-else v-html="log.text"></div>
</template>

<script setup lang="ts">
    const props = defineProps<{
        log: any
    }>()
    const { log } = props
</script>
