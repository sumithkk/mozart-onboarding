<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[1010] flex h-screen w-screen items-center justify-center bg-background/50 backdrop-blur-[2px]"
    @click.self="emit('update:show', false)"
  >
    <div
      class="bg-backgroundColor text-textColor relative m-[15px] w-full max-w-md rounded-md p-6 shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
      @click.stop
    >
      <!-- Header -->
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-textColor">Update Organization</h2>
        <button
          @click="emit('update:show', false)"
          class="rounded p-1 text-textColor/70 hover:bg-sideBarBackgroundColor hover:text-textColor"
        >
          <div class="materialSymbolsOutlined">close</div>
        </button>
      </div>

      <!-- Profile Image -->
      <div class="mb-4 flex w-full items-center justify-center">
        <img
          v-if="orgLogo"
          :src="orgLogo"
          alt="Org Logo"
          class="border-border h-[120px] w-[120px] rounded-full border-4 object-cover"
        />
        <InitialAvatar
          v-else
          :name="editOrg.name || 'Org'"
          size="120"
        />
      </div>

      <!-- Form -->
      <form @submit.prevent="saveOrganization" class="space-y-4">
        <!-- Select Organization -->
        <div>
          <label class="block text-sm font-medium text-textColor mb-2"
            >Select Organization</label
          >
          <select
            v-model="selectedOrgId"
            required
            :disabled="isSaving"
            class="w-full rounded border border-strokeColor bg-sideBarBackgroundColor px-3 py-2 text-textColor focus:border-itemColor focus:outline-none focus:ring-1 focus:ring-itemColor"
          >
            <option disabled value="">-- Choose an organization --</option>
            <option
              v-for="org in organizations"
              :key="org.id"
              :value="org.id"
            >
              {{ org.name }}
            </option>
          </select>
        </div>

        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-textColor mb-2">Name</label>
          <input
            v-model="editOrg.name"
            type="text"
            required
            :disabled="isSaving"
            class="w-full rounded border border-strokeColor bg-sideBarBackgroundColor px-3 py-2 text-textColor focus:border-itemColor focus:outline-none focus:ring-1 focus:ring-itemColor"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-textColor mb-2"
            >Description</label
          >
          <input
            v-model="editOrg.metadata.description"
            type="text"
            :disabled="isSaving"
            class="w-full rounded border border-strokeColor bg-sideBarBackgroundColor px-3 py-2 text-textColor focus:border-itemColor focus:outline-none focus:ring-1 focus:ring-itemColor"
          />
        </div>

        <!-- Slug -->
        <div>
          <label class="block text-sm font-medium text-textColor mb-2">Slug</label>
          <input
            v-model="editOrg.slug"
            type="text"
            required
            :disabled="isSaving"
            class="w-full rounded border border-strokeColor bg-sideBarBackgroundColor px-3 py-2 text-textColor focus:border-itemColor focus:outline-none focus:ring-1 focus:ring-itemColor"
          />
        </div>

        <!-- Buttons -->
        <div class="flex gap-2 pt-4">
          <button
            type="button"
            @click="emit('update:show', false)"
            class="flex-1 rounded border border-strokeColor py-2 text-textColor transition-colors hover:bg-sideBarBackgroundColor"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSaving || !editOrg.name || !editOrg.slug"
            class="flex-1 rounded bg-logoColor py-2 text-white transition-colors hover:bg-logoColor/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSaving" class="flex items-center justify-center gap-2">
              <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Updating…
            </span>
            <span v-else>Update</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from "vue"
import { useOrganizationStore } from "~/store/organization"
import eventBus from "~/util/eventBus"

const props = defineProps({
  show: Boolean,
  selectedOrganization: { type: Object, default: null },
})

const emit = defineEmits(["update:show", "buttonClick"])

const organizationStore = useOrganizationStore()

const isSaving = ref(false)

const orgLogo = computed(() =>
  editOrg.organizationLogo || (editOrg as any).logo || ""
)

// Only show the org passed by the parent (owner-only flow)
const organizations = computed(() => {
  return props.selectedOrganization && props.selectedOrganization.id
    ? [props.selectedOrganization]
    : []
})

const selectedOrgId = ref("")

const editOrg = reactive({
  id: "",
  name: "",
  metadata: {
    description: "",
    isPersonal: false,
  },
  slug: "",
  organizationLogo: "",
})

// initialize from selectedOrganization when modal opens
watch(
  () => props.show,
  (open) => {
    if (!open) return
    const org = props.selectedOrganization || null
    if (!org?.id) return
    selectedOrgId.value = org.id
    editOrg.id = org.id
    editOrg.name = org.name || ""
    editOrg.slug = org.slug || ""
    editOrg.organizationLogo = org.logo || org.organizationLogo || ""
    try {
      editOrg.metadata =
        typeof org.metadata === "string"
          ? JSON.parse(org.metadata || "{}")
          : (org.metadata || { description: "", isPersonal: false })
    } catch {
      editOrg.metadata = { description: "", isPersonal: false }
    }
  },
  { immediate: true }
)

// keep reactive if user toggles the (now single-option) select
watch(selectedOrgId, (id) => {
  const org = organizations.value.find((o) => o.id === id)
  if (!org) return
  editOrg.id = org.id
  editOrg.name = org.name || ""
  editOrg.slug = org.slug || ""
  editOrg.organizationLogo = org.logo || org.organizationLogo || ""
  try {
    editOrg.metadata =
      typeof org.metadata === "string"
        ? JSON.parse(org.metadata || "{}")
        : (org.metadata || { description: "", isPersonal: false })
  } catch {
    editOrg.metadata = { description: "", isPersonal: false }
  }
})

async function saveOrganization() {
  if (!editOrg.id) return

  try {
    isSaving.value = true
    await organizationStore.updateOrganization(editOrg.id, {
      name: editOrg.name,
      slug: editOrg.slug,
      logo: editOrg.organizationLogo,
      metadata: editOrg.metadata,
    })

    eventBus.emit("showToast", {
      _type: "success",
      message: "Organization updated successfully",
    })

    emit("buttonClick", "confirm", { ...editOrg })
    emit("update:show", false)
  } catch (err) {
    console.error("Failed to update org", err)
    eventBus.emit("showToast", {
      _type: "error",
      message: "Failed to update organization",
    })
  } finally {
    isSaving.value = false
  }
}
</script>
