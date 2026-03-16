<template>
    <!-- Root container -->
    <div class="text-foreground m-3 flex flex-1 gap-3">
        <!-- Users List Container -->
        <div class="flex-1 overflow-auto">
            <table class="bg-card w-full border-collapse text-left shadow-md">
                <thead class="bg-card sticky top-0">
                    <tr class="transition-colors">
                        <th class="px-4 py-3 font-bold">Profile Picture</th>
                        <th class="px-4 py-3 font-bold">Name</th>
                        <th class="px-4 py-3 font-bold">Email</th>
                        <th class="px-4 py-3 font-bold">Plan</th>
                        <th class="px-4 py-3 font-bold">Role</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in usersList" :key="user.userId" @click="changeSelectedUser(user)" class="even:bg-secondary hover:bg-background cursor-pointer transition-colors">
                        <td class="px-4 py-3">
                            <img :src="user.profilePicture" alt="Profile" class="h-10 w-10 rounded-full object-cover" />
                        </td>
                        <td class="px-4 py-3">
                            {{ user.name || user.username }}
                        </td>
                        <td class="px-4 py-3">
                            {{ user.email }}
                        </td>
                        <td class="px-4 py-3">
                            {{ user.currentPlan }}
                        </td>
                        <td class="px-4 py-3">
                            {{ user.role }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- User Info Side Panel -->
        <div v-if="selectedUser" class="bg-secondary relative flex h-full w-1/3 flex-col gap-4 overflow-auto rounded-lg p-4">
            <!-- Header with title + close icon -->
            <div class="bg-secondary sticky top-0 z-10 flex items-center justify-center p-2">
                <h3 class="m-0 flex-1 text-center font-semibold">User Info</h3>
                <div class="absolute right-3 cursor-pointer text-xl" @click="changeSelectedUser(null)">
                    <span class="materialSymbolsFilled">close</span>
                </div>
            </div>

            <!-- Profile image (centered) -->
            <div class="flex w-full justify-center">
                <img class="border-border h-28 w-28 rounded-full border-4 object-cover" :src="selectedUser.profilePicture" alt="Profile Picture" />
            </div>

            <!-- User Details Form -->
            <div>
                <form @submit.prevent="saveUser">
                    <!-- Name -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong class="mb-1">Name:</strong>
                            <input type="text" v-model="editUser.name" class="border-border focus:ring-primary rounded border p-2 focus:ring-2 focus:outline-none" />
                        </label>
                    </div>

                    <!-- Email -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong class="mb-1">Email:</strong>
                            <input type="email" v-model="editUser.email" class="border-border focus:ring-primary rounded border p-2 focus:ring-2 focus:outline-none" />
                        </label>
                    </div>

                    <!-- Plan -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong class="mb-1">Plan:</strong>
                            <select v-model="editUser.currentPlan" class="border-border bg-card focus:ring-primary rounded border p-2 focus:ring-2 focus:outline-none">
                                <option value="free">Free</option>
                                <option value="basic">Basic</option>
                                <option value="premium">Premium</option>
                            </select>
                        </label>
                    </div>

                    <!-- Role -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong class="mb-1">Role:</strong>
                            <input type="text" v-model="editUser.role" class="border-border focus:ring-primary rounded border p-2 focus:ring-2 focus:outline-none" />
                        </label>
                    </div>

                    <!-- Email Verified -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-row items-center space-x-2">
                            <strong>Email Verified:</strong>
                            <input type="checkbox" v-model="editUser.isEmailVerified" class="h-4 w-4" />
                        </label>
                    </div>

                    <!-- Phone Verified -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-row items-center space-x-2">
                            <strong>Phone Verified:</strong>
                            <input type="checkbox" v-model="editUser.isPhoneVerified" class="h-4 w-4" />
                        </label>
                    </div>

                    <!-- Theme -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong class="mb-1">Theme:</strong>
                            <select v-model="editUser.settings.theme" class="border-border bg-card focus:ring-primary rounded border p-2 focus:ring-2 focus:outline-none">
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </label>
                    </div>

                    <!-- Sign Up Via -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong class="mb-1">Sign Up Via:</strong>
                            <input type="text" v-model="editUser.signUpVia" disabled class="border-border bg-card text-muted-foreground rounded border p-2 focus:outline-none" />
                        </label>
                    </div>

                    <!-- Last Login -->
                    <div class="mb-4 flex flex-col">
                        <label class="flex flex-col">
                            <strong class="mb-1">Last Login:</strong>
                            <input type="text" :value="formatDate(editUser.lastLogin)" disabled class="border-border bg-card text-muted-foreground rounded border p-2 focus:outline-none" />
                        </label>
                    </div>

                    <!-- Save Button -->
                    <button type="submit" class="bg-primary text-foreground hover:bg-primary mt-2 w-full rounded p-2 text-center transition duration-200 ease-in-out">Save</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import useAdmin from "~/composables/useAdmin"

    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    const admin = useAdmin()
    const usersList = ref<any[]>([])
    const selectedUser = ref<any>(null)

    const editUser = reactive({
        userId: "",
        name: "",
        email: "",
        currentPlan: "",
        role: "",
        isEmailVerified: false,
        isPhoneVerified: false,
        settings: {
            theme: "light",
        },
        signUpVia: "",
        lastLogin: 0,
    })

    function changeSelectedUser(user: any) {
        if (user) {
            // Deep-copy user object to editUser
            Object.assign(editUser, JSON.parse(JSON.stringify(user)))
        }
        selectedUser.value = user
    }

    async function fetchUsers() {
        try {
            usersList.value = await admin.getUsersList()
        } catch (error) {
            console.error("Failed to fetch users:", error)
        }
    }

    function formatDate(timestamp: number) {
        return new Date(timestamp).toLocaleString()
    }

    async function saveUser() {
        try {
            await admin.updateUserData(JSON.parse(JSON.stringify(editUser)))
            const userIndex = usersList.value.findIndex((u: any) => u.userId === editUser.userId)
            if (userIndex !== -1) {
                usersList.value[userIndex] = JSON.parse(JSON.stringify(editUser))
            }
        } catch (error) {
            console.error("Failed to update user:", error)
        }
    }

    onMounted(fetchUsers)
</script>
