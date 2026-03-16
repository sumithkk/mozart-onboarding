<template>
    <div class="range-slider" @mousedown="onTrackMouseDown" @touchstart="onTrackTouchStart" ref="track">
        <div class="range-slider__track"></div>
        <div class="range-slider__range" :style="rangeStyle"></div>
        <button class="range-slider__handle" :style="handleStyle(0)" :aria-valuemin="min" :aria-valuemax="max" :aria-valuenow="modelValue[0]" :tabindex="0" role="slider" aria-label="Minimum value" @mousedown="onHandleMouseDown(0, $event)" @touchstart="onHandleTouchStart(0, $event)" @keydown="onHandleKeyDown(0, $event)">
            <div class="range-slider__handle-label">
                {{ modelValue[0] }}
            </div>
        </button>
        <button class="range-slider__handle" :style="handleStyle(1)" :aria-valuemin="min" :aria-valuemax="max" :aria-valuenow="modelValue[1]" :tabindex="0" role="slider" aria-label="Maximum value" @mousedown="onHandleMouseDown(1, $event)" @touchstart="onHandleTouchStart(1, $event)" @keydown="onHandleKeyDown(1, $event)">
            <div class="range-slider__handle-label">
                {{ modelValue[1] }}
            </div>
        </button>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch, nextTick } from "vue"
    import type { PropType } from "vue"

    const props = defineProps({
        min: { type: Number, default: 0 },
        max: { type: Number, default: 100 },
        step: { type: Number, default: 1 },
        modelValue: { type: Object as PropType<[number, number]>, required: true },
        maxGap: { type: Number, default: Infinity }, // new prop
    })
    const emit = defineEmits(["update:modelValue"])

    const track = ref<HTMLElement | null>(null)
    const dragging = ref<0 | 1 | null>(null)

    const clamp = (val: number) => Math.min(props.max, Math.max(props.min, val))

    const percent = (val: number) => ((val - props.min) / (props.max - props.min)) * 100

    const rangeStyle = computed(() => {
        const left = percent(props.modelValue[0])
        const right = percent(props.modelValue[1])
        return {
            left: `${left}%`,
            width: `${right - left}%`,
        }
    })

    function handleStyle(idx: 0 | 1) {
        if (props.modelValue[idx] === 0) {
            return {
                left: `calc(${percent(props.modelValue[idx])}% + 12px)`,
            }
        }
        return {
            left: `calc(${percent(props.modelValue[idx])}% - 12px)`,
        }
    }

    function setValue(idx: 0 | 1, val: number) {
        let newVal: [number, number] = [...props.modelValue] as [number, number]
        val = Math.round(val / props.step) * props.step
        val = clamp(val)
        if (idx === 0) {
            // Prevent left handle from exceeding right handle or maxGap
            let right = props.modelValue[1]
            if (right - val > props.maxGap) {
                right = val + props.maxGap
                if (right > props.max) right = props.max
                newVal = [val, right]
            } else {
                newVal[0] = Math.min(val, props.modelValue[1])
            }
        } else {
            // Prevent right handle from exceeding left handle or maxGap
            let left = props.modelValue[0]
            if (val - left > props.maxGap) {
                left = val - props.maxGap
                if (left < props.min) left = props.min
                newVal = [left, val]
            } else {
                newVal[1] = Math.max(val, props.modelValue[0])
            }
        }
        emit("update:modelValue", newVal)
    }

    function getValueFromPosition(x: number) {
        if (!track.value) return props.min
        const rect = track.value.getBoundingClientRect()
        const percent = (x - rect.left) / rect.width
        return clamp(props.min + percent * (props.max - props.min))
    }

    function onHandleMouseDown(idx: 0 | 1, e: MouseEvent) {
        e.preventDefault()
        dragging.value = idx
        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", onMouseUp)
    }
    function onHandleTouchStart(idx: 0 | 1, e: TouchEvent) {
        dragging.value = idx
        window.addEventListener("touchmove", onTouchMove)
        window.addEventListener("touchend", onTouchEnd)
    }
    function onMouseMove(e: MouseEvent) {
        if (dragging.value !== null) {
            setValue(dragging.value, getValueFromPosition(e.clientX))
        }
    }
    function onTouchMove(e: TouchEvent) {
        if (dragging.value !== null && e.touches.length) {
            setValue(dragging.value, getValueFromPosition(e.touches[0].clientX))
        }
    }
    function onMouseUp() {
        dragging.value = null
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("mouseup", onMouseUp)
    }
    function onTouchEnd() {
        dragging.value = null
        window.removeEventListener("touchmove", onTouchMove)
        window.removeEventListener("touchend", onTouchEnd)
    }
    function onTrackMouseDown(e: MouseEvent) {
        const val = getValueFromPosition(e.clientX)
        // Move the closest handle
        const d0 = Math.abs(val - props.modelValue[0])
        const d1 = Math.abs(val - props.modelValue[1])
        setValue(d0 < d1 ? 0 : 1, val)
    }
    function onTrackTouchStart(e: TouchEvent) {
        if (!e.touches.length) return
        const val = getValueFromPosition(e.touches[0].clientX)
        const d0 = Math.abs(val - props.modelValue[0])
        const d1 = Math.abs(val - props.modelValue[1])
        setValue(d0 < d1 ? 0 : 1, val)
    }
    function onHandleKeyDown(idx: 0 | 1, e: KeyboardEvent) {
        let delta = 0
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -props.step
        if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = props.step
        if (e.key === "Home") setValue(idx, props.min)
        if (e.key === "End") setValue(idx, props.max)
        if (delta !== 0) setValue(idx, props.modelValue[idx] + delta)
    }
</script>

<style scoped>
    .range-slider {
        position: relative;
        width: 100%;
        height: 40px;
        margin: 32px 0;
        user-select: none;
    }
    .range-slider__track {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        transform: translateY(-50%);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .range-slider__range {
        position: absolute;
        top: 50%;
        height: 10px;
        background: var(--logoColor, #6366f1);
        transform: translateY(-50%);
        z-index: 1;
        box-shadow: 0 4px 16px rgba(99, 102, 241, 0.1);
    }
    .range-slider__handle {
        position: absolute;
        top: 50%;
        width: 28px;
        height: 28px;
        background: #fff;

        border-radius: 6px;
        box-shadow:
            0 4px 16px rgba(99, 102, 241, 0.1),
            0 1.5px 4px rgba(6, 182, 212, 0.08);
        transform: translate(-50%, -50%);
        cursor: pointer;
        z-index: 2;
        transition:
            box-shadow 0.2s,
            border-color 0.2s,
            background 0.2s;
        outline: none;
    }
    .range-slider__handle:hover {
        box-shadow:
            0 0 0 8px rgba(99, 102, 241, 0.1),
            0 4px 16px rgba(99, 102, 241, 0.15);
        background: #f3f4f6;
    }
    .range-slider__handle:focus {
        border-color: #06b6d4;
        box-shadow:
            0 0 0 8px rgba(6, 182, 212, 0.15),
            0 4px 16px rgba(99, 102, 241, 0.15);
    }
</style>
