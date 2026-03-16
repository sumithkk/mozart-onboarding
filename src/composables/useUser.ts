import cookie from "js-cookie"
import userService from "~/services/userService"
import eventBus from "~/util/eventBus"
import { googleSdkLoaded } from "vue3-google-login"
export default function useUser() {
    const config = useRuntimeConfig()
    const fileSystemStore = useFileSystemStore()
    const documentsStore = useDocumentsStore()

    const uploadFile = async (file: File, showToast = true) => {
        try {
            const organizationId = useOrganizationStore().currentOrganizationId
            const response: any = await userService(config).uploadFile(file, organizationId)
            if (response.code === 200) {
                if (showToast) {
                    eventBus.emit("showToast", {
                        message: response.message,
                        _type: "success",
                    })
                    return response.data
                } else return response.data
            } else {
                if (showToast) {
                    eventBus.emit("showToast", {
                        message: response.message,
                        _type: "error",
                    })
                    return false
                } else return false
            }
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message || error.message,
                _type: "error",
            })
            return false
        }
    }
    const uploadMultipleFiles = async (files: FileList, organizationId: string) => {
        try {
            const uploadedFiles: any = []
            for (const file of files) {
                const response: any = await userService(config).uploadFile(file, organizationId)
                if (response.code === 200) {
                    uploadedFiles.push(response.data)
                }
            }
            eventBus.emit("showToast", {
                message: "File uploaded successfully",
                _type: "success",
            })
            return uploadedFiles
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message || error.message,
                _type: "error",
            })
            return
        }
    }
    const getDocumentsList = async (organizationId: string) => {
        try {
            const response: any = await userService(config).getDocumentsList(organizationId)
            if (!response) {
                console.log("Failed to get documents list")
                return
            }
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
            return false
        }
    }
    const getDocumentParsedData = async (documentId: string, organizationId: string) => {
        try {
            const documentParsedData: any = await userService(config).getDocumentParsedData(documentId, organizationId)
            documentsStore.documentParsedData = documentParsedData.data.data
            documentsStore.documentId = documentParsedData.data.documentId
            return documentParsedData.data.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.message,
                _type: "error",
            })
            return
        }
    }
    const updateDocumentData = async (data: any, organizationId: string) => {
        try {
            const response: any = await userService(config).updateDocument(data, organizationId)
            eventBus.emit("showToast", {
                message: response.message,
                _type: "success",
            })
            return
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.message,
                _type: "error",
            })
            return
        }
    }
    const updateDocumentDate = async (data: any, organizationId: string) => {
        try {
            await userService(config).updateDocument(data, organizationId)
            return
        } catch (error: any) {
            console.log(error)
        }
    }
    const createNote = async (data: any, organizationId: string) => {
        try {
            const response: any = await userService(config).createNote(data, organizationId)
            eventBus.emit("showToast", {
                message: response.message || "Note created successfully",
                _type: "success",
            })
            return true
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to create note"
            eventBus.emit("showToast", {
                message: errorMessage,
                _type: "error",
            })
            return false
        }
    }
    const getNotes = async (organizationId: string) => {
        try {
            const notes: any = await userService(config).getNotes(organizationId)
            const extractedNotes = notes.data
            documentsStore.notes = extractedNotes
            return extractedNotes
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.message,
                _type: "error",
            })
            return
        }
    }
    const updateNoteData = async (data: any, organizationId: string) => {
        try {
            const response: any = await userService(config).updateNote(data, organizationId)
            eventBus.emit("showToast", {
                message: response.message || "Note updated successfully",
                _type: "success",
            })
            return true
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to update note"
            eventBus.emit("showToast", {
                message: errorMessage,
                _type: "error",
            })
            return false
        }
    }
    const deleteNote = async (noteId: string, organizationId: string) => {
        try {
            const response: any = await userService(config).deleteNote(noteId, organizationId)
            eventBus.emit("showToast", {
                message: response.message || "Note deleted successfully",
                _type: "success",
            })
            return true
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete note"
            eventBus.emit("showToast", {
                message: errorMessage,
                _type: "error",
            })
            return false
        }
    }
    const deleteSelectedNotes = async (noteIds: string[], organizationId: string) => {
        try {
            for (const noteId of noteIds) {
                await userService(config).deleteNote(noteId, organizationId)
            }
            eventBus.emit("showToast", {
                message: "Notes deleted successfully",
                _type: "success",
            })
            return true
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete some notes"
            eventBus.emit("showToast", {
                message: errorMessage,
                _type: "error",
            })
            return false
        }
    }
    const deleteDocument = async (documentId: string, organizationId: string) => {
        try {
            const response: any = await userService(config).deleteDocument(documentId, organizationId)
            eventBus.emit("showToast", {
                message: response.message,
                _type: "success",
            })
            return
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.message,
                _type: "error",
            })
            return
        }
    }
    const deleteSelectedDocuments = async (documentIds: string[], organizationId: string) => {
        try {
            for (const documentId of documentIds) {
                await userService(config).deleteDocument(documentId, organizationId)
            }
            eventBus.emit("showToast", {
                message: "Documents deleted successfully",
                _type: "success",
            })
            return
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.message,
                _type: "error",
            })
            return
        }
    }

    const getOAuthUrl = async () => {
        try {
            const response: any = await userService(config).getOAuthUrl()
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
            return
        }
    }
    const getOAuthToken = async (code: string) => {
        try {
            const response: any = await userService(config).getOAuthToken(code)
            return response
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
            return
        }
    }
    // ---------------------- User Settings (v1) ----------------------
    const getUserSettings = async () => {
        try {
            const response: any = await userService(config).getUserSettings()
            return response.data.settings
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error?.response?.data?.message || error.message,
                _type: "error",
            })
            return null
        }
    }

    const updateUserSettings = async (data: any) => {
        try {
            const response: any = await userService(config).updateUserSettings(data)
            eventBus.emit("showToast", {
                message: response.message || "Settings updated",
                _type: "success",
            })
            return response.data.settings
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error?.response?.data?.message || error.message,
                _type: "error",
            })
            return null
        }
    }

    const getRagToken = async () => {
        try {
            const response: any = await userService(config).getRagToken()
            return response.data.token
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error?.response?.data?.message || error.message,
                _type: "error",
            })
            return null
        }
    }
    const getGoogleDriveFiles = async (params?: any) => {
        try {
            const response: any = await userService(config).getGoogleDriveFiles(params)
            return response.data
        } catch (error: any) {
            console.log(error.response)
            return error.response.data
        }
    }

    const getPrompts = async () => {
        try {
            const response: any = await userService(config).getPrompts()
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
            return
        }
    }
    const getPromptByKey = async (key: string) => {
        try {
            const response: any = await userService(config).getPromptByKey(key)
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
            return
        }
    }
    const createPrompt = async (data: any) => {
        try {
            const response: any = await userService(config).createPrompt(data)
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
            return
        }
    }

    const updatePrompt = async (data: any) => {
        try {
            const response: any = await userService(config).updatePrompt(data)
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
            return
        }
    }

    const addAPIKey = async (payload: any, service?: string) => {
        try {
            const response: any = await userService(config).addAPIKey(payload, service)
            if (response && response.code === 200) {
                eventBus.emit("showToast", {
                    message: response.message || "API key saved successfully",
                    _type: "success",
                })
                return response.data
            } else {
                eventBus.emit("showToast", {
                    message: response?.message || "Failed to save API key",
                    _type: "error",
                })
                return false
            }
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response?.data?.message || error.message || "Failed to save API key",
                _type: "error",
            })
            return false
        }
    }

    const deleteAPIKey = async (apiKey: string, service: string) => {
        try {
            const response: any = await userService(config).deleteAPIKey(apiKey, service)
            if (response && response.code === 200) {
                eventBus.emit("showToast", {
                    message: response.message || "API key deleted",
                    _type: "success",
                })
                return response.code
            } else {
                eventBus.emit("showToast", {
                    message: response?.message || "Failed to delete API key",
                    _type: "error",
                })
                return
            }
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response?.data?.message || error.message || "Failed to delete API key",
                _type: "error",
            })
            return
        }
    }

    const getAPIKeys = async () => {
        try {
            const response: any = await userService(config).getAPIKeys()
            if (response && response.code === 200) {
                return response.data
            }
            return null
        } catch (error: any) {
            console.log(error.response)
            return null
        }
    }
    const getBaseUrl = () => {
        try {
            return config.public.apiUrl
        } catch (error: any) {
            console.log(error)
            return
        }
    }
    const getIntegrations = async () => {
        try {
            const response: any = await userService(config).getIntegrations()
            if (response && response.code === 200) {
                return response.data
            }
            return null
        } catch (error: any) {
            console.log(error.response)
            return null
        }
    }
    const deleteUserIntegration = async (service: string) => {
        try {
            const response: any = await userService(config).deleteUserIntegration(service)
            if (response && response.code === 200) {
                return response.data
            }
            return null
        } catch (error: any) {
            console.log(error.response)
            return null
        }
    }
    const getSourceFileParsedData = async (source: string, documentId: string, fileName: string, fileUrl: string, fileType: string) => {
        try {
            const response: any = await userService(config).getSourceFileParsedData(source, documentId, fileName, fileUrl, fileType)
            if (response.code === 200) {
                if (response.data && response.data.fileString) {
                    documentsStore.documentParsedData = response.data.fileString
                }
            }
        } catch (error) {
            console.log(error)
            documentsStore.isProcessing = false
            return false
        }
    }

    const getSourceFileParsedDataFromIntegrationFiles = async (documentId: string) => {
        try {
            const response: any = await userService(config).getSourceFileParsedDataFromIntegrationFiles(documentId)
            if (response.code === 200) {
                if (response.data) {
                    if (response.data.fileParseData.length > 0) {
                        documentsStore.documentParsedData = JSON.parse(response.data.fileParseData)
                    }
                }
            }
            return
        } catch (error) {
            console.log(error)
            documentsStore.isProcessing = false
            return false
        }
    }
    const getSourceFileParsedPagedata = async (source: string, documentId: string, fileName: string, fileUrl: string, fileType: string) => {
        try {
            const response: any = await userService(config).getSourceFileParsedData(source, documentId, fileName, fileUrl, fileType)
            if (response.code === 200) {
                if (response.data && response.data.fileString) {
                    return response.data.fileString
                }
            }
        } catch (error) {
            console.log(error)
            documentsStore.isProcessing = false
            return false
        }
    }
    const updateDocumentStatus = async (documentId: string, status: string) => {
        try {
            const response: any = await userService(config).updateDocumentStatus(documentId, status)
            return response.data
        } catch (error: any) {
            console.log(error.response)
            return
        }
    }
    const addIntegrationFiles = async (source: string, files: any[]) => {
        try {
            const response: any = await userService(config).addIntegrationFiles(source, files)
            eventBus.emit("showToast", {
                message: "File uploaded successfully",
                _type: "success",
            })
            if (response.code === 200) {
                const files = response.data.files
                files.forEach((file: any) => {
                    fileSystemStore.updateFile(file)
                })
            }
            return response.data
        } catch (error: any) {
            eventBus.emit("showToast", {
                message: error.response.data.message,
                _type: "error",
            })
            return false
        }
    }
    const deleteIntegrationFile = async (documentId: string, source: string) => {
        try {
            const response: any = await userService(config).deleteIntegrationFile(documentId, source)
            if (response.code === 200) {
                eventBus.emit("showToast", {
                    message: `File deleted successfully`,
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
    const getGoogleAuthCode = async (scope: string, callback: (response: any) => void) => {
        try {
            googleSdkLoaded((google) => {
                google.accounts.oauth2
                    .initCodeClient({
                        client_id: config.public.googleAuthClientId,
                        scope: scope,
                        redirect_uri: "postmessage",
                        callback,
                    })
                    .requestCode()
            })
        } catch (error: any) {
            console.log(error.response)
            return false
        }
    }

    const validateIntegration = async (payload: any) => {
        try {
            const response: any = await userService(config).validateIntegration(
                payload
            )
            // API returns { code: 200, message: "..." } on success
            return response
        } catch (error: any) {
            // Handle error responses (400, 500, etc.)
            if (error.response?.data) {
                return error.response.data
            }
            // Fallback for unexpected errors
            return {
                code: 500,
                message: error.message || "An error occurred during validation",
            }
        }
    }
    return {
        getNotes,
        uploadFile,
        createNote,
        deleteNote,
        deleteSelectedNotes,
        updateNoteData,
        deleteDocument,
        deleteSelectedDocuments,
        getDocumentsList,
        updateDocumentData,
        updateDocumentDate,
        getDocumentParsedData,
        uploadMultipleFiles,
        getOAuthUrl,
        getOAuthToken,
        getGoogleDriveFiles,
        getPromptByKey,
        getPrompts,
        updatePrompt,
        createPrompt,
        addAPIKey,
        deleteAPIKey,
        getAPIKeys,
        getBaseUrl,
        getIntegrations,
        deleteUserIntegration,
        getSourceFileParsedData,
        updateDocumentStatus,
        addIntegrationFiles,
        deleteIntegrationFile,
        getGoogleAuthCode,
        getSourceFileParsedPagedata,
        getSourceFileParsedDataFromIntegrationFiles,
        getUserSettings,
        updateUserSettings,
        getRagToken,
        validateIntegration,
    }
}
