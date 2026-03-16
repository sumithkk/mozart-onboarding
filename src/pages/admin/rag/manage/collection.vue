<template>
    <div class="flex h-full flex-col">
        <!-- Header / Top Section: Non-scrolling -->
        <div class="flex-none px-6 py-4">
            <!-- Title -->
            <h1 class="mb-2 text-2xl font-semibold">Collection Creator</h1>
            <p class="text-muted-foreground text-muted-foreground mb-4">Create new RAG collections</p>

            <!-- Form -->
            <div class="mb-6 flex flex-wrap gap-4">
                <input type="text" placeholder="Collection Name" class="flex-grow rounded-sm bg-neutral-200 px-4 py-2 text-neutral-800 placeholder-gray-400 focus:outline-none dark:bg-neutral-800 dark:text-neutral-200" v-model="collectionName" />
                <select class="flex-grow rounded-sm bg-neutral-200 px-4 py-2 text-neutral-800 focus:outline-none dark:bg-neutral-800 dark:text-neutral-200" v-model="embeddingMethod">
                    <option v-for="option in modelOptions" :key="option.value" :value="option.value">
                        {{ option.text }}
                    </option>
                </select>
                <select class="flex-grow rounded-sm bg-neutral-200 px-4 py-2 text-neutral-800 focus:outline-none dark:bg-neutral-800 dark:text-neutral-200" v-model="distanceMethod">
                    <option v-for="option in distanceMethodOptions" :key="option.value" :value="option.value">
                        {{ option.text }}
                    </option>
                </select>
                <select class="flex-grow rounded-sm bg-neutral-200 px-4 py-2 text-neutral-800 focus:outline-none dark:bg-neutral-800 dark:text-neutral-200" v-model="serviceMethod">
                    <option v-for="option in serviceOptions" :key="option.value" :value="option.value">
                        {{ option.text }}
                    </option>
                </select>
                <button class="rounded-sm bg-neutral-300 px-6 py-2 font-semibold text-neutral-800 hover:bg-neutral-400 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600" @click="createCollection">Create</button>
            </div>

            <!-- Sort & View Mode Controls -->
            <div class="mb-2 flex items-center justify-between">
                <div class="flex items-center">
                    <label class="mr-2 font-bold">Sort By:</label>
                    <select v-model="selectedSortKey" class="text-textColor border-strokeColor bg-sideBarBackgroundColor text-textColor mr-2 h-[35px] w-[120px] rounded-sm border p-1 text-base">
                        <option value="alias">Name</option>
                        <option value="createdAt">Created At</option>
                    </select>
                    <button class="bg-mozart-blue hover:bg-unselectedColor flex cursor-pointer items-center rounded-sm border-none px-4 py-2 text-base text-white" @click="sortCollections">
                        <div class="materialSymbolsOutlined">swap_vert</div>
                        Sort
                    </button>
                    <button class="bg-mozart-blue hover:bg-unselectedColor ml-2 flex cursor-pointer items-center rounded-sm border-none px-4 py-2 text-base text-white" @click="toggleFilterPanel">
                        <div class="materialSymbolsOutlined">filter_list</div>
                        Filter
                    </button>
                </div>
                <div class="flex items-center gap-2 text-2xl font-bold">
                    <div class="materialSymbolsOutlined text-textColor cursor-pointer rounded-full px-2 py-1 transition-all" :class="[viewMode == 'list' && 'bg-mozart-blue text-white']" @click="viewMode = 'list'">view_list</div>
                    <div class="materialSymbolsOutlined text-textColor cursor-pointer rounded-full px-2 py-1 transition-all" :class="[viewMode == 'widget' && 'bg-mozart-blue text-white']" @click="viewMode = 'widget'">view_module</div>
                </div>
            </div>

            <!-- Filter Panel -->
            <div v-if="showFilterPanel" class="bg-card bg-card mb-4 rounded-lg p-4">
                <div class="mb-3 flex items-center justify-between">
                    <h3 class="text-foreground text-foreground font-semibold">Filter Collections</h3>
                    <button @click="clearFilters" class="text-primary hover:text-primary text-primary/60 hover:text-primary/40 text-sm">Clear All</button>
                </div>
                <div class="flex flex-wrap gap-4">
                    <select v-model="filterEmbeddingMethod" class="bg-background text-foreground bg-input text-foreground rounded px-3 py-2 focus:outline-none">
                        <option value="">All Embeddings</option>
                        <option v-for="option in modelOptions" :key="option.value" :value="option.value">
                            {{ option.text }}
                        </option>
                    </select>
                    <select v-model="filterDistanceMethod" class="bg-background text-foreground bg-input text-foreground rounded px-3 py-2 focus:outline-none">
                        <option value="">All Distances</option>
                        <option v-for="option in distanceMethodOptions" :key="option.value" :value="option.value">
                            {{ option.text }}
                        </option>
                    </select>
                    <select v-model="filterServiceMethod" class="bg-background text-foreground bg-input text-foreground rounded px-3 py-2 focus:outline-none">
                        <option value="">All Services</option>
                        <option v-for="option in serviceOptions" :key="option.value" :value="option.value">
                            {{ option.text }}
                        </option>
                    </select>
                    <button @click="applyFilters" class="bg-primary text-foreground hover:bg-primary rounded px-4 py-2">Apply Filters</button>
                </div>
            </div>
        </div>

        <!-- Scrollable content section -->
        <div class="min-h-0 flex-auto overflow-y-auto px-6 pb-6">
            <!-- Grid view -->
            <div v-if="viewMode === 'widget'" class="grid grid-cols-[repeat(auto-fit,minmax(theme(spacing.20),theme(spacing.32)))] place-items-stretch justify-center gap-1 sm:grid-cols-[repeat(auto-fit,minmax(theme(spacing.24),theme(spacing.36)))] sm:gap-1.5 md:gap-2 xl:grid-cols-[repeat(auto-fit,minmax(theme(spacing.28),theme(spacing.40)))]">
                <div v-for="collection in sortedCollections" :key="collection.id" class="box-border rounded-lg border border-neutral-200 bg-neutral-200 p-3 text-neutral-800 transition-shadow hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    <div class="flex w-full min-w-0 flex-col items-center gap-3" @click="navigateToData(collection)">
                        <!-- Icon -->
                        <div class="flex h-20 w-full cursor-pointer items-center justify-center sm:h-24">
                            <!-- big, but bounded so it won’t overflow narrow cards -->
                            <span class="material-icons max-h-[85%] max-w-[85%] text-6xl select-none sm:text-7xl md:text-8xl">database</span>
                        </div>

                        <!-- Collection info -->
                        <div class="flex w-full min-w-0 items-center justify-between gap-2">
                            <div class="min-w-0">
                                <VTooltip class="flex min-w-0">
                                    <p class="cursor-pointer truncate text-sm font-semibold sm:text-base">
                                        {{ trimText(collection.alias, 30) }}
                                    </p>
                                    <template #popper>{{ collection.alias }}</template>
                                </VTooltip>

                                <span class="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium" :class="collection.name === ragStore.currentCollection ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-200' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-200'">
                                    {{ collection.name === ragStore.currentCollection ? "Active" : "Inactive" }}
                                </span>
                            </div>

                            <!-- Kebab -->
                            <div class="relative flex-shrink-0">
                                <button @click.stop="toggleDropdown(collection.id)" class="rounded bg-neutral-300 px-2 py-1 text-sm text-neutral-800 hover:bg-neutral-400 focus:outline-none dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600">⋮</button>

                                <div v-show="dropdownOpen === collection.id" @click.stop class="absolute right-0 z-10 mt-2 w-36 overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-lg dark:border-neutral-600 dark:bg-neutral-700">
                                    <button class="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-600" @click="showInfo(collection.id)">Info</button>
                                    <button class="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-600" @click="deleteCollection(collection.id, collection.name)">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Table view -->
            <CollectionTable v-else :collections="sortedCollections" :loading="loading" :current-collection="ragStore.currentCollection" @row-select="rowSelect" @show-info="showInfo" @delete-collection="deleteCollection" />
        </div>

        <!-- If your Loading needs to stay overlayed, you could absolutely position it -->
        <CollectionConfirmationPopup
            v-if="confirmModalState.show"
            :show="confirmModalState.show"
            :shortName="confirmModalState.shortName"
            :title="confirmModalState.title"
            :subtitle="confirmModalState.subtitle"
            :closeOnTopRight="true"
            :confirmButtonText="confirmModalState.confirmButtonText"
            :confirmButtonColor="confirmModalState.confirmButtonColor"
            :alternativeCollections="confirmModalState.alternativeCollections"
            @update:show="confirmModalState.show = $event"
            @buttonClick="handleConfirmationButtonClick"
            @newDefaultSelected="handleNewDefaultSelected"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, watch, onMounted } from "vue"
    import { updateUser } from "~/services/better-auth/auth-client"

    definePageMeta({ layout: "mozart-rag-service-admin", middleware: ["auth"] })

    useHead({ title: "Rag Admin" })

    // ----------------| Composable |----------------
    const ragService = useRag()
    // ----------------| Store |----------------
    const ragStore = useRagStore()
    const router = useRouter()
    const userStore = useUserStore()

    // ----------------| Refs |----------------
    const collectionName = ref("")
    const distanceMethod = ref("Cosine")
    const embeddingMethod = ref("bert")
    const serviceMethod = ref("cloud")
    const selectedCollection = ref<ICollection | null>(null)
    const canShowAddMemberPopup = ref(false)

    // Separate filter variables
    const filterEmbeddingMethod = ref("")
    const filterDistanceMethod = ref("")
    const filterServiceMethod = ref("")

    function rowSelect(row: any, e?: Event) {
        row.toggleSelected(!row.getIsSelected())
        selectedCollection.value = row.original
        canShowAddMemberPopup.value = true
    }

    // Table logic has been moved to CollectionTable.vue component

    const modelOptions = ref([
        { text: "BERT", value: "bert" },
        { text: "Stella", value: "stella" },
    ])
    const distanceMethodOptions = ref([
        { text: "Cosine", value: "Cosine" },
        { text: "Euclidean", value: "Euclid" },
        { text: "Manhattan", value: "Manhattan" },
        { text: "Dot", value: "Dot" },
    ])
    const serviceOptions = ref([
        { text: "Cloud", value: "cloud" },
        { text: "Local", value: "local" },
    ])
    const sortedCollections = ref<ICollection[]>([])
    const selectedSortKey = ref("alias")
    const sortOrder = ref("asc")
    const viewMode = ref("widget")
    const loading = ref(false)
    const vector_size = ref(768)
    const showFilterPanel = ref(false)

    const confirmModalState = ref({
        show: false,
        shortName: "",
        title: "",
        subtitle: "",
        confirmButtonText: "Delete",
        confirmButtonColor: "#FF5555",
        alternativeCollections: [] as ICollection[],
        actionType: "",
        collectionId: null as any,
        collectionName: "",
    })

    const newDefaultCollection = ref("")

    // ----------------| Functions |----------------
    const createCollection = async () => {
        if (!collectionName.value) return
        if (embeddingMethod.value == "stella") vector_size.value = 1024
        const responseCollection = await useRag().createCollection(collectionName.value, collectionName.value, distanceMethod.value, vector_size.value, embeddingMethod.value, serviceMethod.value)

        // Reset cache flags to force refresh after creating new collection
        const ragStore = useRagStore()
        ragStore.resetCacheFlags()

        // Now call getCollectionsForUser (will make fresh API call due to reset cache)
        await useRag().getCollectionsForUser()

        if (responseCollection) {
            const data = await useRag().getAllCollections()
            if (!data) return
            // No need to call getCollectionsForUser again - already called above
        }
        collectionName.value = ""
    }

    const toggleFilterPanel = () => {
        showFilterPanel.value = !showFilterPanel.value
    }

    const applyFilters = () => {
        let filteredCollections = [...ragStore.collections]

        // Filter by embedding method
        if (filterEmbeddingMethod.value) {
            filteredCollections = filteredCollections.filter((collection: ICollection) => collection.embedding === filterEmbeddingMethod.value)
        }

        // Filter by distance method
        if (filterDistanceMethod.value) {
            filteredCollections = filteredCollections.filter((collection: ICollection) => collection.distance === filterDistanceMethod.value)
        }

        // Filter by service method
        if (filterServiceMethod.value) {
            filteredCollections = filteredCollections.filter((collection: ICollection) => collection.service === filterServiceMethod.value)
        }

        sortedCollections.value = filteredCollections
    }

    const clearFilters = () => {
        filterEmbeddingMethod.value = ""
        filterDistanceMethod.value = ""
        filterServiceMethod.value = ""
        sortedCollections.value = ragStore.collections
    }
    const sortCollections = () => {
        const collections = [...ragStore.collections] // Create a copy to avoid mutating the original array

        const sortKey = selectedSortKey.value
        const order = sortOrder.value

        if (sortKey) {
            collections.sort((a: ICollection, b: ICollection) => {
                let aValue
                let bValue

                // Determine the value to sort by based on sortKey
                if (sortKey === "createdAt") {
                    aValue = new Date(a.created_at) // Convert to Date object for proper sorting
                    bValue = new Date(b.created_at)
                } else if (sortKey === "alias") {
                    aValue = a.alias ? a.alias.toLowerCase() : null // Handle null values and case sensitivity
                    bValue = b.alias ? b.alias.toLowerCase() : null
                }

                // Handle null or undefined values
                if (aValue == null) return order === "asc" ? 1 : -1
                if (bValue == null) return order === "asc" ? -1 : 1

                // Compare values based on sort order
                if (aValue < bValue) return order === "asc" ? -1 : 1
                if (aValue > bValue) return order === "asc" ? 1 : -1

                return 0 // Equal values
            })
        }

        sortedCollections.value = collections // Update the sorted collections

        // Toggle sort order for the next click
        sortOrder.value = order === "asc" ? "desc" : "asc"
    }

    const dropdownOpen = ref<any>(null)

    const toggleDropdown = (id: any) => {
        dropdownOpen.value = dropdownOpen.value === id ? null : id
    }

    const deleteCollection = (id: string, collection_name: string) => {
        const collectionToDelete = ragStore.collections.find((collection) => collection.id === id)
        if (!collectionToDelete) return

        dropdownOpen.value = null
        const isDefaultCollection = collectionToDelete.name === userStore.defaultCollection
        const collections = ragStore.collections
        // Guard: deleting the only remaining cloud collection
        if (isDefaultCollection && collections.filter((c) => c.service === "cloud").length === 1) {
            console.error("Cannot delete the only available collection")
            return
        }
        const basePayload = {
            show: true,
            shortName: "",
            confirmButtonText: "Delete",
            confirmButtonColor: "#FF5555", // e.g. '#FF5555'
            collectionId: id,
            collectionName: collection_name,
        } as const
        confirmModalState.value =
            collectionToDelete.name === userStore.defaultCollection
                ? {
                      ...basePayload,
                      title: "Select New Default Collection",
                      subtitle: `You're deleting “${collectionToDelete.alias ?? collectionToDelete.name}”, your default collection. Please choose a new default first.`,
                      alternativeCollections: collections.filter((c) => c.service === "cloud" && c.id !== id),
                      actionType: "deleteDefaultCollection",
                  }
                : {
                      ...basePayload,
                      title: "Delete Collection?",
                      subtitle: `Delete “${collectionToDelete.alias ?? collectionToDelete.name}”? This action cannot be undone.`,
                      alternativeCollections: [],
                      actionType: "deleteCollection",
                  }
    }

    const handleNewDefaultSelected = (collectionName: string) => {
        newDefaultCollection.value = collectionName
    }

    const handleConfirmationButtonClick = async (action: string) => {
        if (action === "confirm") {
            const { actionType, collectionId, collectionName } = confirmModalState.value

            if (actionType === "deleteDefaultCollection") {
                userStore.defaultCollection = newDefaultCollection.value
                confirmModalState.value.show = false

                await updateUser({
                    name: `${userStore.firstName || ""} ${userStore.lastName || ""}`.trim(),
                    firstName: userStore.firstName || "",
                    lastName: userStore.lastName || "",
                    defaultCollection: newDefaultCollection.value,
                    profilePicture: userStore.profilePicture,
                })

                await performDeletion(collectionId, collectionName)
            } else if (actionType === "deleteCollection") {
                confirmModalState.value.show = false
                await performDeletion(collectionId, collectionName)
            }
        }

        newDefaultCollection.value = ""
    }

    const performDeletion = async (id: any, collection_name: string) => {
        try {
            loading.value = true
            await ragService.deleteCollection(collection_name)
            ragStore.deleteCollection(id)
            ragStore.currentCollection = userStore.defaultCollection
            ragStore.currentQdrantInstance = userStore.defaultCollection
            await useRag().getCollectionPointCount(userStore.defaultCollection)
            await useRag().getCollectionData(userStore.defaultCollection)
            if (ragStore.collections.some((collection) => collection.id === id)) {
                ragStore.collections = ragStore.collections.filter((collection) => collection.id !== id)
            }
            sortedCollections.value = sortedCollections.value.filter((collection) => collection.id !== id)
            loading.value = false
        } catch (error) {
            console.error("Error deleting collection:", error)
        }
    }

    const showInfo = (id: any) => {
        const collection = sortedCollections.value.find((collection) => collection.id === id)
        if (collection) {
            alert(`Collection Info:\nAlias: ${collection.alias}\nName: ${collection.name}`)
        }
        dropdownOpen.value = null
    }
    const trimText = (text: string, maxLength: number) => {
        return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text
    }
    const navigateToData = async (collection: ICollection) => {
        loading.value = true
        ragStore.currentCollection = collection.name
        ragStore.currentQdrantInstance = collection.service
        await useRag().getCollectionPointCount(collection.name)
        await useRag().getCollectionData(collection.name)
        loading.value = false
        return router.push(`/admin/rag/data?collection=${encodeURIComponent(collection.name)}`)
    }

    watch(ragStore, () => {
        sortedCollections.value = ragStore.collections
    })

    onMounted(async () => {
        sortedCollections.value = ragStore.collections
    })
</script>

<style scoped></style>
