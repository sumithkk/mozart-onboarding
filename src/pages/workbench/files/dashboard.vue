<template>
    <main class="container mx-auto px-4 py-8">
        <FileExplorer />
    </main>
</template>
<script lang="ts" setup>
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })
    useHead({
        title: "Workbench",
    })

    // -------------------| Props |-------------------
    const props = defineProps({
        isMobile: Boolean,
    })

    const documentStore = useDocumentsStore()

    onMounted(async () => {
        await documentStore.fetchNotes()
    })
</script>
