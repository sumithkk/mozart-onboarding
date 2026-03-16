<template>
    <div class="text-textColor m-2 flex flex-1 flex-col gap-2 overflow-x-hidden overflow-y-scroll">
        <!-- Collections List -->
        <div class="h-full flex-1">
            <!-- Service Switches -->
            <div class="my-2 ml-2 flex gap-2">
                <div
                    class="bg-sideBarBackgroundColor cursor-pointer rounded-lg px-6 py-2 text-sm"
                    :class="{
                        'border-border text-foreground border-none': isCloudServiceSelected,
                    }"
                    @click="switchService('cloud')"
                >
                    Cloud
                </div>
                <div
                    class="bg-sideBarBackgroundColor cursor-pointer rounded-lg px-6 py-2 text-sm"
                    :class="{
                        'border-border text-foreground border-none': !isCloudServiceSelected,
                    }"
                    @click="switchService('local')"
                >
                    Local
                </div>
            </div>

            <!-- Collections Table -->
            <table class="divide-border min-w-full divide-y divide-neutral-200 bg-transparent">
                <thead class="bg-secondary bg-secondary">
                    <tr>
                        <th class="text-muted-foreground rounded-tl-lg px-6 py-3 text-left text-xs font-medium">Select</th>
                        <th class="text-muted-foreground px-6 py-3 text-left text-xs font-medium">Name</th>
                        <th class="text-muted-foreground px-6 py-3 text-left text-xs font-medium">Embedding</th>
                        <th class="text-muted-foreground px-6 py-3 text-left text-xs font-medium">Distance</th>
                        <th class="text-muted-foreground rounded-tr-lg px-6 py-3 text-center text-xs font-medium">Users with Access</th>
                    </tr>
                </thead>
                <tbody class="divide-border divide-y divide-neutral-200">
                    <!-- Cloud Collections -->
                    <tr v-if="isCloudServiceSelected" v-for="collection in cloudCollections" :key="collection.id" class="even:bg-backgroundColor hover:bg-sideBarBackgroundColor cursor-pointer transition-colors duration-300">
                        <td class="text-foreground px-6 py-4 text-sm whitespace-nowrap">
                            <input type="checkbox" :value="collection.id" :checked="selectedCollection.id === collection.id" @change="selectCollection(collection)" />
                        </td>
                        <td class="text-foreground px-6 py-4 text-sm whitespace-nowrap" @click="selectCollection(collection)">
                            {{ collection.alias || collection.name }}
                        </td>
                        <td class="text-foreground px-6 py-4 text-sm whitespace-nowrap">
                            {{ collection.embedding }}
                        </td>
                        <td class="text-foreground px-6 py-4 text-sm whitespace-nowrap">
                            {{ collection.distance }}
                        </td>
                        <td class="text-foreground flex flex-col items-center px-6 py-4 text-sm whitespace-nowrap" v-if="collection.usersWithAccess">
                            <div class="text-primary cursor-pointer bg-transparent text-sm" @click="toggleDropdown(collection.id)">
                                {{ isDropdownOpen(collection.id) ? "Hide Users" : "Show Users" }}
                            </div>
                            <ul v-if="isDropdownOpen(collection.id)" class="border-border bg-sideBarBackgroundColor relative mt-1 w-48 rounded-lg border p-0">
                                <li v-for="(user, userId) in collection.usersWithAccess" :key="userId" class="border-border text-textColor list-none border-b p-2">
                                    {{ user.email }}
                                </li>
                            </ul>
                        </td>
                    </tr>

                    <!-- Local Collections -->
                    <tr v-else v-for="collection in localCollections" :key="collection.id" class="even:bg-backgroundColor hover:bg-sideBarBackgroundColor cursor-pointer transition-colors duration-300">
                        <td class="text-foreground px-6 py-4 text-sm whitespace-nowrap">
                            <input type="checkbox" :value="collection.id" :checked="selectedCollection.id === collection.id" @change="selectCollection(collection)" />
                        </td>
                        <td class="text-foreground px-6 py-4 text-sm whitespace-nowrap" @click="selectCollection(collection)">
                            {{ collection.name }}
                        </td>
                        <td class="text-foreground px-6 py-4 text-sm whitespace-nowrap">
                            {{ collection.embedding }}
                        </td>
                        <td class="text-foreground px-6 py-4 text-sm whitespace-nowrap">
                            {{ collection.distance }}
                        </td>
                        <td class="text-foreground flex flex-col items-center px-6 py-4 text-sm whitespace-nowrap" v-if="collection.usersWithAccess">
                            <div class="text-primary cursor-pointer bg-transparent text-sm" @click="toggleDropdown(collection.id)">
                                {{ isDropdownOpen(collection.id) ? "Hide Users" : "Show Users" }}
                            </div>
                            <ul v-if="isDropdownOpen(collection.id)" class="border-border bg-sideBarBackgroundColor relative mt-1 w-48 rounded-lg border p-0">
                                <li v-for="(user, userId) in collection.usersWithAccess" :key="userId" class="border-border text-textColor list-none border-b p-2">
                                    {{ user.email }}
                                </li>
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal Overlay -->
        <div v-if="selectedCollection.name" class="bg-background bg-opacity-50 fixed inset-0 z-[1010] flex items-center justify-center backdrop-blur-[2px]">
            <div class="bg-backgroundColor relative flex w-[400px] flex-col gap-2 rounded p-4 shadow-md">
                <!-- Close Icon -->
                <div class="absolute top-2 right-2 cursor-pointer text-xl" @click="closePopup">
                    <div class="materialSymbolsOutlined">close</div>
                </div>

                <!-- Title -->
                <div class="pb-2 text-base font-semibold">Access Control for {{ selectedCollection.alias || selectedCollection.name }} Collection</div>

                <!-- Form Container -->
                <div class="flex flex-row items-center gap-2">
                    <input class="border-border bg-sideBarBackgroundColor text-textColor flex-1 rounded border-2 p-2" type="text" placeholder="User Email" v-model="memberEmail" />
                    <div class="flex gap-2">
                        <div class="bg-primary text-foreground cursor-pointer rounded px-3 py-1 text-sm" @click="updateAccess('grant')">Grant Access</div>
                        <div class="bg-destructive text-foreground cursor-pointer rounded px-3 py-1 text-sm" @click="updateAccess('revoke')">Revoke Access</div>
                    </div>
                </div>

                <!-- Loading Indicator -->
                <Loading :text="'Updating Access'" v-if="isLoading" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    const collections = ref([])
    const selectedCollection = ref({})
    const memberEmail = ref("")
    const openDropdowns = ref<Set<string>>(new Set())
    const isLoading = ref(false)
    const isCloudServiceSelected = ref(true)
    const currentService = ref("cloud")

    const cloudCollections = computed(() => {
        const collectionArray = collections.value
        if (collectionArray.length === 0) return []
        return collectionArray.filter((collection: any) => collection.service === "cloud")
    })

    const localCollections = computed(() => {
        const collectionArray = collections.value
        if (collectionArray.length === 0) return []
        return collectionArray.filter((collection: any) => collection.service === "local")
    })

    const selectCollection = (collection: any) => {
        if (collection.id === selectedCollection.value.id) {
            selectedCollection.value = {}
        } else selectedCollection.value = collection
    }

    const updateAccess = async (type: string) => {
        if (!memberEmail.value) return
        if (!selectedCollection.value.id) return
        isLoading.value = true
        const response: any = await useRag().updateCollectionAccess(memberEmail.value, selectedCollection.value.id, type, "write")
        if (response.code === 200) {
            const data = await useRag().getAllCollections()
            if (!data) return
            collections.value = data
            // Reset cache flags to force refresh after updating collection access
            const ragStore = useRagStore()
            ragStore.resetCacheFlags()
            await useRag().getCollectionsForUser()
        }
        isLoading.value = false
        memberEmail.value = ""
    }

    const closePopup = () => {
        selectedCollection.value = {}
    }

    const toggleDropdown = (collectionId: string) => {
        if (openDropdowns.value.has(collectionId)) {
            openDropdowns.value.delete(collectionId)
        } else {
            openDropdowns.value.add(collectionId)
        }
    }

    const isDropdownOpen = (collectionId: string) => {
        return openDropdowns.value.has(collectionId)
    }

    const switchService = (service: string) => {
        currentService.value = service
        isCloudServiceSelected.value = service === "cloud"
    }

    onMounted(async () => {
        const data = await useRag().getAllCollections()
        if (!data) return
        collections.value = data
    })
</script>
