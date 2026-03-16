/**
 * Debug utilities for authentication troubleshooting
 * 
 * Usage in browser console:
 * - window.debugAuth.checkCookies()
 * - window.debugAuth.checkSession()
 * - window.debugAuth.checkPermissions()
 * - window.debugAuth.fullReport()
 */

export const debugAuth = {
    /**
     * Check all cookies and their attributes
     */
    checkCookies() {
        console.group('🍪 Cookie Debug')
        
        const cookies = document.cookie.split(';').map(c => c.trim())
        console.log('Raw cookies:', document.cookie)
        console.log('Cookie count:', cookies.length)
        
        cookies.forEach(cookie => {
            const [name, value] = cookie.split('=')
            console.log(`  ${name}: ${value?.substring(0, 50)}${value?.length > 50 ? '...' : ''}`)
        })
        
        // Try to get specific auth cookies
        const betterAuthCookie = cookies.find(c => c.includes('better-auth') || c.includes('session'))
        if (betterAuthCookie) {
            console.log('✅ Found auth cookie:', betterAuthCookie)
        } else {
            console.warn('❌ No auth cookie found!')
            console.log('Expected cookie names: better-auth.session_token, session, etc.')
        }
        
        console.groupEnd()
        return { cookies, betterAuthCookie }
    },

    /**
     * Check current user session from store
     */
    checkSession() {
        console.group('👤 Session Debug')
        
        try {
            const userStore = useUserStore()
            console.log('User ID:', userStore.id || 'NOT SET')
            console.log('Email:', userStore.email || 'NOT SET')
            console.log('Role:', userStore.role || 'NOT SET')
            console.log('First Name:', userStore.firstName || 'NOT SET')
            console.log('Last Name:', userStore.lastName || 'NOT SET')
            console.log('Is Admin:', userStore.isAdmin)
            console.log('Is Loading:', userStore.isLoading)
            console.log('Session:', userStore.session)
            
            if (!userStore.id) {
                console.warn('❌ User not authenticated in store')
            } else {
                console.log('✅ User authenticated')
            }
        } catch (error) {
            console.error('Error accessing user store:', error)
        }
        
        console.groupEnd()
    },

    /**
     * Check permission configuration
     */
    checkPermissions() {
        console.group('🔐 Permissions Debug')
        
        try {
            const userStore = useUserStore()
            const userPermissionStore = useUserPermissionStore()
            const role = userStore.role || 'basic'
            
            console.log('Current role:', role)
            console.log('Available roles:', Object.keys(userPermissionStore.permissions))
            
            const permissions = userPermissionStore.permissions[role]
            if (permissions) {
                console.log('Allowed links:', permissions.allowedLinks)
                console.log('Default route:', permissions.defaultRoute)
            } else {
                console.warn('❌ No permissions found for role:', role)
            }
        } catch (error) {
            console.error('Error accessing permissions:', error)
        }
        
        console.groupEnd()
    },

    /**
     * Check environment configuration
     */
    checkEnvironment() {
        console.group('🌍 Environment Debug')
        
        try {
            const config = useRuntimeConfig()
            console.log('API URL:', config.public.apiUrl)
            console.log('Client URL:', config.public.clientURL)
            console.log('Environment:', config.public.environment)
            console.log('Platform:', config.public.platform)
            
            // Check if URLs match expectations
            if (!config.public.apiUrl) {
                console.error('❌ API URL not configured!')
            } else {
                console.log('✅ API URL configured')
            }
        } catch (error) {
            console.error('Error accessing config:', error)
        }
        
        console.groupEnd()
    },

    /**
     * Test session fetch
     */
    async testSessionFetch() {
        console.group('🧪 Session Fetch Test')
        
        try {
            const { getSession } = await import('@/services/better-auth')
            console.log('Fetching session...')
            const session = await getSession()
            console.log('Session response:', session)
            
            if (session?.data?.user) {
                console.log('✅ Session valid, user:', session.data.user.email)
            } else {
                console.warn('❌ No valid session or user data')
            }
        } catch (error) {
            console.error('❌ Error fetching session:', error)
        }
        
        console.groupEnd()
    },

    /**
     * Check local storage
     */
    checkLocalStorage() {
        console.group('💾 Local Storage Debug')
        
        try {
            console.log('LocalStorage items:')
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key) {
                    const value = localStorage.getItem(key)
                    const preview = value ? 
                        (value.length > 100 ? value.substring(0, 100) + '...' : value) : 
                        'null'
                    console.log(`  ${key}:`, preview)
                }
            }
        } catch (error) {
            console.error('Error accessing localStorage:', error)
        }
        
        console.groupEnd()
    },

    /**
     * Check session storage
     */
    checkSessionStorage() {
        console.group('📦 Session Storage Debug')
        
        try {
            console.log('SessionStorage items:')
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i)
                if (key) {
                    const value = sessionStorage.getItem(key)
                    const preview = value ? 
                        (value.length > 100 ? value.substring(0, 100) + '...' : value) : 
                        'null'
                    console.log(`  ${key}:`, preview)
                }
            }
        } catch (error) {
            console.error('Error accessing sessionStorage:', error)
        }
        
        console.groupEnd()
    },

    /**
     * Full diagnostic report
     */
    async fullReport() {
        console.log('🔍 =================== FULL AUTH DEBUG REPORT ===================')
        this.checkEnvironment()
        this.checkCookies()
        this.checkSession()
        this.checkPermissions()
        this.checkLocalStorage()
        this.checkSessionStorage()
        await this.testSessionFetch()
        console.log('🔍 =================== END DEBUG REPORT ===================')
    },

    /**
     * Export report as text
     */
    async exportReport() {
        const originalLog = console.log
        const originalWarn = console.warn
        const originalError = console.error
        const originalGroup = console.group
        const originalGroupEnd = console.groupEnd
        
        let report = ''
        const capture = (...args: any[]) => {
            report += args.join(' ') + '\n'
        }
        
        console.log = capture
        console.warn = capture
        console.error = capture
        console.group = capture
        console.groupEnd = () => { report += '\n' }
        
        await this.fullReport()
        
        console.log = originalLog
        console.warn = originalWarn
        console.error = originalError
        console.group = originalGroup
        console.groupEnd = originalGroupEnd
        
        return report
    }
}

// Make available globally in browser console
export function initDebugAuth() {
    if (typeof window !== 'undefined') {
        (window as any).debugAuth = debugAuth
        return true
    }
    return false
}

