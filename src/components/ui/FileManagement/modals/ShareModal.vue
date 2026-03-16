<script setup lang="ts">
    import { ref } from "vue"

    const props = defineProps<{
        file: FileItem
        isOpen: boolean
    }>()

    const emit = defineEmits<{
        (e: "close"): void
        (e: "share", emails: string[]): void
    }>()

    const email = ref("")
    const emails = ref<string[]>([])
    const shareLink = ref(`https://example.com/share/${props.file.id}`)

    const addEmail = () => {
        if (email.value && !emails.value.includes(email.value)) {
            emails.value.push(email.value)
            email.value = ""
        }
    }

    const removeEmail = (emailToRemove: string) => {
        emails.value = emails.value.filter((e) => e !== emailToRemove)
    }

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareLink.value)
        } catch (err) {
            console.error("Failed to copy link:", err)
        }
    }

    const shareWithUsers = () => {
        emit("share", emails.value)
        emit("close")
    }
</script>

<template>
    <BaseModal :title="`Share - ${file.name}`" :is-open="isOpen" @close="emit('close')">
        <div class="space-y-4">
            <div>
                <label class="text-foreground block text-sm font-medium">Share Link</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                    <input type="text" :value="shareLink" readonly class="border-border bg-card text-foreground block w-full rounded-l-md" />
                    <button type="button" @click="copyLink" class="border-border bg-card text-foreground hover:bg-secondary inline-flex items-center rounded-r-md border border-l-0 px-3 py-2 text-sm font-medium">Copy</button>
                </div>
            </div>

            <div>
                <label class="text-foreground block text-sm font-medium">Share with Users</label>
                <div class="mt-1">
                    <div class="flex space-x-2">
                        <input type="email" v-model="email" @keyup.enter="addEmail" placeholder="Enter email address" class="border-border bg-card text-foreground focus:border-primary focus:ring-primary block w-full rounded-md shadow-sm sm:text-sm" />
                        <button type="button" @click="addEmail" class="bg-primary text-foreground hover:bg-primary inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium shadow-sm">Add</button>
                    </div>

                    <div class="mt-2 space-y-2">
                        <div v-for="email in emails" :key="email" class="bg-card flex items-center justify-between rounded-md px-3 py-2">
                            <span class="text-foreground text-sm">{{ email }}</span>
                            <button @click="removeEmail(email)" class="text-muted-foreground hover:text-muted-foreground">Remove</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <button type="button" class="bg-primary text-foreground hover:bg-primary inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto" @click="shareWithUsers">Share</button>
            <button type="button" class="bg-card text-foreground ring-border hover:bg-secondary mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset sm:mt-0 sm:w-auto" @click="emit('close')">Cancel</button>
        </template>
    </BaseModal>
</template>
