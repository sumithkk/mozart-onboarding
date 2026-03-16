import { defineStore } from "pinia"
import type { IIntegrationStore } from "@/types/store"

export const useIntegrationStore = defineStore("integration", {
    state: (): IIntegrationStore => ({
        integrations: [],
        isGettingIntegrations: false,
    }),
    actions: {
        async getIntegrations() {
            const { getIntegrations: fetchIntegrations } = useUser()
            this.isGettingIntegrations = true
            const integrations = await fetchIntegrations()

            if (integrations && Array.isArray(integrations)) {
                this.integrations = integrations
            } else {
                this.integrations = []
            }
            this.isGettingIntegrations = false
        },
        async disconnectIntegration(integrationId: string) {
            const { deleteUserIntegration: disconnectIntegration } = useUser()
            await disconnectIntegration(integrationId)

            // Re-fetch to update status
            await this.getIntegrations()
        },
    },
    getters: {},
})
