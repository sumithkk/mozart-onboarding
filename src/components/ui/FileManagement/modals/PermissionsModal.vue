<script setup lang="ts">
    const props = defineProps<{
        file: FileItem
        isOpen: boolean
    }>()

    const emit = defineEmits<{
        (e: "close"): void
        (e: "update", permissions: FilePermission[]): void
    }>()

    const permissions = ref<FilePermission[]>(props.file.permissions || [])

    const updatePermission = (permission: FilePermission, type: "read" | "write" | "share") => {
        const index = permissions.value.findIndex((p) => p.userId === permission.userId)
        if (index !== -1) {
            const updated = { ...permission }
            if (type === "read") updated.canRead = !updated.canRead
            if (type === "write") updated.canWrite = !updated.canWrite
            if (type === "share") updated.canShare = !updated.canShare
            permissions.value[index] = updated
        }
    }

    const savePermissions = () => {
        emit("update", permissions.value)
        emit("close")
    }
</script>

<template>
    <BaseModal :title="`Permissions - ${file.name}`" :is-open="isOpen" @close="emit('close')">
        <div class="space-y-4">
            <div v-if="permissions.length === 0" class="text-muted-foreground py-4 text-center">No permissions set</div>
            <div v-else class="space-y-2">
                <div v-for="permission in permissions" :key="permission.userId" class="hover:bg-secondary flex items-center justify-between rounded p-2">
                    <span class="text-foreground text-sm font-medium">{{ permission.userId }}</span>
                    <div class="flex items-center space-x-2">
                        <label class="flex items-center space-x-1">
                            <input type="checkbox" :checked="permission.canRead" @change="updatePermission(permission, 'read')" class="border-border text-primary focus:ring-primary border-border rounded" />
                            <span class="text-muted-foreground text-sm">Read</span>
                        </label>
                        <label class="flex items-center space-x-1">
                            <input type="checkbox" :checked="permission.canWrite" @change="updatePermission(permission, 'write')" class="border-border text-primary focus:ring-primary border-border rounded" />
                            <span class="text-muted-foreground text-sm">Write</span>
                        </label>
                        <label class="flex items-center space-x-1">
                            <input type="checkbox" :checked="permission.canShare" @change="updatePermission(permission, 'share')" class="border-border text-primary focus:ring-primary border-border rounded" />
                            <span class="text-muted-foreground text-sm">Share</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <button type="button" class="bg-primary text-secondary hover:bg-primary inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto" @click="savePermissions">Save Changes</button>
            <button type="button" class="bg-background text-foreground ring-border hover:bg-secondary mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset sm:mt-0 sm:w-auto" @click="emit('close')">Cancel</button>
        </template>
    </BaseModal>
</template>
