<template>
    <!-- Sticky Filter Bar -->
    <div class="border-strokeColor bg-sideBarBackgroundColor top-0 z-10 border-b bg-gradient-to-r from-[var(--sideBarBackgroundColor)] to-[rgba(255,255,255,0.02)] shadow-sm backdrop-blur-[12px]">
        <div class="filter-bar bg-sideBarBackgroundColor scrollbar-none flex h-16 items-center justify-start gap-4 overflow-x-auto px-4 backdrop-blur-[8px]">
            <!-- Date Range Filter -->
            <div class="flex min-w-max items-center gap-2">
                <span class="text-textColorSecondary text-sm">Date Range:</span>
                <BaseChartDropDown v-model="filters.dateRange" :options="filterOptions" />
            </div>

            <!-- Model Filter -->
            <div class="flex min-w-max items-center gap-2">
                <span class="text-textColorSecondary text-sm">Model:</span>
                <BaseChartDropDown v-model="filters.model" :options="[{ label: 'All Models', value: 'all' }, ...modelOptions]" />
            </div>

            <!-- User Filter -->
            <div class="flex min-w-max items-center gap-2">
                <span class="text-textColorSecondary text-sm">User:</span>
                <BaseChartDropDown v-model="filters.user" :options="dynamicUserOptions" />
            </div>

            <!-- Organization Filter -->
            <!-- <div class="flex items-center gap-2 min-w-max">
                <span class="text-sm text-textColorSecondary">Organization:</span>
                <BaseChartDropDown v-model="filters.organization" :options="organizationOptions" />
            </div>

        
            <div class="flex items-center gap-2 min-w-max">
                <span class="text-sm text-textColorSecondary">Compare To:</span>
                <BaseChartDropDown v-model="filters.compareTo" :options="compareToOptions" />
            </div> -->
        </div>
    </div>
    <div class="flex flex-col gap-6 p-4">
        <div class="flex flex-col gap-4 md:flex-row">
            <TokenCoastHeader class="w-full" :selectedFilters="selectedFilters" />
        </div>
        <div class="flex flex-col gap-4 md:flex-row">
            <TokenUgesAlert class="w-full" />
        </div>
        <!-- Highest Usage Section -->
        <HighestTokenUgesConversation :selectedFilters="selectedFilters" />

        <!-- Weekly Usage Section -->
        <div class="flex flex-col gap-4 md:flex-row">
            <PeriodicTokenCost class="w-full md:w-1/2" :selectedFilters="selectedFilters" />
            <PeriodicTokenUsed class="w-full md:w-1/2" :selectedFilters="selectedFilters" />
        </div>

        <!-- Monthly and Model Distribution -->
        <div class="flex flex-col gap-4 md:flex-row">
            <PeriodicUges class="w-full md:w-1/2" :selectedFilters="selectedFilters" />
            <ModelDistribution class="w-full md:w-1/2" :selectedFilters="selectedFilters" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { filterOptions, compareToOptions, organizationOptions, modelOptions } from "~/util"
    const usersList = ref<IUser[]>([])

    // Create reactive filter object
    const filters = reactive({
        dateRange: filterOptions[0].value,
        model: "all",
        user: "all", // Default to "all" users
        organization: organizationOptions[0].value,
        compareTo: compareToOptions[0].value,
    })

    // Computed property for dynamic user options
    const dynamicUserOptions = computed(() => {
        const baseOptions = [
            { label: "All Users", value: "all" },
            { label: "Current User", value: "me" },
        ]

        // Add individual users from usersList
        const userOptions = usersList.value.map((user) => ({
            label: `${user.firstName}(${user.email})`,
            value: user.userId,
        }))

        return [...baseOptions, ...userOptions]
    })

    // Computed property for cleaner prop passing
    const selectedFilters = computed(() => ({
        dateRangeFilter: filters.dateRange,
        modelFilter: filters.model,
        userFilter: filters.user,
        organizationFilter: filters.organization,
        compareToFilter: filters.compareTo,
    }))

    async function fetchUsers() {
        try {
            const userData = await useAdmin().getUsersList()
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

    onMounted(async () => {
        await fetchUsers()
    })
</script>
<style scoped>
    /* Hide scrollbars */
    .scrollbar-none {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .scrollbar-none::-webkit-scrollbar {
        display: none;
    }

    /* Enhanced Select Styling */
    select {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 0.5rem center;
        background-repeat: no-repeat;
        background-size: 1.5em 1.5em;
        padding-right: 2.5rem;
    }

    /* Dark theme select arrow */
    .dark select {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%9ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    }

    select:focus {
        box-shadow: 0 0 0 2px var(--logoColor, #3b82f6);
        border-color: var(--logoColor, #3b82f6);
    }

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }

        100% {
            background-position: -200% 0;
        }
    }

    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
        .filter-bar {
            border-width: 2px;
        }

        select {
            border-width: 2px;
        }
    }
</style>
