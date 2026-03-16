<template>
    <div ref="dropdownRef" class="relative inline-block w-full">
        <slot />

        <Teleport to="body" v-if="isActive">
            <div ref="dropdownContentRef" v-click-outside="clickedOutside" :style="dropdownStyle" class="border-strokeColor bg-midGrey text-textColor z-[1000] max-h-[400px] min-w-[150px] overflow-auto rounded-md border p-[5px] shadow-md transition-opacity duration-300 ease-in-out">
                <div v-for="(group, index) in options" :key="index" class="space-y-1">
                    <div v-for="option in group" :key="option.label" @click="handleItemClick(option)" :class="['flex items-center justify-start gap-1 rounded-md px-3 py-2 text-base transition-colors duration-200', option.disabled ? 'text-unselectedColor pointer-events-none cursor-default' : 'hover:bg-backgroundColor cursor-pointer']">
                        <img v-if="option.avatar" :src="option.avatar.src" class="h-5 w-5 rounded-full" />
                        <i v-if="option.icon" class="materialSymbolsFilled px18" :class="[option.animated && 'animate-spin']">
                            {{ option.icon }}
                        </i>
                        {{ option.label }}
                        <span v-if="option.shortcuts" class="ml-auto opacity-60">
                            {{ option.shortcuts.join(" + ") }}
                        </span>
                    </div>
                    <div v-if="options && index < options.length - 1" class="bg-strokeColor my-1 h-px w-full" />
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
    import { ref, nextTick, onMounted, onUnmounted, watch } from "vue"

    const props = defineProps({
        options: Array<any>,
        isActive: Boolean,
        position: {
            type: String,
            default: "bottomEnd",
            validator: (value: string) => ["rightStart", "bottomStart", "bottomEnd", "topStart", "topEnd", "mirror"].includes(value),
        },
        dropdownId: String,
        outSideClicked: {
            type: Function,
            default: () => {},
        },
    })

    const emit = defineEmits(["toggleDropdown", "itemClicked"])

    const dropdownRef = ref<HTMLElement | null>(null)
    const dropdownContentRef = ref<HTMLElement | null>(null)
    const dropdownStyle = ref<Record<string, any>>({})

    const calculatePosition = async () => {
        await nextTick()
        if (props.isActive && dropdownRef.value) {
            const rect = dropdownRef.value.getBoundingClientRect()

            // Add a small offset to ensure dropdown doesn't overlap trigger
            const offset = 4

            // Default position: bottomEnd
            dropdownStyle.value = {
                position: "fixed", // Use fixed instead of absolute for better positioning
                top: `${rect.bottom + offset}px`,
                left: `${rect.right}px`,
                zIndex: 1001,
                transform: "translateX(-100%)", // Align right edge
            }

            if (props.position === "rightStart") {
                dropdownStyle.value.top = `${rect.top}px`
                dropdownStyle.value.left = `${rect.right + offset}px`
                dropdownStyle.value.transform = "none"
            } else if (props.position === "bottomStart") {
                dropdownStyle.value.top = `${rect.bottom + offset}px`
                dropdownStyle.value.left = `${rect.left}px`
                dropdownStyle.value.transform = "none"
            } else if (props.position === "bottomEnd") {
                dropdownStyle.value.top = `${rect.bottom + offset}px`
                dropdownStyle.value.left = `${rect.right}px`
                dropdownStyle.value.transform = "translateX(-100%)"
            } else if (props.position === "topStart") {
                dropdownStyle.value.top = `${rect.top - offset}px`
                dropdownStyle.value.left = `${rect.left}px`
                dropdownStyle.value.transform = "translateY(-100%)"
            } else if (props.position === "topEnd") {
                dropdownStyle.value.top = `${rect.top - offset}px`
                dropdownStyle.value.left = `${rect.right}px`
                dropdownStyle.value.transform = "translateX(-100%) translateY(-100%)"
            } else if (props.position === "mirror") {
                dropdownStyle.value.top = `${rect.bottom + 10}px`
                dropdownStyle.value.left = `${rect.left - 130}px`
                dropdownStyle.value.transform = "none"
            }

            // Ensure dropdown stays within viewport
            const dropdownWidth = 150 // min-width from template
            const measuredHeight = dropdownContentRef.value?.offsetHeight ?? dropdownContentRef.value?.scrollHeight ?? 0
            const dropdownHeight = measuredHeight > 0 ? measuredHeight : 120 // fallback estimate

            // Adjust horizontal position if it goes off-screen
            if (parseInt(dropdownStyle.value.left) + dropdownWidth > window.innerWidth) {
                dropdownStyle.value.left = `${window.innerWidth - dropdownWidth - 10}px`
                dropdownStyle.value.transform = "none"
            }

            // Adjust vertical position if it goes off-screen
            if (parseInt(dropdownStyle.value.top) + dropdownHeight > window.innerHeight) {
                const topAbove = rect.top - dropdownHeight - offset
                if (topAbove >= offset) {
                    dropdownStyle.value.top = `${topAbove}px`
                } else {
                    dropdownStyle.value.top = `${Math.max(window.innerHeight - dropdownHeight - offset, offset)}px`
                }
                if (dropdownStyle.value.transform.includes("translateY(-100%)")) {
                    dropdownStyle.value.transform = dropdownStyle.value.transform.replace("translateY(-100%)", "").trim()
                } else {
                    dropdownStyle.value.transform += " translateY(0)"
                }
            }

            if (parseInt(dropdownStyle.value.top) < offset) {
                const topBelow = rect.bottom + offset
                if (topBelow + dropdownHeight <= window.innerHeight) {
                    dropdownStyle.value.top = `${topBelow}px`
                } else {
                    dropdownStyle.value.top = `${offset}px`
                }
                if (props.position.startsWith("top") && dropdownStyle.value.transform.includes("translateY(-100%)")) {
                    dropdownStyle.value.transform = dropdownStyle.value.transform.replace("translateY(-100%)", "").trim()
                }
            }
        }
    }

    const updateOnScrollOrResize = () => {
        calculatePosition()
    }

    const clickedOutside = (e: Event) => {
        if (!dropdownRef.value?.contains(e.target as Node)) {
            props.outSideClicked()
        }
    }

    function handleItemClick(option: any) {
        if (!option.disabled) {
            emit("itemClicked", option)
            closeDropdown()
        }
    }

    function closeDropdown() {
        if (props.isActive) {
            emit("toggleDropdown")
        }
    }

    // Watch for isActive changes and recalculate position
    watch(
        () => props.isActive,
        (newValue) => {
            if (newValue) {
                nextTick(() => {
                    calculatePosition()
                })
            }
        },
        { immediate: true }
    )

    onMounted(() => {
        window.addEventListener("scroll", updateOnScrollOrResize, true)
        window.addEventListener("resize", updateOnScrollOrResize)
        calculatePosition()
    })

    onUnmounted(() => {
        window.removeEventListener("scroll", updateOnScrollOrResize, true)
        window.removeEventListener("resize", updateOnScrollOrResize)
    })
</script>
