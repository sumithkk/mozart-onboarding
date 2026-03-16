export default defineNuxtRouteMiddleware(async (to: any) => {
    if (import.meta.server) return
    
    const userStore = useUserStore()
    const userPermissionStore = useUserPermissionStore()
    const { isPublicRoute, checkSessionLightweight } = useAuthCheck()
    
    const currentPath = to.path
    const pathIsPublic = isPublicRoute(currentPath)
    
    // For public routes, only do lightweight session check for UI state
    if (pathIsPublic) {
        // Only check session if user store is not already hydrated
        if (!userStore.id && !userStore._sessionLoaded) {
            const { isAuthenticated, user, session } = 
                await checkSessionLightweight()
            // Update minimal user state for UI (no full hydration)
            if (isAuthenticated && user) {
                userStore.id = user.id
                userStore.email = user.email
                userStore.firstName = user.firstName
                userStore.lastName = user.lastName
                userStore.profilePicture = user.profilePicture
                userStore.role = user.role
                // Store session data for reuse by other stores/plugins
                if (session) {
                    userStore._lastSessionData = session
                }
            }
        }
        // Allow access to public routes
        return
    }
    
    // For protected routes, do full hydration if needed
    // Check both id and _sessionLoaded to ensure full hydration happens
    if (!userStore.id || !userStore._sessionLoaded) {
        try {
            const success = await userStore.hydrateFromBetterAuth()
            if (!success) {
                console.warn('[Auth] No session found for route:', 
                    currentPath)
                console.log('[Auth] Redirecting to login from:', 
                    currentPath)
                return navigateTo("/auth/login")
            }
        } catch (error) {
            console.error('[Auth] Session check failed:', error)
            return navigateTo("/auth/login")
        }
    } else {
        // Session already loaded, ensure isLoading is false
        // This handles cases where session was loaded but isLoading
        // might still be true (e.g., from persisted state)
        if (userStore.isLoading) {
            userStore.isLoading = false
        }
    }
    
    const userRole = userStore.role || "basic"

    // Check role-based permissions
    let permissions = userPermissionStore.permissions[userRole]
    if (!permissions) {
        permissions = userPermissionStore.permissions["basic"]
    }
    const allowedLinks = permissions.allowedLinks
    const defaultRoute = permissions.defaultRoute

    const isPathAllowed = (path: string, patterns: string[]): boolean => {
        return patterns.some((pattern) => {
            if (pattern === "*") {
                return true
            }
            return path === pattern || path.startsWith(pattern + "/")
        })
    }
    
    const pathAllowed = isPathAllowed(to.path, allowedLinks)
    
    if (!pathAllowed) {
        console.log('[Auth] Access denied, redirecting to:', defaultRoute)
        return navigateTo(defaultRoute)
    }
})
