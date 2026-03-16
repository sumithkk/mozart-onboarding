<template>
    <div class="file-list" @mousedown="onMouseDown">
        <!-- File items -->
        <div v-for="(file, index) in files" :key="file.id" class="file-item" :class="{ selected: isSelected(file.id) }" @click="onItemClick($event, file)" @mousedown.stop.prevent="onItemMouseDown($event, file)" ref="setFileRef" :data-id="file.id">
            {{ file.name }}
        </div>

        <!-- Clone elements for animation -->
        <div v-for="id in Object.keys(clones)" :key="id" class="file-item clone" :style="clones[id].style">
            {{ clones[id].content }}
        </div>

        <!-- Drag preview -->
        <div v-if="isDragging" class="drag-preview" :style="{ top: dragPreviewPosition.y + 'px', left: dragPreviewPosition.x + 'px' }">
            <div>{{ selectedItems.length }} items</div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, reactive, onMounted, onUnmounted } from "vue"

    interface FileItem {
        id: number
        name: string
    }

    const files = reactive<FileItem[]>([
        { id: 1, name: "File 1" },
        { id: 2, name: "File 2" },
        { id: 3, name: "File 3" },
        { id: 4, name: "File 4" },
        { id: 5, name: "File 5" },
        // Add more files if needed
    ])

    const selectedItems = ref<number[]>([])
    const isDragging = ref(false)
    const dragPreviewPosition = reactive({ x: 0, y: 0 })
    const fileElements = ref<Record<number, HTMLElement>>({})
    const isMouseDown = ref(false)
    const dragStartThreshold = 5
    let dragStartX = 0
    let dragStartY = 0

    const clones = reactive<Record<number, { content: string; style: Record<string, string> }>>({})

    const setFileRef = (el: HTMLElement | null) => {
        if (el) {
            const id = Number(el.dataset.id)
            fileElements.value[id] = el
        }
    }

    const isSelected = (id: number) => selectedItems.value.includes(id)

    const onItemClick = (event: MouseEvent, file: FileItem) => {
        event.preventDefault()

        const isCtrlPressed = event.ctrlKey || event.metaKey
        const isShiftPressed = event.shiftKey

        if (isShiftPressed && selectedItems.value.length > 0) {
            // Select range
            const lastSelectedId = selectedItems.value[selectedItems.value.length - 1]
            const startIndex = files.findIndex((f) => f.id === lastSelectedId)
            const endIndex = files.findIndex((f) => f.id === file.id)

            const minIndex = Math.min(startIndex, endIndex)
            const maxIndex = Math.max(startIndex, endIndex)

            const newSelection = files.slice(minIndex, maxIndex + 1).map((f) => f.id)
            selectedItems.value = Array.from(new Set([...selectedItems.value, ...newSelection]))
        } else if (isCtrlPressed) {
            // Toggle selection
            if (isSelected(file.id)) {
                selectedItems.value = selectedItems.value.filter((id) => id !== file.id)
            } else {
                selectedItems.value.push(file.id)
            }
        } else {
            // Single selection
            selectedItems.value = [file.id]
        }
    }

    const onItemMouseDown = (event: MouseEvent, file: FileItem) => {
        event.preventDefault()

        isMouseDown.value = true
        dragStartX = event.pageX
        dragStartY = event.pageY

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.pageX - dragStartX
            const deltaY = moveEvent.pageY - dragStartY

            if (isMouseDown.value && (Math.abs(deltaX) > dragStartThreshold || Math.abs(deltaY) > dragStartThreshold)) {
                // Start the drag
                isMouseDown.value = false
                document.removeEventListener("mousemove", onMouseMove)
                document.removeEventListener("mouseup", onMouseUp)

                startDragging(moveEvent)
            }
        }

        const onMouseUp = () => {
            isMouseDown.value = false
            document.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseup", onMouseUp)
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)
    }

    const startDragging = (event: MouseEvent) => {
        isDragging.value = true
        dragPreviewPosition.x = event.pageX
        dragPreviewPosition.y = event.pageY

        // Hide original items (optional)
        selectedItems.value.forEach((id) => {
            const el = fileElements.value[id]
            if (el) {
                el.style.visibility = "hidden"
            }
        })

        // Create clones and animate them
        selectedItems.value.forEach((id) => {
            const el = fileElements.value[id]
            if (el) {
                const rect = el.getBoundingClientRect()
                const cloneStyle: Record<string, string> = {
                    position: "absolute",
                    top: rect.top + "px",
                    left: rect.left + "px",
                    width: rect.width + "px",
                    height: rect.height + "px",
                    transition: "all 0.3s ease",
                    zIndex: "1000",
                }

                clones[id] = {
                    content: el.textContent || "",
                    style: cloneStyle,
                }

                // Force reflow
                void document.body.offsetHeight

                // Animate to cursor position
                cloneStyle.top = event.pageY - rect.height / 2 + "px"
                cloneStyle.left = event.pageX - rect.width / 2 + "px"
            }
        })

        // After animation, remove clones and show drag preview
        setTimeout(() => {
            // Remove clones
            Object.keys(clones).forEach((id) => {
                delete clones[Number(id)]
            })

            // Add mousemove and mouseup listeners for dragging
            document.addEventListener("mousemove", onDragging)
            document.addEventListener("mouseup", endDragging)
        }, 300) // Match the transition duration
    }

    const onDragging = (event: MouseEvent) => {
        dragPreviewPosition.x = event.pageX
        dragPreviewPosition.y = event.pageY
    }

    const endDragging = () => {
        isDragging.value = false

        // Reset styles
        selectedItems.value.forEach((id) => {
            const el = fileElements.value[id]
            if (el) {
                el.style.visibility = ""
            }
        })

        document.removeEventListener("mousemove", onDragging)
        document.removeEventListener("mouseup", endDragging)
    }

    const onMouseDown = (event: MouseEvent) => {
        if (event.target === event.currentTarget) {
            // Clicked on empty space, clear selection
            selectedItems.value = []
        }
    }

    onUnmounted(() => {
        document.removeEventListener("mousemove", onDragging)
        document.removeEventListener("mouseup", endDragging)
    })
</script>

<style scoped>
    .file-list {
        position: relative;
        user-select: none;
    }

    .file-item {
        position: relative;
        display: inline-block;
        margin: 8px;
        padding: 12px 24px;
        background-color: #f2f2f2;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .file-item.selected {
        background-color: #d0ebff;
    }

    .file-item.clone {
        /* Styles for clones */
        background-color: #fffecf;
        opacity: 1;
    }

    .drag-preview {
        position: absolute;
        pointer-events: none;
        background-color: #fff;
        border: 1px solid #ccc;
        padding: 16px;
        opacity: 0.9;
        transform: translate(-50%, -50%);
        z-index: 1000;
    }
</style>
