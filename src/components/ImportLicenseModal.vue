<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Quét Dữ Liệu License Từ Ảnh (OCR)</h3>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="upload-section" v-if="!scanComplete && !scanning">
          <p class="text-muted">Tải lên hình ảnh license của Sophos hoặc Kaspersky, hệ thống sẽ tự động quét thông tin.</p>
          <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6c757d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <p>Kéo thả ảnh vào đây hoặc <strong>Nhấn để chọn ảnh</strong></p>
            <input type="file" ref="fileInput" accept="image/*" style="display: none;" @change="handleFileUpload" />
          </div>
        </div>

        <div class="scanning-section" v-if="scanning">
          <div class="scanner-anim">
            <div class="scanner-line"></div>
            <img v-if="previewImageUrl" :src="previewImageUrl" class="scanning-img" />
          </div>
          <div class="progress-container">
            <p>Đang phân tích hình ảnh... {{ Math.round(scanProgress * 100) }}%</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${scanProgress * 100}%` }"></div>
            </div>
          </div>
        </div>

        <div class="result-section" v-if="scanComplete">
          <div class="result-layout">
            <div class="image-preview-panel">
              <h4>Ảnh gốc</h4>
              <img :src="previewImageUrl" class="result-img" />
            </div>
            <div class="form-panel">
              <h4>Dữ liệu trích xuất (Vui lòng kiểm tra lại)</h4>
              <form class="license-form">
                <div class="modal-section">
                  <h4 class="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    Thông Tin Chung
                  </h4>
                  <div class="form-row">
                    <div class="form-group">
                      <label>License ID</label>
                      <input type="text" v-model="formData.LICENSE_ID" class="form-control" />
                    </div>
                    <div class="form-group">
                      <label>Product Code</label>
                      <input type="text" v-model="formData.PRODUCT_CODE" class="form-control" />
                    </div>
                  </div>
                  
                  <div class="form-group" style="margin-bottom: 16px;">
                    <label>Khách Hàng</label>
                    <textarea v-model="formData.CUSTOMER" class="form-control" rows="2"></textarea>
                  </div>
                  
                  <div class="form-group" style="margin-bottom: 16px;">
                    <label>Sản Phẩm</label>
                    <textarea v-model="formData.PRODUCT_NAME" class="form-control" rows="2"></textarea>
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
                      <label>Localization</label>
                      <input type="text" v-model="formData.LOCALIZATION" class="form-control" />
                    </div>
                    <div class="form-group">
                      <label>Nhà Sản Xuất</label>
                      <input type="text" v-model="formData.NHA_SAN_XUAT" class="form-control" />
                    </div>
                  </div>
                  

                </div>

                <div class="modal-section">
                  <h4 class="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Thời Gian & Hiệu Lực
                  </h4>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Ngày Cấp (Date)</label>
                      <input type="text" v-model="formData.DATE_OF_LICENSE" class="form-control" />
                    </div>
                    <div class="form-group">
                      <label>Hết Hạn (Expiration)</label>
                      <input type="text" v-model="formData.EXPIRATION_TIME" class="form-control" />
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Trạng thái gia hạn</label>
                      <select v-model="formData.IS_GIA_HAN" class="form-control">
                        <option value="">Chưa có / Trống</option>
                        <option value="Không gia hạn">Không gia hạn</option>
                        <option value="Đã gia hạn">Đã gia hạn</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Số ngày hiệu lực (sau hết hạn)</label>
                      <input type="number" v-model="editGraceDays" class="form-control" placeholder="VD: 10" />
                      <small v-if="editGraceDays && formData.EXPIRATION_TIME" style="color: #f59e0b; margin-top: 4px;">→ Hiệu lực đến: {{ calcGraceDate(formData.EXPIRATION_TIME, editGraceDays) }}</small>
                    </div>
                  </div>
                </div>

                <div class="modal-section" style="margin-bottom: 0;">
                  <h4 class="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Dữ liệu thô từ ảnh
                  </h4>
                  <div class="form-group">
                    <textarea readonly :value="rawOcrText" class="form-control" rows="3" style="font-size: 0.8rem; background: #0f172a; color: #94a3b8;"></textarea>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div v-if="errorMsg" class="error-msg">
          {{ errorMsg }}
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')" :disabled="saving">Hủy</button>
        <button v-if="scanComplete" class="btn-save" @click="saveData" :disabled="saving">
          <span v-if="saving" class="spinner"></span>
          <span v-else>Lưu Dữ Liệu</span>
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
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import Tesseract from 'tesseract.js'
import AsyncConfirmModal from './AsyncConfirmModal.vue'

const asyncModal = ref({ show: false, type: 'confirm', title: '', msg: '', confirmText: 'Đồng ý', cancelText: 'Hủy' })
let confirmResolve = null
const confirmAction = (title, msg, confirmText) => {
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

const emit = defineEmits(['close', 'import-success'])
const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

const fileInput = ref(null)
const selectedFile = ref(null)
const previewImageUrl = ref('')
const scanning = ref(false)
const scanComplete = ref(false)
const scanProgress = ref(0)
const errorMsg = ref('')
const saving = ref(false)
const editGraceDays = ref(30)

const rawOcrText = ref('')
const formData = ref({
  LICENSE_ID: '',
  CUSTOMER: '',
  PRODUCT_NAME: '',
  LOCALIZATION: '',
  LICENSE_VOLUME: '',
  LICENSE_DESCRIPTION: '',
  DATE_OF_LICENSE: '',
  EXPIRATION_TIME: '',
  LICENSE_TYPE: '',
  PRODUCT_CODE: '',
  LINK_FILE: '',
  NAME_FILE: '',
  SO_NGAY_HIEU_LUC: '',
  NHA_SAN_XUAT: ''
})

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleDrop = (e) => {
  const files = e.dataTransfer.files
  if (files && files.length > 0 && files[0].type.startsWith('image/')) {
    processImage(files[0])
  } else {
    errorMsg.value = 'Vui lòng chọn file hình ảnh hợp lệ.'
  }
}

const handleFileUpload = (e) => {
  const files = e.target.files
  if (files && files.length > 0) {
    processImage(files[0])
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

const processImage = async (file) => {
  selectedFile.value = file
  errorMsg.value = ''
  
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value)
  }
  previewImageUrl.value = URL.createObjectURL(file)
  
  scanning.value = true
  scanProgress.value = 0
  
  try {
    const ocrPromise = Tesseract.recognize(file, 'eng+vie', {
      logger: m => {
        if (m.status === 'recognizing text') {
          scanProgress.value = m.progress
        }
      }
    })
    
    const uploadPromise = uploadCloudinary(file)
    
    const [result, url] = await Promise.all([ocrPromise, uploadPromise])
    
    rawOcrText.value = result.data.text
    parseOCRText(result.data.text)
    
    formData.value.NAME_FILE = file.name
    formData.value.LINK_FILE = url
    scanComplete.value = true
  } catch (err) {
    console.error('OCR Error:', err)
    errorMsg.value = 'Lỗi trong quá trình quét ảnh. Vui lòng thử lại với ảnh rõ nét hơn.'
  } finally {
    scanning.value = false
  }
}

const formatDateString = (dateStr) => {
  if (!dateStr) return '';
  dateStr = dateStr.trim();
  
  // Format yyyy-MM-dd hoặc yyyy.MM.dd
  let match = dateStr.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
  if (match) {
    return `${match[3].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[1]}`;
  }
  
  // Format dd/mm/yyyy hoặc mm/dd/yyyy
  match = dateStr.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);
  if (match) {
    let p1 = parseInt(match[1]);
    let p2 = parseInt(match[2]);
    let y = match[3];
    let d, m;
    
    if (p1 > 12) { d = p1; m = p2; }
    else if (p2 > 12) { d = p2; m = p1; }
    else { d = p1; m = p2; } // Default to dd/mm
    
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  }
  
  // Text format like "May 29, 2026"
  const parsedDate = new Date(dateStr);
  if (!isNaN(parsedDate.getTime())) {
    const d = String(parsedDate.getDate()).padStart(2, '0');
    const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const y = parsedDate.getFullYear();
    return `${d}/${m}/${y}`;
  }
  
  return dateStr;
}

const calcGraceDate = (dateStr, days) => {
  if (!dateStr) return ''
  const parts = dateStr.split('/')
  if (parts.length !== 3) return ''
  const d = new Date(parts[2], parts[1] - 1, parts[0])
  if (isNaN(d.getTime())) return ''
  d.setDate(d.getDate() + parseInt(days))
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

const parseOCRText = (text) => {
  // Khởi tạo rỗng
  Object.keys(formData.value).forEach(k => {
    if(k !== 'LINK_FILE' && k !== 'NAME_FILE') formData.value[k] = ''
  })
  
  const lowerText = text.toLowerCase()
  
  // Xử lý Kaspersky Format
  if (lowerText.includes('license id') || lowerText.includes('date of license')) {
    formData.value.NHA_SAN_XUAT = 'Kaspersky'
    const lines = text.split('\n').map(l => l.trim()).filter(l => l)
    
    let currentField = ''
    let customerText = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lower = line.toLowerCase()

      if (lower.startsWith('license id:')) {
        formData.value.LICENSE_ID = line.replace(/license id:/i, '').trim()
        currentField = 'LICENSE_ID'
      } else if (lower.startsWith('customer:')) {
        customerText.push(line.replace(/customer:/i, '').trim())
        currentField = 'CUSTOMER'
      } else if (lower.startsWith('product name')) {
        formData.value.PRODUCT_NAME = line.replace(/product name/i, '').trim()
        currentField = 'PRODUCT_NAME'
      } else if (lower.startsWith('localization')) {
        formData.value.LOCALIZATION = line.replace(/localization/i, '').trim()
        currentField = 'LOCALIZATION'
      } else if (lower.startsWith('license description')) {
        formData.value.LICENSE_VOLUME = line.replace(/license description/i, '').trim()
        currentField = 'LICENSE_VOLUME'
      } else if (lower.startsWith('date of license')) {
        formData.value.DATE_OF_LICENSE = formatDateString(line.replace(/date of license/i, '').replace(':', '').trim())
        currentField = 'DATE_OF_LICENSE'
      } else if (lower.startsWith('expiration time')) {
        formData.value.EXPIRATION_TIME = formatDateString(line.replace(/expiration time/i, '').replace(':', '').trim())
        currentField = 'EXPIRATION_TIME'
      } else if (lower.startsWith('license type')) {
        formData.value.LICENSE_TYPE = line.replace(/license type/i, '').trim()
        currentField = 'LICENSE_TYPE'
      } else if (lower.startsWith('product code')) {
        formData.value.PRODUCT_CODE = line.replace(/product code/i, '').trim()
        currentField = 'PRODUCT_CODE'
      } else {
        if (currentField === 'CUSTOMER') {
          customerText.push(line)
        }
      }
    }
    formData.value.CUSTOMER = customerText.join(' ')
  } 
  // Xử lý Sophos Format (hoặc format ngang khác)
  else {
    formData.value.NHA_SAN_XUAT = 'Sophos'
    const dateRegex = /\d{2}\/\d{2}\/\d{4}/g
    const dates = text.match(dateRegex)
    if (dates && dates.length >= 2) {
      formData.value.DATE_OF_LICENSE = formatDateString(dates[0])
      formData.value.EXPIRATION_TIME = formatDateString(dates[1])
    } else if (dates && dates.length === 1) {
      formData.value.EXPIRATION_TIME = formatDateString(dates[0])
    }
    
    const volMatch = text.match(/(\d+)\s*USERS?/i)
    if (volMatch) {
      formData.value.LICENSE_VOLUME = volMatch[0]
    }
    
    // Tìm các chuỗi như 1N1002197680
    const idMatch = text.match(/\b\d[A-Z]\d{8,}\b/i)
    if (idMatch) {
      formData.value.LICENSE_ID = idMatch[0]
    }
    
    formData.value.PRODUCT_NAME = 'Sophos'
  }
}

const saveData = async () => {
  const userConfirmed = await confirmAction('Lưu dữ liệu', 'Bạn có chắc chắn muốn lưu dữ liệu chứng nhận này?', 'Lưu');
  if (!userConfirmed) return;

  saving.value = true
  errorMsg.value = ''
  asyncModal.value = { show: true, type: 'loading', title: 'Đang xử lý...', msg: 'Đang lưu dữ liệu lên server...' }
  
  try {
    if (editGraceDays.value && formData.value.EXPIRATION_TIME) {
      formData.value.SO_NGAY_HIEU_LUC = calcGraceDate(formData.value.EXPIRATION_TIME, editGraceDays.value) || formData.value.SO_NGAY_HIEU_LUC;
    } else if (formData.value.EXPIRATION_TIME && !formData.value.SO_NGAY_HIEU_LUC) {
      formData.value.SO_NGAY_HIEU_LUC = calcGraceDate(formData.value.EXPIRATION_TIME, 30)
    }

    const payload = {
      sheet: 'license_old_data',
      action: 'add',
      ...formData.value
    }
    
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    
    const result = await response.json()
    if (result.status === 'success') {
      asyncModal.value = { show: true, type: 'success', title: 'Thành công!', msg: 'Đã lưu dữ liệu' }
      setTimeout(() => {
        asyncModal.value.show = false
        emit('import-success')
        emit('close')
      }, 1500)
    } else {
      console.error('Server error:', result)
      errorMsg.value = result.message || result.error || 'Có lỗi xảy ra khi lưu dữ liệu lên server.'
      asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: errorMsg.value }
    }
  } catch (err) {
    console.error(err)
    errorMsg.value = 'Lỗi kết nối đến máy chủ.'
    asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: errorMsg.value }
  } finally {
    saving.value = false
  }
}

onUnmounted(() => {
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value)
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  width: 95%;
  max-width: 1000px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-height: 95vh;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

.btn-close:hover {
  color: #ef4444;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.text-muted {
  color: #64748b;
  margin: 0 0 16px 0;
  font-size: 0.95rem;
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 48px;
  text-align: center;
  cursor: pointer;
  background: #f8fafc;
  transition: all 0.2s;
}

.upload-area:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.upload-area p {
  margin: 16px 0 0 0;
  color: #64748b;
  font-size: 1.1rem;
}

.upload-area p strong {
  color: #0ea5e9;
}

.scanning-section {
  text-align: center;
  padding: 20px 0;
}

.scanner-anim {
  position: relative;
  display: inline-block;
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.scanning-img {
  display: block;
  width: 100%;
  height: auto;
  opacity: 0.7;
}

.scanner-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: #0ea5e9;
  box-shadow: 0 0 10px #0ea5e9, 0 0 20px #0ea5e9;
  animation: scan 2s linear infinite;
  z-index: 2;
}

@keyframes scan {
  0% { top: 0; }
  50% { top: 100%; }
  100% { top: 0; }
}

.progress-container {
  margin-top: 24px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.progress-container p {
  margin: 0 0 8px 0;
  color: #334155;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #0ea5e9;
  transition: width 0.3s ease;
}

.result-layout {
  display: flex;
  gap: 24px;
}

.image-preview-panel {
  flex: 1;
  min-width: 300px;
}

.form-panel {
  flex: 2;
}

.result-layout h4 {
  margin: 0 0 16px 0;
  color: #334155;
  font-size: 1.1rem;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.result-img {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.license-form {
  display: flex;
  flex-direction: column;
}

.modal-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  color: #0ea5e9;
  margin-top: 0;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #cbd5e1;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #ffffff;
  background-color: #1e293b;
  outline: none;
  font-family: inherit;
}

.form-control:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
}

.error-msg {
  margin-top: 16px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 6px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 8px 16px;
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel:hover {
  background: #f8fafc;
}

.btn-save {
  padding: 8px 24px;
  background: #0ea5e9;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.btn-save:hover:not(:disabled) {
  background: #0284c7;
}

.btn-save:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .result-layout {
    flex-direction: column;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .modal-container {
    width: 100vw !important;
    height: 100vh !important;
    max-height: 100vh !important;
    max-width: 100vw !important;
    border-radius: 0 !important;
    margin: 0 !important;
    animation: slideRight 0.3s ease-out forwards;
  }
}

@keyframes slideRight {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
</style>
