import axios from "axios"
import cookie from "js-cookie"
import { useUserStore } from "@/store/user"

export default function ragService($config: any) {
    const ragStore = useRagStore()
    const userStore = useUserStore()
    const rag_env = $config.public.ragEnv
    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + cookie.get("mozart"),
        "X-Timezone": userStore.timezone || "",
    }
    const apiClient = axios.create({
        baseURL: $config.public.apiUrl,
        headers,
        withCredentials: true,
    })
    async function vectorizeSummary(userId: string, service: string, file?: any, collection_name?: string, embedding?: string, distance?: string, chunk_size?: number, fileData?: any) {
        ragStore.updateRagDocumentIdStatus("uploading")
        let payload = {
            userId: userId,
            file_name: file,
            url: fileData[0].fileUrl,
            collection_name: collection_name,
            embedding: embedding,
            distance: distance,
            service: service,
            chunk_size: chunk_size,
            summary: fileData,
        }
        try {
            const response = await fetch(`${$config.public.apiUrl}/api/v1/rag/vectorize`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
                credentials: "include",
            })

            if (!response.ok) {
                let err = await response.json()
                ragStore.updateRagDocumentIdStatus("failed")
                return
            }

            const decoder = new TextDecoder("utf-8")
            const reader = response.body?.getReader()

            let done = false
            while (!done) {
                const { value, done: _done }: any = await reader?.read()
                done = _done
                const decoded = decoder.decode(value, { stream: true })
                console.log(decoded, done)
                const data = JSON.parse(decoded)
                ragStore.updateRagDocumentIdStatus(data.message)
            }
            setTimeout(() => {
                ragStore.updateRagDocumentIdStatus("")
                ragStore.updateRagDocumentId("")
            }, 2000)
        } catch (error) {
            console.log("Error vectorizing document:", error)
            setTimeout(() => {
                ragStore.updateRagDocumentIdStatus("")
                ragStore.updateRagDocumentId("")
            }, 2000)
        }
    }
    async function summarizeDocumentForUser(pageRange: string, model: string, userId: string, service: string, promptData: any, file?: any, collection_name?: string, embedding?: string, distance?: string, chunk_size?: number, chunkType?: string, callback?: (parsedBatch: string) => void) {
        let payload = {
            userId: userId,
            file_name: file?.name,
            url: file?.url,
            collection_name: collection_name,
            embedding: embedding,
            distance: distance,
            service: service,
            chunk_size: chunk_size,
            chunk_type: chunkType,
            fileData: file,
            model: model,
            range: pageRange,
            promptData: promptData,
        }

        const summarizeApiUrl = $config.public.apiUrl + `/api/v1/rag/summarize`

        try {
            const response = await fetch(summarizeApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + cookie.get("mozart"),
                    "X-Timezone": userStore.timezone || "",
                },
                body: JSON.stringify(payload),
                credentials: "include",
            })

            if (!response.ok) {
                const errorResponse = await response.json()
                throw new Error("ERROR" + JSON.stringify(errorResponse))
            }

            ragStore.summaryStream = ""

            const reader = response.body?.getReader()
            const decoder = new TextDecoder("utf-8")
            let incompleteLine = ""
            let done = false

            while (!done) {
                const { value, done: readerDone } = await reader?.read()!
                done = readerDone

                if (value) {
                    const chunkText = decoder.decode(value, { stream: true })
                    const fullChunk = incompleteLine + chunkText

                    const lines = fullChunk.split("\n\n\n\n")
                    incompleteLine = lines.pop() || ""

                    lines.forEach((line) => {
                        if (!line.trim()) return

                        try {
                            const outerJson = JSON.parse(line.trim())

                            if (outerJson.message && outerJson.message === "File summarization completed") {
                                if (callback) {
                                    callback(outerJson)
                                }
                                ragStore.summaryStream = ragStore.summaryStream.replace(/,\s*$/, "")
                                done = true
                                ragStore.summaryProcessing = false
                            } else if (outerJson.data && outerJson.data.batch) {
                                let parsedBatch = outerJson.data.batch.trim()
                                ragStore.summaryProcessing = true
                                if (!ragStore.summaryStream || ragStore.summaryStream === "") {
                                    ragStore.summaryStream = parsedBatch
                                } else {
                                    parsedBatch = parsedBatch
                                        .replace(/^\s*```json\s*\[/, "")
                                        .replace(/\]\s*```\s*$/, "")
                                        .trim()
                                    parsedBatch = parsedBatch.replace(/^\[\s*/, "").replace(/\s*\]$/, "")
                                    ragStore.summaryStream = ragStore.summaryStream.replace(/\]\s*```\s*$/, "")
                                    ragStore.summaryStream += ","
                                    ragStore.summaryStream += "\n" + parsedBatch
                                    ragStore.summaryStream += "\n]\n```"
                                }

                                if (callback) {
                                    callback(ragStore.summaryStream)
                                }
                            } else {
                                console.warn("Unexpected response format, skipping:", line)
                            }
                        } catch (error) {
                            console.error("Failed to parse JSON chunk:", error, "Line:", line)
                        }
                    })
                }
            }
            return true
        } catch (error) {
            console.error("Error during fetch or stream processing:", error)
            throw error
        }
    }
    async function storeSummary(data: any, organizationId: string, title: string) {
        let payload = {
            content: data,
            organizationId: organizationId,
            title: title,
        }
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/rag/saveSummary`, JSON.stringify(payload))
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("storeSummary error:", error)
                    reject(error)
                })
        })
    }
    async function getSummary(organizationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/rag/getSummary?organizationId=${organizationId}`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getSummary error:", error)
                    reject(error)
                })
        })
    }
    async function deleteSummary(summaryId: string, organizationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/rag/deleteSummary`, { summaryId, organizationId })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteSummary error:", error)
                    reject(error)
                })
        })
    }
    async function downloadFile(url: string, fileName: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/rag/download`, { url, fileName }, { responseType: "blob" }) // Set responseType to 'blob' for binary data
                .then((response) => {
                    const blob = new Blob([response.data], { type: response.headers["content-type"] })
                    const downloadUrl = window.URL.createObjectURL(blob)

                    const link = document.createElement("a")
                    link.href = downloadUrl
                    link.download = fileName || "download"
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)

                    window.URL.revokeObjectURL(downloadUrl)

                    resolve("File downloaded successfully")
                })
                .catch((error) => {
                    console.error("downloadFile error:", error)
                    reject(error)
                })
        })
    }
    async function uploadFileToAzureBlob(file: File, collection: string) {
        return new Promise((resolve, reject) => {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("collection", collection)
            apiClient
                .post("/api/v1/rag/upload", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("uploadFileToAzureBlob error:", error)
                    reject(error)
                })
        })
    }
    async function getRagFilesForUser() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/rag/getFilesForUser`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getRagFilesForUser error:", error)
                    reject(error)
                })
        })
    }

    async function deleteFileFromAzure(fileName: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/rag/deleteFile`, { fileName })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteFileFromAzure error:", error)
                    reject(error)
                })
        })
    }
    async function renameFileFromAzure(oldFileName: string, newFileName: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/rag/renameFile`, { oldFileName, newFileName })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("renameFileFromAzure error:", error)
                    reject(error)
                })
        })
    }

    async function deleteUserFilesFromAzure() {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/rag/deleteAllFiles`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteUserFilesFromAzure error:", error)
                    reject(error)
                })
        })
    }
    async function updateSearch(searchId: string, searchData: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/rag/updateSearch`, { searchId, searchData })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("updateSearch error:", error)
                    reject(error)
                })
        })
    }
    async function getSheetsIntegration() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/rag/getGoogleSheetsIntegration`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getSheetsIntegration error:", error)
                    reject(error)
                })
        })
    }
    async function getSystemPrompt(organizationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/rag/getSystemPrompt?organizationId=${organizationId}`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getSystemPrompt error:", error)
                    reject(error)
                })
        })
    }
    async function updateSystemPrompt(promptData: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/rag/updateSystemPrompt`, { promptData })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("updateSystemPrompt error:", error)
                    reject(error)
                })
        })
    }
    async function saveSearch(searchTerm: string, keyInput: string, valueInput: string, collection: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/rag/saveSearch`, { searchTerm, keyInput, valueInput, collection })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("saveSearch error:", error)
                    reject(error)
                })
        })
    }
    async function getSearch() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/rag/getSearch`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getSearch error:", error)
                    reject(error)
                })
        })
    }
    return {
        uploadFileToAzureBlob,
        getRagFilesForUser,
        deleteFileFromAzure,
        deleteUserFilesFromAzure,
        renameFileFromAzure,
        updateSearch,
        getSheetsIntegration,
        summarizeDocumentForUser,
        storeSummary,
        getSummary,
        deleteSummary,
        downloadFile,
        vectorizeSummary,
        getSystemPrompt,
        updateSystemPrompt,
        saveSearch,
        getSearch,
    }
}
