import type { IQueueItem } from "@/types/rag-service"
import eventBus from "~/util/eventBus"
import ragService from "~/services/ragService"
import ragUtilityService from "~/services/ragUtilityService"

export default function useRag() {
    const config = useRuntimeConfig()
    const rag = useRagStore()
    const user = useUserStore()
    const getAllWorkers = async () => {
        try {
            const response: any = await ragService(config).getAllWorkers()
            if (response.code === 200) return response.data
            return []
        } catch (error) {
            console.error(error)
        }
    }
    const getAllQueueItems = async () => {
        try {
            const response: any = await ragService(config).getAllQueueItems()
            if (response.code === 200) {
                const data: IQueueItem[] = response.data
                // sort by queue item
                data.sort((a: IQueueItem, b: IQueueItem) => b.created_at - a.created_at)
                return data
            }
            return []
        } catch (error) {
            console.error(error)
        }
    }
    const ragSearch = async (text: string, is_key_term_match: boolean = false, metadata_key?: string, metadata_value?: string) => {
        const collection: any = rag.collections.find((collection: any) => collection.name === rag.currentCollection)
        if (!collection) return
        const response: any = await ragService(config).vectorSearch(text, collection?.embedding, collection?.name, is_key_term_match, metadata_key, metadata_value)
        if (response.data && response.data.length === 0) {
            eventBus.emit("showToast", {
                message: "No results found",
                _type: "success",
            })
        }
        return response.data
    }
    const ragCompose = async (text: string, collectionName: string) => {
        const template = rag.template_name
        const collection: any = rag.collections.find((collection: any) => collection.name === rag.currentCollection)
        const response: any = await ragService(config).ragCompose(text, collection?.embedding, collectionName, template)
        return response.data
    }
    const addFileToVectorizationQueue = async (file_name: string, file_url: string, file_type: string, file_size: number, collection_name: string, collection_alias: string, priority: string, distance: string, embedding: string, chunk_size: number, chunk_type: string, batch_size: number, documentId: string, page_count: number = 10) => {
        const platform = useAdmin().platform
        const environment = useAdmin().environment
        await useUser().updateDocumentStatus(documentId, "vectorizing")
        const backend_update_url = `${config.public.apiUrl}/api/v1/file/updateStatus/${documentId}`

        const response: any = await ragService(config).addFileToVectorizationQueue(file_name, file_url, file_type, file_size, collection_name, collection_alias, priority, distance, embedding, chunk_size, chunk_type, batch_size, backend_update_url, platform, environment, page_count)
        if (response.code === 200) {
            eventBus.emit("showToast", {
                message: response.message,
                _type: "success",
            })
            return response.data
        } else {
            eventBus.emit("showToast", {
                message: response.message,
                _type: "error",
            })
        }
    }
    const getVectorizationLogs = async (email: string, time_range: string, queue_item_id?: string) => {
        const response: any = await ragService(config).getVectorizationLogs(email, time_range, queue_item_id)
        return response.data
    }
    const deleteQueueItem = async (id: string) => {
        const response: any = await ragService(config).deleteQueueItem(id)
        if (response.code === 200) {
            eventBus.emit("showToast", {
                message: response.message,
                _type: "success",
            })
            return true
        } else {
            eventBus.emit("showToast", {
                message: response.message,
                _type: "error",
            })
            return false
        }
    }
    const getCollectionsForUser = async () => {
        // Prevent duplicate API calls
        if (rag._collectionsLoaded) {
            console.log("[RAG] Collections already loaded, skipping duplicate call")
            return
        }

        try {
            const response: any = await ragService(config).getCollectionsForUser()
            if (response.code === 200) {
                const collections = response.data

                // Convert collections object keys into an array for easier comparison
                const collectionNames = Object.keys(collections)

                // Remove collections that are not part of the response
                rag.collections = rag.collections.filter((existingCollection: any) => collectionNames.includes(existingCollection.name))

                // Add new collections that are not already in rag.collections
                for (let collectionName in collections) {
                    const exists = rag.collections.some((existingCollection: any) => existingCollection.name === collectionName)
                    if (!exists) {
                        rag.collections.push(collections[collectionName])
                    }
                }

                // Mark collections as loaded
                rag._collectionsLoaded = true

                const doesUserDefaultCollectionExist = rag.collections.some((collection: any) => collection.name === user.defaultCollection)
                if (!rag.currentCollection) {
                    if (!doesUserDefaultCollectionExist) {
                        if (rag.collections.length > 0) {
                            rag.currentCollection = rag.collections[0].name
                        } else {
                            rag.currentCollection = "sample_legal"
                        }
                        rag.currentCollection = rag.collections[0].name
                    } else {
                        rag.currentCollection = user.defaultCollection
                    }
                }
            }
            return []
        } catch (error) {
            console.error(error)
        }
    }
    const createCollection = async (collection_name: string, alias: string, distance: string, vector_size: number, embedding: string, service: string) => {
        const response: any = await ragService(config).createCollection(collection_name, alias, distance, vector_size, embedding, service)
        if (response.code === 200) {
            eventBus.emit("showToast", {
                message: response.message,
                _type: "success",
            })
            return true
        } else {
            eventBus.emit("showToast", {
                message: response.message,
                _type: "error",
            })
            return false
        }
    }
    const getAllCollections = async () => {
        try {
            const response: any = await ragService(config).getAllCollections()
            if (response.code === 200) return response.data
            return []
        } catch (error) {
            console.error(error)
        }
    }
    async function updateCollectionAccess(email: string, collection_id: string, type: string, access_level?: string) {
        try {
            if (type === "grant" && access_level) {
                const response: any = await ragService(config).grantCollectionAccess(email, collection_id, access_level)
                eventBus.emit("showToast", {
                    message: response.message,
                    _type: "success",
                })
                return response
            } else {
                const response: any = await ragService(config).revokeCollectionAccess(email, collection_id)
                eventBus.emit("showToast", {
                    message: response.message,
                    _type: "success",
                })
                return response
            }
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
            return false
        }
    }
    const getCollectionData = async (collectionName: string, offset: any = 0, isPrevPage: boolean = false, isSearch: boolean = true, skip?: number) => {
        // Prevent duplicate API calls for initial load (offset 0)
        if (offset === 0 && !skip && rag._collectionDataLoaded && !isSearch) {
            console.log("[RAG] Collection data already loaded, skipping duplicate call")
            return rag.ragData
        }

        try {
            if (!collectionName) return
            rag.isLoading = true
            const response: any = await ragService(config).getCollectionData(collectionName, offset, skip)
            if (response.code === 200) {
                rag.ragData = response.data
                if (rag.ragData.length > 0) {
                    if (isPrevPage) {
                        rag.currentMaxOffset = rag.previousMaxOffset
                        rag.previousMaxOffset = rag.currentMinOffset
                        rag.currentMinOffset = rag.previousMinOffset
                        rag.previousMinOffset = response.data[response.data.length - 1].id
                    } else if (!isSearch) {
                        rag.previousMinOffset = rag.currentMinOffset
                        rag.currentMinOffset = rag.previousMaxOffset
                        rag.previousMaxOffset = response.offset
                        rag.currentMaxOffset = response.offset ?? rag.currentMaxOffset
                    } else {
                        rag.previousMinOffset = rag.currentMinOffset
                        rag.currentMinOffset = rag.previousMaxOffset
                        rag.previousMaxOffset = rag.currentMaxOffset
                        rag.currentMaxOffset = response.offset ?? rag.currentMaxOffset
                    }
                }
                // Mark as loaded for initial load
                if (offset === 0 && !isSearch) {
                    rag._collectionDataLoaded = true
                }
            } else if (response.code === 500) {
                rag.ragData = []
            }
            rag.isLoading = false
            return response.data
        } catch (error) {
            rag.isLoading = false
            console.log(error)
        }
    }
    // Track which collection's point count we have cached
    let _cachedCollectionName = ''

    const getCollectionPointCount = async (collectionName: string) => {
        // Only skip if we already have the count for THIS SPECIFIC collection
        if (rag._collectionPointCountLoaded && _cachedCollectionName === collectionName) {
            console.log("[RAG] Collection point count already loaded for", collectionName)
            return rag.collectionPointCount
        }

        // Reset count for new collection
        if (_cachedCollectionName !== collectionName) {
            rag.collectionPointCount = 0
            rag._collectionPointCountLoaded = false
        }

        try {
            if (!collectionName) return 0
            console.log("[RAG] Fetching point count for collection:", collectionName)
            const response: any = await ragService(config).getCollectionPointCount(collectionName)
            if (response.code === 200) {
                rag.collectionPointCount = response.data
                rag._collectionPointCountLoaded = true
                _cachedCollectionName = collectionName
                console.log("[RAG] Collection point count loaded:", response.data)
            }
            rag.isLoading = false
            return rag.collectionPointCount
        } catch (error) {
            rag.collectionPointCount = 0
            rag.isLoading = false
            return 0
        }
    }
    const deleteCollection = async (collection_name: string) => {
        try {
            const response: any = await ragService(config).deleteCollection(collection_name)
            if (response.code === 200) {
                eventBus.emit("showToast", {
                    message: response.message,
                    _type: "success",
                })
                return true
            } else {
                eventBus.emit("showToast", {
                    message: response.message,
                    _type: "error",
                })
                return false
            }
        } catch (error) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Could not delete collection",
                _type: "error",
            })
            return false
        }
    }

    const getQueueItemsByEmail = async () => {
        try {
            const response: any = await ragService(config).getQueueItemsByEmail()
            if (response.code === 200) {
                return response.data
            }
            return []
        } catch (error) {
            console.error(error)
        }
    }

    const archiveQueueItemsByEmail = async () => {
        try {
            const response: any = await ragService(config).archiveQueueItemsByEmail()
            if (response.code === 200) {
                return response.data
            }
            return []
        } catch (error) {
            console.error(error)
            return []
        }
    }

    const getAllLogs = async (limit: number, exclusiveStartKey?: any) => {
        try {
            const response: any = await ragService(config).getAllLogs(limit, exclusiveStartKey)
            if (response.code === 200) {
                return response
            }
            return []
        } catch (error) {
            console.error(error)
        }
    }
    const getAllPrompts = async () => {
        try {
            const response: any = await ragService(config).getAllPrompts()
            if (response.code === 200) {
                return response.data
            }
            return []
        } catch (error) {
            console.error(error)
        }
    }
    const updatePrompt = async (data: any) => {
        try {
            const response: any = await ragService(config).updatePrompt(data)
            if (response.code === 200) {
                return response.data
            }
            return []
        } catch (error) {
            console.error(error)
        }
    }
    const vectorizeSummaryForUser = async (fileData: any, userId: string, file?: any, embedding?: string, distance?: string, chunk_size?: number) => {
        let collection_name = rag.currentCollection
        let service = rag.currentQdrantInstance
        if (fileData[0]["fileSize"] && fileData[0]["fileSize"] > 1048576) {
            eventBus.emit("showToast", {
                message: "Large files will be vectorized in background",
                _type: "success",
            })
        }
        const response = await ragUtilityService(config).vectorizeSummary(userId, service, file, collection_name, embedding, distance, chunk_size, fileData)
        return response
    }
    const summarizeDocumentForUser = async (pageRange: string, model: string, userId: string, file?: any, embedding?: string, distance?: string, chunk_size?: number, chunkType?: string, callback?: (parsedBatch: string) => void) => {
        let collection_name = rag.currentCollection
        let service = rag.currentQdrantInstance
        const promptData = rag.userInputUnstructuredData.summaryPrompt
        const response = await ragUtilityService(config).summarizeDocumentForUser(pageRange, model, userId, service, promptData, file, collection_name, embedding, distance, chunk_size, chunkType, callback)
        return response
    }
    const storeSummary = async (data: any, organizationId: string, title: string) => {
        try {
            const response: any = await ragUtilityService(config).storeSummary(data, organizationId, title)
            eventBus.emit("showToast", {
                message: response.message,
                _type: "success",
            })
            return
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.message,
                _type: "error",
            })
            return
        }
    }
    const getSummary = async (organizationId: string) => {
        try {
            const summary: any = await ragUtilityService(config).getSummary(organizationId)
            rag.summaries = summary.data
            return summary.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.message,
                _type: "error",
            })
            return
        }
    }
    const deleteSummary = async (summaryId: string, organizationId: string) => {
        try {
            const response: any = await ragUtilityService(config).deleteSummary(summaryId, organizationId)
            eventBus.emit("showToast", {
                message: response.message,
                _type: "success",
            })
            return
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.message,
                _type: "error",
            })
            return
        }
    }
    const getSystemPrompt = async (organizationId: string) => {
        try {
            const response: any = await ragUtilityService(config).getSystemPrompt(organizationId)
            if (response.code === 200) {
                rag.userInputUnstructuredData = { ...rag.userInputUnstructuredData, ...response.data }
            }
            return response
        } catch (error) {
            console.log(error)
            return false
        }
    }
    const updateSystemPrompt = async (promptData: any) => {
        const response: any = await ragUtilityService(config).updateSystemPrompt(promptData)
        if (response.code === 200) {
            eventBus.emit("showToast", {
                message: `Prompt updated successfully`,
                _type: "success",
            })
        }
        return response
    }
    const getSheetsData = async () => {
        const response: any = await ragUtilityService(config).getSheetsIntegration()
        return response.data
    }
    const downloadFile = async (url: string, fileName: string) => {
        try {
            const response: any = await ragUtilityService(config).downloadFile(url, fileName)
            eventBus.emit("showToast", {
                message: `File ${fileName} downloaded successfully`,
                _type: "success",
            })
            return
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.message,
                _type: "error",
            })
            return
        }
    }
    const uploadFileToAzureBlob = async (file: File) => {
        try {
            const collection = rag.currentCollection
            const response = await ragUtilityService(config).uploadFileToAzureBlob(file, collection)
            eventBus.emit("showToast", {
                message: "File uploaded successfully",
                _type: "success",
            })
            return response
        } catch (error) {
            eventBus.emit("showToast", {
                message: "File upload failed",
                _type: "error",
            })
            console.log(error)
        }
    }
    const getRagFilesForUser = async () => {
        const response: any = await ragUtilityService(config).getRagFilesForUser()
        if (response.code === 200) {
            rag.updateRagFiles(response.data)
        }
        return response.data
    }
    const renameFile = async (oldFileName: string, newFileName: string) => {
        newFileName = `${user.userId}/${newFileName}`
        oldFileName = `${user.userId}/${oldFileName}`
        const response = await ragUtilityService(config).renameFileFromAzure(oldFileName, newFileName)
        return response
    }
    const deleteUserFileFromAzure = async (fileName: string) => {
        const response: any = await ragUtilityService(config).deleteFileFromAzure(fileName)
        if (response.code === 200) {
            eventBus.emit("showToast", {
                message: `Files deleted successfully`,
                _type: "success",
            })
        }
        return response
    }
    const saveSearchQuery = async (searchTerm: string, keyInput: string, valueInput: string, collection: string) => {
        const response: any = await ragUtilityService(config).saveSearch(searchTerm, keyInput, valueInput, collection)
        if (response.code === 200) {
            eventBus.emit("showToast", {
                message: `Search fetched successfully`,
                _type: "success",
            })
        }
        return response
    }
    const getSearchQuery = async () => {
        const response: any = await ragUtilityService(config).getSearch()
        return response.data
    }
    const deletePointById = async (pointId: string) => {
        const collection_name = rag.currentCollection
        const response: any = await ragService(config).deletePointById(collection_name, pointId)
        if (response.code === 200) {
            eventBus.emit("showToast", {
                message: "Point deleted successfully",
                _type: "success",
            })
        }
        return response
    }
    const deletePointsByTitle = async (title: string) => {
        const collection_name = rag.currentCollection
        const response: any = await ragService(config).deletePointsByTitle(collection_name, title)
        if (response.code === 200) {
            eventBus.emit("showToast", {
                message: `Points for ${title} deleted successfully`,
                _type: "success",
            })
        }
        return response
    }
    const updateMetadata = async (collection_name: string, data_to_add: any, point_id: string, point_title: string) => {
        const response: any = await ragService(config).updateMetadata(collection_name, data_to_add, point_id, point_title)
        return response
    }

    const getLogs = async (module: string, platform: string, environment: string, lastEvaluatedKey?: string, limit?: number, page?: number) => {
        try {
            const response: any = await ragService(config).getLogs(module, platform, environment, lastEvaluatedKey, limit, page)
            if (response.code === 200) {
                return response
            }
            return []
        } catch (error) {
            console.error(error)
        }
    }
    const deleteLogById = async (log_id: string, log_type: string) => {
        try {
            const response: any = await ragService(config).deleteLogById(log_id, log_type)
            if (response.code === 200) {
                return response
            }
            return []
        } catch (error) {
            console.error(error)
        }
    }

    return {
        getAllWorkers,
        getAllQueueItems,
        ragSearch,
        ragCompose,
        addFileToVectorizationQueue,
        getVectorizationLogs,
        deleteQueueItem,
        getCollectionsForUser,
        createCollection,
        getAllCollections,
        updateCollectionAccess,
        getCollectionData,
        getCollectionPointCount,
        deleteCollection,
        getQueueItemsByEmail,
        getAllLogs,
        getAllPrompts,
        updatePrompt,
        vectorizeSummaryForUser,
        summarizeDocumentForUser,
        storeSummary,
        getSummary,
        deleteSummary,
        getSystemPrompt,
        updateSystemPrompt,
        getSheetsData,
        downloadFile,
        uploadFileToAzureBlob,
        getRagFilesForUser,
        renameFile,
        deleteUserFileFromAzure,
        saveSearchQuery,
        getSearchQuery,
        deletePointById,
        deletePointsByTitle,
        updateMetadata,
        getLogs,
        deleteLogById,
        archiveQueueItemsByEmail,
    }
}
