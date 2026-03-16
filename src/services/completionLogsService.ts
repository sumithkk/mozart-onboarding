import axios from "axios"

export interface CompletionLogFilters {
    environment?: "development" | "staging" | "production"
    user_id?: string
    organization_id?: string
    from?: string
    to?: string
    status?: "success" | "error" | "aborted"
    model_name?: string
    model_provider?: string
    mcp_enabled?: boolean
    document_contains?: string
    page_no?: number
    limit?: number
}

export interface CompletionLog {
    id: string
    environment: string
    status: string
    request_id: string
    conversation_id: string
    message_id: string
    user_id: string
    organization_id: string
    created_at: string
    prompt: {
        text: string
        truncated: boolean
        content_type: string
        original_length: number
    }
    model: {
        name: string
        provider: string
        system_prompt: string
        writing_style: string
        is_thinking_supported: boolean
    }
    response: {
        text: string
        thinking?: {
            text: string
            is_finished: boolean
        }
    }
    token_usage: {
        total_tokens: number
        prompt_tokens: number
        response_tokens: number
    }
    mcp: {
        enabled: boolean
        tool_calls: any[]
        tool_choice: string
    }
    documents: any[]
    rag: {
        enabled: boolean
        collection: string | null
    }
}

export interface CompletionLogsResponse {
    success: boolean
    data: {
        logs: CompletionLog[]
        pagination: {
            page_no: number
            limit: number
            total_count: number
            total_pages: number
        }
    }
}

export default function completionLogsService($config: any) {
    const userStore = useUserStore()
    const apiClient = axios.create({
        baseURL: $config.public.ragServiceUrl,
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
    })

    // Use interceptor to dynamically add auth token on each request
    apiClient.interceptors.request.use((config) => {
        config.headers.Authorization = `Bearer ${userStore.ragToken}`
        config.headers["X-Timezone"] = userStore.timezone || ""
        return config
    })

    async function getLogs(filters: CompletionLogFilters = {}): Promise<CompletionLogsResponse> {
        const params = new URLSearchParams()

        if (filters.environment) params.append("environment", filters.environment)
        if (filters.user_id) params.append("user_id", filters.user_id)
        if (filters.organization_id) params.append("organization_id", filters.organization_id)
        if (filters.from) params.append("from", filters.from)
        if (filters.to) params.append("to", filters.to)
        if (filters.status) params.append("status", filters.status)
        if (filters.model_name) params.append("model_name", filters.model_name)
        if (filters.model_provider) params.append("model_provider", filters.model_provider)
        if (filters.mcp_enabled !== undefined) params.append("mcp_enabled", String(filters.mcp_enabled))
        if (filters.document_contains) params.append("document_contains", filters.document_contains)
        if (filters.page_no) params.append("page_no", String(filters.page_no))
        if (filters.limit) params.append("limit", String(filters.limit))

        const response = await apiClient.get(`/api/logs/get?${params.toString()}`)
        return response.data
    }

    async function exportLogs(format: "json" | "csv" | "xlsx", filters: CompletionLogFilters = {}): Promise<Blob | any> {
        const params = new URLSearchParams()
        params.append("format", format)

        if (filters.environment) params.append("environment", filters.environment)
        if (filters.user_id) params.append("user_id", filters.user_id)
        if (filters.organization_id) params.append("organization_id", filters.organization_id)
        if (filters.from) params.append("from", filters.from)
        if (filters.to) params.append("to", filters.to)
        if (filters.status) params.append("status", filters.status)
        if (filters.model_name) params.append("model_name", filters.model_name)
        if (filters.model_provider) params.append("model_provider", filters.model_provider)
        if (filters.mcp_enabled !== undefined) params.append("mcp_enabled", String(filters.mcp_enabled))
        if (filters.document_contains) params.append("document_contains", filters.document_contains)

        const responseType = format === "json" ? "json" : "blob"
        const response = await apiClient.get(`/api/logs/export?${params.toString()}`, { responseType })
        return response.data
    }

    return {
        getLogs,
        exportLogs,
    }
}
