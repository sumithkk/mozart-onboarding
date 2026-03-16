<template>
    <div class="border-strokeColor bg-sideBarBackgroundColor rounded-2xl border p-6 shadow-sm">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="bg-logoColor flex h-8 w-8 items-center justify-center rounded-lg">
                    <span class="materialSymbolsFilled text-white text-lg">trophy</span>
                </div>
                <h3 class="text-textColor text-lg font-bold">Highest Token Usage Conversations ({{ selectedFilters.dateRangeFilter }})</h3>
            </div>

            <!-- <BaseChartDropDown v-model="selectedFilter" :options="filterOptions" /> -->
        </div>

        <!-- Enhanced Skeleton Loading -->
        <div v-if="loading" class="space-y-4">
            <!-- Skeleton for metrics grid -->
            <div class="mt-4 flex items-center gap-4">
                <div class="border-strokeColor bg-surfaceColor w-full rounded-lg border p-4">
                    <div class="animate-shimmer bg-strokeColor mb-2 h-6 rounded"></div>
                    <div class="animate-shimmer bg-strokeColor h-3 w-16 rounded"></div>
                </div>
                <div class="border-strokeColor bg-surfaceColor w-full rounded-lg border p-4">
                    <div class="animate-shimmer bg-strokeColor mb-2 h-6 rounded"></div>
                    <div class="animate-shimmer bg-strokeColor h-3 w-12 rounded"></div>
                </div>
            </div>

            <!-- Skeleton for meta info -->
            <div class="mt-4 flex items-center justify-between">
                <div class="animate-shimmer bg-strokeColor h-3 w-20 rounded"></div>
                <div class="animate-shimmer bg-strokeColor h-3 w-16 rounded"></div>
            </div>
        </div>

        <!-- Conversation Card -->
        <div v-else-if="conversation" class="border-strokeColor bg-surfaceColor hover:border-strokeColor2 rounded-xl border p-4 transition-all duration-200 hover:shadow-md">
            <!-- Conversation Title -->
            <div class="mb-4">
                <h4 class="text-textColor mb-1 text-base font-semibold">{{ conversation.title }}</h4>
                <div class="flex items-center gap-2">
                    <!-- <span class="px-2 py-1 bg-logoColor/10 text-logoColor text-xs rounded-md font-medium">{{ conversation.model }}</span> -->
                </div>
            </div>

            <!-- Metrics Grid -->
            <div class="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:gap-8">
                <div class="hover:bg-gray border-strokeColor bg-backgroundColor w-full rounded-lg border p-3 text-center transition-colors duration-200">
                    <div class="mb-1 flex items-center justify-center gap-1">
                        <span class="materialSymbolsOutlined text-logoColor text-sm">token</span>
                        <div class="text-textColor text-lg font-bold">{{ formatNumber(conversation.tokens) }}</div>
                    </div>
                    <div class="text-textColorSecondary text-xs font-medium">Tokens Used</div>
                </div>

                <div class="hover:bg-gray border-strokeColor bg-backgroundColor w-full rounded-lg border p-3 text-center transition-colors duration-200">
                    <div class="mb-1 flex items-center justify-center gap-1">
                        <span class="materialSymbolsOutlined text-Mgreen text-sm">attach_money</span>
                        <div class="text-textColor text-lg font-bold">${{ formatNumber(conversation.cost) }}</div>
                    </div>
                    <div class="text-textColorSecondary text-xs font-medium">Total Cost</div>
                </div>
            </div>

            <!-- Meta Info with Icons -->
            <div class="border-strokeColor flex items-center justify-between border-t pt-3">
                <div class="text-textColorSecondary flex items-center gap-1 text-xs">
                    <span class="materialSymbolsOutlined text-xs">calendar_today</span>
                    <span>{{ formatDate(conversation.creationDate) }}</span>
                </div>
                <div class="text-textColorSecondary flex items-center gap-1 text-xs">
                    <span class="materialSymbolsOutlined text-xs">schedule</span>
                    <span>{{ conversation.duration || "N/A" }}</span>
                </div>
            </div>
        </div>

        <!-- Enhanced Empty State -->
        <div v-else class="py-8 text-center">
            <div class="bg-strokeColor mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full">
                <span class="materialSymbolsOutlined text-unselectedColor text-2xl">chat_bubble_outline</span>
            </div>
            <p class="text-textColorSecondary mb-1 text-sm font-medium">No conversation data available</p>
            <p class="text-textColorSecondary text-xs">Try selecting a different time period</p>
        </div>
    </div>
</template>
<script setup>
    import { ref, onMounted, watch } from "vue"
    import useAnalytics from "~/composables/useAnalytics"
    import formatNumber from "@/util/formatNumber"

    const props = defineProps({
        selectedFilters: {
            dateRangeFilter: String,
            modelFilter: String,
            userFilter: String,
            organizationFilter: String,
            compareToFilter: String,
        },
    })

    const { highestConversations } = useAnalytics()

    const loading = ref(false)
    const conversation = ref(null)

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })

    const fetchConversations = async (dateRange, model, userType) => {
        loading.value = true
        conversation.value = null

        try {
            let userId = ""
            if (userType !== "me" && userType !== "all") {
                userId = userType
                userType = "individual"
            }
            const response = await highestConversations(dateRange, model, userType, userId)

            if (response.status === "success" && response?.data) {
                console.log(response.data)
                conversation.value = response.data
            } else {
                console.warn("Unexpected response format:", response)
                throw new Error(response?.message || "Failed to fetch conversation.")
            }
        } catch (error) {
            console.error("Failed to fetch highest conversation:", error)
            conversation.value = null
        } finally {
            loading.value = false
        }
    }

    // Initial load
    onMounted(() => {
        const dateRange = props.selectedFilters.dateRangeFilter.toLowerCase()
        const model = props.selectedFilters.modelFilter
        const userType = props.selectedFilters.userFilter
        fetchConversations(dateRange, model, userType)
    })

    // Reactively fetch when filter changes
    watch([() => props.selectedFilters.dateRangeFilter, () => props.selectedFilters.modelFilter, () => props.selectedFilters.userFilter], ([newDateRange, newModel, newUserType]) => {
        fetchConversations(newDateRange.toLowerCase(), newModel, newUserType)
    })
</script>

<style scoped>
    .animate-shimmer {
        background: linear-gradient(90deg, var(--strokeColor) 25%, var(--strokeColor2) 50%, var(--strokeColor) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
        0% {
            background-position: -200% 0;
        }
        100% {
            background-position: 200% 0;
        }
    }
</style>
