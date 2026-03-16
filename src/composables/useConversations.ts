export const useConversations = () => {
    // Access the Pinia store
    const conversationStore = useConversationStore()

    // Reactive state values using storeToRefs
    const { conversations, conversationsGroupedList, conversationId, currentNode, activeConversation, interactions, compose, draftings, rag, groupedWorkbenchInteractions, isLoading } = storeToRefs(conversationStore)

    // Store actions
    const fetchConversations = async (refresh = false) => {
        await conversationStore.fetchConversations(refresh)
    }

    const setConversationId = async (id: string) => {
        await conversationStore.setConversationId(id)
    }

    const updateConversations = async (conversationsData: Record<string, IConversation>) => {
        await conversationStore.updateConversations(conversationsData)
    }

    const deleteConversationById = (id: string) => {
        conversationStore.deleteConversationById(id)
    }

    const updateConversationTitle = (id: string, title: string) => {
        conversationStore.updateConversationTitle(id, title)
    }

    const groupConversationListByLastUpdate = async (dataList: any[]) => {
        return await conversationStore.groupConversationListByLastUpdate(dataList)
    }

    const flushData = () => {
        conversationStore.flushData()
    }

    // Computed properties if needed
    const activeConversations = computed(() => conversationStore.activeConversation)
    const isConversationsLoading = computed(() => conversationStore.isLoading)

    return {
        // Reactive state
        conversations,
        conversationsGroupedList,
        conversationId,
        currentNode,
        activeConversation,
        interactions,
        compose,
        draftings,
        rag,
        groupedWorkbenchInteractions,
        isLoading,
        fetchConversations,
        setConversationId,
        updateConversations,
        deleteConversationById,
        updateConversationTitle,
        groupConversationListByLastUpdate,
        flushData,
        activeConversations,
        isConversationsLoading,
    }
}
