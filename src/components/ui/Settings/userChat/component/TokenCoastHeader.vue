<template>
    <div class="relative overflow-hidden">
        <div class="project-gradient rounded-2xl p-8 text-white">
            <!-- Header -->
            <div class="mb-4 flex items-center gap-4">
                <div>
                    <h1 class="mb-1 text-3xl font-bold text-white">Cost Analytics Dashboard</h1>
                    <p class="text-lg text-white opacity-80">Track your token usage, costs, and conversation insights in real-time</p>
                </div>
            </div>

            <!-- Metrics or Skeletons -->
            <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div v-for="(item, index) in cardData" :key="index" class="hover:bg-opacity-20 rounded-xl border border-white/20 bg-white/15 p-6 opacity-0 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/30">
                    <div v-if="!loading" class="text-center">
                        <div class="mb-2 text-3xl font-bold text-white">{{ item.value }}</div>
                        <div class="text-sm font-medium text-white opacity-80">{{ item.label }}</div>
                    </div>
                    <div v-else class="animate-pulse space-y-2">
                        <div class="mx-auto h-8 w-3/4 rounded bg-white/30"></div>
                        <div class="mx-auto h-4 w-1/2 rounded bg-white/20"></div>
                    </div>
                </div>
            </div>

            <!-- Decorative Circles -->
            <div class="absolute top-0 right-0 h-64 w-64 translate-x-32 translate-y-32 rounded-full bg-white/5 dark:bg-black/10"></div>
            <div class="absolute bottom-0 left-0 h-48 w-48 -translate-x-24 translate-y-24 rounded-full bg-white/5 dark:bg-black/10"></div>
        </div>
    </div>
</template>

<script setup>
    import formatNumber from "@/util/formatNumber"
    import { ref, computed, onMounted } from "vue"
    import useAnalytics from "~/composables/useAnalytics"

    const props = defineProps({
        selectedFilters: {
            dateRangeFilter: String,
            modelFilter: String,
            userFilter: String,
            organizationFilter: String,
            compareToFilter: String,
        },
    })

    const { useperiodicUsage } = useAnalytics()
    const loading = ref(true)
    const metrics = ref({
        totalTokens: 0,
        totalCost: 0,
        totalMessages: 0,
        totalConversations: 0,
    })

    // Computed to merge API and prop data
    const displayMetrics = computed(() => ({
        ...metrics.value,
    }))

    // Cards structure for rendering
    const cardData = computed(() => [
        {
            label: "Total Tokens This Month",
            value: formatNumber(displayMetrics.value.totalTokens),
        },
        {
            label: "Total Cost This Month",
            value: `$${formatNumber(displayMetrics.value.totalCost)}`,
        },
        {
            label: "Conversations This Month",
            value: formatNumber(displayMetrics.value.totalConversations),
        },
        {
            label: "Avg Cost per Conversation",
            value: `$${formatNumber(displayMetrics.value.totalCost / (displayMetrics.value.totalConversations == 0 ? 1 : displayMetrics.value.totalConversations))}`,
        },
    ])

    watch([() => props.selectedFilters.modelFilter, () => props.selectedFilters.userFilter], ([model, userType]) => {
        fetchMonthlyUsage(model, userType)
    })

    onMounted(() => {
        const model = props.selectedFilters.modelFilter
        const userType = props.selectedFilters.userFilter
        fetchMonthlyUsage(model, userType)
    })

    async function fetchMonthlyUsage(model, userType) {
        loading.value = true
        try {
            let userId = ""
            if (userType !== "me" && userType !== "all") {
                userId = userType
                userType = "individual"
            }
            const response = await useperiodicUsage("month", model, userType, userId)

            if (response.status === "success" && response.data?.summary) {
                metrics.value = response.data.summary
            } else {
                throw new Error(response?.message || "Unexpected response format")
            }
        } catch (error) {
            console.error("Failed to load monthly usage data:", error)
            metrics.value = {
                totalTokens: 0,
                totalCost: 0,
                totalMessages: 0,
                totalConversations: 0,
            }
        } finally {
            loading.value = false
        }
    }
</script>

<style scoped>
    .project-gradient {
        background: linear-gradient(135deg, var(--logoColor) 0%, var(--highlightColor) 50%, var(--logoColor) 100%);
    }

    [data-theme="dark"] .project-gradient {
        background: linear-gradient(135deg, var(--darkCharcoal));
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (min-width: 1024px) {
        .grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
        }
    }

    .grid > div {
        animation: fadeInUp 0.6s ease forwards;
    }

    .grid > div:nth-child(1) {
        animation-delay: 0.1s;
    }
    .grid > div:nth-child(2) {
        animation-delay: 0.2s;
    }
    .grid > div:nth-child(3) {
        animation-delay: 0.3s;
    }
    .grid > div:nth-child(4) {
        animation-delay: 0.4s;
    }
</style>
