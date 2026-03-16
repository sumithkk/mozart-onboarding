<template>
    <div class="divide-accented w-full flex-1">
        <div class="flex items-center justify-between gap-4 px-4 py-3.5">
            <div class="max-w-md flex-1">
                <UInput v-model="searchQuery" variant="none" placeholder="Search by email, file name, or collection..." class="bg-foreground/10 w-full rounded-lg" size="xl">
                    <template #leading>
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--textColorSecondary)">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </template>
                    <template #trailing v-if="searchQuery">
                        <button @click="searchQuery = ''" class="transition-all duration-200 hover:scale-110" style="color: var(--textColorSecondary)" title="Clear search">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </template>
                </UInput>
            </div>

            <div>
                <!-- Refresh Button -->
                <UButton @click="refreshData" :loading="loading" size="xl" variant="outline" color="gray" class="shrink-0 cursor-pointer bg-mozart-blue text-white" title="Refresh data" :disabled="loading">
                    <template #leading v-if="!loading">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </template>
                    Refresh
                </UButton>
            </div>
        </div>

        <!-- Loading State -->
        <TableLoadingState v-if="loading" customTitle="Loading Queue Items" />

        <div v-else>
            <div class="border-border m-2 mb-4 overflow-hidden rounded-xl border shadow-sm transition-all duration-200">
                <!-- Table Content -->
                <UTable
                    ref="table"
                    @select="queueItemClicked"
                    :data="paginatedItems"
                    :columns="queueLogsDataColumns"
                    sticky
                    class="h-full"
                    :ui="{
                        thead: '[&_th]:cursor-pointer [&_th]:hover:text-zinc-600 dark:[&_th]:hover:text-gray-300 h-14 bg-tableBgHeader [&_th:first-child]:text-center',
                        tbody: '[&_td]:cursor-pointer [&_td:first-child]:text-center',
                    }"
                >
                    <template #expanded="{ row }">
                        <pre class="rounded bg-gray-100 p-2 text-xs"
                            >{{ JSON.stringify(row.original, null, 2) }}
        </pre
                        >
                    </template>
                </UTable>
            </div>

            <!-- Pagination -->
            <div v-if="!loading && totalItems > 0" class="flex items-center justify-between px-4 py-3">
                <div class="hidden text-sm text-gray-500 sm:block">Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }} results</div>

                <UPagination v-model:page="currentPage" :page-count="itemsPerPage" :total="totalItems" :max="5" :prev-button="{ icon: 'i-heroicons-chevron-left-20-solid', label: 'Prev' }" :next-button="{ icon: 'i-heroicons-chevron-right-20-solid', label: 'Next' }" show-last show-first size="sm" class="[&_*]:cursor-pointer" show-edges />
            </div>
        </div>
        <Modal v-if="selectedQueueItem" @close="selectedQueueItem = null" title="Queue Item Details">
            <Timeline :timeline="selectedQueueItem.timeline" />
        </Modal>
    </div>
</template>

<script setup lang="ts">
    import { ref, h, resolveComponent, watch, onMounted, computed } from "vue"
    import type { TableColumn } from "@nuxt/ui"
    import type { IQueueItem, QueueLogs } from "@/types/rag-service"
    import { createSortHeader, pretty, STATUS_META, type ColorToken } from "@/util/nuxtUiUtil"

    const UIcon = resolveComponent("UIcon")

    definePageMeta({ layout: "mozart-rag-service-admin", middleware: ["auth"] })

    // ----------------------| Head |---------------------
    useHead({ title: "Rag Admin" })

    const UBadge = resolveComponent("UBadge")
    const UButton = resolveComponent("UButton")
    const UInput = resolveComponent("UInput")
    const UPagination = resolveComponent("UPagination")

    const table = ref()
    const queueItems = ref<IQueueItem[]>([])
    const filteredItems = ref<IQueueItem[]>([])
    const paginatedItems = ref<IQueueItem[]>([])
    const searchQuery = ref("")
    const loading = ref(false)
    const selectedQueueItem = ref<IQueueItem | null>()
    const selectedItems = ref<Set<string>>(new Set())
    const selectAll = ref(false)

    // Pagination state
    const currentPage = ref(1)
    const itemsPerPage = 8
    const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage))
    const totalItems = computed(() => filteredItems.value.length)

    // keep currentPage inside bounds [1, totalPages] (treat 0 pages as 1)
    const ensurePageInRange = () => {
        const pages = Math.max(1, totalPages.value)
        if (currentPage.value < 1) currentPage.value = 1
        else if (currentPage.value > pages) currentPage.value = pages
    }

    function queueItemClicked(row: any, e?: Event) {
        // Open modal with queue item details
        selectedQueueItem.value = row.original
    }
    // small helper to wrap header/cell content with a min width
    function mw(content: any, minWClass: string) {
        return h("div", { class: `${minWClass} truncate` }, content)
    }
    // slice rows for current page
    const updatePaginatedItems = () => {
        const startIndex = (currentPage.value - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        paginatedItems.value = filteredItems.value.slice(startIndex, endIndex)
    }

    // Search functionality
    const filterItems = () => {
        const q = searchQuery.value.toLowerCase().trim()
        if (!q) {
            filteredItems.value = queueItems.value
        } else {
            filteredItems.value = queueItems.value.filter((item) => {
                const email = (item.email || "").toLowerCase()
                const fileName = (item.file_name || "").toLowerCase()
                const collection = (item.collection_name || "").toLowerCase()
                return email.includes(q) || fileName.includes(q) || collection.includes(q)
            })
        }
        currentPage.value = 1 // reset to first page after filtering
        ensurePageInRange()
        updatePaginatedItems()
    }

    // Watchers
    watch(searchQuery, () => {
        filterItems()
    })

    watch(currentPage, () => {
        updatePaginatedItems()
    })

    watch(filteredItems, () => {
        ensurePageInRange()
        updatePaginatedItems()
    })

    // Refresh data function
    const refreshData = async () => {
        loading.value = true
        try {
            const queueData = await useRag().getAllQueueItems()
            queueItems.value = queueData
            filteredItems.value = queueItems.value
            currentPage.value = 1
            ensurePageInRange()
            updatePaginatedItems()

            // Reapply search filter if there's an active search
            if (searchQuery.value.trim()) {
                filterItems() // will reset to page 1 & update slice
            }
        } catch (error) {
            console.error("Error refreshing queue data:", error)
            // add toast/error UI if desired
        } finally {
            loading.value = false
        }
    }

    async function initialPageData() {
        loading.value = true
        try {
            const queueData = await useRag().getAllQueueItems()
            queueItems.value = queueData
            filteredItems.value = queueItems.value
            currentPage.value = 1
            ensurePageInRange()
            updatePaginatedItems()
        } catch (error) {
            console.error("Error fetching queue data:", error)
        } finally {
            loading.value = false
        }
    }

    // Action button handler
    const handleDeleteItem = async (id: string) => {
        const status = await useRag().deleteQueueItem(id)
        if (status) {
            initialPageData()
        }
    }

    const restart = async (item: QueueLogs) => {
        const documentId = item.backend_update_url ? item.backend_update_url.match(/DOC_[a-f0-9\-]+$/)?.[0] || "" : ""
        const condition = item.collection_name && item.collection_alias && item.distance && item.embedding && item.chunk_size && item.chunk_type && item.batch_size
        if (condition) {
            await useRag().addFileToVectorizationQueue(item.file_name, item.file_url, item.file_type, item.file_size, item.collection_name, item.collection_alias, item.priority, item.distance, item.embedding, item.chunk_size, item.chunk_type, item.batch_size, documentId)
            await handleDeleteItem(item.id)
        }
    }

    // Select All functionality
    const toggleSelectAll = () => {
        if (selectAll.value) {
            // Select all items on current page
            paginatedItems.value.forEach((item) => {
                selectedItems.value.add(item.id as string)
            })
        } else {
            // Deselect all items on current page
            paginatedItems.value.forEach((item) => {
                selectedItems.value.delete(item.id as string)
            })
        }
    }

    // Toggle individual item selection
    const toggleItemSelection = (itemId: string) => {
        if (selectedItems.value.has(itemId)) {
            selectedItems.value.delete(itemId)
        } else {
            selectedItems.value.add(itemId)
        }
        // Update select all state based on current page selection
        updateSelectAllState()
    }

    // Update select all checkbox state
    const updateSelectAllState = () => {
        const currentPageIds = new Set(paginatedItems.value.map((item) => item.id as string))
        selectAll.value = paginatedItems.value.length > 0 && Array.from(currentPageIds).every((id) => selectedItems.value.has(id))
    }

    // Watch for pagination changes to update select all state
    watch(
        paginatedItems,
        () => {
            updateSelectAllState()
        },
        { deep: true }
    )

    // Table columns
    const queueLogsDataColumns: TableColumn<QueueLogs>[] = [
        {
            accessorKey: "checkbox",
            header: () => {
                return mw(
                    h(
                        "div",
                        {
                            class: "flex items-center justify-center",
                        },
                        [
                            h("input", {
                                type: "checkbox",
                                checked: selectAll.value,
                                key: `select-all-${selectAll.value}`, // Force re-render on change
                                onChange: (e: Event) => {
                                    const target = e.target as HTMLInputElement
                                    selectAll.value = target.checked
                                    toggleSelectAll()
                                },
                                class: "h-4 w-4 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-0",
                                "aria-label": "Select all items on this page",
                                title: "Select all items on this page",
                            }),
                        ]
                    ),
                    "min-w-12"
                )
            },
            minSize: 48,
            size: 60,
            enableSorting: false,
            cell: ({ row }) => {
                const itemId = row.original.id as string
                const isChecked = selectedItems.value.has(itemId)
                return mw(
                    h(
                        "div",
                        {
                            class: "flex items-center justify-center",
                            onClick: (e: Event) => e.stopPropagation(),
                        },
                        [
                            h("input", {
                                type: "checkbox",
                                checked: isChecked,
                                onChange: () => toggleItemSelection(itemId),
                                class: "h-4 w-4 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-0",
                                onClick: (e: Event) => e.stopPropagation(),
                                onMousedown: (e: Event) => e.stopPropagation(),
                                "aria-label": `Select queue item ${row.original.file_name || itemId}`,
                                title: `Select ${row.original.file_name || "item"}`,
                            }),
                        ]
                    ),
                    "min-w-12"
                )
            },
        },
        {
            accessorKey: "status",
            header: ({ column }) => createSortHeader("Status", column),
            minSize: 96,
            size: 120,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => {
                const raw = String(row.getValue("status") ?? "").toLowerCase()
                const meta = STATUS_META[raw] ?? { label: pretty(raw), color: "gray" as ColorToken }
                return mw(
                    h(UBadge, { class: "capitalize", variant: "subtle", color: meta.color }, () => meta.label),
                    "min-w-24"
                )
            },
        },
        {
            accessorKey: "worker_id",
            header: () => mw("Worker ID", "min-w-40"),
            minSize: 160,
            size: 200,
            cell: ({ row }) => mw(String(row.getValue("worker_id") ?? ""), "min-w-40"),
        },
        {
            accessorKey: "environment",
            header: ({ column }) => createSortHeader("Worker Type", column),
            minSize: 128,
            size: 160,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => {
                const status = (row.getValue("environment") as string)?.toLowerCase()
                const colorMap: Record<string, string> = {
                    local: "success",
                    development: "warning",
                    staging: "orange",
                    production: "error",
                }
                const color = colorMap[status] || "gray"
                return mw(
                    h(UBadge, { class: "capitalize", variant: "subtle", color }, () => status),
                    "min-w-32"
                )
            },
        },
        {
            accessorKey: "collection_name",
            header: ({ column }) => createSortHeader("Collection", column),
            minSize: 160,
            size: 200,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => mw(String(row.getValue("collection_name") ?? ""), "min-w-40"),
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => createSortHeader("Created At", column),
            minSize: 160,
            size: 200,
            enableSorting: true,
            sortingFn: "datetime",
            cell: ({ getValue }) => {
                const date = new Date(getValue())
                const text = date.toLocaleString("en-US", {
                    timeZone: "America/New_York",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                })
                return mw(h("span", { class: "tabular-nums" }, text), "min-w-40")
            },
        },
        {
            accessorKey: "embedding",
            header: ({ column }) => createSortHeader("Embedding", column),
            minSize: 112,
            size: 140,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => mw(String(row.getValue("embedding") ?? ""), "min-w-28"),
        },
        {
            accessorKey: "file_name",
            header: () => mw("File Name", "min-w-56"),
            minSize: 224,
            size: 280,
            cell: ({ row }) => {
                const fileName = (row.getValue("file_name") as string) ?? ""
                const trimFileName = (name: string, maxLength = 30) => {
                    if (name.length <= maxLength) return name
                    const half = Math.floor((maxLength - 3) / 2)
                    return name.slice(0, half) + "..." + name.slice(-half)
                }
                return mw(trimFileName(fileName), "min-w-56")
            },
        },
        {
            accessorKey: "priority",
            header: ({ column }) => createSortHeader("Priority", column),
            minSize: 96,
            size: 120,
            enableSorting: true,
            sortingFn: (rowA, rowB, columnId) => {
                const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
                const a = (rowA.getValue(columnId) as string)?.toLowerCase() || ""
                const b = (rowB.getValue(columnId) as string)?.toLowerCase() || ""
                return (priorityOrder[a] || 0) - (priorityOrder[b] || 0)
            },
            cell: ({ row }) => {
                const status = (row.getValue("priority") as string)?.toLowerCase()
                const colorMap: Record<string, string> = {
                    low: "success",
                    medium: "warning",
                    high: "error",
                    urgent: "error",
                }
                const color = colorMap[status] || "gray"
                return mw(
                    h(UBadge, { class: "capitalize", variant: "subtle", color }, () => status),
                    "min-w-24"
                )
            },
        },
        {
            accessorKey: "email",
            header: ({ column }) => createSortHeader("Email", column),
            minSize: 192,
            size: 240,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => mw(String(row.getValue("email") ?? ""), "min-w-48"),
        },
        {
            accessorKey: "-",
            header: () => mw("Actions", "min-w-32"),
            minSize: 120,
            size: 150,
            cell: ({ row }) => {
                const isFailed = row.original.status?.toLowerCase() === "failed"
                return mw(
                    h(
                        UButton,
                        {
                            size: "xs",
                            variant: "ghost",
                            color: isFailed ? "orange" : "error",
                            class: "cursor-pointer hover:scale-105 transition-all duration-200 group rounded-md px-3 py-1",
                            onClick: async (e: MouseEvent) => {
                                e.stopPropagation()

                                if (isFailed) {
                                    await restart(row.original)
                                } else {
                                    // Delete action with confirmation
                                    const itemName = row.original.file_name || "this item"
                                    if (confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
                                        await handleDeleteItem(row.original.id as string)
                                    }
                                }
                            },
                            title: isFailed ? `Restart ${row.original.file_name || "item"}` : `Delete ${row.original.file_name || "item"} permanently`,
                            "aria-label": isFailed ? `Restart ${row.original.file_name || "item"}` : `Delete ${row.original.file_name || "item"} permanently`,
                        },
                        {
                            default: () =>
                                h(
                                    "div",
                                    {
                                        class: "flex items-center gap-1.5",
                                    },
                                    [
                                        h(UIcon, {
                                            name: isFailed ? "i-lucide-refresh-cw" : "i-lucide-trash-2",
                                            class: "size-3.5 group-hover:scale-110 transition-transform duration-200",
                                        }),
                                    ]
                                ),
                        }
                    ),
                    "min-w-32"
                )
            },
        },
    ]

    // ----------------------| On Mounted |---------------------
    onMounted(async () => {
        initialPageData()
    })
</script>

<style scoped>
    /* Ensure checkbox column cells don't trigger row selection */
    :deep(tbody tr td:first-child) {
        cursor: default !important;
    }

    :deep(tbody tr:hover td:first-child) {
        background-color: inherit !important;
    }

    /* Ensure checkbox column header is centered */
    :deep(thead tr th:first-child) {
        text-align: center;
    }

    /* Polish checkbox styling - consistent with design system */
    :deep(tbody td:first-child input[type="checkbox"]),
    :deep(thead th:first-child input[type="checkbox"]) {
        accent-color: #2844a4; /* mozart-blue */
        -webkit-appearance: checkbox;
        appearance: checkbox;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        transition: filter 0.15s ease-in-out;
    }

    /* Remove any focus ring artifacts */
    :deep(tbody td:first-child input[type="checkbox"]:focus),
    :deep(thead th:first-child input[type="checkbox"]:focus) {
        outline: none !important;
        box-shadow: none !important;
        border: none !important;
    }

    /* Ensure wrapper divs don't create visual artifacts */
    :deep(tbody td:first-child > div),
    :deep(thead th:first-child > div) {
        border: none !important;
        outline: none !important;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 1rem;
    }

    /* Smooth transitions for checkbox interactions - no scale to avoid distortion */
    :deep(tbody td:first-child input[type="checkbox"]:hover),
    :deep(thead th:first-child input[type="checkbox"]:hover) {
        cursor: pointer;
        filter: brightness(1.1);
    }

    /* Dark mode support */
    :deep(.dark tbody td:first-child input[type="checkbox"]),
    :deep(.dark thead th:first-child input[type="checkbox"]) {
        accent-color: rgb(37, 99, 235);
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
    }
</style>
