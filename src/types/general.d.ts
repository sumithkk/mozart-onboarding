declare module "click-outside-vue3"
interface IShowToastEvent {
    message: string
    _type: string
}
type IEventTypes = {
    [eventName: string]: unknown // Ensures the correct structure for EventEmitter
    showToast: { message: string; _type: string } // Specific event type
}
type ModalConfirmationResult = "confirm" | "cancel"
type ModalOptions = {
    shortName: string
    title: string
    subtitle: string
    closeOnTopRight?: boolean
    confirmButtonText: string
    confirmButtonColor: string
}
interface IArchiveState {
    [key: string]: boolean
}

interface IButtonClickedState {
    archive: {
        [key: string]: boolean
    }
    clear: {
        [key: string]: boolean
    }
}

// Heap
declare interface Window {
    heapReadyCb: Array<{ name: string; fn: () => void }>
    heap: any
    gapi: any
    google: any
    __onGoogleLoaded?: () => void
}

// Completion
interface ICompletionData {
    messages: ICompletionMessages[]
    action: string
    model: string
    isThinkingSupported: boolean
    AIName: string
    stream: boolean
    rag: boolean
    rag_sources: any[]
    conversationId?: string | null
    userMessage?: any
    documentId?: string | null
    userId?: string | null
    collectionName?: string | null
    systemPrompt?: string | null
    writingStyle?: string | null
    toolChoice?: string | null
    projectId?: string | null
}

interface ICompletionMessages {
    content: string
    role: string
    name: string
}

interface ICompletionChunkResponse {
    conversationId: string
    messageId: string
    userId: string
    parentId: string
    author: {
        role: string
        name: string
        profilePicture: string
    }
    createdAt: number
    updatedAt: number | null
    status: string
    content: {
        contentType: string
        parts: string[]
        thinking: {
            isFinished: boolean
            text: string
        }
    }
    metaData: IMessageMetaData
    isVisuallyHiddenFromConversation: boolean
    children: string[]
    title?: string
}

// Waitlist
interface IWaitlistRequest {
    name: string
    email: string
}

interface IWaitlistResponse {
    success: boolean
    message: string
    data?: any
}
