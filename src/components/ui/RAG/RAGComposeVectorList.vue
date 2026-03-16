<template>
    <div v-if="show" class="bg-background/50 fixed inset-0 z-[11000] flex items-center justify-center backdrop-blur-sm" @click="emitClose">
        <!-- Modal -->
        <div class="bg-backgroundColor text-textColor m-4 w-[400px] rounded-md p-5 shadow-lg" @click.stop>
            <!-- Header -->
            <div class="mb-8 flex items-center justify-between">
                <div class="text-xl font-semibold">Vector Sources List</div>
                <div class="cursor-pointer text-2xl" @click="emitClose">
                    <div class="materialSymbolsOutlined">close</div>
                </div>
            </div>

            <!-- Body Container -->
            <div class="mb-2.5 flex h-[70vh] flex-col overflow-y-scroll p-1.5">
                <div v-for="(source, index) in sources" :key="index" class="mb-8 flex flex-col gap-4">
                    <div class="font-medium">Source {{ index + 1 }}</div>
                    <div class="flex flex-col gap-1 pl-1">
                        <label class="text-sm font-semibold">Query Used</label>
                        <div class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded-md border-2 p-2.5">
                            {{ source.query }}
                        </div>

                        <label class="text-sm font-semibold">Source Title</label>
                        <div class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded-md border-2 p-2.5">
                            {{ source.title }}
                        </div>

                        <label class="text-sm font-semibold">Source Text</label>
                        <div class="border-strokeColor bg-sideBarBackgroundColor text-textColor w-full rounded-md border-2 p-2.5">
                            {{ source.paragraph }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="flex w-full items-center justify-center gap-2">
                <button class="bg-itemColor text-foreground w-full cursor-pointer rounded-md border-0 px-4 py-2" @click="emitClose">Cancel</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps({
        show: Boolean,
        sources: {
            type: Array,
            required: true,
        },
    })

    const emit = defineEmits(["update:show"])

    function emitClose() {
        emit("update:show", false)
    }
</script>
