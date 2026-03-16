const fs = require("fs")
const path = require("path")
const glob = require("glob")

// Enhanced mapping of all Tailwind color classes to new theme-aware classes
const enhancedColorMappings = {
    // Indigo colors (for primary actions)
    "bg-indigo-50": "bg-primary/10",
    "bg-indigo-100": "bg-primary/20",
    "bg-indigo-200": "bg-primary/30",
    "bg-indigo-300": "bg-primary/40",
    "bg-indigo-400": "bg-primary/60",
    "bg-indigo-500": "bg-primary",
    "bg-indigo-600": "bg-primary",
    "bg-indigo-700": "bg-primary",
    "bg-indigo-800": "bg-primary",
    "bg-indigo-900": "bg-primary",
    "bg-indigo-950": "bg-primary",

    "text-indigo-50": "text-primary/10",
    "text-indigo-100": "text-primary/20",
    "text-indigo-200": "text-primary/30",
    "text-indigo-300": "text-primary/40",
    "text-indigo-400": "text-primary/60",
    "text-indigo-500": "text-primary",
    "text-indigo-600": "text-primary",
    "text-indigo-700": "text-primary",
    "text-indigo-800": "text-primary",
    "text-indigo-900": "text-primary",
    "text-indigo-950": "text-primary",

    "border-indigo-50": "border-primary/10",
    "border-indigo-100": "border-primary/20",
    "border-indigo-200": "border-primary/30",
    "border-indigo-300": "border-primary/40",
    "border-indigo-400": "border-primary/60",
    "border-indigo-500": "border-primary",
    "border-indigo-600": "border-primary",
    "border-indigo-700": "border-primary",
    "border-indigo-800": "border-primary",
    "border-indigo-900": "border-primary",
    "border-indigo-950": "border-primary",

    "hover:bg-indigo-50": "hover:bg-primary/10",
    "hover:bg-indigo-100": "hover:bg-primary/20",
    "hover:bg-indigo-200": "hover:bg-primary/30",
    "hover:bg-indigo-300": "hover:bg-primary/40",
    "hover:bg-indigo-400": "hover:bg-primary/60",
    "hover:bg-indigo-500": "hover:bg-primary",
    "hover:bg-indigo-600": "hover:bg-primary",
    "hover:bg-indigo-700": "hover:bg-primary",
    "hover:bg-indigo-800": "hover:bg-primary",
    "hover:bg-indigo-900": "hover:bg-primary",
    "hover:bg-indigo-950": "hover:bg-primary",

    "focus:ring-indigo-50": "focus:ring-primary/10",
    "focus:ring-indigo-100": "focus:ring-primary/20",
    "focus:ring-indigo-200": "focus:ring-primary/30",
    "focus:ring-indigo-300": "focus:ring-primary/40",
    "focus:ring-indigo-400": "focus:ring-primary/60",
    "focus:ring-indigo-500": "focus:ring-primary",
    "focus:ring-indigo-600": "focus:ring-primary",
    "focus:ring-indigo-700": "focus:ring-primary",
    "focus:ring-indigo-800": "focus:ring-primary",
    "focus:ring-indigo-900": "focus:ring-primary",
    "focus:ring-indigo-950": "focus:ring-primary",

    // Teal colors (for accent/success)
    "bg-teal-50": "bg-accent/10",
    "bg-teal-100": "bg-accent/20",
    "bg-teal-200": "bg-accent/30",
    "bg-teal-300": "bg-accent/40",
    "bg-teal-400": "bg-accent/60",
    "bg-teal-500": "bg-accent",
    "bg-teal-600": "bg-accent",
    "bg-teal-700": "bg-accent",
    "bg-teal-800": "bg-accent",
    "bg-teal-900": "bg-accent",
    "bg-teal-950": "bg-accent",

    "text-teal-50": "text-accent/10",
    "text-teal-100": "text-accent/20",
    "text-teal-200": "text-accent/30",
    "text-teal-300": "text-accent/40",
    "text-teal-400": "text-accent/60",
    "text-teal-500": "text-accent",
    "text-teal-600": "text-accent",
    "text-teal-700": "text-accent",
    "text-teal-800": "text-accent",
    "text-teal-900": "text-accent",
    "text-teal-950": "text-accent",

    "border-teal-50": "border-accent/10",
    "border-teal-100": "border-accent/20",
    "border-teal-200": "border-accent/30",
    "border-teal-300": "border-accent/40",
    "border-teal-400": "border-accent/60",
    "border-teal-500": "border-accent",
    "border-teal-600": "border-accent",
    "border-teal-700": "border-accent",
    "border-teal-800": "border-accent",
    "border-teal-900": "border-accent",
    "border-teal-950": "border-accent",

    // Emerald colors (for success)
    "bg-emerald-50": "bg-accent/10",
    "bg-emerald-100": "bg-accent/20",
    "bg-emerald-200": "bg-accent/30",
    "bg-emerald-300": "bg-accent/40",
    "bg-emerald-400": "bg-accent/60",
    "bg-emerald-500": "bg-accent",
    "bg-emerald-600": "bg-accent",
    "bg-emerald-700": "bg-accent",
    "bg-emerald-800": "bg-accent",
    "bg-emerald-900": "bg-accent",
    "bg-emerald-950": "bg-accent",

    // Cyan colors (for info)
    "bg-cyan-50": "bg-accent/10",
    "bg-cyan-100": "bg-accent/20",
    "bg-cyan-200": "bg-accent/30",
    "bg-cyan-300": "bg-accent/40",
    "bg-cyan-400": "bg-accent/60",
    "bg-cyan-500": "bg-accent",
    "bg-cyan-600": "bg-accent",
    "bg-cyan-700": "bg-accent",
    "bg-cyan-800": "bg-accent",
    "bg-cyan-900": "bg-accent",
    "bg-cyan-950": "bg-accent",

    // Sky colors (for info)
    "bg-sky-50": "bg-accent/10",
    "bg-sky-100": "bg-accent/20",
    "bg-sky-200": "bg-accent/30",
    "bg-sky-300": "bg-accent/40",
    "bg-sky-400": "bg-accent/60",
    "bg-sky-500": "bg-accent",
    "bg-sky-600": "bg-accent",
    "bg-sky-700": "bg-accent",
    "bg-sky-800": "bg-accent",
    "bg-sky-900": "bg-accent",
    "bg-sky-950": "bg-accent",

    // Violet colors (for secondary)
    "bg-violet-50": "bg-secondary/10",
    "bg-violet-100": "bg-secondary/20",
    "bg-violet-200": "bg-secondary/30",
    "bg-violet-300": "bg-secondary/40",
    "bg-violet-400": "bg-secondary/60",
    "bg-violet-500": "bg-secondary",
    "bg-violet-600": "bg-secondary",
    "bg-violet-700": "bg-secondary",
    "bg-violet-800": "bg-secondary",
    "bg-violet-900": "bg-secondary",
    "bg-violet-950": "bg-secondary",

    // Fuchsia colors (for secondary)
    "bg-fuchsia-50": "bg-secondary/10",
    "bg-fuchsia-100": "bg-secondary/20",
    "bg-fuchsia-200": "bg-secondary/30",
    "bg-fuchsia-300": "bg-secondary/40",
    "bg-fuchsia-400": "bg-secondary/60",
    "bg-fuchsia-500": "bg-secondary",
    "bg-fuchsia-600": "bg-secondary",
    "bg-fuchsia-700": "bg-secondary",
    "bg-fuchsia-800": "bg-secondary",
    "bg-fuchsia-900": "bg-secondary",
    "bg-fuchsia-950": "bg-secondary",

    // Pink colors (for secondary)
    "bg-pink-50": "bg-secondary/10",
    "bg-pink-100": "bg-secondary/20",
    "bg-pink-200": "bg-secondary/30",
    "bg-pink-300": "bg-secondary/40",
    "bg-pink-400": "bg-secondary/60",
    "bg-pink-500": "bg-secondary",
    "bg-pink-600": "bg-secondary",
    "bg-pink-700": "bg-secondary",
    "bg-pink-800": "bg-secondary",
    "bg-pink-900": "bg-secondary",
    "bg-pink-950": "bg-secondary",

    // Rose colors (for destructive)
    "bg-rose-50": "bg-destructive/10",
    "bg-rose-100": "bg-destructive/20",
    "bg-rose-200": "bg-destructive/30",
    "bg-rose-300": "bg-destructive/40",
    "bg-rose-400": "bg-destructive/60",
    "bg-rose-500": "bg-destructive",
    "bg-rose-600": "bg-destructive",
    "bg-rose-700": "bg-destructive",
    "bg-rose-800": "bg-destructive",
    "bg-rose-900": "bg-destructive",
    "bg-rose-950": "bg-destructive",

    // Orange colors (for warnings)
    "bg-orange-50": "bg-accent/10",
    "bg-orange-100": "bg-accent/20",
    "bg-orange-200": "bg-accent/30",
    "bg-orange-300": "bg-accent/40",
    "bg-orange-400": "bg-accent/60",
    "bg-orange-500": "bg-accent",
    "bg-orange-600": "bg-accent",
    "bg-orange-700": "bg-accent",
    "bg-orange-800": "bg-accent",
    "bg-orange-900": "bg-accent",
    "bg-orange-950": "bg-accent",

    // Lime colors (for success)
    "bg-lime-50": "bg-accent/10",
    "bg-lime-100": "bg-accent/20",
    "bg-lime-200": "bg-accent/30",
    "bg-lime-300": "bg-accent/40",
    "bg-lime-400": "bg-accent/60",
    "bg-lime-500": "bg-accent",
    "bg-lime-600": "bg-accent",
    "bg-lime-700": "bg-accent",
    "bg-lime-800": "bg-accent",
    "bg-lime-900": "bg-accent",
    "bg-lime-950": "bg-accent",

    // Stone colors (alternative to gray)
    "bg-stone-50": "bg-muted",
    "bg-stone-100": "bg-background",
    "bg-stone-200": "bg-card",
    "bg-stone-300": "bg-muted",
    "bg-stone-400": "bg-muted",
    "bg-stone-500": "bg-muted",
    "bg-stone-600": "bg-muted",
    "bg-stone-700": "bg-muted",
    "bg-stone-800": "bg-background",
    "bg-stone-900": "bg-background",
    "bg-stone-950": "bg-background",

    "text-stone-50": "text-foreground",
    "text-stone-100": "text-foreground",
    "text-stone-200": "text-foreground",
    "text-stone-300": "text-muted-foreground",
    "text-stone-400": "text-muted-foreground",
    "text-stone-500": "text-muted-foreground",
    "text-stone-600": "text-muted-foreground",
    "text-stone-700": "text-muted-foreground",
    "text-stone-800": "text-foreground",
    "text-stone-900": "text-foreground",
    "text-stone-950": "text-foreground",

    "border-stone-50": "border-border",
    "border-stone-100": "border-border",
    "border-stone-200": "border-border",
    "border-stone-300": "border-border",
    "border-stone-400": "border-border",
    "border-stone-500": "border-border",
    "border-stone-600": "border-border",
    "border-stone-700": "border-border",
    "border-stone-800": "border-border",
    "border-stone-900": "border-border",
    "border-stone-950": "border-border",

    // Warm gray colors
    "bg-warmGray-50": "bg-muted",
    "bg-warmGray-100": "bg-background",
    "bg-warmGray-200": "bg-card",
    "bg-warmGray-300": "bg-muted",
    "bg-warmGray-400": "bg-muted",
    "bg-warmGray-500": "bg-muted",
    "bg-warmGray-600": "bg-muted",
    "bg-warmGray-700": "bg-muted",
    "bg-warmGray-800": "bg-background",
    "bg-warmGray-900": "bg-background",
    "bg-warmGray-950": "bg-background",

    // Cool gray colors
    "bg-coolGray-50": "bg-muted",
    "bg-coolGray-100": "bg-background",
    "bg-coolGray-200": "bg-card",
    "bg-coolGray-300": "bg-muted",
    "bg-coolGray-400": "bg-muted",
    "bg-coolGray-500": "bg-muted",
    "bg-coolGray-600": "bg-muted",
    "bg-coolGray-700": "bg-muted",
    "bg-coolGray-800": "bg-background",
    "bg-coolGray-900": "bg-background",
    "bg-coolGray-950": "bg-background",

    // True gray colors
    "bg-trueGray-50": "bg-muted",
    "bg-trueGray-100": "bg-background",
    "bg-trueGray-200": "bg-card",
    "bg-trueGray-300": "bg-muted",
    "bg-trueGray-400": "bg-muted",
    "bg-trueGray-500": "bg-muted",
    "bg-trueGray-600": "bg-muted",
    "bg-trueGray-700": "bg-muted",
    "bg-trueGray-800": "bg-background",
    "bg-trueGray-900": "bg-background",
    "bg-trueGray-950": "bg-background",

    // Opacity modifiers (convert to theme-aware opacity)
    "bg-opacity-5": "bg-opacity-5",
    "bg-opacity-10": "bg-opacity-10",
    "bg-opacity-20": "bg-opacity-20",
    "bg-opacity-25": "bg-opacity-25",
    "bg-opacity-30": "bg-opacity-30",
    "bg-opacity-40": "bg-opacity-40",
    "bg-opacity-50": "bg-opacity-50",
    "bg-opacity-60": "bg-opacity-60",
    "bg-opacity-70": "bg-opacity-70",
    "bg-opacity-75": "bg-opacity-75",
    "bg-opacity-80": "bg-opacity-80",
    "bg-opacity-90": "bg-opacity-90",
    "bg-opacity-95": "bg-opacity-95",

    // Gradient backgrounds (keep as is, they're already theme-aware)
    "bg-gradient-to-t": "bg-gradient-to-t",
    "bg-gradient-to-tr": "bg-gradient-to-tr",
    "bg-gradient-to-r": "bg-gradient-to-r",
    "bg-gradient-to-br": "bg-gradient-to-br",
    "bg-gradient-to-b": "bg-gradient-to-b",
    "bg-gradient-to-bl": "bg-gradient-to-bl",
    "bg-gradient-to-l": "bg-gradient-to-l",
    "bg-gradient-to-tl": "bg-gradient-to-tl",

    // Border utilities (keep as is)
    "border-b-0": "border-b-0",
    "border-b-2": "border-b-2",
    "border-b-4": "border-b-4",
    "border-b-8": "border-b-8",
    "border-l-0": "border-l-0",
    "border-l-2": "border-l-2",
    "border-l-4": "border-l-4",
    "border-l-8": "border-l-8",
    "border-r-0": "border-r-0",
    "border-r-2": "border-r-2",
    "border-r-4": "border-r-4",
    "border-r-8": "border-r-8",
    "border-t-0": "border-t-0",
    "border-t-2": "border-t-2",
    "border-t-4": "border-t-4",
    "border-t-8": "border-t-8",
}

// Function to replace color classes in a string
function replaceColorClasses(content) {
    let updatedContent = content

    // Replace exact matches first
    for (const [colorClass, newClass] of Object.entries(enhancedColorMappings)) {
        const regex = new RegExp(`\\b${colorClass.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")
        updatedContent = updatedContent.replace(regex, newClass)
    }

    return updatedContent
}

// Function to process a single file
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf8")
        const updatedContent = replaceColorClasses(content)

        if (content !== updatedContent) {
            fs.writeFileSync(filePath, updatedContent, "utf8")
            console.log(`✅ Updated: ${filePath}`)
            return true
        } else {
            console.log(`⏭️  No changes: ${filePath}`)
            return false
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message)
        return false
    }
}

// Main function to process all Vue files
function migrateColors() {
    console.log("🚀 Starting enhanced color migration...\n")

    // Find all Vue files
    const vueFiles = glob.sync("src/**/*.vue", { absolute: true })

    console.log(`📁 Found ${vueFiles.length} Vue files to process\n`)

    let updatedCount = 0
    let errorCount = 0

    vueFiles.forEach((filePath) => {
        const wasUpdated = processFile(filePath)
        if (wasUpdated === true) {
            updatedCount++
        } else if (wasUpdated === false) {
            errorCount++
        }
    })

    console.log(`\n📊 Migration Summary:`)
    console.log(`✅ Files updated: ${updatedCount}`)
    console.log(`❌ Files with errors: ${errorCount}`)
    console.log(`⏭️  Files unchanged: ${vueFiles.length - updatedCount - errorCount}`)
    console.log(`📁 Total files processed: ${vueFiles.length}`)

    if (updatedCount > 0) {
        console.log(`\n🎉 Enhanced color migration completed successfully!`)
        console.log(`💡 All remaining Tailwind colors have been replaced with theme-aware colors.`)
    } else {
        console.log(`\n⚠️  No files were updated. This might mean:`)
        console.log(`   - No remaining color classes were found`)
        console.log(`   - All color classes were already migrated`)
        console.log(`   - There were errors in processing`)
    }
}

// Run the migration
if (require.main === module) {
    migrateColors()
}

module.exports = { replaceColorClasses, processFile, migrateColors }
