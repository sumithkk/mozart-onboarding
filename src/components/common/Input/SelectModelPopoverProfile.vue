<template>
    <div class="relative flex inline-block items-end text-left" ref="dropdownRef">
        <div class="border-strokeColor bg-sideBarBackgroundColor focus:border-linkColor inline-flex w-full justify-between rounded-md border-2 bg-gray-200 px-4 py-[0.6rem] text-base font-medium text-[--textColor] text-gray-700 transition-colors outline-none hover:bg-gray-300 focus:outline-none dark:text-white" @click="toggleDropdown">
            {{ currentLabel }}
            <svg class="ml-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>

        <div v-if="isOpen" class="ring-opacity-5 absolute top-full left-0 z-10 mt-2 max-h-40 w-full overflow-x-auto overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black">
            <div class="py-2">
                <div v-for="(model, index) in sortedModels.filter((m) => m.accessible)" :key="index" class="flex cursor-pointer items-center px-3 py-1 hover:bg-gray-100" @click="selectModel(model)" :class="model.model === currentModel.model ? 'bg-gray-200' : ''">
                    <img v-if="model.image" :src="model.image" alt="model image" class="mr-2 h-5 w-5 object-cover" />
                    <div class="flex-1 text-left">
                        <p class="leading-none text-gray-700">{{ model.name }}</p>
                        <p class="truncate text-xs text-gray-500">{{ trimModelDescription(model.description) }}</p>
                    </div>
                    <span v-if="model.model === currentModel.model" class="bg-logoColor inline-block h-2 w-2 rounded-full"></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref, onMounted, onBeforeUnmount } from "vue"

    const emit = defineEmits<{ (e: "toggleModel"): void }>()
    const modelStore = useModelStore()
    const isOpen = useState(() => false)
    const dropdownRef = ref<HTMLElement | null>(null)

    const currentModel = computed(() => modelStore.getCurrent())
    const currentLabel = computed(() => currentModel.value?.name ?? "Select Model")

    const sortedModels = computed(() => {
        const list = [...modelStore.models]
        const i = list.findIndex((m) => m.model === currentModel.value.model)
        if (i !== -1) list.unshift(list.splice(i, 1)[0])
        return list
    })

    const trimModelDescription = (d: string) => (d.length > 40 ? d.slice(0, 40) + "…" : d)

    function toggleDropdown() {
        isOpen.value = !isOpen.value
    }

    function selectModel(model: any) {
        modelStore.setCurrent(model)
        localStorage.setItem("currentModel", model.model || "")
        emit("toggleModel")
        isOpen.value = false
    }

    function outside(e: MouseEvent) {
        if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) isOpen.value = false
    }

    onMounted(() => document.addEventListener("click", outside))
    onBeforeUnmount(() => document.removeEventListener("click", outside))
</script>
