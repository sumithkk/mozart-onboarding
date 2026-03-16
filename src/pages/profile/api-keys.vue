<template>
    <div class="h-full w-full overflow-auto">
        <ApiKeys />
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
        title: "API Keys Management | Mozart",
        meta: [
            {
                name: "description",
                content: "Manage your API keys for various AI services including OpenAI, Anthropic, Cohere, and more.",
            },
            {
                name: "keywords",
                content: "API keys, OpenAI, Anthropic, Cohere, AI services, API management",
            },
        ],
    })
</script>

<style scoped></style>
