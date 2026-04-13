<template>
    <div class="m-12">
        <div class="inline-grid max-w-full grid-cols-1 items-start gap-6 sm:grid-cols-[minmax(0,42rem)_13rem] sm:gap-20">
            <div data-tour="user-profile" class="inline-grid max-w-full grid-cols-1 items-start gap-6 sm:grid-cols-[minmax(0,42rem)_13rem] sm:gap-20">
                <div class="w-full max-w-2xl">
                <!-- Personal Information Box -->
                    <div class="rounded-lg bg-sideBarBackgroundColor px-8 py-10 pt-8 shadow-sm">
                        <!-- Form header Buttons -->
                        <FormHeader :title="'Personal Information'" :handleAction="handleSaveButtonClick"
                            :loaderStatus="loaderStatus" :buttonText="'Save Profile'" />

                        <div class="flex flex-col gap-4">
                            <!-- First Name -->
                            <div class="flex items-center">
                                <SimpleInputV2 type="text" label="First Name" :defaultValue="firstName" v-model="firstName"
                                    placeholderValue="Enter your first name"
                                    inputInfo="Your display name for shared chats and user management." />
                            </div>

                            <!-- Last Name -->
                            <div class="flex items-center">
                                <SimpleInputV2 type="text" label="Last Name" :defaultValue="lastName" v-model="lastName"
                                    placeholderValue="Enter your last name" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex w-[13rem] shrink-0 flex-col items-center space-y-2 sm:items-start">
                    <!-- Profile Picture Label (Hidden on Small Screens) -->
                    <p class="text-textColor m-0 hidden text-base font-[700] sm:block">Profile Picture</p>

                    <div class="relative mt-2 flex h-52 w-52 items-center justify-center">
                        <div
                            class="flex h-full w-full items-center justify-center rounded-full border-2 border-profileBorderColor">
                            <!-- Profile Image Placeholder -->
                            <img v-if="profilePicture" :src="profilePicture" alt="Profile"
                                class="h-full w-full rounded-full object-cover" />
                        </div>

                        <!-- Edit Button -->
                        <button @click="triggerChangeProfileInput"
                            class="absolute bottom-[0.7rem] left-[23%] flex -translate-x-1/2 transform items-center space-x-1 rounded-full bg-logoColor px-3 py-1 text-sm text-white shadow-md hover:bg-indigo-700">
                            <input type="file" ref="fileInput" @change="handleProfileChange" style="display: none" />
                            <LucidePencil class="h-4 w-4" />
                            <span>Edit</span>
                        </button>

                        <!-- Hidden File Input -->
                        <input type="file" ref="fileInput" accept="image/*" @change="handleProfileChange" class="hidden" />
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-6 w-full sm:w-2/3">
            <!-- Account Security Box -->
            <div class="rounded-lg bg-sideBarBackgroundColor px-8 py-10 pt-8 shadow-sm">
                <h3 class="text-lg font-semibold text-textColor mb-6">Account Security</h3>

                <div class="flex flex-col gap-6">
                    <!-- Change Email Button -->
                    <div class="flex flex-col gap-3 sm:flex-row items-center sm:justify-between">
                        <div class="flex flex-col flex-1">
                            <!-- Email (Non-editable) -->
                            <label class="text-sm font-medium text-textColor mb-0.5">Email</label>
                            <div class="flex items-center">
                                <SimpleInputV2 type="text" label="" :defaultValue="newEmail" v-model="newEmail"
                                    @input="hasUserInteracted = true"
                                    placeholderValue="Enter your email" />
                            </div>
                            <p class="text-xs text-textColorSecondary mt-1">Request to change your email address</p>
                            <p v-if="hasUserInteracted && newEmail && !isValidEmail" class="text-xs text-red-500 mt-1">
                                {{ getValidationMessage() }}
                            </p>
                        </div>
                        <button @click="handleEmailChangeRequest" :disabled="loaderStatus || emailChangeLoading || (hasUserInteracted && !isValidEmail)"
                            class="shrink-0 px-4 py-2 bg-logoColor text-white rounded-md hover:bg-mozart-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2" :class="{ 'opacity-50 cursor-not-allowed': loaderStatus || emailChangeLoading || (hasUserInteracted && !isValidEmail) }">
                            <div v-if="emailChangeLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            {{ emailChangeLoading ? 'Changing...' : 'Change Email' }}
                        </button>
                    </div>

                    <!-- Change Password Button -->
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex flex-col flex-1">
                            <label class="text-sm font-medium text-textColor mb-1">Password</label>
                            <p class="text-xs text-textColorSecondary">Update your account password</p>
                        </div>
                        <button @click="handlePasswordChange" :disabled="loaderStatus || passwordChangeLoading"
                            class="shrink-0 px-4 py-2 bg-logoColor text-white rounded-md hover:bg-mozart-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2" :class="{ 'opacity-50 cursor-not-allowed': loaderStatus || passwordChangeLoading }">
                            <div v-if="passwordChangeLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            {{ passwordChangeLoading ? 'Requesting...' : 'Change Password' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Danger Zone Box -->
            <div class="rounded-lg border border-borderColor bg-sideBarBackgroundColor px-8 py-8 shadow-sm mt-6">
                <div class="flex items-center gap-2 mb-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/20">
                        <span class="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">warning</span>
                    </div>
                    <div>
                        <h3 class="text-base font-semibold text-textColor">Danger Zone</h3>
                        <p class="text-xs text-textColorSecondary">
                            Irreversible and destructive actions
                        </p>
                    </div>
                </div>

                <div class="mt-6 space-y-5">
                    <!-- Delete All Conversations -->
                    <div class="flex flex-col gap-3 rounded-lg border border-borderColor bg-backgroundColor p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex flex-col flex-1">
                            <label class="text-sm font-medium text-textColor mb-1">Delete All Conversations</label>
                            <p class="text-xs text-textColorSecondary">
                                Permanently delete all your conversations. This action cannot be undone.
                            </p>
                        </div>
                        <button 
                            @click="showDeleteConversationsDialog = true"
                            :disabled="deleteConversationsLoading"
                            class="shrink-0 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 hover:border-red-400 transition-colors text-sm font-medium flex items-center justify-center gap-2 dark:bg-neutral-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                            :class="{ 'opacity-50 cursor-not-allowed': deleteConversationsLoading }"
                        >
                            <div v-if="deleteConversationsLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                            {{ deleteConversationsLoading ? 'Deleting...' : 'Delete Conversations' }}
                        </button>
                    </div>

                    <!-- Delete All Files -->
                    <div class="flex flex-col gap-3 rounded-lg border border-borderColor bg-backgroundColor p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex flex-col flex-1">
                            <label class="text-sm font-medium text-textColor mb-1">Delete All Files</label>
                            <p class="text-xs text-textColorSecondary">
                                Permanently delete all your uploaded files. This action cannot be undone.
                            </p>
                        </div>
                        <button 
                            @click="showDeleteFilesDialog = true"
                            :disabled="deleteFilesLoading"
                            class="shrink-0 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 hover:border-red-400 transition-colors text-sm font-medium flex items-center justify-center gap-2 dark:bg-neutral-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                            :class="{ 'opacity-50 cursor-not-allowed': deleteFilesLoading }"
                        >
                            <div v-if="deleteFilesLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                            {{ deleteFilesLoading ? 'Deleting...' : 'Delete Files' }}
                        </button>
                    </div>

                    <!-- Delete Account -->
                    <div class="flex flex-col gap-3 rounded-lg border border-borderColor bg-backgroundColor p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex flex-col flex-1">
                            <label class="text-sm font-medium text-textColor mb-1">Delete Account</label>
                            <p class="text-xs text-textColorSecondary">
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                        </div>
                        <button 
                            @click="showDeleteAccountDialog = true"
                            :disabled="true"
                            class="shrink-0 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 hover:border-red-400 transition-colors text-sm font-medium flex items-center justify-center gap-2 dark:bg-neutral-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                            :class="{ 'opacity-50 cursor-not-allowed': true }"
                        >
                            <div v-if="deleteAccountLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                            {{ deleteAccountLoading ? 'Deleting...' : 'Delete Account' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Confirmation Dialogs -->
    <ConfirmDialog
        :show="showDeleteConversationsDialog"
        title="Delete All Conversations"
        message="Are you sure you want to permanently delete all your conversations? This action cannot be undone."
        confirmText="Delete All Conversations"
        confirmColor="danger"
        :loading="deleteConversationsLoading"
        @confirm="handleDeleteAllConversations"
        @cancel="showDeleteConversationsDialog = false"
    />

    <ConfirmDialog
        :show="showDeleteFilesDialog"
        title="Delete All Files"
        message="Are you sure you want to permanently delete all your uploaded files? This action cannot be undone."
        confirmText="Delete All Files"
        confirmColor="danger"
        :loading="deleteFilesLoading"
        @confirm="handleDeleteAllFiles"
        @cancel="showDeleteFilesDialog = false"
    />

    <ConfirmDialog
        :show="showDeleteAccountDialog"
        title="Delete Account"
        message="Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone."
        confirmText="Delete Account"
        confirmColor="danger"
        :loading="deleteAccountLoading"
        @confirm="handleDeleteAccount"
        @cancel="showDeleteAccountDialog = false"
    />
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from "vue"
import { LucidePencil } from "lucide-vue-next"
import { updateUser } from "~/services/better-auth/auth-client"
import eventBus from "~/util/eventBus"
import { requestPasswordReset, changeEmail } from "~/services/better-auth/auth-client"
import { verifyEmail } from "~/util"

const loaderStatus = ref(false)
const emailChangeLoading = ref(false)
const passwordChangeLoading = ref(false)
const userStore = useUserStore()
const admin = useAdmin()

// Danger Zone state
const showDeleteConversationsDialog = ref(false)
const showDeleteFilesDialog = ref(false)
const showDeleteAccountDialog = ref(false)
const deleteConversationsLoading = ref(false)
const deleteFilesLoading = ref(false)
const deleteAccountLoading = ref(false)

const firstName = ref(userStore.firstName)
const lastName = ref(userStore.lastName)
const fullName = ref(userStore.firstName + userStore.lastName)
const fileInput = ref<HTMLElement>()
const email = ref(userStore.email) // Keep for display only
const newEmail = ref(userStore.email || '') // For the input field
const hasUserInteracted = ref(false) // Track if user has interacted with the email field
const role = ref(userStore.role)
const profilePicture = ref(userStore.profilePicture)

const handleSaveButtonClick = async () => {
    loaderStatus.value = true
    // TODO: Update updateUser call with correct parameters based on better-auth API
    await updateUser({
        name: `${firstName.value} ${lastName.value}`,
    })
        .finally(async () => {
            loaderStatus.value = false
            await userStore.hydrateFromBetterAuth() // Pass true to force refresh
        })
}

const triggerChangeProfileInput = () => {
    if (!fileInput.value) return
    fileInput.value.click()
}

const getValidationMessage = () => {
    if (!newEmail.value.trim()) {
        return 'Please enter an email address'
    }
    if (!verifyEmail(newEmail.value)) {
        return 'Please enter a valid email address'
    }
    if (newEmail.value.toLowerCase() === userStore.email?.toLowerCase()) {
        return 'Enter a different email address'
    }
    return 'Email is valid'
}

const isValidEmail = computed(() => {
    // If email is empty, return false
    if (!newEmail.value.trim()) {
        return false
    }
    // If email format is invalid, return false
    if (!verifyEmail(newEmail.value)) {
        return false
    }
    // If email is the same as current email, return false (no change needed)
    if (newEmail.value.toLowerCase() === userStore.email?.toLowerCase()) {
        return false
    }
    // If email is different and valid, return true
    return true
})

const handleProfileChange = async (event: any) => {
    const file = event.target.files[0]
    const uploadData = await useUser().uploadFile(file, false)
    if(uploadData && uploadData.url) {
        profilePicture.value = uploadData.url
        await updateUser({
            image: uploadData.url as string,
        })
        userStore.profilePicture = uploadData.url as string
    } else {
        eventBus.emit("showToast", {
            message: "Failed to upload profile picture",
            _type: "error",
        })
    }
}

const handleEmailChangeRequest = async () => {
    emailChangeLoading.value = true
    try {
        const callbackUrl = admin.loginCallbackURL
        const result = await changeEmail({ newEmail: newEmail.value, callbackURL: callbackUrl })
        if (result.error) {
            eventBus.emit("showToast", {
                message: result.error.message || "Failed to request email change",
                _type: "error",
            })
        }
        else {
            eventBus.emit("showToast", {
                message: "Please check your email to approve the request",
                _type: "success",
            })
        }
    } finally {
        emailChangeLoading.value = false
    }
}

const handlePasswordChange = async () => {
    passwordChangeLoading.value = true
    try {
        const result = await requestPasswordReset({ email: email.value })
        if (result.error) {
            eventBus.emit("showToast", {
                message: result.error.message || "Failed to request password change",
                _type: "error",
            })
        }
        else {
            eventBus.emit("showToast", {
                message: "Please check your email for next steps",
                _type: "success",
            })
        }
    } finally {
        passwordChangeLoading.value = false
    }
}

const handleDeleteAllConversations = async () => {
    deleteConversationsLoading.value = true
    try {
        await useConversation().deleteAllConversations()
    } finally {
        showDeleteConversationsDialog.value = false
        deleteConversationsLoading.value = false
    }
}

const handleDeleteAllFiles = async () => {
    deleteFilesLoading.value = true
    try {
        await useFileSystem().deleteAllFilesAndFolders()
    } finally {
        showDeleteFilesDialog.value = false
        deleteFilesLoading.value = false
    }
}

const handleDeleteAccount = async () => {
    deleteAccountLoading.value = true
    try {
        // TODO: Implement account deletion
        console.log("Deleting account")
    } finally {
        showDeleteAccountDialog.value = false
        deleteAccountLoading.value = false
    }
}
// Keep the fields in sync with the store in real-time
watchEffect(() => {
    firstName.value = userStore.firstName
    lastName.value = userStore.lastName
    fullName.value = userStore.firstName + " " + userStore.lastName
    email.value = userStore.email
    role.value = userStore.role
    profilePicture.value = userStore.profilePicture
})

// Initialize newEmail only once when component mounts
onMounted(() => {
    newEmail.value = userStore.email || ''
})
</script>
