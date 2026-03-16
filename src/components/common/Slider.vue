<template>
    <div class="flex h-screen items-center justify-center">
        <!-- Container with dynamic width -->
        <div class="relative" :style="{ maxWidth: trackWidth + 'px' }">
            <!-- Slider track -->
            <div class="bg-secondary relative h-2 rounded">
                <!-- Range highlight -->
                <div class="absolute z-10 h-2 rounded" :style="rangeStyle"></div>

                <!-- Lower value slider -->
                <input type="range" class="slider pointer-events-none absolute h-2 w-full appearance-none bg-transparent outline-none" :min="min" :max="max" v-model="localLowerValue" @input="updateValues" :style="{ zIndex: localLowerValue > localHigherValue ? 3 : 1 }" />

                <!-- Higher value slider -->
                <input type="range" class="slider pointer-events-none absolute h-2 w-full appearance-none bg-transparent outline-none" :min="min" :max="max" v-model="localHigherValue" @input="updateValues" :style="{ zIndex: localHigherValue > localLowerValue ? 3 : 1 }" />
            </div>

            <!-- Value labels -->
            <div class="absolute -top-6 w-full">
                <span class="text-textColor absolute" :style="lowerLabelStyle">
                    {{ localLowerValue }}
                </span>
                <span class="text-textColor absolute" :style="higherLabelStyle">
                    {{ localHigherValue }}
                </span>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            lowerValue: Number,
            higherValue: Number,
            min: Number,
            max: Number,
            difference: Number,
            trackWidth: {
                type: String,
                default: "400px",
            },
        },
        data() {
            return {
                localLowerValue: this.lowerValue,
                localHigherValue: this.higherValue,
            }
        },
        computed: {
            rangeStyle() {
                const lower = Math.min(this.localLowerValue, this.localHigherValue)
                const higher = Math.max(this.localLowerValue, this.localHigherValue)
                const left = ((lower - this.min) / (this.max - this.min)) * 100
                const right = ((higher - this.min) / (this.max - this.min)) * 100
                return {
                    left: `${left}%`,
                    right: `${100 - right}%`,
                    backgroundColor: "white",
                }
            },
            lowerLabelStyle() {
                const percentage = ((this.localLowerValue - this.min) / (this.max - this.min)) * 100
                return {
                    left: `${percentage}%`,
                    transform: `translateX(-50%) ${this.adjustEdgePosition(this.localLowerValue)}`,
                }
            },
            higherLabelStyle() {
                const percentage = ((this.localHigherValue - this.min) / (this.max - this.min)) * 100
                return {
                    left: `${percentage}%`,
                    transform: `translateX(-50%) ${this.adjustEdgePosition(this.localHigherValue)}`,
                }
            },
        },
        methods: {
            updateValues() {
                const lower = Math.min(this.localLowerValue, this.localHigherValue)
                const higher = Math.max(this.localLowerValue, this.localHigherValue)
                if (higher - lower < this.difference) {
                    if (this.localLowerValue <= lower) {
                        const newHigher = lower + this.difference
                        if (newHigher > this.max) {
                            this.localHigherValue = this.max
                            this.localLowerValue = this.max - this.difference
                            return
                        }
                        this.localHigherValue = Math.min(newHigher, this.max)
                    } else {
                        const newLower = higher - this.difference
                        if (newLower < this.min) {
                            this.localLowerValue = this.min
                            this.localHigherValue = this.min + this.difference
                            return
                        }
                        this.localLowerValue = Math.max(newLower, this.min)
                    }
                }
                this.$emit("update:lowerValue", this.localLowerValue)
                this.$emit("update:higherValue", this.localHigherValue)
            },
            adjustEdgePosition(value) {
                const trackWidthInPx = parseFloat(this.trackWidth)
                const valuePercentage = (value - this.min) / (this.max - this.min)
                const positionPx = valuePercentage * trackWidthInPx
                // Prevent labels from getting cut off at the edges
                if (positionPx < 10) {
                    return `translateX(${10 - positionPx}px)`
                } else if (trackWidthInPx - positionPx < 10) {
                    return `translateX(${-(10 - (trackWidthInPx - positionPx))}px)`
                }
                return ""
            },
        },
    }
</script>
<style scoped>
    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        background: var(--logoColor);
        cursor: pointer;
        border-radius: 50%;
        position: relative;
        z-index: 2;
    }

    /* For Firefox compatibility (optional): */
    .slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: var(--logoColor);
        cursor: pointer;
        border-radius: 50%;
        position: relative;
        z-index: 2;
    }
</style>
