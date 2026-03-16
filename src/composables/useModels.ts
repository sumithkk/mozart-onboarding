export default function useModels() {
    const modelStore = useModelStore()

    return {
        // State
        models: computed(() => modelStore.models),
        currentModel: computed(() => modelStore.current),
        loading: computed(() => modelStore.loading),
        error: computed(() => modelStore.error),

        // Actions
        loadModels: () => modelStore.loadModels(),
        setCurrentModel: (model: any) => modelStore.setCurrent(model),
        getCurrentModel: () => modelStore.getCurrent(),
        refreshModels: () => modelStore.refreshModels(),

        // Computed helpers
        getModelsByProvider: (provider: string) => modelStore.getModelsByProvider(provider),
        getEnabledModels: () => modelStore.getEnabledModels(),

        // Helper methods
        getModelById: (modelId: string) => modelStore.models.find((model: ISingleModel) => model.model === modelId),
        isModelEnabled: (modelId: string) => {
            const model = modelStore.models.find((model: ISingleModel) => model.model === modelId)
            return model?.isEnabled || false
        },
    }
}
