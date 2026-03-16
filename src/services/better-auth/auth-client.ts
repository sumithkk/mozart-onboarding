import { adminClient, inferAdditionalFields, organizationClient } from "better-auth/client/plugins"

import { createAccessControl } from "better-auth/plugins/access"
import { createAuthClient } from "better-auth/react"
import { getSessionCookie } from "better-auth/cookies"

// --------------------| Access Control Setup |--------------------

const statement = {
    user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password"],
    session: ["list", "revoke", "delete"],
    feature: ["grant", "revoke", "list", "manage"],
    role: ["create", "update", "delete", "assign"],
    system: ["logs", "metrics", "maintenance"],
}

const ac = createAccessControl(statement)

// Create custom roles

const superAdminRole = ac.newRole({
    user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password"],
    session: ["list", "revoke", "delete"],
    feature: ["grant", "revoke", "list", "manage"],
    role: ["create", "update", "delete", "assign"],
    system: ["logs", "metrics", "maintenance"],
})

const adminRole = ac.newRole(statement)

const moderatorRole = ac.newRole({
    user: ["list", "ban"],
    session: ["list", "revoke"],
    feature: ["list"],
    role: [],
    system: ["logs"],
})

const userRole = ac.newRole({
    user: [],
    session: [],
    feature: [],
    role: [],
    system: [],
})

// --------------------| Auth Client Plugins |--------------------]

export const roles = {
    superadmin: superAdminRole,
    admin: adminRole,
    moderator: moderatorRole,
    user: userRole,
} as const
export type RoleName = keyof typeof roles

const additionalFieldsPlugin = inferAdditionalFields({})
const adminClientPlugin = adminClient({
    ac,
    roles,
})

const organizationClientPlugin = organizationClient({
    ac,
    roles,
})

// ---------------------------------------------------------------

// ------------------------| Auth Client |------------------------

type Client = ReturnType<typeof createAuthClient>

let _authClient: Client | null = null

export const getAuthClient = (): Client => {
    if (!_authClient) {
        const config = useRuntimeConfig()
        
        // Handle relative URLs by constructing full URL from current location
        let baseURL = config.public.apiUrl || ''
        
        // If empty or relative URL, construct full URL from current domain
        if (!baseURL || baseURL.startsWith('/')) {
            if (typeof window !== 'undefined') {
                const origin = window.location.origin
                baseURL = `${origin}${baseURL}`
            } else {
                // Server-side - this shouldn't happen but fallback
                baseURL = 'http://localhost:3000' + (baseURL || '')
            }
        }
        
        // Better Auth endpoints are under /api/auth path on the backend
        // Ensure the path includes /api/auth
        if (!baseURL.includes('/api/auth')) {
            // Remove trailing slash
            baseURL = baseURL.replace(/\/$/, '')

            // Append /api/auth
            baseURL = baseURL + '/api/auth'
        }
        
        console.log('[Auth] Initializing client - Base URL:', baseURL)
        
        _authClient = createAuthClient({
            baseURL: baseURL,
            plugins: [additionalFieldsPlugin, adminClientPlugin, organizationClientPlugin],
            fetchOptions: {
                credentials: 'include',
                async onResponseError(context: any) {
                    // Only log errors
                    console.error('[Auth] Request failed:', {
                        status: context?.response?.status,
                        url: context?.request?.url || context?.url,
                        error: context?.error
                    })
                },
            },
        })
    }
    return _authClient
}

export const authClient = {
    get admin() {
        return (getAuthClient() as any).admin
    },
    get organization() {
        return (getAuthClient() as any).organization
    },
    get $Infer() {
        return getAuthClient().$Infer
    },
}

// ---------------------------------------------------------------

// --------------------| Auth Client Methods |--------------------

export const signIn: Client["signIn"] = {
    email: (...args) => getAuthClient().signIn.email(...args),
    social: (...args) => getAuthClient().signIn.social(...args),
}

export const signUp: Client["signUp"] = {
    email: (...args) => getAuthClient().signUp.email(...args),
}

// Strongly-typed payload for our signup flow
export type SignUpPayload = {
    email: string
    password: string
    firstName: string
    lastName: string
    country: string
    planName: string
    quantity?: number
    name?: string
}

// Helper to sign up with our extended profile fields
export const signUpWithProfile = (payload: SignUpPayload) =>
    getAuthClient().signUp.email(payload as any)

export const signOut: Client["signOut"] = (...args) =>
    getAuthClient().signOut(...args)
export const getSession: Client["getSession"] = (...args) =>
    getAuthClient().getSession(...args)
export const useSession: Client["useSession"] = (...args) =>
    getAuthClient().useSession(...args)
export const verifyEmail: Client["verifyEmail"] = (...args) =>
    getAuthClient().verifyEmail(...args)
export const changePassword: Client["changePassword"] = (...args) =>
    getAuthClient().changePassword(...args)
export const requestPasswordReset: Client["requestPasswordReset"] = (
    ...args
) => getAuthClient().requestPasswordReset(...args)
export const resetPassword: Client["resetPassword"] = new Proxy(
    (function (
        ...args: Parameters<Client["resetPassword"]>
    ) {
        return (getAuthClient().resetPassword as any)(...args)
    }) as unknown as Client["resetPassword"],
    {
        apply(_target, _thisArg, argArray: unknown[]) {
            return (getAuthClient().resetPassword as any)(...argArray)
        },
        get(_target, prop: PropertyKey) {
            const target = getAuthClient().resetPassword as any
            const value = target[prop]
            return typeof value === "function" ? value.bind(target) : value
        },
    },
)
export const updateUser: Client["updateUser"] = (...args) =>
    getAuthClient().updateUser(...args)
export const sendVerificationEmail: Client["sendVerificationEmail"] = (...args) =>
    getAuthClient().sendVerificationEmail(...args)
export const changeEmail: Client["changeEmail"] = (...args) =>
    getAuthClient().changeEmail(...args)
export const _getSessionCookie = getSessionCookie
// --------------------| Auth Client Modified Methods |--------------------
export const signOutAndRedirect = async () => {
    // await signOut() // TODO: Uncomment this when we have a proper logout endpoint
    window.location.href = "/auth"
}

// ---------------------------------------------------------------

// --------------------| Auth Client Types |--------------------

export type User = unknown
export type Session = Client["$Infer"]["Session"]
export type Organization = Client["$Infer"] extends { Organization: infer T }
    ? T
    : never

// ---------------------------------------------------------------