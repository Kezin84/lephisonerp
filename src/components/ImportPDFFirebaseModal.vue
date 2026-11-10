<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Đọc Dữ Liệu License Từ File PDF</h3>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="upload-section-mini" v-if="scanComplete || scanning">
          <div class="upload-area-mini" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
            <p>Kéo thả thêm file PDF vào đây, ấn <strong>Ctrl+V</strong> để Dán, hoặc <strong>Nhấn để chọn file</strong></p>
          </div>
        </div>

        <div class="upload-section" v-if="!scanComplete && !scanning">
          <p class="text-muted">Tải lên hoặc kéo thả nhiều file PDF certificate (Kaspersky, Sophos, Acronis, Delinea). Hỗ trợ Dán file (Ctrl+V).</p>
          <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6c757d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <p>Kéo thả file PDF vào đây, ấn <strong>Ctrl+V</strong> để Dán, hoặc <strong>Nhấn để chọn file</strong></p>
          </div>
        </div>
        
        <!-- Input file multiple ẩn -->
        <input type="file" ref="fileInput" accept="application/pdf" multiple style="display: none;" @change="handleFileUpload" />

        <div class="scanning-section" v-if="scanning">
          <div class="scanner-anim">
            <div class="scanner-line"></div>
            <div class="pdf-icon-scanning">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>
          <div class="progress-container">
            <p>Đang phân tích dữ liệu PDF... {{ Math.round(scanProgress * 100) }}%</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${scanProgress * 100}%` }"></div>
            </div>
          </div>
        </div>

        <div class="result-section" v-if="scanComplete">
          <div class="pdf-split-layout">
            <!-- CỘT TRÁI (50%): XEM TRƯỚC FILE PDF -->
            <div class="pdf-preview-col">
              <div class="pdf-preview-head">
                <h4>Xem trước File PDF ({{ activePdfPreviewName || 'Chứng từ' }})</h4>
              </div>
              <div class="pdf-preview-stage">
                <iframe
                  v-if="activePdfPreviewUrl"
                  :src="activePdfPreviewUrl"
                  class="pdf-preview-iframe"
                  title="Xem trước PDF License"
                ></iframe>
                <div v-else class="pdf-preview-empty">
                  <span>Chọn một mặt hàng bên phải để xem trước file PDF</span>
                </div>
              </div>
            </div>

            <!-- CỘT PHẢI (50%): THÔNG SỐ TRÍCH XUẤT -->
            <div class="forms-container">
              <h4>Dữ liệu trích xuất (Phát hiện {{ formDatas.length }} mặt hàng)</h4>
              <div class="forms-scroll-container">
                <div
                  class="form-card"
                  v-for="(formData, index) in formDatas"
                  :key="index"
                  :class="{
                    'is-active-card': activeCardIdx === index,
                    'is-dup-blocked': getCardDuplicateInfo(formData, index).status === 'exact_duplicate',
                    'is-dup-renewal': getCardDuplicateInfo(formData, index).status === 'renewal_candidate'
                  }"
                  @click="activeCardIdx = index"
                >
                  <div class="form-card-header">
                    <div class="form-card-title-cluster">
                      <h5>Mặt Hàng #{{ index + 1 }} <span class="file-badge" v-if="formData.NAME_FILE">{{ formData.NAME_FILE }}</span></h5>
                      <span
                        v-if="getCardDuplicateInfo(formData, index).status === 'exact_duplicate'"
                        class="pdf-dup-badge is-block"
                      >
                        Trùng License ID — Chặn thêm mới
                      </span>
                      <span
                        v-else-if="getCardDuplicateInfo(formData, index).status === 'renewal_candidate'"
                        class="pdf-dup-badge is-renewal"
                      >
                        Trùng mã — Gia hạn kỳ mới
                      </span>
                    </div>
                    <button class="btn-remove-item" @click.stop="removeItem(index)" title="Xóa mặt hàng này">&times;</button>
                  </div>

                  <div
                    v-if="getCardDuplicateInfo(formData, index).isDuplicate"
                    class="pdf-dup-alert-banner"
                    :class="getCardDuplicateInfo(formData, index).status === 'exact_duplicate' ? 'is-block' : 'is-renewal'"
                  >
                    <div class="pdf-dup-alert-head">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <strong v-if="getCardDuplicateInfo(formData, index).status === 'exact_duplicate'">
                        CẢNH BÁO TRÙNG LICENSE ID — KHÔNG CHO PHÉP THÊM MỚI
                      </strong>
                      <strong v-else>
                        LICENSE ID ĐÃ TỒN TẠI (KHÁC NGÀY HẾT HẠN — SẼ CẬP NHẬT GIA HẠN VÀO BẢN CŨ)
                      </strong>
                    </div>
                    <p class="pdf-dup-alert-desc">{{ getCardDuplicateInfo(formData, index).message }}</p>
                  </div>

                  <div v-if="formData._formatError" class="format-error-banner" style="margin-bottom: 16px;">
                    <p>Không tự động nhận diện được định dạng của file PDF này.</p>
                    <button class="btn-ai" @click.prevent="processCardWithAI(formData)" :disabled="formData._aiProcessing">
                      <span v-if="formData._aiProcessing" class="spinner-small"></span>
                      <span v-else>Quét bóc tách bằng AI (DeepSeek Pro)</span>
                    </button>
                  </div>
                  
                  <form class="license-form">
                    <div class="form-row">
                      <div class="form-group">
                        <label>License ID</label>
                        <input type="text" v-model="formData.LICENSE_ID" class="form-control" />
                      </div>
                      <div class="form-group">
                        <label>Sản Phẩm</label>
                        <input type="text" v-model="formData.PRODUCT_NAME" class="form-control" />
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label>Khách Hàng (Trên File License)</label>
                      <textarea v-model="formData.CUSTOMER" class="form-control" rows="2"></textarea>
                    </div>

                    <!-- KHỐI CHỌN MÃ KH CHUẨN & ĐƠN HÀNG PO LIÊN KẾT (CÓ NÚT CHỌN TRONG INPUT & MỞ MODAL) -->
                    <div style="margin-bottom: 16px;">
                      <LicenseCustomerPoPicker
                        :modelValue="formData"
                        :customers="dbCustomers"
                        :officialPos="officialPos"
                        theme="light"
                        @change-customer="onCardCustomerChanged(formData)"
                        @customer-saved="onCardCustomerSaved($event, formData)"
                      />
                    </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label>Ngày Cấp (DD/MM/YYYY)</label>
                      <LicenseDatePickerInput
                        v-model="formData.DATE_OF_LICENSE"
                        theme="light"
                        placeholder="Chọn ngày cấp..."
                      />
                    </div>
                    <div class="form-group">
                      <label>Ngày Hết Hạn (DD/MM/YYYY)</label>
                      <LicenseDatePickerInput
                        v-model="formData.EXPIRATION_TIME"
                        theme="light"
                        placeholder="Chọn ngày hết hạn..."
                      />
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Volume (Số lượng)</label>
                      <input type="text" v-model="formData.LICENSE_VOLUME" class="form-control" />
                    </div>
                    <div class="form-group">
                      <label>Loại License</label>
                      <input type="text" v-model="formData.LICENSE_TYPE" class="form-control" />
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Product Code</label>
                      <input type="text" v-model="formData.PRODUCT_CODE" class="form-control" />
                    </div>
                    <div class="form-group">
                      <label>Localization</label>
                      <input type="text" v-model="formData.LOCALIZATION" class="form-control" />
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Hạn Hiệu Lực (Ân hạn DD/MM/YYYY)</label>
                      <LicenseDatePickerInput
                        v-model="formData.SO_NGAY_HIEU_LUC"
                        theme="light"
                        placeholder="Chọn hạn hiệu lực..."
                      />
                    </div>
                    <div class="form-group">
                      <label>Nhà Sản Xuất</label>
                      <div class="lic-input-with-picker">
                        <input type="text" v-model="formData.NHA_SAN_XUAT" class="form-control has-picker-btn" placeholder="Kaspersky, Sophos..." />
                        <button
                          type="button"
                          class="lic-inline-picker-btn"
                          @click="openVendorPickerForCard(formData)"
                          title="Mở modal chọn hãng / nhà sản xuất"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                          <span>Chọn</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <button class="btn-add-item" @click="addNewItem">+ Thêm mặt hàng thủ công</button>
            </div>
          </div>
        </div>
        
        <div v-if="errorMsg" class="error-msg">
          {{ errorMsg }}
        </div>
      </div>
      
      <div class="modal-footer" v-if="scanComplete && formDatas.length > 0">
        <button class="btn-secondary" @click="$emit('close')">Hủy</button>
        <button
          class="btn-primary"
          :class="{
            'is-blocked': hasBlockedDuplicates,
            'is-renewal': !hasBlockedDuplicates && hasRenewalCandidates
          }"
          @click="saveData"
          :disabled="saving || hasBlockedDuplicates"
        >
          <span v-if="saving" class="spinner-small"></span>
          <span v-else-if="hasBlockedDuplicates">Có mặt hàng trùng License ID (Không thể lưu)</span>
          <span v-else-if="hasRenewalCandidates">Lưu &amp; Cập nhật Gia hạn ({{ formDatas.length }} mặt hàng)</span>
          <span v-else>Lưu {{ formDatas.length }} Dữ Liệu</span>
        </button>
      </div>
    </div>

    <AsyncConfirmModal
      :show="asyncModal.show"
      :type="asyncModal.type"
      :title="asyncModal.title"
      :msg="asyncModal.msg"
      :confirmText="asyncModal.confirmText"
      :cancelText="asyncModal.cancelText"
      @close="asyncModal.show = false"
      @confirm="handleAsyncConfirm"
      @cancel="handleAsyncCancel"
    />

    <LicenseVendorPickerModal
      v-if="vendorPickerTargetCard"
      v-model:show="showVendorPickerModal"
      v-model="vendorPickerTargetCard.NHA_SAN_XUAT"
      :officialPos="officialPos"
      theme="light"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.js?url'
import AsyncConfirmModal from './AsyncConfirmModal.vue'
import LicenseCustomerPoPicker from './LicenseCustomerPoPicker.vue'
import LicenseVendorPickerModal from './LicenseVendorPickerModal.vue'
import LicenseDatePickerInput from './LicenseDatePickerInput.vue'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const emit = defineEmits(['close', 'import-success'])
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref as dbRef, push, set } from "firebase/database";
import { callDeepSeek } from '../services/deepseek'
import {
  loadCustomerAndPoCatalog,
  fuzzyMatchCustomer,
  filterPosForCustomer,
  syncLicenseToSaleReportPO,
  propagateCustomerToSameVendorLicenses,
  normalizeViText,
  loadExistingLicensesCatalog,
  inspectLicenseDuplicate,
  applyRenewalUpdateToExistingLicense,
  normalizeLicenseIdKey,
  formatLicenseDateStr
} from '../utils/licensePoSync'

const asyncModal = ref({ show: false, type: 'confirm', title: '', msg: '', confirmText: 'Đồng ý', cancelText: 'Hủy' })
let confirmResolve = null
const confirmAction = (title, msg, confirmText = 'Đồng ý') => {
  return new Promise((resolve) => {
    asyncModal.value = { show: true, type: 'confirm', title, msg, confirmText, cancelText: 'Hủy' }
    confirmResolve = resolve
  })
}
const handleAsyncConfirm = () => {
  if (confirmResolve) confirmResolve(true)
}
const handleAsyncCancel = () => {
  if (confirmResolve) confirmResolve(false)
  asyncModal.value.show = false
}

const firebaseConfig = {
  apiKey: "AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8",
  authDomain: "chusonproject.firebaseapp.com",
  databaseURL: "https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chusonproject",
  storageBucket: "chusonproject.firebasestorage.app",
  messagingSenderId: "929199941311",
  appId: "1:929199941311:web:ca8d86f9fd7f8dff61480a",
  measurementId: "G-48VVPGFSFK"
};
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(firebaseApp);


const fileInput = ref(null)
const scanning = ref(false)
const scanComplete = ref(false)
const scanProgress = ref(0)
const errorMsg = ref('')
const saving = ref(false)

const dbCustomers = ref([])
const officialPos = ref([])
const existingLicensesCatalog = ref([])
const formDatas = ref([])

const getCardDuplicateInfo = (card, cardIdx) => {
  if (!card) return { isDuplicate: false, status: 'ok', message: '' }
  const dbCheck = inspectLicenseDuplicate(card, existingLicensesCatalog.value)
  if (dbCheck.isDuplicate) return dbCheck

  // Kiểm tra trùng với mặt hàng đứng trước trong cùng danh sách đang upload
  const normId = normalizeLicenseIdKey(card.LICENSE_ID)
  if (normId && typeof cardIdx === 'number' && cardIdx > 0) {
    const candExp = formatLicenseDateStr(card.EXPIRATION_TIME)
    for (let i = 0; i < cardIdx; i++) {
      const prev = formDatas.value[i]
      if (!prev) continue
      if (normalizeLicenseIdKey(prev.LICENSE_ID) === normId) {
        const prevExp = formatLicenseDateStr(prev.EXPIRATION_TIME)
        if (prevExp === candExp) {
          return {
            isDuplicate: true,
            status: 'exact_duplicate',
            matchedRecord: prev,
            message: `Trùng License ID "${card.LICENSE_ID}" với Mặt Hàng #${i + 1} ngay trong danh sách đang tải lên. Vui lòng xóa bớt 1 mặt hàng trùng lặp!`
          }
        }
      }
    }
  }
  return { isDuplicate: false, status: 'ok', message: '' }
}

const hasBlockedDuplicates = computed(() => {
  return formDatas.value.some((card, idx) => getCardDuplicateInfo(card, idx).status === 'exact_duplicate')
})

const hasRenewalCandidates = computed(() => {
  return formDatas.value.some((card, idx) => getCardDuplicateInfo(card, idx).status === 'renewal_candidate')
})

const getEmptyForm = () => ({
  LICENSE_ID: '',
  CUSTOMER: '',
  MA_KHACH_HANG: '',
  TEN_CONG_TY: '',
  SO_PO: '',
  PO_FIREBASE_KEY: '',
  PRODUCT_NAME: '',
  LOCALIZATION: '',
  LICENSE_VOLUME: '',
  LICENSE_DESCRIPTION: '',
  DATE_OF_LICENSE: '',
  EXPIRATION_TIME: '',
  LICENSE_TYPE: '',
  PRODUCT_CODE: '',
  SO_NGAY_HIEU_LUC: '',
  NHA_SAN_XUAT: '',
  NAME_FILE: '',
  LINK_FILE: '',
  _file: null, // Để chứa file object tạm thời
  _formatError: false,
  _rawText: '',
  _aiProcessing: false,
  _autoMatchedCust: false
})

const getPosForCard = (card) => {
  return filterPosForCustomer(
    officialPos.value,
    card.MA_KHACH_HANG,
    card.TEN_CONG_TY,
    card.CUSTOMER
  )
}

const activeCardIdx = ref(0)
const showVendorPickerModal = ref(false)
const vendorPickerTargetCard = ref(null)

const openVendorPickerForCard = (card) => {
  if (!card) return
  vendorPickerTargetCard.value = card
  showVendorPickerModal.value = true
}

const activePdfPreviewUrl = computed(() => {
  const card = formDatas.value[activeCardIdx.value] || formDatas.value[0]
  if (!card) return ''
  return card._previewUrl || card.LINK_FILE || ''
})

const activePdfPreviewName = computed(() => {
  const card = formDatas.value[activeCardIdx.value] || formDatas.value[0]
  return card ? (card.NAME_FILE || '') : ''
})

const autoMatchCardCustomer = (_card) => {
  // Đã tắt gợi ý tự động theo yêu cầu người dùng
}

const onCardCustomerChanged = (card) => {
  if (!card || !card.CUSTOMER) return
  const normVendor = normalizeViText(card.CUSTOMER)
  if (!normVendor || (!card.MA_KHACH_HANG && !card.TEN_CONG_TY)) return
  formDatas.value.forEach(other => {
    if (other === card) return
    if (normalizeViText(other.CUSTOMER) === normVendor && !other.MA_KHACH_HANG && !other.TEN_CONG_TY) {
      other.MA_KHACH_HANG = card.MA_KHACH_HANG || ''
      other.TEN_CONG_TY = card.TEN_CONG_TY || ''
      other.TEN_KHACH_HANG = card.TEN_KHACH_HANG || ''
    }
  })
}

const onCardCustomerSaved = (savedCust, card) => {
  if (!savedCust) return
  const idx = dbCustomers.value.findIndex(
    c => c.firebaseKey === savedCust.firebaseKey || c.ma_khach_hang === savedCust.ma_khach_hang
  )
  if (idx >= 0) dbCustomers.value.splice(idx, 1, savedCust)
  else dbCustomers.value.unshift(savedCust)
  onCardCustomerChanged(card)
}

const onCardSelectCustomer = (card) => {
  card._autoMatchedCust = false
  const found = dbCustomers.value.find(c => c.ma_khach_hang === card.MA_KHACH_HANG)
  card.TEN_CONG_TY = found ? found.ten_cong_ty : ''
  if (card.PO_FIREBASE_KEY) {
    const valid = getPosForCard(card).some(p => p.firebaseKey === card.PO_FIREBASE_KEY)
    if (!valid) {
      card.PO_FIREBASE_KEY = ''
      card.SO_PO = ''
    }
  }
}

const onCardSelectPo = (card) => {
  const po = officialPos.value.find(p => p.firebaseKey === card.PO_FIREBASE_KEY)
  if (po) {
    card.SO_PO = po.soPO || ''
    if (!card.MA_KHACH_HANG && po.maKhachHang) {
      card.MA_KHACH_HANG = po.maKhachHang
    }
    if (!card.TEN_CONG_TY && po.tenCongTy) {
      card.TEN_CONG_TY = po.tenCongTy
    }
  } else {
    card.SO_PO = ''
  }
}

const addNewItem = () => {
  formDatas.value.push(getEmptyForm())
}

const removeItem = (index) => {
  formDatas.value.splice(index, 1)
  if (formDatas.value.length === 0) {
    scanComplete.value = false;
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

// Bắt sự kiện Paste
const handlePaste = (e) => {
  if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
    handleFiles(e.clipboardData.files)
  }
}

onMounted(async () => {
  window.addEventListener('paste', handlePaste)
  const [catalog, existingLics] = await Promise.all([
    loadCustomerAndPoCatalog(database),
    loadExistingLicensesCatalog(database)
  ])
  dbCustomers.value = catalog.customers
  officialPos.value = catalog.officialPos
  existingLicensesCatalog.value = existingLics
  formDatas.value.forEach(f => autoMatchCardCustomer(f))
})

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste)
})

const handleDrop = (e) => handleFiles(e.dataTransfer.files)
const handleFileUpload = (e) => handleFiles(e.target.files)

const handleFiles = async (filesList) => {
  const files = Array.from(filesList).filter(f => f.type === 'application/pdf')
  if (files.length === 0) {
    errorMsg.value = 'Chỉ hỗ trợ dán hoặc chọn file định dạng PDF.'
    return
  }
  
  errorMsg.value = ''
  scanning.value = true
  scanProgress.value = 0.1
  
  for (let idx = 0; idx < files.length; idx++) {
    const file = files[idx]
    scanProgress.value = 0.1 + (0.8 * (idx / files.length))
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      let fullText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        fullText += textContent.items.map(item => item.str).join(' ') + ' \n'
      }
      
      parsePdfText(fullText, file)
    } catch (err) {
      console.error(`Lỗi khi đọc file ${file.name}:`, err)
      errorMsg.value += `Lỗi đọc ${file.name}: ${err.message || String(err)} | `
    }
  }
  
  scanProgress.value = 1.0
  scanning.value = false
  if (formDatas.value.length > 0) {
    scanComplete.value = true
  }
}

const uploadCloudinary = async (file) => {
  try {
    const fd = new FormData()
    fd.append('upload_preset', 'upload_file')
    fd.append('file', file)
    const uploadRes = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', {
      method: 'POST',
      body: fd
    }).then(r => r.json())
    return uploadRes.secure_url || ''
  } catch (e) {
    console.error('Lỗi upload file:', e)
    return ''
  }
}

const formatDateString = (dateStr) => {
  if (!dateStr) return '';
  dateStr = dateStr.trim();
  
  let match = dateStr.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
  if (match) return `${match[3].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[1]}`;
  
  match = dateStr.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);
  if (match) {
    let p1 = parseInt(match[1]), p2 = parseInt(match[2]), y = match[3], d, m;
    if (p1 > 12) { d = p1; m = p2; } else if (p2 > 12) { d = p2; m = p1; } else { d = p1; m = p2; }
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  }
  
  const parsedDate = new Date(dateStr);
  if (!isNaN(parsedDate.getTime())) {
    const d = String(parsedDate.getDate()).padStart(2, '0');
    const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const y = parsedDate.getFullYear();
    return `${d}/${m}/${y}`;
  }
  return dateStr;
}

const addDaysToDateStr = (dateStr, days) => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const d = new Date(parts[2], parts[1] - 1, parts[0]);
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() + days);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${dd}/${mm}/${d.getFullYear()}`;
    }
  }
  return '';
}

const pushForms = (tempForms, file, rawText) => {
  if (tempForms.length === 0) {
    const empty = getEmptyForm();
    empty._formatError = true;
    empty._rawText = rawText;
    tempForms.push(empty)
  }
  
  // Xử lý trùng License ID trong cùng 1 file
  const idGroups = {};
  tempForms.forEach(f => {
    const id = f.LICENSE_ID;
    if (id) {
      if (!idGroups[id]) idGroups[id] = [];
      idGroups[id].push(f);
    }
  });

  Object.keys(idGroups).forEach(id => {
    const group = idGroups[id];
    if (group.length > 1) {
      group.forEach((f, idx) => {
        f.LICENSE_ID = `${id}-${idx + 1}`;
      });
    }
  });

  const fileBlobUrl = file ? URL.createObjectURL(file) : ''
  tempForms.forEach(f => {
    f._file = file
    f._previewUrl = fileBlobUrl
    f.NAME_FILE = file ? file.name : ''
    f.LINK_FILE = '' // Để trống, upload khi bấm lưu
    if (f.EXPIRATION_TIME && !f.SO_NGAY_HIEU_LUC) {
      f.SO_NGAY_HIEU_LUC = addDaysToDateStr(f.EXPIRATION_TIME, 30)
    }
    formDatas.value.push(f)
  })
}

const parsePdfText = (text, file) => {
  const lowerText = text.toLowerCase()
  let tempForms = []
  
  // Kaspersky Format
  if (lowerText.includes('kaspersky') && lowerText.includes('license id')) {
    const formData = getEmptyForm()
    const customerMatch = text.match(/Customer:\s*(.*?)(?=\s+Product Name)/is);
    if (customerMatch) formData.CUSTOMER = customerMatch[1].replace(/[\n\r]+/g, ' ').trim();
    
    const productMatch = text.match(/Product Name\s*(.*?)(?=\s+Localization)/is);
    if (productMatch) formData.PRODUCT_NAME = productMatch[1].replace(/[\n\r]+/g, ' ').trim();
    
    const locMatch = text.match(/Localization\s*(.*?)(?=\s+License Description)/is);
    if (locMatch) formData.LOCALIZATION = locMatch[1].trim();
    
    const volMatch = text.match(/License Description\s*(.*?)(?=\s+Date of License)/is);
    if (volMatch) formData.LICENSE_VOLUME = volMatch[1].trim();
    
    const dateMatch = text.match(/Date of License\s*([\d-]+)/is);
    if (dateMatch) formData.DATE_OF_LICENSE = formatDateString(dateMatch[1]);
    
    const expMatch = text.match(/Expiration Time\s*([\d-]+)/is);
    if (expMatch) formData.EXPIRATION_TIME = formatDateString(expMatch[1]);
    
    const typeMatch = text.match(/License Type\s*(.*?)(?=\s+Product Code)/is);
    if (typeMatch) formData.LICENSE_TYPE = typeMatch[1].trim();
    
    const codeMatch = text.match(/Product Code\s*([A-Z0-9]+)/i);
    if (codeMatch) formData.PRODUCT_CODE = codeMatch[1].trim();
    
    const idMatch = text.match(/License ID:\s*([A-Z0-9\-]+)/i);
    if (idMatch) formData.LICENSE_ID = idMatch[1].trim();
    
    tempForms.push(formData)
  }
  // Sophos Format
  else if (lowerText.includes('sophos')) {
    let customerStr = ''
    const customerMatch = text.match(/Customer Address\s*Reseller\s*(.*?)(?=Nam Truong Son|Please keep this|Distributor)/is);
    if (customerMatch) customerStr = customerMatch[1].replace(/[\n\r]+/g, ' ').trim();
    
    let typeStr = ''
    const typeMatch = text.match(/Enhanced Support/i);
    if (typeMatch) typeStr = 'Enhanced Support';
    
    // Find multiple products using Regex
    const productRegex = /(?:\d+\s+)?([a-zA-Z0-9\s\-]+?)\s*\(SKU:\s*([A-Z0-9]+)[^\)]*\)\s*([A-Z0-9]+)\s+(\d+)\s+[a-zA-Z]+\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})/g;
    let match;
    let found = false;
    
    while ((match = productRegex.exec(text)) !== null) {
      found = true;
      const formData = getEmptyForm()
      formData.CUSTOMER = customerStr
      formData.LICENSE_TYPE = typeStr
      formData.PRODUCT_NAME = match[1].replace(/[\n\r]+/g, ' ').trim()
      formData.PRODUCT_CODE = match[2].trim()
      formData.LICENSE_ID = match[3].trim()
      formData.LICENSE_VOLUME = match[4].trim()
      formData.DATE_OF_LICENSE = match[5].trim()
      formData.EXPIRATION_TIME = match[6].trim()
      tempForms.push(formData)
    }
    
    if (!found) {
        // Fallback for single product if regex fails
        const formData = getEmptyForm()
        formData.CUSTOMER = customerStr
        formData.LICENSE_TYPE = typeStr
        const prodMatch = text.match(/Term \(Months\)\s+(.*?)\s+\(SKU:/i);
        if (prodMatch) formData.PRODUCT_NAME = prodMatch[1].replace(/[\n\r]+/g, ' ').trim();
        const skuMatch = text.match(/\(SKU:\s*([A-Z0-9]+)/i);
        if (skuMatch) formData.PRODUCT_CODE = skuMatch[1].trim();
        const licNumMatch = text.match(/(LN\d+)/i);
        if (licNumMatch) formData.LICENSE_ID = licNumMatch[1].trim();
        const datesMatch = text.match(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})/);
        if (datesMatch) {
            formData.DATE_OF_LICENSE = datesMatch[1];
            formData.EXPIRATION_TIME = datesMatch[2];
        }
        const volMatch = text.match(/LN\d+\s+(\d+)\s+USERS/i);
        if (volMatch) formData.LICENSE_VOLUME = volMatch[1].trim();
        tempForms.push(formData)
    }
  }
  // Acronis Format
  else if (lowerText.includes('acronis')) {
    const formData = getEmptyForm()
    const customerMatch = text.match(/Licensee\s*(.*?)(?=No\.|VIETNAM)/is);
    if (customerMatch) formData.CUSTOMER = customerMatch[1].replace(/[\n\r]+/g, ' ').trim();
    
    const quantityMatch = text.match(/Quantity\s+(\d+)/i);
    if (quantityMatch) formData.LICENSE_VOLUME = quantityMatch[1].trim();
    
    const typeMatch = text.match(/License\s+Type\s*(.*?)(?=\s*valid\s+from)/is);
    if (typeMatch) formData.LICENSE_TYPE = typeMatch[1].replace(/[\n\r]+/g, ' ').trim();
    
    const dateMatch = text.match(/valid\s+from\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})\s+to\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/is);
    if (dateMatch) {
        formData.DATE_OF_LICENSE = formatDateString(dateMatch[1]);
        formData.EXPIRATION_TIME = formatDateString(dateMatch[2]);
    }
    
    const productMatch = text.match(/License\s*Product\s*([A-Za-z\s,]+(?:1 Year|2 Years|3 Years|Subscription License)[\w\s,]*?)\s*License\s*Key/is) || text.match(/License\s*Product\s*(.*?)\s*License\s*Key/is);
    if (productMatch) formData.PRODUCT_NAME = productMatch[1].replace(/[\n\r]+/g, ' ').trim();
    
    const skuMatch = text.match(/SKU\s+([A-Z0-9]+)/i);
    if (skuMatch) formData.PRODUCT_CODE = skuMatch[1].trim();
    
    const certMatch = text.match(/CERTSG-\d+/i) || text.match(/License\s*Certificate\s*([A-Z0-9\-]+)/i);
    if (certMatch) formData.LICENSE_ID = certMatch[1] || certMatch[0];
    
    const keyMatch = text.match(/License\s*Key\s+([A-Z0-9\-]{20,})/i);
    if (keyMatch) formData.LICENSE_DESCRIPTION = 'Key: ' + keyMatch[1];
    
    tempForms.push(formData)
  }
  // Delinea Format
  else if (lowerText.includes('delinea') || lowerText.includes('secret server')) {
    const certIdMatch = text.match(/License Certificate Id\s+([A-Z0-9\-]+)/i);
    const certId = certIdMatch ? certIdMatch[1].trim() : '';

    let customerStr = '';
    const customerMatch = text.match(/End User\s+(.*?)(?=Contact Name)/is);
    if (customerMatch) {
      customerStr = customerMatch[1].replace(/[\n\r]+/g, ' ').trim();
    }

    const regex = /(?:Entitlements\s+|License End Date:\s*[\d\-]+\s+)?([a-zA-Z0-9\s\-\/\.]+?)\s*License Name:\s*(.*?)\s*License Key:\s*([A-Z0-9\-]+)\s*License Quantity:\s*(\d+)\s*License Start Date:\s*([\d\-]+)\s*License End Date:\s*([\d\-]+)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const formData = getEmptyForm();
      formData.CUSTOMER = customerStr;
      formData.NHA_SAN_XUAT = 'Delinea';
      formData.LICENSE_ID = certId;
      
      let productName = match[1].replace(/[\n\r]+/g, ' ').trim();
      if (productName.startsWith('Entitlements')) {
        productName = productName.substring(12).trim();
      }
      formData.PRODUCT_NAME = productName;
      formData.LICENSE_DESCRIPTION = 'Key: ' + match[3].trim();
      formData.LICENSE_VOLUME = match[4].trim();
      formData.DATE_OF_LICENSE = formatDateString(match[5].trim());
      formData.EXPIRATION_TIME = formatDateString(match[6].trim());
      formData.SO_NGAY_HIEU_LUC = addDaysToDateStr(formData.EXPIRATION_TIME, 30);
      
      tempForms.push(formData);
    }
  }
  
  pushForms(tempForms, file, text)
}

const processCardWithAI = async (formData) => {
  formData._aiProcessing = true;
  errorMsg.value = '';
  
  const prompt = `Tôi có đoạn văn bản trích xuất từ một file PDF giấy phép phần mềm (License):
"""
${formData._rawText}
"""

Hãy bóc tách các thông tin sau và trả về định dạng JSON hợp lệ (không Markdown, chỉ xuất object {}). 
Các trường cần lấy:
- LICENSE_ID
- CUSTOMER
- PRODUCT_NAME
- LOCALIZATION
- LICENSE_VOLUME
- DATE_OF_LICENSE (định dạng DD/MM/YYYY)
- EXPIRATION_TIME (định dạng DD/MM/YYYY)
- LICENSE_TYPE
- PRODUCT_CODE
- NHA_SAN_XUAT (Ví dụ: Kaspersky, Sophos, Acronis, Delinea...)

Nếu không tìm thấy thông tin nào, hãy để chuỗi rỗng "".`;

  try {
    const result = await callDeepSeek(prompt, false, false);
    
    let jsonContent = '';
    if (result.choices && result.choices.length > 0) {
      jsonContent = result.choices[0]?.message?.content || result.choices[0]?.text || '';
    } else if (result.output && Array.isArray(result.output)) {
      const messageObj = result.output.find(item => item.type === 'message');
      const textObj = messageObj?.content?.find(c => c.type === 'output_text');
      jsonContent = textObj ? textObj.text : '';
    }
    
    // Xóa block code markdown nếu AI trả về
    jsonContent = jsonContent.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(jsonContent);
    
    Object.keys(formData).forEach(k => {
      if(parsedData[k] !== undefined && !k.startsWith('_') && k !== 'LINK_FILE' && k !== 'NAME_FILE') {
        formData[k] = parsedData[k];
      }
    });
    if (formData.EXPIRATION_TIME && !formData.SO_NGAY_HIEU_LUC) {
      formData.SO_NGAY_HIEU_LUC = addDaysToDateStr(formData.EXPIRATION_TIME, 30);
    }
    autoMatchCardCustomer(formData);
    
    const hasData = formData.LICENSE_ID || formData.PRODUCT_NAME || formData.CUSTOMER;
    if (!hasData) {
      alert('AI không thể tìm thấy thông tin hợp lệ trong file PDF này. Vui lòng tự nhập tay.');
    } else {
      formData._formatError = false; // Tắt báo lỗi sau khi AI xử lý xong
    }
  } catch (err) {
    console.error('Lỗi phân tích AI:', err);
    errorMsg.value = 'Lỗi phân tích từ AI: ' + (err.message || String(err));
    alert('Lỗi khi gọi AI: ' + (err.message || String(err)));
  } finally {
    formData._aiProcessing = false;
  }
}

const saveData = async () => {
  errorMsg.value = ''
  const latestCatalog = await loadExistingLicensesCatalog(database)
  existingLicensesCatalog.value = latestCatalog

  // Kiểm tra trùng License ID trước khi upload & lưu
  const blockedItems = []
  const renewalItems = []

  formDatas.value.forEach((card, idx) => {
    const dup = getCardDuplicateInfo(card, idx)
    if (dup.status === 'exact_duplicate') {
      blockedItems.push({ index: idx, card, dup })
    } else if (dup.status === 'renewal_candidate' && dup.matchedRecord?.firebaseKey) {
      renewalItems.push({ index: idx, card, dup })
    }
  })

  if (blockedItems.length > 0) {
    activeCardIdx.value = blockedItems[0].index
    const summaryMsg = blockedItems
      .map(b => `• Mặt Hàng #${b.index + 1}: ${b.dup.message}`)
      .join('\n')
    errorMsg.value = summaryMsg
    asyncModal.value = {
      show: true,
      type: 'error',
      title: `Phát hiện ${blockedItems.length} mặt hàng trùng License ID — Chặn thêm mới`,
      msg: `${summaryMsg}\n\nVui lòng xóa mặt hàng bị trùng hoặc kiểm tra lại mã License ID trước khi lưu!`
    }
    return
  }

  if (renewalItems.length > 0) {
    const renewalSummary = renewalItems
      .map(r => `• Mặt Hàng #${r.index + 1} (${r.card.LICENSE_ID}): Hết hạn cũ ${r.dup.oldExpDate || '—'} → Mới ${r.dup.newExpDate || '—'}`)
      .join('\n')
    const confirmed = await confirmAction(
      `Phát hiện ${renewalItems.length} License ID đã tồn tại (Gia hạn kỳ mới)`,
      `${renewalSummary}\n\nHệ thống chặn tạo mới bản ghi trùng mã. Bạn có muốn CẬP NHẬT (Ghi đè) kỳ hạn & chứng từ mới vào các License cũ tương ứng không?`,
      'Cập nhật vào License cũ'
    )
    if (!confirmed) return
  }

  saving.value = true
  try {
    // 1. Group unique files to upload them efficiently
    const uniqueFilesMap = new Map() // Tên file -> đối tượng File và URL
    formDatas.value.forEach(f => {
      if (f._file && !uniqueFilesMap.has(f._file.name)) {
        uniqueFilesMap.set(f._file.name, { file: f._file, url: '' })
      }
    })

    // Upload tất cả unique files lên Cloudinary
    for (const [name, obj] of uniqueFilesMap.entries()) {
      const url = await uploadCloudinary(obj.file)
      if (url) {
        obj.url = url
      } else {
        errorMsg.value = `Lỗi tải file ${name} lên máy chủ. `
      }
    }

    // Nếu có lỗi upload, ngưng quá trình lưu
    if (errorMsg.value) {
      saving.value = false
      return
    }

    // 2. Gắn LINK_FILE vào từng formData và lưu vào Firebase + đồng bộ PO
    for (let idx = 0; idx < formDatas.value.length; idx++) {
      const formData = formDatas.value[idx]
      if (formData._file) {
        formData.LINK_FILE = uniqueFilesMap.get(formData._file.name).url
      }
      const dup = getCardDuplicateInfo(formData, idx)
      const payload = { ...formData }
      delete payload._file
      delete payload._previewUrl
      delete payload._formatError
      delete payload._rawText
      delete payload._aiProcessing
      delete payload._autoMatchedCust
      delete payload.sheet
      delete payload.action
      delete payload.IS_GIA_HAN

      if (dup.status === 'renewal_candidate' && dup.matchedRecord?.firebaseKey) {
        await applyRenewalUpdateToExistingLicense(database, dup.matchedRecord.firebaseKey, payload, dup.matchedRecord)
      } else {
        const newRef = push(dbRef(database, 'license_old_data'))
        await set(newRef, payload)
        if (payload.PO_FIREBASE_KEY) {
          await syncLicenseToSaleReportPO(database, newRef.key, payload)
        }
        if (payload.CUSTOMER && (payload.MA_KHACH_HANG || payload.TEN_CONG_TY)) {
          await propagateCustomerToSameVendorLicenses(database, payload.CUSTOMER, payload, newRef.key)
        }
      }
    }
    const hasError = false
    
    if (!hasError) {
      emit('import-success')
      emit('close')
    } else {
      errorMsg.value = 'Có lỗi xảy ra khi lưu một số mặt hàng.'
    }
  } catch (err) {
    console.error('Save error:', err)
    errorMsg.value = 'Lỗi kết nối khi lưu dữ liệu. Vui lòng thử lại.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* CSS Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 0;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: none;
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #ef4444;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.upload-section {
  text-align: center;
  margin-bottom: 20px;
}

.upload-section-mini {
  margin-bottom: 16px;
}

.upload-area {
  margin-top: 10px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 40px 20px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.upload-area-mini {
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  background: #f8fafc;
  transition: all 0.2s;
}

.upload-area-mini:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.upload-area-mini p {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.upload-area p {
  margin-top: 16px;
  color: #475569;
  font-size: 1.05rem;
}

.scanning-section {
  text-align: center;
  padding: 40px 0;
}

.pdf-icon-scanning {
  font-size: 64px;
  margin: 20px 0;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(0.95); }
}

.progress-container {
  max-width: 400px;
  margin: 20px auto 0;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.result-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.pdf-split-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.pdf-preview-col {
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  overflow: hidden;
  min-height: 480px;
}

.pdf-preview-head {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #f1f5f9;
}

.pdf-preview-head h4 {
  margin: 0;
  font-size: 1rem;
  color: #1e293b;
}

.pdf-preview-stage {
  flex: 1;
  min-height: 440px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
}

.pdf-preview-iframe {
  width: 100%;
  height: 100%;
  min-height: 520px;
  border: 0;
  background: #ffffff;
}

.pdf-preview-empty {
  color: #94a3b8;
  font-size: 0.95rem;
  padding: 24px;
  text-align: center;
}

.forms-container {
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 4px;
}

.forms-container h4 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 1.1rem;
}

.forms-scroll-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 16px;
  width: 100%;
}

.form-card {
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.form-card.is-active-card {
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15);
}

.form-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.form-card-header h5 {
  margin: 0;
  color: #3b82f6;
  font-size: 1.05rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-badge {
  font-size: 0.75rem;
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 4px;
  word-break: break-all;
  font-weight: normal;
}

.btn-remove-item {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.btn-add-item {
  margin-top: 16px;
  background: #f1f5f9;
  color: #475569;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  padding: 12px;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.btn-add-item:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

.format-error-banner {
  background-color: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.format-error-banner p {
  margin: 0;
  color: #b45309;
  font-size: 0.95rem;
}

.btn-ai {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
  align-self: flex-start;
}

.btn-ai:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-ai:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-msg {
  margin-top: 16px;
  padding: 12px;
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f8fafc;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  min-width: 120px;
  display: flex;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-secondary:hover {
  background: #f1f5f9;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Custom Scrollbar for the horizontal list */
.forms-scroll-container::-webkit-scrollbar {
  height: 10px;
}

.forms-scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 5px;
}

.forms-scroll-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 5px;
}

.forms-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.lic-input-with-picker {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.form-control.has-picker-btn {
  padding-right: 72px;
}

.lic-inline-picker-btn {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid rgba(110, 231, 183, 0.45);
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.lic-inline-picker-btn:hover {
  filter: brightness(1.08);
}

.form-card-title-cluster {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.form-card.is-dup-blocked {
  border-color: #f87171 !important;
  box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.25);
}

.form-card.is-dup-renewal {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.22);
}

.pdf-dup-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.pdf-dup-badge.is-block {
  background: #fee2e2;
  border: 1px solid #f87171;
  color: #b91c1c;
}

.pdf-dup-badge.is-renewal {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  color: #b45309;
}

.pdf-dup-alert-banner {
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 14px;
  border: 1.5px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pdf-dup-alert-banner.is-block {
  background: #fef2f2;
  border-color: #f87171;
  color: #991b1b;
}

.pdf-dup-alert-banner.is-renewal {
  background: #fffbeb;
  border-color: #f59e0b;
  color: #92400e;
}

.pdf-dup-alert-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.pdf-dup-alert-desc {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.45;
  font-weight: 600;
}

.btn-primary.is-blocked {
  background: #dc2626 !important;
  opacity: 0.72;
  cursor: not-allowed !important;
}

.btn-primary.is-renewal {
  background: linear-gradient(135deg, #d97706 0%, #059669 100%) !important;
}
</style>
