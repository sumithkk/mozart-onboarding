export interface FileVersion {
    id: string
    fileId: string
    content: string
    createdAt: Date
    createdBy: string
    size: number
    comment?: string
}

export interface FileItem {
    id: string
    name: string
    type: "file" | "folder" | "image" | "document"
    parentId: string | null
    permissions: {
        canView: boolean
        canEdit: boolean
        canShare: boolean
        isOwner: boolean
    }
    modifiedAt?: Date
    size?: number
    shareLink?: string
    sharedWith?: string[]
    versions?: FileVersion[]
    currentVersion?: string
}

export interface ToolbarProps {
    isGridView: boolean
    onViewChange: (isGrid: boolean) => void
    onNewItem: (type: "file" | "folder") => void
    onUpload: () => void
}

export interface FileViewProps {
    files: FileItem[]
    currentFolderId: string | null
    isGridView: boolean
    dragState: DragState
    dragOverItem: string | null
    editingId: string | null
    newItemName: string
    onDragStart: (e: React.DragEvent, itemId: string) => void
    onDragOver: (e: React.DragEvent, itemId: string) => void
    onDragLeave: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent, itemId: string) => void
    onContextMenu: (e: React.MouseEvent, itemId: string) => void
    onFolderClick: (folderId: string) => void
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onNameSave: (itemId: string) => void
}

export interface BreadcrumbsProps {
    currentPath: FileItem[]
    onNavigate: (folderId: string | null) => void
    dragState: DragState
    onDrop: (e: React.DragEvent, targetId: string) => void
}

export interface ContextMenuProps {
    x: number
    y: number
    onClose: () => void
    onRename: () => void
    onDelete: () => void
    onCopy: () => void
    onManagePermissions: () => void
    onShare: () => void
    onVersionHistory: () => void
}

export interface PermissionsModalProps {
    isOpen: boolean
    onClose: () => void
    item: FileItem | null
    onUpdatePermissions: (itemId: string, permissions: FileItem["permissions"]) => void
}

export interface ShareModalProps {
    isOpen: boolean
    onClose: () => void
    item: FileItem | null
    onShare: (itemId: string, email: string) => void
    onGenerateLink: (itemId: string) => void
    onCopyLink: (link: string) => void
}

export interface VersionHistoryModalProps {
    isOpen: boolean
    onClose: () => void
    item: FileItem | null
    onRestore: (fileId: string, versionId: string) => void
    onDownload: (version: FileVersion) => void
}

export interface DragState {
    itemId: string | null
    type: "move" | "copy" | null
}

export type SortOption = "name" | "modified"
export type FilterOption = "folder" | "file" | "shared"
