import mammoth from 'mammoth/mammoth.browser'
import { extractPdfText } from './pdfText'

export type SupportedDocType = 'pdf' | 'docx' | 'txt'

export function detectDocType(file: File): SupportedDocType | null {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return 'pdf'
  if (
    name.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'docx'
  if (name.endsWith('.txt') || file.type === 'text/plain') return 'txt'
  return null
}

/** Extracts plain text from a PDF, DOCX, or TXT file, entirely in the browser. */
export async function extractDocumentText(file: File): Promise<string> {
  const type = detectDocType(file)
  if (type === 'pdf') return extractPdfText(file)
  if (type === 'docx') {
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return result.value
  }
  if (type === 'txt') return file.text()
  throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.')
}
