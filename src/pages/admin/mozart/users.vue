<template>
    <div class="container mx-auto h-full px-4 py-6">
        <div class="text-foreground text-foreground mb-4 flex items-center gap-2 text-2xl font-semibold">
            <span class="materialSymbolsOutlined">manage_accounts</span>
            <span>Users</span>
        </div>

        <div class="users-list-container bg-card bg-card shadow-md">
            <div class="max-h-[45rem] overflow-x-auto">
                <!-- Added max height and x-overflow -->
                <table class="user-table border-border min-w-full table-fixed border">
                    <thead>
                        <tr class="header-row bg-background bg-input sticky top-0 z-10 text-left">
                            <th class="text-muted-foreground text-muted-foreground px-6 py-3 text-sm font-semibold">Select</th>
                            <th class="text-muted-foreground text-muted-foreground px-6 py-3 text-sm font-semibold">Profile Picture</th>
                            <th class="text-muted-foreground text-muted-foreground px-6 py-3 text-sm font-semibold">Name</th>
                            <th class="text-muted-foreground text-muted-foreground px-6 py-3 text-sm font-semibold">Email</th>
                            <th class="text-muted-foreground text-muted-foreground px-6 py-3 text-sm font-semibold">Plan</th>
                            <th class="text-muted-foreground text-muted-foreground px-6 py-3 text-sm font-semibold">Role</th>
                        </tr>
                    </thead>
                    <tbody class="bg-card divide-border bg-card divide-y divide-neutral-200">
                        <tr class="body-row hover:bg-secondary hover:bg-secondary" v-for="user in usersList" :key="user.userId">
                            <td class="px-6 py-4">
                                <input type="checkbox" :value="user.userId" :checked="!!(selectedUser && selectedUser.userId === user.userId)" @change="showAddMemberPopup(user)" class="text-primary focus:ring-primary bg-background block h-4 w-4 rounded focus:ring" />
                            </td>
                            <td class="px-6 py-4">
                                <img v-if="user.profilePicture" :src="user.profilePicture" alt="Profile" class="h-10 w-10 rounded-full object-cover" />
                                <InitialAvatar v-else :name="user.firstName" size="40" />
                            </td>
                            <td class="text-foreground text-foreground px-6 py-4 text-sm">
                                {{ user.firstName }}
                            </td>
                            <td class="text-foreground text-foreground px-6 py-4 text-sm">
                                {{ user.email }}
                            </td>
                            <td class="text-foreground text-foreground px-6 py-4 text-sm">
                                {{ user.currentPlan }}
                            </td>
                            <td class="text-foreground text-foreground px-6 py-4 text-sm">
                                {{ user.role }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <ComponentLoading v-if="isLoading && usersList.length === 0" />
        </div>
        <UsersInfoTW v-if="canShowAddMemberPopup" :show="canShowAddMemberPopup" :selectedUser="selectedUser" :collections="collections" @update:show="closeUserPopup" :close="closeUserPopup" />
    </div>
</template>

<script setup lang="ts">
    import useAdmin from "~/composables/useAdmin"

    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    const admin = useAdmin()
    const usersList = ref<IUser[]>([])
    const selectedUser = ref<IUser | null>(null)
    const collections = ref<ICollection[]>([])
    const isLoading = ref(false)
    const canShowAddMemberPopup = ref(false)

    async function fetchUsers() {
        try {
            const userData = await admin.getUsersList()
            if (!userData) return

            // Add userId to each user object
            for (const user of userData) {
                user.userId = user.id
            }

            usersList.value = userData
        } catch (error) {
            console.error("Failed to fetch users:", error)
        }
    }

    function showAddMemberPopup(user: any) {
        selectedUser.value = user
        console.error(selectedUser.value)
        canShowAddMemberPopup.value = true
    }

    const closeUserPopup = () => {
        canShowAddMemberPopup.value = false
        selectedUser.value = null
    }

    onMounted(async () => {
        isLoading.value = true
        await fetchUsers()
        const data = await useRag().getAllCollections()
        if (!data) return
        collections.value = Object.values(data).filter((collection: any) => collection.service === "cloud")
        isLoading.value = false
    })
</script>
