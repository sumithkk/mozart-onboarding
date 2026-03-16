<template>
    <div
        ref="avatar"
        :class="[
            'inline-flex items-center justify-center overflow-hidden rounded-full font-medium text-white uppercase',
            // You can add optional classes here if needed (e.g., ring, border, shadow)
        ]"
        :style="{
            backgroundColor: avatarBgColor,
            width: computedSize + 'px',
            height: computedSize + 'px',
            fontSize: fontSize + 'px',
        }"
    >
        <span ref="initials" class="flex h-full w-full items-center justify-center leading-none whitespace-nowrap">
            {{ initials }}
        </span>
    </div>
</template>

<script setup>
    import { ref, computed } from "vue"

    const props = defineProps({
        name: {
            type: String,
            required: true,
        },
        size: {
            type: String,
            required: true, // or false if you want
        },
    })

    /**
     * Generate the avatar initials from the provided name.
     */
    const initials = computed(() => {
        if (!props.name) return "A"
        return props.name
            .split(" ")
            .map((part) => part.charAt(0).toUpperCase())
            .join("")
    })

    /**
     * Generate a color from the name’s character code hash.
     */
    const getRandomColor = () => {
        if (!props.name) return "white"
        let hash = 0
        for (let i = 0; i < props.name.length; i++) {
            hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
        }
        return `hsl(${hash % 360}, 70%, 60%)`
    }

    /**
     * Compute size-based styles.
     */
    const computedSize = computed(() => Number(props.size) || 40)
    const fontSize = computed(() => computedSize.value / 2)
    const avatarBgColor = computed(() => getRandomColor())
</script>
