<template>
    <div class="bg-card flex h-full w-full flex-col overflow-hidden rounded-xl shadow-2xl outline-none" @keydown="handleKeydown">
        <!-- Tab Bar -->
        <div class="bg-card border-border flex items-center justify-between border-b px-4 py-2">
            <div class="flex items-center gap-4">
                <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="['pb-1 text-sm font-medium transition-all', activeTab === tab.id ? 'text-foreground border-primary border-b-2' : 'text-muted-foreground hover:text-foreground']">
                    {{ tab.label }}
                </button>
            </div>
        </div>

        <!-- Toolbar -->
        <div class="bg-card/70 border-border flex items-center justify-between border-b px-4 py-2.5 backdrop-blur-md">
            <!-- Left: Navigation -->
            <div v-if="!hasError" class="flex items-center gap-1">
                <button @click="pageFlipper(-1)" :disabled="currentPage <= 1" :class="['text-foreground flex items-center rounded-md p-1 text-sm transition-all', currentPage <= 1 ? 'cursor-not-allowed opacity-40' : 'hover:bg-secondary']" aria-label="Previous Page">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
                <span class="text-foreground min-w-[80px] text-center text-sm font-medium"> {{ currentPage }} / {{ totalPages }} </span>
                <button @click="pageFlipper(1)" :disabled="currentPage >= totalPages" :class="['text-foreground flex items-center rounded-md p-1 text-sm transition-all', currentPage >= totalPages ? 'cursor-not-allowed opacity-40' : 'hover:bg-secondary']" aria-label="Next Page">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </div>

            <!-- Center: Zoom controls -->
            <div v-if="!hasError" class="flex items-center gap-1">
                <button @click="zoomOut" :disabled="hasError" class="text-foreground hover:bg-secondary flex items-center rounded-md p-1.5 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-40" aria-label="Zoom Out">
                    <span class="material-symbols-outlined text-lg">remove</span>
                </button>
                <span class="text-foreground min-w-[60px] text-center text-sm font-medium"> {{ (scale * 100).toFixed(0) }}% </span>
                <button @click="zoomIn" :disabled="hasError" class="text-foreground hover:bg-secondary flex items-center rounded-md p-1.5 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-40" aria-label="Zoom In">
                    <span class="material-symbols-outlined text-lg">add</span>
                </button>
            </div>

            <!-- Right: View options -->
            <div v-if="!hasError" class="flex items-center gap-1">
                <button @click="toggleSearch" class="text-foreground hover:bg-secondary flex items-center rounded-md p-1.5 text-sm transition-all" aria-label="Search">
                    <span class="material-symbols-outlined text-lg">search</span>
                </button>
                <button @click="toggleFullscreen" :disabled="hasError" class="text-foreground hover:bg-secondary flex items-center rounded-md p-1.5 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-40" aria-label="Toggle Fullscreen">
                    <span class="material-symbols-outlined text-lg">fullscreen</span>
                </button>
                <button @click="printPdf" :disabled="hasError" class="text-foreground hover:bg-secondary flex items-center rounded-md p-1.5 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-40" aria-label="Print PDF">
                    <span class="material-symbols-outlined text-lg">print</span>
                </button>
                <button @click="downloadPdf" ref="downloadBtn" :disabled="hasError" class="text-foreground hover:bg-secondary flex items-center rounded-md p-1.5 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-40" aria-label="Download PDF">
                    <span class="material-symbols-outlined text-lg">download</span>
                </button>
                <div class="bg-border mx-1 h-4 w-px"></div>
                <button @click="toggleTheme" class="text-foreground hover:bg-secondary flex items-center rounded-md p-1.5 text-sm transition-all" aria-label="Toggle Theme">
                    <span class="material-symbols-outlined text-lg">{{ isDarkMode ? "light_mode" : "dark_mode" }}</span>
                </button>
            </div>
        </div>

        <!-- Context Window Status Bar -->
        <div v-if="!hasError && showContextStatus" class="bg-secondary border-border border-b px-4 py-2">
            <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                    <span class="text-muted-foreground">Context Usage:</span>
                    <div class="flex items-center gap-1">
                        <div class="h-2 w-20 rounded-full bg-white">
                            <div class="h-2 rounded-full transition-all duration-300" :class="contextWindowInfo.percentage > 80 ? 'bg-orange-500' : contextWindowInfo.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'" :style="{ width: `${Math.min(contextWindowInfo.percentage, 100)}%` }"></div>
                        </div>
                        <span class="text-muted-foreground">{{ contextWindowInfo.percentage.toFixed(0) }}%</span>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-muted-foreground">{{ formatTokenCount(contextWindowInfo.current) }} / {{ formatTokenCount(contextWindowInfo.limit) }}</span>
                    <button v-if="contextWindowInfo.percentage > 70" @click="showPruningOptions = true" class="text-primary hover:text-primary/80 text-xs underline">Optimize</button>
                </div>
            </div>
        </div>

        <!-- Show range selector button if hidden and document exceeds token limit -->
        <div v-if="!hasError && !showRangeSlider && shouldShowRangeSlider" class="bg-card border-b px-4 py-2">
            <div class="flex flex-col justify-center">
                <button @click="toggleRangeSlider" class="text-primary hover:text-primary/40 text-xs transition-colors">Show page range</button>
                <div class="text-muted-foreground mt-2 text-center text-xs">Using pages {{ pageRange[0] }} to {{ pageRange[1] }} for response</div>
            </div>
        </div>

        <!-- Range Slider Section -->
        <div v-if="!hasError && showRangeSlider" class="bg-card/50 border-b px-4 py-4">
            <div class="mb-4 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-muted-foreground text-sm font-medium">Page Range</span>
                    <span class="range-display bg-primary/30 text-primary inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-all duration-300">
                        <span class="bg-primary h-1.5 w-1.5 rounded-full"></span>
                        {{ getSelectedPagesDisplay() }}
                    </span>
                </div>
                <button @click="toggleRangeSlider" class="text-muted-foreground hover:text-foreground text-xs transition-colors">Hide</button>
            </div>

            <!-- Page Range Validation Warning -->
            <div v-if="pageRangeWarning" class="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20">
                <div class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-lg text-orange-600">warning</span>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-orange-800 dark:text-orange-200">{{ pageRangeWarning.title }}</p>
                        <p class="mt-1 text-sm text-orange-700 dark:text-orange-300">{{ pageRangeWarning.message }}</p>
                        <div v-if="pageRangeWarning.suggestedRange" class="mt-2 flex items-center gap-2">
                            <button @click="applySuggestedRange" class="rounded bg-orange-600 px-3 py-1 text-xs text-white transition-colors hover:bg-orange-700">Use Suggested Range</button>
                            <span class="text-xs text-orange-600 dark:text-orange-400"> Pages {{ pageRangeWarning.suggestedRange[0] }}-{{ pageRangeWarning.suggestedRange[1] }} </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Range Slider -->
            <div class="mb-4 w-full px-2">
                <RangeSlider v-model="pageRange" :min="minPage" :max="maxPage" :step="1" :maxGap="maxGap" />
            </div>

            <!-- Range Info -->
            <div class="text-muted-foreground text-muted-foreground mb-4 flex items-center justify-between text-xs">
                <span>Using pages {{ pageRange[0] }} to {{ pageRange[1] }} for response</span>
                <span>{{ pageRange[1] - pageRange[0] + 1 }} pages selected</span>
            </div>

            <!-- Custom Page Range Input -->
            <div class="space-y-3">
                <div class="flex items-center gap-2">
                    <div class="relative flex-1">
                        <input
                            v-model="customPageRange"
                            @keydown.enter="applyCustomPageRange"
                            type="text"
                            placeholder="Enter specific pages (e.g., 1-5, 10, 15-20)"
                            class="border-border text-muted-foreground focus:border-primary/60 focus:ring-primary/60/20 hover:border-border border-border bg-card text-foreground focus:border-primary focus:ring-ring/20 hover:border-border w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 focus:ring-1 focus:outline-none"
                            :disabled="hasError"
                        />
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span class="text-muted-foreground text-xs opacity-60">↵</span>
                        </div>
                    </div>
                    <button @click="applyCustomPageRange" :disabled="hasError || !customPageRange.trim()" class="bg-primary text-foreground hover:bg-primary bg-primary hover:bg-primary rounded-lg px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40">Apply</button>
                </div>
                <div class="text-muted-foreground text-muted-foreground text-xs"><span class="font-medium">Format:</span> Single pages (1,3,5), ranges (1-5), or mixed (1-3,5,7-9)</div>
            </div>
        </div>

        <!-- Progress Bar (shown when loading) -->
        <div v-if="isLoading && !hasError" class="bg-card bg-secondary h-1 w-full">
            <div class="bg-primary h-1 transition-all duration-300 ease-out" :style="{ width: `${loadingProgress}%` }"></div>
        </div>

        <!-- Live Region -->
        <div aria-live="polite" class="sr-only" role="status">
            <span v-if="isLoading">Loading PDF... {{ loadingProgress.toFixed(0) }}%</span>
            <span v-else-if="hasError">Error loading PDF: {{ errorMessage }}</span>
            <span v-else>Page {{ currentPage }} of {{ totalPages }}</span>
        </div>

        <!-- PDF Area -->
        <div ref="fileWrapper" class="bg-card relative flex flex-1 items-start justify-center overflow-auto bg-[#1c1c1c] p-4">
            <!-- Left Navigation Arrow -->
            <button 
                v-if="!hasError && !isLoading && currentPage > 1"
                @click="previousPage"
                class="fixed left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white shadow-lg transition-all hover:bg-black/80 hover:scale-110"
                aria-label="Previous page"
                title="Previous page (←)"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>

            <!-- Right Navigation Arrow -->
            <button 
                v-if="!hasError && !isLoading && currentPage < totalPages"
                @click="nextPage"
                class="fixed right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white shadow-lg transition-all hover:bg-black/80 hover:scale-110"
                aria-label="Next page"
                title="Next page (→)"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>

            <!-- Error State -->
            <div v-if="hasError" class="flex h-full w-full flex-col items-center justify-center text-center">
                <div class="mb-4">
                    <span class="material-symbols-outlined text-destructive text-destructive/60 text-6xl">error</span>
                </div>
                <h3 class="text-foreground mb-2 text-xl font-semibold">Failed to Load PDF</h3>
                <p class="text-muted-foreground text-muted-foreground mb-4 max-w-md">
                    {{ errorMessage }}
                </p>
                <button @click="retryLoading" class="bg-primary text-foreground hover:bg-primary rounded-lg px-4 py-2 transition-colors">
                    <span class="material-symbols-outlined mr-1 text-sm">refresh</span>
                    Retry
                </button>
            </div>

            <!-- Loading Overlay -->
            <div v-if="isLoading && !hasError" class="bg-card absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#1c1c1c]">
                <div class="mt-4 text-center">
                    <p class="text-muted-foreground text-muted-foreground text-sm">Loading PDF... {{ loadingProgress.toFixed(0) }}%</p>
                    <div class="bg-card bg-secondary mt-2 h-2 w-48 rounded-full">
                        <div class="bg-primary h-2 rounded-full transition-all duration-300 ease-out" :style="{ width: `${loadingProgress}%` }"></div>
                    </div>
                </div>
            </div>

            <!-- PDF Content (completely recreated on retry or URL change) -->
            <PDFLoader v-if="!hasError && shouldShowPdf" :key="`${props.fileUrl}-${retryCount}-${scale}`" ref="pdfLoaderRef" :file-url="props.fileUrl" :current-page="currentPage" :scale="scale" :container-ref="fileWrapper" @progress="onPdfProgress" @error="onPdfError" @loaded="onPdfLoaded" @text-loaded="onPdfTextLoaded" />
        </div>

        <!-- Thumbnail Strip -->
        <div v-if="!hasError && !isLoading && showThumbnails" class="bg-card border-border flex items-center gap-2 border-t px-4 py-3">
            <button @click="scrollThumbnails(-1)" class="text-foreground hover:bg-secondary flex-shrink-0 rounded-md p-1 transition-all">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
            <div ref="thumbnailContainer" class="scrollbar-hide flex flex-1 gap-2 overflow-x-auto scroll-smooth">
                <button v-for="page in visibleThumbnailPages" :key="page" @click="goToPage(page)" :class="['flex-shrink-0 overflow-hidden rounded-md border-2 transition-all', currentPage === page ? 'border-primary ring-primary/30 ring-2' : 'hover:border-primary/50 border-transparent']" :style="{ width: '80px', height: '100px' }">
                    <div class="bg-secondary relative h-full w-full">
                        <PDFThumbnail v-if="shouldLoadThumbnail(page)" :file-url="props.fileUrl" :page-number="page" :pdf-document="sharedPdfDocument" :key="`thumb-${page}`" />
                        <div class="bg-card/90 absolute right-0 bottom-0 left-0 px-1 py-0.5 text-center">
                            <span class="text-foreground text-xs">{{ page }}</span>
                        </div>
                    </div>
                </button>
            </div>
            <button @click="scrollThumbnails(1)" class="text-foreground hover:bg-secondary flex-shrink-0 rounded-md p-1 transition-all">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
        </div>

        <!-- Pruning Options Modal -->
        <div v-if="showPruningOptions" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showPruningOptions = false">
            <div class="bg-card mx-4 max-w-md rounded-lg p-6">
                <h3 class="text-foreground mb-4 text-lg font-semibold">Optimize Conversation Context</h3>
                <p class="text-muted-foreground mb-4 text-sm">Your conversation is using {{ contextWindowInfo.percentage.toFixed(0) }}% of the available context. We can temporarily hide older messages to make room for new content.</p>
                <div class="space-y-3">
                    <button @click="performIntelligentPruning" class="bg-primary hover:bg-primary/90 w-full rounded-lg px-4 py-2 text-sm text-white transition-colors">Hide Older Messages</button>
                    <button @click="showPruningOptions = false" class="bg-secondary text-foreground hover:bg-secondary/80 w-full rounded-lg px-4 py-2 text-sm transition-colors">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed, type PropType } from "vue"
    import RangeSlider from "@/components/ui/compose/RangeSlider.vue"
    import PDFLoader from "@/components/common/file-viewer/PDFLoader.vue"
    import PDFThumbnail from "@/components/common/file-viewer/PDFThumbnail.vue"
    import { useModelStore } from "~/store/models"
    import { useMessagePruning } from "~/composables/useMessagePruning"
    import { useConversationStore } from "~/store/conversations"

    const modelStore = useModelStore()
    const messagePruning = useMessagePruning()
    const conversationStore = useConversationStore()

    const props = defineProps({
        fileUrl: {
            type: String,
            required: true,
        },
        fileName: String,
        pageNumber: Number,
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
    const emit = defineEmits(["close", "pageRangeChange"])

    const fileWrapper = ref<HTMLElement | null>(null)
    const closeBtn = ref<HTMLElement | null>(null)
    const downloadBtn = ref(null)
    const pageInputRef = ref<HTMLInputElement | null>(null)
    const thumbnailContainer = ref<HTMLElement | null>(null)

    const totalPages = ref(0)
    const currentPage = ref(1)
    const scale = ref(1)
    const isLoading = ref(true)
    const hasError = ref(false)
    const errorMessage = ref("")
    const loadingProgress = ref(0)
    const retryCount = ref(0)
    const shouldShowPdf = ref(true)
    const pdfLoaderRef = ref<{ print: () => void; pdfDocument?: any } | null>(null)
    const sharedPdfDocument = ref<any>(null)
    const modelContextWindowThreshold = computed(() => modelStore.current.context_window || 10000)

    // New UI state
    const activeTab = ref("file")
    const isDarkMode = ref(false)
    const showSearch = ref(false)
    const showThumbnails = ref(true)
    const tabs = [
        { id: "file", label: "File View" },
        { id: "commit", label: "Commit Usage" },
    ]

    // Thumbnail functionality
    const visibleThumbnailPages = computed(() => {
        const pages = []
        for (let i = 1; i <= totalPages.value; i++) {
            pages.push(i)
        }
        return pages
    })

    // Page input functionality
    const pageInput = ref("")
    const customPageRange = ref("")

    // Range slider state
    const showRangeSlider = ref(false)
    const showRangeInfo = ref(false)
    const pageRange = ref<[number, number]>([1, 1])
    const minPage = ref(1)
    const maxPage = ref(100)
    const maxGap = ref(20)

    // Context window management
    const showContextStatus = ref(true)
    const showPruningOptions = ref(false)
    const pageRangeWarning = ref<{
        title: string
        message: string
        suggestedRange?: [number, number]
    } | null>(null)

    // Computed property to determine if range slider should be shown
    const shouldShowRangeSlider = computed(() => {
        return props.totalTokens > modelContextWindowThreshold.value
    })

    // Context window information
    const contextWindowInfo = computed(() => {
        return messagePruning.getContextWindowInfo(props.totalTokens)
    })

    // Event handlers for PDF loading
    function onPdfProgress({ loaded, total, progress }: { loaded: number; total: number; progress: number }) {
        loadingProgress.value = Math.min(progress, 100)
    }

    function onPdfError(message: string) {
        hasError.value = true
        isLoading.value = false
        errorMessage.value = message
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

    async function onPdfLoaded({ pdf, pages }: { pdf: any; pages: number }) {
        totalPages.value = pages
        isLoading.value = false
        loadingProgress.value = 100

        // Store the shared PDF document for thumbnails
        sharedPdfDocument.value = pdf

        await nextTick()
        try {
            const pdfDoc = pdfLoaderRef.value?.pdfDocument?.value
            if (!pdfDoc) return

            const page = await pdfDoc.getPage(1)
            const viewport = page.getViewport({ scale: 1 })
            const containerWidth = fileWrapper.value?.clientWidth || 800
            const fitScale = containerWidth / viewport.width

            scale.value = Math.max(0.5, Math.min(fitScale, 3.0))
        } catch (error) {
            console.error("Error calculating auto-fit zoom:", error)
        }
    }

    function onPdfTextLoaded(value: any) {
        // optional text extract logic
        console.log("PDF text loaded")
    }

    function retryLoading() {
        console.log("Starting PDF retry for same URL...")

        // Reset all states
        hasError.value = false
        errorMessage.value = ""
        isLoading.value = true
        loadingProgress.value = 0
        totalPages.value = 0
        currentPage.value = 1
        sharedPdfDocument.value = null

        // Hide and show PDF component to force complete recreation
        shouldShowPdf.value = false

        nextTick(() => {
            shouldShowPdf.value = true
            retryCount.value += 1
            console.log("PDF retry initiated, attempt:", retryCount.value)
            console.log("Attempting to reload PDF:", props.fileUrl)
        })
    }

    function toggleRangeSlider() {
        showRangeSlider.value = !showRangeSlider.value
        if (showRangeSlider.value) {
            validateCurrentPageRange()
        }
    }

    // Validate page range against context window
    function validateCurrentPageRange() {
        if (!props.documentParsedData) return

        const validation = messagePruning.validatePageRangeRequest(props.totalTokens, props.documentParsedData, pageRange.value)

        if (!validation.isFeasible) {
            pageRangeWarning.value = {
                title: "Page Range Too Large",
                message: validation.warningMessage || "The selected page range exceeds the model's capacity.",
                suggestedRange: validation.suggestedRange,
            }
        } else {
            pageRangeWarning.value = null
        }
    }

    // Apply suggested page range
    function applySuggestedRange() {
        if (pageRangeWarning.value?.suggestedRange) {
            pageRange.value = pageRangeWarning.value.suggestedRange
            pageRangeWarning.value = null
        }
    }

    // Perform intelligent pruning
    function performIntelligentPruning() {
        if (!props.totalTokens) return

        // Estimate tokens needed for current page range
        const estimatedTokens = (pageRange.value[1] - pageRange.value[0] + 1) * 1000

        const result = messagePruning.intelligentPruning(estimatedTokens)

        if (result.prunedCount > 0) {
            console.log(`✅ Successfully hidden ${result.prunedCount} message(s)`)
        }

        showPruningOptions.value = false
    }

    // Format token count for display
    function formatTokenCount(tokens: number): string {
        if (tokens >= 1000000) {
            return `${(tokens / 1000000).toFixed(1)}M`
        } else if (tokens >= 1000) {
            return `${(tokens / 1000).toFixed(0)}K`
        }
        return tokens.toString()
    }

    // Watch for page range changes and emit events
    watch(
        () => pageRange.value,
        (newRange) => {
            // Emit the page range change to parent
            emit("pageRangeChange", newRange)

            // Show info if range is not the full document
            if (newRange[0] !== minPage.value || newRange[1] !== maxPage.value) {
                showRangeInfo.value = true
            } else {
                showRangeInfo.value = false
            }

            // Validate the new range
            validateCurrentPageRange()
        },
        { deep: true, immediate: true }
    )

    // Watch for fileUrl changes to reset component state
    watch(
        () => props.fileUrl,
        (newUrl, oldUrl) => {
            if (newUrl !== oldUrl) {
                // Reset all states
                hasError.value = false
                errorMessage.value = ""
                isLoading.value = true
                loadingProgress.value = 0
                totalPages.value = 0
                currentPage.value = 1
                scale.value = 1
                pageInput.value = ""
                customPageRange.value = ""
                sharedPdfDocument.value = null

                // Reset page range to defaults
                pageRange.value = [1, 1]
                showRangeSlider.value = false
                showRangeInfo.value = false
                pageRangeWarning.value = null

                // Extract page number from new URL
                currentPage.value = extractPageFromUrl(newUrl)
            }
        }
    )

    onMounted(() => {
        document.addEventListener("keydown", handleKeydown)
        nextTick(() => {
            closeBtn.value?.focus()
        })

        if (props.pageNumber) {
            currentPage.value = props.pageNumber
        } else {
            currentPage.value = extractPageFromUrl(props.fileUrl)
            clearSelection()
        }

        // Initialize with props if provided
        if (props.totalPages > 0) {
            maxPage.value = props.totalPages
            minPage.value = 0
            maxGap.value = Math.floor(props.totalPages / 5)
        }

        if (props.initialPageRange && (props.initialPageRange as [number, number])[1] > 0) {
            pageRange.value = props.initialPageRange as [number, number]
        } else {
            // Default to first chunk if no initial range is provided
            const chunkSize = Math.max(Math.floor(props.totalPages * 0.2), 10)
            pageRange.value = [0, Math.min(chunkSize, props.totalPages)]
        }
    })

    onBeforeUnmount(() => {
        document.removeEventListener("keydown", handleKeydown)
    })

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            closeModal()
        } else if (e.key === "ArrowLeft" && !hasError) {
            pageFlipper(-1)
        } else if (e.key === "ArrowRight" && !hasError) {
            pageFlipper(1)
        } else if ((e.key === "+" || e.key === "=") && !hasError) {
            zoomIn()
        } else if (e.key === "-" && !hasError) {
            zoomOut()
        } else if (e.key === "g" && (e.ctrlKey || e.metaKey) && !hasError) {
            // Ctrl/Cmd + G to focus on page input
            e.preventDefault()
            pageInputRef.value?.focus()
        }
    }

    function closeModal() {
        emit("close")
        setTimeout(() => {
            ;(document.activeElement as HTMLElement)?.blur()
        }, 10)
    }

    function pageFlipper(move: number) {
        if (hasError.value) return
        const newPage = currentPage.value + move
        if (newPage >= 1 && newPage <= totalPages.value) {
            currentPage.value = newPage
        }
    }

    function zoomIn() {
        if (hasError.value) return
        scale.value = Math.min(scale.value + 0.25, 3.0)
    }

    function zoomOut() {
        if (hasError.value) return
        scale.value = Math.max(scale.value - 0.25, 0.5)
    }

    function toggleFullscreen() {
        if (hasError.value) return
        const el = fileWrapper.value
        if (el?.requestFullscreen) el.requestFullscreen()
        else if (document.fullscreenElement) document.exitFullscreen()
    }

    async function downloadPdf() {
        if (!props.fileUrl || hasError.value) {
            console.error("No fileUrl provided or PDF has error!")
            return
        }

        try {
            // 1. Fetch the PDF data
            const response = await fetch(props.fileUrl)
            if (!response.ok) {
                throw new Error(`Network error: ${response.status} ${response.statusText}`)
            }

            // 2. Convert to a Blob
            const blob = await response.blob()

            // 3. Create a temporary object URL
            const url = window.URL.createObjectURL(blob)

            // 4. Create a hidden <a> and click it to trigger download
            const link = document.createElement("a")
            link.style.display = "none"
            link.href = url
            link.download = props.fileName ?? "document.pdf"
            document.body.appendChild(link)
            link.click()

            // 5. Clean up: remove the link and revoke the object URL
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error("Failed to download PDF:", err)
        }
    }

    function printPdf() {
        if (hasError.value) return
        if (pdfLoaderRef.value) {
            pdfLoaderRef.value.print()
        }
    }

    function extractPageFromUrl(url: string | null): number {
        if (!url) return 1
        const match = url.match(/#page=(\d+)/)
        return match ? parseInt(match[1], 10) : 1
    }

    function clearSelection() {
        if (window.getSelection) {
            const selection = window.getSelection()
            selection?.removeAllRanges()
        }
    }

    function goToPage(targetPage?: number) {
        if (hasError.value) return

        if (targetPage !== undefined) {
            // Direct page navigation
            if (targetPage >= 1 && targetPage <= totalPages.value) {
                currentPage.value = targetPage
            }
        } else {
            // Input-based navigation
            if (!pageInput.value.trim()) return

            const pageNum = parseInt(pageInput.value.trim(), 10)

            if (pageNum >= 1 && pageNum <= totalPages.value) {
                currentPage.value = pageNum
                pageInput.value = ""
            }
        }
    }

    function nextPage() {
        if (currentPage.value < totalPages.value) {
            goToPage(currentPage.value + 1)
        }
    }

    function previousPage() {
        if (currentPage.value > 1) {
            goToPage(currentPage.value - 1)
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
        if (hasError.value || !customPageRange.value.trim()) return

        try {
            const pages = parsePageRanges(customPageRange.value.trim(), totalPages.value)
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

    function getSelectedPagesDisplay(): string {
        const start = pageRange.value[0]
        const end = pageRange.value[1]

        if (start === end) {
            return `Page ${start}`
        } else {
            return `Pages ${start}-${end}`
        }
    }

    function validatePageInput(event: Event) {
        const target = event.target as HTMLInputElement
        const value = parseInt(target.value, 10)

        if (value < 1) {
            target.value = "1"
        } else if (value > totalPages.value) {
            target.value = totalPages.value.toString()
        }
    }

    function handlePageInputEnter(event: KeyboardEvent) {
        event.preventDefault()
        event.stopPropagation()

        const inputValue = pageInput.value
        if (inputValue !== null && inputValue !== undefined && inputValue !== "") {
            const pageNum = typeof inputValue === "string" ? parseInt(inputValue.trim(), 10) : Number(inputValue)
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages.value) {
                currentPage.value = pageNum
                pageInput.value = ""
            }
        }
    }

    // New functions for enhanced UI
    function toggleTheme() {
        isDarkMode.value = !isDarkMode.value
        // Emit event or update theme in your app's theme system
        document.documentElement.classList.toggle("dark")
    }

    function toggleSearch() {
        showSearch.value = !showSearch.value
    }

    function scrollThumbnails(direction: number) {
        if (thumbnailContainer.value) {
            const scrollAmount = 200 * direction
            thumbnailContainer.value.scrollBy({ left: scrollAmount, behavior: "smooth" })
        }
    }

    function shouldLoadThumbnail(page: number): boolean {
        // Load thumbnails for current page and nearby pages for performance
        const range = 10
        return Math.abs(page - currentPage.value) <= range
    }
</script>

<style>
    .sr-only {
        position: absolute !important;
        width: 1px;
        height: 1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

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

    /* Custom number input styling */
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    input[type="number"] {
        -moz-appearance: textfield;
    }

    /* Hide scrollbar for thumbnail strip */
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
</style>
