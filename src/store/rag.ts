import { defineStore } from "pinia"

export const useRagStore = defineStore("rag", {
    state: () => ({
        documentId: "",
        status: "",
        collections: <ICollection[]>[],
        currentCollection: "",
        ragData: <any[]>[],
        ragUserFilesData: <IRAGFiles[]>[],
        qdrantInstances: ["cloud", "local", "both"],
        currentQdrantInstance: "cloud",
        collectionPointCount: 0,
        currentMaxOffset: 0,
        previousMaxOffset: 0,
        currentMinOffset: 0,
        previousMinOffset: 0,
        rag_response_templates: ["legal", "generic"],
        template_name: "legal",
        userInputUnstructuredData: <any>{},
        LLMResponse: "",
        prompt: "",
        searchInputUnstructuredData: <any>{},
        googleDriveFiles: [],
        sheetFiles: [],
        isDataMode: false,
        isBetaEnabled: false,
        vectorizationLogs: <any>{},
        isLoading: false,
        isProcessing: false,
        isVectorizing: false,
        summaries: <any>{},
        summaryStream: <any>{},
        summaryProcessing: false,
        summaryPrompt: <any>{},
        systemPrompt: <any>{},
        platform: "",
        environment: "",
        // Cache flags to prevent duplicate API calls
        _collectionsLoaded: false,
        _collectionDataLoaded: false,
        _collectionPointCountLoaded: false,
    }),
    actions: {
        async getGoogleDriveFiles() {
            const files = await useUser().getGoogleDriveFiles()
            this.googleDriveFiles = files
        },
        updateRagDocumentId(documentId: string) {
            this.documentId = documentId
        },
        updateRagDocumentIdStatus(status: string) {
            this.status = status
        },
        removeRagUserFile(name: string) {
            this.ragUserFilesData = this.ragUserFilesData.filter((f: any) => f.name !== name)
        },
        removePointById(pointId: any) {
            this.ragData = this.ragData.filter((p: any) => p.id !== pointId)
        },
        removePointsByTitle(title: string) {
            this.ragData = this.ragData.filter((p: any) => p.title !== title)
        },
        deleteCollectionData() {
            this.ragData = []
            this.ragUserFilesData = <IRAGFiles[]>[]
        },
        getMethodDescription(embedding?: string) {
            if (!embedding) return "None"
            if (embedding === "bert") {
                return "BERT is ideal for general-purpose text embeddings due to their comprehensive understanding of context."
            } else if (embedding === "roberta") {
                return "RoBERTa is ideal for general-purpose text embeddings due to their comprehensive understanding of context."
            } else if (embedding === "distilbert") {
                return "DistilBERT offers a balance between performance and efficiency, making it suitable for resource-constrained environments."
            } else if (embedding === "sbert") {
                return "Sentence-BERT is suited to generate semantically meaningful sentence embeddings."
            } else if (embedding === "albert") {
                return "A 'lite' BERT variant that may provide complementary signals on lower compute budgets."
            } else if (embedding === "bart") {
                return "As an encoder-decoder model designed for text generation, it should be highest priority to include for improving the generation capabilities."
            } else if (embedding === "electra") {
                return "As an efficient BERT-style model with a novel pretraining task, it can further enrich the embedding diversity."
            } else if (embedding === "dpr") {
                return "By specializing in dense passage retrieval, DPR can significantly boost search relevance over generic semantic encoders."
            }
            return "None"
        },
        updateTemplate(template: string) {
            const templateOptions = this.rag_response_templates
            if (!templateOptions.includes(template)) return
            this.template_name = template
        },
        updateRagFiles(data: any) {
            this.ragUserFilesData = data
        },
        async getResponse() {
            const completion = useCompletion()
            const response = await completion.getResponse(this.prompt)
            this.LLMResponse = response
        },
        updateUserInputUnstructuredData(data: any) {
            this.userInputUnstructuredData = data
        },
        generatePrompt() {
            let result = `${this.userInputUnstructuredData.role}\n\n${this.userInputUnstructuredData.instructions}\n\n${this.userInputUnstructuredData.contextHeader}\n\n${this.userInputUnstructuredData.questionHeader}\n\n${this.userInputUnstructuredData.responseInstructions}\n\n${this.userInputUnstructuredData.citationFormat}`
            this.prompt = result
            return result
        },
        deleteCollection(collection: string) {
            this.collections = this.collections.filter((c: any) => c.name !== collection)
        },

        // Reset cache flags (useful for refresh scenarios)
        resetCacheFlags() {
            this._collectionsLoaded = false
            this._collectionDataLoaded = false
            this._collectionPointCountLoaded = false
        },
    },
})
