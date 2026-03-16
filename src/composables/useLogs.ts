import type { any } from "@/types/rag-service"
import { ref, computed, readonly } from "vue"
import { chunkArray } from "~/util"
import eventBus from "~/util/eventBus"

// ===== TYPES =====
type LogType = "vectorization" | "drafting" | "system_prompt" | "composition" | "vector_search" | "screencapture"
type TimezoneType = "PDT" | "EDT"
type SortDirection = "asc" | "desc"

interface SortingCriteria {
    column: string
    direction: SortDirection
}

export interface PaginationState {
    page: number
    totalCount: number
}

interface LogResponse {
    code: number
    data?: Record<string, any>
    pagination: PaginationState & { lastEvaluatedKey?: string }
    lastEvaluatedKey?: string
}

// ===== CONSTANTS =====
const LOG_TYPE_MAPPING: Record<LogType, string> = {
    vectorization: "vectorization",
    drafting: "drafting",
    system_prompt: "system_prompt",
    composition: "composition",
    vector_search: "vector_search",
    screencapture: "screencapture",
} as const

const DEFAULT_PAGINATION: PaginationState = { page: 1, totalCount: 0 }
const CHUNK_SIZE = 10

// ===== MAIN COMPOSABLE =====
export function useLogs() {
    // ===== REACTIVE STATE =====
    const logs = ref<any[]>([])
    const chunkedLogs = ref<any[][]>([])
    const pagination = ref<PaginationState>(DEFAULT_PAGINATION)
    const lastEvaluatedKey = ref<string | undefined>(undefined)
    const currentLogsPage = ref<number>(1)
    const logType = ref<LogType>("vectorization")
    const timezone = ref<TimezoneType>("EDT")
    const selectedLogs = ref<string[]>([])
    const sortingCriteria = ref<SortingCriteria[]>([])

    // ===== LOADING STATES =====
    const isDeleting = ref<boolean>(false)
    const isLoading = ref<boolean>(false)
    const hasNoMoreData = ref<boolean>(false)

    // ===== COMPUTED PROPERTIES =====
    const apiLogType = computed(() => LOG_TYPE_MAPPING[logType.value])

    const readonlyLogs = readonly(logs)
    const readonlyPagination = readonly(pagination)

    // ===== STORES =====
    const rag = useRag()
    const ragStore = useRagStore()

    // ===== UTILITY FUNCTIONS =====
    const transformLogData = (log: any, index: number): any => ({
        ...(log.data || {}),
        index: index + 1,
        logId: log.id,
        platform: log.platform,
        environment: log.environment,
        module: log.module,
        created_at: log.created_at,
        user_email: log.user_id,
    })

    const updatePaginationState = (response: LogResponse): void => {
        pagination.value = response.pagination
    }

    const checkEndOfData = (page: number, limit: number, totalCount?: number): void => {
        if (totalCount != null) {
            const reachedEnd = page * limit >= totalCount
            hasNoMoreData.value = reachedEnd
        }
    }

    // ===== SORTING FUNCTIONS =====
    const sortLogs = (a: any, b: any): number => {
        for (const { column, direction } of sortingCriteria.value) {
            const aValue = a[column as keyof any]
            const bValue = b[column as keyof any]

            if (aValue < bValue) return direction === "asc" ? -1 : 1
            if (aValue > bValue) return direction === "asc" ? 1 : -1
        }
        return 0
    }

    const applySorting = (): void => {
        logs.value.sort(sortLogs)
        updateChunkedLogs()
    }

    const toggleSorting = (column: string): void => {
        const existingCriteria = sortingCriteria.value.find((c) => c.column === column)

        if (existingCriteria) {
            existingCriteria.direction = existingCriteria.direction === "asc" ? "desc" : "asc"
        } else {
            sortingCriteria.value.push({ column, direction: "asc" })
        }

        applySorting()
    }

    const updateChunkedLogs = (): void => {
        // Sort by creation date
        logs.value.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

        chunkedLogs.value = chunkArray(logs.value, CHUNK_SIZE)

        // Calculate indices for each chunk
        chunkedLogs.value.forEach((chunk, chunkIndex) => {
            chunk.forEach((log, logIndex) => {
                log.index = chunkIndex * CHUNK_SIZE + logIndex + 1
            })
        })
    }

    // ===== API FUNCTIONS =====
    const fetchLogsFromAPI = async (page: number, limit: number): Promise<any[]> => {
        const { platform, environment } = ragStore

        const response = await rag.getLogs(apiLogType.value, platform, environment, lastEvaluatedKey.value, limit, page)

        if (response.code !== 200) {
            console.error(`Failed to fetch logs: ${response.code}`)
            // Reset pagination/cursor when no data or error
            lastEvaluatedKey.value = undefined
            pagination.value = { page: 1, totalCount: 0 }
            hasNoMoreData.value = true
            return []
        }

        const transformedLogs = Object.values(response.data || {}).map(transformLogData)

        updatePaginationState(response)
        checkEndOfData(page, limit, response.pagination?.totalCount)

        return transformedLogs
    }

    const fetchMoreLogs = async (page: number = 1, limit: number = 5): Promise<any[]> => {
        try {
            isLoading.value = true
            return await fetchLogsFromAPI(page, limit)
        } catch (error) {
            console.error("Error fetching logs:", error)
            return []
            // throw error
        } finally {
            isLoading.value = false
        }
    }

    const initializeLogs = async (page: number = 1, limit: number = 5): Promise<any[]> => {
        try {
            return await fetchMoreLogs(page, limit)
        } catch (error) {
            console.error("Error initializing logs:", error)
            return []
        }
    }

    const loadMoreLogs = async (page: number = 1, limit: number = 5): Promise<any[]> => {
        try {
            isLoading.value = true
            return await fetchLogsFromAPI(page, limit)
        } catch (error) {
            console.error("Error loading more logs:", error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    // ===== DELETE FUNCTIONS =====
    const deleteLogById = async (logId: string): Promise<void> => {
        await rag.deleteLogById(logId, apiLogType.value)
        logs.value = logs.value.filter((log) => log.logId !== logId)
        applySorting()
    }

    const deleteLog = async (logId: string): Promise<void> => {
        try {
            isDeleting.value = true
            await deleteLogById(logId)
            eventBus.emit("showToast", {
                _type: "success",
                message: "Deleted the log.",
            })
        } catch (error) {
            console.error("Error deleting log:", error)
            eventBus.emit("showToast", {
                _type: "error",
                message: "Unable to delete the log.",
            })
        } finally {
            isDeleting.value = false
        }
    }

    const deleteSelectedLogs = async (): Promise<void> => {
        try {
            isDeleting.value = true

            await Promise.all(selectedLogs.value.map((logId) => deleteLogById(logId)))

            selectedLogs.value = []
            applySorting()

            eventBus.emit("showToast", {
                _type: "success",
                message: "Deleted the selected logs.",
            })
        } catch (error) {
            console.error("Error deleting selected logs:", error)
            eventBus.emit("showToast", {
                _type: "error",
                message: "Unable to delete selected logs.",
            })
        } finally {
            isDeleting.value = false
        }
    }

    // ===== SELECTION FUNCTIONS =====
    const toggleLogSelection = (logId: string, selected: boolean): void => {
        if (selected) {
            selectedLogs.value.push(logId)
        } else {
            selectedLogs.value = selectedLogs.value.filter((id) => id !== logId)
        }
    }

    const clearSelection = (): void => {
        selectedLogs.value = []
    }

    const selectAll = (): void => {
        selectedLogs.value = logs.value.map((log) => log.logId)
    }

    const isLogSelected = (logId: string): boolean => {
        return selectedLogs.value.includes(logId)
    }

    // ===== STATE MANAGEMENT FUNCTIONS =====
    const changeTimezone = (): void => {
        timezone.value = timezone.value === "EDT" ? "PDT" : "EDT"
    }

    const changeLogType = (type: LogType): void => {
        logType.value = type
        resetPaginationState()
    }

    const resetPaginationState = (): void => {
        lastEvaluatedKey.value = undefined
        pagination.value = { ...DEFAULT_PAGINATION }
        hasNoMoreData.value = false
        logs.value = []
        selectedLogs.value = []
    }

    // ===== COMPUTED GETTERS =====
    const hasSelectedLogs = computed(() => selectedLogs.value.length > 0)
    const selectedLogsCount = computed(() => selectedLogs.value.length)
    const totalLogsCount = computed(() => pagination.value.totalCount)

    // ===== RETURN API =====
    return {
        // State (readonly where appropriate)
        logs: readonlyLogs,
        chunkedLogs: readonly(chunkedLogs),
        pagination: readonlyPagination,
        currentLogsPage: readonly(currentLogsPage),
        logType: readonly(logType),
        timezone: readonly(timezone),
        selectedLogs: readonly(selectedLogs),
        sortingCriteria: readonly(sortingCriteria),

        // Loading states
        isDeleting: readonly(isDeleting),
        isLoading: readonly(isLoading),
        hasNoMoreData: readonly(hasNoMoreData),

        // Computed properties
        hasSelectedLogs,
        selectedLogsCount,
        totalLogsCount,

        // Core functions
        initializeLogs,
        loadMoreLogs,

        // Delete functions
        deleteLog,
        deleteSelectedLogs,

        // Selection functions
        toggleLogSelection,
        clearSelection,
        selectAll,
        isLogSelected,

        // State management
        changeTimezone,
        changeLogType,
        toggleSorting,
        resetPaginationState,
    }
}
