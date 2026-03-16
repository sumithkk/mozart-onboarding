import { ref } from "vue" // Assuming you are using Vue 3
import dataService from "~/services/dataService"
import eventBus from "~/util/eventBus"

export default function useLAData() {
    const config = useRuntimeConfig()
    const laDataStore = useLADataStore()
    const uniqueMatchArray = ref<string[]>([])

    const getGoogleSheetsData = async () => {
        try {
            const response = await dataService(config).getGoogleSheetsData()
            if (!response) {
                console.log("Failed to get google sheets data")
                return
            }
            response.data.rows.slice(1).forEach((row: any) => {
                const sortedMatch = row[6]
                    .split(",")
                    .map((word) => word.trim())
                    .sort()
                    .join(", ")

                const createdDateParts = row[3].split("-")
                const formattedCreatedDate = `${createdDateParts[1]}-${createdDateParts[2]}-${createdDateParts[0]}`

                const loadedDateParts = row[2].split("-")
                const formattedLoadedDate = `${loadedDateParts[1]}-${loadedDateParts[2]}-${loadedDateParts[0]}`

                // Process uniqueMatch array
                row[6].split(",").forEach((word: string) => {
                    const trimmedWord = word.trim()
                    if (trimmedWord) {
                        uniqueMatchArray.value.push(trimmedWord)
                    }
                })

                laDataStore.rows.push({
                    City: row[0],
                    Tags: row[1],
                    Loaded_At: formattedLoadedDate,
                    Created_At: formattedCreatedDate,
                    URL: row[4],
                    Highlighted: row[5],
                    Match: sortedMatch,
                    Match_Count: row[7],
                    MaximizedMatch: row[1],
                    Pages: row[8],
                    Pages_Match: row[6],
                    comment: "",
                    Selected: false,
                })
            })

            laDataStore.isDataLoaded = true
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
        }
    }

    return {
        getGoogleSheetsData,
    }
}
