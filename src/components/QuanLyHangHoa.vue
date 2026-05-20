<template>
  <div class="quan-ly-hang-hoa">
    <div class="page-header">
      <h1 class="page-title">Quản lý Hàng Hóa</h1>
      <div class="actions">
        <label class="btn btn-outline" style="cursor: pointer;">
          <input type="file" accept=".xlsx" style="display:none" @change="handleFileUpload" />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Import LP_HANGHOA
        </label>
        <button class="btn btn-primary" @click="openAddModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Thêm mới
        </button>
        <button class="btn btn-secondary" @click="fetchData" :disabled="loading">
          <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          <span v-else class="spinner"></span>
          Làm mới
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input type="text" v-model="searchQuery" placeholder="Tìm mã / tên hàng / NCC..." class="search-input" />
    </div>

    <!-- Main Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 50px">STT</th>
            <th>Ảnh</th>
            <th>Mã hàng</th>
            <th>Tên hàng</th>
            <th>Loại (Type)</th>
            <th>Đơn vị tính</th>
            <th>Đơn giá</th>
            <th>VAT</th>
            <th>Nhà cung cấp</th>
            <th class="text-center" style="width: 120px">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && !items.length">
            <td colspan="9" class="text-center py-8 text-muted">Đang tải dữ liệu...</td>
          </tr>
          <tr v-else-if="!filteredItems.length">
            <td colspan="9" class="text-center py-8 text-muted">Không có hàng hóa nào.</td>
          </tr>
          <tr v-for="(item, index) in filteredItems" :key="item.Ma_hang || index">
            <td class="text-center">{{ index + 1 }}</td>
            <td>
              <img v-if="item.Main_img" :src="item.Main_img" alt="img" class="item-img" />
              <div v-else class="no-img">No Image</div>
            </td>
            <td><strong>{{ item.Ma_hang }}</strong></td>
            <td>
              <div class="item-name">{{ item.Ten_hang }}</div>
              <div class="item-desc text-muted" v-if="item.Mo_ta_chung">{{ item.Mo_ta_chung }}</div>
            </td>
            <td>
              <span class="type-badge" :class="{'bg-hw': item.Type === 'Hardware' || item.Type === 'hw', 'bg-sub': item.Type === 'Subscription' || item.Type === 'sw'}">
                {{ item.Type || '-' }}
              </span>
            </td>
            <td>{{ item.DVT }}</td>
            <td>{{ formatCurrency(item.Don_gia, item.Don_vi_tien_te) }}</td>
            <td>{{ item.Thue_VAT ? item.Thue_VAT + '%' : '' }}</td>
            <td>{{ item.Ten_nha_cung_cap }}</td>
            <td class="text-center">
              <div class="action-buttons">
                <button class="btn-icon text-primary" title="Sửa" @click="openEditModal(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="btn-icon text-danger" title="Xóa" @click="deleteItem(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Cập nhật hàng hóa' : 'Thêm hàng hóa mới' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveItem" class="form-grid">
            <div class="form-group">
              <label>Mã hàng <span class="required">*</span></label>
              <input v-model="formData.Ma_hang" type="text" required :disabled="isEditing" />
            </div>
            <div class="form-group col-span-2">
              <label>Tên hàng <span class="required">*</span></label>
              <input v-model="formData.Ten_hang" type="text" required />
            </div>

            <div class="form-group">
              <label>Loại hàng (Type)</label>
              <input v-model="formData.Type" type="text" />
            </div>
            
            <div class="form-group col-span-3">
              <label>Link ảnh (URL)</label>
              <input v-model="formData.Main_img" type="url" placeholder="https://..." />
            </div>
            
            <div class="form-group">
              <label>Nhà cung cấp</label>
              <input v-model="formData.Ten_nha_cung_cap" type="text" />
            </div>
            <div class="form-group">
              <label>Mã NCC</label>
              <input v-model="formData.Ma_nha_cung_cap" type="text" />
            </div>
            <div class="form-group">
              <label>Danh mục</label>
              <input v-model="formData.Danh_muc" type="text" />
            </div>
            
            <div class="form-group">
              <label>Đơn vị tính</label>
              <input v-model="formData.DVT" type="text" />
            </div>
            <div class="form-group">
              <label>Đơn giá</label>
              <input v-model="formData.Don_gia" type="number" />
            </div>
            <div class="form-group">
              <label>Tiền tệ</label>
              <select v-model="formData.Don_vi_tien_te" class="select-input">
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tỉ giá</label>
              <input v-model="formData.Ti_gia" type="number" />
            </div>
            
            <div class="form-group">
              <label>Giá tiêu chuẩn</label>
              <input v-model="formData.Gia_tieu_chuan" type="number" />
            </div>
            <div class="form-group">
              <label>Thuế VAT (%)</label>
              <input v-model="formData.Thue_VAT" type="number" step="0.1" />
            </div>
            <div class="form-group">
              <label>License duration</label>
              <input v-model="formData.License_duration" type="text" />
            </div>
            <div class="form-group">
              <label>Giá Hardware</label>
              <input v-model="formData.gia_hardware" type="number" />
            </div>
            <div class="form-group">
              <label>Giá nhập</label>
              <input v-model="formData.gia_nhap" type="number" />
            </div>
            <div class="form-group">
              <label>Mức % Off</label>
              <input v-model="formData.muc_phan_tram_off" type="number" step="0.1" />
            </div>

            <div class="form-group">
              <label>Trạng thái</label>
              <input v-model="formData.Trang_thai" type="text" />
            </div>
            <div class="form-group">
              <label>Mã hàng LK</label>
              <input v-model="formData.Ma_hang_lien_ket" type="text" />
            </div>
            <div class="form-group">
              <label>Tên hàng LK</label>
              <input v-model="formData.Ten_hang_lien_ket" type="text" />
            </div>
            


            <div class="form-group col-span-3">
              <label>Mô tả chung</label>
              <textarea v-model="formData.Mo_ta_chung" rows="2"></textarea>
            </div>
            <div class="form-group col-span-3">
              <label>Mô tả chi tiết</label>
              <textarea v-model="formData.Mo_ta_chi_tiet" rows="3"></textarea>
            </div>
            
            <div class="form-group col-span-3">
              <label>Features (Tính năng)</label>
              <textarea v-model="formData.Features" rows="3"></textarea>
            </div>
            
            <div class="form-group col-span-3">
              <label>Ghi chú</label>
              <textarea v-model="formData.Ghi_chu" rows="2"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Hủy</button>
          <button class="btn btn-primary" @click="saveItem" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Đang lưu...' : 'Lưu lại' }}
          </button>
        </div>
      </div>
    </div>

    <!-- IMPORT PREVIEW MODAL -->
    <div v-if="showImportModal" class="import-overlay" @click.self="showImportModal = false">
      <div class="import-modal">
        <!-- Header -->
        <div class="import-modal__header">
          <div class="import-modal__header-left">
            <div class="import-modal__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div>
              <h2 class="import-modal__title">Import dữ liệu hàng hóa</h2>
              <p class="import-modal__subtitle">Kiểm tra và chỉnh sửa trước khi lưu vào hệ thống</p>
            </div>
          </div>
          <button class="import-modal__close" @click="showImportModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="import-stats">
          <div class="import-stat-card">
            <div class="import-stat-card__value">{{ importData.length }}</div>
            <div class="import-stat-card__label">Tổng sản phẩm</div>
          </div>
          <div class="import-stat-card import-stat-card--blue">
            <div class="import-stat-card__value">{{ importSheetNames.length }}</div>
            <div class="import-stat-card__label">Sheet</div>
          </div>
          <div class="import-stat-card import-stat-card--amber">
            <div class="import-stat-card__value">{{ filteredImportData.length }}</div>
            <div class="import-stat-card__label">Đang hiển thị</div>
          </div>
          <div class="import-stat-card import-stat-card--green">
            <div class="import-stat-card__value">{{ importData[0]?.Ten_nha_cung_cap || '—' }}</div>
            <div class="import-stat-card__label">Nhà cung cấp</div>
          </div>
        </div>

        <!-- Sheet Tabs -->
        <div class="import-tabs">
          <button v-for="sheet in importSheetNames" :key="sheet"
                  @click="activeImportSheet = sheet"
                  :class="['import-tab', { 'import-tab--active': activeImportSheet === sheet }]">
            <span class="import-tab__name">{{ sheet }}</span>
            <span class="import-tab__badge">{{ importData.filter(p => p.Sheet_name === sheet).length }}</span>
          </button>
        </div>

        <!-- Table -->
        <div class="import-table-wrap">
          <table class="import-table">
            <thead>
              <tr>
                <th class="import-th--sticky-left import-th--idx">#</th>
                <th style="min-width:160px">Mã hàng</th>
                <th style="min-width:240px">Tên hàng</th>
                <th style="min-width:200px">Features</th>
                <th style="min-width:110px">Danh mục</th>
                <th style="min-width:80px">Type</th>
                <th style="min-width:100px">Giá tham khảo</th>
                <th style="min-width:100px">Giá nhập</th>
                <th style="min-width:70px">VAT%</th>
                <th style="min-width:70px">Tiền tệ</th>
                <th style="min-width:80px">Tỉ giá</th>
                <th style="min-width:80px">ĐVT</th>
                <th style="min-width:90px">License</th>
                <th style="min-width:110px">NCC</th>
                <th style="min-width:110px">Mã NCC</th>
                <th style="min-width:130px">Mô tả chung</th>
                <th style="min-width:130px">Mô tả chi tiết</th>
                <th style="min-width:100px">Giá HW</th>
                <th style="min-width:80px">% Off</th>
                <th style="min-width:90px">Trạng thái</th>
                <th style="min-width:140px">Mã hàng LK</th>
                <th style="min-width:140px">Tên hàng LK</th>
                <th style="min-width:100px">Ảnh</th>
                <th style="min-width:120px">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in filteredImportData" :key="row.Ma_hang + '_' + idx" class="import-row">
                <td class="import-th--sticky-left import-th--idx import-row__idx">{{ idx + 1 }}</td>
                <td><input type="text" v-model="row.Ma_hang" class="imp-input imp-input--code" /></td>
                <td><input type="text" v-model="row.Ten_hang" class="imp-input" /></td>
                <td><textarea v-model="row.Features" class="imp-input imp-input--textarea" rows="2"></textarea></td>
                <td><input type="text" v-model="row.Danh_muc" class="imp-input" /></td>
                <td><input type="text" v-model="row.Type" class="imp-input imp-input--sm" /></td>
                <td><input type="number" v-model="row.Don_gia" class="imp-input imp-input--num" /></td>
                <td><input type="number" v-model="row.gia_nhap" class="imp-input imp-input--num" /></td>
                <td><input type="number" v-model="row.Thue_VAT" class="imp-input imp-input--num" /></td>
                <td><input type="text" v-model="row.Don_vi_tien_te" class="imp-input imp-input--sm" /></td>
                <td><input type="number" v-model="row.Ti_gia" class="imp-input imp-input--num" /></td>
                <td><input type="text" v-model="row.DVT" class="imp-input imp-input--sm" /></td>
                <td><input type="text" v-model="row.License_duration" class="imp-input" /></td>
                <td><input type="text" v-model="row.Ten_nha_cung_cap" class="imp-input" /></td>
                <td><input type="text" v-model="row.Ma_nha_cung_cap" class="imp-input" /></td>
                <td><input type="text" v-model="row.Mo_ta_chung" class="imp-input" /></td>
                <td><input type="text" v-model="row.Mo_ta_chi_tiet" class="imp-input" /></td>
                <td><input type="number" v-model="row.gia_hardware" class="imp-input imp-input--num" /></td>
                <td><input type="number" v-model="row.muc_phan_tram_off" class="imp-input imp-input--num" /></td>
                <td><input type="text" v-model="row.Trang_thai" class="imp-input imp-input--sm" /></td>
                <td><textarea v-model="row.Ma_hang_lien_ket" class="imp-input imp-input--textarea" rows="2"></textarea></td>
                <td><textarea v-model="row.Ten_hang_lien_ket" class="imp-input imp-input--textarea" rows="2"></textarea></td>
                <td><input type="text" v-model="row.Main_img" class="imp-input" /></td>
                <td><input type="text" v-model="row.Ghi_chu" class="imp-input" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="import-modal__footer">
          <button class="btn btn-secondary" @click="showImportModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Hủy bỏ
          </button>
          <button class="btn import-btn-save" @click="confirmImport" :disabled="importing">
            <span v-if="importing" class="spinner"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {{ importing ? 'Đang lưu...' : `Lưu tất cả ${importData.length} sản phẩm` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx-js-style'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

const items = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')

const showImportModal = ref(false)
const importData = ref([])
const importing = ref(false)
const activeImportSheet = ref('')
const importSheetNames = computed(() => {
  return [...new Set(importData.value.map(p => p.Sheet_name).filter(Boolean))]
})
const filteredImportData = computed(() => {
  if (!activeImportSheet.value) return importData.value
  return importData.value.filter(p => p.Sheet_name === activeImportSheet.value)
})

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (evt) => {
    try {
      const data = evt.target.result
      const workbook = XLSX.read(data, { type: 'array' })
      const products = []

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName]
        if (!worksheet) continue
        
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        let headerRowIndex = -1
        
        let sttIdx = -1, maSpIdx = -1, moTaIdx = -1, giaIdx = -1, typeIdx = -1, vatIdx = -1, giaNhapIdx = -1
        let currentStt = ''
        let currentMaSp = ''
        let currentCategory = ''
        let currentVat = 0
      
      // Get Ti_Gia from A2 (index 1, 0)
      let globalTiGia = 1
      if (json.length > 1 && json[1] && json[1][0]) {
        const a2Text = String(json[1][0])
        const match = a2Text.match(/[\d,.]+/g)
        if (match) {
           const parsed = Number(match[match.length - 1].replace(/,/g, ''))
           if (!isNaN(parsed) && parsed > 0) globalTiGia = parsed
        }
      }

      // Get Nha_cung_cap from C2 (index 1, 2)
      let globalNhaCungCap = ''
      if (json.length > 1 && json[1] && json[1][2]) {
        globalNhaCungCap = String(json[1][2]).trim()
      }
      
      for (let i = 0; i < json.length; i++) {
        const row = json[i]
        if (!row || !row.length) continue

        if (headerRowIndex === -1) {
          if (row.some(c => String(c || '').toUpperCase().includes('MÔ TẢ SẢN PHẨM'))) {
            headerRowIndex = i
            // Quét các dòng tiêu đề (từ dòng trên nó 2 dòng cho đến dòng hiện tại) để xử lý ô gộp (merged cells)
            for (let r = Math.max(0, i - 2); r <= i; r++) {
               const hr = json[r]
               if (!hr) continue
               hr.forEach((c, idx) => {
                  const text = String(c || '').toUpperCase().replace(/\s/g, '')
                  if (text.includes('STT')) sttIdx = idx
                  if (text.includes('MÃSP')) maSpIdx = idx
                  if (text.includes('MÔTẢSẢNPHẨM')) moTaIdx = idx
                  if (text.includes('GIÁTHAMKHẢO')) giaIdx = idx
                  if (text.includes('TYPE')) typeIdx = idx
                  if (text.includes('VAT')) vatIdx = idx
                  if (text.includes('GIÁNHẬP')) giaNhapIdx = idx
               })
            }
          }
          continue
        }
        
        if (i > headerRowIndex) {
          const stt = sttIdx >= 0 ? row[sttIdx] : ''
          const maSp = maSpIdx >= 0 ? row[maSpIdx] : ''
          const moTa = moTaIdx >= 0 ? row[moTaIdx] : ''
          const giaThamKhao = giaIdx >= 0 ? row[giaIdx] : ''
          const typeVal = typeIdx >= 0 ? row[typeIdx] : ''
          const giaNhap = giaNhapIdx >= 0 ? row[giaNhapIdx] : ''
          
          if (vatIdx >= 0 && row[vatIdx] !== undefined && row[vatIdx] !== null && String(row[vatIdx]).trim() !== '') {
            const rawVat = String(row[vatIdx])
            const v = rawVat.replace('%', '').trim()
            let vatVal = toNum(v, 0)
            if (rawVat.includes('%') && vatVal < 1 && vatVal > 0) {
               vatVal = vatVal * 100
            } else if (!rawVat.includes('%') && vatVal < 1 && vatVal > 0) {
               vatVal = vatVal * 100
            }
            currentVat = vatVal
          }
          
          if (stt !== undefined && stt !== null && stt !== '') currentStt = String(stt).trim()
          if (maSp !== undefined && maSp !== null && maSp !== '') currentMaSp = String(maSp).trim()
          
          if (moTa !== undefined && moTa !== null && String(moTa).trim() !== '') {
            const moTaStr = String(moTa).trim()
            let tenHang = moTaStr
            let features = moTaStr
            const firstNewline = moTaStr.indexOf('\n')
            
            if (firstNewline !== -1) {
              tenHang = moTaStr.substring(0, firstNewline).trim()
              if (tenHang.endsWith(':')) tenHang = tenHang.slice(0, -1)
            }
            features = moTaStr
            
            let licenseDuration = ''
            const durationMatch = tenHang.match(/(\d+)[-\s]?(year|month)s?/i)
            if (durationMatch) {
              licenseDuration = durationMatch[1] + ' ' + durationMatch[2].toLowerCase()
            }
            
            const rawCategory = currentCategory || String(currentMaSp)
            const typeStr = String(typeVal || '').trim()
            // Sinh mã hàng bằng cách ghép Danh mục, Tên hàng và Type, thay khoảng trắng bằng gạch ngang và bỏ ký tự đặc biệt
            let id = `${rawCategory}-${tenHang}`
            if (currentMaSp && rawCategory && !rawCategory.toUpperCase().includes(currentMaSp.toUpperCase())) {
              id = `${currentMaSp}-${id}`
            }
            if (typeStr) id += `-${typeStr}`
            
            id = id.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
            id = id.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9\-]/g, '')
            // Xóa các dấu gạch ngang liên tiếp nếu có
            id = id.replace(/-+/g, '-')
            id = id.replace(/-+$/, '') // Xóa gạch ngang ở cuối nếu có

            
            products.push({
              Sheet_name: sheetName,
              Ma_hang: id,
              Ten_hang: tenHang,
              Main_img: '',
              Ma_nha_cung_cap: globalNhaCungCap,
              Ten_nha_cung_cap: globalNhaCungCap,
              Mo_ta_chung: '',
              Mo_ta_chi_tiet: '',
              Features: features,
              Danh_muc: String(currentCategory || currentMaSp).toUpperCase(),
              License_duration: licenseDuration,
              DVT: 'BẢN QUYỀN',
              Gia_tieu_chuan: toNum(giaThamKhao, 0),
              Don_gia: toNum(giaThamKhao, 0),
              Trang_thai: 'Còn hàng',
              Don_vi_tien_te: 'USD',
              Ti_gia: globalTiGia,
              Thue_VAT: currentVat ? currentVat : '',
              Ma_hang_lien_ket: '',
              Ten_hang_lien_ket: '',
              Ghi_chu: '',
              gia_hardware: 0,
              gia_nhap: toNum(giaNhap, 0),
              muc_phan_tram_off: 0,
              Type: String(typeVal || '').trim()
            })
          } else {
            // Nếu dòng không có mô tả sản phẩm (moTa trống), thì có thể đây là dòng danh mục (hàng màu hồng/xanh)
            const firstCell = row.find(c => c !== undefined && c !== null && String(c).trim() !== '')
            if (firstCell) {
              currentCategory = String(firstCell).trim()
            }
          }
        }
      }
      }
      
      // Liên kết các mặt hàng cùng mục (cùng Danh_muc)
      products.forEach(p => {
         if (p.Danh_muc) {
            const related = products.filter(r => r.Danh_muc === p.Danh_muc && r.Ma_hang !== p.Ma_hang)
            if (related.length > 0) {
               p.Ma_hang_lien_ket = related.map(r => r.Ma_hang).join('\n')
               p.Ten_hang_lien_ket = related.map(r => r.Ten_hang).join('\n')
            }
         }
      })
      
      if (products.length > 0) {
        importData.value = products
        activeImportSheet.value = [...new Set(products.map(p => p.Sheet_name).filter(Boolean))][0] || ''
        showImportModal.value = true
      } else {
        alert('Không tìm thấy dữ liệu hợp lệ trong sheet.')
      }
    } catch (err) {
      console.error(err)
      alert('Lỗi khi đọc file Excel: ' + err.message)
    }
  }
  reader.readAsArrayBuffer(file)
  e.target.value = '' // reset
}

const confirmImport = async () => {
  if (!confirm(`Bạn chắc chắn muốn lưu ${importData.value.length} sản phẩm này vào sheet hang_hoa chứ?`)) return
  importing.value = true
  try {
    const payloads = importData.value.map(p => [
      p.Ma_hang || '', p.Ten_hang || '', p.Main_img || '', p.Ma_nha_cung_cap || '', p.Ten_nha_cung_cap || '',
      p.Mo_ta_chung || '', p.Mo_ta_chi_tiet || '', p.Features || '', p.Danh_muc || '', p.License_duration || '',
      p.DVT || '', p.Gia_tieu_chuan || 0, p.Don_gia || 0, p.Trang_thai || '', p.Don_vi_tien_te || '',
      p.Ti_gia || 1, p.Thue_VAT || 0, p.Ma_hang_lien_ket || '', p.Ten_hang_lien_ket || '', p.Ghi_chu || '',
      p.gia_hardware || 0, p.gia_nhap || 0, p.muc_phan_tram_off || 0, p.Type || ''
    ])
    
    const body = new URLSearchParams()
    body.set('action', 'addHangHoaBatch')
    body.set('payload', JSON.stringify(payloads))

    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })
    
    const result = await res.json()
    if (result.ok) {
      showImportModal.value = false
      const added = result.added !== undefined ? result.added : result.count
      const updated = result.updated || 0
      alert(`Đã lưu thành công! Thêm mới: ${added}, Cập nhật: ${updated} sản phẩm.`)
      fetchData()
    } else {
      alert('Lỗi lưu dữ liệu: ' + result.error)
    }
  } catch (err) {
    alert('Lỗi kết nối: ' + err.message)
  } finally {
    importing.value = false
  }
}

const toNum = (val, def = 0) => {
  if (!val) return def
  const n = Number(String(val).replace(/,/g, ''))
  return isNaN(n) ? def : n
}

const defaultForm = {
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
  Gia_tieu_chuan: '',
  Don_gia: '',
  Trang_thai: '',
  Don_vi_tien_te: 'VND',
  Ti_gia: '',
  Thue_VAT: '',
  Ma_hang_lien_ket: '',
  Ten_hang_lien_ket: '',
  Ghi_chu: '',
  gia_hardware: '',
  gia_nhap: '',
  muc_phan_tram_off: '',
  Type: ''
}

const formData = ref({ ...defaultForm })

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  const q = searchQuery.value.toLowerCase()
  return items.value.filter(item => 
    (item.Ma_hang || '').toLowerCase().includes(q) ||
    (item.Ten_hang || '').toLowerCase().includes(q) ||
    (item.Ten_nha_cung_cap || '').toLowerCase().includes(q)
  )
})

const formatCurrency = (val, currency) => {
  if (!val) return '0'
  return new Intl.NumberFormat('vi-VN').format(val) + ' ' + (currency || 'VND')
}

const fetchData = async () => {
  loading.value = true
  try {
    const ts = Date.now()
    const res = await fetch(`${SCRIPT_URL}?action=hang_hoa&t=${ts}`)
    const data = await res.json()
    if (Array.isArray(data)) {
      items.value = data.map((row, index) => {
        if (index === 0) console.log("First row from backend:", row);
        return {
          Ma_hang: row[0],
          Ten_hang: row[1],
          Main_img: row[2],
          Ma_nha_cung_cap: row[3],
          Ten_nha_cung_cap: row[4],
          Mo_ta_chung: row[5],
          Mo_ta_chi_tiet: row[6],
          Features: row[7],
          Danh_muc: String(row[8] || '').toUpperCase(),
          License_duration: row[9],
          DVT: row[10],
          Gia_tieu_chuan: row[11],
          Don_gia: row[12],
          Trang_thai: row[13],
          Don_vi_tien_te: row[14],
          Ti_gia: row[15],
          Thue_VAT: row[16],
          Ma_hang_lien_ket: row[17],
          Ten_hang_lien_ket: row[18],
          Ghi_chu: row[19],
          gia_hardware: row[20],
          gia_nhap: row[21],
          muc_phan_tram_off: row[22],
          Type: (row[23] || '').toString().trim()
        };
      })
    }
  } catch (err) {
    console.error('Error fetching hang_hoa:', err)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  formData.value = { ...defaultForm }
  isEditing.value = false
  showModal.value = true
}

const openEditModal = (item) => {
  formData.value = { ...item }
  isEditing.value = true
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const deleteItem = async (item) => {
  if (!confirm(`Bạn có chắc muốn xóa hàng hóa: ${item.Ten_hang} (${item.Ma_hang})?`)) return
  
  loading.value = true
  try {
    const body = new URLSearchParams()
    body.set('action', 'deleteHangHoa')
    body.set('payload', JSON.stringify({ Ma_hang: item.Ma_hang }))

    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })
    
    const data = await res.json()
    if (data.ok) {
      alert('Xóa thành công!')
      fetchData()
    } else {
      alert('Không thể xóa. Lỗi: ' + (data.error || ''))
    }
  } catch (err) {
    console.error('Delete error:', err)
    alert('Đã xóa offline hoặc API backend chưa hỗ trợ')
  } finally {
    loading.value = false
  }
}

const saveItem = async () => {
  if (!formData.value.Ma_hang || !formData.value.Ten_hang) {
    alert('Vui lòng điền mã hàng và tên hàng')
    return
  }
  
  saving.value = true
  try {
    // Array order must match spreadsheet columns
    const payload = [
      formData.value.Ma_hang,
      formData.value.Ten_hang,
      formData.value.Main_img || '',
      formData.value.Ma_nha_cung_cap || '',
      formData.value.Ten_nha_cung_cap || '',
      formData.value.Mo_ta_chung || '',
      formData.value.Mo_ta_chi_tiet || '',
      formData.value.Features || '',
      formData.value.Danh_muc || '',
      formData.value.License_duration || '',
      formData.value.DVT || '',
      formData.value.Gia_tieu_chuan || 0,
      formData.value.Don_gia || 0,
      formData.value.Trang_thai || '',
      formData.value.Don_vi_tien_te || 'VND',
      formData.value.Ti_gia || 0,
      formData.value.Thue_VAT || 0,
      formData.value.Ma_hang_lien_ket || '',
      formData.value.Ten_hang_lien_ket || '',
      formData.value.Ghi_chu || '',
      formData.value.gia_hardware || 0,
      formData.value.gia_nhap || 0,
      formData.value.muc_phan_tram_off || 0,
      formData.value.Type || ''
    ]

    const body = new URLSearchParams()
    // Giả định backend dùng action addHangHoa. Nếu không có thì sẽ ghi log
    body.set('action', isEditing.value ? 'editHangHoa' : 'addHangHoa')
    body.set('payload', JSON.stringify(payload))

    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })
    
    const data = await res.json()
    if (data.ok) {
      alert(isEditing.value ? 'Cập nhật thành công!' : 'Thêm mới thành công!')
      closeModal()
      fetchData()
    } else {
      // Trường hợp backend chưa hỗ trợ action này
      alert('Không thể lưu (Có thể API backend chưa hỗ trợ action addHangHoa). Lỗi: ' + (data.error || ''))
    }
  } catch (err) {
    console.error('Save error:', err)
    alert('Đã lưu offline hoặc API backend chưa hỗ trợ')
    closeModal()
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.quan-ly-hang-hoa {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
}
.type-badge.bg-hw {
  background: #e0e7ff;
  color: #2563eb;
}
.type-badge.bg-sub {
  background: #dcfce7;
  color: #16a34a;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.filters {
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  font-size: 14px;
}

.data-table th {
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
}

.item-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.no-img {
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #94a3b8;
  text-align: center;
}

.item-name {
  font-weight: 500;
  color: #1e293b;
}

.item-desc {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.text-center { text-align: center; }
.text-muted { color: #64748b; }
.py-8 { padding-top: 32px; padding-bottom: 32px; }

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #f1f5f9;
}

.text-primary { color: #3b82f6; }
.text-danger { color: #ef4444; }
.btn-icon.text-danger:hover { background: #fee2e2; }

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
}

.form-group input, .form-group textarea, .form-group select {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.spinner {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========== IMPORT MODAL ========== */
.import-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.import-modal {
  background: #ffffff;
  border-radius: 16px;
  width: 96vw;
  max-width: 1800px;
  max-height: 94vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05);
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.import-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  border-bottom: 1px solid #e2e8f0;
}
.import-modal__header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.import-modal__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.import-modal__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.import-modal__subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: #64748b;
}
.import-modal__close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.import-modal__close:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* Stats */
.import-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px 28px;
}
.import-stat-card {
  padding: 14px 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: transform 0.15s;
}
.import-stat-card:hover {
  transform: translateY(-1px);
}
.import-stat-card__value {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.import-stat-card__label {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.import-stat-card--blue {
  background: #eff6ff;
  border-color: #bfdbfe;
}
.import-stat-card--blue .import-stat-card__value { color: #2563eb; }
.import-stat-card--amber {
  background: #fffbeb;
  border-color: #fde68a;
}
.import-stat-card--amber .import-stat-card__value { color: #d97706; }
.import-stat-card--green {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.import-stat-card--green .import-stat-card__value { color: #16a34a; font-size: 15px; }

/* Tabs */
.import-tabs {
  display: flex;
  gap: 6px;
  padding: 0 28px 14px;
  overflow-x: auto;
}
.import-tabs::-webkit-scrollbar { height: 4px; }
.import-tabs::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.import-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.import-tab:hover {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #2563eb;
}
.import-tab--active {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);
}
.import-tab--active:hover {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white;
  border-color: transparent;
}
.import-tab__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 6px;
  background: rgba(0,0,0,0.08);
  font-size: 11px;
  font-weight: 700;
}
.import-tab--active .import-tab__badge {
  background: rgba(255,255,255,0.25);
}

/* Table Wrapper */
.import-table-wrap {
  flex: 1;
  overflow: auto;
  margin: 0 28px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}
.import-table-wrap::-webkit-scrollbar { width: 8px; height: 8px; }
.import-table-wrap::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.import-table-wrap::-webkit-scrollbar-corner { background: transparent; }

/* Table */
.import-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  white-space: nowrap;
}
.import-table thead {
  position: sticky;
  top: 0;
  z-index: 12;
}
.import-table th {
  padding: 10px 12px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-bottom: 2px solid #e2e8f0;
  text-align: left;
  white-space: nowrap;
}
.import-table td {
  padding: 4px 6px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}

.import-th--sticky-left {
  position: sticky;
  left: 0;
  z-index: 11;
  background: #f1f5f9;
}
.import-th--idx {
  width: 44px;
  min-width: 44px;
  text-align: center;
}

.import-row:nth-child(even) td { background: #f8fafc; }
.import-row:hover td { background: #eff6ff !important; }
.import-row__idx {
  font-weight: 600;
  font-size: 12px;
  color: #94a3b8;
  background: white !important;
  border-right: 1px solid #e2e8f0;
}
.import-row:nth-child(even) .import-row__idx { background: #f8fafc !important; }
.import-row:hover .import-row__idx { background: #eff6ff !important; }

/* Inputs */
.imp-input {
  width: 100%;
  padding: 5px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  background: white;
  color: #1e293b;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
  box-sizing: border-box;
}
.imp-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}
.imp-input--code {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: #6366f1;
  font-weight: 600;
}
.imp-input--num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.imp-input--sm {
  text-align: center;
}
.imp-input--textarea {
  min-height: 48px;
  resize: vertical;
  line-height: 1.4;
}

/* Footer */
.import-modal__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  border-top: 1px solid #e2e8f0;
}
.import-btn-save {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}
.import-btn-save:hover {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}
.import-btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
