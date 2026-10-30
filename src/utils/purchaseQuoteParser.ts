import * as XLSX from 'xlsx-js-style'
import Tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.js?url'
import { callDeepSeek } from '../services/deepseek'

if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
}

export interface ParsedPurchaseItem {
  uid: string
  Ma_hang: string
  sku_code?: string
  Ten_hang: string
  Description: string
  Features: string
  Danh_muc: string
  Type: string
  License_duration: string
  thoi_han_bao_hanh: string
  DVT: string
  So_luong: number
  Don_gia: number
  Gia_tieu_chuan: number
  gia_nhap: number
  gia_hardware: number
  muc_phan_tram_off: number
  Thue_VAT: number
  Don_vi_tien_te: string
  Ti_gia: number
  Ten_nha_cung_cap: string
  Ma_nha_cung_cap: string
  Trang_thai: string
  Mo_ta_chung: string
  Mo_ta_chi_tiet: string
  Ma_hang_lien_ket: string
  Ten_hang_lien_ket: string
  Ghi_chu: string
  Main_img: string
  volume: string
  Sheet_name?: string
  _hasExplicitMaHang?: boolean
  _rawPs?: string
  _rawMota?: string
  _donGiaTruocThue?: number
  _listPrice?: number
  _giaVon?: number
  _sttIndex?: number
}

export function removeDiacriticsSimple(str: string): string {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export function parseCleanNumber(raw: any): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  const cleaned = String(raw ?? '').replace(/[^\d.,-]/g, '').trim()
  if (!cleaned) return 0
  if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, '')) || 0
  }
  if (/^-?\d{1,3}(,\d{3})+$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/,/g, '')) || 0
  }
  if (/^-?\d+(\.\d{3})+,\d+$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0
  }
  if (/^-?\d+(,\d{3})+\.\d+$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/,/g, '')) || 0
  }
  return parseFloat(cleaned.replace(/,/g, '')) || 0
}

export function extractDeepSeekText(result: any): string {
  if (!result) return ''
  if (typeof result === 'string') return result
  if (result?.choices && Array.isArray(result.choices) && result.choices.length > 0) {
    return String(result.choices[0]?.message?.content || result.choices[0]?.text || '')
  }
  if (result?.output && Array.isArray(result.output)) {
    const messageObj = result.output.find((item: any) => item.type === 'message')
    if (messageObj && Array.isArray(messageObj.content)) {
      const textObj = messageObj.content.find((c: any) => c.type === 'output_text')
      if (textObj?.text) return String(textObj.text)
    }
    return JSON.stringify(result.output)
  }
  if (result?.output && typeof result.output === 'object' && result.output.text) {
    return String(result.output.text)
  }
  return JSON.stringify(result)
}

export function extractMetadataFromBulletLines(linesText: string) {
  let partNumber = ''
  let duration = ''
  let warranty = ''
  let itemType = ''

  const lines = String(linesText || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    const clean = line.replace(/^[•\-+*·\s]+/, '').trim()
    if (!partNumber) {
      const pnMatch = clean.match(/^(?:part\s*number|p\/n|pn|sku|mã\s*hàng|mã\s*sp|model)\s*:\s*(.+)$/i)
      if (pnMatch && pnMatch[1]) {
        partNumber = pnMatch[1].trim()
      }
    }
    if (!duration) {
      const durMatch = clean.match(/^(?:chu\s*kỳ|thời\s*hạn|term|duration|hạn\s*dùng)\s*:\s*(.+)$/i)
      if (durMatch && durMatch[1]) {
        duration = durMatch[1].trim()
      }
    }
    if (!warranty) {
      const warMatch = clean.match(/^(?:bảo\s*hành|warranty)\s*:\s*(.+)$/i)
      if (warMatch && warMatch[1]) {
        warranty = warMatch[1].trim()
      }
    }
    if (!itemType) {
      const typeMatch = clean.match(/^(?:type|loại|hình\s*thức)\s*:\s*(.+)$/i)
      if (typeMatch && typeMatch[1]) {
        itemType = typeMatch[1].trim()
      }
    }
  }

  return { partNumber, duration, warranty, itemType }
}

/**
 * Phân tích các dòng tổng kết VAT ở cuối bảng (VD: "VAT 8% (2) và KCT (1): 800000", "Phần mềm không chịu thuế VAT")
 * và tính lại đơn giá sau thuế (Gia_tieu_chuan = Giá vốn / Giá off hãng) cho từng dòng hàng hóa.
 */
export function applySummaryVatAndComputeAfterTaxCost(
  items: any[],
  summaryLines: string[],
  isPurchaseMode: boolean = true
) {
  if (!items || items.length === 0) return

  const assignedIndices = new Set<number>()

  const parseIndexList = (rawList: string): number[] => {
    const nums: number[] = []
    const tokens = String(rawList || '').split(/[,;&\s]+|và|and/i).map(s => s.trim()).filter(Boolean)
    for (const tk of tokens) {
      const rangeMatch = tk.match(/^(\d+)\s*-\s*(\d+)$/)
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10)
        const end = parseInt(rangeMatch[2], 10)
        for (let k = Math.min(start, end); k <= Math.max(start, end); k++) {
          nums.push(k)
        }
      } else if (/^\d+$/.test(tk)) {
        nums.push(parseInt(tk, 10))
      }
    }
    return nums
  }

  const findItemIndexByStt = (sttNum: number): number => {
    const byExplicitStt = items.findIndex(it => Number(it._sttIndex) === sttNum)
    if (byExplicitStt !== -1) return byExplicitStt
    if (sttNum >= 1 && sttNum <= items.length) return sttNum - 1
    return -1
  }

  // Bước 1: Kiểm tra các dòng có chỉ định rõ STT chịu thuế / KCT như "VAT 8% (2) và KCT (1)"
  for (const rawLine of summaryLines) {
    const line = String(rawLine || '').trim()
    if (!line) continue

    const vatIdxRegex = /(?:VAT|THUẾ(?:\s+GTGT|\s+VAT)?)\s*(\d+(?:\.\d+)?)\s*%\s*\(([^)]+)\)/gi
    let mVat: RegExpExecArray | null
    while ((mVat = vatIdxRegex.exec(line)) !== null) {
      const rate = parseFloat(mVat[1]) || 0
      const indices = parseIndexList(mVat[2])
      for (const sttNum of indices) {
        const idx = findItemIndexByStt(sttNum)
        if (idx !== -1) {
          items[idx].Thue_VAT = rate
          assignedIndices.add(idx)
        }
      }
    }

    const kctIdxRegex = /(?:KCT|KHÔNG\s+CHỊU\s+THUẾ(?:\s+VAT)?|MIỄN\s+THUẾ)\s*\(([^)]+)\)/gi
    let mKct: RegExpExecArray | null
    while ((mKct = kctIdxRegex.exec(line)) !== null) {
      const indices = parseIndexList(mKct[1])
      for (const sttNum of indices) {
        const idx = findItemIndexByStt(sttNum)
        if (idx !== -1) {
          items[idx].Thue_VAT = 0
          assignedIndices.add(idx)
        }
      }
    }
  }

  // Bước 2: Nếu chưa có chỉ định theo STT cụ thể, kiểm tra dòng VAT chung của cả bảng
  if (assignedIndices.size === 0) {
    for (const rawLine of summaryLines) {
      const line = String(rawLine || '').trim()
      if (!line) continue
      const upper = line.toUpperCase()
      if (upper.includes('TỔNG CHƯA VAT') || upper.includes('CHƯA BAO GỒM')) continue

      const generalVatMatch = line.match(/(?:THUẾ\s*)?(?:GTGT|VAT)\s*\(?(\d+(?:\.\d+)?)\s*%\)?/i)
      if (generalVatMatch) {
        const rate = parseFloat(generalVatMatch[1]) || 0
        // Tìm số tiền thuế ở cuối dòng (nếu có)
        const withoutRate = line.replace(generalVatMatch[0], ' ').replace(/\([^)]*\)/g, ' ')
        const numTokens = withoutRate.match(/\d[\d.,]*/g) || []
        const lastNum = numTokens.length > 0 ? parseCleanNumber(numTokens[numTokens.length - 1]) : 0

        if (rate > 0 && lastNum > 100 && items.length > 1) {
          // Kiểm tra xem số tiền thuế khớp với toàn bộ đơn hay chỉ khớp với 1 dòng cụ thể
          const itemPreTaxTotals = items.map(it => {
            const sl = Number(it.So_luong) || 1
            const dg = Number(it._donGiaTruocThue ?? it.Don_gia) || 0
            return sl * dg
          })
          const sumAll = itemPreTaxTotals.reduce((a, b) => a + b, 0)
          const expectedAllVat = Math.round((sumAll * rate) / 100)

          if (Math.abs(expectedAllVat - lastNum) <= Math.max(1000, lastNum * 0.02)) {
            items.forEach((it, idx) => {
              if (!it.Thue_VAT) it.Thue_VAT = rate
              assignedIndices.add(idx)
            })
          } else {
            // Thử tìm dòng đơn lẻ khớp đúng tiền thuế
            let matchedSingle = false
            itemPreTaxTotals.forEach((tot, idx) => {
              const expectedItemVat = Math.round((tot * rate) / 100)
              if (tot > 0 && Math.abs(expectedItemVat - lastNum) <= Math.max(500, lastNum * 0.01)) {
                items[idx].Thue_VAT = rate
                assignedIndices.add(idx)
                matchedSingle = true
              }
            })
            if (!matchedSingle) {
              items.forEach((it, idx) => {
                if (!it.Thue_VAT) it.Thue_VAT = rate
                assignedIndices.add(idx)
              })
            }
          }
        } else if (rate > 0) {
          items.forEach((it, idx) => {
            if (!it.Thue_VAT) it.Thue_VAT = rate
            assignedIndices.add(idx)
          })
        }
        break
      } else if (/KHÔNG\s+CHỊU\s+THUẾ|MIỄN\s+THUẾ|\bKCT\b/i.test(line)) {
        items.forEach((it, idx) => {
          if (!it.Thue_VAT) it.Thue_VAT = 0
          assignedIndices.add(idx)
        })
      }
    }
  }

  // Bước 3: Tính đơn giá sau thuế (Gia_tieu_chuan = Giá vốn / Giá off hãng) khi ở chế độ mua hàng
  for (const it of items) {
    const vatPct = Number(it.Thue_VAT) || 0
    const donGiaTruocThue = Number(it._donGiaTruocThue ?? it._giaVon ?? it.Gia_tieu_chuan ?? it.Don_gia) || 0
    it._donGiaTruocThue = donGiaTruocThue

    if (isPurchaseMode) {
      const sauThueUnit = Number(it._sauThueUnit) || 0
      const giaVonSauThue = sauThueUnit > 0
        ? sauThueUnit
        : Math.round(donGiaTruocThue * (1 + vatPct / 100))

      it.Gia_tieu_chuan = giaVonSauThue
      it._giaVon = giaVonSauThue

      // Nếu không có List Price riêng biệt thì mặc định Đơn giá bán khởi tạo bằng Giá vốn sau thuế
      const listPrice = Number(it._listPrice) || 0
      if (listPrice > 0 && listPrice !== donGiaTruocThue) {
        it.Don_gia = listPrice
      } else {
        it.Don_gia = giaVonSauThue
        it._listPrice = giaVonSauThue
      }
    }
  }
}

export function extractVendorNameFromLines(lines: string[]): string {
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = String(lines[i] || '').trim()
    if (!line) continue
    const upper = line.toUpperCase()
    if (upper.includes('KÍNH GỬI') || upper.includes('KÍNH GỞI') || upper.includes('KHÁCH HÀNG')) continue
    const mCompany = line.match(/CÔNG\s+TY\s+(?:CP|CỔ\s+PHẦN|TNHH(?:\s+MTV|\s+MỘT\s+THÀNH\s+VIÊN)?)\s+(?:CÔNG\s+NGHỆ\s+|THƯƠNG\s+MẠI\s+|DỊCH\s+VỤ\s+|TIN\s+HỌC\s+|GIẢI\s+PHÁP\s+)*([A-Z0-9\s\-&]{2,35})/i)
    if (mCompany && mCompany[1]) {
      const candidate = mCompany[1].trim()
      if (!/NAM\s+TRƯỜNG\s+SƠN|NTSSI/i.test(candidate)) {
        return candidate.toUpperCase()
      }
    }
  }
  return ''
}

export function isImagePurchaseFile(file: File): boolean {
  if (!file) return false
  if (/^image\//i.test(String(file.type || ''))) return true
  return /\.(png|jpe?g|webp|bmp|gif)$/i.test(String(file.name || ''))
}

/**
 * Trích xuất toàn bộ văn bản thô từ file PDF, Ảnh hoặc Excel để phục vụ AI phân tích khi sai định dạng
 */
export async function extractRawTextFromPurchaseFile(
  file: File,
  onProgress?: (msg: string) => void
): Promise<string> {
  if (isImagePurchaseFile(file)) {
    onProgress?.('Đang nhận diện văn bản từ hình ảnh bằng OCR...')
    const ocrRes = await Tesseract.recognize(file, 'vie+eng')
    return String(ocrRes?.data?.text || '').trim()
  }

  const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'
  const arrayBuffer = await file.arrayBuffer()

  if (isPdf) {
    onProgress?.('Đang trích xuất văn bản từ file PDF...')
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const textLines: string[] = []

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.0 })
      const textContent = await page.getTextContent()
      const pageItems: Array<{ str: string; x: number; topY: number }> = []

      for (const rawItem of textContent.items as any[]) {
        const str = String(rawItem?.str ?? '').trim()
        if (!str) continue
        const tr = rawItem.transform || [10, 0, 0, 10, 0, 0]
        const x = Number(tr[4]) || 0
        const y = Number(tr[5]) || 0
        const topY = viewport.height - y
        pageItems.push({ str, x, topY })
      }

      pageItems.sort((a, b) => a.topY - b.topY || a.x - b.x)
      const lines: Array<{ topY: number; tokens: Array<{ str: string; x: number }> }> = []
      for (const tok of pageItems) {
        const existing = lines.find(l => Math.abs(l.topY - tok.topY) <= 4)
        if (existing) {
          existing.tokens.push({ str: tok.str, x: tok.x })
        } else {
          lines.push({ topY: tok.topY, tokens: [{ str: tok.str, x: tok.x }] })
        }
      }
      lines.sort((a, b) => a.topY - b.topY)
      for (const l of lines) {
        l.tokens.sort((a, b) => a.x - b.x)
        textLines.push(l.tokens.map(t => t.str).join(' | '))
      }
    }

    const combined = textLines.join('\n').trim()
    if (combined.length >= 30) {
      return combined
    }

    // Nếu PDF dạng ảnh scan -> dùng OCR Tesseract
    onProgress?.('PDF dạng ảnh quét (Scan) — Đang nhận diện chữ bằng OCR...')
    const ocrTexts: string[] = []
    for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 3); pageNum++) {
      const page = await pdf.getPage(pageNum)
      const vp = page.getViewport({ scale: 2.0 })
      const canvas = document.createElement('canvas')
      canvas.width = vp.width
      canvas.height = vp.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport: vp }).promise
        const ocrRes = await Tesseract.recognize(canvas, 'vie+eng')
        if (ocrRes?.data?.text) {
          ocrTexts.push(ocrRes.data.text)
        }
      }
    }
    return ocrTexts.join('\n').trim()
  }

  // File Excel (.xlsx, .xls, .csv)
  onProgress?.('Đang đọc nội dung các dòng từ file Excel...')
  const data = new Uint8Array(arrayBuffer)
  const wb = XLSX.read(data, { type: 'array' })
  const outLines: string[] = []
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][]
    outLines.push(`=== SHEET: ${sheetName} ===`)
    rows.slice(0, 250).forEach((row, rIdx) => {
      if (!Array.isArray(row)) return
      const cells = row.map(c => String(c ?? '').replace(/\r?\n/g, ' ').trim()).filter(Boolean)
      if (cells.length > 0) {
        outLines.push(`Dòng ${rIdx + 1}: ${cells.join(' | ')}`)
      }
    })
  }
  return outLines.join('\n').trim()
}

/**
 * Dùng AI (DeepSeek) phân tích file báo giá mua hàng (PDF / Excel) để bóc tách danh sách hàng hóa
 * và tính chính xác Giá vốn sau thuế (Gia_tieu_chuan = Giá vốn / Giá off hãng).
 */
export async function analyzePurchaseFileWithAI(
  file: File,
  defaultCurrency: string = 'VND',
  onProgress?: (msg: string) => void
): Promise<{ items: ParsedPurchaseItem[]; vendorName: string; rawText: string }> {
  const rawText = await extractRawTextFromPurchaseFile(file, onProgress)
  if (!rawText || rawText.length < 10) {
    throw new Error('Không trích xuất được nội dung văn bản từ file để phân tích AI.')
  }

  onProgress?.('🤖 AI đang phân tích bảng giá và tính Giá vốn sau thuế...')

  const systemPrompt = `Bạn là chuyên gia phân tích chứng từ/báo giá mua hàng thiết bị & phần mềm CNTT.
Nhiệm vụ: Đọc nội dung văn bản trích xuất từ file Báo giá của Nhà cung cấp và bóc tách danh sách các mặt hàng/dịch vụ kèm GIÁ VỐN SAU THUẾ của 1 đơn vị.

QUY TẮC QUAN TRỌNG VỀ GIÁ VỐN (gia_von_sau_thue):
1. Người dùng mua hàng từ nhà cung cấp này, vì vậy ĐƠN GIÁ 1 ĐƠN VỊ SAU THUẾ VAT của nhà cung cấp chính là GIÁ VỐN (Giá vốn / Giá off hãng) của người dùng.
2. Kiểm tra kỹ thuế VAT của từng mặt hàng:
   - Nếu có dòng tổng kết như "VAT 8% (2) và KCT (1): 800000" -> nghĩa là mục (1) Không chịu thuế (thue_vat = 0%), mục (2) chịu thuế 8% (thue_vat = 8%).
   - Nếu ghi "Phần mềm không chịu thuế VAT" hoặc "KCT" -> thue_vat = 0%.
   - Nếu có thuế VAT (VD: 8% hoặc 10%) áp dụng cho mặt hàng -> gia_von_sau_thue = Math.round(don_gia_truoc_thue * (1 + thue_vat / 100)).
   - Nếu chỉ có tổng tiền trước thuế và số lượng -> don_gia_truoc_thue = tong_truoc_thue / so_luong.
3. Nếu trong phần mô tả có "Part Number: ...", "SKU: ...", "P/N: ..." thì lấy mã đó làm ma_hang.
4. Nếu có "Chu kỳ: ..." hoặc "Thời hạn: ..." thì lấy làm thoi_han (VD: "3 năm", "Vĩnh viễn", "12 months").
5. Nếu có "Bảo hành: ..." thì lấy làm bao_hanh.
6. Giữ đầy đủ các dòng mô tả chi tiết (bullet points) trong trường dien_giai (ngăn cách bằng \\n).

Chỉ trả về JSON thuần đúng cấu trúc sau (không bọc markdown, không giải thích thêm):
{
  "nha_cung_cap": "Tên viết tắt NCC (VD: SAVVYTECH)",
  "don_vi_tien_te": "VND hoặc USD",
  "items": [
    {
      "stt": 1,
      "ma_hang": "VCF-VCS-STD-8",
      "ten_hang": "Phần mềm Vmware vcenter 8 Standard",
      "dien_giai": "• Part Number: VCF-VCS-STD-8\\n• Chu kỳ: 3 năm\\n• Type: License key Active\\n• Bảo hành: 3 năm theo tiêu chuẩn VMware",
      "danh_muc": "VMWARE",
      "loai_hang": "Software",
      "dvt": "Bộ",
      "thoi_han": "3 năm",
      "bao_hanh": "3 năm theo tiêu chuẩn VMware",
      "so_luong": 1,
      "don_gia_truoc_thue": 32500000,
      "thue_vat": 0,
      "gia_von_sau_thue": 32500000
    }
  ]
}`

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Nội dung file "${file.name}":\n\n${rawText.slice(0, 18000)}` }
  ]

  const result = await callDeepSeek(messages, false, false)
  const aiContent = extractDeepSeekText(result)
  const cleaned = aiContent.replace(/```json/gi, '').replace(/```/g, '').trim()

  let parsedObj: any = null
  const objMatch = cleaned.match(/\{[\s\S]*\}/)
  const arrMatch = cleaned.match(/\[[\s\S]*\]/)
  if (objMatch) {
    parsedObj = JSON.parse(objMatch[0])
  } else if (arrMatch) {
    parsedObj = { items: JSON.parse(arrMatch[0]) }
  } else {
    parsedObj = JSON.parse(cleaned)
  }

  const rawList: any[] = Array.isArray(parsedObj)
    ? parsedObj
    : (Array.isArray(parsedObj?.items) ? parsedObj.items : [])

  const vendorName = String(parsedObj?.nha_cung_cap || '').trim().toUpperCase()
  const currency = String(parsedObj?.don_vi_tien_te || defaultCurrency || 'VND').trim().toUpperCase()

  const mappedItems: ParsedPurchaseItem[] = rawList
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
          .replace(/\s+/g, '-')
          .replace(/[^A-Z0-9\-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')

      const sl = Math.max(1, parseCleanNumber(p.so_luong ?? p.So_luong ?? 1))
      const donGiaTruocThue = parseCleanNumber(p.don_gia_truoc_thue ?? p.don_gia ?? p.Don_gia ?? 0)
      const vatPct = parseCleanNumber(p.thue_vat ?? p.Thue_VAT ?? 0)
      const aiGiaVonSauThue = parseCleanNumber(p.gia_von_sau_thue ?? p.Gia_tieu_chuan ?? 0)
      const expectedAfterTax = donGiaTruocThue > 0
        ? Math.round(donGiaTruocThue * (1 + vatPct / 100))
        : aiGiaVonSauThue
      const giaVonSauThue = aiGiaVonSauThue >= donGiaTruocThue && aiGiaVonSauThue > 0
        ? aiGiaVonSauThue
        : expectedAfterTax

      const featuresHtml = dienGiaiRaw
        ? dienGiaiRaw
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\r?\n/g, '<br>')
        : ''

      return {
        uid: Math.random().toString(36).slice(2, 11),
        Sheet_name: 'File Mua Hàng (AI)',
        Ma_hang: generatedMa,
        sku_code: explicitMa || '',
        Ten_hang: tenHang,
        Description: dienGiaiRaw,
        Features: featuresHtml,
        Danh_muc: String(p.danh_muc || vendorName || 'MUA HÀNG').trim().toUpperCase(),
        Type: String(p.loai_hang || meta.itemType || '').trim(),
        License_duration: String(p.thoi_han || meta.duration || '').trim(),
        thoi_han_bao_hanh: String(p.bao_hanh || meta.warranty || '').trim(),
        DVT: String(p.dvt || 'Bộ').trim(),
        So_luong: sl,
        Don_gia: giaVonSauThue,
        Gia_tieu_chuan: giaVonSauThue,
        gia_nhap: 0,
        gia_hardware: 0,
        muc_phan_tram_off: 0,
        Thue_VAT: vatPct,
        Don_vi_tien_te: currency === 'USD' ? 'USD' : 'VND',
        Ti_gia: 1,
        Ten_nha_cung_cap: vendorName,
        Ma_nha_cung_cap: vendorName,
        Trang_thai: 'Còn hàng',
        Mo_ta_chung: '',
        Mo_ta_chi_tiet: '',
        Ma_hang_lien_ket: '',
        Ten_hang_lien_ket: '',
        Ghi_chu: donGiaTruocThue > 0 && vatPct > 0
          ? `Giá trước thuế NCC: ${new Intl.NumberFormat('vi-VN').format(donGiaTruocThue)} (+VAT ${vatPct}%)`
          : '',
        Main_img: '',
        volume: '',
        _hasExplicitMaHang: Boolean(explicitMa),
        _rawPs: explicitMa || tenHang,
        _rawMota: dienGiaiRaw,
        _donGiaTruocThue: donGiaTruocThue || giaVonSauThue,
        _listPrice: giaVonSauThue,
        _giaVon: giaVonSauThue,
        _sttIndex: Number(p.stt) || (idx + 1)
      } as ParsedPurchaseItem
    })
    .filter((x): x is ParsedPurchaseItem => x !== null && (x.Gia_tieu_chuan > 0 || x.Don_gia > 0))

  return {
    items: mappedItems,
    vendorName,
    rawText
  }
}

interface SimplePdfToken {
  str: string
  x: number
  xRight: number
  topY: number
}

interface SimplePdfLine {
  topY: number
  tokens: SimplePdfToken[]
  plainText: string
}

function joinSimpleTokens(tokens: SimplePdfToken[]): string {
  if (!tokens || tokens.length === 0) return ''
  const sorted = [...tokens].sort((a, b) => a.x - b.x)
  let out = ''
  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i]
    if (i === 0) {
      out += curr.str
    } else {
      const prev = sorted[i - 1]
      const gap = curr.x - prev.xRight
      out += (gap > 1.5 ? ' ' : '') + curr.str
    }
  }
  return out.replace(/\s+/g, ' ').trim()
}

/**
 * Đọc file Mua Hàng (PDF / Excel) theo định dạng bảng chuẩn và tự động tính Giá vốn sau thuế (Gia_tieu_chuan).
 * Nếu file không khớp định dạng chuẩn hoặc không tìm thấy giá vốn hợp lệ, trả về items = [] để kích hoạt thông báo AI phân tích.
 */
export async function parsePurchaseFileStandard(
  file: File,
  defaultCurrency: string = 'VND'
): Promise<{ items: ParsedPurchaseItem[]; vendorName: string }> {
  if (isImagePurchaseFile(file)) {
    return { items: [], vendorName: '' }
  }
  const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'
  const arrayBuffer = await file.arrayBuffer()

  if (isPdf) {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const allLines: SimplePdfLine[] = []
    let pageOffsetY = 0

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.0 })
      const textContent = await page.getTextContent()
      const pageTokens: SimplePdfToken[] = []

      for (const rawItem of textContent.items as any[]) {
        const str = String(rawItem?.str ?? '')
        if (!str.trim()) continue
        const tr = rawItem.transform || [10, 0, 0, 10, 0, 0]
        const x = Number(tr[4]) || 0
        const y = Number(tr[5]) || 0
        const topY = pageOffsetY + (viewport.height - y)
        const width = Number(rawItem.width) || str.length * 4.5
        pageTokens.push({
          str,
          x,
          xRight: x + width,
          topY
        })
      }

      pageTokens.sort((a, b) => a.topY - b.topY || a.x - b.x)
      for (const tok of pageTokens) {
        const existingLine = allLines.find(l => Math.abs(l.topY - tok.topY) <= 3.5)
        if (existingLine) {
          existingLine.tokens.push(tok)
        } else {
          allLines.push({
            topY: tok.topY,
            tokens: [tok],
            plainText: ''
          })
        }
      }
      pageOffsetY += viewport.height + 50
    }

    allLines.sort((a, b) => a.topY - b.topY)
    for (const line of allLines) {
      line.tokens.sort((a, b) => a.x - b.x)
      line.plainText = joinSimpleTokens(line.tokens)
    }

    const vendorName = extractVendorNameFromLines(allLines.slice(0, 20).map(l => l.plainText))

    let sttLineIdx = -1
    for (let i = 0; i < allLines.length; i++) {
      const hasSttToken = allLines[i].tokens.some(t => /^(STT|NO\.?|MSP|TT)$/i.test(t.str.trim()))
      if (!hasSttToken) continue
      const bandText = allLines
        .slice(Math.max(0, i - 2), Math.min(allLines.length, i + 3))
        .map(l => l.plainText)
        .join(' ')
        .toUpperCase()
      if (
        (bandText.includes('TÊN HÀNG') ||
          bandText.includes('SẢN PHẨM') ||
          bandText.includes('THIẾT BỊ') ||
          bandText.includes('DIỄN GIẢI') ||
          bandText.includes('MODEL') ||
          bandText.includes('PART#') ||
          bandText.includes('MÔ TẢ') ||
          bandText.includes('DESCRIPTION') ||
          bandText.includes('PS')) &&
        (bandText.includes('ĐƠN GIÁ') ||
          bandText.includes('THÀNH TIỀN') ||
          bandText.includes('TỔNG') ||
          bandText.includes('S.L') ||
          bandText.includes('SL') ||
          bandText.includes('SỐ LƯỢNG') ||
          bandText.includes('UNIT PRICE') ||
          bandText.includes('PRICES LIST') ||
          bandText.includes('LIST PRICE'))
      ) {
        sttLineIdx = i
        break
      }
    }

    if (sttLineIdx === -1) {
      return { items: [], vendorName }
    }

    const sttTopY = allLines[sttLineIdx].topY
    const headerLines = allLines.filter(l => {
      if (Math.abs(l.topY - sttTopY) > 21) return false
      if (l.topY > sttTopY + 4 && /^(I|II|III|IV|V|1|2)\b/i.test(l.tokens[0]?.str?.trim() || '')) return false
      return true
    })
    const headerEndIdx = allLines.indexOf(headerLines[headerLines.length - 1])

    const linePhrases: Array<{ xLeft: number; xRight: number; topY: number; text: string }> = []
    for (const hl of headerLines) {
      let curr: { xLeft: number; xRight: number; topY: number; text: string } | null = null
      for (const tok of hl.tokens) {
        if (curr && tok.x - curr.xRight <= 4) {
          curr.xRight = Math.max(curr.xRight, tok.xRight)
          curr.text += ' ' + tok.str
        } else {
          if (curr) linePhrases.push(curr)
          curr = { xLeft: tok.x, xRight: tok.xRight, topY: hl.topY, text: tok.str }
        }
      }
      if (curr) linePhrases.push(curr)
    }

    linePhrases.sort((a, b) => a.topY - b.topY || a.xLeft - b.xLeft)
    const clusters: Array<{ xLeft: number; xRight: number; text: string }> = []
    for (const lp of linePhrases) {
      let bestCluster: { xLeft: number; xRight: number; text: string } | null = null
      let bestOverlap = -999
      for (const c of clusters) {
        const overlap = Math.min(c.xRight, lp.xRight) - Math.max(c.xLeft, lp.xLeft)
        if (overlap >= -4 && overlap > bestOverlap) {
          bestOverlap = overlap
          bestCluster = c
        }
      }
      if (bestCluster) {
        bestCluster.xLeft = Math.min(bestCluster.xLeft, lp.xLeft)
        bestCluster.xRight = Math.max(bestCluster.xRight, lp.xRight)
        bestCluster.text += ' ' + lp.text
      } else {
        clusters.push({ xLeft: lp.xLeft, xRight: lp.xRight, text: lp.text })
      }
    }
    clusters.sort((a, b) => a.xLeft - b.xLeft)

    const colDefs: Array<{ key: string; xLeft: number; xRight: number; xCenter: number }> = []
    for (const c of clusters) {
      const u = c.text.toUpperCase().replace(/\s+/g, ' ').trim()
      if ((u.includes('S.L') || u.includes('SỐ LƯỢNG') || u === 'SL') && (u.includes('ĐƠN VỊ') || u.includes('ĐVT') || u.includes('DVT'))) {
        const slRight = c.xLeft + 13
        colDefs.push({ key: 'sl', xLeft: c.xLeft, xRight: slRight, xCenter: (c.xLeft + slRight) / 2 })
        colDefs.push({ key: 'dvt', xLeft: slRight + 1, xRight: c.xRight, xCenter: (slRight + 1 + c.xRight) / 2 })
        continue
      }

      let key = ''
      if (u.includes('STT') || u === 'NO.' || u === 'TT' || u === 'MSP') key = 'stt'
      else if (u === 'P/N' || u === 'PN' || u.includes('MÃ HÀNG') || u.includes('PART NUMBER')) key = 'maHang'
      else if (u === 'PS' || u.startsWith('PS ') || u.includes('PART#') || u.includes('MODEL') || u.includes('SKU')) key = 'tenHang'
      else if (u.includes('TÊN HÀNG') || u.includes('HÀNG HÓA') || u.includes('SẢN PHẨM') || u.includes('THIẾT BỊ')) {
        key = colDefs.some(cd => cd.key === 'tenHang') ? 'features' : 'tenHang'
      } else if (u.startsWith('DESCRIPTION')) key = 'description'
      else if (u.includes('DIỄN GIẢI') || u.includes('MÔ TẢ') || u.includes('THÔNG SỐ') || u.includes('NỘI DUNG') || u.includes('HẠNG MỤC') || u.includes('SPEC')) key = 'features'
      else if (u.includes('ĐƠN VỊ') || u === 'ĐVT' || u === 'DVT' || u === 'UNIT') key = 'dvt'
      else if (u.includes('THỜI HẠN') || u.includes('DURATION') || u.includes('TERM')) key = 'license_duration'
      else if (u.includes('BẢO HÀNH') || u.includes('WARRANTY')) key = 'baoHanh'
      else if (u.includes('HÃNG') || u.includes('NHÀ CUNG CẤP')) key = 'hang'
      else if (u === 'S.L' || u === 'S.L.' || u.includes('SỐ LƯỢNG') || u === 'SL' || u === 'QTY') key = 'sl'
      else if (u.includes('PRICES LIST') || u.includes('LIST PRICE') || u.includes('PRICE LIST')) key = 'listPrice'
      else if (u.includes('DISCOUNT') || u.includes('OFF HÃNG')) key = 'discount'
      else if (u.includes('ĐƠN GIÁ') || u.includes('UNIT PRICE') || u.includes('GIÁ VỐN')) key = 'donGia'
      else if (u.includes('SAU THUẾ') || u.includes('SAU VAT') || u.includes('CÓ VAT') || u.includes('+ VAT') || u.includes('+ THUẾ')) key = 'sauThue'
      else if (u.includes('THÀNH TIỀN') || u.includes('TRƯỚC THUẾ') || u.includes('CHƯA VAT') || u.includes('ESTIMATED VALUE') || u === 'TỔNG' || u.includes('TỔNG TIỀN') || u === 'AMOUNT' || u === 'TOTAL') key = 'truocThue'
      else if (u.includes('VAT') || u.includes('THUẾ')) key = 'vat'

      if (key && !colDefs.some(cd => cd.key === key)) {
        colDefs.push({
          key,
          xLeft: c.xLeft,
          xRight: c.xRight,
          xCenter: (c.xLeft + c.xRight) / 2
        })
      }
    }

    colDefs.sort((a, b) => a.xCenter - b.xCenter)

    let bodyEndIdx = allLines.length
    for (let i = headerEndIdx + 1; i < allLines.length; i++) {
      const u = allLines[i].plainText.toUpperCase()
      if (
        u.includes('TỔNG CỘNG') ||
        u.includes('TỔNG CHƯA VAT') ||
        u.includes('TỔNG TRƯỚC THUẾ') ||
        u.includes('TỔNG GIÁ TRỊ') ||
        u.includes('TỔNG THANH TOÁN') ||
        u.includes('CỘNG TIỀN HÀNG') ||
        u.includes('PHẦN MỀM KHÔNG CHỊU THUẾ') ||
        /^VAT\s*\d+/i.test(u.trim()) ||
        u.includes('ĐIỀU KHOẢN') ||
        u.includes('ĐIỀU KIỆN THƯƠNG MẠI') ||
        u.startsWith('TRÂN TRỌNG') ||
        u.includes('XÁC NHẬN ĐẶT HÀNG')
      ) {
        bodyEndIdx = i
        break
      }
    }

    const summaryLines: string[] = []
    for (let i = bodyEndIdx; i < Math.min(allLines.length, bodyEndIdx + 12); i++) {
      const plain = allLines[i].plainText
      const u = plain.toUpperCase()
      if (u.includes('ĐIỀU KHOẢN') || u.includes('ĐIỀU KIỆN THƯƠNG MẠI') || u.startsWith('GHI CHÚ') || u.startsWith('TRÂN TRỌNG')) {
        break
      }
      if (plain) summaryLines.push(plain)
    }

    const splitX: number[] = []
    for (let idx = 0; idx < colDefs.length - 1; idx++) {
      const curr = colDefs[idx]
      const next = colDefs[idx + 1]
      const prevSplit = idx === 0 ? Math.max(0, curr.xLeft - 4) : splitX[idx - 1]
      if (curr.key === 'stt') {
        splitX.push(curr.xRight + 4)
      } else if (next.key === 'features' || next.key === 'description') {
        const symRight = 2 * curr.xCenter - prevSplit - 2
        splitX.push(Math.min(next.xLeft - 2, Math.max(curr.xRight + 3, symRight)))
      } else if (curr.key === 'features' || curr.key === 'description' || curr.key === 'tenHang') {
        splitX.push(next.xLeft - 6)
      } else {
        splitX.push((curr.xRight + next.xLeft) / 2)
      }
    }

    const bounds: Array<{ key: string; minX: number; maxX: number }> = colDefs.map((cd, idx) => ({
      key: cd.key,
      minX: idx === 0 ? 0 : splitX[idx - 1],
      maxX: idx === colDefs.length - 1 ? 99999 : splitX[idx]
    }))

    const assignColKey = (tok: SimplePdfToken): string => {
      const tokCenter = (tok.x + tok.xRight) / 2
      for (const b of bounds) {
        const isTextCol = b.key === 'stt' || b.key === 'maHang' || b.key === 'tenHang' || b.key === 'description' || b.key === 'features'
        const refX = isTextCol ? tok.x : tokCenter
        if (refX >= b.minX && refX < b.maxX) return b.key
      }
      for (const b of bounds) {
        if (tok.x >= b.minX && tok.x < b.maxX) return b.key
      }
      return bounds[bounds.length - 1]?.key || 'features'
    }

    interface BodyRowEntry {
      topY: number
      byCol: Record<string, SimplePdfToken[]>
      isAnchor: boolean
    }

    const bodyRows: BodyRowEntry[] = []
    for (let i = headerEndIdx + 1; i < bodyEndIdx; i++) {
      const line = allLines[i]
      if (!line.plainText) continue
      const uLine = line.plainText.toUpperCase()
      if (
        (uLine.includes('STT') || uLine.includes('NO.') || uLine.includes('MSP')) &&
        (uLine.includes('DIỄN GIẢI') || uLine.includes('TÊN HÀNG') || uLine.includes('SẢN PHẨM') || uLine.includes('ĐƠN GIÁ') || uLine.includes('THÀNH TIỀN'))
      ) {
        continue
      }
      const byCol: Record<string, SimplePdfToken[]> = {}
      for (const tok of line.tokens) {
        const k = assignColKey(tok)
        if (!byCol[k]) byCol[k] = []
        byCol[k].push(tok)
      }
      const getColStr = (k: string) => joinSimpleTokens(byCol[k] || [])
      const lpVal = parseCleanNumber(getColStr('listPrice'))
      const dgVal = parseCleanNumber(getColStr('donGia'))
      const ttVal = parseCleanNumber(getColStr('truocThue'))
      const slVal = parseCleanNumber(getColStr('sl'))
      const sttStr = getColStr('stt')

      const isRomanGroup = /^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.?$/i.test(sttStr) && dgVal === 0 && ttVal === 0 && lpVal === 0
      if (isRomanGroup) continue

      const isAnchor =
        (dgVal > 0 && ttVal > 0) ||
        (lpVal > 0 && (dgVal > 0 || slVal > 0 || ttVal > 0)) ||
        (slVal > 0 && (dgVal > 0 || ttVal > 0 || lpVal > 0)) ||
        (/^\d+$/.test(sttStr) && (dgVal > 0 || ttVal > 0 || lpVal > 0 || Boolean(getColStr('tenHang'))))
      bodyRows.push({ topY: line.topY, byCol, isAnchor })
    }

    const anchorIndices = bodyRows.map((r, idx) => (r.isAnchor ? idx : -1)).filter(idx => idx !== -1)
    const newItems: ParsedPurchaseItem[] = []

    if (anchorIndices.length > 0) {
      const firstAnchorIdx = anchorIndices[0]
      const hasBodyAboveFirstAnchor = bodyRows
        .slice(0, firstAnchorIdx)
        .some(r => (r.byCol['features']?.length || 0) > 0 || (r.byCol['tenHang']?.length || 0) > 0)

      const itemRanges: Array<{ anchorIdx: number; startIdx: number; endIdx: number }> = []
      if (!hasBodyAboveFirstAnchor) {
        for (let m = 0; m < anchorIndices.length; m++) {
          const aIdx = anchorIndices[m]
          const nextAIdx = m < anchorIndices.length - 1 ? anchorIndices[m + 1] : bodyRows.length
          itemRanges.push({ anchorIdx: aIdx, startIdx: aIdx, endIdx: nextAIdx - 1 })
        }
      } else {
        let currentStartIdx = 0
        for (let m = 0; m < anchorIndices.length; m++) {
          const aIdx = anchorIndices[m]
          if (m === anchorIndices.length - 1) {
            itemRanges.push({ anchorIdx: aIdx, startIdx: currentStartIdx, endIdx: bodyRows.length - 1 })
          } else {
            const nextAIdx = anchorIndices[m + 1]
            const firstLineY = bodyRows[currentStartIdx].topY
            const anchorY = bodyRows[aIdx].topY
            const nextAnchorY = bodyRows[nextAIdx].topY
            const expectedBottomY = Math.min(
              nextAnchorY - 2,
              Math.max(anchorY + 2, 2 * anchorY - firstLineY)
            )
            let splitIdx = aIdx
            for (let k = aIdx; k < nextAIdx; k++) {
              if (k > aIdx) {
                const gapFromPrev = bodyRows[k].topY - bodyRows[k - 1].topY
                if (gapFromPrev > 16) break
              }
              if (bodyRows[k].topY <= expectedBottomY + 5) {
                splitIdx = k
              } else {
                break
              }
            }
            itemRanges.push({ anchorIdx: aIdx, startIdx: currentStartIdx, endIdx: splitIdx })
            currentStartIdx = splitIdx + 1
          }
        }
      }

      const hasSeparateFeaturesCol = colDefs.some(cd => cd.key === 'features')

      itemRanges.forEach((range, itemIdx) => {
        const anchorRow = bodyRows[range.anchorIdx]
        const getColPlainRange = (colKey: string) => {
          const parts: string[] = []
          for (let k = range.startIdx; k <= range.endIdx; k++) {
            const toks = bodyRows[k].byCol[colKey]
            if (toks && toks.length > 0) {
              parts.push(joinSimpleTokens(toks))
            }
          }
          return parts.filter(Boolean).join('\n').trim()
        }

        const rawTenHang = getColPlainRange('tenHang')
        const rawFeatures = getColPlainRange('features')
        const rawDesc = getColPlainRange('description')

        let tenHang = ''
        let featuresPlain = ''

        if (hasSeparateFeaturesCol) {
          tenHang = rawTenHang.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim() || (rawFeatures ? rawFeatures.split(/\r?\n/)[0].trim() : '')
          featuresPlain = rawFeatures
        } else {
          const allTenLines = rawTenHang.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
          const titleLines: string[] = []
          const bulletLines: string[] = []
          let hitBullet = false
          for (const l of allTenLines) {
            if (!hitBullet && !/^[•\-+*·]/.test(l)) {
              titleLines.push(l)
            } else {
              hitBullet = true
              bulletLines.push(l)
            }
          }
          tenHang = titleLines.length > 0 ? titleLines.join(' ') : (allTenLines[0] || '')
          featuresPlain = bulletLines.length > 0 ? bulletLines.join('\n') : allTenLines.slice(1).join('\n')
        }

        if (!tenHang) return

        const meta = extractMetadataFromBulletLines(featuresPlain || rawTenHang)
        const getAnchorColStr = (colKey: string) => joinSimpleTokens(anchorRow.byCol[colKey] || [])

        let dvt = getColPlainRange('dvt')
          .replace(/\r?\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        let slRaw = (getAnchorColStr('sl') || getColPlainRange('sl').replace(/\r?\n/g, ' ')).trim()
        if (slRaw && !/^\d[\d.,]*$/.test(slRaw)) {
          const m = slRaw.match(/^([\d.,]+)\s+(.+)$/)
          if (m) {
            slRaw = m[1]
            if (!dvt) dvt = m[2].trim()
          }
        }
        if (!dvt) dvt = 'Bản quyền'

        const sttRaw = (getAnchorColStr('stt') || getColPlainRange('stt')).trim()
        const sttNum = /^\d+$/.test(sttRaw) ? parseInt(sttRaw, 10) : (itemIdx + 1)

        const rawDur = (getAnchorColStr('license_duration') || getColPlainRange('license_duration').replace(/\r?\n/g, ' ')).trim() || meta.duration
        const maHangCol = getColPlainRange('maHang').replace(/\r?\n/g, ' ').trim() || meta.partNumber
        const hangCol = getColPlainRange('hang').replace(/\r?\n/g, ' ').trim() || vendorName
        const baoHanhCol = getColPlainRange('baoHanh').replace(/\r?\n/g, ' ').trim() || meta.warranty

        const sl = parseCleanNumber(slRaw) || 1
        const listPrice = parseCleanNumber(getAnchorColStr('listPrice') || getColPlainRange('listPrice'))
        let donGia = parseCleanNumber(getAnchorColStr('donGia') || getColPlainRange('donGia'))
        const truocThue = parseCleanNumber(getAnchorColStr('truocThue') || getColPlainRange('truocThue')) || (sl * (donGia || listPrice))
        const sauThueTotal = parseCleanNumber(getAnchorColStr('sauThue') || getColPlainRange('sauThue'))
        if (!donGia && truocThue > 0 && sl > 0) {
          donGia = Math.round(truocThue / sl)
        }

        const vatRaw = getAnchorColStr('vat') || getColPlainRange('vat')
        const vatVal = parseCleanNumber(vatRaw)
        let vatPct = 0
        if (vatVal > 0 && truocThue > 0 && vatVal > 100) {
          vatPct = Math.round((vatVal / truocThue) * 100)
        } else if (vatVal > 0 && vatVal <= 100) {
          vatPct = vatVal < 1 ? Math.round(vatVal * 100) : Math.round(vatVal)
        }

        const effectiveDonGia = listPrice > 0 ? listPrice : donGia
        const effectiveGiaTC = donGia > 0 ? donGia : listPrice
        const generatedMaHang =
          maHangCol ||
          removeDiacriticsSimple(tenHang)
            .toUpperCase()
            .replace(/\s+/g, '-')
            .replace(/[^A-Z0-9\-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')

        const featuresHtml = (featuresPlain || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\r?\n/g, '<br>')

        newItems.push({
          uid: Math.random().toString(36).slice(2, 11),
          Sheet_name: 'File Mua Hàng',
          Ma_hang: generatedMaHang,
          sku_code: maHangCol || '',
          Ten_hang: tenHang,
          Description: rawDesc || featuresPlain,
          Features: featuresHtml,
          Danh_muc: hangCol ? hangCol.toUpperCase() : 'MUA HÀNG',
          Type: meta.itemType || '',
          License_duration: rawDur,
          thoi_han_bao_hanh: baoHanhCol,
          DVT: dvt,
          So_luong: sl,
          Don_gia: effectiveDonGia,
          Gia_tieu_chuan: effectiveGiaTC,
          gia_nhap: 0,
          gia_hardware: 0,
          muc_phan_tram_off: 0,
          Thue_VAT: vatPct,
          Don_vi_tien_te: defaultCurrency || 'VND',
          Ti_gia: 1,
          Ten_nha_cung_cap: hangCol,
          Ma_nha_cung_cap: hangCol,
          Trang_thai: 'Còn hàng',
          Mo_ta_chung: '',
          Mo_ta_chi_tiet: '',
          Ma_hang_lien_ket: '',
          Ten_hang_lien_ket: '',
          Ghi_chu: '',
          Main_img: '',
          volume: '',
          _hasExplicitMaHang: Boolean(maHangCol),
          _rawPs: maHangCol || tenHang,
          _rawMota: featuresPlain,
          _donGiaTruocThue: effectiveGiaTC,
          _listPrice: listPrice > 0 ? listPrice : 0,
          _giaVon: effectiveGiaTC,
          _sttIndex: sttNum,
          ...(sauThueTotal > 0 && sl > 0 ? { _sauThueUnit: Math.round(sauThueTotal / sl) } : {})
        } as ParsedPurchaseItem)
      })
    }

    applySummaryVatAndComputeAfterTaxCost(newItems, summaryLines, true)
    return {
      items: newItems.filter(it => it.Gia_tieu_chuan > 0 || it.Don_gia > 0),
      vendorName
    }
  }

  // File Excel (.xlsx, .xls)
  const data = new Uint8Array(arrayBuffer)
  const workbook = XLSX.read(data, { type: 'array' })
  const wsName = workbook.SheetNames[0]
  const ws = workbook.Sheets[wsName]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][]

  let headerRowIndex = -1
  const colMap: Record<string, number> = {}
  const newItems: ParsedPurchaseItem[] = []
  const summaryLines: string[] = []
  let inSummary = false

  const topLines = rows.slice(0, 15).map(r => (Array.isArray(r) ? r.map(c => String(c ?? '').trim()).filter(Boolean).join(' ') : ''))
  const vendorName = extractVendorNameFromLines(topLines)

  for (let i = 0; i < Math.min(rows.length, 500); i++) {
    const row = rows[i]
    if (!Array.isArray(row) || row.length === 0) continue

    if (headerRowIndex === -1) {
      const rowStr = row.map(c => String(c ?? '').toUpperCase().replace(/\s+/g, ' ').trim()).join('|')
      if (
        rowStr.includes('MÔ TẢ') ||
        rowStr.includes('PRICES LIST') ||
        rowStr.includes('LIST PRICE') ||
        rowStr.includes('DISCOUNT') ||
        ((rowStr.includes('STT') || rowStr.includes('MSP') || rowStr.includes('NO.')) &&
          (rowStr.includes('ĐƠN GIÁ') || rowStr.includes('MODEL') || rowStr.includes('PS') || rowStr.includes('TÊN HÀNG') || rowStr.includes('SẢN PHẨM')))
      ) {
        headerRowIndex = i
        row.forEach((cell, idx) => {
          const header = String(cell ?? '').toUpperCase().replace(/\s+/g, ' ').trim()
          if (!header) return
          if ((header.includes('STT') || header === 'NO.' || header === 'TT' || header === 'MSP') && colMap['stt'] === undefined) colMap['stt'] = idx
          else if ((header === 'PS' || header.startsWith('PS ') || header.includes('MODEL') || header.includes('PART NUMBER') || header.includes('PART#') || header.includes('SKU') || header.includes('MÃ HÀNG') || header === 'P/N' || header === 'PN') && colMap['ps'] === undefined) colMap['ps'] = idx
          else if ((header.includes('MÔ TẢ') || header.includes('TÊN HÀNG') || header.includes('DIỄN GIẢI') || header.includes('DESCRIPTION') || header.includes('SẢN PHẨM') || header.includes('THIẾT BỊ') || header.includes('HẠNG MỤC')) && colMap['mota'] === undefined) colMap['mota'] = idx
          else if ((header.includes('TERM') || header.includes('THỜI HẠN') || header.includes('DURATION')) && colMap['license_duration'] === undefined) colMap['license_duration'] = idx
          else if ((header === 'ĐVT' || header === 'DVT' || header.includes('ĐƠN VỊ') || header === 'UNIT') && colMap['dvt'] === undefined) colMap['dvt'] = idx
          else if ((header === 'S.L' || header === 'S.L.' || header === 'SL' || header.includes('SỐ LƯỢNG') || header === 'QTY') && colMap['sl'] === undefined) colMap['sl'] = idx
          else if ((header.includes('PRICES LIST') || header.includes('LIST PRICE') || header.includes('PRICE LIST')) && colMap['listPrice'] === undefined) colMap['listPrice'] = idx
          else if ((header.includes('DISCOUNT') || header.includes('OFF HÃNG')) && colMap['discount'] === undefined) colMap['discount'] = idx
          else if ((header.includes('ĐƠN GIÁ') || header.includes('GIÁ VỐN') || header.includes('UNIT PRICE')) && colMap['giaVon'] === undefined) colMap['giaVon'] = idx
          else if (((header.includes('THÀNH TIỀN') && !header.includes('CÓ VAT') && !header.includes('SAU VAT') && !header.includes('SAU THUẾ')) || header.includes('CHƯA VAT') || header.includes('TRƯỚC THUẾ') || header === 'TỔNG' || header.includes('TỔNG TIỀN')) && colMap['truocThue'] === undefined) colMap['truocThue'] = idx
          else if ((header.startsWith('VAT') || (header.includes('THUẾ') && !header.includes('THÀNH TIỀN') && !header.includes('TRƯỚC') && !header.includes('SAU'))) && colMap['vat'] === undefined) colMap['vat'] = idx
        })
      }
      continue
    }

    const rowJoined = row.map(c => String(c ?? '').trim()).filter(Boolean).join(' ')
    const rowAllUpper = rowJoined.toUpperCase()
    if (
      rowAllUpper.includes('TỔNG CỘNG') ||
      rowAllUpper.includes('TỔNG CHƯA VAT') ||
      rowAllUpper.includes('TỔNG TRƯỚC THUẾ') ||
      rowAllUpper.includes('TỔNG GIÁ TRỊ') ||
      rowAllUpper.includes('TỔNG THANH TOÁN') ||
      rowAllUpper.includes('CỘNG TIỀN HÀNG') ||
      rowAllUpper.includes('PHẦN MỀM KHÔNG CHỊU THUẾ') ||
      /^VAT\s*\d+/i.test(rowAllUpper)
    ) {
      inSummary = true
    }
    if (
      rowAllUpper.includes('CÁC ĐIỀU KHOẢN') ||
      rowAllUpper.includes('ĐIỀU KHOẢN') ||
      rowAllUpper.includes('ĐIỀU KIỆN THƯƠNG MẠI')
    ) {
      break
    }

    if (inSummary) {
      if (rowJoined) summaryLines.push(rowJoined)
      continue
    }

    const motaPlain = colMap['mota'] !== undefined ? String(row[colMap['mota']] ?? '').trim() : ''
    const psVal = colMap['ps'] !== undefined ? String(row[colMap['ps']] ?? '').trim() : ''
    const psClean = psVal.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim()
    const combinedText = `${psClean} ${motaPlain}`.trim()
    if (!combinedText || combinedText.toUpperCase() === 'STT') continue

    const sl = colMap['sl'] !== undefined ? (parseCleanNumber(row[colMap['sl']]) || 1) : 1
    const listPrice = colMap['listPrice'] !== undefined ? parseCleanNumber(row[colMap['listPrice']]) : 0
    let giaVon = colMap['giaVon'] !== undefined ? parseCleanNumber(row[colMap['giaVon']]) : 0
    const truocThue = colMap['truocThue'] !== undefined ? parseCleanNumber(row[colMap['truocThue']]) : 0
    if (giaVon === 0 && truocThue > 0 && sl > 0) {
      giaVon = Math.round(truocThue / sl)
    }
    if (listPrice === 0 && giaVon === 0 && truocThue === 0) continue

    const vatVal = colMap['vat'] !== undefined ? parseCleanNumber(row[colMap['vat']]) : 0
    let vatPct = 0
    if (vatVal > 0 && vatVal < 1) vatPct = Math.round(vatVal * 100)
    else if (vatVal > 0 && truocThue > 0 && vatVal > 100) vatPct = Math.round((vatVal / truocThue) * 100)
    else if (vatVal > 0 && vatVal <= 100) vatPct = Math.round(vatVal)

    const motaLines = motaPlain.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    const effectiveTenHang =
      motaLines.length === 1
        ? (motaLines[0] || psClean)
        : (psClean || motaLines[0] || combinedText)
    const meta = extractMetadataFromBulletLines(motaPlain)
    const explicitMa = psClean || meta.partNumber
    const generatedMaHang =
      explicitMa ||
      removeDiacriticsSimple(effectiveTenHang)
        .toUpperCase()
        .replace(/\s+/g, '-')
        .replace(/[^A-Z0-9\-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

    const dvt = colMap['dvt'] !== undefined ? String(row[colMap['dvt']] ?? '').trim() || 'Bản quyền' : 'Bản quyền'
    const rawTerm = colMap['license_duration'] !== undefined ? String(row[colMap['license_duration']] ?? '').trim() : meta.duration
    const sttVal = colMap['stt'] !== undefined ? parseCleanNumber(row[colMap['stt']]) : (newItems.length + 1)

    const effectiveDonGia = listPrice > 0 ? listPrice : giaVon
    const effectiveGiaTC = giaVon > 0 ? giaVon : listPrice
    const featuresHtml = (motaPlain || psClean)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\r?\n/g, '<br>')

    newItems.push({
      uid: Math.random().toString(36).slice(2, 11),
      Sheet_name: 'File Mua Hàng',
      Ma_hang: generatedMaHang,
      sku_code: explicitMa || '',
      Ten_hang: effectiveTenHang,
      Description: motaPlain,
      Features: featuresHtml,
      Danh_muc: vendorName || 'MUA HÀNG',
      Type: meta.itemType || '',
      License_duration: rawTerm,
      thoi_han_bao_hanh: meta.warranty || '',
      DVT: dvt,
      So_luong: sl,
      Don_gia: effectiveDonGia,
      Gia_tieu_chuan: effectiveGiaTC,
      gia_nhap: 0,
      gia_hardware: 0,
      muc_phan_tram_off: 0,
      Thue_VAT: vatPct,
      Don_vi_tien_te: defaultCurrency || 'VND',
      Ti_gia: 1,
      Ten_nha_cung_cap: vendorName,
      Ma_nha_cung_cap: vendorName,
      Trang_thai: 'Còn hàng',
      Mo_ta_chung: '',
      Mo_ta_chi_tiet: '',
      Ma_hang_lien_ket: '',
      Ten_hang_lien_ket: '',
      Ghi_chu: '',
      Main_img: '',
      volume: '',
      _hasExplicitMaHang: Boolean(explicitMa),
      _rawPs: explicitMa || effectiveTenHang,
      _rawMota: motaPlain,
      _donGiaTruocThue: effectiveGiaTC,
      _listPrice: listPrice > 0 ? listPrice : 0,
      _giaVon: effectiveGiaTC,
      _sttIndex: sttVal || (newItems.length + 1)
    } as ParsedPurchaseItem)
  }

  applySummaryVatAndComputeAfterTaxCost(newItems, summaryLines, true)
  return {
    items: newItems.filter(it => it.Gia_tieu_chuan > 0 || it.Don_gia > 0),
    vendorName
  }
}

