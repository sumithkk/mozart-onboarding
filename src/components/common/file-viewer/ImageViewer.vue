<template>
    <div ref="fileWrapper" class="relative flex h-full w-full flex-1 justify-center">
        <Loading v-if="isLoading" />
        <div v-if="!isLoading" class="bg-white m-[20px] flex h-full w-full items-center justify-center overflow-auto rounded-[10px] p-[20px] shadow-[0_0_5px_0_rgba(0,0,0,0.6)]">
            <img v-if="!error" :src="imageUrl" :alt="'Image preview'" class="max-h-full max-w-full object-contain" @error="handleImageError" />
            <div v-else class="text-destructive">Failed to load image</div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from "vue"

    const props = defineProps({
        fileUrl: {
            type: String,
            required: true,
        },
    })

    const isLoading = ref(true)
    const error = ref(false)
    const imageUrl = ref("")

    async function loadImage() {
        try {
            const response = await fetch(props.fileUrl)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const blob = await response.blob()
            imageUrl.value = URL.createObjectURL(blob)
            isLoading.value = false
        } catch (err) {
            console.error("Error loading image:", err)
            error.value = true
            isLoading.value = false
        }
    }

    function handleImageError() {
        error.value = true
        isLoading.value = false
    }

    onMounted(() => {
        loadImage()
    })
</script>
