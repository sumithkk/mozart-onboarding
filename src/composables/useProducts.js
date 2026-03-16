// composables/useProducts.js
export const useProducts = () => {
    const products = ref([])
    const loading = ref(false)
    const error = ref(null)
    const { getAllProducts } = useStripePayment()

    // Fetch all products
    const fetchProducts = async () => {
        loading.value = true
        error.value = null

        try {
            const response = await getAllProducts()
            if (response.status === "success" && response.data) {
                products.value = response.data.map((product) => ({
                    ...product,
                    // Add computed properties for easier use
                    formattedPrice: product.prices?.[0] ? `$${(product.prices[0].unit_amount / 100).toFixed(0)}` : "Free",
                    interval: product.prices?.[0]?.recurring?.interval || "month",
                    isPopular: product.name.toLowerCase().includes("pro") || product.name.toLowerCase().includes("plus"),
                }))
            } else {
                throw new Error(response.message || "Failed to fetch products")
            }
        } catch (err) {
            error.value = err.message || "An error occurred while fetching products"
            console.error("Error fetching products:", err)
        } finally {
            loading.value = false
        }
    }

    // Get product by ID
    const getProductById = (id) => {
        return products.value.find((product) => product.id === id)
    }

    // Filter products by criteria
    const filterProducts = (criteria) => {
        return products.value.filter((product) => {
            if (criteria.name) {
                return product.name.toLowerCase().includes(criteria.name.toLowerCase())
            }
            if (criteria.priceRange) {
                const price = product.prices?.[0]?.unit_amount || 0
                return price >= criteria.priceRange.min && price <= criteria.priceRange.max
            }
            return true
        })
    }

    // Sort products
    const sortProducts = (sortBy = "price", order = "asc") => {
        const sorted = [...products.value].sort((a, b) => {
            let aValue, bValue

            switch (sortBy) {
                case "price":
                    aValue = a.prices?.[0]?.unit_amount || 0
                    bValue = b.prices?.[0]?.unit_amount || 0
                    break
                case "name":
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
                    break
                case "created":
                    aValue = a.created
                    bValue = b.created
                    break
                default:
                    return 0
            }

            if (order === "desc") {
                return bValue > aValue ? 1 : -1
            }
            return aValue > bValue ? 1 : -1
        })

        products.value = sorted
    }

    // Format price utility
    const formatPrice = (amount, currency = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount / 100)
    }

    // Format date utility
    const formatDate = (timestamp, options = {}) => {
        const defaultOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",
        }

        return new Date(timestamp * 1000).toLocaleDateString("en-US", {
            ...defaultOptions,
            ...options,
        })
    }

    // Calculate savings for yearly plans
    const calculateSavings = (monthlyPrice, yearlyPrice) => {
        const monthlyCost = (monthlyPrice * 12) / 100
        const yearlyCost = yearlyPrice / 100
        const savings = monthlyCost - yearlyCost
        const percentage = Math.round((savings / monthlyCost) * 100)

        return {
            amount: savings,
            percentage,
            formatted: formatPrice(savings * 100),
        }
    }

    return {
        // State
        products: readonly(products),
        loading: readonly(loading),
        error: readonly(error),

        // Methods
        fetchProducts,
        getProductById,
        filterProducts,
        sortProducts,

        // Utilities
        formatPrice,
        formatDate,
        calculateSavings,
    }
}
