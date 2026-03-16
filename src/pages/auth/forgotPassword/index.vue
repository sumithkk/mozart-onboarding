<template>
    <div class="flex min-h-screen">
        <!-- Left Section - Branding -->
        <div class="relative hidden overflow-hidden bg-gradient-to-br from-mozart-blue to-mozart-blue-800 lg:flex lg:w-2/5">
            <!-- Background Pattern -->
            <div class="absolute inset-0 opacity-10">
                <div class="absolute top-20 left-20 h-72 w-72 rounded-full bg-white blur-3xl"></div>
                <div class="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
            </div>

            <div class="relative z-10 flex h-full w-full items-center px-16 py-12">
                <div class="max-w-md">
                    <!-- Logo/Brand -->
                    <div class="mb-8">
                        <h1 class="mb-2 text-4xl font-bold text-white">Mozart</h1>
                        <p class="text-lg text-white">Your AI-powered workspace</p>
                    </div>

                    <!-- Hero Content -->
                    <div class="space-y-6">
                        <div class="flex items-center space-x-3">
                            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-white">Secure Reset</h3>
                                <p class="text-sm text-white">We'll send you a secure link</p>
                            </div>
                        </div>

                        <div class="flex items-center space-x-3">
                            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-white">Quick & Easy</h3>
                                <p class="text-sm text-white">Reset your password in seconds</p>
                            </div>
                        </div>

                        <div class="flex items-center space-x-3">
                            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-white">Check Your Email</h3>
                                <p class="text-sm text-white">Instructions sent instantly</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Section - Forgot Password Form -->
        <div class="flex flex-1 flex-col bg-white dark:bg-gray-900">
            <!-- Mobile Header with Logo - Only visible on mobile -->
            <div class="flex items-center border-b border-gray-200 px-4 py-4 lg:hidden dark:border-gray-700">
                <h1 class="text-2xl font-bold text-mozart-blue">Mozart</h1>
            </div>
            
            <!-- Form Container -->
            <div class="flex flex-1 items-center justify-center px-3 sm:px-6 lg:px-8">
                <div class="w-full max-w-md">
                    <!-- Header -->
                    <div class="mb-8 text-center">
                        <h2 class="mb-4 text-3xl font-bold text-black dark:text-white">Reset your password</h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Enter your email address and we'll send you instructions to reset your password</p>
                    </div>

                <!-- Form -->
                <form class="space-y-6" @submit.prevent="submit">
                    <!-- Email Field -->
                    <div>
                        <label for="email" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                        <input
                            ref="emailInput"
                            id="email"
                            v-model="email"
                            type="email"
                            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 transition-all duration-200 placeholder:text-gray-500 focus:border-mozart-blue focus:ring-2 focus:ring-mozart-blue focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-mozart-blue-500 dark:focus:ring-mozart-blue-500"
                            :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500': emailError }"
                            placeholder="Enter your email address"
                            required
                            autocomplete="email"
                        />
                        <p v-if="emailError" class="mt-2 text-sm text-red-500 dark:text-red-400">{{ emailError }}</p>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" :disabled="isLoading" class="h-12 w-full rounded-lg bg-mozart-blue px-4 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-mozart-blue-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-mozart-blue dark:hover:bg-mozart-blue-700">
                        <span v-if="isLoading" class="flex items-center justify-center">
                            <svg class="mr-3 -ml-1 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending reset link...
                        </span>
                        <span v-else>Send reset link</span>
                    </button>

                    <!-- Back to Login -->
                    <div class="text-center">
                        <NuxtLink to="/auth/login" class="text-sm font-medium text-mozart-blue transition-colors hover:text-mozart-blue-800 dark:text-mozart-blue-600 dark:hover:text-mozart-blue-700">
                            <span class="inline-flex items-center">
                                <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                </svg>
                                Back to sign in
                            </span>
                        </NuxtLink>
                    </div>
                </form>

                <!-- Footer -->
                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?
                        <NuxtLink to="/auth/signUp" class="font-semibold text-mozart-blue transition-colors hover:text-mozart-blue-800 dark:text-mozart-blue-600 dark:hover:text-mozart-blue-700"> Sign up </NuxtLink>
                    </p>
                </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from "vue"
    import eventBus from "~/util/eventBus"
    import { verifyEmail } from "~/util"
    import { requestPasswordReset } from "@/services/better-auth"

    // ------------------------| Page Meta |----------------------------
    useHead({ title: "Forgot Password" })

    // ------------------------| Refs |----------------------------
    const email = ref("")
    const emailError = ref("")
    const isLoading = ref(false)
    const emailInput = ref<HTMLInputElement | null>(null)

    // ------------------------| Validation |----------------------------
    const validateEmail = () => {
        if (!email.value.trim()) {
            emailError.value = "Email is required"
            return false
        } else if (!verifyEmail(email.value)) {
            emailError.value = "Please enter a valid email address"
            return false
        } else {
            emailError.value = ""
            return true
        }
    }

    // ------------------------| Submit Handler |-----------------------
    const submit = async () => {
        isLoading.value = true

        // Validate email
        if (!validateEmail()) {
            isLoading.value = false
            return
        }

        const result = await requestPasswordReset({ email: email.value })

        if (result.error) {
            emailError.value = result.error.message || "Failed to request password reset"
            eventBus.emit("showToast", {
                message: result.error.message || "Failed to request password reset",
                _type: "error",
            })
        } else {
            eventBus.emit("showToast", {
                message: "Please check your email for a password reset link",
                _type: "success",
            })
            setTimeout(() => {
                useRouter().push("/auth/login")
            }, 2000)
        }

        isLoading.value = false
    }

    // ------------------------| Lifecycle |----------------------------
    onMounted(() => {
        const emailFromLocalStorage = localStorage.getItem("email")
        if (emailFromLocalStorage) {
            email.value = emailFromLocalStorage
        }
        emailInput.value?.focus()
    })
</script>

<style scoped>
    /* Smooth fade-in animation for form */
    form {
        animation: fadeInUp 0.6s ease-out;
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

    /* Focus styles for better UX */
    input:focus {
        outline: none;
    }

    /* Smooth transitions for specific elements only */
    button,
    input,
    a {
        transition: all 0.2s ease-in-out;
    }

    /* Ensure all clickable elements are properly interactive */
    button,
    a {
        pointer-events: auto;
        cursor: pointer;
    }

    /* Fix for button and link accessibility */
    button:focus,
    a:focus,
    input:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
    }
</style>
