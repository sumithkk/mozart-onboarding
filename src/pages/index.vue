<template lang="html">
    <div id="container" class="flex min-h-screen w-full flex-col items-center justify-start">
        <!-- Hero Video Section -->
        <HeroVideo />
        <div class="h-fit w-full bg-white">
            <div class="features-container mx-auto w-full max-w-7xl px-4">
                <FeatureSection v-for="f in features" :key="f.id" v-bind="f" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { features, hero } from "~/content/siteCopy"

    definePageMeta({
        layout: "home",
    })

    useHead({
        title: "Home",
    })
</script>
