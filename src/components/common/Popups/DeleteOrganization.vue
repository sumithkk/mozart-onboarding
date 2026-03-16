<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="emit('update:show', false)"
  >
    <div
      class="w-full max-w-md rounded-lg bg-backgroundColor p-6 shadow-xl"
      @click.stop
    >
      <!-- Header -->
      <div class="mb-4 flex items-center gap-3">
        <div class="rounded-full bg-red-100 p-2">
          <div class="materialSymbolsOutlined text-red-600">warning</div>
        </div>
        <div>
          <h2 class="text-xl font-bold text-textColor">Delete Organization</h2>
          <p class="text-sm text-textColor/70">
            This action cannot be undone
          </p>
        </div>
      </div>

      <p class="mb-6 text-textColor">
        Are you sure you want to delete
        <strong>{{ organization?.name }}</strong>?  
        All data for this organization will be permanently removed.
      </p>

      <!-- Buttons -->
      <div class="flex gap-2">
        <button
          @click="emit('update:show', false)"
          class="flex-1 rounded border border-strokeColor py-2 text-textColor transition-colors hover:bg-sideBarBackgroundColor"
        >
          Cancel
        </button>
        <button
          @click="confirmDelete"
          :disabled="isDeleting"
          class="flex-1 rounded bg-red-600 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isDeleting" class="flex items-center justify-center gap-2">
            <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            Deleting…
          </span>
          <span v-else>Delete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import eventBus from "~/util/eventBus"
import { useOrganizationStore } from "~/store/organization"

const props = defineProps<{
  show: boolean
  organization: any | null
}>()

const emit = defineEmits(["update:show", "deleted"])

const organizationStore = useOrganizationStore()

const isDeleting = ref(false)

async function confirmDelete() {
  if (!props.organization?.id) return

  try {
    isDeleting.value = true
    
    await organizationStore.deleteOrganization(props.organization.id)

    eventBus.emit("showToast", {
      _type: "success",
      message: `Organization "${props.organization.name}" deleted successfully`,
    })

    emit("deleted", props.organization.id)
    emit("update:show", false)
  } catch (err) {
    console.error("Failed to delete org", err)
    eventBus.emit("showToast", {
      _type: "error",
      message: "Failed to delete organization",
    })
  } finally {
    isDeleting.value = false
  }
}
</script>
