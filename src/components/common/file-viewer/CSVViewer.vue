<template>
    <div class="bg-card flex h-full w-full flex-col overflow-scroll rounded-xl bg-[#121212] shadow-2xl outline-none">
        <!-- Zoom controls -->
        <div class="bg-card/70 bg-primary/5 sticky top-0 left-0 z-10 flex w-full items-center justify-between border-b px-4 py-2 backdrop-blur-md">
            <div class="flex items-center gap-2">
                <button @click="previousPage" class="text-foreground hover:bg-card text-foreground hover:bg-secondary flex items-center rounded-2xl p-2 text-base transition-all disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous Page" role="button">
                    <span class="material-symbols-outlined">navigate_before</span>
                </button>
                <span class="text-muted-foreground text-muted-foreground text-xs"> Page {{ currentPage + 1 }} / {{ Math.ceil(allRows.length / rowsPerPage) }} </span>
                <button @click="nextPage" class="text-foreground hover:bg-card text-foreground hover:bg-secondary flex items-center rounded-2xl p-2 text-base transition-all disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next Page" role="button">
                    <span class="material-symbols-outlined">navigate_next</span>
                </button>
            </div>
            <div class="flex items-center gap-2">
                <button @click="zoomOut" class="text-foreground hover:bg-card text-foreground hover:bg-secondary flex items-center rounded-2xl p-2 text-base transition-all disabled:cursor-not-allowed disabled:opacity-40" aria-label="Zoom Out" role="button">
                    <span class="material-symbols-outlined">zoom_out</span>
                </button>
                <span class="text-muted-foreground text-muted-foreground text-xs">{{ (zoomLevel * 100).toFixed(0) }}%</span>
                <button @click="zoomIn" class="text-foreground hover:bg-card text-foreground hover:bg-secondary flex items-center rounded-2xl p-2 text-base transition-all disabled:cursor-not-allowed disabled:opacity-40" aria-label="Zoom In" role="button">
                    <span class="material-symbols-outlined">zoom_in</span>
                </button>
            </div>
        </div>

        <!-- Show range selector button if hidden and document exceeds token limit -->
        <div v-if="shouldShowRangeSlider && !showRangeSlider" class="bg-secondary bg-card border-b px-4 py-2">
            <div class="flex flex-col justify-center">
                <button @click="toggleRangeSlider" class="text-primary hover:text-primary text-primary/60 hover:text-primary/40 text-xs transition-colors">Show row range</button>
                <div class="text-muted-foreground text-muted-foreground mt-2 text-center text-xs">Using rows {{ pageRange[0] }} to {{ pageRange[1] }} for response</div>
            </div>
        </div>

        <!-- Range Slider Section -->
        <div v-if="showRangeSlider" class="bg-secondary/50 bg-card/50 border-b px-4 py-4">
            <div class="mb-4 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-muted-foreground text-muted-foreground text-sm font-medium">Row Range</span>
                    <span class="range-display bg-primary/10 text-primary bg-primary/30 text-primary/40 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-all duration-300">
                        <span class="bg-primary h-1.5 w-1.5 rounded-full"></span>
                        {{ getSelectedPagesDisplay() }}
                    </span>
                </div>
                <button @click="toggleRangeSlider" class="text-muted-foreground hover:text-muted-foreground text-muted-foreground hover:text-foreground text-xs transition-colors">Hide</button>
            </div>

            <!-- Range Slider -->
            <div class="mb-4 w-full px-2">
                <RangeSlider v-model="pageRange" :min="minPage" :max="maxPage" :step="1" :maxGap="maxGap" />
            </div>

            <!-- Range Info -->
            <div class="text-muted-foreground text-muted-foreground mb-4 flex items-center justify-between text-xs">
                <span>Using rows {{ pageRange[0] }} to {{ pageRange[1] }} for response</span>
                <span>{{ pageRange[1] - pageRange[0] + 1 }} rows selected</span>
            </div>

            <!-- Custom Page Range Input -->
            <div class="space-y-3">
                <div class="flex items-center gap-2">
                    <div class="relative flex-1">
                        <input
                            v-model="customPageRange"
                            @keydown.enter="applyCustomPageRange"
                            type="text"
                            placeholder="Enter specific rows (e.g., 1-5, 10, 15-20)"
                            class="border-border text-muted-foreground focus:border-primary/60 focus:ring-primary/60/20 hover:border-border border-border bg-card text-foreground focus:border-primary focus:ring-ring/20 hover:border-border w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 focus:ring-1 focus:outline-none"
                        />
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span class="text-muted-foreground text-xs opacity-60">↵</span>
                        </div>
                    </div>
                    <button @click="applyCustomPageRange" :disabled="!customPageRange.trim()" class="bg-primary text-foreground hover:bg-primary bg-primary hover:bg-primary rounded-lg px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40">Apply</button>
                </div>
                <div class="text-muted-foreground text-muted-foreground text-xs"><span class="font-medium">Format:</span> Single rows (1,3,5), ranges (1-5), or mixed (1-3,5,7-9)</div>
            </div>
        </div>

        <div :style="{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }" class="inline-block">
            <table class="border-border bg-card border-border bg-card min-w-full overflow-hidden rounded-lg border shadow-sm">
                <thead class="bg-secondary bg-secondary sticky top-0 z-10">
                    <tr>
                        <th v-for="(header, index) in headers" :key="index" class="border-border bg-secondary text-muted-foreground border-border bg-secondary text-muted-foreground max-w-[200px] min-w-[120px] border-b px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                            <div class="truncate" :title="header">
                                {{ header }}
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-card bg-card divide-y divide-neutral-200 divide-neutral-700">
                    <tr v-for="(row, index) in currentRows" :key="index" class="hover:bg-secondary hover:bg-secondary transition-colors duration-150 ease-in-out">
                        <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="border-border text-foreground border-border text-foreground max-w-[200px] min-w-[120px] border-b px-4 py-3 text-sm">
                            <div class="truncate" :title="cell">
                                {{ cell }}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref, computed, watch, nextTick } from "vue"
    import * as XLSX from "xlsx"
    import Papa from "papaparse"
    import RangeSlider from "@/components/ui/compose/RangeSlider.vue"

    const modelStore = useModelStore()
    const modelContextWindowThreshold = computed(() => modelStore.current.context_window || 10000)

    const props = defineProps({
        fileUrl: {
            type: String,
            required: true,
        },
        initialPageRange: {
            type: Array,
            default: () => [0, 0],
        },
        totalPages: {
            type: Number,
            default: 0,
        },
        totalTokens: {
            type: Number,
            default: 0,
        },
        documentParsedData: {
            type: Object,
            default: () => {},
        },
    })

    const emit = defineEmits(["pageRangeChange"])

    const currentPage = ref(0)
    const rowsPerPage = 100
    const allRows = ref<any[]>([])
    const headers = ref<any[]>([])

    const zoomLevel = ref(1.0)

    // Range slider state
    const showRangeSlider = ref(false)
    const showRangeInfo = ref(false)
    const pageRange = ref<[number, number]>([1, 1])
    const minPage = ref(1)
    const maxPage = ref(100)
    const maxGap = ref(20)
    const customPageRange = ref("")

    // Computed property to determine if range slider should be shown
    const shouldShowRangeSlider = computed(() => {
        return props.totalTokens > modelContextWindowThreshold.value
    })

    function zoomIn() {
        zoomLevel.value = Math.min(2, zoomLevel.value + 0.1)
    }
    function zoomOut() {
        zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.1)
    }

    async function fetchAndParseFile(url: string) {
        try {
            const response = await fetch(url, {
                credentials: "include",
            })

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`)
            }

            const contentType = response.headers.get("Content-Type") || ""
            const blob = await response.blob()

            let fileExtension = ""
            if (contentType.includes("text/csv") || contentType.includes("application/octet-stream")) {
                fileExtension = "csv"
            } else if (contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") || contentType.includes("application/vnd.ms-excel")) {
                fileExtension = "xlsx"
            } else {
                fileExtension = url.split(".").pop()?.toLowerCase() || ""
            }

            if (fileExtension === "csv") {
                const csvText = await blob.text()
                parseCSV(csvText)
            } else if (fileExtension === "xlsx" || fileExtension === "xls") {
                console.log("fileExtension", fileExtension)
                const arrayBuffer = await blob.arrayBuffer()
                parseXLSX(arrayBuffer)
            } else {
                console.log("fileExtension", fileExtension)
                throw new Error("Unsupported file type")
            }
        } catch (error: any) {
            console.error("Error fetching or parsing file:", error)
        }
    }

    function parseCSV(csvText: string) {
        const result = Papa.parse(csvText, {
            header: false,
            skipEmptyLines: true,
        })
        if (result.errors.length) {
            console.error("Error parsing CSV:", result.errors)
            return
        }
        const data = result.data as any[][]
        if (data.length > 0) {
            headers.value = data[0]
            allRows.value = data.slice(1)

            // Initialize range slider with CSV data
            const totalCsvPages = Math.ceil(allRows.value.length / rowsPerPage)
            maxPage.value = currentPage.value < totalCsvPages ? rowsPerPage : rowsPerPage - (allRows.value.length % rowsPerPage)
            minPage.value = 1

            const averageTokensPerPage = calculateAverageTokensPerPage(props.documentParsedData)
            maxGap.value = Math.floor(modelContextWindowThreshold.value / averageTokensPerPage) - 4 || Math.floor(totalCsvPages / 5) || 10

            // Set initial page range if not already set
            if (pageRange.value[0] === 1 && pageRange.value[1] === 1) {
                const chunkSize = Math.max(Math.floor(totalCsvPages * 0.2), 10)
                pageRange.value = [1, Math.min(chunkSize, totalCsvPages)]
            }
        } else {
            headers.value = []
            allRows.value = []
        }
    }

    function parseXLSX(arrayBuffer: ArrayBuffer) {
        const data = new Uint8Array(arrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 })
        if (jsonData.length > 0) {
            headers.value = jsonData[0] || []
            allRows.value = jsonData.slice(1)

            // Initialize range slider with XLSX data
            const totalCsvPages = Math.ceil(allRows.value.length / rowsPerPage)
            maxPage.value = currentPage.value < totalCsvPages ? rowsPerPage : rowsPerPage - (allRows.value.length % rowsPerPage)
            minPage.value = 1

            const averageTokensPerPage = calculateAverageTokensPerPage(props.documentParsedData)
            maxGap.value = Math.floor(10000 / averageTokensPerPage) - 4 || Math.floor(totalCsvPages / 5) || 10

            // Set initial page range if not already set
            if (pageRange.value[0] === 1 && pageRange.value[1] === 1) {
                const chunkSize = Math.max(Math.floor(totalCsvPages * 0.2), 10)
                pageRange.value = [1, Math.min(chunkSize, totalCsvPages)]
            }
        } else {
            headers.value = []
            allRows.value = []
        }
    }

    const currentRows = computed(() => {
        const start = currentPage.value * rowsPerPage
        return allRows.value.slice(start, start + rowsPerPage)
    })

    function nextPage() {
        if ((currentPage.value + 1) * rowsPerPage < allRows.value.length) {
            currentPage.value += 1
        }
    }

    function previousPage() {
        if (currentPage.value > 0) {
            currentPage.value -= 1
        }
    }

    function calculateAverageTokensPerPage(data: Record<string, { text: string; tokens: number } | number>): number {
        if (!data) return 0
        const pageEntries = Object.entries(data)
            .filter(([key]) => !isNaN(Number(key)))
            .map(([_, value]) => value as { text: string; tokens: number })

        // Calculate total tokens from these pages
        const totalTokens = pageEntries.reduce((sum, page) => sum + page.tokens, 0)

        // Calculate average
        return pageEntries.length > 0 ? totalTokens / pageEntries.length : 0
    }

    function toggleRangeSlider() {
        showRangeSlider.value = !showRangeSlider.value
    }

    function getSelectedPagesDisplay(): string {
        const start = pageRange.value[0]
        const end = pageRange.value[1]

        if (start === end) {
            return `Row ${start}`
        } else {
            return `Rows ${start}-${end}`
        }
    }

    function parsePageRanges(input: string, maxPages: number): number[] {
        const pages: number[] = []
        const parts = input.split(",").map((part) => part.trim())

        for (const part of parts) {
            if (/^\d+$/.test(part)) {
                // Single page number
                const page = parseInt(part, 10)
                if (page >= 1 && page <= maxPages) {
                    pages.push(page)
                }
            } else if (/^\d+-\d+$/.test(part)) {
                // Page range (e.g., "1-5")
                const [start, end] = part.split("-").map((num) => parseInt(num, 10))
                if (start >= 1 && end <= maxPages && start <= end) {
                    for (let i = start; i <= end; i++) {
                        pages.push(i)
                    }
                }
            }
        }

        return [...new Set(pages)].sort((a, b) => a - b) // Remove duplicates and sort
    }

    function applyCustomPageRange() {
        if (!customPageRange.value.trim()) return

        try {
            // For CSV, we'll use the total number of rows as max pages
            const totalRows = allRows.value.length
            const pages = parsePageRanges(customPageRange.value.trim(), Math.ceil(totalRows / rowsPerPage))
            if (pages.length > 0) {
                // Set the page range to cover all specified pages
                const minPage = Math.min(...pages)
                const maxPage = Math.max(...pages)
                pageRange.value = [minPage, maxPage]
                customPageRange.value = ""

                // Show success feedback
                showSuccessFeedback()
            }
        } catch (error) {
            console.warn("Invalid custom page range format:", error)
        }
    }

    function showSuccessFeedback() {
        // Add a temporary success class to the range display
        const rangeDisplay = document.querySelector(".range-display")
        if (rangeDisplay) {
            rangeDisplay.classList.add("success-feedback")
            setTimeout(() => {
                rangeDisplay.classList.remove("success-feedback")
            }, 1000)
        }
    }

    // Watch for page range changes and emit events
    watch(
        () => pageRange.value,
        (newRange) => {
            // Emit the page range change to parent
            const range = newRange.map((row: number) => row + currentPage.value * rowsPerPage)
            emit("pageRangeChange", range)

            // Show info if range is not the full document
            if (newRange[0] !== minPage.value || newRange[1] !== maxPage.value) {
                showRangeInfo.value = true
            } else {
                showRangeInfo.value = false
            }
        },
        { deep: true, immediate: true }
    )

    onMounted(() => {
        fetchAndParseFile(props.fileUrl)

        // Initialize with props if provided
        if (props.totalPages > 0) {
            const totalCsvPages = Math.ceil(props.totalPages / rowsPerPage)
            maxPage.value = totalCsvPages
            minPage.value = 1
            maxGap.value = Math.floor(totalCsvPages / 5) || 10
        }

        if (props.initialPageRange && (props.initialPageRange as [number, number])[1] > 0) {
            pageRange.value = props.initialPageRange as [number, number]
        } else {
            // Default to first chunk if no initial range is provided
            const chunkSize = Math.max(Math.floor((props.totalPages || 100) * 0.2), 10)
            pageRange.value = [1, Math.min(chunkSize, props.totalPages || 10)]
        }
    })
</script>

<style>
    .success-feedback {
        animation: successPulse 0.6s ease-in-out;
    }

    @keyframes successPulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
            background-color: rgb(34 197 94);
            color: white;
        }
        100% {
            transform: scale(1);
        }
    }
</style>
