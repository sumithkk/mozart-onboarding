<template>
    <div class="border-strokeColor bg-sideBarBackgroundColor rounded-2xl border p-6 shadow-sm">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="bg-logoColor flex h-8 w-8 items-center justify-center rounded-lg">
                    <span class="materialSymbolsFilled text-white text-lg">donut_large</span>
                </div>
                <h3 class="text-textColor text-lg font-bold">{{ getChartTitle() }}</h3>
            </div>

            <!-- View Type Dropdown -->
            <div class="relative">
                <select v-model="selectedView" @change="updateChartData" class="border-strokeColor bg-surfaceColor text-textColor hover:border-strokeColor2 focus:border-logoColor focus:ring-logoColor cursor-pointer appearance-none rounded-lg border px-4 py-2 pr-8 text-sm transition-colors duration-200 focus:ring-1 focus:outline-none">
                    <option value="provider">By Provider</option>
                    <option value="model">By Model</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span class="materialSymbolsOutlined text-textColorSecondary text-sm">expand_more</span>
                </div>
            </div>
        </div>

        <!-- Skeleton Loader Component -->
        <DonutSkeleton v-if="loading" :legend-items="6" :show-summary="true" chart-height="h-80" />

        <!-- Chart Container -->
        <div v-if="!loading && currentChartData.length > 0">
            <div ref="chartContainer" class="mb-6 h-[280px] w-full md:h-60" style="min-height: 320px"></div>

            <!-- Enhanced Custom Legend -->
            <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div v-for="(item, index) in currentChartData" :key="`${selectedView}-${index}`" class="hover:bg-surfaceColor flex items-center gap-2 rounded-lg p-2 transition-colors duration-200">
                    <div class="h-4 w-4 flex-shrink-0 rounded-sm" :style="{ backgroundColor: getItemColor(item.name, index) }"></div>
                    <div class="min-w-0 flex-1">
                        <span class="text-textColor block truncate text-sm font-medium" :title="item.name">{{ item.name }}</span>
                        <div class="text-textColorSecondary flex items-center gap-1 text-xs">
                            <span>{{ formatNumber((item.cost * 100) / apiData.summary.totalCost) }}%</span>
                            <span class="text-strokeColor">•</span>
                            <span>${{ formatNumber(item.cost) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Stats -->
            <div v-if="apiData?.summary" class="border-strokeColor mt-6 border-t pt-4">
                <div class="flex justify-evenly gap-2">
                    <div class="text-center">
                        <div class="text-textColor text-lg font-bold">{{ formatNumber(apiData.summary.totalTokens) }}</div>
                        <div class="text-textColorSecondary text-xs">Total Tokens</div>
                    </div>
                    <div class="text-center">
                        <div class="text-Mgreen text-lg font-bold">${{ formatNumber(apiData.summary.totalCost) }}</div>
                        <div class="text-textColorSecondary text-xs">Total Cost</div>
                    </div>
                    <!-- <div class="text-center">
                        <div class="text-lg font-bold text-logoColor">{{ apiData.summary.totalConversations }}</div>
                        <div class="text-xs text-textColorSecondary">Conversations</div>
                    </div> -->
                </div>
            </div>
        </div>

        <!-- Fallback -->
        <div v-if="!loading && currentChartData.length === 0" class="py-8 text-center">
            <div class="bg-strokeColor mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full">
                <span class="materialSymbolsOutlined text-unselectedColor text-2xl">chat_bubble_outline</span>
            </div>
            <p class="text-textColorSecondary mb-1 text-sm font-medium">No conversation data available</p>
            <p class="text-textColorSecondary text-xs">Try selecting a different time period</p>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, onUnmounted, nextTick, watch, computed } from "vue"
    import * as echarts from "echarts"
    import useAnalytics from "~/composables/useAnalytics"
    import { colors, providerColors, providerMap } from "~/util"
    import formatNumber from "@/util/formatNumber"

    const { useChartTypeDistribution } = useAnalytics()

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
    const selectedView = ref("provider")
    const apiData = ref(null)
    const chartContainer = ref(null)
    let chartInstance = null
    let themeObserver = null
    const mounted = ref(false)

    // Computed property for current chart data
    const currentChartData = computed(() => {
        if (!apiData.value) return []
        return selectedView.value === "provider" ? apiData.value.providerWiseResult : apiData.value.modelWiseResult
    })

    const generateModelColor = (modelName, index) => {
        // Extract provider from model name for consistency

        for (const [key, provider] of Object.entries(providerMap)) {
            if (modelName.toLowerCase().includes(key)) {
                return providerColors[provider] || generateFallbackColor(index)
            }
        }

        return generateFallbackColor(index)
    }

    const generateFallbackColor = (index) => {
        return colors[index % colors.length]
    }

    const getItemColor = (name, index) => {
        if (selectedView.value === "provider") {
            return providerColors[name] || generateFallbackColor(index)
        } else {
            return generateModelColor(name, index)
        }
    }

    const getChartTitle = () => {
        const baseTitle = selectedView.value === "provider" ? "Provider Distribution" : "Model Distribution"
        return baseTitle
    }

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
    })

    // Chart configuration
    const getChartOption = () => {
        const colors = getThemeColors()

        return {
            backgroundColor: "transparent",
            tooltip: {
                trigger: "item",
                backgroundColor: colors.backgroundColor,
                borderColor: colors.strokeColor,
                borderWidth: 1,
                textStyle: {
                    color: colors.textColor,
                    fontFamily: '"Helvetica Neue Regular", "Helvetica Neue", Arial, sans-serif',
                },
                formatter: (params) => {
                    const dataItem = currentChartData.value.find((item) => item.name === params.name)

                    return `
                        <div style="padding: 12px; min-width: 200px;">
                            <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${params.name}</div>
                            
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                <div style="width: 8px; height: 8px; background-color: ${params.color}; border-radius: 50%;"></div>
                                <span style="font-size: 13px;">Usage: ${formatNumber((params.value * 100) / apiData.value.summary.totalCost)}%</span>
                            </div>
                            
                            <div style="border-top: 1px solid ${colors.strokeColor}; margin: 8px 0; opacity: 0.3;"></div>
                            
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: ${colors.textColorSecondary}; font-size: 12px;">Tokens:</span>
                                <span style="font-weight: 500; font-size: 12px;">${formatNumber(dataItem?.tokens || 0)}</span>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: ${colors.textColorSecondary}; font-size: 12px;">Cost:</span>
                                <span style="font-weight: 500; font-size: 12px; color: #10b981;">$${dataItem?.cost ? formatNumber(dataItem?.cost) : "0.00"}</span>
                            </div>
                        </div>
                    `
                },
                extraCssText: "border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);",
            },
            legend: {
                show: false,
            },
            series: [
                {
                    name: selectedView.value === "provider" ? "Providers" : "Models",
                    type: "pie",
                    radius: ["45%", "75%"],
                    center: ["50%", "50%"],
                    data: currentChartData.value.map((item, index) => ({
                        value: item.cost,
                        name: item.name,
                        tokens: item.tokens,
                        cost: item.cost,
                        itemStyle: {
                            color: getItemColor(item.name, index),
                            borderWidth: 2,
                            borderColor: colors.backgroundColor,
                        },
                    })),
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 15,
                            shadowOffsetX: 0,
                            shadowColor: "rgba(0, 0, 0, 0.3)",
                            scale: 1.08,
                            borderWidth: 3,
                        },
                    },
                    labelLine: {
                        show: false,
                    },
                    label: {
                        show: false,
                    },
                    animationType: "scale",
                    animationEasing: "elasticOut",
                    animationDelay: (idx) => Math.random() * 200,
                },
            ],
            animation: true,
            animationDuration: 1000,
        }
    }

    // Initialize chart
    const initChart = () => {
        if (chartInstance) {
            chartInstance.dispose()
            chartInstance = null
        }
        if (chartContainer.value && !chartInstance && currentChartData.value.length > 0) {
            chartInstance = echarts.init(chartContainer.value)
            chartInstance.setOption(getChartOption())

            // Handle resize
            const resizeObserver = new ResizeObserver(() => {
                if (chartInstance) {
                    chartInstance.resize()
                }
            })
            resizeObserver.observe(chartContainer.value)
        }
    }

    // Update chart theme
    const updateChartTheme = () => {
        if (chartInstance && currentChartData.value.length > 0) {
            chartInstance.setOption(getChartOption(), true)
        }
    }

    // Update chart data when view changes
    const updateChartData = () => {
        if (chartInstance && currentChartData.value.length > 0) {
            chartInstance.setOption(getChartOption(), true)
        }
    }

    // Watch for theme changes
    const themeWatcher = () => {
        if (process.client) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
                        nextTick(() => {
                            updateChartTheme()
                        })
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

    // Watch for loading to become false and then initialize chart
    watch(loading, (newVal) => {
        if (newVal === false) {
            nextTick(() => {
                initChart()
            })
        }
    })

    // Watch for data changes
    watch(currentChartData, () => {
        nextTick(() => {
            if (chartInstance) {
                updateChartData()
            } else if (!loading.value) {
                initChart()
            }
        })
    })

    watch([() => props.selectedFilters.dateRangeFilter, () => props.selectedFilters.modelFilter, () => props.selectedFilters.userFilter], ([dateRange, model, userType]) => {
        fetchDistributionData(dateRange.toLowerCase(), model, userType)
    })

    onMounted(() => {
        mounted.value = true
        const dateRange = props.selectedFilters.dateRangeFilter.toLowerCase()
        const model = props.selectedFilters.modelFilter
        const userType = props.selectedFilters.userFilter
        fetchDistributionData(dateRange, model, userType)
        nextTick(() => {
            themeObserver = themeWatcher()
        })
    })

    onUnmounted(() => {
        if (chartInstance) {
            chartInstance.dispose()
            chartInstance = null
        }
        if (themeObserver) {
            themeObserver.disconnect()
        }
    })

    // Handle window resize
    if (process.client) {
        window.addEventListener("resize", () => {
            if (chartInstance) {
                chartInstance.resize()
            }
        })
    }

    const fetchDistributionData = async (dateRange, model, userType) => {
        loading.value = true

        try {
            let userId = ""
            if (userType !== "me" && userType !== "all") {
                userId = userType
                userType = "individual"
            }
            const response = await useChartTypeDistribution(dateRange, model, userType, userId)

            const isValidResponse = response.status === "success" && response?.data

            apiData.value = isValidResponse
                ? response.data
                : {
                      providerWiseResult: [],
                      modelWiseResult: [],
                      summary: {
                          totalTokens: 0,
                          totalCost: 0.0,
                          totalConversations: 0,
                      },
                  }

            if (!isValidResponse) {
                console.warn("Unexpected response format:", response)
                throw new Error(response?.message || "Failed to load monthly usage.")
            }

            if (chartInstance) {
                chartInstance.setOption(getChartOption(), true)
            }
        } catch (error) {
            console.error("Failed to load distribution data:", error)
            apiData.value = null
        } finally {
            loading.value = false
        }
    }
</script>

<style scoped>
    select::-ms-expand {
        display: none;
    }

    .focus\:ring-1:focus {
        box-shadow: 0 0 0 1px var(--logoColor);
    }
</style>
