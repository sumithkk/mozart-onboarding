<template>
    <!-- Overlay -->
    <div v-if="show" class="fixed inset-0 z-[11000] flex items-center justify-center bg-black/50 backdrop-blur-sm" @click="emitClose">
        <!-- Modal Container -->
        <div class="bg-backgroundColor text-textColor m-4 w-[400px] rounded-md p-5 shadow-lg" @click.stop>
            <!-- Header -->
            <div class="mb-8 flex items-center justify-between">
                <div class="text-base">{{ shortName }}</div>
                <div v-if="closeOnTopRight" class="cursor-pointer text-2xl" @click="emitClose">
                    <div class="materialSymbolsOutlined">close</div>
                </div>
            </div>

            <!-- Title & Subtitle -->
            <div class="mb-2 text-lg font-medium">{{ title }}</div>
            <div class="mb-8 text-base font-light">{{ subtitle }}</div>

            <!-- Input Fields -->
            <div class="mb-8 flex gap-4">
                <input type="text" v-model="fileInput" placeholder="FileName" class="flex-1 rounded border border-gray-300 p-2.5" />
            </div>

            <!-- Footer -->
            <div class="flex w-full items-center justify-center gap-2">
                <button class="bg-itemColor w-full cursor-pointer rounded border-0 px-4 py-2 text-white" @click="emitClose">Cancel</button>
                <button class="w-full cursor-pointer rounded border-0 px-4 py-2 text-white" :style="{ backgroundColor: confirmButtonColor }" @click="buttonClick('confirm')">
                    {{ confirmButtonText }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps({
        show: Boolean,
        shortName: String,
        title: String,
        subtitle: String,
        closeOnTopRight: Boolean,
        confirmButtonText: String,
        confirmButtonColor: String,
    })

    const emit = defineEmits(["update:show", "buttonClick"])

    function emitClose() {
        emit("update:show", false)
    }

    const fileInput = ref("")

    async function buttonClick(button: string) {
        if (button === "confirm") {
            // Additional confirm logic if needed
        }
        const metadata = {
            title: fileInput.value,
        }
        emit("buttonClick", button, metadata)
    }
</script>
