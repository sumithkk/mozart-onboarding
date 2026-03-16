<template>
    <Menu as="div" class="relative">
        <MenuButton v-slot="{ open }" class="bg-card text-muted-foreground bg-input text-muted-foreground flex items-center gap-1 rounded-full px-2 py-1 text-sm">
            <div class="flex items-center gap-1 px-1 py-1">
                <!-- Dynamic Icon -->
                <component :is="icon" class="h-5 w-5" />

                <!-- Label (hidden on small screens if hideOnSmall is true) -->
                <span v-if="!hideOnSmall || !isSmallScreen" class="text-textColor/10">
                    {{ displayLabel }}
                </span>

                <!-- Chevron Icon -->
                <ChevronUpIcon v-if="open" class="h-4 w-4" />
                <ChevronDownIcon v-else class="h-4 w-4" />
            </div>
        </MenuButton>

        <!-- Dropdown Menu -->
        <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <MenuItems class="bg-card ring-opacity-5 bg-card ring-border absolute z-10 mt-1 rounded-md p-2 shadow-lg ring-1 focus:outline-none" :class="menuWidth">
                <!-- Regular Options -->
                <MenuItem v-for="option in options" :key="option.value" class="m-0 rounded-md" v-slot="{ active }">
                    <button @click="handleOptionClick(option)" class="text-textColor w-full px-4 py-2 text-left text-sm" :class="[active ? 'bg-background bg-input' : '', option.disabled ? 'cursor-not-allowed opacity-50' : '']" :disabled="option.disabled">
                        <div class="flex items-center gap-2">
                            <!-- Option Icon (if provided) -->
                            <component v-if="option.icon" :is="option.icon" class="h-4 w-4" />
                            {{ option.label }}
                        </div>
                    </button>
                </MenuItem>

                <!-- Separator (if custom actions exist) -->
                <div v-if="customActions && customActions.length > 0" class="border-border border-border my-1 border-t"></div>

                <!-- Custom Actions -->
                <MenuItem v-for="action in customActions" :key="action.key" class="m-0 rounded-md" v-slot="{ active }">
                    <button @click="action.handler" class="text-textColor w-full px-4 py-2 text-left text-sm" :class="[active ? 'bg-background bg-input' : '', action.disabled ? 'cursor-not-allowed opacity-50' : '']" :disabled="action.disabled">
                        <div class="flex items-center gap-2">
                            <!-- Action Icon (if provided) -->
                            <component v-if="action.icon" :is="action.icon" class="h-4 w-4" />
                            {{ action.label }}
                        </div>
                    </button>
                </MenuItem>
            </MenuItems>
        </transition>
    </Menu>
</template>

<script setup lang="ts">
    import { computed } from "vue"
    import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue"
    import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/vue/24/outline"

    interface DropdownOption {
        value: string | number
        label: string
        icon?: any // Vue component
        disabled?: boolean
    }

    interface CustomAction {
        key: string
        label: string
        handler: () => void
        icon?: any // Vue component
        disabled?: boolean
    }

    interface Props {
        // Required props
        icon: any // Vue component for the main button icon
        options: DropdownOption[]
        onSelect: (option: DropdownOption) => void

        // Optional props
        label?: string
        selectedValue?: string | number
        hideOnSmall?: boolean
        isSmallScreen?: boolean
        menuWidth?: string
        customActions?: CustomAction[]
        disabled?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        label: "",
        selectedValue: undefined,
        hideOnSmall: false,
        isSmallScreen: false,
        menuWidth: "w-fit",
        customActions: () => [],
        disabled: false,
    })

    // Computed property for display label
    const displayLabel = computed(() => {
        if (props.label) return props.label

        if (props.selectedValue !== undefined) {
            const selectedOption = props.options.find((opt) => opt.value === props.selectedValue)
            return selectedOption ? selectedOption.label : "Select..."
        }

        return "Select..."
    })

    // Handle option click
    const handleOptionClick = (option: DropdownOption) => {
        if (!option.disabled) {
            props.onSelect(option)
        }
    }
</script>
