<template>
    <div class="group relative max-w-[400px]">
        <select class="border-strokeColor bg-sideBarBackgroundColor text-sideBarTextColor focus:border-linkColor w-full cursor-pointer appearance-none border-2 p-[10px] pr-[40px] pl-[12px] text-[16px] transition-colors duration-300 focus:outline-none" v-model="selectedOption" @change="updateValue($event.target.value)">
            <option disabled value="">{{ placeholder }}</option>
            <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.text }}
            </option>
        </select>

        <!-- Dropdown Arrow -->
        <div class="border-linkColor group-focus-within:border-logoColor group-hover:border-logoColor pointer-events-none absolute top-1/2 right-[15px] -translate-y-1/2 rotate-45 border-t-0 border-r-[2px] border-b-[2px] border-l-0 border-solid p-[5px] transition-colors duration-300"></div>
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

    // Track selected option
    const selectedOption = ref(props.defaultValue || "")

    // Emit updated value on change
    function updateValue(value: string) {
        emit("update:modelValue", value)
    }

    // Watch for changes in defaultValue
    watch(
        () => props.defaultValue,
        (newValue) => {
            selectedOption.value = newValue || ""
        }
    )

    // Reset logic
    watch(
        () => props.reset,
        (newValue) => {
            if (newValue) {
                selectedOption.value = ""
            }
        }
    )
</script>
