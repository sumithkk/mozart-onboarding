import { nextTick, onMounted, onUnmounted, readonly, ref } from "vue"

export function useMobileKeyboard() {
    const isKeyboardOpen = ref(false)
    const initialViewportHeight = ref(0)
    const currentViewportHeight = ref(0)
    const keyboardHeight = ref(0)
    const isMobile = ref(false)

    // Detect if device is mobile
    const detectMobile = () => {
        if (typeof window === "undefined") return false
        return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }

    // Get viewport height (accounting for mobile browser UI)
    const getViewportHeight = () => {
        if (typeof window === "undefined") return 0

        // Use visualViewport API if available (better for mobile browsers)
        if (window.visualViewport) {
            return window.visualViewport.height
        }

        // Fallback to innerHeight
        return window.innerHeight
    }

    // Calculate keyboard height
    const calculateKeyboardHeight = () => {
        if (typeof window === "undefined") return 0

        const currentHeight = getViewportHeight()
        const heightDifference = initialViewportHeight.value - currentHeight

        // Consider keyboard open if height difference is significant (>100px for iOS)
        // and current height is less than initial height
        const threshold = isMobile.value ? 100 : 150
        if (heightDifference > threshold && currentHeight < initialViewportHeight.value) {
            keyboardHeight.value = heightDifference
            return heightDifference
        }

        keyboardHeight.value = 0
        return 0
    }

    // Update keyboard state
    const updateKeyboardState = () => {
        if (typeof window === "undefined") return

        const newHeight = getViewportHeight()
        const heightDiff = initialViewportHeight.value - newHeight

        // Keyboard is considered open if:
        // 1. Height difference is significant (>100px for mobile, >150px for desktop)
        // 2. Current height is less than initial height
        // 3. We're on a mobile device
        const threshold = isMobile.value ? 100 : 150
        const keyboardOpen = heightDiff > threshold && newHeight < initialViewportHeight.value && isMobile.value

        isKeyboardOpen.value = keyboardOpen
        currentViewportHeight.value = newHeight
        keyboardHeight.value = keyboardOpen ? heightDiff : 0
    }

    // Handle viewport resize (keyboard show/hide)
    const handleViewportResize = () => {
        nextTick(() => {
            updateKeyboardState()
        })
    }

    // Handle window resize (orientation change, etc.)
    const handleWindowResize = () => {
        if (typeof window === "undefined") return

        // Reset initial height on orientation change
        const newInitialHeight = getViewportHeight()
        if (Math.abs(newInitialHeight - initialViewportHeight.value) > 100) {
            initialViewportHeight.value = newInitialHeight
        }

        updateKeyboardState()
    }

    // Initialize the composable
    const init = () => {
        if (typeof window === "undefined") return

        isMobile.value = detectMobile()
        initialViewportHeight.value = getViewportHeight()
        currentViewportHeight.value = initialViewportHeight.value

        // Add event listeners
        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", handleViewportResize)
        } else {
            window.addEventListener("resize", handleViewportResize)
        }

        window.addEventListener("resize", handleWindowResize)

        // Initial state update
        updateKeyboardState()
    }

    // Cleanup event listeners
    const cleanup = () => {
        if (typeof window === "undefined") return

        if (window.visualViewport) {
            window.visualViewport.removeEventListener("resize", handleViewportResize)
        } else {
            window.removeEventListener("resize", handleViewportResize)
        }

        window.removeEventListener("resize", handleWindowResize)
    }

    // Get available height for content (viewport minus keyboard)
    const getAvailableHeight = () => {
        return currentViewportHeight.value
    }

    // Check if we should adjust layout for keyboard
    const shouldAdjustForKeyboard = () => {
        return isMobile.value && isKeyboardOpen.value
    }

    onMounted(() => {
        init()
    })

    onUnmounted(() => {
        cleanup()
    })

    return {
        isKeyboardOpen: readonly(isKeyboardOpen),
        keyboardHeight: readonly(keyboardHeight),
        currentViewportHeight: readonly(currentViewportHeight),
        initialViewportHeight: readonly(initialViewportHeight),
        isMobile: readonly(isMobile),
        getAvailableHeight,
        shouldAdjustForKeyboard,
        updateKeyboardState,
    }
}
