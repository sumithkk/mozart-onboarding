import axios from "axios"
import cookie from "js-cookie"
import { useUserStore } from "@/store/user"
import type { INote } from "@/types/store"

export default function userService($config: any) {
    const userStore = useUserStore()
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

    async function uploadFile(file: File, organizationId: string) {
        return new Promise((resolve, reject) => {
            const formData = new FormData()
            formData.append("organizationId", organizationId)
            formData.append("file", file)
            apiClient
                .post("/api/v1/document/upload", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("uploadFile error:", error)
                    reject(error)
                })
        })
    }
    async function getDocumentsList(organizationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .get("/api/v1/document/get?organizationId=" + organizationId)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getDocumentsList error:", error)
                    reject(error)
                })
        })
    }
    async function getDocumentParsedData(documentId: string, organizationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/document/getParsedData`, { documentId, organizationId })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getDocumentParsedData error:", error)
                    reject(error)
                })
        })
    }
    async function updateDocument(data: any, organizationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/document/update`, { ...data, organizationId })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("updateDocument error:", error)
                    reject(error)
                })
        })
    }
    async function getNotes(organizationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/note/get?organizationId=${organizationId}`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getNotes error:", error)
                    reject(error)
                })
        })
    }
    async function createNote(data: INote, organizationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/note/create`, { ...data, organizationId })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("createNote error:", error)
                    reject(error)
                })
        })
    }
    async function updateNote(data: any, organizationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/note/update`, { ...data, organizationId })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("updateNote error:", error)
                    reject(error)
                })
        })
    }
    async function deleteNote(noteId: string, organizationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/note/delete`, { noteId, organizationId })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteNote error:", error)
                    reject(error)
                })
        })
    }
    async function deleteDocument(documentId: string, organizationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/document/delete`, { documentId, organizationId })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteDocument error:", error)
                    reject(error)
                })
        })
    }
    async function getOAuthUrl() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/auth/google`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getOAuthUrl error:", error)
                    reject(error)
                })
        })
    }
    async function getOAuthToken(code: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/auth/oauthCallback`, { code })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getOAuthToken error:", error)
                    reject(error)
                })
        })
    }
    async function getGoogleDriveFiles(params?: any) {
        return new Promise((resolve, reject) => {
            const queryParams = new URLSearchParams()
            if (params?.folderId) queryParams.append("folderId", params.folderId)
            if (params?.search) queryParams.append("search", params.search)
            if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder)
            if (params?.pageToken) queryParams.append("pageToken", params.pageToken)
            if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString())

            const url = `/api/v1/user/googleDrive/files${queryParams.toString() ? "?" + queryParams.toString() : ""}`
            apiClient
                .get(url)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getGoogleDriveFiles error:", error)
                    reject(error)
                })
        })
    }

    // ---------------------- RAG Token ----------------------
    async function getRagToken() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/rag/token`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getRagToken error:", error)
                    reject(error)
                })
        })
    }

    // ---------------------- User Settings (v1) ----------------------
    async function getUserSettings() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/user/settings`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getUserSettings error:", error)
                    reject(error)
                })
        })
    }

    async function updateUserSettings(data: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .put(`/api/v1/user/settings`, data)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("updateUserSettings error:", error)
                    reject(error)
                })
        })
    }

    // New Prompt Endpoints
    async function createPrompt(data: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/prompt/create", data)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("createPrompt error:", error)
                    reject(error)
                })
        })
    }

    async function updatePrompt(data: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/prompt/update`, data)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("updatePrompt error:", error)
                    reject(error)
                })
        })
    }

    async function getPrompts() {
        return new Promise((resolve, reject) => {
            apiClient
                .get("/api/v1/prompt/get")
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getPrompts error:", error)
                    reject(error)
                })
        })
    }

    async function getPromptByKey(key: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/prompt/getByKey", { key })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getPromptByKey error:", error)
                    reject(error)
                })
        })
    }
    async function addAPIKey(payload: any, service?: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/user/addAPIKey", payload)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("addAPIKey error:", error)
                    reject(error)
                })
        })
    }
    async function deleteAPIKey(apiKey: string, service: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/user/apiKeys/delete", { service })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteAPIKey error:", error)
                    reject(error)
                })
        })
    }
    async function getAPIKeys() {
        return new Promise((resolve, reject) => {
            apiClient
                .get("/api/v1/user/apiKeys")
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getAPIKeys error:", error)
                    reject(error)
                })
        })
    }
    async function getIntegrations() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/user/integration-services`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getIntegrations error:", error)
                    reject(error)
                })
        })
    }
    async function deleteUserIntegration(service: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/user/apiKeys/delete`, { service })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteUserIntegration error:", error)
                    reject(error)
                })
        })
    }
    async function validateIntegration(payload: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/user/apiKeys/validate-save`, payload)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("validateIntegration error:", error)
                    reject(error)
                })
        })
    }
    async function getSourceFileParsedData(source: string, documentId: string, fileName: string, fileUrl: string, fileType: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/document/getSourceFileParsedData`, { source, documentId, fileName, fileUrl, fileType })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getSourceFileParsedData error:", error)
                    reject(error)
                })
        })
    }

    async function getSourceFileParsedDataFromIntegrationFiles(documentId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/file/getIntegrationFile?documentId=${documentId}`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getSourceFileParsedDataFromIntegrationFiles error:", error)
                    reject(error)
                })
        })
    }
    async function getGCRLogs(pageToken: string | null = null, pageSize: number = 10) {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/admin/getGCRLogs?pageToken=${pageToken}&pageSize=${pageSize}`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getGCRLogs error:", error)
                    reject(error)
                })
        })
    }
    async function updateDocumentStatus(documentId: string, status: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/document/updateStatus/${documentId}`, { status })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("updateDocumentStatus error:", error)
                    reject(error)
                })
        })
    }
    async function addIntegrationFiles(source: string, files: any[]) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/integrations/addFiles`, { source, files })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("addIntegrationFiles error:", error)
                    reject(error)
                })
        })
    }
    async function deleteIntegrationFile(fileId: string, source: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/integrations/deleteFile`, { fileId, source })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteIntegrationFile error:", error)
                    reject(error)
                })
        })
    }
    async function getUserModels(userId?: string) {
        return new Promise((resolve, reject) => {
            const url = userId ? `/api/v1/user/models?userId=${userId}` : `/api/v1/user/models`
            apiClient
                .get(url)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getUserModels error:", error)
                    reject(error)
                })
        })
    }

    async function addUserModel(modelIds: string[], userId?: string) {
        return new Promise((resolve, reject) => {
            const payload = userId ? { modelIds, userId } : { modelIds }
            apiClient
                .post(`/api/v1/user/models`, payload)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("addUserModel error:", error)
                    reject(error)
                })
        })
    }

    async function deleteUserModel(modelIds: string[], userId?: string) {
        return new Promise((resolve, reject) => {
            const payload = userId ? { modelIds, userId } : { modelIds }
            apiClient
                .put(`/api/v1/user/models`, payload)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteUserModel error:", error)
                    reject(error)
                })
        })
    }

    async function updateUserModel(modelIds: string[], userId?: string) {
        return new Promise((resolve, reject) => {
            const payload = userId ? { modelIds, userId } : { modelIds }
            apiClient
                .put(`/api/v1/user/models`, payload)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("updateUserModel error:", error)
                    reject(error)
                })
        })
    }

    return {
        getNotes,
        updateNote,
        deleteNote,
        createNote,
        uploadFile,
        deleteDocument,
        updateDocument,
        getDocumentsList,
        getDocumentParsedData,
        getOAuthUrl,
        getOAuthToken,
        getGoogleDriveFiles,
        createPrompt,
        updatePrompt,
        getPrompts,
        getPromptByKey,
        addAPIKey,
        deleteAPIKey,
        getAPIKeys,
        getIntegrations,
        deleteUserIntegration,
        getSourceFileParsedData,
        getGCRLogs,
        updateDocumentStatus,
        addIntegrationFiles,
        deleteIntegrationFile,
        getSourceFileParsedDataFromIntegrationFiles,
        getUserModels,
        addUserModel,
        deleteUserModel,
        updateUserModel,
        getRagToken,
        getUserSettings,
        updateUserSettings,
        validateIntegration,
    }
}
