<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from "vue"
    import { PencilIcon, TrashIcon, DocumentDuplicateIcon, KeyIcon, ShareIcon, ClockIcon, CubeTransparentIcon, EyeIcon, EyeSlashIcon, UserIcon } from "@heroicons/vue/24/outline"

    const props = defineProps<{
        file: FileItem
        x: number
        y: number
    }>()

    const emit = defineEmits<{
        (e: "close"): void
        (e: "rename", file: FileItem): void
        (e: "delete", file: FileItem): void
        (e: "copy", file: FileItem): void
        (e: "permissions", file: FileItem): void
        (e: "share", file: FileItem): void
        (e: "versions", file: FileItem): void
        (e: "vectorize", file: FileItem): void
        (e: "anonimize", file: FileItem): void
        (e: "toggleHidden", file: FileItem): void
    }>()

    const menuRef = ref<HTMLDivElement | null>(null)

    onMounted(() => {
        document.addEventListener("click", handleClickOutside)

        // Ensure menu stays within viewport
        if (menuRef.value) {
            const rect = menuRef.value.getBoundingClientRect()
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight

            if (rect.right > viewportWidth) {
                menuRef.value.style.left = `${viewportWidth - rect.width - 10}px`
            }
            if (rect.bottom > viewportHeight) {
                menuRef.value.style.top = `${viewportHeight - rect.height - 10}px`
            }
        }
    })

    onUnmounted(() => {
        document.removeEventListener("click", handleClickOutside)
    })

    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
            emit("close")
        }
    }

    const menuItems = [
        { icon: PencilIcon, label: "Rename", action: "rename" },
        // { icon: DocumentDuplicateIcon, label: "Copy", action: "copy" },
        { icon: KeyIcon, label: "Permissions", action: "permissions" },
        { icon: CubeTransparentIcon, label: "Vectorize", action: "vectorize", fileOnly: true },
        { icon: UserIcon, label: "Anonimize", action: "anonimize", fileOnly: true },
        { icon: ShareIcon, label: "Share", action: "share" },
        { icon: ClockIcon, label: "Version History", action: "versions", fileOnly: true },
        {
            icon: (props: any) => (props.file.isHidden ? EyeIcon : EyeSlashIcon),
            label: (props: any) => (props.file.isHidden ? "Unhide" : "Hide"),
            action: "toggleHidden",
        },
        { icon: TrashIcon, label: "Delete", action: "delete", class: "text-destructive hover:bg-destructive/10" },
    ]
</script>

<template>
    <div
        ref="menuRef"
        class="fixed z-50 w-56 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
        :style="{
            left: `${x}px`,
            top: `${y}px`,
        }"
    >
        <div v-for="item in menuItems.filter((item) => !item.fileOnly || props.file.type === 'file')" :key="item.action" class="flex cursor-pointer items-center space-x-2 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700" :class="item.class" @click="emit(item.action as any, props.file)">
            <component :is="typeof item.icon === 'function' ? item.icon(props) : item.icon" class="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span class="text-sm text-neutral-800 dark:text-neutral-300">{{ typeof item.label === "function" ? item.label(props) : item.label }}</span>
        </div>
    </div>
</template>
