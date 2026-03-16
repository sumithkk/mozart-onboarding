/**
 * Utility functions for timezone detection and handling
 */

/**
 * Gets the user's timezone from the browser
 * @returns The timezone string (e.g., "America/New_York", "Europe/London")
 */
export function getUserTimezone(): string {
    try {
        // Use Intl.DateTimeFormat to get the timezone
        return Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch (error) {
        console.warn('[Timezone] Failed to detect timezone:', error)
        // Fallback to UTC if detection fails
        return 'UTC'
    }
}

/**
 * Gets the timezone offset in minutes from UTC
 * @returns The offset in minutes (positive for east of UTC, negative for west)
 */
export function getTimezoneOffset(): number {
    try {
        return new Date().getTimezoneOffset() * -1 // Invert the sign
    } catch (error) {
        console.warn('[Timezone] Failed to get timezone offset:', error)
        return 0 // Default to UTC
    }
}

/**
 * Formats a timezone string for display
 * @param timezone The timezone string
 * @returns A formatted timezone string for display
 */
export function formatTimezoneForDisplay(timezone: string): string {
    try {
        // Convert timezone to a more readable format
        const parts = timezone.split('/')
        if (parts.length === 2) {
            const [region, city] = parts
            return `${city.replace(/_/g, ' ')}, ${region}`
        }
        return timezone
    } catch (error) {
        console.warn('[Timezone] Failed to format timezone:', error)
        return timezone
    }
}

/**
 * Checks if the timezone is valid
 * @param timezone The timezone string to validate
 * @returns True if the timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
    try {
        // Try to create a date with the timezone
        Intl.DateTimeFormat(undefined, { timeZone: timezone })
        return true
    } catch (error) {
        return false
    }
}
