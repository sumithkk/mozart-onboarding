<template>
    <div class="mx-auto flex w-full flex-col space-y-2 bg-transparent">
        <!-- Scroll to Bottom Button - Positioned above input -->
        <div v-if="showScrollButton" class="mb-2 flex justify-center">
            <Tooltip text="Scroll to bottom">
                <div class="flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:scale-110 sm:size-10 dark:bg-neutral-700" @click="handleScrollToBottom" @touchstart="handleScrollToBottom">
                    <div class="materialSymbolsOutlined text-textColor transform cursor-pointer text-lg transition-transform duration-300 select-none hover:text-blue-500 sm:text-xl">arrow_downward</div>
                </div>
            </Tooltip>
        </div>

        <!-- TEXT INPUT + MODEL/FILE SELECTORS -->
        <div class="tool-input-container border-strokeColor bg-backgroundColor text-unselectedColor flex flex-col justify-between rounded-md border px-2 py-2 select-none sm:rounded-lg sm:px-3" @dragover.prevent @drop.prevent="handleFileDrop" @paste="handleFilePaste">
            <div class="attachments-container" :class="{ 'attachments-container--visible': selectedFiles.length > 0 }">
                <!-- ATTACHED FILES -->
                <transition-group
                    appear
                    name="list"
                    tag="div"
                    class="hide-scrollbar text-textColor flex w-full items-center gap-2 overflow-x-auto whitespace-nowrap sm:gap-[10px]"
                    :class="{ 'mb-[10px] pb-[5px]': selectedFiles.length > 0 }"
                >
                    <div
                        v-for="file in selectedFiles"
                        :key="fileKey(file)"
                        class="attachmentWrapper group border-borderColor bg-backgroundColor inline-flex flex-shrink-0 items-center gap-2 rounded-md border p-1 sm:gap-[10px] sm:p-2"
                    >
                        <div class="bg-linkColor flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md sm:h-10 sm:w-10">
                        <div class="materialSymbolsFilled text-backgroundColor text-[16px] sm:text-[20px]">description</div>
                        </div>
                        <div class="flex min-w-0 flex-1 flex-col gap-[3px] sm:gap-[5px]">
                        <a class="truncate text-xs whitespace-nowrap sm:text-sm">{{ trimTitle(file.name) }}</a>
                        <a class="text-xs sm:text-sm">{{ convertMimeTypeToType(file.type) }}</a>
                        </div>
                        <div class="materialSymbolsOutlined ml-1 flex-shrink-0 cursor-pointer text-[12px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:text-[14px]" @click="removeDocument(file)">close</div>
                    </div>
                </transition-group>
            </div>


            <!-- TEXTAREA -->
            <textarea
                ref="textAreaRef"
                :placeholder="placeholderValue"
                v-model="inputData"
                @keydown="handleKeyDown"
                @input="adjustTextAreaHeight"
                @focus="handleFocus"
                @blur="handleBlur"
                rows="1"
                class="text-textColor box-border max-h-[200px] w-full resize-none border-none bg-transparent p-1 text-sm placeholder-gray-400 transition-all duration-200 outline-none sm:p-2 sm:text-base"
                style="max-height: 40vh"
            />

            <div class="flex w-full flex-row items-center justify-between gap-2">
                <!-- LEFT SIDE (attachments, model, etc.) -->
                <div class="flex items-center gap-1 sm:gap-2">
                    <!-- Expand/Collapse Toggle Button -->
                    <div @click="showComposeTools = !showComposeTools" class="border-unselectedColor stroke-textColor flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border bg-transparent select-none sm:h-8 sm:w-8">
                        <div class="materialSymbolsOutlined text-sm transition-transform duration-200 select-none sm:text-base" :class="showComposeTools ? 'rotate-180' : ''">
                            {{ showComposeTools ? "arrow_forward_ios" : "tune" }}
                        </div>
                    </div>

                    <!-- Attach File icon -->
                    <Menu class="relative" as="div">
                        <MenuButton class="border-unselectedColor bg-backgroundColor flex size-6 items-center justify-center gap-1 rounded-md border px-1 py-1 text-sm text-gray-600 sm:size-8 dark:text-neutral-300">
                            <span class="materialSymbolsOutlined text-sm sm:text-base">add</span>
                        </MenuButton>
                        <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                            <MenuItems class="ai-dropdown ring-border ring-opacity-5 scrollbar-thin scrollbar-track-neutral-100 scrollbar-thumb-neutral-300 absolute bottom-full left-0 z-10 mb-2 w-fit min-w-max overflow-hidden overflow-y-auto rounded-md bg-white p-2 shadow-lg shadow-none ring-1 ring-black focus:outline-none dark:bg-neutral-800">
                                <MenuItem @click="handleUploadFromComputer" v-slot="{ active }" class="m-0 rounded-md">
                                    <div class="flex w-full cursor-pointer items-center justify-start gap-2 px-2 py-1 text-left text-sm" :class="active ? 'bg-gray-100 dark:bg-neutral-700' : ''">
                                        <div class="materialSymbolsOutlined text-lg sm:text-xl">upload</div>
                                        <span class="text-xs sm:text-sm text-textColor">Upload from computer</span>
                                    </div>
                                </MenuItem>
                                <MenuItem @click="openGoogleFilePicker" v-slot="{ active }" class="m-0 rounded-md">
                                    <div class="flex w-full cursor-pointer items-center justify-start gap-2 px-2 py-2 text-left text-sm" :class="active ? 'bg-gray-100 dark:bg-neutral-700' : ''">
                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" class="sm:h-5 sm:w-5" viewBox="0 0 48 48">
                                            <path fill="#1e88e5" d="M38.59,39c-0.535,0.93-0.298,1.68-1.195,2.197C36.498,41.715,35.465,42,34.39,42H13.61 c-1.074,0-2.106-0.285-3.004-0.802C9.708,40.681,9.945,39.93,9.41,39l7.67-9h13.84L38.59,39z"></path>
                                            <path fill="#fbc02d" d="M27.463,6.999c1.073-0.002,2.104-0.716,3.001-0.198c0.897,0.519,1.66,1.27,2.197,2.201l10.39,17.996 c0.537,0.93,0.807,1.967,0.808,3.002c0.001,1.037-1.267,2.073-1.806,3.001l-11.127-3.005l-6.924-11.993L27.463,6.999z"></path>
                                            <path fill="#e53935" d="M43.86,30c0,1.04-0.27,2.07-0.81,3l-3.67,6.35c-0.53,0.78-1.21,1.4-1.99,1.85L30.92,30H43.86z"></path>
                                            <path fill="#4caf50" d="M5.947,33.001c-0.538-0.928-1.806-1.964-1.806-3c0.001-1.036,0.27-2.073,0.808-3.004l10.39-17.996 c0.537-0.93,1.3-1.682,2.196-2.2c0.897-0.519,1.929,0.195,3.002,0.197l3.459,11.009l-6.922,11.989L5.947,33.001z"></path>
                                            <path fill="#1565c0" d="M17.08,30l-6.47,11.2c-0.78-0.45-1.46-1.07-1.99-1.85L4.95,33c-0.54-0.93-0.81-1.96-0.81-3H17.08z"></path>
                                            <path fill="#2e7d32" d="M30.46,6.8L24,18L17.53,6.8c0.78-0.45,1.66-0.73,2.6-0.79L27.46,6C28.54,6,29.57,6.28,30.46,6.8z"></path>
                                        </svg>
                                        <span class="text-xs sm:text-sm text-textColor">Add from Google Drive</span>
                                    </div>
                                </MenuItem>
                                <MenuItem @click="triggerDeviceCamera" v-slot="{ active }" class="m-0 block rounded-md md:hidden">
                                    <div class="flex w-full cursor-pointer items-center justify-start gap-2 px-2 py-1 text-left text-sm" :class="active ? 'bg-gray-100 dark:bg-neutral-700' : ''">
                                        <div class="materialSymbolsOutlined text-lg sm:text-xl">photo_camera</div>
                                        <span class="text-xs sm:text-sm text-textColor">Take photo</span>
                                    </div>
                                </MenuItem>
                            </MenuItems>
                        </transition>
                    </Menu>

                    <!-- Compose Tools - Show when expanded -->
                    <template v-if="showComposeTools">
                        <!-- Data Mode Toggle -->
                        <Switch v-if="showDataMode" v-model="ragStore.isDataMode" :tooltip="'Talk with your data'" :size="'sm'" />

                        <!-- Collection Selector (admin only) -->
                        <Menu v-if="userStore.isAdmin" as="div" class="relative">
                            <MenuButton class="border-unselectedColor text-sideBarTextColor flex cursor-pointer items-center justify-center rounded-md border bg-transparent" :class="isMobile ? 'h-8 w-8 p-0' : 'px-2 py-1'">
                                <div class="materialSymbolsOutlined" :class="isMobile ? 'text-lg' : ''">stacks</div>
                            </MenuButton>
                            <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                                <MenuItems class="ai-dropdown ring-border ring-opacity-5 scrollbar-thin scrollbar-track-neutral-100 scrollbar-thumb-neutral-300 absolute right-0 bottom-12 z-10 mt-1 h-60 w-fit min-w-64 overflow-hidden overflow-y-auto rounded-md bg-white p-2 shadow-lg ring-1 ring-black focus:outline-none dark:bg-neutral-800">
                                    <div class="border-borderColor sticky -top-2 mb-2 flex items-center gap-1 border-b bg-white px-2 dark:bg-neutral-800">
                                        <SearchIcon class="text-textColor size-4" />
                                        <input type="text" placeholder="Search collections" class="text-textColor box-border max-h-[200px] w-full resize-none border-none bg-transparent p-2 text-xs transition-all duration-200 outline-none" v-model="searchCollection" />
                                    </div>
                                    <MenuItem v-for="collection in filteredCollections" :key="collection.id" v-slot="{ active }" class="m-0 rounded-md">
                                        <div @click="selectCollection(collection)" class="flex w-full cursor-pointer items-center justify-between gap-6 px-2 py-2 text-left text-sm" :class="active ? 'bg-gray-100 dark:bg-neutral-700' : ''">
                                            <div class="flex items-center gap-2">
                                                <div class="materialSymbolsOutlined text-sm">stacks</div>
                                                <div class="text-left">
                                                    <p class="text-textColor text-sm font-bold">{{ collection.alias || collection.name }}</p>
                                                    <p class="text-textColor truncate text-xs">{{ collection.service }}</p>
                                                </div>
                                            </div>
                                            <CheckCheckIcon v-if="collection.name === ragStore.currentCollection" class="text-logoColor size-6" />
                                        </div>
                                    </MenuItem>
                                </MenuItems>
                            </transition>
                        </Menu>

                        <!-- Writing Style Selector -->
                        <Menu as="div" class="relative">
                            <MenuButton class="border-unselectedColor text-sideBarTextColor flex cursor-pointer items-center justify-center rounded-md border bg-transparent" :class="isMobile ? 'h-8 w-8 p-0' : 'px-2 py-1'">
                                <div class="materialSymbolsOutlined" :class="isMobile ? 'text-lg' : ''">draw</div>
                            </MenuButton>
                            <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                                <MenuItems class="ai-dropdown ring-border ring-opacity-5 scrollbar-thin scrollbar-track-neutral-100 scrollbar-thumb-neutral-300 absolute right-0 bottom-12 z-10 mt-1 h-44 w-fit min-w-48 overflow-hidden overflow-y-auto rounded-md bg-white p-2 shadow-lg ring-1 ring-black focus:outline-none dark:bg-neutral-800">
                                    <MenuItem v-for="style in writingStyles" :key="style.value" v-slot="{ active }" class="m-0 rounded-md">
                                        <div @click="selectWritingStyle(style)" class="flex w-full cursor-pointer items-center justify-between gap-6 px-2 py-2 text-left text-sm" :class="active ? 'bg-gray-100 dark:bg-neutral-700' : ''">
                                            <div class="flex items-center gap-2">
                                                <div class="materialSymbolsOutlined text-sm">draw</div>
                                                <div class="text-left">
                                                    <p class="text-textColor text-sm font-bold">{{ style.text }}</p>
                                                </div>
                                            </div>
                                            <CheckCheckIcon v-if="style.value === userStore.writingStyle" class="text-logoColor size-6" />
                                        </div>
                                    </MenuItem>
                                </MenuItems>
                            </transition>
                        </Menu>

                        <!-- Tool Mode Toggle -->
                        <Switch v-if="showDataMode" v-model="conversationStore.enableToolCalling" :tooltip="'Enable tool calling'" :size="'sm'" />
                    </template>
                </div>

                <!-- RIGHT SIDE (data mode toggle, send/stop button) -->
                <div class="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5">
                    <Menu as="div" class="relative">
                        <MenuButton class="flex items-center gap-1 rounded-full bg-neutral-200 px-1 py-1 text-xs text-gray-600 sm:px-2 sm:text-sm md:px-3 md:text-base lg:px-4 lg:text-sm dark:bg-neutral-700 dark:text-neutral-300" v-slot="{ open }">
                            <div class="flex items-center gap-1 px-1 py-1">
                                <svg width="14" height="8" sm:width="18" sm:height="10" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-textColor">
                                    <path d="M1 1H4.396C4.61622 1 4.72587 1 4.82482 1.02844C4.91237 1.0536 4.9934 1.09479 5.06242 1.14941C5.14042 1.21114 5.19716 1.29615 5.31046 1.46611L8.68895 6.53394C8.80226 6.7039 8.85896 6.78877 8.93696 6.8505C9.00599 6.90512 9.08677 6.94642 9.17432 6.97158C9.27319 7 9.38408 7 9.604 7H13M8.99985 1H12.9998" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <span class="hidden sm:inline">{{ currentModel.name }}</span>
                                <ChevronUpIcon v-if="!open" class="h-3 w-3 sm:h-4 sm:w-4" />
                                <ChevronDownIcon v-else class="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                        </MenuButton>
                        <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                            <MenuItems class="ai-dropdown model-popup ring-border ring-opacity-5 scrollbar-thin scrollbar-track-neutral-100 scrollbar-thumb-neutral-300 absolute right-0 bottom-10 z-10 mt-1 max-h-56 w-fit min-w-80 overflow-hidden overflow-y-auto rounded-lg bg-white shadow-xl ring-1 ring-black focus:outline-none sm:h-96 sm:min-w-96 md:min-w-96 lg:min-w-96 dark:bg-neutral-900">
                                <div class="sticky -top-0 z-10 mb-2 flex items-center gap-2 border-b border-neutral-200 bg-white px-3 py-3 dark:border-neutral-700 dark:bg-neutral-900">
                                    <!-- Search -->
                                    <SearchIcon class="size-4 text-neutral-500 dark:text-neutral-400" />
                                    <input type="text" placeholder="Search models..." class="w-full border-none bg-transparent p-1 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-neutral-100 dark:placeholder:text-neutral-400" v-model="searchModel" />
                                </div>
                                <MenuItem v-for="model in filteredModels" :key="model.name" v-slot="{ active }" class="m-0" :disabled="!model.accessible">
                                    <div @click="model.accessible ? modelStore.setCurrent(model) : null" class="flex w-full items-center justify-between px-3 py-3 text-left" :class="[active && model.accessible ? 'bg-neutral-100 dark:bg-neutral-800' : '', !model.accessible ? 'cursor-not-allowed opacity-50' : 'cursor-pointer']">
                                        <!-- Left side: Icon and Name -->
                                        <div class="flex min-w-0 flex-1 items-center gap-3">
                                            <!-- Model Icon -->
                                            <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" :class="model.accessible ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-neutral-200 dark:bg-neutral-700'">
                                                <img v-if="model.image" :src="model.image" alt="Model Image" class="h-5 w-5 object-contain" />
                                                <div v-else class="flex h-5 w-5 items-center justify-center">
                                                    <div class="materialSymbolsOutlined text-lg" :class="model.accessible ? 'text-neutral-600 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500'">smart_toy</div>
                                                </div>
                                            </div>

                                            <!-- Model Name -->
                                            <div class="min-w-0 flex-1">
                                                <p class="truncate text-sm font-medium" :class="model.accessible ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400 dark:text-neutral-500'">{{ model.name }}</p>
                                            </div>
                                        </div>

                                        <!-- Right side: Status Icons -->
                                        <div class="flex items-center gap-2">
                                            <!-- Capability Icons -->
                                            <div class="flex items-center gap-1">
                                                <!-- Vision/Image capability -->
                                                <div v-if="model.capabilities && model.capabilities.includes('vision')" class="flex h-5 w-5 items-center justify-center rounded-full" :class="model.accessible ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-neutral-200 dark:bg-neutral-700'">
                                                    <div class="materialSymbolsOutlined text-xs" :class="model.accessible ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-400 dark:text-neutral-500'">visibility</div>
                                                </div>

                                                <!-- Text/General capability -->
                                                <div v-if="model.capabilities && (model.capabilities.includes('text') || model.capabilities.includes('function_calling'))" class="flex h-5 w-5 items-center justify-center rounded-full" :class="model.accessible ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-neutral-400 dark:bg-neutral-600'">
                                                    <div class="materialSymbolsOutlined text-xs" :class="model.accessible ? 'text-purple-600 dark:text-purple-400' : 'text-neutral-400 dark:text-neutral-500'">psychology</div>
                                                </div>

                                                <!-- Image generation capability -->
                                                <div v-if="model.capabilities && model.capabilities.includes('image')" class="flex h-5 w-5 items-center justify-center rounded-full" :class="model.accessible ? 'bg-red-100 dark:bg-red-900/20' : 'bg-neutral-200 dark:bg-neutral-700'">
                                                    <div class="materialSymbolsOutlined text-xs" :class="model.accessible ? 'text-red-600 dark:text-red-400' : 'text-neutral-400 dark:text-neutral-500'">image</div>
                                                </div>
                                            </div>

                                            <!-- Selected indicator or Lock icon -->
                                            <div class="flex items-center">
                                                <div v-if="!model.accessible" class="materialSymbolsOutlined size-4 text-neutral-400 dark:text-neutral-500">lock</div>
                                                <CheckCheckIcon v-else-if="model.model === modelStore.getCurrent().model" class="size-4 text-mozart-blue dark:text-mozart-blue-400" />
                                            </div>
                                        </div>
                                    </div>
                                </MenuItem>
                            </MenuItems>
                        </transition>
                    </Menu>

                    <!-- Send or Stop -->
                    <Tooltip :text="!messageStore.isProcessing ? 'Send Message' : 'Stop Chat'">
                        <div class="border-unselectedColor fill-sideBarTextColor flex size-6 cursor-pointer items-center justify-center rounded-md border bg-transparent sm:size-8" :class="{ 'bg-logoColor': inputData.length > 0 }" @click="onSendClicked">
                            <div v-if="messageStore.isProcessing" class="materialSymbolsFilled text-textColor" @click="stopChat">stop</div>
                            <div v-else class="materialSymbolsFilled" :class="{ 'text-textColor': inputData.length > 0, 'text-unselectedColor': !inputData.length }">arrow_upward</div>
                        </div>
                    </Tooltip>
                </div>
            </div>
        </div>

        <!-- DocumentAttachment Popover -->
        <input type="file" multiple ref="fileInput" @change="handleFileChange" class="hidden" />
        <input type="file" multiple ref="deviceCaptureInput" accept="image/*" capture="environment" @change="handleFileChange" class="hidden" />
        <DocumentAttachment v-if="showDocumentAttachmentPopover" class="absolute left-0 bottom-full mb-2 md:bottom-20 md:left-auto" @uploadFromComputer="handleUploadFromComputer" @uploadFromGoogleDrive="openGoogleFilePicker" @close="showDocumentAttachmentPopover = false" />
    </div>

    <!-- Google Drive File Picker -->
    <GoogleFilePicker v-if="showGoogleFilePicker" :fileSelection="true" :skipUpload="true" :start="showGoogleFilePicker" :showInitialButton="false" @close="showGoogleFilePicker = false" @handleUploadFromGoogleDrive="handleUploadFromGoogleDrive" />
</template>

<script setup lang="ts">
    import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue"
    import { convertMimeTypeToType, trimTitle, trimModelDescription } from "~/util"
    import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/vue/24/outline"
    import { CheckCheckIcon, SearchIcon } from "lucide-vue-next"
    import { inject, type ComputedRef, watch } from "vue"
    import { useMobileKeyboard } from "~/composables/useMobileKeyboard"
    // Props
    defineProps({
        placeholderValue: String,
        showDataMode: Boolean,
        showScrollButton: {
            type: Boolean,
            default: false,
        },
    })

    // Emit
    const emit = defineEmits(["onInputSubmit", "updateFileAttachments", "updateInputExpanded", "scrollToBottom"])

    // Store imports
    const modelStore = useModelStore()
    const messageStore = useMessageStore()
    const abortControllerStore = useAbortControllerStore()
    const ragStore = useRagStore()
    const userStore = useUserStore()
    const conversationStore = useConversationStore()

    // Refs & data
    const textAreaRef = ref<HTMLElement>()
    const inputData = ref("")
    const showModels = ref(false)
    const showCollections = ref(false)
    const showWritingStyle = ref(false)
    const showDocumentAttachmentPopover = ref(false)
    const showGoogleFilePicker = ref(false)
    const showComposeTools = ref(false)
    const selectedFiles = ref<any>([])
    const fileInput = ref<HTMLElement>()
    const deviceCaptureInput = ref<HTMLElement>()
    const currentModel = ref(modelStore.getCurrent())
    const fileKey = (file: any) => file.id || `${file.name}-${file.size || ''}-${file.lastModified || ''}-${file.type || ''}`

    // Watch for changes in the model store and update the current model
    watch(
        () => modelStore.current,
        (newModel) => {
            if (newModel) {
                currentModel.value = newModel
            }
        },
        { immediate: true }
    )
    const isMobile = inject<ComputedRef<boolean>>(
        "isMobile",
        computed(() => false)
    )
    const searchModel = ref("")
    const filteredModels = computed(() => {
        const query = searchModel.value.toLowerCase()
        return modelStore.models.filter((model: any) => model.accessible && model.name.toLowerCase().includes(query))
    })

    const searchCollection = ref("")
    const filteredCollections = computed(() => {
        return ragStore.collections.filter((collection: any) => (collection.alias || collection.name).toLowerCase().includes(searchCollection.value.toLowerCase()))
    })

    const writingStyles = ref([
        {
            text: "Formal",
            value: "formal",
        },
        {
            text: "Casual",
            value: "casual",
        },
        {
            text: "Concise",
            value: "concise",
        },
        {
            text: "Creative",
            value: "creative",
        },
    ])

    const selectCollection = (collection: any) => {
        if (ragStore.currentQdrantInstance !== collection.service) {
            ragStore.currentQdrantInstance = collection.service
        }
        ragStore.currentCollection = collection.name
    }

    const selectWritingStyle = (style: any) => {
        userStore.writingStyle = style.value
    }

    // Helper functions for model display
    const getCapabilityLabel = (capability: string) => {
        const labels: { [key: string]: string } = {
            text: "Text",
            image: "Image",
            pdf: "PDF",
            pdf_with_images: "PDF+Images",
            handwriting: "Handwriting",
            code: "Code",
            audio: "Audio",
            vision: "Vision",
            function_calling: "Functions",
            tool_calling: "Tools",
            streaming: "Streaming",
            thinking: "Thinking",
        }
        return labels[capability] || capability
    }

    const formatContextWindow = (contextWindow: number) => {
        if (contextWindow >= 1000000) {
            return `${(contextWindow / 1000000).toFixed(1)}M`
        } else if (contextWindow >= 1000) {
            return `${(contextWindow / 1000).toFixed(0)}K`
        }
        return contextWindow.toString()
    }

    // Methods
    const toggleShowModels = () => {
        showModels.value = !showModels.value
    }
    const toggleShowCollections = () => {
        showCollections.value = !showCollections.value
    }
    const toggleShowWritingStyle = () => {
        showWritingStyle.value = !showWritingStyle.value
    }

    // Watch for changes in showComposeTools to emit the state
    watch(
        () => showComposeTools.value,
        (newValue) => {
            emit("updateInputExpanded", newValue)
        }
    )

    const onSendClicked = () => {
        if (messageStore.isProcessing) return stopChat()
        if (messageStore.isLoading) return
        if (inputData.value.trim() === "") return
        messageStore.isProcessing = true
        emit("onInputSubmit", inputData.value, selectedFiles.value)
        inputData.value = ""
        selectedFiles.value = []
        adjustTextAreaHeight()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            onSendClicked()
        }
    }

    const handleFocus = () => {
        // Ensure input is visible on iOS Safari when focused
        if (isMobile.value) {
            console.log("Input focused on mobile device")
            // Force a small delay to ensure proper positioning
            setTimeout(() => {
                adjustTextAreaHeight()
            }, 50)
        }
    }

    const handleBlur = () => {
        // Handle blur event if needed
        if (isMobile.value) {
            console.log("Input blurred on mobile device")
        }
    }

    const stopChat = () => {
        abortControllerStore.abortCurrentController()
        messageStore.isProcessing = false
    }

    const handleScrollToBottom = () => {
        emit("scrollToBottom", true)
    }

    const triggerDeviceCamera = () => {
        deviceCaptureInput.value?.click()
    }

    const triggerFileInputClick = () => {
        fileInput.value?.click()
    }

    // File handling
    const handleFileChange = (event: Event) => {
        const target = event.target as HTMLInputElement
        if (!target?.files) {
            alert("Please select a file first.")
            return
        }
        const newFiles = Array.from(target.files)
        // Prevent exceeding file limit
        if (newFiles.length > 3 || selectedFiles.value.length + newFiles.length > 10) {
            alert("Please select a maximum of 3 files at a time and ensure total files do not exceed 10.")
            return
        }
        // Prevent duplicate files based on name and size
        const existingFileNames = new Set(selectedFiles.value.map((file: File) => file.name + file.size))
        const uniqueFiles = newFiles.filter((file) => !existingFileNames.has(file.name + file.size))

        selectedFiles.value = [...selectedFiles.value, ...uniqueFiles]
    }

    const handleFileDrop = (event: DragEvent) => {
        event.preventDefault()
        if (!event.dataTransfer) return
        const newFiles = Array.from(event.dataTransfer.files)
        // Prevent exceeding file limit
        if (newFiles.length > 10 || selectedFiles.value.length + newFiles.length > 10) {
            alert("Please select a maximum of 10 files")
            return
        }
        // Prevent duplicate files based on name and size
        const existingFileNames = new Set(selectedFiles.value.map((file: File) => file.name + file.size))
        const uniqueFiles = newFiles.filter((file) => !existingFileNames.has(file.name + file.size))
        // Update the selected files
        selectedFiles.value = [...selectedFiles.value, ...uniqueFiles]
    }

    const removeDocument = (file: File) => {
        selectedFiles.value = selectedFiles.value.filter((item: File) => item.name !== file.name)
    }

    const handleFilePaste = (event: ClipboardEvent) => {
        const items = event.clipboardData?.items
        if (!items) return
        const pastedFiles: File[] = []
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === "file") {
                event.preventDefault()
                const file = items[i].getAsFile()
                if (file) {
                    pastedFiles.push(file)
                }
            }
        }
        if (!pastedFiles.length) return
        // Prevent exceeding file limit
        if (pastedFiles.length > 10 || selectedFiles.value.length + pastedFiles.length > 10) {
            alert("Please select a maximum of 10 files.")
            return
        }
        // Prevent duplicate files based on name and size
        const existingFileNames = new Set(selectedFiles.value.map((file: File) => file.name + file.size))
        const uniqueFiles = pastedFiles.filter((file) => !existingFileNames.has(file.name + file.size))
        // Update the selected files
        selectedFiles.value = [...selectedFiles.value, ...uniqueFiles]
    }

    // Mobile keyboard management
    const { isKeyboardOpen, keyboardHeight, shouldAdjustForKeyboard } = useMobileKeyboard()

    // Auto-resize the textarea with mobile keyboard awareness
    const adjustTextAreaHeight = () => {
        const textArea = textAreaRef.value as HTMLTextAreaElement
        if (!textArea) return

        textArea.style.height = "auto"

        // Calculate max height based on device and keyboard state
        let maxHeight: number
        if (isMobile.value && shouldAdjustForKeyboard()) {
            // On mobile with keyboard open, use a smaller max height
            // to ensure the textarea doesn't take up too much space
            const viewportHeight = window.visualViewport?.height || window.innerHeight
            maxHeight = Math.min(viewportHeight * 0.15, 120)
        } else if (isMobile.value) {
            // On mobile without keyboard, use a moderate max height
            const viewportHeight = window.visualViewport?.height || window.innerHeight
            maxHeight = Math.min(viewportHeight * 0.25, 200)
        } else {
            // On desktop, use the original calculation
            maxHeight = window.innerHeight * 0.25
        }

        const newHeight = inputData.value.length > 0 ? Math.min(textArea.scrollHeight, maxHeight) : 40
        textArea.style.height = `${newHeight}px`
    }
    const handleUploadFromComputer = () => {
        triggerFileInputClick()
        showDocumentAttachmentPopover.value = false
    }
    const handleUploadFromGoogleDrive = (files: any[]) => {
        for (const file of files) {
            selectedFiles.value.push({ ...file, type: file.mimeType, source: "google-drive" })
        }
        showGoogleFilePicker.value = false
    }
    const openGoogleFilePicker = () => {
        showDocumentAttachmentPopover.value = false
        showGoogleFilePicker.value = true
    }



    // Watch for changes in the current model
    watch(
        () => modelStore.getCurrent(),
        () => {
            // The computed property will automatically update
        }
    )
    // Watch input changes to auto-resize
    watch(
        () => inputData.value,
        () => {
            adjustTextAreaHeight()
        }
    )

    // Watch for changes in selectedFiles
    watch(
        () => selectedFiles.value,
        (newFiles) => {
            emit("updateFileAttachments", newFiles.length > 0)
        },
        { deep: true }
    )

    onMounted(() => {
        adjustTextAreaHeight()

        // Debug function for iOS Safari input visibility
        if (isMobile.value) {
            console.log("Mobile device detected, setting up iOS Safari fixes")

            // Force a reflow to ensure proper positioning
            setTimeout(() => {
                const textArea = textAreaRef.value as HTMLTextAreaElement
                if (textArea) {
                    textArea.style.display = "none"
                    textArea.offsetHeight // Force reflow
                    textArea.style.display = ""
                }
            }, 100)
        }
    })
</script>

<style scoped>
    .list-enter {
        transform: translateX(-100%);
        opacity: 0;
    }

    .list-enter-active {
        transition:
            transform 0.5s,
            opacity 0.5s;
        transform: translateX(0);
        opacity: 1;
    }

    .list-leave {
        /* (optional if you need something on immediate leave) */
    }

    .list-leave-active {
        position: relative;
        transition:
            transform 0.5s,
            opacity 0.5s;
        transform: translateY(1000px);
        opacity: 0;
    }

    .hide-scrollbar {
        -ms-overflow-style: none; /* IE/Edge */
        scrollbar-width: none; /* Firefox */
    }
    .hide-scrollbar::-webkit-scrollbar {
        display: none; /* Chrome/Safari/WebKit */
    }

    /* Mobile-specific styles for keyboard handling */
    @media (max-width: 768px) {
        /* Ensure textarea doesn't exceed viewport height */
        textarea {
            max-height: 40vh !important;
            min-height: 40px !important;
            font-size: 16px !important; /* Prevent zoom on iOS */
        }

        /* Smooth transitions for height changes */
        textarea {
            transition: height 0.2s ease-out;
        }

        /* Prevent textarea from growing too large on mobile */
        .flex.select-none.flex-col.items-center.justify-between.rounded-lg {
            max-height: 60vh;
            overflow: hidden;
        }

        /* Ensure the input container stays within viewport */
        .mx-auto.flex.w-full.flex-col.space-y-2 {
            max-height: 80vh;
        }

        /* iOS Safari specific input container fixes */
        .flex.select-none.flex-col.items-center.justify-between.rounded-lg {
            position: relative;
            z-index: 1;
        }
    }

    /* iOS Safari specific fixes */
    @supports (-webkit-touch-callout: none) {
        textarea {
            /* Prevent zoom on focus in iOS */
            font-size: 16px !important;
            -webkit-appearance: none;
            border-radius: 0;
        }

        /* Ensure input container is visible */
        .flex.select-none.flex-col.items-center.justify-between.rounded-lg {
            position: relative;
            z-index: 1;
            background-color: var(--backgroundColor, white);
        }

        /* Fix for iOS Safari viewport issues */
        @media (max-width: 768px) {
            .mx-auto.flex.w-full.flex-col.space-y-2 {
                position: relative;
                z-index: 1;
            }
        }

        /* Additional iOS Safari fixes */
        .mx-auto.flex.w-full.flex-col.space-y-2 {
            /* Ensure container is always visible */
            position: relative;
            z-index: 1;
            /* Force hardware acceleration */
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
        }

        /* Ensure textarea is always visible and interactive */
        textarea {
            position: relative;
            z-index: 2;
            /* Prevent iOS Safari from hiding the input */
            -webkit-user-select: text;
            user-select: text;
            /* Ensure proper touch handling */
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
        }
    }

    /* Model selection popup responsive improvements */
    @media (max-width: 640px) {
        /* Ensure popup doesn't overflow on small screens */
        .model-popup {
            max-width: calc(100vw - 2rem);
            min-width: 280px;
        }

        /* Make capability badges smaller on mobile */
        .capability-badge {
            font-size: 0.625rem;
            padding: 0.25rem 0.5rem;
        }
    }

    /* Ensure popup positioning works well on different screen sizes */
    @media (min-width: 641px) and (max-width: 1024px) {
        .model-popup {
            max-width: 400px;
        }
    }

    @media (min-width: 1025px) {
        .model-popup {
            max-width: 450px;
        }
    }

    /* Model selection popup responsive improvements */
    @media (max-width: 640px) {
        /* Ensure popup doesn't overflow on small screens */
        .model-popup {
            max-width: calc(100vw - 2rem);
            min-width: 280px;
        }

        /* Make capability badges smaller on mobile */
        .capability-badge {
            font-size: 0.625rem;
            padding: 0.25rem 0.5rem;
        }
    }

    /* Ensure popup positioning works well on different screen sizes */
    @media (min-width: 641px) and (max-width: 1024px) {
        .model-popup {
            max-width: 400px;
        }
    }

    @media (min-width: 1025px) {
        .model-popup {
            max-width: 450px;
        }
    }

    /* Android Chrome specific fixes */
    @media screen and (max-width: 768px) and (-webkit-min-device-pixel-ratio: 1) {
        .tool-input-container {
            overflow-y: visible !important;
            overflow-x: visible !important;
        }
        textarea {
            /* Ensure proper rendering on Android */
            -webkit-appearance: none;
            border-radius: 0;
        }
    }

    .list-enter-active,
    .list-leave-active {
        transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1),
                    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .list-enter-from {
        opacity: 0;
        transform: translateY(6px) scale(0.96);
    }

    .list-enter-to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    .list-leave-from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    .list-leave-to {
        opacity: 0;
        transform: translateY(0) scale(1);
    }

    .list-leave-active {
        position: absolute;
    }

    .list-move {
        transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .attachmentWrapper {
        will-change: transform, opacity;
    }

    .attachments-container {
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        transition:
            max-height 220ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 220ms cubic-bezier(0.22, 1, 0.36, 1),
            margin-bottom 220ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .attachments-container--visible {
        max-height: 80px;
        opacity: 1;
        margin-bottom: 0.5rem;
    }

    @media (prefers-reduced-motion: reduce) {
        .list-enter-active,
        .list-leave-active,
        .list-move {
            transition: none;
        }
    }
</style>
