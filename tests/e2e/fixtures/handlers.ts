import { http, HttpResponse } from "msw"
import { mockData } from "./mock-data"

// Get test credentials from environment variables
const TEST_USER = process.env.TEST_USER_EMAIL || "test@example.com"
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "password"
const TEST_USER_NAME = process.env.TEST_USER_USERNAME || "Test"

export const handlers = [
    // Auth endpoints
    http.post("http://localhost:2000/api/auth/login", async ({ request }) => {
        const { email, password } = (await request.json()) as any

        if (email === TEST_USER && password === TEST_PASSWORD) {
            return HttpResponse.json({
                code: 200,
                message: "Login successful",
                data: {
                    accessToken: "mock-jwt-token",
                    user: mockData.user,
                },
            })
        }

        return HttpResponse.json({ code: 401, message: "Invalid credentials" }, { status: 401 })
    }),

    http.post("http://localhost:2000/api/auth/register", async ({ request }) => {
        const userData = (await request.json()) as any

        return HttpResponse.json({
            code: 201,
            message: "User created successfully",
            data: {
                accessToken: "mock-jwt-token",
                user: { ...mockData.user, ...userData },
            },
        })
    }),

    http.get("http://localhost:2000/api/auth/session", () => {
        return HttpResponse.json({
            code: 200,
            message: "Session data retrieved",
            data: mockData.user,
        })
    }),

    // Better-auth session endpoint
    http.get("http://localhost:2000/api/auth/get-session", () => {
        return HttpResponse.json({
            user: mockData.user,
            session: {
                id: "test-session-id",
                userId: mockData.user.id,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
        })
    }),

    http.post("http://localhost:2000/api/auth/loginWithGoogle", async ({ request }) => {
        const { idToken } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Google login successful",
            data: {
                accessToken: "mock-jwt-token",
                user: mockData.user,
            },
        })
    }),

    http.post("http://localhost:2000/api/auth/signinWithGoogle", async ({ request }) => {
        const { idToken } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Google signin successful",
            data: {
                accessToken: "mock-jwt-token",
                user: mockData.user,
            },
        })
    }),

    http.post("http://localhost:2000/api/auth/loginWithApple", async ({ request }) => {
        const { idToken } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Apple login successful",
            data: {
                accessToken: "mock-jwt-token",
                user: mockData.user,
            },
        })
    }),

    http.post("http://localhost:2000/api/auth/sendResetPasswordEmail", async ({ request }) => {
        const { email } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Password reset email sent",
        })
    }),

    http.post("http://localhost:2000/api/auth/verifyResetPasswordToken", async ({ request }) => {
        const { token } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Token verified successfully",
        })
    }),

    http.post("http://localhost:2000/api/auth/updatePasswordViaRestToken", async ({ request }) => {
        const { token, newPassword } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Password updated successfully",
        })
    }),

    // User endpoints
    http.post("http://localhost:2000/api/user/uploadUserAvatar", () => {
        return HttpResponse.json({
            code: 200,
            message: "Avatar uploaded successfully",
            data: {
                avatarUrl: "http://localhost:2000/uploads/avatar.jpg",
            },
        })
    }),

    http.post("http://localhost:2000/api/user/updateUserInfo", async ({ request }) => {
        const userData = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "User info updated successfully",
            data: { ...mockData.user, ...userData },
        })
    }),

    http.post("http://localhost:2000/api/user/addUserInOrganization", async ({ request }) => {
        const { memberEmail, organizationId } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "User added to organization successfully",
            data: { memberEmail, organizationId },
        })
    }),

    http.post("http://localhost:2000/api/user/revokeSession", async ({ request }) => {
        const { tokenHash } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Session revoked successfully",
        })
    }),

    http.post("http://localhost:2000/api/user/addAPIKey", async ({ request }) => {
        const payload = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "API key saved successfully",
            data: payload,
        })
    }),

    http.post("http://localhost:2000/api/user/apiKeys/delete", async ({ request }) => {
        const { service } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "API key deleted successfully",
        })
    }),

    http.get("http://localhost:2000/api/user/apiKeys", () => {
        return HttpResponse.json({
            code: 200,
            message: "API keys retrieved successfully",
            data: mockData.apiKeys,
        })
    }),

    http.post("http://localhost:2000/api/user/apiKeys/validate-save", async ({ request }) => {
        const payload = (await request.json()) as any

        // Simulate validation logic
        if (payload.service && payload.credentials) {
            return HttpResponse.json({
                code: 200,
                message: "Integration saved successfully",
                data: payload,
            })
        }

        return HttpResponse.json(
            {
                code: 400,
                message: "Invalid integration payload",
            },
            { status: 400 }
        )
    }),

    http.get("http://localhost:2000/api/user/getGoogleDriveFiles", () => {
        return HttpResponse.json({
            code: 200,
            message: "Google Drive files retrieved successfully",
            data: mockData.googleDriveFiles,
        })
    }),

    // Document endpoints
    http.post("http://localhost:2000/api/document/upload", () => {
        return HttpResponse.json({
            code: 200,
            message: "Document uploaded successfully",
            data: mockData.document,
        })
    }),

    http.get("http://localhost:2000/api/document/get", ({ request }) => {
        const url = new URL(request.url)
        const organizationId = url.searchParams.get("organizationId")

        return HttpResponse.json({
            code: 200,
            message: "Documents retrieved successfully",
            data: mockData.documents,
        })
    }),

    http.post("http://localhost:2000/api/document/delete", async ({ request }) => {
        const { documentId } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Document deleted successfully",
        })
    }),

    http.post("http://localhost:2000/api/document/getParsedData", async ({ request }) => {
        const { documentId, organizationId } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Document parsed data retrieved successfully",
            data: mockData.documentParsedData,
        })
    }),

    http.post("http://localhost:2000/api/document/update", async ({ request }) => {
        const documentData = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Document updated successfully",
            data: documentData,
        })
    }),

    http.post("http://localhost:2000/api/document/updateStatus/*", async ({ request }) => {
        const { status } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Document status updated successfully",
            data: { status },
        })
    }),

    // Conversation endpoints
    http.post("http://localhost:2000/api/message/getById", async ({ request }) => {
        const { conversationId, userId } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Messages retrieved successfully",
            data: {
                messages: mockData.messages,
                conversationId,
            },
        })
    }),

    http.get("http://localhost:2000/api/conversation/get", ({ request }) => {
        const url = new URL(request.url)
        const type = url.searchParams.get("type")
        const offset = url.searchParams.get("offset")

        return HttpResponse.json({
            code: 200,
            message: "Conversations retrieved successfully",
            data: {
                conversations: mockData.conversations,
                offset: null,
            },
        })
    }),

    http.get("http://localhost:2000/api/conversation/deleteAll", () => {
        return HttpResponse.json({
            code: 200,
            message: "All conversations deleted successfully",
        })
    }),

    http.post("http://localhost:2000/api/conversation/delete", async ({ request }) => {
        const { conversationId } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Conversation deleted successfully",
        })
    }),

    http.post("http://localhost:2000/api/conversation/updateTitle", async ({ request }) => {
        const { conversationId, title } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Conversation title updated successfully",
            data: { conversationId, title },
        })
    }),

    http.post("http://localhost:2000/api/conversation/share", async ({ request }) => {
        const { conversationId, email, role } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Conversation shared successfully",
            data: { conversationId, email, role },
        })
    }),

    // Completion endpoints - returns streaming response
    http.post("http://localhost:2000/api/completions", async ({ request }) => {
        const completionData = (await request.json()) as any
        const conversationId = completionData.conversationId || "mock-conversation-id-" + Date.now()
        const messageId = "mock-message-id-" + Date.now()

        // Create a streaming response that matches the expected format
        // The frontend expects chunks separated by \n\n\n\n with format: data: {json}
        const initChunk = JSON.stringify({
            type: "init",
            abortId: "mock-abort-id-" + Date.now(),
            conversationId: conversationId,
        })

        // Test response content - includes "testing" for file-interaction test
        const responseContent = "This is a mock AI response for testing. The document contains testing information and sample data."

        const contentChunk = JSON.stringify({
            type: "content",
            content: responseContent,
            messageId: messageId,
            conversationId: conversationId,
        })

        const doneChunk = JSON.stringify({
            type: "done",
            messageId: messageId,
            conversationId: conversationId,
            usage: {
                prompt_tokens: 10,
                completion_tokens: 25,
                total_tokens: 35,
            },
        })

        // Combine chunks with the expected separator
        const streamData = `data: ${initChunk}\n\n\n\ndata: ${contentChunk}\n\n\n\ndata: ${doneChunk}\n\n\n\n`

        return new HttpResponse(streamData, {
            status: 200,
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        })
    }),

    // File system endpoints
    http.post("http://localhost:2000/api/v2/file/create", () => {
        return HttpResponse.json({
            code: 200,
            message: "File created successfully",
            data: mockData.file,
        })
    }),

    http.post("http://localhost:2000/api/v2/folder/create", async ({ request }) => {
        const folderData = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Folder created successfully",
            data: { ...mockData.folder, ...folderData },
        })
    }),

    http.get("http://localhost:2000/api/v2/file/getRootContents", () => {
        return HttpResponse.json({
            code: 200,
            message: "Root contents retrieved successfully",
            data: mockData.rootContents,
        })
    }),

    http.get("http://localhost:2000/api/v2/file/getFolderContents/*", () => {
        return HttpResponse.json({
            code: 200,
            message: "Folder contents retrieved successfully",
            data: mockData.folderContents,
        })
    }),

    http.post("http://localhost:2000/api/v2/file/delete", async ({ request }) => {
        const { fileId } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "File deleted successfully",
        })
    }),

    http.post("http://localhost:2000/api/v2/folder/delete", async ({ request }) => {
        const { folderId } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Folder deleted successfully",
        })
    }),

    // Payment endpoints
    http.post("http://localhost:2000/api/payments/stripe/renew", async ({ request }) => {
        const { planName, quantity, organizationName } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Payment renewed successfully",
            data: {
                url: "https://checkout.stripe.com/test-session",
                sessionId: "mock-session-id",
            },
        })
    }),

    http.post("http://localhost:2000/api/payments/stripe/createPortalSession", () => {
        return HttpResponse.json({
            code: 200,
            message: "Portal session created successfully",
            data: {
                url: "https://billing.stripe.com/test-portal",
            },
        })
    }),

    http.post("http://localhost:2000/api/payments/stripe/createCheckoutSession", async ({ request }) => {
        const productData = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Checkout session created successfully",
            data: {
                url: "https://checkout.stripe.com/test-session",
                sessionId: "mock-session-id",
            },
        })
    }),

    http.get("http://localhost:2000/api/payments/stripe/getAllActivePlans", () => {
        return HttpResponse.json({
            code: 200,
            message: "Active plans retrieved successfully",
            data: mockData.activePlans,
        })
    }),

    http.get("http://localhost:2000/api/payments/stripe/getCustomerInvoices", () => {
        return HttpResponse.json({
            code: 200,
            message: "Customer invoices retrieved successfully",
            data: mockData.invoices,
        })
    }),

    http.get("http://localhost:2000/api/payments/stripe/getAllProducts", () => {
        return HttpResponse.json({
            code: 200,
            message: "Products retrieved successfully",
            data: mockData.products,
        })
    }),

    // Admin endpoints
    http.get("http://localhost:2000/api/admin/getUsers", () => {
        return HttpResponse.json({
            code: 200,
            message: "Users retrieved successfully",
            data: mockData.users,
        })
    }),

    http.post("http://localhost:2000/api/admin/updateUser", async ({ request }) => {
        const userData = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "User updated successfully",
            data: userData,
        })
    }),

    http.get("http://localhost:2000/api/admin/getGCRLogs", ({ request }) => {
        const url = new URL(request.url)
        const pageToken = url.searchParams.get("pageToken")
        const pageSize = url.searchParams.get("pageSize")

        return HttpResponse.json({
            code: 200,
            message: "GCR logs retrieved successfully",
            data: mockData.gcrLogs,
        })
    }),

    // Organization endpoints
    http.get("http://localhost:2000/api/organization/getUserOrganization", () => {
        return HttpResponse.json({
            code: 200,
            message: "User organizations retrieved successfully",
            data: mockData.organizations,
        })
    }),

    http.post("http://localhost:2000/api/organization/updateOrganization", async ({ request }) => {
        const orgData = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Organization updated successfully",
            data: orgData,
        })
    }),

    // Integration endpoints
    http.get("http://localhost:2000/api/user/integration-services", () => {
        return HttpResponse.json({
            code: 200,
            message: "Integrations retrieved successfully",
            data: mockData.integrations,
        })
    }),

    // Model configuration endpoints
    http.post("http://localhost:2000/api/config/getModels", () => {
        return HttpResponse.json({
            code: 200,
            status: "success",
            message: "Models retrieved successfully",
            data: mockData.models,
        })
    }),

    // Note: deleteUserIntegration uses the same endpoint as deleteAPIKey
    // This is handled by the apiKeys/delete handler above

    // RAG Service endpoints
    http.get("http://localhost:3002/api/admin/getAllWorkers", () => {
        return HttpResponse.json({
            code: 200,
            message: "Workers retrieved successfully",
            data: mockData.workers,
        })
    }),

    http.get("http://localhost:3002/api/admin/getAllQueueItems", () => {
        return HttpResponse.json({
            code: 200,
            message: "Queue items retrieved successfully",
            data: mockData.queueItems,
        })
    }),

    http.get("http://localhost:3002/api/public/getQueueItemsByEmail", () => {
        return HttpResponse.json({
            code: 200,
            message: "Queue items retrieved successfully",
            data: mockData.queueItems,
        })
    }),

    http.post("http://localhost:3002/api/public/RAGCompose", async ({ request }) => {
        const { text, model_name, collection_name, template_name } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "RAG composition completed successfully",
            data: {
                response: "This is a mock RAG response based on your query.",
                sources: mockData.ragSources,
                model: model_name,
                collection: collection_name,
            },
        })
    }),

    http.post("http://localhost:3002/api/public/vectorSearch", async ({ request }) => {
        const { text, model_name, collection_name, is_key_term_match } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Vector search completed successfully",
            data: mockData.vectorSearchResults,
        })
    }),

    http.get("http://localhost:3002/api/public/getCollections", () => {
        return HttpResponse.json({
            code: 200,
            message: "Collections retrieved successfully",
            data: mockData.collections,
        })
    }),

    http.post("http://localhost:3002/api/public/createCollection", async ({ request }) => {
        const collectionData = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Collection created successfully",
            data: { ...mockData.collection, ...collectionData },
        })
    }),

    http.get("http://localhost:3002/api/public/getAllCollections", () => {
        return HttpResponse.json({
            code: 200,
            message: "All collections retrieved successfully",
            data: mockData.collections,
        })
    }),

    http.post("http://localhost:3002/api/public/deleteCollection", async ({ request }) => {
        const { collection } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Collection deleted successfully",
        })
    }),

    http.post("http://localhost:3002/api/public/getCollectionData", async ({ request }) => {
        const { collection_name, offset } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Collection data retrieved successfully",
            data: mockData.collectionData,
        })
    }),

    http.post("http://localhost:3002/api/public/getCollectionPointCount", async ({ request }) => {
        const { collection_name } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Collection point count retrieved successfully",
            data: { count: 100 },
        })
    }),

    http.get("http://localhost:3002/api/admin/getAllLogs", ({ request }) => {
        const url = new URL(request.url)
        const limit = url.searchParams.get("limit")
        const exclusiveStartKey = url.searchParams.get("exclusiveStartKey")

        return HttpResponse.json({
            code: 200,
            message: "Logs retrieved successfully",
            data: mockData.logs,
        })
    }),

    // Notes endpoints
    http.get("http://localhost:2000/api/note/get", ({ request }) => {
        const url = new URL(request.url)
        const organizationId = url.searchParams.get("organizationId")

        return HttpResponse.json({
            code: 200,
            message: "Notes retrieved successfully",
            data: mockData.notes,
        })
    }),

    http.post("http://localhost:2000/api/note/create", async ({ request }) => {
        const noteData = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Note created successfully",
            data: { ...mockData.note, ...noteData },
        })
    }),

    http.post("http://localhost:2000/api/note/update", async ({ request }) => {
        const noteData = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Note updated successfully",
            data: noteData,
        })
    }),

    http.post("http://localhost:2000/api/note/delete", async ({ request }) => {
        const { noteId } = (await request.json()) as any

        return HttpResponse.json({
            code: 200,
            message: "Note deleted successfully",
        })
    }),

    // User Settings endpoints
    http.get("http://localhost:2000/api/v1/user/settings", () => {
        return HttpResponse.json({
            code: 200,
            message: "User settings retrieved successfully",
            data: {
                settings: mockData.user.settings,
            },
        })
    }),

    http.put("http://localhost:2000/api/v1/user/settings", async ({ request }) => {
        const settingsData = (await request.json()) as any

        // Update mock data with new settings
        mockData.user.settings = { ...mockData.user.settings, ...settingsData }

        return HttpResponse.json({
            code: 200,
            message: "Settings updated successfully",
            data: {
                settings: mockData.user.settings,
            },
        })
    }),

    // Fallback handler for unhandled requests
    http.all("*", ({ request }) => {
        console.warn(`Unhandled ${request.method} request to ${request.url}`)
        return HttpResponse.json({ error: "Unhandled request" }, { status: 404 })
    }),
]
