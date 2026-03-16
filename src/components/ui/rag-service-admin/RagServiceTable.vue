<template>
    <div class="border-border rounded-xl rounded-t-[0px] border transition-all duration-200">
        <UTable
            ref="table"
            sticky
            :columns="Columns"
            :data="paginatedData"
            @select="handleRowSelect"
            class="h-full rounded-lg"
            aria-label="Vectorized file table"
            :ui="{
                thead: '[&_th]:cursor-pointer [&_th]:hover:text-zinc-600 dark:[&_th]:hover:text-gray-300 h-14 bg-tableBgHeader',
                tbody: '[&_td]:cursor-pointer',
            }"
        >
            <template #expanded="{ row }">
                <pre class="bg-tableBgHeader h-14 overflow-x-auto rounded p-2 text-xs">

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
    import { createSortHeader, trimAnyString, mw } from "@/util/nuxtUiUtil"
    import type { DocumentChunk } from "@/types/rag-service"

    interface Props {
        data: DocumentChunk[]
        loading?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        loading: false,
    })

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
    const Columns: TableColumn<DocumentChunk>[] = [
        {
            accessorKey: "id",
            header: ({ column }) => createSortHeader("ID", column),
            minSize: 96,
            size: 100,
            enableSorting: true,
            sortingFn: "alphanumeric",
        },
        {
            accessorKey: "pageNumber",
            header: ({ column }) => createSortHeader("Page Number", column),
            minSize: 96,
            size: 100,
            enableSorting: true,
            sortingFn: "alphanumeric",
        },
        {
            accessorKey: "type",
            header: "Paragraph",
            minSize: 96,
            size: 200,
            cell: ({ row }) => {
                const endString = row.original.paragraph.length > 20 ? "..." : ""
                return row.original?.paragraph?.slice(0, 25) + endString
            },
        },
        {
            accessorKey: "type",
            header: ({ column }) => createSortHeader("Title", column),
            minSize: 96,
            size: 100,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => trimAnyString(row.original.title),
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
            accessorKey: "chunkSize",
            header: ({ column }) => createSortHeader("Chunk Size", column),
            minSize: 96,
            size: 100,
            enableSorting: true,
            sortingFn: "alphanumeric",
        },
    ]
</script>
