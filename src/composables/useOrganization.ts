import { useOrganizationStore } from '~/store/organization'
import { organizationService, hasRole, hasAnyRole, isOwner, isAdminOrOwner } from '~/services/better-auth'
import type { OrgOrganization, OrganizationMember } from '~/services/better-auth'

export const useOrganization = () => {
  const organizationStore = useOrganizationStore()

  // Reactive state
  const organizations = computed(() => organizationStore.organizations)
  const currentOrganization = computed(() => organizationStore.currentOrganization)
  const members = computed(() => organizationStore.organizationMembers)
  const isLoading = computed(() => organizationStore.isLoading)

  // Organization management
  const createOrganization = async (data: {
    name: string
    slug: string
    logo?: string
    metadata?: Record<string, any>
  }) => {
    return await organizationStore.createOrganization(data)
  }

  const updateOrganization = async (
    organizationId: string,
    data: {
      name?: string
      slug?: string
      logo?: string
      metadata?: Record<string, any>
    }
  ) => {
    return await organizationStore.updateOrganization(organizationId, data)
  }

  const deleteOrganization = async (organizationId: string) => {
    await organizationStore.deleteOrganization(organizationId)
  }

  const setActiveOrganization = async (organizationId: string) => {
    await organizationStore.setActiveOrganization(organizationId)
  }

  const checkSlug = async (slug: string) => {
    return await organizationStore.checkSlug(slug)
  }

  // Member management
  const fetchMembers = async (organizationId?: string) => {
    return await organizationStore.fetchOrganizationMembers(organizationId)
  }

  const inviteMember = async (
    email: string,
    role: string | string[],
    organizationId?: string,
    teamId?: string
  ) => {
    return await organizationStore.inviteMember(email, role, organizationId, teamId)
  }

  const addMember = async (
    userId: string,
    role: string | string[],
    organizationId?: string,
    teamId?: string
  ) => {
    return await organizationStore.addMember(userId, role, organizationId, teamId)
  }

  const updateMemberRole = async (
    memberId: string,
    role: string | string[],
    organizationId?: string
  ) => {
    await organizationStore.updateMemberRole(memberId, role, organizationId)
  }

  const removeMember = async (memberIdOrEmail: string, organizationId?: string) => {
    await organizationStore.removeMember(memberIdOrEmail, organizationId)
  }

  const leaveOrganization = async (organizationId: string) => {
    await organizationStore.leaveOrganization(organizationId)
  }

  // Invitation management
  const listInvitations = async (organizationId?: string) => {
    return await organizationStore.listInvitations(organizationId)
  }

  const acceptInvitation = async (invitationId: string) => {
    await organizationStore.acceptInvitation(invitationId)
  }

  const rejectInvitation = async (invitationId: string) => {
    await organizationStore.rejectInvitation(invitationId)
  }

  const cancelInvitation = async (invitationId: string) => {
    await organizationStore.cancelInvitation(invitationId)
  }

  // Utility functions
  const getCurrentMember = (): OrganizationMember | null => {
    if (!currentOrganization.value) return null
    // You would need to implement logic to get current user's membership
    // This might require getting the current user from auth and finding their membership
    return null
  }

  const canManageMembers = (member?: OrganizationMember | null): boolean => {
    if (!member) return false
    return isAdminOrOwner(member)
  }

  const canDeleteOrganization = (member?: OrganizationMember | null): boolean => {
    if (!member) return false
    return isOwner(member)
  }

  const hasPermission = (member: OrganizationMember | null, role: string): boolean => {
    return hasRole(member, role)
  }

  const hasAnyPermission = (member: OrganizationMember | null, roles: string[]): boolean => {
    return hasAnyRole(member, roles)
  }

  // Initialize data
  const initialize = async () => {
    try {
      await organizationStore.fetchUserOrganizations()
      await organizationStore.getActiveOrganization()
      if (currentOrganization.value) {
        await fetchMembers(currentOrganization.value.id)
      }
    } catch (error) {
      console.error('Failed to initialize organization data:', error)
      throw error
    }
  }

  const getOrganizationById = (id: string) =>
    organizations.value.find(org => org.id === id) || null

  const listUserOrganizations = async () => {
    return await organizationStore.fetchUserOrganizations()
  }

  return {
    // Reactive state
    organizations,
    currentOrganization,
    members,
    isLoading,

    // Organization management
    createOrganization,
    updateOrganization,
    deleteOrganization,
    setActiveOrganization,
    checkSlug,

    // Member management
    fetchMembers,
    inviteMember,
    addMember,
    updateMemberRole,
    removeMember,
    leaveOrganization,

    // Invitation management
    listInvitations,
    acceptInvitation,
    rejectInvitation,
    cancelInvitation,

    // Utility functions
    getCurrentMember,
    canManageMembers,
    canDeleteOrganization,
    hasPermission,
    hasAnyPermission,

    // Initialization
    initialize,

    // Direct service access (for advanced usage)
    organizationService,
    getOrganizationById,
    listUserOrganizations,
  }
}
