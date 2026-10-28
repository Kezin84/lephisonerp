import * as XLSX from 'xlsx-js-style'
import JSZip from 'jszip'

export const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload'
export const CLOUDINARY_RAW_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/db6fzs3rh/raw/upload'
export const CLOUDINARY_UPLOAD_PRESET = 'upload_file'

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
  import_file_url?: string
  import_file_name?: string
  import_updated_at?: number
  updated_at?: number
}

const MAX_CLOUDINARY_RAW_BYTES = 9.5 * 1024 * 1024

export async function uploadBlobToCloudinary(
  blobOrFile: Blob | File,
  fileName: string
): Promise<string> {
  const tryUpload = async (endpointUrl: string) => {
    const fd = new FormData()
    fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    fd.append('file', blobOrFile, fileName)
    const res = await fetch(endpointUrl, {
      method: 'POST',
      body: fd
    })
    const data = await res.json().catch(() => ({}))
    return { res, data }
  }

  let { res, data } = await tryUpload(CLOUDINARY_UPLOAD_URL)
  if (!res.ok || !data?.secure_url) {
    // Fallback sang raw/upload cho mọi định dạng file đặc biệt (.xlsb, .msg, .rar, .zip, .docx, file không rõ đuôi...)
    const rawAttempt = await tryUpload(CLOUDINARY_RAW_UPLOAD_URL)
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
