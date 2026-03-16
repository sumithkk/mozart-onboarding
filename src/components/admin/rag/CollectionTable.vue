<template>
    <div class="border-border mb-4 overflow-hidden rounded-xl border shadow-sm transition-all duration-200">
        <!-- Table -->
        <UTable
            ref="table"
            sticky
            :columns="CollectionColumns"
            :data="paginatedData"
            @select="handleRowSelect"
            class="h-full"
            :ui="{
                thead: '[&_th]:cursor-pointer [&_th]:hover:text-zinc-600 dark:[&_th]:hover:text-gray-300 h-14 bg-tableBgHeader',
                tbody: '[&_td]:cursor-pointer',
            }"
        >
            <template #expanded="{ row }">
                <pre class="rounded bg-gray-100 p-2 text-xs">{{ JSON.stringify(row.original, null, 2) }}</pre>
            </template>
        </UTable>

        <!-- Pagination -->
        <div v-if="!loading && totalItems > 0" class="flex items-center justify-between px-4 py-8">
            <div class="hidden text-sm text-gray-500 sm:block">Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }} results</div>

            <UPagination v-model:page="currentPage" :page-count="itemsPerPage" :total="totalItems" :max="6" :prev-button="{ icon: 'i-heroicons-chevron-left-20-solid', label: 'Prev' }" :next-button="{ icon: 'i-heroicons-chevron-right-20-solid', label: 'Next' }" show-last show-first size="sm" class="[&_*]:cursor-pointer" show-edges />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { h, resolveComponent, ref, computed, watch } from "vue"
    import type { TableColumn } from "@nuxt/ui"
    import { createSortHeader, getUserFullName, mw } from "@/util/nuxtUiUtil"
    import type { ICollection } from "@/types/store"

    // Resolve components
    const UBadge = resolveComponent("UBadge")
    const UButton = resolveComponent("UButton")
    const UIcon = resolveComponent("UIcon")

    // Props
    interface Props {
        collections: ICollection[]
        loading?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        loading: false,
    })

    // Emits
    const emit = defineEmits<{
        rowSelect: [row: any, event?: Event]
        showInfo: [id: string]
        deleteCollection: [id: string, name: string]
    }>()

    // Pagination state
    const currentPage = ref(1)
    const itemsPerPage = 6

    // Computed properties for pagination
    const totalItems = computed(() => props.collections.length)

    const paginatedData = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage
        const end = start + itemsPerPage
        return props.collections.slice(start, end)
    })

    // Reset to first page when collections change
    watch(
        () => props.collections,
        () => {
            currentPage.value = 1
        },
        { deep: true }
    )

    // Methods
    const handleRowSelect = (row: any, e?: Event) => {
        emit("rowSelect", row, e)
    }

    const handleShowInfo = (id: string) => {
        emit("showInfo", id)
    }

    const handleDeleteCollection = (id: string, name: string) => {
        emit("deleteCollection", id, name)
    }

    // Table columns definition
    const CollectionColumns: TableColumn<ICollection>[] = [
        {
            accessorKey: "alias",
            header: ({ column }) => createSortHeader("Alias", column),
            minSize: 96,
            size: 120,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => row.original.alias,
        },
        {
            accessorKey: "name",
            header: ({ column }) => createSortHeader("Name", column),
            minSize: 96,
            size: 120,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => getUserFullName(row.original.name),
        },
        {
            accessorKey: "service",
            header: ({ column }) => createSortHeader("Service", column),
            minSize: 96,
            size: 120,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => row.original.service,
        },
        {
            accessorKey: "distance",
            header: ({ column }) => createSortHeader("Distance", column),
            minSize: 80,
            size: 100,
            enableSorting: true,
            sortingFn: "basic",
            cell: ({ row }) => row.original.distance,
        },
        {
            accessorKey: "embedding",
            header: ({ column }) => createSortHeader("Embedding", column),
            minSize: 96,
            size: 120,
            enableSorting: false,
            cell: ({ row }) => row.original.embedding,
        },
        {
            accessorKey: "owner",
            header: ({ column }) => createSortHeader("Owner", column),
            minSize: 96,
            size: 120,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => row.original.owner,
            meta: {
                class: {
                    th: "cursor-pointer",
                    td: "cursor-pointer",
                },
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => createSortHeader("Created At", column),
            minSize: 120,
            size: 160,
            enableSorting: true,
            sortingFn: "datetime",
            cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
        },
        {
            accessorKey: "_",
            header: () => mw("Actions", "min-w-32"),
            minSize: 120,
            size: 150,
            enableSorting: false,
            cell: ({ row }) => {
                return mw(
                    h(
                        "div",
                        {
                            class: "flex  gap-2 min-w-fit",
                        },
                        [
                            h(
                                UButton,
                                {
                                    size: "xs",
                                    variant: "ghost",
                                    color: "primary",
                                    class: "cursor-pointer hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 group rounded-md px-2",
                                    onClick: (e: MouseEvent) => {
                                        e.stopPropagation()
                                        handleShowInfo(row.original.id)
                                    },
                                    title: "View collection details",
                                    "aria-label": `View details for ${row.original.name || "collection"}`,
                                },
                                {
                                    default: () =>
                                        h(UIcon, {
                                            name: "i-lucide-info",
                                            class: "size-4 group-hover:scale-110 transition-transform duration-200",
                                        }),
                                }
                            ),

                            h("div", {
                                class: "w-px h-4 bg-gray-300",
                            }),

                            h(
                                UButton,
                                {
                                    size: "xs",
                                    variant: "ghost",
                                    color: "error",
                                    class: "cursor-pointer hover:bg-red-50 hover:text-red-600 transition-all duration-200 group rounded-md px-2",
                                    onClick: async (e: MouseEvent) => {
                                        e.stopPropagation()
                                        const collectionName = row.original.name || "this collection"
                                        if (confirm(`Are you sure you want to delete "${collectionName}"? This action cannot be undone.`)) {
                                            await handleDeleteCollection(row.original.id, row.original.name)
                                        }
                                    },
                                    title: "Delete collection permanently",
                                    "aria-label": `Delete collection ${row.original.name || ""} permanently`,
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
                )
            },
        },
    ]
</script>

<!-- <style scoped>
:deep(th),
:deep(td) {
    cursor: pointer;
}
</style> -->
