import mammoth from 'mammoth/mammoth.browser'
import { extractPdfText, type PdfExtractionProgress } from './pdfText'

export type SupportedDocType = 'pdf' | 'docx' | 'txt'

/**
 * Soft ceiling on upload size. This is a browser-side, single-threaded
 * parse with no server to offload to — very large or graphically complex
 * files can take minutes rather than seconds. Comfortably above a normal
 * multi-page scanned solicitation, but low enough to fail fast with a
 * clear message instead of hanging indefinitely.
 */
export const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024 // 25 MB

/** How long to wait before giving up and showing an error, rather than spinning forever. */
export const EXTRACTION_TIMEOUT_MS = 45_000

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

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

/** Extracts plain text from a PDF, DOCX, or TXT file, entirely in the browser. */
export async function extractDocumentText(
  file: File,
  onProgress?: (progress: PdfExtractionProgress) => void,
): Promise<string> {
  const type = detectDocType(file)
  if (!type) throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.')

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1)
    throw new Error(
      `This file is ${mb} MB, above the ${MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024)} MB limit for in-browser parsing. Try a smaller export (e.g. text-based PDF instead of a scanned/flattened one) or split it into fewer pages.`,
    )
  }

  const extraction =
    type === 'pdf'
      ? extractPdfText(file, onProgress)
      : type === 'docx'
        ? file.arrayBuffer().then((buffer) => mammoth.extractRawText({ arrayBuffer: buffer }).then((r) => r.value))
        : file.text()

  return withTimeout(
    extraction,
    EXTRACTION_TIMEOUT_MS,
    "This document is taking too long to process — it may be unusually complex (heavy graphics/vector content) or a scanned image. Try a smaller or simpler file, or a text-based export.",
  )
}
