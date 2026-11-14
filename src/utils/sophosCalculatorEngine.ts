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
  preferredSku?: string
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
  preferredSku?: string
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
  effectiveQty?: number
  effectiveTermLabel?: string
}

export interface SophosInferredCalcContext {
  sku?: string
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
    .replace(/\bUP\s+TO\s+/g, '')
    .replace(/\bGB\s+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function collapseWsLower(s: string): string {
  return String(s || '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
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
  const pcToProducts: Record<string, SophosProduct2Item[]> = {}
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
      descLowerToProduct[collapseWsLower(item.desc)] = item
    }
    if (item.pc) {
      const pcUpper = item.pc.toUpperCase()
      pcToProduct[pcUpper] = item
      if (!pcToProducts[pcUpper]) pcToProducts[pcUpper] = []
      pcToProducts[pcUpper].push(item)
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
    pcToProducts,
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
  const rawRule = String(prod.specAttrRule || 'AA').trim()
  const rule = /^X[123]$/.test(rawRule) ? `${rawRule}_` : rawRule
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
  const rawRule = String(prod.specAttrRule || 'AA').trim()
  const rule = /^X[123]$/.test(rawRule) ? `${rawRule}_` : rawRule
  if (rule !== 'CU' && dd.specialAttrSingleSet.includes(rule)) {
    return rule
  }
  const rawSel = String(selectedSpecAttr || '').trim()
  let upperSel = rawSel.toUpperCase()
  if (upperSel === 'EUK' || upperSel === 'EU/UK') upperSel = 'EU'

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

interface RuntimeSkuLookupCache {
  pcHasSkuSet: Set<string>
  partIdHasSkuSet: Set<string>
  firstEntryByPc: Record<string, any>
}

function ensureRuntimeCalcSkuLookups(calcData: any): RuntimeSkuLookupCache {
  const runtime = calcData?.engineRuntime
  if (runtime?._skuLookupCache) return runtime._skuLookupCache as RuntimeSkuLookupCache

  const pcHasSkuSet = new Set<string>()
  const partIdHasSkuSet = new Set<string>()
  const firstEntryByPc: Record<string, any> = {}
  const calcSkus = calcData?.calcSkus || {}
  const newByOld: Record<string, string> = runtime?.dropDowns?.newSkuByOldSku || {}
  const rows: any[] = Array.isArray(calcData?.sortedCalcMsrpRows) && calcData.sortedCalcMsrpRows.length
    ? calcData.sortedCalcMsrpRows
    : Object.values(calcSkus)

  const scoreSkuCandidate = (sku: string, mapped14: string): number => {
    let sc = 0
    const s = mapped14 || sku
    if (s.length === 14) {
      const t = s.slice(6, 8)
      const sp = s.slice(12, 14)
      if (t === '12' || t === '00') sc += 20
      else if (t === '36') sc += 10
      if (['AA', 'AU', 'NP', 'MR', 'EK'].includes(sp)) sc += 10
      if (s[10] === 'N' || s[10] === 'P') sc += 5
      if (s[11] === 'C') sc += 5
    } else if (/(AU|EUK|ROW|MR|AA)$/i.test(sku)) {
      sc += 15
    }
    return sc
  }

  const bestScoreByPc: Record<string, number> = {}
  for (const r of rows) {
    if (!r || !r.sku) continue
    const sku = String(r.sku).toUpperCase()
    const pc = r.pc ? String(r.pc).toUpperCase() : ''
    const mapped14 = newByOld[sku] || (sku.length === 14 ? sku : '')
    if (mapped14.length === 14) {
      partIdHasSkuSet.add(mapped14.slice(0, 6).toUpperCase())
    }
    if (pc) {
      pcHasSkuSet.add(pc)
      const sc = scoreSkuCandidate(sku, mapped14)
      if (!firstEntryByPc[pc] || sc > (bestScoreByPc[pc] ?? -1)) {
        firstEntryByPc[pc] = r
        bestScoreByPc[pc] = sc
      }
    }
  }

  const cache: RuntimeSkuLookupCache = { pcHasSkuSet, partIdHasSkuSet, firstEntryByPc }
  if (runtime && typeof runtime === 'object') {
    runtime._skuLookupCache = cache
  }
  return cache
}

export function productHasAnyCalcSku(calcData: any, prod: SophosProduct2Item | null | undefined): boolean {
  if (!calcData || !prod) return false
  const cache = ensureRuntimeCalcSkuLookups(calcData)
  const pc = String(prod.pc || '').trim().toUpperCase()
  if (pc && cache.pcHasSkuSet.has(pc)) return true
  const partId = String(prod.partId || '').trim().toUpperCase()
  if (partId && cache.partIdHasSkuSet.has(partId)) return true
  return false
}

function doesSkuBelongToProduct(
  calcData: any,
  rawSku: string | undefined,
  prod: SophosProduct2Item | null | undefined
): boolean {
  if (!calcData || !rawSku || !prod) return false
  const sku = String(rawSku).trim().toUpperCase()
  if (!sku) return false
  const entry = calcData?.calcSkus?.[sku]
  const prodPc = String(prod.pc || '').trim().toUpperCase()
  if (entry?.pc && prodPc && String(entry.pc).trim().toUpperCase() === prodPc) {
    return true
  }
  const dd: SophosDropDownsMeta | undefined = calcData?.engineRuntime?.dropDowns
  const mapped14 = dd?.newSkuByOldSku?.[sku] || (sku.length === 14 ? sku : '')
  const prodPart = String(prod.partId || '').trim().toUpperCase()
  if (mapped14.length === 14 && prodPart && mapped14.slice(0, 6).toUpperCase() === prodPart) {
    return true
  }
  return false
}

function buildDirectSkuEvalFallback(
  calcData: any,
  rawSku: string,
  partnerLevel: string,
  dealType: string,
  qty: number,
  promoDiscPct = 0,
  specialDiscPct = 0
): SophosProductEvalResult | null {
  const cleanSku = String(rawSku || '').trim().toUpperCase()
  if (!cleanSku) return null
  const entry = calcData?.calcSkus?.[cleanSku]
  if (!entry) return null

  const effQty = Math.max(1, Math.round(Number(qty) || 1))
  const rawUnitMsrp = Number(entry.msrp) || 0
  const msrp = round2(rawUnitMsrp * effQty)
  const unitMsrp = effQty > 0 ? round2(msrp / effQty) : rawUnitMsrp
  const unitResellerCost = resolvePartnerUnitCost(entry, partnerLevel, dealType)
  let resellerDiscRatio = 0
  let resellerDiscPct = 0
  let buyCost = msrp
  if (unitResellerCost !== null && rawUnitMsrp > 0) {
    resellerDiscRatio = Math.max(0, 1 - unitResellerCost / rawUnitMsrp)
    resellerDiscPct = Math.round(resellerDiscRatio * 10000) / 100
    if (promoDiscPct === 0 && specialDiscPct === 0) {
      buyCost = round2(unitResellerCost * effQty)
    } else {
      buyCost = round2(msrp * (1 - resellerDiscRatio) * (1 - promoDiscPct / 100) * (1 - specialDiscPct / 100))
    }
  }

  const dd: SophosDropDownsMeta | undefined = calcData?.engineRuntime?.dropDowns
  const mappedNew = dd?.newSkuByOldSku?.[cleanSku] || (cleanSku.length === 14 ? cleanSku : '')
  return {
    foundProduct: true,
    productDesc: entry.desc || cleanSku,
    productCode: entry.pc || '',
    prodType: entry.prodType || '',
    sku: cleanSku,
    newSku: mappedNew,
    available: true,
    unitMsrp,
    msrp,
    unitResellerCost,
    resellerDiscPct,
    promoDiscPct,
    specialDiscPct,
    buyCost,
    bandCode: mappedNew.length === 14 ? mappedNew.slice(8, 10) : 'ZZ',
    bandMin: null,
    bandMax: null,
    minQtyWarning: '',
    isTermed: mappedNew.length === 14 ? mappedNew.slice(6, 8) !== '00' : true,
    fixedTermLabel: '',
    specialAttrOptions: [{ label: 'Standard Pricing', code: 'AA' }],
    features: (entry.desc && calcData?.engineRuntime?.featuresByProduct?.[entry.desc]) || '',
    calcRowNum: entry.rowNum || null,
    eolMonths: null,
    effectiveQty: effQty,
    effectiveTermLabel: mappedNew.length === 14 && mappedNew.slice(6, 8) !== '00' ? `${parseInt(mappedNew.slice(6, 8), 10)} MOS` : ''
  }
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
    preferredSku?: string
  }
) {
  const runtime = calcData?.engineRuntime
  const dd: SophosDropDownsMeta = runtime?.dropDowns
  const calcSkus = calcData?.calcSkus || {}

  const qty = Math.max(1, Math.round(Number(opts.qty) || 1))
  let effectiveQty = qty
  let effectiveTermLabel = opts.term || '12 MOS'
  let resolvedTermInfo = resolveTermDigits(prod.termed, opts.term)
  let resolvedBandInfo = resolveVolumeBandCode(prod.volScheme, qty, dd?.volBandTables || {})
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

  const tryConstructedCandidate = (tCode: string, bCode: string, tx: string, sec: string, sp: string) => {
    const candNew = `${prod.partId}${tCode}${bCode}${tx}${sec}${sp}`.toUpperCase()
    const candOld = dd?.oldSkuByNewSku?.[candNew]
    if (candOld && calcSkus[candOld]) {
      return { newSku: candNew, finalSku: candOld, entry: calcSkus[candOld] }
    }
    if (calcSkus[candNew]) {
      return { newSku: candNew, finalSku: candNew, entry: calcSkus[candNew] }
    }
    return null
  }

  let resolvedNewSku = `${prod.partId}${resolvedTermInfo.code}${resolvedBandInfo.bandCode}${txCode}${sectorCode}${specCode}`.toUpperCase()
  const mappedOldSku = dd?.oldSkuByNewSku?.[resolvedNewSku]
  const pref = String(opts.preferredSku || '').trim().toUpperCase()
  let finalSku = resolvedNewSku
  let skuEntry = calcSkus[resolvedNewSku] || null

  if (pref && (pref === resolvedNewSku || pref === mappedOldSku) && calcSkus[pref]) {
    finalSku = pref
    skuEntry = calcSkus[pref]
  } else if (mappedOldSku && calcSkus[mappedOldSku]) {
    finalSku = mappedOldSku
    skuEntry = calcSkus[mappedOldSku]
  } else if (!skuEntry && mappedOldSku) {
    finalSku = mappedOldSku
  }

  // Smart ASEAN Auto-Fallback khi tổ hợp mặc định không tồn tại trong MSRPs&BuyCost của vùng ASEAN
  if (!skuEntry) {
    if (pref && calcSkus[pref] && doesSkuBelongToProduct(calcData, pref, prod)) {
      finalSku = pref
      skuEntry = calcSkus[pref]
      const pref14 = dd?.newSkuByOldSku?.[pref] || (pref.length === 14 ? pref : '')
      if (pref14.length === 14) {
        resolvedNewSku = pref14
        const bCode = pref14.slice(8, 10)
        if (bCode !== 'ZZ' && dd?.volBandTables?.[bCode[0]]) {
          const hitB = dd.volBandTables[bCode[0]].find(b => b[2] === bCode)
          if (hitB) {
            resolvedBandInfo = { bandCode: bCode, min: hitB[0], max: hitB[1], minWarning: '' }
            if (effectiveQty < hitB[0]) effectiveQty = hitB[0]
          }
        }
      }
    }

    // Fallback A: Tự động tìm dải Volume Band gần nhất có thật trong ASEAN (VD: CEMA-DMARC-ADDON tối thiểu 100 user = band AC)
    if (!skuEntry && prod.volScheme && prod.volScheme !== 'Z' && dd?.volBandTables?.[prod.volScheme]) {
      const sortedBands = [...dd.volBandTables[prod.volScheme]].sort(
        (a, b) => Math.abs(qty - a[0]) - Math.abs(qty - b[0])
      )
      for (const [bMin, bMax, bCode] of sortedBands) {
        const hit = tryConstructedCandidate(resolvedTermInfo.code, bCode, txCode, sectorCode, specCode)
        if (hit) {
          resolvedNewSku = hit.newSku
          finalSku = hit.finalSku
          skuEntry = hit.entry
          resolvedBandInfo = {
            bandCode: bCode,
            min: bMin,
            max: bMax,
            minWarning: qty < bMin ? `Số lượng tối thiểu của gói là ${bMin}` : ''
          }
          effectiveQty = qty < bMin ? bMin : (qty > bMax ? bMax : qty)
          break
        }
      }
    }

    // Fallback B: Tự động tìm chuẩn chân cắm nguồn / Special Attribute hợp lệ tại ASEAN (VD: XRP2000 không có AU, chỉ có EUK/CN/US)
    if (!skuEntry) {
      const optCodes = getSpecialAttributeOptionsForProduct(prod, dd).map(o => o.code)
      const specCandidates = Array.from(
        new Set([...optCodes, 'AU', 'EU', 'EK', 'ES', 'AN', 'UK', 'US', 'CN', 'AA', 'NP', 'MR'])
      )
      for (const sp of specCandidates) {
        const mappedSp = resolveSpecialAttrCode(prod, sp, dd)
        for (const trySp of sp === mappedSp ? [sp] : [mappedSp, sp]) {
          const hit = tryConstructedCandidate(resolvedTermInfo.code, resolvedBandInfo.bandCode, txCode, sectorCode, trySp)
          if (hit) {
            resolvedNewSku = hit.newSku
            finalSku = hit.finalSku
            skuEntry = hit.entry
            break
          }
        }
        if (skuEntry) break
      }
    }

    // Fallback C: Tự động tìm Term / Transaction hợp lệ (VD: truyền nhầm 1 MOS sang gói chỉ có 12/36 MOS)
    if (!skuEntry) {
      const termCandidates = resolvedTermInfo.isTermed
        ? Array.from(new Set([resolvedTermInfo.code, '12', '36', '24', '60']))
        : ['00', '12']
      const txCandidates = Array.from(new Set([txCode, 'N', 'P', 'R']))
      const spCandidates = Array.from(new Set([specCode, 'AA', 'AU', 'EK', 'NP', 'MR', 'US', 'CN']))
      for (const tc of termCandidates) {
        for (const tx of txCandidates) {
          for (const sp of spCandidates) {
            const hit = tryConstructedCandidate(tc, resolvedBandInfo.bandCode, tx, sectorCode, sp)
            if (hit) {
              resolvedNewSku = hit.newSku
              finalSku = hit.finalSku
              skuEntry = hit.entry
              if (tc !== '00') {
                effectiveTermLabel = `${parseInt(tc, 10)} MOS`
                resolvedTermInfo = { ...resolvedTermInfo, code: tc, months: parseInt(tc, 10) }
              }
              break
            }
          }
          if (skuEntry) break
        }
        if (skuEntry) break
      }
    }

    // Fallback D: Khớp trực tiếp theo Product Code (pc) trong bảng giá gốc nếu vẫn chưa ra
    if (!skuEntry && prod.pc) {
      const lookupCache = ensureRuntimeCalcSkuLookups(calcData)
      const pcHit = lookupCache.firstEntryByPc[String(prod.pc).trim().toUpperCase()]
      if (pcHit) {
        finalSku = String(pcHit.sku).toUpperCase()
        skuEntry = pcHit
        const hit14 = dd?.newSkuByOldSku?.[finalSku] || (finalSku.length === 14 ? finalSku : '')
        if (hit14.length === 14) {
          resolvedNewSku = hit14
          const tC = hit14.slice(6, 8)
          if (tC !== '00' && /^\d{2}$/.test(tC)) {
            effectiveTermLabel = `${parseInt(tC, 10)} MOS`
          }
          const bC = hit14.slice(8, 10)
          if (bC !== 'ZZ' && dd?.volBandTables?.[bC[0]]) {
            const hitB = dd.volBandTables[bC[0]].find(b => b[2] === bC)
            if (hitB) {
              resolvedBandInfo = { bandCode: bC, min: hitB[0], max: hitB[1], minWarning: '' }
              if (effectiveQty < hitB[0]) effectiveQty = hitB[0]
            }
          }
        }
      }
    }
  }

  const promoDiscPct = Math.max(0, Math.min(100, Number(opts.promoDiscPct) || 0))
  const specialDiscPct = Math.max(0, Math.min(100, Number(opts.specialDiscPct) || 0))

  if (!skuEntry) {
    return {
      newSku: resolvedNewSku,
      sku: finalSku,
      available: false,
      unitMsrp: 0,
      msrp: 0,
      unitResellerCost: null,
      resellerDiscPct: 0,
      promoDiscPct,
      specialDiscPct,
      buyCost: 0,
      bandInfo: resolvedBandInfo,
      termInfo: resolvedTermInfo,
      calcRowNum: null,
      effectiveQty,
      effectiveTermLabel
    }
  }

  const isLegacyFlat = prod.desc === 'Sophos Endpoint for Legacy Platforms'
  const rawUnitMsrp = Number(skuEntry.msrp) || 0
  const msrp = isLegacyFlat ? round2(rawUnitMsrp) : round2(rawUnitMsrp * effectiveQty)
  const unitMsrp = effectiveQty > 0 ? round2(msrp / effectiveQty) : rawUnitMsrp

  const unitResellerCost = resolvePartnerUnitCost(skuEntry, opts.partnerLevel, opts.dealType)
  let resellerDiscRatio = 0
  let resellerDiscPct = 0
  let buyCost = msrp

  if (unitResellerCost !== null && rawUnitMsrp > 0) {
    resellerDiscRatio = Math.max(0, 1 - unitResellerCost / rawUnitMsrp)
    resellerDiscPct = Math.round(resellerDiscRatio * 10000) / 100
    if (promoDiscPct === 0 && specialDiscPct === 0) {
      buyCost = isLegacyFlat ? round2(unitResellerCost) : round2(unitResellerCost * effectiveQty)
    } else {
      buyCost = round2(msrp * (1 - resellerDiscRatio) * (1 - promoDiscPct / 100) * (1 - specialDiscPct / 100))
    }
  }

  return {
    newSku: resolvedNewSku,
    sku: finalSku,
    available: true,
    unitMsrp,
    msrp,
    unitResellerCost,
    resellerDiscPct,
    promoDiscPct,
    specialDiscPct,
    buyCost,
    bandInfo: resolvedBandInfo,
    termInfo: resolvedTermInfo,
    calcRowNum: skuEntry.rowNum || null,
    effectiveQty,
    effectiveTermLabel
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
    runtime?.descLowerToProduct?.[collapseWsLower(prodName)] ||
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
    specialDiscPct: Number(scenario.specialDiscPct) || 0,
    preferredSku: scenario.preferredSku
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
    eolMonths: prod.eolMonths,
    effectiveQty: calc.effectiveQty,
    effectiveTermLabel: calc.effectiveTermLabel
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
      const hit = byDesc[c.toLowerCase()] || byDesc[collapseWsLower(c)]
      if (hit) return hit
    }
    return null
  }

  if (rowKey === 'cfr_adv') {
    return tryExact(['Central Firewall Reporting Advanced'])
  }

  if (rowKey === 'hw_appliance') {
    if (isVirtual) {
      const virtDesc = runtime.dropDowns?.firewallVirtualMap?.[m] || ''
      const normTarget = normalizeVirtKey(virtDesc)
      return (
        pList.find(p => {
          const dl = p.desc.toLowerCase()
          if (!dl.includes('sf sw/virtual') || !dl.includes('base license')) return false
          return p.fwFilter.toLowerCase() === m.toLowerCase() || (normTarget && normalizeVirtKey(p.desc).includes(normTarget))
        }) || null
      )
    }
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
    enhanced_plus_upg: ['Enhanced to Enhanced Plus Support Upgrade', 'Enhanced to Enhanced Plus Upgrade', 'Enhanced to Enhanced Plus Support'],
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

  // Virtual model subscriptions & support (match via fwFilter === m hoặc virtDesc)
  const virtDesc = runtime.dropDowns?.firewallVirtualMap?.[m] || ''
  const normTarget = normalizeVirtKey(virtDesc)
  for (const sf of suffixes) {
    const sfLower = sf.toLowerCase()
    const hit = pList.find(p => {
      if (p.prodType !== 'Subscription' && p.prodType !== 'Support') return false
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

      const effectiveQty = spec.key === 'cfr_adv' ? qty : 1

      const res = computeProductPricingFromRule(calcData, prod, {
        partnerLevel,
        sector,
        dealType,
        term: effectiveTerm,
        qty: effectiveQty,
        specialAttribute: specAttr,
        promoDiscPct,
        specialDiscPct,
        preferredSku: settings.preferredSku
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
  productLine: string,
  calcData?: any
): string {
  const fam = String(family || '')
  const ln = String(productLine || '')
  const desc = String(prod?.desc || '')
  const pcUpper = String(prod?.pc || '').toUpperCase()
  const partUpper = String(prod?.partId || '').toUpperCase()

  if (fam === 'Advisory_Services') return 'Advisory services'
  if (fam === 'ProServices_and_Training') return 'ProServices & Training'
  if (['Switches', 'Access_Points', 'SD_WAN', 'Modules_and_Transceivers', 'Accessories'].includes(fam)) {
    return 'Network Infrastructure'
  }
  if (fam === 'Endpoint_Security') {
    if (pcUpper === 'CDE' || /device encryption/i.test(desc)) return 'Endpoint & Server'
    if (ln === 'Mobile' || /\bmobile\b/i.test(desc)) return 'Mobile'
    return 'Endpoint & Server'
  }
  if (fam === 'Workspace__Protection' || pcUpper === 'CWP') {
    if (pcUpper === 'CIXAWP') return 'Endpoint & Server'
    return 'Workspace Protection'
  }
  if (fam === 'Email_Security' || ['CEMA', 'CPHISH', 'EMS', 'EMAIL-PLUS', 'CEMA-PE-ADDON', 'CEMA-DMARC-ADDON'].includes(pcUpper)) {
    return 'Email'
  }
  if (fam === 'Backup_and_Recovery') return 'Backup & Recovery'
  if (fam === 'Identity_Security') return 'ITDR'
  if (fam === 'Network_Detection_and_Response') return 'Network Detection & Response'
  if (fam === 'Managed_Services') {
    if (/\bmdr\b/i.test(desc)) return 'MDR calculator'
    return 'Managed Services'
  }
  if (fam === 'Security_Operations') {
    if (/ai defense/i.test(desc)) return 'AI Defense'
    if (/ciso advantage/i.test(desc)) return 'CISO Advantage'
    if (/\bmdr\b/i.test(desc)) return 'MDR calculator'
    if (pcUpper === 'NDR' || partUpper === 'MDRNDU' || /central network detection and response/i.test(desc)) {
      return 'Network Detection & Response'
    }
    return 'XDR & Next-Gen SIEM'
  }

  // Fallback khi sản phẩm không nằm trong bảng Hierarchy của Universal Calculator
  if (pcUpper === 'CDE' || /device encryption/i.test(desc)) return 'Endpoint & Server'
  if (pcUpper === 'NDR' || partUpper === 'MDRNDU' || /^NDR\s*\d+/i.test(desc) || /central network detection and response/i.test(desc)) {
    return 'Network Detection & Response'
  }
  if (/sophos email|phish threat|dmarc/i.test(desc)) return 'Email'
  if (/\bworkspace protection\b/i.test(desc)) return 'Workspace Protection'
  if (/\bbackup\b/i.test(desc)) return 'Backup & Recovery'
  if (/\bitdr\b|identity threat/i.test(desc)) return 'ITDR'
  if (/ai defense/i.test(desc)) return 'AI Defense'
  if (/ciso advantage/i.test(desc)) return 'CISO Advantage'
  if (/\bmdr\b/i.test(desc)) return 'MDR calculator'

  if (prod?.prodType === 'ProServices' || /^(PR|TRD|CAD)/.test(partUpper) || /certified .* training|professional services|enhanced plus support|technical account manager/i.test(desc)) {
    const advRows: any[][] = calcData?.calcSheetsRaw?.['Advisory services'] || []
    const normDesc = collapseWsLower(desc)
    if (advRows.some(r => collapseWsLower(r?.[2] || '') === normDesc)) {
      return 'Advisory services'
    }
    return 'ProServices & Training'
  }

  if (
    /power supply|power cord|transceiver|sfp|qsfp|rackmount|mounting kit|poe injector|antenna|flexi port|module|sd-red|\bap6\s*\d|\bcs\d{3}/i.test(desc)
  ) {
    return 'Network Infrastructure'
  }

  return 'Universal Calculator'
}

export function detectExplicitFirewallRowKey(text: string): string | null {
  const combined = String(text || '').toLowerCase()
  if (!combined) return null
  if (combined.includes('with standard protection') || combined.includes('standard hardware bundle')) return 'std_bundle'
  if (combined.includes('with xstream protection') || combined.includes('xstream hardware bundle')) return 'xstream_bundle'
  if (combined.includes('xstream plus')) return 'xstream_plus'
  if ((combined.includes('xstream protection') || combined.includes('xtsream protection')) && !combined.includes('with ')) return 'xstream_prot'
  if (combined.includes('standard protection') && !combined.includes('with ')) return 'std_prot'
  if (combined.includes('enhanced to enhanced plus') || combined.includes('plus upgrade') || combined.includes('enhanced plus support')) return 'enhanced_plus_upg'
  if (combined.includes('enhanced support') || combined.includes('enhanced protection')) return 'enhanced_sup'
  if (combined.includes('network protection')) return 'net_prot'
  if (combined.includes('webserver protection')) return 'webserver_prot'
  if (combined.includes('web protection')) return 'web_prot'
  if (combined.includes('zero-day')) return 'zeroday_prot'
  if (combined.includes('orchestration') || combined.includes('orchestation')) return 'central_orch'
  if (combined.includes('email protection')) return 'email_prot'
  if (combined.includes('central firewall reporting')) return 'cfr_adv'
  return null
}

function inferFirewallRowKeyFromProductOrName(desc: string, itemName: string, sku: string): string {
  const explicitFromName = detectExplicitFirewallRowKey(itemName)
  const explicitFromDesc = detectExplicitFirewallRowKey(desc)
  if (explicitFromDesc) return explicitFromDesc
  if (explicitFromName) return explicitFromName

  const combined = `${desc || ''} ${itemName || ''}`.toLowerCase()
  const s = String(sku || '').toUpperCase()
  if (combined.includes('security appliance') || combined.includes('hardware appliance') || combined.includes('base license') || s.startsWith('XG') || s.startsWith('XV')) {
    return 'hw_appliance'
  }
  if (s.startsWith('XP')) return 'xstream_plus'
  if (s.startsWith('XZ')) return 'xstream_bundle'
  if (s.startsWith('XU')) return 'std_bundle'
  if (s.startsWith('XS')) return 'xstream_prot'
  if (s.startsWith('SP')) return 'std_prot'
  if (s.startsWith('UP')) return 'enhanced_plus_upg'
  if (s.startsWith('SE')) return 'enhanced_sup'
  if (s.startsWith('NS')) return 'net_prot'
  if (s.startsWith('WS')) return 'web_prot'
  if (s.startsWith('ZD')) return 'zeroday_prot'
  if (s.startsWith('CO')) return 'central_orch'
  if (s.startsWith('ES')) return 'email_prot'
  if (s.startsWith('SS')) return 'webserver_prot'
  if (s.startsWith('CFR')) return 'cfr_adv'
  return 'hw_appliance'
}

/**
 * Bóc tách dải số lượng (Volume Band Min-Max) từ thẻ hàng hóa (VD: "CFR50-999-...", "NDR100-199-...", "CZTNA10-24-...", "10-24 users")
 * Tự động loại trừ mã Switch (CS110-48: min > max) và năm phiên bản (2026-4: min > max).
 */
export function extractVolumeRangeFromSophosItem(item: any): { min: number; max: number } | null {
  if (!item || typeof item !== 'object') return null
  const yearSet = new Set([2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030])

  const textFields = [
    String(item.volume || ''),
    `${item.Ten_hang || ''} ${item.Danh_muc || ''}`
  ]
  for (const src of textFields) {
    if (!src.trim()) continue
    const re = /(?:^|[^A-Z0-9])(\d{1,5})\s*-\s*(\d{1,7})(?=$|[^0-9])/gi
    let m: RegExpExecArray | null
    while ((m = re.exec(src)) !== null) {
      const min = parseInt(m[1], 10)
      const max = parseInt(m[2], 10)
      if (min >= 1 && max > min && !yearSet.has(min)) {
        return { min, max }
      }
    }
  }

  const maHang = String(item.Ma_hang || '').trim()
  if (maHang) {
    const reMh = /(?:^|[^A-Z0-9])(?:CZTNA|CFR|NDR|CWP|CIX[A-Z]*|CEP[A-Z]*|MDR[A-Z]*|XDR[A-Z]*|CMA|CMS|CEMA|CPHISH|BAND|VOL|USER|SRV)?(\d{1,5})\s*-\s*(\d{1,7})(?=$|[^0-9])/gi
    let m: RegExpExecArray | null
    while ((m = reMh.exec(maHang)) !== null) {
      const min = parseInt(m[1], 10)
      const max = parseInt(m[2], 10)
      if (min >= 1 && max > min && !yearSet.has(min)) {
        return { min, max }
      }
    }
  }
  return null
}

/**
 * Tách mã SKU Calculator hợp lệ nằm nhúng trong Ma_hang (VD: "XG4CTCHEUK-SOPHOS-...")
 * nhưng chặn bẫy copy tiền tố Ma_hang sang gói Subscription khác (VD: "XG4CTCHEUK-...-XSTREAM" hoặc "UP430012ZZNCAA-...-EMAIL-PROTECTION").
 */
export function extractValidatedEmbeddedCalcSku(item: any, calcData: any): string {
  if (!item || !calcData) return ''
  const calcMap = calcData.calcSkus || {}
  const runtime = calcData.engineRuntime
  const dd: SophosDropDownsMeta | undefined = runtime?.dropDowns
  const maHang = String(item.Ma_hang || '').trim().toUpperCase()
  if (!maHang) return ''

  const tenHang = String(item.Ten_hang || '').trim()
  const explicitFwRowKey = detectExplicitFirewallRowKey(tenHang)
  const itemModelMatch = tenHang.match(/\b(XGS?\s*\d{2,4}w?)\b/i)
  const itemModelNorm = itemModelMatch ? itemModelMatch[1].replace(/\s+/g, '').toUpperCase() : ''
  const volRange = extractVolumeRangeFromSophosItem(item)

  const tokens = maHang.split(/[^A-Z0-9]+/).filter(t => t.length >= 7 && t.length <= 16)
  for (const rawTok of tokens) {
    const tok =
      rawTok === 'CFRAAB12ZZCAA' && !calcMap[rawTok] && calcMap['CFRAAB12BANCAA']
        ? 'CFRAAB12BANCAA'
        : rawTok
    const entry = calcMap[tok]
    const mappedNew = dd?.newSkuByOldSku?.[tok] || (tok.length === 14 ? tok : '')
    if (!entry && !mappedNew) continue

    const prod: SophosProduct2Item | null =
      (entry?.pc && runtime?.pcToProduct?.[String(entry.pc).toUpperCase()]) ||
      (mappedNew.length === 14 ? runtime?.partIdToProducts?.[mappedNew.slice(0, 6)]?.[0] : null) ||
      null
    const skuDesc = String(prod?.desc || entry?.desc || '')

    if (explicitFwRowKey) {
      const tokRowKey = inferFirewallRowKeyFromProductOrName(skuDesc, '', tok)
      if (tokRowKey !== explicitFwRowKey) continue
    } else if (itemModelNorm && skuDesc) {
      const tokRowKey = inferFirewallRowKeyFromProductOrName(skuDesc, '', tok)
      if (tokRowKey !== 'hw_appliance') continue
    }

    if (itemModelNorm && skuDesc) {
      const skuModelMatch = skuDesc.match(/\b(XGS?\s*\d{2,4}w?)\b/i)
      if (skuModelMatch) {
        const skuModelNorm = skuModelMatch[1].replace(/\s+/g, '').toUpperCase()
        if (skuModelNorm !== itemModelNorm) continue
      }
    }

    if (volRange && mappedNew.length === 14 && dd?.volBandTables) {
      const bCode = mappedNew.slice(8, 10)
      if (bCode !== 'ZZ') {
        const tbl = dd.volBandTables[bCode[0]] || []
        const hitBand = tbl.find(b => b[2] === bCode)
        if (hitBand && (volRange.min < hitBand[0] || volRange.min > hitBand[1])) {
          continue
        }
      }
    }

    return tok
  }
  return ''
}

function isNonFirewallInfraOrAccessoryText(text: string): boolean {
  const t = String(text || '').toLowerCase()
  if (!t) return false
  if (t.includes('(for xgs ') || t.includes('(for xg ')) return true
  return /\b(xrp\d+|pwr-supply|power\s+supply|power\s+cord|transceiver|sfp\+?|qsfp\d*|rackmount|mounting\s+kit|poe\s+injector|flexi\s+port|sd-red\s*\d+|ap6\s*\d+|cs101|cs110|cs210|cs1010|ndr\s*\d{4})\b/i.test(t)
}

function detectVirtualFirewallModelFromText(text: string): string {
  const t = String(text || '')
  if (!t) return ''
  const direct = t.match(/\bSFv[\s-]*(Unlimited|\d+C\d+)\b/i)
  if (direct) {
    const suffix = /^unlimited$/i.test(direct[1]) ? 'Unlimited' : direct[1].toUpperCase()
    return `SFv ${suffix}`
  }
  if (/sf\s*sw\/virtual|virtual\/software\s*firewall|virtual\s*firewall|\bsfv\b/i.test(t)) {
    if (/\bunl(?:imited)?\s*(?:cores?|&)/i.test(t)) return 'SFv Unlimited'
    if (/\b16\s*-?\s*cores?\b/i.test(t)) return 'SFv 16C24'
    if (/\b8\s*-?\s*cores?\b/i.test(t)) return 'SFv 8C16'
    if (/\b6\s*-?\s*cores?\b/i.test(t)) return 'SFv 6C8'
    if (/\b4\s*-?\s*cores?\b/i.test(t)) return 'SFv 4C6'
    if (/\b2\s*-?\s*cores?\b/i.test(t)) return 'SFv 2C4'
    if (/\b1\s*-?\s*core\b/i.test(t)) return 'SFv 1C4'
  }
  return ''
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
  if ((!cleanSku || (!calcMap[cleanSku] && !dd?.newSkuByOldSku?.[cleanSku])) && item) {
    const embedded = extractValidatedEmbeddedCalcSku(item, calcData)
    if (embedded) cleanSku = embedded
  }

  // 1. Giải mã OldSKU -> NewSKU 14 ký tự nếu có
  const mappedNewSku = (cleanSku && dd?.newSkuByOldSku?.[cleanSku]) || (cleanSku.length === 14 ? cleanSku : '')

  // 2. Tìm Product2 tương ứng (ưu tiên khớp đúng Fixed_12/36/60 hoặc 1-year/3-year/5-year khi trùng PartID)
  let matchedProd: SophosProduct2Item | null = null
  const skuEntry = cleanSku ? calcMap[cleanSku] : null
  if (skuEntry?.pc && runtime?.pcToProduct?.[String(skuEntry.pc).toUpperCase()]) {
    matchedProd = runtime.pcToProduct[String(skuEntry.pc).toUpperCase()]
  }
  if (!matchedProd && mappedNewSku.length === 14 && runtime?.partIdToProducts) {
    const partId = mappedNewSku.slice(0, 6)
    const tCode = mappedNewSku.slice(6, 8)
    const candidates: SophosProduct2Item[] = runtime.partIdToProducts[partId] || []
    if (candidates.length === 1) {
      matchedProd = candidates[0]
    } else if (candidates.length > 1) {
      const fixedTag = `fixed_${parseInt(tCode, 10)}`
      const yrNum = Math.round(parseInt(tCode, 10) / 12)
      matchedProd =
        candidates.find(c => String(c.termed).toLowerCase() === fixedTag) ||
        (yrNum > 0 ? candidates.find(c => c.desc.toLowerCase().includes(`${yrNum}-year`)) : null) ||
        candidates.find(c => Boolean(runtime.productToHierarchy?.[c.desc])) ||
        candidates[0]
    }
  }

  // 3. Tách thông số Deal Settings từ chuỗi SKU 14 ký tự
  let decodedFrom14Char = false
  if (mappedNewSku.length === 14 && /^[A-Z0-9]{6}\d{2}[A-Z]{2}[A-Z]{2}[A-Z0-9]{2}$/.test(mappedNewSku)) {
    decodedFrom14Char = true
    const tCode = mappedNewSku.slice(6, 8)
    const bCode = mappedNewSku.slice(8, 10)
    const txChar = mappedNewSku[10]
    const secChar = mappedNewSku[11]
    const specChars = mappedNewSku.slice(12, 14)

    const months = parseInt(tCode, 10)
    if (months > 0) {
      termSubscription = `${months} MOS`
      if (months === 12) termHwBundle = '1-Year'
      else if (months === 24) termHwBundle = '2-Year'
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
    const durText = `${item.License_duration || ''} ${item.Ten_hang || ''}`
    const mMatch = durText.match(/(\d+)\s*month/i)
    const yMatch = durText.match(/(\d+)\s*(?:year|năm)/i)
    if (mMatch) {
      const mVal = parseInt(mMatch[1], 10)
      termSubscription = `${mVal} MOS`
      if (mVal === 36) termHwBundle = '3-Year'
      else if (mVal === 60) termHwBundle = '5-Year'
    } else if (yMatch) {
      const yVal = parseInt(yMatch[1], 10)
      termSubscription = `${yVal * 12} MOS`
      if (yVal === 3) termHwBundle = '3-Year'
      else if (yVal === 5) termHwBundle = '5-Year'
    }
  }

  // Ưu tiên Volume Band trên Card nếu Card quy định dải rõ ràng (VD: CFR50-999, NDR100-199, CZTNA10-24)
  const itemVolRange = extractVolumeRangeFromSophosItem(item)
  if (itemVolRange) {
    qty = Math.max(1, itemVolRange.min)
  } else if (!decodedFrom14Char && item?.volume) {
    const vMatch = String(item.volume).match(/(\d+)/)
    if (vMatch) {
      const parsedV = parseInt(vMatch[1], 10)
      if (parsedV >= 1 && parsedV > qty) qty = parsedV
    }
  }

  // Gợi ý chuẩn chân cắm nguồn (EU/UK, UK, US, AU) từ tên hàng hoặc mã hàng khi chưa được khoá bởi SKU 14 ký tự
  if (!decodedFrom14Char && item) {
    const plugHintText = `${item.Ten_hang || ''} ${item.Description || ''} ${item.Ma_hang || ''}`
    if (/\b(?:eu\/uk|euk|eu\s+power\s+cord)\b|heuk\b|pcek\b/i.test(plugHintText)) {
      specialAttribute = 'EU'
    } else if (/\buk\s+power\s+cord\b/i.test(plugHintText)) {
      specialAttribute = 'UK'
    } else if (/\bus\s+power\s+cord\b/i.test(plugHintText)) {
      specialAttribute = 'US'
    } else if (/\bau\s+power\s+cord\b/i.test(plugHintText)) {
      specialAttribute = 'AU'
    }
  }

  const cardPrimaryText = `${item?.Danh_muc || ''} ${item?.Ten_hang || ''} ${item?.Description || ''}`
  const combinedCardText = `${cardPrimaryText} ${item?.Ma_hang || ''} ${matchedProd?.desc || ''}`

  // Tránh nhận nhầm phụ kiện / nguồn / module / switch / AP / NDR 5500 là Firewall XGS (VD: "XRP2000 ... (for XGS 2xxx/3xxx/4300 models only)")
  const matchedHierFam = matchedProd?.desc ? runtime?.productToHierarchy?.[matchedProd.desc]?.family || '' : ''
  const isInfraOrAccessory =
    (matchedProd &&
      !matchedProd.fwFilter &&
      (['Switches', 'Access_Points', 'SD_WAN', 'Modules_and_Transceivers', 'Accessories'].includes(matchedHierFam) ||
        isNonFirewallInfraOrAccessoryText(matchedProd.desc))) ||
    (matchedProd && /^NDR\s*\d+/i.test(matchedProd.fwFilter || matchedProd.desc)) ||
    (!matchedProd && isNonFirewallInfraOrAccessoryText(cardPrimaryText))

  const allKnownFwModels: string[] = []
  for (const grp of dd?.firewallModelGroups || []) {
    for (const m of grp.models) allKnownFwModels.push(m)
  }

  let detectedFwModel = ''
  if (!isInfraOrAccessory) {
    if (matchedProd?.fwFilter && !/^NDR/i.test(matchedProd.fwFilter)) {
      const exactKnown = allKnownFwModels.find(km => km.toLowerCase() === matchedProd!.fwFilter.toLowerCase())
      detectedFwModel = exactKnown || matchedProd.fwFilter
    }
    if (!detectedFwModel) {
      const virtM = detectVirtualFirewallModelFromText(combinedCardText)
      if (virtM) {
        const exactKnown = allKnownFwModels.find(km => km.toLowerCase() === virtM.toLowerCase())
        detectedFwModel = exactKnown || virtM
      }
    }
    if (!detectedFwModel) {
      const xgsMatch = combinedCardText.match(/\b(XGS?\s*\d{2,4}w?)\b/i)
      if (xgsMatch) {
        const rawM = xgsMatch[1].replace(/\b(XGS?)(\d)/i, '$1 $2').replace(/\s+/g, ' ').trim()
        const exactKnown = allKnownFwModels.find(km => km.toLowerCase() === rawM.toLowerCase())
        detectedFwModel = exactKnown || rawM.replace(/^xgs/i, 'XGS').replace(/^xg\b/i, 'XG')
      }
    }
  }

  const isCfrOnFirewall =
    matchedProd?.desc === 'Central Firewall Reporting Advanced' ||
    cleanSku.startsWith('CFR') ||
    /central firewall reporting/i.test(combinedCardText)

  if (detectedFwModel || isCfrOnFirewall) {
    const model = detectedFwModel || allKnownFwModels.find(m => m === 'XGS 2300') || allKnownFwModels[0] || 'XGS 2300'
    const rowKey = isCfrOnFirewall
      ? 'cfr_adv'
      : inferFirewallRowKeyFromProductOrName(matchedProd?.desc || '', item?.Ten_hang || '', cleanSku)
    if (rowKey === 'std_bundle' || rowKey === 'xstream_bundle') {
      const descLower = `${matchedProd?.desc || ''} ${item?.Ten_hang || ''}`.toLowerCase()
      if (descLower.includes('3-year') || termSubscription === '36 MOS') termHwBundle = '3-Year'
      else if (descLower.includes('5-year') || termSubscription === '60 MOS') termHwBundle = '5-Year'
      else termHwBundle = '1-Year'
    }
    if (!['AU', 'EU', 'UK', 'US', 'CN', 'IN', 'JP'].includes(specialAttribute)) {
      specialAttribute = 'AU'
    }
    const effectiveFwQty = isCfrOnFirewall ? qty : 1
    const evalPreview = evaluateFirewallCalculator(calcData, {
      partnerLevel,
      sector,
      dealType,
      termHwBundle,
      termSubscription,
      qty: effectiveFwQty,
      specialAttribute,
      models: [model],
      preferredSku: cleanSku
    })
    const matchedRow = evalPreview.rows.find(r => r.key === rowKey)
    const resolvedCell = matchedRow?.cells?.[0]
    const resolvedSku = resolvedCell?.available && resolvedCell.sku ? resolvedCell.sku : cleanSku
    return {
      sku: resolvedSku,
      calcType: 'firewall',
      nativeSheet: 'Firewall',
      targetFirewallRowKey: rowKey,
      targetFirewallSheetRow: matchedRow?.sheetRowNum || 29,
      partnerLevel,
      sector,
      dealType,
      termHwBundle,
      termSubscription,
      qty: effectiveFwQty,
      specialAttribute,
      model,
      models: [model],
      family: 'Firewall',
      productLine: '',
      product: resolvedCell?.productDesc || matchedProd?.desc || ''
    }
  }

  // Trường hợp Non-Firewall Product (Endpoint, MDR, XDR, NDR, Switch, AP, Accessory, Email, Mobile, Workspace, Advisory, ProServices...)
  const stripPlugSuffix = (s: string) =>
    String(s || '')
      .replace(/\s*-\s*(?:eu\/uk|au|uk|us|cn|in|jp)\s+power\s+cord\s*$/i, '')
      .trim()

  if (!matchedProd && runtime?.product2List?.length && item) {
    const rawTh = String(item.Ten_hang || '').trim()
    const cleanTh = stripPlugSuffix(rawTh)
    const thLower = collapseWsLower(cleanTh)
    const descLower = collapseWsLower(stripPlugSuffix(item.Description || ''))
    const catLower = collapseWsLower(item.Danh_muc || '')
    const mhUpper = String(item.Ma_hang || '').trim().toUpperCase()

    // Alias sản phẩm đổi tên trong Calculator 2026 (VD: Central Zero Trust Network Access / CZTNA -> Workspace Protection)
    if (
      mhUpper.startsWith('CZTNA') ||
      /zero\s+trust\s+network\s+access|\bztna\b/i.test(`${rawTh} ${catLower}`)
    ) {
      matchedProd =
        runtime.pcToProduct?.['CWP'] ||
        runtime.descLowerToProduct?.['workspace protection'] ||
        null
    } else if (
      mhUpper.startsWith('NDR') ||
      /central\s+network\s+detection\s+and\s+response/i.test(`${rawTh} ${catLower}`)
    ) {
      matchedProd =
        runtime.pcToProduct?.['NDR'] ||
        runtime.descLowerToProduct?.['central network detection and response'] ||
        null
    }

    if (!matchedProd) {
      matchedProd =
        runtime.descLowerToProduct?.[thLower] ||
        runtime.descLowerToProduct?.[collapseWsLower(rawTh)] ||
        (descLower ? runtime.descLowerToProduct?.[descLower] : null) ||
        runtime.descLowerToProduct?.[`sophos ${thLower}`] ||
        runtime.descLowerToProduct?.[thLower.replace(/^sophos\s+/, '')] ||
        null
    }

    if (!matchedProd && thLower && !/\butm\s*\d+\b/i.test(thLower)) {
      const stopWords = new Set(['sophos', 'central', 'license', 'subscription', 'bundle', 'protection', 'security', 'for', 'with', 'and', 'the', 'only'])
      const meaningfulTokens = thLower
        .split(/[^a-z0-9]+/)
        .filter(w => w.length >= 2 && !stopWords.has(w))
      if (meaningfulTokens.length >= 1) {
        matchedProd =
          runtime.product2List.find((p: SophosProduct2Item) => {
            const pl = collapseWsLower(p.desc)
            if (thLower.length >= 6 && (pl.includes(thLower) || thLower.includes(pl))) return true
            return meaningfulTokens.length >= 2 && meaningfulTokens.every(tok => pl.includes(tok))
          }) || null
      }
    }
  }

  // Nếu là thiết bị EOL cổ (VD: UTM 220) hoàn toàn không có trong Calculator 2026, không gán nhầm sang Sophos Endpoint
  const isLegacyUnmatchedItem = !matchedProd && !cleanSku && item && /\butm\s*\d+\b/i.test(`${item.Ten_hang || ''} ${item.Danh_muc || ''}`)
  if (isLegacyUnmatchedItem) {
    return {
      sku: '',
      calcType: 'product',
      nativeSheet: 'Firewall',
      targetFirewallRowKey: '',
      targetFirewallSheetRow: 29,
      partnerLevel,
      sector,
      dealType,
      termHwBundle,
      termSubscription,
      qty: 1,
      specialAttribute: 'AU',
      model: 'XGS 2300',
      models: ['XGS 2300'],
      family: 'Firewall',
      productLine: '',
      product: String(item.Ten_hang || 'Legacy EOL Product')
    }
  }

  const fallbackProd =
    matchedProd ||
    runtime?.descToProduct?.['Sophos Endpoint - User'] ||
    runtime?.product2List?.[0] ||
    null

  const prodDesc = fallbackProd?.desc || ''
  const hier = (prodDesc && runtime?.productToHierarchy?.[prodDesc]) || {
    family: '',
    productLine: ''
  }
  const family = hier.family || dd?.universalCatalog?.families?.[0] || 'Endpoint_Security'
  const productLine =
    hier.productLine ||
    (hier.family ? dd?.universalCatalog?.linesByFamily?.[hier.family]?.[0] || '' : '')
  const nativeSheet = mapProductToNativeSheet(fallbackProd, hier.family, productLine, calcData)

  const specOpts = getSpecialAttributeOptionsForProduct(fallbackProd, dd)
  const rawRule = String(fallbackProd?.specAttrRule || 'AA').trim()
  const normRule = /^X[123]$/.test(rawRule) ? `${rawRule}_` : rawRule
  let validSpec = specialAttribute
  if (normRule === 'X1_' || normRule === 'X2_' || normRule === 'X3_') {
    if (!['AU', 'EU', 'UK', 'US', 'CN', 'IN', 'JP', 'KR'].includes(validSpec) && !specOpts.some(o => o.code === validSpec)) {
      validSpec = 'AU'
    }
  } else if (!specOpts.some(o => o.code === validSpec || o.label === validSpec)) {
    validSpec = specOpts[0]?.code || 'AA'
  }

  const prodPreview = evaluateProductCalculator(calcData, {
    partnerLevel,
    sector,
    dealType,
    family,
    productLine,
    product: prodDesc,
    term: termSubscription,
    qty,
    specialAttribute: validSpec,
    preferredSku: cleanSku
  })
  const resolvedProdSku = prodPreview.available && prodPreview.sku ? prodPreview.sku : cleanSku

  return {
    sku: resolvedProdSku,
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
 * Tìm sản phẩm mặc định hợp lệ (có thật trong bảng giá ASEAN) cho từng Sheet tính toán
 * để không bao giờ truyền nhầm ngữ cảnh sang Sheet khác gây lỗi "Not Available".
 */
function findDefaultProductForCalcSheet(
  calcData: any,
  sheetName: string
): { prod: SophosProduct2Item; family: string; productLine: string } | null {
  const runtime = calcData?.engineRuntime
  if (!runtime) return null

  const tryByDescOrPc = (cands: string[]): SophosProduct2Item | null => {
    for (const c of cands) {
      const hit =
        runtime.pcToProduct?.[c.toUpperCase()] ||
        runtime.descToProduct?.[c] ||
        runtime.descLowerToProduct?.[collapseWsLower(c)] ||
        null
      if (hit && productHasAnyCalcSku(calcData, hit)) return hit
    }
    return null
  }

  let picked: SophosProduct2Item | null = null
  if (sheetName === 'Endpoint & Server' || sheetName === 'Universal Calculator') {
    picked = tryByDescOrPc(['Sophos Endpoint - User', 'Central Device Encryption'])
  } else if (sheetName === 'MDR calculator') {
    picked = tryByDescOrPc(['Sophos MDR - User', 'Sophos MDR Plus - User'])
  } else if (sheetName === 'XDR & Next-Gen SIEM') {
    picked = tryByDescOrPc(['Sophos XDR - User', 'Sophos Next-Gen SIEM'])
  } else if (sheetName === 'Network Detection & Response') {
    picked = tryByDescOrPc(['NDR', 'Central Network Detection and Response'])
  } else if (sheetName === 'Workspace Protection') {
    picked = tryByDescOrPc(['CWP', 'Workspace Protection'])
  } else if (sheetName === 'Email') {
    picked = tryByDescOrPc(['CEMA', 'Sophos Email'])
  } else if (sheetName === 'Mobile') {
    picked = tryByDescOrPc(['Central Mobile Advanced', 'Central Intercept X for Mobile'])
  } else if (sheetName === 'Backup & Recovery') {
    picked = tryByDescOrPc(['BACKUP-M365-RBRK', 'Backup and Recovery M365'])
  } else if (sheetName === 'ITDR') {
    picked = tryByDescOrPc(['ITDR', 'Sophos Identity Threat Detection and Response'])
  } else if (sheetName === 'AI Defense') {
    picked = tryByDescOrPc(['AI-DEFENSE', 'Sophos AI Defense'])
  } else if (sheetName === 'CISO Advantage') {
    picked = tryByDescOrPc(['CISO-ADVANTAGE', 'Sophos CISO Advantage'])
  } else if (sheetName === 'Managed Services') {
    picked = tryByDescOrPc(['Central Managed Risk', 'Sophos MDR - User'])
  } else if (sheetName === 'Network Infrastructure') {
    picked = tryByDescOrPc(['R60ZTCH', 'R20ZTCHMR', 'AP6-420-ROW', 'CS110-24FP'])
  } else if (sheetName === 'ProServices & Training') {
    picked = tryByDescOrPc(['EPSUP', 'TAM-Services'])
  } else if (sheetName === 'Advisory services') {
    const advRows: any[][] = calcData?.calcSheetsRaw?.['Advisory services'] || []
    for (let r = 10; r < advRows.length; r++) {
      const pName = String(advRows[r]?.[2] ?? '').trim()
      if (!pName || pName.toLowerCase() === 'advisory services') continue
      const pObj = runtime.descLowerToProduct?.[collapseWsLower(pName)]
      if (pObj && productHasAnyCalcSku(calcData, pObj)) {
        picked = pObj
        break
      }
    }
  }

  if (!picked && runtime.product2List?.length) {
    picked =
      runtime.product2List.find((p: SophosProduct2Item) => {
        if (!productHasAnyCalcSku(calcData, p)) return false
        const h = runtime.productToHierarchy?.[p.desc]
        return mapProductToNativeSheet(p, h?.family || '', h?.productLine || '', calcData) === sheetName
      }) || null
  }

  if (!picked) {
    picked = tryByDescOrPc(['Sophos Endpoint - User']) || runtime.product2List?.find((p: SophosProduct2Item) => productHasAnyCalcSku(calcData, p)) || null
  }
  if (!picked) return null

  const hier = runtime.productToHierarchy?.[picked.desc] || { family: '', productLine: '' }
  const family = hier.family || runtime.dropDowns?.universalCatalog?.families?.[0] || 'Endpoint_Security'
  const productLine = hier.productLine || runtime.dropDowns?.universalCatalog?.linesByFamily?.[family]?.[0] || ''
  return { prod: picked, family, productLine }
}

/**
 * Chuẩn hóa ngữ cảnh riêng cho từng Sheet khi xuất toàn bộ 23 Sheet ra Workbook ViewOffice,
 * ngăn chặn hoàn toàn hiện tượng lấy ngữ cảnh Firewall đè vào Sheet Product (hoặc ngược lại) sinh ra "Not Available".
 */
export function resolveSheetContextForWorkbook(
  calcData: any,
  sheetName: string,
  baseCtx: SophosInferredCalcContext,
  targetSheet: string
): SophosInferredCalcContext {
  if (
    sheetName === 'Cover' ||
    sheetName === 'Discounts' ||
    sheetName === 'Quick MSRP look up' ||
    sheetName === "What's New!" ||
    sheetName === 'Partner Resources' ||
    sheetName === 'Successors'
  ) {
    return baseCtx
  }

  if (sheetName === 'Firewall') {
    if (sheetName === targetSheet && baseCtx.calcType === 'firewall') {
      const validTermSub = /^0?1\s*mos/i.test(baseCtx.termSubscription || '') ? '12 MOS' : (baseCtx.termSubscription || '12 MOS')
      const rawPlug = String(baseCtx.specialAttribute || 'AU').toUpperCase()
      const validPlug = rawPlug === 'EUK' ? 'EU' : (['AU', 'EU', 'UK', 'US', 'CN'].includes(rawPlug) ? rawPlug : 'AU')
      return {
        ...baseCtx,
        termSubscription: validTermSub,
        specialAttribute: validPlug
      }
    }
    return {
      ...baseCtx,
      sku: '',
      calcType: 'firewall',
      nativeSheet: 'Firewall',
      targetFirewallRowKey: 'hw_appliance',
      targetFirewallSheetRow: 29,
      termHwBundle: '1-Year',
      termSubscription: '12 MOS',
      qty: 1,
      specialAttribute: 'AU',
      model: baseCtx.model || 'XGS 2300',
      models: baseCtx.models?.length ? baseCtx.models : [baseCtx.model || 'XGS 2300']
    }
  }

  // Các Sheet tính toán sản phẩm (Product Calculator Sheets)
  const runtime = calcData?.engineRuntime
  const curProd: SophosProduct2Item | null =
    (baseCtx.product &&
      (runtime?.descToProduct?.[baseCtx.product] ||
        runtime?.descLowerToProduct?.[collapseWsLower(baseCtx.product)])) ||
    null
  const curProdMappedSheet = curProd
    ? mapProductToNativeSheet(curProd, baseCtx.family, baseCtx.productLine, calcData)
    : ''

  const isTargetProdSheet =
    baseCtx.calcType === 'product' &&
    Boolean(curProd) &&
    (sheetName === targetSheet ||
      curProdMappedSheet === sheetName ||
      (sheetName === 'Universal Calculator' && Boolean(runtime?.productToHierarchy?.[curProd!.desc])))

  if (isTargetProdSheet) {
    return baseCtx
  }

  // Nếu là targetSheet nhưng người dùng truyền mã SKU trực tiếp (VD: Quick jump sang Universal Calculator)
  if (sheetName === targetSheet && baseCtx.sku && calcData?.calcSkus?.[String(baseCtx.sku).trim().toUpperCase()]) {
    const inferredForTarget = inferSophosCalculatorContext(calcData, baseCtx.sku, { Ten_hang: baseCtx.product || '' })
    if (inferredForTarget.calcType === 'product' && inferredForTarget.product) {
      return {
        ...inferredForTarget,
        partnerLevel: baseCtx.partnerLevel || inferredForTarget.partnerLevel,
        sector: baseCtx.sector || inferredForTarget.sector,
        dealType: baseCtx.dealType || inferredForTarget.dealType
      }
    }
  }

  const def = findDefaultProductForCalcSheet(calcData, sheetName)
  if (!def) return baseCtx
  const specOpts = getSpecialAttributeOptionsForProduct(def.prod, runtime?.dropDowns)
  const defSpec = specOpts[0]?.code || 'AA'
  return {
    ...baseCtx,
    sku: '',
    calcType: 'product',
    nativeSheet: sheetName,
    targetFirewallRowKey: '',
    targetFirewallSheetRow: null,
    termHwBundle: '1-Year',
    termSubscription: '12 MOS',
    qty: 1,
    specialAttribute: defSpec,
    family: def.family,
    productLine: def.productLine,
    product: def.prod.desc
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
): { rows: any[][]; targetRow: number; targetColLetter: string; targetSku?: string } {
  const rows = (baseRows || []).map(r => (Array.isArray(r) ? [...r] : []))
  const runtime = calcData?.engineRuntime
  const calcSkus = calcData?.calcSkus || {}

  // Làm sạch triệt để mọi chuỗi "Not Available" / "Not Available in this region" lưu sẵn trong bộ nhớ đệm của file mẫu gốc
  for (let r = 0; r < rows.length; r++) {
    const rowArr = rows[r]
    if (!Array.isArray(rowArr)) continue
    for (let c = 0; c < rowArr.length; c++) {
      const v = rowArr[c]
      if (typeof v === 'string' && /^not\s+available(?:\s+in\s+this\s+region)?$/i.test(v.trim())) {
        rowArr[c] = ''
      }
    }
  }

  const ensureCell = (rIdx: number, cIdx: number, val: any) => {
    if (rIdx < 0 || cIdx < 0) return
    while (rows.length <= rIdx) rows.push([])
    if (!Array.isArray(rows[rIdx])) rows[rIdx] = []
    while (rows[rIdx].length <= cIdx) rows[rIdx].push(null)
    rows[rIdx][cIdx] = val
  }

  const safePrefForProd = (prod: SophosProduct2Item | null | undefined): string | undefined => {
    if (!ctx.sku || !prod) return undefined
    return doesSkuBelongToProduct(calcData, ctx.sku, prod) ? ctx.sku : undefined
  }

  if (sheetName === 'Cover') {
    for (let r = 0; r < Math.min(rows.length, 8); r++) {
      for (let c = 0; c < (rows[r]?.length || 0); c++) {
        if (DEFAULT_PARTNER_LEVELS.includes(String(rows[r][c] ?? '').trim())) {
          ensureCell(r, c, ctx.partnerLevel || 'Authorized')
          return { rows, targetRow: r + 1, targetColLetter: XLSX.utils.encode_col(c), targetSku: ctx.sku || '' }
        }
      }
    }
    return { rows, targetRow: 3, targetColLetter: 'I', targetSku: ctx.sku || '' }
  }

  if (sheetName === 'Discounts') {
    ensureCell(8, 3, ctx.partnerLevel || 'Authorized')
    return { rows, targetRow: 9, targetColLetter: 'D', targetSku: ctx.sku || '' }
  }

  if (sheetName === 'Quick MSRP look up') {
    ensureCell(0, 4, ctx.sector || 'Corporate')
    return { rows, targetRow: 12, targetColLetter: 'C', targetSku: ctx.sku || '' }
  }

  if (sheetName === "What's New!" || sheetName === 'Partner Resources' || sheetName === 'Successors') {
    return { rows, targetRow: 3, targetColLetter: 'B', targetSku: ctx.sku || '' }
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
    const isFwCtx = ctx.calcType === 'firewall'
    const effTermBundle = isFwCtx ? (ctx.termHwBundle ?? '1-Year') : '1-Year'
    const effTermSub =
      !isFwCtx || /^0?1\s*mos/i.test(String(ctx.termSubscription || '').trim())
        ? '12 MOS'
        : (ctx.termSubscription || '12 MOS')
    const rawPlug = String(ctx.specialAttribute || 'AU').trim().toUpperCase()
    const effPlug =
      rawPlug === 'EUK'
        ? 'EU'
        : (['AU', 'EU', 'UK', 'US', 'CN'].includes(rawPlug) ? rawPlug : 'AU')
    const effQty = isFwCtx ? Math.max(1, Number(ctx.qty) || 1) : 1
    const effModels = ctx.models?.length ? ctx.models : [ctx.model || 'XGS 2300']

    for (let r = 4; r < Math.min(rows.length, 18); r++) {
      const lbl = String(rows[r]?.[2] ?? rows[r]?.[1] ?? '').trim().toLowerCase()
      if (lbl.includes('term') && lbl.includes('bundle')) ensureCell(r, 3, effTermBundle || 'None')
      else if (lbl.includes('term') && lbl.includes('subscription')) ensureCell(r, 3, effTermSub)
      else if (lbl === 'qty' || lbl === 'quantity') ensureCell(r, 3, effQty)
      else if (lbl.includes('special attribute')) ensureCell(r, 3, effPlug)
    }

    const fwEval = evaluateFirewallCalculator(calcData, {
      partnerLevel: ctx.partnerLevel,
      sector: ctx.sector,
      dealType: ctx.dealType,
      termHwBundle: effTermBundle,
      termSubscription: effTermSub,
      qty: effQty,
      specialAttribute: effPlug,
      models: effModels,
      preferredSku: isFwCtx ? ctx.sku : ''
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
    let targetSku = isFwCtx ? (ctx.sku || '') : ''
    let matchedBySku = false
    const ctxSkuUpper = isFwCtx ? String(ctx.sku || '').trim().toUpperCase() : ''

    for (const rEval of fwEval.rows) {
      const rIdx = rEval.sheetRowNum - 1
      rEval.cells.forEach((cEval, mIdx) => {
        const baseCol = modelColStarts[mIdx]
        if (baseCol === undefined) return
        if (cEval.available && cEval.sku && cEval.sku !== 'Not Available') {
          ensureCell(rIdx, baseCol, cEval.sku)
          ensureCell(rIdx, baseCol + 2, cEval.msrp)
          ensureCell(rIdx, baseCol + 4, `${cEval.resellerDiscPct}%`)
          ensureCell(rIdx, baseCol + 6, `${cEval.promoDiscPct}%`)
          ensureCell(rIdx, baseCol + 8, `${cEval.specialDiscPct}%`)
          ensureCell(rIdx, baseCol + 10, cEval.buyCost)
        } else if (
          mIdx === 0 &&
          ctxSkuUpper &&
          calcSkus[ctxSkuUpper] &&
          rEval.key === (ctx.targetFirewallRowKey || 'hw_appliance')
        ) {
          const directEv = buildDirectSkuEvalFallback(
            calcData,
            ctxSkuUpper,
            ctx.partnerLevel,
            ctx.dealType,
            effQty
          )
          if (directEv) {
            ensureCell(rIdx, baseCol, directEv.sku)
            ensureCell(rIdx, baseCol + 2, directEv.msrp)
            ensureCell(rIdx, baseCol + 4, `${directEv.resellerDiscPct}%`)
            ensureCell(rIdx, baseCol + 6, '0%')
            ensureCell(rIdx, baseCol + 8, '0%')
            ensureCell(rIdx, baseCol + 10, directEv.buyCost)
          }
        } else {
          // Để trống sạch sẽ cho dòng Bundle không chọn hoặc dòng phần cứng Gen.1 EOL không còn bán lẻ
          ensureCell(rIdx, baseCol, '')
          ensureCell(rIdx, baseCol + 2, '')
          ensureCell(rIdx, baseCol + 4, '')
          ensureCell(rIdx, baseCol + 6, '')
          ensureCell(rIdx, baseCol + 8, '')
          ensureCell(rIdx, baseCol + 10, '')
        }
      })

      const firstCell = rEval.cells[0]
      const writtenSku = String(rows[rIdx]?.[7] ?? '').trim()
      if (ctxSkuUpper && (writtenSku === ctxSkuUpper || firstCell?.newSku === ctxSkuUpper)) {
        targetRow = rEval.sheetRowNum
        targetSku = writtenSku || firstCell?.sku || ctxSkuUpper
        matchedBySku = true
      } else if (!matchedBySku && ctx.targetFirewallRowKey && rEval.key === ctx.targetFirewallRowKey && writtenSku) {
        targetRow = rEval.sheetRowNum
        targetSku = writtenSku
      }
    }

    // Đảm bảo ô đích luôn trỏ vào một dòng có mã SKU thật (VD: Model Gen.1 EOL không còn HW thì nhảy xuống dòng Subscription đầu tiên)
    if (!String(rows[targetRow - 1]?.[7] ?? '').trim()) {
      const firstAvailRow = fwEval.rows.find(r => String(rows[r.sheetRowNum - 1]?.[7] ?? '').trim() !== '')
      if (firstAvailRow) {
        targetRow = firstAvailRow.sheetRowNum
        targetSku = String(rows[firstAvailRow.sheetRowNum - 1]?.[7] ?? '').trim()
      }
    } else if (!targetSku) {
      targetSku = String(rows[targetRow - 1]?.[7] ?? '').trim()
    }

    return { rows, targetRow, targetColLetter: 'H', targetSku }
  }

  // Đánh giá sản phẩm mục tiêu cho các sheet Product
  let prodEval = evaluateProductCalculator(calcData, {
    partnerLevel: ctx.partnerLevel,
    sector: ctx.sector,
    dealType: ctx.dealType,
    family: ctx.family,
    productLine: ctx.productLine,
    product: ctx.product,
    term: ctx.termSubscription,
    qty: ctx.qty,
    specialAttribute: ctx.specialAttribute,
    preferredSku: ctx.sku
  })
  if (!prodEval.available && ctx.sku) {
    const directHit = buildDirectSkuEvalFallback(
      calcData,
      ctx.sku,
      ctx.partnerLevel,
      ctx.dealType,
      ctx.qty || 1
    )
    if (directHit) prodEval = directHit
  }
  const ctxSkuUpper = String(ctx.sku || prodEval.sku || '').trim().toUpperCase()

  // Trường hợp 2: Các sheet nhiều cột sản phẩm cố định theo mã PC (Mobile, Email, Workspace Protection)
  if (sheetName === 'Mobile' || sheetName === 'Email' || sheetName === 'Workspace Protection') {
    const populateFixedPcBlock = (
      pcRowIdx: number,
      cols: number[],
      rTerm: number,
      rQty: number,
      rSku: number,
      rUnitMsrp: number,
      rMsrp: number,
      rPromo: number,
      rSpec: number,
      rDisc: number,
      rBuy: number
    ) => {
      let hitCol = -1
      let hitSku = ''
      for (const cIdx of cols) {
        const rawPc = String(rows[pcRowIdx]?.[cIdx] ?? '').trim().toUpperCase()
        if (!rawPc) continue
        const pItem = runtime?.pcToProduct?.[rawPc]
        if (!pItem) continue
        const ev = evaluateProductCalculator(calcData, {
          partnerLevel: ctx.partnerLevel,
          sector: ctx.sector,
          dealType: ctx.dealType,
          product: pItem.desc,
          term: ctx.termSubscription,
          qty: ctx.qty || 1,
          specialAttribute: ctx.specialAttribute,
          preferredSku: safePrefForProd(pItem)
        })
        const effRowQty = ev.effectiveQty || ctx.qty || 1
        const effRowTerm = ev.isTermed ? (ev.effectiveTermLabel || ctx.termSubscription || '12 MOS') : 'N/A (One-time)'
        ensureCell(rTerm, cIdx, effRowTerm)
        ensureCell(rQty, cIdx, effRowQty)
        ensureCell(rSku, cIdx, ev.available ? ev.sku : '')
        ensureCell(rUnitMsrp, cIdx, ev.available ? ev.unitMsrp : '')
        ensureCell(rMsrp, cIdx, ev.available ? ev.msrp : '')
        ensureCell(rPromo, cIdx, ev.available ? `${ev.promoDiscPct}%` : '')
        ensureCell(rSpec, cIdx, ev.available ? `${ev.specialDiscPct}%` : '')
        ensureCell(rDisc, cIdx, ev.available ? `${ev.resellerDiscPct}%` : '')
        ensureCell(rBuy, cIdx, ev.available ? ev.buyCost : '')

        if (
          ev.available &&
          ((ctxSkuUpper && (ev.sku === ctxSkuUpper || ev.newSku === ctxSkuUpper)) ||
            (prodEval.productCode && prodEval.productCode.toUpperCase() === rawPc) ||
            (prodEval.productDesc && collapseWsLower(pItem.desc) === collapseWsLower(prodEval.productDesc)))
        ) {
          hitCol = cIdx
          hitSku = ev.sku
        }
      }
      return { hitCol, hitSku }
    }

    const topCols = sheetName === 'Workspace Protection' ? [6, 10] : sheetName === 'Mobile' ? [6, 10, 14] : [6, 10, 14, 18]
    const topRes = populateFixedPcBlock(7, topCols, 11, 13, 15, 17, 19, 21, 23, 25, 27)
    if (sheetName === 'Email') {
      const addonRes = populateFixedPcBlock(39, [6, 10], 43, 45, 47, 49, 51, 53, 55, 57, 59)
      if (addonRes.hitCol !== -1) {
        return {
          rows,
          targetRow: 48,
          targetColLetter: XLSX.utils.encode_col(addonRes.hitCol),
          targetSku: addonRes.hitSku || prodEval.sku
        }
      }
    }
    const finalCol = topRes.hitCol !== -1 ? topRes.hitCol : 6
    const fallbackCellSku = String(rows[15]?.[finalCol] ?? '').trim()
    return {
      rows,
      targetRow: 16,
      targetColLetter: XLSX.utils.encode_col(finalCol),
      targetSku: topRes.hitSku || fallbackCellSku || prodEval.sku
    }
  }

  // Trường hợp 3: Advisory services (C = Product, J = SKU [9], N = MSRP [13], Q = Disc [16], S = Promo [18], U = Special [20], W = Buy Cost [22])
  if (sheetName === 'Advisory services') {
    let advTargetRow = 0
    let advTargetSku = ''
    let firstAvailAdvRow = 0
    let firstAvailAdvSku = ''
    for (let r = 10; r < rows.length; r++) {
      const pName = String(rows[r]?.[2] ?? '').trim()
      if (!pName || pName.toLowerCase() === 'advisory services') continue
      const rowProd = runtime?.descLowerToProduct?.[collapseWsLower(pName)]
      const ev = evaluateProductCalculator(calcData, {
        partnerLevel: ctx.partnerLevel,
        sector: ctx.sector,
        dealType: ctx.dealType,
        product: pName,
        term: ctx.termSubscription,
        qty: ctx.qty || 1,
        specialAttribute: 'AA',
        preferredSku: safePrefForProd(rowProd)
      })
      ensureCell(r, 9, ev.available ? ev.sku : '')
      ensureCell(r, 13, ev.available ? ev.msrp : '')
      ensureCell(r, 16, ev.available ? `${ev.resellerDiscPct}%` : '')
      ensureCell(r, 18, ev.available ? `${ev.promoDiscPct}%` : '')
      ensureCell(r, 20, ev.available ? `${ev.specialDiscPct}%` : '')
      ensureCell(r, 22, ev.available ? ev.buyCost : '')
      if (ev.available && !firstAvailAdvRow) {
        firstAvailAdvRow = r + 1
        firstAvailAdvSku = ev.sku
      }
      if (
        ev.available &&
        ((ctxSkuUpper && (ev.sku === ctxSkuUpper || ev.newSku === ctxSkuUpper)) ||
          collapseWsLower(pName) === collapseWsLower(prodEval.productDesc))
      ) {
        advTargetRow = r + 1
        advTargetSku = ev.sku
      }
    }
    return {
      rows,
      targetRow: advTargetRow || firstAvailAdvRow || 11,
      targetColLetter: 'J',
      targetSku: advTargetSku || firstAvailAdvSku || prodEval.sku
    }
  }

  // Trường hợp 4: ProServices & Training (Khối EPSUP G18, Khối TAM G39/K39, và Bảng Training & ProServices J54..J176)
  if (sheetName === 'ProServices & Training') {
    let psTargetRow = 18
    let psTargetCol = 'G'
    let psTargetSku = ''
    let matchedPs = false

    // 4a. Enhanced Plus Support (G10 = EPSUP)
    const epsupProd = runtime?.pcToProduct?.['EPSUP']
    if (epsupProd) {
      const ev = evaluateProductCalculator(calcData, {
        partnerLevel: ctx.partnerLevel,
        sector: ctx.sector,
        dealType: ctx.dealType,
        product: epsupProd.desc,
        term: ctx.termSubscription,
        qty: ctx.qty || 1,
        specialAttribute: ctx.specialAttribute,
        preferredSku: safePrefForProd(epsupProd)
      })
      ensureCell(13, 6, ev.isTermed ? (ev.effectiveTermLabel || ctx.termSubscription || '12 MOS') : 'N/A (One-time)')
      ensureCell(15, 6, ev.effectiveQty || ctx.qty || 1)
      ensureCell(17, 6, ev.available ? ev.sku : '')
      ensureCell(19, 6, ev.available ? ev.msrp : '')
      ensureCell(21, 6, ev.available ? `${ev.promoDiscPct}%` : '')
      ensureCell(23, 6, ev.available ? `${ev.specialDiscPct}%` : '')
      ensureCell(25, 6, ev.available ? `${ev.resellerDiscPct}%` : '')
      ensureCell(27, 6, ev.available ? ev.buyCost : '')
      if (ev.available) psTargetSku = ev.sku
      if (
        ev.available &&
        ((ctxSkuUpper && (ev.sku === ctxSkuUpper || ev.newSku === ctxSkuUpper)) ||
          collapseWsLower(epsupProd.desc) === collapseWsLower(prodEval.productDesc))
      ) {
        psTargetRow = 18
        psTargetCol = 'G'
        psTargetSku = ev.sku
        matchedPs = true
      }
    }

    // 4b. Technical Account Manager Services (G31 = TAM-Services, K31 = TAM-Services-Plus)
    for (const cIdx of [6, 10]) {
      const rawPc = String(rows[30]?.[cIdx] ?? '').trim().toUpperCase()
      const tamProd = rawPc ? runtime?.pcToProduct?.[rawPc] : null
      if (!tamProd) continue
      const ev = evaluateProductCalculator(calcData, {
        partnerLevel: ctx.partnerLevel,
        sector: ctx.sector,
        dealType: ctx.dealType,
        product: tamProd.desc,
        term: ctx.termSubscription,
        qty: ctx.qty || 1,
        specialAttribute: ctx.specialAttribute,
        preferredSku: safePrefForProd(tamProd)
      })
      ensureCell(34, cIdx, ev.isTermed ? (ev.effectiveTermLabel || ctx.termSubscription || '12 MOS') : 'N/A (One-time)')
      ensureCell(36, cIdx, ev.effectiveQty || ctx.qty || 1)
      ensureCell(38, cIdx, ev.available ? ev.sku : '')
      ensureCell(40, cIdx, ev.available ? ev.msrp : '')
      ensureCell(42, cIdx, ev.available ? `${ev.promoDiscPct}%` : '')
      ensureCell(44, cIdx, ev.available ? `${ev.specialDiscPct}%` : '')
      ensureCell(46, cIdx, ev.available ? `${ev.resellerDiscPct}%` : '')
      ensureCell(48, cIdx, ev.available ? ev.buyCost : '')
      if (
        !matchedPs &&
        ev.available &&
        ((ctxSkuUpper && (ev.sku === ctxSkuUpper || ev.newSku === ctxSkuUpper)) ||
          collapseWsLower(tamProd.desc) === collapseWsLower(prodEval.productDesc))
      ) {
        psTargetRow = 39
        psTargetCol = XLSX.utils.encode_col(cIdx)
        psTargetSku = ev.sku
        matchedPs = true
      }
    }

    // 4c. Bảng Customer Training & Professional Services (từ dòng 54 trở xuống: C = Product [2], J = SKU [9], N = MSRP [13], Q = Disc [16], W = Buy Cost [22])
    for (let r = 53; r < rows.length; r++) {
      const pName = String(rows[r]?.[2] ?? '').trim()
      const existingJ = String(rows[r]?.[9] ?? '').trim()
      if (!pName || existingJ.toLowerCase() === 'sku') continue
      const rowProd = runtime?.descLowerToProduct?.[collapseWsLower(pName)]
      const ev = evaluateProductCalculator(calcData, {
        partnerLevel: ctx.partnerLevel,
        sector: ctx.sector,
        dealType: ctx.dealType,
        product: pName,
        term: ctx.termSubscription,
        qty: 1,
        specialAttribute: 'AA',
        preferredSku: safePrefForProd(rowProd)
      })
      if (ev.foundProduct && ev.available) {
        ensureCell(r, 9, ev.sku)
        ensureCell(r, 13, ev.msrp)
        ensureCell(r, 16, `${ev.resellerDiscPct}%`)
        ensureCell(r, 18, `${ev.promoDiscPct}%`)
        ensureCell(r, 20, `${ev.specialDiscPct}%`)
        ensureCell(r, 22, ev.buyCost)
        if (
          !matchedPs &&
          ((ctxSkuUpper && (ev.sku === ctxSkuUpper || ev.newSku === ctxSkuUpper)) ||
            collapseWsLower(pName) === collapseWsLower(prodEval.productDesc))
        ) {
          psTargetRow = r + 1
          psTargetCol = 'J'
          psTargetSku = ev.sku
          matchedPs = true
        }
      } else if (existingJ && calcSkus[existingJ.toUpperCase()]) {
        const entry = calcSkus[existingJ.toUpperCase()]
        const uCost = resolvePartnerUnitCost(entry, ctx.partnerLevel, ctx.dealType)
        const msrp = round2(entry.msrp)
        const discPct = uCost !== null && msrp > 0 ? round2((1 - uCost / msrp) * 100) : 0
        const buyCost = uCost !== null ? round2(uCost) : msrp
        ensureCell(r, 9, existingJ.toUpperCase())
        ensureCell(r, 13, msrp)
        ensureCell(r, 16, `${discPct}%`)
        ensureCell(r, 22, buyCost)
        if (!matchedPs && ctxSkuUpper && existingJ.toUpperCase() === ctxSkuUpper) {
          psTargetRow = r + 1
          psTargetCol = 'J'
          psTargetSku = existingJ.toUpperCase()
          matchedPs = true
        }
      } else if (ev.foundProduct && !ev.available) {
        // Xoá sạch các dòng dịch vụ US/Taegis không phát hành tại ASEAN
        ensureCell(r, 9, '')
        ensureCell(r, 13, '')
        ensureCell(r, 16, '')
        ensureCell(r, 18, '')
        ensureCell(r, 20, '')
        ensureCell(r, 22, '')
      }
    }

    return { rows, targetRow: psTargetRow, targetColLetter: psTargetCol, targetSku: psTargetSku || prodEval.sku }
  }

  // Trường hợp 5: Network Infrastructure (SD-WAN H20/V20, Access Points H47..H51, Switches H86..H90, Modules & Accessories V106..V343)
  if (sheetName === 'Network Infrastructure') {
    let niTargetRow = 20
    let niTargetCol = 'H'
    let niTargetSku = ''
    let matchedNi = false

    const rawPlug = String(ctx.specialAttribute || 'AU').toUpperCase()
    const plugAttr = rawPlug === 'EUK' ? 'EU' : (['AU', 'EU', 'UK', 'US', 'CN'].includes(rawPlug) ? rawPlug : 'AU')

    // 5a. SD-WAN: Tra cứu chính xác qua mã PC thật trong Product2 (R20ZTCHMR = SD-RED 20 Rev.1, R60ZTCH = SD-RED 60 Rev.1)
    const sdWanSpecs: { col: number; pc: string; matchKey: string }[] = [
      { col: 7, pc: 'R20ZTCHMR', matchKey: 'sd-red 20' },
      { col: 21, pc: 'R60ZTCH', matchKey: 'sd-red 60' }
    ]
    for (const sd of sdWanSpecs) {
      const sdProd: SophosProduct2Item | null =
        runtime?.pcToProduct?.[sd.pc] ||
        runtime?.product2List?.find((p: SophosProduct2Item) => p.desc.toLowerCase().includes(sd.matchKey) && productHasAnyCalcSku(calcData, p)) ||
        null
      const ev = evaluateProductCalculator(calcData, {
        partnerLevel: ctx.partnerLevel,
        sector: ctx.sector,
        dealType: ctx.dealType,
        product: sdProd?.desc || sd.matchKey.toUpperCase(),
        term: ctx.termSubscription,
        qty: ctx.qty || 1,
        specialAttribute: plugAttr,
        preferredSku: safePrefForProd(sdProd)
      })
      ensureCell(13, sd.col, ev.isTermed ? (ev.effectiveTermLabel || ctx.termSubscription || '12 MOS') : 'N/A (One-time)')
      ensureCell(15, sd.col, ev.effectiveQty || ctx.qty || 1)
      if (sd.col === 21) ensureCell(17, sd.col, plugAttr)
      ensureCell(19, sd.col, ev.available ? ev.sku : '')
      ensureCell(21, sd.col, ev.available ? ev.msrp : '')
      ensureCell(23, sd.col, ev.available ? `${ev.promoDiscPct}%` : '')
      ensureCell(25, sd.col, ev.available ? `${ev.specialDiscPct}%` : '')
      ensureCell(27, sd.col, ev.available ? `${ev.resellerDiscPct}%` : '')
      ensureCell(29, sd.col, ev.available ? ev.buyCost : '')
      if (ev.available && !niTargetSku) niTargetSku = ev.sku
      if (
        ev.available &&
        ((ctxSkuUpper && (ev.sku === ctxSkuUpper || ev.newSku === ctxSkuUpper)) ||
          collapseWsLower(prodEval.productDesc).includes(sd.matchKey))
      ) {
        niTargetRow = 20
        niTargetCol = XLSX.utils.encode_col(sd.col)
        niTargetSku = ev.sku
        matchedNi = true
      }
    }

    // 5b. Access Points (AP6 420 / 420E / 420X / 840 / 840E — tại ASEAN chỉ bản ROW và Support có mã SKU trong MSRPs&BuyCost)
    const apMatch = `${prodEval.productDesc || ''} ${ctx.product || ''}`.match(/\b(AP6\s*\d{3}[A-Z]*)\b/i)
    const apModel = apMatch ? apMatch[1].replace(/\s+/g, ' ').toUpperCase() : 'AP6 420'
    const apBundleInfo = resolveFirewallBundleYearSuffix(ctx.termHwBundle || '1-Year') || { code: '12', suffix: '1-year' }
    ensureCell(34, 3, ctx.termHwBundle || '1-Year')
    ensureCell(36, 3, ctx.termSubscription || '12 MOS')
    ensureCell(38, 3, ctx.qty || 1)
    ensureCell(41, 7, apModel)

    for (const rIdx of [46, 48, 50]) {
      const apProd: SophosProduct2Item | null =
        runtime?.product2List?.find((p: SophosProduct2Item) => {
          if (!productHasAnyCalcSku(calcData, p)) return false
          const dl = p.desc.toLowerCase()
          if (!dl.includes(apModel.toLowerCase())) return false
          if (rIdx === 46) return dl.includes('with support') && dl.includes(apBundleInfo.suffix)
          if (rIdx === 50) return dl.includes('support for') || (dl.includes('support') && !dl.includes('with '))
          return !dl.includes('support') && !dl.includes('with ')
        }) || null
      if (apProd) {
        const ev = evaluateProductCalculator(calcData, {
          partnerLevel: ctx.partnerLevel,
          sector: ctx.sector,
          dealType: ctx.dealType,
          product: apProd.desc,
          term: rIdx === 46 ? `${apBundleInfo.code} MOS` : ctx.termSubscription,
          qty: ctx.qty || 1,
          specialAttribute: ctx.specialAttribute,
          preferredSku: safePrefForProd(apProd)
        })
        ensureCell(rIdx, 7, ev.available ? ev.sku : '')
        ensureCell(rIdx, 9, ev.available ? ev.msrp : '')
        ensureCell(rIdx, 11, ev.available ? `${ev.resellerDiscPct}%` : '')
        ensureCell(rIdx, 13, ev.available ? `${ev.promoDiscPct}%` : '')
        ensureCell(rIdx, 15, ev.available ? `${ev.specialDiscPct}%` : '')
        ensureCell(rIdx, 17, ev.available ? ev.buyCost : '')
        if (
          !matchedNi &&
          apMatch &&
          ev.available &&
          ((ctxSkuUpper && (ev.sku === ctxSkuUpper || ev.newSku === ctxSkuUpper)) ||
            collapseWsLower(apProd.desc) === collapseWsLower(prodEval.productDesc) ||
            rIdx === 48)
        ) {
          niTargetRow = rIdx + 1
          niTargetCol = 'H'
          niTargetSku = ev.sku
          if (
            (ctxSkuUpper && (ev.sku === ctxSkuUpper || ev.newSku === ctxSkuUpper)) ||
            collapseWsLower(apProd.desc) === collapseWsLower(prodEval.productDesc)
          ) {
            matchedNi = true
          }
        }
      }
    }

    // 5c. Switches (CS101 / CS110 / CS210 / CS1010)
    const swMatch = `${prodEval.productDesc || ''} ${ctx.product || ''}`.match(/\b(CS\d{3,4}-\d+[A-Z]*)\b/i)
    const swModel = swMatch ? swMatch[1].toUpperCase() : 'CS110-24FP'
    const swBundleInfo = resolveFirewallBundleYearSuffix(ctx.termHwBundle || '1-Year') || { code: '12', suffix: '1-year' }
    ensureCell(74, 3, ctx.termHwBundle || '1-Year')
    ensureCell(76, 3, ctx.termSubscription || '12 MOS')
    ensureCell(78, 3, ctx.qty || 1)
    ensureCell(80, 3, plugAttr)
    ensureCell(80, 7, swModel)

    for (const rIdx of [85, 87, 89]) {
      const swProd =
        runtime?.product2List?.find((p: SophosProduct2Item) => {
          if (!productHasAnyCalcSku(calcData, p)) return false
          const dl = p.desc.toLowerCase()
          if (!dl.includes(swModel.toLowerCase())) return false
          if (rIdx === 85) return dl.includes(swBundleInfo.suffix)
          if (rIdx === 89) return dl.includes('support') && !dl.includes('with ')
          return !dl.includes('support') && !dl.includes('with ') && !dl.includes('power ')
        }) || null
      if (swProd) {
        const ev = evaluateProductCalculator(calcData, {
          partnerLevel: ctx.partnerLevel,
          sector: ctx.sector,
          dealType: ctx.dealType,
          product: swProd.desc,
          term: rIdx === 85 ? `${swBundleInfo.code} MOS` : ctx.termSubscription,
          qty: ctx.qty || 1,
          specialAttribute: plugAttr,
          preferredSku: safePrefForProd(swProd)
        })
        ensureCell(rIdx, 7, ev.available ? ev.sku : '')
        ensureCell(rIdx, 9, ev.available ? ev.msrp : '')
        ensureCell(rIdx, 11, ev.available ? `${ev.resellerDiscPct}%` : '')
        ensureCell(rIdx, 13, ev.available ? `${ev.promoDiscPct}%` : '')
        ensureCell(rIdx, 15, ev.available ? `${ev.specialDiscPct}%` : '')
        ensureCell(rIdx, 17, ev.available ? ev.buyCost : '')
        if (
          !matchedNi &&
          swMatch &&
          ev.available &&
          ((ctxSkuUpper && (ev.sku === ctxSkuUpper || ev.newSku === ctxSkuUpper)) ||
            collapseWsLower(swProd.desc) === collapseWsLower(prodEval.productDesc) ||
            rIdx === 87)
        ) {
          niTargetRow = rIdx + 1
          niTargetCol = 'H'
          niTargetSku = ev.sku
          if (
            (ctxSkuUpper && (ev.sku === ctxSkuUpper || ev.newSku === ctxSkuUpper)) ||
            collapseWsLower(swProd.desc) === collapseWsLower(prodEval.productDesc)
          ) {
            matchedNi = true
          }
        }
      }
    }

    // 5d. Modules, Transceivers & Accessories (từ dòng 105..345: H=Desc [7], V=SKU [21], X=MSRP [23], Z=Disc [25], AF=BuyCost [31])
    for (let r = 104; r < rows.length; r++) {
      const hDesc = String(rows[r]?.[7] ?? '').trim()
      const vCell = String(rows[r]?.[21] ?? '').trim()
      if (!hDesc || vCell.toLowerCase() === 'sku') continue

      const upperV = vCell.toUpperCase()
      if (upperV && calcSkus[upperV]) {
        const entry = calcSkus[upperV]
        const uCost = resolvePartnerUnitCost(entry, ctx.partnerLevel, ctx.dealType)
        const isTarget = Boolean(ctxSkuUpper && upperV === ctxSkuUpper)
        const effQty = isTarget ? Math.max(1, ctx.qty || 1) : 1
        const msrp = round2(entry.msrp * effQty)
        const discPct = uCost !== null && entry.msrp > 0 ? round2((1 - uCost / entry.msrp) * 100) : 0
        const buyCost = uCost !== null ? round2(uCost * effQty) : msrp
        ensureCell(r, 21, upperV)
        ensureCell(r, 23, msrp)
        ensureCell(r, 25, `${discPct}%`)
        ensureCell(r, 31, buyCost)
        if (!matchedNi && isTarget) {
          niTargetRow = r + 1
          niTargetCol = 'V'
          niTargetSku = upperV
          matchedNi = true
        }
        continue
      }

      let rowPlug = plugAttr
      if (/eu\/uk\s+power\s+cord/i.test(hDesc)) rowPlug = 'EU'
      else if (/\buk\s+power\s+cord/i.test(hDesc)) rowPlug = 'UK'
      else if (/\bus\s+power\s+cord/i.test(hDesc)) rowPlug = 'US'
      else if (/\bau\s+power\s+cord/i.test(hDesc)) rowPlug = 'AU'

      const baseDesc = hDesc.replace(/\s*-\s*(?:eu\/uk|au|uk|us|cn|in|jp)\s+power\s+cord\s*$/i, '').trim()
      const rowProd = runtime?.descLowerToProduct?.[collapseWsLower(baseDesc)]
      const ev = evaluateProductCalculator(calcData, {
        partnerLevel: ctx.partnerLevel,
        sector: ctx.sector,
        dealType: ctx.dealType,
        product: baseDesc,
        term: ctx.termSubscription,
        qty: 1,
        specialAttribute: rowPlug,
        preferredSku: safePrefForProd(rowProd)
      })
      if (ev.foundProduct && ev.available) {
        ensureCell(r, 21, ev.sku)
        ensureCell(r, 23, ev.msrp)
        ensureCell(r, 25, `${ev.resellerDiscPct}%`)
        ensureCell(r, 31, ev.buyCost)
        if (
          !matchedNi &&
          ((ctxSkuUpper && (ev.sku === ctxSkuUpper || ev.newSku === ctxSkuUpper)) ||
            (collapseWsLower(baseDesc) === collapseWsLower(prodEval.productDesc) &&
              (rowPlug === plugAttr || !/power\s+cord/i.test(hDesc))))
        ) {
          niTargetRow = r + 1
          niTargetCol = 'V'
          niTargetSku = ev.sku
          matchedNi = true
        }
      } else {
        // Để trống các phụ kiện chỉ bán tại Americas/JP không có trong bảng giá ASEAN
        ensureCell(r, 21, '')
        ensureCell(r, 23, '')
        ensureCell(r, 25, '')
        ensureCell(r, 31, '')
      }
    }

    return { rows, targetRow: niTargetRow, targetColLetter: niTargetCol, targetSku: niTargetSku || prodEval.sku }
  }

  // Trường hợp 6: MDR calculator (P11=Users [10,15], P13=Servers [12,15], F21=Term [20,5], Scenario 1 rows 23..41: F=Selected [5], I=SKU [8], K=MSRP [10], M=Disc [12], O=Promo [14], Q=Special [16], S=BuyCost [18])
  if (sheetName === 'MDR calculator') {
    let mdrEv = prodEval
    const isMdrRelated =
      mdrEv.available &&
      /\bmdr\b|managed detection|retainer|siem|onboarding|managed risk/i.test(mdrEv.productDesc || '')
    if (!isMdrRelated) {
      const defMdr = findDefaultProductForCalcSheet(calcData, 'MDR calculator')
      if (defMdr) {
        mdrEv = evaluateProductCalculator(calcData, {
          partnerLevel: ctx.partnerLevel,
          sector: ctx.sector,
          dealType: ctx.dealType,
          product: defMdr.prod.desc,
          term: ctx.termSubscription || '12 MOS',
          qty: ctx.qty || 1,
          specialAttribute: 'AA'
        })
      }
    }

    const pLower = (mdrEv.productDesc || 'Sophos MDR - User').toLowerCase()
    const isServer = /\bserver\b/i.test(pLower)
    const effQty = mdrEv.effectiveQty || ctx.qty || 1
    ensureCell(10, 15, isServer ? 0 : effQty)
    ensureCell(12, 15, isServer ? effQty : 0)
    ensureCell(20, 5, mdrEv.effectiveTermLabel || ctx.termSubscription || '12 MOS')

    let mdrRowIdx = 22 // Row 23: Service tier (User)
    if (isServer) mdrRowIdx = 24 // Row 25: Server
    else if (/retainer|incident/i.test(pLower)) mdrRowIdx = 26 // Row 27
    else if (/siem/i.test(pLower)) mdrRowIdx = 28 // Row 29
    else if (/onboarding|implementation/i.test(pLower)) mdrRowIdx = 38 // Row 39
    else if (/managed risk|vulnerability/i.test(pLower)) mdrRowIdx = 40 // Row 41

    ensureCell(mdrRowIdx, 5, mdrEv.productDesc || 'Sophos MDR - User')
    ensureCell(mdrRowIdx, 8, mdrEv.available ? mdrEv.sku : '')
    ensureCell(mdrRowIdx, 10, mdrEv.available ? mdrEv.msrp : '')
    ensureCell(mdrRowIdx, 12, mdrEv.available ? `${mdrEv.resellerDiscPct}%` : '')
    ensureCell(mdrRowIdx, 14, mdrEv.available ? `${mdrEv.promoDiscPct}%` : '')
    ensureCell(mdrRowIdx, 16, mdrEv.available ? `${mdrEv.specialDiscPct}%` : '')
    ensureCell(mdrRowIdx, 18, mdrEv.available ? mdrEv.buyCost : '')
    if (mdrEv.available) {
      ensureCell(43, 10, mdrEv.msrp)
      ensureCell(43, 18, mdrEv.buyCost)
    }
    return { rows, targetRow: mdrRowIdx + 1, targetColLetter: 'I', targetSku: mdrEv.sku }
  }

  // Trường hợp 7: Network Detection & Response (E12=Term [11,4], E14=Qty [13,4], E22=Plug [21,4], E24=HW Qty [23,4], H33=Model [32,7], SKU tại cột H=7, MSRP=K=10, Disc=M=12, Promo=O=14, Special=Q=16, BuyCost=S=18)
  if (sheetName === 'Network Detection & Response') {
    let ndrEv = prodEval
    const isNdrRelated =
      ndrEv.available &&
      (String(ndrEv.productCode || '').toUpperCase() === 'NDR' ||
        /\bndr\b|network detection and response/i.test(ndrEv.productDesc || ''))
    if (!isNdrRelated) {
      const defNdr = findDefaultProductForCalcSheet(calcData, 'Network Detection & Response')
      if (defNdr) {
        ndrEv = evaluateProductCalculator(calcData, {
          partnerLevel: ctx.partnerLevel,
          sector: ctx.sector,
          dealType: ctx.dealType,
          product: defNdr.prod.desc,
          term: ctx.termSubscription || '12 MOS',
          qty: ctx.qty || 1,
          specialAttribute: ctx.specialAttribute || 'AA'
        })
      }
    }

    const rawPlug = String(ctx.specialAttribute || 'AU').toUpperCase()
    const plugAttr = rawPlug === 'EUK' ? 'EU' : (['AU', 'EU', 'UK', 'US', 'CN'].includes(rawPlug) ? rawPlug : 'AU')
    ensureCell(11, 4, ndrEv.effectiveTermLabel || ctx.termSubscription || '12 MOS')
    ensureCell(13, 4, ndrEv.effectiveQty || ctx.qty || 1)
    ensureCell(21, 4, plugAttr)
    ensureCell(23, 4, 1)
    ensureCell(32, 7, 'NDR 5500')

    const pDescLower = (ndrEv.productDesc || '').toLowerCase()
    let ndrRowIdx = 38 // Row 39: Subscription (Central Network Detection and Response)
    if (/ips-ids|intrusion/i.test(pDescLower)) ndrRowIdx = 46 // Row 47
    else if (/support/i.test(pDescLower) || ndrEv.prodType === 'Support') ndrRowIdx = 48 // Row 49
    else if (/appliance|hardware|with central network detection/i.test(pDescLower) || ndrEv.prodType === 'Appliance') ndrRowIdx = 42 // Row 43

    ensureCell(ndrRowIdx, 7, ndrEv.available ? ndrEv.sku : '')
    ensureCell(ndrRowIdx, 10, ndrEv.available ? ndrEv.msrp : '')
    ensureCell(ndrRowIdx, 12, ndrEv.available ? `${ndrEv.resellerDiscPct}%` : '')
    ensureCell(ndrRowIdx, 14, ndrEv.available ? `${ndrEv.promoDiscPct}%` : '')
    ensureCell(ndrRowIdx, 16, ndrEv.available ? `${ndrEv.specialDiscPct}%` : '')
    ensureCell(ndrRowIdx, 18, ndrEv.available ? ndrEv.buyCost : '')
    return { rows, targetRow: ndrRowIdx + 1, targetColLetter: 'H', targetSku: ndrEv.sku }
  }

  // Trường hợp 7b: Các Sheet 3 Cột Song Song (Endpoint & Server, XDR & Next-Gen SIEM, Managed Services: Cột G=6, M=12, Q=16)
  if (sheetName === 'Endpoint & Server' || sheetName === 'XDR & Next-Gen SIEM' || sheetName === 'Managed Services') {
    const isEp = sheetName === 'Endpoint & Server'
    const isXdr = sheetName === 'XDR & Next-Gen SIEM'
    const rProd = isEp ? 15 : 14
    const rTerm = isEp ? 17 : 16
    const rQty = isEp ? 19 : 18
    const rSpec = isEp ? 21 : isXdr ? 20 : -1
    const rSku = isEp ? 23 : 22
    const rUnit = isEp ? 25 : 24
    const rMsrp = isEp ? 27 : 26
    const rPromo = isEp ? 29 : 28
    const rSpecial = isEp ? 31 : 30
    const rDisc = isEp ? 33 : 32
    const rBuy = isEp ? 35 : 34
    const rFeat = isEp ? 37 : 36

    const colDefaults: Record<number, string> = isEp
      ? { 6: 'Sophos Endpoint - User', 12: 'Sophos Endpoint - Server', 16: 'Central Device Encryption' }
      : isXdr
        ? { 6: 'Sophos XDR - User', 12: 'Sophos Next-Gen SIEM', 16: 'Sophos Next-Gen SIEM - 3 yr Data Addon' }
        : { 6: 'Central Managed Risk', 12: 'Sophos MDR - Server', 16: 'German Language MDR Service Add-on' }

    const mappedNative = prodEval.foundProduct
      ? mapProductToNativeSheet(
          runtime?.descToProduct?.[prodEval.productDesc] || null,
          ctx.family,
          ctx.productLine,
          calcData
        )
      : ''
    const belongsHere = prodEval.available && mappedNative === sheetName
    let targetCol = 6
    if (belongsHere) {
      const pd = (prodEval.productDesc || '').toLowerCase()
      const pcU = (prodEval.productCode || '').toUpperCase()
      if (isEp) {
        if (/encryption|legacy\s+platform/i.test(pd) || ['CDE', 'CEP-LP'].includes(pcU)) targetCol = 16
        else if (/\bserver\b/i.test(pd)) targetCol = 12
        else targetCol = 6
      } else if (isXdr) {
        if (/addon|add-on|data/i.test(pd)) targetCol = 16
        else if (/siem/i.test(pd)) targetCol = 12
        else targetCol = 6
      } else {
        if (/addon|add-on|language/i.test(pd)) targetCol = 16
        else if (/\bserver\b/i.test(pd)) targetCol = 12
        else targetCol = 6
      }
    }

    let resolvedSku = ''
    for (const cIdx of [6, 12, 16]) {
      const useTargetEv = belongsHere && cIdx === targetCol
      const colProdName = useTargetEv ? prodEval.productDesc : colDefaults[cIdx]
      const colProdObj = runtime?.descToProduct?.[colProdName] || runtime?.descLowerToProduct?.[collapseWsLower(colProdName)] || null
      const ev = useTargetEv
        ? prodEval
        : evaluateProductCalculator(calcData, {
            partnerLevel: ctx.partnerLevel,
            sector: ctx.sector,
            dealType: ctx.dealType,
            product: colProdObj?.desc || colProdName,
            term: ctx.termSubscription || '12 MOS',
            qty: cIdx === targetCol ? (ctx.qty || 1) : 1,
            specialAttribute: cIdx === targetCol ? (ctx.specialAttribute || 'AA') : 'AA',
            preferredSku: cIdx === targetCol ? safePrefForProd(colProdObj) : undefined
          })

      ensureCell(rProd, cIdx, ev.productDesc || colProdName)
      ensureCell(rTerm, cIdx, ev.isTermed ? (ev.effectiveTermLabel || ctx.termSubscription || '12 MOS') : 'N/A (One-time)')
      ensureCell(rQty, cIdx, ev.effectiveQty || (cIdx === targetCol ? ctx.qty || 1 : 1))
      if (rSpec >= 0) {
        const specLabel = /cu|competitive/i.test(cIdx === targetCol ? ctx.specialAttribute : 'AA')
          ? 'Competitive Upgrade'
          : 'Standard Pricing'
        ensureCell(rSpec, cIdx, specLabel)
      }
      ensureCell(rSku, cIdx, ev.available ? ev.sku : '')
      ensureCell(rUnit, cIdx, ev.available ? ev.unitMsrp : '')
      ensureCell(rMsrp, cIdx, ev.available ? ev.msrp : '')
      ensureCell(rPromo, cIdx, ev.available ? `${ev.promoDiscPct}%` : '')
      ensureCell(rSpecial, cIdx, ev.available ? `${ev.specialDiscPct}%` : '')
      ensureCell(rDisc, cIdx, ev.available ? `${ev.resellerDiscPct}%` : '')
      ensureCell(rBuy, cIdx, ev.available ? ev.buyCost : '')
      if (ev.features && rFeat < rows.length) {
        ensureCell(rFeat, cIdx, ev.features)
      }
      if (cIdx === targetCol && ev.available) {
        resolvedSku = ev.sku
      }
    }

    return {
      rows,
      targetRow: rSku + 1,
      targetColLetter: XLSX.utils.encode_col(targetCol),
      targetSku: resolvedSku || prodEval.sku
    }
  }

  // Trường hợp 8: Các Sheet Product Calculator 1 cột dọc tiêu chuẩn (Universal Calculator, AI Defense, CISO Advantage, ITDR, Backup & Recovery)
  const valCol = 6 // Cột G
  let activeEv = prodEval
  let activeFamily = ctx.family
  let activeLine = ctx.productLine

  // Nếu là Sheet cố định 1 sản phẩm (AI Defense, CISO Advantage, ITDR, Backup & Recovery) có mã PC tại G8 hoặc tên SP tại G10
  if (sheetName !== 'Universal Calculator') {
    const fixedPc = String(rows[7]?.[valCol] ?? '').trim().toUpperCase()
    const fixedDesc = String(rows[9]?.[valCol] ?? '').trim()
    const fixedProd: SophosProduct2Item | null =
      (fixedPc && runtime?.pcToProduct?.[fixedPc]) ||
      (fixedDesc && (runtime?.descToProduct?.[fixedDesc] || runtime?.descLowerToProduct?.[collapseWsLower(fixedDesc)])) ||
      null
    if (
      fixedProd &&
      (!activeEv.available || collapseWsLower(activeEv.productDesc) !== collapseWsLower(fixedProd.desc))
    ) {
      activeEv = evaluateProductCalculator(calcData, {
        partnerLevel: ctx.partnerLevel,
        sector: ctx.sector,
        dealType: ctx.dealType,
        product: fixedProd.desc,
        term: ctx.termSubscription || '12 MOS',
        qty: ctx.qty || 1,
        specialAttribute: ctx.specialAttribute || 'AA',
        preferredSku: safePrefForProd(fixedProd)
      })
    }
  } else if (!activeEv.available) {
    const defUniv = findDefaultProductForCalcSheet(calcData, 'Universal Calculator')
    if (defUniv) {
      activeFamily = defUniv.family
      activeLine = defUniv.productLine
      activeEv = evaluateProductCalculator(calcData, {
        partnerLevel: ctx.partnerLevel,
        sector: ctx.sector,
        dealType: ctx.dealType,
        family: defUniv.family,
        productLine: defUniv.productLine,
        product: defUniv.prod.desc,
        term: ctx.termSubscription || '12 MOS',
        qty: ctx.qty || 1,
        specialAttribute: 'AA'
      })
    }
  }

  let skuRowNum = 0
  for (let r = 6; r < Math.min(rows.length, 42); r++) {
    const lbl = String(rows[r]?.[2] ?? rows[r]?.[1] ?? '').trim().toLowerCase()
    if (!lbl) continue
    if (lbl.startsWith('term') && !skuRowNum) {
      ensureCell(
        r,
        valCol,
        activeEv.isTermed ? (activeEv.effectiveTermLabel || ctx.termSubscription || '12 MOS') : 'N/A (One-time)'
      )
    } else if (lbl.startsWith('solution family') && !skuRowNum) {
      ensureCell(r, valCol, activeFamily || 'Endpoint_Security')
    } else if (lbl.startsWith('product line') && !skuRowNum) {
      ensureCell(r, valCol, activeLine || 'Endpoint_User')
    } else if (lbl.startsWith('product') && !lbl.includes('line') && !skuRowNum) {
      ensureCell(r, valCol, activeEv.productDesc || ctx.product)
    } else if ((lbl.startsWith('qty') || lbl.startsWith('quantity')) && !skuRowNum) {
      ensureCell(r, valCol, activeEv.effectiveQty || ctx.qty || 1)
    } else if (lbl.startsWith('special attribute') && !skuRowNum) {
      ensureCell(r, valCol, ctx.specialAttribute || 'AA')
    } else if (lbl === 'sku' && !skuRowNum) {
      skuRowNum = r + 1
      ensureCell(r, valCol, activeEv.available ? activeEv.sku : '')
    } else if (lbl === 'unit msrp' && skuRowNum && r < skuRowNum + 12) {
      ensureCell(r, valCol, activeEv.available ? activeEv.unitMsrp : '')
    } else if (lbl === 'msrp' && skuRowNum && r < skuRowNum + 12) {
      ensureCell(r, valCol, activeEv.available ? activeEv.msrp : '')
    } else if (lbl.startsWith('promo disc') && skuRowNum && r < skuRowNum + 14) {
      ensureCell(r, valCol, activeEv.available ? `${activeEv.promoDiscPct}%` : '')
    } else if (lbl.startsWith('special disc') && skuRowNum && r < skuRowNum + 14) {
      ensureCell(r, valCol, activeEv.available ? `${activeEv.specialDiscPct}%` : '')
    } else if (lbl.startsWith('suggested reseller disc') && skuRowNum && r < skuRowNum + 16) {
      ensureCell(r, valCol, activeEv.available ? `${activeEv.resellerDiscPct}%` : '')
    } else if (lbl.startsWith('buy cost') && skuRowNum && r < skuRowNum + 18) {
      ensureCell(r, valCol, activeEv.available ? activeEv.buyCost : '')
      if (activeEv.features && r + 2 < rows.length) {
        ensureCell(r + 2, valCol, activeEv.features)
      }
      break
    }
  }

  return {
    rows,
    targetRow: skuRowNum || 18,
    targetColLetter: XLSX.utils.encode_col(valCol),
    targetSku: activeEv.sku
  }
}

/**
 * Tạo file Excel (.xlsx) đầy đủ màu sắc, gộp ô, độ rộng cột và ĐÃ ĐIỀN SẴN GIÁ TRỊ CÔNG THỨC (SKU, MSRP, Reseller Disc %, Buy Cost)
 * để Microsoft ViewOffice (view.officeapps.live.com) mở trực tiếp đúng Sheet & đúng Ô mã SKU đang đối chiếu!
 */
export function buildPopulatedSophosCalcViewOfficeWorkbook(
  calcData: any,
  inputCtx?: SophosInferredCalcContext | null,
  opts?: { preferredSheet?: string }
): {
  blob: Blob
  targetSheet: string
  targetRow: number
  targetColLetter: string
  targetSku: string
  activeCellRef: string
} {
  const ctx: SophosInferredCalcContext =
    inputCtx ||
    inferSophosCalculatorContext(calcData, '', {
      Ten_hang: 'XGS 2300'
    })

  const rawSheets: Record<string, any[][]> = calcData?.calcSheetsRaw || {}
  const styledSheets: Record<string, any> = calcData?.calcSheetsStyled || {}
  const visibleNames: string[] = Array.isArray(calcData?.calcVisibleSheetNames) && calcData.calcVisibleSheetNames.length
    ? [...calcData.calcVisibleSheetNames]
    : Object.keys(rawSheets)

  let targetSheet = String(opts?.preferredSheet || ctx.nativeSheet || (ctx.calcType === 'firewall' ? 'Firewall' : 'Universal Calculator')).trim()
  if (!rawSheets[targetSheet]) {
    targetSheet = rawSheets['Firewall'] ? 'Firewall' : (visibleNames[0] || 'Cover')
  }

  // Đưa targetSheet lên vị trí tab đầu tiên & đánh dấu activeTab để ViewOffice mở thẳng vào sheet đối chiếu ngay lập tức
  const orderedSheets: string[] = []
  if (rawSheets[targetSheet]) orderedSheets.push(targetSheet)
  for (const sName of visibleNames) {
    if (sName !== targetSheet && rawSheets[sName]) {
      orderedSheets.push(sName)
    }
  }

  const outWb = XLSX.utils.book_new()
  let resolvedTargetRow = 29
  let resolvedTargetColLetter = 'H'
  let resolvedTargetSku = ctx.sku || ''

  for (const sName of orderedSheets) {
    const baseRows = rawSheets[sName] || []
    const sheetCtx = resolveSheetContextForWorkbook(calcData, sName, ctx, targetSheet)
    const overlaid = overlayCalculatedSheetAoa(calcData, sName, baseRows, sheetCtx)
    if (sName === targetSheet) {
      resolvedTargetRow = overlaid.targetRow
      resolvedTargetColLetter = overlaid.targetColLetter
      if (overlaid.targetSku) resolvedTargetSku = overlaid.targetSku
    }

    const ws = XLSX.utils.aoa_to_sheet(overlaid.rows)
    const stMeta = styledSheets[sName]
    const merges: { top: number; bottom: number; left: number; right: number }[] = Array.isArray(stMeta?.merges) ? stMeta.merges : []

    if (merges.length) {
      ws['!merges'] = merges.map(m => ({
        s: { r: Math.max(0, m.top - 1), c: Math.max(0, m.left - 1) },
        e: { r: Math.max(0, m.bottom - 1), c: Math.max(0, m.right - 1) }
      }))
    }

    let sheetMaxCols = Array.isArray(stMeta?.colWidths) ? stMeta.colWidths.length : 0
    for (const r of overlaid.rows) {
      if (Array.isArray(r) && r.length > sheetMaxCols) sheetMaxCols = r.length
    }
    const computedColWpx: number[] = Array.from({ length: sheetMaxCols }, (_, cIdx) => {
      const rawW = Array.isArray(stMeta?.colWidths) ? stMeta.colWidths[cIdx] : undefined
      if (rawW === 0) return 0
      if (rawW !== undefined && rawW !== null) return Math.max(46, Math.min(440, Number(rawW) || 95))
      return 105
    })

    const isNoWrapCalcToken = (v: any): boolean => {
      if (typeof v === 'number' && Number.isFinite(v)) return true
      if (typeof v !== 'string') return false
      const s = v.trim()
      if (!s || s.length > 28) return false
      if (/^\$?\s*-?[\d,]+(?:\.\d+)?\s*%?$/.test(s)) return true
      if (/^[A-Z0-9][A-Z0-9._-]{5,24}$/i.test(s) && /[A-Z]/i.test(s) && /\d/.test(s)) return true
      return false
    }

    const formatApproxCalcDisplay = (v: any, rIdx: number, cIdx: number, valRow: any[]): string => {
      if (typeof v === 'number' && Number.isFinite(v)) {
        const leftLbl = String(valRow[2] ?? valRow[1] ?? '').toLowerCase()
        const isCurrencyNum =
          cIdx >= 6 && rIdx >= 14 && v > 1 && !leftLbl.startsWith('qty') && !leftLbl.startsWith('quantity')
        if (isCurrencyNum) {
          return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
        return Number.isInteger(v)
          ? v.toLocaleString('en-US')
          : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }
      return String(v ?? '').trim()
    }

    for (let r = 0; r < overlaid.rows.length; r++) {
      const valRow = overlaid.rows[r] || []
      for (let c = 0; c < valRow.length; c++) {
        const val = valRow[c]
        if (!isNoWrapCalcToken(val)) continue
        const disp = formatApproxCalcDisplay(val, r, c, valRow)
        if (!disp) continue
        const neededPx = Math.min(320, Math.ceil(disp.length * 9.2 + 24))
        const hitMerge = merges.find(
          m => r >= m.top - 1 && r <= m.bottom - 1 && c >= m.left - 1 && c <= m.right - 1
        )
        if (hitMerge && hitMerge.right > hitMerge.left) {
          if (c !== hitMerge.left - 1) continue
          let spanSum = 0
          for (let sc = hitMerge.left - 1; sc <= hitMerge.right - 1; sc++) {
            spanSum += computedColWpx[sc] || 0
          }
          if (spanSum > 0 && spanSum < neededPx) {
            computedColWpx[c] = (computedColWpx[c] || 95) + (neededPx - spanSum)
          }
        } else if (computedColWpx[c] > 0 && computedColWpx[c] < neededPx) {
          computedColWpx[c] = neededPx
        }
      }
    }

    if (computedColWpx.length) {
      ws['!cols'] = computedColWpx.map((w: number) =>
        w === 0 ? { hidden: true, wpx: 0 } : { wpx: w }
      )
    }

    const palette: any[] = Array.isArray(stMeta?.stylePalette) ? stMeta.stylePalette : []
    const cellStyles: (number | null)[][] = Array.isArray(stMeta?.cellStyles) ? stMeta.cellStyles : []
    if (palette.length && cellStyles.length) {
      for (let r = 0; r < overlaid.rows.length; r++) {
        const stRow = cellStyles[r]
        const valRow = overlaid.rows[r] || []
        const maxC = Math.max(stRow ? stRow.length : 0, valRow.length)
        for (let c = 0; c < maxC; c++) {
          const pIdx = stRow ? stRow[c] : null
          const val = valRow[c]
          if ((pIdx === null || pIdx === undefined) && (val === null || val === undefined || val === '')) continue
          const addr = XLSX.utils.encode_cell({ r, c })
          if (!ws[addr]) {
            ws[addr] = { t: 's', v: '' }
          }
          const pObj = pIdx !== null && pIdx !== undefined ? palette[pIdx] : null
          const noWrapCell = isNoWrapCalcToken(val)
          const cellStyle: any = {
            font: {
              name: 'Calibri',
              sz: pObj?.sz || 10,
              bold: Boolean(pObj?.b),
              italic: Boolean(pObj?.i),
              ...(pObj?.fg ? { color: { rgb: String(pObj.fg).replace('#', '') } } : {})
            },
            alignment: {
              horizontal: pObj?.al || (typeof val === 'number' ? 'right' : 'left'),
              vertical: pObj?.val || 'center',
              wrapText: !noWrapCell
            }
          }
          if (pObj?.bg) {
            cellStyle.fill = {
              patternType: 'solid',
              fgColor: { rgb: String(pObj.bg).replace('#', '') }
            }
          }
          if (typeof val === 'number' && c >= 6 && r >= 14 && val > 1) {
            const leftLbl = String(valRow[2] ?? valRow[1] ?? '').toLowerCase()
            if (!leftLbl.startsWith('qty') && !leftLbl.startsWith('quantity')) {
              ws[addr].z = '$#,##0.00'
            }
          }
          ws[addr].s = cellStyle
        }
      }
    }

    // Tô nổi bật (Highlight vàng + viền đỏ đậm) đúng ô chứa mã SKU đang đối chiếu trên targetSheet
    if (sName === targetSheet && resolvedTargetRow >= 1) {
      const targetR = resolvedTargetRow - 1
      const targetC = XLSX.utils.decode_col(resolvedTargetColLetter || 'H')
      let rStart = targetR
      let rEnd = targetR
      let cStart = targetC
      let cEnd = targetC
      for (const m of merges) {
        if (targetR >= m.top - 1 && targetR <= m.bottom - 1 && targetC >= m.left - 1 && targetC <= m.right - 1) {
          rStart = m.top - 1
          rEnd = m.bottom - 1
          cStart = m.left - 1
          cEnd = m.right - 1
          break
        }
      }
      const highlightBorder = {
        top: { style: 'medium', color: { rgb: 'DC2626' } },
        bottom: { style: 'medium', color: { rgb: 'DC2626' } },
        left: { style: 'medium', color: { rgb: 'DC2626' } },
        right: { style: 'medium', color: { rgb: 'DC2626' } }
      }
      for (let hr = rStart; hr <= rEnd; hr++) {
        for (let hc = cStart; hc <= cEnd; hc++) {
          const hAddr = XLSX.utils.encode_cell({ r: hr, c: hc })
          if (!ws[hAddr]) ws[hAddr] = { t: 's', v: '' }
          ws[hAddr].s = {
            fill: { patternType: 'solid', fgColor: { rgb: 'FEF08A' } },
            font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '991B1B' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
            border: highlightBorder
          }
        }
      }
    }

    XLSX.utils.book_append_sheet(outWb, ws, sName.slice(0, 31))
  }

  // Thêm sheet tra cứu nhanh bảng giá gốc MSRPs&BuyCost quanh mã SKU đang đối chiếu để kiểm chứng chéo trong ViewOffice
  const lookupSku = String(resolvedTargetSku || ctx.sku || '').trim().toUpperCase()
  const skuHit = lookupSku ? calcData?.calcSkus?.[lookupSku] : null
  const allMsrpRows: any[] = Array.isArray(calcData?.sortedCalcMsrpRows) ? calcData.sortedCalcMsrpRows : []
  if (allMsrpRows.length > 0) {
    const msrpAoa: any[][] = [
      ['Excel Row', 'SKU', 'Product Code', 'Description', 'Type', 'MSRP (USD)', 'Auth Std', 'Auth Reg', 'Auth Inc', 'Silver Std', 'Gold Std', 'Plat Std']
    ]
    let startIdx = 0
    if (skuHit) {
      const hitIdx = allMsrpRows.findIndex(x => x && x.sku === lookupSku)
      if (hitIdx >= 0) startIdx = Math.max(0, hitIdx - 25)
    }
    const slice = allMsrpRows.slice(startIdx, startIdx + 120)
    for (const r of slice) {
      if (!r) continue
      msrpAoa.push([
        r.rowNum,
        r.sku,
        r.pc,
        r.desc,
        r.prodType,
        r.msrp,
        r.stdAuth,
        r.regAuth,
        r.incAuth,
        r.stdSilv,
        r.stdGold,
        r.stdPlat
      ])
    }
    const msrpWs = XLSX.utils.aoa_to_sheet(msrpAoa)
    msrpWs['!cols'] = [
      { wpx: 70 }, { wpx: 145 }, { wpx: 115 }, { wpx: 280 }, { wpx: 105 },
      { wpx: 95 }, { wpx: 90 }, { wpx: 90 }, { wpx: 90 }, { wpx: 90 }, { wpx: 90 }, { wpx: 90 }
    ]
    XLSX.utils.book_append_sheet(outWb, msrpWs, 'MSRPs&BuyCost')
  }

  if (!outWb.SheetNames.length) {
    XLSX.utils.book_append_sheet(outWb, XLSX.utils.aoa_to_sheet([['Sophos Reseller Calculator']]), 'Cover')
  }

  ;(outWb as any).Workbook = {
    Views: [{ activeTab: 0 }]
  }

  const xlsxBuf = XLSX.write(outWb, { bookType: 'xlsx', type: 'array', compression: true })
  const blob = new Blob([xlsxBuf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const safeSheet = outWb.SheetNames[0] || targetSheet
  const activeCellRef = `'${safeSheet}'!${resolvedTargetColLetter}${resolvedTargetRow}`

  return {
    blob,
    targetSheet: safeSheet,
    targetRow: resolvedTargetRow,
    targetColLetter: resolvedTargetColLetter,
    targetSku: resolvedTargetSku,
    activeCellRef
  }
}
