<template>
  <div class="quan-ly-dieu-khoan">
    <div class="page-header">
      <h1 class="page-title">Quản lý Điều khoản</h1>
      <div class="actions">
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
    <div class="search-bar" style="margin: 0 auto 24px auto; position: relative; max-width: 450px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #10b981;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" v-model="searchQuery" placeholder="Tìm tên mẫu, nội dung, tên công ty, khách..." style="width: 100%; padding: 14px 14px 14px 48px; border-radius: 9999px; border: 1px solid rgba(16,185,129,0.3); background: rgba(15,23,42,0.6); color: #f8fafc; font-size: 15px; outline: none; transition: all 0.25s;" onfocus="this.style.borderColor='#10b981'; this.style.boxShadow='0 0 0 3px rgba(16,185,129,0.1)'" onblur="this.style.borderColor='rgba(16,185,129,0.3)'; this.style.boxShadow='none'" />
      <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: #64748b; font-size: 16px; cursor: pointer;">✕</button>
    </div>

    <!-- Main Grid -->
    <div class="terms-grid">
      <template v-if="loading && !items.length">
        <div v-for="n in 6" :key="n" class="folder-header skeleton-card">
          <div class="folder-tab" style="background: rgba(30,41,59,0.5); border: 1px solid rgba(255,255,255,0.05); border-bottom: none;">
            <div class="skeleton-badge" style="width: 100px; height: 16px;"></div>
          </div>
          
          <div class="folder-body" style="background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 0 12px 12px 12px; padding: 20px; display: flex; flex-direction: column; gap: 20px;">
            <div class="card-actions" style="position: absolute; top: 16px; right: 20px; display: flex; gap: 8px;">
              <div class="skeleton-btn" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.05);"></div>
              <div class="skeleton-btn" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.05);"></div>
            </div>
            
            <div class="info-row" style="margin-right: 80px;">
              <div class="info-group">
                <div class="skeleton-label" style="width: 80px; height: 12px; background: rgba(255,255,255,0.1); border-radius: 4px;"></div>
                <div class="customer-info">
                  <div class="skeleton-text skeleton-name" style="width: 150px; height: 16px; margin-top: 4px; background: rgba(255,255,255,0.1); border-radius: 4px;"></div>
                  <div class="skeleton-text skeleton-id" style="width: 100px; height: 12px; margin-top: 4px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
                </div>
              </div>
              
              <div class="info-group">
                <div class="skeleton-label" style="width: 80px; height: 12px; background: rgba(255,255,255,0.1); border-radius: 4px;"></div>
                <div class="customer-info">
                  <div class="skeleton-text skeleton-name" style="width: 150px; height: 16px; margin-top: 4px; background: rgba(255,255,255,0.1); border-radius: 4px;"></div>
                  <div class="skeleton-text skeleton-id" style="width: 100px; height: 12px; margin-top: 4px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
                </div>
              </div>
            </div>
            
            <div class="content-preview-container" style="background: rgba(0,0,0,0.2); border-radius: 10px; padding: 16px;">
              <div class="skeleton-label" style="width: 120px; height: 12px; margin-bottom: 12px; background: rgba(255,255,255,0.1); border-radius: 4px;"></div>
              <div class="skeleton-content">
                <div class="skeleton-text line" style="width: 100%; height: 12px; margin-bottom: 8px; background: rgba(255,255,255,0.08); border-radius: 4px;"></div>
                <div class="skeleton-text line" style="width: 85%; height: 12px; margin-bottom: 8px; background: rgba(255,255,255,0.08); border-radius: 4px;"></div>
                <div class="skeleton-text line short" style="width: 60%; height: 12px; background: rgba(255,255,255,0.08); border-radius: 4px;"></div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else-if="!filteredItems.length" class="empty-state text-center py-8 text-muted" style="grid-column: 1 / -1;">
        Không tìm thấy điều khoản nào.
      </div>
      
      <div v-else v-for="(item, index) in filteredItems" :key="item.id" class="folder-header clickable-card" @click="openEditModal(item)">
        <div class="folder-tab" style="background: linear-gradient(135deg, #059669, #10b981); border-color: rgba(16,185,129,0.5); color: #ffffff; box-shadow: 0 0 10px rgba(16,185,129,0.3);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;" v-html="highlightText(item.mau || 'Mặc định', searchQuery)"></span>
          </div>
        </div>
        
        <div class="folder-body" style="background: linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.95)); border: 1px solid rgba(16,185,129,0.4); border-radius: 0 12px 12px 12px; padding: 20px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);">
          <!-- Absolute actions at top right -->
          <div class="card-actions" style="position: absolute; top: 16px; right: 20px; display: flex; gap: 8px;">
            <button class="btn-icon btn-outline-warning" @click.stop="openEditModal(item)" title="Sửa">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-icon btn-outline-danger" @click.stop="requestDelete(item)" title="Xóa">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
          
          <div class="info-row" style="margin-right: 80px;">
            <div class="info-group">
              <span class="info-label" style="color: #64748b;">Khách hàng</span>
              <div class="customer-info">
                <span class="customer-name" style="color: #f8fafc; font-size: 15px;" :title="item.tenKH || '---'" v-html="highlightText(item.tenKH || '---', searchQuery)"></span>
              </div>
            </div>
            
            <div class="info-group">
              <span class="info-label" style="color: #64748b;">Công ty</span>
              <div class="customer-info">
                <span class="customer-name" style="color: #f8fafc; font-size: 15px;" :title="item.tenCT || '---'" v-html="highlightText(item.tenCT || '---', searchQuery)"></span>
              </div>
            </div>
          </div>
          
          <div class="content-preview-container" style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 16px;">
            <span class="info-label" style="color: #64748b; margin-bottom: 8px; display: block;">Nội dung điều khoản</span>
            <div class="noi-dung-text content-preview" v-html="highlightHTML(item.noiDung, searchQuery)"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEdit ? 'Sửa Điều khoản' : 'Thêm Điều khoản mới' }}</h2>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveItem" class="form-split">
            <!-- Cột 1: Thông tin -->
            <div class="split-col-left">
              <div class="form-group">
                <label>Tên Mẫu (Để dễ nhận diện)</label>
                <input v-model="formData.mau" type="text" placeholder="VD: Mẫu chuẩn 2026, Mẫu dự án A..." />
              </div>
              <div class="form-group">
                <label>Mã khách hàng</label>
                <input v-model="formData.maKH" list="dl-ma-kh" type="text" placeholder="Nhập mã khách hàng" @change="fillCustomerByMa(formData.maKH)" />
                <datalist id="dl-ma-kh">
                  <option v-for="c in customers" :key="'ma'+c.Ma_khach_hang" :value="c.Ma_khach_hang">{{ c.Ten_khach_hang }}</option>
                </datalist>
              </div>
              <div class="form-group">
                <label>Tên khách hàng</label>
                <input v-model="formData.tenKH" list="dl-ten-kh" type="text" placeholder="Nhập tên khách hàng" @change="fillCustomerByTen(formData.tenKH)" />
                <datalist id="dl-ten-kh">
                  <option v-for="c in customers" :key="'ten'+c.Ma_khach_hang" :value="c.Ten_khach_hang">{{ c.Ma_khach_hang }}</option>
                </datalist>
              </div>
              <div class="form-group">
                <label>Mã công ty</label>
                <input v-model="formData.maCT" type="text" placeholder="Nhập mã công ty" />
              </div>
              <div class="form-group">
                <label>Tên công ty</label>
                <input v-model="formData.tenCT" type="text" placeholder="Nhập tên công ty" />
              </div>
            </div>

            <!-- Cột 2: Nội dung -->
            <div class="split-col-right">
              <div class="form-group" style="display: flex; flex-direction: column; flex: 1;">
                <label>Nội dung điều khoản</label>
                <ExcelEditor v-model="formData.noiDung" placeholder="Nhập nội dung điều khoản..." style="flex: 1; min-height: 550px;" />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Hủy</button>
          <button class="btn btn-primary" @click="saveItem" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            <span>{{ isEdit ? 'Lưu thay đổi' : 'Thêm mới' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Xác nhận Xóa -->
    <div v-if="showDeleteModal" class="modal-overlay" style="z-index: 1050;" @click.self="showDeleteModal = false">
      <div class="modal-content" style="max-width: 450px; height: auto;">
        <div class="modal-header" style="background: transparent; border-bottom: none; padding-bottom: 0;">
          <h2 style="color: #f1f5f9; font-size: 18px; text-transform: none; display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Xác nhận xóa
          </h2>
          <button class="close-btn" @click="showDeleteModal = false">×</button>
        </div>
        <div class="modal-body" style="padding: 20px 24px;">
          Bạn có chắc chắn muốn xóa điều khoản <strong>{{ itemToDelete?.mau || 'này' }}</strong> không? Hành động này không thể hoàn tác.
        </div>
        <div class="modal-footer" style="padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; gap: 12px; background: rgba(0,0,0,0.2);">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Hủy</button>
          <button class="btn btn-primary" style="background: #ef4444; border-color: #ef4444;" @click="confirmDelete" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            <span>Xóa</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Navigate Loading Overlay -->
    <Teleport to="body">
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
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import ExcelEditor from './ExcelEditor.vue'

const BASE_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

interface DieuKhoan {
  id: string;
  mau: string;
  maKH: string;
  tenKH: string;
  maCT: string;
  tenCT: string;
  noiDung: string;
}

interface KhachHang {
  Ma_khach_hang: string;
  Ten_khach_hang: string;
  Ma_cong_ty: string;
  Ten_cong_ty: string;
}

const loading = ref(false)
const saving = ref(false)
const items = ref<DieuKhoan[]>([])
const customers = ref<KhachHang[]>([])

const showModal = ref(false)
const showDeleteModal = ref(false)
const itemToDelete = ref<DieuKhoan | null>(null)
const searchQuery = ref('')
const isEdit = ref(false)
const currentId = ref('')

const normalizeStr = (s: string) => {
  if (!s) return ''
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '')
}

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  const q = normalizeStr(searchQuery.value)
  return items.value.filter(i => 
    normalizeStr(i.mau).includes(q) ||
    normalizeStr(i.tenKH).includes(q) ||
    normalizeStr(i.tenCT).includes(q) ||
    normalizeStr(i.noiDung).includes(q)
  )
})

function highlightText(text: string, query: string) {
  if (!query || !text || text === '---') return text;
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, 'gi');
  return text.replace(regex, '<span style="background-color: #eab308; color: #0f172a; font-weight: bold; padding: 0 2px; border-radius: 2px;">$1</span>');
}

function highlightHTML(html: string, query: string) {
  if (!query || !html) return html;
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Avoid replacing inside HTML tags by using negative lookahead for '>' without a preceding '<'
  const regex = new RegExp(`(${safeQuery})(?![^<]*>)`, 'gi');
  return html.replace(regex, '<span style="background-color: #eab308; color: #0f172a; font-weight: bold; padding: 0 2px; border-radius: 2px;">$1</span>');
}

const asyncResultModal = ref<{ show: boolean, type: 'loading' | 'success' | 'error', title: string, msg: string }>({
  show: false, type: 'loading', title: '', msg: ''
})
let asyncResultTimeout: any = null

function showAsyncLoading(title: string) {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'loading', title, msg: '' }
}
function showAsyncSuccess(title: string, msg: string = '') {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'success', title, msg }
  asyncResultTimeout = setTimeout(() => { asyncResultModal.value.show = false }, 3000)
}
function showAsyncError(title: string, msg: string = '') {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'error', title, msg }
}

const formData = reactive({
  mau: '',
  maKH: '',
  tenKH: '',
  maCT: '',
  tenCT: '',
  noiDung: ''
})

function fillCustomerByMa(ma: string) {
  const c = customers.value.find(x => x.Ma_khach_hang === ma)
  if (c) {
    formData.tenKH = c.Ten_khach_hang
    formData.maCT = c.Ma_cong_ty
    formData.tenCT = c.Ten_cong_ty
  }
}

function fillCustomerByTen(ten: string) {
  const c = customers.value.find(x => x.Ten_khach_hang === ten)
  if (c) {
    formData.maKH = c.Ma_khach_hang
    formData.maCT = c.Ma_cong_ty
    formData.tenCT = c.Ten_cong_ty
  }
}

async function fetchData() {
  loading.value = true
  try {
    const res = await fetch(`${BASE_URL}?action=all`)
    const allData = await res.json()
    
    const dkData = allData.dieu_khoan || []
    const khData = allData.khach_hang || []

    if (Array.isArray(dkData)) {
      items.value = dkData.map(r => ({
        id: String(r[0] || ''),
        mau: String(r[1] || ''),
        maKH: String(r[2] || ''),
        tenKH: String(r[3] || ''),
        maCT: String(r[4] || ''),
        tenCT: String(r[5] || ''),
        noiDung: String(r[6] || '')
      })).filter(i => i.id).reverse()
    }

    if (Array.isArray(khData)) {
      customers.value = khData.map(r => ({
        Ma_khach_hang: String(r[0] || ''),
        Ten_khach_hang: String(r[1] || ''),
        Ma_cong_ty: String(r[4] || ''),
        Ten_cong_ty: String(r[5] || '')
      })).filter(c => c.Ma_khach_hang)
    }
  } catch (err) {
    console.error('Error fetching data:', err)
    alert('Lỗi tải dữ liệu.')
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  isEdit.value = false
  currentId.value = ''
  formData.mau = ''
  formData.maKH = ''
  formData.tenKH = ''
  formData.maCT = ''
  formData.tenCT = ''
  formData.noiDung = ''
  showModal.value = true
}

function openEditModal(item: DieuKhoan) {
  isEdit.value = true
  currentId.value = item.id
  formData.mau = item.mau
  formData.maKH = item.maKH
  formData.tenKH = item.tenKH
  formData.maCT = item.maCT
  formData.tenCT = item.tenCT
  formData.noiDung = item.noiDung
  showModal.value = true
}

async function saveItem() {
  if (!formData.noiDung.trim()) {
    alert('Vui lòng nhập nội dung điều khoản!')
    return
  }

  saving.value = true
  showAsyncLoading('Đang lưu dữ liệu...')
  try {
    const actionName = isEdit.value ? 'update_dieu_khoan' : 'create_dieu_khoan'
    const payload = {
      ID: isEdit.value ? currentId.value : undefined,
      Mau: formData.mau,
      Ma_khach_hang: formData.maKH,
      Ten_khach_hang: formData.tenKH,
      Ma_cong_ty: formData.maCT,
      Ten_cong_ty: formData.tenCT,
      Noi_dung: formData.noiDung
    }

    const body = new URLSearchParams()
    body.set('action', actionName)
    body.set('payload', JSON.stringify(payload))

    const res = await fetch(BASE_URL, {
      method: 'POST',
      body
    })
    const data = await res.json()
    if (data.ok) {
      showModal.value = false
      showAsyncSuccess('Lưu thành công!', isEdit.value ? 'Đã cập nhật điều khoản.' : 'Đã thêm điều khoản mới.')
      fetchData()
    } else {
      showAsyncError('Lỗi khi lưu', data.error || 'Unknown Error')
    }
  } catch (err) {
    console.error('Save error:', err)
    showAsyncError('Lỗi kết nối khi lưu.')
  } finally {
    saving.value = false
  }
}

function requestDelete(item: DieuKhoan) {
  itemToDelete.value = item
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!itemToDelete.value) return
  const item = itemToDelete.value

  saving.value = true
  showAsyncLoading('Đang xóa dữ liệu...')
  try {
    const body = new URLSearchParams()
    body.set('action', 'delete_dieu_khoan')
    body.set('payload', JSON.stringify({ ID: item.id }))

    const res = await fetch(BASE_URL, {
      method: 'POST',
      body
    })
    const data = await res.json()
    if (data.ok) {
      showDeleteModal.value = false
      itemToDelete.value = null
      showAsyncSuccess('Xóa thành công!', 'Điều khoản đã được xóa.')
      fetchData()
    } else {
      showAsyncError('Lỗi khi xóa', data.error || 'Unknown Error')
    }
  } catch (err) {
    console.error('Delete error:', err)
    showAsyncError('Lỗi kết nối khi xóa.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.quan-ly-dieu-khoan {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #f1f5f9;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.terms-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

/* FOLDER STYLE CARDS */
.folder-header {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.clickable-card {
  cursor: pointer;
}
.folder-header:hover {
  transform: translateY(-4px);
}
.folder-tab {
  background: linear-gradient(135deg, #059669, #10b981);
  border: 1px solid rgba(16, 185, 129, 0.5);
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  padding: 8px 24px;
  width: max-content;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
}
.folder-body {
  position: relative;
  z-index: 2;
  margin-top: -1px;
}

.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.bg-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon svg {
  width: 14px;
  height: 14px;
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748b;
  font-weight: 700;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.customer-name {
  font-size: 14px;
  color: #f8fafc;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.customer-id {
  font-size: 12px;
  font-family: 'JetBrains Mono', Consolas, monospace;
}

.content-preview-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  flex: 1;
}

.content-preview {
  font-size: 13px;
  line-height: 1.6;
  color: #cbd5e1;
}

.noi-dung-text * {
  max-width: 100%;
}

.noi-dung-text table {
  width: 100% !important;
  border-collapse: collapse;
}

.noi-dung-text td, .noi-dung-text th {
  padding: 2px 4px;
}

.text-right { text-align: right; }
.text-center { text-align: center; }
.text-muted { color: #94a3b8; }
.py-8 { padding-top: 32px; padding-bottom: 32px; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--surface);
  border: 1px solid var(--border);
  color: #f8fafc;
}

.btn-secondary:hover:not(:disabled) {
  background: #334155;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-primary {
  background: #10b981;
  border: 1px solid #10b981;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #059669;
}

.btn-outline-warning {
  background: transparent;
  border: 1px solid #f59e0b;
  color: #f59e0b;
}

.btn-outline-warning:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.15);
}

.btn-outline-danger {
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
}

.btn-outline-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.15);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal-content {
  background: var(--bg);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 16px;
  width: 95vw;
  max-width: 1500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #059669, #10b981);
  border-bottom: 1px solid rgba(16, 185, 129, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #ffffff;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.7);
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #ffffff;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-split {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  flex: 1;
  min-height: 0;
}

.split-col-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.split-col-right {
  display: flex;
  flex-direction: column;
}

.split-col-right .form-group {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
}

input, textarea, select {
  background-color: var(--surface);
  border: 1px solid var(--border);
  color: #f1f5f9;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

input:focus, textarea:focus, select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Skeleton Loading */
.skeleton-card {
  pointer-events: none;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.skeleton-badge,
.skeleton-btn,
.skeleton-label,
.skeleton-text {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-badge {
  width: 80px;
  height: 24px;
  border-radius: 20px;
}

.skeleton-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.skeleton-label {
  width: 60px;
  height: 12px;
  margin-bottom: 6px;
}

.skeleton-name {
  width: 140px;
  height: 16px;
  margin-bottom: 4px;
}

.skeleton-id {
  width: 100px;
  height: 14px;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.skeleton-content .line {
  height: 14px;
  width: 100%;
}

.skeleton-content .line.short {
  width: 60%;
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
  0% { transform: scale(0.85); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes async-modal-out {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0; }
}
</style>
