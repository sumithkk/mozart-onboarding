<template>
    <div class="text-textColor m-2 flex flex-1 flex-col gap-2">
        <!-- Title -->
        <div class="flex items-center gap-1 text-2xl">
            <div class="materialSymbolsOutlined">manage_accounts</div>
            Organizations
        </div>

        <!-- Organizations List -->
        <div class="h-full flex-1">
            <table v-if="hasNonPersonalOrganizations" class="bg-backgroundColor w-full border-collapse font-[Arial,sans-serif] shadow-md">
                <!-- Table Head -->
                <thead class="bg-backgroundColor sticky top-0">
                    <tr class="transition-colors duration-300">
                        <th class="px-4 py-3 text-left font-bold">Select</th>
                        <th class="px-4 py-3 text-left font-bold">Name</th>
                        <th class="px-4 py-3 text-left font-bold">Description</th>
                        <th class="px-4 py-3 text-left font-bold">Category</th>
                        <th class="px-4 py-3 text-left font-bold">Team</th>
                        <th class="px-4 py-3 text-left font-bold"></th>
                    </tr>
                </thead>

                <!-- Table Body -->
                <tbody class="transition-colors duration-300">
                    <tr v-for="organization in nonPersonalOrganizations" :key="organization.organizationId" class="even:bg-backgroundColor hover:bg-sideBarBackgroundColor cursor-pointer transition-colors duration-300">
                        <td class="px-4 py-3">
                            <input type="checkbox" :value="organization.organizationId" :checked="selectedOrganization.organizationId === organization.organizationId" @change="selectOrganization(organization)" />
                        </td>
                        <td class="px-4 py-3" @click="selectOrganization(organization)">
                            {{ getOrganizationName(organization.name) }}
                        </td>
                        <td class="px-4 py-3">
                            {{ organization.description }}
                        </td>
                        <td class="px-4 py-3">
                            {{ organization.personal === true ? "Personal" : "Team" }}
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                                <div v-for="(member, index) in organization.team" :key="index">
                                    <img v-if="member.profilePicture" :src="member.profilePicture" alt="Profile" class="h-10 w-10 rounded-full object-cover" :title="member.username" />
                                    <InitialAvatar v-else :name="member.username || 'User'" size="32" />
                                </div>
                                <div v-if="canAddMember(organization)" class="bg-strokeColor text-textColor flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xl" @click="showAddMemberPopup(organization)">+</div>
                            </div>
                        </td>
                        <td class="materialSymbolsOutlined inline-element cursor-pointer border-none bg-none p-0 px-4 py-3" @click="showUpdateOrganizationPopup(organization)">edit</td>
                    </tr>
                </tbody>
            </table>

            <!-- No Organizations Fallback -->
            <div v-else class="flex h-[10vh] items-center justify-center text-center">Currently, there are no organizations available. Please join an organization to get started.</div>
        </div>

        <!-- Organization Info -->
        <div v-if="selectedOrganization.organizationId" class="box-border flex flex-col items-center justify-center">
            <!-- Profile Image Wrapper -->
            <div class="bg-card relative flex h-[155px] w-[155px] items-center justify-center overflow-hidden rounded-full text-center" @mouseover="isOrganizationPictureBeingHovered = true" @mouseleave="isOrganizationPictureBeingHovered = false">
                <div v-if="selectedOrganization.organizationLogo">
                    <img class="flex h-[150px] w-[150px] justify-center overflow-hidden rounded-full" :src="selectedOrganization.organizationLogo" alt="profile image" />
                </div>
                <div v-else>
                    <InitialAvatar :name="selectedOrganization.title ? selectedOrganization.title : selectedOrganization.organizationName" size="155" />
                </div>

                <!-- Change Profile Overlay -->
                <div v-if="isOrganizationPictureBeingHovered" class="text-textColor absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] select-none" @click="triggerChangeProfileInput">
                    <a>Change Profile Picture</a>
                    <input type="file" ref="fileInput" @change="handleProfileChange" style="display: none" />
                </div>
            </div>

            <!-- Organization Info Form -->
            <div class="mt-4 flex w-full max-w-lg flex-row flex-wrap gap-4">
                <div class="flex w-full items-center">
                    <input class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded border-2 p-2.5" type="text" :disabled="!canAddMember(selectedOrganization)" placeholder="Organization Name" v-model="selectedOrganization.name" />
                </div>
                <div class="flex w-full items-center">
                    <input class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded border-2 p-2.5" type="text" :disabled="!canAddMember(selectedOrganization)" placeholder="Organization Description" v-model="selectedOrganization.description" />
                </div>
            </div>

            <!-- Team Container -->
            <div class="mt-4 h-[300px] max-h-[300px] w-full max-w-lg overflow-scroll">
                <table class="bg-backgroundColor w-full border-collapse font-[Arial,sans-serif] shadow-md">
                    <thead class="bg-backgroundColor sticky top-0">
                        <tr class="transition-colors duration-300">
                            <th class="px-4 py-2 text-left font-bold">Profile Picture</th>
                            <th class="px-4 py-2 text-left font-bold">Name</th>
                            <th class="px-4 py-2 text-left font-bold">Email</th>
                            <th class="px-4 py-2 text-left font-bold">Role</th>
                        </tr>
                    </thead>
                    <tbody class="transition-colors duration-300">
                        <tr v-for="user in selectedOrganization.team" :key="user.userId" class="even:bg-backgroundColor hover:bg-sideBarBackgroundColor cursor-pointer transition-colors duration-300">
                            <td class="px-4 py-2">
                                <img v-if="user.profilePicture" :src="user.profilePicture" alt="Profile" class="h-10 w-10 rounded-full object-cover" />
                                <InitialAvatar v-else :name="user.username || 'User'" size="32" />
                            </td>
                            <td class="px-4 py-2">{{ user.name || user.username }}</td>
                            <td class="px-4 py-2">{{ user.email }}</td>
                            <td class="px-4 py-2">{{ user.role }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Add Member Popup -->
        <AddMemberToOrganization v-if="canShowAddMemberPopup" :show="canShowAddMemberPopup" :organization="selectedOrganization" @update:show="canShowAddMemberPopup = false" />

        <!-- Update Organization Popup -->
        <UpdateOrganization v-if="canShowUpdateOrganizationPopup" :show="canShowUpdateOrganizationPopup" :selectedOrganization="selectedOrganization" @update:show="closeOrganizationPopup" @buttonClick="handleButtonClick" />
    </div>
</template>

<script setup lang="ts">
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    const organizationStore = useOrganizationStore()
    const userStore = useUserStore()
    const user = useUser()
    const organizationsList = ref<IOrganization[]>([])
    const selectedOrganization = ref<any>({})
    const canShowAddMemberPopup = ref(false)
    const isOrganizationPictureBeingHovered = ref(false)
    const canShowUpdateOrganizationPopup = ref(false)

    async function fetchOrganizations() {
        try {
            organizationsList.value = organizationStore.organizations
        } catch (error) {
            console.error("Failed to fetch users:", error)
        }
    }

    const selectOrganization = (organization: any) => {
        if (selectedOrganization.value.organizationId === organization.organizationId) {
            selectedOrganization.value = {}
        } else {
            selectedOrganization.value = organization
        }
    }

    const showAddMemberPopup = (organization: any) => {
        canShowAddMemberPopup.value = true
        selectedOrganization.value = organization
    }

    const canAddMember = (organization: any) => {
        if (organization.personal) return false
        if (organization.ownerId === userStore.userId) return true
        return false
    }

    const getOrganizationName = (name: string) => {
        if (name.startsWith("org_")) {
            return `${userStore.username}'s Organization`
        } else return name
    }

    const handleProfileChange = async (event: any) => {
        // Implementation omitted for brevity
    }

    const triggerChangeProfileInput = () => {
        // Implementation omitted for brevity
    }

    const nonPersonalOrganizations = computed(() => {
        return organizationsList.value.filter((organization) => organization.personal === false)
    })

    const hasNonPersonalOrganizations = computed(() => nonPersonalOrganizations.value.length > 0)

    function showUpdateOrganizationPopup(organization: any) {
        selectedOrganization.value = organization
        canShowUpdateOrganizationPopup.value = true
    }
    const closeOrganizationPopup = () => {
        canShowUpdateOrganizationPopup.value = false
        selectedOrganization.value = {}
    }

    async function handleButtonClick(button: string, organization: any) {
        canShowUpdateOrganizationPopup.value = false
        await user.updateOrganization(organization.organizationId, organization.name, organization.description, organization.organizationLogo)
    }

    onMounted(fetchOrganizations)
</script>
