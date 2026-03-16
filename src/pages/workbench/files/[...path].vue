<template>
    <main class="container mx-auto h-[calc(100vh-theme(spacing.16))] px-4 py-8">
        <FileExplorer :path="route.params.path" class="h-full" />
        <GoogleDriveOnboarding v-if="!fileSystemStore.isLoading && showGoogleDriveOnboarding" @close="closeGoogleDriveOnboarding" />
    </main>
</template>
<script lang="ts" setup>
    import { getShowPopupForIntegration, updateShowPopupForIntegration } from "~/util"

    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })
    useHead({
        title: "Workbench",
    })
    // -------------------| Props |-------------------
    const props = defineProps({
        isMobile: Boolean,
    })

    const route = useRoute()
    const router = useRouter()
    const fileSystemStore = useFileSystemStore()
    const documentStore = useDocumentsStore()
    const userStore = useUserStore()

    const initialShowGoogleDriveOnboarding = () => {
        try {
            const googleIntegration = userStore.integrations["google"]

            if (!googleIntegration) {
                return getShowPopupForIntegration("google", "workbench")
            }

            const isExpired = googleIntegration.createdAt + 30 * 24 * 60 * 60 * 1000 <= Date.now()
            return isExpired && getShowPopupForIntegration("google", "workbench")
        } catch (error) {
            return false
        }
    }

    const showGoogleDriveOnboarding = ref(initialShowGoogleDriveOnboarding())

    const closeGoogleDriveOnboarding = () => {
        if (userStore.integrations["google"]) {
            checkIntegrationConnection(userStore.integrations["google"])
        }
        showGoogleDriveOnboarding.value = false
        updateShowPopupForIntegration("google", "workbench", false)
    }

    const checkIntegrationConnection = (integration: any) => {
        return integration.connected
    }

    onMounted(async () => {
        await documentStore.fetchNotes()
        
        // route.params.path can be a string or an array.
        // We force it to an array so we can iterate.
        let folderIds: string[] = []
        if (typeof route.params.path === "string") {
            folderIds = [route.params.path]
        } else {
            folderIds = route.params.path
        }
        //Remove empty string
        folderIds = folderIds.filter(Boolean)

        // Now navigate all the way down:
        if (!fileSystemStore.isRootLoaded) await fileSystemStore.navigateToFolder({ folderIds })
    })
    // onUnmounted(() => {
    //     console.error(fileSystemStore.currentPath)
    // })
</script>
