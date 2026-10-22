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
              <div class="stat-item">
                <span class="stat-label" style="text-transform: uppercase; display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Cập nhật cuối:
                </span>
                <span class="stat-val" style="color: #94a3b8; font-size: 0.9rem;">{{ formatLastUpdated(kh.last_updated) }}</span>
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
              <!-- Ẩn Hoa hồng, Lợi nhuận, Tổng chi tiêu theo yêu cầu -->
              <div v-if="false" class="stat-item">
                <span class="stat-label">Hoa hồng:</span>
                <span class="stat-val">{{ formatCurrency(kh.hoa_hong) || 0 }}</span>
              </div>
              <div v-if="false" class="stat-item">
                <span class="stat-label">Lợi nhuận:</span>
                <span class="stat-val">{{ formatCurrency(kh.tong_loi_nhuan) || 0 }}</span>
              </div>
              <div v-if="false" class="stat-item">
                <span class="stat-label">Tổng chi tiêu:</span>
                <span class="stat-val">{{ formatCurrency(kh.tong_chi_tieu) || 0 }}</span>
              </div>

              <!-- Nhóm khách (tagKH) -->
              <div class="stat-item" style="align-items: flex-start; gap: 8px;">
                <span class="stat-label" style="text-transform: uppercase; display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem; flex-shrink: 0; margin-top: 2px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                  Nhóm khách:
                </span>
                <div style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-end;">
                  <template v-if="kh.tagKH && kh.tagKH.length > 0">
                    <span
                      v-for="tag in kh.tagKH"
                      :key="tag"
                      style="background: rgba(16, 185, 129, 0.16); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.38); padding: 2px 8px; border-radius: 999px; font-size: 0.72rem; font-weight: 700;"
                    >
                      {{ tag }}
                    </span>
                  </template>
                  <span v-else style="color: #64748b; font-size: 0.8rem; font-style: italic;">Chưa phân nhóm</span>
                </div>
              </div>

              <!-- Công nợ & Tiến độ trả nợ -->
              <div
                class="stat-item"
                style="flex-direction: column; align-items: stretch; gap: 6px; cursor: pointer; background: rgba(15, 23, 42, 0.45); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 8px 10px; margin-top: 2px; transition: all 0.2s;"
                @click.stop="openCustomerDebtModal(kh)"
                title="Nhấp để xem tiến độ trả nợ và lịch sử thanh toán của khách hàng"
              >
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                  <span class="stat-label" style="text-transform: uppercase; display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #cbd5e1;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                    Công nợ:
                  </span>
                  <span
                    class="stat-val"
                    :style="{ color: (Number(kh.cong_no) || 0) > 0 ? '#f87171' : '#10b981', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }"
                  >
                    {{ formatCurrency(kh.cong_no || 0) || '0' }} đ
                    <svg class="action-eye-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </span>
                </div>

                <!-- Thanh tiến độ trả nợ trên card -->
                <div v-if="(kh.tongSauVatKH || 0) > 0 || (kh.daThanhToanKH || 0) > 0 || (Number(kh.cong_no) || 0) > 0" style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="width: 100%; height: 6px; background: rgba(51, 65, 85, 0.7); border-radius: 999px; overflow: hidden;">
                    <div
                      :style="{
                        width: (kh.paymentProgressPct || 0) + '%',
                        height: '100%',
                        background: (Number(kh.cong_no) || 0) <= 0 ? '#10b981' : 'linear-gradient(90deg, #38bdf8, #10b981)',
                        borderRadius: '999px',
                        transition: 'width 0.3s ease'
                      }"
                    ></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: #94a3b8;">
                    <span>Đã TT: <strong style="color: #34d399;">{{ formatCurrency(kh.daThanhToanKH || 0) || '0' }} đ</strong> ({{ kh.paymentProgressPct || 0 }}%)</span>
                    <span style="color: #38bdf8; font-weight: 700;">Xem tiến độ & LS TT →</span>
                  </div>
                </div>
                <div v-else style="display: flex; justify-content: flex-end; font-size: 0.72rem; color: #38bdf8; font-weight: 600;">
                  Xem tiến độ trả nợ & lịch sử TT →
                </div>
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
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <h2>{{ isEditing ? 'Chỉnh Sửa Khách Hàng' : 'Thêm Khách Hàng Mới' }}</h2>
            <span v-if="isEditing && formData.last_updated" style="font-size: 12px; color: #94a3b8; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 99px;">
              🕒 Cập nhật cuối: <strong style="color: #38bdf8;">{{ formatLastUpdated(formData.last_updated) }}</strong>
            </span>
          </div>
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
              
              <!-- Nhóm Khách Hàng (tagKH) & Công Nợ (thay thế Hoa hồng, Tổng chi tiêu, Tổng lợi nhuận) -->
              <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed rgba(255,255,255,0.08);">
                <!-- Ẩn Hoa Hồng, Tổng Chi Tiêu, Tổng Lợi Nhuận -->
                <div v-if="false" class="form-group row">
                  <div class="col">
                    <label>Hoa Hồng</label>
                    <input type="text" v-model="formattedHoaHong" class="form-input input-green" />
                  </div>
                  <div class="col">
                    <label>Tổng Chi Tiêu</label>
                    <input type="text" v-model="formattedTongChiTieu" class="form-input input-green" />
                  </div>
                </div>
                <div v-if="false" class="form-group row">
                  <div class="col">
                    <label>Tổng Lợi Nhuận</label>
                    <input type="text" v-model="formattedTongLoiNhuan" class="form-input input-green" />
                  </div>
                </div>

                <!-- Nhóm Khách Hàng (tagKH) -->
                <div class="form-group">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <label style="margin-bottom: 0;">Nhóm Khách Hàng (tagKH)</label>
                    <button
                      type="button"
                      @click="isTagModalOpen = true"
                      style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"
                    >
                      ⚙ Quản lý Nhóm
                    </button>
                  </div>
                  <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    <input
                      type="text"
                      v-model="tempTagKH"
                      @keydown.enter.prevent="addNewTagFromInput"
                      placeholder="Nhập nhóm khách mới rồi nhấn Enter..."
                      class="form-input"
                      style="flex: 1;"
                    />
                    <button
                      type="button"
                      @click="addNewTagFromInput"
                      style="background: #10b981; color: #ffffff; border: none; padding: 0 14px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; white-space: nowrap;"
                    >
                      + Thêm
                    </button>
                  </div>
                  <div v-if="availableTags.length > 0" style="display: flex; flex-wrap: wrap; gap: 6px;">
                    <button
                      type="button"
                      v-for="tag in availableTags"
                      :key="tag"
                      @click="toggleTag(tag)"
                      style="padding: 5px 11px; border-radius: 999px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
                      :style="{
                        background: formData.tagKH?.includes(tag) ? '#10b981' : 'rgba(30, 41, 59, 0.7)',
                        color: formData.tagKH?.includes(tag) ? '#ffffff' : '#94a3b8',
                        border: formData.tagKH?.includes(tag) ? '1px solid #10b981' : '1px solid #334155'
                      }"
                    >
                      {{ formData.tagKH?.includes(tag) ? '✓ ' : '' }}{{ tag }}
                    </button>
                  </div>
                  <div v-else style="font-size: 12px; color: #64748b; font-style: italic;">
                    Chưa có nhóm khách nào. Hãy nhập tên nhóm ở trên để tạo mới.
                  </div>
                </div>

                <!-- Công Nợ & Tiến Độ Trả Nợ -->
                <div class="form-group" style="margin-top: 14px; padding: 12px 14px; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.28); border-radius: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                      <label style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; display: block;">Công Nợ Hiện Tại Của Khách Hàng</label>
                      <div
                        style="font-size: 18px; font-weight: 800;"
                        :style="{ color: getCustomerDebtSummary(formData).congNo > 0 ? '#f87171' : '#34d399' }"
                      >
                        {{ formatCurrency(getCustomerDebtSummary(formData).congNo) || '0' }} đ
                      </div>
                    </div>
                    <button
                      type="button"
                      @click="openCustomerDebtModal(formData)"
                      style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(56, 189, 248, 0.22)); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.45); border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;"
                    >
                      💳 Xem Tiến Độ Trả Nợ & Lịch Sử TT ({{ getCustomerPaymentHistoryCount(formData) }})
                    </button>
                  </div>

                  <!-- Thanh tiến độ trả nợ trong modal -->
                  <div style="margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: #94a3b8; margin-bottom: 5px;">
                      <span>Đã thanh toán: <strong style="color: #34d399;">{{ formatCurrency(getCustomerDebtSummary(formData).daThanhToan) || '0' }} đ</strong></span>
                      <span>Tổng phải thu ({{ getCustomerDebtSummary(formData).poCount }} PO): <strong style="color: #38bdf8;">{{ formatCurrency(getCustomerDebtSummary(formData).tongSauVat) || '0' }} đ</strong> ({{ getCustomerDebtSummary(formData).progressPct }}%)</span>
                    </div>
                    <div style="width: 100%; height: 7px; background: rgba(51, 65, 85, 0.75); border-radius: 999px; overflow: hidden;">
                      <div
                        :style="{
                          width: getCustomerDebtSummary(formData).progressPct + '%',
                          height: '100%',
                          background: getCustomerDebtSummary(formData).congNo <= 0 ? '#10b981' : 'linear-gradient(90deg, #38bdf8, #10b981)',
                          borderRadius: '999px',
                          transition: 'width 0.3s ease'
                        }"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- Ghi Chú -->
                <div class="form-group" style="margin-top: 12px;">
                  <label>Ghi Chú</label>
                  <input type="text" v-model="formData.ghi_chu" class="form-input" />
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

    <!-- Modal Quản lý Nhóm Khách Hàng (tagKH) -->
    <div v-if="isTagModalOpen" class="modal-overlay" @click.self="isTagModalOpen = false" style="z-index: 100040;">
      <div class="modal" style="max-width: 500px; width: 95%;">
        <div class="modal-header">
          <h2>Quản Lý Nhóm Khách Hàng (tagKH)</h2>
          <button class="btn-close" @click="isTagModalOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; gap: 8px;">
            <input
              type="text"
              v-model="tempTagKH"
              @keyup.enter="addNewTagFromInput"
              placeholder="Nhập tên nhóm mới..."
              class="form-input"
              style="flex: 1;"
            />
            <button type="button" @click="addNewTagFromInput" class="btn-primary" style="padding: 0 16px;">Thêm Mới</button>
          </div>

          <div>
            <div style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px;">
              Tất cả nhóm hiện có ({{ availableTags.length }})
            </div>
            <div v-if="availableTags.length === 0" style="color: #64748b; font-size: 13px; font-style: italic;">
              Chưa có nhóm nào.
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto;">
              <div
                v-for="tag in availableTags"
                :key="tag"
                style="display: flex; align-items: center; justify-content: space-between; background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; padding: 8px 12px; border-radius: 8px;"
              >
                <div v-if="editingTagId === tag" style="display: flex; gap: 6px; flex: 1; margin-right: 10px;">
                  <input type="text" v-model="editTagValue" class="form-input" style="flex: 1; padding: 5px 10px; font-size: 13px;" />
                  <button type="button" @click="saveTagEdit(tag)" class="btn-primary" style="padding: 4px 12px; font-size: 12px;">Lưu</button>
                  <button type="button" @click="editingTagId = null" class="btn-cancel" style="padding: 4px 10px; font-size: 12px;">Hủy</button>
                </div>
                <span v-else style="font-weight: 700; color: #f8fafc; font-size: 13px;">{{ tag }}</span>

                <div v-if="editingTagId !== tag" style="display: flex; gap: 6px;">
                  <button type="button" @click="startEditTag(tag)" title="Đổi tên nhóm" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; border-radius: 6px; cursor: pointer; padding: 5px 8px;">
                    ✎
                  </button>
                  <button type="button" @click="deleteTagGlobal(tag)" title="Xóa nhóm khỏi tất cả KH" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; border-radius: 6px; cursor: pointer; padding: 5px 8px;">
                    🗑
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Quản lý Công nợ, Tiến độ trả nợ & Lịch sử thanh toán (như SaleReportFirebase) -->
    <Teleport to="body">
      <div v-if="paymentModal.show && paymentModal.customer" class="modal-overlay" @click.self="paymentModal.show = false" style="z-index: 100050; padding: 20px;">
        <div style="max-width: 980px; width: 96vw; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; max-height: 92vh; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
          <!-- Header -->
          <div style="background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid #1e293b; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); display: flex; align-items: center; justify-content: center; color: #38bdf8;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <div>
                <h3 style="margin: 0; color: #f8fafc; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  Tiến độ Trả nợ & Lịch sử Thanh toán
                  <span v-if="paymentModal.row"> — PO #{{ paymentModal.row.So_PO || 'N/A' }}</span>
                </h3>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 3px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                  <span style="display: inline-flex; align-items: center; gap: 4px;">
                    <strong style="color: #e2e8f0;">{{ paymentModal.customer.ten_cong_ty || paymentModal.customer.ten_khach_hang || 'Khách hàng' }}</strong>
                  </span>
                  <span>• Mã KH: <code style="color: #38bdf8; background: rgba(56,189,248,0.1); padding: 1px 6px; border-radius: 4px;">{{ paymentModal.customer.ma_khach_hang || 'N/A' }}</code></span>
                  <span v-if="paymentModal.row">• ID SaleReport: <code style="color: #a855f7; background: rgba(168,85,247,0.1); padding: 1px 6px; border-radius: 4px;">{{ paymentModal.row.ID || paymentModal.row._firebaseKey }}</code></span>
                </div>
              </div>
            </div>
            <button @click="paymentModal.show = false" style="background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer; line-height: 1;">&times;</button>
          </div>

          <!-- Body -->
          <div style="padding: 20px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 18px;">
            <!-- 4 Summary Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(185px, 1fr)); gap: 12px;">
              <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 12px 14px;">
                <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">
                  {{ paymentModal.row ? 'Tổng tiền sau VAT (PO)' : 'Tổng phải thu toàn KH' }}
                </div>
                <div style="font-size: 17px; font-weight: 800; color: #38bdf8; margin-top: 4px;">
                  {{ formatCurrency(paymentModal.row ? tongSauVat(paymentModal.row) : getCustomerDebtSummary(paymentModal.customer).tongSauVat) || '0' }} đ
                </div>
              </div>
              <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 10px; padding: 12px 14px;">
                <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">
                  {{ paymentModal.row ? 'Khách đã thanh toán (PO)' : 'Đã thanh toán toàn KH' }}
                </div>
                <div style="font-size: 17px; font-weight: 800; color: #34d399; margin-top: 4px;">
                  {{ formatCurrency(paymentModal.row ? daThanhToan(paymentModal.row) : getCustomerDebtSummary(paymentModal.customer).daThanhToan) || '0' }} đ
                </div>
              </div>
              <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 12px 14px;">
                <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Công nợ còn lại (PO)</div>
                <div
                  style="font-size: 17px; font-weight: 800; margin-top: 4px;"
                  :style="{ color: (paymentModal.row ? congNo(paymentModal.row) : getCustomerDebtSummary(paymentModal.customer).congNo) > 0 ? '#f87171' : '#34d399' }"
                >
                  {{ formatCurrency(paymentModal.row ? congNo(paymentModal.row) : getCustomerDebtSummary(paymentModal.customer).congNo) || '0' }} đ
                </div>
              </div>
              <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 12px 14px;">
                <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Tổng nợ toàn KH ({{ paymentModal.customerPOs.length }} PO)</div>
                <div style="font-size: 17px; font-weight: 800; color: #fbbf24; margin-top: 4px;">
                  {{ formatCurrency(getCustomerDebtSummary(paymentModal.customer).congNo) || '0' }} đ
                </div>
              </div>
            </div>

            <!-- Thanh chọn PO của Khách hàng (nếu có PO trong sale_report) -->
            <div v-if="paymentModal.customerPOs.length > 0" style="background: rgba(15, 23, 42, 0.75); border: 1px solid #1e293b; border-radius: 12px; padding: 12px 16px;">
              <div style="font-size: 11.5px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
                Danh sách PO của khách hàng ({{ paymentModal.customerPOs.length }} đơn hàng) — Chọn PO để xem tiến độ & ghi nhận thanh toán:
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <button
                  v-for="po in paymentModal.customerPOs"
                  :key="po._firebaseKey || po.ID"
                  type="button"
                  @click="selectPoInPaymentModal(po)"
                  style="padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s;"
                  :style="{
                    background: paymentModal.row && (paymentModal.row._firebaseKey === po._firebaseKey)
                      ? 'rgba(56, 189, 248, 0.2)'
                      : 'rgba(30, 41, 59, 0.65)',
                    color: paymentModal.row && (paymentModal.row._firebaseKey === po._firebaseKey)
                      ? '#38bdf8'
                      : '#cbd5e1',
                    border: paymentModal.row && (paymentModal.row._firebaseKey === po._firebaseKey)
                      ? '1px solid #38bdf8'
                      : '1px solid #334155'
                  }"
                >
                  <span>PO #{{ po.So_PO || 'N/A' }}</span>
                  <span
                    style="padding: 1px 7px; border-radius: 999px; font-size: 11px;"
                    :style="{
                      background: congNo(po) > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: congNo(po) > 0 ? '#fca5a5' : '#34d399'
                    }"
                  >
                    {{ congNo(po) > 0 ? ('Nợ: ' + (formatCurrency(congNo(po)) || '0') + ' đ') : 'Đã tất toán' }}
                  </span>
                </button>
              </div>
            </div>
            <div v-else style="background: rgba(30, 41, 59, 0.4); border: 1px dashed #334155; border-radius: 12px; padding: 18px; text-align: center; color: #94a3b8; font-size: 13px;">
              Khách hàng này hiện chưa có đơn hàng (PO) nào trong <code>sale_report</code>.
            </div>

            <!-- Chi tiết Kế hoạch & Tiến độ trả nợ của PO đang chọn -->
            <template v-if="paymentModal.row">
              <!-- Thanh nút hành động chính: Thiết lập Kế hoạch TT & Ghi nhận Đợt TT mới -->
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: rgba(15, 23, 42, 0.85); border: 1px solid #1e293b; border-radius: 12px; padding: 12px 16px;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <span style="font-size: 12px; color: #94a3b8; font-weight: 600;">Hình thức TT hiện tại:</span>
                  <span
                    :style="{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '700',
                      background: paymentModal.scheduleMode === 'nhieu_dot' ? 'rgba(168, 85, 247, 0.18)' : 'rgba(56, 189, 248, 0.15)',
                      color: paymentModal.scheduleMode === 'nhieu_dot' ? '#c084fc' : '#38bdf8',
                      border: paymentModal.scheduleMode === 'nhieu_dot' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(56, 189, 248, 0.35)'
                    }"
                  >
                    <span v-if="paymentModal.scheduleMode === 'nhieu_dot'">Chia {{ modalEvaluatedInstallments.length }} đợt thanh toán</span>
                    <span v-else>Thanh toán 1 lần (100% — Hạn: {{ paymentModal.singleDueDate || 'Chưa đặt' }})</span>
                  </span>
                </div>

                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <button
                    type="button"
                    @click="openScheduleSubModal"
                    style="display: inline-flex; align-items: center; gap: 7px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.45); border-radius: 9px; padding: 8px 14px; font-size: 12.5px; font-weight: 700; cursor: pointer;"
                  >
                    <span>📅 Thiết lập Kế hoạch / Hạn thanh toán</span>
                  </button>

                  <button
                    type="button"
                    @click="openRecordPaymentSubModal()"
                    style="display: inline-flex; align-items: center; gap: 7px; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 9px; padding: 8px 16px; font-size: 12.5px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.28);"
                  >
                    <span>+ Ghi nhận đợt thanh toán mới</span>
                  </button>
                </div>
              </div>

              <!-- Bảng Tóm tắt Kế hoạch & Tiến độ các mốc hạn thanh toán -->
              <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 12px; overflow: hidden;">
                <div style="padding: 11px 16px; background: rgba(30, 41, 59, 0.55); border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                  <span style="font-size: 12.5px; font-weight: 700; color: #e2e8f0; text-transform: uppercase;">
                    Tiến độ Kế hoạch & Mốc hạn thanh toán ({{ modalEvaluatedInstallments.length }} đợt)
                  </span>
                  <button
                    type="button"
                    @click="openScheduleSubModal"
                    style="background: transparent; color: #38bdf8; border: 1px dashed rgba(56, 189, 248, 0.4); border-radius: 6px; padding: 3px 10px; font-size: 11px; font-weight: 700; cursor: pointer;"
                  >
                    Chỉnh sửa mốc hạn / Chia đợt
                  </button>
                </div>
                <div style="overflow-x: auto;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #e2e8f0;">
                    <thead>
                      <tr style="background: rgba(15, 23, 42, 0.9); border-bottom: 1px solid #334155; text-align: left; color: #94a3b8; font-size: 11px; text-transform: uppercase;">
                        <th style="padding: 9px 12px; width: 55px;">Đợt</th>
                        <th style="padding: 9px 12px;">Nội dung đợt</th>
                        <th style="padding: 9px 12px; text-align: right; width: 80px;">Tỷ lệ</th>
                        <th style="padding: 9px 12px; text-align: right;">Phải thu</th>
                        <th style="padding: 9px 12px; text-align: right;">Đã thu</th>
                        <th style="padding: 9px 12px; text-align: right;">Còn thiếu</th>
                        <th style="padding: 9px 12px;">Mốc hạn TT</th>
                        <th style="padding: 9px 12px;">Trạng thái hạn</th>
                        <th style="padding: 9px 12px; text-align: center; width: 105px;">Thu nhanh</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(inst, idx) in modalEvaluatedInstallments" :key="idx" style="border-bottom: 1px dashed #1e293b;">
                        <td style="padding: 9px 12px; font-weight: 800; color: #c084fc;">#{{ inst.dot }}</td>
                        <td style="padding: 9px 12px; font-weight: 600; color: #f8fafc;">{{ inst.noi_dung }}</td>
                        <td style="padding: 9px 12px; text-align: right; font-weight: 700; color: #38bdf8;">{{ inst.ty_le_pct }}%</td>
                        <td style="padding: 9px 12px; text-align: right; font-weight: 700; color: #e2e8f0;">{{ formatCurrency(inst.so_tien_phai_thu) || '0' }} đ</td>
                        <td style="padding: 9px 12px; text-align: right; font-weight: 700; color: #34d399;">{{ formatCurrency(inst.da_thu) || '0' }} đ</td>
                        <td style="padding: 9px 12px; text-align: right; font-weight: 700;" :style="{ color: inst.con_thieu > 0 ? '#f87171' : '#64748b' }">
                          {{ formatCurrency(inst.con_thieu) || '0' }} đ
                        </td>
                        <td style="padding: 9px 12px; font-family: monospace; font-weight: 700; color: #cbd5e1;">
                          {{ inst.han_thanh_toan || 'Chưa đặt hạn' }}
                        </td>
                        <td style="padding: 9px 12px;">
                          <span
                            :style="{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: '700',
                              color: inst.statusColor,
                              background: 'rgba(15, 23, 42, 0.85)',
                              border: `1px solid ${inst.statusColor}`
                            }"
                          >
                            <span>{{ inst.statusLabel }}</span>
                          </span>
                        </td>
                        <td style="padding: 9px 12px; text-align: center;">
                          <button
                            v-if="inst.con_thieu > 0"
                            type="button"
                            @click="openRecordPaymentSubModal(inst)"
                            style="background: rgba(16, 185, 129, 0.16); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap;"
                          >
                            Thu đợt này
                          </button>
                          <span v-else style="font-size: 11px; color: #34d399; font-weight: 700;">Hoàn tất</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>

            <!-- Bảng Lịch sử thanh toán (lich_su_thanh_toan) -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 12px; overflow: hidden;">
              <div style="padding: 12px 16px; background: rgba(30, 41, 59, 0.6); border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <span style="font-size: 13px; font-weight: 700; color: #e2e8f0; text-transform: uppercase;">
                  Lịch sử thanh toán thực tế {{ paymentModal.row ? ('của PO #' + (paymentModal.row.So_PO || 'N/A')) : 'của Khách hàng' }}
                  ({{ currentModalPaymentHistory.length }} lần)
                </span>
                <span style="font-size: 11px; color: #64748b;">Schema: <code>lich_su_thanh_toan</code></span>
              </div>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #e2e8f0;">
                  <thead>
                    <tr style="background: rgba(15, 23, 42, 0.9); border-bottom: 1px solid #334155; text-align: left; color: #94a3b8;">
                      <th style="padding: 10px 12px;">Lần</th>
                      <th style="padding: 10px 12px;">Mã GD (id)</th>
                      <th style="padding: 10px 12px;">Thời gian TT</th>
                      <th style="padding: 10px 12px;">Mã KH (maKH)</th>
                      <th style="padding: 10px 12px; text-align: right;">Số tiền thanh toán</th>
                      <th style="padding: 10px 12px; text-align: right;">Công nợ còn lại</th>
                      <th style="padding: 10px 12px;">Ghi chú</th>
                      <th style="padding: 10px 12px; text-align: center; width: 50px;">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(h, idx) in currentModalPaymentHistory" :key="h.id || idx" style="border-bottom: 1px dashed #1e293b;">
                      <td style="padding: 10px 12px; font-weight: 700; color: #38bdf8;">#{{ currentModalPaymentHistory.length - idx }}</td>
                      <td style="padding: 10px 12px; font-family: monospace; font-size: 11px; color: #94a3b8;">{{ h.id }}</td>
                      <td style="padding: 10px 12px; color: #f8fafc;">{{ h.thoi_gian_thanh_toan || '—' }}</td>
                      <td style="padding: 10px 12px; color: #cbd5e1;">{{ h.maKH }}</td>
                      <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #34d399;">+{{ formatCurrency(toNum(h.so_tien_thanh_toan)) || '0' }} đ</td>
                      <td style="padding: 10px 12px; text-align: right; font-weight: 700;" :style="{ color: toNum(h.cong_no_con_lai) > 0 ? '#f87171' : '#34d399' }">
                        {{ formatCurrency(toNum(h.cong_no_con_lai)) || '0' }} đ
                      </td>
                      <td style="padding: 10px 12px; color: #94a3b8;">{{ h.ghi_chu || '—' }}</td>
                      <td style="padding: 10px 12px; text-align: center;">
                        <button
                          v-if="paymentModal.row"
                          type="button"
                          @click="deletePaymentHistoryItem(h)"
                          title="Xóa đợt thanh toán này và hoàn lại công nợ"
                          style="background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 5px 7px; cursor: pointer;"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                    <tr v-if="currentModalPaymentHistory.length === 0">
                      <td colspan="8" style="padding: 24px; text-align: center; color: #64748b; font-style: italic;">
                        Chưa có lịch sử thanh toán nào.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 14px 24px; background: rgba(15, 23, 42, 0.95); border-top: 1px solid #1e293b; display: flex; justify-content: flex-end;">
            <button type="button" class="btn-cancel" @click="paymentModal.show = false" style="padding: 8px 20px;">Đóng</button>
          </div>
        </div>
      </div>

      <!-- SUB-MODAL 1: Thiết lập Kế hoạch & Mốc thời gian phải thanh toán -->
      <div v-if="paymentModal.show && paymentModal.row && paymentModal.showScheduleSubModal" class="modal-overlay" @click.self="paymentModal.showScheduleSubModal = false" style="z-index: 100065; padding: 20px; background: rgba(2, 6, 23, 0.78);">
        <div style="max-width: 880px; width: 95vw; background: #0f172a; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; max-height: 88vh; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65);">
          <div style="background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid #1e293b; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="margin: 0; color: #f8fafc; font-size: 15px; font-weight: 800; text-transform: uppercase;">
                Thiết lập Kế hoạch & Mốc hạn thanh toán — PO #{{ paymentModal.row.So_PO || 'N/A' }}
              </h4>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                Tổng giá trị PO sau VAT: <strong style="color: #38bdf8;">{{ formatCurrency(tongSauVat(paymentModal.row)) || '0' }} đ</strong>
                • Đã thu: <strong style="color: #34d399;">{{ formatCurrency(daThanhToan(paymentModal.row)) || '0' }} đ</strong>
              </div>
            </div>
            <button @click="paymentModal.showScheduleSubModal = false" style="background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer;">&times;</button>
          </div>

          <div style="padding: 18px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
            <div style="display: inline-flex; background: #090f1d; border: 1px solid #334155; border-radius: 8px; padding: 3px; gap: 4px; align-self: flex-start;">
              <button
                type="button"
                @click="setScheduleMode('mot_lan')"
                :style="{
                  background: paymentModal.scheduleMode === 'mot_lan' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: paymentModal.scheduleMode === 'mot_lan' ? '#38bdf8' : '#94a3b8',
                  border: paymentModal.scheduleMode === 'mot_lan' ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }"
              >
                Thanh toán 1 lần (100%)
              </button>
              <button
                type="button"
                @click="setScheduleMode('nhieu_dot')"
                :style="{
                  background: paymentModal.scheduleMode === 'nhieu_dot' ? 'rgba(168, 85, 247, 0.22)' : 'transparent',
                  color: paymentModal.scheduleMode === 'nhieu_dot' ? '#c084fc' : '#94a3b8',
                  border: paymentModal.scheduleMode === 'nhieu_dot' ? '1px solid rgba(168, 85, 247, 0.45)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }"
              >
                Chia theo đợt (% khác nhau)
              </button>
            </div>

            <div v-if="paymentModal.scheduleMode === 'mot_lan'" style="display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; background: rgba(30, 41, 59, 0.45); border: 1px solid #1e293b; border-radius: 10px; padding: 16px;">
              <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
                <div>
                  <label style="font-size: 11.5px; color: #cbd5e1; font-weight: 600; display: block; margin-bottom: 6px;">Mốc hạn thanh toán (DD/MM/YYYY)</label>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="text" v-model="paymentModal.singleDueDate" placeholder="DD/MM/YYYY" class="form-input" style="width: 140px; padding: 8px 10px;" />
                    <input type="date" :value="ddmmyyyyToIso(paymentModal.singleDueDate)" @change="onSingleDueDatePickerChange" class="form-input" style="width: 155px; padding: 7px 10px;" />
                  </div>
                </div>
                <div>
                  <label style="font-size: 11.5px; color: #cbd5e1; font-weight: 600; display: block; margin-bottom: 6px;">Chọn nhanh hạn TT (từ ngày tạo PO)</label>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button type="button" @click="setSingleDueDateDays(7, true)" style="background: rgba(51, 65, 85, 0.55); color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; padding: 6px 10px; font-size: 11.5px; font-weight: 600; cursor: pointer;">+7 ngày</button>
                    <button type="button" @click="setSingleDueDateDays(15, true)" style="background: rgba(51, 65, 85, 0.55); color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; padding: 6px 10px; font-size: 11.5px; font-weight: 600; cursor: pointer;">+15 ngày</button>
                    <button type="button" @click="setSingleDueDateDays(30, true)" style="background: rgba(51, 65, 85, 0.55); color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; padding: 6px 10px; font-size: 11.5px; font-weight: 600; cursor: pointer;">+30 ngày</button>
                    <button type="button" @click="setSingleDueDateDays(45, true)" style="background: rgba(51, 65, 85, 0.55); color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; padding: 6px 10px; font-size: 11.5px; font-weight: 600; cursor: pointer;">+45 ngày</button>
                    <button type="button" @click="setSingleDueDateDays(60, true)" style="background: rgba(51, 65, 85, 0.55); color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; padding: 6px 10px; font-size: 11.5px; font-weight: 600; cursor: pointer;">+60 ngày</button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <span style="font-size: 11.5px; color: #94a3b8; font-weight: 600;">Mẫu chia đợt nhanh:</span>
                  <button type="button" @click="applySchedulePreset([30, 70], ['Đợt 1 - Tạm ứng 30%', 'Đợt 2 - Tất toán 70%'])" style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">2 đợt (30% - 70%)</button>
                  <button type="button" @click="applySchedulePreset([50, 50], ['Đợt 1 - Tạm ứng 50%', 'Đợt 2 - Tất toán 50%'])" style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">2 đợt (50% - 50%)</button>
                  <button type="button" @click="applySchedulePreset([30, 50, 20], ['Đợt 1 - Tạm ứng 30%', 'Đợt 2 - Giao hàng 50%', 'Đợt 3 - Nghiệm thu 20%'])" style="background: rgba(168, 85, 247, 0.14); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">3 đợt (30% - 50% - 20%)</button>
                </div>
                <button type="button" @click="addScheduleInstallment" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 6px; padding: 5px 11px; font-size: 11.5px; font-weight: 700; cursor: pointer;">+ Thêm đợt TT</button>
              </div>

              <div style="overflow-x: auto; border: 1px solid #1e293b; border-radius: 10px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #e2e8f0;">
                  <thead>
                    <tr style="background: rgba(30, 41, 59, 0.75); border-bottom: 1px solid #334155; text-align: left; color: #94a3b8; font-size: 11px; text-transform: uppercase;">
                      <th style="padding: 8px 10px; width: 46px;">Đợt</th>
                      <th style="padding: 8px 10px;">Nội dung đợt</th>
                      <th style="padding: 8px 10px; width: 90px; text-align: right;">Tỷ lệ (%)</th>
                      <th style="padding: 8px 10px; width: 150px; text-align: right;">Số tiền phải thu</th>
                      <th style="padding: 8px 10px; width: 155px;">Hạn thanh toán</th>
                      <th style="padding: 8px 10px; text-align: center; width: 55px;">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(inst, idx) in paymentModal.scheduleItems" :key="idx" style="border-bottom: 1px dashed #1e293b;">
                      <td style="padding: 8px 10px; font-weight: 800; color: #c084fc;">#{{ idx + 1 }}</td>
                      <td style="padding: 8px 10px;">
                        <input type="text" v-model="inst.noi_dung" class="form-input" style="padding: 6px 8px; font-size: 12px;" />
                      </td>
                      <td style="padding: 8px 10px;">
                        <input type="number" min="0" max="100" step="0.5" :value="inst.ty_le_pct" @input="onInstallmentPctChange(idx, $event)" class="form-input" style="padding: 6px; font-size: 12px; text-align: right;" />
                      </td>
                      <td style="padding: 8px 10px;">
                        <input type="text" :value="inst.so_tien_phai_thu > 0 ? inst.so_tien_phai_thu.toLocaleString('vi-VN') : ''" @input="onInstallmentAmountInput(idx, $event)" class="form-input" style="padding: 6px 8px; font-size: 12px; text-align: right;" />
                      </td>
                      <td style="padding: 8px 10px;">
                        <input type="date" :value="ddmmyyyyToIso(inst.han_thanh_toan)" @change="onInstallmentDatePickerChange(idx, $event)" class="form-input" style="padding: 5px 8px; font-size: 12px;" />
                      </td>
                      <td style="padding: 8px 10px; text-align: center;">
                        <button v-if="paymentModal.scheduleItems.length > 1" type="button" @click="removeScheduleInstallment(idx)" style="background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 4px 8px; cursor: pointer;">✕</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 12px; color: #94a3b8;">
                <div>
                  Tổng tỷ lệ: <strong :style="{ color: Math.abs(modalScheduleTotalPct - 100) < 0.1 ? '#34d399' : '#fbbf24' }">{{ modalScheduleTotalPct }}%</strong>
                  • Tổng tiền kế hoạch: <strong>{{ formatCurrency(modalScheduleTotalAmount) || '0' }} / {{ formatCurrency(tongSauVat(paymentModal.row)) || '0' }} đ</strong>
                </div>
                <button v-if="Math.abs(modalScheduleTotalAmount - tongSauVat(paymentModal.row)) > 1" type="button" @click="balanceLastInstallment" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  Tự động cân bằng đợt cuối cho khớp 100%
                </button>
              </div>
            </div>
          </div>

          <div style="padding: 14px 22px; background: rgba(15, 23, 42, 0.95); border-top: 1px solid #1e293b; display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="btn-cancel" @click="paymentModal.showScheduleSubModal = false" style="padding: 8px 18px;">Hủy</button>
            <button type="button" class="btn-primary" @click="savePaymentScheduleOnly" :disabled="paymentModal.savingSchedule" style="padding: 8px 18px;">
              {{ paymentModal.savingSchedule ? 'Đang lưu...' : 'Lưu Kế hoạch & Hạn TT' }}
            </button>
          </div>
        </div>
      </div>

      <!-- SUB-MODAL 2: Ghi nhận đợt thanh toán mới -->
      <div v-if="paymentModal.show && paymentModal.row && paymentModal.showRecordSubModal" class="modal-overlay" @click.self="paymentModal.showRecordSubModal = false" style="z-index: 100065; padding: 20px; background: rgba(2, 6, 23, 0.78);">
        <div style="max-width: 620px; width: 95vw; background: #0f172a; border: 1px solid rgba(16, 185, 129, 0.45); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65);">
          <div style="background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid #1e293b; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="margin: 0; color: #f8fafc; font-size: 15px; font-weight: 800; text-transform: uppercase;">
                Ghi nhận đợt thanh toán mới — PO #{{ paymentModal.row.So_PO || 'N/A' }}
              </h4>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                Công nợ hiện tại của PO: <strong style="color: #f87171;">{{ formatCurrency(congNo(paymentModal.row)) || '0' }} đ</strong>
              </div>
            </div>
            <button @click="paymentModal.showRecordSubModal = false" style="background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer;">&times;</button>
          </div>

          <div style="padding: 18px 22px; display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="font-size: 11px; color: #94a3b8; font-weight: 600; display: block; margin-bottom: 6px;">Chọn nhanh số tiền thanh toán:</label>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <template v-if="paymentModal.scheduleMode === 'nhieu_dot'">
                  <button
                    v-for="(inst, idx) in modalEvaluatedInstallments.filter(x => x.con_thieu > 0)"
                    :key="'quick-inst-' + idx"
                    type="button"
                    @click="openRecordPaymentSubModal(inst)"
                    style="background: rgba(168, 85, 247, 0.16); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer;"
                  >
                    Đợt {{ inst.dot }} ({{ formatCurrency(inst.con_thieu) || '0' }} đ)
                  </button>
                </template>
                <button type="button" @click="setPaymentQuickPct(100)" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  Tất toán 100% nợ ({{ formatCurrency(congNo(paymentModal.row)) || '0' }})
                </button>
                <button type="button" @click="setPaymentQuickPct(50)" style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  50% công nợ
                </button>
                <button type="button" @click="setPaymentQuickPct(30)" style="background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  30% công nợ
                </button>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px;">
              <div>
                <label style="font-size: 11.5px; color: #cbd5e1; font-weight: 600; display: block; margin-bottom: 5px;">Số tiền khách thanh toán (VNĐ)</label>
                <input type="text" :value="paymentModal.amountStr" @input="onPaymentAmountInput" placeholder="Nhập số tiền..." class="form-input" style="font-size: 15px; font-weight: 800; color: #34d399; text-align: right;" />
              </div>
              <div>
                <label style="font-size: 11.5px; color: #cbd5e1; font-weight: 600; display: block; margin-bottom: 5px;">Thời gian thanh toán</label>
                <input type="text" v-model="paymentModal.paymentTime" placeholder="DD/MM/YYYY HH:mm:ss" class="form-input" />
              </div>
            </div>

            <div>
              <label style="font-size: 11.5px; color: #cbd5e1; font-weight: 600; display: block; margin-bottom: 5px;">Ghi chú đợt thanh toán (Tùy chọn)</label>
              <input type="text" v-model="paymentModal.note" placeholder="VD: Thanh toán đợt 1 chuyển khoản..." class="form-input" />
            </div>

            <div style="padding: 10px 12px; background: rgba(30, 41, 59, 0.5); border: 1px dashed #334155; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 12px; color: #94a3b8;">
              <span>
                Dự kiến Đã TT mới:
                <strong style="color: #34d399;">{{ formatCurrency(daThanhToan(paymentModal.row) + (paymentModal.amount || 0)) || '0' }} đ</strong>
              </span>
              <span>
                Công nợ còn lại:
                <strong :style="{ color: Math.max(0, congNo(paymentModal.row) - (paymentModal.amount || 0)) > 0 ? '#f87171' : '#34d399', fontSize: '13px' }">
                  {{ formatCurrency(Math.max(0, congNo(paymentModal.row) - (paymentModal.amount || 0))) || '0' }} đ
                </strong>
              </span>
            </div>
          </div>

          <div style="padding: 14px 22px; background: rgba(15, 23, 42, 0.95); border-top: 1px solid #1e293b; display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="btn-cancel" @click="paymentModal.showRecordSubModal = false" style="padding: 8px 18px;">Hủy</button>
            <button type="button" class="btn-primary" @click="submitPayment" :disabled="paymentModal.saving || paymentModal.amount <= 0" style="padding: 8px 18px;">
              {{ paymentModal.saving ? 'Đang lưu...' : 'Xác nhận Ghi nhận TT' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, ref as dbRef, get, set, push, update, remove } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8",
  authDomain: "chusonproject.firebaseapp.com",
  databaseURL: "https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chusonproject",
  storageBucket: "chusonproject.firebasestorage.app",
  messagingSenderId: "929199941311",
  appId: "1:929199941311:web:ca8d86f9fd7f8dff61480a",
  measurementId: "G-48VVPGFSFK"
}

const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const database = getDatabase(firebaseApp)

const KH_FIELDS = [
  'ma_khach_hang',
  'ten_khach_hang',
  'email_ca_nhan',
  'so_dien_thoai_ca_nhan',
  'ma_cong_ty',
  'ten_cong_ty',
  'so_dien_thoai_cong_ty',
  'so_fax_cong_ty',
  'dia_chi_cong_ty',
  'email_cong_ty',
  'website_cong_ty',
  'hoa_hong',
  'tong_chi_tieu',
  'tong_loi_nhuan',
  'trang_thai',
  'ghi_chu',
  'ten_khach_hang_phu',
  'so_dien_thoai_ca_nhan_phu',
  'email_ca_nhan_phu',
  'mst',
  'company',
  'address',
  'tel'
]

const kh_genID = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `KH_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

const sanitizeFirebaseKey = (key) => {
  return String(key || '').trim().replace(/[.#$[\]/]/g, '_')
}

const normalizeCustomerRecord = (raw, fbKey) => {
  if (!raw || typeof raw !== 'object') return null
  if (Array.isArray(raw)) {
    const obj = { _firebaseKey: fbKey, cong_no: 0, tagKH: [] }
    KH_FIELDS.forEach((field, idx) => {
      obj[field] = raw[idx] !== undefined && raw[idx] !== null ? raw[idx] : ''
    })
    if (!obj.ma_khach_hang && fbKey) obj.ma_khach_hang = fbKey
    return obj
  }
  const obj = { ...raw, _firebaseKey: fbKey }
  KH_FIELDS.forEach((field) => {
    if (obj[field] === undefined || obj[field] === null) {
      obj[field] = ''
    }
  })
  if (!obj.ma_khach_hang && fbKey) obj.ma_khach_hang = fbKey
  if (!obj.so_dien_thoai_ca_nhan && raw.sdt) obj.so_dien_thoai_ca_nhan = raw.sdt
  if (!obj.email_ca_nhan && raw.email) obj.email_ca_nhan = raw.email
  if (!obj.dia_chi_cong_ty && raw.dia_chi) obj.dia_chi_cong_ty = raw.dia_chi
  obj.cong_no = Number(raw.cong_no) || 0
  obj.tagKH = Array.isArray(raw.tagKH)
    ? [...raw.tagKH]
    : (typeof raw.tagKH === 'string' && raw.tagKH.trim() ? [raw.tagKH.trim()] : [])
  obj.last_updated =
    raw.last_updated ||
    raw.lastupdated ||
    raw.lastUpdated ||
    raw.lastupadted ||
    raw.created_time ||
    raw.createdAt ||
    ''
  return obj
}

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
  router.push({ path: '/quanlybaogiafirebase', query: { tab: 'thoihan', card: 'renew', customer: customerKey } })
}

function navigateToContracts(kh, processingType) {
  router.push({ path: '/quanlybaogiafirebase', query: { tab: 'baogia', dashboard: processingType, customerid: kh.ma_khach_hang, sort: 'DESC' } })
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
        (c.ma_khach_hang && normalizeForSearch(c.ma_khach_hang).includes(q)) ||
        (Array.isArray(c.tagKH) && c.tagKH.some(t => normalizeForSearch(t).includes(q)))
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
  tel: '',
  cong_no: 0,
  tagKH: [],
  last_updated: ''
})

const formatLastUpdated = (val) => {
  if (!val && val !== 0) return 'Chưa ghi nhận'
  const rawStr = String(val).trim()
  if (!rawStr) return 'Chưa ghi nhận'
  let dt = null
  if (/^\d+$/.test(rawStr)) {
    dt = new Date(Number(rawStr))
  } else {
    dt = parseDateStr(rawStr) || new Date(rawStr)
  }
  if (!dt || isNaN(dt.getTime())) return rawStr
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

// ─── Quản lý Nhóm Khách Hàng (tagKH) ───
const isTagModalOpen = ref(false)
const tempTagKH = ref('')
const customAddedTags = ref([])
const editingTagId = ref(null)
const editTagValue = ref('')

const availableTags = computed(() => {
  const tags = new Set(customAddedTags.value)
  customers.value.forEach(c => {
    if (Array.isArray(c.tagKH)) {
      c.tagKH.forEach(t => {
        if (t && String(t).trim()) tags.add(String(t).trim())
      })
    }
  })
  if (Array.isArray(formData.value?.tagKH)) {
    formData.value.tagKH.forEach(t => {
      if (t && String(t).trim()) tags.add(String(t).trim())
    })
  }
  return Array.from(tags)
})

const addNewTagFromInput = () => {
  const newTag = String(tempTagKH.value || '').trim()
  if (!newTag) return
  if (!customAddedTags.value.includes(newTag)) {
    customAddedTags.value.push(newTag)
  }
  if (!Array.isArray(formData.value.tagKH)) {
    formData.value.tagKH = []
  }
  if (!formData.value.tagKH.includes(newTag)) {
    formData.value.tagKH.push(newTag)
  }
  tempTagKH.value = ''
}

const toggleTag = (tagName) => {
  if (!Array.isArray(formData.value.tagKH)) {
    formData.value.tagKH = []
  }
  if (formData.value.tagKH.includes(tagName)) {
    formData.value.tagKH = formData.value.tagKH.filter(t => t !== tagName)
  } else {
    formData.value.tagKH.push(tagName)
  }
}

const startEditTag = (tagName) => {
  editingTagId.value = tagName
  editTagValue.value = tagName
}

const saveTagEdit = async (oldTagName) => {
  const newTagName = String(editTagValue.value || '').trim()
  if (!newTagName || newTagName === oldTagName) {
    editingTagId.value = null
    return
  }

  const updates = {}
  const nowIso = new Date().toISOString()
  customers.value.forEach(c => {
    if (Array.isArray(c.tagKH) && c.tagKH.includes(oldTagName)) {
      const newTags = Array.from(new Set(c.tagKH.map(t => (t === oldTagName ? newTagName : t))))
      const fbKey = c._firebaseKey || sanitizeFirebaseKey(c.ma_khach_hang)
      if (fbKey) {
        updates[`khach_hang/${fbKey}/tagKH`] = newTags
        updates[`khach_hang/${fbKey}/last_updated`] = nowIso
      }
      c.tagKH = newTags
      c.last_updated = nowIso
    }
  })

  if (Object.keys(updates).length > 0) {
    await update(dbRef(database), updates)
  }

  customAddedTags.value = customAddedTags.value.map(t => (t === oldTagName ? newTagName : t))
  if (Array.isArray(formData.value.tagKH) && formData.value.tagKH.includes(oldTagName)) {
    formData.value.tagKH = Array.from(new Set(formData.value.tagKH.map(t => (t === oldTagName ? newTagName : t))))
  }
  editingTagId.value = null
}

const deleteTagGlobal = async (tagName) => {
  if (!confirm(`Bạn có chắc muốn xóa nhóm "${tagName}" khỏi tất cả khách hàng không?`)) return

  const updates = {}
  const nowIso = new Date().toISOString()
  customers.value.forEach(c => {
    if (Array.isArray(c.tagKH) && c.tagKH.includes(tagName)) {
      const newTags = c.tagKH.filter(t => t !== tagName)
      const fbKey = c._firebaseKey || sanitizeFirebaseKey(c.ma_khach_hang)
      if (fbKey) {
        updates[`khach_hang/${fbKey}/tagKH`] = newTags
        updates[`khach_hang/${fbKey}/last_updated`] = nowIso
      }
      c.tagKH = newTags
      c.last_updated = nowIso
    }
  })

  if (Object.keys(updates).length > 0) {
    await update(dbRef(database), updates)
  }

  customAddedTags.value = customAddedTags.value.filter(t => t !== tagName)
  if (Array.isArray(formData.value.tagKH)) {
    formData.value.tagKH = formData.value.tagKH.filter(t => t !== tagName)
  }
}

// ─── Sale Report, Công nợ & Lịch sử thanh toán (như SaleReportFirebase) ───
const saleReportRows = ref([])
const lichSuThanhToanList = ref([])

const toNum = (v) => {
  if (v === null || v === undefined || v === '') return 0
  if (typeof v === 'number') return isNaN(v) ? 0 : v
  const cleaned = String(v).replace(/[^0-9.-]/g, '')
  const n = Number(cleaned)
  return isNaN(n) ? 0 : n
}

const parseDateStr = (str) => {
  if (!str) return null
  const s = String(str).trim()
  const dmyTime = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/)
  if (dmyTime) {
    return new Date(
      Number(dmyTime[3]),
      Number(dmyTime[2]) - 1,
      Number(dmyTime[1]),
      Number(dmyTime[4] || 0),
      Number(dmyTime[5] || 0),
      Number(dmyTime[6] || 0)
    )
  }
  const timeDmy = s.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (timeDmy) {
    return new Date(
      Number(timeDmy[6]),
      Number(timeDmy[5]) - 1,
      Number(timeDmy[4]),
      Number(timeDmy[1] || 0),
      Number(timeDmy[2] || 0),
      Number(timeDmy[3] || 0)
    )
  }
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

const getFormattedNow = () => {
  const now = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${p(now.getDate())}/${p(now.getMonth() + 1)}/${now.getFullYear()} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`
}

const tongSauVat = (r) => {
  if (!r) return 0
  const s = toNum(r.Tong_tien_sau_thueVAT)
  return s > 0 ? s : (toNum(r.Tong_tien_truoc_thueVAT) + toNum(r.Tong_thueVAT))
}

const daThanhToan = (r) => toNum(r?.so_tien_da_thanh_toan)

const congNo = (r) => {
  if (!r) return 0
  if (r.cong_no !== undefined && r.cong_no !== null && r.cong_no !== '') {
    return Math.max(0, toNum(r.cong_no))
  }
  return Math.max(0, tongSauVat(r) - daThanhToan(r))
}

const ddmmyyyyToIso = (s) => {
  if (!s) return ''
  const str = String(s).trim()
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  return ''
}

const isoToDdmmyyyy = (iso) => {
  if (!iso) return ''
  const str = String(iso).trim()
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmy) return `${dmy[1].padStart(2, '0')}/${dmy[2].padStart(2, '0')}/${dmy[3]}`
  return str
}

const formatDateObjToDdmmyyyy = (d) => {
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

const addDaysToDateStr = (baseStr, days) => {
  const baseDate = parseDateStr(baseStr) || new Date()
  const target = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())
  target.setDate(target.getDate() + days)
  return formatDateObjToDdmmyyyy(target)
}

const getDaysUntilDue = (dueDateStr) => {
  if (!dueDateStr) return null
  const d = parseDateStr(String(dueDateStr).trim())
  if (!d || isNaN(d.getTime())) return null
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const dueMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return Math.round((dueMidnight - todayMidnight) / 86400000)
}

const evaluateInstallmentSchedule = (totalSau, paidTotal, mode, singleDue, items) => {
  const rawList =
    mode === 'nhieu_dot' && Array.isArray(items) && items.length > 0
      ? items
      : [
          {
            dot: 1,
            noi_dung: 'Thanh toán 100% đơn hàng',
            ty_le_pct: 100,
            so_tien_phai_thu: totalSau,
            han_thanh_toan: singleDue || (Array.isArray(items) && items[0]?.han_thanh_toan) || ''
          }
        ]

  let remainingPaid = Math.max(0, toNum(paidTotal))

  return rawList.map((inst, idx) => {
    const phaiThu = Math.max(0, toNum(inst.so_tien_phai_thu))
    const daThu = Math.min(phaiThu, remainingPaid)
    remainingPaid = Math.max(0, remainingPaid - daThu)
    const conThieu = Math.max(0, phaiThu - daThu)
    const hanTT = String(inst.han_thanh_toan || '').trim()
    const daysDiff = getDaysUntilDue(hanTT)

    let status = 'chua_co_han'
    let statusLabel = 'Chưa đặt hạn'
    let statusColor = '#64748b'

    if (conThieu <= 0 && phaiThu > 0) {
      status = 'da_thu_du'
      statusLabel = 'Đã thu đủ'
      statusColor = '#34d399'
    } else if (daysDiff !== null && daysDiff < 0) {
      status = 'qua_han'
      statusLabel = `Quá hạn ${Math.abs(daysDiff)} ngày`
      statusColor = '#f87171'
    } else if (daysDiff !== null && daysDiff === 0) {
      status = 'den_han_hom_nay'
      statusLabel = 'Hôm nay đến hạn'
      statusColor = '#fbbf24'
    } else if (daysDiff !== null && daysDiff > 0 && daysDiff <= 7) {
      status = 'sap_den_han'
      statusLabel = `Sắp đến hạn (còn ${daysDiff} ngày)`
      statusColor = '#fbbf24'
    } else if (daThu > 0) {
      status = 'thu_mot_phan'
      statusLabel = daysDiff !== null ? `Thu 1 phần (còn ${daysDiff} ngày)` : 'Đã thu 1 phần'
      statusColor = '#38bdf8'
    } else if (daysDiff !== null && daysDiff > 7) {
      status = 'trong_han'
      statusLabel = `Trong hạn (còn ${daysDiff} ngày)`
      statusColor = '#94a3b8'
    }

    return {
      dot: inst.dot || idx + 1,
      noi_dung: inst.noi_dung || `Đợt ${idx + 1}`,
      ty_le_pct: toNum(inst.ty_le_pct),
      so_tien_phai_thu: phaiThu,
      han_thanh_toan: hanTT,
      da_thu: daThu,
      con_thieu: conThieu,
      daysDiff,
      status,
      statusLabel,
      statusColor
    }
  })
}

const doesRowMatchCustomer = (r, kh) => {
  if (!r || !kh) return false
  const mkh = String(kh.ma_khach_hang || '').trim()
  const mct = String(kh.ma_cong_ty || '').trim()
  const mst = String(kh.mst || '').trim()
  const rMkh = String(r.Ma_khach_hang || '').trim()
  const rMct = String(r.Ma_cong_ty || '').trim()
  const rMst = String(r.MST || '').trim()

  if (mkh && rMkh && mkh === rMkh) return true
  if (mct && rMct && mct === rMct) return true
  if (mkh && rMct && mkh === rMct) return true
  if (mct && rMkh && mct === rMkh) return true
  if (mst && rMst && mst === rMst) return true
  return false
}

const getCustomerPOs = (kh) => {
  if (!kh) return []
  return saleReportRows.value.filter(r => doesRowMatchCustomer(r, kh))
}

const getCustomerDebtSummary = (kh) => {
  if (!kh) return { poCount: 0, tongSauVat: 0, daThanhToan: 0, congNo: 0, progressPct: 0 }
  const pos = getCustomerPOs(kh)
  if (pos.length > 0) {
    const tongSau = pos.reduce((s, r) => s + tongSauVat(r), 0)
    const daTT = pos.reduce((s, r) => s + daThanhToan(r), 0)
    const cn = pos.reduce((s, r) => s + congNo(r), 0)
    const progressPct = tongSau > 0 ? Math.min(100, Math.round((daTT / tongSau) * 100)) : (cn <= 0 ? 100 : 0)
    return { poCount: pos.length, tongSauVat: tongSau, daThanhToan: daTT, congNo: cn, progressPct }
  }
  const fallbackCn = Math.max(0, toNum(kh.cong_no))
  return {
    poCount: 0,
    tongSauVat: fallbackCn,
    daThanhToan: 0,
    congNo: fallbackCn,
    progressPct: fallbackCn > 0 ? 0 : 100
  }
}

const getPaymentHistoryForPO = (r) => {
  if (!r) return []
  const srId = String(r.ID || r._firebaseKey || '')
  const fbKey = String(r._firebaseKey || '')
  return lichSuThanhToanList.value.filter(
    h => (srId && String(h.id_salereport) === srId) || (fbKey && String(h.id_salereport) === fbKey)
  )
}

const getPaymentHistoryForCustomer = (kh) => {
  if (!kh) return []
  const pos = getCustomerPOs(kh)
  const poIds = new Set()
  pos.forEach(p => {
    if (p.ID) poIds.add(String(p.ID))
    if (p._firebaseKey) poIds.add(String(p._firebaseKey))
  })
  const mkh = String(kh.ma_khach_hang || '').trim()
  const mct = String(kh.ma_cong_ty || '').trim()
  return lichSuThanhToanList.value.filter(h => {
    const srId = String(h.id_salereport || '')
    const hMaKH = String(h.maKH || '').trim()
    if (srId && poIds.has(srId)) return true
    if (mkh && hMaKH === mkh) return true
    if (mct && hMaKH === mct) return true
    return false
  })
}

const getCustomerPaymentHistoryCount = (kh) => {
  return getPaymentHistoryForCustomer(kh).length
}

const paymentModal = ref({
  show: false,
  customer: null,
  customerPOs: [],
  row: null,
  amount: 0,
  amountStr: '',
  paymentTime: '',
  note: '',
  saving: false,
  scheduleMode: 'mot_lan',
  singleDueDate: '',
  scheduleItems: [],
  savingSchedule: false,
  showScheduleSubModal: false,
  showRecordSubModal: false
})

const currentModalPaymentHistory = computed(() => {
  if (paymentModal.value.row) {
    return getPaymentHistoryForPO(paymentModal.value.row)
  }
  return getPaymentHistoryForCustomer(paymentModal.value.customer)
})

const modalEvaluatedInstallments = computed(() => {
  const m = paymentModal.value
  if (!m.row) return []
  return evaluateInstallmentSchedule(
    tongSauVat(m.row),
    daThanhToan(m.row),
    m.scheduleMode,
    m.singleDueDate,
    m.scheduleItems
  )
})

const modalScheduleTotalPct = computed(() => {
  const m = paymentModal.value
  if (m.scheduleMode === 'mot_lan') return 100
  return Math.round(m.scheduleItems.reduce((s, it) => s + toNum(it.ty_le_pct), 0) * 100) / 100
})

const modalScheduleTotalAmount = computed(() => {
  const m = paymentModal.value
  if (!m.row) return 0
  if (m.scheduleMode === 'mot_lan') return tongSauVat(m.row)
  return m.scheduleItems.reduce((s, it) => s + toNum(it.so_tien_phai_thu), 0)
})

const setupModalForPO = (row) => {
  if (!row) {
    paymentModal.value.row = null
    paymentModal.value.scheduleItems = []
    paymentModal.value.singleDueDate = ''
    paymentModal.value.amount = 0
    paymentModal.value.amountStr = ''
    return
  }
  const remaining = congNo(row)
  const totalSau = tongSauVat(row)
  const existingMode =
    row.loai_thanh_toan === 'nhieu_dot' || (Array.isArray(row.ke_hoach_thanh_toan) && row.ke_hoach_thanh_toan.length > 1)
      ? 'nhieu_dot'
      : 'mot_lan'

  const existingSchedule =
    Array.isArray(row.ke_hoach_thanh_toan) && row.ke_hoach_thanh_toan.length > 0
      ? row.ke_hoach_thanh_toan.map((it, idx) => ({
          dot: Number(it.dot) || idx + 1,
          noi_dung: String(it.noi_dung || `Đợt ${idx + 1}`),
          ty_le_pct: Number(it.ty_le_pct) || 0,
          so_tien_phai_thu: Number(it.so_tien_phai_thu) || Math.round(totalSau * ((Number(it.ty_le_pct) || 0) / 100)),
          han_thanh_toan: String(it.han_thanh_toan || '')
        }))
      : [
          {
            dot: 1,
            noi_dung: 'Thanh toán 100% đơn hàng',
            ty_le_pct: 100,
            so_tien_phai_thu: totalSau,
            han_thanh_toan: String(row.han_thanh_toan || '')
          }
        ]

  const singleDue = String(row.han_thanh_toan || existingSchedule[0]?.han_thanh_toan || '')
  const evalInst = evaluateInstallmentSchedule(totalSau, daThanhToan(row), existingMode, singleDue, existingSchedule)
  const nextUnpaid = evalInst.find(x => x.con_thieu > 0)
  const defaultPayAmt = existingMode === 'nhieu_dot' && nextUnpaid ? nextUnpaid.con_thieu : (remaining > 0 ? remaining : 0)
  const defaultNote = existingMode === 'nhieu_dot' && nextUnpaid ? `Thanh toán Đợt ${nextUnpaid.dot} (${nextUnpaid.noi_dung})` : ''

  paymentModal.value.row = row
  paymentModal.value.amount = defaultPayAmt
  paymentModal.value.amountStr = defaultPayAmt > 0 ? defaultPayAmt.toLocaleString('vi-VN') : ''
  paymentModal.value.paymentTime = getFormattedNow()
  paymentModal.value.note = defaultNote
  paymentModal.value.scheduleMode = existingMode
  paymentModal.value.singleDueDate = singleDue
  paymentModal.value.scheduleItems = existingSchedule
  paymentModal.value.showScheduleSubModal = false
  paymentModal.value.showRecordSubModal = false
}

const openCustomerDebtModal = (kh) => {
  if (!kh) return
  const pos = getCustomerPOs(kh)
  const firstUnpaid = pos.find(p => congNo(p) > 0) || pos[0] || null
  paymentModal.value.customer = kh
  paymentModal.value.customerPOs = pos
  paymentModal.value.show = true
  setupModalForPO(firstUnpaid)
}

const selectPoInPaymentModal = (po) => {
  setupModalForPO(po)
}

const openScheduleSubModal = () => {
  if (!paymentModal.value.row) return
  paymentModal.value.showScheduleSubModal = true
}

const openRecordPaymentSubModal = (evalInst) => {
  const m = paymentModal.value
  if (!m.row) return
  m.paymentTime = getFormattedNow()
  if (evalInst) {
    const amt = toNum(evalInst.con_thieu) > 0 ? toNum(evalInst.con_thieu) : toNum(evalInst.so_tien_phai_thu)
    m.amount = amt
    m.amountStr = amt > 0 ? amt.toLocaleString('vi-VN') : ''
    m.note = m.scheduleMode === 'nhieu_dot'
      ? `Thanh toán Đợt ${evalInst.dot} (${evalInst.noi_dung})`
      : 'Thanh toán 100% đơn hàng'
  } else {
    const remaining = congNo(m.row)
    const nextUnpaid = modalEvaluatedInstallments.value.find(x => x.con_thieu > 0)
    const defaultPayAmt = m.scheduleMode === 'nhieu_dot' && nextUnpaid
      ? nextUnpaid.con_thieu
      : (remaining > 0 ? remaining : 0)
    m.amount = defaultPayAmt
    m.amountStr = defaultPayAmt > 0 ? defaultPayAmt.toLocaleString('vi-VN') : ''
    m.note = m.scheduleMode === 'nhieu_dot' && nextUnpaid
      ? `Thanh toán Đợt ${nextUnpaid.dot} (${nextUnpaid.noi_dung})`
      : ''
  }
  m.showScheduleSubModal = false
  m.showRecordSubModal = true
}

const setScheduleMode = (mode) => {
  const m = paymentModal.value
  if (!m.row) return
  m.scheduleMode = mode
  const totalSau = tongSauVat(m.row)
  if (mode === 'mot_lan') {
    if (!m.singleDueDate && m.scheduleItems.length > 0) {
      m.singleDueDate = m.scheduleItems[0].han_thanh_toan || ''
    }
  } else {
    if (m.scheduleItems.length <= 1) {
      applySchedulePreset([30, 70], ['Đợt 1 - Tạm ứng hợp đồng', 'Đợt 2 - Thanh toán khi giao hàng'])
    } else {
      m.scheduleItems.forEach((it, idx) => {
        it.dot = idx + 1
        if (!it.so_tien_phai_thu && it.ty_le_pct > 0) {
          it.so_tien_phai_thu = Math.round(totalSau * (it.ty_le_pct / 100))
        }
      })
    }
  }
}

const setSingleDueDateDays = (days, fromCreatedTime = false) => {
  const m = paymentModal.value
  if (!m.row) return
  const baseStr = fromCreatedTime && m.row.created_time ? m.row.created_time : getFormattedNow()
  m.singleDueDate = addDaysToDateStr(baseStr, days)
  if (m.scheduleItems.length === 1) {
    m.scheduleItems[0].han_thanh_toan = m.singleDueDate
  }
}

const onSingleDueDatePickerChange = (e) => {
  const dmy = isoToDdmmyyyy(e.target.value)
  paymentModal.value.singleDueDate = dmy
  if (paymentModal.value.scheduleItems.length === 1) {
    paymentModal.value.scheduleItems[0].han_thanh_toan = dmy
  }
}

const applySchedulePreset = (pcts, labels) => {
  const m = paymentModal.value
  if (!m.row) return
  m.scheduleMode = 'nhieu_dot'
  const totalSau = tongSauVat(m.row)
  const baseStr = m.row.created_time || getFormattedNow()
  let allocated = 0

  m.scheduleItems = pcts.map((pct, idx) => {
    const isLast = idx === pcts.length - 1
    const amt = isLast ? Math.max(0, totalSau - allocated) : Math.round(totalSau * (pct / 100))
    allocated += amt
    const defaultDays = idx === 0 ? 7 : idx === 1 ? 30 : 45 + (idx - 2) * 15
    return {
      dot: idx + 1,
      noi_dung: (labels && labels[idx]) || (idx === 0 ? 'Đợt 1 - Tạm ứng' : idx === pcts.length - 1 ? `Đợt ${idx + 1} - Tất toán` : `Đợt ${idx + 1} - Thanh toán`),
      ty_le_pct: pct,
      so_tien_phai_thu: amt,
      han_thanh_toan: addDaysToDateStr(baseStr, defaultDays)
    }
  })
}

const addScheduleInstallment = () => {
  const m = paymentModal.value
  if (!m.row) return
  const totalSau = tongSauVat(m.row)
  const currentPct = m.scheduleItems.reduce((s, it) => s + toNum(it.ty_le_pct), 0)
  const remainPct = Math.max(0, Math.round((100 - currentPct) * 100) / 100)
  const currentAmt = m.scheduleItems.reduce((s, it) => s + toNum(it.so_tien_phai_thu), 0)
  const remainAmt = Math.max(0, totalSau - currentAmt)
  const nextDot = m.scheduleItems.length + 1
  const lastDue = m.scheduleItems[m.scheduleItems.length - 1]?.han_thanh_toan || m.row.created_time || getFormattedNow()

  m.scheduleItems.push({
    dot: nextDot,
    noi_dung: `Đợt ${nextDot} - Thanh toán`,
    ty_le_pct: remainPct,
    so_tien_phai_thu: remainAmt,
    han_thanh_toan: addDaysToDateStr(lastDue, 15)
  })
}

const removeScheduleInstallment = (idx) => {
  const m = paymentModal.value
  if (m.scheduleItems.length <= 1) return
  m.scheduleItems.splice(idx, 1)
  m.scheduleItems.forEach((it, i) => {
    it.dot = i + 1
  })
}

const onInstallmentPctChange = (idx, e) => {
  const m = paymentModal.value
  if (!m.row || !m.scheduleItems[idx]) return
  const pct = Math.max(0, Math.min(100, Number(e.target.value) || 0))
  const totalSau = tongSauVat(m.row)
  m.scheduleItems[idx].ty_le_pct = pct
  m.scheduleItems[idx].so_tien_phai_thu = Math.round(totalSau * (pct / 100))
}

const onInstallmentAmountInput = (idx, e) => {
  const m = paymentModal.value
  if (!m.row || !m.scheduleItems[idx]) return
  const raw = String(e.target.value || '').replace(/[^0-9]/g, '')
  const amt = raw ? Number(raw) : 0
  const totalSau = tongSauVat(m.row)
  m.scheduleItems[idx].so_tien_phai_thu = amt
  m.scheduleItems[idx].ty_le_pct = totalSau > 0 ? Math.round((amt / totalSau) * 10000) / 100 : 0
  e.target.value = amt > 0 ? amt.toLocaleString('vi-VN') : ''
}

const onInstallmentDatePickerChange = (idx, e) => {
  if (!paymentModal.value.scheduleItems[idx]) return
  paymentModal.value.scheduleItems[idx].han_thanh_toan = isoToDdmmyyyy(e.target.value)
}

const balanceLastInstallment = () => {
  const m = paymentModal.value
  if (!m.row || m.scheduleItems.length === 0) return
  const totalSau = tongSauVat(m.row)
  const lastIdx = m.scheduleItems.length - 1
  let sumOtherAmt = 0
  let sumOtherPct = 0
  for (let i = 0; i < lastIdx; i++) {
    sumOtherAmt += toNum(m.scheduleItems[i].so_tien_phai_thu)
    sumOtherPct += toNum(m.scheduleItems[i].ty_le_pct)
  }
  m.scheduleItems[lastIdx].so_tien_phai_thu = Math.max(0, totalSau - sumOtherAmt)
  m.scheduleItems[lastIdx].ty_le_pct = Math.max(0, Math.round((100 - sumOtherPct) * 100) / 100)
}

const buildSchedulePayloadForRow = (r, paidAmountOverride) => {
  const m = paymentModal.value
  const totalSau = tongSauVat(r)
  const paid = paidAmountOverride !== undefined ? paidAmountOverride : daThanhToan(r)
  const mode = m.scheduleMode

  let finalSchedule = []
  if (mode === 'mot_lan') {
    const due = (m.singleDueDate || '').trim()
    finalSchedule = [
      {
        dot: 1,
        noi_dung: 'Thanh toán 100% đơn hàng',
        ty_le_pct: 100,
        so_tien_phai_thu: totalSau,
        han_thanh_toan: due
      }
    ]
  } else {
    finalSchedule = m.scheduleItems.map((it, idx) => ({
      dot: idx + 1,
      noi_dung: String(it.noi_dung || `Đợt ${idx + 1}`).trim(),
      ty_le_pct: toNum(it.ty_le_pct),
      so_tien_phai_thu: toNum(it.so_tien_phai_thu),
      han_thanh_toan: String(it.han_thanh_toan || '').trim()
    }))
  }

  const evalList = evaluateInstallmentSchedule(totalSau, paid, mode, m.singleDueDate, finalSchedule)
  const unpaidList = evalList.filter(x => x.con_thieu > 0)
  const overdueInst = unpaidList.find(x => x.status === 'qua_han')
  const nextActive = overdueInst || unpaidList[0] || evalList[evalList.length - 1]
  const activeDueDate = String(nextActive?.han_thanh_toan || m.singleDueDate || '').trim()

  return {
    loai_thanh_toan: mode,
    han_thanh_toan: activeDueDate,
    ke_hoach_thanh_toan: finalSchedule
  }
}

const refreshCustomerCalculatedDebt = async () => {
  const updates = {}
  customers.value.forEach(kh => {
    const summary = getCustomerDebtSummary(kh)
    kh.tongSauVatKH = summary.tongSauVat
    kh.daThanhToanKH = summary.daThanhToan
    kh.paymentProgressPct = summary.progressPct
    if (summary.poCount > 0) {
      if (Number(kh.cong_no) !== summary.congNo) {
        kh.cong_no = summary.congNo
        if (kh._firebaseKey) {
          updates[`khach_hang/${kh._firebaseKey}/cong_no`] = summary.congNo
        }
      }
    }
  })
  if (formData.value && formData.value.ma_khach_hang) {
    const s = getCustomerDebtSummary(formData.value)
    if (s.poCount > 0) formData.value.cong_no = s.congNo
  }
  if (Object.keys(updates).length > 0) {
    try {
      await update(dbRef(database), updates)
    } catch (e) {
      console.warn('Lỗi đồng bộ cong_no vào khach_hang:', e)
    }
  }
}

const savePaymentScheduleOnly = async () => {
  const m = paymentModal.value
  if (!m.row || m.savingSchedule) return
  m.savingSchedule = true
  try {
    const r = m.row
    const fbKey = r._firebaseKey || r.ID
    const payload = buildSchedulePayloadForRow(r)

    const updates = {}
    if (fbKey) {
      updates[`sale_report/${fbKey}/loai_thanh_toan`] = payload.loai_thanh_toan
      updates[`sale_report/${fbKey}/han_thanh_toan`] = payload.han_thanh_toan
      updates[`sale_report/${fbKey}/ke_hoach_thanh_toan`] = payload.ke_hoach_thanh_toan
    }
    if (r.ma_hop_dong) {
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/loai_thanh_toan`] = payload.loai_thanh_toan
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/han_thanh_toan`] = payload.han_thanh_toan
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/ke_hoach_thanh_toan`] = payload.ke_hoach_thanh_toan
    }

    if (Object.keys(updates).length > 0) {
      await update(dbRef(database), updates)
    }

    r.loai_thanh_toan = payload.loai_thanh_toan
    r.han_thanh_toan = payload.han_thanh_toan
    r.ke_hoach_thanh_toan = payload.ke_hoach_thanh_toan
    m.showScheduleSubModal = false
  } catch (e) {
    console.error('Lỗi lưu kế hoạch thanh toán:', e)
    alert('Lỗi khi lưu mốc hạn thanh toán. Vui lòng thử lại.')
  } finally {
    m.savingSchedule = false
  }
}

const setPaymentQuickPct = (pct) => {
  if (!paymentModal.value.row) return
  const remaining = congNo(paymentModal.value.row)
  const base = remaining > 0 ? remaining : tongSauVat(paymentModal.value.row)
  const val = Math.round(base * (pct / 100))
  paymentModal.value.amount = val
  paymentModal.value.amountStr = val > 0 ? val.toLocaleString('vi-VN') : ''
}

const onPaymentAmountInput = (e) => {
  const raw = String(e.target.value || '').replace(/[^0-9]/g, '')
  const num = raw ? Number(raw) : 0
  paymentModal.value.amount = num
  paymentModal.value.amountStr = num > 0 ? num.toLocaleString('vi-VN') : ''
  e.target.value = paymentModal.value.amountStr
}

const submitPayment = async () => {
  const m = paymentModal.value
  if (!m.row || m.saving) return
  const payAmt = toNum(m.amount)
  if (payAmt <= 0) {
    alert('Vui lòng nhập số tiền thanh toán lớn hơn 0!')
    return
  }

  m.saving = true
  try {
    const r = m.row
    const fbKey = r._firebaseKey || r.ID
    const srId = String(r.ID || fbKey)
    const maKH = String(r.Ma_khach_hang || m.customer?.ma_khach_hang || r.Ma_cong_ty || '')
    const payTime = (m.paymentTime || '').trim() || getFormattedNow()

    const totalSau = tongSauVat(r)
    const currentPaid = daThanhToan(r)
    const newPaid = currentPaid + payAmt
    const newCongNo = Math.max(0, totalSau - newPaid)

    const schedulePayload = buildSchedulePayloadForRow(r, newPaid)

    const newHistRef = push(dbRef(database, 'lich_su_thanh_toan'))
    const histKey = newHistRef.key || ('LSTT_' + Date.now())

    const newHistoryItem = {
      id: histKey,
      id_salereport: srId,
      maKH: maKH,
      so_tien_thanh_toan: payAmt,
      cong_no_con_lai: newCongNo,
      thoi_gian_thanh_toan: payTime,
      ghi_chu: (m.note || '').trim()
    }

    const updates = {
      [`lich_su_thanh_toan/${histKey}`]: newHistoryItem
    }

    if (fbKey) {
      updates[`sale_report/${fbKey}/so_tien_da_thanh_toan`] = newPaid
      updates[`sale_report/${fbKey}/cong_no`] = newCongNo
      updates[`sale_report/${fbKey}/thoi_gian_thanh_toan`] = payTime
      updates[`sale_report/${fbKey}/loai_thanh_toan`] = schedulePayload.loai_thanh_toan
      updates[`sale_report/${fbKey}/han_thanh_toan`] = schedulePayload.han_thanh_toan
      updates[`sale_report/${fbKey}/ke_hoach_thanh_toan`] = schedulePayload.ke_hoach_thanh_toan
      if (!r.Tong_tien_sau_thueVAT) {
        updates[`sale_report/${fbKey}/Tong_tien_sau_thueVAT`] = totalSau
      }
    }

    if (r.ma_hop_dong) {
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/da_thanh_toan`] = newPaid
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/con_phai_thu`] = newCongNo
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/trang_thai_thanh_toan`] = newCongNo <= 0 ? 'Đã thanh toán đủ' : 'Thanh toán 1 phần'
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/loai_thanh_toan`] = schedulePayload.loai_thanh_toan
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/han_thanh_toan`] = schedulePayload.han_thanh_toan
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/ke_hoach_thanh_toan`] = schedulePayload.ke_hoach_thanh_toan
    }

    await update(dbRef(database), updates)

    r.so_tien_da_thanh_toan = newPaid
    r.cong_no = newCongNo
    r.thoi_gian_thanh_toan = payTime
    r.loai_thanh_toan = schedulePayload.loai_thanh_toan
    r.han_thanh_toan = schedulePayload.han_thanh_toan
    r.ke_hoach_thanh_toan = schedulePayload.ke_hoach_thanh_toan
    if (!r.Tong_tien_sau_thueVAT) r.Tong_tien_sau_thueVAT = totalSau

    lichSuThanhToanList.value.unshift({
      ...newHistoryItem,
      _firebaseKey: histKey
    })

    await refreshCustomerCalculatedDebt()

    const nextEval = evaluateInstallmentSchedule(totalSau, newPaid, m.scheduleMode, m.singleDueDate, m.scheduleItems)
    const nextUnpaid = nextEval.find(x => x.con_thieu > 0)
    const nextPayAmt = m.scheduleMode === 'nhieu_dot' && nextUnpaid ? nextUnpaid.con_thieu : (newCongNo > 0 ? newCongNo : 0)

    m.amount = nextPayAmt
    m.amountStr = nextPayAmt > 0 ? nextPayAmt.toLocaleString('vi-VN') : ''
    m.paymentTime = getFormattedNow()
    m.note = m.scheduleMode === 'nhieu_dot' && nextUnpaid ? `Thanh toán Đợt ${nextUnpaid.dot} (${nextUnpaid.noi_dung})` : ''
    m.showRecordSubModal = false
  } catch (e) {
    console.error('Lỗi ghi nhận thanh toán:', e)
    alert('Lỗi khi lưu thanh toán. Vui lòng thử lại.')
  } finally {
    m.saving = false
  }
}

const deletePaymentHistoryItem = async (h) => {
  if (!h || !paymentModal.value.row) return
  if (!confirm(`Bạn có chắc muốn xóa đợt thanh toán ${formatCurrency(toNum(h.so_tien_thanh_toan))} đ (${h.thoi_gian_thanh_toan || ''}) và tính lại công nợ?`)) return

  try {
    const r = paymentModal.value.row
    const fbKey = r._firebaseKey || r.ID
    const histFbKey = h._firebaseKey || h.id
    if (histFbKey) {
      await remove(dbRef(database, `lich_su_thanh_toan/${histFbKey}`))
    }

    lichSuThanhToanList.value = lichSuThanhToanList.value.filter(item => (item._firebaseKey || item.id) !== histFbKey)

    const remainingHistory = getPaymentHistoryForPO(r)
    const newPaid = remainingHistory.reduce((s, item) => s + toNum(item.so_tien_thanh_toan), 0)
    const totalSau = tongSauVat(r)
    const newCongNo = Math.max(0, totalSau - newPaid)
    const latestTime = remainingHistory.length > 0 ? (remainingHistory[0].thoi_gian_thanh_toan || '') : ''
    const schedulePayload = buildSchedulePayloadForRow(r, newPaid)

    const updates = {}
    if (fbKey) {
      updates[`sale_report/${fbKey}/so_tien_da_thanh_toan`] = newPaid
      updates[`sale_report/${fbKey}/cong_no`] = newCongNo
      updates[`sale_report/${fbKey}/thoi_gian_thanh_toan`] = latestTime
      updates[`sale_report/${fbKey}/han_thanh_toan`] = schedulePayload.han_thanh_toan
    }
    if (r.ma_hop_dong) {
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/da_thanh_toan`] = newPaid
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/con_phai_thu`] = newCongNo
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/trang_thai_thanh_toan`] = newCongNo <= 0 ? 'Đã thanh toán đủ' : (newPaid > 0 ? 'Thanh toán 1 phần' : 'Chưa thanh toán đủ')
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/han_thanh_toan`] = schedulePayload.han_thanh_toan
    }
    if (Object.keys(updates).length > 0) {
      await update(dbRef(database), updates)
    }

    r.so_tien_da_thanh_toan = newPaid
    r.cong_no = newCongNo
    r.thoi_gian_thanh_toan = latestTime
    r.han_thanh_toan = schedulePayload.han_thanh_toan

    await refreshCustomerCalculatedDebt()

    paymentModal.value.amount = newCongNo > 0 ? newCongNo : 0
    paymentModal.value.amountStr = newCongNo > 0 ? newCongNo.toLocaleString('vi-VN') : ''
  } catch (e) {
    console.error('Lỗi xóa lịch sử thanh toán:', e)
    alert('Lỗi khi xóa đợt thanh toán.')
  }
}

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
    const [snapKH, snapHD, snapCT, snapSR, snapLSTT] = await Promise.all([
      get(dbRef(database, 'khach_hang')),
      get(dbRef(database, 'hop_dong_tong_quat')),
      get(dbRef(database, 'hop_dong_chi_tiet')),
      get(dbRef(database, 'sale_report')),
      get(dbRef(database, 'lich_su_thanh_toan'))
    ])

    const khVal = snapKH.exists() ? snapKH.val() : {}
    const hdVal = snapHD.exists() ? snapHD.val() : {}
    const ctVal = snapCT.exists() ? snapCT.val() : {}
    const srVal = snapSR.exists() ? snapSR.val() : {}
    const lsttVal = snapLSTT.exists() ? snapLSTT.val() : {}

    // Parse sale_report rows
    const mappedSR = []
    Object.entries(srVal || {}).forEach(([fbKey, item]) => {
      if (!item || typeof item !== 'object') return
      const tSau = Number(item.Tong_tien_sau_thueVAT) > 0
        ? Number(item.Tong_tien_sau_thueVAT)
        : (Number(item.Tong_tien_truoc_thueVAT) || 0) + (Number(item.Tong_thueVAT) || 0)
      const daTT = Number(item.so_tien_da_thanh_toan) || 0
      const cn = (item.cong_no !== undefined && item.cong_no !== null && item.cong_no !== '')
        ? Math.max(0, Number(item.cong_no) || 0)
        : Math.max(0, tSau - daTT)
      const loaiTT =
        item.loai_thanh_toan === 'nhieu_dot' || (Array.isArray(item.ke_hoach_thanh_toan) && item.ke_hoach_thanh_toan.length > 1)
          ? 'nhieu_dot'
          : 'mot_lan'
      mappedSR.push({
        ...item,
        so_tien_da_thanh_toan: daTT,
        cong_no: cn,
        loai_thanh_toan: loaiTT,
        han_thanh_toan: item.han_thanh_toan !== undefined ? String(item.han_thanh_toan || '') : '',
        ke_hoach_thanh_toan: Array.isArray(item.ke_hoach_thanh_toan) ? item.ke_hoach_thanh_toan : [],
        _firebaseKey: fbKey,
        ID: item.ID || fbKey
      })
    })
    saleReportRows.value = mappedSR

    // Parse lich_su_thanh_toan
    const mappedLSTT = []
    Object.entries(lsttVal || {}).forEach(([key, val]) => {
      if (val && typeof val === 'object') {
        mappedLSTT.push({
          ...val,
          id: val.id || key,
          _firebaseKey: key
        })
      }
    })
    mappedLSTT.sort((a, b) => {
      const da = parseDateStr(a.thoi_gian_thanh_toan)?.getTime() || 0
      const db = parseDateStr(b.thoi_gian_thanh_toan)?.getTime() || 0
      if (db !== da) return db - da
      return String(b.id || '').localeCompare(String(a.id || ''))
    })
    lichSuThanhToanList.value = mappedLSTT

    const ctMap = {}
    Object.values(ctVal || {}).forEach(ct => {
      if (!ct) return
      const maHD = String(Array.isArray(ct) ? (ct[0] || '') : (ct.ma_hop_dong ?? ct[0] ?? '')).trim()
      if (!maHD) return
      if (!ctMap[maHD]) ctMap[maHD] = []
      ctMap[maHD].push(ct)
    })

    const contractStatsMap = {}

    Object.entries(hdVal || {}).forEach(([hdKey, hdRow]) => {
      if (!hdRow) return
      const isArr = Array.isArray(hdRow)
      const maKH = String(isArr ? (hdRow[2] || '') : (hdRow.ma_khach_hang ?? hdRow.Ma_khach_hang ?? hdRow[2] ?? '')).trim()
      if (!maKH) return

      if (!contractStatsMap[maKH]) {
        contractStatsMap[maKH] = { latestDate: null, groups: {} }
      }

      const maHopDong = String(isArr ? (hdRow[0] || '') : (hdRow.ma_hop_dong ?? hdRow[0] ?? hdKey ?? '')).trim()
      const maHopDongGoc = String(isArr ? (hdRow[32] || '') : (hdRow.ma_hop_dong_goc ?? hdRow[32] ?? '')).trim()
      const groupId = maHopDongGoc || maHopDong
      if (!groupId) return

      const isCompletedVal = String(isArr ? (hdRow[33] || '') : (hdRow.isCompleted ?? hdRow.is_completed ?? hdRow[33] ?? '')).trim().toLowerCase()
      const isCompleted = (isCompletedVal === '1' || isCompletedVal === 'true' || isCompletedVal === 'yes' || isCompletedVal === 'x')

      const ngayTao = String(isArr ? (hdRow[4] || '') : (hdRow.ngay_tao_hop_dong ?? hdRow.ngay_tao ?? hdRow.ngay_ky ?? hdRow.created_time ?? hdRow[4] ?? '')).trim()
      let dateObj = null
      if (ngayTao) {
        const dateParts = ngayTao.split(' ')
        const dateStr = dateParts.length > 1 ? dateParts[1] : dateParts[0]
        if (dateStr.includes('/')) {
          const [DD, MM, YYYY] = dateStr.split('/')
          if (DD && MM && YYYY) {
            const parsed = new Date(Number(YYYY), Number(MM) - 1, Number(DD))
            if (!isNaN(parsed.getTime())) {
              dateObj = parsed
            }
          }
        } else {
          const parsed = new Date(ngayTao)
          if (!isNaN(parsed.getTime())) {
            dateObj = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
          }
        }
        if (dateObj && (!contractStatsMap[maKH].latestDate || dateObj > contractStatsMap[maKH].latestDate)) {
          contractStatsMap[maKH].latestDate = dateObj
        }
      }

      const trangThaiHD = String(isArr ? (hdRow[15] || '') : (hdRow.Trang_thai_hop_dong ?? hdRow['Trang_thai_hop_dong '] ?? hdRow.loai_hop_dong ?? hdRow.trang_thai_hop_dong ?? hdRow[15] ?? '')).trim()
      const isChinhThuc = trangThaiHD === 'Chính thức'

      let localRenewalCount = 0
      if ((isChinhThuc || isCompleted) && ctMap[maHopDong]) {
        ctMap[maHopDong].forEach(ct => {
          const ctIsArr = Array.isArray(ct)
          let startDateStr = String(ctIsArr ? (ct[28] || '') : (ct.start_date ?? ct[28] ?? '')).trim()
          let endDateStr = String(ctIsArr ? (ct[29] || '') : (ct.end_date ?? ct[29] ?? '')).trim()
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
        const currentGroup = contractStatsMap[maKH].groups[groupId]
        currentGroup.renewalCount = (currentGroup.renewalCount || 0) + localRenewalCount
        if (dateObj && currentGroup.date) {
          if (dateObj > currentGroup.date) {
            currentGroup.isCompleted = isCompleted
            currentGroup.date = dateObj
          }
        } else if (dateObj) {
          currentGroup.isCompleted = isCompleted
          currentGroup.date = dateObj
        }
      }
    })

    Object.values(contractStatsMap).forEach(stats => {
      let chotCount = 0
      let processingCount = 0
      let renewalCount = 0
      Object.values(stats.groups).forEach(g => {
        if (g.isCompleted) chotCount++
        else processingCount++
        if (g.renewalCount) renewalCount += g.renewalCount
      })
      stats.chotCount = chotCount
      stats.processingCount = processingCount
      stats.renewalCount = renewalCount
    })

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const rawCustomers = Object.entries(khVal || {})
      .map(([fbKey, val]) => normalizeCustomerRecord(val, fbKey))
      .filter(Boolean)

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
          const dateStr = `${pad(lastDate.getDate())}/${pad(lastDate.getMonth() + 1)}/${lastDate.getFullYear()}`

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

      const debtSummary = getCustomerDebtSummary(kh)
      const computedCongNo = debtSummary.poCount > 0 ? debtSummary.congNo : (Number(kh.cong_no) || 0)

      return {
        ...kh,
        cong_no: computedCongNo,
        tongSauVatKH: debtSummary.tongSauVat,
        daThanhToanKH: debtSummary.daThanhToan,
        paymentProgressPct: debtSummary.progressPct,
        trang_thai: computedTrangThai,
        lastPurchaseText,
        hopDongChotCount,
        hopDongProcessingCount,
        renewalCount
      }
    })

    // Đồng bộ cong_no về khach_hang (non-blocking)
    refreshCustomerCalculatedDebt()
  } catch (error) {
    console.error('Lỗi fetch data từ Firebase:', error)
    alert('Lỗi khi tải dữ liệu từ Firebase: ' + error.message)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEditing.value = false
  formData.value = initFormData()
  tempTagKH.value = ''
  isModalOpen.value = true
}

const openEditModal = (kh) => {
  isEditing.value = true
  formData.value = {
    ...initFormData(),
    ...kh,
    tagKH: Array.isArray(kh.tagKH) ? [...kh.tagKH] : []
  }
  tempTagKH.value = ''
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

const saveSingleCustomerToFirebase = async (data, isUpd) => {
  let id = String(data.ma_khach_hang || '').trim()
  if (!id) {
    id = genMaKH(data.ten_khach_hang, data.ten_cong_ty) || kh_genID()
  }
  const maCT = data.ma_cong_ty || genMaCT(data.ten_cong_ty)

  const recordToSave = {}
  KH_FIELDS.forEach(field => {
    const val = data[field]
    recordToSave[field] = val !== undefined && val !== null ? val : ''
  })
  recordToSave.ma_khach_hang = id
  recordToSave.ma_cong_ty = maCT
  recordToSave.cong_no = Number(data.cong_no) || 0
  recordToSave.tagKH = Array.isArray(data.tagKH) ? [...data.tagKH] : []
  recordToSave.last_updated = new Date().toISOString()

  const existing = customers.value.find(
    c => (data._firebaseKey && c._firebaseKey === data._firebaseKey) || String(c.ma_khach_hang) === id
  )
  const fbKey = existing?._firebaseKey || data._firebaseKey || sanitizeFirebaseKey(id)

  if (isUpd || existing) {
    await update(dbRef(database, `khach_hang/${fbKey}`), recordToSave)
  } else {
    await set(dbRef(database, `khach_hang/${fbKey}`), recordToSave)
  }
  return id
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
        await saveSingleCustomerToFirebase(item.data, isUpd)
        successCount++
      }

      isModalOpen.value = false
      isMultiImport.value = false
      showAsyncSuccess(`Đã lưu thành công`, `${successCount}/${importedList.value.length} khách hàng được xử lý.`)
      await fetchCustomers()
    } catch (error) {
      console.error('Lỗi khi lưu nhiều KH vào Firebase:', error)
      showAsyncError('Lưu thất bại', 'Lỗi Firebase: ' + error.message)
    } finally {
      saving.value = false
    }
  } else {
    // Lưu đơn
    const isUpd = isEditing.value
    showAsyncLoading(`Đang ${isUpd ? 'cập nhật' : 'thêm'} khách hàng...`)
    try {
      const savedId = await saveSingleCustomerToFirebase(formData.value, isUpd)
      formData.value.ma_khach_hang = savedId
      isModalOpen.value = false
      showAsyncSuccess(`${isUpd ? 'Cập nhật' : 'Thêm'} KH thành công`, `Mã KH: ${savedId}`)
      await fetchCustomers()
    } catch (error) {
      console.error('Lỗi khi lưu vào Firebase:', error)
      showAsyncError('Lưu KH thất bại', 'Lỗi Firebase: ' + error.message)
    } finally {
      saving.value = false
    }
  }
}

const confirmDelete = async (ma_khach_hang) => {
  if (!confirm('Xác nhận xoá khách hàng này?')) return

  showAsyncLoading('Đang xoá khách hàng...')
  try {
    const existing = customers.value.find(
      c => String(c.ma_khach_hang) === String(ma_khach_hang) || (formData.value._firebaseKey && c._firebaseKey === formData.value._firebaseKey)
    )
    const fbKey = existing?._firebaseKey || formData.value._firebaseKey || sanitizeFirebaseKey(ma_khach_hang)
    if (!fbKey) {
      showAsyncError('Lỗi xoá', 'Không tìm thấy khóa khách hàng cần xoá')
      return
    }

    await remove(dbRef(database, `khach_hang/${fbKey}`))
    isModalOpen.value = false
    showAsyncSuccess('Xoá thành công', `Đã xoá mã KH: ${ma_khach_hang}`)
    await fetchCustomers()
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
