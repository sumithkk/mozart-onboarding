<template>
    <div class="section-padding relative flex max-h-full w-full flex-col items-center justify-start overflow-x-hidden overflow-y-auto pt-0 pb-0 pb-5">
        <div class="relative flex w-full flex-col items-center justify-start px-4 pt-0 pb-0 sm:px-8 md:px-16 lg:px-28">
            <!-- Outer wrapper with vertical scrolling & hidden horizontal scroll -->
            <div class="flex h-full w-full flex-col overflow-x-hidden overflow-y-auto">
                <!-- FILE VIEWER SECTION -->
                <div class="my-5">
                    <!-- Expanded -->
                    <div v-if="pageSectionExpanded('file-viewer')" class="flex flex-col rounded-lg border-2 border-gray-200">
                        <!-- Minimize Button -->
                        <div class="flex cursor-pointer justify-end p-2" @click="togglePageSection('file-viewer')">
                            <div class="materialSymbolsOutlined">expand_circle_down</div>
                        </div>

                        <!-- File Viewer Header -->
                        <div class="file-viewer-header mx-2 my-3 flex flex-row items-center justify-between gap-5 sm:mx-5 sm:my-5">
                            <!-- Left group (source + search) -->
                            <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
                                <Dropdown class="w-40" :options="sourceOptions" placeholder="Source" label="Source" :defaultValue="source" v-model="source" />
                                <!-- Search box -->
                                <div class="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-2 text-gray-500 sm:w-auto dark:border-neutral-600 dark:bg-neutral-700">
                                    <input type="text" class="w-full border-none bg-transparent py-2 text-sm text-gray-700 focus:outline-none dark:text-white" placeholder="Search" v-model="searchText" />
                                    <div class="materialSymbolsOutlined text-gray-400">search</div>
                                </div>
                            </div>

                            <!-- Right group (upload actions) -->
                            <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
                                <!-- Supported files tooltip -->
                                <VTooltip>
                                    <div class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition hover:bg-gray-100 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-600">
                                        <div class="materialSymbolsOutlined">info</div>
                                        Supported Files
                                    </div>
                                    <template #popper>Supported Files: DOC, DOCX, PDF, TXT, CSV, JSON, SQL, HTML, PPTX</template>
                                </VTooltip>

                                <!-- Single upload button -->
                                <div class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition hover:bg-gray-100 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-600" @click="openFileBrowse">
                                    Upload file
                                    <div class="materialSymbolsOutlined">upload</div>
                                </div>

                                <!-- Bulk upload button -->
                                <div class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition hover:bg-gray-100 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-600" @click="openFileBrowseBulk">
                                    Bulk Upload
                                    <div class="materialSymbolsOutlined">upload</div>
                                </div>

                                <!-- Hidden input fields for uploads -->
                                <input style="display: none" id="file-input" type="file" @change="uploadDocument" ref="fileInput" />
                                <input style="display: none" id="file-input-bulk" type="file" @change="uploadDocumentBulk" ref="fileInputBulk" multiple />
                            </div>
                        </div>

                        <hr class="mx-2 border-t border-blue-400 sm:mx-5" />

                        <!-- Document View Switches -->
                        <div class="section-header mt-3 ml-2 flex items-center gap-3 sm:mt-5 sm:ml-5 sm:gap-5">
                            <!-- Switch between table and widget view -->
                            <div class="flex gap-2">
                                <div class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-300 text-xl transition dark:border-neutral-700" :class="documentViewerView === 'table' ? 'border-none bg-mozart-blue-500 text-white hover:bg-mozart-blue-700' : 'text-textColor border-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'" @click="switchDocumentView('table')">
                                    <div class="materialSymbolsFilled">reorder</div>
                                </div>
                                <div class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-300 text-xl transition dark:border-neutral-700" :class="documentViewerView === 'widget' ? 'border-none bg-mozart-blue-500 text-white hover:bg-mozart-blue-700' : 'text-textColor border-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'" @click="switchDocumentView('widget')">
                                    <div class="materialSymbolsFilled">widgets</div>
                                </div>
                            </div>

                            <!-- Page Count Dropdown -->
                            <Dropdown v-if="documentViewerView !== 'table'" class="w-20" :options="pageCountOptions" placeholder="Row count" label="Row count" :defaultValue="totalRecordsPerPage.toString()" v-model="totalRecordsPerPage" />
                        </div>

                        <!-- No files for Google Drive case -->
                        <div v-if="source == 'google-drive' && googleDriveRecords.length == 0" class="flex p-2 text-justify text-gray-700 dark:text-gray-300">No files found. Please check your Google Drive integration—it may be expired or not connected.</div>

                        <!-- WIDGET VIEW -->
                        <div v-if="documentViewerView == 'widget'" class="widget-grid mx-2 my-5 grid grid-cols-1 gap-4 sm:mx-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            <!-- WORKBENCH FILES -->
                            <div
                                v-if="source == 'workbench'"
                                v-for="file in workbenchRecords"
                                :key="file.id"
                                @click="selectFileForVectorization(file.url, file.name, file.size)"
                                @dblclick="viewDocument(file.url || '')"
                                class="relative cursor-pointer rounded-lg border bg-gray-50 p-3 transition dark:border-neutral-700 dark:bg-neutral-800"
                                :class="{
                                    'border-logoColor': isSelected(file.url || ''),
                                    'border-gray-300': !isSelected(file.url || ''),
                                }"
                            >
                                <!-- File Type badge -->
                                <div class="bg-logoColor absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 transform rounded-sm px-2 py-1 text-xs text-white">
                                    {{ convertMimeTypeToType(file.mimeType) }}
                                </div>

                                <!-- Preview / Placeholder -->
                                <div class="mb-3 flex h-48 items-center justify-center overflow-hidden rounded-sm bg-white dark:bg-neutral-700">
                                    <template v-if="file.filePreviewUrl">
                                        <img :src="file.filePreviewUrl" alt="Preview" class="h-full w-full object-cover" />
                                    </template>
                                    <template v-else>
                                        <div class="flex h-full w-full items-center justify-center border-2 border-gray-300 text-5xl text-blue-500 dark:border-neutral-600">
                                            <span>
                                                {{ convertMimeTypeToType(file.mimeType) }}
                                            </span>
                                        </div>
                                    </template>
                                </div>

                                <!-- Bottom info -->
                                <div class="flex flex-col">
                                    <div class="truncate text-sm font-semibold text-gray-700 dark:text-gray-100">
                                        {{ file.name }}
                                    </div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">
                                        {{ formatBytes(file.size) }}
                                    </div>
                                </div>
                            </div>

                            <!-- SUMMARY FILES -->
                            <div
                                v-if="source == 'summary'"
                                v-for="file in summaryRecords"
                                :key="file.summaryId"
                                @click="selectJsonSummaryForVectorization(file)"
                                @dblclick="viewDocument(file.viewDocumentUrl)"
                                class="relative cursor-pointer rounded-lg border bg-gray-50 p-3 transition dark:border-neutral-700 dark:bg-neutral-800"
                                :class="{
                                    'border-logoColor': isSelected(file.url),
                                    'border-gray-300': !isSelected(file.url),
                                }"
                            >
                                <!-- File Type badge -->
                                <div class="bg-logoColor absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 transform rounded-sm px-2 py-1 text-xs text-white">
                                    {{ file.fileType }}
                                </div>

                                <!-- Preview / Placeholder -->
                                <div class="mb-3 flex h-48 items-center justify-center overflow-hidden rounded-sm bg-white dark:bg-neutral-700">
                                    <template v-if="file.filePreviewUrl">
                                        <img :src="file.filePreviewUrl" alt="Preview" class="h-full w-full object-cover" />
                                    </template>
                                    <template v-else>
                                        <div class="flex h-full w-full items-center justify-center border-2 border-gray-300 text-5xl text-blue-500 dark:border-neutral-600">
                                            <span>
                                                {{ file.fileType }}
                                            </span>
                                        </div>
                                    </template>
                                </div>

                                <!-- Bottom info + More menu -->
                                <div class="flex items-center justify-between">
                                    <div class="flex flex-col">
                                        <div class="truncate text-sm font-semibold text-gray-700 dark:text-gray-100">
                                            {{ file.name }}
                                        </div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">
                                            {{ formatBytes(file.fileSize) }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- GOOGLE DRIVE FILES -->
                            <div
                                v-if="source == 'google-drive'"
                                v-for="file in googleDriveRecords"
                                :key="file.documentId"
                                @click="selectFileForVectorization(file.webContentLink, file.fileName, file.size)"
                                @dblclick="viewDocument(file.webViewLink)"
                                class="relative cursor-pointer rounded-lg border bg-gray-50 p-3 transition dark:border-neutral-700 dark:bg-neutral-800"
                                :class="{
                                    'border-logoColor': isSelected(file.webContentLink),
                                    'border-gray-300': !isSelected(file.webContentLink),
                                }"
                            >
                                <!-- File Type badge -->
                                <div class="bg-logoColor absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 transform rounded-sm px-2 py-1 text-xs text-white">
                                    {{ convertMimeTypeToType(file.mimeType) }}
                                </div>

                                <!-- Preview / Placeholder -->
                                <div class="mb-3 flex h-48 items-center justify-center overflow-hidden rounded-sm bg-white dark:bg-neutral-700">
                                    <template v-if="file.previewlink">
                                        <img :src="file.previewlink" alt="Preview" class="h-full w-full object-cover" />
                                    </template>
                                    <template v-else>
                                        <div class="flex h-full w-full items-center justify-center border-2 border-gray-300 text-5xl text-blue-500 dark:border-neutral-600">
                                            <span>
                                                {{ convertMimeTypeToType(file.mimeType) }}
                                            </span>
                                        </div>
                                    </template>
                                </div>

                                <!-- Bottom info -->
                                <div class="flex flex-col">
                                    <div class="truncate text-sm font-semibold text-gray-700 dark:text-gray-100">
                                        {{ file.fileName }}
                                    </div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">
                                        {{ formatBytes(Number(file.size)) }}
                                    </div>
                                </div>
                            </div>

                            <!-- NOTES (source == notes) -->
                            <div
                                v-if="source == 'notes'"
                                v-for="note in workbenchNotesRecords"
                                :key="note.noteId"
                                class="relative cursor-pointer rounded-lg border bg-gray-50 p-3 transition dark:border-neutral-700 dark:bg-neutral-800"
                                :class="{
                                    'border-logoColor': isNoteSelected(note),
                                    'border-gray-300': !isNoteSelected(note),
                                }"
                                @click="selectNotesForVectorization(note)"
                            >
                                <span class="block truncate text-gray-700 dark:text-gray-200">
                                    {{ note.title }}
                                </span>
                                <button class="mt-2 rounded-sm border border-gray-300 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100 dark:border-neutral-600 dark:text-gray-200 dark:hover:bg-neutral-700" @click.stop="toggleNoteMetadataPopup(note)">Edit Metadata</button>
                            </div>

                            <!-- AZURE-BLOB FILES -->
                            <div
                                v-if="source == 'azure-blob'"
                                v-for="file in ragUserFilesRecords"
                                :key="file.name"
                                @click="selectFileForVectorization(file.url, file.name, file.size)"
                                @dblclick="viewDocument(file.url)"
                                class="relative cursor-pointer rounded-lg border bg-gray-50 p-3 transition dark:border-neutral-700 dark:bg-neutral-800"
                                :class="{
                                    'border-logoColor': isSelected(file.url),
                                    'border-gray-300': !isSelected(file.url),
                                }"
                            >
                                <div class="bg-logoColor absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 transform rounded-sm px-2 py-1 text-xs text-white">
                                    {{ file.name.split(".").pop()?.toUpperCase() }}
                                </div>
                                <div class="mb-3 flex h-48 items-center justify-center overflow-hidden rounded-sm bg-white dark:bg-neutral-700">
                                    <template v-if="file.filePreviewUrl">
                                        <img :src="file.filePreviewUrl" alt="Preview" class="h-full w-full object-cover" />
                                    </template>
                                    <template v-else>
                                        <div class="flex h-full w-full items-center justify-center border-2 border-gray-300 text-5xl text-blue-500 dark:border-neutral-600">
                                            <span>
                                                {{ file.name.split(".").pop()?.toUpperCase() }}
                                            </span>
                                        </div>
                                    </template>
                                </div>
                                <div class="flex flex-col">
                                    <div class="truncate text-sm font-semibold text-gray-700 dark:text-gray-100">
                                        {{ file.name }}
                                    </div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">
                                        {{ formatBytes(file.size) }}
                                    </div>
                                </div>
                            </div>

                            <!-- GOOGLE-SHEETS -->
                            <div
                                v-if="source == 'google-sheets'"
                                v-for="file in googleSheetsRecords"
                                :key="file.CaseName"
                                @click="selectJsonForVectorization(file, file.CaseName)"
                                class="relative cursor-pointer rounded-lg border bg-gray-50 p-3 transition dark:border-neutral-700 dark:bg-neutral-800"
                                :class="{
                                    'border-logoColor': isJsonSelected(file.CaseName),
                                    'border-gray-300': !isJsonSelected(file.CaseName),
                                }"
                            >
                                <span class="block truncate text-gray-700 dark:text-gray-200">
                                    {{ file.CaseName }}
                                </span>
                                <span class="block text-xs text-gray-500 dark:text-gray-400"> File Type: Google Forms </span>
                                <span class="mt-1 block">
                                    <a @click.prevent="openJsonInNewTab(file)" href="#" class="text-logoColor underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"> Open </a>
                                </span>
                            </div>
                        </div>

                        <!-- prm -->

                        <!-- TABLE VIEW -->
                        <VectorizeTableN v-if="documentViewerView == 'table'" :data="workbenchRecordsTableData" />

                        <!-- Pagination -->
                        <div v-if="documentViewerView != 'table'" class="mx-2 mt-2 mb-3 flex flex-col items-center justify-between gap-2 sm:mx-5 sm:mt-3 sm:mb-5 sm:flex-row sm:gap-4">
                            <div
                                class="cursor-pointer rounded-sm border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-100 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-700"
                                @click="togglePrevPage"
                                :class="{
                                    'cursor-not-allowed opacity-50': currentPage === 1,
                                }"
                            >
                                Back
                            </div>
                            <div class="text-sm text-gray-700 dark:text-gray-300">Page {{ currentPage }} of {{ totalPages }}</div>
                            <div
                                class="cursor-pointer rounded-sm border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-100 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-700"
                                @click="toggleNextPage"
                                :class="{
                                    'cursor-not-allowed opacity-50': currentPage === totalPages,
                                }"
                            >
                                Next
                            </div>
                        </div>
                    </div>

                    <!-- Minimized -->
                    <div class="my-5 flex flex-row items-center justify-between rounded-lg border-2 border-gray-200 px-2 py-2 sm:px-5">
                        <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">File Viewer</h2>
                        <div class="cursor-pointer" @click="togglePageSection('file-viewer')">
                            <div class="materialSymbolsOutlined">expand_circle_up</div>
                        </div>
                    </div>
                </div>

                <!-- EMBEDDING SETTINGS -->
                <div class="my-5">
                    <div v-if="pageSectionExpanded('embedding-setting')" class="flex flex-col gap-3 rounded-lg border-2 border-gray-200 p-3 sm:p-5">
                        <!-- Minimize -->
                        <div class="flex cursor-pointer justify-end" @click="togglePageSection('embedding-setting')">
                            <div class="materialSymbolsOutlined">expand_circle_down</div>
                        </div>
                        <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Embedding Settings</h2>

                        <!-- Embedding Setting Content -->
                        <div class="mt-2 flex flex-row items-start gap-5">
                            <!-- Collection info -->
                            <div class="flex flex-col gap-2">
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"> Chunk Type </label>
                                    <Dropdown class="w-40" :options="chunkTypeOptions" placeholder="Chunk Type" label="Chunk Type" :defaultValue="chunkType" v-model="chunkType" />
                                </div>
                                <div class="text-gray-700 dark:text-gray-300">
                                    {{ currentCollectionInfo?.embedding }}
                                </div>
                                <div class="text-gray-700 dark:text-gray-300">
                                    {{ currentCollectionInfo?.distance }}
                                </div>
                                <div class="text-gray-700 dark:text-gray-300">768</div>
                            </div>

                            <!-- Sliders -->
                            <div class="flex flex-wrap gap-5">
                                <!-- Chunk size slider (if not page) -->
                                <div v-if="chunkType !== 'page'">
                                    <SliderInput :sliderId="chunkSliderId" :size="chunkSize" :label="chunkSliderLabel" :max="5000" v-model="chunkSize" />
                                </div>
                                <!-- Batch size slider -->
                                <div>
                                    <SliderInput :sliderId="batchSliderId" :size="batchSize" :label="batchSliderLabel" :max="1500" v-model="batchSize" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Minimized Embedding Settings -->
                    <div v-else class="my-5 flex flex-row items-center justify-between rounded-lg border-2 border-gray-200 px-2 py-2 sm:px-5">
                        <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Embedding Settings</h2>
                        <div class="cursor-pointer" @click="togglePageSection('embedding-setting')">
                            <div class="materialSymbolsOutlined">expand_circle_up</div>
                        </div>
                    </div>
                </div>

                <!-- METADATA SECTION -->
                <div class="my-5">
                    <div v-if="pageSectionExpanded('metadata')" class="flex flex-col gap-3 rounded-lg border-2 border-gray-200 p-3 sm:p-5">
                        <!-- Minimize -->
                        <div class="flex cursor-pointer justify-end" @click="togglePageSection('metadata')">
                            <div class="materialSymbolsOutlined">expand_circle_down</div>
                        </div>
                        <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Metadata</h2>

                        <!-- Metadata Wrapper -->
                        <div class="mx-2 mt-2 flex flex-row items-center gap-5">
                            <Dropdown class="w-40" :options="metadataTemplates" placeholder="Select Template" label="Template" :defaultValue="metadataTemplate" v-model="metadataTemplate" />
                            <div class="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition hover:bg-gray-100 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-700">Create Template</div>
                        </div>
                    </div>

                    <!-- Minimized Metadata -->
                    <div v-else class="my-5 flex flex-row items-center justify-between rounded-lg border-2 border-gray-200 px-2 py-2 sm:px-5">
                        <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Metadata</h2>
                        <div class="cursor-pointer" @click="togglePageSection('metadata')">
                            <div class="materialSymbolsOutlined">expand_circle_up</div>
                        </div>
                    </div>
                </div>

                <!-- ACTION BUTTONS -->
                <div class="action-buttons my-5 ml-0 flex gap-2 sm:ml-5">
                    <Button
                        buttonText="Vectorize"
                        @click="addFileForVectorization"
                        :disabled="!selectedFiles.length && !selectedJson.length && !selectedNotes.length && !selectedJsonSummary.length"
                        :class="{
                            'cursor-not-allowed bg-gray-300 text-gray-400': !selectedFiles.length && !selectedJson.length && !selectedNotes.length && !selectedJsonSummary.length,
                        }"
                    />
                    <Button buttonText="Save Settings" />
                    <NuxtLink to="/admin/mozart/logs">
                        <Button buttonText="Show Logs" />
                    </NuxtLink>
                </div>

                <!-- PROGRESS BAR -->
                <div v-if="vectorizationProgress > 0" class="mx-2 my-5 flex flex-col sm:mx-5">
                    <ProgressBar :progress="vectorizationProgress" />
                </div>
            </div>

            <!-- Vectorization Logs Modal -->
            <RAGServiceVectorizationLogs v-if="showServiceVectorizationLogs" :show="showServiceVectorizationLogs" @update:show="toggleVectorizationLogs" />

            <!-- Note Metadata Popup -->
            <NoteMetadataPopup :show="showNoteMetadataPopup" :note="selectedNoteForVectorization" @update:show="toggleNoteMetadataPopup" @addMetadata="addNoteMetadata" />

            <!-- RAG File Format (JSON) -->
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

            <!-- RAG File Format (CSV) -->
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
    </div>
</template>

<script setup lang="ts">
    import { convertMimeTypeToType, formatBytes, formatDate, trimTitle } from "~/util"
    import eventBus from "~/util/eventBus"
    import { sampleJsonFormat, sampleCSVFormat } from "~/util/staticData"
    import { v4 as uuidv4 } from "uuid"
    import VectorizeTableN from "./VectorizeTableN.vue"

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

    const sourceOptions = ref([
        { text: "Workbench", value: "workbench" },
        { text: "Staging Bucket", value: "azure-blob" },
        { text: "Google Drive", value: "google-drive" },
        { text: "Notes", value: "notes" },
        { text: "Google Sheets", value: "google-sheets" },
        { text: "Summary", value: "summary" },
    ])
    const metadataTemplates = ref([])
    const metadataTemplate = ref("")
    const source = ref<string>("workbench")
    const searchText = ref("")
    const chunkSize = ref<number>(600)
    const batchSize = ref(100)
    const chunkType = ref<string>("char")
    const showServiceVectorizationLogs = ref(false)
    const workbenchRecords = ref<IWorkbenchRecord[]>([])
    const workbenchRecordsTableData = ref<IWorkbenchRecord[]>([])

    const chunkTypeOptions = ref([
        { text: "By Char", value: "char" },
        { text: "By Word", value: "word" },
        { text: "By Page", value: "page" },
    ])
    const ragUserFilesData = ref<any>(ragStore.ragUserFilesData)
    const chunkSliderId = "chunkSizeSlider"
    const selectedNoteForVectorization = ref<INote>({} as INote)
    const batchSliderId = "batchSizeSlider"
    const chunkSliderLabel = computed(() => (chunkType.value === "char" ? "Characters" : "Words"))
    const batchSliderLabel = "Batch Size"
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
        if (sortData.value.name) {
            ragUserFiles.sort((a: any, b: any) => {
                if (sortNameDesc.value) {
                    return b.name.localeCompare(a.name) // Descending
                } else {
                    return a.name.localeCompare(b.name) // Ascending
                }
            })
        }
        if (sortData.value.createdAt) {
            ragUserFiles.sort((a: any, b: any) => {
                const dateA = new Date(a.lastModified).getTime() // Assuming lastModified is a date string
                const dateB = new Date(b.lastModified).getTime()
                if (sortCreatedAtDesc.value) {
                    return dateB - dateA // Descending
                } else {
                    return dateA - dateB // Ascending
                }
            })
        }
        const startIndex = (currentPage.value - 1) * totalRecordsPerPage.value
        const endIndex = startIndex + Number(totalRecordsPerPage.value)
        return ragUserFiles.slice(startIndex, endIndex)
    })
    const fileInput = ref<HTMLElement | null>(null)
    const fileInputBulk = ref<HTMLElement | null>(null)
    const metadataForNote = ref<any>({})
    const documentViewerView = ref("table")
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
    const acceptedFileTypes = ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream", "text/html", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
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
            let records = Object.values(fileSystemStore.filesAndFolders).filter((document) => {
                if (document.type === "folder") return false
                if (searchText.value) {
                    return document.name.toLowerCase().includes(searchText.value.toLowerCase()) && acceptedFileTypes.includes(document.mimeType)
                }
                return acceptedFileTypes.includes(document.mimeType)
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
            let records = Object.values(documentStore.notes).filter((note) => {
                if (searchText.value) {
                    return note.title.toLowerCase().includes(searchText.value.toLowerCase())
                }
                return true
            }).length
            return records <= totalRecordsPerPage.value ? 1 : Math.ceil(records / totalRecordsPerPage.value)
        } else if (source.value == "google-drive") {
            if (!ragStore.googleDriveFiles) return 1
            let records = ragStore.googleDriveFiles.filter((file: any) => {
                if (searchText.value) {
                    return file.fileName.toLowerCase().includes(searchText.value.toLowerCase())
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
        return ragStore.collections.find((collection) => collection.name === ragStore.currentCollection)
    })

    onMounted(() => {
        updateWorkbenchRecords()
    })
    // Create a function to update the records
    const updateWorkbenchRecords = () => {
        let workbenchItems = Object.values(fileSystemStore.filesAndFolders).filter((document) => {
            if (document.type === "file") {
                if (searchText.value) {
                    return document.name.toLowerCase().includes(searchText.value.toLowerCase()) && acceptedFileTypes.includes(document.mimeType)
                }
                return acceptedFileTypes.includes(document.mimeType)
            }
            return false
        })

        // Apply sorting
        if (sortData.value.name) {
            workbenchItems.sort((a: any, b: any) => {
                if (sortNameDesc.value) {
                    return a.name.localeCompare(b.name)
                } else {
                    return b.name.localeCompare(a.name)
                }
            })
        }

        if (sortData.value.createdAt) {
            workbenchItems.sort((a: any, b: any) => {
                const dateA = new Date(a.updatedAt).getTime()
                const dateB = new Date(b.updatedAt).getTime()
                if (sortCreatedAtDesc.value) {
                    return dateB - dateA
                } else {
                    return dateA - dateB
                }
            })
        }

        // Apply pagination
        const startIndex = (currentPage.value - 1) * totalRecordsPerPage.value
        const endIndex = startIndex + Number(totalRecordsPerPage.value)
        workbenchRecordsTableData.value = workbenchItems
        workbenchRecords.value = workbenchItems.slice(startIndex, endIndex)
    }

    watch([() => fileSystemStore.filesAndFolders, searchText, sortData, sortNameDesc, sortCreatedAtDesc, currentPage, totalRecordsPerPage], updateWorkbenchRecords, { deep: true })

    const googleDriveRecords = computed<any[]>(() => {
        const files = ragStore.googleDriveFiles.filter((file: any) => {
            if (searchText.value) {
                return file.fileName.toLowerCase().includes(searchText.value.toLowerCase())
            }
            return true
        })
        if (!files) return []
        if (sortData.value.name) {
            files.sort((a: any, b: any) => {
                if (sortNameDesc.value) {
                    return a.fileName.localeCompare(b.fileName)
                } else {
                    return b.fileName.localeCompare(a.fileName)
                }
            })
        }
        if (sortData.value.createdAt) {
            files.sort((a: any, b: any) => {
                const dateA = new Date(a.createdTime).getTime() // Assuming createdTime is a date string
                const dateB = new Date(b.createdTime).getTime()
                if (sortCreatedAtDesc.value) {
                    return dateB - dateA // Descending
                } else {
                    return dateA - dateB // Ascending
                }
            })
        }
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
        if (sortData.value.name) {
            workbenchItems.sort((a: any, b: any) => {
                if (sortNameDesc.value) {
                    return a.title.localeCompare(b.title)
                } else {
                    return b.title.localeCompare(a.title)
                }
            })
        }
        if (sortData.value.createdAt) {
            workbenchItems.sort((a: any, b: any) => {
                const dateA = new Date(a.lastModified).getTime() // Assuming lastModified is a date string
                const dateB = new Date(b.lastModified).getTime()
                if (sortCreatedAtDesc.value) {
                    return dateB - dateA // Descending
                } else {
                    return dateA - dateB // Ascending
                }
            })
        }
        const startIndex = (currentPage.value - 1) * totalRecordsPerPage.value
        const endIndex = startIndex + Number(totalRecordsPerPage.value)
        return workbenchItems.slice(startIndex, endIndex)
    })
    const selectedFile = ref<any>(null)
    const pageSections = ref<any>({
        "file-viewer": true,
        "embedding-setting": true,
        metadata: true,
    })

    const selectedFiles = ref<any>([])
    const selectedNotes = ref<any>([])
    const selectedJson = ref<any>([])
    const selectedJsonSummary = ref<any>([])
    const toggleSort = (key: string) => {
        if (key === "name") {
            sortData.value.name = true
            sortData.value.createdAt = false // Disable other sort fields
            sortNameDesc.value = !sortNameDesc.value // Toggle sort direction
        } else if (key === "createdAt") {
            sortData.value.name = false // Disable other sort fields
            sortData.value.createdAt = true
            sortCreatedAtDesc.value = !sortCreatedAtDesc.value // Toggle sort direction
        }
    }
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
    const openFileBrowse = () => {
        fileInput.value?.click()
    }
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
    const uploadDocument = async (event: any) => {
        const file = event.target.files[0]
        if (file.type === "application/json") {
            const isJsonValid = await validateRagJsonFile(file)
            if (!isJsonValid) {
                fileFormat.value = "JSON"
                showFormatError.value = true
                resetInput()
                return
            }
        } else if (file.type === "text/csv") {
            const isCsvEmpty = await validateRagCsvFile(file)
            if (!isCsvEmpty) {
                fileFormat.value = "CSV"
                showFormatError.value = true
                resetInput()
                return
            }
        }
        if (source.value === "azure-blob") {
            const response: any = await useRag().uploadFileToAzureBlob(file)
            if (response.code !== 200) {
                eventBus.emit("toast", {
                    type: "error",
                    message: "Upload Failed",
                })
            }
            eventBus.emit("toast", {
                type: "success",
                message: "File Uploaded to Staging Bucket",
            })
            await useRag().getRagFilesForUser()
        } else if (source.value === "workbench") {
            try {
                const newFile: FileItem = {
                    id: `FS_${uuidv4()}`, // Generate a unique ID for the file
                    name: file.name,
                    type: "file",
                    path: "/",
                    parentFolderId: "",
                    size: file.size,
                    mimeType: file.type,
                    ownerId: userStore.userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lastModifiedBy: userStore.firstName,
                    isStarred: false,
                    isTrashed: false,
                    isHidden: false,
                    isShared: false,
                    isSharedWithMe: false,
                    status: "uploaded",
                }
                await useFileSystem().createFile(() => {}, file, newFile)
            } catch (error) {
                console.log(error)
            }
        }
        resetInput()
    }

    const selectFileForVectorization = (url: any, name: any, size: any) => {
        const existingIndex = selectedFiles.value.findIndex((file: any) => file.url === url)
        if (existingIndex > -1) {
            selectedFiles.value.splice(existingIndex, 1)
        } else {
            selectedFiles.value.push({ url, name, size })
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
    const addFileForVectorization = async () => {
        if (currentCollectionInfo.value) {
            for (const file of selectedFiles.value) {
                const documentId = file.documentId || ""
                await useRag().addFileToVectorizationQueue(file.name, file.url, "pdf", file.size, ragStore.currentCollection, currentCollectionInfo.value.alias, "low", currentCollectionInfo.value.distance, currentCollectionInfo.value.embedding, chunkSize.value, chunkType.value, batchSize.value, documentId)
            }
            for (const file of selectedJsonSummary.value) {
                let fileName = file[0].fileName
                await useRag().vectorizeSummaryForUser(file, userStore.userId, fileName, currentCollectionInfo.value?.embedding, currentCollectionInfo.value?.distance, chunkSize.value)
            }
        }
    }

    const openFileBrowseBulk = () => {
        fileInputBulk.value?.click()
    }

    const toggleVectorizationLogs = () => {
        showServiceVectorizationLogs.value = !showServiceVectorizationLogs.value
    }

    const uploadDocumentBulk = async (event: any) => {
        const files = event.target.files
        if (!files || files.length === 0) {
            eventBus.emit("toast", {
                type: "error",
                message: "No files selected",
            })
            resetInput()
            return
        }

        try {
            for (const file of files) {
                if (file.type === "application/json") {
                    const isJsonValid = await validateRagJsonFile(file)
                    if (!isJsonValid) {
                        fileFormat.value = "JSON"
                        showFormatError.value = true
                        continue
                    }
                } else if (file.type === "text/csv") {
                    const isCsvEmpty = await validateRagCsvFile(file)
                    if (!isCsvEmpty) {
                        console.log(`${file.name} is empty`)
                        fileFormat.value = "CSV"
                        showFormatError.value = true
                        continue
                    }
                }
                if (source.value === "azure-blob") {
                    const response: any = await useRag().uploadFileToAzureBlob(file)
                    if (response.code !== 200) {
                        eventBus.emit("toast", {
                            type: "error",
                            message: `Upload of ${file.name} to Azure Blob failed`,
                        })
                    } else {
                        eventBus.emit("toast", {
                            type: "success",
                            message: `${file.name} uploaded to Staging Bucket`,
                        })
                    }
                } else if (source.value === "workbench") {
                    try {
                        await useUser().uploadFile(file)
                        eventBus.emit("toast", {
                            type: "success",
                            message: `${file.name} uploaded to Workbench`,
                        })
                    } catch (error) {
                        console.error(`Error uploading ${file.name}:`, error)
                        eventBus.emit("toast", {
                            type: "error",
                            message: `Upload of ${file.name} to Workbench failed`,
                        })
                    }
                } else {
                    eventBus.emit("toast", {
                        type: "error",
                        message: "Invalid upload source",
                    })
                    break
                }
            }
            // Refresh the documents list after all files have been uploaded
            if (source.value === "azure-blob") {
                await useRag().getRagFilesForUser()
            } else if (source.value === "workbench") {
                await documentStore.fetchDocuments(true)
            }
        } catch (error) {
            console.error("Bulk upload error:", error)
            eventBus.emit("toast", {
                type: "error",
                message: "Bulk upload failed",
            })
        }
        resetInput()
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

    const selectJsonSummaryForVectorization = (file: any) => {
        const existingIndex = selectedJsonSummary.value.findIndex((item: any) => JSON.stringify(item) === JSON.stringify(file.content))

        if (existingIndex > -1) {
            selectedJsonSummary.value.splice(existingIndex, 1)
        } else {
            selectedJsonSummary.value.push(file.content)
        }
    }
    const isJsonSummarySelected = (file: any) => {
        return selectedJsonSummary.value.some((contentArray: any) => contentArray.some((contentFile: any) => contentFile.fileUrl === file.fileUrl))
    }
    const validateRagJsonFile = (file: any) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const target = e.target
                    if (!target) return reject(new Error("FileReader target is null"))
                    const json = JSON.parse(target.result as string)
                    if (isCorrectJsonFormat(json)) {
                        selectedJson.value.push(json)
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                } catch (error) {
                    resolve(false)
                }
            }
            reader.readAsText(file)
        })
    }

    const correctJsonFormatString = JSON.stringify(correctJsonFormat, null, 2)

    const isCorrectJsonFormat = (json: any) => {
        const checkFormat = (obj: any, format: any) => {
            for (let key in format) {
                if (typeof format[key] === "object" && !Array.isArray(format[key])) {
                    if (!obj.hasOwnProperty(key) || !checkFormat(obj[key], format[key])) {
                        return false
                    }
                } else if (Array.isArray(format[key])) {
                    if (!obj.hasOwnProperty(key) || !Array.isArray(obj[key])) {
                        return false
                    }
                } else {
                    if (!obj.hasOwnProperty(key) || typeof obj[key] !== format[key]) {
                        return false
                    }
                }
            }
            return true
        }
        return Array.isArray(json) && json.every((item) => checkFormat(item, correctJsonFormat[0]))
    }

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

    const resetInput = () => {
        if (fileInputBulk.value instanceof HTMLInputElement) {
            fileInputBulk.value.value = ""
        }
        if (fileInput.value instanceof HTMLInputElement) {
            fileInput.value.value = ""
        }
    }

    async function handleFileUploadShow(button: string) {
        showFormatError.value = !showFormatError.value
    }

    const validateRagCsvFile = (file: any) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const target = e.target
                if (!target) return
                const text = target.result as string | null
                if (text) {
                    const lines = text.trim().split("\n")
                    if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === "")) {
                        resolve(false)
                        return
                    }
                    const headerColumns = lines[0].split(",").map((col) => col.trim())
                    const requiredColumns = ["text", "source_filename", "section", "facts", "laws", "variables"]

                    const hasAllRequiredColumns = requiredColumns.every((col) => headerColumns.includes(col))
                    if (!hasAllRequiredColumns) {
                        resolve(false)
                        return
                    }

                    const columnDataTypes: { [key: string]: Set<string> } = {}

                    const hasData = lines.slice(1).some((line) => {
                        const cells = line.split(",")
                        return cells.some((cell) => cell.trim() !== "" && cell.trim().toLowerCase() !== "nan")
                    })

                    if (!hasData) {
                        resolve(false)
                        return
                    }

                    lines.forEach((line, lineIndex) => {
                        if (lineIndex === 0) return
                        const cells = line.split(",")
                        cells.forEach((cell, cellIndex) => {
                            const columnName = headerColumns[cellIndex]
                            if (!columnDataTypes[columnName]) {
                                columnDataTypes[columnName] = new Set()
                            }
                            if (cell.trim() !== "" && cell.trim().toLowerCase() !== "nan" && cell.trim().toLowerCase() !== "null") {
                                if (!isNaN(parseFloat(cell)) && isFinite(cell as any)) {
                                    if (cell.includes(".")) {
                                        columnDataTypes[columnName].add("float")
                                    } else {
                                        columnDataTypes[columnName].add("int")
                                    }
                                } else {
                                    columnDataTypes[columnName].add("string")
                                }
                            }
                        })
                    })

                    const hasMultipleDataTypes = Object.values(columnDataTypes).some((dataTypes) => dataTypes.size > 1)
                    resolve(!hasMultipleDataTypes)
                } else {
                    resolve(false)
                }
            }
            reader.onerror = () => resolve(false)
            reader.readAsText(file)
        })
    }

    const viewDocument = (url: string) => {
        if (!url) return
        window.open(url, "_blank")
    }
    const getSummary = async () => {
        await rag.getSummary(organizationStore.currentOrganizationId)
    }
    const summaryRecords = computed(() => {
        const summaryItems = Object.values(ragStore.summaries)
            .map((summary: any) => {
                const firstItem = summary.content[0] || {}
                return {
                    ...summary,
                    fileSize: firstItem.fileSize,
                    fileType: firstItem.fileType,
                    fileUrl: firstItem.fileUrl,
                }
            })
            .filter((item) => {
                if (searchText.value) {
                    return item.content.some((file: any) => file.fileName.toLowerCase().includes(searchText.value.toLowerCase()))
                }
                return true
            })

        summaryItems.sort((a, b) => {
            if (sortData.value.name) {
                if (sortNameDesc.value) {
                    return a.name.localeCompare(b.name)
                } else {
                    return b.name.localeCompare(a.name)
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

        return summaryItems.slice(startIndex, endIndex)
    })
    onMounted(async () => {
        await fileSystemStore.fetchAllUserFiles()
        await documentStore.fetchNotes()
        getSummary()
        if (ragStore?.googleDriveFiles?.length === 0) {
            if (userStore.integrations && userStore.integrations["google"] && userStore.integrations["google"].createdAt + 30 * 24 * 60 * 60 * 1000 > Date.now()) await ragStore.getGoogleDriveFiles()
        }
        // if (ragStore.sheetFiles.length === 0) {
        //     const responseSheets = await rag.getSheetsData()
        //     ragStore.sheetFiles = responseSheets
        //     googleSheetsRecords.value = ragStore.sheetFiles
        // } else {
        //     googleSheetsRecords.value = ragStore.sheetFiles
        // }
    })
</script>

<style scoped>
    /* Hide scrollbars for a cleaner look */
    ::-webkit-scrollbar {
        width: 6px;
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: #e5e7eb;
        border-radius: 6px;
    }

    /* Responsive tweaks for table overflow */
    .responsive-table {
        overflow-x: auto;
    }

    /* Make action buttons stack on mobile */
    @media (max-width: 640px) {
        .action-buttons {
            flex-direction: column !important;
            gap: 0.5rem !important;
            margin-left: 0 !important;
        }

        .section-header {
            flex-direction: column !important;
            gap: 1rem !important;
            align-items: flex-start !important;
        }

        .file-viewer-header {
            flex-direction: column !important;
            gap: 1rem !important;
            align-items: flex-start !important;
        }

        .widget-grid {
            grid-template-columns: 1fr !important;
        }

        .section-padding {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
        }
    }
</style>
