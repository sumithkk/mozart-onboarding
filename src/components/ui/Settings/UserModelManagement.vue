<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background-color: rgba(0, 0, 0, 0.5)">
        <div class="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg shadow-xl" style="background-color: var(--backgroundColor)">
            <!-- Modal Header -->
            <div class="sticky top-0 left-0 z-10 flex items-center justify-between border-b px-6 py-4" style="border-color: var(--strokeColor); background-color: var(--backgroundColor)">
                <div>
                    <h3 class="text-xl font-semibold" style="color: var(--textColor)">Manage User Models</h3>
                    <p class="mt-1 text-sm" style="color: var(--textColorSecondary)">Configure AI model access for {{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</p>
                </div>
                <button @click="$emit('update:show', false)" class="rounded-lg p-2 transition-all duration-200 focus:ring-2 focus:outline-none" style="color: var(--unselectedColor)">
                    <span class="material-icons">close</span>
                </button>
            </div>

            <!-- Modal Content -->
            <div class="p-6">
                <!-- User Info -->
                <div class="mb-6 rounded-lg border p-4" style="border-color: var(--strokeColor); background-color: var(--surfaceColor)">
                    <div class="flex items-center gap-4">
                        <div class="relative">
                            <img v-if="selectedUser?.profilePicture" :src="selectedUser.profilePicture" alt="Profile" class="h-12 w-12 rounded-full object-cover" />
                            <InitialAvatar v-else :name="selectedUser?.firstName || ''" size="48" />
                        </div>
                        <div>
                            <h4 class="text-lg font-medium" style="color: var(--textColor)">{{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</h4>
                            <p class="text-sm" style="color: var(--textColorSecondary)">
                                {{ selectedUser?.email }}
                            </p>
                            <p class="text-xs" style="color: var(--textColorSecondary)">Current access: {{ userModels.length }} models</p>
                        </div>
                    </div>
                </div>

                <!-- Models Selection -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h4 class="text-lg font-semibold" style="color: var(--textColor)">Available Models</h4>
                        <div class="flex items-center gap-2">
                            <button @click="selectAllModels" class="rounded px-3 py-1 text-sm transition-colors" style="background-color: var(--logoColor); color: var(--primaryColor)">Select All</button>
                            <button @click="deselectAllModels" class="rounded border px-3 py-1 text-sm transition-colors" style="border-color: var(--strokeColor); color: var(--textColor)">Deselect All</button>
                        </div>
                    </div>

                    <!-- Loading State -->
                    <div v-if="isLoading" class="flex items-center justify-center py-8">
                        <ComponentLoading />
                    </div>

                    <!-- Models List -->
                    <div v-else class="max-h-96 overflow-y-auto">
                        <div v-if="availableModels.length === 0" class="py-8 text-center">
                            <span class="material-icons mb-2 text-4xl" style="color: var(--unselectedColor)">smart_toy</span>
                            <p style="color: var(--textColorSecondary)">No models available</p>
                        </div>

                        <div v-else class="space-y-2">
                            <div v-for="model in availableModels" :key="model.model" class="flex items-center justify-between rounded-lg border p-3 transition-all hover:shadow-sm" style="border-color: var(--strokeColor); background-color: var(--sideBarBackgroundColor)">
                                <div class="flex items-center gap-3">
                                    <input type="checkbox" :id="model.model" :value="model.model" v-model="selectedModels" class="focus:ring-opacity-50 h-4 w-4 rounded border-2 transition-all duration-200 focus:ring-2" style="border-color: var(--strokeColor); accent-color: var(--logoColor); focus:ring-color: var(--logoColor)" />
                                    <div>
                                        <label :for="model.model" class="cursor-pointer font-medium" style="color: var(--textColor)">
                                            {{ model.name || model.model }}
                                        </label>
                                        <p class="text-sm" style="color: var(--textColorSecondary)">{{ model.AIName }} • {{ model.model }}</p>
                                        <p v-if="model.description" class="mt-1 line-clamp-2 text-xs" style="color: var(--textColorSecondary)">
                                            {{ model.description }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span v-if="model.is_premium_model" class="rounded-full px-2 py-1 text-xs font-medium" style="background-color: var(--accent-yellow-500); color: var(--primaryColor)"> Premium </span>
                                    <span class="text-xs" style="color: var(--textColorSecondary)"> {{ model.context_window?.toLocaleString() || "N/A" }} tokens </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="mt-6 flex items-center justify-end gap-3 border-t pt-4" style="border-color: var(--strokeColor)">
                    <button @click="$emit('update:show', false)" class="rounded-lg border px-4 py-2 transition-colors" style="border-color: var(--strokeColor); color: var(--textColor)">Cancel</button>
                    <button @click="saveModels" :disabled="isSaving" class="flex items-center gap-2 rounded-lg px-4 py-2 transition-colors" style="background-color: var(--logoColor); color: var(--primaryColor)">
                        <span v-if="isSaving" class="material-icons animate-spin text-sm">sync</span>
                        {{ isSaving ? "Saving..." : "Save Changes" }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import userService from "~/services/userService"
    import eventBus from "~/util/eventBus"

    const props = defineProps({
        show: {
            type: Boolean,
            required: true,
        },
        selectedUser: {
            type: Object as () => IUser,
            required: true,
        },
        availableModels: {
            type: Array as () => any[],
            default: () => [],
        },
        userModels: {
            type: Array as () => string[],
            default: () => [],
        },
    })

    const emit = defineEmits(["update:show", "models-updated"])

    const config = useRuntimeConfig()
    const userServiceInstance = userService(config)

    const selectedModels = ref<string[]>([])
    const isLoading = ref(false)
    const isSaving = ref(false)

    // Watch for changes in userModels prop and update selectedModels
    watch(
        () => props.userModels,
        (newModels) => {
            selectedModels.value = [...newModels]
        },
        { immediate: true }
    )

    function selectAllModels() {
        selectedModels.value = props.availableModels.map((model: any) => model.model)
    }

    function deselectAllModels() {
        selectedModels.value = []
    }

    async function saveModels() {
        if (!props.selectedUser) return

        isSaving.value = true
        try {
            // Get current user models
            const currentModels = props.userModels || []
            const newModels = selectedModels.value

            // Find models to add and remove
            const modelsToAdd = newModels.filter((model: string) => !currentModels.includes(model))
            const modelsToRemove = currentModels.filter((model: string) => !newModels.includes(model))

            // Add new models
            for (const modelId of modelsToAdd) {
                await userServiceInstance.addUserModel(modelId)
            }

            // Remove models (if the API supports it)
            for (const modelId of modelsToRemove) {
                await userServiceInstance.deleteUserModel(modelId)
            }

            // Emit updated models
            emit("models-updated", newModels)
            emit("update:show", false)

            // Show success message
            eventBus.emit("showToast", {
                message: "User models updated successfully",
                _type: "success",
            })
        } catch (error: any) {
            console.error("Failed to update user models:", error)
            eventBus.emit("showToast", {
                message: error.response?.data?.message || "Failed to update user models",
                _type: "error",
            })
        } finally {
            isSaving.value = false
        }
    }
</script>

<style scoped>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
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
