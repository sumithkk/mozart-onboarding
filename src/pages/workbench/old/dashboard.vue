<template>
    <!-- .workbenchWrapper -->
    <div class="bg-backgroundColor text-textColor relative box-border flex max-h-full w-full flex-1 flex-col gap-[20px]">
        <!-- Header (.headerWrapper) -->
        <div class="mx-[10px] mt-[10px] box-border flex items-center justify-between">
            <!-- Search (.searchWrapper) -->
            <div class="border-border2 bg-backgroundColor flex w-1/2 items-center rounded-[18px] border px-[10px] py-0">
                <input class="inputSearch bg-backgroundColor text-textColor box-border w-full rounded-[18px] border-none p-[10px] outline-none" type="text" placeholder="Search for interactions" v-model="searchQuery" />
                <div class="materialSymbolsFilled searchIcon text-textColor ml-2 cursor-pointer">search</div>
            </div>

            <!-- Organization Switch (.documentViewSwitches + .organizationSwitch) -->
            <div class="ml-[10px] flex gap-[10px]">
                <!-- <div
            class="organizationSwitch px-[30px] py-[8px] text-[14px] rounded-[10px]
                   text-textColor
                   cursor-pointer"
            :class="{ organizationViewSwitchActive: isPersonalOrganizationSelected,
                    'border-border text-foreground': isPersonalOrganizationSelected
            }"
            @click="switchOrganization(true)"
          >
            Personal
          </div>
          <div
            class="organizationSwitch px-[30px] py-[8px] text-[14px] rounded-[10px]
                   text-textColor
                   cursor-pointer"
            :class="{ organizationViewSwitchActive: !isPersonalOrganizationSelected,
                    'border-border text-foreground': !isPersonalOrganizationSelected
            }"
            @click="switchOrganization(false)"
          >
            Organization
          </div> -->
            </div>
        </div>

        <!-- Body (.bodyWrapper) -->
        <div class="box-border flex flex-1 flex-col gap-[16px] overflow-auto px-[20px]">
            <!-- Right side items (.rightSideItems) -->
            <div class="flex w-full items-center gap-[10px]">
                <VTooltip>
                    <div class="documentViewSwitches flex gap-[10px]">
                        <!-- .documentViewSwitch -->
                        <div
                            class="documentViewSwitch border-unselectedColor text-textColor flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full border-2 text-[20px] transition-colors duration-300"
                            :class="{ documentViewSwitchActive: workbenchDocumentView == 'table', 'border-border text-foreground': workbenchDocumentView === 'table' }"
                            @click="switchDocumentView('table')"
                        >
                            <div class="materialSymbolsFilled">reorder</div>
                        </div>
                        <div
                            class="documentViewSwitch border-unselectedColor text-textColor flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full border-2 text-[20px] transition-colors duration-300"
                            :class="{
                                documentViewSwitchActive: workbenchDocumentView === 'widget',
                                'border-border text-foreground': workbenchDocumentView === 'widget',
                            }"
                            @click="switchDocumentView('widget')"
                        >
                            <div class="materialSymbolsFilled">widgets</div>
                        </div>
                    </div>
                    <template #popper> Switch between list and table view </template>
                </VTooltip>

                <VTooltip>
                    <div class="transparentButton border-border text-textColor hover:bg-sideBarBackgroundColor flex cursor-pointer items-center gap-2 rounded-lg border bg-transparent px-3 py-2 transition-colors" @click="showPopup = true">
                        <div class="materialSymbolsFilled text-textColor">border_color</div>
                        <span class="text-textColor">Create Note</span>
                    </div>
                    <template #popper> Create a new note </template>
                </VTooltip>

                <div class="transparentButton border-border text-textColor hover:bg-sideBarBackgroundColor flex cursor-pointer items-center gap-2 rounded-lg border bg-transparent px-3 py-2 transition-colors" @click="toggleDocumentManager">
                    <div class="materialSymbolsFilled text-textColor">cloud_upload</div>
                    <span class="text-textColor">Upload File</span>
                </div>
                <input type="file" ref="fileInput" @change="handleFileChange" class="hidden" />
                <DocumentManager :show="showDocumentManager" @update:show="toggleDocumentManager" />

                <!-- Mobile capture button -->
                <div v-if="props.isMobile" class="documentViewSwitch border-unselectedColor bg-sideBarBackgroundColor text-textColor flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full border-2 text-[20px] transition-colors duration-300" @click="triggerCameraCapture">
                    <div class="materialSymbolsFilled">add_a_photo</div>
                </div>

                <!-- Bulk delete -->
                <div v-if="selectedDocuments.length + selectedNotes.length > 1" class="documentViewSwitch border-unselectedColor bg-sideBarBackgroundColor text-textColor flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full border-2 text-[20px] transition-colors duration-300" @click="handleDeleteSelected">
                    <div class="materialSymbolsFilled">delete</div>
                </div>

                <!-- Bulk vectorize -->
                <div v-if="selectedDocuments.length > 1" class="documentViewSwitch border-unselectedColor bg-sideBarBackgroundColor text-textColor flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full border-2 text-[20px] transition-colors duration-300" @click="vectorizeDocumentBulk(selectedDocuments)">
                    <div class="materialSymbolsFilled">manage_search</div>
                </div>
            </div>

            <ComponentLoading v-if="documentStore.isLoading" />

            <!-- Instruction container (if no docs) -->
            <div v-else-if="!documentStore.isLoading && Object.keys(documentStore.documents).length == 0 && !isMobile" class="instruction-container absolute top-[80px] left-[350px] flex items-center">
                <svg class="arrow h-[300px] w-[500px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 800">
                    <defs>
                        <marker id="arrowhead" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth">
                            <path d="M 0 0 L 6 3.5 L 0 7" fill="none" stroke="var(--logoColor)" stroke-width="1" />
                        </marker>
                    </defs>
                    <line x1="598" y1="600" x2="20" y2="20" stroke="var(--logoColor)" stroke-width="12" marker-end="url(#arrowhead)" />
                    <line x1="596" y1="600" x2="1800" y2="600" stroke="var(--logoColor)" stroke-width="12" />
                    <text x="620" y="560" font-size="100" fill="var(--logoColor)">Upload your first file here!</text>
                </svg>
            </div>

            <!-- Document Body (.documentBody) -->
            <div class="documentBody box-border flex-grow overflow-y-auto px-[20px]">
                <!-- Widget view -->
                <div v-if="workbenchDocumentView == 'widget'" class="documentsWrapper grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <div v-for="document in filteredDocuments" :key="document.documentId" class="documentCard border-border bg-sideBarBackgroundColor relative m-[10px] rounded-[10px] border p-[10px]">
                        <div class="fileTypeBadge border-border text-foreground absolute top-[-10px] left-[-10px] rounded-[5px] p-[5px]">
                            {{ convertMimeTypeToType(document.fileType) }}
                        </div>
                        <div class="previewImageWrapper mb-[10px] h-[200px] cursor-pointer overflow-hidden rounded-[10px]" @click="handleDocumentClick(document.documentId)">
                            <div v-if="document.filePreviewUrl">
                                <img class="previewImage h-full w-full object-cover" :src="document.filePreviewUrl" alt="Preview" />
                            </div>
                            <div v-else class="previewImagePlaceholder bg-card bg-input flex h-full w-full items-center justify-center">
                                <div v-if="convertMimeTypeToType(document.fileType) === 'Image'">
                                    <img class="previewImage h-full w-full object-cover" :src="document.viewDocumentUrl" alt="Preview" />
                                </div>
                            </div>
                        </div>

                        <div class="documentCardBottomWrapper flex items-start justify-between">
                            <div class="documentInfoWrapper overflow-auto">
                                <div class="documentCardTitle text-textColor w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap" @click="handleDocumentClick(document.documentId)">
                                    {{ document.fileName }}
                                </div>
                                <div v-if="document.source" class="documentMetaData text-unselectedColor mt-[5px] flex cursor-pointer items-center gap-[5px] text-[12px]" @click="handleDocumentClick(document.documentId)">
                                    {{ document.source.name }}
                                </div>
                                <div class="documentMetaData text-unselectedColor mt-[5px] flex cursor-pointer items-center gap-[5px] text-[12px]" @click="handleDocumentClick(document.documentId)">
                                    {{ formatBytes(document.fileSize) }}
                                    <div class="dot h-1 w-1 rounded-full bg-current"></div>
                                    {{ formatEpochToDateString(document.uploadedAt) }}
                                </div>
                            </div>
                            <div class="actionsPopOverButton user-select-none text-textColor relative flex cursor-pointer items-center justify-center text-[30px]">
                                <DropdownMenu :options="documentActionMenuDropdownOptions(document)" :isActive="document.documentId == activeDocumentDropdownId" :position="dropdownPosition" :dropdownId="document.documentId" :outSideClicked="outSideClicked" @itemClicked="(x) => handleDropdownMenuItemClicked(x, document.documentId, document)">
                                    <div class="materialSymbolsFilled" @click="onActiveConversationDropdownChange(document.documentId)">more_vert</div>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Table view -->
                <div v-if="workbenchDocumentView == 'table'" class="documentsWrapper border-border table min-w-full overflow-hidden">
                    <table class="divide-border mb-[28px] min-w-full divide-y divide-neutral-200">
                        <thead class="bg-secondary bg-secondary">
                            <tr>
                                <th @click="changeSort('name')" class="text-muted-foreground cursor-pointer rounded-tl-lg px-6 py-3 text-center text-xs font-medium">
                                    <div class="tableHeader flex flex-row items-center">
                                        Name
                                        <div class="materialSymbolsFilled" v-if="sorting.column == 'name'">
                                            {{ sorting.order == "asc" ? "keyboard_arrow_up" : "keyboard_arrow_down" }}
                                        </div>
                                    </div>
                                </th>
                                <th @click="changeSort('updatedAt')" class="text-muted-foreground cursor-pointer px-6 py-3 text-center text-xs font-medium">
                                    <div class="tableHeader flex flex-row items-center">
                                        Date Modified
                                        <div class="materialSymbolsFilled" v-if="sorting.column == 'updatedAt'">
                                            {{ sorting.order == "asc" ? "keyboard_arrow_up" : "keyboard_arrow_down" }}
                                        </div>
                                    </div>
                                </th>
                                <th class="text-muted-foreground px-6 py-3 text-center text-xs font-medium">Tags</th>
                                <th @click="changeSort('size')" class="text-muted-foreground cursor-pointer px-6 py-3 text-center text-xs font-medium">
                                    <div class="tableHeader flex flex-row items-center">
                                        Size
                                        <div class="materialSymbolsFilled" v-if="sorting.column == 'size'">
                                            {{ sorting.order == "asc" ? "keyboard_arrow_up" : "keyboard_arrow_down" }}
                                        </div>
                                    </div>
                                </th>
                                <th @click="changeSort('owner')" class="text-muted-foreground cursor-pointer px-6 py-3 text-center text-xs font-medium">
                                    <div class="tableHeader flex flex-row items-center">
                                        Owner
                                        <div class="materialSymbolsFilled" v-if="sorting.column == 'owner'">
                                            {{ sorting.order == "asc" ? "keyboard_arrow_up" : "keyboard_arrow_down" }}
                                        </div>
                                    </div>
                                </th>
                                <th @click="changeSort('status')" class="text-muted-foreground cursor-pointer px-6 py-3 text-center text-xs font-medium">
                                    <div class="tableHeader flex flex-row items-center">
                                        Status
                                        <div class="materialSymbolsFilled" v-if="sorting.column == 'status'">
                                            {{ sorting.order == "asc" ? "keyboard_arrow_up" : "keyboard_arrow_down" }}
                                        </div>
                                    </div>
                                </th>
                                <th @click="changeSort('source')" class="text-muted-foreground cursor-pointer px-6 py-3 text-center text-xs font-medium">
                                    <div class="tableHeader flex flex-row items-center">
                                        Source
                                        <div class="materialSymbolsFilled" v-if="sorting.column == 'source'">
                                            {{ sorting.order == "asc" ? "keyboard_arrow_up" : "keyboard_arrow_down" }}
                                        </div>
                                    </div>
                                </th>
                                <th class="text-muted-foreground rounded-tr-lg px-6 py-3 text-center text-xs font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-border divide-y divide-neutral-200">
                            <!-- Documents -->
                            <tr v-for="document in filteredDocuments" :key="document.documentId" class="hover:bg-secondary hover:bg-secondary transition-colors">
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                    <input type="checkbox" :value="document.documentId" :checked="isDocumentSelected(document.documentId)" @change="selectDocument(document)" />
                                    {{ trimTitle(document.fileName) }}
                                </td>
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                    {{ formatEpochToDateString(document.updatedAt) }}
                                </td>
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                    <Tags :tags="document.tags" @update:tagListUpdate="(data: any) => onTagsChange('document', data, document.documentId)" />
                                </td>
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                    {{ formatBytes(document.fileSize) }}
                                </td>
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                    {{ document.owner }}
                                </td>
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                    {{ getStatusText(document.status) }}
                                </td>
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                    {{ document.source?.name }}
                                </td>
                                <td class="text-foreground text-foreground px-6 py-4 text-center text-sm whitespace-nowrap">
                                    <div class="documentActionsWrapper flex items-center justify-center gap-[10px]">
                                        <Tooltip text="Preview" :isHTML="false">
                                            <div class="documentAction materialSymbolsFilled px24 text-textColor cursor-pointer font-[300]" @click="handleDocumentClick(document.documentId)">preview</div>
                                        </Tooltip>
                                        <Tooltip text="Download" :isHTML="false">
                                            <div class="documentAction materialSymbolsFilled px24 text-textColor cursor-pointer font-[300]">download</div>
                                        </Tooltip>
                                        <Tooltip text="Edit" :isHTML="false">
                                            <div class="documentAction materialSymbolsFilled px24 text-textColor cursor-pointer font-[300]" @click="editDocument(document.documentId)">edit</div>
                                        </Tooltip>
                                        <Tooltip text="Delete" :isHTML="false">
                                            <div class="documentAction materialSymbolsFilled px24 text-textColor cursor-pointer font-[300]" @click="deleteDocument(document.documentId, document.source)">delete</div>
                                        </Tooltip>

                                        <Tooltip v-if="getStatusText(document.status) === 'Not Vectorized'" text="Vectorize" :isHTML="false">
                                            <div class="documentAction materialSymbolsFilled px24 text-textColor cursor-pointer font-[300]" @click="vectorizeDocument(document)">manage_search</div>
                                        </Tooltip>
                                        <Tooltip v-else-if="document.status == 'vectorizing'" text="Vectorizing" :isHTML="false">
                                            <div class="documentAction materialSymbolsFilled px24 text-textColor animate-spin cursor-pointer font-[300]">progress_activity</div>
                                        </Tooltip>
                                        <Tooltip v-else text="Not Available" :isHTML="false">
                                            <div class="documentAction disabled materialSymbolsFilled px24 text-muted-foreground font-[300]">manage_search</div>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>

                            <!-- Notes -->
                            <tr v-for="note in documentStore.notes" :key="note.noteId" class="hover:bg-secondary hover:bg-secondary transition-colors">
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                    <input type="checkbox" :value="note.noteId" :checked="isNoteSelected(note.noteId)" @change="selectNote(note)" />
                                    {{ trimTitle(note.title) }}
                                </td>
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                    {{ formatEpochToDateString(note.createdAt) }}
                                </td>
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                    <Tags :tags="note.tags" @update:tagListUpdate="(data: any) => onTagsChange('note', data, note.noteId)" />
                                </td>
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">0 KB</td>
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                    {{ note.owner }}
                                </td>
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                    {{ getStatusText(note.status) }}
                                </td>
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">Note</td>
                                <td class="text-foreground text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                    <div class="documentActionsWrapper flex items-center justify-center gap-[10px]">
                                        <div class="documentAction materialSymbolsFilled px24 text-textColor cursor-pointer font-[300]">preview</div>
                                        <div class="documentAction materialSymbolsFilled px24 text-textColor cursor-pointer font-[300]">download</div>
                                        <div class="documentAction materialSymbolsFilled px24 text-textColor cursor-pointer font-[300]">edit</div>
                                        <div class="documentAction materialSymbolsFilled px24 text-textColor cursor-pointer font-[300]" @click="handleNoteDeletion(note.noteId)">delete</div>
                                    </div>
                                </td>
                            </tr>

                            <!-- If no documents found at all -->
                            <tr v-if="!documentStore.documents">
                                <td colspan="5">No documents found</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Popups & Modals (unchanged) -->
        <NotesPopUp v-if="showPopup" @save="handleSave" @discard="handleDiscard" />
        <EditFilePopUp v-if="showEditFilePopUp" :document="documentDataForEdit" @discard="editFilePopUpDiscard" @save="saveFileData" />
        <Capture v-if="showCameraCapture" :show="showCameraCapture" @update:show="showCameraCapture = false" />
        <GoogleDriveOnboarding v-if="!documentStore.isLoading && showGoogleDriveOnboarding" @close="closeGoogleDriveOnboarding" />
        <VectorizationProgress />
    </div>
</template>

<script setup lang="ts">
    import { convertMimeTypeToType, formatBytes, formatEpochToDateString, trimTitle, getShowPopupForIntegration, updateShowPopupForIntegration, capitalizeFirstLetter } from "~/util"
    const { showConfirmModal } = useModal()
    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })
    useHead({
        title: "Workbench",
    })
    // -------------------| Props |-------------------
    const props = defineProps({
        isMobile: Boolean,
    })

    // -----------| Static Data |-----------
    const documentActionMenuDropdownOptions = (document: ISingleDocument) => [
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
            {
                label: capitalizeFirstLetter(document.status),
                icon: document.status != "vectorized" ? "progress_activity" : "check",
                animated: document.status == "vectorizing" ? true : false,
            },
        ],
    ]
    // -------------------| Stores |-------------------
    const conversationStore = useConversationStore()
    const documentStore = useDocumentsStore()
    const organizationStore = useOrganizationStore()
    const userStore = useUserStore()
    const messageStore = useMessageStore()
    const ragStore = useRagStore()
    // -------------------| Composable |-------------------
    const user = useUser()
    const rag = useRag()
    const vectorDatabaseConfig = useVectorDatabaseConfig()

    // -------------------| Refs |------------------
    const isLoading = ref(false)
    const workbenchDocumentView = ref("widget")
    const isPersonalOrganizationSelected = ref<boolean>(true)
    const interactions = ref<any>([])
    const fileInput = ref<HTMLElement>()
    const selectedFile = ref(null)
    const showPopup = ref(false)
    const showEditFilePopUp = ref(false)
    const showDocumentManager = ref(false)
    const showCameraCapture = ref(false)
    const initialLoad = ref(true)
    const initialShowGoogleDriveOnboarding = () => {
        try {
            const googleIntegration = userStore.integrations["google"]

            if (!googleIntegration) {
                return getShowPopupForIntegration("google", "workbench")
            }

            const isExpired = googleIntegration.createdAt + 30 * 24 * 60 * 60 * 1000 <= Date.now()
            return isExpired && getShowPopupForIntegration("google", "workbench")
        } catch (error) {
            return false
        }
    }
    const showGoogleDriveOnboarding = ref(initialShowGoogleDriveOnboarding())
    const searchQuery = ref("")
    const selectedDocuments = ref<any>([])
    const selectedDocumentsBulk = ref<any>([])
    const selectedNotes = ref<any>([])
    const selectedFiles = ref<any>([])
    const chunkSize = ref<number>(600)
    const batchSize = ref(100)
    const chunkType = ref<string>("char")
    const currentCollectionInfo = computed(() => {
        return ragStore.collections.find((collection) => collection.name === ragStore.currentCollection)
    })
    const sorting = ref({
        column: "",
        order: "asc",
    })
    const documentDataForEdit = ref<any>({
        name: "",
        image: "",
        size: 0,
        tags: [],
        type: "",
    })
    const dropdownPosition = computed(() => {
        if (props.isMobile) {
            return "mirror"
        } else {
            return "bottomStart"
        }
    })
    const activeDocumentDropdownId = ref<string | null>(null)

    // ------------------| Function |---------------------
    async function switchOrganization(action: boolean) {
        const to = action == true ? "personal" : "team"
        const res = organizationStore.switchOrganization(to)
        if (res) {
            isPersonalOrganizationSelected.value = action
            isLoading.value = true
            await documentStore.fetchDocuments(true)
            await documentStore.fetchNotes(true)
            isLoading.value = false
            return
        } else {
            return console.log("Cannot Switch because only one organization exists")
        }
    }
    const changeSort = (column: string) => {
        if (sorting.value.column === column) {
            // Toggle sorting order if the same column is clicked again
            sorting.value.order = sorting.value.order === "asc" ? "desc" : "asc"
        } else {
            // Sort by new column, default to ascending
            sorting.value.column = column
            sorting.value.order = "asc"
        }
    }
    function editFilePopUpDiscard() {
        showEditFilePopUp.value = false
    }
    function saveFileData(data: any) {
        console.log("Data to save", data)
        showEditFilePopUp.value = false
    }
    function editDocument(documentId: string) {
        showEditFilePopUp.value = true
        const doc = documentStore.documents[documentId]
        documentDataForEdit.value = {
            name: doc.fileName,
            image: doc.filePreviewUrl,
            size: doc.fileSize,
            tags: doc.tags,
            type: doc.fileType,
        }
    }
    async function handleDropdownMenuItemClicked(data: any, documentId: string, file: any) {
        const action = data.label.toLowerCase()
        activeDocumentDropdownId.value = null
        if (action === "delete") {
            await deleteDocument(documentId, file.source)
        } else if (action === "rename") {
        } else if (action === "download") {
            downloadDocument(file)
        } else if (action === "vectorize") {
            vectorizeDocument(file)
        }
    }

    async function vectorizeDocument(document: any) {
        selectFileForVectorization(document.url, document.fileName, document.fileSize, document.documentId)
        await addFileForVectorization()
        document.status = "vectorizing"
    }

    async function vectorizeDocumentBulk(document: any) {
        selectFileForVectorizationBulk(document.url, document.fileName, document.fileSize, document.documentId)
        await addFileForVectorization(true)
    }

    const addFileForVectorization = async (bulk = false) => {
        if (currentCollectionInfo.value && (selectedFiles.value.length > 0 || selectedDocumentsBulk.value.length > 0)) {
            const files = bulk ? selectedDocumentsBulk.value : selectedFiles.value
            for (const file of files) {
                const fileName = bulk ? file.fileName : file.name
                const fileSize = bulk ? file.fileSize : file.size
                const documentId = file.documentId || ""
                await useRag().addFileToVectorizationQueue(fileName, file.url, "pdf", fileSize, ragStore.currentCollection, currentCollectionInfo.value.alias, "low", currentCollectionInfo.value.distance, currentCollectionInfo.value.embedding, chunkSize.value, chunkType.value, batchSize.value, documentId)
            }
            selectedDocuments.value = []
            selectedDocumentsBulk.value = []
            selectedFiles.value = []
            documentStore.fetchDocuments(true, initialLoad.value)
        }
    }

    const selectFileForVectorization = (url: any, name: any, size: any, documentId: any) => {
        const existingIndex = selectedFiles.value.findIndex((file: any) => file.url === url)
        if (existingIndex > -1) {
            selectedFiles.value.splice(existingIndex, 1)
        } else {
            selectedFiles.value.push({ url, name, size, documentId })
        }
    }

    const selectFileForVectorizationBulk = (url: any, name: any, size: any, documentId: any) => {
        selectedDocumentsBulk.value = selectedDocuments.value.filter((doc: any) => {
            const docStatus = getStatusText(doc.status)
            return docStatus === "Not Vectorized" || docStatus === "Vectorization Failed"
        })
    }

    async function deleteDocument(documentId: string, source: any) {
        const askForConfirmation = await showConfirmModal({
            shortName: "Delete File",
            title: "Are you sure you want to delete this file?",
            subtitle: "Related conversations will not work as expected. This action is permanent and cannot be undone.",
            confirmButtonText: "Delete",
            confirmButtonColor: "#FF5555",
            closeOnTopRight: true,
        })
        if (askForConfirmation === "confirm") {
            if (source) await user.deleteIntegrationFile(documentId, source.id)
            else await user.deleteDocument(documentId, organizationStore.currentOrganizationId)
            await documentStore.fetchDocuments(true)
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

    const handleSave = async (note: any) => {
        console.log("Note saved:", note)
        await user.createNote(
            {
                title: note.title,
                content: note.content,
                tags: [],
            },
            organizationStore.currentOrganizationId
        )
        showPopup.value = false // Hide the popup after saving
    }
    const filteredDocuments = computed(() => {
        const query = searchQuery.value.toLowerCase()
        try {
            // Filter the documents based on the search query
            let documents = Object.values(documentStore.documents).filter((document) => document.fileName.toLowerCase().includes(query) || document.fileType.toLowerCase().includes(query) || (document.tags && document.tags.some((tag: any) => tag.text.toLowerCase().includes(query))))

            // Apply sorting
            if (sorting.value.column) {
                documents = documents.sort((a, b) => {
                    let fieldA, fieldB

                    switch (sorting.value.column) {
                        case "name":
                            fieldA = a.fileName.toLowerCase()
                            fieldB = b.fileName.toLowerCase()
                            break
                        case "size":
                            fieldA = a.fileSize
                            fieldB = b.fileSize
                            break
                        case "owner":
                            fieldA = a.owner ? a.owner.toLowerCase() : ""
                            fieldB = b.owner ? b.owner.toLowerCase() : ""
                            break
                        case "status":
                            fieldA = a.status ? a.status.toLowerCase() : "Not applicalable"
                            fieldB = b.status ? b.status.toLowerCase() : "Not applicalable"
                            break
                        case "source":
                            fieldA = a.source ? a.source.name.toLowerCase() : ""
                            fieldB = b.source ? b.source.name.toLowerCase() : ""
                            break
                        case "updatedAt":
                            fieldA = new Date(a.updatedAt).getTime()
                            fieldB = new Date(b.updatedAt).getTime()
                            break
                        default:
                            return 0
                    }

                    // Compare fields and sort in ascending or descending order
                    if (sorting.value.order === "asc") {
                        return fieldA > fieldB ? 1 : -1
                    } else {
                        return fieldA < fieldB ? 1 : -1
                    }
                })
            }

            return documents
        } catch (error) {
            console.error("Failed to filter documents:", error)
            return Object.values(documentStore.documents)
        }
    })
    const triggerCameraCapture = () => {
        showCameraCapture.value = !showCameraCapture.value
    }
    const handleNoteDeletion = async (noteId: string) => {
        await user.deleteNote(noteId, organizationStore.currentOrganizationId)
        await documentStore.fetchNotes(true)
    }
    const handleDiscard = () => {
        console.log("Note discard action received")
        showPopup.value = false // Hide the popup after discard
    }
    const triggerFileInputClick = () => {
        if (!fileInput.value) return
        fileInput.value.click()
    }
    const handleFileChange = async (event: any) => {
        selectedFile.value = event.target.files[0]
        if (!selectedFile.value) {
            alert("Please select a file first.")
            return
        }
        try {
            isLoading.value = true
            await useUser().uploadFile(selectedFile.value)
            await documentStore.fetchDocuments(true)
            isLoading.value = false
        } catch (error) {
            isLoading.value = false
            console.log(error)
            alert("Upload failed")
        }
    }
    function handleDocumentClick(documentId: any) {
        conversationStore.conversationId = ""
        messageStore.messages = []
        messageStore.messagesTree = {}
        if (!documentId.startsWith("DOC_")) {
            useRouter().push(`/workbench/gd_${documentId}`)
        } else useRouter().push(`/workbench/${documentId}`)
    }
    function onTagsChange(type: string, tags: any, id: any) {
        if (type === "note") user.updateNoteData({ noteId: id, tags }, organizationStore.currentOrganizationId)
        else user.updateDocumentData({ documentId: id, tags }, organizationStore.currentOrganizationId)
    }
    const switchDocumentView = (view: string) => {
        workbenchDocumentView.value = view
    }
    const toggleDocumentManager = () => {
        showDocumentManager.value = !showDocumentManager.value
    }
    const selectDocument = (document: any) => {
        const index = selectedDocuments.value.findIndex((doc: any) => doc.documentId === document.documentId)

        if (index === -1) {
            // Document is not selected, so we add it
            selectedDocuments.value.push(document)
        } else {
            // Document is already selected, so we remove it
            selectedDocuments.value.splice(index, 1)
        }
    }

    const selectNote = (note: any) => {
        const index = selectedNotes.value.findIndex((n: any) => n.noteId === note.noteId)

        if (index === -1) {
            // Note is not selected, so we add it
            selectedNotes.value.push(note)
        } else {
            // Note is already selected, so we remove it
            selectedNotes.value.splice(index, 1)
        }
    }

    const isDocumentSelected = (documentId: string) => {
        return selectedDocuments.value.some((doc: any) => doc.documentId === documentId)
    }

    const isNoteSelected = (noteId: string) => {
        return selectedNotes.value.some((note: any) => note.noteId === noteId)
    }
    const getStatusText = (status: string) => {
        if (!status) return "N/A"
        else if (status === "n/a") return "N/A"
        else if (status === "vectorized") return "Vectorized"
        else if (status === "vectorizing") return "Vectorizing"
        else if (status === "vectorization_failed") return "Vectorization Failed"
        else return "Not Vectorized"
    }
    const handleDeleteSelected = async () => {
        if (selectedDocuments.value && selectedDocuments.value.length > 0) {
            const documentIds = selectedDocuments.value.map((doc: any) => doc.documentId)
            await user.deleteSelectedDocuments(documentIds, organizationStore.currentOrganizationId)
            await documentStore.fetchDocuments(true)
        }
        if (selectedNotes.value && selectedNotes.value.length > 0) {
            const noteIds = selectedNotes.value.map((note: any) => note.noteId)
            await user.deleteSelectedNotes(noteIds, organizationStore.currentOrganizationId)
            await documentStore.fetchNotes(true)
        }
        selectedDocuments.value = []
        selectedNotes.value = []
    }

    const downloadDocument = async (data: any) => {
        await rag.downloadFile(data.url, data.fileName)
    }
    const closeGoogleDriveOnboarding = () => {
        showGoogleDriveOnboarding.value = false
        updateShowPopupForIntegration("google", "workbench", false)
    }
    // ! TODO:  Improvements needed here
    watch(
        () => documentStore.documents,
        (_newVal) => {
            const conversationsInArray: any = Object.values(conversationStore.conversations)
            const interactionsArray = conversationsInArray.filter((conversation: any) => conversation.metaData.type === "interaction")
            interactions.value = []
            interactionsArray.forEach((interaction: IConversation) => {
                const interactionData = {
                    title: interaction.title,
                    image: documentStore.documents[interaction.metaData.linkedDocumentId]?.filePreviewUrl || "https://via.placeholder.com/250",
                    updatedAt: new Date(interaction.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
                    type: interaction.metaData.type,
                    author: userStore.firstName,
                    conversationId: interaction.conversationId,
                }
                return interactions.value.push(interactionData)
            })
        }
    )

    onMounted(async () => {
        conversationStore.conversationId = ""
        messageStore.messages = []
        messageStore.messagesTree = {}
        // await conversationStore.fetchConversations()
        await documentStore.fetchDocuments(true, initialLoad.value)
        await documentStore.fetchNotes()
        if (initialLoad.value) initialLoad.value = false
    })
</script>
