<template>
    <!-- This page redirects to /profile/info for backward compatibility -->
</template>

<script setup lang="ts">
    // Profile layout and auth middleware
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    // Handle legacy query parameter routing for backward compatibility
    const route = useRoute()
    const router = useRouter()
    const idx = Number(route.query.index)

    if (!isNaN(idx)) {
        const routeMap: { [key: number]: string } = {
            0: "/profile/info",
            1: "/profile/preferences",
            3: "/profile/model",
            4: "/profile/api-keys",
            5: "/profile/plan",
            6: "/profile/billing",
            7: "/profile/management",
            8: "/profile/security",
            9: "/profile/analytics",
            10: "/profile/integrations",
            11: "/profile/organization",
        }
        const targetRoute = routeMap[idx] || "/profile/info"
        router.replace(targetRoute)
    } else {
        // Default redirect to profile info page
        router.replace("/profile/info")
    }
</script>

<style scoped></style>
