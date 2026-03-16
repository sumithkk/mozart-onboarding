<template>
    <div class="flex">
        <div>
            <div v-for="(status, key) in sortedTimeline" :key="key" class="flex gap-x-3 py-1">
                <!-- Left Content -->
                <div class="w-16 text-end">
                    <span class="text-muted-foreground text-xs">
                        {{ formatTimestamp(status.startAt) }}
                    </span>
                </div>

                <!-- Icon -->
                <div class="after:bg-secondary relative after:absolute after:start-3.5 after:top-7 after:bottom-0 after:w-px after:-translate-x-[5px] last:after:hidden">
                    <!-- Loading -->
                    <div v-if="getState(status).state === 'loading'" class="inline-block size-5 animate-spin rounded-full border-[3px] border-current border-t-transparent text-yellow-600" role="status" aria-label="loading">
                        <span class="sr-only">Loading...</span>
                    </div>

                    <!-- Success -->
                    <div v-if="getState(status).state === 'success'" class="size-5 stroke-green-600 stroke-2" role="status" aria-label="success">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M7.75 12L10.58 14.83L16.25 9.17004" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>

                    <!-- Waiting -->
                    <div v-if="getState(status).state === 'waiting'" class="size-5 stroke-green-600 stroke-2" role="status" aria-label="waiting">
                        <div class="bg-primary flex size-5 items-center justify-center rounded-full">
                            <div class="bg-background size-2 rounded-full"></div>
                        </div>
                    </div>

                    <!-- Error -->
                    <div v-if="getState(status).state === 'error'" class="size-5 stroke-red-600 stroke-2" role="status" aria-label="error">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 9V14" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12.0001 21.41H5.94005C2.47005 21.41 1.02005 18.93 2.70005 15.9L5.82006 10.28L8.76006 5.00003C10.5401 1.79003 13.4601 1.79003 15.2401 5.00003L18.1801 10.29L21.3001 15.91C22.9801 18.94 21.5201 21.42 18.0601 21.42H12.0001V21.41Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M11.9945 17H12.0035" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>

                <!-- Right Content -->
                <div class="grow pt-0.5 pb-8">
                    <h3 class="text-foreground flex gap-x-1.5 font-semibold">
                        {{ getStageName(key) }}
                    </h3>
                    <p class="text-muted-foreground mt-1 text-sm">{{ getState(status).text }} - {{ formatTimeEscaped(getState(status).timeTook || 0) }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    //----------------------| Props |---------------------
    const props = defineProps({
        timeline: {
            type: Object,
            required: true,
        },
    })

    //----------------------| Utility Methods |---------------------
    const formatTimestamp = (timestamp: number) => {
        if (!timestamp || timestamp === 0) return ""
        const date = new Date(timestamp)
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const formatTimeEscaped = (milliseconds: number) => {
        const seconds = milliseconds
        if (seconds < 60) {
            return `${seconds.toFixed(1)} sec${seconds !== 1 ? "s" : ""}`
        }
        let mins = Math.floor(seconds / 60)
        let remainingSeconds = seconds % 60
        if (mins < 60) {
            return `${mins} min${mins !== 1 ? "s" : ""}${remainingSeconds > 0 ? ` ${remainingSeconds.toFixed(1)} sec${remainingSeconds > 1 ? "s" : ""}` : ""}`
        }
        let hours = Math.floor(mins / 60)
        let remainingMins = mins % 60
        return `${hours} hour${hours > 1 ? "s" : ""}${remainingMins > 0 ? ` ${remainingMins} min${remainingMins > 1 ? "s" : ""}` : ""}`
    }

    const getStageName = (key: string | number) => {
        const names: any = {
            waiting: "Waiting in Queue",
            in_queue: "In Queue",
            downloading: "Downloading",
            processing: "Processing",
            converting: "Converting",
            generating_embeddings: "Generating Embeddings",
            storing_embeddings_to_database: "Storing Embeddings",
            cleanup: "Cleanup",
            finished: "Finished",
        }
        return names[key] || key
    }

    type TimelineStage = {
        startAt?: number | null
        endAt?: number | null
        failedAt?: number | null
    }

    type GetStateResult = { state: "waiting"; text: string } | { state: "loading"; text: string; timeTook: number } | { state: "success"; text: string; timeTook: number } | { state: "error"; text: string; timeTook: number } | { state: "unknown"; text: string }

    const round1 = (n: number) => Math.round(n * 10) / 10
    const secsBetween = (a: number, b: number) => round1(Math.max(0, (b - a) / 1000))

    function getState(t: TimelineStage, now = Date.now()): GetStateResult {
        // Normalize/guard
        const startAt = t.startAt ?? 0
        const endAt = t.endAt ?? 0
        const failedAt = t.failedAt ?? 0

        // Nothing has happened
        if (startAt === 0 && endAt === 0 && failedAt === 0) {
            return { state: "waiting", text: "Waiting" }
        }

        // Start scheduled in the future (clock skew / queued with future start)
        if (startAt > now && endAt === 0 && failedAt === 0) {
            return { state: "waiting", text: "Waiting" }
        }

        // If both end & fail exist, decide by whichever happened last
        if (endAt > 0 && failedAt > 0) {
            if (endAt >= failedAt) {
                return { state: "success", text: "Finished", timeTook: secsBetween(startAt, endAt) }
            } else {
                return { state: "error", text: "Failed", timeTook: secsBetween(startAt, failedAt) }
            }
        }

        // Finished successfully
        if (startAt > 0 && endAt > 0 && failedAt === 0) {
            return { state: "success", text: "Finished", timeTook: secsBetween(startAt, endAt) }
        }

        // Failed
        if (startAt > 0 && failedAt > 0 && endAt === 0) {
            return { state: "error", text: "Failed", timeTook: secsBetween(startAt, failedAt) }
        }

        // In progress
        if (startAt > 0 && endAt === 0 && failedAt === 0) {
            return { state: "loading", text: "Currently in progress", timeTook: secsBetween(startAt, now) }
        }

        // Fallback
        return { state: "unknown", text: "Unknown" }
    }

    //----------------------| Computed |---------------------
    const sortedTimeline = computed(() => {
        return Object.entries(props.timeline)
            .sort(([, a], [, b]) => {
                // Handle startAt = 0 by treating it as Infinity for sorting
                const startA = a.startAt === 0 ? Infinity : a.startAt
                const startB = b.startAt === 0 ? Infinity : b.startAt

                // Sort based on startAt, placing 0 (non-scheduled) at the bottom
                return startA - startB
            })
            .reduce((acc: { [key: string]: any }, [key, value]) => {
                acc[key] = value
                return acc
            }, {})
    })
</script>
