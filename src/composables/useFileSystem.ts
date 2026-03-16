import eventBus from "~/util/eventBus"
import fileSystemService from "~/services/fileSystemService"

export default function useFileSystem() {
    const config = useRuntimeConfig()
    const fileSystemStore = useFileSystemStore()

    const createFile = async (onProgress: (progress: number) => void, file: File, data: any, isAnonymous: boolean = false, keepOriginal: boolean = false, anonymizationTerms: string = "", showToast: boolean = true) => {
        try {
            const response: any = await fileSystemService(config).createFile(onProgress, file, data, isAnonymous, keepOriginal, anonymizationTerms)
            const parsedResponse = JSON.parse(response)
            if (parsedResponse.code === 200) {
                console.log(parsedResponse.data)
                const files = parsedResponse.data.files
                files.forEach((file: any) => {
                    fileSystemStore.updateFile(file)
                })
                if (showToast) {
                    eventBus.emit("showToast", {
                        message: `File ${data.name} uploaded successfully`,
                        _type: "success",
                    })
                }
                return true
            }
            return false
        } catch (error: any) {
            console.log(error)
            if (showToast) {
                eventBus.emit("showToast", {
                    message: error || "Unable to upload file",
                    _type: "error",
                })
            }
            return false
        }
    }

    const createFolder = async (data: any) => {
        try {
            const response: any = await fileSystemService(config).createFolder(data)
            if (response.code === 200) {
                eventBus.emit("showToast", {
                    message: `Folder created successfully`,
                    _type: "success",
                })
            }
            return response
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
            return false
        }
    }

    const getRootContents = async () => {
        try {
            const response: any = await fileSystemService(config).getFolderContents("root")
            return response.data
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to get root contents",
                _type: "error",
            })
            return false
        }
    }
    const getFolderContents = async (folderId: string) => {
        try {
            const response: any = await fileSystemService(config).getFolderContents(folderId)
            return response.data
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to get folder contents",
                _type: "error",
            })
            return false
        }
    }
    const deleteFile = async (fileId: string) => {
        try {
            const response: any = await fileSystemService(config).deleteFile(fileId)
            console.error(response.code === 200)
            if (response.code === 200) {
                eventBus.emit("showToast", {
                    message: `File deleted successfully`,
                    _type: "success",
                })
            }
            return response
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to delete file",
                _type: "error",
            })
            return false
        }
    }
    const deleteFolder = async (folderId: string) => {
        try {
            const response: any = await fileSystemService(config).deleteFolder(folderId)
            if (response.code === 200) {
                eventBus.emit("showToast", {
                    message: `Folder deleted successfully`,
                    _type: "success",
                })
            }
            return response
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to delete folder",
                _type: "error",
            })
            return false
        }
    }
    const updateFolder = async (data: any) => {
        try {
            const response: any = await fileSystemService(config).updateFolder(data)
            eventBus.emit("showToast", {
                message: response.message,
                _type: "success",
            })
            return response
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to update folder",
                _type: "error",
            })
            return false
        }
    }
    const updateFile = async (data: any) => {
        try {
            const response: any = await fileSystemService(config).updateFile(data)
            eventBus.emit("showToast", {
                message: response.message,
                _type: "success",
            })
            return response
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to update file",
                _type: "error",
            })
            return false
        }
    }
    const moveFile = async (sourceFileFolderId: string, destinationFileFolderId: string, targetFileFolderPath: string, source?: any) => {
        try {
            const response: any = await fileSystemService(config).moveFile(sourceFileFolderId, destinationFileFolderId, targetFileFolderPath, source)
            eventBus.emit("showToast", {
                message: response.message,
                _type: "success",
            })
            return response
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to move file",
                _type: "error",
            })
            return false
        }
    }
    const moveFolder = async (sourceFileFolderId: string, destinationFileFolderId: string, targetFileFolderPath: string, source?: any) => {
        try {
            const response: any = await fileSystemService(config).moveFolder(sourceFileFolderId, destinationFileFolderId, targetFileFolderPath, source)
            eventBus.emit("showToast", {
                message: response.message,
                _type: "success",
            })
            return response
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to move folder",
                _type: "error",
            })
            return false
        }
    }
    const anonymizeExistingFile = async (fileId: string, anonymizationTerms: string) => {
        try {
            const response: any = await fileSystemService(config).anonymizeExistingFile(fileId, anonymizationTerms)
            if (response.code === 200) {
                const files = response.data.files
                files.forEach((file: any) => {
                    fileSystemStore.updateFile(file)
                })
                eventBus.emit("showToast", {
                    message: `File anonymized successfully`,
                    _type: "success",
                })
                return true
            }
            return false
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to anonymize file",
                _type: "error",
            })
            return false
        }
    }
    const getAllUserFiles = async () => {
        try {
            const response: any = await fileSystemService(config).getAllUserFiles()
            return response.data
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to get all user files",
                _type: "error",
            })
            return false
        }
    }
    const shareFile = async (fileOrFolderId: string, fileType: string, email: string, role: string) => {
        try {
            const response: any = await fileSystemService(config).shareFile(fileOrFolderId, fileType, email, role)
            eventBus.emit("showToast", {
                message: response.message,
                _type: "success",
            })
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message || "Unable to share file",
                _type: "error",
            })
            return false
        }
    }
    const getSharedUsers = async (fileOrFolderId: string) => {
        try {
            const response: any = await fileSystemService(config).getSharedUsers(fileOrFolderId)
            return response.data
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to get shared users",
                _type: "error",
            })
            return false
        }
    }
    const deleteAllFilesAndFolders = async () => {
        try {
            await fileSystemService(config).deleteAllFilesAndFolders()
            fileSystemStore.filesAndFolders = []
            eventBus.emit("showToast", {
                message: "All files and folders deleted successfully",
                _type: "success",
            })
            return true
        } catch (error: any) {
            console.log(error)
            eventBus.emit("showToast", {
                message: "Unable to delete all files and folders",
                _type: "error",
            })
            return false
        }
    }
    return {
        createFile,
        createFolder,
        getRootContents,
        getFolderContents,
        deleteFile,
        deleteFolder,
        updateFolder,
        updateFile,
        moveFile,
        moveFolder,
        anonymizeExistingFile,
        getAllUserFiles,
        shareFile,
        getSharedUsers,
        deleteAllFilesAndFolders,
    }
}
