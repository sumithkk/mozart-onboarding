<template>
    <div class="flex flex-col items-center">
        <div class="flex flex-row gap-2">
            <!-- Existing tags -->
            <div v-for="tag in tags" :key="tag.id" class="border-strokeColor text-textColor flex items-center rounded-full border px-2 py-1">
                <div class="max-w-[50px] overflow-hidden text-xs font-medium text-ellipsis whitespace-nowrap">
                    {{ tag.text }}
                </div>
                <button class="cursor-pointer border-none bg-transparent" @click="removeTag(tag.id)">
                    <div class="materialSymbolsFilled text-textColor text-xs">close</div>
                </button>
            </div>

            <!-- New tag input -->
            <div v-if="addTagActive" class="flex items-center">
                <input ref="inputRef" type="text" v-model="newTagText" @keyup.enter="createTag" @blur="addTagActive = false" placeholder="Enter tag" class="border-strokeColor text-textColor w-[100px] rounded-full border bg-transparent px-2 py-1 text-sm" />
            </div>

            <!-- Add tag button -->
            <div class="border-strokeColor text-textColor hover:bg-itemColor flex h-[0.7rem] w-[0.7rem] cursor-pointer items-center justify-center rounded-full border border-dashed bg-transparent p-2">
                <div @click="toggleAddTag" class="materialSymbolsFilled text-xs">add</div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { ref, watch, nextTick } from "vue"

    const props = defineProps({
        tags: Array,
    })

    const emit = defineEmits(["update:tagListUpdate"])

    // Local reactive copies of passed-in props
    const tags = ref(props.tags || [])

    // Flag to control visibility of the input box
    const addTagActive = ref(false)

    // Text for new tag
    const newTagText = ref("")

    // Reference to the input element
    const inputRef = ref(null)

    const toggleAddTag = async () => {
        addTagActive.value = !addTagActive.value
        await nextTick()
        if (addTagActive.value) {
            inputRef.value.focus()
        }
    }

    const removeTag = (id) => {
        tags.value = tags.value.filter((tag) => tag.id !== id)
        emit("update:tagListUpdate", tags.value)
    }

    const createTag = () => {
        if (newTagText.value.trim()) {
            tags.value.push({ id: Date.now(), text: newTagText.value.trim() })
            newTagText.value = ""
            addTagActive.value = false
            emit("update:tagListUpdate", tags.value)
        }
    }

    watch(
        () => props.tags,
        (newVal) => {
            tags.value = newVal
        }
    )
</script>
