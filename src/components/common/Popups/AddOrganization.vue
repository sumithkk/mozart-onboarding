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
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-textColor">Add New Organization</h2>
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
          :name="form.name || 'Org'"
          size="120"
        />
      </div>

      <!-- Form -->
      <form @submit.prevent="saveOrganization" class="space-y-4">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-textColor mb-2">Name</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full rounded border border-strokeColor bg-sideBarBackgroundColor px-3 py-2 text-textColor focus:border-itemColor focus:outline-none focus:ring-1 focus:ring-itemColor"
            placeholder="Enter organization name"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-textColor mb-2">Description</label>
          <input
            v-model="form.description"
            type="text"
            class="w-full rounded border border-strokeColor bg-sideBarBackgroundColor px-3 py-2 text-textColor focus:border-itemColor focus:outline-none focus:ring-1 focus:ring-itemColor"
            placeholder="Enter organization description"
          />
        </div>

        <!-- Slug -->
        <div>
          <label class="block text-sm font-medium text-textColor mb-2">Slug</label>
          <input
            v-model="form.slug"
            type="text"
            required
            class="w-full rounded border border-strokeColor bg-sideBarBackgroundColor px-3 py-2 text-textColor focus:border-itemColor focus:outline-none focus:ring-1 focus:ring-itemColor"
            placeholder="Unique slug (e.g. acme-inc)"
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
            :disabled="isSaving || !form.name || !form.slug"
            class="flex-1 rounded bg-logoColor py-2 text-white transition-colors hover:bg-logoColor/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSaving" class="flex items-center justify-center gap-2">
              <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Adding…
            </span>
            <span v-else>Add Organization</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue"
import { useOrganizationStore } from "~/store/organization"
import eventBus from "~/util/eventBus"

const props = defineProps({
  show: Boolean,
})

const emit = defineEmits(["update:show", "created"])

const organizationStore = useOrganizationStore()

const isSaving = ref(false)

const orgLogo = computed(() => form.organizationLogo || (form as any).logo || "")

const form = reactive({
  name: "",
  description: "",
  slug: "",
  organizationLogo: "",
})

async function saveOrganization() {
  try {
    isSaving.value = true
    const org = await organizationStore.createOrganization({
      name: form.name,
      slug: form.slug,
      logo: form.organizationLogo,
      metadata: { description: form.description, isPersonal: false },
    })

    await organizationStore.setActiveOrganization(org.id)

    try { await organizationStore.fetchOrganizationMembers(org.id) } catch {}

    eventBus.emit("showToast", {
      _type: "success",
      message: "Organization created successfully",
    })

    emit("created", org)
    emit("update:show", false)

    // Reset form
    form.name = ""
    form.description = ""
    form.slug = ""
    form.organizationLogo = ""
  } catch (err) {
    console.error("Failed to create org", err)
    eventBus.emit("showToast", {
      _type: "error",
      message: "Failed to create organization",
    })
  } finally {
    isSaving.value = false
  }
}
</script>
