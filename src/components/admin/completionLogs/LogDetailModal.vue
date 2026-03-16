<template>
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="$emit('close')">
        <div class="bg-white dark:bg-zinc-900 border-border m-4 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border shadow-2xl">
            <!-- Header -->
            <div class="border-border bg-gradient-to-r from-gray-50 to-white dark:from-zinc-800 dark:to-zinc-900 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                        <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-gray-900 dark:text-gray-100 text-lg font-bold">Log Details</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-xs">{{ formatDate(log.created_at) }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <StatusBadge :status="log.status" />
                    <button @click="$emit('close')" class="cursor-pointer text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 transition-colors">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Body -->
            <div class="max-h-[calc(90vh-140px)] overflow-y-auto p-6 bg-gray-50 dark:bg-zinc-950">
                <!-- Identifiers -->
                <Section title="Identifiers" icon="id">
                    <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <InfoRow label="ID" :value="log.id" copyable />
                        <InfoRow label="Request ID" :value="log.request_id" copyable />
                        <InfoRow label="Conversation ID" :value="log.conversation_id" copyable />
                        <InfoRow label="Message ID" :value="log.message_id" copyable />
                        <InfoRow label="User ID" :value="log.user_id" copyable />
                        <InfoRow label="Organization" :value="log.organization_id || ''" />
                    </div>
                </Section>

                <!-- Model Info -->
                <Section title="Model Info" icon="model">
                    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div class="rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4">
                            <div class="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Provider</div>
                            <div class="text-gray-900 dark:text-gray-100 text-sm font-semibold">{{ log.model.provider }}</div>
                        </div>
                        <div class="rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4">
                            <div class="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Model</div>
                            <div class="text-gray-900 dark:text-gray-100 text-sm font-semibold">{{ log.model.name }}</div>
                        </div>
                        <div class="rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4">
                            <div class="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Writing Style</div>
                            <div class="text-gray-900 dark:text-gray-100 text-sm font-semibold capitalize">{{ log.model.writing_style || 'Default' }}</div>
                        </div>
                        <div class="rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4">
                            <div class="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Thinking</div>
                            <div class="flex items-center gap-1.5">
                                <span :class="log.model.is_thinking_supported ? 'bg-emerald-500' : 'bg-gray-400'" class="h-2 w-2 rounded-full"></span>
                                <span class="text-gray-900 dark:text-gray-100 text-sm font-semibold">{{ log.model.is_thinking_supported ? 'Supported' : 'Not supported' }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4">
                        <div class="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">System Prompt</div>
                        <div class="text-gray-900 dark:text-gray-100 text-sm font-mono">{{ log.model.system_prompt || 'None' }}</div>
                    </div>
                </Section>

                <!-- Token Usage -->
                <Section title="Token Usage" icon="tokens">
                    <div class="grid grid-cols-3 gap-4">
                        <div class="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg">
                            <div class="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10"></div>
                            <div class="relative">
                                <div class="text-blue-100 text-xs font-medium uppercase tracking-wide">Prompt</div>
                                <div class="mt-1 text-2xl font-bold">{{ log.token_usage.prompt_tokens.toLocaleString() }}</div>
                            </div>
                        </div>
                        <div class="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-lg">
                            <div class="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10"></div>
                            <div class="relative">
                                <div class="text-emerald-100 text-xs font-medium uppercase tracking-wide">Response</div>
                                <div class="mt-1 text-2xl font-bold">{{ log.token_usage.response_tokens.toLocaleString() }}</div>
                            </div>
                        </div>
                        <div class="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 text-white shadow-lg">
                            <div class="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10"></div>
                            <div class="relative">
                                <div class="text-purple-100 text-xs font-medium uppercase tracking-wide">Total</div>
                                <div class="mt-1 text-2xl font-bold">{{ log.token_usage.total_tokens.toLocaleString() }}</div>
                            </div>
                        </div>
                    </div>
                </Section>

                <!-- MCP & RAG -->
                <Section title="MCP & RAG" icon="mcp">
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <!-- MCP Card -->
                        <div class="rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden">
                            <div class="p-4">
                                <div class="flex items-center justify-between mb-3">
                                    <span class="text-gray-900 dark:text-gray-100 text-sm font-semibold">MCP</span>
                                    <span :class="log.mcp.enabled ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'" class="text-xs px-2.5 py-1 rounded-full font-medium">
                                        {{ log.mcp.enabled ? 'Enabled' : 'Disabled' }}
                                    </span>
                                </div>
                                <div v-if="log.mcp.enabled && log.mcp.tool_choice" class="text-gray-500 dark:text-gray-400 text-xs mb-2">
                                    Tool choice: <span class="font-medium text-gray-700 dark:text-gray-300">{{ log.mcp.tool_choice }}</span>
                                </div>
                                <div v-if="log.mcp.enabled && log.mcp.tool_calls && log.mcp.tool_calls.length > 0">
                                    <button
                                        @click="toggleMcpToolsSection"
                                        class="cursor-pointer flex items-center justify-between w-full text-left"
                                    >
                                        <div class="flex items-center gap-2">
                                            <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                                            </svg>
                                            <span class="text-gray-600 dark:text-gray-300 text-sm">{{ log.mcp.tool_calls.length }} tool call{{ log.mcp.tool_calls.length > 1 ? 's' : '' }}</span>
                                        </div>
                                        <svg
                                            class="h-4 w-4 text-gray-400 transition-transform duration-200"
                                            :class="{ 'rotate-180': isMcpToolsExpanded }"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                                        >
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                <div v-else-if="log.mcp.enabled" class="text-gray-500 dark:text-gray-400 text-xs">No tool calls</div>
                            </div>

                            <!-- Tool Calls List (Expandable) -->
                            <div v-if="log.mcp.enabled && log.mcp.tool_calls && log.mcp.tool_calls.length > 0" v-show="isMcpToolsExpanded" class="border-t border-gray-200 dark:border-zinc-800">
                                <div v-for="(tool, index) in log.mcp.tool_calls" :key="tool.id + '-' + index" class="border-b border-gray-100 dark:border-zinc-800 last:border-b-0">
                                    <!-- Tool Call Row -->
                                    <button
                                        @click="toggleToolCall(index)"
                                        class="cursor-pointer w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors"
                                    >
                                        <div class="flex items-center gap-3 min-w-0">
                                            <div :class="tool.type === 'tool_call' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-cyan-50 dark:bg-cyan-900/20'" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                                                <svg v-if="tool.type === 'tool_call'" class="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                <svg v-else class="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div class="text-left min-w-0">
                                                <div class="flex items-center gap-2">
                                                    <span class="text-gray-900 dark:text-gray-100 text-sm font-medium">{{ tool.name }}</span>
                                                    <span :class="tool.type === 'tool_call' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300'" class="text-xs px-1.5 py-0.5 rounded font-medium">
                                                        {{ tool.type === 'tool_call' ? 'Call' : 'Result' }}
                                                    </span>
                                                </div>
                                                <div class="text-gray-500 dark:text-gray-400 text-xs">{{ formatTimestamp(tool.timestamp) }}</div>
                                            </div>
                                        </div>
                                        <svg
                                            class="h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200"
                                            :class="{ 'rotate-180': expandedToolCalls.has(index) }"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                                        >
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    <!-- Tool Call Details (Expandable) -->
                                    <div v-show="expandedToolCalls.has(index)" class="px-4 pb-3 bg-gray-50 dark:bg-zinc-800/20">
                                        <div class="space-y-2 pt-2">
                                            <!-- Tool ID -->
                                            <div class="flex items-center justify-between gap-2 rounded-lg bg-white dark:bg-zinc-900 px-3 py-2">
                                                <span class="text-gray-500 dark:text-gray-400 text-xs font-medium shrink-0">Tool ID</span>
                                                <div class="flex items-center gap-2 min-w-0">
                                                    <span class="text-gray-900 dark:text-gray-100 text-xs font-mono truncate">{{ tool.id }}</span>
                                                    <button @click.stop="copyToClipboard(tool.id)" class="cursor-pointer shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <!-- Truncated indicator -->
                                            <div v-if="tool.truncated" class="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
                                                <svg class="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <span class="text-amber-700 dark:text-amber-300 text-xs font-medium">Arguments truncated</span>
                                            </div>
                                            <!-- Arguments -->
                                            <div class="rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
                                                <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-zinc-800">
                                                    <span class="text-gray-500 dark:text-gray-400 text-xs font-medium">Arguments</span>
                                                    <button @click.stop="copyToClipboard(JSON.stringify(tool.arguments, null, 2))" class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <pre class="text-gray-900 dark:text-gray-100 text-xs font-mono p-3 overflow-auto max-h-40 whitespace-pre-wrap">{{ JSON.stringify(tool.arguments, null, 2) }}</pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- RAG Card -->
                        <div class="rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-gray-900 dark:text-gray-100 text-sm font-semibold">RAG</span>
                                <span :class="log.rag.enabled ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'" class="text-xs px-2.5 py-1 rounded-full font-medium">
                                    {{ log.rag.enabled ? 'Enabled' : 'Disabled' }}
                                </span>
                            </div>
                            <div v-if="log.rag.enabled && log.rag.collection" class="flex items-center gap-2">
                                <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                                </svg>
                                <span class="text-gray-600 dark:text-gray-300 text-sm font-mono">{{ log.rag.collection }}</span>
                            </div>
                            <div v-else-if="log.rag.enabled" class="text-gray-500 dark:text-gray-400 text-xs">No collection specified</div>
                        </div>
                    </div>
                </Section>

                <!-- Documents -->
                <Section v-if="log.documents && log.documents.length > 0" title="Documents" icon="documents">
                    <div class="rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden">
                        <!-- Header - Clickable to expand/collapse -->
                        <button
                            @click="toggleDocumentsSection"
                            class="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                            <div class="flex items-center gap-3">
                                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800">
                                    <svg class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                </div>
                                <div class="text-left">
                                    <div class="text-gray-900 dark:text-gray-100 text-sm font-semibold">{{ log.documents.length }} document{{ log.documents.length > 1 ? 's' : '' }} attached</div>
                                    <div class="text-gray-500 dark:text-gray-400 text-xs">Context documents used for this completion</div>
                                </div>
                            </div>
                            <svg
                                class="h-5 w-5 text-gray-400 transition-transform duration-200"
                                :class="{ 'rotate-180': isDocumentsExpanded }"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <!-- Documents List (Expandable) -->
                        <div v-show="isDocumentsExpanded" class="border-t border-gray-200 dark:border-zinc-800">
                            <div v-for="(doc, index) in log.documents" :key="doc.document_id || index" class="border-b border-gray-100 dark:border-zinc-800 last:border-b-0">
                                <!-- Document Row - Clickable to expand details -->
                                <button
                                    @click="toggleDocument(index)"
                                    class="cursor-pointer w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors"
                                >
                                    <div class="flex items-center gap-3 min-w-0">
                                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                            <svg class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div class="text-left min-w-0">
                                            <div class="text-gray-900 dark:text-gray-100 text-sm font-medium truncate">{{ doc.file_name }}</div>
                                            <div class="text-gray-500 dark:text-gray-400 text-xs">{{ formatFileSize(doc.file_size) }} · {{ doc.file_type }}</div>
                                        </div>
                                    </div>
                                    <svg
                                        class="h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200"
                                        :class="{ 'rotate-180': expandedDocuments.has(index) }"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                                    >
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <!-- Document Details (Expandable) -->
                                <div v-show="expandedDocuments.has(index)" class="px-4 pb-3 bg-gray-50 dark:bg-zinc-800/20">
                                    <div class="grid grid-cols-1 gap-2 md:grid-cols-2 pt-2">
                                        <div class="flex items-center justify-between gap-2 rounded-lg bg-white dark:bg-zinc-900 px-3 py-2">
                                            <span class="text-gray-500 dark:text-gray-400 text-xs font-medium shrink-0">Document ID</span>
                                            <div class="flex items-center gap-2 min-w-0">
                                                <span class="text-gray-900 dark:text-gray-100 text-xs font-mono truncate">{{ doc.document_id }}</span>
                                                <button @click.stop="copyToClipboard(doc.document_id)" class="cursor-pointer shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="flex items-center justify-between gap-2 rounded-lg bg-white dark:bg-zinc-900 px-3 py-2">
                                            <span class="text-gray-500 dark:text-gray-400 text-xs font-medium shrink-0">Organization ID</span>
                                            <div class="flex items-center gap-2 min-w-0">
                                                <span class="text-gray-900 dark:text-gray-100 text-xs font-mono truncate">{{ doc.organization_id || '(none)' }}</span>
                                                <button v-if="doc.organization_id" @click.stop="copyToClipboard(doc.organization_id)" class="cursor-pointer shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="flex items-center justify-between gap-2 rounded-lg bg-white dark:bg-zinc-900 px-3 py-2">
                                            <span class="text-gray-500 dark:text-gray-400 text-xs font-medium">Owner</span>
                                            <span class="text-gray-900 dark:text-gray-100 text-xs">{{ doc.owner || '(none)' }}</span>
                                        </div>
                                        <div class="flex items-center justify-between gap-2 rounded-lg bg-white dark:bg-zinc-900 px-3 py-2">
                                            <span class="text-gray-500 dark:text-gray-400 text-xs font-medium">Source</span>
                                            <span class="text-gray-900 dark:text-gray-100 text-xs capitalize">{{ doc.source || '(none)' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                <!-- Prompt -->
                <Section title="Prompt" icon="prompt">
                    <div class="rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden">
                        <div class="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30 px-4 py-2 flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="text-amber-600 dark:text-amber-400 text-xs font-medium">{{ log.prompt.content_type }}</span>
                                <span class="text-gray-400 dark:text-gray-600">|</span>
                                <span class="text-gray-500 dark:text-gray-400 text-xs">{{ log.prompt.original_length }} chars</span>
                                <span v-if="log.prompt.truncated" class="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs px-2 py-0.5 rounded-full font-medium">Truncated</span>
                            </div>
                            <button @click="copyToClipboard(log.prompt.text)" class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title="Copy prompt">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                        <div class="text-gray-900 dark:text-gray-100 max-h-40 overflow-auto p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap">{{ log.prompt.text }}</div>
                    </div>
                </Section>

                <!-- Response -->
                <Section title="Response" icon="response">
                    <div class="rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden">
                        <div class="bg-cyan-50 dark:bg-cyan-900/20 border-b border-cyan-100 dark:border-cyan-900/30 px-4 py-2 flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="text-cyan-600 dark:text-cyan-400 text-xs font-medium">AI Response</span>
                                <span class="text-gray-400 dark:text-gray-600">|</span>
                                <span class="text-gray-500 dark:text-gray-400 text-xs">{{ log.response.text?.length || 0 }} chars</span>
                                <span v-if="log.response.error" class="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs px-2 py-0.5 rounded-full font-medium">Has Error</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <button v-if="log.response.error" @click="isErrorExpanded = !isErrorExpanded" class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" :title="isErrorExpanded ? 'Hide error details' : 'Show error details'">
                                    <svg v-if="!isErrorExpanded" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                </button>
                                <button @click="copyToClipboard(log.response.text)" class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title="Copy response">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="text-gray-900 dark:text-gray-100 max-h-60 overflow-auto p-4 text-sm leading-relaxed whitespace-pre-wrap">{{ log.response.text }}</div>

                        <!-- Error Details (Expandable) -->
                        <div v-if="log.response.error && isErrorExpanded" class="border-t border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
                            <div class="flex items-center justify-between px-4 py-2 border-b border-red-100 dark:border-red-900/20">
                                <div class="flex items-center gap-2">
                                    <svg class="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span class="text-red-600 dark:text-red-400 text-xs font-medium">Error Details</span>
                                </div>
                                <button @click="copyToClipboard(JSON.stringify(log.response.error, null, 2))" class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title="Copy error JSON">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                            <pre class="text-red-800 dark:text-red-200 max-h-60 overflow-auto p-4 text-xs font-mono whitespace-pre-wrap">{{ JSON.stringify(log.response.error, null, 2) }}</pre>
                        </div>

                        <!-- Raw Response (Expandable) -->
                        <div v-if="log.response.raw_response" class="border-t border-gray-200 dark:border-zinc-700">
                            <button
                                @click="isRawResponseExpanded = !isRawResponseExpanded"
                                class="cursor-pointer w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                <div class="flex items-center gap-2">
                                    <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                                    </svg>
                                    <span class="text-gray-600 dark:text-gray-400 text-xs font-medium">Raw Response</span>
                                </div>
                                <svg
                                    class="h-4 w-4 text-gray-400 transition-transform duration-200"
                                    :class="{ 'rotate-180': isRawResponseExpanded }"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div v-show="isRawResponseExpanded" class="border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/20">
                                <div class="flex items-center justify-end px-4 py-2 border-b border-gray-100 dark:border-zinc-800">
                                    <button @click="copyToClipboard(formatRawResponse(log.response.raw_response))" class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title="Copy raw response">
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                                <pre class="text-gray-900 dark:text-gray-100 max-h-80 overflow-auto p-4 text-xs font-mono whitespace-pre-wrap">{{ formatRawResponse(log.response.raw_response) }}</pre>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>

            <!-- Footer -->
            <div class="border-border bg-white dark:bg-zinc-900 sticky bottom-0 border-t px-6 py-4 flex items-center justify-between">
                <div class="text-gray-500 dark:text-gray-400 text-xs">
                    Environment: <span class="font-medium text-gray-700 dark:text-gray-300 capitalize">{{ log.environment }}</span>
                </div>
                <button @click="$emit('close')" class="cursor-pointer bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg px-5 py-2 text-sm font-medium transition-colors">
                    Close
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import type { CompletionLog } from "~/services/completionLogsService"
import eventBus from "~/util/eventBus"
import Section from "./Section.vue"
import InfoRow from "./InfoRow.vue"
import StatusBadge from "./StatusBadge.vue"

defineProps<{
    log: CompletionLog
}>()

defineEmits<{
    close: []
}>()

// Collapsed states for expandable sections
const isDocumentsExpanded = ref(false)
const isMcpToolsExpanded = ref(false)
const isErrorExpanded = ref(false)
const isRawResponseExpanded = ref(false)
const expandedDocuments = ref<Set<number>>(new Set())
const expandedToolCalls = ref<Set<number>>(new Set())

function toggleDocumentsSection() {
    isDocumentsExpanded.value = !isDocumentsExpanded.value
}

function toggleMcpToolsSection() {
    isMcpToolsExpanded.value = !isMcpToolsExpanded.value
}

function toggleDocument(index: number) {
    if (expandedDocuments.value.has(index)) {
        expandedDocuments.value.delete(index)
    } else {
        expandedDocuments.value.add(index)
    }
}

function toggleToolCall(index: number) {
    if (expandedToolCalls.value.has(index)) {
        expandedToolCalls.value.delete(index)
    } else {
        expandedToolCalls.value.add(index)
    }
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

function formatTimestamp(ts: number): string {
    return new Date(ts).toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    })
}

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    eventBus.emit("showToast", {
        _type: "success",
        message: "Copied to clipboard",
    })
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    })
}

function formatRawResponse(rawResponse: string): string {
    try {
        const parsed = JSON.parse(rawResponse)
        return JSON.stringify(parsed, null, 2)
    } catch {
        return rawResponse
    }
}
</script>
