<template>
    <div class="h-full w-full overflow-auto">
        <UserInfo />
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
        title: "Profile Information | Mozart",
        meta: [
            {
                name: "description",
                content: "Manage your personal information, name, email, role, and profile picture settings.",
            },
            {
                name: "keywords",
                content: "profile, personal information, user settings, account details",
            },
        ],
    })
</script>

<style scoped></style>
