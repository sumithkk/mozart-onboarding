<template>
    <div class="bg-background bg-background relative mb-5 flex max-h-[78vh] flex-col space-y-6 overflow-y-scroll p-5">
        <div class="text-foreground text-foreground flex items-center gap-2 text-2xl font-bold">
            <div class="materialSymbolsOutlined">keyboard_command_key</div>
            <span>System Prompt Editor</span>
        </div>
        <div class="text-muted-foreground text-muted-foreground text-sm">Create new system prompts or edit existing ones</div>
        <!-- Template Selector -->
        <div class="space-y-2">
            <Dropdown :options="templateOptions" placeholder="Select template" label="Template" :defaultValue="template" v-model="template" @update:modelValue="handleTemplateChange" />
        </div>

        <!-- Prompt Information Section -->
        <div class="space-y-4">
            <h2 class="text-foreground text-foreground text-lg font-semibold">Prompt Information</h2>
            <hr class="border-border border-border" />
        </div>

        <!-- Static Prompt -->
        <div v-if="staticPrompt" class="space-y-4">
            <div>
                <label class="text-muted-foreground text-muted-foreground block text-sm font-semibold"> Prompt: </label>
                <textarea class="bg-card text-foreground w-full rounded-lg border p-2" placeholder="Key points to address in your response" v-model="promptText" rows="5"></textarea>
            </div>
            <div v-if="promptNote">
                <label class="text-muted-foreground text-muted-foreground block text-sm font-semibold">Note:</label>
                <div class="bg-card bg-card rounded-lg p-2">{{ promptNote }}</div>
            </div>
            <div v-if="promptName">
                <label class="text-muted-foreground text-muted-foreground block text-sm font-semibold">Prompt Name:</label>
                <div class="bg-card bg-card rounded-lg p-2">{{ promptName }}</div>
            </div>
        </div>

        <!-- Dynamic Prompts -->
        <div v-else class="space-y-6">
            <div class="space-y-4">
                <div v-if="showTemplate">
                    <label class="text-muted-foreground text-muted-foreground block text-sm font-semibold">Template:</label>
                    <textarea class="bg-card text-foreground w-full rounded-lg border p-2" placeholder="Name for Template" v-model="templateName" rows="1"></textarea>
                </div>
                <div>
                    <label class="text-muted-foreground text-muted-foreground block text-sm font-semibold">Role:</label>
                    <textarea class="bg-card text-foreground w-full rounded-lg border p-2" placeholder="Role for Mozart" v-model="role" rows="5"></textarea>
                </div>
                <div>
                    <label class="text-muted-foreground text-muted-foreground block text-sm font-semibold">Instructions:</label>
                    <textarea class="bg-card text-foreground w-full rounded-lg border p-2" placeholder="Add instructions" v-model="instructions" rows="5"></textarea>
                </div>
            </div>

            <!-- Response Details -->
            <div class="space-y-4">
                <h2 class="text-foreground text-foreground text-lg font-semibold">Response Details</h2>
                <hr class="border-border border-border" />
                <div>
                    <label class="text-muted-foreground text-muted-foreground block text-sm font-semibold"> Response Instructions: </label>
                    <textarea class="bg-card text-foreground w-full rounded-lg border p-2" placeholder="Key points to address in your response" v-model="responseInstructions" rows="5"></textarea>
                </div>
                <div>
                    <label class="text-muted-foreground text-muted-foreground block text-sm font-semibold"> Citation Format: </label>
                    <textarea class="bg-card text-foreground w-full rounded-lg border p-2" placeholder="Format of your citations" v-model="citationFormat" rows="5"></textarea>
                </div>
            </div>

            <!-- Additional Sections -->
            <div v-for="(value, key) in additionalSections" :key="key" class="space-y-2">
                <label class="text-muted-foreground text-muted-foreground block text-sm font-semibold">
                    {{ key }}
                </label>
                <textarea class="bg-card text-foreground w-full rounded-lg border p-2 focus:outline-none" :placeholder="`Key points to address ${key} section`" v-model="additionalSections[key]" rows="5" @input="handleAdditionalSectionChange(key)"></textarea>
            </div>
        </div>

        <!-- Add Section -->
        <div v-if="addSectionSelection === 1" class="space-y-4">
            <div class="flex items-center space-x-3">
                <input class="bg-card text-foreground flex-grow rounded-lg border p-2" type="text" placeholder="Section Name" v-model="newSectionKey" />
                <button class="bg-accent text-foreground hover:bg-accent rounded-lg px-3 py-2" @click="addSectionToggle(2)">✓</button>
                <button class="bg-destructive text-foreground hover:bg-destructive rounded-lg px-3 py-2" @click="addSectionToggle(0)">×</button>
            </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-4">
            <button v-if="addSectionSelection === 0 && !staticPrompt" class="bg-primary rounded-lg px-4 py-2 text-white hover:bg-mozart-blue-700 focus:outline-none" @click="addSectionToggle(1)">Add Section</button>
            <button class="border-border text-muted-foreground hover:bg-background border-border text-muted-foreground hover:bg-secondary rounded-lg border px-4 py-2 focus:outline-none" @click="generatePrompt">Save Prompt</button>
            <button class="border-border text-muted-foreground hover:bg-background border-border text-muted-foreground hover:bg-secondary flex items-center space-x-1 rounded-lg border px-4 py-2 focus:outline-none" @click="handleClear()">
                <span class="materialSymbolsOutlined">close</span>
                <span>Clear Input</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from "vue"

    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    const rag = useRag()

    // -----------------------------| Store |-----------------------------//
    const ragStore = useRagStore()
    const organizationStore = useOrganizationStore()

    //-----------------------------| Refs |-----------------------------//
    const template = ref(ragStore.template_name)

    const role = ref(ragStore.userInputUnstructuredData[template.value]?.role)
    const instructions = ref(ragStore.userInputUnstructuredData[template.value]?.instructions)
    const contextHeader = ref(ragStore.userInputUnstructuredData[template.value]?.contextHeader)
    const questionHeader = ref(ragStore.userInputUnstructuredData[template.value]?.questionHeader)
    const responseInstructions = ref(ragStore.userInputUnstructuredData[template.value]?.responseInstructions)
    const citationFormat = ref(ragStore.userInputUnstructuredData[template.value]?.citationFormat)
    const promptText = ref(ragStore.userInputUnstructuredData[template.value]?.prompt || "")
    const promptName = ref(ragStore.userInputUnstructuredData[template.value]?.name || "")
    const promptNote = ref(ragStore.userInputUnstructuredData[template.value]?.note || "")
    const additionalSections: any = computed(() => {
        const promptTemplate = ref(ragStore.userInputUnstructuredData[template.value] || {})
        const excludeKeys = ["role", "instructions", "contextHeader", "questionHeader", "responseInstructions", "citationFormat", "prompt", "note", "type"]
        if (!promptTemplate.value) return []
        const result = Object.keys(promptTemplate.value)
            .filter((key) => !excludeKeys.includes(key))
            .reduce((obj: { [key: string]: any }, key) => {
                obj[key] = promptTemplate.value[key]
                return obj
            }, {})
        return result
    })
    const currentData = ref({})
    const recentData = ref<any>({})
    const templateName = ref("")
    const showTemplate = ref(false)
    const updateData = ref(false)
    const staticPrompt = ref(false)
    const addSectionSelection = ref(0)
    const newSectionKey = ref("")

    const templateOptions = computed(() => {
        const options = Object.keys(recentData.value).map((key) => ({
            text: key.charAt(0).toUpperCase() + key.slice(1),
            value: key,
        }))
        // Add the 'Create New Template' option
        options.push({
            text: "Create New Template",
            value: "create_new",
        })
        return options
    })

    type TemplateKey = "legal" | "generic"

    watchEffect(() => {
        if (!updateData.value) {
            if (ragStore.userInputUnstructuredData[template.value] && (ragStore.userInputUnstructuredData[template.value].type === "static" || ragStore.userInputUnstructuredData[template.value].type === "system")) {
                staticPrompt.value = true
            } else staticPrompt.value = false
            ragStore.userInputUnstructuredData[template.value] = {
                ...ragStore.userInputUnstructuredData[template.value],
                role: role.value || ragStore.userInputUnstructuredData[template.value]?.role,
                instructions: instructions.value || ragStore.userInputUnstructuredData[template.value]?.instructions,
                contextHeader: contextHeader.value || ragStore.userInputUnstructuredData[template.value]?.contextHeader,
                questionHeader: questionHeader.value || ragStore.userInputUnstructuredData[template.value]?.questionHeader,
                responseInstructions: responseInstructions.value || ragStore.userInputUnstructuredData[template.value]?.responseInstructions,
                citationFormat: citationFormat.value || ragStore.userInputUnstructuredData[template.value]?.citationFormat,
                prompt: promptText.value || ragStore.userInputUnstructuredData[template.value]?.prompt,
                note: promptNote.value || ragStore.userInputUnstructuredData[template.value]?.note,
                name: ragStore.userInputUnstructuredData[template.value]?.name,
                type: staticPrompt.value ? ragStore.userInputUnstructuredData[template.value].type : "unstructured",
            }
            if (ragStore.userInputUnstructuredData[template.value].name) promptName.value = ragStore.userInputUnstructuredData[template.value].name
        }
    })

    onMounted(async () => {
        const userInputDataLength = Object.keys(ragStore.userInputUnstructuredData).length
        if (userInputDataLength === 0 || userInputDataLength === 1) {
            const response = await useRag().getAllPrompts()
            ragStore.userInputUnstructuredData = response
        }
        updateTemplate(template.value)
        if (!Object.keys(ragStore.systemPrompt).length) await useRag().getSystemPrompt(organizationStore.currentOrganizationId)
        recentData.value = ragStore.userInputUnstructuredData
    })
    //-----------------------------| Functions |-----------------------------//

    const handleDefault = (template: TemplateKey) => {
        const templates = {
            legal: {
                role: "You are undertaking the role of Mozart, an AI expert in the field of Law.",
                instructions: "A question has been posed that requires your specialized knowledge. Below, you will find context and exhibits derived from a vector database, crucial for constructing a well-informed response. It's important to closely analyze this information to uncover any potential relevance to the question at hand.",
                context_header: "Context/Exhibits: {context}",
                question_header: "Question: {user_query}",
                response_instructions: "In responding, please identify and articulate any connections between the provided context/exhibits and the question. Whenever you use information from a specific context/exhibit, include the corresponding citation marker at the end of the sentence or paragraph where the information was used.",
                citation_format: "Please use the following format for citations: [CITE_{index}]({item['url']}#page={item['page_number']})",
            },
            generic: {
                role: "You are an AI assistant.",
                instructions: "A question has been posed that requires your specialized knowledge. Below, you will find context and exhibits derived from a vector database, crucial for constructing a well-informed response. It's important to closely analyze this information to uncover any potential relevance to the question at hand.",
                context_header: "Context/Exhibits: {context}",
                question_header: "Question: {user_query}",
                response_instructions: "In responding, please identify and articulate any connections between the provided context/exhibits and the question. Use your expertise to provide the most comprehensive and reasoned answer possible, utilizing the provided context/exhibits.",
                citation_format: "Please use the following format for citations: [CITE_{index}]({item['url']}#page={item['page_number']})",
            },
        }

        const selectedTemplateData = templates[template] || templates["generic"]

        role.value = selectedTemplateData.role
        instructions.value = selectedTemplateData.instructions
        contextHeader.value = selectedTemplateData.context_header
        questionHeader.value = selectedTemplateData.question_header
        responseInstructions.value = selectedTemplateData.response_instructions
        citationFormat.value = selectedTemplateData.citation_format
    }

    const handleClear = () => {
        role.value = ""
        instructions.value = ""
        responseInstructions.value = ""
        citationFormat.value = ""
        templateName.value = ""
        promptText.value = ""

        ragStore.userInputUnstructuredData[template.value].role = ""
        ragStore.userInputUnstructuredData[template.value].instructions = ""
        ragStore.userInputUnstructuredData[template.value].contextHeader = ""
        ragStore.userInputUnstructuredData[template.value].questionHeader = ""
        ragStore.userInputUnstructuredData[template.value].responseInstructions = ""
        ragStore.userInputUnstructuredData[template.value].citationFormat = ""
    }

    const updateTemplate = async (template: string) => {
        ragStore.updateTemplate(template)
        ragStore.userInputUnstructuredData[template] = recentData.value[template]
        const selectedTemplateData = ragStore.userInputUnstructuredData[template]
        if (!selectedTemplateData) return
        role.value = selectedTemplateData.role
        instructions.value = selectedTemplateData.instructions
        contextHeader.value = selectedTemplateData.contextHeader
        questionHeader.value = selectedTemplateData.questionHeader
        responseInstructions.value = selectedTemplateData.responseInstructions
        citationFormat.value = selectedTemplateData.citationFormat
        promptNote.value = selectedTemplateData.note
        promptText.value = selectedTemplateData.prompt
    }
    const saveSystemPrompt = async (templateData: string) => {
        try {
            const response = await rag.updateSystemPrompt(ragStore.userInputUnstructuredData[templateData])
            ragStore.systemPrompt = response
        } catch (error) {
            console.error("Error fetching RAG response:", error)
        }
    }
    const generatePrompt = async () => {
        try {
            const templateData = showTemplate.value ? templateName.value : template.value
            if (ragStore.userInputUnstructuredData[templateData].type && ragStore.userInputUnstructuredData[templateData].type === "system") return await saveSystemPrompt(templateData)
            let userData
            if (showTemplate.value) {
                updateData.value = false
                ragStore.userInputUnstructuredData[template.value] = recentData.value[template.value]
                template.value = templateName.value
                userData = {
                    [templateData]: {
                        role: role.value,
                        instructions: instructions.value,
                        contextHeader: contextHeader.value,
                        questionHeader: questionHeader.value,
                        responseInstructions: responseInstructions.value,
                        citationFormat: citationFormat.value,
                        ...additionalSections.value,
                    },
                }
            } else {
                userData = ragStore.userInputUnstructuredData
            }
            const response = await useRag().updatePrompt({ ...userData[templateData], prompt_name: templateData })
            if (response.status === 200 && showTemplate.value) {
                ragStore.updateTemplate(templateData)
                recentData.value[templateData] = ragStore.userInputUnstructuredData[templateData]
            } else {
                recentData.value[templateData] = ragStore.userInputUnstructuredData[templateData]
            }
        } catch (error) {
            console.error("Error fetching RAG response:", error)
        }
        showTemplate.value = false
    }

    function updateDefault() {
        role.value = ragStore.userInputUnstructuredData[template.value]?.role
        instructions.value = ragStore.userInputUnstructuredData[template.value]?.instructions
        contextHeader.value = ragStore.userInputUnstructuredData[template.value]?.contextHeader
        questionHeader.value = ragStore.userInputUnstructuredData[template.value]?.questionHeader
        responseInstructions.value = ragStore.userInputUnstructuredData[template.value]?.responseInstructions
        citationFormat.value = ragStore.userInputUnstructuredData[template.value]?.citationFormat
    }

    const handleTemplateChange = async (newTemplate: string) => {
        if (newTemplate === "create_new") {
            handleCreateTemplate()
        } else {
            showTemplate.value = false
            ragStore.updateTemplate(newTemplate)
            updateTemplate(newTemplate as TemplateKey)
        }
    }

    const updateTemplateDefault = async (template: string) => {
        ragStore.updateTemplate(template)
        handleDefault(template as TemplateKey)
    }

    function handleCreateTemplate() {
        updateData.value = true
        role.value = ""
        instructions.value = ""
        responseInstructions.value = ""
        citationFormat.value = ""
        templateName.value = ""
        showTemplate.value = true
    }
    const addSectionToggle = (value: number) => {
        if (value === 1) {
            const inputElement = document.getElementById("inputKey")
            if (inputElement) inputElement.focus()
            addSectionSelection.value = 1
        } else if (value === 2) {
            if (!newSectionKey.value) return
            addSection(newSectionKey.value)
        } else if (value === 0) {
            addSectionSelection.value = 0
        }
    }
    const addSection = (key: string) => {
        additionalSections.value[key] = ""
        ragStore.userInputUnstructuredData[template.value][key] = ""
        addSectionSelection.value = 0
        newSectionKey.value = ""
    }
    const handleAdditionalSectionChange = (key: any) => {
        ragStore.userInputUnstructuredData[template.value][key] = additionalSections.value[key]
    }
</script>
