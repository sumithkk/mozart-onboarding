<template>
    <div class="flex w-full flex-col space-y-1">
        <label for="name" class="text-textColor text-base font-[700]">{{ label }}</label>
        <div class="relative w-full">
            <input
                :type="isPasswordVisible ? 'text' : type"
                :id="labelId"
                :value="currentValue"
                :disabled="disabled"
                v-model="currentValue"
                @input="onInputUpdate(labelId, $event)"
                :placeholder="placeholderValue"
                class="border-strokeColor bg-sideBarBackgroundColor text-textColor focus:border-linkColor w-full rounded-lg border-2 px-4 py-[0.45rem] placeholder-gray-500 transition-colors outline-none focus:outline-none"
                :class="{ 'cursor-not-allowed': disabled, 'pr-12': type === 'password' }"
            />

            <button v-if="type === 'password'" @click="togglePasswordVisibility" :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'" :aria-expanded="isPasswordVisible" :aria-controls="labelId" type="button" class="hover:text-linkColor text-textColor absolute top-1/2 right-3 -translate-y-1/2 transform p-1 transition-colors focus:outline-none">
                <!-- Eye Icon (visible when password is hidden) -->
                <svg v-if="!isPasswordVisible" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>

                <!-- Eye Off Icon (visible when password is shown) -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                </svg>
            </button>
        </div>

        <p class="text-inputInfoColor text-sm" v-if="inputInfo">{{ inputInfo }}</p>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, watch, defineProps, defineEmits } from "vue"
    const props = defineProps({
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
        inputInfo: {
            type: String,
            default: "",
        },
        placeholderValue: {
            type: String,
            default: "",
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    })

    const emit = defineEmits(["update:modelValue"])
    const currentValue = ref(props.defaultValue)
    const isPasswordVisible = ref(false)

    const togglePasswordVisibility = () => {
        isPasswordVisible.value = !isPasswordVisible.value
    }
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
