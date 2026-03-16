type dataFetchingState = "idle" | "loading" | "success" | "error"
interface IMessageContent {
    contentType: string
    parts: string[]
    thinking: IMessageContentThinking
    toolCalls?: TToolCall[]
}
interface IMessageContentThinking {
    isFinished: boolean
    text: string
}
interface TToolCall {
    name: string
    type: string
    arguments: any
}

interface IMessageMetaData {
    documents?: IDocument[]
    tokenUsage: {
        promptTokens: number
        responseToken: number
        totalTokens: number
    }
    generatedBy?: string
    rag_sources?: any[]
    collection?: string
    expanded?: boolean
}

interface IDocument {
    documentId: string
    fileName: string
    fileSize: number
    url: string
    fileType: string
    isProcessed: Boolean
    data: string
    userId: string
    uploadedAt: string
    isDeleted: Boolean
    isArchived: Boolean
    data: String
    status: String
}

interface IMessage {
    messageId: string
    conversationId: string
    children: string[]
    author: IAuthor
    createdAt: number
    updatedAt: number | null
    content: IMessageContent
    status: string
    parentId: string | null
    userId: string
    metaData: IMessageMetaData
    isVisuallyHiddenFromConversation: boolean
    siblings?: string[]
}

interface IConversation {
    conversationId: string
    title: string
    userId: string
    isArchived: Boolean
    createdAt: number
    updatedAt: number
    defaultModel: string
    modelName: string
    metaData: {
        type: "compose" | "interaction" | "rag"
        linkedDocumentId: string
    }
    currentNode?: string
    collaborators: {
        [collaboratorId: string]: {
            collaboratorId: string
            role: string
        }
    }
    collaboratorId: string
    isShared: Boolean
    usersWithAccess: {
        [userId: string]: {
            username: string
            role: string
            profilePicture: string
        }
    }
    projectId?: string | null
}

interface IAuthor {
    role: string
    name: string
}

interface IChatState {
    messages: Array<IMessage>
    messagesTree: Record<string, IMessage>
    isProcessing: boolean
    isLoading: boolean
    isChatLoading: boolean
}

interface ISingleDocument {
    documentId: string
    fileName: string
    fileSize: number
    url: string
    fileType: string
    isProcessed: Boolean
    data: string
    userId: string
    uploadedAt: number
    isDeleted: Boolean
    isArchived: Boolean
    filePreviewUrl: string
    tags: string[]
    viewDocumentUrl: string
    owner: string
    status: string
    updatedAt: number
    source?: {
        name: string
        id: string
    }
}
interface IDocuments {
    documents: Record<string, ISingleDocument>
    documentId: string
    documentParsedData: any
    notes: Record<string, INote>
    isLoading: boolean
    isProcessing: boolean
    selectedPageRange: [number, number]
}

interface ISingleMatter {
    matterId: string
    name: string
    description: string
    clientName: string
    tags: string[]
    documents: string[]
    createdAt: number
    updatedAt: number
    userId: string
    isDeleted: boolean
    isArchived: boolean
}
interface IMatters {
    matters: Record<string, ISingleMatter>
    matterId: string
}
interface ICase {
    caseId: string
    caseIntroduction: ICaseData
    caseBackground: ICaseBackground
    caseDemandAndSettlement: ICaseDemandAndSettlement
    caseConclusion: ICaseConclusion
    cases: ICaseData[]
}
interface ICaseIntroduction {
    caseId: string
    deliveryMethod: string
    lawyerFirstName: string
    lawyerLastName: string
    lawyerEmail: string
    lawyerFirmName: string
    lawyerFirmAddress: string
    lawyerFirmCity: string
    lawyerFirmState: string
    lawyerFirmZIP: string
    recipientFirstName: string
    recipientLastName: string
    recipientEmail: string
    companyName: string
    companyAddress: string
    companyCity: string
    companyState: string
    companyZIP: string
    caseName: string
    clientFirstName: string
    clientLastName: string
    caseDescription: string
    date: string
}
interface ICaseBackground {
    jobTitle: string
    employmentDuration: string
    keyIncidents: string
    datesOfIncidents: string
    selectedClaims: any[]
    selectedViolations: any[]
    otherClaim: string
    otherViolation: string
}
interface ICaseDemandAndSettlement {
    totalSettlementAmount: number
    specificActionsSought: string
    responseDeadline: string
}
interface ICaseConclusion {
    encourageCooperativeResolution: string
    stepsIfNoResponse: string
}

interface INote {
    noteId: string
    title: string
    content: string
    createdAt: number
    updatedAt: number
    userId: string
    isDeleted: boolean
    tags: string[]
}

interface ISingleModel {
    AIName: string
    name: string
    model: string
    image: string
    isThinkingSupported: boolean
    isEnabled: boolean
    description: string
    // Additional API fields
    context_window?: number
    max_output_tokens?: number
    is_premium_model?: boolean
    input_token_cost_per_million_tokens?: number | null
    output_token_cost_per_million_tokens?: number | null
    training_data?: string
    max_token_key?: string
    capabilities?: string[]
    accessible?: boolean
}
interface IModel {
    models: Array<ISingleModel>
    userModels: Array<string>
    current: ISingleModel
    loading: boolean
    error: string
    // Cache flags to prevent duplicate API calls
    _modelsLoaded?: boolean
    _userModelsLoaded?: boolean
}

interface IRagStore {
    documentId: string
    status: string
    collections: ICollection[]
    currentCollection: string
    ragData: any[]
    ragUserFilesData: IRAGFiles[]
    qdrantInstances: string[]
    currentQdrantInstance: string
    collectionPointCount: number
    currentMaxOffset: number
    previousMaxOffset: number
    currentMinOffset: number
    previousMinOffset: number
    rag_response_templates: string[]
    template_name: string
    userInputUnstructuredData: any
    LLMResponse: string
    prompt: string
    searchInputUnstructuredData: any
    googleDriveFiles: any[]
    sheetFiles: any[]
    isDataMode: boolean
    isBetaEnabled: boolean
    vectorizationLogs: any
    isLoading: boolean
    isProcessing: boolean
    isVectorizing: boolean
    summaries: any
    summaryStream: any
    summaryProcessing: boolean
    summaryPrompt: any
    systemPrompt: any
    platform: string
    environment: string
    // Cache flags to prevent duplicate API calls
    _collectionsLoaded?: boolean
    _collectionDataLoaded?: boolean
    _collectionPointCountLoaded?: boolean
}

interface IUserSession {
    [String]: {
        clientIPAddress: Array[String]
        userAgent: string
        tokenHas: string
        revoked: boolean
        browser: { name: string; version: string }
        engine: { name: string; version: string }
        os: { name: string; version: string }
        device: { vendor: string; model: string; type: string }
        cpu: { architecture: string }
        updatedAt: number
        thisDevice: boolean | null
    }
}

interface UserSettings {
    increasedFontSize: boolean
    showTokenUsage: boolean
    workbenchWidget: boolean
    customNotes: boolean
    expandedInputText: boolean
    templates: boolean
    theme: string
    pinSideBar: boolean
    showFilePreview: boolean
    fileExplorerViewMode: "grid" | "list"
}
interface IUser {
    createdAt: number
    currentPlan: string
    email: string
    emailVerified: boolean
    firstName: string
    lastName: string
    profilePicture: string
    role: TUserRole
    defaultCollection: string
    settings: UserSettings
    models: string[]
    updatedAt: number
    id: string
    session: IUserSession
    isAdmin: boolean
    sharedConversation: string
    integrations: {
        [key: string]: any
    }
    ragAPIKey: string
    ragToken: string
    apiKeys: any
    isLoading: boolean
    showPlanPopup: boolean
    writingStyle: string
    systemPrompt: string
    isMinimizedGoogleDriveOnboarding: boolean
    isImpersonating: boolean
    timezone: string
    // Cache flags to prevent duplicate API calls
    _sessionLoaded?: boolean
    _integrationsLoaded?: boolean
    _settingsLoaded?: boolean
    _ragTokenLoaded?: boolean
    // Store session data temporarily to share with other stores
    _lastSessionData?: any
}

interface IIntegrationStore {
    integrations: any[]
    isGettingIntegrations: boolean
}

interface IOrganization {
    organizationId: string
    createdAt: string
    updatedAt: string
    title: string
    name: string
    ownerId: string
    description: string
    personal: boolean
    organizationLogo: string
    team: {
        [string]: {
            userId: string
            role: string
            username: string
            email: string
            profilePicture: string
        }
    }
    billing: {
        status: string
        currentPeriodEnd: number
        currentPeriodStart: number
        planName: string
        startDate: number
        subscriptionId: string
        trialEnd: number
        trailStart: number
    }
}

type TUserRole = "landAdvisor" | "basic" | "admin" | "superadmin"
interface IProject {
    projectId: string
    name: string
    description?: string
    scope: ProjectScope
    ownerId: string
    organizationId: string
    isArchived: boolean
    isDefault: boolean
    createdAt: number
    updatedAt: number
    lastModifiedBy: string
    chatCount?: number
    metadata?: Record<string, any>
}
interface IConversationsGrouped {
    Today: IConversation[]
    Yesterday: IConversation[]
    Previous7Days: IConversation[]
    Previous30Days: IConversation[]
    OlderConversations: any
}
interface IConversationState {
    conversations: Record<string, IConversation>
    conversationsGroupedList: { [key: string]: IConversation[] }[]
    projects: IProject[]
    byProject: Record<string, { conversations: IConversation[]; loaded: boolean }>
    archivesLoaded: boolean
    archivedConversations: IConversation[]
    conversationId: string
    sharedConversationId: string
    currentNode: string
    activeConversation: IConversation | null
    interactions: IConversation[]
    compose: IConversation[]
    rag: IConversation[]
    draftings: []
    composeOffset: string | null
    interactionOffset: string | null
    sharedComposeOffset: string | null
    sharedInteractionOffset: string | null
    limit: number | null
    hasMore: boolean
    groupedWorkbenchInteractions: IConversation[]
    groupedConversations: { [key: string]: IConversation[] }[]
    isLoading: boolean
    triggerShareConversation: boolean
    enableToolCalling: boolean
    creatingNewConversation: boolean
}

interface IOrganizationStore {
    currentOrganizationId: string
    organizations: Array<any>
    currentOrganization: any | null
    organizationMembers: Array<any>
    isLoading: boolean
}

interface IAuth {
    isAuthenticated: boolean
    token: string
}

interface INote {
    noteId: string
    title: string
    content: string
    createdAt: number
    updatedAt: number
    userId: string
    isDeleted: boolean
    tags: string[]
    owner: string
    status: string
}
interface ISheetRow {
    City: string
    Tags: string
    Loaded_At: string
    Created_At: string
    URL: string
    Highlighted: string
    Match: string
    Match_Count: string
    MaximizedMatch: string
    Pages: string
    Pages_Match: string
    comment: string
    Selected: boolean
}
interface ISheetRows {
    rows: ISheetRow[]
    isDataLoaded: boolean
    cities: string[]
}

interface IUserPermission {
    permissions: {
        [key: string]: {
            allowedLinks: string[]
            defaultRoute: string
        }
    }
}

interface IRAGFiles {
    [key: string]: {
        name: string
        url: string
        lastModified: string
        size: number
    }[]
}

interface IRAGCollection {
    name: string
    embedding: string
    distance: string
}

interface IGoogleDriveFile {
    documentId: string
    fileName: string
    mimeType: string
    webViewLink: string
    webContentLink: string
}
interface ICollection {
    id: string
    name: string
    distance: string
    embedding: string
    owner: string
    created_at: number
    updated_at: number
    number_of_files: number
    service: string
    usersWithAccess: usersWithCollectionAccess
    organizationId: string
    alias: string
}

// Collection Access
interface IUserCollectionAccess {
    id: string
    email_id: string
    collections: ICollectionAccess[]
}

interface ICollectionAccess {
    collection_id: string
    collection_name: string
    email: string
    access_level: "read" | "write"
}

interface IWorkbenchRecord {
    id: string
    name: string
    type: "file"
    path: string
    parentFolderId: string
    size: number
    mimeType: string
    ownerId: string
    createdAt: Date
    updatedAt: Date
    lastModifiedBy: string
    isStarred: boolean
    isTrashed: boolean
    isHidden: boolean
    isShared: boolean
    isSharedWithMe: boolean
    status: string
    url?: string
    filePreviewUrl?: string
}

export interface IWorkbenchNoteRecord {
    id: string
    name: string
    mimeType: string
    createdAt: Date
    updatedAt?: Date
    size: number
    content?: string
}
