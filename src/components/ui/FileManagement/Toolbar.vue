<script setup lang="ts">
    import { ref, onMounted, onUnmounted, watch, computed, inject, type ComputedRef } from "vue"
    import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue"
    import { Squares2X2Icon, ListBulletIcon, FolderPlusIcon, ArrowUpTrayIcon, CloudArrowDownIcon, CheckIcon, BookOpenIcon } from "@heroicons/vue/24/outline"

    const props = defineProps<{
        selectedOptions: string[] // e.g., ['vectorize', 'anonymous']
    }>()

    const emit = defineEmits<{
        (e: "viewChange", view: "grid" | "list"): void
        (e: "createFolder"): void
        (e: "uploadFiles"): void
        (e: "createNote"): void
        (e: "uploadFolder"): void
        (e: "uploadFromGoogleDrive"): void
        (e: "update:selectedOptions", value: string[]): void
    }>()

    const view = ref<"grid" | "list">("list")
    const selectedOptions = computed({
        get: () => props.selectedOptions,
        set: (val) => emit("update:selectedOptions", val),
    })

    watch(view, (val) => {
        emit("viewChange", val)
    })

    watch(selectedOptions, (val) => emit("update:selectedOptions", val))

    const isSmallScreen = ref(false)

    const checkScreen = () => {
        isSmallScreen.value = window.innerWidth < 1025
    }
    const isMobile = inject<ComputedRef<boolean>>("isMobile")

    const toggleOption = (option: string) => {
        const idx = selectedOptions.value.indexOf(option)
        if (idx === -1) {
            selectedOptions.value.push(option)
        } else {
            selectedOptions.value.splice(idx, 1)
        }
    }
    const isSelected = (option: string) => selectedOptions.value.includes(option)

    onMounted(() => {
        checkScreen()
        window.addEventListener("resize", checkScreen)
    })

    onUnmounted(() => {
        window.removeEventListener("resize", checkScreen)
    })
</script>
<template>
    <div class="">

        <!-- Sort Menu -->
        <div class="flex items-center px-5 py-3 w-full justify-center md:justify-start space-x-2 sm:space-x-2 min-[428px]:space-x-4 max-[390px]:mx-auto max-[390px]:w-fit max-[390px]:justify-center max-[390px]:gap-1 max-[390px]:space-x-1 max-[390px]:px-2 max-[390px]:[&>div]:shrink-0">
            <!-- Wrap each item in a flex-1 container -->
            <!-- <div class="flex justify-center">
                <Capture />
            </div> -->

            <div class="flex justify-center">
                <VTooltip>
                    <button class="button-md border-border bg-logoColor text-white flex items-center gap-2 rounded-md px-2 py-1 text-sm whitespace-nowrap hover:bg-mozart-blue-700 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700" @click="$emit('createNote')" title="Create Note">
                        <BookOpenIcon class="icons-md" />
                        <span v-if="!isSmallScreen">Create Note</span>
                    </button>
                    <template #popper>Create Note</template>
                </VTooltip>
            </div>

            <!-- Upload Dropdown -->
            <div class="flex justify-center">
                <VTooltip>
                    <Menu as="div" class="relative">
                        <MenuButton class="button-md border-border bg-logoColor text-white flex items-center gap-2 rounded-md px-2 py-1 text-sm whitespace-nowrap hover:bg-mozart-blue-700 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700">
                            <ArrowUpTrayIcon class="icons-md" />
                            <span v-if="!isSmallScreen">Upload</span>
                        </MenuButton>
                        <MenuItems class="ring-border ring-opacity-5 absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none dark:bg-neutral-800">
                            <MenuItem>
                                <button @click="$emit('uploadFiles')" class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-700">
                                    <ArrowUpTrayIcon class="icons-md" />
                                    Upload File
                                </button>
                            </MenuItem>
                            <MenuItem>
                                <button @click="$emit('uploadFolder')" class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-700">
                                    <ArrowUpTrayIcon class="icons-md" />
                                    Upload Folder
                                </button>
                            </MenuItem>
                            <MenuItem>
                                <button @click="$emit('uploadFromGoogleDrive')" class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-700">
                                    <CloudArrowDownIcon class="icons-md" />
                                    Load from Google Drive
                                </button>
                            </MenuItem>
                            <MenuItem>
                                <button @click="$emit('createFolder')" class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-700">
                                    <FolderPlusIcon class="icons-md" />
                                    New Folder
                                </button>
                            </MenuItem>
                        </MenuItems>
                    </Menu>
                    <template #popper>Upload Files</template>
                </VTooltip>
            </div>

            <!-- Options Dropdown -->
            <div class="flex justify-center">
                <VTooltip>
                    <Menu as="div" class="relative">
                        <MenuButton class="button-md bg-white text-logoColor flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700">
                            <span class="material-symbols-outlined icons-md">tune</span>
                            <span v-if="!isSmallScreen">Preferences</span>
                        </MenuButton>
                        <MenuItems class="ai-dropdown--sm ring-border ring-opacity-5 absolute left-0 z-10 mt-2 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none dark:bg-neutral-800">
                            <MenuItem as="div">
                                <div class="flex cursor-pointer items-center justify-between px-4 py-2 text-sm text-neutral-700 dark:text-white" @click.stop="toggleOption('vectorize')">
                                    <span>Vectorize</span>
                                    <input type="checkbox" :checked="isSelected('vectorize')" readonly class="form-checkbox" />
                                </div>
                            </MenuItem>
                            <MenuItem as="div">
                                <div class="flex cursor-pointer items-center justify-between px-4 py-2 text-sm text-neutral-700 dark:text-white" @click.stop="toggleOption('anonymous')">
                                    <span>Anonymous Upload</span>
                                    <input type="checkbox" :checked="isSelected('anonymous')" readonly class="form-checkbox" />
                                </div>
                            </MenuItem>
                            <MenuItem as="div">
                                <div class="pointer-events-none flex cursor-pointer items-center justify-between px-4 py-2 text-sm text-neutral-700 opacity-50 dark:text-white" @click.stop="toggleOption('keepOriginal')" :class="{ 'pointer-events-none opacity-50': !isSelected('anonymous') }">
                                    <span>Keep Original Name</span>
                                    <input type="checkbox" :checked="isSelected('keepOriginal')" :disabled="!isSelected('anonymous')" readonly class="form-checkbox" />
                                </div>
                            </MenuItem>
                        </MenuItems>
                    </Menu>
                    <template #popper>Upload Options</template>
                </VTooltip>
            </div>

            <div class="flex justify-center">
                <ViewSwitch v-model="view" />
            </div>
        </div>
    </div>
</template>
