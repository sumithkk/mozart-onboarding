<script setup lang="ts">
    import { defineEmits, ref, watch } from "vue"
    import { Squares2X2Icon, ListBulletIcon, CheckIcon } from "@heroicons/vue/24/outline"

    const props = defineProps<{
        modelValue: "grid" | "list"
    }>()

    const emit = defineEmits<{
        (e: "update:modelValue", value: "grid" | "list"): void
    }>()

    const view = ref(props.modelValue)

    watch(
        () => props.modelValue,
        (newVal) => {
            view.value = newVal
        }
    )

    const toggleView = (val: "grid" | "list") => {
        view.value = val
        emit("update:modelValue", val)
    }
</script>

<template>
    <div class="border-border inline-flex overflow-hidden rounded-full border">
        <button @click="toggleView('list')" :class="view === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-white text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'" class="flex items-center justify-center view-switch-md" title="Switch to list view">
            <CheckIcon v-if="view === 'list'" class="icons-md" />
            <ListBulletIcon class="icons-md" />
        </button>

        <button @click="toggleView('grid')" :class="view === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-white text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'" class="flex items-center justify-center view-switch-md" title="Switch to grid view">
            <CheckIcon v-if="view === 'grid'" class="icons-md" />
            <Squares2X2Icon class="icons-md" />
        </button>
    </div>
</template>
