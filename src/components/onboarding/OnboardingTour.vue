<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { TOUR_FLOW, TOUR_ROUTE_MAP, type TourPage, useTourStore } from '@/store/useTourStore'
import { tourConfig } from '@/data/tourConfig'
import HighlightOverlay from './HighlightOverlay.vue'

type TargetRect = {
  top: number
  left: number
  width: number
  height: number
  bottom: number
}

// store & route
const tourStore = useTourStore()
const route = useRoute()

// UI state
const showWelcomeModal = ref(false)
const targetElement = ref<HTMLElement | null>(null)
const targetRect = ref<TargetRect | null>(null)

const routePage = computed<TourPage | null>(() => {
  const path = route.path

  if (path.startsWith(TOUR_ROUTE_MAP.workbench)) return 'workbench'
  if (path.startsWith(TOUR_ROUTE_MAP.compose)) return 'compose'
  if (path.startsWith('/profile/info') || path.startsWith('/profile/preferences')) return 'settings'
  if (path.startsWith(TOUR_ROUTE_MAP.integrations)) return 'integrations'
  if (path.startsWith(TOUR_ROUTE_MAP.analytics)) return 'analytics'

  return null
})

const shouldRenderTour = computed(() => routePage.value !== null)

const shouldAutoStartPageTour = computed(() => {
  if (!routePage.value) return false
  if (showWelcomeModal.value) return false
  if (tourStore.isTourActive) return false
  if (tourStore.isFlowActive) return false

  return !tourStore.pageTours[routePage.value]
})

// steps
const steps = computed(() => {
  if (!tourStore.currentPage) return []
  return tourConfig[tourStore.currentPage] || []
})

const currentStep = computed(() => {
  return steps.value[tourStore.currentStep]
})

// 🎯 Smart popover positioning
const popoverStyle = computed(() => {
  if (!targetRect.value) return {}

  const rect = targetRect.value
  const padding = 12
  const popoverWidth = 300
  const popoverHeight = 170

  let top = rect.bottom + padding
  let left = rect.left

  if (left + popoverWidth > window.innerWidth - padding) {
    left = window.innerWidth - popoverWidth - padding
  }

  if (top + popoverHeight > window.innerHeight - padding) {
    top = rect.top - popoverHeight - padding
  }

  left = Math.max(padding, left)
  top = Math.max(padding, top)

  return {
    top: `${top}px`,
    left: `${left}px`,
  }
})

function updateTargetRect() {
  if (!targetElement.value) {
    targetRect.value = null
    return
  }

  const rect = targetElement.value.getBoundingClientRect()
  targetRect.value = {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    bottom: rect.bottom,
  }
}

// 🔁 resolve element with retry
async function resolveElement(retries = 3) {
  targetElement.value = null
  targetRect.value = null

  if (!currentStep.value) return

  await nextTick()

  const el = document.querySelector(
    currentStep.value.selector
  ) as HTMLElement

  if (el) {
    el.scrollIntoView({ behavior: 'auto', block: 'center' })
    targetElement.value = el

    requestAnimationFrame(() => {
      updateTargetRect()
    })
  } else if (retries > 0) {
    setTimeout(() => resolveElement(retries - 1), 300)
  } else {
    console.warn('Skipping step:', currentStep.value.selector)
    nextStep()
  }
}

// ▶ start full startup flow from the current page
function startTour() {
  tourStore.hasSeenWelcomeModal = true
  showWelcomeModal.value = false

  if (routePage.value) {
    tourStore.startFullTour(routePage.value)
  }
}

// ⏭ next
function nextStep() {
  tourStore.nextStep(steps.value.length)
}

// ⏮ prev
function prevStep() {
  if (tourStore.currentStep > 0) {
    tourStore.prevStep()
    return
  }

  if (!tourStore.isFlowActive || !tourStore.currentPage) return

  const pageIndex = TOUR_FLOW.indexOf(tourStore.currentPage)
  if (pageIndex <= 0) return

  const previousPage = TOUR_FLOW[pageIndex - 1]
  const previousPageStepCount = tourConfig[previousPage]?.length || 1
  tourStore.flowIndex = pageIndex - 1
  tourStore.navigateToStep(previousPage, previousPageStepCount - 1)
}

// ❌ skip
function skipTour() {
  tourStore.hasSeenWelcomeModal = true
  showWelcomeModal.value = false
  tourStore.endTour()
}

function dismissWelcomeModal() {
  tourStore.hasSeenWelcomeModal = true
  showWelcomeModal.value = false
}

// ⌨ keyboard support
function handleKey(e: KeyboardEvent) {
  if (!tourStore.isTourActive) return

  if (e.key === 'Escape') skipTour()
  if (e.key === 'Tab') {
    e.preventDefault()

    if (e.shiftKey) {
      prevStep()
    } else {
      nextStep()
    }
  }
  if (e.key === 'ArrowRight') nextStep()
  if (e.key === 'ArrowLeft') prevStep()
}

// lifecycle
onMounted(() => {
  if (!tourStore.hasSeenWelcomeModal && shouldRenderTour.value) {
    showWelcomeModal.value = true
  }

  window.addEventListener('keydown', handleKey)
  window.addEventListener('resize', updateTargetRect)
  window.addEventListener('scroll', updateTargetRect, true)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
  window.removeEventListener('resize', updateTargetRect)
  window.removeEventListener('scroll', updateTargetRect, true)
})

// 🔁 watch route
watch(
  () => route.path,
  async () => {
    if (tourStore.isTourActive && routePage.value === tourStore.currentPage) {
      await resolveElement()
    }
  }
)

// 🔁 watch step change and initial activation on the same page
watch(
  () => [tourStore.currentStep, tourStore.isTourActive, tourStore.currentPage, routePage.value],
  async () => {
    if (tourStore.isTourActive && routePage.value === tourStore.currentPage) {
      await resolveElement()
    }
  }
)

watch(
  shouldRenderTour,
  (isVisible) => {
    if (!isVisible) {
      showWelcomeModal.value = false
      targetElement.value = null
      targetRect.value = null
      if (tourStore.isTourActive) {
        tourStore.endTour()
      }
      return
    }

    if (!tourStore.hasSeenWelcomeModal && !tourStore.isTourActive) {
      showWelcomeModal.value = true
    }
  },
  { immediate: true }
)

watch(
  shouldAutoStartPageTour,
  (shouldStart) => {
    if (shouldStart && routePage.value) {
      tourStore.startTour(routePage.value)
    }
  },
  { immediate: true }
)
</script>

<template>
  <!-- 🎉 Welcome Modal -->
  <div
    v-if="showWelcomeModal && shouldRenderTour"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  >
    <div class="bg-white rounded-xl p-6 w-[400px] text-center shadow-lg">
      <h2 class="text-xl font-semibold mb-2">
        Welcome to Mozart!
      </h2>
      <p class="text-gray-600 mb-4">
        Let’s show you around.
      </p>

      <div class="flex justify-center gap-3">
        <button
          class="px-4 py-2 bg-gray-200 rounded"
          @click="dismissWelcomeModal"
        >
          Skip
        </button>

        <button
          class="px-4 py-2 bg-blue-600 text-white rounded"
          @click="startTour"
        >
          Start Tour
        </button>
      </div>
    </div>
  </div>

  <!-- 🎯 Highlight Overlay -->
  <HighlightOverlay
    v-if="shouldRenderTour && tourStore.isTourActive && targetRect"
    :rect="targetRect"
  />

  <!-- 🎯 Tour Popover -->
  <transition name="fade">
    <div
      v-if="shouldRenderTour && tourStore.isTourActive && currentStep && targetRect"
      class="fixed z-50 bg-white shadow-lg rounded-lg p-4 w-[300px]"
      :style="popoverStyle"
    >
      <!-- Progress -->
      <div class="w-full bg-gray-200 h-1 mb-2 rounded">
        <div
          class="bg-blue-600 h-1 rounded"
          :style="{
            width:
              ((tourStore.currentStep + 1) / steps.length) * 100 + '%',
          }"
        />
      </div>

      <!-- Step count -->
      <div class="text-[10px] text-gray-400 mb-1">
        Step {{ tourStore.currentStep + 1 }} of {{ steps.length }}
      </div>

      <!-- Title -->
      <h3 class="font-semibold text-sm mb-1">
        {{ currentStep.title }}
      </h3>

      <!-- Description -->
      <p class="text-xs text-gray-600 mb-3">
        {{ currentStep.description }}
      </p>

      <!-- Actions -->
      <div class="flex justify-between items-center">
        <button
          class="text-xs text-gray-500"
          @click="skipTour"
        >
          Skip Tour
        </button>

        <div class="flex gap-2">
          <button
            class="text-xs px-2 py-1 border rounded"
            @click="prevStep"
            :disabled="tourStore.currentStep === 0"
          >
            Back
          </button>

          <button
            class="text-xs px-2 py-1 bg-blue-600 text-white rounded"
            @click="nextStep"
            autofocus
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
