<template>
    <!-- Unified Responsive Header -->
    <div class="h-header text-headerTextColor sm:bg-surfaceColor flex w-full items-center justify-between py-2" :class="{ 'border-b-2 border-neutral-300 dark:border-neutral-300': conversationStore.conversationId, 'bg-card fixed top-0 left-0 z-20 w-full': isMobile }">
        <!-- Left Side -->
        <div class="flex items-center px-2 sm:px-4">
            <button v-if="!sidebarOpen" @click="emit('toggleSidebar')" type="button" class="pt-1 text-xl focus:outline-none" aria-label="Toggle Sidebar">
                <VTooltip placement="right">
                    <div class="materialSymbolsOutlined flex items-center justify-center rounded-md p-2 transition duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-800" style="font-size: 1.5rem; cursor: pointer; color: var(--textColor)">
                        {{ sidebarOpen ? "first_page" : "last_page" }}
                    </div>
                    <template #popper>{{ sidebarOpen ? "Close Sidebar" : "Open Sidebar" }}</template>
                </VTooltip>
            </button>

            <!-- Logo - Visible on mobile and when sidebar is closed on desktop -->
            <div class="flex items-center px-2 sm:px-4" :class="{ 'sm:hidden': sidebarOpen }">
                <div class="text-logoColor cursor-pointer text-2xl font-medium sm:text-4xl">Mozart</div>
            </div>
        </div>

        <!-- Right Side -->
        <div class="flex items-center px-2 sm:px-4">
            <div class="flex items-center gap-2 text-base font-normal">
                <!-- Share Button -->
                                <div class="flex w-full justify-end" v-if="conversationStore.conversationId && conversationStore.conversations[conversationStore.conversationId]?.title">
                    <VTooltip placement="top" :distance="8">
                        <div @click="shareConversation" class="bg-logoColor flex cursor-pointer items-center gap-1 rounded-full border border-white/30 px-2 py-1 text-sm text-white transition-colors hover:bg-mozart-blue sm:text-base" aria-label="Share message">
                            <!-- Share Icon -->
                            <span class="materialSymbolsOutlined text-sm sm:text-base">ios_share</span>
                        </div>
                        <template #popper>Share message</template>
                    </VTooltip>
                </div>

                <!-- Loading Indicator -->
                <div v-if="userStore.isLoading" class="animate-shimmer bg-shimmer bg-200 text-textColor bg-input flex cursor-pointer items-center gap-1 overflow-hidden rounded-[15px] px-2 py-1 text-xs">
                    <div class="animate-shimmer bg-shimmer bg-200 bg-secondary h-5 w-5 rounded-full"></div>
                    <div class="animate-shimmer bg-shimmer bg-200 bg-secondary h-4 w-[30px] rounded"></div>
                </div>

                <!-- User Dropdown - Consistent across all screen sizes -->
                <Menu v-if="!userStore.isLoading" class="relative z-20" as="div">
                    <MenuButton class="text-textColor flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium" v-slot="{ open }" :class="{ 'bg-neutral-300': !userStore.isAdmin, 'bg-red2 text-foreground': userStore.isAdmin }">
                        <img v-if="userStore.profilePicture" class="h-5 min-h-[20px] w-5 min-w-[20px] rounded-full border border-white" :src="userStore.profilePicture" alt="User Avatar" />
                        <InitialAvatar v-else :name="userStore.firstName" size="22" />
                        <span class="userName max-w-12 overflow-hidden text-ellipsis whitespace-nowrap text-white" :class="{ 'text-white': userStore.isAdmin }">
                            {{ userStore.firstName }}
                        </span>
                    </MenuButton>
                    <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                        <MenuItems class="bg-card ring-opacity-5 scrollbar-thin scrollbar-track-border scrollbar-thumb-border bg-card ring-border absolute top-8 right-0 z-10 mt-1 w-fit min-w-max overflow-hidden overflow-y-auto rounded-md p-2 shadow-lg ring-1 focus:outline-none">
                            <MenuItem v-for="option in userSettingsDropdownOptions[0]" :key="option.label" @click="handleDropdownMenuItemClicked(option)" class="m-0 rounded-md" v-slot="{ active }">
                                <div class="flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-left text-sm" :class="active ? 'bg-background bg-input' : ''">
                                    <div class="materialSymbolsOutlined text-textColor text-xl">{{ option.icon }}</div>
                                    <div class="flex flex-col">
                                        <span class="text-textColor">{{ option.label }}</span>
                                        <span v-if="option.label === 'Toggle theme'" class="text-textColorSecondary text-xs capitalize">({{ colorMode.preference }})</span>
                                    </div>
                                </div>
                            </MenuItem>
                            <div class="bg-borderColor mx-1 my-2 h-px"></div>
                            <MenuItem v-for="option in userSettingsDropdownOptions[1]" :key="option.label" @click="handleDropdownMenuItemClicked(option)" class="m-0 rounded-md" v-slot="{ active }">
                                <div class="flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-left text-sm" :class="active ? 'bg-background bg-input' : ''">
                                    <div class="materialSymbolsOutlined text-textColor text-xl">{{ option.icon }}</div>
                                    <span class="text-textColor">{{ option.label }}</span>
                                </div>
                            </MenuItem>
                        </MenuItems>
                    </transition>
                </Menu>
            </div>
        </div>
    </div>

    <!-- Settings Popup -->
    <SettingsPopup :show="userSettingsPopupState" @close-settings-popup="handleUserSettingsStateChange(false)" />

    <!-- My Plan Popup 
    <MyPlan v-if="showMyPlansPopup || userStore.showPlanPopup" @close="onShowMyPlansClose()" @plan-selection="(data: any) => planSelectCallback(data)" :isTrialPossible="false" /> -->
</template>

<script setup lang="ts">
    import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue"
    import { signOut } from "@/services/better-auth/auth-client"
    import eventBus from "@/util/eventBus"
    declare const useColorMode: any

    /* -------------------------------------------------
| Props
--------------------------------------------------*/
    const props = defineProps<{
        isMobile: boolean | undefined
        sidebarOpen: boolean
    }>()

    /* -------------------------------------------------
| Emits
--------------------------------------------------*/
    const emit = defineEmits(["toggleSidebar"])
    /* -------------------------------------------------
| Imports, Stores, and Refs
--------------------------------------------------*/
    const router = useRouter()
    const userStore = useUserStore()
    const organizationStore = useOrganizationStore()
    const payments = usePayments()
    const user = useUser()
    const conversationStore = useConversationStore()

    const role = ref(userStore.role)
    const userSettingsPopupState = ref<boolean>(false)
    const showMyPlansPopup = ref<boolean>(false)
    const myPlansClosable = ref<boolean>(true)
    const colorMode = useColorMode()

    /* -------------------------------------------------
| Watchers
--------------------------------------------------*/
    watchEffect(() => {
        role.value = userStore.role
    })
    watchEffect(() => {
        if (process.client) {
            document.documentElement.setAttribute("data-theme", colorMode.value)
        }
    })
    /* -------------------------------------------------
| Dropdown options
--------------------------------------------------*/
    const userSettingsDropdownOptions = [
        [
            {
                label: "My plan",
                icon: "award_star",
            },
            {
                label: "Settings",
                icon: "settings",
            },
            {
                label: "Toggle theme",
                icon: "dark_mode",
                sublabel: "",
            },
        ],
        [
            {
                label: "Log out",
                icon: "logout",
            },
        ],
    ]

    /* -------------------------------------------------
| Methods
--------------------------------------------------*/
    const shareConversation = async () => {
        conversationStore.sharedConversationId = conversationStore.conversationId
        conversationStore.triggerShareConversation = !conversationStore.triggerShareConversation
        useConversation().getCollaborators(conversationStore.sharedConversationId || conversationStore.conversationId)
    }

    async function planSelectCallback(data: any) {
        console.log(data)
        const response = await payments.renew(data.selectedPlan, data.numberOfSeats, data.teamName)
        window.location.href = response.data.redirectUrl
    }

    function onShowMyPlansClose() {
        if (!myPlansClosable.value) return
        showMyPlansPopup.value = false
        userStore.showPlanPopup = false
    }

    function toggleTheme() {
        // Cycle through: light -> dark -> system -> light
        if (colorMode.preference === "light") {
            colorMode.preference = "dark"
        } else if (colorMode.preference === "dark") {
            colorMode.preference = "system"
        } else {
            colorMode.preference = "light"
        }
    }

    async function handleDropdownMenuItemClicked(item: any) {
        const action = item.label.toLowerCase()
        if (action == "settings") {
            // navigate to profile setting page
            goTo("/profile/info")
        } else if (action == "my plan") {
            goTo("/profile/plan")
        } else if (action == "log out") {
            const response = await signOut()
            if (response.data?.success) {
                eventBus.emit("showToast", {
                    message: "Logout successful",
                    _type: "success",
                })
                router.push("/auth/login")
            } else {
                eventBus.emit("showToast", {
                    message: response.error?.message || "Logout failed",
                    _type: "error",
                })
            }
        } else if (action == "toggle theme") {
            toggleTheme()
        }
    }

    function handleUserSettingsStateChange(state: boolean) {
        userSettingsPopupState.value = state
    }

    function goTo(where: string) {
        router.push(where)
    }

    function isActive(route: string) {
        return router.currentRoute.value.path.startsWith(route)
    }
    /* -------------------------------------------------
| Lifecycle
--------------------------------------------------*/
</script>

<style scoped></style>
