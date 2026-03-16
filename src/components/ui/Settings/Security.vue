<template>
    <div class="m-12 flex flex-col-reverse justify-between gap-6 sm:flex-row sm:gap-20">
        <div class="w-full md:w-1/2">
            <div class="bg-sideBarBackgroundColor rounded-lg px-8 py-10 pt-8 shadow-md">
                <!-- Form header Buttons -->
                <FormHeader title="Change Passcode" :handleAction="handleSaveButtonClick" :loaderStatus="passwordLoader" buttonText="Update" />

                <div class="flex flex-col gap-4">
                    <!-- Password -->
                    <div class="flex items-center">
                        <SimpleInputV2 type="password" label="Password" :defaultValue="password" v-model="password" placeholderValue="Enter passcode" />
                    </div>

                    <!-- Confirm Password -->
                    <div class="flex items-center">
                        <SimpleInputV2 type="password" label="Confirm password" :defaultValue="confirmPassword" v-model="confirmPassword" placeholderValue="Enter your confirm passcode" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from "vue"
    import eventBus from "~/util/eventBus"

    const passwordLoader = ref(false)
    const user = useUser()
    const password = ref("")
    const confirmPassword = ref("")

    const handleSaveButtonClick = async () => {
        const trimPassword = password.value?.trim() || ""
        const trimConfirmPassword = confirmPassword.value?.trim() || ""

        // form validation
        if (!trimPassword || !trimConfirmPassword) {
            eventBus.emit("showToast", {
                message: "Password and Confirm Password cannot be empty",
                _type: "error",
            })
            return
        } else if (trimPassword !== trimConfirmPassword) {
            console.log({ pp: password.value, cc: confirmPassword.value })
            eventBus.emit("showToast", {
                message: "Password and Confirm Password do not match",
                _type: "error",
            })
            return
        } else if (trimPassword.length < 5) {
            eventBus.emit("showToast", {
                message: "Password must be at least 5 characters long",
                _type: "error",
            })
            return
        }
        const payload = {
            password: trimPassword,
            isFromSettingsPage: true,
        }
        try {
            passwordLoader.value = true
            const res = await user.updatePasswordViaRestToken(payload)
            console.log("Profile Updated", res)
            password.value = ""
            confirmPassword.value = ""
        } catch (error) {
            console.log(error)
        } finally {
            passwordLoader.value = false
        }
    }
</script>
