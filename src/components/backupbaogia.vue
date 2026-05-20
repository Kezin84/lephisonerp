<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ExcelEditor from './ExcelEditor.vue'

const route = useRoute()

/* ======================
   CONFIG
====================== */
const BASE_URL =
  'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

/* ======================
   TYPES
====================== */
type HangHoa = {
  // ... giữ nguyên 20 field cũ ...
  Ma_hang: string
  Ten_hang: string
  Main_img: string
  Ma_nha_cung_cap: string
  Ten_nha_cung_cap: string
  Mo_ta_chung: string
  Mo_ta_chi_tiet: string
  Features: string
  Danh_muc: string
  License_duration: string
  DVT: string
  Gia_tieu_chuan: number
  Don_gia: number
  Trang_thai: string
  Don_vi_tien_te: string
  Ti_gia: number
  Thue_VAT: number
  Ma_hang_lien_ket: string
  Ten_hang_lien_ket: string
  Ghi_chu: string
  // ✅ 3 CỘT MỚI
  gia_hardware: number
  gia_nhap: number
  muc_phan_tram_off: number
  // ✅ GIÁ GỐC (snapshot)
  _gia_hardware_goc?: number
  _gia_nhap_goc?: number
  _muc_phan_tram_off_goc?: number
  _Don_gia_goc?: number
  _Gia_tieu_chuan_goc?: number
  _Ti_gia_goc?: number
  _Thue_VAT_goc?: number
}

type KhachHang = {
  Ma_khach_hang: string
  Ten_khach_hang: string
  Email_ca_nhan: string
  So_dien_thoai_ca_nhan: string
  Ma_cong_ty: string
  Ten_cong_ty: string
  So_dien_thoai_cong_ty: string
  So_fax_cong_ty: string
  Dia_chi_cong_ty: string
  Email_cong_ty: string
  Website_cong_ty: string
  Trang_thai: string
  Cong_no_chua_thanh_toan: string
  Ghi_chu: string
}

/* ======================
   1. KHÁCH HÀNG
====================== */
const khach = ref<KhachHang>({
  Ma_khach_hang: '',
  Ten_khach_hang: '',
  Email_ca_nhan: '',
  So_dien_thoai_ca_nhan: '',
  Ma_cong_ty: '',
  Ten_cong_ty: '',
  So_dien_thoai_cong_ty: '',
  So_fax_cong_ty: '',
  Dia_chi_cong_ty: '',
  Email_cong_ty: '',
  Website_cong_ty: '',
  Trang_thai: '',
  Cong_no_chua_thanh_toan: '',
  Ghi_chu: ''
})

const customers = ref<KhachHang[]>([])
const maKHInput = ref('')
const tenKHInput = ref('')

/* ======================
   5. HỢP ĐỒNG
====================== */
const maHopDong = ref(`HD${new Date().toISOString().replace(/\D/g, '')}`)
const soHopDong = ref('')
const tongGiaThucTe = computed(() => round2(totalsContract.value.truoc))  // ✅ MỚI
const thueChenhLechPct = ref(0)
const chietKhauTruocThuePct = ref(0)
const ghiChuHopDong = ref('')
const loadedMaHopDong = ref<string | null>(null)
/* ======================
   MODAL CHỌN SỐ HĐ SO SÁNH
====================== */
const showPickCompareModal = ref(false)
const pickCompareSo = ref('')

/* ======================
   HÀNG HÓA
====================== */
const products = ref<HangHoa[]>([])
const keyword = ref('')
const supplierFilter = ref('ALL')
const selectedItems = ref<(HangHoa & { So_luong: number })[]>([])

/* qty realtime trong card */
const qtyMap = reactive<Record<string, number>>({})

/* ======================
   MODAL - NHẬP TAY / CHI TIẾT CARD / XEM BÁO GIÁ
====================== */
const showManualModal = ref(false)
const showCardModal = ref(false)
const showPreviewRawModal = ref(false)
const showSaveModal = ref(false)
const showExportExcelModal = ref(false)

const itemForm = ref<HangHoa & { So_luong: number }>({
  Ma_hang: '',
  Ten_hang: '',
  Main_img: '',
  Ma_nha_cung_cap: '',
  Ten_nha_cung_cap: '',
  Mo_ta_chung: '',
  Mo_ta_chi_tiet: '',
  Features: '',
  Danh_muc: '',
  License_duration: '',
  DVT: '',
  Gia_tieu_chuan: 0,
  Don_gia: 0,
  Trang_thai: 'Hiển thị',
  Don_vi_tien_te: 'VND',
  Ti_gia: 1,
  Thue_VAT: 0,
  Ma_hang_lien_ket: '',
  Ten_hang_lien_ket: '',
  Ghi_chu: '',
    gia_hardware: 0,
  gia_nhap: 0,
  muc_phan_tram_off: 0,
  So_luong: 1
})

const cardEdit = ref<HangHoa & { So_luong: number } | null>(null)

/* ======================
   SIDEBAR TOGGLE
====================== */
const showProductSidebar = ref(true)
const showContractSidebar = ref(true)

/* ======================
   HELPERS
====================== */
const termsRaw = ref<any[][]>([])
const contractTerms = computed(() => {
  return termsRaw.value.map(r => ({
    id: String(r[0] || ''),
    mau: String(r[1] || ''),
    maKH: String(r[2] || ''),
    tenKH: String(r[3] || ''),
    maCT: String(r[4] || ''),
    tenCT: String(r[5] || ''),
    noiDung: String(r[6] || '')
  })).filter(i => i.id)
})
const selectedTermId = ref('')
const editableTermContent = ref('')

watch(selectedTermId, (newId) => {
  if (newId) {
    const term = contractTerms.value.find(t => t.id === newId)
    editableTermContent.value = term ? term.noiDung : ''
  } else {
    editableTermContent.value = ''
  }
})

/* ======================
   ✅ LOAD HÓA ĐƠN / HỢP ĐỒNG
====================== */
const showLoadInvoiceModal = ref(false)
/* ======================
   <i class="lucide-search"></i> SO SÁNH HỢP ĐỒNG
====================== */
const showCompareModal = ref(false)
const compareSoHopDong = ref('')

const compareDetails = ref<any[][]>([]) // toàn bộ hop_dong_chi_tiet của SỐ HĐ

const loadMode = ref<'SO' | 'MA'>('SO') // SO = số hợp đồng, MA = mã hợp đồng
const loadKey = ref('')
const loadingInvoice = ref(false)
const loadMsg = ref('')

// list hợp đồng để chọn
const contractsRaw = ref<any[][]>([])

/* datalist options */
const contractOptionsBySo = computed(() => {
  const set = new Set<string>()
  contractsRaw.value.forEach(r => {
    const so = String(r?.[1] ?? '').trim()
    if (so) set.add(so)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})
const contractOptionsByMa = computed(() => {
  const set = new Set<string>()
  contractsRaw.value.forEach(r => {
    const ma = String(r?.[0] ?? '').trim()
    if (ma) set.add(ma)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

/* map 1 row hop_dong_chi_tiet -> item selectedItems */
function mapHopDongChiTietRowToItem(row: any[]) {
  // tolerate length
  // buildHopDongChiTietRows() của mày đang trả:
  // [0]ma_hop_dong [1]so_hop_dong [2]Ma_hang [3]Ten_hang [4]Main_img
  // [5]Ma_ncc [6]Ten_ncc [7]Mo_ta_chung [8]Mo_ta_chi_tiet [9]Features [10]Danh_muc
  // [11]License_duration [12]DVT [13]Gia_tieu_chuan [14]Don_gia [15]Don_vi_tien_te
  // [16]Ti_gia [17]Thue_VAT [18]So_luong [19]Ghi_chu
  const maHang = String(row?.[2] ?? '')
  const baseProduct = products.value.find(p => p.Ma_hang === maHang)

  const item: HangHoa & { So_luong: number } = {
    Ma_hang: maHang,
    Ten_hang: String(row?.[3] ?? ''),
    Main_img: String(row?.[4] ?? ''),
    Ma_nha_cung_cap: String(row?.[5] ?? ''),
    Ten_nha_cung_cap: String(row?.[6] ?? ''),
    Mo_ta_chung: String(row?.[7] ?? ''),
    Mo_ta_chi_tiet: String(row?.[8] ?? ''),
    Features: String(row?.[9] ?? ''),
    Danh_muc: String(row?.[10] ?? ''),
    License_duration: String(row?.[11] ?? ''),
    DVT: String(row?.[12] ?? ''),
    Gia_tieu_chuan: toNum(row?.[13], 0),
    Don_gia: toNum(row?.[14], 0),
    Trang_thai: 'Hiển thị',
    Don_vi_tien_te: String(row?.[15] ?? 'VND'),
    Ti_gia: toNum(row?.[16], 1),
    Thue_VAT: toNum(row?.[17], 0),
    Ma_hang_lien_ket: '',
    Ten_hang_lien_ket: '',
    Ghi_chu: String(row?.[19] ?? ''),
    So_luong: Math.max(1, toNum(row?.[18], 1)),
    // ✅ 3 CỘT MỚI
    gia_hardware: toNum(row?.[20], 0),
    gia_nhap: toNum(row?.[21], 0),
    muc_phan_tram_off: toNum(row?.[22], 0),
    // ✅ snapshot giá gốc từ products catalog để giữ chênh lệch giá
    _gia_hardware_goc: baseProduct ? toNum(baseProduct.gia_hardware, 0) : toNum(row?.[20], 0),
    _gia_nhap_goc: baseProduct ? toNum(baseProduct.gia_nhap, 0) : toNum(row?.[21], 0),
    _muc_phan_tram_off_goc: baseProduct ? toNum(baseProduct.muc_phan_tram_off, 0) : toNum(row?.[22], 0),
    _Don_gia_goc: baseProduct ? toNum(baseProduct.Don_gia, 0) : toNum(row?.[14], 0),
    _Gia_tieu_chuan_goc: baseProduct ? toNum(baseProduct.Gia_tieu_chuan, 0) : toNum(row?.[13], 0),
    _Ti_gia_goc: baseProduct ? toNum(baseProduct.Ti_gia, 1) : toNum(row?.[16], 1),
    _Thue_VAT_goc: baseProduct ? toNum(baseProduct.Thue_VAT, 0) : toNum(row?.[17], 0)
  }

  return item
}

/* tìm row tổng quát theo số/mã */
function findContractRow() {
  const key = loadKey.value.trim()
  if (!key) return null
  if (loadMode.value === 'SO') {
    return contractsRaw.value.find(r => String(r?.[1] ?? '').trim() === key) || null
  }
  return contractsRaw.value.find(r => String(r?.[0] ?? '').trim() === key) || null
}

async function loadInvoiceToFE() {
  loadMsg.value = ''
  const row = findContractRow()
  if (!row) {
    loadMsg.value = '❌ Không tìm thấy hóa đơn/hợp đồng theo mã/số đã chọn.'
    return
  }

  try {
    loadingInvoice.value = true

const ma = String(row?.[0] ?? '').trim()
const so = String(row?.[1] ?? '').trim()

loadedMaHopDong.value = ma              // ✅ GHI NHỚ HỢP ĐỒNG CŨ
soHopDong.value = so || soHopDong.value // số hợp đồng GIỮ NGUYÊN

// ⚠️ KHÔNG dùng lại mã cũ
maHopDong.value = `HD${Date.now()}`


    // ghi chú (tolerant)
    ghiChuHopDong.value = String(row?.[16] ?? '').trim()
    
    chietKhauTruocThuePct.value = toNum(row?.[26], 0)
    thueChenhLechPct.value = toNum(row?.[28], 0)

    // ====== load customer ======
    const maKH = String(row?.[2] ?? '').trim()
    if (maKH) {
      fillCustomerByMa(maKH) // sẽ set khach + maKHInput + tenKHInput
    } else {
      // fallback: set tên nếu có
      const tenKH = String(row?.[3] ?? '').trim()
      if (tenKH) fillCustomerByTen(tenKH)
    }

    // ====== load chi tiết ======
    const ts = Date.now()
    const detailRows = await fetch(`${BASE_URL}?action=hop_dong_chi_tiet&t=${ts}`).then(r => r.json())
    const all = Array.isArray(detailRows) ? detailRows : []
    const mine = all.filter((r: any[]) => String(r?.[0] ?? '').trim() === ma)

    // đổ vào selectedItems
    selectedItems.value = mine.map(mapHopDongChiTietRowToItem)

    // sync qtyMap (để card qty đúng nếu add tiếp)
    selectedItems.value.forEach(it => {
      if (it.Ma_hang) qtyMap[it.Ma_hang] = Math.max(1, toNum(it.So_luong, 1))
    })

    showLoadInvoiceModal.value = false
    loadKey.value = ''
    loadMsg.value = '✅ Đã load hóa đơn/hợp đồng lên FE.'
  } catch (e: any) {
    loadMsg.value = '❌ Lỗi load: ' + String(e?.message || e)
  } finally {
    loadingInvoice.value = false
  }
}

function unitPrice(i: any) {
  const gia = donGiaSauOff(i)
  const tg = toNum(i.Ti_gia, 1)
  return round2(gia * tg)
}

function standardPrice(i: any) {
  const gt = toNum(i.Gia_tieu_chuan, 0)
  const tg = toNum(i.Ti_gia, 1)
  return round2(gt * tg)
}

const quoteCurrency = computed(() => {
  return 'VND'
})
function onEditDonGiaVND(item: any, e: Event) {
  const vnd = Number((e.target as HTMLInputElement).value || 0)
  const tg = toNum(item.Ti_gia, 1)
  item.Don_gia = tg > 0 ? vnd / tg : vnd
}

function toNum(v: any, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(n))
}

function formatUSD(n: number) {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(round2(n))
}

function formatCurrency(n: number, cur: string) {
  if ((cur || '').trim().toUpperCase() === 'VND') return formatVND(n)
  return formatUSD(n)
}

function withOriginalPriceFields(item: HangHoa & { So_luong: number }) {
  const it = item as any
  if (it._Don_gia_goc == null) it._Don_gia_goc = toNum(it.Don_gia, 0)
  if (it._Gia_tieu_chuan_goc == null) it._Gia_tieu_chuan_goc = toNum(it.Gia_tieu_chuan, 0)
  if (it._Ti_gia_goc == null) it._Ti_gia_goc = toNum(it.Ti_gia, 1)
  if (it._Thue_VAT_goc == null) it._Thue_VAT_goc = toNum(it.Thue_VAT, 0)
  if (it._gia_hardware_goc == null) it._gia_hardware_goc = toNum(it.gia_hardware, 0)
  if (it._gia_nhap_goc == null) it._gia_nhap_goc = toNum(it.gia_nhap, 0)
  if (it._muc_phan_tram_off_goc == null) it._muc_phan_tram_off_goc = toNum(it.muc_phan_tram_off, 0)
  return item
}

function cloneHang(h: HangHoa, qty = 1): HangHoa & { So_luong: number } {
  const item = {
    ...JSON.parse(JSON.stringify(h)),
    So_luong: Math.max(1, toNum(qty, 1))
  }
  return withOriginalPriceFields(item)
}

function getGocNumber(i: any, key: string, fallback = 0) {
  const v = i?.[key]
  return Number.isFinite(Number(v)) ? Number(v) : fallback
}

function donGiaLPGoc(i: any) {
  const hardware = getGocNumber(i, '_gia_hardware_goc', toNum(i.gia_hardware, 0))
  const nhap = getGocNumber(i, '_gia_nhap_goc', toNum(i.gia_nhap, 0))
  const donGiaGoc = getGocNumber(i, '_Don_gia_goc', toNum(i.Don_gia, 0))
  return round2(hardware + nhap + donGiaGoc)
}

function donGiaSauOffGoc(i: any) {
  const lp = donGiaLPGoc(i)
  const pctOff = getGocNumber(i, '_muc_phan_tram_off_goc', toNum(i.muc_phan_tram_off, 0))
  return round2(lp * (1 - pctOff / 100))
}

function vatGoc(i: any) {
  return getGocNumber(i, '_Thue_VAT_goc', toNum(i.Thue_VAT, 0))
}

function unitPriceRaw(i: any) {
  const tg = getGocNumber(i, '_Ti_gia_goc', toNum(i.Ti_gia, 1))
  return round2(donGiaSauOffGoc(i) * tg)
}

function standardPriceRaw(i: any) {
  const tg = getGocNumber(i, '_Ti_gia_goc', toNum(i.Ti_gia, 1))
  return round2(getGocNumber(i, '_Gia_tieu_chuan_goc', toNum(i.Gia_tieu_chuan, 0)) * tg)
}

function lineTruocThueRaw(i: any) {
  return round2(unitPriceRaw(i) * toNum(i.So_luong, 1))
}

function lineVATRaw(i: any) {
  const vat = getGocNumber(i, '_Thue_VAT_goc', toNum(i.Thue_VAT, 0))
  return round2((lineTruocThueRaw(i) * vat) / 100)
}

function lineSauThueRaw(i: any) {
  return round2(lineTruocThueRaw(i) + lineVATRaw(i))
}

function lineLoiNhuanRaw(i: any) {
  return round2((unitPriceRaw(i) - standardPriceRaw(i)) * toNum(i.So_luong, 1))
}

const totalsContract = computed(() => {
  let truoc = 0, vat = 0, loi = 0
  selectedItems.value.forEach(i => {
    truoc += lineTruocThueRaw(i)
    vat += lineVATRaw(i)
    loi += lineLoiNhuanRaw(i)
  })
  return {
    truoc: round2(truoc),
    vat: round2(vat),
    sau: round2(truoc + vat),
    loi: round2(loi)
  }
})


/* ======================
   SAVE CONTRACT (POST no-cors)
====================== */
const saving = ref(false)
const saveMsg = ref('')

async function postApi(action: string, payload: any) {
  const body = new URLSearchParams()
  body.set('action', action)
  body.set('payload', JSON.stringify(payload || {}))

  const res = await fetch(BASE_URL, {
    method: 'POST',
    body
  })
  const data = await res.json()
  if (!data.ok) throw new Error(data.error || 'Lỗi server')
  return data
}

/* ======================
   BUILD ROWS (đúng thứ tự sheet)
====================== */

/** hop_dong_tong_quat (17 cột)
 *  0 ma_hop_dong
 *  1 so_hop_dong
 *  2 ma_khach_hang
 *  3 ten_khach_hang
 *  4 ngay_tao_hop_dong
 *  5 Tong_tien_truoc_thueVAT
 *  6 Tong_thueVAT
 *  7 Tong_tien_sau_thueVAT
 *  8 Tong_giam_gia
 *  9 Tong_cong
 * 10 Tong_thanh_toan
 * 11 Tong_hoa_hong_khach_hang
 * 12 Tong_hoa_hong_ca_nhan
 * 13 Cong_no_cu
 * 14 Trang_thai_thanh_toan
 * 15 Trang_thai_hop_dong
 * 16 Ghi_chu
 */
function formatDateTimeVN(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const hh = pad(d.getHours())
  const mm = pad(d.getMinutes())
  const ss = pad(d.getSeconds())
  const DD = pad(d.getDate())
  const MM = pad(d.getMonth() + 1)
  const YYYY = d.getFullYear()
  return `${hh}:${mm}:${ss} ${DD}/${MM}/${YYYY}`
}

function formatCreatedTimeVN(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const hh = pad(d.getHours())
  const mm = pad(d.getMinutes())
  const DD = pad(d.getDate())
  const MM = pad(d.getMonth() + 1)
  const YYYY = d.getFullYear()
  return `${hh}:${mm}, ${DD}/${MM}/${YYYY}`
}

function buildHopDongTongQuatRow(
  statusHopDong: 'Tạm' | 'Chính thức',
  maHopDongCu: string | null
) {
  const ngay = formatDateTimeVN(new Date())

  // ✅ totals: theo VND
  const t = totals.value

  const truoc = round2(t.truoc)
  const vat   = round2(t.vat)
  const sau   = round2(t.sau)

  const tongGiamGia = 0
  const tongCong = sau
  const tongThanhToan = 0
  const hhKhach = 0
  const hhCaNhan = 0
  const congNoCu = toNum(khach.value.Cong_no_chua_thanh_toan, 0)
  const trangThaiThanhToan = 'Chưa thanh toán đủ'
  const ghiChu = (ghiChuHopDong.value || '').trim()

  // ✅ luôn lưu VND + tiGia = 1
  const donVi = 'VND'
  const tiGia = 1

  return [
    maHopDong.value,
    soHopDong.value,
    (khach.value.Ma_khach_hang || '').trim(),
    (khach.value.Ten_khach_hang || '').trim(),
    ngay,
    truoc,
    vat,
    sau,
    tongGiamGia,
    tongCong,
    tongThanhToan,
    hhKhach,
    hhCaNhan,
    congNoCu,
    trangThaiThanhToan,
    statusHopDong,
    ghiChu,
    donVi,
    tiGia,
      maHopDongCu || ''  ,   // ✅ CỘT MỚI
      toNum(tongGiaThucTe.value, 0),  // ✅ CỘT MỚI (index 20)
      formatCreatedTimeVN(new Date()), // ✅ created_time (index 21)
      '',                              // ✅ So_PO (index 22)
      '',                              // ✅ Ten_PO (index 23)
      '',                              // ✅ content_of_contract_po (index 24)
      0,                               // 25 chiet_khau_tong_truoc_thue
      0,                               // 26 phan_tram_chiet_khau_tong_truoc_thue
      0,                               // 27 thue_chenh_lech_gia
      0,                               // 28 phan_tram_thue_chenh_lech_gia
      0,                               // 29 chenh_lech_gia
      0,                               // 30 con_lai
      0                                // 31 tong_chiet_khau
  ]
}


/** hop_dong_chi_tiet (18 cột)
 *  ma_hop_dong, so_hop_dong,
 *  Ma_hang, Ten_hang, Main_img,
 *  Ma_nha_cung_cap, Ten_nha_cung_cap,
 *  Mo_ta_chung, Mo_ta_chi_tiet, Features, Danh_muc,
 *  License_duration, DVT, Gia_tieu_chuan, Don_gia,
 *  Don_vi_tien_te, Ti_gia, Thue_VAT
 *
 *  (sheet này CHƯA có So_luong theo schema mày gửi)
 *  => nếu muốn lưu số lượng thì phải thêm cột So_luong trong sheet + update BE.
 */
function buildHopDongChiTietRows() {
  return selectedItems.value.map(it => {
    const tg = toNum(it.Ti_gia, 1)

    const donGiaToSave = toNum(it.Don_gia, 0) * tg
    const giaTCToSave  = toNum(it.Gia_tieu_chuan, 0) * tg

    return [
      maHopDong.value,
      soHopDong.value,
      it.Ma_hang || '',
      it.Ten_hang || '',
      it.Main_img || '',
      it.Ma_nha_cung_cap || '',
      it.Ten_nha_cung_cap || '',
      it.Mo_ta_chung || '',
      it.Mo_ta_chi_tiet || '',
      it.Features || '',
      it.Danh_muc || '',
      it.License_duration || '',
      it.DVT || '',
      giaTCToSave,                 // ✅ Gia_tieu_chuan
      donGiaToSave,                // ✅ Don_gia
      'VND',
      1, // ✅ lưu VND thì ti_gia=1
      toNum(it.Thue_VAT, 0),
      Math.max(1, toNum((it as any).So_luong, 1)),
      '',
            // ✅ 3 CỘT MỚI
      toNum(it.gia_hardware, 0),
      toNum(it.gia_nhap, 0),
      toNum(it.muc_phan_tram_off, 0)
    ]
  })
}


function canSaveContractBasic() {
  if (!selectedItems.value.length) return 'Chưa có hàng trong báo giá.'
  if (!khach.value.Ma_khach_hang?.trim()) return 'Chưa chọn Mã khách hàng.'
  if (!khach.value.Ten_khach_hang?.trim()) return 'Chưa có Tên khách hàng.'
  return ''
}
async function saveContractTemp() {
  saveMsg.value = ''
  const err = canSaveContractBasic()
  if (err) {
    saveMsg.value = err
    return
  }

  try {
    saving.value = true
const payload = {
  hd_tong_quat_row: buildHopDongTongQuatRow(
    'Tạm',
    loadedMaHopDong.value   // ✅ gắn mã cũ
  ),
  hd_chi_tiet_rows: buildHopDongChiTietRows()
}


    await postApi('save_contract_temp', payload)
    saveMsg.value = '✅ Đã lưu Hợp đồng TẠM thành công!'

    // reset nhanh nếu muốn:
    // selectedItems.value = []
  } catch (e: any) {
    saveMsg.value = '❌ Lỗi gửi lưu tạm: ' + String(e?.message || e)
  } finally {
    saving.value = false
  }
}

async function saveContractOfficial() {
  saveMsg.value = ''
  const err = canSaveContractBasic()
  if (err) {
    saveMsg.value = err
    return
  }

  try {
    saving.value = true
    const tongSauThue = round2(totals.value.sau)


const payload = {
  hd_tong_quat_row: buildHopDongTongQuatRow(
    'Chính thức',
    loadedMaHopDong.value   // ✅ gắn mã cũ
  ),
  hd_chi_tiet_rows: buildHopDongChiTietRows(),
  ma_khach_hang: (khach.value.Ma_khach_hang || '').trim(),
  tong_sau_thue: tongSauThue
}

    await postApi('save_contract_official', payload)
    saveMsg.value = '✅ Đã lưu Hợp đồng CHÍNH THỨC thành công!'
    loadedMaHopDong.value = null
  } catch (e: any) {
    saveMsg.value = '❌ Lỗi gửi lưu chính thức: ' + String(e?.message || e)
  } finally {
    saving.value = false
  }
}

/* BE trả về mảng -> map về object theo index (tolerant) */
function mapHangHoaRow(row: any[]): HangHoa {
  // Nếu sheet có Mo_ta_chi_tiet (>=20 cột): dùng mapping extended
  if (row.length >= 20) {
    return {
      Ma_hang: String(row[0] ?? ''),
      Ten_hang: String(row[1] ?? ''),
      Main_img: String(row[2] ?? ''),
      Ma_nha_cung_cap: String(row[3] ?? ''),
      Ten_nha_cung_cap: String(row[4] ?? ''),
      Mo_ta_chung: String(row[5] ?? ''),
      Mo_ta_chi_tiet: String(row[6] ?? ''),
      Features: String(row[7] ?? ''),
      Danh_muc: String(row[8] ?? ''),
      License_duration: String(row[9] ?? ''),
      DVT: String(row[10] ?? ''),
      Gia_tieu_chuan: toNum(row[11], 0),
      Don_gia: toNum(row[12], 0),
      Trang_thai: String(row[13] ?? ''),
      Don_vi_tien_te: String(row[14] ?? 'VND'),
      Ti_gia: toNum(row[15], 1),
      Thue_VAT: toNum(row[16], 0),
      Ma_hang_lien_ket: String(row[17] ?? ''),
      Ten_hang_lien_ket: String(row[18] ?? ''),
      Ghi_chu: String(row[19] ?? ''),
      gia_hardware: toNum(row[20], 0),
      gia_nhap: toNum(row[21], 0),
      muc_phan_tram_off: toNum(row[22], 0),
      Type: String(row[23] ?? '').trim()
    }
  }

  // Nếu sheet cũ (>=19 cột): không có Mo_ta_chi_tiet
  return {
    Ma_hang: String(row[0] ?? ''),
    Ten_hang: String(row[1] ?? ''),
    Main_img: String(row[2] ?? ''),
    Ma_nha_cung_cap: String(row[3] ?? ''),
    Ten_nha_cung_cap: String(row[4] ?? ''),
    Mo_ta_chung: String(row[5] ?? ''),
    Mo_ta_chi_tiet: '',
    Features: String(row[6] ?? ''),
    Danh_muc: String(row[7] ?? ''),
    License_duration: String(row[8] ?? ''),
    DVT: String(row[9] ?? ''),
    Gia_tieu_chuan: toNum(row[10], 0),
    Don_gia: toNum(row[11], 0),
    Trang_thai: String(row[12] ?? ''),
    Don_vi_tien_te: String(row[13] ?? 'VND'),
    Ti_gia: toNum(row[14], 1),
    Thue_VAT: toNum(row[15], 0),
    Ma_hang_lien_ket: String(row[16] ?? ''),
    Ten_hang_lien_ket: String(row[17] ?? ''),
      Ghi_chu: String(row[18] ?? ''),
    // ✅ THÊM 4 field (default 0 vì sheet cũ không có)
    gia_hardware: 0,
    gia_nhap: 0,
    muc_phan_tram_off: 0,
    Type: ''
  }
}
const IDX_TIME = 4

const contractsSortedDesc = computed(() => {
  const uniqueMap = new Map()
  contractsRaw.value.forEach(r => {
    const ma = String(r?.[0] ?? '').trim()
    if (ma && !uniqueMap.has(ma)) {
      uniqueMap.set(ma, r)
    }
  })
  return Array.from(uniqueMap.values()).sort((a, b) => {
    const ta = String(a?.[IDX_TIME] ?? '')
    const tb = String(b?.[IDX_TIME] ?? '')
    return tb.localeCompare(ta)
  })
})

const loadCustomerFilter = ref('')
const filteredContractsForLoad = computed(() => {
  let list = contractsSortedDesc.value
  if (loadCustomerFilter.value) {
    const kw = loadCustomerFilter.value.trim().toLowerCase()
    const isExact = customers.value.some(c => 
      c.Ma_khach_hang.trim().toLowerCase() === kw || 
      c.Ten_khach_hang.trim().toLowerCase() === kw
    )
    if (isExact) {
      list = list.filter(r => 
        String(r?.[3] ?? '').trim().toLowerCase() === kw || 
        String(r?.[2] ?? '').trim().toLowerCase() === kw
      )
    } else {
      list = list.filter(r => 
        String(r?.[3] ?? '').toLowerCase().includes(kw) || 
        String(r?.[2] ?? '').toLowerCase().includes(kw)
      )
    }
  }
  return list
})
watch(loadCustomerFilter, () => {
  loadKey.value = ''
})



function mapKhachRow(row: any[]): KhachHang {
  // khach_hang chuẩn A->P (16 cột)
  return {
    Ma_khach_hang: String(row[0] ?? ''),
    Ten_khach_hang: String(row[1] ?? ''),
    Email_ca_nhan: String(row[2] ?? ''),
    So_dien_thoai_ca_nhan: String(row[3] ?? ''),
    Ma_cong_ty: String(row[4] ?? ''),
    Ten_cong_ty: String(row[5] ?? ''),
    So_dien_thoai_cong_ty: String(row[6] ?? ''),
    So_fax_cong_ty: String(row[7] ?? ''),
    Dia_chi_cong_ty: String(row[8] ?? ''),
    Email_cong_ty: String(row[9] ?? ''),
    Website_cong_ty: String(row[10] ?? ''),
    Trang_thai: String(row[14] ?? ''),
    Cong_no_chua_thanh_toan: String(row[13] ?? ''),
    Ghi_chu: String(row[15] ?? '')
  }
}

/* ======================
   INIT
====================== */
onMounted(async () => {
  // hop_dong_tong_quat chỉ dùng count -> STT
const hdRows = await fetch(`${BASE_URL}?action=hop_dong_tong_quat`).then(r => r.json())
contractsRaw.value = Array.isArray(hdRows) ? hdRows : []
const hdLen = contractsRaw.value.length
soHopDong.value = `HĐ${hdLen + 1}`


  // hang_hoa
  const ts = Date.now()
  const hhRows = await fetch(`${BASE_URL}?action=hang_hoa&t=${ts}`).then(r => r.json())
  const mappedProducts = (Array.isArray(hhRows) ? hhRows : []).map(mapHangHoaRow)
  products.value = mappedProducts

  // init qtyMap
  mappedProducts.forEach(p => {
    if (!qtyMap[p.Ma_hang]) qtyMap[p.Ma_hang] = 1
  })

  // khach_hang
  const khRows = await fetch(`${BASE_URL}?action=khach_hang`).then(r => r.json())
  customers.value = (Array.isArray(khRows) ? khRows : []).map(mapKhachRow)

  // dieu_khoan
  const dkRows = await fetch(`${BASE_URL}?action=dieu_khoan`).then(r => r.json())
  termsRaw.value = Array.isArray(dkRows) ? dkRows : []

  if (route.query.ma) {
    loadMode.value = 'MA'
    loadKey.value = String(route.query.ma)
    await loadInvoiceToFE()
  }
})

/* ======================
   AUTO FILL KHÁCH (theo mã hoặc tên)
====================== */
function fillCustomerByMa(val: string) {
  const found = customers.value.find(c => c.Ma_khach_hang === val)
  if (!found) return
  khach.value = JSON.parse(JSON.stringify(found))
  maKHInput.value = found.Ma_khach_hang
  tenKHInput.value = found.Ten_khach_hang
}

function fillCustomerByTen(val: string) {
  const found = customers.value.find(c => c.Ten_khach_hang === val)
  if (!found) return
  khach.value = JSON.parse(JSON.stringify(found))
  maKHInput.value = found.Ma_khach_hang
  tenKHInput.value = found.Ten_khach_hang
}

/* nếu user gõ tay rồi blur */
function onBlurMaKH() {
  if (maKHInput.value?.trim()) fillCustomerByMa(maKHInput.value.trim())
}
function onBlurTenKH() {
  if (tenKHInput.value?.trim()) fillCustomerByTen(tenKHInput.value.trim())
}

/* ======================
   AUTO FILL PRODUCT (manual modal)
====================== */
function autoFillProduct(val: string) {
  const v = (val || '').trim()
  if (!v) return
  const p = products.value.find(i => i.Ma_hang === v || i.Ten_hang === v)
  if (!p) return
  const keepQty = itemForm.value.So_luong
  itemForm.value = { ...JSON.parse(JSON.stringify(p)), So_luong: Math.max(1, toNum(keepQty, 1)) }
}

/* ======================
   FILTERS
====================== */
const supplierOptions = computed(() => {
  const set = new Set<string>()
  products.value.forEach(p => {
    const key = p.Ten_nha_cung_cap?.trim() || p.Ma_nha_cung_cap?.trim()
    if (key) set.add(key)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const filteredProducts = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return products.value.filter(p => {
    const okKw =
      !kw ||
      p.Ma_hang?.toLowerCase().includes(kw) ||
      p.Ten_hang?.toLowerCase().includes(kw) ||
      p.Ten_nha_cung_cap?.toLowerCase().includes(kw)

    const okSupplier =
      supplierFilter.value === 'ALL' ||
      p.Ten_nha_cung_cap === supplierFilter.value ||
      p.Ma_nha_cung_cap === supplierFilter.value

    return okKw && okSupplier
  })
})

/* ======================
   CARD QTY realtime
====================== */
function incQty(ma: string) {
  qtyMap[ma] = Math.max(1, toNum(qtyMap[ma], 1) + 1)
}
function decQty(ma: string) {
  qtyMap[ma] = Math.max(1, toNum(qtyMap[ma], 1) - 1)
}

/* ======================
   ADD / RESET
====================== */
function addItemFromCard(p: HangHoa) {
  const qty = Math.max(1, qtyMap[p.Ma_hang] || 1)

  const found = selectedItems.value.find(
    it => it.Ma_hang === p.Ma_hang
  )

  if (found) {
    // ✅ đã có → cộng dồn số lượng
    found.So_luong += qty
  } else {
    // ✅ chưa có → thêm mới
    selectedItems.value.push(cloneHang(p, qty))
  }
}


function addItem(item: HangHoa & { So_luong: number }) {
  const found = selectedItems.value.find(
    it => it.Ma_hang === item.Ma_hang
  )

  if (found) {
    found.So_luong += Math.max(1, toNum(item.So_luong, 1))
  } else {
    selectedItems.value.push(withOriginalPriceFields(JSON.parse(JSON.stringify(item))))
  }
}


function resetItem() {
  const keepCurrency = itemForm.value.Don_vi_tien_te || 'VND'
  itemForm.value = {
    Ma_hang: '',
    Ten_hang: '',
    Main_img: '',
    Ma_nha_cung_cap: '',
    Ten_nha_cung_cap: '',
    Mo_ta_chung: '',
    Mo_ta_chi_tiet: '',
    Features: '',
    Danh_muc: '',
    License_duration: '',
    DVT: '',
    Gia_tieu_chuan: 0,
    Don_gia: 0,
    Trang_thai: 'Hiển thị',
    Don_vi_tien_te: keepCurrency,
    Ti_gia: 1,
    Thue_VAT: 0,
    Ma_hang_lien_ket: '',
    Ten_hang_lien_ket: '',
    Ghi_chu: '',
       gia_hardware: 0,
    gia_nhap: 0,
    muc_phan_tram_off: 0,
    So_luong: 1
  }
}

function resetCustomer() {
  khach.value = {
    Ma_khach_hang: '',
    Ten_khach_hang: '',
    Email_ca_nhan: '',
    So_dien_thoai_ca_nhan: '',
    Ma_cong_ty: '',
    Ten_cong_ty: '',
    So_dien_thoai_cong_ty: '',
    So_fax_cong_ty: '',
    Dia_chi_cong_ty: '',
    Email_cong_ty: '',
    Website_cong_ty: '',
    Trang_thai: '',
    Cong_no_chua_thanh_toan: '',
    Ghi_chu: ''
  }
  maKHInput.value = ''
  tenKHInput.value = ''
}

/* ======================
   CARD MODAL (full fields)
====================== */
function openCardModal(p: HangHoa) {
  const qty = qtyMap[p.Ma_hang] || 1
  cardEdit.value = cloneHang(p, qty)
  showCardModal.value = true
}

function addFromCardModal() {
  if (!cardEdit.value) return

  const found = selectedItems.value.find(
    it => it.Ma_hang === cardEdit.value!.Ma_hang
  )

  if (found) {
    found.So_luong += Math.max(1, toNum(cardEdit.value.So_luong, 1))
  } else {
    selectedItems.value.push(withOriginalPriceFields(JSON.parse(JSON.stringify(cardEdit.value))))
  }

  qtyMap[cardEdit.value.Ma_hang] = Math.max(1, toNum(cardEdit.value.So_luong, 1))
  showCardModal.value = false
}


/* ======================
   PREVIEW MODAL (quote)
   - editable like excel: qty, don_gia, VAT
====================== */
/* ✅ Đơn giá LP = hardware + nhập + Don_gia gốc */
function donGiaLP(i: any) {
  const hardware = toNum(i.gia_hardware, 0)
  const nhap = toNum(i.gia_nhap, 0)
  const donGiaGoc = toNum(i.Don_gia, 0)
  return round2(hardware + nhap + donGiaGoc)
}

/* ✅ Đơn giá sau chiết khấu = LP × (1 - %off/100) */
function donGiaSauOff(i: any) {
  const lp = donGiaLP(i)
  const pctOff = toNum(i.muc_phan_tram_off, 0)
  return round2(lp * (1 - pctOff / 100))
}

/* ✅ Hiển thị Đơn giá LP (theo mode VND) */
function displayDonGiaLP(i: any) {
  const lp = donGiaLP(i)
  const tg = toNum(i.Ti_gia, 1)
  return formatVND(lp * tg)
}

/* ✅ Hiển thị Đơn giá sau Off (theo mode VND) */
function displayQuoteDonGia(i: any) {
  const gia = donGiaSauOff(i)
  const tg = toNum(i.Ti_gia, 1)
  return formatVND(gia * tg)
}
function displayDonGiaLPRaw(i: any) {
  const tg = getGocNumber(i, '_Ti_gia_goc', toNum(i.Ti_gia, 1))
  const lpVnd = donGiaLPGoc(i) * tg
  return formatVND(lpVnd)
}

function displayQuoteDonGiaRaw(i: any) {
  const tg = getGocNumber(i, '_Ti_gia_goc', toNum(i.Ti_gia, 1))
  const giaVnd = donGiaSauOffGoc(i) * tg
  return formatVND(giaVnd)
}
function ensureNumberField(item: any, key: string) {
  item[key] = toNum(item[key], 0)
}

function lineTruocThue(i: any) {
  return round2(unitPrice(i) * toNum(i.So_luong, 1))
}

function lineVAT(i: any) {
  return round2((lineTruocThue(i) * toNum(i.Thue_VAT, 0)) / 100)
}

function lineSauThue(i: any) {
  return round2(lineTruocThue(i) + lineVAT(i))
}

function lineLoiNhuan(i: any) {
  return round2((unitPrice(i) - standardPrice(i)) * toNum(i.So_luong, 1))
}

function lineLoiNhuanPct(i: any) {
  const base = standardPrice(i)
  if (base <= 0) return ''
  return (((unitPrice(i) - base) / base) * 100).toFixed(2)
}
function lineLoiNhuanPctRaw(i: any) {
  const base = standardPriceRaw(i)
  if (base <= 0) return ''
  return (((unitPriceRaw(i) - base) / base) * 100).toFixed(2)
}

/* ======================
   TOTALS
====================== */
const totals = computed(() => {
  let truoc = 0,
    vat = 0,
    loi = 0

  selectedItems.value.forEach(i => {
    truoc += lineTruocThue(i)
    vat += lineVAT(i)
    loi += lineLoiNhuan(i)
  })

  return {
    truoc: round2(truoc),
    vat: round2(vat),
    sau: round2(truoc + vat),
    loi: round2(loi)
  }
})

const chenhLechGia = computed(() => {
  const truoc = toNum(totals.value.truoc, 0)
  const thucTe = toNum(tongGiaThucTe.value, 0)
  return Math.max(0, round2(truoc - thucTe))
})
const thueChenhLech = computed(() => {
  if (chenhLechGia.value <= 0) return 0
  const pct = toNum(thueChenhLechPct.value, 0)
  return round2((chenhLechGia.value * pct) / 100)
})
const conLai = computed(() => {
  if (chenhLechGia.value <= 0) return 0
  return round2(chenhLechGia.value - thueChenhLech.value)
})

const chietKhauTruocThue = computed(() => {
  const pct = toNum(chietKhauTruocThuePct.value, 0)
  return round2((toNum(totals.value.truoc, 0) * pct) / 100)
})
const tongChietKhau = computed(() => {
  return Math.max(0, round2(conLai.value + chietKhauTruocThue.value))
})
const chenhLechGiaRaw = computed(() => {
  const truoc = toNum(totalsContract.value.truoc, 0)
  const thucTe = toNum(tongGiaThucTe.value, 0)
  return round2(truoc - thucTe)
})
const thueChenhLechRaw = computed(() => {
  const pct = toNum(thueChenhLechPct.value, 0)
  return round2((chenhLechGiaRaw.value * pct) / 100)
})
const conLaiRaw = computed(() => {
  return round2(chenhLechGiaRaw.value - thueChenhLechRaw.value)
})
const chietKhauTruocThueRaw = computed(() => {
  const pct = toNum(chietKhauTruocThuePct.value, 0)
  return round2((toNum(totalsContract.value.truoc, 0) * pct) / 100)
})
/* ======================
   PRICE DISPLAY
====================== */
function displayPrice(p: HangHoa) {
  const vnd = donGiaLP(p) * toNum(p.Ti_gia, 1)
  return formatVND(vnd)
}

function displayOriginalPrice(p: HangHoa) {
  const cur = (p.Don_vi_tien_te || '').trim()
  if (cur.toUpperCase() !== 'VND') {
     return `${formatCurrency(donGiaLP(p), cur)} ${cur}`
  }
  return ''
}

/* keep card qty stable when filter changes */
watch(
  () => products.value.length,
  () => {
    products.value.forEach(p => {
      if (!qtyMap[p.Ma_hang]) qtyMap[p.Ma_hang] = 1
    })
  }
)

/* ======================
   ✅ GROUPING FOR QUOTE MODAL
   - cùng NCC + cùng Danh_muc => thêm 1 dòng DANH MỤC
====================== */
type QuoteRow =
  | {
      type: 'group'
      key: string
      title: string
      roman: string
    }
  | {
      type: 'item'
      key: string
      item: HangHoa & { So_luong: number }
      idx: number
      stt?: number   // 👈 BẮT BUỘC
    }



const quoteRows = computed<QuoteRow[]>(() => {
  const rows: QuoteRow[] = []
  const seen = new Set<string>()
  let groupIndex = 0   // ✅ STT danh mục

  selectedItems.value.forEach((it, idx) => {
    const sup = (it.Ten_nha_cung_cap || it.Ma_nha_cung_cap || '').trim() || 'NCC'
    const cat = (it.Danh_muc || '').trim() || 'Danh mục'
    const gKey = `${sup}||${cat}`

    if (!seen.has(gKey)) {
      seen.add(gKey)
      groupIndex++

      rows.push({
        type: 'group',
        supplier: sup,
        category: cat,
        key: gKey,
        title: cat,
        roman: toRoman(groupIndex)   // ✅ THÊM
      } as any)
    }

    rows.push({ type: 'item', item: it, idx, key: `item-${idx}` })
  })

  return rows
})

/* ======================
   ✅ QUOTE EDIT MODAL (click row -> edit)
====================== */
const showQuoteEditModal = ref(false)
const quoteEdit = ref<(HangHoa & { So_luong: number }) | null>(null)
const quoteEditIdx = ref(-1)
const showQuoteEditRawModal = ref(false)
const quoteEditRaw = ref<(HangHoa & { So_luong: number }) | null>(null)
const quoteEditRawIdx = ref(-1)

function openQuoteEdit(idx: number) {
  const it = selectedItems.value[idx]
  if (!it) return
  closeQuoteEditRaw()
  withOriginalPriceFields(it)
  quoteEdit.value = JSON.parse(JSON.stringify(it))
  quoteEditIdx.value = idx
  showQuoteEditModal.value = true
}

function closeQuoteEdit() {
  showQuoteEditModal.value = false
  quoteEdit.value = null
  quoteEditIdx.value = -1
}

function openQuoteEditRaw(idx: number) {
  const it = selectedItems.value[idx]
  if (!it) return
  closeQuoteEdit()
  withOriginalPriceFields(it)
  quoteEditRaw.value = JSON.parse(JSON.stringify(it))
  quoteEditRawIdx.value = idx
  showQuoteEditRawModal.value = true
}

function closeQuoteEditRaw() {
  showQuoteEditRawModal.value = false
  quoteEditRaw.value = null
  quoteEditRawIdx.value = -1
}

function saveQuoteEdit() {
  if (!quoteEdit.value) return
  const idx = quoteEditIdx.value
  if (idx < 0) return

  // ép số an toàn
  quoteEdit.value.So_luong = Math.max(1, toNum(quoteEdit.value.So_luong, 1))
  quoteEdit.value.Don_gia = Math.max(0, toNum(quoteEdit.value.Don_gia, 0))
  quoteEdit.value.Gia_tieu_chuan = Math.max(0, toNum(quoteEdit.value.Gia_tieu_chuan, 0))
  quoteEdit.value.Ti_gia = Math.max(0, toNum(quoteEdit.value.Ti_gia, 1))
  quoteEdit.value.Thue_VAT = Math.max(0, toNum(quoteEdit.value.Thue_VAT, 0))

  // replace item -> totals tự tính lại vì totals là computed
  selectedItems.value[idx] = JSON.parse(JSON.stringify(quoteEdit.value))
  closeQuoteEdit()
}

function saveQuoteEditRaw() {
  if (!quoteEditRaw.value) return
  const idx = quoteEditRawIdx.value
  if (idx < 0) return
  const dst = selectedItems.value[idx]
  if (!dst) return

  withOriginalPriceFields(dst)

  quoteEditRaw.value._Don_gia_goc = Math.max(0, toNum(quoteEditRaw.value._Don_gia_goc, 0))
  quoteEditRaw.value._Gia_tieu_chuan_goc = Math.max(0, toNum(quoteEditRaw.value._Gia_tieu_chuan_goc, 0))
  quoteEditRaw.value._Ti_gia_goc = Math.max(0, toNum(quoteEditRaw.value._Ti_gia_goc, 1))
  quoteEditRaw.value._Thue_VAT_goc = Math.max(0, toNum(quoteEditRaw.value._Thue_VAT_goc, 0))
  quoteEditRaw.value._gia_hardware_goc = Math.max(0, toNum(quoteEditRaw.value._gia_hardware_goc, 0))
  quoteEditRaw.value._gia_nhap_goc = Math.max(0, toNum(quoteEditRaw.value._gia_nhap_goc, 0))
  quoteEditRaw.value._muc_phan_tram_off_goc = Math.max(0, toNum(quoteEditRaw.value._muc_phan_tram_off_goc, 0))

  dst._Don_gia_goc = quoteEditRaw.value._Don_gia_goc
  dst._Gia_tieu_chuan_goc = quoteEditRaw.value._Gia_tieu_chuan_goc
  dst._Ti_gia_goc = quoteEditRaw.value._Ti_gia_goc
  dst._Thue_VAT_goc = quoteEditRaw.value._Thue_VAT_goc
  dst._gia_hardware_goc = quoteEditRaw.value._gia_hardware_goc
  dst._gia_nhap_goc = quoteEditRaw.value._gia_nhap_goc
  dst._muc_phan_tram_off_goc = quoteEditRaw.value._muc_phan_tram_off_goc
  dst.Mo_ta_chung = quoteEditRaw.value.Mo_ta_chung
  dst.Mo_ta_chi_tiet = quoteEditRaw.value.Mo_ta_chi_tiet
  dst.Features = quoteEditRaw.value.Features

  closeQuoteEditRaw()
}

function removeSelected(idx: number) {
  if (idx < 0 || idx >= selectedItems.value.length) return
  const removedQuoteEdit = quoteEditIdx.value === idx
  const removedQuoteEditRaw = quoteEditRawIdx.value === idx
  selectedItems.value.splice(idx, 1)

  // nếu đang edit đúng item bị xóa -> đóng
  if (removedQuoteEdit) {
    closeQuoteEdit()
  }
  if (removedQuoteEditRaw) {
    closeQuoteEditRaw()
  }
  // nếu đang edit item phía sau -> shift index
  if (quoteEditIdx.value > idx) {
    quoteEditIdx.value -= 1
  }
  if (quoteEditRawIdx.value > idx) {
    quoteEditRawIdx.value -= 1
  }
}

/* sửa đơn giá khi đang bật mode VND */
function onEditQuoteDonGiaVND(e: Event) {
  if (!quoteEdit.value) return
  const vnd = Number((e.target as HTMLInputElement).value || 0)
  const tg = toNum(quoteEdit.value.Ti_gia, 1)
  quoteEdit.value.Don_gia = tg > 0 ? vnd / tg : vnd
}

/* hiển thị đơn giá trong bảng quote (không còn input) */


async function loadCompareBySoHopDong(so: string) {
  compareDetails.value = []

  // 1️⃣ Lấy toàn bộ MÃ HĐ thuộc SỐ HĐ
  const maList = contractsRaw.value
    .filter(r => String(r?.[1] ?? '').trim() === so)
    .map(r => String(r?.[0] ?? '').trim())

  if (!maList.length) return

  // 2️⃣ Load toàn bộ chi tiết
  const detailRows = await fetch(`${BASE_URL}?action=hop_dong_chi_tiet&t=${Date.now()}`).then(r => r.json())
  const all = Array.isArray(detailRows) ? detailRows : []

  // 3️⃣ Lọc theo danh sách mã HĐ
  compareDetails.value = all.filter(r =>
    maList.includes(String(r?.[0] ?? '').trim())
  )
}
const compareSummary = computed(() => {
  let truoc = 0
  let tieuChuan = 0

  compareDetails.value.forEach(r => {
    const giaTC = toNum(r?.[13], 0)
    const donGia = toNum(r?.[14], 0)
    const sl = Math.max(1, toNum(r?.[18], 1))

    truoc += donGia * sl
    tieuChuan += giaTC * sl
  })

  const diff = truoc - tieuChuan
  const pct = tieuChuan > 0 ? (diff / tieuChuan) * 100 : 0

  return {
    truoc,
    tieuChuan,
    diff,
    pct
  }
})
const compareByProduct = computed(() => {
  const map = new Map<string, any>()

  compareDetails.value.forEach(r => {
    const ma = String(r?.[2] ?? '')
    const ten = String(r?.[3] ?? '')
    const giaTC = toNum(r?.[13], 0)
    const donGia = toNum(r?.[14], 0)
    const sl = Math.max(1, toNum(r?.[18], 1))

    if (!map.has(ma)) {
      map.set(ma, {
        Ma_hang: ma,
        Ten_hang: ten,
        truoc: 0,
        tieuChuan: 0
      })
    }

    const it = map.get(ma)
    it.truoc += donGia * sl
    it.tieuChuan += giaTC * sl
  })

  return Array.from(map.values()).map(it => {
    const diff = it.truoc - it.tieuChuan
    return {
      ...it,
      diff,
      pct: it.tieuChuan > 0 ? (diff / it.tieuChuan) * 100 : 0
    }
  })
})
const compareMaHopDongs = computed(() => {
  const set = new Set<string>()
  compareDetails.value.forEach(r => {
    const ma = String(r?.[0] ?? '').trim()
    if (ma) set.add(ma)
  })
  return Array.from(set)
})
const compareMatrix = computed(() => {
  const map = new Map<string, any>()

  compareDetails.value.forEach(r => {
    const maHD = String(r?.[0] ?? '').trim()
    const maHang = String(r?.[2] ?? '').trim()
    const tenHang = String(r?.[3] ?? '').trim()

    const giaTC = toNum(r?.[13], 0)
    const donGia = toNum(r?.[14], 0)
    const sl = Math.max(1, toNum(r?.[18], 1))

    if (!map.has(maHang)) {
      map.set(maHang, {
        Ma_hang: maHang,
        Ten_hang: tenHang,
        byHD: {}
      })
    }

    const row = map.get(maHang)

    if (!row.byHD[maHD]) {
      row.byHD[maHD] = { truoc: 0, tieuChuan: 0 }
    }

    row.byHD[maHD].truoc += donGia * sl
    row.byHD[maHD].tieuChuan += giaTC * sl
  })

  return Array.from(map.values()).map(r => {
    compareMaHopDongs.value.forEach(maHD => {
      const cell = r.byHD[maHD]
      if (!cell) {
        r.byHD[maHD] = null
      } else {
        const diff = cell.truoc - cell.tieuChuan
        r.byHD[maHD] = {
          diff,
          pct: cell.tieuChuan > 0 ? (diff / cell.tieuChuan) * 100 : 0
        }
      }
    })
    return r
  })
})
const compareByContract = computed(() => {
  const map = new Map<string, any>()

  compareDetails.value.forEach(r => {
    const maHD = String(r?.[0] ?? '').trim()

    const giaTC = toNum(r?.[13], 0)
    const donGia = toNum(r?.[14], 0)
    const sl = Math.max(1, toNum(r?.[18], 1))

    if (!map.has(maHD)) {
      map.set(maHD, {
        Ma_hop_dong: maHD,
        truoc: 0,
        tieuChuan: 0
      })
    }

    const it = map.get(maHD)
    it.truoc += donGia * sl
    it.tieuChuan += giaTC * sl
  })

  return Array.from(map.values()).map(it => {
    const diff = it.truoc - it.tieuChuan
    return {
      ...it,
      diff,
      pct: it.tieuChuan > 0 ? (diff / it.tieuChuan) * 100 : 0
    }
  })
})

import ExcelJS from 'exceljs'

function toRoman(num: number) {
  const map: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ]
  let res = ''
  for (const [v, s] of map) {
    while (num >= v) {
      res += s
      num -= v
    }
  }
  return res
}

async function exportQuoteExcel() {
  const workbook = new ExcelJS.Workbook()
  
  const response = await fetch('/template_goc.xlsx')
  const buffer = await response.arrayBuffer()
  await workbook.xlsx.load(buffer)
  
  const ws = workbook.worksheets[0]
  
  let headerRowIdx = -1;
  let totalRowIdx = -1;
  let origTermStart = -1;
  let origSigStart = -1;

  ws.eachRow((row, rowNumber) => {
    if (row.getCell(1).value === 'STT' && String(row.getCell(2).value).includes('TÊN HÀNG HÓA')) {
      headerRowIdx = rowNumber;
    }
    const cell1Val = String(row.getCell(1).value || '');
    const cell2Val = String(row.getCell(2).value || '');
    const rowText = cell1Val + ' ' + cell2Val;

    if (rowText.includes('TỔNG CỘNG + THUẾ')) {
      totalRowIdx = rowNumber;
    }
    
    if (totalRowIdx !== -1 && rowNumber > totalRowIdx) {
      if (rowText.includes('Thuế VAT') && origTermStart === -1) {
        origTermStart = rowNumber;
      }
      if ((rowText.includes('Xác nhận') || rowText.includes('Người lập') || rowText.includes('ĐẠI DIỆN')) && origTermStart !== -1 && origSigStart === -1) {
        origSigStart = rowNumber;
      }
    }
  });

  const groupStyle: any = {};
  for (let c = 1; c <= 9; c++) groupStyle[c] = ws.getRow(headerRowIdx + 1).getCell(c).style;
  const dataRowStyle: any = {};
  for (let c = 1; c <= 9; c++) dataRowStyle[c] = ws.getRow(headerRowIdx + 2).getCell(c).style;
  const totalRowStyle: any = {};
  for (let c = 1; c <= 9; c++) totalRowStyle[c] = ws.getRow(totalRowIdx).getCell(c).style;

  const footerMerges: any[] = [];
  const footerRowProps: any[] = [];
  const maxRow = ws.rowCount;
  for (let r = totalRowIdx + 1; r <= maxRow; r++) {
    footerRowProps.push({
      height: ws.getRow(r).height,
      hidden: ws.getRow(r).hidden,
      outlineLevel: ws.getRow(r).outlineLevel
    });
  }

  const merges = Object.values((ws as any)._merges || {});
  merges.forEach((merge: any) => {
    if (merge.model.top > totalRowIdx) {
      footerMerges.push(merge.model);
    }
    if (merge.model.top >= headerRowIdx) {
      ws.unMergeCells(merge.model.top, merge.model.left, merge.model.bottom, merge.model.right);
    }
  });

  const numRowsToRemove = totalRowIdx - headerRowIdx;
  ws.spliceRows(headerRowIdx + 1, numRowsToRemove);

  // Clear heights below header to prevent dirty inherited heights
  for (let r = headerRowIdx + 1; r <= maxRow + 200; r++) {
    (ws.getRow(r) as any).height = undefined;
    ws.getRow(r).hidden = false;
  }

  let insertIdx = headerRowIdx + 1;

  quoteRowsWithSTT.value.forEach((r: any) => {
    ws.spliceRows(insertIdx, 0, []);
    const row = ws.getRow(insertIdx);

    if (r.type === 'group') {
      row.getCell(1).value = r.roman;
      row.getCell(2).value = String(r.title).toUpperCase();
      for (let c = 1; c <= 9; c++) row.getCell(c).style = groupStyle[c];
      ws.mergeCells(insertIdx, 2, insertIdx, 3);
    } else {
      const i = r.item;
      const donGiaVND = unitPrice(i);
      const truoc = lineTruocThue(i);
      const vat = lineVAT(i);
      const sau = lineSauThue(i);

      row.getCell(1).value = r.stt;
      row.getCell(2).value = i.Ten_hang;
      row.getCell(3).value = [i.Mo_ta_chung, i.Mo_ta_chi_tiet, i.Features].filter(Boolean).join('\n');
      row.getCell(4).value = i.DVT;
      row.getCell(5).value = Number(i.So_luong) || 0;
      row.getCell(6).value = Number(donGiaVND) || 0;
      row.getCell(7).value = Number(truoc) || 0;
      row.getCell(8).value = Number(vat) || 0;
      row.getCell(9).value = Number(sau) || 0;

      for (let c = 1; c <= 9; c++) {
        const cell = row.getCell(c);
        cell.style = dataRowStyle[c];
        if (c >= 5 && c <= 9) {
          cell.font = Object.assign({}, cell.font || {}, { bold: true });
        }
      }
    }
    insertIdx++;
  });

  ws.spliceRows(insertIdx, 0, []);
  const totRow = ws.getRow(insertIdx);
  totRow.getCell(1).value = 'TỔNG CỘNG + THUẾ';
  totRow.getCell(7).value = Number(totals.value.truoc) || 0;
  totRow.getCell(8).value = Number(totals.value.vat) || 0;
  totRow.getCell(9).value = Number(totals.value.sau) || 0;
  
  for (let c = 1; c <= 9; c++) totRow.getCell(c).style = totalRowStyle[c];
  ws.mergeCells(insertIdx, 1, insertIdx, 6);

  const diff = insertIdx - totalRowIdx;
  let termsDiff = 0;
  if (selectedTermId.value && origTermStart !== -1 && origSigStart !== -1) {
    if (editableTermContent.value) {
      const currentTermStart = origTermStart + diff;
      const currentSigStart = origSigStart + diff;
      const rowsToDelete = currentSigStart - currentTermStart - 1; // leave 1 empty row
      
      const temp = document.createElement('div');
      // To prevent double newlines from <p><br></p>, we handle them specifically
      let htmlStr = editableTermContent.value.replace(/<p><br\s*[\/]?>\s*<\/p>/gi, '\n');
      htmlStr = htmlStr.replace(/<div><br\s*[\/]?>\s*<\/div>/gi, '\n');
      htmlStr = htmlStr.replace(/<br\s*[\/]?>/gi, '\n');
      htmlStr = htmlStr.replace(/<\/p>|<\/div>|<\/li>/gi, '\n');
      htmlStr = htmlStr.replace(/<li[^>]*>/gi, '- ');
      temp.innerHTML = htmlStr;

      const rgbToArgb = (rgbStr: string) => {
        if (!rgbStr) return undefined;
        const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const r = parseInt(match[1]).toString(16).padStart(2, '0');
          const g = parseInt(match[2]).toString(16).padStart(2, '0');
          const b = parseInt(match[3]).toString(16).padStart(2, '0');
          return 'FF' + r.toUpperCase() + g.toUpperCase() + b.toUpperCase();
        }
        if (rgbStr.startsWith('#')) {
           let hex = rgbStr.replace('#', '');
           if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
           return 'FF' + hex.toUpperCase();
        }
        return undefined;
      };

      const allNodes: any[] = [];
      const traverse = (node: Node, currentFont: any) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent) {
            allNodes.push({ text: node.textContent, font: { ...currentFont } });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const newFont = { ...currentFont };
          const tag = el.tagName.toLowerCase();
          
          if (tag === 'b' || tag === 'strong') newFont.bold = true;
          if (tag === 'i' || tag === 'em') newFont.italic = true;
          if (tag === 'u') newFont.underline = true;
          if (tag === 's' || tag === 'strike') newFont.strike = true;
          
          if (el.style) {
            const fw = el.style.fontWeight;
            if (fw === 'bold' || fw === 'bolder' || parseInt(fw) >= 700) {
              newFont.bold = true;
            }
            const fs = el.style.fontStyle;
            if (fs === 'italic' || fs === 'oblique') {
              newFont.italic = true;
            }
            const td = el.style.textDecoration;
            if (td && td.includes('underline')) {
              newFont.underline = true;
            }
            if (td && td.includes('line-through')) {
              newFont.strike = true;
            }
            
            if (el.style.color) {
              const argb = rgbToArgb(el.style.color);
              if (argb) newFont.color = { argb };
            }
            if (el.style.fontFamily) {
              newFont.name = el.style.fontFamily.replace(/['"]/g, '');
            }
            if (el.style.fontSize) {
              const pt = parseInt(el.style.fontSize);
              if (!isNaN(pt)) newFont.size = pt;
            }
          }
          
          if (tag === 'font') {
            if (el.hasAttribute('face')) newFont.name = el.getAttribute('face') || newFont.name;
            if (el.hasAttribute('color')) {
              const argb = rgbToArgb(el.getAttribute('color') || '');
              if (argb) newFont.color = { argb };
            }
          }
          
          el.childNodes.forEach(child => traverse(child, newFont));
        }
      };
      
      traverse(temp, { name: 'Times New Roman', size: 11 });

      const linesRT: any[][] = [[]];
      allNodes.forEach(node => {
        const parts = node.text.split('\n');
        for (let i = 0; i < parts.length; i++) {
          if (i > 0) linesRT.push([]);
          if (parts[i]) {
            linesRT[linesRT.length - 1].push({ text: parts[i], font: node.font });
          }
        }
      });

      const cleanLinesRT = linesRT.filter(l => l.some(n => n.text.trim().length > 0));
      
      if (rowsToDelete > 0) {
        ws.spliceRows(currentTermStart, rowsToDelete);
      }
      if (cleanLinesRT.length > 0) {
        ws.spliceRows(currentTermStart, 0, ...Array(cleanLinesRT.length).fill([]));
      }
      
      termsDiff = cleanLinesRT.length - rowsToDelete;
      
      for (let i = 0; i < cleanLinesRT.length; i++) {
        const row = ws.getRow(currentTermStart + i);
        const lineArr = cleanLinesRT[i];
        
        let bulletNumber: number | null = null;
        if (lineArr.length > 0 && lineArr[0].text) {
           const match = lineArr[0].text.match(/^(\s*\d+)[\.\s]+(.*)/);
           if (match) {
             bulletNumber = Number(match[1]);
             lineArr[0].text = match[2];
           }
        }
        
        const finalArr = lineArr.filter(n => n.text !== '');
        
        if (bulletNumber !== null) {
          row.getCell(1).value = bulletNumber;
          row.getCell(1).font = { name: 'Times New Roman', size: 11, bold: true };
          row.getCell(1).alignment = { horizontal: 'center', vertical: 'top' };
        }
        
        if (finalArr.length > 0) {
          row.getCell(2).value = { richText: finalArr };
        } else {
          row.getCell(2).value = '';
        }
        
        // Merge from Col 2 to 9 and style
        ws.mergeCells(currentTermStart + i, 2, currentTermStart + i, 9);
        const cell2 = row.getCell(2);
        cell2.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
      }
    }
  }

  footerMerges.forEach(m => {
    let mergeDiff = diff;
    if (m.top >= origSigStart) {
      mergeDiff += termsDiff;
    } else if (m.top >= origTermStart) {
      return; // ignore merges in deleted old terms
    }
    try {
      ws.mergeCells(m.top + mergeDiff, m.left, m.bottom + mergeDiff, m.right);
    } catch(e) {}
  });
  
  // Apply footer row props (heights)
  let currentFooterIdx = insertIdx + 1;
  let origRowIdx = totalRowIdx + 1;
  footerRowProps.forEach(props => {
    let targetIdx = currentFooterIdx;
    if (origRowIdx >= origSigStart) {
      targetIdx += termsDiff;
    } else if (origRowIdx >= origTermStart) {
      origRowIdx++;
      currentFooterIdx++;
      return; // skip old terms
    }
    const rObj = ws.getRow(targetIdx);
    if (props.height !== undefined) rObj.height = props.height;
    if (props.hidden !== undefined) rObj.hidden = props.hidden;
    if (props.outlineLevel !== undefined) rObj.outlineLevel = props.outlineLevel;
    
    origRowIdx++;
    currentFooterIdx++;
  });
  
  ws.getCell('A7').value = `Kính gởi: ${khach.value?.Ten_cong_ty || ''}`;
  
  const cellA8 = ws.getCell('A8');
  cellA8.value = `Địa chỉ: ${khach.value?.Dia_chi_cong_ty || ''}`;
  cellA8.font = { ...cellA8.font, italic: true };
  
  const cellA9 = ws.getCell('A9');
  cellA9.value = `Người nhận: ${khach.value?.Ten_khach_hang || ''}`;
  cellA9.font = { ...cellA9.font, italic: true };
  
  const now = new Date();
  const dd = now.getDate().toString().padStart(2, '0');
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = now.getFullYear();
  ws.getCell('G7').value = `Ngày : ${dd}/${mm}/${yyyy}`;
  
  // The colored line above the footer is actually an Image in the Excel template.
  // ExcelJS spliceRows shifts cell values but DOES NOT shift images.
  // We must manually shift the footer image down by the total number of rows added/removed.
  const totalShift = diff + termsDiff;
  if (totalShift !== 0) {
    const images = ws.getImages();
    images.forEach((img: any) => {
      // If the image is located below the header, it's the footer line.
      if (img.range && img.range.tl && img.range.tl.row > headerRowIdx) {
        img.range.tl.row += totalShift;
        img.range.br.row += totalShift;
      }
    });
  }
  
  const outBuffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BaoGia_${soHopDong.value || maHopDong.value || 'NTS'}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}

function exportPDF() {
  setTimeout(() => {
    window.print()
  }, 100)
}

const quoteRowsWithSTT = computed(() => {
  let stt = 0

  return quoteRows.value.map(r => {
    if (r.type === 'group') {
      stt = 0
      return r
    }

    // r.type === 'item'
    stt++

    return {
      ...r,
      stt
    }
  })
})

</script>

<template>
  <div class="page">
    <div class="main-grid">

      <!-- ================== LEFT SIDEBAR ================== -->
      <aside class="sidebar sidebar-left" :class="{ closed: !showProductSidebar }">
        <div class="sidebar-head sidebar-head-product">
          <div class="sidebar-title-row">
            <h3><i class="lucide-package"></i> Kho sản phẩm</h3>
            <span class="product-count">{{ filteredProducts.length }} SP</span>
          </div>
          <button class="icon-btn" @click="showProductSidebar = false">✕</button>
        </div>
        <div class="top-bar">
          <button class="primary btn-manual" @click="showManualModal = true">
            <span class="btn-icon">＋</span> Nhập tay
          </button>
          <div class="search-wrap">
            <span class="search-icon"><i class="lucide-search"></i></span>
            <input v-model="keyword" placeholder="Tìm mã / tên hàng / NCC..." class="search-input" />
          </div>
          <select v-model="supplierFilter" class="select filter-select">
            <option value="ALL">Tất cả nhà cung cấp</option>
            <option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div class="product-grid">
          <div class="card" v-for="p in filteredProducts" :key="p.Ma_hang" @click="openCardModal(p)">
            <div class="card-body">
              <span class="card-ncc-badge" v-if="p.Ten_nha_cung_cap" style="position: static; display: inline-block; margin-bottom: 4px;">{{ p.Ten_nha_cung_cap }}</span>
              <h4 class="clamp2">{{ p.Ten_hang }}</h4>
              <p class="card-license clamp1" v-if="p.License_duration">{{ p.License_duration }}</p>
              <p class="card-desc clamp2" v-if="p.Mo_ta_chung">{{ p.Mo_ta_chung }}</p>
              <div class="card-price-row">
                <span class="price">{{ displayPrice(p) }}</span>
                <span class="price-unit">/ {{ p.DVT }}</span>
              </div>
              <p v-if="displayOriginalPrice(p)" class="card-orig-price">(~ {{ displayOriginalPrice(p) }})</p>
              <span class="card-vat-badge">VAT {{ p.Thue_VAT }}%</span>
            </div>
            <div class="card-footer" @click.stop>
              <div class="qty">
                <button @click="decQty(p.Ma_hang)">&#x2212;</button>
                <span>{{ qtyMap[p.Ma_hang] || 1 }}</span>
                <button @click="incQty(p.Ma_hang)">+</button>
              </div>
              <button class="btn-add" @click="addItemFromCard(p)">
                <span class="btn-add-icon">＋</span> Thêm
              </button>
            </div>
          </div>
        </div>
      </aside>
      <button v-if="!showProductSidebar" class="open-tab left" @click="showProductSidebar = true">
        <i class="lucide-shopping-cart"></i> SP
      </button>

      <!-- ================== CENTER: BẢNG BÁO GIÁ VÀ TỔNG TIỀN ================== -->
      <section class="box center quote-center">
        <div class="quote-table-wrap">
          <div class="sidebar-head table-header-box">
            <h3><i class="lucide-file-text"></i> Bảng báo giá chi tiết</h3>
            <div class="header-contract-info">
              <span class="contract-badge">Mã HĐ: <b>{{ maHopDong }}</b></span>
              <span class="contract-badge">Số HĐ: <b>{{ soHopDong }}</b></span>
              <span class="contract-badge" v-if="khach.Ten_khach_hang">Khách hàng: <b>{{ khach.Ten_khach_hang }}</b></span>
              <span class="contract-badge" v-if="khach.Ten_cong_ty">Công ty: <b>{{ khach.Ten_cong_ty }}</b></span>
              <span class="contract-badge" v-if="khach.Dia_chi_cong_ty">Địa chỉ: <b>{{ khach.Dia_chi_cong_ty }}</b></span>
            </div>
            <span class="hint">Click vào ô <b>SL / Giá Lic / VAT</b> để sửa trực tiếp.</span>
          </div>
            <table>
              <thead>
                <tr>
                  <th class="col-stt">STT</th>
                  <th class="col-pn">P/N</th>
                  <th class="col-name">Tên hàng</th>
                  <th class="col-desc">Diễn giải</th>
                  <th class="col-hang">Hãng</th>
                  <th class="col-sl">SL</th>
                  <th class="col-dvt">ĐVT</th>
                  <th class="col-dg">Giá Lic LP (VND)</th> 
                  <th class="col-dg">Giá Lic (VND)</th>
                  <th class="col-tt">TT trước thuế (VND)</th>
                  <th class="col-vat">VAT</th>
                  <th class="col-tt">TT sau thuế (VND)</th>
                  <th class="col-loi">Lợi nhuận (VND)</th>
                  <th class="col-del">Xóa</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="r in quoteRowsWithSTT" :key="r.key">
                  <tr v-if="r.type === 'group'" class="group-row">
                    <td class="group-stt">{{ r.roman }}</td>
                    <td colspan="12" class="group-title">{{ r.title }}</td>
                  </tr>
                  <tr v-else class="quote-item-row" @click="openQuoteEdit(r.idx)">
                    <td>{{ r.stt }}</td>
                    <td class="nowrap">{{ r.item.Ma_hang }}</td>
                    <td class="nowrap">{{ r.item.Ten_hang }}</td>
                    <td class="desc">
                      <div class="preline">
                        <div v-if="r.item.Mo_ta_chung">{{ r.item.Mo_ta_chung }}</div>
                        <div v-if="r.item.Mo_ta_chi_tiet">{{ r.item.Mo_ta_chi_tiet }}</div>
                        <div v-if="r.item.Features">{{ r.item.Features }}</div>
                      </div>
                    </td>
                    <td class="center">{{ r.item.Ten_nha_cung_cap }}</td>
                    <td class="center">{{ r.item.So_luong }}</td>
                    <td class="dvt">{{ r.item.DVT }}</td>
                    <td class="right">{{ displayDonGiaLP(r.item) }}</td> 
                    <td class="right">{{ displayQuoteDonGia(r.item) }}</td>
                    <td class="right">{{ formatVND(lineTruocThue(r.item)) }}</td>
                    <td class="center">{{ toNum(r.item.Thue_VAT, 0) }}%</td>
                    <td class="right">{{ formatVND(lineSauThue(r.item)) }}</td>
                    <td class="right">
                      {{ formatVND(lineLoiNhuan(r.item)) }}
                      <span class="muted" v-if="lineLoiNhuanPct(r.item)"> ({{ lineLoiNhuanPct(r.item) }}%)</span>
                    </td>
                    <td class="center"><button class="btn-del" @click.stop="removeSelected(r.idx)"><i class="lucide-trash-2"></i></button></td>
                  </tr>
                </template>
              </tbody>
            </table>
        </div>
        <div class="bottom-totals">
          <!-- BOX CHIẾT KHẤU -->
          <div class="totals-box">
            <div class="totals-header">
              <span class="totals-icon"><i class="lucide-trending-down"></i></span>
              <span>Chiết khấu & Chênh lệch</span>
            </div>
            <div class="totals-body">
              <div class="totals-row">
                <span class="totals-label">Chiết khấu % tổng trước thuế</span>
                <span class="totals-value">{{ chietKhauTruocThuePct }}% <small>({{ formatVND(chietKhauTruocThue) }})</small></span>
              </div>
              <div class="totals-row">
                <span class="totals-label">Thuế % chênh lệch giá</span>
                <span class="totals-value">{{ thueChenhLechPct }}% <small>({{ formatVND(thueChenhLech) }})</small></span>
              </div>
              <div class="totals-row">
                <span class="totals-label">Chênh lệch giá</span>
                <span class="totals-value">{{ formatVND(chenhLechGia) }}</span>
              </div>
              <div class="totals-row">
                <span class="totals-label">Còn lại</span>
                <span class="totals-value">{{ formatVND(conLai) }}</span>
              </div>
              <div class="totals-row totals-highlight">
                <span class="totals-label">Tổng Chiết khấu</span>
                <span class="totals-value">{{ formatVND(tongChietKhau) }}</span>
              </div>
            </div>
          </div>
          <!-- BOX TỔNG TIỀN -->
          <div class="totals-box">
            <div class="totals-header totals-header-primary">
              <span class="totals-icon"><i class="lucide-wallet"></i></span>
              <span>Tổng hợp tài chính</span>
            </div>
            <div class="totals-body">
              <div class="totals-row">
                <span class="totals-label">Tổng giá thực tế</span>
                <span class="totals-value">{{ formatVND(tongGiaThucTe) }}</span>
              </div>
              <div class="totals-row">
                <span class="totals-label">Tổng trước thuế</span>
                <span class="totals-value">{{ formatVND(totals.truoc) }}</span>
              </div>
              <div class="totals-row">
                <span class="totals-label">Tổng VAT</span>
                <span class="totals-value text-warn">{{ formatVND(totals.vat) }}</span>
              </div>
              <div class="totals-row totals-highlight-blue">
                <span class="totals-label">Tổng sau thuế</span>
                <span class="totals-value">{{ formatVND(totals.sau) }}</span>
              </div>
              <div class="totals-row totals-highlight-green">
                <span class="totals-label">Tổng lợi nhuận</span>
                <span class="totals-value">{{ formatVND(totals.loi) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================== RIGHT SIDEBAR: HỢP ĐỒNG + THAO TÁC ================== -->
      <aside class="sidebar sidebar-right" :class="{ closed: !showContractSidebar }">
        <div class="sidebar-head sidebar-head-contract">
          <div class="sidebar-title-row">
            <h3><i class="lucide-file-check"></i> Hợp đồng</h3>
          </div>
          <button class="icon-btn" @click="showContractSidebar = false">✕</button>
        </div>

        <div class="contract-section">
          <div class="section-label"><i class="lucide-percent"></i> Thuế & Chiết khấu</div>
          <div class="contract-fields">
            <div class="field-group">
              <label>Thuế % chênh lệch giá</label>
              <input type="number" v-model.number="thueChenhLechPct" min="0" placeholder="0" />
            </div>
            <div class="field-group">
              <label>Chiết khấu % tổng trước thuế</label>
              <input type="number" v-model.number="chietKhauTruocThuePct" min="0" placeholder="0" />
            </div>
          </div>
        </div>

        <div class="contract-section">
          <div class="section-label"><i class="lucide-message-square"></i> Ghi chú</div>
          <textarea v-model="ghiChuHopDong" placeholder="Nhập ghi chú cho hợp đồng..." />
        </div>

        <div class="contract-divider"></div>

        <div class="contract-section">
          <div class="section-label"><i class="lucide-settings"></i> Thao tác</div>
          <div class="action-grid">
            <button class="action-btn action-primary" @click="showPreviewRawModal = true">
              <i class="lucide-eye"></i>
              <span>Xem báo giá gốc</span>
            </button>
            <button class="action-btn action-success" @click="showExportExcelModal = true">
              <i class="lucide-file-spreadsheet"></i>
              <span>Xuất Excel</span>
            </button>
            <button class="action-btn" @click="exportPDF">
              <i class="lucide-file-down"></i>
              <span>Xuất PDF</span>
            </button>
            <button class="action-btn action-save" :disabled="saving" @click="showSaveModal = true">
              <i class="lucide-save"></i>
              <span>{{ saving ? 'Đang lưu...' : 'Lưu hợp đồng' }}</span>
            </button>
          </div>
          <p v-if="saveMsg" class="save-msg">{{ saveMsg }}</p>
        </div>

        <div class="contract-divider"></div>

        <div class="contract-section">
          <div class="action-utils">
            <button class="util-btn" @click="showLoadInvoiceModal = true">
              <i class="lucide-download"></i> Load hóa đơn
            </button>
            <button class="util-btn" @click="showPickCompareModal = true">
              <i class="lucide-bar-chart-3"></i> Xem bảng so sánh
            </button>
          </div>
        </div>

      </aside>

      <!-- NÚT MỞ SIDEBAR HỢP ĐỒNG -->
      <button v-if="!showContractSidebar" class="open-tab right" @click="showContractSidebar = true">
        <i class="lucide-file-check"></i> HĐ
      </button>
    </div>

    <!-- ================== MODAL: NHẬP TAY (FULL FIELDS) ================== -->
    <div v-if="showManualModal" class="modal" @click.self="showManualModal = false">
      <div class="modal-card modal-wide">
        <div class="modal-head">
          <h3><i class="lucide-plus-circle"></i> Nhập tay hàng (đầy đủ field)</h3>
          <button class="x" @click="showManualModal = false">✕</button>
        </div>

        <div class="grid2">
          <div>
            <label>Mã hàng</label>
            <input v-model="itemForm.Ma_hang" list="dl-hh-ma" placeholder="Mã hàng" @blur="autoFillProduct(itemForm.Ma_hang)" />
            <datalist id="dl-hh-ma">
              <option v-for="p in products" :key="p.Ma_hang" :value="p.Ma_hang" />
            </datalist>
          </div>

          <div>
            <label>Tên hàng</label>
            <input v-model="itemForm.Ten_hang" list="dl-hh-ten" placeholder="Tên hàng" @blur="autoFillProduct(itemForm.Ten_hang)" />
            <datalist id="dl-hh-ten">
              <option v-for="p in products" :key="p.Ma_hang + '_t'" :value="p.Ten_hang" />
            </datalist>
          </div>
        </div>

        <label>Main_img (URL)</label>
        <input v-model="itemForm.Main_img" placeholder="https://..." />
        <img v-if="itemForm.Main_img" class="preview" :src="itemForm.Main_img" />

        <div class="grid2">
          <div>
            <label>Mã NCC</label>
            <input v-model="itemForm.Ma_nha_cung_cap" placeholder="Mã nhà cung cấp" />
          </div>
          <div>
            <label>Tên NCC</label>
            <input v-model="itemForm.Ten_nha_cung_cap" placeholder="Tên nhà cung cấp" />
          </div>
        </div>

        <div class="grid2">
          <div>
            <label>Mã hàng liên kết</label>
            <input v-model="itemForm.Ma_hang_lien_ket" placeholder="Mã hàng liên kết" />
          </div>
          <div>
            <label>Tên hàng liên kết</label>
            <input v-model="itemForm.Ten_hang_lien_ket" placeholder="Tên hàng liên kết" />
          </div>
        </div>

        <label>Mô tả chung</label>
        <textarea v-model="itemForm.Mo_ta_chung" placeholder="Mô tả chung" />

        <label>Mô tả chi tiết</label>
        <textarea v-model="itemForm.Mo_ta_chi_tiet" placeholder="Mô tả chi tiết" />

        <label>Features</label>
        <textarea v-model="itemForm.Features" placeholder="Features" />

        <div class="grid2">
          <div>
            <label>Danh mục</label>
            <input v-model="itemForm.Danh_muc" placeholder="Danh mục" />
          </div>
          <div>
            <label>License duration</label>
            <input v-model="itemForm.License_duration" placeholder="License duration" />
          </div>
        </div>

        <div class="grid3">
          <div>
            <label>ĐVT</label>
            <input v-model="itemForm.DVT" placeholder="ĐVT" />
          </div>
          <div>
            <label>Giá tiêu chuẩn</label>
            <input type="number" v-model.number="itemForm.Gia_tieu_chuan" placeholder="Giá tiêu chuẩn" />
          </div>
          <div>
            <label>Giá Lic</label>
            <input type="number" v-model.number="itemForm.Don_gia" placeholder="Giá Lic" />
          </div>
        </div>

        <div class="grid3">
          <div>
            <label>Đơn vị tiền tệ</label>
            <input v-model="itemForm.Don_vi_tien_te" placeholder="VND/USD/..." />
          </div>
          <div>
            <label>Tỉ giá</label>
            <input type="number" v-model.number="itemForm.Ti_gia" placeholder="Tỉ giá" />
          </div>
          <div>
            <label>Thuế VAT (%)</label>
            <input type="number" v-model.number="itemForm.Thue_VAT" placeholder="VAT" />
          </div>
        </div>

        <div class="grid2">
          <div>
            <label>Trạng thái</label>
            <input v-model="itemForm.Trang_thai" placeholder="Hiển thị / Ẩn" />
          </div>
          <div>
            <label>Số lượng</label>
            <input type="number" v-model.number="itemForm.So_luong" placeholder="Số lượng" />
          </div>
        </div>

        <label>Ghi chú</label>
        <textarea v-model="itemForm.Ghi_chu" placeholder="Ghi chú" />

        <div class="modal-actions">
          <button class="primary" @click="addItem(itemForm)">Thêm vào báo giá</button>
          <button @click="resetItem">Reset</button>
          <button @click="showManualModal = false">Đóng</button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL: CARD DETAIL (FULL FIELDS) ================== -->
    <div v-if="showCardModal && cardEdit" class="modal" @click.self="showCardModal = false">
      <div class="modal-card modal-wide">
        <div class="modal-head">
          <h3><i class="lucide-clipboard-list"></i> Chi tiết hàng (có thể chỉnh sửa)</h3>
          <button class="x" @click="showCardModal = false">✕</button>
        </div>

        <img v-if="cardEdit.Main_img" class="preview" :src="cardEdit.Main_img" />

        <div class="grid2">
          <div>
            <label>Mã hàng</label>
            <input v-model="cardEdit.Ma_hang" readonly />
          </div>
          <div>
            <label>Tên hàng</label>
            <input v-model="cardEdit.Ten_hang" />
          </div>
        </div>

        <div class="grid2">
          <div>
            <label>Mã NCC</label>
            <input v-model="cardEdit.Ma_nha_cung_cap" />
          </div>
          <div>
            <label>Tên NCC</label>
            <input v-model="cardEdit.Ten_nha_cung_cap" />
          </div>
        </div>

        <div class="grid2">
          <div>
            <label>Mã hàng liên kết</label>
            <input v-model="cardEdit.Ma_hang_lien_ket" />
          </div>
          <div>
            <label>Tên hàng liên kết</label>
            <input v-model="cardEdit.Ten_hang_lien_ket" />
          </div>
        </div>

        <label>Mô tả chung</label>
        <textarea v-model="cardEdit.Mo_ta_chung" />

        <label>Mô tả chi tiết</label>
        <textarea v-model="cardEdit.Mo_ta_chi_tiet" />

        <label>Features</label>
        <textarea v-model="cardEdit.Features" />

        <div class="grid2">
          <div>
            <label>Danh mục</label>
            <input v-model="cardEdit.Danh_muc" />
          </div>
          <div>
            <label>License duration</label>
            <input v-model="cardEdit.License_duration" />
          </div>
        </div>

        <div class="grid3">
          <div>
            <label>ĐVT</label>
            <input v-model="cardEdit.DVT" />
          </div>
          <div>
            <label>Giá tiêu chuẩn</label>
            <input type="number" v-model.number="cardEdit.Gia_tieu_chuan" />
          </div>
          <div>
            <label>Giá Lic</label>
            <input type="number" v-model.number="cardEdit.Don_gia" />
          </div>
        </div>

        <div class="grid3">
          <div>
            <label>Đơn vị tiền tệ</label>
            <input v-model="cardEdit.Don_vi_tien_te" />
          </div>
          <div>
            <label>Tỉ giá</label>
            <input type="number" v-model.number="cardEdit.Ti_gia" />
          </div>
          <div>
            <label>Thuế VAT (%)</label>
            <input type="number" v-model.number="cardEdit.Thue_VAT" />
          </div>
        </div>

        <div class="grid2">
          <div>
            <label>Trạng thái</label>
            <input v-model="cardEdit.Trang_thai" />
          </div>
          <div>
            <label>Số lượng</label>
            <input type="number" v-model.number="cardEdit.So_luong" />
          </div>
        </div>

        <label>Ghi chú</label>
        <textarea v-model="cardEdit.Ghi_chu" />
        <div class="grid3">
  <div>
    <label>Giá Hardware</label>
    <input type="number" v-model.number="cardEdit.gia_hardware" placeholder="0" />
  </div>
  <div>
    <label>Giá Nhập</label>
    <input type="number" v-model.number="cardEdit.gia_nhap" placeholder="0" />
  </div>
  <div>
    <label>Mức % Off</label>
    <input type="number" v-model.number="cardEdit.muc_phan_tram_off" placeholder="0" />
  </div>
</div>
        <div class="modal-actions">
          <button class="primary" @click="addFromCardModal">Thêm vào báo giá</button>
          <button @click="showCardModal = false">Đóng</button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL: XEM BÁO GIÁ GỐC (GROUP THEO NCC + DANH MỤC) ================== -->
    <div v-if="showPreviewRawModal" class="modal" @click.self="showPreviewRawModal = false">
      <div class="modal-card modal-wide modal-quote">
        <div class="modal-head">
          <h3><i class="lucide-file-text"></i> Báo giá gốc</h3>
          <button class="x" @click="showPreviewRawModal = false">✕</button>
        </div>

        <div class="header-contract-info" style="margin-bottom: 12px;">
          <span class="contract-badge">Mã HĐ: <b>{{ maHopDong }}</b></span>
          <span class="contract-badge">Số HĐ: <b>{{ soHopDong }}</b></span>
          <span class="contract-badge" v-if="khach.Ten_khach_hang">Khách hàng: <b>{{ khach.Ten_khach_hang }}</b></span>
          <span class="contract-badge" v-if="khach.Ten_cong_ty">Công ty: <b>{{ khach.Ten_cong_ty }}</b></span>
          <span class="contract-badge" v-if="khach.Dia_chi_cong_ty">Địa chỉ: <b>{{ khach.Dia_chi_cong_ty }}</b></span>
        </div>

        <div class="hint">Click vào ô <b>SL / Giá Lic / VAT</b> để sửa như Excel (tự tính lại ngay).</div>

        <div class="quote-table-wrap">
          <table>
            <thead>
              <tr>
                <th class="col-stt">STT</th>
                <th class="col-pn">P/N</th>
                <th class="col-name">Tên hàng</th>
                <th class="col-desc">Diễn giải</th>
                <th class="col-sl">SL</th>
                <th class="col-dvt">ĐVT</th>
                <th class="col-dg">Giá Lic LP (VND)</th>
                <th class="col-dg">Giá Lic (VND)</th>
                <th class="col-tt">TT trước thuế (VND)</th>
                <th class="col-vat">VAT</th>
                <th class="col-tt">TT sau thuế (VND)</th>
                <th class="col-loi">Lợi nhuận (VND)</th>
                <th class="col-del">Xóa</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="r in quoteRowsWithSTT" :key="r.key">
                <tr v-if="r.type === 'group'" class="group-row">
                  <td class="group-stt">{{ r.roman }}</td>
                  <td colspan="11" class="group-title">{{ r.title }}</td>
                </tr>
                <tr v-else class="quote-item-row" @click="openQuoteEditRaw(r.idx)">
                  <td>{{ r.stt }}</td>
                  <td class="nowrap">{{ r.item.Ma_hang }}</td>
                  <td class="nowrap">{{ r.item.Ten_hang }}</td>
                  <td class="desc">
                    <div class="preline">
                      <div v-if="r.item.Mo_ta_chung">{{ r.item.Mo_ta_chung }}</div>
                      <div v-if="r.item.Mo_ta_chi_tiet">{{ r.item.Mo_ta_chi_tiet }}</div>
                      <div v-if="r.item.Features">{{ r.item.Features }}</div>
                    </div>
                  </td>
                  <td class="center">{{ r.item.So_luong }}</td>
                  <td class="dvt">{{ r.item.DVT }}</td>
                  <td class="right">{{ displayDonGiaLPRaw(r.item) }}</td>
                  <td class="right">{{ displayQuoteDonGiaRaw(r.item) }}</td>
                  <td class="right">{{ formatVND(lineTruocThueRaw(r.item)) }}</td>
                  <td class="center">{{ vatGoc(r.item) }}%</td>
                  <td class="right">{{ formatVND(lineSauThueRaw(r.item)) }}</td>
                  <td class="right">
                    {{ formatVND(lineLoiNhuanRaw(r.item)) }}
                    <span class="muted" v-if="lineLoiNhuanPctRaw(r.item)"> ({{ lineLoiNhuanPctRaw(r.item) }}%)</span>
                  </td>
                  <td class="center">
                    <button class="btn-del" @click.stop="removeSelected(r.idx)"><i class="lucide-trash-2"></i></button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div class="totals-grid totals-quote">
          <div class="totals">
            <div class="mini"><b>Tổng trước thuế:</b> {{ formatVND(totalsContract.truoc) }}</div>
            <div class="mini"><b>Tổng VAT:</b> {{ formatVND(totalsContract.vat) }}</div>
            <div class="mini"><b>Tổng sau thuế:</b> {{ formatVND(totalsContract.sau) }}</div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="primary" @click="showPreviewRawModal = false">Đóng</button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL: CHỈNH SỬA ITEM BÁO GIÁ ================== -->
<div v-if="showQuoteEditModal && quoteEdit" class="modal" @click.self="closeQuoteEdit()">
  <div class="modal-card modal-wide">
    <div class="modal-head">
      <h3><i class="lucide-pencil"></i> Chỉnh sửa hàng trong báo giá</h3>
      <button class="x" @click="closeQuoteEdit()">✕</button>
    </div>

    <div class="modal-group">
      <h4 class="modal-group-title"><i class="lucide-info"></i> Thông tin cơ bản</h4>
      <div class="grid2">
        <div>
          <label>Mã hàng</label>
          <input v-model="quoteEdit.Ma_hang" readonly />
        </div>
        <div>
          <label>Tên hàng</label>
          <input v-model="quoteEdit.Ten_hang" readonly />
        </div>
      </div>

    <div class="grid3">
      <div>
        <label>Số lượng</label>
        <input
          type="number"
          v-model.number="quoteEdit.So_luong"
          @input="ensureNumberField(quoteEdit, 'So_luong')"
          min="1"
        />
      </div>

      <div>
        <label>VAT (%)</label>
        <input
          type="number"
          v-model.number="quoteEdit.Thue_VAT"
          @input="ensureNumberField(quoteEdit, 'Thue_VAT')"
          min="0"
        />
      </div>

      <div>
        <label>Đơn vị (ĐVT)</label>
        <input v-model="quoteEdit.DVT" readonly />
      </div>
    </div>

    <div class="grid3">
      <div>
        <label>Đơn vị tiền tệ</label>
        <input v-model="quoteEdit.Don_vi_tien_te" readonly />
      </div>

      <div>
        <label>Tỉ giá</label>
        <input
          type="number"
          v-model.number="quoteEdit.Ti_gia"
          @input="ensureNumberField(quoteEdit, 'Ti_gia')"
          min="0"
        />
      </div>

      <div>
        <label>Giá Lic ({{ quoteEdit.Don_vi_tien_te || 'VND' }})</label>
        <input
          type="number"
          v-model.number="quoteEdit.Don_gia"
          @input="ensureNumberField(quoteEdit, 'Don_gia')"
          min="0"
        />
      </div>
    </div>
    </div> <!-- close modal-group for thong tin co ban -->

    <div class="modal-group">
      <h4 class="modal-group-title"><i class="lucide-align-left"></i> Mô tả & Tính năng</h4>
      <div class="grid3">
        <div>
          <label>Mô tả chung</label>
          <textarea v-model="quoteEdit.Mo_ta_chung" rows="2" placeholder="Nhập mô tả chung..."></textarea>
        </div>
        <div>
          <label>Mô tả chi tiết</label>
          <textarea v-model="quoteEdit.Mo_ta_chi_tiet" rows="2" placeholder="Nhập mô tả chi tiết..."></textarea>
        </div>
        <div>
          <label>Tính năng / Features</label>
          <textarea v-model="quoteEdit.Features" rows="2" placeholder="Nhập tính năng..."></textarea>
        </div>
      </div>
    </div>

    <div class="modal-group">
      <h4 class="modal-group-title"><i class="lucide-dollar-sign"></i> Giá gốc & Chiết khấu</h4>
      <div class="grid3">
        <div>
          <label>Giá Hardware</label>
          <input type="number" v-model.number="quoteEdit.gia_hardware" @input="ensureNumberField(quoteEdit, 'gia_hardware')" min="0" />
        </div>
        <div>
          <label>Giá Nhập</label>
          <input type="number" v-model.number="quoteEdit.gia_nhap" @input="ensureNumberField(quoteEdit, 'gia_nhap')" min="0" />
        </div>
        <div>
          <label>Mức % Off</label>
          <input type="number" v-model.number="quoteEdit.muc_phan_tram_off" @input="ensureNumberField(quoteEdit, 'muc_phan_tram_off')" min="0" />
        </div>
      </div>
    </div>
    <!-- preview tính toán -->
    <div class="totals">
      <div class="mini"><b>Tổng giá thực tế:</b> {{ formatVND(tongGiaThucTe) }}</div>
      <div class="mini"><b>Trước thuế:</b> {{ formatVND(lineTruocThue(quoteEdit)) }}</div>
      <div class="mini"><b>VAT:</b> {{ formatVND(lineVAT(quoteEdit)) }}</div>
      <div class="mini"><b>Sau thuế:</b> {{ formatVND(lineSauThue(quoteEdit)) }}</div>
      <div class="mini">
        <b>Lợi nhuận:</b> {{ formatVND(lineLoiNhuan(quoteEdit)) }}
        <span class="muted" v-if="lineLoiNhuanPct(quoteEdit)"> ({{ lineLoiNhuanPct(quoteEdit) }}%)</span>
      </div>
    </div>

    <div class="modal-actions">
      <button class="primary" @click="saveQuoteEdit()">Lưu</button>
      <button @click="closeQuoteEdit()">Hủy</button>
      <button class="btn-del" @click="removeSelected(quoteEditIdx)"><i class="lucide-trash-2"></i> Xóa item</button>
    </div>
  </div>
</div>

    <!-- ================== MODAL: CHỈNH SỬA ITEM BÁO GIÁ GỐC ================== -->
<div v-if="showQuoteEditRawModal && quoteEditRaw" class="modal" @click.self="closeQuoteEditRaw()">
  <div class="modal-card modal-wide">
    <div class="modal-head">
      <h3><i class="lucide-pencil"></i> Chỉnh sửa hàng trong báo giá gốc</h3>
      <button class="x" @click="closeQuoteEditRaw()">✕</button>
    </div>

    <div class="modal-group">
      <h4 class="modal-group-title"><i class="lucide-info"></i> Thông tin cơ bản</h4>
      <div class="grid2">
        <div>
          <label>Mã hàng</label>
          <input v-model="quoteEditRaw.Ma_hang" readonly />
        </div>
        <div>
          <label>Tên hàng</label>
          <input v-model="quoteEditRaw.Ten_hang" readonly />
        </div>
      </div>

    <div class="grid3">
      <div>
        <label>Số lượng</label>
        <input type="number" :value="quoteEditRaw.So_luong" readonly />
      </div>

      <div>
        <label>VAT gốc (%)</label>
        <input
          type="number"
          v-model.number="quoteEditRaw._Thue_VAT_goc"
          @input="ensureNumberField(quoteEditRaw, '_Thue_VAT_goc')"
          min="0"
        />
      </div>

      <div>
        <label>Đơn vị (ĐVT)</label>
        <input v-model="quoteEditRaw.DVT" readonly />
      </div>
    </div>

    <div class="grid3">
      <div>
        <label>Đơn vị tiền tệ</label>
        <input v-model="quoteEditRaw.Don_vi_tien_te" readonly />
      </div>

      <div>
        <label>Tỉ giá gốc</label>
        <input
          type="number"
          v-model.number="quoteEditRaw._Ti_gia_goc"
          @input="ensureNumberField(quoteEditRaw, '_Ti_gia_goc')"
          min="0"
        />
      </div>

      <div>
        <label>Giá Lic gốc ({{ (quoteEditRaw.Don_vi_tien_te || 'VND') }})</label>
        <input
          type="number"
          v-model.number="quoteEditRaw._Don_gia_goc"
          @input="ensureNumberField(quoteEditRaw, '_Don_gia_goc')"
          min="0"
        />
      </div>
    </div>
    </div> <!-- close modal-group for thong tin co ban -->

    <div class="modal-group">
      <h4 class="modal-group-title"><i class="lucide-align-left"></i> Mô tả & Tính năng</h4>
      <div class="grid3">
        <div>
          <label>Mô tả chung</label>
          <textarea v-model="quoteEditRaw.Mo_ta_chung" rows="2" placeholder="Nhập mô tả chung..."></textarea>
        </div>
        <div>
          <label>Mô tả chi tiết</label>
          <textarea v-model="quoteEditRaw.Mo_ta_chi_tiet" rows="2" placeholder="Nhập mô tả chi tiết..."></textarea>
        </div>
        <div>
          <label>Tính năng / Features</label>
          <textarea v-model="quoteEditRaw.Features" rows="2" placeholder="Nhập tính năng..."></textarea>
        </div>
      </div>
    </div>

    <div class="modal-group">
      <h4 class="modal-group-title"><i class="lucide-dollar-sign"></i> Giá gốc & Chiết khấu</h4>
      <div class="grid3">
        <div>
          <label>Giá Hardware gốc</label>
          <input type="number" v-model.number="quoteEditRaw._gia_hardware_goc" @input="ensureNumberField(quoteEditRaw, '_gia_hardware_goc')" min="0" />
        </div>
        <div>
          <label>Giá Nhập gốc</label>
          <input type="number" v-model.number="quoteEditRaw._gia_nhap_goc" @input="ensureNumberField(quoteEditRaw, '_gia_nhap_goc')" min="0" />
        </div>
        <div>
          <label>Mức % Off gốc</label>
          <input type="number" v-model.number="quoteEditRaw._muc_phan_tram_off_goc" @input="ensureNumberField(quoteEditRaw, '_muc_phan_tram_off_goc')" min="0" />
        </div>
      </div>
    </div>

    <div class="totals">
      <div class="mini"><b>Trước thuế:</b> {{ formatVND(lineTruocThueRaw(quoteEditRaw)) }}</div>
      <div class="mini"><b>VAT:</b> {{ formatVND(lineVATRaw(quoteEditRaw)) }}</div>
      <div class="mini"><b>Sau thuế:</b> {{ formatVND(lineSauThueRaw(quoteEditRaw)) }}</div>
      <div class="mini">
        <b>Lợi nhuận:</b> {{ formatVND(lineLoiNhuanRaw(quoteEditRaw)) }}
        <span class="muted" v-if="lineLoiNhuanPctRaw(quoteEditRaw)"> ({{ lineLoiNhuanPctRaw(quoteEditRaw) }}%)</span>
      </div>
    </div>

    <div class="modal-actions">
      <button class="primary" @click="saveQuoteEditRaw()">Lưu</button>
      <button @click="closeQuoteEditRaw()">Hủy</button>
      <button class="btn-del" @click="removeSelected(quoteEditRawIdx)"><i class="lucide-trash-2"></i> Xóa item</button>
    </div>
  </div>
</div>

    <!-- ================== MODAL: LOAD HÓA ĐƠN / HỢP ĐỒNG ================== -->
<div v-if="showLoadInvoiceModal" class="modal" @click.self="showLoadInvoiceModal = false">
  <div class="modal-card" style="width:min(560px,96vw)">
    <div class="modal-head">
      <h3><i class="lucide-download"></i> Load hóa đơn / hợp đồng</h3>
      <button class="x" @click="showLoadInvoiceModal = false">✕</button>
    </div>

    <div class="grid3">
      <div>
        <label>Khách hàng (Tùy chọn)</label>
        <input 
          v-model="loadCustomerFilter" 
          list="dl-load-customers" 
          placeholder="Nhập tên/mã KH để lọc..."
        />
        <datalist id="dl-load-customers">
          <option v-for="c in customers" :key="c.Ma_khach_hang" :value="c.Ten_khach_hang">
            {{ c.Ten_khach_hang }} ({{ c.Ma_khach_hang }})
          </option>
        </datalist>
      </div>

      <div>
        <label>Chọn theo</label>
        <select v-model="loadMode">
          <option value="SO">Số hợp đồng</option>
          <option value="MA">Mã hợp đồng</option>
        </select>
      </div>

      <div>
        <label>{{ loadMode === 'SO' ? 'Nhập/chọn Số hợp đồng' : 'Nhập/chọn Mã hợp đồng' }}</label>

        <input
          v-model="loadKey"
          :list="loadMode === 'SO' ? 'dl-so-hd' : 'dl-ma-hd'"
          placeholder="Chọn từ danh sách hoặc nhập tay..."
        />

<datalist id="dl-so-hd">
  <option
    v-for="r in filteredContractsForLoad"
    :key="'so-' + r[1]"
    :value="String(r?.[1] ?? '').trim()"
  >
    [{{ String(r?.[2] ?? '').trim() }}] {{ String(r?.[3] ?? '').trim() }} | Số HĐ: {{ String(r?.[1] ?? '').trim() }} | Mã HĐ: {{ String(r?.[0] ?? '').trim() }}
  </option>
</datalist>


<datalist id="dl-ma-hd">
  <option
    v-for="r in filteredContractsForLoad"
    :key="'ma-' + r[0]"
    :value="String(r?.[0] ?? '').trim()"
  >
    [{{ String(r?.[2] ?? '').trim() }}] {{ String(r?.[3] ?? '').trim() }} | Mã HĐ: {{ String(r?.[0] ?? '').trim() }} | Số HĐ: {{ String(r?.[1] ?? '').trim() }}
  </option>
</datalist>


      </div>
    </div>

    <p v-if="loadMsg" class="muted" style="margin-top:6px">{{ loadMsg }}</p>

    <div class="modal-actions">
      <button class="primary" :disabled="loadingInvoice" @click="loadInvoiceToFE">
        {{ loadingInvoice ? 'Đang load...' : 'Load vào FE' }}
      </button>
      <button @click="showLoadInvoiceModal = false">Đóng</button>
    </div>
  </div>
</div>


<!-- ================== MODAL: CHỌN SỐ HỢP ĐỒNG SO SÁNH ================== -->
<div v-if="showPickCompareModal" class="modal" @click.self="showPickCompareModal = false">
  <div class="modal-card" style="width:min(520px,96vw)">
    <div class="modal-head">
      <h3><i class="lucide-bar-chart-3"></i> Chọn SỐ hợp đồng để so sánh</h3>
      <button class="x" @click="showPickCompareModal = false">✕</button>
    </div>

    <label>Số hợp đồng</label>
    <input
      v-model="pickCompareSo"
      list="dl-compare-so"
      placeholder="VD: HĐ9"
    />

    <datalist id="dl-compare-so">
      <option
        v-for="r in filteredContractsForLoad"
        :key="'cmp-' + r[1]"
        :value="String(r?.[1] ?? '').trim()"
      >
        {{ String(r?.[1] ?? '').trim() }}
        -
        {{ String(r?.[0] ?? '').trim() }}
        -
        {{ String(r?.[IDX_TIME] ?? '').trim() }}
      </option>
    </datalist>

    <div class="modal-actions">
      <button
        class="primary"
        :disabled="!pickCompareSo"
        @click="
          compareSoHopDong = pickCompareSo;
          loadCompareBySoHopDong(pickCompareSo);
          showPickCompareModal = false;
          showCompareModal = true;
        "
      >
        So sánh
      </button>
      <button @click="showPickCompareModal = false">Hủy</button>
    </div>
  </div>
</div>

<!-- ================== MODAL: BẢNG SO SÁNH ================== -->
<div v-if="showCompareModal" class="modal" @click.self="showCompareModal = false">
  <div class="modal-card modal-wide">
    <div class="modal-head">
      <h3><i class="lucide-bar-chart-3"></i> So sánh hợp đồng – {{ compareSoHopDong }}</h3>
      <button class="x" @click="showCompareModal = false">✕</button>
    </div>

    <!-- ===== TỔNG HÓA ĐƠN ===== -->
   <h4>🔹 So sánh tổng hóa đơn (theo mã hợp đồng)</h4>

<table>
  <thead>
    <tr>
      <th>Mã hợp đồng</th>
      <th class="right">Tổng trước thuế</th>
      <th class="right">Tổng tiêu chuẩn</th>
      <th class="right">Chênh lệch</th>
      <th class="right">%</th>
    </tr>
  </thead>

  <tbody>
    <tr v-for="r in compareByContract" :key="r.Ma_hop_dong">
      <td>{{ r.Ma_hop_dong }}</td>

      <td class="right">{{ formatVND(r.truoc) }}</td>
      <td class="right">{{ formatVND(r.tieuChuan) }}</td>

      <td
        class="right"
        :style="{ color: r.diff >= 0 ? 'green' : 'red' }"
      >
        {{ formatVND(r.diff) }}
      </td>

      <td class="right">{{ r.pct.toFixed(2) }}%</td>
    </tr>
  </tbody>
</table>




    <hr />

    <!-- ===== THEO MÃ HÀNG ===== -->
   
   <h4>🔹 So sánh mã hàng </h4>

<table>
  <thead>
    <tr>
      <th>Mã hàng</th>
      <th>Tên hàng</th>
      <th v-for="maHD in compareMaHopDongs" :key="maHD">
        {{ maHD }}
      </th>
    </tr>
  </thead>

  <tbody>
    <tr v-for="r in compareMatrix" :key="r.Ma_hang">
      <td>{{ r.Ma_hang }}</td>
      <td>{{ r.Ten_hang }}</td>

      <td
        v-for="maHD in compareMaHopDongs"
        :key="maHD"
        class="right"
        :style="{
          color: r.byHD[maHD]?.diff >= 0 ? 'green' : 'red'
        }"
      >
        <template v-if="r.byHD[maHD]">
          {{ formatVND(r.byHD[maHD].diff) }}
          <span class="muted">
            ({{ r.byHD[maHD].pct.toFixed(2) }}%)
          </span>
        </template>
        <template v-else>—</template>
      </td>
    </tr>
  </tbody>
</table>


    <div class="modal-actions">
      <button class="primary" @click="showCompareModal = false">Đóng</button>
    </div>
  </div>
</div>

    <!-- ================== MODAL: CHỌN KIỂU LƯU HỢP ĐỒNG ================== -->
    <div v-if="showSaveModal" class="modal" @click.self="showSaveModal = false">
      <div class="modal-card modal-wide">
        <div class="modal-head">
          <h3>💾 Thông tin Khách hàng & Lưu hợp đồng</h3>
          <button class="x" @click="showSaveModal = false">✕</button>
        </div>
        
        <div class="grid2">
          <!-- Left Column: Customer Selection -->
          <div>
            <label>Mã khách hàng</label>
            <input
              v-model="maKHInput"
              list="dl-ma-kh-modal"
              placeholder="Chọn / nhập mã KH"
              @change="fillCustomerByMa(maKHInput)"
              @blur="onBlurMaKH"
            />
            <datalist id="dl-ma-kh-modal">
              <option v-for="k in customers" :key="k.Ma_khach_hang" :value="k.Ma_khach_hang" />
            </datalist>

            <label>Tên khách hàng</label>
            <input
              v-model="tenKHInput"
              list="dl-ten-kh-modal"
              placeholder="Chọn / nhập tên KH"
              @change="fillCustomerByTen(tenKHInput)"
              @blur="onBlurTenKH"
            />
            <datalist id="dl-ten-kh-modal">
              <option v-for="k in customers" :key="k.Ma_khach_hang + '_' + k.Ten_khach_hang" :value="k.Ten_khach_hang" />
            </datalist>

            <label>Trạng thái</label>
            <input v-model="khach.Trang_thai" placeholder="Trạng thái" />

            <label>Công nợ chưa thanh toán</label>
            <input v-model="khach.Cong_no_chua_thanh_toan" placeholder="Công nợ" />

            <label>Ghi chú</label>
            <textarea v-model="khach.Ghi_chu" placeholder="Ghi chú" />
            
            <button @click="resetCustomer" style="margin-top: 10px;">Reset khách</button>
          </div>

          <!-- Right Column: Customer Info -->
          <div>
            <div class="grid2">
              <div>
                <label>Email cá nhân</label>
                <input v-model="khach.Email_ca_nhan" placeholder="Email cá nhân" />
              </div>
              <div>
                <label>Số điện thoại cá nhân</label>
                <input v-model="khach.So_dien_thoai_ca_nhan" placeholder="SĐT cá nhân" />
              </div>
            </div>

            <div class="grid2">
              <div>
                <label>Mã công ty</label>
                <input v-model="khach.Ma_cong_ty" placeholder="Mã công ty" />
              </div>
              <div>
                <label>Tên công ty</label>
                <input v-model="khach.Ten_cong_ty" placeholder="Tên công ty" />
              </div>
            </div>

            <div class="grid2">
              <div>
                <label>SĐT công ty</label>
                <input v-model="khach.So_dien_thoai_cong_ty" placeholder="SĐT công ty" />
              </div>
              <div>
                <label>Số fax công ty</label>
                <input v-model="khach.So_fax_cong_ty" placeholder="Fax công ty" />
              </div>
            </div>

            <label>Địa chỉ công ty</label>
            <input v-model="khach.Dia_chi_cong_ty" placeholder="Địa chỉ công ty" />

            <div class="grid2">
              <div>
                <label>Email công ty</label>
                <input v-model="khach.Email_cong_ty" placeholder="Email công ty" />
              </div>
              <div>
                <label>Website công ty</label>
                <input v-model="khach.Website_cong_ty" placeholder="Website công ty" />
              </div>
            </div>
          </div>
        </div>

        <hr style="margin: 20px 0;" />
        <p style="text-align: center; margin-bottom: 15px;">Vui lòng kiểm tra kỹ thông tin khách hàng trước khi lưu.</p>

        <div class="modal-actions" style="justify-content: center; gap: 12px;">
          <button 
            @click="() => { showSaveModal = false; saveContractTemp(); }"
          >
            Lưu hợp đồng tạm
          </button>
          
          <button 
            class="primary" 
            @click="() => { showSaveModal = false; saveContractOfficial(); }"
          >
            Lưu hợp đồng chính thức
          </button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL: XUẤT EXCEL ================== -->
    <div v-if="showExportExcelModal" class="modal" @click.self="showExportExcelModal = false">
      <div class="modal-card modal-wide">
        <div class="modal-head">
          <h3><i class="lucide-file-spreadsheet"></i> Chọn khách hàng & Xuất Excel</h3>
          <button class="x" @click="showExportExcelModal = false">✕</button>
        </div>
        
        <div class="grid2">
          <div>
            <label>Mã khách hàng</label>
            <input
              v-model="maKHInput"
              list="dl-ma-kh-export"
              placeholder="Chọn / nhập mã KH"
              @change="fillCustomerByMa(maKHInput)"
              @blur="onBlurMaKH"
            />
            <datalist id="dl-ma-kh-export">
              <option v-for="k in customers" :key="k.Ma_khach_hang" :value="k.Ma_khach_hang" />
            </datalist>

            <label>Tên khách hàng</label>
            <input
              v-model="tenKHInput"
              list="dl-ten-kh-export"
              placeholder="Chọn / nhập tên KH"
              @change="fillCustomerByTen(tenKHInput)"
              @blur="onBlurTenKH"
            />
            <datalist id="dl-ten-kh-export">
              <option v-for="k in customers" :key="k.Ma_khach_hang + '_' + k.Ten_khach_hang" :value="k.Ten_khach_hang" />
            </datalist>
            <label style="margin-top: 16px; display: block;">Chọn Điều khoản thương mại</label>
            <select v-model="selectedTermId" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; color: #1e293b; margin-bottom: 12px;">
              <option value="">-- Dùng điều khoản mặc định (trong mẫu Excel) --</option>
              <option v-for="t in contractTerms" :key="t.id" :value="t.id">
                {{ t.mau ? `[${t.mau}] ${t.tenCT || t.tenKH || 'Mẫu chung'}` : (t.tenCT || t.tenKH || 'Điều khoản chưa đặt tên') }}
              </option>
            </select>
            
          </div>
          <div>
            <label>Kính gởi (Tên công ty)</label>
            <input v-model="khach.Ten_cong_ty" readonly />
            <label>Địa chỉ</label>
            <input v-model="khach.Dia_chi_cong_ty" readonly />
            <label>Người nhận</label>
            <input v-model="khach.Ten_khach_hang" readonly />
          </div>
        </div>

        <div v-if="selectedTermId" class="term-preview" style="margin-top: 16px;">
          <label>Chỉnh sửa nội dung điều khoản (chỉ cho báo giá này):</label>
          <ExcelEditor v-model="editableTermContent" class="preview-editor" style="margin-top: 8px;" />
        </div>

        <div class="modal-actions">
          <button class="primary action-success" @click="exportQuoteExcel(); showExportExcelModal = false">
            <i class="lucide-file-spreadsheet"></i> Xác nhận Xuất Excel
          </button>
          <button @click="showExportExcelModal = false">Hủy</button>
        </div>
      </div>
    </div>

    <!-- VÙNG ẨN DÙNG CHUYÊN CHO IN PDF -->
    <div class="print-only">
      <table class="pdf-table">
        <thead>
          <tr>
            <th style="width: 5%">STT</th>
            <th style="width: 15%">TÊN HÀNG HÓA</th>
            <th style="width: 25%">DIỄN GIẢI</th>
            <th style="width: 5%">DVT</th>
            <th style="width: 5%">S.L</th>
            <th style="width: 10%">ĐƠN GIÁ (VND)</th>
            <th style="width: 11%">THÀNH TIỀN TRƯỚC THUẾ</th>
            <th style="width: 9%">THUẾ VAT</th>
            <th style="width: 15%">THÀNH TIỀN SAU THUẾ</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(r, idx) in quoteRowsWithSTT" :key="idx">
            <tr v-if="r.type === 'group'" class="pdf-group-row">
              <td></td>
              <td colspan="8" class="text-left"><strong>{{ r.title.toUpperCase() }}</strong></td>
            </tr>
            <tr v-else>
              <td class="text-center">{{ r.stt }}</td>
              <td><strong>{{ r.item.Ten_hang }}</strong></td>
              <td style="white-space: pre-wrap;" class="text-left">{{ [r.item.Mo_ta_chung, r.item.Mo_ta_chi_tiet, r.item.Features].filter(Boolean).join('\n') }}</td>
              <td class="text-center">{{ r.item.DVT }}</td>
              <td class="text-center">{{ r.item.So_luong }}</td>
              <td class="text-right">{{ formatVND(unitPrice(r.item)).replace(' ₫', '') }}</td>
              <td class="text-right">{{ formatVND(lineTruocThue(r.item)).replace(' ₫', '') }}</td>
              <td class="text-right">{{ formatVND(lineVAT(r.item)).replace(' ₫', '') }}</td>
              <td class="text-right">{{ formatVND(lineSauThue(r.item)).replace(' ₫', '') }}</td>
            </tr>
          </template>
          
          <tr class="pdf-total-row">
            <td colspan="6" class="text-center"><strong>TỔNG CỘNG + THUẾ</strong></td>
            <td class="text-right"><strong>{{ formatVND(totals.truoc).replace(' ₫', '') }}</strong></td>
            <td class="text-right"><strong>{{ formatVND(totals.vat).replace(' ₫', '') }}</strong></td>
            <td class="text-right"><strong>{{ formatVND(totals.sau).replace(' ₫', '') }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

/* ===== RESET & SCROLLBAR ===== */
*, *::before, *::after { box-sizing: border-box; }
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #64748b; }

/* ===== PAGE ===== */
.page {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  padding: 12px;
  background: #f1f5f9;
  min-height: 100vh;
  color: #1e293b;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: hidden;
}

/* ===== MAIN GRID ===== */
.main-grid {
  display: flex;
  gap: 12px;
  width: 100%;
  position: relative;
  align-items: start;
  overflow: hidden;
}

/* ===== SIDEBAR ===== */
.sidebar {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
  position: sticky;
  top: 12px;
  height: calc(100vh - 24px);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 300px;
  min-width: 300px;
  overflow: hidden;
}
.sidebar-left { transition: margin-left .25s ease, opacity .25s ease; }
.sidebar-right { transition: margin-right .25s ease, opacity .25s ease; overflow-y: auto; }
.sidebar-left.closed { margin-left: -312px; opacity: 0; pointer-events: none; }
.sidebar-right.closed { margin-right: -312px; opacity: 0; pointer-events: none; }

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.sidebar-head h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.icon-btn {
  width: 28px; height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #94a3b8;
  font-size: 12px;
  padding: 0;
  transition: all .15s;
}
.icon-btn:hover { background: #f1f5f9; color: #0f172a; }

/* ===== LUCIDE ICONS ===== */
[class^="lucide-"], [class*=" lucide-"] {
  font-size: 15px;
  vertical-align: -2px;
  margin-right: 2px;
}
h3 [class^="lucide-"] {
  font-size: 16px;
  vertical-align: -3px;
  margin-right: 4px;
  opacity: 0.85;
}
.totals-icon [class^="lucide-"] {
  font-size: 14px;
  margin-right: 0;
  vertical-align: 0;
}

/* ===== RIGHT SIDEBAR CONTRACT ===== */
.sidebar-head-contract {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  margin: -16px -16px 14px;
  padding: 14px 16px;
  border-radius: 16px 16px 0 0;
}
.sidebar-head-contract h3 {
  color: #f1f5f9 !important;
  font-size: 14px !important;
}
.sidebar-head-contract .icon-btn {
  color: #94a3b8;
}
.sidebar-head-contract .icon-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}
.contract-section {
  margin-bottom: 14px;
}
.section-label {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.section-label [class^="lucide-"] {
  font-size: 13px;
  color: #64748b;
  vertical-align: 0;
  margin-right: 0;
}
.contract-fields {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-group label {
  margin-top: 0;
  margin-bottom: 2px;
}
.contract-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  margin: 14px 0;
}
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 12px 8px !important;
  border-radius: 10px !important;
  font-size: 11px !important;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  transition: all 0.2s;
  line-height: 1.2;
  text-align: center;
  width: 100%;
}
.action-btn [class^="lucide-"] {
  font-size: 18px;
  margin-right: 0;
  vertical-align: 0;
}
.action-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.action-btn:disabled {
  opacity: 0.4;
  transform: none !important;
  box-shadow: none !important;
}
.action-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  color: white !important;
  border-color: transparent !important;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}
.action-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
}
.action-success {
  background: linear-gradient(135deg, #22c55e, #16a34a) !important;
  color: white !important;
  border-color: transparent !important;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.2);
}
.action-success:hover {
  background: linear-gradient(135deg, #16a34a, #15803d) !important;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3) !important;
}
.action-save {
  grid-column: 1 / -1;
  flex-direction: row !important;
  padding: 10px 16px !important;
  background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
  color: white !important;
  border-color: transparent !important;
  box-shadow: 0 2px 8px rgba(109, 40, 217, 0.2);
}
.action-save:hover {
  background: linear-gradient(135deg, #6d28d9, #5b21b6) !important;
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.3) !important;
}
.save-msg {
  font-size: 11.5px;
  color: #64748b;
  margin: 6px 0 0;
  padding: 6px 10px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}
.action-utils {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.util-btn {
  width: 100%;
  padding: 9px 14px !important;
  font-size: 12px !important;
  font-weight: 500;
  background: #fff;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px !important;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
}
.util-btn [class^="lucide-"] {
  font-size: 14px;
  color: #94a3b8;
  margin-right: 0;
}
.util-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}
.util-btn:hover [class^="lucide-"] {
  color: #3b82f6;
}


/* ===== MODAL GROUPS ===== */
.modal-group {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}
.modal-group-title {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  margin-top: 0;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
}
.modal-group-title [class^="lucide-"] {
  font-size: 14px;
  color: #3b82f6;
}
/* ===== OPEN TABS ===== */
.open-tab {
  position: fixed; top: 90px; z-index: 9991;
  padding: 8px 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: #fff;
  cursor: pointer;
  font-weight: 600; font-size: 12px;
  box-shadow: 0 4px 12px -2px rgba(79, 70, 229, 0.3);
  width: auto;
}
.open-tab:hover { transform: translateY(-2px); box-shadow: 0 8px 16px -2px rgba(79, 70, 229, 0.4); }
.open-tab.left { left: 12px; }
.open-tab.right { right: 12px; }

/* ===== CENTER COLUMN ===== */
.quote-center {
  flex: 1;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  height: calc(100vh - 24px) !important;
  overflow: hidden !important;
  min-width: 0; /* KEY: prevents grid blowout */
}

/* ===== FORMS ===== */
label {
  display: block;
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  margin: 8px 0 3px;
  text-transform: uppercase;
  letter-spacing: .03em;
}
input, textarea, select {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 4px;
  font-size: 13px;
  font-family: inherit;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background-color: #f8fafc;
  color: #334155;
  box-sizing: border-box;
  transition: all .2s;
}
input:focus, textarea:focus, select:focus {
  border-color: #6366f1;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  outline: none;
}
textarea { min-height: 60px; resize: both; }

/* ===== BUTTONS ===== */
button {
  padding: 0.75rem 1.5rem;
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  margin-bottom: 6px;
  border-radius: 10px;
  border: none;
  background-color: #f1f5f9;
  cursor: pointer;
  color: #334155;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  line-height: 1.4;
}
button:hover { background-color: #e2e8f0; color: #0f172a; }
button:active { transform: translateY(0); }
button:disabled { opacity: .7; cursor: not-allowed; }

button.primary {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  box-shadow: 0 4px 12px -2px rgba(79, 70, 229, 0.3);
}
button.primary:hover { 
  background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -2px rgba(79, 70, 229, 0.4);
}

button.ghost {
  background-color: transparent;
  color: #475569;
  border: 1px solid #e2e8f0;
}
button.ghost:hover { background-color: #f8fafc; color: #0f172a; }

hr { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0; }

/* ===== TOP BAR ===== */
.top-bar {
  display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; flex-shrink: 0;
}
.sidebar-head-product {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  margin: -16px -16px 12px;
  padding: 14px 16px;
  border-radius: 16px 16px 0 0;
}
.sidebar-head-product h3 {
  color: #f1f5f9 !important;
  font-size: 14px !important;
}
.sidebar-head-product .icon-btn {
  color: #94a3b8;
}
.sidebar-head-product .icon-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}
.sidebar-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.product-count {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  letter-spacing: 0.3px;
}
.btn-manual {
  width: 100%;
  padding: 10px 16px !important;
  font-size: 13px !important;
}
.btn-icon {
  font-size: 15px;
  font-weight: 700;
}
.search-wrap {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  pointer-events: none;
  z-index: 1;
}
.search-input {
  padding-left: 34px !important;
}
.filter-select {
  font-size: 12.5px;
  color: #475569;
}

/* ===== PRODUCT GRID ===== */
.product-grid {
  display: flex; flex-direction: column; gap: 12px;
  overflow-y: auto; flex: 1; padding-right: 4px;
}
.product-grid::-webkit-scrollbar { width: 4px; }
.product-grid::-webkit-scrollbar-track { background: transparent; }
.product-grid::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.product-grid::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.card {
  border: 1px solid #e2e8f0;
  padding: 0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  display: flex; flex-direction: column;
  transition: all .2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  overflow: hidden;
}
.card:hover {
  border-color: #93c5fd;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}
.card-img-wrap {
  position: relative;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  padding: 12px;
}
.card-img-wrap img {
  width: 100%; height: 90px;
  object-fit: contain;
  border-radius: 6px;
  display: block;
}
.card-ncc-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #1e293b, #334155);
  color: #e2e8f0;
  font-size: 9.5px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-body {
  padding: 10px 14px 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}
.card h4 { margin: 0; font-size: 13px; font-weight: 600; color: #0f172a; line-height: 1.35; }
.clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.clamp1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.card-license {
  font-size: 11px;
  color: #64748b;
  margin: 0;
  font-style: italic;
}
.card-desc {
  font-size: 11.5px;
  color: #475569;
  margin: 0;
  line-height: 1.4;
}
.card-price-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 4px;
}
.price-unit {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 400;
}
.card-orig-price {
  font-size: 10.5px;
  color: #94a3b8;
  margin: 0;
}
.card-vat-badge {
  display: inline-block;
  width: fit-content;
  background: #f0fdf4;
  color: #15803d;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #bbf7d0;
  margin-top: 2px;
}
.muted { color: #64748b; font-size: 11.5px; margin: 0; }
.small { font-size: 11px; }
.price {
  font-weight: 700; color: #2563eb; font-size: 14px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin: 0;
}

/* Card footer with qty + add button */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 14px 12px;
  border-top: 1px solid #f1f5f9;
}
.qty {
  display: flex; align-items: center; gap: 0;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}
.qty button {
  width: 30px; height: 30px; padding: 0; margin: 0;
  border-radius: 0; background: #f8fafc;
  border: none;
  font-size: 14px; color: #475569;
  min-width: 30px;
  box-shadow: none;
}
.qty button:hover { background: #e2e8f0; color: #0f172a; transform: none; }
.qty span {
  font-weight: 600; font-size: 13px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-width: 28px; text-align: center;
  padding: 0 2px;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  height: 30px;
  line-height: 30px;
}
.btn-add {
  flex: 1;
  background: linear-gradient(135deg, #2563eb, #3b82f6) !important;
  color: white !important;
  font-weight: 600;
  padding: 7px 12px !important;
  font-size: 12px !important;
  border-radius: 8px !important;
  border: none;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
}
.btn-add:hover {
  background: linear-gradient(135deg, #1d4ed8, #2563eb) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
.btn-add-icon {
  font-size: 13px;
  font-weight: 700;
}

.btn-del {
  width: 28px; height: 28px; padding: 0;
  background: transparent; color: #94a3b8;
  border: none; border-radius: 6px;
  transition: all .2s; min-width: 28px;
  box-shadow: none;
}
.btn-del:hover { background: #fef2f2; color: #ef4444; transform: none; }

/* ===== TABLE WRAPPER ===== */
.quote-table-wrap {
  flex: 1;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.02), 0 4px 6px -4px rgba(0, 0, 0, 0.01);
  border: 1px solid #f1f5f9;
  overflow: auto; /* horizontal + vertical scroll inside */
  margin-bottom: 12px;
  min-height: 0; /* flex child shrink */
}
.table-header-box {
  padding: 14px 16px 10px;
  position: sticky; top: 0; left: 0;
  background: #fff;
  z-index: 3;
  margin-bottom: 0;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}
.table-header-box h3 { font-size: 14px; color: #0f172a; }
.table-header-box .hint, .hint {
  font-size: 11.5px; color: #64748b; font-weight: 400;
}
.header-contract-info {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 4px 0 2px;
}
.contract-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #1e3a5f, #0f172a);
  color: #e2e8f0;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
}
.contract-badge b {
  color: #38bdf8;
  font-weight: 700;
}

/* ===== TABLE ===== */
table {
  width: 100%;
  min-width: 1200px;
  border-collapse: collapse;
  font-size: 12.5px;
  table-layout: fixed; /* KEY: fixed layout for predictable column widths */
}
th, td {
  padding: 12px 10px;
  vertical-align: top;
  border-bottom: 1px solid #f1f5f9;
  white-space: normal;
  word-break: break-word;
  line-height: 1.45;
}
td { color: #334155; }

/* Description column: allow wrap but clamp height */
td.desc {
  white-space: normal;
  overflow: hidden;
  color: #475569;
  font-size: 11.5px;
  line-height: 1.5;
  max-height: 72px; /* ~4 lines max */
  position: relative;
}
td.desc .preline {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-line;
  font-size: 11.5px;
  line-height: 1.5;
}
td.desc .preline > div { margin-bottom: 2px; }

thead th {
  position: sticky; top: 45px;
  background-color: #0f172a;
  color: #f8fafc;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #1e293b;
  z-index: 2;
  white-space: normal;
  line-height: 1.3;
  vertical-align: middle;
  padding: 10px;
}

/* Zebra + Hover */
tbody tr.quote-item-row:nth-child(even) { background: #fafafa; }
tbody tr.quote-item-row { cursor: pointer; transition: background .1s; }
tbody tr.quote-item-row:hover td { background-color: #f8fafc; }

.right {
  text-align: right;
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
}
.center {
  text-align: center;
  font-size: 12px;
}
.nowrap { white-space: normal; }
td.dvt { font-family: inherit; white-space: normal; }

/* ===== GROUP ROW ===== */
.group-row td {
  background: #eff6ff;
  border-bottom: 1px solid #bfdbfe;
  font-weight: 600; color: #1e40af; font-size: 12.5px;
}
.group-stt { text-align: center; }
.group-title { padding-left: 12px; text-align: left; }

/* ===== COLUMN WIDTHS (table-layout: fixed) ===== */
.col-stt  { width: 36px; text-align: center; }
.col-pn   { width: 80px; }
.col-name { width: 130px; }
.col-desc { width: 220px; } /* wider for description */
.col-hang { width: 70px; }
.col-sl   { width: 36px; text-align: center; }
.col-dvt  { width: 55px; }
.col-dg   { width: 100px; text-align: right; }
.col-tt   { width: 105px; text-align: right; }
.col-vat  { width: 40px; text-align: center; }
.col-loi  { width: 110px; text-align: right; color: #059669; }
.col-del  { width: 36px; text-align: center; }

/* Cell Input */
.cell-input {
  width: 100%; padding: 5px 7px;
  border-radius: 6px; border: 1px solid #cbd5e1;
  font-size: 12px;
  margin: 0; box-sizing: border-box; background: #fff;
}
.cell-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }

/* ===== TOTALS ===== */
.bottom-totals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex-shrink: 0;
  padding: 0 4px;
}
.totals-box {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -2px rgba(15, 23, 42, 0.04);
  transition: box-shadow 0.2s ease;
}
.totals-box:hover {
  box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.1), 0 4px 10px -4px rgba(15, 23, 42, 0.06);
}
.totals-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #334155, #1e293b);
  color: #f1f5f9;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  letter-spacing: 0.3px;
}
.totals-header-primary {
  background: linear-gradient(135deg, #1e3a5f, #0c4a6e);
}
.totals-icon {
  font-size: 15px;
  line-height: 1;
}
.totals-body {
  padding: 4px 0;
}
.totals-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 16px;
  font-size: 12.5px;
  transition: background 0.15s ease;
  border-bottom: 1px solid #f8fafc;
}
.totals-row:last-child {
  border-bottom: none;
}
.totals-row:hover {
  background: #f8fafc;
}
.totals-label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: #64748b;
}
.totals-value {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: #1e293b;
  text-align: right;
  letter-spacing: 0.2px;
}
.totals-value small {
  font-weight: 400;
  font-size: 11px;
  color: #94a3b8;
  margin-left: 4px;
}
.totals-value.text-warn {
  color: #d97706;
}
/* Highlighted total rows */
.totals-highlight {
  background: linear-gradient(90deg, #fffbeb, #fef3c7);
  border-bottom: none !important;
  margin-top: 2px;
  border-top: 1px dashed #f59e0b;
}
.totals-highlight .totals-label {
  font-weight: 700;
  color: #92400e;
  font-size: 12.5px;
}
.totals-highlight .totals-value {
  font-weight: 700;
  color: #b45309;
  font-size: 14px;
}
.totals-highlight-blue {
  background: linear-gradient(90deg, #eff6ff, #dbeafe);
  border-bottom: none !important;
  margin-top: 2px;
  border-top: 1px dashed #3b82f6;
}
.totals-highlight-blue .totals-label {
  font-weight: 700;
  color: #1e40af;
  font-size: 12.5px;
}
.totals-highlight-blue .totals-value {
  font-weight: 700;
  color: #1d4ed8;
  font-size: 14px;
}
.totals-highlight-green {
  background: linear-gradient(90deg, #ecfdf5, #d1fae5);
  border-bottom: none !important;
}
.totals-highlight-green .totals-label {
  font-weight: 700;
  color: #065f46;
  font-size: 12.5px;
}
.totals-highlight-green .totals-value {
  font-weight: 700;
  color: #059669;
  font-size: 14px;
}

/* ===== MODAL ===== */
.modal {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.4);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 20px;
  animation: fadeIn .2s ease forwards;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.modal-card {
  background: white; color: #1e293b;
  padding: 24px; width: 580px;
  max-height: 90vh; overflow: auto;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05);
  animation: slideUp 0.3s cubic-bezier(.16,1,.3,1) forwards;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-card.modal-wide { width: min(1200px, 96vw); }
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}
.modal-head h3 { margin: 0; font-size: 16px; font-weight: 700; color: #0f172a; }
.modal-head .x {
  width: 32px; height: 32px;
  border-radius: 50%; background: #f1f5f9;
  border: none; font-size: 14px; padding: 0;
  color: #64748b;
}
.modal-head .x:hover { background: #e2e8f0; color: #0f172a; transform: rotate(90deg); }

.preview {
  width: 100%; height: 200px; object-fit: contain;
  background: #f8fafc; border-radius: 12px;
  border: 1px solid #f1f5f9; margin-bottom: 12px;
}

.modal-actions {
  display: flex; justify-content: flex-end; gap: 10px;
  margin-top: 20px; padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}
.modal-actions button { width: auto; }

.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

/* ===== RESPONSIVE ===== */
@media (max-width: 1100px) {
  .main-grid { grid-template-columns: 1fr; }
  .sidebar { position: relative; height: auto; top: 0; max-height: 50vh; }
  .quote-center { height: auto !important; }
  .sidebar-left.closed, .sidebar-right.closed { display: none; }
  .open-tab { top: auto; bottom: 20px; }
}

/* ==============================================================
   CSS RIÊNG CHO IN ẤN (PDF)
============================================================== */
.print-only {
  display: none;
}

@media print {
  /* ẨN TOÀN BỘ GIAO DIỆN APP */
  .page > *:not(.main-grid) { display: none !important; }
  .main-grid > *:not(.quote-center) { display: none !important; }
  .quote-center > *:not(.print-only) { display: none !important; }
  
  /* Cài đặt trang A4 */
  @page {
    size: A4 portrait;
    margin: 10mm;
  }

  body, html {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #000;
  }

  /* HIỂN THỊ VÙNG IN */
  .print-only {
    display: block !important;
    font-family: "Times New Roman", Times, serif;
    font-size: 11pt; /* Giảm font size để vừa 9 cột */
    line-height: 1.3;
    width: 100%;
  }

  /* Bảng Báo Giá PDF */
  .pdf-table {
    width: 100%;
    table-layout: fixed; /* Cố định width theo % để full trang A4 */
    border-collapse: collapse;
    margin-bottom: 20px;
    word-wrap: break-word;
  }
  .pdf-table th, .pdf-table td {
    border: 1px solid #000;
    padding: 6px 4px;
    vertical-align: middle;
  }
  .pdf-table th {
    background-color: #CCFFCC !important; /* Xanh lá giống Excel */
    -webkit-print-color-adjust: exact;
    text-align: center;
    font-weight: bold;
    font-size: 10pt;
  }
  .pdf-group-row td {
    background-color: #FFFF00 !important; /* Vàng giống Excel */
    -webkit-print-color-adjust: exact;
  }
  .pdf-total-row td {
    background-color: #FFFF00 !important; /* Vàng giống Excel */
    -webkit-print-color-adjust: exact;
  }
  
  /* Tiện ích text */
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }
}

.term-preview {
  margin-top: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}

.term-preview label {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
  display: block;
}

.term-preview :deep(.preview-editor .editor-content) {
  background: #ffffff;
  color: #000000;
  font-family: 'Times New Roman', Times, serif;
  font-size: 11pt;
  line-height: 1.5;
  border: 1px solid #cbd5e1;
  border-top: none;
  min-height: 150px;
}
.term-preview :deep(.preview-editor .editor-content:focus) {
  background: #ffffff;
  outline: 2px solid #38bdf8;
  outline-offset: -2px;
}

.term-preview :deep(.preview-editor .editor-content table) {
  width: 100% !important;
  border-collapse: collapse;
  margin-top: 8px;
}

.term-preview :deep(.preview-editor .editor-content table th),
.term-preview :deep(.preview-editor .editor-content table td) {
  border: 1px solid #cbd5e1;
  padding: 6px;
}
</style>

<style>
/* ==============================================================
   CSS GLOBAL DÙNG CHUYÊN CHO IN ẤN (PDF) - TRỊ LỖI TRẮNG TRANG
============================================================== */
@media print {
  /* Ẩn Sidebar của App.vue */
  .sidebar, .scroll-to-top { display: none !important; }

  /* Phá vỡ layout Flex/Scroll của App.vue để trình duyệt in đủ trang */
  .app-layout, .main-content, #app, body, html {
    display: block !important;
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
    position: static !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }
}
</style>
