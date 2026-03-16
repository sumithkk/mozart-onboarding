/**
 * Debug Auth Plugin
 * Makes authentication debugging utilities available in browser console
 * Usage: window.debugAuth.fullReport()
 */
import { debugAuth } from '~/util/debugAuth'

export default defineNuxtPlugin(() => {
    // Make debug utilities available globally
    if (typeof window !== 'undefined') {
        (window as any).debugAuth = debugAuth
    }
})

