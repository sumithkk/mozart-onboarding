// ~/services/socketService.ts
import { Socket, io } from "socket.io-client"

import eventBus from "~/util/eventBus"

// TypeScript Singleton instance
let instance: SocketService | null = null

class SocketService {
    private socket: Socket | null = null
    private namespace: string = "/user" as const
    constructor() {
        if (!instance) {
            instance = this
        }
        return instance
    }

    public connectSocket(url: string): Promise<boolean> {
        const messageStore = useMessageStore()
        const userStore = useUserStore()
        const conversationStore = useConversationStore()

        return new Promise((resolve, reject) => {
            console.log("====================================")
            console.log("Connecting socket")
            console.log("====================================")
            if (this.socket?.connected) {
                return resolve(true) // Prevent multiple connections
            }

            this.socket = io(url + this.namespace, {
                path: "/socket.io",
                transports: ["websocket"],
                autoConnect: false,
                withCredentials: true,
            })

            this.socket.connect()

            // Reconnect socket on connection error
            this.socket.on("connect_error", (error: Error) => {
                console.log("====================================")
                console.log("Socket connection error", error)
                console.log("====================================")
                // this.socket?.connect()
                reject(false)
            })

            // Resolve the promise when the socket connects
            this.socket.on("connect", () => {
                console.log("====================================")
                console.log("Socket connected")
                console.log("====================================")
                resolve(true)
            })

            // Add message to message store
            this.socket.on("add_message", (data: any) => {
                if (data.author.role === "user") {
                    messageStore.isLoading = true
                } else messageStore.isLoading = false
                conversationStore.currentNode = data.messageId
                messageStore.addMessage(data)
            })
        })
    }

    public joinConversation(data: any): void {
        if (this.socket) {
            this.socket.emit("join_conversation", data)
        }
    }

    public sendMessageToConversation(data: any): void {
        if (this.socket) {
            this.socket.emit("send_message", data)
        }
    }

    public disconnectSocket(): void {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }
}

const socketService = new SocketService()
export default socketService
