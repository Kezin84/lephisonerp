import * as XLSX from 'xlsx-js-style'

export interface SophosProduct2Item {
  desc: string
  pc: string
  partId: string
  fwFilter: string
  prodType: string
  termed: boolean | string
  volScheme: string
  txEnabled: boolean
  sectorEnabled: boolean
  specAttrRule: string
  eolMonths: number | null
}

export interface SophosFirewallModelGroup {
  group: string
  models: string[]
}

export interface SophosUniversalCatalog {
  families: string[]
  linesByFamily: Record<string, string[]>
  productsByLine: Record<string, string[]>
}

export interface SophosDropDownsMeta {
  defaultPartnerLevel: string
  partnerLevels: string[]
  sectors: { label: string; code: string }[]
  dealTypes: { label: string; txCode: string; costTier: 'std' | 'reg' | 'inc' }[]
  terms: { label: string; code: string; months: number }[]
  firewallBundleTerms: { label: string; code: string; suffix: string }[]
  powerSockets: string[]
  volBandTables: Record<string, [number, number, string][]>
  specialAttrSingleSet: string[]
  specialAttrTables: Record<string, Record<string, string>>
  oldSkuByNewSku: Record<string, string>
  newSkuByOldSku: Record<string, string>
  firewallVirtualMap: Record<string, string>
  firewallModelGroups: SophosFirewallModelGroup[]
  firewallLicensingNotes: string
  universalCatalog: SophosUniversalCatalog
}

export interface SophosCalcEngineCompact {
  // [desc, pc, partId, fwFilter, prodType, termed, volScheme, txEnabled(0|1), sectorEnabled(0|1), specAttrRule, eolMonths]
  products: any[][]
  featuresByProduct: Record<string, string>
  dropDowns: SophosDropDownsMeta
}

export interface SophosFirewallCalcSettings {
  partnerLevel: string
  sector: string
  dealType: string
  termHwBundle: string
  termSubscription: string
  qty: number
  specialAttribute: string
  models: string[] // Up to 3 models side-by-side like Firewall sheet (Model 1, Model 2, Model 3)
  promoDiscByRow?: Record<string, number>
  specialDiscByRow?: Record<string, number>
}

export interface SophosFirewallEvalCell {
  model: string
  productDesc: string
  productCode: string
  sku: string
  newSku: string
  available: boolean
  unitMsrp: number
  msrp: number
  unitResellerCost: number | null
  resellerDiscPct: number
  promoDiscPct: number
  specialDiscPct: number
  buyCost: number
  calcRowNum: number | null
  eolMonths: number | null
  note: string
}

export interface SophosFirewallEvalRow {
  key: string
  category: 'Hardware Bundles' | 'Subscriptions'
  label: string
  sheetRowNum: number
  cells: SophosFirewallEvalCell[]
}

export interface SophosProductCalcScenario {
  partnerLevel: string
  sector: string
  dealType: string
  family?: string
  productLine?: string
  product: string
  term: string
  qty: number
  specialAttribute: string
  promoDiscPct?: number
  specialDiscPct?: number
}

export interface SophosProductEvalResult {
  foundProduct: boolean
  productDesc: string
  productCode: string
  prodType: string
  sku: string
  newSku: string
  available: boolean
  unitMsrp: number
  msrp: number
  unitResellerCost: number | null
  resellerDiscPct: number
  promoDiscPct: number
  specialDiscPct: number
  buyCost: number
  bandCode: string
  bandMin: number | null
  bandMax: number | null
  minQtyWarning: string
  isTermed: boolean
  fixedTermLabel: string
  specialAttrOptions: { label: string; code: string }[]
  features: string
  calcRowNum: number | null
  eolMonths: number | null
}

export interface SophosInferredCalcContext {
  calcType: 'firewall' | 'product'
  nativeSheet: string
  targetFirewallRowKey: string
  targetFirewallSheetRow: number | null
  partnerLevel: string
  sector: string
  dealType: string
  termHwBundle: string
  termSubscription: string
  qty: number
  specialAttribute: string
  model: string
  models: string[]
  family: string
  productLine: string
  product: string
}

function round2(n: number): number {
  return Math.round((Number(n) || 0) * 100) / 100
}

function normalizeVirtKey(s: string): string {
  return String(s || '')
    .toUpperCase()
    .replace(/\bGB\s+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const DEFAULT_PARTNER_LEVELS = ['Authorized', 'Silver', 'Gold', 'Platinum_Titanium', 'Select']
const DEFAULT_SECTORS = [
  { label: 'Corporate', code: 'C' },
  { label: 'Education', code: 'E' },
  { label: 'Government', code: 'G' }
]
const DEFAULT_DEAL_TYPES: { label: string; txCode: string; costTier: 'std' | 'reg' | 'inc' }[] = [
  { label: 'New - Standard', txCode: 'N', costTier: 'std' },
  { label: 'New - Registered', txCode: 'N', costTier: 'reg' },
  { label: 'Renewal', txCode: 'R', costTier: 'inc' }
]

const THEME_COLOR_FALLBACK: Record<number, string> = {
  0: '#FFFFFF',
  1: '#000000',
  2: '#E7E6E6',
  3: '#002F6C',
  4: '#004FB5',
  5: '#00B0F0',
  6: '#ED7D31',
  7: '#A5A5A5',
  8: '#FFC000',
  9: '#4472C4'
}

function applyTintToHex(hex: string, tint?: number): string {
  if (!tint || typeof tint !== 'number') return hex
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return hex
  let r = parseInt(clean.slice(0, 2), 16)
  let g = parseInt(clean.slice(2, 4), 16)
  let b = parseInt(clean.slice(4, 6), 16)
  if (tint < 0) {
    const f = 1 + tint
    r = Math.round(r * f)
    g = Math.round(g * f)
    b = Math.round(b * f)
  } else {
    r = Math.round(r * (1 - tint) + 255 * tint)
    g = Math.round(g * (1 - tint) + 255 * tint)
    b = Math.round(b * (1 - tint) + 255 * tint)
  }
  const toHex = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function resolveExcelColorObject(colorObj: any): string | null {
  if (!colorObj || typeof colorObj !== 'object') return null
  if (typeof colorObj.rgb === 'string' && colorObj.rgb.trim()) {
    const raw = colorObj.rgb.trim().replace(/^#/, '').toUpperCase()
    const hex6 = raw.length === 8 ? raw.slice(2) : raw
    if (/^[0-9A-F]{6}$/.test(hex6)) {
      return applyTintToHex(`#${hex6}`, colorObj.tint)
    }
  }
  if (typeof colorObj.theme === 'number' && THEME_COLOR_FALLBACK[colorObj.theme]) {
    return applyTintToHex(THEME_COLOR_FALLBACK[colorObj.theme], colorObj.tint)
  }
  return null
}

function isDarkHexColor(hex: string | null): boolean {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  return lum < 128
}

/**
 * Bóc tách định dạng hiển thị (merges, độ rộng cột, bảng màu cellStyles) cho các sheet hiển thị của calculate_sophos.xlsx
 * Đảm bảo tương thích 100% với trình dựng bảng Excel trong sophos_excel_viewer.html & showExcelNavModal
 */
export function extractVisibleSheetStyleMeta(ws: XLSX.WorkSheet, trimmedRows: any[][]): any {
  let maxCols = 8
  for (const r of trimmedRows) {
    if (Array.isArray(r) && r.length > maxCols) {
      maxCols = r.length
    }
  }

  const rawMerges = Array.isArray(ws['!merges']) ? ws['!merges'] : []
  const maxRowIdx = Math.max(0, trimmedRows.length - 1)
  const merges: { top: number; bottom: number; left: number; right: number }[] = []
  for (const m of rawMerges) {
    if (!m || !m.s || !m.e) continue
    if (m.s.r > maxRowIdx + 5) continue
    if (m.e.c + 1 > maxCols && m.e.c < 44) {
      maxCols = m.e.c + 1
    }
    merges.push({
      top: m.s.r + 1,
      bottom: Math.min(m.e.r, maxRowIdx + 5) + 1,
      left: m.s.c + 1,
      right: Math.min(m.e.c, 44) + 1
    })
  }
  maxCols = Math.min(44, Math.max(maxCols, 8))

  const rawCols = Array.isArray(ws['!cols']) ? ws['!cols'] : []
  const colWidths: number[] = []
  for (let c = 0; c < maxCols; c++) {
    const colInfo = rawCols[c]
    if (colInfo?.hidden) {
      colWidths.push(0)
    } else if (typeof colInfo?.wpx === 'number' && colInfo.wpx > 0) {
      colWidths.push(Math.round(colInfo.wpx))
    } else if (typeof colInfo?.wch === 'number' && colInfo.wch > 0) {
      colWidths.push(Math.round(colInfo.wch * 7.5))
    } else {
      colWidths.push(95)
    }
  }

  const stylePalette: any[] = []
  const paletteMap = new Map<string, number>()
  const cellStyles: (number | null)[][] = []
  let hasAnyStyle = false

  const totalRows = trimmedRows.length
  for (let r = 0; r < totalRows; r++) {
    const rowStyleIndices: (number | null)[] = []
    let rowHasNonNull = false
    for (let c = 0; c < maxCols; c++) {
      const addr = XLSX.utils.encode_cell({ r, c })
      const cell = ws[addr]
      const s = cell?.s
      if (!s || typeof s !== 'object') {
        rowStyleIndices.push(null)
        continue
      }

      const fillObj = s.fill || (s.patternType ? s : null)
      let bg: string | null = null
      if (fillObj && fillObj.patternType && fillObj.patternType !== 'none') {
        bg = resolveExcelColorObject(fillObj.fgColor)
        if (bg === '#FFFFFF') bg = null
      }

      const fontObj = s.font || null
      let fg = fontObj ? resolveExcelColorObject(fontObj.color) : null
      if (bg && isDarkHexColor(bg) && (!fg || fg === '#000000')) {
        fg = '#FFFFFF'
      }
      if (fg === '#000000') fg = null

      const b = Boolean(fontObj?.bold)
      const i = Boolean(fontObj?.italic)
      const sz = typeof fontObj?.sz === 'number' && fontObj.sz !== 11 ? fontObj.sz : undefined
      const al = typeof s.alignment?.horizontal === 'string' ? s.alignment.horizontal : undefined
      const val = typeof s.alignment?.vertical === 'string' ? s.alignment.vertical : undefined

      if (!bg && !fg && !b && !i && !sz && !al && !val) {
        rowStyleIndices.push(null)
        continue
      }

      const stObj: any = {}
      if (bg) stObj.bg = bg
      if (fg) stObj.fg = fg
      if (b) stObj.b = true
      if (i) stObj.i = true
      if (sz) stObj.sz = sz
      if (al) stObj.al = al
      if (val) stObj.val = val

      const key = JSON.stringify(stObj)
      let pIdx = paletteMap.get(key)
      if (pIdx === undefined) {
        pIdx = stylePalette.length
        stylePalette.push(stObj)
        paletteMap.set(key, pIdx)
      }
      rowStyleIndices.push(pIdx)
      rowHasNonNull = true
      hasAnyStyle = true
    }
    cellStyles.push(rowHasNonNull ? rowStyleIndices : [])
  }

  return {
    merges,
    colWidths,
    stylePalette: hasAnyStyle ? stylePalette : [],
    cellStyles: hasAnyStyle ? cellStyles : []
  }
}

/**
 * Bóc tách toàn bộ công thức nền từ các sheet ẩn (Product2, Drop_Downs, Features) + Cover + Firewall của calculate_sophos.xlsx
 * Không fix cứng: tự động cập nhật khi upload phiên bản Calculator mới lên Cloudinary
 */
export function extractSophosCalcEngineMeta(wb: XLSX.WorkBook): SophosCalcEngineCompact {
  // 1. Default Partner Level từ Cover!I3 (hoặc quét trên Cover)
  let defaultPartnerLevel = 'Authorized'
  if (wb.Sheets['Cover']) {
    const coverRows = XLSX.utils.sheet_to_json(wb.Sheets['Cover'], { header: 1, defval: null }) as any[][]
    for (let r = 0; r < Math.min(coverRows.length, 10); r++) {
      const row = coverRows[r] || []
      for (let c = 0; c < row.length; c++) {
        const v = String(row[c] ?? '').trim()
        if (DEFAULT_PARTNER_LEVELS.includes(v)) {
          defaultPartnerLevel = v
          break
        }
      }
    }
  }

  // 2. Bảng Features (Features!$A:$B)
  const featuresByProduct: Record<string, string> = {}
  const featSheetName = wb.SheetNames.find(n => n.trim().toLowerCase() === 'features')
  if (featSheetName && wb.Sheets[featSheetName]) {
    const fRows = XLSX.utils.sheet_to_json(wb.Sheets[featSheetName], { header: 1, defval: null }) as any[][]
    for (let i = 0; i < fRows.length; i++) {
      const r = fRows[i]
      if (!r || !r[0]) continue
      const k = String(r[0]).trim()
      const v = String(r[1] ?? '').trim()
      if (k && v && k.toLowerCase() !== 'product') {
        featuresByProduct[k] = v
      }
    }
  }

  // 3. Bảng Product2 (toàn bộ ~2,000 định nghĩa sản phẩm & quy tắc ghép SKU 14 ký tự)
  const products: any[][] = []
  const prodDescSet = new Set<string>()
  const p2SheetName = wb.SheetNames.find(n => n.trim().toLowerCase() === 'product2')
  if (p2SheetName && wb.Sheets[p2SheetName]) {
    const p2Rows = XLSX.utils.sheet_to_json(wb.Sheets[p2SheetName], { header: 1, defval: null }) as any[][]
    let cDesc = 0
    let cPc = 1
    let cPartId = 2
    let cFwFilter = 3
    let cType = 5
    let cTermed = 6
    let cVol = 7
    let cTx = 8
    let cSector = 9
    let cSpec = 10
    let cEol = 14
    let startIdx = 1

    for (let i = 0; i < Math.min(p2Rows.length, 6); i++) {
      const hdr = (p2Rows[i] || []).map(x => String(x ?? '').trim().toLowerCase())
      if (hdr.includes('productcode') || hdr.includes('product code')) {
        const findCol = (pred: (h: string) => boolean, fb: number) => {
          const idx = hdr.findIndex(pred)
          return idx !== -1 ? idx : fb
        }
        cDesc = findCol(h => h === 'description', 0)
        cPc = findCol(h => h === 'productcode' || h === 'product code', 1)
        cPartId = findCol(h => h.includes('part_id'), 2)
        cFwFilter = findCol(h => h.includes('firewall_filter'), 3)
        cType = findCol(h => h.includes('product_type'), 5)
        cTermed = findCol(h => h.includes('termed'), 6)
        cVol = findCol(h => h.includes('volume_band'), 7)
        cTx = findCol(h => h.includes('transaction_type'), 8)
        cSector = findCol(h => h.includes('sector_pricing'), 9)
        cSpec = findCol(h => h.includes('special_attribute'), 10)
        cEol = findCol(h => h.includes('eol'), 14)
        startIdx = i + 1
        break
      }
    }

    for (let i = startIdx; i < p2Rows.length; i++) {
      const r = p2Rows[i]
      if (!r) continue
      const desc = String(r[cDesc] ?? '').trim()
      const pc = String(r[cPc] ?? '').trim()
      const partId = String(r[cPartId] ?? '').trim().toUpperCase()
      if (!desc && !pc && !partId) continue

      const fwFilter = String(r[cFwFilter] ?? '').trim()
      const prodType = String(r[cType] ?? '').trim()
      const rawTermed = r[cTermed]
      let termed: boolean | string = true
      if (typeof rawTermed === 'boolean') {
        termed = rawTermed
      } else if (rawTermed !== null && rawTermed !== undefined && String(rawTermed).trim() !== '') {
        const s = String(rawTermed).trim()
        if (s.toLowerCase() === 'true') termed = true
        else if (s.toLowerCase() === 'false') termed = false
        else termed = s
      } else {
        termed = false
      }

      const volScheme = String(r[cVol] ?? 'Z').trim().toUpperCase() || 'Z'
      const txEnabled = r[cTx] === true || String(r[cTx] ?? '').trim().toLowerCase() === 'true'
      const sectorEnabled = r[cSector] === true || String(r[cSector] ?? '').trim().toLowerCase() === 'true'
      const specAttrRule = String(r[cSpec] ?? 'AA').trim() || 'AA'
      const eolRaw = r[cEol]
      const eolMonths = typeof eolRaw === 'number' && Number.isFinite(eolRaw) ? eolRaw : null

      if (desc) prodDescSet.add(desc)
      products.push([
        desc,
        pc,
        partId,
        fwFilter,
        prodType,
        termed,
        volScheme,
        txEnabled ? 1 : 0,
        sectorEnabled ? 1 : 0,
        specAttrRule,
        eolMonths
      ])
    }
  }

  // 4. Bảng Drop_Downs
  const partnerLevels = [...DEFAULT_PARTNER_LEVELS]
  const sectors = [...DEFAULT_SECTORS]
  const dealTypes = [...DEFAULT_DEAL_TYPES]
  const terms: { label: string; code: string; months: number }[] = []
  const firewallBundleTerms: { label: string; code: string; suffix: string }[] = [
    { label: '1-Year', code: '12', suffix: '1-year' },
    { label: '3-Year', code: '36', suffix: '3-year' },
    { label: '5-Year', code: '60', suffix: '5-year' }
  ]
  const volBandTables: Record<string, [number, number, string][]> = {}
  const oldSkuByNewSku: Record<string, string> = {}
  const newSkuByOldSku: Record<string, string> = {}
  const firewallVirtualMap: Record<string, string> = {
    'SFv 1C4': '1 CORE & UNL RAM',
    'SFv 2C4': '2 CORES & UNL RAM',
    'SFv 4C6': '4 CORES & UNL RAM',
    'SFv 6C8': '6 CORES & UNL RAM',
    'SFv 8C16': '8 CORES & UNL RAM',
    'SFv 16C24': '16 CORES & UNL RAM',
    'SFv Unlimited': 'UNL CORES & UNL GB RAM'
  }
  const specialAttrSingleSet = new Set<string>([
    'AA', 'NP', 'AM', 'AN', 'AU', 'CH', 'CN', 'EK', 'ES', 'EU', 'IN', 'IT', 'JP', 'MR', 'MS', 'UK', 'US'
  ])
  const specialAttrTables: Record<string, Record<string, string>> = {
    X1_: { AU: 'AU', CN: 'CN', EU: 'EU', IN: 'IN', JP: 'JP', UK: 'UK', US: 'US', KR: 'EU' },
    X2_: { AU: 'AU', CN: 'CN', EU: 'EK', UK: 'EK', IN: 'IN', JP: 'JP', US: 'US', KR: 'EK' },
    X3_: { EU: 'ES', US: 'ES', UK: 'ES', KR: 'AN', AU: 'AN', CN: 'AN', JP: 'AN', IN: 'IN' },
    Multi: {
      'Standard Pricing': 'AA',
      'Competitive Upgrade': 'CU'
    }
  }
  const families: string[] = []
  const linesByFamily: Record<string, string[]> = {}
  const productsByLine: Record<string, string[]> = {}

  const ddSheetName = wb.SheetNames.find(n => n.trim().toLowerCase() === 'drop_downs')
  if (ddSheetName && wb.Sheets[ddSheetName]) {
    const ddRows = XLSX.utils.sheet_to_json(wb.Sheets[ddSheetName], { header: 1, defval: null }) as any[][]

    // 4a. Terms (Cols E:F, rows 1..62)
    for (let r = 1; r < Math.min(ddRows.length, 70); r++) {
      const row = ddRows[r] || []
      const tLbl = String(row[4] ?? '').trim()
      const tVal = row[5] !== null && row[5] !== undefined ? String(row[5]).trim() : ''
      if (/^\d+\s*MOS$/i.test(tLbl)) {
        const m = parseInt(tLbl, 10)
        const code = tVal ? tVal.padStart(2, '0') : String(m).padStart(2, '0')
        terms.push({ label: tLbl.toUpperCase(), code, months: m })
      }
    }

    // 4b. Volume Band Tables (Cols A:C, rows 20..120) + HW_App_OldSKU (Cols A:C, rows 115..1600)
    for (let r = 20; r < ddRows.length; r++) {
      const row = ddRows[r] || []
      const c0 = row[0]
      const c1 = row[1]
      const c2 = row[2]

      if (typeof c0 === 'number' && typeof c1 === 'number' && typeof c2 === 'string') {
        const code = c2.trim().toUpperCase()
        if (/^[A-Z]{2}$/.test(code)) {
          const scheme = code === 'ZZ' ? 'Z' : code[0]
          if (!volBandTables[scheme]) volBandTables[scheme] = []
          volBandTables[scheme].push([c0, c1, code])
          continue
        }
      }

      if (typeof c1 === 'string' && typeof c2 === 'string') {
        const newSku = c1.trim().toUpperCase()
        const oldSku = c2.trim().toUpperCase()
        if (newSku.length === 14 && oldSku.length >= 6 && newSku !== 'NEWSKU') {
          oldSkuByNewSku[newSku] = oldSku
          newSkuByOldSku[oldSku] = newSku
        }
      }
    }

    // 4c. Firewall Virtual Map (Cols E:F, rows 140..170)
    for (let r = 135; r < Math.min(ddRows.length, 180); r++) {
      const row = ddRows[r] || []
      const k = String(row[4] ?? '').trim()
      const v = String(row[5] ?? '').trim()
      if (k.startsWith('SFv') && v) {
        firewallVirtualMap[k] = v
      }
    }

    // 4d. Universal Calculator Hierarchy: Col H (Families), Col J (Family -> Lines), Col L+ (Line -> Products)
    for (let r = 1; r < Math.min(ddRows.length, 40); r++) {
      const fam = String(ddRows[r]?.[7] ?? '').trim()
      if (fam && !fam.toLowerCase().startsWith('please_select')) {
        families.push(fam)
      }
    }
    const familySet = new Set(families)

    // Quét các khối trong Col J (col 9) để lấy Family -> Product Lines
    let curFam = ''
    for (let r = 1; r < Math.min(ddRows.length, 300); r++) {
      const cell = String(ddRows[r]?.[9] ?? '').trim()
      if (!cell || cell.toLowerCase().startsWith('please_select')) {
        curFam = ''
        continue
      }
      if (!curFam && familySet.has(cell)) {
        curFam = cell
        if (!linesByFamily[curFam]) linesByFamily[curFam] = []
      } else if (curFam) {
        linesByFamily[curFam].push(cell)
      }
    }

    // Tập hợp tất cả tên Product Line
    const allLineSet = new Set<string>()
    Object.values(linesByFamily).forEach(arr => arr.forEach(l => allLineSet.add(l)))

    // Quét các cột từ Col L (col 11) sang phải để lấy Product Line -> Products
    let maxCatCol = 12
    for (let r = 0; r < Math.min(ddRows.length, 50); r++) {
      if (ddRows[r] && ddRows[r].length > maxCatCol) {
        maxCatCol = Math.min(ddRows[r].length, 60)
      }
    }
    for (let c = 11; c < maxCatCol; c++) {
      let curLine = ''
      for (let r = 1; r < ddRows.length; r++) {
        const cell = String(ddRows[r]?.[c] ?? '').trim()
        if (!cell || cell.toLowerCase().startsWith('please_select')) {
          curLine = ''
          continue
        }
        if (!curLine && allLineSet.has(cell)) {
          curLine = cell
          if (!productsByLine[curLine]) productsByLine[curLine] = []
        } else if (curLine) {
          if (allLineSet.has(cell) && !prodDescSet.has(cell)) {
            curLine = cell
            if (!productsByLine[curLine]) productsByLine[curLine] = []
          } else {
            productsByLine[curLine].push(cell)
          }
        }
      }
    }
  }

  if (!terms.length) {
    for (let m = 1; m <= 60; m++) {
      terms.push({ label: `${m} MOS`, code: String(m).padStart(2, '0'), months: m })
    }
  }
  if (!volBandTables.Z) {
    volBandTables.Z = [[1, 9999999, 'ZZ']]
  }

  // 5. Đọc động danh sách Model Groups & Licensing Notes trên sheet Firewall
  const firewallModelGroups: SophosFirewallModelGroup[] = []
  let firewallLicensingNotes = ''
  if (wb.Sheets['Firewall']) {
    const fwRows = XLSX.utils.sheet_to_json(wb.Sheets['Firewall'], { header: 1, defval: null }) as any[][]
    for (let r = 4; r < Math.min(fwRows.length, 18); r++) {
      const row = fwRows[r] || []
      const grpTitle = String(row[7] ?? '').trim()
      if (!grpTitle || !/models/i.test(grpTitle)) continue
      const models: string[] = []
      for (let c = 9; c < Math.min(row.length, 40); c++) {
        const mVal = String(row[c] ?? '').trim()
        if (mVal && (/^(XGS?|SFv)\b/i.test(mVal) || mVal.length >= 4)) {
          models.push(mVal)
        }
      }
      if (models.length) {
        firewallModelGroups.push({ group: grpTitle, models })
      }
    }

    for (let r = 55; r < Math.min(fwRows.length, 85); r++) {
      const row = fwRows[r] || []
      for (let c = 0; c < Math.min(row.length, 15); c++) {
        const txt = String(row[c] ?? '').trim()
        if (txt.length > 80 && /bundle|subscription|firewall|licens/i.test(txt)) {
          firewallLicensingNotes = txt
          break
        }
      }
      if (firewallLicensingNotes) break
    }
  }

  return {
    products,
    featuresByProduct,
    dropDowns: {
      defaultPartnerLevel,
      partnerLevels,
      sectors,
      dealTypes,
      terms,
      firewallBundleTerms,
      powerSockets: ['AU', 'EU', 'UK', 'US', 'CN', 'IN', 'JP', 'KR'],
      volBandTables,
      specialAttrSingleSet: Array.from(specialAttrSingleSet),
      specialAttrTables,
      oldSkuByNewSku,
      newSkuByOldSku,
      firewallVirtualMap,
      firewallModelGroups,
      firewallLicensingNotes,
      universalCatalog: {
        families,
        linesByFamily,
        productsByLine
      }
    }
  }
}

/**
 * Hydrate dữ liệu Engine trên RAM để tra cứu O(1)
 */
export function hydrateSophosEngineRuntime(engineCompact: SophosCalcEngineCompact | null | undefined) {
  if (!engineCompact || typeof engineCompact !== 'object') return null

  const product2List: SophosProduct2Item[] = []
  const descToProduct: Record<string, SophosProduct2Item> = {}
  const descLowerToProduct: Record<string, SophosProduct2Item> = {}
  const pcToProduct: Record<string, SophosProduct2Item> = {}
  const partIdToProducts: Record<string, SophosProduct2Item[]> = {}

  const rawProds = Array.isArray(engineCompact.products) ? engineCompact.products : []
  for (const t of rawProds) {
    if (!Array.isArray(t)) continue
    const item: SophosProduct2Item = {
      desc: String(t[0] || ''),
      pc: String(t[1] || ''),
      partId: String(t[2] || '').toUpperCase(),
      fwFilter: String(t[3] || ''),
      prodType: String(t[4] || ''),
      termed: t[5],
      volScheme: String(t[6] || 'Z').toUpperCase(),
      txEnabled: Boolean(t[7]),
      sectorEnabled: Boolean(t[8]),
      specAttrRule: String(t[9] || 'AA'),
      eolMonths: typeof t[10] === 'number' ? t[10] : null
    }
    product2List.push(item)
    if (item.desc) {
      descToProduct[item.desc] = item
      descLowerToProduct[item.desc.toLowerCase()] = item
    }
    if (item.pc) {
      pcToProduct[item.pc.toUpperCase()] = item
    }
    if (item.partId) {
      if (!partIdToProducts[item.partId]) partIdToProducts[item.partId] = []
      partIdToProducts[item.partId].push(item)
    }
  }

  // Bản đồ ngược Product -> { family, productLine }
  const productToHierarchy: Record<string, { family: string; productLine: string }> = {}
  const cat = engineCompact.dropDowns?.universalCatalog
  if (cat) {
    for (const fam of cat.families || []) {
      const lines = cat.linesByFamily?.[fam] || []
      for (const ln of lines) {
        const prods = cat.productsByLine?.[ln] || []
        for (const p of prods) {
          if (!productToHierarchy[p]) {
            productToHierarchy[p] = { family: fam, productLine: ln }
          }
        }
      }
    }
  }

  return {
    product2List,
    descToProduct,
    descLowerToProduct,
    pcToProduct,
    partIdToProducts,
    productToHierarchy,
    featuresByProduct: engineCompact.featuresByProduct || {},
    dropDowns: engineCompact.dropDowns
  }
}

export function resolvePartnerUnitCost(
  skuEntry: any,
  partnerLevel: string,
  dealType: string
): number | null {
  if (!skuEntry) return null
  const pl = String(partnerLevel || 'Authorized').toLowerCase()
  const dt = String(dealType || 'New - Standard').toLowerCase()

  let tier: 'std' | 'reg' | 'inc' = 'std'
  if (dt.includes('registered')) tier = 'reg'
  else if (dt.includes('renewal') || dt.includes('incumbent')) tier = 'inc'

  let suffix = 'Auth'
  if (pl.includes('silver')) suffix = 'Silv'
  else if (pl.includes('gold')) suffix = 'Gold'
  else if (pl.includes('platinum') || pl.includes('titanium')) suffix = 'Plat'
  else if (pl.includes('select')) suffix = 'Sel'

  const primaryVal = skuEntry[`${tier}${suffix}`]
  if (primaryVal !== null && primaryVal !== undefined && Number.isFinite(Number(primaryVal))) {
    return Number(primaryVal)
  }
  const stdFallback = skuEntry[`std${suffix}`]
  if (stdFallback !== null && stdFallback !== undefined && Number.isFinite(Number(stdFallback))) {
    return Number(stdFallback)
  }
  if (skuEntry.stdAuth !== null && skuEntry.stdAuth !== undefined && Number.isFinite(Number(skuEntry.stdAuth))) {
    return Number(skuEntry.stdAuth)
  }
  return null
}

function resolveTermDigits(termed: boolean | string, selectedTerm: string): { code: string; fixedLabel: string; isTermed: boolean } {
  if (termed === false) {
    return { code: '00', fixedLabel: 'Perpetual / One-time (00)', isTermed: false }
  }
  if (typeof termed === 'string' && /^fixed_(\d+)/i.test(termed)) {
    const m = termed.match(/^fixed_(\d+)/i)
    const code = (m ? m[1] : '12').padStart(2, '0')
    return { code, fixedLabel: `${ parseInt(code, 10) } MOS (Cố định)`, isTermed: true }
  }
  const clean = String(selectedTerm || '12 MOS').trim().toUpperCase()
  if (/^1-YEAR$/i.test(clean)) return { code: '12', fixedLabel: '', isTermed: true }
  if (/^2-YEAR$/i.test(clean)) return { code: '24', fixedLabel: '', isTermed: true }
  if (/^3-YEAR$/i.test(clean)) return { code: '36', fixedLabel: '', isTermed: true }
  if (/^5-YEAR$/i.test(clean)) return { code: '60', fixedLabel: '', isTermed: true }
  const numMatch = clean.match(/(\d+)/)
  const months = numMatch ? Math.max(1, Math.min(60, parseInt(numMatch[1], 10))) : 12
  return { code: String(months).padStart(2, '0'), fixedLabel: '', isTermed: true }
}

function resolveVolumeBandCode(
  volScheme: string,
  qty: number,
  volBandTables: Record<string, [number, number, string][]>
): { bandCode: string; min: number | null; max: number | null; minWarning: string } {
  const scheme = String(volScheme || 'Z').trim().toUpperCase()
  if (scheme === 'Z' || !volBandTables[scheme] || !volBandTables[scheme].length) {
    return { bandCode: 'ZZ', min: 1, max: 9999999, minWarning: '' }
  }
  const q = Math.max(1, Number(qty) || 1)
  const table = volBandTables[scheme]
  const sorted = [...table].sort((a, b) => a[0] - b[0])
  const lowest = sorted[0]
  if (lowest && q < lowest[0]) {
    return {
      bandCode: lowest[2],
      min: lowest[0],
      max: lowest[1],
      minWarning: `Số lượng tối thiểu của gói này là ${lowest[0]} license`
    }
  }
  for (const [min, max, code] of sorted) {
    if (q >= min && q <= max) {
      return { bandCode: code, min, max, minWarning: '' }
    }
  }
  const highest = sorted[sorted.length - 1]
  return {
    bandCode: highest ? highest[2] : 'ZZ',
    min: highest ? highest[0] : 1,
    max: highest ? highest[1] : 9999999,
    minWarning: ''
  }
}

export function getSpecialAttributeOptionsForProduct(
  prod: SophosProduct2Item | null | undefined,
  dd: SophosDropDownsMeta | null | undefined
): { label: string; code: string }[] {
  if (!prod) return [{ label: 'Standard Pricing (AA)', code: 'AA' }]
  const rule = String(prod.specAttrRule || 'AA').trim()
  const singleList = dd?.specialAttrSingleSet || []
  if (rule !== 'CU' && singleList.includes(rule)) {
    return [{ label: `${rule} (Mặc định)`, code: rule }]
  }
  if (rule === 'X1_' || rule === 'X2_' || rule === 'X3_') {
    const map = dd?.specialAttrTables?.[rule] || { AU: 'AU', EU: 'EU', UK: 'UK', US: 'US', CN: 'CN', IN: 'IN', JP: 'JP' }
    return Object.entries(map).map(([plug, code]) => ({
      label: plug === code ? plug : `${plug} (→ ${code})`,
      code
    }))
  }
  // Multi-select (Standard Pricing / Competitive Upgrade)
  return [
    { label: 'Standard Pricing', code: 'AA' },
    { label: 'Competitive Upgrade', code: 'CU' }
  ]
}

function resolveSpecialAttrCode(
  prod: SophosProduct2Item,
  selectedSpecAttr: string,
  dd: SophosDropDownsMeta
): string {
  const rule = String(prod.specAttrRule || 'AA').trim()
  if (rule !== 'CU' && dd.specialAttrSingleSet.includes(rule)) {
    return rule
  }
  const rawSel = String(selectedSpecAttr || '').trim()
  const upperSel = rawSel.toUpperCase()

  if (rule === 'X1_' || rule === 'X2_' || rule === 'X3_') {
    const tbl = dd.specialAttrTables[rule] || {}
    if (tbl[upperSel]) return tbl[upperSel]
    // Nếu truyền trực tiếp mã đích (VD: EK, ES, AN)
    if (Object.values(tbl).includes(upperSel)) return upperSel
    return tbl.AU || Object.values(tbl)[0] || 'AU'
  }

  if (/competitive|^cu$/i.test(rawSel)) return 'CU'
  if (upperSel.length === 2 && /^[A-Z0-9]{2}$/.test(upperSel) && !['AU', 'EU', 'UK', 'US', 'CN', 'IN', 'JP', 'KR'].includes(upperSel)) {
    return upperSel
  }
  return 'AA'
}

function computeProductPricingFromRule(
  calcData: any,
  prod: SophosProduct2Item,
  opts: {
    partnerLevel: string
    sector: string
    dealType: string
    term: string
    qty: number
    specialAttribute: string
    promoDiscPct: number
    specialDiscPct: number
  }
) {
  const runtime = calcData?.engineRuntime
  const dd: SophosDropDownsMeta = runtime?.dropDowns
  const calcSkus = calcData?.calcSkus || {}

  const qty = Math.max(1, Math.round(Number(opts.qty) || 1))
  const termInfo = resolveTermDigits(prod.termed, opts.term)
  const bandInfo = resolveVolumeBandCode(prod.volScheme, qty, dd?.volBandTables || {})
  const specCode = resolveSpecialAttrCode(prod, opts.specialAttribute, dd)

  let txCode = 'P'
  if (prod.txEnabled) {
    if (specCode === 'CU') {
      txCode = 'N'
    } else {
      txCode = /renewal|incumbent/i.test(opts.dealType) ? 'R' : 'N'
    }
  }

  let sectorCode = 'C'
  if (prod.sectorEnabled) {
    const sLower = String(opts.sector || 'Corporate').toLowerCase()
    if (sLower.startsWith('edu') || sLower === 'e') sectorCode = 'E'
    else if (sLower.startsWith('gov') || sLower === 'g') sectorCode = 'G'
    else sectorCode = 'C'
  }

  const newSku = `${prod.partId}${termInfo.code}${bandInfo.bandCode}${txCode}${sectorCode}${specCode}`.toUpperCase()
  const mappedOldSku = dd?.oldSkuByNewSku?.[newSku]
  let finalSku = newSku
  let skuEntry = calcSkus[newSku] || null

  if (mappedOldSku && calcSkus[mappedOldSku]) {
    finalSku = mappedOldSku
    skuEntry = calcSkus[mappedOldSku]
  } else if (!skuEntry && mappedOldSku) {
    finalSku = mappedOldSku
  }

  const promoDiscPct = Math.max(0, Math.min(100, Number(opts.promoDiscPct) || 0))
  const specialDiscPct = Math.max(0, Math.min(100, Number(opts.specialDiscPct) || 0))

  if (!skuEntry) {
    return {
      newSku,
      sku: finalSku,
      available: false,
      unitMsrp: 0,
      msrp: 0,
      unitResellerCost: null,
      resellerDiscPct: 0,
      promoDiscPct,
      specialDiscPct,
      buyCost: 0,
      bandInfo,
      termInfo,
      calcRowNum: null
    }
  }

  const isLegacyFlat = prod.desc === 'Sophos Endpoint for Legacy Platforms'
  const rawUnitMsrp = Number(skuEntry.msrp) || 0
  const msrp = isLegacyFlat ? round2(rawUnitMsrp) : round2(rawUnitMsrp * qty)
  const unitMsrp = qty > 0 ? round2(msrp / qty) : rawUnitMsrp

  const unitResellerCost = resolvePartnerUnitCost(skuEntry, opts.partnerLevel, opts.dealType)
  let resellerDiscRatio = 0
  let resellerDiscPct = 0
  let buyCost = msrp

  if (unitResellerCost !== null && rawUnitMsrp > 0) {
    resellerDiscRatio = Math.max(0, 1 - unitResellerCost / rawUnitMsrp)
    resellerDiscPct = Math.round(resellerDiscRatio * 10000) / 100
    if (promoDiscPct === 0 && specialDiscPct === 0) {
      buyCost = isLegacyFlat ? round2(unitResellerCost) : round2(unitResellerCost * qty)
    } else {
      buyCost = round2(msrp * (1 - resellerDiscRatio) * (1 - promoDiscPct / 100) * (1 - specialDiscPct / 100))
    }
  }

  return {
    newSku,
    sku: finalSku,
    available: true,
    unitMsrp,
    msrp,
    unitResellerCost,
    resellerDiscPct,
    promoDiscPct,
    specialDiscPct,
    buyCost,
    bandInfo,
    termInfo,
    calcRowNum: skuEntry.rowNum || null
  }
}

/**
 * Tính toán trực tiếp 1 Scenario sản phẩm bất kỳ (giống Universal Calculator, Endpoint & Server, MDR, Email, Workspace...)
 */
export function evaluateProductCalculator(
  calcData: any,
  scenario: SophosProductCalcScenario
): SophosProductEvalResult {
  const runtime = calcData?.engineRuntime
  const prodName = String(scenario.product || '').trim()
  const prod: SophosProduct2Item | null =
    runtime?.descToProduct?.[prodName] ||
    runtime?.descLowerToProduct?.[prodName.toLowerCase()] ||
    null

  if (!prod || !runtime) {
    return {
      foundProduct: false,
      productDesc: prodName,
      productCode: '',
      prodType: '',
      sku: '',
      newSku: '',
      available: false,
      unitMsrp: 0,
      msrp: 0,
      unitResellerCost: null,
      resellerDiscPct: 0,
      promoDiscPct: Number(scenario.promoDiscPct) || 0,
      specialDiscPct: Number(scenario.specialDiscPct) || 0,
      buyCost: 0,
      bandCode: 'ZZ',
      bandMin: null,
      bandMax: null,
      minQtyWarning: '',
      isTermed: true,
      fixedTermLabel: '',
      specialAttrOptions: [{ label: 'Standard Pricing', code: 'AA' }],
      features: '',
      calcRowNum: null,
      eolMonths: null
    }
  }

  const calc = computeProductPricingFromRule(calcData, prod, {
    partnerLevel: scenario.partnerLevel || runtime.dropDowns?.defaultPartnerLevel || 'Authorized',
    sector: scenario.sector || 'Corporate',
    dealType: scenario.dealType || 'New - Standard',
    term: scenario.term || '12 MOS',
    qty: Number(scenario.qty) || 1,
    specialAttribute: scenario.specialAttribute || 'AA',
    promoDiscPct: Number(scenario.promoDiscPct) || 0,
    specialDiscPct: Number(scenario.specialDiscPct) || 0
  })

  return {
    foundProduct: true,
    productDesc: prod.desc,
    productCode: prod.pc,
    prodType: prod.prodType,
    sku: calc.sku,
    newSku: calc.newSku,
    available: calc.available,
    unitMsrp: calc.unitMsrp,
    msrp: calc.msrp,
    unitResellerCost: calc.unitResellerCost,
    resellerDiscPct: calc.resellerDiscPct,
    promoDiscPct: calc.promoDiscPct,
    specialDiscPct: calc.specialDiscPct,
    buyCost: calc.buyCost,
    bandCode: calc.bandInfo.bandCode,
    bandMin: calc.bandInfo.min,
    bandMax: calc.bandInfo.max,
    minQtyWarning: calc.bandInfo.minWarning,
    isTermed: calc.termInfo.isTermed,
    fixedTermLabel: calc.termInfo.fixedLabel,
    specialAttrOptions: getSpecialAttributeOptionsForProduct(prod, runtime.dropDowns),
    features: runtime.featuresByProduct?.[prod.desc] || '',
    calcRowNum: calc.calcRowNum,
    eolMonths: prod.eolMonths
  }
}

export const FIREWALL_ROW_SPECS: {
  key: string
  category: 'Hardware Bundles' | 'Subscriptions'
  defaultLabel: string
  defaultSheetRow: number
}[] = [
  { key: 'std_bundle', category: 'Hardware Bundles', defaultLabel: 'Standard Hardware Bundle', defaultSheetRow: 25 },
  { key: 'xstream_bundle', category: 'Hardware Bundles', defaultLabel: 'Xstream Hardware Bundle', defaultSheetRow: 27 },
  { key: 'hw_appliance', category: 'Hardware Bundles', defaultLabel: 'Hardware Appliance', defaultSheetRow: 29 },
  { key: 'xstream_prot', category: 'Subscriptions', defaultLabel: 'Xstream Protection', defaultSheetRow: 33 },
  { key: 'xstream_plus', category: 'Subscriptions', defaultLabel: 'Xstream Plus', defaultSheetRow: 35 },
  { key: 'std_prot', category: 'Subscriptions', defaultLabel: 'Standard Protection', defaultSheetRow: 37 },
  { key: 'enhanced_sup', category: 'Subscriptions', defaultLabel: 'Enhanced Protection', defaultSheetRow: 39 },
  { key: 'enhanced_plus_upg', category: 'Subscriptions', defaultLabel: 'Enhanced to Enhanced Plus Upgrade', defaultSheetRow: 41 },
  { key: 'net_prot', category: 'Subscriptions', defaultLabel: 'Network Protection', defaultSheetRow: 43 },
  { key: 'web_prot', category: 'Subscriptions', defaultLabel: 'Web Protection', defaultSheetRow: 45 },
  { key: 'zeroday_prot', category: 'Subscriptions', defaultLabel: 'Zero-Day Protection', defaultSheetRow: 47 },
  { key: 'central_orch', category: 'Subscriptions', defaultLabel: 'Central Orchestration', defaultSheetRow: 49 },
  { key: 'email_prot', category: 'Subscriptions', defaultLabel: 'Email Protection', defaultSheetRow: 51 },
  { key: 'webserver_prot', category: 'Subscriptions', defaultLabel: 'Webserver Protection', defaultSheetRow: 53 },
  { key: 'cfr_adv', category: 'Subscriptions', defaultLabel: 'Central Firewall Reporting Advanced', defaultSheetRow: 55 }
]

function resolveFirewallBundleYearSuffix(termHwBundle: string): { code: string; suffix: string } | null {
  const clean = String(termHwBundle || '').trim().toLowerCase()
  if (!clean || clean === 'none' || clean === 'không chọn') return null
  if (clean.includes('1-year') || clean.includes('1 year') || clean === '12 mos' || clean === '12') {
    return { code: '12', suffix: '1-year' }
  }
  if (clean.includes('3-year') || clean.includes('3 year') || clean === '36 mos' || clean === '36') {
    return { code: '36', suffix: '3-year' }
  }
  if (clean.includes('5-year') || clean.includes('5 year') || clean === '60 mos' || clean === '60') {
    return { code: '60', suffix: '5-year' }
  }
  if (clean.includes('2-year') || clean.includes('2 year') || clean === '24 mos' || clean === '24') {
    return { code: '24', suffix: '2-year' }
  }
  return { code: '12', suffix: '1-year' }
}

function findFirewallProductForRow(
  runtime: any,
  model: string,
  rowKey: string,
  bundleSuffix: string | null
): SophosProduct2Item | null {
  if (!runtime || !model) return null
  const m = String(model).trim()
  const isVirtual = /^sfv\b/i.test(m)
  const baseModel = m.replace(/w$/i, '')
  const byDesc = runtime.descLowerToProduct || {}
  const pList: SophosProduct2Item[] = runtime.product2List || []

  const tryExact = (candidates: string[]) => {
    for (const c of candidates) {
      const hit = byDesc[c.toLowerCase()]
      if (hit) return hit
    }
    return null
  }

  if (rowKey === 'cfr_adv') {
    return tryExact(['Central Firewall Reporting Advanced'])
  }

  if (rowKey === 'hw_appliance') {
    if (isVirtual) return null
    return tryExact([`${m} Security Appliance`, `${baseModel} Security Appliance`])
  }

  if (rowKey === 'std_bundle' || rowKey === 'xstream_bundle') {
    if (!bundleSuffix) return null
    const tierName = rowKey === 'std_bundle' ? 'Standard Protection' : 'Xstream Protection'
    if (isVirtual) {
      const virtDesc = runtime.dropDowns?.firewallVirtualMap?.[m] || ''
      const normTarget = normalizeVirtKey(virtDesc)
      return (
        pList.find(p => {
          const dl = p.desc.toLowerCase()
          if (!dl.includes('sf sw/virtual') || !dl.includes(tierName.toLowerCase()) || !dl.endsWith(bundleSuffix.toLowerCase())) {
            return false
          }
          return p.fwFilter.toLowerCase() === m.toLowerCase() || (normTarget && normalizeVirtKey(p.desc).includes(normTarget))
        }) || null
      )
    }
    return tryExact([
      `${m} with ${tierName}, ${bundleSuffix}`,
      `${baseModel} with ${tierName}, ${bundleSuffix}`
    ])
  }

  // Subscription rows
  const subSuffixMap: Record<string, string[]> = {
    xstream_prot: ['Xstream Protection'],
    xstream_plus: ['Xstream Plus'],
    std_prot: ['Standard Protection'],
    enhanced_sup: ['Enhanced Support', 'Enhanced Protection'],
    enhanced_plus_upg: ['Enhanced to Enhanced Plus Support Upgrade', 'Enhanced to Enhanced Plus Upgrade'],
    net_prot: ['Network Protection'],
    web_prot: ['Web Protection'],
    zeroday_prot: ['Zero-Day Protection'],
    central_orch: ['Central Orchestration'],
    email_prot: ['Email Protection'],
    webserver_prot: ['Webserver Protection']
  }

  const suffixes = subSuffixMap[rowKey] || []
  if (!isVirtual) {
    const candidates: string[] = []
    for (const sf of suffixes) {
      candidates.push(`${m} ${sf}`, `${baseModel} ${sf}`)
    }
    return tryExact(candidates)
  }

  // Virtual model subscriptions (match via fwFilter === m hoặc virtDesc)
  const virtDesc = runtime.dropDowns?.firewallVirtualMap?.[m] || ''
  const normTarget = normalizeVirtKey(virtDesc)
  for (const sf of suffixes) {
    const sfLower = sf.toLowerCase()
    const hit = pList.find(p => {
      if (p.prodType !== 'Subscription') return false
      const dl = p.desc.toLowerCase()
      if (dl.includes('with ')) return false
      const filterMatch =
        p.fwFilter.toLowerCase() === m.toLowerCase() ||
        (normTarget && normalizeVirtKey(p.desc).includes(normTarget))
      if (!filterMatch) return false
      if (rowKey === 'enhanced_sup' && dl.includes('plus')) return false
      if (rowKey === 'web_prot' && dl.includes('webserver')) return false
      return dl.includes(sfLower)
    })
    if (hit) return hit
  }
  return null
}

/**
 * Đánh giá toàn bộ Sheet Firewall (15 hạng mục x tối đa 3 Model song song) y hệt công thức trong calculate_sophos.xlsx
 */
export function evaluateFirewallCalculator(
  calcData: any,
  settings: SophosFirewallCalcSettings
): {
  rows: SophosFirewallEvalRow[]
  modelFeatures: Record<string, string>
  licensingNotes: string
} {
  const runtime = calcData?.engineRuntime
  const fwSheetRows: any[][] = calcData?.calcSheetsRaw?.['Firewall'] || []
  const activeModels = (settings.models || []).map(m => String(m || '').trim()).filter(Boolean).slice(0, 3)
  if (!activeModels.length) activeModels.push('XGS 2300')

  const bundleInfo = resolveFirewallBundleYearSuffix(settings.termHwBundle)
  const partnerLevel = settings.partnerLevel || runtime?.dropDowns?.defaultPartnerLevel || 'Authorized'
  const sector = settings.sector || 'Corporate'
  const dealType = settings.dealType || 'New - Standard'
  const termSub = settings.termSubscription || '12 MOS'
  const qty = Math.max(1, Math.round(Number(settings.qty) || 1))
  const specAttr = settings.specialAttribute || 'AU'

  const findDynamicRow = (specKey: string, fallback: number): { rowNum: number; label: string } => {
    const spec = FIREWALL_ROW_SPECS.find(s => s.key === specKey)!
    if (!fwSheetRows.length) return { rowNum: fallback, label: spec.defaultLabel }
    for (let rIdx = 20; rIdx < Math.min(fwSheetRows.length, 65); rIdx++) {
      const row = fwSheetRows[rIdx] || []
      const rawLbl = String(row[2] || row[1] || '').trim()
      if (!rawLbl) continue
      const l = rawLbl.toLowerCase()
      const matched =
        (specKey === 'std_bundle' && l.includes('standard hardware bundle')) ||
        (specKey === 'xstream_bundle' && l.includes('xstream hardware bundle')) ||
        (specKey === 'hw_appliance' && l.includes('hardware appliance')) ||
        (specKey === 'xstream_prot' && (l.includes('xstream protection') || l.includes('xtsream protection')) && !l.includes('bundle')) ||
        (specKey === 'xstream_plus' && l.includes('xstream plus')) ||
        (specKey === 'std_prot' && l.includes('standard protection') && !l.includes('bundle')) ||
        (specKey === 'enhanced_sup' && (l.includes('enhanced protection') || l.includes('enhanced support')) && !l.includes('plus')) ||
        (specKey === 'enhanced_plus_upg' && (l.includes('enhanced to enhanced plus') || l.includes('plus upgrade'))) ||
        (specKey === 'net_prot' && l.includes('network protection')) ||
        (specKey === 'web_prot' && l.includes('web protection') && !l.includes('webserver')) ||
        (specKey === 'zeroday_prot' && l.includes('zero-day')) ||
        (specKey === 'central_orch' && (l.includes('orchestration') || l.includes('orchestation'))) ||
        (specKey === 'email_prot' && l.includes('email protection')) ||
        (specKey === 'webserver_prot' && l.includes('webserver protection')) ||
        (specKey === 'cfr_adv' && l.includes('central firewall reporting'))
      if (matched) {
        return { rowNum: rIdx + 1, label: rawLbl }
      }
    }
    return { rowNum: fallback, label: spec.defaultLabel }
  }

  const rows: SophosFirewallEvalRow[] = []
  for (const spec of FIREWALL_ROW_SPECS) {
    const { rowNum, label } = findDynamicRow(spec.key, spec.defaultSheetRow)
    const promoDiscPct = Number(settings.promoDiscByRow?.[spec.key]) || 0
    const specialDiscPct = Number(settings.specialDiscByRow?.[spec.key]) || 0
    const cells: SophosFirewallEvalCell[] = []

    for (const mdl of activeModels) {
      if ((spec.key === 'std_bundle' || spec.key === 'xstream_bundle') && !bundleInfo) {
        cells.push({
          model: mdl,
          productDesc: '',
          productCode: '',
          sku: '',
          newSku: '',
          available: false,
          unitMsrp: 0,
          msrp: 0,
          unitResellerCost: null,
          resellerDiscPct: 0,
          promoDiscPct,
          specialDiscPct,
          buyCost: 0,
          calcRowNum: null,
          eolMonths: null,
          note: 'Chọn Term (HW Bundles) để tính Bundle'
        })
        continue
      }

      const prod = findFirewallProductForRow(runtime, mdl, spec.key, bundleInfo?.suffix || null)
      if (!prod) {
        cells.push({
          model: mdl,
          productDesc: '',
          productCode: '',
          sku: 'Not Available',
          newSku: '',
          available: false,
          unitMsrp: 0,
          msrp: 0,
          unitResellerCost: null,
          resellerDiscPct: 0,
          promoDiscPct,
          specialDiscPct,
          buyCost: 0,
          calcRowNum: null,
          eolMonths: null,
          note: ''
        })
        continue
      }

      const effectiveTerm =
        spec.key === 'std_bundle' || spec.key === 'xstream_bundle'
          ? `${bundleInfo?.code || '12'} MOS`
          : termSub

      const res = computeProductPricingFromRule(calcData, prod, {
        partnerLevel,
        sector,
        dealType,
        term: effectiveTerm,
        qty,
        specialAttribute: specAttr,
        promoDiscPct,
        specialDiscPct
      })

      cells.push({
        model: mdl,
        productDesc: prod.desc,
        productCode: prod.pc,
        sku: res.available ? res.sku : 'Not Available',
        newSku: res.newSku,
        available: res.available,
        unitMsrp: res.unitMsrp,
        msrp: res.msrp,
        unitResellerCost: res.unitResellerCost,
        resellerDiscPct: res.resellerDiscPct,
        promoDiscPct,
        specialDiscPct,
        buyCost: res.buyCost,
        calcRowNum: res.calcRowNum,
        eolMonths: prod.eolMonths,
        note: prod.eolMonths ? `EOL: tối đa ${prod.eolMonths} tháng` : ''
      })
    }

    rows.push({
      key: spec.key,
      category: spec.category,
      label,
      sheetRowNum: rowNum,
      cells
    })
  }

  const modelFeatures: Record<string, string> = {}
  for (const mdl of activeModels) {
    const featMap = runtime?.featuresByProduct || {}
    modelFeatures[mdl] =
      featMap[mdl] ||
      featMap[`${mdl} Security Appliance`] ||
      featMap[mdl.replace(/w$/i, '')] ||
      ''
  }

  return {
    rows,
    modelFeatures,
    licensingNotes: runtime?.dropDowns?.firewallLicensingNotes || ''
  }
}

function mapProductToNativeSheet(
  prod: SophosProduct2Item | null,
  family: string,
  productLine: string
): string {
  const fam = String(family || '')
  const ln = String(productLine || '')
  const desc = String(prod?.desc || '')

  if (fam === 'Endpoint_Security') {
    if (ln === 'Mobile' || /mobile/i.test(desc)) return 'Mobile'
    return 'Endpoint & Server'
  }
  if (fam === 'Workspace__Protection' || /workspace/i.test(desc)) return 'Workspace Protection'
  if (fam === 'Email_Security' || /sophos email|phish threat|dmarc/i.test(desc)) return 'Email'
  if (fam === 'Backup_and_Recovery' || /backup/i.test(desc)) return 'Backup & Recovery'
  if (fam === 'Identity_Security' || /\bitdr\b|identity threat/i.test(desc)) return 'ITDR'
  if (fam === 'Network_Detection_and_Response' || /\bndr\b|network detection/i.test(desc)) return 'Network Detection & Response'
  if (['Switches', 'Access_Points', 'SD_WAN', 'Modules_and_Transceivers', 'Accessories'].includes(fam)) {
    return 'Network Infrastructure'
  }
  if (fam === 'Advisory_Services') return 'Advisory services'
  if (fam === 'ProServices_and_Training') return 'ProServices & Training'
  if (fam === 'Managed_Services') {
    if (/\bmdr\b/i.test(desc)) return 'MDR calculator'
    return 'Managed Services'
  }
  if (fam === 'Security_Operations') {
    if (/ai defense/i.test(desc)) return 'AI Defense'
    if (/ciso advantage/i.test(desc)) return 'CISO Advantage'
    if (/\bmdr\b/i.test(desc)) return 'MDR calculator'
    return 'XDR & Next-Gen SIEM'
  }
  return 'Universal Calculator'
}

function inferFirewallRowKeyFromProductOrName(desc: string, itemName: string, sku: string): string {
  const combined = `${desc || ''} ${itemName || ''}`.toLowerCase()
  const s = String(sku || '').toUpperCase()
  if (combined.includes('with standard protection') || combined.includes('standard hardware bundle')) return 'std_bundle'
  if (combined.includes('with xstream protection') || combined.includes('xstream hardware bundle')) return 'xstream_bundle'
  if (combined.includes('security appliance') || combined.includes('hardware appliance') || s.startsWith('XG')) return 'hw_appliance'
  if (combined.includes('xstream plus')) return 'xstream_plus'
  if ((combined.includes('xstream protection') || combined.includes('xtsream protection') || s.startsWith('XS')) && !combined.includes('with ')) return 'xstream_prot'
  if ((combined.includes('standard protection') || s.startsWith('SP')) && !combined.includes('with ')) return 'std_prot'
  if (combined.includes('enhanced to enhanced plus') || combined.includes('plus upgrade') || s.startsWith('UP')) return 'enhanced_plus_upg'
  if (combined.includes('enhanced support') || combined.includes('enhanced protection') || s.startsWith('SE')) return 'enhanced_sup'
  if (combined.includes('network protection') || s.startsWith('NS')) return 'net_prot'
  if ((combined.includes('web protection') && !combined.includes('webserver')) || s.startsWith('WS')) return 'web_prot'
  if (combined.includes('zero-day') || s.startsWith('ZD')) return 'zeroday_prot'
  if (combined.includes('orchestration') || combined.includes('orchestation') || s.startsWith('CO')) return 'central_orch'
  if (combined.includes('email protection') || s.startsWith('ES')) return 'email_prot'
  if (combined.includes('webserver protection') || s.startsWith('SS')) return 'webserver_prot'
  if (combined.includes('central firewall reporting') || s.startsWith('CFR')) return 'cfr_adv'
  return 'hw_appliance'
}

/**
 * Từ một mã SKU (14 ký tự mới hoặc OldSKU cũ) và/hoặc Card hàng hóa trong Database,
 * suy luận ngược đầy đủ ngữ cảnh Deal Settings + Model / Product đúng như khi người dùng chọn trong calculate_sophos.xlsx!
 */
export function inferSophosCalculatorContext(
  calcData: any,
  rawSku: string,
  item?: any
): SophosInferredCalcContext {
  const runtime = calcData?.engineRuntime
  const dd: SophosDropDownsMeta | undefined = runtime?.dropDowns
  const calcMap = calcData?.calcSkus || {}

  const partnerLevel = dd?.defaultPartnerLevel || 'Authorized'
  let sector = 'Corporate'
  let dealType = 'New - Standard'
  let termHwBundle = '1-Year'
  let termSubscription = '12 MOS'
  let qty = 1
  let specialAttribute = 'AU'

  let cleanSku = String(rawSku || '').trim().toUpperCase()
  if (cleanSku === 'CFRAAB12ZZCAA' && !calcMap[cleanSku] && calcMap['CFRAAB12BANCAA']) {
    cleanSku = 'CFRAAB12BANCAA'
  }

  // 1. Giải mã OldSKU -> NewSKU 14 ký tự nếu có
  const mappedNewSku = (cleanSku && dd?.newSkuByOldSku?.[cleanSku]) || (cleanSku.length === 14 ? cleanSku : '')

  // 2. Tìm Product2 tương ứng
  let matchedProd: SophosProduct2Item | null = null
  const skuEntry = cleanSku ? calcMap[cleanSku] : null
  if (skuEntry?.pc && runtime?.pcToProduct?.[String(skuEntry.pc).toUpperCase()]) {
    matchedProd = runtime.pcToProduct[String(skuEntry.pc).toUpperCase()]
  }
  if (!matchedProd && mappedNewSku.length === 14 && runtime?.partIdToProducts) {
    const partId = mappedNewSku.slice(0, 6)
    const candidates = runtime.partIdToProducts[partId] || []
    matchedProd = candidates[0] || null
  }

  // 3. Tách thông số Deal Settings từ chuỗi SKU 14 ký tự
  if (mappedNewSku.length === 14 && /^[A-Z0-9]{6}\d{2}[A-Z]{2}[A-Z]{2}[A-Z0-9]{2}$/.test(mappedNewSku)) {
    const tCode = mappedNewSku.slice(6, 8)
    const bCode = mappedNewSku.slice(8, 10)
    const txChar = mappedNewSku[10]
    const secChar = mappedNewSku[11]
    const specChars = mappedNewSku.slice(12, 14)

    const months = parseInt(tCode, 10)
    if (months > 0) {
      termSubscription = `${months} MOS`
      if (months === 12) termHwBundle = '1-Year'
      else if (months === 36) termHwBundle = '3-Year'
      else if (months === 60) termHwBundle = '5-Year'
    }

    if (txChar === 'R') dealType = 'Renewal'
    else dealType = 'New - Standard'

    if (secChar === 'E') sector = 'Education'
    else if (secChar === 'G') sector = 'Government'
    else sector = 'Corporate'

    if (specChars === 'EK' || specChars === 'ES') specialAttribute = 'EU'
    else if (specChars === 'AN') specialAttribute = 'AU'
    else if (specChars === 'CU') specialAttribute = 'Competitive Upgrade'
    else if (['AU', 'EU', 'UK', 'US', 'CN', 'IN', 'JP'].includes(specChars)) specialAttribute = specChars
    else specialAttribute = specChars

    if (bCode !== 'ZZ' && dd?.volBandTables) {
      const scheme = bCode[0]
      const tbl = dd.volBandTables[scheme] || []
      const hitBand = tbl.find(b => b[2] === bCode)
      if (hitBand) {
        qty = Math.max(1, hitBand[0])
      }
    }
  } else if (item) {
    // Suy luận thời hạn từ trường License_duration của Card nếu chưa có SKU 14 ký tự
    const durText = `${item.License_duration || ''} ${item.Ten_hang || ''}`
    const mMatch = durText.match(/(\d+)\s*month/i)
    const yMatch = durText.match(/(\d+)\s*(?:year|năm)/i)
    if (mMatch) termSubscription = `${parseInt(mMatch[1], 10)} MOS`
    else if (yMatch) termSubscription = `${parseInt(yMatch[1], 10) * 12} MOS`
  }

  // Nếu Card có thông tin volume cụ thể (VD: "15" hoặc "Band: 10-24"), lấy min nếu hợp lệ
  if (item?.volume) {
    const vMatch = String(item.volume).match(/(\d+)/)
    if (vMatch) {
      const parsedV = parseInt(vMatch[1], 10)
      if (parsedV >= 1 && parsedV > qty) qty = parsedV
    }
  }

  const combinedCardText = `${item?.Danh_muc || ''} ${item?.Ten_hang || ''} ${item?.Description || ''} ${matchedProd?.desc || ''}`
  const xgsMatch = combinedCardText.match(/\b(XGS?\s*\d{2,4}w?|SFv\s*(?:Unlimited|\d+C\d+))\b/i)

  // Kiểm tra tất cả model hợp lệ trong Firewall Model Groups để chuẩn hóa chữ hoa/thường (VD: XGS 108w, SFv 4C6)
  const allKnownFwModels: string[] = []
  for (const grp of dd?.firewallModelGroups || []) {
    for (const m of grp.models) allKnownFwModels.push(m)
  }

  let detectedFwModel = ''
  if (xgsMatch) {
    const rawM = xgsMatch[1].replace(/\b(XGS?)(\d)/i, '$1 $2').replace(/\s+/g, ' ').trim()
    const exactKnown = allKnownFwModels.find(km => km.toLowerCase() === rawM.toLowerCase())
    detectedFwModel = exactKnown || rawM.replace(/^xgs/i, 'XGS').replace(/^xg\b/i, 'XG').replace(/^sfv/i, 'SFv')
  } else if (matchedProd?.fwFilter) {
    const exactKnown = allKnownFwModels.find(km => km.toLowerCase() === matchedProd!.fwFilter.toLowerCase())
    if (exactKnown) detectedFwModel = exactKnown
  }

  const isCfrOnFirewall =
    matchedProd?.desc === 'Central Firewall Reporting Advanced' ||
    cleanSku.startsWith('CFR') ||
    /central firewall reporting/i.test(combinedCardText)

  if (detectedFwModel || isCfrOnFirewall) {
    const model = detectedFwModel || allKnownFwModels.find(m => m === 'XGS 2300') || allKnownFwModels[0] || 'XGS 2300'
    const rowKey = inferFirewallRowKeyFromProductOrName(matchedProd?.desc || '', item?.Ten_hang || '', cleanSku)
    if (rowKey === 'std_bundle' || rowKey === 'xstream_bundle') {
      const descLower = (matchedProd?.desc || '').toLowerCase()
      if (descLower.includes('3-year')) termHwBundle = '3-Year'
      else if (descLower.includes('5-year')) termHwBundle = '5-Year'
      else termHwBundle = '1-Year'
    }
    if (!['AU', 'EU', 'UK', 'US', 'CN', 'IN', 'JP'].includes(specialAttribute)) {
      specialAttribute = 'AU'
    }
    const evalPreview = evaluateFirewallCalculator(calcData, {
      partnerLevel,
      sector,
      dealType,
      termHwBundle,
      termSubscription,
      qty: 1,
      specialAttribute,
      models: [model]
    })
    const matchedRow = evalPreview.rows.find(r => r.key === rowKey)
    return {
      calcType: 'firewall',
      nativeSheet: 'Firewall',
      targetFirewallRowKey: rowKey,
      targetFirewallSheetRow: matchedRow?.sheetRowNum || 29,
      partnerLevel,
      sector,
      dealType,
      termHwBundle,
      termSubscription,
      qty: isCfrOnFirewall ? qty : 1,
      specialAttribute,
      model,
      models: [model],
      family: 'Firewall',
      productLine: '',
      product: matchedProd?.desc || ''
    }
  }

  // Trường hợp Non-Firewall Product (Endpoint, MDR, XDR, Switch, AP, Email, Mobile, Workspace...)
  if (!matchedProd && runtime?.product2List?.length && item) {
    const thLower = String(item.Ten_hang || '').trim().toLowerCase()
    const descLower = String(item.Description || '').trim().toLowerCase()
    matchedProd =
      runtime.descLowerToProduct?.[thLower] ||
      runtime.descLowerToProduct?.[descLower] ||
      runtime.product2List.find((p: SophosProduct2Item) => {
        const pl = p.desc.toLowerCase()
        return (thLower && pl.includes(thLower)) || (thLower && thLower.includes(pl))
      }) ||
      null
  }

  const fallbackProd =
    matchedProd ||
    runtime?.descToProduct?.['Sophos Endpoint - User'] ||
    runtime?.product2List?.[0] ||
    null

  const prodDesc = fallbackProd?.desc || ''
  const hier = (prodDesc && runtime?.productToHierarchy?.[prodDesc]) || {
    family: dd?.universalCatalog?.families?.[0] || 'Endpoint_Security',
    productLine: ''
  }
  const family = hier.family
  const productLine =
    hier.productLine ||
    dd?.universalCatalog?.linesByFamily?.[family]?.[0] ||
    ''
  const nativeSheet = mapProductToNativeSheet(fallbackProd, family, productLine)

  const specOpts = getSpecialAttributeOptionsForProduct(fallbackProd, dd)
  const validSpec = specOpts.some(o => o.code === specialAttribute || o.label === specialAttribute)
    ? specialAttribute
    : (specOpts[0]?.code || 'AA')

  return {
    calcType: 'product',
    nativeSheet,
    targetFirewallRowKey: '',
    targetFirewallSheetRow: null,
    partnerLevel,
    sector,
    dealType,
    termHwBundle,
    termSubscription,
    qty,
    specialAttribute: validSpec,
    model: 'XGS 2300',
    models: ['XGS 2300'],
    family,
    productLine,
    product: prodDesc
  }
}

/**
 * Điền trực tiếp các giá trị đã tính toán (Deal Settings, Model/Product, SKU, Unit MSRP, MSRP, Suggested Reseller Disc %, Buy Cost, Features)
 * vào đúng các ô tương ứng của bản sao mảng 2D trên BẤT KỲ sheet tính toán hiển thị nào của calculate_sophos.xlsx!
 */
export function overlayCalculatedSheetAoa(
  calcData: any,
  sheetName: string,
  baseRows: any[][],
  ctx: SophosInferredCalcContext
): { rows: any[][]; targetRow: number; targetColLetter: string } {
  const rows = (baseRows || []).map(r => (Array.isArray(r) ? [...r] : []))
  const ensureCell = (rIdx: number, cIdx: number, val: any) => {
    if (rIdx < 0 || cIdx < 0) return
    while (rows.length <= rIdx) rows.push([])
    if (!Array.isArray(rows[rIdx])) rows[rIdx] = []
    while (rows[rIdx].length <= cIdx) rows[rIdx].push(null)
    rows[rIdx][cIdx] = val
  }

  if (sheetName === 'Cover') {
    for (let r = 0; r < Math.min(rows.length, 8); r++) {
      for (let c = 0; c < (rows[r]?.length || 0); c++) {
        if (DEFAULT_PARTNER_LEVELS.includes(String(rows[r][c] ?? '').trim())) {
          ensureCell(r, c, ctx.partnerLevel || 'Authorized')
          return { rows, targetRow: r + 1, targetColLetter: XLSX.utils.encode_col(c) }
        }
      }
    }
    return { rows, targetRow: 3, targetColLetter: 'I' }
  }

  // Điền Sector & Deal Type ở dòng 4 (ngay dưới tiêu đề dòng 3 trên mọi sheet tính toán)
  for (let r = 0; r < Math.min(rows.length, 5); r++) {
    const row = rows[r] || []
    for (let c = 0; c < row.length; c++) {
      const txt = String(row[c] ?? '').trim().toLowerCase()
      if (txt.startsWith('sector')) {
        ensureCell(r + 1, c, ctx.sector || 'Corporate')
      } else if (txt.startsWith('deal type')) {
        ensureCell(r + 1, c, ctx.dealType || 'New - Standard')
      }
    }
  }

  // Trường hợp 1: Sheet Firewall
  if (sheetName === 'Firewall') {
    for (let r = 4; r < Math.min(rows.length, 18); r++) {
      const lbl = String(rows[r]?.[2] ?? rows[r]?.[1] ?? '').trim().toLowerCase()
      if (lbl.includes('term') && lbl.includes('bundle')) ensureCell(r, 3, ctx.termHwBundle || '1-Year')
      else if (lbl.includes('term') && lbl.includes('subscription')) ensureCell(r, 3, ctx.termSubscription || '12 MOS')
      else if (lbl === 'qty' || lbl === 'quantity') ensureCell(r, 3, ctx.qty || 1)
      else if (lbl.includes('special attribute')) ensureCell(r, 3, ctx.specialAttribute || 'AU')
    }

    const fwEval = evaluateFirewallCalculator(calcData, {
      partnerLevel: ctx.partnerLevel,
      sector: ctx.sector,
      dealType: ctx.dealType,
      termHwBundle: ctx.termHwBundle,
      termSubscription: ctx.termSubscription,
      qty: ctx.qty,
      specialAttribute: ctx.specialAttribute,
      models: ctx.models?.length ? ctx.models : [ctx.model || 'XGS 2300']
    })

    const modelColStarts = [7, 21, 35] // Cột H (Model 1), Cột V (Model 2), Cột AJ (Model 3)
    fwEval.rows[0]?.cells.forEach((cell, mIdx) => {
      const baseCol = modelColStarts[mIdx]
      if (baseCol !== undefined) {
        ensureCell(17, baseCol, cell.model) // Row 18: Model Header
        const feat = fwEval.modelFeatures[cell.model]
        if (feat && rows.length >= 57) {
          ensureCell(56, baseCol, feat)
        }
      }
    })

    let targetRow = ctx.targetFirewallSheetRow || 29
    for (const rEval of fwEval.rows) {
      const rIdx = rEval.sheetRowNum - 1
      rEval.cells.forEach((cEval, mIdx) => {
        const baseCol = modelColStarts[mIdx]
        if (baseCol === undefined) return
        ensureCell(rIdx, baseCol, cEval.sku || '')
        ensureCell(rIdx, baseCol + 2, cEval.available ? cEval.msrp : 'Not Available')
        ensureCell(rIdx, baseCol + 4, cEval.available ? `${cEval.resellerDiscPct}%` : '')
        ensureCell(rIdx, baseCol + 6, cEval.available ? `${cEval.promoDiscPct}%` : '')
        ensureCell(rIdx, baseCol + 8, cEval.available ? `${cEval.specialDiscPct}%` : '')
        ensureCell(rIdx, baseCol + 10, cEval.available ? cEval.buyCost : 0)
      })
      if (rEval.key === ctx.targetFirewallRowKey) {
        targetRow = rEval.sheetRowNum
      }
    }

    return { rows, targetRow, targetColLetter: 'H' }
  }

  // Trường hợp 2: Các Sheet Product Calculator dạng dọc (Universal Calculator, Endpoint & Server, Mobile, Email, Workspace Protection, XDR, AI Defense, CISO, ITDR, Backup & Recovery, Managed Services, ProServices, Network Infrastructure...)
  const prodEval = evaluateProductCalculator(calcData, {
    partnerLevel: ctx.partnerLevel,
    sector: ctx.sector,
    dealType: ctx.dealType,
    family: ctx.family,
    productLine: ctx.productLine,
    product: ctx.product,
    term: ctx.termSubscription,
    qty: ctx.qty,
    specialAttribute: ctx.specialAttribute
  })

  const valCol = sheetName === 'Network Infrastructure' ? 7 : 6 // Cột H trên Network Infrastructure, Cột G trên các sheet còn lại
  let skuRowNum = 0

  for (let r = 6; r < Math.min(rows.length, 40); r++) {
    const lbl = String(rows[r]?.[2] ?? rows[r]?.[1] ?? '').trim().toLowerCase()
    if (!lbl) continue
    if (lbl.startsWith('term') && !skuRowNum) {
      ensureCell(r, valCol, prodEval.isTermed ? (ctx.termSubscription || '12 MOS') : 'N/A (One-time)')
    } else if (lbl.startsWith('solution family') && !skuRowNum) {
      ensureCell(r, valCol, ctx.family)
    } else if (lbl.startsWith('product line') && !skuRowNum) {
      ensureCell(r, valCol, ctx.productLine)
    } else if (lbl.startsWith('product') && !lbl.includes('line') && !skuRowNum) {
      ensureCell(r, valCol, prodEval.productDesc || ctx.product)
    } else if ((lbl.startsWith('qty') || lbl.startsWith('quantity')) && !skuRowNum) {
      ensureCell(r, valCol, ctx.qty || 1)
    } else if (lbl.startsWith('special attribute') && !skuRowNum) {
      ensureCell(r, valCol, ctx.specialAttribute || 'AA')
    } else if (lbl === 'sku' && !skuRowNum) {
      skuRowNum = r + 1
      ensureCell(r, valCol, prodEval.available ? prodEval.sku : 'Not Available in this region')
      // Ghi tiêu đề sản phẩm lên dòng tiêu đề phía trên khối (nếu đang trống hoặc là "Product A1")
      if (sheetName !== 'Universal Calculator') {
        for (let up = r - 1; up >= Math.max(6, r - 10); up--) {
          const prevLbl = String(rows[up]?.[2] ?? rows[up]?.[1] ?? '').trim()
          if (!prevLbl && !rows[up]?.[valCol]) {
            ensureCell(up, valCol, prodEval.productDesc)
            break
          }
        }
      } else {
        ensureCell(11, valCol, prodEval.productDesc)
      }
    } else if (lbl === 'unit msrp' && skuRowNum && r < skuRowNum + 12) {
      ensureCell(r, valCol, prodEval.available ? prodEval.unitMsrp : 'Not Available')
    } else if (lbl === 'msrp' && skuRowNum && r < skuRowNum + 12) {
      ensureCell(r, valCol, prodEval.available ? prodEval.msrp : 'Not Available in this region')
    } else if (lbl.startsWith('promo disc') && skuRowNum && r < skuRowNum + 14) {
      ensureCell(r, valCol, `${prodEval.promoDiscPct}%`)
    } else if (lbl.startsWith('special disc') && skuRowNum && r < skuRowNum + 14) {
      ensureCell(r, valCol, `${prodEval.specialDiscPct}%`)
    } else if (lbl.startsWith('suggested reseller disc') && skuRowNum && r < skuRowNum + 16) {
      ensureCell(r, valCol, prodEval.available ? `${prodEval.resellerDiscPct}%` : '0%')
    } else if (lbl.startsWith('buy cost') && skuRowNum && r < skuRowNum + 18) {
      ensureCell(r, valCol, prodEval.available ? prodEval.buyCost : 0)
      if (prodEval.features && r + 2 < rows.length) {
        ensureCell(r + 2, valCol, prodEval.features)
      }
      break
    }
  }

  // Trường hợp Advisory services (dạng bảng ngang: C = Product, J = SKU, N = MSRP, O = Disc, U = Buy Cost)
  if (sheetName === 'Advisory services') {
    let advTargetRow = 11
    for (let r = 10; r < rows.length; r++) {
      const pName = String(rows[r]?.[2] ?? '').trim()
      if (!pName) continue
      const ev = evaluateProductCalculator(calcData, {
        partnerLevel: ctx.partnerLevel,
        sector: ctx.sector,
        dealType: ctx.dealType,
        product: pName,
        term: ctx.termSubscription,
        qty: 1,
        specialAttribute: 'AA'
      })
      ensureCell(r, 9, ev.available ? ev.sku : 'Not Available in this region')
      ensureCell(r, 13, ev.available ? ev.msrp : '')
      ensureCell(r, 14, ev.available ? `${ev.resellerDiscPct}%` : '')
      ensureCell(r, 20, ev.available ? ev.buyCost : '')
      if (pName === prodEval.productDesc) advTargetRow = r + 1
    }
    return { rows, targetRow: advTargetRow, targetColLetter: 'J' }
  }

  // Trường hợp MDR calculator (Scenario 1 ngang: D=Label, F=Selected, I=SKUs, K=Total MSRP, M=Disc, O=Promo, Q=Special, S=Buy Cost)
  if (sheetName === 'MDR calculator') {
    ensureCell(10, 12, ctx.qty || 1)
    ensureCell(12, 12, 0)
    ensureCell(20, 5, ctx.termSubscription || '12 MOS')
    ensureCell(22, 5, prodEval.productDesc || ctx.product || 'Sophos MDR - User')
    ensureCell(22, 8, prodEval.available ? prodEval.sku : 'Not Available')
    ensureCell(22, 10, prodEval.available ? prodEval.msrp : 'Not Available')
    ensureCell(22, 12, prodEval.available ? `${prodEval.resellerDiscPct}%` : '0%')
    ensureCell(22, 14, `${prodEval.promoDiscPct}%`)
    ensureCell(22, 16, `${prodEval.specialDiscPct}%`)
    ensureCell(22, 18, prodEval.available ? prodEval.buyCost : 0)
    return { rows, targetRow: 23, targetColLetter: 'I' }
  }

  // Trường hợp Network Detection & Response (Dòng 12/14 = cấu hình, Dòng 39 = Subscription SKU tại Cột G=6, MSRP=9, Disc=11, BuyCost=17)
  if (sheetName === 'Network Detection & Response') {
    ensureCell(11, 3, ctx.termSubscription || '12 MOS')
    ensureCell(13, 3, ctx.qty || 1)
    const isAppliance = /appliance|hardware/i.test(prodEval.prodType || prodEval.productDesc)
    const ndrRowIdx = isAppliance ? 42 : 38
    if (isAppliance) ensureCell(ndrRowIdx, 1, prodEval.productDesc || ctx.product)
    ensureCell(ndrRowIdx, 6, prodEval.available ? prodEval.sku : 'Not Available')
    ensureCell(ndrRowIdx, 9, prodEval.available ? prodEval.msrp : 'Not Available')
    ensureCell(ndrRowIdx, 11, prodEval.available ? `${prodEval.resellerDiscPct}%` : '0%')
    ensureCell(ndrRowIdx, 13, `${prodEval.promoDiscPct}%`)
    ensureCell(ndrRowIdx, 15, `${prodEval.specialDiscPct}%`)
    ensureCell(ndrRowIdx, 17, prodEval.available ? prodEval.buyCost : 0)
    return { rows, targetRow: ndrRowIdx + 1, targetColLetter: 'G' }
  }

  return {
    rows,
    targetRow: skuRowNum || 16,
    targetColLetter: XLSX.utils.encode_col(valCol)
  }
}
