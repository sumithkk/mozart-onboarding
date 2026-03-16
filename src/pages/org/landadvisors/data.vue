<template>
    <div class="pageWrapper">
        <FullPageLoading v-if="dataStore.rows.length === 0" />
        <div v-else class="contentWrapper">
            <h1 class="pageTitle">California: Planning Commission Data</h1>
            <div class="report">
                <div class="filterContainer">
                    <span>Filter</span>
                    <div class="custom-select" @click="toggleCityDropdown">
                        <div class="select-display">
                            All Cities
                            <span v-if="isCityDropdownVisible" class="select-dropdown">▲</span>
                            <span v-else class="select-dropdown">▼</span>
                        </div>
                        <div v-if="isCityDropdownVisible" class="dropdown">
                            <input type="text" v-model="searchTerm" @click.stop placeholder="Search cities..." class="search-input" />
                            <ul>
                                <li v-for="(city, index) in dataStore.cities" :key="index" @click.stop="toggleCity(city)">{{ city }}<span v-if="isSelected(city)">✓</span></li>
                            </ul>
                        </div>
                    </div>
                    <input type="checkbox" name="" id="" v-model="selectedMatches" /> Exclude "0 Matches"
                </div>
                <div class="matchedTerms"></div>
                <div class="tableContainer">
                    <div class="actionButtons">
                        <button @click="showArchived">
                            <span v-if="isArchive" class="materialSymbolsOutlined">expand</span>
                            <span v-else class="materialSymbolsOutlined">collapse_all</span>
                        </button>
                        <button @click="exportToExcel">
                            Export
                            <span class="materialSymbolsOutlined">export_notes</span>
                        </button>
                    </div>
                    <div class="table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Actions</th>
                                    <th>Select</th>
                                    <th @click="toggleIndexSort">
                                        City
                                        <span v-if="sortIndex" class="materialSymbolsOutlined">expand_more</span>
                                        <span v-else class="materialSymbolsOutlined">expand_less</span>
                                    </th>
                                    <th @click="toggleCreatedSort">
                                        Date
                                        <span v-if="sortAscending" class="materialSymbolsOutlined">expand_less</span>
                                        <span v-else class="materialSymbolsOutlined">expand_more</span>
                                    </th>
                                    <th class="preview-head">Preview</th>
                                    <th @click="toggleCountSort">
                                        Matches
                                        <span v-if="sortCount" class="materialSymbolsOutlined">expand_less</span>
                                        <span v-else class="materialSymbolsOutlined">expand_more</span>
                                    </th>
                                    <th>URL</th>
                                    <th>Comment</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, index) in filteredCities" :key="index" v-show="rowVisibility[row.URL] !== false">
                                    <td>
                                        <div class="action-button-container">
                                            <div class="action-button" :class="{ 'action-button-clicked': buttonClicked.archive[row.URL] }" v-show="!undoButtonVisibility[row.URL]" @click="archive(row)">
                                                <span class="action-button-text">Archive</span>
                                                <span class="materialSymbolsOutlined">archive</span>
                                            </div>
                                            <div class="action-button" :class="{ 'action-button-clicked': buttonClicked.clear[row.URL] }" v-show="!undoButtonVisibility[row.URL]" @click="clear(row)">
                                                <span class="action-button-text">Clear</span>
                                                <span class="materialSymbolsOutlined">close</span>
                                            </div>
                                            <div class="action-button" v-show="archivedOrCleared[row.URL]" @click="undo(row)">
                                                <span class="action-button-text">Undo</span>
                                                <span class="materialSymbolsOutlined">undo</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="checkbox-select"><input v-model="row.Selected" type="checkbox" /></td>
                                    <td>{{ row.City }}</td>
                                    <td>{{ row.Created_At }}</td>
                                    <td><div class="preview" v-html="memoizedProcessText(row.Tags, row.Highlighted, row.Pages, row.Pages_Match)"></div></td>
                                    <!-- <td><div v-for="word in row.Match.split(',')" :key="word">{{word}}</div></td> -->
                                    <td>{{ row.Match_Count }}</td>
                                    <td>
                                        <ul class="link-ul">
                                            <li class="link">
                                                <!-- <a @click.prevent="viewPdf(row.URL)"><span class="link-text">Default</span></a> -->
                                                <a :href="row.URL" target="_blank"><span class="link-text">Default</span></a>
                                            </li>
                                            <li v-if="row.Highlighted" class="link">
                                                <a @click.prevent="viewPdf(row.Highlighted)"><span class="link-text">Highlighted</span></a>
                                            </li>
                                        </ul>
                                    </td>
                                    <td><input class="text-comment" type="text" v-model="row.comment" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="arrow-container">
                    <div class="arrow materialSymbolsOutlined" :class="{ hidden: currentPageCount === 0 }" @click.stop="togglePage(-1)">chevron_left</div>
                    <div class="arrow arrow-right materialSymbolsOutlined" :class="{ hidden: currentPageCount === totalPageCount }" @click.stop="togglePage(1)">chevron_right</div>
                </div>
                <div>Page {{ currentPage }} of {{ totalPageCount }}</div>
            </div>
            <div class="viewer-container">
                <button @click="closePdf" v-if="fileUrl" class="materialSymbolsOutlined">close</button>
                <div v-if="fileUrl" class="viewerWrapper">
                    <div class="viewer">
                        <ClientOnly>
                            <PDFViewer v-if="viewPdfFile" :fileUrl="fileUrl" :pageNumber="currentPage" :fileType="'application/pdf'" />
                        </ClientOnly>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import useLAData from "~/composables/useLAData"
    import exportExcel from "~/util/exportExcel"

    definePageMeta({
        layout: "land-advisors-dashboard",
        middleware: ["auth"],
    })

    onBeforeMount(async () => {
        if (!dataStore.isDataLoaded) {
            await useLAData().getGoogleSheetsData()
        }
    })

    onMounted(() => {
        document.addEventListener("click", handleWordClick)
    })

    onUnmounted(() => {
        document.removeEventListener("click", handleWordClick)
        clearTimeout(debounceTimer)
    })

    const dataStore = useLADataStore()

    const fileUrl = ref("")
    const currentPage = ref(1)
    const viewPdfFile = ref(false)
    const selectedCities = ref([])
    const isCityDropdownVisible = ref(false)
    const searchTerm = ref("")
    const selectedMatches = ref(true)
    let debounceTimer: any = null
    const sortIndex = ref(true)
    const sortCount = ref(true)
    const sortAscending = ref(true)
    const sortByIndex = ref(false)
    const sortByCount = ref(false)
    const sortByCreated = ref(false)
    const isArchive = ref(false)
    const currentPageCount = ref(0)
    const totalPageCount = computed(() => {
        return Math.floor(dataStore.rows.length / 20) - 1
    })
    const archivedOrCleared = reactive<IArchiveState>({})
    const undoButtonVisibility = reactive<IArchiveState>({})
    const rowVisibility = reactive<IArchiveState>({})
    const undoClicked = reactive<IArchiveState>({})
    const buttonClicked = reactive<IButtonClickedState>({
        archive: {},
        clear: {},
    })

    const toggleIndexSort = () => {
        sortIndex.value = !sortIndex.value
        sortByIndex.value = !sortByIndex.value
    }
    const toggleCountSort = () => {
        sortCount.value = !sortCount.value
        sortByCount.value = !sortByCount.value
    }
    const toggleCreatedSort = () => {
        sortAscending.value = !sortAscending.value
        sortByCreated.value = !sortByCreated.value
    }
    const filteredCities = computed(() => {
        let result = dataStore.rows.filter((file) => {
            // Filter based on selected cities
            let cityFilter
            if (selectedCities.value.includes("All Cities") || selectedCities.value.length === 0) {
                cityFilter = true // No city filter applied if 'All Cities' is selected or if no city is selected
            } else {
                cityFilter = selectedCities.value.includes(file.City)
            }

            // Ensure Match_Count is treated as a number for comparison
            let matchCount = parseInt(file.Match_Count, 10)

            // Filter out files with Match_Count of 0 if selectedMatches is true
            let matchFilter = !selectedMatches.value || matchCount !== 0

            return cityFilter && matchFilter
        })

        result.sort((a, b) => {
            return new Date(a.Created_At) - new Date(b.Created_At)
        })

        if (sortByCreated.value) {
            result.sort((a, b) => {
                const dateA = new Date(a.Created_At)
                const dateB = new Date(b.Created_At)
                return sortAscending.value ? dateA - dateB : dateB - dateA
            })
        }
        if (sortByCount.value) {
            result.sort((a, b) => {
                let countA = parseInt(a.Match_Count, 10),
                    countB = parseInt(b.Match_Count, 10)
                return sortCount.value ? countA - countB : countB - countA
            })
        }

        if (sortByIndex.value) {
            result.sort((a, b) => {
                return sortIndex.value ? a.City.localeCompare(b.City) : b.City.localeCompare(a.City)
            })
        }

        //return 20 rows
        const start = currentPageCount.value * 20
        const end = currentPageCount.value * 20 + 20
        return result.slice(start, end)
    })
    const isSelected = (city) => {
        return selectedCities.value.includes(city)
    }
    const toggleCity = (city) => {
        const index = selectedCities.value.indexOf(city)
        if (index > -1) {
            selectedCities.value.splice(index, 1) // Remove if already selected
        } else {
            selectedCities.value.push(city) // Add if not already selected
        }
    }

    const toggleCityDropdown = () => {
        isCityDropdownVisible.value = !isCityDropdownVisible.value
    }
    const memoizeProcessText = (() => {
        const cache = {}
        return (key, fn) => {
            return (...args) => {
                const cacheKey = JSON.stringify(args)
                if (!cache[cacheKey]) {
                    cache[cacheKey] = fn(...args)
                }
                return cache[cacheKey]
            }
        }
    })()
    const processTextOptimized = (text: string, highlightedUrl: string, pages = "", matches = "") => {
        // Fallback for undefined inputs
        let matchesArray = (typeof matches === "string" ? matches.split(",") : matches || []).map((item) => item.trim().toLowerCase())
        let pagesArray = (typeof pages === "string" ? pages.split(",") : pages || []).map((item) => item.trim())

        // Preparing a map for faster lookup
        let matchesMap = new Map()
        matchesArray.forEach((match, index) => {
            matchesMap.set(match, { url: highlightedUrl, page: pagesArray[index] })
        })

        let processedText = ""
        const chunks = text.split(/(\W+)/).filter(Boolean) // Remove empty strings from array

        let skipNext = 0
        chunks.forEach((chunk, index) => {
            if (skipNext > 0) {
                skipNext--
                return
            }

            let lowerChunk = chunk.toLowerCase()
            if (matchesMap.has(lowerChunk)) {
                const { url, page } = matchesMap.get(lowerChunk)
                processedText += `<span class="highlighted-match" data-url="${url}" data-scroll-to-id="${lowerChunk}" data-pages="${page}">${chunk}</span>`
                skipNext = index % 2 === 0 ? 2 : 1 // Adjust skip logic based on chunk position
            } else {
                processedText += chunk
            }
        })

        // Handle periods and short words without using RegExp for performance
        processedText = handlePeriodsAndShortWords(processedText)

        return processedText
    }
    function handlePeriodsAndShortWords(processedText: string) {
        // Simplified implementation; adjust as needed
        return processedText.replace(/\.\s*/g, ".<br><br>")
    }

    const viewPdf = (url: string, page = 1) => {
        fileUrl.value = url
        currentPage.value = page
        viewPdfFile.value = true
        setTimeout(() => {
            const viewer = document.querySelector(".viewer")
            viewer?.scrollIntoView({
                behavior: "smooth",
                block: "end",
            })
        }, 2000)
    }
    const closePdf = () => {
        viewPdfFile.value = false
        currentPage.value = 1
        fileUrl.value = ""
    }

    const handleWordClick = (e) => {
        clearTimeout(debounceTimer)

        debounceTimer = setTimeout(() => {
            let target = e.target

            while (target && target !== e.currentTarget) {
                if (target.classList.contains("highlighted-match")) {
                    let url = target.getAttribute("data-url")
                    let pages = target.getAttribute("data-pages")
                    let pageNumber = 1
                    if (url) {
                        url = url.replace(/<br><br>/g, "")
                        if (pages) {
                            if (url.includes("Arcadia") || url.includes("Azusa") || url.includes("Duarte") || url.includes("El%20Monte")) {
                                pageNumber = pages
                            } else {
                                let pageNum = parseInt(pages, 10) + 1
                                pageNumber = pageNum
                            }
                        }
                        console.log(url, pageNumber)
                        viewPdf(url, pageNumber)
                    }
                    break
                }
                target = target.parentElement
            }
        }, 300)
    }
    const memoizedProcessText = memoizeProcessText("processTextOptimized", processTextOptimized)
    const archive = (file: any) => {
        if (archivedOrCleared[file.URL]) {
            return
        }

        buttonClicked.archive[file.URL] = true
        archivedOrCleared[file.URL] = true
        undoButtonVisibility[file.URL] = true
        undoClicked[file.URL] = false

        setTimeout(() => {
            if (!undoClicked[file.URL]) {
                buttonClicked.archive[file.URL] = false
                undoButtonVisibility[file.URL] = false
                rowVisibility[file.URL] = false
            }
        }, 2000)
    }
    const clear = (file: any) => {
        if (archivedOrCleared[file.URL]) {
            return
        }

        buttonClicked.clear[file.URL] = true
        archivedOrCleared[file.URL] = true
        undoButtonVisibility[file.URL] = true
        undoClicked[file.URL] = false

        setTimeout(() => {
            if (!undoClicked[file.URL]) {
                buttonClicked.clear[file.URL] = false
                undoButtonVisibility[file.URL] = false
                rowVisibility[file.URL] = false
            }
        }, 3000)
    }

    const undo = (file: any) => {
        undoClicked[file.URL] = true
        undoButtonVisibility[file.URL] = false
        rowVisibility[file.URL] = true
        delete archivedOrCleared[file.URL]
    }

    const showArchived = () => {
        Object.keys(rowVisibility).forEach((key) => {
            if (archivedOrCleared[key]) {
                rowVisibility[key] = isArchive.value ? false : true
            } else {
                rowVisibility[key] = true
            }
        })
        isArchive.value = !isArchive.value
    }
    const exportToExcel = () => {
        if (!filteredCities.value || filteredCities.value.length === 0) {
            alert("No data to export.")
            return
        }
        const selectedCities = filteredCities.value.filter((city) => city.Selected)

        const processedData = selectedCities.map((file) => ({
            "Property Name": "",
            Status: "",
            "Property Owner": "",
            "Gross Acres": "",
            "Product Type": "",
            "Site Conditions": "",
            "Entitlement Status": "",
            "Site Location": "",
            "Site City": file.City,
            "Site Zip Code": "",
            "Site Country": "Los Angeles",
            "Site State": "CA",
            Latitude: "",
            Longitude: "",
            APN: "",
            Comment: file.comment,
        }))
        exportExcel(processedData)
    }
    const togglePage = (page: number) => {
        currentPageCount.value += page
    }
</script>

<style scoped>
    .pageWrapper {
        display: flex;
        flex-direction: column;
        flex: 1;
        justify-content: center;
        align-items: center;
        color: var(--textColor);
    }
    .contentWrapper {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        overflow-y: scroll;
        overflow-x: hidden;
        width: 100%;
    }
    .pageTitle {
        font-size: 30px;
        font-weight: 700;
        margin-top: 20px;
        margin-bottom: 20px;
    }
    .report {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 20px;
        width: 100%;
    }
    .filterContainer {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 10px;
    }
    .table {
        width: 100%; /* Adjusted to fill the container */
        max-height: 70vh; /* Adjusted maximum height for responsiveness */
        overflow-y: auto; /* Added to enable vertical scrolling if needed */
        overflow-x: hidden;
        border-bottom: 2px solid var(--strokeColorLA);
    }
    .tableContainer {
        width: 95%;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        color: white;
        color: var(--textColor);

        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        margin-bottom: 0;
    }

    th,
    td {
        padding: 15px; /* Adjusted padding for better spacing */
        white-space: nowrap; /* Prevent wrapping */
        max-width: 30vw;
    }

    th:first-child,
    td:first-child {
        border-top-left-radius: 10px;
    }

    th:last-child,
    td:last-child {
        border-top-right-radius: 10px;
    }

    th {
        text-align: center;
        background-color: var(--strokeColorLA);
        color: var(--primaryColor);
        position: sticky;
        top: 0;
        cursor: pointer;
    }

    tbody td:not(:last-child) {
        border-right: 1px solid;
    }

    tbody td {
        padding: 10px; /* Adjusted padding for better spacing */
        border-bottom: 1px solid;
    }

    button {
        padding: 8px 16px;
        margin: 4px;
        border: none;
        border-radius: 4px;
        color: white;
        background-color: #3a7bfd;
        cursor: pointer;
    }

    .preview-head {
        width: auto;
        max-width: 30vw;
    }
    .preview {
        height: 200px;
        width: auto;
        max-width: 30vw;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-y: scroll;
    }
    .link-text {
        text-decoration: underline;
        cursor: pointer;
        color: var(--textColor);
    }
    .viewer-container {
        margin-top: 50px;
        margin-left: 5%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
    }
    .viewerWrapper {
        display: flex;
        width: 100%;
        justify-content: flex-start;
    }
    .viewer {
        display: flex;
        flex-direction: row;
        padding: 20px;
        align-items: flex-start;
        background-color: var(--midGrey);
        border: 1px solid var(--strokeColor);
        border-radius: 10px;
    }
    .link {
        list-style-type: none;
    }
    :deep(.preview .highlighted-match) {
        color: var(--highlightColor);
        font-weight: bold;
        cursor: pointer;
    }
    .checkbox-select {
        text-align: center;
    }
    .custom-select {
        border: 1px solid #ccc;
        min-width: 150px;
        position: relative;
        cursor: pointer;
        width: auto;
    }

    .custom-select .select-display {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px;
        background-color: var(--sideBarBackgroundColor);
        border-bottom: 1px solid #eee;
        font-size: 16px;
        user-select: none;
    }

    .custom-select .dropdown {
        position: absolute;
        width: 100%;
        z-index: 1000;
        background: var(--sideBarBackgroundColor);
        border: 1px solid #ccc;
    }

    .custom-select .search-input {
        width: 75%;
        padding: 8px;
        margin: 8px;
        border: 1px solid #ccc;
    }

    .custom-select ul {
        list-style: none;
        padding: 0;
        margin: 0;
        max-height: 200px;
        overflow-y: auto;
    }

    .custom-select li {
        padding: 8px;
        font-size: 16px;
    }

    .custom-select li:hover {
        background-color: var(--backgroundColor);
    }

    .custom-select span {
        color: #2844a4;
        margin-left: 10px;
    }
    .link-ul {
        padding: 0;
    }
    .action-button-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }
    .action-button {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 5px 10px;
        gap: 5px;
        width: 70px;
        border: 1px solid var(--strokeColor);
        border-radius: 10px;
    }
    .action-button-text {
        color: var(--textColor);
        text-align: center;
    }
    .action-button-clicked {
        background-color: var(--strokeColor);
    }
    .action-button:hover {
        background-color: var(--strokeColor);
        cursor: pointer;
    }
    .actionButtons {
        display: flex;
        justify-content: end;
        margin-right: 10px;
    }
    .text-comment {
        outline: none;
        border: none;
        background-color: var(--primaryColor);
    }
    .arrow-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-top: 10px;
    }
    .arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--strokeColorLA);
        cursor: pointer;
        border-radius: 50%;
        color: var(--primaryColor);
        padding: 10px;
        position: relative;
        top: -50px;
    }
    .arrow-right {
        left: -10px;
    }
    .arrow.hidden {
        visibility: hidden;
    }
</style>
