<template>
  <div class="quan-ly-bao-gia">
    <div class="page-header">
      <h1 class="page-title">Quản lý báo giá</h1>
      <div class="actions">
        <button class="btn btn-primary" @click="router.push('/baogia')">
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
    <div class="filters-card">
      <div class="filter-group">
        <label>Tìm kiếm</label>
        <div class="search-input">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" v-model="searchKeyword" placeholder="Số hợp đồng, tên khách hàng..." />
        </div>
      </div>
      <div class="filter-group">
        <label>Khách hàng</label>
        <select v-model="customerFilter">
          <option value="ALL">Tất cả khách hàng</option>
          <option v-for="c in uniqueCustomers" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Trạng thái</label>
        <select v-model="statusFilter">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="Tạm">Tạm</option>
          <option value="Chính thức">Chính thức</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Từ ngày</label>
        <input type="date" v-model="fromDate" />
      </div>
      <div class="filter-group">
        <label>Đến ngày</label>
        <input type="date" v-model="toDate" />
      </div>
    </div>

    <!-- Main Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Số hợp đồng</th>
            <th>Khách hàng</th>
            <th>Ngày tạo</th>
            <th class="text-right">Tổng trước thuế</th>
            <th class="text-right">Thuế VAT</th>
            <th class="text-right">Tổng thanh toán</th>
            <th class="text-center">Trạng thái</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && !contracts.length">
            <td colspan="9" class="text-center py-8 text-muted">Đang tải dữ liệu...</td>
          </tr>
          <tr v-else-if="!filteredContracts.length">
            <td colspan="9" class="text-center py-8 text-muted">Không tìm thấy báo giá nào.</td>
          </tr>
          <tr v-for="(item, index) in filteredContracts" :key="item.ma_hop_dong">
            <td>{{ index + 1 }}</td>
            <td class="font-medium text-primary">{{ item.so_hop_dong }}</td>
            <td>
              <div class="customer-info">
                <span class="customer-name">{{ item.ten_khach_hang }}</span>
                <span class="customer-id text-muted">{{ item.ma_khach_hang }}</span>
              </div>
            </td>
            <td>{{ item.ngay_tao }}</td>
            <td class="text-right font-medium">{{ formatVND(item.tong_truoc_thue) }} ₫</td>
            <td class="text-right text-muted">{{ formatVND(item.tong_vat) }} ₫</td>
            <td class="text-right font-bold text-success">{{ formatVND(item.tong_sau_thue) }} ₫</td>
            <td class="text-center">
              <span class="badge" :class="item.trang_thai === 'Chính thức' ? 'badge-success' : 'badge-warning'">
                {{ item.trang_thai }}
              </span>
            </td>
            <td class="text-center actions-cell">
              <button class="btn btn-sm btn-outline-warning" @click="editContract(item)" title="Sửa báo giá">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn btn-sm btn-outline-primary" @click="viewDetails(item)" title="Xem chi tiết">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h2>Chi tiết báo giá: {{ selectedContract?.so_hop_dong }}</h2>
          <button class="close-btn" @click="showDetailModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="contract-summary">
            <div class="summary-item">
              <label>Khách hàng:</label>
              <span>{{ selectedContract?.ten_khach_hang }}</span>
            </div>
            <div class="summary-item">
              <label>Ngày tạo:</label>
              <span>{{ selectedContract?.ngay_tao }}</span>
            </div>
            <div class="summary-item">
              <label>Trạng thái:</label>
              <span class="badge" :class="selectedContract?.trang_thai === 'Chính thức' ? 'badge-success' : 'badge-warning'">
                {{ selectedContract?.trang_thai }}
              </span>
            </div>
          </div>

          <h3 class="section-title mt-4">Danh sách sản phẩm</h3>
          <div class="table-container mt-2">
            <table class="data-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã hàng</th>
                  <th>Tên hàng</th>
                  <th>ĐVT</th>
                  <th class="text-right">Số lượng</th>
                  <th class="text-right">Đơn giá</th>
                  <th class="text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingDetails">
                  <td colspan="7" class="text-center py-4 text-muted">Đang tải chi tiết...</td>
                </tr>
                <tr v-else-if="!selectedContractDetails.length">
                  <td colspan="7" class="text-center py-4 text-muted">Không có sản phẩm nào.</td>
                </tr>
                <tr v-for="(detail, i) in selectedContractDetails" :key="i">
                  <td>{{ i + 1 }}</td>
                  <td>{{ detail.ma_hang }}</td>
                  <td class="font-medium">{{ detail.ten_hang }}</td>
                  <td>{{ detail.dvt }}</td>
                  <td class="text-right">{{ detail.so_luong }}</td>
                  <td class="text-right">{{ formatVND(detail.don_gia) }} ₫</td>
                  <td class="text-right font-medium">{{ formatVND(detail.don_gia * detail.so_luong) }} ₫</td>
                </tr>
              </tbody>
              <tfoot v-if="selectedContractDetails.length">
                <tr>
                  <td colspan="6" class="text-right font-bold">Tổng cộng:</td>
                  <td class="text-right font-bold text-success">
                    {{ formatVND(selectedContractDetails.reduce((sum, d) => sum + d.don_gia * d.so_luong, 0)) }} ₫
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDetailModal = false">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const BASE_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

interface Contract {
  ma_hop_dong: string;
  so_hop_dong: string;
  ma_khach_hang: string;
  ten_khach_hang: string;
  ngay_tao: string;
  tong_truoc_thue: number;
  tong_vat: number;
  tong_sau_thue: number;
  trang_thai: string;
  ghi_chu: string;
  created_time: string;
}

interface ContractDetail {
  ma_hang: string;
  ten_hang: string;
  dvt: string;
  so_luong: number;
  don_gia: number;
}

const loading = ref(false)
const contracts = ref<Contract[]>([])
const allDetailsRaw = ref<any[][]>([]) // Cache all details

// Filters
const searchKeyword = ref('')
const statusFilter = ref('ALL')
const customerFilter = ref('ALL')
const fromDate = ref('')
const toDate = ref('')

const uniqueCustomers = computed(() => {
  const map = new Map<string, string>()
  contracts.value.forEach(c => {
    if (c.ma_khach_hang) {
      map.set(c.ma_khach_hang, c.ten_khach_hang)
    }
  })
  return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
})

// Helper to parse "HH:mm, DD/MM/YYYY" or "HH:mm:ss DD/MM/YYYY" to Date object
function parseVietnameseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    return new Date(year, month, day);
  }
  return null;
}

const filteredContracts = computed(() => {
  const from = fromDate.value ? new Date(fromDate.value) : null;
  const to = toDate.value ? new Date(toDate.value) : null;
  if (from) from.setHours(0, 0, 0, 0);
  if (to) to.setHours(23, 59, 59, 999);

  return contracts.value.filter(c => {
    let match = true
    
    if (statusFilter.value !== 'ALL' && c.trang_thai !== statusFilter.value) {
      match = false
    }
    
    if (customerFilter.value !== 'ALL' && c.ma_khach_hang !== customerFilter.value) {
      match = false
    }
    
    if (searchKeyword.value) {
      const kw = searchKeyword.value.toLowerCase()
      const searchStr = `${c.so_hop_dong} ${c.ten_khach_hang} ${c.ma_khach_hang}`.toLowerCase()
      if (!searchStr.includes(kw)) match = false
    }
    
    if (from || to) {
      const itemDate = parseVietnameseDate(c.ngay_tao);
      if (itemDate) {
        if (from && itemDate < from) match = false;
        if (to && itemDate > to) match = false;
      }
    }
    
    return match
  })
})

// Modal
const showDetailModal = ref(false)
const selectedContract = ref<Contract | null>(null)
const loadingDetails = ref(false)
const selectedContractDetails = ref<ContractDetail[]>([])

async function fetchData() {
  loading.value = true
  try {
    const [hdRes, detailRes] = await Promise.all([
      fetch(`${BASE_URL}?action=hop_dong_tong_quat`).then(r => r.json()),
      fetch(`${BASE_URL}?action=hop_dong_chi_tiet`).then(r => r.json())
    ])

    const hdRows = Array.isArray(hdRes) ? hdRes : []
    allDetailsRaw.value = Array.isArray(detailRes) ? detailRes : []

    // Map rows to objects
    // reverse to show newest first
    const mapped: Contract[] = hdRows.map(r => ({
      ma_hop_dong: String(r[0] || ''),
      so_hop_dong: String(r[1] || ''),
      ma_khach_hang: String(r[2] || ''),
      ten_khach_hang: String(r[3] || ''),
      ngay_tao: String(r[21] || r[4] || ''), // Prefer created_time, fallback to ngay_tao_hop_dong
      tong_truoc_thue: Number(r[5] || 0),
      tong_vat: Number(r[6] || 0),
      tong_sau_thue: Number(r[7] || 0),
      trang_thai: String(r[15] || ''),
      ghi_chu: String(r[16] || ''),
      created_time: String(r[21] || '')
    }))

    // Filter out rows with empty ma_hop_dong (like header or empty rows) and sort by created time desc
    contracts.value = mapped.filter(c => c.ma_hop_dong).reverse()

  } catch (err) {
    console.error('Error fetching data:', err)
    alert('Lỗi tải dữ liệu. Vui lòng thử lại.')
  } finally {
    loading.value = false
  }
}

function viewDetails(contract: Contract) {
  selectedContract.value = contract
  showDetailModal.value = true
  loadingDetails.value = true
  
  setTimeout(() => {
    const details = allDetailsRaw.value.filter(r => String(r[0] || '') === contract.ma_hop_dong)
    selectedContractDetails.value = details.map(r => ({
      ma_hang: String(r[2] || ''),
      ten_hang: String(r[3] || ''),
      dvt: String(r[12] || ''),
      so_luong: Number(r[18] || 1), 
      don_gia: Number(r[14] || 0)   
    }))
    loadingDetails.value = false
  }, 100)
}

function editContract(contract: Contract) {
  router.push(`/baogia?ma=${contract.ma_hop_dong}`)
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(n))
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.quan-ly-bao-gia {
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

.filters-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input svg {
  position: absolute;
  left: 12px;
  color: #64748b;
}

.search-input input {
  padding-left: 36px;
  width: 300px;
}

input, select {
  background-color: var(--bg);
  border: 1px solid var(--border);
  color: #f1f5f9;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  transition: all 0.2s;
  outline: none;
}

input:focus, select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
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
  vertical-align: middle;
  font-size: 14px;
}

.data-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.text-right { text-align: right; }
.text-center { text-align: center; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 700; }
.text-muted { color: #94a3b8; }
.text-primary { color: #3b82f6; }
.text-success { color: #10b981; }

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

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

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

.btn-outline-primary {
  background: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
}

.btn-outline-primary:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.1);
}

.btn-primary {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-outline-warning {
  background: transparent;
  border: 1px solid #f59e0b;
  color: #f59e0b;
}

.btn-outline-warning:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.1);
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
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.large-modal {
  max-width: 900px;
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

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.contract-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  background: rgba(30, 41, 59, 0.3);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item label {
  font-size: 12px;
  color: #94a3b8;
  text-transform: uppercase;
}

.summary-item span {
  font-weight: 600;
  font-size: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 24px 0 12px 0;
}

.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.py-8 { padding-top: 32px; padding-bottom: 32px; }
</style>
