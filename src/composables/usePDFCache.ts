import * as pdfjsLib from "pdfjs-dist"

import type { PDFDocumentProxy } from "pdfjs-dist"
//@ts-ignore
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url"

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

interface PDFCacheEntry {
    document: PDFDocumentProxy | null
    loadingTask: Promise<PDFDocumentProxy>
    refCount: number
}

const pdfCache = new Map<string, PDFCacheEntry>()

/**
 * Composable to manage PDF document caching and sharing across components
 * This prevents loading the same PDF multiple times
 */
export function usePDFCache() {
    /**
     * Get or load a PDF document from cache
     * @param fileUrl The URL of the PDF file
     * @returns Promise that resolves to the PDF document
     */
    async function getPDFDocument(fileUrl: string): Promise<PDFDocumentProxy> {
        // Check if document is already in cache
        const cached = pdfCache.get(fileUrl)
        if (cached) {
            cached.refCount++
            // If document is already loaded, return it immediately
            if (cached.document) {
                return cached.document
            }
            // Otherwise, wait for the existing loading task
            return cached.loadingTask
        }

        // Create loading task
        const loadingTask = pdfjsLib.getDocument({
            url: fileUrl,
            // Use range requests to optimize loading
            disableRange: false,
            disableStream: false,
            // Enable caching
            httpHeaders: {},
        })

        // Create cache entry with loading task
        const cacheEntry: PDFCacheEntry = {
            document: null as any, // Will be set after loading
            loadingTask: loadingTask.promise,
            refCount: 1,
        }

        pdfCache.set(fileUrl, cacheEntry)

        // Wait for document to load and update cache entry
        try {
            const document = await loadingTask.promise
            cacheEntry.document = document
            return document
        } catch (error) {
            // Remove from cache on error
            pdfCache.delete(fileUrl)
            throw error
        }
    }

    /**
     * Release a reference to a PDF document
     * When refCount reaches 0, the document can be cleaned up
     * @param fileUrl The URL of the PDF file
     */
    function releasePDFDocument(fileUrl: string) {
        const cached = pdfCache.get(fileUrl)
        if (cached) {
            cached.refCount--
            // Optionally clean up if refCount reaches 0
            // For now, we keep documents in cache for reuse
            if (cached.refCount <= 0) {
                // Clean up after a delay to allow reuse
                setTimeout(() => {
                    const entry = pdfCache.get(fileUrl)
                    if (entry && entry.refCount <= 0) {
                        pdfCache.delete(fileUrl)
                    }
                }, 5000) // 5 second delay before cleanup
            }
        }
    }

    /**
     * Clear all cached PDF documents
     */
    function clearCache() {
        pdfCache.clear()
    }

    /**
     * Check if a PDF is already cached
     */
    function isCached(fileUrl: string): boolean {
        return pdfCache.has(fileUrl)
    }

    /**
     * Get cached document synchronously (if available)
     */
    function getCachedDocument(fileUrl: string): PDFDocumentProxy | null {
        const cached = pdfCache.get(fileUrl)
        return cached?.document || null
    }

    return {
        getPDFDocument,
        releasePDFDocument,
        clearCache,
        isCached,
        getCachedDocument,
    }
}
