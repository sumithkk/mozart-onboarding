declare module "*.vue" {
    import type { DefineComponent } from "vue"
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module "@/components/common/Button/SimpleButton.vue" {
    import type { DefineComponent } from "vue"
    const component: DefineComponent<
        {
            buttonText?: string
        },
        {
            clicked: () => void
        },
        any
    >
    export default component
}
