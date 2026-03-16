// Export auth client and related functionality
export * from "./auth-client"

// Export admin service and types
export * from "./admin"

// Export organization service and types (excluding conflicting Organization type)
export {
    organizationService,
    useOrganization,
    hasRole,
    hasAnyRole,
    isOwner,
    isAdminOrOwner,
    type Organization as OrgOrganization,
    type OrganizationMember,
    type OrganizationInvitation,
    type OrganizationTeam,
    type OrganizationRole,
    type CreateOrganizationData,
    type UpdateOrganizationData,
    type CheckSlugData,
    type InviteMemberData,
    type AddMemberData,
    type UpdateMemberRoleData,
    type RemoveMemberData,
    type ListMembersData,
    type SetActiveOrganizationData,
    type RemoveOrganizationData,
    type AcceptInvitationData,
    type RejectInvitationData,
    type CancelInvitationData,
    type GetInvitationData,
    type ListInvitationsData,
    type LeaveOrganizationData,
    type CreateRoleData,
    type DeleteRoleData,
    type ListRolesData,
    type GetRoleData,
    type UpdateRoleData,
    type CreateTeamData,
    type ListTeamsData,
    type UpdateTeamData,
    type RemoveTeamData,
    type SetActiveTeamData,
    type ListTeamMembersData,
    type AddTeamMemberData,
    type RemoveTeamMemberData,
} from "./organization-client"

// Re-export commonly used types and functions
export { authClient } from "./auth-client"
export { adminService as betterAuthAdminService } from "./admin"
export { organizationService as organizationservice } from "./organization-client"
