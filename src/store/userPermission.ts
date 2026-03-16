import { defineStore } from "pinia"
import { ref, computed } from "vue"
const windowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 0)
const isMobile = computed(() => windowWidth.value < 768)

if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
        windowWidth.value = window.innerWidth
    })
}
let renderRoute = isMobile.value ? "/compose" : "/workbench/files"

export const useUserPermissionStore = defineStore("userPermission", {
    state: (): IUserPermission => ({
        permissions: {
            admin: {
                allowedLinks: ["*"],
                defaultRoute: renderRoute,
            },
            landAdvisor: {
                allowedLinks: ["/", "/home", "/org/landadvisors", "/org/landadvisors", "/org/landadvisors/profile", "/privacy"],
                defaultRoute: "/org/landadvisors/data",
            },
            basic: {
                allowedLinks: ["/", "/home", "/compose", "/workbench", "/workbench/files", "/data", "/profile", "/accept-invite", "/privacy", "/test", "/payment"],
                defaultRoute: renderRoute,
            },
        },
    }),
    actions: {},
    getters: {},
})
