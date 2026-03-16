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

    const highestConversation = (period: string = "year", model: string = "all", userType: string = "all", userId?: string) => {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/costAnalytics/highestConversations?period=${period}&model=${model}&userType=${userType}&userId=${userId}`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("periodicUsage error:", error)
                    reject(error.data)
                })
        })
    }

    const periodicUsage = (period: string = "year", model: string = "all", userType: string = "all", userId?: string) => {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/costAnalytics/periodicDistribution?period=${period}&model=${model}&userType=${userType}&userId=${userId}`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("periodicUsage error:", error)
                    reject(error.data)
                })
        })
    }
    const chartTypeDistribution = (period: string = "year", model: string = "all", userType: string = "all", userId?: string) => {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/api/v1/costAnalytics/gptDistribution?period=${period}&model=${model}&userType=${userType}&userId=${userId}`)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("chartTypeDistribution error:", error)
                    reject(error.data)
                })
        })
    }
    return {
        highestConversation,
        periodicUsage,
        chartTypeDistribution,
    }
}
