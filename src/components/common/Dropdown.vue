<template>
    <div class="group relative w-full max-w-[400px]">
        <!-- The select element -->
        <select class="border-strokeColor bg-sideBarBackgroundColor text-sideBarTextColor focus:border-linkColor w-full cursor-pointer appearance-none rounded-lg border-2 px-3 py-2 pr-10 text-base transition-colors duration-300 focus:outline-none" v-model="selectedOption" @change="updateValue($event.target.value)">
            <option disabled value="">{{ placeholder }}</option>
            <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.text }}
            </option>
        </select>

        <!-- The dropdown arrow -->
        <div class="border-linkColor group-focus-within:border-logoColor group-hover:border-logoColor pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rotate-45 border-r-2 border-b-2 border-solid p-[5px] transition-colors duration-300"></div>
    </div>
</template>
<script setup lang="ts">
    import { ref, watch } from "vue"

    const props = defineProps({
        options: Array,
        placeholder: String,
        label: String,
        defaultValue: String,
        reset: Boolean,
    })
    const emit = defineEmits(["update:modelValue"])

    const selectedOption = ref(props.defaultValue || "")

    const updateValue = (value: string) => {
        emit("update:modelValue", value)
    }

    watch(
        () => props.defaultValue,
        (newValue) => {
            selectedOption.value = newValue || ""
        }
    )

    watch(
        () => props.reset,
        (newValue) => {
            if (newValue) {
                selectedOption.value = ""
            }
        }
    )
</script>
