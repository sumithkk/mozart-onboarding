<template>
    <!-- Popup Overlay -->
    <div
        ref="popupContainerRef"
        v-click-outside="clickedOutside"
        :class="[
            // Base popup overlay styles
            'fixed inset-0 z-[100000] flex items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-sm transition-opacity duration-300',
            // When popUpActive is true, fade in
            popUpActive ? 'visible opacity-100' : 'invisible opacity-0',
        ]"
    >
        <!-- Popup Container -->
        <div class="bg-card bg-background flex h-[70%] h-auto max-h-[500px] w-full max-w-[750px] flex-col rounded-md shadow-md">
            <!-- Header -->
            <div class="relative m-5 flex items-center justify-between select-none">
                <h3 class="text-textColor text-lg font-semibold">Settings</h3>
                <div class="materialSymbolsFilled px24 text-textColor cursor-pointer" @click="onCloseClicked()">close</div>
            </div>

            <!-- Divider -->
            <div class="bg-card m-0 h-px"></div>

            <!-- Content Wrapper -->
            <div class="relative flex h-96 w-full gap-2 overflow-hidden pb-5 md:pb-0">
                <!-- Side Bar -->
                <div class="border-border relative min-w-[25%] border-r">
                    <div v-for="(sideBarItem, index) in sideBarItems" :key="index" @click="onSideBarItemChange(index)" :class="['text-textColor hover:bg-itemColor m-[5px] mx-[10px] cursor-pointer rounded px-3 py-2 text-base transition-all duration-200 select-none', index === activeSideBarItem ? 'bg-itemColor' : '']">
                        {{ sideBarItem }}
                    </div>
                </div>

                <!-- Content Area -->
                <div class="h-full w-full overflow-auto">
                    <UserInfo v-if="activeSideBarItem == 0" />
                    <OrganizationInfo v-if="activeSideBarItem == 1" />
                    <UserPreference v-if="activeSideBarItem == 1" />
                    <Appearance v-if="activeSideBarItem == 2" />
                    <UserSessions v-if="activeSideBarItem == 3" />
                    <ApiKeys v-if="activeSideBarItem == 4" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps({
        show: Boolean,
    })
    const emit = defineEmits(["close-settings-popup"])

    // Local refs/reactive state
    const popUpActive = ref(props.show)
    const sideBarItems = ref(["Profile", "Organization", "Preferences", "Appearances", "Sessions", "API Keys"])
    const activeSideBarItem = ref(0)
    const popupContainerRef = ref<HTMLElement | null>()

    // Watch for prop changes to open/close the popup
    watch(
        () => props.show,
        (newVal: boolean) => {
            popUpActive.value = newVal
        }
    )

    // Methods
    function onSideBarItemChange(item: number) {
        activeSideBarItem.value = item
    }
    function onCloseClicked() {
        emit("close-settings-popup")
    }

    // Handle clicks outside the container
    function clickedOutside(e: MouseEvent) {
        // If we clicked directly on the overlay (and not on the popup container), close
        if (popUpActive.value && popupContainerRef.value === e.target) {
            emit("close-settings-popup")
        }
    }
</script>
