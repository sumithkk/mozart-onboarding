<template>
    <div class="bg-sideBarBackgroundColorDark flex h-full min-h-0 flex-col" :class="{ 'overflow-y-auto': isProfileRoute }">
        <!-- 1) TOP: fixed (no outer scroll) -->
        <div class="shrink-0 px-3 pt-2 pb-1">
            <!-- Top Nav -->
            <ul class="mb-1 w-full space-y-1">
                <SidebarNavItem to="/workbench/files" icon="HomeIcon" label="Workbench" />
                <SidebarNavItem to="/compose" icon="PlusCircleIcon" label="Compose" />
                <SidebarNavItem v-if="userStore.isAdmin" to="/admin/rag/manage/collection" icon="CircleStackIcon" label="RAG" @click="showRag = true" />
            </ul>

            <!-- PROFILE SECTION -->
            <div v-if="isProfileRoute" class="w-full space-y-3">
                <!-- User Account Settings -->
                <div class="space-y-1">
                    <span class="text-xs font-semibold text-gray-600 uppercase dark:text-neutral-400">ACCOUNT</span>
                    <NuxtLink v-for="item in userProfileNavItems" :key="item.route" :to="item.route" :class="[baseNavItem, $route.path === item.route ? 'bg-gray-100 text-black dark:bg-neutral-800 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-neutral-800']">
                        <component :is="profileIcons[item.icon as keyof typeof profileIcons]" class="h-5 w-5 shrink-0" />
                        <span class="truncate">{{ item.label }}</span>
                    </NuxtLink>
                </div>

                <!-- Admin Settings (only for admins) -->
                <div v-if="userStore.isAdmin && adminProfileNavItems.length" class="space-y-1">
                    <span class="text-xs font-semibold text-gray-600 uppercase dark:text-neutral-400">ADMIN</span>
                    <NuxtLink v-for="item in adminProfileNavItems" :key="item.route" :to="item.route" :class="[baseNavItem, $route.path === item.route ? 'bg-gray-100 text-black dark:bg-neutral-800 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-neutral-800']">
                        <component :is="profileIcons[item.icon as keyof typeof profileIcons]" class="h-5 w-5 shrink-0" />
                        <span class="truncate">{{ item.label }}</span>
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- 2 + 3 WRAPPER: no outer scroll; inner panes scroll -->
        <div class="grid min-h-0 flex-1 overflow-hidden" style="grid-template-rows: auto auto auto auto 1fr" v-if="!isProfileRoute">
            <!-- PROJECTS header (collapse like Archive) -->
            <div class="shrink-0 px-3 pt-3" v-if="!showRag">
                <button type="button" class="flex w-full items-center justify-between text-xs font-semibold tracking-wide text-gray-600 dark:text-neutral-400" @click="projectsOpen = !projectsOpen">
                    <div class="flex items-center gap-2">
                        <span class="materialSymbolsOutlined text-base">folder</span>
                        <span class="uppercase">Projects</span>
                    </div>
                    <span class="materialSymbolsOutlined text-sm" :class="projectsOpen ? 'rotate-180 transition-transform' : 'transition-transform'">expand_more</span>
                </button>
            </div>

            <!-- 2) PROJECTS pane (scrolls independently, keeps Archive intact) -->
            <div v-show="projectsOpen && !showRag" class="min-h-0">
                <div ref="projectsScrollEl" class="min-h-0 overflow-y-auto px-3 pb-2" style="max-height: 40vh">
                    <!-- "New Project" row (original) -->
                    <div class="mb-1">
                        <DropdownMenu :options="newProjectMenuOptions" :isActive="activeDropdown === 'newProject'" :position="dropdownPos" :dropdownId="'newProject'" :outSideClicked="closeDropdown" @itemClicked="handleNewProjectMenu">
                            <button type="button" :class="[itemBase, 'w-full text-left']" @click.stop="toggleDropdown('newProject')">
                                <div class="flex w-full items-center justify-between">
                                    <div class="flex items-center">
                                        <span class="materialSymbolsOutlined mr-2 text-xl">create_new_folder</span>
                                        <span class="text-sm font-bold">New Project</span>
                                    </div>
                                </div>
                            </button>
                        </DropdownMenu>
                    </div>

                    <!-- PROJECTS list (original) -->
                    <div class="mb-1">
                        <ul class="space-y-1">
                            <li v-for="project in conversationStore.projects" :key="project.projectId" class="group">
                                <!-- Project row -->
                                <button type="button" :class="[itemBase, 'w-full text-left', project.isArchived ? 'opacity-50' : '', itemInactive(project)]" @click="handleProjectClick(project)" @dblclick="toggleProject(project)">
                                    <div class="flex w-full items-center justify-between">
                                        <span class="materialSymbolsOutlined mr-2 text-sm">folder</span>
                                        <span class="flex-1 truncate text-sm">{{ project.name }}</span>

                                        <!-- kebab -->
                                        <div class="ml-1 flex h-6 w-6 shrink-0 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                                            <DropdownMenu :options="projectMenuOptions" :isActive="activeDropdown === project.projectId" :position="dropdownPos" :dropdownId="project.projectId" :outSideClicked="closeDropdown" @itemClicked="(itm: any) => handleProjectMenu(itm, project.projectId)">
                                                <VTooltip>
                                                    <button type="button" class="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:hover:bg-neutral-700" aria-label="Open project menu" @click.stop="toggleDropdown(project.projectId)">
                                                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                            <circle cx="12" cy="5" r="1.5" />
                                                            <circle cx="12" cy="12" r="1.5" />
                                                            <circle cx="12" cy="19" r="1.5" />
                                                        </svg>
                                                    </button>
                                                    <template #popper>Project Options</template>
                                                </VTooltip>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </button>

                                <!-- Panel (lazy) -->
                                <transition name="fade">
                                    <div v-if="projectOpen[project.projectId]" class="mt-1 ml-6">
                                        <ConversationListSkeleton v-if="projectLoading[project.projectId] && !projectConversations(project.projectId).length" />
                                        <ul v-else class="space-y-1">
                                            <li v-for="conv in projectConversations(project.projectId)" :key="conv.conversationId">
                                                <div :data-conversation-id="conv.conversationId" :class="[itemBase, itemActive(conv), itemInactive(conv)]">
                                                    <div class="flex w-full items-center">
                                                        <div class="flex min-w-0 flex-1 items-center gap-2 pr-1 md:pr-2">
                                                            <span v-if="conv.metaData.type === 'interaction'" class="materialSymbolsOutlined hidden sm:inline">description</span>
                                                            <span v-if="currentlyEditingId !== conv.conversationId" class="truncate" @click="openConversation(conv)">
                                                                {{ trimTitle(removeMarkup(conv.title || (conv.metaData.type === "interaction" ? "File Interaction" : ""))) }}
                                                            </span>
                                                            <input v-else :ref="createSetEditRef(conv.conversationId)" v-model="editTitle" class="editConversationTitleInput border-primaryColor w-full min-w-0 border-b bg-transparent outline-none" @blur="saveTitle(conv.conversationId)" @keyup.enter="saveTitle(conv.conversationId)" />
                                                            <span v-if="conv.isShared" class="materialSymbolsOutlined ms-compact text-logoColor sm:inline-flex">share</span>
                                                        </div>

                                                        <div
                                                            class="ml-1 flex h-6 w-6 shrink-0 items-center justify-center transition-opacity"
                                                            :class="{
                                                                'opacity-100': conv.conversationId === conversationId,
                                                                'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100': conv.conversationId !== conversationId,
                                                            }"
                                                        >
                                                            <div v-if="conversationSwitching.isLoading.value && conversationSwitching.targetConversationId === conv.conversationId" class="flex items-center justify-center">
                                                                <div class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-mozart-blue"></div>
                                                            </div>
                                                            <DropdownMenu v-else :options="getMenuOptions(conv)" :isActive="activeDropdown === conv.conversationId" :position="dropdownPos" :dropdownId="conv.conversationId" :outSideClicked="closeDropdown" @itemClicked="(itm: any) => handleMenu(itm, conv.conversationId)">
                                                                <VTooltip>
                                                                    <button type="button" class="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:hover:bg-neutral-700" aria-label="Open conversation menu" @click="toggleDropdown(conv.conversationId)">
                                                                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                                            <circle cx="12" cy="5" r="1.5" />
                                                                            <circle cx="12" cy="12" r="1.5" />
                                                                            <circle cx="12" cy="19" r="1.5" />
                                                                        </svg>
                                                                    </button>
                                                                    <template #popper>Options</template>
                                                                </VTooltip>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </transition>
                            </li>
                        </ul>
                    </div>

                    <!-- ARCHIVE (original, unchanged) -->
                    <div class="mb-1">
                        <button type="button" class="flex w-full items-center justify-between text-xs font-semibold tracking-wide text-gray-600 dark:text-neutral-400" @click="toggleArchive">
                            <div class="flex items-center gap-2">
                                <span class="materialSymbolsOutlined text-base">inventory_2</span>
                                <span class="text-sm">Archive</span>
                            </div>
                            <span class="materialSymbolsOutlined text-sm" :class="archiveOpen ? 'rotate-180 transition-transform' : 'transition-transform'">expand_more</span>
                        </button>
                        <transition name="fade">
                            <ul v-if="archiveOpen" class="mt-1 ml-2 space-y-1.5">
                                <ConversationListSkeleton :listCount="2" v-if="archiveLoading && !conversationStore.archivedConversations.length" />
                                <li v-for="conv in conversationStore.archivedConversations" :key="conv.conversationId" class="space-y-1.5">
                                    <div :data-conversation-id="conv.conversationId" :class="[itemBase, itemActive(conv), itemInactive(conv), 'opacity-75']">
                                        <div class="flex w-full items-center justify-between">
                                            <div class="flex flex-1 items-center gap-2 pr-1 md:pr-2">
                                                <span v-if="conv.metaData.type === 'interaction'" class="materialSymbolsOutlined hidden sm:inline">description</span>
                                                <span class="block flex-1 cursor-pointer truncate overflow-hidden text-sm text-gray-800 dark:text-neutral-100" @click="openArchivedConversation(conv)">
                                                    {{ trimTitle(removeMarkup(conv.title || (conv.metaData.type === "interaction" ? "File Interaction" : "")), 18) }}
                                                </span>
                                                <span v-if="conv.isShared" class="materialSymbolsOutlined ms-compact text-logoColor sm:inline-flex">share</span>
                                            </div>
                                            <div
                                                class="ml-1 flex h-6 w-6 shrink-0 items-center justify-center transition-opacity"
                                                :class="{
                                                    'opacity-100': conv.conversationId === conversationId,
                                                    'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100': conv.conversationId !== conversationId,
                                                }"
                                            >
                                                <DropdownMenu :options="getArchivedMenuOptions()" :isActive="activeDropdown === conv.conversationId" :position="dropdownPos" :dropdownId="conv.conversationId" :outSideClicked="closeDropdown" @itemClicked="(itm: any) => handleMenu(itm, conv.conversationId)">
                                                    <VTooltip>
                                                        <button type="button" class="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:hover:bg-neutral-700" aria-label="Open conversation menu" @click="toggleDropdown(conv.conversationId)">
                                                            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                                <circle cx="12" cy="5" r="1.5" />
                                                                <circle cx="12" cy="12" r="1.5" />
                                                                <circle cx="12" cy="19" r="1.5" />
                                                            </svg>
                                                        </button>
                                                        <template #popper>Archive Options</template>
                                                    </VTooltip>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </transition>
                    </div>
                </div>
            </div>

            <!-- Divider -->
            <div class="shrink-0 border-t border-gray-300 dark:border-neutral-700" v-if="!showRag"></div>

            <!-- CONVERSATIONS header (collapse) -->
            <div class="shrink-0 px-3 pt-3" v-if="!showRag">
                <button type="button" class="flex w-full items-center justify-between text-xs font-semibold tracking-wide text-gray-600 dark:text-neutral-400" @click="conversationsOpen = !conversationsOpen">
                    <div class="flex items-center gap-2">
                        <span class="materialSymbolsOutlined text-base">chat</span>
                        <span class="uppercase">Conversations</span>
                    </div>
                    <span class="materialSymbolsOutlined text-sm" :class="conversationsOpen ? 'rotate-180 transition-transform' : 'transition-transform'">expand_more</span>
                </button>
            </div>

            <!-- 3) CONVERSATIONS pane (scrolls independently; infinite scroll uses rootEl) -->
            <div v-show="conversationsOpen" class="flex min-h-0 flex-col">
                <div ref="conversationsScrollEl" class="flex-1 overflow-y-auto px-3 pb-3">
                    <div v-if="!showRag">
                        <ul class="space-y-1.5">
                            <ConversationListSkeleton v-if="conversationStore.isLoading && !hasConversations" />
                            <template v-else>
                                <li v-for="(group, idx) in mergedGroups" :key="idx" class="space-y-1.5">
                                    <div v-if="group[Object.keys(group)[0]].length">
                                        <div class="text-textColor py-2 text-xs font-bold dark:text-neutral-100">
                                            {{ Object.keys(group)[0] }}
                                        </div>
                                        <ul class="space-y-1">
                                            <li v-for="conv in group[Object.keys(group)[0]]" :key="conv.conversationId">
                                                <div :data-conversation-id="conv.conversationId" :class="[itemBase, itemActive(conv), itemInactive(conv)]">
                                                    <div class="flex w-full items-center">
                                                        <div class="flex min-w-0 flex-1 items-center pr-1 md:pr-2">
                                                            <span v-if="conv.metaData.type === 'interaction'" class="materialSymbolsOutlined hidden sm:inline">description</span>
                                                            <span v-if="currentlyEditingId !== conv.conversationId" class="truncate" @click="openConversation(conv)">
                                                                {{ trimTitle(removeMarkup(conv.title || (conv.metaData.type === "interaction" ? "File Interaction" : ""))) }}
                                                            </span>
                                                            <input v-else :ref="createSetEditRef(conv.conversationId)" v-model="editTitle" class="editConversationTitleInput border-primaryColor w-full min-w-0 border-b bg-transparent outline-none" @blur="saveTitle(conv.conversationId)" @keyup.enter="saveTitle(conv.conversationId)" />
                                                            <span v-if="conv.isShared" class="materialSymbolsOutlined ms-compact text-logoColor sm:inline-flex">share</span>
                                                        </div>
                                                        <div
                                                            class="ml-1 flex h-6 w-6 shrink-0 items-center justify-center transition-opacity"
                                                            :class="{
                                                                'opacity-100': conv.conversationId === conversationId,
                                                                'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100': conv.conversationId !== conversationId,
                                                            }"
                                                        >
                                                            <div v-if="conversationSwitching.isLoading.value && conversationSwitching.targetConversationId === conv.conversationId" class="flex items-center justify-center">
                                                                <div class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-mozart-blue"></div>
                                                            </div>
                                                            <DropdownMenu v-else :options="getMenuOptions(conv)" :isActive="activeDropdown === conv.conversationId" :position="dropdownPos" :dropdownId="conv.conversationId" :outSideClicked="closeDropdown" @itemClicked="(itm: any) => handleMenu(itm, conv.conversationId)">
                                                                <VTooltip>
                                                                    <button type="button" class="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:hover:bg-neutral-700" aria-label="Open conversation menu" @click="toggleDropdown(conv.conversationId)">
                                                                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                                            <circle cx="12" cy="5" r="1.5" />
                                                                            <circle cx="12" cy="12" r="1.5" />
                                                                            <circle cx="12" cy="19" r="1.5" />
                                                                        </svg>
                                                                    </button>
                                                                    <template #popper>Options</template>
                                                                </VTooltip>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                                <li class="flex flex-col items-center py-2">
                                    <ComponentLoading v-if="(conversationStore.compose.length || conversationStore.interactions.length) && conversationStore.isLoading" size="sm" class="py-4" />
                                    <div aria-hidden="true" class="h-4"></div>
                                    <InfiniteScrollTrigger :isLoading="conversationStore.isLoading" :hasMore="conversationStore.hasMore" :loadMore="loadMore" :rootEl="conversationsScrollEl" />
                                </li>
                            </template>
                        </ul>
                    </div>

                    <!-- RAG SECTION (unchanged) -->
                    <div v-else>
                        <div class="mb-4 flex items-center justify-between">
                            <span class="text-xs font-semibold text-gray-600 uppercase dark:text-neutral-400">CONVERSATIONS</span>
                            <button @click="showRag = false" class="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-neutral-700">
                                <span class="material-symbols-outlined h-5 w-5 text-gray-600 dark:text-neutral-300"> expand_circle_down </span>
                            </button>
                        </div>

                        <div class="mt-2 mb-2 flex items-center text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-neutral-400">
                            <span>Mozart Admin</span>
                            <div class="ml-3 flex-grow border-t border-gray-300 dark:border-neutral-700" />
                        </div>
                        <SidebarNavItem to="/admin/rag/vector-search" icon="MagnifyingGlassIcon" label="Vector Search" class="mb-4" />

                        <div class="mt-4 mb-2 flex items-center text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-neutral-400">
                            <span>RAG Management</span>
                            <div class="ml-3 flex-grow border-t border-gray-300 dark:border-neutral-700" />
                        </div>
                        <ul class="mb-4 space-y-1">
                            <SidebarNavItem to="/admin/rag/manage/worker" icon="UserGroupIcon" label="Workers" />
                            <SidebarNavItem to="/admin/rag/manage/queue" icon="Bars3BottomLeftIcon" label="Queues" />
                            <SidebarNavItem to="/admin/rag/manage/collection" icon="InboxStackIcon" label="Collections" />
                            <SidebarNavItem to="/admin/rag/vectorize" icon="SparklesIcon" label="Vectorize" />
                            <SidebarNavItem :to="dataPageUrl" icon="DocumentTextIcon" label="Data" />
                        </ul>

                        <div class="mt-2 mb-0 flex items-center text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-neutral-400">
                            <span>Console</span>
                            <div class="ml-3 flex-grow border-t border-gray-300 dark:border-neutral-700" />
                        </div>
                        <ul class="space-y-1">
                            <SidebarNavItem to="/admin/mozart/system-prompt" icon="AdjustmentsHorizontalIcon" label="System Prompt" />
                            <SidebarNavItem to="/admin/mozart/logs" icon="DocumentTextIcon" label="System Logs" />
                            <SidebarNavItem to="/admin/mozart/summarize" icon="SparklesIcon" label="Summarize" />
                            <SidebarNavItem to="/admin/llm-testing" icon="BeakerIcon" label="LLM Testing" />
                        </ul>

                        <!-- Footer Vector DB Selector -->
                        <div
                            class="mx-2 my-6 mb-20 flex max-w-[200px] cursor-pointer items-center gap-x-1 overflow-hidden rounded-md bg-neutral-300 px-2 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-50"
                            @click="emit('showVectorDatabaseConfig')"
                        >
                            <span class="shrink-0">{{ vectorDatabaseConfig.currentlySelectedHost }}</span>
                            <span class="shrink-0">/</span>
                            <span class="shrink-0">{{ vectorDatabaseConfig.currentlySelectedSource }}</span>
                            <span class="shrink-0">/</span>
                            <span class="min-w-0 truncate">
                                {{ vectorDatabaseConfig.currentCollectionName }}
                            </span>
                        </div>
                </div>
            </div>
        </div>
        </div>

        <ShareConversationPopup :show="showShareConversationPopup" @update:show="handleUpdateShow" :module="'conversation'" />
    </div>
</template>

<script setup lang="ts">
    import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from "vue"
    import { useRoute, useRouter } from "vue-router"
    import { useUserStore } from "@/store/user"
    import SidebarNavItem from "@/layouts/sidebars/SidebarItem.vue"
    import useVectorDatabaseConfig from "@/composables/useVectorDatabaseConfig"
    import InfiniteScrollTrigger from "./InfiniteScrollTrigger.vue"
    import { useConversationSwitching } from "~/composables/useConversationSwitching"
    import { removeMarkup } from "~/util/index"
    import { ChartBarIcon, DocumentTextIcon, PlusCircleIcon, UserIcon, Cog6ToothIcon, KeyIcon, CpuChipIcon, UsersIcon, CalendarDaysIcon, CreditCardIcon, ShieldCheckIcon, LinkIcon, WrenchIcon, BuildingOfficeIcon, ServerStackIcon } from "@heroicons/vue/24/solid"

    // emits
    const emit = defineEmits(["deleteConversation", "showVectorDatabaseConfig", "moveConversationToFolder", "archiveConversation", "restoreConversation", "editProject", "archiveProject", "deleteProject", "restoreProject"])

    // routing & stores
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    const conversationStore = useConversationStore()
    const conversationSvc = useConversation()
    const ragSvc = useRag()
    const vectorDatabaseConfig = useVectorDatabaseConfig()
    const ragStore = useRagStore()
    
    // Computed URL for Data page with current collection and page
    const dataPageUrl = computed(() => {
        const collection = ragStore.currentCollection
        // Only preserve page number if we're currently on the data route
        const isOnDataRoute = route.path === '/admin/rag/data'
        
        let currentPage = '1'
        if (isOnDataRoute) {
            // On data route - use URL query parameter
            currentPage = (route.query.page as string) || '1'
        } else if (collection) {
            // Not on data route - try to read from localStorage
            const storageKey = `rag_data_page_${collection}`
            currentPage = localStorage.getItem(storageKey) || '1'
        }
        
        if (collection) {
            return `/admin/rag/data?collection=${encodeURIComponent(collection)}&page=${currentPage}`
        }
        return '/admin/rag/data'
    })

    // fixed top UI
    const showShareConversationPopup = ref(false)
    const handleUpdateShow = (value: boolean) => {
        if (!value) showShareConversationPopup.value = false
    }

    // profile nav config
    const profileNavItems = [
        { label: "Profile", icon: "UserIcon", route: "/profile/info", isAdmin: false },
        { label: "Organization", icon: "BuildingOfficeIcon", route: "/profile/organization", isAdmin: false },
        { label: "Preferences", icon: "Cog6ToothIcon", route: "/profile/preferences", isAdmin: false },
        { label: "Current Model", icon: "CpuChipIcon", route: "/profile/model", isAdmin: false },
        { label: "API Keys", icon: "KeyIcon", route: "/profile/api-keys", isAdmin: false },
        { label: "Plan", icon: "CalendarDaysIcon", route: "/profile/plan", isAdmin: false },
        { label: "Billing", icon: "CreditCardIcon", route: "/profile/billing", isAdmin: false },
        { label: "Security", icon: "ShieldCheckIcon", route: "/profile/security", isAdmin: false },
        { label: "Integrations", icon: "LinkIcon", route: "/profile/integrations", isAdmin: false },
        { label: "User Management", icon: "UsersIcon", route: "/profile/management", isAdmin: true },
        { label: "Model Management", icon: "ServerStackIcon", route: "/admin/modelManagement", isAdmin: true },
        { label: "Analytics", icon: "ChartBarIcon", route: "/profile/analytics", isAdmin: true },
    ]
    const profileIcons = {
        ChartBarIcon,
        DocumentTextIcon,
        PlusCircleIcon,
        UserIcon,
        Cog6ToothIcon,
        KeyIcon,
        CpuChipIcon,
        UsersIcon,
        CalendarDaysIcon,
        CreditCardIcon,
        ShieldCheckIcon,
        LinkIcon,
        WrenchIcon,
        BuildingOfficeIcon,
        ServerStackIcon,
    }
    const baseNavItem = "flex items-center gap-x-3 w-full px-3 py-2 rounded-md font-medium transition-colors duration-150 text-gray-700 dark:text-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"

    const userProfileNavItems = computed(() => profileNavItems.filter((i) => !i.isAdmin))
    const adminProfileNavItems = computed(() => profileNavItems.filter((i) => i.isAdmin))
    const isProfileRoute = computed(() => route.path.startsWith("/profile") || route.path.startsWith("/admin/modelManagement"))

    // RAG collapse
    const showRag = ref(false)
    const isRAGRoute = computed(() => route.path.startsWith("/admin/rag") || route.path.startsWith("/admin/mozart") || route.path.startsWith("/admin/llm-testing"))
    watch(
        () => route.path,
        () => {
            showRag.value = isRAGRoute.value
        },
        { immediate: true }
    )

    // state for collapsible sections + scroll els
    const projectsOpen = ref(true)
    const conversationsOpen = ref(true)
    const projectsScrollEl = ref<HTMLElement | null>(null)
    const conversationsScrollEl = ref<HTMLElement | null>(null)

    // merge conversations groups (original)
    const conversationGroups = ref(conversationStore.groupedConversations)
    const mergedGroups = computed(() => {
        const map: Record<string, any[]> = {}
        const order: string[] = []
        conversationGroups.value.forEach((g: any) => {
            const k = Object.keys(g)[0]
            if (!order.includes(k)) order.push(k)
            map[k] = [...g[k]]
        })
        return order.map((k) => ({ [k]: map[k] }))
    })
    const hasConversations = computed(() => mergedGroups.value.some((g) => g[Object.keys(g)[0]].length))

    // sync data
    watch(
        () => conversationStore.groupedConversations,
        (v) => (conversationGroups.value = v)
    )

    // UI state
    const conversationId = ref<string | null>(null)
    const activeDropdown = ref<string | null>(null)
    const dropdownPos = ref("bottomStart")
    const currentlyEditingId = ref<string | null>(null)
    const editTitle = ref("")
    const editInputs: Record<string, HTMLElement> = {}

    const itemBase = "group flex cursor-pointer items-center justify-between gap-x-3.5 rounded-lg p-1 text-sm transition-colors"
    const itemActive = (c: any) => (c.conversationId === conversationId.value ? "bg-gray-200 text-gray-800 dark:bg-neutral-700 dark:text-white" : "")
    const itemInactive = (c: any) => (c.conversationId !== conversationId.value ? "text-gray-700 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800" : "")

    // dropdown options (original)
    const menuOptions = [
        [
            { label: "Share", icon: "share" },
            { label: "Rename", icon: "edit" },
            { label: "Delete", icon: "delete" },
            //{ label: "Move to Folder", icon: "folder" },
        ],
    ]
    const newProjectMenuOptions = [
        [
            { label: "Overview", icon: "overview" },
            { label: "Create Project", icon: "create" },
        ],
    ]
    const projectMenuOptions = [
        [
            { label: "Edit", icon: "edit" },
            { label: "Delete", icon: "delete" },
        ],
    ]
    const archivedMenuOptions = [
        [
            { label: "Restore", icon: "restore" },
            { label: "Delete", icon: "delete" },
        ],
    ]

    function getMenuOptions(conv: any) {
        let options: { label: string; icon: string }[][] = [...menuOptions]
        if (conv.isArchived) options.push([{ label: "Restore", icon: "restore" }])
        else options.push([{ label: "Archive", icon: "archive" }])
        return options
    }
    function getArchivedMenuOptions() {
        return archivedMenuOptions
    }

    // enhanced conversation switching
    const conversationSwitching = useConversationSwitching()

    // navigation actions (original)
    async function openConversation(conv: any) {
        if (conversationSwitching.isLoading.value) return
        let success = false
        if (conv.isShared) {
            success = await conversationSwitching.switchToConversation(conv.conversationId, {
                isSharedConversation: conv.isShared,
                sharedConversationOwnerId: conv.userId,
            })
        } else {
            success = await conversationSwitching.switchToConversation(conv.conversationId)
        }
        if (success) conversationId.value = conv.conversationId
    }

    // Open archived conversation
    async function openArchivedConversation(conv: any) {
        if (conversationSwitching.isLoading.value) return
        let success = false
        if (conv.isShared) {
            success = await conversationSwitching.switchToConversation(conv.conversationId, {
                isSharedConversation: conv.isShared,
                sharedConversationOwnerId: conv.userId,
            })
        } else {
            success = await conversationSwitching.switchToConversation(conv.conversationId)
        }
        if (success) conversationId.value = conv.conversationId
    }

    // dropdown handlers (original)
    function toggleDropdown(id: string) {
        activeDropdown.value = activeDropdown.value === id ? null : id
    }
    function closeDropdown() {
        activeDropdown.value = null
    }
    function handleMenu(item: any, id: string) {
        closeDropdown()
        const act = item.label.toLowerCase()
        if (act === "delete") {
            emit("deleteConversation", { shortName: "Delete Conversation", title: "Are you sure you want to delete this conversation?", subtitle: "This action is permanent and cannot be undone.", confirmButtonText: "Delete", confirmButtonColor: "#FF5555", closeOnTopRight: true }, id)
        } else if (act === "rename") {
            currentlyEditingId.value = id
            editTitle.value = conversationStore.conversations[id]?.title || ""
            nextTick(() => editInputs[id]?.focus())
        } else if (act === "share") {
            conversationStore.sharedConversationId = id
            showShareConversationPopup.value = true
            useConversation().getCollaborators(conversationStore.sharedConversationId || id)
            watch(
                () => conversationStore.groupedConversations,
                (v) => (conversationGroups.value = v)
            )
        } else if (act === "move to folder") {
            emit("moveConversationToFolder", { shortName: "Move to Folder", title: "Are you sure you want to move this conversation to a folder?", subtitle: "This will move the conversation to the selected folder.", confirmButtonText: "Move", confirmButtonColor: "#FFD700", closeOnTopRight: true }, id)
        } else if (act === "archive") {
            emit("archiveConversation", { shortName: "Archive Conversation", title: "Are you sure you want to archive this conversation?", subtitle: "This will move the conversation to the archive folder.", confirmButtonText: "Archive", confirmButtonColor: "#FF5555", closeOnTopRight: true }, id)
        } else if (act === "restore") {
            emit("restoreConversation", { shortName: "Restore Conversation", title: "Are you sure you want to restore this conversation?", subtitle: "This will move the conversation from the archive folder.", confirmButtonText: "Restore", confirmButtonColor: "#FFD700", closeOnTopRight: true }, id)
        }
    }
    function handleNewProjectMenu(item: any) {
        closeDropdown()
        const act = item.label.toLowerCase()
        if (act === "overview") {
            router.push("/projects")
        } else if (act === "create project") {
            emit("editProject", null)
        }
    }
    function handleProjectMenu(item: any, projectId: string) {
        closeDropdown()
        const act = item.label.toLowerCase()
        if (act === "edit") emit("editProject", projectId)
        else if (act === "delete") emit("deleteProject", { shortName: "Delete Project", title: "Are you sure you want to delete this project?", subtitle: "This action is permanent and cannot be undone.", confirmButtonText: "Delete", confirmButtonColor: "#FF5555", closeOnTopRight: true }, projectId)
    }

    // helpers (original)
    const projectConversations = (projectId: string) => conversationStore.byProject?.[projectId]?.conversations ?? []
    const projectOpen = reactive<Record<string, boolean>>({})
    const projectLoading = reactive<Record<string, boolean>>({})
    const archiveOpen = ref(false)
    const archiveLoading = ref(false)

    const handleProjectClick = (project: { projectId: string }) => {
        // Navigate to project page
        router.push(`/compose/project/${project.projectId}`)
    }

    const toggleProject = async (project: { projectId: string }) => {
        const id = project.projectId
        projectOpen[id] = !projectOpen[id]
        if (projectOpen[id] && !conversationStore.byProject?.[id]?.loaded) {
            projectLoading[id] = true
            try {
                await conversationStore.fetchConversationsByProject(id)
            } finally {
                projectLoading[id] = false
            }
        }
    }

    const toggleArchive = async () => {
        archiveOpen.value = !archiveOpen.value
        if (archiveOpen.value && !conversationStore.archivesLoaded) {
            archiveLoading.value = true
            try {
                await conversationStore.fetchArchivedConversations()
                conversationStore.archivesLoaded = true
            } finally {
                archiveLoading.value = false
            }
        }
    }

    // rename refs
    function setEdit(el: HTMLElement | null, id: string) {
        if (el) editInputs[id] = el
        else delete editInputs[id]
    }
    function createSetEditRef(id: string) {
        return (el: any) => setEdit(el, id)
    }

    // trim + save
    function trimTitle(s: string, maxLength: number = 22) {
        return s.length > maxLength ? `${s.substring(0, maxLength)}…` : s
    }
    async function saveTitle(id: string) {
        if (currentlyEditingId.value !== id) return
        await conversationSvc.renameConversationTitleById(id, editTitle.value)
        currentlyEditingId.value = null
    }

    // pagination (unchanged)
    function loadMore() {
        conversationStore.fetchPaginatedConversations(false, true)
    }

    // scroll handlers to close dropdown on scroll
    const handleConversationsScroll = () => {
        if (activeDropdown.value) {
            closeDropdown()
        }
    }
    const handleProjectsScroll = () => {
        if (activeDropdown.value) {
            closeDropdown()
        }
    }

    // setup scroll listeners when elements are available
    const setupScrollListeners = () => {
        removeScrollListeners()
        nextTick(() => {
            if (conversationsScrollEl.value) {
                conversationsScrollEl.value.addEventListener("scroll", handleConversationsScroll, { passive: true })
            }
            if (projectsScrollEl.value) {
                projectsScrollEl.value.addEventListener("scroll", handleProjectsScroll, { passive: true })
            }
        })
    }

    // remove scroll listeners
    const removeScrollListeners = () => {
        if (conversationsScrollEl.value) {
            conversationsScrollEl.value.removeEventListener("scroll", handleConversationsScroll)
        }
        if (projectsScrollEl.value) {
            projectsScrollEl.value.removeEventListener("scroll", handleProjectsScroll)
        }
    }

    // watch route changes to setup/remove listeners when switching between profile and non-profile routes
    watch(
        () => route.path,
        () => {
            if (!isProfileRoute.value) {
                setupScrollListeners()
            } else {
                removeScrollListeners()
            }
        }
    )

    // initial load
    onMounted(async () => {
        if (isProfileRoute.value) {
            if (route.path === "/profile") {
                router.replace("/profile/info")
                return
            }
            const idx = Number(route.query.index)
            if (!isNaN(idx) && route.path === "/profile") {
                const routeMap: { [key: number]: string } = {
                    0: "/profile/info",
                    1: "/profile/preferences",
                    2: "/profile/appearance",
                    3: "/profile/model",
                    4: "/profile/api-keys",
                    5: "/profile/plan",
                    6: "/profile/billing",
                    7: "/profile/management",
                    8: "/profile/security",
                    9: "/profile/analytics",
                    10: "/profile/integrations",
                    11: "/profile/organization",
                }
                router.replace(routeMap[idx] || "/profile/info")
                return
            }
            return
        }
        await conversationStore.fetchConversations()
        // Collections are already loaded by layout, no need to call again

        // Add scroll listeners after DOM is ready
        setupScrollListeners()
    })

    onUnmounted(() => {
        removeScrollListeners()
    })
</script>

<style scoped>
    /* Tailwind handles styling */
</style>
