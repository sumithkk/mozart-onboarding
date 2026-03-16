import { authClient } from "./auth-client"
import type { IUser } from "~/types/store"
import type { TUserRole } from "~/types/store"

// --------------------| Admin Service Types |--------------------

export interface AdminSession {
    id: string
    expiresAt: Date
    token: string
    createdAt: Date
    updatedAt: Date
    ipAddress?: string | null
    userAgent?: string | null
    userId: string
    impersonatedBy?: string
}

export interface UserListResponse {
    users: IUser[]
    total: number
    limit?: number
    offset?: number
}

export interface CreateUserData {
    email: string
    password: string
    name: string
    role?: "user" | "admin" | "moderator" | ("user" | "admin" | "moderator")[]
    data?: Record<string, unknown>
}

export interface ListUsersQuery {
    searchValue?: string
    searchField?: "email" | "name"
    searchOperator?: "contains" | "starts_with" | "ends_with"
    limit?: number
    offset?: number
    sortBy?: string
    sortDirection?: "asc" | "desc"
    filterField?: string
    filterValue?: string | number | boolean
    filterOperator?: "eq" | "ne" | "lt" | "lte" | "gt" | "gte"
}

export interface SetRoleData {
    userId: string
    role: "user" | "admin" | "moderator" | "superadmin" | ("user" | "admin" | "moderator" | "superadmin")[]
}

export interface SetPasswordData {
    userId: string
    newPassword: string
}

export interface BanUserData {
    userId: string
    banReason?: string
    banExpiresIn?: number
}

export interface UnbanUserData {
    userId: string
}

export interface ListSessionsData {
    userId: string
}

export interface RevokeSessionData {
    sessionToken: string
}

export interface RevokeAllSessionsData {
    userId: string
}

export interface ImpersonateUserData {
    userId: string
}

export interface RemoveUserData {
    userId: string
}

export interface HasPermissionData {
    userId?: string
    role?: "user" | "admin" | "moderator"
    permission?: Record<string, string[]>
    permissions?: Record<string, string[]>
}

export interface IUpdateUserData {
    firstName?: string
    lastName?: string
    email?: string
    profilePicture?: string
    role?: TUserRole
    defaultCollection?: string
    emailVerified?: boolean
    models?: string[]
}

export interface IUpdateUserInfoData {
    firstName?: string
    lastName?: string
    email?: string
    profilePicture?: string
}

// --------------------| Admin Service |--------------------

export const adminService = {
    // User Management
    createUser: async (data: CreateUserData): Promise<IUser> => {
        const result = await authClient.admin.createUser(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to create user")
        }
        return result.data.user as IUser
    },

    listUsers: async (query?: ListUsersQuery): Promise<UserListResponse> => {
        const result = await authClient.admin.listUsers({ query: query || {} })
        if (result.error) {
            throw new Error(result.error?.message || "Failed to list users")
        }
        return result.data as UserListResponse
    },

    setUserRole: async (data: SetRoleData): Promise<void> => {
        const result = await authClient.admin.setRole(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to set user role")
        }
    },

    setUserPassword: async (data: SetPasswordData): Promise<void> => {
        const result = await authClient.admin.setUserPassword(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to set user password")
        }
    },

    banUser: async (data: BanUserData): Promise<void> => {
        const result = await authClient.admin.banUser(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to ban user")
        }
    },

    unbanUser: async (data: UnbanUserData): Promise<void> => {
        const result = await authClient.admin.unbanUser(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to unban user")
        }
    },

    removeUser: async (data: RemoveUserData): Promise<void> => {
        const result = await authClient.admin.removeUser(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to remove user")
        }
    },
    updateUser: async (userId: string, data: IUpdateUserData | IUpdateUserInfoData): Promise<void> => {
        const result = await authClient.admin.updateUser({ userId, data })
        if (result.error) {
            throw new Error(result.error?.message || "Failed to update user")
        }
    },

    // Session Management
    listUserSessions: async (data: ListSessionsData): Promise<AdminSession[]> => {
        const result = await authClient.admin.listUserSessions(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to list user sessions")
        }
        return result.data.sessions as AdminSession[]
    },

    revokeUserSession: async (data: RevokeSessionData): Promise<void> => {
        const result = await authClient.admin.revokeUserSession(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to revoke user session")
        }
    },

    revokeUserSessions: async (data: RevokeAllSessionsData): Promise<void> => {
        const result = await authClient.admin.revokeUserSessions(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to revoke user sessions")
        }
    },

    // Impersonation
    impersonateUser: async (data: ImpersonateUserData): Promise<void> => {
        const result = await authClient.admin.impersonateUser(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to impersonate user")
        }
    },

    stopImpersonating: async (): Promise<void> => {
        const result = await authClient.admin.stopImpersonating({})
        if (result.error) {
            throw new Error(result.error?.message || "Failed to stop impersonating")
        }
    },

    // Permissions
    hasPermission: async (data: HasPermissionData): Promise<boolean> => {
        const result = await authClient.admin.hasPermission(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to check permissions")
        }
        return result.data.success
    },

    checkRolePermission: (data: { permissions: Record<string, string[]>; role: "user" | "admin" | "moderator" }): boolean => {
        return authClient.admin.checkRolePermission(data)
    },
}
