<template>
    <div class="flex flex-col gap-3">
        <!-- Loop over items -->
        <div class="flex items-center" v-for="(item, index) in items" :key="index">
            <label class="relative inline-flex cursor-pointer items-center select-none">
                <!-- Our custom input -->
                <input
                    :type="inputType"
                    :name="inputName"
                    :checked="index === 0"
                    @change="$emit('input-change', item)"
                    class="/* Common for the pseudo-elements */ /* Use after: to draw the outer shape (square or circle) */ /* or any Tailwind color, e.g. */ /* fallback background color */ /* Use before: to draw the checkmark or the filled dot */ /* start invisible, scale up when checked */ border-border after:border-strokeColor after:bg-headerTextColor relative m-0 h-4 w-4 cursor-pointer appearance-none p-0 transition outline-none before:absolute before:z-[1] before:scale-0 before:transition-transform before:duration-300 before:ease-in-out before:content-[''] after:absolute after:top-0 after:left-0 after:h-4 after:w-4 after:cursor-pointer after:border after:transition-colors after:duration-300 after:ease-in-out after:content-[''] checked:before:scale-100"
                    :class="[
                        // --- Checkbox styles ---
                        type === 'multi'
                            ? 'before:top-[2px] before:left-[3px] before:h-[6px] before:w-[12px] ' +
                              'before:border-logoColor before:border-2 before:border-t-0 before:border-r-0' +
                              'before:rotate-[-45deg]' +
                              // Make the outer shape square
                              'after:rounded-none' +
                              // Optional: top shift so it aligns nicely
                              'mt-1'
                            : '',

                        // --- Radio styles ---
                        type === 'single'
                            ? 'before:top-[4px] before:left-[4px] before:h-2 before:w-2 ' +
                              'before:bg-logoColor before:rounded-full' +
                              // Outer shape is circle
                              'after:rounded-full' +
                              // Optional: top shift so it aligns nicely
                              'mt-0.5'
                            : '',
                    ]"
                />
                <!-- Text label -->
                <span class="ml-2">{{ item }}</span>
            </label>
        </div>
    </div>
</template>

<script setup>
    const props = defineProps({
        type: {
            type: String,
            required: true,
            validator: (value) => ["single", "multi"].includes(value),
        },
        items: {
            type: Array,
            required: true,
        },
    })

    // "radio" if single, "checkbox" if multi
    const inputType = props.type === "single" ? "radio" : "checkbox"

    // "radioGroup" if single, or empty string if multi
    const inputName = props.type === "single" ? "radioGroup" : ""
</script>
