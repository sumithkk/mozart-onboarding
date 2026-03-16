import { defineStore } from "pinia"
import userService from "~/services/userService"
import { getSession, type OrgOrganization } from "@/services/better-auth"
import type { IModel, ISingleModel } from "@/types/store"

// Models that are free for all users (no subscription required)
const freeAccessModels: string[] = []

export const useModelStore = defineStore("models", {
    state: (): IModel => ({
        models: [],
        userModels: [] as string[], // Array of model IDs the user has access to
        current: {
            AIName: "",
            name: "",
            model: "",
            image: "",
            isThinkingSupported: false,
            isEnabled: false,
            description: "",
        },
        loading: false,
        error: "",
        // Cache flags to prevent duplicate API calls
        _modelsLoaded: false,
        _userModelsLoaded: false,
    }),
    actions: {
        async loadModels(sessionData?: any) {
            // Prevent duplicate API calls
            if (this._modelsLoaded) {
                console.log("[Models] Models already loaded, skipping duplicate call")
                return
            }

            this.loading = true
            this.error = ""

            try {
                // First, load user's accessible models
                // Pass session data if available to avoid duplicate call
                await this.loadUserModels(sessionData)

                // Then, load all available models
                const admin = useAdmin()
                const response = await admin.getAllModels()

                if (response && response.status === "success") {
                    // Transform API response to match our interface
                    const apiModels = response.data || {}
                    const transformedModels: ISingleModel[] = []

                    Object.entries(apiModels).forEach(([provider, providerData]: [string, any]) => {
                        if (providerData.models && Array.isArray(providerData.models)) {
                            providerData.models.forEach((model: any) => {

                                // Check if user has access to this model
                                const isAccessible = freeAccessModels.includes(model.model) || this.userModels.includes(model.model)

                                transformedModels.push({
                                    AIName: provider,
                                    name: model.model_name || model.model,
                                    model: model.model,
                                    image: model.image || "",
                                    isThinkingSupported: model.is_temperature_supported || false,
                                    isEnabled: true, // Default to enabled for API models
                                    description: model.description || "",
                                    accessible: isAccessible, // Add accessible property
                                    // Additional API fields
                                    context_window: model.context_window,
                                    max_output_tokens: model.max_output_tokens,
                                    is_premium_model: model.is_premium_model,
                                    input_token_cost_per_million_tokens: model.input_token_cost_per_million_tokens,
                                    output_token_cost_per_million_tokens: model.output_token_cost_per_million_tokens,
                                    training_data: model.training_data,
                                    max_token_key: model.max_token_key,
                                    capabilities: model.capabilities || [],
                                })
                            })
                        }
                    })

                    this.models = transformedModels
                    this._modelsLoaded = true

                    // Initialize current model if not set
                    if (!this.current.model) {
                        this.initializeCurrent()
                    }
                } else {
                    this.error = response?.message || "Failed to load models"
                }
            } catch (err: any) {
                this.error = err.message || "Failed to load models"
                console.error("Error loading models:", err)
            } finally {
                this.loading = false
            }
        },

        async loadUserModels(sessionData?: any) {
            // Prevent duplicate API calls
            if (this._userModelsLoaded) {
                console.log("[Models] User models already loaded, skipping duplicate call")
                return
            }

            try {
                // Use provided session data if available, otherwise fetch
                let session = sessionData
                if (!session) {
                    session = await getSession()
                }

                const userId = session?.data?.user?.id
                if (userId) {
                    const userModels = (session?.data?.user as any)?.models || []
                    this.userModels = userModels
                    this._userModelsLoaded = true
                }
            } catch (error) {
                console.error("Failed to load user models:", error)
                this.userModels = []
            }
        },

        // Manually set user models (useful when we've just updated them on the server)
        setUserModels(models: string[]) {
            this.userModels = [...models]
            // Update accessible property for all models (only from userModels)
            this.models.forEach((model: any) => {
                model.accessible = this.userModels.includes(model.model)
            })
        },

        // Reset cache flags (useful for refresh scenarios)
        resetCacheFlags() {
            this._modelsLoaded = false
            this._userModelsLoaded = false
        },

        setCurrent(current: ISingleModel) {
            const model = this.models.find((model: ISingleModel) => model.model === current.model)
            if (model) {
                this.current = model
            }
            // Save to localStorage
            localStorage.setItem("currentModel", current.model)
        },

        getCurrent(): ISingleModel {
            // Get model from localStorage
            const savedModelName = localStorage.getItem("currentModel")

            if (savedModelName) {
                // Find the model in the models array
                const savedModel = this.models.find((model: ISingleModel) => model.model === savedModelName)
                // Only use saved model if it's accessible (in userModels)
                if (savedModel && savedModel.accessible) {
                    this.current = savedModel
                    return this.current
                }
            }

            // Fallback to first accessible model if no saved model or saved model not accessible
            if (!this.current || !this.current.model || !this.current.accessible) {
                const firstAccessibleModel = this.models.find((model: ISingleModel) => model.accessible)
                if (firstAccessibleModel) {
                    this.current = firstAccessibleModel
                    // Save the default model to localStorage
                    localStorage.setItem("currentModel", this.current.model)
                }
            }
            return this.current
        },

        // Initialize the current model from localStorage on store creation
        initializeCurrent() {
            this.getCurrent()
        },

        // Get models by provider
        getModelsByProvider(provider: string): ISingleModel[] {
            return this.models.filter((model: ISingleModel) => model.AIName === provider)
        },

        // Get enabled models
        getEnabledModels(): ISingleModel[] {
            return this.models.filter((model: ISingleModel) => model.isEnabled)
        },

        // Get accessible models (models user has access to)
        getAccessibleModels(): ISingleModel[] {
            return this.models.filter((model: ISingleModel) => model.accessible)
        },

        // Get inaccessible models (models user doesn't have access to)
        getInaccessibleModels(): ISingleModel[] {
            return this.models.filter((model: ISingleModel) => !model.accessible)
        },

        // Check if user has access to a specific model
        hasAccessToModel(modelId: string): boolean {
            return this.userModels.includes(modelId)
        },

        // Refresh models from API
        async refreshModels() {
            await this.loadModels()
        },

        // Refresh only user models
        async refreshUserModels() {
            await this.loadUserModels()
            // Update accessible property for all models
            this.models.forEach((model) => {
                model.accessible = this.userModels.includes(model.model)
            })
        },
    },
})
