<template>
    <div class="h-full overflow-y-auto p-6">
        <div class="mx-auto max-w-7xl pb-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-foreground mb-2 text-3xl font-bold">LLM Testing Dashboard</h1>
                <p class="text-muted-foreground">Test all deployed language models with a single click and monitor their performance in real-time.</p>
            </div>

            <!-- Test Control Section -->
            <div class="bg-card border-border mb-8 rounded-lg border p-6 shadow-sm">
                <div class="mb-4">
                    <label for="testPrompt" class="text-foreground mb-2 block text-sm font-medium">Test Prompt</label>
                    <textarea id="testPrompt" v-model="testPrompt" rows="3" class="bg-input text-foreground border-border ring-mozart-blue-500 w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none" placeholder="Enter a prompt to test all models..." :disabled="isTestRunning"></textarea>
                </div>

                <div class="flex items-center justify-between">
                    <button @click="startTest" :disabled="!testPrompt.trim() || isTestRunning" class="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground flex items-center gap-2 rounded-md px-6 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed">
                        <UIcon v-if="isTestRunning" name="i-lucide-loader-circle" class="size-5 animate-spin" />
                        <UIcon v-else name="i-lucide-play" class="size-5" />
                        {{ isTestRunning ? "Test Running..." : "Start Test" }}
                    </button>

                    <div v-if="currentTest" class="text-muted-foreground text-sm">Progress: {{ currentTest.completedModels + currentTest.failedModels }}/{{ currentTest.totalModels }}</div>
                </div>
            </div>

            <!-- Real-time Progress Section -->
            <div v-if="isTestRunning && currentTest" class="bg-card border-border mb-8 rounded-lg border p-6 shadow-sm">
                <h2 class="text-foreground mb-4 text-xl font-semibold">Real-time Progress</h2>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div v-for="result in currentTest.results" :key="result.id" class="border-border bg-background rounded-lg border p-4">
                        <div class="mb-2 flex items-center justify-between">
                            <div class="text-foreground font-medium">{{ result.provider }}</div>
                            <StatusBadge :status="result.status" />
                        </div>
                        <div class="text-muted-foreground text-sm">{{ result.model }}</div>
                        <div v-if="result.status === 'success'" class="text-muted-foreground mt-2 text-xs">
                            <div>Latency: {{ result.latencyMs }}ms</div>
                            <div v-if="result.tokensUsed">Tokens: {{ result.tokensUsed }}</div>
                        </div>
                        <div v-if="result.status === 'failed' && result.errorMessage" class="text-destructive mt-2 text-xs">{{ result.errorMessage }}</div>
                    </div>
                </div>
            </div>

            <!-- Latest Test Results -->
            <div v-if="latestTest && !isTestRunning" class="bg-card border-border mb-8 rounded-lg border p-6 shadow-sm">
                <div class="mb-4 flex items-center justify-between">
                    <h2 class="text-foreground text-xl font-semibold">Latest Test Results</h2>
                    <div class="text-muted-foreground text-sm">{{ formatDate(latestTest.createdAt) }}</div>
                </div>

                <!-- Summary Stats -->
                <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div class="bg-background border-border rounded-lg border p-4">
                        <div class="text-muted-foreground mb-1 text-sm">Total Models</div>
                        <div class="text-foreground text-2xl font-bold">{{ latestTest.totalModels }}</div>
                    </div>
                    <div class="bg-background border-border rounded-lg border p-4">
                        <div class="text-muted-foreground mb-1 text-sm">Successful</div>
                        <div class="text-2xl font-bold text-green-600">{{ latestTest.completedModels }}</div>
                    </div>
                    <div class="bg-background border-border rounded-lg border p-4">
                        <div class="text-muted-foreground mb-1 text-sm">Failed</div>
                        <div class="text-2xl font-bold text-red-600">{{ latestTest.failedModels }}</div>
                    </div>
                    <div class="bg-background border-border rounded-lg border p-4">
                        <div class="text-muted-foreground mb-1 text-sm">Success Rate</div>
                        <div class="text-foreground text-2xl font-bold">{{ calculateSuccessRate(latestTest) }}%</div>
                    </div>
                </div>

                <!-- Test Prompt -->
                <div class="bg-background border-border mb-4 rounded-lg border p-4">
                    <div class="text-muted-foreground mb-2 text-sm font-medium">Test Prompt:</div>
                    <div class="text-foreground text-sm">{{ latestTest.testPrompt }}</div>
                </div>

                <!-- Results Grid -->
                <div class="space-y-4">
                    <h3 class="text-foreground text-lg font-semibold">Model Results</h3>
                    <div class="space-y-3">
                        <div v-for="result in latestTest.results" :key="result.id" class="bg-background border-border rounded-lg border p-4">
                            <div class="mb-3 flex items-start justify-between">
                                <div>
                                    <div class="text-foreground mb-1 font-medium">{{ result.provider }} - {{ result.model }}</div>
                                    <div class="text-muted-foreground flex items-center gap-4 text-sm">
                                        <span v-if="result.latencyMs">⚡ {{ result.latencyMs }}ms</span>
                                        <span v-if="result.tokensUsed">🎯 {{ result.tokensUsed }} tokens</span>
                                    </div>
                                </div>
                                <StatusBadge :status="result.status" />
                            </div>

                            <div v-if="result.status === 'success' && result.response" class="bg-muted/50 border-border rounded-md border p-3">
                                <div class="text-muted-foreground mb-2 text-xs font-medium">Response:</div>
                                <div class="text-foreground text-sm whitespace-pre-wrap">{{ truncateText(result.response, 300) }}</div>
                                <button v-if="result.response.length > 300" @click="showFullResponse(result)" class="text-primary hover:text-primary/80 mt-2 text-xs font-medium">Show full response</button>
                            </div>

                            <div v-if="result.status === 'failed'" class="bg-destructive/10 border-destructive rounded-md border p-3">
                                <div class="text-destructive text-sm">Error: {{ result.errorMessage || "Unknown error" }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Test History -->
            <div class="bg-card border-border rounded-lg border p-6 shadow-sm">
                <div class="mb-4 flex items-center justify-between">
                    <h2 class="text-foreground text-xl font-semibold">Test History</h2>
                    <button @click="loadHistory" class="text-primary hover:text-primary/80 text-sm font-medium">Refresh</button>
                </div>

                <div v-if="testHistory.length === 0" class="text-muted-foreground py-8 text-center">
                    <UIcon name="i-lucide-inbox" class="mx-auto mb-2 size-12 opacity-50" />
                    <p>No test history available</p>
                </div>

                <div v-else class="space-y-3">
                    <div v-for="test in testHistory" :key="test.id" class="bg-background border-border hover:border-primary cursor-pointer rounded-lg border p-4 transition-colors" @click="viewTestDetails(test)">
                        <div class="mb-2 flex items-center justify-between">
                            <div class="text-foreground font-medium">{{ formatDate(test.createdAt) }}</div>
                            <div class="flex items-center gap-2">
                                <span class="text-muted-foreground text-sm">{{ test.completedModels }}/{{ test.totalModels }} passed</span>
                                <StatusBadge :status="test.status" />
                            </div>
                        </div>
                        <div class="text-muted-foreground line-clamp-1 text-sm">{{ test.testPrompt }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Full Response Modal -->
        <Modal v-if="showResponseModal" @close="showResponseModal = false" title="Full Response" closeable>
            <div class="max-h-[60vh] overflow-y-auto">
                <div class="text-muted-foreground mb-2 text-sm font-medium">{{ selectedResult?.provider }} - {{ selectedResult?.model }}</div>
                <div class="text-foreground text-sm whitespace-pre-wrap">{{ selectedResult?.response }}</div>
            </div>
        </Modal>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from "vue"
    import cookie from "js-cookie"
    import { io, Socket } from "socket.io-client"

    interface ApiResponse<T = any> {
        status: string
        message: string
        code: number
        data?: T
    }

    definePageMeta({
        layout: "mozart-rag-service-admin",
        middleware: ["auth"],
    })

    useHead({
        title: "LLM Testing",
    })

    // State
    const testPrompt = ref("Hello! Please introduce yourself and explain what you can do.")
    const isTestRunning = ref(false)
    const currentTest = ref<any>(null)
    const latestTest = ref<any>(null)
    const testHistory = ref<any[]>([])
    const showResponseModal = ref(false)
    const selectedResult = ref<any>(null)
    let socket: Socket | null = null

    // API client
    const config = useRuntimeConfig()

    // Get API URL with fallback
    let apiBaseUrl = config.public.apiUrl || ""

    // If empty or relative URL, construct full URL from current location
    if (!apiBaseUrl || apiBaseUrl.startsWith("/")) {
        if (typeof window !== "undefined") {
            // Use current origin and append /api
            apiBaseUrl = `${window.location.origin}/api`
            console.log("[LLM Testing] Using fallback API URL:", apiBaseUrl)
            console.warn("[LLM Testing] Consider setting SERVER_API_URL environment variable for production")
        } else {
            // Server-side fallback
            apiBaseUrl = "http://localhost:8080/api"
        }
    }

    // Ensure apiBaseUrl has /api path if not present (only for REST calls)
    let restBaseUrl = apiBaseUrl
    if (!restBaseUrl.includes("/api")) {
        restBaseUrl = `${restBaseUrl}/api`
        console.log("[LLM Testing] Added /api to REST URL:", restBaseUrl)
    }
    restBaseUrl = restBaseUrl.replace(/\/$/, "")

    // For sockets, we want the origin (e.g., http://localhost:2000)
    const socketBaseUrl = apiBaseUrl.replace(/\/api$/, "").replace(/\/$/, "")

    // Initialize Socket.IO connection
    const initSocket = () => {
        const token = cookie.get("mozart")
        socket = io(`${socketBaseUrl}/llm-test`, {
            path: "/socket.io",
            transports: ["websocket"],
            autoConnect: false,
            auth: { token },
            withCredentials: true,
        })

        socket.on("connect", () => {
            console.log("Connected to LLM test socket")
        })

        socket.on("llm-test-progress", (data: any) => {
            console.log("Test progress:", data)
            updateTestProgress(data)
        })

        socket.on("llm-test-completed", (data: any) => {
            console.log("Test completed:", data)
            handleTestCompleted(data)
        })

        socket.on("disconnect", () => {
            console.log("Disconnected from LLM test socket")
        })
    }

    // Start a new test
    const startTest = async () => {
        if (!testPrompt.value.trim()) return

        try {
            isTestRunning.value = true

            const response = await $fetch<ApiResponse<{ testId: string }>>(`${restBaseUrl}/v1/llm-test/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: {
                    prompt: testPrompt.value,
                },
            })

            if (response?.status === "success" && response?.data) {
                const testId = response.data.testId
                currentTest.value = {
                    id: testId,
                    testPrompt: testPrompt.value,
                    status: "running",
                    totalModels: 0,
                    completedModels: 0,
                    failedModels: 0,
                    results: [],
                }

                // Subscribe to test updates
                if (socket) {
                    socket.emit("subscribe_test", testId)
                }

                // Poll for initial status
                setTimeout(() => loadTestStatus(testId), 1000)
            }
        } catch (error) {
            console.error("Error starting test:", error)
            isTestRunning.value = false
        }
    }

    // Load test status
    const loadTestStatus = async (testId: string) => {
        try {
            const response = await $fetch<ApiResponse>(`${restBaseUrl}/v1/llm-test/status/${testId}`, {
                method: "GET",
                credentials: "include",
            })

            if (response?.status === "success" && response?.data) {
                currentTest.value = response.data
            }
        } catch (error) {
            console.error("Error loading test status:", error)
        }
    }

    // Update test progress from socket
    const updateTestProgress = (data: any) => {
        if (!currentTest.value || currentTest.value.id !== data.testId) return

        // Find and update the specific result
        const resultIndex = currentTest.value.results.findIndex((r: any) => r.id === data.resultId)
        if (resultIndex !== -1) {
            currentTest.value.results[resultIndex] = {
                ...currentTest.value.results[resultIndex],
                status: data.status,
                latencyMs: data.latencyMs,
                tokensUsed: data.tokensUsed,
                errorMessage: data.errorMessage,
            }

            // Update counts
            const completed = currentTest.value.results.filter((r: any) => r.status === "success").length
            const failed = currentTest.value.results.filter((r: any) => r.status === "failed").length
            currentTest.value.completedModels = completed
            currentTest.value.failedModels = failed
        }
    }

    // Handle test completion
    const handleTestCompleted = async (data: any) => {
        if (!currentTest.value || currentTest.value.id !== data.testId) return

        currentTest.value.status = "completed"
        currentTest.value.completedModels = data.completedModels
        currentTest.value.failedModels = data.failedModels

        isTestRunning.value = false

        // Reload full test data
        await loadTestStatus(data.testId)
        await loadLatestTest()
        await loadHistory()

        // Unsubscribe from updates
        if (socket) {
            socket.emit("unsubscribe_test", data.testId)
        }
    }

    // Load latest test
    const loadLatestTest = async () => {
        try {
            const response = await $fetch<ApiResponse>(`${restBaseUrl}/v1/llm-test/latest`, {
                method: "GET",
                credentials: "include",
            })

            if (response?.status === "success" && response?.data) {
                latestTest.value = response.data
            }
        } catch (error) {
            console.error("Error loading latest test:", error)
        }
    }

    // Load test history
    const loadHistory = async () => {
        try {
            const response = await $fetch<ApiResponse<any[]>>(`${restBaseUrl}/v1/llm-test/history`, {
                method: "GET",
                credentials: "include",
            })

            if (response?.status === "success" && response?.data) {
                testHistory.value = response.data
            }
        } catch (error) {
            console.error("Error loading test history:", error)
        }
    }

    // View test details
    const viewTestDetails = (test: any) => {
        latestTest.value = test
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // Show full response
    const showFullResponse = (result: any) => {
        selectedResult.value = result
        showResponseModal.value = true
    }

    // Utility functions
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + "..."
    }

    const calculateSuccessRate = (test: any) => {
        if (test.totalModels === 0) return 0
        return Math.round((test.completedModels / test.totalModels) * 100)
    }

    // Lifecycle
    onMounted(async () => {
        initSocket()
        await loadLatestTest()
        await loadHistory()
    })

    onUnmounted(() => {
        if (socket) {
            socket.disconnect()
        }
    })
</script>

<style scoped>
    .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
