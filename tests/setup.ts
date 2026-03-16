import { afterAll, afterEach, beforeAll, vi } from "vitest"
import { computed, ref } from "vue"
import { createPinia, setActivePinia } from "pinia"

import { config } from "@vue/test-utils"
import { server } from "./e2e/fixtures/server"

// Mock Nuxt composables
vi.mock("#imports", () => ({
    useRuntimeConfig: () => ({
        public: {
            apiUrl: "http://localhost:3001",
            ragServiceUrl: "http://localhost:3002",
            clientURL: "http://localhost:3000",
            ragEnv: "test",
            googleAuthClientId: "test-google-client-id",
            platform: "test",
            environment: "test",
            googleDeveloperKey: "test-key",
        },
    }),
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        go: vi.fn(),
        currentRoute: { value: { path: "/", query: {}, params: {} } },
    }),
    useRoute: () => ({
        path: "/",
        query: {},
        params: {},
        name: "index",
        fullPath: "/",
        matched: [],
        meta: {},
    }),
    navigateTo: vi.fn(),
    abortNavigation: vi.fn(),
    useState: vi.fn(() => ref(null)),
    useFetch: vi.fn(),
    useLazyFetch: vi.fn(),
    useAsyncData: vi.fn(),
    useLazyAsyncData: vi.fn(),
    useHead: vi.fn(),
    useSeoMeta: vi.fn(),
    useServerSeoMeta: vi.fn(),
    useCookie: vi.fn(),
    useRequestHeaders: vi.fn(),
    useRequestURL: vi.fn(),
    useNuxtApp: vi.fn(),
    useNuxtData: vi.fn(),
    refreshCookie: vi.fn(),
    clearNuxtData: vi.fn(),
    preloadComponents: vi.fn(),
    prefetchComponents: vi.fn(),
    preloadRouteComponents: vi.fn(),
    isPrerendered: vi.fn(),
    loadPayload: vi.fn(),
    preloadPayload: vi.fn(),
    definePageMeta: vi.fn(),
    setPageLayout: vi.fn(),
    useError: vi.fn(),
    createError: vi.fn(),
    showError: vi.fn(),
    clearError: vi.fn(),
    isNuxtError: vi.fn(),
    callOnce: vi.fn(),
}))

vi.mock("~/store/user", () => ({
    useUserStore: () => ({
        userId: "test-user-id",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        role: "basic",
        isAdmin: false,
        organizations: [],
        currentPlan: "free",
        hydrateFromBetterAuth: vi.fn(),
        flushData: vi.fn(),
        isLoading: false,
        apiKeys: {},
        settings: {
            theme: "light",
            pinSideBar: true,
            increasedFontSize: false,
            showTokenUsage: false,
            workbenchWidget: false,
            customNotes: false,
            expandedInputText: false,
            templates: false,
        },
    }),
}))

vi.mock("~/store/documents", () => ({
    useDocumentsStore: () => ({
        documents: {},
        documentId: "",
        documentParsedData: {},
        notes: {},
        isLoading: false,
        isProcessing: false,
        fetchDocuments: vi.fn(),
        fetchNotes: vi.fn(),
        flushData: vi.fn(),
    }),
}))

vi.mock("~/store/conversations", () => ({
    useConversationStore: () => ({
        conversations: {},
        conversationsGroupedList: [],
        conversationId: "",
        currentNode: "",
        activeConversation: null,
        interactions: [],
        compose: [],
        draftings: [],
        rag: [],
        groupedWorkbenchInteractions: [],
        isLoading: false,
        composeOffset: null,
        interactionOffset: null,
        triggerShareConversation: false,
        enableToolCalling: false,
        creatingNewConversation: false,
        fetchConversations: vi.fn(),
        setConversationId: vi.fn(),
        updateConversations: vi.fn(),
        deleteConversationById: vi.fn(),
        updateConversationTitle: vi.fn(),
        groupConversationListByLastUpdate: vi.fn(),
        flushData: vi.fn(),
    }),
}))

vi.mock("~/store/messages", () => ({
    useMessageStore: () => ({
        messages: [],
        messagesTree: {},
        isProcessing: false,
        isLoading: false,
        isChatLoading: false,
        fetchMessages: vi.fn(),
        setMessages: vi.fn(),
        setMessageTree: vi.fn(),
        addMessage: vi.fn(),
        flushData: vi.fn(),
    }),
}))

vi.mock("~/store/rag", () => ({
    useRagStore: () => ({
        documentId: "",
        status: "",
        collections: [],
        currentCollection: "",
        ragData: [],
        ragUserFilesData: [],
        qdrantInstances: ["cloud", "local", "both"],
        currentQdrantInstance: "cloud",
        collectionPointCount: 0,
        currentMaxOffset: 0,
        previousMaxOffset: 0,
        currentMinOffset: 0,
        previousMinOffset: 0,
        rag_response_templates: ["legal", "generic"],
        template_name: "legal",
        userInputUnstructuredData: {},
        LLMResponse: "",
        prompt: "",
        searchInputUnstructuredData: {},
        googleDriveFiles: [],
        sheetFiles: [],
        isDataMode: false,
        isBetaEnabled: false,
        vectorizationLogs: {},
        isLoading: false,
        isProcessing: false,
        isVectorizing: false,
        summaries: {},
        summaryStream: {},
        summaryProcessing: false,
        summaryPrompt: {},
        systemPrompt: {},
        platform: "",
        environment: "",
        updateRagDocumentIdStatus: vi.fn(),
    }),
}))

vi.mock("~/store/models", () => ({
    useModelStore: () => ({
        current: {
            AIName: "OpenAI",
            name: "GPT-4",
            model: "gpt-4",
            isThinkingSupported: true,
            isEnabled: true,
            description: "Most capable GPT-4 model",
            image: "",
        },
        models: [],
        setCurrent: vi.fn(),
        getCurrent: vi.fn(),
    }),
}))

vi.mock("~/store/organization", () => ({
    useOrganizationStore: () => ({
        currentOrganizationId: "test-org-id",
        organizations: [],
        isCurrentOrganizationPersonal: vi.fn(),
        switchOrganization: vi.fn(),
        doesUserHasAnyActiveSubscriptionUnderAnOrganization: vi.fn(),
        getTeamOrganization: vi.fn(),
        isUserSubscriptionActive: vi.fn(),
    }),
}))

vi.mock("~/store/fileSystem", () => ({
    useFileSystemStore: () => ({
        filesAndFolders: [],
        navigatedFolderIds: [],
        currentFolderIds: [],
        currentPath: "/",
        isLoading: false,
        isRootLoaded: false,
        currentFolderId: "",
        isDeleting: false,
        getFileById: vi.fn(),
        getFileStatusById: vi.fn(),
        updateFilesAndFolders: vi.fn(),
        addUniquePath: vi.fn(),
        navigateToFolder: vi.fn(),
    }),
}))

// Mock PDF rendering library to avoid DOM APIs like DOMMatrix in tests
vi.mock("@tato30/vue-pdf", async () => {
    const vue = await import("vue")
    const { ref, onMounted, h, defineComponent } = vue as any

    return {
        VuePDF: defineComponent({
            name: "VuePDF",
            props: {
                pdf: { type: Object, default: () => ({}) },
                page: { type: Number, default: 1 },
                scale: { type: Number, default: 1 },
            },
            emits: ["text-loaded", "loaded", "error", "progress"],
            setup(_props: any, { emit }: any) {
                onMounted(() => {
                    emit("progress", { loaded: 50, total: 100 })
                    emit("loaded")
                    emit("text-loaded", { textContent: { items: [] } })
                })
                return () => h("div", { class: "mock-vue-pdf" })
            },
        }),
        usePDF: (_opts?: any, hooks?: any) => {
            // Trigger onProgress hook immediately to simulate loading updates
            hooks?.onProgress?.({ loaded: 50, total: 100 })
            return {
                pdf: ref({}),
                pages: ref(10),
                info: ref({}),
                print: () => {},
            }
        },
    }
})

// Mock pdfjs-dist to avoid DOMMatrix and other browser API issues in tests
vi.mock("pdfjs-dist", () => {
    const mockGetDocument = vi.fn(() => ({
        promise: Promise.resolve({
            numPages: 20,
            getPage: vi.fn((pageNum: number) =>
                Promise.resolve({
                    getViewport: vi.fn(() => ({ width: 100, height: 100 })),
                    render: vi.fn(() => ({ promise: Promise.resolve() })),
                    getTextContent: vi.fn(() =>
                        Promise.resolve({
                            items: [{ str: `Content for page ${pageNum}` }],
                        })
                    ),
                    cleanup: vi.fn(),
                })
            ),
        }),
    }))

    return {
        default: {
            GlobalWorkerOptions: {
                workerSrc: "",
            },
            getDocument: mockGetDocument,
        },
        GlobalWorkerOptions: {
            workerSrc: "",
        },
        getDocument: mockGetDocument,
    }
})

// Mock pdfjs-dist worker import
vi.mock("pdfjs-dist/build/pdf.worker.mjs?url", () => ({
    default: "mock-worker-url",
}))

vi.mock("~/store/abortController", () => ({
    useAbortControllerStore: () => ({
        createNewController: vi.fn(),
        abortCurrentController: vi.fn(),
        getController: vi.fn(() => new AbortController()),
    }),
}))

vi.mock("~/store/integrations", () => ({
    useIntegrationStore: () => ({
        integrations: [],
        isGettingIntegrations: false,
        getIntegrations: vi.fn(),
        disconnectIntegration: vi.fn(),
    }),
}))

vi.mock("~/store/userPermission", () => ({
    useUserPermissionStore: () => ({
        permissions: {
            admin: {
                allowedLinks: ["*"],
                defaultRoute: "/workbench/files",
            },
            basic: {
                allowedLinks: ["/compose", "/workbench"],
                defaultRoute: "/workbench/files",
            },
        },
    }),
}))

// Mock composables
vi.mock("~/composables/useUser", () => ({
    default: () => ({
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        getSessionData: vi.fn(),
        uploadFile: vi.fn(),
        deleteDocument: vi.fn(),
        getDocumentsList: vi.fn(),
        updateDocumentData: vi.fn(),
        getDocumentParsedData: vi.fn(),
        createNote: vi.fn(),
        updateNoteData: vi.fn(),
        deleteNote: vi.fn(),
        getNotes: vi.fn(),
        uploadUserAvatar: vi.fn(),
        updateProfile: vi.fn(),
        sendResetPasswordEmail: vi.fn(),
        verifyResetPasswordToken: vi.fn(),
        updatePasswordViaRestToken: vi.fn(),
        getOAuthUrl: vi.fn(),
        getOAuthToken: vi.fn(),
        getGoogleDriveFiles: vi.fn(),
        getUserOrganizationInfo: vi.fn(),
        addUserInOrganization: vi.fn(),
        updateOrganization: vi.fn(),
        revokeUserSession: vi.fn(),
        addAPIKey: vi.fn(),
        deleteAPIKey: vi.fn(),
        getAPIKeys: vi.fn(),
        getIntegrations: vi.fn(),
        deleteUserIntegration: vi.fn(),
        validateIntegration: vi.fn(),
        loginWithGoogle: vi.fn(),
        signinWithGoogle: vi.fn(),
        loginWithApple: vi.fn(),
        addIntegrationFiles: vi.fn(),
        deleteIntegrationFile: vi.fn(),
        googleAuthClientId: "test-google-client-id",
        appleLoginRoute: "http://localhost:3000/login",
    }),
}))

vi.mock("~/composables/useRag", () => ({
    default: () => ({
        getAllWorkers: vi.fn(),
        getAllQueueItems: vi.fn(),
        ragSearch: vi.fn(),
        ragCompose: vi.fn(),
        createCollection: vi.fn(),
        deleteCollection: vi.fn(),
        getCollectionsForUser: vi.fn(),
        getAllCollections: vi.fn(),
        getCollectionData: vi.fn(),
        vectorizeFile: vi.fn(),
        vectorizeSummary: vi.fn(),
        deleteSummary: vi.fn(),
        getSummary: vi.fn(),
        storeSummary: vi.fn(),
        getAllLogs: vi.fn(),
        deleteLogById: vi.fn(),
        getSystemPrompt: vi.fn(),
        updateSystemPrompt: vi.fn(),
    }),
}))

vi.mock("~/composables/useConversation", () => ({
    default: () => ({
        getMessagesByConversationId: vi.fn(),
        getConversationsList: vi.fn(),
        deleteAllConversations: vi.fn(),
        deleteConversationById: vi.fn(),
        shareConversation: vi.fn(),
        getSharedConversation: vi.fn(),
        updateConversationTitle: vi.fn(),
        socketConnection: vi.fn(),
        joinConversation: vi.fn(),
        leaveConversation: vi.fn(),
    }),
}))

vi.mock("~/composables/useCompletion", () => ({
    default: () => ({
        getResponse: vi.fn(),
        completions: vi.fn(),
        generateResponse: vi.fn(),
        generateTitle: vi.fn(),
        generateSummary: vi.fn(),
        generateFollowUp: vi.fn(),
        generateSystemPrompt: vi.fn(),
    }),
}))

vi.mock("~/composables/usePayments", () => ({
    default: () => ({
        renew: vi.fn(),
        createPortalSession: vi.fn(),
    }),
}))

vi.mock("~/composables/useStripePayment", () => ({
    default: () => ({
        renew: vi.fn(),
        createPortalSession: vi.fn(),
        createCheckoutSession: vi.fn(),
        getAllActivePlans: vi.fn(),
        getCustomerInvoices: vi.fn(),
        getAllProducts: vi.fn(),
    }),
}))

vi.mock("~/composables/useFileSystem", () => ({
    default: () => ({
        createFile: vi.fn(),
        createFolder: vi.fn(),
        getRootContents: vi.fn(),
        getFolderContents: vi.fn(),
        deleteFile: vi.fn(),
        deleteFolder: vi.fn(),
        updateFolder: vi.fn(),
        updateFile: vi.fn(),
        moveFile: vi.fn(),
        moveFolder: vi.fn(),
        anonymizeExistingFile: vi.fn(),
        getAllUserFiles: vi.fn(),
    }),
}))

vi.mock("~/composables/useAdmin", () => ({
    default: () => ({
        getUsersList: vi.fn(),
        getOrganizationsList: vi.fn(),
        updateUserData: vi.fn(),
        deleteUser: vi.fn(),
        createUser: vi.fn(),
    }),
}))

// Mock utilities
vi.mock("~/util/eventBus", () => ({
    default: {
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
    },
}))

vi.mock("js-cookie", () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
    },
}))

vi.mock("vue-router", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        go: vi.fn(),
        currentRoute: { value: { path: "/", query: {}, params: {} } },
    }),
    useRoute: () => ({
        path: "/",
        query: {},
        params: {},
        name: "index",
        fullPath: "/",
        matched: [],
        meta: {},
    }),
}))

// Provide useUserStore as a global function for auto-imports
const mockUserStoreInstance = {
    userId: "test-user-id",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    role: "basic",
    isAdmin: false,
    organizations: [],
    currentPlan: "free",
    hydrateFromBetterAuth: vi.fn(),
    flushData: vi.fn(),
    isLoading: false,
    apiKeys: {},
    settings: {
        theme: "light",
        pinSideBar: true,
        increasedFontSize: false,
        showTokenUsage: false,
        workbenchWidget: false,
        customNotes: false,
        expandedInputText: false,
        templates: false,
    },
}

// Provide useUserStore as a global function for auto-imports (available at module load time)
;(globalThis as any).useUserStore = () => mockUserStoreInstance

// Global test setup
beforeAll(() => {
    // Start MSW server
    server.listen({ onUnhandledRequest: "error" })

    // Set up Pinia
    setActivePinia(createPinia())

    // Configure Vue Test Utils
    config.global.plugins = [createPinia()]
})

afterEach(() => {
    // Reset MSW handlers
    server.resetHandlers()

    // Clear all mocks
    vi.clearAllMocks()
})

afterAll(() => {
    // Clean up MSW server
    server.close()
})

// Polyfill DOMMatrix for pdfjs-dist compatibility
if (typeof global.DOMMatrix === "undefined") {
    global.DOMMatrix = class DOMMatrix {
        a = 1
        b = 0
        c = 0
        d = 1
        e = 0
        f = 0
        m11 = 1
        m12 = 0
        m21 = 0
        m22 = 1
        m41 = 0
        m42 = 0

        constructor(init?: string | number[]) {
            if (init) {
                if (typeof init === "string") {
                    // Simple parsing for matrix() or matrix3d()
                    const values = init.match(/[\d.-]+/g)?.map(Number) || []
                    if (values.length >= 6) {
                        this.a = values[0]
                        this.b = values[1]
                        this.c = values[2]
                        this.d = values[3]
                        this.e = values[4]
                        this.f = values[5]
                    }
                }
            }
        }

        multiply() {
            return new DOMMatrix()
        }

        translate() {
            return new DOMMatrix()
        }

        scale() {
            return new DOMMatrix()
        }

        rotate() {
            return new DOMMatrix()
        }

        invert() {
            return new DOMMatrix()
        }
    } as any
}

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock HTMLElement.scrollIntoView
HTMLElement.prototype.scrollIntoView = vi.fn()

// Mock navigator.clipboard
Object.defineProperty(navigator, "clipboard", {
    value: {
        writeText: vi.fn(),
        readText: vi.fn(),
    },
    writable: true,
})

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
})
