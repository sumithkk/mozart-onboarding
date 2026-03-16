<template>
    <div ref="rootContainer" class="flex h-full w-full flex-col overflow-hidden rounded-lg bg-white shadow-lg outline-none dark:bg-[#1e1e1e]" @keydown="handleKeydown" :class="{ 'fullscreen-mode': isFullscreen }">
        <!-- Top Navigation Bar -->
        <div class="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-[#252526]">
            <!-- Left: Navigation -->
            <div v-if="!hasError" class="flex items-center gap-2">
                <button @click="pageFlipper(-1)" :disabled="currentPage <= 1" :class="['flex items-center rounded p-1 text-sm transition-all', currentPage <= 1 ? 'cursor-not-allowed opacity-30' : 'hover:bg-gray-100 dark:hover:bg-gray-700']" aria-label="Previous Page">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
                <span class="min-w-[70px] text-center text-sm font-medium text-gray-700 dark:text-gray-300"> {{ currentPage }} / {{ totalPages }} </span>
                <button @click="pageFlipper(1)" :disabled="currentPage >= totalPages" :class="['flex items-center rounded p-1 text-sm transition-all', currentPage >= totalPages ? 'cursor-not-allowed opacity-30' : 'hover:bg-gray-100 dark:hover:bg-gray-700']" aria-label="Next Page">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </div>

            <!-- Right: Zoom controls and actions -->
            <div v-if="!hasError" class="flex items-center gap-2">
                <!-- Zoom controls -->
                <button @click="zoomOut" :disabled="hasError" class="flex items-center rounded p-1.5 text-sm transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-700" aria-label="Zoom Out">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
                        <path d="M8 11h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </button>
                <span class="min-w-[50px] text-center text-sm font-medium text-gray-700 dark:text-gray-300">{{ (scale * 100).toFixed(0) }}%</span>
                <button @click="zoomIn" :disabled="hasError" class="flex items-center rounded p-1.5 text-sm transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-700" aria-label="Zoom In">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
                        <path d="M11 8v6M8 11h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </button>

                <!-- Search button -->
                <button @click="toggleSearch" :disabled="hasError" class="flex items-center rounded p-1.5 text-sm transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-700" aria-label="Search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
                        <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </button>

                <!-- Separator -->
                <div class="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600"></div>

                <!-- Print button -->
                <button @click="printPdf" :disabled="hasError" class="flex items-center rounded p-1.5 text-sm transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-700" aria-label="Print PDF">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M6 14h12v8H6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>

                <!-- Fullscreen button -->
                <button @click="toggleFullscreen" :disabled="hasError" class="flex items-center rounded p-1.5 text-sm transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-700" :aria-label="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'">
                    <svg v-if="!isFullscreen" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M15 9l6-6m0 0v5m0-5h-5M9 15l-6 6m0 0v-5m0 5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 3v5H3M16 3v5h5M16 21v-5h5M8 21v-5H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Context Window Status Bar -->
        <div v-if="!hasError && showContextStatus" class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-[#2d2d30]">
            <div class="flex items-center gap-3">
                <span class="rounded bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">DEV</span>
                <span class="text-xs text-gray-600 dark:text-gray-400">Context Usage:</span>
                <div class="flex items-center gap-2">
                    <div class="h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div class="h-2 rounded-full transition-all duration-300" :class="contextWindowInfo.percentage > 90 ? 'bg-orange-500' : contextWindowInfo.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'" :style="{ width: `${Math.min(contextWindowInfo.percentage, 100)}%` }"></div>
                    </div>
                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ contextWindowInfo.percentage.toFixed(0) }}%</span>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-xs text-gray-600 dark:text-gray-400">{{ formatTokenCount(contextWindowInfo.current) }} / {{ formatTokenCount(contextWindowInfo.limit) }}</span>
                <button v-if="contextWindowInfo.percentage > 70" @click="showPruningOptions = true" class="text-mozart-blue-600 hover:text-mozart-blue-700 dark:text-mozart-blue-400 dark:hover:text-mozart-blue-300 text-xs font-medium underline">Optimize</button>
            </div>
        </div>

        <!-- Search Panel -->
        <div v-if="showSearch && !hasError" class="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-[#252526]">
            <div class="flex items-center gap-2">
                <div class="relative flex-1">
                    <input
                        v-model="searchQuery"
                        @input="performSearch"
                        @keydown.enter="goToNextResult"
                        @keydown.escape="toggleSearch"
                        type="text"
                        placeholder="Search in document..."
                        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-800"
                        ref="searchInputRef"
                    />
                    <button v-if="searchQuery" @click="clearSearch" class="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Clear search">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </button>
                </div>
                <div v-if="searchQuery" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{{ searchResults.length }} result{{ searchResults.length !== 1 ? "s" : "" }}</span>
                    <button @click="goToPreviousResult" :disabled="currentResultIndex < 0" class="rounded p-1 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-700" aria-label="Previous result">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                    <button @click="goToNextResult" :disabled="currentResultIndex >= searchResults.length - 1" class="rounded p-1 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-700" aria-label="Next result">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
            <!-- Search Results List -->
            <div v-if="searchQuery && searchResults.length > 0" class="mt-3 max-h-64 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
                <div v-for="(result, index) in searchResults" :key="`${result.page}-${index}`" @click="goToSearchResult(result.page, index)" :class="['cursor-pointer border-b border-gray-100 px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800', currentResultIndex === index ? 'bg-mozart-blue-50 dark:bg-mozart-blue-900/20' : '']">
                    <div class="flex items-center justify-between">
                        <span class="font-medium text-gray-700 dark:text-gray-300">Page {{ result.page }}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Match {{ index + 1 }} of {{ searchResults.length }}</span>
                    </div>
                    <p class="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{{ result.preview }}</p>
                </div>
            </div>
            <div v-else-if="searchQuery && searchResults.length === 0" class="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">No results found</div>
        </div>

        <!-- Progress Bar (shown when loading) -->
        <div v-if="isLoading && !hasError" class="h-1 w-full bg-gray-200 dark:bg-gray-700">
            <div class="bg-mozart-blue-700 h-1 transition-all duration-300 ease-out" :style="{ width: `${loadingProgress}%` }"></div>
        </div>

        <!-- Live Region -->
        <div aria-live="polite" class="sr-only" role="status">
            <span v-if="isLoading">Loading PDF... {{ loadingProgress.toFixed(0) }}%</span>
            <span v-else-if="hasError">Error loading PDF: {{ errorMessage }}</span>
            <span v-else>Page {{ currentPage }} of {{ totalPages }}</span>
        </div>

        <!-- PDF Area -->
        <div ref="fileWrapper" class="relative flex flex-1 items-start justify-center overflow-auto bg-gray-100 p-6 dark:bg-[#1e1e1e]">
            <!-- Error State -->
            <div v-if="hasError" class="flex h-full w-full flex-col items-center justify-center text-center">
                <div class="mb-4">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-red-500">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                        <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </div>
                <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Failed to Load PDF</h3>
                <p class="mb-4 max-w-md text-gray-600 dark:text-gray-400">
                    {{ errorMessage }}
                </p>
                <button @click="retryLoading" class="hover:bg-mozart-blue-700 bg-mozart-blue-700 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    Retry
                </button>
            </div>

            <!-- Loading Overlay -->
            <div v-if="isLoading && !hasError" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100 dark:bg-[#1e1e1e]">
                <div class="mt-4 text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Loading PDF... {{ loadingProgress.toFixed(0) }}%</p>
                    <div class="mt-2 h-2 w-48 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div class="bg-mozart-blue-700 h-2 rounded-full transition-all duration-300 ease-out" :style="{ width: `${loadingProgress}%` }"></div>
                    </div>
                </div>
            </div>

            <!-- PDF Content (completely recreated on retry or URL change) -->
            <PDFLoader v-if="!hasError && shouldShowPdf" :key="`${props.fileUrl}-${retryCount}`" ref="pdfLoaderRef" :file-url="props.fileUrl" :current-page="currentPage" :scale="scale" :container-ref="fileWrapper" @progress="onPdfProgress" @error="onPdfError" @loaded="onPdfLoaded" @text-loaded="onPdfTextLoaded" />
        </div>

        <!-- Thumbnail Strip -->
        <div v-if="!hasError && !isLoading && showThumbnails" class="flex items-center gap-3 border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-[#252526]">
            <div ref="thumbnailContainer" class="scrollbar-hide flex flex-1 gap-3 overflow-x-auto scroll-smooth">
                <button
                    v-for="page in visibleThumbnailPages"
                    :key="page"
                    @click="goToPage(page)"
                    :class="['relative flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white shadow-sm transition-all dark:bg-gray-800', currentPage === page ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600']"
                    :style="{ width: '80px', height: '106px' }"
                >
                    <div class="relative h-full w-full">
                        <PDFThumbnail v-if="shouldLoadThumbnail(page)" :file-url="props.fileUrl" :page-number="page" :key="`thumb-${page}`" />
                        <div class="absolute right-0 bottom-0 left-0 bg-white/95 px-1 py-0.5 text-center dark:bg-gray-800/95">
                            <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ page }}</span>
                        </div>
                    </div>
                </button>
            </div>
        </div>

        <!-- Pruning Options Modal -->
        <div v-if="showPruningOptions" class="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
            <div class="bg-card mx-4 max-w-md rounded-lg p-6">
                <h3 class="text-foreground mb-4 text-lg font-semibold">Optimize Conversation Context</h3>
                <p class="text-muted-foreground mb-4 text-sm">Your conversation is using {{ contextWindowInfo.percentage.toFixed(0) }}% of the available context. We can temporarily hide older messages to make room for new content.</p>
                <div class="space-y-3">
                    <button 
                        @click="performIntelligentPruning" 
                        class="bg-primary hover:bg-primary/90 w-full rounded-lg px-4 py-2 text-sm text-white transition-colors"
                    >
                        Hide Older Messages
                    </button>
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

    const rootContainer = ref<HTMLElement | null>(null)
    const fileWrapper = ref<HTMLElement | null>(null)
    const closeBtn = ref<HTMLElement | null>(null)
    const downloadBtn = ref(null)
    const pageInputRef = ref<HTMLInputElement | null>(null)
    const thumbnailContainer = ref<HTMLElement | null>(null)
    const isFullscreen = ref(false)

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
    const modelContextWindowThreshold = computed(() => modelStore.current.context_window || 10000)

    // New UI state
    const activeTab = ref("file")
    const isDarkMode = ref(false)
    const showSearch = ref(false)
    const showThumbnails = ref(true)

    // Search functionality
    const searchQuery = ref("")
    const searchResults = ref<Array<{ page: number; preview: string }>>([])
    const currentResultIndex = ref(-1)
    const searchInputRef = ref<HTMLInputElement | null>(null)
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

        await nextTick()
        try {
            const pdfDoc = pdfLoaderRef.value?.pdfDocument?.value
            if (!pdfDoc) return

            const page = await pdfDoc.getPage(1)
            const viewport = page.getViewport({ scale: 1 })
            const containerWidth = fileWrapper.value?.clientWidth || 800
            const fitScale = containerWidth / viewport.width

            // Force reactivity to update zoom% display
            scale.value = 0
            await nextTick()
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
        console.log('🟢 performIntelligentPruning called in PDFViewerModal')
        console.log('props.totalTokens:', props.totalTokens)
        console.log('pageRange:', pageRange.value)
        
        if (!props.totalTokens) {
            console.log('❌ No totalTokens, aborting')
            return
        }

        // Estimate tokens needed for current page range
        const estimatedTokens = (pageRange.value[1] - pageRange.value[0] + 1) * 1000
        console.log('estimatedTokens:', estimatedTokens)

        const result = messagePruning.intelligentPruning(estimatedTokens)
        console.log('Pruning result:', result)

        if (result.prunedCount > 0) {
            console.log(`✅ Successfully hidden ${result.prunedCount} message(s). Remaining tokens: ${result.remainingTokens.toLocaleString()}`)
        } else {
            console.log('ℹ️ No messages needed to be hidden')
        }

        showPruningOptions.value = false
        console.log('Modal closed')
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
        document.addEventListener("fullscreenchange", handleFullscreenChange)
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
        document.addEventListener("msfullscreenchange", handleFullscreenChange)
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
        document.removeEventListener("fullscreenchange", handleFullscreenChange)
        document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
        document.removeEventListener("msfullscreenchange", handleFullscreenChange)
    })

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            if (showSearch.value) {
                toggleSearch()
            } else if (isFullscreen.value) {
                toggleFullscreen()
            } else {
                closeModal()
            }
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
        } else if (e.key === "f" && (e.ctrlKey || e.metaKey) && !hasError) {
            // Ctrl/Cmd + F to open search
            e.preventDefault()
            if (!showSearch.value) {
                toggleSearch()
            } else {
                searchInputRef.value?.focus()
            }
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
        scale.value = Math.min(scale.value + 0.1, 3.0)
    }

    function zoomOut() {
        if (hasError.value) return
        scale.value = Math.max(scale.value - 0.1, 0.5)
    }

    async function fitToScreen() {
        if (hasError.value) return

        try {
            const pdfDoc = pdfLoaderRef.value?.pdfDocument?.value
            if (!pdfDoc) return

            const page = await pdfDoc.getPage(currentPage.value)
            const viewport = page.getViewport({ scale: 1 })
            const containerWidth = fileWrapper.value?.clientWidth || 800
            const fitScale = (containerWidth - 48) / viewport.width // 48px for padding

            scale.value = Math.max(0.5, Math.min(fitScale, 3.0))
        } catch (error) {
            console.error("Error calculating fit-to-screen zoom:", error)
        }
    }

    async function toggleFullscreen() {
        if (hasError.value) return

        try {
            if (!document.fullscreenElement) {
                // Enter fullscreen
                const el = rootContainer.value
                if (el) {
                    if (el.requestFullscreen) {
                        await el.requestFullscreen()
                    } else if ((el as any).webkitRequestFullscreen) {
                        // Safari support
                        await (el as any).webkitRequestFullscreen()
                    } else if ((el as any).msRequestFullscreen) {
                        // IE/Edge support
                        await (el as any).msRequestFullscreen()
                    }
                }
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    await document.exitFullscreen()
                } else if ((document as any).webkitExitFullscreen) {
                    await (document as any).webkitExitFullscreen()
                } else if ((document as any).msExitFullscreen) {
                    await (document as any).msExitFullscreen()
                }
            }
        } catch (error) {
            console.error("Error toggling fullscreen:", error)
        }
    }

    function handleFullscreenChange() {
        isFullscreen.value = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement)
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
        if (showSearch.value) {
            nextTick(() => {
                searchInputRef.value?.focus()
            })
        } else {
            clearSearch()
        }
    }

    function performSearch() {
        if (!searchQuery.value.trim() || !props.documentParsedData) {
            searchResults.value = []
            currentResultIndex.value = -1
            return
        }

        const query = searchQuery.value.trim().toLowerCase()
        const results: Array<{ page: number; preview: string }> = []

        // Iterate through all pages in documentParsedData
        // Format: { [page]: {text: string, tokens: number} }
        Object.keys(props.documentParsedData).forEach((pageKey) => {
            const pageNum = parseInt(pageKey, 10)
            if (isNaN(pageNum)) return

            const pageData = props.documentParsedData[pageKey]
            // Handle both formats: {text: string, tokens: number} or just string (backward compatibility)
            const pageText = typeof pageData === "object" && pageData !== null && "text" in pageData ? pageData.text : typeof pageData === "string" ? pageData : null

            if (!pageText || typeof pageText !== "string") return

            const lowerText = pageText.toLowerCase()
            if (lowerText.includes(query)) {
                // Find the position of the match
                const matchIndex = lowerText.indexOf(query)
                const start = Math.max(0, matchIndex - 50)
                const end = Math.min(pageText.length, matchIndex + query.length + 50)
                const preview = pageText.substring(start, end).trim()

                results.push({
                    page: pageNum,
                    preview: preview || pageText.substring(0, 100).trim(),
                })
            }
        })

        // Sort results by page number
        results.sort((a, b) => a.page - b.page)
        searchResults.value = results
        currentResultIndex.value = results.length > 0 ? 0 : -1

        // Navigate to first result if available
        if (results.length > 0) {
            goToSearchResult(results[0].page, 0)
        }
    }

    function goToSearchResult(page: number, index: number) {
        currentPage.value = page
        currentResultIndex.value = index
    }

    function goToNextResult() {
        if (searchResults.value.length === 0) return
        const nextIndex = currentResultIndex.value + 1
        if (nextIndex < searchResults.value.length) {
            const result = searchResults.value[nextIndex]
            goToSearchResult(result.page, nextIndex)
        }
    }

    function goToPreviousResult() {
        if (searchResults.value.length === 0) return
        const prevIndex = currentResultIndex.value - 1
        if (prevIndex >= 0) {
            const result = searchResults.value[prevIndex]
            goToSearchResult(result.page, prevIndex)
        }
    }

    function clearSearch() {
        searchQuery.value = ""
        searchResults.value = []
        currentResultIndex.value = -1
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
        appearance: textfield;
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

    /* Fullscreen mode styles */
    :fullscreen {
        background: #1e1e1e;
    }

    :-webkit-full-screen {
        background: #1e1e1e;
    }

    :-moz-full-screen {
        background: #1e1e1e;
    }

    :-ms-fullscreen {
        background: #1e1e1e;
    }

    .fullscreen-mode {
        width: 100vw;
        height: 100vh;
        border-radius: 0;
    }
</style>
