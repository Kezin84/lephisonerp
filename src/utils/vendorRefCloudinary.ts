import * as XLSX from 'xlsx-js-style'
import JSZip from 'jszip'
import { getSystemConfigSync } from '../services/systemConfig'
import {
  extractSophosCalcEngineMeta,
  extractVisibleSheetStyleMeta,
  hydrateSophosEngineRuntime
} from './sophosCalculatorEngine'

export const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload'
export const CLOUDINARY_RAW_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/db6fzs3rh/raw/upload'
export const CLOUDINARY_UPLOAD_PRESET = 'upload_file'

function getRuntimeCloudinaryEndpoints() {
  const st = getSystemConfigSync().storage
  const cloud = (st.cloudinaryCloudName || 'db6fzs3rh').trim()
  const preset = (st.cloudinaryUploadPreset || CLOUDINARY_UPLOAD_PRESET).trim()
  return {
    autoUrl: `https://api.cloudinary.com/v1_1/${cloud}/auto/upload`,
    rawUrl: `https://api.cloudinary.com/v1_1/${cloud}/raw/upload`,
    preset
  }
}

export interface VendorRefFileMeta {
  index_url?: string
  goc_file_url?: string
  goc_file_name?: string
  goc_updated_at?: number
  mau_file_url?: string
  mau_file_name?: string
  mau_updated_at?: number
  tg_file_url?: string
  tg_file_name?: string
  tg_updated_at?: number
  skulist_file_url?: string
  skulist_file_name?: string
  skulist_updated_at?: number
  calc_index_url?: string
  calc_index_chunk_urls?: string[]
  calc_file_url?: string
  calc_file_chunk_urls?: string[]
  calc_file_name?: string
  calc_version?: string
  calc_effective_from?: string
  calc_sku_count?: number
  calc_updated_at?: number
  import_file_url?: string
  import_file_name?: string
  import_updated_at?: number
  updated_at?: number
}

const MAX_CLOUDINARY_RAW_BYTES = 9.5 * 1024 * 1024
const CHUNK_UPLOAD_BYTES = 8 * 1024 * 1024

export async function uploadRawBlobToCloudinary(
  blobOrFile: Blob | File,
  fileName: string
): Promise<string> {
  const { autoUrl, rawUrl, preset } = getRuntimeCloudinaryEndpoints()
  const tryUpload = async (endpointUrl: string) => {
    const fd = new FormData()
    fd.append('upload_preset', preset)
    fd.append('file', blobOrFile, fileName)
    const res = await fetch(endpointUrl, {
      method: 'POST',
      body: fd
    })
    const data = await res.json().catch(() => ({}))
    return { res, data }
  }

  const rawAttempt = await tryUpload(rawUrl)
  if (rawAttempt.res.ok && rawAttempt.data?.secure_url) {
    return String(rawAttempt.data.secure_url)
  }
  const autoAttempt = await tryUpload(autoUrl)
  if (autoAttempt.res.ok && autoAttempt.data?.secure_url) {
    return String(autoAttempt.data.secure_url)
  }
  throw new Error(
    rawAttempt.data?.error?.message ||
    autoAttempt.data?.error?.message ||
    `Không thể upload raw ${fileName} lên Cloudinary`
  )
}

export async function uploadLargeFileChunkedToCloudinary(
  fileOrBlob: Blob | File,
  fileName: string
): Promise<string[]> {
  const totalBytes = fileOrBlob.size
  const safeBase = String(fileName || 'vendor_file')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 48)
  const ts = Date.now()

  if (totalBytes <= MAX_CLOUDINARY_RAW_BYTES) {
    const singleUrl = await uploadRawBlobToCloudinary(fileOrBlob, fileName || `${safeBase}_${ts}.zip`)
    return [singleUrl]
  }

  const totalChunks = Math.ceil(totalBytes / CHUNK_UPLOAD_BYTES)
  const uploadPromises: Promise<string>[] = []
  for (let idx = 0; idx < totalChunks; idx++) {
    const start = idx * CHUNK_UPLOAD_BYTES
    const end = Math.min(totalBytes, start + CHUNK_UPLOAD_BYTES)
    const chunkBlob = fileOrBlob.slice(start, end, 'application/octet-stream')
    // Dùng đuôi .zip trên endpoint raw/upload để tương thích whitelist preset upload_file của Cloudinary (lưu nguyên vẹn từng byte)
    const chunkName = `${safeBase}_part${idx + 1}of${totalChunks}_${ts}.zip`
    uploadPromises.push(uploadRawBlobToCloudinary(chunkBlob, chunkName))
  }
  return Promise.all(uploadPromises)
}

export async function downloadChunkedFileFromCloudinary(
  chunkUrls: string[],
  mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
): Promise<Blob> {
  if (!Array.isArray(chunkUrls) || !chunkUrls.length) {
    throw new Error('Không có danh sách chunk URL để tải file')
  }
  const buffers = await Promise.all(
    chunkUrls.map(async (u, idx) => {
      const res = await fetch(u)
      if (!res.ok) {
        throw new Error(`Không tải được phần ${idx + 1}/${chunkUrls.length} từ Cloudinary (HTTP ${res.status})`)
      }
      return res.arrayBuffer()
    })
  )
  return new Blob(buffers, { type: mimeType })
}

export async function uploadCompressedJsonZipToCloudinary(
  jsonObj: any,
  prefixName: string
): Promise<{ url: string; chunkUrls?: string[] }> {
  const jsonStr = JSON.stringify(jsonObj)
  const zip = new JSZip()
  zip.file('data.json', jsonStr, {
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  })
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  })
  const safePrefix = String(prefixName || 'calc_ref_index').replace(/[^a-zA-Z0-9_-]/g, '_')
  const fileName = `${safePrefix}_${Date.now()}.zip`
  if (zipBlob.size <= MAX_CLOUDINARY_RAW_BYTES) {
    const url = await uploadRawBlobToCloudinary(zipBlob, fileName)
    return { url }
  }
  const chunkUrls = await uploadLargeFileChunkedToCloudinary(zipBlob, fileName)
  return { url: chunkUrls[0] || '', chunkUrls }
}

export async function fetchCompressedJsonZipFromCloudinary(
  urlOrChunks: string | string[]
): Promise<any> {
  let buf: ArrayBuffer
  if (Array.isArray(urlOrChunks) && urlOrChunks.length > 1) {
    const combinedBlob = await downloadChunkedFileFromCloudinary(urlOrChunks, 'application/zip')
    buf = await combinedBlob.arrayBuffer()
  } else {
    const singleUrl = Array.isArray(urlOrChunks) ? urlOrChunks[0] : urlOrChunks
    if (!singleUrl) throw new Error('Thiếu URL index trên Cloudinary')
    const res = await fetch(singleUrl)
    if (!res.ok) {
      throw new Error(`Không tải được dữ liệu Calculator từ Cloudinary (HTTP ${res.status})`)
    }
    buf = await res.arrayBuffer()
  }
  const u8 = new Uint8Array(buf)
  if (u8.length >= 4 && u8[0] === 0x50 && u8[1] === 0x4b) {
    const zip = await JSZip.loadAsync(buf)
    const dataFile = zip.file('data.json') || Object.values(zip.files).find(f => !f.dir)
    if (!dataFile) throw new Error('File nén index trên Cloudinary không chứa data.json')
    const text = await dataFile.async('string')
    return JSON.parse(text)
  }
  const text = new TextDecoder('utf-8').decode(u8)
  return JSON.parse(text)
}

export async function uploadBlobToCloudinary(
  blobOrFile: Blob | File,
  fileName: string
): Promise<string> {
  const { autoUrl, rawUrl, preset } = getRuntimeCloudinaryEndpoints()
  const tryUpload = async (endpointUrl: string) => {
    const fd = new FormData()
    fd.append('upload_preset', preset)
    fd.append('file', blobOrFile, fileName)
    const res = await fetch(endpointUrl, {
      method: 'POST',
      body: fd
    })
    const data = await res.json().catch(() => ({}))
    return { res, data }
  }

  let { res, data } = await tryUpload(autoUrl)
  if (!res.ok || !data?.secure_url) {
    // Fallback sang raw/upload cho mọi định dạng file đặc biệt (.xlsb, .msg, .rar, .zip, .docx, file không rõ đuôi...)
    const rawAttempt = await tryUpload(rawUrl)
    if (rawAttempt.res.ok && rawAttempt.data?.secure_url) {
      return String(rawAttempt.data.secure_url)
    }
    throw new Error(
      rawAttempt.data?.error?.message ||
      data?.error?.message ||
      `Không thể upload ${fileName} lên Cloudinary`
    )
  }
  return String(data.secure_url)
}

export async function uploadJsonToCloudinary(
  jsonObj: any,
  prefixName: string
): Promise<string> {
  const jsonStr = JSON.stringify(jsonObj)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const safePrefix = String(prefixName || 'ref_index').replace(/[^a-zA-Z0-9_-]/g, '_')
  const fileName = `${safePrefix}_${Date.now()}.json`
  return uploadBlobToCloudinary(blob, fileName)
}

export async function uploadExcelFileToCloudinarySafe(
  file: File,
  workbook?: XLSX.WorkBook
): Promise<string> {
  if (!file) return ''

  // 1. Nếu file <= 9.5MB -> đẩy nguyên bản trực tiếp (.xlsb / .xlsx / .xls) lên Cloudinary
  if (file.size <= MAX_CLOUDINARY_RAW_BYTES) {
    try {
      return await uploadBlobToCloudinary(file, file.name)
    } catch (_) {
      // Fallback sang bước nén ZIP level 9 bên dưới
    }
  }

  // 2. Nếu file > 9.5MB (VD: sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0.xlsb ~ 12.27MB hoặc .xlsx/.docx/.pptx/.zip):
  // Nén lại các entry trong container ZIP bằng DEFLATE level 9 (giữ nguyên 100% dữ liệu, sheet, định dạng & số thứ tự dòng gốc)
  if (/\.(xlsb|xlsx|xlsm|docx|pptx|zip)$/i.test(file.name)) {
    try {
      const arrayBuf = await file.arrayBuffer()
      const inZip = await JSZip.loadAsync(arrayBuf)
      const outZip = new JSZip()
      for (const [relPath, entry] of Object.entries(inZip.files)) {
        if (entry.dir) continue
        const rawEntryBytes = await entry.async('uint8array')
        outZip.file(relPath, rawEntryBytes, {
          compression: 'DEFLATE',
          compressionOptions: { level: 9 }
        })
      }
      const recompressedBlob = await outZip.generateAsync({
        type: 'blob',
        mimeType: file.type || 'application/octet-stream',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      })
      return await uploadBlobToCloudinary(recompressedBlob, file.name)
    } catch (zipErr) {
      console.warn(`Không thể nén ZIP level-9 cho ${file.name}, chuyển sang bước fallback...`, zipErr)
    }
  }

  // 3. Thử upload trực tiếp hoặc fallback sang .xlsx rút gọn
  try {
    return await uploadBlobToCloudinary(file, file.name)
  } catch (err) {
    console.warn(`File ${file.name} vượt giới hạn raw upload trực tiếp, đang nén sang .xlsx chuẩn cho Office Viewer...`, err)
  }

  if (workbook && workbook.SheetNames?.length) {
    try {
      const slimWb = XLSX.utils.book_new()
      for (const sName of workbook.SheetNames) {
        if (sName === 'Master (HIDDEN)') continue
        const ws = workbook.Sheets[sName]
        if (!ws) continue
        const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as any[][]
        XLSX.utils.book_append_sheet(slimWb, XLSX.utils.aoa_to_sheet(aoa), sName.slice(0, 31))
      }
      const xlsxBuf = XLSX.write(slimWb, { bookType: 'xlsx', type: 'array', compression: true })
      const xlsxBlob = new Blob([xlsxBuf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const cleanName = file.name.replace(/\.(xlsb|xls)$/i, '.xlsx')
      return await uploadBlobToCloudinary(xlsxBlob, cleanName)
    } catch (compressErr) {
      console.warn('Không thể nén workbook sang .xlsx:', compressErr)
    }
  }
  return ''
}

export function formatRefTimestamp(ts?: number | string): string {
  if (!ts) return 'Chưa rõ thời gian'
  const d = new Date(Number(ts) || ts)
  if (isNaN(d.getTime())) return String(ts)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`
}

function colIndexToLetter(colIdx0: number): string {
  let temp = 0
  let letter = ''
  let col = colIdx0 + 1
  while (col > 0) {
    temp = (col - 1) % 26
    letter = String.fromCharCode(temp + 65) + letter
    col = (col - temp - 1) / 26
  }
  return letter
}

/**
 * Tái tạo các bảng tra cứu (lookup maps) trên RAM cho Acronis sau khi tải từ Cloudinary
 */
export function hydrateAcronisRefData(raw: any): any {
  if (!raw || typeof raw !== 'object') return null
  const gocItems = Array.isArray(raw.gocItems) ? raw.gocItems : []
  const mauItems = Array.isArray(raw.mauItems) ? raw.mauItems : []

  const gocBySku: Record<string, any> = { ...(raw.gocBySku || {}) }
  const gocBySkuFor: Record<string, any> = { ...(raw.gocBySkuFor || {}) }
  const gocByMaHang: Record<string, any> = { ...(raw.gocByMaHang || {}) }

  for (const item of gocItems) {
    if (!item) continue
    const skuKey = String(item.sku || '').trim().toUpperCase()
    const skuForKey = String(item.skuFor || '').trim().toUpperCase()
    const maKey = String(item.maHang || '').trim().toUpperCase()
    if (skuKey && !gocBySku[skuKey]) gocBySku[skuKey] = item
    if (skuForKey && !gocBySkuFor[skuForKey]) gocBySkuFor[skuForKey] = item
    if (maKey) gocByMaHang[maKey] = item
  }

  const mauBySku: Record<string, any> = { ...(raw.mauBySku || {}) }
  const mauBySkuFor: Record<string, any> = { ...(raw.mauBySkuFor || {}) }
  const mauByMaHang: Record<string, any> = { ...(raw.mauByMaHang || {}) }

  for (const item of mauItems) {
    if (!item) continue
    const skuKey = String(item.sku || '').trim().toUpperCase()
    const skuForKey = String(item.skuFor || '').trim().toUpperCase()
    const maKey = String(item.maHang || '').trim().toUpperCase()
    if (skuKey && !mauBySku[skuKey]) mauBySku[skuKey] = item
    if (skuForKey && !mauBySkuFor[skuForKey]) mauBySkuFor[skuForKey] = item
    if (maKey) mauByMaHang[maKey] = item
  }

  return {
    ...raw,
    gocItems,
    mauItems,
    gocBySku,
    gocBySkuFor,
    gocByMaHang,
    mauBySku,
    mauBySkuFor,
    mauByMaHang
  }
}

/**
 * Tái tạo các bảng tra cứu (lookup maps) trên RAM cho Kaspersky sau khi tải từ Cloudinary
 */
export function hydrateKasRefData(raw: any): any {
  if (!raw || typeof raw !== 'object') return null
  const gocSaleRows = Array.isArray(raw.gocSaleRows) ? raw.gocSaleRows : []
  const mauSaleRows = Array.isArray(raw.mauSaleRows) ? raw.mauSaleRows : []

  const gocSaleBySkuBand: Record<string, any> = { ...(raw.gocSaleBySkuBand || {}) }
  for (const r of gocSaleRows) {
    if (!r || !r.sku || !r.band) continue
    const key = `${String(r.sku).trim().toUpperCase()}||${String(r.band).trim()}`
    if (!gocSaleBySkuBand[key]) {
      gocSaleBySkuBand[key] = {
        rowNum: r.rowNum,
        posCode: r.posCode || '',
        sku: r.sku,
        product: r.product || '',
        term: r.term || '',
        type: r.type || '',
        band: r.band || '',
        price: Number(r.price) || 0
      }
    }
  }

  const mauSaleBySkuBand: Record<string, any> = { ...(raw.mauSaleBySkuBand || {}) }
  for (const r of mauSaleRows) {
    if (!r || !r.sku || !r.band) continue
    const key = `${String(r.sku).trim().toUpperCase()}||${String(r.band).trim()}`
    if (!mauSaleBySkuBand[key]) {
      mauSaleBySkuBand[key] = {
        rowNum: r.rowNum,
        posCode: r.posCode || '',
        sku: r.sku,
        product: r.product || '',
        term: r.term || '',
        type: r.type || '',
        band: r.band || '',
        price: Number(r.price) || 0
      }
    }
  }

  return {
    ...raw,
    gocSaleRows,
    mauSaleRows,
    gocSaleBySkuBand,
    mauSaleBySkuBand
  }
}

/**
 * Bóc tách dữ liệu tham chiếu + bảng lưới Excel từ một Workbook Acronis
 */
export function parseAcronisWorkbookToRefPart(wb: XLSX.WorkBook) {
  const sheetNames = [...wb.SheetNames]
  const items: any[] = []
  const sheetsRaw: Record<string, any[][]> = {}
  const sheetsStyled: Record<string, any> = {}

  for (const sheetName of sheetNames) {
    const ws = wb.Sheets[sheetName]
    if (!ws) continue
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as any[][]
    sheetsRaw[sheetName] = rows

    const merges = (ws['!merges'] || []).map((m: any) => ({
      s: { r: m.s.r, c: m.s.c },
      e: { r: m.e.r, c: m.e.c }
    }))
    const cols = (ws['!cols'] || []).map((c: any) => ({
      wpx: c?.wpx || (c?.wch ? Math.round(c.wch * 7.5) : 110)
    }))
    sheetsStyled[sheetName] = { merges, cols, styles: {} }

    let headerRowIdx = -1
    let skuForIdx = 0
    let skuIdx = 1
    let moTaIdx = 2
    let priceIdx = 3

    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const r = rows[i] || []
      const rowStr = r.map(c => String(c || '').trim().toUpperCase())
      if (rowStr.includes('SKU') && (rowStr.some(s => s.includes('UNIT PRICE')) || rowStr.some(s => s.includes('MÔ TẢ')))) {
        headerRowIdx = i
        skuForIdx = rowStr.findIndex(s => s === 'SKU FOR')
        skuIdx = rowStr.findIndex(s => s === 'SKU')
        moTaIdx = rowStr.findIndex(s => s.includes('MÔ TẢ'))
        priceIdx = rowStr.findIndex(s => s.includes('UNIT PRICE'))
        if (skuForIdx === -1) skuForIdx = 0
        if (skuIdx === -1) skuIdx = 1
        if (moTaIdx === -1) moTaIdx = 2
        if (priceIdx === -1) priceIdx = 3
        break
      }
    }
    if (headerRowIdx === -1) continue

    let currentCategory = sheetName
    let currentFeatures = ''
    let currentSubType = ''

    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const r = rows[i]
      if (!r || !r.length) continue
      const skuFor = String(r[skuForIdx] || '').trim()
      const sku = String(r[skuIdx] || '').trim()
      const moTa = String(r[moTaIdx] || '').trim()
      const rawPrice = r[priceIdx]
      const priceNum = Number(String(rawPrice ?? '').replace(/,/g, '').trim())
      const hasPrice = rawPrice !== '' && rawPrice !== null && rawPrice !== undefined && !isNaN(priceNum) && priceNum > 0

      if ((sku || skuFor) && moTa && hasPrice) {
        const maHang = (skuFor && sku && skuFor !== sku) ? `${skuFor} - ${sku}` : (sku || skuFor)
        let duration = ''
        const yearMatch = moTa.match(/\b(\d+)\s*Year/i)
        const monthMatch = moTa.match(/\b(\d+)\s*Month/i)
        if (yearMatch) duration = `${parseInt(yearMatch[1], 10) * 12} months`
        else if (monthMatch) duration = `${parseInt(monthMatch[1], 10)} months`
        else if (/perpetual|perpeptual/i.test(moTa) || /perpetual|perpeptual/i.test(currentSubType)) duration = 'Perpetual'

        let typeVal = ''
        if (/renewal|\bren\b/i.test(moTa)) typeVal = 'Renewal'
        else if (/perpetual|perpeptual/i.test(moTa) || /perpetual|perpeptual/i.test(currentSubType)) typeVal = 'Perpetual'
        else if (/subscription/i.test(moTa)) typeVal = 'Subscription'

        items.push({
          sheet: sheetName,
          rowNum: i + 1,
          category: currentCategory || sheetName,
          subType: currentSubType,
          skuFor,
          sku,
          maHang,
          tenHang: moTa,
          moTa,
          features: currentFeatures,
          price: priceNum,
          licenseDuration: duration,
          type: typeVal,
          volume: ''
        })
      } else if (!sku && !skuFor && moTa && !hasPrice) {
        currentFeatures = moTa
      } else if (!moTa && !hasPrice && (sku || skuFor)) {
        const headerText = sku || skuFor
        const isSub = (sku && skuFor && sku === skuFor) || /perpeptual|perpetual|^\d+\.\d+\s/i.test(headerText)
        if (isSub) currentSubType = headerText
        else {
          currentCategory = headerText
          currentFeatures = ''
          currentSubType = ''
        }
      }
    }
  }

  return {
    sheetNames,
    items,
    sheetsRaw,
    sheetsStyled
  }
}

/**
 * Bóc tách dữ liệu tham chiếu + bảng lưới Excel từ một Workbook Kaspersky
 */
export function parseKasperskyWorkbookToRefPart(wb: XLSX.WorkBook) {
  const pivotSheetName = wb.SheetNames.find(n => n.trim() === 'SMB+Enterprise (License)')
  const pivotRaw: any[][] = []
  const pivotBySku: Record<string, any> = {}

  if (pivotSheetName && wb.Sheets[pivotSheetName]) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[pivotSheetName], { header: 1, defval: null }) as any[][]
    rows.forEach(r => pivotRaw.push(r))

    let bandHeaders: Record<number, string> = {}
    let headerIdx = -1
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const r = rows[i] || []
      const hasSku = r.some(c => String(c || '').trim().toUpperCase() === 'SKU')
      if (hasSku) {
        headerIdx = i
        r.forEach((cell, cIdx) => {
          const s = String(cell || '').trim()
          if (/^Band\s+/i.test(s)) {
            bandHeaders[cIdx] = s
          }
        })
        break
      }
    }

    if (headerIdx !== -1) {
      let lastProd = ''
      let lastCode = ''
      let lastPkg = 'License'
      for (let i = headerIdx + 1; i < rows.length; i++) {
        const r = rows[i] || []
        const prod = String(r[1] || '').trim()
        const code = String(r[2] || '').trim()
        const pkg = String(r[3] || '').trim()
        const type = String(r[5] || '').trim()
        const term = String(r[6] || '').trim()
        const sku = String(r[7] || '').trim().toUpperCase()
        if (prod) lastProd = prod
        if (code) lastCode = code
        if (pkg) lastPkg = pkg
        if (!sku) continue

        const prices: Record<string, number> = {}
        const bandCols: Record<string, number> = {}
        Object.entries(bandHeaders).forEach(([cIdxStr, bandName]) => {
          const cIdx = Number(cIdxStr)
          const p = Number(String(r[cIdx] ?? '').replace(/,/g, '').trim())
          if (!isNaN(p) && p > 0) {
            prices[bandName] = Math.round(p)
            bandCols[bandName] = cIdx
          }
        })

        pivotBySku[sku] = {
          rowNum: i + 1,
          product: lastProd,
          code: lastCode,
          pkg: lastPkg,
          type,
          term,
          sku,
          prices,
          bandCols
        }
      }
    }
  }

  const saleSheets = wb.SheetNames.filter(n => n.trim().startsWith('SaleList'))
  const targetSaleSheet = saleSheets.includes('SaleListSMB+Enterprise')
    ? 'SaleListSMB+Enterprise'
    : saleSheets[0]

  const saleRows: any[] = []
  if (targetSaleSheet && wb.Sheets[targetSaleSheet]) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[targetSaleSheet], { header: 1, defval: null }) as any[][]
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i]
      if (!r || !r.length) continue
      const posCode = String(r[1] || '').trim()
      const sku = String(r[2] || '').trim().toUpperCase()
      const product = String(r[3] || '').trim()
      const term = String(r[8] || '').trim()
      const pkg = String(r[10] || '').trim()
      const type = String(r[11] || '').trim()
      const band = String(r[13] || '').trim()
      const price = Math.round(Number(String(r[22] ?? '').replace(/,/g, '').trim()) || 0)
      if (!sku && !posCode) continue
      saleRows.push({
        rowNum: i + 1,
        posCode,
        sku,
        product,
        term,
        pkg,
        type,
        band,
        price
      })
    }
  }

  return {
    pivotRaw,
    pivotBySku,
    saleRows
  }
}

/**
 * Bóc tách & cập nhật dữ liệu tham chiếu Sophos từ một Workbook mới (SKU_Tab, MSRPs&BuyCost, hoặc Trung Gian BOM)
 */
export function parseSophosWorkbookToRefUpdate(
  wb: XLSX.WorkBook,
  fileName: string,
  existingRefData: any,
  preferredRole: 'goc' | 'tg' | 'skulist' | 'both' = 'both'
): { updatedRef: any; role: 'skulist' | 'goc' | 'tg'; summaryText: string } {
  const baseRef = existingRefData
    ? JSON.parse(JSON.stringify(existingRefData))
    : {
        version: fileName,
        tiGiaTrungGian: 26200,
        tiGiaLPSophos: 26600,
        trungGianItems: [],
        lpSophos: [],
        gocSkus: {},
        tgSheetsRaw: {},
        tgSkuLocations: {}
      }

  baseRef.updatedAt = Date.now()

  if (preferredRole !== 'tg' && wb.SheetNames.includes('SKU_Tab')) {
    const rowsSKU = XLSX.utils.sheet_to_json(wb.Sheets['SKU_Tab'], { header: 1, defval: null }) as any[][]
    const newGocSkus = { ...(baseRef.gocSkus || {}) }
    let count = 0
    for (let i = 7; i < rowsSKU.length; i++) {
      const r = rowsSKU[i]
      if (!r || !r[6]) continue
      const sku = String(r[6]).trim().toUpperCase()
      const prev = newGocSkus[sku] || {}
      newGocSkus[sku] = {
        ...prev,
        skuTabRow: i + 1,
        skuTabCell: `G${i + 1}`,
        changeVer: r[0] ? String(r[0]).trim() : '',
        changeKey: r[1] ? String(r[1]).trim() : '',
        prevPrice: typeof r[3] === 'number' ? Number(r[3].toFixed(2)) : (prev.prevPrice || null),
        status: r[4] ? String(r[4]).trim() : '',
        pc: r[5] ? String(r[5]).trim() : (prev.pc || ''),
        oldSku: r[7] ? String(r[7]).trim() : '',
        desc: r[8] ? String(r[8]).trim() : (prev.desc || ''),
        msrp: typeof r[9] === 'number' ? Number(r[9].toFixed(2)) : (prev.msrp || 0),
        stdAuth: typeof r[10] === 'number' ? Number(r[10].toFixed(2)) : (prev.stdAuth ?? null),
        regAuth: typeof r[11] === 'number' ? Number(r[11].toFixed(2)) : (prev.regAuth ?? null),
        incAuth: typeof r[12] === 'number' ? Number(r[12].toFixed(2)) : (prev.incAuth ?? null)
      }
      count++
    }
    if (wb.SheetNames.includes('HW_Compliance')) {
      const rowsHW = XLSX.utils.sheet_to_json(wb.Sheets['HW_Compliance'], { header: 1, defval: null }) as any[][]
      baseRef.hwComplianceRaw = rowsHW.map((cells, idx) => ({ rowNum: idx + 1, cells }))
      for (let i = 7; i < rowsHW.length; i++) {
        const r = rowsHW[i]
        if (r && r[1]) {
          const hwSku = String(r[1]).trim().toUpperCase()
          if (newGocSkus[hwSku]) {
            newGocSkus[hwSku].hwRow = i + 1
            newGocSkus[hwSku].hwCell = `B${i + 1}`
          }
        }
      }
    }
    baseRef.gocSkus = newGocSkus
    baseRef.skuListFileName = fileName
    if (preferredRole === 'goc') {
      baseRef.version = fileName
      baseRef.gocFileName = fileName
    }
    return {
      updatedRef: baseRef,
      role: preferredRole === 'goc' ? 'goc' : 'skulist',
      summaryText: `Đã cập nhật ${count.toLocaleString()} mã SKU từ File Gốc Sophos (${fileName}) lên Cloudinary`
    }
  }

  if (preferredRole !== 'tg' && wb.SheetNames.includes('MSRPs&BuyCost')) {
    const rowsMSRP = XLSX.utils.sheet_to_json(wb.Sheets['MSRPs&BuyCost'], { header: 1, defval: null }) as any[][]
    const newGocSkus = { ...(baseRef.gocSkus || {}) }
    let count = 0
    for (let i = 2; i < rowsMSRP.length; i++) {
      const r = rowsMSRP[i]
      if (!r || !r[1]) continue
      const sku = String(r[1]).trim().toUpperCase()
      const prev = newGocSkus[sku] || {}
      newGocSkus[sku] = {
        ...prev,
        rowNum: i + 1,
        cell: `B${i + 1}`,
        pc: String(r[0] || '').trim(),
        desc: prev.desc || '',
        msrp: Number(r[2]) || 0,
        stdAuth: r[3] !== '' && r[3] !== null ? Number(r[3]) : null,
        regAuth: r[4] !== '' && r[4] !== null ? Number(r[4]) : null,
        incAuth: r[5] !== '' && r[5] !== null ? Number(r[5]) : null
      }
      count++
    }
    if (wb.SheetNames.includes('Firewall')) {
      baseRef.gocFirewallRaw = XLSX.utils.sheet_to_json(wb.Sheets['Firewall'], { header: 1, defval: null })
    }
    baseRef.gocSkus = newGocSkus
    baseRef.version = fileName
    baseRef.gocFileName = fileName
    return {
      updatedRef: baseRef,
      role: 'goc',
      summaryText: `Đã cập nhật ${count.toLocaleString()} mã SKU từ File Gốc Sophos (${fileName}) lên Cloudinary`
    }
  }

  // Trường hợp 3: File Trung Gian / File Mẫu Import Sophos
  const newTgSheetsRaw: Record<string, any[][]> = {}
  const newTgSkuLocs: Record<string, any[]> = {}
  for (const s of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[s], { header: 1, defval: null }) as any[][]
    newTgSheetsRaw[s] = rows
    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const rowArr = rows[rIdx] || []
      for (let cIdx = 0; cIdx < rowArr.length; cIdx++) {
        const v = rowArr[cIdx]
        if (typeof v === 'string') {
          const clean = v.trim().toUpperCase()
          if (/^[A-Z0-9]{8,16}$/.test(clean) && /\d/.test(clean)) {
            const colLet = colIndexToLetter(cIdx)
            if (!newTgSkuLocs[clean]) newTgSkuLocs[clean] = []
            newTgSkuLocs[clean].push({
              sheet: s,
              rowNum: rIdx + 1,
              colIndex: cIdx,
              colLetter: colLet,
              cell: `${colLet}${rIdx + 1}`
            })
          }
        }
      }
    }
  }

  const newTgItems: any[] = []
  for (const s of wb.SheetNames) {
    if (s === 'LP Sophos') continue
    const rows = newTgSheetsRaw[s] || []
    let currentGroup = ''
    let currentSite = ''
    for (let i = 4; i < rows.length; i++) {
      const r = rows[i]
      if (!r || !r.some(x => x !== null)) continue
      if (r[0] && !r[1] && r[5] === null) {
        currentGroup = String(r[0]).trim()
        currentSite = r[7] ? String(r[7]).trim() : ''
      } else if (r[1] && r[5] !== null) {
        newTgItems.push({
          sheet: s,
          rowNum: i + 1,
          cell: `B${i + 1}`,
          group: currentGroup,
          site: currentSite,
          stt: r[0],
          sku: String(r[1]).trim().toUpperCase(),
          model: String(r[2] || '').trim(),
          description: String(r[3] || '').trim(),
          moTa: String(r[4] || '').trim(),
          msrp: Number(r[5]) || 0,
          nhapKhau: r[6] !== null && r[6] !== '' ? Number(r[6]) : 0
        })
      }
    }
  }

  if (preferredRole === 'goc') {
    const newGocSkus = { ...(baseRef.gocSkus || {}) }
    for (const it of newTgItems) {
      if (!it.sku) continue
      const prev = newGocSkus[it.sku] || {}
      newGocSkus[it.sku] = {
        ...prev,
        rowNum: it.rowNum,
        cell: it.cell,
        pc: it.model || prev.pc || '',
        desc: it.description || prev.desc || '',
        msrp: it.msrp || prev.msrp || 0
      }
    }
    baseRef.gocSkus = newGocSkus
    baseRef.version = fileName
    baseRef.gocFileName = fileName
    return {
      updatedRef: baseRef,
      role: 'goc',
      summaryText: `Đã cập nhật File Gốc Sophos (${fileName}) lên Cloudinary`
    }
  }

  baseRef.tgSheetsRaw = newTgSheetsRaw
  baseRef.tgSkuLocations = newTgSkuLocs
  baseRef.trungGianItems = newTgItems
  baseRef.tgFileName = fileName

  return {
    updatedRef: baseRef,
    role: 'tg',
    summaryText: `Đã cập nhật ${newTgItems.length.toLocaleString()} dòng BOM từ File Trung Gian Sophos (${fileName}) lên Cloudinary`
  }
}

function roundPrice2(val: any): number | null {
  if (val === null || val === undefined || val === '') return null
  const num = typeof val === 'number' ? val : Number(String(val).replace(/,/g, '').trim())
  if (!Number.isFinite(num)) return null
  return Math.round(num * 100) / 100
}

function formatExcelDateSerial(val: any): string {
  if (typeof val === 'number' && val > 30000 && val < 80000) {
    try {
      const parsed = XLSX.SSF?.parse_date_code?.(val)
      if (parsed && parsed.y && parsed.m && parsed.d) {
        const dd = String(parsed.d).padStart(2, '0')
        const mm = String(parsed.m).padStart(2, '0')
        return `${dd}/${mm}/${parsed.y}`
      }
    } catch (_) {}
  }
  return val !== null && val !== undefined ? String(val).trim() : ''
}

function trimAoaSheetRows(rows: any[][], maxKeepRows = 2500): any[][] {
  if (!Array.isArray(rows) || !rows.length) return []
  const capped = rows.slice(0, maxKeepRows)
  let lastNonEmptyRow = -1
  const trimmedRows = capped.map(r => {
    if (!Array.isArray(r) || !r.length) return []
    let lastCol = -1
    for (let c = r.length - 1; c >= 0; c--) {
      const v = r[c]
      if (v !== null && v !== undefined && v !== '') {
        lastCol = c
        break
      }
    }
    return lastCol >= 0 ? r.slice(0, lastCol + 1) : []
  })
  for (let i = trimmedRows.length - 1; i >= 0; i--) {
    if (trimmedRows[i].length > 0) {
      lastNonEmptyRow = i
      break
    }
  }
  return lastNonEmptyRow >= 0 ? trimmedRows.slice(0, lastNonEmptyRow + 1) : []
}

/**
 * Quét động số dòng trên sheet 'Firewall' của bất kỳ phiên bản Sophos Calculator nào (v3.0, v4.0.2, v5.0...)
 * Không phụ thuộc cứng vào số dòng cố định khi hãng chèn thêm gói mới (VD: Xstream Plus ở dòng 35).
 */
export function resolveSophosFirewallRowDynamic(
  firewallRows: any[][] | null | undefined,
  itemName: string,
  sku: string,
  defaultIsCalc = false
): number | null {
  const nl = String(itemName || '').toLowerCase()
  const s = String(sku || '').trim().toUpperCase()

  type Matcher = (labelLower: string) => boolean
  let matcher: Matcher | null = null

  if (nl.includes('standard hardware bundle')) {
    matcher = l => l.includes('standard hardware bundle')
  } else if (nl.includes('xstream hardware bundle')) {
    matcher = l => l.includes('xstream hardware bundle')
  } else if (nl.includes('hardware appliance') || s.startsWith('XG')) {
    matcher = l => l.includes('hardware appliance')
  } else if (nl.includes('xstream plus')) {
    matcher = l => l.includes('xstream plus')
  } else if ((nl.includes('xstream protection') || nl.includes('xtsream protection') || s.startsWith('XS')) && !nl.includes('bundle')) {
    matcher = l => (l.includes('xstream protection') || l.includes('xtsream protection')) && !l.includes('bundle')
  } else if ((nl.includes('standard protection') || s.startsWith('SP')) && !nl.includes('bundle')) {
    matcher = l => l.includes('standard protection') && !l.includes('bundle')
  } else if (nl.includes('enhanced to enhanced plus') || nl.includes('plus upgrade') || s.startsWith('UP')) {
    matcher = l => l.includes('enhanced to enhanced plus') || l.includes('plus upgrade')
  } else if (nl.includes('enhanced protection') || nl.includes('enhanced support') || s.startsWith('SE')) {
    matcher = l => (l.includes('enhanced protection') || l.includes('enhanced support')) && !l.includes('plus upgrade') && !l.includes('enhanced to enhanced')
  } else if (nl.includes('network protection') || s.startsWith('NS')) {
    matcher = l => l.includes('network protection')
  } else if ((nl.includes('web protection') && !nl.includes('webserver')) || s.startsWith('WS')) {
    matcher = l => l.includes('web protection') && !l.includes('webserver')
  } else if (nl.includes('zero-day') || s.startsWith('ZD')) {
    matcher = l => l.includes('zero-day')
  } else if (nl.includes('orchestration') || nl.includes('orchestation') || s.startsWith('CO')) {
    matcher = l => l.includes('orchestration') || l.includes('orchestation')
  } else if (nl.includes('email protection') || s.startsWith('ES')) {
    matcher = l => l.includes('email protection')
  } else if (nl.includes('webserver protection') || s.startsWith('SS')) {
    matcher = l => l.includes('webserver protection')
  } else if (nl.includes('central firewall reporting') || s.startsWith('CFR')) {
    matcher = l => l.includes('central firewall reporting')
  }

  if (matcher && Array.isArray(firewallRows) && firewallRows.length > 0) {
    for (let rIdx = 15; rIdx < Math.min(firewallRows.length, 80); rIdx++) {
      const row = firewallRows[rIdx]
      if (!Array.isArray(row)) continue
      for (let cIdx = 0; cIdx <= 4; cIdx++) {
        const cellVal = row[cIdx]
        if (cellVal && typeof cellVal === 'string') {
          const cleanLbl = cellVal.trim().toLowerCase()
          if (cleanLbl && matcher(cleanLbl)) {
            return rIdx + 1
          }
        }
      }
    }
  }

  // Fallback nếu không có mảng sheet Firewall truyền vào
  if (defaultIsCalc) {
    if (nl.includes('standard hardware bundle')) return 25
    if (nl.includes('xstream hardware bundle')) return 27
    if (nl.includes('hardware appliance') || s.startsWith('XG')) return 29
    if (nl.includes('xstream plus')) return 35
    if ((nl.includes('xstream protection') || nl.includes('xtsream protection') || s.startsWith('XS')) && !nl.includes('bundle')) return 33
    if ((nl.includes('standard protection') || s.startsWith('SP')) && !nl.includes('bundle')) return 37
    if (nl.includes('enhanced to enhanced plus') || nl.includes('plus upgrade') || s.startsWith('UP')) return 41
    if (nl.includes('enhanced protection') || nl.includes('enhanced support') || s.startsWith('SE')) return 39
    if (nl.includes('network protection') || s.startsWith('NS')) return 43
    if ((nl.includes('web protection') && !nl.includes('webserver')) || s.startsWith('WS')) return 45
    if (nl.includes('zero-day') || s.startsWith('ZD')) return 47
    if (nl.includes('orchestration') || nl.includes('orchestation') || s.startsWith('CO')) return 49
    if (nl.includes('email protection') || s.startsWith('ES')) return 51
    if (nl.includes('webserver protection') || s.startsWith('SS')) return 53
    if (nl.includes('central firewall reporting') || s.startsWith('CFR')) return 55
    return null
  }

  if (nl.includes('standard hardware bundle')) return 23
  if (nl.includes('xstream hardware bundle')) return 25
  if (nl.includes('hardware appliance') || s.startsWith('XG')) return 27
  if ((nl.includes('xstream protection') || nl.includes('xtsream protection') || s.startsWith('XS')) && !nl.includes('bundle')) return 31
  if ((nl.includes('standard protection') || s.startsWith('SP')) && !nl.includes('bundle')) return 33
  if (nl.includes('enhanced to enhanced plus') || nl.includes('plus upgrade') || s.startsWith('UP')) return 37
  if (nl.includes('enhanced protection') || nl.includes('enhanced support') || s.startsWith('SE')) return 35
  if (nl.includes('network protection') || s.startsWith('NS')) return 39
  if ((nl.includes('web protection') && !nl.includes('webserver')) || s.startsWith('WS')) return 41
  if (nl.includes('zero-day') || s.startsWith('ZD')) return 43
  if (nl.includes('orchestration') || nl.includes('orchestation') || s.startsWith('CO')) return 45
  if (nl.includes('email protection') || s.startsWith('ES')) return 47
  if (nl.includes('webserver protection') || s.startsWith('SS')) return 49
  if (nl.includes('central firewall reporting') || s.startsWith('CFR')) return 51
  return null
}

/**
 * Bóc tách toàn bộ dữ liệu từ file Sophos Reseller Calculator (calculate_sophos.xlsx - bất kỳ phiên bản nào):
 * - Đọc động Version, Effective From, Region, Currency từ sheet Cover
 * - Đọc động Description & Product Type từ sheet Product2
 * - Đọc động toàn bộ ~235,000+ mã SKU & các mức giá Reseller Cost từ sheet MSRPs&BuyCost (nén dạng tuple + pcDict)
 * - Giữ lại các sheet tính toán (Cover, What's New!, Discounts, Firewall, Endpoint & Server, Quick MSRP look up...) để điều hướng trực tiếp
 */
export function parseSophosCalculatorWorkbook(
  wb: XLSX.WorkBook,
  fileName: string,
  rawBytes?: Uint8Array | ArrayBuffer
): {
  compactIndex: any
  version: string
  effectiveFrom: string
  skuCount: number
  summaryText: string
} {
  let version = ''
  let effectiveFrom = ''
  let region = 'ASEAN'
  let currency = 'USD'

  // 1. Đọc động thông tin phiên bản trên sheet Cover
  if (wb.SheetNames.includes('Cover') && wb.Sheets['Cover']) {
    const coverRows = XLSX.utils.sheet_to_json(wb.Sheets['Cover'], { header: 1, defval: null }) as any[][]
    for (let r = 0; r < Math.min(coverRows.length, 20); r++) {
      const row = coverRows[r] || []
      for (let c = 0; c < row.length; c++) {
        const txt = String(row[c] ?? '').trim()
        if (!txt) continue
        const findNextVal = () => {
          for (let k = c + 1; k < Math.min(row.length, c + 4); k++) {
            if (row[k] !== null && row[k] !== undefined && String(row[k]).trim() !== '') {
              return row[k]
            }
          }
          return null
        }
        if (/^version\s*:?$/i.test(txt)) {
          const v = findNextVal()
          if (v !== null) version = String(v).trim()
        } else if (/^effective\s*from\s*:?$/i.test(txt)) {
          const v = findNextVal()
          if (v !== null) effectiveFrom = formatExcelDateSerial(v)
        } else if (/^region\s*:?$/i.test(txt)) {
          const v = findNextVal()
          if (v !== null) region = String(v).trim()
        } else if (/^currency\s*:?$/i.test(txt)) {
          const v = findNextVal()
          if (v !== null) currency = String(v).trim()
        }
      }
    }
  }

  if (!version) {
    const verMatch = String(fileName || '').match(/(20\d{2}-\d+(?:\.\d+)*(?:-\d+)?)/)
    version = verMatch ? verMatch[1] : fileName
  }

  // 2. Đọc động bảng Product2 để lấy Description & Product_Type__c theo ProductCode
  const productByCode: Record<string, [string, string]> = {}
  if (wb.SheetNames.includes('Product2') && wb.Sheets['Product2']) {
    const p2Rows = XLSX.utils.sheet_to_json(wb.Sheets['Product2'], { header: 1, defval: null }) as any[][]
    let descCol = 0
    let pcCol = 1
    let typeCol = 5
    let startRow = 1
    for (let i = 0; i < Math.min(p2Rows.length, 6); i++) {
      const r = (p2Rows[i] || []).map(x => String(x ?? '').trim().toLowerCase())
      if (r.includes('productcode') || r.includes('product code')) {
        pcCol = r.findIndex(x => x === 'productcode' || x === 'product code')
        const dIdx = r.findIndex(x => x === 'description')
        const tIdx = r.findIndex(x => x.includes('product_type') || x === 'product type')
        if (dIdx !== -1) descCol = dIdx
        if (tIdx !== -1) typeCol = tIdx
        startRow = i + 1
        break
      }
    }
    for (let i = startRow; i < p2Rows.length; i++) {
      const r = p2Rows[i]
      if (!r) continue
      const pc = String(r[pcCol] ?? '').trim()
      if (!pc) continue
      const desc = String(r[descCol] ?? '').trim()
      const pType = String(r[typeCol] ?? '').trim()
      if (desc || pType) {
        productByCode[pc] = [desc, pType]
      }
    }
  }

  // 3. Đọc động sheet MSRPs&BuyCost (hỗ trợ tự nhận diện cột theo tên Header)
  const msrpSheetName = wb.SheetNames.find(n => n.trim().toLowerCase() === 'msrps&buycost') || 'MSRPs&BuyCost'
  if (!wb.Sheets[msrpSheetName]) {
    throw new Error(`File "${fileName}" không có sheet MSRPs&BuyCost hợp lệ của Sophos Calculator!`)
  }
  const msrpRows = XLSX.utils.sheet_to_json(wb.Sheets[msrpSheetName], { header: 1, defval: null }) as any[][]

  let hdrIdx = 1
  let colPc = 0
  let colSku = 1
  let colMsrp = 2
  let colStdAuth = 3
  let colRegAuth = 4
  let colIncAuth = 5
  let colStdSilv = 6
  let colRegSilv = 7
  let colIncSilv = 8
  let colStdGold = 9
  let colRegGold = 10
  let colIncGold = 11
  let colStdPlat = 12
  let colRegPlat = 13
  let colIncPlat = 14
  let colStdSel = 15
  let colRegSel = 16
  let colIncSel = 17

  for (let i = 0; i < Math.min(msrpRows.length, 10); i++) {
    const r = (msrpRows[i] || []).map(x => String(x ?? '').trim().toLowerCase())
    if (r.includes('sku') && r.some(x => x.includes('msrp') || x.includes('rrp'))) {
      hdrIdx = i
      const findCol = (pred: (h: string) => boolean, fallback: number) => {
        const idx = r.findIndex(pred)
        return idx !== -1 ? idx : fallback
      }
      colPc = findCol(h => h.includes('product code') || h === 'productcode', 0)
      colSku = findCol(h => h === 'sku', 1)
      colMsrp = findCol(h => h.includes('msrp') || h.includes('rrp'), 2)
      colStdAuth = findCol(h => h.includes('standard') && h.includes('authorized'), 3)
      colRegAuth = findCol(h => h.includes('registered') && h.includes('authorized'), 4)
      colIncAuth = findCol(h => h.includes('incumbent') && h.includes('authorized'), 5)
      colStdSilv = findCol(h => h.includes('standard') && h.includes('silver'), 6)
      colRegSilv = findCol(h => h.includes('registered') && h.includes('silver'), 7)
      colIncSilv = findCol(h => h.includes('incumbent') && h.includes('silver'), 8)
      colStdGold = findCol(h => h.includes('standard') && h.includes('gold'), 9)
      colRegGold = findCol(h => h.includes('registered') && h.includes('gold'), 10)
      colIncGold = findCol(h => h.includes('incumbent') && h.includes('gold'), 11)
      colStdPlat = findCol(h => h.includes('standard') && h.includes('platinum'), 12)
      colRegPlat = findCol(h => h.includes('registered') && h.includes('platinum'), 13)
      colIncPlat = findCol(h => h.includes('incumbent') && h.includes('platinum'), 14)
      colStdSel = findCol(h => h.includes('standard') && h.includes('select'), 15)
      colRegSel = findCol(h => h.includes('registered') && h.includes('select'), 16)
      colIncSel = findCol(h => h.includes('incumbent') && h.includes('select'), 17)
      break
    }
  }

  const pcDict: string[] = []
  const pcIndexMap = new Map<string, number>()
  const msrpTuples: any[][] = []

  for (let i = hdrIdx + 1; i < msrpRows.length; i++) {
    const r = msrpRows[i]
    if (!r || !r[colSku]) continue
    const sku = String(r[colSku]).trim().toUpperCase()
    if (!sku) continue
    const pc = String(r[colPc] ?? '').trim()
    let pcIdx = pcIndexMap.get(pc)
    if (pcIdx === undefined) {
      pcIdx = pcDict.length
      pcDict.push(pc)
      pcIndexMap.set(pc, pcIdx)
    }

    const tuple: any[] = [
      i + 1,
      pcIdx,
      sku,
      roundPrice2(r[colMsrp]) ?? 0,
      roundPrice2(r[colStdAuth]),
      roundPrice2(r[colRegAuth]),
      roundPrice2(r[colIncAuth]),
      roundPrice2(r[colStdSilv]),
      roundPrice2(r[colRegSilv]),
      roundPrice2(r[colIncSilv]),
      roundPrice2(r[colStdGold]),
      roundPrice2(r[colRegGold]),
      roundPrice2(r[colIncGold]),
      roundPrice2(r[colStdPlat]),
      roundPrice2(r[colRegPlat]),
      roundPrice2(r[colIncPlat]),
      roundPrice2(r[colStdSel]),
      roundPrice2(r[colRegSel]),
      roundPrice2(r[colIncSel])
    ]
    while (tuple.length > 4 && (tuple[tuple.length - 1] === null || tuple[tuple.length - 1] === undefined)) {
      tuple.pop()
    }
    msrpTuples.push(tuple)
  }

  // 4. Bóc tách toàn bộ công thức nền (Product2, Drop_Downs, Features, Model Groups)
  const engineMeta = extractSophosCalcEngineMeta(wb)

  // 5. Xác định các sheet hiển thị (Hidden === 0) đúng theo thứ tự gốc của calculate_sophos.xlsx
  // Các sheet nguồn nền (Drop_Downs, Features, MSRPs&BuyCost, Product2) là Hidden=1 trong Excel
  const hiddenSheetSet = new Set([
    msrpSheetName.toLowerCase(),
    'product2',
    'drop_downs',
    'features'
  ])
  if (Array.isArray(wb.Workbook?.Sheets)) {
    for (const sMeta of wb.Workbook!.Sheets!) {
      if (sMeta?.name && sMeta.Hidden) {
        hiddenSheetSet.add(sMeta.name.trim().toLowerCase())
      }
    }
  }

  const candidateVisibleNames = wb.SheetNames.filter(s => !hiddenSheetSet.has(s.trim().toLowerCase()))
  let styledWb: XLSX.WorkBook | null = null
  if (rawBytes && candidateVisibleNames.length > 0) {
    try {
      styledWb = XLSX.read(rawBytes, {
        type: 'array',
        sheets: candidateVisibleNames,
        cellStyles: true
      })
    } catch (_) {
      styledWb = null
    }
  }

  const calcSheetsRaw: Record<string, any[][]> = {}
  const calcSheetsStyled: Record<string, any> = {}
  const calcVisibleSheetNames: string[] = []

  for (const sName of candidateVisibleNames) {
    const ws = wb.Sheets[sName]
    if (!ws) continue
    const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as any[][]
    if (rawRows.length > 2500) continue
    // Cắt bỏ các cột phụ nháp ẩn ở quá xa bên phải (VD: Cột BC..BE trên sheet NDR) để bảng hiển thị gọn đúng vùng in của Excel
    const cappedColsRows = rawRows.map(r => (Array.isArray(r) && r.length > 46 ? r.slice(0, 46) : r))
    const trimmed = trimAoaSheetRows(cappedColsRows, 2500)
    if (sName === 'Cover') {
      // Chuẩn hóa hiển thị ngày Effective from trên sheet Cover
      for (let r = 0; r < Math.min(trimmed.length, 15); r++) {
        const row = trimmed[r]
        if (!row) continue
        for (let c = 0; c < row.length - 1; c++) {
          if (/^effective\s*from\s*:?$/i.test(String(row[c] ?? '').trim()) && typeof row[c + 1] === 'number') {
            row[c + 1] = formatExcelDateSerial(row[c + 1])
          }
        }
      }
    }
    calcSheetsRaw[sName] = trimmed
    const wsForStyle = styledWb?.Sheets?.[sName] || ws
    calcSheetsStyled[sName] = extractVisibleSheetStyleMeta(wsForStyle, trimmed)
    calcVisibleSheetNames.push(sName)
  }

  const calcHiddenSheetNames: string[] = ['MSRPs&BuyCost']
  const calcSheetNames: string[] = [...calcVisibleSheetNames]

  const now = Date.now()
  const compactIndex = {
    format: 'sophos_calc_v2',
    version,
    effectiveFrom,
    region,
    currency,
    fileName,
    updatedAt: now,
    skuCount: msrpTuples.length,
    pcDict,
    productByCode,
    msrpTuples,
    engineMeta,
    calcVisibleSheetNames,
    calcHiddenSheetNames,
    calcSheetNames,
    calcSheetsRaw,
    calcSheetsStyled
  }

  return {
    compactIndex,
    version,
    effectiveFrom,
    skuCount: msrpTuples.length,
    summaryText: `Đã cập nhật ${msrpTuples.length.toLocaleString()} mã SKU & ${calcVisibleSheetNames.length} sheet tính toán từ File Calculator Sophos (${fileName} • v${version}) lên Cloudinary`
  }
}

/**
 * Giải nén bảng tra cứu & bộ máy công thức trên RAM cho calculate_sophos sau khi tải từ Cloudinary
 * Hỗ trợ tương thích cả định dạng sophos_calc_v2 (15 cột giá + engineMeta + calcSheetsStyled) và sophos_calc_v1
 */
export function hydrateSophosCalcRefData(rawCalc: any): any {
  if (!rawCalc || typeof rawCalc !== 'object') return null
  if (rawCalc.calcSkus && Array.isArray(rawCalc.sortedCalcMsrpRows)) {
    return rawCalc
  }

  const isV2 = rawCalc.format === 'sophos_calc_v2'
  const pcDict: string[] = Array.isArray(rawCalc.pcDict) ? rawCalc.pcDict : []
  const productByCode: Record<string, [string, string]> = rawCalc.productByCode || {}
  const tuples: any[][] = Array.isArray(rawCalc.msrpTuples) ? rawCalc.msrpTuples : []

  const calcSkus: Record<string, any> = {}
  const sortedCalcMsrpRows: any[] = new Array(tuples.length)

  for (let i = 0; i < tuples.length; i++) {
    const t = tuples[i]
    const rowNum = Number(t[0]) || i + 3
    const pc = typeof t[1] === 'number' ? (pcDict[t[1]] || '') : String(t[1] || '')
    const sku = String(t[2] || '').trim().toUpperCase()
    const pMeta = pc ? productByCode[pc] : undefined
    const entry = isV2
      ? {
          rowNum,
          cell: `B${rowNum}`,
          pc,
          sku,
          desc: pMeta ? pMeta[0] || '' : '',
          prodType: pMeta ? pMeta[1] || '' : '',
          msrp: Number(t[3]) || 0,
          stdAuth: t[4] !== undefined ? t[4] : null,
          regAuth: t[5] !== undefined ? t[5] : null,
          incAuth: t[6] !== undefined ? t[6] : null,
          stdSilv: t[7] !== undefined ? t[7] : null,
          regSilv: t[8] !== undefined ? t[8] : null,
          incSilv: t[9] !== undefined ? t[9] : null,
          stdGold: t[10] !== undefined ? t[10] : null,
          regGold: t[11] !== undefined ? t[11] : null,
          incGold: t[12] !== undefined ? t[12] : null,
          stdPlat: t[13] !== undefined ? t[13] : null,
          regPlat: t[14] !== undefined ? t[14] : null,
          incPlat: t[15] !== undefined ? t[15] : null,
          stdSel: t[16] !== undefined ? t[16] : null,
          regSel: t[17] !== undefined ? t[17] : null,
          incSel: t[18] !== undefined ? t[18] : null
        }
      : {
          rowNum,
          cell: `B${rowNum}`,
          pc,
          sku,
          desc: pMeta ? pMeta[0] || '' : '',
          prodType: pMeta ? pMeta[1] || '' : '',
          msrp: Number(t[3]) || 0,
          stdAuth: t[4] !== undefined ? t[4] : null,
          regAuth: t[5] !== undefined ? t[5] : null,
          incAuth: t[6] !== undefined ? t[6] : null,
          stdSilv: t[7] !== undefined ? t[7] : null,
          regSilv: t[8] !== undefined ? t[8] : null,
          incSilv: null,
          stdGold: t[9] !== undefined ? t[9] : null,
          regGold: t[10] !== undefined ? t[10] : null,
          incGold: null,
          stdPlat: t[11] !== undefined ? t[11] : null,
          regPlat: t[12] !== undefined ? t[12] : null,
          incPlat: null,
          stdSel: null,
          regSel: null,
          incSel: null
        }
    sortedCalcMsrpRows[i] = entry
    if (sku) {
      calcSkus[sku] = entry
    }
  }

  const rawSheetKeys = Object.keys(rawCalc.calcSheetsRaw || {})
  const visibleSheets = Array.isArray(rawCalc.calcVisibleSheetNames) && rawCalc.calcVisibleSheetNames.length
    ? rawCalc.calcVisibleSheetNames
    : (Array.isArray(rawCalc.calcSheetNames)
        ? rawCalc.calcSheetNames.filter((s: string) => s !== 'MSRPs&BuyCost')
        : rawSheetKeys)

  const engineRuntime = hydrateSophosEngineRuntime(rawCalc.engineMeta)

  return {
    format: rawCalc.format || 'sophos_calc_v1',
    version: rawCalc.version || '',
    effectiveFrom: rawCalc.effectiveFrom || '',
    region: rawCalc.region || 'ASEAN',
    currency: rawCalc.currency || 'USD',
    fileName: rawCalc.fileName || 'calculate_sophos.xlsx',
    updatedAt: rawCalc.updatedAt || 0,
    skuCount: tuples.length,
    calcSkus,
    sortedCalcMsrpRows,
    calcVisibleSheetNames: visibleSheets,
    calcHiddenSheetNames: Array.isArray(rawCalc.calcHiddenSheetNames) ? rawCalc.calcHiddenSheetNames : ['MSRPs&BuyCost'],
    calcSheetNames: visibleSheets,
    calcSheetsRaw: rawCalc.calcSheetsRaw || {},
    calcSheetsStyled: rawCalc.calcSheetsStyled || {},
    productByCode,
    engineMeta: rawCalc.engineMeta || null,
    engineRuntime
  }
}

/**
 * Tạo bản rút gọn (< 8MB) của calculate_sophos.xlsx để Microsoft ViewOffice có thể mở trực tiếp trên trình duyệt
 * (File nguyên bản 24MB vẫn được giữ nguyên vẹn 100% qua calc_file_chunk_urls khi bấm Tải về)
 */
export function buildSlimSophosCalcViewOfficeWorkbook(wb: XLSX.WorkBook): Blob {
  const slimWb = XLSX.utils.book_new()
  const skipForSlim = new Set(['msrps&buycost', 'drop_downs', 'features'])

  for (const sName of wb.SheetNames) {
    if (skipForSlim.has(sName.trim().toLowerCase())) continue
    const ws = wb.Sheets[sName]
    if (!ws) continue
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as any[][]
    if (aoa.length > 3500) continue
    const trimmed = trimAoaSheetRows(aoa, 3500)
    XLSX.utils.book_append_sheet(slimWb, XLSX.utils.aoa_to_sheet(trimmed), sName.slice(0, 31))
  }

  if (!slimWb.SheetNames.length) {
    XLSX.utils.book_append_sheet(slimWb, XLSX.utils.aoa_to_sheet([['Sophos Reseller Calculator']]), 'Cover')
  }

  const xlsxBuf = XLSX.write(slimWb, { bookType: 'xlsx', type: 'array', compression: true })
  return new Blob([xlsxBuf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
}
