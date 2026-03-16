export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.provide("$config", nuxtApp.$config)
})
