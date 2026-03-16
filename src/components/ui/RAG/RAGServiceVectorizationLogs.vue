<template>
    <!-- Modal Overlay -->
    <div v-if="show" class="bg-background/50 fixed inset-0 z-[11000] flex items-center justify-center backdrop-blur-sm" @click="emitClose">
        <!-- Modal Container -->
        <div class="bg-backgroundColor text-textColor m-4 flex h-[70vh] w-full max-w-screen-xl flex-col justify-between rounded-md p-5 shadow-lg" @click.stop>
            <!-- Header -->
            <div class="mb-8 flex items-center justify-between">
                <div class="text-xl font-semibold">Vectorization Logs</div>
                <div class="cursor-pointer text-2xl" @click="emitClose">
                    <div class="materialSymbolsOutlined">close</div>
                </div>
            </div>

            <!-- Search Bar -->
            <div v-if="!isLoading" class="border-border2 bg-backgroundColor mb-4 flex w-1/2 items-center rounded-[18px] border px-2">
                <input class="bg-backgroundColor text-textColor box-border w-full rounded-[18px] border-0 p-2.5 outline-none" type="text" placeholder="Search for file name" v-model="searchQuery" @keydown.enter="filterLogs" />
                <div class="materialSymbolsFilled cursor-pointer" @click="filterLogs">search</div>
            </div>

            <!-- Table Container -->
            <div v-if="!isLoading" class="border-border flex max-h-full w-full flex-1 flex-col overflow-hidden">
                <!-- Scrollable Table -->
                <div class="flex-1 overflow-y-scroll pr-2">
                    <table class="divide-border min-w-full table-fixed border-collapse divide-y divide-neutral-200">
                        <!-- Table Header -->
                        <thead class="bg-secondary bg-secondary sticky top-0 z-10">
                            <tr>
                                <th class="text-muted-foreground relative px-6 py-3 text-center text-xs font-medium hover:cursor-pointer" @click="sortBy('docId')">
                                    Id
                                    <span v-if="sortKey === 'docId'" class="materialSymbolsOutlined absolute top-[25%] text-[1.5rem]">
                                        {{ sortDirection === "asc" ? "arrow_drop_up" : "arrow_drop_down" }}
                                    </span>
                                </th>
                                <th class="text-muted-foreground relative px-6 py-3 text-center text-xs font-medium hover:cursor-pointer" @click="sortBy('collection')">
                                    Collection
                                    <span v-if="sortKey === 'collection'" class="materialSymbolsOutlined absolute top-[25%] text-[1.5rem]">
                                        {{ sortDirection === "asc" ? "arrow_drop_up" : "arrow_drop_down" }}
                                    </span>
                                </th>
                                <th class="text-muted-foreground relative px-6 py-3 text-center text-xs font-medium hover:cursor-pointer" @click="sortBy('file_name')">
                                    File Name
                                    <span v-if="sortKey === 'file_name'" class="materialSymbolsOutlined absolute top-[25%] text-[1.5rem]">
                                        {{ sortDirection === "asc" ? "arrow_drop_up" : "arrow_drop_down" }}
                                    </span>
                                </th>
                                <th class="text-muted-foreground relative px-6 py-3 text-center text-xs font-medium hover:cursor-pointer" @click="sortBy('status')">
                                    Status
                                    <span v-if="sortKey === 'status'" class="materialSymbolsOutlined absolute top-[25%] text-[1.5rem]">
                                        {{ sortDirection === "asc" ? "arrow_drop_up" : "arrow_drop_down" }}
                                    </span>
                                </th>
                                <th class="text-muted-foreground relative px-6 py-3 text-center text-xs font-medium hover:cursor-pointer" @click="sortBy('message')">
                                    Message
                                    <span v-if="sortKey === 'message'" class="materialSymbolsOutlined absolute top-[25%] text-[1.5rem]">
                                        {{ sortDirection === "asc" ? "arrow_drop_up" : "arrow_drop_down" }}
                                    </span>
                                </th>
                                <th class="text-muted-foreground relative px-6 py-3 text-center text-xs font-medium hover:cursor-pointer" @click="sortBy('timestamp')">
                                    Created At
                                    <span v-if="sortKey === 'timestamp'" class="materialSymbolsOutlined absolute top-[25%] text-[1.5rem]">
                                        {{ sortDirection === "asc" ? "arrow_drop_up" : "arrow_drop_down" }}
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <!-- Table Body -->
                        <tbody class="divide-border divide-y divide-neutral-200">
                            <tr v-for="(log, index) in sortedLogs" :key="index" class="hover:bg-background hover:bg-secondary">
                                <td class="text-foreground px-6 py-4 text-center text-sm whitespace-nowrap">
                                    {{ trimText(log.queue_item_id) }}
                                </td>
                                <td class="text-foreground px-6 py-4 text-center text-sm whitespace-nowrap">
                                    {{ trimText(log.collection_name) }}
                                </td>
                                <td class="text-foreground px-6 py-4 text-center text-sm whitespace-nowrap">
                                    {{ trimText(log.file_name) }}
                                </td>
                                <td class="text-foreground px-6 py-4 text-center text-sm whitespace-nowrap">
                                    {{ log.status }}
                                </td>
                                <td class="text-foreground max-w-[100px] overflow-x-scroll px-6 py-4 text-center text-sm whitespace-nowrap">
                                    {{ log.log_message }}
                                </td>
                                <td class="text-foreground px-6 py-4 text-center text-sm whitespace-nowrap">
                                    {{ getLocalDate(log.timestamp) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- No Results -->
            <div v-if="logs.length === 0 && !isLoading" class="h-full self-center pt-2">No logs found</div>

            <!-- Actions -->
            <div v-if="!isLoading" class="mt-4 flex flex-row items-center justify-between">
                <Button buttonText="Refresh" @clicked="refreshLogs" />

                <div class="flex flex-row gap-2">
                    <div class="bg-border text-textColor cursor-pointer rounded border-none px-4 py-2 text-center text-base transition-colors ease-in-out outline-none" :class="{ 'border-border text-white': timeSlots['1hr'] }" @click="toggleTimeSlots('1hr')">Last 1 hour</div>
                    <div class="bg-border text-textColor cursor-pointer rounded border-none px-4 py-2 text-center text-base transition-colors ease-in-out outline-none" :class="{ 'border-border text-white': timeSlots['6hr'] }" @click="toggleTimeSlots('6hr')">Last 6 hours</div>
                    <div class="bg-border text-textColor cursor-pointer rounded border-none px-4 py-2 text-center text-base transition-colors ease-in-out outline-none" :class="{ 'border-border text-white': timeSlots['24hr'] }" @click="toggleTimeSlots('24hr')">Last 24 hours</div>
                </div>
            </div>

            <!-- Loading -->
            <Loading v-if="isLoading" :text="'Loading Logs'" />
        </div>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps({
        show: Boolean,
    })

    const ragStore = useRagStore()
    const userStore = useUserStore()

    const emit = defineEmits(["update:show"])

    const logs = ref(ragStore.vectorizationLogs)
    const isLoading = ref(false)
    const searchQuery = ref("")

    const timeSlots = ref<{ [key: string]: boolean }>({
        "1hr": true,
        "6hr": false,
        "24hr": false,
    })

    // Sorting state
    const sortKey = ref<string>("") // Key to sort by
    const sortDirection = ref<"asc" | "desc">("asc") // Ascending or descending order

    function emitClose() {
        emit("update:show", false)
    }

    async function toggleTimeSlots(timeSlot: string) {
        Object.keys(timeSlots.value).forEach((slot) => {
            timeSlots.value[slot] = slot === timeSlot
        })
        await refreshLogs()
    }

    function filterLogs() {
        if (searchQuery.value) {
            logs.value = ragStore.vectorizationLogs.filter((log: any) => log.file_name.toLowerCase().includes(searchQuery.value.toLowerCase()))
        } else {
            logs.value = ragStore.vectorizationLogs
        }
    }

    // Sorting function
    function sortBy(key: string) {
        if (sortKey.value === key) {
            // Toggle direction if the same key is clicked
            sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc"
        } else {
            sortKey.value = key
            sortDirection.value = "asc"
        }
    }

    const sortedLogs = computed(() => {
        if (!sortKey.value) {
            return logs.value
        }
        // Sort a shallow copy
        const sorted = [...logs.value]
        sorted.sort((a, b) => {
            const modifier = sortDirection.value === "asc" ? 1 : -1
            if (a[sortKey.value] < b[sortKey.value]) return -1 * modifier
            if (a[sortKey.value] > b[sortKey.value]) return 1 * modifier
            return 0
        })
        return sorted
    })

    function trimText(text: string) {
        if (!text) return ""
        return text.length > 15 ? text.substring(0, 15) + "..." : text
    }

    function getLocalDate(date: number) {
        const timestamp = new Date(date * 1000).toLocaleString()
        return timestamp
    }

    async function refreshLogs() {
        isLoading.value = true
        searchQuery.value = ""

        // Determine which time slot is active
        const timeSlot = Object.keys(timeSlots.value).find((slot) => timeSlots.value[slot]) || "1hr"
        const data = await useRag().getVectorizationLogs(userStore.email, timeSlot)

        if (data && data.length === 0) {
            logs.value = []
        } else {
            logs.value = data
            ragStore.vectorizationLogs = data
        }

        isLoading.value = false
    }

    onMounted(async () => {
        isLoading.value = true
        const data = await useRag().getVectorizationLogs(userStore.email, "1hr")
        if (data && data.length === 0) {
            logs.value = []
        } else {
            logs.value = data
            ragStore.vectorizationLogs = data
        }
        isLoading.value = false
    })
</script>
