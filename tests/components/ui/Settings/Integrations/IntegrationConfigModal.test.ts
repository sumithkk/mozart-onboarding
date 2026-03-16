import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import IntegrationConfigModal from "@/components/ui/Settings/Integrations/IntegrationConfigModal.vue"

// Mock Modal component
const ModalStub = {
    name: "Modal",
    props: {
        title: String,
        closeable: Boolean,
        size: String,
    },
    emits: ["close"],
    template: `
        <div class="modal-stub">
            <div class="modal-title">{{ title }}</div>
            <slot />
            <div class="modal-footer">
                <slot name="footer" />
            </div>
        </div>
    `,
}

// Mock useUser composable
const mockValidateIntegration = vi.fn()
vi.mock("~/composables/useUser", () => ({
    default: () => ({
        validateIntegration: mockValidateIntegration,
    }),
}))

describe("IntegrationConfigModal", () => {
    const defaultIntegration = {
        id: "slack",
        name: "Slack",
        fields: [
            {
                key: "apiKey",
                label: "API Key",
                type: "text",
                placeholder: "Enter your Slack API key",
            },
            {
                key: "channel",
                label: "Channel",
                type: "text",
                placeholder: "Enter channel name",
            },
        ],
    }

    const createWrapper = (props = {}) => {
        return mount(IntegrationConfigModal, {
            props: {
                integration: defaultIntegration,
                ...props,
            },
            global: {
                components: {
                    Modal: ModalStub,
                },
                stubs: {
                    Modal: ModalStub,
                },
            },
        })
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockValidateIntegration.mockResolvedValue({
            code: 200,
            message: "Integration saved successfully",
        })
    })

    it("renders modal with integration name in title", () => {
        const wrapper = createWrapper()

        expect(wrapper.find(".modal-stub").exists()).toBe(true)
        expect(wrapper.find(".modal-title").text()).toContain("Configure Slack")
    })

    it("renders all integration fields", () => {
        const wrapper = createWrapper()

        const fields = wrapper.findAll("input")
        expect(fields.length).toBe(2)
        expect(fields[0].attributes("placeholder")).toBe(
            "Enter your Slack API key"
        )
        expect(fields[1].attributes("placeholder")).toBe(
            "Enter channel name"
        )
    })

    it("renders field labels correctly", () => {
        const wrapper = createWrapper()

        expect(wrapper.text()).toContain("API Key")
        expect(wrapper.text()).toContain("Channel")
    })

    it("binds form data to input fields", async () => {
        const wrapper = createWrapper()

        const apiKeyInput = wrapper.find('input[placeholder="Enter your Slack API key"]')
        const channelInput = wrapper.find('input[placeholder="Enter channel name"]')

        await apiKeyInput.setValue("test-api-key")
        await channelInput.setValue("test-channel")

        expect((apiKeyInput.element as HTMLInputElement).value).toBe(
            "test-api-key"
        )
        expect((channelInput.element as HTMLInputElement).value).toBe(
            "test-channel"
        )
    })

    it("renders save button", () => {
        const wrapper = createWrapper()

        const saveButton = wrapper.find("button")
        expect(saveButton.exists()).toBe(true)
        expect(saveButton.text()).toBe("Save")
    })

    it("shows saving state when save button is clicked", async () => {
        mockValidateIntegration.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            code: 200,
                            message: "Integration saved successfully",
                        })
                    }, 100)
                })
        )

        const wrapper = createWrapper()

        const saveButton = wrapper.find("button")
        await saveButton.trigger("click")

        expect(saveButton.text()).toBe("Saving...")
        expect(saveButton.attributes("disabled")).toBeDefined()
    })

    it("calls validateIntegration with correct payload for Slack", async () => {
        const wrapper = createWrapper()

        const apiKeyInput = wrapper.find('input[placeholder="Enter your Slack API key"]')
        const channelInput = wrapper.find('input[placeholder="Enter channel name"]')

        await apiKeyInput.setValue("test-api-key")
        await channelInput.setValue("test-channel")

        const saveButton = wrapper.find("button")
        await saveButton.trigger("click")

        await wrapper.vm.$nextTick()

        expect(mockValidateIntegration).toHaveBeenCalledWith({
            service: "slack",
            channel: "test-channel",
            credentials: {
                apiKey: "test-api-key",
            },
        })
    })

    it("calls validateIntegration with correct payload for Jira", async () => {
        const jiraIntegration = {
            id: "jira",
            name: "Jira",
            fields: [
                {
                    key: "apiKey",
                    label: "API Key",
                    type: "text",
                    placeholder: "Enter your Jira API key",
                },
                {
                    key: "projectKey",
                    label: "Project Key",
                    type: "text",
                    placeholder: "Enter project key",
                },
            ],
        }

        const wrapper = createWrapper({ integration: jiraIntegration })

        const apiKeyInput = wrapper.find('input[placeholder="Enter your Jira API key"]')
        const projectKeyInput = wrapper.find('input[placeholder="Enter project key"]')

        await apiKeyInput.setValue("test-api-key")
        await projectKeyInput.setValue("TEST-PROJECT")

        const saveButton = wrapper.find("button")
        await saveButton.trigger("click")

        await wrapper.vm.$nextTick()

        expect(mockValidateIntegration).toHaveBeenCalledWith({
            service: "jira",
            projectKey: "TEST-PROJECT",
            credentials: {
                apiKey: "test-api-key",
            },
        })
    })

    it("calls validateIntegration with credentials only for generic services", async () => {
        const genericIntegration = {
            id: "custom",
            name: "Custom Service",
            fields: [
                {
                    key: "apiKey",
                    label: "API Key",
                    type: "text",
                    placeholder: "Enter API key",
                },
                {
                    key: "secret",
                    label: "Secret",
                    type: "password",
                    placeholder: "Enter secret",
                },
            ],
        }

        const wrapper = createWrapper({ integration: genericIntegration })

        const apiKeyInput = wrapper.find('input[placeholder="Enter API key"]')
        const secretInput = wrapper.find('input[placeholder="Enter secret"]')

        await apiKeyInput.setValue("test-api-key")
        await secretInput.setValue("test-secret")

        const saveButton = wrapper.find("button")
        await saveButton.trigger("click")

        await wrapper.vm.$nextTick()

        expect(mockValidateIntegration).toHaveBeenCalledWith({
            service: "custom",
            credentials: {
                apiKey: "test-api-key",
                secret: "test-secret",
            },
        })
    })

    it("shows success message when integration is saved successfully", async () => {
        const wrapper = createWrapper()

        const apiKeyInput = wrapper.find('input[placeholder="Enter your Slack API key"]')
        await apiKeyInput.setValue("test-api-key")

        const saveButton = wrapper.find("button")
        await saveButton.trigger("click")

        await wrapper.vm.$nextTick()
        await new Promise((resolve) => setTimeout(resolve, 50))

        expect(wrapper.text()).toContain("Integration saved successfully")
    })

    it("shows error message when integration save fails", async () => {
        mockValidateIntegration.mockResolvedValue({
            code: 400,
            message: "Invalid API key",
        })

        const wrapper = createWrapper()

        const apiKeyInput = wrapper.find('input[placeholder="Enter your Slack API key"]')
        await apiKeyInput.setValue("invalid-key")

        const saveButton = wrapper.find("button")
        await saveButton.trigger("click")

        await wrapper.vm.$nextTick()
        await new Promise((resolve) => setTimeout(resolve, 50))

        expect(wrapper.text()).toContain("Invalid API key")
    })

    it("emits saved event after successful save", async () => {
        vi.useFakeTimers()
        const wrapper = createWrapper()

        const apiKeyInput = wrapper.find('input[placeholder="Enter your Slack API key"]')
        await apiKeyInput.setValue("test-api-key")

        const saveButton = wrapper.find("button")
        await saveButton.trigger("click")

        await wrapper.vm.$nextTick()

        // Fast-forward timers
        vi.advanceTimersByTime(1000)

        expect(wrapper.emitted("saved")).toBeTruthy()
        expect(wrapper.emitted("saved")).toHaveLength(1)

        vi.useRealTimers()
    })

    it("emits close event after successful save", async () => {
        vi.useFakeTimers()
        const wrapper = createWrapper()

        const apiKeyInput = wrapper.find('input[placeholder="Enter your Slack API key"]')
        await apiKeyInput.setValue("test-api-key")

        const saveButton = wrapper.find("button")
        await saveButton.trigger("click")

        await wrapper.vm.$nextTick()

        // Fast-forward timers
        vi.advanceTimersByTime(1000)

        expect(wrapper.emitted("close")).toBeTruthy()
        expect(wrapper.emitted("close")).toHaveLength(1)

        vi.useRealTimers()
    })

    it("handles validation errors gracefully", async () => {
        mockValidateIntegration.mockRejectedValue({
            response: {
                data: {
                    message: "Network error",
                },
            },
        })

        const wrapper = createWrapper()

        const apiKeyInput = wrapper.find('input[placeholder="Enter your Slack API key"]')
        await apiKeyInput.setValue("test-api-key")

        const saveButton = wrapper.find("button")
        await saveButton.trigger("click")

        await wrapper.vm.$nextTick()
        await new Promise((resolve) => setTimeout(resolve, 50))

        expect(wrapper.text()).toContain("Network error")
    })

    it("does not include empty fields in payload", async () => {
        const wrapper = createWrapper()

        const apiKeyInput = wrapper.find('input[placeholder="Enter your Slack API key"]')
        await apiKeyInput.setValue("test-api-key")
        // Channel input is left empty

        const saveButton = wrapper.find("button")
        await saveButton.trigger("click")

        await wrapper.vm.$nextTick()

        expect(mockValidateIntegration).toHaveBeenCalledWith({
            service: "slack",
            credentials: {
                apiKey: "test-api-key",
            },
        })
    })
})

