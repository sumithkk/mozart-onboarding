import cookie from "js-cookie"
import { useUserStore } from "@/store/user"

export default function completionService($config: any) {
    const userStore = useUserStore()
    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + cookie.get("mozart"),
        "X-Timezone": userStore.timezone || "",
    }

    async function completions(data: ICompletionData, abortController: AbortController, callback: (lastLine: any) => void) {
        const completionsApiUrl = $config.public.apiUrl + "/api/v1/completions"
        let _data = {
            action: data.action,
            messages: data.messages,
            model: data.model,
            isThinkingSupported: data.isThinkingSupported,
            AIName: data.AIName,
            stream: data.stream,
            rag: data.rag,
            rag_sources: data.rag_sources,
            conversationId: data.conversationId || null,
            userMessage: data.userMessage || null,
            documentId: data.documentId || null,
            userId: data.userId || null,
            collection: data.collectionName || null,
            systemPrompt: data.systemPrompt || null,
            writingStyle: data.writingStyle || null,
            toolChoice: data.toolChoice || "none",
            projectId: data.projectId || null,
        }

        let abortId: string | null = null

        try {
            let response = await fetch(completionsApiUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(_data),
                signal: abortController?.signal,
                credentials: "include",
            })

            if (!response.ok) {
                let err = await response.json()
                return callback("ERROR" + JSON.stringify(err))
            }

            const decoder = new TextDecoder("utf-8")
            const reader = response.body?.getReader()

            let completeResponse = ""
            let incompleteLine: any = ""
            let done = false

            while (!done) {
                try {
                    const { value, done: _done }: any = await reader?.read()
                    done = _done
                    if (value) {
                        const decoded = decoder.decode(value, { stream: true })
                        completeResponse += decoded

                        let chunk = incompleteLine + decoded
                        const lines = chunk.split("\n\n\n\n")
                        incompleteLine = lines.pop()

                        lines.forEach((line) => {
                            if (!line) return
                            try {
                                const jsonPart = line.substring(6)
                                const parsed = JSON.parse(jsonPart)
                                if (parsed.type === "init" && parsed.abortId) {
                                    abortId = parsed.abortId
                                    // Modify the abortController's abort method
                                    const originalAbort = abortController.abort
                                    abortController.abort = () => {
                                        if (abortId) {
                                            fetch(`${completionsApiUrl}/abort/${abortId}`, {
                                                method: "GET",
                                                credentials: "include",
                                            })
                                                .then(() => console.error("Abort signal sent"))
                                                .catch((err) => console.error("Failed to send abort signal", err))
                                        }
                                        originalAbort.call(abortController)
                                    }
                                } else {
                                    callback(parsed)
                                }
                            } catch (error) {
                                console.log("Failed to parse JSON:", error)
                                console.log("Line:", line)
                            }
                        })
                    }
                } catch (error: any) {
                    if (error.name === "AbortError") {
                        console.log("Stream reading was aborted")
                        callback("Stream aborted")
                        break // Exit the while loop if aborted
                    } else {
                        throw error // Rethrow if it's a different type of error
                    }
                }
            }
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Fetch aborted by the user")
                callback("Fetch aborted")
            } else {
                console.error("Error occurred during the fetch operation:", error)
                callback("ERROR" + JSON.stringify(error))
            }
        }
    }
    interface IResponseGenerationData {
        prompt: string
        AIName: string
    }
    async function getResponse(data: IResponseGenerationData) {
        const responseGenerationApiUrl = $config.public.apiUrl + "/api/v1/getResponse"
        let _data = {
            prompt: data.prompt,
            AI: data.AIName,
        }
        try {
            let response = await fetch(responseGenerationApiUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(_data),
                credentials: "include",
            })

            if (!response.ok) {
                let err = await response.json()
                return "ERROR" + JSON.stringify(err)
            }

            let responseData = await response.json()
            return responseData.data
        } catch (error: any) {
            console.error("Error occurred during the fetch operation:", error)
            return "ERROR" + JSON.stringify(error)
        }
    }
    return {
        completions,
        getResponse,
    }
}
