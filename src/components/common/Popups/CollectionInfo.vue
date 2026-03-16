<template>
    <!-- Only show the modal if `show` is true -->
    <div v-if="show" class="bg-background/50 fixed top-0 left-0 z-[11000] flex h-screen w-screen items-center justify-center backdrop-blur-[2px]">
        <!-- Modal wrapper, prevents clicks outside from closing it -->
        <div @click.stop class="bg-backgroundColor text-textColor m-4 w-fit rounded-md p-5 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
            <div class="mb-8 flex items-center justify-between">
                <!-- Title or shortName -->
                <div class="text-2xl">
                    {{ shortName }}
                </div>
                <!-- Optional close button in top-right -->
                <div v-if="closeOnTopRight" class="cursor-pointer overflow-x-hidden text-2xl" @click="emitClose">
                    <div class="materialSymbolsOutlined">close</div>
                </div>
            </div>

            <!-- Container for input fields -->
            <div class="mb-4 max-h-[400px] overflow-y-auto">
                <div v-for="(value, key) in props.collectionInfoRecord" :key="key" class="mb-8 flex gap-4">
                    <input type="text" :value="key" readonly class="flex-1 rounded border border-[#ccc] p-2" />
                    <input type="text" v-model="props.collectionInfoRecord[key]" readonly class="flex-1 rounded border border-[#ccc] p-2" />
                </div>
            </div>

            <!-- Footer with Cancel button -->
            <div class="flex w-full items-center justify-center gap-2">
                <button class="bg-itemColor text-foreground mt-3 w-[80%] cursor-pointer rounded-md border-none px-4 py-2" @click="emitClose">Cancel</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps({
        show: Boolean,
        shortName: String,
        closeOnTopRight: Boolean,
        collectionInfoRecord: {
            type: Object,
            required: true,
        },
    })

    const emit = defineEmits(["update:show", "buttonClick"])

    function emitClose() {
        emit("update:show", false)
    }
</script>
