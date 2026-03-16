<!-- CurrentPlanOverview -->
<template>
    <div class="rounded-lg border p-6" style="background-color: var(--sideBarBackgroundColor); border-color: var(--strokeColor)">
        <!-- Loading Skeleton -->
        <div v-if="isLoading" class="flex items-center justify-between gap-6">
            <div class="flex-1">
                <div class="skeleton-loader mb-4 h-7 w-32 rounded"></div>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="skeleton-loader h-5 w-24 rounded"></div>
                        <div class="skeleton-loader h-5 w-20 rounded"></div>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="skeleton-loader h-5 w-32 rounded"></div>
                        <div class="skeleton-loader h-5 w-28 rounded"></div>
                    </div>
                </div>
            </div>
            <div class="skeleton-loader h-10 w-24 rounded-lg"></div>
        </div>

        <!-- No Plan State -->
        <div v-else-if="isEmpty || !planData?.planName" class="w-full py-12 text-center">
            <span class="material-icons mb-4" style="font-size: 48px; color: var(--textColorSecondary)">subscriptions</span>
            <h3 class="px20 mb-2 font-medium" style="color: var(--textColor)">No active plan</h3>
            <p class="px15 mb-6" style="color: var(--textColorSecondary)">You currently don't have any active plan associated with your account.</p>
            <button class="px15 bg-mozart-blue hover:bg-mozart-blue-700 rounded-lg px-6 py-3 font-medium text-white" @click="() => handleProfileNavigate('plan')">Browse Plans</button>
        </div>

        <!-- Active/Trial Plan Content -->
        <div v-else class="flex items-center justify-between gap-6">
            <div>
                <div class="mb-4 flex items-center gap-3">
                    <h3 class="px20 bold" style="color: var(--textColor)">
                        {{ planData?.planName || "No Plan" }}
                    </h3>
                    <span v-if="planData?.isTrialing" class="bg-secondary text-foreground rounded-full px-2 py-1 text-xs font-medium">Trial</span>
                </div>
                <div class="space-y-5">
                    <div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
                        <span class="shrink-0 px-15" style="color: var(--textColorSecondary)">Monthly Price:</span>
                        <span class="px-15 text-left text-nowrap" style="color: var(--textColor)">{{ planData?.price || "-" }}</span>
                    </div>

                    <div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
                        <span class="px15 shrink-0" style="color: var(--textColorSecondary)">
                            {{ planData?.isTrialing ? "Trial Ends:" : "Next Billing:" }}
                        </span>
                        <span class="px15 text-left text-nowrap sm:pl-5" style="color: var(--textColor)">{{ planData?.nextBillingDate || "-" }}</span>
                    </div>
                </div>
            </div>

            <button class="px15 rounded-lg px-3 py-1 transition-colors" @click="() => handleProfileNavigate('plan')" style="color: var(--textColor); background-color: transparent; border: 1px solid var(--strokeColor)" @mouseover="handleButtonHover($event, true)" @mouseout="handleButtonHover($event, false)">Adjust Plan</button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed } from "vue"
    import useStripePayment from "~/composables/useStripePayment"

    const router = useRouter()
    const { getAllActivePlans } = useStripePayment()

    const activePlanData = ref<PaymentResponse | null>(null)
    const isLoading = ref(true)

    // Whether the user has zero active and trialing plans
    const isEmpty = computed(() => {
        if (!activePlanData.value?.data) return true
        const hasActivePlans = activePlanData.value.data.activePlans?.length ?? 0
        const hasTrialingPlans = activePlanData.value.data.trialingPlans?.length ?? 0
        return hasActivePlans === 0 && hasTrialingPlans === 0
    })

    const planData = computed(() => {
        if (!activePlanData.value?.data) return null

        // Check for active plans first, then trialing plans
        let plan: StripeSubscription | undefined
        let isTrialing = false

        if (activePlanData.value.data.activePlans?.length) {
            plan = activePlanData.value.data.activePlans[0]
            isTrialing = false
        } else if (activePlanData.value.data.trialingPlans?.length) {
            plan = activePlanData.value.data.trialingPlans[0]
            isTrialing = true
        }

        if (!plan) return null

        const planInfo = plan.plans[0]

        return {
            planName: planInfo.planName,
            price: planInfo.pricing.formattedAmount,
            nextBillingDate: formatDate(plan.billing.nextBillingDate),
            isTrialing,
        }
    })

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    // Helper function for button hover events
    const handleButtonHover = (event: Event, isHover: boolean) => {
        const target = event.target as HTMLElement
        if (target) {
            target.style.backgroundColor = isHover ? "var(--strokeColor)" : "transparent"
        }
    }

    const fetchActivePlan = async () => {
        try {
            isLoading.value = true
            const data = (await getAllActivePlans()) as PaymentResponse
            if (data.status == "success") {
                activePlanData.value = data
            }
        } catch (error) {
            console.error("Error fetching active plans:", error)
        } finally {
            isLoading.value = false
        }
    }

    // Method to reload data externally (called by parent component)
    const reloadPlanData = async () => {
        await fetchActivePlan()
    }

    const handleProfileNavigate = (index: string) => {
        router.push(`/profile/${index}`)
    }

    // Expose the reload method to parent component
    defineExpose({
        reloadPlanData,
    })

    onMounted(() => {
        fetchActivePlan()
    })
</script>

<style scoped>
    .skeleton-loader {
        background: linear-gradient(90deg, var(--strokeColor) 25%, var(--midGrey) 50%, var(--strokeColor) 75%);
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s infinite;
    }

    @keyframes skeleton-shimmer {
        0% {
            background-position: 200% 0;
        }

        100% {
            background-position: -200% 0;
        }
    }

    [data-theme="dark"] .skeleton-loader {
        background: linear-gradient(90deg, var(--strokeColor) 25%, var(--itemColor) 50%, var(--strokeColor) 75%);
        background-size: 200% 100%;
    }
</style>
