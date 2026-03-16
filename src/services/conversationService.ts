import axios from "axios"
import cookie from "js-cookie"
import { useUserStore } from "@/store/user"

export default function conversationService($config: any) {
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

    function getConversationMessagesById(conversationId: string, userId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/message/getById", { conversationId, userId })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("getConversationMessagesById error:", error)
                    reject(error)
                })
        })
    }

    function getConversationsList(type: string | null = null, composeOffset: string | null = null, interactionOffset: string | null = null, sharedComposeOffset: string | null = null, sharedInteractionOffset: string | null = null, limit: number | null = 20, archived: number | null = 0) {
        const params = {
            type,
            composeOffset,
            interactionOffset,
            sharedComposeOffset,
            sharedInteractionOffset,
            limit,
            archived,
        }

        return new Promise((resolve, reject) => {
            apiClient
                .get("/api/v1/conversation/get", { params })
                .then((response) => {
                    // console.log(response.data, response);
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("getConversationsList error:", error)
                    reject(error)
                })
        })
    }

    function deleteAllConversations() {
        return new Promise((resolve, reject) => {
            apiClient
                .get("/api/v1/conversation/deleteAll")
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("deleteAllConversations error:", error)
                    reject(error)
                })
        })
    }
    function deleteConversationById(conversationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/conversation/delete", { data: { conversationId } })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("deleteConversationById error:", error)
                    reject(error)
                })
        })
    }

    function updateConversationTitleById(conversationId: string, title: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/conversation/rename", { data: { conversationId, title } })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("updateConversationTitleById error:", error)
                    reject(error)
                })
        })
    }
    function shareConversation(conversationId: string, email: string, role: string, isCopyLink: boolean) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/conversation/share", { conversationId, email, role, isCopyLink })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("shareConversation error:", error)
                    reject(error)
                })
        })
    }
    function deleteSharedConversation(conversationId: string, collaboratorId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/conversation/deleteSharedConversation", { conversationId, collaboratorId })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("deleteSharedConversation error:", error)
                    reject(error)
                })
        })
    }
    function getConversationCollaborators(conversationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/conversation/getCollaborators", { conversationId })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("getConversationCollaborators error:", error)
                    reject(error)
                })
        })
    }

    function validateInvite (inviteId: any) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/conversation/validateShareInvite", { inviteId })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("validateInvite error:", error)
                    reject(error)
                })
        })
    }

    function archiveConversation (conversationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/conversation/archive", { conversationId })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("archiveConversation error:", error)
                    reject(error)
                })
        })
    }

    function restoreConversation (conversationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/conversation/restore", { conversationId })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("restoreConversation error:", error)
                    reject(error)
                })
        })
    }

    function createProject (name: string, description: string, scope: string, organizationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/conversation/project", { name, description, scope, organizationId })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("createProject error:", error)
                    reject(error)
                })
        })
    }

    function deleteProject (projectId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .delete("/api/v1/conversation/project", { params: { projectId } })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("deleteProject error:", error)
                    reject(error)
                })
        })
    }

    function getProjectsForUser (scope: string = "personal") {
        return new Promise((resolve, reject) => {
            apiClient
                .get("/api/v1/conversation/project", { params: { scope } })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("getProjectsForUser error:", error)
                    reject(error)
                })
        })
    }

    function updateProject (projectId: string, name: string, description: string, scope: string, organizationId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .put("/api/v1/conversation/project", { projectId, name, description, scope, organizationId })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("updateProject error:", error)
                    reject(error)
                })
        })
    }

    function moveConversationToProject (conversationId: string, projectId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/conversation/move", { conversationId, projectId })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("moveConversationToProject error:", error)
                    reject(error)
                })
        })
    }

    function getProjectConversations (projectId: string) {
        return new Promise((resolve, reject) => {
            apiClient
                .get("/api/v1/conversation/getProjectConversations", { params: { projectId } })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error("getProjectConversations error:", error)
                    reject(error)
                })
        })
    }
    return {
        getConversationMessagesById,
        getConversationsList,
        deleteAllConversations,
        deleteConversationById,
        updateConversationTitleById,
        shareConversation,
        deleteSharedConversation,
        getConversationCollaborators,
        validateInvite,
        archiveConversation,
        restoreConversation,
        createProject,
        deleteProject,
        getProjectsForUser,
        updateProject,
        moveConversationToProject,
        getProjectConversations,
    }
}
