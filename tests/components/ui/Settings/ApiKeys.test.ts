import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { reactive } from "vue"
import ApiKeys from "@/components/ui/Settings/ApiKeys.vue"

// Mock ComponentLoading
const ComponentLoadingStub = {
    name: "ComponentLoading",
    props: {
        size: String,
    },
    template: `<div class="component-loading-stub">Loading...</div>`,
}

// Mock ButtonV2
const ButtonV2Stub = {
    name: "ButtonV2",
    props: {
        buttonText: String,
        disabled: Boolean,
        loaderStatus: Boolean,
        customClass: String,
    },
    emits: ["clicked"],
    template: `
        <button 
            :disabled="disabled || loaderStatus" 
            :class="customClass"
            @click="$emit('clicked')"
        >
            {{ loaderStatus ? 'Loading...' : buttonText }}
        </button>
    `,
}

// Mock Nuxt UI components
const UDropdownMenuStub = {
    name: "UDropdownMenu",
    props: {
        items: Array,
        content: Object,
        open: Boolean,
    },
    emits: ["update:open"],
    template: `<div class="dropdown-menu-stub"><slot /></div>`,
}

const UButtonStub = {
    name: "UButton",
    props: {
        label: String,
        icon: String,
        color: String,
        variant: String,
    },
    template: `<button class="u-button-stub">{{ label }}</button>`,
}

const UInputStub = {
    name: "UInput",
    props: {
        modelValue: String,
        placeholder: String,
        variant: String,
        size: String,
        ui: Object,
    },
    emits: ["update:modelValue"],
    template: `
        <div class="u-input-stub">
            <input 
                :value="modelValue"
                :placeholder="placeholder"
                @input="$emit('update:modelValue', $event.target.value)"
            />
            <slot name="trailing" />
        </div>
    `,
}

const UTableStub = {
    name: "UTable",
    props: {
        columns: Array,
        data: Array,
        ui: Object,
        class: String,
    },
    emits: ["select"],
    template: `
        <table class="u-table-stub">
            <thead>
                <tr>
                    <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, index) in data" :key="index">
                    <td v-for="col in columns" :key="col.key">
                        {{ row[col.key] }}
                    </td>
                </tr>
            </tbody>
        </table>
    `,
}

// Mock useUser composable
const mockAddAPIKey = vi.fn()
const mockGetAPIKeys = vi.fn()
const mockDeleteAPIKey = vi.fn()

const mockUseUser = () => ({
    addAPIKey: mockAddAPIKey,
    getAPIKeys: mockGetAPIKeys,
    deleteAPIKey: mockDeleteAPIKey,
})

vi.mock("~/composables/useUser", () => ({
    default: mockUseUser,
}))

// Also provide it globally for auto-imports
;(globalThis as any).useUser = mockUseUser

// Mock useUserStore - use hoisted to ensure it's available before module evaluation
const { mockUserStoreBase } = vi.hoisted(() => {
    const store = {
        apiKeys: {},
    }
    return { mockUserStoreBase: store }
})

// Make the store reactive after imports are available
const mockUserStore = reactive(mockUserStoreBase)

vi.mock("~/store/user", () => ({
    useUserStore: () => mockUserStore,
}))

// Also provide it globally for auto-imports
;(globalThis as any).useUserStore = () => mockUserStore

// Mock eventBus
const { mockEventBus } = vi.hoisted(() => {
    const mockEmit = vi.fn()
    return {
        mockEventBus: {
            emit: mockEmit,
        },
    }
})

vi.mock("~/util/eventBus", () => ({
    default: mockEventBus,
}))

describe("ApiKeys", () => {
    const createWrapper = (options = {}) => {
        return mount(ApiKeys, {
            global: {
                components: {
                    ComponentLoading: ComponentLoadingStub,
                    ButtonV2: ButtonV2Stub,
                    UDropdownMenu: UDropdownMenuStub,
                    UButton: UButtonStub,
                    UInput: UInputStub,
                    UTable: UTableStub,
                },
                stubs: {
                    ComponentLoading: ComponentLoadingStub,
                    ButtonV2: ButtonV2Stub,
                    UDropdownMenu: UDropdownMenuStub,
                    UButton: UButtonStub,
                    UInput: UInputStub,
                    UTable: UTableStub,
                },
            },
            ...options,
        })
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockUserStore.apiKeys = {}
        mockGetAPIKeys.mockResolvedValue({})
        mockAddAPIKey.mockResolvedValue(true)
        mockDeleteAPIKey.mockResolvedValue(200)
    })

    it("renders component with header", () => {
        const wrapper = createWrapper()

        expect(wrapper.text()).toContain("API Keys Management")
        expect(wrapper.text()).toContain("Configure and manage your API keys")
    })

    it("shows loading state when isLoading is true", async () => {
        const wrapper = createWrapper()

        // Set loading state
        wrapper.vm.isLoading = true
        await wrapper.vm.$nextTick()

        expect(wrapper.find(".component-loading-stub").exists()).toBe(true)
    })

    it("renders service selection dropdown", () => {
        const wrapper = createWrapper()

        expect(wrapper.find(".dropdown-menu-stub").exists()).toBe(true)
        expect(wrapper.text()).toContain("Select Service")
    })

    it("renders API key input fields for selected service", async () => {
        mockGetAPIKeys.mockResolvedValue({})
        const wrapper = createWrapper()

        await wrapper.vm.$nextTick()
        await new Promise((resolve) => setTimeout(resolve, 100))
        await wrapper.vm.$nextTick()

        // Default service is OpenAPIKey which has one key: API_KEY
        const inputs = wrapper.findAll(".u-input-stub input")
        expect(inputs.length).toBeGreaterThan(0)
    })

    it("renders submit button", () => {
        const wrapper = createWrapper()

        const submitButton = wrapper.findComponent({ name: "ButtonV2" })
        expect(submitButton.exists()).toBe(true)
        expect(submitButton.props("buttonText")).toBe("Update Configuration")
    })

    it("disables submit button when no keys are entered", async () => {
        mockGetAPIKeys.mockResolvedValue({})
        const wrapper = createWrapper()

        await wrapper.vm.$nextTick()
        await new Promise((resolve) => setTimeout(resolve, 100))
        await wrapper.vm.$nextTick()

        const submitButton = wrapper.findComponent({ name: "ButtonV2" })
        expect(submitButton.exists()).toBe(true)
        expect(submitButton.props("disabled")).toBe(true)
    })

    it("enables submit button when keys are entered", async () => {
        const wrapper = createWrapper()

        await wrapper.vm.$nextTick()

        // Set API key input
        wrapper.vm.apiKeyInputs = { API_KEY: "test-key" }
        await wrapper.vm.$nextTick()

        const submitButton = wrapper.findComponent({ name: "ButtonV2" })
        expect(submitButton.props("disabled")).toBe(false)
    })

    it("calls addAPIKey with correct payload structure", async () => {
        const wrapper = createWrapper()

        await wrapper.vm.$nextTick()

        // Set API key input
        wrapper.vm.apiKeyInputs = { API_KEY: "test-api-key" }
        wrapper.vm.selectedService = "OpenAPIKey"
        await wrapper.vm.$nextTick()

        // Trigger submit
        const submitButton = wrapper.findComponent({ name: "ButtonV2" })
        await submitButton.vm.$emit("clicked")

        await wrapper.vm.$nextTick()

        expect(mockAddAPIKey).toHaveBeenCalledWith({
            apiKey: { API_KEY: "test-api-key" },
            service: "OpenAPIKey",
        })
    })

    it("calls getAPIKeys on mount", async () => {
        createWrapper()

        await new Promise((resolve) => setTimeout(resolve, 100))

        expect(mockGetAPIKeys).toHaveBeenCalled()
    })

    it("shows empty state when no API keys are configured", async () => {
        mockGetAPIKeys.mockResolvedValue({})
        const wrapper = createWrapper()

        await wrapper.vm.$nextTick()
        await new Promise((resolve) => setTimeout(resolve, 100))
        await wrapper.vm.$nextTick()

        expect(wrapper.text()).toContain("No API keys configured yet")
    })

    it("shows table when API keys are configured", async () => {
        const apiKeysData = {
            OpenAPIKey: {
                API_KEY: "test-key",
            },
        }
        mockGetAPIKeys.mockResolvedValue(apiKeysData)

        const wrapper = createWrapper()

        // Wait for loadApiKeys to complete
        await wrapper.vm.$nextTick()
        await new Promise((resolve) => setTimeout(resolve, 200))
        await wrapper.vm.$nextTick()

        // Verify the store was updated by the component
        expect(mockUserStore.apiKeys).toEqual(apiKeysData)
        
        // Verify loading is complete
        expect(wrapper.vm.isLoading).toBe(false)
        
        // Verify configuredKeys computed property has data
        expect(wrapper.vm.configuredKeys.length).toBeGreaterThan(0)

        // Force update to ensure Vue processes the reactive changes
        await wrapper.vm.$forceUpdate()
        await wrapper.vm.$nextTick()

        // Now check for the table
        expect(wrapper.find(".u-table-stub").exists()).toBe(true)
    })

    it("handles multiple keys for services like Smokeball", async () => {
        const wrapper = createWrapper()

        await wrapper.vm.$nextTick()

        // Change to Smokeball which has multiple keys
        wrapper.vm.selectedService = "SmokeballKey"
        await wrapper.vm.$nextTick()

        // Set all required keys
        wrapper.vm.apiKeyInputs = {
            API_KEY: "test-api-key",
            CLIENT_ID: "test-client-id",
            CLIENT_SECRET: "test-client-secret",
        }
        await wrapper.vm.$nextTick()

        const submitButton = wrapper.findComponent({ name: "ButtonV2" })
        await submitButton.vm.$emit("clicked")

        await wrapper.vm.$nextTick()

        expect(mockAddAPIKey).toHaveBeenCalledWith({
            apiKey: {
                API_KEY: "test-api-key",
                CLIENT_ID: "test-client-id",
                CLIENT_SECRET: "test-client-secret",
            },
            service: "SmokeballKey",
        })
    })

    it("shows loading state during API call", async () => {
        mockAddAPIKey.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve(true), 100)
                })
        )

        const wrapper = createWrapper()

        await wrapper.vm.$nextTick()

        wrapper.vm.apiKeyInputs = { API_KEY: "test-key" }
        await wrapper.vm.$nextTick()

        const submitButton = wrapper.findComponent({ name: "ButtonV2" })
        await submitButton.vm.$emit("clicked")

        await wrapper.vm.$nextTick()

        expect(submitButton.props("loaderStatus")).toBe(true)
    })

    it("emits toast on successful API key update", async () => {
        const wrapper = createWrapper()

        await wrapper.vm.$nextTick()

        wrapper.vm.apiKeyInputs = { API_KEY: "test-key" }
        await wrapper.vm.$nextTick()

        const submitButton = wrapper.findComponent({ name: "ButtonV2" })
        await submitButton.vm.$emit("clicked")

        await wrapper.vm.$nextTick()
        await new Promise((resolve) => setTimeout(resolve, 50))

        expect(mockEventBus.emit).toHaveBeenCalledWith("showToast", {
            message: "API key updated successfully",
            _type: "success",
        })
    })

    it("clears input fields after successful submission", async () => {
        const wrapper = createWrapper()

        await wrapper.vm.$nextTick()

        wrapper.vm.apiKeyInputs = { API_KEY: "test-key" }
        await wrapper.vm.$nextTick()

        const submitButton = wrapper.findComponent({ name: "ButtonV2" })
        await submitButton.vm.$emit("clicked")

        await wrapper.vm.$nextTick()
        await new Promise((resolve) => setTimeout(resolve, 50))

        expect(wrapper.vm.apiKeyInputs).toEqual({})
    })

    it("handles loading state correctly", async () => {
        mockGetAPIKeys.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve({}), 100)
                })
        )

        const wrapper = createWrapper()

        // Initially should be loading
        expect(wrapper.vm.isLoading).toBe(true)

        await new Promise((resolve) => setTimeout(resolve, 150))
        await wrapper.vm.$nextTick()

        // After loading completes
        expect(wrapper.vm.isLoading).toBe(false)
    })
})

