<template>
    <div class="bg-background bg-background absolute flex h-full w-screen flex-col overflow-hidden">
        <!-- Impersonation Banner -->
        <ImpersonationBanner />

        <!-- Header -->
        <DashboardHeader :isMobile="isMobile" @toggleSidebar="toggleSidebar" />

        <div class="relative flex h-screen overflow-hidden">
            <!-- Hover Area to Trigger Sidebar (Desktop/Tablet only) -->
            <div v-if="!isMobile && !pinSidebar" class="absolute top-0 left-0 h-full" :style="{ width: '2vw', zIndex: 100 }" @mouseenter="handleMouseEnter" />

            <!-- SIDEBAR -->
            <div :class="sidebarContainerClass" role="dialog" aria-hidden="true" @mouseleave="handleMouseLeave">
                <!-- Various Sidebar Components -->
                <GeneralSidebar v-if="isRAG" :class="{ 'pointer-events-none opacity-0': !sidebarOpen }" @showVectorDatabaseConfig="showVectorDatabaseConfig = true" />
                <GeneralSidebar v-if="isWorkbench" :class="{ 'pointer-events-none opacity-0': !sidebarOpen }" @deleteConversation="deleteConversation" />
                <GeneralSidebar v-if="isCompose" :class="{ 'pointer-events-none opacity-0': !sidebarOpen }" @deleteConversation="deleteConversation" />
            </div>

            <!-- MAIN CONTENT -->
            <main class="relative h-full w-full" :class="{ 'overflow-scroll': !isCompose && excludeScroll(route.path) }">
                <slot />
            </main>
        </div>

        <!-- Vector Database Config Modal -->
        <Modal v-if="showVectorDatabaseConfig" @close="showVectorDatabaseConfig = false" title="Vector Database Configuration" closeable>
            <VectorDatabaseConfig />
        </Modal>

        <ConfirmationPopup
            v-if="confirmModalState.show"
            :show="confirmModalState.show"
            :shortName="confirmModalState.options?.shortName || ''"
            :title="confirmModalState.options?.title || ''"
            :subtitle="confirmModalState.options?.subtitle || ''"
            :closeOnTopRight="confirmModalState.options?.closeOnTopRight || false"
            :confirmButtonText="confirmModalState.options?.confirmButtonText || 'Confirm'"
            :confirmButtonColor="confirmModalState.options?.confirmButtonColor || '#FF5555'"
            @update:show="handleUpdateShow"
            @buttonClick="handleButtonClick"
        />

        <!-- Conversation Switch Loading Indicator -->
        <ConversationSwitchIndicator />
        <OnboardingTour />
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch, onMounted, onBeforeUnmount, provide } from "vue"
    import { useModal } from "~/composables/useConfirmationModel"
    import ConversationSwitchIndicator from "~/components/ui/ConversationSwitchIndicator.vue"
    import OnboardingTour from "~/components/onboarding/OnboardingTour.vue"

    const route = useRoute()
    const ragStore = useRagStore()
    const userStore = useUserStore()
    const conversationStore = useConversationStore()
    const { confirmModalState, confirmModal, cancelModal, showConfirmModal } = useModal()

    const sidebarOpen = ref(true)
    const pinSidebar = ref(userStore.settings.pinSideBar)
    const showVectorDatabaseConfig = ref(false)

    // Watch for store changes to sync pin state
    watch(
        () => userStore.settings.pinSideBar,
        (newValue) => {
            pinSidebar.value = newValue
        }
    )

    // When pin setting changes, ensure sidebar stays open if pinned
    watch(pinSidebar, (isPinned) => {
        if (isPinned && !sidebarOpen.value && !isMobile.value) {
            sidebarOpen.value = true
        }
    })

    // On mount, ensure sidebar is open if pinned (not on mobile)
    onMounted(() => {
        if (pinSidebar.value && !isMobile.value && !sidebarOpen.value) {
            sidebarOpen.value = true
        }
    })

    // Track window size
    const rawWindowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1000)
    const windowWidth = computed(() => rawWindowWidth.value)
    const mobileWidthThreshold = 768
    const isMobile = computed(() => windowWidth.value < mobileWidthThreshold)
    provide("isMobile", isMobile)

    // Decide which sidebar to show based on route
    const isWorkbench = computed(() => route.path.includes("/workbench") || route.path.includes("/integrations"))
    const isCompose = computed(() => route.path.includes("/compose") || route.path.includes("/ragCompose"))
    const isRAG = computed(() => (route.path.includes("/rag") && !route.path.includes("/ragCompose")) || route.path.includes("/admin"))

    // Paths that should have no scroll inside the main content
    const excludeScrollPaths = ref<string[]>(["/admin/mozart/logs", "/admin/rag/manage/worker-logs"])

    // Computed sidebar container classes
    const sidebarContainerClass = computed(() => {
        const base = ["z-40", "bg-card", "bg-card", "border-e", "border-border", "border-border", "pt-3", "pb-10", "overflow-hidden", "transform", "transition-all", "duration-200"]

        if (isMobile.value) {
            // On mobile, overlap main content
            base.push("absolute", "top-0", "left-0", "h-screen")
        } else {
            // On desktop, push main content
            base.push("relative", "h-full")
        }

        // Set width for open vs closed
        if (sidebarOpen.value) {
            base.push("w-[290px]", "min-w-[290px]")
        } else {
            base.push("w-[50px]", "min-w-[50px]")
        }

        return base.join(" ")
    })

    // Resize watcher
    function handleResize() {
        rawWindowWidth.value = window.innerWidth
    }

    // Only allow hover-based opening if not pinned and not mobile
    const handleMouseEnter = () => {
        if (!pinSidebar.value && !isMobile.value) {
            sidebarOpen.value = true
        }
    }

    // Only allow hover-based closing if not pinned and not mobile
    const handleMouseLeave = () => {
        if (!pinSidebar.value && !isMobile.value) {
            sidebarOpen.value = false
        }
    }

    // Mobile-friendly toggle
    function toggleSidebar() {
        // If sidebar is pinned and not on mobile, prevent closing
        if (pinSidebar.value && sidebarOpen.value && !isMobile.value) {
            return // Don't close if pinned
        }
        sidebarOpen.value = !sidebarOpen.value
    }

    // Confirmation/Modal logic
    function handleUpdateShow(value: boolean) {
        if (!value) cancelModal()
    }

    function handleButtonClick(action: "confirm" | "cancel") {
        if (action === "confirm") {
            confirmModal()
        } else {
            cancelModal()
        }
    }

    // Determine if route can scroll
    const excludeScroll = (routePath: string) => {
        return !excludeScrollPaths.value.includes(routePath)
    }

    // Example conversation deletion with confirmation
    const deleteConversation = async (modalInfo: ModalOptions, conversationId: string) => {
        const askForConfirmation = await showConfirmModal({
            shortName: modalInfo.shortName,
            title: modalInfo.title,
            subtitle: modalInfo.subtitle,
            confirmButtonText: modalInfo.confirmButtonText,
            confirmButtonColor: modalInfo.confirmButtonColor,
            closeOnTopRight: modalInfo.closeOnTopRight,
        })
        if (askForConfirmation === "confirm") {
            await useConversation().deleteConversationById(conversationId)
        }
    }

    // Lifecycle
    onMounted(async () => {
        rawWindowWidth.value = window.innerWidth
        window.addEventListener("resize", handleResize)

        // Load user RAG data (cached)
        const mozartRAGService = useRag()
        await mozartRAGService.getCollectionsForUser()
        const collectionName = ragStore.currentCollection
        if (collectionName) {
            await useRag().getCollectionPointCount(collectionName)
            await useRag().getCollectionData(collectionName)
        }
    })

    onBeforeUnmount(() => {
        window.removeEventListener("resize", handleResize)
    })
</script>
