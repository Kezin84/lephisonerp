<template>
  <div class="po-preview-container">
    <div class="header-actions">
      <h2>Danh sách PO đã Import</h2>
      <div class="upload-btn-wrapper">
        <button class="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Import File PO
        </button>
        <input type="file" accept=".xlsx, .xls" multiple @change="handleFileUpload" />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang đọc file...</p>
    </div>

    <div v-else-if="importedRecords.length > 0" class="records-container">
      <div v-for="(rec, index) in importedRecords" :key="index" class="record-wrapper">
        <!-- File Header -->
        <div class="file-header-bar">
          <span class="file-name">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            File: {{ rec._fileName }}
          </span>
          <button class="btn-save" @click="saveRecord(rec, index)" :disabled="rec._saved || saving" title="Lưu vào hệ thống">
            <svg v-if="saving && savingIndex === index" class="spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2 2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            {{ rec._saved ? 'Đã lưu ✓' : 'Lưu' }}
          </button>
          <button class="btn-delete" @click="removeRecord(index)" title="Xóa file này">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            Xóa
          </button>
        </div>

        <!-- Sections Grid 2 columns -->
        <div class="sections-grid">
          <div v-for="(sec, sIndex) in tableSections" :key="'sec'+index+'-'+sIndex" class="section-card" :class="{'section-vertical': sec.vertical}" :style="sec.span ? { gridColumn: 'span ' + sec.span } : {}">
            <div class="section-card-title">{{ sec.name }}</div>
            <div class="section-card-body">
              <div v-for="col in sec.columns" :key="col.key" class="data-item">
                <span class="data-label">{{ col.label }}:</span>
                <span class="data-value">{{ rec[col.key] || '---' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Detail Card -->
        <div class="product-card">
          <div class="product-card-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            <span>8. CHI TIẾT MUA HÀNG</span>
            <span class="product-badge" v-if="rec.products && rec.products.length">{{ rec.products.length }} sản phẩm</span>
          </div>
          <div class="product-table-wrapper" v-if="rec.products && rec.products.length > 0">
            <table class="product-table">
              <colgroup>
                <col v-for="col in rec.flatCols" :key="'col-'+col.key" :style="{ width: getColWidth(col) }">
              </colgroup>
              <thead>
                <tr>
                  <template v-for="(group, gi) in rec.headerGroups" :key="'g1-'+gi">
                    <th v-if="group.standalone" :rowspan="2" class="th-base">{{ group.cols[0].label }}</th>
                    <th v-else :colspan="group.cols.length" class="th-brand" :style="{ background: brandColor(group.brand).bg, color: brandColor(group.brand).text }">{{ group.brand }}</th>
                  </template>
                </tr>
                <tr>
                  <template v-for="(group, gi) in rec.headerGroups" :key="'g2-'+gi">
                    <template v-if="!group.standalone">
                      <th v-for="col in group.cols" :key="'sub-'+col.key" class="th-sub" :style="{ background: brandColor(group.brand).subBg, borderBottomColor: brandColor(group.brand).border }">{{ col.label }}</th>
                    </template>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(prod, pIdx) in rec.products" :key="'tr-'+pIdx">
                  <td v-for="col in rec.flatCols" :key="'td-'+col.key"
                      :class="{
                        'col-stt': col.label === 'STT',
                        'col-name': col.label.includes('Tên hàng'),
                        'col-number': ['sl','đơn giá','thành tiền','mức off'].some(n => col.label.toLowerCase().includes(n))
                      }"
                      :style="col.brand && prod[col.key] && prod[col.key] !== 'x' && String(prod[col.key]).trim() !== '' ? { background: brandColor(col.brand).cellBg } : {}">
                    {{ prod[col.key] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-products">
            Không tìm thấy chi tiết mua hàng trong file {{ rec._fileName }}.
          </div>
          <div v-if="rec.ghiChu" class="product-note">
            <strong>Ghi chú khác:</strong>
            <p>{{ rec.ghiChu }}</p>
          </div>
        </div>

        <!-- Deal Registration Preview Cards -->
        <div class="dealreg-grid">
          <div v-for="(dr, di) in getDealRegs(rec)" :key="'dr-'+di" class="dealreg-card">
            <table class="dr-table">
              <tbody>
              <!-- Deal Registration Form -->
              <tr class="dr-title-row"><td colspan="4"><strong>Deal Registration Form</strong></td></tr>
              <tr>
                <td class="dr-label-cyan">End user Company Name*:</td>
                <td class="dr-value">{{ rec.CUS_COMPANY || '' }}</td>
                <td class="dr-label-blue-italic">End User Name*<br><small>(First, Last Name)</small>:</td>
                <td class="dr-value">{{ rec.CUS_CONTACT || '' }}</td>
              </tr>
              <tr>
                <td class="dr-label">End user Company Name <span style="color:#FF0000">Vietnamese: *</span></td>
                <td class="dr-value">{{ rec.INV_CONG_TY || '' }}</td>
                <td class="dr-label">End User Email:</td>
                <td class="dr-value">{{ rec.CUS_EMAIL || '' }}</td>
              </tr>
              <tr>
                <td class="dr-label" rowspan="2">Company Address*:</td>
                <td class="dr-value" rowspan="2">{{ rec.CUS_ADDRESS || '' }}</td>
                <td class="dr-label-navy">End User Phone*:</td>
                <td class="dr-value">{{ rec.CUS_MOBILE || '' }}</td>
              </tr>
              <tr>
                <td class="dr-label-navy">End User Website*:</td>
                <td class="dr-value">{{ rec.CUS_WEBSITE || '' }}</td>
              </tr>
              <tr>
                <td class="dr-label">Country*:</td>
                <td class="dr-value">VIET NAM</td>
                <td class="dr-label-black">Existing Sophos Customer?</td>
                <td class="dr-value"></td>
              </tr>
              <tr>
                <td class="dr-label-italic">Company Size*<br><small>(no. of employees)</small>:</td>
                <td class="dr-value"></td>
                <td class="dr-label-black">Estimated Customer Budget<br><small>(in USD)</small>:</td>
                <td class="dr-value"></td>
              </tr>
              <tr>
                <td class="dr-label-italic">Estimated Closure Date<br><small>(DD/MM/YYYY)</small>:*</td>
                <td class="dr-value"></td>
                <td class="dr-label-black">Competition:*</td>
                <td class="dr-value"></td>
              </tr>
              <tr>
                <td class="dr-label-black">Proposed POC Schedule:</td>
                <td class="dr-value"></td>
                <td class="dr-label"></td>
                <td class="dr-value"></td>
              </tr>

              <!-- Partner Information -->
              <tr class="dr-title-row"><td colspan="4"><strong>Partner Information</strong></td></tr>
              <tr>
                <td class="dr-label">Partner Company Name*:</td>
                <td class="dr-value">Nam Truong Son System Integration Corp</td>
                <td class="dr-label">Account Manager Email*:</td>
                <td class="dr-value">sonlp@nts.com.vn</td>
              </tr>
              <tr>
                <td class="dr-label">Partner Address:*</td>
                <td class="dr-value">55/10 Trần Đình Xu, Phường Cầu Kho, Quận 1, Thành phố Hồ Chí Minh, Việt Nam</td>
                <td class="dr-label"></td>
                <td class="dr-value"></td>
              </tr>
              <tr>
                <td class="dr-label-blue-italic">Account Manager Name*<br><small>(First, Last Name)</small>:</td>
                <td class="dr-value">LÊ PHI SƠN</td>
                <td class="dr-label">Account Manager <span style="color:#FF0000">Phone*</span></td>
                <td class="dr-value">090 8137488</td>
              </tr>

              <!-- Remarks -->
              <tr class="dr-title-row"><td colspan="4"><strong><em>Remarks</em></strong><br><em style="font-weight:400;font-size:9pt;color:#000">(Any comments/ details/ requirements/ project name / tender specifications and etc. For government bids, its mandatory to indicate project name, procuring entity, project background/used case e.g. if one lot.)</em></td></tr>
              <tr><td colspan="4" class="dr-remarks"></td></tr>

              <!-- Bill of Materials -->
              <tr class="dr-title-row"><td colspan="4"><strong>Bill of Materials</strong></td></tr>
              <tr class="bom-header-row">
                <td colspan="2"><strong>SKU / Product / Description*</strong></td>
                <td><strong>Qty*</strong></td>
                <td><strong>Estimated Value (USD)</strong></td>
              </tr>
              <tr v-for="(item, ii) in dr.items" :key="'bom-'+ii">
                <td colspan="2">{{ item.name }}</td>
                <td class="bom-qty">{{ item.qty }}</td>
                <td class="bom-val">{{ item.value }}</td>
              </tr>
              <tr class="bom-total-row">
                <td colspan="2"><strong>TOTAL</strong></td>
                <td></td>
                <td class="bom-val"><strong>{{ dr.total.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</strong></td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <div v-else class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
      <p>Vui lòng import file Excel mẫu (form_mau) để xem thông tin PO / Đơn hàng được chia thành phần chuẩn.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx-js-style'

const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

const importedRecords = ref([])
const loading = ref(false)
const saving = ref(false)
const savingIndex = ref(-1)

const brandColors = {
  'Sophos':    { bg: '#1B4F72', text: '#fff', subBg: '#D4E6F1', border: '#1B4F72', cellBg: '#EBF5FB' },
  'Kaspersky': { bg: '#1E8449', text: '#fff', subBg: '#D5F5E3', border: '#1E8449', cellBg: '#EAFAF1' },
  'Khác':      { bg: '#7D3C98', text: '#fff', subBg: '#E8DAEF', border: '#7D3C98', cellBg: '#F5EEF8' },
}
const defaultBrand = { bg: '#0f172a', text: '#fff', subBg: '#f1f5f9', border: '#94a3b8', cellBg: '#fafbfc' }

const brandColor = (name) => {
  if (!name) return defaultBrand
  for (const [key, val] of Object.entries(brandColors)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return val
  }
  return defaultBrand
}

const tableSections = [
  {
    name: '1. THÔNG TIN PO/HĐ',
    columns: [
      { key: 'STT_B2', label: 'STT' },
      { key: 'TEN_C2', label: 'TÊN' },
      { key: 'DO_UU_TIEN', label: 'Độ ưu tiên' },
    ]
  },
  {
    name: '2. TRẠNG THÁI ĐƠN HÀNG',
    columns: [
      { key: 'TRANG_THAI', label: 'Trạng thái đơn hàng' }
    ]
  },
  {
    name: '3. KHÁCH HÀNG NHẬN LICENSE (TIẾNG ANH)',
    vertical: true,
    span: 3,
    columns: [
      { key: 'CUS_COMPANY', label: 'Company' },
      { key: 'CUS_ADDRESS', label: 'Address' },
      { key: 'CUS_TEL', label: 'Tel' },
      { key: 'CUS_FAX', label: 'Fax' },
      { key: 'CUS_CONTACT', label: 'Contact' },
      { key: 'CUS_EMAIL', label: 'Email' },
      { key: 'CUS_MOBILE', label: 'Mobile' },
      { key: 'CUS_WEBSITE', label: 'Website' },
    ]
  },
  {
    name: '4. THÔNG TIN XUẤT HÓA ĐƠN, CHỨNG TỪ KHÁC',
    vertical: true,
    span: 3,
    columns: [
      { key: 'INV_CONG_TY', label: 'Công ty' },
      { key: 'INV_DIA_CHI', label: 'Địa chỉ' },
      { key: 'INV_MST', label: 'MST' },
      { key: 'INV_EMAIL', label: 'Email' },
      { key: 'INV_THANH_LY', label: 'Thanh lý' },
      { key: 'INV_DN_THANH_TOAN', label: 'ĐN thanh toán' },
      { key: 'INV_COCQ', label: 'CO/CQ' },
    ]
  },
  {
    name: '5. THÔNG TIN GIAO HÀNG TRIỂN KHAI',
    vertical: true,
    span: 2,
    columns: [
      { key: 'DEL_M1', label: 'Giao hàng và hóa đơn ngay khi có hàng' },
      { key: 'DEL_M2', label: 'Giao hàng và có kỹ thuật triển khai dự án' },
      { key: 'DEL_M3', label: 'Liên hệ Kinh Doanh trước khi giao hàng' }
    ]
  },
  {
    name: '6. LIÊN HỆ GIAO HÀNG',
    vertical: true,
    span: 2,
    columns: [
      { key: 'DEL_NGUOI_NHAN', label: 'Người nhận hàng' },
      { key: 'DEL_DIA_CHI', label: 'Địa chỉ' },
      { key: 'DEL_SDT', label: 'Số điện thoại' },
      { key: 'DEL_NGUOI_LIEN_HE', label: 'Người liên hệ triển khai' },
    ]
  },
  {
    name: '7. THÔNG TIN THANH TOÁN',
    vertical: true,
    span: 2,
    columns: [
      { key: 'PAY_NGAY_COC', label: 'Ngày đặt cọc' },
      { key: 'PAY_TI_LE_COC', label: 'Tỉ lệ đặt cọc (%)' },
      { key: 'PAY_CONG_NO', label: 'Công nợ (ngày)' },
      { key: 'PAY_NGAY_CO_HANG', label: 'Ngày có hàng dự kiến' },
    ]
  }
]

const extractRecord = (poData, dhData, fileName) => {
  let record = { _fileName: fileName }
  
  tableSections.forEach(sec => {
    if (!sec.isTable) {
      sec.columns.forEach(col => record[col.key] = '')
    }
  })

  let infoData = poData.length > 0 ? poData : dhData

  const row1 = infoData[1] || []
  record['STT_B2'] = row1[1] || ''
  record['TEN_C2'] = row1[2] || ''

  const row2 = infoData[2] || []
  if ((row2[1] || '').toString().includes('Độ ưu tiên')) {
    record['DO_UU_TIEN'] = row2[2] !== undefined ? row2[2] : ''
  }

  for (let r = 0; r < infoData.length; r++) {
    let row = infoData[r]
    if (!row) continue

    let label1 = (row[0] || row[1] || '').toString().trim()
    let val1 = row[2] !== undefined ? row[2] : ''
    if (row[0] && row[1] && row[0] !== label1) val1 = row[1]

    if (label1.includes('Company')) record['CUS_COMPANY'] = val1
    if (label1.includes('Address')) record['CUS_ADDRESS'] = val1
    if (label1.includes('Tel')) record['CUS_TEL'] = val1
    if (label1 === 'Fax') record['CUS_FAX'] = val1
    if (label1.includes('Contact')) record['CUS_CONTACT'] = val1
    if (label1.includes('Email')) {
      if (r < 13) record['CUS_EMAIL'] = val1
      else record['INV_EMAIL'] = val1
    }
    if (label1 === 'Mobile') record['CUS_MOBILE'] = val1
    if (label1 === 'Website') record['CUS_WEBSITE'] = val1

    if (label1.includes('Công ty')) record['INV_CONG_TY'] = val1
    if (label1 === 'Địa chỉ (*)' || label1 === 'Địa chỉ') {
      if (r > 12) record['INV_DIA_CHI'] = val1
    }
    if (label1.includes('MST')) record['INV_MST'] = val1
    if (label1 === 'Thanh lý') record['INV_THANH_LY'] = val1
    if (label1.includes('ĐN thanh toán')) record['INV_DN_THANH_TOAN'] = val1
    if (label1.includes('CO/CQ')) record['INV_COCQ'] = val1

    let label2 = (row[3] || row[4] || '').toString().trim()
    let val2 = row[5] !== undefined ? row[5] : ''
    if (row[3] && row[4] && row[3] !== label2) val2 = row[4]

    // Xử lý 3 mục giao hàng (Checkbox)
    let optionText = (row[5] || '').toString().trim()
    let optionValue = (row[4] !== undefined && row[4] !== null) ? row[4].toString().trim() : ''
    if (!optionValue && row[3]) optionValue = row[3].toString().trim()
    
    if (optionText.includes('hóa đơn ngay khi có hàng')) record['DEL_M1'] = optionValue
    if (optionText.includes('kỹ thuật triển khai')) record['DEL_M2'] = optionValue
    if (optionText.includes('Liên hệ Kinh Doanh trước khi giao hàng')) record['DEL_M3'] = optionValue

    if (label2.includes('Người nhận hàng')) record['DEL_NGUOI_NHAN'] = val2
    if (label2 === 'Địa chỉ (*)' || label2 === 'Địa chỉ') {
      if (r < 12) record['DEL_DIA_CHI'] = val2
    }
    if (label2.includes('Số điện thoại')) record['DEL_SDT'] = val2
    if (label2.includes('Người liên hệ triển khai')) record['DEL_NGUOI_LIEN_HE'] = val2

    if (label2.includes('Ngày đặt cọc')) record['PAY_NGAY_COC'] = val2
    if (label2.includes('Tỉ lệ đặt cọc')) record['PAY_TI_LE_COC'] = val2
    if (label2.includes('Công nợ')) record['PAY_CONG_NO'] = val2
    if (label2.includes('Ngày có hàng dự kiến')) record['PAY_NGAY_CO_HANG'] = val2
    if (label2.includes('Trạng thái đơn hàng')) record['TRANG_THAI'] = val2
  }

  // Khai thác bảng sản phẩm
  let productStartIndex = -1
  let headerRow = []
  let prodData = dhData.length > 0 ? dhData : poData

  for (let r = 0; r < prodData.length; r++) {
    let row = prodData[r] || []
    let rowStr = row.map(c => (c || '').toString().toLowerCase().replace(/\s+/g, '')).join('|')
    if ((rowStr.includes('tênhàng') || rowStr.includes('tênsảnphẩm')) &&
        (rowStr.includes('stt') || rowStr.includes('mãsku') || rowStr.includes('đơngiá') || rowStr.includes('|sl|'))) {
      productStartIndex = r
      headerRow = row
      break
    }
  }

  let products = []
  let headerGroups = []
  let flatCols = []

  if (productStartIndex !== -1) {
    // Read brand row (one row above header)
    let brandRow = productStartIndex > 0 ? prodData[productStartIndex - 1] || [] : []

    // Build brand spans from brand row
    let brandStarts = []
    for (let c = 0; c < brandRow.length; c++) {
      let v = (brandRow[c] || '').toString().trim()
      if (v && !v.toLowerCase().includes('phần dành cho') && !v.toLowerCase().includes('kinh doanh')) {
        brandStarts.push({ brand: v, startCol: c })
      }
    }

    // Determine brand for a column index
    const getBrand = (idx) => {
      let b = ''
      for (let bs of brandStarts) {
        if (idx >= bs.startCol) b = bs.brand
        else break
      }
      return b
    }

    // Build flat column list
    let maxC = Math.max(headerRow.length, brandRow.length)
    let seenKeys = new Set()
    for (let c = 0; c < maxC; c++) {
      let sub = (headerRow[c] || '').toString().trim().replace(/\r?\n/g, ' ')
      let br = (brandRow[c] || '').toString().trim()

      let label = sub
      let brand = ''

      if (sub) {
        brand = getBrand(c)
        if (brand === sub) brand = '' // e.g. "Ghi Chú" on both rows
      } else if (br && !br.toLowerCase().includes('phần dành cho')) {
        label = br
        brand = ''
      } else {
        continue
      }

      if (label.toLowerCase().includes('list price')) {
        label = 'List Price'
      }

      let key = brand ? `${brand}::${label}` : label
      let orig = key; let d = 1
      while (seenKeys.has(key)) { key = `${orig}_${d}`; d++ }
      seenKeys.add(key)

      flatCols.push({ key, label, brand, colIdx: c })
    }

    // Đảm bảo List Price nằm sau SL
    let slIndex = flatCols.findIndex(c => c.label === 'SL' || c.label.toLowerCase().includes('số lượng'));
    let lpIndex = flatCols.findIndex(c => c.label === 'List Price');
    if (slIndex !== -1 && lpIndex !== -1 && lpIndex !== slIndex + 1) {
      let lpCol = flatCols.splice(lpIndex, 1)[0];
      if (lpIndex < slIndex) slIndex--;
      flatCols.splice(slIndex + 1, 0, lpCol);
    }

    // Group columns for 2-row header rendering
    for (let col of flatCols) {
      let last = headerGroups.length ? headerGroups[headerGroups.length - 1] : null
      if (col.brand) {
        if (last && last.brand === col.brand) {
          last.cols.push(col)
        } else {
          headerGroups.push({ brand: col.brand, cols: [col], standalone: false })
        }
      } else {
        headerGroups.push({ brand: '', cols: [col], standalone: true })
      }
    }

    // Extract product rows
    for (let r = productStartIndex + 1; r < prodData.length; r++) {
      let row = prodData[r] || []
      if (!row || row.length === 0) continue

      let peek = [0,1,2,3].map(i => (row[i]||'').toString().toLowerCase().trim()).join(' ')
      if (peek.includes('tổng cộng') || peek.includes('tổng tiền') || peek.includes('tổng thanh toán') || peek.includes('ghi chú')) break

      let empty = true
      for (let c = 0; c < row.length; c++) {
        if ((row[c]||'').toString().trim()) { empty = false; break }
      }
      if (empty) continue

      let obj = {}
      const dateLabels = ['start date', 'expiration', 'ngày', 'date', 'thời gian']
      for (let col of flatCols) {
        let val = (row[col.colIdx] !== undefined && row[col.colIdx] !== null) ? row[col.colIdx] : ''
        // Convert Excel serial date numbers to readable dates
        let isDateCol = dateLabels.some(d => col.label.toLowerCase().includes(d))
        if (isDateCol && typeof val === 'number' && val > 30000 && val < 100000) {
          let date = new Date((val - 25569) * 86400 * 1000)
          val = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        } else {
          val = val.toString().trim()
        }
        obj[col.key] = val
      }

      // Only keep rows that have actual product name
      let hasName = flatCols.some(c => (c.label.includes('Tên hàng') || c.label.includes('Tên sản phẩm')) && obj[c.key])
      if (!hasName) continue

      // Detect brand from brand-specific columns or product name
      let detectedBrand = ''
      let brandCols = flatCols.filter(c => c.brand)
      let brandScores = {}
      for (let bc of brandCols) {
        if (obj[bc.key]) {
          brandScores[bc.brand] = (brandScores[bc.brand] || 0) + 1
        }
      }
      let topBrand = Object.entries(brandScores).sort((a,b) => b[1]-a[1])[0]
      if (topBrand) {
        detectedBrand = topBrand[0]
      } else {
        // Fallback: detect from product name
        let nameCol = flatCols.find(c => c.label.includes('Tên hàng') || c.label.includes('Tên sản phẩm'))
        let name = nameCol ? (obj[nameCol.key] || '').toLowerCase() : ''
        let brands = [...new Set(flatCols.filter(c => c.brand).map(c => c.brand))]
        for (let b of brands) {
          if (name.includes(b.toLowerCase())) { detectedBrand = b; break }
        }
        if (!detectedBrand) detectedBrand = 'Khác'
      }
      obj._brand = detectedBrand
      products.push(obj)
    }
  }

  // Extract "Ghi chú khác" section
  let ghiChuLines = []
  let foundGhiChu = false
  for (let r = 0; r < prodData.length; r++) {
    let row = prodData[r]
    if (!row) continue
    let firstCell = (row[0] || '').toString().trim().toLowerCase()
    if (firstCell.includes('ghi chú')) {
      foundGhiChu = true
      continue
    }
    if (foundGhiChu) {
      let text = (row[0] || '').toString().trim()
      if (text) ghiChuLines.push(text)
    }
  }
  record.ghiChu = ghiChuLines.join('\n')

  record.products = products
  record.headerGroups = headerGroups
  record.flatCols = flatCols

  return record
}

const handleFileUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  loading.value = true

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      
      const sheetNamePO = workbook.SheetNames.find(name => name.toUpperCase().trim() === 'PO')
      const sheetNameDH = workbook.SheetNames.find(name => {
        const upper = name.toUpperCase().trim()
        return upper.includes('ĐƠN HÀNG') || upper.includes('DON HANG')
      })
      
      if (sheetNamePO || sheetNameDH) {
        const worksheetPO = sheetNamePO ? workbook.Sheets[sheetNamePO] : null
        const worksheetDH = sheetNameDH ? workbook.Sheets[sheetNameDH] : null
        
        const poData = worksheetPO ? XLSX.utils.sheet_to_json(worksheetPO, { header: 1, defval: '' }) : []
        const dhData = worksheetDH ? XLSX.utils.sheet_to_json(worksheetDH, { header: 1, defval: '' }) : poData
        
        const record = extractRecord(poData, dhData, file.name)
        importedRecords.value.push(record)
      } else {
        alert(`Không tìm thấy sheet "PO" hoặc "Đơn hàng" trong file ${file.name}.`)
      }
    }
  } catch (error) {
    console.error('Lỗi khi đọc file Excel:', error)
    alert('Có lỗi xảy ra khi đọc file Excel. Vui lòng thử lại.')
  } finally {
    loading.value = false
    event.target.value = null
  }
}

const removeRecord = (index) => {
  importedRecords.value.splice(index, 1)
}

const getDealRegs = (rec) => {
  if (!rec.products || !rec.products.length) return []
  let brandMap = {}
  for (let p of rec.products) {
    let b = p._brand || 'Khác'
    if (!brandMap[b]) brandMap[b] = []
    brandMap[b].push(p)
  }
  return Object.entries(brandMap).map(([brand, prods]) => {
    let nameKey = rec.flatCols.find(c => c.label.includes('Tên hàng') || c.label.includes('Tên sản phẩm'))?.key || ''
    let skuKey = rec.flatCols.find(c => c.label.includes('Mã SKU'))?.key || ''
    let qtyKey = rec.flatCols.find(c => c.label === 'SL' || c.label.includes('Số lượng'))?.key || ''
    let priceKey = rec.flatCols.find(c => c.label.includes('Thành tiền'))?.key || ''
    let items = prods.map(p => ({
      name: nameKey ? p[nameKey] : '',
      sku: skuKey ? p[skuKey] : '',
      qty: qtyKey ? p[qtyKey] : '',
      value: priceKey ? p[priceKey] : ''
    }))
    let total = items.reduce((s, i) => s + (parseFloat((i.value || '0').replace(/,/g,'')) || 0), 0)
    return { brand, items, total }
  })
}

const getColWidth = (col) => {
  const label = col.label.toLowerCase()
  if (label === 'stt') return '3%'
  if (label.includes('mã sku')) return '6%'
  if (label.includes('tên hàng') || label.includes('tên sản phẩm')) return '18%'
  if (label.includes('nhà cung cấp')) return '6%'
  if (label === 'sl' || label.includes('số lượng')) return '3%'
  if (label.includes('list price')) return '6%'
  if (label.includes('mức off')) return '4%'
  if (label.includes('đơn giá')) return '5%'
  if (label.includes('thành tiền')) return '6%'
  if (label.includes('start date')) return '6%'
  if (label.includes('seri') || label.includes('serial')) return '7%'
  if (label.includes('license')) return '7%'
  if (label.includes('base code')) return '6%'
  if (label.includes('expiration')) return '6%'
  if (label.includes('ghi chú')) return '5%'
  return '6%'
}

// ─── HELPERS ───
const getAbbr = (str) => {
  if (!str) return ''
  return str.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join('')
}

const genMaKH = (tenKH, congTy, sdt) => {
  const abbrTen = getAbbr(tenKH)
  const abbrCT = getAbbr(congTy)
  const phone = (sdt || '').replace(/\D/g, '')
  return [abbrTen, abbrCT, phone].filter(Boolean).join('_')
}

const extractDateFromFilename = (filename) => {
  // Tìm pattern DD.MM.YYYY trong tên file
  const match = filename.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (match) {
    const [, dd, mm, yyyy] = match
    return `${dd.padStart(2,'0')}/${mm.padStart(2,'0')}/${yyyy}`
  }
  return ''
}

const checkCustomerExists = async (maKH) => {
  try {
    const url = `${API_URL}?sheet=khach_hang&ma=${encodeURIComponent(maKH)}`
    const res = await fetch(url)
    const json = await res.json()
    return json.data && json.data.length > 0
  } catch { return false }
}

// ─── SAVE TO BACKEND ───
const saveRecord = async (rec, index) => {
  if (saving.value || rec._saved) return
  saving.value = true
  savingIndex.value = index

  try {
    // Auto-gen mã hợp đồng giống BaoGia: HD + ISO timestamp
    const maHD = `HD${new Date().toISOString().replace(/\D/g, '')}`

    // Auto-gen số hợp đồng: HĐ + (tổng hop_dong_tong_quat + 1)
    let hdCount = 0
    try {
      const hdRes = await fetch(`${API_URL}?action=hop_dong_tong_quat`).then(r => r.json())
      hdCount = Array.isArray(hdRes) ? hdRes.length : 0
    } catch {}
    const soHD = `HĐ${hdCount + 1}`
    const soPO = rec.STT_B2 || soHD
    const tenPO = rec.TEN_C2 || ''
    const createdTime = extractDateFromFilename(rec._fileName || '')

    // Xác định khách hàng chính/phụ
    const contactRaw = (rec.CUS_CONTACT || '').trim()
    const nguoiNhan = (rec.DEL_NGUOI_NHAN || '').trim()
    const congTy = rec.CUS_COMPANY || rec.INV_CONG_TY || ''

    // Nếu ko có khách chính → khách phụ (người nhận hàng) lên làm chính
    let tenKHChinh = contactRaw || nguoiNhan
    let sdtChinh = contactRaw ? (rec.CUS_MOBILE || '') : (rec.DEL_SDT || '')
    let emailChinh = contactRaw ? (rec.CUS_EMAIL || '') : ''

    // Người phụ: chỉ khi cả 2 đều có VÀ khác nhau
    const hasSecondary = contactRaw && nguoiNhan && contactRaw !== nguoiNhan
    const tenKHPhu = hasSecondary ? nguoiNhan : ''
    const sdtPhu = hasSecondary ? (rec.DEL_SDT || '') : ''

    // Gen mã khách hàng
    const sdtKH = sdtChinh || rec.CUS_TEL || ''
    const maKH = genMaKH(tenKHChinh, congTy, sdtKH)

    // Gen mã công ty: CT_ + viết tắt tên công ty
    const maCT = congTy ? `CT_${getAbbr(congTy)}` : ''

    // 0. POST khach_hang (nếu chưa tồn tại)
    if (maKH) {
      const exists = await checkCustomerExists(maKH)
      if (!exists) {
        const khPayload = {
          sheet: 'khach_hang', action: 'add',
          ma_khach_hang: maKH,
          ten_khach_hang: tenKHChinh,
          email_ca_nhan: emailChinh,
          so_dien_thoai_ca_nhan: sdtChinh,
          ma_cong_ty: maCT,
          ten_cong_ty: rec.INV_CONG_TY || '',
          so_dien_thoai_cong_ty: rec.CUS_TEL || '',
          so_fax_cong_ty: rec.CUS_FAX || '',
          dia_chi_cong_ty: rec.INV_DIA_CHI || '',
          email_cong_ty: rec.INV_EMAIL || rec.CUS_EMAIL || '',
          website_cong_ty: rec.CUS_WEBSITE || '',
          hoa_hong: '',
          tong_chi_tieu: 0,
          tong_loi_nhuan: 0,
          trang_thai: 'Hoạt động',
          ghi_chu: '',
          ten_khach_hang_phu: tenKHPhu,
          so_dien_thoai_ca_nhan_phu: sdtPhu,
          email_ca_nhan_phu: '',
          mst: rec.INV_MST || '',
          company: rec.CUS_COMPANY || '',
          address: rec.CUS_ADDRESS || '',
          tel: rec.CUS_TEL || '',
        }
        await fetch(API_URL, { method: 'POST', body: JSON.stringify(khPayload) })
      }
    }

    // 1. POST PO_DXMH
    const poPayload = {
      sheet: 'po_dxmh', action: 'add',
      ma_hop_dong: maHD, so_hop_dong: soHD, so_po: soPO, ten_po: tenPO,
      do_uu_tien: rec.DO_UU_TIEN || '',
      trang_thai_don_hang: rec.TRANG_THAI || '',
      ma_khach_hang: maKH,
      company: rec.CUS_COMPANY || '', address: rec.CUS_ADDRESS || '',
      tel: rec.CUS_TEL || '', fax: rec.CUS_FAX || '',
      contact: rec.CUS_CONTACT || '', email: rec.CUS_EMAIL || '',
      mobile: rec.CUS_MOBILE || '', website: rec.CUS_WEBSITE || '',
      cong_ty: rec.INV_CONG_TY || '', dia_chi: rec.INV_DIA_CHI || '',
      mst: rec.INV_MST || '', email_inv: rec.INV_EMAIL || '',
      thanh_ly: rec.INV_THANH_LY || '', dn_thanh_toan: rec.INV_DN_THANH_TOAN || '',
      co_cq: rec.INV_COCQ || '',
      giao_hang_hoa_don: rec.DEL_M1 || '', giao_hang_ky_thuat: rec.DEL_M2 || '',
      lien_he_kd_truoc: rec.DEL_M3 || '',
      nguoi_nhan_hang: rec.DEL_NGUOI_NHAN || '', dia_chi_nhan: rec.DEL_DIA_CHI || '',
      so_dien_thoai: rec.DEL_SDT || '', nguoi_lien_he_trien_khai: rec.DEL_NGUOI_LIEN_HE || '',
      ngay_dat_coc: rec.PAY_NGAY_COC || '', ti_le_dat_coc: rec.PAY_TI_LE_COC || '',
      cong_no_ngay: rec.PAY_CONG_NO || '', ngay_co_hang_du_kien: rec.PAY_NGAY_CO_HANG || '',
      created_time: createdTime,
      content_of_contract_po: rec._fileName || '',
    }
    await fetch(API_URL, { method: 'POST', body: JSON.stringify(poPayload) })

    // 1b. POST hop_dong_tong_quat (22 cột) + hop_dong_chi_tiet (23 cột)
    const ngayHD = createdTime || (() => {
      const n = new Date(), p = v => String(v).padStart(2,'0')
      return `${p(n.getDate())}/${p(n.getMonth()+1)}/${n.getFullYear()}`
    })()

    // Tính tổng thành tiền
    let tongTruocThue = 0
    if (rec.products && rec.products.length) {
      const ttKey = rec.flatCols.find(c => c.label.includes('Thành tiền'))?.key || ''
      rec.products.forEach(p => {
        tongTruocThue += parseFloat(String(p[ttKey] || '0').replace(/,/g,'')) || 0
      })
    }
    const vat = tongTruocThue * 0.1
    const sau = tongTruocThue + vat

    // hop_dong_tong_quat row [22 cột]
    const hdTongRow = [
      maHD,                        // 0  ma_hop_dong
      soHD,                        // 1  so_hop_dong
      maKH,                        // 2  ma_khach_hang
      tenKHChinh,                  // 3  ten_khach_hang
      (() => {                      // 4  ngay_tao_hop_dong (HH:mm:ss DD/MM/YYYY) — realtime
        const n = new Date(), p = v => String(v).padStart(2,'0')
        return `${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())} ${p(n.getDate())}/${p(n.getMonth()+1)}/${n.getFullYear()}`
      })(),
      tongTruocThue,               // 5  truoc_thue
      vat,                         // 6  vat
      sau,                         // 7  sau_thue
      0,                           // 8  tong_giam_gia
      sau,                         // 9  tong_cong
      0,                           // 10 tong_thanh_toan
      0,                           // 11 hh_khach
      0,                           // 12 hh_ca_nhan
      0,                           // 13 cong_no_cu
      'Chưa thanh toán đủ',        // 14 trang_thai_thanh_toan
      'Chính thức',                // 15 trang_thai_hop_dong
      rec.ghiChu || '',            // 16 ghi_chu
      'USD',                       // 17 don_vi_tien_te
      0,                           // 18 ti_gia (backend tự lấy)
      '',                          // 19 ma_hop_dong_cu
      tongTruocThue,               // 20 tong_gia_thuc_te
      createdTime || ngayHD,       // 21 created_time
      soPO,                        // 22 So_PO (từ file Excel)
      tenPO,                       // 23 Ten_PO
      rec._fileName || '',         // 24 content_of_contract_po
      0,                           // 25 chiet_khau_tong_truoc_thue
      0,                           // 26 phan_tram_chiet_khau_tong_truoc_thue
      0,                           // 27 thue_chenh_lech_gia
      0,                           // 28 phan_tram_thue_chenh_lech_gia
      0,                           // 29 chenh_lech_gia
      0,                           // 30 con_lai
      0,                           // 31 tong_chiet_khau
    ]

    // hop_dong_chi_tiet rows [23 cột mỗi dòng]
    const hdChiTietRows = []
    if (rec.products && rec.products.length) {
      const nameKey = rec.flatCols.find(c => c.label.includes('Tên hàng') || c.label.includes('Tên sản phẩm'))?.key || ''
      const skuKey = rec.flatCols.find(c => c.label.includes('Mã SKU'))?.key || ''
      const supplierNameKey = rec.flatCols.find(c => c.label.includes('nhà cung cấp'))?.key || ''
      const slKey = rec.flatCols.find(c => c.label === 'SL' || c.label.includes('Số lượng'))?.key || ''
      const donGiaKey = rec.flatCols.find(c => c.label.includes('Đơn giá'))?.key || ''
      const listPriceKey = rec.flatCols.find(c => c.label.includes('List price'))?.key || ''

      for (const p of rec.products) {
        hdChiTietRows.push([
          maHD,                           // 0  ma_hop_dong
          soHD,                           // 1  so_hop_dong
          skuKey ? p[skuKey] : '',         // 2  Ma_hang
          nameKey ? p[nameKey] : '',       // 3  Ten_hang
          '',                             // 4  Main_img
          '',                             // 5  Ma_nha_cung_cap
          supplierNameKey ? p[supplierNameKey] : '', // 6  Ten_nha_cung_cap
          '',                             // 7  Mo_ta_chung
          '',                             // 8  Mo_ta_chi_tiet
          '',                             // 9  Features
          '',                             // 10 Danh_muc
          '',                             // 11 License_duration
          '',                             // 12 DVT
          listPriceKey ? parseFloat(String(p[listPriceKey]||'0').replace(/,/g,''))||0 : 0, // 13 Gia_tieu_chuan
          donGiaKey ? parseFloat(String(p[donGiaKey]||'0').replace(/,/g,''))||0 : 0,       // 14 Don_gia
          'USD',                          // 15 Don_vi_tien_te
          0,                              // 16 Ti_gia (backend tự lấy)
          10,                             // 17 Thue_VAT
          slKey ? parseInt(p[slKey])||1 : 1, // 18 So_luong
          'Chính thức',                   // 19 Trang_thai_hop_dong
          0,                              // 20 gia_hardware
          0,                              // 21 gia_nhap
          0,                              // 22 muc_phan_tram_off
        ])
      }
    }

    // POST hop_dong_tong_quat + chi_tiet via save_contract_official
    await fetch(`${API_URL}?action=save_contract_official`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `payload=${encodeURIComponent(JSON.stringify({
        hd_tong_quat_row: hdTongRow,
        hd_chi_tiet_rows: hdChiTietRows,
        ma_khach_hang: maKH,
        tong_sau_thue: sau || 1,
      }))}`
    })

    // 2. POST chi_tiet_mua_hang (bulk)
    if (rec.products && rec.products.length) {
      const nameKey = rec.flatCols.find(c => c.label.includes('Tên hàng') || c.label.includes('Tên sản phẩm'))?.key || ''
      const skuKey = rec.flatCols.find(c => c.label.includes('Mã SKU'))?.key || ''
      const supplierKey = rec.flatCols.find(c => c.label.includes('nhà cung cấp'))?.key || ''
      const slKey = rec.flatCols.find(c => c.label === 'SL' || c.label.includes('Số lượng'))?.key || ''
      const listPriceKey = rec.flatCols.find(c => c.label.includes('List price'))?.key || ''
      const mucOffKey = rec.flatCols.find(c => c.label.includes('Mức off'))?.key || ''
      const donGiaKey = rec.flatCols.find(c => c.label.includes('Đơn giá'))?.key || ''
      const thanhTienKey = rec.flatCols.find(c => c.label.includes('Thành tiền'))?.key || ''
      const startSophosKey = rec.flatCols.find(c => c.label.toLowerCase().includes('start date') && c.brand?.toLowerCase().includes('sophos'))?.key || ''
      const serialKey = rec.flatCols.find(c => c.label.toLowerCase().includes('serial'))?.key || ''
      const licenseKey = rec.flatCols.find(c => c.label.toLowerCase().includes('license'))?.key || ''
      const baseCodeKey = rec.flatCols.find(c => c.label.toLowerCase().includes('base code'))?.key || ''
      const expKey = rec.flatCols.find(c => c.label.toLowerCase().includes('expiration'))?.key || ''
      const startOtherKey = rec.flatCols.find(c => c.label.toLowerCase().includes('start date') && !c.brand?.toLowerCase().includes('sophos'))?.key || ''
      const ghiChuKey = rec.flatCols.find(c => c.label.toLowerCase().includes('ghi chú'))?.key || ''

      const items = rec.products.map(p => ({
        ma_hop_dong: maHD, so_hop_dong: soHD, so_po: soPO, ten_po: tenPO,
        ma_hang_hoa: '', ma_sku: skuKey ? p[skuKey] : '',
        ten_hang_hoa: nameKey ? p[nameKey] : '',
        ma_nha_cung_cap: '', ten_nha_cung_cap: supplierKey ? p[supplierKey] : '',
        sl: slKey ? p[slKey] : '', list_price_usd: listPriceKey ? p[listPriceKey] : '',
        muc_off: mucOffKey ? p[mucOffKey] : '', don_gia: donGiaKey ? p[donGiaKey] : '',
        thanh_tien: thanhTienKey ? p[thanhTienKey] : '',
        start_date_sophos: startSophosKey ? p[startSophosKey] : '',
        serial_number_sophos: serialKey ? p[serialKey] : '',
        license_id_sophos: licenseKey ? p[licenseKey] : '',
        base_code_kaspersky: baseCodeKey ? p[baseCodeKey] : '',
        expiration_time_kaspersky: expKey ? p[expKey] : '',
        start_date_other: startOtherKey ? p[startOtherKey] : '',
        ghi_chu: ghiChuKey ? p[ghiChuKey] : '',
        content_of_contract_po: rec._fileName || '',
      }))
      await fetch(API_URL, { method: 'POST', body: JSON.stringify({ sheet: 'chi_tiet_mua_hang', action: 'add_bulk', items }) })
    }

    // 3. POST deal_reg (bulk)
    const dealRegs = getDealRegs(rec)
    if (dealRegs.length) {
      const drItems = []
      for (const dr of dealRegs) {
        for (const item of dr.items) {
          drItems.push({
            ma_hop_dong: maHD, so_hop_dong: soHD, so_po: soPO, ten_po: tenPO,
            ma_nha_cung_cap: '', ten_nha_cung_cap: dr.brand,
            end_user_company_name: rec.CUS_COMPANY || '',
            end_user_company_name_vietnamese: rec.INV_CONG_TY || '',
            end_username: rec.CUS_CONTACT || '', end_user_email: rec.CUS_EMAIL || '',
            company_address: rec.CUS_ADDRESS || '', end_user_phone: rec.CUS_TEL || '',
            end_user_website: rec.CUS_WEBSITE || '', country: 'VIET NAM',
            is_existing_sophos_customer: '', company_size: '',
            estimated_customer_budget_usd: '', estimated_closure_date: '',
            competition: '', proposed_poc_schedule: '',
            partner_company_name: 'Nam Truong Son System Integration Corp',
            partner_address: '55/10 Trần Đình Xu, Phường Cầu Kho, Quận 1, TP.HCM',
            account_manager_name: 'LÊ PHI SƠN',
            account_manager_email: 'sonlp@nts.com.vn',
            account_manager_phone: '090 8137488',
            remark: '',
            ma_hang_hoa: '', ma_sku: item.sku || '',
            ten_hang_hoa: item.name || '',
            ma_nha_cung_cap_item: '', ten_nha_cung_cap_item: dr.brand,
            qty: item.qty || '', estimated_value_usd: item.value || '',
            total: dr.total || '',
            content_of_contract_po: rec._fileName || '',
          })
        }
      }
      if (drItems.length) {
        await fetch(API_URL, { method: 'POST', body: JSON.stringify({ sheet: 'deal_reg', action: 'add_bulk', items: drItems }) })
      }
    }

    rec._saved = true
    alert(`✅ Đã lưu thành công!\nMã HĐ: ${maHD}\nSố HĐ: ${soHD}\nMã KH: ${maKH || '(không có)'}`)
  } catch (err) {
    console.error('Lỗi lưu:', err)
    alert('❌ Lỗi khi lưu: ' + err.message)
  } finally {
    saving.value = false
    savingIndex.value = -1
  }
}
</script>

<style scoped>
.po-preview-container {
  padding: 24px;
  max-width: 100%;
  margin: 0 auto;
  background-color: var(--surface-light, #f8fafc);
  min-height: calc(100vh - 48px);
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-actions h2 {
  margin: 0;
  color: var(--text-primary, #1e293b);
  font-size: 1.5rem;
  font-weight: 600;
}

.upload-btn-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.upload-btn-wrapper input[type=file] {
  font-size: 100px;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
  height: 100%;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(16, 185, 129, 0.3);
}

.records-container {
  background: transparent;
}

/* File header bar */
.file-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
  border-radius: 12px 12px 0 0;
  color: white;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.btn-delete {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #ef4444;
  color: white;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #10b981;
  color: white;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-header-bar .btn-save + .btn-delete {
  margin-left: 8px;
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; }

/* Sections grid */
.record-wrapper {
  margin-bottom: 24px;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.section-card {
  grid-column: span 3;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}


.section-card-title {
  padding: 8px 14px;
  font-weight: 700;
  color: #334155;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.section-card-body {
  padding: 10px 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
}

.section-vertical .section-card-body {
  flex-direction: column;
  gap: 6px;
}

.data-item {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 6px;
  min-width: 120px;
}

.data-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
}

.data-value {
  font-size: 0.88rem;
  color: #0f172a;
  font-weight: 500;
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  color: #64748b;
  text-align: center;
}

.empty-icon {
  color: #94a3b8;
  margin-bottom: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ===== Product Detail Card ===== */
.product-card {
  margin-top: 20px;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04);
  border: 1px solid #e2e8f0;
}

.product-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
  font-weight: 700;
  font-size: 0.92rem;
  color: white;
  letter-spacing: 0.02em;
}

.product-badge {
  margin-left: auto;
  background: rgba(16, 185, 129, 0.9);
  color: white;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 12px;
  border-radius: 99px;
  letter-spacing: 0.02em;
}

.product-table-wrapper {
  overflow-x: auto;
}

.product-table-wrapper::-webkit-scrollbar {
  height: 5px;
}

.product-table-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.product-table-wrapper::-webkit-scrollbar-thumb {
  background-color: #94a3b8;
  border-radius: 3px;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
  table-layout: fixed;
}

.product-table th,
.product-table td {
  padding: 8px 10px;
  border: 1px solid #dce3eb;
  text-align: left;
  vertical-align: top;
  white-space: normal;
  word-break: break-word;
  overflow: hidden;
}

/* Brand group header (Sophos, Kaspersky, Khác) */
.th-brand {
  font-weight: 700;
  font-size: 0.82rem;
  text-align: center;
  letter-spacing: 0.05em;
  padding: 9px 12px;
  border-left: 2px solid rgba(255,255,255,0.3);
  text-transform: uppercase;
}

/* Standalone base column header (STT, Mã SKU, etc.) */
.th-base {
  background: linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%);
  font-weight: 600;
  color: #cbd5e1;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  vertical-align: middle;
  padding: 9px 10px;
  border-color: #334155;
}

/* Sub-column header under brand */
.th-sub {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.72rem;
  border-bottom: 2.5px solid;
  text-align: center;
  padding: 7px 8px;
  letter-spacing: 0.02em;
}

.product-table tbody tr {
  transition: background-color 0.15s ease;
}

.product-table tbody tr:hover {
  background-color: #f1f5f9 !important;
}

.product-table tbody tr:nth-child(even) {
  background-color: #f8fafc;
}

/* Cell type styles */
.col-stt {
  text-align: center;
  color: #475569;
  font-weight: 700;
  font-size: 0.82rem;
}

.col-name {
  white-space: normal;
  word-break: break-word;
  line-height: 1.45;
  color: #0f172a;
  font-size: 0.77rem;
}

.col-number {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: #0f172a;
  font-weight: 700;
}

.product-table td {
  color: #334155;
  font-size: 0.77rem;
  line-height: 1.4;
}

.product-note {
  padding: 14px 20px;
  background: #fffbeb;
  border-top: 2px solid #fde68a;
  color: #92400e;
  font-size: 0.82rem;
  line-height: 1.5;
}

.product-note strong {
  color: #78350f;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.product-note p {
  margin: 6px 0 0;
  white-space: pre-wrap;
}

.empty-products {
  padding: 40px 20px;
  color: #94a3b8;
  font-style: italic;
  text-align: center;
  font-size: 0.9rem;
}

/* ===== Deal Registration Cards ===== */
.dealreg-grid {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  align-items: start;
}

.dealreg-card {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.dr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11pt;
  font-family: 'Calibri', 'Segoe UI', sans-serif;
  border: 1.5px solid #2F5496;
}

.dr-table td {
  border: 1px solid #2F5496;
  padding: 4px 8px;
  vertical-align: top;
  line-height: 1.4;
  font-size: 10pt;
}

/* Section title rows — FBE4D5 bg, bold, black text */
.dr-title-row td {
  background: #FBE4D5;
  text-align: left;
  padding: 5px 8px;
  color: #000;
  font-size: 11pt;
}

/* Label cells — EDEDED bg, #2E74B5 blue text (default) */
.dr-table .dr-label {
  background: #EDEDED;
  font-weight: 400;
  color: #2E74B5;
  width: 20%;
  white-space: normal;
  font-size: 10pt;
}

/* Label cyan #00B0F0 — End user Company Name */
.dr-table .dr-label-cyan {
  background: #EDEDED;
  font-weight: 400;
  color: #00B0F0;
  width: 20%;
  white-space: normal;
  font-size: 10pt;
}

/* Label navy #2F5496 — End User Phone, End User Website */
.dr-table .dr-label-navy {
  background: #EDEDED;
  font-weight: 400;
  color: #2F5496;
  width: 20%;
  white-space: normal;
  font-size: 10pt;
}

/* Label blue italic #2E74B5 — End User Name, Account Manager Name */
.dr-table .dr-label-blue-italic {
  background: #EDEDED;
  font-weight: 400;
  color: #2E74B5;
  font-style: italic;
  width: 20%;
  white-space: normal;
  font-size: 10pt;
}

/* Label italic #0070C0 — Company Size, Estimated Closure Date */
.dr-table .dr-label-italic {
  background: #EDEDED;
  font-weight: 400;
  color: #0070C0;
  font-style: italic;
  width: 20%;
  white-space: normal;
  font-size: 10pt;
}

/* Label red #FF0000 — Company Name VN, Account Manager Phone */
.dr-table .dr-label-red {
  background: #EDEDED;
  font-weight: 400;
  color: #FF0000;
  width: 20%;
  white-space: normal;
  font-size: 10pt;
}

/* Label black/auto — Existing Customer, Estimated Budget, Competition, POC Schedule */
.dr-table .dr-label-black {
  background: #EDEDED;
  font-weight: 400;
  color: #000;
  width: 20%;
  white-space: normal;
  font-size: 10pt;
}

/* Value cells — white bg, black text, NOT bold */
.dr-table .dr-value {
  color: #000;
  font-weight: 400;
  width: 30%;
  word-break: break-word;
  background: #fff;
  font-size: 10pt;
}

/* Remarks */
.dr-remarks {
  min-height: 24px;
  background: #fff;
}

/* BOM header row — FBE4D5 bg, NOT bold, black text */
.bom-header-row td {
  background: #FBE4D5;
  font-size: 10pt;
  color: #000;
  font-weight: 400;
}

.bom-qty {
  text-align: center;
}

.bom-val {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.dr-table small {
  color: #000;
  font-size: 9pt;
}

/* TOTAL row — white bg, bold text */
.bom-total-row td {
  background: #fff;
  border-top: 1.5px solid #2F5496;
  font-weight: 700;
}
</style>
