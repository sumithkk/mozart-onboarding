<script setup lang="ts">
    import { ref, computed, watch, inject, type ComputedRef, h, resolveComponent } from "vue"
    import { FolderIcon, DocumentIcon, VideoCameraIcon, PhotoIcon, FolderPlusIcon, ArrowUpTrayIcon, QuestionMarkCircleIcon, BookOpenIcon } from "@heroicons/vue/24/outline"
    import eventBus from "~/util/eventBus"
    import { v4 as uuidv4 } from "uuid"
    import { Dialog, DialogPanel } from "@headlessui/vue"
    import useFileSystemComposable from "~/composables/useFileSystem"
    import { convertMimeTypeToType } from "~/util"
    import type { TableColumn } from "@nuxt/ui"
    import type { ICollection } from "~/types/rag-service"

    // Props
    const props = defineProps({
        path: {
            required: false,
        },
    })

    const selectedOptions = ref<string[]>([])

    const route = useRoute()
    const rag = useRag()
    const user = useUser()

    // Stores and Composables
    const userStore = useUserStore()
    const ragStore = useRagStore()
    const fileSystemComposable = useFileSystemComposable()
    const fileSystem = useFileSystem()

    const fileSystemStore = useFileSystemStore()
    const conversationStore = useConversationStore()
    const messageStore = useMessageStore()
    const isMobile = inject<ComputedRef<boolean>>("isMobile")
    const organizationStore = useOrganizationStore()
    const documentStore = useDocumentsStore()

    // Get settings from userStore - using computed to avoid destructuring issues
    const settings = computed(() => userStore.settings)
    // View mode state
    const viewMode = ref<"grid" | "list">("list")

    // Selection state (from stashed changes)
    const selectedFiles = ref<Set<string>>(new Set())

    // Files state
    const files = computed(() => fileSystemStore.filesAndFolders)

    // Current folder, search, sort, filter
    const showHiddenFiles = ref(false)
    const searchQuery = ref("")
    const sortBy = ref<"name" | "date" | "size" | "type" | "owner" | "source">("name")
    const sortDirection = ref<"asc" | "desc">("asc")
    const filterType = ref<string | null>("all-types")

    // Drag and drop state
    const draggedItems = ref<FileItem[] | null>(null)
    const dropTarget = ref<FileItem | null>(null)
    const isDraggingOver = ref(false)

    const globalDragCounter = ref(0)
    const isGlobalDragging = ref(false)

    const keySequence = ref<string[]>([])
    let keyTimer: NodeJS.Timeout | null = null

    const folderMap = new Map<string, string>()
    const showShortcutsModal = ref(false)
    const table = ref()

    const ignoredFileNames = [".ds_store", "thumbs.db", "desktop.ini", ".localized", ".git", ".gitignore", ".gitattributes", ".svn", ".hg", ".idea", ".vscode", ".env", ".env.local", "node_modules", "__pycache__", ".pytest_cache", ".cache", ".next", "dist", "build"]

    const uploadIntent = ref<"file" | "folder">("file")
    const showGoogleDrivePicker = ref(false)

    // Context menu and modal state

    const contextMenu = ref<{ x: number; y: number; file: FileItem } | null>(null)
    const selectedFile = ref<FileItem | null>(null)
    const showPermissionsModal = ref(false)
    const showShareModal = ref(false)
    const showVersionHistoryModal = ref(false)
    const showUploadModal = ref(false)
    const showRenameModal = ref(false)
    const showCreateNoteModal = ref(false)
    const showEditNoteModal = ref(false)
    const selectedNote = ref<any>(null)
    const newName = ref("")
    const vectorizeFiles = computed(() => selectedOptions.value.includes("vectorize"))
    const uploadError = ref<string | null>(null)
    const showNewFolderModal = ref(false)
    const newFolderName = ref("")
    const isCreatingFolder = ref(false)
    const folderCreationTimeout = ref<NodeJS.Timeout | null>(null)
    const chunkSize = ref<number>(600)
    const batchSize = ref(100)
    const chunkType = ref<string>("page")
    const isAnonymous = computed(() => selectedOptions.value.includes("anonymous"))
    const keepOriginal = computed(() => selectedOptions.value.includes("keepOriginal") && isAnonymous.value)
    const showAnonymizationTermsModal = ref(false)
    const anonymizationTerms = ref("")
    const showDeleteConfirmationModal = ref(false)
    const fileToDelete = ref<FileItem | null>(null)
    const showBulkDeleteConfirmationModal = ref(false)
    const isDeleting = ref(false)
    const mimeTypesAllowedForVectorization = ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream", "text/html", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
    const uploadProgressMap = ref<Map<string, { percentage: number; state: "uploading" | "completed" | "error" }>>(new Map())
    const uploadStatusMessages = ref<Map<string, { message: string; type: "success" | "error" | "info" }>>(new Map())
    const isUploading = ref(false)
    const uploadQueue = ref<File[]>([])
    const failedUploads = ref<File[]>([])
    const fileUploadInput = ref<HTMLInputElement | null>(null)
    const folderUploadInput = ref<HTMLInputElement | null>(null)
    const currentCollectionInfo = computed(() => {
        return ragStore.collections.find((collection: ICollection) => collection.name === ragStore.currentCollection)
    })

    // Convert notes to FileItem format for display
    const notesAsFiles = computed(() => {
        const notes = documentStore.notes || {}
        const notesArray = Object.values(notes).map((note: any) => {
            // Calculate size from content (UTF-8 encoding: 1 byte per ASCII char, more for special chars)
            const contentSize = note.content ? new Blob([note.content]).size : 0
            return {
                id: `note_${note.noteId}`,
                name: note.title || "Untitled Note",
                type: "file" as const,
                path: "/", // Notes always at root path
                size: contentSize,
                mimeType: "text/plain",
                parentFolderId: "root",
                ownerId: note.userId || "",
                createdAt: new Date(note.createdAt || Date.now()),
                updatedAt: new Date(note.updatedAt || note.createdAt || Date.now()),
                lastModifiedBy: note.owner || "Unknown",
                isStarred: false,
                isTrashed: false,
                isHidden: false,
                isShared: false,
                isSharedWithMe: false,
                status: note.status || "uploaded",
                isNote: true, // Flag to identify notes
                noteId: note.noteId,
                noteContent: note.content,
            } as FileItem & { isNote: boolean; noteId: string; noteContent: string }
        })
        return notesArray
    })

    // Computed files based on current path, search, sort, and filter
    const currentFiles = computed(() => {
        // Combine files and notes (only show notes at root path)
        const allItems = [...files.value]
        if (fileSystemStore.currentPath === "/") {
            allItems.push(...notesAsFiles.value)
        }

        let filtered = allItems.filter((file: FileItem) => {
            const inCurrentPath = file.path === fileSystemStore.currentPath
            const matchesSearch = file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
            // Filter logic: show notes only when filter is "all-types" or "notes", otherwise check type match for files
            const matchesFilter = filterType.value === "all-types" 
                ? true
                : filterType.value === "notes"
                ? (file as any).isNote
                : (file as any).isNote
                    ? false // Hide notes when a specific file type is selected
                    : mimeTypeToType(file.mimeType) === filterType.value
            const isVisible = showHiddenFiles.value || !file.isHidden
            return inCurrentPath && matchesSearch && matchesFilter && isVisible
        })

        return filtered.sort((a: FileItem, b: FileItem) => {
            let comparison = 0
            if (sortBy.value === "name") {
                comparison = a.name.localeCompare(b.name)
            } else if (sortBy.value === "date") {
                // Ensure updatedAt is converted to Date object before comparison
                const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt)
                const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt)
                comparison = dateA.getTime() - dateB.getTime()
            } else if (sortBy.value === "size") {
                comparison = a.size - b.size
            } else if (sortBy.value === "type") {
                // Sort folders first, then by type name
                const typeA = a.type === "folder" ? "0_folder" : convertMimeTypeToType(a.mimeType)
                const typeB = b.type === "folder" ? "0_folder" : convertMimeTypeToType(b.mimeType)
                comparison = typeA.localeCompare(typeB)
            } else if (sortBy.value === "owner") {
                const ownerA = a.lastModifiedBy || "Unknown"
                const ownerB = b.lastModifiedBy || "Unknown"
                comparison = ownerA.localeCompare(ownerB)
            } else if (sortBy.value === "source") {
                const sourceA = a.source?.name || ""
                const sourceB = b.source?.name || ""
                comparison = sourceA.localeCompare(sourceB)
            }
            return sortDirection.value === "asc" ? comparison : -comparison
        })
    })

    // Anonymization Terms Modal
    const handleAnonymizationTerms = (terms: string) => {
        anonymizationTerms.value = terms
        showAnonymizationTermsModal.value = false
    }

    // View mode handlers
    const handleViewChange = (mode: "grid" | "list") => {
        viewMode.value = mode
    }

    // Navigation handlers
    const handlePathChange = (path: string) => {
        fileSystemStore.currentPath = path
        fileSystemStore.updateNavigatedFolderIds()
    }

    // Search handlers
    const handleSearch = (query: string) => {
        searchQuery.value = query
    }

    // Sort and filter handlers
    const handleSort = (option: "name" | "date" | "size" | "type" | "owner" | "source", direction: "asc" | "desc") => {
        sortBy.value = option
        sortDirection.value = direction
    }

    // Handle sorting from NuxtUI Table
    const handleTableSort = (column: { key: string; direction: "asc" | "desc" }) => {
        console.log("Table sort triggered:", column)
        let sortKey: "name" | "date" | "size" = "name"

        if (column.key === "name") sortKey = "name"
        else if (column.key === "size") sortKey = "size"
        else if (column.key === "updatedAt") sortKey = "date"
        else if (column.key === "type")
            sortKey = "name" // fallback to name for type
        else if (column.key === "lastModifiedBy")
            sortKey = "name" // fallback to name for owner
        else if (column.key === "source") sortKey = "name" // fallback to name for source

        handleSort(sortKey, column.direction)
    }
    const handleFilter = (type: string | null) => {
        filterType.value = type
    }
    const handleToggleHidden = () => {
        showHiddenFiles.value = !showHiddenFiles.value
    }

    // Check if a file is being dragged
    const isFileBeingDragged = (file: FileItem) => {
        return draggedItems.value && draggedItems.value.some((f) => f.id === file.id)
    }

    // Drag and drop handlers
    const handleDragStart = (file: FileItem, event: DragEvent) => {
        if (selectedFiles.value.size > 1 && selectedFiles.value.has(file.id)) {
            // Dragging multiple selected files
            draggedItems.value = currentFiles.value.filter((f: FileItem) => selectedFiles.value.has(f.id))
        } else {
            // Dragging single file
            draggedItems.value = [file]
            // Reset selection to this file only
            selectedFiles.value = new Set([file.id])
        }
        if (event.dataTransfer && draggedItems.value) {
            event.dataTransfer.effectAllowed = "move"
            // Set dataTransfer data to an array of file ids
            const fileIds = draggedItems.value.map((f: FileItem) => f.id)
            event.dataTransfer.setData("text/plain", JSON.stringify(fileIds))
            // Create custom drag image
            const dragImage = document.createElement("div")
            dragImage.style.position = "absolute"
            dragImage.style.top = "-1000px"
            dragImage.style.left = "-1000px"
            dragImage.style.zIndex = "10000"
            if (draggedItems.value && draggedItems.value.length > 1) {
                dragImage.innerHTML = `<div style="padding: 10px; background: rgba(0,0,0,0.7); color: white; border-radius: 4px;">${draggedItems.value.length} items</div>`
            } else if (draggedItems.value && draggedItems.value.length === 1) {
                dragImage.innerHTML = `<div style="padding: 10px; background: rgba(0,0,0,0.7); color: white; border-radius: 4px;">${draggedItems.value[0].name}</div>`
            }
            document.body.appendChild(dragImage)
            event.dataTransfer.setDragImage(dragImage, 0, 0)
            // Clean up dragImage after drag ends
            document.addEventListener(
                "dragend",
                () => {
                    document.body.removeChild(dragImage)
                },
                { once: true }
            )
        }
    }
    const handleDragOver = (file: FileItem, event: DragEvent) => {
        event.preventDefault()
        if (file.type === "folder" && (!draggedItems.value || !draggedItems.value.some((f) => f.id === file.id))) {
            dropTarget.value = file
            isDraggingOver.value = true
        }
    }
    const handleDragLeave = () => {
        dropTarget.value = null
        isDraggingOver.value = false
    }
    const handleDrop = async (targetFile: FileItem, event: DragEvent) => {
        event.preventDefault()
        if (draggedItems.value && targetFile.type === "folder") {
            for (const sourceFile of draggedItems.value) {
                if (sourceFile.id !== targetFile.id) {
                    await fileSystemStore.moveFileOrFolder(sourceFile.id, targetFile.id, sourceFile.type, sourceFile.source)
                }
            }
        }
        draggedItems.value = null
        dropTarget.value = null
        isDraggingOver.value = false
    }

    // Clean up drag state when drag ends (e.g., cancelled or dropped outside valid zone)
    const handleDragEnd = () => {
        draggedItems.value = null
        dropTarget.value = null
        isDraggingOver.value = false
        globalDragCounter.value = 0
        isGlobalDragging.value = false
    }

    // File selection handler (single-click only selects)
    const handleFileClick = (file: FileItem, event: MouseEvent) => {
        const fileId = file.id
        
        // Mobile: if file is already selected, open it (simulates double-tap)
        if (isMobile?.value && selectedFiles.value.has(fileId) && selectedFiles.value.size === 1) {
            handleFileDoubleClick(file, event)
            return
        }
        
        // Multi-select logic
        if (event.shiftKey) {
            const filesInCurrentView = currentFiles.value.map((f: FileItem) => f.id)
            const lastSelectedFile = Array.from(selectedFiles.value).pop()
            if (lastSelectedFile) {
                const startIndex = filesInCurrentView.indexOf(lastSelectedFile)
                const endIndex = filesInCurrentView.indexOf(fileId)
                const range = filesInCurrentView.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1)
                selectedFiles.value = new Set([...selectedFiles.value, ...range])
            } else {
                selectedFiles.value.add(fileId)
            }
        } else if (event.ctrlKey || event.metaKey) {
            // Toggle selection
            if (selectedFiles.value.has(fileId)) {
                selectedFiles.value.delete(fileId)
            } else {
                selectedFiles.value.add(fileId)
            }
        } else {
            // Single selection
            selectedFiles.value = new Set([fileId])
        }
    }

    // File interaction handler (double-click opens files/folders)
    const handleFileDoubleClick = async (file: FileItem, event: MouseEvent) => {
        event.preventDefault()

        if (file.type === "folder") {
            // Navigate into folder
            fileSystemStore.currentFolderId = file.id
            let folderIds: string[] = []
            if (typeof route.params.path === "string") {
                folderIds = [route.params.path]
            } else if (Array.isArray(route.params.path)) {
                folderIds = route.params.path
            }

            // Append the new folder's ID
            folderIds = folderIds.filter(Boolean)
            folderIds.push(file.id)

            // Navigate using the router
            await fileSystemStore.navigateToFolder({ folderId: file.id })
        } else if (file.type === "file") {
            // Handle note double-click
            if ((file as any).isNote) {
                selectedNote.value = {
                    noteId: (file as any).noteId,
                    title: file.name,
                    content: (file as any).noteContent,
                }
                showEditNoteModal.value = true
                return
            }
            
            // Open file for interaction using enhanced conversation switching
            const { useConversationSwitching } = await import("~/composables/useConversationSwitching")
            const conversationSwitching = useConversationSwitching()

            // Check if we're already switching
            if (conversationSwitching.isLoading.value) {
                console.log("Conversation switch already in progress")
                return
            }

            // Determine the conversation ID based on file type
            const conversationId = file.id.startsWith("FS_") ? file.id : `gd_${file.id}`

            // Use enhanced switching logic
            const success = await conversationSwitching.switchToConversation(conversationId, {
                showLoadingIndicator: true,
                enableRollback: true,
                transitionDuration: 200,
            })

            if (!success) {
                console.error("Failed to switch to file conversation:", conversationId)
                // Show error toast
                eventBus.emit("showToast", {
                    message: "Failed to open file",
                    _type: "error",
                })
            }
        }
    }
    const clearSelection = () => {
        selectedFiles.value.clear()
    }

    // Context menu
    const handleContextMenu = (file: FileItem, event: MouseEvent) => {
        event.preventDefault()
        contextMenu.value = {
            x: event.pageX,
            y: event.pageY,
            file,
        }
    }
    const handleMoreOptionsClick = (file: FileItem, event: MouseEvent) => {
        event.stopPropagation()
        const rect = (event.target as HTMLElement).getBoundingClientRect()
        contextMenu.value = {
            x: rect.right,
            y: rect.bottom,
            file,
        }
    }

    // Rename workflow (keep the modal approach)
    const handleRenameModal = (file: FileItem) => {
        newName.value = file.name
        showRenameModal.value = true
        selectedFile.value = file
        contextMenu.value = null
    }
    const handleRename = async () => {
        const file = selectedFile.value
        if (!file) return
        // Use store-based rename
        await fileSystemStore.renameFileOrFolder(file.id, newName.value, (file as any).isNote ? 'note' : file.type)
        showRenameModal.value = false
    }

    // Delete file or folder (store-based)
    const handleDelete = async (file: FileItem) => {
        contextMenu.value = null

        // Handle note deletion separately
        if ((file as any).isNote) {
            const orgStore = useOrganizationStore()
            const organizationId = orgStore.currentOrganizationId || orgStore.currentOrganization?.id
            if (!organizationId) {
                console.error("No organization ID available for note deletion")
                return
            }
            try {
                await useUser().deleteNote((file as any).noteId, organizationId)
                await documentStore.fetchNotes(true)
            } catch (error) {
                console.error("Error deleting note:", error)
            }
            return
        }

        // Check if the right-clicked file is part of a multi-selection
        const isRightClickedFileSelected = selectedFiles.value.has(file.id)
        const hasMultipleSelection = selectedFiles.value.size > 1

        if (hasMultipleSelection && isRightClickedFileSelected) {
            // If multiple files are selected and the right-clicked file is among them,
            // delete all selected files
            showBulkDeleteConfirmationModal.value = true
        } else if (hasMultipleSelection && !isRightClickedFileSelected) {
            // If multiple files are selected but the right-clicked file is not among them,
            // clear selection and delete only the right-clicked file
            selectedFiles.value.clear()
            selectedFiles.value.add(file.id)
            fileToDelete.value = file
            showDeleteConfirmationModal.value = true
        } else {
            // Single file deletion (either no selection or single selection)
            fileToDelete.value = file
            showDeleteConfirmationModal.value = true
        }
    }

    // Actual delete operation after confirmation
    const confirmDelete = async () => {
        if (fileToDelete.value) {
            isDeleting.value = true
            const type = fileToDelete.value.type
            await fileSystemStore.deleteFileOrFolder(fileToDelete.value.id, fileToDelete.value.type, fileToDelete.value.source?.id)
            showDeleteConfirmationModal.value = false
            fileToDelete.value = null
            isDeleting.value = false

            eventBus.emit("showToast", {
                message: `${type === 'file' ? 'File' : 'Folder'} deleted successfully`,
                _type: "success",
            })
        }
    }

    // Bulk delete (local approach; adapt if your store has a bulk API)
    const handleBulkDelete = () => {
        showBulkDeleteConfirmationModal.value = true
    }

    // Actual bulk delete operation after confirmation
    const confirmBulkDelete = async () => {
        isDeleting.value = true
        try {
            // Get all selected files
            const filesToDelete = Array.from(selectedFiles.value)
                .map((fileId) => files.value.find((f: FileItem) => f.id === fileId))
                .filter(Boolean) as FileItem[]

            // Delete each file using the store's delete method
            for (const file of filesToDelete) {
                await fileSystemStore.deleteFileOrFolder(file.id, file.type, file.source?.id)
            }

            // Clear selection and close modal
            selectedFiles.value.clear()
            showBulkDeleteConfirmationModal.value = false
        } catch (error) {
            console.error("Error during bulk delete:", error)
            // Show error message to user
            eventBus.emit("showToast", {
                message: "Some files could not be deleted. Please try again.",
                _type: "error",
            })
        } finally {
            isDeleting.value = false
        }
    }

    // Copy logic (local copying)
    const handleCopy = (file: FileItem) => {
        const newFile = {
            ...file,
            id: uuidv4(),
            name: `${file.name} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        files.value.push(newFile)
        contextMenu.value = null
    }
    const handleBulkCopy = () => {
        selectedFiles.value.forEach((fileId) => {
            const file = files.value.find((f: FileItem) => f.id === fileId)
            if (file) {
                const newFile = {
                    ...file,
                    id: uuidv4(),
                    name: `${file.name} (Copy)`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
                files.value.push(newFile)
            }
        })
        selectedFiles.value.clear()
    }

    // Permissions, share, versions
    const handlePermissions = (file: FileItem) => {
        selectedFile.value = file
        showPermissionsModal.value = true
        contextMenu.value = null
    }
    const handleShare = async (file: FileItem) => {
        selectedFile.value = file
        showShareModal.value = true
        const sharedUsers = await useFileSystem().getSharedUsers(file.id)
        if (sharedUsers && sharedUsers.length > 0) {
            fileSystemStore.saveSharedUsers(file.id, sharedUsers)
        }
        contextMenu.value = null
    }
    const handleVersions = (file: FileItem) => {
        selectedFile.value = file
        showVersionHistoryModal.value = true
        contextMenu.value = null
    }
    const handleAnonymize = (file: FileItem) => {
        selectedFile.value = file
        showAnonymizationTermsModal.value = true
        contextMenu.value = null
    }
    const handleVectorization = async (file: FileItem) => {
        selectedFile.value = file
        contextMenu.value = null
        if (!selectedFiles.value.has(file.id)) selectedFiles.value.add(file.id)
        const files = Array.from(selectedFiles.value).map((id) => fileSystemStore.getFileById(id))
        for (const file of files) {
            if (file && file.type === "file" && file.url && currentCollectionInfo.value) {
                if (!mimeTypesAllowedForVectorization.includes(file.mimeType)) {
                    eventBus.emit("showToast", {
                        message: `Skipping ${file.name} as ${file.mimeType} is not supported for vectorization`,
                        _type: "warning",
                    })
                } else {
                    let page_count = 0
                    if (file?.source?.id) {
                        const pagedata = await useUser().getSourceFileParsedPagedata(file.source.id, file.id, file.name, file?.url || "", file.mimeType)
                        page_count = pagedata?.numberOfPages || 0
                    } else {
                        const pagedata = await user.getDocumentParsedData(file.id, organizationStore.currentOrganizationId)
                        page_count = pagedata?.numberOfPages || 0
                    }
                    await rag.addFileToVectorizationQueue(file.name, file.url, file.mimeType, file.size, ragStore.currentCollection, currentCollectionInfo.value.alias, "low", currentCollectionInfo.value.distance, currentCollectionInfo.value.embedding, chunkSize.value, chunkType.value, batchSize.value, file.id, page_count)
                }
            }
        }
        selectedFile.value = null
        selectedFiles.value = new Set()
    }
    const handleNoteSave = async (note: any) => {
        try {
            const orgStore = useOrganizationStore()
            const organizationId = orgStore.currentOrganizationId || orgStore.currentOrganization?.id
            if (!organizationId) {
                console.error("No organization ID available for note creation")
                eventBus.emit("showToast", {
                    message: "Failed to create note: No organization selected",
                    _type: "error",
                })
                showCreateNoteModal.value = false
                return
            }
            const success = await useUser().createNote(
                {
                    title: note.title,
                    content: note.content,
                    tags: [],
                },
                organizationId
            )
            
            if (success) {
                showCreateNoteModal.value = false // Hide the popup after saving
                await documentStore.fetchNotes(true)
            }
        } catch (error) {
            console.error("Error saving note:", error)
            eventBus.emit("showToast", {
                message: "An unexpected error occurred while saving the note",
                _type: "error",
            })
            showCreateNoteModal.value = false // Close modal even on error
        }
    }
    
    const handleNoteUpdate = async (note: any) => {
        try {
            const orgStore = useOrganizationStore()
            const organizationId = orgStore.currentOrganizationId || orgStore.currentOrganization?.id
            if (!organizationId) {
                console.error("No organization ID available for note update")
                eventBus.emit("showToast", {
                    message: "Failed to update note: No organization selected",
                    _type: "error",
                })
                showEditNoteModal.value = false
                selectedNote.value = null
                return
            }
            const success = await useUser().updateNoteData(
                {
                    noteId: note.noteId,
                    title: note.title,
                    content: note.content,
                    organizationId,
                },
                organizationId
            )
            
            if (success) {
                showEditNoteModal.value = false
                selectedNote.value = null
                await documentStore.fetchNotes(true)
            }
        } catch (error) {
            console.error("Error updating note:", error)
            eventBus.emit("showToast", {
                message: "An unexpected error occurred while updating the note",
                _type: "error",
            })
            showEditNoteModal.value = false // Close modal even on error
            selectedNote.value = null
        }
    }
    
    const updatePermissions = (permissions: FilePermission[]) => {
        if (selectedFile.value) {
            const index = files.value.findIndex((f: FileItem) => f.id === selectedFile.value?.id)
            if (index !== -1) {
                files.value[index] = {
                    ...files.value[index],
                    permissions,
                }
            }
        }
    }
    const shareWithUsers = (emails: string[]) => {
        console.log("Sharing with:", emails)
    }
    const restoreVersion = (version: FileVersion) => {
        console.log("Restoring version:", version)
    }
    const handleAnonymizationModalClose = async () => {
        showAnonymizationTermsModal.value = false
        if (selectedFile.value) {
            await fileSystem.anonymizeExistingFile(selectedFile.value.id, anonymizationTerms.value)
        }
        selectedFile.value = null
    }
    // Create folder with debouncing and loading state
    const handleCreateFolder = async () => {
        // Prevent multiple simultaneous folder creation requests
        if (isCreatingFolder.value) {
            return
        }

        // Clear any existing timeout
        if (folderCreationTimeout.value) {
            clearTimeout(folderCreationTimeout.value)
        }

        // Set loading state immediately
        isCreatingFolder.value = true

        try {
            const newFolder: FileItem = {
                id: uuidv4(),
                name: newFolderName.value,
                type: "folder",
                path: fileSystemStore.currentPath,
                parentFolderId: fileSystemStore.currentFolderId || "",
                size: 0,
                ownerId: userStore.userId,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastModifiedBy: userStore.firstName,
                isStarred: false,
                isTrashed: false,
                isHidden: false,
                isShared: false,
                isSharedWithMe: false,
                mimeType: "",
                status: "uploaded",
            }

            // Add debounce delay to prevent rapid successive calls
            await new Promise((resolve) => {
                folderCreationTimeout.value = setTimeout(resolve, 300)
            })

            const isSuccess = await fileSystem.createFolder(newFolder)
            if (!isSuccess) {
                isCreatingFolder.value = false
                return
            }

            // Reset form and close modal
            newFolderName.value = "New Folder"
            showNewFolderModal.value = false
            files.value.push(newFolder)
        } catch (error) {
            console.error("Error creating folder:", error)
        } finally {
            // Always reset loading state
            isCreatingFolder.value = false
            folderCreationTimeout.value = null
        }
    }

    const createFolder = async (folderName: string, parentFolderId: string, fullPath: string) => {
        const folder: FileItem = {
            id: uuidv4(),
            name: folderName,
            type: "folder",
            path: fullPath === `/${folderName}` ? "/" : fullPath, // ✅ Only top-level folders get "/"
            parentFolderId,
            size: 0,
            ownerId: userStore.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastModifiedBy: userStore.firstName,
            isStarred: false,
            isTrashed: false,
            isHidden: false,
            isShared: false,
            isSharedWithMe: false,
            mimeType: "",
            status: "uploaded",
        }

        try {
            const success = await fileSystemComposable.createFolder(folder)
            if (!success) {
                console.error(`Failed to create folder: ${folderName}`)
                return false
            }
            files.value.push(folder)
            return folder
        } catch (error) {
            console.error(`Error during folder creation for ${folderName}:`, error)
            return false
        }
    }

    const uploadFile = async (file: File, fileName: string, parentFolderId: string, fullPath: string, isSubFile: boolean) => {
        if (ignoredFileNames.includes(fileName.toLowerCase())) {
            console.warn(`Skipping ignored file: ${fileName}`)
            return
        }

        const newFile: FileItem = {
            id: `FS_${uuidv4()}`,
            name: fileName,
            type: "file",
            path: isSubFile ? fullPath : fileSystemStore.currentPath,
            parentFolderId: isSubFile ? parentFolderId : fileSystemStore.currentFolderId || "",
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

        const startTime = Date.now()
        const minDisplayTime = 1500 // Minimum 1.5 seconds to show progress

        try {
            // Update status to show upload is starting
            uploadStatusMessages.value.set(newFile.name, { message: "Preparing upload...", type: "info" })

            // Add a small delay to show the initial state
            await new Promise((resolve) => setTimeout(resolve, 100))

            const success = await fileSystemComposable.createFile(
                (percent: number) => {
                    console.log("Upload progress:", percent, newFile.name)
                    // Ensure progress is between 0 and 100
                    const clampedPercent = Math.max(0, Math.min(100, percent))
                    uploadProgressMap.value.set(newFile.name, { percentage: clampedPercent, state: "uploading" })

                    if (clampedPercent < 100) {
                        uploadStatusMessages.value.set(newFile.name, { message: `Uploading... ${clampedPercent}%`, type: "info" })
                    }
                },
                file,
                newFile,
                isAnonymous.value,
                keepOriginal.value,
                anonymizationTerms.value,
                false // Don't show individual toasts for batch uploads
            )

            if (success) {
                // Ensure we show 100% completion
                uploadProgressMap.value.set(newFile.name, { percentage: 100, state: "completed" })
                uploadStatusMessages.value.set(newFile.name, { message: "Upload completed successfully", type: "success" })

                if (vectorizeFiles.value) {
                    uploadStatusMessages.value.set(newFile.name, { message: "Processing file...", type: "info" })
                    await handleVectorization(newFile)
                    uploadStatusMessages.value.set(newFile.name, { message: "File processed successfully", type: "success" })
                }

                // Calculate remaining time to meet minimum display time
                const elapsedTime = Date.now() - startTime
                const remainingTime = Math.max(0, minDisplayTime - elapsedTime)

                // Clear status message after minimum display time
                setTimeout(() => {
                    uploadStatusMessages.value.delete(newFile.name)
                    // Remove from progress map after additional delay
                    setTimeout(() => {
                        uploadProgressMap.value.delete(newFile.name)
                    }, 2000)
                }, remainingTime + 1000)
            } else {
                throw new Error("Upload failed")
            }
        } catch (error) {
            console.error("Upload error for file:", fileName, error)
            uploadProgressMap.value.set(newFile.name, { percentage: 0, state: "error" })
            uploadStatusMessages.value.set(newFile.name, { message: `Upload failed: ${error}`, type: "error" })
            failedUploads.value.push(file)
        }
    }

    const handleUploadFiles = async (uploadedFiles: File[]) => {
        try {
            const uniqueFiles = []
            for (const file of uploadedFiles) {
                const relativePath = file.webkitRelativePath || file.name
                const normalizedPath = `${fileSystemStore.currentPath}/${relativePath}`.replace(/\/+/g, "/")

                const exists = files.value.some((f: FileItem) => `${f.path}/${f.name}`.replace(/\/+/g, "/").toLowerCase() === normalizedPath.toLowerCase())

                if (exists) {
                    eventBus.emit("showToast", {
                        message: `File "${relativePath}" already exists in this folder`,
                        _type: "error",
                    })
                    uploadError.value = `File "${relativePath}" already exists in this folder`
                } else {
                    uniqueFiles.push(file)
                }
            }

            if (uniqueFiles.length === 0) {
                // Stop here, only duplicates
                isUploading.value = false
                return
            }

            isUploading.value = true
            uploadQueue.value = [...uniqueFiles]
            failedUploads.value = []
            uploadError.value = null

            // First, create all necessary folders
            const folderMap = new Map<string, string>()
            const folderCreationPromises: Promise<void>[] = []

            for (const file of uniqueFiles) {
                const relativePath = file.webkitRelativePath || file.name
                const pathParts = relativePath.split("/")
                const fileName = pathParts.pop()!

                let currentParentId = fileSystemStore.currentFolderId || ""
                let currentFullPath = ""

                for (const part of pathParts) {
                    currentFullPath = currentFullPath ? `${currentFullPath}/${part}` : `/${part}`

                    if (!folderMap.has(currentFullPath)) {
                        const parentPath = currentFullPath.substring(0, currentFullPath.lastIndexOf("/")) || "/"
                        const folderPromise = createFolder(part, currentParentId, parentPath).then((folderCreated) => {
                            if (folderCreated) {
                                folderMap.set(currentFullPath, folderCreated.id)
                            } else {
                                console.error(`Failed to create folder: ${part}`)
                            }
                        })
                        folderCreationPromises.push(folderPromise)
                    }
                }
            }

            // Wait for all folders to be created
            await Promise.all(folderCreationPromises)

            // Initialize all files in progress map immediately
            for (const file of uniqueFiles) {
                const relativePath = file.webkitRelativePath || file.name
                const pathParts = relativePath.split("/")
                const fileName = pathParts.pop()!

                uploadProgressMap.value.set(fileName, { percentage: 0, state: "uploading" })
                uploadStatusMessages.value.set(fileName, { message: "Queued for upload...", type: "info" })
            }

            // Now upload all files concurrently
            const uploadPromises = uniqueFiles.map(async (file) => {
                const relativePath = file.webkitRelativePath || file.name
                const pathParts = relativePath.split("/")
                const fileName = pathParts.pop()!

                let currentParentId = fileSystemStore.currentFolderId || ""
                let currentFullPath = ""
                let isSubFile = false

                // Determine the correct parent folder
                for (const part of pathParts) {
                    currentFullPath = currentFullPath ? `${currentFullPath}/${part}` : `/${part}`
                    if (folderMap.has(currentFullPath)) {
                        currentParentId = folderMap.get(currentFullPath)!
                        isSubFile = true
                    }
                }

                // Upload the actual file
                const filePath = currentFullPath ? `${currentFullPath}` : `/`
                return uploadFile(file, fileName, currentParentId, filePath, isSubFile)
            })

            // Wait for all uploads to complete
            await Promise.all(uploadPromises)

            // Close the upload modal
            showUploadModal.value = false

            // Show summary after all uploads complete
            const successCount = uniqueFiles.length - failedUploads.value.length
            if (successCount === 0) {
                // nothing uploaded (all duplicates, or all failed)
                if (failedUploads.value.length > 0) {
                    uploadError.value = `${failedUploads.value.length} file(s) failed to upload.`
                }
                return
            }

            if (failedUploads.value.length > 0) {
                uploadError.value = `${successCount} file(s) uploaded successfully, ${failedUploads.value.length} failed.`
            } else {
                uploadError.value = null
                let message
                if (successCount === 1) {
                    const fileName = uniqueFiles[0]?.name || "file"
                    message = `File ${fileName} uploaded successfully`
                } else {
                    message = `Successfully uploaded ${successCount} files`
                }
                eventBus.emit("showToast", {
                    message,
                    _type: "success",
                })
            }
        } catch (error) {
            uploadError.value = "Failed to upload files. Please try again."
            console.error("Upload error:", error)
        } finally {
            isUploading.value = false
            uploadQueue.value = []
            setTimeout(() => {
                clearUploadStatus()
            }, 2000) // 2000ms = 2 seconds
        }
    }

    // Add handler for breadcrumb file moves (from updated upstream)
    const handleBreadcrumbMove = (file: FileItem, targetPath: string) => {
        const sourceIndex = files.value.findIndex((f: FileItem) => f.id === file.id)
        if (sourceIndex !== -1) {
            const updatedFile = {
                ...file,
                path: targetPath,
                updatedAt: new Date(),
            }
            files.value[sourceIndex] = updatedFile
        }
    }

    // Formatting helpers
    const formatFileSize = (size: number) => {
        const units = ["B", "KB", "MB", "GB"]
        let value = size
        let unitIndex = 0
        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024
            unitIndex++
        }
        return `${value.toFixed(1)} ${units[unitIndex]}`
    }
    // Helper function to safely convert updatedAt to Date object
    const getUpdatedAtDate = (file: FileItem) => {
        return file.updatedAt instanceof Date ? file.updatedAt : new Date(file.updatedAt)
    }
    const fileIcon = (file: FileItem) => {
        if (file.type === "folder") return FolderIcon
        if (file.type.includes("image")) return PhotoIcon
        if (file.type.includes("video")) return VideoCameraIcon
        return DocumentIcon
    }

    // Hide/Unhide files
    const handleToggleFileHidden = async (file: FileItem) => {
        contextMenu.value = null
        file.isHidden = !file.isHidden
        await fileSystemStore.toggleFileOrFolderHidden(file.id, file.type)
    }
    const mimeTypeToType = (mimeType: string) => {
        const documentTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream", "application/vnd.google-apps.document"]
        const imageTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp", "image/heic", "image/heif"]
        const videoTypes = ["video/quicktime"]
        const audioTypes = ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/m4a", "audio/m4b", "audio/m4p", "audio/m4v", "audio/m4b", "audio/m4p", "audio/m4v"]
        const spreadsheetTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "application/vnd.google-apps.spreadsheet"]
        const codeTypes = ["text/x-python-script", "application/x-python-code", "text/x-sql", "application/sql", "application/octet-stream"]
        const htmlTypes = ["text/html"]
        if (documentTypes.includes(mimeType)) return "document"
        if (imageTypes.includes(mimeType)) return "image"
        if (videoTypes.includes(mimeType)) return "video"
        if (audioTypes.includes(mimeType)) return "audio"
        if (spreadsheetTypes.includes(mimeType)) return "spreadsheet"
        if (codeTypes.includes(mimeType)) return "code"
        if (htmlTypes.includes(mimeType)) return "html"
        return "Unknown"
    }

    const handleGlobalDragEnter = (e: DragEvent) => {
        // Don't show upload overlay if dragging internal files
        if (draggedItems.value && draggedItems.value.length > 0) {
            return
        }

        globalDragCounter.value++
        isGlobalDragging.value = true
    }

    const handleGlobalDragLeave = (e: DragEvent) => {
        // Don't handle leave events if dragging internal files
        if (draggedItems.value && draggedItems.value.length > 0) {
            return
        }

        globalDragCounter.value--
        if (globalDragCounter.value <= 0) {
            isGlobalDragging.value = false
        }
    }

    const traverseFileTree = (item: FileSystemEntry, path = ""): Promise<File[]> => {
        return new Promise((resolve) => {
            if (item.isFile) {
                ;(item as FileSystemFileEntry).file((file) => {
                    Object.defineProperty(file, "webkitRelativePath", {
                        value: path + file.name,
                        writable: true,
                        configurable: true,
                    })
                    resolve([file])
                })
            } else if (item.isDirectory) {
                const dirReader = (item as FileSystemDirectoryEntry).createReader()
                const entries: FileSystemEntry[] = []

                const readEntries = () => {
                    dirReader.readEntries(async (results) => {
                        if (!results.length) {
                            const promises = entries.map((entry) => traverseFileTree(entry, path + item.name + "/"))
                            const nestedFiles = await Promise.all(promises)
                            resolve(nestedFiles.flat())
                        } else {
                            entries.push(...results)
                            readEntries()
                        }
                    })
                }

                readEntries()
            }
        })
    }

    const handleGlobalDrop = async (e: DragEvent) => {
        e.preventDefault()

        // Don't handle global drop if dragging internal files
        if (draggedItems.value && draggedItems.value.length > 0) {
            globalDragCounter.value = 0
            isGlobalDragging.value = false
            return
        }

        const items = Array.from(e.dataTransfer?.items || [])
        const allFiles: File[] = []
        const allFilePromises = items.map(async (item) => {
            const entry = item.webkitGetAsEntry?.()
            if (entry) {
                return await traverseFileTree(entry)
            }
            return []
        })

        const nestedFiles = await Promise.all(allFilePromises)
        nestedFiles.forEach((files) => allFiles.push(...files))

        // Normalize files with missing MIME types (e.g., HEIC on some browsers)
        const normalizedFiles: File[] = allFiles.map((file) => {
            if (file.type && file.type.trim() !== "") return file
            const ext = file.name.split(".").pop()?.toLowerCase()
            const extToMime: Record<string, string> = {
                heic: "image/heic",
                heif: "image/heif",
            }
            const guessed = ext ? extToMime[ext] : undefined

            // Recreate File with a proper MIME if we can guess
            if (guessed) {
                try {
                    return new File([file], file.name, { type: guessed, lastModified: file.lastModified })
                } catch (err) {
                    // Fallback to original file if File constructor fails for any reason
                    return file
                }
            }
            return file
        })

        globalDragCounter.value = 0
        isGlobalDragging.value = false

        if (normalizedFiles.length > 0) {
            showUploadModal.value = false
            await handleUploadFiles(normalizedFiles)
        }
    }

    const handleKeySequence = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase()

        // Handle Enter key to open selected files
        if (key === "enter" && selectedFiles.value.size > 0) {
            e.preventDefault()
            const selectedFileIds = Array.from(selectedFiles.value)
            const selectedFile = files.value.find((f: FileItem) => f.id === selectedFileIds[0])
            if (selectedFile) {
                handleFileDoubleClick(selectedFile, e as any)
            }
            return
        }

        // Handle Delete key to delete selected files
        if (key === "delete" && selectedFiles.value.size > 0) {
            e.preventDefault()
            if (selectedFiles.value.size === 1) {
                const selectedFileId = Array.from(selectedFiles.value)[0]
                const selectedFile = files.value.find((f: FileItem) => f.id === selectedFileId)
                if (selectedFile) {
                    handleDelete(selectedFile)
                }
            } else {
                handleBulkDelete()
            }
            return
        }

        if (e.ctrlKey && key === "c") {
            keySequence.value = ["ctrl+c"]
            resetKeySequenceTimer()
            return
        }

        if (keySequence.value[0] === "ctrl+c") {
            if (key === "u") {
                e.preventDefault()
                keySequence.value = []
                showUploadModal.value = true
                return
            }

            if (key === "f") {
                e.preventDefault()
                keySequence.value = []
                showNewFolderModal.value = true
                return
            }

            if (key === "n") {
                e.preventDefault()
                keySequence.value = []
                showCreateNoteModal.value = true
                return
            }

            if (key === "v") {
                e.preventDefault()
                keySequence.value = []

                const newMode = viewMode.value === "grid" ? "list" : "grid"
                viewMode.value = newMode
                return
            }
        }

        // Any other key clears the sequence
        keySequence.value = []
    }

    const resetKeySequenceTimer = () => {
        if (keyTimer) clearTimeout(keyTimer)
        keyTimer = setTimeout(() => {
            keySequence.value = []
        }, 1000) // 1 second max between keys
    }

    const triggerUploadFiles = () => {
        console.log("Triggering file upload")
        uploadIntent.value = "file"
        // showUploadModal.value = true -- Removed modal, using direct input
        fileUploadInput.value?.click()
    }

    const triggerUploadFolder = () => {
        console.log("Triggering folder upload")
        uploadIntent.value = "folder"
        // showUploadModal.value = true -- Removed modal, using direct input
        folderUploadInput.value?.click()
    }

    const handleFileInputChange = async (event: Event) => {
        const input = event.target as HTMLInputElement
        if (!input.files || input.files.length === 0) return
        
        const filesArray = Array.from(input.files)
        await handleUploadFiles(filesArray)
        
        // Reset input so the same file can be selected again
        input.value = ""
    }

    const handleFolderInputChange = async (event: Event) => {
        const input = event.target as HTMLInputElement
        if (!input.files || input.files.length === 0) return
        
        const filesArray = Array.from(input.files)
        await handleUploadFiles(filesArray)
        
        // Reset input so the same folder can be selected again
        input.value = ""
    }

    const reopenGoogleDrivePicker = async () => {
        if (showGoogleDrivePicker.value) {
            showGoogleDrivePicker.value = false
            await nextTick()
        }
        showGoogleDrivePicker.value = true
    }

    const retryFailedUploads = async () => {
        if (failedUploads.value.length > 0) {
            const filesToRetry = [...failedUploads.value]
            failedUploads.value = []
            await handleUploadFiles(filesToRetry)
        }
    }

    const clearUploadStatus = () => {
        uploadProgressMap.value.clear()
        uploadStatusMessages.value.clear()
        failedUploads.value = []
        uploadError.value = null
    }

    onMounted(() => {
        window.addEventListener("keydown", handleKeySequence)
        window.addEventListener("dragend", handleDragEnd)
    })

    onUnmounted(() => {
        window.removeEventListener("keydown", handleKeySequence)
        window.removeEventListener("dragend", handleDragEnd)
        // Cleanup folder creation timeout
        if (folderCreationTimeout.value) {
            clearTimeout(folderCreationTimeout.value)
        }
    })

    // Add watch effect for isAnonymous
    watch(isAnonymous, (newValue) => {
        if (newValue) {
            showAnonymizationTermsModal.value = true
        } else {
            // Remove keepOriginal from selectedOptions when anonymous is disabled
            selectedOptions.value = selectedOptions.value.filter((option) => option !== "keepOriginal")
        }
    })
</script>

<template>
    <div class="flex h-full flex-col" data-testid="file-explorer-container" @dragenter.prevent="handleGlobalDragEnter" @dragover.prevent @dragleave.prevent="handleGlobalDragLeave" @drop.prevent="handleGlobalDrop">
        <!-- Hidden Upload Inputs -->
        <input id="documentUploadInput" ref="fileUploadInput" type="file" multiple class="hidden" @change="handleFileInputChange" />
        <input id="folderUploadInput" ref="folderUploadInput" type="file" webkitdirectory directory class="hidden" @change="handleFolderInputChange" />
        <!-- Global Drag Overlay -->
        <div v-if="isGlobalDragging" class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-mozart-blue-50/80 to-mozart-blue-50/80 backdrop-blur-md transition-all duration-500 dark:from-neutral-900/80 dark:to-neutral-800/80" role="dialog" aria-label="File drop zone" aria-live="polite">
            <div class="relative flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed border-mozart-blue-400/60 bg-white/90 px-16 py-12 text-center shadow-2xl backdrop-blur-sm dark:border-mozart-blue-500/60 dark:bg-neutral-900/90">
                <!-- Animated background gradient -->
                <div class="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-mozart-blue-50 to-mozart-blue-50"></div>

                <!-- Upload icon with modern animation -->
                <div class="relative">
                    <div class="absolute inset-0 animate-ping rounded-full bg-mozart-blue-200"></div>
                    <div class="relative rounded-full bg-mozart-blue-100 p-4">
                        <ArrowUpTrayIcon class="h-12 w-12 text-mozart-blue dark:text-mozart-blue" aria-hidden="true" />
                    </div>
                </div>

                <!-- Content -->
                <div class="relative space-y-3">
                    <h3 class="bg-gradient-to-r from-mozart-blue to-mozart-blue bg-clip-text text-2xl font-bold text-transparent dark:from-mozart-blue dark:to-mozart-blue">Drop files to upload</h3>
                    <p class="text-sm text-neutral-600 dark:text-neutral-300">Release to start uploading to your Workbench</p>
                </div>

                <!-- Features -->
                <div class="relative flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    <div class="flex items-center gap-1.5">
                        <div class="h-2 w-2 rounded-full bg-green-500"></div>
                        <span>Files & Folders</span>
                    </div>
                    <div class="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
                    <div class="flex items-center gap-1.5">
                        <div class="h-2 w-2 rounded-full bg-mozart-blue"></div>
                        <span>Drag & Drop</span>
                    </div>
                    <div class="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
                    <div class="flex items-center gap-1.5">
                        <div class="h-2 w-2 rounded-full bg-purple-500"></div>
                        <span>Progress Tracking</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Upload Status Panel -->
        <div v-if="isUploading || uploadProgressMap.size > 0 || failedUploads.length > 0" class="fixed right-4 bottom-4 z-40 w-96 max-w-md" role="status" aria-live="polite" aria-label="Upload status">
            <div class="overflow-hidden rounded-xl border border-neutral-200/50 bg-white/95 shadow-2xl backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/95">
                <!-- Header -->
                <div class="flex items-center justify-between border-b border-neutral-200/50 bg-gradient-to-r from-mozart-blue-50 to-mozart-blue-50 px-4 py-3 dark:border-neutral-700/50 dark:from-neutral-800/50 dark:to-neutral-700/50">
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <div v-if="isUploading" class="h-3 w-3 animate-pulse rounded-full bg-mozart-blue-500"></div>
                            <div v-else-if="failedUploads.length > 0" class="h-3 w-3 rounded-full bg-red-500"></div>
                            <div v-else class="h-3 w-3 rounded-full bg-green-500"></div>
                            <div v-if="isUploading" class="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-mozart-blue-500/30"></div>
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {{ isUploading ? "Uploading..." : failedUploads.length > 0 ? "Upload Complete" : "Upload Complete" }}
                            </h3>
                            <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ uploadProgressMap.size }} file{{ uploadProgressMap.size !== 1 ? "s" : "" }}</p>
                        </div>
                    </div>
                    <button @click="clearUploadStatus" class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Content -->
                <div class="max-h-64 overflow-y-auto p-4">
                    <!-- Upload Progress -->
                    <div v-if="uploadProgressMap.size > 0" class="space-y-4">
                        <div v-for="[fileName, progress] in uploadProgressMap" :key="fileName" class="group">
                            <!-- File Info -->
                            <div class="mb-2 flex items-center justify-between">
                                <div class="flex min-w-0 flex-1 items-center gap-2">
                                    <div class="flex-shrink-0">
                                        <div class="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-mozart-blue-100 to-mozart-blue-100 dark:from-mozart-blue-900/30 dark:to-mozart-blue-900/30">
                                            <svg class="h-3 w-3 text-mozart-blue dark:text-mozart-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <span class="truncate text-sm font-medium text-neutral-700 dark:text-neutral-300">{{ fileName }}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{ progress.percentage }}%</span>
                                    <div v-if="progress.state === 'uploading'" class="h-2 w-2 animate-pulse rounded-full bg-mozart-blue-500"></div>
                                    <div v-else-if="progress.state === 'completed'" class="h-2 w-2 rounded-full bg-green-500"></div>
                                    <div v-else-if="progress.state === 'error'" class="h-2 w-2 rounded-full bg-red-500"></div>
                                </div>
                            </div>

                            <!-- Modern Progress Bar -->
                            <div class="relative h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                <div
                                    class="h-full rounded-full transition-all duration-500 ease-out"
                                    :class="{
                                        'bg-gradient-to-r from-mozart-blue-500 to-mozart-blue': progress.state === 'uploading',
                                        'bg-gradient-to-r from-green-500 to-green-600': progress.state === 'completed',
                                        'bg-gradient-to-r from-red-500 to-red-600': progress.state === 'error',
                                    }"
                                    :style="{ width: `${progress.percentage}%` }"
                                >
                                    <div v-if="progress.state === 'uploading'" class="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                                </div>
                            </div>

                            <!-- Status Message -->
                            <div v-if="uploadStatusMessages.has(fileName)" class="mt-2">
                                <span
                                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                                    :class="{
                                        'bg-mozart-blue-50 text-mozart-blue-700 dark:bg-mozart-blue-900/20 dark:text-mozart-blue-300': uploadStatusMessages.get(fileName)?.type === 'info',
                                        'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300': uploadStatusMessages.get(fileName)?.type === 'success',
                                        'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300': uploadStatusMessages.get(fileName)?.type === 'error',
                                    }"
                                >
                                    <div v-if="uploadStatusMessages.get(fileName)?.type === 'info'" class="h-1.5 w-1.5 animate-pulse rounded-full bg-mozart-blue-500"></div>
                                    <div v-else-if="uploadStatusMessages.get(fileName)?.type === 'success'" class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                    <div v-else-if="uploadStatusMessages.get(fileName)?.type === 'error'" class="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                                    {{ uploadStatusMessages.get(fileName)?.message }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Failed Uploads -->
                    <div v-if="failedUploads.length > 0" class="mt-6 space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="h-2 w-2 rounded-full bg-red-500"></div>
                                <h4 class="text-sm font-medium text-red-700 dark:text-red-400">Failed Uploads ({{ failedUploads.length }})</h4>
                            </div>
                            <button @click="retryFailedUploads" class="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30">
                                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                Retry All
                            </button>
                        </div>
                        <div class="space-y-2">
                            <div v-for="file in failedUploads" :key="file.name" class="flex items-center gap-2 rounded-lg bg-red-50/50 p-2 dark:bg-red-900/10">
                                <div class="flex h-5 w-5 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/30">
                                    <svg class="h-3 w-3 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                    </svg>
                                </div>
                                <span class="truncate text-xs font-medium text-red-700 dark:text-red-300">{{ file.name }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex-none">
            <h1 class="mb-6 flex w-full justify-center text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Welcome to Workbench</h1>
            <div class="flex w-full flex-col items-center gap-5 space-y-4 px-2 py-4">
                <div class="w-full max-w-4xl">
                    <SearchBar @search="handleSearch" />
                </div>
                <div class="flex w-full flex-col items-start justify-between gap-2 sm:flex-row sm:gap-5">
                    <SortFilterBar @sort="handleSort" @filter="handleFilter" @toggleHidden="handleToggleHidden" :showHiddenFiles="showHiddenFiles" @openShortcuts="showShortcutsModal = true" />
                    <Toolbar v-model:selectedOptions="selectedOptions" @viewChange="handleViewChange" @createFolder="showNewFolderModal = true" @uploadFiles="triggerUploadFiles" @createNote="showCreateNoteModal = true" @uploadFolder="triggerUploadFolder" @uploadFromGoogleDrive="reopenGoogleDrivePicker">
                        <!-- Bulk Action Buttons -->
                        <template #extra>
                            <button v-if="selectedFiles.size > 0" @click="clearSelection" class="ml-2 rounded bg-neutral-200 px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-base dark:bg-neutral-700">Deselect All ({{ selectedFiles.size }})</button>
                            <button v-if="selectedFiles.size > 0" @click="handleBulkDelete" class="ml-2 rounded bg-red-500 px-2 py-1 text-xs text-white sm:px-4 sm:py-2 sm:text-base">Delete Selected</button>
                            <!-- Add more bulk action buttons as needed -->
                        </template>
                    </Toolbar>
                    
                    <!-- Hidden File Upload Input -->
                    <input
                        ref="fileUploadInput"
                        type="file"
                        multiple
                        accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv,text/x-python-script,application/x-python-code,application/msword,application/sql,application/x-sql,text/x-sql,application/octet-stream,.sql,text/javascript,text/html,.html,.htm,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        @change="handleFileInputChange"
                        class="hidden"
                    />
                    
                    <!-- Hidden Folder Upload Input -->
                    <input
                        ref="folderUploadInput"
                        type="file"
                        webkitdirectory
                        directory
                        multiple
                        accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv,text/x-python-script,application/x-python-code,application/msword,application/sql,application/x-sql,text/x-sql,application/octet-stream,.sql,text/javascript,text/html,.html,.htm,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        @change="handleFolderInputChange"
                        class="hidden"
                    />
                </div>
            </div>
        </div>

        <div class="flex-grow overflow-hidden">
            <div v-if="currentFiles.length === 0" class="flex h-full items-center justify-center">
                <div v-if="!fileSystemStore.isRootLoaded || !documentStore.notesLoaded">
                    <FileExplorerSkeleton :viewMode="viewMode" />
                </div>
                <div v-else class="text-textColorSecondary flex flex-col items-center justify-center gap-4 py-16 text-center">
                    <!-- Icon/Graphic -->
                    <div class="rounded-full bg-neutral-200 p-4 dark:bg-neutral-700">
                        <FolderPlusIcon class="h-8 w-8" />
                    </div>

                    <!-- Headline + subtext -->
                    <h2 class="text-xl font-semibold text-neutral-800 dark:text-neutral-200">No files found</h2>
                    <p class="text-md">Upload files or create a new folder to get started</p>

                    <!-- Action buttons -->
                    <div class="flex flex-wrap items-center justify-between gap-2 space-x-2">
                        <button class="bg-logoColor text-white flex items-center gap-2 rounded-md px-2 py-1 text-xs whitespace-nowrap hover:bg-mozart-blue-700 sm:px-2 sm:text-sm dark:bg-neutral-700 dark:text-neutral-300" @click="showUploadModal = true" title="Upload files">
                            <ArrowUpTrayIcon class="h-4 w-5" />
                            Upload Files
                        </button>
                        <button class="border-logoColor bg-white text-logoColor flex items-center gap-2 rounded-md border px-2 py-1 text-xs whitespace-nowrap hover:bg-neutral-200 sm:px-2 sm:text-sm dark:bg-neutral-700 dark:text-neutral-300" @click="showNewFolderModal = true" title="Create new folder">
                            <FolderPlusIcon class="h-5 w-5" />
                            Create Folder
                        </button>
                    </div>
                </div>
            </div>
            <div v-else class="bg-surfaceColor dark:bg-surfaceColor flex h-full flex-col">
                <div v-if="fileSystemStore.isLoading">
                    <FileExplorerSkeleton :viewMode="viewMode" />
                </div>
                <template v-else>
                    <!-- Breadcrumbs (with file move support) -->
                    <div class="flex-none">
                        <Breadcrumbs :path="fileSystemStore.currentPath" @navigate="handlePathChange" @moveFile="handleBreadcrumbMove" />
                    </div>

                    <div v-if="currentFiles.length === 0" class="flex h-full items-center justify-center py-8 text-center text-neutral-500 dark:text-neutral-400">No files found</div>
                    <div v-else-if="viewMode == 'grid'" class="scrollbar-thumb-rounded-full scrollbar-thin scrollbar-track-backgroundColor scrollbar-thumb-logoColor min-h-0 flex-grow overflow-y-auto">
                        <div class="sm:p-3">
                            <!-- GRID VIEW -->
                            <div class="grid-view-container grid grid-cols-[repeat(auto-fill,minmax(theme(spacing.20),theme(spacing.32)))] place-items-stretch justify-center gap-2 sm:gap-2.5 md:grid-cols-[repeat(auto-fill,minmax(theme(spacing.24),theme(spacing.36)))] md:gap-3 xl:grid-cols-[repeat(auto-fill,minmax(theme(spacing.28),theme(spacing.40)))]">
                                <div
                                    v-for="file in currentFiles"
                                    :key="file.id"
                                    draggable="true"
                                    @dragstart="handleDragStart(file, $event)"
                                    @dragover="handleDragOver(file, $event)"
                                    @dragleave="handleDragLeave"
                                    @drop="handleDrop(file, $event)"
                                    @contextmenu="handleContextMenu(file, $event)"
                                    @click="handleFileClick(file, $event)"
                                    @dblclick="handleFileDoubleClick(file, $event)"
                                    class="cursor-pointer hover:shadow-md"
                                    data-testid="file-item"
                                    :data-filename="file.name"
                                    :class="{
                                        'rounded-lg border-2 border-mozart-blue-500 bg-mozart-blue-50 dark:bg-mozart-blue': dropTarget?.id === file.id && isDraggingOver && file.type === 'folder',
                                        'opacity-50': isFileBeingDragged(file),
                                        'border-2 border-mozart-blue-500 bg-mozart-blue-100 dark:bg-mozart-blue-700': selectedFiles.has(file.id),
                                        'opacity-60': file.isHidden,
                                    }"
                                >
                                    <div class="bg-surfaceColor dark:bg-surfaceHover hover:bg-surfaceHover h-full w-full cursor-pointer overflow-hidden rounded-md border border-neutral-200 hover:shadow-md dark:border-neutral-600">
                                        <!-- Preview Section -->
                                        <div class="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-t-lg bg-neutral-200 sm:h-24 dark:bg-neutral-700">
                                            <div v-if="settings?.showFilePreview">
                                                <img v-if="file.type === 'file' && !file.source && !(file as any).isNote" :src="file.filePreviewUrl || file.url" alt="Preview" />

                                                <div v-else-if="file.type === 'file' && file.source && file.filePreviewUrl" class="flex h-[80vh] w-full items-center justify-center bg-neutral-50">
                                                    <iframe :src="file.filePreviewUrl" class="h-full w-full max-w-5xl rounded-md text-center shadow-md" frameborder="0" allowfullscreen alt="Preview-iframe"></iframe>
                                                </div>

                                                <BookOpenIcon v-else-if="(file as any).isNote" class="size-12 text-mozart-blue-500 sm:size-14 md:size-16" />
                                                <FileIcons v-else-if="file.type === 'file'" :fileType="file.mimeType" class="size-12 sm:size-14 md:size-16" />
                                                <component v-else :is="fileIcon(file)" class="size-12 text-neutral-500 sm:size-14 md:size-16 dark:text-neutral-400" />
                                            </div>
                                            <div v-else>
                                                <BookOpenIcon v-if="(file as any).isNote" class="size-12 text-mozart-blue-500 sm:size-14 md:size-16" />
                                                <FileIcons v-else-if="file.type === 'file'" :fileType="file.mimeType" class="ssize-12 sm:size-14 md:size-16" />
                                                <component v-else :is="fileIcon(file)" class="size-12 text-neutral-500 sm:size-14 md:size-16 dark:text-neutral-400" />
                                            </div>
                                            <div v-if="file.isShared" class="absolute top-2 right-2">
                                                <span class="bg-primary/30 text-foreground inline-flex items-center gap-1 rounded px-1 py-0.5 text-sm">
                                                    <span class="materialSymbolsOutlined ms-compact">share</span>
                                                </span>
                                            </div>
                                        </div>

                                        <!-- Metadata Section -->
                                        <div class="flex w-full justify-between gap-0 p-1.5 sm:p-2">
                                            <div class="metadata-container flex flex-col gap-1">
                                                <VTooltip>
                                                    <div class="w-full truncate text-sm leading-tight font-medium break-all text-neutral-900 dark:text-neutral-100">
                                                        {{ file.name }}
                                                    </div>
                                                    <template #popper>{{ file.name }}</template>
                                                </VTooltip>

                                                <div class="hidden w-full text-xs leading-tight text-neutral-500 md:block dark:text-neutral-400">
                                                    {{ formatFileSize(file.size) }} •
                                                    {{ new Intl.DateTimeFormat("en-US").format(getUpdatedAtDate(file)) }}
                                                </div>

                                                <div class="flex w-full flex-wrap items-center gap-1.5">
                                                    <span class="inline-flex w-fit items-center rounded-md bg-mozart-blue-100 px-1.5 py-0.5 text-xs font-medium text-mozart-blue-800 dark:bg-blue-100/10 dark:text-blue-200">
                                                        {{ file.type === "folder" ? "Folder" : convertMimeTypeToType(file.mimeType) }}
                                                    </span>

                                                    <span v-if="file.source" class="hidden w-fit items-center rounded-md bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800 md:inline-flex dark:bg-green-900/30 dark:text-green-200">
                                                        {{ file.source.name }}
                                                    </span>
                                                </div>
                                            </div>

                                            <!-- More Options -->
                                            <div class="flex items-center">
                                                <div class="materialSymbolsOutlined text-sm leading-tight" @click="handleMoreOptionsClick(file, $event)">more_vert</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- LIST VIEW -->
                    <div v-else class="flex min-h-0 flex-grow flex-col overflow-hidden">
                        <div class="scrollbar-thumb-rounded-full scrollbar-thin scrollbar-track-backgroundColor scrollbar-thumb-logoColor flex-grow overflow-y-auto">
                            <div class="overflow-x-auto">
                                <div class="bg-surfaceColor dark:bg-surfaceColor">
                                    <table class="w-full table-fixed text-neutral-900 dark:text-white">
                                        <!-- prm -->
                                        <thead class="cursor-pointer border-b border-neutral-200 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-600">
                                            <tr>
                                                <th @click="handleSort('name', sortDirection === 'asc' && sortBy === 'name' ? 'desc' : 'asc')" class="group w-auto cursor-pointer py-3.5 pr-3 pl-4 text-left text-xs font-medium tracking-wider text-neutral-700 uppercase hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-500">
                                                    <div class="flex items-center gap-1">
                                                        Name
                                                        <span class="text-neutral-400 dark:text-neutral-500" :class="{ 'text-mozart-blue-500 dark:text-mozart-blue-400': sortBy === 'name' }">
                                                            {{ sortBy === "name" ? (sortDirection === "asc" ? "↑" : "↓") : "" }}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th @click="handleSort('size', sortDirection === 'asc' && sortBy === 'size' ? 'desc' : 'asc')" class="group w-24 cursor-pointer px-3 py-3.5 text-left text-xs font-medium tracking-wider text-nowrap text-neutral-700 uppercase hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-500">
                                                    <div class="flex items-center gap-1">
                                                        {{ isMobile ? "Size" : "File Size" }}
                                                        <span class="text-neutral-400 dark:text-neutral-500" :class="{ 'text-mozart-blue-500 dark:text-mozart-blue-400': sortBy === 'size' }">
                                                            {{ sortBy === "size" ? (sortDirection === "asc" ? "↑" : "↓") : "" }}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th class="hidden w-20 px-3 py-3.5 text-left text-xs font-medium tracking-wider text-neutral-700 uppercase sm:table-cell dark:text-neutral-300">Type</th>
                                                <th class="hidden w-32 px-3 py-3.5 text-left text-xs font-medium tracking-wider text-neutral-700 uppercase sm:table-cell dark:text-neutral-300">Owner</th>
                                                <th class="hidden w-32 px-3 py-3.5 text-left text-xs font-medium tracking-wider text-neutral-700 uppercase sm:table-cell dark:text-neutral-300">Source</th>
                                                <th @click="handleSort('date', sortDirection === 'asc' && sortBy === 'date' ? 'desc' : 'asc')" class="group w-36 cursor-pointer px-3 py-3.5 text-left text-xs font-medium tracking-wider text-neutral-700 uppercase hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-600">
                                                    <div class="flex items-center gap-1">
                                                        {{ isMobile ? "Updated" : "Last Updated" }}
                                                        <span class="text-neutral-400 dark:text-neutral-500" :class="{ 'text-mozart-blue-500 dark:text-mozart-blue-400': sortBy === 'date' }">
                                                            {{ sortBy === "date" ? (sortDirection === "asc" ? "↑" : "↓") : "" }}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th class="w-12 px-3 py-3.5 text-left"></th>
                                            </tr>
                                        </thead>
                                        <tbody class="">
                                            <tr
                                                v-for="file in currentFiles"
                                                :key="file.id"
                                                class="group dark:surfaceHover cursor-pointer transition-colors duration-150 hover:bg-neutral-200 dark:hover:bg-neutral-700/95"
                                                draggable="true"
                                                data-testid="file-item"
                                                :data-filename="file.name"
                                                @dragstart="handleDragStart(file, $event)"
                                                @dragover="handleDragOver(file, $event)"
                                                @dragleave="handleDragLeave"
                                                @drop="handleDrop(file, $event)"
                                                @contextmenu="handleContextMenu(file, $event)"
                                                @click="handleFileClick(file, $event)"
                                                @dblclick="handleFileDoubleClick(file, $event)"
                                                :class="{
                                                    'border-l-4 border-l-mozart-blue-500 bg-mozart-blue-50 dark:bg-mozart-blue-900/20': dropTarget?.id === file.id && isDraggingOver && file.type === 'folder',
                                                    'opacity-50': isFileBeingDragged(file),
                                                    'border-l-4 border-l-mozart-blue-500 bg-mozart-blue-100 dark:bg-mozart-blue-900/30': selectedFiles.has(file.id),
                                                    'opacity-60': file.isHidden,
                                                }"
                                            >
                                                <td class="w-1/3 py-4 pr-3 pl-4 whitespace-nowrap">
                                                    <div class="flex items-center gap-3">
                                                        <div class="flex-shrink-0">
                                                            <BookOpenIcon v-if="(file as any).isNote" class="size-8 sm:size-10 text-mozart-blue-500" />
                                                            <FileIcons v-else-if="file.type === 'file'" :fileType="file.mimeType" class="size-8 sm:size-10" />
                                                            <component v-else :is="fileIcon(file)" class="size-6 sm:size-8" :class="[file.type === 'folder' ? 'text-mozart-blue-500' : 'text-neutral-400 dark:text-neutral-300']" />
                                                        </div>
                                                        <div class="w-full flex-1 overflow-hidden">
                                                            <div class="w-full truncate text-sm font-medium text-neutral-900 dark:text-neutral-100" :title="file.name">
                                                                {{ file.name }}
                                                            </div>
                                                            <div v-if="file.isHidden" class="text-xs text-neutral-500 dark:text-neutral-400">Hidden file</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="w-24 px-3 py-4 text-sm whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                                                    <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-neutral-800 dark:text-neutral-200" :class="{ 'bg-neutral-100 dark:bg-neutral-700': file.type !== 'folder' }">
                                                        {{ file.type === "folder" ? "—" : formatFileSize(file.size) }}
                                                    </span>
                                                </td>
                                                <td class="hidden w-20 px-3 py-4 text-sm whitespace-nowrap text-neutral-500 sm:table-cell dark:text-neutral-400">
                                                    <span class="inline-flex w-fit max-w-[5rem] items-center truncate rounded-md bg-mozart-blue-100 px-2.5 py-0.5 text-xs font-medium text-mozart-blue-800 dark:bg-blue-100/10 dark:text-blue-100" :title="(file as any).isNote ? 'Note' : (file.type === 'folder' ? 'Folder' : convertMimeTypeToType(file.mimeType))">
                                                        {{ (file as any).isNote ? "Note" : (file.type === "folder" ? "Folder" : convertMimeTypeToType(file.mimeType)) }}
                                                    </span>
                                                </td>
                                                <td class="hidden w-32 px-3 py-4 text-sm whitespace-nowrap text-neutral-500 sm:table-cell dark:text-neutral-400">
                                                    <div class="flex w-full max-w-[8rem] items-center truncate">
                                                        <div class="flex size-6 max-h-6 min-h-6 max-w-6 min-w-6 items-center justify-center rounded-full bg-neutral-300 text-xs font-medium text-neutral-700 dark:bg-neutral-600 dark:text-neutral-300">
                                                            {{ file.lastModifiedBy?.charAt(0)?.toUpperCase() || "?" }}
                                                        </div>
                                                        <span class="ml-2 truncate" :title="file.lastModifiedBy || 'Unknown'">{{ file.lastModifiedBy || "Unknown" }}</span>
                                                    </div>
                                                </td>
                                                <td class="hidden w-32 px-3 py-4 text-sm whitespace-nowrap text-neutral-500 sm:table-cell dark:text-neutral-400">
                                                    <span v-if="file.source?.name" class="inline-flex w-fit max-w-[12rem] items-center truncate rounded-md bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200" :title="file.source.name">
                                                        {{ file.source.name }}
                                                    </span>
                                                    <span v-else class="text-neutral-400 dark:text-neutral-500">—</span>
                                                </td>
                                                <td class="w-32 px-3 py-4 text-sm whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                                                    <div class="flex flex-col">
                                                        <span class="hidden sm:block">{{ new Intl.DateTimeFormat("en-US").format(getUpdatedAtDate(file)) }}</span>
                                                        <span class="text-xs sm:hidden">{{
                                                            new Intl.DateTimeFormat("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                            }).format(getUpdatedAtDate(file))
                                                        }}</span>
                                                        <span class="text-xs text-neutral-400 dark:text-neutral-500">
                                                            {{
                                                                new Intl.RelativeTimeFormat("en", {
                                                                    numeric: "auto",
                                                                }).format(Math.floor((getUpdatedAtDate(file).getTime() - Date.now()) / (1000 * 60 * 60 * 24)), "day")
                                                            }}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td class="flex items-center self-center px-1 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                    <button @click="handleMoreOptionsClick(file, $event)" class="flex items-center rounded-md p-[4px] text-neutral-400 opacity-100 sm:opacity-0 transition-opacity duration-150 sm:group-hover:opacity-100 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-600 dark:hover:text-neutral-300" :title="`More options for ${file.name}`">
                                                        <span class="material-symbols-outlined text-lg">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <!-- Context Menu -->
        <ContextMenu
            v-if="contextMenu"
            :file="contextMenu.file"
            :x="contextMenu.x"
            :y="contextMenu.y"
            @close="contextMenu = null"
            @rename="handleRenameModal"
            @delete="handleDelete"
            @copy="handleCopy"
            @permissions="handlePermissions"
            @share="handleShare"
            @versions="handleVersions"
            @vectorize="handleVectorization"
            @anonimize="handleAnonymize"
            @toggleHidden="handleToggleFileHidden(contextMenu.file)"
        />

        <!-- Modals -->
        <NotesPopUp v-if="showCreateNoteModal" @save="handleNoteSave" @discard="showCreateNoteModal = false" />
        <NotesPopUp v-if="showEditNoteModal" :isVisible="showEditNoteModal" :note="selectedNote" @save="handleNoteUpdate" @discard="() => { showEditNoteModal = false; selectedNote = null }" />
        <PermissionsModal v-if="selectedFile" :file="selectedFile" :is-open="showPermissionsModal" @close="showPermissionsModal = false" @update="updatePermissions" />
        <ShareConversationPopup :show="showShareModal" @update:show="showShareModal = false" :module="'fileOrFolder'" :fileOrFolderId="selectedFile?.id" />
        <VersionHistoryModal v-if="selectedFile" :file="selectedFile" :is-open="showVersionHistoryModal" @close="showVersionHistoryModal = false" @restore="restoreVersion" />

        <!-- Create Folder Modal -->
        <Dialog :open="showNewFolderModal" @close="showNewFolderModal = false" class="bg-neutral/50 dark:bg-neutral/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <DialogPanel class="flex h-1/4 min-h-fit w-1/4 flex-col gap-5 overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
                <div>
                    <div class="text-2xl font-semibold text-neutral-900 dark:text-white">New Folder</div>
                    <div class="flex flex-col gap-4">
                        <div class="text-sm text-neutral-500 dark:text-neutral-400">Create a new folder in the current directory</div>
                    </div>
                </div>
                <div class="space-y-4">
                    <label class="block">
                        <span class="text-neutral-700 dark:text-neutral-300">Folder Name</span>
                        <input type="text" v-model="newFolderName" :disabled="isCreatingFolder" class="mt-1 block w-full rounded-md border-neutral-300 p-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-700 dark:text-white" placeholder="New Folder" />
                    </label>
                </div>
                <div class="flex w-full justify-between">
                    <button
                        type="button"
                        :disabled="isCreatingFolder"
                        class="inline-flex justify-center rounded-md border border-transparent bg-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-400 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        @click="((newFolderName = 'New Folder'), (showNewFolderModal = false))"
                    >
                        Cancel
                    </button>
                    <button
                        :disabled="newFolderName.length === 0 || isCreatingFolder"
                        type="button"
                        :class="{
                            'cursor-not-allowed opacity-50': newFolderName.length === 0 || isCreatingFolder,
                            'hover:bg-mozart-blue-700': !isCreatingFolder && newFolderName.length > 0,
                        }"
                        class="mr-2 ml-2 inline-flex items-center justify-center rounded-md border bg-mozart-blue px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-mozart-blue-500 focus:ring-offset-2 focus:outline-none"
                        @click="handleCreateFolder"
                    >
                        <svg v-if="isCreatingFolder" class="mr-2 -ml-1 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {{ isCreatingFolder ? "Creating..." : "Create" }}
                    </button>
                </div>
            </DialogPanel>
        </Dialog>

        <!-- Upload Files Modal -->
        <Dialog :open="showUploadModal" @close="showUploadModal = false" class="bg-neutral/50 dark:bg-neutral/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <DialogPanel class="flex min-h-fit w-[90%] max-w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl sm:w-2/5 dark:border-neutral-700 dark:bg-neutral-900">
                <!-- Header -->
                <div class="flex items-center justify-between border-b border-neutral-200 px-8 pt-6 pb-4 dark:border-neutral-700">
                    <h2 class="text-2xl font-semibold text-neutral-900 dark:text-white">Upload</h2>
                    <button @click="showUploadModal = false" class="rounded-lg p-2 text-neutral-400 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <!-- Content -->
                <div class="flex-1 p-8">
                    <div class="space-y-4">
                        <UploadArea multiple accept=".txt,.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.heic,.heif" :max-size="50 * 1024 * 1024" @upload="handleUploadFiles" :upload-progress-map="uploadProgressMap" :intent="uploadIntent" />
                        <p v-if="uploadError" class="text-sm text-red-600">
                            {{ uploadError }}
                        </p>
                    </div>
                </div>
            </DialogPanel>
        </Dialog>

        <!-- Anonymization Terms Modal -->
        <AnonymizationTermsModal v-model:show="showAnonymizationTermsModal" @anonymizationTerms="handleAnonymizationTerms" @close="handleAnonymizationModalClose" />

        <!-- Rename Modal -->
        <BaseModal title="Rename File" :is-open="showRenameModal" @close="showRenameModal = false">
            <div class="space-y-4">
                <label class="block">
                    <span class="text-neutral-700 dark:text-neutral-300">New Name</span>
                    <input type="text" v-model="newName" class="mt-1 block w-full rounded-md border-neutral-300 p-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white" />
                </label>
            </div>
            <template #footer>
                <button type="button" class="ml-2 inline-flex justify-center rounded-md border bg-mozart-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-mozart-blue-700 focus:ring-2 focus:ring-mozart-blue-500 focus:ring-offset-2 focus:outline-none" :class="isMobile ? 'mr-2' : ''" @click="handleRename">Rename</button>
                <button type="button" class="inline-flex justify-center rounded-md border border-transparent bg-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-400 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-none" @click="((newName = 'New Name'), (showRenameModal = false))">Cancel</button>
            </template>
        </BaseModal>

        <BaseModal title="Keyboard Shortcuts" :is-open="showShortcutsModal" @close="showShortcutsModal = false">
            <div class="space-y-3 text-sm text-neutral-800 dark:text-neutral-200">
                <div class="flex justify-between">
                    <span><kbd>Enter</kbd></span>
                    <span>Open selected file/folder</span>
                </div>
                <div class="flex justify-between">
                    <span><kbd>Delete</kbd></span>
                    <span>Delete selected file(s)</span>
                </div>
                <div class="flex justify-between">
                    <span><kbd>Ctrl + C + U</kbd></span>
                    <span>Upload Files</span>
                </div>
                <div class="flex justify-between">
                    <span><kbd>Ctrl + C + F</kbd></span>
                    <span>Create Folder</span>
                </div>
                <div class="flex justify-between">
                    <span><kbd>Ctrl + C + N</kbd></span>
                    <span>Create Note</span>
                </div>
                <div class="flex justify-between">
                    <span><kbd>Ctrl + C + V</kbd></span>
                    <span>Toggle View Mode</span>
                </div>
            </div>
        </BaseModal>

        <!-- Delete Confirmation Modal -->
        <BaseModal title="Confirm Deletion" :is-open="showDeleteConfirmationModal" @close="showDeleteConfirmationModal = false">
            <div class="space-y-4">
                <p class="text-neutral-700 dark:text-neutral-300">
                    Are you sure you want to delete <strong>{{ fileToDelete?.name }}</strong
                    >?
                </p>
            </div>
            <template #footer>
                <div class="flex justify-end gap-3">
                    <button type="button" :disabled="isDeleting" class="inline-flex justify-center rounded-md border border-transparent bg-[#e5e7eb] px-4 py-2 text-sm font-medium text-[#374151] shadow-sm hover:bg-neutral-400 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-none" @click="showDeleteConfirmationModal = false">Cancel</button>
                    <button type="button" :disabled="isDeleting" class="inline-flex items-center justify-center rounded-md border bg-mozart-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-mozart-blue-700 focus:ring-2 focus:ring-mozart-blue-500 focus:ring-offset-2 focus:outline-none" @click="confirmDelete">
                        <svg v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Delete
                    </button>
                </div>
            </template>
        </BaseModal>

        <!-- Bulk Delete Confirmation Modal -->
        <BaseModal title="Confirm Bulk Deletion" :is-open="showBulkDeleteConfirmationModal" @close="showBulkDeleteConfirmationModal = false">
            <div class="space-y-4">
                <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span class="font-medium">Warning: This action cannot be undone</span>
                </div>
                <p class="text-neutral-700 dark:text-neutral-300">
                    Are you sure you want to delete <strong>{{ selectedFiles.size }} selected items</strong>?
                </p>
                <div v-if="selectedFiles.size <= 10" class="max-h-32 overflow-y-auto rounded-md bg-neutral-50 p-3 dark:bg-neutral-800">
                    <p class="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">Files to be deleted:</p>
                    <ul class="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                        <li v-for="fileId in Array.from(selectedFiles)" :key="fileId" class="flex items-center gap-2">
                            <span class="text-xs">•</span>
                            <span>{{ files.find((f: FileItem) => f.id === fileId)?.name || "Unknown file" }}</span>
                        </li>
                    </ul>
                </div>
                <div v-else class="rounded-md bg-neutral-50 p-3 dark:bg-neutral-800">
                    <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ selectedFiles.size }} files will be deleted. This includes a large number of files.</p>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-3">
                    <button type="button" :disabled="isDeleting" class="inline-flex justify-center rounded-md border border-transparent bg-[#e5e7eb] px-4 py-2 text-sm font-medium text-[#374151] shadow-sm hover:bg-neutral-400 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-none" @click="showBulkDeleteConfirmationModal = false">Cancel</button>
                    <button type="button" :disabled="isDeleting" class="inline-flex items-center justify-center rounded-md border bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none" @click="confirmBulkDelete">
                        <svg v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Delete All ({{ selectedFiles.size }})
                    </button>
                </div>
            </template>
        </BaseModal>

        <GoogleFilePicker v-if="showGoogleDrivePicker" :start="showGoogleDrivePicker" :showInitialButton="false" @close="showGoogleDrivePicker = false" />
    </div>
</template>

<style>
    .metadata-container {
        width: calc(100% - 24px) !important;
    }

    @media screen and (max-width: 640px) {
        .grid-view-container {
            grid-template-columns: repeat(2, calc((100% - 12px) / 2)) !important;
        }
    }
</style>
