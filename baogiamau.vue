<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'

/* ======================
   CONFIG
====================== */
const BASE_URL =
  'https://script.google.com/macros/s/AKfycbzYx6vHJJhHB8eLv0Ldr_QZ4Y9GzLMrAeFMGfK-RMYjl7Zjl1YjCz8Is01alAYuGRNB/exec'

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
  Tong_loi_nhuan: string
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
  Tong_loi_nhuan: '',
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
const showVND = ref(false)
const selectedItems = ref<(HangHoa & { So_luong: number })[]>([])

/* qty realtime trong card */
const qtyMap = reactive<Record<string, number>>({})

/* ======================
   MODAL - NHẬP TAY / CHI TIẾT CARD / XEM BÁO GIÁ
====================== */
const showManualModal = ref(false)
const showCardModal = ref(false)
// Removed preview modal states

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
const showSaveModal = ref(false)

/* ======================
   HELPERS
====================== */
/* ======================
   ✅ LOAD HÓA ĐƠN / HỢP ĐỒNG
====================== */
const showLoadInvoiceModal = ref(false)
/* ======================
   🔍 SO SÁNH HỢP ĐỒNG
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
  const item: HangHoa & { So_luong: number } = {
    Ma_hang: String(row?.[2] ?? ''),
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
    // ✅ snapshot giá gốc
    _gia_hardware_goc: toNum(row?.[20], 0),
    _gia_nhap_goc: toNum(row?.[21], 0),
    _muc_phan_tram_off_goc: toNum(row?.[22], 0),
    _Don_gia_goc: toNum(row?.[14], 0),
    _Gia_tieu_chuan_goc: toNum(row?.[13], 0),
    _Ti_gia_goc: toNum(row?.[16], 1),
    _Thue_VAT_goc: toNum(row?.[17], 0)
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

    // ====== load customer ======
    const maKH = String(row?.[2] ?? '').trim()
    if (maKH) {
      fillCustomerByMa(maKH) // sẽ set khach + maKHInput + tenKHInput
    } else {
      // fallback: set tên nếu có
      const tenKH = String(row?.[3] ?? '').trim()
      if (tenKH) fillCustomerByTen(tenKH)
    }

    // ====== detect currency mode (nếu row có 2 cột cuối donVi/tiGia) ======
    // buildHopDongTongQuatRow của mày đang return thêm: donVi, tiGia ở cuối
    const donViSaved = String(row?.[17] ?? '').trim()
    const tiGiaSaved = toNum(row?.[18], 1)
    // logic: nếu hóa đơn lưu "VND + ti_gia=1" => showVND = true
    // (mày đang dùng showVND để hiển thị VND)
    if (donViSaved === 'VND' && tiGiaSaved === 1) showVND.value = true
    else showVND.value = false

    // ====== load chi tiết ======
    const detailRows = await fetch(`${BASE_URL}?action=hop_dong_chi_tiet`).then(r => r.json())
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
  return round2(showVND.value ? gia * tg : gia)
}

function standardPrice(i: any) {
  const gt = toNum(i.Gia_tieu_chuan, 0)
  const tg = toNum(i.Ti_gia, 1)
  return round2(showVND.value ? gt * tg : gt)
}

const quoteCurrency = computed(() => {
  if (showVND.value) return 'VND'
  return (selectedItems.value[0]?.Don_vi_tien_te || '').trim() || 'VND'
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(round2(n))
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
  return round2(donGiaSauOffGoc(i)) // KHÔNG phụ thuộc showVND
}

function standardPriceRaw(i: any) {
  return round2(getGocNumber(i, '_Gia_tieu_chuan_goc', toNum(i.Gia_tieu_chuan, 0))) // KHÔNG phụ thuộc showVND
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

async function postNoCors(action: string, payload: any) {
  // no-cors: không đọc được response -> chỉ biết "gửi được request"
  const body = new URLSearchParams()
  body.set('action', action)
  body.set('payload', JSON.stringify(payload || {}))

  await fetch(BASE_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body
  })
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

  const now = new Date()
  const ngay = formatDateTimeVN(new Date())


  // ✅ totals: theo showVND (có nhân tỉ giá)
  // ✅ totalsContract: RAW (giá gốc)
  const t = showVND.value ? totals.value : totalsContract.value

  const truoc = round2(t.truoc)
  const vat   = round2(t.vat)
  const sau   = round2(t.sau)

  const tongGiamGia = 0
  const tongCong = sau
  const tongThanhToan = 0
  const hhKhach = 0
  const hhCaNhan = 0
  const tongLoiNhuanCu = toNum(khach.value.Tong_loi_nhuan, 0)
  const trangThaiThanhToan = 'Chưa thanh toán đủ'
  const ghiChu = (ghiChuHopDong.value || '').trim()

  // ✅ nếu đang bật VND thì lưu VND + tiGia = 1
  const donVi = showVND.value
    ? 'VND'
    : (selectedItems.value[0]?.Don_vi_tien_te || 'VND').trim()

  const tiGia = showVND.value
    ? 1
    : toNum(selectedItems.value[0]?.Ti_gia, 1)

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
    tongLoiNhuanCu,
    trangThaiThanhToan,
    statusHopDong,
    ghiChu,
    donVi,
    tiGia,
      maHopDongCu || ''  ,   // ✅ CỘT MỚI
      toNum(tongGiaThucTe.value, 0),  // ✅ CỘT MỚI (index 20)
      formatCreatedTimeVN(new Date()) // ✅ created_time (index 21)
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

    const donGiaToSave = showVND.value ? toNum(it.Don_gia, 0) * tg : toNum(it.Don_gia, 0)
    const giaTCToSave  = showVND.value ? toNum(it.Gia_tieu_chuan, 0) * tg : toNum(it.Gia_tieu_chuan, 0)

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
      showVND.value ? 'VND' : (it.Don_vi_tien_te || 'VND').trim(),
      showVND.value ? 1 : toNum(it.Ti_gia, 1), // ✅ nếu lưu VND thì ti_gia=1
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


    await postNoCors('save_contract_temp', payload)
    saveMsg.value = '✅ Đã gửi lưu Hợp đồng TẠM (no-cors).'

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
    const tongSauThue = round2((showVND.value ? totals.value.sau : totalsContract.value.sau))


const payload = {
  hd_tong_quat_row: buildHopDongTongQuatRow(
    'Chính thức',
    loadedMaHopDong.value   // ✅ gắn mã cũ
  ),
  hd_chi_tiet_rows: buildHopDongChiTietRows(),
  ma_khach_hang: (khach.value.Ma_khach_hang || '').trim(),
  tong_sau_thue: tongSauThue
}

    await postNoCors('save_contract_official', payload)
    saveMsg.value = '✅ Đã gửi lưu Hợp đồng CHÍNH THỨC (no-cors).'
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
    muc_phan_tram_off: toNum(row[22], 0)
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
  // ✅ THÊM 3 field (default 0 vì sheet cũ không có)
  gia_hardware: 0,
  gia_nhap: 0,
  muc_phan_tram_off: 0
  }
}
const IDX_TIME = 4

const contractsSortedDesc = computed(() => {
  return [...contractsRaw.value].sort((a, b) => {
    const ta = String(a?.[IDX_TIME] ?? '')
    const tb = String(b?.[IDX_TIME] ?? '')
    // so sánh chuỗi vì cùng format trong sheet
    return tb.localeCompare(ta)
  })
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
    Tong_loi_nhuan: String(row[13] ?? ''),
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
  const hhRows = await fetch(`${BASE_URL}?action=hang_hoa`).then(r => r.json())
  const mappedProducts = (Array.isArray(hhRows) ? hhRows : []).map(mapHangHoaRow)
  products.value = mappedProducts

  // init qtyMap
  mappedProducts.forEach(p => {
    if (!qtyMap[p.Ma_hang]) qtyMap[p.Ma_hang] = 1
  })

  // khach_hang
  const khRows = await fetch(`${BASE_URL}?action=khach_hang`).then(r => r.json())
  customers.value = (Array.isArray(khRows) ? khRows : []).map(mapKhachRow)
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
    Tong_loi_nhuan: '',
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
  if (showVND.value) return formatVND(lp * tg)
  const cur = (i.Don_vi_tien_te || '').trim() || 'VND'
  return `${formatVND(lp)} ${cur}`.trim()
}

/* ✅ Hiển thị Đơn giá sau Off (theo mode VND) */
function displayQuoteDonGia(i: any) {
  const gia = donGiaSauOff(i)
  const tg = toNum(i.Ti_gia, 1)
  if (showVND.value) return formatVND(gia * tg)
  const cur = (i.Don_vi_tien_te || '').trim() || 'VND'
  return `${formatVND(gia)} ${cur}`.trim()
}
function displayDonGiaLPRaw(i: any) {
  const lp = donGiaLPGoc(i)
  const cur = (i.Don_vi_tien_te || '').trim() || 'VND'
  return `${formatVND(lp)} ${cur}`.trim()
}

function displayQuoteDonGiaRaw(i: any) {
  const gia = donGiaSauOffGoc(i)
  const cur = (i.Don_vi_tien_te || '').trim() || 'VND'
  return `${formatVND(gia)} ${cur}`.trim()
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
  return round2(truoc - thucTe)
})
const thueChenhLech = computed(() => {
  const pct = toNum(thueChenhLechPct.value, 0)
  return round2((chenhLechGia.value * pct) / 100)
})
const conLai = computed(() => {
  return round2(chenhLechGia.value - thueChenhLech.value)
})
const chietKhauTruocThue = computed(() => {
  const pct = toNum(chietKhauTruocThuePct.value, 0)
  return round2((toNum(totals.value.truoc, 0) * pct) / 100)
})
const tongChietKhau = computed(() => {
  return round2(conLai.value + chietKhauTruocThue.value)
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
const tongChietKhauRaw = computed(() => {
  return round2(conLaiRaw.value + chietKhauTruocThueRaw.value)
})

/* ======================
   PRICE DISPLAY
====================== */
function displayPrice(p: HangHoa) {
  if (showVND.value) {
    const vnd = donGiaLP(p) * toNum(p.Ti_gia, 1)
    return formatVND(vnd)
  }
  return `${formatVND(donGiaLP(p))} ${p.Don_vi_tien_te || ''}`.trim()
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
  const detailRows = await fetch(`${BASE_URL}?action=hop_dong_chi_tiet`).then(r => r.json())
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

import * as XLSX from 'xlsx-js-style'

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

function buildExcelRows() {
  const rows: any[] = []

  // ===== HEADER =====
  rows.push([
    'STT',
    'P/N',
    'TÊN HÀNG HÓA',
    'DIỄN GIẢI',
    'HÃNG',
    'DVT',
    'S.L',
    'ĐƠN GIÁ (VND)',
    'THÀNH TIỀN TRƯỚC THUẾ',
    'THUẾ VAT',
    'THÀNH TIỀN SAU THUẾ'
  ])

  let stt = 1

  quoteRows.value.forEach(r => {
    // ===== DÒNG DANH MỤC =====
if (r.type === 'group') {
  rows.push([
    '',
    r.title.toUpperCase(),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ])
  return
}


    const i = r.item

    const donGiaVND = showVND.value
      ? unitPrice(i)
      : unitPrice(i) * toNum(i.Ti_gia, 1)

    const truoc = lineTruocThue(i)
    const vat = lineVAT(i)
    const sau = lineSauThue(i)

    // ===== DÒNG ITEM =====
    rows.push([
      stt++,
      i.Ma_hang,
      i.Ten_hang,
      [i.Mo_ta_chung, i.Mo_ta_chi_tiet, i.Features]
        .filter(Boolean)
        .join('\n'),
      i.Ten_nha_cung_cap,
      i.DVT,
      i.So_luong,
      round2(donGiaVND),
      round2(truoc),
      round2(vat),
      round2(sau)
    ])
  })

  // ===== TỔNG CỘNG (CHỈ 1 LẦN) =====
  rows.push([
    'TỔNG CỘNG + THUẾ',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    round2(totals.value.truoc),
    round2(totals.value.vat),
    round2(totals.value.sau)
  ])

  return rows
}

function exportQuoteExcel() {
  const data = buildExcelRows()

  const ws = XLSX.utils.aoa_to_sheet(data)
  const range = XLSX.utils.decode_range(ws['!ref'] as string)

for (let r = range.s.r; r <= range.e.r; r++) {
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r, c })
    if (!ws[addr]) continue

    ws[addr].s = {
      ...(ws[addr].s || {}),
      border: {
        top:    { style: 'thin', color: { auto: 1 } },
        bottom: { style: 'thin', color: { auto: 1 } },
        left:   { style: 'thin', color: { auto: 1 } },
        right:  { style: 'thin', color: { auto: 1 } }
      }
    }
  }
}
for (let c = 0; c <= range.e.c; c++) {
  const addr = XLSX.utils.encode_cell({ r: 0, c })
  if (!ws[addr]) continue

  ws[addr].s = {
    ...(ws[addr].s || {}),
    font: { bold: true },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    fill: {
      fgColor: { rgb: 'CCFFCC' } // xanh nhạt như ảnh
    }
  }
}
for (let r = 1; r <= range.e.r; r++) {
  for (let c = 0; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r, c })
    if (!ws[addr]) continue

    // mặc định
    let align: any = { vertical: 'top', wrapText: true }

    // STT, Hãng, DVT, S.L
    if ([0, 4, 5, 6].includes(c)) {
      align.horizontal = 'center'
      if (c === 6) ws[addr].z = '#,##0'
    }
    // tiền
    else if (c >= 7) {
      align.horizontal = 'right'
      ws[addr].z = '#,##0'
    }
    // diễn giải
    else if (c === 3) {
      align.horizontal = 'left'
    }
    else {
      align.horizontal = 'left'
    }

    ws[addr].s = {
      ...(ws[addr].s || {}),
      alignment: align
    }
  }
}
data.forEach((row, idx) => {
  if (idx === 0) return
  
  if (!row[0] && row[1] && !row[2] && row[0] !== 'TỔNG CỘNG + THUẾ') {
    for (let c = 0; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r: idx, c })
      if (!ws[addr]) continue
      ws[addr].s = {
        ...(ws[addr].s || {}),
        font: { bold: true },
        fill: { fgColor: { rgb: 'FFFF00' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
      }
    }
  }

  if (row[0] === 'TỔNG CỘNG + THUẾ') {
    for (let c = 0; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r: idx, c })
      if (!ws[addr]) continue
      ws[addr].s = {
        ...(ws[addr].s || {}),
        font: { bold: true },
        fill: { fgColor: { rgb: 'FFFF00' } },
        alignment: { horizontal: c === 0 ? 'center' : 'right', vertical: 'center', wrapText: true }
      }
    }
  }
})

  // ===== MERGE =====
  const merges: XLSX.Range[] = []
  data.forEach((r, idx) => {
    if (idx === 0) return
    if (!r[0] && r[1] && !r[2] && r[0] !== 'TỔNG CỘNG + THUẾ') {
      merges.push({ s: { r: idx, c: 1 }, e: { r: idx, c: 3 } })
    }
    if (r[0] === 'TỔNG CỘNG + THUẾ') {
      merges.push({ s: { r: idx, c: 0 }, e: { r: idx, c: 7 } })
    }
  })
  ws['!merges'] = merges

  // ===== ĐỘ RỘNG CỘT =====
  ws['!cols'] = [
    { wch: 6.78 },   // STT
    { wch: 12.22 },  // P/N
    { wch: 15.44 },  // TÊN HÀNG HÓA
    { wch: 38.55 },  // DIỄN GIẢI
    { wch: 10.44 },  // HÃNG
    { wch: 13.89 },  // DVT
    { wch: 7.89 },   // S.L
    { wch: 12.22 },  // ĐƠN GIÁ (VND)
    { wch: 14.89 },  // Trước thuế
    { wch: 9.66 },   // VAT
    { wch: 12.78 }   // Sau thuế
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'BaoGia')

  const fileName = `BaoGia_${soHopDong.value || maHopDong.value}.xlsx`
  XLSX.writeFile(wb, fileName)
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
        <div class="sidebar-head">
          <h3>🛒 Sản phẩm</h3>
          <button class="icon-btn" @click="showProductSidebar = false">✕</button>
        </div>
        <div class="top-bar">
          <button class="primary" @click="showManualModal = true">➕ Nhập tay</button>

          <input v-model="keyword" placeholder="Tìm mã / tên hàng / NCC..." />

          <select v-model="supplierFilter" class="select">
            <option value="ALL">Tất cả NCC</option>
            <option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</option>
          </select>

          <button class="ghost" @click="showVND = !showVND">
            {{ showVND ? 'Quay lại ' : 'Đổi hàng USD = > VND' }}
          </button>
        </div>

        <div class="product-grid">
          <div class="card" v-for="p in filteredProducts" :key="p.Ma_hang" @click="openCardModal(p)">
            <img :src="p.Main_img" />
            <h4 class="clamp2">{{ p.Ten_hang }}</h4>

            <p class="muted clamp2">{{ p.License_duration }}</p>
            <p class="clamp2">{{ p.Mo_ta_chung }}</p>

            <p class="price">
              {{ displayPrice(p) }} <span class="muted">/ {{ p.DVT }}</span>
            </p>

            <p class="muted">VAT: {{ p.Thue_VAT }}%</p>

            <div class="qty" @click.stop>
              <button @click="decQty(p.Ma_hang)">-</button>
              <span>{{ qtyMap[p.Ma_hang] || 1 }}</span>
              <button @click="incQty(p.Ma_hang)">+</button>
            </div>

            <button class="btn-add" @click.stop="addItemFromCard(p)">Thêm vào báo giá</button>
          </div>
        </div>
      </aside>
      <button v-if="!showProductSidebar" class="open-tab left" @click="showProductSidebar = true">
        🛒 SP
      </button>

      <!-- ================== CENTER: BẢNG BÁO GIÁ VÀ TỔNG TIỀN ================== -->
      <section class="box center quote-center">
        <div class="quote-table-wrap">
          <div class="sidebar-head table-header-box">
            <h3>📄 Bảng báo giá chi tiết (Gốc)</h3>
            <span class="hint">Click vào ô <b>SL / Giá Lic / VAT</b> để sửa trực tiếp.</span>
          </div>
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
                    <td class="center"><button class="btn-del" @click.stop="removeSelected(r.idx)">🗑</button></td>
                  </tr>
                </template>
              </tbody>
            </table>
        </div>
        <div class="bottom-totals">
          <div class="totals-box box-3">
            <div class="mini"><b>Chiết khấu % tổng trước thuế:</b> {{ chietKhauTruocThuePct }}% ({{ formatVND(chietKhauTruocThue) }})</div>
            <div class="mini"><b>Thuế % chênh lệch giá:</b> {{ thueChenhLechPct }}% ({{ formatVND(thueChenhLech) }})</div>
            <div class="mini"><b>Chênh lệch giá:</b> {{ formatVND(chenhLechGia) }}</div>
            <div class="mini"><b>Còn lại:</b> {{ formatVND(conLai) }}</div>
            <div class="mini"><b>Tổng Chiết khấu:</b> {{ formatVND(tongChietKhau) }}</div>
          </div>
          <div class="totals-box box-4">
            <div class="mini"><b>Tổng giá thực tế:</b> {{ formatVND(tongGiaThucTe) }}</div>
            <div class="mini"><b>Tổng trước thuế:</b> {{ formatVND(totalsContract.truoc) }}</div>
            <div class="mini"><b>Tổng VAT:</b> {{ formatVND(totalsContract.vat) }}</div>
            <div class="mini"><b>Tổng sau thuế:</b> {{ formatVND(totalsContract.sau) }}</div>
          </div>
        </div>
      </section>

      <!-- ================== RIGHT SIDEBAR: HỢP ĐỒNG + THAO TÁC ================== -->
      <aside class="sidebar sidebar-right" :class="{ closed: !showContractSidebar }">
        <div class="sidebar-head">
          <h3>📄 Hợp đồng</h3>
          <button class="icon-btn" @click="showContractSidebar = false">✕</button>
        </div>

        <label>Mã hợp đồng</label>
        <input v-model="maHopDong" readonly />

        <label>Số hợp đồng</label>
        <input v-model="soHopDong" readonly />
        <label>Thuế % chênh lệch giá</label>
        <input
          type="number"
          v-model.number="thueChenhLechPct"
          min="0"
          placeholder="Nhập thuế % chênh lệch giá..."
        />
        <label>Chiết khấu % tổng trước thuế</label>
        <input
          type="number"
          v-model.number="chietKhauTruocThuePct"
          min="0"
          placeholder="Nhập chiết khấu % tổng trước thuế..."
        />
        <label>Ghi chú hợp đồng</label>
<textarea v-model="ghiChuHopDong" placeholder="Nhập ghi chú cho hợp đồng..." />

        <hr />

        <h3>⚙️ Thao tác</h3>

        <button class="primary" @click="exportQuoteExcel">
  Xuất Excel
</button>

        <button disabled>Xuất Word</button>
        <button disabled>Xuất PDF</button>
        <button class="primary" :disabled="saving" @click="showSaveModal = true">
          {{ saving ? 'Đang lưu...' : 'Lưu hợp đồng' }}
        </button>

<p v-if="saveMsg" class="muted" style="margin-top:6px">{{ saveMsg }}</p>
<button class="ghost" @click="showLoadInvoiceModal = true">📥 Load hóa đơn</button>

<button class="ghost" @click="showPickCompareModal = true">
  📊 Xem bảng so sánh
</button>



      </aside>

      <!-- NÚT MỞ SIDEBAR HỢP ĐỒNG -->
      <button v-if="!showContractSidebar" class="open-tab right" @click="showContractSidebar = true">
        📄 HĐ
      </button>
    </div>

    <!-- ================== MODAL: NHẬP TAY (FULL FIELDS) ================== -->
    <div v-if="showManualModal" class="modal" @click.self="showManualModal = false">
      <div class="modal-card modal-wide">
        <div class="modal-head">
          <h3>➕ Nhập tay hàng (đầy đủ field)</h3>
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
          <h3>🧾 Chi tiết hàng (có thể chỉnh sửa)</h3>
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

    <!-- ================== MODAL: CHỈNH SỬA ITEM BÁO GIÁ ================== -->
<div v-if="showQuoteEditModal && quoteEdit" class="modal" @click.self="closeQuoteEdit()">
  <div class="modal-card modal-wide">
    <div class="modal-head">
      <h3>✏️ Chỉnh sửa hàng trong báo giá</h3>
      <button class="x" @click="closeQuoteEdit()">✕</button>
    </div>

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
        <label>Giá Lic ({{ showVND ? 'VND' : (quoteEdit.Don_vi_tien_te || 'VND') }})</label>

        <!-- Giá gốc -->
        <input
          v-if="!showVND"
          type="number"
          v-model.number="quoteEdit.Don_gia"
          @input="ensureNumberField(quoteEdit, 'Don_gia')"
          min="0"
        />

        <!-- Giá VND -->
        <input
          v-else
          type="number"
          :value="toNum(quoteEdit.Don_gia, 0) * toNum(quoteEdit.Ti_gia, 1)"
          @input="onEditQuoteDonGiaVND($event)"
          min="0"
        />
      </div>
    </div>

    <hr />
    <div class="grid3">
  <div>
    <label>Giá Hardware</label>
    <input
      type="number"
      v-model.number="quoteEdit.gia_hardware"
      @input="ensureNumberField(quoteEdit, 'gia_hardware')"
      min="0"
    />
  </div>
  <div>
    <label>Giá Nhập</label>
    <input
      type="number"
      v-model.number="quoteEdit.gia_nhap"
      @input="ensureNumberField(quoteEdit, 'gia_nhap')"
      min="0"
    />
  </div>
  <div>
    <label>Mức % Off</label>
    <input
      type="number"
      v-model.number="quoteEdit.muc_phan_tram_off"
      @input="ensureNumberField(quoteEdit, 'muc_phan_tram_off')"
      min="0"
    />
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
      <button class="btn-del" @click="removeSelected(quoteEditIdx)">🗑 Xóa item</button>
    </div>
  </div>
</div>

    <!-- ================== MODAL: CHỈNH SỬA ITEM BÁO GIÁ GỐC ================== -->
<div v-if="showQuoteEditRawModal && quoteEditRaw" class="modal" @click.self="closeQuoteEditRaw()">
  <div class="modal-card modal-wide">
    <div class="modal-head">
      <h3>✏️ Chỉnh sửa hàng trong báo giá gốc</h3>
      <button class="x" @click="closeQuoteEditRaw()">✕</button>
    </div>

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

    <hr />
    <div class="grid3">
      <div>
        <label>Giá Hardware gốc</label>
        <input
          type="number"
          v-model.number="quoteEditRaw._gia_hardware_goc"
          @input="ensureNumberField(quoteEditRaw, '_gia_hardware_goc')"
          min="0"
        />
      </div>
      <div>
        <label>Giá Nhập gốc</label>
        <input
          type="number"
          v-model.number="quoteEditRaw._gia_nhap_goc"
          @input="ensureNumberField(quoteEditRaw, '_gia_nhap_goc')"
          min="0"
        />
      </div>
      <div>
        <label>Mức % Off gốc</label>
        <input
          type="number"
          v-model.number="quoteEditRaw._muc_phan_tram_off_goc"
          @input="ensureNumberField(quoteEditRaw, '_muc_phan_tram_off_goc')"
          min="0"
        />
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
      <button class="btn-del" @click="removeSelected(quoteEditRawIdx)">🗑 Xóa item</button>
    </div>
  </div>
</div>

    <!-- ================== MODAL: LOAD HÓA ĐƠN / HỢP ĐỒNG ================== -->
<div v-if="showLoadInvoiceModal" class="modal" @click.self="showLoadInvoiceModal = false">
  <div class="modal-card" style="width:min(560px,96vw)">
    <div class="modal-head">
      <h3>📥 Load hóa đơn / hợp đồng</h3>
      <button class="x" @click="showLoadInvoiceModal = false">✕</button>
    </div>

    <div class="grid2">
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
    v-for="r in contractsSortedDesc"
    :key="'so-' + r[1]"
    :value="String(r?.[1] ?? '').trim()"
  >
    {{ String(r?.[1] ?? '').trim() }}
    -
    {{ String(r?.[0] ?? '').trim() }}
    -
    {{ String(r?.[IDX_TIME] ?? '').trim() }}
  </option>
</datalist>


<datalist id="dl-ma-hd">
  <option
    v-for="r in contractsSortedDesc"
    :key="'ma-' + r[0]"
    :value="String(r?.[0] ?? '').trim()"
  >
    {{ String(r?.[0] ?? '').trim() }}
    -
    {{ String(r?.[1] ?? '').trim() }}
    -
    {{ String(r?.[IDX_TIME] ?? '').trim() }}
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
      <h3>📊 Chọn SỐ hợp đồng để so sánh</h3>
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
        v-for="r in contractsSortedDesc"
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
      <h3>📊 So sánh hợp đồng – {{ compareSoHopDong }}</h3>
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
            <input v-model="khach.Tong_loi_nhuan" placeholder="Lợi nhuận" />

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
textarea { min-height: 60px; resize: vertical; }

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
  display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; flex-shrink: 0;
}

/* ===== PRODUCT GRID ===== */
.product-grid {
  display: flex; flex-direction: column; gap: 10px;
  overflow-y: auto; flex: 1; padding-right: 2px;
}
.card {
  border: 1px solid #f1f5f9;
  padding: 12px;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  display: flex; flex-direction: column; gap: 5px;
  transition: all .2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}
.card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transform: translateY(-1px);
}
.card img {
  width: 100%; height: 100px;
  object-fit: contain;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}
.card h4 { margin: 0; font-size: 13px; font-weight: 600; color: #0f172a; line-height: 1.3; }
.clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.muted { color: #64748b; font-size: 11.5px; margin: 0; }
.small { font-size: 11px; }
.price {
  font-weight: 700; color: #3b82f6; font-size: 13.5px;
  font-family: 'JetBrains Mono', monospace;
  margin: 3px 0 0;
}
.qty {
  display: flex; align-items: center; gap: 6px;
  margin-top: auto; padding: 2px;
  border-radius: 8px; width: fit-content;
}
.qty button {
  width: 26px; height: 26px; padding: 0; margin: 0;
  border-radius: 6px; background: #f1f5f9;
  border: none;
  font-size: 14px; color: #475569;
  min-width: 26px;
  box-shadow: none;
}
.qty button:hover { background: #e2e8f0; color: #0f172a; transform: none; }
.qty span {
  font-weight: 600; font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  min-width: 20px; text-align: center;
}
.btn-add {
  margin-top: 6px; width: 100%;
  background: #f1f5f9; color: #334155; font-weight: 600;
  padding: 0.6rem 1rem;
}
.btn-add:hover { background: #e2e8f0; color: #0f172a; transform: translateY(-1px); }

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
  gap: 12px;
  flex-shrink: 0;
}
.totals-box {
  background: white;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
}
.totals-box .mini {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 0;
  font-size: 12.5px; color: #64748b;
  border-bottom: 1px solid #f1f5f9;
}
.totals-box .mini b {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: #475569;
}
.totals-box .mini:last-child {
  border-bottom: none;
  font-weight: 600; color: #0f172a;
  font-size: 13.5px;
  padding-top: 10px;
  margin-top: 4px;
  border-top: 1px dashed #cbd5e1;
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
</style>







