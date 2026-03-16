import paymentService from "~/services/paymentService"
import eventBus from "~/util/eventBus"

export default function useStripePayment() {
    const config = useRuntimeConfig()

    const handleError = (error: any) => {
        console.log(error)
        const message = error?.message || error?.response?.data?.message || "Something went wrong"
        eventBus.emit("showToast", {
            message: message,
            _type: "error",
        })
    }

    const renew = async (lookupKey: string, quantity: number, organizationName: string) => {
        try {
            return await paymentService(config).renew(lookupKey, quantity, organizationName)
        } catch (error: any) {
            handleError(error)
        }
    }

    const createPortalSession = async () => {
        try {
            return await paymentService(config).createPortalSession()
        } catch (error: any) {
            handleError(error)
        }
    }

    const createCheckoutSession = async (product: any) => {
        try {
            const url: any = await paymentService(config).createCheckoutSession(product)
            if (url) {
                window.location.href = url
            }
        } catch (error: any) {
            handleError(error)
            return error
        }
    }

    const getAllActivePlans = async () => {
        try {
            return await paymentService(config).getAllActivePlans()
        } catch (error: any) {
            handleError(error)
            return error
        }
    }

    const getCustomerInvoices = async () => {
        try {
            return await paymentService(config).getCustomerInvoices()
        } catch (error: any) {
            handleError(error)
            return error
        }
    }

    const getAllProducts = async () => {
        try {
            return await paymentService(config).getAllProducts()
        } catch (error: any) {
            handleError(error)
            return error
        }
    }

    const cancelSubscription = async (subscriptionId: string) => {
        try {
            return await paymentService(config).cancelSubscription(subscriptionId)
        } catch (error: any) {
            handleError(error)
            return error
        }
    }

    return {
        renew,
        createPortalSession,
        createCheckoutSession,
        getAllActivePlans,
        getCustomerInvoices,
        getAllProducts,
        cancelSubscription,
    }
}
