<template>
    <div class="border-border mt-4 flex h-full flex-col rounded-xl border transition-all duration-200">
        <!-- Table -->
        <UTable
            ref="table"
            sticky
            :columns="Columns"
            :data="paginatedData"
            @select="handleRowSelect"
            class="h-full rounded-xl"
            aria-label="Vectorized file table"
            :ui="{
                thead: '[&_th]:cursor-pointer [&_th]:hover:text-zinc-600 dark:[&_th]:hover:text-gray-300 h-14 bg-tableBgHeader',
                tbody: '[&_td]:cursor-pointer',
            }"
        >
            <template #expanded="{ row }">
                <pre class="overflow-x-auto rounded bg-gray-100 p-2 text-xs whitespace-pre-wrap"
                    >{{ JSON.stringify(row.original, null, 2) }}
        </pre
                >
            </template>
        </UTable>

        <!-- Empty state -->
        <div v-if="!loading && totalItems === 0" class="flex flex-col items-center justify-center py-12 text-gray-500">
            <span class="i-heroicons-document-magnifying-glass-20-solid mb-2 text-3xl"></span>
            <p>No records found</p>
        </div>

        <!-- Pagination -->
        <!-- Pagination -->
        <div v-if="!loading && totalItems > 0" class="flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
            <div class="text-sm text-gray-500">
                Showing
                {{ (currentPage - 1) * itemsPerPage + 1 }}
                to
                {{ Math.min(currentPage * itemsPerPage, totalItems) }}
                of {{ totalItems }} results
            </div>

            <UPagination
                v-model:page="currentPage"
                :page-count="Math.ceil(totalItems / itemsPerPage)"
                :total="totalItems"
                :max="5"
                :prev-button="{
                    icon: 'i-heroicons-chevron-left-20-solid',
                    label: 'Prev',
                }"
                :next-button="{
                    icon: 'i-heroicons-chevron-right-20-solid',
                    label: 'Next',
                }"
                show-last
                show-first
                show-edges
                size="sm"
                class="flex flex-wrap justify-center gap-1 max-w-full [&_*]:cursor-pointer"
                aria-label="Table pagination"
            />
        </div>
    </div>

    <!-- Popups -->
    <UpdateRAGMetadata v-if="popupState.showMetadata" :show="popupState.showMetadata" :shortName="shortName" :title="metadataTitle" :subtitle="metadataSubtitle" :confirmButtonText="confirmButtonText" :confirmButtonColor="confirmButtonColor" :closeOnTopRight="closeOnTopRight" @update:show="togglePopup('metadata')" @buttonClick="handleButtonClick" :metadataRecord="popupState.currentRecord" />
    <UpdateRAGTitle v-if="popupState.showTitle" :show="popupState.showTitle" :shortName="shortName" :title="title" :subtitle="subtitle" :confirmButtonText="confirmButtonText" :confirmButtonColor="confirmButtonColor" :closeOnTopRight="closeOnTopRight" @update:show="togglePopup('title')" @buttonClick="handleTitleButtonClick" />
    <UpdateRAGParagraph
        v-if="popupState.showParagraph"
        :show="popupState.showParagraph"
        :shortName="paragraphShortName"
        :title="paragraphTitle"
        :subtitle="paragraphSubtitle"
        :confirmButtonText="paragraphConfirmButtonText"
        :confirmButtonColor="confirmButtonColor"
        :closeOnTopRight="closeOnTopRight"
        :paragraph="popupState.currentParagraph"
        @update:show="togglePopup('paragraph')"
        @buttonClick="handleParagraphButtonClick"
    />
</template>

<script setup lang="ts">
    import { h, resolveComponent, ref, onUnmounted, onMounted, computed, watch, reactive, watchEffect } from "vue"
    import type { TableColumn } from "@nuxt/ui"
    import { createSortHeader, trimAnyString, mw } from "@/util/nuxtUiUtil"
    import type { IRagRecord } from "@/types/rag-service"

    // Resolve components
    const UButton = resolveComponent("UButton")
    const UIcon = resolveComponent("UIcon")
    // Store + rag
    const ragStore = useRagStore()
    const rag = useRag()

    const records = ref(ragStore.ragData)
    watchEffect(() => {
        records.value = ragStore.ragData
    })

    // Props
    interface Props {
        searchText: string
        loading?: boolean
        page?: number
    }
    const props = withDefaults(defineProps<Props>(), { loading: false, page: 1 })
    
    // Emit for v-model:page
    const emit = defineEmits<{
        (e: 'update:page', value: number): void
    }>()

    // Popup state
    const popupState = reactive({
        showMetadata: false,
        showTitle: false,
        showParagraph: false,
        currentId: "",
        currentRecord: {} as any,
        currentParagraph: "",
    })

    const shortName = ref("RAG")
    const metadataTitle = ref("Metadata Update")
    const metadataSubtitle = ref("Add the key-value pair")
    const confirmButtonText = ref("Add")
    const confirmButtonColor = ref("#3d67f9")
    const closeOnTopRight = ref(true)
    const title = ref("File name Update")
    const subtitle = ref("Add the file name")
    const paragraphTitle = ref("Vector Paragraph Update")
    const paragraphSubtitle = ref("Add the paragraph")
    const paragraphShortName = ref("Vector Paragraph")
    const paragraphConfirmButtonText = ref("Save")

    const sortColumns = ref<any[]>([])
    const dropdown = ref<any | null>(null)
    const showDropdown = ref(false)

    onMounted(async () => {
        const collectionName = ragStore.currentCollection
        await useRag().getCollectionPointCount(collectionName, true)
        document.addEventListener("click", handleClickOutside)
    })

    onUnmounted(() => {
        document.removeEventListener("click", handleClickOutside)
    })

    const ragTableData = computed<IRagRecord[]>(() => filterData())

    // Popup toggle
    const togglePopup = (type: "metadata" | "title" | "paragraph") => {
        popupState[`show${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof popupState] = !popupState[`show${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof popupState]
    }

    async function handleButtonClick(button: string, metadata: any) {
        togglePopup("metadata")
        const collectionName = ragStore.currentCollection
        updateMetadataRecord(popupState.currentId, metadata)
        await rag.updateMetadata(collectionName, metadata, popupState.currentId, "")
        await useRag().getCollectionData(collectionName)
    }

    async function handleTitleButtonClick(button: string, metadata: any) {
        togglePopup("title")
        const collectionName = ragStore.currentCollection
        const titleToUpdate = popupState.currentId.includes(".pdf") ? popupState.currentId.split(".")[0] : popupState.currentId
        const status = await rag.updateMetadata(collectionName, metadata, undefined, titleToUpdate)
        if (status.code === 200) {
            let oldFileName = popupState.currentId.includes(".pdf") ? popupState.currentId : popupState.currentId + ".pdf"
            let newFileName = metadata.title + ".pdf"
            await rag.renameFile(oldFileName, newFileName)
            await rag.getRagFilesForUser()
        }
        await useRag().getCollectionData(collectionName)
    }

    async function handleParagraphButtonClick(button: string, metadata: any) {
        togglePopup("paragraph")
        const collectionName = ragStore.currentCollection
        await rag.updateMetadata(collectionName, metadata, popupState.currentId, "")
        await useRag().getCollectionData(collectionName)
    }

    const sortedData = computed(() => {
        return [...records.value].sort((a, b) => {
            for (let { column, direction } of sortColumns.value) {
                let sortColumn = column.toLocaleLowerCase()
                if (sortColumn === "page") sortColumn = "pageNumber"
                if (sortColumn === "batched at") sortColumn = "batchedAt"
                let aVal = a[sortColumn] as any
                let bVal = b[sortColumn] as any

                if (sortColumn === "batchedAt") {
                    aVal = new Date(aVal as string)
                    bVal = new Date(bVal as string)
                }

                if (aVal == null) return 1
                if (bVal == null) return -1
                if (aVal !== bVal) {
                    return direction === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1
                }
            }
            return 0
        })
    })

    const updateMetadataRecord = (pointId: string, metadata: any) => {
        records.value = records.value.map((record: any) => {
            if (record.id === pointId) {
                record.metadata = metadata
            }
            return record
        })
    }

    const filterData = () => {
        if (!props.searchText) return sortedData.value
        const lowerQuery = props.searchText.toLowerCase()
        return sortedData.value.filter((doc: any) => {
            const topLevelMatch = Object.keys(doc)
                .filter((key) => typeof doc[key] === "string")
                .some((key) => (doc[key] as string).toLowerCase().includes(lowerQuery))

            const metadataMatch = Object.keys(doc.metadata).some((key) => {
                const value = doc.metadata[key]
                if (typeof value === "string") {
                    let formattedValue = value.toLowerCase()
                    if (!isNaN(Date.parse(value))) formattedValue = new Date(value).toLocaleString().toLowerCase()
                    const keyValueMatch = `${key}: ${value}`.toLowerCase().includes(lowerQuery)
                    return formattedValue.includes(lowerQuery) || keyValueMatch
                }
                return false
            })
            return topLevelMatch || metadataMatch
        })
    }

    const handleClickOutside = (event: any) => {
        if (dropdown.value && !dropdown.value.contains(event.target)) showDropdown.value = false
    }

    // Pagination - sync with parent via v-model:page
    const currentPage = ref(props.page)
    const itemsPerPage = 5
    const backendItemsPerPage = 50 // Must match backend fetch size
    
    // Total items: use collection count from backend for accurate pagination
    const totalItems = computed(() => {
        const pointCount = ragStore.collectionPointCount || 0
        return pointCount > 0 ? pointCount : ragTableData.value.length
    })

    // Slicing logic: maps global page number to local batch index
    const paginatedData = computed(() => {
        // Example: Page 11 (Start of Batch 2) -> (11-1) % 10 = 0. Slice 0-5.
        // Example: Page 12 -> (12-1) % 10 = 1. Slice 5-10.
        const pagesPerBatch = Math.ceil(backendItemsPerPage / itemsPerPage) // 10
        const localPage = (currentPage.value - 1) % pagesPerBatch
        
        const start = localPage * itemsPerPage
        return ragTableData.value.slice(start, start + itemsPerPage)
    })
    
    // Watch for prop changes (from parent/URL)
    watch(() => props.page, (newPage) => {
        currentPage.value = newPage
    })
    
    // Emit page changes to parent
    watch(currentPage, async (newPage, oldPage) => {
        if (!newPage) return
        
        // Emit immediately to prevent race conditions/loops
        emit('update:page', newPage)

        // Calculate which batch of 50 we are in
        const pagesPerBatch = Math.ceil(backendItemsPerPage / itemsPerPage) // 10
        const newBatchIndex = Math.floor((newPage - 1) / pagesPerBatch)
        const oldBatchIndex = Math.floor(((oldPage || 1) - 1) / pagesPerBatch)

        // If we moved to a new batch (e.g. Page 10 -> 11), fetch fresh data
        if (newBatchIndex !== oldBatchIndex) {
            const collectionName = ragStore.currentCollection
            if (collectionName) {
                // Calculate skip for random access: (page-1) * 5 items per page
                // This allows jumping to Page 500 directly
                const skip = (newPage - 1) * itemsPerPage
                
                // Pass calculated numeric skip for random access
                await rag.getCollectionData(collectionName, null, false, false, skip)
            }
        }
    })
    
    // Watcher for currentCollection removed - logic is handled by parent (data.vue) to allow URL deep linking without reset loops on mount.

    // Row select
    const handleRowSelect = (row: { toggleSelected: (val: boolean) => void; getIsSelected: () => boolean }, e?: Event) => row.toggleSelected(!row.getIsSelected())

    // Columns
    const Columns: TableColumn<IRagRecord>[] = [
        {
            accessorKey: "id",
            header: "ID",
            minSize: 96,
            size: 160,
            enableSorting: true,
            sortingFn: "alphanumeric",
        },
        {
            accessorKey: "title",
            header: ({ column }) => createSortHeader("Title", column),
            minSize: 96,
            size: 100,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => h("span", { class: "truncate block max-w-[180px]", title: row.original.title }, trimAnyString(row.original.title)),
        },
        {
            accessorKey: "chunkSize",
            header: ({ column }) => createSortHeader("Characters", column),
            minSize: 120,
            size: 160,
            enableSorting: true,
            sortingFn: "basic",
        },
        {
            accessorKey: "-",
            header: ({ column }) => createSortHeader("Type", column),
            minSize: 120,
            size: 160,
            enableSorting: true,
            sortingFn: "basic",
            cell: () => "Points",
        },
        {
            accessorKey: "url",
            header: "URL",
            minSize: 120,
            size: 160,
            cell: ({ row }) =>
                h(
                    "a",
                    {
                        href: row.original.url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        class: "flex items-center gap-1 text-mozart-blue hover:underline ",
                    },
                    [h("span", { class: "truncate max-w-[120px]" }, "Link")]
                ),
        },
        {
            accessorKey: "pageNumber",
            header: ({ column }) => createSortHeader("Page", column),
            minSize: 120,
            size: 160,
            enableSorting: true,
            sortingFn: "basic",
        },
        {
            accessorKey: "_",
            header: () => mw("MetaData", "min-w-28"),
            minSize: 112,
            size: 140,
            enableSorting: false,
            cell: ({ row }) =>
                mw(
                    h("div", { class: "flex gap-1 text-center align-center" }, [
                        h(
                            UButton,
                            {
                                size: "xs",
                                variant: "ghost",
                                color: "primary",
                                class: "cursor-pointer text-center",
                                onClick: (e: MouseEvent) => {
                                    e.stopPropagation()
                                    popupState.currentId = row.original.id
                                    popupState.currentRecord = row.original.metadata
                                    togglePopup("metadata")
                                },
                                title: "Update row",
                                "aria-label": "Update row",
                            },
                            {
                                default: () =>
                                    h(UIcon, {
                                        name: "i-lucide-edit",
                                        class: "size-4 group-hover:scale-110 transition-transform duration-200",
                                    }),
                            }
                        ),
                    ]),
                    "min-w-28"
                ),
        },
        {
            accessorKey: "_",
            header: () => "Paragraph",
            minSize: 112,
            size: 140,
            enableSorting: false,
            cell: ({ row }) =>
                mw(
                    h("div", { class: "flex gap-1 text-center align-center" }, [
                        h(
                            UButton,
                            {
                                size: "xs",
                                variant: "ghost",
                                color: "primary",
                                class: "cursor-pointer text-center",
                                onClick: (e: MouseEvent) => {
                                    e.stopPropagation()
                                    popupState.currentId = row.original.id
                                    popupState.currentParagraph = row.original.paragraph
                                    togglePopup("paragraph")
                                },
                                title: "Update row",
                                "aria-label": "Update row",
                            },
                            {
                                default: () =>
                                    h(UIcon, {
                                        name: "i-lucide-edit",
                                        class: "size-4 group-hover:scale-110 transition-transform duration-200",
                                    }),
                            }
                        ),
                    ]),
                    "min-w-28"
                ),
        },

        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }) =>
                mw(
                    h(
                        "div",
                        {
                            class: "flex items-center gap-2 min-w-fit",
                        },
                        [
                            h(
                                UButton,
                                {
                                    size: "xs",
                                    variant: "ghost",
                                    color: "error",
                                    class: "cursor-pointer hover:bg-red-50 border-red-200 hover:border-red-400 transition-all duration-200 group",
                                    onClick: async (e: MouseEvent) => {
                                        e.stopPropagation()
                                        if (confirm("Are you sure you want to delete this record?")) {
                                            const status = await rag.deletePointById(row.original.id)
                                            if (status.code === 200) ragStore.removePointById(row.original.id)
                                        }
                                    },
                                    title: "Delete API key permanently",
                                },
                                {
                                    default: () =>
                                        h(UIcon, {
                                            name: "i-lucide-trash-2",
                                            class: "size-4 group-hover:scale-110 transition-transform duration-200",
                                        }),
                                }
                            ),
                        ]
                    ),
                    "min-w-32"
                ),
        },
    ]
</script>

<style scoped>
/* Force the inner container of UPagination to wrap on small screens */
:deep(nav > div) {
    flex-wrap: wrap !important;
    justify-content: center;
}
</style>
