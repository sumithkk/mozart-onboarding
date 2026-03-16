<template>
    <div :class="skeletonLoaderClasses" :style="`min-height: ${minHeight}`">
        <!-- Header/Legend skeleton -->
        <div :class="`${skeletonBarClasses} rounded-lg ${headerWidth}`" :style="`height: ${headerHeight}`"></div>

        <!-- Main chart skeleton -->
        <div :class="`${skeletonBarClasses} rounded-xl ${chartWidth}`" :style="`height: ${chartHeight}`"></div>

        <!-- Footer/Summary skeleton -->
        <div v-if="showFooter" :class="`${skeletonBarClasses} rounded-md ${footerWidth}`" :style="`height: ${footerHeight}`"></div>

        <!-- Additional skeleton bars -->
        <template v-if="additionalBars > 0">
            <div v-for="i in additionalBars" :key="`additional-${i}`" :class="`${skeletonBarClasses} h-3 w-1/4 rounded-md`"></div>
        </template>
    </div>
</template>

<script setup>
    // Define props with defaults for maximum flexibility
    const props = defineProps({
        // Container settings
        heightClass: {
            type: String,
            default: "h-80",
        },
        minHeight: {
            type: String,
            default: "320px",
        },

        // Header skeleton settings
        headerWidth: {
            type: String,
            default: "w-1/2",
        },
        headerHeight: {
            type: String,
            default: "1.5rem", // h-6
        },

        // Chart skeleton settings
        chartWidth: {
            type: String,
            default: "w-full",
        },
        chartHeight: {
            type: String,
            default: "16rem", // h-64
        },

        // Footer skeleton settings
        showFooter: {
            type: Boolean,
            default: true,
        },
        footerWidth: {
            type: String,
            default: "w-1/3",
        },
        footerHeight: {
            type: String,
            default: "1rem", // h-4
        },

        // Additional skeleton bars
        additionalBars: {
            type: Number,
            default: 0,
        },

        // Animation settings
        animationDuration: {
            type: String,
            default: "1.5s",
        },
        fadeDuration: {
            type: String,
            default: "1.2s",
        },
    })

    // FIXED: Remove dynamic arbitrary values
    const skeletonLoaderClasses = `skeleton-loader group w-full flex flex-col gap-4 bg-transparent justify-center items-start md:min-h-[280px] ${props.heightClass}`

    // FIXED: Remove Tailwind gradients, use CSS instead
    const skeletonBarClasses = "skeleton-bar transition-colors transition-transform duration-300 group-hover:scale-[1.01]"
</script>

<style scoped>
    /* FIXED: Uncomment these - they're required for visibility! */
    .skeleton-loader {
        animation: skeleton-fade v-bind(fadeDuration) infinite ease-in-out;
    }

    .skeleton-bar {
        background: linear-gradient(90deg, #e0e0e0 25%, #f3f3f3 50%, #e0e0e0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading v-bind(animationDuration) infinite linear;
    }

    [data-theme="dark"] .skeleton-bar {
        background: linear-gradient(90deg, #383838 25%, #464646 50%, #383838 75%);
    }

    @keyframes skeleton-loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    @keyframes skeleton-fade {
        0%,
        100% {
            opacity: 0.7;
        }
        50% {
            opacity: 1;
        }
    }
</style>
