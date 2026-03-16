import axios from "axios"
import cookie from "js-cookie"
import { useUserStore } from "@/store/user"

export default function userService($config: any) {
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

    function getGoogleSheetsData() {
        return new Promise((resolve, reject) => {
            apiClient
                .get("/api/v1/landadvisors/getSheets")
                .then((response) => resolve(response.data))
                .catch((error) => {
                    console.error("getGoogleSheetsData error:", error)
                    reject(error)
                })
        })
    }

    return {
        getGoogleSheetsData,
    }
}
