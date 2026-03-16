import { h } from "vue"

// small helper to wrap header/cell content with a min width
export function mw(content: any, minWClass: string) {
    return h("div", { class: `${minWClass} truncate hover:text-zinc-700 dark:hover:text-gray-300` }, content)
}

export const AVATAR_COLORS = Object.freeze(["bg-rose-500", "bg-pink-500", "bg-fuchsia-500", "bg-purple-500", "bg-violet-500", "bg-blue-500", "bg-sky-500", "bg-cyan-500", "bg-teal-500", "bg-emerald-500", "bg-green-500", "bg-lime-500", "bg-yellow-500", "bg-orange-500", "bg-red-500"])

export const COLOR_MAPS = Object.freeze({
    plan: {
        free: "info",
        mozart_individual: "success",
        mozart_team: "primary",
        mozart_enterprise: "success",
        trial: "warning",
        canceled: "error",
    },
    role: {
        basic: "info",
        standard: "primary",
        admin: "warning",
        suspended: "error",
        member: "info",
        owner: "success",
    },
})

// Optimized random color picker
export const getRandomAvatarColor = (() => {
    let lastIndex = -1
    return () => {
        let index
        do {
            index = Math.floor(Math.random() * AVATAR_COLORS.length)
        } while (index === lastIndex && AVATAR_COLORS.length > 1)
        lastIndex = index
        return AVATAR_COLORS[index]
    }
})()

export const getUserFullName = (firstName?: string, lastName?: string): string => {
    return `${firstName || ""} ${lastName || ""}`.trim() || "—"
}

export const getUserInitials = (firstName?: string, lastName?: string): string => {
    const name = [firstName, lastName].filter(Boolean).join(" ") || "User"
    return name
        .split(" ")
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
}

// Optimized sort header component
export const createSortHeader = (title: string, column: any) => {
    const sortDirection = column.getIsSorted()
    return mw(
        h(
            "div",
            {
                class: "flex items-center gap-2 cursor-pointer select-none   hover:text-zinc-700 dark:hover:text-gray-300",
                onClick: () => column.toggleSorting(),
            },
            [
                title,
                h("div", { class: "flex flex-col" }, [
                    h("div", {
                        class: `w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent transition-colors ${sortDirection === "asc" ? "border-b-gray-600" : "border-b-gray-300"}`,
                        style: "border-bottom-color: currentColor; margin-bottom: 1px;",
                    }),
                    h("div", {
                        class: `w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent transition-colors ${sortDirection === "desc" ? "border-t-gray-600" : "border-t-gray-300"}`,
                        style: "border-top-color: currentColor;",
                    }),
                ]),
            ]
        ),
        "min-w-24"
    )
}

export function trimAnyString(input: string, maxLength: number = 25) {
    if (!input || typeof input !== "string") return ""

    const cleaned = input.trim().replace(/\s+/g, " ")

    // If already short enough, return as is
    if (cleaned.length <= maxLength) return cleaned

    // Detect extension (like ".docx")
    const extMatch = cleaned.match(/(\.[^.]+)$/)
    const ext = extMatch ? extMatch[1] : ""

    // Space left for main part
    const allowed = maxLength - ext.length - 3 // 3 for "..."
    const head = cleaned.slice(0, Math.ceil(allowed / 2))
    const tail = cleaned.slice(-Math.floor(allowed / 2))

    return head + "..." + tail + ext
}

export function toPacificDate(timestamp: any): string {
    const date = new Date(timestamp)

    return date.toLocaleDateString("en-US", {
        timeZone: "America/Los_Angeles",
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

export function mimeToExtension(mimeType: string): string {
    if (!mimeType || typeof mimeType !== "string") return ""

    const map: Record<string, string> = {
        // --- Documents ---
        "application/pdf": "pdf",
        "application/msword": "doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "application/vnd.ms-excel": "xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
        "application/vnd.ms-powerpoint": "ppt",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
        "text/plain": "txt",
        "text/csv": "csv",
        "application/rtf": "rtf",
        "application/json": "json",
        "application/xml": "xml",
        "text/html": "html",
        "application/zip": "zip",
        "application/x-7z-compressed": "7z",
        "application/x-rar-compressed": "rar",
        "application/gzip": "gz",

        // --- Images ---
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/bmp": "bmp",
        "image/svg+xml": "svg",
        "image/tiff": "tiff",
        "image/x-icon": "ico",

        // --- Audio ---
        "audio/mpeg": "mp3",
        "audio/wav": "wav",
        "audio/ogg": "ogg",
        "audio/flac": "flac",
        "audio/aac": "aac",

        // --- Video ---
        "video/mp4": "mp4",
        "video/mpeg": "mpeg",
        "video/webm": "webm",
        "video/ogg": "ogv",
        "video/x-msvideo": "avi",
        "video/quicktime": "mov",
        "video/x-matroska": "mkv",
    }

    // Direct mapping
    if (map[mimeType]) return map[mimeType]

    // Fallback → take last part after "/"
    const parts = mimeType.split("/")
    return parts.length > 1 ? parts[1] : mimeType
}

export const handleRowSelect = (row: { toggleSelected: (val: boolean) => void; getIsSelected: () => boolean }, e?: Event) => {
    row.toggleSelected(!row.getIsSelected())
}

export const isValidLink = (link: string) => !link.startsWith("###")

export type ColorToken = "success" | "error" | "warning" | "info" | "gray" | "primary" | "secondary"

export const STATUS_META: Record<string, { label: string; color: ColorToken }> = {
    waiting: { label: "Waiting", color: "gray" },
    in_queue: { label: "Queued", color: "info" },
    downloading: { label: "Downloading", color: "info" },
    processing: { label: "Processing", color: "warning" },
    converting: { label: "Converting", color: "info" },
    generating_embeddings: { label: "Embedding", color: "info" },
    storing_embeddings_to_database: { label: "Storing", color: "info" },
    cleanup: { label: "Cleanup", color: "info" },
    finished: { label: "Finished", color: "success" },

    failed: { label: "Failed", color: "error" },
    downloading_failed: { label: "Download Failed", color: "error" },
    processing_failed: { label: "Processing Failed", color: "error" },
    converting_failed: { label: "Converting Failed", color: "error" },
    generating_embeddings_failed: { label: "Embedding Failed", color: "error" },
    storing_embeddings_to_database_failed: { label: "Storing Failed", color: "error" },
    cleanup_failed: { label: "Cleanup Failed", color: "error" },
}

// Fallback pretty-label if we ever see an unknown status
export const pretty = (s: string) => (s ? s.replaceAll("_", " ").replace(/(^|\s)\w/g, (m) => m.toUpperCase()) : "Unknown")
