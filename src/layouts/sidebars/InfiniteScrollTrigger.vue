<!-- components/InfiniteScrollTrigger.vue -->
<template>
    <div ref="triggerRef" class="my-3 h-[20px] w-full"></div>
</template>

<script setup lang="ts">
    import { ref, toRef } from "vue"
    import { useIntersectionObserver } from "@vueuse/core"

    const props = defineProps<{
        isLoading: boolean
        hasMore: boolean
        loadMore: () => void
        rootEl?: HTMLElement | null
    }>()

    const triggerRef = ref<HTMLElement | null>(null)
    const rootElement = toRef(props, 'rootEl')

    useIntersectionObserver(
        triggerRef,
        ([entry]) => {
            if (entry.isIntersecting && props.hasMore && !props.isLoading) {
                props.loadMore()
            }
        },
        { 
            threshold: 0,
            rootMargin: '100px',
            root: rootElement
        }
    )
</script>
