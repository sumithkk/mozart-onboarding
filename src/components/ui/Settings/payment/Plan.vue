<template>
    <div class="bg-backgroundColor min-h-screen px-9 py-6">
        <div class="mx-auto max-w-7xl">
            <!-- Header Section -->
            <div class="mb-8">
                <h1 class="text-textColor mt-12 mb-2 text-3xl font-bold md:mt-0">Pricing Plans</h1>
                <p class="text-textColorSecondary">Choose the perfect plan for your needs</p>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-12">
                <div class="border-b-logoColor h-12 w-12 animate-spin rounded-full border-2 border-[transparent]"></div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="bg-Mred/10 border-Mred/20 rounded-lg border p-6 text-center">
                <div class="text-Mred mb-2">
                    <svg class="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 class="text-textColor mb-1 text-lg font-semibold">Failed to load products</h3>
                <p class="text-textColorSecondary mb-4">{{ error }}</p>
                <button @click="fetchProducts" class="hover:bg-logoColor/90 bg-logoColor text-foreground rounded-md px-4 py-2 transition-colors">Try Again</button>
            </div>

            <!-- Products Grid -->
            <div v-else-if="products?.length > 0" class="flex flex-wrap gap-6 px-0 md:gap-10 lg:gap-14">
                <div v-for="product in products" :key="product.id" class="mx-auto w-[85%] md:w-auto md:max-w-[28%] md:basis-1/3">
                    <ProductCard :product="product" @select-plan="handlePlanSelection" />
                </div>

                <!-- Empty block to fill remaining space if only 2 products -->
                <div v-if="products.length === 2" class="hidden md:block md:max-w-[25%] md:basis-1/3"></div>
            </div>

            <!-- Empty State -->
            <div v-else class="py-12 text-center">
                <div class="text-unselectedColor mb-4">
                    <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9h.01M15 9h.01M9 15h.01M15 15h.01"></path>
                    </svg>
                </div>
                <h3 class="text-textColor mb-2 text-xl font-semibold">No products available</h3>
                <p class="text-textColorSecondary">Check back later for new pricing plans.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from "vue"

    import eventBus from "~/util/eventBus"
    // Toast state
    const toast = ref({ message: "", success: true })
    const isLoading = ref(true)

    // Stripe payment API composable
    const { createCheckoutSession } = useStripePayment()
    // Use the products composable
    const { products, loading, error, fetchProducts } = useProducts()

    const showToast = (message: string, success = true, duration = 3000) => {
        toast.value = { message, success }
        setTimeout(() => {
            toast.value = { message: "", success: true }
        }, duration)
    }

    const handlePlanSelection = async (product: any) => {
        try {
            const response = await createCheckoutSession(product)
            console.log(response)
        } catch (error) {
            console.error("Error creating checkout session:", error.message)
            showToast("Failed to start checkout. Please try again.", false)
        }
    }

    // Fetch products on component mount
    onMounted(() => {
        fetchProducts()
    })
</script>

<style scoped>
    /* Custom animations */
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .grid > * {
        animation: fadeIn 0.6s ease-out;
    }

    .grid > *:nth-child(1) {
        animation-delay: 0.1s;
    }

    .grid > *:nth-child(2) {
        animation-delay: 0.2s;
    }

    .grid > *:nth-child(3) {
        animation-delay: 0.3s;
    }
</style>
