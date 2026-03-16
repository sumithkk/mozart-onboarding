<template>
    <!-- Wrapper -->
    <div class="h-header text-headerTextColor z-[1000] flex w-full justify-between" :class="{ 'bg-headerBackgroundLAColor': isLAPage }">
        <!-- Left Side -->
        <div class="flex items-center px-5">
            <img class="h-[48px] w-[120px] cursor-pointer" src="../../assets/images/LandAdvisorsLogo.png" alt="Land Advisors" />
        </div>

        <!-- Right Side -->
        <div class="flex items-center px-5">
            <!-- Menu Items: Hidden below sm breakpoint -->
            <div class="hidden items-center gap-5 text-xl font-normal sm:flex">
                <!-- Compose -->
                <div class="cursor-pointer" @click="goTo('/org/landadvisors/compose')">Compose</div>

                <!-- Data -->
                <div class="cursor-pointer" @click="goTo('/org/landadvisors/data')">Data</div>

                <!-- Settings -->
                <div class="materialSymbolsFilled cursor-pointer text-[25px] transition-transform duration-300 ease-in-out select-none" @click="goTo('/org/landadvisors/profile')">Settings</div>

                <!-- Toggle Theme -->
                <div class="materialSymbolsFilled cursor-pointer text-[25px] transition-transform duration-300 ease-in-out select-none" @click="toggleTheme" :title="`Current: ${colorMode.preference} (click to cycle)`">
                    {{ colorMode.preference === "light" ? "dark_mode" : colorMode.preference === "dark" ? "light_mode" : "contrast" }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watchEffect } from "vue"
    declare const useColorMode: any
    import { useRouter, useRoute } from "vue-router"

    const router = useRouter()
    const route = useRoute()
    const colorMode = useColorMode()

    // Derived boolean to check if user is on a Land Advisors org page
    const isLAPage = computed(() => route.path.includes("/org/landadvisors"))

    function goTo(where: string) {
        router.push(where)
    }

    function toggleTheme() {
        // Cycle through: light -> dark -> system -> light
        if (colorMode.preference === "light") {
            colorMode.preference = "dark"
        } else if (colorMode.preference === "dark") {
            colorMode.preference = "system"
        } else {
            colorMode.preference = "light"
        }
    }

    watchEffect(() => {
        if (process.client) {
            document.documentElement.setAttribute("data-theme", colorMode.value)
        }
    })
</script>
