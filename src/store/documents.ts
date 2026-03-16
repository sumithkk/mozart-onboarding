import { defineStore } from "pinia"

export const useDocumentsStore = defineStore("documents", {
    state: (): IDocuments & { notesLoaded: boolean } => ({
        documents: {},
        documentId: "",
        documentParsedData: {},
        notes: {},
        isLoading: true,
        isProcessing: false,
        selectedPageRange: [1, 1],
        notesLoaded: false,
    }),
    actions: {
        // ---------------------- FETCHING METHODS ----------------------
        async fetchDocuments(refresh = false, showLoading = true) {
            if (showLoading) this.isLoading = true
            const doesDocumentsExist = Object.keys(this.documents).length > 0
            if (refresh || !doesDocumentsExist) {
                const user = useUser()
                const organizationStore = useOrganizationStore()
                const documents: any = await user.getDocumentsList(organizationStore.currentOrganizationId)
                if (!documents) return
                this.documents = documents
            }
            this.isLoading = false
        },
        async fetchNotes(refresh = false) {
            const doesNotesExist = this.notes && Object.keys(this.notes).length > 0
            if (refresh || !doesNotesExist) {
                const user = useUser()
                const organizationStore = useOrganizationStore()
                const organizationId = organizationStore.currentOrganizationId
                const notes: any = await user.getNotes(organizationId)
                if (!notes) {
                    this.notes = {}
                } else {
                    this.notes = notes
                }
            }
            this.notesLoaded = true
        },
        flushData() {
            this.documents = {}
            this.notes = {}
            this.notesLoaded = false
            return true
        },
        // ---------------------- LOGICAL METHODS ----------------------
    },
    getters: {},
})
