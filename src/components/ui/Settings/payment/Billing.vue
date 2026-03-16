<template>
    <div class="min-h-screen">
        <!-- Header -->
        <div class="" style="border-color: var(--strokeColor)">
            <div class="mx-auto max-w-7xl px-6 pt-20 md:py-6">
                <h1 class="px28 bold" style="color: var(--textColor)">Billing & Subscriptions</h1>
                <p class="px15 mt-2" style="color: var(--textColorSecondary)">Manage your billing information, view invoices, and update payment methods</p>
            </div>
        </div>

        <!-- Main Content -->
        <div class="mx-auto max-w-7xl px-6 py-8">
            <div class="space-y-8">
                <!-- Current Plan Overview -->
                <CurrentPlanOverview ref="currentPlanRef" />

                <!-- Invoices Section -->
                <InvoicesList />

                <!-- Active Plans Section -->
                <ActivePlans @plan-cancelled="handlePlanCancellation" />

                <!-- Payment Methods Section -->
                <!-- <PaymentMethods /> -->
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from "vue"
    const currentPlanRef = ref(null)
    const handlePlanCancellation = () => {
        // Reload CurrentPlanOverview data after any cancellation attempt
        if (currentPlanRef.value) {
            currentPlanRef.value.reloadPlanData()
        }
    }
</script>
