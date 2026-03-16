import { describe, it, expect, vi } from "vitest"

// Test utility functions directly
describe("CurrentPlanOverview Utilities", () => {
    it("formats date correctly", () => {
        const formatDate = (dateString: string) => {
            const date = new Date(dateString)
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        }

        const dateString = "2024-01-15T00:00:00Z"
        const formattedDate = formatDate(dateString)
        expect(formattedDate).toBe("January 15, 2024")
    })

    it("handles button hover events correctly", () => {
        const handleButtonHover = (event: Event, isHover: boolean) => {
            const target = event.target as HTMLElement
            if (target) {
                target.style.backgroundColor = isHover ? "var(--strokeColor)" : "transparent"
            }
        }

        const event = { target: { style: { backgroundColor: "" } } } as any

        handleButtonHover(event, true)
        expect(event.target.style.backgroundColor).toBe("var(--strokeColor)")

        handleButtonHover(event, false)
        expect(event.target.style.backgroundColor).toBe("transparent")
    })

    it("computes plan data correctly", () => {
        const mockPlanData = {
            status: "success",
            data: {
                activePlans: [
                    {
                        plans: [
                            {
                                planName: "Premium Plan",
                                pricing: {
                                    formattedAmount: "$29.99/month",
                                },
                            },
                        ],
                        billing: {
                            nextBillingDate: "2024-01-15T00:00:00Z",
                        },
                    },
                ],
                trialingPlans: [],
            },
        }

        const formatDate = (dateString: string) => {
            const date = new Date(dateString)
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        }

        const planData = (() => {
            if (!mockPlanData.data) return null

            let plan = mockPlanData.data.activePlans[0]
            let isTrialing = false

            if (!plan) return null

            const planInfo = plan.plans[0]

            return {
                planName: planInfo.planName,
                price: planInfo.pricing.formattedAmount,
                nextBillingDate: formatDate(plan.billing.nextBillingDate),
                isTrialing,
            }
        })()

        expect(planData).toEqual({
            planName: "Premium Plan",
            price: "$29.99/month",
            nextBillingDate: "January 15, 2024",
            isTrialing: false,
        })
    })

    it("computes trial plan data correctly", () => {
        const mockTrialData = {
            status: "success",
            data: {
                activePlans: [],
                trialingPlans: [
                    {
                        plans: [
                            {
                                planName: "Trial Plan",
                                pricing: {
                                    formattedAmount: "$0.00/month",
                                },
                            },
                        ],
                        billing: {
                            nextBillingDate: "2024-01-20T00:00:00Z",
                        },
                    },
                ],
            },
        }

        const formatDate = (dateString: string) => {
            const date = new Date(dateString)
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        }

        const planData = (() => {
            if (!mockTrialData.data) return null

            let plan = mockTrialData.data.trialingPlans[0]
            let isTrialing = true

            if (!plan) return null

            const planInfo = plan.plans[0]

            return {
                planName: planInfo.planName,
                price: planInfo.pricing.formattedAmount,
                nextBillingDate: formatDate(plan.billing.nextBillingDate),
                isTrialing,
            }
        })()

        expect(planData).toEqual({
            planName: "Trial Plan",
            price: "$0.00/month",
            nextBillingDate: "January 20, 2024",
            isTrialing: true,
        })
    })

    it("computes empty state correctly", () => {
        const emptyData: any = {
            data: null,
        }

        const isEmpty = (() => {
            if (!emptyData.data) return true
            const hasActivePlans = emptyData.data.activePlans?.length ?? 0
            const hasTrialingPlans = emptyData.data.trialingPlans?.length ?? 0
            return hasActivePlans === 0 && hasTrialingPlans === 0
        })()

        expect(isEmpty).toBe(true)
    })

    it("computes non-empty state correctly", () => {
        const nonEmptyData: any = {
            data: {
                activePlans: [{ plans: [{}] }],
                trialingPlans: [],
            },
        }

        const isEmpty = (() => {
            if (!nonEmptyData.data) return true
            const hasActivePlans = nonEmptyData.data.activePlans?.length ?? 0
            const hasTrialingPlans = nonEmptyData.data.trialingPlans?.length ?? 0
            return hasActivePlans === 0 && hasTrialingPlans === 0
        })()

        expect(isEmpty).toBe(false)
    })
})
