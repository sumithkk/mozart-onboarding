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
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-white">Lightning Fast</h3>
                                <p class="text-sm text-white">Get started in seconds</p>
                            </div>
                        </div>

                        <div class="flex items-center space-x-3">
                            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-white">14-Day Free Trial</h3>
                                <p class="text-sm text-white">No credit card required</p>
                            </div>
                        </div>

                        <div class="flex items-center space-x-3">
                            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-white">Enterprise Security</h3>
                                <p class="text-sm text-white">Your data is protected</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Section - Login Form -->
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
                        <h2 class="mb-6 text-3xl font-bold text-black dark:text-white">Sign in</h2>
                    </div>

                <!-- Login Form -->
                <div class="space-y-6">
                    <!-- Social Sign In Buttons -->
                    <div class="space-y-3">
                        <!-- Google Sign In -->
                        <button
                            type="button"
                            @click="handleGoogleLogin"
                            :disabled="isGoogleLoading || isAppleLoading"
                            class="flex h-12 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-mozart-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                        >
                            <svg v-if="!isGoogleLoading" class="mr-3 h-5 w-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <svg v-if="isGoogleLoading" class="mr-3 h-5 w-5 animate-spin text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{{ isGoogleLoading ? "Signing in..." : "Continue with Google" }}</span>
                        </button>

                        <!-- Apple Sign In -->
                        <button
                            type="button"
                            @click="handleAppleLogin"
                            :disabled="isGoogleLoading || isAppleLoading"
                            class="flex h-12 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-mozart-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                        >
                            <svg v-if="!isAppleLoading" class="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                            <svg v-if="isAppleLoading" class="mr-3 h-5 w-5 animate-spin text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{{ isAppleLoading ? "Signing in..." : "Continue with Apple" }}</span>
                        </button>
                    </div>

                    <!-- Divider -->
                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div class="relative flex justify-center text-sm">
                            <span class="bg-white px-4 text-gray-500 dark:bg-gray-900 dark:text-gray-400">OR</span>
                        </div>
                    </div>

                    <!-- Login Form -->
                    <form @submit.prevent="submit" class="space-y-4">
                        <!-- Email Field -->
                        <div>
                            <label for="email" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">User name or email address</label>
                            <input
                                type="text"
                                id="email"
                                v-model="email"
                                @input="checkNotEmpty('email')"
                                @blur="validateEmail"
                                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 transition-all duration-200 placeholder:text-gray-500 focus:border-mozart-blue focus:ring-2 focus:ring-mozart-blue focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-mozart-blue-500 dark:focus:ring-mozart-blue-500"
                                :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500': emailError }"
                                placeholder="Enter your email or username"
                                autocomplete="username"
                                required
                                ref="emailInput"
                            />
                            <p v-if="emailError" class="mt-2 text-sm text-red-500 dark:text-red-400">{{ emailError }}</p>
                        </div>

                        <!-- Password Field -->
                        <div>
                            <label for="password" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Your password</label>
                            <div class="relative">
                                <input
                                    :type="passwordVisibility ? 'text' : 'password'"
                                    id="password"
                                    v-model="password"
                                    @input="checkNotEmpty('password')"
                                    @blur="validatePasswordField"
                                    class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-base text-gray-900 transition-all duration-200 placeholder:text-gray-500 focus:border-mozart-blue focus:ring-2 focus:ring-mozart-blue focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-mozart-blue-500 dark:focus:ring-mozart-blue-500"
                                    :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500': passwordError }"
                                    placeholder="Enter your password"
                                    autocomplete="current-password"
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

                        <!-- Forgot Password Link -->
                        <div class="text-right">
                            <NuxtLink to="/auth/forgotPassword" class="text-sm font-medium text-mozart-blue transition-colors hover:text-mozart-blue-800 dark:text-mozart-blue-600 dark:hover:text-mozart-blue-700">Forget your password</NuxtLink>
                        </div>

                        <!-- Sign In Button -->
                        <button type="submit" :disabled="isLoading || isGoogleLoading || isAppleLoading" class="h-12 w-full rounded-lg bg-mozart-blue px-4 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-mozart-blue-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-mozart-blue dark:hover:bg-mozart-blue-700">
                            <span v-if="isLoading" class="flex items-center justify-center">
                                <svg class="mr-3 -ml-1 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </span>
                            <span v-else>Sign in</span>
                        </button>
                    </form>
                </div>

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
    import { ref, onMounted, onBeforeUnmount } from "vue"
    import { verifyEmail, validatePassword } from "~/util"
    import eventBus from "~/util/eventBus"
    import { signIn } from "@/services/better-auth"

    // Extend Window interface for third-party scripts
    declare global {
        interface Window {
            handleGoogleCredentialResponse: (response: any) => Promise<void>
            AppleID: {
                auth: {
                    init: (config: any) => void
                    signIn: () => Promise<any>
                }
            }
        }
    }

    // ------------------------| Page Meta |----------------------------
    useHead({
        title: "Login",
    })

    // ------------------------| Refs |----------------------------
    const email = ref("")
    const password = ref("")
    const passwordVisibility = ref(false)
    const isLoading = ref(false)
    const isGoogleLoading = ref(false)
    const isAppleLoading = ref(false)
    const stayLoggedIn = ref(false)
    const emailError = ref("")
    const passwordError = ref<string | string[]>("")
    const emailInput = ref<HTMLInputElement>()
    const authCallbackURL = useAdmin().authCallbackURL

    // Track window size for mobile detection
    const rawWindowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1000)
    const windowWidth = computed(() => rawWindowWidth.value)
    const mobileWidthThreshold = 768
    const isMobile = computed(() => windowWidth.value < mobileWidthThreshold)

    const route = useRoute()
    const router = useRouter()

    // ------------------------| Functions |----------------------------
    const checkNotEmpty = (field: string) => {
        const inputValue = field === "email" ? email.value : password.value
        const inputElement = document.getElementById(field) as HTMLInputElement
        if (!inputElement) return

        // Check both the reactive value and the actual DOM value
        const hasValue = inputValue || inputElement.value
        if (hasValue && hasValue.trim() !== "") {
            inputElement.classList.add("notEmpty")
        } else {
            inputElement.classList.remove("notEmpty")
        }
    }

    const validateEmail = () => {
        if (!email.value.trim()) {
            emailError.value = "Email is required"
        } else if (!verifyEmail(email.value)) {
            emailError.value = "Please enter a valid email address"
        } else {
            emailError.value = ""
        }
    }

    const validatePasswordField = () => {
        if (!password.value.trim()) {
            passwordError.value = "Password is required"
        } else {
            const _validatePassword = validatePassword(password.value)
            if (!_validatePassword.acceptable) {
                passwordError.value = _validatePassword.errorList
            } else {
                passwordError.value = ""
            }
        }
    }

    const togglePasswordVisibility = () => {
        passwordVisibility.value = !passwordVisibility.value
    }

    const submit = async () => {
        isLoading.value = true

        // Always run validation on submit
        validateEmail()
        validatePasswordField()

        if (!emailError.value && (!passwordError.value || (Array.isArray(passwordError.value) && passwordError.value.length === 0))) {
            try {
                const nextFromQuery = (route.query?.next as string) || ""
                const nextFromStore = sessionStorage.getItem("postLoginRedirect") || ""
                const next = nextFromQuery || nextFromStore

                if (next) {
                    sessionStorage.removeItem("postLoginRedirect")
                }

                console.log("[Auth] Logging in...")
                const result = await signIn.email({
                    email: email.value,
                    password: password.value,
                    callbackURL: next || "/workbench/files",
                })

                if (result?.error) {
                    console.error("[Auth] Login failed:", result.error)
                    eventBus.emit("showToast", {
                        message: result.error.message || "Login failed",
                        _type: "error",
                    })
                } else {
                    console.log("[Auth] ✅ Login successful, redirecting...")
                }
            } catch (e: any) {
                console.error("[Auth] Login error:", e)
                eventBus.emit("showToast", {
                    message: e?.message || "Login failed",
                    _type: "error",
                })
            }
        }

        isLoading.value = false
    }

    // Check all inputs on mount to handle pre-filled values
    const checkAllInputsOnMount = () => {
        // Check email field
        const emailInput = document.getElementById("email") as HTMLInputElement
        if (emailInput && emailInput.value) {
            emailInput.classList.add("notEmpty")
        }

        // Check password field
        const passwordInput = document.getElementById("password") as HTMLInputElement
        if (passwordInput && passwordInput.value) {
            passwordInput.classList.add("notEmpty")
        }
    }

    // Handle Google Credential Response
    const handleGoogleLogin = async () => {
        isGoogleLoading.value = true
        try {
            await signIn.social({
                provider: "google",
                callbackURL: authCallbackURL,
            })
        } catch (e: any) {
            console.error("[Auth] Google login error:", e)
            eventBus.emit("showToast", {
                message: e?.message || "Google sign-in failed",
                _type: "error",
            })
        } finally {
            isGoogleLoading.value = false
        }
    }

    // Handle Apple Sign-In Response
    const handleAppleLogin = async () => {
        isAppleLoading.value = true
        try {
            await signIn.social({
                provider: "apple",
                callbackURL: authCallbackURL,
            })
        } catch (error: any) {
            console.error("[Auth] Apple login error:", error)
            eventBus.emit("showToast", {
                message: "Apple Sign-In failed. Please try again.",
                _type: "error",
            })
        } finally {
            isAppleLoading.value = false
        }
    }

    // Window resize -> update width
    function handleResize() {
        rawWindowWidth.value = window.innerWidth
    }

    // Initialize Sign-In Buttons
    onMounted(() => {
        rawWindowWidth.value = window.innerWidth
        window.addEventListener("resize", handleResize)

        // Check inputs immediately and after a short delay to handle autocomplete
        checkAllInputsOnMount()
        setTimeout(checkAllInputsOnMount, 100)
        setTimeout(checkAllInputsOnMount, 500)
    })

    onBeforeUnmount(() => {
        window.removeEventListener("resize", handleResize)
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

    /* Custom Google button styling to match theme */
    .g_id_signin {
        border-radius: 8px !important;
        height: 48px !important;
    }

    /* Smooth transitions for specific elements only */
    button,
    input,
    a {
        transition: all 0.2s ease-in-out;
    }

    /* Ensure all clickable elements are properly interactive */
    button,
    a,
    label[for],
    input[type="checkbox"] {
        pointer-events: auto;
        cursor: pointer;
    }

    /* Fix for button and link accessibility */
    button:focus,
    a:focus,
    input:focus {
        outline: 2px solid #2844A4;
        outline-offset: 2px;
    }
</style>
