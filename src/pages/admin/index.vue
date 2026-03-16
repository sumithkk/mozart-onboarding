<template>
    <div class="p-6">
        <h1 class="text-foreground text-foreground mb-4 text-2xl font-bold">Admin Dashboard</h1>
        <p class="text-muted-foreground text-muted-foreground">Welcome to the admin panel. Use the sidebar to navigate to different sections.</p>
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
