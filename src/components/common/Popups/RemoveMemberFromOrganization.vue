<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="emit('update:show', false)"
  >
    <div class="w-full max-w-md rounded-lg bg-backgroundColor p-6 shadow-xl" @click.stop>
      <div class="mb-4 flex items-center gap-3">
        <div class="rounded-full bg-red-100 p-2">
          <div class="materialSymbolsOutlined text-red-600">warning</div>
        </div>
        <div>
          <h2 class="text-xl font-bold text-textColor">Remove Member</h2>
          <p class="text-sm text-textColor/70">This action cannot be undone</p>
        </div>
      </div>

      <p class="mb-6 text-textColor">
        Are you sure you want to remove
        <strong>{{ member?.name || member?.email || "this user" }}</strong>
        from the organization? They will lose access to all organization resources.
      </p>

      <div v-if="error" class="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
        <div class="flex items-center gap-2 text-red-800">
          <div class="materialSymbolsOutlined text-red-600 text-sm">error</div>
          <p class="text-sm">{{ error }}</p>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          @click="emit('update:show', false)"
          class="flex-1 rounded border border-strokeColor py-2 text-textColor transition-colors hover:bg-sideBarBackgroundColor"
          :disabled="isLoading"
        >
          Cancel
        </button>
        <button
          @click="onConfirm"
          class="flex-1 rounded bg-red-600 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Removing…</span>
          <span v-else>Remove Member</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useOrganizationStore } from "~/store/organization"
import eventBus from "~/util/eventBus"

const props = defineProps<{
  show: boolean
  member: { id?: string; name?: string; email?: string } | null
  organizationId?: string // optional; we’ll fall back to active
}>()

const emit = defineEmits<{
  (e: "update:show", value: boolean): void
  (e: "removed", payload: { memberIdOrEmail: string }): void
}>()

const organizationStore = useOrganizationStore()
const isLoading = ref(false)
const error = ref<string | null>(null)

async function onConfirm() {
  if (!props.member) return

  const key = props.member.id ?? props.member.email ?? null
  if (!key) {
    const msg = "Invalid member."
    error.value = msg
    eventBus.emit("showToast", { _type: "error", message: msg })
    return
  }

  try {
    isLoading.value = true
    error.value = null

    const preActiveId =
      props.organizationId ??
      organizationStore.currentOrganization?.id ??
      (await organizationStore.getActiveOrganization())?.id ?? null

    await organizationStore.removeMember(key as string, props.organizationId)

    if (preActiveId) {
      try { await organizationStore.setActiveOrganization(preActiveId) } catch {}
      try { await organizationStore.fetchOrganizationMembers(preActiveId) } catch {}
    }

    eventBus.emit("showToast", { _type: "success", message: "Member removed." })
    emit("removed", { memberIdOrEmail: key })
    emit("update:show", false)
  } catch (e: any) {
    const msg: string =
      typeof e?.response?.data?.message === "string"
        ? e.response.data.message
        : "Failed to remove member."
    error.value = msg
    eventBus.emit("showToast", { _type: "error", message: msg })
    console.error("removeMember failed:", e)
  } finally {
    isLoading.value = false
  }
}
</script>
