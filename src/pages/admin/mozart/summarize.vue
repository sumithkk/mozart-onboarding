<template>
    <div class="relative flex h-full w-full flex-1 flex-col items-center justify-start overflow-hidden px-[50px]">
        <div class="flex h-[90vh] w-full flex-row overflow-x-hidden overflow-y-auto">
            <div class="m-5 flex w-1/2 flex-col">
                <!-- File Viewer Container -->
                <div v-if="pageSectionExpanded('file-viewer')" class="flex h-full flex-col overflow-x-hidden overflow-y-auto rounded-lg border-2 border-neutral-300">
                    <!-- Minimize container -->
                    <div class="flex cursor-pointer items-center justify-end" @click="togglePageSection('file-viewer')">
                        <div class="materialSymbolsOutlined p-1">expand_circle_down</div>
                    </div>

                    <!-- File Viewer Header -->
                    <div class="m-5 flex flex-row items-center justify-between gap-5">
                        <div class="flex flex-row items-center gap-5">
                            <Dropdown class="w-40" :options="sourceOptions" placeholder="Source" label="Source" :defaultValue="source" v-model="source" />
                            <div class="flex items-center justify-between gap-2 rounded-lg border border-neutral-300 bg-neutral-200 px-4 py-2 text-neutral-700">
                                <input type="text" placeholder="Search" class="bg-transparent text-sm text-neutral-700 outline-none" v-model="searchText" />
                                <div class="materialSymbolsOutlined text-neutral-500">search</div>
                            </div>
                            <Dropdown class="w-40" :options="modelOptions" placeholder="Model" label="Model" :defaultValue="model" v-model="model" />
                        </div>
                    </div>

                    <hr class="mx-5 border-t border-mozart-blue-500" />

                    <!-- Right-side items -->
                    <div class="mt-5 ml-5 flex w-full items-center justify-start gap-2">
                        <!-- Document View Switches -->
                        <div class="flex gap-2">
                            <div class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-400 text-lg transition hover:opacity-80" :class="{ 'bg-mozart-blue-500 text-white': documentViewerView == 'table' }" @click="switchDocumentView('table')">
                                <div class="materialSymbolsFilled">reorder</div>
                            </div>
                            <div class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-400 text-lg transition hover:opacity-80" :class="{ 'bg-mozart-blue-500 text-white': documentViewerView == 'widget' }" @click="switchDocumentView('widget')">
                                <div class="materialSymbolsFilled">widgets</div>
                            </div>
                        </div>
                        <Dropdown class="!w-[90px]" :options="pageCountOptions" placeholder="Row count" label="Row count" :defaultValue="totalRecordsPerPage.toString()" v-model="totalRecordsPerPage" />
                        <input type="text" v-model="summaryPages" class="h-[42px] w-[20%] rounded-lg border-2 border-neutral-300 px-3 outline-none" placeholder="Page Range" @input="validatePageRange" :class="{ 'border-red-500': !isPageRangeValid }" :title="pageRangeTooltip" />
                        <VTooltip placement="top" :distance="8">
                            <div class="materialSymbolsOutlined cursor-pointer text-neutral-500">info</div>
                            <template #popper>You can select up to 20 pages</template>
                        </VTooltip>
                        <Button buttonText="Summarize" class="h-[42px] w-[140px] px-2 disabled:bg-neutral-300" :disabled="isSummarizeDisabled" :class="{ 'bg-mozart-blue-500 text-white': !isSummarizeDisabled }" @click="summarizeDocument" />
                    </div>

                    <!-- Widget (Grid) View -->
                    <div v-if="documentViewerView == 'widget'" class="mt-3 grid grid-cols-2 gap-4 p-3">
                        <!-- Workbench -->
                        <div v-if="source == 'workbench'" v-for="file in workbenchRecords" :key="file.id" class="relative m-2 cursor-pointer rounded-lg bg-neutral-100 p-3" :class="{ 'border-2 border-mozart-blue-500': isSelected(file.id), 'border border-neutral-300': !isSelected(file.id) }" @click="selectFileForVectorization(file.id, file.name)" @dblclick="viewDocument(file.url ?? '')">
                            <div class="absolute top-0 left-0 rounded-br-lg bg-mozart-blue-500 px-2 py-1 text-xs text-white">
                                {{ convertMimeTypeToType(file.mimeType) }}
                            </div>
                            <div class="mb-3 h-52 overflow-hidden rounded-lg">
                                <div v-if="file.filePreviewUrl">
                                    <img class="h-full w-full object-cover" :src="file.filePreviewUrl" alt="Preview" />
                                </div>
                                <div v-else class="flex h-full flex-col items-center justify-center border-4 border-dashed border-neutral-400">
                                    <span class="text-xl text-mozart-blue">
                                        {{ convertMimeTypeToType(file.mimeType) }}
                                    </span>
                                </div>
                            </div>
                            <div class="truncate text-neutral-800">{{ file.name }}</div>
                            <div class="text-xs text-neutral-600">
                                {{ formatBytes(file.size) }}
                            </div>
                        </div>

                        <!-- Summary -->
                        <div v-if="source == 'summary'" v-for="file in summaryRecords" :key="file.summaryId" class="relative m-2 cursor-pointer rounded-lg bg-neutral-100 p-3" :class="{ 'border-2 border-mozart-blue-500': isSelected(file.summaryId), 'border border-neutral-300': !isSelected(file.summaryId) }" @click="showSummaryFile(file)">
                            <div class="absolute top-0 left-0 rounded-br-lg bg-mozart-blue-500 px-2 py-1 text-xs text-white">
                                {{ file.fileType }}
                            </div>
                            <div class="mb-3 h-52 overflow-hidden rounded-lg">
                                <div v-if="file.filePreviewUrl">
                                    <img class="h-full w-full object-cover" :src="file.filePreviewUrl" alt="Preview" />
                                </div>
                                <div v-else class="flex h-full flex-col items-center justify-center border-4 border-dashed border-neutral-400">
                                    <span class="text-xl text-mozart-blue">
                                        {{ file.fileType }}
                                    </span>
                                </div>
                            </div>
                            <div class="truncate text-neutral-800">{{ file.fileName }}</div>
                            <div class="text-xs text-neutral-600">
                                {{ formatBytes(file.fileSize) }}
                            </div>
                            <!-- Action Menu -->
                            <div class="absolute right-2 bottom-2 cursor-pointer">
                                <DropdownMenu :options="documentActionMenuDropdownOptions" :isActive="file.summaryId == activeDocumentDropdownId" :position="dropdownPosition" :dropdownId="file.summaryId" :outSideClicked="outSideClicked" @itemClicked="(x) => handleDropdownMenuItemClicked(x, file.summaryId, file)">
                                    <div class="materialSymbolsFilled" @click="onActiveConversationDropdownChange(file.summaryId)">more_vert</div>
                                </DropdownMenu>
                            </div>
                        </div>

                        <!-- Google Drive -->
                        <div v-if="source == 'google-drive'" v-for="file in googleDriveRecords" :key="file.documentId" class="relative m-2 cursor-pointer rounded-lg bg-neutral-100 p-3" :class="{ 'border-2 border-mozart-blue-500': isSelected(file.url), 'border border-neutral-300': !isSelected(file.url) }" @click="selectFileForVectorization(file.url, file.name)" @dblclick="viewDocument(file.url)">
                            <div class="absolute top-0 left-0 rounded-br-lg bg-mozart-blue-500 px-2 py-1 text-xs text-white">
                                {{ convertMimeTypeToType(file.mimeType) }}
                            </div>
                            <div class="mb-3 h-52 overflow-hidden rounded-lg">
                                <div v-if="file.filePreviewUrl">
                                    <img class="h-full w-full object-cover" :src="file.filePreviewUrl" alt="Preview" />
                                </div>
                                <div v-else class="flex h-full flex-col items-center justify-center border-4 border-dashed border-neutral-400">
                                    <span class="text-xl text-mozart-blue">
                                        {{ convertMimeTypeToType(file.mimeType) }}
                                    </span>
                                </div>
                            </div>
                            <div class="truncate text-neutral-800">{{ file.name }}</div>
                            <div class="text-xs text-neutral-600">
                                {{ formatBytes(Number(file.size)) }}
                            </div>
                        </div>

                        <!-- Notes -->
                        <div v-if="source == 'notes'" v-for="note in workbenchNotesRecords" :key="note.noteId" class="relative m-2 cursor-pointer rounded-lg border border-neutral-300 bg-neutral-200 p-3" :class="{ 'border-2 border-mozart-blue-500': isNoteSelected(note) }" @click="selectNotesForVectorization(note)">
                            <span class="mb-1 block truncate text-base font-medium">
                                {{ note.title }}
                            </span>
                            <button class="rounded bg-mozart-blue-500 px-3 py-1 text-sm text-white hover:bg-mozart-blue-600 disabled:bg-neutral-300" @click.stop="toggleNoteMetadataPopup(note)">Edit Metadata</button>
                        </div>

                        <!-- Azure Blob -->
                        <div v-if="source == 'azure-blob'" v-for="file in ragUserFilesRecords" :key="file.name" class="relative m-2 cursor-pointer rounded-lg bg-neutral-100 p-3" :class="{ 'border-2 border-mozart-blue-500': isSelected(file.url), 'border border-neutral-300': !isSelected(file.url) }" @click="selectFileForVectorization(file.url, file.name)" @dblclick="viewDocument(file.url)">
                            <div class="absolute top-0 left-0 rounded-br-lg bg-mozart-blue-500 px-2 py-1 text-xs text-white">
                                {{ file.name.split(".").pop()?.toUpperCase() }}
                            </div>
                            <div class="mb-3 h-52 overflow-hidden rounded-lg">
                                <div v-if="file.filePreviewUrl">
                                    <img class="h-full w-full object-cover" :src="file.filePreviewUrl" alt="Preview" />
                                </div>
                                <div v-else class="flex h-full flex-col items-center justify-center border-4 border-dashed border-neutral-400">
                                    <span class="text-xl text-mozart-blue">
                                        {{ file.name.split(".").pop()?.toUpperCase() }}
                                    </span>
                                </div>
                            </div>
                            <div class="truncate text-neutral-800">{{ file.name }}</div>
                            <div class="text-xs text-neutral-600">
                                {{ formatBytes(file.size) }}
                            </div>
                        </div>

                        <!-- Google Sheets -->
                        <div v-if="source == 'google-sheets'" v-for="file in googleSheetsRecords" :key="file.CaseName" class="relative m-2 cursor-pointer rounded-lg bg-neutral-200 p-3" :class="{ 'border-2 border-mozart-blue-500': isJsonSelected(file.CaseName), 'border border-neutral-300': !isJsonSelected(file.CaseName) }" @click="selectJsonForVectorization(file, file.CaseName)">
                            <span class="mb-1 block truncate text-base font-medium">
                                {{ file.CaseName }}
                            </span>
                            <span class="block text-xs text-neutral-500">File Type: Google Forms</span>
                            <a href="#" class="text-xs text-blue-500 underline" @click.prevent="openJsonInNewTab(file)"> Open </a>
                        </div>
                    </div>

                    <SummarizeTableN v-if="documentViewerView == 'table'" :data="tableRecordsData" @rowSelected="onTableRowSelected" />
                </div>

                <!-- Minimized File Viewer -->
                <div class="flex cursor-pointer flex-row items-center justify-between rounded-lg border-2 border-neutral-300 px-4 py-2" v-else>
                    <h2 class="text-lg font-medium">File Viewer</h2>
                    <div class="materialSymbolsOutlined p-1" @click="togglePageSection('file-viewer')">expand_circle_up</div>
                </div>
            </div>

            <!-- File Summary Container -->
            <div class="m-5 flex w-1/2 flex-col">
                <div v-if="pageSectionExpanded('file-summary')" class="flex h-full flex-col overflow-x-hidden overflow-y-auto rounded-lg border-2 border-neutral-300">
                    <div class="flex cursor-pointer items-center justify-end" @click="togglePageSection('file-summary')">
                        <div class="materialSymbolsOutlined p-1">expand_circle_down</div>
                    </div>
                    <div class="m-5 flex flex-row items-center justify-between gap-5">
                        <div class="flex flex-row items-center gap-2">
                            <Button buttonText="Save Summary" class="h-[42px] w-[140px] px-2 disabled:bg-neutral-300" :disabled="!summary || source == 'summary'" :class="{ 'bg-mozart-blue-500 text-white': summary }" @click="handleSave" />
                        </div>
                        <div class="flex w-[220px] flex-col">
                            <ProgressBar :progress="vectorizationProgress" />
                        </div>
                    </div>
                    <hr class="mx-5 border-t border-mozart-blue-500" />
                    <div class="overflow-y-auto p-2">
                        <!-- <div v-html="marked.parse(summary, { ...defaults, gfm: true, breaks: true, renderer })"></div> -->
                        <div v-for="item in summary as any" :key="item.page" class="mb-6 w-full rounded-lg bg-white p-4 shadow-md dark:bg-neutral-800">
                            <h2 class="text-xl font-semibold text-neutral-900 dark:text-white">Summary for Page {{ item.page }}</h2>
                            <p class="my-2 text-neutral-700 dark:text-neutral-300">{{ item.summary }}</p>
                            <div class="mt-4 flex items-center justify-between">
                                <span class="text-sm text-neutral-500 dark:text-neutral-400">Source:</span>
                                <span class="text-sm text-neutral-500 dark:text-neutral-400">{{ item.fileType }}: {{ item.fileName }}</span>
                            </div>
                            <div class="mt-1 flex items-center justify-between">
                                <span class="text-sm text-neutral-500 dark:text-neutral-400">File Size:</span>
                                <span class="text-sm text-neutral-500 dark:text-neutral-400">{{ (item.fileSize / 1024).toFixed(2) }} KB</span>
                            </div>
                            <div class="mt-1 flex items-center justify-between">
                                <span class="text-sm text-neutral-500 dark:text-neutral-400">Page URL:</span>
                                <a :href="item.pageUrl" class="text-mozart-blue-500 underline dark:text-mozart-blue-400" target="_blank" rel="noopener noreferrer">View Page</a>
                            </div>
                            <div class="mt-1 flex items-center justify-between">
                                <span class="text-sm text-neutral-500 dark:text-neutral-400">File URL:</span>
                                <a :href="item.fileUrl" class="text-mozart-blue-500 underline dark:text-mozart-blue-400" target="_blank" rel="noopener noreferrer">Download File</a>
                            </div>
                            <p class="mt-4 w-full break-words text-neutral-500 dark:text-neutral-400"><strong>Source Text:</strong> {{ item.source }}</p>
                        </div>
                    </div>
                </div>

                <!-- Minimized File Summary -->
                <div class="flex cursor-pointer flex-row items-center justify-between rounded-lg border-2 border-neutral-300 px-4 py-2" v-else>
                    <h2 class="text-lg font-medium">File Summary</h2>
                    <div class="materialSymbolsOutlined p-1" @click="togglePageSection('file-summary')">expand_circle_up</div>
                </div>
            </div>
        </div>

        <!-- Note Metadata Popup -->
        <NoteMetadataPopup :show="showNoteMetadataPopup" :note="selectedNoteForVectorization" @update:show="toggleNoteMetadataPopup" @addMetadata="addNoteMetadata" />

        <!-- RAG File Format - JSON -->
        <RAGFileFormat
            v-if="showFormatError && fileFormat === 'JSON'"
            :show="showFormatError"
            :shortName="shortName"
            :title="title"
            :subtitle="subtitle"
            :confirmButtonText="confirmButtonText"
            :confirmButtonColor="confirmButtonColor"
            :closeOnTopRight="closeOnTopRight"
            @update:show="handleFileUploadShow"
            @buttonClick="handleFileUploadButtonClick"
            :fileFormatError="fileFormatError"
            :correctJsonFormatString="correctJsonFormatString"
        />

        <!-- RAG File Format - CSV -->
        <RAGFileFormat
            v-if="showFormatError && fileFormat === 'CSV'"
            :show="showFormatError"
            :shortName="shortName"
            :title="title"
            :subtitle="subtitle"
            :confirmButtonText="confirmButtonText"
            :confirmButtonColor="confirmButtonColor"
            :closeOnTopRight="closeOnTopRight"
            @update:show="handleFileUploadShow"
            @buttonClick="handleFileUploadButtonClick"
            :fileFormatError="fileFormatErrorCSV"
            :correctJsonFormatString="sampleCSVFormat"
        />
    </div>
</template>

<script setup lang="ts">
    import { convertMimeTypeToType, formatBytes, formatDate, trimTitle } from "~/util"
    import eventBus from "~/util/eventBus"
    import { sampleJsonFormat, sampleCSVFormat } from "~/util/staticData"
    import { marked } from "marked"
    const { showConfirmModal } = useModal()
    const props = defineProps({
        isMobile: Boolean,
    })

    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })
    useHead({
        title: "Vectorize",
    })

    const rag = useRag()
    const ragStore = useRagStore()
    const userStore = useUserStore()
    const documentStore = useDocumentsStore()
    const fileSystemStore = useFileSystemStore()
    const organizationStore = useOrganizationStore()

    const user = useUser()

    const renderer = new marked.Renderer()
    const { extensions, ...defaults } = marked.getDefaults()

    // For code blocks with simple backticks
    renderer.codespan = (code) => {
        return `<code>${code.replaceAll("&amp;", "&")}</code>`
    }
    renderer.link = (href, title, text) => {
        return `<a href="${href}" target="_blank">${text}</a>`
    }

    const sourceOptions = ref([
        { text: "Workbench", value: "workbench" },
        //{ text: "Staging Bucket", value: "azure-blob" },
        { text: "Google Drive", value: "google-drive" },
        { text: "Notes", value: "notes" },
        //{ text: "Google Sheets", value: "google-sheets" },
        { text: "Summary", value: "summary" },
    ])
    const modelOptions = ref([
        { text: "GPT 4o", value: "gpt-4o-2024-05-13" },
        { text: "GPT-4o-mini", value: "gpt-4o-mini" },
    ])
    const source = ref<string>("workbench")
    const model = ref<string>("gpt-4o-mini")
    const summaryText = ref("")
    const summary = ref("")
    const searchText = ref("")
    const chunkSize = ref<number>(600)
    const batchSize = ref(1000)
    const chunkType = ref<string>("char")
    const currentStreamPromise = ref<Promise<void> | null>(null)
    const cancelStream = ref<(() => void) | null>(null)
    const isStreamingActive = ref(false)
    const summaryPages = ref("")
    const isPageRangeValid = ref(true)
    const activeSummaryDocument = ref<any[]>([])
    const pageRangeTooltip = computed(() => {
        return isPageRangeValid.value ? "Valid page range: 1, 1-5, or 1,3,5 (max 10 pages)" : "Invalid range! Enter a valid page range like '1', '1-5', or '1,3,5' (max 10 pages)"
    })
    const documentActionMenuDropdownOptions = [
        [
            {
                label: "Open",
                icon: "open_in_browser",
            },
            {
                label: "Edit",
                icon: "edit",
            },
            {
                label: "Download",
                icon: "download",
            },
            {
                label: "Delete",
                icon: "delete",
            },
        ],
    ]
    const dropdownPosition = ref("bottomStart")
    const activeDocumentDropdownId = ref<string | null>(null)
    const ragUserFilesData = ref<any>(ragStore.ragUserFilesData)
    const selectedNoteForVectorization = ref<INote>()
    const sortData = ref<any>({
        name: false,
        createdAt: false,
    })
    const googleSheetsRecords = ref<any[]>([])
    const sortNameDesc = ref(false)
    const sortCreatedAtDesc = ref(false)
    const showNoteMetadataPopup = ref(false)
    const ragUserFilesRecords: any = computed(() => {
        const ragUserFiles = Object.values(ragUserFilesData.value).filter((file: any) => file.name.toLowerCase().includes(searchText.value.toLowerCase()))
        ragUserFiles.sort((a: any, b: any) => {
            if (sortData.value.name) {
                if (sortNameDesc.value) {
                    return a.name.localeCompare(b.name)
                } else {
                    return b.name.localeCompare(a.name)
                }
            }
            if (sortData.value.createdAt) {
                if (sortCreatedAtDesc.value) {
                    return a.lastModified.localeCompare(b.lastModified)
                } else {
                    return b.lastModified.localeCompare(a.lastModified)
                }
            }
        })
        sortData.value.name = false
        sortData.value.createdAt = false
        const startIndex = (currentPage.value - 1) * totalRecordsPerPage.value
        const endIndex = startIndex + Number(totalRecordsPerPage.value)
        return ragUserFiles.slice(startIndex, endIndex)
    })
    const fileInput = ref<HTMLElement | null>(null)
    const fileInputBulk = ref<HTMLElement | null>(null)
    const metadataForNote = ref<any>({})
    const documentViewerView = ref("widget")
    const currentPage = ref(1)
    const totalRecordsPerPage = ref(5)
    const pageCountOptions = ref([
        { text: "5", value: 5 },
        { text: "10", value: 10 },
        { text: "25", value: 25 },
        { text: "50", value: 50 },
        { text: "100", value: 100 },
    ])
    const shortName = ref("Upload")
    const confirmButtonText = ref("Download")
    const confirmButtonColor = ref("#3d67f9")
    const closeOnTopRight = ref(true)
    const title = ref("File name Update")
    const subtitle = ref("Add the file name")
    const showFormatError = ref(false)
    const fileFormat = ref("JSON")
    const fileFormatError = ref("JSON")
    const fileFormatErrorCSV = ref("CSV")
    const correctJsonFormat = [
        {
            text: "string",
            metadata: {
                source_filename: "string",
                section: "string",
                facts: "object",
                laws: "object",
            },
        },
    ]
    const totalPages = computed(() => {
        if (source.value == "workbench") {
            let records = Object.values(fileSystemStore.filesAndFolders).filter((document: any) => {
                if (searchText.value) {
                    return document.name.toLowerCase().includes(searchText.value.toLowerCase()) && document.mimeType === "application/pdf"
                }
                return document.mimeType === "application/pdf"
            }).length
            return records <= totalRecordsPerPage.value ? 1 : Math.ceil(records / totalRecordsPerPage.value)
        } else if (source.value == "summary") {
            let records = Object.values(ragStore.summaries).filter((summary: any) => {
                if (searchText.value) {
                    return summary.title.toLowerCase().includes(searchText.value.toLowerCase())
                }
                return true
            }).length
            return records <= totalRecordsPerPage.value ? 1 : Math.ceil(records / totalRecordsPerPage.value)
        } else if (source.value == "notes") {
            let records = Object.values(documentStore.notes).filter((note: any) => {
                if (searchText.value) {
                    return note.title.toLowerCase().includes(searchText.value.toLowerCase())
                }
                return true
            }).length
            return records <= totalRecordsPerPage.value ? 1 : Math.ceil(records / totalRecordsPerPage.value)
        } else if (source.value == "google-drive") {
            const googleDriveFiles = fileSystemStore.filesAndFolders.filter((file: any) => file.source && file.source.id === "google-drive" && file.mimeType === "application/pdf")
            if (!googleDriveFiles) return 1

            let records = googleDriveFiles.filter((file: any) => {
                if (searchText.value) {
                    return file.name.toLowerCase().includes(searchText.value.toLowerCase())
                }
                return true
            }).length
            return records <= totalRecordsPerPage.value ? 1 : Math.ceil(records / totalRecordsPerPage.value)
        } else {
            let records = Object.values(ragUserFilesData.value).filter((file: any) => file.name.toLowerCase().includes(searchText.value.toLowerCase())).length
            return records <= totalRecordsPerPage.value ? 1 : Math.ceil(records / totalRecordsPerPage.value)
        }
    })

    const vectorizationProgress = ref(0)
    const currentCollectionInfo = computed(() => {
        return ragStore.collections.find((collection: any) => collection.name === ragStore.currentCollection)
    })
    const tableRecordsData = computed(() => {
        if (source.value == "workbench") {
            return workbenchRecords.value
        } else if (source.value == "summary") {
            return summaryRecords.value
        } else if (source.value == "notes") {
            return workbenchNotesRecords.value
        } else if (source.value == "google-drive") {
            return googleDriveRecords.value
        } else {
            return []
        }
    })
    const workbenchRecords = computed(() => {
        const files = Object.values(fileSystemStore.filesAndFolders).filter((doc: any) => {
            return !doc.source && doc.mimeType === "application/pdf"
        })

        files.filter((doc: any) => {
            const matchesSearch = !searchText.value || doc.name.toLowerCase().includes(searchText.value.toLowerCase())

            return matchesSearch
        })
        if (sortData.value.name) {
            files.sort((a: any, b: any) => (sortNameDesc.value ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)))
        }

        if (sortData.value.createdAt) {
            files.sort((a: any, b: any) => (sortCreatedAtDesc.value ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()))
        }
        const startIndex = (currentPage.value - 1) * totalRecordsPerPage.value
        const endIndex = startIndex + Number(totalRecordsPerPage.value)
        return files.slice(startIndex, endIndex)
    })

    const googleDriveRecords = computed<any[]>(() => {
        const files = fileSystemStore.filesAndFolders.filter((file: any) => {
            if (file.source && file.source.id === "google-drive" && file.mimeType === "application/pdf") {
                if (searchText.value) {
                    return file.name.toLowerCase().includes(searchText.value.toLowerCase())
                }
                return true
            }
            return false
        })
        if (!files) return []
        files.sort((a: any, b: any) => {
            if (sortData.value.name) {
                if (sortNameDesc.value) {
                    return a.name.localeCompare(b.name)
                } else {
                    return b.name.localeCompare(a.name)
                }
            }
            if (sortData.value.createdAt) {
                if (sortCreatedAtDesc.value) {
                    return a.createdAt.localeCompare(b.createdAt)
                } else {
                    return b.createdAt.localeCompare(a.createdAt)
                }
            }
            return 0
        })
        sortData.value.name = false
        sortData.value.createdAt = false
        const startIndex = (currentPage.value - 1) * totalRecordsPerPage.value
        const endIndex = startIndex + Number(totalRecordsPerPage.value)
        return files.slice(startIndex, endIndex)
    })
    const workbenchNotesRecords = computed(() => {
        const workbenchItems = Object.values(documentStore.notes).filter((note) => {
            if (searchText.value) {
                return note.title.toLowerCase().includes(searchText.value.toLowerCase())
            }
            return true
        })
        workbenchItems.sort((a, b) => {
            if (sortData.value.name) {
                if (sortNameDesc.value) {
                    return a.title.localeCompare(b.title)
                } else {
                    return b.title.localeCompare(a.title)
                }
            }
            if (sortData.value.createdAt) {
                if (sortCreatedAtDesc.value) {
                    return a.updatedAt - b.updatedAt
                } else {
                    return b.updatedAt - a.updatedAt
                }
            }
            return 0
        })
        sortData.value.name = false
        sortData.value.createdAt = false
        const startIndex = (currentPage.value - 1) * totalRecordsPerPage.value
        const endIndex = startIndex + Number(totalRecordsPerPage.value)
        return workbenchItems.slice(startIndex, endIndex)
    })
    const selectedFile = ref<any>(null)
    const pageSections = ref<any>({
        "file-viewer": true,
        "embedding-setting": true,
        "file-summary": true,
        metadata: true,
    })

    const selectedFileTitle = ref("")

    const selectedFiles = ref<any>([])
    const selectedNotes = ref<any>([])
    const selectedJson = ref<any>([])
    const pageSectionExpanded = (section: string) => {
        return pageSections.value[section]
    }

    const togglePageSection = (section: string) => {
        pageSections.value[section] = !pageSections.value[section]
    }
    const isSelected = (url: string) => {
        return selectedFiles.value.some((file: any) => file.url === url)
    }
    watchEffect(() => {
        ragUserFilesData.value = ragStore.ragUserFilesData
    })
    watch(source, () => {
        currentPage.value = 1
        sortData.value.name = false
        sortData.value.createdAt = false
    })
    watch(model, () => {
        if (cancelStream.value) {
            cancelStream.value()
            cancelStream.value = null
        }
    })
    const switchDocumentView = (view: string) => {
        documentViewerView.value = view
    }
    const toggleNextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value = currentPage.value + 1
        }
    }
    const togglePrevPage = () => {
        if (currentPage.value > 1) {
            currentPage.value = currentPage.value - 1
        }
    }

    const toggleNoteMetadataPopup = (note: INote) => {
        showNoteMetadataPopup.value = !showNoteMetadataPopup.value
        selectedNoteForVectorization.value = note
    }
    const addNoteMetadata = (metadata: any) => {
        metadataForNote.value = { ...metadataForNote.value, [metadata.noteId]: metadata }
        showNoteMetadataPopup.value = false
    }
    const selectFileForVectorization = (url: any, name: any) => {
        const existingIndex = selectedFiles.value.findIndex((file: any) => file.url === url)
        if (existingIndex > -1) {
            selectedFiles.value = []
        } else {
            selectedFiles.value = [{ url, name }]
        }
    }
    const selectNotesForVectorization = (note: INote) => {
        if (selectedNotes.value.includes(note)) {
            return (selectedNotes.value = selectedNotes.value.filter((n: any) => n !== note))
        }
        return selectedNotes.value.push(note)
    }
    const isNoteSelected = (note: INote) => {
        return selectedNotes.value.includes(note)
    }
    const openJsonInNewTab = (file: any) => {
        const jsonString = JSON.stringify(file, null, 2)
        const blob = new Blob([jsonString], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const newTab = window.open(url, "_blank")
        if (newTab) {
            newTab.focus()
        }
    }
    const selectJsonForVectorization = (file: any, name: any) => {
        const existingIndex = selectedJson.value.findIndex((file: any) => file.CaseName === name)
        if (existingIndex > -1) {
            selectedJson.value.splice(existingIndex, 1)
        } else {
            selectedJson.value.push(file)
        }
    }
    const isJsonSelected = (name: string) => {
        return selectedJson.value.some((file: any) => file.CaseName === name)
    }

    const correctJsonFormatString = JSON.stringify(correctJsonFormat, null, 2)

    async function handleFileUploadButtonClick(button: string) {
        showFormatError.value = !showFormatError.value
        let blob
        let url
        let a = document.createElement("a")

        if (fileFormat.value === "JSON") {
            const jsonString = JSON.stringify(sampleJsonFormat, null, 2)
            blob = new Blob([jsonString], { type: "application/json" })
            url = URL.createObjectURL(blob)
            a.href = url
            a.download = "sampleJsonFormat.json"
        } else if (fileFormat.value === "CSV") {
            blob = new Blob([sampleCSVFormat], { type: "text/csv" })
            url = URL.createObjectURL(blob)
            a.href = url
            a.download = "sampleCSVFormat.csv"
        } else {
            console.error("Unsupported file format")
            return
        }

        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    async function handleFileUploadShow(button: string) {
        showFormatError.value = !showFormatError.value
    }

    const viewDocument = (url: string) => {
        if (!url) return
        window.open(url, "_blank")
    }
    async function summarizeDocument() {
        validatePageRange()

        // If the page range is invalid, return early
        if (!isPageRangeValid.value) {
            return console.error("Invalid page range")
        }

        if (cancelStream.value) {
            cancelStream.value()
            cancelStream.value = null
        }

        vectorizationProgress.value = 10
        const progressTarget = 80
        const progressStep = 1
        const progressInterval = 500
        let completedTasks = 0
        summary.value = ""
        selectedFileTitle.value = ""
        let fullSummaryText: string = ""

        const progressTimer = setInterval(() => {
            if (vectorizationProgress.value < progressTarget) {
                vectorizationProgress.value += progressStep
            } else {
                clearInterval(progressTimer)
            }
        }, progressInterval)

        for (const file of selectedFiles.value) {
            await useRag().summarizeDocumentForUser(summaryPages.value, model.value, userStore.userId, file, currentCollectionInfo.value?.embedding, currentCollectionInfo.value?.distance, chunkSize.value, chunkType.value, (parsedBatch: string) => {
                summary.value += parsedBatch
            })
            fullSummaryText = ragStore.summaryStream
            selectedFileTitle.value = file.name
            completedTasks++
        }
        isStreamingActive.value = true
        currentStreamPromise.value = streamSummary(fullSummaryText)
        clearInterval(progressTimer)
        vectorizationProgress.value = 100
        summary.value = JSON.parse(summary.value.trim().split("```json")[1].split("```")[0])
    }
    function streamSummary(fullSummaryText: string): Promise<void> {
        return new Promise((resolve, reject) => {
            cancelStream.value = () => {
                isStreamingActive.value = false
                reject()
                summary.value = ""
                selectedFileTitle.value = ""
                vectorizationProgress.value = 0
            }

            const stream = () => {
                if (!isStreamingActive.value) {
                    return
                }

                try {
                    let jsonText = fullSummaryText.replace(/^\s*```json\s*/, "").replace(/\s*```\s*$/, "")
                    let data = JSON.parse(jsonText)
                    data.sort((a: any, b: any) => a.page - b.page)
                    let sortedJsonText = JSON.stringify(data, null, 2)
                    sortedJsonText = "```json\n" + sortedJsonText + "\n```"
                    summary.value = sortedJsonText
                } catch (error) {
                    console.error("Failed to parse or sort summary data:", error)
                    summary.value = fullSummaryText
                }

                isStreamingActive.value = false
                resolve()
            }
            stream()
        })
    }
    const handleSave = async () => {
        await rag.storeSummary(summary.value, organizationStore.currentOrganizationId, selectedFileTitle.value)
        await getSummary()
    }
    const getSummary = async () => {
        await rag.getSummary(organizationStore.currentOrganizationId)
    }
    const summaryRecords = computed(() => {
        const workbenchItems = Object.values(ragStore.summaries)
            .map((summary: any) => {
                const firstItem = summary.content[0] || {}

                return {
                    ...firstItem,
                    summaryId: summary.summaryId,
                    userId: summary.userId,
                    name: summary.name,
                    createdAt: summary.createdAt,
                    updatedAt: summary.updatedAt,
                    owner: summary.owner,
                }
            })
            .filter((item) => {
                if (searchText.value) {
                    return item.fileName.toLowerCase().includes(searchText.value.toLowerCase()) && item.fileType.toLowerCase() === "pdf"
                }
                return item.fileType.toLowerCase() === "pdf"
            })

        workbenchItems.sort((a, b) => {
            if (sortData.value.name) {
                if (sortNameDesc.value) {
                    return a.fileName.localeCompare(b.fileName)
                } else {
                    return b.fileName.localeCompare(a.fileName)
                }
            }
            if (sortData.value.createdAt) {
                if (sortCreatedAtDesc.value) {
                    return a.createdAt - b.createdAt
                } else {
                    return b.createdAt - a.createdAt
                }
            }
            return 0
        })

        sortData.value.name = false
        sortData.value.createdAt = false

        const startIndex = (currentPage.value - 1) * totalRecordsPerPage.value
        const endIndex = startIndex + Number(totalRecordsPerPage.value)
        return workbenchItems.slice(startIndex, endIndex)
    })
    async function handleDropdownMenuItemClicked(data: any, documentId: string, file: any) {
        const action = data.label.toLowerCase()
        activeDocumentDropdownId.value = null
        if (action === "delete") {
            await deleteDocument(documentId)
        } else if (action === "rename") {
        } else if (action === "download") {
            if (source.value === "summary") {
                await downloadJSONDocument(activeSummaryDocument.value, activeSummaryDocument.value[0].fileName)
            } else {
                downloadDocument(file)
            }
        }
    }
    async function deleteDocument(documentId: string) {
        const askForConfirmation = await showConfirmModal({
            shortName: "Delete File",
            title: "Are you sure you want to delete this file?",
            subtitle: "This action is permanent and cannot be undone.",
            confirmButtonText: "Delete",
            confirmButtonColor: "#FF5555",
            closeOnTopRight: true,
        })
        if (askForConfirmation === "confirm") {
            await rag.deleteSummary(documentId, organizationStore.currentOrganizationId)
            getSummary()
        }
    }
    function onActiveConversationDropdownChange(newValue: string) {
        if (activeDocumentDropdownId.value === newValue) {
            activeDocumentDropdownId.value = null
            return
        }
        activeDocumentDropdownId.value = newValue
    }
    function outSideClicked() {
        if (activeDocumentDropdownId.value === null) return
        activeDocumentDropdownId.value = null
    }

    function downloadDocument(data: any) {
        let fileName = data.name || "download"

        const extensions = [".pdf", ".csv", ".xlsx", ".sql", ".xls", ".doc", ".docx", ".py", ".txt"]

        const extensionFound = extensions.find((ext) => fileName.toLowerCase().endsWith(ext))
        if (extensionFound) {
            fileName = fileName.slice(0, -extensionFound.length)
        }

        const jsonData = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })

        const link = document.createElement("a")
        link.href = URL.createObjectURL(jsonData)
        link.download = fileName

        link.click()

        URL.revokeObjectURL(link.href)
    }

    const isSummarizeDisabled = computed(() => {
        const hasSummary = source.value === "summary"

        return hasSummary || (!selectedFiles.value.length && !selectedJson.value.length)
    })

    const validatePageRange = () => {
        const validRangePattern = /^[0-9,\-]+$/

        // Check if input is empty or matches valid pattern
        if (summaryPages.value === "" || !validRangePattern.test(summaryPages.value)) {
            isPageRangeValid.value = summaryPages.value === ""
            return
        }

        // Parse page range to count total pages
        const pageNumbers = new Set<number>()
        const ranges = summaryPages.value.split(",")

        for (const range of ranges) {
            const trimmedRange = range.trim()
            if (trimmedRange.includes("-")) {
                // Handle range like "1-5"
                const [start, end] = trimmedRange.split("-").map((num) => parseInt(num.trim()))
                if (start && end && start <= end) {
                    for (let i = start; i <= end; i++) {
                        pageNumbers.add(i)
                    }
                } else {
                    isPageRangeValid.value = false
                    return
                }
            } else {
                // Handle single page like "1"
                const pageNum = parseInt(trimmedRange)
                if (pageNum && pageNum > 0) {
                    pageNumbers.add(pageNum)
                } else {
                    isPageRangeValid.value = false
                    return
                }
            }
        }

        // Check if total pages exceed 10
        if (pageNumbers.size > 10) {
            isPageRangeValid.value = false
        } else {
            isPageRangeValid.value = true
        }
    }

    const showSummaryFile = (selectedSummary: any) => {
        const existingIndex = selectedFiles.value.findIndex((file: any) => file.url === selectedSummary.summaryId)
        if (existingIndex > -1) {
            selectedFiles.value = []
            summary.value = ""
        } else {
            selectedFiles.value = [{ url: selectedSummary.summaryId, name: selectedSummary.fileName }]
            const fileObject = ragStore.summaries[selectedSummary.summaryId]
            summary.value = fileObject.content
            activeSummaryDocument.value = fileObject.content
        }
    }

    async function downloadJSONDocument(jsonData: any, filename: string) {
        if (!jsonData) {
            console.error("No JSON data to download")
            return
        }

        const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(jsonBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${filename}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    watch(source, async () => {
        summary.value = ""
    })

    onMounted(async () => {
        await fileSystemStore.fetchAllUserFiles()
        await documentStore.fetchNotes()
        getSummary()
    })

    function onTableRowSelected(record: any) {
        if (source.value === "workbench") {
            selectFileForVectorization(record.id, record.name)
            return
        }
        if (source.value === "summary") {
            showSummaryFile(record)
            return
        }
        if (source.value === "notes") {
            selectNotesForVectorization(record)
            return
        }
        if (source.value === "google-drive") {
            selectFileForVectorization(record.url, record.name)
            return
        }
    }
</script>
