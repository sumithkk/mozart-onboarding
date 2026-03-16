<template>
    <!-- Overlay wrapper -->
    <div class="bg-background/50 fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-sm">
        <!-- Popup container -->
        <div class="border-border bg-card bg-card flex w-[90%] max-w-[500px] flex-col rounded-lg border p-5">
            <!-- Title -->
            <div class="text-foreground text-foreground mb-5 text-xl font-semibold">Edit File</div>

            <!-- Popup body -->
            <div class="mb-5 flex w-full gap-5">
                <!-- Left side -->
                <div class="flex flex-1 flex-col gap-2">
                    <input type="text" placeholder="Document name" v-model="name" class="bg-background text-foreground focus:ring-primary border-border bg-input text-foreground rounded border p-2 focus:ring-2 focus:outline-none" />

                    <!-- Tags component -->
                    <Tags :tags="tags" />
                </div>

                <!-- Right side -->
                <div class="flex flex-col items-center gap-4">
                    <div class="flex h-auto max-w-[200px] items-center justify-center">
                        <img :src="image" alt="Document" class="max-h-full max-w-full object-contain" />
                    </div>

                    <!-- Document info -->
                    <div class="flex w-full flex-col items-center p-2">
                        <!-- Size -->
                        <div class="text-foreground text-foreground mb-2 flex w-full justify-between">
                            <div>Size</div>
                            <div>{{ formatBytes(size) }}</div>
                        </div>

                        <!-- Type -->
                        <div class="text-foreground text-foreground flex w-full justify-between">
                            <div>Type</div>
                            <div>{{ type }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-between">
                <!-- Discard button -->
                <button @click="discardNote" class="border-border bg-card text-foreground border-border bg-input text-foreground rounded border px-4 py-2 transition-opacity hover:opacity-80">Discard</button>

                <!-- Save button (conditionally styled if disabled) -->
                <button
                    @click="saveNote"
                    :class="{
                        'cursor-not-allowed opacity-50': name.length == 0,
                    }"
                    class="bg-primary text-foreground hover:bg-primary rounded px-4 py-2 transition-colors"
                >
                    Save
                </button>
            </div>

            <!-- Error message (if any) -->
            <div v-if="errorMessage" class="text-destructive text-destructive/60 mt-3">
                {{ errorMessage }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from "vue"
    import { formatBytes } from "~/util"

    const emits = defineEmits(["save", "discard"])

    const props = defineProps<{
        document: {
            name: string
            image: string
            size: number
            tags: string[]
            type: string
        }
    }>()

    const name = ref("")
    const image = ref("")
    const tags = ref<string[]>([])
    const type = ref("")
    const size = ref(0)
    const errorMessage = ref("")

    function discardNote() {
        name.value = ""
        image.value = ""
        tags.value = []
        type.value = ""
        size.value = 0
        errorMessage.value = ""
        emits("discard")
    }

    function saveNote() {
        if (name.value.length === 0) {
            errorMessage.value = "Name is required"
            return
        }

        emits("save", {
            name: name.value,
            tags: tags.value,
        })

        // Reset fields
        name.value = ""
        image.value = ""
        tags.value = []
        type.value = ""
        size.value = 0
        errorMessage.value = ""
    }

    onMounted(() => {
        name.value = props.document.name
        image.value = props.document.image
        tags.value = props.document.tags
        type.value = props.document.type
        size.value = props.document.size
    })
</script>
