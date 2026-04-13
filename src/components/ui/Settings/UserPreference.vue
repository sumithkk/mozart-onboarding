<template>
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <!-- Header -->
        <div data-tour="preferences" class="mb-8">
            <h1 class="text-textColor text-3xl font-bold">Appearance</h1>
            <p class="text-textColorSecondary mt-2 text-sm">Manage settings for your booking appearance</p>
        </div>

        <!-- Theme Section -->
        <div class="mb-12">
            <div class="mb-6">
                <h2 class="text-textColor text-lg font-semibold">Theme</h2>
                <p class="text-textColorSecondary mt-1 text-sm">This only applies to your public booking pages</p>
            </div>

            <!-- Theme Cards -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <!-- System Default -->
                <div @click="editableSettings.theme = 'system'" class="group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:shadow-lg" :class="editableSettings.theme === 'system' ? 'border-logoColor shadow-md' : 'border-borderColor hover:border-gray-300'">
                    <div class="bg-backgroundColor aspect-video p-4">
                        <div class="flex h-full items-center justify-center gap-2">
                            <div class="bg-surfaceColor border-borderColor h-16 w-24 rounded border"></div>
                            <div class="bg-textColor border-borderColor h-16 w-24 rounded border"></div>
                        </div>
                    </div>
                    <div class="bg-surfaceColor border-borderColor border-t p-3 text-center">
                        <p class="text-textColor text-sm font-medium">System default</p>
                    </div>
                    <div v-if="editableSettings.theme === 'system'" class="absolute top-2 right-2">
                        <div class="bg-logoColor flex h-6 w-6 items-center justify-center rounded-full">
                            <span class="material-symbols-outlined text-sm text-white">check</span>
                        </div>
                    </div>
                </div>

                <!-- Light Theme -->
                <div @click="editableSettings.theme = 'light'" class="group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:shadow-lg" :class="editableSettings.theme === 'light' ? 'border-logoColor shadow-md' : 'border-borderColor hover:border-gray-300'">
                    <div class="aspect-video bg-white p-4">
                        <div class="flex h-full flex-col gap-2 p-2">
                            <div class="flex items-center gap-2">
                                <div class="h-6 w-6 rounded-full bg-gray-300"></div>
                                <div class="h-2 flex-1 rounded bg-gray-200"></div>
                            </div>
                            <div class="h-2 w-3/4 rounded bg-gray-200"></div>
                            <div class="h-2 w-2/3 rounded bg-gray-200"></div>
                        </div>
                    </div>
                    <div class="border-t border-gray-200 bg-white p-3 text-center">
                        <p class="text-sm font-medium text-gray-900">Light</p>
                    </div>
                    <div v-if="editableSettings.theme === 'light'" class="absolute top-2 right-2">
                        <div class="bg-logoColor flex h-6 w-6 items-center justify-center rounded-full">
                            <span class="material-symbols-outlined text-sm text-white">check</span>
                        </div>
                    </div>
                </div>

                <!-- Dark Theme -->
                <div @click="editableSettings.theme = 'dark'" class="group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:shadow-lg" :class="editableSettings.theme === 'dark' ? 'border-logoColor shadow-md' : 'border-borderColor hover:border-gray-300'">
                    <div class="aspect-video bg-neutral-900 p-4">
                        <div class="flex h-full flex-col gap-2 p-2">
                            <div class="flex items-center gap-2">
                                <div class="h-6 w-6 rounded-full bg-neutral-700"></div>
                                <div class="h-2 flex-1 rounded bg-neutral-700"></div>
                            </div>
                            <div class="h-2 w-3/4 rounded bg-neutral-700"></div>
                            <div class="h-2 w-2/3 rounded bg-neutral-700"></div>
                        </div>
                    </div>
                    <div class="border-t border-neutral-800 bg-neutral-900 p-3 text-center">
                        <p class="text-sm font-medium text-neutral-100">Dark</p>
                    </div>
                    <div v-if="editableSettings.theme === 'dark'" class="absolute top-2 right-2">
                        <div class="bg-logoColor flex h-6 w-6 items-center justify-center rounded-full">
                            <span class="material-symbols-outlined text-sm text-white">check</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- User Interface Preferences -->
        <div class="mb-8">
            <h2 class="text-textColor mb-4 text-lg font-semibold">User Interface</h2>
            <div class="bg-surfaceColor divide-borderColor border-borderColor divide-y rounded-lg border">
                <!-- Increased Font Sizes -->
                <label class="hover:bg-backgroundColor flex cursor-pointer items-center justify-between px-6 py-4">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-textColorSecondary">format_size</span>
                        <span class="text-textColor text-sm font-medium">Increased Font Sizes</span>
                    </div>
                    <input type="checkbox" class="modern-checkbox" v-model="editableSettings.increasedFontSize" />
                </label>

                <!-- Show Token Usage -->
                <label class="hover:bg-backgroundColor flex cursor-pointer items-center justify-between px-6 py-4">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-textColorSecondary">analytics</span>
                        <span class="text-textColor text-sm font-medium">Show Token Usage</span>
                    </div>
                    <input type="checkbox" class="modern-checkbox" v-model="editableSettings.showTokenUsage" />
                </label>

                <!-- Workbench Widget -->
                <label class="hover:bg-backgroundColor flex cursor-pointer items-center justify-between px-6 py-4">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-textColorSecondary">widgets</span>
                        <span class="text-textColor text-sm font-medium">Workbench Widget</span>
                    </div>
                    <input type="checkbox" class="modern-checkbox" v-model="editableSettings.workbenchWidget" />
                </label>

                <!-- Custom Notes -->
                <label class="hover:bg-backgroundColor flex cursor-pointer items-center justify-between px-6 py-4">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-textColorSecondary">note</span>
                        <span class="text-textColor text-sm font-medium">Custom Notes</span>
                    </div>
                    <input type="checkbox" class="modern-checkbox" v-model="editableSettings.customNotes" />
                </label>

                <!-- Expanded Input Text -->
                <label class="hover:bg-backgroundColor flex cursor-pointer items-center justify-between px-6 py-4">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-textColorSecondary">text_fields</span>
                        <span class="text-textColor text-sm font-medium">Expanded Input Text</span>
                    </div>
                    <input type="checkbox" class="modern-checkbox" v-model="editableSettings.expandedInputText" />
                </label>

                <!-- Templates -->
                <label class="hover:bg-backgroundColor flex cursor-pointer items-center justify-between px-6 py-4">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-textColorSecondary">description</span>
                        <span class="text-textColor text-sm font-medium">Templates</span>
                    </div>
                    <input type="checkbox" class="modern-checkbox" v-model="editableSettings.templates" />
                </label>

                <!-- Show File Preview -->
                <label class="hover:bg-backgroundColor flex cursor-pointer items-center justify-between px-6 py-4">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-textColorSecondary">preview</span>
                        <span class="text-textColor text-sm font-medium">Show File Preview</span>
                    </div>
                    <input type="checkbox" class="modern-checkbox" v-model="editableSettings.showFilePreview" />
                </label>

                <!-- Pin Sidebar -->
                <label class="hover:bg-backgroundColor flex cursor-pointer items-center justify-between px-6 py-4">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-textColorSecondary">push_pin</span>
                        <span class="text-textColor text-sm font-medium">Pin Sidebar</span>
                    </div>
                    <input type="checkbox" class="modern-checkbox" v-model="editableSettings.pinSideBar" />
                </label>
            </div>
        </div>

        <!-- Action Button -->
        <div class="flex justify-end">
            <button @click="handleSaveButtonClick" :disabled="isLoading" class="bg-logoColor hover:bg-mozart-blue-700 flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium text-white transition-colors" :class="{ 'cursor-not-allowed opacity-50': isLoading }">
                <div v-if="isLoading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                {{ isLoading ? "Saving..." : "Update" }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, watch, watchEffect } from "vue"
    import { storeToRefs } from "pinia"
    import { cloneDeep, isEqual } from "lodash-es"

    const userStore = useUserStore()
    const { settings } = storeToRefs(userStore)
    const colorMode = useColorMode()

    const editableSettings = ref<UserSettings>({} as UserSettings)
    const originalSettings = ref<UserSettings>({} as UserSettings)
    const isLoading = ref(false)
    const isInitialLoad = ref(true)

    onMounted(async () => {
        // Ensure settings are loaded from the server
        await userStore.loadUserSettings()

        // Clone settings from store
        editableSettings.value = cloneDeep(settings.value)
        originalSettings.value = cloneDeep(settings.value)

        // Preserve the current colorMode preference instead of overriding it
        // This ensures we don't force a theme change when navigating to this page
        if (colorMode.preference) {
            editableSettings.value.theme = colorMode.preference
        }

        // Mark initial load as complete after the current tick
        // This allows the watcher to start tracking changes
        setTimeout(() => {
            isInitialLoad.value = false
        }, 0)
    })

    // Watch theme changes and apply immediately
    // Skip the first run to prevent overriding the current theme on mount
    watch(
        () => editableSettings.value.theme,
        (newTheme) => {
            // Don't update colorMode during initial load to preserve current theme
            // Also check if values are already in sync to avoid unnecessary updates
            if (!isInitialLoad.value && newTheme && colorMode.preference !== newTheme) {
                colorMode.preference = newTheme
            }
        }
    )

    // Watch for colorMode preference changes from dropdown and sync to editableSettings
    // This ensures the preferences menu stays in sync when theme is changed via dropdown
    watch(
        () => colorMode.preference,
        (newPreference) => {
            // Only update if not during initial load and if the preference actually changed
            if (!isInitialLoad.value && newPreference && editableSettings.value.theme !== newPreference) {
                editableSettings.value.theme = newPreference
            }
        }
    )

    // Watch for colorMode value changes and update data-theme attribute
    // This ensures that when preference is "system", it applies the actual resolved theme
    watchEffect(() => {
        if (process.client) {
            document.documentElement.setAttribute("data-theme", colorMode.value)
        }
    })

    const handleSaveButtonClick = async () => {
        if (isEqual(editableSettings.value, originalSettings.value)) {
            console.log("No changes detected. Skipping update.")
            return
        }

        try {
            isLoading.value = true
            await useUser().updateUserSettings(editableSettings.value)

            // ✅ On success, update both original and store
            originalSettings.value = cloneDeep(editableSettings.value)
            userStore.settings = cloneDeep(editableSettings.value)

            // Update localStorage to ensure theme persistence
            if (editableSettings.value.theme && process.client) {
                localStorage.setItem("hs_theme", editableSettings.value.theme)
            }
        } catch (error) {
            console.error("Error saving preferences:", error)
        } finally {
            isLoading.value = false
        }
    }
</script>

<style scoped>
    .modern-checkbox {
        appearance: none;
        width: 42px;
        height: 24px;
        background-color: var(--borderColor);
        border-radius: 12px;
        position: relative;
        cursor: pointer;
        transition: background-color 0.3s ease;
        flex-shrink: 0;
    }

    .modern-checkbox:checked {
        background-color: var(--logoColor);
    }

    .modern-checkbox::before {
        content: "";
        position: absolute;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background-color: white;
        top: 3px;
        left: 3px;
        transition: transform 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .modern-checkbox:checked::before {
        transform: translateX(18px);
    }

    .modern-checkbox:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
