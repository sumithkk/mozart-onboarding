<template>
    <!-- Overlay -->
    <div v-if="show" class="fixed inset-0 z-[11000] flex items-center justify-center bg-black/50 backdrop-blur-sm" @click="emitClose">
        <!-- Modal Container -->
        <div class="bg-backgroundColor text-textColor m-4 w-[400px] rounded-md p-5 shadow-lg" @click.stop>
            <!-- Header -->
            <div class="mb-8 flex items-center justify-between">
                <div class="text-xl font-semibold">{{ title }}</div>
                <div v-if="closeOnTopRight" class="cursor-pointer text-2xl" @click="emitClose">
                    <div class="materialSymbolsOutlined">close</div>
                </div>
            </div>

            <!-- Subtitle -->
            <div class="text-muted-foreground mb-8 text-base font-light">{{ subtitle }}</div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Name Field -->
                <div class="flex flex-col">
                    <label for="name" class="text-textColor mb-2 text-sm font-medium">Name</label>
                    <input
                        type="text"
                        id="name"
                        v-model="formData.name"
                        @blur="validateField('name')"
                        class="border-strokeColor bg-sideBarBackgroundColor text-textColor focus:border-focusBorderColor focus:bg-focusBackgroundColor w-full rounded border p-2.5 focus:shadow-[0_0_0_2px_var(--focusBorderShadowColor)] focus:outline-none"
                        :class="{ 'border-destructive/40 focus:border-destructive': inputError.name }"
                        placeholder="Enter your full name"
                    />
                    <p v-if="inputError.name" class="text-destructive mt-2 text-sm">
                        {{ inputError.name }}
                    </p>
                </div>

                <!-- Email Field -->
                <div class="flex flex-col">
                    <label for="email" class="text-textColor mb-2 text-sm font-medium">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        v-model="formData.email"
                        @blur="validateField('email')"
                        class="border-strokeColor bg-sideBarBackgroundColor text-textColor focus:border-focusBorderColor focus:bg-focusBackgroundColor w-full rounded border p-2.5 focus:shadow-[0_0_0_2px_var(--focusBorderShadowColor)] focus:outline-none"
                        :class="{ 'border-destructive/40 focus:border-destructive': inputError.email }"
                        placeholder="Enter your email address"
                    />
                    <p v-if="inputError.email" class="text-destructive mt-2 text-sm">
                        {{ inputError.email }}
                    </p>
                </div>

                <!-- Footer -->
                <div class="flex w-full items-center justify-center gap-3">
                    <button type="button" class="bg-itemColor w-full cursor-pointer rounded border-0 px-4 py-2 text-white" @click="emitClose" :disabled="isLoading">Cancel</button>
                    <button type="submit" class="w-full cursor-pointer rounded border-0 px-4 py-2 text-white" :style="{ backgroundColor: confirmButtonColor }" :disabled="isLoading">
                        <span v-if="isLoading" class="flex items-center justify-center">
                            <svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Joining...
                        </span>
                        <span v-else>{{ confirmButtonText }}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from "vue"
    import { verifyEmail } from "~/util"

    interface WaitlistFormData {
        name: string
        email: string
    }

    const props = defineProps({
        show: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
            default: "Join the Waitlist",
        },
        subtitle: {
            type: String,
            default: "Be the first to know when we launch new features!",
        },
        confirmButtonText: {
            type: String,
            default: "Join Waitlist",
        },
        confirmButtonColor: {
            type: String,
            default: "#3b82f6", // blue-500
        },
        closeOnTopRight: {
            type: Boolean,
            default: true,
        },
    })

    const emit = defineEmits<{
        (e: "close"): void
        (e: "submit", data: WaitlistFormData): void
    }>()

    const isLoading = ref(false)
    const formData = ref<WaitlistFormData>({
        name: "",
        email: "",
    })

    const inputError = ref<Record<string, string>>({
        name: "",
        email: "",
    })

    const validateField = (field: string) => {
        const value = formData.value[field as keyof WaitlistFormData]

        if (field === "email") {
            if (!value.trim()) {
                inputError.value[field] = "Email is required"
            } else if (!verifyEmail(value)) {
                inputError.value[field] = "Please enter a valid email address"
            } else {
                inputError.value[field] = ""
            }
        } else if (field === "name") {
            if (!value.trim()) {
                inputError.value[field] = "Name is required"
            } else if (value.trim().length < 2) {
                inputError.value[field] = "Name must be at least 2 characters"
            } else {
                inputError.value[field] = ""
            }
        }
    }

    const handleSubmit = async () => {
        // Validate all fields
        validateField("name")
        validateField("email")

        // Check if there are any errors
        const hasErrors = Object.values(inputError.value).some((error) => error !== "")

        if (hasErrors) {
            return
        }

        isLoading.value = true
        try {
            emit("submit", { ...formData.value })
        } finally {
            isLoading.value = false
            emitClose()
        }
    }

    const emitClose = () => {
        // Reset form when closing
        formData.value = {
            name: "",
            email: "",
        }
        inputError.value = {
            name: "",
            email: "",
        }
        emit("close")
    }
</script>
