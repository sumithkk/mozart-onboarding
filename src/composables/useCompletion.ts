import { v4 } from "uuid"
import completionService from "~/services/completionService"
import { convertMimeTypeToType, convertStringToRegexPattern, removePrefix } from "~/util"
import socketService from "../services/socketService"

export default function useCompletion() {
    const config = useRuntimeConfig()
    const messageStore = useMessageStore()
    const conversationStore = useConversationStore()
    const documentStore = useDocumentsStore()
    const modelStore = useModelStore()
    const abortControllerStore = useAbortControllerStore()
    const userStore = useUserStore()
    const router = useRouter()
    const fileSystemStore = useFileSystemStore()

    const getResponse = async (prompt: string) => {
        const model = modelStore.getCurrent()
        const data = await completionService(config).getResponse({ prompt, AIName: model.AIName })
        return data.response
    }
    const completions = async (userInputData: any, documentId?: any, parentMessageId?: any, uploadedFileData?: any, rag_prompt?: any, userId?: string, collectionName?: string) => {
        let file = documentId ? fileSystemStore.getFileById(removePrefix(documentId)) : null

        if (file) {
            file = { name: file.name, size: file.size, type: convertMimeTypeToType(file.mimeType) }
        }
        messageStore.isLoading = true
        abortControllerStore.createNewController()
        let documentDataToSend
        if (documentId) {
            const documentData = documentStore.documentParsedData
            const selectedPageRange = documentStore.selectedPageRange
            const doesDocumentExistsInConversation = conversationStore.conversations[conversationStore.conversationId]?.metaData?.linkedDocumentId
            if (documentData || documentId == documentStore.documentId || doesDocumentExistsInConversation) {
                documentDataToSend = prepareMessagesArrayToBeSendWithDocumentData(documentData, selectedPageRange, userStore, file)
            }
        }

        // Detect project context from route or conversation
        const currentRoute = router.currentRoute.value
        const projectIdFromRoute = currentRoute.params.projectId as string | undefined
        const currentProjectId = projectIdFromRoute || conversationStore.conversations[conversationStore.conversationId]?.projectId || null

        // Check if this is a new conversation
        // Also treat file routes (DOC_, FS_, gd_) as new conversations since they're temporary IDs
        const isFileRoute = conversationStore.conversationId && (conversationStore.conversationId.startsWith('DOC_') || conversationStore.conversationId.startsWith('FS_') || conversationStore.conversationId.startsWith('gd_'))
        const isNewConversation = !conversationStore.conversationId || isFileRoute

        // For new conversations, generate conversationId upfront
        if (isNewConversation) {
            const newConversationId = v4()
            conversationStore.conversationId = newConversationId

            // Set up conversation structure immediately for UX
            conversationStore.conversations[newConversationId] = {
                conversationId: newConversationId,
                userId: userStore.userId,
                title: "Chat with Mozart",
                currentNode: null,
                isArchived: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                projectId: currentProjectId || null,
                metaData: {
                    type: documentId ? "interaction" : "compose",
                    linkedDocumentId: documentId,
                },
            }

            // Add to project if applicable
            if (currentProjectId) {
                conversationStore.addConversationToProject(newConversationId, currentProjectId)
            }
        }

        const _prepareDataToBeSent = prepareDataToBeSent(messageStore.messagesTree, messageStore.messages, conversationStore.conversationId, userStore.firstName, userStore.role, userInputData, modelStore.getCurrent(), documentId, parentMessageId, uploadedFileData, rag_prompt, documentDataToSend, userId, collectionName, conversationStore.enableToolCalling, currentProjectId)

        // Immediately add user message to store for better UX
        const userMessageData = _prepareDataToBeSent.userMessage

        // Set currentNode to user message so it can be rendered
        conversationStore.currentNode = userMessageData.messageId
        conversationStore.conversations[conversationStore.conversationId].currentNode = userMessageData.messageId

        messageStore.addMessage(userMessageData)

        let isFirstChunk = true

        await completionService(config).completions(_prepareDataToBeSent, abortControllerStore.getController(), async (chunk: ICompletionChunkResponse) => {
            // Only update currentNode for visible messages (not entry nodes or hidden messages)
            if (chunk.messageId && conversationStore.conversationId === chunk.conversationId && !chunk.isVisuallyHiddenFromConversation) {
                conversationStore.currentNode = chunk.messageId
                conversationStore.conversations[conversationStore.conversationId].currentNode = chunk.messageId
            }
            if (isFirstChunk) {
                isFirstChunk = false
                messageStore.isProcessing = true

                // For new conversations, navigate to the conversation URL
                if (isNewConversation) {
                    // Check if we're currently on a fileId route (DOC_, FS_, gd_)
                    const isFileIdRoute = currentRoute.params.conversationId && (currentRoute.params.conversationId as string).match(/^(DOC_|FS_|gd_)/)

                    if (documentId && isFileIdRoute) {
                        // We're on a fileId route, update the URL in place without reload
                        conversationStore.updateCreatingNewConversation(true)
                        router.replace(`/workbench/${conversationStore.conversationId}`)
                    } else if (documentId) {
                        router.push(`/workbench/${conversationStore.conversationId}`)
                    } else if (currentProjectId) {
                        router.push(`/compose/project/${currentProjectId}/${conversationStore.conversationId}`)
                    } else {
                        router.push(`/compose/${conversationStore.conversationId}`)
                    }
                }

                // Update conversation timestamp
                conversationStore.conversations[conversationStore.conversationId] = {
                    ...conversationStore.conversations[conversationStore.conversationId],
                    updatedAt: Date.now(),
                }
            }
            if (chunk.status == "finished_successfully") {
                messageStore.isProcessing = false
                messageStore.addMessage(chunk)
                socketService.sendMessageToConversation(chunk)
                conversationStore.uddateCoversationModelName(conversationStore.conversationId, modelStore.getCurrent().model)
            } else if (chunk.status == "in_progress") {
                messageStore.addMessage(chunk)
            } else if (chunk.status == "sent") {
                // Skip processing user message entirely - it's already been added immediately
                if (chunk.messageId === userMessageData.messageId) {
                    // User message echo from server - update it to sync with backend data (parentId, children)
                    const existingUserMsg = messageStore.messagesTree[userMessageData.messageId]
                    if (existingUserMsg) {
                        // Update the message with server data (especially parentId and children)
                        existingUserMsg.parentId = chunk.parentId
                        existingUserMsg.children = chunk.children || existingUserMsg.children
                    }
                    // Skip socket and log for user message
                    return
                }

                // Handle other messages (entry nodes, hidden system messages)
                messageStore.addMessage(chunk)
                socketService.sendMessageToConversation(chunk)
            } else if (chunk.status == "finished_with_error") {
                messageStore.isProcessing = false
                messageStore.addMessage(chunk)
                socketService.sendMessageToConversation(chunk)
            } else if (chunk.status == "title_generated") {
                conversationStore.conversations[conversationStore.conversationId] = {
                    ...conversationStore.conversations[conversationStore.conversationId],
                    title: chunk.title || "Untitled",
                }
                await conversationStore.fetchConversations(true)
            }
            messageStore.isLoading = false
        })
    }
    return {
        completions,
        getResponse,
    }
}

// ---------------------------| HELPER FUNCTIONS |---------------------------
const prepareDataToBeSent = (messageObj: any, messagesArray: any, conversationId: string, name: string, role: string, userInputData: string, model: any, documentId?: any, parentMessageId?: string, uploadedFileData?: any, rag_prompt?: any, documentDataToSend?: any, userId?: string, collectionName?: string, enableToolCalling?: boolean, projectId?: string | null) => {
    const action = userInputData == "" ? "variant" : "completion"
    const dataToBeSent = {
        action: action,
        model: model.model,
        isThinkingSupported: model.isThinkingSupported,
        AIName: model.AIName,
        messages: [
            ...prepareMessagesArrayToBeSentByMessageId(messageObj, parentMessageId || getParentMessageId(messagesArray)),
            {
                content: rag_prompt && rag_prompt.prompt ? rag_prompt.prompt : userInputData,
                name: convertStringToRegexPattern(name),
                role: "user",
            },
        ],
        userMessage: userMessage(messagesArray, name, userInputData, parentMessageId, uploadedFileData, conversationId),
        documentId: documentId,
        conversationId,
        stream: true,
        rag: rag_prompt ? true : false,
        userId: userId,
        rag_sources: rag_prompt && rag_prompt.sources ? rag_prompt.sources : [],
        systemPrompt: useUserStore().systemPrompt,
        writingStyle: useUserStore().writingStyle,
        toolChoice: enableToolCalling ? "auto" : "none",
        projectId: projectId || null,
    }
    if (documentDataToSend) {
        dataToBeSent.messages.unshift(documentDataToSend)
    }
    if (collectionName) {
        ; (dataToBeSent as any).collectionName = collectionName
    }
    dataToBeSent.messages = action === "variant" ? dataToBeSent.messages.slice(0, -1) : dataToBeSent.messages
    return dataToBeSent
}
const userMessage = (messagesArray: any, name: string, userInputData: string, parentMessageId?: string, uploadedFileData?: any, conversationId?: string) => {
    const messageObject: any = {
        messageId: v4(),
        conversationId: conversationId || "",
        parentId: parentMessageId || getParentMessageId(messagesArray),
        children: [],
        author: {
            role: "user",
            name: convertStringToRegexPattern(name),
        },
        createdAt: Date.now(),
        updatedAt: null,
        content: {
            contentType: uploadedFileData ? "file" : "text",
            parts: [userInputData],
        },
        metaData: {},
        isVisuallyHiddenFromConversation: false,
        status: "sent",
    }
    if (uploadedFileData) {
        messageObject.metaData.documents = uploadedFileData
    }
    return messageObject
}
const getParentMessageId = (messagesArray: any) => {
    const lastMessage = messagesArray[messagesArray.length - 1]
    return lastMessage?.messageId || null
}
const prepareMessagesArrayToBeSentByMessageId = (messagesObj: Record<string, IMessage>, OriginMessageParentId: string) => {
    const messages = []
    let nextMessage: string | null = OriginMessageParentId
    while (nextMessage !== null) {
        const message = messagesObj[nextMessage] as IMessage
        if (!message.parentId) break
        let content: any = message.content.parts.join("\n")
        messages.push({
            content: content,
            role: message.author.role,
            name: convertStringToRegexPattern(message.author.name),
        })
        nextMessage = message.parentId
    }
    messages.reverse()
    return messages
}
const modifyUserMessageForGPTVision = (userInputData: string, model: any, uploadedFileData?: any) => {
    let text = userInputData
    if (model.model !== "gpt-4o-2024-05-13") return text
    let content: any = [{ type: "text", text: text }]
    if (uploadedFileData) {
        for (const file of uploadedFileData) {
            if (convertMimeTypeToType(file.fileType) === "Image") {
                content.push({ type: "image_url", image_url: { url: file.url } })
            }
        }
    }
    return content.length > 1 ? content : text
}

interface IFileMetadata {
    name: string
    size: number // in bytes
    type: string
}

const prepareMessagesArrayToBeSendWithDocumentData = (documentData: Record<string, { text: string; tokens: number }>, selectedPageRange: [number, number], user: any, file?: IFileMetadata) => {
    const modelStore = useModelStore()
    const maxAllowedTokens = modelStore.current.context_window || 10000
    const tail = "\nPlease remember to search the user's documents if an answer to their question is not contained in the above snippets.\n"
    let finalString = ""
    let tokens = 0

    if (file) {
        // Add file metadata to final string
        finalString += `File Name: ${file.name}\nFile Size: ${file.size} bytes\n\n`
    }

    // Get page numbers as integers and sort them
    const pageNumbers = Object.keys(documentData)
        .map((key) => parseInt(key, 10))
        .filter((num) => !isNaN(num))
        .sort((a, b) => a - b)

    let selectedPages: number[]

    // If both selectedPageRange[0] and selectedPageRange[1] are 0, take all pages
    if (selectedPageRange[0] === selectedPageRange[1] && (selectedPageRange[0] === 0 || selectedPageRange[0] === 1)) {
        selectedPages = pageNumbers
    } else {
        // Filter pages within the selected range (inclusive)
        selectedPages = pageNumbers.filter((pageNum) => pageNum >= selectedPageRange[0] && pageNum <= selectedPageRange[1])
    }
    const isTabularFile = file?.type === "CSV" || file?.type === "XLSX"
    // Process selected pages in order
    selectedPages.forEach((pageNum) => {
        const doc = documentData[pageNum.toString()]
        if (doc && tokens + doc.tokens < maxAllowedTokens) {
            finalString += `${isTabularFile ? "Row" : "Page"} ${isTabularFile ? pageNum - 1 : pageNum}: ${doc.text}` + "\n"
            tokens += doc.tokens
        }
    })

    const messageData = {
        content: finalString.length > 0 ? finalString + tail : finalString,
        role: "user",
        name: convertStringToRegexPattern(user.firstName),
    }
    return messageData
}
const filterDocumentsForImages = (documents: any) => {
    if (!documents) return []
    return documents.filter((document: any) => convertMimeTypeToType(document.fileType) === "Image")
}
