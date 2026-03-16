export type Role = "owner" | "admin" | "member"

export interface IMember {
    id: string
    name: string
    email: string
    role: Role
    profilePicture?: string
    joinedAt: string
    lastActive: string
    isOnline: boolean
}
