import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"

export interface ResponsiveSidebarOptions {
    mobileThreshold?: number
    desktopAutoCloseThreshold?: number
    initialOpenState?: boolean
    persistState?: boolean
    storageKey?: string
}

export interface ResponsiveSidebarReturn {
    // Reactive states
    sidebarOpen: Ref<boolean>
    windowWidth: ComputedRef<number>
    isMobile: ComputedRef<boolean>
    isDesktopAutoClose: ComputedRef<boolean>

    // Actions
    toggleSidebar: () => void
    openSidebar: () => void
    closeSidebar: () => void

    // Computed classes
    sidebarContainerClass: ComputedRef<string>

    // Cleanup
    cleanup: () => void
}

export function useResponsiveSidebar(options: ResponsiveSidebarOptions = {}): ResponsiveSidebarReturn {
    const { mobileThreshold = 768, desktopAutoCloseThreshold = 1345, initialOpenState = true, persistState = false, storageKey = "sidebar-state" } = options

    // Reactive state
    const rawWindowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1000)
    const sidebarOpen = ref(initialOpenState)

    // Computed properties
    const windowWidth = computed(() => rawWindowWidth.value)
    const isMobile = computed(() => windowWidth.value < mobileThreshold)
    const isDesktopAutoClose = computed(() => windowWidth.value < desktopAutoCloseThreshold && !isMobile.value)

    // Initialize based on current screen size
    const initializeSidebarState = () => {
        const currentWidth = typeof window !== "undefined" ? window.innerWidth : 1000
        const isCurrentlyMobile = currentWidth < mobileThreshold
        const isAutoClose = currentWidth < desktopAutoCloseThreshold && !isCurrentlyMobile

        if (isCurrentlyMobile) {
            // On mobile, start closed but allow toggling (sidebar will be overlay)
            sidebarOpen.value = false
        } else if (isAutoClose) {
            // On desktop but below auto-close threshold
            sidebarOpen.value = false
        } else {
            // On desktop above auto-close threshold
            if (persistState && typeof window !== "undefined") {
                const savedState = localStorage.getItem(storageKey)
                if (savedState !== null) {
                    sidebarOpen.value = JSON.parse(savedState)
                } else {
                    sidebarOpen.value = initialOpenState
                }
            } else {
                sidebarOpen.value = initialOpenState
            }
        }
    }

    // Initialize sidebar state
    initializeSidebarState()

    // Window resize handler
    const handleResize = () => {
        rawWindowWidth.value = window.innerWidth
    }

    // Save state to localStorage if persistence is enabled (but not on mobile)
    const saveState = () => {
        if (persistState && typeof window !== "undefined" && !isMobile.value) {
            localStorage.setItem(storageKey, JSON.stringify(sidebarOpen.value))
        }
    }

    // Actions
    const toggleSidebar = () => {
        sidebarOpen.value = !sidebarOpen.value
        saveState()
    }

    const openSidebar = () => {
        sidebarOpen.value = true
        saveState()
    }

    const closeSidebar = () => {
        sidebarOpen.value = false
        saveState()
    }

    // Watch for screen size transitions
    watch(
        isMobile,
        (newIsMobile, oldIsMobile) => {
            // When transitioning TO mobile (desktop -> mobile)
            if (newIsMobile && oldIsMobile !== undefined) {
                // Close sidebar when moving to mobile, but don't prevent future toggling
                sidebarOpen.value = false
                saveState()
            }
            // When transitioning FROM mobile to desktop (mobile -> desktop)
            else if (!newIsMobile && oldIsMobile) {
                // Apply desktop logic
                if (isDesktopAutoClose.value) {
                    sidebarOpen.value = false
                } else {
                    // Try to restore previous desktop state or default to open
                    if (persistState && typeof window !== "undefined") {
                        const savedState = localStorage.getItem(storageKey)
                        if (savedState !== null) {
                            sidebarOpen.value = JSON.parse(savedState)
                        } else {
                            sidebarOpen.value = true
                        }
                    } else {
                        sidebarOpen.value = true
                    }
                }
                saveState()
            }
        },
        { immediate: false }
    )

    // Watch for desktop auto-close threshold changes
    watch(isDesktopAutoClose, (shouldAutoClose) => {
        // Only auto-close if we're not on mobile
        if (!isMobile.value && shouldAutoClose) {
            sidebarOpen.value = false
            saveState()
        }
        // Auto-open when crossing back above the threshold (and not mobile)
        else if (!isMobile.value && !shouldAutoClose && !sidebarOpen.value) {
            sidebarOpen.value = true
            saveState()
        }
    })

    // Computed sidebar container classes
    const sidebarContainerClass = computed(() => {
        const base = ["border-e", "border-border", "overflow-hidden", "transition-all", "duration-300", "flex-shrink-0", "h-full", "z-50"]

        if (isMobile.value) {
            if (!sidebarOpen.value) {
                base.push("fixed", "left-[-280px]")
            } else {
                base.push("fixed", "left-0", "w-[240px]", "min-w-[240px]", "max-w-[85vw]")
            }
        } else {
            if (sidebarOpen.value) {
                // Responsive widths for different screen sizes
                base.push("w-[180px]", "min-w-[180px]", "sm:w-[180px]", "sm:min-w-[180px]", "md:w-[200px]", "md:min-w-[200px]", "lg:w-[240px]", "lg:min-w-[240px]", "xl:w-[280px]", "xl:min-w-[280px]")
            } else {
                base.push("w-[0px]", "min-w-[0px]")
            }
        }

        return base.join(" ")
    })

    // Cleanup function
    const cleanup = () => {
        if (typeof window !== "undefined") {
            window.removeEventListener("resize", handleResize)
        }
    }

    // Lifecycle management
    onMounted(() => {
        if (typeof window !== "undefined") {
            rawWindowWidth.value = window.innerWidth
            window.addEventListener("resize", handleResize)

            // Re-initialize after mount to ensure proper state
            initializeSidebarState()
        }
    })

    onBeforeUnmount(() => {
        cleanup()
    })

    return {
        // Reactive states
        sidebarOpen,
        windowWidth,
        isMobile,
        isDesktopAutoClose,

        // Actions
        toggleSidebar,
        openSidebar,
        closeSidebar,

        // Computed classes
        sidebarContainerClass,

        // Cleanup
        cleanup,
    }
}

// Utility function to create a responsive sidebar with commonly used settings
export function useResponsiveSidebarWithDefaults() {
    return useResponsiveSidebar({
        mobileThreshold: 768,
        desktopAutoCloseThreshold: 1345,
        initialOpenState: true,
        persistState: true,
        storageKey: "app-sidebar-state",
    })
}

// Type exports
export type { ResponsiveSidebarOptions, ResponsiveSidebarReturn }
