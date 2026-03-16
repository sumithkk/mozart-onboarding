<template>
    <TransitionRoot :show="show" as="template">
        <Dialog as="div" class="relative z-50" @close="$emit('close')">
            <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in duration-200"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <TransitionChild
                        as="template"
                        enter="ease-out duration-300"
                        enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95"
                    >
                        <DialogPanel
                            class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all dark:bg-neutral-900"
                        >
                            <!-- Header -->
                            <div class="mb-6">
                                <DialogTitle
                                    class="text-2xl font-bold text-gray-900 dark:text-white"
                                >
                                    {{ mode === 'create' ? 'Create New Project' : 'Edit Project' }}
                                </DialogTitle>
                                <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                                    {{
                                        mode === 'create'
                                            ? 'Organize your conversations into a project'
                                            : 'Update project details'
                                    }}
                                </p>
                            </div>

                            <!-- Form -->
                            <form @submit.prevent="handleSubmit" class="space-y-5">
                                <!-- Project Name -->
                                <div>
                                    <label
                                        for="project-name"
                                        class="block text-sm font-medium text-gray-700 dark:text-neutral-300"
                                    >
                                        Project Name
                                        <span class="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="project-name"
                                        v-model="formData.name"
                                        type="text"
                                        required
                                        placeholder="Enter project name"
                                        class="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                                    />
                                </div>

                                <!-- Description -->
                                <div>
                                    <label
                                        for="project-description"
                                        class="block text-sm font-medium text-gray-700 dark:text-neutral-300"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="project-description"
                                        v-model="formData.description"
                                        rows="3"
                                        placeholder="Describe your project..."
                                        class="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                                    ></textarea>
                                </div>

                                <!-- Scope -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-neutral-300">
                                        Scope
                                        <span class="text-red-500">*</span>
                                    </label>
                                    <div class="mt-2 grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            @click="formData.scope = 'personal'"
                                            :class="[
                                                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                                                formData.scope === 'personal'
                                                    ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600'
                                            ]"
                                        >
                                            <span class="materialSymbolsOutlined text-2xl">person</span>
                                            <span class="text-sm font-medium">Personal</span>
                                        </button>

                                        <button
                                            type="button"
                                            @click="formData.scope = 'organization'"
                                            :class="[
                                                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                                                formData.scope === 'organization'
                                                    ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600'
                                            ]"
                                        >
                                            <span class="materialSymbolsOutlined text-2xl">groups</span>
                                            <span class="text-sm font-medium">Organization</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- Organization Selection (if scope is organization) -->
                                <div v-if="formData.scope === 'organization'">
                                    <label
                                        for="organization"
                                        class="block text-sm font-medium text-gray-700 dark:text-neutral-300"
                                    >
                                        Organization
                                        <span class="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="organization"
                                        v-model="formData.organizationId"
                                        required
                                        class="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                    >
                                        <option value="">Select an organization</option>
                                        <option
                                            v-for="org in organizations"
                                            :key="org.organizationId"
                                            :value="org.organizationId"
                                        >
                                            {{ org.name }}
                                        </option>
                                    </select>
                                </div>

                                <!-- Actions -->
                                <div class="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        @click="$emit('close')"
                                        class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        :disabled="!isFormValid || loading"
                                        class="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-indigo-600"
                                    >
                                        <span
                                            v-if="loading"
                                            class="materialSymbolsOutlined animate-spin text-lg"
                                        >
                                            progress_activity
                                        </span>
                                        {{ mode === 'create' ? 'Create Project' : 'Save Changes' }}
                                    </button>
                                </div>
                            </form>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue"
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from "@headlessui/vue"

interface Props {
    show: boolean
    mode: "create" | "edit"
    project?: any
    loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(["close", "save"])

const userStore = useUserStore()

const formData = ref({
    name: "",
    description: "",
    scope: "personal" as "personal" | "organization",
    organizationId: "",
})

const organizations = computed(() => userStore.organizations || [])

const isFormValid = computed(() => {
    if (!formData.value.name.trim()) return false
    if (formData.value.scope === "organization" && !formData.value.organizationId) return false
    return true
})

// Watch for project changes
watch(
    () => props.project,
    (newProject) => {
        if (newProject) {
            formData.value = {
                name: newProject.name || "",
                description: newProject.description || "",
                scope: newProject.scope || "personal",
                organizationId: newProject.organizationId || "",
            }
        } else {
            // Reset form for create mode
            formData.value = {
                name: "",
                description: "",
                scope: "personal",
                organizationId: "",
            }
        }
    },
    { immediate: true }
)

const handleSubmit = () => {
    if (isFormValid.value) {
        emit("save", { ...formData.value })
    }
}
</script>

