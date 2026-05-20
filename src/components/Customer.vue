<template>
  <div class="report-container">
    <header class="header">
      <div class="title-section">
        <h1>Quản Lý Khách Hàng</h1>
        <p class="subtitle">Theo dõi và cập nhật thông tin khách hàng chi tiết</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openAddModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Thêm Khách Hàng</span>
        </button>
      </div>
    </header>

    <!-- Elite Filters -->
    <div class="filters">
      <div class="filter-row top-row">
        <div class="filter-group" style="flex: 1;">
          <label>Tìm kiếm</label>
          <input type="text" v-model="filters.search" placeholder="Nhập tên, email, sđt, công ty..." class="search-input" />
        </div>
        <div class="filter-group">
          <label>Trạng Thái</label>
          <select v-model="filters.trang_thai">
            <option value="">Tất cả</option>
            <option value="Mới">Mới</option>
            <option value="Đang chăm sóc">Đang chăm sóc</option>
            <option value="Chốt deal">Chốt deal</option>
            <option value="Đã huỷ">Đã huỷ</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn-refresh" @click="fetchCustomers">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
            Làm mới
          </button>
        </div>
      </div>
    </div>

    <!-- Thống kê -->
    <div class="stats-row">
      <div class="stat-card card-total" 
           :class="{ 'elite-active': !filters.trang_thai }"
           @click="filters.trang_thai = ''">
        <div class="stat-icon total">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Tổng cộng</span>
          <span class="stat-value">{{ customers.length }} <span class="unit-text">KH</span></span>
        </div>
      </div>
      <div class="stat-card card-care" 
           :class="{ 'elite-active': filters.trang_thai === 'Đang chăm sóc' }"
           @click="filters.trang_thai = 'Đang chăm sóc'">
        <div class="stat-icon care">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Đang chăm sóc</span>
          <span class="stat-value">{{ careCount }} <span class="unit-text">KH</span></span>
        </div>
      </div>
      <div class="stat-card card-deal" 
           :class="{ 'elite-active': filters.trang_thai === 'Chốt deal' }"
           @click="filters.trang_thai = 'Chốt deal'">
        <div class="stat-icon deal">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Chốt deal</span>
          <span class="stat-value">{{ dealCount }} <span class="unit-text">KH</span></span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-bar">
      <button class="mobile-action-btn add" @click="openAddModal">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Thêm mới
      </button>
    </div>

    <!-- Bảng Dữ Liệu (PC) -->
    <div class="table-wrapper desktop-only">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu khách hàng...</p>
      </div>
      <div v-else class="table-scroll">
        <table class="report-table">
          <thead>
            <tr>
              <th class="sticky-col">STT</th>
              <th class="sticky-col-2">Mã KH</th>
              <th>Tên Khách Hàng</th>
              <th>Email Cá Nhân</th>
              <th>SĐT Cá Nhân</th>
              <th>Mã Công Ty</th>
              <th>Tên Công Ty</th>
              <th>SĐT Công Ty</th>
              <th>Fax Công Ty</th>
              <th>Địa Chỉ Công Ty</th>
              <th>Email Công Ty</th>
              <th>Website Công Ty</th>
              <th>Hoa Hồng</th>
              <th>Tổng Chi Tiêu</th>
              <th>Công Nợ</th>
              <th>Trạng Thái</th>
              <th>Ghi Chú</th>
              <th class="text-right sticky-col-right">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="customers.length === 0">
              <td colspan="18" class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                <p>Không có khách hàng nào.</p>
              </td>
            </tr>
            <tr v-for="(kh, index) in filteredCustomers" :key="kh.ma_khach_hang" class="animate-row clickable-row" @click="openEditModal(kh)">
              <td class="col-index sticky-col">{{ index + 1 }}</td>
              <td class="sticky-col-2"><strong>{{ kh.ma_khach_hang }}</strong></td>
              <td>{{ kh.ten_khach_hang }}</td>
              <td>{{ kh.email_ca_nhan }}</td>
              <td>{{ kh.so_dien_thoai_ca_nhan }}</td>
              <td>{{ kh.ma_cong_ty }}</td>
              <td>{{ kh.ten_cong_ty }}</td>
              <td>{{ kh.so_dien_thoai_cong_ty }}</td>
              <td>{{ kh.so_fax_cong_ty }}</td>
              <td><div class="truncate" :title="kh.dia_chi_cong_ty">{{ kh.dia_chi_cong_ty }}</div></td>
              <td>{{ kh.email_cong_ty }}</td>
              <td>{{ kh.website_cong_ty }}</td>
              <td>{{ formatCurrency(kh.hoa_hong) }}</td>
              <td>{{ formatCurrency(kh.tong_chi_tieu) }}</td>
              <td>
                <span :class="{'text-danger': kh.cong_no_chua_thanh_toan > 0}">
                  {{ formatCurrency(kh.cong_no_chua_thanh_toan) }}
                </span>
              </td>
              <td>
                <div class="status-pill-tag" :class="getStatusPillClass(kh.trang_thai)">
                  {{ kh.trang_thai || 'N/A' }}
                </div>
              </td>
              <td><div class="truncate" :title="kh.ghi_chu">{{ kh.ghi_chu }}</div></td>
              <td class="col-actions text-right sticky-col-right">
                <button class="btn-icon delete" @click.stop="confirmDelete(kh.ma_khach_hang)" title="Xoá">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile view -->
    <div class="card-list mobile-only">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
      <div v-else-if="customers.length === 0" class="empty-state" style="padding: 3rem;">
        <p>Không có khách hàng nào.</p>
      </div>
      <div v-else v-for="(kh, index) in filteredCustomers" :key="'card-' + kh.ma_khach_hang" 
           class="report-card" @click="openEditModal(kh)">
        <div class="card-row-header">
          <span class="card-id">#{{ index + 1 }}</span>
          <div class="card-time-group">
            <div class="time-primary">
              <span>{{ kh.ten_khach_hang }}</span>
            </div>
            <div class="time-secondary">{{ kh.ma_khach_hang }}</div>
          </div>
          <div class="status-pill-mini" :class="getStatusPillClass(kh.trang_thai)">{{ kh.trang_thai || 'Mới' }}</div>
        </div>
        <div class="card-row-content">
          <div class="content-title" style="font-size: 0.95rem; font-weight: normal; display: flex; flex-direction: column; gap: 0.25rem;">
            <div v-if="kh.so_dien_thoai_ca_nhan" class="info-line">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>{{ kh.so_dien_thoai_ca_nhan }}</span>
            </div>
            <div v-if="kh.email_ca_nhan" class="info-line">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span>{{ kh.email_ca_nhan }}</span>
            </div>
            <div v-if="kh.ten_cong_ty" class="info-line">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
              <span>{{ kh.ten_cong_ty }}</span>
            </div>
            <div v-if="kh.cong_no_chua_thanh_toan" class="info-line text-danger">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <span>Nợ: {{ formatCurrency(kh.cong_no_chua_thanh_toan) }}</span>
            </div>
          </div>
        </div>
        <div class="card-row-actions">
          <button class="btn-action-full delete" @click.stop="confirmDelete(kh.ma_khach_hang)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Xoá</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal-overlay" v-if="isModalOpen" @click.self="closeModal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Chỉnh Sửa Khách Hàng' : 'Thêm Khách Hàng Mới' }}</h2>
          <button class="btn-close" @click="closeModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <form @submit.prevent="saveCustomer" class="form-scroll">
          <div class="form-grid">
            <!-- Cột 1: Cá nhân -->
            <div class="form-section">
              <h3 class="section-title">Thông tin cá nhân</h3>
              
              <div class="form-group">
                <label>Tên Khách Hàng <span class="required">*</span></label>
                <input type="text" v-model="formData.ten_khach_hang" required class="form-input" />
              </div>
              
              <div class="form-group">
                <label>SĐT Cá Nhân</label>
                <input type="text" v-model="formData.so_dien_thoai_ca_nhan" class="form-input" />
              </div>
              
              <div class="form-group">
                <label>Email Cá Nhân</label>
                <input type="email" v-model="formData.email_ca_nhan" class="form-input" />
              </div>

              <div class="form-group">
                <label>Trạng Thái</label>
                <div class="select-wrapper">
                  <select v-model="formData.trang_thai">
                    <option value="Mới">Mới</option>
                    <option value="Đang chăm sóc">Đang chăm sóc</option>
                    <option value="Chốt deal">Chốt deal</option>
                    <option value="Đã huỷ">Đã huỷ</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Cột 2: Công ty -->
            <div class="form-section">
              <h3 class="section-title">Thông tin công ty</h3>
              
              <div class="form-group row">
                <div class="col">
                  <label>Mã Công Ty</label>
                  <input type="text" v-model="formData.ma_cong_ty" class="form-input" />
                </div>
                <div class="col">
                  <label>Tên Công Ty</label>
                  <input type="text" v-model="formData.ten_cong_ty" class="form-input" />
                </div>
              </div>
              
              <div class="form-group row">
                <div class="col">
                  <label>SĐT Công Ty</label>
                  <input type="text" v-model="formData.so_dien_thoai_cong_ty" class="form-input" />
                </div>
                <div class="col">
                  <label>Fax Công Ty</label>
                  <input type="text" v-model="formData.so_fax_cong_ty" class="form-input" />
                </div>
              </div>

              <div class="form-group row">
                <div class="col">
                  <label>Email Công Ty</label>
                  <input type="email" v-model="formData.email_cong_ty" class="form-input" />
                </div>
                <div class="col">
                  <label>Website Công Ty</label>
                  <input type="text" v-model="formData.website_cong_ty" class="form-input" />
                </div>
              </div>

              <div class="form-group">
                <label>Địa Chỉ Công Ty</label>
                <input type="text" v-model="formData.dia_chi_cong_ty" class="form-input" />
              </div>
            </div>

            <!-- Cột 3: Tài chính & Khác -->
            <div class="form-section">
              <h3 class="section-title">Tài chính & Khác</h3>
              
              <div class="form-group">
                <label>Hoa Hồng</label>
                <input type="number" v-model="formData.hoa_hong" class="form-input" />
              </div>
              
              <div class="form-group">
                <label>Tổng Chi Tiêu</label>
                <input type="number" v-model="formData.tong_chi_tieu" class="form-input" />
              </div>

              <div class="form-group">
                <label>Công Nợ Chưa Thanh Toán</label>
                <input type="number" v-model="formData.cong_no_chua_thanh_toan" class="form-input" />
              </div>

              <div class="form-group">
                <label>Ghi Chú</label>
                <textarea v-model="formData.ghi_chu" rows="3" class="form-input"></textarea>
              </div>
            </div>
            <!-- Cột 4: Thông tin phụ -->
            <div class="form-section">
              <h3 class="section-title">Thông tin phụ</h3>
              
              <div class="form-group row">
                <div class="col">
                  <label>Tên KH Phụ</label>
                  <input type="text" v-model="formData.ten_khach_hang_phu" class="form-input" />
                </div>
                <div class="col">
                  <label>SĐT KH Phụ</label>
                  <input type="text" v-model="formData.so_dien_thoai_ca_nhan_phu" class="form-input" />
                </div>
              </div>

              <div class="form-group row">
                <div class="col">
                  <label>Email KH Phụ</label>
                  <input type="email" v-model="formData.email_ca_nhan_phu" class="form-input" />
                </div>
                <div class="col">
                  <label>MST</label>
                  <input type="text" v-model="formData.mst" class="form-input" />
                </div>
              </div>

              <div class="form-group row">
                <div class="col">
                  <label>COMPANY</label>
                  <input type="text" v-model="formData.company" class="form-input" />
                </div>
                <div class="col">
                  <label>TEL</label>
                  <input type="text" v-model="formData.tel" class="form-input" />
                </div>
              </div>

              <div class="form-group">
                <label>ADDRESS</label>
                <input type="text" v-model="formData.address" class="form-input" />
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal" :disabled="saving">Huỷ Bỏ</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-small"></span>
              {{ isEditing ? 'Lưu Thay Đổi' : 'Thêm Khách Hàng' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

const customers = ref([])
const loading = ref(false)
const saving = ref(false)

const filters = ref({
  search: '',
  trang_thai: ''
})

const formatCurrency = (value) => {
  if (!value && value !== 0) return '';
  if (isNaN(Number(value))) return value;
  return Number(value).toLocaleString('vi-VN');
}

const filteredCustomers = computed(() => {
  let result = customers.value;
  if (filters.value.trang_thai) {
    result = result.filter(c => c.trang_thai === filters.value.trang_thai);
  }
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase();
    result = result.filter(c => 
      (c.ten_khach_hang && c.ten_khach_hang.toLowerCase().includes(q)) ||
      (c.so_dien_thoai_ca_nhan && c.so_dien_thoai_ca_nhan.includes(q)) ||
      (c.ten_cong_ty && c.ten_cong_ty.toLowerCase().includes(q)) ||
      (c.email_ca_nhan && c.email_ca_nhan.toLowerCase().includes(q))
    );
  }
  return result;
});

const careCount = computed(() => customers.value.filter(c => c.trang_thai === 'Đang chăm sóc').length);
const dealCount = computed(() => customers.value.filter(c => c.trang_thai === 'Chốt deal').length);

const isModalOpen = ref(false)
const isEditing = ref(false)
const formData = ref({})

const initFormData = () => ({
  ma_khach_hang: '',
  ten_khach_hang: '',
  email_ca_nhan: '',
  so_dien_thoai_ca_nhan: '',
  ma_cong_ty: '',
  ten_cong_ty: '',
  so_dien_thoai_cong_ty: '',
  so_fax_cong_ty: '',
  dia_chi_cong_ty: '',
  email_cong_ty: '',
  website_cong_ty: '',
  hoa_hong: '',
  tong_chi_tieu: '',
  cong_no_chua_thanh_toan: '',
  trang_thai: 'Mới',
  ghi_chu: '',
  ten_khach_hang_phu: '',
  so_dien_thoai_ca_nhan_phu: '',
  email_ca_nhan_phu: '',
  mst: '',
  company: '',
  address: '',
  tel: ''
})

const fetchCustomers = async () => {
  loading.value = true
  try {
    const url = new URL(API_URL)
    url.searchParams.append('sheet', 'khach_hang')
    url.searchParams.append('action', 'get')

    const response = await fetch(url.toString())
    const result = await response.json()
    if (result.status === 'success') {
      customers.value = result.data || []
    } else {
      alert('Lỗi khi tải dữ liệu: ' + result.message)
    }
  } catch (error) {
    console.error('Lỗi fetch data:', error)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEditing.value = false
  formData.value = initFormData()
  isModalOpen.value = true
}

const openEditModal = (kh) => {
  isEditing.value = true
  formData.value = { ...kh }
  isModalOpen.value = true
}

const closeModal = () => {
  if (saving.value) return;
  isModalOpen.value = false
}

const saveCustomer = async () => {
  saving.value = true
  try {
    const payload = {
      sheet: 'khach_hang',
      action: isEditing.value ? 'update' : 'add',
      ...formData.value
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    
    const result = await response.json()
    
    if (result.status === 'success') {
      isModalOpen.value = false
      fetchCustomers() 
    } else {
      alert('Lỗi lưu dữ liệu: ' + result.message)
    }
  } catch (error) {
    console.error('Lỗi khi lưu:', error)
    alert('Có lỗi xảy ra trong quá trình lưu dữ liệu.')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (ma_khach_hang) => {
  if (!confirm('Xác nhận xoá khách hàng này?')) return;
  
  try {
    const payload = {
      sheet: 'khach_hang',
      action: 'delete',
      ma_khach_hang
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    
    const result = await response.json()
    if (result.status === 'success') {
      fetchCustomers()
    } else {
      alert('Lỗi xoá: ' + result.message)
    }
  } catch (error) {
    console.error('Lỗi khi xoá:', error)
  }
}

const getStatusPillClass = (status) => {
  if (!status) return 'status-default';
  const s = status.toLowerCase();
  if (s.includes('mới')) return 'status-pending';
  if (s.includes('chăm sóc')) return 'status-info';
  if (s.includes('chốt')) return 'status-success';
  if (s.includes('huỷ')) return 'status-danger';
  return 'status-default';
}

onMounted(() => {
  fetchCustomers()
})
</script>

<style scoped>
/* Common Styles from report.vue for consistency */
.report-container {
  padding: 1.5rem 2rem;
  max-width: 100%;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .report-container { padding: 1rem; }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.title-section h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.header-actions { display: flex; gap: 1rem; }

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.85rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 2px 8px rgba(59,130,246,0.3);
}

.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35); }

.stats-row {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #1e293b;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  border: 1px solid #334155;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.stat-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  transform: translateY(-3px);
  border-color: #475569;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon.total { background: rgba(59,130,246,0.15); color: #60a5fa; }
.stat-icon.care { background: rgba(245,158,11,0.15); color: #fbbf24; }
.stat-icon.deal { background: rgba(16,185,129,0.15); color: #34d399; }
.stat-icon.cancel { background: rgba(239,68,68,0.15); color: #f87171; }
.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 1.75rem; font-weight: 700; color: #60a5fa; line-height: 1; display: flex; align-items: baseline; gap: 0.3rem; }
.stat-label { font-size: 0.9rem; margin-bottom: 0.3rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #93c5fd; }
.unit-text { font-size: 0.95rem; font-weight: 500; opacity: 0.8; }
.card-care .stat-value { color: #fbbf24; }
.card-care .stat-label { color: #fcd34d; }
.card-deal .stat-value { color: #34d399; }
.card-deal .stat-label { color: #6ee7b7; }
.card-cancel .stat-value { color: #f87171; }
.card-cancel .stat-label { color: #fca5a5; }
.elite-active { border-color: #10b981 !important; background: #0f172a !important; box-shadow: 0 0 0 2px rgba(16,185,129,0.2) !important; }

.filters {
  position: relative;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.7);
  box-shadow: 0 8px 32px -4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8);
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.75rem 1.5rem;
  overflow: hidden;
}
.filters::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10b981 0%, #34d399 40%, #6ee7b7 70%, #a7f3d0 100%);
  border-radius: 20px 20px 0 0;
}

.filter-row { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 1.5rem; }
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-group label { margin-bottom: 0; font-size: 0.75rem; text-transform: uppercase; color: #64748b; }
.search-input {
  padding: 0.6rem 1.2rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  background: rgba(248,250,252,0.8);
  width: 100%;
  box-sizing: border-box;
  transition: all 0.25s ease;
}
.search-input:focus {
  border-color: #34d399;
  background: white;
  outline: none;
  box-shadow: 0 0 0 4px rgba(16,185,129,0.08), 0 2px 8px -2px rgba(16,185,129,0.12);
}
.filter-group select {
  padding: 0.6rem 2.5rem 0.6rem 1.2rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  background: rgba(248,250,252,0.8);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 14px;
  transition: all 0.25s ease;
  box-sizing: border-box;
}
.filter-group select:focus {
  border-color: #34d399;
  background-color: white;
  outline: none;
  box-shadow: 0 0 0 4px rgba(16,185,129,0.08), 0 2px 8px -2px rgba(16,185,129,0.12);
}

.btn-secondary {
  background: white;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover { background: #f8fafc; border-color: #94a3b8; }

.table-wrapper {
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px -4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.04);
  overflow: hidden;
  position: relative;
  margin-bottom: 1.5rem;
}

.table-scroll {
  overflow-x: auto;
  max-width: 100%;
}

.report-table { 
  width: 100%; 
  border-collapse: collapse; 
  text-align: left;
  white-space: nowrap;
}
.report-table th { 
  background: #0f172a; 
  padding: 1rem 1.25rem; 
  font-size: 0.75rem; 
  text-transform: uppercase; 
  letter-spacing: 0.08em; 
  color: #94a3b8; 
  font-weight: 700; 
  border-bottom: 2px solid #1e293b; 
}

.report-table td { 
  padding: 1rem 1.25rem; 
  border-bottom: 1px solid #f1f5f9; 
  vertical-align: middle; 
}

.truncate {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Cố định cột STT và Mã KH, Cột Hành Động */
.sticky-col { position: sticky; left: 0; background: inherit; z-index: 1; border-right: 1px solid #f1f5f9; }
.sticky-col-2 { position: sticky; left: 60px; background: inherit; z-index: 1; border-right: 1px solid #f1f5f9; }
.sticky-col-right { position: sticky; right: 0; background: inherit; z-index: 1; border-left: 1px solid #f1f5f9; }
.report-table th.sticky-col, .report-table th.sticky-col-2, .report-table th.sticky-col-right { background: #0f172a; z-index: 2; }

.clickable-row { cursor: pointer; transition: background-color 0.2s; background: white; }
.clickable-row:hover { background-color: #f8fafc; }

.status-pill-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-default { background: #f1f5f9; color: #475569; }
.status-pending { background: #eff6ff; color: #3b82f6; }
.status-info { background: #fef3c7; color: #d97706; }
.status-success { background: #ecfdf5; color: #059669; }
.status-danger { background: #fef2f2; color: #dc2626; }

.text-danger { color: #dc2626; font-weight: 600; }

.btn-icon {
  background: none;
  border: none;
  padding: 0.4rem;
  border-radius: 8px;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
}

.btn-icon.delete:hover { color: #ef4444; background: #fef2f2; }

.text-right { text-align: right; }

/* Modal */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center;
  z-index: 99999;
  padding: 1rem;
}

.modal {
  background: white; width: 100%; 
  border-radius: 20px; padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  display: flex; flex-direction: column;
}

.modal-lg {
  max-width: 1000px;
  max-height: 95vh;
}

.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-shrink: 0; }
.modal-header h2 { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0; }
.btn-close { background: none; border: none; cursor: pointer; color: #64748b; padding: 0.5rem; border-radius: 8px; }
.btn-close:hover { background: #f1f5f9; color: #0f172a; }

.form-scroll {
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* 3 columns grid for the modal */
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

@media (max-width: 1024px) {
  .form-grid { grid-template-columns: 1fr; gap: 0; }
}

.section-title { font-size: 1rem; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin: 0 0 1rem; font-weight: 700; }
.form-section { display: flex; flex-direction: column; margin-bottom: 1.5rem; }

.form-group { margin-bottom: 1.25rem; }
.form-group.row { display: flex; gap: 1rem; }
.form-group.row .col { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }

.form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; color: #475569; }
.required { color: #ef4444; }
.form-input, .select-wrapper select, textarea {
  width: 100%; padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1; border-radius: 10px;
  font-size: 0.95rem; background: #fff;
  transition: all 0.2s;
  box-sizing: border-box;
}
.form-input:focus, .select-wrapper select:focus, textarea:focus {
  outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}

.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; flex-shrink: 0; }
.btn-cancel { padding: 0.75rem 1.5rem; border: none; background: white; color: #64748b; font-weight: 600; cursor: pointer; border-radius: 10px; }
.btn-cancel:hover { background: #f1f5f9; color: #0f172a; }

.desktop-only { display: block; }
.mobile-only { display: none; }

/* Action Bar */
.action-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: flex-end;
}
.mobile-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.05rem;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.mobile-action-btn.add {
  background: #3b82f6;
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}
.mobile-action-btn.add:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
/* Refresh Button */
.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.1rem;
  background: linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(52,211,153,0.08) 100%);
  color: #10b981;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(16,185,129,0.15);
  cursor: pointer;
  transition: all 0.25s;
}
.btn-refresh:hover {
  background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(52,211,153,0.15) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(16,185,129,0.2);
}

@media (max-width: 768px) {
  .desktop-only { display: none; }
  .mobile-only { display: block; }
  .header { flex-direction: column; align-items: stretch; gap: 1rem; }
  .header-actions { display: none; }
  .form-group.row { flex-direction: column; }
  .stats-row { flex-wrap: wrap; gap: 0.75rem; }
  .stat-card { flex: 1 1 calc(50% - 0.5rem); min-width: 0; padding: 1rem; }
  .stat-icon { width: 36px; height: 36px; }
  .stat-value { font-size: 1.25rem; }
  .stat-label { font-size: 0.65rem; }
  .mobile-action-btn { padding: 0.7rem 1.5rem; font-size: 0.9rem; border-radius: 10px; }
  .card-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
  .report-card {
    background: white; border-radius: 16px; padding: 1.25rem;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    border: 1px solid #f1f5f9;
  }
  .card-row-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; }
  .card-time-group { flex: 1; }
  .time-primary { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
  .time-secondary { font-size: 0.8rem; color: #94a3b8; font-weight: 500; margin-top: 0.1rem; }
  .card-row-content { margin-bottom: 0.75rem; }
  .card-row-actions { display: flex; gap: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #f1f5f9; }
  .btn-action-full { flex: 1; padding: 0.6rem; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; }
  .btn-action-full.delete { background: #ef4444; color: white; border: 1px solid #dc2626; }
}
</style>
