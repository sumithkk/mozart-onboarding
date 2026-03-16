<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
        <div class="relative mx-4 h-[90vh] w-full max-w-md overflow-scroll rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-800" @click.stop v-click-outside="emitClose">
            <!-- Header -->
            <div class="mb-4 flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-neutral-200">Edit User Info</h3>
                <button @click="emitClose" class="text-xl text-gray-800 transition hover:text-gray-500 dark:text-neutral-400 dark:hover:text-neutral-300" :disabled="isSaving">&times;</button>
            </div>

            <!-- Profile Picture -->
            <div class="mb-6 flex justify-center">
                <img v-if="selectedUser?.profilePicture" :src="selectedUser.profilePicture" alt="Profile Picture" class="h-24 w-24 rounded-full border-2 border-white object-cover shadow dark:border-neutral-700" />
                <div v-else class="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-500 dark:bg-neutral-700 dark:text-neutral-300">No Image</div>
            </div>

            <!-- Form -->
            <form>
                <!-- First Name -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-neutral-300">First Name:</label>
                    <input type="text" v-model="editUser.firstName" class="w-full rounded border p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-neutral-900 dark:text-neutral-200 dark:focus:ring-indigo-300" />
                </div>

                <!-- Last Name -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-neutral-300">Last Name:</label>
                    <input type="text" v-model="editUser.lastName" class="w-full rounded border p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-neutral-900 dark:text-neutral-200 dark:focus:ring-indigo-300" />
                </div>

                <!-- Email -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-neutral-300">Email:</label>
                    <input type="email" v-model="editUser.email" class="w-full rounded border p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-neutral-900 dark:text-neutral-200 dark:focus:ring-indigo-300" />
                </div>

                <!-- Role -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-neutral-300">Role:</label>
                    <select v-model="editUser.role" class="w-full rounded border p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-neutral-900 dark:text-neutral-200 dark:focus:ring-indigo-300">
                        <option value="basic">Basic</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <!-- Email Verified -->
                <div class="mb-4 flex items-center">
                    <input type="checkbox" v-model="editUser.emailVerified" class="h-4 w-4 rounded text-indigo-600 focus:ring focus:ring-indigo-300 dark:bg-neutral-900" />
                    <label class="ml-2 text-sm font-medium text-gray-700 dark:text-neutral-300">Email Verified</label>
                </div>

                <!-- Primary Collection -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-neutral-300">Primary Collection:</label>
                    <select v-model="editUser.defaultCollection" class="w-full rounded border p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-neutral-900 dark:text-neutral-200 dark:focus:ring-indigo-300">
                        <option v-for="collection in collections" :key="collection.name" :value="collection.name">
                            {{ collection.alias || collection.name }}
                        </option>
                    </select>
                </div>

                <!-- Models Management -->
                <div class="mb-4">
                    <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">AI Models Access:</label>
                    <div class="relative">
                        <!-- Model Tags Display -->
                        <div v-if="userModels.length > 0" class="mb-2 flex flex-wrap gap-2">
                            <div v-for="modelId in userModels" :key="modelId" class="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm dark:bg-indigo-900">
                                <span class="text-indigo-800 dark:text-indigo-200">{{ getModelDisplayName(modelId) }}</span>
                                <button type="button" @click="removeModel(modelId)" class="ml-1 flex items-center rounded-full p-0.5 text-indigo-600 hover:bg-indigo-200 dark:text-indigo-300 dark:hover:bg-indigo-800">
                                    <span class="material-icons text-xs">close</span>
                                </button>
                            </div>
                        </div>

                        <!-- Add Model Dropdown -->
                        <div class="relative" ref="dropdownContainer">
                            <button type="button" @click="toggleModelDropdown" class="w-full rounded border border-gray-300 bg-white p-2 text-left text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:ring-indigo-300">
                                <span class="block truncate">{{ selectedModelDisplay || "Select a model to add..." }}</span>
                                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04L10 14.148l2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
                                    </svg>
                                </span>
                            </button>

                            <!-- Dropdown for available models -->
                            <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                                <div v-if="showModelDropdown" class="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-hidden rounded border bg-white shadow-lg ring-1 ring-black dark:border-neutral-600 dark:bg-neutral-800">
                                    <!-- Search -->
                                    <div class="sticky top-0 border-b border-gray-200 bg-white p-2 dark:border-neutral-600 dark:bg-neutral-800">
                                        <div class="relative">
                                            <svg class="absolute top-2.5 left-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <input type="text" v-model="searchModel" placeholder="Search models..." class="w-full rounded border border-gray-300 bg-white py-2 pr-3 pl-8 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-400" />
                                        </div>
                                    </div>

                                    <!-- Model List -->
                                    <div class="max-h-48 overflow-y-auto">
                                        <div v-for="model in filteredModels" :key="model.model" @click="selectModel(model)" class="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700">
                                            <div class="flex items-center gap-2">
                                                <img v-if="model.image" :src="model.image" alt="Model Image" class="h-5 w-5 object-fill" />
                                                <div class="flex-1">
                                                    <div class="font-medium text-gray-900 dark:text-neutral-200">{{ model.name || model.model }}</div>
                                                    <div class="text-sm text-gray-500 dark:text-neutral-400">{{ model.AIName }} • {{ model.model }}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="filteredModels.length === 0" class="px-3 py-2 text-sm text-gray-500 dark:text-neutral-400">No models found</div>
                                    </div>
                                </div>
                            </transition>
                        </div>

                        <!-- Available Models Count -->
                        <div class="mt-1 text-xs text-gray-500 dark:text-neutral-400">{{ userModels.length }} of {{ modelStore.models.length }} models assigned</div>
                    </div>
                </div>

                <!-- Last Login -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 dark:text-neutral-300">Last Login:</label>
                    <input type="text" :value="formatDate(editUser.updatedAt)" class="w-full rounded border bg-gray-100 p-2 dark:bg-neutral-700 dark:text-neutral-300" disabled />
                </div>

                <!-- Save Button -->
                <button type="submit" class="w-full rounded bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-indigo-400" :disabled="isSaving" @click.prevent="saveUser">
                    <span v-if="isSaving">Saving...</span>
                    <span v-else>Save</span>
                </button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, reactive, watch, onMounted, onUnmounted } from "vue"
    import eventBus from "~/util/eventBus"
    import type { IUser, ICollection, ISingleModel } from "~/types/store"
    import { adminService } from "~/services/better-auth/admin"

    const props = defineProps({
        show: Boolean,
        selectedUser: {
            type: Object as () => IUser | null,
        },
        collections: Array as () => ICollection[],
        handleFetch: {
            type: Function,
            required: true,
        },
    })

    const emit = defineEmits(["update:show"])
    const modelStore = useModelStore()

    const isSaving = ref(false)
    const userModels = ref<string[]>([])
    const searchModel = ref("")
    const filteredModels = ref<ISingleModel[]>([])
    const showModelDropdown = ref(false)
    const selectedModelDisplay = ref("")
    const dropdownContainer = ref<HTMLElement | null>(null)

    const editUser = reactive({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        currentPlan: "",
        role: "",
        defaultCollection: "",
        emailVerified: false,
        profilePicture: "",
        models: [],
        updatedAt: 0,
    })

    // Watch selectedUser and populate fields when it changes
    watch(
        () => props.selectedUser,
        async (newUser) => {
            if (newUser) {
                Object.assign(editUser, {
                    id: newUser.id || "",
                    firstName: newUser.firstName || "",
                    lastName: newUser.lastName || "",
                    email: newUser.email || "",
                    currentPlan: newUser.currentPlan || "",
                    role: newUser.role || "",
                    defaultCollection: newUser.defaultCollection || "",
                    emailVerified: newUser.emailVerified || false,
                    models: newUser.models || [],
                    updatedAt: newUser.updatedAt || 0,
                })
                userModels.value = newUser.models || []

            }
        },
        { immediate: true }
    )

    // Load available models on mount
    onMounted(async () => {
        await loadAvailableModels()
    })

    // Watch search input to filter models
    watch(searchModel, () => {
        if (showModelDropdown.value) {
            filterAvailableModels()
        }
    })

    // Watch dropdown state to add/remove click outside listener
    watch(showModelDropdown, (isOpen) => {
        if (isOpen) {
            document.addEventListener("click", handleClickOutside)
        } else {
            document.removeEventListener("click", handleClickOutside)
        }
    })

    // Cleanup on unmount
    onUnmounted(() => {
        document.removeEventListener("click", handleClickOutside)
    })

    async function loadAvailableModels() {
        try {
            await modelStore.loadModels()
        } catch (error) {
            console.error("Failed to load available models:", error)
        }
    }


    function getModelDisplayName(modelId: string): string {
        const model = modelStore.models.find((m: ISingleModel) => m.model === modelId)
        return model ? model.name || model.model : modelId
    }

    function toggleModelDropdown() {
        showModelDropdown.value = !showModelDropdown.value
        if (showModelDropdown.value) {
            filterAvailableModels()
        }
    }

    function filterAvailableModels() {
        if (!searchModel.value.trim()) {
            filteredModels.value = modelStore.models.filter((model: ISingleModel) => !userModels.value.includes(model.model))
        } else {
            const input = searchModel.value.toLowerCase()
            filteredModels.value = modelStore.models.filter((model: ISingleModel) => {
                const name = (model.name || model.model).toLowerCase()
                const provider = (model.AIName || "").toLowerCase()
                const modelId = model.model.toLowerCase()

                return (name.includes(input) || provider.includes(input) || modelId.includes(input)) && !userModels.value.includes(model.model)
            })
        }
    }

    function selectModel(model: ISingleModel) {
        addModel(model.model)
    }

    function addModel(modelId: string) {
        if (!modelId || userModels.value.includes(modelId)) return

        userModels.value.push(modelId)
        selectedModelDisplay.value = ""
        searchModel.value = ""
        filteredModels.value = []
        showModelDropdown.value = false
    }

    async function removeModel(modelId: string) {
        const index = userModels.value.indexOf(modelId)
        if (index > -1) {
            userModels.value.splice(index, 1)
        }
    }

    function emitClose() {
        if (!isSaving.value) {
            emit("update:show", false)
        }
    }

    // Close dropdown when clicking outside
    function handleClickOutside(event: Event) {
        if (dropdownContainer.value && !dropdownContainer.value.contains(event.target as Node)) {
            showModelDropdown.value = false
        }
    }

    async function saveUser() {
        if (isSaving.value) return
        isSaving.value = true

        try {
            // Save user info
            await adminService.updateUser(editUser.id, {
                    firstName: editUser.firstName,
                    lastName: editUser.lastName,
                    role: editUser.role as TUserRole,
                    defaultCollection: editUser.defaultCollection,
                    emailVerified: editUser.emailVerified,
                    models: userModels.value,
                    email: editUser.email,
                    profilePicture: editUser.profilePicture,
                })
                .then(() => {
                    props.handleFetch()
                })

            emit("update:show", false)

            eventBus.emit("showToast", {
                message: "User updated successfully",
                _type: "success",
            })
        } catch (error) {
            console.error("Failed to update user:", error)
            eventBus.emit("showToast", {
                message: "Failed to update user",
                _type: "error",
            })
        } finally {
            isSaving.value = false
        }
    }

    function formatDate(timestamp: number) {
        const date = new Date(timestamp)
        return date.toLocaleString()
    }
</script>

<style scoped>
    /* Custom scrollbar for dropdown */
    .overflow-y-auto::-webkit-scrollbar {
        width: 6px;
    }

    .overflow-y-auto::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }

    /* Dark mode scrollbar */
    .dark .overflow-y-auto::-webkit-scrollbar-track {
        background: #374151;
    }

    .dark .overflow-y-auto::-webkit-scrollbar-thumb {
        background: #6b7280;
    }

    .dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
    }
</style>