<template>
    <div class="group border-strokeColor bg-sideBarBackgroundColor mx-auto flex h-full max-w-sm cursor-default flex-col justify-between overflow-hidden rounded-xl border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:mx-0 md:max-w-none">
        <div>
            <!-- Product Image or Icon -->
            <div class="from-logoColor relative overflow-hidden bg-gradient-to-br to-gray-50 p-6 dark:to-gray-800">
                <div class="absolute inset-0 bg-black/5"></div>
                <div class="relative z-10">
                    <img v-if="product.images && product.images.length > 0" :src="product.images[0]" :alt="product.name" class="mx-auto h-16 w-16 rounded-lg bg-white/20 object-cover p-2" />
                    <div v-else class="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-white/20">
                        <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-14 0h2m-2 0h-2m28 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                </div>

                <!-- Popular Badge -->
                <div v-if="isPopular" class="absolute top-4 right-4">
                    <span class="rounded-full border border-white/30 bg-white/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm"> Popular </span>
                </div>
            </div>

            <!-- Card Content -->
            <div class="p-6">
                <!-- Plan Name -->
                <div class="mb-4">
                    <h3 class="text-textColor mb-1 text-xl font-bold capitalize">
                        {{ product.name }}
                    </h3>
                    <p class="text-textColorSecondary text-sm">
                        {{ product.description }}
                    </p>
                </div>

                <!-- Pricing -->
                <div class="mb-6">
                    <div class="flex items-baseline">
                        <span class="text-textColor text-3xl font-bold"> ${{ formatPrice(primaryPrice.unit_amount) }} </span>
                        <span class="text-textColorSecondary ml-1"> /{{ primaryPrice.recurring?.interval || "month" }}{{ product.name.toLowerCase().includes("enterprise") ? "/member" : "" }} </span>
                    </div>
                    <p class="text-textColorSecondary mt-1 text-xs">Billed every {{ primaryPrice.recurring?.interval || "monthly" }}</p>
                </div>

                <!-- Features -->
                <div v-if="features.length > 0" class="mb-6">
                    <ul class="space-y-2">
                        <li v-for="feature in features" :key="feature" class="text-textColorSecondary flex items-center text-sm">
                            <svg class="text-Mgreen mr-2 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {{ feature }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Action Button -->
        <div class="p-2 pb-8">
            <button @click="selectPlan" class="hover:bg-logoColor/90 bg-logoColor w-full transform cursor-pointer rounded-lg px-4 py-3 font-medium text-white shadow-md" :class="[isPopular ? 'ring-logoColor/20 ring-2' : '', 'focus:ring-logoColor/50 focus:ring-2 focus:ring-offset-2 focus:outline-none']">Choose {{ product.name }}</button>
        </div>
    </div>
</template>

<script setup>
    import { computed } from "vue"

    // Props
    const props = defineProps({
        product: {
            type: Object,
            required: true,
        },
    })

    // Emits
    const emit = defineEmits(["select-plan"])

    const primaryPrice = computed(() => {
        return props.product.prices?.[0] || { unit_amount: 0, currency: "usd" }
    })

    const isPopular = computed(() => {
        return props.product.name.toLowerCase().includes("pro") || props.product.name.toLowerCase().includes("plus")
    })

    const features = computed(() => {
        const baseFeatures = {
            "mozart basic": ["Basic features", "Email support", "Up to 5 models", "Monthly billing"],
            "mozart pro": ["Advanced features", "Priority support", "Up to 30 models", "API access", "Custom integrations"],
            "mozart enterprise": ["Enterprise features", "24/7 support", "All model access", "Full API access", "Custom solutions", "Dedicated manager"],
        }

        const planKey = props.product.name.toLowerCase()
        return baseFeatures[planKey] || ["Standard features", "Email support", "Monthly billing"]
    })

    const formatPrice = (amount) => {
        return (amount / 100).toFixed(0)
    }

    const selectPlan = () => {
        emit("select-plan", props.product)
    }
</script>

<style scoped>
    .group {
        transform: translateY(0) scale(1);
        will-change: transform;
    }

    .group:hover {
        transform: translateY(-4px) scale(1.02);
    }

    /* Keep the original background gradient hover effect */
    .group:hover .bg-gradient-to-br {
        background: linear-gradient(135deg, var(--logoColor), var(--highlightColor));
    }

    /* Smooth transitions */
    * {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
</style>
