import type { IOrganizationStore } from "@/types/store"
import { defineStore } from "pinia"
import { organizationService, type OrgOrganization, type OrganizationMember } from "~/services/better-auth"

export const useOrganizationStore = defineStore("organization", {
    state: (): IOrganizationStore => ({
        currentOrganizationId: "",
        organizations: [] as OrgOrganization[],
        currentOrganization: null as OrgOrganization | null,
        organizationMembers: [] as OrganizationMember[],
        isLoading: false,
    }),
    actions: {
        // Better Auth organization methods 
        async fetchOrganizations() {
            this.isLoading = true
            try {
                const orgs = await organizationService.listOrganizations()
                this.organizations = orgs
                return this.organizations
            } finally {
                this.isLoading = false
            }
        },

        async fetchUserOrganizations() {
            try {
                this.isLoading = true
                this.organizations = await organizationService.listUserOrganizations()
            } catch (error) {
                console.error("Failed to fetch user organizations:", error)
                throw error
            } finally {
                this.isLoading = false
            }
        },

        async createOrganization(data: { name: string; slug: string; logo?: string; metadata?: Record<string, any> }) {
            try {
                this.isLoading = true
                const organization = await organizationService.createOrganization(data)
                this.organizations.push(organization)
                return organization
            } catch (error) {
                console.error("Failed to create organization:", error)
                throw error
            } finally {
                this.isLoading = false
            }
        },

        async updateOrganization(organizationId: string, data: { name?: string; slug?: string; logo?: string; metadata?: Record<string, any> }) {
            try {
                this.isLoading = true
                const updatedOrg = await organizationService.updateOrganization({ organizationId, data })
                const index = this.organizations.findIndex((org: OrgOrganization) => org.id === organizationId)
                if (index !== -1) {
                    this.organizations[index] = updatedOrg
                }
                if (this.currentOrganization?.id === organizationId) {
                    this.currentOrganization = updatedOrg
                }
                return updatedOrg
            } catch (error) {
                console.error("Failed to update organization:", error)
                throw error
            } finally {
                this.isLoading = false
            }
        },

        async deleteOrganization(organizationId: string) {
            try {
                this.isLoading = true
                await organizationService.deleteOrganization({ organizationId })
                this.organizations = this.organizations.filter((org: OrgOrganization) => org.id !== organizationId)
                if (this.currentOrganization?.id === organizationId) {
                    this.currentOrganization = null
                }
            } catch (error) {
                console.error("Failed to delete organization:", error)
                throw error
            } finally {
                this.isLoading = false
            }
        },

        async setActiveOrganization(organizationId: string) {
            try {
                await organizationService.setActiveOrganization({ organizationId })
                this.currentOrganization = this.organizations.find((org: OrgOrganization) => org.id === organizationId) || null
                this.currentOrganizationId = organizationId
            } catch (error) {
                console.error("Failed to set active organization:", error)
                throw error
            }
        },

        async getActiveOrganization() {
            try {
                this.currentOrganization = await organizationService.getActiveOrganization()
                this.currentOrganizationId = this.currentOrganization?.id || ""
                return this.currentOrganization
            } catch (error) {
                console.error("Failed to get active organization:", error)
                throw error
            }
        },

        async checkSlug(slug: string) {
            try {
                return await organizationService.checkSlug({ slug })
            } catch (error) {
                console.error("Failed to check slug:", error)
                throw error
            }
        },

        // Member management
        async fetchOrganizationMembers(organizationId: string) {
            try {
                this.isLoading = true

                // result IS the organization object
                const org = await organizationService.getFullOrganization({
                organizationId,
                membersLimit: 100
                })

                this.organizationMembers = org.members || []

                return this.organizationMembers
            } catch (error) {
                console.error("Failed to fetch organization members:", error)
                throw error
            } finally {
                this.isLoading = false
            }
        },

        async inviteMember(email: string, role: string | string[], organizationId?: string, teamId?: string) {
            try {
                this.isLoading = true
                return await organizationService.inviteMember({ email, role, organizationId, teamId })
            } catch (error) {
                console.error("Failed to invite member:", error)
                throw error
            } finally {
                this.isLoading = false
            }
        },

        async addMember(userId: string, role: string | string[], organizationId?: string, teamId?: string) {
            try {
                this.isLoading = true
                const member = await organizationService.addMember({ userId, role, organizationId, teamId })
                this.organizationMembers.push(member)
                return member
            } catch (error) {
                console.error("Failed to add member:", error)
                throw error
            } finally {
                this.isLoading = false
            }
        },

        async updateMemberRole(memberId: string, role: string | string[], organizationId?: string) {
            try {
                this.isLoading = true
                await organizationService.updateMemberRole({ role, memberId, organizationId })
                // Update local member data
                const memberIndex = this.organizationMembers.findIndex((m: OrganizationMember) => m.id === memberId)
                if (memberIndex !== -1) {
                    this.organizationMembers[memberIndex].role = role
                }
            } catch (error) {
                console.error("Failed to update member role:", error)
                throw error
            } finally {
                this.isLoading = false
            }
        },

        async removeMember(memberIdOrEmail: string, organizationId?: string) {
            try {
                this.isLoading = true
                await organizationService.removeMember({ memberIdOrEmail, organizationId })
                // Remove from local state
                this.organizationMembers = this.organizationMembers.filter((m: OrganizationMember) => 
                    m.id !== memberIdOrEmail && m.user?.email !== memberIdOrEmail
                )
            } catch (error) {
                console.error("Failed to remove member:", error)
                throw error
            } finally {
                this.isLoading = false
            }
        },

        async leaveOrganization(organizationId: string) {
            try {
                this.isLoading = true
                await organizationService.leaveOrganization({ organizationId })
                // Remove from local state
                this.organizations = this.organizations.filter((org: OrgOrganization) => org.id !== organizationId)
                if (this.currentOrganization?.id === organizationId) {
                    this.currentOrganization = null
                }
            } catch (error) {
                console.error("Failed to leave organization:", error)
                throw error
            } finally {
                this.isLoading = false
            }
        },

        // Invitation management
        async listInvitations(organizationId?: string) {
            try {
                return await organizationService.listInvitations(organizationId ? { organizationId } : undefined)
            } catch (error) {
                console.error("Failed to list invitations:", error)
                throw error
            }
        },

        async getOrganizationById(organizationId: string) {
            return this.organizations.find((org: OrgOrganization) => org.id === organizationId) || null
        },

        async acceptInvitation(invitationId: string) {
            try {
                await organizationService.acceptInvitation({ invitationId })
                // Refresh organizations after accepting invitation
                await this.fetchUserOrganizations()
            } catch (error) {
                console.error("Failed to accept invitation:", error)
                throw error
            }
        },

        async rejectInvitation(invitationId: string) {
            try {
                await organizationService.rejectInvitation({ invitationId })
            } catch (error) {
                console.error("Failed to reject invitation:", error)
                throw error
            }
        },

        async cancelInvitation(invitationId: string) {
            try {
                await organizationService.cancelInvitation({ invitationId })
            } catch (error) {
                console.error("Failed to cancel invitation:", error)
                throw error
            }
        },
    },
})
