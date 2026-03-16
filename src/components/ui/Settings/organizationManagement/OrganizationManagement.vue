<template>
    <div class="text-textColor flex h-full w-full flex-col gap-6 p-6">
        <!-- Header Section -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-2">
                <div class="materialSymbolsOutlined text-3xl">manage_accounts</div>
                <div>
                    <h1 class="text-2xl font-bold">Organization Management</h1>
                    <p class="text-textColor/70 text-sm">Manage team members, roles, and permissions</p>
                </div>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <OrganizationView v-model="view" />

            <!-- Active Org Dropdown -->
            <div class="relative" v-click-outside="() => isOpen = false">
            <button
                class="bg-card border border-border rounded-md px-3 py-2 text-sm flex items-center gap-2"
                @click="toggle"
                title="Switch active organization"
            >
                <img
                v-if="currentOrg?.logo"
                :src="currentOrg.logo"
                alt="Org Logo"
                class="w-5 h-5 rounded-full object-cover"
                />
                <InitialAvatar v-else :name="currentOrg?.name || 'Org'" size="20" />
                <span class="truncate max-w-[160px]">{{ currentOrg?.name || 'Select organization' }}</span>
                <span class="materialSymbolsOutlined">expand_more</span>
            </button>

            <div
                v-if="isOpen"
                class="absolute right-0 mt-2 w-60 bg-background border border-border rounded shadow-md z-50"
            >
                <ul class="max-h-72 overflow-auto">
                <li
                    v-for="org in organizations"
                    :key="org.id"
                    :class="[
                        'px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-itemColor/60',
                        currentOrg?.id === org.id ? 'bg-itemColor/5' : ''
                    ]"
                    @click="onPick(org)"
                    :title="org.slug"
                >
                    <img
                    v-if="org.logo"
                    :src="org.logo"
                    alt=""
                    class="w-5 h-5 rounded-full object-cover"
                    />
                    <InitialAvatar v-else :name="org.name" size="20" />
                    <span class="flex-1 truncate">{{ org.name }}</span>
                    <span
                    v-if="currentOrg && org.id === currentOrg.id"
                    class="materialSymbolsOutlined text-sm"
                    aria-label="Active"
                    >check</span>
                </li>
                </ul>
            </div>
            </div>

            <!-- Manage Dropdown -->
            <div class="relative" v-click-outside="() => isActionsOpen = false">
                <button
                    class="bg-card border border-border rounded-md px-3 py-2 text-sm flex items-center gap-2"
                    @click="toggleActions"
                    title="Organization actions"
                >
                    <span class="materialSymbolsOutlined">more_vert</span>
                    <span>Manage</span>
                    <span class="materialSymbolsOutlined">expand_more</span>
                </button>

                <div
                    v-if="isActionsOpen"
                    class="absolute right-0 mt-2 w-56 bg-background border border-border rounded shadow-md z-50"
                >
                    <ul class="max-h-72 overflow-auto">
                    <!-- Add Member -->
                        <li
                        class="px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-itemColor/60"
                        @click="openAddMember(); isActionsOpen = false"
                        title="Invite a new member"
                        >
                        <span class="materialSymbolsOutlined text-sm">person_add</span>
                        <span class="flex-1 truncate">Add Member</span>
                        </li>

                        <!-- Add Organization -->
                        <li
                        class="px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-itemColor/60"
                        @click="showAddOrganizationModal = true; isActionsOpen = false"
                        title="Create a new organization"
                        >
                        <span class="materialSymbolsOutlined text-sm">add_business</span>
                        <span class="flex-1 truncate">Add Organization</span>
                        </li>

                        <!-- Update Organization -->
                        <li
                        :class="[
                            'px-3 py-2 flex items-center gap-2 hover:bg-itemColor/60',
                            isOwner ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                        ]"
                        @click="isOwner && (openUpdateOrg(organizationStore.currentOrganization), isActionsOpen = false)"
                        :title="isOwner ? 'Update organization' : 'Only the owner can update the organization'"
                        >
                        <span class="materialSymbolsOutlined text-sm">edit</span>
                        <span class="flex-1 truncate">Update Organization</span>
                        <span v-if="!isOwner" class="materialSymbolsOutlined text-xs" aria-hidden="true">lock</span>
                        </li>

                        <!-- Leave Organization -->
                        <li
                        :class="[
                            'px-3 py-2 flex items-center gap-2 hover:bg-itemColor/60',
                            canLeave ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                        ]"
                        @click="canLeave && (showLeaveConfirm = true, isActionsOpen = false)"
                        :aria-disabled="!canLeave"
                        :title="canLeave ? 'Leave this organization' : (leaveDisabledReason || 'Cannot leave')"
                        >
                        <span class="materialSymbolsOutlined text-sm">logout</span>
                        <span class="flex-1 truncate">Leave Organization</span>
                        <span v-if="!canLeave" class="materialSymbolsOutlined text-xs" aria-hidden="true">lock</span>
                        </li>
                    </ul>
                </div>
            </div>

        </div>

        <!-- Search and Filter Section -->
        <div class="bg-sideBarBackgroundColor flex flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="border-strokeColor bg-backgroundColor flex flex-1 items-center gap-2 rounded-md border px-3 py-2">
                <div class="materialSymbolsOutlined text-textColor/50">search</div>
                <input v-model="searchQuery" type="text" placeholder="Search members by name or email..." class="text-textColor placeholder-textColor/50 flex-1 bg-transparent focus:outline-none" />
                <button v-if="searchQuery" @click="searchQuery = ''" class="materialSymbolsOutlined text-textColor/50 hover:text-textColor">close</button>
            </div>
            <div class="flex items-center gap-2">
                <label class="text-textColor/70 text-sm font-medium">Filter by role:</label>
                <select v-model="selectedRoleFilter" class="border-strokeColor bg-backgroundColor text-textColor focus:border-itemColor focus:ring-itemColor rounded border px-3 py-2 focus:ring-1 focus:outline-none">
                    <option value="">All Roles</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                </select>
            </div>
        </div>


        <!-- Error Message -->
        <div v-if="error" class="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
            <div class="flex items-center gap-2 text-red-800">
                <div class="materialSymbolsOutlined text-red-600">error</div>
                <p class="font-medium">{{ error }}</p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
            <div class="flex items-center gap-3 text-textColor/70">
                <div class="animate-spin h-6 w-6 border-2 border-itemColor border-t-transparent rounded-full"></div>
                <p>Loading organization members...</p>
            </div>
        </div>

        <!-- Members Table -->
        <div v-if="!isLoading && view === 'members'" class="flex-1 overflow-hidden rounded-lg bg-sideBarBackgroundColor">
            <!-- Table container with fixed height and vertical scroll -->
            <div class="max-h-[600px] overflow-y-auto">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <!-- Table Header - Sticky -->
                        <thead class="sticky top-0 z-10 bg-backgroundColor shadow-sm">
                            <tr>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-textColor">
                                    <div class="flex items-center gap-2">
                                        <div class="materialSymbolsOutlined text-base">person</div>
                                        Member
                                    </div>
                                </th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-textColor">
                                    <div class="flex items-center gap-2">
                                        <div class="materialSymbolsOutlined text-base">badge</div>
                                        Role
                                    </div>
                                </th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-textColor">
                                    <div class="flex items-center gap-2">
                                        <div class="materialSymbolsOutlined text-base">schedule</div>
                                        Joined
                                    </div>
                                </th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-textColor">
                                    <div class="flex items-center gap-2">
                                        <div class="materialSymbolsOutlined text-base">login</div>
                                        Last Active
                                    </div>
                                </th>
                                <th v-if="isAdminOrOwner" class="px-4 py-3 text-right text-sm font-semibold text-textColor">Actions</th>
                            </tr>
                        </thead>
                        <!-- Table Body -->
                        <tbody class="divide-y divide-strokeColor">
                            <tr v-for="member in paginatedMembers" :key="member.id"
                                class="transition-colors hover:bg-backgroundColor/50">
                                <!-- Member Info -->
                                <td class="px-4 py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="relative">
                                            <img v-if="member.profilePicture" :src="member.profilePicture"
                                                :alt="member.name" class="h-10 w-10 rounded-full object-cover" />
                                            <div v-else
                                                class="flex h-10 w-10 items-center justify-center rounded-full bg-itemColor text-white font-medium text-sm">
                                                {{ member.name.charAt(0).toUpperCase() }}
                                            </div>
                                            <div v-if="member.isOnline"
                                                class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-backgroundColor bg-green-500">
                                            </div>
                                        </div>
                                        <div class="min-w-0 flex-1">
                                            <p class="truncate font-medium text-textColor">{{ member.name }}</p>
                                            <p class="truncate text-sm text-textColor/70">{{ member.email }}</p>
                                        </div>
                                    </div>
                                </td>
                                <!-- Role -->
                                <td class="px-4 py-4">
                                    <span :class="getRoleBadgeClass(member.role)"
                                        class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
                                        <div :class="getRoleIconClass(member.role)"
                                            class="materialSymbolsOutlined text-xs">
                                        </div>
                                        {{ member.role.charAt(0).toUpperCase() + member.role.slice(1) }}
                                    </span>
                                </td>
                                <!-- Joined Date -->
                                <td class="px-4 py-4 text-sm text-textColor/70">
                                    {{ formatDate(member.joinedAt) }}
                                </td>
                                <!-- Last Active -->
                                <td class="px-4 py-4 text-sm text-textColor/70">
                                    {{ formatLastActive(member.lastActive) }}
                                </td>
                                <!-- Actions -->
                                <td v-if="isAdminOrOwner" class="px-4 py-4">
                                    <div class="flex items-center justify-end gap-2">
                                        <button @click="editMember(member)"
                                            class="rounded p-1.5 text-textColor/70 transition-colors hover:bg-backgroundColor hover:text-textColor"
                                            title="Edit Member">
                                            <div class="materialSymbolsOutlined text-base">edit</div>
                                        </button>
                                        <button v-if="member.role !== 'owner'" @click="openRemoveMember(member)"
                                            class="rounded p-1.5 text-red-500 transition-colors hover:bg-red-500/10"
                                            title="Remove Member">
                                            <div class="materialSymbolsOutlined text-base">person_remove</div>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredMembers.length === 0" class="flex flex-col items-center justify-center py-12">
                <div class="materialSymbolsOutlined mb-4 text-6xl text-textColor/30">group_off</div>
                <h3 class="mb-2 text-lg font-medium text-textColor">No members found</h3>
                <p class="text-textColor/70">
                    {{ searchQuery ? 'Try adjusting your search criteria' : 'Add members to get started' }}
                </p>
            </div>

            <!-- Enhanced Pagination -->
            <div v-if="totalPages > 1" class="border-t border-strokeColor px-4 py-4">
                <!-- Mobile Pagination -->
                <div class="flex flex-col gap-4 md:hidden">
                    <!-- Items per page selector -->
                    <div class="flex items-center justify-between">
                        <div class="text-sm text-textColor/70">
                            {{ filteredMembers.length }} total members
                        </div>
                        <div class="flex items-center gap-2">
                            <label class="text-sm text-textColor/70">Show:</label>
                            <select v-model="itemsPerPage" @change="currentPage = 1"
                                class="rounded border border-strokeColor bg-backgroundColor px-2 py-1 text-sm text-textColor focus:border-itemColor focus:outline-none">
                                <option :value="5">5</option>
                                <option :value="10">10</option>
                                <option :value="15">15</option>
                                <option :value="25">25</option>
                            </select>
                        </div>
                    </div>

                    <!-- Mobile navigation -->
                    <div class="flex items-center justify-between">
                        <button @click="goToPage(1)" :disabled="currentPage === 1"
                            class="flex items-center gap-1 rounded border border-strokeColor px-3 py-2 text-sm transition-colors hover:bg-backgroundColor disabled:opacity-50 disabled:cursor-not-allowed">
                            <div class="materialSymbolsOutlined text-sm">first_page</div>
                            First
                        </button>

                        <div class="flex items-center gap-2">
                            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
                                class="rounded border border-strokeColor p-2 transition-colors hover:bg-backgroundColor disabled:opacity-50 disabled:cursor-not-allowed">
                                <div class="materialSymbolsOutlined text-sm">chevron_left</div>
                            </button>

                            <span class="text-sm font-medium text-textColor">
                                {{ currentPage }} / {{ totalPages }}
                            </span>

                            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
                                class="rounded border border-strokeColor p-2 transition-colors hover:bg-backgroundColor disabled:opacity-50 disabled:cursor-not-allowed">
                                <div class="materialSymbolsOutlined text-sm">chevron_right</div>
                            </button>
                        </div>

                        <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages"
                            class="flex items-center gap-1 rounded border border-strokeColor px-3 py-2 text-sm transition-colors hover:bg-backgroundColor disabled:opacity-50 disabled:cursor-not-allowed">
                            Last
                            <div class="materialSymbolsOutlined text-sm">last_page</div>
                        </button>
                    </div>
                </div>

                <!-- Desktop Pagination -->
                <div class="hidden md:flex md:items-center md:justify-between">
                    <!-- Results info -->
                    <div class="flex items-center gap-4">
                        <div class="text-sm text-textColor/70">
                            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
                            {{ Math.min(currentPage * itemsPerPage, filteredMembers.length) }} of
                            {{ filteredMembers.length }} members
                        </div>

                        <!-- Items per page selector -->
                        <div class="flex items-center gap-2">
                            <label class="text-sm text-textColor/70">Show:</label>
                            <select v-model="itemsPerPage" @change="currentPage = 1"
                                class="rounded border border-strokeColor bg-backgroundColor px-2 py-1 text-sm text-textColor focus:border-itemColor focus:outline-none">
                                <option :value="5">5</option>
                                <option :value="10">10</option>
                                <option :value="15">15</option>
                                <option :value="25">25</option>
                            </select>
                        </div>
                    </div>

                    <!-- Page navigation -->
                    <div class="flex items-center gap-1">
                        <!-- First page -->
                        <button @click="goToPage(1)" :disabled="currentPage === 1"
                            class="flex items-center gap-1 rounded border border-strokeColor px-3 py-1.5 text-sm transition-colors hover:bg-backgroundColor disabled:opacity-50 disabled:cursor-not-allowed">
                            <div class="materialSymbolsOutlined text-sm">first_page</div>
                            First
                        </button>

                        <!-- Previous page -->
                        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
                            class="rounded border border-strokeColor p-1.5 transition-colors hover:bg-backgroundColor disabled:opacity-50 disabled:cursor-not-allowed">
                            <div class="materialSymbolsOutlined text-sm">chevron_left</div>
                        </button>

                        <!-- Page numbers -->
                        <div class="flex items-center gap-1">
                            <template v-for="page in visiblePageNumbers" :key="page">
                                <button v-if="typeof page === 'number'" @click="goToPage(page)" :class="[
                                    'min-w-[2rem] rounded px-2 py-1.5 text-sm transition-colors',
                                    page === currentPage
                                        ? 'bg-itemColor text-white'
                                        : 'border border-strokeColor hover:bg-backgroundColor text-textColor'
                                ]">
                                    {{ page }}
                                </button>
                                <span v-else class="px-2 py-1.5 text-sm text-textColor/50">...</span>
                            </template>
                        </div>

                        <!-- Next page -->
                        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
                            class="rounded border border-strokeColor p-1.5 transition-colors hover:bg-backgroundColor disabled:opacity-50 disabled:cursor-not-allowed">
                            <div class="materialSymbolsOutlined text-sm">chevron_right</div>
                        </button>

                        <!-- Last page -->
                        <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages"
                            class="flex items-center gap-1 rounded border border-strokeColor px-3 py-1.5 text-sm transition-colors hover:bg-backgroundColor disabled:opacity-50 disabled:cursor-not-allowed">
                            Last
                            <div class="materialSymbolsOutlined text-sm">last_page</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Organizations View -->
        <div v-if="!isLoading && view === 'organizations'" class="flex-1 overflow-hidden rounded-lg bg-sideBarBackgroundColor">
            <div class="max-h-[600px] overflow-y-auto">
                <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="sticky top-0 z-10 bg-backgroundColor shadow-sm">
                    <tr>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-textColor">Name</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-textColor">Slug</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-textColor">Description</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-textColor">Created</th>
                        <th class="px-4 py-3 text-right text-sm font-semibold text-textColor">Actions</th>
                    </tr>
                    </thead>
                    <tbody class="divide-y divide-strokeColor">
                    <tr v-for="org in organizations" :key="org.id" class="transition-colors hover:bg-backgroundColor/50">
                        <td class="px-4 py-4">{{ org.name }}</td>
                        <td class="px-4 py-4">{{ org.slug }}</td>
                        <td class="px-4 py-4">
                        {{ parseDescription(org.metadata) }}
                        </td>
                        <td class="px-4 py-4">{{ formatDate(org.createdAt) }}</td>
                        <td class="px-4 py-4 text-right">
                        <Tooltip :text="deleteTooltip(org)">
                            <button
                            :disabled="!canDeleteOrg(org)"
                            @click="canDeleteOrg(org) && openDeleteOrganization(org)"
                            class="rounded p-1.5 transition-colors disabled:cursor-not-allowed"
                            :class="canDeleteOrg(org) ? 'text-red-500 hover:bg-red-500/10' : 'text-textColor/40'"
                            >
                            <div class="materialSymbolsOutlined text-base">delete</div>
                            </button>
                        </Tooltip>
                        </td>
                    </tr>
                    </tbody>
                </table>
                </div>
            </div>
        </div>

        <!-- Edit Member Modal -->
        <div v-if="showEditMemberModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="showEditMemberModal = false">
            <div class="bg-backgroundColor w-full max-w-md rounded-lg p-6 shadow-xl">
                <div class="mb-4 flex items-center justify-between">
                    <h2 class="text-textColor text-xl font-bold">Edit Member</h2>
                    <button @click="showEditMemberModal = false" class="text-textColor/70 hover:bg-sideBarBackgroundColor hover:text-textColor rounded p-1">
                        <div class="materialSymbolsOutlined">close</div>
                    </button>
                </div>

                <form @submit.prevent="updateMember" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-textColor mb-2">Name</label>
                        <input v-model="editingMember!.name" type="text" required
                            class="w-full rounded border border-strokeColor bg-sideBarBackgroundColor px-3 py-2 text-textColor focus:border-itemColor focus:outline-none focus:ring-1 focus:ring-itemColor" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-textColor mb-2">Email</label>
                        <input v-model="editingMember!.email" type="email" required
                            class="w-full rounded border border-strokeColor bg-sideBarBackgroundColor px-3 py-2 text-textColor focus:border-itemColor focus:outline-none focus:ring-1 focus:ring-itemColor" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-textColor mb-2">Role</label>
                        <select v-model="editingMember!.role" :disabled="editingMember!.role === 'owner'"
                            class="w-full rounded border border-strokeColor bg-sideBarBackgroundColor px-3 py-2 text-textColor focus:border-itemColor focus:outline-none focus:ring-1 focus:ring-itemColor disabled:opacity-50 disabled:cursor-not-allowed">
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            <option value="owner">Owner</option>
                        </select>
                    </div>
                    <div class="flex gap-2 pt-4">
                        <button type="button" @click="showEditMemberModal = false"
                            class="flex-1 rounded border border-strokeColor py-2 text-textColor transition-colors hover:bg-sideBarBackgroundColor">
                            Cancel
                        </button>
                        <button type="submit"
                            :disabled="!isMemberUpdated"
                            class="flex-1 rounded bg-logoColor py-2 text-white transition-colors hover:bg-logoColor/90 disabled:opacity-50 disabled:cursor-not-allowed">
                            Update Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Add Organization Modal -->
        <AddOrganization
            v-if="showAddOrganizationModal"
            :show="showAddOrganizationModal"
            @update:show="showAddOrganizationModal = $event"
            @created="handleOrganizationCreated"
        />
        <!-- Update Organization Modal -->
        <UpdateOrganization
            v-if="showUpdateOrganizationModal"
            :show="showUpdateOrganizationModal"
            :selectedOrganization="selectedOrganization"
            @update:show="showUpdateOrganizationModal = $event"
            @buttonClick="handleOrganizationUpdated"
        />
        <!-- Delete Organization Modal -->
        <DeleteOrganization
            v-if="showDeleteOrganizationModal"
            :show="showDeleteOrganizationModal"
            :organization="organizationToDelete"
            @update:show="showDeleteOrganizationModal = $event"
            @deleted="handleOrganizationDeleted"
        />
        <!-- Add Member Modal -->
        <AddMemberToOrganization
            v-if="showAddMemberModal"
            :show="showAddMemberModal"
            :organization="organizationStore.currentOrganization"
            :organizations="organizations"
            :membersEmails="activeOrgMembers"
            @update:show="showAddMemberModal = $event"
            @buttonClick="handleMemberInvited"
        />
        <!-- Remove Member Confirmation Modal -->
        <RemoveMemberFromOrganization
            v-if="showRemoveMemberModal"
            :show="showRemoveMemberModal"
            :member="memberToRemove"
            :organization-id="organizationStore.currentOrganization?.id"
            @update:show="showRemoveMemberModal = $event"
            @removed="handleMemberRemoved"
        />
        <!-- Leave Organization confirm -->
        <ConfirmationPopup
            v-if="showLeaveConfirm"
            :show="showLeaveConfirm"
            shortName="Organization"
            title="Leave this organization?"
            :subtitle="`You will lose access to ${currentOrg?.name || 'this organization'} and its resources.`"
            :closeOnTopRight="true"
            confirmButtonText="Leave"
            confirmButtonColor="#ef4444"
            @update:show="showLeaveConfirm = $event"
            @buttonClick="onLeaveConfirm"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useOrganizationStore } from '~/store/organization'
import { type OrganizationMember } from '~/services/better-auth'
import type { OrgOrganization } from '~/services/better-auth'
import eventBus from "~/util/eventBus"


// Types
interface Member {
    id: string
    name: string
    email: string
    role: 'owner' | 'admin' | 'member'
    profilePicture?: string
    joinedAt: string
    lastActive: string
    isOnline: boolean
}

const emit = defineEmits<{
    (e: "viewChange", view: "members" | "organizations"): void
}>()

// Store
const organizationStore = useOrganizationStore()
const userStore = useUserStore()

// Reactive data
const searchQuery = ref('')
const selectedRoleFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(5)
const selectedOrgId = ref('')
const view = ref<"members" | "organizations">("members")

// Modal states
const showAddMemberModal = ref(false)
const showEditMemberModal = ref(false)

const updateOrganizationData = reactive({
  id: '',
  name: '',
  description: '',
  slug: ''
})

const editingMember = ref<Member | null>(null)
const memberToRemove = ref<Member | null>(null)
const originalMember = ref<Member | null>(null)

const showAddOrganizationModal = ref(false)
const showUpdateOrganizationModal = ref(false)
const selectedOrganization = ref<any | null>(null)
const showDeleteOrganizationModal = ref(false)
const organizationToDelete = ref<any | null>(null)
const showRemoveMemberModal = ref(false)
const isOpen = ref(false)
const showLeaveConfirm = ref(false)
const initialOrg = ref('')
const updatedOrganization = ref('')
const isActionsOpen = ref(false)

const toggleActions = () => { isActionsOpen.value = !isActionsOpen.value }

const isMemberUpdated = computed(() => {
  if (!editingMember.value || !originalMember.value) return false

  const norm = (s: string) => (s || '').trim()
  return (
    norm(editingMember.value.name)  !== norm(originalMember.value.name)  ||
    norm(editingMember.value.email) !== norm(originalMember.value.email) ||
    editingMember.value.role        !== originalMember.value.role
  )
})

const isOwner = computed(() => {
  const myId = userStore.userId
  const members = organizationStore.organizationMembers || []
  const me = members.find((m: any) => m.userId === myId || m.user?.id === myId)
  if (!me) return false
  const role = me.role
  return Array.isArray(role) ? role.includes('owner') : role === 'owner'
})

const ownerCount = computed(() => {
  const members = organizationStore.organizationMembers || []
  return members.reduce((n: number, m: any) => {
    const r = m.role
    return n + (Array.isArray(r) ? (r.includes('owner') ? 1 : 0) : (r === 'owner' ? 1 : 0))
  }, 0)
})

const isSelf = (m: any) => {
  const uid = m?.userId ?? m?.user?.id
  return !!uid && uid === userStore.userId
}
const isOwnerMember = (m: any) => {
  const r = m?.role
  return Array.isArray(r) ? r.includes('owner') : r === 'owner'
}

const isAdminOrOwner = computed(() => {
  const myId = userStore.userId
  const me = (organizationStore.organizationMembers || [])
    .find((m: any) => m.userId === myId || m.user?.id === myId)
  if (!me) return false
  const r = me.role
  const has = (val: any, role: string) => Array.isArray(val) ? val.includes(role) : val === role
  return has(r, 'admin') || has(r, 'owner')
})

function isActiveOrg(org: any) {
  return currentOrg.value?.id === org?.id
}

function canDeleteOrg(org: any) {
  return isActiveOrg(org) && isOwner.value
}

function deleteTooltip(org: any) {
  if (!isActiveOrg(org)) return 'Make this the active organization to delete it'
  return isOwner.value ? 'Delete organization' : 'Only the owner can delete this organization'
}

const canLeave = computed(() => {
  if (!currentOrg.value?.id) return false
  if (!isOwner.value) return true
  // owner: block if last owner
  return ownerCount.value > 1
})

const leaveDisabledReason = computed(() => {
  if (!currentOrg.value?.id) return "No active organization"
  if (isOwner.value && ownerCount.value === 1) {
    return "You are the last owner. Transfer ownership or delete the organization."
  }
  return ""
})

const currentOrg = computed(() => organizationStore.currentOrganization)
const toggle = () => { isOpen.value = !isOpen.value }

// Real data from Better Auth
const members = computed<Member[]>(() => {
    const orgName = organizationStore.currentOrganization?.name || "Unknown Org"
    return organizationStore.organizationMembers.map((member: any) => ({
        id: member.id,
        name: member.user?.name || 'Unknown User',
        email: member.user?.email || 'No email',
        role: Array.isArray(member.role) ? member.role[0] as 'owner' | 'admin' | 'member' : member.role as 'owner' | 'admin' | 'member',
        profilePicture: member.user?.image,
        joinedAt: member.createdAt && !isNaN(Date.parse(member.createdAt))
        ? new Date(member.createdAt).toISOString().split('T')[0]
        : 'N/A',
        lastActive: new Date().toISOString(), // You might want to add lastActive to your member type
        isOnline: false,  // You might want to add online status tracking
        organizationName: orgName
    }))
})

const organizations = computed<OrgOrganization[]>(() =>
  (organizationStore.organizations || []).filter(
    (o): o is OrgOrganization => !!o && typeof o.id === 'string'
  )
)

// Loading state
const isLoading = computed(() => organizationStore.isLoading)

// Error handling
const error = ref<string | null>(null)

// Computed properties
const filteredMembers = computed(() => {
    let filtered = members.value

    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(member =>
            member.name.toLowerCase().includes(query) ||
            member.email.toLowerCase().includes(query)
        )
    }

    // Filter by role
    if (selectedRoleFilter.value) {
        filtered = filtered.filter(member => member.role === selectedRoleFilter.value)
    }

    return filtered
})

const totalPages = computed(() => Math.ceil(filteredMembers.value.length / itemsPerPage.value))

const paginatedMembers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredMembers.value.slice(start, end)
})

// Visible page numbers for pagination
const visiblePageNumbers = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    const delta = 2 // Number of pages to show on each side of current page

    if (total <= 7) {
        // Show all pages if total is small
        return Array.from({ length: total }, (_, i) => i + 1)
    }

    const range: (number | string)[] = []
    const rangeStart = Math.max(2, current - delta)
    const rangeEnd = Math.min(total - 1, current + delta)

    // Always show first page
    range.push(1)

    // Add ellipsis if needed
    if (rangeStart > 2) {
        range.push('...')
    }

    // Add pages around current page
    for (let i = rangeStart; i <= rangeEnd; i++) {
        range.push(i)
    }

    // Add ellipsis if needed
    if (rangeEnd < total - 1) {
        range.push('...')
    }

    // Always show last page
    if (total > 1) {
        range.push(total)
    }

    return range.filter((page, index, arr) => {
        // Remove duplicates
        return arr.indexOf(page) === index
    })
})

// Methods
const getCountByRole = (role: string) => {
    return members.value.filter(member => member.role === role).length
}

const getRoleBadgeClass = (role: string) => {
    switch (role) {
        case 'owner':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        case 'admin':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        case 'member':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
}

const getRoleIconClass = (role: string) => {
    switch (role) {
        case 'owner':
            return 'text-yellow-600 dark:text-yellow-400'
        case 'admin':
            return 'text-mozart-blue dark:text-mozart-blue-400'
        case 'member':
            return 'text-gray-600 dark:text-gray-400'
        default:
            return 'text-gray-600 dark:text-gray-400'
    }
}

const formatDate = (date: string | Date) => {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const formatLastActive = (dateString: string) => {
    const now = new Date()
    const lastActive = new Date(dateString)
    const diffInMs = now.getTime() - lastActive.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    return formatDate(dateString)
}

const editMember = (member: Member) => {
    editingMember.value = { ...member }
    originalMember.value = { ...member }
    showEditMemberModal.value = true
}

const updateMember = async () => {
    if (!editingMember.value) return

    const preActiveId =
     currentOrg?.value?.id ??
      organizationStore.currentOrganization?.id ??
      (await organizationStore.getActiveOrganization())?.id ?? null

    try {
        error.value = null
        showEditMemberModal.value = false
        await organizationStore.updateMemberRole(editingMember.value.id, editingMember.value.role)

    editingMember.value = null

    // Refresh members list
    await organizationStore.fetchOrganizationMembers(preActiveId)

    eventBus.emit("showToast", { _type: "success", message: `Member's role updated.` })

    } catch (err) {
        error.value = 'Failed to update member'
        console.error(err)
    }
}

// Helper function to navigate to a specific page
const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

const getOrganizations = async () => {
  try {
    if (!organizationStore.organizations.length) {
      try {
        await organizationStore.fetchUserOrganizations()
      } catch {}
    }

    if (!organizationStore.organizations.length) {
      await organizationStore.fetchOrganizations()
    }

    if (!organizationStore.organizations.length) {
      throw new Error('no orgs')
    }

    const active = await organizationStore.getActiveOrganization().catch(() => null)
    const target = active?.id ? active : (organizationStore.organizations[0] || null)
    initialOrg.value = target?.id || ''
    if (!target?.id) return

    if (!active?.id) {
      await organizationStore.setActiveOrganization(target.id).catch(() => {})
    }

    await organizationStore.fetchOrganizationMembers(target.id)
  } catch (err) {
    error.value = 'Failed to load organization members'
    console.error(err)
  }
}

function openUpdateOrg(org: any) {
  if (!org?.id) {
    eventBus.emit('showToast', { _type: 'error', message: 'Please select an organization.' })
    return
  }
  if (!isOwner.value) {
    eventBus.emit('showToast', { _type: 'error', message: 'Only the owner can update the organization.' })
    return
  }
  selectedOrganization.value = org
  showUpdateOrganizationModal.value = true
}

const handleOrganizationUpdated = async (action: string, updatedOrg: any) => {
  if (action !== "confirm") return

  const targetId =
    updatedOrg?.id ||
    (await organizationStore.getActiveOrganization().catch(() => null))?.id ||
    organizationStore.organizations[0]?.id ||
    null

  if (!targetId) return

  await organizationStore.fetchOrganizations().catch(() => {})

  await organizationStore.setActiveOrganization(targetId).catch(() => {})

  await organizationStore.fetchOrganizationMembers(targetId).catch(() => {})
}

async function handleOrganizationCreated(org: any) {
  if (org?.id) {
    await organizationStore.setActiveOrganization(org.id)
    await organizationStore.fetchOrganizationMembers(org.id)
    await organizationStore.fetchOrganizations()
    if (!organizationStore.organizations.find(o => o.id === org.id)) {
      organizationStore.organizations.push(org)
    }
  }
}

function openDeleteOrganization(org: any) {
  organizationToDelete.value = org
  showDeleteOrganizationModal.value = true
}

async function handleOrganizationDeleted(id: string) {
 // Refresh list after deletion
  await organizationStore.fetchOrganizations().catch(() => {})
  
  const fallback = organizationStore.organizations.find(o => o.id !== id) || organizationStore.organizations[0] || null
  const candidate = initialOrg.value || fallback?.id
  if (candidate) {
    try {
      await organizationStore.setActiveOrganization(candidate)
      await organizationStore.fetchOrganizationMembers(candidate)
    } catch {}
  } else {
    organizationStore.currentOrganization = null
  }
}


function parseDescription(metadata: any) {
  if (!metadata) return ""
  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata)
      return parsed.description || ""
    } catch {
      return ""
    }
  }
  if (typeof metadata === "object" && metadata.description) {
    return metadata.description
  }
  return ""
}

function openAddMember() {
  const org = organizationStore.currentOrganization
  if (!org?.id) {
    eventBus.emit('showToast', { _type: 'error', message: 'No active organization' })
    return
  }
  showAddMemberModal.value = true
}

const activeOrgMembers = computed(() =>
  (organizationStore.organizationMembers || []).map((m: any) => (m?.user?.email || '').toLowerCase())
)

async function handleMemberInvited(payload: { action: 'invite'; email: string; role: string }) {
}

function openRemoveMember(member: Member) {
  // self-removal uses leave flow (subject to last-owner guard)
  if (isSelf(member)) {
    leaveCurrentOrg()
    return
  }
  // do not allow removing the last owner
  if (isOwnerMember(member) && ownerCount.value === 1) {
    eventBus.emit('showToast', {
      _type: 'error',
      message: 'You cannot remove the last owner. Transfer ownership or delete the organization first.'
    })
    return
  }
  memberToRemove.value = member
  showRemoveMemberModal.value = true
}


async function handleMemberRemoved() {
  const orgId = organizationStore.currentOrganization?.id
  const sel = memberToRemove.value
  memberToRemove.value = null
  if (!orgId || !sel) return

  // if somehow attempting to remove last owner, block here too (defense-in-depth)
  if (isOwnerMember(sel) && ownerCount.value === 1) {
    eventBus.emit('showToast', {
      _type: 'error',
      message: 'You cannot remove the last owner. Transfer ownership or delete the organization first.'
    })
    return
  }

  try {
    // if the selected member is the current user (shouldn’t reach here, but safe)
    if (isSelf(sel)) {
      await organizationStore.leaveOrganization(orgId)
      eventBus.emit('showToast', { _type: 'success', message: 'You left the organization.' })
      const fallback = organizationStore.organizations[0]
      if (fallback?.id) {
        await organizationStore.setActiveOrganization(fallback.id).catch(() => {})
        await organizationStore.fetchOrganizationMembers(fallback.id).catch(() => {})
      }
      return
    }

    await organizationStore.removeMember(sel.id, orgId)
    await organizationStore.fetchOrganizationMembers(orgId)
    eventBus.emit('showToast', { _type: 'success', message: 'Member removed.' })
  } catch (e) {
    eventBus.emit('showToast', { _type: 'error', message: 'Failed to remove member' })
    console.error(e)
  }
}

const onPick = async (org: OrgOrganization) => {
  isOpen.value = false
  if (!org || org.id === organizationStore.currentOrganization?.id) return
  try {
    await organizationStore.setActiveOrganization(org.id)
    await organizationStore.fetchOrganizationMembers(org.id)
  } catch (e) {
    eventBus.emit('showToast', { _type: 'error', message: 'Failed to activate organization' })
    console.error(e)
  }
}

async function leaveCurrentOrg() {
  const orgId = organizationStore.currentOrganization?.id
  if (!orgId) return

  if (isOwner.value && ownerCount.value === 1) {
    eventBus.emit('showToast', {
      _type: 'error',
      message: 'You are the last owner. Transfer ownership to another member or delete the organization before leaving.'
    })
    return
  }

  try {
    await organizationStore.leaveOrganization(orgId)
    const fallback = organizationStore.organizations[0]
    if (fallback?.id) {
      await organizationStore.setActiveOrganization(fallback.id).catch(() => {})
      await organizationStore.fetchOrganizationMembers(fallback.id).catch(() => {})
    } else {
      await organizationStore.setActiveOrganization(orgId).catch(() => {})
      await organizationStore.fetchOrganizationMembers(orgId).catch(() => {})
    }
    eventBus.emit('showToast', { _type: 'success', message: 'You left the organization.' })
  } catch (e) {
    eventBus.emit('showToast', { _type: 'error', message: 'Failed to leave organization' })
    console.error(e)
  }
}

async function onLeaveConfirm(action: string) {
  if (action !== 'confirm') {
    showLeaveConfirm.value = false
    return
  }
  showLeaveConfirm.value = false
  await leaveCurrentOrg()
}

// Watch for page changes when filtering
watch([searchQuery, selectedRoleFilter], () => {
    currentPage.value = 1
})

// Watch for items per page changes
watch(itemsPerPage, () => {
    // Adjust current page if it exceeds new total pages
    const newTotalPages = Math.ceil(filteredMembers.value.length / itemsPerPage.value)
    if (currentPage.value > newTotalPages) {
        currentPage.value = newTotalPages || 1
    }
})

watch(selectedOrgId, (orgId) => {
  const org = organizationStore.organizations.find((o) => o.id === orgId)
  if (org) {
    let description = ''

    if (typeof org.metadata === 'string') {
      try {
        const parsed = JSON.parse(org.metadata)
        description = parsed.description || ''
      } catch (e) {
        console.warn('Failed to parse org metadata:', org.metadata)
      }
    } else if (typeof org.metadata === 'object' && org.metadata !== null) {
      description = org.metadata.description || ''
    }

    updateOrganizationData.id = org.id
    updateOrganizationData.name = org.name
    updateOrganizationData.description = description
    updateOrganizationData.slug = org.slug
  }
})

watch(
  () => organizationStore.currentOrganization?.id,
  async (id) => {
    if (id) {
      try {
        await organizationStore.fetchOrganizationMembers(id)
      } catch (e) {
        console.error('Failed to load members for active org', e)
      }
    }
  },
  { immediate: true } // load on first mount too
)


watch(view, (val) => {
    emit("viewChange", val)
})

onMounted(async () => {
  getOrganizations()
})

</script>

<style scoped>
    /* Animation for modals */
    .fixed.inset-0 {
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }
    }

    /* Focus styles for accessibility */
    button:focus-visible {
        outline: 2px solid var(--itemColor);
        outline-offset: 2px;
    }

    input:focus-visible,
    select:focus-visible {
        outline: 2px solid var(--itemColor);
        outline-offset: 2px;
    }
</style>
