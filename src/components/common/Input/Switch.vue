<template>
    <!-- Outer container -->
    <div class="flex items-center">
        <VTooltip>
            <!-- Hidden checkbox -->
            <input :id="id" type="checkbox" class="peer absolute h-0 w-0 opacity-0" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)" :disabled="disabled" />

            <!-- Switch track & knob -->
            <label
                :for="id"
                class="/* Light mode track */ /* Dark mode track */ /* Light mode knob */ /* Dark mode knob */ /* Light mode checked track */ /* Dark mode checked track */ /* Light mode checked knob */ peer-checked:after:border-border/* Dark mode checked knob */ bg-unselectedColor after:bg-greyBlack dark:peer-checked:bg-primaryColor peer-checked:after:border-border relative block cursor-pointer rounded-full peer-checked:bg-neutral-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 after:absolute after:rounded-full after:transition-all after:content-['']"
                :class="[sizeClasses.track, sizeClasses.knob, sizeClasses.checkedOffset, sizeClasses.activeKnob]"
            >
            </label>
            <template #popper>{{ tooltip }}</template>
        </VTooltip>
    </div>
</template>

<script setup>
    /**
     * Props:
     * - modelValue (Boolean): the state of the switch (on/off)
     * - id (String): optional custom ID for the switch
     * - tooltip (String): text for the tooltip
     * - size (String): 'sm' | 'md' | 'lg' - controls switch dimensions
     */
    const props = defineProps({
        modelValue: {
            type: Boolean,
            default: false,
        },
        id: {
            type: String,
            default: () => `switch-${Math.random().toString(36).substr(2, 9)}`,
        },
        tooltip: {
            type: String,
            default: "",
        },
        size: {
            type: String,
            default: "md",
            validator: (value) => ["sm", "md", "lg"].includes(value),
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    })

    /**
     * Dynamically build classes based on size prop.
     * We adjust track width/height, knob size,
     * the "checked offset," and the "active" knob size.
     */
    const sizeClasses = computed(() => {
        switch (props.size) {
            case "sm":
                return {
                    // Track: 40x20
                    track: "w-[40px] h-[20px]",
                    // Knob: top/left = 2px, size = 16
                    knob: "after:top-[2px] after:left-[2px] after:w-[16px] after:h-[16px]",
                    // Move knob right: offset 2px, then translate
                    checkedOffset: "peer-checked:after:left-[calc(100%-2px)] peer-checked:after:translate-x-[-100%]",
                    // "Active" click effect
                    activeKnob: "active:after:w-[22px]",
                }
            case "lg":
                return {
                    // Track: 80x40
                    track: "w-[80px] h-[40px]",
                    // Knob: top/left = 4px, size = 32
                    knob: "after:top-[4px] after:left-[4px] after:w-[32px] after:h-[32px]",
                    // Move knob right: offset 4px, then translate
                    checkedOffset: "peer-checked:after:left-[calc(100%-4px)] peer-checked:after:translate-x-[-100%]",
                    // "Active" click effect
                    activeKnob: "active:after:w-[44px]",
                }
            default: // 'md'
                return {
                    // Track: 60x30
                    track: "w-[60px] h-[30px]",
                    // Knob: top/left = 3px, size = 24
                    knob: "after:top-[3px] after:left-[3px] after:w-[24px] after:h-[24px]",
                    // Move knob right: offset 3px, then translate
                    checkedOffset: "peer-checked:after:left-[calc(100%-3px)] peer-checked:after:translate-x-[-100%]",
                    // "Active" click effect
                    activeKnob: "active:after:w-[34px]",
                }
        }
    })
</script>
