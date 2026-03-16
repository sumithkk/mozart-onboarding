export default defineNuxtPlugin((nuxtApp) => {
    const loadGoogleApis = (): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            // If scripts are already loaded, resolve immediately
            if (typeof window.gapi !== "undefined" && typeof window.google !== "undefined") {
                return resolve()
            }

            // Load the gapi script
            const script1 = document.createElement("script")
            script1.src = "https://apis.google.com/js/api.js"
            script1.async = true
            script1.onload = () => {
                // Once gapi is loaded, load client + picker
                const script2 = document.createElement("script")
                script2.src = "https://apis.google.com/js/client.js?onload=__onGoogleLoaded"
                script2.async = true

                // Global callback
                ;(window as any).__onGoogleLoaded = () => resolve()

                script2.onerror = () => {
                    reject(new Error("Failed to load Google client (client.js)."))
                }

                document.head.appendChild(script2)
            }

            script1.onerror = () => {
                reject(new Error("Failed to load gapi script (api.js)."))
            }

            document.head.appendChild(script1)
        })
    }

    // Provide the function for use in components
    return {
        provide: {
            loadGoogleApis,
        },
    }
})
