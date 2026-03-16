// QueueItem interface
type TStatus = "waiting" | "in_queue" | "downloading" | "processing" | "converting" | "generating_embeddings" | "storing_embeddings_to_database" | "cleanup" | "finished" | "failed" | "downloading_failed" | "processing_failed" | "converting_failed" | "generating_embeddings_failed" | "storing_embeddings_to_database_failed" | "cleanup_failed"

interface IQueueItem {
    id: string
    file_url: string
    file_name: string
    file_type: string
    file_size: number
    email: string
    priority: "low" | "high" | "do_it_now"
    status: TStatus
    timeline: {
        waiting: {
            startAt: number
            failedAt: number
            endAt: number
        }
        in_queue: {
            startAt: number
            failedAt: number
            endAt: number
        }
        downloading: {
            startAt: number
            failedAt: number
            endAt: number
        }
        processing: {
            startAt: number
            failedAt: number
            endAt: number
        }
        converting: {
            startAt: number
            failedAt: number
            endAt: number
        }
        generating_embeddings: {
            startAt: number
            failedAt: number
            endAt: number
        }
        storing_embeddings_to_database: {
            startAt: number
            failedAt: number
            endAt: number
        }
        cleanup: {
            startAt: number
            failedAt: number
            endAt: number
        }
        finished: {
            startAt: number
            failedAt: number
            endAt: number
        }
    }
    worker_id: string
    created_at: number
    updated_at: number
    time_took?: number
    collection_name?: string
    collection_alias?: string
    embedding?: string
    distance?: string
    chunk_size?: number
    chunk_type?: string
    batch_size?: number
    backend_update_url?: string
    isArchive?: boolean
}

// QueueConfigItem interface
interface IQueueConfig {
    id: string
    vectorization: "automatic" | "manual"
    priority_type: "random" | "small_size" | "big_size" | "explicit"
    created_at: number
    updated_At: number
}

// WorkerItem interface
interface IWorkerItem {
    name: string
    id: string
    status: "idle" | "working" | "failed" | "offline"
    state: "active" | "disabled"
    last_ping: number
    created_at: number
    updated_at: number
    gpus: Array<IGPU>
    num_gpus: number
    sqs_url: {
        din: string
        high: string
        low: string
    }
    worker_type: "local" | "cloud"
    average_wait_time: number
    items_in_queue: number
}

interface IGPU {
    cuda_capability_major: number
    cuda_capability_minor: number
    gpu_id: any
    gpu_name: string
    memory_total_mb: number
    multi_processor_count: number
}

interface IApiKey {
    id: string
    pub_key: string
    pvt_key: string
    platform: string
}

interface IWorkerLog {
    log_id: string
    email: string
    file_name: string
    log_level: string
    log_message: string
    queue_item_id: string
    timestamp: number
    worker_id: string
}

// Collection interface
interface ICollection {
    alias: string
    id: string
    name: string
    distance: string
    embedding: string
    owner: string
    created_at: number
    updated_at: number
    number_of_files: number
    service: string
    usersWithAccess: any
}

// Collection Access
interface IUserCollectionAccess {
    id: string
    email_id: string
    collections: ICollectionAccess[]
}

interface ICollectionAccess {
    collection_id: string
    collection_name: string
    email: string
    access_level: "read" | "write"
}

interface ILogCreate {
    data: any
    level: string
    platform: string
    environment: string
    name: string
    module: string
}

export interface QueueTimelineStage {
    endAt: number
    startAt: number
    failedAt: number
}

export interface QueueTimeline {
    cleanup: QueueTimelineStage
    converting: QueueTimelineStage
    downloading: QueueTimelineStage
    finished: QueueTimelineStage
    generating_embeddings: QueueTimelineStage
    in_queue: QueueTimelineStage
    processing: QueueTimelineStage
    storing_embeddings_to_database: QueueTimelineStage
    waiting: QueueTimelineStage
}

interface QueueLogs {
    chunk_size?: number
    created_at: number
    distance: string
    embedding: string
    status: string
    worker_id: string
    file_type: string
    priority: string
    email: string
    batch_size: number
    collection_name: string
    time_took: number
    updated_at: number
    collection_alias: string
    isArchive?: boolean
    backend_update_url: string
    updatedAt?: number
    file_size: number
    chunk_type: string
    file_name: string
    id: string
    file_url: string
    timeline: QueueTimeline
    environment?: string
    platform?: string
}

interface IRagMetadata {
    source: string
    batchedAt: string // stored as ISO string, converted to Date in UI
    username: string
    fileName: string
    [key: string]: any // allow extra metadata fields
}

interface IRagRecord {
    id: string
    title: string
    paragraph: string
    vector?: string
    url: string
    pageNumber: number
    chunkSize: number
    metadata: RagMetadata
}

interface DocumentMetadata {
    source: string
    batchedAt: string
    username: string
    fileName: string
    model: string
    collection: string
    distance: string
    chunk_type: string
}

interface DocumentChunk {
    id: string
    pageNumber: number
    paragraph: string
    title: string
    url: string
    chunkSize: number
    metadata: DocumentMetadata
}

interface RagLogRecord {
    // Common fields
    created_at?: string
    module?: string
    platform?: string
    environment?: string

    // Drafting / composition
    generationId?: string
    conversationId?: string
    messageId?: string
    author?: { name?: string }
    text?: string
    token_usage?: any
    isRAGCompose?: boolean
    user_input?: any
    message?: string
    updatedPrompt?: string
    LLMResponse?: string

    // Vector search
    search_query?: string
    search_results?: any

    // Vectorization
    file_name?: string
    status?: string
    email?: string
    collection_name?: string
    promptUpdatedId?: string
    promptId?: string

    // Screen capture
    url?: string
    filePath?: string
    type?: string
    description?: string
    fileHash?: string

    // Fallback — allows extra keys if backend evolves
    [key: string]: any
}
