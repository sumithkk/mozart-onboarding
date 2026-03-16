import ragService from "~/services/ragService"

export default function useMozartRAGService() {
    const config = useRuntimeConfig()
    const _ragService = ragService(config)
    const allCollection = ref([])

    async function getAllCollections() {
        try {
            const response: any = await _ragService.getAllCollections()
            if (response.code === 200) return (allCollection.value = response.data)
            return []
        } catch (error) {
            console.error(error)
        }
    }

    return {
        getAllCollections,
        allCollection,
    }
}
