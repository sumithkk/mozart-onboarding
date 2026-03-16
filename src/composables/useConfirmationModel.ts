import { ref, type Ref } from "vue"

const confirmModalState: Ref<{
    show: boolean
    options: ModalOptions | null
    resolve?: (result: ModalConfirmationResult | null) => void
}> = ref({
    show: false,
    options: null,
})

export function useModal() {
    const showConfirmModal = (options: ModalOptions) => {
        confirmModalState.value = {
            show: true,
            options,
        }
        return new Promise<ModalConfirmationResult | null>((resolve) => {
            confirmModalState.value.resolve = resolve
        })
    }
    const confirmModal = () => {
        if (confirmModalState.value.resolve) {
            confirmModalState.value.resolve("confirm")
            closeModal()
        }
    }
    const cancelModal = () => {
        if (confirmModalState.value.resolve) {
            confirmModalState.value.resolve("cancel")
            closeModal()
        }
    }
    const closeModal = () => {
        confirmModalState.value = { show: false, options: null }
    }
    return {
        confirmModalState,
        showConfirmModal,
        confirmModal,
        cancelModal,
    }
}
