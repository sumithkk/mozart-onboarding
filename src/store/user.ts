import { defineStore } from "pinia"
import { getSession, type OrgOrganization } from "@/services/better-auth"
import { organizationService } from "@/services/better-auth"
import type { IUser, TUserRole } from "@/types/store"
import { getUserTimezone } from "@/util"

export const useUserStore = defineStore("user", {
    state: (): IUser => ({
        createdAt: 0,
        currentPlan: "",
        email: "",
        emailVerified: false,
        firstName: "",
        lastName: "",
        profilePicture: "",
        role: "basic",
        defaultCollection: "",
        isAdmin: false,
        settings: {
            increasedFontSize: false,
            showTokenUsage: false,
            workbenchWidget: false,
            customNotes: false,
            expandedInputText: false,
            templates: false,
            theme: "",
            pinSideBar: true,
            showFilePreview: false,
            fileExplorerViewMode: "list",
        },
        models: [],
        updatedAt: 0,
        id: "",
        sharedConversation: "",
        integrations: {},
        session: {},
        ragAPIKey: "",
        ragToken: "",
        apiKeys: {},
        isLoading: true,
        showPlanPopup: false,
        writingStyle: "formal",
        systemPrompt: "DEFAULT_HELPFUL_ASSISTANT",
        isMinimizedGoogleDriveOnboarding: false,
        isImpersonating: false,
        timezone: "",
        // Cache flags to prevent duplicate API calls
        _sessionLoaded: false,
        _integrationsLoaded: false,
        _settingsLoaded: false,
        _ragTokenLoaded: false,
        // Store session data temporarily to share with other stores
        _lastSessionData: null as any,
    }),
    actions: {
        // ---------------------- FETCHING METHODS ----------------------
        async hydrateFromBetterAuth() {
            // Prevent duplicate session calls
            if (this._sessionLoaded) {
                console.log("[Auth] Session already loaded, skipping duplicate call")
                return true
            }

            try {
                const session = await getSession()
                const data = session?.data as any

                if (!data?.user) {
                    console.warn("[Auth] Session hydration failed - no user data found")
                    return false
                }

                // Store session data for sharing with other stores
                this._lastSessionData = session

                const userData = data.user || {}
                this.email = userData.email || ""
                this.id = userData.id || ""
                this.currentPlan = userData.plan || ""
                this.firstName = userData.firstName || ""
                this.lastName = userData.lastName || ""
                this.profilePicture = userData.image || ""
                this.role = userData.role || ""
                this.defaultCollection = userData.defaultCollection || ""
                this.isAdmin = userData.role === "admin" || userData.role === "superadmin"
                this.ragAPIKey = userData.ragAPIKey || ""
                this.session = data.session || {}
                this.models = userData.models || []

                // Check if we're in an impersonation session
                this.isImpersonating = !!data.session?.impersonatedBy

                // Mark session as loaded
                this._sessionLoaded = true

                // Load critical data immediately
                await this.loadCriticalData()

                // Load non-critical data in background
                this.loadBackgroundData()

                this.isLoading = false
                return true
            } catch (error) {
                console.error("[Auth] Session hydration error:", error)
                return false
            }
        },

        // Load critical data that's needed immediately
        async loadCriticalData() {
            try {
                // Get Organizations (needed for navigation)
                const organizations = await organizationService.listOrganizations()
                const organizationStore = useOrganizationStore()
                if (organizations && organizations.length > 0) {
                    organizationStore.organizations = organizations
                    organizationStore.currentOrganization = organizations[0]
                    organizationStore.currentOrganizationId = organizations[0].id
                }
            } catch (error) {
                console.error("[Auth] Error loading organizations:", error)
            }
        },

        // Load non-critical data in background
        async loadBackgroundData() {
            // Load user settings
            this.loadUserSettings()

            // Load RAG token
            this.loadRagToken()

            // Load integrations
            this.loadIntegrations()

            // Load timezone
            this.timezone = getUserTimezone()
        },

        // Load user settings asynchronously
        async loadUserSettings() {
            // Prevent duplicate API calls
            if (this._settingsLoaded) {
                console.log("[User] Settings already loaded, skipping duplicate call")
                return
            }

            try {
                const { getUserSettings } = useUser()
                const userSettings: any = await getUserSettings()
                if (userSettings) {
                    this.settings.increasedFontSize = !!userSettings.increasedFontSize
                    this.settings.showTokenUsage = !!userSettings.showTokenUsage
                    this.settings.workbenchWidget = !!userSettings.workbenchWidget
                    this.settings.customNotes = !!userSettings.customNotes
                    this.settings.expandedInputText = !!userSettings.expandedInputText
                    this.settings.templates = !!userSettings.templates
                    this.settings.theme = userSettings.theme || this.settings.theme
                    this.settings.pinSideBar = !!userSettings.pinSideBar
                    this.settings.showFilePreview = !!userSettings.showFilePreview
                    this.settings.fileExplorerViewMode = userSettings.fileExplorerViewMode || this.settings.fileExplorerViewMode
                    this._settingsLoaded = true
                }
            } catch (error) {
                console.error("Error loading user settings:", error)
            }
        },

        // Load RAG token asynchronously
        async loadRagToken() {
            try {
                const { getRagToken } = useUser()
                this.ragToken = await getRagToken(true)
            } catch (error) {
                console.error("Error loading RAG token:", error)
            }
        },

        // Load integrations asynchronously
        async loadIntegrations() {
            // Prevent duplicate API calls
            if (this._integrationsLoaded) {
                console.log("[User] Integrations already loaded, skipping duplicate call")
                return
            }

            try {
                const { getAPIKeys } = useUser()
                const userApiKeys = await getAPIKeys()
                if (userApiKeys) {
                    // New structure: userApiKeys is { serviceId: { service, name, connected, fields: [...] } }
                    this.apiKeys = userApiKeys
                    // Also store in integrations for backward compatibility with OAuth integrations
                    // OAuth integrations (like Google) are stored separately
                    this._integrationsLoaded = true
                }
            } catch (error) {
                console.error("Error loading integrations:", error)
            }
        },
        // ---------------------- LOGICAL METHODS ----------------------
        updateUserGroup(role: TUserRole) {
            this.role = role
        },

        // Reset cache flags (useful for refresh scenarios)
        resetCacheFlags() {
            this._sessionLoaded = false
            this._integrationsLoaded = false
            this._settingsLoaded = false
            this._ragTokenLoaded = false
            this._lastSessionData = null
        },
        flushData() {
            this.createdAt = 0
            this.currentPlan = ""
            this.email = ""
            this.emailVerified = false
            this.firstName = ""
            this.lastName = ""
            this.profilePicture = ""
            this.role = "basic"
            this.settings = {
                increasedFontSize: false,
                showTokenUsage: false,
                workbenchWidget: false,
                customNotes: false,
                expandedInputText: false,
                templates: false,
                theme: "",
                pinSideBar: true,
                showFilePreview: false,
                fileExplorerViewMode: "list",
            }
            this.models = []
            this.updatedAt = 0
            this.session = {}
            this.id = ""
            this.isAdmin = false
            this.integrations = {}
            this.isImpersonating = false
            this.timezone = ""
            this._lastSessionData = null
            return true
        },
    },
    getters: {
        // Get formatted timezone for display
        formattedTimezone: (state) => {
            if (!state.timezone) return "Not detected"
            try {
                const parts = state.timezone.split("/")
                if (parts.length === 2) {
                    const [region, city] = parts
                    return `${city.replace(/_/g, " ")}, ${region}`
                }
                return state.timezone
            } catch {
                return state.timezone
            }
        },
        // Check if timezone is detected
        hasTimezone: (state) => !!state.timezone,
    },
    persist: {
        key: "user",
        paths: ["firstName"],
    },
})
