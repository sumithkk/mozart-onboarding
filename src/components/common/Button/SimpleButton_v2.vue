<template>
    <button @click="emitClickEvent" class="[data-theme='light']:hover:text-headerTextColor bg-logoColor text-headerTextColor hover:bg-strokeColor hover:text-white cursor-pointer rounded-[8px] border-0 px-[60px] py-[10px] text-center text-[16px] transition-colors duration-300 outline-none focus:scale-[1.05] focus:shadow-[0_0_0_2px_var(--strokeColor)]">
        {{ buttonText }}
    </button>
</template>

<script setup lang="ts">
    // Define props
    const props = defineProps({
        buttonText: {
            type: String,
            default: "Click Me",
        },
    })

    // Define emits
    const emit = defineEmits(["clicked"])

    // Method to emit an event when the button is clicked
    const emitClickEvent = () => {
        emit("clicked")
    }
</script>
