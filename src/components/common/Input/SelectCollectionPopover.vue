<template>
    <!-- Wrapper: position: relative; display: inline-block; + "hover group" approach -->
    <div class="group relative inline-block">
        <slot></slot>

        <!-- The dropdown list (collections) -->
        <span v-if="showCollections" class="border-strokeColor bg-sideBarBackgroundColor text-textColor absolute bottom-[125%] left-1/2 z-[1] -ml-[28px] h-[150px] w-[160px] overflow-y-scroll rounded-[6px] border p-[5px] text-center">
            <!-- Collections loop -->
            <div v-for="collection in ragStore.collections" :key="collection.id" class="hover:bg-strokeColor flex cursor-pointer items-center px-[5px] hover:rounded-[6px]" @click="selectCollection(collection)">
                <VTooltip>
                    <!-- Status Light Circle -->
                    <div
                        class="mr-[5px] h-[10px] w-[10px] rounded-full"
                        :class="{
                            'bg-primary': collectionColor(collection) === 'blue',
                            'bg-red': collectionColor(collection) === 'red',
                            'bg-yellow': collectionColor(collection) === 'yellow',
                        }"
                    />
                    <template #popper>{{ collection.alias ?? collection.name }}</template>
                </VTooltip>

                <!-- Collection Name -->
                <p
                    class="truncate"
                    :class="{
                        'text-red': collectionColor(collection) === 'red',
                        'text-textColor': collectionColor(collection) === 'blue' || collectionColor(collection) === 'yellow',
                    }"
                >
                    {{ trimConnectionName(collection) }}
                </p>
            </div>
        </span>
    </div>
</template>

<script setup lang="ts">
    defineProps({
        collectionList: Array,
        showCollections: Boolean,
    })

    const emit = defineEmits(["toggleCollection"])
    const ragStore = useRagStore()

    // Example "selectCollection" logic (unchanged)
    const selectCollection = (collection: any) => {
        if (ragStore.currentQdrantInstance !== collection.service) {
            ragStore.currentQdrantInstance = collection.service
        }
        ragStore.currentCollection = collection.name
        emit("toggleCollection")
    }

    // Example function to truncate or alias a collection name
    const trimConnectionName = (collection: any) => {
        const source = collection.alias ?? collection.name
        return source.length > 12 ? source.slice(0, 12) + "..." : source
    }

    // Optional helper to decide which color class to apply
    const collectionColor = (collection: any) => {
        return "blue" // default
    }
</script>
