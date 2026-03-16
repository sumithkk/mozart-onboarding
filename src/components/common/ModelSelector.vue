<template>
    <div class="model-selector">
        <label v-if="label" class="text-textColor text-foreground mb-2 block text-sm font-medium">
            {{ label }}
        </label>

        <div v-if="models.loading" class="flex items-center justify-center p-4">
            <div class="materialSymbolsOutlined text-muted-foreground animate-spin text-lg">sync</div>
            <span class="text-muted-foreground ml-2 text-sm">Loading models...</span>
        </div>

        <div v-else-if="models.error" class="text-destructive p-2 text-sm">
            {{ models.error }}
        </div>

        <select v-else :value="selectedModel" @change="handleModelChange" class="border-border bg-sideBarBackgroundColor text-textColor focus:border-primaryColor focus:ring-primaryColor border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none" :disabled="disabled">
            <option value="" disabled>Select a model</option>
            <optgroup v-for="(providerModels, provider) in groupedModels" :key="provider" :label="String(provider)">
                <option v-for="model in providerModels" :key="model.model" :value="model.model" :disabled="!model.isEnabled">{{ model.name }} {{ !model.isEnabled ? "(Disabled)" : "" }}</option>
            </optgroup>
        </select>

        <div v-if="selectedModelInfo" class="text-muted-foreground mt-2 text-xs">
            <div>{{ selectedModelInfo.description }}</div>
            <div v-if="selectedModelInfo.isThinkingSupported" class="text-primary">✓ Thinking supported</div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from "vue"

    interface Props {
        model?: string
        label?: string
        disabled?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        model: "",
        label: "AI Model",
        disabled: false,
    })

    const emit = defineEmits<{
        "update:model": [value: string]
        change: [model: ISingleModel]
    }>()

    // Import the composable
    const models = useModels()

    // Computed
    const groupedModels = computed(() => {
        const grouped: { [key: string]: ISingleModel[] } = {}
        models.models.value.forEach((model: ISingleModel) => {
            if (!grouped[model.AIName]) {
                grouped[model.AIName] = []
            }
            grouped[model.AIName].push(model)
        })
        return grouped
    })

    const selectedModel = computed(() => props.model || models.currentModel.value?.model || "")

    const selectedModelInfo = computed(() => {
        if (!selectedModel.value) return null
        return models.getModelById(selectedModel.value)
    })

    // Methods
    const handleModelChange = (event: Event) => {
        const target = event.target as HTMLSelectElement
        const modelId = target.value

        if (modelId) {
            const model = models.getModelById(modelId)
            if (model) {
                emit("update:model", modelId)
                emit("change", model)
            }
        }
    }
</script>
