<template>
    <GoogleDriveIntegration v-if="showGoogleDriveIntegration" />
    <div v-else class="flex flex-1 flex-col items-center justify-center p-5">
        <button class="bg-primary text-foreground hover:bg-primary rounded px-4 py-2 transition-colors duration-200" @click="goToGDriveIntegration">Google Drive</button>
    </div>
</template>

<script setup lang="ts">
    const showGoogleDriveIntegration = ref(false)

    const goToGDriveIntegration = () => {
        showGoogleDriveIntegration.value = true
    }
</script>
