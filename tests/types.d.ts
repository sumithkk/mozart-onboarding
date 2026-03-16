// Test environment type declarations
declare global {
    // Vue component imports
    const defineComponent: (typeof import("vue"))["defineComponent"]
    const ref: (typeof import("vue"))["ref"]
    const reactive: (typeof import("vue"))["reactive"]
    const computed: (typeof import("vue"))["computed"]
    const watch: (typeof import("vue"))["watch"]
    const watchEffect: (typeof import("vue"))["watchEffect"]
    const onMounted: (typeof import("vue"))["onMounted"]
    const onUnmounted: (typeof import("vue"))["onUnmounted"]
    const nextTick: (typeof import("vue"))["nextTick"]

    // Nuxt composables
    const useRuntimeConfig: () => any
    const useRouter: () => any
    const useRoute: () => any
    const useState: (key: string, init?: () => any) => any
    const useFetch: (url: string, options?: any) => any
    const navigateTo: (to: string) => any
    const useNuxtApp: () => any
    const useHead: (meta: any) => void

    // Pinia stores
    const useUserStore: () => any
    const useDocumentsStore: () => any
    const useConversationStore: () => any
    const useMessageStore: () => any
    const useRagStore: () => any
    const useFileSystemStore: () => any
    const useOrganizationStore: () => any
    const useUserPermissionStore: () => any
    const useModelStore: () => any
    const useAbortControllerStore: () => any
    const useLADataStore: () => any

    // Custom composables
    const useUser: () => any
    const useCompletion: () => any
    const useConversation: () => any
    const useRag: () => any
    const useAdmin: () => any
    const useFileSystem: () => any
    const usePayments: () => any
    const useOrganization: () => any

    // Pinia utilities
    const storeToRefs: (typeof import("pinia"))["storeToRefs"]

    // Nuxt utilities
    const defineNuxtConfig: (config: any) => any
    const defineAppConfig: (config: any) => any
    const defineNuxtPlugin: (plugin: any) => any
    const defineNuxtRouteMiddleware: (middleware: any) => any
}

export {}
