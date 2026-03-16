<template>
    <div class="h-full w-full overflow-auto">
        <Billing />
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
        title: "Billing & Payments | Mozart",
        meta: [
            {
                name: "description",
                content: "Manage your billing information, view invoices, update payment methods, and track subscription history.",
            },
            {
                name: "keywords",
                content: "billing, payments, invoices, payment methods, subscription billing, payment history",
            },
        ],
    })
</script>

<style scoped></style>
