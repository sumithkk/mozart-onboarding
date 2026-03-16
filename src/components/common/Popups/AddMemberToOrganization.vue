<template>
  <!-- Only show the modal if `show` is true -->
  <div
    v-if="show"
    class="bg-background/50 fixed top-0 left-0 z-[1010] flex h-screen w-screen items-center justify-center backdrop-blur-[2px]"
  >
    <!-- Stop click propagation so clicking inside the modal does not close it -->
    <div
      class="bg-backgroundColor text-textColor m-4 w-full max-w-md rounded-md p-5 shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
      @click.stop
    >
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div class="text-base font-medium">
          {{ headerOrgName || 'Select Organization' }}
        </div>
        <div class="cursor-pointer text-2xl" @click="emitClose">
          <div class="materialSymbolsOutlined">close</div>
        </div>
      </div>

      <!-- Title -->
      <div class="mb-4 text-xl">
        Add a member to {{ headerOrgName || 'organization' }}
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
        <div class="flex items-center gap-2 text-red-800">
          <div class="materialSymbolsOutlined text-red-600 text-sm">error</div>
          <p class="text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <!-- Organization Selection -->
        <div>
          <label class="block text-sm font-medium text-textColor mb-2">Organization</label>
          <select
            class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded border-2 p-2.5 focus:border-itemColor focus:outline-none"
            v-model="selectedOrgId"
            :disabled="isLoading || organizations.length === 0"
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
          <p v-if="organizations.length === 0" class="mt-1 text-xs text-textColor/70">
            No organizations found. Create one first.
          </p>
        </div>

        <!-- Email Input -->
        <div>
          <label class="block text-sm font-medium text-textColor mb-2">Email Address</label>
          <input
            class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded border-2 p-2.5 focus:border-itemColor focus:outline-none"
            type="email"
            placeholder="Enter member's email"
            v-model="memberEmail"
            :disabled="isLoading"
            required
          />
        </div>

        <!-- Role Selection -->
        <div>
          <label class="block text-sm font-medium text-textColor mb-2">Role</label>
          <select
            class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded border-2 p-2.5 focus:border-itemColor focus:outline-none"
            v-model="memberRole"
            :disabled="isLoading"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 pt-2">
          <button
            class="flex-1 bg-gray-200 text-gray-700 cursor-pointer rounded-md border-none px-4 py-2 hover:bg-gray-300 transition-colors"
            @click="emitClose"
            :disabled="isLoading"
          >
            Cancel
          </button>
          <button
            class="flex-1 bg-logoColor text-white cursor-pointer rounded-md border-none px-4 py-2 hover:bg-logoColor/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleAddMember"
            :disabled="isLoading || !selectedOrgId"
            :title="!selectedOrgId ? 'Select an organization first' : 'Send Invitation'"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Sending…
            </span>
            <span v-else>Send Invitation</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import eventBus from '~/util/eventBus'
import { useOrganizationStore } from '~/store/organization'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  organization: any | null
  organizations: Array<{ id: string; name: string }>
  membersEmails: string[]
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'buttonClick', payload: { action: 'invite', email: string, role: string, organizationId: string }): void
}>()

const organizationStore = useOrganizationStore()

// organizations list like UpdateOrganization.vue
const organizations = computed(() =>
  (organizationStore.organizations || []).filter(
    (o: any) => !!o && typeof o.id === 'string'
  )
)

const selectedOrgId = ref<string>('')

const memberEmail = ref('')
const memberRole = ref<'member' | 'admin'>('member')
const isLoading = ref(false)
const error = ref<string | null>(null)

const headerOrgName = computed(() => {
  const found = organizations.value.find(o => o.id === selectedOrgId.value)
  return found?.name || props.organization?.name || props.organization?.title || ''
})

// initialize selected org: prefer prop, else current, else first in list
const initSelectedOrg = () => {
  const fromProp = props.organization?.id || props.organization?.organizationId || ''
  const current = organizationStore.currentOrganization?.id || ''
  const fallback = organizations.value[0]?.id || ''
  selectedOrgId.value = fromProp || current || fallback || ''
}

watch(() => props.show, (open) => {
  if (open) {
    // when opening, ensure orgs are present & pick default
    if (!organizations.value.length) {
      // caller usually loads them; still safe to call:
      organizationStore.fetchOrganizations().finally(() => initSelectedOrg())
    } else {
      initSelectedOrg()
    }
  }
})

function emitClose() {
  emit('update:show', false)
  // reset
  memberEmail.value = ''
  memberRole.value = 'member'
  error.value = null
}

function isAlreadyMember(email: string) {
  return props.membersEmails.includes(email.trim().toLowerCase())
}

function getErrorCode(e: any): string {
  const candidates = [
    e?.response?.data?.code,
    e?.response?.data?.error?.code,
    e?.response?.data?.err?.code,
    e?.data?.code,
    e?.code,
  ]
  const found = candidates.find(Boolean)
  return (found || '').toString().toUpperCase()
}

function getErrorMessage(e: any): string {
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error?.message ||
    e?.message ||
    ''
  )
}

async function handleAddMember() {
  const email = memberEmail.value.trim()
  if (!email) { error.value = 'Please enter a valid email address'; return }
  if (!selectedOrgId.value) { error.value = 'Please select an organization'; return }

  // pre-check: already a member (from parent prop)
  if (isAlreadyMember(email)) {
    eventBus.emit('showToast', { _type: 'info', message: `${email} is already a member of this organization.` })
    emit('buttonClick', { action: 'invite', email, role: memberRole.value, organizationId: selectedOrgId.value })
    emit('update:show', false)
    return
  }

  try {
    isLoading.value = true
    error.value = null

    await organizationStore.inviteMember(email, memberRole.value, selectedOrgId.value)

    eventBus.emit('showToast', { _type: 'success', message: `Invitation sent to ${email}` })
    emit('buttonClick', { action: 'invite', email, role: memberRole.value, organizationId: selectedOrgId.value })
    emit('update:show', false)
  } catch (e: any) {
    const code = getErrorCode(e)
    const serverMsg = getErrorMessage(e)

    const benignCodes = [
      'USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION',
      'USER_ALREADY_IN_ORGANIZATION',
      'USER_ALREADY_MEMBER_OF_ORGANIZATION',
      'MEMBER_ALREADY_EXISTS',
      'ALREADY_MEMBER',
      'USER_ALREADY_JOINED'
    ]

    if (benignCodes.some(sig => code.includes(sig))) {
      const msg =
        code === 'USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION'
          ? (serverMsg || `An invitation is already pending for ${email}.`)
          : `${email} is already a member of this organization.`

      eventBus.emit('showToast', { _type: 'info', message: msg })
      emit('buttonClick', { action: 'invite', email, role: memberRole.value, organizationId: selectedOrgId.value })
      emit('update:show', false)
      return
    }

    const fallback = serverMsg || 'Failed to send invitation. Please try again.'
    error.value = fallback
    eventBus.emit('showToast', { _type: 'error', message: fallback })
    console.error('Failed to invite member:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (!organizations.value.length) {
    organizationStore.fetchOrganizations().finally(() => initSelectedOrg())
  } else {
    initSelectedOrg()
  }
})
</script>
