<template>
    <div class="flex h-full flex-col">
        <!-- Table Section -->
        <div class="log-container min-w-full flex-1 flex-grow overflow-auto">
            <UTable
                :data="paginatedData"
                @select="$emit('handle-row-select', $event)"
                class="h-full rounded-lg"
                :columns="filteredTableColumns"
                sticky
                :ui="{
                    table: 'w-full border-collapse text-left h-full',
                    tbody: 'overflow-y-auto',
                    tr: 'text-textColor',
                    th: 'px-3 text-[.7rem] log-th',
                    td: 'log-td p-3 py-2 ',
                    thead: '[&_th]:cursor-pointer [&_th]:hover:text-zinc-600 dark:[&_th]:hover:text-gray-300 h-14 bg-tableBgHeader',
                }"
            >
                <template #expanded="{ row }">
                    <pre class="">{{ JSON.stringify(row.original, null, 2) }}</pre>
                </template>
            </UTable>
        </div>

        <!-- Pagination Section -->
        <div v-if="totalItems > 0" class="mt-4 mb-20 flex items-center justify-between px-4 py-8">
            <div class="hidden text-sm text-gray-500 sm:block">
                Showing
                {{ (currentPage - 1) * itemsPerPage + 1 }}
                to
                {{ Math.min(currentPage * itemsPerPage, totalItems) }}
                of {{ totalItems }} results
            </div>

            <UPagination
                v-model:page="currentPageModel"
                :total="pagination.totalCount"
                :items-per-page="itemsPerPage"
                :prev-button="{
                    icon: 'i-heroicons-chevron-left-20-solid',
                    label: 'Prev',
                }"
                :next-button="{
                    icon: 'i-heroicons-chevron-right-20-solid',
                    label: 'Next',
                }"
                :page-count="itemsPerPage"
                show-last
                show-first
                show-edges
                :sibling-count="1"
                size="sm"
                class="[&_*]:cursor-pointer"
                aria-label="Table pagination"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, toRaw } from "vue"
    import type { TableColumn } from "@nuxt/ui"
    import type { PaginationState } from "@/composables/useLogs"

    // ===== PROPS =====
    const props = defineProps<{
        paginatedData: any[]
        filteredTableColumns: TableColumn<any>[]
        currentPage: number
        itemsPerPage: number
        totalItems: number
        pagination: PaginationState
    }>()

    // console.log(toRaw(props.filteredTableColumns), toRaw(props.paginatedData))

    // ===== EMITS =====
    const emit = defineEmits<{
        "handle-row-select": [row: { toggleSelected: (val: boolean) => void; getIsSelected: () => boolean }, e?: Event]
        "update-page": [page: number]
    }>()

    // ===== COMPUTED =====
    const currentPageModel = computed({
        get: () => props.currentPage,
        set: (value: number) => emit("update-page", value),
    })
</script>
