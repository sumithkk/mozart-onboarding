<template>
    <div class="h-full w-full overflow-auto">
        <UserPreference />
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
        title: "User Preferences | Mozart",
        meta: [
            {
                name: "description",
                content: "Customize your user preferences including font sizes, token usage display, workbench settings, and more.",
            },
            {
                name: "keywords",
                content: "user preferences, settings, customization, UI preferences, workbench",
            },
        ],
    })
</script>

<style scoped></style>
