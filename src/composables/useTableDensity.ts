import { computed, ref, watch } from "vue"

import type { DensityOption } from "@/components/ui/common/TableDensityControls.vue"

export type TableDensity = "small" | "medium" | "large"

export interface TableDensityConfig {
    rowHeight: string
    fontSize: string
    padding: string
    headerHeight: string
    avatarSize: string
    buttonSize: string
    iconSize: string
}

const densityConfigs: Record<TableDensity, TableDensityConfig> = {
    small: {
        rowHeight: "h-8",
        fontSize: "text-xs",
        padding: "px-3 py-1.5",
        headerHeight: "h-10",
        avatarSize: "h-6 w-6",
        buttonSize: "xs",
        iconSize: "size-3",
    },
    medium: {
        rowHeight: "h-10",
        fontSize: "text-sm",
        padding: "px-4 py-2",
        headerHeight: "h-12",
        avatarSize: "h-8 w-8",
        buttonSize: "sm",
        iconSize: "size-4",
    },
    large: {
        rowHeight: "h-12",
        fontSize: "text-base",
        padding: "px-4 py-3",
        headerHeight: "h-14",
        buttonSize: "md",
        avatarSize: "h-10 w-10",
        iconSize: "size-5",
    },
}

export function useTableDensity(initialDensity: TableDensity = "medium") {
    const currentDensity = ref<TableDensity>(initialDensity)

    const config = computed(() => densityConfigs[currentDensity.value])

    const setDensity = (density: TableDensity) => {
        currentDensity.value = density
    }

    const getTableUI = () => {
        const density = config.value
        return {
            thead: `[&_th]:cursor-pointer [&_th]:hover:text-zinc-600 dark:[&_th]:hover:text-gray-300 ${density.headerHeight} bg-tableBgHeader`,
            tbody: `[&_td]:cursor-pointer ${density.rowHeight}`,
            tr: `${density.fontSize}`,
            th: `${density.padding}`,
            td: `${density.padding}`,
        }
    }

    const getAvatarClasses = () => {
        return config.value.avatarSize
    }

    const getButtonSize = () => {
        return config.value.buttonSize
    }

    const getIconSize = () => {
        return config.value.iconSize
    }

    const getTextSize = () => {
        return config.value.fontSize
    }

    const getPadding = () => {
        return config.value.padding
    }

    // Persist density preference to localStorage
    const saveDensityPreference = (density: TableDensity) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("table-density-preference", density)
        }
    }

    const loadDensityPreference = (): TableDensity => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("table-density-preference") as TableDensity
            return saved && ["small", "medium", "large"].includes(saved) ? saved : "medium"
        }
        return "medium"
    }

    // Auto-save density changes
    watch(currentDensity, (newDensity) => {
        saveDensityPreference(newDensity)
    })

    // Load saved preference on initialization
    const initializeDensity = () => {
        const savedDensity = loadDensityPreference()
        setDensity(savedDensity)
    }

    return {
        currentDensity: computed(() => currentDensity.value),
        config,
        setDensity,
        getTableUI,
        getAvatarClasses,
        getButtonSize,
        getIconSize,
        getTextSize,
        getPadding,
        initializeDensity,
        saveDensityPreference,
        loadDensityPreference,
    }
}
