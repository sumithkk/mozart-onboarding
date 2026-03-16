<template>
    <!-- Trigger Button (ALWAYS VISIBLE unless fileSelection is true) -->
    <div class="p-4" :class="{ hidden: fileSelection }">
        <button v-if="showInitialButton && !fileSelection" class="rounded-lg bg-mozart-blue-500 px-6 py-2.5 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-mozart-blue-700 hover:shadow-md focus:ring-2 focus:ring-mozart-blue-700 focus:ring-offset-2 focus:outline-none dark:bg-mozart-blue-700 dark:hover:bg-mozart-blue-800 dark:focus:ring-offset-neutral-900" @click="openPicker">Select Files</button>
    </div>

    <!-- Picker Modal (only visible when showPicker is true) -->
    <Dialog :open="showPicker" @close="closePicker" class="bg-neutral/50 dark:bg-neutral/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <DialogPanel class="flex h-[85vh] sm:h-[67vh] min-h-fit w-[95vw] sm:w-[85vw] md:w-[75vw] lg:w-[67vw] max-w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-neutral-200 px-4 sm:px-8 pt-6 pb-4 dark:border-neutral-700">
                <h2 class="text-2xl font-semibold text-neutral-900 dark:text-white">Select a file</h2>
                <button @click="closePicker" class="rounded-lg p-2 text-neutral-400 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Breadcrumb Navigation -->
            <div class="border-b border-neutral-100 px-4 sm:px-8 py-4 dark:border-neutral-800">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2 text-sm">
                        <!-- Back Button -->
                        <button v-if="breadcrumbPath.length > 0" @click="goBack" class="mr-2 flex items-center rounded-lg px-3 py-1.5 text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200" title="Go back">
                            <svg class="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M19 12H5m7-7l-7 7 7 7" />
                            </svg>
                            Back
                        </button>

                        <button @click="navigateToFolder('')" class="font-medium text-mozart-blue transition-colors duration-200 hover:text-mozart-blue-800 dark:text-mozart-blue-400 dark:hover:text-mozart-blue-300" :class="{ 'text-neutral-400 dark:text-neutral-500': currentFolderId === '' }">My Drive</button>
                        <span v-for="(folder, index) in breadcrumbPath" :key="folder.id" class="flex items-center">
                            <svg class="mx-1 h-4 w-4 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M9 5l7 7-7 7" />
                            </svg>
                            <button @click="navigateToFolder(folder.id)" class="font-medium text-mozart-blue hover:text-mozart-blue-800 dark:text-mozart-blue-400 dark:hover:text-mozart-blue-300" :class="{ 'text-neutral-400 dark:text-neutral-500': currentFolderId === folder.id }">
                                {{ folder.name }}
                            </button>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Google Drive label and controls -->
            <div class="flex items-center justify-between px-2 py-2">
                <!-- Search bar -->
                <div class="flex items-center px-2 py-4">
                    <div class="flex items-center justify-center gap-2 rounded-lg border border-neutral-300 px-2 py-1 focus:ring-2 focus:ring-mozart-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:focus:ring-mozart-blue-400">
                        <span class="material-symbols-outlined text-lg">search</span>
                        <input v-model="search" type="text" placeholder="Search Drive" class="flex-1 bg-transparent focus:outline-none" />
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <!-- View toggle -->
                    <button :class="viewMode === 'grid' ? 'bg-neutral-200 dark:bg-neutral-700' : ''" class="flex items-center justify-center rounded p-2 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800" @click="viewMode = 'grid'">
                        <span class="material-symbols-outlined">view_module</span>
                    </button>
                    <button :class="viewMode === 'list' ? 'bg-neutral-200 dark:bg-neutral-700' : ''" class="flex items-center justify-center rounded p-2 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800" @click="viewMode = 'list'">
                        <span class="material-symbols-outlined">view_list</span>
                    </button>
                    <div class="relative">
                        <Menu as="div" class="relative">
                            <MenuButton v-slot="{ open }" class="flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700">
                                <span class="ml-1">{{ sortOptions.find((opt) => opt.value === sortOrder)?.label }}</span>
                                <ChevronUpIcon v-if="open" class="h-4 w-4" />
                                <ChevronDownIcon v-else class="h-4 w-4" />
                            </MenuButton>
                            <MenuItems class="ring-opacity-5 absolute -left-14 z-10 mt-1 w-44 rounded-md bg-white p-2 shadow-lg ring-1 ring-neutral-200 focus:outline-none dark:bg-neutral-800 dark:ring-neutral-700" v-slot="{ open }">
                                <MenuItem v-for="opt in sortOptions" :key="opt.value" @click="setSortOrder(opt.value)" class="m-0 rounded-md" v-slot="{ active }">
                                    <button @click="setSortOrder(opt.value)" class="text-textColor w-full px-4 py-2 text-left text-sm" :class="active ? 'bg-neutral-100 dark:bg-neutral-700' : ''">
                                        {{ opt.label }}
                                    </button>
                                </MenuItem>
                            </MenuItems>
                        </Menu>

                        <!--                       
                        <button @click="showSortMenu = !showSortMenu" class="p-2 rounded flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-neutral-300">
                            <span class="ml-1">{{ sortOptions.find((opt) => opt.value === sortOrder)?.label }}</span>
                            <span class="material-symbols-outlined">expand_more</span>
                        </button>
                        <div v-if="showSortMenu" class="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded shadow z-10">
                            <div v-for="opt in sortOptions" :key="opt.value" @click="setSortOrder(opt.value)" class="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:text-neutral-300 cursor-pointer flex items-center">
                                <span v-if="sortOrder === opt.value" class="mr-2 text-mozart-blue-500">✓</span>
                                <span v-else class="mr-6"></span>
                                {{ opt.label }}
                            </div>
                        </div> -->
                    </div>
                </div>
                <!-- Sorting dropdown -->
            </div>

            <!-- Connection/Auth banners -->
            <div v-if="notConnected" class="mx-4 sm:mx-8 mb-2 rounded-md border border-mozart-blue-300 bg-mozart-blue-50 p-3 text-mozart-blue-800 dark:border-mozart-blue dark:bg-mozart-blue-900/20 dark:text-mozart-blue-200">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined">info</span>
                        <span>You are not connected to Google Drive yet. Connect to browse your files.</span>
                    </div>
                    <button class="rounded bg-mozart-blue-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-mozart-blue-600 disabled:opacity-50" @click="startOnboarding" :disabled="isUpdating">Connect Google Drive</button>
                </div>
            </div>
            <div v-else-if="authExpired" class="mx-4 sm:mx-8 mb-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-800 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-200">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined">warning</span>
                        <span>Authentication is expired. Please reauthenticate.</span>
                    </div>
                    <button class="rounded bg-mozart-blue-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-mozart-blue-600 disabled:opacity-50" @click="handleReauth" :disabled="isUpdating">Continue</button>
                </div>
            </div>
            <div v-else-if="errorMessage" class="mx-4 sm:mx-8 mb-2 rounded-md border border-red-300 bg-red-50 p-3 text-red-800 dark:border-red-600 dark:bg-red-900/20 dark:text-red-200">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined">error</span>
                    <span>{{ errorMessage }}</span>
                </div>
            </div>

            <!-- Files grid/list -->
            <div class="flex-1 overflow-y-auto px-4 sm:px-8 py-4">
                <div v-if="!authExpired && !errorMessage && !notConnected" class="mb-2 text-neutral-500 dark:text-neutral-400">Files</div>
                <!-- Skeleton Loading -->
                <div v-if="isLoading && files.length === 0 && !notConnected">
                    <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 pr-2">
                        <div v-for="i in 8" :key="i" class="relative rounded-lg border border-neutral-200 bg-white shadow dark:border-neutral-700 dark:bg-neutral-800">
                            <div class="h-28 w-full animate-pulse rounded-t-lg bg-neutral-200 dark:bg-neutral-700"></div>
                            <div class="p-3">
                                <div class="mb-2 h-4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                <div class="h-3 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="divide-y divide-neutral-200 dark:divide-neutral-700">
                        <div v-for="i in 8" :key="i" class="flex items-center px-2 py-2">
                            <div class="mr-4 h-12 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            <div class="flex-1">
                                <div class="mb-2 h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                <div class="h-3 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Actual Content -->
                <div v-else-if="!notConnected">
                    <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 pr-2">
                        <div
                            v-for="file in filteredFiles"
                            :key="file.id"
                            class="group relative cursor-pointer rounded-lg border border-neutral-200 bg-white shadow transition hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                            :class="{
                                'ring-2 ring-mozart-blue-500': isSelected(file),
                                'opacity-50': !isAllowedFile(file) && !isFolder(file),
                                'opacity-75': isUpdating,
                            }"
                            @click="handleFileClick(file)"
                        >
                            <VTooltip v-if="!isAllowedFile(file) && !isFolder(file)">
                                <template #default>
                                    <div class="absolute top-2 left-2 z-10">
                                        <svg class="h-4 w-4 text-neutral-400 dark:text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9h2v5H9V9zm0-4h2v2H9V5z" />
                                        </svg>
                                    </div>
                                </template>
                                <template #popper> This file type is not supported </template>
                            </VTooltip>
                            <!-- Checkbox in top-right (only for files, not folders) -->
                            <div class="inline-flex w-full items-center justify-end rounded-t-lg bg-neutral-100 p-2 dark:bg-neutral-700">
                                <label class="relative flex cursor-pointer items-center">
                                    <input type="checkbox" class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-neutral-300 shadow transition-all checked:border-neutral-800 checked:bg-neutral-800 hover:shadow-md" :checked="isSelected(file)" @click.stop="toggleSelect(file)" :disabled="!isAllowedFile(file) || isUpdating" />
                                    <span class="fill-primaryColor stroke-primaryColor pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-white opacity-0 peer-checked:opacity-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" stroke-width="1">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                        </svg>
                                    </span>
                                </label>
                            </div>
                            <!-- File/Folder preview -->
                            <div v-if="file.showImage && file.thumbnailUrl && !isFolder(file)">
                                <img :src="file.thumbnailUrl" class="h-28 w-full rounded-t-lg object-cover" @error="file.showImage = false" />
                            </div>
                            <div v-else class="flex h-28 w-full items-center justify-center bg-neutral-100 dark:bg-neutral-700">
                                <FileIcons :fileType="file.mimeType || ''" class="size-12" />
                            </div>
                            <div class="p-2 sm:p-3">
                                <div class="line-clamp-2 text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 break-words">{{ file.fileName }}</div>
                                <VTooltip>
                                    <div class="flex items-center gap-x-2">
                                        <FileBadge :role="getUserPermission(file)" />
                                        <FileBadge v-if="fileSystem.getFileStatusById(file.id)" :role="fileSystem.getFileStatusById(file.id) as string" />
                                    </div>
                                    <template #popper>
                                        <span v-if="getUserPermission(file) === 'owner'">You have owner permission for this file</span>
                                        <span v-else-if="getUserPermission(file) === 'writer'">You have editor permission for this file</span>
                                        <span v-else-if="getUserPermission(file) === 'commenter'">You have commenter permission for this file</span>
                                        <span v-else-if="getUserPermission(file) === 'reader'">You have viewer permission for this file</span>
                                        <span v-else>This file has {{ getUserPermission(file) }} access</span>
                                    </template>
                                </VTooltip>
                            </div>
                        </div>
                    </div>
                    <div v-else class="divide-y divide-neutral-200 dark:divide-neutral-700">
                        <div
                            v-for="file in filteredFiles"
                            :key="file.id"
                            class="group relative flex cursor-pointer items-center px-2 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                            :class="{
                                'bg-mozart-blue-50 dark:bg-mozart-blue-900/20': isSelected(file),
                                'opacity-50': !isAllowedFile(file) && !isFolder(file),
                                'opacity-75': isUpdating,
                            }"
                            @click="handleFileClick(file)"
                        >
                            <div class="inline-flex items-center justify-end p-2">
                                <label class="relative flex cursor-pointer items-center">
                                    <input type="checkbox" class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-neutral-300 shadow transition-all checked:border-neutral-800 checked:bg-neutral-800 hover:shadow-md" :checked="isSelected(file)" @click.stop="toggleSelect(file)" :disabled="!isAllowedFile(file) || isUpdating" />
                                    <span class="fill-primaryColor stroke-primaryColor pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-white opacity-0 peer-checked:opacity-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" stroke-width="1">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                        </svg>
                                    </span>
                                </label>
                            </div>
                            <div class="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-700">
                                <FileIcons :fileType="file.mimeType || ''" class="size-6" />
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-1">
                                    <div class="truncate font-medium text-neutral-900 dark:text-neutral-100">{{ file.fileName }}</div>
                                    <VTooltip v-if="!isAllowedFile(file) && !isFolder(file)">
                                        <template #default>
                                            <svg class="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9h2v5H9V9zm0-4h2v2H9V5z" />
                                            </svg>
                                        </template>
                                        <template #popper> This file type is not supported </template>
                                    </VTooltip>
                                </div>
                                <div class="truncate text-xs text-neutral-500 dark:text-neutral-400">{{ convertMimeTypeToType(file.mimeType || "") }}</div>
                                <div class="mt-1 flex space-x-1">
                                    <VTooltip>
                                        <FileBadge :role="getUserPermission(file)" />
                                        <template #popper>
                                            <span v-if="getUserPermission(file) === 'owner'">You have owner permission for this file</span>
                                            <span v-else-if="getUserPermission(file) === 'writer'">You have editor permission for this file</span>
                                            <span v-else-if="getUserPermission(file) === 'commenter'">You have commenter permission for this file</span>
                                            <span v-else-if="getUserPermission(file) === 'reader'">You have viewer permission for this file</span>
                                            <span v-else>This file has {{ getUserPermission(file) }} access</span>
                                        </template>
                                    </VTooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="nextPageToken" class="mt-4 flex justify-center">
                        <button class="rounded bg-neutral-100 px-4 py-2 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600" @click="loadMoreFiles">Load more</button>
                    </div>
                </div>
            </div>
            <!-- Action buttons -->
            <div class="flex items-center justify-end space-x-4 px-4 sm:px-8 pt-2 pb-6">
                <VTooltip>
                    <button class="h-10 min-w-[88px] rounded bg-mozart-blue px-6 text-base font-semibold text-white transition hover:bg-mozart-blue-600 disabled:opacity-50" @click="selectFiles" :disabled="selectedFiles.length === 0 || isUpdating">
                        <span v-if="isUpdating" class="flex items-center gap-2">
                            <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                        </span>
                        <span v-else>Select</span>
                    </button>
                    <template #popper>
                        <span v-if="selectedFiles.some(isBlockedFile) && !isUpdating"> Some files are view-only and cannot be imported </span>
                        <span v-else-if="isUpdating"> Updating... </span>
                        <span v-else> Select </span>
                    </template>
                </VTooltip>

                <button class="h-10 min-w-[88px] rounded bg-neutral-500 px-6 text-base font-semibold text-white transition hover:bg-neutral-600" @click="closePicker" type="button" :disabled="isUpdating">Cancel</button>
            </div>
        </DialogPanel>
    </Dialog>
    <!-- Onboarding checklist (teleport above overlay) -->
    <Teleport to="body">
        <GoogleDriveOnboarding v-if="showOnboarding" @close="handleOnboardingClose" />
    </Teleport>
</template>

<script setup lang="ts">
    import { Dialog, DialogPanel, DialogTitle, DialogDescription } from "@headlessui/vue"
    import { ref, computed, onMounted, watch } from "vue"
    import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue"
    import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/vue/24/outline"
    import { convertMimeTypeToType } from "~/util"
    interface GoogleDriveFile {
        id: string
        fileName: string
        mimeType?: string
        thumbnailLink?: string
        thumbnailUrl?: string
        showImage?: boolean
        permissions?: { emailAddress: string | null; role: string }[]
        status?: string
    }

    interface BreadcrumbItem {
        id: string
        name: string
    }

    const props = defineProps({
        fileSelection: Boolean,
        showInitialButton: { type: Boolean, default: true },
        skipUpload: { type: Boolean, default: false },
        start: { type: Boolean, default: false },
    })
    const emits = defineEmits(["handleUploadFromGoogleDrive", "close"])
    const fileSystem = useFileSystemStore()
    const userStore = useUserStore()

    const showPicker = ref(false)
    const search = ref("")
    const files = ref<GoogleDriveFile[]>([])
    const selectedFiles = ref<GoogleDriveFile[]>([])
    const viewMode = ref<"grid" | "list">("grid")
    const showSortMenu = ref(false)
    const sortOrder = ref("modifiedTime desc")
    const nextPageToken = ref<string | null>(null)
    const isLoading = ref(false)
    const currentFolderId = ref("")
    const breadcrumbPath = ref<BreadcrumbItem[]>([])
    const isUpdating = ref(false)
    const authExpired = ref(false)
    const errorMessage = ref<string | null>(null)
    const notConnected = ref(false)
    const showOnboarding = ref(false)
    let searchDebounceHandle: ReturnType<typeof setTimeout> | null = null

    const isGoogleConnected = computed(() => {
        try {
            const integration = userStore.integrations && (userStore as any).integrations["google"]
            if (!integration) return false
            return integration.createdAt + 30 * 24 * 60 * 60 * 1000 >= Date.now()
        } catch (e) {
            return false
        }
    })

    // Get current user's permission for a file
    const getUserPermission = (file: GoogleDriveFile): string => {
        if (!file.permissions || !userStore.email) return "reader"

        const userPermission = file.permissions.find((perm) => perm.emailAddress === userStore.email)
        return userPermission?.role || "reader"
    }

    const isBlockedFile = (file: GoogleDriveFile) => {
        const userRole = getUserPermission(file)
        return userRole === "reader"
    }

    const sortOptions = [
        { value: "modifiedTime desc", label: "Last modified" },
        { value: "modifiedByMeTime desc", label: "Last modified by me" },
        { value: "viewedByMeTime desc", label: "Last opened by me" },
        { value: "name", label: "Name" },
        { value: "vectorized", label: "Vectorized" },
        { value: "uploaded", label: "Connected" },
    ]

    const filteredFiles = computed(() => files.value.filter((f: GoogleDriveFile) => getUserPermission(f) !== "reader").filter((f: GoogleDriveFile) => f.fileName.toLowerCase().includes(search.value.toLowerCase())))

    const allowedMimeTypes = new Set([
        "text/plain",
        "text/html",
        "application/json",
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
        "image/heic",
        "image/heif",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/x-python-script",
        "application/x-python-code",
        "application/msword",
        "application/sql",
        "application/x-sql",
        "text/x-sql",
        "application/octet-stream",
        "text/csv",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/javascript",
        "application/vnd.google-apps.spreadsheet",
        "video/quicktime",
        "application/vnd.google-apps.document",
    ])

    const isAllowedFile = (file: GoogleDriveFile) => {
        return allowedMimeTypes.has(file.mimeType || "")
    }

    const isFolder = (file: GoogleDriveFile) => {
        return file.mimeType === "application/vnd.google-apps.folder"
    }

    const handleFileClick = (file: GoogleDriveFile) => {
        if (isUpdating.value) return // Prevent interaction during update

        if (isFolder(file)) {
            navigateToFolder(file.id, file.fileName)
        } else {
            toggleSelect(file)
        }
    }

    const navigateToFolder = async (folderId: string, folderName?: string) => {
        currentFolderId.value = folderId

        // Update breadcrumb path
        if (folderId === "") {
            breadcrumbPath.value = []
        } else if (folderName) {
            // Add to breadcrumb when navigating into a folder
            breadcrumbPath.value.push({ id: folderId, name: folderName })
        } else {
            // Navigate to specific breadcrumb item
            const index = breadcrumbPath.value.findIndex((item) => item.id === folderId)
            if (index !== -1) {
                breadcrumbPath.value = breadcrumbPath.value.slice(0, index + 1)
            }
        }

        // Reset and fetch files for the new folder
        files.value = []
        nextPageToken.value = null
        authExpired.value = false
        notConnected.value = false
        errorMessage.value = null
        await fetchDriveFiles()
    }

    const goBack = async () => {
        if (breadcrumbPath.value.length === 0) return

        if (breadcrumbPath.value.length === 1) {
            // Go back to root
            await navigateToFolder("")
        } else {
            // Go back to the previous folder
            const previousFolder = breadcrumbPath.value[breadcrumbPath.value.length - 2]
            breadcrumbPath.value.pop() // Remove current folder from breadcrumb
            currentFolderId.value = previousFolder.id

            // Reset and fetch files for the previous folder
            files.value = []
            nextPageToken.value = null
            authExpired.value = false
            notConnected.value = false
            errorMessage.value = null
            await fetchDriveFiles()
        }
    }

    const openPicker = async () => {
        showPicker.value = true
        selectedFiles.value = []
        files.value = []
        nextPageToken.value = null
        currentFolderId.value = ""
        breadcrumbPath.value = []
        authExpired.value = false
        notConnected.value = false
        errorMessage.value = null
        await fetchDriveFiles()
    }

    const fetchDriveFiles = async (append = false, order = "", shared = true) => {
        isLoading.value = true
        try {
            const safeSearch = (search.value || "").replace(/'/g, "\\'")
            const params: any = {
                folderId: currentFolderId.value,
                search: safeSearch,
                sortOrder: sortOrder.value,
                pageSize: 40,
            }
            if (nextPageToken.value) {
                params.pageToken = nextPageToken.value
            }

            const response = await useUser().getGoogleDriveFiles(params)
            if (!response || response.status === "error") {
                const code = (response && (response.error?.code || response.code || response.statusCode || response.status)) || null
                if (code === 401 || code === "401") {
                    if (!isGoogleConnected.value) {
                        notConnected.value = true
                        authExpired.value = false
                    } else {
                        authExpired.value = true
                        notConnected.value = false
                    }
                } else {
                    errorMessage.value = "System failed to list files. Please try again later"
                }
                return
            }

            const data = response
            const enriched = (data.files || []).map((file: any) => {
                // File already includes permissions and details from backend
                file.status = fileSystem.getFileStatusById(file.id)
                return file
            })

            // Filter the enriched files based on order
            const filteredEnriched = enriched.filter((file: any) => {
                if (order === "") return true
                if (order === "vectorized") {
                    return file.status === "vectorized"
                } else if (order === "uploaded") {
                    return file.status === "uploaded"
                }
                return false
            })
            if (append) {
                files.value = files.value.concat(filteredEnriched)
            } else {
                files.value = filteredEnriched
            }
            nextPageToken.value = data.nextPageToken || null
        } catch (err: any) {
            const code = err?.response?.status || err?.code || err?.status
            if (code === 401 || code === "401") {
                if (!isGoogleConnected.value) {
                    notConnected.value = true
                    authExpired.value = false
                } else {
                    authExpired.value = true
                    notConnected.value = false
                }
            } else {
                errorMessage.value = "System failed to list files. Please try again later"
            }
        } finally {
            isLoading.value = false
        }
    }

    const loadMoreFiles = async () => {
        await fetchDriveFiles(true)
    }

    const setSortOrder = async (order: string) => {
        if (order !== "vectorized" && order !== "uploaded") {
            sortOrder.value = order
            order = ""
        }
        showSortMenu.value = false
        files.value = []
        nextPageToken.value = null
        authExpired.value = false
        errorMessage.value = null
        await fetchDriveFiles(false, order)
    }

    const isSelected = (file: GoogleDriveFile) => selectedFiles.value.some((f) => f.id === file.id)
    const toggleSelect = (file: GoogleDriveFile) => {
        if (!isAllowedFile(file) || isUpdating.value) return

        if (isSelected(file)) {
            selectedFiles.value = selectedFiles.value.filter((f) => f.id !== file.id)
        } else {
            selectedFiles.value.push(file)
        }
    }
    const selectFiles = async () => {
        isUpdating.value = true
        try {
            // Files already have all the details from the backend
            const enrichedFiles = selectedFiles.value.map((file) => ({
                ...file,
                path: fileSystem.currentPath,
                parentFolderId: fileSystem.currentFolderId || "",
            }))
            emits("handleUploadFromGoogleDrive", enrichedFiles)
            if (!props.skipUpload) {
                await useUser().addIntegrationFiles("google-drive", enrichedFiles)
            }

            showPicker.value = false
        } catch (error) {
            console.error("Error selecting files:", error)
        } finally {
            isUpdating.value = false
        }
    }
    const closePicker = () => {
        showPicker.value = false
        emits("close")
    }

    const handleReauth = async () => {
        isUpdating.value = true
        try {
            await useUser().deleteUserIntegration("google")
            if ((userStore as any).integrations) {
                delete (userStore as any).integrations["google"]
            }
            showPicker.value = false
            showOnboarding.value = true
        } catch (e) {
            // no-op, keep banner if disconnect fails
        } finally {
            isUpdating.value = false
        }
    }
    const startOnboarding = () => {
        // Close only the picker so the component stays mounted
        // This avoids the dialog overlay/focus trap while keeping onboarding visible
        showPicker.value = false
        showOnboarding.value = true
    }
    const handleOnboardingClose = async () => {
        showOnboarding.value = false
        // If user completed connection, refresh files
        if (isGoogleConnected.value) {
            notConnected.value = false
            files.value = []
            nextPageToken.value = null
            // Re-open picker for a smooth flow
            showPicker.value = true
            await fetchDriveFiles()
        }
    }
    watch(
        () => props.start,
        (val) => {
            if (val && !props.showInitialButton) {
                openPicker()
            }
        }
    )
    onMounted(async () => {
        if (props.start && !props.showInitialButton) {
            openPicker()
        }
    })

    // Reset pagination and refetch when search term changes (debounced)
    watch(
        () => search.value,
        () => {
            if (searchDebounceHandle) {
                clearTimeout(searchDebounceHandle as any)
            }
            searchDebounceHandle = setTimeout(async () => {
                files.value = []
                nextPageToken.value = null
                authExpired.value = false
                errorMessage.value = null
                await fetchDriveFiles()
            }, 300)
        }
    )
</script>
