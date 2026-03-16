<template>
    <div class="hs-dropdown relative">
        <button @click="toggleDropdown" :aria-expanded="isOpen" class="hs-dropdown-toggle hover:bg-secondary focus:bg-secondary inline-flex max-w-72 items-center gap-x-1.5 overflow-hidden rounded-lg border px-3 py-2 text-xs font-medium text-ellipsis whitespace-nowrap shadow-sm focus:outline-none md:text-sm">
            <span class="hidden text-xs font-semibold md:inline md:text-sm">{{ label }}:</span> <span class="text-xs md:text-sm">{{ displayText }}</span>
            <svg class="hs-dropdown-open:rotate-180 size-2.5" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 5L8.16086 10.6869C8.35239 10.8637 8.64761 10.8637 8.83914 10.6869L15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
        </button>

        <div v-if="isOpen" class="hs-dropdown-menu border-border bg-card mt-2 max-h-40 overflow-scroll rounded-lg shadow-md">
            <div class="flex flex-col space-y-0.5 p-1">
                <a v-for="item in items" :key="item.value" href="#" @click.prevent="selectItem(item)" class="hover:bg-secondary px-2.5 py-1.5 text-xs md:text-sm" :class="{ 'bg-background': item.text === currentlySelected }">
                    {{ item.text }}
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, onBeforeUnmount } from "vue"

    const props = defineProps({
        label: {
            type: String,
            required: true,
        },
        currentlySelected: {
            type: String,
            required: true,
        },
        items: {
            type: Array,
            required: true,
            validator: (value) => {
                return value.every((item) => "text" in item && "value" in item)
            },
        },
    })

    const isOpen = ref(false)

    const emit = defineEmits(["update:selected"])

    const displayText = computed(() => {
        return props.currentlySelected || "All" // Show 'All' if currentlySelected is empty
    })

    const toggleDropdown = () => {
        isOpen.value = !isOpen.value
    }

    const selectItem = (item) => {
        toggleDropdown()
        emit("update:selected", item)
    }

    let clickOutsideHandler

    onMounted(() => {
        clickOutsideHandler = (e) => {
            if (!e.target.closest(".hs-dropdown")) {
                isOpen.value = false
            }
        }
        document.addEventListener("click", clickOutsideHandler)
    })

    onBeforeUnmount(() => {
        document.removeEventListener("click", clickOutsideHandler)
    })
</script>

<style scoped>
    .hs-dropdown-menu {
        display: none;
        position: fixed;
        z-index: 1000;
        min-width: 150px;
    }

    [aria-expanded="true"] + .hs-dropdown-menu {
        display: block;
    }
</style>
