<template>
    <div class="border-border mt-3 overflow-hidden rounded-lg border-t-2 shadow-sm transition-all duration-200">
        <!-- Table -->
        <UTable
            ref="table"
            sticky
            :columns="VectorizeColumns"
            :data="paginatedData"
            @select="handleRowSelect"
            class="h-full"
            aria-label="Vectorized file table"
            :ui="{
                thead: '[&_th]:cursor-pointer [&_th]:hover:text-zinc-600 dark:[&_th]:hover:text-gray-300 h-14 bg-tableBgHeader',
                tbody: '[&_td]:cursor-pointer',
            }"
        >
            <template #expanded="{ row }">
                <pre class="overflow-x-auto rounded bg-gray-100 p-2 text-xs">

{{ JSON.stringify(row.original, null, 2) }}
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
        <div v-if="!loading && totalItems > 0" class="flex items-center justify-between px-4 py-8">
            <div class="hidden text-sm text-gray-500 sm:block">
                Showing
                {{ (currentPage - 1) * itemsPerPage + 1 }}
                to
                {{ Math.min(currentPage * itemsPerPage, totalItems) }}
                of {{ totalItems }} results
            </div>

            <UPagination
                v-model:page="currentPage"
                :page-count="itemsPerPage"
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
                class="[&_*]:cursor-pointer"
                aria-label="Table pagination"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { h, resolveComponent, ref, computed, watch } from "vue"
    import type { TableColumn } from "@nuxt/ui"
    import { createSortHeader, trimAnyString, toPacificDate, mimeToExtension } from "@/util/nuxtUiUtil"
    import { formatBytes } from "@/util"
    import type { IWorkbenchRecord } from "@/types/store"

    interface Props {
        data: IWorkbenchRecord[]
        loading?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        loading: false,
    })

    // Components
    const UBadge = resolveComponent("UBadge")

    // Pagination state
    const currentPage = ref(1)
    const itemsPerPage = 5

    // Total items (computed so it updates reactively)
    const totalItems = computed(() => props.data.length)

    // Paginated slice
    const paginatedData = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage
        const end = start + itemsPerPage
        return props.data.slice(start, end)
    })

    // Reset to first page when data changes
    watch(
        () => props.data,
        () => {
            currentPage.value = 1
        }
    )

    // Row selection handler with stronger typing
    const handleRowSelect = (row: { toggleSelected: (val: boolean) => void; getIsSelected: () => boolean }, e?: Event) => {
        row.toggleSelected(!row.getIsSelected())
    }

    // Column definitions
    const VectorizeColumns: TableColumn<IWorkbenchRecord>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => createSortHeader("File Name", column),
            minSize: 96,
            size: 160,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) =>
                h(
                    "span",
                    {
                        class: "truncate block max-w-[180px]",
                        title: row.original.name,
                    },
                    trimAnyString(row.original.name)
                ),
        },
        {
            accessorKey: "type",
            header: ({ column }) => createSortHeader("File Type", column),
            minSize: 96,
            size: 120,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => h(UBadge, { color: "blue", variant: "subtle" }, () => mimeToExtension(row.original.mimeType)),
        },
        {
            accessorKey: "size",
            header: ({ column }) => createSortHeader("File Size", column),
            minSize: 96,
            size: 120,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => h("span", { class: " block", title: `${row.original.size} bytes` }, formatBytes(row.original.size)),
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => createSortHeader("Created At", column),
            minSize: 120,
            size: 160,
            enableSorting: true,
            sortingFn: "basic",
            cell: ({ row }) => toPacificDate(row.original.createdAt),
        },
    ]
</script>
