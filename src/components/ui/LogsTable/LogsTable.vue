<template>
    <div class="page-wrapper relative my-4 flex h-full w-full flex-1 flex-col overflow-hidden rounded-[10px] p-5 text-[0.7em] md:mx-12 md:w-[90%]" v-click-outside="closeLogs" style="display: flex; flex-direction: column">
        <!-- Header Section -->
        <LogsHeader
            :timezone="timezone"
            :selectedPlatform="selectedPlatform"
            :selectedEnvironment="selectedEnvironment"
            :selectedLogTypeText="getSelectedLogType()"
            :logTypeOptions="logTypeOptions"
            :platformOptions="platformOptions"
            :environmentOptions="environmentOptions"
            @change-timezone="changeTimezone"
            @update-log-type="updateSelectedLogType"
            @update-platform="updateSelectedPlatform"
            @update-environment="updateSelectedEnvironment"
        />

        <!-- Main Content Section -->
        <div v-if="!(isLoading || tableLoading)" class="mt-8 flex-grow overflow-hidden transition-all">
            <template v-if="sortedRowData.length > 0">
                <LogsNuxtTable :paginatedData="sortedRowData" :filteredTableColumns="filteredTableColumns" :currentPage="currentPage" :itemsPerPage="itemsPerPage" :totalItems="totalItems" :pagination="pagination" @handle-row-select="$emit('handle-row-select', $event)" @update-page="updateCurrentPage" />
            </template>
            <template v-else>
                <div class="flex flex-1 items-center justify-center py-16 text-sm text-gray-500">No log entries found</div>
            </template>
        </div>

        <TableLoadingState v-if="isLoading || tableLoading" customTitle="Loading Logs" />
    </div>
</template>

<script setup lang="ts">
    // ===== IMPORTS =====
    import { ref, onMounted, computed, h, watch } from "vue"
    import { marked } from "marked"
    import type { TableColumn } from "@nuxt/ui"

    // Utils
    import { convertTimeToPDTAndEDT } from "~/util"

    // Composables
    import { useLogs } from "~/composables/useLogs"

    // Components
    import LogActions from "./CellView/LogActions.vue"
    import SearchResult from "./CellView/SearchResult.vue"
    import Text from "./CellView/Text.vue"
    import TokenUsage from "./CellView/TokenUsage.vue"
    import UserInput from "./CellView/UserInput.vue"
    import LLMPrompt from "./CellView/LLMPrompt.vue"
    import LLMResponse from "./CellView/LLMResponse.vue"

    // Types

    // ===== COMPOSABLES & STORES =====
    const { logType, timezone, initializeLogs, deleteLog, changeTimezone, changeLogType, isLoading, pagination, resetPaginationState } = useLogs()

    const ragStore = useRagStore()

    // ===== REACTIVE STATE =====
    const currentPage = ref(1)
    const itemsPerPage = 5
    const paginatedData = ref<any[]>([])
    const sortedRowData = ref<any[]>([])
    const selectedPlatform = ref<string>("All")
    const selectedEnvironment = ref<string>("All")
    const filteredTableColumns = ref<TableColumn<any>[]>([])
    const sortedColumn = ref<string>("index")
    const sortDirection = ref<"asc" | "desc">("asc")
    const tableLoading = ref<boolean>(true)

    // ===== COMPUTED PROPERTIES =====
    const totalItems = computed(() => pagination.value?.totalCount || 0)

    // ===== CONFIGURATION DATA =====
    const logTypeOptions = [
        { text: "Vectorization", value: "vectorization" },
        { text: "Drafting", value: "drafting" },
        { text: "Composition", value: "composition" },
        { text: "Screen Capture", value: "screencapture" },
        { text: "Vector Search", value: "vector_search" },
        { text: "Prompt", value: "system_prompt" },
    ]

    const platformOptions = [
        { text: "All", value: "" },
        { text: "Mozart", value: "Mozart" },
        { text: "MLaw", value: "MLaw" },
    ]

    const environmentOptions = [
        { text: "All", value: "" },
        { text: "Development", value: "development" },
        { text: "Staging", value: "staging" },
        { text: "Production", value: "production" },
    ]

    const changeSortDirection = (column: string) => {
        // Special case for index column - always sort in ascending order first
        if (column === "index") {
            if (sortedColumn.value === column && sortDirection.value === "asc") {
                sortDirection.value = "desc"
            } else {
                sortDirection.value = "asc"
            }
            sortedColumn.value = column
        } else {
            if (sortedColumn.value === column) {
                sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc"
            } else {
                sortedColumn.value = column
                sortDirection.value = "asc"
            }
        }
    }

    const sortBy = () => {
        const column = sortedColumn.value
        if (!column) {
            sortedRowData.value = paginatedData.value
            return
        }

        const flatLogs = paginatedData.value.flat()

        flatLogs.sort((logA: any, logB: any) => {
            const a = logA[column]
            const b = logB[column]

            // Special handling for index to ensure consistent sorting
            if (column === "index") {
                return sortDirection.value === "asc" ? a - b : b - a
            }

            if (column === "created_at") {
                const timeA = isNaN(Number(a)) ? new Date(a).getTime() : new Date(Number(a)).getTime()
                const timeB = isNaN(Number(b)) ? new Date(b).getTime() : new Date(Number(b)).getTime()
                return sortDirection.value === "asc" ? timeA - timeB : timeB - timeA
            }

            if (typeof a === "string" && typeof b === "string") {
                return sortDirection.value === "asc" ? a.localeCompare(b) : b.localeCompare(a)
            }
            if (typeof a === "number" && typeof b === "number") {
                return sortDirection.value === "asc" ? a - b : b - a
            }
            if (typeof a === "boolean" && typeof b === "boolean") {
                return sortDirection.value === "asc" ? Number(a) - Number(b) : Number(b) - Number(a)
            }
            return 0
        })

        sortedRowData.value = flatLogs
    }

    const isSorted = (column: string) => {
        return sortedColumn.value === column && sortDirection.value
    }

    function createSortHeader(option: "created_at" | "generationId" | "module" | "search_query" | "conversationId" | "messageId" | "text" | "isRAGCompose" | "file_name" | "status" | "email" | "collection_name", label: string | (() => string), sort: () => void) {
        const sorted = isSorted(option)
        const direction = sorted ? sortDirection.value : null

        const displayLabel = typeof label === "function" ? label() : label

        return h(
            "div",
            {
                onClick: () => {
                    changeSortDirection(option)
                    sort()
                },
                class: "flex items-center gap-1 w-full cursor-pointer",
            },
            [displayLabel, h("span", {}, sorted ? (direction === "asc" ? "▲" : "▼") : "⇅")]
        )
    }

    // ===== TABLE COLUMN DEFINITIONS =====
    const tableColumns: TableColumn<any>[] = [
        {
            accessorKey: "index",
            header: "Index",
            cell: ({ row }) => row.original.index + (currentPage.value - 1) * itemsPerPage,
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => createSortHeader("created_at", "Date", () => sortBy()),
            cell: ({ row }) => convertTimeToPDTAndEDT(row.original.created_at)[timezone.value],
        },
        {
            accessorKey: "generationId",
            header: ({ column }) => createSortHeader("generationId", "Generation Id", () => sortBy()),
            cell: ({ row }) => row.original.generationId,
        },
        {
            accessorKey: "module",
            header: ({ column }) => createSortHeader("module", "Module", () => sortBy()),
            cell: ({ row }) => row.original.module,
        },
        {
            accessorKey: "search_query",
            header: ({ column }) => createSortHeader("search_query", "Search Query", () => sortBy()),
            cell: ({ row }) => row.original.search_query,
        },
        {
            accessorKey: "search_results",
            header: "Search Results",
            cell: ({ row }) => h(SearchResult, { log: row.original }),
        },
        {
            accessorKey: "conversationId",
            header: ({ column }) => createSortHeader("conversationId", "Conversation Id", () => sortBy()),
            cell: ({ row }) => row.original.conversationId,
        },
        {
            accessorKey: "messageId",
            header: ({ column }) => createSortHeader("messageId", "Message Id", () => sortBy()),
            cell: ({ row }) => [row.original.messageId],
        },
        {
            accessorKey: "author",
            header: "Author",
            cell: ({ row }) => [row.original.author.name],
        },
        {
            accessorKey: "text",
            header: ({ column }) => createSortHeader("text", "Text", () => sortBy()),
            cell: ({ row }) => h(Text, { log: row.original }),
        },
        {
            accessorKey: "token_usage",
            header: "Token Usage",
            cell: ({ row }) => h(TokenUsage, { log: row.original }),
        },
        {
            accessorKey: "isRAGCompose",
            header: ({ column }) => createSortHeader("isRAGCompose", "Is RAG Compose", () => sortBy()),
            cell: ({ row }) => (row.original.isRAGCompose ? "true" : "false"),
        },
        {
            accessorKey: "search_results",
            header: "RAG Search",
            cell: ({ row }) => h(SearchResult, { log: row.original }),
        },
        {
            accessorKey: "file_name",
            header: ({ column }) => createSortHeader("file_name", "File Name", () => sortBy()),
            cell: ({ row }) => [row.original.file_name],
        },
        {
            accessorKey: "status",
            header: ({ column }) => createSortHeader("status", "Status", () => sortBy()),
            cell: ({ row }) => [row.original.status],
        },
        {
            accessorKey: "email",
            header: ({ column }) => createSortHeader("email", "User Email", () => sortBy()),
            cell: ({ row }) => [row.original.email],
        },
        {
            accessorKey: "collection_name",
            header: ({ column }) => createSortHeader("collection_name", "Collection Name", () => sortBy()),
            cell: ({ row }) => [row.original.collection_name],
        },
        {
            accessorKey: "promptUpdatedId",
            header: "Prompt Id",
            cell: ({ row }) => row.original.promptUpdatedId,
        },
        {
            accessorKey: "promptId",
            header: "Prompt Id",
            cell: ({ row }) => row.original.promptId,
        },
        {
            accessorKey: "user_input",
            header: "User Input",
            cell: ({ row }) => h(UserInput, { log: row.original }),
        },
        {
            accessorKey: "message",
            header: "Message",
            cell: ({ row }) => row.original.message,
        },
        {
            accessorKey: "updatedPrompt",
            header: "LLM Prompt",
            cell: ({ row }) => h(LLMPrompt, { log: row.original }),
        },
        {
            accessorKey: "LLMResponse",
            header: "LLM Response",
            cell: ({ row }) => h(LLMResponse, { log: row.original, renderMarkdown: renderMarkdown }),
        },
        {
            accessorKey: "url",
            header: "URL",
            cell: ({ row }) => [row.original.url],
        },
        {
            accessorKey: "filePath",
            header: "File Path",
            cell: ({ row }) => [row.original.filePath],
        },
        {
            accessorKey: "type",
            header: "File Type",
            cell: ({ row }) => [row.original.type],
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => [row.original.description],
        },
        {
            accessorKey: "fileHash",
            header: "File Hash",
            cell: ({ row }) => [row.original.fileHash],
        },
        {
            accessorKey: "platform",
            header: "Platform",
            cell: ({ row }) => [row.original.platform],
        },
        {
            accessorKey: "environment",
            header: "Environment",
            cell: ({ row }) => [row.original.environment],
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }) => h(LogActions, { log: row.original, deleteLog }),
        },
    ]

    // ===== EVENT HANDLERS =====
    const handleRowSelect = (row: { toggleSelected: (val: boolean) => void; getIsSelected: () => boolean }, e?: Event) => {
        row.toggleSelected(!row.getIsSelected())
    }

    const updateCurrentPage = (page: number) => {
        currentPage.value = page
    }

    const updatePaginatedData = async () => {
        const data = await initializeLogs(currentPage.value, itemsPerPage)
        paginatedData.value = data
    }

    // ===== DROPDOWN HANDLERS =====
    const getSelectedLogType = () => {
        const selected = logTypeOptions.find((option) => option.value === logType.value)
        return selected ? selected.text : logTypeOptions[0].text
    }

    const updateSelectedLogType = async (selected: { text: string; value: string }) => {
        tableLoading.value = true
        currentPage.value = 1
        sortedColumn.value = "index"
        sortDirection.value = "asc"
        changeLogType(selected.value as "vectorization" | "drafting" | "system_prompt" | "composition" | "vector_search" | "screencapture")
        await updatePaginatedData()
        filterTableColumnsByLogType(tableColumns, logType.value)
        tableLoading.value = false
    }

    const updateSelectedPlatform = async (platform: { text: string; value: string }) => {
        tableLoading.value = true
        selectedPlatform.value = platform.text
        ragStore.platform = platform.value
        currentPage.value = 1
        resetPaginationState()
        const data = await initializeLogs(1, itemsPerPage)
        paginatedData.value = data
        tableLoading.value = false
    }

    const updateSelectedEnvironment = async (environment: { text: string; value: string }) => {
        tableLoading.value = true
        selectedEnvironment.value = environment.text
        ragStore.environment = environment.value
        currentPage.value = 1
        resetPaginationState()
        const data = await initializeLogs(1, itemsPerPage)
        paginatedData.value = data
        tableLoading.value = false
    }

    // ===== UTILITY FUNCTIONS =====
    const renderMarkdown: (markdownContent: string) => string = (markdownContent: string) => {
        return marked.parse(markdownContent) as string
    }

    const filterTableColumnsByLogType = (tableColumns: TableColumn<any>[], logType: string) => {
        const columnVisibility: Record<string, Set<string>> = {
            composition: new Set([
                "index",
                "created_at",
                "conversationId",
                "messageId",
                "author",
                "text",
                "token_usage",
                "isRAGCompose",
                "search_results_composition", // RAG Search
                "platform",
                "environment",
                "actions",
            ]),

            vector_search: new Set([
                "index",
                "created_at",
                "module",
                "search_query",
                "search_results", // Search Results
                "collection_name",
                "platform",
                "environment",
                "actions",
            ]),

            vectorization: new Set(["index", "created_at", "file_name", "status", "email", "collection_name", "message", "platform", "environment", "actions"]),

            drafting: new Set([
                "index",
                "created_at",
                "generationId",
                "promptUpdatedId", // Prompt Id for drafting
                "user_input",
                "LLMResponse",
                "platform",
                "environment",
                "actions",
            ]),

            system_prompt: new Set([
                "index",
                "created_at",
                "promptId", // Prompt Id for system_prompt
                "updatedPrompt", // LLM Prompt
                "platform",
                "environment",
                "actions",
            ]),

            screencapture: new Set(["index", "created_at", "url", "filePath", "type", "description", "fileHash", "platform", "environment", "actions"]),
        }

        const visibleColumns = columnVisibility[logType]

        if (!visibleColumns) {
            console.warn(`Unknown logType: ${logType}. Returning all columns.`)
            return tableColumns
        }

        filteredTableColumns.value = tableColumns.filter((column: any) => {
            return visibleColumns.has(column.accessorKey)
        })
    }

    // ===== EMITS =====
    const emit = defineEmits<{
        (e: "close"): void
        (e: "handle-row-select", row: { toggleSelected: (val: boolean) => void; getIsSelected: () => boolean }, ev?: Event): void
    }>()

    const closeLogs = () => {
        emit("close")
    }

    // ===== LIFECYCLE HOOKS =====
    onMounted(async () => {
        tableLoading.value = true
        const data = await initializeLogs(currentPage.value, itemsPerPage)
        paginatedData.value = data
        sortedRowData.value = data
        filterTableColumnsByLogType(tableColumns, logType.value)
        tableLoading.value = false
    })

    watch(currentPage, async (page) => {
        tableLoading.value = true
        const data = await initializeLogs(page, itemsPerPage)
        paginatedData.value = data
        tableLoading.value = false
    })

    watch(paginatedData, (data) => {
        sortBy()
    })
</script>

<!-- ===== COMPONENT STYLES ===== -->
<style scoped>
    @media (max-width: 768px) {
        .styled-table {
            font-size: 0.65em;
        }

        .styled-table th,
        .styled-table td {
            padding: 0.3rem 0.5rem;
        }
    }
</style>

<style>
    .log-container {
        position: relative;
    }

    .log-container > div {
        height: 100%;
        width: 100%;
    }

    .log-th {
        font-weight: 700 !important;
        border-color: var(--strokeColor) !important;
    }

    .log-td {
        white-space: unset !important;
    }
</style>
