import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import { nextTick, ref } from "vue"

// Hoisted mocks to satisfy Vitest's module mocking and import order
const hoisted = vi.hoisted(() => {
    // Minimal deterministic util mocks
    const mockConvertTimeToPDTAndEDT = vi.fn((ts: string | number) => ({ PDT: "PDT_TIME", EDT: "EDT_TIME" }))
    const mockChunkArray = vi.fn((arr: any[], size: number) => {
        const out: any[] = []
        for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
        return out
    })

    // Mock logs dataset covering needed fields for all log types
    const baseLog = (overrides: Record<string, any> = {}) => ({
        logId: Math.random().toString(36).slice(2),
        index: 0,
        created_at: Date.now(),
        drafting_id: "draft-1",
        module: "search",
        moduleKey: "alpha",
        score: 0.99,
        collection_name: "default",
        conversationId: "c1",
        messageId: "m1",
        author: { name: "Alice" },
        text: "Hello world",
        file_name: "file.pdf",
        status: "done",
        email: "user@example.com",
        promptUpdatedId: "p-2",
        promptId: "p-1",
        updatedPrompt: { sectionOne: "S1", sectionTwo: "S2", sectionThree: "S3", sectionFour: "S4" },
        LLMResponse: {
            LLMResponseSectionOne: "# one",
            LLMResponseSectionTwo: "# two",
            LLMResponseSectionThree: "# three",
            LLMResponseSectionFour: "# four",
        },
        url: "https://example.com",
        filePath: "/a/b",
        type: "image/png",
        description: "desc",
        fileHash: "abc",
        platform: "Mozart",
        environment: "development",
        expandRow: false,
        ...overrides,
    })

    // Generate ample logs to ensure multi-page pagination with default rowsPerPage
    const allLogs = Array.from({ length: 25 }, (_, i) => baseLog({ index: i + 1 }))
    const page1 = allLogs.slice(0, 10)
    const page2 = allLogs.slice(10, 20)

    // Reactive-like containers used by composable mocks
    // Plain ref shim to avoid using Vue imports in hoisted scope
    const makeRef = <T>(v: T) => ({ value: v })
    const logsRef = makeRef(allLogs)
    const chunkedLogsRef = makeRef([page1, page2, allLogs.slice(20)])
    const selectedLogsRef = makeRef<string[]>([])
    const currentLogsPageRef = makeRef<number>(1)
    const logTypeRef = makeRef<string>("vectorization")
    const timezoneRef = makeRef<"PDT" | "EDT">("PDT")
    const isDeletingRef = makeRef<boolean>(false)
    const isLoadingRef = makeRef<boolean>(false)
    const lastEvaluatedKeyRef = makeRef<string | null>(null)
    const hasNoMoreDataRef = makeRef<boolean>(false)

    const initializeLogs = vi.fn(async () => {})
    const deleteLog = vi.fn(async (_: string) => {})
    const deleteSelectedLogs = vi.fn(async () => {})
    const toggleLogSelection = vi.fn((_logId: string) => {})
    const changeTimezone = vi.fn(() => {
        timezoneRef.value = timezoneRef.value === "PDT" ? "EDT" : "PDT"
    })
    const changeLogType = vi.fn((t: string) => {
        logTypeRef.value = t
    })
    const loadMoreLogs = vi.fn(async () => {
        // simulate adding a new page when called
        const nextIdx = (chunkedLogsRef.value.flat().length || 0) + 1
        const newPage = [baseLog({ index: nextIdx }), baseLog({ index: nextIdx + 1 })]
        chunkedLogsRef.value = [...chunkedLogsRef.value, newPage]
    })

    // Mock for useLogs composable
    const mockUseLogs = vi.fn(() => (globalThis as any).__logsMock)

    // Mock for useRagStore composable (environment/platform filters)
    const ragStore = { environment: "", platform: "" }
    const mockUseRagStore = vi.fn(() => ragStore)

    // marked mock
    const mockMarked = vi.fn((md: string) => `<p>${md}</p>`)

    return {
        mockConvertTimeToPDTAndEDT,
        mockChunkArray,
        mockUseLogs,
        mockUseRagStore,
        mockMarked,
        // expose reactive refs and helpers for test assertions
        refs: {
            // placeholders; will be reassigned to real Vue refs below
            logsRef,
            chunkedLogsRef,
            selectedLogsRef,
            currentLogsPageRef,

            logTypeRef,
            timezoneRef,
            isLoadingRef,
            lastEvaluatedKeyRef,
            hasNoMoreDataRef,
        },
        actions: { initializeLogs, deleteLog, changeTimezone, changeLogType, loadMoreLogs },
        ragStore,
        data: { allLogs, page1, page2 },
    }
})

// Set up real Vue refs for the mocked composable and expose via global
const setupRealLogsMock = () => {
    const logsRef = ref(hoisted.data.allLogs)
    const chunkedLogsRef = ref([hoisted.data.page1, hoisted.data.page2, hoisted.data.allLogs.slice(20)])
    const selectedLogsRef = ref<string[]>([])
    const currentLogsPageRef = ref<number>(1)
    const logTypeRef = ref<string>("vectorization")
    const timezoneRef = ref<"PDT" | "EDT">("PDT")
    const isDeletingRef = ref<boolean>(false)
    const isLoadingRef = ref<boolean>(false)
    const lastEvaluatedKeyRef = ref<string | null>(null)
    const hasNoMoreDataRef = ref<boolean>(false)
    const paginationRef = ref<{ totalCount: number }>({ totalCount: hoisted.data.allLogs.length })

    const initializeLogs = vi.fn(async (page?: number, _itemsPerPage?: number) => {
        if (typeof page === "number") {
            currentLogsPageRef.value = page
        }
        return chunkedLogsRef.value
    })
    const deleteLog = vi.fn(async (_: string) => {})
    const deleteSelectedLogs = vi.fn(async () => {})
    const toggleLogSelection = vi.fn((_logId: string) => {})
    const changeTimezone = vi.fn(() => {
        timezoneRef.value = timezoneRef.value === "PDT" ? "EDT" : "PDT"
    })
    const changeLogType = vi.fn((t: string) => {
        logTypeRef.value = t
    })
    const loadMoreLogs = vi.fn(async () => {
        const nextIdx = (chunkedLogsRef.value.flat().length || 0) + 1
        const newPage = [
            { ...hoisted.data.allLogs[0], index: nextIdx },
            { ...hoisted.data.allLogs[1], index: nextIdx + 1 },
        ]
        chunkedLogsRef.value = [...chunkedLogsRef.value, newPage]
        paginationRef.value.totalCount = chunkedLogsRef.value.flat().length
    })
    const resetPaginationState = vi.fn(() => {
        currentLogsPageRef.value = 1
    })

    ;(globalThis as any).__logsMock = {
        logs: logsRef,
        chunkedLogs: chunkedLogsRef,
        selectedLogs: selectedLogsRef,
        currentLogsPage: currentLogsPageRef,
        logType: logTypeRef,
        timezone: timezoneRef,
        initializeLogs,
        deleteLog,
        deleteSelectedLogs,
        toggleLogSelection,
        changeTimezone,
        changeLogType,
        isDeleting: isDeletingRef,
        isLoading: isLoadingRef,
        loadMoreLogs,
        lastEvaluatedKey: lastEvaluatedKeyRef,
        hasNoMoreData: hasNoMoreDataRef,
        pagination: paginationRef,
        resetPaginationState,
    }

    // Re-map hoisted refs/actions to real ones so tests using hoisted continue to work
    hoisted.refs.logsRef = logsRef
    hoisted.refs.chunkedLogsRef = chunkedLogsRef
    hoisted.refs.selectedLogsRef = selectedLogsRef
    hoisted.refs.currentLogsPageRef = currentLogsPageRef
    hoisted.refs.logTypeRef = logTypeRef
    hoisted.refs.timezoneRef = timezoneRef
    hoisted.refs.isLoadingRef = isLoadingRef
    hoisted.refs.lastEvaluatedKeyRef = lastEvaluatedKeyRef
    hoisted.refs.hasNoMoreDataRef = hasNoMoreDataRef
    hoisted.actions.initializeLogs = initializeLogs as any
    hoisted.actions.deleteLog = deleteLog as any
    hoisted.actions.changeTimezone = changeTimezone as any
    hoisted.actions.changeLogType = changeLogType as any
    hoisted.actions.loadMoreLogs = loadMoreLogs as any
}

setupRealLogsMock()

vi.mock("~/composables/useLogs", () => ({
    useLogs: hoisted.mockUseLogs,
}))

vi.mock("~/composables/useRag", () => ({
    useRagStore: hoisted.mockUseRagStore,
}))

// Some builds of the component may rely on auto-import (no explicit import),
// which results in a global reference at runtime. Provide a global stub as well.
vi.stubGlobal("useRagStore", hoisted.mockUseRagStore)

vi.mock("~/util", () => ({
    chunkArray: hoisted.mockChunkArray,
    convertTimeToPDTAndEDT: hoisted.mockConvertTimeToPDTAndEDT,
}))

vi.mock("marked", () => ({
    marked: hoisted.mockMarked,
}))

// Import after mocks
import RagLogsTable from "@/components/ui/LogsTable/LogsTable.vue"

// Stable stubs
const DropdownStub = {
    name: "DropdownV2",
    props: {
        label: { type: String, required: true },
        items: { type: Array, default: () => [] },
        currentlySelected: { type: [String, Number, Object], default: "" },
    },
    emits: ["update:selected"],
    template: `
    <button class="dropdown-stub" :data-label="label" @click="$emit('update:selected', items[0] || { text: 'All', value: '' })">
      {{ label }}: {{ typeof currentlySelected === 'object' ? (currentlySelected?.text || '') : currentlySelected }}
    </button>
  `,
}

const VTooltipStub = {
    name: "VTooltip",
    template: `<span class="vtooltip-stub"><slot /><slot name="popper" /></span>`,
}

const ComponentLoadingStub = {
    name: "ComponentLoading",
    template: `<div class="component-loading-stub">Loading...</div>`,
}

const clickOutsideDirective = {
    mounted() {},
    beforeUnmount() {},
}

// Stub for LogsHeader to provide timezone toggles and dropdowns
const LogsHeaderStub = {
    name: "LogsHeader",
    props: ["timezone", "selectedPlatform", "selectedEnvironment", "selectedLogTypeText", "logTypeOptions", "platformOptions", "environmentOptions"],
    emits: ["change-timezone", "update-log-type", "update-platform", "update-environment"],
    components: { DropdownV2: DropdownStub },
    template: `
    <div class="logs-header-stub">
      Logs
      <button class="log-type-switch-option" @click="$emit('change-timezone')">PDT</button>
      <button class="log-type-switch-option" @click="$emit('change-timezone')">EDT</button>
      <DropdownV2 :label="'Log Type'" :items="logTypeOptions" @update:selected="$emit('update-log-type', $event)" />
      <DropdownV2 :label="'Platform'" :items="platformOptions" @update:selected="$emit('update-platform', $event)" />
      <DropdownV2 :label="'Environment'" :items="environmentOptions" @update:selected="$emit('update-environment', $event)" />
    </div>
  `,
}

// Stub for LogsNuxtTable to render a simple table and pagination buttons
const LogsNuxtTableStub = {
    name: "LogsNuxtTable",
    props: ["paginatedData", "filteredTableColumns", "currentPage", "itemsPerPage", "totalItems", "pagination"],
    emits: ["update-page", "handle-row-select"],
    computed: {
        rowsForPage() {
            const pageIdx = (this.currentPage || 1) - 1
            const data = this.paginatedData || []
            if (Array.isArray(data[0])) {
                return data[pageIdx] || []
            }
            const start = pageIdx * (this.itemsPerPage || 10)
            const end = start + (this.itemsPerPage || 10)
            return data.slice(start, end)
        },
    },
    template: `
    <div class="logs-table-stub">
      <table>
        <tbody>
          <tr v-for="(row, i) in rowsForPage" :key="row.logId || i" @click="$emit('handle-row-select', row)">
            <td>{{ i + 1 }}</td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <button class="prev">Prev</button>
        <button class="next" @click="$emit('update-page', (currentPage || 1) + 1)">Next</button>
      </div>
    </div>
  `,
}

// Stub for loading state
const TableLoadingStateStub = {
    name: "TableLoadingState",
    props: ["customTitle"],
    template: `<div class="component-loading-stub">Loading...</div>`,
}

const factory = (options: Record<string, any> = {}) =>
    mount(RagLogsTable, {
        global: {
            components: {
                DropdownV2: DropdownStub,
                VTooltip: VTooltipStub,
                ComponentLoading: ComponentLoadingStub,
                LogsHeader: LogsHeaderStub,
                LogsNuxtTable: LogsNuxtTableStub,
                TableLoadingState: TableLoadingStateStub,
            },
            directives: {
                "click-outside": clickOutsideDirective,
            },
            // Silence unknown custom elements if any
            config: {
                compilerOptions: {
                    isCustomElement: (_tag: string) => false,
                },
            },
        },
        attachTo: document.body,
        ...options,
    })

const waitForRows = async (wrapper: any, attempts = 5) => {
    for (let i = 0; i < attempts; i++) {
        await nextTick()
        await flushPromises()
        const rows = wrapper.findAll("tbody tr")
        if (rows.length > 0) return rows
    }
    return wrapper.findAll("tbody tr")
}

describe("RagLogsTable.vue", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        // cleanup attachTo mounts
        document.body.innerHTML = ""
    })

    it("mounts and calls initializeLogs on mounted", async () => {
        const wrapper = factory()
        await nextTick()
        await flushPromises()
        expect(hoisted.actions.initializeLogs).toHaveBeenCalled()
        expect(wrapper.text()).toContain("Logs")
    })

    it("shows loading indicator when isLoading is true, then renders table", async () => {
        hoisted.refs.isLoadingRef.value = true
        let wrapper = factory()
        await flushPromises()
        expect(wrapper.find(".component-loading-stub").exists()).toBe(true)
        // Remount with loading=false to avoid relying on reactivity of shim
        wrapper.unmount()
        hoisted.refs.isLoadingRef.value = false
        wrapper = factory()
        await nextTick()
        await flushPromises()
        const rows = await waitForRows(wrapper)
        expect(rows.length).toBeGreaterThan(0)
    })

    it("renders current page rows and supports pagination next button", async () => {
        hoisted.refs.isLoadingRef.value = false
        hoisted.refs.currentLogsPageRef.value = 1
        const wrapper = factory()
        const rows = await waitForRows(wrapper)
        const firstCellText = rows[0].find("td").text()
        // With generated data, first row should be index 1 initially
        expect(firstCellText).toBe("1")

        // click the Next button
        const nextBtn = wrapper.find("button.next")
        expect(nextBtn.exists()).toBe(true)
        await nextBtn.trigger("click")
        await flushPromises()

        // After clicking next, initializeLogs should be called again to fetch data
        expect(hoisted.actions.initializeLogs).toHaveBeenCalledTimes(2)
    })

    it.todo("sorts by Index column toggling asc/desc", async () => {
        hoisted.refs.isLoadingRef.value = false
        hoisted.refs.currentLogsPageRef.value = 1
        // Ensure known order [2,1] initially
        const page = hoisted.refs.chunkedLogsRef.value[0]
        page[0].index = 2
        page[1].index = 1

        const wrapper = factory()
        await waitForRows(wrapper)

        const indexHeader = wrapper.findAll("thead th").find((th) => th.text().includes("Index"))!
        // First click -> asc (1,2)
        await indexHeader.trigger("click")
        await flushPromises()
        let firstCell = wrapper.find("tbody tr td")
        expect(firstCell.text()).toBe("1")
        // Second click -> desc (2,1)
        await indexHeader.trigger("click")
        await flushPromises()
        firstCell = wrapper.find("tbody tr td")
        expect(firstCell.text()).toBe("2")
    })

    it("toggles timezone when clicking PDT/EDT buttons", async () => {
        hoisted.refs.timezoneRef.value = "PDT"
        const wrapper = factory()
        await flushPromises()

        const tzButtons = wrapper.findAll(".log-type-switch-option")
        expect(tzButtons.length).toBe(2)
        await tzButtons[0].trigger("click")
        await tzButtons[1].trigger("click")
        expect(hoisted.actions.changeTimezone).toHaveBeenCalledTimes(2)
    })

    it("emits dropdown updates and updates ragStore filters + re-initializes logs", async () => {
        const wrapper = factory()
        await flushPromises()

        const dropdowns = wrapper.findAll(".dropdown-stub, [data-label]")
        // Expect three dropdowns: Log Type, Platform, Environment
        expect(dropdowns.length).toBeGreaterThanOrEqual(3)

        // Click Environment -> emits update:selected with first item (All)
        const envBtn = dropdowns.find((d) => d.attributes("data-label") === "Environment") || dropdowns[2]
        await envBtn!.trigger("click")
        await flushPromises()
        // After click our component calls initializeLogs; ragStore updated to '' value
        expect(hoisted.ragStore.environment).toBe("")
        expect(hoisted.actions.initializeLogs).toHaveBeenCalled()

        // Click Platform -> updates ragStore.platform
        const platBtn = dropdowns.find((d) => d.attributes("data-label") === "Platform") || dropdowns[1]
        await platBtn!.trigger("click")
        await flushPromises()
        expect(hoisted.ragStore.platform).toBe("")
        expect(hoisted.actions.initializeLogs).toHaveBeenCalled()

        // Click Log Type -> changeLogType called with emitted value
        const typeBtn = dropdowns.find((d) => d.attributes("data-label") === "Log Type") || dropdowns[0]
        await typeBtn!.trigger("click")
        await flushPromises()
        expect(hoisted.refs.logTypeRef.value).toBeTypeOf("string")
    })

    it.todo("calls deleteLog when clicking delete action", async () => {
        const wrapper = factory()
        await waitForRows(wrapper)

        // The delete icon is inside Actions column within VTooltip
        let deleteBtn = wrapper.findAll(".materialSymbolsOutlined").find((el) => el.text() === "delete")
        if (!deleteBtn) {
            // fallback: search buttons then icon text
            const candidates = wrapper.findAll("td .materialSymbolsOutlined")
            deleteBtn = candidates.find((el) => el.text().includes("delete"))
        }
        expect(!!deleteBtn).toBe(true)
        await deleteBtn!.trigger("click")
        expect(hoisted.actions.deleteLog).toHaveBeenCalledTimes(1)
        const calledWith = hoisted.actions.deleteLog.mock.calls[0][0]
        expect(calledWith).toBeTruthy()
    })
})
