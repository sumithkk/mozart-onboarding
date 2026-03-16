<template>
    <div class="bg-backgroundColor text-textColor flex min-h-screen items-center justify-center p-4">
        <div class="mx-auto w-full max-w-2xl">
            <div class="border-borderColor overflow-hidden rounded-2xl border shadow-xl">
                <!-- Header -->
                <div class="border-borderColor from-surfaceColor border-b bg-gradient-to-r to-gray-200 px-6 py-4">
                    <h2 class="text-textColor text-xl font-semibold">API Keys Management</h2>
                    <p class="text-textColorSecondary mt-1 text-sm">Configure and manage your API keys</p>
                </div>

                <!-- Form Content -->
                <div class="space-y-6 p-6">
                    <!-- Loading State -->
                    <div v-if="isLoading" class="flex items-center justify-center py-12">
                        <ComponentLoading size="lg" />
                    </div>

                    <template v-else>
                        <div class="space-y-6">
                            <!-- Service Selection -->
                            <div class="space-y-3">
                                <label class="text-textColor block text-sm font-medium">Select Service</label>
                                <UDropdownMenu :items="serviceOptions" :content="{ align: 'start', side: 'bottom', sideOffset: 8 }" class="bg-backgroundColor w-full cursor-pointer py-3 sm:w-72" :ui="{ content: 'w-full sm:w-72  bg-backgroundColor' }" v-model:open="isDropdownOpen">
                                    <UButton :label="selectedServiceLabel" icon="i-lucide-chevron-down" color="neutral" variant="outline" />
                                </UDropdownMenu>
                            </div>

                            <!-- API Key Inputs -->
                            <div class="space-y-3">
                                <label class="text-textColor block text-sm font-medium">API Credentials</label>
                                <div v-for="key in serviceConfig[selectedService].keys" :key="key" class="flex">
                                    <UInput
                                        class="bg-backgroundColor w-full sm:w-72"
                                        v-model="apiKeyInputs[key]"
                                        :placeholder="`Enter ${formatKeyLabel(key)}`"
                                        variant="subtle"
                                        size="xl"
                                        :ui="{
                                            trailing: 'pe-1',
                                            base: 'bg-surfaceColor border-borderColor border-[1px]',
                                            input: 'bg-surfaceColor border-[1px]',
                                        }"
                                    >
                                        <template v-if="apiKeyInputs[key]?.length" #trailing>
                                            <UButton color="neutral" variant="link" size="sm" icon="i-lucide-circle-x" aria-label="Clear input" @click="apiKeyInputs[key] = ''" class="cursor-pointer" />
                                        </template>
                                    </UInput>
                                </div>
                            </div>

                            <!-- Submit Button -->
                            <ButtonV2 buttonText="Update Configuration" @clicked="submitKeys" :disabled="isSubmitDisabled" :loaderStatus="isSubmitting" customClass="w-full py-2" />
                        </div>

                        <!-- API Keys Table -->
                        <div v-if="configuredKeys.length > 0" class="space-y-3">
                            <UTable
                                :ui="{
                                    thead: '[&_th]:cursor-pointer [&_th]:hover:text-zinc-600 dark:[&_th]:hover:text-gray-300 h-14 bg-tableBgHeader',
                                    tbody: '[&_td]:cursor-pointer',
                                }"
                                :columns="tableColumns"
                                :data="configuredKeys"
                                @select="handleRowSelect"
                                class="h-full"
                                aria-label="Configured API keys table"
                            >
                                <template #expanded="{ row }">
                                    <pre class="overflow-x-auto rounded bg-gray-100 p-2 text-xs">{{ JSON.stringify(row.original, null, 2) }}</pre>
                                </template>
                            </UTable>
                        </div>

                        <!-- Empty State -->
                        <div v-else class="py-8 text-center">
                            <div class="text-textColorSecondary mb-2">
                                <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2v6a2 2 0 01-2 2M9 7a2 2 0 00-2 2m0 0a2 2 0 00-2 2m2-2v6a2 2 0 002 2" />
                                </svg>
                            </div>
                            <p class="text-textColorSecondary text-sm">No API keys configured yet</p>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { IFlattenedApiKeysItem } from "@/types/api-keys"
    import { createSortHeader, mw } from "@/util/nuxtUiUtil"
    import type { TableColumn } from "@nuxt/ui"
    import { onMounted, ref, computed, h, resolveComponent } from "vue"
    import eventBus from "~/util/eventBus"
    import type { DropdownMenuItem } from "@nuxt/ui"
    import ComponentLoading from "~/components/common/ComponentLoading.vue"

    // Service configuration
    const serviceConfig = {
        AnthropicAPIKey: { keys: ["API_KEY"], label: "Anthropic" },
        CohereAPIKey: { keys: ["API_KEY"], label: "Cohere" },
        MistralAPIKey: { keys: ["API_KEY"], label: "Mistral" },
        OpenAPIKey: { keys: ["API_KEY"], label: "OpenAI" },
        SmokeballKey: { keys: ["API_KEY", "CLIENT_ID", "CLIENT_SECRET"], label: "Smokeball" },
    }

    const modelOptions = {
        Anthropic: "AnthropicAPIKey",
        Cohere: "CohereAPIKey",
        Mistral: "MistralAPIKey",
        OpenAI: "OpenAPIKey",
        Smokeball: "SmokeballKey",
    }
    // Reactive state
    const userStore = useUserStore()
    const user = useUser()
    const isSubmitting = ref(false)
    const isLoading = ref(false)
    const selectedService = ref("OpenAPIKey")
    const apiKeyInputs = ref<Record<string, string>>({})
    const isDropdownOpen = ref(false)

    // Computed properties
    const selectedServiceLabel = computed(() => serviceConfig[selectedService.value]?.label || "Select Service")

    const serviceOptions = computed<DropdownMenuItem[]>(() =>
        Object.entries(serviceConfig).map(([key, config]) => ({
            label: config.label,
            class: "cursor-pointer py-2",
            onSelect: (e: Event) => {
                e.preventDefault()
                handleServiceSelect(key)
                isDropdownOpen.value = false
            },
        }))
    )

    const isSubmitDisabled = computed(() => {
        const requiredKeys = serviceConfig[selectedService.value]?.keys || []
        return !requiredKeys.some((key) => apiKeyInputs.value[key]?.trim())
    })

    const configuredKeys = computed<IFlattenedApiKeysItem[]>(() => {
        const flattened: IFlattenedApiKeysItem[] = []
        if (userStore.apiKeys) {
            for (const [service, keys] of Object.entries(userStore.apiKeys as Record<string, Record<string, string>>)) {
                const primaryKey = Object.values(keys)[0] as string | undefined
                flattened.push({
                    service: serviceConfig[service]?.label || service,
                    keys,
                    apiKey: primaryKey || "",
                })
            }
        }
        return flattened
    })

    // Table columns
    const UButton = resolveComponent("UButton")
    const UIcon = resolveComponent("UIcon")

    const tableColumns: TableColumn<IFlattenedApiKeysItem>[] = [
        {
            accessorKey: "service",
            header: ({ column }) => createSortHeader("Service", column),
            minSize: 120,
            size: 200,
            enableSorting: true,
            sortingFn: "alphanumeric",
        },
        {
            accessorKey: "keys",
            header: ({ column }) => createSortHeader("Keys", column),
            minSize: 140,
            size: 160,
            cell: ({ row }) => {
                const entries = Object.entries(row.original.keys)
                const masked = entries.map(([k, v]) => `${k}: ${maskKey(v)}`)
                return masked.join(" • ")
            },
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }) =>
                mw(
                    h(
                        "div",
                        {
                            class: "flex items-center gap-2 min-w-fit",
                        },
                        [
                            // Copy button with better visual hierarchy
                            h(
                                UButton,
                                {
                                    size: "xs",
                                    variant: "ghost",
                                    color: "gray",
                                    class: "cursor-pointer hover:bg-gray-100 transition-colors duration-200 group",
                                    onClick: async (e: MouseEvent) => {
                                        e.stopPropagation()
                                        await copyKeyToClipboard(row.original)
                                    },
                                    title: "Copy API key to clipboard",
                                    "aria-label": `Copy API key ${row.original.apiKey || "key"} to clipboard`,
                                },
                                {
                                    default: () =>
                                        h(UIcon, {
                                            name: "i-lucide-copy",
                                            class: "size-4 group-hover:scale-110 transition-transform duration-200",
                                        }),
                                }
                            ),

                            // Visual separator for better grouping
                            h("div", {
                                class: "w-px h-4 bg-gray-300 mx-1",
                            }),

                            // Delete button with stronger visual emphasis for destructive action
                            h(
                                UButton,
                                {
                                    size: "xs",
                                    variant: "outline",
                                    color: "error",
                                    class: "cursor-pointer hover:bg-red-50 border-red-200 hover:border-red-400 transition-all duration-200 group",
                                    onClick: async (e: MouseEvent) => {
                                        e.stopPropagation()
                                        if (!confirm(`Are you sure you want to delete the API key "${row.original.keys}"?`)) {
                                            return
                                        }
                                        await deleteApiKey(row.original)
                                    },
                                    title: "Delete API key permanently",
                                    "aria-label": `Delete API key ${row.original.apiKey || "key"} permanently`,
                                },
                                {
                                    default: () =>
                                        h(UIcon, {
                                            name: "i-lucide-trash-2",
                                            class: "size-4 group-hover:scale-110 transition-transform duration-200",
                                        }),
                                }
                            ),
                        ]
                    ),
                    "min-w-32"
                ),
        },
    ]

    // Methods
    function handleServiceSelect(service: string) {
        selectedService.value = service
        apiKeyInputs.value = {}
    }

    function handleRowSelect(row: { toggleSelected: (val: boolean) => void; getIsSelected: () => boolean }) {
        row.toggleSelected(!row.getIsSelected())
    }

    function formatKeyLabel(key: string): string {
        return key.replace(/_/g, " ").toLowerCase()
    }

    function maskKey(value: string): string {
        if (!value) return ""
        if (value.length <= 8) return "••••"
        const start = value.slice(0, 4)
        const end = value.slice(-4)
        return `${start}••••••${end}`
    }

    async function submitKeys() {
        isSubmitting.value = true

        const requiredKeys = serviceConfig[selectedService.value]?.keys || []
        const missingKeys = requiredKeys.filter((key) => !apiKeyInputs.value[key]?.trim())

        if (missingKeys.length > 0) {
            eventBus.emit("showToast", {
                message: `Please enter: ${missingKeys.map(formatKeyLabel).join(", ")}`,
                _type: "error",
            })
            isSubmitting.value = false
            return
        }

        const payload = {
            apiKey: apiKeyInputs.value,
            service: selectedService.value,
        }

        const isSuccess = await user.addAPIKey(payload)
        if (isSuccess) {
            userStore.apiKeys[selectedService.value] = apiKeyInputs.value
            apiKeyInputs.value = {}
            eventBus.emit("showToast", {
                message: "API key updated successfully",
                _type: "success",
            })
        }

        isSubmitting.value = false
    }

    async function copyKeyToClipboard(row: IFlattenedApiKeysItem) {
        const keyValue = row.keys["API_KEY"] ?? row.apiKey
        try {
            await navigator.clipboard.writeText(keyValue || "")
            eventBus.emit("showToast", {
                message: "API key copied to clipboard",
                _type: "success",
            })
        } catch (err) {
            eventBus.emit("showToast", {
                message: "Failed to copy API key",
                _type: "error",
            })
        }
    }

    async function deleteApiKey(row: IFlattenedApiKeysItem) {
        console.log(row)
        const keyValue = row.apiKey ?? row.keys["API_KEY"]
        const response = await user.deleteAPIKey(keyValue, modelOptions[row.service])

        if (response === 200) {
            await loadApiKeys()
            eventBus.emit("showToast", {
                message: "API key deleted successfully",
                _type: "success",
            })
        }
    }

    async function loadApiKeys() {
        isLoading.value = true
        try {
            const data = await user.getAPIKeys()
            userStore.apiKeys = data || {}
        } finally {
            isLoading.value = false
        }
    }

    onMounted(loadApiKeys)
</script>
