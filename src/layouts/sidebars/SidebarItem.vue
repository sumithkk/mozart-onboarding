<template>
    <NuxtLink :to="to" class="mb-1 flex items-center gap-x-3 rounded-md px-3 py-2 font-semibold text-gray-700 transition-colors duration-150 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
        <component :is="icons[icon]" class="h-5 w-5 shrink-0" />
        <span class="truncate">{{ label }}</span>
    </NuxtLink>
</template>

<script setup lang="ts">
    import { PlusCircleIcon, UserGroupIcon, UserIcon, Cog6ToothIcon, KeyIcon, CpuChipIcon, UsersIcon, CalendarDaysIcon, CreditCardIcon, ShieldCheckIcon, LinkIcon, CircleStackIcon, Bars3BottomLeftIcon, InboxStackIcon, SparklesIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon, DocumentTextIcon, HomeIcon, WrenchIcon, FolderIcon, BeakerIcon } from "@heroicons/vue/24/solid"
    defineProps<{
        to: string
        label: string
        icon: keyof typeof icons
    }>()

    const icons = {
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
        CircleStackIcon,
        Bars3BottomLeftIcon,
        InboxStackIcon,
        SparklesIcon,
        MagnifyingGlassIcon,
        AdjustmentsHorizontalIcon,
        UserGroupIcon,
        HomeIcon,
        WrenchIcon,
        FolderIcon,
        BeakerIcon,
    }
</script>
