<template>
  <div class="report-container">
    <header class="header">
      <div class="title-section">
        <h1>Quản Lý Khách Hàng</h1>
        <p class="subtitle">Theo dõi và cập nhật thông tin khách hàng chi tiết</p>
      </div>
    </header>



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
          <span class="stat-value">{{ totalCount }} <span class="unit-text">KH</span></span>
        </div>
      </div>
      <div class="stat-card card-renew" 
           :class="{ 'elite-active': filters.trang_thai === '__renew__' }"
           @click="filters.trang_thai = filters.trang_thai === '__renew__' ? '' : '__renew__'">
        <div class="stat-icon renew">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Cần gia hạn</span>
          <span class="stat-value">{{ renewCustomerCount }} <span class="unit-text">KH</span></span>
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
      <div class="stat-card card-potential" 
           :class="{ 'elite-active': filters.trang_thai === 'Tiềm năng' }"
           @click="filters.trang_thai = 'Tiềm năng'">
        <div class="stat-icon potential">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Tiềm năng</span>
          <span class="stat-value">{{ potentialCount }} <span class="unit-text">KH</span></span>
        </div>
      </div>
    </div>

    <!-- Thanh tìm kiếm mới (dưới card) -->
    <div style="margin-bottom: 24px; margin-top: 24px;">
      <div class="filter-search" style="max-width: 400px; margin: 0 auto; position: relative;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #94a3b8;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" v-model="filters.search" placeholder="Tìm tên, sđt, email, công ty..." style="width: 100%; border-radius: 9999px; padding: 16px 48px 16px 52px; border: 1px solid #10b981; background: rgba(15, 23, 42, 0.6); color: #f8fafc; font-size: 0.95rem; outline: none; box-sizing: border-box; transition: all 0.3s;" onfocus="this.style.borderColor='#34d399'; this.style.boxShadow='0 0 0 4px rgba(16,185,129,0.1)'; this.style.background='rgba(15, 23, 42, 0.9)'" onblur="this.style.borderColor='#10b981'; this.style.boxShadow='none'; this.style.background='rgba(15, 23, 42, 0.6)'" />
        <button v-if="filters.search" class="clear-search" @click="filters.search = ''" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px;" onmouseover="this.style.color='#f1f5f9'" onmouseout="this.style.color='#94a3b8'">✕</button>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-bar">
      <div class="action-bar-left" style="display: flex; gap: 8px;">
        <button class="btn-primary" @click="openAddModal" style="padding: 10px 16px; font-size: 14px; font-weight: 600;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>THÊM KHÁCH HÀNG</span>
        </button>
        <button class="mobile-action-btn btn-import" style="background: #2563eb; color: #ffffff; border: 1px solid #2563eb; font-weight: 800;" @click="triggerFileInput">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          IMPORT KHÁCH HÀNG
        </button>
        <input type="file" ref="fileInput" accept=".xlsx, .xls" style="display: none;" @change="handleFileUpload" multiple />
      </div>
    </div>

    <!-- Bảng Dữ Liệu (Dạng Card) -->
    <div class="card-list">
      <template v-if="loading">
        <div v-for="i in 8" :key="'skeleton-' + i" class="report-card skeleton-card">
          <div class="skeleton-header">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-title"></div>
          </div>
          <div class="skeleton-body">
            <div class="skeleton-line"></div>
            <div class="skeleton-line" style="width: 70%;"></div>
            <div class="skeleton-line" style="width: 40%;"></div>
          </div>
          <div class="skeleton-footer">
            <div class="skeleton-box"></div>
            <div class="skeleton-box"></div>
            <div class="skeleton-box"></div>
          </div>
        </div>
      </template>
      <div v-else-if="customers.length === 0" class="empty-state" style="padding: 3rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 1rem; color: #94a3b8; display: block;"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
        <p>Không có khách hàng nào.</p>
      </div>
      <div v-else v-for="(kh, index) in filteredCustomers" :key="'card-' + kh.ma_khach_hang" 
           class="report-card" @click="openEditModal(kh)">
        <div class="card-row-header">
          <span class="card-id">#{{ index + 1 }}</span>
          <div class="card-time-group">
            <div class="time-primary">
              <span v-html="highlightMatch(kh.ten_cong_ty || kh.ten_khach_hang)"></span>
            </div>
            <!-- Ẩn mã khách hàng theo yêu cầu -->
            <div v-show="false" class="time-secondary" v-html="highlightMatch(kh.ma_khach_hang)"></div>
          </div>
          <!-- Ẩn badge trạng thái theo yêu cầu -->
          <div v-show="false" class="status-pill-mini" :class="getStatusPillClass(kh.trang_thai)">{{ kh.trang_thai || 'Tiềm năng' }}</div>
        </div>
        
        <div class="card-row-content">
          <div class="content-title">
            <div v-if="kh.ten_khach_hang" class="info-line">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span v-html="highlightMatch(kh.ten_khach_hang)"></span>
            </div>
            <div v-if="kh.so_dien_thoai_ca_nhan" class="info-line">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span v-html="highlightMatch(kh.so_dien_thoai_ca_nhan)"></span>
            </div>
            <div v-if="kh.email_ca_nhan" class="info-line">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span v-html="highlightMatch(kh.email_ca_nhan)"></span>
            </div>
            
            <div class="financial-wrapper">
              <div class="financial-stats" style="border-top: none; margin-top: 0; padding-top: 0;">
              <div class="stat-item" v-if="kh.hopDongChotCount > 0">
                <span class="stat-label" style="text-transform: uppercase; display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Báo giá đã chốt:
                </span>
                <span class="stat-val" style="color: #10b981; font-weight: 800; display: flex; align-items: center; gap: 6px;">{{ kh.hopDongChotCount || 0 }}
                  <svg @click.stop="navigateToContracts(kh, 'COMPLETED')" class="action-eye-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </span>
              </div>
              <div class="stat-item" v-else>
                <span class="stat-label" style="text-transform: uppercase; display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Báo giá đã chốt:
                </span>
                <span class="stat-val" style="color: #10b981; font-weight: 800;">0</span>
              </div>
              <div class="stat-item" v-if="kh.hopDongProcessingCount > 0">
                <span class="stat-label" style="text-transform: uppercase; display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Báo giá đang xử lý:
                </span>
                <span class="stat-val" style="color: #f59e0b; font-weight: 800; display: flex; align-items: center; gap: 6px;">{{ kh.hopDongProcessingCount || 0 }}
                  <svg @click.stop="navigateToContracts(kh, 'PROCESSING')" class="action-eye-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </span>
              </div>
              <div class="stat-item" v-else>
                <span class="stat-label" style="text-transform: uppercase; display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Báo giá đang xử lý:
                </span>
                <span class="stat-val" style="color: #f59e0b; font-weight: 800;">0</span>
              </div>
              <div class="stat-item">
                <span class="stat-label" style="text-transform: uppercase; display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  Lần cuối mua hàng:
                </span>
                <span class="stat-val" style="color: #60a5fa; font-size: 0.95rem;">{{ kh.lastPurchaseText || 'Chưa có' }}</span>
              </div>
              <div class="stat-item" v-if="kh.renewalCount > 0">
                <span class="stat-label" style="text-transform: uppercase; display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  Cần gia hạn:
                </span>
                <span class="stat-val" style="color: #ef4444; font-weight: 800; display: flex; align-items: center; gap: 6px;">{{ kh.renewalCount }} sản phẩm
                  <svg @click.stop="navigateToRenewal(kh)" class="action-eye-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </span>
              </div>
            </div>
            
            <div class="financial-stats">
              <div class="stat-item">
                <span class="stat-label" style="text-transform: uppercase; display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                  Hoa hồng:
                </span>
                <span class="stat-val" style="color: #ffffff;">{{ formatCurrency(kh.hoa_hong) || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label" style="text-transform: uppercase; display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                  Lợi nhuận:
                </span>
                <span class="stat-val" style="color: #10b981;">{{ formatCurrency(kh.tong_loi_nhuan) || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label" style="text-transform: uppercase; display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  Tổng chi tiêu:
                </span>
                <span class="stat-val" style="color: #10b981;">{{ formatCurrency(kh.tong_chi_tieu) || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
        </div>

      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal-overlay" v-if="isModalOpen" @click.self="closeModal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Chỉnh Sửa Khách Hàng' : 'Thêm Khách Hàng Mới' }}</h2>
          <div v-if="isMultiImport" class="multi-import-pagination">
            <button type="button" class="btn-page" @click.prevent="prevPage" :disabled="currentImportIndex === 0">&lt;</button>
            <span class="page-info">File {{ currentImportIndex + 1 }} / {{ importedList.length }}: <strong>{{ importedList[currentImportIndex].fileName }}</strong></span>
            <button type="button" class="btn-page" @click.prevent="nextPage" :disabled="currentImportIndex === importedList.length - 1">&gt;</button>
          </div>
          <button class="btn-close" @click="closeModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <form @submit.prevent="saveCustomer" class="form-scroll">
          <div class="form-grid">
            <!-- Cột 1: Khách hàng -->
            <div class="form-section">
              <h3 class="section-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: -3px; margin-right: 6px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Khách hàng
              </h3>
              
              <div class="form-group">
                <label>Mã Khách Hàng</label>
                <input type="text" v-model="formData.ma_khach_hang" class="form-input" placeholder="Để trống tự tạo" />
              </div>

              <div v-show="false" class="form-group">
                <label>Trạng Thái</label>
                <div class="select-wrapper">
                  <select v-model="formData.trang_thai">
                    <option value="Tiềm năng">Tiềm năng</option>
                    <option value="Đang chăm sóc">Đang chăm sóc</option>
                    <option value="Chốt deal">Chốt deal</option>
                    <option value="Đã huỷ">Đã huỷ</option>
                  </select>
                </div>
              </div>

              <div class="form-group row">
                <div class="col">
                  <label>Tên Khách Hàng <span class="required">*</span></label>
                  <input type="text" v-model="formData.ten_khach_hang" required class="form-input" />
                </div>
                <div class="col">
                  <label>Tên KH Phụ</label>
                  <input type="text" v-model="formData.ten_khach_hang_phu" class="form-input" />
                </div>
              </div>
              
              <div class="form-group row">
                <div class="col">
                  <label>SĐT Cá Nhân</label>
                  <input type="text" v-model="formData.so_dien_thoai_ca_nhan" class="form-input" />
                </div>
                <div class="col">
                  <label>Email Cá Nhân</label>
                  <input type="email" v-model="formData.email_ca_nhan" class="form-input" />
                </div>
              </div>

              <div class="form-group row">
                <div class="col">
                  <label>SĐT KH Phụ</label>
                  <input type="text" v-model="formData.so_dien_thoai_ca_nhan_phu" class="form-input" />
                </div>
                <div class="col">
                  <label>Email KH Phụ</label>
                  <input type="email" v-model="formData.email_ca_nhan_phu" class="form-input" />
                </div>
              </div>
              
              <!-- Tích hợp các trường Tài chính vào Khách hàng -->
              <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed rgba(255,255,255,0.08);">
                <div class="form-group row">
                  <div class="col">
                    <label>Hoa Hồng</label>
                    <input type="text" v-model="formattedHoaHong" class="form-input input-green" />
                  </div>
                  <div class="col">
                    <label>Tổng Chi Tiêu</label>
                    <input type="text" v-model="formattedTongChiTieu" class="form-input input-green" />
                  </div>
                </div>

                <div class="form-group row">
                  <div class="col">
                    <label>Tổng Lợi Nhuận</label>
                    <input type="text" v-model="formattedTongLoiNhuan" class="form-input input-green" />
                  </div>
                  <div class="col">
                    <label>Ghi Chú</label>
                    <input type="text" v-model="formData.ghi_chu" class="form-input" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Cột 2: Công ty -->
            <div class="form-section">
              <h3 class="section-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: -3px; margin-right: 6px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Công ty
              </h3>
              
              <div class="form-group">
                <label>Mã Công Ty</label>
                <input type="text" v-model="formData.ma_cong_ty" class="form-input" />
              </div>

              <div class="form-group row">
                <div class="col">
                  <label>Tên Công Ty</label>
                  <input type="text" v-model="formData.ten_cong_ty" class="form-input" />
                </div>
                <div class="col">
                  <label>MST</label>
                  <input type="text" v-model="formData.mst" class="form-input" />
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
                  <label>Website</label>
                  <input type="text" v-model="formData.website_cong_ty" class="form-input" />
                </div>
              </div>

              <div class="form-group row">
                <div class="col">
                  <label>Địa Chỉ Công Ty</label>
                  <input type="text" v-model="formData.dia_chi_cong_ty" class="form-input" />
                </div>
                <div class="col">
                  <label>COMPANY (Eng)</label>
                  <input type="text" v-model="formData.company" class="form-input" />
                </div>
              </div>

              <div class="form-group row">
                <div class="col">
                  <label>TEL (Eng)</label>
                  <input type="text" v-model="formData.tel" class="form-input" />
                </div>
                <div class="col">
                  <label>ADDRESS (Eng)</label>
                  <input type="text" v-model="formData.address" class="form-input" />
                </div>
              </div>
            </div>


          </div>

          <div class="modal-actions">
            <button v-if="isEditing" type="button" class="btn-cancel" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3); margin-right: auto; background: rgba(239, 68, 68, 0.1);" @click="confirmDelete(formData.ma_khach_hang)" :disabled="saving">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Xoá KH
            </button>
            <button type="button" class="btn-cancel" @click="closeModal" :disabled="saving">Huỷ Bỏ</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-small"></span>
              {{ isMultiImport ? `Lưu Tất Cả (${importedList.length})` : (isEditing ? 'Lưu Thay Đổi' : 'Thêm Khách Hàng') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- ASYNC RESULT MODAL -->
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx-js-style'

const router = useRouter()

const fileInput = ref(null)

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  loading.value = true
  importedList.value = []
  const tempList = []
  let errorCount = 0

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
      
      let worksheet = null
      if (sheetNamePO) worksheet = workbook.Sheets[sheetNamePO]
      else if (sheetNameDH) worksheet = workbook.Sheets[sheetNameDH]
      else worksheet = workbook.Sheets[workbook.SheetNames[0]]

      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
      if (rawData.length < 2) {
        errorCount++
        continue
      }

      const record = {}
      for (let r = 0; r < rawData.length; r++) {
        let row = rawData[r]
        if (!row) continue

        let label1 = (row[0] || row[1] || '').toString().trim()
        let val1 = row[2] !== undefined ? row[2] : ''
        if (row[0] && row[1] && row[0] !== label1) val1 = row[1]

        if (label1.includes('Company')) record['CUS_COMPANY'] = val1
        if (label1.includes('Address')) record['CUS_ADDRESS'] = val1
        if (label1.includes('Tel')) record['CUS_TEL'] = val1
        if (label1 === 'Fax' || label1.includes('Fax')) record['CUS_FAX'] = val1
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

        let label2 = (row[3] || row[4] || '').toString().trim()
        let val2 = row[5] !== undefined ? row[5] : ''
        if (row[3] && row[4] && row[3] !== label2) val2 = row[4]
        
        if (label2.includes('Người nhận hàng')) record['DEL_NGUOI_NHAN'] = val2
        if (label2.includes('Số điện thoại')) record['DEL_SDT'] = val2
      }

      const contactRaw = (record.CUS_CONTACT || '').trim()
      const nguoiNhan = (record.DEL_NGUOI_NHAN || '').trim()
      
      let tenKH = contactRaw || nguoiNhan
      let sdt = contactRaw ? (record.CUS_MOBILE || '') : (record.DEL_SDT || '')
      let email = contactRaw ? (record.CUS_EMAIL || '') : ''

      const hasSecondary = contactRaw && nguoiNhan && contactRaw !== nguoiNhan
      let tenKHPhu = hasSecondary ? nguoiNhan : ''
      let sdtPhu = hasSecondary ? (record.DEL_SDT || '') : ''

      if (tenKH || record.INV_CONG_TY || record.CUS_COMPANY) {
        const tenCT = record.INV_CONG_TY || record.CUS_COMPANY || ''
        const expectedMaKH = genMaKH(tenKH, tenCT)
        const existingCustomer = customers.value.find(c => c.ma_khach_hang === expectedMaKH)
        
        const importedData = {
          ten_khach_hang: tenKH,
          email_ca_nhan: email,
          so_dien_thoai_ca_nhan: sdt,
          ten_cong_ty: tenCT,
          so_dien_thoai_cong_ty: record.CUS_TEL || '',
          so_fax_cong_ty: record.CUS_FAX || '',
          dia_chi_cong_ty: record.INV_DIA_CHI || '',
          email_cong_ty: record.INV_EMAIL || record.CUS_EMAIL || '',
          website_cong_ty: record.CUS_WEBSITE || '',
          mst: record.INV_MST || '',
          ten_khach_hang_phu: tenKHPhu,
          so_dien_thoai_ca_nhan_phu: sdtPhu,
          company: record.CUS_COMPANY || '',
          address: record.CUS_ADDRESS || '',
          tel: record.CUS_TEL || ''
        }

        let itemFormData = {}
        let itemIsEditing = false

        if (existingCustomer) {
          itemFormData = {
            ...initFormData(),
            ...existingCustomer,
            ...Object.fromEntries(Object.entries(importedData).filter(([_, v]) => v !== ''))
          }
          itemIsEditing = true
        } else {
          itemFormData = {
            ...initFormData(),
            ...importedData
          }
          itemIsEditing = false
        }

        tempList.push({
          data: itemFormData,
          isEditing: itemIsEditing,
          fileName: file.name
        })
      } else {
        errorCount++
      }
    }

    if (tempList.length > 0) {
      importedList.value = tempList
      isMultiImport.value = true
      currentImportIndex.value = 0
      formData.value = { ...importedList.value[0].data }
      isEditing.value = importedList.value[0].isEditing
      isModalOpen.value = true

      if (errorCount > 0) {
        alert(`Đã lấy thông tin từ ${tempList.length} file. Có ${errorCount} file bị lỗi định dạng.`)
      }
    } else {
      alert("Không tìm thấy thông tin khách hàng hợp lệ trong các file đã chọn.")
    }
  } catch(e) {
    console.error(e)
    alert("Lỗi khi đọc file Excel. Định dạng không hợp lệ.")
  } finally {
    loading.value = false
    event.target.value = null
  }
}

const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

const customers = ref([])
const loading = ref(false)
const saving = ref(false)

const asyncResultModal = ref({ show: false, type: 'loading', title: '', msg: '' })
let asyncResultTimeout = null

function showAsyncLoading(title) {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'loading', title, msg: '' }
}

function showAsyncSuccess(title, msg = '') {
  asyncResultModal.value = { show: true, type: 'success', title, msg }
  asyncResultTimeout = setTimeout(() => { asyncResultModal.value.show = false }, 3000)
}

function showAsyncError(title, msg = '') {
  asyncResultModal.value = { show: true, type: 'error', title, msg }
}

function navigateToRenewal(kh) {
  const customerKey = kh.ten_cong_ty || kh.ten_khach_hang || ''
  router.push({ path: '/quanlybaogia', query: { tab: 'thoihan', card: 'renew', customer: customerKey } })
}

function navigateToContracts(kh, processingType) {
  router.push({ path: '/quanlybaogia', query: { tab: 'baogia', dashboard: processingType, customerid: kh.ma_khach_hang, sort: 'DESC' } })
}

const filters = ref({
  search: '',
  trang_thai: ''
})

const formatCurrency = (value) => {
  if (!value && value !== 0) return '';
  if (isNaN(Number(value))) return value;
  return Number(value).toLocaleString('vi-VN');
}

const normalizeForSearch = (str) => {
  if (!str) return '';
  return removeDiacritics(String(str)).toLowerCase().replace(/[^a-z0-9]/g, '');
}

const searchedCustomers = computed(() => {
  let result = customers.value;
  if (filters.value.search) {
    const q = normalizeForSearch(filters.value.search);
    if (q) {
      result = result.filter(c => 
        (c.ten_khach_hang && normalizeForSearch(c.ten_khach_hang).includes(q)) ||
        (c.so_dien_thoai_ca_nhan && normalizeForSearch(c.so_dien_thoai_ca_nhan).includes(q)) ||
        (c.ten_cong_ty && normalizeForSearch(c.ten_cong_ty).includes(q)) ||
        (c.email_ca_nhan && normalizeForSearch(c.email_ca_nhan).includes(q)) ||
        (c.ma_khach_hang && normalizeForSearch(c.ma_khach_hang).includes(q))
      );
    }
  }
  return result;
});

const filteredCustomers = computed(() => {
  let result = searchedCustomers.value;
  if (filters.value.trang_thai === '__renew__') {
    result = result.filter(c => c.renewalCount > 0);
  } else if (filters.value.trang_thai) {
    result = result.filter(c => c.trang_thai === filters.value.trang_thai);
  }
  return result;
});

const totalCount = computed(() => searchedCustomers.value.length);
const careCount = computed(() => searchedCustomers.value.filter(c => c.trang_thai === 'Đang chăm sóc').length);
const dealCount = computed(() => searchedCustomers.value.filter(c => c.trang_thai === 'Chốt deal').length);
const potentialCount = computed(() => searchedCustomers.value.filter(c => c.trang_thai === 'Tiềm năng').length);
const renewCustomerCount = computed(() => searchedCustomers.value.filter(c => c.renewalCount > 0).length);

const isModalOpen = ref(false)
const isEditing = ref(false)
const formData = ref({})

const importedList = ref([])
const currentImportIndex = ref(0)
const isMultiImport = ref(false)

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
  tong_loi_nhuan: '',
  trang_thai: 'Tiềm năng',
  ghi_chu: '',
  ten_khach_hang_phu: '',
  so_dien_thoai_ca_nhan_phu: '',
  email_ca_nhan_phu: '',
  mst: '',
  company: '',
  address: '',
  tel: ''
})

const removeDiacritics = (str) => {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

const genMaCT = (congTy) => {
  if (!congTy) return ''
  return removeDiacritics(congTy).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '')
}

const genMaKH = (tenKH, congTy) => {
  const tenClean = removeDiacritics(tenKH).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '')
  const maCT = genMaCT(congTy)
  if (!tenClean && !maCT) return ''
  return [tenClean, maCT].filter(Boolean).join('-')
}

const escapeHtml = (unsafe) => {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const buildFuzzyRegex = (query) => {
  const charClass = {
    'a': '[aáàảãạăắằẳẵặâấầẩẫậAÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ]',
    'e': '[eéèẻẽẹêếềểễệEÉÈẺẼẸÊẾỀỂỄỆ]',
    'i': '[iíìỉĩịIÍÌỈĨỊ]',
    'o': '[oóòỏõọôốồổỗộơớờởỡợOÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ]',
    'u': '[uúùủũụưứừửữựUÚÙỦŨỤƯỨỪỬỮỰ]',
    'y': '[yýỳỷỹỵYÝỲỶỸỴ]',
    'd': '[dđDĐ]'
  };
  const VN_CHARS = 'a-zA-Z0-9aáàảãạăắằẳẵặâấầẩẫậeéèẻẽẹêếềểễệiíìỉĩịoóòỏõọôốồổỗộơớờởỡợuúùủũụưứừửữựyýỳỷỹỵdđAÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬEÉÈẺẼẸÊẾỀỂỄỆIÍÌỈĨỊOÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢUÚÙỦŨỤƯỨỪỬỮỰYÝỲỶỸỴDĐ';
  const NON_ALPHANUM = `[^${VN_CHARS}]*`;
  
  let cleanQuery = removeDiacritics(String(query)).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!cleanQuery) return null;
  
  let pattern = '';
  for (let i = 0; i < cleanQuery.length; i++) {
    const char = cleanQuery[i];
    const mapped = charClass[char] || char;
    pattern += mapped;
    if (i < cleanQuery.length - 1) {
      pattern += NON_ALPHANUM;
    }
  }
  try {
    return new RegExp(`(${pattern})`, 'gi');
  } catch (e) {
    return null;
  }
}

const highlightMatch = (text) => {
  if (!text) return '';
  const str = String(text);
  const q = filters.value.search;
  if (!q) return escapeHtml(str);
  
  const regex = buildFuzzyRegex(q);
  if (!regex) return escapeHtml(str);
  
  let lastIndex = 0;
  let result = '';
  let match;
  
  while ((match = regex.exec(str)) !== null) {
    result += escapeHtml(str.substring(lastIndex, match.index));
    result += `<mark class="highlight-mark">${escapeHtml(match[0])}</mark>`;
    lastIndex = regex.lastIndex;
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
  }
  result += escapeHtml(str.substring(lastIndex));
  return result;
}

watch(
  () => formData.value.ten_khach_hang,
  (val) => {
    if (val && val !== val.toUpperCase()) {
      formData.value.ten_khach_hang = val.toUpperCase()
    }
  }
)

watch(
  () => formData.value.ten_cong_ty,
  (val) => {
    if (val && val !== val.toUpperCase()) {
      formData.value.ten_cong_ty = val.toUpperCase()
    }
  }
)

watch(
  () => [formData.value.ten_khach_hang, formData.value.ten_cong_ty],
  ([ten, congTy]) => {
    if (isEditing.value) return // Chỉ tự động gen mã khi thêm mới
    const newMaKH = genMaKH(ten, congTy)
    if (newMaKH || newMaKH === '') {
      formData.value.ma_khach_hang = newMaKH
    }
    formData.value.ma_cong_ty = genMaCT(congTy)
  }
)

const formatInputCurrency = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const str = val.toString();
  const isNegative = str.startsWith('-');
  const num = Number(str.replace(/[^\d]/g, ''));
  if (isNaN(num)) return '';
  const formatted = new Intl.NumberFormat('vi-VN').format(num);
  return isNegative ? '-' + formatted : formatted;
}

const parseCurrency = (str) => {
  if (str === undefined || str === null || str === '') return '';
  const s = str.toString();
  const isNegative = s.startsWith('-');
  const num = Number(s.replace(/[^\d]/g, '')) || 0;
  return isNegative ? -num : num;
}

const formattedHoaHong = computed({
  get: () => formatInputCurrency(formData.value.hoa_hong),
  set: (val) => { formData.value.hoa_hong = parseCurrency(val) }
})

const formattedTongChiTieu = computed({
  get: () => formatInputCurrency(formData.value.tong_chi_tieu),
  set: (val) => { formData.value.tong_chi_tieu = parseCurrency(val) }
})

const formattedTongLoiNhuan = computed({
  get: () => formatInputCurrency(formData.value.tong_loi_nhuan),
  set: (val) => { formData.value.tong_loi_nhuan = parseCurrency(val) }
})

const fetchCustomers = async () => {
  loading.value = true
  try {
    const urlKH = new URL(API_URL)
    urlKH.searchParams.append('sheet', 'khach_hang')
    urlKH.searchParams.append('action', 'get')

    const urlHD = new URL(API_URL)
    urlHD.searchParams.append('action', 'hop_dong_tong_quat')
    urlHD.searchParams.append('t', Date.now().toString())

    const urlCT = new URL(API_URL)
    urlCT.searchParams.append('action', 'hop_dong_chi_tiet')
    urlCT.searchParams.append('t', Date.now().toString())

    const [resKH, resHD, resCT] = await Promise.all([
      fetch(urlKH.toString()),
      fetch(urlHD.toString()),
      fetch(urlCT.toString())
    ])
    
    const resultKH = await resKH.json()
    const resultHD = await resHD.json()
    const resultCT = await resCT.json()
    
    if (resultKH.status === 'success') {
      const hdList = Array.isArray(resultHD) ? resultHD : []
      const ctList = Array.isArray(resultCT) ? resultCT : []
      
      const ctMap = {}
      ctList.forEach(ct => {
        const maHD = String(ct[0] || '').trim()
        if (!maHD) return
        if (!ctMap[maHD]) ctMap[maHD] = []
        ctMap[maHD].push(ct)
      })

      const contractStatsMap = {}
      
      hdList.forEach(hdRow => {
        const maKH = String(hdRow[2] || '').trim()
        if (!maKH) return
        
        if (!contractStatsMap[maKH]) {
          contractStatsMap[maKH] = { latestDate: null, groups: {} }
        }
        
        const maHopDong = String(hdRow[0] || '').trim()
        const maHopDongGoc = String(hdRow[32] || '').trim()
        const groupId = maHopDongGoc || maHopDong
        if (!groupId) return;
        
        const isCompletedVal = String(hdRow[33] || '').trim().toLowerCase()
        const isCompleted = (isCompletedVal === '1' || isCompletedVal === 'true' || isCompletedVal === 'yes' || isCompletedVal === 'x')

        const ngayTao = String(hdRow[4] || '').trim()
        let dateObj = null;
        if (ngayTao) {
          const dateParts = ngayTao.split(' ')
          const dateStr = dateParts.length > 1 ? dateParts[1] : dateParts[0]
          const [DD, MM, YYYY] = dateStr.split('/')
          if (DD && MM && YYYY) {
            const parsed = new Date(Number(YYYY), Number(MM) - 1, Number(DD))
            if (!isNaN(parsed.getTime())) {
              dateObj = parsed;
              if (!contractStatsMap[maKH].latestDate || parsed > contractStatsMap[maKH].latestDate) {
                contractStatsMap[maKH].latestDate = parsed
              }
            }
          }
        }
        
        const trangThaiHD = String(hdRow[15] || '').trim()
        const isChinhThuc = trangThaiHD === 'Chính thức'
        
        let localRenewalCount = 0
        if ((isChinhThuc || isCompleted) && ctMap[maHopDong]) {
          ctMap[maHopDong].forEach(ct => {
            let startDateStr = String(ct[28] || '').trim()
            let endDateStr = String(ct[29] || '').trim()
            if (!startDateStr || !endDateStr) return
            
            // Normalize ISO dates to dd/mm/yyyy
            const normalizeDate = (s) => {
              if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return s
              const d = new Date(s)
              if (isNaN(d.getTime())) return ''
              const pad = (n) => String(n).padStart(2, '0')
              return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
            }
            startDateStr = normalizeDate(startDateStr)
            endDateStr = normalizeDate(endDateStr)
            if (!startDateStr || !endDateStr) return
            
            const p1 = startDateStr.split('/')
            const p2 = endDateStr.split('/')
            if (p1.length !== 3 || p2.length !== 3) return
            const d1 = new Date(+p1[2], +p1[1] - 1, +p1[0])
            const d2 = new Date(+p2[2], +p2[1] - 1, +p2[0])
            const diff = d2.getTime() - d1.getTime()
            const days = Math.ceil(diff / (1000 * 3600 * 24))
            if (days >= 0 && days < 90) {
              localRenewalCount++
            }
          })
        }

        if (!contractStatsMap[maKH].groups[groupId]) {
          contractStatsMap[maKH].groups[groupId] = { isCompleted: isCompleted, date: dateObj, renewalCount: localRenewalCount }
        } else {
          const currentGroup = contractStatsMap[maKH].groups[groupId];
          currentGroup.renewalCount = (currentGroup.renewalCount || 0) + localRenewalCount;
          if (dateObj && currentGroup.date) {
            if (dateObj > currentGroup.date) {
              currentGroup.isCompleted = isCompleted;
              currentGroup.date = dateObj;
            }
          } else if (dateObj) {
            currentGroup.isCompleted = isCompleted;
            currentGroup.date = dateObj;
          }
        }
      })
      
      Object.values(contractStatsMap).forEach(stats => {
         let chotCount = 0;
         let processingCount = 0;
         let renewalCount = 0;
         Object.values(stats.groups).forEach(g => {
             if (g.isCompleted) chotCount++;
             else processingCount++;
             if (g.renewalCount) renewalCount += g.renewalCount;
         });
         stats.chotCount = chotCount;
         stats.processingCount = processingCount;
         stats.renewalCount = renewalCount;
      })
      
      const now = new Date()
      now.setHours(0,0,0,0)
      
      const rawCustomers = resultKH.data || []
      customers.value = rawCustomers.map(kh => {
        let lastPurchaseText = ''
        let hopDongChotCount = 0
        let hopDongProcessingCount = 0
        let renewalCount = 0
        
        if (kh.ma_khach_hang && contractStatsMap[kh.ma_khach_hang]) {
          const stats = contractStatsMap[kh.ma_khach_hang]
          hopDongChotCount = stats.chotCount
          hopDongProcessingCount = stats.processingCount
          renewalCount = stats.renewalCount || 0
          
          if (stats.latestDate) {
            const lastDate = stats.latestDate
            const diffTime = now.getTime() - lastDate.getTime()
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
            
            const pad = n => String(n).padStart(2, '0')
            const dateStr = `${pad(lastDate.getDate())}/${pad(lastDate.getMonth()+1)}/${lastDate.getFullYear()}`
            
            let prefix = ''
            if (diffDays === 0) prefix = 'hôm nay'
            else if (diffDays > 0) prefix = `${diffDays} ngày trước`
            else prefix = 'vừa mua'
            
            lastPurchaseText = `${prefix} ( ${dateStr} )`
          }
        }

        // Tự động tính toán trạng thái
        let computedTrangThai = kh.trang_thai || 'Tiềm năng'
        if (hopDongProcessingCount > 0) {
          computedTrangThai = 'Đang chăm sóc'
        } else if (hopDongChotCount > 0 && hopDongProcessingCount === 0) {
          computedTrangThai = 'Chốt deal'
        } else if (hopDongChotCount === 0 && hopDongProcessingCount === 0) {
          computedTrangThai = 'Tiềm năng'
        }

        return { ...kh, trang_thai: computedTrangThai, lastPurchaseText, hopDongChotCount, hopDongProcessingCount, renewalCount }
      })
    } else {
      alert('Lỗi khi tải dữ liệu: ' + resultKH.message)
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

const prevPage = () => {
  if (currentImportIndex.value > 0) {
    importedList.value[currentImportIndex.value].data = { ...formData.value }
    currentImportIndex.value--
    formData.value = { ...importedList.value[currentImportIndex.value].data }
    isEditing.value = importedList.value[currentImportIndex.value].isEditing
  }
}

const nextPage = () => {
  if (currentImportIndex.value < importedList.value.length - 1) {
    importedList.value[currentImportIndex.value].data = { ...formData.value }
    currentImportIndex.value++
    formData.value = { ...importedList.value[currentImportIndex.value].data }
    isEditing.value = importedList.value[currentImportIndex.value].isEditing
  }
}

const saveCustomer = async () => {
  saving.value = true

  if (isMultiImport.value) {
    // Lưu formData hiện tại vào list trước khi tiến hành xử lý
    importedList.value[currentImportIndex.value].data = { ...formData.value }
    
    try {
      let successCount = 0
      for (let i = 0; i < importedList.value.length; i++) {
        const item = importedList.value[i]
        const isUpd = item.isEditing
        showAsyncLoading(`Đang xử lý ${i + 1}/${importedList.value.length} khách hàng...`)
        
        const payload = {
          sheet: 'khach_hang',
          action: isUpd ? 'update' : 'add',
          ...item.data
        }

        const response = await fetch(API_URL, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        const result = await response.json()
        if (result.status === 'success') {
          successCount++
        }
      }
      
      isModalOpen.value = false
      isMultiImport.value = false
      showAsyncSuccess(`Đã lưu thành công`, `${successCount}/${importedList.value.length} khách hàng được xử lý.`)
      fetchCustomers()
    } catch (error) {
      console.error('Lỗi khi lưu nhiều KH:', error)
      showAsyncError('Lưu thất bại', 'Lỗi kết nối: ' + error.message)
    } finally {
      saving.value = false
    }
  } else {
    // Lưu đơn (như cũ)
    const isUpd = isEditing.value
    showAsyncLoading(`Đang ${isUpd ? 'cập nhật' : 'thêm'} khách hàng...`)
    try {
      const payload = {
        sheet: 'khach_hang',
        action: isUpd ? 'update' : 'add',
        ...formData.value
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      
      const result = await response.json()
      
      if (result.status === 'success') {
        isModalOpen.value = false
        showAsyncSuccess(`${isUpd ? 'Cập nhật' : 'Thêm'} KH thành công`, `Mã KH: ${formData.value.ma_khach_hang}`)
        fetchCustomers() 
      } else {
        showAsyncError('Lỗi lưu dữ liệu', result.message)
      }
    } catch (error) {
      console.error('Lỗi khi lưu:', error)
      showAsyncError('Lưu KH thất bại', 'Lỗi kết nối: ' + error.message)
    } finally {
      saving.value = false
    }
  }
}

const confirmDelete = async (ma_khach_hang) => {
  if (!confirm('Xác nhận xoá khách hàng này?')) return;
  
  showAsyncLoading('Đang xoá khách hàng...')
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
      showAsyncSuccess('Xoá thành công', `Đã xoá mã KH: ${ma_khach_hang}`)
      fetchCustomers()
    } else {
      showAsyncError('Lỗi xoá', result.message)
    }
  } catch (error) {
    showAsyncError('Xoá thất bại', error.message)
  }
}

const getStatusPillClass = (status) => {
  if (!status) return 'status-default';
  const s = status.toLowerCase();
  if (s.includes('mới') || s.includes('tiềm năng')) return 'status-pending';
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
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;
}

.title-section h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #10b981;
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.header-actions { display: flex; gap: 1rem; }

.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
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
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 4px 15px rgba(16,185,129,0.3);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
}

.btn-primary:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 6px 20px rgba(16,185,129,0.45); 
}

.btn-primary::after {
  content: '';
  position: absolute;
  top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: all 0.5s ease;
}
.btn-primary:hover::after {
  left: 100%;
}

/* =========================================
   THỐNG KÊ (STATS CARDS) 
========================================= */
.stats-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

:deep(.highlight-mark) {
  background-color: #ef4444;
  color: #fff;
  border-radius: 4px;
  padding: 0 4px;
  font-weight: 700;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
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
.stat-icon.potential { background: rgba(168,85,247,0.15); color: #c084fc; }
.card-potential .stat-value { color: #c084fc; }
.card-potential .stat-label { color: #d8b4fe; }
.stat-icon.renew { background: rgba(239,68,68,0.15); color: #f87171; }
.card-renew .stat-value { color: #f87171; }
.card-renew .stat-label { color: #fca5a5; }
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

.btn-refresh:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}



/* Card Layout Styles */
.card-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 1rem;
}

.report-card {
  background: rgba(15,23,42,0.8);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 12px rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.report-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0,0,0,0.4), 0 0 20px rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.8);
}

/* Skeleton Loader Styles */
.skeleton-card {
  pointer-events: none;
  cursor: default;
}
.skeleton-card:hover {
  transform: none;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 12px rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed rgba(255,255,255,0.1);
}

.skeleton-avatar {
  width: 48px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255,255,255,0.08);
  animation: skeleton-pulse 1.5s infinite;
}

.skeleton-title {
  height: 24px;
  width: 60%;
  border-radius: 4px;
  background: rgba(255,255,255,0.08);
  animation: skeleton-pulse 1.5s infinite;
}

.skeleton-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.skeleton-line {
  height: 18px;
  width: 100%;
  border-radius: 4px;
  background: rgba(255,255,255,0.08);
  animation: skeleton-pulse 1.5s infinite;
}

.skeleton-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-box {
  height: 24px;
  width: 100%;
  border-radius: 4px;
  background: rgba(255,255,255,0.08);
  animation: skeleton-pulse 1.5s infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.card-row-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed rgba(255,255,255,0.1);
}

.card-id {
  background: #10b981;
  color: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.card-time-group {
  flex: 1;
}

.time-primary {
  font-weight: 800;
  color: #10b981;
  font-size: 1.1rem;
  line-height: 1.3;
}

.time-secondary {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
  margin-top: 0.25rem;
}

.stat-item-link {
  padding: 4px 6px;
  margin: -4px -6px;
  border-radius: 6px;
}

.action-eye-icon {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 2px;
  border-radius: 4px;
}
.action-eye-icon:hover {
  transform: scale(1.15);
  background: rgba(255, 255, 255, 0.1);
}

.status-pill-mini {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.card-row-content {
  flex: 1;
  margin-bottom: 1.25rem;
}

.content-title {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #cbd5e1;
}

.truncate-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.financial-wrapper {
  background: rgba(25, 29, 49, 0.8);
  border: 1px solid rgba(16, 185, 129, 0.5);
  border-radius: 8px;
  padding: 0.75rem;
  margin-top: 0.75rem;
}

.financial-wrapper .stat-label {
  color: #ffffff;
  opacity: 0.9;
}

.financial-wrapper .stat-val {
  font-size: 1.15rem;
  font-weight: 800;
}

.financial-stats {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.stat-label {
  color: #94a3b8;
}

.stat-val {
  font-weight: 700;
}

.text-primary { color: #60a5fa; }
.text-warning { color: #fbbf24; }

.card-row-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-action-full {
  flex: 1;
  padding: 0.75rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #f8fafc;
}

.btn-action-full:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.2);
}

.btn-action-full.delete {
  color: #ef4444;
  border-color: rgba(239,68,68,0.3);
}

.btn-action-full.delete:hover {
  background: rgba(239,68,68,0.1);
  border-color: #ef4444;
}

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
  background: rgba(2, 6, 23, 0.65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: flex; justify-content: center; align-items: center;
  z-index: 99999;
  padding: 1rem;
}

.modal {
  background: #0f172a; width: 100%; 
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
  display: flex; flex-direction: column;
  color: #f8fafc;
  overflow: hidden;
}

.modal-lg {
  width: 96%;
  max-width: 1440px;
  max-height: 95vh;
}

.modal-header { 
  display: flex; justify-content: space-between; align-items: center; 
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(30,41,59,0.5), rgba(15,23,42,0.8));
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0; 
  position: relative;
}
.modal-header::after {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  opacity: 0.6;
}
.modal-header h2 { font-size: 1.35rem; font-weight: 800; color: #f8fafc; margin: 0; display: flex; align-items: center; gap: 0.5rem; letter-spacing: -0.01em; }

.multi-import-pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(16, 185, 129, 0.1);
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.multi-import-pagination .page-info {
  font-size: 0.9rem;
  color: #10b981;
}
.multi-import-pagination .page-info strong {
  color: #fff;
}
.multi-import-pagination .btn-page {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.2s;
}
.multi-import-pagination .btn-page:hover:not(:disabled) {
  background: #10b981;
}
.multi-import-pagination .btn-page:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.btn-close { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0.5rem; border-radius: 8px; transition: all 0.2s;}
.btn-close:hover { background: rgba(255,255,255,0.1); color: #fff; }

.form-scroll {
  padding: 16px 20px;
  overflow-y: auto;
}

/* Custom Scrollbar */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.data-table th, .data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}
.data-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  font-size: 0.8rem;
}
.data-table tbody tr:hover {
  background: #f1f5f9;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.form-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.1);
  border-radius: 4px;
}
.form-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 4px;
}
.form-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.4);
}

/* 2 columns grid for the modal */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

@media (max-width: 1024px) {
  .form-grid { grid-template-columns: 1fr; gap: 1.5rem; }
}

.form-section { 
  display: flex; flex-direction: column; margin-bottom: 0; 
  background: linear-gradient(180deg, rgba(30,41,59,0.5), rgba(15,23,42,0.3));
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid rgba(255,255,255,0.05);
  border-top: 1px solid rgba(16,185,129,0.25);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}
.form-section:hover {
  border-top-color: rgba(16,185,129,0.5);
  background: linear-gradient(180deg, rgba(30,41,59,0.6), rgba(15,23,42,0.4));
}

.section-title { 
  font-size: 0.95rem; color: #10b981; border-bottom: 1px solid rgba(16,185,129,0.2); 
  padding-bottom: 0.75rem; margin: 0 0 1.5rem; font-weight: 800; 
  text-transform: uppercase; letter-spacing: 0.08em;
  display: flex; align-items: center;
  text-shadow: 0 0 12px rgba(16,185,129,0.3);
}

.form-group { margin-bottom: 1rem; }
.form-group.row { display: flex; gap: 1rem; }
.form-group.row .col { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }

.form-group label { 
  display: block; margin-bottom: 0.5rem; 
  font-size: 0.75rem; font-weight: 700; color: #10b981; 
  text-transform: uppercase; letter-spacing: 0.06em;
}
.required { color: #ef4444; text-shadow: 0 0 8px rgba(239,68,68,0.4); }

.form-input, .select-wrapper select, textarea {
  width: 100%; padding: 0.85rem 1rem;
  border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
  font-size: 0.95rem; background: rgba(15,23,42,0.6); color: #f8fafc;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  box-sizing: border-box;
}
.form-input:focus, .select-wrapper select:focus, textarea:focus {
  outline: none; border-color: #10b981; 
  background: rgba(15,23,42,0.9);
  box-shadow: 0 0 0 3px rgba(16,185,129,0.2), inset 0 2px 4px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

.input-green {
  color: #10b981;
  font-weight: 800;
  text-shadow: 0 0 8px rgba(16,185,129,0.3);
  border-color: rgba(16, 185, 129, 0.5) !important;
  background: rgba(16, 185, 129, 0.05);
}

.modal-actions { 
  display: flex; justify-content: flex-end; align-items: center; gap: 1rem; 
  padding: 16px 20px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0; 
}
.btn-cancel { padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.05); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); font-weight: 600; cursor: pointer; border-radius: 10px; transition: all 0.2s; }
.btn-cancel:hover { background: rgba(255,255,255,0.1); color: #fff; }

/* Media query utility classes removed */

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
  .header { flex-direction: column; align-items: stretch; gap: 1rem; }
  .header-actions { display: none; }
  .form-group.row { flex-direction: column; }
  .stats-row { flex-wrap: wrap; gap: 0.75rem; }
  .stat-card { flex: 1 1 calc(50% - 0.5rem); min-width: 0; padding: 1rem; }
  .stat-icon { width: 36px; height: 36px; }
  .stat-value { font-size: 1.25rem; }
  .stat-label { font-size: 0.65rem; }
  .mobile-action-btn { padding: 0.7rem 1.5rem; font-size: 0.9rem; border-radius: 10px; }
  .card-list { grid-template-columns: 1fr; }
}
.async-overlay {
  position: fixed;
  inset: 0;
  z-index: 999999;
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
/* Orbiting dots */
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

/* Pulse ring under spinner */
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
/* Success glow ring burst */
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
  0% { opacity: 0; transform: scale(0.7) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
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
/* Orbiting dots */
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

/* Pulse ring under spinner */
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
/* Success glow ring burst */
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
  0% { opacity: 0; transform: scale(0.7) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes async-modal-out {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.85) translateY(10px); }
}
</style>
