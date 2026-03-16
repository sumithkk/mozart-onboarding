import type { IConversation, IConversationState, IProject } from "@/types/store"
import { defineStore } from "pinia"

export const useConversationStore = defineStore("conversations", {
    state: (): IConversationState => ({
        conversations: {},
        conversationsGroupedList: [],
        projects: [],
        byProject: {},
        archivesLoaded: false,
        archivedConversations: [],
        conversationId: "",
        sharedConversationId: "",
        currentNode: "",
        activeConversation: null,
        interactions: [],
        compose: [],
        draftings: [],
        rag: [],
        groupedWorkbenchInteractions: [],
        groupedConversations: [],
        isLoading: true,
        composeOffset: null,
        interactionOffset: null,
        sharedComposeOffset: null,
        sharedInteractionOffset: null,
        limit: 20,
        hasMore: true,
        triggerShareConversation: false,
        enableToolCalling: false,
        creatingNewConversation: false,
    }),
    actions: {
        // ---------------------- FETCHING METHODS ----------------------
        async fetchConversations(refresh = false, fetchMore = false) {
            this.isLoading = true
            const doesConversationsExist = Object.keys(this.compose).length > 0 || Object.keys(this.interactions).length > 0

            if (refresh || fetchMore || !doesConversationsExist) {
                const conversations = useConversation()
                const conversationsList: any = await conversations.getConversationsList()
                // console.log(conversationsList);
                if (!conversationsList) return console.log("Failed to fetch conversations", "fetchConversations")
                this.updateConversations(conversationsList)
            }
            this.isLoading = false
        },

        async fetchPaginatedConversations() {
            if (!this.hasMore || this.isLoading) return

            this.isLoading = true

            const conversations = useConversation()
            const conversationsList: any = await conversations.getConversationsList(null, this.composeOffset, this.interactionOffset, this.sharedComposeOffset, this.sharedInteractionOffset, this.limit)
            if (!conversationsList) return console.log("Failed to fetch conversations", "fetchConversations")
            this.updateConversations(conversationsList)

            this.isLoading = false
        },

        // ---------------------- LOGICAL METHODS ----------------------
        async setConversationId(conversationId: string) {
            this.conversationId = conversationId
            this.currentNode = this.conversations[conversationId]?.currentNode || ""
        },
        async setProjects(projects: IProject[]) {
            if(projects && Array.isArray(projects) && projects.length > 0) {
                this.projects = projects
            }
            else {
                this.projects = []
            }
        },
        addProject(project: IProject) {
            if(project) {
                this.projects.push(project)
            }
        },
        removeProject(projectId: string) {
            if(projectId) {
                this.projects = this.projects.filter(project => project.projectId !== projectId)
            }
        },
        updateProject(projectId: string, updates: Partial<IProject>) {
            const projectIndex = this.projects.findIndex(project => project.projectId === projectId)
            if (projectIndex !== -1) {
                this.projects[projectIndex] = { ...this.projects[projectIndex], ...updates }
            }
        },
        async moveConversationToProject(conversationId: string, projectId: string | null) {
            if (this.conversations[conversationId]) {
                const conversation = this.conversations[conversationId]
                const oldProjectId = conversation.projectId
                conversation.projectId = projectId
                
                // Remove from old project's byProject if it existed
                if (oldProjectId && this.byProject[oldProjectId]) {
                    this.byProject[oldProjectId].conversations = 
                        this.byProject[oldProjectId].conversations.filter(
                            (conv) => conv.conversationId !== conversationId
                        )
                }
                
                // If moving TO a project, remove from grouped lists
                if (projectId) {
                    const type = conversation.metaData?.type
                    if (type === 'interaction') {
                        this.interactions = this.interactions.filter(
                            (conv) => conv.conversationId !== conversationId
                        )
                    } else if (type === 'compose') {
                        this.compose = this.compose.filter(
                            (conv) => conv.conversationId !== conversationId
                        )
                    } else if (type === 'rag') {
                        this.rag = this.rag.filter(
                            (conv) => conv.conversationId !== conversationId
                        )
                    }
                    
                    // Add to new project's byProject
                    this.addConversationToProject(conversationId, projectId)
                } else {
                    // If moving OUT of a project (projectId is null), add back to grouped lists
                    const type = conversation.metaData?.type
                    if (type === 'interaction' && !this.interactions.find(c => c.conversationId === conversationId)) {
                        this.interactions.push(conversation)
                    } else if (type === 'compose' && !this.compose.find(c => c.conversationId === conversationId)) {
                        this.compose.push(conversation)
                    } else if (type === 'rag' && !this.rag.find(c => c.conversationId === conversationId)) {
                        this.rag.push(conversation)
                    }
                }
                
                // Update grouped conversations
                this.groupedConversations = await this.groupConversationListByLastUpdate([...this.compose, ...this.rag, ...this.interactions])
            }
        },
        // Helper method to add/update a conversation in byProject
        addConversationToProject(conversationId: string, projectId: string | null) {
            if (!projectId || !this.conversations[conversationId]) return
            
            // Initialize byProject entry if it doesn't exist
            if (!this.byProject[projectId]) {
                this.byProject[projectId] = { conversations: [], loaded: false }
            }
            
            const conversation = this.conversations[conversationId]
            const existingIndex = this.byProject[projectId].conversations.findIndex(
                (conv) => conv.conversationId === conversationId
            )
            
            if (existingIndex !== -1) {
                // Update existing conversation in byProject
                this.byProject[projectId].conversations[existingIndex] = conversation
            } else {
                // Add new conversation to byProject
                this.byProject[projectId].conversations.push(conversation)
                // Sort by updatedAt descending (most recent first)
                this.byProject[projectId].conversations.sort(
                    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                )
            }
        },
        // Helper method to remove a conversation from byProject
        removeConversationFromProject(conversationId: string, projectId: string | null) {
            if (!projectId || !this.byProject[projectId]) return
            
            this.byProject[projectId].conversations = 
                this.byProject[projectId].conversations.filter(
                    (conv) => conv.conversationId !== conversationId
                )
        },
        async fetchConversationsByProject(projectId: string) {
            if (!this.byProject[projectId]) {
                this.byProject[projectId] = { conversations: [], loaded: false }
            }
            
            const conversations = useConversation()
            const projectConversations = await conversations.getProjectConversations(projectId)
            if (!projectConversations) {
                console.log("Failed to fetch project conversations", "fetchConversationsByProject")
                return
            }
            
            // Update main conversations object with fetched project conversations
            this.conversations = { ...this.conversations, ...projectConversations }
            
            // Convert to array and update byProject
            const conversationsArray = Object.values(projectConversations) as IConversation[]
            this.byProject[projectId] = {
                conversations: conversationsArray,
                loaded: true,
            }
            
            // Do NOT add project conversations to the grouped lists
            // They should only appear under their respective projects
        },
        async fetchArchivedConversations() {
            const conversations = useConversation()
            const conversationsList: any = await conversations.getArchivedConversationsList()
            if (!conversationsList) return console.log("Failed to fetch archived conversations", "fetchArchivedConversations")
            this.archivedConversations = Object.values(conversationsList)
        },
        async updateConversations(conversations: Record<string, any>) {
            this.conversations = { ...this.conversations, ...conversations }
            const conversationsInArray: any = Object.values(conversations)
            
            // Only add conversations without projectId to the grouped lists
            this.interactions.push(...conversationsInArray.filter((conversation: any) => 
                conversation.metaData.type == "interaction" && !conversation.projectId))
            this.compose.push(...conversationsInArray.filter((conversation: any) => 
                conversation.metaData.type == "compose" && !conversation.projectId))
            this.rag.push(...conversationsInArray.filter((conversation: any) => 
                conversation.metaData.type == "rag" && !conversation.projectId))
            
            this.groupedConversations = await this.groupConversationListByLastUpdate([...this.compose, ...this.rag, ...this.interactions])
            
            // Update byProject for conversations with projectId
            conversationsInArray.forEach((conversation: IConversation) => {
                if (conversation.projectId) {
                    this.addConversationToProject(conversation.conversationId, conversation.projectId)
                }
            })
        },
        async deleteConversationById(conversationId: string) {
            const router = useRouter()
            const messageStore = useMessageStore()
            const conversations = useConversation()
            const conversation = this.conversations[conversationId]
            const type = conversation?.metaData?.type

            // Remove conversation from store arrays
            this.interactions = this.interactions.filter((conv) => conv.conversationId !== conversationId)
            this.compose = this.compose.filter((conv) => conv.conversationId !== conversationId)
            this.rag = this.rag.filter((conv) => conv.conversationId !== conversationId)

            // Remove from byProject if it has a projectId
            if (conversation?.projectId) {
                this.removeConversationFromProject(conversationId, conversation.projectId)
            }

            // Remove from conversations object
            const { [conversationId]: deleted, ...remainingConversations } = this.conversations
            this.conversations = remainingConversations

            // Update grouped lists
            this.groupedConversations = await this.groupConversationListByLastUpdate([...this.compose, ...this.rag, ...this.interactions])

            if (this.conversationId === conversationId) {
                this.conversationId = ""
                messageStore.messages = []
                messageStore.messagesTree = {}
                if (type === "compose") {
                    router.push("/compose")
                } else if (type === "interaction") {
                    router.push("/workbench/files/")
                }
            }
        },
        updateConversationTitle(conversationId: string, title: string) {
            this.conversations[conversationId].title = title
        },
        uddateCoversationModelName(conversationId: string, modelName: string) {
            this.conversations[conversationId].modelName = modelName
        },
        async archiveConversation(conversationId: string) {
            const conversation = this.conversations[conversationId]
            // Update conversation's isArchived to true
            conversation.isArchived = true
            // Add conversation to archivedConversations array
            this.archivedConversations.push(conversation)

            // Remove conversation from store arrays
            this.interactions = this.interactions.filter((conv) => conv.conversationId !== conversationId)
            this.compose = this.compose.filter((conv) => conv.conversationId !== conversationId)

            // Remove from byProject if it has a projectId
            if (conversation?.projectId) {
                this.removeConversationFromProject(conversationId, conversation.projectId)
            }

            // Remove from conversations object
            const { [conversationId]: deleted, ...remainingConversations } = this.conversations
            this.conversations = remainingConversations
            // Update grouped lists
            this.groupedConversations = await this.groupConversationListByLastUpdate([...this.compose, ...this.rag, ...this.interactions])
        },
        async restoreConversation(conversationId: string) {
            // Add conversation to conversations array
            const conversationToRestore = this.archivedConversations.find((conv) => conv.conversationId === conversationId)
            if(conversationToRestore) {
                conversationToRestore.isArchived = false
                const type = conversationToRestore.metaData.type
                
                // Only add to grouped lists if conversation does NOT belong to a project
                if (!conversationToRestore.projectId) {
                    if(type === "interaction") {
                        this.interactions.push(conversationToRestore)
                    }
                    else if(type === "compose") {
                        this.compose.push(conversationToRestore)
                    }
                    else if(type === "rag") {
                        this.rag.push(conversationToRestore)
                    }
                }
                
                this.conversations[conversationId] = conversationToRestore
                
                // Add back to byProject if it has a projectId
                if (conversationToRestore.projectId) {
                    this.addConversationToProject(conversationId, conversationToRestore.projectId)
                }
                
                // Remove conversation from archivedConversations array
                this.archivedConversations = this.archivedConversations.filter((conv) => conv.conversationId !== conversationId)
                // Update grouped lists
                this.groupedConversations = await this.groupConversationListByLastUpdate([...this.compose, ...this.rag, ...this.interactions])
            }
            else {
                console.log("Conversation not found in archivedConversations")
            }
        },
        async groupConversationListByLastUpdate(dataList: any[]) {
            const dedupMap = new Map<string, any>()
            dataList.forEach((item) => {
                const existing = dedupMap.get(item.conversationId)
                // If we haven't seen this conversationId before OR
                // the current item's updatedAt is more recent, update the map.
                if (!existing || item.updatedAt > existing.updatedAt) {
                    dedupMap.set(item.conversationId, item)
                }
            })

            // Convert the deduped Map back to an array.
            const uniqueDataList = Array.from(dedupMap.values())
            const offset = new Date().getTimezoneOffset()
            const todayDate = new Date()
            const today = todayDate.toLocaleDateString("en-CA")

            const yesterdayDate = new Date(today)
            yesterdayDate.setDate(yesterdayDate.getDate() - 1)
            const yesterday = yesterdayDate.toLocaleDateString("en-CA")

            const previous7DaysDate = new Date(today)
            previous7DaysDate.setDate(previous7DaysDate.getDate() - 7)
            const previous7Days = previous7DaysDate.toLocaleDateString("en-CA")

            const previous30DaysDate = new Date(today)
            previous30DaysDate.setDate(previous30DaysDate.getDate() - 30)
            const previous30Days = previous30DaysDate.toLocaleDateString("en-CA")

            const groupedData: { [key: string]: any[] } = { Today: [], Yesterday: [], "Previous 7 Days": [], "Previous 30 Days": [] }

            const olderConversations: { [key: string]: any[] } = {}

            uniqueDataList.forEach((data) => {
                const updatedAtDate = new Date(data.updatedAt)
                const userUpdatedAtDate = new Date(data.updatedAt).toLocaleDateString("en-CA")

                if (userUpdatedAtDate >= today) {
                    groupedData["Today"].push(data)
                } else if (userUpdatedAtDate >= yesterday) {
                    groupedData["Yesterday"].push(data)
                } else if (userUpdatedAtDate >= previous7Days) {
                    groupedData["Previous 7 Days"].push(data)
                } else if (userUpdatedAtDate >= previous30Days) {
                    groupedData["Previous 30 Days"].push(data)
                } else {
                    const monthYear = `${updatedAtDate.toLocaleString("default", { month: "long" })} ${updatedAtDate.getFullYear()}`
                    if (!olderConversations[monthYear]) {
                        olderConversations[monthYear] = []
                    }
                    olderConversations[monthYear].push(data)
                }
            })

            const sortData = (a: any, b: any) => {
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            }
            Object.keys(groupedData).forEach((key) => {
                groupedData[key].sort(sortData)
            })

            Object.keys(olderConversations).forEach((monthYear) => {
                olderConversations[monthYear].sort(sortData)
            })

            const result: any = [{ Today: groupedData["Today"] }, { Yesterday: groupedData["Yesterday"] }, { "Previous 7 Days": groupedData["Previous 7 Days"] }, { "Previous 30 Days": groupedData["Previous 30 Days"] }]

            // Sort month-year keys chronologically (most recent first)
            const sortedMonthYearKeys = Object.keys(olderConversations).sort((a, b) => {
                // Parse month and year from strings like "January 2024"
                const [monthA, yearA] = a.split(" ")
                const [monthB, yearB] = b.split(" ")

                // Create date objects for comparison (using first day of month)
                const dateA = new Date(parseInt(yearA), new Date(Date.parse(monthA + " 1, 2000")).getMonth())
                const dateB = new Date(parseInt(yearB), new Date(Date.parse(monthB + " 1, 2000")).getMonth())

                // Sort in descending order (most recent first)
                return dateB.getTime() - dateA.getTime()
            })

            sortedMonthYearKeys.forEach((monthYear) => {
                result.push({ [monthYear]: olderConversations[monthYear] })
            })
            return result
        },
        flushData() {
            this.conversations = {}
            this.conversationsGroupedList = []
            this.conversationId = ""
            this.interactions = []
            this.compose = []
            this.rag = []
            this.groupedWorkbenchInteractions = []
            this.groupedConversations = []
            // this.offset = null
        },
        updateCreatingNewConversation(value: boolean) {
            this.creatingNewConversation = value
        },
        clearConversationData() {
            const messageStore = useMessageStore()
            messageStore.clearConversationData()
            this.currentNode = ""
        },
    },
})
