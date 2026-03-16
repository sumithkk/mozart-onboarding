<template>
    <div class="h-full w-full">
        <OrganizationManagement />
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
        title: "Organization Management | Mozart",
        meta: [
            {
                name: "description",
                content: "Manage your organizations, add team members, assign roles, update organization settings, and control access permissions for collaborative AI workspaces.",
            },
            {
                name: "keywords",
                content: "organization management, team management, user roles, access control, team collaboration, member invitation, organization settings, team administration, workspace management, user permissions",
            },
        ],
    })
</script>

<style scoped></style>
