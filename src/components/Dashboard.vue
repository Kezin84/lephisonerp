<template>
  <div class="dashboard-container">
    <header class="header">
      <div class="title-section">
        <h1 class="main-title">Báo Cáo Tổng Quát</h1>
        <p class="subtitle">Tổng quan tình hình công việc, báo giá và gia hạn sản phẩm</p>
      </div>
      <div class="header-actions">
        <button class="refresh-btn" @click="fetchData" :disabled="loading">
          <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          <span v-if="loading" class="spinner-small"></span>
          <span>Làm mới</span>
        </button>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p style="margin-top: 1rem; color: #94a3b8;">Đang tải dữ liệu tổng hợp...</p>
    </div>

    <div v-else class="dashboard-content">
      <!-- Section 1: Công việc -->
      <section class="dashboard-section work-section">
        <div class="section-header">
          <div class="icon-wrap bg-blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
          <h2>Báo cáo công việc</h2>
        </div>
        
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title">Tổng công việc</div>
            <div class="kpi-value text-blue">{{ reports.length }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Chưa hoàn thành</div>
            <div class="kpi-value text-red">{{ pendingReports.length }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Đã hoàn thành</div>
            <div class="kpi-value text-green">{{ completedReports.length }}</div>
          </div>
        </div>

        <div class="list-panel">
          <div class="list-header">Top 5 việc ưu tiên chưa xử lý</div>
          <div class="list-body">
            <div v-if="topPendingReports.length === 0" class="empty-list">Không có công việc ưu tiên nào.</div>
            <div v-else v-for="r in topPendingReports" :key="r.id" class="list-item">
              <div class="item-icon pending"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
              <div class="item-content">
                <div class="item-title">{{ r.noi_dung }}</div>
                <div class="item-sub">{{ r.thoi_gian }} - {{ r.phan_loai }}</div>
              </div>
              <div v-if="r.tag && r.tag.includes('ƯU TIÊN')" class="item-badge badge-red">Ưu tiên</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2: Báo giá -->
      <section class="dashboard-section quotes-section">
        <div class="section-header">
          <div class="icon-wrap bg-purple"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg></div>
          <h2>Quản lý Báo giá</h2>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title">Tổng báo giá</div>
            <div class="kpi-value text-purple">{{ quotes.length }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Đang xử lý (Tạm)</div>
            <div class="kpi-value text-orange">{{ processingQuotes.length }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Đã chốt (Chính thức)</div>
            <div class="kpi-value text-green">{{ completedQuotes.length }}</div>
          </div>
        </div>

        <div class="list-panel">
          <div class="list-header">Báo giá đang chờ xử lý gần đây</div>
          <div class="list-body">
            <div v-if="recentProcessingQuotes.length === 0" class="empty-list">Không có báo giá đang xử lý.</div>
            <div v-else v-for="q in recentProcessingQuotes" :key="q.ma_hop_dong" class="list-item">
              <div class="item-icon processing"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
              <div class="item-content">
                <div class="item-title">{{ q.ma_hop_dong }} - {{ q.ten_khach_hang }}</div>
                <div class="item-sub">Tổng giá: {{ formatVND(q.tong_gia_thuc_te || 0) }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 3: Sản phẩm cần gia hạn -->
      <section class="dashboard-section renewals-section">
        <div class="section-header">
          <div class="icon-wrap bg-orange"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>
          <h2>Sản phẩm cần gia hạn</h2>
        </div>

        <div class="kpi-grid kpi-grid-2">
          <div class="kpi-card">
            <div class="kpi-title">Sắp hết hạn (≤ 90 ngày)</div>
            <div class="kpi-value text-orange">{{ renewalsComing.length }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Đã quá hạn</div>
            <div class="kpi-value text-red">{{ renewalsExpired.length }}</div>
          </div>
        </div>

        <div class="list-panel">
          <div class="list-header">Danh sách sắp hết hạn / Quá hạn</div>
          <div class="list-body">
            <div v-if="allRenewals.length === 0" class="empty-list">Không có sản phẩm nào cần gia hạn.</div>
            <div v-else v-for="(r, i) in allRenewals.slice(0, 5)" :key="i" class="list-item">
              <div class="item-icon" :class="r.daysLeft < 0 ? 'expired' : 'coming'"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>
              <div class="item-content">
                <div class="item-title">{{ r.ten_hang }}</div>
                <div class="item-sub">{{ r.ten_khach_hang }} | {{ r.ten_cong_ty }}</div>
              </div>
              <div class="item-badge" :class="r.daysLeft < 0 ? 'badge-red' : 'badge-orange'">
                {{ r.daysLeft < 0 ? `Quá hạn ${Math.abs(r.daysLeft)} ngày` : `Còn ${r.daysLeft} ngày` }}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'
const loading = ref(true)

// Data references
const reports = ref<any[]>([])
const quotes = ref<any[]>([])
const quoteDetails = ref<any[]>([])
const customers = ref<any[]>([])

// Format utils
const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

const calculateDaysDiff = (start: string, end: string) => {
  if (!start || !end) return 9999
  const parse = (s: string) => {
    const p = s.split('/')
    if (p.length === 3) return new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]))
    return new Date()
  }
  const sDate = parse(start)
  const eDate = parse(end)
  const now = new Date()
  return Math.ceil((eDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
}

const fetchData = async () => {
  loading.value = true
  try {
    const [resReports, resQuotes, resDetails, resCustomers] = await Promise.all([
      fetch(`${API_URL}?action=get`).then(r => r.json()),
      fetch(`${API_URL}?action=hop_dong_tong_quat`).then(r => r.json()),
      fetch(`${API_URL}?action=hop_dong_chi_tiet`).then(r => r.json()),
      fetch(`${API_URL}?action=khach_hang`).then(r => r.json())
    ])

    reports.value = resReports.data || []
    quotes.value = resQuotes || []
    quoteDetails.value = resDetails || []
    customers.value = resCustomers || []

  } catch (error) {
    console.error('Lỗi khi tải dữ liệu dashboard:', error)
  } finally {
    loading.value = false
  }
}

// Computed for Reports
const pendingReports = computed(() => reports.value.filter(r => r.trang_thai !== 'Hoàn thành'))
const completedReports = computed(() => reports.value.filter(r => r.trang_thai === 'Hoàn thành'))
const topPendingReports = computed(() => {
  return pendingReports.value.filter(r => r.tag && r.tag.includes('ƯU TIÊN')).slice(0, 5)
})

// Computed for Quotes
const processingQuotes = computed(() => quotes.value.filter(q => q.trang_thai_hop_dong === 'Tạm' || !q.trang_thai_hop_dong))
const completedQuotes = computed(() => quotes.value.filter(q => q.trang_thai_hop_dong === 'Chính thức'))
const recentProcessingQuotes = computed(() => processingQuotes.value.slice(-5).reverse())

// Computed for Renewals
const allRenewals = computed(() => {
  const list: any[] = []
  quoteDetails.value.forEach(d => {
    if (d.start_date && d.end_date) {
      const daysLeft = calculateDaysDiff(d.start_date, d.end_date)
      if (daysLeft <= 90) { // Cần gia hạn
        // Tìm thông tin khách hàng từ ma_hop_dong -> ma_khach_hang -> khách hàng
        const hd = quotes.value.find(q => q.ma_hop_dong === d.ma_hop_dong)
        let tenKh = 'Không rõ'
        let tenCty = ''
        if (hd && hd.ma_khach_hang) {
          const kh = customers.value.find(k => k.ma_khach_hang === hd.ma_khach_hang)
          if (kh) {
            tenKh = kh.ten_khach_hang
            tenCty = kh.ten_cong_ty
          }
        }
        list.push({ ...d, daysLeft, ten_khach_hang: tenKh, ten_cong_ty: tenCty })
      }
    }
  })
  // Sort by days left ascending
  return list.sort((a, b) => a.daysLeft - b.daysLeft)
})

const renewalsComing = computed(() => allRenewals.value.filter(r => r.daysLeft >= 0))
const renewalsExpired = computed(() => allRenewals.value.filter(r => r.daysLeft < 0))

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dashboard-container {
  padding: 24px 32px;
  min-height: 100vh;
  background: #0f172a;
  color: #f8fafc;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.main-title {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #94a3b8;
  font-size: 15px;
  margin: 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(56, 189, 248, 0.2);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(56, 189, 248, 0.1);
  border-left-color: #38bdf8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(56, 189, 248, 0.1);
  border-left-color: #38bdf8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}

.dashboard-section {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #f1f5f9;
}

.icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-blue { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
.bg-purple { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
.bg-orange { background: rgba(249, 115, 22, 0.15); color: #f97316; }

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.kpi-grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.kpi-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 16px;
  text-align: center;
}

.kpi-title {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 800;
}

.text-blue { color: #38bdf8; }
.text-red { color: #ef4444; }
.text-green { color: #10b981; }
.text-purple { color: #a855f7; }
.text-orange { color: #f97316; }

.list-panel {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  overflow: hidden;
  flex: 1;
}

.list-header {
  padding: 14px 20px;
  font-size: 13px;
  font-weight: 700;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-transform: uppercase;
}

.list-body {
  padding: 8px;
}

.empty-list {
  padding: 20px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 10px;
  transition: background 0.2s;
}
.list-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.item-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.item-icon.pending { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.item-icon.processing { background: rgba(249, 115, 22, 0.1); color: #f97316; }
.item-icon.coming { background: rgba(249, 115, 22, 0.1); color: #f97316; }
.item-icon.expired { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.item-sub {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
}
.badge-red { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }
.badge-orange { background: rgba(249, 115, 22, 0.15); color: #fdba74; }

</style>
