const fs = require('fs');

// 1. Create QuanLyDieuKhoan.vue
const vueContent = `<template>
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

    <!-- Main Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 50px">STT</th>
            <th>Khách hàng</th>
            <th>Công ty</th>
            <th style="width: 40%">Nội dung điều khoản</th>
            <th class="text-center" style="width: 120px">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && !items.length">
            <td colspan="5" class="text-center py-8 text-muted">Đang tải dữ liệu...</td>
          </tr>
          <tr v-else-if="!items.length">
            <td colspan="5" class="text-center py-8 text-muted">Không có điều khoản nào.</td>
          </tr>
          <tr v-for="(item, index) in items" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td>
              <div class="customer-info">
                <span class="customer-name">{{ item.tenKH || '---' }}</span>
                <span class="customer-id text-muted">{{ item.maKH }}</span>
              </div>
            </td>
            <td>
              <div class="customer-info">
                <span class="customer-name">{{ item.tenCT || '---' }}</span>
                <span class="customer-id text-muted">{{ item.maCT }}</span>
              </div>
            </td>
            <td>
              <div class="noi-dung-text">{{ item.noiDung }}</div>
            </td>
            <td class="text-center actions-cell">
              <button class="btn btn-sm btn-outline-warning" @click="openEditModal(item)" title="Sửa">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteItem(item)" title="Xóa">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEdit ? 'Sửa Điều khoản' : 'Thêm Điều khoản mới' }}</h2>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveItem" class="form-grid">
            <div class="form-group">
              <label>Mã khách hàng</label>
              <input v-model="formData.maKH" type="text" placeholder="Nhập mã khách hàng" />
            </div>
            <div class="form-group">
              <label>Tên khách hàng</label>
              <input v-model="formData.tenKH" type="text" placeholder="Nhập tên khách hàng" />
            </div>
            <div class="form-group">
              <label>Mã công ty</label>
              <input v-model="formData.maCT" type="text" placeholder="Nhập mã công ty" />
            </div>
            <div class="form-group">
              <label>Tên công ty</label>
              <input v-model="formData.tenCT" type="text" placeholder="Nhập tên công ty" />
            </div>
            <div class="form-group full-width">
              <label>Nội dung điều khoản</label>
              <textarea v-model="formData.noiDung" rows="8" placeholder="Nhập nội dung điều khoản..." required></textarea>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const BASE_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

interface DieuKhoan {
  id: string;
  maKH: string;
  tenKH: string;
  maCT: string;
  tenCT: string;
  noiDung: string;
}

const loading = ref(false)
const saving = ref(false)
const items = ref<DieuKhoan[]>([])

const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref('')

const formData = reactive({
  maKH: '',
  tenKH: '',
  maCT: '',
  tenCT: '',
  noiDung: ''
})

async function fetchData() {
  loading.value = true
  try {
    const res = await fetch(`${BASE_URL}?action=dieu_khoan`)
    const data = await res.json()
    if (Array.isArray(data)) {
      items.value = data.map(r => ({
        id: String(r[0] || ''),
        maKH: String(r[1] || ''),
        tenKH: String(r[2] || ''),
        maCT: String(r[3] || ''),
        tenCT: String(r[4] || ''),
        noiDung: String(r[5] || '')
      })).filter(i => i.id)
    }
  } catch (err) {
    console.error('Error fetching dieu khoan:', err)
    alert('Lỗi tải dữ liệu.')
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  isEdit.value = false
  currentId.value = ''
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
  try {
    const payload = {
      action: isEdit.value ? 'update_dieu_khoan' : 'create_dieu_khoan',
      ID: isEdit.value ? currentId.value : undefined,
      Ma_khach_hang: formData.maKH,
      Ten_khach_hang: formData.tenKH,
      Ma_cong_ty: formData.maCT,
      Ten_cong_ty: formData.tenCT,
      Noi_dung: formData.noiDung
    }

    const res = await fetch(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (data.ok) {
      showModal.value = false
      fetchData()
    } else {
      alert('Lỗi khi lưu: ' + (data.error || 'Unknown Error'))
    }
  } catch (err) {
    console.error('Save error:', err)
    alert('Lỗi kết nối khi lưu.')
  } finally {
    saving.value = false
  }
}

async function deleteItem(item: DieuKhoan) {
  if (!confirm('Bạn có chắc chắn muốn xóa điều khoản này?')) return

  loading.value = true
  try {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'delete_dieu_khoan',
        ID: item.id
      })
    })
    const data = await res.json()
    if (data.ok) {
      fetchData()
    } else {
      alert('Lỗi khi xóa: ' + (data.error || 'Unknown Error'))
    }
  } catch (err) {
    console.error('Delete error:', err)
    alert('Lỗi kết nối khi xóa.')
  } finally {
    loading.value = false
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

.table-container {
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: rgba(30, 41, 59, 0.5);
  color: #94a3b8;
  font-weight: 600;
  font-size: 13px;
  padding: 14px 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
  font-size: 14px;
}

.data-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-name {
  font-weight: 600;
  color: #f8fafc;
}

.customer-id {
  font-size: 12px;
}

.noi-dung-text {
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #e2e8f0;
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
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-outline-warning {
  background: transparent;
  border: 1px solid #f59e0b;
  color: #f59e0b;
}

.btn-outline-warning:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.1);
}

.btn-outline-danger {
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
}

.btn-outline-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
}

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  border-bottom: none !important;
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
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #f8fafc;
}

.close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #f1f5f9;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

input, textarea {
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

input:focus, textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
`;

fs.writeFileSync('src/components/QuanLyDieuKhoan.vue', vueContent);

// 2. Update router/index.ts
let routerCode = fs.readFileSync('src/router/index.ts', 'utf8');
if (!routerCode.includes('QuanLyDieuKhoan')) {
  routerCode = routerCode.replace(
    "import QuanLyBaoGia from '../components/QuanLyBaoGia.vue'",
    "import QuanLyBaoGia from '../components/QuanLyBaoGia.vue'\nimport QuanLyDieuKhoan from '../components/QuanLyDieuKhoan.vue'"
  );
  
  routerCode = routerCode.replace(
    "component: QuanLyBaoGia\n  }",
    "component: QuanLyBaoGia\n  },\n  {\n    path: '/quanlydieukhoan',\n    name: 'QuanLyDieuKhoan',\n    component: QuanLyDieuKhoan\n  }"
  );
  fs.writeFileSync('src/router/index.ts', routerCode);
}

// 3. Update App.vue
let appCode = fs.readFileSync('src/App.vue', 'utf8');
if (!appCode.includes('/quanlydieukhoan')) {
  const sidebarLink = `
        <router-link to="/quanlydieukhoan" class="nav-item" title="Quản lý Điều khoản">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
          <span v-if="isSidebarOpen">Quản lý Điều khoản</span>
        </router-link>`;
  appCode = appCode.replace("</nav>", sidebarLink + "\n      </nav>");
  fs.writeFileSync('src/App.vue', appCode);
}
