import { describe, it, expect, vi, beforeEach } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import useUser from "../../../src/composables/useUser"

// Simple test for basic functionality
describe("useUser", () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    it("should export useUser function", () => {
        // This is a basic test to ensure the composable can be imported
        expect(typeof useUser).toBe("function")
    })

    it("should return login function", () => {
        const { login } = useUser()
        expect(typeof login).toBe("function")
    })

    it("should return getSessionData function", () => {
        const { getSessionData } = useUser()
        expect(typeof getSessionData).toBe("function")
    })

    it("should return uploadFile function", () => {
        const { uploadFile } = useUser()
        expect(typeof uploadFile).toBe("function")
    })

    it("should return sendResetPasswordEmail function", () => {
        const { sendResetPasswordEmail } = useUser()
        expect(typeof sendResetPasswordEmail).toBe("function")
    })

    it("should return deleteDocument function", () => {
        const { deleteDocument } = useUser()
        expect(typeof deleteDocument).toBe("function")
    })

    it("should return addAPIKey function", () => {
        const { addAPIKey } = useUser()
        expect(typeof addAPIKey).toBe("function")
    })

    it("should return loginWithGoogle function", () => {
        const { loginWithGoogle } = useUser()
        expect(typeof loginWithGoogle).toBe("function")
    })

    it("should return logout function", () => {
        const { logout } = useUser()
        expect(typeof logout).toBe("function")
    })

    it("should return register function", () => {
        const { register } = useUser()
        expect(typeof register).toBe("function")
    })

    it("should return uploadUserAvatar function", () => {
        const { uploadUserAvatar } = useUser()
        expect(typeof uploadUserAvatar).toBe("function")
    })

    it("should return validateIntegration function", () => {
        const { validateIntegration } = useUser()
        expect(typeof validateIntegration).toBe("function")
    })

    it("should return deleteAPIKey function", () => {
        const { deleteAPIKey } = useUser()
        expect(typeof deleteAPIKey).toBe("function")
    })

    it("should return getAPIKeys function", () => {
        const { getAPIKeys } = useUser()
        expect(typeof getAPIKeys).toBe("function")
    })

    it("should return getIntegrations function", () => {
        const { getIntegrations } = useUser()
        expect(typeof getIntegrations).toBe("function")
    })

    it("should return deleteUserIntegration function", () => {
        const { deleteUserIntegration } = useUser()
        expect(typeof deleteUserIntegration).toBe("function")
    })
})
