<template>
    <div class="flex flex-col items-center gap-4">
        <!-- Camera Icon Button -->
        <button @click="startCamera" class="bg-sideBarBackgroundColor text-textColor hover:bg-itemColor focus:ring-logoColor focus:ring-opacity-50 bg-input flex items-center justify-center rounded-full p-1 px-2 shadow-sm transition-all duration-200 focus:ring-1 focus:outline-none">
            <span class="materialSymbolsFilled text-2xl">photo_camera</span>
        </button>

        <!-- Camera Modal -->
        <div v-if="cameraVisible" class="popup-wrapper active-popup">
            <div class="popup-container !h-auto !max-h-[90vh] !w-[95%] !max-w-4xl">
                <!-- Modal Header -->
                <div class="border-border flex items-center justify-between border-b p-4 md:p-6">
                    <h3 class="px18 text-textColor font-bold">Camera</h3>
                    <button @click="stopCamera" class="text-unselectedColor hover:bg-itemColor hover:text-textColor focus:ring-logoColor focus:ring-opacity-50 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 focus:ring-2 focus:outline-none">
                        <span class="materialSymbolsOutlined text-xl">close</span>
                    </button>
                </div>

                <!-- Modal Content -->
                <div class="flex-1 overflow-auto p-4 md:p-6">
                    <!-- Live Camera Preview -->
                    <video v-if="!imageSrc" ref="video" autoplay class="border-border bg-backgroundColor mb-4 w-full rounded-lg border shadow-sm" style="aspect-ratio: 4/3; object-fit: cover" />

                    <!-- Captured Image -->
                    <img v-if="imageSrc" :src="imageSrc" class="border-border mb-4 w-full rounded-lg border shadow-sm" style="aspect-ratio: 4/3; object-fit: cover" />

                    <!-- Hidden Canvas -->
                    <canvas ref="canvas" width="640" height="480" class="hidden" />
                </div>

                <!-- Modal Footer with Control Buttons -->
                <div class="border-border border-t p-4 md:p-6">
                    <div class="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                        <!-- Capture Button -->
                        <button
                            v-if="cameraActive && !imageSrc"
                            @click="captureImage"
                            class="tooltip border-border bg-sideBarBackgroundColor text-textColor hover:border-logoColor hover:border-border hover:text-white focus:ring-logoColor focus:ring-opacity-50 flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-200 focus:ring-2 focus:outline-none md:h-14 md:w-14"
                        >
                            <span class="materialSymbolsFilled text-xl md:text-2xl">add_a_photo</span>
                            <span class="tooltiptext">Capture Photo</span>
                        </button>

                        <!-- Download Button -->
                        <button
                            v-if="imageSrc"
                            :disabled="isLoading"
                            class="tooltip border-border bg-sideBarBackgroundColor text-textColor hover:border-logoColor hover:border-border hover:text-white focus:ring-logoColor focus:ring-opacity-50 flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-200 focus:ring-2 focus:outline-none md:h-14 md:w-14"
                        >
                            <a :href="imageSrc" download="captured-image.jpg"> <span class="materialSymbolsFilled text-xl md:text-2xl">download</span> <span class="tooltiptext">Download Image</span></a>
                        </button>

                        <!-- Upload Button -->
                        <button
                            v-if="imageSrc && capturedFile"
                            @click="uploadImage"
                            :disabled="isLoading"
                            class="tooltip border-border bg-sideBarBackgroundColor text-textColor hover:border-logoColor hover:border-border hover:text-white focus:ring-logoColor focus:ring-opacity-50 flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-200 focus:ring-2 focus:outline-none md:h-14 md:w-14"
                        >
                            <span class="materialSymbolsFilled text-xl md:text-2xl">upload</span>
                            <span class="tooltiptext">Upload Image</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { ref, onUnmounted, nextTick } from "vue"
    import { v4 as uuidv4 } from "uuid"
    const cameraVisible = ref<boolean>(false)
    const isLoading = ref<boolean>(false)
    const cameraActive = ref<boolean>(false)
    const imageSrc = ref<string | null>(null)
    const capturedFile = ref<File | null>(null)

    const video = ref<HTMLVideoElement | null>(null)
    const canvas = ref<HTMLCanvasElement | null>(null)
    const cameraStream = ref<MediaStream | null>(null)

    const fileSystem = useFileSystem()
    const fileSystemStore = useFileSystemStore()
    const userStore = useUserStore()

    async function startCamera(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" } },
            })

            cameraStream.value = stream
            cameraVisible.value = true
            imageSrc.value = null
            capturedFile.value = null

            await nextTick()

            if (video.value) {
                video.value.srcObject = stream
                cameraActive.value = true
            } else {
                console.warn("Video element not found")
            }
        } catch (err) {
            console.error("Camera error:", err)
            alert("Could not access camera. Please allow permissions and try again.")
        }
    }

    function stopCamera(): void {
        if (cameraStream.value) {
            cameraStream.value.getTracks().forEach((track) => track.stop())
            cameraStream.value = null
        }

        if (video.value) {
            video.value.srcObject = null
        }

        cameraActive.value = false
        cameraVisible.value = false
        imageSrc.value = null
        capturedFile.value = null
    }

    async function captureImage(): Promise<void> {
        if (!canvas.value || !video.value) return

        const ctx = canvas.value.getContext("2d")
        if (!ctx) return

        ctx.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height)
        imageSrc.value = canvas.value.toDataURL("image/jpeg")

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-")

        canvas.value.toBlob((blob: Blob | null) => {
            if (!blob) return
            const file = new File([blob], `captured-${timestamp}.jpg`, { type: "image/jpeg" })
            capturedFile.value = file
        }, "image/jpeg")
    }

    const uploadImage = async (): Promise<void> => {
        try {
            isLoading.value = true
            if (!capturedFile.value) return

            const file: File = capturedFile.value
            console.log(file)
            const newFile: FileItem = {
                id: `FS_${uuidv4()}`, // Generate a unique ID,
                name: file.name,
                type: "file",
                path: fileSystemStore.currentPath,
                parentFolderId: fileSystemStore.currentFolderId || "",
                size: file.size,
                mimeType: file.type,
                ownerId: userStore.userId,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastModifiedBy: userStore.firstName,
                isStarred: false,
                isTrashed: false,
                isHidden: false,
                isShared: false,
                isSharedWithMe: false,
                status: "uploaded",
            }
            await fileSystem.createFile(() => {}, file, newFile)

            stopCamera()
            isLoading.value = false
        } catch (error) {
            console.error("Upload error:", error)
        } finally {
            isLoading.value = false
        }
    }
    onUnmounted(() => {
        stopCamera()
    })
</script>
