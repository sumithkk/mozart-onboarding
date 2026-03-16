import { ref } from "vue"
import completionLogsService, { type CompletionLogFilters, type CompletionLog, type CompletionLogsResponse } from "~/services/completionLogsService"
import eventBus from "~/util/eventBus"

export function useCompletionLogs() {
    const config = useRuntimeConfig()
    const userStore = useUserStore()

    const logs = ref<CompletionLog[]>([])
    const isLoading = ref(false)
    const isExporting = ref(false)
    const pagination = ref({
        page_no: 1,
        limit: 20,
        total_count: 0,
        total_pages: 0,
    })

    const filters = ref<CompletionLogFilters>({
        environment: undefined,
        status: undefined,
        model_name: undefined,
        model_provider: undefined,
        user_id: undefined,
        organization_id: undefined,
        from: undefined,
        to: undefined,
        mcp_enabled: undefined,
        document_contains: undefined,
    })

    async function fetchLogs(page: number = 1) {
        try {
            isLoading.value = true

            // Ensure RAG token is loaded before making API call
            if (!userStore.ragToken) {
                await userStore.loadRagToken()
            }

            const response = await completionLogsService(config).getLogs({
                ...filters.value,
                page_no: page,
                limit: pagination.value.limit,
            })

            if (response.success && response.data) {
                logs.value = response.data.logs
                pagination.value = response.data.pagination
            } else if (response.data?.logs) {
                // Handle case where API returns data without success field
                logs.value = response.data.logs
                pagination.value = response.data.pagination
            }
        } catch (error: any) {
            console.error("Error fetching completion logs:", error)
            if (error.response?.status !== 404) {
                eventBus.emit("showToast", {
                    _type: "error",
                    message: "Failed to fetch logs",
                })
            }
            logs.value = []
            pagination.value = { page_no: 1, limit: 20, total_count: 0, total_pages: 0 }
        } finally {
            isLoading.value = false
        }
    }

    async function exportLogs(format: "json" | "csv" | "xlsx") {
        try {
            isExporting.value = true

            // Ensure RAG token is loaded before making API call
            if (!userStore.ragToken) {
                await userStore.loadRagToken()
            }

            const data = await completionLogsService(config).exportLogs(format, filters.value)

            if (format === "json") {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
                downloadBlob(blob, `completion_logs_${Date.now()}.json`)
            } else {
                downloadBlob(data, `completion_logs_${Date.now()}.${format}`)
            }

            eventBus.emit("showToast", {
                _type: "success",
                message: `Logs exported as ${format.toUpperCase()}`,
            })
        } catch (error) {
            console.error("Error exporting logs:", error)
            eventBus.emit("showToast", {
                _type: "error",
                message: "Failed to export logs",
            })
        } finally {
            isExporting.value = false
        }
    }

    function downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    function updateFilters(newFilters: Partial<CompletionLogFilters>) {
        filters.value = { ...filters.value, ...newFilters }
    }

    function resetFilters() {
        filters.value = {
            environment: undefined,
            status: undefined,
            model_name: undefined,
            model_provider: undefined,
            user_id: undefined,
            organization_id: undefined,
            from: undefined,
            to: undefined,
            mcp_enabled: undefined,
            document_contains: undefined,
        }
    }

    return {
        logs,
        isLoading,
        isExporting,
        pagination,
        filters,
        fetchLogs,
        exportLogs,
        updateFilters,
        resetFilters,
    }
}
