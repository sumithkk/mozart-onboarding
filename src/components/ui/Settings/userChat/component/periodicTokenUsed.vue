<template>
    <div class="border-strokeColor bg-sideBarBackgroundColor rounded-2xl border p-6 shadow-sm">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
            <div class="mb-6 flex items-center gap-3">
                <span class="material-icons text-logoColor text-xl">📊</span>
                <h3 class="text-textColor text-lg font-bold">Token Usage Over Time</h3>
            </div>

            <!-- Filter Dropdown -->
            <!-- <BaseChartDropDown v-model="selectedFilter" :options="filterOptions" /> -->
        </div>

        <!-- Legend -->
        <div v-if="loading || chartData.length > 0" class="mb-6 flex items-center gap-2">
            <div class="flex items-center gap-2">
                <div class="bg-strokeChart h-2 w-4 rounded-[2px] opacity-80"></div>
                <span class="text-textColorSecondary text-sm">Tokens Used</span>
            </div>
        </div>

        <!-- Skeleton Loader Component -->
        <ChartSkeleton v-if="loading" />

        <!-- Chart Container -->
        <div v-if="!loading && chartData.length > 0" ref="chartContainer" class="h-80 w-full" style="min-height: 320px"></div>

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
    const chartData = ref([])
    let chartInstance = null
    let themeObserver = null
    let resizeObserver = null

    const chartContainer = ref(null)

    // Get CSS custom properties
    const getCSSVariable = (variable) => {
        if (process.client) {
            return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
        }
        return ""
    }

    // Theme-aware colors
    const getThemeColors = () => ({
        backgroundColor: getCSSVariable("--sideBarBackgroundColor") || "#ffffff",
        textColor: getCSSVariable("--textColor") || "#0D0D0D",
        textColorSecondary: getCSSVariable("--textColorSecondary") || "#5e5e5e",
        strokeColor: getCSSVariable("--strokeColor") || "#cacaca",
        highlightColor: getCSSVariable("--strokeChart") || "#3d67f9",
        gridColor: getCSSVariable("--strokeColor") || "#cacaca",
    })

    // Chart configuration as computed property
    const chartOption = computed(() => {
        const colors = getThemeColors()
        const maxTokens = Math.max(...chartData.value.map((item) => item.tokens))
        const yAxisMax = getYAxisHeight(maxTokens)
        const interval = yAxisMax / 5
        return {
            backgroundColor: "transparent",
            grid: {
                left: "60px",
                right: "40px",
                top: "20px",
                bottom: "60px",
                containLabel: false,
            },
            xAxis: {
                type: "category",
                data: chartData.value.map((item) => item.period),
                axisLine: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    color: colors.textColorSecondary,
                    fontSize: 12,
                    fontFamily: '"Helvetica Neue Regular", "Helvetica Neue", Arial, sans-serif',
                    margin: 15,
                },
                splitLine: {
                    show: false,
                },
            },
            yAxis: {
                type: "value",
                min: 0,
                max: yAxisMax,
                interval: interval,
                axisLine: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    color: colors.textColorSecondary,
                    fontSize: 12,
                    fontFamily: '"Helvetica Neue Regular", "Helvetica Neue", Arial, sans-serif',
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
            series: [
                {
                    name: "Tokens Used",
                    type: "line",
                    data: chartData.value.map((item) => item.tokens),
                    smooth: true,
                    symbol: "circle",
                    symbolSize: 8,
                    lineStyle: {
                        color: colors.highlightColor,
                        width: 3,
                    },
                    itemStyle: {
                        color: colors.highlightColor,
                        borderColor: "#ffffff",
                        borderWidth: 2,
                    },
                    areaStyle: {
                        color: {
                            type: "linear",
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: colors.highlightColor + "20", // 20% opacity
                                },
                                {
                                    offset: 1,
                                    color: colors.highlightColor + "05", // 5% opacity
                                },
                            ],
                        },
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: colors.highlightColor + "40",
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
                    const param = params[0]
                    return `
                    <div style="padding: 8px;">
                        <div style="font-weight: bold; margin-bottom: 4px;">${param.name}</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 10px; height: 10px; background-color: ${colors.highlightColor}; border-radius: 50%;"></div>
                            <span>Tokens Used: ${formatNumber(param.value)}</span>
                        </div>
                    </div>
                    `
                },
                extraCssText: "border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);",
            },
            animation: true,
            animationDuration: 1000,
            animationEasing: "cubicOut",
        }
    })

    // Initialize chart
    const initChart = () => {
        if (!process.client || !chartContainer.value) return

        // Dispose existing chart if it exists
        if (chartInstance) {
            chartInstance.dispose()
            chartInstance = null
        }

        // Clean up existing resize observer
        if (resizeObserver) {
            resizeObserver.disconnect()
            resizeObserver = null
        }

        // Create new chart instance
        chartInstance = echarts.init(chartContainer.value)
        chartInstance.setOption(chartOption.value)

        // Setup resize observer
        resizeObserver = new ResizeObserver(() => {
            if (chartInstance) {
                chartInstance.resize()
            }
        })
        resizeObserver.observe(chartContainer.value)

        // Setup window resize listener
        const handleResize = () => {
            if (chartInstance) {
                chartInstance.resize()
            }
        }
        window.addEventListener("resize", handleResize)

        // Store cleanup function
        chartInstance._cleanup = () => {
            window.removeEventListener("resize", handleResize)
            if (resizeObserver) {
                resizeObserver.disconnect()
                resizeObserver = null
            }
        }
    }

    // Update chart
    const updateChart = () => {
        if (chartInstance && chartData.value.length > 0) {
            chartInstance.setOption(chartOption.value, true)
        }
    }

    // Watch for theme changes
    const setupThemeWatcher = () => {
        if (process.client) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
                        nextTick(() => updateChart())
                    }
                })
            })

            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ["data-theme"],
            })

            return observer
        }
        return null
    }

    // Fetch usage data
    const fetchUsageData = async (dateRange, mode, userType) => {
        loading.value = true

        try {
            let userId = ""
            if (userType !== "me" && userType !== "all") {
                userId = userType
                userType = "individual"
            }
            const response = await useperiodicUsage(dateRange, mode, userType, userId)

            const isValidResponse = response.status === "success" && Array.isArray(response?.data?.periodicData)

            chartData.value = isValidResponse ? response.data.periodicData : []

            if (!isValidResponse) {
                console.warn("Unexpected response format:", response)
                throw new Error(response?.message || "Failed to load usage data.")
            }
        } catch (error) {
            console.error("Failed to load usage data:", error)
            chartData.value = []
        } finally {
            loading.value = false
        }
    }

    // Watch for chart data changes and update chart
    watch(
        chartData,
        () => {
            if (!loading.value && chartInstance) {
                nextTick(() => updateChart())
            }
        },
        { deep: true }
    )

    // Watch for loading to become false and then initialize chart
    watch(loading, (newVal) => {
        if (!newVal) {
            nextTick(() => {
                if (chartData.value.length > 0) {
                    initChart()
                }
            })
        }
    })

    // Watch for filter changes
    watch([() => props.selectedFilters.dateRangeFilter, () => props.selectedFilters.modelFilter, () => props.selectedFilters.userFilter], ([dateRange, model, userType]) => {
        fetchUsageData(dateRange.toLowerCase(), model, userType)
    })

    onMounted(() => {
        nextTick(() => {
            const dateRange = props.selectedFilters.dateRangeFilter.toLowerCase()
            const model = props.selectedFilters.modelFilter
            const userType = props.selectedFilters.userFilter
            fetchUsageData(dateRange, model, userType)
            themeObserver = setupThemeWatcher()
        })
    })

    onUnmounted(() => {
        if (chartInstance) {
            if (chartInstance._cleanup) {
                chartInstance._cleanup()
            }
            chartInstance.dispose()
            chartInstance = null
        }

        if (themeObserver) {
            themeObserver.disconnect()
        }

        if (resizeObserver) {
            resizeObserver.disconnect()
        }
    })
</script>
