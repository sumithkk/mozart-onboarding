import axios from "axios"

export default function ragService($config: any) {
    const userStore = useUserStore()
    const ragAPIUrl = $config.public.ragServiceUrl

    const apiClient = axios.create({
        baseURL: ragAPIUrl,
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
    async function getAllWorkers() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/admin/getAllWorkers`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getAllWorkers error:", error)
                    reject(error)
                })
        })
    }
    async function getAllQueueItems() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/admin/getAllQueueItems`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getAllQueueItems error:", error)
                    reject(error)
                })
        })
    }
    async function getQueueItemsByEmail() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/public/getQueueItemsByEmail`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getQueueItemsByEmail error:", error)
                    reject(error)
                })
        })
    }
    async function archiveQueueItemsByEmail() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/public/archiveQueueItemsByEmail`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("archiveQueueItemsByEmail error:", error)
                    reject(error)
                })
        })
    }
    async function ragCompose(text: string, model_name: string, collection_name: string, template_name: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/public/RAGCompose`, {
                    text,
                    model_name,
                    collection_name,
                    template_name,
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("ragCompose error:", error)
                    reject(error)
                })
        })
    }
    async function vectorSearch(text: string, model_name: string, collection_name: string, is_key_term_match: boolean, metadata_key?: string, metadata_value?: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/public/vectorSearch`, {
                    text,
                    model_name,
                    collection_name,
                    is_key_term_match,
                    metadata_key,
                    metadata_value,
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("vectorSearch error:", error)
                    reject(error)
                })
        })
    }
    async function addFileToVectorizationQueue(file_name: string, file_url: string, file_type: string, file_size: number, collection_name: string, collection_alias: string, priority: string, distance: string, embedding: string, chunk_size: number, chunk_type: string, batch_size: number, backend_update_url: string, platform: string, environment: string, page_count: number = 0) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/admin/newQueueItem`, {
                    file_name,
                    file_url,
                    file_type,
                    file_size,
                    collection_name,
                    collection_alias,
                    priority,
                    distance,
                    embedding,
                    chunk_size,
                    chunk_type,
                    batch_size,
                    backend_update_url,
                    platform,
                    environment,
                    page_count,
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("addFileToVectorizationQueue error:", error)
                    reject(error)
                })
        })
    }
    async function getVectorizationLogs(email: string, time_range: string, queue_item_id?: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/public/getVectorizationLogs`, {
                    email,
                    time_range,
                    queue_item_id,
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getVectorizationLogs error:", error)
                    reject(error)
                })
        })
    }
    async function deleteQueueItem(id: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/admin/deleteQueueItem`, {
                    id,
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteQueueItem error:", error)
                    reject(error)
                })
        })
    }
    async function getCollectionsForUser() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/public/getCollections`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getCollectionsForUser error:", error)
                    reject(error)
                })
        })
    }
    async function createCollection(collection_name: string, alias: string, distance: string, vector_size: number, embedding: string, service: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/public/createCollection`, {
                    collection_name,
                    alias,
                    distance,
                    vector_size,
                    embedding,
                    service,
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("createCollection error:", error)
                    reject(error)
                })
        })
    }
    async function getAllCollections() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/public/getAllCollections`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getAllCollections error:", error)
                    reject(error)
                })
        })
    }
    async function grantCollectionAccess(email: string, collection_id: string, access_level: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/admin/grantCollectionAccess", { email, collection_id, access_level })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("grantCollectionAccess error:", error)
                    reject(error)
                })
        })
    }
    async function revokeCollectionAccess(email: string, collection_id: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/admin/revokeCollectionAccess", { email, collection_id })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("revokeCollectionAccess error:", error)
                    reject(error)
                })
        })
    }
    async function getCollectionData(collection_name: string, offset: string, skip?: number) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/public/getCollectionData`, {
                    collection_name,
                    offset,
                    skip,  // Numeric offset for random page access
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getCollectionData error:", error)
                    reject(error)
                })
        })
    }
    async function getCollectionPointCount(collection_name: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/public/getCollectionPointCount`, {
                    collection_name,
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getCollectionPointCount error:", error)
                    reject(error)
                })
        })
    }
    async function deleteCollection(collection: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/public/deleteCollection`, {
                    collection,
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteCollection error:", error)
                    reject(error)
                })
        })
    }

    async function getAllLogs(limit: number, exclusiveStartKey?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/admin/getAllLogs`, {
                    params: {
                        limit: limit,
                        exclusiveStartKey: JSON.stringify(exclusiveStartKey),
                    },
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getAllLogs error:", error)
                    reject(error)
                })
        })
    }
    async function getAllPrompts() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/public/getAllPrompt`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getAllPrompts error:", error)
                    reject(error)
                })
        })
    }
    async function updatePrompt(data: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/public/updatePrompt`, data)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("updatePrompt error:", error)
                    reject(error)
                })
        })
    }
    async function deletePointById(collection_name: string, pointId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/public/deletePointById`, {
                    collection_name,
                    pointId,
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deletePointById error:", error)
                    reject(error)
                })
        })
    }
    async function deletePointsByTitle(collection_name: string, title: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/public/deletePointByTitle`, {
                    collection_name,
                    title,
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deletePointsByTitle error:", error)
                    reject(error)
                })
        })
    }
    async function updateMetadata(collection_name: string, data_to_add: any, point_id: string, point_title: string) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/api/public/updateMetadata`, {
                collection_name,
                data_to_add,
                point_id,
                point_title,
            })
        })
    }
    async function getLogs(module: string, platform?: string, environment?: string, lastEvaluatedKey?: string, limit: number = 10, page: number = 1) {
        const params: Record<string, any> = {
            platform: platform || "",
            environment: environment || "",
            module,
            limit,
            page,
        }

        // Only include lastEvaluatedKey if it's provided
        if (lastEvaluatedKey) {
            params.lastEvaluatedKey = lastEvaluatedKey
        }

        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/logs/get`, {
                    params,
                    paramsSerializer: (params) => {
                        return Object.entries(params)
                            .filter(([_, value]) => value !== undefined && value !== null && value !== "")
                            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
                            .join("&")
                    },
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getLogs error:", error)
                    reject(error)
                })
        })
    }
    async function deleteLogById(log_id: string, log_type: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .delete(`/api/logs/delete/${log_type}/${log_id}`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteLogById error:", error)
                    reject(error)
                })
        })
    }
    return {
        getAllWorkers,
        getAllQueueItems,
        ragCompose,
        vectorSearch,
        addFileToVectorizationQueue,
        getVectorizationLogs,
        deleteQueueItem,
        getCollectionsForUser,
        createCollection,
        getAllCollections,
        grantCollectionAccess,
        revokeCollectionAccess,
        getCollectionData,
        getCollectionPointCount,
        deleteCollection,
        getQueueItemsByEmail,
        getAllLogs,
        getAllPrompts,
        updatePrompt,
        deletePointById,
        deletePointsByTitle,
        updateMetadata,
        getLogs,
        deleteLogById,
        archiveQueueItemsByEmail,
    }
}
