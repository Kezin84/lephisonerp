<script lang="ts">
export default {
  name: 'BaoGia'
}
</script>
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'
import ExcelEditor from './ExcelEditor.vue'
import FormattedInput from './FormattedInput.vue'
import PipelinePreviewModal from './PipelinePreviewModal.vue'

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
  Hoa_hong: string
  Tong_chi_tieu: string
  Trang_thai: string
  Cong_no_chua_thanh_toan: string
  Ghi_chu: string
  Ten_khach_hang_phu: string
  So_dien_thoai_ca_nhan_phu: string
  Email_ca_nhan_phu: string
  MST: string
  COMPANY: string
  ADDRESS: string
  TEL: string
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
  Hoa_hong: '',
  Tong_chi_tieu: '',
  Trang_thai: '',
  Cong_no_chua_thanh_toan: '',
  Ghi_chu: '',
  Ten_khach_hang_phu: '',
  So_dien_thoai_ca_nhan_phu: '',
  Email_ca_nhan_phu: '',
  MST: '',
  COMPANY: '',
  ADDRESS: '',
  TEL: ''
})

const customers = ref<KhachHang[]>([])
const maKHInput = ref('')
const tenKHInput = ref('')

/* ── Auto-gen Mã KH & Mã CT (giống logic Import PO) ── */
const isExistingCustomer = ref(false) // true khi chọn KH từ danh sách có sẵn
const originalKhach = ref<KhachHang | null>(null) // snapshot KH gốc khi chọn từ danh sách

// Hiển thị nút "THÊM VÀO DB" khi KH mới có data hoặc KH cũ bị thay đổi
const showSaveToDBBtn = computed(() => {
  const k = khach.value
  const ma = maKHInput.value?.trim() || k.Ma_khach_hang?.trim()
  const ten = tenKHInput.value?.trim() || k.Ten_khach_hang?.trim()
  if (!ma && !ten) return false // chưa có gì → ẩn

  if (!isExistingCustomer.value) {
    // KH mới → hiện nếu có tên hoặc mã
    return !!(ma || ten)
  }

  // KH cũ → so sánh với snapshot gốc
  if (!originalKhach.value) return false
  const o = originalKhach.value
  return (
    (tenKHInput.value || '') !== (o.Ten_khach_hang || '') ||
    (k.Email_ca_nhan || '') !== (o.Email_ca_nhan || '') ||
    (k.So_dien_thoai_ca_nhan || '') !== (o.So_dien_thoai_ca_nhan || '') ||
    (k.Ten_cong_ty || '') !== (o.Ten_cong_ty || '') ||
    (k.MST || '') !== (o.MST || '') ||
    (k.So_dien_thoai_cong_ty || '') !== (o.So_dien_thoai_cong_ty || '') ||
    (k.So_fax_cong_ty || '') !== (o.So_fax_cong_ty || '') ||
    (k.Dia_chi_cong_ty || '') !== (o.Dia_chi_cong_ty || '') ||
    (k.Email_cong_ty || '') !== (o.Email_cong_ty || '') ||
    (k.Website_cong_ty || '') !== (o.Website_cong_ty || '') ||
    (k.Trang_thai || '') !== (o.Trang_thai || '') ||
    (k.Cong_no_chua_thanh_toan || '') !== (o.Cong_no_chua_thanh_toan || '') ||
    (k.Ghi_chu || '') !== (o.Ghi_chu || '') ||
    (k.Ten_khach_hang_phu || '') !== (o.Ten_khach_hang_phu || '') ||
    (k.So_dien_thoai_ca_nhan_phu || '') !== (o.So_dien_thoai_ca_nhan_phu || '') ||
    (k.Email_ca_nhan_phu || '') !== (o.Email_ca_nhan_phu || '') ||
    (k.COMPANY || '') !== (o.COMPANY || '') ||
    (k.ADDRESS || '') !== (o.ADDRESS || '') ||
    (k.TEL || '') !== (o.TEL || '')
  )
})

const removeDiacritics = (str: string) => {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}
const genMaCT = (congTy: string) => {
  if (!congTy) return ''
  return removeDiacritics(congTy).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '')
}
const genMaKH = (tenKH: string, congTy: string) => {
  const tenClean = removeDiacritics(tenKH).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '')
  const maCT = genMaCT(congTy)
  if (!tenClean && !maCT) return ''
  return [tenClean, maCT].filter(Boolean).join('-')
}

// Watcher: chỉ tự động gen mã KH & mã CT khi khách hàng MỚI (nhập tay)
watch(
  () => [tenKHInput.value, khach.value.Ten_cong_ty],
  ([ten, congTy]) => {
    if (isExistingCustomer.value) return // KH đã tồn tại → giữ mã cũ
    const newMaKH = genMaKH(ten as string, congTy as string)
    if (newMaKH) {
      maKHInput.value = newMaKH
      khach.value.Ma_khach_hang = newMaKH
    }
    khach.value.Ma_cong_ty = genMaCT(congTy as string)
  }
)

/* ======================
   5. HỢP ĐỒNG
====================== */
const maHopDong = ref(`HD${new Date().toISOString().replace(/\D/g, '')}`)
const soHopDong = ref('')
const currentPO = ref('')
const tongGiaThucTe = computed(() => {
  let rawTotal = 0;
  selectedItems.value.forEach(i => {
    rawTotal += lineTruocThueRaw(i);
  });
  return round2(rawTotal);
})
const thueChenhLechPct = ref(0)
const chietKhauTruocThuePct = ref(0)
const ghiChuHopDong = ref('')
const loadedMaHopDong = ref<string | null>(null)
const loadedMaHopDongGoc = ref<string | null>(null)
/* ======================
   MODAL CHỌN SỐ HĐ SO SÁNH
====================== */
const showPickCompareModal = ref(false)
const pickCompareSo = ref('')

/* ======================
   HISTORY TRACKING
====================== */
const historyLogs = ref<Record<string, { time: string, oldVal: number, newVal: number }[]>>({
  chietKhauTruocThue: [],
  thueChenhLech: [],
  chenhLechGia: [],
  conLai: [],
  tongChietKhau: [],
  tongGiaThucTe: [],
  truoc: [],
  vat: [],
  sau: [],
  loi: []
})
const showHistoryModal = ref(false)
const showCustomerDetailModal = ref(false)
const historyTitle = ref('')
const currentHistory = ref<{ time: string, oldVal: number, newVal: number }[]>([])

const actionHistory = ref<{ time: string, reason: string, oldVal?: number, newVal?: number }[]>([])
const isGlobalHistory = ref(false)

function addAction(reason: string, oldVal?: number, newVal?: number) {
  actionHistory.value.unshift({
    time: formatTimeOnly(new Date()),
    reason,
    oldVal,
    newVal
  })
}

function openHistory(key: string, title: string) {
  isGlobalHistory.value = false
  historyTitle.value = title
  currentHistory.value = historyLogs.value[key] || []
  showHistoryModal.value = true
}

function openGlobalHistory() {
  isGlobalHistory.value = true
  historyTitle.value = 'Lịch sử thao tác'
  currentHistory.value = actionHistory.value.map(a => ({
    time: a.time,
    oldVal: a.oldVal ?? 0,
    newVal: a.newVal ?? 0,
    reason: a.reason,
    metric: ''
  }))
  showHistoryModal.value = true
}

function hasHistory(key: string) {
  return historyLogs.value[key] && historyLogs.value[key].length > 0
}

function formatTimeOnly(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function trackHistory(key: string, source: () => number) {
  watch(source, (newVal, oldVal) => {
    if (newVal === oldVal) return
    if (!historyLogs.value[key]) {
      historyLogs.value[key] = []
    }
    historyLogs.value[key].unshift({
      time: formatTimeOnly(new Date()),
      oldVal: oldVal,
      newVal: newVal
    })
  })
}


/* ======================
   HÀNG HÓA
====================== */
const products = ref<HangHoa[]>([])
const keyword = ref('')
const supplierFilter = ref('ALL')
const selectedItems = ref<(HangHoa & { So_luong: number, uid?: string })[]>([])

// --- DATA LOADING FLAGS: 'loading' | 'loaded' | 'ready' ---
const productsState = ref<'loading'|'loaded'|'ready'>('loading')
const customersState = ref<'loading'|'loaded'|'ready'>('loading')
const contractsState = ref<'loading'|'loaded'|'ready'>('loading')
const termsState = ref<'loading'|'loaded'|'ready'>('loading')
const invoiceListState = ref<'loading'|'loaded'|'ready'>('ready')
const pipelineListState = ref<'loading'|'loaded'|'ready'>('ready')

// Compat refs (for old usage)
const loadingProducts = computed(() => productsState.value === 'loading')
const loadingCustomers = computed(() => customersState.value === 'loading')
const loadingContracts = computed(() => contractsState.value === 'loading')
const loadingTerms = computed(() => termsState.value === 'loading')

function markLoaded(stateRef: typeof productsState) {
  stateRef.value = 'loaded'
  setTimeout(() => { stateRef.value = 'ready' }, 1500)
}

// --- TOAST STATE ---
const toastMsg = ref('')
const showToast = ref(false)
let toastTimeout: any = null

function triggerToast(msg: string) {
  toastMsg.value = msg
  showToast.value = true
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, 2500)
}

// --- ASYNC RESULT MODAL STATE ---
const asyncResultModal = ref<{ show: boolean, type: 'loading' | 'success' | 'error', title: string, msg: string }>({
  show: false, type: 'loading', title: '', msg: ''
})
let asyncResultTimeout: any = null

function showAsyncLoading(title: string) {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'loading', title, msg: '' }
}

function showAsyncSuccess(title: string, msg: string = '') {
  asyncResultModal.value = { show: true, type: 'success', title, msg }
  asyncResultTimeout = setTimeout(() => { asyncResultModal.value.show = false }, 3000)
}

function showAsyncError(title: string, msg: string = '') {
  asyncResultModal.value = { show: true, type: 'error', title, msg }
  // Error stays until user closes it
}

// --- STATE FOR DRAG & DROP ---
const flatQuoteRows = ref<any[]>([])
const existingCategories = computed(() => {
  const cats = new Set<string>()
  products.value.forEach((it: any) => {
    if (it.Danh_muc) cats.add(it.Danh_muc.trim().toUpperCase())
  })
  selectedItems.value.forEach((it: any) => {
    if (it.Danh_muc) cats.add(it.Danh_muc.trim().toUpperCase())
  })
  return Array.from(cats).sort()
})
let isSyncingFromDrag = false
const draggingGroupKey = ref<string | null>(null)

function syncFlatRows() {
  const rows: any[] = []
  let currentGroupKey = null
  let groupIndex = 0
  let stt = 0
  
  selectedItems.value.forEach((it, idx) => {
    if (!it.uid) it.uid = Math.random().toString(36).substr(2, 9)
    const sup = (it.Ten_nha_cung_cap || it.Ma_nha_cung_cap || '').trim() || 'NCC'
    const cat = (it.Danh_muc || '').trim()
    const gKey = cat.toUpperCase()
    
    if (gKey !== currentGroupKey) {
      currentGroupKey = gKey
      groupIndex++
      stt = 0
      rows.push({
        type: 'group',
        key: gKey,
        title: cat,
        roman: toRoman(groupIndex),
        uniqueId: 'group-' + gKey + '-' + groupIndex
      })
    }
    
    stt++
    rows.push({
      type: 'item',
      item: it,
      idx: idx,
      stt: stt,
      groupKey: gKey,
      uniqueId: 'item-' + it.uid
    })
  })
  flatQuoteRows.value = rows
}

watch(selectedItems, () => {
  if (!isSyncingFromDrag) {
    syncFlatRows()
  }
}, { deep: true, immediate: true });

function onFlatDragStart(event: any) {
  const r = flatQuoteRows.value[event.oldIndex];
  if (r && r.type === 'group') {
    draggingGroupKey.value = r.key;
  }
}

function onFlatDragEnd(event: any) {
  isSyncingFromDrag = true
  const newItems: any[] = []
  let draggedItemIdx = -1
  
  if (draggingGroupKey.value) {
    const finalGroupKeys: string[] = [];
    flatQuoteRows.value.forEach(r => {
      if (r.type === 'group' && !finalGroupKeys.includes(r.key)) {
        finalGroupKeys.push(r.key);
      }
    });

    finalGroupKeys.forEach(gKey => {
      flatQuoteRows.value.forEach(r => {
        if (r.type === 'item' && r.groupKey === gKey) {
          newItems.push(r.item);
        }
      });
    });
  } else {
    flatQuoteRows.value.forEach((r, idxInFlat) => {
      if (r.type === 'item') {
        newItems.push(r.item)
        if (idxInFlat === event.newIndex) {
          draggedItemIdx = newItems.length - 1
        }
      }
    })
  }

  draggingGroupKey.value = null;
  
  setTimeout(() => {
    selectedItems.value = newItems
    syncFlatRows()
    nextTick(() => { 
      isSyncingFromDrag = false 
      if (draggedItemIdx >= 0) {
        scrollToAndHighlightRow(draggedItemIdx, false)
      }
    })
  }, 50)
}

function checkMove(evt: any) {
  const dragged = evt.draggedContext.element;
  const related = evt.relatedContext.element;

  if (!dragged || !related) return true;

  if (dragged.type === 'item') {
    if (related.type === 'group') {
      return false;
    }
    if (related.type === 'item' && dragged.groupKey !== related.groupKey) {
      return false;
    }
  }

  return true;
}
// ----------------------------

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
const showExportInfoModal = ref(false)
const showLoadInfoModal = ref(false)
const showPipelineModal = ref(false)
const showSelectCustomerModal = ref(false)
const pipelineExchangeRate = ref(25400)
const pipelineSearchStr = ref('')
const selectedPipelineKhach = ref<KhachHang | null>(null)

const filteredPipelineCustomers = computed(() => {
  if (!pipelineSearchStr.value) return customers.value
  const kw = pipelineSearchStr.value.toLowerCase().trim()
  return customers.value.filter(c => 
    c.Ma_khach_hang.toLowerCase().includes(kw) || 
    c.Ten_khach_hang.toLowerCase().includes(kw)
  ).slice(0, 50)
})

const pipelineExcelBlob = ref<Blob | null>(null)

const handleAddNewPipelineCustomer = async () => {
  selectedPipelineKhach.value = {
    ...khach.value,
    Ma_khach_hang: '',
    Ten_khach_hang: '',
    Ten_cong_ty: '',
    Dia_chi_cong_ty: '',
    So_dien_thoai_ca_nhan: '',
    Email_ca_nhan: '',
    MST: ''
  }
}

function onTenKhachHangChange() {
  const val = khach.value.Ten_khach_hang;
  if (!val) return;
  const found = customers.value.find(c => c.Ten_khach_hang === val);
  if (found) {
    isExistingCustomer.value = true;
    originalKhach.value = JSON.parse(JSON.stringify(found));
    Object.assign(khach.value, found);
    maKHInput.value = found.Ma_khach_hang;
    tenKHInput.value = found.Ten_khach_hang;
  }
}

function onTenCongTyChange() {
  const val = khach.value.Ten_cong_ty;
  if (!val) return;
  const found = customers.value.find(c => c.Ten_cong_ty === val);
  if (found) {
    isExistingCustomer.value = true;
    originalKhach.value = JSON.parse(JSON.stringify(found));
    Object.assign(khach.value, found);
    maKHInput.value = found.Ma_khach_hang;
    tenKHInput.value = found.Ten_khach_hang;
  }
}

function onMSTChange() {
  const val = khach.value.MST;
  if (!val) return;
  const found = customers.value.find(c => c.MST === val);
  if (found) {
    isExistingCustomer.value = true;
    originalKhach.value = JSON.parse(JSON.stringify(found));
    Object.assign(khach.value, found);
    maKHInput.value = found.Ma_khach_hang;
    tenKHInput.value = found.Ten_khach_hang;
  }
}

const handleContinuePipeline = async () => {
  if (!selectedPipelineKhach.value && filteredPipelineCustomers.value.length === 1) {
    selectedPipelineKhach.value = filteredPipelineCustomers.value[0];
  }
  if (!selectedPipelineKhach.value && filteredPipelineCustomers.value.length > 1 && !khach.value.Ma_khach_hang) {
    window.alert('Vui lòng chọn khách hàng hoặc ấn Thêm mới!');
    return;
  }
  if (!selectedPipelineKhach.value) {
    selectedPipelineKhach.value = khach.value;
  }
  showSelectCustomerModal.value = false;
  
  showAsyncLoading('Đang chuẩn bị dữ liệu Pipeline...');
  try {
    pipelineExcelBlob.value = await generateQuoteExcelBlob(selectedPipelineKhach.value)
  } catch (e) {
    console.error('Không thể tạo file báo giá nền', e)
  }
  asyncResultModal.value.show = false;
  
  showPipelineModal.value = true;
};

async function openPipelineSelectCustomerModal() {
  selectedPipelineKhach.value = khach.value;
  showAsyncLoading('Đang chuẩn bị dữ liệu Pipeline...');
  try {
    pipelineExcelBlob.value = await generateQuoteExcelBlob(selectedPipelineKhach.value);
  } catch (e) {
    console.error('Không thể tạo file báo giá nền', e);
  }
  asyncResultModal.value.show = false;
  showPipelineModal.value = true;
}



const isMaHangEdited = ref(false)
const isCardMaHangEdited = ref(false)
const isMaNccEdited = ref(false)
const isCardMaNccEdited = ref(false)

function updateMaNcc() {
  if (isMaNccEdited.value) return;
  const t = (itemForm.value.Ten_nha_cung_cap || '').trim();
  let id = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  id = id.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '');
  itemForm.value.Ma_nha_cung_cap = id;
}

function updateCardMaNcc() {
  if (isCardMaNccEdited.value) return;
  if (!cardEdit.value) return;
  const t = (cardEdit.value.Ten_nha_cung_cap || '').trim();
  let id = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  id = id.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '');
  cardEdit.value.Ma_nha_cung_cap = id;
}

function updateCardMaHang() {
  if (isCardMaHangEdited.value) return;
  if (!cardEdit.value) return;
  if (cardEdit.value.Danh_muc) {
    cardEdit.value.Danh_muc = cardEdit.value.Danh_muc.toUpperCase();
  }
  const ten = (cardEdit.value.Ten_hang || '').trim();
  const danhMuc = (cardEdit.value.Danh_muc || '').trim();
  
  let id = '';
  if (danhMuc && ten) {
    id = `${danhMuc}-${ten}`;
  } else if (danhMuc) {
    id = danhMuc;
  } else if (ten) {
    id = ten;
  }

  id = id.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  id = id.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9\-]/g, '');
  id = id.replace(/-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  
  cardEdit.value.Ma_hang = id;
}

function updateMaHang() {
  if (itemForm.value.Danh_muc) {
    itemForm.value.Danh_muc = itemForm.value.Danh_muc.toUpperCase();
  }
  if (isMaHangEdited.value) return;
  const ten = (itemForm.value.Ten_hang || '').trim();
  const danhMuc = (itemForm.value.Danh_muc || '').trim();
  
  let id = '';
  if (danhMuc && ten) {
    id = `${danhMuc}-${ten}`;
  } else if (danhMuc) {
    id = danhMuc;
  } else if (ten) {
    id = ten;
  }

  id = id.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  id = id.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9\-]/g, '');
  id = id.replace(/-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  
  itemForm.value.Ma_hang = id;
}

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

const loadMode = ref<'SO' | 'MA' | 'PO'>('SO') // SO = số hợp đồng, MA = mã hợp đồng, PO = số PO
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
    Danh_muc: String(row?.[10] ?? '').toUpperCase(),
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
  const keyRaw = loadKey.value.trim()
  if (!keyRaw) return null
  // Xóa phần ngày tháng (vd: " - 14:30:00 14/05/2024" hoặc " - 14/05/2024") nếu có
  const key = keyRaw.replace(/\s*-\s*(?:\d{2}:\d{2}:\d{2}\s+)?\d{1,2}\/\d{1,2}\/\d{4}$/, '')
  
  if (loadMode.value === 'SO') {
    return contractsRaw.value.find(r => String(r?.[1] ?? '').trim() === key) || null
  }
  if (loadMode.value === 'PO') {
    return contractsRaw.value.find(r => String(r?.[22] ?? '').trim() === key) || null
  }
  return contractsRaw.value.find(r => String(r?.[0] ?? '').trim() === key) || null
}

async function openLoadInvoiceModal() {
  loadSortBy.value = 'desc';
  loadStatusFilter.value = '';
  loadFromDate.value = '';
  loadToDate.value = '';
  loadSearchQuery.value = '';
  showLoadInvoiceModal.value = true;
  invoiceListState.value = 'loading'
  try {
    const ts = Date.now();
    const [hdRows, khRows] = await Promise.all([
      fetch(`${BASE_URL}?action=hop_dong_tong_quat&t=${ts}`).then(r => r.json()),
      fetch(`${BASE_URL}?action=khach_hang&t=${ts}`).then(r => r.json())
    ]);
    contractsRaw.value = Array.isArray(hdRows) ? hdRows : [];
    customers.value = (Array.isArray(khRows) ? khRows : []).map(mapKhachRow);
    markLoaded(invoiceListState)
  } catch (e) {
    console.error('Error fetching latest contracts for load modal:', e);
    invoiceListState.value = 'ready'
  }
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
    showAsyncLoading('Đang load hóa đơn...')

const ma = String(row?.[0] ?? '').trim()
const so = String(row?.[1] ?? '').trim()

loadedMaHopDong.value = ma              // ✅ GHI NHỚ HỢP ĐỒNG CŨ
loadedMaHopDongGoc.value = String(row?.[32] ?? '').trim() || ma  // ✅ GHI NHỚ MÃ GỐC
soHopDong.value = so || soHopDong.value // số hợp đồng GIỮ NGUYÊN
currentPO.value = String(row?.[22] ?? '').trim() // ✅ Lấy Số PO từ index 22

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
    const ts = Date.now();
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
    showAsyncSuccess('Load thành công', 'Hóa đơn đã được load lên.')
  } catch (e: any) {
    loadMsg.value = '❌ Lỗi load: ' + String(e?.message || e)
    showAsyncError('Load thất bại', String(e?.message || e))
  } finally {
    loadingInvoice.value = false
  }
}

// --- PIPELINE LOAD STATE ---
const showLoadPipelineModal = ref(false)
const poDxmhList = ref<any[]>([])
const loadPipelineFilter = ref('')
const loadingPipeline = ref(false)
const loadPipelineMsg = ref('')
const loadPipelineSearch = ref('')
const ctmhList = ref<any[]>([])
const hdChiTietList = ref<any[]>([])

const loadedPipelineExtraData = ref<any>(null)

const filteredPoDxmhList = computed(() => {
  let list = [...poDxmhList.value].reverse()
  if (loadPipelineSearch.value) {
    const kw = loadPipelineSearch.value.trim().toLowerCase()
    list = list.filter(r => 
      String(r?.[2] ?? '').toLowerCase().includes(kw) || // so_po
      String(r?.[3] ?? '').toLowerCase().includes(kw) || // ten_po
      String(r?.[0] ?? '').toLowerCase().includes(kw) || // ma_hop_dong
      String(r?.[7] ?? '').toLowerCase().includes(kw)    // company
    )
  }
  
  return list.map(r => {
    const so_po = String(r?.[2] ?? '').trim()
    const so_hd = String(r?.[1] ?? '').trim()
    const maHD = String(r?.[0] ?? '').trim()
    
    // Tìm chi tiết mua hàng theo ma_hop_dong
    const items = ctmhList.value.filter((c: any[]) => 
      String(c?.[0] ?? '').trim() === maHD
    )
    
    // Map chi tiết: ten_hang_hoa[6], sl[9], list_price_usd[10]
    const hangHoaList = items.map(c => ({
      ten: String(c?.[6] ?? '').trim(),
      sl: String(c?.[9] ?? '').trim(),
      listPrice: String(c?.[10] ?? '').trim()
    })).filter(h => h.ten)

    // Tìm created_time từ hợp đồng tổng quát (index 4 = ngày tạo)
    const contract = contractsRaw.value.find((cr: any[]) => String(cr?.[0] ?? '').trim() === maHD)
    const createdTime = contract ? String(contract?.[4] ?? '').trim() : ''

    return {
      ma_hop_dong: maHD,
      so_hop_dong: so_hd,
      so_po: so_po,
      ten_po: String(r?.[3] ?? '').trim(),
      trang_thai: String(r?.[5] ?? '').trim(),
      company: String(r?.[7] ?? '').trim(),
      contact: String(r?.[11] ?? '').trim(),
      created_time: createdTime,
      hang_hoa_list: hangHoaList,
      raw: r
    }
  })
})

async function openLoadPipelineModal() {
  showLoadPipelineModal.value = true
  loadPipelineMsg.value = ''
  pipelineListState.value = 'loading'
  try {
    const ts = Date.now()
    const [poRows, ctmhRows, hdctRows] = await Promise.all([
      fetch(`${BASE_URL}?action=po_dxmh&t=${ts}`).then(r => r.json()),
      fetch(`${BASE_URL}?action=chi_tiet_mua_hang&t=${ts}`).then(r => r.json()),
      fetch(`${BASE_URL}?action=hop_dong_chi_tiet&t=${ts}`).then(r => r.json())
    ])
    poDxmhList.value = Array.isArray(poRows) ? poRows : []
    ctmhList.value = Array.isArray(ctmhRows) ? ctmhRows : []
    hdChiTietList.value = Array.isArray(hdctRows) ? hdctRows : []
    markLoaded(pipelineListState)
  } catch (e) {
    console.error('Error fetching POs:', e)
    pipelineListState.value = 'ready'
  }
}

async function loadPipelineToFE() {
  const kw = loadPipelineFilter.value.trim()
  if (!kw) return

  const keyRaw = kw.replace(/\s*-\s*(?:\d{2}:\d{2}:\d{2}\s+)?\d{1,2}\/\d{1,2}\/\d{4}$/, '')
  const searchKey = keyRaw.toLowerCase()

  const poRow = poDxmhList.value.find(r => {
    const s0 = String(r?.[0] ?? '').trim().toLowerCase() // ma_hop_dong
    const s1 = String(r?.[1] ?? '').trim().toLowerCase() // so_hop_dong
    const s2 = String(r?.[2] ?? '').trim().toLowerCase() // so_po
    const s3 = String(r?.[3] ?? '').trim().toLowerCase() // ten_po
    const compositeKey = `${s2} - ${s0}`
    return compositeKey === searchKey || s0 === searchKey || s1 === searchKey || s2 === searchKey || s3 === searchKey
  })
  if (!poRow) {
    loadPipelineMsg.value = '❌ Không tìm thấy PO tương ứng.'
    return
  }

  const so_po = String(poRow[2] || '').trim()
  const so_hd = String(poRow[1] || '').trim()
  const ma_hd = String(poRow[0] || '').trim()

  currentPO.value = so_po

  try {
    loadingPipeline.value = true
    loadPipelineMsg.value = 'Đang tải dữ liệu, vui lòng đợi...'
    showAsyncLoading('Đang load Pipeline...')

    const ts = Date.now();
    const allData = await fetch(`${BASE_URL}?action=all&fresh=1&t=${ts}`).then(r => r.json())
    
    contractsRaw.value = allData.hop_dong_tong_quat || []
    customers.value = (allData.khach_hang || []).map(mapKhachRow)
    
    let contractRow = null
    if (ma_hd) {
      contractRow = contractsRaw.value.find(r => String(r?.[0] ?? '').trim().toLowerCase() === ma_hd.toLowerCase())
    }
    if (!contractRow && so_hd) {
      contractRow = contractsRaw.value.find(r => String(r?.[1] ?? '').trim().toLowerCase() === so_hd.toLowerCase())
    }
    if (!contractRow && so_po) {
      contractRow = contractsRaw.value.find(r => String(r?.[22] ?? '').trim().toLowerCase() === so_po.toLowerCase())
    }

    // Nếu vẫn không tìm thấy, có thể do cache của action=all. Fetch fresh data cho hợp đồng
    if (!contractRow) {
      const freshContracts = await fetch(`${BASE_URL}?action=hop_dong_tong_quat&t=${Date.now()}`).then(r => r.json())
      if (Array.isArray(freshContracts)) {
        contractsRaw.value = freshContracts
        if (ma_hd) contractRow = contractsRaw.value.find(r => String(r?.[0] ?? '').trim().toLowerCase() === ma_hd.toLowerCase())
        if (!contractRow && so_hd) contractRow = contractsRaw.value.find(r => String(r?.[1] ?? '').trim().toLowerCase() === so_hd.toLowerCase())
        if (!contractRow && so_po) contractRow = contractsRaw.value.find(r => String(r?.[22] ?? '').trim().toLowerCase() === so_po.toLowerCase())
      }
    }

    if (!contractRow) {
      loadPipelineMsg.value = '❌ Đã tìm thấy PO nhưng không tìm thấy Hợp đồng tương ứng!'
      loadingPipeline.value = false
      return
    }

    const ma = String(contractRow?.[0] ?? '').trim()
    const so = String(contractRow?.[1] ?? '').trim()

    loadedMaHopDong.value = ma
    loadedMaHopDongGoc.value = String(contractRow?.[32] ?? '').trim() || ma  // ✅ GHI NHỚ MÃ GỐC
    soHopDong.value = so || soHopDong.value
    maHopDong.value = `HD${Date.now()}`
    ghiChuHopDong.value = String(contractRow?.[16] ?? '').trim()
    
    chietKhauTruocThuePct.value = toNum(contractRow?.[26], 0)
    thueChenhLechPct.value = toNum(contractRow?.[28], 0)

    const maKH = String(contractRow?.[2] ?? '').trim()
    if (maKH) fillCustomerByMa(maKH)
    else {
      const tenKH = String(contractRow?.[3] ?? '').trim()
      if (tenKH) fillCustomerByTen(tenKH)
    }

    let allCT = allData.hop_dong_chi_tiet || []
    let mineCT = allCT.filter((r: any[]) => String(r?.[0] ?? '').trim() === ma)
    
    if (mineCT.length === 0) {
      allCT = await fetch(`${BASE_URL}?action=hop_dong_chi_tiet&t=${Date.now()}`).then(r => r.json())
      if (Array.isArray(allCT)) {
        mineCT = allCT.filter((r: any[]) => String(r?.[0] ?? '').trim() === ma)
      }
    }

    selectedItems.value = mineCT.map(mapHopDongChiTietRowToItem)

    selectedItems.value.forEach(it => {
      if (it.Ma_hang) qtyMap[it.Ma_hang] = Math.max(1, toNum(it.So_luong, 1))
    })

    let allCTMH = allData.chi_tiet_mua_hang || []
    let myCTMH = allCTMH.filter((r: any[]) => String(r?.[2] ?? '').trim().toLowerCase() === so_po.toLowerCase() || (so_hd && String(r?.[1] ?? '').trim().toLowerCase() === so_hd.toLowerCase()))

    if (myCTMH.length === 0) {
      allCTMH = await fetch(`${BASE_URL}?action=chi_tiet_mua_hang&t=${Date.now()}`).then(r => r.json())
      if (Array.isArray(allCTMH)) {
        myCTMH = allCTMH.filter((r: any[]) => String(r?.[2] ?? '').trim().toLowerCase() === so_po.toLowerCase() || (so_hd && String(r?.[1] ?? '').trim().toLowerCase() === so_hd.toLowerCase()))
      }
    }

    let allDR = allData.deal_reg || []
    let myDR = allDR.filter((r: any[]) => String(r?.[2] ?? '').trim().toLowerCase() === so_po.toLowerCase() || (so_hd && String(r?.[1] ?? '').trim().toLowerCase() === so_hd.toLowerCase()))

    if (myDR.length === 0) {
      allDR = await fetch(`${BASE_URL}?action=deal_reg&t=${Date.now()}`).then(r => r.json())
      if (Array.isArray(allDR)) {
        myDR = allDR.filter((r: any[]) => String(r?.[2] ?? '').trim().toLowerCase() === so_po.toLowerCase() || (so_hd && String(r?.[1] ?? '').trim().toLowerCase() === so_hd.toLowerCase()))
      }
    }

    loadedPipelineExtraData.value = {
      po: poRow,
      contract: contractRow,
      chiTietMuaHang: myCTMH,
      dealReg: myDR
    }

    showLoadPipelineModal.value = false
    loadingPipeline.value = false
    loadPipelineFilter.value = ''
    showAsyncSuccess('Load Pipeline thành công', `PO: ${so_po}`)
    
    showPipelineModal.value = true

  } catch (e: any) {
    console.error(e)
    loadPipelineMsg.value = '❌ Lỗi load: ' + String(e?.message || e)
    showAsyncError('Load Pipeline thất bại', String(e?.message || e))
    loadingPipeline.value = false
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
  const donGiaGoc = getGocNumber(i, '_Don_gia_goc', toNum(i.Don_gia, 0))
  return hardware + donGiaGoc
}

function donGiaSauOffGoc(i: any) {
  const lp = donGiaLPGoc(i)
  const pctOff = getGocNumber(i, '_muc_phan_tram_off_goc', toNum(i.muc_phan_tram_off, 0))
  const discounted = lp * (1 - pctOff / 100)
  const nhap = getGocNumber(i, '_gia_nhap_goc', toNum(i.gia_nhap, 0))
  return discounted + nhap
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
  return round2(toNum(i.Gia_tieu_chuan, 0) * tg)
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
  let truoc = 0, vat = 0, loi = 0, off = 0
  selectedItems.value.forEach(i => {
    truoc += lineTruocThueRaw(i)
    vat += lineVATRaw(i)
    loi += lineLoiNhuanRaw(i)

    const tg = getGocNumber(i, '_Ti_gia_goc', toNum(i.Ti_gia, 1))
    const lpVnd = donGiaLPGoc(i) * tg
    const pctOff = getGocNumber(i, '_muc_phan_tram_off_goc', toNum(i.muc_phan_tram_off, 0))
    off += lpVnd * (pctOff / 100) * toNum(i.So_luong, 1)
  })
  return {
    truoc: round2(truoc),
    vat: round2(vat),
    sau: round2(truoc + vat),
    loi: round2(loi),
    off: round2(off)
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
  maHopDongCu: string | null,
  soPO: string = '',
  tenPO: string = '',
  maHopDongGoc: string | null = null
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

  // ✅ ma_hop_dong_goc: lấy từ bản cũ hoặc chính nó nếu là bản đầu tiên
  const goc = maHopDongGoc || maHopDong.value

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
      maHopDongCu || ''  ,   // ✅ CỘT index 19
      toNum(tongGiaThucTe.value, 0),  // ✅ index 20 - tong_gia_thuc_te
      formatCreatedTimeVN(new Date()), // ✅ index 21 - created_time
      soPO,                            // ✅ index 22 - So_PO
      tenPO,                           // ✅ index 23 - Ten_PO
      '',                              // ✅ index 24 - content_of_contract_po
      toNum(chietKhauTruocThue.value, 0),       // 25
      toNum(chietKhauTruocThuePct.value, 0),    // 26
      toNum(thueChenhLech.value, 0),            // 27
      toNum(thueChenhLechPct.value, 0),         // 28
      toNum(chenhLechGia.value, 0),             // 29
      toNum(conLai.value, 0),                   // 30
      toNum(tongChietKhau.value, 0),            // 31
      goc,                                      // ✅ index 32 - ma_hop_dong_goc
      false                                     // ✅ index 33 - isCompleted
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
    showAsyncError('⚠️ Thiếu thông tin bắt buộc', err + '\nVui lòng nhập đầy đủ thông tin khách hàng trước khi lưu.')
    return
  }

  // Optimistic: show success immediately
  const payload = {
    hd_tong_quat_row: buildHopDongTongQuatRow(
      'Tạm',
      loadedMaHopDong.value,
      currentPO.value || '',
      soHopDong.value || '',
      loadedMaHopDongGoc.value
    ),
    hd_chi_tiet_rows: buildHopDongChiTietRows()
  }

  saveMsg.value = '✅ Đã lưu Hợp đồng TẠM thành công!'
  showAsyncLoading('Đang đồng bộ lưu tạm...')

  // Fire-and-forget POST
  postApi('save_contract_temp', payload)
    .then(() => {
      isDataSaved.value = true
      showAsyncSuccess('Lưu tạm thành công', 'Dữ liệu đã được đồng bộ lên hệ thống.')
      setTimeout(() => window.location.reload(), 1500)
    })
    .catch((e: any) => {
      showAsyncError('Lưu tạm thất bại', 'Lỗi: ' + String(e?.message || e) + '. Vui lòng thử lại.')
    })
}



async function saveContractOfficialAndSaleReport() {
  saveMsg.value = ''
  const err = canSaveContractBasic()
  if (err) {
    saveMsg.value = err
    showAsyncError('⚠️ Thiếu thông tin bắt buộc', err + '\nVui lòng nhập đầy đủ thông tin khách hàng trước khi lưu.')
    return
  }

  try {
    saving.value = true
    showAsyncLoading('Đang lưu chính thức & Sale Report...')
    const tongSauThue = round2(totals.value.sau)

    // Auto-gen So_PO
    let nextPO = ''
    try {
      const poData = await fetch(`${BASE_URL}?action=po_dxmh`).then(r => r.json())
      let maxPO = 0
      if (Array.isArray(poData)) {
        poData.forEach(row => {
          const soPo = parseInt(String(row[2] || '').replace(/\D/g, ''))
          if (!isNaN(soPo) && soPo > maxPO) maxPO = soPo
        })
      }
      nextPO = String(maxPO + 1)
    } catch {}

    const payload = {
      hd_tong_quat_row: buildHopDongTongQuatRow(
        'Chính thức',
        loadedMaHopDong.value,
        nextPO,
        soHopDong.value,
        loadedMaHopDongGoc.value
      ),
      hd_chi_tiet_rows: buildHopDongChiTietRows(),
      ma_khach_hang: (khach.value.Ma_khach_hang || '').trim(),
      tong_sau_thue: tongSauThue
    }

    // 1) Lưu chính thức
    await postApi('save_contract_official', payload)

    // 2) Lưu vào sale_report (dùng format giống pipeline)
    const t = totals.value
    const firstItem = selectedItems.value[0] || {} as any

    // Upload file báo giá lên Cloudinary
    let linkBaoGia = ''
    const tenFileBaoGia = `BaoGia_${soHopDong.value || maHopDong.value}.xlsx`
    try {
      const blob = await generateQuoteExcelBlob()
      const formData = new FormData()
      formData.append('upload_preset', 'upload_file')
      formData.append('file', blob, tenFileBaoGia)
      const uploadRes = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', {
        method: 'POST',
        body: formData
      }).then(r => r.json())
      linkBaoGia = uploadRes.secure_url || ''
    } catch (e) {
      console.error('Lỗi upload file báo giá lên Cloudinary:', e)
    }

    const srPayload = {
      sheet: 'sale_report',
      action: 'add',
      ma_hop_dong: maHopDong.value,
      so_hop_dong: soHopDong.value,
      So_PO: nextPO,
      content_of_contract_PO: soHopDong.value,
      Ma_khach_hang: (khach.value.Ma_khach_hang || '').trim(),
      Ten_khach_hang: (khach.value.Ten_khach_hang || '').trim(),
      Ma_cong_ty: (khach.value.Ma_cong_ty || '').trim(),
      Ten_cong_ty: (khach.value.Ten_cong_ty || '').trim(),
      MST: (khach.value.MST || '').trim(),
      Ma_nha_cung_cap: firstItem.Ma_nha_cung_cap || '',
      Ten_nha_cung_cap: firstItem.Ten_nha_cung_cap || '',
      Tong_tien_truoc_thueVAT: round2(t.truoc),
      Tong_thueVAT: round2(t.vat),
      Tong_tien_sau_thueVAT: round2(t.sau),
      chiet_khau_tong_truoc_thue: toNum(chietKhauTruocThue.value, 0),
      phan_tram_chiet_khau_tong_truoc_thue: toNum(chietKhauTruocThuePct.value, 0),
      thue_chenh_lech_gia: toNum(thueChenhLech.value, 0),
      phan_tram_thue_chenh_lech_gia: toNum(thueChenhLechPct.value, 0),
      chenh_lech_gia: toNum(chenhLechGia.value, 0),
      con_lai: toNum(conLai.value, 0),
      tong_chiet_khau: toNum(tongChietKhau.value, 0),
      Tong_thanh_tien_chua_VAT_mua_hang: 0,
      Tong_CP_don_hang: 0,
      account_manager_name: 'LÊ PHI SƠN',
      link_excel_bao_gia: linkBaoGia,
      ten_file_bao_gia: tenFileBaoGia
    }

    try {
      await fetch(BASE_URL, { method: 'POST', body: JSON.stringify(srPayload) })
    } catch (e2) {
      console.warn('Lỗi lưu sale_report:', e2)
    }

    saveMsg.value = '✅ Đã lưu CHÍNH THỨC + SALE REPORT thành công!'
    isDataSaved.value = true
    showAsyncSuccess('Lưu thành công', 'Hợp đồng + Sale Report đã được đồng bộ.')
    loadedMaHopDong.value = null
    setTimeout(() => window.location.reload(), 1500)
  } catch (e: any) {
    saveMsg.value = '❌ Lỗi: ' + String(e?.message || e)
    showAsyncError('Lưu thất bại', String(e?.message || e))
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
      Danh_muc: String(row[8] ?? '').toUpperCase(),
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
    Danh_muc: String(row[7] ?? '').toUpperCase(),
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

function parseDateStr(str: string) {
  if (!str) return 0;
  const parts = str.trim().split(' ');
  let dPart = parts.length > 1 ? parts[1] : parts[0];
  const dSplit = dPart.split('/');
  if (dSplit.length === 3) {
    const timePart = parts.length > 1 ? parts[0] : '00:00:00';
    return new Date(`${dSplit[2]}-${dSplit[1]}-${dSplit[0]}T${timePart}`).getTime();
  }
  return 0;
}

const contractsSortedDesc = computed(() => {
  const uniqueMap = new Map()
  contractsRaw.value.forEach(r => {
    const ma = String(r?.[0] ?? '').trim()
    if (ma && !uniqueMap.has(ma)) {
      uniqueMap.set(ma, r)
    }
  })
  return Array.from(uniqueMap.values()).sort((a, b) => {
    const ta = parseDateStr(String(a?.[IDX_TIME] ?? ''))
    const tb = parseDateStr(String(b?.[IDX_TIME] ?? ''))
    return tb - ta
  })
})

const loadCustomerFilter = ref('')
const filteredContractsForLoad = computed(() => {
  let list = contractsSortedDesc.value
  if (loadCustomerFilter.value) {
    const kw = loadCustomerFilter.value.trim().toLowerCase()
    const matchedCustomer = customers.value.find(c => {
      const fullStr = `${c.Ten_khach_hang}${c.Ten_cong_ty ? ' - ' + c.Ten_cong_ty : ''}`.trim().toLowerCase()
      return fullStr === kw || c.Ten_khach_hang.trim().toLowerCase() === kw || c.Ma_khach_hang.trim().toLowerCase() === kw
    })

    if (matchedCustomer) {
      list = list.filter(r => String(r?.[2] ?? '').trim() === matchedCustomer.Ma_khach_hang)
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

const loadSearchQuery = ref('')
const loadFromDate = ref('')
const loadToDate = ref('')
const loadStatusFilter = ref('')
const loadSortBy = ref('desc')

const contractCards = computed(() => {
  let list = contractsSortedDesc.value
  
  if (loadSortBy.value === 'asc') {
    list = [...list].reverse()
  }

  if (loadStatusFilter.value) {
    list = list.filter(r => String(r?.[15] ?? '').trim() === loadStatusFilter.value)
  }

  if (loadFromDate.value || loadToDate.value) {
    const fromTime = loadFromDate.value ? new Date(loadFromDate.value + 'T00:00:00').getTime() : 0;
    const toTime = loadToDate.value ? new Date(loadToDate.value + 'T23:59:59').getTime() : Infinity;
    list = list.filter(r => {
      const t = parseDateStr(String(r?.[4] ?? ''))
      if (!t) return true;
      return t >= fromTime && t <= toTime;
    })
  }

  if (loadSearchQuery.value) {
    const kw = loadSearchQuery.value.trim().toLowerCase()
    list = list.filter(r => {
      const maHD = String(r?.[0] ?? '').toLowerCase()
      const soHD = String(r?.[1] ?? '').toLowerCase()
      const maKH = String(r?.[2] ?? '').toLowerCase()
      const tenKH = String(r?.[3] ?? '').toLowerCase()
      const soPO = String(r?.[22] ?? '').toLowerCase()
      
      const c = customers.value.find(x => x.Ma_khach_hang === String(r?.[2] ?? '').trim())
      const tenCongTy = c ? String(c.Ten_cong_ty || '').toLowerCase() : ''

      return maHD.includes(kw) || soHD.includes(kw) || maKH.includes(kw) || tenKH.includes(kw) || soPO.includes(kw) || tenCongTy.includes(kw)
    })
  }
  
  // Map thêm thông tin khách hàng và format data cho dễ dùng trên template
  return list.slice(0, 100).map(r => {
    const maKH = String(r?.[2] ?? '').trim()
    const c = customers.value.find(x => x.Ma_khach_hang === maKH)
    return {
      _raw: r,
      maHD: String(r?.[0] ?? ''),
      soHD: String(r?.[1] ?? ''),
      maKH: maKH,
      tenKH: String(r?.[3] ?? ''),
      ngay: String(r?.[4] ?? ''),
      truocThue: toNum(r?.[5], 0),
      sauThue: toNum(r?.[7], 0),
      trangThai: String(r?.[15] ?? 'Không rõ'),
      soPO: String(r?.[22] ?? ''),
      mst: c ? c.MST : '',
      tenCongTy: c ? c.Ten_cong_ty : '',
      tongGiaThucTe: toNum(r?.[20], 0),
      chenhLechGia: toNum(r?.[29], 0),
      conLai: toNum(r?.[30], 0),
      tongChietKhau: toNum(r?.[31], 0)
    }
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
    Hoa_hong: String(row[11] ?? ''),
    Tong_chi_tieu: String(row[12] ?? ''),
    Cong_no_chua_thanh_toan: String(row[13] ?? ''),
    Trang_thai: String(row[14] ?? ''),
    Ghi_chu: String(row[15] ?? ''),
    Ten_khach_hang_phu: String(row[16] ?? ''),
    So_dien_thoai_ca_nhan_phu: String(row[17] ?? ''),
    Email_ca_nhan_phu: String(row[18] ?? ''),
    MST: String(row[19] ?? ''),
    COMPANY: String(row[20] ?? ''),
    ADDRESS: String(row[21] ?? ''),
    TEL: String(row[22] ?? '')
  }
}

/* ======================
   INIT
====================== */
onMounted(async () => {
  // hop_dong_tong_quat
  contractsState.value = 'loading'
  const hdRows = await fetch(`${BASE_URL}?action=hop_dong_tong_quat`).then(r => r.json())
  contractsRaw.value = Array.isArray(hdRows) ? hdRows : []
  const hdLen = contractsRaw.value.length
  soHopDong.value = `HĐ${hdLen + 1}`
  markLoaded(contractsState)

  // hang_hoa
  productsState.value = 'loading'
  const ts = Date.now()
  const hhRows = await fetch(`${BASE_URL}?action=hang_hoa&t=${ts}`).then(r => r.json())
  const mappedProducts = (Array.isArray(hhRows) ? hhRows : []).map(mapHangHoaRow)
  products.value = mappedProducts
  markLoaded(productsState)

  // init qtyMap
  mappedProducts.forEach(p => {
    if (!qtyMap[p.Ma_hang]) qtyMap[p.Ma_hang] = 1
  })

  // khach_hang
  customersState.value = 'loading'
  const khRows = await fetch(`${BASE_URL}?action=khach_hang`).then(r => r.json())
  customers.value = (Array.isArray(khRows) ? khRows : []).map(mapKhachRow)
  markLoaded(customersState)

  // dieu_khoan
  termsState.value = 'loading'
  const dkRows = await fetch(`${BASE_URL}?action=dieu_khoan`).then(r => r.json())
  termsRaw.value = Array.isArray(dkRows) ? dkRows : []
  markLoaded(termsState)

  if (route.query.ma) {
    loadMode.value = 'MA'
    loadKey.value = String(route.query.ma)
    await loadInvoiceToFE()
  }

  // Tự động load Số PO tiếp theo từ po_dxmh nếu chưa có
  if (!currentPO.value) {
    try {
      const poData = await fetch(`${BASE_URL}?action=po_dxmh`).then(r => r.json())
      let maxPO = 0
      if (Array.isArray(poData)) {
        poData.forEach((row: any) => {
          const soPo = parseInt(String(row[2] || '').replace(/\D/g, ''))
          if (!isNaN(soPo) && soPo > maxPO) maxPO = soPo
        })
      }
      currentPO.value = String(maxPO + 1)
    } catch (e) {
      console.error('Không thể load số PO:', e)
    }
  }
})

/* ======================
   AUTO FILL KHÁCH (theo mã hoặc tên)
====================== */
function fillCustomerByMa(val: string) {
  const found = customers.value.find(c => c.Ma_khach_hang === val)
  if (!found) return
  isExistingCustomer.value = true
  originalKhach.value = JSON.parse(JSON.stringify(found))
  khach.value = JSON.parse(JSON.stringify(found))
  maKHInput.value = found.Ma_khach_hang
  tenKHInput.value = found.Ten_khach_hang
}

function fillCustomerByTen(val: string) {
  const found = customers.value.find(c => c.Ten_khach_hang === val)
  if (!found) return
  isExistingCustomer.value = true
  originalKhach.value = JSON.parse(JSON.stringify(found))
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
function fillCustomerByCongTy(val: string) {
  const found = customers.value.find(c => c.Ten_cong_ty === val)
  if (!found) return
  isExistingCustomer.value = true
  originalKhach.value = JSON.parse(JSON.stringify(found))
  khach.value = JSON.parse(JSON.stringify(found))
  maKHInput.value = found.Ma_khach_hang
  tenKHInput.value = found.Ten_khach_hang
}
function onBlurCongTy() {
  if (khach.value.Ten_cong_ty?.trim()) fillCustomerByCongTy(khach.value.Ten_cong_ty.trim())
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
function resolveMaHang(item: HangHoa) {
  if (!item.Ma_hang) return item.Ma_hang;
  const exactMatch = selectedItems.value.find(
    it => it.Ten_hang === item.Ten_hang && 
         (it.Ma_hang === item.Ma_hang || it.Ma_hang.startsWith(item.Ma_hang + '-V'))
  );
  if (exactMatch) return exactMatch.Ma_hang;

  const collision = selectedItems.value.find(it => it.Ma_hang === item.Ma_hang);
  if (collision && collision.Ten_hang !== item.Ten_hang) {
    let maxV = 0;
    selectedItems.value.forEach(it => {
      if (it.Ma_hang.startsWith(item.Ma_hang + '-V')) {
        const vNum = parseInt(it.Ma_hang.split('-V').pop() || '0');
        if (!isNaN(vNum) && vNum > maxV) maxV = vNum;
      }
    });
    return `${item.Ma_hang}-V${maxV + 1}`;
  }
  return item.Ma_hang;
}
function insertItemIntoGroup(cloned: any) {
  const targetCat = (cloned.Danh_muc || '').trim().toUpperCase();
  
  let insertIdx = -1;
  for (let i = selectedItems.value.length - 1; i >= 0; i--) {
    const cat = (selectedItems.value[i].Danh_muc || '').trim().toUpperCase();
    if (cat === targetCat) {
      insertIdx = i + 1;
      break;
    }
  }

  if (insertIdx !== -1) {
    selectedItems.value.splice(insertIdx, 0, cloned);
    return insertIdx;
  } else {
    selectedItems.value.push(cloned);
    return selectedItems.value.length - 1;
  }
}

function addItemFromCard(p: HangHoa) {
  const qty = Math.max(1, qtyMap[p.Ma_hang] || 1)
  const resolvedMaHang = resolveMaHang(p);

  const foundIdx = selectedItems.value.findIndex(
    it => it.Ma_hang === resolvedMaHang
  )

  let highlightIdx = -1;
  if (foundIdx >= 0) {
    selectedItems.value[foundIdx].So_luong += qty
    highlightIdx = foundIdx;
  } else {
    const cloned = cloneHang(p, qty);
    cloned.Ma_hang = resolvedMaHang;
    highlightIdx = insertItemIntoGroup(cloned);
  }
  
  scrollToAndHighlightRow(highlightIdx);
  triggerToast('Đã thêm sản phẩm thành công!');
}

function getLinkedItems(p: HangHoa) {
  if (!p.Ma_hang_lien_ket) return [];
  const codes = String(p.Ma_hang_lien_ket).split(/[,\n]+/).map(c => c.trim()).filter(Boolean);
  const names = p.Ten_hang_lien_ket ? String(p.Ten_hang_lien_ket).split(/[,\n]+/).map(n => n.trim()) : [];
  
  return codes.map((code, idx) => {
    let name = names[idx];
    if (!name) {
      const found = products.value.find(x => x.Ma_hang === code);
      name = found ? found.Ten_hang : code;
    }
    return { code, name };
  });
}

function addLinkedItem(code: string) {
  const foundProduct = products.value.find(x => x.Ma_hang === code);
  if (foundProduct) {
    addItemFromCard(foundProduct);
  }
}


function scrollToAndHighlightRow(idx: number, scroll = true) {
  setTimeout(() => {
    const rowEl = document.getElementById(`quote-row-${idx}`);
    if (rowEl) {
      if (scroll) {
        rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      rowEl.classList.remove('highlight-pulse');
      void rowEl.offsetWidth; // trigger reflow
      rowEl.classList.add('highlight-pulse');

      // Ensure highlight turns off and clean up any stuck drag classes
      setTimeout(() => {
        if (rowEl) {
          rowEl.classList.remove('highlight-pulse');
          rowEl.classList.remove('ghost-item');
          rowEl.classList.remove('sortable-chosen');
          rowEl.classList.remove('sortable-ghost');
        }
      }, 900);
    }
  }, 100);
}

function addItem(item: HangHoa & { So_luong: number }) {
  addAction(`Thêm hàng "${item.Ten_hang}"`)
  const resolvedMaHang = resolveMaHang(item);

  const foundIdx = selectedItems.value.findIndex(
    it => it.Ma_hang === resolvedMaHang
  )

  let highlightIdx = -1;
  if (foundIdx >= 0) {
    selectedItems.value[foundIdx].So_luong += Math.max(1, toNum(item.So_luong, 1))
    highlightIdx = foundIdx;
  } else {
    const cloned = withOriginalPriceFields(JSON.parse(JSON.stringify(item)));
    cloned.Ma_hang = resolvedMaHang;
    highlightIdx = insertItemIntoGroup(cloned);
  }
  
  // Rebuild liên kết cho TẤT CẢ hàng cùng danh mục (cả hàng mới lẫn hàng cũ)
  const addedCat = (item.Danh_muc || '').trim().toUpperCase();
  if (addedCat) rebuildCategoryLinks(addedCat);
  
  scrollToAndHighlightRow(highlightIdx);
  triggerToast('Đã thêm sản phẩm thành công!');
}

/**
 * Rebuild Ma_hang_lien_ket + Ten_hang_lien_ket cho TẤT CẢ item
 * trong selectedItems có cùng danh mục.
 * Mỗi item sẽ liên kết tới tất cả item khác cùng danh mục
 * (từ cả selectedItems + products database).
 */
function rebuildCategoryLinks(category: string) {
  const cat = category.trim().toUpperCase();
  if (!cat) return;

  // Thu thập tất cả item cùng danh mục trong bảng báo giá
  const itemsInCat = selectedItems.value.filter(
    it => (it.Danh_muc || '').trim().toUpperCase() === cat
  );
  
  // Thu thập tất cả item cùng danh mục trong kho sản phẩm (database)
  const productsInCat = products.value.filter(
    p => (p.Danh_muc || '').trim().toUpperCase() === cat
  );

  // Merge tất cả (Ma_hang -> Ten_hang), ưu tiên selectedItems
  const allMap = new Map<string, string>();
  itemsInCat.forEach(it => allMap.set(it.Ma_hang, it.Ten_hang));
  productsInCat.forEach(p => {
    if (!allMap.has(p.Ma_hang)) allMap.set(p.Ma_hang, p.Ten_hang);
  });

  // Với mỗi item trong bảng báo giá cùng danh mục, gán liên kết = tất cả item KHÁC
  itemsInCat.forEach(it => {
    const others = new Map(allMap);
    others.delete(it.Ma_hang); // loại chính nó
    if (others.size > 0) {
      it.Ma_hang_lien_ket = Array.from(others.keys()).join('\n');
      it.Ten_hang_lien_ket = Array.from(others.values()).join('\n');
    }
   });
}

const showConfirmAddDbModal = ref(false);
const pendingAddedItem = ref<any>(null);

async function handleAddManualItem() {
  const item = itemForm.value;
  
  // Thêm vào bảng báo giá trước (addItem sẽ tự rebuild liên kết danh mục)
  addItem(item);
  
  // Sau khi addItem, item trong selectedItems đã có Ma_hang_lien_ket được rebuild
  // Tìm item vừa thêm để lấy liên kết đã cập nhật
  const addedItem = selectedItems.value.find(it => it.Ma_hang === item.Ma_hang) || item;

  pendingAddedItem.value = addedItem;
  showConfirmAddDbModal.value = true;
  
  // Reset form sau khi thêm
  showManualModal.value = false;
  resetItem();
}

function confirmAddToDb() {
  showConfirmAddDbModal.value = false;
  const addedItem = pendingAddedItem.value;
  if (!addedItem) return;

  const payloadRow = [
    addedItem.Ma_hang || '',           // [0]
    addedItem.Ten_hang || '',           // [1]
    addedItem.Main_img || '',           // [2]
    addedItem.Ma_nha_cung_cap || '',    // [3]
    addedItem.Ten_nha_cung_cap || '',   // [4]
    addedItem.Mo_ta_chung || '',        // [5]
    addedItem.Mo_ta_chi_tiet || '',     // [6]
    addedItem.Features || '',           // [7]
    addedItem.Danh_muc || '',           // [8]
    addedItem.License_duration || '',   // [9]
    addedItem.DVT || '',               // [10]
    toNum(addedItem.Gia_tieu_chuan, 0), // [11]
    toNum(addedItem.Don_gia, 0),        // [12]
    addedItem.Trang_thai || '',         // [13]
    addedItem.Don_vi_tien_te || 'VND',  // [14]
    toNum(addedItem.Ti_gia, 1),         // [15]
    toNum(addedItem.Thue_VAT, 0),       // [16]
    addedItem.Ma_hang_lien_ket || '',   // [17]
    addedItem.Ten_hang_lien_ket || '',  // [18]
    addedItem.Ghi_chu || '',            // [19]
    toNum(addedItem.gia_hardware, 0),   // [20]
    toNum(addedItem.gia_nhap, 0),       // [21]
    toNum(addedItem.muc_phan_tram_off, 0), // [22] muc_%_off
    addedItem.Type || ''                // [23] TYPE
  ];

  // Optimistic: show toast + loading immediately
  triggerToast('Đã thêm hàng vào DATABASE thành công!');
  showAsyncLoading('Đang đồng bộ hàng hóa...');

  // Fire-and-forget POST
  postApi('addHangHoa', payloadRow)
    .then(() => {
      showAsyncSuccess('Thêm hàng hóa thành công', `Mã hàng: ${addedItem.Ma_hang}`)
    })
    .catch((err: any) => {
      showAsyncError('Thêm hàng hóa thất bại', 'Lỗi: ' + err.message + '. Vui lòng thử lại.')
    })
}

function cancelAddToDb() {
  showConfirmAddDbModal.value = false;
  pendingAddedItem.value = null;
}

function resetItem() {
  isMaHangEdited.value = false;
  isMaNccEdited.value = false;
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
  isExistingCustomer.value = false
  originalKhach.value = null
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

const savingCustomer = ref(false)

async function saveCustomerToDB() {
  const k = khach.value
  const ma = maKHInput.value?.trim() || k.Ma_khach_hang?.trim()
  if (!ma) {
    alert('Vui lòng nhập hoặc tự động tạo Mã KH trước!')
    return
  }

  const isUpdate = isExistingCustomer.value
  const payload: Record<string, any> = {
    sheet: 'khach_hang',
    action: isUpdate ? 'update' : 'add',
    ma_khach_hang: ma,
    ten_khach_hang: tenKHInput.value || k.Ten_khach_hang || '',
    email_ca_nhan: k.Email_ca_nhan || '',
    so_dien_thoai_ca_nhan: k.So_dien_thoai_ca_nhan || '',
    ma_cong_ty: k.Ma_cong_ty || '',
    ten_cong_ty: k.Ten_cong_ty || '',
    so_dien_thoai_cong_ty: k.So_dien_thoai_cong_ty || '',
    so_fax_cong_ty: k.So_fax_cong_ty || '',
    dia_chi_cong_ty: k.Dia_chi_cong_ty || '',
    email_cong_ty: k.Email_cong_ty || '',
    website_cong_ty: k.Website_cong_ty || '',
    hoa_hong: k.Hoa_hong || '',
    tong_chi_tieu: k.Tong_chi_tieu || 0,
    cong_no_chua_thanh_toan: k.Cong_no_chua_thanh_toan || 0,
    trang_thai: k.Trang_thai || '',
    ghi_chu: k.Ghi_chu || '',
    ten_khach_hang_phu: k.Ten_khach_hang_phu || '',
    so_dien_thoai_ca_nhan_phu: k.So_dien_thoai_ca_nhan_phu || '',
    email_ca_nhan_phu: k.Email_ca_nhan_phu || '',
    mst: k.MST || '',
    company: k.COMPANY || '',
    address: k.ADDRESS || '',
    tel: k.TEL || '',
  }

  // Optimistic: update FE immediately
  isExistingCustomer.value = true
  originalKhach.value = JSON.parse(JSON.stringify(k))
  savingCustomer.value = false
  showAsyncLoading(`Đang ${isUpdate ? 'cập nhật' : 'thêm'} khách hàng...`)

  // Fire-and-forget POST
  fetch(BASE_URL, { method: 'POST', body: JSON.stringify(payload) })
    .then(r => r.json())
    .then(async (result) => {
      if (result.status === 'success') {
        showCustomerDetailModal.value = false;
        showAsyncSuccess(
          `${isUpdate ? 'Cập nhật' : 'Thêm'} KH thành công`,
          `Mã KH: ${ma}`
        )
        // Refresh customer list ngầm
        try {
          const khRows = await fetch(`${BASE_URL}?action=khach_hang`).then(r => r.json())
          if (Array.isArray(khRows)) {
            customers.value = khRows.map((row: any) => ({
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
              Hoa_hong: String(row[11] ?? ''),
              Tong_chi_tieu: String(row[12] ?? ''),
              Cong_no_chua_thanh_toan: String(row[13] ?? ''),
              Trang_thai: String(row[14] ?? ''),
              Ghi_chu: String(row[15] ?? ''),
              Ten_khach_hang_phu: String(row[16] ?? ''),
              So_dien_thoai_ca_nhan_phu: String(row[17] ?? ''),
              Email_ca_nhan_phu: String(row[18] ?? ''),
              MST: String(row[19] ?? ''),
              COMPANY: String(row[20] ?? ''),
              ADDRESS: String(row[21] ?? ''),
              TEL: String(row[22] ?? ''),
            }))
          }
        } catch {}
      } else {
        showAsyncError('Lưu KH thất bại', 'Lỗi: ' + (result.message || 'Không rõ'))
      }
    })
    .catch((err: any) => {
      showAsyncError('Lưu KH thất bại', 'Lỗi kết nối: ' + err.message)
    })
}

/* ======================
   CARD MODAL (full fields)
====================== */
function openCardModal(p: HangHoa) {
  isCardMaHangEdited.value = false;
  isCardMaNccEdited.value = false;
  const qty = qtyMap[p.Ma_hang] || 1
  cardEdit.value = cloneHang(p, qty)
  showCardModal.value = true
}

function openSuggestedCardModal(code: string) {
  const found = products.value.find(x => x.Ma_hang === code)
  if (found) {
    openCardModal(found)
  }
}

function addFromCardModal() {
  if (!cardEdit.value) return

  const resolvedMaHang = resolveMaHang(cardEdit.value);

  const foundIdx = selectedItems.value.findIndex(
    it => it.Ma_hang === resolvedMaHang
  )

  let highlightIdx = -1;
  if (foundIdx >= 0) {
    selectedItems.value[foundIdx].So_luong += Math.max(1, toNum(cardEdit.value.So_luong, 1))
    highlightIdx = foundIdx;
  } else {
    const cloned = withOriginalPriceFields(JSON.parse(JSON.stringify(cardEdit.value)));
    cloned.Ma_hang = resolvedMaHang;
    highlightIdx = insertItemIntoGroup(cloned);
  }
  
  scrollToAndHighlightRow(highlightIdx);
  triggerToast('Đã thêm sản phẩm thành công!');

  qtyMap[cardEdit.value.Ma_hang] = Math.max(1, toNum(cardEdit.value.So_luong, 1))
  showCardModal.value = false
}


/* ======================
   PREVIEW MODAL (quote)
   - editable like excel: qty, don_gia, VAT
====================== */
/* ✅ Đơn giá LP = hardware + Don_gia gốc */
function donGiaLP(i: any) {
  const hardware = toNum(i.gia_hardware, 0)
  const donGiaGoc = toNum(i.Don_gia, 0)
  return hardware + donGiaGoc
}

/* ✅ Đơn giá sau chiết khấu = (LP × (1 - %off/100)) + giá nhập */
function donGiaSauOff(i: any) {
  const lp = donGiaLP(i)
  const pctOff = toNum(i.muc_phan_tram_off, 0)
  const discounted = lp * (1 - pctOff / 100)
  const nhap = toNum(i.gia_nhap, 0)
  return discounted + nhap
}

/* ✅ Hiển thị Giá Tiêu Chuẩn (theo mode VND) */
function displayGiaTieuChuan(i: any) {
  const tc = toNum(i.Gia_tieu_chuan, 0)
  const tg = toNum(i.Ti_gia, 1)
  return formatVND(tc * tg)
}
function displayGiaTieuChuanRaw(i: any) {
  const tc = toNum(i.Gia_tieu_chuan, 0)
  const tg = getGocNumber(i, '_Ti_gia_goc', toNum(i.Ti_gia, 1))
  return formatVND(tc * tg)
}

function displayGiaTieuChuanPct(i: any) {
  const lp = donGiaLP(i)
  const tc = toNum(i.Gia_tieu_chuan, 0)
  if (!lp || lp === 0) return 0
  return round2((1 - tc / lp) * 100)
}

function displayGiaTieuChuanPctRaw(i: any) {
  const lp = donGiaLPGoc(i)
  const tc = toNum(i.Gia_tieu_chuan, 0)
  if (!lp || lp === 0) return 0
  return round2((1 - tc / lp) * 100)
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

function displayMucOffAmount(i: any) {
  const lp = donGiaLP(i)
  const pctOff = toNum(i.muc_phan_tram_off, 0)
  const tg = toNum(i.Ti_gia, 1)
  return formatVND(lp * (pctOff / 100) * tg)
}

function displayMucOffAmountRaw(i: any) {
  const tg = getGocNumber(i, '_Ti_gia_goc', toNum(i.Ti_gia, 1))
  const lpVnd = donGiaLPGoc(i) * tg
  const pctOff = getGocNumber(i, '_muc_phan_tram_off_goc', toNum(i.muc_phan_tram_off, 0))
  return formatVND(lpVnd * (pctOff / 100))
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
  const price = unitPrice(i)
  if (price <= 0) return ''
  const base = standardPrice(i)
  return (((price - base) / price) * 100).toFixed(2)
}
function lineLoiNhuanPctRaw(i: any) {
  const price = unitPriceRaw(i)
  if (price <= 0) return ''
  const base = standardPriceRaw(i)
  return (((price - base) / price) * 100).toFixed(2)
}

/* ======================
   TOTALS
====================== */
const totals = computed(() => {
  let truoc = 0,
    vat = 0,
    loi = 0,
    off = 0

  selectedItems.value.forEach(i => {
    truoc += lineTruocThue(i)
    vat += lineVAT(i)
    loi += lineLoiNhuan(i)

    const lp = donGiaLP(i)
    const pctOff = toNum(i.muc_phan_tram_off, 0)
    const tg = toNum(i.Ti_gia, 1)
    off += lp * (pctOff / 100) * tg * toNum(i.So_luong, 1)
  })

  return {
    truoc: round2(truoc),
    vat: round2(vat),
    sau: round2(truoc + vat),
    loi: round2(loi),
    off: round2(off)
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
  return round2((toNum(tongGiaThucTe.value, 0) * pct) / 100)
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
    const cat = (it.Danh_muc || '').trim()
    const gKey = cat.toUpperCase()

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
const pendingQuoteEditFocusField = ref('')
const showQuoteEditRawModal = ref(false)
const quoteEditRaw = ref<(HangHoa & { So_luong: number }) | null>(null)
const quoteEditRawIdx = ref(-1)

const quoteEditTieuChuanPct = computed(() => {
  if (!quoteEdit.value) return 0;
  const lp = donGiaLP(quoteEdit.value);
  const tc = toNum(quoteEdit.value.Gia_tieu_chuan, 0);
  if (!lp || lp === 0) return 0;
  return round2((1 - tc / lp) * 100);
});

function updateTieuChuanPct(val: number) {
  if (!quoteEdit.value) return;
  const lp = donGiaLP(quoteEdit.value);
  quoteEdit.value.Gia_tieu_chuan = lp * (1 - val / 100);
  quoteEdit.value = { ...quoteEdit.value };
}

function openQuoteEdit(idx: number, focusField?: string) {
  const it = selectedItems.value[idx]
  if (!it) return
  closeQuoteEditRaw()
  withOriginalPriceFields(it)
  quoteEdit.value = JSON.parse(JSON.stringify(it))
  quoteEditIdx.value = idx
  pendingQuoteEditFocusField.value = focusField || ''
  showQuoteEditModal.value = true
}

function closeQuoteEdit() {
  showQuoteEditModal.value = false
  quoteEdit.value = null
  quoteEditIdx.value = -1
}

watch(showQuoteEditModal, (val) => {
  console.log('[watch showQuoteEditModal] val=', val, 'pendingFocusField=', pendingQuoteEditFocusField.value)
  if (val && pendingQuoteEditFocusField.value) {
    const field = pendingQuoteEditFocusField.value
    pendingQuoteEditFocusField.value = ''
    const tryFocus = (attempts = 0) => {
      if (attempts > 20) {
        console.warn('[watch showQuoteEditModal] tryFocus failed after 20 attempts for field:', field)
        return
      }
      const el = document.getElementById('qe-' + field)
      console.log('[watch showQuoteEditModal] attempt=', attempts, 'field=', field, 'found el=', !!el)
      if (!el) {
        setTimeout(() => tryFocus(attempts + 1), 100)
        return
      }
      const input = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')
        ? el as HTMLInputElement
        : el.querySelector('input, textarea') as HTMLInputElement | null
      console.log('[watch showQuoteEditModal] input element=', input?.tagName, 'readonly=', input?.readOnly)
      if (input) {
        input.focus()
        if (typeof input.select === 'function') input.select()
        input.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
    setTimeout(tryFocus, 200)
  }
})

const pendingFocusField = ref('')

function openQuoteEditRaw(idx: number, focusField?: string) {
  console.log('[openQuoteEditRaw] idx=', idx, 'focusField=', focusField)
  const it = selectedItems.value[idx]
  if (!it) return
  closeQuoteEdit()
  withOriginalPriceFields(it)
  quoteEditRaw.value = JSON.parse(JSON.stringify(it))
  quoteEditRawIdx.value = idx
  pendingFocusField.value = focusField || ''
  showQuoteEditRawModal.value = true
}

watch(showQuoteEditRawModal, (val) => {
  console.log('[watch showQuoteEditRawModal]', val, 'pendingField=', pendingFocusField.value)
  if (val && pendingFocusField.value) {
    const field = pendingFocusField.value
    pendingFocusField.value = ''
    
    // Đợi DOM render xong rồi mới focus
    const tryFocus = (attempts = 0) => {
      if (attempts > 20) return
      
      const el = document.getElementById('qeraw-' + field)
      console.log('[tryFocus] attempt=', attempts, 'field=', field, 'found=', !!el)
      if (!el) {
        setTimeout(() => tryFocus(attempts + 1), 100)
        return
      }
      
      const input = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') 
        ? el as HTMLInputElement
        : el.querySelector('input, textarea') as HTMLInputElement | null
      
      console.log('[tryFocus] input=', input?.tagName, 'id=', el.id)
      if (input) {
        input.focus()
        if (typeof input.select === 'function') input.select()
        input.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
    
    setTimeout(tryFocus, 200)
  }
})

function closeQuoteEditRaw() {
  showQuoteEditRawModal.value = false
  quoteEditRaw.value = null
  quoteEditRawIdx.value = -1
}

const _adjustedFields = new Set<string>()

function saveQuoteEdit() {
  if (!quoteEdit.value) return
  const idx = quoteEditIdx.value
  if (idx < 0) return

  const old = selectedItems.value[idx]
  const cur = quoteEdit.value
  const fieldLabels: Record<string, string> = {
    So_luong: 'Số lượng',
    Don_gia: 'Đơn giá',
    gia_hardware: 'Giá Hardware',
    gia_nhap: 'Giá Nhập',
    Thue_VAT: 'VAT',
    muc_phan_tram_off: 'Chiết khấu'
  }
  for (const [key, label] of Object.entries(fieldLabels)) {
    if (_adjustedFields.has(key)) continue  // đã ghi từ applyAdjustPrice
    const oldV = toNum((old as any)[key], 0)
    const newV = toNum((cur as any)[key], 0)
    if (oldV !== newV) {
      addAction(`Sửa ${label} của hàng "${cur.Ten_hang}" từ ${formatVND(oldV)} → ${formatVND(newV)}`, oldV, newV)
    }
  }
  _adjustedFields.clear()

  // ép số an toàn
  quoteEdit.value.So_luong = Math.max(1, toNum(quoteEdit.value.So_luong, 1))
  quoteEdit.value.Don_gia = Math.max(0, toNum(quoteEdit.value.Don_gia, 0))
  quoteEdit.value.Gia_tieu_chuan = Math.max(0, toNum(quoteEdit.value.Gia_tieu_chuan, 0))
  quoteEdit.value.Ti_gia = Math.max(0, toNum(quoteEdit.value.Ti_gia, 1))
  quoteEdit.value.Thue_VAT = Math.max(0, toNum(quoteEdit.value.Thue_VAT, 0))

  // Đồng bộ _gia_nhap_goc = gia_nhap mới để thay đổi giá nhập không tính vào chênh lệch giá
  quoteEdit.value._gia_nhap_goc = toNum(quoteEdit.value.gia_nhap, 0)

  // replace item -> totals tự tính lại vì totals là computed
  const updatedItem = JSON.parse(JSON.stringify(quoteEdit.value))
  const oldCat = (old.Danh_muc || '').trim().toUpperCase()
  const newCat = (updatedItem.Danh_muc || '').trim().toUpperCase()

  if (oldCat !== newCat) {
    selectedItems.value.splice(idx, 1)
    insertItemIntoGroup(updatedItem)
  } else {
    selectedItems.value[idx] = updatedItem
  }
  
  closeQuoteEdit()
}

function saveQuoteEditRaw() {
  if (!quoteEditRaw.value) return
  const idx = quoteEditRawIdx.value
  if (idx < 0) return
  const dst = selectedItems.value[idx]
  if (!dst) return

  addAction(`Sửa giá trị gốc của hàng "${dst.Ten_hang}"`)

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

/* ======================
   ✅ ĐIỀU CHỈNH GIÁ LIC
====================== */
const adjustPriceModal = ref({
  show: false,
  mode: 'item' as 'item'|'group'|'all'|'field',
  targetId: '', // item idx, group key, or ''
  targetName: '',
  targetField: '', // field key like Don_gia, gia_hardware
  currentTotal: 0,
  adjustType: 'percent' as 'percent' | 'number',
  percentValue: 0,
  numberValue: 0,
})

function openAdjustPrice(mode: 'item'|'group'|'all'|'field', id: string, name: string, field?: string) {
  let total = 0;
  if (mode === 'item') {
    const item = selectedItems.value[Number(id)];
    total = lineTruocThue(item);
  } else if (mode === 'group') {
    const items = selectedItems.value.filter(it => {
      const cat = (it.Danh_muc || '').trim();
      return cat.toUpperCase() === id;
    });
    total = items.reduce((sum, it) => sum + lineTruocThue(it), 0);
  } else if (mode === 'field') {
    if (!quoteEdit.value || !field) return;
    if (field === 'unit_price_kh') {
      total = unitPrice(quoteEdit.value);
    } else if (field === 'line_truoc_thue') {
      total = lineTruocThue(quoteEdit.value);
    } else if (field === 'item_chenh_lech') {
      total = lineTruocThue(quoteEdit.value) - lineTruocThueRaw(quoteEdit.value);
    } else {
      let tg = 1;
      if (['Don_gia', 'gia_hardware', 'gia_nhap'].includes(field)) {
        tg = toNum(quoteEdit.value.Ti_gia, 1) || 1;
      }
      total = toNum((quoteEdit.value as any)[field], 0) * tg;
    }
  } else if (mode === 'all') {
    if (field === 'total_chenh_lech') {
      total = chenhLechGia.value;
    } else {
      total = totals.value.truoc;
    }
  } else {
    total = totals.value.truoc;
  }
  
  adjustPriceModal.value = {
    show: true,
    mode,
    targetId: id,
    targetName: name,
    targetField: field || '',
    currentTotal: total,
    adjustType: 'percent',
    percentValue: 0,
    numberValue: total
  };
}

function applyAdjustPrice() {
  const { mode, targetId, targetField, currentTotal, adjustType, percentValue, numberValue } = adjustPriceModal.value;
  
  // Tính giá trị cũ trước khi thay đổi
  let oldTotal = currentTotal;
  let actionName = ''
  let fieldLabel = ''
  if (mode === 'field') {
    fieldLabel = targetField === 'Don_gia' ? 'Đơn giá' : targetField === 'gia_hardware' ? 'Giá Hardware' : targetField === 'line_truoc_thue' ? 'Tổng Trước Thuế' : 'Giá Nhập'
  }

  let factor = 1;
  let splitAmount = 0;
  
  if (adjustType === 'percent') {
    factor = 1 + (percentValue / 100);
  } else {
    if (currentTotal === 0) {
      let count = 0;
      if (mode === 'item' || mode === 'field') {
        count = 1;
      } else if (mode === 'group') {
        count = selectedItems.value.filter(it => {
          const cat = (it.Danh_muc || '').trim();
          return cat.toUpperCase() === targetId;
        }).length;
      } else if (mode === 'all') {
        count = selectedItems.value.length;
      }
      if (count > 0) {
        splitAmount = numberValue / count;
      }
    } else {
      factor = numberValue / currentTotal;
    }
  }
  
  if (mode === 'field') {
    if (!quoteEdit.value) return;

    // Xử lý đặc biệt: Đơn giá (KH), Thành tiền trước thuế, và Chênh lệch giá → reverse-calc về Don_gia
    if (targetField === 'unit_price_kh' || targetField === 'line_truoc_thue' || targetField === 'item_chenh_lech') {
      const isUP = targetField === 'unit_price_kh';
      const isCL = targetField === 'item_chenh_lech';
      
      let oldValVnd = 0;
      if (isUP) oldValVnd = unitPrice(quoteEdit.value);
      else if (isCL) oldValVnd = lineTruocThue(quoteEdit.value) - lineTruocThueRaw(quoteEdit.value);
      else oldValVnd = lineTruocThue(quoteEdit.value);

      let newValVnd = adjustType === 'percent' ? (oldValVnd * factor) : numberValue;

      const label = isUP ? 'Đơn giá (KH)' : (isCL ? 'Chênh lệch giá' : 'Thành tiền trước thuế');
      addAction(`Sửa ${label} của hàng "${quoteEdit.value.Ten_hang}" từ ${formatVND(oldValVnd)} → ${formatVND(newValVnd)}`, oldValVnd, newValVnd);
      _adjustedFields.add('Don_gia');

      // Reverse: unitPrice = donGiaSauOff * Ti_gia, donGiaSauOff = LP*(1-%off/100) + gia_nhap, LP = Don_gia + gia_hardware
      let targetUPVnd = 0;
      const qty = Math.max(1, toNum(quoteEdit.value.So_luong, 1));
      if (isUP) {
        targetUPVnd = newValVnd;
      } else if (isCL) {
        const rawLine = lineTruocThueRaw(quoteEdit.value);
        const newLine = rawLine + newValVnd;
        targetUPVnd = newLine / qty;
      } else {
        targetUPVnd = newValVnd / qty;
      }
      const tg = toNum(quoteEdit.value.Ti_gia, 1) || 1;
      const newDonGiaSauOff = targetUPVnd / tg;
      const nhap = toNum(quoteEdit.value.gia_nhap, 0);
      const offMul = 1 - toNum(quoteEdit.value.muc_phan_tram_off, 0) / 100;
      const hw = toNum(quoteEdit.value.gia_hardware, 0);
      if (offMul > 0) {
        quoteEdit.value.Don_gia = (newDonGiaSauOff - nhap) / offMul - hw;
      }

      quoteEdit.value = { ...quoteEdit.value };
      adjustPriceModal.value.show = false;
      return;
    }

    let tg = 1;
    if (['Don_gia', 'gia_hardware', 'gia_nhap'].includes(targetField)) {
      tg = toNum(quoteEdit.value.Ti_gia, 1) || 1;
    }
    const oldValUSD = toNum((quoteEdit.value as any)[targetField], 0);
    const oldValVnd = oldValUSD * tg;
    
    let newValVnd = 0;
    if (adjustType === 'percent') {
      newValVnd = oldValVnd * factor;
    } else {
      newValVnd = numberValue;
    }
    newValVnd = round2(newValVnd);
    
    // Ghi lịch sử với giá trị cũ → mới
    addAction(`Sửa ${fieldLabel} của hàng "${quoteEdit.value.Ten_hang}" từ ${formatVND(oldValVnd)} → ${formatVND(newValVnd)}`, oldValVnd, newValVnd)
    _adjustedFields.add(targetField)

    const newValUSD = newValVnd / tg;

    // Cập nhật field mới
    if (targetField === 'Don_gia') { quoteEdit.value.Don_gia = newValUSD; }
    else if (targetField === 'gia_hardware') { quoteEdit.value.gia_hardware = newValUSD; }
    else if (targetField === 'gia_nhap') { quoteEdit.value.gia_nhap = newValUSD; }
    else { (quoteEdit.value as any)[targetField] = newValUSD; }
    
    // Force Vue to detect changes
    quoteEdit.value = { ...quoteEdit.value };
    
    adjustPriceModal.value.show = false;
    return;
  }
  
  const initialTotalTruoc = totals.value.truoc;
  const initialCount = selectedItems.value.length;

  const adjustItem = (it: HangHoa & { So_luong: number }) => {
     const currentLineTotal = lineTruocThue(it);
     let newLineTotal = currentLineTotal * factor;
     
     if (targetField === 'total_chenh_lech') {
       let targetDiff = adjustType === 'percent' ? (oldTotal * factor) : numberValue;
       if (initialTotalTruoc > 0) {
         newLineTotal = currentLineTotal + targetDiff * (currentLineTotal / initialTotalTruoc);
       } else {
         newLineTotal = currentLineTotal + targetDiff / Math.max(1, initialCount);
       }
     } else {
       if (adjustType === 'number' && currentTotal === 0) {
         newLineTotal = splitAmount;
       }
     }
     
     const qty = Math.max(1, toNum(it.So_luong, 1));
     const tg = toNum(it.Ti_gia, 1) || 1;
     const offMultiplier = 1 - (toNum(it.muc_phan_tram_off, 0) / 100);
     
     if (offMultiplier <= 0) return; // không thể chia cho 0 hoặc âm
     
     const requiredDonGiaSauOff = newLineTotal / (qty * tg);
     const requiredDonGiaLP = requiredDonGiaSauOff / offMultiplier;
     
     const hw = toNum(it.gia_hardware, 0);
     const nhap = toNum(it.gia_nhap, 0);
     
     it.Don_gia = Math.max(0, requiredDonGiaLP - hw - nhap);
  };

  if (mode === 'item') {
    adjustItem(selectedItems.value[Number(targetId)]);
  } else if (mode === 'group') {
    selectedItems.value.forEach(it => {
      const cat = (it.Danh_muc || '').trim();
      if (cat.toUpperCase() === targetId) {
        adjustItem(it);
      }
    });
  } else {
    selectedItems.value.forEach(it => adjustItem(it));
  }

  // Tính giá trị mới sau thay đổi
  let newTotal = 0;
  if (mode === 'item') {
    newTotal = lineTruocThue(selectedItems.value[Number(targetId)]);
  } else if (mode === 'group') {
    selectedItems.value.forEach(it => {
      const cat = (it.Danh_muc || '').trim();
      if (cat.toUpperCase() === targetId) newTotal += lineTruocThue(it);
    });
  } else {
    if (targetField === 'total_chenh_lech') {
      newTotal = totals.value.truoc - tongGiaThucTe.value;
    } else {
      selectedItems.value.forEach(it => { newTotal += lineTruocThue(it); });
    }
  }
  newTotal = round2(newTotal);
  
  // Ghi lịch sử chi tiết
  if (mode === 'item') {
    const itemName = selectedItems.value[Number(targetId)]?.Ten_hang || ''
    addAction(`Sửa tổng giá hàng "${itemName}" từ ${formatVND(oldTotal)} → ${formatVND(newTotal)}`, oldTotal, newTotal)
  } else if (mode === 'group') {
    addAction(`Sửa giá nhóm "${targetId.split('||').join(' - ')}" từ ${formatVND(oldTotal)} → ${formatVND(newTotal)}`, oldTotal, newTotal)
  } else {
    if (targetField === 'total_chenh_lech') {
      addAction(`Sửa Tổng chênh lệch giá từ ${formatVND(oldTotal)} → ${formatVND(newTotal)}`, oldTotal, newTotal)
    } else {
      addAction(`Sửa giá Toàn bộ báo giá từ ${formatVND(oldTotal)} → ${formatVND(newTotal)}`, oldTotal, newTotal)
    }
  }
  
  adjustPriceModal.value.show = false;
}

function removeSelected(idx: number) {
  if (idx < 0 || idx >= selectedItems.value.length) return
  addAction(`Xóa hàng "${selectedItems.value[idx]?.Ten_hang}"`)
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

async function generateQuoteExcelBlob(targetKhach: any = khach.value): Promise<Blob> {
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
  
  ws.getCell('A7').value = `Kính gởi: ${targetKhach?.Ten_cong_ty || ''}`;
  
  const cellA8 = ws.getCell('A8');
  cellA8.value = `Địa chỉ: ${targetKhach?.Dia_chi_cong_ty || targetKhach?.ADDRESS || ''}`;
  cellA8.font = { ...cellA8.font, italic: true };
  
  const cellA9 = ws.getCell('A9');
  cellA9.value = `Người nhận: ${targetKhach?.Ten_khach_hang || targetKhach?.CUS_CONTACT || ''}`;
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
  return new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function openExportExcelModal() {
  maKHInput.value = khach.value.Ma_khach_hang || '';
  tenKHInput.value = khach.value.Ten_khach_hang || '';
  showExportExcelModal.value = true;
}

async function exportQuoteExcel() {
  try {
    showAsyncLoading('Đang xuất file Excel...')
    const blob = await generateQuoteExcelBlob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BaoGia_${soHopDong.value || maHopDong.value || 'NTS'}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
    showAsyncSuccess('Xuất Excel thành công', 'File đã được tải về.')
  } catch(e: any) {
    console.error('Lỗi xuất Excel:', e)
    showAsyncError('Xuất Excel thất bại', String(e?.message || e))
  }
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

// Theo dõi lịch sử sau khi tất cả các biến đã được khởi tạo
trackHistory('chietKhauTruocThue', () => chietKhauTruocThue.value)
trackHistory('thueChenhLech', () => thueChenhLech.value)
trackHistory('chenhLechGia', () => chenhLechGia.value)
trackHistory('conLai', () => conLai.value)
trackHistory('tongChietKhau', () => tongChietKhau.value)
trackHistory('tongGiaThucTe', () => tongGiaThucTe.value)
trackHistory('truoc', () => totals.value.truoc)
trackHistory('vat', () => totals.value.vat)
trackHistory('sau', () => totals.value.sau)
trackHistory('loi', () => totals.value.loi)

function resetToanBoBaoGia() {
  selectedItems.value = [];
  flatQuoteRows.value = [];

  chietKhauTruocThuePct.value = 0;
  thueChenhLechPct.value = 0;
  ghiChuHopDong.value = '';
  selectedTermId.value = '';
  editableTermContent.value = '';

  actionHistory.value = [];
  for (const key in historyLogs.value) {
    historyLogs.value[key] = [];
  }

  triggerToast('Đã xóa trắng thông tin báo giá');
}

const fabPos = ref({ x: 12, y: 90 });
let isDraggingFab = false;
let isFabMoved = false;
let startMouseX = 0;
let startMouseY = 0;
let startX = 0;
let startY = 0;

function startDragFab(e: MouseEvent | TouchEvent) {
  const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
  
  isDraggingFab = true;
  isFabMoved = false;
  startMouseX = clientX;
  startMouseY = clientY;
  startX = clientX - fabPos.value.x;
  startY = clientY - fabPos.value.y;

  document.addEventListener('mousemove', dragFab);
  document.addEventListener('mouseup', stopDragFab);
  document.addEventListener('touchmove', dragFab, { passive: false });
  document.addEventListener('touchend', stopDragFab);
}

function dragFab(e: MouseEvent | TouchEvent) {
  if (!isDraggingFab) return;
  
  const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
  
  if (Math.abs(clientX - startMouseX) > 5 || Math.abs(clientY - startMouseY) > 5) {
    isFabMoved = true;
    if (e.cancelable) e.preventDefault();
  }

  if (isFabMoved) {
    let newX = clientX - startX;
    let newY = clientY - startY;
    
    newX = Math.max(0, Math.min(newX, window.innerWidth - 76));
    newY = Math.max(0, Math.min(newY, window.innerHeight - 76));
    
    fabPos.value.x = newX;
    fabPos.value.y = newY;
  }
}

function stopDragFab() {
  isDraggingFab = false;
  document.removeEventListener('mousemove', dragFab);
  document.removeEventListener('mouseup', stopDragFab);
  document.removeEventListener('touchmove', dragFab);
  document.removeEventListener('touchend', stopDragFab);
}

function onFabClick() {
  if (!isFabMoved) {
    showProductSidebar.value = true;
  }
}

// ===== CẢNH BÁO KHI ĐÓNG TRANG (TRÌNH DUYỆT) =====
const isDataSaved = ref(false)

watch([khach, selectedItems], () => {
  isDataSaved.value = false
}, { deep: true })

const onPipelineSaved = () => {
  isDataSaved.value = true
  setTimeout(() => window.location.reload(), 1500)
}

const hasUnsavedChanges = () => {
  if (isDataSaved.value) return false
  return (flatQuoteRows.value?.length || 0) > 0 || (khach.value?.ten || '').trim() !== '' || (khach.value?.congTy || '').trim() !== ''
}

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges()) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
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
            <button class="btn-manual-circle" @click="showManualModal = true" title="Nhập tay">+</button>
          </div>
          <button class="icon-btn" @click="showProductSidebar = false">✕</button>
        </div>
        <div class="top-bar">
          <div class="search-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input v-model="keyword" placeholder="Tìm mã / tên hàng / NCC..." class="search-input" />
          </div>

        </div>

        <div class="product-grid">
          <!-- LOADING SKELETON -->
          <template v-if="productsState === 'loading'">
            <div class="skeleton-card" v-for="n in 6" :key="'sk-'+n">
              <div class="skeleton-badges">
                <div class="skeleton-line" style="width: 60px; height: 14px;"></div>
                <div class="skeleton-line" style="width: 45px; height: 14px;"></div>
              </div>
              <div class="skeleton-line" style="width: 90%; height: 16px; margin-top: 10px;"></div>
              <div class="skeleton-line" style="width: 65%; height: 14px; margin-top: 6px;"></div>
              <div class="skeleton-line" style="width: 50%; height: 20px; margin-top: 12px;"></div>
              <div class="skeleton-footer">
                <div class="skeleton-line" style="width: 80px; height: 28px; border-radius: 6px;"></div>
                <div class="skeleton-line" style="width: 60px; height: 28px; border-radius: 6px;"></div>
              </div>
            </div>
          </template>
          <!-- ACTUAL CARDS -->
          <template v-else>
          <div class="card" v-for="p in filteredProducts" :key="p.Ma_hang" @click="openCardModal(p)">
            <div class="card-body">
              <div class="card-badges">
                <span class="card-ncc-badge" v-if="p.Ten_nha_cung_cap">{{ p.Ten_nha_cung_cap }}</span>
                <span class="card-vat-badge-img" v-if="p.Thue_VAT">VAT {{ p.Thue_VAT }}%</span>
              </div>
              <h4 class="clamp2">{{ p.Ten_hang }}</h4>
              <p class="card-license clamp1" v-if="p.License_duration">{{ p.License_duration }}</p>
              <div class="card-price-row">
                <span class="price">{{ displayPrice(p) }}</span>
                <span class="price-unit">/ {{ p.DVT }}</span>
              </div>
              <p v-if="displayOriginalPrice(p)" class="card-orig-price">(~ {{ displayOriginalPrice(p) }})</p>
            </div>
            <div class="card-footer" @click.stop>
              <div class="qty">
                <button @click="decQty(p.Ma_hang)">&#x2212;</button>
                <span>{{ qtyMap[p.Ma_hang] || 1 }}</span>
                <button @click="incQty(p.Ma_hang)">+</button>
              </div>
              <button class="btn-add" @click="addItemFromCard(p)">
                <span class="btn-add-icon">+</span> Thêm
              </button>
            </div>
            <!-- SUGGESTIONS -->
            <div v-if="p.Ma_hang_lien_ket" class="card-suggestions" @click.stop style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1);">
              <div style="font-size: 10.5px; color: #94a3b8; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;"><i class="lucide-sparkles" style="font-size: 12px; margin-right: 4px; color: #fbbf24;"></i>Combo đi kèm:</div>
              <div v-for="link in getLinkedItems(p)" :key="link.code" @click.stop="openSuggestedCardModal(link.code)" style="background: rgba(15,23,42,0.6); padding: 8px; border-radius: 6px; margin-bottom: 6px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='rgba(16,185,129,0.4)';" onmouseout="this.style.borderColor='rgba(255,255,255,0.05)';">
                <span :title="link.name || link.code" style="font-size: 11.5px; color: #e2e8f0; font-weight: 600; text-align: center; line-height: 1.4; word-break: break-word;">{{ link.name || link.code }}</span>
                <div class="qty" style="justify-content: center; margin-bottom: -2px;">
                  <button @click.stop="decQty(link.code)">&#x2212;</button>
                  <span>{{ qtyMap[link.code] || 1 }}</span>
                  <button @click.stop="incQty(link.code)">+</button>
                </div>
                <button @click.stop="addLinkedItem(link.code)" style="width: 100% !important; background: rgba(16,185,129,0.15); color: #10b981; border: 1px dashed rgba(16,185,129,0.4); padding: 6px; border-radius: 4px; font-size: 11.5px; font-weight: 700; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='#fff';" onmouseout="this.style.background='rgba(16,185,129,0.15)'; this.style.color='#10b981';">+ THÊM VÀO BÁO GIÁ</button>
              </div>
            </div>
          </div>
          </template>
        </div>
      </aside>
      <button v-if="!showProductSidebar" class="open-tab metallic-border-btn" @mousedown="startDragFab" @touchstart="startDragFab" @click.stop="onFabClick" :style="{ left: fabPos.x + 'px', top: fabPos.y + 'px', cursor: isDraggingFab ? 'grabbing' : 'grab' }">
        <i class="lucide-shopping-cart" style="font-size: 20px; pointer-events: none; z-index: 2;"></i> 
        <span style="font-size: 10px; font-weight: 700; line-height: 1.15; text-align: center; white-space: normal; pointer-events: none; z-index: 2;">KHO<br>SẢN PHẨM</span>
      </button>

      <!-- ================== CENTER: BẢNG BÁO GIÁ VÀ TỔNG TIỀN ================== -->
      <section class="box center quote-center">
        <div class="quote-table-container">
          <div class="sidebar-head table-header-box" style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap; width: 100%;">
              <div style="display: flex; align-items: center; gap: 12px; flex-wrap: nowrap;">
                <h3 style="margin: 0; white-space: nowrap; width: auto; flex-shrink: 0;"><i class="lucide-file-text"></i> Bảng báo giá chi tiết</h3>
                <button @click="resetToanBoBaoGia" style="background: #ef4444; color: #ffffff; border: none; padding: 4px 10px; border-radius: 6px; font-weight: 700; display: flex; align-items: center; gap: 6px; transition: all 0.2s; box-shadow: 0 1px 3px rgba(239, 68, 68, 0.4); font-size: 12px; white-space: nowrap; flex-shrink: 0; width: max-content; cursor: pointer; height: fit-content;" title="Xóa toàn bộ hàng hóa trong báo giá" onmouseover="this.style.background='#dc2626'; this.style.boxShadow='0 2px 5px rgba(239,68,68,0.5)';" onmouseout="this.style.background='#ef4444'; this.style.boxShadow='0 1px 3px rgba(239,68,68,0.4)';">
                  <i class="lucide-rotate-ccw" style="font-size: 13px; color: #ffffff;"></i> Làm mới
                </button>
              </div>
              <div class="header-contract-info">
                <span class="contract-badge">Mã HĐ: <b>{{ maHopDong }}</b></span>
                <span class="contract-badge">Số HĐ: <b>{{ soHopDong }}</b></span>
                <span class="contract-badge">Số PO: <b>{{ currentPO }}</b></span>
              </div>
              <span class="hint" style="margin-left: auto;">Click vào ô <b>SL / MỨC OFF / VAT</b> để sửa trực tiếp.</span>
            </div>
          </div>
          <div class="quote-table-wrap">
            <table>
              <thead>
                <tr style="color: #ffffff !important; font-weight: 800 !important;">
                  <th class="col-stt" style="border-top-left-radius: 6px;">STT</th>
                  <th class="col-pn">P/N</th>
                  <th class="col-name">Tên hàng</th>
                  <th class="col-desc">Diễn giải</th>
                  <th class="col-hang">Hãng</th>
                  <th class="col-dvt">ĐVT</th>
                  <th class="col-sl">SL</th>
                  <th class="col-dg">GIÁ TIÊU CHUẨN</th>
                  <th class="col-dg">ĐƠN GIÁ (LP)</th> 
                  <th class="col-dg">GIÁ NHẬP</th>
                  <th class="col-dg">MỨC OFF</th>
                  <th class="col-dg">ĐƠN GIÁ (KH)</th>
                  <th class="col-tt">TT trước thuế (VND)</th>
                  <th class="col-vat">VAT</th>
                  <th class="col-tt">TT sau thuế (VND)</th>
                  <th class="col-tt" style="color: #ffffff !important;">Net Margin</th>
                  <th class="col-del" style="border-top-right-radius: 6px;">Xóa</th>
                </tr>
              </thead>
              <draggable 
                tag="tbody" 
                v-model="flatQuoteRows" 
                item-key="uniqueId" 
                handle=".drag-handle" 
                ghost-class="ghost-item"
                drag-class="drag-item"
                chosen-class="chosen-item"
                :animation="400"
                easing="cubic-bezier(0.175, 0.885, 0.32, 1.15)"
                filter="button, input, textarea, .btn-del"
                :preventOnFilter="false"
                :move="checkMove"
                @start="onFlatDragStart"
                @end="onFlatDragEnd"
              >
                <template #item="{ element: r }">
                  <tr v-if="r.type === 'group'" class="group-row drag-handle" style="cursor: grab;" title="Kéo thả danh mục">
                    <td class="group-stt">
                      <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <i class="lucide-grip-vertical" style="opacity: 0.5;"></i> {{ r.roman }}
                      </div>
                    </td>
                    <td colspan="15" class="group-title">
                      <div style="display: flex; align-items: center;">
                        <span>{{ r.title }}</span>
                        <button class="util-btn small inline-adjust" style="margin-left: 10px; padding: 2px 6px; font-size: 11px;" @click.stop="openAdjustPrice('group', r.key, r.title)">
                          <i class="ri-arrow-up-down-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="r.type === 'item'" v-show="!draggingGroupKey" class="quote-item-row drag-handle" style="cursor: grab;" title="Nhấn giữ để kéo thả sản phẩm" :id="'quote-row-' + r.idx" @click="openQuoteEdit(r.idx)">
                    <td style="color: #ffffff; font-weight: 700;">
                      <div style="display: flex; justify-content: center; align-items: center; gap: 4px;">
                        <i class="lucide-grip-vertical" style="opacity: 0.3;"></i>
                        {{ r.stt }}
                      </div>
                    </td>
                    <td class="col-pn-cell" :title="r.item.Ma_hang" style="color: #ffffff; font-weight: 700;" @click.stop="openQuoteEdit(r.idx, 'Ma_hang')">{{ r.item.Ma_hang }}</td>
                    <td class="nowrap" style="color: #ffffff; font-weight: 700;" @click.stop="openQuoteEdit(r.idx, 'Ten_hang')">{{ r.item.Ten_hang }}</td>
                    <td class="col-desc-cell" :title="[r.item.Mo_ta_chung, r.item.Mo_ta_chi_tiet, r.item.Features].filter(Boolean).join(' - ')" style="color: #ffffff; font-weight: 700;" @click.stop="openQuoteEdit(r.idx, 'Features')">
                      <div class="preline">
                        <div v-if="r.item.Mo_ta_chung">{{ r.item.Mo_ta_chung }}</div>
                        <div v-if="r.item.Mo_ta_chi_tiet">{{ r.item.Mo_ta_chi_tiet }}</div>
                        <div v-if="r.item.Features">{{ r.item.Features }}</div>
                      </div>
                    </td>
                    <td class="col-hang-cell" :title="r.item.Ten_nha_cung_cap" style="color: #ffffff; font-weight: 700;" @click.stop="openQuoteEdit(r.idx, 'Ten_nha_cung_cap')">{{ r.item.Ten_nha_cung_cap }}</td>
                    <td class="col-dvt-cell" :title="r.item.DVT" style="color: #ffffff; font-weight: 700;" @click.stop="openQuoteEdit(r.idx, 'DVT')">{{ r.item.DVT }}</td>
                    <td class="center" style="color: #ffffff; font-weight: 700;" @click.stop="openQuoteEdit(r.idx, 'So_luong')">{{ r.item.So_luong }}</td>
                    <td class="right" style="line-height: 1.3; font-weight: 700; color: #8b5cf6;" @click.stop="openQuoteEdit(r.idx, 'Gia_tieu_chuan')">
                      <div>{{ displayGiaTieuChuan(r.item) }}</div>
                      <div class="muted" style="font-size: 11px; margin-top: 2px; color: #8b5cf6 !important;">({{ displayGiaTieuChuanPct(r.item) }}%)</div>
                    </td>
                    <td class="right" @click.stop="openQuoteEdit(r.idx, 'Don_gia')">{{ displayDonGiaLP(r.item) }}</td> 
                    <td class="right" style="color: #fb923c; font-weight: 700;" @click.stop="openQuoteEdit(r.idx, 'gia_nhap')">{{ formatVND(toNum(r.item.gia_nhap, 0) * toNum(r.item.Ti_gia, 1)) }}</td>
                    <td class="right" style="line-height: 1.3; font-weight: 700; color: #f87171;" @click.stop="openQuoteEdit(r.idx, 'muc_phan_tram_off')">
                      <div>{{ displayMucOffAmount(r.item) }}</div>
                      <div class="muted" style="font-size: 11px; margin-top: 2px; color: #f87171 !important;">(-{{ toNum(r.item.muc_phan_tram_off, 0) }}%)</div>
                    </td>
                    <td class="right" style="color: #10b981; font-weight: 700;" @click.stop="openQuoteEdit(r.idx, 'unit_price_kh')">{{ formatVND(unitPrice(r.item)) }}</td>
                    <td class="right" style="color: #10b981; font-weight: 800;" @click.stop="openQuoteEdit(r.idx, 'line_truoc_thue')">{{ formatVND(lineTruocThue(r.item)) }}</td>
                    <td class="right" style="line-height: 1.3; color: #10b981; font-weight: 800;" @click.stop="openQuoteEdit(r.idx, 'Thue_VAT')">
                      <div>{{ formatVND(lineVAT(r.item)) }}</div>
                      <div class="muted" style="font-size: 11px; margin-top: 2px; color: #34d399 !important;">({{ toNum(r.item.Thue_VAT, 0) }}%)</div>
                    </td>
                    <td class="right" style="color: #10b981; font-weight: 800;" @click.stop="openQuoteEdit(r.idx, 'Thue_VAT')">{{ formatVND(lineSauThue(r.item)) }}</td>
                    <td class="right" :style="{ color: lineLoiNhuan(r.item) >= 0 ? '#10b981' : '#ef4444', fontWeight: 800 }">
                      <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                        <span v-if="lineLoiNhuan(r.item) >= 0" style="font-size: 12px; margin-right: 2px;">▲</span>
                        <span v-else style="font-size: 12px; margin-right: 2px;">▼</span>
                        {{ formatVND(Math.abs(lineLoiNhuan(r.item))) }}
                      </div>
                    </td>
                    <td class="center">
                      <div style="display: flex; gap: 4px; justify-content: center;">
                        <button class="btn-del" @click.stop="removeSelected(r.idx)" title="Xóa">✕</button>
                      </div>
                    </td>
                  </tr>
                </template>
                <template #footer>
                  <tr class="spacer-row"><td colspan="17" style="padding: 0; border: none; background: transparent;"></td></tr>
                </template>
              </draggable>
              <tfoot>
                <tr class="table-footer-sticky" style="background: #fadb14; font-weight: 700; color: #000000; white-space: nowrap;">
                  <td colspan="10" class="center" style="font-size: 14px; color: #15803d; font-weight: 900;">TỔNG CỘNG + THUẾ</td>
                  <td class="right">
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 12px; background: #dc2626; color: #fff; font-size: 12px; font-weight: 800; white-space: nowrap;">-{{ formatVND(totals.off) }}</span>
                  </td>
                  <td></td>
                  <td class="right">
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 12px; background: #1d4ed8; color: #fff; font-size: 12px; font-weight: 800; white-space: nowrap;">{{ formatVND(totals.truoc) }}</span>
                  </td>
                  <td class="center">
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 12px; background: #1d4ed8; color: #fff; font-size: 12px; font-weight: 800; white-space: nowrap;">{{ formatVND(totals.vat) }}</span>
                  </td>
                  <td class="right">
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 12px; background: #2563eb; color: #fff; font-size: 12px; font-weight: 800; white-space: nowrap;">{{ formatVND(totals.sau) }}</span>
                  </td>
                  <td class="right">
                    <div :style="{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', padding: '2px 6px', borderRadius: '12px', background: totals.loi >= 0 ? '#10b981' : '#ef4444', color: '#fff', fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap' }">
                      <span v-if="totals.loi >= 0" style="font-size: 10px;">▲</span>
                      <span v-else style="font-size: 10px;">▼</span>
                      {{ formatVND(Math.abs(totals.loi)) }}
                    </div>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div class="bottom-totals">
          <!-- KHỐI 0 : KHÁCH HÀNG -->
          <div class="totals-box">
            <div class="totals-header" style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); position: relative;">
              <span class="totals-icon"><i class="lucide-user"></i></span>
              <span style="display: flex; align-items: center; gap: 8px;">
                Khách hàng
                <span v-if="khach.MST || khach.Ten_cong_ty || khach.Ten_khach_hang || khach.Dia_chi_cong_ty" style="cursor: pointer; background: #ef4444; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 1px 3px rgba(239,68,68,0.3); line-height: 1.2;" @click="resetCustomer" onmouseover="this.style.background='#dc2626'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#ef4444'; this.style.transform='translateY(0)'">Reset</span>
              </span>
              <span style="margin-left: auto; cursor: pointer; color: #4ade80; font-size: 13px; font-weight: 800; text-decoration: underline; text-underline-offset: 3px; transition: all 0.2s; text-shadow: 0 0 6px rgba(74, 222, 128, 0.4);" @click="showCustomerDetailModal = true" onmouseover="this.style.color='#bbf7d0'; this.style.textShadow='0 0 10px rgba(187, 247, 208, 0.8)'" onmouseout="this.style.color='#4ade80'; this.style.textShadow='0 0 6px rgba(74, 222, 128, 0.4)'">Xem chi tiết ›</span>
            </div>
            <div class="totals-body" style="padding: 8px;">
              <!-- Row 1: MST + SĐT -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px;">
                <div>
                  <div style="font-size: 11px; color: #e2e8f0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; padding-left: 2px; text-align: left;">MST</div>
                  <div :class="{ 'input-loading': customersState === 'loading', 'input-loaded': customersState === 'loaded', 'input-ready': customersState === 'ready' }">
                  <input v-model="khach.MST" class="cell-input" placeholder="—" list="dl-mst-modal" style="width: 100%; background: rgba(15,23,42,0.7); border: 1px solid #1e3a2f; border-radius: 8px; padding: 5px 8px; color: #10b981; font-size: 13px; font-weight: 600; outline: none; box-sizing: border-box;" @change="onMSTChange" />
                  </div>
                  <datalist id="dl-mst-modal"><option v-for="k in customers" :key="'mst_'+k.Ma_khach_hang" :value="k.MST" /></datalist>
                </div>
                <div>
                  <div style="font-size: 11px; color: #e2e8f0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; padding-left: 2px; text-align: left;">SĐT</div>
                  <input v-model="khach.So_dien_thoai_ca_nhan" class="cell-input" placeholder="—" style="width: 100%; background: rgba(15,23,42,0.7); border: 1px solid #1e3a2f; border-radius: 8px; padding: 5px 8px; color: #10b981; font-size: 13px; font-weight: 600; outline: none; box-sizing: border-box;" />
                </div>
              </div>
              <!-- Row 2: Công ty -->
              <div style="margin-bottom: 6px;">
                <div style="font-size: 11px; color: #e2e8f0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; padding-left: 2px; text-align: left;">Công ty</div>
                <div :class="{ 'input-loading': customersState === 'loading', 'input-loaded': customersState === 'loaded', 'input-ready': customersState === 'ready' }">
                <input v-model="khach.Ten_cong_ty" class="cell-input" placeholder="—" list="dl-ten-cong-ty-modal" style="width: 100%; background: rgba(15,23,42,0.7); border: 1px solid #1e3a2f; border-radius: 8px; padding: 5px 8px; color: #10b981; font-size: 13px; font-weight: 600; outline: none; box-sizing: border-box;" @change="onTenCongTyChange" />
                </div>
                <datalist id="dl-ten-cong-ty-modal"><option v-for="k in customers" :key="'cty_'+k.Ma_khach_hang" :value="k.Ten_cong_ty" /></datalist>
              </div>
              <!-- Row 3: Người nhận -->
              <div style="margin-bottom: 6px;">
                <div style="font-size: 11px; color: #e2e8f0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; padding-left: 2px; text-align: left;">Người nhận</div>
                <div :class="{ 'input-loading': customersState === 'loading', 'input-loaded': customersState === 'loaded', 'input-ready': customersState === 'ready' }">
                <input v-model="khach.Ten_khach_hang" class="cell-input" placeholder="—" list="dl-nguoi-nhan-main" style="width: 100%; background: rgba(15,23,42,0.7); border: 1px solid #1e3a2f; border-radius: 8px; padding: 5px 8px; color: #10b981; font-size: 13px; font-weight: 600; outline: none; box-sizing: border-box;" @change="onTenKhachHangChange" />
                </div>
                <datalist id="dl-nguoi-nhan-main"><option v-for="k in customers" :key="'nn_'+k.Ma_khach_hang" :value="k.Ten_khach_hang" /></datalist>
              </div>
              <!-- Row 4: Địa chỉ -->
              <div>
                <div style="font-size: 11px; color: #e2e8f0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; padding-left: 2px; text-align: left;">Địa chỉ</div>
                <input v-model="khach.Dia_chi_cong_ty" class="cell-input" placeholder="—" style="width: 100%; background: rgba(15,23,42,0.7); border: 1px solid #1e3a2f; border-radius: 8px; padding: 5px 8px; color: #10b981; font-size: 13px; font-weight: 600; outline: none; box-sizing: border-box;" />
              </div>
            </div>
          </div>

          <!-- KHỐI 1 : CHIẾT KHẤU & CHÊNH LỆCH -->
          <div class="totals-box">
            <div class="totals-header">
              <span class="totals-icon"><i class="lucide-trending-down"></i></span>
              <span>Chiết khấu & Chênh lệch</span>
            </div>
            <div class="totals-body">
              <div class="totals-row">
                <span class="totals-label" style="display: flex; align-items: center; gap: 6px;">
                  Chiết khấu tổng trước thuế
                  <FormattedInput v-model="chietKhauTruocThuePct" placeholder="0" style="width: 48px; padding: 2px 4px; height: 24px; text-align: center; border-radius: 4px; border: 1px solid #cbd5e1; font-weight: 600; color: #ef4444; font-size: 13px; background: #fff;" /> %
                </span>
                <span class="totals-value">
                  {{ formatVND(chietKhauTruocThue) }}
                  <span class="history-icon" @click="openHistory('chietKhauTruocThue', 'Chiết khấu tổng trước thuế')"><i class="ri-history-line" style="font-size: 14px;"></i></span>
                </span>
              </div>
              <div class="totals-row">
                <span class="totals-label" style="display: flex; align-items: center; gap: 6px;">
                  Thuế chênh lệch giá
                  <FormattedInput v-model="thueChenhLechPct" placeholder="0" style="width: 48px; padding: 2px 4px; height: 24px; text-align: center; border-radius: 4px; border: 1px solid #cbd5e1; font-weight: 600; color: #ef4444; font-size: 13px; background: #fff;" /> %
                </span>
                <span class="totals-value">
                  {{ formatVND(thueChenhLech) }}
                  <span class="history-icon" @click="openHistory('thueChenhLech', 'Thuế chênh lệch giá')"><i class="ri-history-line" style="font-size: 14px;"></i></span>
                </span>
              </div>
              <div class="totals-row">
                <span class="totals-label" style="display: flex; align-items: center; gap: 8px;">
                  Chênh lệch giá
                  <button class="util-btn small inline-adjust" style="padding: 2px 6px; font-size: 11px; white-space: nowrap; border-radius: 4px; background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.3);" @click="openAdjustPrice('all', '', 'Tổng chênh lệch giá', 'total_chenh_lech')" title="Điều chỉnh tổng chênh lệch">
                    <i class="ri-arrow-up-down-fill"></i>
                  </button>
                </span>
                <span class="totals-value" :style="{ color: chenhLechGia >= 0 ? '#10b981' : '#ef4444' }">
                  {{ chenhLechGia >= 0 ? '+' : '' }}{{ formatVND(chenhLechGia) }}
                  <span class="history-icon" @click="openHistory('chenhLechGia', 'Chênh lệch giá')"><i class="ri-history-line" style="font-size: 14px;"></i></span>
                </span>
              </div>
              <div class="totals-row">
                <span class="totals-label">Còn lại</span>
                <span class="totals-value">
                  {{ formatVND(conLai) }}
                  <span class="history-icon" @click="openHistory('conLai', 'Còn lại')"><i class="ri-history-line" style="font-size: 14px;"></i></span>
                </span>
              </div>
              <div class="totals-row totals-highlight" style="margin-top: 8px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
                <span class="totals-label">Tổng Chiết khấu</span>
                <span class="totals-value">
                  {{ formatVND(tongChietKhau) }}
                  <span class="history-icon" @click="openHistory('tongChietKhau', 'Tổng Chiết khấu')"><i class="ri-history-line" style="font-size: 14px;"></i></span>
                </span>
              </div>
            </div>
          </div>

          <!-- KHỐI 2 : TỔNG HỢP TÀI CHÍNH -->
          <div class="totals-box">
            <div class="totals-header totals-header-primary">
              <span class="totals-icon"><i class="lucide-wallet"></i></span>
              <span>Tổng hợp tài chính</span>
            </div>
            <div class="totals-body">
              <div class="totals-row">
                <span class="totals-label">Tổng giá thực tế</span>
                <span class="totals-value">
                  {{ formatVND(tongGiaThucTe) }}
                  <span class="history-icon" @click="openHistory('tongGiaThucTe', 'Tổng giá thực tế')"><i class="ri-history-line" style="font-size: 14px;"></i></span>
                </span>
              </div>
              <div class="totals-row">
                <span class="totals-label" style="display: flex; align-items: center; gap: 6px;">
                  Tổng trước thuế ( HĐ)
                  <button class="util-btn small inline-adjust" style="padding: 2px 6px; font-size: 11px;" @click="openAdjustPrice('all', '', 'Toàn bộ báo giá')">
                    <i class="ri-arrow-up-down-fill"></i>
                  </button>
                </span>
                <span class="totals-value">
                  {{ formatVND(totals.truoc) }}
                  <span class="history-icon" @click="openHistory('truoc', 'Tổng trước thuế ( HĐ)')"><i class="ri-history-line" style="font-size: 14px;"></i></span>
                </span>
              </div>
              <div class="totals-row">
                <span class="totals-label">Tổng VAT</span>
                <span class="totals-value text-warn">
                  {{ formatVND(totals.vat) }}
                  <span class="history-icon" @click="openHistory('vat', 'Tổng VAT')"><i class="ri-history-line" style="font-size: 14px;"></i></span>
                </span>
              </div>
              <div class="totals-row totals-highlight-blue">
                <span class="totals-label">Tổng sau thuế</span>
                <span class="totals-value">
                  {{ formatVND(totals.sau) }}
                  <span class="history-icon" @click="openHistory('sau', 'Tổng sau thuế')"><i class="ri-history-line" style="font-size: 14px;"></i></span>
                </span>
              </div>

            </div>
          </div>

          <!-- KHỐI 3 : THAO TÁC -->
          <div class="totals-box" style="border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.6); box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
            <div class="totals-header" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span class="totals-icon" style="color: #38bdf8;"><i class="lucide-settings"></i></span>
              <span style="font-weight: 700; color: #f8fafc; letter-spacing: 0.5px;">THAO TÁC</span>
            </div>
            <div class="totals-body" style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
              <textarea v-model="ghiChuHopDong" placeholder="Nhập ghi chú cho hợp đồng..." style="width: 100%; min-height: 44px; padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); font-size: 12.5px; font-family: inherit; resize: vertical; background: rgba(0,0,0,0.2); color: #f8fafc; transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 3px rgba(56,189,248,0.1)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.boxShadow='none'" />
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <button class="action-btn" @click="showPreviewRawModal = true" style="margin: 0; padding: 10px 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; flex-direction: row; justify-content: center; min-height: 38px; background: #2563eb; border: none; color: #ffffff;">
                  <i class="lucide-eye" style="margin-right: 6px; font-size: 16px;"></i> Xem báo giá gốc
                </button>
                <button class="action-btn" @click="openGlobalHistory" style="margin: 0; padding: 10px 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; flex-direction: row; justify-content: center; min-height: 38px; background: #9333ea; border: none; color: #ffffff;">
                  <i class="lucide-history" style="margin-right: 6px; font-size: 16px;"></i> Lịch sử
                </button>
                <button class="action-btn" @click="showExportInfoModal = true" style="margin: 0; padding: 10px 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; flex-direction: row; justify-content: center; min-height: 38px; background: #16a34a; border: none; color: #ffffff;">
                  <i class="lucide-upload" style="margin-right: 6px; font-size: 16px;"></i> Xuất dữ liệu
                </button>
                <button class="action-btn" @click="showLoadInfoModal = true" style="margin: 0; padding: 10px 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; flex-direction: row; justify-content: center; min-height: 38px; background: #eab308; border: none; color: #1e3a8a;">
                  <i class="lucide-download" style="margin-right: 6px; font-size: 16px;"></i> Nạp dữ liệu
                </button>

                <button class="action-btn action-save" :disabled="saving || !hasUnsavedChanges()" @click="showSaveModal = true" style="grid-column: 1 / -1; margin: 0; padding: 14px; font-size: 14px; font-weight: 800; flex-direction: row; justify-content: center; min-height: 46px; letter-spacing: 1px; text-transform: uppercase; background: #dc2626 !important; border: none; color: #ffffff !important; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);">
                  <i class="lucide-save" style="margin-right: 8px; font-size: 18px;"></i> {{ saving ? 'Đang lưu...' : 'Lưu báo giá' }}
                </button>

                <button v-if="loadedPipelineExtraData" class="util-btn" @click="showPipelineModal = true" style="grid-column: 1 / -1; margin: 0; padding: 8px; font-size: 11.5px; justify-content: center; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #34d399; border-radius: 8px; display: flex; align-items: center; cursor: pointer; min-height: 36px;">
                  <i class="lucide-eye" style="margin-right: 6px;"></i> Pipeline đã load
                </button>
              </div>
              <p v-if="saveMsg" class="save-msg" style="margin: 0; font-size: 11px; color: #10b981; text-align: center;">{{ saveMsg }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ================== MODAL: THÔNG TIN KHÁCH HÀNG ================== -->
    <div v-if="showCustomerDetailModal" class="modal vip-modal-overlay" @click.self="showCustomerDetailModal = false">
      <div class="modal-card modal-wide vip-modal-card" style="width: 1060px; max-width: 95vw;">
        <div class="modal-head" style="background: linear-gradient(135deg, #34d399, #10b981) !important; justify-content: center; position: relative; padding: 16px 24px; border-bottom: none; border-radius: 12px 12px 0 0;">
          <div style="color: #fff; text-transform: uppercase; font-weight: 900; font-size: 16px; letter-spacing: 0.5px;">CHI TIẾT KHÁCH HÀNG</div>
          <button class="x" @click="showCustomerDetailModal = false" style="color: #fff; position: absolute; right: 18px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.15); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer;">✕</button>
        </div>
        <div style="padding: 24px; overflow-y: auto; max-height: calc(95vh - 140px);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <!-- LEFT: KHÁCH HÀNG -->
          <div style="background: rgba(16,185,129,0.04); border: 1px solid rgba(16,185,129,0.12); border-radius: 10px; padding: 20px; display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: flex-start; align-items: center; gap: 10px; margin-bottom: 2px;">
              <div style="font-size: 12px; text-transform: uppercase; font-weight: 800; color: #34d399; letter-spacing: 1px; white-space: nowrap;">KHÁCH HÀNG</div>
              <button @click="resetCustomer" style="padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; background: #ef4444; color: #ffffff; border: none; cursor: pointer; white-space: nowrap; width: fit-content; flex-shrink: 0; line-height: 1; box-shadow: 0 2px 4px rgba(239,68,68,0.3);">Reset</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Mã KH</label>
                <input v-model="maKHInput" list="dl-ma-kh-modal-2" placeholder="Mã KH" @change="fillCustomerByMa(maKHInput)" @blur="onBlurMaKH" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
                <datalist id="dl-ma-kh-modal-2"><option v-for="k in customers" :key="k.Ma_khach_hang" :value="k.Ma_khach_hang" /></datalist>
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Tên KH</label>
                <input v-model="tenKHInput" list="dl-ten-kh-modal-2" placeholder="Tên KH" @change="fillCustomerByTen(tenKHInput)" @blur="onBlurTenKH" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
                <datalist id="dl-ten-kh-modal-2"><option v-for="k in customers" :key="k.Ma_khach_hang + '_' + k.Ten_khach_hang" :value="k.Ten_khach_hang" /></datalist>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Email</label>
                <input v-model="khach.Email_ca_nhan" placeholder="Email" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">SĐT</label>
                <input v-model="khach.So_dien_thoai_ca_nhan" placeholder="SĐT" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Trạng thái</label>
                <input v-model="khach.Trang_thai" placeholder="Trạng thái" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Công nợ</label>
                <input v-model="khach.Cong_no_chua_thanh_toan" placeholder="Công nợ" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 3px;">
              <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Ghi chú</label>
              <input v-model="khach.Ghi_chu" placeholder="Ghi chú" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
            </div>
          </div>
          <!-- ═══ GROUP 2: THÔNG TIN CÔNG TY ═══ -->
          <!-- RIGHT: CÔNG TY -->
          <div style="background: rgba(56,189,248,0.04); border: 1px solid rgba(56,189,248,0.12); border-radius: 10px; padding: 20px; display: flex; flex-direction: column; gap: 14px;">
            <div style="font-size: 12px; text-transform: uppercase; font-weight: 800; color: #38bdf8; letter-spacing: 1px;">THÔNG TIN CÔNG TY</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Tên công ty</label>
                <input v-model="khach.Ten_cong_ty" list="dl-cty-modal-2" placeholder="Tên CT" @change="fillCustomerByCongTy(khach.Ten_cong_ty)" @blur="onBlurCongTy" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
                <datalist id="dl-cty-modal-2"><option v-for="k in [...new Set(customers.filter(c => c.Ten_cong_ty).map(c => c.Ten_cong_ty))]" :key="k" :value="k" /></datalist>
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">MST</label>
                <input v-model="khach.MST" list="dl-mst-modal-2" @change="onMSTChange" placeholder="Mã số thuế" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
                <datalist id="dl-mst-modal-2"><option v-for="k in customers" :key="'mst_2_'+k.Ma_khach_hang" :value="k.MST" /></datalist>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">SĐT công ty</label>
                <input v-model="khach.So_dien_thoai_cong_ty" placeholder="SĐT" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Email</label>
                <input v-model="khach.Email_cong_ty" placeholder="Email CT" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Địa chỉ</label>
                <input v-model="khach.Dia_chi_cong_ty" placeholder="Địa chỉ" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Website</label>
                <input v-model="khach.Website_cong_ty" placeholder="Website" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">COMPANY</label>
                <input v-model="khach.COMPANY" placeholder="COMPANY" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">TEL</label>
                <input v-model="khach.TEL" placeholder="TEL" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Fax</label>
                <input v-model="khach.So_fax_cong_ty" placeholder="Fax" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 3px;">
              <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">ADDRESS</label>
              <input v-model="khach.ADDRESS" placeholder="ADDRESS" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
            </div>
          </div>
          </div>
          <!-- KH PHỤ — full width -->
          <div style="margin-top: 16px; background: rgba(148,163,184,0.04); border: 1px solid rgba(148,163,184,0.1); border-radius: 10px; padding: 14px 16px;">
            <div style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: #ffffff; letter-spacing: 1px; margin-bottom: 10px;">KHÁCH HÀNG PHỤ</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Tên</label>
                <input v-model="khach.Ten_khach_hang_phu" placeholder="Tên KH phụ" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">SĐT</label>
                <input v-model="khach.So_dien_thoai_ca_nhan_phu" placeholder="SĐT phụ" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Email</label>
                <input v-model="khach.Email_ca_nhan_phu" placeholder="Email phụ" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
            </div>
          </div>
        </div>
        <!-- ACTIONS -->
        <div style="padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: flex-end; gap: 12px;">
          <button v-if="showSaveToDBBtn" @click="saveCustomerToDB" :disabled="savingCustomer" style="padding: 12px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; color: #fff; background: linear-gradient(135deg, #10b981, #059669); border: none; cursor: pointer; transition: all 0.25s; letter-spacing: 0.3px; box-shadow: 0 2px 8px rgba(16,185,129,0.25); display: flex; align-items: center; gap: 6px;" onmouseover="this.style.boxShadow='0 4px 16px rgba(16,185,129,0.4)'; this.style.transform='translateY(-1px)'" onmouseout="this.style.boxShadow='0 2px 8px rgba(16,185,129,0.25)'; this.style.transform='translateY(0)'">
            <span v-if="savingCustomer">⏳ Đang lưu...</span>
            <span v-else>💾 THÊM VÀO DB</span>
          </button>
          <button @click="showCustomerDetailModal = false" style="padding: 12px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; color: #fff; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.25s; letter-spacing: 0.3px;">Đóng</button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL: XUẤT THÔNG TIN ================== -->
    <div v-if="showExportInfoModal" class="modal" @click.self="showExportInfoModal = false">
      <div class="modal-card" style="max-width: 400px;">
        <div class="modal-head">
          <h3><i class="lucide-upload"></i> Chọn loại xuất dữ liệu</h3>
          <button class="icon-btn" @click="showExportInfoModal = false">&times;</button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px; padding: 24px;">
          <button class="action-btn action-success" @click="showExportInfoModal = false; openExportExcelModal()" style="padding: 16px; font-size: 20px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; width: 100%; flex-direction: row; min-height: 64px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h2"></path><path d="M8 17h2"></path><path d="M14 13h2"></path><path d="M14 17h2"></path></svg> XUẤT EXCEL
          </button>
          <button class="action-btn action-pipeline" @click="showExportInfoModal = false; openPipelineSelectCustomerModal()" style="padding: 16px; font-size: 20px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; width: 100%; flex-direction: row; min-height: 64px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px;"><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="12" r="3"></circle><line x1="9" y1="12" x2="15" y2="12"></line></svg> XUẤT PIPELINE
          </button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL: LOAD THÔNG TIN ================== -->
    <div v-if="showLoadInfoModal" class="modal" @click.self="showLoadInfoModal = false">
      <div class="modal-card" style="max-width: 400px;">
        <div class="modal-head">
          <h3><i class="lucide-download"></i> Chọn loại load dữ liệu</h3>
          <button class="icon-btn" @click="showLoadInfoModal = false">&times;</button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px; padding: 24px;">
          <button class="action-btn action-danger" @click="showLoadInfoModal = false; openLoadInvoiceModal()" style="padding: 16px; font-size: 20px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; width: 100%; flex-direction: row; min-height: 64px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg> LOAD BÁO GIÁ
          </button>
          <button class="action-btn action-pipeline" @click="showLoadInfoModal = false; openLoadPipelineModal()" style="padding: 16px; font-size: 20px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; width: 100%; flex-direction: row; min-height: 64px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px;"><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="12" r="3"></circle><line x1="9" y1="12" x2="15" y2="12"></line></svg> LOAD PO-DXMH-DR-BÁO GIÁ
          </button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL: NHẬP TAY (FULL FIELDS) ================== -->
    <div v-if="showManualModal" class="modal vip-modal-overlay" @click.self="showManualModal = false">
      <div class="modal-card modal-wide vip-modal-card" style="width: 960px; max-width: 95vw;">
        <div class="modal-head" style="background: linear-gradient(135deg, #34d399, #10b981) !important; justify-content: center; position: relative; padding: 14px 20px; border-bottom: none; border-radius: 12px 12px 0 0;">
          <div style="color: #ffffff; text-transform: uppercase; font-weight: 900; font-size: 15px; margin: 0; display: flex; align-items: center; gap: 8px; letter-spacing: 0.5px;">⊕ THÊM MỚI NHANH</div>
          <button class="x" @click="showManualModal = false" style="color: #fff; transition: all 0.2s; position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.15); border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer;" onmouseover="this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.background='rgba(0,0,0,0.15)'">✕</button>
        </div>

        <!-- Hidden inputs for reactivity -->
        <div v-if="false">
          <input v-model="itemForm.Ma_hang" />
          <input v-model="itemForm.Ma_nha_cung_cap" />
          <input v-model="itemForm.Trang_thai" />
          <input v-model="itemForm.Main_img" />
          <textarea v-model="itemForm.Mo_ta_chung" />
          <textarea v-model="itemForm.Mo_ta_chi_tiet" />
          <input v-model="itemForm.License_duration" />
          <input v-model="itemForm.Ma_hang_lien_ket" />
          <input v-model="itemForm.Ten_hang_lien_ket" />
          <FormattedInput :modelValue="itemForm.Gia_tieu_chuan" @update:modelValue="itemForm.Gia_tieu_chuan = $event" />
          <textarea v-model="itemForm.Ghi_chu" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding: 24px; padding-bottom: 12px; overflow-y: auto; max-height: calc(95vh - 150px);">
          <!-- COLUMN 1: THÔNG TIN CHUNG -->
          <div class="modal-group" style="margin: 0; display: flex; flex-direction: column; gap: 20px;">
            <h4 class="modal-group-title" style="display: flex; align-items: center; gap: 8px;">
              Thông tin chung
            </h4>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; align-items: center; justify-content: flex-start; gap: 8px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px; margin: 0 !important; width: auto !important; white-space: nowrap; flex: none;">Tên hàng <span style="color: #ef4444;">*</span></label>
                <button style="background: #ef4444; border: none; color: #fff; font-size: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; transition: all 0.2s; width: auto !important; flex: none; box-shadow: 0 0 10px rgba(239,68,68,0.3);" @click="resetItem" onmouseover="this.style.background='#dc2626'; this.style.boxShadow='0 0 15px rgba(239,68,68,0.5)'" onmouseout="this.style.background='#ef4444'; this.style.boxShadow='0 0 10px rgba(239,68,68,0.3)'">
                  RESET
                </button>
              </div>
              <div style="position: relative;" :class="{ 'input-loading': productsState === 'loading', 'input-loaded': productsState === 'loaded', 'input-ready': productsState === 'ready' }">
                <input v-model="itemForm.Ten_hang" list="dl-hh-ten" placeholder="Nhập tên hàng hóa..." @input="updateMaHang" @blur="autoFillProduct(itemForm.Ten_hang)" style="width: 100%; padding: 10px 14px; padding-left: 36px; border-radius: 8px; font-weight: 500;" />
                <i class="lucide-package" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #64748b; pointer-events: none;"></i>
              </div>
              <datalist id="dl-hh-ten">
                <option v-for="p in products" :key="p.Ma_hang + '_t'" :value="p.Ten_hang" />
              </datalist>
              <datalist id="dl-hh-ma">
                <option v-for="p in products" :key="p.Ma_hang" :value="p.Ma_hang" />
              </datalist>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Danh mục</label>
                <input v-model="itemForm.Danh_muc" list="category-list" placeholder="HW, SW, SVR..." @input="updateMaHang" style="width: 100%; padding: 10px 14px; border-radius: 8px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">ĐVT</label>
                <input v-model="itemForm.DVT" placeholder="Cái, Bộ, License..." style="width: 100%; padding: 10px 14px; border-radius: 8px;" />
              </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Hãng</label>
              <div style="position: relative;">
                <input v-model="itemForm.Ten_nha_cung_cap" placeholder="Nhà cung cấp..." @input="updateMaNcc" style="width: 100%; padding: 10px 14px; padding-left: 36px; border-radius: 8px;" />
                <i class="lucide-truck" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #64748b; pointer-events: none;"></i>
              </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Diễn giải</label>
              <textarea v-model="itemForm.Features" rows="3" placeholder="Mô tả cấu hình, thông số nổi bật..." style="width: 100%; padding: 10px 14px; border-radius: 8px; resize: vertical; min-height: 70px;" />
            </div>
          </div>

          <!-- COLUMN 2: TÀI CHÍNH & GIÁ CẢ -->
          <div class="modal-group" style="margin: 0; display: flex; flex-direction: column; gap: 20px;">
            <h4 class="modal-group-title" style="display: flex; align-items: center; gap: 8px; color: #10b981 !important;">
              <span style="color: #10b981;">Tài chính & Giá cả</span>
            </h4>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Đơn vị tiền tệ</label>
                <select v-model="itemForm.Don_vi_tien_te" style="width: 100%; padding: 10px 14px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #f8fafc; font-weight: 600; font-size: 13px; cursor: pointer;">
                  <option value="VND" style="background: #1e293b;">VND</option>
                  <option value="USD" style="background: #1e293b;">USD</option>
                </select>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Tỉ giá</label>
                <div style="position: relative;">
                  <FormattedInput v-model="itemForm.Ti_gia" placeholder="1" :disabled="!itemForm.Don_vi_tien_te || itemForm.Don_vi_tien_te.toUpperCase() === 'VND'" style="width: 100%; padding: 10px 14px; border-radius: 8px;" />
                  <span v-if="itemForm.Don_vi_tien_te && itemForm.Don_vi_tien_te.toUpperCase() !== 'VND'" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 10px; font-weight: 600; color: #f59e0b; pointer-events: none;">₫/{{ itemForm.Don_vi_tien_te }}</span>
                </div>
              </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">ĐƠN GIÁ BÁN ({{ itemForm.Don_vi_tien_te || 'VND' }})</label>
              <div style="position: relative;">
                <FormattedInput
                  v-if="!itemForm.Don_vi_tien_te || itemForm.Don_vi_tien_te.toUpperCase() === 'VND'"
                  :modelValue="(itemForm.Don_gia || 0) * (Number(itemForm.Ti_gia) || 1)"
                  @update:modelValue="itemForm.Don_gia = $event / (Number(itemForm.Ti_gia) || 1)"
                  placeholder="Nhập đơn giá xuất..."
                  style="width: 100%; padding: 12px 14px; padding-left: 36px; border-radius: 8px; font-weight: 700; font-size: 16px; color: #10b981; border-color: rgba(16,185,129,0.3) !important; background: rgba(16,185,129,0.05) !important;" />
                <FormattedInput
                  v-else
                  v-model="itemForm.Don_gia"
                  placeholder="Nhập đơn giá xuất..."
                  style="width: 100%; padding: 12px 14px; padding-left: 36px; border-radius: 8px; font-weight: 700; font-size: 16px; color: #10b981; border-color: rgba(16,185,129,0.3) !important; background: rgba(16,185,129,0.05) !important;" />
                <i class="lucide-tag" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #10b981; pointer-events: none;"></i>
                <span style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; font-weight: 600; color: #10b981; pointer-events: none;">{{ (!itemForm.Don_vi_tien_te || itemForm.Don_vi_tien_te.toUpperCase() === 'VND') ? '₫' : '$' }}</span>
              </div>
              <div v-if="itemForm.Don_vi_tien_te && itemForm.Don_vi_tien_te.toUpperCase() !== 'VND' && itemForm.Ti_gia > 1" style="font-size: 11px; color: #10b981; margin-top: 2px;">
                ≈ {{ ((itemForm.Don_gia || 0) * (Number(itemForm.Ti_gia) || 1)).toLocaleString('vi-VN') }} VND
              </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Giá Nhập ({{ itemForm.Don_vi_tien_te || 'VND' }})</label>
              <div style="position: relative;">
                <FormattedInput
                  v-if="!itemForm.Don_vi_tien_te || itemForm.Don_vi_tien_te.toUpperCase() === 'VND'"
                  :modelValue="(itemForm.gia_nhap || 0) * (Number(itemForm.Ti_gia) || 1)"
                  @update:modelValue="itemForm.gia_nhap = $event / (Number(itemForm.Ti_gia) || 1)"
                  placeholder="0"
                  style="width: 100%; padding: 10px 14px; padding-right: 36px; border-radius: 8px;" />
                <FormattedInput
                  v-else
                  v-model="itemForm.gia_nhap"
                  placeholder="0"
                  style="width: 100%; padding: 10px 14px; padding-right: 36px; border-radius: 8px;" />
                <span style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; font-weight: 600; color: #64748b; pointer-events: none;">{{ (!itemForm.Don_vi_tien_te || itemForm.Don_vi_tien_te.toUpperCase() === 'VND') ? '₫' : '$' }}</span>
              </div>
              <div v-if="itemForm.Don_vi_tien_te && itemForm.Don_vi_tien_te.toUpperCase() !== 'VND' && itemForm.Ti_gia > 1" style="font-size: 11px; color: #64748b; margin-top: 2px;">
                ≈ {{ ((itemForm.gia_nhap || 0) * (Number(itemForm.Ti_gia) || 1)).toLocaleString('vi-VN') }} VND
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Mức % Off</label>
                <div style="position: relative;">
                  <FormattedInput v-model="itemForm.muc_phan_tram_off" placeholder="0" style="width: 100%; padding: 10px 14px; padding-right: 30px; border-radius: 8px; color: #f59e0b;" />
                  <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 600; color: #f59e0b; pointer-events: none;">%</span>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Thuế VAT</label>
                <div style="position: relative;">
                  <FormattedInput v-model="itemForm.Thue_VAT" placeholder="VAT" style="width: 100%; padding: 10px 14px; padding-right: 30px; border-radius: 8px; color: #3b82f6;" />
                  <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 600; color: #3b82f6; pointer-events: none;">%</span>
                </div>
              </div>
            </div>

            <!-- SUMMARY BOX INSIDE COL 2 -->
            <div style="margin-top: auto; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3); border: 1px dashed rgba(16,185,129,0.3); border-radius: 12px; padding: 16px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px; margin: 0;">Số lượng xuất</label>
              <div class="qty" style="transform: scale(1.1); transform-origin: right center;">
                <button type="button" @click="itemForm.So_luong = Math.max(1, toNum(itemForm.So_luong, 1) - 1)">&#x2212;</button>
                <FormattedInput v-model="itemForm.So_luong" placeholder="1" style="width: 36px; background: transparent !important; border: none !important; text-align: center; border-radius: 0; font-weight: 800; font-size: 14px; padding: 0; color: #fff; box-shadow: none;" />
                <button type="button" @click="itemForm.So_luong = toNum(itemForm.So_luong, 1) + 1">+</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions" style="display: flex; justify-content: flex-end; gap: 12px; align-items: center; padding: 0 24px 24px 24px; border-top: none; margin-top: auto;">

          <button style="padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; color: #94a3b8; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.color='#f8fafc'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#94a3b8'" @click="showManualModal = false">
            Đóng
          </button>
          <button style="background: linear-gradient(135deg, #10b981, #059669); border: none; box-shadow: 0 4px 15px rgba(16,185,129,0.3); padding: 12px 36px; border-radius: 8px; font-weight: 700; font-size: 15px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.boxShadow='0 6px 20px rgba(16,185,129,0.5)'; this.style.transform='translateY(-1px)';" onmouseout="this.style.boxShadow='0 4px 15px rgba(16,185,129,0.3)'; this.style.transform='translateY(0)';" @click="handleAddManualItem()">
            Thêm vào báo giá
          </button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL: XÁC NHẬN THÊM VÀO DATABASE ================== -->
    <div v-if="showConfirmAddDbModal" class="modal" style="z-index: 10005;" @click.self="cancelAddToDb">
      <div class="modal-card" style="max-width: 450px; text-align: center; padding: 32px 24px;">
        <div style="margin-bottom: 24px; color: #fbbf24;">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 style="margin-bottom: 12px; font-size: 20px; color: #f8fafc;">Thêm hàng vào Database?</h3>
        <p style="color: #94a3b8; font-size: 15px; margin-bottom: 32px; line-height: 1.5;">
          Bạn có muốn lưu <strong style="color: #fff;">{{ pendingAddedItem?.Ten_hang || 'hàng này' }}</strong> vào kho sản phẩm chung (Database) để sử dụng cho các lần sau không?
        </p>
        <div style="display: flex; gap: 16px; justify-content: center;">
          <button @click="cancelAddToDb" style="padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; color: #fff; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.2s;">
            Không, chỉ thêm tạm
          </button>
          <button @click="confirmAddToDb" style="padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; color: #fff; background: linear-gradient(135deg, #10b981, #059669); border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">
            Có, lưu vào DB
          </button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL: CARD DETAIL (FULL FIELDS) ================== -->
    <div v-if="showCardModal && cardEdit" class="modal vip-modal-overlay" @click.self="showCardModal = false">
      <div class="modal-card modal-wide vip-modal-card" style="width: 1100px; max-width: 95vw;">
        <div class="modal-head" style="background: linear-gradient(135deg, #34d399, #10b981) !important; justify-content: center; position: relative; padding: 18px 24px; border-bottom: none; border-radius: 12px 12px 0 0;">
          <div style="color: #ffffff; text-transform: uppercase; font-weight: 900; font-size: 18px; margin: 0; display: flex; align-items: center; gap: 10px; letter-spacing: 0.5px;"><i class="lucide-clipboard-list" style="color: #fff; width: 24px; height: 24px;"></i> CHI TIẾT HÀNG</div>
          <button class="x" @click="showCardModal = false" style="color: #fff; transition: all 0.2s; position: absolute; right: 20px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.15); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer;" onmouseover="this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.background='rgba(0,0,0,0.15)'">✕</button>
        </div>

        <!-- Hidden inputs for reactivity -->
        <div v-if="false">
          <input v-model="cardEdit.Mo_ta_chung" />
          <input v-model="cardEdit.Main_img" />
          <input v-model="cardEdit.Ma_hang" @input="isCardMaHangEdited = true" />
          <input v-model="cardEdit.Trang_thai" />
          <textarea v-model="cardEdit.Mo_ta_chi_tiet" />
          <FormattedInput :modelValue="cardEdit.Gia_tieu_chuan" @update:modelValue="cardEdit.Gia_tieu_chuan = $event" />
          <FormattedInput :modelValue="cardEdit.gia_hardware" @update:modelValue="cardEdit.gia_hardware = $event" />
          <input v-model="cardEdit.Ma_nha_cung_cap" @input="isCardMaNccEdited = true" />
          <input v-model="cardEdit.Ma_hang_lien_ket" />
          <input v-model="cardEdit.Ten_hang_lien_ket" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding: 24px; padding-bottom: 12px; overflow-y: auto; max-height: calc(95vh - 150px);">
          <!-- COLUMN 1: THÔNG TIN CHUNG -->
          <div class="modal-group" style="margin: 0; display: flex; flex-direction: column; gap: 20px;">
            <h4 class="modal-group-title" style="display: flex; align-items: center; gap: 8px;">
              Thông tin chung
            </h4>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Tên hàng <span style="color: #ef4444;">*</span></label>
              <div style="position: relative;" :class="{ 'input-loading': productsState === 'loading', 'input-loaded': productsState === 'loaded', 'input-ready': productsState === 'ready' }">
                <input v-model="cardEdit.Ten_hang" list="dl-hh-ten-card" placeholder="Nhập tên hàng hóa..." @input="updateCardMaHang" style="width: 100%; padding: 10px 14px; padding-left: 36px; border-radius: 8px; font-weight: 500;" />
                <i class="lucide-package" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #64748b; pointer-events: none;"></i>
              </div>
              <datalist id="dl-hh-ten-card">
                <option v-for="p in products" :key="p.Ma_hang + '_t'" :value="p.Ten_hang" />
              </datalist>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Danh mục</label>
                <input v-model="cardEdit.Danh_muc" list="category-list" placeholder="HW, SW, SVR..." style="width: 100%; padding: 10px 14px; border-radius: 8px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">ĐVT</label>
                <input v-model="cardEdit.DVT" placeholder="Cái, Bộ, License..." style="width: 100%; padding: 10px 14px; border-radius: 8px;" />
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Hãng</label>
                <div style="position: relative;">
                  <input v-model="cardEdit.Ten_nha_cung_cap" placeholder="Nhà cung cấp..." @input="updateCardMaNcc" style="width: 100%; padding: 10px 14px; padding-left: 36px; border-radius: 8px;" />
                  <i class="lucide-truck" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #64748b; pointer-events: none;"></i>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">License duration</label>
                <div style="position: relative;">
                  <input v-model="cardEdit.License_duration" placeholder="Thời hạn (vd: 1 Year, Perpetual...)" style="width: 100%; padding: 10px 14px; padding-left: 36px; border-radius: 8px;" />
                  <i class="lucide-clock" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #64748b; pointer-events: none;"></i>
                </div>
              </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Diễn giải</label>
              <textarea v-model="cardEdit.Features" rows="3" placeholder="Mô tả cấu hình, thông số nổi bật..." style="width: 100%; padding: 10px 14px; border-radius: 8px; resize: vertical; min-height: 70px;" />
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Ghi chú</label>
              <textarea v-model="cardEdit.Ghi_chu" rows="2" style="width: 100%; padding: 10px 14px; border-radius: 8px; resize: vertical;" />
            </div>
          </div>

          <!-- COLUMN 2: TÀI CHÍNH & GIÁ CẢ -->
          <div class="modal-group" style="margin: 0; display: flex; flex-direction: column; gap: 20px;">
            <h4 class="modal-group-title" style="display: flex; align-items: center; gap: 8px; color: #10b981 !important;">
              <span style="color: #10b981;">Tài chính & Giá cả</span>
            </h4>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">ĐƠN GIÁ BÁN (VND)</label>
              <div style="position: relative;">
                <FormattedInput :modelValue="(cardEdit.Don_gia || 0) * (Number(cardEdit.Ti_gia) || 1)" @update:modelValue="cardEdit.Don_gia = $event / (Number(cardEdit.Ti_gia) || 1)" placeholder="Nhập đơn giá xuất..." style="width: 100%; padding: 12px 14px; padding-left: 36px; border-radius: 8px; font-weight: 700; font-size: 16px; color: #10b981; border-color: rgba(16,185,129,0.3) !important; background: rgba(16,185,129,0.05) !important;" />
                <i class="lucide-tag" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #10b981; pointer-events: none;"></i>
                <span style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; font-weight: 600; color: #10b981; pointer-events: none;">₫</span>
              </div>
              <div v-if="cardEdit.Don_vi_tien_te && cardEdit.Don_vi_tien_te.toUpperCase() !== 'VND' && cardEdit.Ti_gia > 1" style="font-size: 11px; color: #10b981; margin-top: 2px;">
                ≈ {{ Number(cardEdit.Don_gia || 0).toLocaleString('vi-VN') }} {{ cardEdit.Don_vi_tien_te }}
              </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Giá Nhập (VND)</label>
              <div style="position: relative;">
                <FormattedInput :modelValue="(cardEdit.gia_nhap || 0) * (Number(cardEdit.Ti_gia) || 1)" @update:modelValue="cardEdit.gia_nhap = $event / (Number(cardEdit.Ti_gia) || 1)" placeholder="0" style="width: 100%; padding: 10px 14px; padding-right: 36px; border-radius: 8px;" />
                <span style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; font-weight: 600; color: #64748b; pointer-events: none;">₫</span>
              </div>
              <div v-if="cardEdit.Don_vi_tien_te && cardEdit.Don_vi_tien_te.toUpperCase() !== 'VND' && cardEdit.Ti_gia > 1" style="font-size: 11px; color: #64748b; margin-top: 2px;">
                ≈ {{ Number(cardEdit.gia_nhap || 0).toLocaleString('vi-VN') }} {{ cardEdit.Don_vi_tien_te }}
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Đơn vị tiền tệ</label>
                <div style="position: relative;">
                  <input v-model="cardEdit.Don_vi_tien_te" placeholder="VND, USD..." style="width: 100%; padding: 10px 14px; padding-left: 36px; border-radius: 8px;" />
                  <i class="lucide-coins" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #64748b; pointer-events: none;"></i>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Tỉ giá</label>
                <FormattedInput v-model="cardEdit.Ti_gia" placeholder="1" style="width: 100%; padding: 10px 14px; border-radius: 8px;" />
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Mức % Off</label>
                <div style="position: relative;">
                  <FormattedInput v-model="cardEdit.muc_phan_tram_off" placeholder="0" style="width: 100%; padding: 10px 14px; padding-right: 30px; border-radius: 8px; color: #f59e0b;" />
                  <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 600; color: #f59e0b; pointer-events: none;">%</span>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Thuế VAT</label>
                <div style="position: relative;">
                  <FormattedInput v-model="cardEdit.Thue_VAT" placeholder="VAT" style="width: 100%; padding: 10px 14px; padding-right: 30px; border-radius: 8px; color: #3b82f6;" />
                  <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 600; color: #3b82f6; pointer-events: none;">%</span>
                </div>
              </div>
            </div>

            <!-- SUMMARY BOX INSIDE COL 2 -->
            <div style="margin-top: auto; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3); border: 1px dashed rgba(16,185,129,0.3); border-radius: 12px; padding: 16px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px; margin: 0;">Số lượng xuất</label>
              <div class="qty" style="transform: scale(1.1); transform-origin: right center;">
                <button type="button" @click="cardEdit.So_luong = Math.max(1, toNum(cardEdit.So_luong, 1) - 1)">&#x2212;</button>
                <FormattedInput v-model="cardEdit.So_luong" placeholder="1" style="width: 36px; background: transparent !important; border: none !important; text-align: center; border-radius: 0; font-weight: 800; font-size: 14px; padding: 0; color: #fff; box-shadow: none;" />
                <button type="button" @click="cardEdit.So_luong = toNum(cardEdit.So_luong, 1) + 1">+</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions" style="display: flex; justify-content: flex-end; gap: 12px; align-items: center; padding: 0 24px 24px 24px; border-top: none; margin-top: auto;">
          <button style="padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; color: #94a3b8; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.color='#f8fafc'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#94a3b8'" @click="showCardModal = false">
            Đóng
          </button>
          <button style="background: linear-gradient(135deg, #10b981, #059669); border: none; box-shadow: 0 4px 15px rgba(16,185,129,0.3); padding: 12px 40px; border-radius: 8px; font-weight: 700; font-size: 15px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.boxShadow='0 6px 20px rgba(16,185,129,0.5)'; this.style.transform='translateY(-1px)';" onmouseout="this.style.boxShadow='0 4px 15px rgba(16,185,129,0.3)'; this.style.transform='translateY(0)';" @click="addFromCardModal(); showCardModal = false;">
            Thêm
          </button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL: XEM BÁO GIÁ GỐC (GROUP THEO NCC + DANH MỤC) ================== -->
    <div v-if="showPreviewRawModal" class="modal" @click.self="showPreviewRawModal = false">
      <div class="modal-card modal-wide modal-quote vip-modal-card" style="width: 1500px; max-width: 98vw;">
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

        <div class="hint">Click vào ô <b>SL / MỨC OFF / VAT</b> để sửa như Excel (tự tính lại ngay).</div>

        <div class="quote-table-wrap">
          <table>
            <thead>
              <tr>
                <th class="col-stt">STT</th>
                <th class="col-pn">P/N</th>
                <th class="col-name">Tên hàng</th>
                <th class="col-desc">Diễn giải</th>
                <th class="col-dvt">ĐVT</th>
                <th class="col-sl">SL</th>
                <th class="col-dg">GIÁ TIÊU CHUẨN</th>
                <th class="col-dg">ĐƠN GIÁ (LP)</th>
                <th class="col-dg">GIÁ NHẬP</th>
                <th class="col-dg">MỨC OFF</th>
                <th class="col-tt">TT trước thuế (VND)</th>
                <th class="col-vat">VAT</th>
                <th class="col-tt">TT sau thuế (VND)</th>
                <th class="col-tt" style="color: #ffffff !important;">Net Margin</th>
                <th class="col-del">Xóa</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="r in quoteRowsWithSTT" :key="r.key">
                <tr v-if="r.type === 'group'" class="group-row">
                  <td class="group-stt">{{ r.roman }}</td>
                  <td colspan="13" class="group-title">{{ r.title }}</td>
                </tr>
                <tr v-else class="quote-item-row" @click="openQuoteEditRaw(r.idx)">
                  <td>{{ r.stt }}</td>
                  <td class="col-pn-cell" :title="r.item.Ma_hang" @click.stop="openQuoteEditRaw(r.idx, 'Ma_hang')">{{ r.item.Ma_hang }}</td>
                  <td class="nowrap" @click.stop="openQuoteEditRaw(r.idx, 'Ten_hang')">{{ r.item.Ten_hang }}</td>
                  <td class="col-desc-cell" :title="[r.item.Mo_ta_chung, r.item.Mo_ta_chi_tiet, r.item.Features].filter(Boolean).join(' - ')">
                    <div class="preline">
                      <div v-if="r.item.Mo_ta_chung">{{ r.item.Mo_ta_chung }}</div>
                      <div v-if="r.item.Mo_ta_chi_tiet">{{ r.item.Mo_ta_chi_tiet }}</div>
                      <div v-if="r.item.Features">{{ r.item.Features }}</div>
                    </div>
                  </td>
                  <td class="col-dvt-cell" :title="r.item.DVT" @click.stop="openQuoteEditRaw(r.idx, 'DVT')">{{ r.item.DVT }}</td>
                  <td class="center" style="font-weight: 700;" @click.stop="openQuoteEditRaw(r.idx, 'So_luong')">{{ r.item.So_luong }}</td>
                  <td class="right" style="line-height: 1.3; font-weight: 700; color: #8b5cf6;" @click.stop="openQuoteEditRaw(r.idx, 'Don_gia_goc')">
                    <div>{{ displayGiaTieuChuanRaw(r.item) }}</div>
                    <div class="muted" style="font-size: 11px; margin-top: 2px; color: #8b5cf6 !important;">({{ displayGiaTieuChuanPctRaw(r.item) }}%)</div>
                  </td>
                  <td class="right">{{ displayDonGiaLPRaw(r.item) }}</td>
                  <td class="right" style="color: #fb923c; font-weight: 700;" @click.stop="openQuoteEditRaw(r.idx, 'gia_nhap_goc')">{{ formatVND(getGocNumber(r.item, '_gia_nhap_goc', toNum(r.item.gia_nhap, 0)) * getGocNumber(r.item, '_Ti_gia_goc', toNum(r.item.Ti_gia, 1))) }}</td>
                  <td class="right" style="line-height: 1.3; font-weight: 700; color: #f87171;" @click.stop="openQuoteEditRaw(r.idx, 'muc_off')">
                    <div>{{ displayMucOffAmountRaw(r.item) }}</div>
                    <div class="muted" style="font-size: 11px; margin-top: 2px; color: #f87171 !important;">(-{{ toNum(r.item.muc_phan_tram_off, 0) }}%)</div>
                  </td>
                  <td class="right" style="color: #10b981; font-weight: 800;">{{ formatVND(lineTruocThueRaw(r.item)) }}</td>
                  <td class="right" style="line-height: 1.3; color: #10b981; font-weight: 800;" @click.stop="openQuoteEditRaw(r.idx, 'Thue_VAT')">
                    <div>{{ formatVND(lineVATRaw(r.item)) }}</div>
                    <div class="muted" style="font-size: 11px; margin-top: 2px; color: #34d399 !important;">({{ vatGoc(r.item) }}%)</div>
                  </td>
                  <td class="right" style="color: #10b981; font-weight: 800;">{{ formatVND(lineSauThueRaw(r.item)) }}</td>
                  <td class="right" :style="{ color: lineLoiNhuanRaw(r.item) >= 0 ? '#10b981' : '#ef4444', fontWeight: 800 }">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                      <span v-if="lineLoiNhuanRaw(r.item) >= 0" style="font-size: 12px; margin-right: 2px;">▲</span>
                      <span v-else style="font-size: 12px; margin-right: 2px;">▼</span>
                      {{ formatVND(Math.abs(lineLoiNhuanRaw(r.item))) }}
                    </div>
                  </td>
                  <td class="center">
                    <button class="btn-del" @click.stop="removeSelected(r.idx)">✕</button>
                  </td>
                </tr>
              </template>
            </tbody>
            <tfoot>
              <tr style="background: #e2e8f0; font-weight: 700; color: #0f172a; white-space: nowrap;">
                <td colspan="9" class="center" style="font-size: 13px;">TỔNG CỘNG + THUẾ</td>
                <td class="right">
                  <span style="display: inline-block; padding: 2px 6px; border-radius: 12px; background: #ef4444; color: #fff; font-size: 12px; font-weight: 800; white-space: nowrap;">-{{ formatVND(totalsContract.off) }}</span>
                </td>
                <td class="right">
                  <span style="display: inline-block; padding: 2px 6px; border-radius: 12px; background: #475569; color: #fff; font-size: 12px; font-weight: 800; white-space: nowrap;">{{ formatVND(totalsContract.truoc) }}</span>
                </td>
                <td class="center">
                  <span style="display: inline-block; padding: 2px 6px; border-radius: 12px; background: #eab308; color: #fff; font-size: 12px; font-weight: 800; white-space: nowrap;">{{ formatVND(totalsContract.vat) }}</span>
                </td>
                <td class="right">
                  <span style="display: inline-block; padding: 2px 6px; border-radius: 12px; background: #2563eb; color: #fff; font-size: 12px; font-weight: 800; white-space: nowrap;">{{ formatVND(totalsContract.sau) }}</span>
                </td>
                <td class="right">
                  <div :style="{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', padding: '2px 6px', borderRadius: '12px', background: totalsContract.loi >= 0 ? '#10b981' : '#ef4444', color: '#fff', fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap' }">
                    <span v-if="totalsContract.loi >= 0" style="font-size: 10px;">▲</span>
                    <span v-else style="font-size: 10px;">▼</span>
                    {{ formatVND(Math.abs(totalsContract.loi)) }}
                  </div>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>



        <div class="modal-actions">
          <button class="primary" @click="showPreviewRawModal = false">Đóng</button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL: CHỈNH SỬA ITEM BÁO GIÁ ================== -->
    <div v-if="showQuoteEditModal && quoteEdit" class="modal vip-modal-overlay" @click.self="closeQuoteEdit()">
      <div class="modal-card modal-wide vip-modal-card" style="width: 1100px; max-width: 95vw;">
        <div class="modal-head" style="background: linear-gradient(135deg, #34d399, #10b981) !important; justify-content: center; position: relative; padding: 18px 24px; border-bottom: none; border-radius: 12px 12px 0 0;">
          <div style="color: #ffffff; text-transform: uppercase; font-weight: 900; font-size: 18px; margin: 0; display: flex; align-items: center; gap: 10px; letter-spacing: 0.5px;"><i class="lucide-pencil" style="color: #fff; width: 24px; height: 24px;"></i> CHỈNH SỬA HÀNG TRONG BÁO GIÁ</div>
          <button class="x" @click="closeQuoteEdit()" style="color: #fff; transition: all 0.2s; position: absolute; right: 20px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.15); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer;" onmouseover="this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.background='rgba(0,0,0,0.15)'">✕</button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding: 24px; padding-bottom: 16px; overflow-y: auto; max-height: calc(95vh - 200px);">
          <!-- COLUMN 1: THÔNG TIN CHUNG -->
          <div class="modal-group" style="margin: 0; display: flex; flex-direction: column; gap: 20px;">
            <h4 class="modal-group-title" style="display: flex; align-items: center; gap: 8px;">
              Thông tin chung
            </h4>
            
            <div v-if="false">
              <input v-model="quoteEdit.Ma_nha_cung_cap" />
              <input v-model="quoteEdit.Ma_hang_lien_ket" />
              <input v-model="quoteEdit.Ten_hang_lien_ket" />
              <textarea v-model="quoteEdit.Mo_ta_chung" />
              <textarea v-model="quoteEdit.Mo_ta_chi_tiet" />
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Mã hàng</label>
              <div style="position: relative;">
                <input id="qe-Ma_hang" v-model="quoteEdit.Ma_hang" style="width: 100%; padding: 10px 14px; padding-left: 36px; border-radius: 8px; font-weight: 500;" />
                <i class="lucide-tag" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #64748b; pointer-events: none;"></i>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Tên hàng <span style="color: #ef4444;">*</span></label>
              <div style="position: relative;">
                <input id="qe-Ten_hang" v-model="quoteEdit.Ten_hang" style="width: 100%; padding: 10px 14px; padding-left: 36px; border-radius: 8px; font-weight: 500;" />
                <i class="lucide-package" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #64748b; pointer-events: none;"></i>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Danh mục</label>
                <input id="qe-Danh_muc" v-model="quoteEdit.Danh_muc" list="category-list" placeholder="HW, SW, SVR..." style="width: 100%; padding: 10px 14px; border-radius: 8px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">ĐVT</label>
                <input id="qe-DVT" v-model="quoteEdit.DVT" readonly style="width: 100%; padding: 10px 14px; border-radius: 8px; background: rgba(255,255,255,0.05); color: #94a3b8;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Hãng</label>
                <div style="position: relative;">
                  <input id="qe-Ten_nha_cung_cap" v-model="quoteEdit.Ten_nha_cung_cap" style="width: 100%; padding: 10px 14px; padding-left: 36px; border-radius: 8px;" />
                  <i class="lucide-truck" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #64748b; pointer-events: none;"></i>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">License duration</label>
                <div style="position: relative;">
                  <input id="qe-License_duration" v-model="quoteEdit.License_duration" style="width: 100%; padding: 10px 14px; padding-left: 36px; border-radius: 8px;" />
                  <i class="lucide-clock" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #64748b; pointer-events: none;"></i>
                </div>
              </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Tính năng / Features</label>
              <textarea id="qe-Features" v-model="quoteEdit.Features" rows="3" style="width: 100%; padding: 10px 14px; border-radius: 8px; resize: vertical;" />
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Ghi chú</label>
              <textarea id="qe-Ghi_chu" v-model="quoteEdit.Ghi_chu" rows="2" style="width: 100%; padding: 10px 14px; border-radius: 8px; resize: vertical;" />
            </div>
          </div>

          <!-- COLUMN 2: TÀI CHÍNH & GIÁ CẢ -->
          <div class="modal-group" style="margin: 0; display: flex; flex-direction: column; gap: 20px;">
            <h4 class="modal-group-title" style="display: flex; align-items: center; gap: 8px; color: #10b981 !important;">
              <span style="color: #10b981;">Tài chính & Giá cả</span>
            </h4>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">ĐƠN GIÁ BÁN (VND)</span>
                <button class="util-btn small inline-adjust" style="padding: 2px 8px; font-size: 11px; white-space: nowrap; border-radius: 4px; background: rgba(16,185,129,0.2); color: #10b981; border: 1px solid rgba(16,185,129,0.4);" @click="openAdjustPrice('field', '', 'Đơn giá', 'Don_gia')" title="Giá kí hợp đồng Đơn giá">
                  <i class="ri-arrow-up-down-fill"></i> Điều chỉnh
                </button>
              </label>
              <div style="position: relative;">
                <FormattedInput id="qe-Don_gia" :modelValue="(quoteEdit.Don_gia || 0) * (Number(quoteEdit.Ti_gia) || 1)" @update:modelValue="quoteEdit.Don_gia = $event / (Number(quoteEdit.Ti_gia) || 1)" @input="ensureNumberField(quoteEdit, 'Don_gia')" :readonly="true" style="width: 100%; padding: 12px 14px; padding-left: 36px; border-radius: 8px; font-weight: 700; font-size: 16px; color: #10b981; border-color: rgba(16,185,129,0.3) !important; background: rgba(16,185,129,0.05) !important;" />
                <i class="lucide-tag" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #10b981; pointer-events: none;"></i>
                <span style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; font-weight: 600; color: #10b981; pointer-events: none;">₫</span>
              </div>
              <div v-if="quoteEdit.Don_vi_tien_te && quoteEdit.Don_vi_tien_te.toUpperCase() !== 'VND' && quoteEdit.Ti_gia > 1" style="font-size: 11px; color: #10b981; margin-top: 2px;">
                ≈ {{ Number(quoteEdit.Don_gia || 0).toLocaleString('vi-VN') }} {{ quoteEdit.Don_vi_tien_te }}
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Giá Nhập (VND)</span>
                </label>
                <div style="position: relative;">
                  <FormattedInput id="qe-gia_nhap" :modelValue="(quoteEdit.gia_nhap || 0) * (Number(quoteEdit.Ti_gia) || 1)" @update:modelValue="quoteEdit.gia_nhap = $event / (Number(quoteEdit.Ti_gia) || 1)" @input="ensureNumberField(quoteEdit, 'gia_nhap')" style="width: 100%; padding: 10px 14px; padding-right: 36px; border-radius: 8px; font-weight: 500;" />
                  <span style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; font-weight: 600; color: #94a3b8; pointer-events: none;">₫</span>
                </div>
                <div v-if="quoteEdit.Don_vi_tien_te && quoteEdit.Don_vi_tien_te.toUpperCase() !== 'VND' && quoteEdit.Ti_gia > 1" style="font-size: 11px; color: #64748b; margin-top: 2px;">
                  ≈ {{ Number(quoteEdit.gia_nhap || 0).toLocaleString('vi-VN') }} {{ quoteEdit.Don_vi_tien_te }}
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Giá tiêu chuẩn (VND)</span>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">% LP:</span>
                    <FormattedInput :modelValue="quoteEditTieuChuanPct" @update:modelValue="updateTieuChuanPct" style="width: 54px; padding: 4px 6px; font-size: 12px; text-align: center; border-radius: 4px; background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2);" />
                  </div>
                </label>
                <div style="position: relative;">
                  <FormattedInput id="qe-Gia_tieu_chuan" :modelValue="(quoteEdit.Gia_tieu_chuan || 0) * (Number(quoteEdit.Ti_gia) || 1)" @update:modelValue="quoteEdit.Gia_tieu_chuan = $event / (Number(quoteEdit.Ti_gia) || 1)" @input="ensureNumberField(quoteEdit, 'Gia_tieu_chuan')" style="width: 100%; padding: 10px 14px; padding-right: 36px; border-radius: 8px; font-weight: 500; color: #8b5cf6;" />
                  <span style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; font-weight: 600; color: #8b5cf6; pointer-events: none;">₫</span>
                </div>
                <div v-if="quoteEdit.Don_vi_tien_te && quoteEdit.Don_vi_tien_te.toUpperCase() !== 'VND' && quoteEdit.Ti_gia > 1" style="font-size: 11px; color: #64748b; margin-top: 2px;">
                  ≈ {{ Number(quoteEdit.Gia_tieu_chuan || 0).toLocaleString('vi-VN') }} {{ quoteEdit.Don_vi_tien_te }}
                </div>
              </div>
            </div>

            <div v-if="false" style="display: flex; flex-direction: column; gap: 6px;">
              <label style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Giá Hardware (VND)</span>
                <button class="util-btn small inline-adjust" style="padding: 2px 8px; font-size: 11px; white-space: nowrap; border-radius: 4px; background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2);" @click="openAdjustPrice('field', '', 'Giá Hardware', 'gia_hardware')" title="Tăng khống Giá Hardware">
                  <i class="ri-arrow-up-down-fill"></i> Điều chỉnh
                </button>
              </label>
              <div style="position: relative;">
                <FormattedInput :modelValue="(quoteEdit.gia_hardware || 0) * (Number(quoteEdit.Ti_gia) || 1)" @update:modelValue="quoteEdit.gia_hardware = $event / (Number(quoteEdit.Ti_gia) || 1)" @input="ensureNumberField(quoteEdit, 'gia_hardware')" :readonly="true" style="width: 100%; padding: 10px 14px; padding-right: 36px; border-radius: 8px; background: rgba(255,255,255,0.05); color: #94a3b8;" />
                <span style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; font-weight: 600; color: #64748b; pointer-events: none;">₫</span>
              </div>
              <div v-if="quoteEdit.Don_vi_tien_te && quoteEdit.Don_vi_tien_te.toUpperCase() !== 'VND' && quoteEdit.Ti_gia > 1" style="font-size: 11px; color: #64748b; margin-top: 2px;">
                ≈ {{ Number(quoteEdit.gia_hardware || 0).toLocaleString('vi-VN') }} {{ quoteEdit.Don_vi_tien_te }}
              </div>
            </div>


            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Đơn vị tiền tệ</label>
                <div style="position: relative;">
                  <input v-model="quoteEdit.Don_vi_tien_te" readonly style="width: 100%; padding: 10px 14px; padding-left: 36px; border-radius: 8px; background: rgba(255,255,255,0.05); color: #94a3b8;" />
                  <i class="lucide-coins" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #64748b; pointer-events: none;"></i>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Tỉ giá</label>
                <FormattedInput v-model="quoteEdit.Ti_gia" @input="ensureNumberField(quoteEdit, 'Ti_gia')" style="width: 100%; padding: 10px 14px; border-radius: 8px;" />
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Mức % Off</label>
                <div style="position: relative;">
                  <FormattedInput id="qe-muc_phan_tram_off" v-model="quoteEdit.muc_phan_tram_off" @input="ensureNumberField(quoteEdit, 'muc_phan_tram_off')" style="width: 100%; padding: 10px 14px; padding-right: 30px; border-radius: 8px; color: #f59e0b;" />
                  <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 600; color: #f59e0b; pointer-events: none;">%</span>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Thuế VAT</label>
                <div style="position: relative;">
                  <FormattedInput id="qe-Thue_VAT" v-model="quoteEdit.Thue_VAT" @input="ensureNumberField(quoteEdit, 'Thue_VAT')" style="width: 100%; padding: 10px 14px; padding-right: 30px; border-radius: 8px; color: #3b82f6;" />
                  <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 600; color: #3b82f6; pointer-events: none;">%</span>
                </div>
              </div>
            </div>

            <!-- ĐƠN GIÁ (KH) + THÀNH TIỀN TRƯỚC THUẾ -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">Đơn giá (KH)</span>
                  <button class="util-btn small inline-adjust" style="padding: 2px 8px; font-size: 11px; white-space: nowrap; border-radius: 4px; background: rgba(16,185,129,0.2); color: #10b981; border: 1px solid rgba(16,185,129,0.4);" @click="openAdjustPrice('field', '', 'Đơn giá (KH)', 'unit_price_kh')" title="Điều chỉnh Đơn giá KH">
                    <i class="ri-arrow-up-down-fill"></i> Điều chỉnh
                  </button>
                </label>
                <div style="position: relative;">
                  <FormattedInput id="qe-unit_price_kh" :modelValue="unitPrice(quoteEdit)" :readonly="true" style="width: 100%; padding: 10px 14px; padding-left: 36px; border-radius: 8px; font-weight: 700; font-size: 15px; color: #10b981; border-color: rgba(16,185,129,0.3) !important; background: rgba(16,185,129,0.05) !important;" />
                  <i class="lucide-tag" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #10b981; pointer-events: none;"></i>
                  <span style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; font-weight: 600; color: #10b981; pointer-events: none;">₫</span>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px;">TT Trước thuế</span>
                  <button class="util-btn small inline-adjust" style="padding: 2px 8px; font-size: 11px; white-space: nowrap; border-radius: 4px; background: rgba(16,185,129,0.2); color: #10b981; border: 1px solid rgba(16,185,129,0.4);" @click="openAdjustPrice('field', '', 'Thành tiền trước thuế', 'line_truoc_thue')" title="Điều chỉnh Thành tiền trước thuế">
                    <i class="ri-arrow-up-down-fill"></i> Điều chỉnh
                  </button>
                </label>
                <div style="position: relative;">
                  <FormattedInput id="qe-line_truoc_thue" :modelValue="lineTruocThue(quoteEdit)" :readonly="true" style="width: 100%; padding: 10px 14px; padding-left: 36px; border-radius: 8px; font-weight: 700; font-size: 15px; color: #10b981; border-color: rgba(16,185,129,0.3) !important; background: rgba(16,185,129,0.05) !important;" />
                  <i class="lucide-calculator" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #10b981; pointer-events: none;"></i>
                  <span style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; font-weight: 600; color: #10b981; pointer-events: none;">₫</span>
                </div>
              </div>
            </div>

            <!-- CHÊNH LỆCH GIÁ -->
            <div v-if="quoteEdit._Don_gia_goc != null" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 10px; border: 1px solid; margin-top: 4px;"
              :style="{
                background: lineTruocThue(quoteEdit) - lineTruocThueRaw(quoteEdit) >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                borderColor: lineTruocThue(quoteEdit) - lineTruocThueRaw(quoteEdit) >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'
              }">
              <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;"
                :style="{ color: lineTruocThue(quoteEdit) - lineTruocThueRaw(quoteEdit) >= 0 ? '#10b981' : '#ef4444' }">
                <div>
                  <i class="lucide-trending-up" v-if="lineTruocThue(quoteEdit) - lineTruocThueRaw(quoteEdit) >= 0" style="margin-right: 4px;"></i>
                  <i class="lucide-trending-down" v-else style="margin-right: 4px;"></i>
                  Chênh lệch giá
                </div>
                <button class="util-btn small inline-adjust" style="padding: 2px 8px; font-size: 11px; white-space: nowrap; border-radius: 4px; background: rgba(16,185,129,0.2); color: #10b981; border: 1px solid rgba(16,185,129,0.4);" @click="openAdjustPrice('field', '', 'Chênh lệch giá', 'item_chenh_lech')" title="Điều chỉnh mức chênh lệch">
                  <i class="ri-arrow-up-down-fill"></i> Điều chỉnh
                </button>
              </span>
              <span style="font-size: 16px; font-weight: 800;"
                :style="{ color: lineTruocThue(quoteEdit) - lineTruocThueRaw(quoteEdit) >= 0 ? '#10b981' : '#ef4444' }">
                {{ lineTruocThue(quoteEdit) - lineTruocThueRaw(quoteEdit) >= 0 ? '+' : '' }}{{ formatVND(lineTruocThue(quoteEdit) - lineTruocThueRaw(quoteEdit)) }} ₫
              </span>
            </div>

            <!-- SUMMARY BOX INSIDE COL 2 -->
            <div style="margin-top: auto; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3); border: 1px dashed rgba(16,185,129,0.3); border-radius: 12px; padding: 16px;">
              <label style="font-size: 11px; text-transform: uppercase; color: #fff; font-weight: 600; letter-spacing: 0.5px; margin: 0;">Số lượng</label>
              <div class="qty" style="transform: scale(1.1); transform-origin: right center;">
                <button type="button" @click="quoteEdit.So_luong = Math.max(1, toNum(quoteEdit.So_luong, 1) - 1)">&#x2212;</button>
                <FormattedInput id="qe-So_luong" v-model="quoteEdit.So_luong" @input="ensureNumberField(quoteEdit, 'So_luong')" style="width: 36px; background: transparent !important; border: none !important; text-align: center; border-radius: 0; font-weight: 800; font-size: 14px; padding: 0; color: #fff; box-shadow: none;" />
                <button type="button" @click="quoteEdit.So_luong = toNum(quoteEdit.So_luong, 1) + 1">+</button>
              </div>
            </div>
          </div>
        </div>
        


        <div class="modal-actions" style="display: flex; justify-content: flex-end; gap: 12px; align-items: center; padding: 16px 24px 24px 24px; border-top: none; margin-top: 12px;">
          <button class="btn-del" @click="removeSelected(quoteEditIdx)" style="margin-right: auto; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;">✕ Xóa item</button>
          
          <button style="padding: 12px 36px; border-radius: 8px; font-weight: 600; font-size: 15px; color: #94a3b8; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.color='#f8fafc'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#94a3b8'" @click="closeQuoteEdit()">
            Hủy
          </button>
          <button style="background: linear-gradient(135deg, #10b981, #059669); border: none; box-shadow: 0 4px 15px rgba(16,185,129,0.3); padding: 12px 40px; border-radius: 8px; font-weight: 700; font-size: 15px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.boxShadow='0 6px 20px rgba(16,185,129,0.5)'; this.style.transform='translateY(-1px)';" onmouseout="this.style.boxShadow='0 4px 15px rgba(16,185,129,0.3)'; this.style.transform='translateY(0)';" @click="saveQuoteEdit()">
            Lưu
          </button>
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
          <input id="qeraw-Ma_hang" v-model="quoteEditRaw.Ma_hang" readonly />
        </div>
        <div>
          <label>Tên hàng</label>
          <input id="qeraw-Ten_hang" v-model="quoteEditRaw.Ten_hang" />
        </div>
      </div>

    <div class="grid3">
      <div>
        <label>Số lượng</label>
        <input id="qeraw-So_luong" type="number" :value="quoteEditRaw.So_luong" readonly />
      </div>

      <div>
        <label>VAT gốc (%)</label>
        <FormattedInput
          id="qeraw-Thue_VAT"
          v-model="quoteEditRaw._Thue_VAT_goc"
          @input="ensureNumberField(quoteEditRaw, '_Thue_VAT_goc')"
        />
      </div>

      <div>
        <label>Đơn vị (ĐVT)</label>
        <input id="qeraw-DVT" v-model="quoteEditRaw.DVT" readonly />
      </div>
    </div>

    <div class="grid3">
      <div>
        <label>Đơn vị tiền tệ</label>
        <input v-model="quoteEditRaw.Don_vi_tien_te" readonly />
      </div>

      <div>
        <label>Tỉ giá gốc</label>
        <FormattedInput
          v-model="quoteEditRaw._Ti_gia_goc"
          @input="ensureNumberField(quoteEditRaw, '_Ti_gia_goc')"
        />
      </div>

      <div>
        <label>ĐƠN GIÁ GỐC (VND)</label>
        <FormattedInput
          id="qeraw-Don_gia_goc"
          :modelValue="(quoteEditRaw._Don_gia_goc || 0) * (Number(quoteEditRaw._Ti_gia_goc) || 1)"
          @update:modelValue="quoteEditRaw._Don_gia_goc = $event / (Number(quoteEditRaw._Ti_gia_goc) || 1)"
          @input="ensureNumberField(quoteEditRaw, '_Don_gia_goc')"
        />
        <div v-if="quoteEditRaw.Don_vi_tien_te && quoteEditRaw.Don_vi_tien_te.toUpperCase() !== 'VND' && quoteEditRaw._Ti_gia_goc > 1" style="font-size: 11px; color: #64748b; margin-top: 4px;">
          ≈ {{ Number(quoteEditRaw._Don_gia_goc || 0).toLocaleString('vi-VN') }} {{ quoteEditRaw.Don_vi_tien_te }}
        </div>
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
          <label>Giá Hardware gốc (VND)</label>
          <FormattedInput id="qeraw-gia_hardware_goc" :modelValue="(quoteEditRaw._gia_hardware_goc || 0) * (Number(quoteEditRaw._Ti_gia_goc) || 1)" @update:modelValue="quoteEditRaw._gia_hardware_goc = $event / (Number(quoteEditRaw._Ti_gia_goc) || 1)" @input="ensureNumberField(quoteEditRaw, '_gia_hardware_goc')" />
          <div v-if="quoteEditRaw.Don_vi_tien_te && quoteEditRaw.Don_vi_tien_te.toUpperCase() !== 'VND' && quoteEditRaw._Ti_gia_goc > 1" style="font-size: 11px; color: #64748b; margin-top: 4px;">
            ≈ {{ Number(quoteEditRaw._gia_hardware_goc || 0).toLocaleString('vi-VN') }} {{ quoteEditRaw.Don_vi_tien_te }}
          </div>
        </div>
        <div>
          <label>Giá Nhập gốc (VND)</label>
          <FormattedInput id="qeraw-gia_nhap_goc" :modelValue="(quoteEditRaw._gia_nhap_goc || 0) * (Number(quoteEditRaw._Ti_gia_goc) || 1)" @update:modelValue="quoteEditRaw._gia_nhap_goc = $event / (Number(quoteEditRaw._Ti_gia_goc) || 1)" @input="ensureNumberField(quoteEditRaw, '_gia_nhap_goc')" />
          <div v-if="quoteEditRaw.Don_vi_tien_te && quoteEditRaw.Don_vi_tien_te.toUpperCase() !== 'VND' && quoteEditRaw._Ti_gia_goc > 1" style="font-size: 11px; color: #64748b; margin-top: 4px;">
            ≈ {{ Number(quoteEditRaw._gia_nhap_goc || 0).toLocaleString('vi-VN') }} {{ quoteEditRaw.Don_vi_tien_te }}
          </div>
        </div>
        <div>
          <label>Mức % Off gốc</label>
          <FormattedInput id="qeraw-muc_off" v-model="quoteEditRaw._muc_phan_tram_off_goc" @input="ensureNumberField(quoteEditRaw, '_muc_phan_tram_off_goc')" />
        </div>
      </div>
    </div>

    <div class="totals">
      <div class="mini"><b>Trước thuế:</b> {{ formatVND(lineTruocThueRaw(quoteEditRaw)) }}</div>
      <div class="mini"><b>VAT:</b> {{ formatVND(lineVATRaw(quoteEditRaw)) }}</div>
      <div class="mini"><b>Sau thuế:</b> {{ formatVND(lineSauThueRaw(quoteEditRaw)) }}</div>
    </div>

    <div class="modal-actions">
      <button class="primary" @click="saveQuoteEditRaw()">Lưu</button>
      <button @click="closeQuoteEditRaw()">Hủy</button>
      <button class="btn-del" @click="removeSelected(quoteEditRawIdx)">✕ Xóa item</button>
    </div>
  </div>
</div>

    <!-- ================== MODAL: LOAD PIPELINE ================== -->
<div v-if="showLoadPipelineModal" class="modal load-invoice-modal-overlay" @click.self="showLoadPipelineModal = false">
  <div class="modal-card load-invoice-modal" style="width: min(1500px, 98vw); display: flex; flex-direction: column; max-height: 90vh;">
    <div class="modal-head">
      <h3><i class="lucide-folder-input"></i> Load PO-DXMH-DR-Báo giá</h3>
      <button class="x" @click="showLoadPipelineModal = false">×</button>
    </div>
    
    <div class="load-invoice-search" style="padding: 16px; padding-bottom: 8px;">
       <input v-model="loadPipelineSearch" placeholder="🔍 Tìm kiếm theo Số PO, Tên dự án, Mã Hợp đồng..." class="search-input" style="width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #f8fafc; font-size: 15px;" />
    </div>

    <div class="load-invoice-grid" style="flex: 1; overflow-y: auto; padding: 0 16px 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; align-content: start;">
      
      <template v-if="pipelineListState === 'loading'">
        <div class="skeleton-card" v-for="n in 6" :key="'sk-pl-'+n">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <div class="skeleton-line" style="width: 120px; height: 18px;"></div>
            <div class="skeleton-line" style="width: 80px; height: 14px;"></div>
          </div>
          <div class="skeleton-line" style="width: 60%; height: 20px; margin-bottom: 12px;"></div>
          <div class="skeleton-line" style="width: 100%; height: 1px; margin-bottom: 12px;"></div>
          <div class="skeleton-line" style="width: 70%; height: 16px; margin-bottom: 8px;"></div>
          <div class="skeleton-line" style="width: 50%; height: 16px; margin-bottom: 16px;"></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div class="skeleton-line" style="width: 40%; height: 14px;"></div>
            <div class="skeleton-line" style="width: 20%; height: 14px;"></div>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <div class="skeleton-line" style="width: 30%; height: 14px;"></div>
            <div class="skeleton-line" style="width: 25%; height: 14px;"></div>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-for="po in filteredPoDxmhList" :key="po.ma_hop_dong" 
             class="invoice-card"
             :class="{ 'selected': loadPipelineFilter === (po.so_po + ' - ' + po.ma_hop_dong) }"
             @click="loadPipelineFilter = (po.so_po + ' - ' + po.ma_hop_dong)"
             @dblclick="loadPipelineFilter = (po.so_po + ' - ' + po.ma_hop_dong); loadPipelineToFE()">
          
          <div class="invoice-card-header">
            <span class="invoice-ma-hd"><i class="lucide-file-text" style="width: 14px; height: 14px;"></i> {{ po.ma_hop_dong || 'N/A' }}</span>
            <span class="invoice-date">{{ po.created_time || '' }}</span>
          </div>
          <div class="invoice-card-body">
            <p class="invoice-po" style="font-size: 15px; font-weight: 700; color: #60a5fa;">PO: {{ po.so_po || 'N/A' }}</p>
            
            <hr class="invoice-divider" />
            
            <p class="invoice-text" v-if="po.company"><i class="ri-building-line" style="margin-right: 4px; color: #64748b;"></i>{{ po.company }}</p>
            <p class="invoice-text" v-if="po.contact"><i class="ri-user-line" style="margin-right: 4px; color: #64748b;"></i>{{ po.contact }}</p>
            
            <div class="invoice-totals" v-if="po.hang_hoa_list && po.hang_hoa_list.length > 0">
              <div v-for="(hh, idx) in po.hang_hoa_list" :key="idx" style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                <span style="flex: 1; color: #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ hh.ten }}</span>
                <span style="color: #94a3b8; white-space: nowrap; font-size: 12px;">x{{ hh.sl }}</span>
                <span style="color: #10b981; white-space: nowrap; font-weight: 600;">${{ parseFloat(Number(hh.listPrice).toFixed(3)) }}</span>
              </div>
            </div>
            <p v-else class="invoice-text" style="color: #475569; font-style: italic;">Chưa có hàng hóa</p>
          </div>
        </div>
        
        <div v-if="filteredPoDxmhList.length === 0" class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 32px; color: #94a3b8; font-style: italic;">
          Không tìm thấy Pipeline nào phù hợp.
        </div>
      </template>
    </div>
      
    <p v-if="loadPipelineMsg" class="muted" style="text-align: center; margin: 8px 0; padding: 0 16px;" :style="{color: loadPipelineMsg.includes('Lỗi') || loadPipelineMsg.includes('Đã') ? 'red' : 'green'}">
      {{ loadPipelineMsg }}
    </p>

    <div class="modal-actions" style="justify-content: center; padding: 16px; border-top: 1px solid #334155;">
      <button @click="showLoadPipelineModal = false" style="padding: 10px 32px;">Đóng</button>
      <button class="btn-load-fe" :disabled="loadingPipeline || !loadPipelineFilter" @click="loadPipelineToFE">
        {{ loadingPipeline ? 'Đang nạp...' : 'Nạp dữ liệu' }}
      </button>
    </div>
  </div>
</div>

    <!-- ================== MODAL: LOAD HÓA ĐƠN / HỢP ĐỒNG ================== -->
<div v-if="showLoadInvoiceModal" class="modal load-invoice-modal-overlay" @click.self="showLoadInvoiceModal = false">
  <div class="modal-card load-invoice-modal" style="width: min(1500px, 98vw); display: flex; flex-direction: column; max-height: 90vh;">
    <div class="modal-head">
      <h3><i class="lucide-download"></i> Load hóa đơn / hợp đồng</h3>
      <button class="x" @click="showLoadInvoiceModal = false">✕</button>
    </div>

    <div class="load-invoice-search" style="padding: 16px; padding-bottom: 8px;">
       <input v-model="loadSearchQuery" placeholder="🔍 Tìm kiếm theo Số HĐ, Mã HĐ, Số PO, Tên khách hàng, Tên công ty..." class="search-input" style="width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #f8fafc; font-size: 15px;" />
    </div>

    <div class="load-invoice-filters" style="display: flex; gap: 12px; padding: 0 16px 16px; align-items: center; justify-content: flex-start; flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <label style="color: #94a3b8; font-size: 13px; white-space: nowrap;">Từ:</label>
        <input type="date" v-model="loadFromDate" class="filter-input" />
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <label style="color: #94a3b8; font-size: 13px; white-space: nowrap;">Đến:</label>
        <input type="date" v-model="loadToDate" class="filter-input" />
      </div>
      <select v-model="loadStatusFilter" class="filter-select" style="min-width: 150px;">
        <option value="">Tất cả trạng thái</option>
        <option value="Tạm">Tạm</option>
        <option value="Chính thức">Chính thức</option>
      </select>
      <select v-model="loadSortBy" class="filter-select" style="min-width: 160px;">
        <option value="desc">Mới nhất ➔ Cũ nhất</option>
        <option value="asc">Cũ nhất ➔ Mới nhất</option>
      </select>
    </div>

    <div class="load-invoice-grid" style="flex: 1; overflow-y: auto; padding: 0 16px 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; align-content: start;">
      <template v-if="invoiceListState === 'loading'">
        <div class="skeleton-card" v-for="n in 6" :key="'sk-iv-'+n">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <div class="skeleton-line" style="width: 140px; height: 18px;"></div>
            <div class="skeleton-line" style="width: 80px; height: 14px;"></div>
          </div>
          <div class="skeleton-line" style="width: 50%; height: 16px; margin-bottom: 8px;"></div>
          <div class="skeleton-line" style="width: 70%; height: 16px; margin-bottom: 12px;"></div>
          <div class="skeleton-line" style="width: 100%; height: 1px; margin-bottom: 12px;"></div>
          <div class="skeleton-line" style="width: 80%; height: 16px; margin-bottom: 8px;"></div>
          <div class="skeleton-line" style="width: 60%; height: 16px; margin-bottom: 16px;"></div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div class="skeleton-line" style="width: 100%; height: 16px;"></div>
            <div class="skeleton-line" style="width: 90%; height: 16px;"></div>
            <div class="skeleton-line" style="width: 95%; height: 16px;"></div>
          </div>
        </div>
      </template>

      <template v-else>
      <div 
        v-for="r in contractCards" 
        :key="r.maHD" 
        class="invoice-card"
        :class="{ 'selected': loadMode === 'MA' && loadKey === r.maHD }"
        @click="loadMode = 'MA'; loadKey = r.maHD;"
        @dblclick="loadMode = 'MA'; loadKey = r.maHD; loadInvoiceToFE()"
      >
        <div class="invoice-card-header">
          <span class="invoice-ma-hd"><i class="lucide-file-text" style="width: 14px; height: 14px;"></i> {{ r.maHD || 'Chưa có Mã HĐ' }}</span>
          <span class="invoice-date">{{ r.ngay }}</span>
        </div>
        <div class="invoice-card-body">
          <p v-if="r.soPO" class="invoice-po">Số PO: {{ r.soPO }}</p>
          <p class="invoice-status">Trạng thái hợp đồng: <span class="status-badge" :class="{'badge-temp': r.trangThai === 'Tạm', 'badge-official': r.trangThai === 'Chính thức'}">{{ r.trangThai }}</span></p>
          
          <hr class="invoice-divider" />
          
          <p v-if="r.mst" class="invoice-text">MST: {{ r.mst }}</p>
          <p v-if="r.tenCongTy" class="invoice-text">Tên công ty: {{ r.tenCongTy }}</p>
          <p class="invoice-customer">Tên khách hàng: {{ r.tenKH }}</p>
          
          <div class="invoice-totals">
            <p style="color: #ef4444;">Tổng giá thực tế: <span>{{ formatVND(r.tongGiaThucTe) }}</span></p>
            <p>Tổng tiền trước thuế: <span>{{ formatVND(r.truocThue) }}</span></p>
            <p class="highlight" style="border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 4px;">Tổng tiền sau thuế: <span>{{ formatVND(r.sauThue) }}</span></p>
            <p>Chênh lệch giá: <span style="color: #10b981">{{ r.chenhLechGia > 0 ? '+' : '' }}{{ formatVND(r.chenhLechGia) }}</span></p>
            <p>Còn lại: <span>{{ formatVND(r.conLai) }}</span></p>
            <p style="color: #eab308; margin-top: 4px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.2);">Tổng chiết khấu: <span>{{ formatVND(r.tongChietKhau) }}</span></p>
          </div>
        </div>
      </div>
      <div v-if="contractCards.length === 0" class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 32px; color: #94a3b8; font-style: italic;">
        Không tìm thấy hợp đồng/hóa đơn nào phù hợp.
      </div>
      </template>
    </div>

    <p v-if="loadMsg" class="muted" style="text-align: center; margin: 8px 0;">{{ loadMsg }}</p>

    <div class="modal-actions" style="justify-content: center; padding: 16px; border-top: 1px solid #334155;">
      <button @click="showLoadInvoiceModal = false" style="padding: 10px 32px;">Đóng</button>
      <button class="btn-load-fe" :disabled="loadingInvoice || !loadKey" @click="loadInvoiceToFE">
        {{ loadingInvoice ? 'Đang load...' : 'Chỉnh sửa báo giá' }}
      </button>
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
    <div v-if="showSaveModal" class="modal vip-modal-overlay" @click.self="showSaveModal = false">
      <div class="modal-card modal-wide vip-modal-card" style="width: 1060px; max-width: 95vw;">
        <div class="modal-head" style="background: linear-gradient(135deg, #34d399, #10b981) !important; justify-content: center; position: relative; padding: 16px 24px; border-bottom: none; border-radius: 12px 12px 0 0;">
          <div style="color: #fff; text-transform: uppercase; font-weight: 900; font-size: 16px; letter-spacing: 0.5px;">THÔNG TIN KHÁCH HÀNG & LƯU BÁO GIÁ</div>
          <button class="x" @click="showSaveModal = false" style="color: #fff; position: absolute; right: 18px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.15); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer;">✕</button>
        </div>
        <div style="padding: 24px; overflow-y: auto; max-height: calc(95vh - 140px);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <!-- LEFT: KHÁCH HÀNG -->
          <div style="background: rgba(16,185,129,0.04); border: 1px solid rgba(16,185,129,0.12); border-radius: 10px; padding: 20px; display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: flex-start; align-items: center; gap: 10px; margin-bottom: 2px;">
              <div style="font-size: 12px; text-transform: uppercase; font-weight: 800; color: #34d399; letter-spacing: 1px; white-space: nowrap;">KHÁCH HÀNG</div>
              <button @click="resetCustomer" style="padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; background: #ef4444; color: #ffffff; border: none; cursor: pointer; white-space: nowrap; width: fit-content; flex-shrink: 0; line-height: 1; box-shadow: 0 2px 4px rgba(239,68,68,0.3);">Reset</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Mã KH</label>
                <input v-model="maKHInput" list="dl-ma-kh-modal" placeholder="Mã KH" @change="fillCustomerByMa(maKHInput)" @blur="onBlurMaKH" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
                <datalist id="dl-ma-kh-modal"><option v-for="k in customers" :key="k.Ma_khach_hang" :value="k.Ma_khach_hang" /></datalist>
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Tên KH</label>
                <input v-model="tenKHInput" list="dl-ten-kh-modal" placeholder="Tên KH" @change="fillCustomerByTen(tenKHInput)" @blur="onBlurTenKH" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
                <datalist id="dl-ten-kh-modal"><option v-for="k in customers" :key="k.Ma_khach_hang + '_' + k.Ten_khach_hang" :value="k.Ten_khach_hang" /></datalist>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Email</label>
                <input v-model="khach.Email_ca_nhan" placeholder="Email" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">SĐT</label>
                <input v-model="khach.So_dien_thoai_ca_nhan" placeholder="SĐT" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Trạng thái</label>
                <input v-model="khach.Trang_thai" placeholder="Trạng thái" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Công nợ</label>
                <input v-model="khach.Cong_no_chua_thanh_toan" placeholder="Công nợ" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 3px;">
              <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Ghi chú</label>
              <input v-model="khach.Ghi_chu" placeholder="Ghi chú" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
            </div>
          </div>
          <!-- ═══ GROUP 2: THÔNG TIN CÔNG TY ═══ -->
          <!-- RIGHT: CÔNG TY -->
          <div style="background: rgba(56,189,248,0.04); border: 1px solid rgba(56,189,248,0.12); border-radius: 10px; padding: 20px; display: flex; flex-direction: column; gap: 14px;">
            <div style="font-size: 12px; text-transform: uppercase; font-weight: 800; color: #38bdf8; letter-spacing: 1px;">THÔNG TIN CÔNG TY</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Tên công ty</label>
                <input v-model="khach.Ten_cong_ty" list="dl-cty-modal" placeholder="Tên CT" @change="fillCustomerByCongTy(khach.Ten_cong_ty)" @blur="onBlurCongTy" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
                <datalist id="dl-cty-modal"><option v-for="k in [...new Set(customers.filter(c => c.Ten_cong_ty).map(c => c.Ten_cong_ty))]" :key="k" :value="k" /></datalist>
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">MST</label>
                <input v-model="khach.MST" list="dl-mst-modal-3" @change="onMSTChange" placeholder="Mã số thuế" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
                <datalist id="dl-mst-modal-3"><option v-for="k in customers" :key="'mst_3_'+k.Ma_khach_hang" :value="k.MST" /></datalist>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">SĐT công ty</label>
                <input v-model="khach.So_dien_thoai_cong_ty" placeholder="SĐT" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Email</label>
                <input v-model="khach.Email_cong_ty" placeholder="Email CT" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Địa chỉ</label>
                <input v-model="khach.Dia_chi_cong_ty" placeholder="Địa chỉ" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Website</label>
                <input v-model="khach.Website_cong_ty" placeholder="Website" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">COMPANY</label>
                <input v-model="khach.COMPANY" placeholder="COMPANY" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">TEL</label>
                <input v-model="khach.TEL" placeholder="TEL" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Fax</label>
                <input v-model="khach.So_fax_cong_ty" placeholder="Fax" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 3px;">
              <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">ADDRESS</label>
              <input v-model="khach.ADDRESS" placeholder="ADDRESS" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
            </div>
          </div>
          </div>
          <!-- KH PHỤ — full width -->
          <div style="margin-top: 16px; background: rgba(148,163,184,0.04); border: 1px solid rgba(148,163,184,0.1); border-radius: 10px; padding: 14px 16px;">
            <div style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: #ffffff; letter-spacing: 1px; margin-bottom: 10px;">KHÁCH HÀNG PHỤ</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Tên</label>
                <input v-model="khach.Ten_khach_hang_phu" placeholder="Tên KH phụ" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">SĐT</label>
                <input v-model="khach.So_dien_thoai_ca_nhan_phu" placeholder="SĐT phụ" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <label style="font-size: 10px; text-transform: uppercase; color: #ffffff; font-weight: 600;">Email</label>
                <input v-model="khach.Email_ca_nhan_phu" placeholder="Email phụ" style="padding: 9px 12px; border-radius: 8px; font-size: 13px;" />
              </div>
            </div>
          </div>
        </div>
        <!-- ACTIONS -->
        <div style="padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.06); display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <button @click="() => { showSaveModal = false; saveContractTemp(); }" style="padding: 12px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; color: #fff; background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; cursor: pointer; transition: all 0.25s; letter-spacing: 0.3px; box-shadow: 0 2px 8px rgba(59,130,246,0.25);" onmouseover="this.style.boxShadow='0 4px 16px rgba(59,130,246,0.4)'; this.style.transform='translateY(-1px)'" onmouseout="this.style.boxShadow='0 2px 8px rgba(59,130,246,0.25)'; this.style.transform='translateY(0)'">Lưu tạm & chờ duyệt</button>
          <button @click="() => { showSaveModal = false; saveContractOfficialAndSaleReport(); }" style="padding: 12px 20px; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; color: #fff; background: linear-gradient(135deg, #ef4444, #dc2626); border: none; cursor: pointer; transition: all 0.25s; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(239,68,68,0.25);" onmouseover="this.style.boxShadow='0 4px 16px rgba(239,68,68,0.4)'; this.style.transform='translateY(-1px)'" onmouseout="this.style.boxShadow='0 2px 8px rgba(239,68,68,0.25)'; this.style.transform='translateY(0)'">CHỐT DEAL & CẬP NHẬT SALE REPORT</button>
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
            <input
              v-model="khach.Ten_cong_ty"
              list="dl-cty-export"
              placeholder="Chọn / nhập tên công ty"
              @change="fillCustomerByCongTy(khach.Ten_cong_ty)"
              @blur="onBlurCongTy"
            />
            <datalist id="dl-cty-export">
              <option v-for="k in [...new Set(customers.filter(c => c.Ten_cong_ty).map(c => c.Ten_cong_ty))]" :key="k" :value="k" />
            </datalist>
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

    <!-- ================== MODAL: ĐIỀU CHỈNH GIÁ LIC (VIP) ================== -->
    <div v-if="adjustPriceModal.show" class="modal" @click.self="adjustPriceModal.show = false">
      <div class="modal-card" style="width: 460px; padding: 0; background: #0f172a; border: 1px solid rgba(16,185,129,0.25); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(16,185,129,0.1); border-radius: 20px; overflow: hidden; animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
        
        <!-- Header -->
        <div class="modal-head" style="background: linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(15,23,42,0.95) 100%); padding: 20px 24px; border-bottom: 1px solid rgba(16,185,129,0.15); display: flex; justify-content: space-between; align-items: center;">
          <h3 style="color: #fff; font-size: 17px; font-weight: 700; display: flex; align-items: center; gap: 12px; margin: 0; letter-spacing: 0.3px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(16,185,129,0.4);">
              <i class="ri-arrow-up-down-fill" style="color: #fff; font-size: 18px;"></i>
            </div>
            Điều Chỉnh Giá
          </h3>
          <button class="x" @click="adjustPriceModal.show = false" style="background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 16px;">✕</button>
        </div>
        
        <div style="padding: 24px;">
          <!-- Target Info Card -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; margin-bottom: 24px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #10b981, transparent); opacity: 0.5;"></div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Phạm vi áp dụng</span>
              <span style="color: #e2e8f0; font-weight: 700; font-size: 14px; text-align: right; max-width: 60%; line-height: 1.4;">{{ adjustPriceModal.targetName || (adjustPriceModal.mode === 'all' ? 'Toàn bộ báo giá' : '') }}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Giá trị gốc</span>
              <span style="color: #10b981; font-weight: 800; font-size: 20px; text-shadow: 0 0 15px rgba(16,185,129,0.25);">{{ formatVND(adjustPriceModal.currentTotal) }} <span style="font-size: 16px;">₫</span></span>
            </div>
          </div>
          
          <!-- Segmented Control -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 24px; background: rgba(0,0,0,0.4); padding: 4px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); position: relative;">
            <button 
              :style="{ 
                borderRadius: '10px', padding: '10px', fontWeight: '700', fontSize: '13px', textAlign: 'center', transition: 'all 0.3s ease', border: 'none', 
                background: adjustPriceModal.adjustType === 'percent' ? 'rgba(16,185,129,0.15)' : 'transparent', 
                color: adjustPriceModal.adjustType === 'percent' ? '#10b981' : '#64748b', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                boxShadow: adjustPriceModal.adjustType === 'percent' ? '0 2px 10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(16,185,129,0.2)' : 'none'
              }" 
              @click="adjustPriceModal.adjustType = 'percent'"
            >
              <i class="ri-percent-line" style="font-size: 16px;"></i> Tăng/Giảm theo %
            </button>
            <button 
              :style="{ 
                borderRadius: '10px', padding: '10px', fontWeight: '700', fontSize: '13px', textAlign: 'center', transition: 'all 0.3s ease', border: 'none', 
                background: adjustPriceModal.adjustType === 'number' ? 'rgba(16,185,129,0.15)' : 'transparent', 
                color: adjustPriceModal.adjustType === 'number' ? '#10b981' : '#64748b', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                boxShadow: adjustPriceModal.adjustType === 'number' ? '0 2px 10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(16,185,129,0.2)' : 'none'
              }" 
              @click="adjustPriceModal.adjustType = 'number'"
            >
              <i class="ri-money-dollar-circle-line" style="font-size: 16px;"></i> Nhập giá trị
            </button>
          </div>
          
          <!-- Input Area -->
          <div style="margin-bottom: 32px;">
            <div v-if="adjustPriceModal.adjustType === 'percent'" style="animation: fadeIn 0.3s ease;">
              <label style="display: block; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">Mức Điều Chỉnh (VD: 10 Tăng, -5 Giảm)</label>
              <div style="position: relative;">
                <FormattedInput v-model="adjustPriceModal.percentValue" placeholder="0" style="width: 100%; padding: 14px 16px; padding-right: 48px; border-radius: 12px; background: rgba(15,23,42,0.8); border: 2px solid rgba(16,185,129,0.2); color: #fff; font-size: 18px; font-weight: 800; outline: none; transition: all 0.3s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);" />
                <div style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 28px; height: 28px; background: rgba(16,185,129,0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #10b981; font-weight: 800; font-size: 14px; pointer-events: none;">%</div>
              </div>
              <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: linear-gradient(90deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.02) 100%); border-radius: 10px; border-left: 3px solid #10b981;">
                <span style="color: #cbd5e1; font-size: 13px; font-weight: 600;">Dự kiến mới:</span>
                <span style="color: #10b981; font-weight: 800; font-size: 16px; letter-spacing: 0.5px;">{{ formatVND(adjustPriceModal.currentTotal * (1 + (adjustPriceModal.percentValue || 0) / 100)) }} ₫</span>
              </div>
            </div>
            
            <div v-else style="animation: fadeIn 0.3s ease;">
              <label style="display: block; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">Nhập Giá Trị Mong Muốn</label>
              <div style="position: relative;">
                <FormattedInput v-model="adjustPriceModal.numberValue" placeholder="Nhập số tiền..." style="width: 100%; padding: 14px 16px; padding-right: 48px; border-radius: 12px; background: rgba(15,23,42,0.8); border: 2px solid rgba(16,185,129,0.2); color: #fff; font-size: 18px; font-weight: 800; outline: none; transition: all 0.3s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);" />
                <div style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 28px; height: 28px; background: rgba(16,185,129,0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #10b981; font-weight: 800; font-size: 14px; pointer-events: none;">₫</div>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <button @click.prevent="adjustPriceModal.show = false" style="padding: 14px; border-radius: 12px; font-weight: 700; font-size: 14px; background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s;">Hủy Bỏ</button>
            <button @click.prevent="applyAdjustPrice()" style="padding: 14px; border-radius: 12px; font-weight: 700; font-size: 15px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(16,185,129,0.3); transition: all 0.2s; display: flex; justify-content: center; align-items: center; gap: 8px;">
              <i class="lucide-check"></i> Xác Nhận
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================== MODAL: LỊCH SỬ THAY ĐỔI ================== -->
    <div v-if="showHistoryModal" class="modal" @click.self="showHistoryModal = false">
      <div class="modal-card history-modal-card">
        <!-- Header -->
        <div class="history-modal-header">
          <div class="history-modal-header-left">
            <div class="history-modal-icon-wrap">
              <i class="lucide-clock" style="font-size: 20px;"></i>
            </div>
            <div>
              <h3 class="history-modal-title">Lịch sử thay đổi</h3>
              <p class="history-modal-subtitle">{{ historyTitle }}</p>
            </div>
          </div>
          <button class="x" @click="showHistoryModal = false">✕</button>
        </div>

        <!-- Summary Stats -->
        <div v-if="currentHistory.length" class="history-summary">
          <div class="history-stat">
            <span class="history-stat-label">Tổng thay đổi</span>
            <span class="history-stat-value">{{ currentHistory.length }} lần</span>
          </div>
          <div class="history-stat">
            <span class="history-stat-label">Giá trị hiện tại</span>
            <span class="history-stat-value" style="color: #2563eb; font-size: 15px;">{{ formatVND(currentHistory[0]?.newVal ?? 0) }}</span>
          </div>
          <div class="history-stat">
            <span class="history-stat-label">Giá trị ban đầu</span>
            <span class="history-stat-value" style="color: #ffffff;">{{ formatVND(currentHistory[currentHistory.length - 1]?.oldVal ?? 0) }}</span>
          </div>
        </div>

        <!-- Table -->
        <div class="history-table-wrap">
          <table v-if="currentHistory.length" class="history-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th style="width: 110px; text-align: center;">Thời gian</th>
                <th style="text-align: left;">Nội dung thay đổi</th>
                <th style="text-align: right;">Giá trị cũ</th>
                <th style="width: 40px; text-align: center;"></th>
                <th style="text-align: right;">Giá trị mới</th>
                <th style="text-align: right;">Chênh lệch</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(h, i) in currentHistory" :key="i" class="history-row">
                <td style="text-align: center; color: #94a3b8; font-size: 12px; font-weight: 600;">{{ i + 1 }}</td>
                <td style="text-align: center;">
                  <span class="history-time-badge">{{ h.time }}</span>
                </td>
                <td style="text-align: left; font-size: 13px; color: #ffffff; line-height: 1.4;">
                  <template v-if="isGlobalHistory && h.reason">
                    {{ h.reason }}
                  </template>
                  <template v-else>
                    <b>{{ h.metric || historyTitle }}</b> thay đổi từ <span style="color: #ef4444; font-weight: 500;">{{ formatVND(h.oldVal) }}</span> → <b>{{ formatVND(h.newVal) }}</b>
                  </template>
                </td>
                <td style="text-align: right;">
                  <span class="history-old-val">{{ formatVND(h.oldVal) }}</span>
                </td>
                <td style="text-align: center;">
                  <span
                    class="history-arrow"
                    :class="h.newVal > h.oldVal ? 'arrow-up' : h.newVal < h.oldVal ? 'arrow-down' : 'arrow-same'"
                  >
                    {{ h.newVal > h.oldVal ? '▲' : h.newVal < h.oldVal ? '▼' : '━' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <span
                    class="history-new-val"
                    :class="h.newVal > h.oldVal ? 'val-up' : h.newVal < h.oldVal ? 'val-down' : ''"
                  >{{ formatVND(h.newVal) }}</span>
                </td>
                <td style="text-align: right;">
                  <span
                    class="history-diff"
                    :class="h.newVal - h.oldVal > 0 ? 'diff-up' : h.newVal - h.oldVal < 0 ? 'diff-down' : ''"
                  >
                    {{ h.newVal - h.oldVal > 0 ? '+' : '' }}{{ formatVND(h.newVal - h.oldVal) }}
                    <span style="font-size: 11px; opacity: 0.85; margin-left: 3px; font-weight: 600;">
                      ({{ h.oldVal ? ((h.newVal - h.oldVal) / h.oldVal * 100).toFixed(1) : 100 }}%)
                    </span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <div v-else class="history-empty">
            <div class="history-empty-icon">📋</div>
            <p class="history-empty-title">Chưa có thay đổi</p>
            <p class="history-empty-desc">Khi giá trị thay đổi, lịch sử sẽ được ghi nhận tại đây.</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="history-modal-footer">
          <button class="ghost" @click="showHistoryModal = false">Đóng</button>
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
  <!-- SELECT CUSTOMER MODAL FOR PIPELINE -->
  <div v-if="showSelectCustomerModal" class="modal" @click.self="showSelectCustomerModal = false">
    <div class="modal-card" style="max-width: 550px;">
      <div class="modal-head">
        <h3><i class="lucide-users"></i> Chọn khách hàng cho Pipeline</h3>
        <button class="x" @click="showSelectCustomerModal = false">✕</button>
      </div>
      <div class="modal-body" style="padding-top: 10px;">
        <label style="font-size: 0.85rem; font-weight: 600; color: #475569; display: block; margin-bottom: 8px;">Khách hàng hiện tại hoặc tìm kiếm:</label>
        <div style="position: relative;">
          <i class="lucide-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 16px;"></i>
          <input 
            type="text" 
            v-model="pipelineSearchStr"
            placeholder="Nhập mã hoặc tên khách hàng..." 
            style="width: 100%; padding: 12px 12px 12px 36px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;"
          />
        </div>
        
        <div style="margin-top: 16px; height: 260px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc;">
          <template v-if="filteredPipelineCustomers.length > 0">
            <div 
              v-for="c in filteredPipelineCustomers" 
              :key="c.Ma_khach_hang"
              @click="triggerToast(`Đã chọn: ${c.Ten_khach_hang}`); selectedPipelineKhach = c"
              style="padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 4px; transition: background 0.15s;"
              :style="{ background: selectedPipelineKhach?.Ma_khach_hang === c.Ma_khach_hang ? '#e0e7ff' : (filteredPipelineCustomers.length === 1 && pipelineSearchStr && !selectedPipelineKhach ? '#f1f5f9' : 'transparent') }"
            >
              <div style="font-weight: 600; color: #0f172a; font-size: 0.9rem;">{{ c.Ten_khach_hang }}</div>
              <div style="font-size: 0.75rem; color: #64748b;">Mã: {{ c.Ma_khach_hang }} • MST: {{ c.MST || '---' }}</div>
            </div>
          </template>
          <div v-else style="padding: 20px; text-align: center; color: #64748b; font-size: 0.85rem;">
            Không tìm thấy khách hàng nào.
          </div>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button 
            class="ghost" 
            style="flex: 1; padding: 12px; font-size: 1rem; border-radius: 8px;"
            @click="handleAddNewPipelineCustomer"
          >
            <i class="lucide-user-plus" style="margin-right: 6px;"></i>
            Thêm mới KH
          </button>
          <button 
            class="primary" 
            style="flex: 1; padding: 12px; font-size: 1rem; border-radius: 8px;"
            @click="handleContinuePipeline"
          >
            Tiếp tục
            <i class="lucide-arrow-right" style="margin-left: 6px;"></i>
          </button>
        </div>
      </div>
    </div>
  </div>



  <PipelinePreviewModal 
    v-if="showPipelineModal" 
    @close="showPipelineModal = false"
    @saved="onPipelineSaved"
    :khach="selectedPipelineKhach || khach"
    :customers="customers"
    :soHopDong="soHopDong"
    :maHopDong="maHopDong"
    :maHopDongCu="loadedMaHopDong || ''"
    :maHopDongGoc="loadedMaHopDongGoc || ''"
    :selectedItems="selectedItems"
    :ghiChuHopDong="ghiChuHopDong"
    :exchangeRate="pipelineExchangeRate"
    :loadedData="loadedPipelineExtraData"
    :excelBlob="pipelineExcelBlob"
    :quoteTotals="totals"
    :quoteTongGiaThucTe="tongGiaThucTe"
    :quoteFinancials="{
      chietKhauTruocThue: chietKhauTruocThue,
      chietKhauTruocThuePct: chietKhauTruocThuePct,
      thueChenhLech: thueChenhLech,
      thueChenhLechPct: thueChenhLechPct,
      chenhLechGia: chenhLechGia,
      conLai: conLai,
      tongChietKhau: tongChietKhau
    }"
  />

  <Transition name="toast-slide">
    <div v-if="showToast" class="success-toast">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>{{ toastMsg }}</span>
    </div>
  </Transition>

  <!-- ASYNC RESULT MODAL -->
  <Transition name="async-modal">
    <div v-if="asyncResultModal.show" class="async-overlay" @click.self="asyncResultModal.type !== 'loading' && (asyncResultModal.show = false)">
      <div class="async-card" :class="'async-' + asyncResultModal.type">
        <!-- LOADING -->
        <template v-if="asyncResultModal.type === 'loading'">
          <div class="async-spinner-wrap">
            <svg class="async-spinner" viewBox="0 0 50 50">
              <defs>
                <linearGradient id="async-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#38bdf8"/>
                  <stop offset="50%" stop-color="#a78bfa"/>
                  <stop offset="100%" stop-color="#38bdf8"/>
                </linearGradient>
              </defs>
              <circle cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" stroke="url(#async-gradient)"/>
            </svg>
          </div>
          <div class="async-title">{{ asyncResultModal.title }}</div>
          <div class="async-subtitle">Vui lòng đợi trong giây lát...</div>
        </template>
        <!-- SUCCESS -->
        <template v-else-if="asyncResultModal.type === 'success'">
          <div class="async-icon-wrap async-icon-success">
            <svg viewBox="0 0 52 52" class="async-checkmark">
              <circle cx="26" cy="26" r="25" fill="none"/>
              <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <div class="async-title">{{ asyncResultModal.title }}</div>
          <div v-if="asyncResultModal.msg" class="async-subtitle">{{ asyncResultModal.msg }}</div>
        </template>
        <!-- ERROR -->
        <template v-else>
          <div class="async-icon-wrap async-icon-error">
            <svg viewBox="0 0 52 52" class="async-xmark">
              <circle cx="26" cy="26" r="25" fill="none"/>
              <path fill="none" d="M16 16 36 36 M36 16 16 36"/>
            </svg>
          </div>
          <div class="async-title">{{ asyncResultModal.title }}</div>
          <div v-if="asyncResultModal.msg" class="async-subtitle">{{ asyncResultModal.msg }}</div>
          <button class="async-close-btn" @click="asyncResultModal.show = false">Đóng</button>
        </template>
      </div>
    </div>
  </Transition>

  <datalist id="category-list">
    <option v-for="cat in existingCategories" :key="cat" :value="cat"></option>
  </datalist>
</template>

<style scoped>
.metallic-border-btn {
  border-radius: 50% !important;
  width: 76px !important;
  height: 76px !important;
  color: #ffffff;
  border: none !important;
  box-shadow: 0 4px 16px -2px rgba(22, 163, 74, 0.4), 0 0 20px rgba(22, 163, 74, 0.1);
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 !important;
  user-select: none;
  transition: box-shadow 0.25s, transform 0.25s;
  position: relative;
  overflow: hidden;
  background: transparent !important;
}

.metallic-border-btn:hover {
  box-shadow: 0 8px 24px -2px rgba(22, 163, 74, 0.5), 0 0 30px rgba(22, 163, 74, 0.15);
}

.metallic-border-btn::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    #ffffff 0%,
    #ffffff 75%,
    #fef08a 85%,
    #eab308 90%,
    #fef08a 95%,
    #ffffff 100%
  );
  animation: rotate-metallic 2.5s linear infinite;
  z-index: -2;
}

.metallic-border-btn::after {
  content: '';
  position: absolute;
  inset: 1.5px;
  background: #16a34a;
  border-radius: 50%;
  z-index: -1;
}

@keyframes rotate-metallic {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ===== INPUT INLINE 3-STATE: loading → loaded → ready ===== */
.input-loading,
.input-loaded,
.input-ready {
  position: relative;
}
.input-loading > input,
.input-loading > .cell-input,
.input-loaded > input,
.input-loaded > .cell-input,
.input-ready > input,
.input-ready > .cell-input {
  padding-right: 36px !important;
}

/* — SHARED ICON POSITION (inside the input, right-center) — */
.input-loading::after,
.input-loaded::after,
.input-ready::after {
  content: '';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  z-index: 5;
  pointer-events: none;
}

/* — STATE 1: LOADING SPINNER — */
.input-loading::after {
  border: 2.5px solid rgba(56,189,248,0.15);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: input-spin 0.7s linear infinite;
  filter: drop-shadow(0 0 4px rgba(56,189,248,0.3));
  /* override transform since we need both rotate + translateY */
  animation: input-spin-centered 0.7s linear infinite;
}
@keyframes input-spin-centered {
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
}
.input-loading > input,
.input-loading > .cell-input {
  border-color: rgba(56,189,248,0.25) !important;
  animation: input-pulse-border 1.5s ease-in-out infinite;
}
@keyframes input-spin {
  to { transform: rotate(360deg); }
}
@keyframes input-pulse-border {
  0%, 100% { border-color: rgba(56,189,248,0.15); }
  50% { border-color: rgba(56,189,248,0.4); }
}

/* — STATE 2: LOADED CHECKMARK — */
.input-loaded::after {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  animation: input-check-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  filter: drop-shadow(0 0 6px rgba(16,185,129,0.5));
}
.input-loaded > input,
.input-loaded > .cell-input {
  border-color: rgba(16,185,129,0.4) !important;
  transition: border-color 0.3s;
}
@keyframes input-check-pop {
  0% { transform: translateY(-50%) scale(0) rotate(-20deg); opacity: 0; }
  60% { transform: translateY(-50%) scale(1.3) rotate(5deg); opacity: 1; }
  100% { transform: translateY(-50%) scale(1) rotate(0deg); opacity: 1; }
}

/* — STATE 3: READY DROPDOWN ARROW — */
.input-ready::after {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  animation: input-arrow-fade 0.4s ease-out;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.input-ready:hover::after {
  opacity: 1;
  filter: drop-shadow(0 0 4px rgba(148,163,184,0.3));
}
.input-ready > input,
.input-ready > .cell-input {
  border-color: rgba(30,58,47,1) !important;
  transition: border-color 0.3s;
}
@keyframes input-arrow-fade {
  0% { opacity: 0; transform: translateY(-50%) translateY(-4px); }
  100% { opacity: 0.7; transform: translateY(-50%); }
}

/* ===== TOAST ===== */
.success-toast {
  position: fixed;
  top: 30px;
  right: 30px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  color: #fff;
  padding: 14px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 99999;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

/* ===== RESET & SCROLLBAR ===== */
*, *::before, *::after { box-sizing: border-box; }
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #64748b; }

/* ===== PAGE ===== */
.page {
  font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif;
  padding: 12px;
  background:
    radial-gradient(ellipse 80% 50% at 10% 0%, rgba(14,165,233,0.12) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 90% 100%, rgba(16,185,129,0.08) 0%, transparent 50%),
    #09090b;
  min-height: 100vh;
  color: #f8fafc;
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

/* ===== VIP SIDEBAR ===== */
.sidebar {
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.85) 100%);
  border-radius: 20px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-right: 1px solid rgba(56, 189, 248, 0.2);
  border-left: 1px solid rgba(56, 189, 248, 0.2);
  box-shadow:
    0 20px 40px -10px rgba(0,0,0,0.8),
    inset 0 0 30px rgba(56, 189, 248, 0.05);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  position: sticky;
  top: 12px;
  height: calc(100vh - 24px);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 380px;
  min-width: 380px;
  overflow: hidden;
}
.sidebar-left { transition: margin-left .25s ease, opacity .25s ease; }
.sidebar-right { transition: margin-right .25s ease, opacity .25s ease; overflow-y: auto; }
.sidebar-left.closed { margin-left: -400px; opacity: 0; pointer-events: none; }
.sidebar-right.closed { margin-right: -400px; opacity: 0; pointer-events: none; }

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
  font-weight: 700;
  background: linear-gradient(135deg, #f8fafc, #38bdf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.table-header-box h3 {
  background: transparent !important;
  -webkit-background-clip: border-box !important;
  -webkit-text-fill-color: #16a34a !important;
  color: #16a34a !important; /* Xanh lá cây đậm */
  text-transform: uppercase !important;
  font-weight: 800 !important;
  letter-spacing: 0.05em;
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
.icon-btn:hover { background: rgba(255,255,255,0.1); color: #f8fafc; }

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
  background: linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95));
  margin: -16px -16px 14px;
  padding: 14px 16px;
  border-radius: 20px 20px 0 0;
  border-bottom: 1px solid rgba(56,189,248,0.1);
  position: relative;
}
.sidebar-head-contract::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent);
}
.sidebar-head-contract h3 {
  color: #f1f5f9 !important;
  font-size: 14px !important;
  background: linear-gradient(135deg, #f8fafc, #38bdf8) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
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
  color: #94a3b8;
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
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
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
  border: 1px solid #334155;
  background: #18181b;
  color: #94a3b8;
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
  background: #27272a;
  border-color: #475569;
  color: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
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
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25), 0 0 0 1px rgba(59,130,246,0.1);
}
.action-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35), 0 0 20px rgba(59,130,246,0.1) !important;
  transform: translateY(-2px) !important;
}
.action-success {
  background: linear-gradient(135deg, #22c55e, #16a34a) !important;
  color: white !important;
  border-color: transparent !important;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25), 0 0 0 1px rgba(34,197,94,0.1);
}
.action-success:hover {
  background: linear-gradient(135deg, #16a34a, #15803d) !important;
  box-shadow: 0 8px 20px rgba(22, 163, 74, 0.35), 0 0 20px rgba(34,197,94,0.1) !important;
  transform: translateY(-2px) !important;
}
.action-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  color: white !important;
  border-color: transparent !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(239,68,68,0.1);
}
.action-danger:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.35), 0 0 20px rgba(239,68,68,0.1) !important;
  transform: translateY(-2px) !important;
}
.action-save {
  grid-column: 1 / -1;
  flex-direction: row !important;
  padding: 10px 16px !important;
  background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
  color: white !important;
  border-color: transparent !important;
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.25), 0 0 0 1px rgba(124,58,237,0.1);
}
.action-save:hover {
  background: linear-gradient(135deg, #6d28d9, #5b21b6) !important;
  box-shadow: 0 8px 20px rgba(109, 40, 217, 0.35), 0 0 20px rgba(124,58,237,0.1) !important;
  transform: translateY(-2px) !important;
}
.action-pipeline {
  grid-column: 1 / -1;
  flex-direction: row !important;
  padding: 10px 16px !important;
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  color: white !important;
  border-color: rgba(255,255,255,0.08) !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.action-pipeline:hover {
  background: linear-gradient(135deg, #60a5fa, #3b82f6) !important;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4), 0 0 12px rgba(59, 130, 246, 0.1) !important;
  border-color: rgba(59, 130, 246, 0.15) !important;
  transform: translateY(-2px) !important;
}
.save-msg {
  font-size: 11.5px;
  color: #94a3b8;
  margin: 6px 0 0;
  padding: 6px 10px;
  background: rgba(15,23,42,.5);
  border-radius: 8px;
  border: 1px solid #1e293b;
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
  background: #18181b;
  color: #94a3b8;
  border: 1px solid #334155;
  border-radius: 8px !important;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
}
.util-btn [class^="lucide-"] {
  font-size: 14px;
  color: #64748b;
  margin-right: 0;
}
.util-btn:hover {
  background: #27272a;
  border-color: #475569;
  color: #f8fafc;
}
.util-btn:hover [class^="lucide-"] {
  color: #38bdf8;
}

.inline-adjust {
  background-color: #ef4444 !important;
  color: #ffffff !important;
  border-color: #ef4444 !important;
  font-weight: 700 !important;
  width: max-content !important;
}
.inline-adjust [class^="lucide-"] {
  color: #ffffff !important;
}
.inline-adjust:hover {
  background-color: #dc2626 !important;
  border-color: #dc2626 !important;
  color: #ffffff !important;
}
.inline-adjust:hover [class^="lucide-"] {
  color: #ffffff !important;
}


/* ===== MODAL GROUPS ===== */
.modal-group {
  background: rgba(15,23,42,.5);
  border: 1px solid #1e293b;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}
.modal-group-title {
  font-size: 12px;
  font-weight: 700;
  color: #e2e8f0;
  margin-top: 0;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid #1e293b;
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
  border: 1px solid rgba(255,255,255,0.08);
  background: linear-gradient(135deg, rgba(79,70,229,0.9) 0%, rgba(59,130,246,0.9) 100%);
  color: #fff;
  cursor: pointer;
  font-weight: 600; font-size: 12px;
  box-shadow: 0 4px 16px -2px rgba(79, 70, 229, 0.4), 0 0 20px rgba(79,70,229,0.1);
  width: auto;
  backdrop-filter: blur(8px);
}
.open-tab:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -2px rgba(79, 70, 229, 0.5), 0 0 30px rgba(79,70,229,0.15); }
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
  color: #94a3b8;
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
  border: 1px solid #334155;
  background-color: #0f172a;
  color: #f8fafc;
  box-sizing: border-box;
  transition: all .2s;
}
input:focus, textarea:focus, select:focus {
  border-color: #38bdf8;
  background-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(56,189,248,.15);
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
  background-color: #18181b;
  cursor: pointer;
  color: #e2e8f0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  line-height: 1.4;
}
button:hover { background-color: #27272a; color: #f8fafc; }
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
  color: #94a3b8;
  border: 1px solid #334155;
}
button.ghost:hover { background-color: rgba(255,255,255,0.05); color: #f8fafc; }

hr { border: none; border-top: 1px solid #1e293b; margin: 12px 0; }

/* ===== TOP BAR ===== */
.top-bar {
  display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; flex-shrink: 0;
}
.sidebar-head-product {
  background: transparent;
  margin: -16px -16px 16px;
  padding: 16px 20px;
  border-radius: 20px 20px 0 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}
.sidebar-head-product::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56,189,248,0.5), transparent);
}
.sidebar-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sidebar-head-product h3 {
  font-size: 15px !important;
  font-weight: 800 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #fff !important;
  background: linear-gradient(135deg, #fff, #7dd3fc) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  margin: 0;
}
.sidebar-head-product .icon-btn {
  color: #64748b;
  border-radius: 50%;
  background: rgba(15,23,42,0.4);
  border: 1px solid rgba(255,255,255,0.05);
}
.sidebar-head-product .icon-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  transform: rotate(90deg);
}
.product-count {
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(14, 165, 233, 0.3);
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.1);
  font-size: 10.5px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}
.btn-manual-circle {
  width: 30px !important;
  height: 30px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  color: #ffffff !important;
  font-size: 24px !important;
  font-weight: 800 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: none !important;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
  transition: all 0.25s !important;
  padding: 0 !important;
  margin: 0 0 0 4px !important;
  line-height: 1 !important;
}
.btn-manual-circle:hover {
  transform: scale(1.15) rotate(90deg) !important;
  background: linear-gradient(135deg, #60a5fa, #3b82f6) !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6) !important;
}
.search-wrap {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  stroke: #ffffff !important;
  stroke-width: 3px !important;
  fill: none !important;
  pointer-events: none;
  z-index: 10;
}
.search-input {
  padding-left: 40px !important;
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid #065f46 !important;
  border-radius: 30px !important;
  color: #f8fafc !important;
  font-size: 13.5px !important;
  font-weight: 700 !important;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
.search-input::placeholder {
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: 700 !important;
}
.search-input:focus {
  background: rgba(15, 23, 42, 0.8) !important;
  border-color: #10b981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
}
.filter-select {
  font-size: 12.5px;
  color: #94a3b8 !important;
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 10px !important;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
.filter-select:focus {
  background: rgba(15, 23, 42, 0.8) !important;
  border-color: rgba(56, 189, 248, 0.5) !important;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15) !important;
}

/* ===== PRODUCT GRID ===== */
.product-grid {
  display: flex; flex-direction: column; gap: 12px;
  overflow-y: auto; flex: 1; 
  margin: -10px -8px -10px -10px;
  padding: 10px 12px 20px 10px;
}
.product-grid::-webkit-scrollbar { width: 4px; }
.product-grid::-webkit-scrollbar-track { background: transparent; }
.product-grid::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.15); border-radius: 4px; }
.product-grid::-webkit-scrollbar-thumb:hover { background: rgba(56,189,248,0.3); }

/* ===== SKELETON LOADING CARDS ===== */
.skeleton-card {
  background: rgba(15,23,42,0.6);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 14px;
  padding: 16px;
  animation: skeleton-fade-in 0.3s ease-out;
}
.skeleton-badges {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}
.skeleton-line {
  background: linear-gradient(90deg,
    rgba(255,255,255,0.04) 0%,
    rgba(255,255,255,0.08) 40%,
    rgba(255,255,255,0.04) 80%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}
.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.04);
}
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes skeleton-fade-in {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* ═══════════════════════════════════════════════════
   PREMIUM HORIZONTAL CARD — VIP Design System
   ═══════════════════════════════════════════════════ */

.card {
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-top: 3px solid #10b981;
  border-radius: 16px;
  background: linear-gradient(160deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.95) 100%);
  cursor: pointer;
  display: flex; flex-direction: column;
  padding: 14px 16px 12px 14px;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(16, 185, 129, 0.15);
  overflow: hidden;
  position: relative;
  gap: 10px;
  flex-shrink: 0;
}
.card::before { display: none; }
.card::after { display: none; }
.card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  border-top-color: #34d399;
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.35),
    0 0 25px rgba(16, 185, 129, 0.25),
    inset 0 1px 0 rgba(16, 185, 129, 0.3);
  transform: translateY(-4px) scale(1.01);
  background: linear-gradient(160deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,1) 100%);
}

/* ── Left: Image (full bleed with rounded left side) ── */
.card-left {
  width: 42%; min-width: 42%;
  display: flex; align-items: stretch;
  padding: 0;
  flex-shrink: 0;
}
.card-img-wrap {
  position: relative;
  width: 100%; height: 100%;
  border-radius: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #1a2332, #111827);
  padding: 0; flex-shrink: 0;
  box-shadow: none;
}
.card-img-overlay { display: none; }
.card-img-wrap img {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 0;
  display: block;
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1), filter 0.35s ease;
  filter: brightness(0.95);
  min-height: 100%;
}
.card:hover .card-img-wrap img {
  transform: scale(1.06);
  filter: brightness(1.05);
}

/* ── Badges row ── */
.card-badges {
  display: flex; align-items: center; gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 2px;
}
.card-ncc-badge {
  position: static;
  display: inline-block;
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  font-size: 7.5px; font-weight: 700;
  padding: 2px 7px; border-radius: 4px;
  letter-spacing: 0.4px; text-transform: uppercase;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  border: none; max-width: 100px;
}
.card-vat-badge-img {
  position: static;
  display: inline-block;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  font-size: 7.5px; font-weight: 800;
  padding: 2px 7px; border-radius: 4px;
  letter-spacing: 0.3px;
  box-shadow: none; text-transform: uppercase;
}

/* ── Right: Content ── */
.card-right {
  flex: 1; display: flex; flex-direction: column;
  min-width: 0; padding: 12px 14px 10px 12px;
  justify-content: space-between;
  position: relative;
}
.card-body {
  display: flex; flex-direction: column;
  gap: 2px; padding: 0;
}
.card h4 {
  margin: 0; font-size: 12.5px; font-weight: 700;
  color: #f8fafc; line-height: 1.4; letter-spacing: -0.01em;
}
.clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.clamp1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.card-license { font-size: 10px; color: #475569; margin: 0; font-style: normal; font-weight: 500; }
.card-desc { font-size: 10.5px; color: #94a3b8; margin: 0; line-height: 1.3; }
.card-price-row {
  display: flex; align-items: baseline;
  gap: 4px; margin-top: 5px; flex-wrap: wrap;
}
.price {
  font-weight: 800; font-size: 15px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin: 0; letter-spacing: -0.03em;
  color: #10b981;
  -webkit-text-fill-color: unset;
  background: none; -webkit-background-clip: unset; background-clip: unset;
}
.price-unit { font-size: 10px; color: #ffffff; font-weight: 500; }
.card-orig-price { font-size: 9.5px; color: #ffffff; margin: 1px 0 0; }
.card-vat-badge {
  display: inline-block; width: fit-content;
  background: rgba(16, 185, 129, 0.15); color: #34d399;
  font-size: 10px; font-weight: 700; padding: 2px 8px;
  border-radius: 6px; border: none; margin-top: 2px;
}
.muted { color: #64748b; font-size: 11.5px; margin: 0; }
.small { font-size: 11px; }

/* ── Footer: Qty + Add (stacked) ── */
.card-footer {
  display: flex; flex-direction: column;
  align-items: stretch; gap: 6px;
  padding: 8px 0 0;
  margin-top: 6px;
  border-top: 1px solid rgba(51, 65, 85, 0.3);
  position: relative; z-index: 1;
}
.qty {
  display: flex; align-items: center; gap: 8px;
  justify-content: center;
  border: none; overflow: visible;
  height: auto; background: transparent;
  box-shadow: none; border-radius: 0;
}
.qty button {
  width: 28px; height: 28px; padding: 0; margin: 0;
  border-radius: 50%;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.4);
  font-size: 14px; color: #94a3b8;
  min-width: 28px; box-shadow: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease; font-weight: 600; line-height: 1;
}
.qty button:hover {
  background: rgba(99, 102, 241, 0.2); color: #c7d2fe;
  border-color: rgba(99, 102, 241, 0.35);
  transform: scale(1.08);
}
.qty button:active {
  background: rgba(99, 102, 241, 0.3); transform: scale(0.94);
}
.qty button:last-child {
  background: #10b981;
  border-color: #10b981;
  color: #fff;
}
.qty button:last-child:hover {
  background: #059669;
  border-color: #059669;
  transform: scale(1.08);
}
.qty button:last-child:active {
  background: #047857;
  transform: scale(0.94);
}
.qty span {
  width: 24px; font-weight: 800; font-size: 14px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  text-align: center; border: none; background: transparent;
  display: flex; align-items: center; justify-content: center;
  color: #f1f5f9;
}
.btn-add {
  width: 100%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important; font-weight: 800;
  padding: 0 12px !important; font-size: 11px !important;
  border-radius: 8px !important; border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.2);
  letter-spacing: 0.5px; text-transform: uppercase;
  height: 30px; position: relative; overflow: hidden;
}
.btn-add::after { display: none; }
.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45), 0 0 20px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%) !important;
}
.btn-add:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.15);
}
.btn-add-icon { font-size: 12px; font-weight: 800; }

.btn-del {
  width: 28px; height: 28px; padding: 0;
  background: #ef4444; color: #ffffff;
  border: none; border-radius: 6px;
  transition: all .2s; min-width: 28px;
  box-shadow: none;
  font-weight: bold;
  font-size: 14px;
}
.btn-del:hover { background: #dc2626; color: #ffffff; transform: none; }

/* ===== TABLE WRAPPER ===== */
.quote-table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, rgba(0, 61, 77, 0.25) 0%, rgba(15, 23, 34, 0.75) 100%);
  border-radius: 20px;
  box-shadow:
    0 20px 40px -10px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 12px;
  min-height: 0;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all 0.35s ease;
  overflow: hidden;
}
.quote-table-container:hover {
  border-color: rgba(56, 189, 248, 0.12);
  box-shadow:
    0 20px 50px -10px rgba(0,0,0,0.7),
    0 0 30px rgba(56,189,248,0.04),
    inset 0 1px 0 rgba(255,255,255,0.06);
}
.quote-table-wrap {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  will-change: scroll-position;
}
.table-header-box {
  padding: 16px 20px 12px;
  background: rgba(9,9,11,0.92);
  backdrop-filter: blur(12px);
  z-index: 3;
  margin-bottom: 0;
  position: relative;
}
.table-header-box::after {
  content: '';
  position: absolute;
  bottom: 0; left: 20px; right: 20px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56,189,248,0.25), transparent);
}
.table-header-box h3 {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, #f8fafc, #38bdf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
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
  background: rgba(15,23,42,0.6);
  color: #94a3b8;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
  border: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(8px);
}
.contract-badge b {
  color: #10b981;
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
  border-bottom: 1px solid rgba(255,255,255,0.05);
  white-space: normal;
  word-break: break-word;
  line-height: 1.45;
}
td { color: #cbd5e1; }

/* Description column: allow wrap but clamp height */
td.desc {
  white-space: normal;
  overflow: hidden;
  color: #94a3b8;
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
  position: sticky; top: 0; z-index: 10;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  font-weight: 800;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #047857;
  z-index: 2;
  white-space: normal;
  line-height: 1.3;
  vertical-align: middle;
  padding: 10px;
}

tfoot td {
  position: sticky; bottom: 0;
  background-color: #fadb14;
  color: #000000;
  z-index: 5;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.15);
}

/* Zebra + Hover */
tbody tr.quote-item-row:nth-child(odd) { background: rgba(30, 41, 59, 0.5); }
tbody tr.quote-item-row:nth-child(even) { background: rgba(15, 23, 42, 0.3); }
tbody tr.quote-item-row { cursor: pointer; transition: background .1s; }
tbody tr.quote-item-row:hover td { background-color: rgba(56,189,248,0.1) !important; }

.right {
  text-align: right;
  font-size: 12px;
  font-weight: 700;
  color: #f8fafc;
}
.center {
  text-align: center;
  font-size: 12px;
}
.nowrap { white-space: normal; }
td.dvt { font-family: inherit; white-space: normal; }

/* ===== GROUP ROW ===== */
.group-row td {
  background: #172554;
  border-bottom: 1px solid rgba(56,189,248,0.3);
  font-weight: 800; color: #ffffff; font-size: 15px;
}
.group-stt { text-align: center; }
.group-title { padding-left: 12px; text-align: left; }

/* ===== COLUMN WIDTHS (table-layout: fixed) ===== */
.col-stt  { width: 36px; text-align: center; }
.col-pn   { width: 80px; }
.col-pn-cell {
  max-width: 80px;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.col-desc-cell {
  max-width: 220px;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.col-desc-cell .preline {
  display: inline;
  white-space: nowrap;
}
.col-desc-cell .preline div {
  display: inline;
}
.col-desc-cell .preline div::after {
  content: " - ";
}
.col-desc-cell .preline div:last-child::after {
  content: "";
}
.col-hang-cell {
  max-width: 70px;
  font-size: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}
.col-dvt-cell {
  max-width: 55px;
  font-size: 9px;
  text-align: center;
  word-break: break-word;
}
.col-name { width: 130px; }
.col-desc { width: 220px; } /* wider for description */
.col-hang { width: 70px; }
.col-sl   { width: 36px; text-align: center; }
.col-dvt  { width: 55px; }
.col-dg   { width: 100px; text-align: right; }
.col-tt   { width: 105px; text-align: right; }
.col-vat  { width: 85px; text-align: right; }
.col-loi  { width: 110px; text-align: right; color: #059669; }
.col-del  { width: 36px; text-align: center; }

/* Cell Input */
.quote-center {
  display: flex;
  flex-direction: column;
}
.quote-table-wrap {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.quote-table-wrap table {
  height: 100%;
}
.spacer-row {
  height: 100%;
}

.cell-input {
  width: 100%; padding: 5px 7px;
  border-radius: 6px; border: 1px solid #334155;
  font-size: 12px;
  margin: 0; box-sizing: border-box; background: #0f172a; color: #f8fafc;
}
.cell-input:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,.15); }

/* ===== TOTALS ===== */
.bottom-totals {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  flex-shrink: 0;
  padding: 0 4px;
}
.totals-box {
  background: linear-gradient(160deg, rgba(0, 61, 77, 0.35) 0%, rgba(15, 23, 34, 0.8) 100%);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 20px 40px -10px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.04);
  transition: all 0.35s ease;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.totals-box:hover {
  box-shadow:
    0 20px 50px -10px rgba(0,0,0,0.7),
    0 0 30px rgba(56,189,248,0.06),
    inset 0 1px 2px rgba(255,255,255,0.06);
  border-color: rgba(56, 189, 248, 0.15);
  transform: translateY(-2px);
}
.totals-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(51,65,85,0.5), rgba(30,41,59,0.7));
  color: #f1f5f9;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif;
  letter-spacing: 0.3px;
  border-bottom: 1px solid rgba(56,189,248,0.08);
  position: relative;
}
.totals-header::after {
  content: '';
  position: absolute;
  bottom: 0; left: 16px; right: 16px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56,189,248,0.25), transparent);
}
.totals-header-primary {
  background: linear-gradient(135deg, rgba(30,58,95,0.6), rgba(12,74,110,0.7));
}
.totals-header-primary::after {
  background: linear-gradient(90deg, transparent, rgba(56,189,248,0.35), transparent) !important;
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
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.totals-row:last-child {
  border-bottom: none;
}
.totals-row:hover {
  background: rgba(56,189,248,0.05);
}
.totals-label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: #ffffff;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
.totals-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 13px;
  color: #f8fafc;
  text-align: right;
  letter-spacing: 0.2px;
}
.totals-value small {
  font-weight: 400;
  font-size: 11px;
  color: #64748b;
  margin-left: 4px;
}
.totals-value.text-warn {
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(251,191,36,0.2);
}
/* Highlighted total rows */
.totals-highlight {
  background: rgba(245,158,11,0.1);
  border-bottom: none !important;
  margin-top: 2px;
  border-top: 1px dashed rgba(245,158,11,0.3);
}
.totals-highlight .totals-label {
  font-weight: 700;
  color: #fbbf24;
  font-size: 12.5px;
}
.totals-highlight .totals-value {
  font-weight: 700;
  color: #f59e0b;
  font-size: 14px;
}
.totals-highlight-blue {
  background: rgba(56,189,248,0.08);
  border-bottom: none !important;
  margin-top: 2px;
  border-top: 1px dashed rgba(56,189,248,0.3);
}
.totals-highlight-blue .totals-label {
  font-weight: 700;
  color: #38bdf8;
  font-size: 12.5px;
}
.totals-highlight-blue .totals-value {
  font-weight: 700;
  color: #38bdf8;
  font-size: 14px;
}
.totals-highlight-green {
  background: rgba(16,185,129,0.08);
  border-bottom: none !important;
}
.totals-highlight-green .totals-label {
  font-weight: 700;
  color: #34d399;
  font-size: 12.5px;
}
.totals-highlight-green .totals-value {
  font-weight: 700;
  color: #10b981;
  font-size: 14px;
}

/* ===== MODAL ===== */
.modal {
  position: fixed; inset: 0;
  background: rgba(2,6,23,.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 20px;
  animation: fadeIn .2s ease forwards;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.modal-card {
  background: #020617; color: #f8fafc;
  padding: 24px; width: 580px;
  max-height: 90vh; overflow: auto;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.06);
  border-top: 1px solid rgba(255,255,255,0.12);
  box-shadow:
    0 25px 60px rgba(0,0,0,.6),
    0 0 40px rgba(56,189,248,0.03),
    inset 0 1px 0 rgba(255,255,255,0.04);
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
  border-bottom: 1px solid #1e293b;
}
.modal-head h3 { margin: 0; font-size: 16px; font-weight: 700; color: #f8fafc; }
.modal-head .x {
  width: 32px; height: 32px;
  border-radius: 50%; background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1); font-size: 14px; padding: 0;
  color: #94a3b8;
}
.modal-head .x:hover { background: rgba(244,63,94,.15); color: #f8fafc; transform: rotate(90deg); border-color: rgba(244,63,94,.3); }

.preview {
  width: 100%; height: 200px; object-fit: contain;
  background: #0f172a; border-radius: 12px;
  border: 1px solid #1e293b; margin-bottom: 12px;
}

.modal-actions {
  display: flex; justify-content: flex-end; gap: 10px;
  margin-top: 20px; padding-top: 16px;
  border-top: 1px solid #1e293b;
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
  background: rgba(15,23,42,.5);
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 12px;
}

.term-preview label {
  font-weight: 600;
  color: #f8fafc;
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

.history-icon {
  margin-left: 6px;
  cursor: pointer;
  font-size: 15px;
  display: inline-flex;
  align-items: center;
  transition: opacity 0.2s, transform 0.2s;
  vertical-align: middle;
  opacity: 0.7;
}
.history-icon:hover {
  opacity: 1;
  transform: scale(1.15);
}

/* ===== HISTORY MODAL ===== */
.history-modal-card {
  width: min(1200px, 96vw) !important;
  padding: 0 !important;
  overflow: hidden;
}
.history-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
}
.history-modal-header .x {
  background: rgba(255, 255, 255, 0.12) !important;
  color: #e2e8f0 !important;
  border: none;
}
.history-modal-header .x:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  color: #fff !important;
}
.history-modal-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.history-modal-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(56, 189, 248, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  flex-shrink: 0;
}
.history-modal-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.2px;
}
.history-modal-subtitle {
  margin: 3px 0 0;
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
}

/* Summary Stats */
.history-summary {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  padding: 16px 24px;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
}
.history-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  background: #1e293b;
  border-radius: 10px;
  border: 1px solid #334155;
}
.history-stat-label {
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.history-stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #f8fafc;
  font-family: 'JetBrains Mono', monospace;
}

/* Table Wrap */
.history-table-wrap {
  max-height: 420px;
  overflow-y: auto;
  padding: 0;
}

/* Table */
.history-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
  table-layout: fixed;
  min-width: auto !important;
}
.history-table th {
  position: sticky;
  top: 0;
  background: #0f172a !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  font-size: 11px !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 10px 12px !important;
  border-bottom: 1px solid #1e293b !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  z-index: 2;
}
.history-table td {
  padding: 10px 12px !important;
  border: none !important;
  border-bottom: 1px solid #1e293b !important;
  font-size: 13px;
  vertical-align: middle !important;
  color: #cbd5e1;
}
.history-row {
  transition: background 0.15s ease;
}
.history-row:hover td {
  background: rgba(56,189,248,0.05) !important;
}
.history-row:nth-child(even) td {
  background: rgba(15,23,42,0.3);
}

/* Time badge */
.history-time-badge {
  display: inline-block;
  background: #1e293b;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  white-space: nowrap;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.3px;
  border: 1px solid #334155;
}

/* Old value */
.history-old-val {
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Arrow indicators */
.history-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
}
.arrow-up {
  background: #ecfdf5;
  color: #059669;
}
.arrow-down {
  background: #fef2f2;
  color: #dc2626;
}
.arrow-same {
  background: #f1f5f9;
  color: #94a3b8;
}

/* New value */
.history-new-val {
  font-size: 14px;
  font-weight: 700;
  color: #f8fafc;
  font-family: 'JetBrains Mono', monospace;
}
.val-up { color: #059669; }
.val-down { color: #dc2626; }

/* Difference */
.history-diff {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  display: inline-block;
}
.diff-up {
  background: #ecfdf5;
  color: #059669;
}
.diff-down {
  background: #fef2f2;
  color: #dc2626;
}

/* Empty state */
.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}
.history-empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.6;
}
.history-empty-title {
  font-size: 16px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0 0 6px;
}
.history-empty-desc {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  max-width: 280px;
  line-height: 1.5;
}

/* Footer */
.history-modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #1e293b;
  display: flex;
  justify-content: flex-end;
  background: #0f172a;
}
.history-modal-footer button {
  width: auto !important;
  padding: 8px 20px !important;
}
@keyframes highlightRowPulse {
  0% { background-color: rgba(16, 185, 129, 0.4); }
  50% { background-color: rgba(16, 185, 129, 0.15); }
  100% { background-color: transparent; }
}
.highlight-pulse td {
  animation: highlightRowPulse 0.8s ease-out;
}
.ghost-group {
  opacity: 0.5;
  background-color: rgba(56, 189, 248, 0.1);
}
@keyframes vipPulseGhost {
  0% { background-color: rgba(56, 189, 248, 0.05); border-color: rgba(56, 189, 248, 0.4); }
  50% { background-color: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.8); }
  100% { background-color: rgba(56, 189, 248, 0.05); border-color: rgba(56, 189, 248, 0.4); }
}
@keyframes vipFloatGlow {
  0% { box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.4); }
  50% { box-shadow: 0 25px 45px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.7); }
  100% { box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.4); }
}

.ghost-item {
  opacity: 0.4 !important;
}
.ghost-item td {
  border-top: 2px dashed #38bdf8 !important;
  border-bottom: 2px dashed #38bdf8 !important;
  animation: vipPulseGhost 1.5s infinite;
}
.ghost-item td:first-child {
  border-left: 2px dashed #38bdf8 !important;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}
.ghost-item td:last-child {
  border-right: 2px dashed #38bdf8 !important;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.drag-item {
  opacity: 1 !important;
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98)) !important;
  backdrop-filter: blur(12px) !important;
  z-index: 9999 !important;
  transform: scale(1.015) !important;
}
.drag-item td {
  border-top: 1px solid #38bdf8 !important;
  border-bottom: 1px solid #38bdf8 !important;
  animation: vipFloatGlow 2s infinite ease-in-out;
}
.drag-item td:first-child {
  border-left: 1px solid #38bdf8 !important;
}
.drag-item td:last-child {
  border-right: 1px solid #38bdf8 !important;
}

.chosen-item {
  background-color: rgba(16, 185, 129, 0.15) !important;
  transform: scale(0.99) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.chosen-item td {
  border-top: 1px solid #10b981 !important;
  border-bottom: 1px solid #10b981 !important;
  box-shadow: inset 0 0 25px rgba(16, 185, 129, 0.25) !important;
}
.group-drag-handle:hover, .item-drag-handle:hover {
  color: #38bdf8;
}

/* ==============================================================
   VIP MODAL (MANUAL ENTRY)
============================================================== */
.vip-modal-overlay {
  background: rgba(10, 15, 30, 0.75) !important;
  backdrop-filter: blur(10px) !important;
}
.vip-modal-card {
  background: rgba(15, 23, 42, 0.85) !important;
  backdrop-filter: blur(25px) !important;
  border: 1px solid rgba(56, 189, 248, 0.3) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 40px rgba(56, 189, 248, 0.05) !important;
  border-radius: 16px !important;
  overflow: hidden;
  padding: 0 !important;
}
.vip-modal-card .modal-head {
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.1), transparent) !important;
  border-bottom: 1px solid rgba(56, 189, 248, 0.2) !important;
  padding: 20px 24px !important;
}
.vip-modal-card .modal-head h3 {
  background: linear-gradient(to right, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
  letter-spacing: 0.5px;
  font-size: 18px;
}
.vip-modal-card .modal-group {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px;
  padding: 24px;
  margin: 24px;
  transition: all 0.3s ease;
}
.vip-modal-card .modal-group:hover {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(56, 189, 248, 0.3) !important;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
}
.vip-modal-card .modal-group-title {
  color: #38bdf8 !important;
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 700;
}
.vip-modal-card input, .vip-modal-card textarea, .vip-modal-card select {
  background: rgba(0, 0, 0, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #f8fafc !important;
  transition: all 0.3s ease;
  border-radius: 8px;
}
.vip-modal-card input:focus, .vip-modal-card textarea:focus {
  border-color: #38bdf8 !important;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2) !important;
  background: rgba(0, 0, 0, 0.4) !important;
}
.vip-modal-card .modal-actions {
  background: rgba(0, 0, 0, 0.2) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
  padding: 16px 24px !important;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}
.vip-modal-card .primary {
  background: linear-gradient(135deg, #0ea5e9, #3b82f6) !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4) !important;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.vip-modal-card .primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(14, 165, 233, 0.6) !important;
}

/* ═══ ASYNC RESULT MODAL — VIP PREMIUM ═══ */
.async-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(12px) saturate(1.2);
}
.async-card {
  background: linear-gradient(160deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98));
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 24px;
  padding: 48px 56px 40px;
  text-align: center;
  min-width: 340px;
  max-width: 440px;
  box-shadow:
    0 32px 100px rgba(0,0,0,0.6),
    0 0 0 1px rgba(255,255,255,0.04),
    inset 0 1px 0 rgba(255,255,255,0.06);
  position: relative;
  overflow: hidden;
}
.async-card::before {
  content: '';
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  border-radius: 26px;
  background: conic-gradient(from 0deg, transparent 0%, rgba(56,189,248,0.3) 25%, transparent 50%, rgba(16,185,129,0.3) 75%, transparent 100%);
  z-index: -1;
  animation: async-border-spin 4s linear infinite;
  opacity: 0.5;
}
.async-loading .async-card::before { opacity: 1; }
@keyframes async-border-spin {
  to { transform: rotate(360deg); }
}
.async-title {
  font-size: 20px;
  font-weight: 800;
  color: #f8fafc;
  margin-top: 20px;
  letter-spacing: 0.4px;
  line-height: 1.4;
}
.async-subtitle {
  font-size: 13.5px;
  color: #94a3b8;
  margin-top: 10px;
  line-height: 1.6;
  white-space: pre-line;
}

/* ═══ PREMIUM SPINNER ═══ */
.async-spinner-wrap {
  display: flex;
  justify-content: center;
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}
.async-spinner {
  width: 80px;
  height: 80px;
  animation: async-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  filter: drop-shadow(0 0 8px rgba(56,189,248,0.4));
}
.async-spinner circle {
  stroke: url(#async-gradient);
  stroke-dasharray: 80, 200;
  stroke-dashoffset: 0;
  animation: async-dash 1.5s ease-in-out infinite;
}
@keyframes async-spin {
  to { transform: rotate(360deg); }
}
@keyframes async-dash {
  0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 80, 200; stroke-dashoffset: -30; }
  100% { stroke-dasharray: 80, 200; stroke-dashoffset: -120; }
}
/* Orbiting dots */
.async-spinner-wrap::before,
.async-spinner-wrap::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  top: 50%; left: 50%;
  margin: -4px 0 0 -4px;
}
.async-spinner-wrap::before {
  background: #38bdf8;
  box-shadow: 0 0 12px rgba(56,189,248,0.6);
  animation: async-orbit 2s linear infinite;
}
.async-spinner-wrap::after {
  background: #a78bfa;
  box-shadow: 0 0 12px rgba(167,139,250,0.6);
  animation: async-orbit 2s linear infinite reverse;
  animation-delay: -1s;
}
@keyframes async-orbit {
  0% { transform: rotate(0deg) translateX(44px) rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) translateX(44px) rotate(-180deg) scale(0.6); }
  100% { transform: rotate(360deg) translateX(44px) rotate(-360deg) scale(1); }
}

/* Pulse ring under spinner */
.async-spinner-wrap .async-spinner {
  position: relative;
  z-index: 2;
}

/* ═══ SUCCESS CHECKMARK — PREMIUM ═══ */
.async-icon-wrap {
  display: flex;
  justify-content: center;
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}
.async-checkmark {
  width: 80px;
  height: 80px;
  position: relative;
  z-index: 2;
}
.async-checkmark circle {
  stroke: #10b981;
  stroke-width: 2.5;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: async-circle-draw 0.7s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  filter: drop-shadow(0 0 6px rgba(16,185,129,0.5));
}
.async-checkmark path {
  stroke: #34d399;
  stroke-width: 3.5;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: async-check-draw 0.5s 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  filter: drop-shadow(0 0 4px rgba(52,211,153,0.6));
}
@keyframes async-circle-draw {
  to { stroke-dashoffset: 0; }
}
@keyframes async-check-draw {
  to { stroke-dashoffset: 0; }
}
/* Success glow ring burst */
.async-icon-success {
  animation: async-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.async-icon-success::before {
  content: '';
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  border: 2px solid rgba(16,185,129,0.3);
  animation: async-ring-burst 0.8s 0.3s ease-out forwards;
  opacity: 0;
}
.async-icon-success::after {
  content: '';
  position: absolute;
  inset: -24px;
  border-radius: 50%;
  border: 1px solid rgba(16,185,129,0.15);
  animation: async-ring-burst 1s 0.5s ease-out forwards;
  opacity: 0;
}
@keyframes async-ring-burst {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* ═══ ERROR X-MARK — PREMIUM ═══ */
.async-xmark {
  width: 80px;
  height: 80px;
  position: relative;
  z-index: 2;
}
.async-xmark circle {
  stroke: #ef4444;
  stroke-width: 2.5;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: async-circle-draw 0.7s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  filter: drop-shadow(0 0 6px rgba(239,68,68,0.5));
}
.async-xmark path {
  stroke: #f87171;
  stroke-width: 3.5;
  stroke-dasharray: 56;
  stroke-dashoffset: 56;
  animation: async-check-draw 0.4s 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  filter: drop-shadow(0 0 4px rgba(248,113,113,0.6));
}
.async-icon-error {
  animation: async-shake-vip 0.6s 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
.async-icon-error::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%);
  animation: async-error-pulse 1.5s 0.5s ease-in-out infinite;
}
@keyframes async-shake-vip {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  15% { transform: translateX(-10px) rotate(-2deg); }
  30% { transform: translateX(10px) rotate(2deg); }
  45% { transform: translateX(-7px) rotate(-1deg); }
  60% { transform: translateX(7px) rotate(1deg); }
  75% { transform: translateX(-3px); }
  90% { transform: translateX(3px); }
}
@keyframes async-error-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}
@keyframes async-pop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}

/* ═══ CLOSE BUTTON — PREMIUM ═══ */
.async-close-btn {
  margin-top: 24px;
  padding: 12px 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08));
  border: 1px solid rgba(239,68,68,0.25);
  color: #f87171;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
}
.async-close-btn:hover {
  background: linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.15));
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(239,68,68,0.2);
}

/* ═══ TRANSITION — PREMIUM ═══ */
.async-modal-enter-active {
  animation: async-modal-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.async-modal-leave-active {
  animation: async-modal-out 0.25s cubic-bezier(0.4, 0, 1, 1);
}
@keyframes async-modal-in {
  0% { opacity: 0; transform: scale(0.7) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes async-modal-out {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.85) translateY(10px); }
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

/* Tùy chỉnh Header của Modal Load Hóa Đơn thành màu Xanh Lá Cây Đặc */
.load-invoice-modal .modal-head {
  background-color: #10b981 !important;
  border-bottom: none !important;
  color: white !important;
  margin: -24px -24px 20px -24px !important;
  padding: 20px 24px !important;
  border-radius: 20px 20px 0 0 !important;
}
.load-invoice-modal .modal-head h3 {
  color: white !important;
}
.load-invoice-modal .modal-head .x {
  color: white !important;
}
.load-invoice-modal .modal-head .x:hover {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

/* Tùy chỉnh màu Xanh Lá Cây Đặc cho bộ lọc trong Modal Load Hóa Đơn */
.load-invoice-filters .filter-input,
.load-invoice-filters .filter-select {
  padding: 8px 12px !important;
  border-radius: 6px !important;
  border: 1px solid #065f46 !important;
  background: rgba(15, 23, 42, 0.6) !important;
  color: #10b981 !important;
  font-size: 13px !important;
  outline: none !important;
  cursor: pointer !important;
  width: auto !important;
  max-width: 200px !important;
  transition: all 0.2s ease !important;
}
.load-invoice-filters .filter-input::-webkit-calendar-picker-indicator {
  filter: invert(0.8) sepia(1) hue-rotate(90deg) saturate(3) !important;
  cursor: pointer;
}
.load-invoice-filters .filter-input:hover,
.load-invoice-filters .filter-select:hover {
  border-color: #059669 !important;
}
.load-invoice-filters .filter-input:focus,
.load-invoice-filters .filter-select:focus {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
}

.invoice-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.invoice-card:hover {
  border-color: #10b981;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25), 0 0 12px rgba(16, 185, 129, 0.15);
}

.invoice-card.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 0 0 1px #3b82f6;
}

.invoice-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 8px;
}

.invoice-ma-hd {
  font-weight: 700;
  color: #38bdf8;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.invoice-date {
  font-size: 12px;
  color: #94a3b8;
}

.invoice-card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.invoice-card-body p {
  margin: 0;
  line-height: 1.5;
  font-size: 13px;
  color: #cbd5e1;
}

.invoice-po {
  color: #f59e0b !important;
  font-weight: 600;
}

.invoice-status {
  margin-bottom: 4px !important;
}
.status-badge {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: 4px;
}
.badge-temp {
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
}
.badge-official {
  font-weight: 800;
}

.invoice-divider {
  border: 0;
  border-top: 1px dashed #334155;
  margin: 8px 0;
}

.invoice-text {
  color: #ffffff !important;
}

.invoice-customer {
  font-size: 14px !important;
  color: #f8fafc !important;
  margin-bottom: 8px !important;
}

.invoice-totals {
  margin-top: 4px;
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.invoice-totals p {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.invoice-totals p.highlight {
  color: #10b981;
  font-weight: 700;
  font-size: 14px;
}
.invoice-totals p.highlight span {
  font-size: 15px;
}

.btn-load-fe {
  background-color: #10b981 !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  font-size: 15px !important;
  padding: 12px 60px !important;
  border-radius: 8px !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
}
.btn-load-fe:hover:not(:disabled) {
  background-color: #059669 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4) !important;
}
.btn-load-fe:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}
</style>


