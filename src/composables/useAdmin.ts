import adminService from "~/services/adminService"
import cookie from "js-cookie"
import eventBus from "~/util/eventBus"

export default function useAdmin() {
    const config = useRuntimeConfig()
    const platform = config.public.platform
    const environment = config.public.environment
    const loginCallbackURL = `${config.public.clientURL}/auth/login`
    const google_developer_key = config.public.google_developer_key
    const authCallbackURL = `${config.public.clientURL}/workbench/files`

    async function getVectorDatabasesList() {
        try {
            const response: any = await adminService(config).getVectorDatabasesList()
            const vectorDatabasesObj = response.data
            const vectorDatabaseIds = Object.keys(vectorDatabasesObj)
            const vectorDatabaseList: any = []
            vectorDatabaseIds.forEach((id) => vectorDatabaseList.push(vectorDatabasesObj[id]))
            return vectorDatabaseList
        } catch (error) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to fetch vector databases",
                _type: "error",
            })
            return false
        }
    }

    async function updateVectorDatabase(databaseData: any) {
        try {
            const response: any = await adminService(config).updateVectorDatabaseData(databaseData)
            eventBus.emit("showToast", {
                message: response.message || "Unable to update vector database data",
                _type: response.status,
            })
            return
        } catch (error) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to update vector database data",
                _type: "error",
            })
            return false
        }
    }
    async function createVectorDatabase(vectorDatabaseData: any) {
        try {
            const response: any = await adminService(config).createVectorData(vectorDatabaseData)
            eventBus.emit("showToast", {
                message: response.message || "Unable to update vector database data",
                _type: response.status,
            })
            return
        } catch (error) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to update vector database data",
                _type: "error",
            })
            return false
        }
    }
    async function getAllCollections() {
        try {
            const response: any = await adminService(config).getAllCollections()
            return response.data
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
            return false
        }
    }
    async function grantCollectionAccess(email: string, collectionId: string, type: string) {
        try {
            const response: any = await adminService(config).grantCollectionAccess(email, collectionId, type)
            eventBus.emit("showToast", {
                message: response.message,
                _type: "success",
            })
            return response
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
            return false
        }
    }

    // Model Management Functions
    async function getAllModels() {
        try {
            const response: any = await adminService(config).getAllModels()
            return response
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to fetch models",
                _type: "error",
            })
            return false
        }
    }

    async function createModel(AIProvider: string, modelData: any) {
        try {
            const response: any = await adminService(config).createModel(AIProvider, modelData)
            eventBus.emit("showToast", {
                message: response.message || "Model created successfully",
                _type: "success",
            })
            return response
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to create model",
                _type: "error",
            })
            return false
        }
    }

    async function updateModel(AIProvider: string, model: string, modelData: any) {
        try {
            const response: any = await adminService(config).updateModel(AIProvider, model, modelData)
            eventBus.emit("showToast", {
                message: response.message || "Model updated successfully",
                _type: "success",
            })
            return response
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to update model",
                _type: "error",
            })
            return false
        }
    }

    async function deleteModel(AIProvider: string, model: string) {
        try {
            const response: any = await adminService(config).deleteModel(AIProvider, model)
            eventBus.emit("showToast", {
                message: response.message || "Model deleted successfully",
                _type: "success",
            })
            return response
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to delete model",
                _type: "error",
            })
            return false
        }
    }
    async function addUserToWaitlist(email: string, name: string) {
        try {
            const response: any = await adminService(config).addUserToWaitlist(email, name)
            eventBus.emit("showToast", {
                message: response.message || "User added to waitlist successfully",
                _type: "success",
            })
            return response
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message || "Unable to add user to waitlist",
                _type: "error",
            })
            return false
        }
    }
    async function getAllWaitlistUsers() {
        try {
            const response: any = await adminService(config).getAllWaitlistUsers()
            return response
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message || "Unable to get all waitlist users",
                _type: "error",
            })
            return false
        }
    }
    async function deleteWaitlistUser(email: string) {
        try {
            const response: any = await adminService(config).deleteWaitlistUser(email)
            eventBus.emit("showToast", {
                message: response.message || "User deleted from waitlist successfully",
                _type: "success",
            })
            return response
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message || "Unable to delete waitlist user",
                _type: "error",
            })
            return false
        }
    }
    async function updateWaitlistUser(id: string, isOnboarded: boolean) {
        try {
            const response: any = await adminService(config).updateWaitlistUser(id, isOnboarded)
            eventBus.emit("showToast", {
                message: response.message || "User updated in waitlist successfully",
                _type: "success",
            })
            return response
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message || "Unable to update waitlist user",
                _type: "error",
            })
            return false
        }
    }

    return {
        getVectorDatabasesList,
        updateVectorDatabase,
        createVectorDatabase,
        getAllCollections,
        grantCollectionAccess,
        getAllModels,
        createModel,
        updateModel,
        deleteModel,
        platform,
        environment,
        google_developer_key,
        addUserToWaitlist,
        getAllWaitlistUsers,
        deleteWaitlistUser,
        updateWaitlistUser,
        loginCallbackURL,
        authCallbackURL
    }
}
