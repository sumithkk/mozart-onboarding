<template>
    <div v-if="show" class="bg-background/50 fixed inset-0 z-[11000] flex items-center justify-center backdrop-blur-sm" @click="emitClose">
        <!-- Modal Container -->
        <div class="bg-backgroundColor text-textColor m-4 w-[400px] rounded-md p-5 shadow-lg" @click.stop>
            <!-- Header -->
            <div class="mb-8 flex items-center justify-between">
                <div class="text-xl font-semibold">Vector Search</div>
                <div class="cursor-pointer text-2xl" @click="emitClose">
                    <div class="materialSymbolsOutlined">close</div>
                </div>
            </div>

            <!-- Query -->
            <div class="mb-8 flex flex-col gap-4">
                <div>Query Used</div>
                <div class="border-strokeColor bg-sideBarBackgroundColor text-textColor max-h-[100px] w-full overflow-y-scroll rounded-md border-2 p-2.5">
                    {{ source.query }}
                </div>
            </div>

            <!-- Source Text -->
            <div class="mb-8 flex flex-col gap-4">
                <div>Source Text</div>
                <div class="border-strokeColor bg-sideBarBackgroundColor text-textColor max-h-[100px] w-full overflow-y-scroll rounded-md border-2 p-2.5">
                    {{ source.paragraph }}
                </div>
            </div>

            <!-- Source Title -->
            <div class="mb-8 flex flex-col gap-4">
                <div>Source Title</div>
                <div class="border-strokeColor bg-sideBarBackgroundColor text-textColor max-h-[100px] w-full overflow-y-scroll rounded-md border-2 p-2.5">
                    {{ source.title }}
                </div>
            </div>

            <!-- Source Collection -->
            <div class="mb-8 flex flex-col gap-4">
                <div>Source Collection</div>
                <div class="border-strokeColor bg-sideBarBackgroundColor text-textColor max-h-[100px] w-full overflow-y-scroll rounded-md border-2 p-2.5">
                    {{ source.collection_name }}
                </div>
            </div>

            <!-- Source Page -->
            <div class="mb-8 flex flex-col gap-4">
                <div>Source Page</div>
                <div class="border-strokeColor bg-sideBarBackgroundColor text-textColor max-h-[100px] w-full overflow-y-scroll rounded-md border-2 p-2.5">
                    {{ source.pageNumber }}
                </div>
            </div>

            <!-- Source Link -->
            <div class="mb-8 flex flex-col gap-4">
                <a :href="source.url" target="_blank" class="text-primary hover:text-primary"> Browse Source </a>
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
        source: {
            type: Object,
            required: true,
        },
    })

    const emit = defineEmits(["update:show"])

    function emitClose() {
        emit("update:show", false)
    }
</script>
