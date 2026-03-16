<template>
    <!-- Overlay -->
    <div v-if="show" class="bg-background/50 fixed inset-0 z-[11000] flex items-center justify-center backdrop-blur-sm" @click="emitClose">
        <!-- Modal Container -->
        <div class="bg-backgroundColor text-textColor m-4 w-fit rounded-md p-5 shadow-lg" @click.stop>
            <!-- Scrollable Fields -->
            <div class="max-h-[400px] overflow-y-auto">
                <!-- Header -->
                <div class="mb-8 flex items-center justify-between">
                    <div class="text-base">
                        {{ shortName }}
                    </div>
                    <div v-if="closeOnTopRight" class="cursor-pointer text-2xl" @click="emitClose">
                        <div class="materialSymbolsOutlined">close</div>
                    </div>
                </div>

                <!-- Modal Title / Subtitle -->
                <div class="mb-2 text-lg font-medium">Recent Search Update</div>
                <div class="mb-8 text-base font-light">Update metadata tags</div>

                <!-- Metadata Fields -->
                <div v-for="(value, key) in props.metadataSearchRecord" :key="key" class="mb-8 flex gap-4">
                    <input type="text" :value="key" readonly class="border-border bg-background flex-1 cursor-not-allowed rounded border p-2.5" />
                    <input type="text" v-model="props.metadataSearchRecord[key]" class="border-border flex-1 rounded border p-2.5" />
                </div>
            </div>

            <!-- Footer -->
            <div class="flex w-full items-center justify-center gap-2">
                <button class="bg-itemColor text-foreground w-full cursor-pointer rounded border-0 px-4 py-2" @click="emitClose">Cancel</button>
                <button class="text-foreground w-full cursor-pointer rounded border-0 px-4 py-2" :style="{ backgroundColor: confirmButtonColor }" @click="buttonClick('confirm')">Update</button>
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
        metadataSearchRecord: {
            type: Object,
            required: true,
        },
    })

    const emit = defineEmits(["update:show", "buttonClick"])

    // Close the modal
    function emitClose() {
        emit("update:show", false)
    }

    // Handle button click
    async function buttonClick(button: string) {
        if (button === "confirm") {
            const metadata = { ...props.metadataSearchRecord }

            // Example transformation logic
            metadata.keyInput = metadata.metadataKey
            delete metadata.metadataKey
            metadata.valueInput = metadata.metadata
            delete metadata.metadataValue

            emit("buttonClick", button, metadata)
        }
    }
</script>
