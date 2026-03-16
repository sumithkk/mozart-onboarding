<template>
    <div class="bg-background flex min-h-screen items-center justify-center p-6">
        <div class="bg-card border-border w-full max-w-md rounded-xl border p-6 text-center shadow">
            <h2 class="text-foreground mb-2 text-xl font-semibold">Email Verification</h2>
            <p class="text-muted-foreground mb-4" v-if="status === 'idle'">Preparing verification...</p>
            <div v-else-if="status === 'verifying'" class="flex flex-col items-center space-y-3">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p class="text-muted-foreground">Verifying your email...</p>
            </div>
            <p class="text-muted-foreground mb-4" v-else-if="status === 'success'">Your email has been verified. Redirecting...</p>
            <p class="text-destructive mb-4" v-else-if="status === 'error'">{{ errorMessage }}</p>
            <div v-if="status === 'error'" class="space-y-3">
                <NuxtLink to="/auth/login" class="text-primary">Go to Login</NuxtLink>
                <div class="text-sm text-muted-foreground" v-if="tokenExpired">
                    Link expired. You can resend a new verification email.
                </div>
                <div class="space-y-2">
                    <button
                        class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
                        :disabled="resendPending"
                        @click="handleResend"
                    >
                        {{ resendPending ? 'Sending...' : 'Resend verification email' }}
                    </button>
                    <div v-if="showEmailInput" class="space-y-2">
                        <input
                            v-model="resendEmail"
                            type="email"
                            class="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
                            placeholder="Enter your email"
                        />
                        <button
                            class="bg-secondary text-secondary-foreground hover:bg-secondary/90 inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
                            :disabled="resendPending || !resendEmail"
                            @click="handleResend"
                        >
                            {{ resendPending ? 'Sending...' : 'Send' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { verifyEmail, sendVerificationEmail } from "@/services/better-auth"
    import eventBus from "~/util/eventBus"

    useHead({ title: "Verify Email" })

    const route = useRoute()
    const router = useRouter()

    const status = ref<"idle" | "verifying" | "success" | "error">("idle")
    const errorMessage = ref("")
    const tokenExpired = ref(false)
    const resendPending = ref(false)
    const showEmailInput = ref(false)
    const resendEmail = ref("")

    onMounted(async () => {
        const token =
            ((route.query.token as string) ||
                (route.query.code as string) ||
                "")
        if (!token) {
            status.value = "error"
            errorMessage.value = "Verification token is missing."
            return
        }
        status.value = "verifying"
        try {
            const result = await verifyEmail({
                query: { token },
            })
            if (result.error) {
                status.value = "error"
                errorMessage.value = result.error.message || "Verification failed"
                tokenExpired.value = /expired/i.test(errorMessage.value) ||
                    (result.error as any)?.status === 410
                eventBus.emit("showToast", { message: errorMessage.value, _type: "error" })
                return
            }
            status.value = "success"
            eventBus.emit("showToast", { message: "Email verified successfully", _type: "success" })
            // Give a moment for session cookie to be set by server
            setTimeout(async () => {
                await useUserStore().hydrateFromBetterAuth()
                const userPermission = useUserPermissionStore()
                const role = useUserStore().role || "basic"
                const defaultRoute = userPermission.permissions[role]?.defaultRoute || "/compose"
                router.push(defaultRoute)
            }, 800)
        } catch (e: any) {
            status.value = "error"
            errorMessage.value = e?.message || "Verification failed"
            tokenExpired.value = /expired/i.test(errorMessage.value)
            eventBus.emit("showToast", { message: errorMessage.value, _type: "error" })
        }
    })

    const handleResend = async () => {
        if (resendPending.value) return
        resendPending.value = true
        try {
            let result: any
            if (resendEmail.value) {
                result = await (sendVerificationEmail as any)({
                    body: { email: resendEmail.value },
                })
            } else {
                result = await (sendVerificationEmail as any)()
            }
            if (result?.error) {
                if ((result.error as any)?.status === 401) {
                    showEmailInput.value = true
                }
                throw new Error(result.error.message || "Failed to resend email")
            }
            eventBus.emit("showToast", {
                message: "Verification email sent",
                _type: "success",
            })
        } catch (e: any) {
            showEmailInput.value = true
            eventBus.emit("showToast", {
                message: e?.message || "Failed to resend email",
                _type: "error",
            })
        } finally {
            resendPending.value = false
        }
    }
</script>

<style scoped></style>