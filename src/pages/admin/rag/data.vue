<template>
    <div class="flex h-full flex-col items-center justify-start p-5">
        <div class="relative flex h-full w-full flex-col overflow-y-scroll p-2">
            <!-- Only show the search input if we have RAG data -->
            <div v-if="ragFilesData.length > 0" class="search-input-container mx-auto my-1 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-600 md:w-1/2">
                <input type="text" class="flex-1 bg-transparent p-1 text-sm text-gray-800 outline-none" placeholder="Describe the document you are looking for..." v-model="searchText" @click="buttonClick" @keyup.enter="buttonClick" />
                <div class="materialSymbolsOutlined text-gray-500">search</div>
            </div>

            <h2 class="text-textColor my-0 text-lg font-bold">Results</h2>

            <div class="mb-5">
                <!-- Document View Switches -->
                <div class="documentViewSwitches mb-1 flex gap-2">
                    <div
                        class="documentViewSwitch z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border text-lg transition"
                        :class="{
                            'border-none bg-mozart-blue-500 text-white hover:bg-mozart-blue-700': resultView == 'table',
                            'text-textColor border-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600': resultView !== 'table',
                        }"
                        @click="switchResultView('table')"
                    >
                        <div class="materialSymbolsOutlined">reorder</div>
                    </div>
                    <div
                        v-if="ragFilesData"
                        class="documentViewSwitch z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border text-lg transition"
                        :class="{
                            'border-none bg-mozart-blue-500 text-white hover:bg-mozart-blue-700': resultView == 'widget',
                            'text-textColor border-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600': resultView !== 'widget',
                        }"
                        @click="switchResultView('widget')"
                    >
                        <div class="materialSymbolsOutlined">widgets</div>
                    </div>
                    <!-- Example button for deleting entire collection -->
                    <div class="documentViewSwitch z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-300 text-lg transition hover:bg-gray-300 dark:hover:bg-gray-600" @click="deleteCollection">
                        <div class="materialSymbolsOutlined text-textColor">delete</div>
                    </div>
                </div>

                <!-- Main content area -->
                <!-- <div class="h-[57vh] overflow-hidden flex flex-col"> -->
                <!-- Table View -->
                <RagDataTable v-if="resultView === 'table'" :searchText="searchText" v-model:page="currentPage" />
                <!-- </div> -->

                <!-- Widget (Card) View -->
                <div v-if="resultView === 'widget' && !ragStore.isLoading" class="mb-6 grid grid-cols-1 gap-6 sm:mb-12 sm:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))]">
                    <div v-for="document in ragFilesData" :key="document.name" class="relative rounded-lg border border-gray-300 bg-gray-100 p-3">
                        <!-- File Type Badge -->
                        <div class="absolute top-0 left-0 rounded-br-lg bg-blue-500 px-2 py-1 text-xs text-white">
                            {{ getFileType(document.url) }}
                        </div>

                        <!-- Delete Icon -->
                        <div class="absolute right-2 bottom-2 cursor-pointer text-gray-600">
                            <div class="materialSymbolsOutlined" @click="handleDocumentDeleteClick(document)">delete</div>
                        </div>

                        <div class="previewImageWrapper mb-3 h-52 cursor-pointer overflow-hidden rounded-lg" @click="handleDocumentClick(document.url)"></div>
                        <div class="truncate text-gray-800">{{ document.name }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    useHead({
        title: "RAG Data",
    })

    const emit = defineEmits(["buttonClick"])
    const rag = useRag()
    const ragStore = useRagStore()
    const userStore = useUserStore()
    const { showConfirmModal } = useModal()
    const router = useRouter()
    const route = useRoute()
    
    // Track current page from URL or default to 1
    const currentPage = ref(Number(route.query.page) || 1)

    // Controls which view is shown: "table" or "widget".
    const resultView = ref("table")
    const selectedCollection = computed(() => ragStore.currentCollection)
    // Display all user files from Azure Blob Storage for the widget view
    const ragFilesData = computed(() => {
        if (!ragStore.ragUserFilesData || ragStore.ragUserFilesData.length === 0) {
            console.log('[RAG Data] No user files available')
            return []
        }
        
        console.log('[RAG Data] Using ragUserFilesData:', ragStore.ragUserFilesData.length, 'files')
        
        // Map ragUserFilesData to the format expected by the widget view
        const files = ragStore.ragUserFilesData.map((file: any) => ({
            name: file.name || file.fileName || 'Unknown',
            url: file.url || file.fileUrl || '',
        }))
        
        console.log('[RAG Data] Files for widget view:', files)
        return files
    })

    const getCollectionIdByName = computed(() => {
        return (name: string) => {
            const match = ragStore.collections.find((collection: any) => collection.name === name)
            return match?.id || null
        }
    })

    const getAnyNonDefaultCollectionName = computed(() => {
        return ragStore.collections.find((collection: any) => collection.name !== userStore.defaultCollection)?.name || null
    })

    // Called when the user clicks "search" or presses Enter in the input.
    const searchText = ref("")
    const buttonClick = async () => {
        emit("buttonClick", searchText.value)
    }

    // Switches between table or widget/card view.
    const switchResultView = (view: string) => {
        resultView.value = view
    }

    // Delete individual document by title.
    const handleDocumentDeleteClick = async (document: any) => {
        const status = await rag.deletePointsByTitle(document.name)
        if (status.code === 200) {
            ragStore.removePointsByTitle(document.name)
        }
    }

    // Utility function to guess file type from extension.
    const getFileType = (url: string) => {
        if (url.includes(".pdf")) return "PDF"
        if (url.includes(".csv")) return "CSV"
        if (url.includes(".json")) return "JSON"
        if (url.includes("@json")) return "Google Forms"
        return "PDF"
    }

    // Opens the document's URL (if you choose to implement it).
    const handleDocumentClick = (docUrl: string) => {
        window.open(docUrl, "_blank")
    }

    function goToCollections() {
        router.push("/admin/rag/manage/collection")
    }

    // Delete the entire current collection.
    async function deleteCollection() {
        const askForConfirmation = await showConfirmModal({
            shortName: "Delete Collection",
            title: "Are you sure you want to delete this collection?",
            subtitle: "This action is permanent and cannot be undone.",
            confirmButtonText: "Delete",
            confirmButtonColor: "#FF5555",
            closeOnTopRight: true,
        })
        if (askForConfirmation === "confirm") {
            const defaultId = getCollectionIdByName.value(ragStore.currentCollection)
            const fallbackCollectionName = getAnyNonDefaultCollectionName.value
            await rag.deleteCollection(ragStore.currentCollection)
            if (ragStore.collections.some((collection: any) => collection.id === defaultId)) {
                ragStore.collections = ragStore.collections.filter((collection: any) => collection.id !== defaultId)
            }
            if (fallbackCollectionName) {
                ragStore.currentCollection = fallbackCollectionName
                userStore.defaultCollection = fallbackCollectionName
            }
            goToCollections()
            // You could also clear out local store data:
            // ragStore.ragData = []
        }
    }

    // Helper function to update URL with current state
    const updateUrlParams = () => {
        const collectionName = ragStore.currentCollection
        router.replace({
            query: {
                collection: collectionName,
                page: currentPage.value
            }
        })
    }

    // Watch for collection changes and update URL
    watch(selectedCollection, async (newCollection, oldCollection) => {
        // Only reset to page 1 if this is a REAL change, not initialization from URL
        if (oldCollection && newCollection !== oldCollection) {
            currentPage.value = 1
            updateUrlParams()
            await useRag().getCollectionPointCount(newCollection)
            await useRag().getCollectionData(newCollection)
        }
    })

    // Watch for page changes and update URL + localStorage
    watch(currentPage, () => {
        updateUrlParams()
        // Store current page in localStorage for this collection
        const storageKey = `rag_data_page_${ragStore.currentCollection}`
        localStorage.setItem(storageKey, currentPage.value.toString())
    })

    onMounted(async () => {
        // Read collection from URL if available, otherwise use user's default collection
        const urlCollection = route.query.collection as string
        const urlPage = Number(route.query.page) || 1
        
        // Determine which collection to use
        let collectionToUse: string
        
        if (urlCollection) {
            // URL has a collection - use it
            collectionToUse = urlCollection
            ragStore.currentCollection = urlCollection
        } else {
            // No URL collection - use user's default collection
            // Make sure we have the user's default collection
            if (!userStore.defaultCollection) {
                // Fallback to first collection if no default is set
                collectionToUse = ragStore.collections[0]?.name || ragStore.currentCollection
            } else {
                collectionToUse = userStore.defaultCollection
            }
            ragStore.currentCollection = collectionToUse
        }
        
        // Set current page from URL or localStorage
        let pageToUse = 1
        if (urlPage && urlPage > 1) {
            // URL has a page parameter - use it
            pageToUse = urlPage
        } else {
            // No URL page or page=1 - try to read from localStorage for this collection
            const storageKey = `rag_data_page_${collectionToUse}`
            const storedPage = localStorage.getItem(storageKey)
            pageToUse = storedPage ? Number(storedPage) : 1
        }
        currentPage.value = pageToUse
        
        // Update URL to reflect current state (ensures URL is always in sync)
        updateUrlParams()
        
        await useRag().getCollectionPointCount(collectionToUse)
        
        // Calculate skip if starting on a page > 1 so we load the correct batch
        const itemsPerPage = 5
        const skip = (urlPage - 1) * itemsPerPage
        await useRag().getCollectionData(collectionToUse, 0, false, false, skip)
        await rag.getRagFilesForUser()
    })
</script>
