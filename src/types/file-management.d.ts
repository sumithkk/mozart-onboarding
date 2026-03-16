interface User {
    id: string
    email: string
    name: string
}

interface FilePermission {
    userId: string
    fileId: string
    canRead: boolean
    canWrite: boolean
    canShare: boolean
    createdAt: Date
    updatedAt: Date
}

interface FileVersion {
    id: string
    fileId: string
    version: number
    content: string
    size: number
    createdAt: Date
    createdBy: string
    comment?: string
}

interface FileItem {
    id: string
    name: string
    type: "file" | "folder"
    path: string
    size: number
    mimeType: string
    parentFolderId?: string
    ownerId: string
    createdAt: Date
    updatedAt: Date
    lastModifiedBy: string
    isStarred: boolean
    isTrashed: boolean
    isHidden: boolean
    isShared: boolean
    isSharedWithMe: boolean
    url?: string
    filePreviewUrl?: string
    versions?: FileVersion[]
    permissions?: FilePermission[]
    source?: {
        name: string
        id: string
    }
    viewDocumentUrl?: string
    status: string
    sharedUsers?: {
        userId: string
        name: string
        role: string
        profilePicture: string
    }[]
}
