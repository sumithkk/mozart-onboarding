<template>
    <div class="flex flex-1 flex-col items-center justify-center p-5">
        <div class="bg-primary text-foreground hover:bg-primary cursor-pointer rounded px-4 py-2" @click="goToGDriveIntegration">Google Drive</div>
    </div>
</template>
<script setup lang="ts">
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })
    useHead({
        title: "Integrations",
    })
    const router = useRouter()

    const goToGDriveIntegration = () => {
        router.push("/integrations/google")
    }
</script>
