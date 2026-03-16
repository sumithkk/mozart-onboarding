export default function useVectorDatabaseConfig() {
    const ragStore = useRagStore()

    const sourceOptions = ref([{ text: "Qdrant DB", value: "qdrant" }])
    const hostOptions = ref([
        { text: "Local", value: "local" },
        { text: "Cloud", value: "cloud" },
    ])

    const currentlySelectedHost = ref(ragStore.currentQdrantInstance || "local")
    const currentlySelectedSource = ref("qdrant")
    const currentCollection = computed(() => ragStore.currentCollection)
    const currentCollectionName = computed(() => {
        return ragStore.collections.find((collection) => collection.name === ragStore.currentCollection)?.alias || ragStore.currentCollection
    })

    const collectionOptions = computed(() => {
        let options = []
        for (const collection of ragStore.collections) {
            if (collection.service && collection.service !== ragStore.currentQdrantInstance) continue
            options.push({ text: collection.alias || collection.name, value: collection.name })
        }

        // Only auto-select if NO collection is currently set
        if (!ragStore.currentCollection && ragStore.collections.length > 0 && options.length > 0) {
            const userStore = useUserStore()
            if (userStore.defaultCollection) {
                const index = options.findIndex((option) => option.value === userStore.defaultCollection)
                if (index >= 0) {
                    ragStore.currentCollection = userStore.defaultCollection
                } else {
                    ragStore.currentCollection = options[0].value
                }
            } else {
                ragStore.currentCollection = options[0].value
            }
        }
        return options
    })

    const onHostUpdateSelected = (selected: any) => {
        currentlySelectedHost.value = selected.value
        ragStore.currentQdrantInstance = selected.value
    }
    const onSourceUpdateSelected = (selected: any) => {
        currentlySelectedSource.value = selected.value
    }
    const onCollectionUpdateSelected = (selected: any) => {
        ragStore.currentCollection = selected.value
    }

    return {
        sourceOptions,
        hostOptions,
        collectionOptions,
        currentlySelectedHost,
        currentCollection,
        currentCollectionName,
        currentlySelectedSource,
        onHostUpdateSelected,
        onSourceUpdateSelected,
        onCollectionUpdateSelected,
    }
}
