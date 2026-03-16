<template>
    <div class="flex h-full flex-col" style="background-color: var(--surfaceColor)">
        <!-- Header -->
        <div class="flex-shrink-0 border-b px-6 py-4" style="border-color: var(--strokeColor); background-color: var(--backgroundColor)">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="materialSymbolsOutlined text-2xl" style="color: var(--logoColor)">smart_toy</div>
                    <div>
                        <h1 class="text-xl font-semibold" style="color: var(--textColor)">Model Management</h1>
                        <p class="text-sm" style="color: var(--textColorSecondary)">Manage AI models across different providers</p>
                    </div>
                </div>
                <button @click="showCreateModal = true" class="flex items-center gap-2 rounded-lg px-4 py-2 shadow-sm transition-colors" style="background-color: var(--logoColor); color: white">
                    <div class="materialSymbolsOutlined text-sm">add</div>
                    Add Model
                </button>
            </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-hidden">
            <!-- Loading State -->
            <div v-if="modelStore.loading" class="flex h-full items-center justify-center">
                <div class="text-center">
                    <div class="materialSymbolsOutlined mb-4 animate-spin text-4xl" style="color: var(--unselectedColor)">sync</div>
                    <div class="text-lg" style="color: var(--textColorSecondary)">Loading models...</div>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="modelStore.error" class="flex h-full items-center justify-center">
                <div class="max-w-md rounded-lg p-6 text-center" style="background-color: var(--accent-red-500); color: var(--primaryColor)">
                    <div class="materialSymbolsOutlined mb-4 text-4xl" style="color: var(--primaryColor)">error</div>
                    <h3 class="mb-2 text-lg font-medium" style="color: var(--primaryColor)">Error Loading Models</h3>
                    <p style="color: var(--primaryColor)">{{ modelStore.error }}</p>
                    <button @click="loadModels" class="mt-4 rounded-lg px-4 py-2 transition-colors" style="background-color: var(--primaryColor); color: var(--accent-red-500)">Try Again</button>
                </div>
            </div>

            <!-- Models List -->
            <div v-else class="h-full overflow-y-auto p-6">
                <div v-if="Object.keys(groupedModels).length === 0" class="flex h-full items-center justify-center">
                    <div class="text-center">
                        <div class="materialSymbolsOutlined mb-4 text-6xl" style="color: var(--unselectedColor)">smart_toy</div>
                        <h3 class="mb-2 text-lg font-medium" style="color: var(--textColorSecondary)">No Models Found</h3>
                        <p class="mb-4" style="color: var(--textColorSecondary)">Get started by adding your first AI model</p>
                        <button @click="showCreateModal = true" class="rounded-lg px-4 py-2 transition-colors" style="background-color: var(--logoColor); color: white">Add Your First Model</button>
                    </div>
                </div>

                <div v-else class="space-y-6">
                    <div v-for="(providerModels, provider) in groupedModels" :key="provider" class="rounded-lg border shadow-sm" style="border-color: var(--strokeColor); background-color: var(--backgroundColor)">
                        <!-- Provider Header -->
                        <div class="border-b px-6 py-4" style="border-color: var(--strokeColor)">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="flex h-8 w-8 items-center justify-center rounded-full" style="background-color: var(--logoColor); opacity: 0.1">
                                        <div class="materialSymbolsOutlined" style="color: var(--logoColor)">{{ getProviderIcon(String(provider)) }}</div>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold" style="color: var(--textColor)">{{ provider }}</h3>
                                        <p class="text-sm" style="color: var(--textColorSecondary)">{{ providerModels.length || 0 }} models</p>
                                    </div>
                                </div>
                                <button @click="showCreateModal = true" class="rounded-lg border px-3 py-1.5 text-sm transition-colors" style="border-color: var(--strokeColor); color: var(--textColor)">Add Model</button>
                            </div>
                        </div>

                        <!-- Models Grid -->
                        <div class="p-6">
                            <div v-if="providerModels && providerModels.length > 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div v-for="model in providerModels" :key="model.model" class="group relative rounded-lg border p-4 transition-all hover:shadow-md" style="border-color: var(--strokeColor); background-color: var(--sideBarBackgroundColor)">
                                    <!-- Model Header -->
                                    <div class="mb-3">
                                        <div class="flex items-start justify-between">
                                            <div class="min-w-0 flex-1">
                                                <h4 class="truncate font-medium" style="color: var(--textColor)">{{ model.name }}</h4>
                                                <p class="truncate font-mono text-sm" style="color: var(--textColorSecondary)">{{ model.model }}</p>
                                            </div>
                                            <div class="ml-2 flex items-center gap-1">
                                                <button @click="editModel(String(provider), model)" class="rounded p-1.5 transition-colors" style="color: var(--unselectedColor)" title="Edit Model">
                                                    <div class="materialSymbolsOutlined text-sm">edit</div>
                                                </button>
                                                <button @click="deleteModel(String(provider), model.model)" class="rounded p-1.5 transition-colors" style="color: var(--accent-red-500)" title="Delete Model">
                                                    <div class="materialSymbolsOutlined text-sm">delete</div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Model Description -->
                                    <p v-if="model.description" class="mb-3 line-clamp-2 text-sm" style="color: var(--textColorSecondary)">{{ model.description }}</p>

                                    <!-- Model Stats -->
                                    <div class="space-y-2">
                                        <div class="flex justify-between text-xs">
                                            <span style="color: var(--textColorSecondary)">Context:</span>
                                            <span class="font-medium" style="color: var(--textColor)">{{ (model.context_window || 0).toLocaleString() }}</span>
                                        </div>
                                        <div class="flex justify-between text-xs">
                                            <span style="color: var(--textColorSecondary)">Max Output:</span>
                                            <span class="font-medium" style="color: var(--textColor)">{{ (model.max_output_tokens || 0).toLocaleString() }}</span>
                                        </div>
                                        <div class="flex justify-between text-xs">
                                            <span style="color: var(--textColorSecondary)">Input Cost:</span>
                                            <span class="font-medium" style="color: var(--textColor)">${{ (model.input_token_cost_per_million_tokens || 0).toFixed(2) }}/1M</span>
                                        </div>
                                        <div class="flex justify-between text-xs">
                                            <span style="color: var(--textColorSecondary)">Output Cost:</span>
                                            <span class="font-medium" style="color: var(--textColor)">${{ (model.output_token_cost_per_million_tokens || 0).toFixed(2) }}/1M</span>
                                        </div>
                                    </div>

                                    <!-- Capabilities -->
                                    <div v-if="model.capabilities && model.capabilities.length > 0" class="mt-3">
                                        <div class="mb-1 text-xs" style="color: var(--textColorSecondary)">Capabilities:</div>
                                        <div class="flex flex-wrap gap-1">
                                            <span v-for="capability in model.capabilities" :key="capability" class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium" style="background-color: var(--logoColor); color: white">
                                                {{ getCapabilityLabel(capability) }}
                                            </span>
                                        </div>
                                    </div>

                                    <!-- Premium Badge -->
                                    <div v-if="model.is_premium_model" class="mt-3">
                                        <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium" style="background-color: var(--accent-amber-500); color: var(--primaryColor)">
                                            <div class="materialSymbolsOutlined mr-1 text-xs">star</div>
                                            Premium
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="py-8 text-center">
                                <div class="materialSymbolsOutlined mb-3 text-4xl" style="color: var(--unselectedColor)">smart_toy</div>
                                <p style="color: var(--textColorSecondary)">No models found for this provider</p>
                                <button @click="showCreateModal = true" class="mt-3 rounded-lg px-4 py-2 transition-colors" style="background-color: var(--logoColor); color: white">Add Model</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create/Edit Model Modal -->
        <div v-if="showCreateModal || showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background-color: rgba(0, 0, 0, 0.5)">
            <div class="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg shadow-xl" style="background-color: var(--backgroundColor)">
                <!-- Modal Header -->
                <div class="sticky top-0 left-0 z-10 flex items-center justify-between border-b px-6 py-4" style="border-color: var(--strokeColor); background-color: var(--backgroundColor)">
                    <div>
                        <h3 class="text-xl font-semibold" style="color: var(--textColor)">
                            {{ showEditModal ? "Edit Model" : "Create New Model" }}
                        </h3>
                        <p class="mt-1 text-sm" style="color: var(--textColorSecondary)">
                            {{ showEditModal ? "Update model configuration and settings" : "Add a new AI model to the system" }}
                        </p>
                    </div>
                    <button @click="closeModal" class="rounded-lg p-2 transition-all duration-200 focus:ring-2 focus:outline-none" style="color: var(--unselectedColor)">
                        <div class="materialSymbolsOutlined">close</div>
                    </button>
                </div>

                <!-- Modal Content -->
                <div class="p-6">
                    <form @submit.prevent="showEditModal ? updateModelData() : createModelData()" class="space-y-8">
                        <!-- Basic Information -->
                        <div class="space-y-6">
                            <div class="border-b pb-2" style="border-color: var(--strokeColor)">
                                <h4 class="text-lg font-semibold" style="color: var(--textColor)">Basic Information</h4>
                                <p class="mt-1 text-sm" style="color: var(--textColorSecondary)">Core model details and identification</p>
                            </div>

                            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: var(--textColor)">AI Provider</label>
                                    <input v-model="formData.AIProvider" type="text" required :disabled="showEditModal" class="w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none" style="border-color: var(--strokeColor); background-color: var(--sideBarBackgroundColor); color: var(--textColor)" placeholder="e.g., OpenAI, Claude, Gemini" />
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: var(--textColor)">Model ID</label>
                                    <input v-model="formData.model" type="text" required :disabled="showEditModal" class="w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none" style="border-color: var(--strokeColor); background-color: var(--sideBarBackgroundColor); color: var(--textColor)" placeholder="e.g., gpt-4-turbo" />
                                </div>
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: var(--textColor)">Model Name</label>
                                <input v-model="formData.model_name" type="text" required class="w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none" style="border-color: var(--strokeColor); background-color: var(--sideBarBackgroundColor); color: var(--textColor)" placeholder="e.g., GPT-4 Turbo" />
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: var(--textColor)">Description</label>
                                <textarea v-model="formData.description" rows="3" class="w-full resize-none rounded-lg border px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none" style="border-color: var(--strokeColor); background-color: var(--sideBarBackgroundColor); color: var(--textColor)" placeholder="Model description..."></textarea>
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: var(--textColor)">Model Image URL</label>
                                <input v-model="formData.image" type="url" class="w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none" style="border-color: var(--strokeColor); background-color: var(--sideBarBackgroundColor); color: var(--textColor)" placeholder="https://example.com/model-image.png" />
                                <p class="text-xs" style="color: var(--textColorSecondary)">Optional: URL to the model's icon or logo image</p>
                            </div>
                        </div>

                        <!-- Model Specifications -->
                        <div class="space-y-6">
                            <div class="border-b pb-2" style="border-color: var(--strokeColor)">
                                <h4 class="text-lg font-semibold" style="color: var(--textColor)">Model Specifications</h4>
                                <p class="mt-1 text-sm" style="color: var(--textColorSecondary)">Technical capabilities and limits</p>
                            </div>

                            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: var(--textColor)">Context Window</label>
                                    <input v-model.number="formData.context_window" type="number" required class="w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none" style="border-color: var(--strokeColor); background-color: var(--sideBarBackgroundColor); color: var(--textColor)" placeholder="e.g., 128000" />
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: var(--textColor)">Max Output Tokens</label>
                                    <input v-model.number="formData.max_output_tokens" type="number" required class="w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none" style="border-color: var(--strokeColor); background-color: var(--sideBarBackgroundColor); color: var(--textColor)" placeholder="e.g., 4096" />
                                </div>
                            </div>
                        </div>

                        <!-- Pricing -->
                        <div class="space-y-6">
                            <div class="border-b pb-2" style="border-color: var(--strokeColor)">
                                <h4 class="text-lg font-semibold" style="color: var(--textColor)">Pricing</h4>
                                <p class="mt-1 text-sm" style="color: var(--textColorSecondary)">Token costs and pricing information</p>
                            </div>

                            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: var(--textColor)">Input Token Cost (per 1M)</label>
                                    <input v-model.number="formData.input_token_cost_per_million_tokens" type="number" step="1" class="w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none" style="border-color: var(--strokeColor); background-color: var(--sideBarBackgroundColor); color: var(--textColor)" placeholder="e.g., 30" />
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: var(--textColor)">Output Token Cost (per 1M)</label>
                                    <input v-model.number="formData.output_token_cost_per_million_tokens" type="number" step="1" class="w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none" style="border-color: var(--strokeColor); background-color: var(--sideBarBackgroundColor); color: var(--textColor)" placeholder="e.g., 60" />
                                </div>
                            </div>
                        </div>

                        <!-- Capabilities -->
                        <div class="space-y-6">
                            <div class="border-b pb-2" style="border-color: var(--strokeColor)">
                                <h4 class="text-lg font-semibold" style="color: var(--textColor)">Capabilities</h4>
                                <p class="mt-1 text-sm" style="color: var(--textColorSecondary)">Model features and supported content types</p>
                            </div>

                            <div class="space-y-2">
                                <label class="mb-4 block text-sm font-medium" style="color: var(--textColor)">Model Capabilities</label>
                                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors" style="border-color: var(--strokeColor)">
                                        <input v-model="formData.capabilities" type="checkbox" value="text" class="rounded focus:ring-2" style="border-color: var(--strokeColor); color: var(--logoColor)" />
                                        <span class="text-sm font-medium" style="color: var(--textColor)">Text Processing</span>
                                    </label>
                                    <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors" style="border-color: var(--strokeColor)">
                                        <input v-model="formData.capabilities" type="checkbox" value="image" class="rounded focus:ring-2" style="border-color: var(--strokeColor); color: var(--logoColor)" />
                                        <span class="text-sm font-medium" style="color: var(--textColor)">Image Analysis</span>
                                    </label>
                                    <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors" style="border-color: var(--strokeColor)">
                                        <input v-model="formData.capabilities" type="checkbox" value="pdf" class="rounded focus:ring-2" style="border-color: var(--strokeColor); color: var(--logoColor)" />
                                        <span class="text-sm font-medium" style="color: var(--textColor)">PDF Processing</span>
                                    </label>
                                    <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors" style="border-color: var(--strokeColor)">
                                        <input v-model="formData.capabilities" type="checkbox" value="pdf_with_images" class="rounded focus:ring-2" style="border-color: var(--strokeColor); color: var(--logoColor)" />
                                        <span class="text-sm font-medium" style="color: var(--textColor)">PDF with Images</span>
                                    </label>
                                    <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors" style="border-color: var(--strokeColor)">
                                        <input v-model="formData.capabilities" type="checkbox" value="handwriting" class="rounded focus:ring-2" style="border-color: var(--strokeColor); color: var(--logoColor)" />
                                        <span class="text-sm font-medium" style="color: var(--textColor)">Handwriting Recognition</span>
                                    </label>
                                    <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors" style="border-color: var(--strokeColor)">
                                        <input v-model="formData.capabilities" type="checkbox" value="code" class="rounded focus:ring-2" style="border-color: var(--strokeColor); color: var(--logoColor)" />
                                        <span class="text-sm font-medium" style="color: var(--textColor)">Code Generation</span>
                                    </label>
                                    <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors" style="border-color: var(--strokeColor)">
                                        <input v-model="formData.capabilities" type="checkbox" value="audio" class="rounded focus:ring-2" style="border-color: var(--strokeColor); color: var(--logoColor)" />
                                        <span class="text-sm font-medium" style="color: var(--textColor)">Audio Processing</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Additional Settings -->
                        <div class="space-y-6">
                            <div class="border-b pb-2" style="border-color: var(--strokeColor)">
                                <h4 class="text-lg font-semibold" style="color: var(--textColor)">Additional Settings</h4>
                                <p class="mt-1 text-sm" style="color: var(--textColorSecondary)">Advanced configuration options</p>
                            </div>

                            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: var(--textColor)">Training Data</label>
                                    <input v-model="formData.training_data" type="text" class="w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none" style="border-color: var(--strokeColor); background-color: var(--sideBarBackgroundColor); color: var(--textColor)" placeholder="e.g., Up to Dec 2023" />
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: var(--textColor)">Max Token Key</label>
                                    <input v-model="formData.max_token_key" type="text" class="w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none" style="border-color: var(--strokeColor); background-color: var(--sideBarBackgroundColor); color: var(--textColor)" placeholder="e.g., max_tokens" />
                                </div>
                            </div>

                            <div class="space-y-4">
                                <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors" style="border-color: var(--strokeColor)">
                                    <input v-model="formData.is_premium_model" type="checkbox" class="rounded focus:ring-2" style="border-color: var(--strokeColor); color: var(--logoColor)" />
                                    <div>
                                        <span class="text-sm font-medium" style="color: var(--textColor)">Premium Model</span>
                                        <p class="text-xs" style="color: var(--textColorSecondary)">Mark this model as premium for special pricing</p>
                                    </div>
                                </label>
                                <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors" style="border-color: var(--strokeColor)">
                                    <input v-model="formData.is_temperature_supported" type="checkbox" class="rounded focus:ring-2" style="border-color: var(--strokeColor); color: var(--logoColor)" />
                                    <div>
                                        <span class="text-sm font-medium" style="color: var(--textColor)">Temperature Supported</span>
                                        <p class="text-xs" style="color: var(--textColorSecondary)">Enable temperature control for response creativity</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Modal Footer -->
                        <div class="flex justify-end gap-4 border-t pt-6" style="border-color: var(--strokeColor)">
                            <button type="button" @click="closeModal" class="rounded-lg border px-6 py-3 transition-all duration-200 focus:ring-2 focus:outline-none" style="border-color: var(--strokeColor); color: var(--textColor)">Cancel</button>
                            <button type="submit" :disabled="submitting" class="rounded-lg px-6 py-3 transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50" style="background-color: var(--logoColor); color: white">
                                <div v-if="submitting" class="flex items-center gap-2">
                                    <div class="materialSymbolsOutlined animate-spin text-sm">sync</div>
                                    Saving...
                                </div>
                                <span v-else>{{ showEditModal ? "Update Model" : "Create Model" }}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, reactive, computed } from "vue"

    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    useHead({
        title: "Model Management - Admin",
    })

    const admin = useAdmin()
    const modelStore = useModelStore()

    // State
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const submitting = ref(false)
    const editingModel = ref<any>(null)

    const formData = reactive({
        AIProvider: "",
        model: "",
        model_name: "",
        description: "",
        context_window: 0,
        max_output_tokens: 0,
        is_premium_model: false,
        input_token_cost_per_million_tokens: null,
        output_token_cost_per_million_tokens: null,
        training_data: "",
        is_temperature_supported: false,
        max_token_key: "",
        capabilities: [] as string[],
        image: "", // Added image field
    })

    // Computed
    const groupedModels = computed(() => {
        const grouped: { [key: string]: ISingleModel[] } = {}
        modelStore.models.forEach((model: ISingleModel) => {
            if (!grouped[model.AIName]) {
                grouped[model.AIName] = []
            }
            grouped[model.AIName].push(model)
        })
        return grouped
    })

    // Methods
    const loadModels = async () => {
        await modelStore.loadModels()
    }

    const resetForm = () => {
        Object.assign(formData, {
            AIProvider: "",
            model: "",
            model_name: "",
            description: "",
            image: "",
            context_window: 0,
            max_output_tokens: 0,
            is_premium_model: false,
            input_token_cost_per_million_tokens: null,
            output_token_cost_per_million_tokens: null,
            training_data: "",
            is_temperature_supported: false,
            max_token_key: "",
            capabilities: [],
        })
    }

    const closeModal = () => {
        showCreateModal.value = false
        showEditModal.value = false
        editingModel.value = null
        resetForm()
    }

    const editModel = (provider: string, model: any) => {
        editingModel.value = { provider, model: model.model }
        console.log(model)
        Object.assign(formData, {
            AIProvider: provider,
            model: model.model,
            model_name: model.name,
            description: model.description,
            image: model.image || "",
            context_window: model.context_window,
            max_output_tokens: model.max_output_tokens,
            is_premium_model: model.is_premium_model,
            input_token_cost_per_million_tokens: model.input_token_cost_per_million_tokens,
            output_token_cost_per_million_tokens: model.output_token_cost_per_million_tokens,
            training_data: model.training_data || "",
            is_temperature_supported: model.is_temperature_supported || false,
            max_token_key: model.max_token_key || "",
            capabilities: model.capabilities || [],
        })
        showEditModal.value = true
    }

    const createModelData = async () => {
        submitting.value = true

        try {
            const response = await admin.createModel(formData.AIProvider, formData)
            if (response && response.status === "success") {
                closeModal()
                await modelStore.refreshModels()
            }
        } catch (err: any) {
            console.error("Failed to create model:", err)
        } finally {
            submitting.value = false
        }
    }

    const updateModelData = async () => {
        if (!editingModel.value) return

        submitting.value = true

        try {
            const response = await admin.updateModel(editingModel.value.provider, editingModel.value.model, formData)
            if (response && response.status === "success") {
                closeModal()
                // await modelStore.refreshModels()
            }
        } catch (err: any) {
            console.error("Failed to update model:", err)
        } finally {
            submitting.value = false
        }
    }

    const deleteModel = async (provider: string, modelId: string) => {
        if (!confirm(`Are you sure you want to delete the model "${modelId}"?`)) {
            return
        }

        try {
            const response = await admin.deleteModel(provider, modelId)
            if (response && response.status === "success") {
                await modelStore.refreshModels()
            }
        } catch (err: any) {
            console.error("Failed to delete model:", err)
        }
    }

    const getProviderIcon = (provider: string) => {
        const icons: { [key: string]: string } = {
            OpenAI: "smart_toy",
            Claude: "psychology",
            Gemini: "auto_awesome",
            Mistral: "cloud",
            Cohere: "hub",
        }
        return icons[provider] || "smart_toy"
    }

    const getCapabilityLabel = (capability: string) => {
        const labels: { [key: string]: string } = {
            text: "Text",
            image: "Image",
            pdf: "PDF",
            pdf_with_images: "PDF+Images",
            handwriting: "Handwriting",
            code: "Code",
            audio: "Audio",
        }
        return labels[capability] || capability
    }

    // Lifecycle
    onMounted(() => {
        // Models are already loaded by the layout, but refresh if needed
        if (modelStore.models.length === 0) {
            loadModels()
        }
    })
</script>

<style scoped>
    .materialSymbolsOutlined {
        font-family: "Material Symbols Outlined";
        font-weight: normal;
        font-style: normal;
        font-size: 24px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        -webkit-font-feature-settings: "liga";
        -webkit-font-smoothing: antialiased;
    }

    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* Form styling improvements */
    input:focus,
    textarea:focus {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: var(--logoColor) !important;
    }

    /* Checkbox styling improvements */
    input[type="checkbox"] {
        transition: all 0.2s ease;
    }

    input[type="checkbox"]:checked {
        transform: scale(1.1);
    }

    /* Section header styling */
    .border-b {
        position: relative;
    }

    .border-b::after {
        content: "";
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--strokeColor), transparent);
    }

    /* Modal improvements */
    .max-h-\[90vh\] {
        max-height: 90vh;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--strokeColor) transparent;
    }

    .max-h-\[90vh\]::-webkit-scrollbar {
        width: 6px;
    }

    .max-h-\[90vh\]::-webkit-scrollbar-track {
        background: transparent;
    }

    .max-h-\[90vh\]::-webkit-scrollbar-thumb {
        background-color: var(--strokeColor);
        border-radius: 3px;
    }

    .max-h-\[90vh\]::-webkit-scrollbar-thumb:hover {
        background-color: var(--primaryColor);
    }

    /* Responsive improvements */
    @media (max-width: 768px) {
        .lg\:grid-cols-2 {
            grid-template-columns: 1fr;
        }

        .lg\:grid-cols-3 {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 640px) {
        .sm\:grid-cols-2 {
            grid-template-columns: 1fr;
        }

        .lg\:grid-cols-3 {
            grid-template-columns: 1fr;
        }
    }
</style>
