<template>
    <div>
        <h1>Session Information</h1>
        <p v-if="sessionId">Session ID: {{ sessionId }}</p>
        <p v-else>No session ID provided.</p>
    </div>
</template>

<script setup>
    import { useRoute } from "nuxt/app"

    // Access the route and query parameters
    const route = useRoute()

    // Extract the session_id from the query parameters
    const sessionId = route.query.session_id || null
</script>
