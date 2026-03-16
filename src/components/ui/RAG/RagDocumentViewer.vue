<template>
    <!-- State 1: Render tokens -->
    <div v-if="state == 1" class="text-textColor h-full w-full overflow-scroll">
        <div v-for="(token, index) in tokens" :key="index">
            <div v-html="marked.parse(token.raw, { ...defaults, gfm: true, breaks: true, renderer })"></div>
        </div>
    </div>

    <!-- State 2: Prompt input -->
    <div v-if="state == 2" class="text-textColor h-full w-full overflow-scroll">
        <textarea class="border-gray2 text-textColor h-full w-full rounded border bg-transparent p-2.5" placeholder="prompt" v-model="ragStore.prompt" />
    </div>

    <!-- State 3: Raw LLM response -->
    <div v-if="state == 3" class="text-textColor h-full w-full overflow-scroll">
        {{ ragStore.LLMResponse }}
    </div>

    <!-- Switch Buttons -->
    <div class="flex cursor-pointer justify-center gap-2.5">
        <!-- Preview -->
        <button class="border-itemColor bg-Mgray text-textColor hover:bg-white hover:text-Mgray rounded-xl border px-5 py-2.5 text-center transition-all duration-300 ease-in-out" :class="{ 'bg-white text-Mgray': state == 1 }" @click="state = 1">Preview</button>

        <!-- Prompt -->
        <button class="border-itemColor bg-Mgray text-textColor hover:bg-white hover:text-Mgray rounded-xl border px-5 py-2.5 text-center transition-all duration-300 ease-in-out" :class="{ 'bg-white text-Mgray': state == 2 }" @click="state = 2">Prompt</button>

        <!-- Raw Response -->
        <button class="border-itemColor bg-Mgray text-textColor hover:bg-white hover:text-Mgray rounded-xl border px-5 py-2.5 text-center transition-all duration-300 ease-in-out" :class="{ 'bg-white text-Mgray': state == 3 }" @click="state = 3">Raw Response</button>

        <!-- Export Document -->
        <button class="border-itemColor bg-Mgray text-textColor hover:bg-white hover:text-Mgray rounded-xl border px-5 py-2.5 text-center transition-all duration-300 ease-in-out" @click="exportToDocx">Export Document</button>
    </div>
</template>

<script setup lang="ts">
    import { Document, Packer, Paragraph, TextRun } from "docx"
    import { saveAs } from "file-saver"
    import { marked } from "marked"
    import { sanitizeResponseContent } from "../../../util/index.js"

    const state = ref<number>(1)
    const ragStore = useRagStore()

    const renderer = new marked.Renderer()
    const { extensions, ...defaults } = marked.getDefaults()

    // Lex (tokenize) the LLM response to display as Markdown
    const tokens = computed(() => marked.lexer(sanitizeResponseContent(ragStore.LLMResponse)))

    // Export content as a docx file
    async function exportToDocx() {
        const contentText = ragStore.userInputUnstructuredData
        console.log(contentText)

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [new TextRun(contentText)],
                        }),
                    ],
                },
            ],
        })

        const blob = await Packer.toBlob(doc)
        saveAs(blob, "exported-content.docx")
    }
</script>
