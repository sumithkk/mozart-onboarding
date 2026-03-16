<template>
    <div class="items-[unset] mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <!-- Search Input -->
        <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon class="h-5 w-5" :style="{ color: isDisabled ? 'var(--unselectedColor)' : 'var(--textColorSecondary)' }" />
            </div>
            <input
                v-model="searchQuery"
                @input="handleSearch($event.target.value)"
                type="text"
                :disabled="isDisabled"
                placeholder="Search by name or email..."
                class="focus:ring-opacity-50 focus:ring-logoColor border-strokeColor bg-surfaceColor text-textColor block w-full rounded-lg border py-2.5 pr-10 pl-10 text-sm transition-all duration-200 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-80"
            />
            <button v-if="searchQuery" @click="handleSearch('')" :disabled="isDisabled" class="text-textColorSecondary absolute inset-y-0 right-0 flex items-center pr-3 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50">
                <XMarkIcon class="h-4 w-4" />
            </button>
        </div>

        <div class="flex flex-1 items-center justify-between gap-4">
            <div class="flex items-center space-x-3">
                <!-- Filter by Plan -->
                <Menu as="div" class="relative">
                    <MenuButton v-slot="{ open }" :disabled="isDisabled" class="text-textColor bg-surfaceColor border-strokeColor flex items-center gap-1 rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50">
                        <div class="flex items-center gap-1.5">
                            <FunnelIcon class="h-4 w-4" />
                            <span v-if="!isMobile">
                                {{ filterPlan === "all-plans" ? "All Plans" : filterPlan }}
                            </span>
                            <ChevronUpIcon v-if="open" class="h-4 w-4" />
                            <ChevronDownIcon v-else class="h-4 w-4" />
                        </div>
                    </MenuButton>
                    <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                        <MenuItems
                            class="ring-staticRingColor absolute z-20 mt-1 w-48 rounded-md p-2 shadow-lg ring-1 focus:outline-none"
                            :style="{
                                backgroundColor: 'var(--sideBarBackgroundColor)',
                                borderColor: 'var(--strokeColor)',
                            }"
                        >
                            <MenuItem class="m-0 rounded-md" v-slot="{ active }">
                                <button
                                    @click="handlePlanFilter('all-plans')"
                                    class="w-full rounded px-3 py-2 text-left text-sm transition-colors duration-200"
                                    :style="{
                                        color: 'var(--textColor)',
                                        backgroundColor: active ? 'var(--surfaceColor)' : 'transparent',
                                    }"
                                >
                                    All Plans
                                </button>
                            </MenuItem>
                            <MenuItem class="m-0 rounded-md" v-for="plan in uniquePlans" :key="plan" v-slot="{ active }">
                                <button
                                    @click="handlePlanFilter(plan)"
                                    class="w-full rounded px-3 py-2 text-left text-sm transition-colors duration-200"
                                    :style="{
                                        color: 'var(--textColor)',
                                        backgroundColor: active ? 'var(--surfaceColor)' : 'transparent',
                                    }"
                                >
                                    {{ plan }}
                                </button>
                            </MenuItem>
                        </MenuItems>
                    </transition>
                </Menu>

                <!-- Filter by Role -->
                <Menu as="div" class="relative">
                    <MenuButton v-slot="{ open }" :disabled="isDisabled" class="text-textColor bg-surfaceColor border-strokeColor flex items-center gap-1 rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50">
                        <div class="flex items-center gap-1.5">
                            <FunnelIcon class="h-4 w-4" />
                            <span v-if="!isMobile">
                                {{ filterRole === "all-roles" ? "All Roles" : filterRole }}
                            </span>
                            <ChevronUpIcon v-if="open" class="h-4 w-4" />
                            <ChevronDownIcon v-else class="h-4 w-4" />
                        </div>
                    </MenuButton>
                    <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                        <MenuItems
                            class="ring-staticRingColor absolute z-20 mt-1 w-48 rounded-md p-2 shadow-lg ring-1 focus:outline-none"
                            :style="{
                                backgroundColor: 'var(--sideBarBackgroundColor)',
                                borderColor: 'var(--strokeColor)',
                            }"
                        >
                            <MenuItem class="m-0 rounded-md" v-slot="{ active }">
                                <button
                                    @click="handleRoleFilter('all-roles')"
                                    class="w-full rounded px-3 py-2 text-left text-sm transition-colors duration-200"
                                    :style="{
                                        color: 'var(--textColor)',
                                        backgroundColor: active ? 'var(--surfaceColor)' : 'transparent',
                                    }"
                                >
                                    All Roles
                                </button>
                            </MenuItem>
                            <MenuItem class="m-0 rounded-md" v-for="role in uniqueRoles" :key="role" v-slot="{ active }">
                                <button
                                    @click="handleRoleFilter(role)"
                                    class="w-full rounded px-3 py-2 text-left text-sm transition-colors duration-200"
                                    :style="{
                                        color: 'var(--textColor)',
                                        backgroundColor: active ? 'var(--surfaceColor)' : 'transparent',
                                    }"
                                >
                                    {{ role }}
                                </button>
                            </MenuItem>
                        </MenuItems>
                    </transition>
                </Menu>
            </div>

            <!-- Clear Filters Button -->
            <button
                v-if="hasActiveFilters"
                @click="clearAllFilters"
                :disabled="isDisabled"
                class="rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                :style="{
                    backgroundColor: 'var(--surfaceColor)',
                    borderColor: 'var(--strokeColor)',
                    color: 'var(--textColor)',
                }"
            >
                {{ isMobile ? "Clear" : "Clear Filters" }}
            </button>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { ref, onMounted, onUnmounted, computed } from "vue"
    import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/outline"
    import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue"

    const isMobile = inject("isMobile")

    const props = defineProps({
        filteredUsers: {
            type: Array,
            default: () => [],
        },
        usersList: {
            type: Array,
            default: () => [],
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
    })

    const emit = defineEmits<{
        (e: "search", query: string): void
        (e: "filterPlan", plan: string | null): void
        (e: "filterRole", role: string | null): void
        (e: "clearFilters"): void
    }>()

    const searchQuery = ref("")
    const filterPlan = ref<string>("all-plans")
    const filterRole = ref<string>("all-roles")

    // Computed properties for unique plans and roles
    const uniquePlans = computed(() => {
        if (!props.usersList?.length) return []
        const plans = [...new Set(props.usersList.map((user: any) => user.currentPlan).filter(Boolean))]
        return plans.sort()
    })

    const uniqueRoles = computed(() => {
        if (!props.usersList?.length) return []
        const roles = [...new Set(props.usersList.map((user: any) => user.role).filter(Boolean))]
        return roles.sort()
    })

    // Check if component should be disabled
    const isDisabled = computed(() => {
        return props.isLoading || !props.usersList?.length
    })

    // Check if any filters are active
    const hasActiveFilters = computed(() => {
        return searchQuery.value.trim() !== "" || filterPlan.value !== "all-plans" || filterRole.value !== "all-roles"
    })

    const handleSearch = (value: string) => {
        value = value.trim() || ""
        searchQuery.value = value

        // Clear filters if search query is not empty
        if (value.length >= 0) {
            filterPlan.value = "all-plans"
            filterRole.value = "all-roles"
        }
        emit("search", value)
    }

    const handlePlanFilter = (plan: string) => {
        filterPlan.value = plan
        emit("filterPlan", plan === "all-plans" ? null : plan)
        filterRole.value = "all-roles"
        searchQuery.value = ""
    }

    const handleRoleFilter = (role: string) => {
        filterRole.value = role
        emit("filterRole", role === "all-roles" ? null : role)
        filterPlan.value = "all-plans"
        searchQuery.value = ""
    }

    const clearAllFilters = () => {
        searchQuery.value = ""
        filterPlan.value = "all-plans"
        filterRole.value = "all-roles"
        emit("search", "")
        emit("filterPlan", null)
        emit("filterRole", null)
        emit("clearFilters")
    }
</script>
<style scoped>
    /* Custom focus styles */
    input:focus {
        outline: none;
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--logoColor) 20%, transparent);
    }

    /* Custom disabled styles */
    input:disabled {
        background-color: var(--surfaceColor);
        opacity: 0.6;
    }

    button:disabled {
        pointer-events: none;
    }
</style>
