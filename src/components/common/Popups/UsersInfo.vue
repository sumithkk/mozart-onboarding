<template>
    <!-- Only show the modal if `show` is true -->
    <div v-if="show" class="bg-background/50 fixed inset-0 z-[1010] flex items-center justify-center backdrop-blur-[2px]">
        <!-- Modal container; click.stop to prevent closing when clicking inside -->
        <div class="bg-backgroundColor text-textColor relative m-[15px] h-[90vh] h-[775px] w-[300px] overflow-scroll rounded-md p-5 shadow-[0_4px_10px_rgba(0,0,0,0.3)]" @click.stop>
            <!-- Header row (close icon) -->
            <div class="mb-6 flex items-center justify-between">
                <!-- If you had an <h3> here, re-insert it if needed -->
                <div class="absolute top-[-10px] right-5 mb-[-1.5rem] cursor-pointer text-2xl" @click="emitClose">
                    <div class="materialSymbolsFilled">close</div>
                </div>
            </div>

            <!-- Large Profile Image -->
            <div class="mb-4 flex w-full items-center justify-center">
                <img class="border-border mt-[-2rem] h-[120px] w-[120px] rounded-full border-4 object-cover" :src="selectedUser.profilePicture" alt="Profile Picture" />
            </div>

            <!-- User Detail Form -->
            <div class="box-border rounded-md p-2.5">
                <form @submit.prevent="saveUser">
                    <!-- Name -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong>Name:</strong>
                            <input type="text" v-model="editUser.name" class="focus:border-focusBorderColor focus:bg-focusBackgroundColor border-strokeColor bg-sideBarBackgroundColor text-textColor box-border w-full rounded border p-2 focus:shadow-[0_0_0_2px_var(--focusBorderShadowColor)] focus:outline-none" />
                        </label>
                    </div>

                    <!-- Email -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong>Email:</strong>
                            <input type="email" v-model="editUser.email" class="focus:border-focusBorderColor focus:bg-focusBackgroundColor border-strokeColor bg-sideBarBackgroundColor text-textColor box-border w-full rounded border p-2 focus:shadow-[0_0_0_2px_var(--focusBorderShadowColor)] focus:outline-none" />
                        </label>
                    </div>

                    <!-- Plan -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong>Plan:</strong>
                            <select v-model="editUser.currentPlan" class="focus:border-focusBorderColor focus:bg-focusBackgroundColor border-strokeColor bg-sideBarBackgroundColor text-textColor box-border w-full rounded border p-2 focus:shadow-[0_0_0_2px_var(--focusBorderShadowColor)] focus:outline-none">
                                <option value="free">Free</option>
                                <option value="basic">Basic</option>
                                <option value="premium">Premium</option>
                            </select>
                        </label>
                    </div>

                    <!-- Role -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong>Role:</strong>
                            <input type="text" v-model="editUser.role" class="focus:border-focusBorderColor focus:bg-focusBackgroundColor border-strokeColor bg-sideBarBackgroundColor text-textColor box-border w-full rounded border p-2 focus:shadow-[0_0_0_2px_var(--focusBorderShadowColor)] focus:outline-none" />
                        </label>
                    </div>

                    <!-- Email Verified checkbox -->
                    <div class="mb-4 flex flex-row items-center">
                        <label class="mr-2">
                            <strong>Email Verified:</strong>
                        </label>
                        <input type="checkbox" v-model="editUser.isEmailVerified" class="form-checkbox border-strokeColor accent-itemColor mt-[-15px] h-4 w-4 cursor-pointer border" />
                    </div>

                    <!-- Phone Verified checkbox -->
                    <div class="mb-4 flex flex-row items-center">
                        <label class="mr-2">
                            <strong>Phone Verified:</strong>
                        </label>
                        <input type="checkbox" v-model="editUser.isPhoneVerified" class="form-checkbox border-strokeColor accent-itemColor h-4 w-4 cursor-pointer border" />
                    </div>

                    <!-- Theme -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong>Theme:</strong>
                            <select v-model="editUser.settings.theme" class="focus:border-focusBorderColor focus:bg-focusBackgroundColor border-strokeColor bg-sideBarBackgroundColor text-textColor box-border w-full rounded border p-2 focus:shadow-[0_0_0_2px_var(--focusBorderShadowColor)] focus:outline-none">
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </label>
                    </div>

                    <!-- Primary Collection -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong>Primary Collection:</strong>
                            <select v-model="editUser.defaultCollection" class="focus:border-focusBorderColor focus:bg-focusBackgroundColor border-strokeColor bg-sideBarBackgroundColor text-textColor box-border w-full rounded border p-2 focus:shadow-[0_0_0_2px_var(--focusBorderShadowColor)] focus:outline-none">
                                <option v-for="collection in collections" :key="collection.name" :value="collection.name">
                                    {{ collection.alias ? collection.alias : collection.name }}
                                </option>
                            </select>
                        </label>
                    </div>

                    <!-- Sign Up Via (disabled) -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong>Sign Up Via:</strong>
                            <input type="text" v-model="editUser.signUpVia" disabled class="border-strokeColor bg-sideBarBackgroundColor text-textColor box-border w-full cursor-not-allowed rounded border p-2" />
                        </label>
                    </div>

                    <!-- Last Login (disabled) -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong>Last Login:</strong>
                            <input type="text" :value="formatDate(editUser.lastLogin)" disabled class="border-strokeColor bg-sideBarBackgroundColor text-textColor box-border w-full cursor-not-allowed rounded border p-2" />
                        </label>
                    </div>

                    <!-- Save Button -->
                    <button type="submit" class="bg-itemColor text-textColor hover:bg-sideBarBackgroundColor mt-2.5 w-full cursor-pointer rounded border-none p-2 text-center text-[16px] transition-all duration-200" @click="buttonClick('confirm')">Save</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    // Props & emits
    import { reactive, defineProps, defineEmits } from "vue"

    interface ICollection {
        name: string
        alias?: string
    }

    const props = defineProps({
        show: Boolean,
        selectedUser: {
            type: Object,
            required: true,
        },
        collections: Array<ICollection>,
    })

    const emit = defineEmits(["update:show", "buttonClick"])

    // State for editing user
    const editUser = reactive({
        userId: props.selectedUser?.userId || "",
        name: props.selectedUser?.name || props.selectedUser?.username || props.selectedUser?.firstName + " " + props.selectedUser?.lastName || "",
        email: props.selectedUser?.email || "",
        currentPlan: props.selectedUser?.currentPlan || "",
        role: props.selectedUser?.role || "",
        defaultCollection: props.selectedUser?.defaultCollection || "",
        isEmailVerified: props.selectedUser?.isEmailVerified || false,
        isPhoneVerified: props.selectedUser?.isPhoneVerified || false,
        settings: {
            theme: props.selectedUser?.settings?.theme || "light",
        },
        signUpVia: props.selectedUser?.signUpVia || "",
        lastLogin: props.selectedUser?.lastLogin || 0,
        personal: props.selectedUser?.personal || false,
        organizationName: props.selectedUser?.organizationName || "",
    })

    // Close modal
    function emitClose() {
        emit("update:show", false)
    }

    // Called on form submit
    function saveUser() {
        emit("update:show", false)
    }

    // Helper to format a timestamp
    function formatDate(timestamp: number) {
        const date = new Date(timestamp)
        return date.toLocaleString()
    }

    // On pressing save, handle the "confirm" action
    const buttonClick = async (button: string) => {
        if (button === "confirm") {
            const usedKeys = determineUsedKeys()
            emit("buttonClick", button, { ...editUser, ...usedKeys })
        }
    }

    // Decide which name fields to update
    function determineUsedKeys() {
        const usedKeys: any = {}

        if (props.selectedUser?.name) {
            usedKeys.name = editUser.name
        } else if (props.selectedUser?.username) {
            usedKeys.username = editUser.name
        } else if (props.selectedUser?.firstName || props.selectedUser?.lastName) {
            usedKeys.firstName = props.selectedUser.firstName || ""
            usedKeys.lastName = props.selectedUser.lastName || ""
            usedKeys.name = editUser.name
        } else {
            usedKeys.name = editUser.name
        }

        return usedKeys
    }
</script>
