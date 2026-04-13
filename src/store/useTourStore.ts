import { defineStore } from 'pinia'

// ✅ Strict type for pages (fixes your TS error)
export type TourPage =
  | 'workbench'
  | 'compose'
  | 'settings'
  | 'integrations'
  | 'analytics'

export const TOUR_ROUTE_MAP: Record<TourPage, string> = {
  workbench: '/workbench/files',
  compose: '/compose',
  settings: '/profile/info',
  integrations: '/profile/integrations',
  analytics: '/profile/analytics',
}

export const TOUR_FLOW: TourPage[] = [
  'workbench',
  'compose',
  'settings',
  'integrations',
  'analytics',
]

export const useTourStore = defineStore('tour', {
  state: () => ({
    // first-time user detection
    hasSeenWelcomeModal: false,

    // current state
    currentPage: null as TourPage | null,
    currentStep: 0,
    isTourActive: false,
    isFlowActive: false,
    flowIndex: 0,
    hasSkippedTour: false,

    // per-page completion
    pageTours: {
      workbench: false,
      compose: false,
      settings: false,
      integrations: false,
      analytics: false,
    } as Record<TourPage, boolean>,
  }),

  actions: {
    startFullTour(startPage?: TourPage) {
      const firstPage = startPage && TOUR_FLOW.includes(startPage)
        ? startPage
        : TOUR_FLOW[0]

      this.isFlowActive = true
      this.flowIndex = TOUR_FLOW.indexOf(firstPage)
      this.startTour(firstPage)
    },

    // ▶ Start a page tour
    startTour(page: TourPage) {
      this.startTourAtStep(page, 0)
    },

    startTourAtStep(page: TourPage, step: number) {
      this.currentPage = page
      this.currentStep = step
      this.isTourActive = true
    },

    // ⏭ Next step
    nextStep(totalSteps: number) {
      if (this.currentStep < totalSteps - 1) {
        this.currentStep++
      } else {
        this.completePageTour()
      }
    },

    // ⏮ Previous step
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },

    // ❌ End entire tour
    endTour() {
      this.isTourActive = false
      this.currentPage = null
      this.currentStep = 0
      this.isFlowActive = false
      this.flowIndex = 0
    },

    // ✅ Complete current page tour
    completePageTour() {
      if (!this.currentPage) return

      this.pageTours[this.currentPage] = true

      if (this.isFlowActive) {
        const nextIndex = this.flowIndex + 1
        const nextPage = TOUR_FLOW[nextIndex]

        if (nextPage) {
          this.flowIndex = nextIndex
          this.navigateTo(nextPage)
          return
        }
      }

      this.endTour()
    },

    navigateTo(page: TourPage) {
      const router = useRouter()

      this.isTourActive = false
      this.currentPage = null

      router.push(TOUR_ROUTE_MAP[page])

      setTimeout(() => {
        this.startTour(page)
      }, 400)
    },

    navigateToStep(page: TourPage, step: number) {
      const router = useRouter()

      this.isTourActive = false
      this.currentPage = null

      router.push(TOUR_ROUTE_MAP[page])

      setTimeout(() => {
        this.startTourAtStep(page, step)
      }, 400)
    },
  },

  // 💾 Persist state (first-time user detection lives here)
  persist: {
    key: 'mozart-tour',
  },
})
