import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx"
import { saveAs } from "file-saver"
// Function to process the parsed Markdown data
export async function exportToDocx(parsedData: any[], isExport: boolean): Promise<Blob> {
    // Helper function to process tokens and create TextRuns or Paragraphs
    const processTokens = (tokens: any[]): (TextRun | Paragraph)[] => {
        return tokens.map((token) => {
            switch (token.type) {
                case "text":
                    return new TextRun(token.text)
                case "strong":
                    return new TextRun({
                        text: token.text,
                        bold: true,
                    })
                case "link":
                    return new TextRun({
                        text: token.text,
                        underline: {},
                        color: "0000FF",
                    })
                case "br":
                    return new TextRun("\n")
                default:
                    return new TextRun(token.raw)
            }
        })
    }

    // Helper function to create Paragraphs from tokens
    const createParagraphFromTokens = (tokens: any[]): Paragraph => {
        return new Paragraph({
            children: processTokens(tokens),
        })
    }

    // Main processing function to handle different types of nodes
    const processNode = (node: any): (Paragraph | TextRun | any)[] => {
        const children: (Paragraph | TextRun | any)[] = []

        switch (node.type) {
            case "paragraph":
                children.push(createParagraphFromTokens(node.tokens))
                break
            case "hr":
                // Handle horizontal rule as a new paragraph with a line
                children.push(
                    new Paragraph({
                        border: {
                            bottom: {
                                color: "auto",
                                space: 1,
                                value: "single",
                                size: 6,
                            },
                        },
                    })
                )
                break
            case "space":
                children.push(new Paragraph(" ")) // Add a space as a new line
                break
            default:
                // Recursively process children for other node types if necessary
                if (node.tokens) {
                    children.push(...processTokens(node.tokens))
                }
                break
        }

        return children
    }

    // Create a list of children elements for the docx document
    const docChildren: (Paragraph | any)[] = []
    parsedData.forEach((node) => {
        docChildren.push(...processNode(node))
    })

    // Create the DOCX document
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: docChildren,
            },
        ],
    })

    // Generate DOCX file and trigger download
    const buffer = await Packer.toBlob(doc)
    if (isExport) saveAs(buffer, "document.docx")
    return buffer
}
