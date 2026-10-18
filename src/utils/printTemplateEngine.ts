import ExcelJS from 'exceljs'
import html2canvas from 'html2canvas'
import { getDatabase, ref as dbRef, get, set, update, remove } from 'firebase/database'
import { getApps, getApp, initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: "AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8",
  authDomain: "chusonproject.firebaseapp.com",
  databaseURL: "https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chusonproject",
  storageBucket: "chusonproject.firebasestorage.app",
  messagingSenderId: "929199941311",
  appId: "1:929199941311:web:ca8d86f9fd7f8dff61480a",
  measurementId: "G-48VVPGFSFK"
}

function getDb() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  return getDatabase(app)
}

/* =====================================================
   1. DANH MỤC TOKEN CHUẨN CHO BÁO GIÁ
===================================================== */
export interface TokenDef {
  token: string
  key: string
  label: string
  group: 'customer' | 'contract' | 'group_row' | 'item_row' | 'totals'
  sample: string
  description?: string
  isNumeric?: boolean
}

export const TOKEN_GROUPS: { id: TokenDef['group']; label: string; icon: string; color: string; desc: string }[] = [
  {
    id: 'customer',
    label: 'Thông tin Khách hàng (Header)',
    icon: 'KH',
    color: '#10b981',
    desc: 'Chèn vào vùng Header / Thông tin người nhận báo giá'
  },
  {
    id: 'contract',
    label: 'Header Công ty, Báo giá & Người lập',
    icon: 'BG',
    color: '#3b82f6',
    desc: 'Logo, công ty phát hành, số báo giá, ngày tháng và người phụ trách'
  },
  {
    id: 'group_row',
    label: 'Dòng Nhóm danh mục (Lặp)',
    icon: 'NHOM',
    color: '#f59e0b',
    desc: 'Đặt trên dòng mẫu Nhóm (I, II, III...). Nếu không dùng có thể bỏ trống'
  },
  {
    id: 'item_row',
    label: 'Dòng Sản phẩm / Hàng hóa (Lặp)',
    icon: 'SP',
    color: '#8b5cf6',
    desc: 'Đặt trên dòng mẫu Sản phẩm. Hệ thống tự nhân bản theo danh sách hàng'
  },
  {
    id: 'totals',
    label: 'Tổng tiền, Bằng chữ & Điều khoản',
    icon: 'TONG',
    color: '#ec4899',
    desc: 'Đặt ở vùng Tổng cộng cuối bảng, Số tiền bằng chữ và Điều khoản thương mại'
  }
]

export const AVAILABLE_TOKENS: TokenDef[] = [
  // Group 1: Customer
  { token: '{{TEN_CONG_TY}}', key: 'TEN_CONG_TY', label: 'Tên công ty KH', group: 'customer', sample: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ DEMO' },
  { token: '{{TEN_KHACH_HANG}}', key: 'TEN_KHACH_HANG', label: 'Người nhận / Liên hệ', group: 'customer', sample: 'Anh Nguyễn Văn A' },
  { token: '{{MA_KHACH_HANG}}', key: 'MA_KHACH_HANG', label: 'Mã khách hàng', group: 'customer', sample: 'KH001' },
  { token: '{{DIA_CHI_KH}}', key: 'DIA_CHI_KH', label: 'Địa chỉ khách hàng', group: 'customer', sample: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh' },
  { token: '{{MST_KH}}', key: 'MST_KH', label: 'Mã số thuế KH', group: 'customer', sample: '0312345678' },
  { token: '{{SDT_KH}}', key: 'SDT_KH', label: 'Số điện thoại KH', group: 'customer', sample: '0909 123 456' },
  { token: '{{EMAIL_KH}}', key: 'EMAIL_KH', label: 'Email khách hàng', group: 'customer', sample: 'contact@demotech.vn' },
  { token: '{{FAX_KH}}', key: 'FAX_KH', label: 'Số Fax KH', group: 'customer', sample: '028 3822 9999' },

  // Group 2: Contract & Sender Header
  { token: '{{LOGO}}', key: 'LOGO', label: 'Logo công ty (Header)', group: 'contract', sample: '/logo1.png' },
  { token: '{{TEN_CONG_TY_BAN}}', key: 'TEN_CONG_TY_BAN', label: 'Tên công ty phát hành (Header)', group: 'contract', sample: 'NTS System Integration Corp.' },
  { token: '{{DIA_CHI_CONG_TY_BAN}}', key: 'DIA_CHI_CONG_TY_BAN', label: 'Địa chỉ công ty phát hành (Header)', group: 'contract', sample: '20 Tăng Bạt Hổ, P.11, Q. Bình Thạnh, TP.HCM' },
  { token: '{{NGAY_BAO_GIA}}', key: 'NGAY_BAO_GIA', label: 'Ngày báo giá (dd/mm/yyyy)', group: 'contract', sample: '18/10/2026' },
  { token: '{{NGAY}}', key: 'NGAY', label: 'Ngày (dd)', group: 'contract', sample: '18' },
  { token: '{{THANG}}', key: 'THANG', label: 'Tháng (mm)', group: 'contract', sample: '10' },
  { token: '{{NAM}}', key: 'NAM', label: 'Năm (yyyy)', group: 'contract', sample: '2026' },
  { token: '{{MA_HOP_DONG}}', key: 'MA_HOP_DONG', label: 'Mã hợp đồng / Báo giá', group: 'contract', sample: 'HD1729230000' },
  { token: '{{SO_HOP_DONG}}', key: 'SO_HOP_DONG', label: 'Số hợp đồng / Báo giá', group: 'contract', sample: 'HĐ125' },
  { token: '{{SO_PO}}', key: 'SO_PO', label: 'Số PO', group: 'contract', sample: 'PO-2026-088' },
  { token: '{{NOI_DUNG_PO}}', key: 'NOI_DUNG_PO', label: 'Nội dung Hợp đồng / PO', group: 'contract', sample: 'Gia hạn bản quyền phần mềm bảo mật' },
  { token: '{{DON_VI_TIEN_TE}}', key: 'DON_VI_TIEN_TE', label: 'Đơn vị tiền tệ (VND/USD)', group: 'contract', sample: 'VND' },
  { token: '{{TI_GIA}}', key: 'TI_GIA', label: 'Tỉ giá quy đổi', group: 'contract', sample: '25,400', isNumeric: true },
  { token: '{{NGUOI_LAP}}', key: 'NGUOI_LAP', label: 'Tên người lập báo giá', group: 'contract', sample: 'Lê Phi Sơn' },
  { token: '{{CHUC_VU_NGUOI_LAP}}', key: 'CHUC_VU_NGUOI_LAP', label: 'Chức vụ người lập', group: 'contract', sample: 'Phó giám đốc NTS' },
  { token: '{{SDT_NGUOI_LAP}}', key: 'SDT_NGUOI_LAP', label: 'SĐT người lập', group: 'contract', sample: '090 813 7488' },
  { token: '{{EMAIL_NGUOI_LAP}}', key: 'EMAIL_NGUOI_LAP', label: 'Email người lập', group: 'contract', sample: 'info@ntssi.vn' },
  { token: '{{HIEU_LUC_BAO_GIA}}', key: 'HIEU_LUC_BAO_GIA', label: 'Hiệu lực báo giá', group: 'contract', sample: '15 ngày' },

  // Group 3: Repeating Category Group Row
  { token: '{{NHOM_STT}}', key: 'NHOM_STT', label: 'STT Nhóm (La Mã: I, II...)', group: 'group_row', sample: 'I' },
  { token: '{{NHOM_TEN}}', key: 'NHOM_TEN', label: 'Tên Nhóm danh mục', group: 'group_row', sample: 'PHẦN MỀM BẢO MẬT KASPERSKY' },
  { token: '{{NHOM_NCC}}', key: 'NHOM_NCC', label: 'Nhà cung cấp nhóm', group: 'group_row', sample: 'Kaspersky' },

  // Group 4: Repeating Product Item Row
  { token: '{{STT}}', key: 'STT', label: 'Số thứ tự SP (1, 2, 3...)', group: 'item_row', sample: '1' },
  { token: '{{MA_HANG}}', key: 'MA_HANG', label: 'Mã hàng (P/N)', group: 'item_row', sample: 'KL4867XARFS' },
  { token: '{{TEN_HANG}}', key: 'TEN_HANG', label: 'Tên hàng hóa / Sản phẩm', group: 'item_row', sample: 'Kaspersky Endpoint Security for Business Select' },
  { token: '{{DIEN_GIAI}}', key: 'DIEN_GIAI', label: 'Diễn giải / Thông số (Rich Text)', group: 'item_row', sample: 'Bản quyền phần mềm bảo mật hệ thống\n- Bảo vệ máy trạm và File Server\n- Hỗ trợ kỹ thuật 24/7' },
  { token: '{{HANG}}', key: 'HANG', label: 'Hãng / Nhà cung cấp', group: 'item_row', sample: 'Kaspersky' },
  { token: '{{DANH_MUC}}', key: 'DANH_MUC', label: 'Danh mục SP', group: 'item_row', sample: 'SECURITY' },
  { token: '{{DVT}}', key: 'DVT', label: 'Đơn vị tính', group: 'item_row', sample: 'License' },
  { token: '{{THOI_HAN}}', key: 'THOI_HAN', label: 'Thời hạn License', group: 'item_row', sample: '1 Năm' },
  { token: '{{BAO_HANH}}', key: 'BAO_HANH', label: 'Thời gian bảo hành', group: 'item_row', sample: '12 tháng' },
  { token: '{{VOLUME}}', key: 'VOLUME', label: 'Volume / Số user', group: 'item_row', sample: '50-99 users' },
  { token: '{{SO_LUONG}}', key: 'SO_LUONG', label: 'Số lượng', group: 'item_row', sample: '50', isNumeric: true },
  { token: '{{LIST_PRICE}}', key: 'LIST_PRICE', label: 'Giá List Price', group: 'item_row', sample: '1,200,000', isNumeric: true },
  { token: '{{GIA_TIEU_CHUAN}}', key: 'GIA_TIEU_CHUAN', label: 'Giá Off Hãng', group: 'item_row', sample: '950,000', isNumeric: true },
  { token: '{{PHAN_TRAM_OFF_HANG}}', key: 'PHAN_TRAM_OFF_HANG', label: '% Off Hãng', group: 'item_row', sample: '20%' },
  { token: '{{GIA_NHAP}}', key: 'GIA_NHAP', label: 'Giá nhập', group: 'item_row', sample: '800,000', isNumeric: true },
  { token: '{{PHAN_TRAM_OFF}}', key: 'PHAN_TRAM_OFF', label: '% Off Khách', group: 'item_row', sample: '10%' },
  { token: '{{DON_GIA_KH}}', key: 'DON_GIA_KH', label: 'Đơn giá chào KH', group: 'item_row', sample: '1,080,000', isNumeric: true },
  { token: '{{TT_TRUOC_THUE}}', key: 'TT_TRUOC_THUE', label: 'Thành tiền trước thuế', group: 'item_row', sample: '54,000,000', isNumeric: true },
  { token: '{{PHAN_TRAM_VAT}}', key: 'PHAN_TRAM_VAT', label: '% Thuế VAT', group: 'item_row', sample: '8%' },
  { token: '{{TIEN_VAT}}', key: 'TIEN_VAT', label: 'Tiền thuế VAT (dòng)', group: 'item_row', sample: '4,320,000', isNumeric: true },
  { token: '{{TT_SAU_THUE}}', key: 'TT_SAU_THUE', label: 'Thành tiền sau thuế', group: 'item_row', sample: '58,320,000', isNumeric: true },
  { token: '{{GHI_CHU_SP}}', key: 'GHI_CHU_SP', label: 'Ghi chú sản phẩm', group: 'item_row', sample: 'Giao hàng qua email' },

  // Group 5: Totals & Commercial Terms
  { token: '{{TONG_TRUOC_THUE}}', key: 'TONG_TRUOC_THUE', label: 'Tổng cộng trước thuế', group: 'totals', sample: '84,000,000', isNumeric: true },
  { token: '{{TONG_TIEN_VAT}}', key: 'TONG_TIEN_VAT', label: 'Tổng tiền thuế VAT', group: 'totals', sample: '6,720,000', isNumeric: true },
  { token: '{{TONG_SAU_THUE}}', key: 'TONG_SAU_THUE', label: 'Tổng thanh toán sau thuế', group: 'totals', sample: '90,720,000', isNumeric: true },
  { token: '{{TONG_MUC_OFF}}', key: 'TONG_MUC_OFF', label: 'Tổng tiền chiết khấu/Off', group: 'totals', sample: '6,000,000', isNumeric: true },
  { token: '{{SO_TIEN_BANG_CHU}}', key: 'SO_TIEN_BANG_CHU', label: 'Số tiền bằng chữ (Việt/Anh)', group: 'totals', sample: 'Chín mươi triệu bảy trăm hai mươi nghìn đồng chẵn' },
  { token: '{{DIEU_KHOAN}}', key: 'DIEU_KHOAN', label: 'Khối Điều khoản thương mại', group: 'totals', sample: '1. Giá trên đã bao gồm thuế VAT.\n2. Thanh toán 100% trong vòng 15 ngày.\n3. Bảo hành theo tiêu chuẩn hãng.' }
]

// Map legacy field names (from availableExcelFields) to item tokens
export const LEGACY_FIELD_TO_TOKEN: Record<string, string> = {
  stt: '{{STT}}',
  pn: '{{MA_HANG}}',
  ten_hang: '{{TEN_HANG}}',
  features: '{{DIEN_GIAI}}',
  mo_ta: '{{DIEN_GIAI}}',
  hang: '{{HANG}}',
  danh_muc: '{{DANH_MUC}}',
  dvt: '{{DVT}}',
  license_duration: '{{THOI_HAN}}',
  thoi_gian_bao_hanh: '{{BAO_HANH}}',
  volume: '{{VOLUME}}',
  so_luong: '{{SO_LUONG}}',
  list_price: '{{LIST_PRICE}}',
  gia_tieu_chuan: '{{GIA_TIEU_CHUAN}}',
  muc_off_hang: '{{PHAN_TRAM_OFF_HANG}}',
  don_gia_nhap: '{{GIA_NHAP}}',
  muc_off: '{{PHAN_TRAM_OFF}}',
  don_gia: '{{DON_GIA_KH}}',
  don_gia_kh: '{{DON_GIA_KH}}',
  truoc_thue: '{{TT_TRUOC_THUE}}',
  thue_vat: '{{PHAN_TRAM_VAT}}',
  vat: '{{TIEN_VAT}}',
  sau_thue: '{{TT_SAU_THUE}}',
  ghi_chu: '{{GHI_CHU_SP}}',
  don_vi_tien_te: '{{DON_VI_TIEN_TE}}',
  ti_gia: '{{TI_GIA}}'
}

/* =====================================================
   2. CHUYỂN SỐ THÀNH CHỮ (VIỆT / ANH)
===================================================== */
const VN_DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']

function readTripleVN(n: number, showZeroHundred: boolean): string {
  const tram = Math.floor(n / 100)
  const chuc = Math.floor((n % 100) / 10)
  const donvi = n % 10
  if (tram === 0 && chuc === 0 && donvi === 0) return ''

  let res = ''
  if (tram !== 0 || showZeroHundred) {
    res += VN_DIGITS[tram] + ' trăm '
  }
  if (chuc === 0) {
    if (donvi !== 0 && (tram !== 0 || showZeroHundred)) {
      res += 'lẻ ' + VN_DIGITS[donvi]
    } else if (donvi !== 0) {
      res += VN_DIGITS[donvi]
    }
  } else if (chuc === 1) {
    res += 'mười'
    if (donvi === 5) res += ' lăm'
    else if (donvi !== 0) res += ' ' + VN_DIGITS[donvi]
  } else {
    res += VN_DIGITS[chuc] + ' mươi'
    if (donvi === 1) res += ' mốt'
    else if (donvi === 4) res += ' tư'
    else if (donvi === 5) res += ' lăm'
    else if (donvi !== 0) res += ' ' + VN_DIGITS[donvi]
  }
  return res.trim()
}

export function numberToWordsVN(amount: number, currency = 'VND'): string {
  const isUSD = String(currency || 'VND').toUpperCase().includes('USD')
  if (!amount || isNaN(amount) || amount <= 0) {
    return isUSD ? 'Không đô la Mỹ' : 'Không đồng'
  }

  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ']
  const intPart = Math.floor(Math.abs(amount))
  const decPart = Math.round((Math.abs(amount) - intPart) * 100)

  const groups: number[] = []
  let temp = intPart
  while (temp > 0) {
    groups.push(temp % 1000)
    temp = Math.floor(temp / 1000)
  }

  const parts: string[] = []
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i]
    if (g > 0) {
      const showZero = i < groups.length - 1
      const w = readTripleVN(g, showZero)
      if (w) {
        parts.push(w + (units[i] ? ' ' + units[i] : ''))
      }
    }
  }

  let sentence = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (!sentence) sentence = 'không'
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1)

  if (isUSD) {
    if (decPart > 0) {
      const centsWord = readTripleVN(decPart, false)
      return `${sentence} đô la Mỹ và ${centsWord} xu`
    }
    return `${sentence} đô la Mỹ chẵn`
  } else {
    return `${sentence} đồng chẵn`
  }
}

/* =====================================================
   3. SCHEMA MẪU IN THIẾT LẬP (`mau_in_thiet_lap`)
===================================================== */
export interface GridCellStyle {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  fontSize?: number
  fontFamily?: string
  color?: string
  bgColor?: string
  align?: 'left' | 'center' | 'right'
  valign?: 'top' | 'middle' | 'bottom'
  border?: boolean
  wrapText?: boolean
  numFmt?: string
}

export interface GridCellData {
  value: string
  style?: GridCellStyle
}

export interface GridMerge {
  top: number    // 1-indexed row
  left: number   // 1-indexed col
  bottom: number // 1-indexed row
  right: number  // 1-indexed col
}

export interface PrintTemplateConfig {
  id: string
  ten_mau: string
  ghi_chu: string
  loai_mau: 'imported_excel' | 'web_builder'
  mac_dinh: boolean
  ngay_tao: string
  ngay_cap_nhat: string
  link_file_goc: string // URL Cloudinary hoặc '/template_goc.xlsx' hoặc ''
  source_upload_id?: string // ID từ bảng upload_file_mau nếu đồng bộ sang

  cau_hinh_trang: {
    kho_giay: 'A4' | 'A3' | 'Letter'
    huong_giay: 'portrait' | 'landscape'
    font_mac_dinh: string
    co_chu_mac_dinh: number
    padding_trang: number
    logo_url?: string
    logo_width?: number
    logo_width_pct?: number
    logo_height?: number
    logo_trai: string
    logo_phai: string
    ty_le_logo: number
    hien_thi_logo: boolean
    hien_thi_line_mau: boolean
  }

  thong_tin_nguoi_lap: {
    ten_nguoi_lap: string
    chuc_vu: string
    so_dien_thoai: string
    email: string
    ten_cong_ty_ban: string
    dia_chi_cong_ty_ban: string
    hieu_luc_bao_gia: string
  }

  mapping_vung: {
    dong_tieu_de_bang: number // 1-indexed
    dong_mau_nhom: number     // 1-indexed (0 = không xuất dòng nhóm)
    dong_mau_san_pham: number // 1-indexed
    danh_sach_dong_tong: number[] // 1-indexed rows
    dong_dieu_khoan: number   // 1-indexed
    dong_chu_ky: number       // 1-indexed
  }

  cau_hinh_cot_bang: {
    colIndex: number
    header: string
    field: string
    token?: string
    width?: number
  }[]

  // Dữ liệu lưới thiết kế trên web
  so_dong: number
  so_cot: number
  col_widths: Record<number, number> // 1-indexed col -> width in px/chars
  row_heights: Record<number, number> // 1-indexed row -> height in pt
  merges: GridMerge[]
  grid_cells: Record<string, GridCellData> // key: "R_C" (e.g. "7_1" for A7)
}

export function colIndexToLetter(col: number): string {
  let temp = col
  let letter = ''
  while (temp > 0) {
    const mod = (temp - 1) % 26
    letter = String.fromCharCode(65 + mod) + letter
    temp = Math.floor((temp - mod) / 26)
  }
  return letter
}

export function cellCoordToAddress(r: number, c: number): string {
  return `${colIndexToLetter(c)}${r}`
}

export function formatNowVN(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/* =====================================================
   4. KHỞI TẠO MẪU CHUẨN NTS & MẪU TRẮNG
===================================================== */
export function createStarterTemplateConfig(customId?: string, name = 'Mẫu Báo Giá Chuẩn NTS'): PrintTemplateConfig {
  const id = customId || `MINTL_${Date.now()}`
  const now = formatNowVN()
  const cells: Record<string, GridCellData> = {}
  const setCell = (r: number, c: number, value: string, style: GridCellStyle = {}) => {
    cells[`${r}_${c}`] = { value, style }
  }

  // Row 1: Single Logo directly inside the grid
  setCell(1, 1, '{{LOGO}}', { bold: true, fontSize: 10, color: '#0070c0', align: 'left', valign: 'middle' })

  // Row 2-4: Company Banner / Sender Header
  setCell(2, 1, '{{TEN_CONG_TY_BAN}}', { bold: true, fontSize: 13, color: '#0070c0', align: 'left' })
  setCell(3, 1, 'Địa chỉ: {{DIA_CHI_CONG_TY_BAN}}', { italic: true, fontSize: 10, color: '#475569', align: 'left' })
  setCell(4, 1, 'Tel: {{SDT_NGUOI_LAP}}  |  Email: {{EMAIL_NGUOI_LAP}}', { fontSize: 10, color: '#475569', align: 'left' })

  // Row 5-6: Quotation Title & Number
  setCell(5, 1, 'BẢNG BÁO GIÁ (QUOTATION)', { bold: true, fontSize: 16, color: '#0f172a', align: 'center' })
  setCell(6, 1, 'Số báo giá: {{SO_HOP_DONG}}   |   Mã HĐ: {{MA_HOP_DONG}}', { italic: true, fontSize: 10, color: '#475569', align: 'center' })

  // Row 7-9: Customer & Quote Info Header
  setCell(7, 1, 'Kính gởi: {{TEN_CONG_TY}}', { bold: true, fontSize: 11, color: '#0f172a', align: 'left' })
  setCell(7, 7, 'Ngày: {{NGAY_BAO_GIA}}', { bold: true, fontSize: 11, color: '#0f172a', align: 'right' })

  setCell(8, 1, 'Địa chỉ: {{DIA_CHI_KH}}', { italic: true, fontSize: 11, color: '#1e293b', align: 'left' })
  setCell(8, 7, 'Mã số thuế: {{MST_KH}}', { fontSize: 11, color: '#1e293b', align: 'right' })

  setCell(9, 1, 'Người nhận: {{TEN_KHACH_HANG}}   |   ĐT: {{SDT_KH}}   |   Email: {{EMAIL_KH}}', { italic: true, fontSize: 11, color: '#1e293b', align: 'left' })
  setCell(9, 7, 'Tiền tệ: {{DON_VI_TIEN_TE}}', { fontSize: 11, color: '#1e293b', align: 'right' })

  setCell(10, 1, 'Công ty chúng tôi xin trân trọng gửi đến Quý Khách hàng bảng báo giá chi tiết như sau:', { fontSize: 11, color: '#334155', align: 'left' })

  // Row 11: Table Header (10 columns)
  const headers = [
    { c: 1, text: 'STT' },
    { c: 2, text: 'TÊN HÀNG' },
    { c: 3, text: 'Diễn Giải' },
    { c: 4, text: 'Đơn vị tính' },
    { c: 5, text: 'Thời hạn' },
    { c: 6, text: 'S.L' },
    { c: 7, text: 'ĐƠN GIÁ ({{DON_VI_TIEN_TE}})' },
    { c: 8, text: 'THÀNH TIỀN ({{DON_VI_TIEN_TE}})' },
    { c: 9, text: 'VAT ({{DON_VI_TIEN_TE}})' },
    { c: 10, text: 'THÀNH TIỀN + VAT ({{DON_VI_TIEN_TE}})' }
  ]
  headers.forEach(h => {
    setCell(11, h.c, h.text, {
      bold: true,
      fontSize: 11,
      color: '#ffffff',
      bgColor: '#0070c0',
      align: 'center',
      valign: 'middle',
      border: true,
      wrapText: true
    })
  })

  // Row 12: Repeating Group Row
  setCell(12, 1, '{{NHOM_STT}}', { bold: true, fontSize: 11, color: '#0f172a', bgColor: '#d9e1f2', align: 'center', valign: 'middle', border: true })
  setCell(12, 2, '{{NHOM_TEN}}', { bold: true, fontSize: 11, color: '#0f172a', bgColor: '#d9e1f2', align: 'left', valign: 'middle', border: true })
  for (let c = 3; c <= 10; c++) {
    setCell(12, c, '', { bold: true, fontSize: 11, bgColor: '#d9e1f2', border: true })
  }

  // Row 13: Repeating Item Row
  const itemTokens: { c: number; val: string; align: 'left' | 'center' | 'right'; bold?: boolean }[] = [
    { c: 1, val: '{{STT}}', align: 'center' },
    { c: 2, val: '{{TEN_HANG}}', align: 'left', bold: true },
    { c: 3, val: '{{DIEN_GIAI}}', align: 'left' },
    { c: 4, val: '{{DVT}}', align: 'center' },
    { c: 5, val: '{{THOI_HAN}}', align: 'center' },
    { c: 6, val: '{{SO_LUONG}}', align: 'right', bold: true },
    { c: 7, val: '{{DON_GIA_KH}}', align: 'right', bold: true },
    { c: 8, val: '{{TT_TRUOC_THUE}}', align: 'right', bold: true },
    { c: 9, val: '{{TIEN_VAT}}', align: 'right', bold: true },
    { c: 10, val: '{{TT_SAU_THUE}}', align: 'right', bold: true }
  ]
  itemTokens.forEach(it => {
    setCell(13, it.c, it.val, {
      bold: it.bold,
      fontSize: 11,
      color: '#0f172a',
      align: it.align,
      valign: it.c === 3 ? 'top' : 'middle',
      border: true,
      wrapText: true
    })
  })

  // Row 14: Total Row
  setCell(14, 1, 'TỔNG CỘNG + THUẾ', { bold: true, fontSize: 11, color: '#15803d', bgColor: '#fadb14', align: 'center', valign: 'middle', border: true })
  for (let c = 2; c <= 7; c++) {
    setCell(14, c, '', { bold: true, fontSize: 11, bgColor: '#fadb14', border: true })
  }
  setCell(14, 8, '{{TONG_TRUOC_THUE}}', { bold: true, fontSize: 11, color: '#0f172a', bgColor: '#fadb14', align: 'right', valign: 'middle', border: true })
  setCell(14, 9, '{{TONG_TIEN_VAT}}', { bold: true, fontSize: 11, color: '#0f172a', bgColor: '#fadb14', align: 'right', valign: 'middle', border: true })
  setCell(14, 10, '{{TONG_SAU_THUE}}', { bold: true, fontSize: 11, color: '#dc2626', bgColor: '#fadb14', align: 'right', valign: 'middle', border: true })

  // Row 15: Amount in words
  setCell(15, 1, 'Số tiền viết bằng chữ: {{SO_TIEN_BANG_CHU}}', { bold: true, italic: true, fontSize: 11, color: '#0f172a', align: 'left' })

  // Row 16: Terms Header
  setCell(16, 1, 'Các điều khoản thương mại:', { bold: true, underline: true, fontSize: 11, color: '#0f172a', align: 'left' })

  // Row 17: Commercial Terms Block
  setCell(17, 1, '{{DIEU_KHOAN}}', { fontSize: 11, color: '#1e293b', align: 'left', valign: 'top', wrapText: true })

  // Row 18-20: Signature Block (compact, no wasted empty rows)
  setCell(18, 1, 'Xác nhận của Khách hàng:', { bold: true, fontSize: 11, color: '#0f172a', align: 'center' })
  setCell(18, 7, 'Người lập báo giá:', { bold: true, fontSize: 11, color: '#0f172a', align: 'center' })

  setCell(19, 1, '(Ký, ghi rõ họ tên & đóng dấu)', { italic: true, fontSize: 10, color: '#475569', align: 'center' })
  setCell(19, 7, '{{NGUOI_LAP}} - {{CHUC_VU_NGUOI_LAP}}', { bold: true, fontSize: 11, color: '#0070c0', align: 'center' })

  setCell(20, 7, 'SĐT: {{SDT_NGUOI_LAP}} | Email: {{EMAIL_NGUOI_LAP}}', { fontSize: 10, color: '#334155', align: 'center' })

  return {
    id,
    ten_mau: name,
    ghi_chu: 'Mẫu báo giá chuẩn có phân nhóm danh mục, dòng sản phẩm, tổng tiền và chữ ký',
    loai_mau: 'web_builder',
    mac_dinh: false,
    ngay_tao: now,
    ngay_cap_nhat: now,
    link_file_goc: '/template_goc.xlsx',
    cau_hinh_trang: {
      kho_giay: 'A4',
      huong_giay: 'landscape',
      font_mac_dinh: 'Calibri',
      co_chu_mac_dinh: 11,
      padding_trang: 20,
      logo_url: '/logo1.png',
      logo_width: 260,
      logo_width_pct: 35,
      logo_height: 68,
      logo_trai: '/logo1.png',
      logo_phai: '',
      ty_le_logo: 100,
      hien_thi_logo: true,
      hien_thi_line_mau: true
    },
    thong_tin_nguoi_lap: {
      ten_nguoi_lap: 'Lê Phi Sơn',
      chuc_vu: 'Phó giám đốc NTS',
      so_dien_thoai: '090 813 7488',
      email: 'info@ntssi.vn',
      ten_cong_ty_ban: 'NTS System Integration Corp.',
      dia_chi_cong_ty_ban: '20 Tang Bat Ho Street, Ward 11, Binh Thanh District, Ho Chi Minh City, VN',
      hieu_luc_bao_gia: '15 ngày'
    },
    mapping_vung: {
      dong_tieu_de_bang: 11,
      dong_mau_nhom: 12,
      dong_mau_san_pham: 13,
      danh_sach_dong_tong: [14],
      dong_dieu_khoan: 17,
      dong_chu_ky: 18
    },
    cau_hinh_cot_bang: [
      { colIndex: 1, header: 'STT', field: 'stt', token: '{{STT}}', width: 8 },
      { colIndex: 2, header: 'TÊN HÀNG', field: 'ten_hang', token: '{{TEN_HANG}}', width: 26 },
      { colIndex: 3, header: 'Diễn Giải', field: 'features', token: '{{DIEN_GIAI}}', width: 42 },
      { colIndex: 4, header: 'Đơn vị tính', field: 'dvt', token: '{{DVT}}', width: 12 },
      { colIndex: 5, header: 'Thời hạn', field: 'license_duration', token: '{{THOI_HAN}}', width: 12 },
      { colIndex: 6, header: 'S.L', field: 'so_luong', token: '{{SO_LUONG}}', width: 8 },
      { colIndex: 7, header: 'ĐƠN GIÁ', field: 'don_gia_kh', token: '{{DON_GIA_KH}}', width: 16 },
      { colIndex: 8, header: 'THÀNH TIỀN', field: 'truoc_thue', token: '{{TT_TRUOC_THUE}}', width: 18 },
      { colIndex: 9, header: 'VAT', field: 'vat', token: '{{TIEN_VAT}}', width: 15 },
      { colIndex: 10, header: 'THÀNH TIỀN + VAT', field: 'sau_thue', token: '{{TT_SAU_THUE}}', width: 20 }
    ],
    so_dong: 20,
    so_cot: 10,
    col_widths: { 1: 55, 2: 180, 3: 280, 4: 85, 5: 85, 6: 65, 7: 120, 8: 130, 9: 110, 10: 140 },
    row_heights: { 1: 72, 5: 30, 11: 30, 12: 26, 13: 34, 14: 28 },
    merges: [
      { top: 1, left: 1, bottom: 1, right: 10 },
      { top: 2, left: 1, bottom: 2, right: 10 },
      { top: 3, left: 1, bottom: 3, right: 10 },
      { top: 4, left: 1, bottom: 4, right: 10 },
      { top: 5, left: 1, bottom: 5, right: 10 },
      { top: 6, left: 1, bottom: 6, right: 10 },
      { top: 7, left: 1, bottom: 7, right: 6 },
      { top: 7, left: 7, bottom: 7, right: 10 },
      { top: 8, left: 1, bottom: 8, right: 6 },
      { top: 8, left: 7, bottom: 8, right: 10 },
      { top: 9, left: 1, bottom: 9, right: 6 },
      { top: 9, left: 7, bottom: 9, right: 10 },
      { top: 10, left: 1, bottom: 10, right: 10 },
      { top: 12, left: 2, bottom: 12, right: 10 },
      { top: 14, left: 1, bottom: 14, right: 7 },
      { top: 15, left: 1, bottom: 15, right: 10 },
      { top: 16, left: 1, bottom: 16, right: 10 },
      { top: 17, left: 1, bottom: 17, right: 10 },
      { top: 18, left: 1, bottom: 18, right: 4 },
      { top: 18, left: 7, bottom: 18, right: 10 },
      { top: 19, left: 1, bottom: 19, right: 4 },
      { top: 19, left: 7, bottom: 19, right: 10 },
      { top: 20, left: 7, bottom: 20, right: 10 }
    ],
    grid_cells: cells
  }
}

export function ensureGridHeaderPopulated(tpl: PrintTemplateConfig): PrintTemplateConfig {
  if (!tpl.grid_cells) tpl.grid_cells = {}
  if (!tpl.merges) tpl.merges = []
  if (!tpl.row_heights) tpl.row_heights = {}
  if (!tpl.cau_hinh_trang) {
    tpl.cau_hinh_trang = createStarterTemplateConfig().cau_hinh_trang
  }
  if (!tpl.cau_hinh_trang.logo_url) {
    tpl.cau_hinh_trang.logo_url = tpl.cau_hinh_trang.logo_trai || '/logo1.png'
  }
  if (!tpl.cau_hinh_trang.logo_width_pct) {
    if (tpl.cau_hinh_trang.logo_width) {
      tpl.cau_hinh_trang.logo_width_pct = Math.max(10, Math.min(100, Math.round((tpl.cau_hinh_trang.logo_width / 750) * 100)))
    } else {
      tpl.cau_hinh_trang.logo_width_pct = 35
    }
  }
  if (!tpl.cau_hinh_trang.logo_height) {
    tpl.cau_hinh_trang.logo_height = 68
  }

  const totalCols = Math.max(tpl.so_cot || 10, 8)
  const midCol = Math.min(6, Math.floor(totalCols * 0.6))
  const rightStart = midCol + 1
  const headerR = tpl.mapping_vung?.dong_tieu_de_bang || 11

  const isRowEmpty = (r: number) => {
    for (let c = 1; c <= totalCols; c++) {
      if (tpl.grid_cells[`${r}_${c}`]?.value?.trim()) return false
    }
    return true
  }

  const ensureRowMerge = (r: number, left: number, right: number) => {
    if (right <= left) return
    const exists = tpl.merges.some(m => m.top === r && m.bottom === r && !(m.right < left || m.left > right))
    if (!exists) {
      tpl.merges.push({ top: r, left, bottom: r, right })
    }
  }

  // Convert legacy {{LOGO_TRAI}} / {{LOGO_PHAI}} to single {{LOGO}}
  Object.keys(tpl.grid_cells).forEach(k => {
    const cell = tpl.grid_cells[k]
    if (!cell || !cell.value) return
    if (cell.value.includes('{{LOGO_TRAI}}')) {
      cell.value = cell.value.replace(/\{\{LOGO_TRAI\}\}/g, '{{LOGO}}')
    }
    if (cell.value.includes('{{LOGO_PHAI}}')) {
      cell.value = cell.value.replace(/\{\{LOGO_PHAI\}\}/g, '').trim()
    }
  })

  // Row 1: Single Logo merged across all columns 1..totalCols
  if (headerR >= 5) {
    if (isRowEmpty(1)) {
      tpl.grid_cells['1_1'] = {
        value: '{{LOGO}}',
        style: { bold: true, fontSize: 10, color: '#0070c0', align: 'left', valign: 'middle' }
      }
    }
    if (!tpl.row_heights[1]) tpl.row_heights[1] = 72
    tpl.merges = tpl.merges.filter(m => m.top !== 1)
    ensureRowMerge(1, 1, totalCols)
  }

  // Row 2-4: Company Sender Header
  if (headerR >= 6 && isRowEmpty(2)) {
    tpl.grid_cells['2_1'] = {
      value: '{{TEN_CONG_TY_BAN}}',
      style: { bold: true, fontSize: 13, color: '#0070c0', align: 'left' }
    }
    ensureRowMerge(2, 1, totalCols)
  }
  if (headerR >= 6 && isRowEmpty(3)) {
    tpl.grid_cells['3_1'] = {
      value: 'Địa chỉ: {{DIA_CHI_CONG_TY_BAN}}',
      style: { italic: true, fontSize: 10, color: '#475569', align: 'left' }
    }
    ensureRowMerge(3, 1, totalCols)
  }
  if (headerR >= 6 && isRowEmpty(4)) {
    tpl.grid_cells['4_1'] = {
      value: 'Tel: {{SDT_NGUOI_LAP}}  |  Email: {{EMAIL_NGUOI_LAP}}',
      style: { fontSize: 10, color: '#475569', align: 'left' }
    }
    ensureRowMerge(4, 1, totalCols)
  }

  // Row 5-6: Quotation Title
  if (headerR >= 7 && isRowEmpty(5)) {
    tpl.grid_cells['5_1'] = {
      value: 'BẢNG BÁO GIÁ (QUOTATION)',
      style: { bold: true, fontSize: 16, color: '#0f172a', align: 'center' }
    }
    if (!tpl.row_heights[5]) tpl.row_heights[5] = 32
    ensureRowMerge(5, 1, totalCols)
  }
  if (headerR >= 8 && isRowEmpty(6)) {
    tpl.grid_cells['6_1'] = {
      value: 'Số báo giá: {{SO_HOP_DONG}}   |   Mã HĐ: {{MA_HOP_DONG}}',
      style: { italic: true, fontSize: 10, color: '#475569', align: 'center' }
    }
    ensureRowMerge(6, 1, totalCols)
  }

  // Row 7-10: Customer & Contract Header
  if (headerR >= 10) {
    if (isRowEmpty(7)) {
      tpl.grid_cells['7_1'] = {
        value: 'Kính gởi: {{TEN_CONG_TY}}',
        style: { bold: true, fontSize: 11, color: '#0f172a', align: 'left' }
      }
      tpl.grid_cells[`7_${rightStart}`] = {
        value: 'Ngày: {{NGAY_BAO_GIA}}',
        style: { bold: true, fontSize: 11, color: '#0f172a', align: 'right' }
      }
      ensureRowMerge(7, 1, midCol)
      ensureRowMerge(7, rightStart, totalCols)
    } else if (!tpl.grid_cells[`7_${rightStart}`]?.value && !tpl.grid_cells['7_7']?.value) {
      tpl.grid_cells[`7_${rightStart}`] = {
        value: 'Ngày: {{NGAY_BAO_GIA}}',
        style: { bold: true, fontSize: 11, color: '#0f172a', align: 'right' }
      }
      ensureRowMerge(7, rightStart, totalCols)
    }

    if (isRowEmpty(8)) {
      tpl.grid_cells['8_1'] = {
        value: 'Địa chỉ: {{DIA_CHI_KH}}',
        style: { italic: true, fontSize: 11, color: '#1e293b', align: 'left' }
      }
      tpl.grid_cells[`8_${rightStart}`] = {
        value: 'Mã số thuế: {{MST_KH}}',
        style: { fontSize: 11, color: '#1e293b', align: 'right' }
      }
      ensureRowMerge(8, 1, midCol)
      ensureRowMerge(8, rightStart, totalCols)
    }

    if (isRowEmpty(9)) {
      tpl.grid_cells['9_1'] = {
        value: 'Người nhận: {{TEN_KHACH_HANG}}   |   ĐT: {{SDT_KH}}   |   Email: {{EMAIL_KH}}',
        style: { italic: true, fontSize: 11, color: '#1e293b', align: 'left' }
      }
      tpl.grid_cells[`9_${rightStart}`] = {
        value: 'Tiền tệ: {{DON_VI_TIEN_TE}}',
        style: { fontSize: 11, color: '#1e293b', align: 'right' }
      }
      ensureRowMerge(9, 1, midCol)
      ensureRowMerge(9, rightStart, totalCols)
    }

    if (headerR >= 11 && isRowEmpty(10)) {
      tpl.grid_cells['10_1'] = {
        value: 'Công ty chúng tôi xin trân trọng gửi đến Quý Khách hàng bảng báo giá chi tiết như sau:',
        style: { fontSize: 11, color: '#334155', align: 'left' }
      }
      ensureRowMerge(10, 1, totalCols)
    }
  }

  // Ensure Table Column Header row (`dong_tieu_de_bang`) is populated from `cau_hinh_cot_bang` if any cell is empty
  if (headerR > 0 && Array.isArray(tpl.cau_hinh_cot_bang)) {
    tpl.cau_hinh_cot_bang.forEach((col, idx) => {
      const c = col.colIndex || (idx + 1)
      if (c <= totalCols && !tpl.grid_cells[`${headerR}_${c}`]?.value?.trim()) {
        tpl.grid_cells[`${headerR}_${c}`] = {
          value: col.header || `Cột ${c}`,
          style: {
            bold: true,
            fontSize: 11,
            color: '#ffffff',
            bgColor: '#0070c0',
            align: 'center',
            valign: 'middle',
            border: true,
            wrapText: true
          }
        }
      }
    })
  }

  return tpl
}

export function createBlankTemplateConfig(name = 'Mẫu Báo Giá Tự Tạo'): PrintTemplateConfig {
  const tpl = createStarterTemplateConfig(undefined, name)
  tpl.ghi_chu = 'Mẫu tự thiết kế trên bảng lưới (đã có sẵn khung Header)'
  tpl.link_file_goc = ''
  // Giữ nguyên phần Header (Dòng 1 -> 11) để người dùng thấy luôn trên lưới, chỉ để trống phần dưới để tự gõ/gắn token tùy ý
  const headerCells: Record<string, GridCellData> = {}
  Object.entries(tpl.grid_cells).forEach(([k, v]) => {
    const r = Number(k.split('_')[0])
    if (r <= 11) headerCells[k] = v
  })
  tpl.grid_cells = headerCells
  tpl.merges = tpl.merges.filter(m => m.bottom <= 11)
  return tpl
}

/* =====================================================
   5. ĐỌC FILE EXCEL (.XLSX) LÊN BẢNG LƯỚI & TỰ ĐỘNG GẮN TOKEN
===================================================== */
export function excelCellToPlainText(v: any): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  if (v.richText && Array.isArray(v.richText)) return v.richText.map((r: any) => r.text || '').join('')
  if (v.text) return String(v.text)
  if (v.result !== undefined) return String(v.result)
  return String(v)
}

function argbToHex(argb?: string): string | undefined {
  if (!argb || typeof argb !== 'string') return undefined
  const clean = argb.replace(/^#/, '').trim()
  if (clean.length === 8) {
    return '#' + clean.slice(2)
  }
  if (clean.length === 6) {
    return '#' + clean
  }
  return undefined
}

export function identifyHeaderField(text: string): string | null {
  const t = String(text || '').toUpperCase().trim()
  if (!t) return null
  if (t === 'STT' || t === 'SỐ TT' || t === 'NO.' || t === 'TT') return 'stt'
  if (t === 'P/N' || t === 'PN' || t.includes('MÃ HÀNG') || t.includes('PART NUMBER')) return 'pn'
  if (t.includes('TÊN HÀNG') || t.includes('HÀNG HÓA') || t.includes('DỊCH VỤ') || t.includes('SẢN PHẨM') || t === 'MODEL') return 'ten_hang'
  if (t.includes('DIỄN GIẢI') || t.includes('DIEN GIAI') || t.includes('MÔ TẢ') || t.includes('ĐẶC TÍNH') || t.includes('THÔNG SỐ') || t.includes('NỘI DUNG') || t.includes('HẠNG MỤC') || t.includes('DESCRIPTION') || t.includes('SPEC')) return 'features'
  if (t === 'ĐVT' || t === 'DVT' || t.includes('ĐƠN VỊ TÍNH') || t.includes('DON VI TINH') || t === 'UNIT') return 'dvt'
  if (t.includes('THỜI HẠN') || t.includes('THOI HAN') || t.includes('DURATION')) return 'license_duration'
  if (t.includes('BẢO HÀNH') || t.includes('BAO HANH') || t.includes('WARRANTY')) return 'thoi_gian_bao_hanh'
  if (t.includes('SỐ LƯỢNG') || t.includes('S.LƯỢNG') || t === 'SL' || t === 'S.L' || t === 'S.L.' || t.includes('SO LUONG') || t === 'QTY') return 'so_luong'
  if (t.includes('ĐƠN GIÁ') || t.includes('DON GIA') || t.includes('UNIT PRICE')) return 'don_gia_kh'
  if (t.includes('TRƯỚC THUẾ') || t.includes('TRUOC THUE')) return 'truoc_thue'
  if (t.includes('SAU THUẾ') || t.includes('SAU THUE') || t.includes('+ VAT') || t.includes('+VAT')) return 'sau_thue'
  if (t.includes('VAT') || (t.includes('THUẾ') && !t.includes('TRƯỚC') && !t.includes('SAU') && !t.includes('THÀNH TIỀN'))) return 'vat'
  if (t.includes('THÀNH TIỀN') || t.includes('THANH TIEN') || t.includes('AMOUNT')) return 'truoc_thue'
  return null
}

export async function parseExcelBufferToTemplateConfig(
  buffer: ArrayBuffer,
  baseTemplate?: Partial<PrintTemplateConfig>
): Promise<PrintTemplateConfig> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(buffer)
  const ws = wb.worksheets[0]
  if (!ws) throw new Error('File Excel không có trang tính (worksheet) nào.')

  const tpl = createStarterTemplateConfig(
    baseTemplate?.id,
    baseTemplate?.ten_mau || ws.name || 'Mẫu Import Excel'
  )
  tpl.loai_mau = 'imported_excel'
  tpl.link_file_goc = baseTemplate?.link_file_goc || ''
  tpl.ghi_chu = baseTemplate?.ghi_chu || ''
  tpl.grid_cells = {}
  tpl.merges = []
  tpl.col_widths = {}
  tpl.row_heights = {}

  // Extract merges
  const mergesObj = (ws as any)._merges || {}
  let maxMergedCol = 1
  let maxMergedRow = 1
  Object.values(mergesObj).forEach((m: any) => {
    const model = m.model || m
    if (model && model.top && model.left) {
      tpl.merges.push({
        top: model.top,
        left: model.left,
        bottom: model.bottom,
        right: model.right
      })
      if (model.right > maxMergedCol) maxMergedCol = model.right
      if (model.bottom > maxMergedRow) maxMergedRow = model.bottom
    }
  })

  // Determine grid bounds
  const rowCount = Math.min(Math.max(ws.rowCount || 20, maxMergedRow, 18), 80)
  let colCount = Math.max(maxMergedCol, 10)
  ws.eachRow((row) => {
    row.eachCell((cell, colNumber) => {
      if (colNumber <= 25 && excelCellToPlainText(cell.value).trim()) {
        if (colNumber > colCount) colCount = colNumber
      }
    })
  })
  colCount = Math.min(Math.max(colCount, 8), 20)

  tpl.so_dong = rowCount
  tpl.so_cot = colCount

  for (let c = 1; c <= colCount; c++) {
    const w = ws.getColumn(c).width
    tpl.col_widths[c] = w ? Math.round(w * 7.5) : 110
  }

  // Scan rows for header, group, item, total, terms, signature
  let headerRowIdx = -1
  let totalRowIdx = -1
  let termRowIdx = -1
  let sigRowIdx = -1
  const colFieldMap: Record<number, string> = {}

  for (let r = 1; r <= rowCount; r++) {
    const row = ws.getRow(r)
    if (row.height) tpl.row_heights[r] = Math.round(row.height)

    // Check if this row is the table header
    if (headerRowIdx === -1) {
      let recognized = 0
      const tempMap: Record<number, string> = {}
      for (let c = 1; c <= colCount; c++) {
        const text = excelCellToPlainText(row.getCell(c).value).trim()
        const f = identifyHeaderField(text)
        if (f) {
          tempMap[c] = f
          recognized++
        }
      }
      // Or check if next row has {{STT}} or {{TEN_HANG}}
      if (recognized >= 3) {
        headerRowIdx = r
        Object.assign(colFieldMap, tempMap)
      }
    }

    // Check cells in this row
    for (let c = 1; c <= colCount; c++) {
      const cell = row.getCell(c)
      let val = excelCellToPlainText(cell.value)
      const font = cell.font || {}
      const fill = cell.fill as any
      const align = cell.alignment || {}
      const border = cell.border

      const bgColor = fill?.fgColor?.argb ? argbToHex(fill.fgColor.argb) : undefined
      const textColor = font?.color?.argb ? argbToHex(font.color.argb) : undefined

      // Auto-convert common static labels in header area into tokens if no token exists yet
      if (headerRowIdx === -1 || r < headerRowIdx) {
        const lower = val.toLowerCase().trim()
        if ((lower.startsWith('kính gởi') || lower.startsWith('kính gửi')) && !val.includes('{{')) {
          val = 'Kính gởi: {{TEN_CONG_TY}}'
        } else if (lower.startsWith('địa chỉ') && !lower.includes('giao hàng') && !lower.includes('tăng bạt hổ') && !val.includes('{{')) {
          val = 'Địa chỉ: {{DIA_CHI_KH}}'
        } else if (lower.startsWith('người nhận') && !lower.includes('hàng') && !val.includes('{{')) {
          val = 'Người nhận: {{TEN_KHACH_HANG}}'
        } else if ((lower.startsWith('ngày :') || lower.startsWith('ngày:')) && !val.includes('{{')) {
          val = 'Ngày: {{NGAY_BAO_GIA}}'
        }
      }

      // Detect total row
      const upperVal = val.toUpperCase()
      if (headerRowIdx !== -1 && r > headerRowIdx && totalRowIdx === -1) {
        if (upperVal.includes('TỔNG CỘNG') || upperVal.includes('TONG CONG') || val.includes('{{TONG_')) {
          totalRowIdx = r
        }
      }

      // Detect terms & signature rows
      if (totalRowIdx !== -1 && r > totalRowIdx) {
        const lower = val.toLowerCase()
        if (termRowIdx === -1 && (lower.includes('điều khoản') || lower.includes('điều kiện') || val.includes('{{DIEU_KHOAN}}'))) {
          termRowIdx = val.includes('{{DIEU_KHOAN}}') ? r : Math.min(r + 1, rowCount)
        }
        if (sigRowIdx === -1 && (val.includes('Người lập') || val.includes('ĐẠI DIỆN') || val.includes('Xác nhận') || val.includes('BÊN MUA') || val.includes('{{NGUOI_LAP}}'))) {
          if (val.length < 60) sigRowIdx = r
        }
      }

      // Save cell to grid_cells
      if (val !== '' || bgColor || border || font.bold) {
        tpl.grid_cells[`${r}_${c}`] = {
          value: val,
          style: {
            bold: !!font.bold,
            italic: !!font.italic,
            underline: !!font.underline,
            fontSize: font.size ? Math.round(font.size) : 11,
            fontFamily: font.name || 'Calibri',
            color: textColor || '#0f172a',
            bgColor: bgColor,
            align: (align.horizontal as any) || 'left',
            valign: (align.vertical as any) || 'middle',
            border: !!(border && (border.top || border.bottom || border.left || border.right)),
            wrapText: !!align.wrapText
          }
        }
      }
    }
  }

  // Configure mapping_vung & auto-populate tokens on group/item/total rows if not already tokenized
  if (headerRowIdx !== -1) {
    tpl.mapping_vung.dong_tieu_de_bang = headerRowIdx
    const candidateGroupRow = headerRowIdx + 1
    const candidateItemRow = headerRowIdx + 2

    if (totalRowIdx !== -1 && totalRowIdx - headerRowIdx >= 3) {
      tpl.mapping_vung.dong_mau_nhom = candidateGroupRow
      tpl.mapping_vung.dong_mau_san_pham = candidateItemRow
    } else if (totalRowIdx !== -1 && totalRowIdx - headerRowIdx === 2) {
      tpl.mapping_vung.dong_mau_nhom = 0
      tpl.mapping_vung.dong_mau_san_pham = candidateGroupRow
    } else {
      tpl.mapping_vung.dong_mau_nhom = candidateGroupRow
      tpl.mapping_vung.dong_mau_san_pham = candidateItemRow
    }

    if (totalRowIdx !== -1) {
      tpl.mapping_vung.danh_sach_dong_tong = [totalRowIdx]
    }
    if (termRowIdx !== -1) {
      tpl.mapping_vung.dong_dieu_khoan = termRowIdx
    }
    if (sigRowIdx !== -1) {
      tpl.mapping_vung.dong_chu_ky = sigRowIdx
    }

    // Build cau_hinh_cot_bang
    const colsConfig: PrintTemplateConfig['cau_hinh_cot_bang'] = []
    for (let c = 1; c <= colCount; c++) {
      const hText = tpl.grid_cells[`${headerRowIdx}_${c}`]?.value || ''
      const field = colFieldMap[c] || identifyHeaderField(hText) || 'empty'
      const token = LEGACY_FIELD_TO_TOKEN[field] || ''
      colsConfig.push({
        colIndex: c,
        header: hText || `Cột ${c}`,
        field,
        token,
        width: Math.round((tpl.col_widths[c] || 100) / 7.5)
      })

      // Auto-fill item row tokens if the imported template had sample values instead of {{TOKEN}}
      const itemR = tpl.mapping_vung.dong_mau_san_pham
      if (itemR > 0 && token) {
        const existingCell = tpl.grid_cells[`${itemR}_${c}`]
        const existingVal = existingCell?.value || ''
        if (!existingVal.includes('{{')) {
          tpl.grid_cells[`${itemR}_${c}`] = {
            value: token,
            style: existingCell?.style || {
              fontSize: 11,
              align: ['so_luong', 'don_gia_kh', 'truoc_thue', 'vat', 'sau_thue'].includes(field) ? 'right' : 'left',
              border: true
            }
          }
        }
      }

      // Auto-fill total row tokens
      if (totalRowIdx !== -1) {
        const totCell = tpl.grid_cells[`${totalRowIdx}_${c}`]
        if (field === 'truoc_thue' && (!totCell?.value || !totCell.value.includes('{{'))) {
          tpl.grid_cells[`${totalRowIdx}_${c}`] = {
            value: '{{TONG_TRUOC_THUE}}',
            style: { ...(totCell?.style || {}), bold: true, align: 'right', border: true }
          }
        } else if (field === 'vat' && (!totCell?.value || !totCell.value.includes('{{'))) {
          tpl.grid_cells[`${totalRowIdx}_${c}`] = {
            value: '{{TONG_TIEN_VAT}}',
            style: { ...(totCell?.style || {}), bold: true, align: 'right', border: true }
          }
        } else if (field === 'sau_thue' && (!totCell?.value || !totCell.value.includes('{{'))) {
          tpl.grid_cells[`${totalRowIdx}_${c}`] = {
            value: '{{TONG_SAU_THUE}}',
            style: { ...(totCell?.style || {}), bold: true, align: 'right', border: true }
          }
        }
      }
    }
    tpl.cau_hinh_cot_bang = colsConfig

    // Auto-fill group row tokens if group row exists
    const grpR = tpl.mapping_vung.dong_mau_nhom
    if (grpR > 0) {
      const c1 = tpl.grid_cells[`${grpR}_1`]
      if (!c1?.value?.includes('{{')) {
        tpl.grid_cells[`${grpR}_1`] = {
          value: '{{NHOM_STT}}',
          style: { ...(c1?.style || {}), bold: true, align: 'center', border: true }
        }
      }
      const c2 = tpl.grid_cells[`${grpR}_2`]
      if (!c2?.value?.includes('{{')) {
        tpl.grid_cells[`${grpR}_2`] = {
          value: '{{NHOM_TEN}}',
          style: { ...(c2?.style || {}), bold: true, align: 'left', border: true }
        }
      }
    }

    // Ensure {{DIEU_KHOAN}} is placed on termRowIdx if not present anywhere
    const hasTermToken = Object.values(tpl.grid_cells).some(cell => cell.value?.includes('{{DIEU_KHOAN}}'))
    if (!hasTermToken && tpl.mapping_vung.dong_dieu_khoan > 0) {
      const tr = tpl.mapping_vung.dong_dieu_khoan
      const existingTermCell = tpl.grid_cells[`${tr}_1`] || tpl.grid_cells[`${tr}_2`]
      tpl.grid_cells[`${tr}_1`] = {
        value: '{{DIEU_KHOAN}}',
        style: existingTermCell?.style || { fontSize: 11, align: 'left', wrapText: true }
      }
    }
  }

  return ensureGridHeaderPopulated(tpl)
}

/* =====================================================
   6. ĐỒNG BỘ FIREBASE (`mau_in_thiet_lap` <-> `upload_file_mau`)
===================================================== */
export async function fetchAndSyncPrintTemplates(): Promise<PrintTemplateConfig[]> {
  const database = getDb()
  try {
    const [mauInSnap, legacySnap] = await Promise.all([
      get(dbRef(database, 'mau_in_thiet_lap')),
      get(dbRef(database, 'upload_file_mau'))
    ])

    const mauInData = mauInSnap.val() || {}
    const legacyData = legacySnap.val() || {}

    const templatesMap = new Map<string, PrintTemplateConfig>()
    const syncedLegacyIds = new Set<string>()

    // 1. Load existing records in `mau_in_thiet_lap`
    if (mauInData && typeof mauInData === 'object') {
      for (const [k, raw] of Object.entries(mauInData) as [string, any][]) {
        if (!raw || typeof raw !== 'object') continue
        const id = String(raw.id || k)
        const parsedGridCells = typeof raw.grid_cells === 'string'
          ? JSON.parse(raw.grid_cells || '{}')
          : (raw.grid_cells || {})
        const parsedMerges = typeof raw.merges === 'string'
          ? JSON.parse(raw.merges || '[]')
          : (Array.isArray(raw.merges) ? raw.merges : [])
        const parsedCols = typeof raw.cau_hinh_cot_bang === 'string'
          ? JSON.parse(raw.cau_hinh_cot_bang || '[]')
          : (Array.isArray(raw.cau_hinh_cot_bang) ? raw.cau_hinh_cot_bang : [])

        const starter = createStarterTemplateConfig(id, raw.ten_mau || 'Mẫu in')
        const tpl: PrintTemplateConfig = ensureGridHeaderPopulated({
          ...starter,
          ...raw,
          id,
          cau_hinh_trang: { ...starter.cau_hinh_trang, ...(raw.cau_hinh_trang || {}) },
          thong_tin_nguoi_lap: { ...starter.thong_tin_nguoi_lap, ...(raw.thong_tin_nguoi_lap || {}) },
          mapping_vung: {
            ...starter.mapping_vung,
            ...(raw.mapping_vung || {}),
            danh_sach_dong_tong: Array.isArray(raw.mapping_vung?.danh_sach_dong_tong)
              ? raw.mapping_vung.danh_sach_dong_tong
              : [14]
          },
          cau_hinh_cot_bang: parsedCols.length ? parsedCols : starter.cau_hinh_cot_bang,
          col_widths: raw.col_widths || starter.col_widths,
          row_heights: raw.row_heights || starter.row_heights,
          merges: parsedMerges,
          grid_cells: parsedGridCells
        })
        templatesMap.set(id, tpl)
        if (tpl.source_upload_id) syncedLegacyIds.add(String(tpl.source_upload_id))
        syncedLegacyIds.add(id)
      }
    }

    // 2. Auto-sync any templates in `upload_file_mau` that are not yet in `mau_in_thiet_lap`
    const newSyncUpdates: Record<string, any> = {}
    if (legacyData && typeof legacyData === 'object') {
      for (const [k, v] of Object.entries(legacyData) as [string, any][]) {
        if (!v) continue
        let legId = k
        let legName = ''
        let legUrl = ''
        let legNote = ''
        let legStruct: any[] = []

        if (Array.isArray(v)) {
          legId = String(v[0] || k)
          legName = String(v[1] || 'Mẫu tải lên')
          legUrl = String(v[2] || '')
          try { legStruct = typeof v[3] === 'string' ? JSON.parse(v[3]) : (v[3] || []) } catch {}
          legNote = String(v[4] || '')
        } else {
          legId = String(v.ID ?? v.id ?? k)
          legName = String(v.TEN_FILE ?? v.ten_file ?? 'Mẫu tải lên')
          legUrl = String(v.LINK_FILE ?? v.link_file ?? '')
          legNote = String(v.GHI_CHU ?? v.ghi_chu ?? '')
          const rawS = v.STRUCTURE ?? v.structure ?? ''
          if (Array.isArray(rawS)) legStruct = rawS
          else if (typeof rawS === 'string' && rawS.trim()) {
            try { legStruct = JSON.parse(rawS) } catch {}
          }
        }

        if (!legId || syncedLegacyIds.has(legId) || syncedLegacyIds.has(`MINTL_${legId}`)) continue

        const newId = `MINTL_${legId}`
        let migratedTpl = createStarterTemplateConfig(newId, legName.replace(/\.xlsx$/i, ''))
        migratedTpl.loai_mau = 'imported_excel'
        migratedTpl.link_file_goc = legUrl
        migratedTpl.ghi_chu = legNote || 'Đồng bộ tự động từ mẫu đã tải lên'
        migratedTpl.source_upload_id = legId

        // Try fetching and parsing the Excel file from legUrl so its grid & tokens are ready
        if (legUrl && legUrl.startsWith('http')) {
          try {
            const resp = await fetch(legUrl)
            if (resp.ok) {
              const buf = await resp.arrayBuffer()
              migratedTpl = await parseExcelBufferToTemplateConfig(buf, {
                id: newId,
                ten_mau: legName.replace(/\.xlsx$/i, ''),
                link_file_goc: legUrl,
                ghi_chu: legNote || 'Đồng bộ tự động từ mẫu đã tải lên',
                source_upload_id: legId
              })
            }
          } catch (err) {
            console.warn('Không thể tải trực tiếp file mẫu cũ khi đồng bộ, dùng cấu hình mặc định:', err)
          }
        }

        if (Array.isArray(legStruct) && legStruct.length > 0) {
          migratedTpl.cau_hinh_cot_bang = legStruct.map((col: any, idx: number) => ({
            colIndex: col.colIndex || (idx + 1),
            header: col.header || `Cột ${idx + 1}`,
            field: col.field || 'empty',
            token: LEGACY_FIELD_TO_TOKEN[col.field] || '',
            width: 15
          }))
        }

        migratedTpl = ensureGridHeaderPopulated(migratedTpl)
        templatesMap.set(newId, migratedTpl)
        newSyncUpdates[`mau_in_thiet_lap/${newId}`] = serializeTemplateForFirebase(migratedTpl)
      }
    }

    // 3. Ensure at least 1 default starter template exists if `mau_in_thiet_lap` is completely empty
    if (templatesMap.size === 0) {
      const defaultTpl = createStarterTemplateConfig('MINTL_DEFAULT_NTS', 'Mẫu Báo Giá Chuẩn NTS (Mặc định)')
      defaultTpl.mac_dinh = true
      templatesMap.set(defaultTpl.id, defaultTpl)
      newSyncUpdates[`mau_in_thiet_lap/${defaultTpl.id}`] = serializeTemplateForFirebase(defaultTpl)
    } else {
      // Ensure at least one template has mac_dinh = true
      const hasDefault = Array.from(templatesMap.values()).some(t => t.mac_dinh)
      if (!hasDefault) {
        const first = Array.from(templatesMap.values())[0]
        first.mac_dinh = true
        newSyncUpdates[`mau_in_thiet_lap/${first.id}/mac_dinh`] = true
      }
    }

    if (Object.keys(newSyncUpdates).length > 0) {
      await update(dbRef(database), newSyncUpdates)
    }

    const list = Array.from(templatesMap.values())
    list.sort((a, b) => (b.mac_dinh ? 1 : 0) - (a.mac_dinh ? 1 : 0))
    return list
  } catch (e) {
    console.error('Lỗi fetchAndSyncPrintTemplates:', e)
    const fallback = createStarterTemplateConfig('MINTL_DEFAULT_NTS', 'Mẫu Báo Giá Chuẩn NTS (Mặc định)')
    fallback.mac_dinh = true
    return [fallback]
  }
}

export function serializeTemplateForFirebase(tpl: PrintTemplateConfig): any {
  return {
    ...JSON.parse(JSON.stringify(tpl)),
    ngay_cap_nhat: formatNowVN()
  }
}

export async function savePrintTemplateToFirebase(tpl: PrintTemplateConfig): Promise<void> {
  const database = getDb()
  tpl.ngay_cap_nhat = formatNowVN()
  const payload = serializeTemplateForFirebase(tpl)
  await set(dbRef(database, `mau_in_thiet_lap/${tpl.id}`), payload)

  // Đồng bộ ngược sang upload_file_mau nếu có link_file_goc để tương thích hoàn toàn
  if (tpl.link_file_goc) {
    const legacyId = tpl.source_upload_id || tpl.id
    const structStr = JSON.stringify(
      (tpl.cau_hinh_cot_bang || []).map(c => ({
        colIndex: c.colIndex,
        header: c.header,
        field: c.field
      }))
    )
    await set(dbRef(database, `upload_file_mau/${legacyId}`), {
      ID: legacyId,
      id: legacyId,
      TEN_FILE: tpl.ten_mau.endsWith('.xlsx') ? tpl.ten_mau : `${tpl.ten_mau}.xlsx`,
      ten_file: tpl.ten_mau.endsWith('.xlsx') ? tpl.ten_mau : `${tpl.ten_mau}.xlsx`,
      LINK_FILE: tpl.link_file_goc,
      link_file: tpl.link_file_goc,
      STRUCTURE: structStr,
      structure: structStr,
      GHI_CHU: tpl.ghi_chu || '',
      ghi_chu: tpl.ghi_chu || ''
    })
  }
}

export async function setDefaultPrintTemplateInFirebase(targetId: string, allTemplates: PrintTemplateConfig[]): Promise<void> {
  const database = getDb()
  const updates: Record<string, any> = {}
  allTemplates.forEach(t => {
    const isDef = t.id === targetId
    t.mac_dinh = isDef
    updates[`mau_in_thiet_lap/${t.id}/mac_dinh`] = isDef
  })
  await update(dbRef(database), updates)
}

export async function deletePrintTemplateFromFirebase(tpl: PrintTemplateConfig): Promise<void> {
  const database = getDb()
  await remove(dbRef(database, `mau_in_thiet_lap/${tpl.id}`))
  if (tpl.source_upload_id) {
    await remove(dbRef(database, `upload_file_mau/${tpl.source_upload_id}`))
  }
}

/* =====================================================
   7. ENGINE KẾT XUẤT ĐA ĐỊNH DẠNG (EXCEL, HTML, PDF, PNG)
===================================================== */
export interface QuoteExportRowItem {
  type: 'group' | 'item'
  roman?: string
  title?: string
  supplier?: string
  stt?: number | string
  item?: any
  // Pre-calculated values from baogiaFirebase
  donGiaKH?: number
  truocThue?: number
  vatAmount?: number
  sauThue?: number
  listPrice?: number
  giaTieuChuan?: number
  giaNhap?: number
  pctOffHang?: number | string
  pctOff?: number | string
  pctVat?: number | string
}

export interface QuoteExportContext {
  khach: {
    Ma_khach_hang?: string
    Ten_khach_hang?: string
    Ten_cong_ty?: string
    Dia_chi_cong_ty?: string
    ADDRESS?: string
    MST?: string
    So_dien_thoai_cong_ty?: string
    So_dien_thoai_ca_nhan?: string
    TEL?: string
    Email_cong_ty?: string
    Email_ca_nhan?: string
    So_fax_cong_ty?: string
  }
  maHopDong: string
  soHopDong: string
  soPO: string
  noiDungPO: string
  currency: 'VND' | 'USD'
  tiGia: number
  rows: QuoteExportRowItem[]
  totals: {
    truoc: number
    vat: number
    sau: number
    off: number
  }
  termsHtml: string
  customDefaultFont?: { name: string; size: number }
}

export function createMockQuoteContext(tpl: PrintTemplateConfig): QuoteExportContext {
  return {
    khach: {
      Ma_khach_hang: 'KH_DEMO_01',
      Ten_khach_hang: 'Anh Nguyễn Văn Minh',
      Ten_cong_ty: 'CÔNG TY CỔ PHẦN GIẢI PHÁP SỐ ĐẠI DƯƠNG',
      Dia_chi_cong_ty: 'Tầng 12, Tòa nhà Viettel, 285 Cách Mạng Tháng 8, Quận 10, TP.HCM',
      MST: '0314567890',
      So_dien_thoai_cong_ty: '0909 888 999',
      Email_cong_ty: 'minh.nguyen@daiduongdigital.vn',
      So_fax_cong_ty: '028 3868 9999'
    },
    maHopDong: 'HD20261018',
    soHopDong: 'HĐ168',
    soPO: 'PO-168',
    noiDungPO: 'Báo giá bản quyền phần mềm bảo mật hệ thống',
    currency: 'VND',
    tiGia: 25400,
    rows: [
      {
        type: 'group',
        roman: 'I',
        title: 'PHẦN MỀM BẢO MẬT KASPERSKY',
        supplier: 'Kaspersky'
      },
      {
        type: 'item',
        stt: 1,
        item: {
          Ma_hang: 'KL4867XARFS',
          Ten_hang: 'Kaspersky Endpoint Security for Business - Select',
          Features: 'Bản quyền phần mềm bảo mật cho doanh nghiệp\n- Bảo vệ toàn diện máy trạm Windows, macOS, Linux\n- Quản lý tập trung qua Kaspersky Security Center',
          Ten_nha_cung_cap: 'Kaspersky',
          Danh_muc: 'PHẦN MỀM BẢO MẬT KASPERSKY',
          DVT: 'License',
          License_duration: '1 Năm',
          thoi_han_bao_hanh: '12 tháng',
          volume: '50-99 users',
          So_luong: 50,
          Ghi_chu: 'Gia hạn bản quyền'
        },
        listPrice: 1200000,
        giaTieuChuan: 960000,
        giaNhap: 850000,
        pctOffHang: 20,
        pctOff: 10,
        donGiaKH: 1080000,
        truocThue: 54000000,
        pctVat: 8,
        vatAmount: 4320000,
        sauThue: 58320000
      },
      {
        type: 'item',
        stt: 2,
        item: {
          Ma_hang: 'SVC-DEPLOY-01',
          Ten_hang: 'Dịch vụ cài đặt, cấu hình & chuyển giao công nghệ',
          Features: 'Triển khai hệ thống quản trị tập trung và đào tạo vận hành tiêu chuẩn hãng',
          Ten_nha_cung_cap: 'NTS',
          Danh_muc: 'PHẦN MỀM BẢO MẬT KASPERSKY',
          DVT: 'Gói',
          License_duration: '1 Lần',
          thoi_han_bao_hanh: '12 tháng',
          volume: '1 Gói',
          So_luong: 1,
          Ghi_chu: 'Hỗ trợ tận nơi & từ xa'
        },
        listPrice: 10000000,
        giaTieuChuan: 10000000,
        giaNhap: 5000000,
        pctOffHang: 0,
        pctOff: 0,
        donGiaKH: 10000000,
        truocThue: 10000000,
        pctVat: 8,
        vatAmount: 800000,
        sauThue: 10800000
      }
    ],
    totals: {
      truoc: 64000000,
      vat: 5120000,
      sau: 69120000,
      off: 6000000
    },
    termsHtml: `<p><b>1. Điều khoản thanh toán:</b> Thanh toán 100% bằng chuyển khoản trong vòng 15 ngày kể từ ngày bàn giao License và hóa đơn GTGT.</p><p><b>2. Thời gian giao hàng:</b> Trong vòng 03 - 05 ngày làm việc sau khi xác nhận đơn đặt hàng.</p><p><b>3. Hiệu lực báo giá:</b> Báo giá có giá trị trong vòng ${tpl.thong_tin_nguoi_lap?.hieu_luc_bao_gia || '15 ngày'} kể từ ngày phát hành.</p>`
  }
}

export function formatMoneyVal(val: number, currency: 'VND' | 'USD'): string {
  const n = Number(val) || 0
  if (currency === 'USD') {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return Math.round(n).toLocaleString('vi-VN')
}

export function buildGlobalTokenMap(tpl: PrintTemplateConfig, ctx: QuoteExportContext): Record<string, string> {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = String(now.getFullYear())
  const sender = tpl.thong_tin_nguoi_lap || ({} as any)
  const k = ctx.khach || ({} as any)
  const curr = ctx.currency || 'VND'

  return {
    '{{TEN_CONG_TY}}': k.Ten_cong_ty || '',
    '{{TEN_KHACH_HANG}}': k.Ten_khach_hang || '',
    '{{MA_KHACH_HANG}}': k.Ma_khach_hang || '',
    '{{DIA_CHI_KH}}': k.Dia_chi_cong_ty || k.ADDRESS || '',
    '{{MST_KH}}': k.MST || '',
    '{{SDT_KH}}': k.So_dien_thoai_cong_ty || k.So_dien_thoai_ca_nhan || k.TEL || '',
    '{{EMAIL_KH}}': k.Email_cong_ty || k.Email_ca_nhan || '',
    '{{FAX_KH}}': k.So_fax_cong_ty || '',

    '{{NGAY_BAO_GIA}}': `${dd}/${mm}/${yyyy}`,
    '{{NGAY}}': dd,
    '{{THANG}}': mm,
    '{{NAM}}': yyyy,
    '{{MA_HOP_DONG}}': ctx.maHopDong || '',
    '{{SO_HOP_DONG}}': ctx.soHopDong || '',
    '{{SO_PO}}': ctx.soPO || '',
    '{{NOI_DUNG_PO}}': ctx.noiDungPO || '',
    '{{DON_VI_TIEN_TE}}': curr,
    '{{TI_GIA}}': formatMoneyVal(ctx.tiGia || 1, 'VND'),

    '{{NGUOI_LAP}}': sender.ten_nguoi_lap || 'Lê Phi Sơn',
    '{{CHUC_VU_NGUOI_LAP}}': sender.chuc_vu || 'Phó giám đốc NTS',
    '{{SDT_NGUOI_LAP}}': sender.so_dien_thoai || '090 813 7488',
    '{{EMAIL_NGUOI_LAP}}': sender.email || 'info@ntssi.vn',
    '{{TEN_CONG_TY_BAN}}': sender.ten_cong_ty_ban || 'NTS System Integration Corp.',
    '{{DIA_CHI_CONG_TY_BAN}}': sender.dia_chi_cong_ty_ban || '',
    '{{HIEU_LUC_BAO_GIA}}': sender.hieu_luc_bao_gia || '15 ngày',
    '{{LOGO}}': '',
    '{{LOGO_TRAI}}': '',
    '{{LOGO_PHAI}}': '',

    '{{TONG_TRUOC_THUE}}': formatMoneyVal(ctx.totals.truoc, curr),
    '{{TONG_TIEN_VAT}}': formatMoneyVal(ctx.totals.vat, curr),
    '{{TONG_SAU_THUE}}': formatMoneyVal(ctx.totals.sau, curr),
    '{{TONG_MUC_OFF}}': formatMoneyVal(ctx.totals.off, curr),
    '{{SO_TIEN_BANG_CHU}}': numberToWordsVN(ctx.totals.sau, curr)
  }
}

export function buildRowTokenMap(
  rowItem: QuoteExportRowItem,
  ctx: QuoteExportContext,
  globalMap: Record<string, string>
): { textMap: Record<string, string>; rawNumberMap: Record<string, number> } {
  const curr = ctx.currency || 'VND'
  if (rowItem.type === 'group') {
    return {
      textMap: {
        ...globalMap,
        '{{NHOM_STT}}': String(rowItem.roman || ''),
        '{{NHOM_TEN}}': String(rowItem.title || '').toUpperCase(),
        '{{NHOM_NCC}}': String(rowItem.supplier || '')
      },
      rawNumberMap: {}
    }
  }

  const it = rowItem.item || {}
  const sl = Number(it.So_luong) || 1
  const lp = Number(rowItem.listPrice) || 0
  const gtc = Number(rowItem.giaTieuChuan) || 0
  const gn = Number(rowItem.giaNhap) || 0
  const dg = Number(rowItem.donGiaKH) || 0
  const tt = Number(rowItem.truocThue) || 0
  const vat = Number(rowItem.vatAmount) || 0
  const st = Number(rowItem.sauThue) || 0
  const desc = it.Features || [it.Mo_ta_chung, it.Mo_ta_chi_tiet].filter(Boolean).join('\n') || it.Ten_hang || ''

  return {
    textMap: {
      ...globalMap,
      '{{STT}}': String(rowItem.stt ?? ''),
      '{{MA_HANG}}': String(it.Ma_hang || ''),
      '{{TEN_HANG}}': String(it.Ten_hang || ''),
      '{{DIEN_GIAI}}': String(desc || ''),
      '{{HANG}}': String(it.Ten_nha_cung_cap || it.Ma_nha_cung_cap || ''),
      '{{DANH_MUC}}': String(it.Danh_muc || ''),
      '{{DVT}}': String(it.DVT || ''),
      '{{THOI_HAN}}': String(it.License_duration || ''),
      '{{BAO_HANH}}': String(it.thoi_han_bao_hanh || ''),
      '{{VOLUME}}': String(it.volume || ''),
      '{{SO_LUONG}}': String(sl),
      '{{LIST_PRICE}}': formatMoneyVal(lp, curr),
      '{{GIA_TIEU_CHUAN}}': formatMoneyVal(gtc, curr),
      '{{PHAN_TRAM_OFF_HANG}}': `${rowItem.pctOffHang ?? 0}%`,
      '{{GIA_NHAP}}': formatMoneyVal(gn, curr),
      '{{PHAN_TRAM_OFF}}': `${rowItem.pctOff ?? 0}%`,
      '{{DON_GIA_KH}}': formatMoneyVal(dg, curr),
      '{{TT_TRUOC_THUE}}': formatMoneyVal(tt, curr),
      '{{PHAN_TRAM_VAT}}': `${rowItem.pctVat ?? 0}%`,
      '{{TIEN_VAT}}': formatMoneyVal(vat, curr),
      '{{TT_SAU_THUE}}': formatMoneyVal(st, curr),
      '{{GHI_CHU_SP}}': String(it.Ghi_chu || '')
    },
    rawNumberMap: {
      '{{SO_LUONG}}': sl,
      '{{LIST_PRICE}}': lp,
      '{{GIA_TIEU_CHUAN}}': gtc,
      '{{GIA_NHAP}}': gn,
      '{{DON_GIA_KH}}': dg,
      '{{TT_TRUOC_THUE}}': tt,
      '{{TIEN_VAT}}': vat,
      '{{TT_SAU_THUE}}': st
    }
  }
}

export function replaceTokensInText(text: string, tokenMap: Record<string, string>): string {
  if (!text) return ''
  let out = text
  for (const [tk, val] of Object.entries(tokenMap)) {
    if (out.includes(tk)) {
      out = out.split(tk).join(val ?? '')
    }
  }
  return out
}

/* =====================================================
   8. RENDER HTML ĐỂ XEM TRƯỚC / IN PDF / XUẤT PNG / XUẤT HTML
===================================================== */
export function renderTemplateToHtml(tpl: PrintTemplateConfig, ctx: QuoteExportContext): string {
  const globalMap = buildGlobalTokenMap(tpl, ctx)
  const vung = tpl.mapping_vung || {
    dong_tieu_de_bang: 11,
    dong_mau_nhom: 12,
    dong_mau_san_pham: 13,
    danh_sach_dong_tong: [14],
    dong_dieu_khoan: 17,
    dong_chu_ky: 18
  }
  const pageCfg = tpl.cau_hinh_trang || ({} as any)
  const fontFamily = pageCfg.font_mac_dinh || 'Calibri, Arial, sans-serif'
  const baseFontSize = pageCfg.co_chu_mac_dinh || 11
  const totalCols = Math.max(tpl.so_cot || 10, 1)
  const totalRows = Math.max(tpl.so_dong || 20, 1)

  const logoWidthPct = Math.max(5, Math.min(100, Number(pageCfg.logo_width_pct) || 35))
  const logoHeight = Math.max(24, Math.min(500, Number(pageCfg.logo_height) || 68))
  const logoUrl = pageCfg.logo_url || pageCfg.logo_trai || '/logo1.png'
  const showLogo = pageCfg.hien_thi_logo !== false
  const showColorLine = pageCfg.hien_thi_line_mau !== false

  const singleLogoHtml = showLogo && logoUrl
    ? `<img src="${logoUrl}" style="width: ${logoWidthPct}%; height: ${logoHeight}px; object-fit: fill; display: block;" onerror="this.style.display='none'" />`
    : ''

  // Check if grid already contains {{LOGO}} or {{LOGO_TRAI}}
  const hasGridLogoToken = Object.values(tpl.grid_cells || {}).some(
    c => c?.value?.includes('{{LOGO}}') || c?.value?.includes('{{LOGO_TRAI}}')
  )

  const groupRowIdx = Number(vung.dong_mau_nhom) || 0
  const itemRowIdx = Number(vung.dong_mau_san_pham) || 13

  // Helper to get horizontal merges on a specific template row
  const getRowMerges = (r: number) => {
    const map = new Map<number, { colspan: number; rowspan: number }>()
    const skipped = new Set<number>()
    ;(tpl.merges || []).forEach(m => {
      if (m.top === r && m.bottom === r && m.right > m.left) {
        map.set(m.left, { colspan: m.right - m.left + 1, rowspan: 1 })
        for (let c = m.left + 1; c <= m.right; c++) skipped.add(c)
      }
    })
    return { map, skipped }
  }

  // Build expanded rows list
  interface ExpandedRow {
    sourceRow: number
    rowType: 'normal' | 'group' | 'item' | 'terms'
    tokenMap: Record<string, string>
    height?: number
  }

  const expandedRows: ExpandedRow[] = []
  for (let r = 1; r <= totalRows; r++) {
    if (r === groupRowIdx && groupRowIdx > 0) {
      continue
    }
    if (r === itemRowIdx) {
      ctx.rows.forEach(qRow => {
        if (qRow.type === 'group') {
          if (groupRowIdx > 0) {
            const { textMap } = buildRowTokenMap(qRow, ctx, globalMap)
            expandedRows.push({
              sourceRow: groupRowIdx,
              rowType: 'group',
              tokenMap: textMap,
              height: tpl.row_heights?.[groupRowIdx]
            })
          }
        } else {
          const { textMap } = buildRowTokenMap(qRow, ctx, globalMap)
          expandedRows.push({
            sourceRow: itemRowIdx,
            rowType: 'item',
            tokenMap: textMap,
            height: tpl.row_heights?.[itemRowIdx]
          })
        }
      })
      continue
    }

    let hasTermsToken = false
    for (let c = 1; c <= totalCols; c++) {
      if (tpl.grid_cells?.[`${r}_${c}`]?.value?.includes('{{DIEU_KHOAN}}')) {
        hasTermsToken = true
        break
      }
    }

    expandedRows.push({
      sourceRow: r,
      rowType: hasTermsToken ? 'terms' : 'normal',
      tokenMap: globalMap,
      height: tpl.row_heights?.[r]
    })
  }

  // Compute total width and column percentages
  let sumColWidths = 0
  for (let c = 1; c <= totalCols; c++) {
    sumColWidths += tpl.col_widths?.[c] || 100
  }

  let colgroupHtml = '<colgroup>'
  for (let c = 1; c <= totalCols; c++) {
    const w = tpl.col_widths?.[c] || 100
    const pct = ((w / sumColWidths) * 100).toFixed(2)
    colgroupHtml += `<col style="width: ${pct}%;" />`
  }
  colgroupHtml += '</colgroup>'

  // Render rows
  let trsHtml = ''
  expandedRows.forEach(er => {
    const r = er.sourceRow
    const { map: mergeMap, skipped } = getRowMerges(r)
    const hStyle = er.height ? `height: ${er.height}px;` : ''

    let tdsHtml = ''
    for (let c = 1; c <= totalCols; c++) {
      if (skipped.has(c)) continue
      const mInfo = mergeMap.get(c)
      const cell = tpl.grid_cells?.[`${r}_${c}`]
      const rawVal = cell?.value || ''
      const st = cell?.style || {}
      const isLogoCellVal = rawVal.includes('{{LOGO}}') || rawVal.includes('{{LOGO_TRAI}}')

      let colspanAttr = mInfo && mInfo.colspan > 1 ? ` colspan="${mInfo.colspan}"` : ''

      // Force full-table colspan on Logo row or Terms row
      if ((isLogoCellVal || (er.rowType === 'terms' && rawVal.includes('{{DIEU_KHOAN}}'))) && c === 1) {
        colspanAttr = ` colspan="${totalCols}"`
        for (let cc = 2; cc <= totalCols; cc++) skipped.add(cc)
      }

      const htmlTokenMap: Record<string, string> = {
        ...er.tokenMap,
        '{{LOGO}}': singleLogoHtml,
        '{{LOGO_TRAI}}': singleLogoHtml,
        '{{LOGO_PHAI}}': ''
      }

      let displayHtml = ''
      if (rawVal.includes('{{DIEU_KHOAN}}')) {
        displayHtml = replaceTokensInText(rawVal, {
          ...htmlTokenMap,
          '{{DIEU_KHOAN}}': ctx.termsHtml || ''
        })
      } else if (rawVal.includes('{{DIEN_GIAI}}')) {
        const dgContent = er.tokenMap['{{DIEN_GIAI}}'] || ''
        const isHtml = /<(br|p|div|ul|ol|li|b|strong|i|em|span)\b/i.test(dgContent)
        const formattedDg = isHtml ? dgContent : dgContent.replace(/\n/g, '<br/>')
        displayHtml = replaceTokensInText(rawVal, {
          ...htmlTokenMap,
          '{{DIEN_GIAI}}': formattedDg
        })
      } else {
        const replaced = replaceTokensInText(rawVal, htmlTokenMap)
        displayHtml = replaced.replace(/\n/g, '<br/>')
      }

      const cssParts: string[] = [
        isLogoCellVal ? 'padding: 0 0 4px 0' : 'padding: 4px 7px',
        'box-sizing: border-box',
        `font-size: ${st.fontSize || baseFontSize}pt`,
        `font-family: ${st.fontFamily || fontFamily}`,
        `text-align: ${st.align || 'left'}`,
        `vertical-align: ${st.valign || 'middle'}`,
        'word-break: break-word'
      ]
      if (st.bold) cssParts.push('font-weight: 700')
      if (st.italic) cssParts.push('font-style: italic')
      if (st.underline) cssParts.push('text-decoration: underline')
      if (st.color) cssParts.push(`color: ${st.color}`)
      if (st.bgColor) cssParts.push(`background-color: ${st.bgColor}`)
      if (st.border) {
        cssParts.push('border: 1px solid #1e293b')
      }
      if (r === 1 && hasGridLogoToken && showColorLine) {
        cssParts.push('border-bottom: 3px solid #ed7d31')
      }

      tdsHtml += `<td${colspanAttr} style="${cssParts.join('; ')}">${displayHtml}</td>`
    }

    trsHtml += `<tr style="${hStyle}">${tdsHtml}</tr>`
  })

  const headerLogosHtml = !hasGridLogoToken && showLogo
    ? `
      <div style="display: flex; justify-content: flex-start; align-items: flex-end; margin-bottom: 6px; width: 100%;">
        ${logoUrl ? `<img src="${logoUrl}" style="width: ${logoWidthPct}%; height: ${logoHeight}px; object-fit: fill; display: block;" onerror="this.style.display='none'" />` : ''}
      </div>
      ${showColorLine ? `
      <div style="display: flex; height: 3px; width: 100%; margin-bottom: 14px;">
        <div style="width: 18%; background: #0070c0;"></div>
        <div style="width: 82%; background: #ed7d31;"></div>
      </div>` : ''}
    `
    : ''

  return `
    <div class="nts-print-sheet" style="background: #ffffff; color: #0f172a; font-family: ${fontFamily}; font-size: ${baseFontSize}pt; padding: ${pageCfg.padding_trang ?? 20}px; width: 100%; box-sizing: border-box;">
      ${headerLogosHtml}
      <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
        ${colgroupHtml}
        <tbody>
          ${trsHtml}
        </tbody>
      </table>
    </div>
  `
}

/* =====================================================
   9. XUẤT FILE EXCEL (.XLSX) TỪ MẪU IN THIẾT LẬP
===================================================== */
function htmlToExcelRichText(htmlOrText: string, baseFont: any): any {
  if (!htmlOrText) return ''
  if (typeof document !== 'undefined' && /<(br|span|b|strong|i|em|u|s|strike|div|p|font|ul|ol|li)\b/i.test(htmlOrText)) {
    const temp = document.createElement('div')
    temp.innerHTML = htmlOrText
    const blockTags = new Set(['p', 'div', 'li', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'tr', 'blockquote'])
    const runs: any[] = []

    const traverse = (node: Node, currentFont: any) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent) {
          runs.push({ text: node.textContent, font: { ...currentFont } })
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        const newFont = { ...currentFont }
        const tag = el.tagName.toLowerCase()
        if (blockTags.has(tag) && runs.length > 0 && !runs[runs.length - 1].text.endsWith('\n')) {
          runs.push({ text: '\n', font: { ...currentFont } })
        }
        if (tag === 'br') {
          runs.push({ text: '\n', font: { ...currentFont } })
          return
        }
        if (tag === 'li') {
          runs.push({ text: '- ', font: { ...currentFont } })
        }
        if (tag === 'b' || tag === 'strong') newFont.bold = true
        if (tag === 'i' || tag === 'em') newFont.italic = true
        if (tag === 'u') newFont.underline = true
        el.childNodes.forEach(c => traverse(c, newFont))
      }
    }

    traverse(temp, { name: baseFont?.name || 'Calibri', size: baseFont?.size || 11 })
    if (runs.length > 0) return { richText: runs }
  }
  return htmlOrText
}

function hexToArgb(hex?: string): string | undefined {
  if (!hex) return undefined
  const clean = hex.replace(/^#/, '').trim()
  if (clean.length === 3) {
    return 'FF' + clean.split('').map(c => c + c).join('').toUpperCase()
  }
  if (clean.length === 6) {
    return 'FF' + clean.toUpperCase()
  }
  return undefined
}

export async function generateExcelBlobFromTemplate(
  tpl: PrintTemplateConfig,
  ctx: QuoteExportContext
): Promise<Blob> {
  const wb = new ExcelJS.Workbook()
  let loadedFromFile = false

  // If template has a source .xlsx file, load it to preserve native Excel images/logos/borders
  const fileUrl = tpl.link_file_goc || (tpl.loai_mau === 'imported_excel' ? '/template_goc.xlsx' : '')
  if (fileUrl) {
    try {
      if (fileUrl.startsWith('http') || fileUrl.startsWith('/')) {
        const resp = await fetch(fileUrl)
        if (resp.ok) {
          const buf = await resp.arrayBuffer()
          await wb.xlsx.load(buf)
          loadedFromFile = true
        }
      }
    } catch (e) {
      console.warn('Không tải được file gốc, chuyển sang dựng từ bảng lưới:', e)
    }
  }

  let ws = wb.worksheets[0]
  if (!ws) {
    ws = wb.addWorksheet(ctx.noiDungPO?.trim() || 'BaoGia')
  } else if (ctx.noiDungPO?.trim()) {
    ws.name = ctx.noiDungPO.trim().slice(0, 31)
  }

  ws.pageSetup.paperSize = tpl.cau_hinh_trang?.kho_giay === 'A3' ? 8 : 9 // 9 = A4
  ws.pageSetup.orientation = tpl.cau_hinh_trang?.huong_giay || 'landscape'
  ws.pageSetup.fitToPage = true
  ws.pageSetup.fitToWidth = 1
  ws.pageSetup.fitToHeight = 0

  const totalCols = Math.max(tpl.so_cot || 10, 1)
  const totalRows = Math.max(tpl.so_dong || 20, 1)
  const globalMap = buildGlobalTokenMap(tpl, ctx)
  const isUSD = ctx.currency === 'USD'
  const numFmt = isUSD ? '#,##0.00' : '#,##0'

  // Set column widths
  for (let c = 1; c <= totalCols; c++) {
    const pxW = tpl.col_widths?.[c] || 100
    ws.getColumn(c).width = Math.max(Math.round(pxW / 7), 8)
  }

  // If built from web grid (or overlays from web grid), first write the template grid into ws if not loadedFromFile,
  // OR overlay user's modified grid_cells onto ws so all tokens added on the web are present!
  if (!loadedFromFile) {
    for (let r = 1; r <= totalRows; r++) {
      if (tpl.row_heights?.[r]) ws.getRow(r).height = tpl.row_heights[r]
      for (let c = 1; c <= totalCols; c++) {
        const gCell = tpl.grid_cells?.[`${r}_${c}`]
        if (!gCell) continue
        const xlCell = ws.getRow(r).getCell(c)
        xlCell.value = gCell.value
        const st = gCell.style || {}
        xlCell.font = {
          name: st.fontFamily || tpl.cau_hinh_trang?.font_mac_dinh || 'Calibri',
          size: st.fontSize || tpl.cau_hinh_trang?.co_chu_mac_dinh || 11,
          bold: !!st.bold,
          italic: !!st.italic,
          underline: !!st.underline,
          color: st.color ? { argb: hexToArgb(st.color) } : undefined
        }
        if (st.bgColor) {
          const argb = hexToArgb(st.bgColor)
          if (argb) {
            xlCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } }
          }
        }
        xlCell.alignment = {
          horizontal: st.align || 'left',
          vertical: st.valign || 'middle',
          wrapText: st.wrapText !== false
        }
        if (st.border) {
          xlCell.border = {
            top: { style: 'thin', color: { argb: 'FF1E293B' } },
            bottom: { style: 'thin', color: { argb: 'FF1E293B' } },
            left: { style: 'thin', color: { argb: 'FF1E293B' } },
            right: { style: 'thin', color: { argb: 'FF1E293B' } }
          }
        }
      }
    }
    ;(tpl.merges || []).forEach(m => {
      try {
        ws.mergeCells(m.top, m.left, m.bottom, m.right)
      } catch {}
    })
  } else {
    // Overlay any cell values edited/tokenized in `tpl.grid_cells` onto the loaded worksheet
    Object.entries(tpl.grid_cells || {}).forEach(([key, gCell]) => {
      const [rStr, cStr] = key.split('_')
      const r = Number(rStr)
      const c = Number(cStr)
      if (r > 0 && c > 0 && gCell && typeof gCell.value === 'string' && gCell.value.includes('{{')) {
        ws.getRow(r).getCell(c).value = gCell.value
      }
    })
  }

  const vung = tpl.mapping_vung || {
    dong_tieu_de_bang: 11,
    dong_mau_nhom: 12,
    dong_mau_san_pham: 13,
    danh_sach_dong_tong: [14],
    dong_dieu_khoan: 17,
    dong_chu_ky: 19
  }

  const headerRowIdx = Number(vung.dong_tieu_de_bang) || 11
  const groupRowIdx = Number(vung.dong_mau_nhom) || 0
  const itemRowIdx = Number(vung.dong_mau_san_pham) || (headerRowIdx + 2)
  const firstTotalRowIdx = vung.danh_sach_dong_tong?.[0] || (itemRowIdx + 1)

  // Snapshot styles & values of groupRowIdx and itemRowIdx before splicing
  const captureRowTemplate = (rIdx: number) => {
    const cells: Record<number, { value: string; style: any }> = {}
    const rObj = ws.getRow(rIdx)
    for (let c = 1; c <= totalCols; c++) {
      const cell = rObj.getCell(c)
      const gridFallback = tpl.grid_cells?.[`${rIdx}_${c}`]?.value || ''
      const val = excelCellToPlainText(cell.value) || gridFallback
      cells[c] = {
        value: val,
        style: JSON.parse(JSON.stringify(cell.style || {}))
      }
    }
    const rowMerges = (tpl.merges || []).filter(m => m.top === rIdx && m.bottom === rIdx && m.right > m.left)
    return {
      height: rObj.height,
      cells,
      merges: rowMerges
    }
  }

  const groupTpl = groupRowIdx > 0 ? captureRowTemplate(groupRowIdx) : null
  const itemTpl = captureRowTemplate(itemRowIdx)

  // Save footer merges below itemRowIdx so we can shift & restore them after splicing
  const existingMerges = Object.values((ws as any)._merges || {}).map((m: any) => m.model || m)
  const footerMerges = existingMerges.filter((m: any) => m.top >= firstTotalRowIdx)

  existingMerges.forEach((m: any) => {
    if (m.top > headerRowIdx) {
      try {
        ws.unMergeCells(m.top, m.left, m.bottom, m.right)
      } catch {}
    }
  })

  // Remove template sample rows between headerRowIdx+1 and firstTotalRowIdx-1
  const removeStart = headerRowIdx + 1
  const removeCount = Math.max(0, firstTotalRowIdx - removeStart)
  if (removeCount > 0) {
    ws.spliceRows(removeStart, removeCount)
  }

  // Insert actual quote rows
  let insertIdx = removeStart
  ctx.rows.forEach(qRow => {
    if (qRow.type === 'group') {
      if (!groupTpl) return
      ws.spliceRows(insertIdx, 0, [])
      const row = ws.getRow(insertIdx)
      row.height = groupTpl.height || 28
      const { textMap } = buildRowTokenMap(qRow, ctx, globalMap)

      for (let c = 1; c <= totalCols; c++) {
        const cell = row.getCell(c)
        cell.style = JSON.parse(JSON.stringify(groupTpl.cells[c]?.style || {}))
        const rawText = groupTpl.cells[c]?.value || ''
        cell.value = replaceTokensInText(rawText, textMap)
      }
      groupTpl.merges.forEach(m => {
        try {
          ws.mergeCells(insertIdx, m.left, insertIdx, m.right)
        } catch {}
      })
      insertIdx++
    } else {
      ws.spliceRows(insertIdx, 0, [])
      const row = ws.getRow(insertIdx)
      const { textMap, rawNumberMap } = buildRowTokenMap(qRow, ctx, globalMap)

      for (let c = 1; c <= totalCols; c++) {
        const cell = row.getCell(c)
        const baseStyle = JSON.parse(JSON.stringify(itemTpl.cells[c]?.style || {}))
        cell.style = baseStyle
        const rawText = (itemTpl.cells[c]?.value || '').trim()

        if (rawNumberMap[rawText] !== undefined) {
          cell.value = rawNumberMap[rawText]
          cell.numFmt = numFmt
          cell.alignment = { ...(cell.alignment || {}), horizontal: 'right', vertical: 'middle' }
        } else if (rawText === '{{DIEN_GIAI}}') {
          cell.value = htmlToExcelRichText(textMap['{{DIEN_GIAI}}'], baseStyle.font)
          cell.alignment = { ...(cell.alignment || {}), horizontal: 'left', vertical: 'top', wrapText: true }
        } else {
          cell.value = replaceTokensInText(rawText, textMap)
          cell.alignment = { ...(cell.alignment || {}), wrapText: true }
        }
      }
      itemTpl.merges.forEach(m => {
        try {
          ws.mergeCells(insertIdx, m.left, insertIdx, m.right)
        } catch {}
      })
      insertIdx++
    }
  })

  const rowDiff = insertIdx - firstTotalRowIdx

  // Restore footer merges shifted by rowDiff
  footerMerges.forEach((m: any) => {
    try {
      ws.mergeCells(m.top + rowDiff, m.left, m.bottom + rowDiff, m.right)
    } catch {}
  })

  // Replace global tokens across all remaining rows (Header, Totals, Amount in words, Terms, Signature)
  const numericGlobalTokens: Record<string, number> = {
    '{{TONG_TRUOC_THUE}}': ctx.totals.truoc,
    '{{TONG_TIEN_VAT}}': ctx.totals.vat,
    '{{TONG_SAU_THUE}}': ctx.totals.sau,
    '{{TONG_MUC_OFF}}': ctx.totals.off
  }

  let termsTargetRow = -1
  for (let r = 1; r <= ws.rowCount; r++) {
    // Skip expanded item/group rows
    if (r >= removeStart && r < insertIdx) continue
    const row = ws.getRow(r)
    for (let c = 1; c <= totalCols; c++) {
      const cell = row.getCell(c)
      const valStr = excelCellToPlainText(cell.value)
      if (!valStr) continue

      const trimmed = valStr.trim()
      if (trimmed.includes('{{DIEU_KHOAN}}')) {
        termsTargetRow = r
      } else if (numericGlobalTokens[trimmed] !== undefined) {
        cell.value = numericGlobalTokens[trimmed]
        cell.numFmt = numFmt
      } else if (valStr.includes('{{')) {
        cell.value = replaceTokensInText(valStr, globalMap)
      }
    }
  }

  // Expand {{DIEU_KHOAN}} into clean multi-row or richText block
  let termsDiff = 0
  if (termsTargetRow !== -1) {
    const tRow = ws.getRow(termsTargetRow)
    if (ctx.termsHtml && ctx.termsHtml.trim()) {
      const font = ctx.customDefaultFont || {
        name: tpl.cau_hinh_trang?.font_mac_dinh || 'Calibri',
        size: tpl.cau_hinh_trang?.co_chu_mac_dinh || 11
      }
      tRow.getCell(1).value = htmlToExcelRichText(ctx.termsHtml, font)
      tRow.getCell(1).alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
      // Estimate height from line count
      const plainLines = ctx.termsHtml.replace(/<[^>]+>/g, '\n').split('\n').filter(l => l.trim()).length
      tRow.height = Math.max(plainLines * 20, 45)
    } else {
      tRow.getCell(1).value = ''
    }
  }

  // Shift embedded images below header
  const totalShift = rowDiff + termsDiff
  if (totalShift !== 0 && typeof ws.getImages === 'function') {
    ws.getImages().forEach((img: any) => {
      if (img.range?.tl && img.range.tl.row > headerRowIdx) {
        img.range.tl.row += totalShift
        img.range.br.row += totalShift
      }
    })
  }

  const outBuffer = await wb.xlsx.writeBuffer()
  return new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

/* =====================================================
   10. XUẤT PDF / IN TRỰC TIẾP, ẢNH PNG, VÀ FILE HTML
===================================================== */
export function exportPdfOrPrintFromTemplate(
  tpl: PrintTemplateConfig,
  ctx: QuoteExportContext,
  title = 'Bang_Bao_Gia'
): void {
  const htmlBody = renderTemplateToHtml(tpl, ctx)
  const pageCfg = tpl.cau_hinh_trang || ({} as any)
  const size = `${pageCfg.kho_giay || 'A4'} ${pageCfg.huong_giay || 'landscape'}`

  const printWin = window.open('', '_blank', 'width=1150,height=850')
  if (!printWin) {
    alert('Vui lòng cho phép trình duyệt mở cửa sổ bật lên (Pop-up) để in / lưu PDF.')
    return
  }

  printWin.document.open()
  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        @page {
          size: ${size};
          margin: 10mm;
        }
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
      </style>
    </head>
    <body>
      ${htmlBody}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.focus();
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `)
  printWin.document.close()
}

export async function exportPngFromTemplate(
  tpl: PrintTemplateConfig,
  ctx: QuoteExportContext,
  fileName = 'BaoGia_NTS'
): Promise<void> {
  const htmlBody = renderTemplateToHtml(tpl, ctx)
  const wrapper = document.createElement('div')
  const isLandscape = tpl.cau_hinh_trang?.huong_giay !== 'portrait'
  wrapper.style.cssText = `
    position: fixed;
    top: -10000px;
    left: -10000px;
    width: ${isLandscape ? '1120px' : '820px'};
    background: #ffffff;
    z-index: -9999;
  `
  wrapper.innerHTML = htmlBody
  document.body.appendChild(wrapper)

  try {
    await new Promise(r => setTimeout(r, 200))
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    })
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${fileName}.png`
    link.href = dataUrl
    link.click()
  } finally {
    document.body.removeChild(wrapper)
  }
}

export function exportHtmlFileFromTemplate(
  tpl: PrintTemplateConfig,
  ctx: QuoteExportContext,
  fileName = 'BaoGia_NTS'
): void {
  const htmlBody = renderTemplateToHtml(tpl, ctx)
  const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fileName}</title>
  <style>
    body {
      margin: 0;
      padding: 24px;
      background: #f1f5f9;
      display: flex;
      justify-content: center;
    }
    .page-container {
      max-width: ${tpl.cau_hinh_trang?.huong_giay === 'portrait' ? '840px' : '1160px'};
      width: 100%;
      background: #ffffff;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12);
      border-radius: 8px;
      overflow: hidden;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .page-container { box-shadow: none; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="page-container">
    ${htmlBody}
  </div>
</body>
</html>`

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileName}.html`
  a.click()
  URL.revokeObjectURL(url)
}
