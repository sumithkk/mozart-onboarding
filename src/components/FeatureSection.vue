<template>
    <section class="feature-section flex w-full flex-col items-start gap-8 py-12 md:flex-row md:items-center md:gap-12 md:py-16">
        <!-- Content Section -->
        <div class="feature-content w-full md:w-1/2" :class="reverse ? 'md:order-last' : ''">
            <h2 class="text-logoColor mb-4 text-3xl font-medium md:text-4xl lg:text-5xl">{{ title }}</h2>

            <p v-if="body" class="feature-description mb-6 text-base font-normal text-neutral-900 md:text-lg">{{ body }}</p>

            <div class="feature-points space-y-4">
                <div v-for="point in points" :key="point" class="feature-point flex items-start gap-3">
                    <IconCheck class="text-logoColor mt-1 h-5 w-5 flex-shrink-0" />
                    <span class="feature-text text-sm leading-relaxed font-normal text-neutral-900 md:text-base">{{ point }}</span>
                </div>
            </div>
        </div>

        <!-- Image Section -->
        <div class="feature-image w-full md:w-1/2">
            <div v-html="image" class="h-auto w-full rounded-lg shadow-lg" :aria-label="title" />
        </div>
    </section>
</template>

<script setup lang="ts">
    interface Props {
        title: string
        body?: string
        points: string[]
        image: string
        reverse?: boolean
    }

    defineProps<Props>()
</script>
