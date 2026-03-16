import paymentService from "~/services/paymentService"
import eventBus from "~/util/eventBus"
export default function useUser() {
    const config = useRuntimeConfig()
    const userStore = useUserStore()
    const renew = async (lookupKey: string, quantity: number, organizationName: string) => {
        try {
            const response: any = await paymentService(config).renew(lookupKey, quantity, organizationName)
            if (!response) {
                console.log("Failed to login")
                return
            }
            return response
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
        }
    }
    const createPortalSession = async () => {
        try {
            const response: any = await paymentService(config).createPortalSession()
            if (!response) {
                console.log("Failed to login")
                return
            }
            return response
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
        }
    }
    return { renew, createPortalSession }
}
