<template>
    <div class="relative my-8 flex items-center">
        <input :type="type" :id="labelId" :value="currentValue" v-model="currentValue" @input="onInputUpdate(labelId, $event)" class="border-border text-textColor block h-9 w-full border-b-2 bg-transparent text-lg leading-6 font-normal focus:outline-none" />
        <label :for="labelId" class="text-muted-foreground pointer-events-none absolute bottom-7 cursor-text text-lg leading-6 font-normal transition-transform duration-200 ease-in-out" :class="currentValue ? '-translate-y-6' : ''">
            {{ label }}
        </label>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, watch, defineProps, defineEmits } from "vue"

    const props = defineProps({
        placeholderValue: String,
        type: String,
        label: {
            type: String,
            required: true,
        },
        id: String,
        defaultValue: {
            type: String,
            default: "",
        },
    })

    const emit = defineEmits(["update:modelValue"])
    const currentValue = ref(props.defaultValue)

    // Generate a label id from the label text
    const labelId = computed(() => {
        return `input_${props.label.replace(/\s+/g, "_").toLowerCase()}`
    })

    const onInputUpdate = (field: any, event?: any) => {
        if (event) {
            emit("update:modelValue", event.target.value)
        }
        const inputElement: any = document.getElementById(field)
        if (currentValue.value) {
            // Adds notEmpty class (could be used for additional styling if you like)
            inputElement.classList.add("notEmpty")
        } else {
            inputElement.classList.remove("notEmpty")
        }
    }

    onMounted(() => {
        onInputUpdate(labelId.value)
    })

    // Watch for prop changes to defaultValue and update the model accordingly.
    watch(
        () => props.defaultValue,
        (newValue) => {
            currentValue.value = newValue
            onInputUpdate(labelId.value)
        }
    )
</script>
