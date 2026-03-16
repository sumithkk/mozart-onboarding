<template>
    <!-- Show only if not loading -->
    <div v-if="!isLoading" class="mx-[10%] flex flex-1 flex-col items-center">
        <UserInfo />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from "vue"

    definePageMeta({
        layout: "land-advisors-dashboard",
        middleware: ["auth"],
    })

    useHead({
        title: "Profile",
    })

    const user = useUser()
    const userStore = useUserStore()

    // ------------------------| Refs |----------------------------
    const isLoading = ref(false)

    onMounted(async () => {
        isLoading.value = true
        await userStore.hydrateFromBetterAuth()
        isLoading.value = false
    })
</script>
