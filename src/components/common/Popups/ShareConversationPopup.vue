<template>
    <!-- Modal overlay -->
    <div v-if="show" class="fixed inset-0 z-[1010] flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
        <!-- Share window container; click.stop so clicks inside don't close it -->
        <div class="bg-strokeColor text-textColor m-[10px] w-[90vw] rounded-md p-3 shadow-[0_4px_10px_rgba(0,0,0,0.3)] sm:m-[15px] sm:w-[50vw] sm:p-5" @click.stop>
            <!-- Header -->
            <div class="mb-[15px] flex flex-row items-center justify-between pt-[5px] pb-[5px] sm:mb-[20px] sm:pt-[10px] sm:pb-[10px]">
                <h2 class="text-lg sm:text-xl">Share {{ props.module === "conversation" ? "Conversation" : "File" }}</h2>
                <div class="cursor-pointer text-xl sm:text-2xl" @click="emitClose">
                    <div class="materialSymbolsOutlined">close</div>
                </div>
            </div>

            <!-- Separator -->
            <hr class="mb-3 border-t border-gray-300 sm:mb-4" />

            <!-- Add collaborator (input + dropdown) -->
            <div class="mb-4 flex flex-col items-center gap-[8px] sm:mb-5 sm:flex-row sm:gap-[10px]">
                <!-- Email input -->
                <div class="user-select-none border-strokeColor bg-backgroundColor text-unselectedColor flex w-full items-center justify-between rounded-[10px] border px-[5px] py-[3px] sm:w-[70%] sm:px-[7px] sm:py-[5px]">
                    <input type="text" class="text-textColor flex-1 border-0 bg-transparent p-[8px] text-[14px] focus:outline-none sm:p-[10px] sm:text-[16px]" placeholder="Add Collaborator" v-model="collaboratorEmail" :disabled="isSharing || isCopyingLink" />
                </div>

                <!-- Role dropdown -->
                <div class="w-full sm:w-[28%]">
                    <Dropdown :options="roleOptions" placeholder="Select Role" label="Role" :defaultValue="collaboratorRole" v-model="collaboratorRole" :disabled="isSharing || isCopyingLink" />
                </div>
            </div>

            <!-- Users with access -->
            <div class="mb-[30px] flex flex-col sm:mb-[40px]" v-if="collaborators">
                <span class="mb-2 text-sm sm:text-base">Users with access</span>
                <div class="flex flex-col">
                    <!-- Loop through each collaborator -->
                    <div v-for="user in collaborators" :key="user.userId" class="flex flex-row items-center justify-between p-[3px] px-[5px] sm:p-[5px] sm:px-[7px]">
                        <!-- User info (avatar + username) -->
                        <div class="flex flex-row items-center gap-[8px] sm:gap-[10px]">
                            <img v-if="user.profilePicture" :src="user.profilePicture" alt="" class="h-4 w-4 rounded-full sm:h-5 sm:w-5" />
                            <span v-else class="materialSymbolsOutlined text-lg sm:text-xl"> account_circle </span>
                            <span class="text-sm sm:text-base">
                                {{ user.username }} <em v-if="user.isInviteExpired != undefined" class="text-sm font-light sm:text-base">({{ user.isInviteExpired ? "Invite expired" : "Invite sent" }})</em>
                            </span>
                        </div>

                        <!-- User role -->
                        <div class="border-textColor rounded-[10px] border-2 px-[8px] py-[3px] text-sm sm:px-[10px] sm:py-[5px] sm:text-base">
                            {{ user.role }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action buttons -->
            <div class="mt-[15px] flex flex-col items-center justify-between gap-3 sm:mt-[20px] sm:flex-row sm:gap-0">
                <!-- Copy Link (conversation only) -->
                <button
                    v-if="props.module === 'conversation'"
                    class="border-logoColor bg-backgroundColor text-textColor w-full cursor-pointer rounded-[8px] border-2 px-[15px] py-[8px] text-[14px] transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-[20px] sm:py-[10px] sm:text-[16px]"
                    @click="copyShareLink"
                    :disabled="isSharing || isCopyingLink"
                    :aria-busy="isCopyingLink ? 'true' : 'false'"
                >
                    <span v-if="isCopyingLink" class="flex items-center justify-center">
                        <svg class="mr-2 -ml-1 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Copying...
                    </span>
                    <span v-else>Copy Link</span>
                </button>

                <!-- Share button -->
                <button class="bg-logoColor text-headerTextColor w-full cursor-pointer rounded-[8px] border-0 px-[15px] py-[8px] text-[14px] transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-[20px] sm:py-[10px] sm:text-[16px]" @click="handleShare" :disabled="isSharing || !collaboratorEmail.trim()" :aria-busy="isSharing ? 'true' : 'false'">
                    <span v-if="isSharing" class="flex items-center justify-center">
                        <svg class="mr-2 -ml-1 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sharing...
                    </span>
                    <span v-else>Share</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, defineProps, defineEmits } from "vue"
    import eventBus from "~/util/eventBus"

    const conversation = useConversation()
    const conversationStore = useConversationStore()
    const userStore = useUserStore()
    const fileStore = useFileSystemStore()

    const props = defineProps({
        show: Boolean,
        module: String,
        fileOrFolderId: String,
    })

    const emit = defineEmits(["update:show", "buttonClick"])

    // Computed list of collaborators (for conversation)
    const collaborators = computed(() => {
        if (props.module === "conversation" || props.module === "interaction") {
            return conversationStore.conversations[conversationStore.sharedConversationId].usersWithAccess
        } else if (props.module === "fileOrFolder") {
            const acessList = [{ userId: userStore.userId, username: userStore.firstName, role: "editor", profilePicture: userStore.profilePicture }]
            const sharedUsers = fileStore.getSharedUsers(props.fileOrFolderId)
            if (sharedUsers && sharedUsers.length > 0) {
                sharedUsers.forEach((user: any) => {
                    acessList.push({ userId: user.userId, username: user.name, role: user.role, profilePicture: user.profilePicture })
                })
            }
            return acessList
        }
    })

    // Local state
    const collaboratorEmail = ref("")
    const collaboratorRole = ref("editor")
    const roleOptions = [
        { text: "Editor", value: "editor" },
        { text: "Viewer", value: "viewer" },
    ]

    const isSharing = ref(false)
    const isCopyingLink = ref(false)

    // Close modal
    const emitClose = () => {
        emit("update:show", false)
    }

    // Handle share (conversation)
    const handleShare = () => {
        shareConversation()
    }

    const shareConversation = async () => {
        try {
            isSharing.value = true
            if (props.module === "conversation" || props.module === "interaction") {
                await conversation.shareConversation(conversationStore.sharedConversationId, collaboratorEmail.value, collaboratorRole.value)
            } else if (props.module === "fileOrFolder") {
                await fileStore.shareFile(props.fileOrFolderId, collaboratorEmail.value, collaboratorRole.value)
            }
            collaboratorEmail.value = ""
            emit("update:show", false)
        } catch (error: any) {
            eventBus.emit("showToast", {
                _type: "error",
                message: error?.message || "Failed to share. Please try again.",
            })
        } finally {
            isSharing.value = false
        }
    }

    // Copy link
    const copyShareLink = async () => {
        try {
            isCopyingLink.value = true
            const shareLink = await conversation.generateShareLink(conversationStore.sharedConversationId)
            window.focus()
            await navigator.clipboard.writeText(shareLink)
            emit("update:show", false)
            eventBus.emit("showToast", {
                _type: "success",
                message: "Share link copied to clipboard",
            })
        } catch (error: any) {
            eventBus.emit("showToast", {
                _type: "error",
                message: error?.message || "Failed to copy link.",
            })
        } finally {
            isCopyingLink.value = false
        }
    }
</script>
