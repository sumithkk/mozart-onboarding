<template>
    <div class="mx-auto max-w-xl p-8">
        <h2 class="mb-4 text-2xl font-bold">Better-Auth Test</h2>

        <!-- Login Test -->
        <div class="mb-8 rounded border p-4">
            <h3 class="mb-2 text-lg font-semibold">Login Test</h3>
            <input type="text" v-model="email" placeholder="Email" class="mb-2 w-full rounded border p-2" />
            <input type="password" v-model="password" placeholder="Password" class="mb-2 w-full rounded border p-2" />
            <button @click="testLogin" class="w-full rounded bg-blue-500 p-2 text-white">Test Login</button>
        </div>

        <!-- Signup Test -->
        <div class="mb-8 rounded border p-4">
            <h3 class="mb-2 text-lg font-semibold">Signup Test</h3>
            <input type="text" v-model="signupEmail" placeholder="Email" class="mb-2 w-full rounded border p-2" />
            <input type="password" v-model="signupPassword" placeholder="Password" class="mb-2 w-full rounded border p-2" />
            <input type="text" v-model="firstName" placeholder="First Name" class="mb-2 w-full rounded border p-2" />
            <input type="text" v-model="lastName" placeholder="Last Name" class="mb-2 w-full rounded border p-2" />
            <button @click="testSignup" class="w-full rounded bg-green-500 p-2 text-white">Test Signup</button>
        </div>

        <!-- Session Test -->
        <div class="mb-8 rounded border p-4">
            <h3 class="mb-2 text-lg font-semibold">Session Test</h3>
            <button @click="testSession" class="w-full rounded bg-purple-500 p-2 text-white">Test Session</button>
            <div v-if="sessionData" class="mt-2 rounded bg-gray-100 p-2">
                <pre>{{ JSON.stringify(sessionData, null, 2) }}</pre>
            </div>
        </div>

        <!-- Logout Test -->
        <div class="mb-8 rounded border p-4">
            <h3 class="mb-2 text-lg font-semibold">Logout Test</h3>
            <button @click="testLogout" class="w-full rounded bg-red-500 p-2 text-white">Test Logout</button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { signIn, signUpWithProfile, getSession, signOut, type Session } from "@/services/better-auth"
    import eventBus from "~/util/eventBus"

    const email = ref("")
    const password = ref("")
    const signupEmail = ref("")
    const signupPassword = ref("")
    const firstName = ref("")
    const lastName = ref("")
    const sessionData = ref<Session | null>(null)

    const testLogin = async () => {
        try {
            const result = await signIn.email({
                email: email.value,
                password: password.value,
            })

            if (result.error) {
                eventBus.emit("showToast", {
                    message: result.error.message || "Login failed",
                    _type: "error",
                })
            } else {
                eventBus.emit("showToast", {
                    message: "Login successful!",
                    _type: "success",
                })
                console.log("Login result:", result)
            }
        } catch (e: any) {
            eventBus.emit("showToast", {
                message: e?.message || "Login failed",
                _type: "error",
            })
        }
    }

    const testSignup = async () => {
        try {
            const result = await signUpWithProfile({
                email: signupEmail.value,
                password: signupPassword.value,
                firstName: firstName.value,
                lastName: lastName.value,
                name: firstName.value + " " + lastName.value,
                country: "IN",
                planName: "mozart_individual"
            })

            if (result.error) {
                eventBus.emit("showToast", {
                    message: result.error.message || "Signup failed",
                    _type: "error",
                })
            } else {
                eventBus.emit("showToast", {
                    message: "Signup successful!",
                    _type: "success",
                })
                console.log("Signup result:", result)
            }
        } catch (e: any) {
            eventBus.emit("showToast", {
                message: e?.message || "Signup failed",
                _type: "error",
            })
        }
    }

    const testSession = async () => {
        try {
            const session = await getSession()
            sessionData.value = session?.data ?? null
            console.log("Session:", session)

            if (sessionData.value) {
                eventBus.emit("showToast", {
                    message: "Session retrieved successfully!",
                    _type: "success",
                })
            } else {
                eventBus.emit("showToast", {
                    message: "No active session",
                    _type: "info",
                })
            }
        } catch (e: any) {
            eventBus.emit("showToast", {
                message: e?.message || "Session test failed",
                _type: "error",
            })
        }
    }

    const testLogout = async () => {
        try {
            await signOut()
            sessionData.value = null
            eventBus.emit("showToast", {
                message: "Logout successful!",
                _type: "success",
            })
        } catch (e: any) {
            eventBus.emit("showToast", {
                message: e?.message || "Logout failed",
                _type: "error",
            })
        }
    }
</script>

<style scoped></style>
