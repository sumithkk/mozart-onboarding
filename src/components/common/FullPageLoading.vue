<template>
    <div :class="['fixed top-0 right-0 left-0 h-full w-full', 'flex items-center justify-center', 'z-[100000]', 'bg-backgroundColor', background === 'transparent' ? 'opacity-80' : 'opacity-100']">
        <!-- Inner overlay container -->
        <div class="z-[9999] flex h-[100px] w-[100px] items-center justify-center rounded-[10px] border border-[#a5a5a5] bg-[rgba(255,255,255,0.589)]">
            <!-- Loading spinner -->
            <div class="border-l-primaryColor h-[30px] w-[30px] animate-spin rounded-full border-2 border-[rgba(0,0,0,0.1)]"></div>
        </div>
    </div>
</template>
<script setup>
    const props = defineProps({
        background: {
            type: String,
            validator: (value) => ["transparent", "translucent"].includes(value),
            default: "transparent",
        },
    })
</script>
