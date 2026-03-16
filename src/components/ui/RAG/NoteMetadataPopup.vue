<template>
    <!-- Overlay -->
    <div v-if="show" class="bg-background/50 fixed inset-0 z-[1010] flex h-screen w-screen items-center justify-center backdrop-blur-sm" @click="emitClose">
        <!-- Modal -->
        <div class="bg-backgroundColor text-textColor m-4 w-fit rounded-md p-5 shadow-lg" @click.stop>
            <!-- Header -->
            <div class="mb-8 flex items-center justify-between">
                <div class="text-base">
                    {{ note?.title }}
                </div>
                <div class="cursor-pointer text-xl" @click="emitClose">
                    <div class="materialSymbolsOutlined">close</div>
                </div>
            </div>

            <div class="mb-2 text-xl">Add Metadata</div>

            <!-- Inputs -->
            <div class="mb-4 flex gap-4">
                <input type="text" v-model="keyInput" placeholder="Key" class="border-border flex-1 rounded border p-2" />
                <input type="text" v-model="valueInput" placeholder="Value" class="border-border flex-1 rounded border p-2" />
            </div>

            <!-- Add Button -->
            <div class="border-strokeColor2 text-textColor mb-2.5 inline-block cursor-pointer rounded border-2 p-2.5 font-light" @click="addMetadata">
                <div class="materialSymbolsOutlined">add</div>
            </div>

            <!-- Metadata List -->
            <div class="mb-4">
                <div v-for="(value, key) in metadata" :key="key" class="bg-strokeColor mb-2 flex items-center justify-between rounded p-2">
                    <span>{{ key }}: {{ value }}</span>
                    <div class="text-textColor cursor-pointer text-lg" @click="removeMetadata(key as string)">
                        <div class="materialSymbolsOutlined">close</div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="flex w-full items-center justify-center gap-2">
                <button class="bg-itemColor text-foreground w-full cursor-pointer rounded-md border-0 p-2 px-4" @click="emitClose">Cancel</button>
                <button class="bg-itemColor text-foreground w-full cursor-pointer rounded-md border-0 p-2 px-4" @click="buttonClick">Vectorize</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps({
        show: Boolean,
        note: {
            type: Object as PropType<INote | undefined>,
            required: true,
        },
    })
    const emit = defineEmits(["update:show", "addMetadata"])

    function emitClose() {
        emit("update:show", false)
    }

    const keyInput = ref("")
    const valueInput = ref("")
    const metadata = ref<{ [key: string]: string }>({})

    function addMetadata() {
        if (keyInput.value && valueInput.value) {
            metadata.value[keyInput.value] = valueInput.value
            keyInput.value = ""
            valueInput.value = ""
        }
    }

    function removeMetadata(key: string) {
        delete metadata.value[key]
    }

    function buttonClick() {
        emit("addMetadata", { metadata: metadata.value, ...props.note })
    }
</script>
