<template>
  <div class="quan-ly-bao-gia">
    <!-- Navigate Loading Overlay -->
    <Teleport to="body">
      <Transition name="nav-fade">
        <div v-if="navigating" class="nav-overlay">
          <div class="nav-loading-card">
            <div class="nav-spinner-ring">
              <div class="nav-ring"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </div>
            <div class="nav-text">
              <div class="nav-title">{{ navMode === 'duplicate' ? 'Đang nhân bản hàng hóa' : 'Đang nạp dữ liệu báo giá' }}</div>
              <div class="nav-sub">{{ navigatingContract?.so_hop_dong || navigatingContract?.ma_hop_dong }}</div>
            </div>
            <div class="nav-progress">
              <div class="nav-progress-bar"></div>
            </div>
            <div class="nav-steps">
              <div class="nav-step" :class="{ active: navStep >= 1 }"><span class="step-dot"></span>{{ navMode === 'duplicate' ? 'Đang đọc dữ liệu gốc' : 'Tải hợp đồng tổng quát' }}</div>
              <div class="nav-step" :class="{ active: navStep >= 2 }"><span class="step-dot"></span>{{ navMode === 'duplicate' ? 'Bóc tách hàng hóa' : 'Tải hàng hóa & khách hàng' }}</div>
              <div class="nav-step" :class="{ active: navStep >= 3 }"><span class="step-dot"></span>{{ navMode === 'duplicate' ? 'Khởi tạo báo giá mới' : 'Nạp chi tiết báo giá' }}</div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <!-- Page Header (Adapted from report template) -->
    <header class="header" style="position: relative; justify-content: center; display: flex; align-items: center; margin-bottom: 2.5rem;">
      <div class="title-section" style="text-align: center;">
        <h1 style="color: #1cb5e0; text-transform: uppercase; font-size: 2.25rem; font-weight: 700; margin: 0 0 0.25rem 0; letter-spacing: -0.025em;">Quản Lý Báo Giá</h1>
        <p class="subtitle" style="color: #94a3b8; margin: 0; font-size: 0.95rem;">
          {{ groupedContracts.length }} nhóm · {{ filteredContracts.length }} báo giá
        </p>
      </div>
      <div class="header-actions" style="position: absolute; right: 0; display: flex; gap: 0.75rem;">
        <button class="btn-secondary" @click="fetchData" :disabled="loading" style="background-color: rgba(255,255,255,0.05); color: #f8fafc; padding: 0.75rem 1.5rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; font-weight: 600; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.25s; cursor: pointer; font-family: inherit; font-size: 0.95rem;">
          <svg :class="{ 'spin': loading }" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          <span>Làm mới</span>
        </button>
      </div>
    </header>

    <!-- Filters -->

    <!-- Dashboard Statistics / Quick Filters -->
    <div class="dashboard-cards">
      <div 
        class="dash-card processing" 
        :class="{ active: dashboardFilter === 'PROCESSING' }"
        @click="dashboardFilter = dashboardFilter === 'PROCESSING' ? 'ALL' : 'PROCESSING'"
      >
        <svg class="bg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <div class="dc-content">
          <div class="dc-label">Đang xử lý</div>
          <div class="dc-value">{{ processingGroups }}</div>
        </div>
      </div>
      
      <div 
        class="dash-card completed" 
        :class="{ active: dashboardFilter === 'COMPLETED' }"
        @click="dashboardFilter = dashboardFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED'"
      >
        <svg class="bg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <div class="dc-content">
          <div class="dc-label">Đã xử lý xong</div>
          <div class="dc-value">{{ completedGroups }}</div>
        </div>
      </div>
      
      <div 
        class="dash-card total" 
        :class="{ active: dashboardFilter === 'ALL' }"
        @click="dashboardFilter = 'ALL'"
      >
        <svg class="bg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <div class="dc-content">
          <div class="dc-label">Tổng cộng</div>
          <div class="dc-value">{{ totalGroups }}</div>
        </div>
      </div>
    </div>
    <div style="margin-bottom: 24px;">
      <div class="filter-search" style="max-width: 400px; margin: 0 auto;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="left: 18px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" v-model="searchKeyword" placeholder="Tìm số hợp đồng, khách hàng, mã..." style="border-radius: 9999px; padding: 16px 48px 16px 52px; border: 1px solid #10b981;" />
        <button v-if="searchKeyword" class="clear-search" @click="searchKeyword = ''" style="right: 16px;">✕</button>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
      <button class="btn-primary" @click="router.push('/baogia')" style="background: #2563eb; color: white; padding: 0.85rem 1.75rem; box-shadow: 0 4px 15px -2px rgba(37, 99, 235, 0.4); border: none; border-radius: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.25s; cursor: pointer; font-family: inherit; font-size: 1rem; margin-bottom: 2px;" onmouseover="this.style.background='#1d4ed8'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(37, 99, 235, 0.6)'" onmouseout="this.style.background='#2563eb'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px -2px rgba(37, 99, 235, 0.4)'">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Tạo báo giá mới</span>
      </button>

      <div class="filter-chips" style="margin-bottom: 0;">
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="color: #ffffff; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 2px;">Khách hàng</label>
          <button class="filter-select" @click="showCustomerModal = true" style="text-align: left; display: flex; justify-content: space-between; align-items: center; min-width: 180px;">
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 8px;">{{ customerFilter === 'ALL' ? 'Tất cả khách hàng' : uniqueCustomers.find(c => c.id === customerFilter)?.name || 'Tất cả khách hàng' }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="color: #ffffff; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 2px;">Tính chất</label>
          <select v-model="statusFilter" class="filter-select">
            <option value="ALL">Tất cả</option>
            <option value="Tạm">Tạm</option>
            <option value="Chính thức">Chính thức</option>
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="color: #ffffff; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 2px;">Tiến độ</label>
          <select v-model="processingFilter" class="filter-select">
            <option value="ALL">Tất cả</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="COMPLETED">Đã xử lý xong</option>
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="color: #ffffff; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 2px;">Sắp xếp</label>
          <select v-model="dateSortOrder" class="filter-select">
            <option value="DESC">Mới nhất ➔ Cũ nhất</option>
            <option value="ASC">Cũ nhất ➔ Mới nhất</option>
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="color: #ffffff; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 2px;">Thời gian</label>
          <div class="filter-date-group">
            <input type="date" v-model="fromDate" class="filter-date" />
            <span class="date-separator">→</span>
            <input type="date" v-model="toDate" class="filter-date" />
          </div>
        </div>
        <button v-if="hasActiveFilters" class="btn-clear-filters" @click="clearFilters">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          Xoá bộ lọc
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && !contracts.length" class="loading-wrap">
      <div class="skeleton-bar"></div>
      <div class="skeleton-grid"><div v-for="n in 3" :key="n" class="skeleton-card"><div class="sk-h"></div><div class="sk-b"><div class="sk-l w60"></div><div class="sk-l w80"></div><div class="sk-l w40"></div></div></div></div>
      <div class="skeleton-bar"></div>
      <div class="skeleton-grid"><div v-for="n in 4" :key="n+10" class="skeleton-card"><div class="sk-h"></div><div class="sk-b"><div class="sk-l w60"></div><div class="sk-l w80"></div><div class="sk-l w40"></div></div></div></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!hasAnyData" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
      <h3>Không tìm thấy báo giá nào</h3>
      <p>Hãy thử thay đổi bộ lọc hoặc tạo báo giá mới.</p>
      <button class="btn btn-create" @click="router.push('/baogia')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Tạo báo giá mới
      </button>
    </div>

    <!-- GROUPED SECTIONS -->
    <div v-else class="groups-container">
      <!-- Grouped -->
      <section
        v-for="(group, gi) in displayedGroupedContracts"
        :key="group.goc"
        class="group-section"
        :style="{ animationDelay: gi * 80 + 'ms' }"
      >
        <!-- GROUP HEADER BAR (VIP PRO DESIGN - CUSTOM LAYOUT) -->
        <div class="group-bar premium-row custom-grid" @click="toggleGroup(group.goc)" @mousemove="handleMouseMove">
          
          <!-- Card Status Header Banner -->
          <div :style="{
            margin: '-16px -22px 16px -22px',
            padding: '8px 16px',
            textAlign: 'center',
            fontFamily: '\'Times New Roman\', Times, serif',
            fontSize: '16px',
            fontWeight: '900',
            letterSpacing: '1.5px',
            borderRadius: '15px 15px 0 0',
            background: group.latest.is_completed ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #fde047, #eab308)',
            color: group.latest.is_completed ? '#ffffff' : '#1e40af',
            borderBottom: 'none'
          }">
            {{ group.latest.is_completed ? 'ĐÃ XONG' : 'ĐANG XỬ LÝ' }}
          </div>

          <div class="cg-top">
            <div class="cg-1">
              <span class="modern-badge outline-badge" style="padding: 6px 14px; font-size: 12px; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.1); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);">
                <span class="badge-dot status-live"></span>
                <span style="letter-spacing: 0.5px; font-weight: 700; color: #e2e8f0;">{{ group.latest.created_time || group.latest.ngay_tao }}</span>
              </span>
            </div>
            <div class="cg-2" style="display: flex; align-items: center; gap: 12px;">
              <div class="version-badge" title="Số phiên bản">
                {{ group.versions.length }} báo giá
              </div>
              <div class="vip-magoc">
                <span class="meta-label" style="color: #6ee7b7; font-size: 12px;">Mã Gốc:</span>
                <span class="meta-value text-white" style="font-weight: 800; font-size: 14px; letter-spacing: 0.5px;">{{ group.goc }}</span>
              </div>
            </div>
          </div>

          <div class="cg-middle" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <div class="cg-3" style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
              <h3 class="row-title large-title">{{ group.latest.content_of_contract_po || 'Báo giá không có tiêu đề' }}</h3>
            </div>
            <div class="cg-4" v-if="group.latest.ghi_chu">
              <span class="full-width-note" :title="group.latest.ghi_chu">
                {{ group.latest.ghi_chu }}
              </span>
            </div>
          </div>

          <div class="cg-bottom" style="flex-direction: column; gap: 14px;">
            <div class="customer-info-row" style="display: flex; gap: 12px; width: 100%;">
              <div class="vip-info-box" v-if="getCustomerInfo(group.latest.ma_khach_hang).mst" style="flex: 0 1 auto; min-width: 120px;">
                <div class="vip-info-label">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  Mã số thuế
                </div>
                <div class="vip-info-value">{{ getCustomerInfo(group.latest.ma_khach_hang).mst }}</div>
              </div>
              
              <div class="vip-info-box" style="flex: 1; min-width: 0;">
                <div class="vip-info-label">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  Khách hàng
                </div>
                <div class="vip-info-value">{{ group.latest.ten_khach_hang || 'Không rõ KH' }}</div>
              </div>
              
              <div class="vip-info-box" v-if="getCustomerInfo(group.latest.ma_khach_hang).tenCongTy" style="flex: 2; min-width: 0;">
                <div class="vip-info-label">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  Công ty
                </div>
                <div class="vip-info-value" style="color: #cbd5e1;">{{ getCustomerInfo(group.latest.ma_khach_hang).tenCongTy }}</div>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%;">
              <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
                <div class="cg-8 row-amount-wrap" v-if="group.versions.length > 1" style="display: flex; flex-direction: row !important; align-items: center; gap: 8px;">
                  <span class="amount-label" style="font-size: 11px; color: #cbd5e1; font-weight: 700; margin-bottom: 0;">Tổng trước thuế đơn trước:</span>
                  <div class="amount-old" style="line-height: 1; display: flex; align-items: center; gap: 4px;">
                    {{ formatVND(group.versions[1].tong_truoc_thue) }} <span style="font-size: 13px;">₫</span>
                  </div>
                </div>
                <div class="cg-7 row-amount-wrap" style="display: flex; flex-direction: row !important; align-items: center; gap: 8px;">
                  <span class="amount-label" style="color: #ffffff; font-weight: 800; margin-bottom: 0;">Tổng trước thuế mới nhất:</span>
                  <div class="amount-value amount-vip" style="line-height: 1; align-items: center; gap: 4px;">
                    {{ formatVND(group.latest.tong_truoc_thue) }}<span class="amount-currency">₫</span>
                  </div>
                </div>
              </div>

              <button class="cg-expand-btn row-expand" :class="{ 'expanded': !collapsedGroups[group.goc] }">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- CARDS GRID inside group -->
        <div class="group-cards" :class="{ 'collapsed': collapsedGroups[group.goc] }">
          <div class="group-cards-grid">
            <div
              v-for="(item, idx) in group.versions"
              :key="item.ma_hop_dong"
              class="invoice-card"
              :class="{ 'completed-card': item.is_completed, 'chot-deal-stamp': item.is_completed && item.trang_thai === 'Chính thức' }"
              :style="{ animationDelay: idx * 40 + 'ms' }"
              @click="viewDetails(item)"
            >
              <div class="invoice-card-header">
                <span class="invoice-ma-hd"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> {{ item.ma_hop_dong }}</span>
                <span class="invoice-date">{{ item.ngay_tao }}</span>
              </div>
              <div class="invoice-card-body">
                <p v-if="item.so_po" class="invoice-po invoice-icon-text"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>Số PO: {{ item.so_po }}</p>
                <p v-if="item.content_of_contract_po" class="invoice-text invoice-icon-text" style="color: #f8fafc; font-weight: 600; margin-bottom: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>Content of contract / PO: {{ item.content_of_contract_po }}</p>
                <p v-if="item.ghi_chu" class="invoice-text invoice-icon-text" style="color: #94a3b8; font-style: italic; margin-bottom: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>Ghi chú: {{ item.ghi_chu }}</p>
                <hr class="invoice-divider" />
                <p class="invoice-status invoice-icon-text" style="align-items: center;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>Trạng thái hợp đồng: <span class="status-badge" :class="{'badge-temp': item.trang_thai === 'Tạm', 'badge-official': item.trang_thai === 'Chính thức'}">{{ item.trang_thai }}</span></p>
                <p class="invoice-status invoice-icon-text" style="align-items: center;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 0;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>Trạng thái xử lý: <span class="status-badge" :class="item.is_completed ? 'badge-completed' : 'badge-processing'">{{ item.is_completed ? 'Đã hoàn thành' : 'Đang xử lý' }}</span></p>
                <hr class="invoice-divider" />
                <p v-if="getCustomerInfo(item.ma_khach_hang).mst" class="invoice-text invoice-icon-text"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>MST: {{ getCustomerInfo(item.ma_khach_hang).mst }}</p>
                <p v-if="getCustomerInfo(item.ma_khach_hang).tenCongTy" class="invoice-text invoice-icon-text"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>Tên công ty: {{ getCustomerInfo(item.ma_khach_hang).tenCongTy }}</p>
                <p class="invoice-customer invoice-icon-text"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>Tên khách hàng: {{ item.ten_khach_hang }}</p>
                <div class="invoice-totals">
                  <p style="color: #ef4444;">Tổng giá thực tế: <span>{{ formatVND(item.tong_gia_thuc_te) }}</span></p>
                  <p>Tổng tiền trước thuế: <span>{{ formatVND(item.tong_truoc_thue) }}</span></p>
                  <p class="highlight" style="border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 4px;">Tổng tiền sau thuế: <span>{{ formatVND(item.tong_sau_thue) }}</span></p>
                  <p>Chênh lệch giá: <span :style="{ color: item.chenh_lech_gia > 0 ? '#10b981' : '#ef4444' }">{{ item.chenh_lech_gia > 0 ? '+' : '' }}{{ formatVND(item.chenh_lech_gia) }}</span></p>
                  <p>Còn lại: <span>{{ formatVND(item.con_lai) }}</span></p>
                  <p style="color: #eab308; margin-top: 4px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.2);">Tổng chiết khấu: <span>{{ formatVND(item.tong_chiet_khau) }}</span></p>
                </div>
              </div>
              <div class="card-actions">
                <button class="card-btn btn-view" @click.stop="viewDetails(item)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>Chi tiết</button>
                <button class="card-btn btn-edit" :disabled="item.is_completed" @click.stop="editContract(item)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>Sửa</button>
                <button class="card-btn btn-duplicate" @click.stop="duplicateContract(item)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>Nhân bản</button>
              </div>
              <div class="card-actions card-actions-chot" v-if="!item.is_completed">
                <button class="card-btn btn-chot-deal" :disabled="chotDealLoading" @click.stop="chotDealAndSaleReport(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  {{ chotDealLoading ? 'Đang xử lý...' : 'CHỐT DEAL & CẬP NHẬT SALE REPORT' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- STANDALONE CARDS (no ma_hop_dong_goc) -->
      <section v-if="displayedStandaloneContracts.length" class="standalone-section">
        <div class="standalone-label" v-if="displayedGroupedContracts.length">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          Báo giá đơn lẻ ({{ displayedStandaloneContracts.length }})
        </div>
        <div class="group-cards-grid">
          <div
            v-for="(item, idx) in displayedStandaloneContracts"
            :key="item.ma_hop_dong"
            class="invoice-card"
            :class="{ 'completed-card': item.is_completed, 'chot-deal-stamp': item.is_completed && item.trang_thai === 'Chính thức' }"
            :style="{ animationDelay: idx * 40 + 'ms' }"
            @click="viewDetails(item)"
          >
            <div class="invoice-card-header">
              <span class="invoice-ma-hd"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> {{ item.ma_hop_dong }}</span>
              <span class="invoice-date">{{ item.ngay_tao }}</span>
            </div>
            <div class="invoice-card-body">
              <p v-if="item.so_po" class="invoice-po invoice-icon-text"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>Số PO: {{ item.so_po }}</p>
              <p v-if="item.content_of_contract_po" class="invoice-text invoice-icon-text" style="color: #f8fafc; font-weight: 600; margin-bottom: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>Content of contract / PO: {{ item.content_of_contract_po }}</p>
              <p v-if="item.ghi_chu" class="invoice-text invoice-icon-text" style="color: #94a3b8; font-style: italic; margin-bottom: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>Ghi chú: {{ item.ghi_chu }}</p>
              <hr class="invoice-divider" />
              <p class="invoice-status invoice-icon-text" style="align-items: center;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>Trạng thái hợp đồng: <span class="status-badge" :class="{'badge-temp': item.trang_thai === 'Tạm', 'badge-official': item.trang_thai === 'Chính thức'}">{{ item.trang_thai }}</span></p>
              <p class="invoice-status invoice-icon-text" style="align-items: center;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 0;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>Trạng thái xử lý: <span class="status-badge" :class="item.is_completed ? 'badge-completed' : 'badge-processing'">{{ item.is_completed ? 'Đã hoàn thành' : 'Đang xử lý' }}</span></p>
              <hr class="invoice-divider" />
              <p v-if="getCustomerInfo(item.ma_khach_hang).mst" class="invoice-text invoice-icon-text"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>MST: {{ getCustomerInfo(item.ma_khach_hang).mst }}</p>
              <p v-if="getCustomerInfo(item.ma_khach_hang).tenCongTy" class="invoice-text invoice-icon-text"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>Tên công ty: {{ getCustomerInfo(item.ma_khach_hang).tenCongTy }}</p>
              <p class="invoice-customer invoice-icon-text"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>Tên khách hàng: {{ item.ten_khach_hang }}</p>
              <div class="invoice-totals">
                <p style="color: #ef4444;">Tổng giá thực tế: <span>{{ formatVND(item.tong_gia_thuc_te) }}</span></p>
                <p>Tổng tiền trước thuế: <span>{{ formatVND(item.tong_truoc_thue) }}</span></p>
                <p class="highlight" style="border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 4px;">Tổng tiền sau thuế: <span>{{ formatVND(item.tong_sau_thue) }}</span></p>
                <p>Chênh lệch giá: <span :style="{ color: item.chenh_lech_gia > 0 ? '#10b981' : '#ef4444' }">{{ item.chenh_lech_gia > 0 ? '+' : '' }}{{ formatVND(item.chenh_lech_gia) }}</span></p>
                <p>Còn lại: <span>{{ formatVND(item.con_lai) }}</span></p>
                <p style="color: #eab308; margin-top: 4px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.2);">Tổng chiết khấu: <span>{{ formatVND(item.tong_chiet_khau) }}</span></p>
              </div>
            </div>
            <div class="card-actions">
              <button class="card-btn btn-view" @click.stop="viewDetails(item)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>Chi tiết</button>
              <button class="card-btn btn-edit" :disabled="item.is_completed" @click.stop="editContract(item)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>Sửa</button>
              <button class="card-btn btn-duplicate" @click.stop="duplicateContract(item)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>Nhân bản</button>
            </div>
            <div class="card-actions card-actions-chot" v-if="!item.is_completed">
              <button class="card-btn btn-chot-deal" :disabled="chotDealLoading" @click.stop="chotDealAndSaleReport(item)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                {{ chotDealLoading ? 'Đang xử lý...' : 'CHỐT DEAL & CẬP NHẬT SALE REPORT' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
        <div class="detail-modal detail-modal-wide" @click.stop>
          <!-- Header -->
          <div class="dm-header">
            <div class="dm-header-info">
              <div class="dm-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                Bảng báo giá chi tiết
              </div>
              <div class="dm-badges">
                <span class="dm-contract-badge">Mã HĐ: <b>{{ selectedContract?.ma_hop_dong }}</b></span>
                <span class="dm-contract-badge">Số HĐ: <b>{{ selectedContract?.so_hop_dong }}</b></span>
                <span class="dm-badge" :class="selectedContract?.trang_thai === 'Chính thức' ? 'badge-official' : 'badge-draft'">{{ selectedContract?.trang_thai }}</span>
                <button class="btn btn-excel" :disabled="exportingExcel" @click="downloadDetailExcel" style="padding: 4px 12px; font-size: 11px; height: 24px; border-radius: 6px; box-shadow: none;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  {{ exportingExcel ? 'Đang tạo...' : 'Tải Excel' }}
                </button>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <button class="btn btn-chot-deal" style="width: auto; height: 36px; padding: 0 20px !important; font-size: 12px !important; letter-spacing: 0px;" v-if="!selectedContract?.is_completed" :disabled="chotDealLoading" @click="chotDealAndSaleReport(selectedContract!); showDetailModal = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                {{ chotDealLoading ? 'Đang xử lý...' : 'CHỐT DEAL & SALE REPORT' }}
              </button>
              <button class="dm-close" @click="showDetailModal = false"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
          </div>

          <!-- Scrollable Body -->
          <div class="dm-body">
            <!-- Loading -->
            <div v-if="loadingDetails" class="dm-loading"><div class="dm-spinner"></div>Đang tải chi tiết...</div>
            <div v-else-if="!selectedContractDetails.length" class="dm-empty">Không có sản phẩm nào trong báo giá này.</div>
            <template v-else>
              <!-- Quote Table -->
              <div class="dm-table-wrap">
                <table class="dm-table">
                  <thead>
                    <tr>
                      <th class="col-stt">STT</th>
                      <th class="col-pn">P/N</th>
                      <th class="col-name">TÊN HÀNG</th>
                      <th class="col-desc">DIỄN GIẢI</th>
                      <th class="col-hang">HÃNG</th>
                      <th class="col-dvt">ĐVT</th>
                      <th class="col-sl">SL</th>
                      <th class="col-dg">GIÁ TIÊU CHUẨN</th>
                      <th class="col-dg">ĐƠN GIÁ (LP)</th>
                      <th class="col-dg">GIÁ NHẬP</th>
                      <th class="col-dg">MỨC OFF</th>
                      <th class="col-dg">ĐƠN GIÁ (KH)</th>
                      <th class="col-tt">TT TRƯỚC THUẾ (VND)</th>
                      <th class="col-vat">VAT</th>
                      <th class="col-tt">TT SAU THUẾ (VND)</th>
                      <th class="col-tt">NET MARGIN</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(group, gi) in groupedDetails" :key="gi">
                      <!-- Group header row -->
                      <tr v-if="group.title" class="dm-group-row">
                        <td class="group-stt">{{ toRoman(gi + 1) }}</td>
                        <td colspan="15" class="group-title">{{ group.title }}</td>
                      </tr>
                      <!-- Item rows -->
                      <tr v-for="(d, di) in group.items" :key="di" class="dm-table-row">
                        <td class="center" style="color:#fff; font-weight:700;">{{ di + 1 }}</td>
                        <td class="col-pn-cell">{{ d.ma_hang }}</td>
                        <td class="col-name-cell">{{ d.ten_hang }}</td>
                        <td class="col-desc-cell"><div class="desc-lines"><div v-if="d.mo_ta_chung">{{ d.mo_ta_chung }}</div><div v-if="d.mo_ta_chi_tiet">{{ d.mo_ta_chi_tiet }}</div><div v-if="d.features">{{ d.features }}</div></div></td>
                        <td class="col-hang-cell">{{ d.ten_ncc }}</td>
                        <td class="center" style="color:#fff; font-weight:700;">{{ d.dvt }}</td>
                        <td class="center" style="color:#fff; font-weight:700;">{{ d.so_luong }}</td>
                        <td class="right tc-col"><div>{{ formatVND(d.gia_tieu_chuan) }}</div><div class="sub-pct">({{ giaTCPct(d) }}%)</div></td>
                        <td class="right" style="color:#fff; font-weight:700;">{{ formatVND(d.don_gia) }}</td>
                        <td class="right" style="color:#fb923c; font-weight:700;">{{ formatVND(d.gia_nhap) }}</td>
                        <td class="right" style="color:#f87171; font-weight:700;"><div>{{ formatVND(mucOffAmount(d)) }}</div><div class="sub-pct" style="color:#f87171 !important;">(-{{ d.muc_off }}%)</div></td>
                        <td class="right dg-col">{{ formatVND(unitPriceKH(d)) }}</td>
                        <td class="right tt-col">{{ formatVND(lineTruocThue(d)) }}</td>
                        <td class="right" style="color:#10b981; font-weight:800;"><div>{{ formatVND(lineVAT(d)) }}</div><div class="sub-pct" style="color:#34d399 !important;">({{ d.thue_vat }}%)</div></td>
                        <td class="right sau-col">{{ formatVND(lineSauThue(d)) }}</td>
                        <td class="right" :style="{ color: lineNetMargin(d) >= 0 ? '#10b981' : '#ef4444', fontWeight: 800 }">
                          <div style="display:flex; align-items:center; justify-content:flex-end; gap:3px;">
                            <span style="font-size:11px;">{{ lineNetMargin(d) >= 0 ? '▲' : '▼' }}</span>
                            {{ formatVND(Math.abs(lineNetMargin(d))) }}
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                  <tfoot>
                    <tr class="dm-table-footer">
                      <td :colspan="10" class="center footer-label">TỔNG CỘNG + THUẾ</td>
                      <td class="right"><span class="footer-pill pill-red">-{{ formatVND(detailTotals.off) }}</span></td>
                      <td></td>
                      <td class="right"><span class="footer-pill pill-blue">{{ formatVND(detailTotals.truocThue) }}</span></td>
                      <td class="center"><span class="footer-pill pill-blue">{{ formatVND(detailTotals.vat) }}</span></td>
                      <td class="right"><span class="footer-pill pill-blue">{{ formatVND(detailTotals.sauThue) }}</span></td>
                      <td class="right"><span class="footer-pill" :class="detailTotals.netMargin >= 0 ? 'pill-green' : 'pill-red'"><span style="font-size:10px;">{{ detailTotals.netMargin >= 0 ? '▲' : '▼' }}</span> {{ formatVND(Math.abs(detailTotals.netMargin)) }}</span></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Bottom Totals - Professional Layout -->
              <div class="dm-totals-grid">
                <!-- Box 1: Chiết khấu & Chênh lệch -->
                <div class="totals-box">
                  <div class="totals-header th-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Chiết khấu &amp; Chênh lệch
                  </div>
                  <div class="totals-body">
                    <div class="totals-row">
                      <span class="totals-label">Chiết khấu tổng trước thuế <span class="pct-badge">{{ selectedContract?.chiet_khau_truoc_thue_pct || 0 }}%</span></span>
                      <span class="totals-value">{{ formatVND(selectedContract?.chiet_khau_truoc_thue || 0) }}</span>
                    </div>
                    <div class="totals-row">
                      <span class="totals-label">Thuế chênh lệch giá <span class="pct-badge">{{ selectedContract?.thue_chenh_lech_pct || 0 }}%</span></span>
                      <span class="totals-value">{{ formatVND(selectedContract?.thue_chenh_lech || 0) }}</span>
                    </div>
                    <div class="totals-row">
                      <span class="totals-label">Chênh lệch giá</span>
                      <span class="totals-value" :style="{ color: (selectedContract?.chenh_lech_gia || 0) >= 0 ? '#10b981' : '#ef4444' }">{{ (selectedContract?.chenh_lech_gia || 0) >= 0 ? '+' : '' }}{{ formatVND(selectedContract?.chenh_lech_gia || 0) }}</span>
                    </div>
                    <div class="totals-row">
                      <span class="totals-label">Còn lại</span>
                      <span class="totals-value">{{ formatVND(selectedContract?.con_lai || 0) }}</span>
                    </div>
                    <div class="totals-row totals-highlight-dark">
                      <span class="totals-label-bold">Tổng Chiết khấu</span>
                      <span class="totals-value-big">{{ formatVND(selectedContract?.tong_chiet_khau || 0) }}</span>
                    </div>
                  </div>
                </div>
                <!-- Box 2: Tổng hợp tài chính -->
                <div class="totals-box">
                  <div class="totals-header th-blue">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    Tổng hợp tài chính
                  </div>
                  <div class="totals-body">
                    <div class="totals-row">
                      <span class="totals-label">Tổng giá thực tế</span>
                      <span class="totals-value" style="color: #f87171;">{{ formatVND(selectedContract?.tong_gia_thuc_te || 0) }}</span>
                    </div>
                    <div class="totals-row">
                      <span class="totals-label">Tổng trước thuế (HĐ)</span>
                      <span class="totals-value">{{ formatVND(selectedContract?.tong_truoc_thue || 0) }}</span>
                    </div>
                    <div class="totals-row">
                      <span class="totals-label" style="color:#fbbf24;">Tổng VAT</span>
                      <span class="totals-value" style="color: #fbbf24;">{{ formatVND(selectedContract?.tong_vat || 0) }}</span>
                    </div>
                    <div class="totals-row totals-highlight-blue">
                      <span class="totals-label-bold">Tổng sau thuế</span>
                      <span class="totals-value-big" style="color: #10b981;">{{ formatVND(selectedContract?.tong_sau_thue || 0) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div class="dm-footer">
            <button class="btn btn-refresh" @click="showDetailModal = false">Đóng</button>
            <button class="btn btn-danger" :disabled="selectedContract?.is_completed" @click="editContract(selectedContract); showDetailModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Chỉnh sửa báo giá
            </button>
            <button class="btn btn-primary" @click="duplicateContract(selectedContract); showDetailModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Nhân bản
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- CHỐT DEAL MODALS -->
    <div v-if="showConfirmChotDeal" class="modal-overlay" @click.self="showConfirmChotDeal = false" style="z-index: 10001;">
      <div class="custom-alert-modal">
        <div class="alert-icon question">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <h3 class="alert-title">Xác nhận Chốt Deal</h3>
        <p class="alert-desc">Bạn có chắc muốn <b>CHỐT DEAL</b> cho hợp đồng <br><span style="color:#38bdf8; font-weight: 700;">{{ confirmChotDealItem?.ma_hop_dong }}</span>?</p>
        <div class="alert-actions">
          <button class="alert-btn btn-cancel" @click="showConfirmChotDeal = false">Hủy</button>
          <button class="alert-btn btn-confirm" @click="proceedChotDealAndSaleReport">Xác nhận</button>
        </div>
      </div>
    </div>

    <div v-if="showChotDealAlert" class="modal-overlay" @click.self="showChotDealAlert = false" style="z-index: 10002;">
      <div class="custom-alert-modal">
        <div class="alert-icon" :class="chotDealAlertIsError ? 'error' : 'success'">
          <svg v-if="!chotDealAlertIsError" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        </div>
        <h3 class="alert-title">{{ chotDealAlertIsError ? 'Đã xảy ra lỗi' : 'Thành công' }}</h3>
        <p class="alert-desc">{{ chotDealAlertMessage }}</p>
        <div class="alert-actions" style="justify-content: center;">
          <button class="alert-btn btn-confirm" @click="showChotDealAlert = false">Đóng</button>
        </div>
      </div>
    </div>
      <!-- Customer Select Modal -->
      <Teleport to="body">
        <Transition name="nav-fade">
          <div v-if="showCustomerModal" class="nav-overlay" @click.self="showCustomerModal = false" style="z-index: 9999;">
            <div class="nav-loading-card" style="max-width: 540px; width: 90%; max-height: 85vh; display: flex; flex-direction: column; align-items: stretch; text-align: left; padding: 24px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">
                <h3 style="margin: 0; color: #f8fafc; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">CHỌN KHÁCH HÀNG</h3>
                <button @click="showCustomerModal = false" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; cursor: pointer; padding: 6px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.2)'; this.style.color='#f87171'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#94a3b8'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              <div style="margin-bottom: 20px; position: relative;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 16px; top: 14px; color: #64748b;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" v-model="customerModalSearch" placeholder="Tìm tên KH, công ty, MST..." style="box-sizing: border-box; width: 100%; padding: 14px 14px 14px 44px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #f8fafc; font-size: 15px; outline: none; transition: all 0.25s;" onfocus="this.style.borderColor='#10b981'; this.style.boxShadow='0 0 0 3px rgba(16,185,129,0.1)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.boxShadow='none'" />
              </div>
              
              <div style="overflow-y: auto; flex: 1; padding-right: 4px; display: flex; flex-direction: column; gap: 8px;" class="custom-scrollbar">
                <div 
                  @click="customerFilter = 'ALL'; showCustomerModal = false"
                  style="padding: 12px 16px; border-radius: 12px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; gap: 14px;"
                  :style="customerFilter === 'ALL' ? 'background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05)); border: 1px solid rgba(16,185,129,0.5); transform: scale(1.01); box-shadow: 0 4px 12px rgba(0,0,0,0.1);' : 'background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);'"
                  onmouseover="if(this.getAttribute('data-active') !== 'true') { this.style.background='rgba(255,255,255,0.08)'; this.style.transform='scale(1.01)'; }"
                  onmouseout="if(this.getAttribute('data-active') !== 'true') { this.style.background='rgba(255,255,255,0.03)'; this.style.transform='scale(1)'; }"
                  :data-active="customerFilter === 'ALL'"
                >
                  <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(16,185,129,0.3); flex-shrink: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <div style="flex: 1;">
                    <div style="font-weight: 800; font-size: 16px; letter-spacing: -0.2px;" :style="customerFilter === 'ALL' ? 'color: #34d399;' : 'color: #f8fafc;'">Tất cả khách hàng</div>
                    <div style="font-size: 13px; color: #64748b; margin-top: 2px;">Hiển thị toàn bộ báo giá</div>
                  </div>
                  <div v-if="customerFilter === 'ALL'" style="width: 24px; height: 24px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(16,185,129,0.4);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
                
                <div 
                  v-for="(c, i) in filteredModalCustomers" 
                  :key="c.id"
                  @click="customerFilter = c.id; showCustomerModal = false"
                  style="padding: 12px 16px; border-radius: 12px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; gap: 14px;"
                  :style="customerFilter === c.id ? 'background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05)); border: 1px solid rgba(16,185,129,0.5); transform: scale(1.01); box-shadow: 0 4px 12px rgba(0,0,0,0.1);' : 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);'"
                  onmouseover="if(this.getAttribute('data-active') !== 'true') { this.style.background='rgba(255,255,255,0.06)'; this.style.transform='scale(1.01)'; }"
                  onmouseout="if(this.getAttribute('data-active') !== 'true') { this.style.background='rgba(255,255,255,0.02)'; this.style.transform='scale(1)'; }"
                  :data-active="customerFilter === c.id"
                >
                  <div style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 800; font-size: 18px; color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.2);" :style="`background: linear-gradient(135deg, hsl(${((i * 137.5) % 360)}, 70%, 50%), hsl(${((i * 137.5 + 40) % 360)}, 70%, 40%))`">
                    {{ c.name.charAt(0).toUpperCase() }}
                  </div>
                  <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                    <div style="font-weight: 800; font-size: 15px; letter-spacing: -0.2px; line-height: 1.3;" :style="customerFilter === c.id ? 'color: #34d399;' : 'color: #f1f5f9;'">{{ c.name }}</div>
                    <div v-if="c.tenCongTy" style="font-size: 12.5px; color: #f8fafc; display: flex; align-items: flex-start; gap: 6px; line-height: 1.4;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                      <span>{{ c.tenCongTy }}</span>
                    </div>
                    <div v-if="c.mst" style="font-size: 12.5px; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      <span>MST: {{ c.mst }}</span>
                    </div>
                  </div>
                  <div v-if="customerFilter === c.id" style="width: 24px; height: 24px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(16,185,129,0.4);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
                
                <div v-if="filteredModalCustomers.length === 0" style="text-align: center; padding: 48px 0; color: #64748b;">
                  <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.6;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                  <div style="font-size: 16px; font-weight: 600; color: #cbd5e1; margin-bottom: 4px;">Không tìm thấy khách hàng nào</div>
                  <div style="font-size: 13px;">Vui lòng thử lại với từ khóa khác.</div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ExcelJS from 'exceljs'

const router = useRouter()
const BASE_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

interface Contract {
  ma_hop_dong: string; so_hop_dong: string; ma_khach_hang: string; ten_khach_hang: string
  ngay_tao: string; tong_truoc_thue: number; tong_vat: number; tong_sau_thue: number
  trang_thai: string; ghi_chu: string; created_time: string; so_po: string; ma_hop_dong_goc: string
  tong_gia_thuc_te: number
  chiet_khau_truoc_thue: number; chiet_khau_truoc_thue_pct: number
  thue_chenh_lech: number; thue_chenh_lech_pct: number
  chenh_lech_gia: number; con_lai: number; tong_chiet_khau: number
  is_completed: boolean
}
interface ContractDetail {
  ma_hang: string; ten_hang: string; dvt: string; so_luong: number
  don_gia: number; gia_tieu_chuan: number; ten_ncc: string; features: string
  danh_muc: string; mo_ta_chung: string; mo_ta_chi_tiet: string
  thue_vat: number; gia_nhap: number; muc_off: number; license_duration: string
}
interface ContractGroup { goc: string; latest: Contract; versions: Contract[] }

const loading = ref(false)
const contracts = ref<Contract[]>([])
const allDetailsRaw = ref<any[][]>([])
const allHdRaw = ref<any[][]>([])
const customersRaw = ref<any[][]>([])
const chotDealLoading = ref(false)

const showConfirmChotDeal = ref(false)
const confirmChotDealItem = ref<Contract | null>(null)
const showChotDealAlert = ref(false)
const chotDealAlertMessage = ref('')
const chotDealAlertIsError = ref(false)

const collapsedGroups = reactive<Record<string, boolean>>({})

const searchKeyword = ref(''); const statusFilter = ref('ALL'); const customerFilter = ref('ALL'); const fromDate = ref(''); const toDate = ref(''); const showCustomerModal = ref(false);
const processingFilter = ref('ALL'); const dateSortOrder = ref('DESC');

const hasActiveFilters = computed(() => searchKeyword.value || statusFilter.value !== 'ALL' || customerFilter.value !== 'ALL' || processingFilter.value !== 'ALL' || dateSortOrder.value !== 'DESC' || fromDate.value || toDate.value)
function clearFilters() { searchKeyword.value = ''; statusFilter.value = 'ALL'; customerFilter.value = 'ALL'; processingFilter.value = 'ALL'; dateSortOrder.value = 'DESC'; fromDate.value = ''; toDate.value = '' }

const uniqueCustomers = computed(() => {
  const map = new Map<string, string>()
  contracts.value.forEach(c => { if (c.ma_khach_hang) map.set(c.ma_khach_hang, c.ten_khach_hang) })
  return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
})

const customerModalSearch = ref('');
const filteredModalCustomers = computed(() => {
  const kw = customerModalSearch.value.toLowerCase();
  const list = uniqueCustomers.value.map(c => {
    const info = getCustomerInfo(c.id);
    return { ...c, mst: info.mst, tenCongTy: info.tenCongTy };
  });
  if (!kw) return list;
  return list.filter(c => 
    (c.name && c.name.toLowerCase().includes(kw)) || 
    (c.mst && c.mst.toLowerCase().includes(kw)) || 
    (c.tenCongTy && c.tenCongTy.toLowerCase().includes(kw)) ||
    (c.id && c.id.toLowerCase().includes(kw))
  );
});

function countByStatus(s: string) { return filteredContracts.value.filter(c => c.trang_thai === s).length }
function parseVietnameseDate(dateStr: string): Date | null {
  if (!dateStr) return null; const m = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null
}

const filteredContracts = computed(() => {
  const from = fromDate.value ? new Date(fromDate.value) : null; const to = toDate.value ? new Date(toDate.value) : null
  if (from) from.setHours(0, 0, 0, 0); if (to) to.setHours(23, 59, 59, 999)
  const filtered = contracts.value.filter(c => {
    if (statusFilter.value !== 'ALL' && c.trang_thai !== statusFilter.value) return false
    if (processingFilter.value !== 'ALL') {
      if (processingFilter.value === 'COMPLETED' && !c.is_completed) return false;
      if (processingFilter.value === 'PROCESSING' && c.is_completed) return false;
    }
    if (customerFilter.value !== 'ALL' && c.ma_khach_hang !== customerFilter.value) return false
    if (searchKeyword.value) { const kw = searchKeyword.value.toLowerCase(); if (!`${c.so_hop_dong} ${c.ten_khach_hang} ${c.ma_khach_hang} ${c.ma_hop_dong} ${c.ghi_chu} ${c.so_po}`.toLowerCase().includes(kw)) return false }
    if (from || to) { const d = parseVietnameseDate(c.ngay_tao); if (d) { if (from && d < from) return false; if (to && d > to) return false } }
    return true
  })
  
  return filtered.sort((a, b) => {
    const da = parseVietnameseDate(a.ngay_tao)?.getTime() || 0;
    const db = parseVietnameseDate(b.ngay_tao)?.getTime() || 0;
    return dateSortOrder.value === 'ASC' ? da - db : db - da;
  });
})

const groupedContracts = computed((): ContractGroup[] => {
  const map = new Map<string, Contract[]>()
  filteredContracts.value.forEach(c => {
    const goc = c.ma_hop_dong_goc
    if (goc) {
      if (!map.has(goc)) map.set(goc, [])
      if (!map.get(goc)!.find(v => v.ma_hop_dong === c.ma_hop_dong)) {
        map.get(goc)!.push(c)
      }
    }
  })
  // Also add the "goc" contract itself if it exists in filtered list
  filteredContracts.value.forEach(c => {
    if (map.has(c.ma_hop_dong) && !map.get(c.ma_hop_dong)!.find(v => v.ma_hop_dong === c.ma_hop_dong)) {
      map.get(c.ma_hop_dong)!.unshift(c)
    }
  })
  const groups: ContractGroup[] = []
  map.forEach((versions, goc) => {
    if (versions.length > 0) groups.push({ goc, latest: versions[0], versions })
  })
  return groups
})

// Standalone: contracts that have no ma_hop_dong_goc, OR goc === own ID AND not referenced as goc by others
const standaloneContracts = computed((): Contract[] => {
  const groupedGocs = new Set<string>()
  const groupedIds = new Set<string>()
  groupedContracts.value.forEach(g => {
    groupedGocs.add(g.goc)
    g.versions.forEach(v => groupedIds.add(v.ma_hop_dong))
  })
  return filteredContracts.value.filter(c => !groupedIds.has(c.ma_hop_dong))
})

const dashboardFilter = ref('ALL') // 'ALL', 'PROCESSING', 'COMPLETED'

const totalGroups = computed(() => groupedContracts.value.length + standaloneContracts.value.length)
const completedGroups = computed(() => {
  return groupedContracts.value.filter(g => g.latest.trang_thai === 'Chính thức' && g.latest.is_completed).length +
         standaloneContracts.value.filter(c => c.trang_thai === 'Chính thức' && c.is_completed).length
})
const processingGroups = computed(() => {
  return groupedContracts.value.filter(g => g.latest.trang_thai === 'Tạm' && !g.latest.is_completed).length +
         standaloneContracts.value.filter(c => c.trang_thai === 'Tạm' && !c.is_completed).length
})

const displayedGroupedContracts = computed(() => {
  if (dashboardFilter.value === 'ALL') return groupedContracts.value
  if (dashboardFilter.value === 'COMPLETED') return groupedContracts.value.filter(g => g.latest.trang_thai === 'Chính thức' && g.latest.is_completed)
  return groupedContracts.value.filter(g => g.latest.trang_thai === 'Tạm' && !g.latest.is_completed)
})

const displayedStandaloneContracts = computed(() => {
  if (dashboardFilter.value === 'ALL') return standaloneContracts.value
  if (dashboardFilter.value === 'COMPLETED') return standaloneContracts.value.filter(c => c.trang_thai === 'Chính thức' && c.is_completed)
  return standaloneContracts.value.filter(c => c.trang_thai === 'Tạm' && !c.is_completed)
})

const hasAnyData = computed(() => displayedGroupedContracts.value.length > 0 || displayedStandaloneContracts.value.length > 0)

function toggleGroup(goc: string) { collapsedGroups[goc] = !collapsedGroups[goc] }
function truncate(s: string, len: number) { return !s ? '' : s.length > len ? s.substring(0, len) + '...' : s }

const showDetailModal = ref(false); const selectedContract = ref<Contract | null>(null); const loadingDetails = ref(false); const selectedContractDetails = ref<ContractDetail[]>([])

const detailTotals = computed(() => {
  const rows = selectedContractDetails.value
  let truocThue = 0, vat = 0, sauThue = 0, off = 0, netMargin = 0
  rows.forEach(d => {
    const upKH = d.don_gia * (1 - d.muc_off / 100)
    const tt = upKH * d.so_luong
    const v = tt * d.thue_vat / 100
    const margin = tt - (d.gia_nhap * d.so_luong)
    const offAmt = d.don_gia * d.muc_off / 100 * d.so_luong
    truocThue += tt; vat += v; sauThue += tt + v; off += offAmt; netMargin += margin
  })
  return { truocThue, vat, sauThue, off, netMargin }
})

// Group details by danh_muc for display
const groupedDetails = computed(() => {
  const rows = selectedContractDetails.value
  const groups: { key: string; title: string; items: ContractDetail[] }[] = []
  let currentGroup = ''
  rows.forEach(d => {
    const cat = d.danh_muc || ''
    if (cat !== currentGroup) {
      currentGroup = cat
      if (cat) groups.push({ key: cat, title: cat, items: [] })
    }
    if (groups.length && groups[groups.length - 1].key === cat) {
      groups[groups.length - 1].items.push(d)
    } else {
      // items without group
      if (!groups.length || groups[groups.length - 1].key !== '__ungrouped__') {
        groups.push({ key: '__ungrouped__', title: '', items: [] })
      }
      groups[groups.length - 1].items.push(d)
    }
  })
  return groups
})

// Helper functions for line calculations
function unitPriceKH(d: ContractDetail) { return d.don_gia * (1 - d.muc_off / 100) }
function lineTruocThue(d: ContractDetail) { return unitPriceKH(d) * d.so_luong }
function lineVAT(d: ContractDetail) { return lineTruocThue(d) * d.thue_vat / 100 }
function lineSauThue(d: ContractDetail) { return lineTruocThue(d) + lineVAT(d) }
function lineNetMargin(d: ContractDetail) { return lineTruocThue(d) - d.gia_nhap * d.so_luong }
function mucOffAmount(d: ContractDetail) { return d.don_gia * d.muc_off / 100 }
function giaTCPct(d: ContractDetail) { return d.don_gia ? Math.round((d.gia_tieu_chuan / d.don_gia) * 100) : 0 }
function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
  let result = ''; for (let i = 0; i < vals.length; i++) { while (n >= vals[i]) { result += syms[i]; n -= vals[i] } }; return result
}

function getInitials(name: string) { if (!name) return '?'; const p = name.trim().split(/\s+/); return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name[0].toUpperCase() }
function getAvatarColor(name: string) {
  if (!name) return 'linear-gradient(135deg, #6366f1, #8b5cf6)'
  const c = ['linear-gradient(135deg,#10b981,#059669)','linear-gradient(135deg,#3b82f6,#2563eb)','linear-gradient(135deg,#8b5cf6,#7c3aed)','linear-gradient(135deg,#f59e0b,#d97706)','linear-gradient(135deg,#ef4444,#dc2626)','linear-gradient(135deg,#ec4899,#db2777)','linear-gradient(135deg,#14b8a6,#0d9488)','linear-gradient(135deg,#6366f1,#4f46e5)']
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h); return c[Math.abs(h) % c.length]
}

async function fetchData() {
  loading.value = true
  try {
    const [hdRes, detailRes, khRes] = await Promise.all([
      fetch(`${BASE_URL}?action=hop_dong_tong_quat`).then(r => r.json()),
      fetch(`${BASE_URL}?action=hop_dong_chi_tiet`).then(r => r.json()),
      fetch(`${BASE_URL}?action=khach_hang`).then(r => r.json())
    ])
    allDetailsRaw.value = Array.isArray(detailRes) ? detailRes : []
    customersRaw.value = Array.isArray(khRes) ? khRes : []
    const hdArr = Array.isArray(hdRes) ? hdRes : []
    allHdRaw.value = hdArr
    contracts.value = hdArr.map((r: any[]) => ({
      ma_hop_dong: String(r[0]||''), so_hop_dong: String(r[1]||''), ma_khach_hang: String(r[2]||''), ten_khach_hang: String(r[3]||''),
      ngay_tao: String(r[21]||r[4]||''), tong_truoc_thue: Number(r[5]||0), tong_vat: Number(r[6]||0), tong_sau_thue: Number(r[7]||0),
      trang_thai: String(r[15]||''), ghi_chu: String(r[16]||''), created_time: String(r[21]||''), so_po: String(r[22]||''),
      content_of_contract_po: String(r[24]||''), ma_hop_dong_goc: String(r[32]||''),
      tong_gia_thuc_te: Number(r[20]||0),
      chiet_khau_truoc_thue: Number(r[25]||0), chiet_khau_truoc_thue_pct: Number(r[26]||0),
      thue_chenh_lech: Number(r[27]||0), thue_chenh_lech_pct: Number(r[28]||0),
      chenh_lech_gia: Number(r[29]||0), con_lai: Number(r[30]||0), tong_chiet_khau: Number(r[31]||0),
      is_completed: r[33] === true || r[33] === 'true' || r[33] === 'TRUE' || String(r[15]||'') === 'Chính thức'
    })).filter((c: Contract) => c.ma_hop_dong).reverse()
  } catch (err) { console.error(err); alert('Lỗi tải dữ liệu.') }
  finally { loading.value = false }
}

function getCustomerInfo(maKH: string) {
  const row = customersRaw.value.find(r => String(r[0]||'').trim() === maKH.trim())
  if (!row) return { mst: '', tenCongTy: '', diaChi: '', tenKH: '' }
  return {
    mst: String(row[19]||''),
    tenCongTy: String(row[5]||''),
    diaChi: String(row[8]||row[21]||''),
    tenKH: String(row[1]||'')
  }
}

function viewDetails(contract: Contract) {
  selectedContract.value = contract; showDetailModal.value = true; loadingDetails.value = true
  setTimeout(() => {
    selectedContractDetails.value = allDetailsRaw.value.filter(r => String(r[0]||'') === contract.ma_hop_dong).map(r => ({
      ma_hang: String(r[2]||''), ten_hang: String(r[3]||''), dvt: String(r[12]||''),
      so_luong: Number(r[18]||1), don_gia: Number(r[14]||0), gia_tieu_chuan: Number(r[13]||0),
      ten_ncc: String(r[6]||''), features: String(r[9]||''), danh_muc: String(r[10]||''),
      mo_ta_chung: String(r[7]||''), mo_ta_chi_tiet: String(r[8]||''),
      thue_vat: Number(r[17]||0), gia_nhap: Number(r[21]||0), muc_off: Number(r[22]||0),
      license_duration: String(r[11]||'')
    })); loadingDetails.value = false
  }, 100)
}

const navigating = ref(false)
const navigatingContract = ref<Contract | null>(null)
const navStep = ref(0)
const navMode = ref('edit')

function editContract(c: Contract | null) {
  if (!c) return
  navMode.value = 'edit'
  navigating.value = true
  navigatingContract.value = c
  navStep.value = 0
  showDetailModal.value = false

  setTimeout(() => { navStep.value = 1 }, 300)
  setTimeout(() => { navStep.value = 2 }, 800)
  setTimeout(() => { navStep.value = 3 }, 1300)
  setTimeout(() => {
    router.push(`/baogia?ma=${c.ma_hop_dong}`)
  }, 1600)
}

function handleMouseMove(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  target.style.setProperty('--mouse-x', `${x}px`);
  target.style.setProperty('--mouse-y', `${y}px`);
}

async function duplicateContract(c: Contract | null) {
  if (!c) return
  navMode.value = 'duplicate'
  const rawDetails = allDetailsRaw.value.filter(r => String(r[0]||'') === c.ma_hop_dong)
  localStorage.setItem('cloneQuoteProductsRaw', JSON.stringify(rawDetails))
  localStorage.setItem('cloneQuoteMeta', JSON.stringify({
    chietKhauTruocThuePct: c.chiet_khau_truoc_thue_pct || 0,
    thueChenhLechPct: c.thue_chenh_lech_pct || 0
  }))
  
  navigating.value = true
  navigatingContract.value = c
  navStep.value = 0
  showDetailModal.value = false

  setTimeout(() => { navStep.value = 1 }, 300)
  setTimeout(() => { navStep.value = 2 }, 800)
  setTimeout(() => { navStep.value = 3 }, 1300)
  setTimeout(() => {
    router.push('/baogia?clone=true')
  }, 1600)
}
function formatVND(n: number) { return new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n)) }

async function postApi(action: string, payload: any) {
  const body = new URLSearchParams()
  body.set('action', action)
  body.set('payload', JSON.stringify(payload || {}))
  const res = await fetch(BASE_URL, { method: 'POST', body })
  const data = await res.json()
  if (!data.ok) throw new Error(data.error || 'Lỗi server')
  return data
}

function formatDateTimeVN(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}.${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`
}

function chotDealAndSaleReport(item: Contract) {
  if (item.is_completed) return
  confirmChotDealItem.value = item
  showConfirmChotDeal.value = true
}

async function proceedChotDealAndSaleReport() {
  const item = confirmChotDealItem.value
  if (!item) return
  showConfirmChotDeal.value = false

  chotDealLoading.value = true
  try {
    // Tìm raw row từ allHdRaw
    const rawRow = allHdRaw.value.find(r => String(r[0]||'') === item.ma_hop_dong)
    if (!rawRow) throw new Error('Không tìm thấy dữ liệu hợp đồng gốc')

    // Lấy chi tiết raw
    const ctRows = allDetailsRaw.value.filter(r => String(r[0]||'') === item.ma_hop_dong)
    if (!ctRows.length) throw new Error('Không tìm thấy chi tiết hợp đồng')

    // Auto-gen So_PO
    let nextPO = ''
    try {
      const poData = await fetch(`${BASE_URL}?action=po_dxmh`).then(r => r.json())
      let maxPO = 0
      if (Array.isArray(poData)) {
        poData.forEach((row: any) => {
          const soPo = parseInt(String(row[2] || '').replace(/\D/g, ''))
          if (!isNaN(soPo) && soPo > maxPO) maxPO = soPo
        })
      }
      nextPO = String(maxPO + 1)
    } catch {}

    // Build hd_tong_quat_row từ raw data, cập nhật trạng thái
    const hdRow = [...rawRow]
    // Đảm bảo đủ 34 cột
    while (hdRow.length < 34) hdRow.push('')
    hdRow[15] = 'Chính thức'        // Trạng thái hợp đồng
    hdRow[22] = nextPO               // So_PO
    hdRow[33] = 'TRUE'               // isCompleted

    const payload = {
      hd_tong_quat_row: hdRow,
      hd_chi_tiet_rows: ctRows,
      ma_khach_hang: item.ma_khach_hang,
      tong_sau_thue: item.tong_sau_thue
    }

    // 1) Lưu chính thức
    await postApi('save_contract_official', payload)

    // 2) Lưu vào sale_report
    const custInfo = getCustomerInfo(item.ma_khach_hang)
    const firstDetail = ctRows[0] || []
    const srPayload = {
      sheet: 'sale_report',
      action: 'add',
      ma_hop_dong: item.ma_hop_dong,
      so_hop_dong: item.so_hop_dong,
      So_PO: nextPO,
      content_of_contract_PO: item.content_of_contract_po || item.so_hop_dong,
      Ma_khach_hang: item.ma_khach_hang,
      Ten_khach_hang: item.ten_khach_hang,
      Ma_cong_ty: '',
      Ten_cong_ty: custInfo.tenCongTy,
      MST: custInfo.mst,
      Ma_nha_cung_cap: String(firstDetail[5] || ''),
      Ten_nha_cung_cap: String(firstDetail[6] || ''),
      Tong_tien_truoc_thueVAT: item.tong_truoc_thue,
      Tong_thueVAT: item.tong_vat,
      Tong_tien_sau_thueVAT: item.tong_sau_thue,
      chiet_khau_tong_truoc_thue: item.chiet_khau_truoc_thue,
      phan_tram_chiet_khau_tong_truoc_thue: item.chiet_khau_truoc_thue_pct,
      thue_chenh_lech_gia: item.thue_chenh_lech,
      phan_tram_thue_chenh_lech_gia: item.thue_chenh_lech_pct,
      chenh_lech_gia: item.chenh_lech_gia,
      con_lai: item.con_lai,
      tong_chiet_khau: item.tong_chiet_khau,
      Tong_thanh_tien_chua_VAT_mua_hang: 0,
      Tong_CP_don_hang: 0,
      account_manager_name: 'LÊ PHI SƠN',
      link_excel_bao_gia: '',
      ten_file_bao_gia: ''
    }
    try { await fetch(BASE_URL, { method: 'POST', body: JSON.stringify(srPayload) }) } catch (e) { console.warn('Lỗi lưu sale_report:', e) }

    // 3) Lưu vào PO_DXMH
    const contentPO = item.content_of_contract_po || item.so_hop_dong
    if (contentPO) {
      const poPayload = {
        sheet: 'po_dxmh',
        action: 'add',
        ma_hop_dong: item.ma_hop_dong,
        so_hop_dong: item.so_hop_dong,
        so_po: nextPO,
        content_of_contract_po: contentPO,
        ma_khach_hang: item.ma_khach_hang,
        company: custInfo.tenCongTy,
        mst: custInfo.mst,
        address: custInfo.diaChi,
        tel: '',
        contact: item.ten_khach_hang,
        email: ''
      }
      try { await fetch(BASE_URL, { method: 'POST', body: JSON.stringify(poPayload) }) } catch (e) { console.warn('Lỗi lưu PO_DXMH:', e) }

      // 4) Lưu vào chi_tiet_mua_hang
      const ctmhItems = ctRows.map(r => ({
        ma_hop_dong: item.ma_hop_dong,
        so_hop_dong: item.so_hop_dong,
        so_po: nextPO,
        ten_po: contentPO,
        ma_hang_hoa: String(r[2] || ''),
        ten_hang_hoa: String(r[3] || ''),
        ma_nha_cung_cap: String(r[5] || ''),
        ten_nha_cung_cap: String(r[6] || ''),
        sl: Number(r[18] || 1),
        don_gia: Number(r[14] || 0),
        thanh_tien: (Number(r[18] || 1)) * (Number(r[14] || 0)),
        content_of_contract_po: contentPO
      }))
      if (ctmhItems.length) {
        try {
          await fetch(BASE_URL, { method: 'POST', body: JSON.stringify({
            sheet: 'chi_tiet_mua_hang',
            action: 'add_bulk',
            items: ctmhItems
          }) })
        } catch (e) { console.warn('Lỗi lưu chi_tiet_mua_hang:', e) }
      }
    }

    chotDealAlertIsError.value = false
    chotDealAlertMessage.value = 'Đã CHỐT DEAL & CẬP NHẬT SALE REPORT thành công!'
    showChotDealAlert.value = true
    await fetchData() // Reload data
  } catch (e: any) {
    chotDealAlertIsError.value = true
    chotDealAlertMessage.value = String(e?.message || e)
    showChotDealAlert.value = true
    console.error(e)
  } finally {
    chotDealLoading.value = false
  }
}

const exportingExcel = ref(false)

async function downloadDetailExcel() {
  if (!selectedContract.value || !selectedContractDetails.value.length) return
  exportingExcel.value = true
  try {
    const c = selectedContract.value
    const tots = detailTotals.value
    const custInfo = getCustomerInfo(c.ma_khach_hang)

    const workbook = new ExcelJS.Workbook()
    const response = await fetch('/template_goc.xlsx')
    const buffer = await response.arrayBuffer()
    await workbook.xlsx.load(buffer)
    const ws = workbook.worksheets[0]

    // ====== Find key rows (same as BaoGia) ======
    let headerRowIdx = -1
    let totalRowIdx = -1
    let origTermStart = -1
    let origSigStart = -1

    ws.eachRow((row, rowNumber) => {
      if (row.getCell(1).value === 'STT' && String(row.getCell(2).value).includes('TÊN HÀNG HÓA')) {
        headerRowIdx = rowNumber
      }
      const cell1Val = String(row.getCell(1).value || '')
      const cell2Val = String(row.getCell(2).value || '')
      const rowText = cell1Val + ' ' + cell2Val

      if (rowText.includes('TỔNG CỘNG + THUẾ')) {
        totalRowIdx = rowNumber
      }

      if (totalRowIdx !== -1 && rowNumber > totalRowIdx) {
        if (rowText.includes('Thuế VAT') && origTermStart === -1) {
          origTermStart = rowNumber
        }
        if ((rowText.includes('Xác nhận') || rowText.includes('Người lập') || rowText.includes('ĐẠI DIỆN')) && origTermStart !== -1 && origSigStart === -1) {
          origSigStart = rowNumber
        }
      }
    })

    if (headerRowIdx === -1 || totalRowIdx === -1) { alert('Template không hợp lệ'); return }

    // ====== Capture styles (same as BaoGia) ======
    const groupStyle: any = {}
    for (let c = 1; c <= 9; c++) groupStyle[c] = ws.getRow(headerRowIdx + 1).getCell(c).style
    const dataRowStyle: any = {}
    for (let c = 1; c <= 9; c++) dataRowStyle[c] = ws.getRow(headerRowIdx + 2).getCell(c).style
    const totalRowStyle: any = {}
    for (let c = 1; c <= 9; c++) totalRowStyle[c] = ws.getRow(totalRowIdx).getCell(c).style

    // ====== Save footer merges & row props (same as BaoGia) ======
    const footerMerges: any[] = []
    const footerRowProps: any[] = []
    const maxRow = ws.rowCount
    for (let r = totalRowIdx + 1; r <= maxRow; r++) {
      footerRowProps.push({
        height: ws.getRow(r).height,
        hidden: ws.getRow(r).hidden,
        outlineLevel: ws.getRow(r).outlineLevel
      })
    }

    const merges = Object.values((ws as any)._merges || {})
    merges.forEach((merge: any) => {
      if (merge.model.top > totalRowIdx) {
        footerMerges.push(merge.model)
      }
      if (merge.model.top >= headerRowIdx) {
        ws.unMergeCells(merge.model.top, merge.model.left, merge.model.bottom, merge.model.right)
      }
    })

    // ====== Clear data rows (same as BaoGia) ======
    const numRowsToRemove = totalRowIdx - headerRowIdx
    ws.spliceRows(headerRowIdx + 1, numRowsToRemove)

    // Clear heights (use cached maxRow to prevent infinite loop)
    for (let r = headerRowIdx + 1; r <= maxRow + 200; r++) {
      (ws.getRow(r) as any).height = undefined
      ws.getRow(r).hidden = false
    }

    // ====== Insert data rows (adapted from BaoGia) ======
    let insertIdx = headerRowIdx + 1
    const groups = groupedDetails.value
    let groupNum = 0

    groups.forEach(group => {
      if (group.title) {
        groupNum++
        ws.spliceRows(insertIdx, 0, [])
        const row = ws.getRow(insertIdx)
        row.getCell(1).value = toRoman(groupNum)
        row.getCell(2).value = group.title.toUpperCase()
        for (let col = 1; col <= 9; col++) row.getCell(col).style = groupStyle[col]
        ws.mergeCells(insertIdx, 2, insertIdx, 3)
        insertIdx++
      }

      group.items.forEach((d, di) => {
        ws.spliceRows(insertIdx, 0, [])
        const row = ws.getRow(insertIdx)
        const upKH = unitPriceKH(d)
        const truoc = lineTruocThue(d)
        const vat = lineVAT(d)
        const sau = lineSauThue(d)

        row.getCell(1).value = di + 1
        row.getCell(2).value = d.ten_hang
        row.getCell(3).value = [d.mo_ta_chung, d.mo_ta_chi_tiet, d.features].filter(Boolean).join('\n')
        row.getCell(4).value = d.dvt
        row.getCell(5).value = Number(d.so_luong) || 0
        row.getCell(6).value = Number(Math.round(upKH)) || 0
        row.getCell(7).value = Number(Math.round(truoc)) || 0
        row.getCell(8).value = Number(Math.round(vat)) || 0
        row.getCell(9).value = Number(Math.round(sau)) || 0

        for (let col = 1; col <= 9; col++) {
          const cell = row.getCell(col)
          cell.style = dataRowStyle[col]
          if (col >= 5 && col <= 9) {
            cell.font = Object.assign({}, cell.font || {}, { bold: true })
          }
        }
        insertIdx++
      })
    })

    // ====== Total row (same as BaoGia) ======
    ws.spliceRows(insertIdx, 0, [])
    const totRow = ws.getRow(insertIdx)
    totRow.getCell(1).value = 'TỔNG CỘNG + THUẾ'
    totRow.getCell(7).value = Number(Math.round(tots.truocThue)) || 0
    totRow.getCell(8).value = Number(Math.round(tots.vat)) || 0
    totRow.getCell(9).value = Number(Math.round(tots.sauThue)) || 0

    for (let col = 1; col <= 9; col++) totRow.getCell(col).style = totalRowStyle[col]
    ws.mergeCells(insertIdx, 1, insertIdx, 6)

    const diff = insertIdx - totalRowIdx

    // ====== Re-apply footer merges (same as BaoGia, no terms editing) ======
    footerMerges.forEach(m => {
      const mergeDiff = diff
      try {
        ws.mergeCells(m.top + mergeDiff, m.left, m.bottom + mergeDiff, m.right)
      } catch(e) {}
    })

    // ====== Apply footer row props / heights (same as BaoGia) ======
    let currentFooterIdx = insertIdx + 1
    let origRowIdx = totalRowIdx + 1
    footerRowProps.forEach(props => {
      const targetIdx = currentFooterIdx + (diff > 0 ? 0 : 0)
      const rObj = ws.getRow(currentFooterIdx + diff - (totalRowIdx - totalRowIdx))
      if (props.height !== undefined) ws.getRow(currentFooterIdx).height = props.height
      if (props.hidden !== undefined) ws.getRow(currentFooterIdx).hidden = props.hidden
      if (props.outlineLevel !== undefined) ws.getRow(currentFooterIdx).outlineLevel = props.outlineLevel
      origRowIdx++
      currentFooterIdx++
    })

    // ====== Fill header info (same as BaoGia) ======
    ws.getCell('A7').value = `Kính gởi: ${custInfo.tenCongTy || c.ten_khach_hang || ''}`

    const cellA8 = ws.getCell('A8')
    cellA8.value = `Địa chỉ: ${custInfo.diaChi || ''}`
    cellA8.font = { ...cellA8.font, italic: true }

    const cellA9 = ws.getCell('A9')
    cellA9.value = `Người nhận: ${c.ten_khach_hang || ''}`
    cellA9.font = { ...cellA9.font, italic: true }

    const now = new Date()
    const dd = now.getDate().toString().padStart(2, '0')
    const mm = (now.getMonth() + 1).toString().padStart(2, '0')
    const yyyy = now.getFullYear()
    ws.getCell('G7').value = `Ngày : ${dd}/${mm}/${yyyy}`

    // ====== Shift images (same as BaoGia) ======
    const totalShift = diff
    if (totalShift !== 0) {
      const images = ws.getImages()
      images.forEach((img: any) => {
        if (img.range && img.range.tl && img.range.tl.row > headerRowIdx) {
          img.range.tl.row += totalShift
          img.range.br.row += totalShift
        }
      })
    }

    const outBuffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `BaoGia_${c.so_hop_dong || c.ma_hop_dong}.xlsx`
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (e) {
    console.error('Excel export error:', e)
    alert('Lỗi khi tạo file Excel: ' + (e as Error).message)
  } finally {
    exportingExcel.value = false
  }
}

onMounted(() => { fetchData() })
</script>

<style scoped>
.quan-ly-bao-gia { 
  padding: 24px; max-width: 1600px; margin: 0 auto; 
  font-family: 'Plus Jakarta Sans','Inter',sans-serif; color: #f1f5f9; 
  position: relative;
}
.quan-ly-bao-gia::before {
  content: ''; position: fixed; top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(28,181,224,0.03) 0%, rgba(0,0,70,0) 60%),
              radial-gradient(circle at 80% 20%, rgba(28,181,224,0.04) 0%, rgba(0,0,70,0) 40%);
  z-index: -1; pointer-events: none;
}

/* HEADER */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.header-left { display: flex; flex-direction: column; gap: 12px; }
.page-title { font-size: 28px; font-weight: 800; color: #f8fafc; margin: 0; display: flex; align-items: center; gap: 12px; letter-spacing: -0.5px; }
.header-stats { display: flex; gap: 8px; flex-wrap: wrap; }
.stat-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: rgba(148,163,184,0.1); color: #94a3b8; border: 1px solid rgba(148,163,184,0.15); }
.stat-dot { width: 6px; height: 6px; border-radius: 50%; background: #94a3b8; }
.stat-success { background: rgba(16,185,129,0.1); color: #34d399; border-color: rgba(16,185,129,0.2); }
.stat-success .stat-dot { background: #10b981; }
.stat-warning { background: rgba(245,158,11,0.1); color: #fbbf24; border-color: rgba(245,158,11,0.2); }
.stat-warning .stat-dot { background: #f59e0b; }
.header-actions { display: flex; gap: 10px; align-items: center; }

/* BUTTONS */
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); border: none; white-space: nowrap; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-refresh { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; }
.btn-refresh:hover:not(:disabled) { background: rgba(255,255,255,0.1); transform: translateY(-1px); }
.btn-create { background: linear-gradient(135deg,#10b981,#059669); color: #fff; box-shadow: 0 4px 14px rgba(16,185,129,0.3); }
.btn-create:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(16,185,129,0.45); transform: translateY(-2px); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* FILTERS */
.filters-bar { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px 20px; margin-bottom: 28px; display: flex; flex-direction: column; gap: 14px; backdrop-filter: blur(12px); }
.filter-search { position: relative; display: flex; align-items: center; }
.filter-search svg { position: absolute; left: 14px; color: #64748b; pointer-events: none; }
.filter-search input { width: 100%; padding: 12px 40px 12px 42px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #f1f5f9; font-size: 14px; font-family: inherit; outline: none; transition: all 0.25s; }
.filter-search input::placeholder { color: #475569; }
.filter-search input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
.clear-search { position: absolute; right: 12px; background: rgba(255,255,255,0.1); border: none; color: #94a3b8; width: 22px; height: 22px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; }
.clear-search:hover { background: rgba(239,68,68,0.3); color: #fca5a5; }
.filter-chips { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
.filter-select, .filter-date { background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; border-radius: 8px; padding: 8px 12px; font-size: 13px; font-family: inherit; outline: none; cursor: pointer; transition: all 0.25s; }
.filter-select { min-width: 140px; }
.filter-select:focus, .filter-date:focus { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16,185,129,0.1); }
.filter-select option { background-color: #0f172a; color: #34d399; font-weight: 600; padding: 8px; }
.filter-date-group { display: flex; align-items: center; gap: 8px; }
.date-separator { color: #475569; font-size: 14px; }
.btn-clear-filters { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; font-size: 12px; font-weight: 600; cursor: pointer; }
.btn-clear-filters:hover { background: rgba(239,68,68,0.2); }

/* DASHBOARD CARDS */
.dashboard-cards {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;
}
.dash-card {
  background: rgba(15, 23, 42, 0.6); border-radius: 16px; padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex; align-items: center; gap: 16px; cursor: pointer;
  position: relative; overflow: hidden; transition: all 0.3s ease;
}
.dash-card:hover { transform: translateY(-3px); background: rgba(15, 23, 42, 0.8); }
.bg-icon {
  width: 48px; height: 48px; opacity: 0.15; position: absolute; right: -8px; bottom: -8px;
  transform: rotate(-15deg); transition: all 0.3s;
}
.dash-card:hover .bg-icon { transform: rotate(0) scale(1.1); opacity: 0.25; }
.dc-content { display: flex; flex-direction: column; z-index: 1; }
.dc-label { font-size: 13px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.dc-value { font-size: 28px; font-weight: 800; color: #f8fafc; line-height: 1; font-variant-numeric: tabular-nums; }

/* Themes & Active States */
.dash-card.processing .dc-value, .dash-card.processing .dc-label { color: #fb923c; }
.dash-card.processing .bg-icon { color: #fb923c; }
.dash-card.processing.active { border-color: #fb923c; box-shadow: 0 0 20px rgba(251, 146, 60, 0.2); background: rgba(251, 146, 60, 0.08); }

.dash-card.completed .dc-value, .dash-card.completed .dc-label { color: #10b981; }
.dash-card.completed .bg-icon { color: #10b981; }
.dash-card.completed.active { border-color: #10b981; box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.08); }

.dash-card.total .dc-value, .dash-card.total .dc-label { color: #3b82f6; }
.dash-card.total .bg-icon { color: #3b82f6; }
.dash-card.total.active { border-color: #3b82f6; box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); background: rgba(59, 130, 246, 0.08); }

@media (max-width: 768px) {
  .dashboard-cards { grid-template-columns: 1fr; gap: 12px; }
}

/* SKELETON */
.loading-wrap { display: flex; flex-direction: column; gap: 16px; }
.skeleton-bar { height: 56px; border-radius: 14px; background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06), rgba(255,255,255,0.03)); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.skeleton-card { min-height: 240px; background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden; }
.sk-h { height: 38px; background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06), rgba(255,255,255,0.03)); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.sk-b { padding: 18px 14px; display: flex; flex-direction: column; gap: 12px; }
.sk-l { height: 12px; border-radius: 6px; background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.07), rgba(255,255,255,0.03)); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.w60 { width: 60%; } .w80 { width: 80%; } .w40 { width: 40%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* EMPTY */
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px 24px; text-align: center; gap: 16px; }
.empty-state svg { color: #334155; margin-bottom: 8px; }
.empty-state h3 { font-size: 20px; font-weight: 700; color: #64748b; margin: 0; }
.empty-state p { color: #475569; font-size: 14px; margin: 0; }

/* ===== GROUP SECTIONS ===== */
.groups-container { display: flex; flex-direction: column; gap: 28px; }

.group-section { animation: sectionFadeIn 0.4s ease-out both; }
.standalone-section { animation: sectionFadeIn 0.4s ease-out both; }
.standalone-label {
  display: flex; align-items: center; gap: 8px; padding: 10px 16px; margin-bottom: 14px;
  font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px;
}
.standalone-label svg { color: #475569; }
@keyframes sectionFadeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

/* VIP PRO GROUP ROW DESIGN */
.premium-row {
  padding: 16px 22px; border-radius: 16px; cursor: pointer;
  background: #0f172a;
  border: 1px solid rgba(56, 189, 248, 0.4);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.15), 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05);
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

/* Mouse-tracking Glow */
.premium-row::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(28,181,224,0.12), transparent 40%);
  z-index: -1; border-radius: 20px; opacity: 0; transition: opacity 0.4s; pointer-events: none;
}
.premium-row:hover::after { opacity: 1; }

/* Light Sweep Effect */
.premium-row::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(28,181,224,0.08), transparent);
  transform: skewX(-20deg);
  transition: 0.7s; z-index: -1; pointer-events: none;
}
.premium-row:hover::before { left: 150%; }

.premium-row:hover {
  border-color: rgba(28,181,224,0.5);
  box-shadow: 0 16px 48px rgba(0,0,0,0.6), inset 0 0 20px rgba(28,181,224,0.15), inset 0 0 0 1px rgba(28,181,224,0.2);
  transform: translateY(-4px) perspective(1000px) rotateX(1deg);
}

/* CUSTOM GRID LAYOUT UPDATES */
.custom-grid { display: flex; flex-direction: column; gap: 12px; position: relative; }
.cg-top { display: flex; justify-content: space-between; align-items: flex-start; z-index: 2; }
.cg-middle { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; margin: 6px 0; z-index: 2; }

/* Large Title VIP */
.large-title { 
  font-size: 30px !important; font-weight: 900; letter-spacing: -0.5px; line-height: 1.3; white-space: normal; text-transform: uppercase;
  background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 24px rgba(255,255,255,0.2);
}

.full-width-note { 
  max-width: 85%; white-space: normal !important; text-align: center; 
  font-size: 13.5px; font-weight: 800; font-style: italic;
  color: #ef4444 !important; 
  display: inline-block; 
  letter-spacing: 0.2px; margin-top: 2px;
}

/* Separator line */
.cg-bottom { 
  display: flex; justify-content: space-between; align-items: stretch; 
  padding-top: 14px; z-index: 2; position: relative;
}
.cg-bottom::before {
  content: ''; position: absolute; top: 0; left: 5%; right: 5%; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(28,181,224,0.2), transparent);
}

.cg-bottom-left { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.cg-bottom-right { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; flex: 1; text-align: right; }

.version-badge { display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, rgba(28,181,224,0.15), rgba(28,181,224,0.05)); padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; color: #b3e5fc; border: 1px solid rgba(28,181,224,0.2); box-shadow: inset 0 1px 0 rgba(255,255,255,0.1); backdrop-filter: blur(8px); }

.vip-magoc {
  display: flex; align-items: center; gap: 8px; 
  background: linear-gradient(135deg, rgba(28,181,224,0.2), rgba(28,181,224,0.05)); 
  padding: 6px 16px; border-radius: 20px; 
  border: 1px solid rgba(28,181,224,0.4);
  box-shadow: 0 4px 12px rgba(28,181,224,0.15), inset 0 1px 0 rgba(255,255,255,0.2);
}

.amount-label { color: #81d4fa; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; font-size: 11px; margin-bottom: 2px; }
.amount-vip {
  font-size: 24px; font-weight: 800;
  background: linear-gradient(135deg, #6ee7b7 0%, #10b981 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 12px rgba(16,185,129,0.4));
}
.amount-vip .amount-currency { color: #10b981; -webkit-text-fill-color: #10b981; font-size: 15px; vertical-align: top; margin-left: 2px; font-weight: 800; }

.amount-old { font-size: 15px; color: #059669; font-weight: 700; position: relative; display: inline-block; }

/* Trend Badge Mini Sparkline */
.trend-badge {
  display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px;
  font-size: 12px; font-weight: 800;
}
.trend-up { background: rgba(28,181,224,0.15); color: #1cb5e0; border: 1px solid rgba(28,181,224,0.3); box-shadow: 0 2px 8px rgba(28,181,224,0.2); }
.trend-down { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); box-shadow: 0 2px 8px rgba(239,68,68,0.2); }

/* Enhanced Avatar */
.row-avatar-glass { box-shadow: 0 4px 16px rgba(28,181,224,0.2), inset 0 1px 0 rgba(255,255,255,0.2); border: 1px solid rgba(28,181,224,0.3); }

/* Pulse animation for dot */
.badge-dot.status-live { box-shadow: 0 0 0 0 rgba(28,181,224,0.7); animation: pulse-blue 2s infinite; }
@keyframes pulse-blue {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(28,181,224,0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(28,181,224,0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(28,181,224,0); }
}

/* Expand Button VIP */
.cg-expand-btn {
  background: linear-gradient(135deg, rgba(28,181,224,0.1), rgba(28,181,224,0.02)) !important;
  border: 1px solid rgba(28,181,224,0.2) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  width: 44px !important; height: 44px !important; border-radius: 14px;
}
.premium-row:hover .cg-expand-btn {
  background: linear-gradient(135deg, rgba(28,181,224,0.3), rgba(28,181,224,0.1)) !important;
  border-color: rgba(28,181,224,0.6) !important;
  color: #1cb5e0;
  box-shadow: 0 8px 16px rgba(28,181,224,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
}

.text-white { color: #fff !important; }

/* VIP Info Box for Customer Details */
.vip-info-box {
  background: linear-gradient(135deg, rgba(28,181,224,0.08), rgba(0,0,70,0.15));
  padding: 10px 14px; 
  border-radius: 12px; 
  border: 1px solid rgba(28,181,224,0.2); 
  box-shadow: 0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}
.vip-info-box::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #1cb5e0, transparent);
  border-radius: 3px 0 0 3px;
  opacity: 0.8;
}
.premium-row:hover .vip-info-box {
  background: linear-gradient(135deg, rgba(28,181,224,0.12), rgba(0,0,70,0.25));
  border-color: rgba(28,181,224,0.4);
  box-shadow: 0 6px 16px rgba(28,181,224,0.15), inset 0 1px 0 rgba(255,255,255,0.15);
}
.vip-info-label {
  font-size: 10px; 
  color: #81d4fa; 
  text-transform: uppercase; 
  font-weight: 800; 
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.vip-info-label svg {
  width: 12px; height: 12px;
  opacity: 0.9;
}
.vip-info-value {
  font-size: 14px; 
  color: #ffffff; 
  font-weight: 700;
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
  letter-spacing: 0.2px;
  padding-left: 1px;
}

.row-left {
  display: flex; align-items: center; gap: 14px;
}
.row-expand {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  background: transparent; border: none; color: #64748b;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.premium-row:hover .row-expand { color: #38bdf8; }
.row-expand svg { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.row-expand.expanded { color: #38bdf8; }
.row-expand.expanded svg { transform: rotate(90deg); }

.row-avatar-glass {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  position: relative; z-index: 1;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.avatar-text {
  font-size: 15px; font-weight: 800; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
.avatar-glow {
  position: absolute; inset: -4px; z-index: -1;
  border-radius: 16px; filter: blur(12px); opacity: 0.4;
  transition: opacity 0.3s;
}
.premium-row:hover .avatar-glow { opacity: 0.6; }

.row-main {
  flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 8px;
}
.row-top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.row-title {
  font-size: 16px; font-weight: 700; color: #f8fafc; margin: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  letter-spacing: -0.2px; line-height: 1.3;
}
.row-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.modern-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
  backdrop-filter: blur(4px);
}
.outline-badge {
  background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1;
}
.badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
}
.status-live {
  background: #10b981; box-shadow: 0 0 6px #10b981;
}
.note-badge {
  background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); color: #fbbf24;
  max-width: 220px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}

.row-bottom { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.meta-label { color: #64748b; font-weight: 500; }
.meta-icon { color: #64748b; display: flex; align-items: center; }
.meta-value { color: #94a3b8; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.text-blue { color: #38bdf8; font-weight: 700; }
.highlight-company { color: #cbd5e1; }
.meta-divider { width: 4px; height: 4px; border-radius: 50%; background: #334155; }

.row-right {
  display: flex; align-items: center; gap: 24px; padding-left: 20px;
  border-left: 1px solid rgba(255,255,255,0.06);
}
.row-versions {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.version-count {
  font-size: 16px; font-weight: 800; color: #f8fafc;
  background: rgba(255,255,255,0.1); width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center; border-radius: 8px;
}
.version-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }

.row-amount-wrap {
  display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
}
.amount-label {
  font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
}
.amount-value {
  font-size: 20px; font-weight: 800; color: #10b981;
  font-variant-numeric: tabular-nums;
  display: flex; align-items: baseline; gap: 2px;
  text-shadow: 0 2px 10px rgba(16,185,129,0.25);
}
.amount-currency { font-size: 14px; font-weight: 700; color: #34d399; }

/* GROUP CARDS */
.group-cards {
  overflow: hidden;
  transition: max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.3s;
  max-height: 3000px;
  opacity: 1;
}
.group-cards.collapsed { max-height: 0; opacity: 0; }

.group-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding: 0 0 4px;
}

/* INVOICE CARD */
.invoice-card {
  background: #0f172a; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 8px;
  padding: 0; cursor: pointer; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex; flex-direction: column; gap: 0;
  animation: cardPop 0.35s ease-out both;
}

@keyframes cardPop {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.invoice-card:hover {
  border-color: #10b981; transform: scale(1.02) translateY(-4px);
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.35), 0 8px 24px rgba(16, 185, 129, 0.25);
}

.invoice-card-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 16px 16px 8px;
}
.invoice-ma-hd {
  font-weight: 700; color: #38bdf8; font-size: 14px;
  display: flex; align-items: center; gap: 6px; word-break: break-all;
}
.invoice-ma-hd svg { flex-shrink: 0; }
.invoice-date { font-size: 12px; color: #10b981; white-space: nowrap; flex-shrink: 0; }

.invoice-card-body {
  display: flex; flex-direction: column; gap: 4px; padding: 0 16px; flex: 1;
}
.invoice-card-body p { margin: 0; line-height: 1.5; font-size: 13px; color: #cbd5e1; }
.invoice-po { color: #f59e0b !important; font-weight: 600; }
.invoice-status { margin-bottom: 4px !important; }
.status-badge {
  background: #10b981; color: #ffffff;
  padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 700;
  text-transform: uppercase; margin-left: 4px;
}
.status-badge.badge-temp { background: #eab308; color: #ffffff; border: none; }
.status-badge.badge-official { background: #10b981; color: #ffffff; font-weight: 800; border: none; }
.status-badge.badge-completed { background: #10b981; color: #ffffff; font-weight: 700; border: none; }
.status-badge.badge-processing { background: #fb923c; color: #ffffff; font-weight: 700; border: none; }
.invoice-divider { border: 0; border-top: 1px dashed #334155; margin: 8px 0; }
.invoice-text { color: #ffffff !important; }
.invoice-customer { font-size: 14px !important; color: #f8fafc !important; margin-bottom: 8px !important; }
.invoice-icon-text { display: flex; align-items: flex-start; gap: 6px; }
.invoice-icon-text svg { flex-shrink: 0; color: #94a3b8; margin-top: 2px; }

.invoice-totals {
  margin-top: 4px; background: rgba(0, 0, 0, 0.2);
  padding: 8px 12px; border-radius: 6px;
  display: flex; flex-direction: column; gap: 4px;
}
.invoice-totals p {
  display: flex; justify-content: space-between; align-items: center;
  font-weight: 600; font-size: 13px;
}
.invoice-totals p span { font-weight: 700; font-variant-numeric: tabular-nums; }
.invoice-totals p.highlight { color: #10b981; font-weight: 800; font-size: 14px; }
.invoice-totals p.highlight span { font-size: 15px; font-weight: 800; }

.card-actions { display: flex; gap: 8px; margin-top: 16px; padding: 0 16px 16px 16px; }
.card-btn { flex: 1; padding: 8px 4px; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 4px; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); text-transform: uppercase; letter-spacing: 0.5px; }
.card-btn:hover:not(:disabled) { transform: scale(1.04) translateY(-2px); }
.card-btn:active:not(:disabled) { transform: scale(0.96) translateY(0) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important; }
.btn-view { background: #3b82f6; color: #ffffff; }
.btn-view:hover:not(:disabled) { background: #2563eb; box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4); }
.btn-edit { background: #ef4444; color: #ffffff; }
.btn-edit:hover:not(:disabled) { background: #dc2626; box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4); }
.btn-duplicate { background: #10b981; color: #ffffff; }
.btn-duplicate:hover:not(:disabled) { background: #059669; box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4); }

/* ===== MODAL ===== */
/* ===== MODAL ===== */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 24px; animation: overlayIn 0.2s ease-out; }
@keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

/* Custom Alert Modal */
.custom-alert-modal { background: #0f172a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px 32px; width: 90vw; max-width: 400px; display: flex; flex-direction: column; align-items: center; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); animation: modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes modalPop { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.alert-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.alert-icon.question { background: rgba(56,189,248,0.1); color: #38bdf8; }
.alert-icon.success { background: rgba(16,185,129,0.1); color: #10b981; }
.alert-icon.error { background: rgba(239,68,68,0.1); color: #ef4444; }
.alert-title { font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0 0 8px 0; }
.alert-desc { font-size: 14px; color: #cbd5e1; margin: 0 0 24px 0; line-height: 1.5; }
.alert-actions { display: flex; gap: 12px; width: 100%; justify-content: center; }
.alert-btn { padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; }
.alert-btn.btn-cancel { background: rgba(255,255,255,0.05); color: #e2e8f0; }
.alert-btn.btn-cancel:hover { background: rgba(255,255,255,0.1); }
.alert-btn.btn-confirm { background: #38bdf8; color: #fff; }
.alert-btn.btn-confirm:hover { background: #0284c7; }

.detail-modal { background: #0f172a; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; width: 95vw; max-width: 1600px; max-height: 94vh; display: flex; flex-direction: column; box-shadow: 0 25px 60px rgba(0,0,0,0.5); animation: modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.detail-modal-wide { max-width: 1600px; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.dm-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); background: linear-gradient(135deg, rgba(16,185,129,0.05), rgba(56,189,248,0.03)); border-radius: 20px 20px 0 0; flex-shrink: 0; }
.dm-header-info { display: flex; flex-direction: column; gap: 8px; }
.dm-title { font-size: 18px; font-weight: 800; color: #f8fafc; display: flex; align-items: center; gap: 10px; }
.dm-title svg { color: #38bdf8; }
.dm-badges { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.dm-contract-badge { display: inline-flex; padding: 3px 10px; border-radius: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); font-size: 11px; color: #94a3b8; }
.dm-contract-badge b { color: #e2e8f0; margin-left: 2px; }
.dm-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.badge-official { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
.badge-draft { background: rgba(245,158,11,0.12); color: #fbbf24; border: 1px solid rgba(245,158,11,0.2); }
.dm-close { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #94a3b8; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.dm-close:hover { background: rgba(239,68,68,0.15); color: #f87171; }

/* Body */
.dm-body { overflow-y: auto; flex: 1; padding: 20px 24px; display: flex; flex-direction: column; gap: 20px; }
.dm-loading, .dm-empty { text-align: center; padding: 60px 24px; color: #64748b; font-size: 14px; }
.dm-spinner { width: 28px; height: 28px; border: 2px solid rgba(255,255,255,0.1); border-top-color: #10b981; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }

/* Quote Table */
.dm-table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); }
.dm-table { width: 100%; border-collapse: collapse; font-size: 12px; min-width: 1500px; }
.dm-table thead { position: sticky; top: 0; z-index: 2; }
.dm-table thead tr { background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); }
.dm-table th {
  padding: 10px 10px; text-align: left; font-size: 11px; font-weight: 800;
  color: #ffffff; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; border: none;
}
.dm-table th:first-child { border-top-left-radius: 12px; }
.dm-table th:last-child { border-top-right-radius: 12px; }

.dm-table-row { transition: background 0.15s; }
.dm-table-row:hover { background: rgba(255,255,255,0.04); }
.dm-table-row td {
  padding: 10px 10px; border-bottom: 1px solid rgba(255,255,255,0.04);
  color: #e2e8f0; font-weight: 600; vertical-align: top;
}
.dm-table td.center, .dm-table th.center { text-align: center; }
.dm-table td.right, .dm-table th.right { text-align: right; }

.col-stt { width: 44px; text-align: center; }
.col-pn { min-width: 90px; }
.col-name { min-width: 160px; }
.col-desc { min-width: 180px; max-width: 280px; }
.col-hang { min-width: 90px; }
.col-dvt { width: 54px; text-align: center; }
.col-sl { width: 44px; text-align: center; }
.col-dg { min-width: 100px; text-align: right; }
.col-tt { min-width: 110px; text-align: right; }
.col-vat { width: 60px; text-align: center; }

.col-pn-cell { color: #f8fafc; font-weight: 700; }
.col-name-cell { color: #f8fafc; font-weight: 700; }
.col-desc-cell { color: #94a3b8; font-weight: 500; max-width: 280px; }
.col-hang-cell { color: #e2e8f0; font-weight: 700; }
.desc-lines { display: flex; flex-direction: column; gap: 2px; font-size: 11px; line-height: 1.4; }
.tc-col { color: #8b5cf6; font-weight: 700; line-height: 1.3; }
.dg-col { color: #10b981; font-weight: 700; }
.tt-col { color: #10b981; font-weight: 800; }
.vat-cell { color: #34d399; font-weight: 700; }
.sau-col { color: #10b981; font-weight: 800; }
.sub-pct { font-size: 11px; margin-top: 2px; color: #8b5cf6 !important; font-weight: 600; }

/* Group rows */
.dm-group-row { background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06)); }
.dm-group-row td { border: none; }
.group-stt {
  text-align: center; font-size: 13px; font-weight: 900; color: #10b981;
  padding: 8px 10px !important;
}
.group-title {
  font-size: 13px; font-weight: 800; color: #10b981; text-transform: uppercase;
  letter-spacing: 0.3px; padding: 8px 10px !important;
}

/* Table footer */
.dm-table-footer { background: #fadb14 !important; }
.dm-table-footer td {
  padding: 10px; font-weight: 800; color: #000; border: none; white-space: nowrap;
}
.footer-label { font-size: 13px; font-weight: 900; color: #15803d !important; text-align: center !important; }
.footer-pill {
  display: inline-block; padding: 3px 10px; border-radius: 12px;
  font-size: 12px; font-weight: 800; white-space: nowrap; color: #fff;
}
.pill-blue { background: #1d4ed8; }
.pill-green { background: #059669; }
.pill-red { background: #dc2626; }

/* Totals Grid */
.dm-totals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 8px; }
.totals-box {
  background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  transition: all 0.25s;
}
.totals-box:hover { border-color: rgba(255,255,255,0.16); box-shadow: 0 8px 32px rgba(0,0,0,0.3); transform: translateY(-2px); }
.totals-header {
  padding: 14px 20px; font-size: 14px; font-weight: 800;
  letter-spacing: 0.3px; border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex; align-items: center; gap: 10px;
}
.th-green { background: linear-gradient(135deg, #064e3b, #065f46); color: #34d399; }
.th-blue { background: linear-gradient(135deg, #1e3a5f, #1e40af); color: #93c5fd; }
.th-dark { background: linear-gradient(135deg, #1e293b, #334155); color: #e2e8f0; }
.totals-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
.totals-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; }
.totals-label { font-size: 13px; color: #e2e8f0; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.totals-value { font-size: 14px; color: #f8fafc; font-weight: 700; font-variant-numeric: tabular-nums; }
.totals-label-bold { font-size: 14px; color: #ffffff; font-weight: 800; }
.totals-value-big { font-size: 18px; color: #f8fafc; font-weight: 800; font-variant-numeric: tabular-nums; }
.pct-badge {
  display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 6px;
  background: rgba(239,68,68,0.12); color: #f87171; font-size: 12px; font-weight: 700;
  border: 1px solid rgba(239,68,68,0.2);
}
.totals-highlight-blue {
  margin-top: 8px; padding: 14px 16px !important; border-radius: 12px;
  background: linear-gradient(135deg, rgba(37,99,235,0.1), rgba(59,130,246,0.06));
  border: 1px solid rgba(59,130,246,0.18);
}
.totals-highlight-dark {
  margin-top: 8px; padding: 14px 16px !important; border-radius: 12px;
  background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.08);
}

/* Footer */
.dm-footer { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0; border-radius: 0 0 20px 20px; }
.btn-excel { background: linear-gradient(135deg, #059669, #047857); color: #fff; box-shadow: 0 4px 14px rgba(5,150,105,0.3); }
.btn-excel:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(5,150,105,0.45); transform: translateY(-2px); }
.btn-excel:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-danger { background: #ef4444; color: #fff; box-shadow: 0 4px 14px rgba(239,68,68,0.25); }
.btn-danger:hover { background: #dc2626; box-shadow: 0 6px 20px rgba(239,68,68,0.4); transform: translateY(-2px); }
.btn-primary { background: #3b82f6; color: #fff; box-shadow: 0 4px 14px rgba(59,130,246,0.25); }
.btn-primary:hover { background: #2563eb; box-shadow: 0 6px 20px rgba(59,130,246,0.4); transform: translateY(-2px); }

/* RESPONSIVE */
@media (max-width: 900px) {
  .dm-totals-grid { grid-template-columns: 1fr; }
  .detail-modal-wide { max-width: 100%; margin: 0 12px; }
  .page-header { flex-direction: column; }
  .filter-chips { flex-direction: column; }
  .filter-select { width: 100%; }
  .filter-date-group { width: 100%; }
  .group-bar { flex-direction: column; align-items: flex-start; gap: 16px; }
  .row-right { border-left: none; padding-left: 0; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; width: 100%; justify-content: space-between; }
  .row-bottom { flex-direction: column; align-items: flex-start; gap: 8px; }
  .meta-divider { display: none; }
  .cg-bottom { flex-direction: column; gap: 16px; }
  .cg-bottom-right { align-items: flex-start; margin-top: 12px; width: 100%; }
  .cg-bottom-right .meta-item .meta-value { text-align: left; }
  .cg-expand-btn { align-self: flex-end; margin-top: 12px !important; }
}
@media (max-width: 600px) {
  .quan-ly-bao-gia { padding: 16px; }
  .group-cards-grid { grid-template-columns: 1fr; }
  .page-title { font-size: 22px; }
}

/* ===== NAVIGATION LOADING OVERLAY ===== */
.nav-overlay {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,0.85); backdrop-filter: blur(16px);
  display: flex; align-items: center; justify-content: center;
}
.nav-loading-card {
  display: flex; flex-direction: column; align-items: center; gap: 24px;
  padding: 48px 56px; border-radius: 24px;
  background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9));
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 80px rgba(56,189,248,0.05);
  animation: navCardIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes navCardIn {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.nav-spinner-ring {
  position: relative; width: 72px; height: 72px;
  display: flex; align-items: center; justify-content: center;
}
.nav-ring {
  position: absolute; inset: 0; border-radius: 50%;
  border: 3px solid rgba(56,189,248,0.1);
  border-top-color: #38bdf8; border-right-color: #10b981;
  animation: navSpin 1s cubic-bezier(0.5,0,0.5,1) infinite;
}
@keyframes navSpin { to { transform: rotate(360deg); } }
.nav-icon { color: #38bdf8; animation: navPulse 1.5s ease-in-out infinite; }
@keyframes navPulse { 0%,100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }

.nav-text { text-align: center; }
.nav-title {
  font-size: 18px; font-weight: 800; color: #f8fafc;
  letter-spacing: 0.3px; margin-bottom: 6px;
}
.nav-sub {
  font-size: 14px; font-weight: 600; color: #38bdf8;
  font-family: 'JetBrains Mono', monospace;
}

.nav-progress {
  width: 260px; height: 4px; border-radius: 4px;
  background: rgba(255,255,255,0.06); overflow: hidden;
}
.nav-progress-bar {
  height: 100%; border-radius: 4px;
  background: linear-gradient(90deg, #38bdf8, #10b981, #8b5cf6);
  background-size: 200% 100%;
  animation: navProgressFill 1.6s ease-in-out forwards, navProgressShine 1s linear infinite;
}
@keyframes navProgressFill {
  0% { width: 0; } 30% { width: 35%; } 60% { width: 70%; } 100% { width: 100%; }
}
@keyframes navProgressShine {
  0% { background-position: 200% 0; } 100% { background-position: -200% 0; }
}

.nav-steps { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.nav-step {
  display: flex; align-items: center; gap: 10px;
  font-size: 12px; font-weight: 600; color: #475569;
  padding: 6px 12px; border-radius: 8px;
  transition: all 0.3s ease;
}
.nav-step.active { color: #10b981; background: rgba(16,185,129,0.06); }
.step-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #334155; flex-shrink: 0;
  transition: all 0.3s ease;
}
.nav-step.active .step-dot {
  background: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.5);
}

/* Vue transition */
.nav-fade-enter-active { transition: opacity 0.3s ease; }
.nav-fade-leave-active { transition: opacity 0.2s ease; }
.nav-fade-enter-from, .nav-fade-leave-to { opacity: 0; }

.dm-footer .btn:disabled,
.card-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  filter: grayscale(100%);
  pointer-events: none;
}

/* Chốt Deal button */
.card-actions-chot {
  margin-top: 0 !important;
  padding: 0 16px 16px !important;
  border-top: none !important;
}
.btn-chot-deal {
  width: 100%;
  padding: 14px 16px !important;
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  color: #fff !important;
  font-family: "Times New Roman", Times, serif !important;
  font-weight: 900 !important;
  font-size: 11.5px !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  border: none !important;
  border-radius: 8px !important;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 2px 8px rgba(239,68,68,0.25);
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.btn-chot-deal:hover:not(:disabled) {
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.5);
  transform: scale(1.02) translateY(-2px);
}
.btn-chot-deal:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(60%);
}

/* Completed Card Styling */
.invoice-card.completed-card {
  position: relative;
  overflow: hidden;
  border-color: rgba(16, 185, 129, 0.4);
}

/* Dimming overlay for the whole card */
.invoice-card.completed-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(1px);
  z-index: 10;
  pointer-events: none;
}

/* Stamp placed on top of the dimming overlay */
.invoice-card.chot-deal-stamp::before {
  content: 'CHỐT DEAL';
  position: absolute;
  top: 35%; /* Đè lên phần trạng thái và thông tin công ty */
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  background: rgba(74, 222, 128, 0.15); /* Sáng hơn */
  color: #4ade80; /* Xanh lá sáng rực */
  border: 4px solid #4ade80; /* Viền dày và sáng hơn */
  font-size: 38px; /* To hơn hẳn */
  font-weight: 900;
  padding: 16px 36px;
  border-radius: 16px;
  letter-spacing: 4px;
  white-space: nowrap; /* Bắt buộc nằm trên 1 dòng */
  z-index: 11;
  box-shadow: 0 0 40px rgba(74, 222, 128, 0.3);
  pointer-events: none;
  text-shadow: 0 0 12px rgba(74, 222, 128, 0.6);
}

/* Nâng phần giá cả và các nút bấm lên trên lớp mờ và mộc */
.invoice-card.completed-card .invoice-totals,
.invoice-card.completed-card .card-actions {
  position: relative;
  z-index: 20;
}
</style>
