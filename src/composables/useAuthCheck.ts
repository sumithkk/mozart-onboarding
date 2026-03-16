import { getSession } from "@/services/better-auth"

/**
 * Minimal user data returned from lightweight session check
 */
interface MinimalUser {
    id: string
    email: string
    firstName: string
    lastName: string
    profilePicture: string
    role: string
}

/**
 * Lightweight session check that only validates authentication
 * without full user hydration. Returns minimal user data.
 */
export const useAuthCheck = () => {
    /**
     * Check session without full hydration
     * Returns only authentication state and basic user info
     * Also returns the full session object for reuse
     */
    const checkSessionLightweight = async (): Promise<{
        isAuthenticated: boolean
        user: MinimalUser | null
        session: any | null
    }> => {
        try {
            const session = await getSession()
            const userData = session?.data?.user

            if (!userData) {
                return {
                    isAuthenticated: false,
                    user: null,
                    session: null,
                }
            }

            // Return minimal user data and full session
            return {
                isAuthenticated: true,
                user: {
                    id: userData.id || "",
                    email: userData.email || "",
                    firstName: userData.firstName || "",
                    lastName: userData.lastName || "",
                    profilePicture: userData.image || "",
                    role: userData.role || "basic",
                },
                session: session,
            }
        } catch (error) {
            console.error("[AuthCheck] Session check failed:", error)
            return {
                isAuthenticated: false,
                user: null,
                session: null,
            }
        }
    }

    /**
     * Check if a route is public
     */
    const isPublicRoute = (path: string): boolean => {
        const publicAccessiblePaths = [
            "/",
            "/auth/login",
            "/auth/signUp",
            "/auth/forgotPassword",
            "/test",
            "/auth/verify",
        ]

        // Check if the path is in the list of public paths
        if (publicAccessiblePaths.includes(path)) return true

        // Check if the path matches the dynamic
        // /forgotPassword/<token-id> pattern
        const forgotPasswordRegex = /^\/auth\/forgotPassword\/[a-zA-Z0-9_-]+$/
        if (forgotPasswordRegex.test(path)) return true

        // Check if the path matches the dynamic
        // /org/accept-invite/<token-id> pattern
        const acceptInviteRegex = /^\/org\/accept-invite\/[A-Za-z0-9_-]+$/
        if (acceptInviteRegex.test(path)) return true

        return false
    }

    return {
        checkSessionLightweight,
        isPublicRoute,
    }
}

