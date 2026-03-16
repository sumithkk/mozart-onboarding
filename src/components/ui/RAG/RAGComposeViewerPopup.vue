<template>
    <!-- Overlay -->
    <div v-if="show" class="bg-background/50 fixed inset-0 z-[11000] flex items-center justify-center backdrop-blur-sm" @click="emitClose">
        <!-- Modal -->
        <div class="bg-backgroundColor text-textColor m-4 h-[90%] w-[80%] overflow-hidden rounded-md p-5 shadow-lg" @click.stop>
            <!-- Header -->
            <div class="mb-8 flex items-center justify-between">
                <div class="text-xl">
                    {{ source.fileName }}
                </div>
                <div class="cursor-pointer text-2xl" @click="emitClose">
                    <div class="materialSymbolsOutlined">close</div>
                </div>
            </div>

            <!-- Viewer Content -->
            <div class="h-[calc(100%-72px)]">
                <ClientOnly>
                    <ViewerHolder :fileUrl="source.fileUrl" :fileType="source.fileType" :ragFile="true" />
                </ClientOnly>
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
