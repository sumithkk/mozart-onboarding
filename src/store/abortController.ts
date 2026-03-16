import { defineStore } from "pinia"
import { ref } from "vue"

const controller = ref(new AbortController())

export const useAbortControllerStore = defineStore("abortController", {
    state: () => ({}), // No serialized state
    actions: {
        createNewController() {
            controller.value = new AbortController()
        },
        abortCurrentController() {
            controller.value.abort()
        },
        getController() {
            return controller.value
        },
    },
})
