<template>
    <!-- Modal Overlay -->
    <div class="fixed inset-0 z-[1010] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <!-- Popup -->
        <div class="flex w-[90%] max-w-[500px] flex-col rounded-md border border-neutral-300 bg-neutral-100 p-5 dark:border-neutral-600 dark:bg-neutral-800">
            <!-- Title -->
            <div class="mb-3 text-2xl font-medium text-neutral-800 dark:text-neutral-100">{{ note ? 'Edit Note' : 'New Note' }}</div>

            <!-- Title input -->
            <input type="text" v-model="title" placeholder="Some title can go here!!" class="mb-3 rounded border border-neutral-300 bg-neutral-200 px-3 py-2 text-neutral-800 focus:ring-1 focus:ring-mozart-blue-400 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100" />

            <!-- Content textarea -->
            <textarea v-model="content" placeholder="Start typing your note..." class="mb-3 h-36 resize-y rounded border border-neutral-300 bg-neutral-200 px-3 py-2 text-neutral-800 focus:ring-1 focus:ring-mozart-blue-400 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"></textarea>

            <!-- Error message -->
            <div v-if="errorMessage.length > 0" class="mb-3 text-red-500">
                {{ errorMessage }}
            </div>

            <!-- Actions: Discard / Save -->
            <div class="flex justify-between">
                <button class="rounded bg-neutral-300 px-4 py-2 text-neutral-800 transition hover:opacity-80 dark:bg-neutral-600 dark:text-neutral-100" @click="discardNote">Discard</button>
                <button @click="saveNote" :class="['rounded px-4 py-2 text-white transition hover:opacity-90', title.length === 0 || content.length === 0 ? 'cursor-not-allowed bg-neutral-400' : 'bg-mozart-blue']">Save</button>
            </div>

            <!-- Word Count -->
            <div class="mt-3 text-neutral-800 dark:text-neutral-100">Words: {{ wordCount }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from "vue"

    // Define emits and accept props
    const emits = defineEmits(["save", "discard"])
    const props = defineProps({ 
        isVisible: Boolean,
        note: {
            type: Object,
            default: null
        }
    })

    const documentStore = useDocumentsStore()

    // Local refs
    const title = ref(props.note?.title || "")
    const content = ref(props.note?.content || "")
    const errorMessage = ref("")
    
    // Watch for note changes (when editing different notes)
    watch(() => props.note, (newNote) => {
        if (newNote) {
            title.value = newNote.title || ""
            content.value = newNote.content || ""
        } else {
            title.value = ""
            content.value = ""
        }
        errorMessage.value = ""
    }, { immediate: true })

    // Computed word count
    const wordCount = computed(() => {
        return content.value
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length
    })

    // Save note
    const saveNote = async () => {
        if (title.value.length === 0 || content.value.length === 0) {
            errorMessage.value = "Title and content are required"
            return
        }
        const noteData = props.note 
            ? { noteId: props.note.noteId, title: title.value, content: content.value }
            : { title: title.value, content: content.value }
        emits("save", noteData)
        if (!props.note) {
            title.value = ""
            content.value = ""
            errorMessage.value = ""
        }
    }

    // Discard note
    const discardNote = () => {
        emits("discard")
        title.value = ""
        content.value = ""
        errorMessage.value = ""
    }
</script>
