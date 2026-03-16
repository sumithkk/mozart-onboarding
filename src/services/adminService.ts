import axios from "axios"
import cookie from "js-cookie"
import { useUserStore } from "@/store/user"

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


    async function getVectorDatabasesList() {
        return new Promise((resolve, reject) => {
            apiClient
                .get("/api/v1/admin/getVectorDatabase")
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getVectorDatabasesList error:", error)
                    reject(error)
                })
        })
    }
    async function updateVectorDatabaseData(databaseData: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/admin/updateVectorDatabase", databaseData)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("updateVectorDatabaseData error:", error)
                    reject(error)
                })
        })
    }
    async function createVectorData(databaseData: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/admin/createVectorDatabase", databaseData)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("createVectorData error:", error)
                    reject(error)
                })
        })
    }
    async function getAllCollections() {
        return new Promise((resolve, reject) => {
            apiClient
                .get("/api/v1/admin/getAllCollections")
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getAllCollections error:", error)
                    reject(error)
                })
        })
    }
    async function grantCollectionAccess(email: string, collectionId: string, type: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/admin/grantCollectionAccess", { email, collectionId, type })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("grantCollectionAccess error:", error)
                    reject(error)
                })
        })
    }

    // Model Management Functions
    async function getAllModels() {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/config/getModels")
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getAllModels error:", error)
                    reject(error)
                })
        })
    }

    async function createModel(AIProvider: string, modelData: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/config/createModel", { AIProvider, modelData })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("createModel error:", error)
                    reject(error)
                })
        })
    }

    async function updateModel(AIProvider: string, model: string, modelData: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .put("/api/v1/config/updateModel", { AIProvider, model, modelData })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("updateModel error:", error)
                    reject(error)
                })
        })
    }

    async function deleteModel(AIProvider: string, model: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .delete("/api/v1/config/deleteModel", { data: { AIProvider, model } })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteModel error:", error)
                    reject(error)
                })
        })
    }

    async function addUserToWaitlist(email: string, name: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/admin/waitlist", { email, name })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("addUserToWaitlist error:", error)
                    reject(error)
                })
        })
    }

    async function getAllWaitlistUsers() {
        return new Promise((resolve, reject) => {
            apiClient
                .get("/api/v1/admin/waitlist")
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getAllWaitlistUsers error:", error)
                    reject(error)
                })
        })
    }

    async function deleteWaitlistUser(email: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .delete(`/api/v1/admin/waitlist/${email}`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("deleteWaitlistUser error:", error)
                    reject(error)
                })
        })
    }

    async function updateWaitlistUser(id: string, isOnboarded: boolean) {
        return new Promise((resolve, reject) => {
            apiClient
                .put(`/api/v1/admin/waitlist`, { id, isOnboarded })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("updateWaitlistUser error:", error)
                    reject(error)
                })
        })
    }

    return {
        getVectorDatabasesList,
        updateVectorDatabaseData,
        createVectorData,
        getAllCollections,
        grantCollectionAccess,
        getAllModels,
        createModel,
        updateModel,
        deleteModel,
        addUserToWaitlist,
        getAllWaitlistUsers,
        deleteWaitlistUser,
        updateWaitlistUser,
    }
}
