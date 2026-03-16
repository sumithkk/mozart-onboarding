import analyticsService from "~/services/analyticsServices"
import eventBus from "~/util/eventBus"

export default function useAnalytics() {
    const config = useRuntimeConfig()

    const handleError = (error: any) => {
        console.log(error)
        const message = error?.message || error?.response?.data?.message || "Something went wrong"
        eventBus.emit("showToast", {
            message: message,
            _type: "error",
        })
    }

    const highestConversations = async (period: string = "year", model: string = "all", userType: string = "all", userId?: string) => {
        try {
            return await analyticsService(config).highestConversation(period, model, userType, userId)
        } catch (error: any) {
            handleError(error)
        }
    }

    const useperiodicUsage = async (period: string = "year", model: string = "all", userType: string = "all", userId?: string) => {
        try {
            return await analyticsService(config).periodicUsage(period, model, userType, userId)
        } catch (error: any) {
            handleError(error)
        }
    }

    const useChartTypeDistribution = async (period: string = "year", model: string = "all", userType: string = "all", userId?: string) => {
        try {
            return await analyticsService(config).chartTypeDistribution(period, model, userType, userId)
        } catch (error: any) {
            handleError(error)
        }
    }

    return {
        useperiodicUsage,
        useChartTypeDistribution,
        highestConversations,
    }
}
