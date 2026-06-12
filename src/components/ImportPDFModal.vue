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
          <p class="text-muted">Tải lên hoặc kéo thả nhiều file PDF certificate (Kaspersky, Sophos, Acronis). Hỗ trợ Dán file (Ctrl+V).</p>
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
            <div class="pdf-icon-scanning">📄</div>
          </div>
          <div class="progress-container">
            <p>Đang phân tích dữ liệu PDF... {{ Math.round(scanProgress * 100) }}%</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${scanProgress * 100}%` }"></div>
            </div>
          </div>
        </div>

        <div class="result-section" v-if="scanComplete">
          <div class="forms-container">
            <h4>Dữ liệu trích xuất (Phát hiện {{ formDatas.length }} mặt hàng)</h4>
            <div class="forms-scroll-container">
              <div class="form-card" v-for="(formData, index) in formDatas" :key="index">
                <div class="form-card-header">
                  <h5>Mặt Hàng #{{ index + 1 }} <span class="file-badge" v-if="formData.NAME_FILE">{{ formData.NAME_FILE }}</span></h5>
                  <button class="btn-remove-item" @click="removeItem(index)">&times;</button>
                </div>
                
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

                  <div class="modal-section" style="margin-bottom: 0;">
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
                        <input type="number" v-model="formData._editGraceDays" class="form-control" placeholder="VD: 10" />
                        <small v-if="formData._editGraceDays && formData.EXPIRATION_TIME" style="color: #f59e0b; margin-top: 4px;">→ Hiệu lực đến: {{ calcGraceDate(formData.EXPIRATION_TIME, formData._editGraceDays) }}</small>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <button class="btn-add-item" @click="addNewItem">+ Thêm mặt hàng thủ công</button>
          </div>
        </div>
        
        <div v-if="errorMsg" class="error-msg">
          {{ errorMsg }}
        </div>
      </div>
      
      <div class="modal-footer" v-if="scanComplete && formDatas.length > 0">
        <button class="btn-secondary" @click="$emit('close')">Hủy</button>
        <button class="btn-primary" @click="saveData" :disabled="saving">
          <span v-if="saving" class="spinner-small"></span>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.js?url'
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

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const emit = defineEmits(['close', 'import-success'])
const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

const fileInput = ref(null)
const scanning = ref(false)
const scanComplete = ref(false)
const scanProgress = ref(0)
const errorMsg = ref('')
const saving = ref(false)

const formDatas = ref([])

const getEmptyForm = () => ({
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
  NAME_FILE: '',
  LINK_FILE: '',
  SO_NGAY_HIEU_LUC: '',
  NHA_SAN_XUAT: '',
  IS_GIA_HAN: '',
  _editGraceDays: 30,
  _file: null // Để chứa file object tạm thời
})

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

onMounted(() => {
  window.addEventListener('paste', handlePaste)
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
      let arrayBuffer;
      if (typeof file.arrayBuffer === 'function') {
        arrayBuffer = await file.arrayBuffer()
      } else {
        arrayBuffer = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(file);
        });
      }
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

const pushForms = (tempForms, file) => {
  if (tempForms.length === 0) {
    tempForms.push(getEmptyForm())
  }
  tempForms.forEach(f => {
    f._file = file
    f.NAME_FILE = file ? file.name : ''
    f.LINK_FILE = '' // Để trống, upload khi bấm lưu
    if (f.EXPIRATION_TIME && !f.SO_NGAY_HIEU_LUC) {
      f.SO_NGAY_HIEU_LUC = calcGraceDate(f.EXPIRATION_TIME, 30)
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
    formData.NHA_SAN_XUAT = 'Kaspersky'
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
      formData.NHA_SAN_XUAT = 'Sophos'
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
        formData.NHA_SAN_XUAT = 'Sophos'
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
    formData.NHA_SAN_XUAT = 'Acronis'
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
  
  pushForms(tempForms, file)
}

const saveData = async () => {
  const userConfirmed = await confirmAction('Lưu dữ liệu', 'Bạn có chắc chắn muốn lưu các dữ liệu PDF này?', 'Lưu');
  if (!userConfirmed) return;

  saving.value = true
  errorMsg.value = ''
  asyncModal.value = { show: true, type: 'loading', title: 'Đang xử lý...', msg: 'Đang lưu dữ liệu lên server...' }

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
      asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: errorMsg.value }
      return
    }

    // 2. Gắn LINK_FILE vào từng formData và submit data to Google Sheets
    const promises = formDatas.value.map(formData => {
      if (formData._file) {
        formData.LINK_FILE = uniqueFilesMap.get(formData._file.name).url
      }
      if (formData._editGraceDays && formData.EXPIRATION_TIME) {
        formData.SO_NGAY_HIEU_LUC = calcGraceDate(formData.EXPIRATION_TIME, formData._editGraceDays) || formData.SO_NGAY_HIEU_LUC
      } else if (formData.EXPIRATION_TIME && !formData.SO_NGAY_HIEU_LUC) {
        formData.SO_NGAY_HIEU_LUC = calcGraceDate(formData.EXPIRATION_TIME, 30)
      }
      
      const payload = {
        sheet: 'license_old_data',
        action: 'add',
        ...formData
      }
      delete payload._file // Xóa _file gốc khỏi payload gửi đi
      delete payload._editGraceDays // Xóa thuộc tính tạm thời
      
      return fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      }).then(r => r.json())
    })
    
    const results = await Promise.all(promises)
    const hasError = results.some(r => r.status !== 'success')
    
    if (!hasError) {
      asyncModal.value = { show: true, type: 'success', title: 'Thành công!', msg: 'Đã lưu tất cả dữ liệu' }
      setTimeout(() => {
        asyncModal.value.show = false
        emit('import-success')
        emit('close')
      }, 1500)
    } else {
      errorMsg.value = 'Có lỗi xảy ra khi lưu một số mặt hàng.'
      asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: errorMsg.value }
    }
  } catch (err) {
    console.error('Save error:', err)
    errorMsg.value = 'Lỗi kết nối khi lưu dữ liệu. Vui lòng thử lại.'
    asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: errorMsg.value }
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
  border-radius: 12px;
  width: 95%;
  max-width: 1400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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

.forms-container {
  min-width: 0;
}

.forms-container h4 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 1.1rem;
}

.forms-scroll-container {
  display: flex;
  overflow-x: auto;
  gap: 24px;
  padding-bottom: 16px;
  width: 100%;
  align-items: flex-start;
}

.form-card {
  min-width: 450px;
  flex: 0 0 auto;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
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

.modal-section {
  background: white;
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
  color: #3b82f6;
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  .forms-scroll-container {
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: visible;
  }
  .form-card {
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
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
