interface IRagSearchResults {
    id: string
    title: string
    paragraph: string
    vector: any
    chunkSize: number
    url: string
    pageNumber: number
    metadata: IRagSearchResultsMetadata
}
interface IRagSearchResultsMetadata {
    source: string
    batchedAt: string
    maxPageCount: number
    username: string
    collection: string
    fileName: string
    model: string
    distance: number
    [key: string]: any
}
interface IRecentSearches {
    collection: string
    valueInput: string
    query: string
}
