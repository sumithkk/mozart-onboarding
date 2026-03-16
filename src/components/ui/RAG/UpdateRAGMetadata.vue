<template>
    <!-- Overlay -->
    <div v-if="show" class="fixed inset-0 z-[11000] flex items-center justify-center bg-black/50 backdrop-blur-sm" @click="emitClose">
        <!-- Modal Container -->
        <div class="bg-backgroundColor text-textColor m-4 w-fit rounded-md p-5 shadow-lg" @click.stop>
            <!-- Scrollable Fields -->
            <div class="max-h-[400px] overflow-x-hidden overflow-y-auto px-0.5">
                <!-- Header -->
                <div class="mb-8 flex items-center justify-between">
                    <div class="text-base">
                        {{ shortName }}
                    </div>
                    <div v-if="closeOnTopRight" class="cursor-pointer text-2xl" @click="emitClose">
                        <div class="materialSymbolsOutlined">close</div>
                    </div>
                </div>

                <!-- Title & Subtitle -->
                <div class="mb-2 text-lg">{{ title }}</div>
                <div class="mb-8 text-base font-light">{{ subtitle }}</div>

                <!-- Input Fields for new key/value -->
                <div class="mb-8 flex gap-4">
                    <input type="text" v-model="keyInput" placeholder="New Key" class="flex-1 rounded border border-gray-300 p-2.5" />
                    <input type="text" v-model="valueInput" placeholder="New Value" class="flex-1 rounded border border-gray-300 p-2.5" />
                </div>

                <!-- Existing metadata fields -->
                <div v-for="(value, key) in props.metadataRecord" :key="key" class="mb-8 flex gap-4">
                    <input type="text" :value="key" readonly class="flex-1 cursor-not-allowed rounded border border-gray-300 bg-gray-100 p-2.5" />
                    <input type="text" v-model="props.metadataRecord[key]" class="flex-1 rounded border border-gray-300 p-2.5" />
                </div>
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
        metadataRecord: {
            type: Object,
            required: true,
        },
    })

    const emit = defineEmits(["update:show", "buttonClick"])

    // Close the modal
    function emitClose() {
        console.log(props.metadataRecord)
        emit("update:show", false)
    }

    const keyInput = ref("")
    const valueInput = ref("")

    // Handle button click
    async function buttonClick(button: string) {
        if (button === "confirm") {
            const metadata = { ...props.metadataRecord }
            if (keyInput.value && valueInput.value) {
                metadata[keyInput.value] = valueInput.value
            }
            emit("buttonClick", button, metadata)
        }
    }
</script>
