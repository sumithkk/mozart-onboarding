<template>
    <!-- Outer Container: add `group relative` to enable hover-based visibility toggles -->
    <div :data-reasoning="message.author.role === 'assistant' && message.content.thinking && Object.keys(message.content.thinking).length" @click="message.author.role === 'assistant' && message.content.thinking && emitMessageSelected()">
        <!-- Attachments (e.g., documents) -->
        <div v-if="message.metaData && message.metaData.documents" class="messageAttachments flex items-end gap-[0.5rem]" :class="isSelf ? 'justify-end' : 'justify-start'">
            <template v-for="(attachment, index) in message.metaData.documents" :key="index">
                <!-- Image Preview -->
                <div v-if="isImageType(attachment.fileType) && !'pdf'.includes(attachment?.fileType?.toLowerCase())" class="imagePreview">
                    <img :src="attachment.url" :alt="attachment.fileName" class="h-[200px] w-[300px] cursor-pointer rounded-[0.4rem] object-cover transition-opacity hover:opacity-90" @click="openImagePreview(attachment)" />
                </div>
                <!-- Regular File Card -->
                <div v-else class="attachmentWrapper border-borderColor flex h-[4rem] w-[20rem] cursor-pointer gap-[10px] rounded-[0.4rem] border p-[0.5rem] transition-colors hover:bg-gray-100 bg-white/5 dark:bg-neutral-800/50 dark:hover:bg-neutral-700/50" @click="openFilePreview(attachment)">
                    <div class="attachmentIcon bg-logoColor flex h-[3rem] w-[3rem] flex-shrink-0 items-center justify-center rounded-[0.4rem]">
                        <div class="icon materialSymbolsOutlined text-white text-[20px]">description</div>
                    </div>
                    <div class="attachmentDescription flex min-w-0 flex-1 flex-col justify-center gap-[2px]">
                        <Tooltip :text="attachment.fileName" class="inline-block">
                            <a class="inline-block max-w-[200px] truncate text-sm font-medium">{{ trimTitle(attachment.fileName) }}</a>
                        </Tooltip>
                        <a class="text-xs text-gray-500">{{ convertMimeTypeToType(attachment.fileType) }}</a>
                    </div>
                </div>
            </template>
        </div>
        <div class="message group text-textColor relative flex items-start py-2" :class="isSelf ? 'flex-row-reverse' : 'flex-row'">
            <!-- User Info (Avatar + Name) -->

            <div v-if="message.author.role === 'user'" :class="isSelf ? 'ml-2' : 'mr-2'" class="flex size-9 items-center justify-center overflow-hidden rounded-full">
                <img v-if="props.profilePicture" class="avatar size-full object-cover" :src="props.profilePicture" alt="User Avatar" />
                <InitialAvatar v-else :name="props.message.author.name" size="24" />
            </div>

            <!-- Message Content -->
            <div class="flex w-full flex-col">
                <!-- Tool Calls -->
                <div v-if="message.content.toolCalls && message.content.toolCalls.length > 0" class="toolCalls mb-2 ml-4 flex flex-col gap-[0.5rem]">
                    <div class="headerSection flex flex-row gap-[1rem]">
                        <div class="toolTitle flex gap-[0.5rem]">
                            <div class="materialSymbolsOutlined">build</div>
                            Tool Calls
                        </div>
                    </div>

                    <div class="flex flex-row items-start gap-2">
                        <div v-for="(tool, idx) in groupedToolCalls" :key="idx" class="toolWrapper border-strokeColor bg-strokeColor flex w-64 flex-none flex-col self-start overflow-hidden rounded-[0.4rem] border">
                            <!-- Header -->
                            <div class="toolHeader flex cursor-pointer items-center justify-between p-2 hover:bg-gray-200" @click="toggleToolCall(tool.id)">
                                <div class="flex items-center gap-2">
                                    <div class="materialSymbolsOutlined">build</div>
                                    <span class="font-semibold">{{ tool.name }}</span>
                                </div>
                                <div class="materialSymbolsOutlined transition-transform" :class="{ 'rotate-180': expandedToolCalls.has(tool.id) }">expand_more</div>
                            </div>

                            <!-- Combined Body -->
                            <div v-if="expandedToolCalls.has(tool.id)" class="toolContent border-strokeColor max-h-72 overflow-y-auto border-t p-2">
                                <div v-if="tool.args">
                                    <div class="mb-1 font-semibold">Arguments</div>
                                    <pre class="whitespace-pre-wrap">{{ JSON.stringify(tool.args, null, 2) }}</pre>
                                </div>
                                <div v-if="tool.res" class="mt-2">
                                    <div class="mb-1 font-semibold">Result</div>
                                    <pre class="whitespace-pre-wrap">{{ JSON.stringify(tool.res, null, 2) }}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Message Content -->
                <div
                    class="relative"
                    :class="[
                        message.author.role === 'user' ? ['user mb-2 w-fit max-w-none rounded-xl bg-gray-200 px-4 pt-[0rem] pb-[0rem] lg:max-w-[70%] dark:bg-gray-700', isSelf ? 'ml-auto' : ''] : 'non-user mb-2 max-w-none px-0',
                        message.author.role === 'assistant' && message.content.thinking && Object.keys(message.content.thinking).length > 0 ? 'cursor-pointer transition-colors' : '',
                        isSelf && editingMessageId === messageId ? 'w-full' : '',
                    ]"
                >
                    <!-- Reasoning Animation with button -->
                    <div
                        v-if="message.author.role === 'assistant' && message.content.thinking && !message.content.thinking.isFinished && !showSkeleton"
                        class="after:bg-logoColor relative flex cursor-pointer flex-row gap-[0.5rem] after:absolute after:top-0 after:right-0 after:m-2 after:h-2 after:w-2 after:rounded-full after:content-['']"
                        @click="toggleReasoningPanel(message.messageId, message.content.thinking)"
                    >
                        <div class="reasoningAnimation bold flex gap-[0.5rem] text-xl">
                            <div class="materialSymbolsOutlined">psychology</div>
                            Thinking
                            <ComponentLoading :size="'sm'" />
                        </div>
                    </div>

                    <!-- Assistant (AI) messages => skeleton ↔ streamed content -->
                    <transition v-if="message.author.role === 'assistant'" name="fade-fast" mode="out-in" appear>
                        <!-- SKELETON -->
                        <div v-if="showSkeleton" key="skeleton" class="animate-pulse space-y-2 pb-2 select-none">
                            <div
                                v-for="(line, idx) in skeletonLines"
                                :key="idx"
                                class="rounded"
                                :style="{
                                    width: line.width,
                                    height: line.height,
                                    backgroundColor: `rgba(229,231,235,${line.alpha})`,
                                }"
                            ></div>
                        </div>

                        <!-- REAL STREAMING CONTENT -->
                        <div v-else key="content" class="markdown-body transition-opacity duration-150 ease-in-out">
                            <div v-if="message.content.parts[0] === ''">
                                <div class="flex w-fit items-center justify-start gap-2 rounded-full bg-red-100 px-3 py-1">
                                    <div class="materialSymbolsOutlined text-lg text-red-500">error_outline</div>
                                    <div class="text-xs text-red-500">No Content Was Generated by {{ props.message.metaData.generatedBy }}</div>
                                </div>
                            </div>
                            <div v-for="(token, index) in tokens" :key="index">
                                <div v-if="token.type === 'code'" data-artifact="code">
                                    <CodeBlock :code="revertSanitizedResponseContent(token.text)" :lang="token.lang" />
                                </div>
                                <div v-else data-artifact="text" class="generated-html-container">
                                    <FadeEffect :markdown="token.raw" :renderer="renderer" :defaults="{ ...defaults, gfm: true, breaks: true }" :messageStatus="message.status" />
                                </div>
                            </div>
                        </div>
                    </transition>

                    <!-- User messages => editable content -->
                    <div v-if="message.author.role === 'user'" v-for="(part, index) in [...new Set(message.content.parts)]" :key="index" class="py-2">
                        <!-- Edit mode -->
                        <div v-if="isSelf && editingMessageId === messageId" class="bg-gray-200 dark:bg-gray-700">
                            <textarea ref="editTextAreaRef" class="editMessageInput textarea h-40 max-h-[250px] w-full resize-none overflow-y-auto" v-model="editingContent" @keyup.enter="messageEditDone"></textarea>
                            <div class="displayFlex flex w-full justify-center gap-3">
                                <div class="saveAndSubmitButton bg-logoColor text-headerTextColor flex w-fit cursor-pointer items-center justify-center rounded-[0.5rem] px-[1rem] py-[0.5rem]" @click="messageEditDone">Send</div>
                                <div class="cancelButton border-logoColor text-textColor flex w-fit cursor-pointer items-center justify-center rounded-[0.5rem] border px-[1rem] py-[0.5rem] dark:border-white" @click="cancelEdit">Cancel</div>
                            </div>
                        </div>
                        <!-- Display mode -->
                        <!-- user message -->
                        <div v-else class="group msg-bubble relative">
                            <!-- User message content -->
                            <UserMessage :content="String(part)" />
                        </div>
                    </div>
                </div>

                <!-- Message Options (Edit, Siblings, Regenerate, Copy, etc.) -->
                <div v-if="editingMessageId !== messageId" class="messageOptionsWrapper mt-2 flex flex-row gap-[0.5rem] opacity-0 transition-opacity duration-200 group-hover:opacity-100" :class="{ '-mr-5 ml-auto': isSelf }">
                    <!-- Assistant message options -->
                    <div v-if="message.author.role === 'assistant' && !showSkeleton" class="messageOptions ml-4 flex items-center gap-[0.5rem]">
                        <!-- Regenerate -->
                        <div v-if="lastMessage" class="materialSymbolsOutlined icons cursor-pointer text-[1.2rem] leading-[1rem] transition-colors hover:text-mozart-blue-500" @click="regenerateResponse">restart_alt</div>

                        <!-- Copy -->
                        <div class="materialSymbolsOutlined icons cursor-pointer text-[1.2rem] leading-[1rem] transition-colors hover:text-mozart-blue-500" @click="copyContent(props.message, $event)">content_copy</div>

                        <!-- Show model name (admin only) -->
                        <div v-if="showGeneratedBy" class="ai-model text-logoColor">
                            {{ props.message.metaData.generatedBy }}
                        </div>
                        <!-- Show collection (admin only) -->
                        <div v-if="userStore.isAdmin && message.metaData && message.metaData.collection" class="ai-model text-logoColor">(Collection: {{ getCollectionAlias(message.metaData.collection) }})</div>

                        <!-- Token usage (admin only) -->
                        <div class="tokenUsage">
                            <div v-if="userStore.settings.showTokenUsage && message.metaData && message.metaData.tokenUsage">
                                <a>{{ message.metaData.tokenUsage.promptTokens }}</a>
                                +
                                <a>{{ message.metaData.tokenUsage.responseToken }}</a>
                                =
                                <a>{{ message.metaData.tokenUsage.totalTokens }}</a>
                            </div>
                        </div>
                    </div>
                    <!-- Combined Siblings + Edit + Share buttons -->
                    <div v-if="editingMessageId !== messageId && isSelf" class="messageOptions mr-4 flex items-center gap-[0.75rem]">
                        <!-- Sibling messages (previous/next) -->
                        <div v-if="message.siblings && message.siblings.length > 1" class="mt-0 flex h-[1.75rem] items-center gap-[0.25rem]">
                            <VTooltip placement="top" :distance="8">
                                <div class="materialSymbolsOutlined icons cursor-pointer text-[1.4rem] leading-[1rem] transition-colors hover:text-mozart-blue-500" :class="{ 'text-strokeColor': messageStore.isProcessing }" @click="switchMessage('previous')" aria-label="Previous message">chevron_left</div>
                                <template #popper>Previous Message</template>
                            </VTooltip>
                            <div class="siblingsText text-[1.1rem] leading-none">
                                {{ currentMessageIndex + "/" + message.siblings.length }}
                            </div>
                            <VTooltip placement="top" :distance="8">
                                <div class="materialSymbolsOutlined icons cursor-pointer text-[1.4rem] leading-[1rem] transition-colors hover:text-mozart-blue-500" :class="{ 'text-strokeColor': messageStore.isProcessing }" @click="switchMessage('next')" aria-label="Next message">chevron_right</div>
                                <template #popper>Next Message</template>
                            </VTooltip>
                        </div>

                        <!-- Edit with Tooltip -->
                        <VTooltip placement="top" :distance="8">
                            <div @click="() => editMessage(messageId, message.content.parts.join(' '))" class="materialSymbolsOutlined icons cursor-pointer text-[1.2rem] leading-[1rem] transition-colors hover:text-mozart-blue-500" aria-label="Edit message">edit</div>
                            <template #popper>Edit Message</template>
                        </VTooltip>

                        <!-- Share with Tooltip -->
                        <VTooltip placement="top" :distance="8">
                            <div @click.stop="shareConversation" class="materialSymbolsOutlined icons cursor-pointer text-[1.2rem] leading-[1rem] transition-colors hover:text-mozart-blue-500" aria-label="Share message">ios_share</div>
                            <template #popper>Share Message</template>
                        </VTooltip>
                    </div>
                </div>

                <!-- RAG Sources -->
                <div v-if="message.metaData && message.metaData.rag_sources && message.metaData.rag_sources.length > 0" class="sourceAttachments ml-4 flex flex-col gap-[0.5rem]">
                    <div class="headerSection flex flex-row gap-[1rem]">
                        <div class="sourceTitle flex gap-[0.5rem]">
                            <div class="materialSymbolsOutlined">stacks</div>
                            Sources
                        </div>
                        <div v-if="userStore.isAdmin" class="sourceTitle vectorTitle flex cursor-pointer gap-[0.5rem]" @click="openRagComposeVectorList">
                            <div class="materialSymbolsOutlined">dns</div>
                            Vectors
                        </div>
                        <div v-if="userStore.isAdmin" class="sourceTitle vectorTitle flex cursor-pointer gap-[0.5rem]">
                            <Switch :size="'sm'" v-model="ragStore.isBetaEnabled" :tooltip="'Enable vector view'" />
                            Vector Metadata
                        </div>
                    </div>

                    <RAGComposeVectorList v-if="showRagComposeVectorList" :show="showRagComposeVectorList" @update:show="showRagComposeVectorList = $event" :sources="message.metaData.rag_sources" />
                    <RAGComposeVectorSearchPopup v-if="showRagComposeVectorSearchPopup" :show="showRagComposeVectorSearchPopup" :source="selectedSource" @update:show="showRagComposeVectorSearchPopup = $event" />

                    <div class="grid">
                        <div v-for="(source, index) in getSources(message.metaData.rag_sources, message.content.parts[0])" :key="index" class="border-strokeColor bg-strokeColor flex max-w-48 cursor-pointer flex-row gap-[10px] rounded-[0.4rem] border p-[0.5rem]" @click="openSource(source)">
                            <div class="attachmentDescription flex flex-col gap-[5px]" :title="source.query ? 'Query used: ' + source.query : ''">
                                <a class="sourceHyperlink text-textColor no-underline" href="#"> [{{ source.citeIndex }}] {{ trimTitle(source.title) }} </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ShareConversationPopup :show="showSharePopup" @update:show="handleUpdateShow" :module="'conversation'" />
        </div>
        <ImagePreviewModal v-model:show="showImagePreview" :image-url="selectedImage.url" :image-alt="selectedImage.alt" />
        <PDFPreviewModal v-model:show="showPDFPreview" :pdf-url="selectedFile.url" :file-name="selectedFile.fileName" />
        <!-- Place RAG viewer outside of RAG Sources v-if so it mounts regardless of sources presence -->
        <RAGComposeViewerPopup v-if="showRagViewerPopup" :show="showRagViewerPopup" :source="selectedDoc" @update:show="showRagViewerPopup = $event" />
    </div>
</template>

<script setup lang="ts">
    import { marked } from "marked"
    import DOMPurify from "dompurify"
    import { ref, computed, watch, onMounted, nextTick } from "vue"
    import type { PropType } from "vue"
    import { revertSanitizedResponseContent, sanitizeResponseContent, trimTitle } from "../../../util/index"
    import { convertMimeTypeToType } from "~/util"
    import type { IMessage } from "~/types/store"
    import Tooltip from "~/components/common/Tooltip.vue"
    import ImagePreviewModal from "./ImagePreviewModal.vue"
    import PDFPreviewModal from "./PDFPreviewModal.vue"
    import UserMessage from "./UserMessage.vue"

    const props = defineProps({
        message: {
            type: Object as PropType<IMessage>,
            required: true,
        },
        messageId: {
            type: String,
            required: true,
        },
        lastMessage: Boolean,
        profilePicture: String,
        hideReasoning: {
            type: Boolean,
            default: false,
        },
    })

    const emit = defineEmits(["toggleReasoningPanel", "shareMessage", "scrollToBottom"])
    const skeletonLines = ref(buildSkeletonLines())

    const selectedSource = ref({})
    const selectedDoc = ref({})
    const showRagViewerPopup = ref(false)
    const expandedToolCalls = ref<Set<string>>(new Set())

    const userStore = useUserStore()
    const messageStore = useMessageStore()
    const documentStore = useDocumentsStore()
    const abortControllerStore = useAbortControllerStore()
    const ragStore = useRagStore()

    // Determine if the message is from the current user (self)
    const isSelf = computed(() => {
        return props.message.author.role === "user" && props.message.author.name === userStore.firstName
    })

    const completion = useCompletion()
    const { extensions, ...defaults } = marked.getDefaults()

    // Code syntax / inline code customizations
    const showRagComposeVectorSearchPopup = ref(false)
    const showRagComposeVectorList = ref(false)
    const showSharePopup = ref(false)
    const conversationStore = useConversationStore()
    const showSkeleton = ref(messageStore.isProcessing || (props.message.author.role === "assistant" && props.message.status === "in_progress"))
    const renderer = new marked.Renderer()
    renderer.codespan = (code) => {
        // Fix HTML entity encoding
        return `<code>${code.replaceAll("&amp;", "&")}</code>`
    }
    renderer.link = (href, title, text) => {
        /* your existing link override logic here */
        const fileTypeMap: Record<string, string> = {
            pdf: "pdf",
            doc: "doc",
            docx: "docx",
            xls: "xls",
            xlsx: "xlsx",
            csv: "csv",
            ppt: "ppt",
            pptx: "pptx",
            html: "html",
            htm: "htm",
            txt: "txt",
            png: "image",
            jpg: "image",
            jpeg: "image",
        }
        const baseUrl = useUser().getBaseUrl()
        const fileSource = `${baseUrl}/api/v1/document/viewFile?userId=${userStore.userId}&source=`

        const fileName = href.split("/").pop()?.split("#")[0]?.split("?")[0] || ""
        const extension = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() : ""
        const fileType = fileTypeMap[extension || ""] || "unknown"

        const fileObject = {
            fileUrl: fileSource + href,
            fileType: title || fileType,
            fileName: getFileName(fileName),
        }

        if (text.startsWith("CITE_")) {
            return `<a href="#" class="cite-link" data-file-object='${encodeURIComponent(JSON.stringify(fileObject))}'>${text.replace("CITE_", "")}</a>`
        } else if (text.startsWith("WEB_")) {
            return `<a href="${href}" target="_blank" class="inline-flex items-center gap-1 rounded-xl bg-logoColor px-1.5 py-0.5 text-[0.5rem] font-medium text-white hover:bg-logoColor hover:text-white transition-colors duration-200 border border-primary hover:border-primary/40">
                ${text.replace("WEB_", "")}
            </a>`
        }

        return `<a href="${href}" class="dynamic-link" target="_blank">${text}</a>`
    }

    // Tokenized message content
    const tokens = computed(() => marked.lexer(props.message.content.parts.join("")))

    // Show model name if user is admin and message has metaData.generatedBy
    const showGeneratedBy = computed(() => {
        return userStore.isAdmin && props.message.metaData && props.message.metaData.generatedBy
    })

    // Local state for message editing
    const editingMessageId = ref<string | null>(null)
    const editingContent = ref<string>("")
    const editTextAreaRef = ref<Array<HTMLTextAreaElement | null>>([])

    const currentMessageIndex = ref<number>(1)
    const copied = ref(false)

    // Add these refs for the image preview modal
    const showImagePreview = ref(false)
    const selectedImage = ref({
        url: "",
        alt: "",
    })

    // Add these refs with the other refs
    const showPDFPreview = ref(false)
    const selectedFile = ref({
        url: "",
        fileName: "",
    })

    const toggleToolCall = (toolCallId: string) => {
        if (expandedToolCalls.value.has(toolCallId)) {
            expandedToolCalls.value.delete(toolCallId)
        } else {
            expandedToolCalls.value.add(toolCallId)
        }
    }

    const groupedToolCalls = computed(() => {
        const map: Record<string, { name: string; id: string; args?: any; res?: any }> = {}

        props.message.content.toolCalls?.forEach((tc: any, idx: number) => {
            // assume each toolCall already has a unique `id` field; if not, synthesize one:
            const key = tc.id ?? `${props.message.messageId}-${tc.name}-${idx}`

            if (!map[key]) map[key] = { name: tc.name, id: key }
            if (tc.type === "tool_call") map[key].args = tc.arguments
            if (tc.type === "tool_result") map[key].res = tc.arguments
        })

        return Object.values(map)
    })

    /* ------------------------------------------------------------------
Methods
------------------------------------------------------------------*/
    const editMessage = async (messageId: string, content: string) => {
        editingMessageId.value = messageId
        editingContent.value = content
        console.log("editingContent-1", editingContent.value)
        await nextTick()
        if (editTextAreaRef.value[0]) {
            editTextAreaRef.value[0].focus()
        }
    }

    const cancelEdit = () => {
        editingMessageId.value = null
        editingContent.value = ""
    }

    const messageEditDone = async () => {
        if (!editingContent.value.trim()) return console.log("Empty message")
        showSkeleton.value = true
        editingMessageId.value = null
        abortControllerStore.abortCurrentController()
        abortControllerStore.createNewController()
        const documents = props?.message?.metaData?.documents || []
        await completion.completions(editingContent.value, documentStore.documentId, props.message.parentId, documents)
        editingContent.value = ""
    }

    const switchMessage = (action: "next" | "previous") => {
        if (messageStore.isProcessing) return
        if (props.message.siblings) {
            const index = currentMessageIndex.value + (action === "next" ? 1 : -1)
            const arrayIndex = index - 1
            const fromMessageId = props.message.messageId
            const toMessageId = props.message.siblings[arrayIndex]
            if (!toMessageId) return console.log("No sibling found")
            messageStore.switchMessagesTree(fromMessageId, toMessageId)
            currentMessageIndex.value = index
        }
    }

    const regenerateResponse = async () => {
        showSkeleton.value = true
        abortControllerStore.abortCurrentController()
        abortControllerStore.createNewController()
        await completion.completions("", documentStore.documentId, props.message.parentId, "")
    }

    /** Renders user message parts with sanitization + Markdown */
    const renderedPart = (part: string) => {
        return DOMPurify.sanitize(marked(part, { renderer }) as string, {
            ALLOWED_TAGS: ["ol", "li", "ul", "a", "strong", "em", "p", "h1", "h2", "h3"],
            ALLOWED_ATTR: ["href", "target", "class"],
        })
    }

    /** Copy message content as both plain text and HTML */
    const copyContent = async (message: any, event: MouseEvent) => {
        copied.value = true

        // The clicked icon
        const iconElement = event.target as HTMLElement

        // Convert the message content from Markdown to HTML
        const htmlContent = marked(message.content.parts.join(" "), { renderer }) as string

        // Create a temporary off-screen element
        const tempElement = document.createElement("div")
        tempElement.style.position = "absolute"
        tempElement.style.left = "-9999px"
        tempElement.innerHTML = htmlContent
        document.body.appendChild(tempElement)

        const textToCopy = tempElement.textContent || tempElement.innerText || ""
        const clipboardItem = new ClipboardItem({
            "text/plain": new Blob([textToCopy], { type: "text/plain" }),
            "text/html": new Blob([htmlContent], { type: "text/html" }),
        })

        navigator.clipboard
            .write([clipboardItem])
            .then(() => {
                console.log("Text and HTML copied to clipboard")
                iconElement.innerHTML = "done"
                setTimeout(() => {
                    iconElement.innerHTML = "content_copy"
                }, 3000)
            })
            .catch((err) => {
                console.error("Failed to copy text and HTML:", err)
            })

        document.body.removeChild(tempElement)
    }

    /** Filter RAG sources to only those cited in text */
    function getSources(sources: any[], text: string) {
        sources = assignCiteIndexIfMissing(sources)
        const relativeCitations: { url: string; citeIndex: string; paragraph: string }[] = []
        const uniqueKeys = new Set<string>()

        function makeKey(url: string, paragraph: string) {
            return normalizeUrl(url) + "::" + (paragraph || "")
        }

        // Capture [CITE_xxx.yyy](url) references
        const citationRegex = /\[CITE_(\d+)\.(\d+)\]\((https?:\/\/[^\)]+)\)/g
        let match
        while ((match = citationRegex.exec(text)) !== null) {
            const citeIndex = match[1]
            const originalUrl = match[3]
            const key = makeKey(originalUrl, "")
            if (!uniqueKeys.has(key)) {
                relativeCitations.push({ citeIndex, url: originalUrl, paragraph: "" })
                uniqueKeys.add(key)
            }
        }

        // Also incorporate citations from the sources array
        for (const source of sources) {
            if (source.citeIndex && source.url) {
                const key = makeKey(source.url, source.paragraph)
                const alreadyExists = relativeCitations.some((c) => makeKey(c.url, c.paragraph) === key && c.citeIndex === source.citeIndex)
                if (!alreadyExists) {
                    relativeCitations.push({
                        url: source.url,
                        citeIndex: source.citeIndex,
                        paragraph: source.paragraph,
                    })
                    uniqueKeys.add(key)
                }
            }
        }

        // Filter
        const filteredSources = sources.filter((source) => {
            const key = makeKey(source.url, source.paragraph)
            const citation = relativeCitations.find((c) => makeKey(c.url, c.paragraph) === key)
            if (citation) {
                source.citeIndex = citation.citeIndex
                return true
            }
            return false
        })

        // De-duplicate by title
        const uniqueFilteredSources = [...new Map(filteredSources.map((s) => [s.title, s])).values()]
        return uniqueFilteredSources
    }

    /** Auto-resize the textarea as the user types */
    const adjustTextareaHeight = () => {
        if (editTextAreaRef.value[0]) {
            editTextAreaRef.value[0].style.height = "auto"
            editTextAreaRef.value[0].style.height = `${editTextAreaRef.value[0].scrollHeight}px`
        }
    }
    /** If sources have no citeIndex, assign them one in ascending order */
    function assignCiteIndexIfMissing(sources: any[]) {
        const titleToCiteIndex = new Map<string, number>()
        // Pass 1: record existing citeIndex
        for (const source of sources) {
            if (source.citeIndex && !titleToCiteIndex.has(source.title)) {
                titleToCiteIndex.set(source.title, parseInt(source.citeIndex, 10))
            }
        }
        // Max so far
        let maxCiteIndex = Math.max(0, ...titleToCiteIndex.values())

        // Pass 2: assign where missing
        for (const source of sources) {
            if (!titleToCiteIndex.has(source.title)) {
                maxCiteIndex++
                titleToCiteIndex.set(source.title, maxCiteIndex)
            }
        }
        // Pass 3: update each source
        return sources.map((source) => {
            source.url = source.url.split("#page=")[0]
            source.citeIndex = titleToCiteIndex.get(source.title)?.toString() || ""
            return source
        })
    }

    function normalizeUrl(url: string) {
        return url.split("#page=")[0]
    }

    /** Show doc in popup (Beta => Vector search; otherwise => direct viewer) */
    function openSource(source: any) {
        if (ragStore.isBetaEnabled) {
            selectedSource.value = source
            showRagComposeVectorSearchPopup.value = true
        } else {
            let fileType = source.title
            const fileUrl = `${useUser().getBaseUrl()}/api/v1/document/viewFile?source=${source.url}`
            console.error(fileUrl)
            let fileName = source.title

            if (source.title.includes(".")) fileType = source.title.split(".").pop().toLowerCase()
            else {
                fileType = source.url.split("#")[0].split(".").pop().toLowerCase()
                fileName = `${source.title}.${fileType}`
            }
            openDoc({ fileType, fileUrl, fileName })
        }
    }

    /** Generate a cleaned-up file name from the raw string */
    function getFileName(fileString: string) {
        const parts = fileString.split(".")
        const extension = parts.pop() || ""
        let fileName = parts.join(".")

        fileName = fileName
            .replace(/DOC_[a-f0-9-]+/, "")
            .replace(/[-_][a-f0-9-]{36}/, "")
            .replace(/[-_]\d{4}$/, "")
            .replace(/[-_]+/g, " ")
            .trim()

        return fileName ? `${fileName}.${extension}` : `file.${extension}`
    }

    /** Open doc in viewer popup */
    function openDoc(source: any) {
        selectedDoc.value = source
        showRagViewerPopup.value = true
    }

    /** Show vector list */
    function openRagComposeVectorList() {
        showRagComposeVectorList.value = true
    }

    /** Toggle reasoning panel */
    function toggleReasoningPanel(messageId: string, thinking: any) {
        emit("toggleReasoningPanel", messageId, thinking)
    }

    /** Show custom alias if found */
    function getCollectionAlias(collectionName: string) {
        const collection = ragStore.collections.find((c: any) => c.name === collectionName)
        return collection ? collection.alias : collectionName
    }

    const shareConversation = async () => {
        console.log(conversationStore.conversationId)
        showSharePopup.value = !showSharePopup.value
        useConversation().getCollaborators(conversationStore.conversationId)
    }

    function handleUpdateShow(value: boolean) {
        if (!value) {
            showSharePopup.value = false
        }
    }

    function buildSkeletonLines() {
        const len = 15
        return Array.from({ length: len }, () => {
            const w = Math.floor(Math.random() * 70) + 30
            const height = Math.random() < 0.2 ? "0.7rem" : "1.25rem"
            const alpha = [1, 0.9, 0.8, 0.7][Math.floor(Math.random() * 4)]
            return { width: `${w}%`, height, alpha }
        })
    }

    /** On change of tokens, re-attach link click handlers */
    watch(tokens, async () => {
        await nextTick()
        attachClickHandlers()
    })

    watch(tokens, (newTokens) => {
        if (newTokens.length > 0) showSkeleton.value = false
    })

    watch(editingContent, () => {
        nextTick(() => {
            adjustTextareaHeight()
        })
    })

    // watch([showRagViewerPopup, selectedDoc], ([newPopup, newDoc], [oldPopup, oldDoc]) => {
    //     console.log("newPopup", newPopup, "oldPopup", oldPopup)
    //     console.log("newDoc", newDoc, "oldDoc", oldDoc)
    // })

    watch(
        () => props.message,
        () => {
            currentMessageIndex.value = !props.message.siblings ? 0 : props.message.siblings.findIndex((s: string) => s === props.message.messageId) + 1
        }
    )

    /** Attach link handlers for dynamic and cite links after DOM is updated */
    // Alternative approach using event delegation
    function attachClickHandlers() {
        console.log("attachClickHandlers")

        // Attach delegated click handlers to all message containers once
        const containers = document.querySelectorAll(".generated-html-container")
        containers.forEach((container) => {
            const el = container as HTMLElement & { dataset: { clickHandlersBound?: string } }

            // Avoid attaching multiple handlers on re-renders
            if (el.dataset.clickHandlersBound === "true") return
            el.dataset.clickHandlersBound = "true"

            el.addEventListener("click", (event) => {
                const target = event.target as HTMLElement

                // --- Handle cite links (support nested elements) ---
                const citeAnchor = target.closest(".cite-link") as HTMLElement | null
                if (citeAnchor) {
                    event.preventDefault()
                    event.stopPropagation()

                    const data = citeAnchor.getAttribute("data-file-object")
                    if (data) {
                        const fileObject = JSON.parse(decodeURIComponent(data))
                        console.log("Opening cite file:", fileObject)
                        openDoc(fileObject)
                    }
                    return
                }

                // --- Handle dynamic links (support nested elements) ---
                const dynAnchor = target.closest(".dynamic-link") as HTMLElement | null
                if (dynAnchor) {
                    const data = dynAnchor.getAttribute("data-file-object")
                    if (data) {
                        event.preventDefault()
                        event.stopPropagation()
                        const fileObject = JSON.parse(decodeURIComponent(data))
                        console.log("Opening dynamic file:", fileObject)
                        openDoc(fileObject)
                    }
                    // If no data-file-object, allow default behavior (open in new tab)
                    return
                }

                // If needed, other link types can be handled here later
            })
        })
    }

    // --- Helpers to strip background styles/classes from pasted HTML ---
    function stripBackgroundFromFragment(root: HTMLElement) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null)
        const toClean: HTMLElement[] = []
        do {
            const el = walker.currentNode as HTMLElement
            if (!el) continue
            // Remove inline background styles
            if (el.hasAttribute("style")) {
                const style = el.getAttribute("style") || ""
                if (/background(-color)?\s*:|background\s*:/.test(style)) {
                    // Remove only background-related declarations
                    const cleaned = style
                        .split(";")
                        .map((s) => s.trim())
                        .filter((s) => s && !/^background(-color)?\s*:/.test(s))
                        .join("; ")
                    if (cleaned) el.setAttribute("style", cleaned)
                    else el.removeAttribute("style")
                }
            }
            // Remove Tailwind bg-* classes (including dark:bg-*)
            if (el.classList && el.classList.length) {
                const toRemove: string[] = []
                el.classList.forEach((cls) => {
                    if (/^(dark:)?bg-/.test(cls)) toRemove.push(cls)
                })
                toRemove.forEach((c) => el.classList.remove(c))
            }
        } while (walker.nextNode())
    }

    function selectionWithinCode(selection: Selection | null): boolean {
        if (!selection || selection.rangeCount === 0) return false
        const range = selection.getRangeAt(0)
        const start = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement
        const end = range.endContainer instanceof Element ? range.endContainer : range.endContainer.parentElement
        const isCodeSide = (el: Element | null) => !!el && !!el.closest('[data-artifact="code"], pre, code, .cm-editor, .codeBlock')
        return isCodeSide(start) || isCodeSide(end)
    }

    function selectionWithinTextArtifact(selection: Selection | null): boolean {
        if (!selection || selection.rangeCount === 0) return false
        const container = selection.anchorNode instanceof Element ? selection.anchorNode : selection.anchorNode?.parentElement
        return !!container?.closest('[data-artifact="text"]')
    }

    function getSanitizedSelectionHTML(): { html: string; text: string } | null {
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) return null
        const range = sel.getRangeAt(0).cloneRange()

        // Clone DOM contents of selection
        const div = document.createElement("div")
        div.appendChild(range.cloneContents())

        // Remove background-only styling
        stripBackgroundFromFragment(div)

        // Use DOMPurify to drop any stray style attrs entirely (belt & suspenders)
        const cleanedHTML = DOMPurify.sanitize(div.innerHTML, {
            ALLOWED_ATTR: ["href", "target", "class"], // no 'style'
        })

        // Text version
        const text = (div.textContent || "").trim()

        return { html: cleanedHTML, text }
    }

    // Create a custom event for message selection
    const emitMessageSelected = () => {
        if (props.message.author.role === "assistant" && props.message.content.thinking && Object.keys(props.message.content.thinking).length > 0) {
            const event = new CustomEvent("message-selected", {
                detail: props.message,
                bubbles: true,
            })
            window.dispatchEvent(event)
        }
    }

    /** Check if the file type is an image */
    const isImageType = (fileType: string) => {
        const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
        console.log("fileType", fileType, imageTypes.includes(fileType.toLowerCase()))

        return imageTypes.includes(fileType.toLowerCase())
    }

    // Add this method to handle image click
    const openImagePreview = (attachment: any) => {
        selectedImage.value = {
            url: attachment.url,
            alt: attachment.fileName,
        }
        showImagePreview.value = true
    }

    // Add this method with other methods
    const openFilePreview = (attachment: any) => {
        if (attachment.fileType.toLowerCase().includes("pdf")) {
            selectedFile.value = {
                url: attachment.url,
                fileName: attachment.fileName,
            }
            showPDFPreview.value = true
        } else {
            // Handle other file types or open in new tab
            window.open(attachment.url, "_blank")
        }
    }

    // Lifecycle hooks
    onMounted(() => {
        // Initialize current message index
        currentMessageIndex.value = !props.message.siblings ? 0 : props.message.siblings.findIndex((s: string) => s === props.message.messageId) + 1

        // Attach click handlers
        const onNativeCopy = (e: ClipboardEvent) => {
            // Only intervene if selection is inside a *text* artifact, not code
            const sel = window.getSelection()
            if (!sel || sel.isCollapsed) return
            if (!selectionWithinTextArtifact(sel)) return // do nothing if not in text artifact
            if (selectionWithinCode(sel)) return // let code artifacts copy as-is

            const cleaned = getSanitizedSelectionHTML()
            if (!cleaned) return

            e.preventDefault()
            try {
                e.clipboardData?.setData("text/html", cleaned.html)
                e.clipboardData?.setData("text/plain", cleaned.text)
            } catch {
                // Fallback: do nothing and let the browser handle it
            }
        }

        // capture on document so it works even if containers re-render
        document.addEventListener("copy", onNativeCopy, true)
        // store / clean up
        ;(window as any).__onNativeCopyHandler = onNativeCopy

        if (props.lastMessage) {
            emit("scrollToBottom", true)
        }
    })

    onUnmounted(() => {
        const handler = (window as any).__onNativeCopyHandler
        if (handler) document.removeEventListener("copy", handler, true)
    })
</script>

<style scoped>
    .has-reasoning {
        position: relative;
    }

    .has-reasoning:after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--logo-color);
        margin: 8px;
    }

    .reasoning-indicator {
        position: absolute;
        top: 4px;
        right: 4px;
        color: var(--logo-color);
    }

    .fade-fast-enter-active,
    .fade-fast-leave-active {
        transition: opacity 150ms ease;
    }

    .fade-fast-enter-from,
    .fade-fast-leave-to {
        opacity: 0;
    }

    .fade-fast-appear-active {
        transition: none;
    }

    .fade-fast-appear-from {
        opacity: 1;
    }
</style>
