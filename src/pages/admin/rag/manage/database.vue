<template>
    <div class="p-6">
        <h1 class="text-foreground text-foreground mb-4 text-2xl font-bold">Database Management</h1>
        <p class="text-muted-foreground text-muted-foreground">Database management tools will be available here.</p>
    </div>
</template>
<script setup lang="ts">
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    useHead({
        title: "Rag Admin",
    })

    onMounted(async () => {})
</script>

<style scoped></style>
