<template>
    <div class="h-full w-full overflow-auto">
        <UserChatDashboard />
    </div>
</template>

<script setup lang="ts">
    // Profile layout and auth middleware
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    // SEO and meta tags
    useHead({
        title: "Usage Analytics | Mozart",
        meta: [
            {
                name: "description",
                content: "View detailed analytics of your token usage, costs, and conversation statistics across different AI models.",
            },
            {
                name: "keywords",
                content: "analytics, token usage, costs, statistics, AI usage, conversation analytics",
            },
        ],
    })
</script>

<style scoped></style>
