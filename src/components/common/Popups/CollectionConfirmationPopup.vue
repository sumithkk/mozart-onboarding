<template>
    <div v-if="show" class="modalOverlay bg-background/50 fixed top-0 left-0 z-[11000] flex h-[100vh] w-[100vw] items-center justify-center backdrop-blur-[2px]">
        <div class="modal bg-backgroundColor text-textColor m-[15px] w-fit rounded-[6px] p-[20px] shadow-[0_4px_10px_rgba(0,0,0,0.3)]" @click.stop>
            <div class="header mb-0 flex items-center justify-between">
                <div class="modalShortName text-base">
                    {{ shortName }}
                </div>

                <div v-if="closeOnTopRight" class="modalClose cursor-pointer text-[24px]" @click="emitClose">
                    <div class="materialSymbolsOutlined">close</div>
                </div>
            </div>

            <div class="modalHeader mb-2 text-xl">
                {{ title }}
            </div>

            <div class="modalSubtitle mb-4 text-base font-light">
                {{ subtitle }}
            </div>

            <!-- Default Collection Selector (if provided) -->
            <div v-if="alternativeCollections && alternativeCollections.length > 0" class="mb-8">
                <label class="mb-2 block text-sm font-medium">Select new default collection:</label>
                <select v-model="selectedNewDefault" class="bg-card text-foreground bg-card text-foreground w-full rounded border p-2 focus:outline-none">
                    <option v-for="collection in alternativeCollections" :key="collection.name" :value="collection.name">
                        {{ collection.alias || collection.name }}
                    </option>
                </select>
            </div>

            <!-- Slot for any additional content -->
            <slot></slot>

            <div class="modalFooter flex w-full items-center justify-center gap-2">
                <button class="modalButton bg-itemColor text-foreground w-full cursor-pointer rounded-[7px] border-none px-4 py-2" @click="emitClose">Cancel</button>
                <button class="modalButton text-foreground w-full cursor-pointer rounded-[7px] border-none px-4 py-2" :style="{ backgroundColor: confirmButtonColor }" @click="confirmAction">
                    {{ confirmButtonText }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, watch } from "vue"

    interface Collection {
        id?: string | number
        name: string
        alias?: string
        service?: string
        [key: string]: any
    }

    const props = defineProps({
        show: Boolean,
        shortName: String,
        title: String,
        subtitle: String,
        closeOnTopRight: Boolean,
        confirmButtonText: String,
        confirmButtonColor: String,
        alternativeCollections: {
            type: Array as () => Collection[],
            default: () => [],
        },
    })

    const selectedNewDefault = ref(props.alternativeCollections?.[0]?.name || "")

    const emit = defineEmits(["update:show", "buttonClick", "newDefaultSelected"])

    function emitClose() {
        console.log(props.alternativeCollections)
        emit("update:show", false)
    }

    function confirmAction() {
        if (props.alternativeCollections && props.alternativeCollections.length > 0) {
            emit("newDefaultSelected", selectedNewDefault.value)
        }
        emit("buttonClick", "confirm")
    }

    watch(
        () => props.alternativeCollections,
        (newCollections: Collection[]) => {
            if (newCollections && newCollections.length > 0) {
                selectedNewDefault.value = newCollections[0].name
            }
        },
        { deep: true }
    )
</script>
