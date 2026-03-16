<template>
    <div class="relative flex flex-col gap-[10px]">
        <div class="border-borderColor relative flex min-h-[8rem] w-[40rem] flex-col justify-between rounded-[14px] border-[1.5px] px-4 pt-4 pb-2 transition-all duration-200" :class="{ 'border-borderColor border-[1px]': inputFocus }" @dragover.prevent @drop.prevent="handleFileDrop" @paste="handleFilePaste">
            <!-- Document Attachment -->
            <div class="absolute flex bottom-full mb-2 left-0 md:bottom-auto md:top-[285px]">
                <DocumentAttachment v-if="showDocumentAttachmentPopover" class="relative left-2 md:-top-80 md:left-4" @uploadFromComputer="handleUploadFromComputer" @uploadFromGoogleDrive="openGoogleFilePicker" />
            </div>

            <!-- Loading spinner or textarea -->
            <ComponentLoading v-if="ragStore.isProcessing" />
            <div v-else>
                <div class="attachments-container" :class="{ 'attachments-container--visible': selectedFiles.length > 0 }">
                    <!-- Attached Files -->
                    <transition-group
                        appear
                        name="list"
                        tag="div"
                        class="hide-scrollbar flex w-full items-center gap-2 overflow-x-auto whitespace-nowrap"
                        :class="{ 'mb-2': selectedFiles.length > 0 }"
                    >
                    <div
                        v-for="file in selectedFiles"
                        :key="fileKey(file)"
                        class="attachmentWrapper group border-borderColor bg-backgroundColor inline-flex items-center gap-2 rounded-[0.4rem] border px-3 py-2"
                    >
                        <div class="bg-linkColor flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.4rem]">
                        <div class="materialSymbolsFilled text-backgroundColor text-[18px]">description</div>
                        </div>
                        <div class="flex flex-col overflow-hidden text-ellipsis">
                        <span class="truncate text-sm">{{ trimTitle(file.name) }}</span>
                        <span class="text-xs text-gray-500">{{ convertMimeTypeToType(file.type) }}</span>
                        </div>
                        <div class="materialSymbolsOutlined ml-1 cursor-pointer text-[14px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" @click="removeDocument(file)">close</div>
                    </div>
                    </transition-group>
                </div>

                <textarea
                    ref="inputTextRef"
                    @focus="onFocus"
                    @blur="onBlur"
                    type="text"
                    class="text-textColor w-full resize-none border-none bg-transparent text-[1rem] placeholder-gray-400 focus:outline-none"
                    :placeholder="placeholderValue"
                    v-model="inputData"
                    @input="adjustTextAreaHeight"
                    @keydown.enter.exact="onSendClicked"
                    @dragover.prevent
                    @drop.prevent="handleFileDrop"
                    @paste="handleFilePaste"
                    rows="1"
                ></textarea>
            </div>

            <!-- Action icons row -->
            <div class="flex flex-row items-center justify-between">
                <!-- Left icons -->
                <div class="flex flex-row gap-0 sm:gap-2">
                    <!-- Expand/Collapse Toggle Button -->
                    <div class="border-borderColor text-sideBarTextColor flex cursor-pointer items-center justify-center rounded-sm border bg-transparent" :class="isMobile ? 'h-8 w-8 p-0' : 'px-3 py-2'" @click="showComposeTools = !showComposeTools">
                        <div class="materialSymbolsOutlined transition-transform duration-200 select-none" :class="[isMobile ? 'text-lg' : 'text-base', showComposeTools ? 'rotate-180' : '']">
                            {{ showComposeTools ? "arrow_forward_ios" : "tune" }}
                        </div>
                    </div>

                    <Menu class="relative" as="div">
                        <MenuButton class="border-borderColor text-sideBarTextColor flex cursor-pointer items-center justify-center rounded-sm border bg-transparent" :class="isMobile ? 'h-8 w-8 p-0' : 'px-3 py-2 text-base'">
                            <span class="materialSymbolsOutlined">add</span>
                        </MenuButton>
                        <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                            <MenuItems class="ai-dropdown ring-border ring-opacity-5 scrollbar-thin scrollbar-track-neutral-100 scrollbar-thumb-neutral-300 absolute bottom-full left-0 z-10 mb-2 w-fit min-w-max overflow-hidden overflow-y-auto rounded-md bg-white p-2 shadow-lg shadow-none ring-1 ring-black focus:outline-none dark:bg-neutral-800">
                                <MenuItem @click="handleUploadFromComputer" v-slot="{ active }" class="m-0 rounded-sm">
                                    <div class="flex w-full cursor-pointer items-center justify-start gap-2 px-2 py-1 text-left text-sm" :class="active ? 'bg-gray-100 dark:bg-neutral-700' : ''">
                                        <div class="materialSymbolsOutlined text-textColor text-xl">upload</div>
                                        <span class="text-textColor">Upload from computer</span>
                                    </div>
                                </MenuItem>
                                <MenuItem @click="openGoogleFilePicker" v-slot="{ active }" class="m-0 rounded-sm">
                                    <div class="flex w-full cursor-pointer gap-2 px-2 py-2 text-left text-sm" :class="active ? 'bg-gray-100 dark:bg-neutral-700' : ''">
                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
                                            <path fill="#1e88e5" d="M38.59,39c-0.535,0.93-0.298,1.68-1.195,2.197C36.498,41.715,35.465,42,34.39,42H13.61 c-1.074,0-2.106-0.285-3.004-0.802C9.708,40.681,9.945,39.93,9.41,39l7.67-9h13.84L38.59,39z"></path>
                                            <path fill="#fbc02d" d="M27.463,6.999c1.073-0.002,2.104-0.716,3.001-0.198c0.897,0.519,1.66,1.27,2.197,2.201l10.39,17.996 c0.537,0.93,0.807,1.967,0.808,3.002c0.001,1.037-1.267,2.073-1.806,3.001l-11.127-3.005l-6.924-11.993L27.463,6.999z"></path>
                                            <path fill="#e53935" d="M43.86,30c0,1.04-0.27,2.07-0.81,3l-3.67,6.35c-0.53,0.78-1.21,1.4-1.99,1.85L30.92,30H43.86z"></path>
                                            <path fill="#4caf50" d="M5.947,33.001c-0.538-0.928-1.806-1.964-1.806-3c0.001-1.036,0.27-2.073,0.808-3.004l10.39-17.996 c0.537-0.93,1.3-1.682,2.196-2.2c0.897-0.519,1.929,0.195,3.002,0.197l3.459,11.009l-6.922,11.989L5.947,33.001z"></path>
                                            <path fill="#1565c0" d="M17.08,30l-6.47,11.2c-0.78-0.45-1.46-1.07-1.99-1.85L4.95,33c-0.54-0.93-0.81-1.96-0.81-3H17.08z"></path>
                                            <path fill="#2e7d32" d="M30.46,6.8L24,18L17.53,6.8c0.78-0.45,1.66-0.73,2.6-0.79L27.46,6C28.54,6,29.57,6.28,30.46,6.8z"></path>
                                        </svg>
                                        <span class="text-textColor">Add from Google Drive</span>
                                    </div>
                                </MenuItem>
                                <MenuItem @click="triggerDeviceCamera" v-slot="{ active }" class="m-0 block rounded-sm md:hidden">
                                    <div class="flex w-full cursor-pointer items-center justify-start gap-2 px-2 py-1 text-left text-sm" :class="active ? 'bg-gray-100 dark:bg-neutral-700' : ''">
                                        <div class="materialSymbolsOutlined text-lg sm:text-xl">photo_camera</div>
                                        <span class="text-textColor">Take photo</span>
                                    </div>
                                </MenuItem>
                            </MenuItems>
                        </transition>
                    </Menu>
                    <input type="file" multiple ref="fileInput" @change="handleFileChange" class="fileInput hidden" />
                    <input type="file" multiple ref="deviceCaptureInput" accept="image/*" capture="environment" @change="handleFileChange" class="hidden" />

                    <!-- Compose Tools - Show when expanded -->
                    <template v-if="showComposeTools">
                        <!-- Our Switch component -->
                        <div class="flex flex-row items-center gap-2">
                            <Switch v-if="showDataMode" v-model="ragStore.isDataMode" :tooltip="'Talk with your data'" :size="'sm'" />
                            <span v-if="showDataMode && !isMobile" class="text-textColor" :class="{ 'text-textColor': isDataMode }"> Data </span>
                        </div>
                        <!-- Collection Selector (admin only) -->
                        <Menu v-if="userStore.isAdmin" as="div" class="relative">
                            <MenuButton class="border-borderColor text-sideBarTextColor flex cursor-pointer items-center justify-center rounded-sm border bg-transparent" :class="isMobile ? 'h-8 w-8 p-0' : 'px-[10px] py-[7px]'">
                                <div class="materialSymbolsOutlined" :class="isMobile ? 'text-lg' : ''">stacks</div>
                                <div class="text-sideBarTextColor text-[0.9rem]" :class="isMobile ? 'text-xs' : ''" v-if="selectedCollection"></div>
                            </MenuButton>
                            <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                                <MenuItems class="ai-dropdown ring-border ring-opacity-5 scrollbar-thin scrollbar-track-neutral-100 scrollbar-thumb-neutral-300 absolute right-0 bottom-12 z-10 mt-1 h-60 w-fit min-w-64 overflow-hidden overflow-y-auto rounded-sm bg-white p-2 shadow-lg ring-1 ring-black focus:outline-none dark:bg-neutral-800">
                                    <div class="border-borderColor sticky -top-2 mb-2 flex items-center gap-1 border-b bg-white px-2 dark:bg-neutral-800">
                                        <SearchIcon class="text-textColor size-4" />
                                        <input type="text" placeholder="Search collections" class="text-textColor box-border max-h-[200px] w-full resize-none border-none bg-transparent p-2 text-xs transition-all duration-200 outline-none" v-model="searchCollection" />
                                    </div>
                                    <MenuItem v-for="collection in filteredCollections" :key="collection.id" v-slot="{ active }" class="m-0 rounded-sm">
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
                            <MenuButton class="border-borderColor text-sideBarTextColor flex cursor-pointer items-center justify-center rounded-sm border bg-transparent" :class="isMobile ? 'h-8 w-8 p-0' : 'px-[10px] py-[7px]'">
                                <div class="materialSymbolsOutlined" :class="isMobile ? 'text-lg' : ''">draw</div>
                                <div class="text-sideBarTextColor text-[0.9rem]" :class="isMobile ? 'text-xs' : ''" v-if="selectedWritingStyle"></div>
                            </MenuButton>
                            <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                                <MenuItems class="ai-dropdown ring-border ring-opacity-5 scrollbar-thin scrollbar-track-neutral-100 scrollbar-thumb-neutral-300 absolute right-0 bottom-12 z-10 mt-1 h-44 w-fit min-w-48 overflow-hidden overflow-y-auto rounded-sm bg-white p-2 shadow-lg ring-1 ring-black focus:outline-none dark:bg-neutral-800">
                                    <MenuItem v-for="style in writingStyles" :key="style.value" v-slot="{ active }" class="m-0 rounded-sm">
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

                <!-- Right icons -->
                <div class="flex items-center gap-[10px]">
                    <Menu as="div" class="relative">
                        <MenuButton class="border-borderColor text-textColor flex items-center gap-1 rounded-lg border px-2 py-1 text-sm" v-slot="{ open }">
                            <div class="flex items-center gap-1 px-1 py-1">
                                <svg width="18" height="10" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-textColor">
                                    <path d="M1 1H4.396C4.61622 1 4.72587 1 4.82482 1.02844C4.91237 1.0536 4.9934 1.09479 5.06242 1.14941C5.14042 1.21114 5.19716 1.29615 5.31046 1.46611L8.68895 6.53394C8.80226 6.7039 8.85896 6.78877 8.93696 6.8505C9.00599 6.90512 9.08677 6.94642 9.17432 6.97158C9.27319 7 9.38408 7 9.604 7H13M8.99985 1H12.9998" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <!-- Show only on desktop -->
                                <div class="hidden items-center gap-1 sm:flex">
                                    {{ currentModel.name }}
                                    <ChevronUpIcon v-if="!open" class="h-4 w-4" />
                                    <ChevronDownIcon v-else class="h-4 w-4" />
                                </div>
                            </div>
                        </MenuButton>
                        <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                            <MenuItems class="ai-dropdown ring-border ring-opacity-5 scrollbar-thin scrollbar-track-neutral-100 scrollbar-thumb-neutral-300 absolute right-0 bottom-10 z-10 mt-1 h-60 w-fit min-w-64 overflow-hidden overflow-y-auto rounded-sm bg-white p-2 shadow-lg ring-1 ring-black focus:outline-none dark:bg-neutral-800">
                                <div class="border-borderColor sticky -top-2 mb-2 flex items-center gap-1 border-b bg-white px-2 dark:bg-neutral-800">
                                    <!-- Search -->
                                    <SearchIcon class="text-textColor size-4" />
                                    <input type="text" placeholder="Search" class="text-textColor box-border max-h-[200px] w-full resize-none border-none bg-transparent p-2 text-xs transition-all duration-200 outline-none" v-model="searchModel" @keydown.space.stop />
                                </div>
                                <MenuItem v-for="model in filteredModels" :key="model.name" v-slot="{ active }" class="m-0 rounded-sm">
                                    <div @click="modelStore.setCurrent(model)" class="flex w-full items-center justify-between gap-6 px-2 py-2 text-left text-sm" :class="active ? 'bg-gray-100 dark:bg-neutral-700' : ''">
                                        <div class="flex items-center gap-2">
                                            <img :src="model.image" alt="Model Image" class="m-1 h-5 w-5 object-fill" />
                                            <div class="text-left">
                                                <p class="text-textColor text-sm font-bold">{{ model.name }}</p>
                                                <p class="text-textColor hover:text-textColor truncate text-xs">{{ trimModelDescription(model.description) }}</p>
                                            </div>
                                        </div>
                                        <CheckCheckIcon v-if="model.model === modelStore.getCurrent().model" class="text-logoColor size-6" />
                                    </div>
                                </MenuItem>
                            </MenuItems>
                        </transition>
                    </Menu>

                    <!-- Send button -->
                    <div
                        class="sendButton border-borderColor fill-sideBarTextColor flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border bg-transparent"
                        :class="{
                            'bg-logoColor fill-primaryColor': inputData.length > 0,
                            'h-7 w-7': isMobile,
                        }"
                        :onClick="onSendClicked"
                    >
                        <!-- Loading spinner if processing -->
                        <div class="materialSymbolsFilled circle text-textColor" :class="{ 'text-[1rem]': isMobile }" v-if="messageStore.isProcessing">progress_activity</div>
                        <!-- Send icon if not processing -->
                        <svg v-else width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{ 'h-[13px] w-[11px]': isMobile }">
                            <path
                                d="M12.7853 7.86719C12.9217 7.7377 13 7.55641 13 7.36649C13 7.17657 12.9217 6.99816 12.7853 6.86579L7.67812 2.03141C7.39955 1.76667 6.95848 1.77818 6.69442 2.05443C6.43036 2.33068 6.43906 2.76808 6.71763 3.02994L10.5654 6.67586H0.696429C0.310491 6.67586 0 6.98377 0 7.36649C0 7.74921 0.310491 8.05711 0.696429 8.05711H10.5654L6.71473 11.7002C6.43616 11.9649 6.42746 12.3994 6.69152 12.6757C6.95558 12.9519 7.39665 12.9606 7.67522 12.6987L12.7824 7.86431L12.7853 7.86719Z"
                                transform="rotate(-90 6.5 7.5)"
                                :fill="inputData.length > 0 ? 'var(--textColor)' : 'var(--unselectedColor)'"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- System Prompt Selector - Horizontal row of buttons -->
        <div class="my-2 flex w-[40rem] flex-wrap justify-center gap-2" :class="{ 'w-full': isMobile }">
            <div
                v-for="prompt in systemPrompts"
                :key="prompt.value"
                class="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm transition-all duration-200"
                :class="[
                    {
                        'bg-logoColor text-white font-medium': userStore.systemPrompt === prompt.value,
                        'border-borderColor bg-backgroundColor text-sideBarTextColor hover:bg-headerBackgroundColor hover:text-textColor border': userStore.systemPrompt !== prompt.value,
                    },
                    isMobile ? 'px-3 py-2 text-sm' : '',
                ]"
                @click="selectSystemPrompt(prompt)"
            >
                <span class="materialSymbolsOutlined" :class="isMobile ? 'text-[1rem]' : 'text-[1.2rem]'">{{ prompt.icon }}</span>
                <span :class="isMobile ? 'text-[0.85rem]' : 'text-[0.95rem]'">{{ prompt.text }}</span>
            </div>
        </div>
    </div>
    <GoogleFilePicker v-if="showGoogleFilePicker" :fileSelection="true" :skipUpload="true" :start="showGoogleFilePicker" :showInitialButton="false" @close="showGoogleFilePicker = false" @handleUploadFromGoogleDrive="handleUploadFromGoogleDrive" />
</template>

<script setup lang="ts">
    import { inject, type ComputedRef, watch } from "vue"
    import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue"
    import { convertMimeTypeToType, trimTitle, trimModelDescription } from "~/util"
    import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/vue/24/outline"
    import { CheckCheckIcon, SearchIcon } from "lucide-vue-next"
    import { systemPrompts } from "~/util/staticData"
    defineProps({
        placeholderValue: String,
        showDataMode: Boolean,
    })
    const modelStore = useModelStore()
    const messageStore = useMessageStore()
    const ragStore = useRagStore()
    const userStore = useUserStore()
    const conversationStore = useConversationStore()
    const selectedFiles = ref<any>([])
    const fileInput = ref<HTMLElement>()
    const deviceCaptureInput = ref<HTMLElement>()
    const isMobile = inject<ComputedRef<boolean>>("isMobile")
    const inputData = ref("")
    const currentModel = ref(modelStore.getCurrent())

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
    const showModels = ref(false)
    const showCollections = ref(false)
    const showComposeTools = ref(false)
    const inputTextRef = ref<any>()
    const inputFocus = ref(false)
    const showDocumentAttachmentPopover = ref(false)
    const showGoogleFilePicker = ref(false)
    const showWritingStyle = ref(false)
    const showSystemPrompt = ref(false)
    const isDataMode = computed(() => ragStore.isDataMode)
    const selectedCollection = computed(() => {
        let collection: any = ragStore.collections.find((c: any) => c.name === ragStore.currentCollection)
        let trimmedName = ""
        if (collection) {
            trimmedName = collection.alias ? (collection.alias.length > 15 ? collection.alias.slice(0, 15) + "..." : collection.alias) : collection.name.length > 15 ? collection.name.slice(0, 15) + "..." : collection.name
        }
        return trimmedName
    })
    const fileKey = (file: any) => file.id || `${file.name}-${file.size || ''}-${file.lastModified || ''}-${file.type || ''}`

    const searchModel = ref("")
    const filteredModels = computed(() => {
        const query = searchModel.value.toLowerCase()
        return modelStore.models.filter((model: any) => model.accessible && model.name.toLowerCase().includes(query))
    })

    const searchCollection = ref("")
    const filteredCollections = computed(() => {
        return ragStore.collections.filter((collection: any) => (collection.alias || collection.name).toLowerCase().includes(searchCollection.value.toLowerCase()))
    })

    const selectedWritingStyle = computed(() => {
        const style = writingStyles.value.find((s: any) => s.value === userStore.writingStyle)
        return style ? style.text : ""
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

    const selectSystemPrompt = (prompt: any) => {
        userStore.systemPrompt = prompt.value
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

    const toggleShowModels = () => {
        showModels.value = !showModels.value
    }

    const onSendClicked = () => {
        const message = inputData.value.trim()
        if (message === "") return
        messageStore.isProcessing = true
        emit("onInputSubmit", message, selectedFiles.value)
        inputData.value = ""
        selectedFiles.value = []
        nextTick(() => adjustTextAreaHeight())
    }

    const triggerDeviceCamera = () => {
        deviceCaptureInput.value?.click()
    }

    const triggerFileInputClick = () => {
        if (!fileInput.value) return
        fileInput.value.click()
    }

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

    const removeDocument = (file: any) => {
        selectedFiles.value = selectedFiles.value.filter((item: any) => item.name !== file.name)
    }

    const adjustTextAreaHeight = () => {
        const el = inputTextRef.value as HTMLTextAreaElement | undefined
        if (!el) return

        // Comfortable cap (change 200 if you like)
        const maxHeight = 200 // px (≈ 10–12 lines depending on line-height)

        // Reset first so it can shrink when deleting
        el.style.height = "auto"

        const natural = el.scrollHeight
        const newHeight = Math.min(natural, maxHeight)
        el.style.height = `${newHeight}px`

        // If under cap, never show a scrollbar and never “hide first line”
        if (natural <= maxHeight) {
            el.style.overflowY = "hidden"
            el.scrollTop = 0
        } else {
            el.style.overflowY = "auto"
        }
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

    watch(
        () => inputData.value,
        () => {
            adjustTextAreaHeight()
        }
    )

    const onFocus = () => {
        inputFocus.value = true
    }
    const onBlur = () => {
        inputFocus.value = false
    }
    watch(
        () => modelStore.getCurrent(),
        () => {
            // The computed property will automatically update
        }
    )

    // Emit
    const emit = defineEmits(["onInputSubmit", "updateInputExpanded"])

    onMounted(() => {
        currentModel.value = modelStore.getCurrent()
        setTimeout(() => {
            inputTextRef.value.focus()
            adjustTextAreaHeight()
        }, 500)
    })
    watch(
        () => inputData.value,
        () => {
            // keep this; it helps on programmatic changes to inputData
            adjustTextAreaHeight()
        }
    )

    // Watch for changes in showComposeTools to emit the state
    watch(
        () => showComposeTools.value,
        (newValue) => {
            emit("updateInputExpanded", newValue)
        }
    )
</script>
<style scoped>
    /* Transition-group animations (unchanged) */
    .list-enter {
        transform: translateX(-100%);
        /* Start off-screen */
        opacity: 0;
    }

    .list-enter-active {
        transition:
            transform 0.5s,
            opacity 0.5s;
        transform: translateX(0);
        opacity: 1;
    }

    .list-leave-active {
        position: relative;
        transition:
            transform 0.5s,
            opacity 0.5s;
        transform: translateY(1000px);
        opacity: 0;
    }

    /* "Circle" spinner keyframes, if you prefer a custom spin */
    .circle {
        animation: circleAnimation 1s infinite;
    }

    .hide-scrollbar {
        -ms-overflow-style: none;
        /* IE/Edge */
        scrollbar-width: none;
        /* Firefox */
    }

    .hide-scrollbar::-webkit-scrollbar {
        display: none;
        /* Chrome/Safari/WebKit */
    }

    @keyframes circleAnimation {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    /* If you want the same breakpoints as your old "max-width: 600px" rule,
   you can keep it here, or define a custom screen in tailwind.config.js. */
    @media (max-width: 600px) {
        .w-\[40rem\] {
            width: 100% !important;
        }

        .w-\[40rem\].attachedFilesWrapper {
            width: 100% !important;
        }

        .flex.flex-col.gap-\[10px\].relative {
            width: 80% !important;
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
        margin-bottom: 0;
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
