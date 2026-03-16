<template>
    <div v-if="queueItems.length > 0" class="border-border bg-card text-foreground border-border bg-background text-foreground fixed right-5 bottom-5 flex w-1/3 flex-col gap-2 rounded-lg border p-2">
        <div class="flex items-center justify-between">
            <div>Vectorization Queue</div>
            <div class="flex items-center gap-2">
                <button @click="archiveItems" class="border-destructive bg-secondary text-destructive hover:bg-secondary bg-card hover:bg-secondary flex h-6 w-6 items-center justify-center rounded-full border-2">
                    <span class="materialSymbolsOutlined text-destructive text-xl font-bold">close</span>
                </button>
                <div @click="toggleVisibility" class="materialSymbolsOutlined cursor-pointer text-2xl">
                    <span v-if="isVisible">expand_less</span>
                    <span v-else>expand_more</span>
                </div>
            </div>
        </div>
        <div v-if="isVisible" class="flex flex-col gap-2 pb-2">
            <div class="sticky top-0 right-0 flex w-full flex-col gap-2">
                <div class="flex items-center justify-between">
                    <div class="text-sm font-bold">{{ progressPercentage }}%</div>
                </div>
                <div class="bg-secondary h-2 w-full rounded-full">
                    <div class="bg-accent h-full rounded-full" :style="{ width: progressPercentage + '%' }"></div>
                </div>
            </div>
            <div class="max-h-96 w-full overflow-x-hidden overflow-y-auto">
                <div v-for="item in queueItems.filter((item: IQueueItem) => item.status != 'finished')" :key="item.id" class="flex flex-col gap-2 pb-2">
                    <div class="flex flex-row items-center justify-between">
                        <div class="flex flex-col">
                            <div class="w-5/6 text-sm font-normal">
                                {{ item.file_name }}
                            </div>
                            <div class="text-muted-foreground text-muted-foreground flex gap-1 text-sm font-normal">
                                <div class="uppercase">
                                    {{ item.status }}
                                </div>
                                |
                                <div class="font-semibold">
                                    {{ timeAgo(new Date(item.created_at)) }}
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col">
                            <div v-if="item.status != 'failed' && item.status != 'finished'" class="flex size-5 flex-row items-center justify-center gap-1 rounded-full text-xs text-yellow-500">
                                <div class="materialSymbolsFilled px24 animate-spin">progress_activity</div>
                            </div>
                            <div v-else-if="item.status == 'failed'" class="bg-destructive flex size-5 flex-row items-center justify-center gap-1 rounded-full text-xs">
                                <div class="materialSymbolsFilled px24">error</div>
                            </div>
                            <div v-else class="bg-accent flex size-5 flex-row items-center justify-center gap-1 rounded-full text-xs">
                                <div class="materialSymbolsFilled px24">done</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="queueItems.filter((item: IQueueItem) => item.status != 'finished').length > 0" class="text-foreground before:border-border after:border-border text-foreground before:border-border after:border-border flex items-center py-3 text-sm before:me-6 before:flex-1 before:border-t after:ms-6 after:flex-1 after:border-t">FINISHED</div>
                <div v-for="item in queueItems.filter((item: IQueueItem) => item.status == 'finished')" :key="item.id" class="flex flex-col gap-2 pb-2">
                    <div class="flex flex-row items-center justify-between">
                        <div class="flex flex-col">
                            <div class="w-5/6 text-sm font-normal">
                                {{ item.file_name }}
                            </div>
                            <div class="text-muted-foreground text-muted-foreground flex gap-1 text-sm font-normal">
                                <div class="uppercase">
                                    {{ item.status }}
                                </div>
                                |
                                <div class="font-semibold">
                                    {{ timeAgo(new Date(item.created_at)) }}
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col">
                            <div v-if="item.status != 'failed' && item.status != 'finished'" class="flex size-5 flex-row items-center justify-center gap-1 rounded-full text-xs text-yellow-500">
                                <div class="materialSymbolsFilled px24 animate-spin">progress_activity</div>
                            </div>
                            <div v-else-if="item.status == 'failed'" class="bg-destructive flex size-5 flex-row items-center justify-center gap-1 rounded-full text-xs">
                                <div class="materialSymbolsFilled px24">error</div>
                            </div>
                            <div v-else class="bg-accent flex size-5 flex-row items-center justify-center gap-1 rounded-full text-xs">
                                <div class="materialSymbolsFilled px24">done</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="flex flex-row items-center gap-1">
            <div class="bg-secondary h-2 w-full rounded-full">
                <div class="bg-accent h-full rounded-full" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <div class="flex items-center justify-between">
                <div class="text-sm font-bold">{{ progressPercentage }}%</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    // ---------------| Composables |---------------------
    const rag = useRag()

    // ---------------| State |--------------------------
    const queueItems = ref<Array<any>>([])
    const isVisible = ref<boolean>(true)

    // ---------------| Computed |-------------------------
    const progressPercentage = computed(() => {
        const totalItems = queueItems.value.length
        if (totalItems === 0) return 0

        const totalProgress = queueItems.value.reduce((accumulator, item: IQueueItem) => {
            const PROGRESS_TIME_IN_SECONDS = 15 * 60
            const PROGRESS_FILE_SIZE = 8434805
            const TIME_PER_BYTE = PROGRESS_TIME_IN_SECONDS / PROGRESS_FILE_SIZE
            const estimatedTime = item.file_size * TIME_PER_BYTE

            const currentTime = Date.now()
            const elapsedTime = (currentTime - new Date(item.created_at).getTime()) / 1000
            let progress = 0

            if (item.status === "failed" || item.status.includes("_failed") || item.status == "in_queue" || item.status == "waiting") {
                progress = 0
            } else {
                const timeRatio = Math.min(elapsedTime / estimatedTime, 1)
                progress = Math.round(timeRatio * 100)
            }
            return accumulator + progress
        }, 0)
        return Math.round(totalProgress / totalItems)
    })
    // ---------------| Functions |---------------------
    function toggleVisibility() {
        isVisible.value = !isVisible.value
    }

    function timeAgo(date: string | Date): string {
        const now = new Date()
        const pastDate = new Date(date)

        const seconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000)

        let interval: number

        interval = Math.floor(seconds / 31536000) // years
        if (interval >= 1) {
            return `${interval} year${interval > 1 ? "s" : ""} ago`
        }

        interval = Math.floor(seconds / 2592000) // months
        if (interval >= 1) {
            return `${interval} month${interval > 1 ? "s" : ""} ago`
        }

        interval = Math.floor(seconds / 86400) // days
        if (interval >= 1) {
            return `${interval} day${interval > 1 ? "s" : ""} ago`
        }

        interval = Math.floor(seconds / 3600) // hours
        if (interval >= 1) {
            return `${interval} hour${interval > 1 ? "s" : ""} ago`
        }

        interval = Math.floor(seconds / 60) // minutes
        if (interval >= 1) {
            return `${interval} minute${interval > 1 ? "s" : ""} ago`
        }

        return "just now"
    }

    async function fetchQueueItems() {
        const _queueItems = await rag.getQueueItemsByEmail()
        queueItems.value = []
        _queueItems.forEach((item: IQueueItem) => {
            const last24Hours = new Date().getTime() - 24 * 60 * 60 * 1000
            if (!item.isArchive && (item.status !== "finished" || item.created_at > last24Hours)) {
                queueItems.value.push(item)
            }
        })
    }

    async function archiveItems() {
        await rag.archiveQueueItemsByEmail()
        await fetchQueueItems()
    }

    onMounted(() => {
        fetchQueueItems() //
        const intervalId = setInterval(fetchQueueItems, 10000)
        onBeforeUnmount(() => {
            clearInterval(intervalId)
        })
    })
</script>
