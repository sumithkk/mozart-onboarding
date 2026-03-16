<template>
    <span class="mt-1 inline-block rounded-full px-3 py-[0.25rem] text-center text-xs font-medium whitespace-nowrap" :class="badgeClass">
        {{ label }}
    </span>
</template>

<script setup lang="ts">
    const props = defineProps<{
        role: string
    }>()

    const permissionMap: Record<string, { label: string; class: string }> = {
        owner: {
            label: "Owner",
            class: "bg-primary/20 text-primary",
        },
        writer: {
            label: "Editor",
            class: "bg-accent/20 text-accent",
        },
        commenter: {
            label: "Commenter",
            class: "bg-accent/20 text-yellow-800",
        },
        reader: {
            label: "Viewer",
            class: "bg-card text-muted-foreground",
        },
    }

    const config = permissionMap[props.role] || {
        label: props.role,
        class: "bg-background text-muted-foreground",
    }

    const label = config.label
    const badgeClass = config.class
</script>
