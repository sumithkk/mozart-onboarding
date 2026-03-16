<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from "vue"
    import { ArrowsUpDownIcon, FolderIcon, FunnelIcon, EyeIcon, EyeSlashIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/outline"
    import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue"

    type SortOption = "name" | "date" | "size"
    type SortDirection = "asc" | "desc"
    type FilterLocation = "all-location" | "shared-with-me" | "starred" | "trashed"

    const props = defineProps({
        showHiddenFiles: {
            type: Boolean,
            default: false,
        },
    })
    const emit = defineEmits<{
        (e: "sort", option: SortOption, direction: SortDirection): void
        (e: "filter", type: string | null): void
        (e: "location", type: string | null): void
        (e: "toggleHidden"): void
        (e: "openShortcuts"): void
    }>()

    const sortBy = ref<SortOption>("name")
    const sortDirection = ref<SortDirection>("asc")
    const filterLocation = ref<FilterLocation>("all-location")
    const filterType = ref<string>("all-types")
    const isSmallScreen = ref(false)

    const toggleSort = () => {
        sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc"
        emit("sort", sortBy.value, sortDirection.value)
    }

    const handleSortChange = (option: SortOption) => {
        sortBy.value = option
        emit("sort", option, sortDirection.value)
    }

    const handleFilterChange = (type: string) => {
        filterType.value = type
        emit("filter", type)
    }
    const handleLocationChange = (type: FilterLocation) => {
        filterLocation.value = type
        emit("location", type)
    }

    const checkScreen = () => {
        isSmallScreen.value = window.innerWidth < 1440
    }

    onMounted(() => {
        checkScreen()
        window.addEventListener("resize", checkScreen)
    })

    onUnmounted(() => {
        window.removeEventListener("resize", checkScreen)
    })
</script>

<template>
    <div class="flex items-center px-4 py-2 w-full justify-center md:justify-start space-x-2 sm:space-x-2 min-[428px]:space-x-4">
        <!-- Sort Menu -->
        <Menu as="div" class="relative">
            <MenuButton v-slot="{ open }" class="flex items-center gap-1 rounded-full bg-neutral-200 px-2 py-1 text-sm text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                <div class="flex items-center sort-button-md">
                    <ArrowsUpDownIcon class="icons-md" />
                    <span v-if="!isSmallScreen" class="text-textColor">{{ sortBy.charAt(0).toUpperCase() + sortBy.slice(1) }}</span>
                    <ChevronUpIcon v-if="open" class="icons-md" />
                    <ChevronDownIcon v-else class="icons-md" />
                </div>
            </MenuButton>
            <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <MenuItems class="ai-dropdown--sm bg-card ring-opacity-5 bg-card ring-border absolute z-10 mt-1 rounded-md p-2 shadow-lg ring-1 focus:outline-none">
                    <MenuItem class="m-0 rounded-md" v-for="option in ['name', 'date', 'size']" :key="option" v-slot="{ active }">
                        <button @click="handleSortChange(option as SortOption)" class="text-textColor w-full px-4 py-2 text-left text-sm" :class="active ? 'bg-background bg-input' : ''">
                            {{ option.charAt(0).toUpperCase() + option.slice(1) }}
                        </button>
                    </MenuItem>
                    <MenuItem class="m-0 rounded-md">
                        <button @click="toggleSort" class="text-textColor w-full min-w-max px-4 py-2 text-left text-sm">Toggle {{ sortDirection === "asc" ? "Descending" : "Ascending" }}</button>
                    </MenuItem>
                </MenuItems>
            </transition>
        </Menu>

        <!-- Filter Type Menu -->
        <Menu as="div" class="relative">
            <MenuButton v-slot="{ open }" class="flex items-center gap-1 rounded-full bg-neutral-200 px-2 py-1 text-sm text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                <div class="flex items-center sort-button-md">
                    <FunnelIcon class="icons-md" />
                    <span v-if="!isSmallScreen" class="text-textColor">{{ filterType.charAt(0).toUpperCase() + filterType.slice(1) }}</span>
                    <ChevronUpIcon v-if="open" class="icons-md" />
                    <ChevronDownIcon v-else class="icons-md" />
                </div>
            </MenuButton>
            <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <MenuItems class="ai-dropdown--sm bg-card ring-opacity-5 bg-card ring-border absolute z-10 mt-1 rounded-md p-2 shadow-lg ring-1 focus:outline-none">
                    <MenuItem class="m-0 rounded-md" v-for="type in ['all-types', 'document', 'image', 'video', 'audio', 'notes']" :key="type" v-slot="{ active }">
                        <button @click="handleFilterChange(type)" class="text-textColor w-full px-4 py-2 text-left text-sm" :class="active ? 'bg-background bg-input' : ''">
                            {{ type === "all-types" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1) + (type === "notes" ? "" : "s") }}
                        </button>
                    </MenuItem>
                </MenuItems>
            </transition>
        </Menu>

        <!-- Filter Location Menu -->
        <Menu as="div" class="relative">
            <MenuButton v-slot="{ open }" class="flex items-center gap-1 rounded-full bg-neutral-200 px-2 py-1 text-sm text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                <div class="flex items-center sort-button-md">
                    <FolderIcon class="icons-md" />
                    <span v-if="!isSmallScreen" class="text-textColor">{{ filterLocation.charAt(0).toUpperCase() + filterLocation.slice(1) }}</span>
                    <ChevronUpIcon v-if="open" class="icons-md" />
                    <ChevronDownIcon v-else class="icons-md" />
                </div>
            </MenuButton>
            <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <MenuItems class="ai-dropdown--sm bg-card ring-opacity-5 bg-card ring-border absolute z-10 mt-1 rounded-md p-2 shadow-lg ring-1 focus:outline-none">
                    <MenuItem class="m-0 rounded-md" v-for="loc in ['all-location', 'shared-with-me', 'starred', 'trashed']" :key="loc" v-slot="{ active }">
                        <button @click="handleLocationChange(loc as FilterLocation)" class="text-textColor w-full px-4 py-2 text-left text-sm" :class="active ? 'bg-background bg-input' : ''">
                            {{ loc === "all-location" ? "All Location" : loc === "shared-with-me" ? "Shared with me" : loc.charAt(0).toUpperCase() + loc.slice(1) }}
                        </button>
                    </MenuItem>
                </MenuItems>
            </transition>
        </Menu>

        <!-- Toggle Hidden Files -->
        <button @click="$emit('toggleHidden')" class="info-button-md flex items-center justify-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600" :title="showHiddenFiles ? 'Hide Hidden Files' : 'Show Hidden Files'">
            <EyeSlashIcon v-if="showHiddenFiles" class="icons-md" />
            <EyeIcon v-else class="icons-md" />
        </button>
        <!-- Keyboard Shortcuts Button -->
        <!-- Keyboard Shortcuts Button (with centered icon) -->
        <button @click="$emit('openShortcuts')" class="info-button-sm flex items-center justify-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600" title="Keyboard Shortcuts">
            <span class="material-symbols-outlined">keyboard</span>
        </button>
    </div>
</template>
