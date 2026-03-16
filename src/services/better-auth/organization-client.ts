import { authClient } from "./auth-client"

// --------------------| Organization Service Types |--------------------

export interface Organization {
    id: string
    name: string
    slug: string
    logo?: string
    metadata?: Record<string, any>
    createdAt: Date
    updatedAt: Date
}

export interface OrganizationData extends Organization {
    members: OrganizationMember[],
    invitations: OrganizationInvitation[],
    teams: OrganizationTeam[],
}

export interface OrganizationMember {
    id: string
    userId: string
    organizationId: string
    role: string | string[]
    invitedBy?: string
    joinedAt: Date
    user?: {
        id: string
        name: string
        email: string
        image?: string
    }
}

export interface OrganizationInvitation {
    id: string
    email: string
    role: string | string[]
    organizationId: string
    invitedBy: string
    status: "pending" | "accepted" | "rejected" | "expired"
    expiresAt: Date
    createdAt: Date
    teamId?: string
    organization?: Organization
}

export interface OrganizationTeam {
    id: string
    name: string
    organizationId: string
    createdAt: Date
    updatedAt: Date
}

export interface OrganizationRole {
    id: string
    name: string
    permission: Record<string, string[]>
    organizationId: string
    createdAt: Date
    updatedAt: Date
}

// Create Organization
export interface CreateOrganizationData {
    name: string
    slug: string
    logo?: string
    metadata?: Record<string, any>
    keepCurrentActiveOrganization?: boolean
}

// Update Organization
export interface UpdateOrganizationData {
    organizationId: string
    data: {
        name?: string
        slug?: string
        logo?: string
        metadata?: Record<string, any>
    }
}

// Check Slug
export interface CheckSlugData {
    slug: string
}

// Invite Member
export interface InviteMemberData {
    email: string
    role: string | string[]
    organizationId?: string
    resend?: boolean
    teamId?: string
}

// Add Member
export interface AddMemberData {
    userId: string
    role: string | string[]
    organizationId?: string
    teamId?: string
}

// Update Member Role
export interface UpdateMemberRoleData {
    role: string | string[]
    memberId: string
    organizationId?: string
}

// Remove Member
export interface RemoveMemberData {
    memberIdOrEmail: string
    organizationId?: string
}

// List Members
export interface ListMembersData {
    organizationId?: string
    limit?: number
    offset?: number
    sortBy?: string
    sortDirection?: "asc" | "desc"
    filterField?: string
    filterOperator?: "eq" | "ne" | "lt" | "lte" | "gt" | "gte"
    filterValue?: string
}

// Set Active Organization
export interface SetActiveOrganizationData {
    organizationId: string
}

// Remove Organization
export interface RemoveOrganizationData {
    organizationId: string
}

// Invitation Management
export interface AcceptInvitationData {
    invitationId: string
}

export interface RejectInvitationData {
    invitationId: string
}

export interface CancelInvitationData {
    invitationId: string
}

export interface GetInvitationData {
    id: string
}

export interface ListInvitationsData {
    organizationId?: string
}

// Leave Organization
export interface LeaveOrganizationData {
    organizationId: string
}

// Role Management
export interface CreateRoleData {
    role: string
    permission: Record<string, string[]>
    organizationId?: string
}

export interface DeleteRoleData {
    roleName?: string
    roleId?: string
    organizationId?: string
}

export interface ListRolesData {
    organizationId?: string
}

export interface GetRoleData {
    roleName?: string
    roleId?: string
    organizationId?: string
}

export interface UpdateRoleData {
    roleName?: string
    roleId?: string
    organizationId?: string
    data: {
        permission?: Record<string, string[]>
        roleName?: string
    }
}

// Team Management
export interface CreateTeamData {
    name: string
    organizationId?: string
}

export interface ListTeamsData {
    organizationId?: string
}

export interface UpdateTeamData {
    teamId: string
    data: {
        name?: string
        organizationId?: string
        createdAt?: Date
        updatedAt?: Date
    }
}

export interface RemoveTeamData {
    teamId: string
    organizationId?: string
}

export interface SetActiveTeamData {
    teamId?: string
}

export interface ListTeamMembersData {
    teamId: string
}

export interface AddTeamMemberData {
    teamId: string
    userId: string
}

export interface RemoveTeamMemberData {
    teamId: string
    userId: string
}

// --------------------| Organization Service |--------------------

export const organizationService = {
    // Organization CRUD Operations
    createOrganization: async (data: CreateOrganizationData): Promise<Organization> => {
        const result: any = await authClient.organization.create(data)

        if (result?.error) {
            throw new Error(result.error?.message || "Failed to create organization")
        }

        const org =
            result?.data?.organization ??
            result?.organization ??
            (result?.data && typeof result.data?.id === "string" ? result.data : null)

        if (!org || typeof org.id !== "string") {
            console.error("Unexpected createOrganization response:", result)
            throw new Error("Create organization: malformed response")
        }
        return org as Organization
    },

    listOrganizations: async (): Promise<Organization[]> => {
        const result = await authClient.organization.list()
        if (result.error) {
            throw new Error(result.error?.message || "Failed to list organizations")
        }
        const organizations = JSON.parse(JSON.stringify(result.data)) as Organization[]
        return organizations.filter((org: Organization) => org.metadata && !org.metadata.isPersonal)

    },

    updateOrganization: async (data: UpdateOrganizationData): Promise<Organization> => {
        const result = await authClient.organization.update(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to update organization")
        }
        return result.data.organization as Organization
    },

    deleteOrganization: async (data: RemoveOrganizationData): Promise<void> => {
        const result = await authClient.organization.delete(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to delete organization")
        }
    },

    checkSlug: async (data: CheckSlugData): Promise<{ taken: boolean }> => {
        const result = await authClient.organization.checkSlug(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to check slug")
        }
        return result.data as { taken: boolean }
    },

    // Organization Context
    setActiveOrganization: async (data: SetActiveOrganizationData): Promise<void> => {
        const result = await authClient.organization.setActive(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to set active organization")
        }
    },

    getActiveOrganization: async (): Promise<Organization | null> => {
        const result = await authClient.organization.getFullOrganization({})
        if (result.error) {
            throw new Error(result.error?.message || "Failed to get active organization")
        }
        return result.data.organization as Organization | null
    },

    listUserOrganizations: async (): Promise<Organization[]> => {
        const result = await authClient.organization.listUserOrganizations()
        if (result.error) {
            throw new Error(result.error?.message || "Failed to list user organizations")
        }
        return result.data.organizations as Organization[]
    },

    // Member Management
    inviteMember: async (data: InviteMemberData): Promise<OrganizationInvitation> => {
        const result = await authClient.organization.inviteMember(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to invite member")
        }
        return result.data.invitation as OrganizationInvitation
    },

    addMember: async (data: AddMemberData): Promise<OrganizationMember> => {
        const result = await authClient.organization.addMember(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to add member")
        }
        return result.data.member as OrganizationMember
    },

    listMembers: async (data?: ListMembersData): Promise<{ members: OrganizationMember[], total?: number }> => {
        const result = await authClient.organization.listMembers(data || {})
        if (result.error) {
            throw new Error(result.error?.message || "Failed to list members")
        }
        return result.data as { members: OrganizationMember[], total?: number }
    },

    updateMemberRole: async (data: UpdateMemberRoleData): Promise<void> => {
        const result = await authClient.organization.updateMemberRole(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to update member role")
        }
    },

    removeMember: async (data: RemoveMemberData): Promise<void> => {
        const result = await authClient.organization.removeMember(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to remove member")
        }
    },

    getActiveMember: async (): Promise<OrganizationMember | null> => {
        const result = await authClient.organization.getActiveMember()
        if (result.error) {
            throw new Error(result.error?.message || "Failed to get active member")
        }
        return result.data.member as OrganizationMember | null
    },

    leaveOrganization: async (data: LeaveOrganizationData): Promise<void> => {
        const result = await authClient.organization.leave(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to leave organization")
        }
    },

    // Invitation Management
    getInvitation: async (data: GetInvitationData): Promise<OrganizationInvitation> => {
        const result = await authClient.organization.getInvitation(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to get invitation")
        }
        return result.data.invitation as OrganizationInvitation
    },

    listInvitations: async (data?: ListInvitationsData): Promise<OrganizationInvitation[]> => {
        const result = await authClient.organization.listInvitations(data || {})
        if (result.error) {
            throw new Error(result.error?.message || "Failed to list invitations")
        }
        return result.data.invitations as OrganizationInvitation[]
    },

    acceptInvitation: async (data: AcceptInvitationData): Promise<void> => {
        const result = await authClient.organization.acceptInvitation(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to accept invitation")
        }
    },

    rejectInvitation: async (data: RejectInvitationData): Promise<void> => {
        const result = await authClient.organization.rejectInvitation(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to reject invitation")
        }
    },

    cancelInvitation: async (data: CancelInvitationData): Promise<void> => {
        const result = await authClient.organization.cancelInvitation(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to cancel invitation")
        }
    },

    // Role Management
    createRole: async (data: CreateRoleData): Promise<OrganizationRole> => {
        const result = await authClient.organization.createRole(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to create role")
        }
        return result.data.role as OrganizationRole
    },

    listRoles: async (data?: ListRolesData): Promise<OrganizationRole[]> => {
        const result = await authClient.organization.listRoles(data || {})
        if (result.error) {
            throw new Error(result.error?.message || "Failed to list roles")
        }
        return result.data.roles as OrganizationRole[]
    },

    getRole: async (data: GetRoleData): Promise<OrganizationRole> => {
        const result = await authClient.organization.getRole(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to get role")
        }
        return result.data.role as OrganizationRole
    },

    updateRole: async (data: UpdateRoleData): Promise<OrganizationRole> => {
        const result = await authClient.organization.updateRole(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to update role")
        }
        return result.data.role as OrganizationRole
    },

    deleteRole: async (data: DeleteRoleData): Promise<void> => {
        const result = await authClient.organization.deleteRole(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to delete role")
        }
    },

    // Team Management
    createTeam: async (data: CreateTeamData): Promise<OrganizationTeam> => {
        const result = await authClient.organization.createTeam(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to create team")
        }
        return result.data.team as OrganizationTeam
    },

    listTeams: async (data?: ListTeamsData): Promise<OrganizationTeam[]> => {
        const result = await authClient.organization.listTeams(data || {})
        if (result.error) {
            throw new Error(result.error?.message || "Failed to list teams")
        }
        return result.data.teams as OrganizationTeam[]
    },

    updateTeam: async (data: UpdateTeamData): Promise<OrganizationTeam> => {
        const result = await authClient.organization.updateTeam(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to update team")
        }
        return result.data.team as OrganizationTeam
    },

    removeTeam: async (data: RemoveTeamData): Promise<void> => {
        const result = await authClient.organization.removeTeam(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to remove team")
        }
    },

    setActiveTeam: async (data: SetActiveTeamData): Promise<void> => {
        const result = await authClient.organization.setActiveTeam(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to set active team")
        }
    },

    listUserTeams: async (): Promise<OrganizationTeam[]> => {
        const result = await authClient.organization.listUserTeams()
        if (result.error) {
            throw new Error(result.error?.message || "Failed to list user teams")
        }
        return result.data.teams as OrganizationTeam[]
    },

    listTeamMembers: async (data: ListTeamMembersData): Promise<OrganizationMember[]> => {
        const result = await authClient.organization.listTeamMembers(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to list team members")
        }
        return result.data.members as OrganizationMember[]
    },

    addTeamMember: async (data: AddTeamMemberData): Promise<void> => {
        const result = await authClient.organization.addTeamMember(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to add team member")
        }
    },

    removeTeamMember: async (data: RemoveTeamMemberData): Promise<void> => {
        const result = await authClient.organization.removeTeamMember(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to remove team member")
        }
    },

    getFullOrganization: async (data: { organizationId: string; membersLimit?: number }) => {
        const result = await authClient.organization.getFullOrganization(data)
        if (result.error) {
            throw new Error(result.error?.message || "Failed to get full organization")
        }
        return result.data as OrganizationData
    },

}

// --------------------| Organization Hooks & Utilities |--------------------

export const useOrganization = () => {
    return {
        ...organizationService,
        // Add any reactive/composable utilities here if needed
    }
}

// --------------------| Utility Functions |--------------------

// Helper function to check if user has specific role in organization
export const hasRole = (member: OrganizationMember | null, targetRole: string): boolean => {
    if (!member) return false
    if (Array.isArray(member.role)) {
        return member.role.includes(targetRole)
    }
    return member.role === targetRole
}

// Helper function to check if user has any of the specified roles
export const hasAnyRole = (member: OrganizationMember | null, targetRoles: string[]): boolean => {
    if (!member) return false
    if (Array.isArray(member.role)) {
        return member.role.some(role => targetRoles.includes(role))
    }
    return targetRoles.includes(member.role)
}

// Helper function to check if user is organization owner
export const isOwner = (member: OrganizationMember | null): boolean => {
    return hasRole(member, "owner")
}

// Helper function to check if user is organization admin or owner
export const isAdminOrOwner = (member: OrganizationMember | null): boolean => {
    return hasAnyRole(member, ["admin", "owner"])
}

// All types are already exported above with their interface declarations
