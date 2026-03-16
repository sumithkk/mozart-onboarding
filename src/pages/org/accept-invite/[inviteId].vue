<template>
  <Loading v-if="isAccepting" />
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useOrganizationStore } from '~/store/organization'
import { useUserStore } from '~/store/user'
import { authClient } from '~/services/better-auth'
import eventBus from '~/util/eventBus'

const route = useRoute()
const router = useRouter()
const org = useOrganizationStore()
const user = useUserStore()

const isAccepting = ref(true)
const log = (...args: any[]) => console.log('[ACCEPT]', ...args)

onMounted(async () => {
  try {
    const rawParam = route.params.inviteId


    if (!user.id) {
      const next = route.fullPath
      sessionStorage.setItem('postLoginRedirect', next)
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`)
      return
    }

    try {
      if (!user.id) {
        await user.hydrateFromBetterAuth()
      } else {
        log('user already hydrated')
      }
    } catch (e) {
      log('user.hydrateFromBetterAuth threw', e)
    }

    const invitationId = String(rawParam || '')
    if (!invitationId) {
      eventBus.emit('showToast', { _type: 'error', message: 'Invalid invite link.' })
      router.replace('/profile/organization')
      return
    }

    try {
      const res = await (authClient as any).organization.getInvitation({ id: invitationId })
        const inviteEmail = res?.data?.invitation?.email
        if (inviteEmail && user.email && inviteEmail.toLowerCase() !== user.email.toLowerCase()) {
          eventBus.emit('showToast', {
            _type: 'warning',
            message: `This invite is for ${inviteEmail}, but you’re logged in as ${user.email}. Please sign out and sign in as ${inviteEmail} to accept.`,
          })
          router.replace('/profile/organization')
          return
      }
    } catch (e) {
      log('getInvitation failed (will proceed anyway):', e)
    }

    await nextTick()

    try {
      await (authClient as any).organization.acceptInvitation({ invitationId })
    } catch (e: any) {
      const code = e?.error?.code || e?.code || 'ACCEPT_FAILED'
      const msg  = e?.error?.message || e?.message || 'Failed to accept invitation'
      eventBus.emit('showToast', { _type: 'error', message: `${msg} (${code})` })
      router.replace('/profile/organization')
      return
    }

    try {
      await org.fetchUserOrganizations()
      await org.getActiveOrganization()
    } catch (e) {
      log('org refresh threw', e)
    }

    sessionStorage.removeItem('postLoginRedirect')
    eventBus.emit('showToast', { _type: 'success', message: 'Invitation accepted. Welcome!' })
    router.replace('/profile/organization')
  } catch (e) {
    log('outer catch', e)
    router.replace('/profile/organization')
  } finally {
    isAccepting.value = false
  }
})
</script>
