<template>
    <RagServiceTable v-if="ragData.length > 0" :data="ragData" />
</template>
<script lang="ts" setup>
    const ragStore = useRagStore()
    const ragData = computed(() =>
        ragStore.ragData.map((item: any) => {
            delete item.vector
            return item
        })
    )
</script>
