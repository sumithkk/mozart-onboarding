import axios from "axios"
import cookie from "js-cookie"
import { useUserStore } from "@/store/user"

export default function fileSystemService($config: any) {
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
    async function createFile(callback: (percent: number) => void, file: File, data: any, isAnonymous: boolean = false, keepOriginal: boolean = false, anonymizationTerms: string = "") {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.withCredentials = true
            const formData = new FormData()
            formData.append("fileData", JSON.stringify(data))
            formData.append("file", file)
            formData.append("options", JSON.stringify({ isAnonymous, keepOriginal, anonymizationTerms }))
            xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100)
                    callback(percent)
                }
            })
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response)
                    } else {
                        let errorMessage = "Failed to upload file"
                        const parsed = JSON.parse(xhr.response)
                        errorMessage = parsed.message || errorMessage
                        reject(errorMessage)
                    }
                }
            }
            xhr.open("POST", `${$config.public.apiUrl}/api/v1/file/create`, true)
            xhr.setRequestHeader("Authorization", "Bearer " + cookie.get("mozart"))
            xhr.send(formData)
        })
    }
    async function createFolder(data: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/folder/create", data)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("createFolder error:", error)
                    reject(error)
                })
        })
    }
    async function getFolderContents(folderId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/folder/getFolderContents/${folderId}`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getFolderContents error:", error)
                    reject(error)
                })
        })
    }
    async function deleteFile(fileId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/file/delete`, { fileId })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteFile error:", error)
                    reject(error)
                })
        })
    }
    async function deleteFolder(folderId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/folder/delete`, { folderId })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteFolder error:", error)
                    reject(error)
                })
        })
    }
    async function updateFile(data: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/file/update`, data)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("updateFile error:", error)
                    reject(error)
                })
        })
    }
    async function updateFolder(data: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/folder/update`, data)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("updateFolder error:", error)
                    reject(error)
                })
        })
    }
    async function moveFile(sourceFileFolderId: string, destinationFileFolderId: string, targetFileFolderPath: string, source?: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/file/move`, { sourceFileFolderId, destinationFileFolderId, targetFileFolderPath, source })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("moveFile error:", error)
                    reject(error)
                })
        })
    }
    async function moveFolder(sourceFileFolderId: string, destinationFileFolderId: string, targetFileFolderPath: string, source?: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/folder/move`, { sourceFileFolderId, destinationFileFolderId, targetFileFolderPath, source })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("moveFolder error:", error)
                    reject(error)
                })
        })
    }
    async function anonymizeExistingFile(fileId: string, anonymizationTerms: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/file/anonymize`, { fileId, anonymizationTerms })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("anonymizeExistingFile error:", error)
                    reject(error)
                })
        })
    }
    async function getAllUserFiles() {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/file/get`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getAllUserFiles error:", error)
                    reject(error)
                })
        })
    }
    async function shareFile(fileOrFolderId: string, fileType: string, email: string, role: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/file/share`, { fileOrFolderId, fileType, email, role })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("shareFile error:", error)
                    reject(error)
                })
        })
    }
    async function getSharedUsers(fileOrFolderId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/api/v1/file/getSharedUsers?fileId=${fileOrFolderId}`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getSharedUsers error:", error)
                    reject(error)
                })
        })
    }
    async function deleteAllFilesAndFolders() {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/file/deleteAllFilesAndFolders`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteAllFilesAndFolders error:", error)
                    reject(error)
                })
        })
    }
    return {
        createFile,
        createFolder,
        getFolderContents,
        deleteFile,
        deleteFolder,
        updateFile,
        updateFolder,
        moveFile,
        moveFolder,
        anonymizeExistingFile,
        getAllUserFiles,
        shareFile,
        getSharedUsers,
        deleteAllFilesAndFolders,
    }
}
