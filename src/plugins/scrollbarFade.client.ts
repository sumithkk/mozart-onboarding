/**
 * Plugin to automatically apply faded scrollbar behavior globally
 * This ensures scrollbars are hidden by default and appear on hover/scroll
 */
export default defineNuxtPlugin(() => {
    let scrollTimeouts = new Map<Element, NodeJS.Timeout>()

    const handleScroll = (event: Event) => {
        const element = event.target as Element
        if (!element) return

        // Add scrolling class
        element.classList.add("scrolling")

        // Clear existing timeout for this element
        if (scrollTimeouts.has(element)) {
            clearTimeout(scrollTimeouts.get(element)!)
        }

        // Set new timeout to remove scrolling class after scrolling stops
        const timeout = setTimeout(() => {
            element.classList.remove("scrolling")
            scrollTimeouts.delete(element)
        }, 1000) // Hide scrollbar 1 second after scrolling stops

        scrollTimeouts.set(element, timeout)
    }

    const initScrollbarFade = () => {
        // Apply to common scrollable selectors
        const selectors = [
            ".overflow-auto",
            ".overflow-y-auto",
            ".overflow-x-auto",
            ".overflow-scroll",
            ".scrollbar-fade",
            "[data-scrollbar-fade]",
            // Common component classes that might have scrolling
            ".chat-container",
            ".sidebar",
            ".table-container",
            ".modal-content",
            ".dropdown-content",
        ]

        selectors.forEach((selector) => {
            const elements = document.querySelectorAll(selector)
            elements.forEach((element) => {
                element.addEventListener("scroll", handleScroll, { passive: true })
            })
        })

        // Apply to main page scrolling
        document.addEventListener("scroll", handleScroll, { passive: true })
        document.body.addEventListener("scroll", handleScroll, { passive: true })
    }

    // Initialize when DOM is ready
    if (process.client) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initScrollbarFade)
        } else {
            // DOM is already loaded
            setTimeout(initScrollbarFade, 100)
        }

        // Re-initialize on route changes (for SPA navigation)
        const router = useRouter()
        router.afterEach(() => {
            setTimeout(initScrollbarFade, 100)
        })
    }
})
