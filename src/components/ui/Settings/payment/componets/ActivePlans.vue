<!-- ActivePlans -->
<template>
    <div class="rounded-lg border" style="background-color: var(--sideBarBackgroundColor); border-color: var(--strokeColor)">
        <!-- Header -->
        <div class="p-6" style="border-color: var(--strokeColor)">
            <h3 class="px20 bold" style="color: var(--textColor)">Cancellation</h3>
        </div>

        <!-- Plans List or Loading -->
        <div class="p-6">
            <!-- 🔄 Loading Skeleton -->
            <div v-if="isLoading" class="space-y-4">
                <div v-for="n in 2" :key="n" class="flex items-center justify-between gap-4 rounded-lg border p-5" style="background-color: var(--backgroundColor); border-color: var(--strokeColor)">
                    <div class="flex w-full items-center gap-3">
                        <div class="skeleton-loader h-6 w-40 rounded"></div>
                    </div>
                    <div class="skeleton-loader h-10 w-24 rounded-lg"></div>
                </div>
            </div>

            <!-- ✅ Active and Trialing Plans -->
            <div v-else-if="allPlans.length > 0" class="space-y-4">
                <div v-for="plan in allPlans" :key="plan.subscriptionId" class="flex justify-between rounded-lg border p-5 transition-all" style="background-color: var(--backgroundColor); border-color: var(--strokeColor)">
                    <div class="flex items-center gap-3">
                        <h3 class="px20 font-bold" style="color: var(--textColor)">{{ plan.name }}</h3>
                        <span v-if="plan.isTrialing" class="bg-secondary text-foreground rounded-full px-2 py-1 text-xs font-medium">Trial</span>
                    </div>

                    <button class="px15 flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors" style="color: var(--primaryColor); background-color: var(--red); border: none" @mouseover="handleButtonHover($event, '0.9')" @mouseout="handleButtonHover($event, '1')" @click="showCancelDialog(plan)" :disabled="isCancelling">
                        <span v-if="isCancelling" class="loader small"></span>
                        <span>Cancel</span>
                    </button>
                </div>
            </div>

            <!-- ❌ Empty State -->
            <div v-else class="py-12 text-center">
                <span class="material-icons mb-4" style="font-size: 48px; color: var(--textColorSecondary)">subscriptions</span>
                <h3 class="px20 mb-2 font-medium" style="color: var(--textColor)">No active subscriptions</h3>
                <p class="px15 mb-6" style="color: var(--textColorSecondary)">You don't have any active subscriptions at the moment.</p>
                <button @click="() => handleProfileNavigate()" class="px15 text-foreground bg-primary text-primary-foreground rounded-lg bg-[#3d67f9] px-6 py-3 font-medium">Browse Plans</button>
            </div>
        </div>

        <!-- Cancel Modal -->
        <div v-if="showCancelModal" class="popup-wrapper active-popup" @click="!isCancelling && closeCancelDialog()">
            <div class="popup-container h-fit max-w-md" @click.stop>
                <div class="p-6">
                    <div class="mb-4 flex items-center gap-3">
                        <span class="material-icons" style="color: var(--red); font-size: 24px">warning</span>
                        <h3 class="px20 font-bold" style="color: var(--textColor)">Cancel Subscription</h3>
                    </div>

                    <p class="px15 mb-4" style="color: var(--textColorSecondary)">
                        Are you sure you want to cancel your <strong>{{ selectedPlan?.name }}</strong> subscription?
                        <span v-if="selectedPlan?.isTrialing"> Your trial will end immediately. </span>
                        <span v-else>
                            You'll continue to have access until <strong>{{ selectedPlan?.nextPayment }}</strong
                            >.
                        </span>
                    </p>

                    <div class="flex gap-3 pt-5">
                        <button class="px15 flex-1 rounded-lg border px-4 py-2 font-medium transition-colors" style="color: var(--textColor); border-color: var(--strokeColor); background-color: transparent" @mouseover="handleGoBackHover($event, true)" @mouseout="handleGoBackHover($event, false)" @click="closeCancelDialog" :disabled="isCancelling">Go Back</button>
                        <button class="px15 flex-1 rounded-lg px-4 py-2 font-medium transition-colors" style="color: var(--primaryColor); background-color: var(--red)" @mouseover="handleCancelButtonHover($event, true)" @mouseout="handleCancelButtonHover($event, false)" @click="confirmCancel" :disabled="isCancelling">
                            <span v-if="isCancelling" class="border-border inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                            <span v-else>Cancel Plan</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast removed - using vue-sonner's Toaster component instead -->
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed } from "vue"
    import useStripePayment from "~/composables/useStripePayment"
    import eventBus from "~/util/eventBus"

    // Define emits
    const emit = defineEmits(["plan-cancelled"])

    // Stripe payment API composable
    const { getAllActivePlans, cancelSubscription } = useStripePayment()

    // State
    const activePlans = ref<Plan[]>([])
    const trialingPlans = ref<Plan[]>([])
    const isLoading = ref(true)
    const showCancelModal = ref(false)
    const selectedPlan = ref<Plan | null>(null)
    const isCancelling = ref(false)

    // Computed property to combine all plans
    const allPlans = computed(() => [...activePlans.value, ...trialingPlans.value])

    // Router for navigation
    const router = useRouter()

    const showToast = (message: string, success = true, duration = 3000) => {
        eventBus.emit("showToast", {
            message,
            _type: success ? "success" : "error",
        })
    }

    // Helper functions for event handling
    const handleButtonHover = (event: Event, opacity: string) => {
        const target = event.target as HTMLElement
        if (target) {
            target.style.opacity = opacity
        }
    }

    const handleGoBackHover = (event: Event, isHover: boolean) => {
        if (!isCancelling.value) {
            const target = event.target as HTMLElement
            if (target) {
                target.style.backgroundColor = isHover ? "var(--strokeColor)" : "transparent"
            }
        }
    }

    const handleCancelButtonHover = (event: Event, isHover: boolean) => {
        if (!isCancelling.value) {
            const target = event.target as HTMLElement
            if (target) {
                target.style.opacity = isHover ? "0.9" : "1"
            }
        }
    }

    // Helper function to map subscription data to plan format
    const mapSubscriptionToPlan = (sub: StripeSubscription, index: number, isTrialing: boolean): Plan => ({
        id: index + 1,
        subscriptionId: sub.subscriptionId,
        name: sub.plans[0]?.planName || "Unnamed Plan",
        price: sub.plans[0]?.pricing?.formattedAmount || "",
        billingCycle: sub.plans[0]?.pricing?.interval || "month",
        nextPayment: new Date(sub.billing?.nextBillingDate).toLocaleDateString(),
        startDate: new Date(sub.billing?.currentPeriodStart).toLocaleDateString(),
        autoRenew: sub.renewal?.autoRenew,
        isTrialing,
        original: sub,
    })

    // Load active and trialing plans
    const loadPlans = async () => {
        try {
            isLoading.value = true
            const response = await getAllActivePlans()

            if (response.status == "success" && response.data) {
                // Map active plans
                if (response.data.activePlans && Array.isArray(response.data.activePlans)) {
                    activePlans.value = response.data.activePlans.map((sub: StripeSubscription, index: number) => mapSubscriptionToPlan(sub, index, false))
                }

                // Map trialing plans
                if (response.data.trialingPlans && Array.isArray(response.data.trialingPlans)) {
                    trialingPlans.value = response.data.trialingPlans.map((sub: StripeSubscription, index: number) => mapSubscriptionToPlan(sub, index + activePlans.value.length, true))
                }
            }
        } catch (error) {
            console.error("Failed to load plans:", error)
            showToast("Failed to load plans", false)
        } finally {
            isLoading.value = false
        }
    }

    // Show/close cancel modal
    const showCancelDialog = (plan: Plan) => {
        selectedPlan.value = plan
        showCancelModal.value = true
    }

    const closeCancelDialog = () => {
        selectedPlan.value = null
        showCancelModal.value = false
    }

    // Cancel a subscription
    const confirmCancel = async () => {
        if (!selectedPlan.value) return
        isCancelling.value = true

        try {
            const subscriptionId = selectedPlan.value.subscriptionId
            const response = await cancelSubscription(subscriptionId)
            if (response.status == "success") {
                // Remove from active plans
                const activeIndex = activePlans.value.findIndex((p) => p.subscriptionId === subscriptionId)
                if (activeIndex !== -1) {
                    activePlans.value.splice(activeIndex, 1)
                }

                // Remove from trialing plans
                const trialingIndex = trialingPlans.value.findIndex((p) => p.subscriptionId === subscriptionId)
                if (trialingIndex !== -1) {
                    trialingPlans.value.splice(trialingIndex, 1)
                }

                showToast("Subscription cancelled successfully", true)
                // Emit event on successful cancellation
                emit("plan-cancelled")
            }
            closeCancelDialog()
        } catch (error) {
            console.error("Cancellation error:", error)
            showToast("Failed to cancel subscription", false)
        } finally {
            isCancelling.value = false
        }
    }

    // Navigate to plans page
    const handleProfileNavigate = () => {
        router.push("/profile/plan")
    }

    // Load plans on mount
    onMounted(() => {
        loadPlans()
    })
</script>

<style scoped>
    .loader.small {
        border: 2px solid #f3f3f3;
        border-top: 2px solid white;
        border-radius: 50%;
        width: 14px;
        height: 14px;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }

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
</style>
