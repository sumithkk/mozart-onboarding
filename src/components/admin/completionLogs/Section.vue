<template>
    <div class="mb-6">
        <div class="mb-3 flex items-center gap-2">
            <div v-if="icon" class="flex h-7 w-7 items-center justify-center rounded-lg" :class="iconBgClass">
                <component :is="iconComponent" class="h-4 w-4" :class="iconColorClass" />
            </div>
            <h4 class="text-gray-900 dark:text-gray-100 text-sm font-semibold">{{ title }}</h4>
        </div>
        <div :class="{ 'ml-9': icon }">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, h } from "vue"

const props = defineProps<{
    title: string
    icon?: "id" | "model" | "tokens" | "prompt" | "response" | "mcp" | "documents"
}>()

const iconComponent = computed(() => {
    const icons: Record<string, any> = {
        id: {
            render: () =>
                h(
                    "svg",
                    { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" },
                    [
                        h("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            d: "M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z",
                        }),
                    ]
                ),
        },
        model: {
            render: () =>
                h(
                    "svg",
                    { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" },
                    [
                        h("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            d: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 15.5m14.8-.2l.963-.241a2.25 2.25 0 001.487-2.121V5.38a2.25 2.25 0 00-1.702-2.183l-.013-.003A23.998 23.998 0 0012 3a24.001 24.001 0 00-8.535.194l-.013.003A2.25 2.25 0 001.75 5.38v7.058a2.25 2.25 0 001.487 2.121l.963.241m14.6 0a9.056 9.056 0 00-3.55-.693 9.056 9.056 0 00-3.55.693",
                        }),
                    ]
                ),
        },
        tokens: {
            render: () =>
                h(
                    "svg",
                    { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" },
                    [
                        h("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            d: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
                        }),
                    ]
                ),
        },
        prompt: {
            render: () =>
                h(
                    "svg",
                    { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" },
                    [
                        h("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            d: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z",
                        }),
                    ]
                ),
        },
        response: {
            render: () =>
                h(
                    "svg",
                    { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" },
                    [
                        h("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            d: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
                        }),
                    ]
                ),
        },
        mcp: {
            render: () =>
                h(
                    "svg",
                    { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" },
                    [
                        h("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            d: "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z",
                        }),
                    ]
                ),
        },
        documents: {
            render: () =>
                h(
                    "svg",
                    { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" },
                    [
                        h("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            d: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
                        }),
                    ]
                ),
        },
    }
    return props.icon ? icons[props.icon] : null
})

const iconBgClass = computed(() => {
    const classes: Record<string, string> = {
        id: "bg-blue-100 dark:bg-blue-900/30",
        model: "bg-purple-100 dark:bg-purple-900/30",
        tokens: "bg-emerald-100 dark:bg-emerald-900/30",
        prompt: "bg-amber-100 dark:bg-amber-900/30",
        response: "bg-cyan-100 dark:bg-cyan-900/30",
        mcp: "bg-rose-100 dark:bg-rose-900/30",
        documents: "bg-slate-100 dark:bg-slate-700/50",
    }
    return props.icon ? classes[props.icon] : ""
})

const iconColorClass = computed(() => {
    const classes: Record<string, string> = {
        id: "text-mozart-blue dark:text-mozart-blue-400",
        model: "text-purple-600 dark:text-purple-400",
        tokens: "text-emerald-600 dark:text-emerald-400",
        prompt: "text-amber-600 dark:text-amber-400",
        response: "text-cyan-600 dark:text-cyan-400",
        mcp: "text-rose-600 dark:text-rose-400",
        documents: "text-slate-600 dark:text-slate-400",
    }
    return props.icon ? classes[props.icon] : ""
})
</script>
