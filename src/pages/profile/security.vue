<template>
    <div class="h-full w-full overflow-auto">
        <Security />
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
        title: "Security Settings | Mozart",
        meta: [
            {
                name: "description",
                content: "Manage your account security, change passwords, and configure security preferences for your Mozart account.",
            },
            {
                name: "keywords",
                content: "security, password, account security, security settings, password change",
            },
        ],
    })
</script>

<style scoped></style>
