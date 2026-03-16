<template>
  <div class="border-border flex overflow-hidden rounded-full border w-fit">
    <!-- Members button -->
    <button
      @click="toggleView('members')"
      :class="view === 'members'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-white text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'"
      class="flex flex-1 items-center justify-center gap-2 px-4 py-1"
      title="Switch to members view"
    >
      <CheckIcon v-if="view === 'members'" class="h-4 w-4" />
      <UserGroupIcon class="h-4 w-4" />
      <span class="text-sm">Members</span>
    </button>

    <!-- Organizations button -->
    <button
      @click="toggleView('organizations')"
      :class="view === 'organizations'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-white text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'"
      class="flex flex-1 items-center justify-center gap-2 px-4 py-1"
      title="Switch to organizations view"
    >
      <CheckIcon v-if="view === 'organizations'" class="h-4 w-4" />
      <BuildingOffice2Icon class="h-4 w-4" />
      <span class="text-sm">Organizations</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { UserGroupIcon, BuildingOffice2Icon, CheckIcon } from "@heroicons/vue/24/outline"

const props = defineProps<{
  modelValue: "members" | "organizations"
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: "members" | "organizations"): void
}>()

const view = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    view.value = newVal
  }
)

const toggleView = (val: "members" | "organizations") => {
  view.value = val
  emit("update:modelValue", val)
}
</script>