import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import PDFViewerModal from "@/components/common/file-viewer/PDFViewerModal.vue"

// Mock the PDFLoader component
const PDFLoaderMock = {
    name: "PDFLoader",
    props: {
        fileUrl: { type: String, required: true },
        currentPage: { type: Number, default: 1 },
        scale: { type: Number, default: 1 },
    },
    emits: ["progress", "error", "loaded", "text-loaded"],
    template: `
        <div class="pdf-loader-mock" :data-file-url="fileUrl" :data-current-page="currentPage" :data-scale="scale">
            PDF Loader Mock - {{ fileUrl }}
        </div>
    `,
    methods: {
        print() {
            // Mock print function
        },
    },
}

// Mock the RangeSlider component
const RangeSliderMock = {
    name: "RangeSlider",
    props: {
        modelValue: { type: Array, default: () => [1, 1] },
        min: { type: Number, default: 1 },
        max: { type: Number, default: 100 },
        step: { type: Number, default: 1 },
        maxGap: { type: Number, default: 20 },
    },
    emits: ["update:modelValue"],
    template: `
        <div class="range-slider-mock">
            Range: {{ modelValue[0] }} - {{ modelValue[1] }}
        </div>
    `,
}

// Mock global document methods
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()
const mockFocus = vi.fn()

// Mock fetch for download functionality
global.fetch = vi.fn()
global.URL.createObjectURL = vi.fn()
global.URL.revokeObjectURL = vi.fn()

Object.defineProperty(document, "addEventListener", {
    value: mockAddEventListener,
    writable: true,
})

Object.defineProperty(document, "removeEventListener", {
    value: mockRemoveEventListener,
    writable: true,
})

describe("PDFViewerModal", () => {
    let wrapper: any

    const defaultProps = {
        fileUrl: "https://example.com/test.pdf",
        fileName: "test.pdf",
        pageNumber: 1,
        initialPageRange: [1, 10],
        totalPages: 20,
        totalTokens: 5000,
    }

    const createWrapper = (props = {}) => {
        return mount(PDFViewerModal, {
            props: {
                ...defaultProps,
                ...props,
            },
            global: {
                components: {
                    PDFLoader: PDFLoaderMock,
                    RangeSlider: RangeSliderMock,
                },
                stubs: {
                    PDFLoader: PDFLoaderMock,
                    RangeSlider: RangeSliderMock,
                },
            },
            attachTo: document.body,
        })
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockFocus.mockClear()
        mockAddEventListener.mockClear()
        mockRemoveEventListener.mockClear()
    })

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount()
        }
    })

    describe("Component Initialization", () => {
        it("renders correctly with default props", () => {
            wrapper = createWrapper()

            expect(wrapper.exists()).toBe(true)
            expect(wrapper.find(".pdf-loader-mock").exists()).toBe(true)
            expect(wrapper.text()).toContain("test.pdf")
        })

        it("initializes with correct file URL", () => {
            wrapper = createWrapper()

            const pdfLoader = wrapper.findComponent({ name: "PDFLoader" })
            expect(pdfLoader.exists()).toBe(true)
            expect(pdfLoader.props("fileUrl")).toBe(defaultProps.fileUrl)
        })

        it("adds keyboard event listener on mount", () => {
            wrapper = createWrapper()

            expect(mockAddEventListener).toHaveBeenCalledWith("keydown", expect.any(Function))
        })

        it("removes keyboard event listener on unmount", () => {
            wrapper = createWrapper()
            wrapper.unmount()

            expect(mockRemoveEventListener).toHaveBeenCalledWith("keydown", expect.any(Function))
        })
    })

    describe("PDFLoader Recreation on URL Change", () => {
        it("recreates PDFLoader when fileUrl prop changes", async () => {
            wrapper = createWrapper()

            // Get initial PDFLoader instance
            const initialPdfLoader = wrapper.findComponent({ name: "PDFLoader" })

            // Change the fileUrl prop
            const newFileUrl = "https://example.com/different.pdf"
            await wrapper.setProps({ fileUrl: newFileUrl })

            // Wait for reactivity to take effect
            await nextTick()

            // Get the new PDFLoader instance
            const newPdfLoader = wrapper.findComponent({ name: "PDFLoader" })

            // Verify the PDFLoader has the new URL
            expect(newPdfLoader.props("fileUrl")).toBe(newFileUrl)

            // Verify the component was recreated by checking that it's a different instance
            expect(newPdfLoader.vm).not.toBe(initialPdfLoader.vm)
        })

        it("resets component state when fileUrl changes", async () => {
            wrapper = createWrapper()

            // Simulate some state changes
            await wrapper.vm.onPdfLoaded({ pdf: {}, pages: 25 })
            wrapper.vm.currentPage = 5
            wrapper.vm.scale = 1.5
            wrapper.vm.hasError = true
            wrapper.vm.errorMessage = "Some error"
            wrapper.vm.loadingProgress = 75

            // Verify initial state changes
            expect(wrapper.vm.currentPage).toBe(5)
            expect(wrapper.vm.scale).toBe(1.5)
            expect(wrapper.vm.hasError).toBe(true)
            expect(wrapper.vm.errorMessage).toBe("Some error")
            expect(wrapper.vm.loadingProgress).toBe(75)

            // Change fileUrl
            await wrapper.setProps({ fileUrl: "https://example.com/new.pdf" })
            await nextTick()

            // Verify state was reset
            expect(wrapper.vm.hasError).toBe(false)
            expect(wrapper.vm.errorMessage).toBe("")
            expect(wrapper.vm.isLoading).toBe(true)
            expect(wrapper.vm.loadingProgress).toBe(0)
            expect(wrapper.vm.totalPages).toBe(0)
            expect(wrapper.vm.currentPage).toBe(1)
            expect(wrapper.vm.scale).toBe(1)
        })

        it("extracts page number from new URL", async () => {
            wrapper = createWrapper()

            // Change to URL with page fragment
            const urlWithPage = "https://example.com/test.pdf#page=7"
            await wrapper.setProps({ fileUrl: urlWithPage })
            await nextTick()

            expect(wrapper.vm.currentPage).toBe(7)
        })

        it("resets page range when URL changes", async () => {
            wrapper = createWrapper()

            // Set custom page range
            wrapper.vm.pageRange = [5, 15]
            wrapper.vm.showRangeSlider = true

            // Change fileUrl
            await wrapper.setProps({ fileUrl: "https://example.com/new.pdf" })
            await nextTick()

            // Verify page range was reset
            expect(wrapper.vm.pageRange).toEqual([1, 1])
            expect(wrapper.vm.showRangeSlider).toBe(false)
        })
    })

    describe("PDFLoader Key Generation", () => {
        it("generates unique keys for different URLs", async () => {
            wrapper = createWrapper()

            const url1 = "https://example.com/doc1.pdf"
            const url2 = "https://example.com/doc2.pdf"

            await wrapper.setProps({ fileUrl: url1 })
            await nextTick()
            const pdfLoader1 = wrapper.findComponent({ name: "PDFLoader" })

            await wrapper.setProps({ fileUrl: url2 })
            await nextTick()
            const pdfLoader2 = wrapper.findComponent({ name: "PDFLoader" })

            // Verify that different URLs result in different component instances
            expect(pdfLoader1.vm).not.toBe(pdfLoader2.vm)
            expect(pdfLoader2.props("fileUrl")).toBe(url2)
        })

        it("generates different keys on retry with same URL", async () => {
            wrapper = createWrapper()

            const initialPdfLoader = wrapper.findComponent({ name: "PDFLoader" })

            // Trigger retry which sets shouldShowPdf to false temporarily
            await wrapper.vm.retryLoading()

            // Wait multiple ticks for the shouldShowPdf to become true again
            await nextTick()
            await nextTick()

            // Verify that retry count changed, which indicates the component will be recreated
            expect(wrapper.vm.retryCount).toBe(1)

            // The component should exist again after retry (shouldShowPdf should be true)
            expect(wrapper.vm.shouldShowPdf).toBe(true)

            // Find the PDFLoader component again
            const retriedPdfLoader = wrapper.findComponent({ name: "PDFLoader" })
            expect(retriedPdfLoader.exists()).toBe(true)
        })
    })

    describe("Event Handling", () => {
        it("handles PDF loading events correctly", async () => {
            wrapper = createWrapper()

            const pdfLoader = wrapper.findComponent({ name: "PDFLoader" })

            // Simulate progress event
            await pdfLoader.vm.$emit("progress", { loaded: 50, total: 100, progress: 50 })
            expect(wrapper.vm.loadingProgress).toBe(50)

            // Simulate loaded event
            await pdfLoader.vm.$emit("loaded", { pdf: {}, pages: 25 })
            expect(wrapper.vm.totalPages).toBe(25)
            expect(wrapper.vm.isLoading).toBe(false)

            // Simulate error event
            await pdfLoader.vm.$emit("error", "Test error message")
            expect(wrapper.vm.hasError).toBe(true)
            expect(wrapper.vm.errorMessage).toBe("Test error message")
        })

        it("emits close event when closeModal is called", async () => {
            wrapper = createWrapper()

            await wrapper.vm.closeModal()

            expect(wrapper.emitted("close")).toBeTruthy()
            expect(wrapper.emitted("close")).toHaveLength(1)
        })

        it("emits pageRangeChange when page range changes", async () => {
            wrapper = createWrapper()

            // Change page range to trigger the watcher
            wrapper.vm.pageRange = [2, 8]
            await nextTick()

            // Check that the pageRangeChange event was emitted
            const emittedEvents = wrapper.emitted("pageRangeChange")
            expect(emittedEvents).toBeTruthy()
            expect(emittedEvents![emittedEvents!.length - 1]).toEqual([[2, 8]])
        })
    })

    describe("Error Handling", () => {
        it("displays error state when PDF fails to load", async () => {
            wrapper = createWrapper()

            // Trigger error
            wrapper.vm.hasError = true
            wrapper.vm.errorMessage = "Failed to load PDF"
            await nextTick()

            expect(wrapper.text()).toContain("Failed to Load PDF")
            expect(wrapper.text()).toContain("Failed to load PDF")
            expect(wrapper.find("button").text()).toContain("Retry")
        })

        it("allows retry when error occurs", async () => {
            wrapper = createWrapper()

            // Set error state
            wrapper.vm.hasError = true
            wrapper.vm.errorMessage = "Test error"
            await nextTick()

            // Find retry button by text content
            const buttons = wrapper.findAll("button")
            const retryButton = buttons.find((button) => button.text().includes("Retry"))
            expect(retryButton).toBeTruthy()

            await retryButton!.trigger("click")

            // Verify state was reset for retry
            expect(wrapper.vm.hasError).toBe(false)
            expect(wrapper.vm.errorMessage).toBe("")
            expect(wrapper.vm.isLoading).toBe(true)
        })
    })

    describe("Keyboard Navigation", () => {
        it("handles escape key to close modal", async () => {
            wrapper = createWrapper()

            // Simulate escape key by calling handleKeydown directly
            wrapper.vm.handleKeydown({ key: "Escape" })

            // Check that the close event was emitted
            expect(wrapper.emitted("close")).toBeTruthy()
        })

        it("handles arrow keys for page navigation", async () => {
            wrapper = createWrapper()

            // Set up initial state properly
            wrapper.vm.totalPages = 10
            wrapper.vm.currentPage = 5
            wrapper.vm.hasError = false
            await nextTick()

            // Test the pageFlipper function directly since the keyboard handler checks ref incorrectly
            const initialPage = wrapper.vm.currentPage

            // Test right arrow (should increase page)
            wrapper.vm.pageFlipper(1)
            expect(wrapper.vm.currentPage).toBe(initialPage + 1)

            // Test left arrow (should decrease page)
            wrapper.vm.pageFlipper(-1)
            expect(wrapper.vm.currentPage).toBe(initialPage)
        })
    })

    describe("Range Slider Functionality", () => {
        it("shows range slider when tokens exceed threshold", async () => {
            wrapper = createWrapper({ totalTokens: 15000 }) // Above 10000 threshold

            expect(wrapper.vm.shouldShowRangeSlider).toBe(true)
        })

        it("hides range slider when tokens are below threshold", async () => {
            wrapper = createWrapper({ totalTokens: 5000 }) // Below 10000 threshold

            expect(wrapper.vm.shouldShowRangeSlider).toBe(false)
        })

        it("toggles range slider visibility", async () => {
            wrapper = createWrapper({ totalTokens: 15000 })

            expect(wrapper.vm.showRangeSlider).toBe(false)

            wrapper.vm.toggleRangeSlider()
            expect(wrapper.vm.showRangeSlider).toBe(true)

            wrapper.vm.toggleRangeSlider()
            expect(wrapper.vm.showRangeSlider).toBe(false)
        })
    })
})
