import { useAuthCheck } from "~/composables/useAuthCheck"

export default defineNuxtPlugin(async () => {
    const modelStore = useModelStore()
    const userStore = useUserStore()
    const router = useRouter()
    const { isPublicRoute } = useAuthCheck()

    // Skip loading models on public routes - they're not needed there
    // Models will be loaded when user navigates to protected routes
    // or when middleware hydrates the user on protected routes
    const loadModelsForRoute = async (path: string) => {
        // Skip if models already loaded (cached)
        if (modelStore._modelsLoaded) {
            return
        }

        const pathIsPublic = isPublicRoute(path)
        
        // Only load models on protected routes
        // On public routes, models aren't needed unless user is authenticated
        // But we don't know auth state yet (middleware hasn't run), so skip
        if (!pathIsPublic) {
            // Protected route - load models
            // Pass session data if available to avoid duplicate getSession() call
            await modelStore.loadModels(userStore._lastSessionData)
        }
    }

    // Load models for initial route
    await loadModelsForRoute(router.currentRoute.value.path)

    // Also load models when navigating to protected routes
    router.afterEach((to: any) => {
        loadModelsForRoute(to.path)
    })
})
