<template>
    <div @click="toggle" class="border-greyBlack bg-headerTextColor relative h-[26px] w-[50px] cursor-pointer rounded-full border transition-colors duration-300 hover:shadow-md">
        <div :class="['absolute top-[2px] left-[2px] h-[22px] w-[22px] rounded-full shadow-inner transition-transform duration-300', isActive ? 'bg-logoColor translate-x-[24px]' : 'bg-greyBlack']" />
    </div>
</template>

<script setup lang="ts">
    import { ref } from "vue"

    const isActive = ref(false)
    const emit = defineEmits(["change"])

    function toggle() {
        isActive.value = !isActive.value
        emit("change", isActive.value)
    }
</script>
