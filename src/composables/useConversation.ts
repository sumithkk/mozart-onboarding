import conversationService from "~/services/conversationService"
import eventBus from "~/util/eventBus"
import socketService from "../services/socketService"

export default function useConversation() {
    const config = useRuntimeConfig()
    const conversationStore = useConversationStore()
    const messageStore = useMessageStore()
    const userStore = useUserStore()
    const router = useRouter()

    const getMessagesByConversationId = async (conversationId: string, userId: string) => {
        try {
            const response: any = await conversationService(config).getConversationMessagesById(conversationId, userId)
            if (!response) return false
            
            // Handle case where backend hasn't created conversation yet (race condition)
            // This can happen when we create conversationId on frontend and backend is still processing
            const messages = response.data?.messages
            
            // Check if messages is a valid object (not null, not array, and is an object)
            if (messages && typeof messages === 'object' && !Array.isArray(messages) && Object.keys(messages).length > 0) {
                messageStore.setMessageTree(messages)
                return messages
            }
            
            // Return empty object if no messages yet (preserves existing user message in tree)
            return {}
        } catch (error: any) {
            console.log("Failed to get messages by conversation id", error)
            eventBus.emit("showToast", {
                message: "Failed to get messages by conversation id",
                _type: "error",
            })
            // Redirect to compose page when failed to get messages
            router.push("/compose")
            return false
        }
    }

    const getConversationsList = async (type: string | null = null, composeOffset: string | null = null, interactionOffset: string | null = null, sharedComposeOffset: string | null = null, sharedInteractionOffset: string | null = null, limit: number | null = 20) => {
        try {
            const response: any = await conversationService(config).getConversationsList(type, composeOffset, interactionOffset, sharedComposeOffset, sharedInteractionOffset, limit)
            conversationStore.composeOffset = response.data.offset.compose
            conversationStore.interactionOffset = response.data.offset.interaction
            conversationStore.sharedComposeOffset = response.data.sharedOffset.compose
            conversationStore.sharedInteractionOffset = response.data.sharedOffset.interaction
            conversationStore.hasMore = response.data.hasMore
            return response.data.conversations
        } catch (error) {
            eventBus.emit("showToast", {
                message: "Failed to get conversations list",
                _type: "error",
            })
            return false
        }
    }
    const getArchivedConversationsList = async () => {
        try {
            const response: any = await conversationService(config).getConversationsList(null, null, null, null, null, null, 1)
            return response.data.conversations
        } catch (error) {
            console.log("Failed to get archived conversations list", error)
            eventBus.emit("showToast", {
                message: "Failed to get archived conversations list",
                _type: "error",
            })
            return []
        }
    }

    const deleteAllConversations = async () => {
        try {
            const response: any = await conversationService(config).deleteAllConversations()
            if (!response) return console.log("Failed to delete all conversations")
            conversationStore.updateConversations({})
            eventBus.emit("showToast", {
                message: "All conversations deleted successfully",
                _type: "success",
            })
            router.push("/compose")
            return
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: "Failed to delete all conversations",
                _type: "error",
            })
            return
        }
    }

    const deleteConversationById = async (conversationId: string) => {
        try {
            const response: any = conversationStore.conversations[conversationId].collaboratorId ? await conversationService(config).deleteSharedConversation(conversationId, conversationStore.conversations[conversationId].collaboratorId) : await conversationService(config).deleteConversationById(conversationId)
            if (!response) return console.log("Failed to delete conversation by id")
            await conversationStore.deleteConversationById(conversationId)
            eventBus.emit("showToast", {
                message: "Conversation deleted successfully",
                _type: "success",
            })
            return
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: "Failed to delete conversation by id",
                _type: "error",
            })
            return
        }
    }

    const renameConversationTitleById = async (conversationId: string, title: string) => {
        try {
            const response: any = await conversationService(config).updateConversationTitleById(conversationId, title)
            if (!response) return console.log("Failed to rename conversation by id")
            conversationStore.updateConversationTitle(conversationId, title)
            eventBus.emit("showToast", {
                message: "Conversation title updated",
                _type: "success",
            })
            return
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: "Failed to rename conversation by id",
                _type: "error",
            })
            return
        }
    }
    const shareConversation = async (conversationId: string, email: string, role: string, isCopyLink: boolean = false) => {
        try {
            const response: any = await conversationService(config).shareConversation(conversationId, email, role, isCopyLink)
            if (!response) return console.log("Failed to share conversation")
            if (!isCopyLink) {
                conversationStore.conversations[conversationId].isShared = true
                await socketService.connectSocket(config.public.apiUrl)
                socketService.joinConversation({ chatId: conversationId as string, user: { userId: userStore.userId as string, name: userStore.firstName as string } })
            }
            eventBus.emit("showToast", {
                message: isCopyLink ? "Joined the conversation" : "Conversation shared successfully",
                _type: "success",
            })
            return response.data
        } catch (error: any) {
            console.error("Failed to share conversation", error)
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
            return
        }
    }
    const generateShareLink = async (conversationId: string) => {
        conversationStore.conversations[conversationId].isShared = true
        await socketService.connectSocket(config.public.apiUrl)
        socketService.joinConversation({ chatId: conversationId as string, user: { userId: userStore.userId as string, name: userStore.firstName as string } })
        const link = `${config.public.clientURL}/compose/share/${conversationStore.conversationId}`
        return link
    }

    const getCollaborators = async (conversationId: string) => {
        try {
            const response: any = await conversationService(config).getConversationCollaborators(conversationId)
            if (!response) return console.log("Failed to get conversation collaborators")
            conversationStore.conversations[conversationId].usersWithAccess = response.data.usersWithAccess
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: "Failed to get conversation collaborators",
                _type: "error",
            })
            return
        }
    }

    const validateInvite = async (inviteId: any) => {
        try {
            const response: any = await conversationService(config).validateInvite(inviteId)
            eventBus.emit("showToast", {
                message: response.message,
                _type: "success",
            })
            return response.data.invite
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.message,
                _type: "error",
            })
            return
        }
    }

    const archiveConversation = async (conversationId: string) => {
        try {
            const response: any = await conversationService(config).archiveConversation(conversationId)
            if (!response) return console.log("Failed to archive conversation")
            await conversationStore.archiveConversation(conversationId)
            eventBus.emit("showToast", {
                message: "Conversation archived successfully",
                _type: "success",
            })
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: "Failed to archive conversation",
                _type: "error",
            })
            return
        }
    }

    const restoreConversation = async (conversationId: string) => {
        try {
            const response: any = await conversationService(config).restoreConversation(conversationId)
            if (!response) return console.log("Failed to restore conversation")
            await conversationStore.restoreConversation(conversationId)
            eventBus.emit("showToast", {
                message: "Conversation restored successfully",
                _type: "success",
            })
            return response.data
        } catch (error: any) {
            console.error("Failed to restore conversation", error)
            eventBus.emit("showToast", {
                message: "Failed to restore conversation",
                _type: "error",
            })
            return
        }
    }

    const createProject = async (name: string, description: string, scope: string, organizationId: string) => {
        try {
            const response: any = await conversationService(config).createProject(name, description, scope, organizationId)
            if (!response) return console.log("Failed to create project")
            conversationStore.addProject(response.data.project)
            eventBus.emit("showToast", {
                message: "Project created successfully",
                _type: "success",
            })
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: "Failed to create project",
                _type: "error",
            })
            return
        }
    }

    const deleteProject = async (projectId: string) => {
        try {
            const response: any = await conversationService(config).deleteProject(projectId)
            if (!response) return console.log("Failed to delete project")
            conversationStore.removeProject(projectId)
            eventBus.emit("showToast", {
                message: "Project deleted successfully",
                _type: "success",
            })
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: "Failed to delete project",
                _type: "error",
            })
            return
        }
    }

    const getProjectsForUser = async (scope: string = "personal") => {
        try {
            const response: any = await conversationService(config).getProjectsForUser(scope)
            if (!response) return console.log("Failed to get projects")
            
            // Convert projects object to array
            const projectsData = response.data
            const projectsArray = projectsData ? Object.values(projectsData) : []
            
            conversationStore.setProjects(projectsArray)
            return projectsArray
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: "Failed to get projects",
                _type: "error",
            })
            return []
        }
    }

    const updateProject = async (projectId: string, name: string, description: string, scope: string, organizationId: string) => {
        try {
            const response: any = await conversationService(config).updateProject(projectId, name, description, scope, organizationId)
            if (!response) return console.log("Failed to update project")
            conversationStore.updateProject(projectId, { name, description, scope, organizationId })
            eventBus.emit("showToast", {
                message: "Project updated successfully",
                _type: "success",
            })
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: "Failed to update project",
                _type: "error",
            })
            return
        }
    }

    const moveConversationToProject = async (conversationId: string, projectId: string) => {
        try {
            const response: any = await conversationService(config).moveConversationToProject(conversationId, projectId)
            if (!response) return console.log("Failed to move conversation to project")
            conversationStore.moveConversationToProject(conversationId, projectId)
            eventBus.emit("showToast", {
                message: "Conversation moved to project successfully",
                _type: "success",
            })
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: "Failed to move conversation to project",
                _type: "error",
            })
            return
        }
    }

    const getProjectConversations = async (projectId: string) => {
        try {
            const response: any = await conversationService(config).getProjectConversations(projectId)
            if (!response) return console.log("Failed to get project conversations")
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: "Failed to get project conversations",
                _type: "error",
            })
            return false
        }
    }
    return {
        getMessagesByConversationId,
        getConversationsList,
        deleteAllConversations,
        deleteConversationById,
        renameConversationTitleById,
        shareConversation,
        getCollaborators,
        validateInvite,
        generateShareLink,
        archiveConversation,
        restoreConversation,
        createProject,
        deleteProject,
        getProjectsForUser,
        updateProject,
        moveConversationToProject,
        getArchivedConversationsList,
        getProjectConversations,
    }
}
