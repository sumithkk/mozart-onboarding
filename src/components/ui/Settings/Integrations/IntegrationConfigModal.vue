<template>
    <Modal :title="`Configure ${integration.name}`" :closeable="true" @close="$emit('close')" size="max-w-[500px] w-full">
        <div class="space-y-4">
            <div v-for="field in integration.fields" :key="field.key">
                <label class="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-300">{{ field.label }}</label>
                <input
                    v-model="formData[field.key]"
                    :type="field.type"
                    :placeholder="field.placeholder"
                    class="bg-input border-strokeColor text-textColor w-full rounded border p-2 focus:border-blue-500 focus:outline-none"
                />
            </div>
        </div>

        <template #footer>
            <div class="flex w-full items-center justify-between">
                <div class="flex items-center">
                    <div v-if="saved" class="flex items-center gap-1 text-green-500">
                        <CheckCircleIcon class="h-6 w-6" />
                        <span class="truncate text-sm max-w-[200px]" :title="message">{{ message || "Saved successfully" }}</span>
                    </div>
                    <div v-else-if="error" class="flex items-center gap-1 text-red-500">
                        <XCircleIcon class="h-6 w-6" />
                        <span class="truncate text-sm max-w-[200px]" :title="error">{{ error }}</span>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button @click="save" :disabled="saving" class="bg-mozart-blue rounded px-4 py-2 text-white hover:bg-mozart-blue/90 transition disabled:opacity-50">
                        {{ saving ? "Saving..." : "Save" }}
                    </button>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
    import { ref, reactive } from "vue"
    import { CheckCircleIcon, XCircleIcon } from "@heroicons/vue/24/solid"
    import useUser from "~/composables/useUser"

    const props = defineProps({
        integration: {
            type: Object,
            required: true,
        },
    })

    const emit = defineEmits(["close", "saved"])
    const { validateIntegration } = useUser()

    const formData = reactive<Record<string, string>>({})
    const saving = ref(false)
    const saved = ref(false)
    const error = ref("")
    const message = ref("")

    /**
     * Builds the standard API payload structure
     * All fields go into credentials, except service-specific top-level fields
     */
    const buildApiPayload = (): any => {
        const service = props.integration.id.toLowerCase()
        const payload: any = {
            service,
            credentials: {},
        }

        // Service-specific top-level fields
        const topLevelFields: Record<string, string[]> = {
            slack: ["channel"],
            jira: ["projectKey"],
        }

        const topLevelKeys = topLevelFields[service] || []

        // Organize fields into credentials and top-level
        Object.keys(formData).forEach((key) => {
            if (formData[key]) {
                if (topLevelKeys.includes(key)) {
                    payload[key] = formData[key]
                } else {
                    payload.credentials[key] = formData[key]
                }
            }
        })

        return payload
    }

    const save = async () => {
        saving.value = true
        error.value = ""
        message.value = ""
        saved.value = false
        try {
            const payload = buildApiPayload()
            const response: any = await validateIntegration(payload)
            if (response && response.code === 200) {
                saved.value = true
                message.value = response.message || "Integration saved successfully"
                setTimeout(() => {
                    emit("saved")
                    emit("close")
                }, 1000)
            } else {
                saved.value = false
                error.value = response?.message || "Failed to save credentials"
            }
        } catch (err: any) {
            saved.value = false
            error.value = err.response?.data?.message || err.message || "Failed to save credentials"
        } finally {
            saving.value = false
        }
    }
</script>

