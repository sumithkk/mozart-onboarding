<template>
    <!-- Outer wrapper with margin bottom of 60px -->
    <div class="mb-[60px]">
        <!-- Fixed positioned container - positioned above bottom panel -->
        <div class="fixed z-[1000] bottom-32 right-10">
            <!-- Flexible row container, custom border radius, custom gap, custom padding, width to fit content -->
            <div class="flex w-max flex-row items-center px-[10px] pt-[5px] pb-[10px]">
                <!-- Host dropdown: replicate original ~127% width -->
                <div>
                    <RAGSourceDropdown class="rectangle-dropdown" :options="hostOptions" placeholder="Host" label="Host" :defaultValue="service" v-model="service" />
                </div>

                <!-- Source dropdown (no special width) -->
                <div>
                    <RAGSourceDropdown class="rectangle-dropdown" :options="sourceOptions" placeholder="Database" label="Database" :defaultValue="source" v-model="source" />
                </div>

                <!-- Collection dropdown: replicate original 25% width -->
                <div>
                    <RAGCollectionDropdown class="rectangle-dropdown" :options="collectionOptions" placeholder="Collection" label="Collection" :defaultValue="collection" v-model="collection" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, watch } from "vue"

    const ragStore = useRagStore()
    const userStore = useUserStore()
    const route = useRoute()

    // On mount, check if URL has a collection and sync it to the store
    onMounted(() => {
        const urlCollection = route.query.collection as string
        if (urlCollection && ragStore.collections.length > 0) {
            // Verify the collection exists in available options
            const exists = ragStore.collections.some(c => c.name === urlCollection)
            if (exists && urlCollection !== ragStore.currentCollection) {
                ragStore.currentCollection = urlCollection
            }
        }
    })

    // Also watch for when collections are loaded (async) and sync from URL
    watch(() => ragStore.collections, (collections) => {
        const urlCollection = route.query.collection as string
        if (urlCollection && collections.length > 0) {
            const exists = collections.some(c => c.name === urlCollection)
            if (exists && urlCollection !== ragStore.currentCollection) {
                ragStore.currentCollection = urlCollection
            }
        }
    }, { immediate: true })

    const sourceOptions = ref([{ text: "Qdrant DB", value: "qdrant" }])
    const hostOptions = ref([
        { text: "Local", value: "local" },
        { text: "Cloud", value: "cloud" },
    ])

    const collectionOptions = computed(() => {
        const options: Array<{ text: string; value: string }> = []

        for (const collection of ragStore.collections) {
            // Filter by current Qdrant instance
            if (collection.service && collection.service !== ragStore.currentQdrantInstance) continue
            options.push({ text: collection.alias || collection.name, value: collection.name })
        }

        // Only auto-select if NO collection is currently set AND we have options
        if (!ragStore.currentCollection && options.length > 0) {
            // Priority 1: URL collection
            const urlCollection = route.query.collection as string
            if (urlCollection) {
                const urlExists = options.find(o => o.value === urlCollection)
                if (urlExists) {
                    ragStore.currentCollection = urlCollection
                    return options
                }
            }
            
            // Priority 2: User's default collection
            if (userStore.defaultCollection) {
                const defaultExists = options.find(o => o.value === userStore.defaultCollection)
                if (defaultExists) {
                    ragStore.currentCollection = userStore.defaultCollection
                    return options
                }
            }
            
            // Priority 3: First available option
            ragStore.currentCollection = options[0].value
        }

        return options
    })

    const source = ref("qdrant")

    const service = computed({
        get() {
            return ragStore.currentQdrantInstance
        },
        set(newService) {
            if (newService !== ragStore.currentQdrantInstance) {
                ragStore.currentQdrantInstance = newService
            }
        },
    })

    const collection = computed({
        get() {
            // Reset offsets whenever the collection changes
            ragStore.isLoading = true
            ragStore.currentMaxOffset = 0
            ragStore.previousMaxOffset = 0
            ragStore.currentMinOffset = 0
            ragStore.previousMinOffset = 0
            return ragStore.currentCollection
        },
        set(newCollection) {
            if (newCollection !== ragStore.currentCollection) {
                ragStore.currentCollection = newCollection
                ragStore.currentMaxOffset = 0
                ragStore.previousMaxOffset = 0
                ragStore.currentMinOffset = 0
                ragStore.previousMinOffset = 0
            }
        },
    })
</script>
