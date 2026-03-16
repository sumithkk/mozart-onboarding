<template>
    <div class="border-border mt-4 w-full rounded-xl border transition-all duration-200">
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
                <pre class="overflow-x-auto rounded bg-gray-100 p-2 text-xs">
                    {{ JSON.stringify(row.original, null, 2) }}
        </pre
                >
            </template>

            <template #empty>
                <div class="px-6 py-4 text-center text-neutral-500">No records found</div>
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
    import { h, ref, resolveComponent } from "vue"
    import type { TableColumn } from "@nuxt/ui"
    import { handleRowSelect, isValidLink, mw } from "@/util/nuxtUiUtil"

    // Table columns
    const UButton = resolveComponent("UButton")
    const UIcon = resolveComponent("UIcon")

    // Pagination state
    const currentPage = ref(1)
    const itemsPerPage = 2

    // Total items (computed so it updates reactively)

    // Paginated slice
    const paginatedData = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage
        const end = start + itemsPerPage
        return props.data.slice(start, end)
    })

    interface Props {
        data: IRagSearchResults[]
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

    const emit = defineEmits<{
        showVectorDetails: [id: string, row: IRagSearchResults]
        handleDelete: [row: IRagSearchResults]
    }>()

    const Columns: TableColumn<IRagSearchResults>[] = [
        {
            accessorKey: "id",
            header: "ID",
            enableHiding: true,
        },
        {
            accessorKey: "title",
            header: "Title",
        },
        {
            accessorKey: "metadata",
            header: "Metadata",
            size: 300,
            minSize: 300,
            cell: ({ row }) => {
                const record = row.original
                const metadata = record.metadata

                return h(
                    "div",
                    {
                        class: "max-w-[26rem]  px-4 py-2",
                    },
                    [
                        h("div", { class: "max-h-[5rem] overflow-y-auto" }, [
                            // Source link section
                            isValidLink(metadata.source) &&
                                h("div", {}, [
                                    record.url.includes("@json")
                                        ? h("span", {}, [
                                              "source: ",
                                              h(
                                                  "a",
                                                  {
                                                      href: "#",
                                                      onClick: (e) => {
                                                          e.preventDefault()
                                                          openJsonInNewTab(record)
                                                      },
                                                  },
                                                  "Link"
                                              ),
                                          ])
                                        : h("span", {}, [
                                              "source: ",
                                              h(
                                                  "a",
                                                  {
                                                      href: metadata.source,
                                                      target: "_blank",
                                                  },
                                                  "Link"
                                              ),
                                          ]),
                                    h(
                                        "button",
                                        {
                                            class: "materialSymbolsOutlined edit-button inline-element",
                                            onClick: () => {
                                                emit("showVectorDetails", record.id, row.original)
                                            },
                                        },
                                        "edit"
                                    ),
                                ]),

                            // BatchedAt section
                            h("div", {}, [
                                `batchedAt: ${new Date(metadata.batchedAt).toLocaleString()}`,
                                !isValidLink(metadata.source) &&
                                    h(
                                        "div",
                                        {
                                            class: "materialSymbolsOutlined edit-button inline-element",
                                        },
                                        "edit"
                                    ),
                            ]),

                            // Other metadata fields
                            h("div", {}, `maxPageCount: ${metadata.maxPageCount}`),
                            h("div", {}, `username: ${metadata.username}`),
                            h("div", {}, `collection: ${metadata.collection}`),
                            h(
                                "div",
                                {
                                    class: "overflow-hidden text-ellipsis whitespace-nowrap",
                                },
                                `fileName: ${metadata.fileName}`
                            ),
                            h("div", {}, `model: ${metadata.model}`),
                            h("div", {}, `distance: ${metadata.distance}`),

                            // Dynamic metadata fields (filtered)
                            ...Object.entries(filterMetadata(metadata)).map(([key, value]) => h("div", { key }, `${key}: ${value}`)),
                        ]),
                    ]
                )
            },
        },
        {
            accessorKey: "paragraph",
            header: "Paragraph",
            size: 300,
            minSize: 300,
            cell: ({ row }) =>
                h("textarea", {
                    class: "w-full min-w-[12rem] resize-y overflow-auto  rounded-md px-2 py-1 text-sm dark:bg-gray-900 dark:text-gray-200",
                    readonly: true,
                    value: row.original.paragraph,
                }),
        },
        {
            accessorKey: "metadata.batchedAt",
            header: "Batched At",
            cell: ({ row }) => new Date(row.original.metadata.batchedAt).toLocaleString(),
        },
        {
            accessorKey: "vector",
            header: "Vector",
        },
        {
            accessorKey: "characters",
            header: "Characters",
            cell: ({ row }) => row.original.chunkSize,
        },
        {
            accessorKey: "url",
            header: "URL",
            cell: ({ row }) =>
                h(
                    "a",
                    {
                        href: row.original.url,
                        target: "_blank",
                        class: "text-blue-500",
                    },
                    "Link"
                ),
        },
        {
            accessorKey: "pageNumber",
            header: "Page",
            cell: ({ row }) => row.original.pageNumber,
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
                                    variant: "outline",
                                    color: "error",
                                    class: "cursor-pointer hover:bg-red-50 border-red-200 hover:border-red-400 transition-all duration-200 group",
                                    onClick: async (e: MouseEvent) => {
                                        e.stopPropagation()
                                        if (!confirm(`Are you sure"?`)) {
                                            return
                                        }
                                        e.stopPropagation()
                                        emit("handleDelete", row.original)
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

    const openJsonInNewTab = (file: any) => {
        const jsonString = JSON.stringify(file, null, 2)
        const blob = new Blob([jsonString], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const newTab = window.open(url, "_blank")
        if (newTab) {
            newTab.focus()
        }
    }
    const filterMetadata = (metadata: { [key: string]: any }): { [key: string]: any } => {
        const excludeKeys = ["batchedAt", "maxPageCount", "username", "collection", "fileName", "model", "distance", "source"]
        return Object.keys(metadata)
            .filter((key) => !excludeKeys.includes(key))
            .reduce((obj: { [key: string]: any }, key) => {
                obj[key] = metadata[key]
                return obj
            }, {})
    }
</script>
