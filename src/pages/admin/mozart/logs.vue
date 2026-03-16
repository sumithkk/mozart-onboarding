<template>
    <div class="page-wrapper absolute inset-4 flex flex-col overflow-hidden rounded-[10px] p-5 text-[0.7em] md:left-12 md:right-12">
        <!-- Header -->
        <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 class="text-textColor text-2xl font-bold">Completion Logs</h1>
            <div class="flex items-center gap-2">
                <ExportDropdown :isExporting="isExporting" @export="handleExport" />
            </div>
        </div>

        <!-- Filters -->
        <div class="border-border bg-card mb-6 rounded-lg border p-4">
            <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                <DropdownV2 label="Environment" :currentlySelected="selectedEnvironment" :items="environmentOptions" @update:selected="onEnvironmentChange" />

                <DropdownV2 label="Status" :currentlySelected="selectedStatus" :items="statusOptions" @update:selected="onStatusChange" />

                <DropdownV2 label="Provider" :currentlySelected="selectedProvider" :items="providerOptions" @update:selected="onProviderChange" />

                <DropdownV2 label="MCP" :currentlySelected="selectedMcp" :items="mcpOptions" @update:selected="onMcpChange" />

                <div class="col-span-2 flex items-center gap-2 md:col-span-1">
                    <input v-model="modelNameInput" type="text" placeholder="Model name..." class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm" @keyup.enter="applyFilters" />
                </div>

                <div class="flex items-center gap-2">
                    <input v-model="userIdInput" type="text" placeholder="User ID..." class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm" @keyup.enter="applyFilters" />
                </div>

                <div class="flex items-center gap-2">
                    <input v-model="fromDate" type="date" class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm" placeholder="From date" />
                </div>

                <div class="flex items-center gap-2">
                    <input v-model="toDate" type="date" class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm" placeholder="To date" />
                </div>

                <div class="flex items-center gap-2">
                    <button @click="applyFilters" class="bg-logoColor hover:bg-logoColor/90 cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white">Apply</button>
                    <button @click="resetAllFilters" class="bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer rounded-lg px-4 py-2 text-sm font-medium">Reset</button>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div v-if="!isLoading && logs.length > 0" class="min-h-0 flex-1 overflow-auto">
            <div class="border-border rounded-lg border">
                <table class="w-full">
                    <thead class="bg-tableBgHeader sticky top-0">
                        <tr>
                            <th class="text-foreground px-4 py-3 text-left text-xs font-semibold">Status</th>
                            <th class="text-foreground px-4 py-3 text-left text-xs font-semibold">Environment</th>
                            <th class="text-foreground px-4 py-3 text-left text-xs font-semibold">Model</th>
                            <th class="text-foreground px-4 py-3 text-left text-xs font-semibold">Provider</th>
                            <th class="text-foreground px-4 py-3 text-left text-xs font-semibold">MCP</th>
                            <th class="text-foreground px-4 py-3 text-left text-xs font-semibold">Documents</th>
                            <th class="text-foreground px-4 py-3 text-left text-xs font-semibold">Prompt Tokens</th>
                            <th class="text-foreground px-4 py-3 text-left text-xs font-semibold">Response Tokens</th>
                            <th class="text-foreground px-4 py-3 text-left text-xs font-semibold">Created At</th>
                            <th class="text-foreground px-4 py-3 text-left text-xs font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="log in logs" :key="log.id" class="border-border hover:bg-secondary/50 border-t">
                            <td class="px-4 py-3">
                                <StatusBadge :status="log.status" />
                            </td>
                            <td class="px-4 py-3">
                                <EnvironmentBadge :environment="log.environment" />
                            </td>
                            <td class="text-foreground px-4 py-3 text-sm">{{ log.model.name }}</td>
                            <td class="text-foreground px-4 py-3 text-sm">{{ log.model.provider }}</td>
                            <td class="px-4 py-3">
                                <McpBadge :mcp="log.mcp" />
                            </td>
                            <td class="text-foreground px-4 py-3 text-sm">{{ log.documents?.length ?? 0 }}</td>
                            <td class="text-foreground px-4 py-3 text-sm">{{ log.token_usage.prompt_tokens.toLocaleString() }}</td>
                            <td class="text-foreground px-4 py-3 text-sm">{{ log.token_usage.response_tokens.toLocaleString() }}</td>
                            <td class="text-muted-foreground px-4 py-3 text-sm">{{ formatDate(log.created_at) }}</td>
                            <td class="px-4 py-3">
                                <button @click="viewLogDetails(log)" class="text-logoColor hover:text-logoColor/80 cursor-pointer text-sm font-medium">View</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Pagination - Outside scrollable area -->
        <div v-if="!isLoading && logs.length > 0" class="flex-shrink-0 pt-4">
            <div class="flex items-center justify-between px-2">
                <div class="text-muted-foreground text-sm">
                    Showing {{ (pagination.page_no - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page_no * pagination.limit, pagination.total_count) }} of {{ pagination.total_count }} results
                </div>
                <div class="flex items-center gap-2">
                    <button @click="goToPage(pagination.page_no - 1)" :disabled="pagination.page_no <= 1" class="bg-secondary hover:bg-secondary/80 text-foreground disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer rounded-lg px-3 py-1.5 text-sm">Prev</button>
                    <span class="text-foreground text-sm">Page {{ pagination.page_no }} of {{ pagination.total_pages }}</span>
                    <button @click="goToPage(pagination.page_no + 1)" :disabled="pagination.page_no >= pagination.total_pages" class="bg-secondary hover:bg-secondary/80 text-foreground disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer rounded-lg px-3 py-1.5 text-sm">Next</button>
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div v-if="!isLoading && logs.length === 0" class="text-muted-foreground flex flex-1 items-center justify-center py-16 text-sm">No completion logs found</div>

        <TableLoadingState v-if="isLoading" customTitle="Loading Completion Logs" />

        <!-- Detail Modal -->
        <LogDetailModal v-if="selectedLog" :log="selectedLog" @close="selectedLog = null" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useCompletionLogs } from "~/composables/useCompletionLogs"
import type { CompletionLog } from "~/services/completionLogsService"
import StatusBadge from "~/components/admin/completionLogs/StatusBadge.vue"
import EnvironmentBadge from "~/components/admin/completionLogs/EnvironmentBadge.vue"
import McpBadge from "~/components/admin/completionLogs/McpBadge.vue"
import ExportDropdown from "~/components/admin/completionLogs/ExportDropdown.vue"
import LogDetailModal from "~/components/admin/completionLogs/LogDetailModal.vue"

definePageMeta({
    layout: "mozart-rag-service-admin",
    middleware: ["auth"],
})

const { logs, isLoading, isExporting, pagination, filters, fetchLogs, exportLogs, updateFilters, resetFilters } = useCompletionLogs()

// Filter state
const selectedEnvironment = ref("All")
const selectedStatus = ref("All")
const selectedProvider = ref("All")
const selectedMcp = ref("All")
const modelNameInput = ref("")
const userIdInput = ref("")
const fromDate = ref("")
const toDate = ref("")

// Selected log for detail view
const selectedLog = ref<CompletionLog | null>(null)

// Filter options
const environmentOptions = [
    { text: "All", value: "" },
    { text: "Development", value: "development" },
    { text: "Staging", value: "staging" },
    { text: "Production", value: "production" },
]

const statusOptions = [
    { text: "All", value: "" },
    { text: "Success", value: "success" },
    { text: "Error", value: "error" },
    { text: "Aborted", value: "aborted" },
]

const providerOptions = [
    { text: "All", value: "" },
    { text: "OpenAI", value: "OpenAI" },
    { text: "Claude", value: "Claude" },
    { text: "Gemini", value: "Gemini" },
]

const mcpOptions = [
    { text: "All", value: "" },
    { text: "Enabled", value: "true" },
    { text: "Disabled", value: "false" },
]

// Handlers
function onEnvironmentChange(item: { text: string; value: string }) {
    selectedEnvironment.value = item.text
    updateFilters({ environment: item.value as any || undefined })
}

function onStatusChange(item: { text: string; value: string }) {
    selectedStatus.value = item.text
    updateFilters({ status: item.value as any || undefined })
}

function onProviderChange(item: { text: string; value: string }) {
    selectedProvider.value = item.text
    updateFilters({ model_provider: item.value || undefined })
}

function onMcpChange(item: { text: string; value: string }) {
    selectedMcp.value = item.text
    updateFilters({ mcp_enabled: item.value ? item.value === "true" : undefined })
}

function applyFilters() {
    updateFilters({
        model_name: modelNameInput.value || undefined,
        user_id: userIdInput.value || undefined,
        from: fromDate.value ? new Date(fromDate.value).toISOString() : undefined,
        to: toDate.value ? new Date(toDate.value).toISOString() : undefined,
    })
    fetchLogs(1)
}

function resetAllFilters() {
    selectedEnvironment.value = "All"
    selectedStatus.value = "All"
    selectedProvider.value = "All"
    selectedMcp.value = "All"
    modelNameInput.value = ""
    userIdInput.value = ""
    fromDate.value = ""
    toDate.value = ""
    resetFilters()
    fetchLogs(1)
}

function goToPage(page: number) {
    if (page >= 1 && page <= pagination.value.total_pages) {
        fetchLogs(page)
    }
}

function handleExport(format: "json" | "csv" | "xlsx") {
    exportLogs(format)
}

function viewLogDetails(log: CompletionLog) {
    selectedLog.value = log
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const day = String(date.getUTCDate()).padStart(2, "0")
    const hours = String(date.getUTCHours()).padStart(2, "0")
    const minutes = String(date.getUTCMinutes()).padStart(2, "0")
    return `${year}-${month}-${day} ${hours}:${minutes}`
}

onMounted(() => {
    fetchLogs(1)
})
</script>
