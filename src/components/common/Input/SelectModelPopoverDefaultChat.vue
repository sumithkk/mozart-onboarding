<template>
    <!-- SelectModelPopoverDefaultChat -->
    <div class="relative inline-block">
        <!-- Trigger slot (e.g., the button) -->
        <slot></slot>

        <!-- Dropdown popover -->
        <div v-if="showModels" ref="dropdownRef" @scroll="handleScroll" @mousemove="handleMouseMove" class="border-strokeColor bg-sideBarBackgroundColor text-textColor absolute bottom-[125%] left-5 z-[10] max-h-52 w-60 overflow-x-hidden overflow-y-auto rounded-md border p-2 text-center shadow-lg">
            <!-- Model list -->
            <div v-for="model in sortedModels" :key="model.model" class="hover:bg-strokeColor hover:text-textColor my-1 flex w-full cursor-pointer items-center rounded-md" @click="selectModel(model)" :class="model.model === currentModel.model ? 'bg-itemColor' : ''">
                <div class="flex w-full items-center justify-between px-2 py-1" v-if="model.isEnabled">
                    <VTooltip :disabled="isScrolling || isUserInteracting">
                        <div class="flex items-center space-x-2">
                            <!-- Model image -->
                            <img :src="model.image" alt="Model Image" class="m-1 h-5 w-5 object-cover" />

                            <!-- Model Info -->
                            <div class="text-left">
                                <p class="text-sm font-bold">{{ model.name }}</p>
                                <p class="text-textColor hover:text-textColor truncate text-xs">
                                    {{ trimModelDescription(model.description) }}
                                </p>
                            </div>
                        </div>
                        <template #popper>{{ model.description }}</template>
                    </VTooltip>

                    <!-- Active model indicator -->
                    <span v-if="model.model === currentModel.model" class="bg-logoColor inline-block h-3 w-3 rounded-full"></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref, onMounted, onUnmounted } from "vue"

    // Props
    defineProps<{
        modelsList: Array<any>
        showModels: boolean
    }>()

    // Emits
    const emit = defineEmits<{
        (event: "toggleModel"): void
    }>()

    // Store
    const modelStore = useModelStore()

    // Scroll detection
    const isScrolling = ref(false)
    const isUserInteracting = ref(false)
    const dropdownRef = ref<HTMLElement | null>(null)
    let scrollTimeout: NodeJS.Timeout | null = null
    let interactionTimeout: NodeJS.Timeout | null = null

    // Sorted model list (current model goes to top)
    const currentModel = computed(() => modelStore.getCurrent())
    const sortedModels = computed(() => {
        const allModels = [...modelStore.models]
        const currentIndex = allModels.findIndex((m) => m.model === currentModel.value.model)
        if (currentIndex !== -1) {
            const [currentModelItem] = allModels.splice(currentIndex, 1)
            allModels.unshift(currentModelItem)
        }
        return allModels
    })

    const trimModelDescription = (description: string) => {
        return description.length > 20 ? description.substring(0, 20) + "..." : description
    }

    // Scroll event handler
    const handleScroll = () => {
        isScrolling.value = true
        isUserInteracting.value = true

        // Clear existing timeouts
        if (scrollTimeout) clearTimeout(scrollTimeout)
        if (interactionTimeout) clearTimeout(interactionTimeout)

        // Set timeout to re-enable tooltips after scrolling stops
        scrollTimeout = setTimeout(() => {
            isScrolling.value = false
        }, 150)

        interactionTimeout = setTimeout(() => {
            isUserInteracting.value = false
        }, 200)
    }

    // Mouse interaction handlers
    const handleMouseMove = () => {
        if (isScrolling.value) {
            isUserInteracting.value = true
            if (interactionTimeout) clearTimeout(interactionTimeout)
            interactionTimeout = setTimeout(() => {
                isUserInteracting.value = false
            }, 100)
        }
    }

    // Lifecycle hooks
    onMounted(() => {
        // Add scroll listeners to potential scroll containers
        window.addEventListener("scroll", handleScroll, { passive: true })
        document.addEventListener("scroll", handleScroll, { passive: true })
    })

    onUnmounted(() => {
        // Clean up event listeners
        window.removeEventListener("scroll", handleScroll)
        document.removeEventListener("scroll", handleScroll)

        // Clear timeout
        if (scrollTimeout) {
            clearTimeout(scrollTimeout)
        }
        if (interactionTimeout) {
            clearTimeout(interactionTimeout)
        }
    })

    // On model select
    const selectModel = (model: any) => {
        modelStore.setCurrent(model)
        emit("toggleModel")
    }
</script>
