<template>
    <RagLogsTable />
</template>

<script setup lang="ts">
    import { ref, computed } from "vue"

    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })
</script>
