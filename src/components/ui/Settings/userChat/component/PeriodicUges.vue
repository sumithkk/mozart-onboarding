<template>
    <div class="border-strokeColor bg-sideBarBackgroundColor rounded-2xl border p-6 shadow-sm">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
            <div class="mb-6 flex items-center gap-3">
                <span class="material-icons text-logoColor text-xl">📊</span>
                <h3 class="text-textColor text-lg font-bold">{{ chartTitle }}</h3>
            </div>

            <!-- Filter Dropdown -->
            <!-- <BaseChartDropDown v-model="selectedFilter" :options="filterOptions" /> -->
        </div>

        <!-- Legend -->
        <div v-if="loading || chartData.length > 0" class="mb-6 flex items-center gap-6">
            <div class="flex items-center gap-2">
                <div class="bg-strokeChart h-2 w-4 rounded-[2px] opacity-80"></div>
                <span class="text-textColorSecondary text-sm">Tokens</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="bg-strokeChart2 h-2 w-4 rounded-[2px] opacity-80"></div>
                <span class="text-textColorSecondary text-sm">Cost ($)</span>
            </div>
        </div>

        <!-- Skeleton Loader Component -->
        <ChartSkeleton v-if="loading" />

        <!-- Chart Container -->
        <div v-if="!loading && chartData.length > 0" ref="chartContainer" class="mb-6 h-[280px] w-full md:h-60" style="min-height: 320px"></div>

        <!-- Fallback -->
        <div v-if="!loading && chartData.length === 0" class="py-8 text-center">
            <div class="bg-strokeColor mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full">
                <span class="materialSymbolsOutlined text-unselectedColor text-2xl">chat_bubble_outline</span>
            </div>
            <p class="text-textColorSecondary mb-1 text-sm font-medium">No conversation data available</p>
            <p class="text-textColorSecondary text-xs">Try selecting a different time period</p>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue"
    import * as echarts from "echarts"
    import useAnalytics from "~/composables/useAnalytics"
    import formatNumber from "@/util/formatNumber"
    import { getYAxisHeight } from "@/util/getYaxisHeight"

    const { useperiodicUsage } = useAnalytics()

    const props = defineProps({
        selectedFilters: {
            dateRangeFilter: String,
            modelFilter: String,
            userFilter: String,
            organizationFilter: String,
            compareToFilter: String,
        },
    })

    const loading = ref(false)
    const chartTitle = ref("Montly Comparison")
    const chartData = ref([])
    let chartInstance = null
    let themeObserver = null
    let resizeObserver = null

    const chartContainer = ref(null)

    // Get CSS variable
    const getCSSVariable = (variable) => {
        if (process.client) {
            return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
        }
        return ""
    }

    // Theme color set
    const getThemeColors = () => ({
        backgroundColor: getCSSVariable("--sideBarBackgroundColor") || "#ffffff",
        textColor: getCSSVariable("--textColor") || "#0D0D0D",
        textColorSecondary: getCSSVariable("--textColorSecondary") || "#5e5e5e",
        strokeColor: getCSSVariable("--strokeColor") || "#cacaca",
        highlightColor: getCSSVariable("--strokeChart") || "#3d67f9",
        costColor: getCSSVariable("--strokeChart2") || "#a855f7",
        gridColor: getCSSVariable("--strokeColor") || "#cacaca",
    })

    // Chart options
    const chartOption = computed(() => {
        const colors = getThemeColors()
        const maxTokens = Math.max(...chartData.value.map((item) => item.tokens))
        const yAxisMax = getYAxisHeight(maxTokens)
        const interval = yAxisMax / 5

        const maxCost = Math.max(...chartData.value.map((item) => item.cost))
        const yAxisMaxCost = getYAxisHeight(maxCost)
        const intervalCost = yAxisMaxCost / 5

        return {
            backgroundColor: "transparent",
            grid: {
                left: "70px",
                right: "70px",
                top: "20px",
                bottom: "60px",
                containLabel: false,
            },
            xAxis: {
                type: "category",
                data: chartData.value.map((item) => item.period.split(" ")[0]),
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: colors.textColorSecondary,
                    fontSize: 12,
                    margin: 15,
                },
                splitLine: { show: false },
            },
            yAxis: [
                {
                    type: "value",
                    min: 0,
                    max: yAxisMax,
                    interval: interval,
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: {
                        color: colors.textColorSecondary,
                        fontSize: 11,
                        formatter: (value) => formatNumber(value),
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: colors.gridColor,
                            width: 0.5,
                            opacity: 0.3,
                            type: "solid",
                        },
                    },
                },
                {
                    type: "value",
                    min: 0,
                    max: yAxisMaxCost,
                    interval: intervalCost,
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: {
                        color: colors.textColorSecondary,
                        fontSize: 11,
                        fontFamily: '"Helvetica Neue Regular", "Helvetica Neue", Arial, sans-serif',
                        formatter: (value) => `$${formatNumber(value)}`,
                    },
                    splitLine: { show: false },
                },
            ],
            series: [
                {
                    name: "Tokens",
                    type: "bar",
                    yAxisIndex: 0,
                    data: chartData.value.map((item) => {
                        const randomValue = item.tokens
                        return randomValue
                    }),
                    barWidth: "35%",
                    barGap: "10%",
                    itemStyle: {
                        color: colors.highlightColor,
                        borderRadius: [2, 2, 0, 0],
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: colors.highlightColor + "40",
                        },
                    },
                },
                {
                    name: "Cost ($)",
                    type: "bar",
                    yAxisIndex: 1,
                    data: chartData.value.map((item) => {
                        const randomValue = item.cost
                        return randomValue
                    }),
                    barWidth: "35%",
                    itemStyle: {
                        color: colors.costColor,
                        borderRadius: [2, 2, 0, 0],
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: colors.costColor + "40",
                        },
                    },
                },
            ],
            tooltip: {
                trigger: "axis",
                backgroundColor: colors.backgroundColor,
                borderColor: colors.strokeColor,
                borderWidth: 1,
                textStyle: {
                    color: colors.textColor,
                    fontFamily: '"Helvetica Neue Regular", "Helvetica Neue", Arial, sans-serif',
                },
                formatter: (params) => {
                    const month = params[0].name
                    const tokensData = params.find((p) => p.seriesName === "Tokens")
                    const costData = params.find((p) => p.seriesName === "Cost ($)")
                    return `
                    <div style="padding: 12px; min-width: 160px;">
                        <div style="font-weight: bold; margin-bottom: 8px;">${month}</div>
                        <div style="margin-bottom: 6px;">
                            <span style="color: ${colors.highlightColor};">●</span> Tokens: ${tokensData?.value ? formatNumber(tokensData?.value) : "0"}
                        </div>
                        <div>
                            <span style="color: ${colors.costColor};">●</span> Cost: $${costData?.value ? formatNumber(costData?.value) : "0.00"}
                        </div>
                    </div>
                `
                },
                extraCssText: "border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);",
            },
            animation: true,
            animationDuration: 1000,
            animationEasing: "cubicOut",
            animationDelay: (idx) => idx * 100,
        }
    })

    const initChart = () => {
        if (!process.client || !chartContainer.value) return

        if (chartInstance) chartInstance.dispose()
        chartInstance = echarts.init(chartContainer.value)
        chartInstance.setOption(chartOption.value)

        resizeObserver = new ResizeObserver(() => {
            chartInstance?.resize()
        })
        resizeObserver.observe(chartContainer.value)

        const handleResize = () => chartInstance?.resize()
        window.addEventListener("resize", handleResize)

        chartInstance._cleanup = () => {
            window.removeEventListener("resize", handleResize)
            resizeObserver?.disconnect()
        }
    }

    const updateChart = () => {
        if (chartInstance && chartData.value.length > 0) {
            chartInstance.setOption(chartOption.value, true)
        }
    }

    const setupThemeWatcher = () => {
        if (process.client) {
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.attributeName === "data-theme") {
                        nextTick(() => updateChart())
                    }
                }
            })
            observer.observe(document.documentElement, { attributes: true })
            return observer
        }
        return null
    }

    const fetchUsageData = async (dateRange, model, userType) => {
        loading.value = true
        try {
            let userId = ""
            if (userType !== "me" && userType !== "all") {
                userId = userType
                userType = "individual"
            }
            const response = await useperiodicUsage(dateRange, model, userType, userId)
            const valid = response.status === "success" && Array.isArray(response?.data?.periodicData)
            chartData.value = valid ? response.data.periodicData : []
        } catch (error) {
            console.error("Failed to fetch data:", error)
            chartData.value = []
        } finally {
            loading.value = false
        }
    }

    watch(chartData, () => {
        if (!loading.value && chartInstance && chartData.value.length > 0) {
            nextTick(() => updateChart())
        }
    })

    watch(loading, (newVal) => {
        if (!newVal && chartData.value.length > 0) {
            nextTick(() => initChart())
        }
    })

    watch([() => props.selectedFilters.dateRangeFilter, () => props.selectedFilters.modelFilter, () => props.selectedFilters.userFilter], ([dateRange, model, userType]) => {
        chartTitle.value = `${dateRange}ly Comparison`
        fetchUsageData(dateRange.toLowerCase(), model, userType)
    })

    onMounted(() => {
        const dateRange = props.selectedFilters.dateRangeFilter.toLowerCase()
        const model = props.selectedFilters.modelFilter
        const userType = props.selectedFilters.userFilter
        fetchUsageData(dateRange, model, userType)
        themeObserver = setupThemeWatcher()
    })

    onUnmounted(() => {
        if (chartInstance?._cleanup) chartInstance._cleanup()
        chartInstance?.dispose()
        chartInstance = null

        themeObserver?.disconnect()
        resizeObserver?.disconnect()
    })
</script>
