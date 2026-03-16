<template>
    <div class="flex h-full flex-col">
        <!-- Fixed Header Section -->
        <div class="border-b" style="border-color: var(--strokeColor)">
            <div class="container mx-auto px-6 py-6">
                <!-- Single Container with Better Alignment -->
                <div class="flex flex-wrap items-start justify-between gap-4">
                    <!-- Left Side: Title and Description -->
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-3">
                            <div class="rounded-lg p-2">
                                <span class="material-icons text-logoColor text-2xl">smart_toy</span>
                            </div>
                            <div class="flex flex-col">
                                <h1 class="text-textColor text-3xl font-bold">Model Library</h1>
                                <span class="text-textColor text-sm font-medium"></span>
                            </div>
                        </div>
                        <p class="text-textColoSecondary text-base">Manage and select the AI models available for your workspace</p>
                    </div>

                    <!-- Right Side: Filters and Actions -->
                    <div class="flex flex-col gap-3">
                        <!-- First Row: Search, Provider, Type, Sort -->
                        <div class="flex flex-wrap items-center justify-end gap-3">
                            <!-- Search Bar -->
                            <div class="relative">
                                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-textColorSecondary text-lg" aria-hidden="true">search</span>
                                <input
                                    v-model="searchQuery"
                                    type="text"
                                    placeholder="Search Models..."
                                    aria-label="Search models by name or ID"
                                    class="w-64 rounded-lg border bg-transparent py-2 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2"
                                    style="border-color: var(--strokeColor); color: var(--textColor); focus:ring-color: var(--logoColor)"
                                    @keydown.escape="searchQuery = ''"
                                />
                            </div>
                            <!-- Provider Filter -->
                            <div class="flex items-center gap-2">
                                <label for="provider-filter" class="text-sm font-medium whitespace-nowrap" style="color: var(--textColor)">Provider:</label>
                                <select
                                    id="provider-filter"
                                    v-model="selectedProvider"
                                    aria-label="Filter models by provider"
                                    class="rounded-lg border bg-transparent px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2"
                                    style="border-color: var(--strokeColor); color: var(--textColor); focus:ring-color: var(--logoColor)"
                                >
                                    <option value="">All Providers</option>
                                    <option v-for="provider in availableProviders" :key="provider" :value="provider">
                                        {{ provider }}
                                    </option>
                                </select>
                            </div>
                            <!-- Type Filter -->
                            <div class="flex items-center gap-2">
                                <label for="premium-filter" class="text-sm font-medium whitespace-nowrap" style="color: var(--textColor)">Type:</label>
                                <select
                                    id="premium-filter"
                                    v-model="premiumFilter"
                                    aria-label="Filter models by premium or free"
                                    class="rounded-lg border bg-transparent px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2"
                                    style="border-color: var(--strokeColor); color: var(--textColor); focus:ring-color: var(--logoColor)"
                                >
                                    <option value="">All Models</option>
                                    <option value="premium">Premium Only</option>
                                    <option value="free">Free Only</option>
                                </select>
                            </div>
                            <!-- Sort -->
                            <div class="flex items-center gap-2">
                                <label for="sort-select" class="text-sm font-medium whitespace-nowrap" style="color: var(--textColor)">Sort:</label>
                                <select
                                    id="sort-select"
                                    v-model="sortBy"
                                    aria-label="Sort models"
                                    class="rounded-lg border bg-transparent px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2"
                                    style="border-color: var(--strokeColor); color: var(--textColor); focus:ring-color: var(--logoColor)"
                                >
                                    <option value="alphabetical">Alphabetical</option>
                                    <option value="inputTokenCost">Input Token Cost</option>
                                    <option value="outputTokenCost">Output Token Cost</option>
                                    <option value="contextWindow">Context Window</option>
                                </select>
                            </div>
                        </div>

                        <!-- Second Row: Select All / Deselect All -->
                        <div class="flex items-center justify-end">
                            <div class="flex items-center gap-2" role="group" aria-label="Bulk selection actions">
                                <button
                                    @click="selectAllModels"
                                    @keydown.enter="selectAllModels"
                                    @keydown.space.prevent="selectAllModels"
                                    aria-label="Select all filtered models"
                                    class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    style="border-color: var(--strokeColor); background-color: var(--logoColor); color: white; focus:ring-color: var(--logoColor)"
                                >
                                    Select All
                                </button>
                                <button
                                    @click="deselectAllModels"
                                    @keydown.enter="deselectAllModels"
                                    @keydown.space.prevent="deselectAllModels"
                                    aria-label="Deselect all filtered models"
                                    class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    style="border-color: var(--strokeColor); color: var(--textColor); focus:ring-color: var(--logoColor)"
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scrollable Middle Section -->
        <div class="flex-1 overflow-y-auto">
            <div class="container mx-auto px-6 py-8">
                <!-- Loading State -->
                <div v-if="isLoading" class="flex items-center justify-center py-12">
                    <div class="flex items-center gap-2">
                        <span class="material-icons text-logoColor animate-spin">sync</span>
                        <span class="text-textColor">Loading models...</span>
                    </div>
                </div>

                <!-- Models by Provider -->
                <div v-else class="space-y-6">
                    <div v-if="filteredAndSortedModels.length === 0" class="py-12 text-center">
                        <span class="material-icons mb-2 text-4xl" style="color: var(--unselectedColor)">smart_toy</span>
                        <p class="text-lg font-medium" style="color: var(--textColor)">No models found</p>
                        <p class="text-sm" style="color: var(--textColorSecondary)">Try adjusting your search query</p>
                    </div>

                    <!-- Provider Groups -->
                    <div v-for="(providerModels, provider) in groupedModels" :key="provider" class="rounded-lg border p-4" style="border-color: var(--strokeColor); background-color: var(--sideBarBackgroundColor)">
                        <!-- Provider Header -->
                        <div class="mb-4">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <!-- Provider Logo -->
                                    <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg" style="background-color: var(--surfaceColor)">
                                        <img
                                            v-if="getProviderLogo(providerModels)"
                                            :src="getProviderLogo(providerModels)"
                                            :alt="provider"
                                            class="h-8 w-8 object-contain"
                                        />
                                        <span v-else class="material-icons text-logoColor text-2xl">{{ getProviderIcon(provider) }}</span>
                                    </div>
                                    <h3 class="text-lg font-semibold" style="color: var(--textColor)">{{ provider }}</h3>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button
                                        @click="selectProviderModels(provider)"
                                        class="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-90"
                                        style="border-color: var(--strokeColor); background-color: var(--logoColor); color: white"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        @click="deselectProviderModels(provider)"
                                        class="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-90"
                                        style="border-color: var(--strokeColor); color: var(--textColor)"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Models Grid -->
                        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div
                                v-for="model in providerModels"
                                :key="model.model"
                                @click="toggleModelSelection(model.model)"
                                class="group relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md"
                                :style="getModelCardStyle(model)"
                            >
                                <!-- Model Name and Premium Badge with Checkbox -->
                                <div class="mb-2 flex items-start gap-3">
                                    <!-- Checkbox -->
                                    <div class="flex-shrink-0 pt-0.5" @click.stop>
                                        <input
                                            type="checkbox"
                                            :id="model.model"
                                            :value="model.model"
                                            v-model="selectedModels"
                                            @click.stop
                                            class="h-5 w-5 cursor-pointer rounded border-2 transition-all focus:outline-none focus:ring-2"
                                            style="border-color: var(--strokeColor); accent-color: var(--logoColor); focus:ring-color: var(--logoColor)"
                                        />
                                    </div>
                                    <div class="flex-1">
                                        <label :for="model.model" class="cursor-pointer" @click.stop>
                                            <div class="flex items-center gap-2">
                                                <h4 class="text-base font-semibold" style="color: var(--textColor)">
                                                    {{ model.model_name || model.name || model.model }}
                                                </h4>
                                                <span v-if="model.is_premium_model" class="material-icons text-yellow-500 text-lg">star</span>
                                            </div>
                                        </label>
                                        <p class="mt-1 font-mono text-xs" style="color: var(--textColorSecondary)">{{ model.model }}</p>
                                    </div>
                                </div>

                                <!-- Description -->
                                <p v-if="model.description" class="mb-4 line-clamp-2 text-sm" style="color: var(--textColorSecondary)">
                                    {{ model.description }}
                                </p>
                                <p v-else class="mb-4 text-sm italic" style="color: var(--textColorSecondary)">No description available</p>

                                <!-- Divider -->
                                <div class="my-4 border-t" style="border-color: var(--strokeColor)"></div>

                                <!-- Pricing -->
                                <div class="mb-3 space-y-1 text-xs">
                                    <div class="flex items-center justify-between">
                                        <span style="color: var(--textColorSecondary)">Input:</span>
                                        <span class="font-medium" style="color: var(--textColor)">
                                            ${{ formatPrice(model.input_token_cost_per_million_tokens) }}
                                        </span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span style="color: var(--textColorSecondary)">Output:</span>
                                        <span class="font-medium" style="color: var(--textColor)">
                                            ${{ formatPrice(model.output_token_cost_per_million_tokens) }}
                                        </span>
                                    </div>
                                    <p class="text-xs" style="color: var(--textColorSecondary)">per 1M tokens</p>
                                </div>

                                <!-- Divider -->
                                <div class="my-3 border-t" style="border-color: var(--strokeColor)"></div>

                                <!-- Specs -->
                                <div class="space-y-1 text-xs">
                                    <div class="flex items-center justify-between">
                                        <span style="color: var(--textColorSecondary)">Context:</span>
                                        <span class="font-medium" style="color: var(--textColor)">
                                            {{ formatNumber(model.context_window) }}
                                        </span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span style="color: var(--textColorSecondary)">Max Output:</span>
                                        <span class="font-medium" style="color: var(--textColor)">
                                            {{ formatNumber(model.max_output_tokens) }}
                                        </span>
                                    </div>
                                    <p class="text-xs" style="color: var(--textColorSecondary)">tokens</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Fixed Bottom Section -->
        <div class="border-t" style="border-color: var(--strokeColor)">
            <div class="container mx-auto px-6 py-4">
                <div v-if="!isLoading && Array.isArray(availableModels) && availableModels.length > 0" class="flex items-center justify-between gap-3">
                    <!-- Selected Models Count -->
                    <span class="text-sm font-semibold" style="color: var(--textColor)">
                        Models selected: {{ selectedModels.length }}
                    </span>

                    <!-- Action Buttons -->
                    <div class="flex items-center gap-3">
                        <button
                            @click="resetSelection"
                            class="rounded-lg border px-4 py-2 font-medium transition-colors hover:opacity-90"
                            style="border-color: var(--strokeColor); color: var(--textColor)"
                        >
                            Reset
                        </button>
                        <button
                            @click="saveModels"
                            :disabled="isSaving || (modelsToAdd.length === 0 && modelsToRemove.length === 0)"
                            class="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            :style="getSaveButtonStyle()"
                        >
                            <span v-if="isSaving" class="material-icons animate-spin text-sm">sync</span>
                            {{ isSaving ? "Saving..." : "Save Changes" }}
                            <span v-if="!isSaving" class="material-icons text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import eventBus from "~/util/eventBus"
    import { useModelStore } from "~/store/models"
    import { adminService } from "~/services/better-auth/admin"

    // Page meta
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    // Composables
    const userStore = useUserStore()
    const models = useModelStore()
    const modelStore = useModelStore()

    // State: admins see all models; non-admins (e.g. role "user") see only accessible models
    const selectedModels = ref<string[]>([])
    const availableModels = computed(() =>
        userStore.isAdmin ? modelStore.models : modelStore.getAccessibleModels()
    )
    const isLoading = ref(false)
    const isSaving = ref(false)
    const searchQuery = ref("")
    const selectedProvider = ref<string>("")
    const premiumFilter = ref<"" | "premium" | "free">("")
    const sortBy = ref<"alphabetical" | "inputTokenCost" | "outputTokenCost" | "contextWindow">("alphabetical")

    // Watch for changes in modelStore.userModels and update selectedModels
    watch(
        () => modelStore.userModels,
        (newModels) => {
            if (Array.isArray(newModels)) {
                selectedModels.value = [...newModels]
            } else {
                selectedModels.value = []
            }
        },
        { immediate: true }
    )

    // Computed: Get all unique providers from available models
    const availableProviders = computed(() => {
        const providers = new Set<string>()
        const modelsList = availableModels.value
        modelsList.forEach((model: any) => {
            const provider = model.AIProvider || model.AIName || "Other"
            if (provider) {
                providers.add(provider)
            }
        })
        return Array.from(providers).sort()
    })

    // Computed: Filter models based on search query, provider, and premium/free
    const filteredModels = computed(() => {
        let filtered = availableModels.value

        // Search filter
        if (searchQuery.value.trim()) {
            const query = searchQuery.value.toLowerCase().trim()
            filtered = filtered.filter((model: any) => {
                const modelName = (model.model_name || model.name || model.model || "").toLowerCase()
                const modelId = (model.model || "").toLowerCase()
                return modelName.includes(query) || modelId.includes(query)
            })
        }

        // Provider filter
        if (selectedProvider.value) {
            filtered = filtered.filter((model: any) => {
                const provider = model.AIProvider || model.AIName || "Other"
                return provider === selectedProvider.value
            })
        }

        // Premium/Free filter
        if (premiumFilter.value === "premium") {
            filtered = filtered.filter((model: any) => model.is_premium_model === true)
        } else if (premiumFilter.value === "free") {
            filtered = filtered.filter((model: any) => !model.is_premium_model)
        }

        return filtered
    })

    // Computed: Filter models (no sorting here, sorting happens in groupedModels)
    const filteredAndSortedModels = computed(() => {
        return filteredModels.value
    })

    // Helper function to get sort value for a model
    function getSortValue(model: any, sortType: string): number {
        switch (sortType) {
            case "alphabetical":
                return 0 // Not used for alphabetical
            case "inputTokenCost":
                return model.input_token_cost_per_million_tokens ?? Infinity
            case "outputTokenCost":
                return model.output_token_cost_per_million_tokens ?? Infinity
            case "contextWindow":
                return model.context_window ?? Infinity
            default:
                return 0
        }
    }

    // Helper function to sort models within a group
    function sortModelsInGroup(models: any[]): any[] {
        const sorted = [...models]
        
        if (sortBy.value === "alphabetical") {
            sorted.sort((a, b) => {
                const nameA = (a.model_name || a.name || a.model || "").toLowerCase()
                const nameB = (b.model_name || b.name || b.model || "").toLowerCase()
                return nameA.localeCompare(nameB)
            })
        } else {
            sorted.sort((a, b) => {
                const valueA = getSortValue(a, sortBy.value)
                const valueB = getSortValue(b, sortBy.value)
                return valueA - valueB
            })
        }
        
        return sorted
    }

    // Computed: Group models by provider and sort
    const groupedModels = computed(() => {
        const grouped: { [key: string]: any[] } = {}

        filteredAndSortedModels.value.forEach((model: any) => {
            const provider = model.AIProvider || model.AIName || "Other"
            if (!grouped[provider]) {
                grouped[provider] = []
            }
            grouped[provider].push(model)
        })

        // Sort models within each group first
        Object.keys(grouped).forEach((provider) => {
            grouped[provider] = sortModelsInGroup(grouped[provider])
        })

        // Sort providers based on sort criteria
        const sortedProviders: { [key: string]: any[] } = {}
        const providerEntries = Object.entries(grouped)
        
        if (sortBy.value === "alphabetical") {
            providerEntries.sort(([providerA], [providerB]) => {
                return providerA.localeCompare(providerB)
            })
        } else {
            providerEntries.sort(([, modelsA], [, modelsB]) => {
                // Get minimum value from each group
                const minA = Math.min(...modelsA.map((m) => getSortValue(m, sortBy.value)))
                const minB = Math.min(...modelsB.map((m) => getSortValue(m, sortBy.value)))
                return minA - minB
            })
        }

        providerEntries.forEach(([key, value]) => {
            sortedProviders[key] = value
        })

        return sortedProviders
    })

    // Computed properties for changes summary
    const modelsToAdd = computed(() => {
        const currentModels = Array.isArray(modelStore.userModels) ? modelStore.userModels : []
        return selectedModels.value.filter((model: string) => !currentModels.includes(model))
    })

    const modelsToRemove = computed(() => {
        const currentModels = Array.isArray(modelStore.userModels) ? modelStore.userModels : []
        return currentModels.filter((model: string) => !selectedModels.value.includes(model))
    })

    // Methods
    function selectAllModels() {
        if (Array.isArray(filteredModels.value)) {
            filteredModels.value.forEach((model: any) => {
                if (!selectedModels.value.includes(model.model)) {
                    selectedModels.value.push(model.model)
                }
            })
        }
    }

    function deselectAllModels() {
        if (Array.isArray(filteredModels.value)) {
            filteredModels.value.forEach((model: any) => {
                const index = selectedModels.value.indexOf(model.model)
                if (index > -1) {
                    selectedModels.value.splice(index, 1)
                }
            })
        }
    }

    function selectProviderModels(provider: string) {
        const providerModels = groupedModels.value[provider] || []
        providerModels.forEach((model: any) => {
            if (!selectedModels.value.includes(model.model)) {
                selectedModels.value.push(model.model)
            }
        })
    }

    function deselectProviderModels(provider: string) {
        const providerModels = groupedModels.value[provider] || []
        providerModels.forEach((model: any) => {
            const index = selectedModels.value.indexOf(model.model)
            if (index > -1) {
                selectedModels.value.splice(index, 1)
            }
        })
    }

    function resetSelection() {
        selectedModels.value = Array.isArray(modelStore.userModels) ? [...modelStore.userModels] : []
    }

    function isModelSelected(model: any) {
        return selectedModels.value.includes(model.model)
    }

    function toggleModelSelection(modelId: string) {
        const index = selectedModels.value.indexOf(modelId)
        if (index > -1) {
            selectedModels.value.splice(index, 1)
        } else {
            selectedModels.value.push(modelId)
        }
    }

    function getModelCardStyle(model: any) {
        const isSelected = isModelSelected(model)
        return {
            borderColor: isSelected ? "var(--logoColor)" : "var(--strokeColor)",
            backgroundColor: isSelected ? "var(--surfaceColor)" : "var(--sideBarBackgroundColor)",
            boxShadow: isSelected ? "0 0 0 2px var(--logoColor)" : "none",
        }
    }

    function getSaveButtonStyle() {
        const hasChanges = modelsToAdd.value.length > 0 || modelsToRemove.value.length > 0
        return {
            backgroundColor: hasChanges ? "var(--logoColor)" : "var(--unselectedColor)",
            color: hasChanges ? "white" : "var(--textColorSecondary)",
            cursor: hasChanges ? "pointer" : "not-allowed",
        }
    }

    function getModelNames(modelIds: string[]) {
        if (!Array.isArray(availableModels.value)) return modelIds
        return modelIds.map((id) => {
            const model = availableModels.value.find((m) => m.model === id)
            return model ? model.model_name || model.name || model.model : id
        })
    }

    function formatPrice(price: number | null | undefined): string {
        if (price === null || price === undefined) return "N/A"
        return price.toFixed(2)
    }

    function formatNumber(num: number | null | undefined): string {
        if (num === null || num === undefined) return "N/A"
        return num.toLocaleString()
    }

    function getProviderIcon(provider: string): string {
        const icons: { [key: string]: string } = {
            OpenAI: "smart_toy",
            Google: "auto_awesome",
            Anthropic: "psychology",
            Claude: "psychology",
            Gemini: "auto_awesome",
            Mistral: "cloud",
            Cohere: "hub",
            Grok: "auto_awesome",
            Perplexity: "search",
        }
        return icons[provider] || "smart_toy"
    }

    function getProviderLogo(providerModels: any[]): string | null {
        if (providerModels && providerModels.length > 0) {
            const modelWithImage = providerModels.find((m) => m.image)
            return modelWithImage?.image || null
        }
        return null
    }

    async function saveModels() {
        isSaving.value = true
        try {
            const userStore = useUserStore()
            const userId = userStore.id

            if (!userId) {
                throw new Error("User session not found")
            }

            await adminService.updateUser(userId, {
                models: selectedModels.value,
            })

            modelStore.setUserModels(selectedModels.value)

            eventBus.emit("showToast", {
                message: "Your model access has been updated successfully",
                _type: "success",
            })
        } catch (error: any) {
            console.error("Failed to update user models:", error)
            eventBus.emit("showToast", {
                message: error.message || "Failed to update your model access",
                _type: "error",
            })
        } finally {
            isSaving.value = false
        }
    }

    // Initialize data: layout may have already loaded models; ensure store is populated
    onMounted(async () => {
        isLoading.value = true
        try {
            await models.loadModels()
        } catch (error) {
            console.error("Failed to initialize model page:", error)
        } finally {
            isLoading.value = false
        }
    })
</script>

<style scoped>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* Custom checkbox styling */
    input[type="checkbox"]:checked {
        background-color: var(--logoColor);
        border-color: var(--logoColor);
    }

    input[type="checkbox"]:focus {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--logoColor) 20%, transparent);
    }
</style>
