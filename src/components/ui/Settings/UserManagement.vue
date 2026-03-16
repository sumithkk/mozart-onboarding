<template>
    <div class="container mx-auto h-full px-6 py-8">
        <!-- Header Section -->
        <div class="mb-8">
            <div class="mb-2 flex items-center gap-3">
                <div class="rounded-lg p-2">
                    <span class="material-icons text-logoColor text-2xl">people</span>
                </div>
                <h1 class="text-textColor text-3xl font-bold">User Management</h1>
            </div>
            <p class="text-textColoSecondary text-base">Manage user access, roles, permissions, and AI models across your organization</p>
        </div>

        <!-- User Search Filter -->
        <UserSearchFilter :filteredUsers="filteredUsers" :usersList="usersList" :isLoading="isLoading" @search="handleSearch" @filterPlan="handlePlanFilter" @filterRole="handleRoleFilter" @clearFilters="handleClearFilters" />

        <!-- Users Table Container -->
        <div class="bg-sideBarBackgroundColor overflow-hidden rounded-xl border border-[#383838] shadow-lg transition-all duration-200">
            <!-- Table Wrapper -->
            <div class="scrollbar scrollbar-track-gray-100 scrollbar-thumb-gray-400 max-h-[48rem] overflow-x-auto">
                <table class="min-w-full table-fixed">
                    <!-- Table Header -->
                    <thead class="bg-surfaceColor sticky top-0 z-10">
                        <tr class="border-strokeColor border-b-2">
                            <th class="w-16 px-6 py-4 text-left">
                                <span class="text-textColorSecondary text-sm font-semibold">Select</span>
                            </th>
                            <th class="w-20 px-6 py-4 text-left">
                                <span class="text-textColorSecondary text-sm font-semibold">Avatar</span>
                            </th>
                            <th class="w-48 px-6 py-4 text-left">
                                <span class="text-textColorSecondary text-sm font-semibold">Name</span>
                            </th>
                            <th class="w-64 px-6 py-4 text-left">
                                <span class="text-textColorSecondary text-sm font-semibold">Email</span>
                            </th>
                            <th class="w-32 px-6 py-4 text-left">
                                <span class="text-textColorSecondary text-sm font-semibold">Plan</span>
                            </th>
                            <th class="w-32 px-6 py-4 text-left">
                                <span class="text-textColorSecondary text-sm font-semibold">Role</span>
                            </th>
                            <th v-if="userStore.isAdmin" class="w-40 px-6 py-4 text-left">
                                <span class="text-textColorSecondary text-sm font-semibold">Actions</span>
                            </th>
                        </tr>
                    </thead>

                    <!-- Table Body -->
                    <tbody class="divide-border divide-y">
                        <tr v-for="user in filteredUsers" :key="user.userId" class="group bg-sideBarBackgroundColor cursor-pointer transition-all duration-200 hover:shadow-sm" @mouseover="handleMouseOver" @mouseleave="handleMouseLeave">
                            <!-- Checkbox Column -->
                            <td class="px-6 py-5">
                                <div class="flex items-center">
                                    <input type="checkbox" :value="user.userId" :checked="!!(selectedUser && selectedUser.userId === user.userId)" @change="showAddMemberPopup(user)" class="select-check dark:border-sideBarBackgroundColor accent-logoColor h-[1rem] w-[1rem] rounded-[2px] border-[1px] border-gray-600 bg-white transition-all duration-200 focus:outline-none" />
                                </div>
                            </td>

                            <!-- Avatar Column -->
                            <td class="px-6 py-5">
                                <div class="flex items-center">
                                    <div class="relative">
                                        <img v-if="user.profilePicture" :src="user.profilePicture" alt="Profile" class="group-hover:ring-opacity-40 ring-ringColor h-11 w-11 rounded-full object-cover ring-2 transition-all duration-200" />
                                        <InitialAvatar v-else :name="user.firstName" size="44" class="group-hover:ring-opacity-40 ring-ringColor ring-2 transition-all duration-200" />
                                        <div class="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-600"></div>
                                    </div>
                                </div>
                            </td>

                            <!-- Name Column -->
                            <td class="px-6 py-5">
                                <div class="flex flex-col">
                                    <span class="text-textColor text-base font-semibold transition-colors duration-200">
                                        {{ user.firstName }}
                                    </span>
                                </div>
                            </td>

                            <!-- Email Column -->
                            <td class="px-6 py-5">
                                <span class="text-textSecondaryColor font-mono text-sm transition-colors duration-200">
                                    {{ user.email }}
                                </span>
                            </td>

                            <!-- Plan Column -->
                            <td class="px-6 py-5">
                                <span class="bg-surfaceColor text-textColor border-strokeColor inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200">
                                    {{ user.billing?.planName ?? "No Plan" }}
                                </span>
                            </td>

                            <!-- Role Column -->
                            <td class="px-6 py-5">
                                <span class="bg-surfaceColor text-textColor border-strokeColor inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200">
                                    {{ user.role }}
                                </span>
                            </td>

                            <!-- Actions Column (Impersonate) -->
                            <td v-if="userStore.isAdmin" class="px-6 py-5">
                                <button @click="handleImpersonate(user)" :disabled="isCurrentUser(user) || impersonating" class="bg-logoColor hover:bg-logoColor/90 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-600">
                                    <span v-if="impersonating && impersonatingUserId === user.userId" class="flex items-center gap-2">
                                        <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Impersonating...
                                    </span>
                                    <span v-else-if="isCurrentUser(user)">Current User</span>
                                    <span v-else>Impersonate</span>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading && usersList.length === 0" class="flex items-center justify-center py-12">
                <ComponentLoading />
            </div>

            <!-- Empty State -->
            <div v-if="!isLoading && filteredUsers.length === 0" class="flex flex-col items-center justify-center py-16">
                <div class="mb-4 rounded-full p-4">
                    <span class="material-icons text-4xl">people_outline</span>
                </div>
                <h3 class="mb-2 text-lg font-medium">No users found</h3>
                <p class="text-sm">Users will appear here once they're added to the system.</p>
            </div>
        </div>

        <!-- User Info Popup -->
        <UsersInfoTW v-if="canShowAddMemberPopup" :show="canShowAddMemberPopup" :selectedUser="selectedUser" :collections="collections" @update:show="closeUserPopup" :close="closeUserPopup" :handle-fetch="fetchUsers" />

        <!-- Model Management Popup -->
        <UserModelManagement v-if="showModelManagementPopup" :show="showModelManagementPopup" :selectedUser="selectedUser" :availableModels="availableModels" :userModels="userModels" @update:show="closeModelManagement" @models-updated="handleModelsUpdated" />
    </div>
</template>

<script setup lang="ts">
    import useAdmin from "~/composables/useAdmin"
    import userService from "~/services/userService"
    import { adminService } from "~/services/better-auth/admin"

    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    const admin = useAdmin()
    const config = useRuntimeConfig()
    const userServiceInstance = userService(config)
    const router = useRouter()
    const userStore = useUserStore()
    const usersList = ref<IUser[]>([])
    const selectedUser = ref<IUser | null>(null)
    const collections = ref<ICollection[]>([])
    const isLoading = ref(false)
    const canShowAddMemberPopup = ref(false)
    const filteredUsers = ref<IUser[]>([])

    // Model management state
    const showModelManagementPopup = ref(false)
    const availableModels = ref<any[]>([])
    const userModels = ref<string[]>([])
    const userModelCache = ref<Map<string, string[]>>(new Map())

    // Impersonation state
    const impersonating = ref(false)
    const impersonatingUserId = ref<string | null>(null)

    // Mouse event handlers to fix TypeScript errors
    function handleMouseOver(event: Event) {
        const target = event.currentTarget as HTMLElement
        if (target) {
            target.style.backgroundColor = "var(--surfaceColor)"
        }
    }

    function handleMouseLeave(event: Event) {
        const target = event.currentTarget as HTMLElement
        if (target) {
            target.style.backgroundColor = "var(--sideBarBackgroundColor)"
        }
    }

    async function fetchUsers() {
        try {
            const userData = await adminService.listUsers()
            if (!userData || !userData.total || !userData.users) return
            filteredUsers.value = userData.users
            usersList.value = userData.users
        } catch (error) {
            console.error("Failed to fetch users:", error)
        }
    }

    async function fetchAvailableModels() {
        try {
            const models = await admin.getAllModels()
            if (models && models.data) {
                availableModels.value = models.data
            }
        } catch (error) {
            console.error("Failed to fetch available models:", error)
        }
    }

    function showAddMemberPopup(user: any) {
        selectedUser.value = user
        canShowAddMemberPopup.value = true
    }

    const closeUserPopup = () => {
        canShowAddMemberPopup.value = false
        selectedUser.value = null
    }

    const closeModelManagement = () => {
        showModelManagementPopup.value = false
        selectedUser.value = null
        userModels.value = []
    }

    const handleModelsUpdated = async (updatedModels: string[]) => {
        if (selectedUser.value) {
            userModelCache.value.set(selectedUser.value.userId, updatedModels)
        }
    }

    const handleSearch = (query: string) => {
        const lowerQuery = query?.toLowerCase() || ""

        filteredUsers.value = usersList.value.filter((user) => (user.email && user.email.toLowerCase().includes(lowerQuery)) || (user.firstName && user.firstName.toLowerCase().includes(lowerQuery)) || (user.lastName && user.lastName.toLowerCase().includes(lowerQuery)))
    }

    const handlePlanFilter = (plan: string | null) => {
        const lowerQuery = plan?.toLowerCase() || ""
        filteredUsers.value = usersList.value.filter((user) => user.currentPlan && user.currentPlan.toLowerCase().includes(lowerQuery))
    }

    const handleRoleFilter = (role: string | null) => {
        const lowerQuery = role?.toLowerCase() || ""
        filteredUsers.value = usersList.value.filter((user) => user.role && user.role.toLowerCase().includes(lowerQuery))
    }

    const handleClearFilters = () => {
        // not required now
    }

    function isCurrentUser(user: IUser): boolean {
        return user.id === userStore.id
    }

    async function handleImpersonate(user: IUser) {
        if (isCurrentUser(user) || impersonating.value) return

        try {
            impersonating.value = true
            impersonatingUserId.value = user.id

            await adminService.impersonateUser({ userId: user.id })

            // Refresh user data to reflect impersonation
            await userStore.hydrateFromBetterAuth()

            showToast(`Successfully impersonating ${user.firstName} ${user.lastName}`, "success")

            // Navigate to workbench without reloading the page
            await router.push("/workbench/files")
            window.location.reload()

            // Reset impersonation state after successful navigation
            impersonating.value = false
            impersonatingUserId.value = null
        } catch (error: any) {
            console.error("Failed to impersonate user:", error)
            showToast(error.message || "Failed to impersonate user", "error")
            // Reset state on error
            impersonating.value = false
            impersonatingUserId.value = null
        }
    }

    function showToast(message: string, type: "success" | "error") {
        // Placeholder for toast notification
        if (type === "error") {
            console.error(message)
        } else {
            console.log(message)
        }
    }

    onMounted(async () => {
        isLoading.value = true
        await Promise.all([fetchUsers(), fetchAvailableModels()])
        const data = await useRag().getAllCollections()
        if (!data) return
        collections.value = Object.values(data).filter((collection: any) => collection.service === "cloud") as ICollection[]
        isLoading.value = false
    })
</script>

<style>
    /* Scrollbar Track Color */
    .scrollbar-track-gray-100 {
        --scrollbar-track: #f3f4f6 !important; /* Tailwind gray-100 */
    }

    /* Scrollbar Thumb Color */
    .scrollbar-thumb-gray-400 {
        --scrollbar-thumb: #9ca3af !important; /* Tailwind gray-400 */
    }

    /* Base Scrollbar Styles */
    .scrollbar {
        scrollbar-width: auto; /* Firefox support */
        scrollbar-color: var(--scrollbar-thumb, initial) var(--scrollbar-track, initial); /* Firefox */
    }
    .select-check {
        appearance: none;
    }
    .select-check:checked {
        appearance: checkbox;
        border: none !important;
    }
</style>
