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
                                <h3 class="font-semibold text-white">Secure Password</h3>
                                <p class="text-sm text-white">Create a strong password</p>
                            </div>
                        </div>

                        <div class="flex items-center space-x-3">
                            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-white">Protected Account</h3>
                                <p class="text-sm text-white">Your data stays safe</p>
                            </div>
                        </div>

                        <div class="flex items-center space-x-3">
                            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-white">Quick Access</h3>
                                <p class="text-sm text-white">Get back to work instantly</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Section - Reset Password Form -->
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
                        <h2 class="mb-4 text-3xl font-bold text-black dark:text-white">Create new password</h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Enter a strong password to secure your account</p>
                    </div>

                <!-- Form -->
                <form class="space-y-6" @submit.prevent="submit">
                    <!-- Password Field -->
                    <div>
                        <label for="password" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">New password</label>
                        <div class="relative">
                            <input
                                :type="passwordVisibility ? 'text' : 'password'"
                                id="password"
                                v-model="password"
                                @blur="validatePasswordField"
                                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-base text-gray-900 transition-all duration-200 placeholder:text-gray-500 focus:border-mozart-blue focus:ring-2 focus:ring-mozart-blue focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-mozart-blue-500 dark:focus:ring-mozart-blue-500"
                                :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500': passwordError }"
                                placeholder="Enter your new password"
                                autocomplete="new-password"
                                required
                            />
                            <button type="button" @click="togglePasswordVisibility" class="absolute top-1/2 right-3 -translate-y-1/2 transform rounded p-1 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300" aria-label="Toggle password visibility">
                                <svg v-if="passwordVisibility" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                                </svg>
                                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                            </button>
                        </div>
                        <div v-if="passwordError && Array.isArray(passwordError)" class="mt-2">
                            <ul class="space-y-1 text-sm text-red-500 dark:text-red-400">
                                <li v-for="(missing, index) in passwordError" :key="index" class="flex items-center">
                                    <svg class="mr-2 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                                    </svg>
                                    {{ missing }}
                                </li>
                            </ul>
                        </div>
                        <p v-else-if="passwordError" class="mt-2 text-sm text-red-500 dark:text-red-400">{{ passwordError }}</p>
                    </div>

                    <!-- Confirm Password Field -->
                    <div>
                        <label for="confirmPassword" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm password</label>
                        <div class="relative">
                            <input
                                :type="passwordVisibility ? 'text' : 'password'"
                                id="confirmPassword"
                                v-model="confirmPassword"
                                @blur="validateConfirmPassword"
                                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 transition-all duration-200 placeholder:text-gray-500 focus:border-mozart-blue focus:ring-2 focus:ring-mozart-blue focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-mozart-blue-500 dark:focus:ring-mozart-blue-500"
                                :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500': confirmPasswordError }"
                                placeholder="Re-enter your password"
                                autocomplete="new-password"
                                required
                            />
                        </div>
                        <p v-if="confirmPasswordError" class="mt-2 text-sm text-red-500 dark:text-red-400">{{ confirmPasswordError }}</p>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" :disabled="isLoading" class="h-12 w-full rounded-lg bg-mozart-blue px-4 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-mozart-blue-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-mozart-blue dark:hover:bg-mozart-blue-700">
                        <span v-if="isLoading" class="flex items-center justify-center">
                            <svg class="mr-3 -ml-1 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Resetting password...
                        </span>
                        <span v-else>Reset password</span>
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
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from "vue"
    import { validatePassword } from "~/util"
    import { resetPassword } from "@/services/better-auth"
    import eventBus from "~/util/eventBus"

    // ------------------------| Params |----------------------------
    const resetPasswordToken = useRoute().params.resetPasswordToken as string

    // ------------------------| Page Meta |----------------------------
    useHead({ title: "Reset Password" })

    // ------------------------| Refs |----------------------------
    const password = ref("")
    const confirmPassword = ref("")
    const passwordVisibility = ref(false)
    const isLoading = ref(false)
    const passwordError = ref<string | string[]>("")
    const confirmPasswordError = ref("")

    // ------------------------| Functions |----------------------------
    const togglePasswordVisibility = () => {
        passwordVisibility.value = !passwordVisibility.value
    }

    const validatePasswordField = () => {
        if (!password.value.trim()) {
            passwordError.value = "Password is required"
            return false
        } else {
            const pwValidation = validatePassword(password.value)
            if (!pwValidation.acceptable) {
                passwordError.value = pwValidation.errorList
                return false
            } else {
                passwordError.value = ""
                return true
            }
        }
    }

    const validateConfirmPassword = () => {
        if (!confirmPassword.value.trim()) {
            confirmPasswordError.value = "Please confirm your password"
            return false
        } else if (password.value !== confirmPassword.value) {
            confirmPasswordError.value = "Passwords do not match"
            return false
        } else {
            confirmPasswordError.value = ""
            return true
        }
    }

    // ------------------------| Submit Handler |-----------------------
    const submit = async () => {
        isLoading.value = true

        // Validate both fields
        const isPasswordValid = validatePasswordField()
        const isConfirmValid = validateConfirmPassword()

        if (!isPasswordValid || !isConfirmValid) {
            isLoading.value = false
            return
        }

        const result = await resetPassword({ newPassword: password.value, token: resetPasswordToken })

        if (result.error) {
            eventBus.emit("showToast", {
                message: result.error.message || "Failed to reset password",
                _type: "error",
            })
        } else {
            eventBus.emit("showToast", {
                message: "Password reset successful! Redirecting to login...",
                _type: "success",
            })
            setTimeout(() => {
                useRouter().push("/auth/login")
            }, 2000)
        }

        isLoading.value = false
    }
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
