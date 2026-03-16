<template>
  <div class="relative">
    <button
      class="bg-card border border-border rounded-md px-3 py-2 text-sm flex items-center gap-2"
      @click="isOpen = !isOpen"
    >
      <img
        v-if="currentOrg?.logo"
        :src="currentOrg.logo"
        alt="Org Logo"
        class="w-6 h-6 rounded-full object-cover"
      />
      <InitialAvatar
        v-else
        :name="currentOrg?.name || 'Org'"
        size="24"
      />
      <span>{{ currentOrg?.name || "Select Organization" }}</span>
      <span class="materialSymbolsOutlined">expand_more</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute mt-2 w-56 bg-background border border-border rounded shadow-md z-50"
    >
      <ul>
        <li
          v-for="org in organizations"
          :key="org.id"
          class="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
          @click="switchOrg(org)"
        >
          <img
            v-if="org.logo"
            :src="org.logo"
            alt="Org Logo"
            class="w-5 h-5 rounded-full object-cover"
          />
          <InitialAvatar v-else :name="org.name" size="20" />
          <span>{{ org.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useOrganization } from "~/composables/useOrganization"

const { organizations, currentOrganization, setActiveOrganization, initialize } =
  useOrganization()

const isOpen = ref(false)

const currentOrg = computed(() => currentOrganization.value)

onMounted(async () => {
  if (!organizations.value.length) {
    await initialize()
  }
})

const switchOrg = async (org: any) => {
  await setActiveOrganization(org.id)
  isOpen.value = false
}
</script>

<style scoped>
.materialSymbolsOutlined {
  font-size: 18px;
}
</style>