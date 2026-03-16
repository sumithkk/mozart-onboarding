<template>
    <div class="mb-8 flex flex-wrap items-center justify-between gap-0 sm:gap-4">
        <p class="text-textColor m-0 text-[1.4rem] font-[700] text-nowrap">{{ title }}</p>
        <ButtonV2 :buttonText="buttonText" @clicked="handleAction" :loaderStatus="loaderStatus" />
    </div>
</template>

<script setup lang="ts">
    defineProps<{
        handleAction: () => void
        loaderStatus: boolean
        title: string
        buttonText: string
    }>()
</script>
