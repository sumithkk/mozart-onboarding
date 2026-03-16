<template>
    <section class="hero-video relative h-screen w-full overflow-hidden">
        <!-- Video Background -->
        <video ref="videoRef" class="absolute inset-0 h-full w-full object-cover" :poster="posterImage" autoplay loop muted playsinline @loadeddata="onVideoLoaded">
            <source :src="videoSrc" type="video/mp4" />
            <!-- Fallback for browsers that don't support video -->
            <img :src="posterImage" alt="Mozart AI Platform" class="absolute inset-0 h-full w-full object-cover" />
        </video>

        <!-- Dark Overlay for Text Contrast -->
        <!-- <div class="bg-background/10 absolute inset-0"></div> -->

        <!-- Content Overlay -->
        <div class="text-foreground relative z-10 flex h-full w-full flex-col items-center justify-center px-4 text-center">
            <div class="max-w-4xl">
                <!-- Headline -->
                <h1 class="mb-4 text-4xl leading-tight font-bold text-white md:text-6xl lg:text-7xl">Mozart: Orchestrate AI</h1>

                <!-- Success/Error Messages -->
                <div v-if="success" class="mb-6 rounded-lg bg-green-500/90 px-6 py-3 text-white shadow-lg">
                    {{ success }}
                </div>
                <div v-if="error" class="mb-6 rounded-lg bg-red-500/90 px-6 py-3 text-white shadow-lg">
                    {{ error }}
                </div>

                <!-- CTA Button -->
                <button
                    @click="showWaitlistModal = true"
                    class="group hover:bg-logoColor relative inline-flex cursor-pointer items-center justify-center gap-3 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-[#2844a4] transition-all duration-300 hover:text-white hover:shadow-lg focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 focus:outline-none md:px-10 md:py-5 md:text-xl"
                >
                    Join the waitlist
                    <svg class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="!videoLoaded" class="bg-background/50 absolute inset-0 flex items-center justify-center">
            <div class="border-border h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>

        <!-- Waitlist Modal -->
        <WaitlistRequestModal :show="showWaitlistModal" title="Join Our Waitlist" subtitle="Be the first to know when we launch new features and updates!" confirm-button-text="Join Waitlist" confirm-button-color="#2844a4" @close="handleWaitlistClose" @submit="handleWaitlistSubmit" />
    </section>
</template>

<script setup lang="ts">
    import { ref, onMounted, onUnmounted, watch } from "vue"
    import WaitlistRequestModal from "~/components/common/Popups/WaitlistRequestModal.vue"

    // Props
    interface Props {
        videoSrc?: string
        posterImage?: string
    }

    const props = withDefaults(defineProps<Props>(), {
        videoSrc: "/videos/iStock-2190359486.mp4", // iStock video from public/videos folder
        posterImage: "/images/hero-poster.jpg", // Default poster image - should be served from CDN
    })

    // Reactive state
    const videoRef = ref<HTMLVideoElement>()
    const videoLoaded = ref(false)
    const prefersReducedMotion = ref(false)
    const showWaitlistModal = ref(false)
    const admin = useAdmin()

    // Methods
    const onVideoLoaded = () => {
        videoLoaded.value = true
    }

    const handleWaitlistClose = () => {
        showWaitlistModal.value = false
    }

    const handleWaitlistSubmit = async (data: IWaitlistRequest) => {
        const result = await admin.addUserToWaitlist(data.email, data.name)
        if (result.code === 200) {
            // Close modal after successful submission
            setTimeout(() => {
                showWaitlistModal.value = false
            }, 2000)
        }
    }

    const checkPrefersReducedMotion = () => {
        prefersReducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    }

    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
        prefersReducedMotion.value = event.matches
    }

    // Lifecycle
    onMounted(() => {
        checkPrefersReducedMotion()

        // Listen for changes in user's motion preferences
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
        mediaQuery.addEventListener("change", handleMediaQueryChange)

        // If user prefers reduced motion, pause the video and show poster
        if (prefersReducedMotion.value && videoRef.value) {
            videoRef.value.pause()
        }
    })

    onUnmounted(() => {
        // Clean up event listener
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
        mediaQuery.removeEventListener("change", handleMediaQueryChange)
    })

    // Watch for changes in prefersReducedMotion
    watch(prefersReducedMotion, (newValue) => {
        if (videoRef.value) {
            if (newValue) {
                videoRef.value.pause()
            } else {
                videoRef.value.play()
            }
        }
    })
</script>

<style scoped>
    .hero-video {
        /* Ensure full viewport height */
        min-height: 100vh;
    }

    /* Ensure video covers the entire container */
    video {
        object-fit: cover;
        object-position: center;
    }

    /* Smooth transitions for reduced motion preference changes */
    @media (prefers-reduced-motion: reduce) {
        .hero-video * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }

    /* Ensure text has sufficient contrast */
    .hero-video h1,
    .hero-video p {
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    /* Responsive text sizing */
    @media (max-width: 768px) {
        .hero-video h1 {
            font-size: 2.5rem;
            line-height: 1.2;
        }

        .hero-video p {
            font-size: 1.125rem;
        }
    }

    @media (max-width: 480px) {
        .hero-video h1 {
            font-size: 2rem;
        }

        .hero-video p {
            font-size: 1rem;
        }
    }
</style>
