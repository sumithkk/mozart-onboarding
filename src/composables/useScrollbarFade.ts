import { ref, onMounted, onUnmounted } from "vue"

/**
 * Composable to handle faded scrollbars that appear on hover and during scrolling
 * Adds/removes 'scrolling' class to elements during scroll events
 */
export function useScrollbarFade() {
    const scrollingElements = ref<Set<Element>>(new Set())
    let scrollTimeouts = new Map<Element, NodeJS.Timeout>()

    const handleScroll = (event: Event) => {
        const element = event.target as Element
        if (!element) return

        // Add scrolling class
        element.classList.add("scrolling")
        scrollingElements.value.add(element)

        // Clear existing timeout for this element
        if (scrollTimeouts.has(element)) {
            clearTimeout(scrollTimeouts.get(element)!)
        }

        // Set new timeout to remove scrolling class after scrolling stops
        const timeout = setTimeout(() => {
            element.classList.remove("scrolling")
            scrollingElements.value.delete(element)
            scrollTimeouts.delete(element)
        }, 1000) // Hide scrollbar 1 second after scrolling stops

        scrollTimeouts.set(element, timeout)
    }

    const addScrollListener = (element: Element) => {
        element.addEventListener("scroll", handleScroll, { passive: true })
    }

    const removeScrollListener = (element: Element) => {
        element.removeEventListener("scroll", handleScroll)
        element.classList.remove("scrolling")
        scrollingElements.value.delete(element)

        if (scrollTimeouts.has(element)) {
            clearTimeout(scrollTimeouts.get(element)!)
            scrollTimeouts.delete(element)
        }
    }

    const initScrollbarFade = () => {
        // Apply to all scrollable elements
        const scrollableElements = document.querySelectorAll("[data-scrollbar-fade], .scrollbar-fade, .overflow-auto, .overflow-y-auto, .overflow-x-auto, .overflow-scroll")

        scrollableElements.forEach((element) => {
            addScrollListener(element)
        })

        // Also apply to body and html for main page scrolling
        addScrollListener(document.body)
        addScrollListener(document.documentElement)
    }

    const cleanupScrollbarFade = () => {
        // Remove all listeners and clear timeouts
        scrollingElements.value.forEach((element) => {
            removeScrollListener(element)
        })

        scrollTimeouts.forEach((timeout) => {
            clearTimeout(timeout)
        })

        scrollTimeouts.clear()
        scrollingElements.value.clear()
    }

    onMounted(() => {
        // Initialize after a short delay to ensure DOM is ready
        setTimeout(initScrollbarFade, 100)
    })

    onUnmounted(() => {
        cleanupScrollbarFade()
    })

    return {
        addScrollListener,
        removeScrollListener,
        initScrollbarFade,
        cleanupScrollbarFade,
        scrollingElements: readonly(scrollingElements),
    }
}
