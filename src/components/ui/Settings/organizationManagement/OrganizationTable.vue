<template>
    <div class="border-border flex h-full flex-col rounded-xl shadow-sm transition-all duration-200">
        <!-- Table -->
        <UTable
            ref="table"
            sticky
            :columns="Columns"
            :data="paginatedData"
            @select="handleRowSelect"
            class="h-full rounded-xl"
            aria-label="Members table"
            :ui="{
                thead: '[&_th]:cursor-pointer [&_th]:hover:text-zinc-600 dark:[&_th]:hover:text-gray-300 h-14 bg-tableBgHeader',
                tbody: '[&_td]:cursor-pointer',
            }"
        >
            <template #expanded="{ row }">
                <pre class="overflow-x-auto rounded bg-gray-100 p-2 text-xs"
                    >{{ JSON.stringify(row.original, null, 2) }}
        </pre
                >
            </template>
        </UTable>

        <!-- Empty state -->
        <div v-if="!loading && totalItems === 0" class="flex flex-col items-center justify-center py-12 text-gray-500">
            <span class="i-heroicons-document-magnifying-glass-20-solid mb-2 text-3xl"></span>
            <p aria-label="No records found">No records found</p>
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
    import { h, ref, computed, watch, resolveComponent } from "vue"
    import type { TableColumn } from "@nuxt/ui"
    import type { IMember } from "@/types/organization"
    import { COLOR_MAPS, createSortHeader, mw, toPacificDate } from "@/util/nuxtUiUtil"
    const UBadge = resolveComponent("UBadge")
    const UButton = resolveComponent("UButton")
    const UIcon = resolveComponent("UIcon")

    // Props
    interface Props {
        loading?: boolean
        members: IMember[]
        searchQuery: string
        selectedRoleFilter: string
    }

    const props = withDefaults(defineProps<Props>(), {
        loading: false,
    })

    // Emits
    const emit = defineEmits<{
        (e: "edit", member: IMember): void
        (e: "remove", member: IMember): void
    }>()

    // Row selection
    const handleRowSelect = (row: { toggleSelected: (val: boolean) => void; getIsSelected: () => boolean }, e?: Event) => {
        row.toggleSelected(!row.getIsSelected())
    }

    // Pagination state
    const currentPage = ref(1)
    const itemsPerPage = 7

    // Filtering
    const filteredMembers = computed(() => {
        let filtered = props.members
        if (props.searchQuery) {
            const q = props.searchQuery.toLowerCase()
            filtered = filtered.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
        }
        if (props.selectedRoleFilter) {
            filtered = filtered.filter((m) => m.role === props.selectedRoleFilter)
        }
        return filtered
    })

    // Paginated data
    const paginatedData = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage
        const end = start + itemsPerPage
        return filteredMembers.value.slice(start, end)
    })

    const totalItems = computed(() => filteredMembers.value.length)

    // Reset page when filters change
    watch(
        () => [props.searchQuery, props.selectedRoleFilter],
        () => {
            currentPage.value = 1
        }
    )

    // Columns
    const Columns: TableColumn<IMember>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => createSortHeader("Member", column),
            minSize: 120,
            size: 200,
            enableSorting: true,
            sortingFn: "alphanumeric",
        },
        {
            accessorKey: "email",
            header: ({ column }) => createSortHeader("Email", column),
            minSize: 160,
            size: 240,
            enableSorting: true,
            sortingFn: "alphanumeric",
        },
        {
            accessorKey: "role",
            header: ({ column }) => createSortHeader("Role", column),
            minSize: 120,
            size: 160,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => {
                const status = (row.getValue("role") as string)?.toLowerCase()
                const color = COLOR_MAPS.role[status as keyof typeof COLOR_MAPS.role] || "gray"
                return mw(
                    h(UBadge, { class: "capitalize", variant: "subtle", color }, () => status),
                    "min-w-24"
                )
            },
        },
        {
            accessorKey: "joinedAt",
            header: ({ column }) => createSortHeader("Joined", column),
            minSize: 120,
            size: 180,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => toPacificDate(row.original.joinedAt),
        },
        {
            accessorKey: "lastActive",
            header: ({ column }) => createSortHeader("Last Active", column),
            minSize: 120,
            size: 180,
            enableSorting: true,
            sortingFn: "alphanumeric",
            cell: ({ row }) => toPacificDate(row.original.lastActive),
        },
        {
            accessorKey: "-",
            header: "Actions",
            cell: ({ row }) =>
                mw(
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
                                    onClick: async (e: MouseEvent) => {
                                        e.stopPropagation()
                                        emit("edit", row.original)
                                    },
                                    title: "Edit this item",
                                    "aria-label": `Edit item ${row.original.name || row.original.id || ""}`,
                                },
                                {
                                    default: () =>
                                        h(UIcon, {
                                            name: "i-lucide-edit",
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
                                        // Add confirmation for destructive action
                                        const itemName = row.original.name || row.original.email || "this item"
                                        if (confirm(`Are you sure you want to delete ${itemName}?`)) {
                                            emit("remove", row.original)
                                        }
                                    },
                                    title: "Delete this item permanently",
                                    "aria-label": `Delete item ${row.original.name || row.original.id || ""} permanently`,
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
    /* Scrollbars */
    .max-h-\[600px\]::-webkit-scrollbar {
        width: 8px;
    }

    .max-h-\[600px\]::-webkit-scrollbar-track {
        background: var(--strokeColor);
        border-radius: 4px;
    }

    .max-h-\[600px\]::-webkit-scrollbar-thumb {
        background: var(--textColor);
        border-radius: 4px;
        opacity: 0.5;
    }

    .max-h-\[600px\]::-webkit-scrollbar-thumb:hover {
        opacity: 0.7;
    }

    .overflow-x-auto::-webkit-scrollbar {
        height: 6px;
    }

    .overflow-x-auto::-webkit-scrollbar-track {
        background: var(--strokeColor);
        border-radius: 3px;
    }

    .overflow-x-auto::-webkit-scrollbar-thumb {
        background: var(--textColor);
        border-radius: 3px;
        opacity: 0.5;
    }

    .overflow-x-auto::-webkit-scrollbar-thumb:hover {
        opacity: 0.7;
    }

    /* Sticky headers */
    .sticky thead {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    :global(:root[data-theme="dark"]) .sticky thead {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .max-h-\[600px\] {
        scroll-behavior: smooth;
    }

    /* Row hover */
    tr:hover {
        background-color: rgba(0, 0, 0, 0.02);
        transition: background-color 0.2s ease;
    }
</style>
