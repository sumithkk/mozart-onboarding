import { onMounted, onUnmounted, ref } from "vue"

export function useCopyToClipboard() {
    const copyText = ref<string>("")

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(copyText.value)
        } catch (err) {
            console.error("Failed to copy: ", err)
        }
    }

    const copyToClipboard = (text: string) => {
        copyText.value = text
        handleCopy()
    }

    onMounted(() => {
        // Handle pasting from clipboard into the textarea
        document.addEventListener("paste", function (event) {
            event.preventDefault()
            event.clipboardData.items[0].getAsString(function (data) {
                copyText.value = data
            })
        })
    })

    onUnmounted(() => {
        document.removeEventListener("paste", null)
    })

    return { copyToClipboard }
}
