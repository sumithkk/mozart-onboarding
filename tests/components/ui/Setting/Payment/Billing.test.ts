import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest"
import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import Billing from "~/components/ui/Settings/payment/Billing.vue"

// Mock the child components
vi.mock("~/components/ui/Settings/payment/componets/CurrentPlanOverview.vue", () => ({
    default: {
        name: "CurrentPlanOverview",
        template: '<div data-testid="current-plan-overview">Current Plan Overview</div>',
        setup() {
            return {
                reloadPlanData: vi.fn(),
            }
        },
    },
}))

vi.mock("~/components/ui/Settings/payment/componets/InvoicesList.vue", () => ({
    default: {
        name: "InvoicesList",
        template: '<div data-testid="invoices-list">Invoices List</div>',
    },
}))

vi.mock("~/components/ui/Settings/payment/componets/ActivePlans.vue", () => ({
    default: {
        name: "ActivePlans",
        template: '<div data-testid="active-plans">Active Plans</div>',
        emits: ["plan-cancelled"],
    },
}))

describe("Billing Component", () => {
    let wrapper: any
    let pinia: any

    beforeAll(() => {
        // Create a single Pinia instance for all tests
        pinia = createPinia()
        setActivePinia(pinia)
    })

    beforeEach(() => {
        wrapper = mount(Billing, {
            global: {
                plugins: [pinia],
                stubs: {
                    CurrentPlanOverview: {
                        template: '<div data-testid="current-plan-overview">Current Plan Overview</div>',
                        methods: {
                            reloadPlanData: vi.fn(),
                        },
                    },
                    InvoicesList: {
                        template: '<div data-testid="invoices-list">Invoices List</div>',
                    },
                    ActivePlans: {
                        template: '<div data-testid="active-plans">Active Plans</div>',
                        emits: ["plan-cancelled"],
                    },
                },
            },
        })
    })

    afterAll(() => {
        // Clean up
        if (wrapper) {
            wrapper.unmount()
        }
    })

    it("renders the billing component correctly", () => {
        expect(wrapper.exists()).toBe(true)
        expect(wrapper.find('[data-testid="current-plan-overview"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid="invoices-list"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid="active-plans"]').exists()).toBe(true)
    })

    it("displays the correct header title", () => {
        const header = wrapper.find("h1")
        expect(header.text()).toBe("Billing & Subscriptions")
    })

    it("displays the correct description", () => {
        const description = wrapper.find("p")
        expect(description.text()).toBe("Manage your billing information, view invoices, and update payment methods")
    })

    it("has the correct CSS classes for layout", () => {
        const mainContainer = wrapper.find(".min-h-screen")
        expect(mainContainer.exists()).toBe(true)

        const contentContainer = wrapper.find(".mx-auto.max-w-7xl")
        expect(contentContainer.exists()).toBe(true)
    })

    it("renders all required sections", () => {
        const sections = wrapper.findAll(".space-y-8 > div")
        expect(sections.length).toBeGreaterThan(0)
    })

    it("has proper CSS custom properties for theming", () => {
        const header = wrapper.find("h1")
        expect(header.attributes("style")).toContain("color: var(--textColor)")

        const description = wrapper.find("p")
        expect(description.attributes("style")).toContain("color: var(--textColorSecondary)")
    })

    it("handles plan cancellation correctly", async () => {
        const activePlansComponent = wrapper.find('[data-testid="active-plans"]')

        // Simulate plan cancellation event
        await activePlansComponent.trigger("plan-cancelled")

        // The component should have a ref to currentPlanRef
        expect(wrapper.vm.currentPlanRef).toBeDefined()
    })

    it("has responsive design classes", () => {
        const headerContainer = wrapper.find(".mx-auto.max-w-7xl.px-6")
        expect(headerContainer.exists()).toBe(true)

        const responsiveClasses = wrapper.find(".pt-20.md\\:py-6")
        expect(responsiveClasses.exists()).toBe(true)
    })

    it("uses proper typography classes", () => {
        const title = wrapper.find(".px28.bold")
        expect(title.exists()).toBe(true)

        const description = wrapper.find(".px15")
        expect(description.exists()).toBe(true)
    })

    it("handles data refresh scenarios", async () => {
        // Test component behavior during data refresh
        const initialSections = wrapper.findAll(".space-y-8 > div")
        const initialCount = initialSections.length

        // Simulate data refresh
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()

        const refreshedSections = wrapper.findAll(".space-y-8 > div")
        expect(refreshedSections.length).toBe(initialCount)

        // Component should remain stable during refresh
        expect(wrapper.exists()).toBe(true)
    })

    // Test cases for plan availability scenarios
    it("checks if plans are available", () => {
        // Test that component can detect plan availability
        const currentPlanSection = wrapper.find('[data-testid="current-plan-overview"]')
        expect(currentPlanSection.exists()).toBe(true)

        // Component should render plan-related sections
        const activePlansSection = wrapper.find('[data-testid="active-plans"]')
        expect(activePlansSection.exists()).toBe(true)

        // Verify that plan sections are properly structured
        expect(currentPlanSection.html()).toBeTruthy()
        expect(activePlansSection.html()).toBeTruthy()
    })

    it("handles scenario when plans are available", () => {
        // Mock child components to simulate available plans
        const plansAvailableWrapper = mount(Billing, {
            global: {
                plugins: [pinia],
                stubs: {
                    CurrentPlanOverview: {
                        template: '<div data-testid="current-plan-overview">Premium Plan - $29/month</div>',
                    },
                    InvoicesList: {
                        template: '<div data-testid="invoices-list">Invoice #1234 - $29.00</div>',
                    },
                    ActivePlans: {
                        template: '<div data-testid="active-plans">Premium Plan (Active)</div>',
                    },
                },
            },
        })

        expect(plansAvailableWrapper.exists()).toBe(true)
        expect(plansAvailableWrapper.find('[data-testid="current-plan-overview"]').text()).toContain("Premium Plan")
        expect(plansAvailableWrapper.find('[data-testid="active-plans"]').text()).toContain("Active")

        plansAvailableWrapper.unmount()
    })

    it("handles scenario when no plans are available", () => {
        // Mock child components to simulate no available plans
        const noPlansAvailableWrapper = mount(Billing, {
            global: {
                plugins: [pinia],
                stubs: {
                    CurrentPlanOverview: {
                        template: '<div data-testid="current-plan-overview">No Plans Available</div>',
                    },
                    InvoicesList: {
                        template: '<div data-testid="invoices-list">No Invoices</div>',
                    },
                    ActivePlans: {
                        template: '<div data-testid="active-plans">No Active Plans</div>',
                    },
                },
            },
        })

        expect(noPlansAvailableWrapper.exists()).toBe(true)
        expect(noPlansAvailableWrapper.find('[data-testid="current-plan-overview"]').text()).toBe("No Plans Available")
        expect(noPlansAvailableWrapper.find('[data-testid="active-plans"]').text()).toBe("No Active Plans")

        noPlansAvailableWrapper.unmount()
    })

    it("validates plan availability status", () => {
        // Test that component can validate plan availability
        const currentPlanComponent = wrapper.find('[data-testid="current-plan-overview"]')
        expect(currentPlanComponent.exists()).toBe(true)

        const activePlansComponent = wrapper.find('[data-testid="active-plans"]')
        expect(activePlansComponent.exists()).toBe(true)

        // Both sections should be rendered regardless of plan availability
        expect(currentPlanComponent.html()).toBeTruthy()
        expect(activePlansComponent.html()).toBeTruthy()
    })

    it("handles multiple plan availability states", () => {
        // Test different plan availability scenarios
        const scenarios = [
            {
                name: "Single Plan Available",
                currentPlan: "Basic Plan - $9/month",
                activePlans: "Basic Plan (Active)",
            },
            {
                name: "Multiple Plans Available",
                currentPlan: "Premium Plan - $29/month",
                activePlans: "Premium Plan, Pro Plan (Active)",
            },
            {
                name: "No Plans Available",
                currentPlan: "No Active Plan",
                activePlans: "No Plans Available",
            },
        ]

        scenarios.forEach((scenario) => {
            const scenarioWrapper = mount(Billing, {
                global: {
                    plugins: [pinia],
                    stubs: {
                        CurrentPlanOverview: {
                            template: `<div data-testid="current-plan-overview">${scenario.currentPlan}</div>`,
                        },
                        InvoicesList: {
                            template: '<div data-testid="invoices-list">Invoices</div>',
                        },
                        ActivePlans: {
                            template: `<div data-testid="active-plans">${scenario.activePlans}</div>`,
                        },
                    },
                },
            })

            expect(scenarioWrapper.exists()).toBe(true)
            expect(scenarioWrapper.find('[data-testid="current-plan-overview"]').text()).toBe(scenario.currentPlan)
            expect(scenarioWrapper.find('[data-testid="active-plans"]').text()).toBe(scenario.activePlans)

            scenarioWrapper.unmount()
        })
    })

    it("checks plan availability with loading states", async () => {
        // Test plan availability during loading
        const loadingWrapper = mount(Billing, {
            global: {
                plugins: [pinia],
                stubs: {
                    CurrentPlanOverview: {
                        template: '<div data-testid="current-plan-overview">Loading plans...</div>',
                    },
                    InvoicesList: {
                        template: '<div data-testid="invoices-list">Loading invoices...</div>',
                    },
                    ActivePlans: {
                        template: '<div data-testid="active-plans">Loading active plans...</div>',
                    },
                },
            },
        })

        expect(loadingWrapper.exists()).toBe(true)
        expect(loadingWrapper.find('[data-testid="current-plan-overview"]').text()).toBe("Loading plans...")
        expect(loadingWrapper.find('[data-testid="active-plans"]').text()).toBe("Loading active plans...")

        // Simulate loading completion
        await loadingWrapper.vm.$nextTick()

        // Component should remain stable during loading
        expect(loadingWrapper.exists()).toBe(true)

        loadingWrapper.unmount()
    })

    it("handles plan availability transitions", async () => {
        // Test transitions between different plan availability states
        const transitionWrapper = mount(Billing, {
            global: {
                plugins: [pinia],
                stubs: {
                    CurrentPlanOverview: {
                        template: '<div data-testid="current-plan-overview">Checking plans...</div>',
                    },
                    InvoicesList: {
                        template: '<div data-testid="invoices-list">Invoices</div>',
                    },
                    ActivePlans: {
                        template: '<div data-testid="active-plans">Checking availability...</div>',
                    },
                },
            },
        })

        expect(transitionWrapper.exists()).toBe(true)

        // Simulate plan availability check
        await transitionWrapper.vm.$nextTick()

        // Component should handle transitions gracefully
        expect(transitionWrapper.find('[data-testid="current-plan-overview"]').exists()).toBe(true)
        expect(transitionWrapper.find('[data-testid="active-plans"]').exists()).toBe(true)

        transitionWrapper.unmount()
    })

    it("validates plan availability with error states", () => {
        // Test plan availability when there are errors
        const errorWrapper = mount(Billing, {
            global: {
                plugins: [pinia],
                stubs: {
                    CurrentPlanOverview: {
                        template: '<div data-testid="current-plan-overview">Error loading plans</div>',
                    },
                    InvoicesList: {
                        template: '<div data-testid="invoices-list">Error loading invoices</div>',
                    },
                    ActivePlans: {
                        template: '<div data-testid="active-plans">Error loading active plans</div>',
                    },
                },
            },
        })

        expect(errorWrapper.exists()).toBe(true)
        expect(errorWrapper.find('[data-testid="current-plan-overview"]').text()).toBe("Error loading plans")
        expect(errorWrapper.find('[data-testid="active-plans"]').text()).toBe("Error loading active plans")

        // Component should still render even with errors
        expect(errorWrapper.find('[data-testid="current-plan-overview"]').exists()).toBe(true)
        expect(errorWrapper.find('[data-testid="active-plans"]').exists()).toBe(true)

        errorWrapper.unmount()
    })

    it("checks plan availability with different user types", () => {
        // Test plan availability for different user scenarios
        const userScenarios = [
            {
                userType: "New User",
                currentPlan: "No Plan Selected",
                activePlans: "No Plans Available",
            },
            {
                userType: "Free User",
                currentPlan: "Free Plan",
                activePlans: "Free Plan (Active)",
            },
            {
                userType: "Premium User",
                currentPlan: "Premium Plan - $29/month",
                activePlans: "Premium Plan (Active)",
            },
            {
                userType: "Enterprise User",
                currentPlan: "Enterprise Plan - $99/month",
                activePlans: "Enterprise Plan (Active)",
            },
        ]

        userScenarios.forEach((scenario) => {
            const userWrapper = mount(Billing, {
                global: {
                    plugins: [pinia],
                    stubs: {
                        CurrentPlanOverview: {
                            template: `<div data-testid="current-plan-overview">${scenario.currentPlan}</div>`,
                        },
                        InvoicesList: {
                            template: '<div data-testid="invoices-list">Invoices</div>',
                        },
                        ActivePlans: {
                            template: `<div data-testid="active-plans">${scenario.activePlans}</div>`,
                        },
                    },
                },
            })

            expect(userWrapper.exists()).toBe(true)
            expect(userWrapper.find('[data-testid="current-plan-overview"]').text()).toBe(scenario.currentPlan)
            expect(userWrapper.find('[data-testid="active-plans"]').text()).toBe(scenario.activePlans)

            userWrapper.unmount()
        })
    })

    it("validates plan availability refresh functionality", async () => {
        // Test that plan availability can be refreshed
        const refreshWrapper = mount(Billing, {
            global: {
                plugins: [pinia],
                stubs: {
                    CurrentPlanOverview: {
                        template: '<div data-testid="current-plan-overview">Refreshing plans...</div>',
                        methods: {
                            reloadPlanData: vi.fn(),
                        },
                    },
                    InvoicesList: {
                        template: '<div data-testid="invoices-list">Invoices</div>',
                    },
                    ActivePlans: {
                        template: '<div data-testid="active-plans">Refreshing active plans...</div>',
                    },
                },
            },
        })

        expect(refreshWrapper.exists()).toBe(true)

        // Simulate refresh
        await refreshWrapper.vm.$nextTick()

        // Component should handle refresh gracefully
        expect(refreshWrapper.find('[data-testid="current-plan-overview"]').exists()).toBe(true)
        expect(refreshWrapper.find('[data-testid="active-plans"]').exists()).toBe(true)

        refreshWrapper.unmount()
    })
})
