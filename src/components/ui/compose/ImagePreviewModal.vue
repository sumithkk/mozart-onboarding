<template>
    <div v-if="show" class="bg-background bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center" style="z-index: 999" @click="closeModal">
        <div class="relative max-h-[90vh] max-w-[90vw]">
            <!-- Close button -->
            <div class="text-foreground hover:text-muted-foreground absolute top-[-40px] right-0 cursor-pointer" @click="closeModal">
                <div class="materialSymbolsOutlined text-[24px]">close</div>
            </div>
            <!-- Image -->
            <img :src="imageUrl" :alt="imageAlt" class="max-h-[90vh] max-w-full rounded-lg object-contain" @click.stop />
        </div>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps({
        show: {
            type: Boolean,
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        imageAlt: {
            type: String,
            default: "",
        },
    })

    const emit = defineEmits(["update:show"])

    const closeModal = () => {
        emit("update:show", false)
    }
</script>
