<template>
    <ToggleButton v-model="theme" @change="toggleTheme" />
</template>

<script setup lang="ts">
    const colorMode = useColorMode()
    const theme = computed({
        get: () => (colorMode.value === "dark" ? "dark" : "light"),
        set: (val: string) => {
            colorMode.preference = val === "dark" ? "dark" : "light"
            document.documentElement.setAttribute("data-theme", colorMode.preference)
            localStorage.setItem("hs_theme", colorMode.preference)
        },
    })

    function toggleTheme() {
        theme.value = theme.value === "dark" ? "light" : "dark"
    }
</script>
