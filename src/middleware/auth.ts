export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.server) return // Only run on client-side
    return
})
