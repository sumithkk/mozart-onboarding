<template>
    <div v-if="show" class="bg-background/50 fixed inset-0 z-[11000] flex items-center justify-center backdrop-blur-sm" @click="emitClose">
        <!-- Modal -->
        <div class="bg-background text-textColor m-4 min-w-[500px] overflow-auto rounded-md p-5 shadow-lg" @click.stop>
            <!-- Header -->
            <div class="mb-4 flex flex-col gap-2">
                <div class="flex items-center justify-between">
                    <div class="text-xl font-semibold">Anonymization Terms</div>
                    <div class="cursor-pointer text-2xl" @click="emitClose">
                        <div class="materialSymbolsOutlined">close</div>
                    </div>
                </div>
                <div class="text-muted-foreground text-sm">Enter terms to anonymize and their replacement values</div>
            </div>

            <!-- Body Container -->
            <div class="mb-4 space-y-3">
                <div v-for="(pair, index) in keyValuePairs" :key="index" class="flex items-center gap-2">
                    <input type="text" v-model="pair.key" placeholder="Original term" class="border-strokeColor bg-sideBarBackgroundColor text-textColor focus:border-itemColor flex-1 rounded-md border-2 p-2.5 focus:outline-none" />
                    <div class="text-muted-foreground">→</div>
                    <input type="text" v-model="pair.value" placeholder="Replacement" class="border-strokeColor bg-sideBarBackgroundColor text-textColor focus:border-itemColor flex-1 rounded-md border-2 p-2.5 focus:outline-none" />
                    <button @click="removePair(index)" class="text-destructive hover:text-destructive p-2 transition-colors">
                        <div class="materialSymbolsOutlined">delete</div>
                    </button>
                </div>

                <button @click="addPair" class="border-strokeColor text-muted-foreground hover:border-itemColor hover:text-itemColor flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed p-2 transition-colors">
                    <div class="materialSymbolsOutlined">add</div>
                    Add Term
                </button>
            </div>

            <!-- Footer -->
            <div class="flex w-full items-center justify-end gap-2">
                <button class="hover:bg-itemColor/90 bg-itemColor text-foreground cursor-pointer rounded-md border-0 px-4 py-2 transition-colors" @click="save">Save</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    interface KeyValuePair {
        key: string
        value: string
    }

    const keyValuePairs = ref<KeyValuePair[]>([{ key: "", value: "" }])

    const props = defineProps({
        show: {
            type: Boolean,
            required: true,
        },
    })

    const emit = defineEmits(["update:show", "anonymizationTerms", "close"])

    function addPair() {
        keyValuePairs.value.push({ key: "", value: "" })
    }

    function removePair(index: number) {
        keyValuePairs.value.splice(index, 1)
        if (keyValuePairs.value.length === 0) {
            addPair()
        }
    }

    function save() {
        const validPairs = keyValuePairs.value.filter((pair) => pair.key.trim() && pair.value.trim())
        const formattedString = validPairs.map((pair) => `${pair.key.trim()}:${pair.value.trim()}`).join(",")

        emit("anonymizationTerms", formattedString)
        emit("update:show", false)
        emit("close")
    }

    function emitClose() {
        emit("update:show", false)
        emit("close")
    }
</script>
