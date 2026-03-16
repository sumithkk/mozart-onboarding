<template>
    <!-- Outer container that controls scrolling and responsive widths -->
    <div class="max-h-full overflow-auto p-5">
        <!-- Your responsive grid -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" :style="{ 'grid-template-columns': 'repeat(auto-fit, minmax(300px, 1fr))' }">
            <div v-for="worker in workers" :key="worker.id" class="rounded-xl border border-gray-200 bg-white p-4 shadow transition md:p-5 dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-neutral-700/70">
                <div class="mb-4 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-neutral-700">
                    <div v-html="badgeHTML(worker.worker_type)"></div>
                    <div v-html="workerStatusHTML(worker.state, worker.last_ping)"></div>
                </div>
                <div class="mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Worker Name:
                        <div class="text-base text-gray-500 dark:text-neutral-400">
                            {{ worker.name }}
                        </div>
                    </h3>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Worker Id:
                        <div class="text-base text-gray-500 dark:text-neutral-400">
                            {{ worker.id }}
                        </div>
                    </h3>
                    <div class="mt-2 text-sm text-gray-500 dark:text-neutral-400">
                        <span>Created At: {{ formatDate(worker.created_at) }}</span>
                        <br />
                        <span>Updated At: {{ formatDate(worker.updated_at) }}</span>
                    </div>
                </div>
                <div class="my-6 border-t border-gray-200 dark:border-neutral-600" />
                <div>
                    <h4 class="font-semibold text-gray-700 dark:text-white">GPU Information</h4>
                    <div class="mt-2 text-sm" v-if="worker.gpus && worker.gpus.length > 0">
                        <div class="text-gray-900 dark:text-neutral-300">
                            GPU Name:
                            <span class="font-bold dark:text-white">
                                {{ worker.gpus[0].gpu_name }}
                            </span>
                        </div>
                        <div class="text-gray-500 dark:text-neutral-400">
                            Cuda:
                            {{ worker.gpus[0].cuda_capability_major }}.
                            {{ worker.gpus[0].cuda_capability_minor }}
                        </div>
                        <div class="text-gray-500 dark:text-neutral-400">
                            Memory:
                            {{ worker.gpus[0].memory_total_mb > 0 ? worker.gpus[0].memory_total_mb + "MB" : "No Memory" }}
                        </div>
                        <div class="text-gray-500 dark:text-neutral-400">
                            Processors:
                            {{ worker.gpus[0].multi_processor_count > 0 ? worker.gpus[0].multi_processor_count + "x" : "No Processors" }}
                        </div>
                    </div>
                </div>
                <div class="my-6 border-t border-gray-200 dark:border-neutral-600" />
                <div>
                    <div class="flex items-center justify-between">
                        <h4 class="font-semibold text-gray-700 dark:text-white">Queue</h4>
                        <div class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-neutral-400">
                            <div v-html="queueStatusHTML(worker.items_in_queue)"></div>
                        </div>
                    </div>
                    <div class="text-sm text-gray-500 dark:text-neutral-400">Avg. Wait Time: {{ formatTime(worker.average_wait_time) }} seconds</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    //----------------------| Page Meta |---------------------
    definePageMeta({ layout: "mozart-rag-service-admin", middleware: ["auth"] })

    //----------------------| Head |---------------------
    useHead({ title: "Rag Admin" })

    //----------------------| Data |---------------------

    const workers = ref<IWorkerItem[]>([])
    //----------------------| Utility Methods |---------------------
    const formatDate = (timestamp: number) => {
        if (!timestamp) return ""

        const date = new Date(timestamp * 1000)
        return date.toLocaleString()
    }

    const queueStatusHTML = (items_in_queue: number) => {
        return items_in_queue > 0 ? `<span class="text-mozart-blue font-medium">${items_in_queue} File(s)</span>` : `<span class="text-green-600 font-medium">Queue Empty</span>`
    }

    const workerStatusHTML = (state: IWorkerItem["state"], last_ping: number) => {
        const currentTime = new Date().getTime()
        const timeDifference = currentTime - last_ping * 1000

        if (state === "disabled") {
            return ` <div>
      <span class="py-1 px-2 inline-flex items-center gap-x-1 text-xs bg-gray-100 text-gray-800 rounded-full dark:bg-neutral-500/20 dark:text-neutral-400">
        <svg class="shrink-0 size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
          <line x1="12" x2="12" y1="2" y2="12"></line>
        </svg>
        Disabled
      </span>
    </div>
  </div>`
        } else {
            if (timeDifference < 120000) {
                return `<div>
      <span class="py-1 px-2 inline-flex items-center gap-x-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full dark:bg-teal-500/10 dark:text-teal-500">
        <svg class="shrink-0 size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
        Online
      </span>
    </div>`
            } else if (timeDifference < 300000) {
                return ` <div>
      <span class="py-1 px-1.5 inline-flex items-center gap-x-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-500/10 dark:text-blue-500">
        <svg class="shrink-0 size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" x2="12" y1="2" y2="6"></line>
          <line x1="12" x2="12" y1="18" y2="22"></line>
          <line x1="4.93" x2="7.76" y1="4.93" y2="7.76"></line>
          <line x1="16.24" x2="19.07" y1="16.24" y2="19.07"></line>
          <line x1="2" x2="6" y1="12" y2="12"></line>
          <line x1="18" x2="22" y1="12" y2="12"></line>
          <line x1="4.93" x2="7.76" y1="19.07" y2="16.24"></line>
          <line x1="16.24" x2="19.07" y1="7.76" y2="4.93"></line>
        </svg>
        Loading
      </span>
    </div>`
            } else {
                return `  <div>
      <span class="py-1 px-1.5 inline-flex items-center gap-x-1 text-xs font-medium bg-red-100 text-red-800 rounded-full dark:bg-red-500/10 dark:text-red-500">
        <svg class="shrink-0 size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <path d="M12 9v4"></path>
          <path d="M12 17h.01"></path>
        </svg>
        Offline
      </span>
    </div>`
            }
        }
    }

    const badgeHTML = (type: IWorkerItem["worker_type"]) => {
        const badgeType = { local: `<span class="py-1.5 px-3 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-800/30 dark:text-blue-500">Local</span>`, cloud: `<span class="py-1.5 px-3 text-xs bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-800/30 dark:text-yellow-500">Cloud</span>` }
        return badgeType[type] || `<span class="py-1.5 px-3 text-xs bg-gray-100 text-gray-800 rounded-full">Unknown</span>`
    }

    const formatTime = (time: number): string => `${time}s`

    onMounted(async () => {
        const workerData = await useRag().getAllWorkers()
        workers.value = workerData
    })
</script>
