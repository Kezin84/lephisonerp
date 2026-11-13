import * as XLSX from 'xlsx-js-style'
import JSZip from 'jszip'
import Tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.js?url'
import { callDeepSeek } from '../services/deepseek'
import { callDolaVision, getDolaRuntimeConfig } from '../services/dolaApi'
import {
  applySummaryVatAndComputeAfterTaxCost,
  extractMetadataFromBulletLines,
  extractVendorNameFromLines,
  parseCleanNumber,
  removeDiacriticsSimple
} from './purchaseQuoteParser'

const _pdfWorker =
  (pdfjsLib as any)?.GlobalWorkerOptions || (pdfjsLib as any)?.default?.GlobalWorkerOptions
if (_pdfWorker && !_pdfWorker.workerSrc) {
  _pdfWorker.workerSrc = pdfWorkerUrl
}

export const UNIVERSAL_IMPORT_ACCEPT =
  '.xlsx,.xls,.xlsm,.xlsb,.xltx,.xltm,.ods,.csv,.tsv,.xml,.pdf,application/pdf,.docx,.doc,.rtf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/rtf,image/*'

export const UNIVERSAL_DOC_ONLY_ACCEPT =
  '.xlsx,.xls,.xlsm,.xlsb,.xltx,.xltm,.ods,.csv,.tsv,.xml,.pdf,application/pdf,.docx,.doc,.rtf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/rtf'

export interface UniversalTableSheet {
  name: string
  rows: string[][]
}

export interface UniversalWordContent {
  tables: UniversalTableSheet[]
  paragraphs: string[]
  rawText: string
}

export interface ExtractedCustomerFields {
  MST?: string
  Ten_cong_ty?: string
  COMPANY?: string
  Ten_khach_hang?: string
  So_dien_thoai_ca_nhan?: string
  So_dien_thoai_cong_ty?: string
  So_fax_cong_ty?: string
  Email_ca_nhan?: string
  Email_cong_ty?: string
  Website_cong_ty?: string
  Dia_chi_cong_ty?: string
  ADDRESS?: string
  TEL?: string
  Ten_khach_hang_phu?: string
  So_dien_thoai_ca_nhan_phu?: string
  Nganh_nghe_cong_ty?: string
}

export interface ExtractedTaxFields {
  mst: string
  tenCongTy: string
  tenCongTyEn: string
  diaChi: string
  nganhNgheChinh: string
}

export function isImageDocFile(file: File | null | undefined): boolean {
  if (!file) return false
  const mime = String(file.type || '').toLowerCase()
  if (mime.startsWith('image/')) return true
  return /\.(png|jpe?g|webp|bmp|gif|jfif|tiff?|heic|heif)$/i.test(String(file.name || ''))
}

export function isPdfDocFile(file: File | null | undefined): boolean {
  if (!file) return false
  const mime = String(file.type || '').toLowerCase()
  if (mime === 'application/pdf') return true
  return /\.pdf$/i.test(String(file.name || ''))
}

export function isWordDocFile(file: File | null | undefined): boolean {
  if (!file) return false
  const mime = String(file.type || '').toLowerCase()
  const name = String(file.name || '').toLowerCase()
  if (/\.(docx|doc|rtf)$/i.test(name)) return true
  return (
    mime.includes('wordprocessingml') ||
    mime === 'application/msword' ||
    mime === 'application/rtf' ||
    mime === 'text/rtf'
  )
}

export function isSpreadsheetDocFile(file: File | null | undefined): boolean {
  if (!file) return false
  if (isImageDocFile(file) || isPdfDocFile(file) || isWordDocFile(file)) return false
  const name = String(file.name || '').toLowerCase()
  const mime = String(file.type || '').toLowerCase()
  if (/\.(xlsx|xls|xlsm|xlsb|xltx|xltm|ods|csv|tsv|xml|html?)$/i.test(name)) return true
  return (
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    mime.includes('csv') ||
    mime.includes('tab-separated') ||
    mime.includes('opendocument.spreadsheet')
  )
}

export function getFileCategoryIconClass(fileName: string, isImg = false): string {
  if (isImg || /\.(png|jpe?g|webp|bmp|gif|jfif|svg)$/i.test(fileName)) return 'ri-image-line'
  if (/\.pdf$/i.test(fileName)) return 'ri-file-pdf-2-line'
  if (/\.(docx?|rtf)$/i.test(fileName)) return 'ri-file-word-2-line'
  if (/\.(xlsx?|xlsm|xlsb|xltx|xltm|ods|csv|tsv|xml)$/i.test(fileName)) return 'ri-file-excel-2-line'
  return 'ri-file-text-line'
}

function decodeBufferTextSmart(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer)
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(bytes.subarray(2))
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(bytes.subarray(2))
  }
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(bytes.subarray(3))
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

function parseDelimitedTextToRows(text: string, preferredDelimiter?: string): string[][] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (!lines.length) return []

  let delim = preferredDelimiter || ','
  if (!preferredDelimiter) {
    const sample = lines.slice(0, 10).join('\n')
    const tabCount = (sample.match(/\t/g) || []).length
    const semiCount = (sample.match(/;/g) || []).length
    const commaCount = (sample.match(/,/g) || []).length
    if (tabCount >= semiCount && tabCount >= commaCount && tabCount > 0) delim = '\t'
    else if (semiCount > commaCount) delim = ';'
  }

  return lines.map(line => {
    const out: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === delim && !inQuotes) {
        out.push(cur.trim())
        cur = ''
      } else {
        cur += ch
      }
    }
    out.push(cur.trim())
    return out
  })
}

function parseHtmlTablesFromText(htmlText: string): UniversalTableSheet[] {
  if (typeof DOMParser === 'undefined') return []
  const doc = new DOMParser().parseFromString(htmlText, 'text/html')
  const tableEls = Array.from(doc.querySelectorAll('table'))
  const sheets: UniversalTableSheet[] = []

  tableEls.forEach((tbl, tIdx) => {
    const rows: string[][] = []
    const trEls = Array.from(tbl.querySelectorAll('tr'))
    for (const tr of trEls) {
      const cells = Array.from(tr.children).filter(
        el => el.tagName === 'TD' || el.tagName === 'TH'
      ) as HTMLElement[]
      if (!cells.length) continue
      const rowArr: string[] = []
      for (const cell of cells) {
        const clone = cell.cloneNode(true) as HTMLElement
        clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'))
        clone.querySelectorAll('p, div, li').forEach(blk => {
          blk.appendChild(doc.createTextNode('\n'))
        })
        const txt = String(clone.textContent || '')
          .replace(/\u00a0/g, ' ')
          .replace(/[ \t]+\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim()
        const colspan = Math.max(1, Math.min(20, parseInt(cell.getAttribute('colspan') || '1', 10) || 1))
        rowArr.push(txt)
        for (let k = 1; k < colspan; k++) rowArr.push('')
      }
      if (rowArr.some(Boolean)) rows.push(rowArr)
    }
    if (rows.length > 0) {
      sheets.push({ name: `Table ${tIdx + 1}`, rows })
    }
  })

  return sheets
}

function parseSpreadsheetXml2003(xmlText: string): UniversalTableSheet[] {
  if (typeof DOMParser === 'undefined') return []
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml')
  const worksheets = Array.from(doc.getElementsByTagName('Worksheet'))
  const targetRoots = worksheets.length > 0 ? worksheets : [doc.documentElement]
  const sheets: UniversalTableSheet[] = []

  targetRoots.forEach((wsEl, idx) => {
    if (!wsEl) return
    const sheetName =
      wsEl.getAttribute('ss:Name') ||
      wsEl.getAttribute('Name') ||
      `Sheet ${idx + 1}`
    const rowEls = Array.from(wsEl.getElementsByTagName('Row'))
    const rows: string[][] = []
    for (const rEl of rowEls) {
      const cellEls = Array.from(rEl.getElementsByTagName('Cell'))
      const rowArr: string[] = []
      let colCursor = 0
      for (const cEl of cellEls) {
        const explicitIdx = parseInt(cEl.getAttribute('ss:Index') || cEl.getAttribute('Index') || '0', 10)
        if (explicitIdx > 0 && explicitIdx - 1 > colCursor) {
          while (colCursor < explicitIdx - 1) {
            rowArr.push('')
            colCursor++
          }
        }
        const dataEl = cEl.getElementsByTagName('Data')[0]
        const val = String((dataEl || cEl).textContent || '').trim()
        rowArr.push(val)
        colCursor++
        const mergeAcross = parseInt(cEl.getAttribute('ss:MergeAcross') || '0', 10) || 0
        for (let m = 0; m < mergeAcross; m++) {
          rowArr.push('')
          colCursor++
        }
      }
      if (rowArr.some(Boolean)) rows.push(rowArr)
    }
    if (rows.length > 0) sheets.push({ name: sheetName, rows })
  })

  return sheets
}

/**
 * Đọc tất cả định dạng Excel / Bảng tính (.xlsx, .xls, .xlsm, .xlsb, .xltx, .xltm, .ods, .csv, .tsv, .xml, HTML-xls)
 * trên toàn bộ các Sheet.
 */
export async function readUniversalSpreadsheetSheets(
  file: File,
  options?: { keepEmptyRows?: boolean }
): Promise<UniversalTableSheet[]> {
  const keepEmptyRows = Boolean(options?.keepEmptyRows)
  const arrayBuffer = await file.arrayBuffer()
  const lowerName = String(file.name || '').toLowerCase()

  if (lowerName.endsWith('.csv') || lowerName.endsWith('.tsv')) {
    const txt = decodeBufferTextSmart(arrayBuffer)
    const rows = parseDelimitedTextToRows(txt, lowerName.endsWith('.tsv') ? '\t' : undefined)
    if (rows.length > 0) {
      return [{ name: file.name, rows }]
    }
  }

  const headText = decodeBufferTextSmart(arrayBuffer.slice(0, 4096)).trim()
  if (/^<!doctype\s+html|^<html|<table[\s>]/i.test(headText)) {
    const fullHtml = decodeBufferTextSmart(arrayBuffer)
    const htmlSheets = parseHtmlTablesFromText(fullHtml)
    if (htmlSheets.length > 0) return htmlSheets
  }

  if (
    lowerName.endsWith('.xml') ||
    (/<\?xml/i.test(headText) && /<Workbook|<Worksheet|<Table|<Row/i.test(headText))
  ) {
    const fullXml = decodeBufferTextSmart(arrayBuffer)
    const xmlSheets = parseSpreadsheetXml2003(fullXml)
    if (xmlSheets.length > 0) return xmlSheets
  }

  try {
    const data = new Uint8Array(arrayBuffer)
    const wb = XLSX.read(data, { type: 'array', codepage: 65001 })
    const sheets: UniversalTableSheet[] = []
    for (const sName of wb.SheetNames) {
      const ws = wb.Sheets[sName]
      if (!ws) continue
      const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][]
      const mappedRows = rawRows
        .filter(r => Array.isArray(r))
        .map(r => r.map(c => String(c ?? '').trim()))
      const cleanRows = keepEmptyRows ? mappedRows : mappedRows.filter(r => r.some(Boolean))
      if (mappedRows.some(r => r.some(Boolean))) {
        sheets.push({ name: sName, rows: cleanRows })
      }
    }
    if (sheets.length > 0) return sheets
  } catch (xlsxErr) {
    // Fallback thử đọc như HTML/XML/CSV nếu file đổi đuôi .xls
    const fallbackText = decodeBufferTextSmart(arrayBuffer)
    if (/<table[\s>]/i.test(fallbackText)) {
      const htmlSheets = parseHtmlTablesFromText(fallbackText)
      if (htmlSheets.length > 0) return htmlSheets
    }
    if (/<Worksheet|<Row/i.test(fallbackText)) {
      const xmlSheets = parseSpreadsheetXml2003(fallbackText)
      if (xmlSheets.length > 0) return xmlSheets
    }
    const csvRows = parseDelimitedTextToRows(fallbackText)
    if (csvRows.length > 1) return [{ name: file.name, rows: csvRows }]
    throw xlsxErr
  }

  return []
}

function extractWordXmlNodeParagraphText(pEl: Element): string {
  let out = ''
  const walk = (node: Node) => {
    if (node.nodeType === 1) {
      const el = node as Element
      const local = el.localName || el.nodeName.replace(/^.*:/, '')
      if (local === 't') {
        out += el.textContent || ''
        return
      }
      if (local === 'tab') {
        out += '\t'
        return
      }
      if (local === 'br' || local === 'cr') {
        out += '\n'
        return
      }
    }
    const children = node.childNodes
    for (let i = 0; i < children.length; i++) {
      walk(children[i])
    }
  }
  walk(pEl)
  return out.replace(/\u00a0/g, ' ').trim()
}

function parseWordXmlDocument(xmlString: string, labelPrefix = 'Word'): {
  tables: UniversalTableSheet[]
  paragraphs: string[]
  orderedLines: string[]
} {
  const tables: UniversalTableSheet[] = []
  const paragraphs: string[] = []
  const orderedLines: string[] = []
  if (typeof DOMParser === 'undefined' || !xmlString) {
    return { tables, paragraphs, orderedLines }
  }

  const doc = new DOMParser().parseFromString(xmlString, 'application/xml')
  const findLocalChildren = (parent: Element, localName: string): Element[] => {
    const res: Element[] = []
    for (let i = 0; i < parent.children.length; i++) {
      const ch = parent.children[i]
      const ln = ch.localName || ch.nodeName.replace(/^.*:/, '')
      if (ln === localName) res.push(ch)
    }
    return res
  }

  const parseTblElement = (tblEl: Element, tblIdx: number) => {
    const trEls = findLocalChildren(tblEl, 'tr')
    const rows: string[][] = []
    for (const tr of trEls) {
      const tcEls = findLocalChildren(tr, 'tc')
      const rowCells: string[] = []
      for (const tc of tcEls) {
        const pEls = Array.from(tc.getElementsByTagName('*')).filter(
          el => (el.localName || el.nodeName.replace(/^.*:/, '')) === 'p'
        )
        const cellLines = pEls
          .map(p => extractWordXmlNodeParagraphText(p))
          .filter(Boolean)
        const cellText = cellLines.join('\n').trim()
        rowCells.push(cellText)

        let gridSpan = 1
        const tcPr = findLocalChildren(tc, 'tcPr')[0]
        if (tcPr) {
          const gs = findLocalChildren(tcPr, 'gridSpan')[0]
          if (gs) {
            const valAttr = gs.getAttribute('w:val') || gs.getAttribute('val') || '1'
            gridSpan = Math.max(1, Math.min(20, parseInt(valAttr, 10) || 1))
          }
        }
        for (let s = 1; s < gridSpan; s++) {
          rowCells.push('')
        }
      }
      if (rowCells.some(Boolean)) {
        rows.push(rowCells)
        orderedLines.push(rowCells.map(c => c.replace(/\r?\n/g, ' / ')).join(' | '))
      }
    }
    if (rows.length > 0) {
      tables.push({ name: `${labelPrefix} Table ${tblIdx + 1}`, rows })
    }
  }

  const bodies = Array.from(doc.getElementsByTagName('*')).filter(el => {
    const ln = el.localName || el.nodeName.replace(/^.*:/, '')
    return ln === 'body' || ln === 'hdr' || ln === 'ftr'
  })

  const roots = bodies.length > 0 ? bodies : (doc.documentElement ? [doc.documentElement] : [])
  let tblCounter = 0

  const walkContainer = (container: Element) => {
    for (let i = 0; i < container.children.length; i++) {
      const ch = container.children[i]
      const ln = ch.localName || ch.nodeName.replace(/^.*:/, '')
      if (ln === 'p') {
        const pTxt = extractWordXmlNodeParagraphText(ch)
        if (pTxt) {
          paragraphs.push(pTxt)
          orderedLines.push(pTxt)
        }
      } else if (ln === 'tbl') {
        parseTblElement(ch, tblCounter++)
      } else if (ln === 'sdt' || ln === 'sdtContent' || ln === 'sectPr') {
        walkContainer(ch)
      }
    }
  }

  roots.forEach(r => walkContainer(r))
  return { tables, paragraphs, orderedLines }
}

function parseRtfContent(rtfRaw: string): UniversalWordContent {
  let s = rtfRaw
    .replace(/\{\\(?:fonttbl|colortbl|stylesheet|info|pict|\*\\[^}]+)[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gi, '')
  s = s.replace(/\\u(-?\d+)\??/g, (_, numStr) => {
    let code = parseInt(numStr, 10)
    if (code < 0) code += 65536
    return String.fromCharCode(code)
  })
  let winDecoder: TextDecoder | null = null
  try {
    winDecoder = new TextDecoder('windows-1258')
  } catch {
    try {
      winDecoder = new TextDecoder('windows-1252')
    } catch {
      winDecoder = null
    }
  }
  s = s.replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) => {
    const byte = parseInt(hex, 16)
    if (winDecoder) return winDecoder.decode(new Uint8Array([byte]))
    return String.fromCharCode(byte)
  })
  s = s
    .replace(/\\cell\b/gi, '\t')
    .replace(/\\row\b/gi, '\n')
    .replace(/\\(?:par|line)\b/gi, '\n')
    .replace(/\\tab\b/gi, '\t')
    .replace(/\\[a-zA-Z]+-?\d*\s?/g, '')
    .replace(/[{}]/g, '')

  const rawLines = s
    .split(/\r?\n/)
    .map(l => l.replace(/\s+/g, m => (m.includes('\t') ? '\t' : ' ')).trim())
    .filter(Boolean)

  const tableRows: string[][] = []
  const paragraphs: string[] = []
  for (const line of rawLines) {
    if (line.includes('\t')) {
      const cells = line.split('\t').map(c => c.trim())
      if (cells.some(Boolean)) tableRows.push(cells)
    } else {
      paragraphs.push(line)
    }
  }

  return {
    tables: tableRows.length > 0 ? [{ name: 'RTF Table', rows: tableRows }] : [],
    paragraphs,
    rawText: rawLines.map(l => l.replace(/\t/g, ' | ')).join('\n')
  }
}

function parseBinaryOleDocBuffer(arrayBuffer: ArrayBuffer): UniversalWordContent {
  const bytes = new Uint8Array(arrayBuffer)
  const noiseRegex =
    /^(?:Root Entry|WordDocument|SummaryInformation|DocumentSummaryInformation|CompObj|1Table|0Table|Data|ObjectPool|MSWordDoc|Microsoft Office Word|Normal\.dotm?|Times New Roman|Arial|Calibri|Cambria|Tahoma|Verdana|Default Paragraph Font)$/i

  // Trích xuất chuỗi UTF-16LE (Word 97-2003 lưu văn bản tiếng Việt Unicode ở dạng UTF-16LE)
  const utf16Chunks: string[] = []
  for (let offset = 0; offset < 2; offset++) {
    let cur = ''
    for (let i = offset; i + 1 < bytes.length; i += 2) {
      const code = bytes[i] | (bytes[i + 1] << 8)
      const isValidViChar =
        code === 0x0007 ||
        code === 0x0009 ||
        code === 0x000a ||
        code === 0x000d ||
        (code >= 0x0020 && code <= 0x007e) ||
        (code >= 0x00a0 && code <= 0x024f) ||
        (code >= 0x1e00 && code <= 0x1eff) ||
        (code >= 0x2010 && code <= 0x20ab)
      if (isValidViChar) {
        cur += String.fromCharCode(code)
      } else {
        if (cur.trim().length >= 6) utf16Chunks.push(cur)
        cur = ''
      }
    }
    if (cur.trim().length >= 6) utf16Chunks.push(cur)
  }

  // Trích xuất chuỗi 8-bit ASCII / Windows-1258
  let asciiBuf = ''
  const asciiChunks: string[] = []
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]
    if (b === 7 || b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126)) {
      asciiBuf += String.fromCharCode(b)
    } else {
      if (asciiBuf.trim().length >= 8) asciiChunks.push(asciiBuf)
      asciiBuf = ''
    }
  }
  if (asciiBuf.trim().length >= 8) asciiChunks.push(asciiBuf)

  const bestSource =
    utf16Chunks.join('\n').length >= asciiChunks.join('\n').length * 0.35
      ? utf16Chunks.join('\n')
      : asciiChunks.join('\n')

  const paragraphs: string[] = []
  const tableRows: string[][] = []
  const currentRowCells: string[] = []

  // Trong định dạng nhị phân .doc, ký tự 0x07 (\x07) đánh dấu kết thúc 1 ô bảng, \r\x07 hoặc \x07\x07 kết thúc dòng bảng
  const segments = bestSource.split(/\r\n|\r|\n/)
  for (const seg of segments) {
    if (seg.includes('\x07')) {
      const parts = seg.split('\x07')
      for (let idx = 0; idx < parts.length; idx++) {
        const cleanCell = parts[idx].replace(/[\x00-\x1f]/g, ' ').replace(/\s+/g, ' ').trim()
        if (idx === parts.length - 1 && cleanCell === '' && currentRowCells.length > 0) {
          if (currentRowCells.some(Boolean)) {
            tableRows.push([...currentRowCells])
          }
          currentRowCells.length = 0
        } else if (cleanCell && !noiseRegex.test(cleanCell)) {
          currentRowCells.push(cleanCell)
        }
      }
    } else {
      const cleanLine = seg.replace(/[\x00-\x1f]/g, ' ').replace(/\s+/g, ' ').trim()
      if (
        cleanLine.length >= 3 &&
        !noiseRegex.test(cleanLine) &&
        !/^[A-Za-z0-9+/=]{40,}$/.test(cleanLine) &&
        /[A-Za-zÀ-ỹ0-9]/.test(cleanLine)
      ) {
        paragraphs.push(cleanLine)
      }
    }
  }
  if (currentRowCells.some(Boolean)) {
    tableRows.push([...currentRowCells])
  }

  const orderedOut: string[] = [...paragraphs]
  for (const r of tableRows) {
    orderedOut.push(r.join(' | '))
  }

  return {
    tables: tableRows.length > 0 ? [{ name: 'DOC Table', rows: tableRows }] : [],
    paragraphs,
    rawText: orderedOut.join('\n').trim()
  }
}

/**
 * Đọc tài liệu Word (.docx, .doc, .rtf) thành danh sách Bảng (2D rows) + Đoạn văn + Văn bản thô sạch.
 */
export async function readUniversalWordDocument(file: File): Promise<UniversalWordContent> {
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  const lowerName = String(file.name || '').toLowerCase()

  // 1. Kiểm tra file ZIP OOXML (.docx) - Magic bytes PK (0x50 0x4B)
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b) {
    const zip = await JSZip.loadAsync(arrayBuffer)
    const xmlPaths = Object.keys(zip.files).filter(p =>
      /^word\/(header\d*|document|footer\d*)\.xml$/i.test(p)
    )
    xmlPaths.sort((a, b) => {
      const rank = (s: string) =>
        s.includes('header') ? 1 : s.includes('document') ? 2 : 3
      return rank(a) - rank(b)
    })

    const allTables: UniversalTableSheet[] = []
    const allParagraphs: string[] = []
    const allLines: string[] = []

    for (const xp of xmlPaths) {
      const xmlText = await zip.files[xp].async('string')
      const parsed = parseWordXmlDocument(xmlText, xp.includes('document') ? 'DOCX' : 'Header')
      allTables.push(...parsed.tables)
      allParagraphs.push(...parsed.paragraphs)
      allLines.push(...parsed.orderedLines)
    }

    return {
      tables: allTables,
      paragraphs: allParagraphs,
      rawText: allLines.join('\n').trim()
    }
  }

  const textPreview = decodeBufferTextSmart(arrayBuffer.slice(0, 4096)).trim()

  // 2. Định dạng RTF
  if (lowerName.endsWith('.rtf') || textPreview.startsWith('{\\rtf')) {
    return parseRtfContent(decodeBufferTextSmart(arrayBuffer))
  }

  // 3. Định dạng Word 2003 XML
  if (/<\?xml/i.test(textPreview) && /w:wordDocument|<pkg:package/i.test(textPreview)) {
    const parsed = parseWordXmlDocument(decodeBufferTextSmart(arrayBuffer), 'WordXML')
    return {
      tables: parsed.tables,
      paragraphs: parsed.paragraphs,
      rawText: parsed.orderedLines.join('\n').trim()
    }
  }

  // 4. Định dạng HTML-doc (.doc xuất từ web / ERP)
  if (/^<!doctype\s+html|^<html|<table[\s>]|<body[\s>]/i.test(textPreview)) {
    const fullHtml = decodeBufferTextSmart(arrayBuffer)
    const tables = parseHtmlTablesFromText(fullHtml)
    let paragraphs: string[] = []
    if (typeof DOMParser !== 'undefined') {
      const doc = new DOMParser().parseFromString(fullHtml, 'text/html')
      paragraphs = Array.from(doc.querySelectorAll('p, h1, h2, h3, h4, div, li'))
        .filter(el => !el.closest('table') && el.children.length === 0)
        .map(el => String(el.textContent || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
    }
    const rawParts = [...paragraphs]
    tables.forEach(t => {
      t.rows.forEach(r => rawParts.push(r.join(' | ')))
    })
    return {
      tables,
      paragraphs,
      rawText: rawParts.join('\n').trim()
    }
  }

  // 5. Định dạng OLE2 Binary .doc cổ điển
  return parseBinaryOleDocBuffer(arrayBuffer)
}

/**
 * Chuyển đổi File ảnh bất kỳ thành Data URL JPEG nén chuẩn hóa (<= maxDimension px) để gửi sang Vision AI
 */
export async function fileToVisionDataUrl(file: File, maxDimension = 1920): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Không thể đọc dữ liệu file ảnh.'))
    reader.readAsDataURL(file)
  })

  if (typeof Image === 'undefined' || typeof document === 'undefined') {
    return rawDataUrl
  }

  return await new Promise<string>((resolve) => {
    const img = new Image()
    img.onload = () => {
      let w = img.naturalWidth || img.width || 1200
      let h = img.naturalHeight || img.height || 900
      if (w <= maxDimension && h <= maxDimension && /^data:image\/(jpeg|png|webp)/i.test(rawDataUrl) && file.size <= 2.5 * 1024 * 1024) {
        resolve(rawDataUrl)
        return
      }
      if (w > maxDimension || h > maxDimension) {
        const ratio = Math.min(maxDimension / w, maxDimension / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(rawDataUrl)
        return
      }
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.88))
    }
    img.onerror = () => resolve(rawDataUrl)
    img.src = rawDataUrl
  })
}

/**
 * Đọc văn bản có tọa độ từ PDF và kiểm tra xem có phải PDF dạng ảnh scan hay không
 */
export async function extractPdfTextAndCheckScanned(file: File): Promise<{
  numPages: number
  linesByPage: string[][]
  combinedText: string
  isScannedPdf: boolean
}> {
  const arrayBuffer = await file.arrayBuffer()
  const getDocFn = (pdfjsLib as any)?.getDocument || (pdfjsLib as any)?.default?.getDocument
  const pdf = await getDocFn({ data: new Uint8Array(arrayBuffer) }).promise
  const linesByPage: string[][] = []
  let totalChars = 0

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 1.0 })
    const tc = await page.getTextContent()
    const items: Array<{ str: string; x: number; xRight: number; topY: number }> = []

    for (const raw of (tc.items || []) as any[]) {
      const str = String(raw?.str ?? '')
      if (!str.trim()) continue
      const tr = raw.transform || [10, 0, 0, 10, 0, 0]
      const x = Number(tr[4]) || 0
      const width = Number(raw.width) || str.length * 4.5
      const topY = viewport.height - (Number(tr[5]) || 0)
      items.push({ str: str.trim(), x, xRight: x + width, topY })
    }

    items.sort((a, b) => a.topY - b.topY || a.x - b.x)
    const visualLines: Array<{ topY: number; tokens: typeof items }> = []
    for (const tok of items) {
      const existing = visualLines.find(l => Math.abs(l.topY - tok.topY) <= 4)
      if (existing) existing.tokens.push(tok)
      else visualLines.push({ topY: tok.topY, tokens: [tok] })
    }
    visualLines.sort((a, b) => a.topY - b.topY)

    const pageStrings: string[] = []
    for (const vl of visualLines) {
      vl.tokens.sort((a, b) => a.x - b.x)
      let lineStr = ''
      vl.tokens.forEach((t, idx) => {
        if (idx === 0) {
          lineStr += t.str
        } else {
          const gap = t.x - vl.tokens[idx - 1].xRight
          lineStr += (gap > 14 ? ' | ' : gap > 1.5 ? ' ' : '') + t.str
        }
      })
      const trimmed = lineStr.trim()
      if (trimmed) {
        pageStrings.push(trimmed)
        totalChars += trimmed.replace(/\s+/g, '').length
      }
    }
    linesByPage.push(pageStrings)
  }

  const combinedText = linesByPage
    .map((lines, idx) => (lines.length ? `--- TRANG ${idx + 1} ---\n${lines.join('\n')}` : ''))
    .filter(Boolean)
    .join('\n\n')
    .trim()

  const avgCharsPerPage = pdf.numPages > 0 ? totalChars / pdf.numPages : 0
  const isScannedPdf = totalChars < 35 || avgCharsPerPage < 25

  return {
    numPages: pdf.numPages,
    linesByPage,
    combinedText,
    isScannedPdf
  }
}

/**
 * Render các trang PDF ra danh sách ảnh JPEG Base64 để gửi Vision AI đọc bảng / PDF Scan
 */
export async function renderPdfPagesToVisionDataUrls(
  file: File,
  maxPages = 4,
  scale = 1.8
): Promise<string[]> {
  if (typeof document === 'undefined') return []
  const arrayBuffer = await file.arrayBuffer()
  const getDocFn = (pdfjsLib as any)?.getDocument || (pdfjsLib as any)?.default?.getDocument
  const pdf = await getDocFn({ data: new Uint8Array(arrayBuffer) }).promise
  const limit = Math.min(pdf.numPages, maxPages)
  const urls: string[] = []

  for (let p = 1; p <= limit; p++) {
    const page = await pdf.getPage(p)
    const vp = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = vp.width
    canvas.height = vp.height
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvasContext: ctx, viewport: vp }).promise
      urls.push(canvas.toDataURL('image/jpeg', 0.88))
    }
  }

  return urls
}

export function extractAiTextClean(result: any): string {
  if (!result) return ''
  let raw = ''
  if (typeof result === 'string') {
    raw = result
  } else if (Array.isArray(result?.choices) && result.choices.length > 0) {
    raw = String(result.choices[0]?.message?.content || result.choices[0]?.text || '')
  } else if (typeof result?.output_text === 'string' && result.output_text) {
    raw = result.output_text
  } else if (Array.isArray(result?.output)) {
    const texts: string[] = []
    for (const item of result.output) {
      if (item?.type === 'message' && Array.isArray(item.content)) {
        for (const c of item.content) {
          if (typeof c?.text === 'string') texts.push(c.text)
        }
      } else if (typeof item?.text === 'string') {
        texts.push(item.text)
      }
    }
    raw = texts.join('\n') || JSON.stringify(result.output)
  } else if (result?.output && typeof result.output?.text === 'string') {
    raw = result.output.text
  } else {
    raw = JSON.stringify(result)
  }

  return raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}

export function parseJsonFromAiResponse(rawText: string): any {
  const cleaned = String(rawText || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  if (!cleaned) {
    throw new Error('AI không trả về dữ liệu phản hồi.')
  }

  try {
    return JSON.parse(cleaned)
  } catch {
    const firstObj = cleaned.indexOf('{')
    const lastObj = cleaned.lastIndexOf('}')
    const firstArr = cleaned.indexOf('[')
    const lastArr = cleaned.lastIndexOf(']')

    if (firstObj !== -1 && lastObj > firstObj && (firstArr === -1 || firstObj < firstArr)) {
      return JSON.parse(cleaned.slice(firstObj, lastObj + 1))
    }
    if (firstArr !== -1 && lastArr > firstArr) {
      return JSON.parse(cleaned.slice(firstArr, lastArr + 1))
    }
    if (firstObj !== -1 && lastObj > firstObj) {
      return JSON.parse(cleaned.slice(firstObj, lastObj + 1))
    }
    throw new Error('Không thể phân tích cấu trúc dữ liệu JSON từ phản hồi của AI.')
  }
}

/**
 * Gọi AI (deepseek-v4-1-flash-261017) qua chuẩn /api/v3/responses hỗ trợ 1 hoặc nhiều trang ảnh
 */
async function callVisionAiMultiImages(prompt: string, base64Images: string[]): Promise<string> {
  if (!base64Images.length) {
    throw new Error('Không có hình ảnh để phân tích AI.')
  }

  if (base64Images.length === 1) {
    const dolaRes = await callDolaVision(prompt, base64Images[0], false)
    const txt = extractAiTextClean(dolaRes)
    if (!txt) {
      throw new Error('AI Vision không trả về nội dung văn bản.')
    }
    return txt
  }

  const { apiUrl: dolaRuntimeUrl, apiKey: dolaRuntimeKey, model: dolaRuntimeModel } = getDolaRuntimeConfig()

  const contentItems: any[] = [{ type: 'input_text', text: prompt }]
  for (const imgUrl of base64Images) {
    contentItems.push({
      type: 'input_image',
      image_url: imgUrl
    })
  }

  const resp = await fetch(dolaRuntimeUrl || '/byteplus-api/api/v3/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${dolaRuntimeKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: dolaRuntimeModel,
      stream: false,
      input: [{ role: 'user', content: contentItems }]
    })
  })

  if (!resp.ok) {
    const errBody = await resp.text()
    throw new Error(`AI Vision /responses error ${resp.status}: ${errBody}`)
  }

  const json = await resp.json()
  const txt = extractAiTextClean(json)
  if (!txt) {
    throw new Error('AI Vision không trả về nội dung văn bản.')
  }
  return txt
}

/**
 * Trích xuất văn bản thô từ mọi loại file (Excel mọi đuôi, Word .docx/.doc/.rtf, PDF text/scan, Ảnh)
 */
export async function extractUniversalRawText(
  file: File,
  onProgress?: (msg: string) => void
): Promise<string> {
  if (isImageDocFile(file)) {
    onProgress?.('Đang nhận diện văn bản từ hình ảnh (OCR)...')
    const ocrRes = await Tesseract.recognize(file, 'vie+eng')
    return String(ocrRes?.data?.text || '').trim()
  }

  if (isPdfDocFile(file)) {
    onProgress?.('Đang trích xuất nội dung từ file PDF...')
    const pdfInfo = await extractPdfTextAndCheckScanned(file)
    if (!pdfInfo.isScannedPdf && pdfInfo.combinedText.length >= 30) {
      return pdfInfo.combinedText
    }
    onProgress?.('PDF dạng ảnh quét — Đang nhận diện văn bản bằng OCR...')
    const pageImgs = await renderPdfPagesToVisionDataUrls(file, 3, 2.0)
    const ocrParts: string[] = []
    for (let i = 0; i < pageImgs.length; i++) {
      onProgress?.(`Đang nhận diện OCR trang ${i + 1}/${pageImgs.length}...`)
      const res = await Tesseract.recognize(pageImgs[i], 'vie+eng')
      if (res?.data?.text) ocrParts.push(`--- TRANG ${i + 1} ---\n${res.data.text}`)
    }
    return ocrParts.join('\n\n').trim() || pdfInfo.combinedText
  }

  if (isWordDocFile(file)) {
    onProgress?.('Đang đọc cấu trúc bảng và văn bản từ file Word...')
    const wordContent = await readUniversalWordDocument(file)
    const outParts: string[] = []
    if (wordContent.paragraphs.length > 0) {
      outParts.push('=== VĂN BẢN TÀI LIỆU ===')
      outParts.push(...wordContent.paragraphs.slice(0, 180))
    }
    wordContent.tables.forEach((tbl, idx) => {
      outParts.push(`=== BẢNG ${idx + 1} (${tbl.name}) ===`)
      tbl.rows.slice(0, 250).forEach((r, rIdx) => {
        const cleanCells = r.map(c => c.replace(/\r?\n/g, ' ; ').trim())
        if (cleanCells.some(Boolean)) {
          outParts.push(`Dòng ${rIdx + 1}: ${cleanCells.join(' | ')}`)
        }
      })
    })
    return outParts.join('\n').trim() || wordContent.rawText
  }

  // Mặc định xử lý như Spreadsheet / Excel mọi đuôi
  onProgress?.('Đang đọc dữ liệu các Sheet từ file bảng tính...')
  const sheets = await readUniversalSpreadsheetSheets(file)
  const outLines: string[] = []
  for (const sh of sheets) {
    outLines.push(`=== SHEET: ${sh.name} ===`)
    sh.rows.slice(0, 260).forEach((row, rIdx) => {
      const cells = row.map(c => String(c ?? '').replace(/\r?\n/g, ' ; ').trim()).filter(Boolean)
      if (cells.length > 0) {
        outLines.push(`Dòng ${rIdx + 1}: ${cells.join(' | ')}`)
      }
    })
  }
  return outLines.join('\n').trim()
}

/**
 * Trung tâm gọi AI đa phương thức:
 * - Nếu là Ảnh hoặc PDF Scan: Ưu tiên dùng Vision AI (Dola Seed 2.0 Pro) nhìn trực tiếp bố cục bảng/chữ, lỗi mới fallback sang OCR + DeepSeek.
 * - Nếu là Excel (mọi đuôi), Word (.docx/.doc/.rtf), hoặc PDF có lớp text: Trích xuất cấu trúc bảng/dòng sạch gửi sang DeepSeek V4 Pro.
 */
export async function callSmartDocumentAI(
  file: File,
  systemPrompt: string,
  userContextLabel: string,
  onProgress?: (msg: string) => void,
  maxVisionPages = 4
): Promise<{ parsed: any; rawSourceText: string; engine: 'vision' | 'deepseek' }> {
  if (isImageDocFile(file)) {
    onProgress?.('AI Vision đang đọc trực tiếp hình ảnh...')
    try {
      const dataUrl = await fileToVisionDataUrl(file, 1920)
      const combinedPrompt = `${systemPrompt}\n\n${userContextLabel} (File ảnh: "${file.name}")`
      const visionText = await callVisionAiMultiImages(combinedPrompt, [dataUrl])
      const parsed = parseJsonFromAiResponse(visionText)
      return { parsed, rawSourceText: visionText, engine: 'vision' }
    } catch (visionErr) {
      console.warn('Vision AI gặp sự cố, tự động chuyển sang OCR + DeepSeek:', visionErr)
    }
  }

  if (isPdfDocFile(file)) {
    onProgress?.('Đang kiểm tra cấu trúc file PDF...')
    const pdfInfo = await extractPdfTextAndCheckScanned(file)
    if (pdfInfo.isScannedPdf) {
      onProgress?.('Phát hiện PDF dạng ảnh quét — AI Vision đang đọc các trang tài liệu...')
      try {
        const pageDataUrls = await renderPdfPagesToVisionDataUrls(file, maxVisionPages, 1.85)
        if (pageDataUrls.length > 0) {
          const combinedPrompt = `${systemPrompt}\n\n${userContextLabel} (Tài liệu PDF "${file.name}", gồm ${pageDataUrls.length} trang ảnh)`
          const visionText = await callVisionAiMultiImages(combinedPrompt, pageDataUrls)
          const parsed = parseJsonFromAiResponse(visionText)
          return { parsed, rawSourceText: visionText, engine: 'vision' }
        }
      } catch (pdfVisionErr) {
        console.warn('Vision AI cho PDF scan gặp sự cố, chuyển sang OCR + DeepSeek:', pdfVisionErr)
      }
    } else if (pdfInfo.combinedText.length >= 25) {
      onProgress?.('AI đang phân tích dữ liệu trích xuất từ PDF...')
      const messages = [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `${userContextLabel} (File "${file.name}"):\n\n${pdfInfo.combinedText.slice(0, 22000)}`
        }
      ]
      const res = await callDeepSeek(messages, false, false)
      const aiText = extractAiTextClean(res)
      return {
        parsed: parseJsonFromAiResponse(aiText),
        rawSourceText: pdfInfo.combinedText,
        engine: 'deepseek'
      }
    }
  }

  const rawText = await extractUniversalRawText(file, onProgress)
  if (!rawText || rawText.length < 8) {
    throw new Error('Không đọc được nội dung văn bản từ file này để gửi tới AI.')
  }

  onProgress?.('AI đang phân tích cấu trúc và bóc tách dữ liệu...')
  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `${userContextLabel} (File "${file.name}"):\n\n${rawText.slice(0, 22000)}`
    }
  ]
  const res = await callDeepSeek(messages, false, false)
  const aiText = extractAiTextClean(res)
  return {
    parsed: parseJsonFromAiResponse(aiText),
    rawSourceText: rawText,
    engine: 'deepseek'
  }
}

/* ============================================================================
   BỘ QUÉT TIÊU CHUẨN ĐA ĐỊNH DẠNG (EXCEL MỌI ĐUÔI / WORD / PDF / ẢNH)
   ============================================================================ */

function escapePlainToSimpleHtml(text: string): string {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r?\n/g, '<br>')
}

function cleanCustomerCompanyText(raw: string): string {
  const s = String(raw || '')
    .replace(/^[\s:–\-]+/, '')
    .replace(/(?:^|\s)(?:ngày|date)\s*(?::|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}).*$/i, '')
    .replace(/(?:^|\s)(?:mst|mã\s*số\s*thuế|tax\s*code)\s*:?.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!s || /^\{+.*\}+$/i.test(s) || /nam\s+trường\s+sơn|ntssi/i.test(s)) return ''
  return s
}

function cleanCustomerRecipientText(raw: string): string {
  const s = String(raw || '')
    .replace(/^[\s:–\-]+/, '')
    .replace(/(?:^|\s)(?:tel|mobile|sđt|số\s*điện\s*thoại|điện\s*thoại|đt|email|e-mail|fax|chức\s*vụ|bộ\s*phận|phòng|ngày|date)\s*:?.*$/i, '')
    .replace(/(?:[\s\-–/|,(]+(?:\+?84|0)\d[\d\s.\-]{7,}\)?)$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!s || /^\{+.*\}+$/i.test(s) || /^(?:mr|ms|mrs|miss|dr|anh|chị|chi|ông|ong|bà|ba)\.?$/i.test(s)) return ''
  return s
}

function cleanCustomerAddressText(raw: string): string {
  const s = String(raw || '')
    .replace(/^[\s:–\-]+/, '')
    .replace(/(?:^|\s)(?:ngày|date)\s*(?::|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}).*$/i, '')
    .replace(/(?:^|\s)(?:tel|fax|mobile|sđt|số\s*điện\s*thoại|điện\s*thoại|mst|mã\s*số\s*thuế)\s*:?.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!s || /^\{+.*\}+$/i.test(s) || /tăng\s*bạt\s*hổ|tang\s*bat\s*ho/i.test(s)) return ''
  return s
}

export function extractCustomerFromHeaderLinesGeneric(lines: string[]): ExtractedCustomerFields {
  const out: ExtractedCustomerFields = {}
  const isNextCellAnotherLabel = (txt: string) =>
    /^(?:ngày|date|số\s*báo\s*giá|quote\s*no|địa\s*chỉ|dia\s*chi|address|người\s*nhận|nguoi\s*nhan|người\s*liên\s*hệ|attn|attention|contact|tel|mobile|sđt|số\s*điện\s*thoại|điện\s*thoại|phone|email|e-mail|fax|mst|mã\s*số\s*thuế|tax)(?:\s|\(\*\)|:|$)/i.test(
      String(txt || '').trim()
    )

  for (const rawLine of lines.slice(0, 45)) {
    const subLines = String(rawLine || '')
      .split(/\r?\n|\|/)
      .map(s => s.trim())
      .filter(Boolean)
    if (subLines.length === 0) continue

    const rowUpper = subLines.join('|').toUpperCase()
    if (
      (rowUpper.includes('STT') || rowUpper.includes('NO.')) &&
      (rowUpper.includes('TÊN HÀNG') ||
        rowUpper.includes('MODEL') ||
        rowUpper.includes('PART#') ||
        rowUpper.includes('DIỄN GIẢI') ||
        rowUpper.includes('SẢN PHẨM') ||
        rowUpper.includes('HÀNG HÓA'))
    ) {
      break
    }

    for (let j = 0; j < subLines.length; j++) {
      const line = subLines[j]

      if (
        !out.Ten_cong_ty &&
        /(?:^|\b)(?:kính\s*g[ởiử]i|kinh\s*g[oiu]i|khách\s*hàng|bên\s*mua|customer|bill\s*to|client)(?:\s*:|$)/i.test(line)
      ) {
        const m = line.match(
          /(?:kính\s*g[ởiử]i|kinh\s*g[oiu]i|khách\s*hàng|bên\s*mua|customer|bill\s*to|client)\s*:?\s*(.*)/i
        )
        let cand = m && m[1] ? cleanCustomerCompanyText(m[1]) : ''
        if (!cand && j + 1 < subLines.length && !isNextCellAnotherLabel(subLines[j + 1])) {
          cand = cleanCustomerCompanyText(subLines[j + 1])
        }
        if (cand) out.Ten_cong_ty = cand
      } else if (!out.Ten_cong_ty && /^(?:kính\s*g[ởiử]i|kinh\s*g[oiu]i)\b/i.test(line)) {
        const m = line.match(/^(?:kính\s*g[ởiử]i|kinh\s*g[oiu]i)\s*:?\s*(.*)/i)
        let cand = m && m[1] ? cleanCustomerCompanyText(m[1]) : ''
        if (!cand && j + 1 < subLines.length && !isNextCellAnotherLabel(subLines[j + 1])) {
          cand = cleanCustomerCompanyText(subLines[j + 1])
        }
        if (cand) out.Ten_cong_ty = cand
      }

      if (
        !out.Ten_khach_hang &&
        /(?:^|\b)(?:người\s*nhận|nguoi\s*nhan|người\s*liên\s*hệ|đại\s*diện|attn|attention|contact\s*person|contact)(?:\s*:|\s+|$)/i.test(line) &&
        !/người\s*nhận\s*hàng/i.test(line)
      ) {
        const isPureOrColon =
          /^(?:người\s*nhận|nguoi\s*nhan|người\s*liên\s*hệ|đại\s*diện|attn|attention|contact\s*person|contact)\s*:?$/i.test(
            line
          ) ||
          /(?:người\s*nhận|nguoi\s*nhan|người\s*liên\s*hệ|đại\s*diện|attn|attention|contact\s*person|contact)\s*:/i.test(
            line
          ) ||
          /^(?:người\s*nhận|nguoi\s*nhan|người\s*liên\s*hệ|attn)\b/i.test(line)
        if (isPureOrColon) {
          const m = line.match(
            /(?:người\s*nhận|nguoi\s*nhan|người\s*liên\s*hệ|đại\s*diện|attn|attention|contact\s*person|contact)\s*:?\s*(.*)/i
          )
          let cand = m && m[1] ? cleanCustomerRecipientText(m[1]) : ''
          if (!cand && j + 1 < subLines.length && !isNextCellAnotherLabel(subLines[j + 1])) {
            cand = cleanCustomerRecipientText(subLines[j + 1])
          }
          if (cand) out.Ten_khach_hang = cand
        }
      }

      if (
        !out.Dia_chi_cong_ty &&
        /(?:^|\b)(?:địa\s*chỉ|dia\s*chi|address)(?:\s*\(\*\))?(?:\s*:|$)/i.test(line) &&
        !/tăng\s*bạt\s*hổ|tang\s*bat\s*ho|giao\s*hàng/i.test(line)
      ) {
        const m = line.match(/(?:địa\s*chỉ|dia\s*chi|address)\s*(?:\(\*\))?\s*:?\s*(.*)/i)
        let cand = m && m[1] ? cleanCustomerAddressText(m[1]) : ''
        if (!cand && j + 1 < subLines.length && !isNextCellAnotherLabel(subLines[j + 1])) {
          cand = cleanCustomerAddressText(subLines[j + 1])
        }
        if (cand) out.Dia_chi_cong_ty = cand
      } else if (
        !out.Dia_chi_cong_ty &&
        /^(?:địa\s*chỉ|dia\s*chi|address)\b/i.test(line) &&
        !/tăng\s*bạt\s*hổ|tang\s*bat\s*ho|giao\s*hàng/i.test(line)
      ) {
        const m = line.match(/^(?:địa\s*chỉ|dia\s*chi|address)\s*(?:\(\*\))?\s*:?\s*(.*)/i)
        const cand = m && m[1] ? cleanCustomerAddressText(m[1]) : ''
        if (cand) out.Dia_chi_cong_ty = cand
      }

      if (!out.MST && /(?:mã\s*số\s*thuế|mst|tax\s*code|tax\s*id)\s*:?(?:\s|$)/i.test(line)) {
        const m = line.match(/(?:mã\s*số\s*thuế|mst|tax\s*code|tax\s*id)\s*:?\s*([0-9\-]{8,16})/i)
        let cand = m && m[1] ? m[1].trim() : ''
        if (!cand && j + 1 < subLines.length) {
          const mNext = subLines[j + 1].match(/^([0-9\-]{8,16})$/)
          if (mNext) cand = mNext[1].trim()
        }
        if (cand && !cand.startsWith('0309')) out.MST = cand
      }

      if (!out.Email_ca_nhan) {
        const em = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
        if (em && !/ntssi|namtruongson/i.test(em[0])) out.Email_ca_nhan = em[0].trim()
      }

      if (
        !out.So_dien_thoai_ca_nhan &&
        /(?:số\s*điện\s*thoại|điện\s*thoại|sđt|tel|mobile|phone|hp)\s*:?(?:\s|$)/i.test(line) &&
        !/tăng\s*bạt\s*hổ|028\s*3841/i.test(line)
      ) {
        const pm = line.match(
          /(?:số\s*điện\s*thoại|điện\s*thoại|sđt|tel|mobile|phone|hp)\s*:?\s*([+0-9()\s.\-]{8,18})/i
        )
        let cand = pm && pm[1] ? pm[1].trim() : ''
        if (!cand && j + 1 < subLines.length) {
          const pmNext = subLines[j + 1].match(/^([+0-9()\s.\-]{8,18})/)
          if (pmNext) cand = pmNext[1].trim()
        }
        if (cand) out.So_dien_thoai_ca_nhan = cand
      }

      if (!out.So_fax_cong_ty && /\bfax\s*:?(?:\s|$)/i.test(line)) {
        const fm = line.match(/\bfax\s*:?\s*([+0-9()\s.\-]{7,18})/i)
        let cand = fm && fm[1] ? fm[1].trim() : ''
        if (!cand && j + 1 < subLines.length) {
          const fmNext = subLines[j + 1].match(/^([+0-9()\s.\-]{7,18})/)
          if (fmNext) cand = fmNext[1].trim()
        }
        if (cand) out.So_fax_cong_ty = cand
      }
    }
  }
  return out
}

/**
 * Quét bảng Báo Giá chuẩn từ danh sách bảng 2D (dùng cho mọi đuôi Excel & Word .docx/.doc/.rtf)
 */
export function parseSalesQuoteSheetsStandard(
  sheets: UniversalTableSheet[],
  extraParagraphs: string[] = [],
  defaultCurrency = 'VND'
): {
  items: any[]
  termsHtml: string
  extractedCustomer: ExtractedCustomerFields
} {
  const headerPool = [...extraParagraphs.slice(0, 35)]
  let bestItems: any[] = []
  let bestTermsHtml = ''

  const mapSalesHeaderCells = (
    targetRow: string[],
    colMap: Record<string, number>,
    state: { modelCol?: number; tenCandidateCol?: number },
    isSubRow = false
  ) => {
    targetRow.forEach((cell, idx) => {
      const header = String(cell ?? '').toUpperCase().replace(/\s+/g, ' ').trim()
      if (!header) return
      if ((header.includes('STT') || header === 'NO.' || header === 'NO' || header === 'TT' || header === '#' || header === 'ITEM') && colMap['stt'] === undefined) {
        colMap['stt'] = idx
      } else if ((header === 'P/N' || header === 'PN' || header.includes('MÃ HÀNG') || header.includes('PART NUMBER') || header.includes('MÃ SP') || header.includes('MÃ SẢN PHẨM')) && colMap['maHang'] === undefined) {
        colMap['maHang'] = idx
      } else if ((header.includes('MODEL') || header.includes('PART#') || header.includes('SKU')) && state.modelCol === undefined) {
        state.modelCol = idx
        if (colMap['tenHang'] === undefined) colMap['tenHang'] = idx
      } else if (header.includes('TÊN HÀNG') || header.includes('HÀNG HÓA') || header.includes('SẢN PHẨM') || header.includes('THIẾT BỊ') || header.includes('DỊCH VỤ')) {
        if (colMap['tenHang'] === undefined) colMap['tenHang'] = idx
        else if (colMap['tenHang'] === state.modelCol && state.tenCandidateCol === undefined) state.tenCandidateCol = idx
      } else if ((header === 'DESCRIPTION' || header === 'PRODUCT DESCRIPTION' || header.startsWith('DESCRIPTION (')) && colMap['description'] === undefined) {
        colMap['description'] = idx
      } else if ((header.includes('DIỄN GIẢI') || header.includes('MÔ TẢ') || header.includes('THÔNG SỐ') || header.includes('NỘI DUNG') || header.includes('HẠNG MỤC') || header.includes('ĐẶC TÍNH') || header.includes('SPEC')) && colMap['features'] === undefined) {
        colMap['features'] = idx
      } else if ((header.includes('HÃNG') || header.includes('NHÀ CUNG CẤP') || header === 'BRAND' || header === 'VENDOR') && colMap['hang'] === undefined) {
        colMap['hang'] = idx
      } else if ((header.includes('ĐƠN VỊ') || header === 'ĐVT' || header === 'DVT' || header === 'UNIT') && colMap['dvt'] === undefined) {
        colMap['dvt'] = idx
      } else if ((header.includes('THỜI HẠN') || header.includes('DURATION') || header.includes('TERM')) && colMap['license_duration'] === undefined) {
        colMap['license_duration'] = idx
      } else if ((header.includes('BẢO HÀNH') || header.includes('WARRANTY')) && colMap['baoHanh'] === undefined) {
        colMap['baoHanh'] = idx
      } else if ((header === 'S.L' || header === 'S.L.' || header.includes('SỐ LƯỢNG') || header.includes('S.LƯỢNG') || header === 'SL' || header === 'QTY' || header === 'QUANTITY') && colMap['sl'] === undefined) {
        colMap['sl'] = idx
      } else if (
        header.includes('ĐƠN GIÁ') ||
        header.includes('GIÁ BÁN') ||
        header.includes('UNIT PRICE') ||
        header.includes('PRICES LIST') ||
        header.includes('LIST PRICE') ||
        header.includes('MSRP') ||
        header.includes('GIÁ THAM KHẢO')
      ) {
        if (isSubRow && colMap['truocThue'] === idx) delete colMap['truocThue']
        if (colMap['donGia'] === undefined) colMap['donGia'] = idx
      } else if (
        ((header.includes('THÀNH TIỀN') && !header.includes('SAU') && !header.includes('CÓ VAT')) ||
          header.includes('TRƯỚC THUẾ') ||
          header.includes('CHƯA VAT') ||
          header.includes('ESTIMATED VALUE') ||
          header === 'AMOUNT' ||
          header === 'TOTAL' ||
          header.includes('TỔNG TIỀN'))
      ) {
        if (colMap['truocThue'] === undefined || (isSubRow && (header.includes('TRƯỚC THUẾ') || header.includes('CHƯA VAT')))) {
          colMap['truocThue'] = idx
        }
      } else if (
        (header.includes('SAU THUẾ') || header.includes('CÓ VAT') || header.includes('SAU VAT')) &&
        colMap['sauThue'] === undefined
      ) {
        colMap['sauThue'] = idx
      } else if (
        (header === 'VAT' || header.startsWith('VAT ') || header.includes('THUẾ')) &&
        !header.includes('THÀNH TIỀN') &&
        !header.includes('TRƯỚC') &&
        !header.includes('SAU') &&
        colMap['vat'] === undefined
      ) {
        colMap['vat'] = idx
      }
    })
  }

  for (const sheet of sheets) {
    const rows = sheet.rows
    let headerRowIndex = -1
    const colMap: Record<string, number> = {}
    let readingTerms = false
    let sheetTermsHtml = ''
    const summaryLines: string[] = []
    let inSummary = false
    const sheetItems: any[] = []

    const topLines = rows.slice(0, 25).map(r => r.filter(Boolean).join(' | '))
    headerPool.push(...topLines)
    const detectedVendor = extractVendorNameFromLines(topLines)

    for (let i = 0; i < Math.min(rows.length, 500); i++) {
      const row = rows[i]
      if (!Array.isArray(row) || !row.some(Boolean)) continue

      if (headerRowIndex === -1) {
        const nonEmptyCells = row.map(c => String(c ?? '').toUpperCase().replace(/\s+/g, ' ').trim()).filter(Boolean)
        const rowStr = nonEmptyCells.join('|')
        const hasIndexCol =
          nonEmptyCells.some(c => c === 'STT' || c === 'NO.' || c === 'NO' || c === 'TT' || c === '#' || c === 'ITEM' || c.startsWith('STT '))
        const hasItemCol =
          rowStr.includes('TÊN HÀNG') ||
          rowStr.includes('MODEL') ||
          rowStr.includes('PART#') ||
          rowStr.includes('PART NUMBER') ||
          rowStr.includes('SKU') ||
          rowStr.includes('MÃ HÀNG') ||
          rowStr.includes('HÀNG HÓA') ||
          rowStr.includes('SẢN PHẨM') ||
          rowStr.includes('THIẾT BỊ') ||
          rowStr.includes('DIỄN GIẢI') ||
          rowStr.includes('MÔ TẢ') ||
          rowStr.includes('DESCRIPTION') ||
          rowStr.includes('HẠNG MỤC') ||
          rowStr.includes('DỊCH VỤ')
        const hasPriceOrQtyCol =
          rowStr.includes('ĐƠN GIÁ') ||
          rowStr.includes('GIÁ BÁN') ||
          rowStr.includes('UNIT PRICE') ||
          rowStr.includes('PRICES LIST') ||
          rowStr.includes('LIST PRICE') ||
          rowStr.includes('MSRP') ||
          rowStr.includes('GIÁ THAM KHẢO') ||
          rowStr.includes('THÀNH TIỀN') ||
          rowStr.includes('TRƯỚC THUẾ') ||
          rowStr.includes('ESTIMATED VALUE') ||
          rowStr.includes('SỐ LƯỢNG') ||
          nonEmptyCells.some(c => c === 'SL' || c === 'S.L' || c === 'S.L.' || c === 'QTY' || c === 'AMOUNT' || c === 'TOTAL')

        if (nonEmptyCells.length >= 2 && hasItemCol && (hasIndexCol || hasPriceOrQtyCol)) {
          headerRowIndex = i
          const headerState: { modelCol?: number; tenCandidateCol?: number } = {}
          mapSalesHeaderCells(row, colMap, headerState, false)

          // Kiểm tra dòng kế tiếp xem có phải dòng tiêu đề con (Merged 2-row Header) không
          if (i + 1 < rows.length && Array.isArray(rows[i + 1])) {
            const nextRow = rows[i + 1]
            const nextCells = nextRow.map(c => String(c ?? '').toUpperCase().replace(/\s+/g, ' ').trim()).filter(Boolean)
            const sttValNext = colMap['stt'] !== undefined ? String(nextRow[colMap['stt']] ?? '').trim() : ''
            const looksLikeDataRow =
              /^\d+\.?$/.test(sttValNext) && nextCells.some(c => parseCleanNumber(c) > 100)
            const hasSubHeaderKeywords =
              nextCells.length > 0 &&
              nextCells.every(c => c.length <= 45) &&
              nextCells.some(
                c =>
                  c.includes('ĐƠN GIÁ') ||
                  c.includes('TRƯỚC THUẾ') ||
                  c.includes('CHƯA VAT') ||
                  c.includes('SAU THUẾ') ||
                  c.includes('CÓ VAT') ||
                  c.includes('SAU VAT') ||
                  c === 'VAT' ||
                  c.includes('THUẾ VAT') ||
                  c.includes('THÀNH TIỀN') ||
                  c.includes('UNIT PRICE') ||
                  c === 'AMOUNT' ||
                  c.includes('SỐ LƯỢNG') ||
                  c === 'SL' ||
                  c === 'QTY'
              )
            if (!looksLikeDataRow && hasSubHeaderKeywords) {
              mapSalesHeaderCells(nextRow, colMap, headerState, true)
              i++
            }
          }

          if (headerState.tenCandidateCol !== undefined) {
            if (colMap['features'] !== undefined || colMap['description'] !== undefined) {
              if (headerState.modelCol !== undefined && colMap['maHang'] === undefined) {
                colMap['maHang'] = headerState.modelCol
              }
              colMap['tenHang'] = headerState.tenCandidateCol
            } else {
              colMap['features'] = headerState.tenCandidateCol
            }
          }
          if (colMap['features'] === undefined && colMap['description'] !== undefined) {
            colMap['features'] = colMap['description']
          }
        }
        continue
      }

      const rowJoined = row.filter(Boolean).join(' ').trim()
      const rowUpper = rowJoined.toUpperCase()

      if (
        !readingTerms &&
        (rowUpper.includes('ĐIỀU KHOẢN') || rowUpper.includes('ĐIỀU KIỆN THƯƠNG MẠI'))
      ) {
        readingTerms = true
      }

      if (
        !inSummary &&
        !readingTerms &&
        (rowUpper.includes('TỔNG CỘNG') ||
          rowUpper.includes('TỔNG CHƯA VAT') ||
          rowUpper.includes('TỔNG TRƯỚC THUẾ') ||
          rowUpper.includes('TỔNG GIÁ TRỊ') ||
          rowUpper.includes('TỔNG THANH TOÁN') ||
          rowUpper.includes('CỘNG TIỀN HÀNG') ||
          rowUpper.includes('PHẦN MỀM KHÔNG CHỊU THUẾ') ||
          /^VAT\s*\d+/i.test(rowUpper))
      ) {
        inSummary = true
      }

      if (readingTerms) {
        if (
          rowJoined &&
          !rowUpper.includes('TỔNG CỘNG') &&
          !rowUpper.includes('THÀNH TIỀN') &&
          !/^[\d.,\s]+$/.test(rowJoined)
        ) {
          sheetTermsHtml += `<p style="margin: 0; padding-bottom: 4px;">${escapePlainToSimpleHtml(rowJoined)}</p>`
        }
        continue
      }

      if (inSummary) {
        if (rowJoined) summaryLines.push(rowJoined)
        continue
      }

      const getCol = (k: string) => (colMap[k] !== undefined ? String(row[colMap[k]] ?? '').trim() : '')
      const stt = getCol('stt')
      const rawTen = getCol('tenHang')
      const rawFeatures = getCol('features')
      const rawMa = getCol('maHang')
      const rawDesc = colMap['description'] !== colMap['features'] ? getCol('description') : ''

      const effectiveTenHang =
        rawTen || (rawFeatures ? rawFeatures.split(/\r?\n/)[0].trim() : '') || rawMa
      if (!effectiveTenHang) continue

      const sl = Math.max(1, parseCleanNumber(getCol('sl')) || 1)
      let donGia = parseCleanNumber(getCol('donGia'))
      let truocThue = parseCleanNumber(getCol('truocThue')) || sl * donGia
      const sauThue = parseCleanNumber(getCol('sauThue'))

      const vatVal = parseCleanNumber(getCol('vat'))
      let vatPct = 0
      if (vatVal > 0 && vatVal < 1) vatPct = Math.round(vatVal * 100)
      else if (vatVal > 0 && truocThue > 0 && vatVal > 100) vatPct = Math.round((vatVal / truocThue) * 100)
      else if (vatVal > 0 && vatVal <= 100) vatPct = Math.round(vatVal)

      if (!donGia && !truocThue && sauThue > 0) {
        truocThue = vatPct > 0 ? Math.round(sauThue / (1 + vatPct / 100)) : sauThue
      }
      if (!donGia && truocThue > 0 && sl > 0) {
        donGia = Math.round(truocThue / sl)
      }

      const isRomanSection = /^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.?$/i.test(stt)
      if (donGia === 0 && truocThue === 0 && (isRomanSection || !rawFeatures)) {
        continue
      }

      const meta = extractMetadataFromBulletLines(rawFeatures || rawTen)
      const explicitMa = rawMa || meta.partNumber
      const generatedMa =
        explicitMa ||
        removeDiacriticsSimple(effectiveTenHang)
          .toUpperCase()
          .replace(/\s+/g, '')
          .replace(/[^A-Z0-9]/g, '')

      sheetItems.push({
        uid: Math.random().toString(36).slice(2, 11),
        Ten_hang: effectiveTenHang,
        Features: escapePlainToSimpleHtml(rawFeatures || effectiveTenHang),
        DVT: getCol('dvt') || 'Bản quyền',
        License_duration: getCol('license_duration') || meta.duration || '1 Năm',
        So_luong: sl,
        Don_gia: donGia,
        Gia_tieu_chuan: donGia,
        Thue_VAT: vatPct,
        Ma_hang: generatedMa,
        sku_code: explicitMa || '',
        _hasExplicitMaHang: Boolean(explicitMa),
        _rawPs: explicitMa || effectiveTenHang,
        _rawMota: rawFeatures,
        _sttIndex: /^\d+$/.test(stt) ? parseInt(stt, 10) : sheetItems.length + 1,
        Main_img: '',
        Ma_nha_cung_cap: '',
        Ten_nha_cung_cap: getCol('hang') || detectedVendor || '',
        Mo_ta_chung: '',
        Mo_ta_chi_tiet: '',
        Danh_muc: '',
        thoi_han_bao_hanh: getCol('baoHanh') || meta.warranty || '',
        Type: meta.itemType || '',
        Trang_thai: '',
        Don_vi_tien_te: defaultCurrency || 'VND',
        Ti_gia: 1,
        Ma_hang_lien_ket: '',
        Ten_hang_lien_ket: '',
        Ghi_chu: '',
        gia_hardware: 0,
        gia_nhap: 0,
        muc_phan_tram_off: 0,
        volume: '',
        Description: escapePlainToSimpleHtml(rawDesc)
      })
    }

    if (sheetItems.length > 0 && summaryLines.length > 0) {
      applySummaryVatAndComputeAfterTaxCost(sheetItems, summaryLines, false)
    }

    if (sheetItems.length > bestItems.length) {
      bestItems = sheetItems
      bestTermsHtml = sheetTermsHtml
    }
  }

  // Nếu có thêm các đoạn điều khoản nằm ngoài bảng (trong Word paragraphs)
  if (!bestTermsHtml && extraParagraphs.length > 0) {
    let inTermsPara = false
    const termParas: string[] = []
    for (const p of extraParagraphs) {
      const u = p.toUpperCase()
      if (u.includes('ĐIỀU KHOẢN') || u.includes('ĐIỀU KIỆN THƯƠNG MẠI')) {
        inTermsPara = true
      }
      if (inTermsPara) {
        if (u.startsWith('TRÂN TRỌNG') || u.includes('XÁC NHẬN ĐẶT HÀNG') || u.includes('ĐẠI DIỆN')) break
        termParas.push(`<p style="margin: 0; padding-bottom: 4px;">${escapePlainToSimpleHtml(p)}</p>`)
      }
    }
    if (termParas.length > 0) bestTermsHtml = termParas.join('')
  }

  return {
    items: bestItems,
    termsHtml: bestTermsHtml,
    extractedCustomer: extractCustomerFromHeaderLinesGeneric(headerPool)
  }
}

/**
 * Quét chuẩn File Đề Xuất Mua Hàng / PO để lấy thông tin Khách hàng (hỗ trợ mọi đuôi Excel, Word, PDF)
 */
export async function parseCustomerDxmhStandardFromFile(
  file: File
): Promise<ExtractedCustomerFields | null> {
  if (isImageDocFile(file)) return null

  let sheets: UniversalTableSheet[] = []
  let extraLines: string[] = []

  if (isPdfDocFile(file)) {
    const pdfInfo = await extractPdfTextAndCheckScanned(file)
    if (pdfInfo.isScannedPdf) return null
    const rows = (pdfInfo.linesByPage[0] || []).map(l => l.split('|').map(c => c.trim()))
    sheets = [{ name: 'PDF', rows }]
    extraLines = pdfInfo.linesByPage[0] || []
  } else if (isWordDocFile(file)) {
    const w = await readUniversalWordDocument(file)
    sheets = w.tables
    extraLines = w.paragraphs
  } else {
    // Giữ nguyên dòng trống để chỉ số dòng (r < 13 / r > 12) khớp 100% với mẫu ĐXMH ở trang Khách hàng
    sheets = await readUniversalSpreadsheetSheets(file, { keepEmptyRows: true })
  }

  // Ưu tiên sheet PO hoặc ĐƠN HÀNG trước
  const orderedSheets = [...sheets].sort((a, b) => {
    const rank = (name: string) => {
      const u = name.toUpperCase().trim()
      if (u === 'PO') return 0
      if (u.includes('ĐƠN HÀNG') || u.includes('DON HANG') || u.includes('DXMH')) return 1
      return 2
    }
    return rank(a.name) - rank(b.name)
  })

  for (const sh of orderedSheets) {
    const rawData = sh.rows
    if (rawData.length < 2) continue
    const record: Record<string, string> = {}

    for (let r = 0; r < Math.min(rawData.length, 60); r++) {
      const row = rawData[r]
      if (!row || !row.length) continue

      const label1 = String(row[0] || row[1] || '').trim()
      let val1 = row[2] !== undefined ? String(row[2]).trim() : ''
      if (row[0] && row[1] && row[0] !== label1) val1 = String(row[1]).trim()
      if (!val1 && row[1] && row[0] === label1) val1 = String(row[1]).trim()

      // Trường hợp nhãn và giá trị gộp chung 1 ô dạng "Company: ABC"
      const splitInline = (txt: string) => {
        const idx = txt.indexOf(':')
        return idx !== -1 ? txt.slice(idx + 1).trim() : ''
      }

      if (/company/i.test(label1)) record.CUS_COMPANY = val1 || splitInline(label1) || record.CUS_COMPANY || ''
      if (/address/i.test(label1)) record.CUS_ADDRESS = val1 || splitInline(label1) || record.CUS_ADDRESS || ''
      if (/\btel\b/i.test(label1)) record.CUS_TEL = val1 || splitInline(label1) || record.CUS_TEL || ''
      if (/\bfax\b/i.test(label1)) record.CUS_FAX = val1 || splitInline(label1) || record.CUS_FAX || ''
      if (/contact/i.test(label1)) record.CUS_CONTACT = val1 || splitInline(label1) || record.CUS_CONTACT || ''
      if (/email/i.test(label1)) {
        const em = val1 || splitInline(label1)
        if (r < 13) record.CUS_EMAIL = em || record.CUS_EMAIL || ''
        else record.INV_EMAIL = em || record.INV_EMAIL || ''
      }
      if (/mobile/i.test(label1)) record.CUS_MOBILE = val1 || splitInline(label1) || record.CUS_MOBILE || ''
      if (/website/i.test(label1)) record.CUS_WEBSITE = val1 || splitInline(label1) || record.CUS_WEBSITE || ''
      if (/công\s*ty/i.test(label1)) record.INV_CONG_TY = val1 || splitInline(label1) || record.INV_CONG_TY || ''
      if (/^địa\s*chỉ/i.test(label1)) {
        const addr = val1 || splitInline(label1)
        if (r > 12 || !record.INV_DIA_CHI) record.INV_DIA_CHI = addr || record.INV_DIA_CHI || ''
      }
      if (/\bmst\b|mã\s*số\s*thuế/i.test(label1)) record.INV_MST = val1 || splitInline(label1) || record.INV_MST || ''

      const label2 = String(row[3] || row[4] || '').trim()
      let val2 = row[5] !== undefined ? String(row[5]).trim() : ''
      if (row[3] && row[4] && row[3] !== label2) val2 = String(row[4]).trim()
      if (!val2 && row[4] && row[3] === label2) val2 = String(row[4]).trim()

      if (/người\s*nhận\s*hàng/i.test(label2)) record.DEL_NGUOI_NHAN = val2 || splitInline(label2) || record.DEL_NGUOI_NHAN || ''
      if (/số\s*điện\s*thoại/i.test(label2)) record.DEL_SDT = val2 || splitInline(label2) || record.DEL_SDT || ''
    }

    const contactRaw = String(record.CUS_CONTACT || '').trim()
    const nguoiNhan = String(record.DEL_NGUOI_NHAN || '').trim()
    const tenKH = (contactRaw || nguoiNhan).trim()
    const tenCT = String(record.INV_CONG_TY || record.CUS_COMPANY || '').trim()

    if (tenKH || tenCT) {
      const hasSecondary = Boolean(contactRaw && nguoiNhan && contactRaw !== nguoiNhan)
      return {
        Ten_khach_hang: tenKH,
        Ten_cong_ty: tenCT,
        Email_ca_nhan: contactRaw ? String(record.CUS_EMAIL || '').trim() : '',
        So_dien_thoai_ca_nhan: contactRaw
          ? String(record.CUS_MOBILE || record.DEL_SDT || '').trim()
          : String(record.DEL_SDT || '').trim(),
        So_dien_thoai_cong_ty: String(record.CUS_TEL || '').trim(),
        So_fax_cong_ty: String(record.CUS_FAX || '').trim(),
        Dia_chi_cong_ty: String(record.INV_DIA_CHI || record.CUS_ADDRESS || '').trim(),
        Email_cong_ty: String(record.INV_EMAIL || record.CUS_EMAIL || '').trim(),
        Website_cong_ty: String(record.CUS_WEBSITE || '').trim(),
        MST: String(record.INV_MST || '').trim(),
        Ten_khach_hang_phu: hasSecondary ? nguoiNhan : '',
        So_dien_thoai_ca_nhan_phu: hasSecondary ? String(record.DEL_SDT || '').trim() : '',
        COMPANY: String(record.CUS_COMPANY || '').trim(),
        ADDRESS: String(record.CUS_ADDRESS || '').trim(),
        TEL: String(record.CUS_TEL || '').trim()
      }
    }
  }

  // Fallback sang bộ quét header Kính gửi / Người nhận nếu người dùng đưa file Báo giá vào luồng ĐXMH
  const allFallbackLines = [
    ...extraLines,
    ...orderedSheets.flatMap(sh => sh.rows.slice(0, 35).map(r => r.filter(Boolean).join(' | ')))
  ]
  if (allFallbackLines.length > 0) {
    const fallbackGeneric = extractCustomerFromHeaderLinesGeneric(allFallbackLines)
    if (fallbackGeneric.Ten_cong_ty || fallbackGeneric.Ten_khach_hang) {
      return fallbackGeneric
    }
  }

  return null
}

/**
 * Quét chuẩn File Báo Giá / Hợp Đồng để lấy thông tin Khách hàng (hỗ trợ mọi đuôi Excel, PDF, Word)
 */
export async function parseCustomerQuoteStandardFromFile(
  file: File
): Promise<ExtractedCustomerFields | null> {
  if (isImageDocFile(file)) return null

  const candidateLines: string[] = []
  if (isPdfDocFile(file)) {
    const pdfInfo = await extractPdfTextAndCheckScanned(file)
    if (pdfInfo.isScannedPdf) return null
    candidateLines.push(...(pdfInfo.linesByPage[0] || []).slice(0, 45))
  } else if (isWordDocFile(file)) {
    const w = await readUniversalWordDocument(file)
    candidateLines.push(...w.paragraphs.slice(0, 45))
    for (const t of w.tables) {
      candidateLines.push(...t.rows.slice(0, 25).map(r => r.filter(Boolean).join(' | ')))
    }
  } else {
    const sheets = await readUniversalSpreadsheetSheets(file)
    for (const sh of sheets) {
      candidateLines.push(...sh.rows.slice(0, 35).map(r => r.filter(Boolean).join(' | ')))
    }
  }

  const extracted = extractCustomerFromHeaderLinesGeneric(candidateLines)
  if (extracted.Ten_cong_ty || extracted.Ten_khach_hang) {
    return extracted
  }

  // Fallback sang cấu trúc ĐXMH / PO nếu người dùng chọn nhầm file ĐXMH ở nút Import KH Báo Giá
  return await parseCustomerDxmhStandardFromFile(file)
}

/**
 * Quét chuẩn Thông tin Thuế / ĐKKD từ Ảnh (OCR) hoặc PDF / Word / Excel
 */
export async function parseTaxStandardFromFile(
  file: File,
  onProgress?: (msg: string) => void
): Promise<{ data: ExtractedTaxFields; isSuccess: boolean }> {
  let text = ''
  if (isImageDocFile(file)) {
    onProgress?.('Đang quét văn bản thông tin thuế (OCR)...')
    const ocr = await Tesseract.recognize(file, 'vie')
    text = String(ocr?.data?.text || '')
  } else if (isPdfDocFile(file)) {
    const pdfInfo = await extractPdfTextAndCheckScanned(file)
    if (pdfInfo.isScannedPdf) {
      onProgress?.('PDF dạng ảnh quét — Đang nhận diện thông tin thuế (OCR)...')
      const imgs = await renderPdfPagesToVisionDataUrls(file, 1, 2.0)
      if (imgs[0]) {
        const ocr = await Tesseract.recognize(imgs[0], 'vie')
        text = String(ocr?.data?.text || '')
      }
    } else {
      text = pdfInfo.combinedText
    }
  } else if (isWordDocFile(file)) {
    const w = await readUniversalWordDocument(file)
    text = w.rawText
  } else {
    const sheets = await readUniversalSpreadsheetSheets(file)
    text = sheets.map(s => s.rows.map(r => r.filter(Boolean).join(' | ')).join('\n')).join('\n')
  }

  const lines = text
    .split(/\r?\n/)
    .map(l => l.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const mstMatch =
    text.match(/(?:Mã\s*số\s*thu[êế]|Mã\s*số\s*doanh\s*nghiệp|\bMST\b)\s*[:\-]?\s*([\d]{10}(?:\-[\d]{3})?)/i) ||
    text.match(/(?:Mã\s*số\s*thu[êế]|\bMST\b)\s*[:\-]?\s*([\d\-]{10,15})/i)
  const mst = mstMatch ? mstMatch[1].trim() : ''

  let address = ''
  for (const line of lines) {
    if (/(?:Đ[iị]a\s*chỉ(?:\s*trụ\s*sở)?)/i.test(line) && !/Cơ\s*quan\s*thu[ếê]|Chi\s*cục\s*thu[ếê]/i.test(line)) {
      address = line.replace(/^.*?Đ[iị]a\s*chỉ(?:\s*trụ\s*sở(?:\s*chính)?)?\s*[:\-]?\s*/i, '').trim()
      if (address) break
    }
  }

  let companyName = ''
  for (const line of lines) {
    const explicitName = line.match(/(?:Tên\s*(?:công\s*ty|doanh\s*nghiệp|chính\s*thức|người\s*nộp\s*thuế)(?:\s*viết\s*bằng\s*tiếng\s*Việt)?)\s*[:\-]\s*(.+)/i)
    if (explicitName && explicitName[1]) {
      companyName = explicitName[1].trim()
      break
    }
  }
  if (!companyName) {
    for (const line of lines) {
      if (
        line.toUpperCase() === line &&
        line.length > 10 &&
        /CÔNG\s+TY|DOANH\s+NGHIỆP|TẬP\s+ĐOÀN|CHI\s+NHÁNH|HỢP\s+TÁC\s+XÃ/i.test(line) &&
        !/MÃ\s+SỐ|CỘNG\s+HÒA|ĐỘC\s+LẬP|SỞ\s+KẾ\s+HOẠCH|PHÒNG\s+ĐĂNG\s+KÝ|GIẤY\s+CHỨNG\s+NHẬN/i.test(line)
      ) {
        companyName = line.replace(/^['"\-*\s]+/, '').trim()
        break
      }
    }
  }

  let companyNameEn = ''
  for (const line of lines) {
    const enMatch = line.match(/(?:Tên\s*(?:quốc\s*tế|tiếng\s*nước\s*ngoài|tiếng\s*Anh))\s*[:\-]?\s*(.+)/i)
    if (enMatch && enMatch[1] && !/^(?:không|chưa\s*có|none|-)$/i.test(enMatch[1].trim())) {
      companyNameEn = enMatch[1].trim()
      break
    }
  }

  if (!companyNameEn && companyName) {
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=en&dt=t&q=${encodeURIComponent(companyName)}`
      )
      const json = await res.json()
      if (json?.[0]?.[0]?.[0]) {
        companyNameEn = String(json[0][0][0]).trim()
      }
    } catch {
      // Bỏ qua nếu dịch tự động lỗi mạng
    }
  }

  let nganhNgheChinh = ''
  const nganhIdx = lines.findIndex(l => /Ng[àaáảãạăắằẳẵặâấầẩẫậ]nh\s+ngh[ềeếểễệ]/i.test(l))
  if (nganhIdx !== -1) {
    const firstPart = lines[nganhIdx]
      .replace(/^.*?Ng[àaáảãạăắằẳẵặâấầẩẫậ]nh\s+ngh[ềeếểễệ](?:\s+ch[íiìỉĩị]nh)?\s*[:\-]?\s*/i, '')
      .trim()
    const collected: string[] = []
    if (firstPart) collected.push(firstPart)
    for (let i = nganhIdx + 1; i < lines.length; i++) {
      const nextLine = lines[i].replace(/^ch[íiìỉĩị]nh\s*[:\-]?\s*/i, '').trim()
      if (!nextLine) continue
      if (
        /^(Mã\s*số|Đ[iị]a\s*chỉ|Tình\s*trạng|Tên\s*quốc\s*tế|Tên\s*viết\s*tắt|Người\s*đại\s*diện|Điện\s*thoại|Ngày\s*hoạt\s*động|Quản\s*lý\s*bởi|Loại\s*hình)/i.test(
          nextLine
        )
      ) {
        break
      }
      collected.push(nextLine)
      if (collected.length >= 5) break
    }
    nganhNgheChinh = collected.join('\n').trim()
  }

  const isSuccess = Boolean(mst || companyName)
  return {
    data: {
      mst,
      tenCongTy: companyName,
      tenCongTyEn: companyNameEn,
      diaChi: address,
      nganhNgheChinh
    },
    isSuccess
  }
}

/* ============================================================================
   BỘ PHÂN TÍCH AI CHUYÊN BIỆT CHO BÁO GIÁ & KHÁCH HÀNG / THUẾ
   ============================================================================ */

/**
 * Dùng AI phân tích File Báo Giá (Excel mọi đuôi / PDF / Word / Ảnh) -> Khách hàng + Hàng hóa + Điều khoản
 */
export async function analyzeSalesQuoteFileWithAI(
  file: File,
  defaultCurrency = 'VND',
  onProgress?: (msg: string) => void
): Promise<{
  items: any[]
  extractedCustomer: ExtractedCustomerFields
  termsHtml: string
  currency: string
}> {
  const systemPrompt = `Bạn là chuyên gia phân tích chứng từ Báo giá thiết bị & phần mềm CNTT.
Nhiệm vụ: Đọc toàn bộ tài liệu / hình ảnh Báo giá và trích xuất chính xác 3 nhóm thông tin:
1. Thông tin KHÁCH HÀNG nhận báo giá (Bên mua / Kính gửi / Customer / Bill To). LƯU Ý: KHÔNG lấy thông tin của đơn vị phát hành báo giá (như Công ty Nam Trường Sơn / NTSSI / địa chỉ Tăng Bạt Hổ).
2. Danh sách MẶT HÀNG / DỊCH VỤ trong bảng báo giá.
   - Giữ đầy đủ các dòng mô tả cấu hình, thông số kỹ thuật (bullet points) trong trường "dien_giai" (ngăn cách mỗi dòng bằng \\n).
   - "don_gia" là đơn giá bán trước thuế của 1 đơn vị. Nếu chỉ có thành tiền trước thuế và số lượng thì don_gia = thanh_tien / so_luong.
   - "thue_vat" là phần trăm thuế VAT của dòng hàng (VD: 0, 8, 10). Kiểm tra cả dòng tổng kết VAT cuối bảng (VD: "VAT 8% (2) và KCT (1)" nghĩa là dòng 1 VAT 0%, dòng 2 VAT 8%; "Phần mềm không chịu thuế" nghĩa là VAT 0%).
   - Nếu trong mô tả có Part Number / SKU / P/N / Mã hàng thì đưa vào "ma_hang".
3. Các dòng ĐIỀU KHOẢN THƯƠNG MẠI (nếu có ở cuối báo giá).

Chỉ trả về đúng 1 JSON object hợp lệ (KHÔNG bọc markdown code block, KHÔNG giải thích thêm) theo cấu trúc:
{
  "don_vi_tien_te": "VND hoặc USD",
  "khach_hang": {
    "ten_cong_ty": "",
    "ten_khach_hang": "",
    "mst": "",
    "so_dien_thoai": "",
    "email": "",
    "dia_chi": "",
    "so_fax": ""
  },
  "dieu_khoan": [
    "1. Hiệu lực báo giá: ...",
    "2. Điều khoản thanh toán: ..."
  ],
  "items": [
    {
      "stt": 1,
      "ma_hang": "",
      "ten_hang": "",
      "dien_giai": "",
      "danh_muc": "",
      "hang_sx": "",
      "dvt": "Bản quyền",
      "thoi_han": "1 Năm",
      "bao_hanh": "",
      "so_luong": 1,
      "don_gia": 0,
      "thue_vat": 0
    }
  ]
}`

  const { parsed } = await callSmartDocumentAI(
    file,
    systemPrompt,
    'Hãy trích xuất thông tin báo giá từ tài liệu sau',
    onProgress,
    4
  )

  const rawList: any[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.items)
    ? parsed.items
    : []

  const currency =
    String(parsed?.don_vi_tien_te || defaultCurrency || 'VND').trim().toUpperCase() === 'USD'
      ? 'USD'
      : 'VND'

  const khRaw = parsed?.khach_hang || {}
  const extractedCustomer: ExtractedCustomerFields = {
    Ten_cong_ty: cleanCustomerCompanyText(khRaw.ten_cong_ty || ''),
    Ten_khach_hang: cleanCustomerRecipientText(khRaw.ten_khach_hang || ''),
    MST: String(khRaw.mst || '').trim(),
    So_dien_thoai_ca_nhan: String(khRaw.so_dien_thoai || '').trim(),
    Email_ca_nhan: String(khRaw.email || '').trim(),
    Dia_chi_cong_ty: cleanCustomerAddressText(khRaw.dia_chi || ''),
    So_fax_cong_ty: String(khRaw.so_fax || '').trim()
  }

  let termsHtml = ''
  if (Array.isArray(parsed?.dieu_khoan) && parsed.dieu_khoan.length > 0) {
    termsHtml = parsed.dieu_khoan
      .map((line: any) => String(line || '').trim())
      .filter(Boolean)
      .map((line: string) => `<p style="margin: 0; padding-bottom: 4px;">${escapePlainToSimpleHtml(line)}</p>`)
      .join('')
  } else if (typeof parsed?.dieu_khoan === 'string' && parsed.dieu_khoan.trim()) {
    termsHtml = parsed.dieu_khoan
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter(Boolean)
      .map((l: string) => `<p style="margin: 0; padding-bottom: 4px;">${escapePlainToSimpleHtml(l)}</p>`)
      .join('')
  }

  const items = rawList
    .map((p: any, idx: number) => {
      const tenHang = String(p.ten_hang || p.Ten_hang || '').trim()
      if (!tenHang) return null
      const dienGiaiRaw = String(p.dien_giai || p.Features || p.mo_ta || '').trim()
      const meta = extractMetadataFromBulletLines(dienGiaiRaw)
      const explicitMa = String(p.ma_hang || p.Ma_hang || meta.partNumber || '').trim()
      const generatedMa =
        explicitMa ||
        removeDiacriticsSimple(tenHang)
          .toUpperCase()
          .replace(/\s+/g, '')
          .replace(/[^A-Z0-9]/g, '')

      const sl = Math.max(1, parseCleanNumber(p.so_luong ?? p.So_luong ?? 1))
      const donGia = parseCleanNumber(p.don_gia ?? p.Don_gia ?? 0)
      const vatPct = parseCleanNumber(p.thue_vat ?? p.Thue_VAT ?? 0)
      const hangSx = String(p.hang_sx || p.nha_cung_cap || '').trim()

      return {
        uid: Math.random().toString(36).slice(2, 11),
        Ten_hang: tenHang,
        Features: escapePlainToSimpleHtml(dienGiaiRaw || tenHang),
        DVT: String(p.dvt || 'Bản quyền').trim(),
        License_duration: String(p.thoi_han || meta.duration || '1 Năm').trim(),
        So_luong: sl,
        Don_gia: donGia,
        Gia_tieu_chuan: donGia,
        Thue_VAT: vatPct,
        Ma_hang: generatedMa,
        sku_code: explicitMa || '',
        _hasExplicitMaHang: Boolean(explicitMa),
        _rawPs: explicitMa || tenHang,
        _rawMota: dienGiaiRaw,
        _sttIndex: Number(p.stt) || idx + 1,
        Main_img: '',
        Ma_nha_cung_cap: hangSx ? removeDiacriticsSimple(hangSx).toUpperCase().replace(/[^A-Z0-9]/g, '') : '',
        Ten_nha_cung_cap: hangSx,
        Mo_ta_chung: '',
        Mo_ta_chi_tiet: '',
        Danh_muc: String(p.danh_muc || hangSx || '').trim().toUpperCase(),
        thoi_han_bao_hanh: String(p.bao_hanh || meta.warranty || '').trim(),
        Type: meta.itemType || '',
        Trang_thai: '',
        Don_vi_tien_te: currency,
        Ti_gia: 1,
        Ma_hang_lien_ket: '',
        Ten_hang_lien_ket: '',
        Ghi_chu: '',
        gia_hardware: 0,
        gia_nhap: 0,
        muc_phan_tram_off: 0,
        volume: '',
        Description: ''
      }
    })
    .filter(Boolean)

  return {
    items,
    extractedCustomer,
    termsHtml,
    currency
  }
}

/**
 * Dùng AI phân tích File Khách Hàng (ĐXMH / PO / Báo Giá / Hợp đồng) hoặc Ảnh Thuế / Giấy ĐKKD
 */
export async function analyzeCustomerOrTaxFileWithAI(
  file: File,
  contextMode: 'dxmh' | 'bao_gia' | 'thue',
  onProgress?: (msg: string) => void
): Promise<{
  customer: ExtractedCustomerFields
  tax: ExtractedTaxFields
}> {
  const modeHint =
    contextMode === 'thue'
      ? 'Tài liệu thông tin Mã số thuế / Giấy chứng nhận Đăng ký doanh nghiệp.'
      : contextMode === 'dxmh'
      ? 'Tài liệu Đề xuất mua hàng (ĐXMH) / Đơn đặt hàng (PO) / Thông tin xuất hóa đơn & giao hàng của Khách hàng.'
      : 'Tài liệu Báo giá / Hợp đồng gửi cho Khách hàng (lấy thông tin bên Nhận báo giá / Bên mua, TUYỆT ĐỐI KHÔNG lấy thông tin Công ty Nam Trường Sơn / NTSSI).'

  const systemPrompt = `Bạn là chuyên gia xử lý hồ sơ doanh nghiệp & chứng từ thương mại Việt Nam.
Ngữ cảnh tài liệu: ${modeHint}
Nhiệm vụ: Trích xuất chính xác thông tin doanh nghiệp và người liên hệ của KHÁCH HÀNG từ tài liệu / hình ảnh.
- Nếu chứng từ chưa ghi tên tiếng Anh của công ty ("ten_cong_ty_en"), hãy dịch chuẩn tên công ty tiếng Việt sang tiếng Anh thương mại (VD: "... COMPANY LIMITED" hoặc "... JOINT STOCK COMPANY").
- Nếu là báo giá/hợp đồng có 2 bên Bán và Mua: chỉ trích xuất thông tin BÊN MUA / KHÁCH HÀNG (Kính gửi / Customer / Bill To), bỏ qua Công ty Nam Trường Sơn (NTSSI, MST 0309..., Tăng Bạt Hổ).
- Nếu có thông tin Người nhận hàng riêng biệt với Người liên hệ chính thì điền vào "ten_nguoi_nhan_phu" và "sdt_nguoi_nhan_phu".

Chỉ trả về đúng 1 JSON object hợp lệ (KHÔNG bọc markdown, KHÔNG giải thích thêm):
{
  "mst": "",
  "ten_cong_ty": "",
  "ten_cong_ty_en": "",
  "ten_khach_hang": "",
  "so_dien_thoai_ca_nhan": "",
  "so_dien_thoai_cong_ty": "",
  "so_fax_cong_ty": "",
  "email_ca_nhan": "",
  "email_cong_ty": "",
  "website_cong_ty": "",
  "dia_chi_cong_ty": "",
  "dia_chi_giao_hang": "",
  "ten_nguoi_nhan_phu": "",
  "sdt_nguoi_nhan_phu": "",
  "nganh_nghe_chinh": ""
}`

  const { parsed } = await callSmartDocumentAI(
    file,
    systemPrompt,
    'Hãy trích xuất thông tin khách hàng / thông tin thuế từ tài liệu sau',
    onProgress,
    2
  )

  const tenCongTy = cleanCustomerCompanyText(parsed?.ten_cong_ty || '')
  const tenCongTyEn = String(parsed?.ten_cong_ty_en || '').trim()
  const tenKhachHang = cleanCustomerRecipientText(parsed?.ten_khach_hang || '')
  const mst = String(parsed?.mst || '').trim()
  const diaChi = cleanCustomerAddressText(parsed?.dia_chi_cong_ty || parsed?.dia_chi_giao_hang || '')
  const nganhNghe = String(parsed?.nganh_nghe_chinh || '').trim()
  const sdtCaNhan = String(parsed?.so_dien_thoai_ca_nhan || '').trim()
  const sdtCongTy = String(parsed?.so_dien_thoai_cong_ty || '').trim()
  const emailCaNhan = String(parsed?.email_ca_nhan || parsed?.email_cong_ty || '').trim()
  const emailCongTy = String(parsed?.email_cong_ty || parsed?.email_ca_nhan || '').trim()

  const customer: ExtractedCustomerFields = {
    MST: mst,
    Ten_cong_ty: tenCongTy,
    COMPANY: tenCongTyEn || tenCongTy,
    Ten_khach_hang: tenKhachHang,
    So_dien_thoai_ca_nhan: sdtCaNhan || sdtCongTy,
    So_dien_thoai_cong_ty: sdtCongTy,
    So_fax_cong_ty: String(parsed?.so_fax_cong_ty || '').trim(),
    Email_ca_nhan: emailCaNhan,
    Email_cong_ty: emailCongTy,
    Website_cong_ty: String(parsed?.website_cong_ty || '').trim(),
    Dia_chi_cong_ty: diaChi,
    ADDRESS: String(parsed?.dia_chi_giao_hang || diaChi).trim(),
    TEL: sdtCongTy || sdtCaNhan,
    Ten_khach_hang_phu: cleanCustomerRecipientText(parsed?.ten_nguoi_nhan_phu || ''),
    So_dien_thoai_ca_nhan_phu: String(parsed?.sdt_nguoi_nhan_phu || '').trim(),
    Nganh_nghe_cong_ty: nganhNghe
  }

  const tax: ExtractedTaxFields = {
    mst,
    tenCongTy,
    tenCongTyEn,
    diaChi,
    nganhNgheChinh: nganhNghe
  }

  return { customer, tax }
}

