<template>
    <div class="border-border mt-4 w-full rounded-xl border transition-all duration-200">
        <!-- Data table -->
        <UTable
            ref="table"
            sticky
            :columns="Columns"
            :data="paginatedData"
            @select="onRowSelect"
            class="h-full rounded-lg"
            aria-label="Vectorized file table"
            :ui="{
                thead: '[&_th]:cursor-pointer [&_th]:hover:text-zinc-600 dark:[&_th]:hover:text-gray-300 h-14 bg-tableBgHeader',
                tbody: '[&_td]:cursor-pointer',
            }"
        >
            <!-- Expanded row details -->
            <template #expanded="{ row }">
                <pre class="overflow-x-auto rounded bg-gray-100 p-2 text-xs">
          <code>{{ JSON.stringify(row.original, null, 2) }}</code>
        </pre>
            </template>
        </UTable>

        <div v-if="!loading && totalItems > 0" class="flex items-center justify-between px-4 py-2">
            <div class="hidden text-sm text-gray-500 sm:block">
                Showing
                {{ (currentPage - 1) * itemsPerPage + 1 }}
                to
                {{ Math.min(currentPage * itemsPerPage, totalItems) }}
                of {{ totalItems }} results
            </div>

            <UPagination
                v-model:page="currentPage"
                :items-per-page="itemsPerPage"
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
    import { h } from "vue"
    import type { TableColumn } from "@nuxt/ui"

    // Pagination state
    const currentPage = ref(1)
    const itemsPerPage = 5

    // Total items (computed so it updates reactively)

    // Paginated slice
    const paginatedData = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage
        const end = start + itemsPerPage
        return props.data.slice(start, end)
    })

    interface Props {
        data: IRecentSearches[]
        loading?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        loading: false,
    })

    watch(
        () => props.data,
        () => {
            currentPage.value = 1
        }
    )

    const totalItems = computed(() => props.data.length)

    // Emits
    const emit = defineEmits<{
        rowClick: [row: IRecentSearches]
    }>()

    // Handle row selection
    const onRowSelect = (
        row: {
            toggleSelected: (val: boolean) => void
            getIsSelected: () => boolean
            original: IRecentSearches
        },
        e?: Event
    ) => {
        row.toggleSelected(!row.getIsSelected())
        emit("rowClick", row.original)
    }

    // Table columns
    const Columns: TableColumn<IRecentSearches>[] = [
        {
            accessorKey: "query",
            header: "Previous Searches",
            cell: ({ row }) => h("span", { title: row.original.query }, row.original.query),
        },
        {
            accessorKey: "valueInput",
            header: "MetaData",
            cell: ({ row }) => {
                const valueInput = row.original.valueInput?.trim()
                if (!valueInput) return "None"

                const values = valueInput.split(",").map((v) => v.trim())
                return h("span", { class: "text-gray-600" }, `[${values.join(", ")}]`)
            },
        },
        {
            accessorKey: "collection",
            header: "Collection",
            cell: ({ row }) => h("span", { title: row.original.collection }, row.original.collection),
        },
    ]
</script>
