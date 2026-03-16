<template>
    <!-- Modal Overlay -->
    <div v-if="show" class="bg-background/50 fixed inset-0 z-[1010] flex items-center justify-center backdrop-blur-sm" @click="emitClose">
        <!-- Modal -->
        <div class="bg-backgroundColor text-textColor m-4 w-fit rounded-md p-5 shadow-lg" @click.stop>
            <!-- Main Content (Modal Fields) -->
            <div class="max-h-[400px] overflow-y-auto">
                <!-- Header -->
                <div class="mb-8 flex items-center justify-between">
                    <div class="text-base">
                        {{ shortName }}
                    </div>
                    <div v-if="closeOnTopRight" class="cursor-pointer text-2xl" @click="emitClose">
                        <div class="materialSymbolsOutlined">close</div>
                    </div>
                </div>

                <!-- Title & Subtitle -->
                <div class="mb-2 text-lg font-medium">Incorrect {{ fileFormatError }} Format</div>
                <div class="mb-8 text-base font-light">The uploaded {{ fileFormatError }} file is in an incorrect format. Please use the following format:</div>

                <!-- CSV Table -->
                <div v-if="fileFormatError === 'CSV'" class="max-h-[300px] overflow-y-auto">
                    <table class="mb-4 w-full border-collapse">
                        <thead>
                            <tr>
                                <th v-for="(column, index) in csvColumns" :key="index" class="border border-[#ccc] bg-[#f5f5f5] p-2.5 text-left">
                                    {{ column }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, rowIndex) in csvRows" :key="rowIndex">
                                <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="border border-[#ccc] p-2.5 text-left">
                                    {{ cell }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <!-- JSON Format -->
                <div v-else>
                    <pre>{{ correctJsonFormatString }}</pre>
                </div>
            </div>

            <!-- Footer -->
            <div class="mt-4 flex w-full items-center justify-center gap-2">
                <button class="bg-itemColor text-foreground w-1/4 cursor-pointer rounded border-0 px-4 py-2" @click="emitClose">Close</button>
                <button class="text-foreground w-1/4 cursor-pointer rounded border-0 px-4 py-2" :style="{ backgroundColor: confirmButtonColor }" @click="buttonClick('confirm')">
                    {{ confirmButtonText }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps({
        show: Boolean,
        shortName: String,
        title: String,
        subtitle: String,
        closeOnTopRight: Boolean,
        confirmButtonText: String,
        confirmButtonColor: String,
        fileFormatError: String,
        correctJsonFormatString: String,
    })

    const csvColumns = ref<string[]>([])
    const csvRows = ref<string[][]>([])

    const emit = defineEmits(["update:show", "buttonClick"])

    function emitClose() {
        emit("update:show", false)
    }

    async function buttonClick(button: string) {
        if (button === "confirm") {
            emit("buttonClick", button)
        }
    }

    // Watch for changes in the correctJsonFormatString to parse CSV if needed
    watch(
        () => props.correctJsonFormatString,
        (newVal) => {
            if (props.fileFormatError === "CSV" && typeof newVal === "string") {
                try {
                    const lines = newVal.split("\n")
                    csvColumns.value = lines[0].split(",")

                    const parseCSVLine = (line: string) => {
                        const result = []
                        let inQuotes = false
                        let value = ""

                        for (const char of line) {
                            if (char === '"') {
                                inQuotes = !inQuotes
                            } else if (char === "," && !inQuotes) {
                                result.push(value)
                                value = ""
                            } else {
                                value += char
                            }
                        }
                        result.push(value)
                        return result
                    }

                    csvRows.value = lines.slice(1).map((line) => parseCSVLine(line))
                } catch (e) {
                    console.error("Error parsing CSV format:", e)
                    csvColumns.value = []
                    csvRows.value = []
                }
            }
        },
        { immediate: true }
    )
</script>
