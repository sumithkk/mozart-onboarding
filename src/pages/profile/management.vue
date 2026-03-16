<template>
    <div class="h-full w-full overflow-auto">
        <UserManagement />
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
        title: "User Management | Mozart",
        meta: [
            {
                name: "description",
                content: "Manage user access, roles, and permissions across your organization. View and administer team members.",
            },
            {
                name: "keywords",
                content: "user management, team management, permissions, roles, organization admin",
            },
        ],
    })
</script>

<style scoped></style>
