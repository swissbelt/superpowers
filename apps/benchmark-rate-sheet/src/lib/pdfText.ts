import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

/**
 * Extracts plain text from every page of a PDF, entirely in the browser.
 * Reconstructs line breaks from pdf.js's per-item `hasEOL` hint so
 * label-based text matching (e.g. "Agency: City of Richmond") has a
 * reliable end-of-line boundary instead of one giant run-on string.
 */
export async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const lines: string[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
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
  }

  return lines.join('\n')
}
