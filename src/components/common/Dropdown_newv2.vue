<template>
    <div class="group relative w-full">
        <!-- Label -->
        <label for="name" class="text-base font-semibold text-[--textColor]">
            {{ label }}
        </label>

        <div class="relative py-1">
            <!-- Select Dropdown -->
            <select class="peer border-border bg-sideBarBackgroundColor text-sideBarTextColor focus:border-linkColor w-full cursor-pointer appearance-none rounded-md border-2 py-2 pr-10 pl-4 text-base transition-colors focus:outline-none" v-model="selectedOption" @change="updateValue(($event.target as HTMLSelectElement).value)" :disabled="disabled">
                <option disabled value="">{{ placeholder }}</option>
                <option v-for="option in options" :key="option.value" :value="option.value">
                    {{ option.text }}
                </option>
            </select>

            <!-- Dropdown Icon -->
            <div class="border-border peer-focus:border-logoColor absolute top-1/2 right-4 h-3 w-3 -translate-y-1/2 rotate-45 border-r-2 border-b-2 transition-all"></div>
        </div>

        <!-- Info Text -->
        <p class="text-muted-foreground m-0 text-sm text-[--inputInfoColor]" v-if="inputInfo">
            {{ inputInfo }}
        </p>
    </div>
</template>
<script setup lang="ts">
    import { ref, watch } from "vue"

    const props = defineProps({
        options: {
            type: Array as () => { value: string; text: string }[],
            required: true,
        },
        placeholder: String,
        label: String,
        defaultValue: String,
        reset: Boolean,
        inputInfo: {
            type: String,
            default: "",
        },
        disabled: {
            type: Boolean,
            default: false,
        },
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
