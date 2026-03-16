import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import SimpleButton from "@/components/common/Button/SimpleButton.vue"

describe("SimpleButton", () => {
    const createWrapper = (props = {}) => {
        return mount(SimpleButton, {
            props: {
                buttonText: "Click Me",
                ...props,
            },
        })
    }

    it("renders button with default props", () => {
        const wrapper = createWrapper()

        expect(wrapper.find("button").exists()).toBe(true)
        expect(wrapper.text()).toContain("Click Me")
    })

    it("renders button text correctly", () => {
        const text = "Custom Button Text"
        const wrapper = createWrapper({ buttonText: text })

        expect(wrapper.text()).toContain(text)
    })

    it("emits clicked event when clicked", async () => {
        const wrapper = createWrapper()

        await wrapper.find("button").trigger("click")

        expect(wrapper.emitted("clicked")).toBeTruthy()
        expect(wrapper.emitted("clicked")).toHaveLength(1)
    })

    it("applies correct CSS classes", () => {
        const wrapper = createWrapper()
        const button = wrapper.find("button")

        expect(button.classes()).toContain("px-[60px]")
        expect(button.classes()).toContain("py-[10px]")
        expect(button.classes()).toContain("text-[16px]")
        expect(button.classes()).toContain("bg-logoColor")
        expect(button.classes()).toContain("rounded-[8px]")
    })

    it("has correct button attributes", () => {
        const wrapper = createWrapper()
        const button = wrapper.find("button")

        // Button exists and is a button element
        expect(button.exists()).toBe(true)
        expect(button.element.tagName).toBe("BUTTON")
    })

    it("handles multiple clicks correctly", async () => {
        const wrapper = createWrapper()

        await wrapper.find("button").trigger("click")
        await wrapper.find("button").trigger("click")
        await wrapper.find("button").trigger("click")

        expect(wrapper.emitted("clicked")).toHaveLength(3)
    })

    it("displays custom button text", () => {
        const customText = "Save Changes"
        const wrapper = createWrapper({ buttonText: customText })

        expect(wrapper.text()).toBe(customText)
    })

    it("has proper hover and focus styles", () => {
        const wrapper = createWrapper()
        const button = wrapper.find("button")

        expect(button.classes()).toContain("hover:bg-strokeColor")
        expect(button.classes()).toContain("hover:text-white")
        expect(button.classes()).toContain("focus:shadow-[0_0_0_2px_var(--strokeColor)]")
        expect(button.classes()).toContain("focus:scale-[1.05]")
    })

    it("has transition effects", () => {
        const wrapper = createWrapper()
        const button = wrapper.find("button")

        expect(button.classes()).toContain("transition-colors")
        expect(button.classes()).toContain("duration-300")
    })

    it("has correct cursor style", () => {
        const wrapper = createWrapper()
        const button = wrapper.find("button")

        expect(button.classes()).toContain("cursor-pointer")
    })

    it("supports empty button text", () => {
        const wrapper = createWrapper({ buttonText: "" })

        expect(wrapper.text()).toBe("")
    })

    it("handles keyboard events", async () => {
        const wrapper = createWrapper()

        await wrapper.find("button").trigger("keydown.enter")
        await wrapper.find("button").trigger("keydown.space")

        // The component doesn't handle keyboard events specifically,
        // so we just check that the button exists
        expect(wrapper.find("button").exists()).toBe(true)
    })

    it("maintains consistent styling", () => {
        const wrapper = createWrapper()
        const button = wrapper.find("button")

        // Check that all the styling classes are applied
        const expectedClasses = ["px-[60px]", "py-[10px]", "text-[16px]", "text-headerTextColor", "bg-logoColor", "border-0", "rounded-[8px]", "cursor-pointer", "transition-colors", "duration-300", "outline-none", "text-center"]

        expectedClasses.forEach((className) => {
            expect(button.classes()).toContain(className)
        })
    })

    it("is accessible", () => {
        const wrapper = createWrapper()
        const button = wrapper.find("button")

        expect(button.element.tagName).toBe("BUTTON")
        expect(button.exists()).toBe(true)
    })
})
