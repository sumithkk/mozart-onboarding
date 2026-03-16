// composables/useFolderDrop.ts
export const useFolderDrop = () => {
    const traverseFileTree = (item: FileSystemEntry, path = ""): Promise<File[]> => {
        return new Promise((resolve) => {
            if (item.isFile) {
                ;(item as FileSystemFileEntry).file((file) => {
                    Object.defineProperty(file, "webkitRelativePath", {
                        value: path + file.name,
                        writable: true,
                    })
                    resolve([file])
                })
            } else if (item.isDirectory) {
                const dirReader = (item as FileSystemDirectoryEntry).createReader()
                const entries: FileSystemEntry[] = []

                const readEntries = () => {
                    dirReader.readEntries(async (results) => {
                        if (!results.length) {
                            const promises = entries.map((entry) => traverseFileTree(entry, path + item.name + "/"))
                            const nested = await Promise.all(promises)
                            resolve(nested.flat())
                        } else {
                            entries.push(...results)
                            readEntries()
                        }
                    })
                }

                readEntries()
            }
        })
    }

    const extractFilesFromDropEvent = async (e: DragEvent): Promise<File[]> => {
        const items = Array.from(e.dataTransfer?.items || [])
        const nested = await Promise.all(
            items.map((item) => {
                const entry = item.webkitGetAsEntry?.()
                return entry ? traverseFileTree(entry) : Promise.resolve([])
            })
        )
        return nested.flat()
    }

    return {
        extractFilesFromDropEvent,
    }
}
