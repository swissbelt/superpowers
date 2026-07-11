import * as pdfjsLib from 'pdfjs-dist'
import 'pdf-worker-setup'

export interface PdfExtractionProgress {
  page: number
  totalPages: number
}

/**
 * Extracts plain text from every page of a PDF, entirely in the browser.
 * Reconstructs line breaks from pdf.js's per-item `hasEOL` hint so
 * label-based text matching (e.g. "Agency: City of Richmond") has a
 * reliable end-of-line boundary instead of one giant run-on string.
 *
 * Parsing time scales with how graphically complex each page is, not just
 * text volume — a short, image/vector-heavy "quick quote" template can take
 * far longer than a dense multi-page text contract. `onProgress` lets the
 * caller show real per-page progress instead of a spinner with no signal.
 */
export async function extractPdfText(
  file: File,
  onProgress?: (progress: PdfExtractionProgress) => void,
): Promise<string> {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const lines: string[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    onProgress?.({ page: pageNum, totalPages: pdf.numPages })
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    let line = ''
    for (const item of content.items) {
      if (!('str' in item)) continue
      line += item.str
      if (item.hasEOL) {
        lines.push(line)
        line = ''
      } else if (item.str) {
        line += ' '
      }
    }
    if (line.trim()) lines.push(line)
    lines.push('')
    page.cleanup()
  }

  return lines.join('\n')
}
