<template>
    <Loading v-if="isLoading" />

    <!-- If organizationId exists, show organization info -->
    <div v-if="organizationId" class="box-border flex h-full w-full flex-col items-center justify-center gap-[10px]">
        <!-- Profile image wrapper -->
        <div class="relative mb-4 flex items-center justify-center" @mouseover="isOrganizationPictureBeingHovered = true" @mouseleave="isOrganizationPictureBeingHovered = false">
            <div class="bg-card relative flex h-[155px] w-[155px] items-center justify-center overflow-hidden rounded-full text-center">
                <img v-if="organizationLogo" :src="organizationLogo" alt="profile image" class="flex h-[150px] w-[150px] justify-center overflow-hidden rounded-full" />
                <InitialAvatar v-else :name="organizationName ? organizationName : userName" size="155" />

                <!-- Hover overlay to change profile -->
                <div v-if="isOrganizationPictureBeingHovered" @click="triggerChangeProfileInput" class="bg-background/50 text-textColor absolute inset-0 flex cursor-pointer items-center justify-center select-none">
                    <a>Change Profile Picture</a>
                    <input type="file" ref="fileInput" @change="handleProfileChange" class="hidden" />
                </div>
            </div>
        </div>

        <!-- Grid with Name/Description/AddMember fields -->
        <div class="grid w-full max-w-[800px] grid-cols-2 gap-5">
            <div class="flex items-center">
                <SimpleInput type="text" label="Name" :defaultValue="organizationName" v-model="organizationName" />
            </div>

            <div class="flex items-center">
                <SimpleInput type="text" label="Description" :defaultValue="organizationDescription" v-model="organizationDescription" />
            </div>

            <div class="flex items-center" v-if="isOwner">
                <SimpleInput type="text" label="Add member" :defaultValue="addMemberEmail" v-model="addMemberEmail" />
            </div>

            <div class="flex items-center" v-if="isOwner">
                <div class="button small" @click="addMember">Add</div>
            </div>
        </div>

        <!-- Team container (table) -->
        <div class="mt-6 w-full max-w-[800px] overflow-x-auto">
            <table class="bg-backgroundColor w-full border-collapse [font-family:'Arial',sans-serif] shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
                <thead class="bg-backgroundColor sticky top-0">
                    <tr class="[transition:background-color_0.3s]">
                        <th class="px-[15px] py-[12px] text-left font-bold">Profile Picture</th>
                        <th class="px-[15px] py-[12px] text-left font-bold">Name</th>
                        <th class="px-[15px] py-[12px] text-left font-bold">Email</th>
                        <th class="px-[15px] py-[12px] text-left font-bold">Role</th>
                    </tr>
                </thead>
                <tbody class="[transition:background-color_0.3s]">
                    <tr v-for="user in organizationTeam" :key="user.userId" class="hover:bg-sideBarBackgroundColor [&:nth-child(even)]:bg-backgroundColor cursor-pointer [transition:background-color_0.3s]">
                        <td class="px-[15px] py-[12px] text-left">
                            <img :src="user.profilePicture" alt="Profile" class="h-10 w-10 rounded-full object-cover" />
                        </td>
                        <td class="px-[15px] py-[12px] text-left">
                            {{ user.name || user.username }}
                        </td>
                        <td class="px-[15px] py-[12px] text-left">
                            {{ user.email }}
                        </td>
                        <td class="px-[15px] py-[12px] text-left">
                            {{ user.role }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Action Buttons -->
        <div v-if="isOwner" class="mt-6 flex w-full max-w-[800px] justify-between">
            <Button buttonText="Save" @clicked="handleSaveButtonClick" />
        </div>
    </div>

    <!-- If no organizationId, show subscription prompt -->
    <div v-else class="text-textColor flex h-full w-full flex-col items-center justify-center gap-5">
        <div>Please subscribe to Enterprise plan to use this feature</div>
        <div class="flex items-center">
            <div class="button small">Subscribe to Enterprise</div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed } from "vue"

    const userStore = useUserStore()
    const organizationStore = useOrganizationStore()
    const user = useUser()

    // Get initial organization data
    const organizationData = organizationStore.getTeamOrganization()
    const organizationName = ref(organizationData.title)
    const organizationDescription = ref(organizationData.description)
    const organizationLogo = ref(organizationData.organizationLogo)
    const organizationId = ref(organizationData.organizationId)
    const organizationTeam = ref<any>(organizationData.team)

    const isOwner = ref(false)
    const userName = ref(userStore.firstName)
    const fileInput = ref<HTMLElement>()
    const addMemberEmail = ref("")
    const isOrganizationPictureBeingHovered = ref(false)
    const isLoading = ref(false)

    const { updateOrganization, inviteMember } = useOrganizationStore()

    // Save organization changes
    const handleSaveButtonClick = async () => {
        await updateOrganization(organizationId.value, {
            name: organizationName.value,
            logo: organizationLogo.value,
            metadata: { description: organizationDescription.value }
        })
    }

    // Trigger file input for profile
    const triggerChangeProfileInput = () => {
        if (!fileInput.value) return
        fileInput.value.click()
    }

    // Handle profile picture change
    const handleProfileChange = async (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (!file) return
        const uploadData = await useUser().uploadOrganizationAvatar(file)
        console.log(uploadData)
        organizationLogo.value = uploadData.profilePicture
    }

    // Fetch organization data
    const handleOrganizationData = async () => {
        isLoading.value = true
        const currentOrganizationInfo = await user.getUserOrganizationInfo()

        organizationName.value = currentOrganizationInfo.name || ""
        organizationDescription.value = currentOrganizationInfo.description || ""
        organizationLogo.value = currentOrganizationInfo.organizationLogo || ""
        organizationId.value = currentOrganizationInfo.organizationId || ""
        organizationTeam.value = currentOrganizationInfo.team || {}

        if (currentOrganizationInfo.ownerId && currentOrganizationInfo.ownerId === userStore.userId) {
            isOwner.value = true
        }
        isLoading.value = false
    }

    // Add a member to the organization
    const addMember = async () => {
        await inviteMember(addMemberEmail.value, "member", organizationId.value)
        await handleOrganizationData()
    }

    // On mount, fetch data if user has an organizationId
    onMounted(async () => {
        if (organizationStore.organizations.length > 0) {
            await handleOrganizationData()
        }
    })
</script>
