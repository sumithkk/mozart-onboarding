// Payment and subscription related types

interface Plan {
    id: number
    subscriptionId: string
    name: string
    price: string
    billingCycle: string
    nextPayment: string
    startDate: string
    autoRenew: boolean
    isTrialing: boolean
    original: any
}

interface StripeSubscription {
    subscriptionId: string
    plans: Array<{
        planName: string
        pricing: {
            formattedAmount: string
            interval: string
        }
    }>
    billing: {
        nextBillingDate: string
        currentPeriodStart: string
    }
    renewal: {
        autoRenew: boolean
    }
}

interface PaymentResponse {
    status: string
    data?: {
        activePlans?: StripeSubscription[]
        trialingPlans?: StripeSubscription[]
        [key: string]: any
    }
}
