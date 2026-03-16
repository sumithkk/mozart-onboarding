<template>
    <div class="text-foreground flex-col">
        <div class="flex justify-between gap-5 py-2">
            Host:
            <DropdownV2 :currentlySelected="vectorDatabaseConfig.currentlySelectedHost.value" :items="vectorDatabaseConfig.hostOptions.value" @update:selected="vectorDatabaseConfig.onHostUpdateSelected" />
        </div>
        <div class="flex justify-between gap-5 py-2">
            Source:
            <DropdownV2 :currentlySelected="vectorDatabaseConfig.currentlySelectedSource.value" :items="vectorDatabaseConfig.sourceOptions.value" @update:selected="vectorDatabaseConfig.onSourceUpdateSelected" />
        </div>
        <div class="flex justify-between gap-5 py-2">
            Collection:
            <DropdownV2 :currentlySelected="vectorDatabaseConfig.currentCollectionName.value" :items="vectorDatabaseConfig.collectionOptions.value" @update:selected="vectorDatabaseConfig.onCollectionUpdateSelected" />
        </div>
    </div>
</template>

<script lang="ts" setup>
    import useVectorDatabaseConfig from "@/composables/useVectorDatabaseConfig"
    const rag = useRag()

    const vectorDatabaseConfig = useVectorDatabaseConfig()

    watch(vectorDatabaseConfig.currentCollection, async () => {
        const collectionName = vectorDatabaseConfig.currentCollection.value
        await useRag().getCollectionPointCount(collectionName)
        await useRag().getCollectionData(collectionName)
    })
    onMounted(async () => {
        // Collections are already loaded by layout, no need to call again
    })
</script>
