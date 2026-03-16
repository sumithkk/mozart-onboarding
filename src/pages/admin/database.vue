<template>
    <div class="text-textColor m-2 flex flex-1 gap-2">
        <!-- Databases List Container -->
        <div class="flex-1 overflow-auto">
            <!-- Header -->
            <div class="mb-2 flex items-center justify-between">
                <h2 class="text-lg font-semibold">Vector Databases</h2>
                <button class="bg-itemColor text-textColor hover:bg-sideBarBackgroundColor rounded px-4 py-2 text-base transition-all duration-200" @click="createNewDatabase">Create New Database</button>
            </div>

            <!-- Database Table -->
            <table class="bg-backgroundColor w-full border-collapse font-[Arial,sans-serif] shadow-md">
                <!-- Table Head -->
                <thead class="bg-backgroundColor text-foreground sticky top-0">
                    <tr class="transition-colors duration-300">
                        <th class="px-4 py-3 text-left font-bold">Name</th>
                        <th class="px-4 py-3 text-left font-bold">Cluster URL</th>
                        <th class="px-4 py-3 text-left font-bold">API Key</th>
                        <th class="px-4 py-3 text-left font-bold">Tags</th>
                        <th class="px-4 py-3 text-left font-bold">Updated At</th>
                        <th class="px-4 py-3 text-left font-bold">Created At</th>
                    </tr>
                </thead>
                <!-- Table Body -->
                <tbody class="transition-colors duration-300">
                    <tr v-for="database in databasesList" :key="database.databaseId" class="even:bg-backgroundColor hover:bg-sideBarBackgroundColor cursor-pointer transition-colors duration-300" @click="changeSelectedDatabase(database)">
                        <td class="max-w-[100px] overflow-hidden px-4 py-3 text-ellipsis">
                            {{ database.name }}
                        </td>
                        <td class="max-w-[100px] overflow-hidden px-4 py-3 text-ellipsis">
                            {{ database.cluster_url }}
                        </td>
                        <td class="max-w-[100px] overflow-hidden px-4 py-3 text-ellipsis">
                            {{ database.api_key }}
                        </td>
                        <td class="max-w-[100px] overflow-hidden px-4 py-3 text-ellipsis">
                            {{ database.tags.split(",").join(", ") }}
                        </td>
                        <td class="max-w-[100px] overflow-hidden px-4 py-3 text-ellipsis">
                            {{ formatDate(database.updated_at) }}
                        </td>
                        <td class="max-w-[100px] overflow-hidden px-4 py-3 text-ellipsis">
                            {{ formatDate(database.created_at) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Database Info Container -->
        <div v-if="selectedDatabase" class="border-strokeColor bg-sideBarBackgroundColor box-border flex h-full w-[30%] flex-col gap-4 overflow-auto rounded-lg border">
            <!-- Database Info Header -->
            <div class="bg-sideBarBackgroundColor relative sticky top-0 flex items-center justify-center px-2 py-2">
                <h3 class="m-0 flex-1 text-center">
                    {{ isNewDatabase ? "New Database Info" : "Database Info" }}
                </h3>
                <div class="materialSymbolsFilled absolute right-2 cursor-pointer text-xl" @click="changeSelectedDatabase(null)">close</div>
            </div>

            <!-- Database Details Form -->
            <div class="px-3 py-2">
                <form @submit.prevent="isNewDatabase ? createDatabase() : saveDatabase()" class="bg-sideBarBackgroundColor box-border rounded">
                    <!-- Name -->
                    <div class="mb-4 flex flex-col">
                        <label class="mb-1 font-semibold"> Name: </label>
                        <input type="text" v-model="editDatabase.name" required class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded border px-2 py-1" />
                    </div>

                    <!-- Cluster URL -->
                    <div class="mb-4 flex flex-col">
                        <label class="mb-1 font-semibold"> Cluster URL: </label>
                        <input type="url" v-model="editDatabase.cluster_url" required class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded border px-2 py-1" />
                    </div>

                    <!-- API Key -->
                    <div class="mb-4 flex flex-col">
                        <label class="mb-1 font-semibold"> API Key: </label>
                        <input type="text" v-model="editDatabase.api_key" required class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded border px-2 py-1" />
                    </div>

                    <!-- Tags -->
                    <div class="mb-4 flex flex-col">
                        <label class="mb-1 font-semibold"> Tags: </label>
                        <input type="text" placeholder="Comma separated" v-model="editDatabase.tags" class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded border px-2 py-1" />
                    </div>

                    <!-- Max Collections -->
                    <div class="mb-4 flex flex-col">
                        <label class="mb-1 font-semibold"> Max Collections: </label>
                        <input type="number" v-model="editDatabase.max_collections" class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded border px-2 py-1" />
                    </div>

                    <!-- Max Users -->
                    <div class="mb-4 flex flex-col">
                        <label class="mb-1 font-semibold"> Max Users: </label>
                        <input type="number" v-model="editDatabase.max_users" class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded border px-2 py-1" />
                    </div>

                    <!-- Max Organizations -->
                    <div class="mb-4 flex flex-col">
                        <label class="mb-1 font-semibold"> Max Organizations: </label>
                        <input type="number" v-model="editDatabase.max_orgs" class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded border px-2 py-1" />
                    </div>

                    <!-- Database Card (Display Info) -->
                    <div class="border-strokeColor bg-backgroundColor mt-4 rounded-lg border p-3 shadow-md">
                        <div class="bg-sideBarBackgroundColor mb-2 flex justify-between rounded-md p-2">
                            <strong class="text-textColor">Collections:</strong>
                            <span class="text-textColor">
                                {{ editDatabase.number_of_collections }}
                            </span>
                        </div>
                        <div class="bg-sideBarBackgroundColor mb-2 flex justify-between rounded-md p-2">
                            <strong class="text-textColor">Users:</strong>
                            <span class="text-textColor">
                                {{ editDatabase.used_by_number_of_users }}
                            </span>
                        </div>
                        <div class="bg-sideBarBackgroundColor mb-0 flex justify-between rounded-md p-2">
                            <strong class="text-textColor">Organizations:</strong>
                            <span class="text-textColor">
                                {{ editDatabase.used_by_number_of_organization }}
                            </span>
                        </div>
                    </div>

                    <!-- Save/Create Button -->
                    <button type="submit" class="bg-itemColor text-foreground hover:bg-sideBarBackgroundColor mt-4 w-full cursor-pointer rounded px-4 py-2 text-base transition-all duration-200">
                        {{ isNewDatabase ? "Create Database" : "Save" }}
                    </button>
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
    const databasesList: any = ref([])
    const selectedDatabase: any = ref(null)
    const isNewDatabase = ref(false)
    const editDatabase = reactive({
        databaseId: "",
        name: "",
        cluster_url: "",
        api_key: "",
        tags: [] as string[],
        number_of_collections: 0,
        used_by_number_of_users: 0,
        used_by_number_of_organization: 0,
        max_collections: null,
        max_users: null,
        max_orgs: null,
    })

    function changeSelectedDatabase(database: any) {
        isNewDatabase.value = false
        if (database) {
            Object.assign(editDatabase, JSON.parse(JSON.stringify(database)))
        }
        selectedDatabase.value = database
    }

    function createNewDatabase() {
        isNewDatabase.value = true
        selectedDatabase.value = {}
        Object.assign(editDatabase, {
            name: "",
            cluster_url: "",
            api_key: "",
            tags: [],
            number_of_collections: 0,
            used_by_number_of_users: 0,
            used_by_number_of_organization: 0,
        })
    }

    async function fetchDatabases() {
        try {
            databasesList.value = await admin.getVectorDatabasesList()
            console.log(databasesList.value)
        } catch (error) {
            console.error("Failed to fetch databases:", error)
        }
    }

    function formatDate(epochTime: number) {
        return new Date(epochTime).toLocaleString()
    }

    async function saveDatabase() {
        console.log(isNewDatabase.value)
        try {
            await admin.updateVectorDatabase(JSON.parse(JSON.stringify(editDatabase)))
            databasesList.value = await admin.getVectorDatabasesList()
        } catch (error) {
            console.error("Failed to update database:", error)
        }
    }

    async function createDatabase() {
        console.log(isNewDatabase.value)
        try {
            await admin.createVectorDatabase(JSON.parse(JSON.stringify(editDatabase)))
            databasesList.value = await admin.getVectorDatabasesList()
            changeSelectedDatabase(null)
        } catch (error) {
            console.error("Failed to create database:", error)
        }
    }

    onMounted(fetchDatabases)
</script>
