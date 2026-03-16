import axios from "axios"
import cookie from "js-cookie"
import { useUserStore } from "@/store/user"

export default function paymentService($config: any) {
    const userStore = useUserStore()
    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + cookie.get("mozart"),
        "X-Timezone": userStore.timezone || "",
    }
    const apiClient = axios.create({
        baseURL: $config.public.apiUrl,
        headers,
        withCredentials: true,
    })

    const renew = (planName: string, quantity: number, organizationName: string) => {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/payments/stripe/renew", { planName, quantity, organizationName })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("renew error:", error)
                    reject(error.data)
                })
        })
    }
    const createPortalSession = () => {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/payments/stripe/createPortalSession")
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("createPortalSession error:", error)
                    reject(error.data)
                })
        })
    }

    // new stripe  payment api integration
    const createCheckoutSession = (product: any) => {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/payments/stripe/create-checkout-session", {
                    product,
                })
                .then((response) => {
                    const data = response.data
                    if (data?.status === "success" && data?.data?.url) {
                        resolve(data.data.url)
                    } else {
                        console.error("Unexpected checkout session response:", data)
                        reject(data)
                    }
                })
                .catch((error) => {
                    console.error("createCheckoutSession error:", error)
                    reject(error.response?.data || error)
                })
        })
    }

    const getAllActivePlans = () => {
        return new Promise((resolve, reject) => {
            apiClient
                .get("/api/v1/payments/stripe/get-all-active-plan")
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getAllActivePlans error:", error)
                    reject(error.response?.data || error)
                })
        })
    }

    const getCustomerInvoices = () => {
        return new Promise((resolve, reject) => {
            apiClient
                .get("/api/v1/payments/stripe/get-customer-invoices")
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getCustomerInvoices error:", error)
                    reject(error.response?.data || error)
                })
        })
    }

    const getAllProducts = () => {
        return new Promise((resolve, reject) => {
            apiClient
                .get("/api/v1/payments/stripe/all-product")
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getAllProducts error:", error)
                    reject(error.response?.data || error)
                })
        })
    }

    const cancelSubscription = (subscriptionId: string) => {
        return new Promise((resolve, reject) => {
            apiClient
                .post("/api/v1/payments/stripe/cancel-subscription", { subscriptionId })
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("cancelSubscription error:", error)
                    reject(error.response?.data || error)
                })
        })
    }

    return {
        createPortalSession,
        renew,
        createCheckoutSession,
        getAllActivePlans,
        getCustomerInvoices,
        getAllProducts,
        cancelSubscription,
    }
}
