import { defineStore } from "pinia"
import eventBus from "~/util/eventBus"

export const useFileSystemStore = defineStore("fileSystem", {
    state: () => ({
        filesAndFolders: <FileItem[]>[],
        navigatedFolderIds: <string[]>[],
        currentFolderIds: <string[]>[],
        currentPath: <string>"/",
        isLoading: <boolean>false,
        isRootLoaded: <boolean>false,
        currentFolderId: <string>"",
        isDeleting: false,
    }),
    actions: {
        getSharedUsers(fileOrFolderId: string) {
            const file = this.filesAndFolders.find((file) => file.id === fileOrFolderId)
            if (file) {
                return file.sharedUsers
            }
            return []
        },
        saveSharedUsers(fileOrFolderId: string, sharedUsers: any[]) {
            const file = this.filesAndFolders.find((file) => file.id === fileOrFolderId)
            if (file) {
                file.sharedUsers = sharedUsers
            }
        },
        getFileById(id: string) {
            return this.filesAndFolders.find((file) => file.id === id)
        },
        getFileStatusById(id: string) {
            const file = this.filesAndFolders.find((file) => file.id === id)
            if (file) {
                return file.status
            }
            return ""
        },
        updateFile(file: any) {
            const fileObj = {
                id: file.fileId,
                name: file.fileName,
                type: "file" as "file" | "folder",
                path: file.path,
                size: file.fileSize,
                mimeType: file.fileType,
                parentFolderId: file.parentFolderId,
                ownerId: file.ownerId,
                createdAt: file.createdAt,
                updatedAt: file.updatedAt,
                lastModifiedBy: file.lastModifiedBy,
                isStarred: file.isStarred,
                isTrashed: file.isTrashed,
                isHidden: file.isHidden,
                isShared: file.isShared,
                isSharedWithMe: file.isSharedWithMe,
                url: file.url,
                filePreviewUrl: file.filePreviewUrl,
                status: file.status,
                source: file.source,
            }
            const index = this.filesAndFolders.findIndex((fileItem) => fileItem.id === file.fileId)
            if (index !== -1) {
                this.filesAndFolders[index] = fileObj
            } else {
                this.filesAndFolders.push(fileObj)
            }
        },
        addUniquePath(path: string) {
            // Use Set to ensure uniqueness, then convert back to array
            this.navigatedFolderIds = [...new Set([...this.navigatedFolderIds, path])]
            // this.currentFolderIds = this.navigatedFolderIds
        },
        updateRoutePath() {
            const pathToAdd = this.currentFolderIds.join("/")
            useRouter().push("/workbench/files/" + pathToAdd)
        },
        updateNavigatedFolderIds() {
            const folderId = this.getFolderIdByCurrentPath()
            if (folderId) {
                if (folderId === "root") {
                    this.currentFolderIds = []
                } else {
                    //Update the folder Id incase of backward navigation
                    const index = this.currentFolderIds.indexOf(folderId)
                    if (index !== -1) {
                        this.currentFolderIds.splice(index, 1)
                    }
                }
            }
            this.updateRoutePath()
        },
        getFolderIdByCurrentPath() {
            // Handle the root case
            if (this.currentPath === "/") {
                return "root"
            }

            // Otherwise, find the folder whose constructed path matches currentPath
            const folder = this.filesAndFolders.find((item) => {
                if (item.type === "folder") {
                    return item.path === this.currentPath
                }
                return false
            })
            return folder ? folder.id : null
        },
        upsertFileItem(newItem: FileItem) {
            const existingIndex = this.filesAndFolders.findIndex((item) => item.id === newItem.id)
            if (existingIndex !== -1) {
                // Update existing item
                this.filesAndFolders[existingIndex] = {
                    ...this.filesAndFolders[existingIndex],
                    ...newItem,
                }
            } else {
                // Insert new item
                this.filesAndFolders.push(newItem)
            }
        },
        async fetchRoot() {
            if (!this.isRootLoaded) {
                const { folder, childFolders, childFiles } = await useFileSystem().getFolderContents("root")
                this.updateFilesAndFolders(childFolders, childFiles)
                this.isRootLoaded = true
            }
        },
        async fetchAllUserFiles() {
            const files = await useFileSystem().getAllUserFiles()
            if (files) {
                const filesArray = Object.values(files) as any[]
                for (const file of filesArray) {
                    const fileItem: FileItem = {
                        id: file.fileId,
                        name: file.fileName,
                        type: "file",
                        path: file.path,
                        createdAt: file.createdAt,
                        updatedAt: file.updatedAt,
                        parentFolderId: file.parentFolderId,
                        ownerId: file.ownerId,
                        isTrashed: file.isTrashed,
                        isStarred: file.isStarred,
                        isHidden: file.isHidden,
                        isShared: file.isShared,
                        isSharedWithMe: file.isSharedWithMe,
                        lastModifiedBy: file.lastModifiedBy,
                        size: file.fileSize,
                        mimeType: file.fileType,
                        status: file.status || "uploaded",
                        source: file.source,
                        url: file.url,
                        viewDocumentUrl: file.viewDocumentUrl,
                        filePreviewUrl: file.filePreviewUrl,
                    }
                    this.upsertFileItem(fileItem)
                }
            }
        },
        updateFilesAndFolders(childFolders: any, childFiles: any) {
            // Add Child Folders
            if (childFolders) {
                for (const folderId in childFolders) {
                    const fileItem: FileItem = {
                        id: folderId,
                        name: childFolders[folderId].name,
                        type: "folder",
                        path: childFolders[folderId].path,
                        createdAt: childFolders[folderId].createdAt,
                        updatedAt: childFolders[folderId].updatedAt,
                        parentFolderId: childFolders[folderId].parentFolderId,
                        ownerId: childFolders[folderId].ownerId,
                        isTrashed: childFolders[folderId].isTrashed,
                        isStarred: childFolders[folderId].isStarred,
                        isHidden: childFolders[folderId].isHidden || false,
                        isShared: childFolders[folderId].isShared,
                        isSharedWithMe: childFolders[folderId].isSharedWithMe,
                        lastModifiedBy: childFolders[folderId].lastModifiedBy,
                        size: childFolders[folderId].size || 0,
                        mimeType: "",
                        status: childFolders[folderId].status,
                    }
                    this.upsertFileItem(fileItem)
                }
            }
            // Add Child Files
            if (childFiles) {
                for (const fileId in childFiles) {
                    const fileItem: FileItem = {
                        id: fileId,
                        name: childFiles[fileId].fileName,
                        type: "file",
                        path: childFiles[fileId].path,
                        createdAt: childFiles[fileId].createdAt,
                        updatedAt: childFiles[fileId].updatedAt,
                        parentFolderId: childFiles[fileId].parentFolderId,
                        ownerId: childFiles[fileId].ownerId,
                        isTrashed: childFiles[fileId].isTrashed,
                        isStarred: childFiles[fileId].isStarred,
                        isHidden: childFiles[fileId].isHidden || false,
                        isShared: childFiles[fileId].isShared,
                        isSharedWithMe: childFiles[fileId].isSharedWithMe,
                        lastModifiedBy: childFiles[fileId].lastModifiedBy,
                        size: childFiles[fileId].fileSize || 0,
                        mimeType: childFiles[fileId].fileType,
                        url: childFiles[fileId].url,
                        filePreviewUrl: childFiles[fileId].filePreviewUrl,
                        source: childFiles[fileId].source,
                        viewDocumentUrl: childFiles[fileId].viewDocumentUrl,
                        status: childFiles[fileId].status,
                    }
                    this.upsertFileItem(fileItem)
                }
            }
        },
        async navigateToFolder({ folderId, folderIds }: { folderId?: string; folderIds?: string[] } = {}) {
            this.isLoading = true

            try {
                // (1) Navigate to root
                if ((!folderId && (!folderIds || folderIds.length === 0)) || folderId === "root") {
                    if (!this.isRootLoaded) {
                        const { folder, childFolders, childFiles } = await useFileSystem().getRootContents()
                        this.updateFilesAndFolders(childFolders, childFiles)
                        this.currentPath = "/"
                        this.isRootLoaded = true
                        return
                    }
                }

                // (2) Navigate through multiple folder IDs (folderIds array)
                if (folderIds && folderIds.length > 0) {
                    if (!this.isRootLoaded) {
                        //Get root content
                        const { folder, childFolders, childFiles } = await useFileSystem().getRootContents()
                        this.updateFilesAndFolders(childFolders, childFiles)
                        this.isRootLoaded = true
                    }

                    let path = this.currentPath
                    for (const fId of folderIds) {
                        if (!this.navigatedFolderIds.includes(fId)) {
                            const { folder, childFolders, childFiles } = await useFileSystem().getFolderContents(fId)

                            this.updateFilesAndFolders(childFolders, childFiles)

                            if (folder) {
                                // Construct new path from the folder
                                path = path === "/" ? `/${folder.name}` : `${path}/${folder.name}`

                                // Track it in navigatedFolderIds
                                this.addUniquePath(folder.folderId)
                                if (!this.currentFolderIds.includes(folder.folderId)) {
                                    this.currentFolderIds.push(folder.folderId)
                                }
                            }
                        }
                    }
                    this.currentPath = path
                    return
                }

                // (3) Navigate to a single folder by folderId
                if (folderId) {
                    if (!this.navigatedFolderIds.includes(folderId)) {
                        const { folder, childFolders, childFiles } = await useFileSystem().getFolderContents(folderId)
                        this.updateFilesAndFolders(childFolders, childFiles)

                        if (folder) {
                            // Construct new path from the folder
                            const path = this.currentPath === "/" ? `/${folder.name}` : `${this.currentPath}/${folder.name}`
                            // Track it in navigatedFolderIds
                            this.addUniquePath(folder.folderId)
                            this.currentPath = path
                            if (!this.currentFolderIds.includes(folder.folderId)) {
                                this.currentFolderIds.push(folder.folderId)
                            }
                        }
                    } else {
                        const existingFolder = this.filesAndFolders.find((item) => item.id === folderId)
                        if (existingFolder) {
                            this.currentPath = this.currentPath === "/" ? `/${existingFolder.name}` : `${this.currentPath}/${existingFolder.name}`
                            if (!this.currentFolderIds.includes(folderId)) {
                                this.currentFolderIds.push(folderId)
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error navigating to folder:", error)
            } finally {
                this.updateRoutePath()
                this.isLoading = false
            }
        },
        async deleteFileOrFolder(fileOrFolderId: string, type: string, sourceId?: string) {
            if (this.isDeleting) return
            this.isDeleting = true
            try {
                let response
                if (type === "file") {
                    if (sourceId) {
                        response = await useUser().deleteIntegrationFile(fileOrFolderId, sourceId)
                    } else {
                        response = await useFileSystem().deleteFile(fileOrFolderId)
                    }

                    if (response && response.code === 200) {
                        this.filesAndFolders = this.filesAndFolders.filter((file) => file.id !== fileOrFolderId)
                    }
                } else {
                    response = await useFileSystem().deleteFolder(fileOrFolderId)
                    if (response && response.code === 200) {
                        this.filesAndFolders = this.filesAndFolders.filter((file) => file.id !== fileOrFolderId && file.parentFolderId !== fileOrFolderId)
                    }
                }
            } finally {
                this.isDeleting = false
            }
        },
        async renameFileOrFolder(fileOrFolderId: string, newName: string, type: "file" | "folder" | "note" = "file") {
            const item = this.filesAndFolders.find((item) => item.id === fileOrFolderId)
            console.log("item to be renamed", item)
            
            if (item) {
            const oldName = item.name;
            item.name = newName;

            if (type === "file") {
                await useFileSystem().updateFile(item);
            } else {
                await useFileSystem().updateFolder(item);
                this.filesAndFolders.forEach((file) => {
                    if (file.parentFolderId === fileOrFolderId) {
                        file.path = file.path.replace(oldName, newName);
                    }
                });
            }
            console.log("item after renaming", item);

            // Update the store
            this.filesAndFolders = this.filesAndFolders.map((item) => (item.id === fileOrFolderId ? { ...item, name: newName } : item));
        } else if (type === "note") {
            // Note rename logic
            const documentStore = useDocumentsStore();
            const noteId = fileOrFolderId.replace(/^note_/, "");
            const note = documentStore.notes[noteId];
            if (note) {
                const orgStore = useOrganizationStore();
                const organizationId = orgStore.currentOrganizationId || orgStore.currentOrganization?.id;
                await useUser().updateNoteData(
                    {
                        noteId: note.noteId,
                        title: newName,
                        content: note.content,
                        organizationId,
                    },
                    organizationId
                );
                await documentStore.fetchNotes(true);
            }
        }
        },
        async toggleFileOrFolderHidden(fileOrFolderId: string, type: "file" | "folder") {
            const item = this.filesAndFolders.find((item) => item.id === fileOrFolderId)
            if (!item) return
            item.isHidden = !item.isHidden

            // Update the store
            this.filesAndFolders = this.filesAndFolders.map((item) => (item.id === fileOrFolderId ? { ...item, isHidden: !item.isHidden } : item))

            if (type === "file") {
                await useFileSystem().updateFile(item)
            } else {
                await useFileSystem().updateFolder(item)
            }
        },
        async moveFileOrFolder(sourceFileOrFolderId: string, targetFileOrFolderId: string, type: "file" | "folder", source?: any) {
            let success = false
            const targetFileFolder = this.filesAndFolders.find((item) => item.id === targetFileOrFolderId)
            if (targetFileFolder) {
                const targetFileFolderPath = `${targetFileFolder.path === "/" ? "" : targetFileFolder.path}/${targetFileFolder.name}`
                if (type === "file") {
                    success = await useFileSystem().moveFile(sourceFileOrFolderId, targetFileOrFolderId, targetFileFolderPath, source)
                } else {
                    success = await useFileSystem().moveFolder(sourceFileOrFolderId, targetFileOrFolderId, targetFileFolderPath, source)
                }

                if (success) {
                    // Update the path of the file/folder in the store

                    this.filesAndFolders = this.filesAndFolders.map((file) => {
                        if (file.id === sourceFileOrFolderId) {
                            return { ...file, path: targetFileFolderPath, parentFolderId: targetFileOrFolderId }
                        }
                        return file
                    })
                }
            }
        },
        async shareFile(fileOrFolderId: string, email: string, role: string) {
            const item = this.getFileById(fileOrFolderId)
            if (!item) return
            if (item.source) {
                eventBus.emit("showToast", {
                    message: `Please share it on ${item.source.name}`,
                    _type: "error",
                })
                return
            }
            const fileType = item.type
            const response = await useFileSystem().shareFile(fileOrFolderId, fileType, email, role)
            if (response) {
                console.error("File sharing response", response)
            }
        },
    },
})
