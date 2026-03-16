<template>
    <div class="alert-container text-white relative overflow-hidden rounded-xl p-4 shadow-lg" :class="{ 'critical-alert hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(239,68,68,0.2)]': usagePercentage >= 90, 'cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_8px_25px_black/15]': true }" @click="handleAlertClick">
        <!-- Alert Content -->
        <div class="mb-3 flex items-center gap-[0.5rem] sm:gap-3">
            <!-- Warning Icon -->
            <div class="flex-shrink-0">
                <span class="text-[1.125rem] md:text-xl">⚠️</span>
            </div>

            <!-- Alert Text -->
            <div class="flex-1">
                <span class="text-white font-bold">Token Usage Alert:</span>
                <span class="text-white ml-2"> You've used {{ usagePercentage }}% of your monthly token limit ({{ formatNumber(currentUsage) }} / {{ formatNumber(monthlyLimit) }}) </span>
            </div>
        </div>

        <!-- Progress Bar -->
        <div class="relative">
            <div class="h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div class="h-full rounded-full bg-white shadow-[0_0_8px_white/30] transition-all duration-1000 ease-out" :style="{ width: `${Math.min(usagePercentage, 100)}%` }"></div>
            </div>

            <!-- Progress percentage indicator -->
            <div class="absolute top-0 flex h-2 items-center justify-center transition-all duration-1000 ease-out" :style="{ left: `${Math.min(usagePercentage, 95)}%` }">
                <div class="h-3 w-3 -translate-x-1/2 transform rounded-full bg-white shadow-md"></div>
            </div>
        </div>

        <!-- Optional: Additional Info -->
        <div class="mt-3 flex items-center justify-between text-[0.75rem] opacity-90 md:text-sm">
            <span>{{ formatNumber(remainingTokens) }} tokens remaining</span>
            <span>{{ daysUntilReset }} days until reset</span>
        </div>

        <!-- Decorative gradient overlay -->
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-transparent opacity-5"></div>
    </div>
</template>

<script setup>
    import { ref, computed } from "vue"

    // Props for customization
    const props = defineProps({
        currentUsage: {
            type: Number,
            default: 12847,
        },
        monthlyLimit: {
            type: Number,
            default: 20000,
        },
        daysUntilReset: {
            type: Number,
            default: 12,
        },
        alertType: {
            type: String,
            default: "warning", // 'warning', 'danger', 'info'
            validator: (value) => ["warning", "danger", "info"].includes(value),
        },
    })

    // Computed values
    const usagePercentage = computed(() => {
        return Math.round((props.currentUsage / props.monthlyLimit) * 100)
    })

    const remainingTokens = computed(() => {
        return Math.max(0, props.monthlyLimit - props.currentUsage)
    })

    // Format numbers with commas
    const formatNumber = (num) => {
        return num.toLocaleString()
    }

    // Determine alert severity automatically
    const alertSeverity = computed(() => {
        if (usagePercentage.value >= 90) return "critical"
        if (usagePercentage.value >= 80) return "high"
        if (usagePercentage.value >= 60) return "moderate"
        return "low"
    })

    // Emit events for parent component
    const emit = defineEmits(["alert-clicked", "usage-critical"])

    // Emit critical usage warning if needed
    if (usagePercentage.value >= 90) {
        emit("usage-critical", {
            percentage: usagePercentage.value,
            remaining: remainingTokens.value,
        })
    }

    // Handle alert click
    const handleAlertClick = () => {
        emit("alert-clicked", {
            severity: alertSeverity.value,
            percentage: usagePercentage.value,
            usage: props.currentUsage,
            limit: props.monthlyLimit,
        })
    }
</script>

<style scoped>
    /* Dynamic background colors based on usage percentage */
    .alert-container {
        background: linear-gradient(135deg, var(--logoColor) 0%, var(--highlightColor) 50%, var(--logoColor) 100%);
    }

    /* Warning state (70%+) */
    .alert-container:has(.warning-state) {
        background: linear-gradient(135deg, var(--orange1), var(--orange2));
    }

    /* Critical state (90%+) */
    .critical-alert {
        background: linear-gradient(135deg, var(--red), var(--red2)) !important;
    }

    /* Dark mode adaptations */
    [data-theme="dark"] .alert-container {
        background: linear-gradient(135deg, var(--darkCharcoal));
    }

    /* Different alert types using CSS custom properties */
    .alert-container[data-type="danger"] {
        background: linear-gradient(135deg, var(--red), var(--red2));
    }

    .alert-container[data-type="warning"] {
        background: linear-gradient(135deg, var(--orange1), var(--orange2));
    }

    .alert-container[data-type="info"] {
        background: linear-gradient(135deg, var(--logoColor), var(--highlightColor));
    }

    [data-theme="dark"] .critical-alert {
        background: linear-gradient(135deg, var(--red), var(--red2)) !important;
    }

    [data-theme="dark"] .alert-container[data-type="warning"] {
        background: linear-gradient(135deg, var(--orange1), var(--orange2));
    }

    [data-theme="light"] .alert-container[data-type="info"] {
        background: linear-gradient(135deg, var(--logoColor), var(--highlightColor));
    }

    @keyframes pulseWarning {
        0%,
        100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.9;
            transform: scale(1.005);
        }
    }

    /* Add pulse class conditionally for critical usage */
    .critical-alert {
        animation: pulseWarning 2s infinite;
    }
</style>
