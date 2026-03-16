<template>
    <div class="header-wrapper mt-10 mb-2 flex flex-wrap items-center justify-between md:mt-0">
        <h1 class="text-textColor text-2xl font-bold">Logs</h1>

        <div class="flex items-center gap-4 text-sm">
            <!-- Filters -->
            <div class="border-strokeColor flex items-center gap-2 border-r pr-1 md:pr-4">
                <DropdownV2 label="Log Type" :currentlySelected="selectedLogTypeText" :items="logTypeOptions" @update:selected="$emit('update-log-type', $event)" />

                <DropdownV2 label="Platform" :currentlySelected="selectedPlatform" :items="platformOptions" @update:selected="$emit('update-platform', $event)" />

                <DropdownV2 label="Environment" :currentlySelected="selectedEnvironment" :items="environmentOptions" @update:selected="$emit('update-environment', $event)" />
            </div>

            <!-- Timezone Switch -->
            <div class="log-type-switch-wrapper text-textColor flex gap-1">
                <div class="log-type-switch-option bg-itemColor cursor-pointer rounded-[8px] px-2 py-2 text-sm transition-colors duration-300" :class="{ 'bg-logoColor text-white': timezone === 'PDT' }" @click="$emit('change-timezone')">PDT</div>
                <div class="log-type-switch-option bg-itemColor cursor-pointer rounded-[8px] px-2 py-2 text-sm transition-colors duration-300" :class="{ 'bg-logoColor text-white': timezone === 'EDT' }" @click="$emit('change-timezone')">EDT</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    // ===== PROPS =====
    const props = defineProps<{
        timezone: string
        selectedPlatform: string
        selectedEnvironment: string
        selectedLogTypeText: string
        logTypeOptions: Array<{ text: string; value: string }>
        platformOptions: Array<{ text: string; value: string }>
        environmentOptions: Array<{ text: string; value: string }>
    }>()

    // ===== EMITS =====
    const emit = defineEmits<{
        "change-timezone": []
        "update-log-type": [selected: { text: string; value: string }]
        "update-platform": [platform: { text: string; value: string }]
        "update-environment": [environment: { text: string; value: string }]
    }>()
</script>
