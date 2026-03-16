import moment from "moment-timezone"
import removeMarkdown from "remove-markdown"

export const timeout = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))
export const verifyEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
export const verifyPassword = (password: string): boolean => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#)])[A-Za-z\d@$!%*?&#)]{8,}$/.test(password)
export const verifyUsername = (username: string): boolean => /^[a-zA-Z0-9]{3,}$/.test(username)
export const verifyName = (name: string): boolean => /^[a-zA-Z]{3,}$/.test(name)
export const verifyPhone = (phone: string): boolean => /^[0-9]{10,}$/.test(phone)
export const checkIfUsernameOrEmail = (input: string): "email" | "username" | "invalid" => {
    if (verifyEmail(input)) return "email"
    if (verifyUsername(input)) return "username"
    return "invalid"
}
export const validatePassword = (password: string): { missingMessage: string; acceptable: boolean; errorList: Array<string> } => {
    const lowercaseRegex = /[a-z]/
    const uppercaseRegex = /[A-Z]/
    const digitRegex = /\d/
    const specialCharRegex = /[@$!%*?&#]/

    const hasLowercase = lowercaseRegex.test(password)
    const hasUppercase = uppercaseRegex.test(password)
    const hasDigit = digitRegex.test(password)
    const hasSpecialChar = specialCharRegex.test(password)

    const missingCriteria: string[] = []

    if (!hasLowercase) {
        missingCriteria.push("at least one lowercase letter")
    }
    if (!hasUppercase) {
        missingCriteria.push("at least one uppercase letter")
    }
    if (!hasDigit) {
        missingCriteria.push("at least one digit")
    }
    if (!hasSpecialChar) {
        missingCriteria.push("at least one special character (@, $, !, %, *, ?, & or #)")
    }

    let message = ""
    if (missingCriteria.length === 0) {
        message = "Password meets all criteria."
    } else {
        message = "Password is missing the following criteria: " + missingCriteria.join(", ")
    }

    return {
        missingMessage: message,
        acceptable: missingCriteria.length === 0,
        errorList: missingCriteria,
    }
}
export const sortMessagesByTimestampAndConvertThemInObject = (messages: any) => {
    let sorted = messages.sort((a: any, b: any) => {
        const timestampA = new Date(a.createdAt).getTime()
        const timestampB = new Date(b.createdAt).getTime()
        return timestampA - timestampB
    })
    let messagesObject: any = {}
    for (let message of sorted) {
        messagesObject[message.messageId] = message
    }
    return messagesObject
}
export const formatBytes = (bytes: number): string => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const formattedSize = parseFloat((bytes / Math.pow(1024, i)).toFixed(2))
    return `${formattedSize} ${sizes[i]}`
}
export const getFileTypeFromUrl = (url: string) => {
    url = url.split("?")[0].split("#")[0]
    const extension = url.split(".").pop()
    return extension ? extension : "unknown"
}
export const parseConcatenatedJSON = (input: string) => {
    try {
        const regex = /}\s*{/g
        const jsonObjects = []
        const replaced = input.replace(regex, "}|{")
        const splitJson = replaced.split("|")
        for (const jsonString of splitJson) {
            jsonObjects.push(JSON.parse(jsonString))
        }
        return jsonObjects
    } catch (error) {
        console.log(input)
        return FinalizationRegistry
    }
}
export function parseEventStreamData(eventData: any) {
    const entries = eventData.split("\n")
    const results: any = []
    entries.forEach((entry: any) => {
        if (entry.startsWith("data: ")) {
            const jsonPart = entry.substring(6)

            try {
                const jsonObject = JSON.parse(jsonPart)
                results.push(jsonObject)
            } catch (e) {
                console.error("Failed to parse JSON0:", e)
            }
        } else {
            if (results.length > 0 && isValidJsonString(entry)) {
                try {
                    const combined = JSON.parse(results[results.length - 1] + entry)
                    results[results.length - 1] = combined
                } catch (e) {
                    console.error("Failed to repair JSON1:", e)
                }
            }
        }
    })
    return results
}
function isValidJsonString(str: any) {
    try {
        JSON.parse(str)
        return true
    } catch (e) {
        return false
    }
}
export const convertMimeTypeToType = (mimeType: string): string => {
    if (mimeType === "") {
        mimeType = "application/octet-stream"
    }
    const typeMap: { [key: string]: string } = {
        "text/plain": "Text",
        "text/html": "HTML",
        "application/json": "JSON",
        "application/pdf": "PDF",
        "image/jpeg": "Image",
        "image/png": "Image",
        "image/jpg": "Image",
        "image/gif": "Image",
        "image/webp": "Image",
        "image/heic": "Image",
        "image/heif": "Image",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
        "application/vnd.ms-excel": "XLSX",
        "text/x-python-script": "Python",
        "application/x-python-code": "Python",
        "application/msword": "DOC",
        "application/sql": "SQL",
        "application/x-sql": "SQL",
        "text/x-sql": "SQL",
        "application/octet-stream": "SQL",
        "text/csv": "CSV",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
        "text/javascript": "JavaScript",
        "application/vnd.google-apps.spreadsheet": "XLSX",
        "video/quicktime": "Video",
        "application/vnd.google-apps.document": "DOCX",
    }
    const type = typeMap[mimeType] || "Unknown"
    return type
}
export function formatEpochToDateString(epochMillis: number) {
    if (!epochMillis) return "N/A"
    const date = new Date(epochMillis)
    const formatter = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
    })
    const formattedDate = formatter.format(date)
    return formattedDate
}
export const revertSanitizedResponseContent = (content: string) => {
    return content.replaceAll("&lt;", "<")
}
export const sanitizeResponseContent = (content: string) => {
    return content
        .replace(/<\|[a-z]*$/, "")
        .replace(/<\|[a-z]+\|$/, "")
        .replace(/<$/, "")
        .replaceAll(/<\|[a-z]+\|>/g, " ")
        .replaceAll("<", "&lt;")
        .trim()
}
export const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString()
}

export const trimTitle = (title: string) => {
    if (!title) return ""
    const maxLength = 20
    if (title.length <= maxLength) return title
    const extensionIndex = title.lastIndexOf(".")
    if (extensionIndex === -1 || extensionIndex < 1) {
        return title.slice(0, maxLength - 3) + "..."
    }

    const extension = title.slice(extensionIndex)

    const availableLength = maxLength - extension.length - 3 // 3 is for the ellipsis (...)
    const halfLength = Math.floor(availableLength / 2)
    const start = title.slice(0, halfLength)
    const end = title.slice(extensionIndex - halfLength, extensionIndex)

    return `${start}...${end}${extension}`
}

export const trimText = (text: string) => {
    if (!text) return ""
    const maxLength = 20
    if (text.length <= maxLength) return text

    const availableLength = maxLength - 3 // 3 is for the ellipsis (...)
    const halfLength = Math.floor(availableLength / 2)
    const start = text.slice(0, halfLength)
    const end = text.slice(text.length - halfLength)

    return `${start}...${end}`
}

/**
 * Converts a string to comply with the regex ^[a-zA-Z0-9_-]+$
 * by removing or replacing any characters that do not match the pattern.
 * @param {string} input - The input string to be converted.
 * @returns {string} - The converted string.
 */
export function convertStringToRegexPattern(input: string) {
    const allowedPattern = /^[a-zA-Z0-9_-]+$/
    const convertedString = input
        .split("")
        .map((char) => {
            if (allowedPattern.test(char)) {
                return char
            } else {
                return "_"
            }
        })
        .join("")
    return convertedString
}

export const fetchWithTimeout = async (url: string, options: any, timeout = 10000) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await fetch(url, {
            credentials: "include",
            ...options,
            signal: controller.signal,
        })
        clearTimeout(timeoutId) // Clear the timeout if fetch is successful
        return response
    } catch (error: any) {
        if (error.name === "AbortError") {
            throw new Error("Request timed out")
        }
        throw error
    }
}

export function convertTimeToPDTAndEDT(date: number | string) {
    let dateStr = isNaN(Number(date)) ? new Date(date) : new Date(Number(date))

    const numericDate = dateStr.getTime()

    // Create a UTC moment and then convert it to the desired timezones
    const utcMoment = moment.utc(numericDate)

    const pdtTime = utcMoment.clone().tz("America/Los_Angeles").format("MM/DD/YYYY HH:mm:ss z")
    const edtTime = utcMoment.clone().tz("America/New_York").format("MM/DD/YYYY HH:mm:ss z")

    return {
        PDT: pdtTime,
        EDT: edtTime,
    }
}

export function chunkArray(array: any, chunkSize: number) {
    const result = []

    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize)
        result.push(chunk)
    }

    return result
}

export function getFormattedDate() {
    const now = Date.now()
    const date = new Date(now)

    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
}
export const updateShowPopupForIntegration = (service: string, module: string, value: boolean) => {
    const existingData = JSON.parse(sessionStorage.getItem("showPopupForIntegration") || "{}")
    const serviceData = existingData[service] || {}
    if (serviceData[module]) serviceData[module] = value
    else serviceData[module] = value
    existingData[service] = serviceData
    localStorage.setItem("showPopupForIntegration", JSON.stringify(existingData))
}
export const getShowPopupForIntegration = (service: string, module: string): boolean => {
    const existingData = JSON.parse(localStorage.getItem("showPopupForIntegration") || "{}")
    const serviceData = existingData[service] || {}
    return module in serviceData ? serviceData[module] : true
}
export const formatUTCTime = (timestamp: number): string => {
    const date = new Date(timestamp)

    const day = String(date.getUTCDate()).padStart(2, "0")
    const month = String(date.getUTCMonth() + 1).padStart(2, "0") // Months are zero-indexed
    const year = String(date.getUTCFullYear()).slice(-2)
    const hours = String(date.getUTCHours()).padStart(2, "0")
    const minutes = String(date.getUTCMinutes()).padStart(2, "0")

    return `${month}/${day}/${year}, ${hours}:${minutes}`
}
export function capitalizeFirstLetter(string: string) {
    if (!string) return "" // Check if the string is empty or undefined
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export function removeMarkup(text: string): string {
    const raw = removeMarkdown(text)

    const cleaned = raw
        .replace(/[*_~`]+/g, "")
        // Remove colon if it directly follows removed markdown (like "**:")
        .replace(/^[:\s]+/, "")
        // Normalize whitespace and remove quotes
        .replace(/(\r\n|\n|\r)/gm, " ")
        .replace(/ +(?= )/g, "")
        .replace(/"/g, "")
        .trim()

    return cleaned
}

export const trimModelDescription = (description: string) => {
    if (!description) return ""
    const maxLength = 20
    if (description.length <= maxLength) return description
    return description.slice(0, maxLength) + "..."
}

export function getRandomValue(min = 100, max = 1000) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// Dynamic color generation
export const providerColors = {
    Anthropic: "#FF6B6B", // Warm red
    OpenAI: "#4ECDC4", // Teal
    Google: "#45B7D1", // Blue
    Other: "#96CEB4", // Mint green
    Cohere: "#FFEAA7", // Yellow
    Mistral: "#DDA0DD", // Plum
    Meta: "#FFB347", // Orange
    Perplexity: "#98D8C8", // Aqua
    xAI: "#F7DC6F", // Light yellow
}
export const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#FFB347", "#98D8C8", "#F7DC6F"]

export const providerMap = {
    claude: "Anthropic",
    gpt: "OpenAI",
    o1: "OpenAI",
    o3: "OpenAI",
    o4: "OpenAI",
    gemini: "Google",
    command: "Cohere",
    mistral: "Mistral",
    ministral: "Mistral",
}

export const filterOptions = [
    { label: "Year", value: "Year" },
    { label: "Month", value: "Month" },
    { label: "Week", value: "Week" },
]

export const modelOptions = [
    { label: "Claude Sonnet 4", value: "claude-sonnet-4-20250514" },
    { label: "Claude Opus 4", value: "claude-opus-4-20250514" },
    { label: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-20241022" },
    { label: "Claude 3.7 Sonnet", value: "claude-3-7-sonnet-20250219" },
    { label: "GPT-4.1", value: "gpt-4.1-2025-04-14" },
    { label: "GPT-4o Mini", value: "gpt-4o-mini-2024-07-18" },
    { label: "GPT-4o", value: "gpt-4o-2024-05-13" },
    { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo-0125" },
    { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
    { label: "Gemini 2.0 Flash Lite", value: "gemini-2.0-flash-lite" },
    { label: "Ministral 8B", value: "ministral-8b-2410" },
    { label: "Mistral 7B", value: "open-mistral-7b" },
    { label: "Command Nightly", value: "command-nightly" },
    { label: "o1", value: "o1-2024-12-17" },
    { label: "o3 Mini", value: "o3-mini-2025-01-31" },
    { label: "o3", value: "o3-2025-04-16" },
    { label: "o4 Mini", value: "o4-mini-2025-04-16" },
]

export const userOptions = [
    { label: "All Users", value: "all" },
    { label: "Current User", value: "me" },
]

export const organizationOptions = [
    { label: "Current Org", value: "current" },
    { label: "All Organizations", value: "all" },
]

export const compareToOptions = [
    { label: "No Comparison", value: "none" },
    { label: "Previous Period", value: "prev-period" },
    { label: "Previous Year", value: "prev-year" },
]

const documentIdPrefix = ["gd_"]

export function removePrefix(documentId: string) {
    for (const prefix of documentIdPrefix) {
        if (documentId.startsWith(prefix)) {
            return documentId.slice(prefix.length)
        }
    }
    return documentId // Return original if no prefix matches
}

// Timezone utilities
export {
    getUserTimezone,
    getTimezoneOffset,
    formatTimezoneForDisplay,
    isValidTimezone
} from './timezone'
