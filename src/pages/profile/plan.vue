<template>
    <div class="h-full w-full overflow-auto">
        <Plan />
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
        title: "Subscription Plan | Mozart",
        meta: [
            {
                name: "description",
                content: "Manage your subscription plan, view current plan details, and upgrade or change your plan as needed.",
            },
            {
                name: "keywords",
                content: "subscription plan, pricing, upgrade plan, billing plan, account plan",
            },
        ],
    })
</script>

<style scoped></style>
