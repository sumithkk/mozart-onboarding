<template>
    <div class="flex h-full w-full flex-col items-center justify-start gap-5 overflow-hidden bg-neutral-100 p-6 dark:bg-neutral-900">
        <div class="h-fit w-full space-y-6 overflow-clip rounded-lg bg-neutral-200 p-6 text-neutral-900 shadow-lg dark:bg-neutral-800 dark:text-neutral-100">
            <Loading v-if="ragStore.isLoading" :text="'Vector Search'" />

            <!-- Search Bar -->
            <div>
                <label for="keywords" class="mb-2 block text-sm font-medium text-neutral-600 dark:text-neutral-400"> Enter keywords here... </label>
                <input id="keywords" type="text" placeholder="Enter keywords here..." class="w-full rounded-sm bg-neutral-50 px-4 py-2 text-neutral-800 focus:ring-2 focus:ring-mozart-blue-500 focus:outline-none dark:bg-neutral-700 dark:text-neutral-200" @keyup.enter="handleInputSubmit" v-model="searchTerm" />
            </div>

            <!-- Metadata Filter -->
            <div class="flex items-center gap-2">
                <input id="metadata" type="text" placeholder="Filter by metadata tags..." class="flex-grow rounded-sm bg-neutral-50 px-4 py-2 text-neutral-800 focus:ring-2 focus:ring-mozart-blue-500 focus:outline-none dark:bg-neutral-700 dark:text-neutral-200" />
                <button class="rounded-sm bg-mozart-blue-500 px-4 py-2 font-medium text-white hover:bg-mozart-blue-600 focus:ring-2 focus:ring-mozart-blue-400 focus:outline-none" @click="handleInputSubmit">Search</button>
            </div>

            <!-- Keyword Match Checkbox -->
            <div class="flex items-center">
                <input id="keywordMatch" type="checkbox" class="form-checkbox h-4 w-4 rounded-sm border-neutral-400 bg-white text-mozart-blue accent-mozart-blue focus:ring-2 focus:ring-mozart-blue-500 dark:border-neutral-600 dark:bg-neutral-700" v-model="isKeyTermMatch" />
                <label for="keywordMatch" class="ml-2 text-sm text-neutral-600 dark:text-neutral-400"> Key Word Match </label>
            </div>
        </div>

        <!-- Results Table -->
        <Vector-search-table v-if="paginatedRecords.length > 0" :data="paginatedRecords" @showVectorDetails="handleUpdateShow" @handleDelete="deletePoint" />
        <!-- Previous Searches Table -->
        <PreviousSearchTable v-else :data="recentSearches" @rowClick="onRecentSearchClick" />
        <VectorRecordModel v-if="showModal" :data="contentToShow" @closeMode="closeModal" />
    </div>
</template>

<script setup lang="ts">
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    useHead({
        title: "Rag Admin",
    })

    // ----------------| Store |----------------
    const ragStore = useRagStore()

    // ----------------| Refs |----------------
    const recentSearches = ref<any[]>([])
    const searchTerm = ref("")
    const keyInput = ref("")
    const valueInput = ref("")
    const isKeyTermMatch = ref(false)
    const ragSearchResults = ref<any[]>([])
    const sortColumns = ref<any[]>([])
    const currentPage = ref(1)
    const recordsPerPage = ref(10)

    // ----------------| Modal State |----------------
    const showModal = ref(false)
    const contentToShow = ref("")

    // ----------------| Functions |----------------
    const extractRecentSearches = (data: any) => {
        recentSearches.value = []
        data = Object.fromEntries(Object.entries(data).sort((a: any, b: any) => a[1].createdAt - b[1].createdAt))
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const { searchTerm, keyInput, valueInput, collection, searchId } = data[key]
                const query = searchTerm
                recentSearches.value.unshift({
                    query,
                    keyInput,
                    valueInput,
                    collection,
                    searchId,
                })
            }
        }
    }

    const onRecentSearchClick = async (item: any) => {
        searchTerm.value = item.query
        keyInput.value = item.keyInput
        valueInput.value = item.valueInput
        ragStore.currentCollection = item.collection
        await onInputSubmit()
    }

    const onInputSubmit = async () => {
        ragStore.isLoading = true
        const response = await useRag().ragSearch(searchTerm.value, isKeyTermMatch.value, keyInput.value, valueInput.value)
        ragSearchResults.value = response
        ragStore.isLoading = false
    }

    const saveSearch = async () => {
        const response = await useRag().saveSearchQuery(searchTerm.value, keyInput.value, valueInput.value, ragStore.currentCollection)
        if (response.code === 200) {
            const searchQuery = {
                searchTerm: searchTerm.value,
                valueInput: valueInput.value,
                collection: ragStore.currentCollection,
            }
            const uniqueKey = `query_${new Date().getTime()}`
            ragStore.searchInputUnstructuredData[uniqueKey] = searchQuery
            extractRecentSearches(ragStore.searchInputUnstructuredData)
        }
    }

    const sortedData = computed(() => {
        return [...ragSearchResults.value].sort((a, b) => {
            for (let { column, direction } of sortColumns.value) {
                let sortColumn = column.toLocaleLowerCase()
                if (sortColumn === "page") {
                    sortColumn = "pageNumber"
                }
                if (sortColumn === "batched at") {
                    sortColumn = "batchedAt"
                }
                let aVal = a[sortColumn] as string | number | Date
                let bVal = b[sortColumn] as string | number | Date

                if (sortColumn === "batchedAt") {
                    aVal = new Date(aVal as string)
                    bVal = new Date(bVal as string)
                }

                if (aVal !== bVal) {
                    if (direction === "asc") {
                        return aVal > bVal ? 1 : -1
                    } else {
                        return aVal < bVal ? 1 : -1
                    }
                }
            }
            return 0
        })
    })

    const handleUpdateShow = async (id: string, record: string) => {
        contentToShow.value = record
        showModal.value = true
    }

    const filterData = computed(() => {
        if (!keyInput.value || !valueInput.value) return sortedData.value

        return sortedData.value.filter((record: { [key: string]: any }) => {
            const metadata = record.metadata || {}
            if (metadata[keyInput.value] !== undefined && metadata[keyInput.value] !== null) {
                const metadataValue = metadata[keyInput.value].toString()
                return metadataValue.includes(valueInput.value)
            }
            return false
        })
    })

    const handleInputSubmit = async () => {
        await saveSearch()
        await onInputSubmit()
    }

    const paginatedRecords = computed(() => {
        const filteredData = filterData.value
        const start = (currentPage.value - 1) * recordsPerPage.value
        const end = start + recordsPerPage.value
        return filteredData.slice(start, end)
    })

    async function deletePoint(document: any) {
        const status = await useRag().deletePointById(document.id)
        if (status.code === 200) {
            ragStore.removePointById(document.id)
        }
    }

    const closeModal = () => {
        showModal.value = false
        contentToShow.value = ""
    }

    onMounted(async () => {
        const userInputDataLength = Object.keys(ragStore.searchInputUnstructuredData).length
        if (userInputDataLength === 0) {
            const responseSearch = await useRag().getSearchQuery()
            ragStore.searchInputUnstructuredData = responseSearch
            extractRecentSearches(ragStore.searchInputUnstructuredData)
        } else {
            extractRecentSearches(ragStore.searchInputUnstructuredData)
        }
    })
</script>

<style scoped>
    .form-checkbox {
        appearance: none;
    }

    .form-checkbox:checked {
        appearance: checkbox;
        border: none !important;
    }
</style>
