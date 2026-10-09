<template>
  <div class="report-container">
    <header class="header" style="position: relative; justify-content: center;">
      <div class="title-section" style="text-align: center;">
        <h1 style="color: #10b981; text-transform: uppercase;">Quản Lý File</h1>
        <p class="subtitle">Theo dõi và quản lý file, báo giá khách hàng</p>
      </div>
      <div class="header-actions" style="position: absolute; right: 0;">
        <button class="elite-btn-save" @click="openAddModal" style="background: #10b981; border-color: #10b981; transition: background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Thêm Mới</span>
        </button>
      </div>
    </header>

    <!-- Elite Filters -->
    <div class="elite-filter-panel">
      <div class="elite-filter-accent"></div>
      <div class="elite-filter-header">
        <div class="elite-filter-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          <span>Bộ lọc nâng cao</span>
        </div>
        <button class="elite-refresh-btn" @click="resetFilters">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
          Reset bộ lọc
        </button>
      </div>

      <div class="elite-filter-body">
        <div class="elite-filter-row">
          <div class="elite-date-group group-tabs" style="flex: 0 0 auto; min-width: auto; max-width: none;">
            <label style="opacity: 0; user-select: none;" class="mobile-hidden-label">Chế độ</label>
            <div class="elite-mode-tabs">
              <button type="button" :class="{ active: filterMode === 'day' }" @click="filterMode = 'day'">Ngày</button>
              <button type="button" :class="{ active: filterMode === 'week' }" @click="filterMode = 'week'">Tuần</button>
              <button type="button" :class="{ active: filterMode === 'month' }" @click="filterMode = 'month'">Tháng</button>
              <button type="button" :class="{ active: filterMode === 'year' }" @click="filterMode = 'year'">Năm</button>
            </div>
            
            <div style="display: flex; gap: 0.8rem; justify-content: center; margin-top: 0.3rem;">
              <template v-if="filterMode === 'day'">
                <span @click="setFilterTo('yesterday')" class="quick-shortcut-btn" :class="{ 'active': activeQuickShortcut === 'yesterday' }">Hôm qua</span>
                <span @click="setFilterTo('today')" class="quick-shortcut-btn" :class="{ 'active': activeQuickShortcut === 'today' }">Hôm nay</span>
              </template>
              <template v-if="filterMode === 'week'">
                <span @click="setFilterTo('last_week')" class="quick-shortcut-btn" :class="{ 'active': activeQuickShortcut === 'last_week' }">Tuần trước</span>
                <span @click="setFilterTo('this_week')" class="quick-shortcut-btn" :class="{ 'active': activeQuickShortcut === 'this_week' }">Tuần này</span>
              </template>
              <template v-if="filterMode === 'month'">
                <span @click="setFilterTo('last_month')" class="quick-shortcut-btn" :class="{ 'active': activeQuickShortcut === 'last_month' }">Tháng trước</span>
                <span @click="setFilterTo('this_month')" class="quick-shortcut-btn" :class="{ 'active': activeQuickShortcut === 'this_month' }">Tháng này</span>
              </template>
            </div>
          </div>

          <template v-if="filterMode === 'day'">
            <div class="elite-date-group group-date">
              <label>Từ ngày</label>
              <input type="date" v-model="filterDateFrom" :max="filterDateTo" class="elite-input" />
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date">
              <label>Đến ngày</label>
              <input type="date" v-model="filterDateTo" :min="filterDateFrom" class="elite-input" />
            </div>
          </template>
          <template v-if="filterMode === 'week'">
            <div class="elite-date-group group-date">
              <label>Từ tuần</label>
              <input type="week" v-model="filterWeekFrom" :max="filterWeekTo" @change="() => { filterWeekTo = filterWeekFrom; }" class="elite-input" />
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date">
              <label>Đến tuần</label>
              <input type="week" v-model="filterWeekTo" :min="filterWeekFrom" class="elite-input" />
            </div>
          </template>

          <template v-if="filterMode === 'month'">
            <div class="elite-date-group group-date">
              <label>Từ tháng</label>
              <input type="month" v-model="filterMonthFrom" :max="filterMonthTo" class="elite-input" />
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date">
              <label>Đến tháng</label>
              <input type="month" v-model="filterMonthTo" :min="filterMonthFrom" class="elite-input" />
            </div>
          </template>

          <template v-if="filterMode === 'year'">
            <div class="elite-date-group group-date">
              <label>Từ năm</label>
              <input type="number" v-model="filterYearFrom" :max="filterYearTo" placeholder="2024" class="elite-input" />
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date">
              <label>Đến năm</label>
              <input type="number" v-model="filterYearTo" :min="filterYearFrom" placeholder="2025" class="elite-input" />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Thẻ thống kê -->
    <div class="stats-row">
      <!-- Tổng số -->
      <div class="stat-card card-total">
        <div class="stat-icon total">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Tổng số</span>
          <span class="stat-value">{{ statsCounts.total }} <span class="unit-text">hồ sơ</span></span>
        </div>
      </div>
      
      <!-- Mức độ ưu tiên -->
      <div class="stat-card card-total" :class="{ 'elite-active': currentViewCategory === 'mucDoUuTien' }" @click="currentViewCategory = 'mucDoUuTien'">
        <div class="stat-icon total">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
        <div class="stat-info" style="width: 100%;">
          <span class="stat-label">Mức độ ưu tiên</span>
          <div style="display: flex; align-items: baseline; flex-wrap: wrap; margin-top: 0.2rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">
            <div style="display: flex; align-items: baseline; gap: 0.25rem; color: #10b981;">
              <span style="opacity: 0.9;">Cao:</span>
              <span style="font-size: 1.15rem; font-weight: 700;">{{ statsCounts.priority.cao }}</span>
            </div>
            <span style="color: #64748b; margin: 0 0.5rem; font-size: 0.85rem;">|</span>
            <div style="display: flex; align-items: baseline; gap: 0.25rem; color: #f59e0b;">
              <span style="opacity: 0.9;">BT:</span>
              <span style="font-size: 1.15rem; font-weight: 700;">{{ statsCounts.priority.bt }}</span>
            </div>
            <span style="color: #64748b; margin: 0 0.5rem; font-size: 0.85rem;">|</span>
            <div style="display: flex; align-items: baseline; gap: 0.25rem; color: #ef4444;">
              <span style="opacity: 0.9;">Thấp:</span>
              <span style="font-size: 1.15rem; font-weight: 700;">{{ statsCounts.priority.thap }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Trạng thái xử lý -->
      <div class="stat-card card-total" :class="{ 'elite-active': currentViewCategory === 'trangThaiXuLy' }" @click="currentViewCategory = 'trangThaiXuLy'">
        <div class="stat-icon total">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <div class="stat-info" style="width: 100%;">
          <span class="stat-label">Trạng thái xử lý</span>
          <div style="display: flex; align-items: baseline; flex-wrap: wrap; margin-top: 0.2rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">
            <div style="display: flex; align-items: baseline; gap: 0.25rem; color: #10b981;">
              <span style="opacity: 0.9;">Đã gửi:</span>
              <span style="font-size: 1.15rem; font-weight: 700;">{{ statsCounts.process.daGui }}</span>
            </div>
            <span style="color: #64748b; margin: 0 0.5rem; font-size: 0.85rem;">|</span>
            <div style="display: flex; align-items: baseline; gap: 0.25rem; color: #f59e0b;">
              <span style="opacity: 0.9;">Chưa gửi:</span>
              <span style="font-size: 1.15rem; font-weight: 700;">{{ statsCounts.process.chuaGui }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Trạng thái báo giá -->
      <div class="stat-card card-total" :class="{ 'elite-active': currentViewCategory === 'trangThaiBaoGia' }" @click="currentViewCategory = 'trangThaiBaoGia'">
        <div class="stat-icon total">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <div class="stat-info" style="width: 100%;">
          <span class="stat-label">Trạng thái báo giá</span>
          <div style="display: flex; align-items: baseline; flex-wrap: wrap; margin-top: 0.2rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">
            <div style="display: flex; align-items: baseline; gap: 0.25rem; color: #f59e0b;">
              <span style="opacity: 0.9;">Xem xét:</span>
              <span style="font-size: 1.15rem; font-weight: 700;">{{ statsCounts.quote.xemXet }}</span>
            </div>
            <span style="color: #64748b; margin: 0 0.5rem; font-size: 0.85rem;">|</span>
            <div style="display: flex; align-items: baseline; gap: 0.25rem; color: #10b981;">
              <span style="opacity: 0.9;">Thành công:</span>
              <span style="font-size: 1.15rem; font-weight: 700;">{{ statsCounts.quote.thanhCong }}</span>
            </div>
            <span style="color: #64748b; margin: 0 0.5rem; font-size: 0.85rem;">|</span>
            <div style="display: flex; align-items: baseline; gap: 0.25rem; color: #ef4444;">
              <span style="opacity: 0.9;">Thất bại:</span>
              <span style="font-size: 1.15rem; font-weight: 700;">{{ statsCounts.quote.thatBai }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bảng Dữ Liệu -->
    <div ref="tableSection" style="margin-top: 2rem;">
      <div class="elite-table-toolbar desktop-only" style="margin-bottom: 1.5rem; position: relative; flex-direction: column; align-items: flex-start; gap: 1rem;">
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div class="toolbar-left" style="flex: 1; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              <h3>DANH SÁCH FILE</h3>
            </div>
          </div>
          
          <div style="flex: 1; display: flex; justify-content: center; align-items: center; gap: 1rem;">
            <div class="view-mode-tabs" style="display: flex; gap: 0.5rem; background: rgba(0,0,0,0.05); padding: 0.25rem; border-radius: 8px;">
              <button type="button" :class="{ 'active': currentViewCategory === 'timelineView' }" @click="currentViewCategory = 'timelineView'" style="padding: 0.4rem 0.8rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;" :style="currentViewCategory === 'timelineView' ? 'background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); color: #3b82f6;' : 'background: transparent; color: #64748b;'">Dạng Luồng</button>
              <button type="button" :class="{ 'active': currentViewCategory === 'historyView' }" @click="currentViewCategory = 'historyView'" style="padding: 0.4rem 0.8rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;" :style="currentViewCategory === 'historyView' ? 'background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); color: #3b82f6;' : 'background: transparent; color: #64748b;'">Dạng lịch sử</button>
            </div>
            
            <div class="customer-filter">
              <button @click="customerSelectMode = 'filter'; customerSearchQuery = ''; isCustomerSelectModalOpen = true;" type="button" class="elite-input" style="padding: 0.4rem 0.8rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1); font-size: 0.85rem; font-weight: 600; color: #475569; outline: none; background: #f8fafc; cursor: pointer; height: 38px; min-width: 160px; max-width: 200px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); text-align: left; display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getFilterCustomerDisplay() }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            </div>
          </div>
          
          <div style="flex: 1; display: flex; justify-content: flex-end; align-items: center; flex-wrap: wrap;">
            <button class="elite-btn-save" @click="openAddModal" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; background: #10b981; border-color: #10b981; transition: background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Thêm Mới</span>
            </button>
          </div>
        </div>
      </div>

      <div class="elite-table-toolbar mobile-only" style="margin-bottom: 1rem;">
        <div style="display: flex; gap: 0.5rem; justify-content: space-between; align-items: center; width: 100%;">
          <div class="customer-filter" style="flex: 1; min-width: 0;">
            <button @click="customerSelectMode = 'filter'; customerSearchQuery = ''; isCustomerSelectModalOpen = true;" type="button" class="elite-input" style="width: 100%; padding: 0.5rem 0.8rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1); font-size: 0.85rem; font-weight: 600; color: #475569; outline: none; background: #f8fafc; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getFilterCustomerDisplay() }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
          <button class="elite-btn-save" @click="openAddModal" style="display: flex; align-items: center; gap: 0.3rem; padding: 0.5rem 0.8rem; border-radius: 8px; font-weight: 600; cursor: pointer; background: #10b981; border-color: #10b981; flex-shrink: 0; color: white;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Thêm Mới</span>
          </button>
        </div>

        <div class="view-mode-tabs" style="display: flex; gap: 0.5rem; background: rgba(0,0,0,0.05); padding: 0.25rem; border-radius: 8px; width: 100%;">
          <button type="button" :class="{ 'active': currentViewCategory === 'timelineView' }" @click="currentViewCategory = 'timelineView'" style="flex: 1; padding: 0.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;" :style="currentViewCategory === 'timelineView' ? 'background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); color: #3b82f6;' : 'background: transparent; color: #64748b;'">Dạng Luồng</button>
          <button type="button" :class="{ 'active': currentViewCategory === 'historyView' }" @click="currentViewCategory = 'historyView'" style="flex: 1; padding: 0.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;" :style="currentViewCategory === 'historyView' ? 'background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); color: #3b82f6;' : 'background: transparent; color: #64748b;'">Dạng lịch sử</button>
        </div>
      </div>

      <!-- Table hiển thị danh sách file -->
      
      <!-- Card hiển thị danh sách file -->
      <div class="kanban-list" style="padding: 0; margin-top: 1rem;">
        <div v-if="loading" style="text-align: center; padding: 2rem;">
          <div class="spinner"></div>
          <div style="margin-top: 1rem; color: #64748b;">Đang tải dữ liệu...</div>
        </div>
        <div v-else-if="files.length === 0" class="empty-state" style="text-align: center; padding: 2rem;">
          <span style="font-size: 0.9rem; opacity: 0.5;">Chưa có dữ liệu</span>
        </div>
        
        
        <!-- TIMELINE VIEW -->
        <div v-else-if="currentViewCategory === 'timelineView'" class="timeline-view-wrapper" style="padding: 1rem;">
          <div v-for="tree in customerTrees" :key="tree.customer.id" class="customer-tree-group" style="margin-bottom: 2rem; background: rgba(15, 23, 34, 0.6); border-radius: 12px; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.05);">
            <div class="customer-header" @click="toggleCustomer(tree.customer.id)" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 1rem; margin-bottom: 1rem;">
              <h4 style="margin: 0; color: #ffffff; font-size: 1.2rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                {{ tree.customer.ten_khach_hang || 'Chưa có tên' }}{{ tree.customer.ten_cong_ty ? ' - ' + tree.customer.ten_cong_ty : '' }}
                <span v-if="tree.customer.tagKH && tree.customer.tagKH.length" v-for="tag in tree.customer.tagKH" :key="tag" style="background: #10b981; color: #ffffff; border: 1px solid #059669; border-radius: 9999px; padding: 2px 8px; font-size: 0.7rem; font-weight: 700; display: inline-block;">{{ tag }}</span>
              </h4>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <span class="badge" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; padding: 4px 12px; border-radius: 20px;">{{ tree.totalFiles }} sự kiện</span>
                <svg :style="{ transform: collapsedCustomers[tree.customer.id] ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
            <div v-if="!collapsedCustomers[tree.customer.id]" class="customer-timeline-body" style="padding-top: 10px;">
              <div style="display: flex; flex-wrap: wrap; gap: 2rem; align-items: flex-start;">
                <!-- Cột trái: Đã có liên kết -->
                <div style="flex: 1 1 55%; min-width: 300px;">
                  <h5 style="margin: 0 0 1rem 0; color: #cbd5e1; font-size: 0.9rem; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">🔗 Luồng công việc</h5>
                  <FileTimelineNode v-for="rootNode in tree.linkedRoots" :key="rootNode.id" :node="rootNode" :customer="tree.customer" :highlighted-id="highlightedFileId" @edit="editFile" @delete="deleteFile" />
                  <div v-if="!tree.linkedRoots || !tree.linkedRoots.length" style="color: #64748b; font-size: 0.85rem; font-style: italic;">Chưa có luồng công việc nào.</div>
                </div>
                <!-- Cột phải: Mồ côi -->
                <div style="flex: 1 1 35%; min-width: 300px;">
                  <h5 style="margin: 0 0 1rem 0; color: #cbd5e1; font-size: 0.9rem; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">📄 File mới / Chưa liên kết</h5>
                  <FileTimelineNode v-for="rootNode in tree.orphanRoots" :key="rootNode.id" :node="rootNode" :customer="tree.customer" :highlighted-id="highlightedFileId" @edit="editFile" @delete="deleteFile" />
                  <div v-if="!tree.orphanRoots || !tree.orphanRoots.length" style="color: #64748b; font-size: 0.85rem; font-style: italic;">Không có card mới.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- HISTORY VIEW -->
        <div v-else-if="currentViewCategory === 'historyView'" class="history-view-wrapper" style="padding: 2rem;">
          <div v-if="filesHistoryByDate.length === 0" style="text-align: center; color: #94a3b8; padding: 2rem;">
            Chưa có sự kiện nào.
          </div>
          <div v-else class="history-view-container">
            <div v-for="day in filesHistoryByDate" :key="day.dateKey" class="history-day-block">
              <div class="history-day-header">
                <div class="history-day-badge">
                  <span class="history-badge-thu">{{ day.thuLabel }}</span>
                  <span class="history-badge-date">{{ day.dateLabel }}</span>
                </div>
              </div>
              <div class="history-day-content">
                <div v-for="(file, index) in day.items" :key="'his-' + file.id" 
                   class="report-card-timeline" 
                   
                   :style="{ animationDelay: (index * 0.05) + 's', opacity: 1 }"
                   @click="editFile(file)" style="cursor: pointer;"
                   >
            <!-- Hình tròn: STT + Thời gian -->
            <div class="tl-orb-wrap">
              <div class="tl-orb-ring" :class="'tl-ring--' + getCardColorMode(file)"></div>
              <div class="tl-circle" :class="'tl-circle--' + getCardColorMode(file)">
                <div class="tl-circle-inner">
                  <span class="tl-thu-period">{{ formatDisplayTime(file.createdTime).thu }} <span class="tl-period" :class="formatDisplayTime(file.createdTime).period === 'Sáng' ? 'is-morning' : 'is-afternoon'">{{ formatDisplayTime(file.createdTime).period }}</span></span>
                  <span class="tl-date">{{ formatDisplayTime(file.createdTime).date }}</span>
                  <span class="tl-time">{{ formatDisplayTime(file.createdTime).time }}</span>
                  <span class="tl-stt">#{{ index + 1 }}</span>
                </div>
              </div>
              <div class="tl-orbit-trail"></div>
            </div>
            <!-- Connector -->
            <div class="tl-connector" :class="'tl-conn--' + getCardColorMode(file)">
              <div class="tl-conn-dot"></div>
              <div class="tl-beam-particle" :class="'tl-beam--' + getCardColorMode(file)"></div>
            </div>
            <!-- Hình chữ nhật: Nội dung còn lại -->
            <div class="tl-rect" :class="['tl-rect--' + getCardColorMode(file), 'tl-border--' + getCardColorMode(file)]">
              <div class="tl-shimmer-border" :class="'tl-shimmer--' + getCardColorMode(file)"></div>
              <div class="tl-rect-header">
                <div class="tl-rect-tags">
                  <!-- Mức độ ưu tiên -->
                  <div v-if="file.mucDoUuTien" class="tl-status-chip" :style="{ background: file.mucDoUuTien === 'Cao' ? 'rgba(16,185,129,0.1)' : file.mucDoUuTien === 'Thấp' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: file.mucDoUuTien === 'Cao' ? '#10b981' : file.mucDoUuTien === 'Thấp' ? '#ef4444' : '#f59e0b', border: file.mucDoUuTien === 'Cao' ? '1px solid rgba(16,185,129,0.2)' : file.mucDoUuTien === 'Thấp' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(245,158,11,0.2)' }">
                    Ưu tiên: {{ file.mucDoUuTien }}
                  </div>
                  
                  <!-- Trạng thái xử lý -->
                  <div v-if="file.trangThaiXuLy" class="tl-status-chip" :style="{ background: file.trangThaiXuLy === 'Đã gửi' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: file.trangThaiXuLy === 'Đã gửi' ? '#10b981' : '#f59e0b', border: file.trangThaiXuLy === 'Đã gửi' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(245,158,11,0.2)' }">
                    Xử lý: {{ file.trangThaiXuLy }}
                  </div>

                  <!-- Trạng thái báo giá -->
                  <div v-if="file.trangThaiBaoGia" class="tl-status-chip" :style="{ background: file.trangThaiBaoGia === 'Thành công' ? 'rgba(16,185,129,0.1)' : file.trangThaiBaoGia === 'Thất bại' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: file.trangThaiBaoGia === 'Thành công' ? '#10b981' : file.trangThaiBaoGia === 'Thất bại' ? '#ef4444' : '#f59e0b', border: file.trangThaiBaoGia === 'Thành công' ? '1px solid rgba(16,185,129,0.2)' : file.trangThaiBaoGia === 'Thất bại' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(245,158,11,0.2)' }">
                    Báo giá: {{ file.trangThaiBaoGia }}
                  </div>
                </div>
                <div style="font-weight: 500; color: #f8fafc; margin-top: 1rem; margin-bottom: 0.2rem; font-size: 0.825rem; display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;">
                  <span style="display: inline-flex; align-items: center; gap: 0.35rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    {{ getCustomerNameInfo(file.maKH) }}
                  </span>
                  <span v-if="getCustomerTags(file.maKH).length" v-for="tag in getCustomerTags(file.maKH)" :key="tag" class="tl-badge-tag" style="background: #10b981; color: #ffffff; border: 1px solid #059669; border-radius: 9999px; padding: 0.15rem 0.4rem; font-size: 0.5rem; line-height: 1;">{{ tag }}</span>
                </div>
              </div>
              <div class="tl-rect-body" style="margin-top: 0.5rem; padding-top: 0.8rem; border-top: 1px dashed rgba(255,255,255,0.05);">
                
                <div class="tl-body-text">{{ file.noiDung }}</div>
                
                <div v-if="file.ghiChu && file.ghiChu.trim()" style="margin-top: 0.2rem; font-size: 0.85rem; font-weight: 600; font-style: italic; color: #ef4444;">
                  * Ghi chú: {{ file.ghiChu }}
                </div>
              </div>
              
              <div class="tl-attachments" v-if="file.linkFileBaoGia && file.linkFileBaoGia.length > 0" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; padding: 0 0.5rem;">
                <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                  <template v-if="Array.isArray(file.linkFileBaoGia)">
                    <div v-for="(link, i) in file.linkFileBaoGia" :key="'bg'+i" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                      <a :href="typeof link === 'string' ? link : link.url" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(link)" style="flex: 1; min-width: 0;">
                        <span v-html="getFileIconSvg(link)" style="display: flex; align-items: center;"></span>
                        <span class="attach-text" :title="getFileName(link, 'File', i)">{{ truncateFileName(getFileName(link, 'File', i)) }}</span>
                      </a>
                      <button @click.stop.prevent="handleDownloadClick($event, link, getFileName(link, 'File', i))" title="Tải về" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>
                    </div>
                  </template>
                  <div v-else-if="typeof file.linkFileBaoGia === 'string' && file.linkFileBaoGia !== ''" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                    <a :href="file.linkFileBaoGia" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(file.linkFileBaoGia)" style="flex: 1; min-width: 0;">
                       <span v-html="getFileIconSvg(file.linkFileBaoGia)" style="display: flex; align-items: center;"></span>
                       <span class="attach-text" :title="getFileName(file.linkFileBaoGia, 'File', 0)">{{ truncateFileName(getFileName(file.linkFileBaoGia, 'File', 0)) }}</span>
                    </a>
                    <button @click.stop.prevent="handleDownloadClick($event, file.linkFileBaoGia, getFileName(file.linkFileBaoGia, 'File', 0))" title="Tải về" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="file.linkImgSave && file.linkImgSave.length > 0" style="display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0.5rem 0.5rem 0 0.5rem;">
                <template v-if="Array.isArray(file.linkImgSave)">
                  <a v-for="(link, i) in file.linkImgSave" :key="'img'+i" href="#" @click.stop.prevent="handleDownloadClick($event, link, 'HinhAnh_' + i)" style="width: 45px; height: 45px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    <img :src="link" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                  </a>
                </template>
                <a v-else-if="typeof file.linkImgSave === 'string' && file.linkImgSave !== ''" href="#" @click.stop.prevent="handleDownloadClick($event, file.linkImgSave, 'HinhAnh_0')" style="width: 45px; height: 45px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                  <img :src="file.linkImgSave" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                </a>
              </div>
              
              
              <!-- QUICK ACTIONS -->
              <div class="tl-quick-actions" style="display: flex; align-items: center; gap: 0.4rem; margin-top: auto; padding-top: 0.8rem; border-top: 1px dashed rgba(255,255,255,0.05);">
                
                <div v-if="currentViewCategory === 'mucDoUuTien' || currentViewCategory === 'trangThaiXuLy' || currentViewCategory === 'trangThaiBaoGia'" style="display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;">
                  <!-- Mức độ ưu tiên -->
                  <template v-if="currentViewCategory === 'mucDoUuTien'">
                    <button @click.stop="quickUpdateStatus(file, 'mucDoUuTien', 'Thấp')" class="quick-btn btn-red" :class="{'active': file.mucDoUuTien === 'Thấp'}">Thấp</button>
                    <button @click.stop="quickUpdateStatus(file, 'mucDoUuTien', 'Bình thường')" class="quick-btn btn-orange" :class="{'active': file.mucDoUuTien === 'Bình thường'}">Bình thường</button>
                    <button @click.stop="quickUpdateStatus(file, 'mucDoUuTien', 'Cao')" class="quick-btn btn-green" :class="{'active': file.mucDoUuTien === 'Cao'}">Cao</button>
                  </template>
                  
                  <!-- Trạng thái xử lý -->
                  <template v-if="currentViewCategory === 'trangThaiXuLy'">
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiXuLy', 'Chưa gửi')" class="quick-btn btn-orange" :class="{'active': file.trangThaiXuLy === 'Chưa gửi'}">Chưa gửi</button>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiXuLy', 'Đã gửi')" class="quick-btn btn-green" :class="{'active': file.trangThaiXuLy === 'Đã gửi'}">Đã gửi</button>
                  </template>

                  <!-- Trạng thái báo giá -->
                  <template v-if="currentViewCategory === 'trangThaiBaoGia'">
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiBaoGia', 'Xem xét')" class="quick-btn btn-orange" :class="{'active': file.trangThaiBaoGia === 'Xem xét'}">Xem xét</button>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiBaoGia', 'Thành công')" class="quick-btn btn-green" :class="{'active': file.trangThaiBaoGia === 'Thành công'}">Thành công</button>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiBaoGia', 'Thất bại')" class="quick-btn btn-red" :class="{'active': file.trangThaiBaoGia === 'Thất bại'}">Thất bại</button>
                  </template>
                </div>
                
                <button v-if="hasRelatedFiles(file)" @click.stop="goToFlowViewAndHighlight(file)" type="button" style="margin-left: auto; background: rgba(59,130,246,0.1); color: #3b82f6; border: 1px solid rgba(59,130,246,0.2); padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='#3b82f6'; this.style.color='white'" onmouseout="this.style.background='rgba(59,130,246,0.1)'; this.style.color='#3b82f6'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  Xem file liên kết
                </button>

                <button class="quick-delete-btn" @click.stop="deleteFile(file.id)" title="Xoá file" :style="!hasRelatedFiles(file) ? 'margin-left: auto;' : ''">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="kanban-board" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
          <div v-for="col in kanbanColumns" :key="col.status" class="kanban-column" 
               :class="[col.colClass || 'kb-col-pending', { 'kb-col-drag-over': dragOverColumn === col.status }]" 
               style="background: rgba(15, 23, 34, 0.4); border-radius: 12px; display: flex; flex-direction: column;"
               @dragover.prevent="dragOverColumn = col.status"
               @dragleave="dragOverColumn = null"
               @drop.prevent="onDropFile($event, col.status)">
            <div class="kanban-header" style="padding: 1rem; border-bottom: 1px dashed rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
              <div class="kanban-title" style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="status-dot" :class="col.dotClass" style="width: 10px; height: 10px; border-radius: 50%; display: inline-block;"></span>
                <h3 style="margin: 0; font-size: 1.1rem; color: #f8fafc; font-weight: 800;">{{ col.title }}</h3>
              </div>
              <span class="kanban-badge" style="padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700;">{{ col.files.length }}</span>
            </div>
            
            <div class="kanban-list" style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem; flex: 1; overflow-y: auto;">
              <div v-if="col.files.length === 0" class="empty-state" style="text-align: center; padding: 2rem 1rem;">
                <span style="font-size: 0.8rem; opacity: 0.5; color: #94a3b8;">Trống</span>
              </div>
              
              <div v-else v-for="(file, index) in col.files" :key="'card-' + file.id" 
                   class="report-card-timeline" 
                   :class="{'is-dragging': draggedFileId === file.id}"
                   :style="{ animationDelay: (index * 0.05) + 's', opacity: draggedFileId === file.id ? 0.5 : 1 }"
                   @click="editFile(file)" style="cursor: pointer;"
                   draggable="true"
                   @dragstart="onDragStartFile($event, file.id)"
                   @dragend="draggedFileId = null">
            <!-- Hình tròn: STT + Thời gian -->
            <div class="tl-orb-wrap">
              <div class="tl-orb-ring" :class="'tl-ring--' + getCardColorMode(file)"></div>
              <div class="tl-circle" :class="'tl-circle--' + getCardColorMode(file)">
                <div class="tl-circle-inner">
                  <span class="tl-thu-period">{{ formatDisplayTime(file.createdTime).thu }} <span class="tl-period" :class="formatDisplayTime(file.createdTime).period === 'Sáng' ? 'is-morning' : 'is-afternoon'">{{ formatDisplayTime(file.createdTime).period }}</span></span>
                  <span class="tl-date">{{ formatDisplayTime(file.createdTime).date }}</span>
                  <span class="tl-time">{{ formatDisplayTime(file.createdTime).time }}</span>
                  <span class="tl-stt">#{{ index + 1 }}</span>
                </div>
              </div>
              <div class="tl-orbit-trail"></div>
            </div>
            <!-- Connector -->
            <div class="tl-connector" :class="'tl-conn--' + getCardColorMode(file)">
              <div class="tl-conn-dot"></div>
              <div class="tl-beam-particle" :class="'tl-beam--' + getCardColorMode(file)"></div>
            </div>
            <!-- Hình chữ nhật: Nội dung còn lại -->
            <div class="tl-rect" :class="['tl-rect--' + getCardColorMode(file), 'tl-border--' + getCardColorMode(file)]">
              <div class="tl-shimmer-border" :class="'tl-shimmer--' + getCardColorMode(file)"></div>
              <div class="tl-rect-header">
                <div class="tl-rect-tags">
                  <!-- Mức độ ưu tiên -->
                  <div v-if="file.mucDoUuTien" class="tl-status-chip" :style="{ background: file.mucDoUuTien === 'Cao' ? 'rgba(16,185,129,0.1)' : file.mucDoUuTien === 'Thấp' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: file.mucDoUuTien === 'Cao' ? '#10b981' : file.mucDoUuTien === 'Thấp' ? '#ef4444' : '#f59e0b', border: file.mucDoUuTien === 'Cao' ? '1px solid rgba(16,185,129,0.2)' : file.mucDoUuTien === 'Thấp' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(245,158,11,0.2)' }">
                    Ưu tiên: {{ file.mucDoUuTien }}
                  </div>
                  
                  <!-- Trạng thái xử lý -->
                  <div v-if="file.trangThaiXuLy" class="tl-status-chip" :style="{ background: file.trangThaiXuLy === 'Đã gửi' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: file.trangThaiXuLy === 'Đã gửi' ? '#10b981' : '#f59e0b', border: file.trangThaiXuLy === 'Đã gửi' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(245,158,11,0.2)' }">
                    Xử lý: {{ file.trangThaiXuLy }}
                  </div>

                  <!-- Trạng thái báo giá -->
                  <div v-if="file.trangThaiBaoGia" class="tl-status-chip" :style="{ background: file.trangThaiBaoGia === 'Thành công' ? 'rgba(16,185,129,0.1)' : file.trangThaiBaoGia === 'Thất bại' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: file.trangThaiBaoGia === 'Thành công' ? '#10b981' : file.trangThaiBaoGia === 'Thất bại' ? '#ef4444' : '#f59e0b', border: file.trangThaiBaoGia === 'Thành công' ? '1px solid rgba(16,185,129,0.2)' : file.trangThaiBaoGia === 'Thất bại' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(245,158,11,0.2)' }">
                    Báo giá: {{ file.trangThaiBaoGia }}
                  </div>
                </div>
                <div style="font-weight: 500; color: #f8fafc; margin-top: 1rem; margin-bottom: 0.2rem; font-size: 0.825rem; display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;">
                  <span style="display: inline-flex; align-items: center; gap: 0.35rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    {{ getCustomerNameInfo(file.maKH) }}
                  </span>
                  <span v-if="getCustomerTags(file.maKH).length" v-for="tag in getCustomerTags(file.maKH)" :key="tag" class="tl-badge-tag" style="background: #10b981; color: #ffffff; border: 1px solid #059669; border-radius: 9999px; padding: 0.15rem 0.4rem; font-size: 0.5rem; line-height: 1;">{{ tag }}</span>
                </div>
              </div>
              <div class="tl-rect-body" style="margin-top: 0.5rem; padding-top: 0.8rem; border-top: 1px dashed rgba(255,255,255,0.05);">
                
                <div class="tl-body-text">{{ file.noiDung }}</div>
                
                <div v-if="file.ghiChu && file.ghiChu.trim()" style="margin-top: 0.2rem; font-size: 0.85rem; font-weight: 600; font-style: italic; color: #ef4444;">
                  * Ghi chú: {{ file.ghiChu }}
                </div>
              </div>
              
              <div class="tl-attachments" v-if="file.linkFileBaoGia && file.linkFileBaoGia.length > 0" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; padding: 0 0.5rem;">
                <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                  <template v-if="Array.isArray(file.linkFileBaoGia)">
                    <div v-for="(link, i) in file.linkFileBaoGia" :key="'bg'+i" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                      <a :href="typeof link === 'string' ? link : link.url" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(link)" style="flex: 1; min-width: 0;">
                        <span v-html="getFileIconSvg(link)" style="display: flex; align-items: center;"></span>
                        <span class="attach-text" :title="getFileName(link, 'File', i)">{{ truncateFileName(getFileName(link, 'File', i)) }}</span>
                      </a>
                      <button @click.stop.prevent="handleDownloadClick($event, link, getFileName(link, 'File', i))" title="Tải về" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>
                    </div>
                  </template>
                  <div v-else-if="typeof file.linkFileBaoGia === 'string' && file.linkFileBaoGia !== ''" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                    <a :href="file.linkFileBaoGia" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(file.linkFileBaoGia)" style="flex: 1; min-width: 0;">
                       <span v-html="getFileIconSvg(file.linkFileBaoGia)" style="display: flex; align-items: center;"></span>
                       <span class="attach-text" :title="getFileName(file.linkFileBaoGia, 'File', 0)">{{ truncateFileName(getFileName(file.linkFileBaoGia, 'File', 0)) }}</span>
                    </a>
                    <button @click.stop.prevent="handleDownloadClick($event, file.linkFileBaoGia, getFileName(file.linkFileBaoGia, 'File', 0))" title="Tải về" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="file.linkImgSave && file.linkImgSave.length > 0" style="display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0.5rem 0.5rem 0 0.5rem;">
                <template v-if="Array.isArray(file.linkImgSave)">
                  <a v-for="(link, i) in file.linkImgSave" :key="'img'+i" :href="link" target="_blank" @click.stop style="width: 45px; height: 45px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    <img :src="link" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                  </a>
                </template>
                <a v-else-if="typeof file.linkImgSave === 'string' && file.linkImgSave !== ''" :href="file.linkImgSave" target="_blank" @click.stop style="width: 45px; height: 45px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                  <img :src="file.linkImgSave" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                </a>
              </div>
              
              
              <!-- QUICK ACTIONS -->
              <div class="tl-quick-actions" style="display: flex; align-items: center; gap: 0.4rem; margin-top: auto; padding-top: 0.8rem; border-top: 1px dashed rgba(255,255,255,0.05);">
                
                <div v-if="currentViewCategory === 'mucDoUuTien' || currentViewCategory === 'trangThaiXuLy' || currentViewCategory === 'trangThaiBaoGia'" style="display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;">
                  <!-- Mức độ ưu tiên -->
                  <template v-if="currentViewCategory === 'mucDoUuTien'">
                    <button @click.stop="quickUpdateStatus(file, 'mucDoUuTien', 'Thấp')" class="quick-btn btn-red" :class="{'active': file.mucDoUuTien === 'Thấp'}">Thấp</button>
                    <button @click.stop="quickUpdateStatus(file, 'mucDoUuTien', 'Bình thường')" class="quick-btn btn-orange" :class="{'active': file.mucDoUuTien === 'Bình thường'}">Bình thường</button>
                    <button @click.stop="quickUpdateStatus(file, 'mucDoUuTien', 'Cao')" class="quick-btn btn-green" :class="{'active': file.mucDoUuTien === 'Cao'}">Cao</button>
                  </template>
                  
                  <!-- Trạng thái xử lý -->
                  <template v-if="currentViewCategory === 'trangThaiXuLy'">
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiXuLy', 'Chưa gửi')" class="quick-btn btn-orange" :class="{'active': file.trangThaiXuLy === 'Chưa gửi'}">Chưa gửi</button>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiXuLy', 'Đã gửi')" class="quick-btn btn-green" :class="{'active': file.trangThaiXuLy === 'Đã gửi'}">Đã gửi</button>
                  </template>

                  <!-- Trạng thái báo giá -->
                  <template v-if="currentViewCategory === 'trangThaiBaoGia'">
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiBaoGia', 'Xem xét')" class="quick-btn btn-orange" :class="{'active': file.trangThaiBaoGia === 'Xem xét'}">Xem xét</button>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiBaoGia', 'Thành công')" class="quick-btn btn-green" :class="{'active': file.trangThaiBaoGia === 'Thành công'}">Thành công</button>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiBaoGia', 'Thất bại')" class="quick-btn btn-red" :class="{'active': file.trangThaiBaoGia === 'Thất bại'}">Thất bại</button>
                  </template>
                </div>
                
                <button class="quick-delete-btn" @click.stop="deleteFile(file.id)" title="Xoá file" style="margin-left: auto;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>

              <!-- FILE LIÊN KẾT (FULL WIDTH ROW) -->
              <div v-if="hasRelatedFiles(file)" style="margin-top: 0.6rem;">
                <button @click.stop="goToFlowViewAndHighlight(file)" type="button" style="width: 100%; justify-content: center; background: rgba(59,130,246,0.1); color: #3b82f6; border: 1px solid rgba(59,130,246,0.2); padding: 8px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='#3b82f6'; this.style.color='white'" onmouseout="this.style.background='rgba(59,130,246,0.1)'; this.style.color='#3b82f6'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  Xem các file đã liên kết
                </button>
              </div>
            </div>
          </div>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Thêm/Sửa (Minh họa) -->
    <div v-if="isModalOpen" class="elite-modal-overlay" @click.self="closeModal" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 50;">
      <div class="elite-modal report-form-modal">
        <div class="elite-modal-header">
          <div class="elite-modal-title" style="display: flex; align-items: flex-start; gap: 0.6rem;"><h2>{{ editingId ? 'Sửa File' : 'Thêm File Mới' }}</h2></div>
          <button class="elite-btn-close" @click="closeModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div class="elite-modal-body pc-grid-layout" style="margin-top: 1.5rem;">
          <!-- Cột 1: Thông tin khách hàng & Phân loại -->
          <div class="pc-col pc-col-1">
            <div class="elite-form-group" style="background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 1rem;">
              <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label style="color: #475569; margin: 0; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Khách Hàng *</label>
                  <button @click="customerSelectMode = 'form'; isCustomerSelectModalOpen = true; customerSearchQuery = '';" type="button" style="background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-weight: 600; white-space: nowrap; transition: background 0.2s; font-size: 0.85rem;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">
                    {{ formData.maKH ? 'Thay đổi KH' : 'Chọn KH' }}
                  </button>
                </div>
                <div style="min-width: 0;">
                  <div v-if="!formData.maKH" style="color: #94a3b8; font-style: italic; font-size: 0.95rem;">Chưa chọn khách hàng</div>
                  <div v-else style="display: flex; flex-direction: column; gap: 6px;">
                    <div style="color: #0f172a; font-weight: 700; font-size: 1.05rem; white-space: pre-wrap; word-break: break-word;">
                      {{ getSelectedCustomerDisplay() }}
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                      <span v-for="tag in getSelectedCustomerTags()" :key="tag" style="background: rgba(16, 185, 129, 0.15); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; padding: 2px 8px; font-size: 0.75rem; font-weight: 700;">
                        {{ tag }}
                      </span>
                      <span v-if="!getSelectedCustomerTags().length" style="color: #94a3b8; font-size: 0.75rem; font-style: italic;">Chưa phân loại nhóm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="elite-form-group" style="background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 1rem;">
              <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label style="color: #475569; margin: 0; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Liên kết File (Tùy chọn)</label>
                  <div style="display: flex; gap: 0.5rem;">
                    <button v-if="formData.idPrevious" @click="formData.idPrevious = ''" type="button" style="background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; padding: 0.4rem 0.6rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background 0.2s; font-size: 0.85rem;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                      Xóa
                    </button>
                    <button @click="isFileSelectModalOpen = true; fileSearchQuery = '';" type="button" style="background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-weight: 600; white-space: nowrap; transition: background 0.2s; font-size: 0.85rem;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">
                      {{ formData.idPrevious ? 'Đổi File' : 'Chọn File' }}
                    </button>
                  </div>
                </div>
                <div style="min-width: 0;">
                  <div v-if="!formData.idPrevious" style="color: #94a3b8; font-style: italic; font-size: 0.95rem;">Chưa chọn file liên kết</div>
                  <div v-else-if="selectedLinkedFile" @click="handleLinkedFileClick(selectedLinkedFile)" style="display: flex; flex-direction: column; gap: 6px; cursor: pointer; padding: 4px; border-radius: 6px; transition: background 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
                    <div style="color: #0f172a; font-weight: 700; font-size: 0.95rem; white-space: pre-wrap; word-break: break-word;">
                      {{ selectedLinkedFile.noiDung || 'Không có nội dung' }}
                    </div>
                    <div v-if="selectedLinkedFile.ghiChu" style="color: #ef4444; font-size: 0.85rem; font-style: italic; font-weight: 600; white-space: pre-wrap; word-break: break-word;">
                      * Ghi chú: {{ selectedLinkedFile.ghiChu }}
                    </div>
                  </div>
                  <div v-else style="color: #ef4444; font-style: italic; font-size: 0.95rem;">File liên kết không tồn tại</div>
                </div>
              </div>
            </div>

          </div>
          
          <!-- Cột 2: Nội dung chính & Trạng thái -->
          <div class="pc-col pc-col-2" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="flex: 1; display: flex; flex-direction: column; gap: 1rem;">
              <div class="elite-form-group" style="flex: 1; margin-bottom: 0; display: flex; flex-direction: column;">
                <label>Nội dung File</label>
                <textarea v-model="formData.noiDung" class="elite-textarea" style="flex: 1; min-height: 120px; resize: none;" placeholder="Nhập nội dung chi tiết..."></textarea>
              </div>
              <div class="elite-form-group" style="margin-bottom: 0;">
                <label>Ghi chú (Tùy chọn)</label>
                <input type="text" v-model="formData.ghiChu" class="elite-input" placeholder="Nhập ghi chú (sẽ hiển thị chữ đỏ)..." style="color: #ef4444; font-weight: 600;" />
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
              <div class="elite-form-group" style="margin-bottom: 0;">
                <label style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; display: block;">Ưu tiên</label>
                <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                  <button v-for="st in ['Thấp', 'Bình thường', 'Cao']" :key="st" type="button" @click="formData.mucDoUuTien = st" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f8fafc; color: #475569; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: center;" :style="formData.mucDoUuTien === st ? (st === 'Thấp' ? 'background: #ef4444; color: white; border-color: #ef4444; font-weight: 700;' : st === 'Bình thường' ? 'background: #f59e0b; color: white; border-color: #f59e0b; font-weight: 700;' : 'background: #10b981; color: white; border-color: #10b981; font-weight: 700;') : ''"  >
                    {{ st }}
                  </button>
                </div>
              </div>
              <div class="elite-form-group" style="margin-bottom: 0;">
                <label style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; display: block;">TT Xử lý</label>
                <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                  <button v-for="st in ['Chưa gửi', 'Đã gửi']" :key="st" type="button" @click="formData.trangThaiXuLy = st" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f8fafc; color: #475569; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: center;" :style="formData.trangThaiXuLy === st ? (st === 'Đã gửi' ? 'background: #10b981; color: white; border-color: #10b981; font-weight: 700;' : 'background: #f59e0b; color: white; border-color: #f59e0b; font-weight: 700;') : ''"  >
                    {{ st }}
                  </button>
                </div>
              </div>
              <div class="elite-form-group" style="margin-bottom: 0;">
                <label style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; display: block;">TT Báo giá</label>
                <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                  <button v-for="st in ['Thất bại', 'Xem xét', 'Thành công']" :key="st" type="button" @click="formData.trangThaiBaoGia = st" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f8fafc; color: #475569; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: center;" :style="formData.trangThaiBaoGia === st ? (st === 'Thành công' ? 'background: #10b981; color: white; border-color: #10b981; font-weight: 700;' : st === 'Thất bại' ? 'background: #ef4444; color: white; border-color: #ef4444; font-weight: 700;' : 'background: #f59e0b; color: white; border-color: #f59e0b; font-weight: 700;') : ''"  >
                    {{ st }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Cột 3: Đính kèm -->
          <div class="pc-col pc-col-3">
            
            <div class="elite-form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="margin-bottom: 0;">File đính kèm</label>
                <label style="background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.8rem; transition: background 0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">
                  + Chọn File
                  <input type="file" multiple @change="handleFileUpload" style="display: none;" />
                </label>
              </div>
              <div v-if="isUploadingFile" style="color: #f59e0b; margin-top: 4px; font-size: 12px;">Đang tải lên File...</div>
              <div v-if="formData.linkFileBaoGia && formData.linkFileBaoGia.length > 0" style="margin-top: 8px;">
                <div v-for="(link, idx) in formData.linkFileBaoGia" :key="'up-f'+idx" style="display: flex; align-items: center; gap: 8px; background: #f1f5f9; padding: 6px 10px; border-radius: 4px; margin-bottom: 4px;">
                  <input type="text" v-model="link.name" class="elite-input" style="flex: 1; padding: 4px 8px; font-size: 13px; min-width: 0;" placeholder="Nhập tên file..." />
                  <a href="#" @click.stop.prevent="handleDownloadClick($event, link, 'FileBaoGia')" style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-decoration: none; display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Tải về
                  </a>
                  <button @click="removeFile(idx)" type="button" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-weight: bold; font-size: 16px; flex-shrink: 0;">✕</button>
                </div>
              </div>
            </div>

            <div class="elite-form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="margin-bottom: 0;">Ảnh đính kèm</label>
                <label style="background: #fdf4ff; color: #d946ef; border: 1px solid #fbcfe8; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.8rem; transition: background 0.2s;" onmouseover="this.style.background='#fae8ff'" onmouseout="this.style.background='#fdf4ff'">
                  + Chọn Ảnh
                  <input type="file" multiple accept="image/*" @change="handleImageUpload" style="display: none;" />
                </label>
              </div>
              <div v-if="isUploadingImage" style="color: #f59e0b; margin-top: 4px; font-size: 12px;">Đang tải lên Ảnh...</div>
              <div v-if="formData.linkImgSave && formData.linkImgSave.length > 0" style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                <div v-for="(img, idx) in formData.linkImgSave" :key="'up-i'+idx" style="display: flex; align-items: center; gap: 8px; background: #f1f5f9; padding: 6px 10px; border-radius: 4px;">
                  <img :src="img.url || img" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1; flex-shrink: 0;" />
                  <input type="text" v-model="img.name" class="elite-input" style="flex: 1; padding: 4px 8px; font-size: 13px; min-width: 0;" placeholder="Nhập tên ảnh..." />
                  <a :href="getViewUrl(img.url || img)" target="_blank" style="color: #3b82f6; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 4px; flex-shrink: 0;" title="Xem ảnh">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </a>
                  <a href="#" @click.stop.prevent="handleDownloadClick($event, img, 'HinhAnh')" style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-decoration: none; display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Tải về
                  </a>
                  <button @click="removeImage(idx)" type="button" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-weight: bold; font-size: 16px; flex-shrink: 0;">✕</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="elite-modal-actions" style="margin-top: 1rem; padding: 1rem 1.5rem 1.5rem 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid #e2e8f0;">
          <button class="elite-btn-cancel" @click="closeModal">Hủy</button>
          <button v-if="!editingId" class="elite-btn-save" @click="saveFile" :disabled="isUploadingFile || isUploadingImage" style="background: #3b82f6; border-color: #3b82f6; padding: 0.6rem 1.5rem;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'" :style="{ opacity: (isUploadingFile || isUploadingImage) ? 0.5 : 1 }">Tạo Mới File</button>
          <button v-else-if="isFileDataChanged" class="elite-btn-save" @click="saveFile" :disabled="isUploadingFile || isUploadingImage" style="background: #10b981; border-color: #10b981; padding: 0.6rem 1.5rem;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'" :style="{ opacity: (isUploadingFile || isUploadingImage) ? 0.5 : 1 }">Lưu Thay Đổi</button>
        </div>
      </div>
    </div>

    
    <!-- Modal Cảnh báo Khác Khách Hàng -->
    <div v-if="isWarningCustomerModalOpen" class="elite-modal-overlay" @click.self="isWarningCustomerModalOpen = false" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 70; background: rgba(0,0,0,0.6);">
      <div class="elite-modal" style="width: 450px; max-width: 95%; background: #ffffff; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <div class="elite-modal-header" style="padding: 1rem 1.5rem; background: #fee2e2; border-bottom: 1px solid #fecaca; display: flex; align-items: center; gap: 0.8rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <h3 style="margin: 0; color: #991b1b; font-size: 1.1rem; font-weight: 700;">Cảnh báo Khác Khách Hàng</h3>
        </div>
        
        <div style="padding: 1.5rem; background: #f8fafc; color: #334155; font-size: 0.95rem; line-height: 1.5;">
          Bạn đang cố liên kết với một File thuộc về <strong>Khách hàng khác</strong> (<span style="color: #ef4444;">{{ pendingLinkedFile?.maKH }}</span> thay vì <span style="color: #3b82f6;">{{ formData.maKH }}</span>).<br/><br/>
          Bạn có chắc chắn muốn thực hiện liên kết này không?
        </div>

        <div class="elite-modal-actions" style="padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; background: #ffffff;">
          <button @click="isWarningCustomerModalOpen = false" class="elite-btn-cancel" style="padding: 0.5rem 1.2rem; background: #f1f5f9; color: #64748b; border-radius: 6px; font-weight: 600;">Hủy</button>
          <button @click="confirmLinkedFile" class="elite-btn-save" style="padding: 0.5rem 1.2rem; background: #ef4444; color: white; border-radius: 6px; font-weight: 600; border: none;">Vẫn Liên kết</button>
        </div>
      </div>
    </div>
    
    <!-- Modal Chọn File Liên Kết -->
    <div v-if="isFileSelectModalOpen" class="elite-modal-overlay" @click.self="isFileSelectModalOpen = false" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 60; background: rgba(0,0,0,0.6);">
      <div class="elite-modal" style="width: 700px; max-width: 95%; background: #ffffff; border-radius: 12px; display: flex; flex-direction: column; max-height: 85vh; padding: 0;">
        <div class="elite-modal-header" style="padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; color: #0f172a; font-size: 1.1rem;">Chọn File Liên Kết</h3>
          <button class="elite-btn-close" @click="isFileSelectModalOpen = false" style="background: transparent; border: none; cursor: pointer; color: #64748b;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div style="padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
          <input type="text" v-model="fileSearchQuery" placeholder="Nhập nội dung hoặc mã KH..." class="elite-input" style="width: 100%; padding: 0.6rem 1rem; border: 1px solid #cbd5e1; border-radius: 6px;" />
        </div>

        <div style="flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; background: #0f172a; max-height: 60vh;">
          <div v-if="filteredModalFiles.length === 0" style="text-align: center; color: #94a3b8; margin-top: 2rem;">Không tìm thấy file nào.</div>
          
          <div v-for="f in filteredModalFiles" :key="f.id" @click="selectLinkedFile(f)" style="cursor: pointer; box-sizing: border-box; align-self: stretch; border-radius: 12px; padding: 12px 16px; background: linear-gradient(180deg, rgba(15,23,34,0.95) 0%, rgba(15,23,34,0.85) 100%); border: 3px solid rgba(16,185,129,0.8); box-shadow: 0 0 15px rgba(16,185,129,0.4); position: relative; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-4px) scale(1.015)'; this.style.filter='brightness(1.1)';" onmouseout="this.style.transform='none'; this.style.filter='none';">
            <div style="display: flex; flex-direction: column;">
              <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                <span style="padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; display: inline-flex; align-items: center; background: rgba(148,163,184,0.1); color: #94a3b8; border: 1px solid rgba(148,163,184,0.2);">
                  {{ formatDisplayTime(f.createdTime).time }} - {{ formatDisplayTime(f.createdTime).date }}
                </span>
                <span v-if="f.mucDoUuTien" style="padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; display: inline-flex; align-items: center; background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2);">{{ f.mucDoUuTien }}</span>
                <span v-if="f.trangThaiXuLy" style="padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; display: inline-flex; align-items: center; background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2);">{{ f.trangThaiXuLy }}</span>
                <span v-if="f.trangThaiBaoGia" style="padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; display: inline-flex; align-items: center;" :style="f.trangThaiBaoGia === 'Thành công' ? 'background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);' : (f.trangThaiBaoGia === 'Thất bại' ? 'background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);' : 'background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2);')">
                  {{ f.trangThaiBaoGia }}
                </span>
              </div>
            </div>
            <div style="margin-top: 0.5rem; padding-top: 0.8rem; border-top: 1px dashed rgba(255,255,255,0.1);">
              <div v-if="f.maKH" style="color: #60a5fa; font-weight: 700; font-size: 0.9rem; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.3rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                {{ getCustomerNameInfo(f.maKH) }}
              </div>
              <div style="color: #f8fafc; font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">{{ f.noiDung }}</div>
              <div v-if="f.ghiChu" style="margin-top: 0.4rem; font-size: 0.85rem; font-weight: 600; font-style: italic; color: #ef4444;">* Ghi chú: {{ f.ghiChu }}</div>
              
              <div class="tl-attachments" v-if="(f.linkFileBaoGia && f.linkFileBaoGia.length > 0) || (f.linkImgSave && f.linkImgSave.length > 0)" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.8rem; padding-top: 0.5rem; border-top: 1px dashed rgba(255,255,255,0.05);">
                <div v-if="f.linkFileBaoGia && f.linkFileBaoGia.length > 0" style="display: flex; flex-direction: column; gap: 0.4rem;">
                  <template v-if="Array.isArray(f.linkFileBaoGia)">
                    <div v-for="(link, i) in f.linkFileBaoGia" :key="'bg'+i" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                      <a :href="typeof link === 'string' ? link : link.url" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(link)" style="flex: 1; min-width: 0;">
                        <span v-html="getFileIconSvg(link)" style="display: flex; align-items: center;"></span>
                        <span class="attach-text" :title="getFileName(link, 'File', i)">{{ truncateFileName(getFileName(link, 'File', i)) }}</span>
                      </a>
                      <button @click.stop.prevent="handleDownloadClick($event, typeof link === 'string' ? link : link.url, getFileName(link, 'File', i))" title="Tải về" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>
                    </div>
                  </template>
                  <div v-else-if="typeof f.linkFileBaoGia === 'string' && f.linkFileBaoGia !== ''" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                    <a :href="f.linkFileBaoGia" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(f.linkFileBaoGia)" style="flex: 1; min-width: 0;">
                       <span v-html="getFileIconSvg(f.linkFileBaoGia)" style="display: flex; align-items: center;"></span>
                       <span class="attach-text" :title="getFileName(f.linkFileBaoGia, 'File', 0)">{{ truncateFileName(getFileName(f.linkFileBaoGia, 'File', 0)) }}</span>
                    </a>
                    <button @click.stop.prevent="handleDownloadClick($event, f.linkFileBaoGia, getFileName(f.linkFileBaoGia, 'File', 0))" title="Tải về" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                  </div>
                </div>
                
                <div v-if="f.linkImgSave && f.linkImgSave.length > 0" style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                  <template v-if="Array.isArray(f.linkImgSave)">
                    <a v-for="(link, i) in f.linkImgSave" :key="'img'+i" :href="typeof link === 'string' ? link : link.url" target="_blank" @click.stop class="attach-badge badge-image" style="flex: 1; min-width: 0; display: flex; align-items: center; gap: 0.4rem;">
                      <img :src="typeof link === 'string' ? link : link.url" style="width: 24px; height: 24px; object-fit: cover; border-radius: 4px; flex-shrink: 0; background: rgba(0,0,0,0.2);" />
                      <span class="attach-text" :title="getFileName(link, 'Hình ảnh', i)">{{ truncateFileName(getFileName(link, 'Hình ảnh', i)) }}</span>
                    </a>
                  </template>
                  <a v-else-if="typeof f.linkImgSave === 'string' && f.linkImgSave !== ''" :href="f.linkImgSave" target="_blank" @click.stop class="attach-badge badge-image" style="flex: 1; min-width: 0; display: flex; align-items: center; gap: 0.4rem;">
                    <img :src="f.linkImgSave" style="width: 24px; height: 24px; object-fit: cover; border-radius: 4px; flex-shrink: 0; background: rgba(0,0,0,0.2);" />
                    <span class="attach-text" :title="getFileName(f.linkImgSave, 'Hình ảnh', 0)">{{ truncateFileName(getFileName(f.linkImgSave, 'Hình ảnh', 0)) }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Modal Quản lý Tag -->
    <div v-if="isTagModalOpen" class="elite-modal-overlay" @click.self="isTagModalOpen = false" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 70;">
      <div class="elite-modal report-form-modal" style="width: 95%; max-width: 500px;">
        <div class="elite-modal-header">
          <div class="elite-modal-title" style="display: flex; align-items: flex-start; gap: 0.6rem;"><h2>Quản lý Nhóm Khách Hàng</h2></div>
          <button class="elite-btn-close" @click="isTagModalOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div class="elite-modal-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Thêm tag mới -->
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" v-model="tempTagKH" @keyup.enter="addNewTagFromInput" placeholder="Nhập tên nhóm mới..." class="elite-input" style="flex: 1;" />
            <button type="button" @click="addNewTagFromInput" class="elite-btn-save" style="padding: 0 1rem; border-radius: 6px; font-weight: 600;">Thêm Mới</button>
          </div>

          <!-- Danh sách tag để sửa/xóa -->
          <div>
            <h4 style="margin: 0 0 0.8rem 0; color: #475569; font-size: 13px;">Tất cả nhóm hiện có</h4>
            <div v-if="availableTags.length === 0" style="color: #94a3b8; font-size: 13px; font-style: italic;">Chưa có nhóm nào.</div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 300px; overflow-y: auto; padding-right: 0.5rem;">
              <div v-for="tag in availableTags" :key="tag.id" style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.5rem 0.8rem; border-radius: 6px;">
                
                <div v-if="editingTagId === tag.name" style="display: flex; gap: 0.5rem; flex: 1; margin-right: 1rem;">
                  <input type="text" v-model="editTagValue" class="elite-input" style="flex: 1; padding: 4px 8px; font-size: 13px;" />
                  <button @click="saveTagEdit(tag.name)" class="elite-btn-save" style="padding: 4px 10px; font-size: 12px; border-radius: 4px;">Lưu</button>
                  <button @click="editingTagId = null" class="elite-btn-cancel" style="padding: 4px 10px; font-size: 12px; border-radius: 4px;">Hủy</button>
                </div>
                
                <span v-else style="font-weight: 600; color: #334155; font-size: 13px;">{{ tag.name }}</span>
                
                <div v-if="editingTagId !== tag.name" style="display: flex; gap: 0.4rem;">
                  <button @click="startEditTag(tag.name)" type="button" style="background: transparent; border: none; color: #3b82f6; cursor: pointer; padding: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
                  </button>
                  <button @click="deleteTagGlobal(tag.name)" type="button" style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Chọn Khách Hàng -->
    <div v-if="isCustomerSelectModalOpen" class="elite-modal-overlay" @click.self="isCustomerSelectModalOpen = false" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 60; background: rgba(0,0,0,0.6);">
      <div class="elite-modal" style="width: 500px; max-width: 90%; background: #ffffff; border-radius: 12px; display: flex; flex-direction: column; max-height: 85vh; padding: 0;">
        <div class="elite-modal-header" style="padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; color: #0f172a; font-size: 1.1rem;">Chọn Khách Hàng</h3>
          <button class="elite-btn-close" @click="isCustomerSelectModalOpen = false" style="background: transparent; border: none; cursor: pointer; color: #64748b;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div style="padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; gap: 1rem; align-items: center; background: #f8fafc;">
          <input type="text" v-model="customerSearchQuery" placeholder="Nhập tên, công ty hoặc mã KH..." class="elite-input" style="flex: 1; padding: 0.6rem 1rem; border: 1px solid #cbd5e1; border-radius: 6px;" />
          <button @click="openCustomerModal(); isCustomerSelectModalOpen = false;" style="background: #10b981; color: #ffffff; border: none; padding: 0.6rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; white-space: nowrap; transition: background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
            + Thêm Mới
          </button>
        </div>

        <div style="flex: 1; overflow-y: auto; padding: 0.5rem 0; max-height: 380px;">
          <!-- Nút chọn tất cả khách hàng khi ở chế độ filter -->
          <div v-if="customerSelectMode === 'filter'" style="padding: 0.75rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s; cursor: pointer; background: #eff6ff;" @click="selectCustomer(null)" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">
            <div style="font-weight: 700; color: #3b82f6; font-size: 1rem;">Tất cả khách hàng</div>
            <div style="display: flex; gap: 8px;">
              <button style="background: transparent; color: #3b82f6; border: none; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                Chọn
              </button>
            </div>
          </div>
          
          <div v-if="filteredCustomers.length === 0" style="text-align: center; color: #64748b; margin-top: 2rem;">Không tìm thấy khách hàng nào.</div>
          <div v-for="cus in filteredCustomers" :key="cus.id" style="padding: 0.75rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="font-weight: 600; color: #0f172a; font-size: 1rem;">{{ cus.ten_khach_hang }} <span v-if="cus.ten_cong_ty" style="color: #64748b; font-weight: 400;">- {{ cus.ten_cong_ty }}</span></div>
              <div style="font-size: 0.85rem; color: #64748b;">Mã KH: <span style="font-weight: 500; color: #3b82f6;">{{ cus.ma_khach_hang }}</span></div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button @click.stop="editCustomerInfo(cus)" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='#e2e8f0'; this.style.color='#0f172a'" onmouseout="this.style.background='#f1f5f9'; this.style.color='#475569'">
                Sửa
              </button>
              <button @click.stop="selectCustomer(cus)" style="background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='#dbeafe'; this.style.color='#2563eb'" onmouseout="this.style.background='#eff6ff'; this.style.color='#3b82f6'">
                Chọn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Thêm Khách Hàng Mới -->
    <div v-if="isCustomerModalOpen" class="elite-modal-overlay" @click.self="isCustomerModalOpen = false" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 60;">
      <div class="elite-modal report-form-modal customer-modal">
        <div class="elite-modal-header">
          <div class="elite-modal-title" style="display: flex; align-items: flex-start; gap: 0.6rem;"><h2>{{ customerFormData.id ? 'Sửa Khách Hàng' : 'Tạo Khách Hàng Mới' }}</h2></div>
          <button class="elite-btn-close" @click="isCustomerModalOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <!-- THÔNG TIN CÁ NHÂN -->
          <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; margin-bottom: 1rem;">Thông tin Đại diện</h3>
            
            <div style="margin-bottom: 1rem;">
              <label style="font-weight: 600; font-size: 13px; color: #475569;">Mã Khách Hàng *</label>
              <input type="text" v-model="customerFormData.ma_khach_hang" class="elite-input" placeholder="VD: KH-001" :disabled="!!customerFormData.id" :style="customerFormData.id ? 'background: #f1f5f9; cursor: not-allowed; color: #64748b;' : ''" />
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label style="font-weight: 600; font-size: 13px; color: #475569; margin-bottom: 4px; display: block;">Tên Khách Hàng *</label>
                <input type="text" v-model="customerFormData.ten_khach_hang" class="elite-input" placeholder="VD: Nguyễn Văn A" />
              </div>
              
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <label style="font-weight: 600; font-size: 13px; color: #475569;">Nhóm Khách Hàng</label>
                  <button @click="isTagModalOpen = true" type="button" style="background: #e0e7ff; color: #4338ca; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; display: flex; align-items: center; gap: 4px;">
                    Quản lý Nhóm
                  </button>
                </div>
                <div v-if="availableTags.length > 0" style="margin-top: 0.4rem;">
                  <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                    <button type="button" v-for="tag in availableTags" :key="tag.id" 
                            @click="toggleTag(tag.name)"
                            style="border: 1px solid #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; transition: all 0.2s; font-weight: 600;"
                            :style="{ 
                              background: customerFormData.tagKH?.includes(tag.name) ? '#10b981' : 'transparent',
                              color: customerFormData.tagKH?.includes(tag.name) ? 'white' : '#475569',
                              borderColor: customerFormData.tagKH?.includes(tag.name) ? '#10b981' : '#e2e8f0'
                            }">
                      {{ tag.name }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label style="font-weight: 600; font-size: 13px; color: #475569;">SĐT Cá nhân</label>
                <input type="text" v-model="customerFormData.so_dien_thoai_ca_nhan" class="elite-input" />
              </div>
              <div>
                <label style="font-weight: 600; font-size: 13px; color: #475569;">Email Cá nhân</label>
                <input type="email" v-model="customerFormData.email_ca_nhan" class="elite-input" />
              </div>
            </div>

            <div style="margin-bottom: 1rem;">
              <label style="font-weight: 600; font-size: 13px; color: #475569;">Tên Khách Hàng Phụ</label>
              <input type="text" v-model="customerFormData.ten_khach_hang_phu" class="elite-input" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="font-weight: 600; font-size: 13px; color: #475569;">SĐT Cá nhân Phụ</label>
                <input type="text" v-model="customerFormData.so_dien_thoai_ca_nhan_phu" class="elite-input" />
              </div>
              <div>
                <label style="font-weight: 600; font-size: 13px; color: #475569;">Email Cá nhân Phụ</label>
                <input type="email" v-model="customerFormData.email_ca_nhan_phu" class="elite-input" />
              </div>
            </div>
          </div>

          <!-- THÔNG TIN CÔNG TY -->
          <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; margin-bottom: 1rem;">Thông tin Công ty</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label style="font-weight: 600; font-size: 13px; color: #475569;">Mã Công Ty</label>
                <input type="text" v-model="customerFormData.ma_cong_ty" class="elite-input" :disabled="!!customerFormData.id" :style="customerFormData.id ? 'background: #f1f5f9; cursor: not-allowed; color: #64748b;' : ''" />
              </div>
              <div>
                <label style="font-weight: 600; font-size: 13px; color: #475569;">Tên Công Ty</label>
                <input type="text" v-model="customerFormData.ten_cong_ty" class="elite-input" />
              </div>
            </div>

            <div style="margin-bottom: 1rem;">
              <label style="font-weight: 600; font-size: 13px; color: #475569;">Mã số thuế (MST)</label>
              <input type="text" v-model="customerFormData.mst" class="elite-input" />
            </div>

            <div style="margin-bottom: 1rem;">
              <label style="font-weight: 600; font-size: 13px; color: #475569;">Địa chỉ Công Ty</label>
              <input type="text" v-model="customerFormData.dia_chi_cong_ty" class="elite-input" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label style="font-weight: 600; font-size: 13px; color: #475569;">Email Công ty</label>
                <input type="email" v-model="customerFormData.email_cong_ty" class="elite-input" />
              </div>
              <div>
                <label style="font-weight: 600; font-size: 13px; color: #475569;">Website</label>
                <input type="text" v-model="customerFormData.website_cong_ty" class="elite-input" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="font-weight: 600; font-size: 13px; color: #475569;">SĐT Công ty</label>
                <input type="text" v-model="customerFormData.so_dien_thoai_cong_ty" class="elite-input" />
              </div>
              <div>
                <label style="font-weight: 600; font-size: 13px; color: #475569;">Số Fax</label>
                <input type="text" v-model="customerFormData.so_fax_cong_ty" class="elite-input" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- THÔNG TIN BỔ SUNG -->
        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 1.5rem;">
           <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; margin-bottom: 1rem;">Thông tin khác</h3>
           <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
             <div>
               <label style="font-weight: 600; font-size: 13px; color: #475569;">Trạng thái</label>
               <input type="text" v-model="customerFormData.trang_thai" class="elite-input" placeholder="Active / Tiềm năng" />
             </div>
             <div>
               <label style="font-weight: 600; font-size: 13px; color: #475569;">Hoa hồng (%)</label>
               <input type="text" v-model="customerFormData.hoa_hong" class="elite-input" />
             </div>
             <div>
               <label style="font-weight: 600; font-size: 13px; color: #475569;">Ghi chú KH</label>
               <input type="text" v-model="customerFormData.ghi_chu" class="elite-input" />
             </div>
           </div>
        </div>

        <div class="elite-modal-actions" style="margin-top: 1rem; padding: 1rem 1.5rem 1.5rem 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid #e2e8f0;">
          <button class="elite-btn-cancel" @click="isCustomerModalOpen = false">Hủy bỏ</button>
          <button v-if="!customerFormData.id" class="elite-btn-save" @click="saveNewCustomer" style="background: #3b82f6; border-color: #3b82f6; padding: 0.6rem 1.5rem;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">Tạo Khách Hàng</button>
          <button v-else-if="isCustomerDataChanged" class="elite-btn-save" @click="saveNewCustomer" style="background: #10b981; border-color: #10b981; padding: 0.6rem 1.5rem;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">Lưu Thay Đổi</button>
        </div>
      </div>
    </div>
  </div>
          <!-- Global Alert/Confirm Modal -->
    <div v-if="appDialog.isOpen" class="elite-modal-overlay" @click.self="closeAppDialog(false)" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 9999; background: rgba(0,0,0,0.6);">
      <div class="elite-modal" style="width: 400px; max-width: 95%; background: #ffffff; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <div class="elite-modal-header" style="padding: 1rem 1.5rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 0.8rem;">
          <svg v-if="appDialog.type === 'alert'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <h3 style="margin: 0; color: #1e293b; font-size: 1.1rem; font-weight: 700;">{{ appDialog.title }}</h3>
        </div>
        <div style="padding: 1.5rem; background: #ffffff; color: #334155; font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap;">{{ appDialog.message }}</div>
        <div class="elite-modal-actions" style="padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; background: #f8fafc;">
          <button v-if="appDialog.type === 'confirm'" @click="closeAppDialog(false)" class="elite-btn-cancel" style="padding: 0.5rem 1.2rem; background: #f1f5f9; color: #64748b; border-radius: 6px; font-weight: 600; border: none; cursor: pointer;">Hủy</button>
          <button @click="closeAppDialog(true)" class="elite-btn-save" style="padding: 0.5rem 1.2rem; background: #3b82f6; color: white; border-radius: 6px; font-weight: 600; border: none; cursor: pointer;">{{ appDialog.type === 'confirm' ? 'Xác nhận' : 'OK' }}</button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import FileTimelineNode from './FileTimelineNode.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const appDialog = ref({
  isOpen: false,
  type: 'alert',
  title: 'Thông báo',
  message: '',
  resolvePromise: null,
});

const showAlert = (message, title = 'Thông báo') => {
  return new Promise((resolve) => {
    appDialog.value = { isOpen: true, type: 'alert', title, message, resolvePromise: resolve };
  });
};

const showConfirm = (message, title = 'Xác nhận') => {
  return new Promise((resolve) => {
    appDialog.value = { isOpen: true, type: 'confirm', title, message, resolvePromise: resolve };
  });
};

const closeAppDialog = (result = false) => {
  if (appDialog.value.resolvePromise) {
    appDialog.value.resolvePromise(result);
  }
  appDialog.value.isOpen = false;
};








// --- TRẠNG THÁI ---
const loading = ref(false)
const isModalOpen = ref(false)
const isUploadingFile = ref(false)
const isUploadingImage = ref(false)
const editingId = ref(null)
const originalFormDataStr = ref('')
const originalCustomerFormDataStr = ref('')

const isFileDataChanged = computed(() => {
  return JSON.stringify(formData.value) !== originalFormDataStr.value;
})

const isCustomerDataChanged = computed(() => {
  return JSON.stringify(customerFormData.value) !== originalCustomerFormDataStr.value;
})
const files = ref([])

// --- HIGHLIGHT RELATED FILES LOGIC ---
const highlightedFileId = ref(null);

const hasRelatedFiles = (file) => {
  if (file.idPrevious) return true;
  return files.value.some(f => f.idPrevious === file.id);
};

const goToFlowViewAndHighlight = (file) => {
  currentViewCategory.value = 'timelineView';
  highlightedFileId.value = file.id;
  
  if (file.maKH && collapsedCustomers.value[file.maKH]) {
    collapsedCustomers.value[file.maKH] = false;
  }
  
  setTimeout(() => {
    const el = document.getElementById('tl-node-' + file.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 300);

  setTimeout(() => {
    highlightedFileId.value = null;
  }, 2000);
};

const handleLinkedFileClick = (file) => {
  isModalOpen.value = false;
  goToFlowViewAndHighlight(file);
};
// -------------------------------------

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const getThisMonthStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const getThisYearStr = () => {
  return new Date().getFullYear().toString();
}

const getWeekDateRange = (weekStr) => {
  if (!weekStr) return { from: new Date(), to: new Date() };
  const [year, week] = weekStr.split('-W').map(Number);
  const d = new Date(year, 0, 4);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1 + (week - 1) * 7);
  const from = new Date(d);
  from.setHours(0, 0, 0, 0);
  const to = new Date(d);
  to.setDate(to.getDate() + 6);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

function getWeekString(d) {
  if (!d) d = new Date();
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  const week = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

const filterMode = ref('day');
const filterDateFrom = ref(getTodayStr());
const filterDateTo = ref(getTodayStr());
const filterWeekFrom = ref(getWeekString(new Date()));
const filterWeekTo = ref(getWeekString(new Date()));
const filterMonthFrom = ref(getThisMonthStr());
const filterMonthTo = ref(getThisMonthStr());
const filterYearFrom = ref(getThisYearStr());
const filterYearTo = ref(getThisYearStr());
const filterCustomer = ref('');

const activeQuickShortcut = ref('today');
watch(filterMode, () => {
  activeQuickShortcut.value = '';
});

const setFilterTo = (shortcut) => {
  activeQuickShortcut.value = shortcut;
  const now = new Date();
  const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  if (shortcut === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const str = formatDate(y);
    filterDateFrom.value = str;
    filterDateTo.value = str;
  } else if (shortcut === 'today') {
    const str = formatDate(now);
    filterDateFrom.value = str;
    filterDateTo.value = str;
  } else if (shortcut === 'last_week') {
    const lw = new Date(now);
    lw.setDate(lw.getDate() - 7);
    const str = getWeekString(lw);
    filterWeekFrom.value = str;
    filterWeekTo.value = str;
  } else if (shortcut === 'this_week') {
    const str = getWeekString(now);
    filterWeekFrom.value = str;
    filterWeekTo.value = str;
  } else if (shortcut === 'last_month') {
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const str = `${lm.getFullYear()}-${String(lm.getMonth() + 1).padStart(2, '0')}`;
    filterMonthFrom.value = str;
    filterMonthTo.value = str;
  } else if (shortcut === 'this_month') {
    const str = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    filterMonthFrom.value = str;
    filterMonthTo.value = str;
  }
};

const resetFilters = async () => {
  filterMode.value = 'day';
  filterDateFrom.value = getTodayStr();
  filterDateTo.value = getTodayStr();
  filterWeekFrom.value = getWeekString(new Date());
  filterWeekTo.value = getWeekString(new Date());
  filterMonthFrom.value = getThisMonthStr();
  filterMonthTo.value = getThisMonthStr();
  filterYearFrom.value = getThisYearStr();
  filterYearTo.value = getThisYearStr();
  
  await fetchFilesAndCustomers();
};

const filteredFiles = computed(() => {
  let result = files.value;
  
  let startDate = null;
  let endDate = null;
  
  if (filterMode.value === 'week') {
    if (filterWeekFrom.value) startDate = getWeekDateRange(filterWeekFrom.value).from;
    if (filterWeekTo.value) endDate = getWeekDateRange(filterWeekTo.value).to;
  } else if (filterMode.value === 'day') {
    if (filterDateFrom.value) {
      startDate = new Date(filterDateFrom.value);
      startDate.setHours(0,0,0,0);
    }
    if (filterDateTo.value) {
      endDate = new Date(filterDateTo.value);
      endDate.setHours(23,59,59,999);
    }
  } else if (filterMode.value === 'month') {
    if (filterMonthFrom.value) {
      const [y, m] = filterMonthFrom.value.split('-');
      startDate = new Date(Number(y), Number(m) - 1, 1);
      startDate.setHours(0,0,0,0);
    }
    if (filterMonthTo.value) {
      const [ye, me] = filterMonthTo.value.split('-');
      endDate = new Date(Number(ye), Number(me), 0);
      endDate.setHours(23,59,59,999);
    }
  } else if (filterMode.value === 'year') {
    if (filterYearFrom.value) {
      startDate = new Date(Number(filterYearFrom.value), 0, 1);
      startDate.setHours(0,0,0,0);
    }
    if (filterYearTo.value) {
      endDate = new Date(Number(filterYearTo.value), 11, 31);
      endDate.setHours(23,59,59,999);
    }
  }

  if (startDate) {
    result = result.filter(f => {
      const ft = new Date(f.createdTime || Date.now());
      return ft >= startDate;
    });
  }
  
  if (endDate) {
    result = result.filter(f => {
      const ft = new Date(f.createdTime || Date.now());
      return ft <= endDate;
    });
  }
  
  if (filterCustomer.value) {
    result = result.filter(f => f.maKH === filterCustomer.value);
  }
  
  return result;
});


const currentViewCategory = ref('mucDoUuTien');

const getCardColorMode = (file) => {
  if (currentViewCategory.value === 'historyView') {
    return 'blue';
  }
  if (currentViewCategory.value === 'mucDoUuTien') {
    if (file.mucDoUuTien === 'Cao') return 'green';
    if (file.mucDoUuTien === 'Bình thường') return 'orange';
    if (file.mucDoUuTien === 'Thấp') return 'red';
  }
  if (currentViewCategory.value === 'trangThaiXuLy') {
    if (file.trangThaiXuLy === 'Đã gửi') return 'green';
    if (file.trangThaiXuLy === 'Chưa gửi') return 'orange';
  }
  if (currentViewCategory.value === 'trangThaiBaoGia') {
    if (file.trangThaiBaoGia === 'Thành công') return 'green';
    if (file.trangThaiBaoGia === 'Xem xét') return 'orange';
    if (file.trangThaiBaoGia === 'Thất bại') return 'red';
  }
  
  if (file.trangThaiBaoGia) {
    if (file.trangThaiBaoGia === 'Thành công') return 'green';
    if (file.trangThaiBaoGia === 'Xem xét') return 'orange';
    if (file.trangThaiBaoGia === 'Thất bại') return 'red';
  }
  if (file.trangThaiXuLy) {
    if (file.trangThaiXuLy === 'Đã gửi') return 'green';
    if (file.trangThaiXuLy === 'Chưa gửi') return 'orange';
  }
  if (file.mucDoUuTien) {
    if (file.mucDoUuTien === 'Cao') return 'green';
    if (file.mucDoUuTien === 'Bình thường') return 'orange';
    if (file.mucDoUuTien === 'Thấp') return 'red';
  }
  return 'orange';
};

const dragOverColumn = ref(null);
const draggedFileId = ref(null);

const onDragStartFile = (event, fileId) => {
  draggedFileId.value = fileId;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', fileId);
};


const quickUpdateStatus = async (file, field, value) => {
  if (file[field] === value) return; // Do nothing if it's already the same
  try {
    const updateRef = dbRef(db, `quan_ly_file/${file.id}`);
    const updateData = { updatedTime: Date.now() };
    updateData[field] = value;
    await update(updateRef, updateData);
  } catch (error) {
    console.error("Lỗi khi cập nhật nhanh:", error);
    await showAlert("Lỗi khi cập nhật trạng thái!");
  }
};

const onDropFile = async (event, targetStatus) => {
  dragOverColumn.value = null;
  const fileId = draggedFileId.value || event.dataTransfer.getData('text/plain');
  if (!fileId) return;
  
  const fileToUpdate = files.value.find(f => f.id === fileId);
  if (!fileToUpdate) return;
  
  let currentStatus;
  if (currentViewCategory.value === 'mucDoUuTien') currentStatus = fileToUpdate.mucDoUuTien;
  else if (currentViewCategory.value === 'trangThaiXuLy') currentStatus = fileToUpdate.trangThaiXuLy;
  else if (currentViewCategory.value === 'trangThaiBaoGia') currentStatus = fileToUpdate.trangThaiBaoGia;
  
  if (currentStatus === targetStatus) return; // Không thay đổi
  
  try {
    const updateRef = dbRef(db, `quan_ly_file/${fileId}`);
    const updateData = { updatedTime: Date.now() };
    
    if (currentViewCategory.value === 'mucDoUuTien') {
      updateData.mucDoUuTien = targetStatus;
    } else if (currentViewCategory.value === 'trangThaiXuLy') {
      updateData.trangThaiXuLy = targetStatus;
    } else if (currentViewCategory.value === 'trangThaiBaoGia') {
      updateData.trangThaiBaoGia = targetStatus;
    }
    
    await update(updateRef, updateData);
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    await showAlert("Lỗi khi cập nhật trạng thái!");
  } finally {
    draggedFileId.value = null;
  }
};

const collapsedCustomers = ref({});
const toggleCustomer = (customerId) => {
  collapsedCustomers.value[customerId] = !collapsedCustomers.value[customerId];
};

const statsCounts = computed(() => {
  const result = {
    total: filteredFiles.value.length,
    priority: { cao: 0, bt: 0, thap: 0 },
    process: { daGui: 0, chuaGui: 0 },
    quote: { thanhCong: 0, thatBai: 0, xemXet: 0 }
  };
  
  filteredFiles.value.forEach(f => {
    // Priority
    if (f.mucDoUuTien === 'Cao') result.priority.cao++;
    else if (f.mucDoUuTien === 'Bình thường') result.priority.bt++;
    else if (f.mucDoUuTien === 'Thấp') result.priority.thap++;
    
    // Process
    if (f.trangThaiXuLy === 'Đã gửi') result.process.daGui++;
    else if (f.trangThaiXuLy === 'Chưa gửi') result.process.chuaGui++;
    
    // Quote
    if (f.trangThaiBaoGia === 'Thành công') result.quote.thanhCong++;
    else if (f.trangThaiBaoGia === 'Thất bại') result.quote.thatBai++;
    else if (f.trangThaiBaoGia === 'Xem xét') result.quote.xemXet++;
  });
  
  return result;
});

const filesHistoryByDate = computed(() => {
  try {
    const groups = {};
    filteredFiles.value.forEach(f => {
      const d = new Date(f.createdTime || Date.now());
      d.setHours(0,0,0,0);
      const dateKey = d.getTime();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(f);
    });
    
    const sortedKeys = Object.keys(groups).sort((a,b) => b - a);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return sortedKeys.map(key => {
      const timestamp = parseInt(key);
      const { thu, date } = formatDisplayTime(timestamp);
      const items = groups[key].sort((a,b) => (b.createdTime || 0) - (a.createdTime || 0));
      
      let thuLabel = thu || '';
      if (timestamp === today.getTime()) thuLabel = 'Hôm nay';
      else if (timestamp === yesterday.getTime()) thuLabel = 'Hôm qua';
      
      return {
        dateKey: key,
        thuLabel,
        dateLabel: date || '',
        items
      };
    });
  } catch (err) {
    console.error('Error in filesHistoryByDate:', err);
    return [];
  }
});

const customerTrees = computed(() => {
  const result = [];
  
  customers.value.forEach(customer => {
     const cusFiles = filteredFiles.value.filter(f => f.maKH === customer.ma_khach_hang);
     if (cusFiles.length === 0) return;
     
     const fileMap = {};
     cusFiles.forEach(f => {
       fileMap[f.id] = { ...f, children: [] };
     });
     
     const roots = [];
     cusFiles.forEach(f => {
       if (f.idPrevious && fileMap[f.idPrevious]) {
         fileMap[f.idPrevious].children.push(fileMap[f.id]);
       } else {
         roots.push(fileMap[f.id]);
       }
     });
     
     const sortByTime = (a, b) => b.createdTime - a.createdTime;
     roots.sort(sortByTime);
     const sortChildren = (nodes) => {
        nodes.forEach(n => {
           n.children.sort((a,b) => a.createdTime - b.createdTime);
           sortChildren(n.children);
        });
     };
     sortChildren(roots);
     
     const linkedRoots = roots.filter(r => r.idPrevious || r.children.length > 0);
     const orphanRoots = roots.filter(r => !r.idPrevious && r.children.length === 0);
     result.push({
       customer,
       roots,
       linkedRoots,
       orphanRoots,
       totalFiles: cusFiles.length
     });
  });
  
  return result;
});

const kanbanColumns = computed(() => {
  if (currentViewCategory.value === 'mucDoUuTien') {
    return [
      { status: 'Thấp', title: 'ƯU TIÊN THẤP', dotClass: 'bg-red-500 shadow-red-500/50', colClass: 'kb-col-failed', files: filteredFiles.value.filter(f => f.mucDoUuTien === 'Thấp') },
      { status: 'Bình thường', title: 'BÌNH THƯỜNG', dotClass: 'bg-amber-500 shadow-amber-500/50', colClass: 'kb-col-pending', files: filteredFiles.value.filter(f => f.mucDoUuTien === 'Bình thường' || !f.mucDoUuTien) },
      { status: 'Cao', title: 'ƯU TIÊN CAO', dotClass: 'bg-emerald-500 shadow-emerald-500/50', colClass: 'kb-col-done', files: filteredFiles.value.filter(f => f.mucDoUuTien === 'Cao') },
    ];
  } else if (currentViewCategory.value === 'trangThaiXuLy') {
    return [
      { status: 'Chưa gửi', title: 'CHƯA GỬI', dotClass: 'bg-amber-500 shadow-amber-500/50', colClass: 'kb-col-pending', files: filteredFiles.value.filter(f => f.trangThaiXuLy === 'Chưa gửi' || f.trangThaiXuLy === 'Chưa xử lý' || !f.trangThaiXuLy) },
      { status: 'Đã gửi', title: 'ĐÃ GỬI', dotClass: 'bg-emerald-500 shadow-emerald-500/50', colClass: 'kb-col-done', files: filteredFiles.value.filter(f => f.trangThaiXuLy === 'Đã gửi') }
    ];
  } else if (currentViewCategory.value === 'trangThaiBaoGia') {
    return [
      { status: 'Xem xét', title: 'XEM XÉT', dotClass: 'bg-amber-500 shadow-amber-500/50', colClass: 'kb-col-pending', files: filteredFiles.value.filter(f => f.trangThaiBaoGia === 'Xem xét' || !f.trangThaiBaoGia) },
      { status: 'Thành công', title: 'THÀNH CÔNG', dotClass: 'bg-emerald-500 shadow-emerald-500/50', colClass: 'kb-col-done', files: filteredFiles.value.filter(f => f.trangThaiBaoGia === 'Thành công') },
      { status: 'Thất bại', title: 'THẤT BẠI', dotClass: 'bg-red-500 shadow-red-500/50', colClass: 'kb-col-failed', files: filteredFiles.value.filter(f => f.trangThaiBaoGia === 'Thất bại') }
    ];
  }
  return [];
});

const customers = ref([])
const availableTags = computed(() => {
  const tags = new Set()
  customers.value.forEach(c => {
    if (c.tagKH && Array.isArray(c.tagKH)) {
      c.tagKH.forEach(tag => tags.add(tag))
    }
  })
  return Array.from(tags).map(tag => ({ id: tag, name: tag }))
})


const getCustomerNameInfo = (maKH) => {
  const cus = customers.value.find(c => c.ma_khach_hang === maKH)
  if (!cus) return maKH;
  let info = cus.ten_khach_hang || '';
  if (cus.ten_cong_ty) {
    info += (info ? ' - ' : '') + cus.ten_cong_ty;
  }
  return info || maKH;
}


const getOriginalFileName = (fileObj) => {
  if (typeof fileObj === 'object' && fileObj.name) return fileObj.name;
  return typeof fileObj === 'string' ? fileObj : fileObj.url;
};

const getFileIconType = (fileObj) => {
  const name = getOriginalFileName(fileObj).toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'word';
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'excel';
  if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif') || name.endsWith('.webp')) return 'image';
  return 'default';
};

const getFileBadgeClass = (fileObj) => {
  const type = getFileIconType(fileObj);
  if (type === 'pdf') return 'badge-pdf';
  if (type === 'word') return 'badge-word';
  if (type === 'excel') return 'badge-excel';
  if (type === 'image') return 'badge-image';
  return 'badge-default';
};



const handleDownloadClick = async (event, fileObj, defaultName) => {
  event.preventDefault();
  
  const url = fileObj.url || fileObj;
  let name = fileObj.name || defaultName;
  if (!url || typeof url !== 'string') return;
  
  // Extract extension to append if missing
  const urlParts = url.split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  let ext = '';
  const extIndex = lastPart.lastIndexOf('.');
  if (extIndex > -1) {
    ext = lastPart.substring(extIndex);
  }
  if (ext && !name.toLowerCase().endsWith(ext.toLowerCase())) {
    name = name + ext;
  }
  
  // Try to fetch and download as blob to bypass Cloudinary restrictions
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = objectUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);
    }, 1000);
  } catch (err) {
    console.error("Lỗi khi tải file qua JS:", err);
    // Fallback: Just open the URL normally if CORS blocks it
    window.open(url, '_blank');
  }
};

const getDownloadUrl = (fileObj, defaultName) => {
  const url = fileObj.url || fileObj;
  let name = fileObj.name || defaultName;
  if (!url || typeof url !== 'string') return '';
  
  if (url.includes('/upload/')) {
    const urlParts = url.split('?')[0].split('/');
    const lastPart = urlParts[urlParts.length - 1];
    let ext = '';
    const extIndex = lastPart.lastIndexOf('.');
    if (extIndex > -1) {
      ext = lastPart.substring(extIndex);
    }
    
    if (ext && !name.toLowerCase().endsWith(ext.toLowerCase())) {
      name = name + ext;
    }
    
    // Cloudinary does not allow special characters in fl_attachment value.
    // Convert Vietnamese to non-accented and replace spaces/specials with underscore.
    let safeName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    safeName = safeName.replace(/đ/g, 'd').replace(/Đ/g, 'D');
    safeName = safeName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    
    return url.replace('/upload/', `/upload/fl_attachment:${safeName}/`);
  }
  return url;
};

const getFileIconSvg = (fileObj) => {
  const type = getFileIconType(fileObj);
  const imgStyle = "width: 16px; height: 16px; object-fit: contain; border-radius: 2px;";
  if (type === 'pdf') return `<img src="https://i.ibb.co/3YdHRTFs/unnamed.webp" style="${imgStyle}" />`;
  if (type === 'word') return `<img src="https://i.ibb.co/d0Y6v4yD/images-7.jpg" style="${imgStyle}" />`;
  if (type === 'excel') return `<img src="https://i.ibb.co/b5yq09VP/images-8.jpg" style="${imgStyle}" />`;
  if (type === 'image') return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
};

const getFileName = (fileObj, prefix, index) => {
  if (typeof fileObj === 'object' && fileObj.name) return fileObj.name;
  const url = typeof fileObj === 'string' ? fileObj : fileObj.url;
  try {
    const parts = url.split('/');
    let name = parts[parts.length - 1];
    name = name.split('?')[0];
    name = decodeURIComponent(name);
    return name;
  } catch (e) {
    return `${prefix} ${index + 1}`;
  }
};

const truncateFileName = (name) => {
  if (!name) return '';
  if (name.length > 25) {
    return name.substring(0, 15) + '...' + name.substring(name.length - 7);
  }
  return name;
};

const getCustomerTags = (maKH) => {
  const cus = customers.value.find(c => c.ma_khach_hang === maKH)
  return cus && cus.tagKH ? cus.tagKH : []
}

// --- HÀM FORMAT THỜI GIAN ---
function formatDisplayTime(timestamp) {
  if (!timestamp) return { time: '', thu: '', date: '', period: '' };
  const d = new Date(timestamp);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const date = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return {
    time: `${h}:${m}`,
    thu: days[d.getDay()],
    date: `${date} / ${month} / ${year}`,
    period: parseInt(h) < 12 ? 'Sáng' : 'Chiều'
  };
}

// Trạng thái modal khách hàng
const isCustomerModalOpen = ref(false)


const isFileSelectModalOpen = ref(false);
const isWarningCustomerModalOpen = ref(false);
const pendingLinkedFile = ref(null);
const fileSearchQuery = ref('');

const filteredModalFiles = computed(() => {
  let res = [...files.value];
  if (editingId.value) {
    res = res.filter(f => f.id !== editingId.value);
  }
  if (fileSearchQuery.value) {
    const q = fileSearchQuery.value.toLowerCase();
    res = res.filter(f => 
      (f.noiDung && f.noiDung.toLowerCase().includes(q)) || 
      (f.maKH && f.maKH.toLowerCase().includes(q))
    );
  }
  return res.sort((a,b) => b.createdTime - a.createdTime).slice(0, 50);
});

const selectLinkedFile = (f) => {
  if (f.maKH && formData.value.maKH && f.maKH !== formData.value.maKH) {
    pendingLinkedFile.value = f;
    isWarningCustomerModalOpen.value = true;
  } else {
    formData.value.idPrevious = f.id;
    isFileSelectModalOpen.value = false;
  }
};

const confirmLinkedFile = () => {
  if (pendingLinkedFile.value) {
    formData.value.idPrevious = pendingLinkedFile.value.id;
  }
  isWarningCustomerModalOpen.value = false;
  isFileSelectModalOpen.value = false;
};

const getSelectedFileDisplay = () => {
  if (!formData.value.idPrevious) return '';
  const f = files.value.find(x => x.id === formData.value.idPrevious);
  if (!f) return 'File không tồn tại';
  return f.noiDung ? f.noiDung.substring(0, 100) + '...' : 'Không có nội dung';
};

const selectedLinkedFile = computed(() => {
  if (!formData.value.idPrevious) return null;
  return files.value.find(x => x.id === formData.value.idPrevious) || null;
});


const isCustomerSelectModalOpen = ref(false);
const customerSelectMode = ref('form');
const customerSearchQuery = ref('');

const filteredCustomers = computed(() => {
  if (!customerSearchQuery.value) return customers.value;
  const q = customerSearchQuery.value.toLowerCase();
  return customers.value.filter(c => 
    (c.ten_khach_hang && c.ten_khach_hang.toLowerCase().includes(q)) || 
    (c.ma_khach_hang && c.ma_khach_hang.toLowerCase().includes(q)) ||
    (c.ten_cong_ty && c.ten_cong_ty.toLowerCase().includes(q))
  );
});

const selectCustomer = (cus) => {
  if (customerSelectMode.value === 'filter') {
    filterCustomer.value = cus ? cus.ma_khach_hang : '';
  } else {
    formData.value.maKH = cus ? cus.ma_khach_hang : '';
  }
  isCustomerSelectModalOpen.value = false;
};


const editCustomerInfo = (cus) => {
  customerFormData.value = { ...cus };
  originalCustomerFormDataStr.value = JSON.stringify(customerFormData.value);
  isCustomerSelectModalOpen.value = false;
  isCustomerModalOpen.value = true;
};

const getSelectedCustomerTags = () => {
  if (!formData.value.maKH) return [];
  const cus = customers.value.find(c => c.ma_khach_hang === formData.value.maKH);
  return cus && cus.tagKH ? cus.tagKH : [];
};
const getSelectedCustomerDisplay = () => {
  if (!formData.value.maKH) return 'Chưa chọn khách hàng';
  const cus = customers.value.find(c => c.ma_khach_hang === formData.value.maKH);
  if (!cus) return formData.value.maKH;
  return `${cus.ten_khach_hang} ${cus.ten_cong_ty ? '- ' + cus.ten_cong_ty : ''}`;
};

const getFilterCustomerDisplay = () => {
  if (!filterCustomer.value) return 'Tất cả khách hàng';
  const cus = customers.value.find(c => c.ma_khach_hang === filterCustomer.value);
  if (!cus) return filterCustomer.value;
  return cus.ten_khach_hang;
};

// Logic Quản lý Tag
const isTagModalOpen = ref(false)
const editingTagId = ref(null)
const editTagValue = ref('')

const startEditTag = (tagName) => {
  editingTagId.value = tagName
  editTagValue.value = tagName
}

const saveTagEdit = async (oldTagName) => {
  const newTagName = editTagValue.value.trim()
  if (!newTagName || newTagName === oldTagName) {
    editingTagId.value = null
    return
  }
  
  const updates = {}
  customers.value.forEach(c => {
    if (c.tagKH && c.tagKH.includes(oldTagName)) {
      const newTags = c.tagKH.map(t => t === oldTagName ? newTagName : t)
      updates[`khach_hang/${c.id}/tagKH`] = newTags
    }
  })
  
  if (Object.keys(updates).length > 0) {
    await update(dbRef(db), updates)
  }
  
  if (formData.value.tagKH && formData.value.tagKH.includes(oldTagName)) {
    formData.value.tagKH = formData.value.tagKH.map(t => t === oldTagName ? newTagName : t)
  }
  
  editingTagId.value = null
}

const deleteTagGlobal = async (tagName) => {
  const confirmDel = await showConfirm(`Bạn có chắc muốn xóa vĩnh viễn nhóm "${tagName}" khỏi TẤT CẢ khách hàng không?`)
  if (!confirmDel) return
  
  const updates = {}
  customers.value.forEach(c => {
    if (c.tagKH && c.tagKH.includes(tagName)) {
      const newTags = c.tagKH.filter(t => t !== tagName)
      updates[`khach_hang/${c.id}/tagKH`] = newTags
    }
  })
  
  if (Object.keys(updates).length > 0) {
    await update(dbRef(db), updates)
  }
  
  if (formData.value.tagKH) {
    formData.value.tagKH = formData.value.tagKH.filter(t => t !== tagName)
  }
}

const defaultCustomerForm = {
  ma_khach_hang: '',
  ten_khach_hang: '',
  so_dien_thoai_ca_nhan: '',
  email_ca_nhan: '',
  ten_khach_hang_phu: '',
  so_dien_thoai_ca_nhan_phu: '',
  email_ca_nhan_phu: '',
  ma_cong_ty: '',
  ten_cong_ty: '',
  mst: '',
  dia_chi_cong_ty: '',
  email_cong_ty: '',
  website_cong_ty: '',
  so_dien_thoai_cong_ty: '',
  so_fax_cong_ty: '',
  ghi_chu: '',
  hoa_hong: '',
  trang_thai: 'Active'
}
const customerFormData = ref({ ...defaultCustomerForm })

const defaultForm = {
  maKH: '',
  tagKH: [],
  noiDung: '',
  ghiChu: '',
  trangThaiXuLy: 'Chưa gửi',
  mucDoUuTien: 'Bình thường',
  trangThaiBaoGia: 'Xem xét',
  tenFileBaoGia: '',
  linkFileBaoGia: [],
  linkImgSave: [],
  idPrevious: ''
}

const formData = ref({ ...defaultForm })

watch(() => formData.value.maKH, (newMaKH) => {
  if (newMaKH && isModalOpen.value) {
    // Only auto-fill when adding new file, edit mode already populates
    if (!editingId.value) {
      const cus = customers.value.find(c => c.ma_khach_hang === newMaKH)
      if (cus && cus.tagKH) {
        formData.value.tagKH = [...cus.tagKH]
      } else {
        formData.value.tagKH = []
      }
    }
  }
})

// --- HÀM TẠO MÃ KHÁCH HÀNG TỰ ĐỘNG ---
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

watch(
  [() => customerFormData.value.ten_khach_hang, () => customerFormData.value.ten_cong_ty],
  ([ten, congTy]) => {
    // Chỉ tự động gen khi đang mở modal thêm mới KH
    if (isCustomerModalOpen.value && !customerFormData.value.id) {
      const newMaKH = genMaKH(ten, congTy)
      if (newMaKH || newMaKH === '') {
        customerFormData.value.ma_khach_hang = newMaKH
      }
      customerFormData.value.ma_cong_ty = genMaCT(congTy)
    }
  }
)

// --- LOGIC MODAL KHÁCH HÀNG MỚI ---
const openCustomerModal = () => {
  customerFormData.value = { 
    ...defaultCustomerForm,
    // Gợi ý mã KH nếu người dùng đã gõ sắn ở ô input
    ma_khach_hang: formData.value.maKH || ''
  }
  isCustomerModalOpen.value = true
}

const saveNewCustomer = async () => {
  if (!customerFormData.value.ma_khach_hang || !customerFormData.value.ten_khach_hang) {
    await showAlert('Vui lòng nhập Mã Khách Hàng và Tên Khách Hàng!')
    return
  }
  try {
    if (customerFormData.value.id) {
      const cusRef = dbRef(db, 'khach_hang/' + customerFormData.value.id);
      const dataToSave = { ...customerFormData.value };
      delete dataToSave.id;
      await update(cusRef, dataToSave);
      await showAlert('Cập nhật thông tin khách hàng thành công!');
    } else {
      const newCusRef = push(dbRef(db, 'khach_hang'));
      await set(newCusRef, {
        ...customerFormData.value,
        created_time: Date.now()
      });
      await showAlert('Tạo khách hàng mới thành công!');
    }
    
    formData.value.maKH = customerFormData.value.ma_khach_hang;
    isCustomerModalOpen.value = false;
  } catch (error) {
    console.error("Lỗi khi thêm/sửa KH:", error);
    await showAlert('Lỗi: ' + error.message);
  }
}

// Tự động nhận diện nếu KH chưa có trong DB (Dành cho TH gõ trực tiếp mà không bấm thêm mới)
const isNewCustomer = computed(() => {
  if (!formData.value.maKH) return false
  return !customers.value.some(c => c.ma_khach_hang === formData.value.maKH)
})

// --- LOGIC API CLOUDINARY TỪ TRANG REPORT ---
const uploadCloudinary = async (file) => {
  try {
    const fd = new FormData()
    fd.append('upload_preset', 'upload_file')
    fd.append('file', file)
    
    const res = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', { 
      method: 'POST', 
      body: fd 
    }).then(r => r.json())
    
    if (res.secure_url) {
      return { url: res.secure_url, name: file.name }
    } else {
      throw new Error(res.error?.message || 'Không rõ')
    }
  } catch (error) {
    console.error('Lỗi upload:', error)
    await showAlert('Lỗi mạng khi tải file lên Cloudinary')
    return null
  }
}

const handleFileUpload = async (event) => {
  const targetFiles = Array.from(event.target.files)
  if (!targetFiles.length) return

  isUploadingFile.value = true
  if (!Array.isArray(formData.value.linkFileBaoGia)) {
    formData.value.linkFileBaoGia = []
  }

  for (const file of targetFiles) {
    const result = await uploadCloudinary(file)
    if (result) {
      formData.value.linkFileBaoGia.push({ url: result.url, name: result.name })
    }
  }
  isUploadingFile.value = false
  event.target.value = ''
}

const handleImageUpload = async (event) => {
  const targetFiles = Array.from(event.target.files)
  if (!targetFiles.length) return

  isUploadingImage.value = true
  if (!Array.isArray(formData.value.linkImgSave)) {
    formData.value.linkImgSave = []
  }

  for (const file of targetFiles) {
    const result = await uploadCloudinary(file)
    if (result) {
      formData.value.linkImgSave.push({ url: result.url, name: result.name })
    }
  }
  isUploadingImage.value = false
  event.target.value = ''
}

const removeFile = (idx) => {
  formData.value.linkFileBaoGia.splice(idx, 1)
}

const removeImage = (idx) => {
  formData.value.linkImgSave.splice(idx, 1)
}

const getViewUrl = (url) => {
  return url || '#';
};

const tempTagKH = ref('')

const addNewTagFromInput = () => {
  if (!tempTagKH.value) return
  const newTag = tempTagKH.value.trim()
  if (newTag) {
    if (!formData.value.tagKH) formData.value.tagKH = []
    if (!formData.value.tagKH.includes(newTag)) {
      formData.value.tagKH.push(newTag)
    }
  }
  tempTagKH.value = ''
}

const toggleTag = (tagName) => {
  if (!customerFormData.value.tagKH) customerFormData.value.tagKH = []
  if (customerFormData.value.tagKH.includes(tagName)) {
    customerFormData.value.tagKH = customerFormData.value.tagKH.filter(t => t !== tagName)
  } else {
    customerFormData.value.tagKH.push(tagName)
  }
}

const removeSelectedTag = (tagName) => {
  if (customerFormData.value.tagKH) {
    customerFormData.value.tagKH = customerFormData.value.tagKH.filter(t => t !== tagName)
  }
}

// --- LOGIC GIAO DIỆN ---
const openAddModal = () => {
  editingId.value = null
  formData.value = JSON.parse(JSON.stringify(defaultForm))
  tempTagKH.value = ''
  isModalOpen.value = true
}

const editFile = (file) => {
  editingId.value = file.id
  formData.value = { ...file }
  const cus = customers.value.find(c => c.ma_khach_hang === file.maKH)
  if (cus && cus.tagKH) {
    formData.value.tagKH = [...cus.tagKH]
  } else {
    formData.value.tagKH = []
  }
  tempTagKH.value = ''
  
  // Đảm bảo tương thích với dữ liệu cũ (chuỗi string phân cách bằng \n)
  if (typeof formData.value.linkFileBaoGia === 'string') {
    formData.value.linkFileBaoGia = formData.value.linkFileBaoGia ? formData.value.linkFileBaoGia.split('\n') : []
  }
  if (typeof formData.value.linkImgSave === 'string') {
    formData.value.linkImgSave = formData.value.linkImgSave ? formData.value.linkImgSave.split('\n') : []
  }

  // Normalize string arrays to objects for editing
  if (Array.isArray(formData.value.linkFileBaoGia)) {
    formData.value.linkFileBaoGia = formData.value.linkFileBaoGia.map(item => {
      if (typeof item === 'string') {
        const parts = item.split('/');
        let name = parts[parts.length - 1] || 'File';
        return { url: item, name: decodeURIComponent(name.split('?')[0]) };
      }
      return item;
    });
  }
  if (Array.isArray(formData.value.linkImgSave)) {
    formData.value.linkImgSave = formData.value.linkImgSave.map(item => {
      if (typeof item === 'string') {
        const parts = item.split('/');
        let name = parts[parts.length - 1] || 'Ảnh';
        return { url: item, name: decodeURIComponent(name.split('?')[0]) };
      }
      return item;
    });
  }

  originalFormDataStr.value = JSON.stringify(formData.value)
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// --- LOGIC FIREBASE ---
import { getDatabase, ref as dbRef, onValue, push, set, update, remove } from "firebase/database"
// Chú ý: Cần import firebase app đã khởi tạo từ file firebase config của bạn
// Giả sử bạn import db từ một file chung, hoặc tạm thời import lại ở đây:
import { initializeApp, getApps, getApp } from "firebase/app"
const firebaseConfig = {
  apiKey: "AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8",
  authDomain: "chusonproject.firebaseapp.com",
  databaseURL: "https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chusonproject",
  storageBucket: "chusonproject.firebasestorage.app",
  messagingSenderId: "530095815610",
  appId: "1:530095815610:web:d2bc051c56ab84570b5561"
}
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getDatabase(app)

const fetchFilesAndCustomers = async () => {
  loading.value = true
  

  
  // Lấy danh sách khách hàng
  const cusRef = dbRef(db, 'khach_hang')
  onValue(cusRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      customers.value = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }))
    } else {
      customers.value = []
    }
  })

  // Lấy danh sách file
  const listRef = dbRef(db, 'quan_ly_file')
  onValue(listRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      const parsedData = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }))
      files.value = parsedData.sort((a, b) => b.createdTime - a.createdTime)
    } else {
      files.value = []
    }
    loading.value = false
  })
}

const saveFile = async () => {
  try {
    if (!formData.value.maKH) {
      await showAlert("Vui lòng nhập mã khách hàng!")
      return
    }

    isUploadingFile.value = true // Just using it as loading state for save


    // --- KIỂM TRA & THÊM KHÁCH HÀNG MỚI NẾU CHƯA CÓ ---
    if (isNewCustomer.value) {
      const newCusRef = push(dbRef(db, 'khach_hang'))
      await set(newCusRef, {
        ma_khach_hang: formData.value.maKH,
        ten_khach_hang: formData.value.maKH, // Tạm lấy mã làm tên
        trang_thai: 'Tiềm năng',
        tagKH: [],
        created_time: Date.now()
      })
    } else {
      // Bỏ update tagKH ở đây vì nhóm KH được quản lý riêng trong modal Khách hàng
    }

    const listRef = dbRef(db, 'quan_ly_file')
    let finalIdPrevious = formData.value.idPrevious ? String(formData.value.idPrevious).trim() : '';
    
    // Auto-clone previous file if it belongs to a different customer
    if (finalIdPrevious) {
      const prevFile = files.value.find(f => f.id === finalIdPrevious);
      if (prevFile && prevFile.maKH !== formData.value.maKH) {
        if (!(await showConfirm(`Thẻ gốc (ID: ${prevFile.id}) thuộc về khách hàng [${prevFile.maKH}].\n\nHệ thống sẽ tự động NHÂN BẢN thẻ gốc này sang khách hàng hiện tại [${formData.value.maKH}] để tiếp tục chuỗi công việc.\n\nBạn có muốn tiếp tục không?`))) {
          isUploadingFile.value = false;
          return;
        }

        // Clone the previous file to belong to the CURRENT customer
        const cloneRef = push(listRef);
        const clonedData = JSON.parse(JSON.stringify(prevFile)); // Deep copy
        
        delete clonedData.id;
        clonedData.maKH = formData.value.maKH; // Update to match current customer
        clonedData.idPrevious = ''; // The clone becomes a new root for this customer
        clonedData.createdTime = Date.now();
        clonedData.updatedTime = Date.now();
        
        await set(cloneRef, { ...clonedData, id: cloneRef.key });
        
        // Link the currently edited/created file to this NEW clone
        finalIdPrevious = cloneRef.key;
      }
    }

    if (editingId.value) {
      // Sửa
      const updateRef = dbRef(db, `quan_ly_file/${editingId.value}`)
      await update(updateRef, { ...formData.value, idPrevious: finalIdPrevious, updatedTime: Date.now() })
    } else {
      // Thêm mới
      const newRef = push(listRef)
      await set(newRef, { ...formData.value, idPrevious: finalIdPrevious, id: newRef.key, createdTime: Date.now(), updatedTime: Date.now() })
    }
    closeModal()
  } catch (error) {
    console.error("Lỗi khi lưu:", error)
    await showAlert("Lỗi khi lưu dữ liệu lên Firebase!")
  } finally {
    isUploadingFile.value = false
  }
}

const deleteFile = async (id) => {
  if (await showConfirm('Bạn có chắc chắn muốn xóa file này?')) {
    try {
      const delRef = dbRef(db, `quan_ly_file/${id}`)
      await remove(delRef)
    } catch (error) {
      console.error("Lỗi khi xóa:", error)
      await showAlert("Lỗi khi xóa dữ liệu!")
    }
  }
}

onMounted(() => {
  fetchFilesAndCustomers()
})
</script>

<style scoped>

/* =========================================
   THIẾT KẾ: MODERN, CLEAN & PREMIUM 
   Dựa trên CSS thuần, với Micro-animations
========================================= */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

/* ============ QUICK SHORTCUTS ============ */
.quick-shortcut-btn {
  font-size: 0.75rem;
  color: #64748b;
  cursor: pointer;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  transition: all 0.2s ease;
  background: transparent;
}
.quick-shortcut-btn:hover {
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
}
.quick-shortcut-btn.active {
  background: #eff6ff;
  color: #2563eb;
  box-shadow: inset 0 0 0 1px #bfdbfe;
}

/* ============ VIEW MODE TABS ============ */
.view-mode-row {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
  margin-bottom: 0.25rem;
}
.view-mode-tabs {
  display: flex;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
  padding: 4px;
  gap: 4px;
}
.view-mode-tabs button {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 20px;
  border: none;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  color: #94a3b8;
  white-space: nowrap;
}
.view-mode-tabs button:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
.view-mode-tabs button.active-blue {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  box-shadow: 0 4px 12px rgba(59,130,246,0.3);
}
.view-mode-tabs button.active-green {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  box-shadow: 0 4px 12px rgba(16,185,129,0.3);
}

/* ============ DAILY VIEW ============ */
.daily-view-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}
.daily-day-block {
  position: relative;
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 34, 0.4) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px -2px rgba(0,0,0,0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: dailyFadeIn 0.4s ease forwards;
}
.daily-day-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -4px rgba(0,0,0,0.25);
}
.daily-day-block::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 5px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  z-index: 2;
}
@keyframes dailyFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.daily-day-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 2px dashed rgba(59,130,246,0.15);
  gap: 0.75rem;
}
.daily-day-badge {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.daily-badge-thu {
  font-size: 0.8rem;
  font-weight: 800;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(59,130,246,0.35);
}
.daily-badge-date {
  font-size: 1.15rem;
  font-weight: 900;
  color: #ffffff;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  padding: 0.35rem 1.2rem;
  border-radius: 10px;
  border: 1.5px solid rgba(251, 191, 36, 0.4);
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3);
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.daily-count-badge {
  font-size: 0.75rem;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(239, 68, 68, 0.4);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.daily-periods {
  display: flex;
  flex-direction: column;
}
.daily-period-section {
  padding: 1rem 1.25rem 1.25rem;
}
.daily-period-morning {
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.daily-period-label-v2 {
  font-size: 1.1rem;
  font-weight: 900;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  margin-bottom: 0.75rem;
  text-align: center;
}
.daily-empty-slot {
  font-size: 0.8rem;
  color: #94a3b8;
  font-style: italic;
  padding: 0.75rem 0;
  text-align: center;
}
.daily-task-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}


/* Dragging Effects for Move Tasks Modal */
.dragging-task {
  opacity: 0.5 !important;
  transform: scale(0.98) !important;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5) !important;
  border-left-color: #64748b !important;
  background: rgba(30,41,59,0.8) !important;
}
.drag-over-sang {
  background: rgba(59,130,246,0.15) !important;
  border-color: rgba(59,130,246,0.5) !important;
  padding-bottom: 45px !important;
}
.drag-over-chieu {
  background: rgba(16,185,129,0.15) !important;
  border-color: rgba(16,185,129,0.5) !important;
  padding-bottom: 45px !important;
}
.drop-success-pulse {
  animation: taskPulseSuccess 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes taskPulseSuccess {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.8);
    transform: scale(1.05);
    background: #10b981 !important;
  }
  50% {
    box-shadow: 0 0 0 12px rgba(16, 185, 129, 0);
    transform: scale(1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    transform: scale(1);
  }
}

/* Voice Recording Button */
.header-actions-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.elite-voice-btn {
  background: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.elite-voice-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  transform: translateY(-1px);
}

.elite-voice-btn.is-recording {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  animation: pulse-recording 1.5s infinite;
}

@keyframes pulse-recording {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.voice-recording-indicator {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.voice-recording-indicator.is-listening {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  animation: voice-pulse-indicator 1.5s infinite;
}

@keyframes voice-pulse-indicator {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.voice-transcript-box {
  min-height: 120px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  text-align: left;
  font-size: 1.05rem;
  color: #1e293b;
  line-height: 1.6;
  max-height: 250px;
  overflow-y: auto;
}

.voice-placeholder {
  color: #94a3b8;
  font-style: italic;
}

.report-container {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 2rem 2.5rem;
  background: radial-gradient(circle at 0% 5%, rgba(30, 120, 180, 0.18) 0%, transparent 45%);
  min-height: 100vh;
  color: #f8fafc;
  box-sizing: border-box;
}

/* --- HEADER --- */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.title-section h1 {
  font-size: 2.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.025em;
}

.title-section .subtitle {
  color: #94a3b8;
  margin: 0;
  font-size: 0.95rem;
}

/* --- BUTTONS --- */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  padding: 0.8rem 1.5rem;
  box-shadow: 0 4px 12px -2px rgba(79, 70, 229, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -2px rgba(79, 70, 229, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #334155;
  padding: 0.75rem 1.5rem;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

.btn-excel {
  background-color: #10b981;
  color: white;
  padding: 0.8rem 1.5rem;
  box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.3);
}

.btn-excel:hover {
  background-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -2px rgba(16, 185, 129, 0.4);
}

/* --- FILTERS --- */
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
}

.filter-group {
  position: relative;
  flex: 2;
}

.filter-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.filter-group input {
  width: 100%;
  padding-left: 2.75rem !important;
}

.filters input, .filters select {
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;
  font-size: 0.95rem;
  color: #334155;
  transition: all 0.2s;
  background-color: #f8fafc;
}

.filters select {
  flex: 1;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

.filters input:focus, .filters select:focus {
  border-color: #6366f1;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

/* --- TABLE --- */
.table-wrapper {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.02), 0 4px 6px -4px rgba(0, 0, 0, 0.01);
  border: 1px solid #f1f5f9;
  overflow-x: auto;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.report-table th {
  background-color: #f8fafc;
  padding: 1.25rem 1.5rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.report-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 0.95rem;
  color: #334155;
}

.animate-row {
  animation: fadeIn 0.4s ease forwards;
  opacity: 0;
}

.report-table tr:nth-child(1) { animation-delay: 0.05s; }
.report-table tr:nth-child(2) { animation-delay: 0.1s; }
.report-table tr:nth-child(3) { animation-delay: 0.15s; }
.report-table tr:nth-child(4) { animation-delay: 0.2s; }
.report-table tr:nth-child(5) { animation-delay: 0.25s; }

.report-table tr:last-child td {
  border-bottom: none;
}

.report-table tr:hover td {
  background-color: #f8fafc;
}

.col-time {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
}

.col-content {
  line-height: 1.5;
  color: #0f172a;
  font-weight: 500;
}

.col-note {
  color: #64748b;
  font-size: 0.85rem;
}

.text-right {
  text-align: right;
}

.btn-icon {
  background: transparent;
  padding: 0.5rem;
  border-radius: 8px;
  color: #94a3b8;
  margin-left: 0.5rem;
}

.btn-icon:hover {
  background-color: #f1f5f9;
}

.btn-icon.edit:hover { color: #3b82f6; background-color: #eff6ff; }
.btn-icon.delete:hover { color: #ef4444; background-color: #fef2f2; }

/* --- BADGES & TAGS & STATUS --- */
/* Desktop Badge solid styles */
.badge {
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: white !important;
  border: none;
}

.badge.cat-work { background-color: #3b82f6; }
.badge.cat-life { background-color: #10b981; }
.badge.cat-default { background-color: #94a3b8; }

.tag {
  color: white !important;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  border: none;
}

.tag.tag-priority { background-color: #e11d48; }
.tag.tag-normal { background-color: #64748b; }
.tag.tag-default { background-color: #94a3b8; }

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag {
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
}

.status-container {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  font-weight: 500;
  font-size: 0.85rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(255,255,255,1), 0 0 4px 1px currentColor;
}

.bg-emerald-500 { background-color: #10b981; }
.shadow-emerald-500\/50 { box-shadow: 0 0 6px rgba(16, 185, 129, 0.5); }

.bg-amber-500 { background-color: #f59e0b; }
.shadow-amber-500\/50 { box-shadow: 0 0 6px rgba(245, 158, 11, 0.5); }

.bg-slate-400 { background-color: #94a3b8; }
.shadow-slate-400\/50 { box-shadow: 0 0 6px rgba(148, 163, 184, 0.5); }


/* ============================================
   ELITE MODAL — Add/Edit Report
   ============================================ */
.elite-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  animation: fadeIn 0.2s ease forwards;
}

.elite-modal {
  background: white;
  width: calc(100% - 2rem);
  max-width: 680px;
  max-height: 95vh;
  overflow-y: auto;
  border-radius: 24px;
  padding: 0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  display: flex;
  flex-direction: column;
}

.elite-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.75rem 1.25rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 24px 24px 0 0;
}

.elite-modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.elite-modal-title svg {
  color: #ffffff;
}

.elite-modal-title h2 {
  margin: 0;
  color: #ffffff;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.elite-btn-close {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 0.5rem;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
}

.elite-btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  transform: rotate(90deg);
}

.elite-modal-body {
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.elite-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.elite-form-row {
  display: flex;
  gap: 1.25rem;
}

@media (min-width: 1024px) {
  .elite-modal.report-form-modal {
    max-width: 1300px !important;
    width: 95vw !important;
  }
  .pc-grid-layout {
    display: grid !important;
    grid-template-columns: 300px 1fr 340px;
    gap: 1.5rem 2rem !important;
    align-items: stretch;
  }
  .pc-col {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .pc-actions-grid {
    grid-column: 1 / -1;
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  .pc-action-col {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
}
@media (max-width: 1023px) {
  .pc-grid-layout {
    display: flex !important;
    flex-direction: column;
  }
  .pc-actions-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .pc-action-col {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
}

/* Filter Expand Toggle */
.filter-expand-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  padding: 0.6rem;
  cursor: pointer;
  margin: 0.25rem 0 0 0;
  border-radius: 8px;
  transition: background 0.2s;
}
.filter-expand-btn:hover {
  background: #f1f5f9;
}
.rotate-180 {
  transform: rotate(180deg);
}
.filter-expand-enter-active,
.filter-expand-leave-active {
  transition: all 0.35s ease;
  overflow: hidden;
  max-height: 500px;
  opacity: 1;
}
.filter-expand-enter-from,
.filter-expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0 !important;
}

.elite-form-row .elite-form-group {
  flex: 1;
}

.elite-form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.form-group-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.75rem;
}

.elite-quote-btn {
  background: #10b981;
  color: white;
  border: 1px solid #059669;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 2px 6px -1px rgba(16, 185, 129, 0.2);
}

.elite-quote-btn:hover {
  background: #059669;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.4);
}

/* Time Picker inside Modal */
.elite-quick-times {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.elite-quick-btn {
  flex: 1;
  background: #0d3b3f;
  color: #4ade80;
  border: 1.5px solid #14532d;
  padding: 0.6rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
}

.elite-quick-btn:hover {
  background: #0a4d52;
  border-color: #22c55e;
  color: #86efac;
  box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.2);
}

.elite-quick-btn.active {
  background: #052e16;
  color: #4ade80;
  border-color: #16a34a;
  box-shadow: 0 4px 12px -2px rgba(16, 163, 74, 0.35);
}

.elite-quick-btn.active svg {
  color: #4ade80;
}

.elite-time-picker {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fafc;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
  justify-content: center;
}

.time-part, .date-part {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-part {
  flex: 1;
  justify-content: space-between;
}

.time-sep, .date-sep {
  font-weight: 700;
  color: #94a3b8;
  padding-top: 1.2rem;
}

.picker-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
}

.picker-item span {
  font-size: 0.65rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.elite-select-mini {
  appearance: none;
  background: transparent;
  border: none;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  padding: 0.2rem 0.5rem;
  text-align: center;
  cursor: pointer;
  outline: none;
  border-radius: 6px;
  min-width: 50px;
}

.elite-select-mini:hover, .elite-select-mini:focus {
  background: white;
  box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
}

/* Status Toggle inside Modal */
.elite-status-toggle {
  display: flex;
  gap: 0.4rem;
  background: #f1f5f9;
  padding: 0.35rem;
  border-radius: 12px;
}

.toggle-btn {
  flex: 1;
  padding: 0.6rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: none;
  transition: all 0.2s;
  cursor: pointer;
}

.toggle-btn:hover:not(.active-success):not(.active-warning) {
  background: rgba(255,255,255,0.5);
  color: #334155;
}

.toggle-btn.active-success {
  background: #10b981 !important;
  color: white !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.toggle-btn.active-warning {
  background: #f59e0b !important;
  color: white !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.toggle-btn.active-primary {
  background: #3b82f6 !important;
  color: white !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.toggle-btn.active-danger {
  background: #ef4444 !important;
  color: white !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* Modal Actions */
.elite-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
}

.elite-btn-save {
  color: white !important;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.elite-btn-cancel {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #475569;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.elite-btn-cancel:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.elite-btn-primary {
  padding: 0.75rem 1.75rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  color: white;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  border: none;
  box-shadow: 0 4px 12px -2px rgba(79, 70, 229, 0.3);
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.elite-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -2px rgba(79, 70, 229, 0.4);
}

.elite-btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #4f46e5;
  background: rgba(79, 70, 229, 0.1);
  border: 1.5px solid rgba(79, 70, 229, 0.2);
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.elite-btn-secondary:hover {
  background: rgba(79, 70, 229, 0.15);
}

.btn-add-continue {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.3);
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-add-continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -2px rgba(16, 185, 129, 0.4);
}

.btn-add-empty {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.3);
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-add-empty:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -2px rgba(59, 130, 246, 0.4);
}

.btn-add-primary {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  box-shadow: 0 4px 12px -2px rgba(239, 68, 68, 0.3) !important;
}

.btn-add-primary:hover {
  box-shadow: 0 8px 16px -2px rgba(239, 68, 68, 0.4) !important;
}

/* Modal Form Actions 2x2 Grid (Global for PC & Mobile) */
.form-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
}
.form-actions-grid > button {
  width: 100%;
  margin: 0;
  white-space: normal;
  text-align: center;
  line-height: 1.3;
  min-height: 48px;
  height: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
}
.form-actions-grid > button:only-child {
  grid-column: 1 / -1;
}

/* Swap "Thêm & làm tiếp" with "Hủy bỏ" globally */
.form-actions-grid .elite-btn-cancel { order: 3; color: #ef4444; }
.form-actions-grid .elite-btn-cancel:hover { background: #fee2e2; color: #dc2626; }
.form-actions-grid .btn-add-empty { order: 2; }
.form-actions-grid .btn-add-continue { order: 1; }
.form-actions-grid .btn-add-primary { 
  order: 4; 
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.3);
}
.form-actions-grid .btn-add-primary:hover {
  box-shadow: 0 8px 16px -2px rgba(16, 185, 129, 0.4);
}

.empty-day-item:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.empty-badge-morning {
  background: #fff7ed;
  color: #c2410c;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 800;
  border: 1px solid #ffedd5;
}

.empty-badge-afternoon {
  background: #f0f9ff;
  color: #0369a1;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 800;
  border: 1px solid #e0f2fe;
}


.elite-btn-secondary:hover:not(:disabled) {
  background: rgba(79, 70, 229, 0.15);
  border-color: rgba(79, 70, 229, 0.3);
  transform: translateY(-1px);
}

.elite-btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* --- STATES (Loading, Empty) --- */
.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-state svg {
  color: #cbd5e1;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

/* --- ANIMATIONS --- */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* --- RESPONSIVE --- */
@media (max-width: 1024px) {
  .report-container { padding: 1.5rem; }
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  .form-group.row {
    flex-direction: row; /* Keep as row to save height */
    gap: 1rem;
  }
  .report-table {
    display: block;
  }
  .report-table th, .report-table td {
    white-space: nowrap;
  }
}
/* --- TIME PICKER --- */
.time-picker-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}
.time-box {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #f8fafc;
  padding: 0.25rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
}
.time-box:focus-within {
  border-color: #6366f1;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.small-select select {
  padding: 0.3rem 1.25rem 0.3rem 0.4rem;
  border: none;
  background-color: transparent;
  box-shadow: none !important;
  font-weight: 600;
  font-size: 0.95rem;
  min-width: 50px;
}
.small-select select:focus {
  box-shadow: none;
  background-color: transparent;
}
.colon {
  font-weight: bold;
  color: #475569;
}
.date-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}
.date-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.95rem;
  color: #1e293b;
  background-color: #f8fafc;
  outline: none;
  transition: all 0.2s;
}
.date-input:focus {
  border-color: #6366f1;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.day-badge {
  background-color: #e0e7ff;
  color: #4338ca;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}
.slash {
  font-weight: bold;
  color: #94a3b8;
}
.picker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.item-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.mt-label {
  margin-top: 1rem;
}
.day-badge-wrapper {
  height: 38px;
  display: flex;
  align-items: center;
}
.status-toggle-btns {
  display: flex;
  gap: 0.5rem;
  background: #f8fafc;
  padding: 0.35rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
}
.btn-toggle {
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  transition: all 0.2s;
  box-shadow: none;
}
.btn-toggle:hover {
  background: #e2e8f0;
  color: #334155;
}
.btn-toggle.active-success {
  background: #10b981;
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}
.btn-toggle.active-warning {
  background: #f59e0b;
  color: white;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
}
.btn-icon.success {
  color: #10b981;
}
.btn-icon.success:hover {
  background-color: #d1fae5;
  color: #047857;
}
.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}
.clickable-row:hover {
  background-color: #f1f5f9 !important;
}
.col-index {
  font-weight: 700;
  color: #64748b;
  font-size: 0.95rem;
  text-align: center;
}
.header-actions {
  display: none;
}

/* Action Bar Container */
.action-bar-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  gap: 2rem;
}
.pc-filters {
  flex: 0 1 50%;
  margin: 0 !important;
  gap: 0.75rem;
}
.pc-filters .elite-select-group label {
  font-size: 0.65rem;
  margin-bottom: 0.25rem;
  letter-spacing: 0.2px;
}
.pc-filters :deep(.custom-select-trigger) {
  padding: 0.4rem 0.8rem !important;
  font-size: 0.75rem !important;
  min-height: 34px !important;
}
.action-bar-container .action-bar {
  margin-bottom: 0 !important;
  flex-shrink: 0;
}

/* Action Bar (below stat cards) */
.action-bar {
  display: flex !important;
  gap: 1rem;
  justify-content: flex-start;
  flex-wrap: wrap;
}

/* Desktop: Nút chức năng VIP Pro ngang hàng với Filter */
.mobile-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  height: 52px;
  padding: 0 1.75rem;
  border-radius: 9999px;
  font-weight: 800;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-sizing: border-box;
}

.action-bar-container .mobile-action-btn .icon-white-bg {
  width: 26px;
  height: 26px;
  border-radius: 8px;
}
.action-bar-container .mobile-action-btn .icon-white-bg svg {
  width: 16px;
  height: 16px;
}
.mobile-action-btn.excel {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.4), inset 0 1px 2px rgba(255,255,255,0.2);
}
.mobile-action-btn.excel:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -2px rgba(16, 185, 129, 0.5), inset 0 1px 2px rgba(255,255,255,0.2);
}
.mobile-action-btn.empty-days {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white;
  box-shadow: 0 4px 12px -2px rgba(139, 92, 246, 0.4), inset 0 1px 2px rgba(255,255,255,0.2);
}
.mobile-action-btn.empty-days:hover {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -2px rgba(139, 92, 246, 0.5), inset 0 1px 2px rgba(255,255,255,0.2);
}
.mobile-action-btn.distribute-tasks {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  box-shadow: 0 4px 12px -2px rgba(249, 115, 22, 0.4), inset 0 1px 2px rgba(255,255,255,0.2);
}
.mobile-action-btn.distribute-tasks:hover {
  background: linear-gradient(135deg, #ea580c, #c2410c);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -2px rgba(249, 115, 22, 0.5), inset 0 1px 2px rgba(255,255,255,0.2);
}
.mobile-action-btn.move-tasks {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 12px -2px rgba(239, 68, 68, 0.4), inset 0 1px 2px rgba(255,255,255,0.2);
}
.mobile-action-btn.move-tasks:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -2px rgba(239, 68, 68, 0.5), inset 0 1px 2px rgba(255,255,255,0.2);
}
.mobile-action-btn.add {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.4), inset 0 1px 2px rgba(255,255,255,0.2);
}
.mobile-action-btn.add:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -2px rgba(59, 130, 246, 0.5), inset 0 1px 2px rgba(255,255,255,0.2);
}

/* Icon badge bên trong nút - hiện cả desktop lẫn mobile */
.icon-white-bg {
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  flex-shrink: 0;
}
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* --- STAT CARDS --- */
.stats-row {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.stat-card {
  flex: 1;
  min-width: 250px;
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
.stat-icon.total {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}
.stat-icon.pending {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}
.stat-icon.done {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}
.stat-icon.failed {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
}
.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}
.unit-text {
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.8;
}
.stat-label {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Colors by Card Type */
.card-total .stat-value { color: #60a5fa !important; }
.card-total .stat-label { color: #93c5fd !important; }
.card-total.elite-active { border-color: #60a5fa !important; box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2) !important; background: rgba(96, 165, 250, 0.12) !important; }
.card-total.elite-active::after { content: ''; position: absolute; top: 0; right: 0; width: 0; height: 0; border-style: solid; border-width: 0 16px 16px 0; border-color: transparent #60a5fa transparent transparent; }

.card-pending .stat-value { color: #fbbf24 !important; }
.card-pending .stat-label { color: #fcd34d !important; }
.card-pending.elite-active { border-color: #fbbf24 !important; box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.2) !important; background: rgba(251, 191, 36, 0.12) !important; }
.card-pending.elite-active::after { content: ''; position: absolute; top: 0; right: 0; width: 0; height: 0; border-style: solid; border-width: 0 16px 16px 0; border-color: transparent #fbbf24 transparent transparent; }

.card-done .stat-value { color: #34d399 !important; }
.card-done .stat-label { color: #6ee7b7 !important; }
.card-done.elite-active { border-color: #34d399 !important; box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.2) !important; background: rgba(52, 211, 153, 0.12) !important; }
.card-done.elite-active::after { content: ''; position: absolute; top: 0; right: 0; width: 0; height: 0; border-style: solid; border-width: 0 16px 16px 0; border-color: transparent #34d399 transparent transparent; }

.card-failed .stat-value { color: #f97316 !important; }
.card-failed .stat-label { color: #fdba74 !important; }
.card-failed.elite-active { border-color: #f97316 !important; box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2) !important; background: rgba(249, 115, 22, 0.12) !important; }
.card-failed.elite-active::after { content: ''; position: absolute; top: 0; right: 0; width: 0; height: 0; border-style: solid; border-width: 0 16px 16px 0; border-color: transparent #f97316 transparent transparent; }

/* Date filter */
.date-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.date-filter label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  white-space: nowrap;
}
.date-filter input[type="date"] {
  padding: 0.65rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;
  font-size: 0.9rem;
  color: #334155;
  background-color: #f8fafc;
  transition: all 0.2s;
  font-family: inherit;
}
.date-filter input[type="date"]:focus {
  border-color: #6366f1;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

/* --- MOBILE CARD VIEW --- */
.mobile-only { display: none !important; }
.desktop-only { display: block; }

@media (max-width: 768px) {
  input, select, textarea {
    font-size: 16px !important;
  }
  .desktop-only { display: none !important; }
  .mobile-only { display: flex !important; flex-direction: column; gap: 0.75rem; }

  .report-container {
    padding: 1rem;
  }

  .header {
    display: none !important;
  }

  .action-bar-container {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .action-bar-container .action-bar {
    margin-bottom: 0.75rem !important;
  }
  .action-bar {
    display: flex !important;
    flex-direction: row !important;
    gap: 0.5rem !important;
  }
  .mobile-action-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.6rem 0.2rem;
    height: auto !important;
    min-height: 56px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    text-shadow: 0 1px 2px rgba(0,0,0,0.25);
    transition: all 0.2s ease;
  }
  .action-bar-container .mobile-action-btn .icon-white-bg {
    width: 22px !important;
    height: 22px !important;
    border-radius: 7px !important;
  }
  .action-bar-container .mobile-action-btn .icon-white-bg svg {
    width: 14px !important;
    height: 14px !important;
  }
  .real-icon {
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }
  .icon-white-bg {
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    flex-shrink: 0;
  }
  .mobile-action-btn.add .icon-white-bg, .mobile-action-btn.pending .icon-white-bg {
    width: 24px;
    height: 24px;
    border-radius: 8px;
  }
  .mobile-action-btn.excel {
    order: -1;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3);
  }
  .mobile-action-btn.excel:active {
    transform: scale(0.96);
  }
  .mobile-action-btn.empty-days {
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    color: white;
    box-shadow: 0 4px 12px -2px rgba(124, 58, 237, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3);
  }
  .mobile-action-btn.empty-days:active {
    transform: scale(0.96);
  }
  .mobile-action-btn.add, .mobile-action-btn.pending {
    order: 2;
    flex: 1 1 45%;
    min-width: 45%;
    flex-direction: row;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    border-radius: 14px;
  }
  .mobile-action-btn.add {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    box-shadow: 0 4px 15px -2px rgba(37, 99, 235, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3);
  }
  .mobile-action-btn.pending {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 4px 15px -2px rgba(239, 68, 68, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3);
  }
  .mobile-action-btn.add:active, .mobile-action-btn.pending:active {
    transform: scale(0.96);
  }
  .report-container {
    padding-bottom: 80px;
  }

  .filters {
    flex-direction: column;
  }

  .filters select {
    width: 100%;
  }

  .stats-row {
    flex-direction: row;
    gap: 0.5rem;
  }
  .stat-card {
    padding: 0.7rem 0.6rem;
    gap: 0.5rem;
    border-radius: 12px;
  }
  .stat-icon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
  }
  .stat-icon svg {
    width: 16px;
    height: 16px;
  }
  .stat-value {
    font-size: 1.15rem;
  }
  .unit-text {
    font-size: 0.7rem;
  }
  .stat-label {
    font-size: 0.65rem;
    margin-bottom: 0.15rem;
  }

  .date-filter {
    flex-wrap: wrap;
  }

  .date-filter input[type="date"] {
    flex: 1;
    min-width: 0;
  }
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.kanban-board {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: stretch;
}

@media (max-width: 768px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
}

.kanban-column {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 1.25rem;
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 300px;
  box-shadow: 0 4px 12px -2px rgba(0,0,0,0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.kanban-column::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 5px;
  z-index: 2;
}

.kanban-column:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -4px rgba(0,0,0,0.08);
}

/* VIP Pro styling cho cột Chưa xử lý */
.kb-col-pending {
  background: linear-gradient(180deg, rgba(255, 251, 235, 0.6) 0%, #ffffff 100%);
  border: 1px solid rgba(245, 158, 11, 0.2);
  box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.15);
}
.kb-col-pending::before {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.kb-col-pending .kanban-header {
  border-bottom: 2px dashed rgba(245, 158, 11, 0.25);
}
.kb-col-pending .kanban-badge {
  background: #ef4444 !important;
  color: #ffffff !important;
  border: 1px solid #dc2626 !important;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3) !important;
}


/* VIP Pro styling cho cột Thất bại */
.kb-col-failed {
  background: linear-gradient(180deg, rgba(254, 226, 226, 0.6) 0%, #ffffff 100%);
  border: 1px solid rgba(239, 68, 68, 0.2);
  box-shadow: 0 10px 30px -10px rgba(239, 68, 68, 0.15);
}
.kb-col-failed::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.kb-col-failed .kanban-header {
  border-bottom: 2px dashed rgba(239, 68, 68, 0.25);
}

/* VIP Pro styling cho cột Hoàn thành */

.kb-col-failed {
  background: linear-gradient(180deg, rgba(80, 20, 20, 0.5) 0%, rgba(15, 23, 34, 0.4) 100%) !important;
  border-color: rgba(239, 68, 68, 0.25) !important;
}

.kb-col-done {
  background: linear-gradient(180deg, rgba(236, 253, 245, 0.6) 0%, #ffffff 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.15);
}
.kb-col-done::before {
  background: linear-gradient(90deg, #10b981, #34d399);
}
.kb-col-done .kanban-header {
  border-bottom: 2px dashed rgba(16, 185, 129, 0.25);
}
.kb-col-done .kanban-badge {
  background: #ef4444 !important;
  color: #ffffff !important;
  border: 1px solid #dc2626 !important;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3) !important;
}

/* ===== DRAG-OVER ANIMATION ===== */
@keyframes kb-pulse-border {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4), 0 10px 30px -10px rgba(99, 102, 241, 0.3); }
  50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0.0), 0 10px 30px -10px rgba(99, 102, 241, 0.5); }
}

@keyframes kb-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.kb-col-drag-over {
  transform: translateY(-4px) scale(1.01) !important;
  border: 2px dashed rgba(99, 102, 241, 0.7) !important;
  animation: kb-pulse-border 1s ease-in-out infinite !important;
  z-index: 2;
}

.kb-col-drag-over::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(99, 102, 241, 0.08) 50%,
    transparent 60%
  );
  background-size: 200% auto;
  animation: kb-shimmer 1.2s linear infinite;
  pointer-events: none;
  z-index: 1;
}

.kb-col-drag-over .kanban-header {
  border-bottom-color: rgba(99, 102, 241, 0.4) !important;
}

.kanban-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 2px dashed #e2e8f0;
  margin-bottom: 0.5rem;
}

.kanban-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.kanban-title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: 0.05em;
  text-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.kanban-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 800;
  border: 1px solid #e2e8f0;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}

.kanban-list {
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
  flex: 1;
}

.mobile-card-list {
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
  padding: 0.5rem 0;
}

.report-card {
  background: white;
  border-radius: 20px;
  padding: 1.25rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 12px -2px rgba(0,0,0,0.03);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* =============================================
   TIMELINE CARD — ULTRA PREMIUM VIP PRO
   Rotating ring · Shimmer · Glassmorphism
   ============================================= */
.report-card-timeline {
  display: flex;
  align-items: center;
  gap: 0;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  animation: tl-springIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  position: relative;
  padding: 4px 0;
}
@keyframes tl-springIn {
  from { opacity: 0; transform: translateX(-16px) scale(0.95); filter: blur(4px); }
  to   { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
}
.report-card-timeline:active { transform: scale(0.975); }

/* Hover effects for content cards */
.is-failed {
  opacity: 0.65 !important;
  filter: grayscale(80%) !important;
}
.is-failed-tag {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
  box-shadow: 0 2px 4px rgba(249, 115, 22, 0.3);
}
.report-card-timeline:hover .tl-rect {
  transform: translateY(-4px) scale(1.015);
  filter: brightness(1.1);
  z-index: 10;
}
.report-card-timeline:hover .tl-rect--pending {
  box-shadow: 0 12px 32px -4px rgba(245, 158, 11, 0.3), inset 0 1px 2px rgba(255,255,255,0.1) !important;
  border-color: rgba(245, 158, 11, 1) !important;
  background: rgba(245, 158, 11, 0.12) !important;
}
.report-card-timeline:hover .tl-rect--done {
  box-shadow: 0 12px 32px -4px rgba(16, 185, 129, 0.3), inset 0 1px 2px rgba(255,255,255,0.1) !important;
  border-color: rgba(16, 185, 129, 1) !important;
  background: rgba(16, 185, 129, 0.12) !important;
}

/* ===== ORB WRAPPER ===== */
.tl-orb-wrap {
  position: relative;
  width: 96px;
  min-width: 96px;
  height: 96px;
  flex-shrink: 0;
  z-index: 2;
}

/* Rotating gradient ring */
.tl-orb-ring {
  position: absolute;
  inset: -3px;
  border-radius: 23px;
  padding: 3px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  overflow: hidden;
}
.tl-orb-ring::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  width: 200%; height: 200%;
  transform: translate(-50%, -50%);
  animation: tl-spin-center 4s linear infinite;
  z-index: -1;
}
.tl-ring--morning::before {
  background: conic-gradient(#2563eb, #3b82f6, #60a5fa, #93c5fd, #2563eb);
}
.tl-ring--afternoon::before {
  background: conic-gradient(#10b981, #34d399, #6ee7b7, #a7f3d0, #10b981);
}

@keyframes tl-spin-center {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}


/* --- DYNAMIC COLOR CLASSES --- */
.tl-ring--green::before { background: conic-gradient(#10b981, #34d399, #6ee7b7, #a7f3d0, #10b981); }
.tl-ring--orange::before { background: conic-gradient(#f59e0b, #fbbf24, #fcd34d, #fde68a, #f59e0b); }
.tl-ring--red::before { background: conic-gradient(#ef4444, #f87171, #fca5a5, #fecaca, #ef4444); }

.tl-circle--green { background: linear-gradient(145deg, #047857 0%, #10b981 50%, #34d399 100%); color: white; box-shadow: 0 8px 24px -4px rgba(16,185,129,0.5), inset 0 -3px 8px rgba(0,0,0,0.12), inset 0 2px 6px rgba(255,255,255,0.25); }
.tl-circle--orange { background: linear-gradient(145deg, #b45309 0%, #f59e0b 50%, #fbbf24 100%); color: white; box-shadow: 0 8px 24px -4px rgba(245,158,11,0.5), inset 0 -3px 8px rgba(0,0,0,0.12), inset 0 2px 6px rgba(255,255,255,0.25); }
.tl-circle--red { background: linear-gradient(145deg, #b91c1c 0%, #ef4444 50%, #f87171 100%); color: white; box-shadow: 0 8px 24px -4px rgba(239,68,68,0.5), inset 0 -3px 8px rgba(0,0,0,0.12), inset 0 2px 6px rgba(255,255,255,0.25); }

.tl-conn--green { border-color: #10b981; }
.tl-conn--orange { border-color: #f59e0b; }
.tl-conn--red { border-color: #ef4444; }

.tl-beam--green { background: linear-gradient(90deg, transparent, #10b981, transparent); box-shadow: 0 0 10px #10b981, 0 0 20px #10b981; }
.tl-beam--orange { background: linear-gradient(90deg, transparent, #f59e0b, transparent); box-shadow: 0 0 10px #f59e0b, 0 0 20px #f59e0b; }
.tl-beam--red { background: linear-gradient(90deg, transparent, #ef4444, transparent); box-shadow: 0 0 10px #ef4444, 0 0 20px #ef4444; }

.tl-rect--green { background: linear-gradient(180deg, rgba(15,23,34,0.95) 0%, rgba(15,23,34,0.85) 100%); border: 3px solid rgba(16,185,129,0.8) !important; box-shadow: 0 0 15px rgba(16,185,129,0.4); }
.tl-rect--orange { background: linear-gradient(180deg, rgba(15,23,34,0.95) 0%, rgba(15,23,34,0.85) 100%); border: 3px solid rgba(245,158,11,0.8) !important; box-shadow: 0 0 15px rgba(245,158,11,0.4); }
.tl-rect--red { background: linear-gradient(180deg, rgba(15,23,34,0.95) 0%, rgba(15,23,34,0.85) 100%); border: 3px solid rgba(239,68,68,0.8) !important; box-shadow: 0 0 15px rgba(239,68,68,0.4); }

.tl-border--green { border-color: rgba(16,185,129,0.3); }
.tl-border--orange { border-color: rgba(245,158,11,0.3); }
.tl-border--red { border-color: rgba(239,68,68,0.3); }

.tl-shimmer--green { background: linear-gradient(90deg, transparent, rgba(16,185,129,0.1), transparent); }
.tl-shimmer--orange { background: linear-gradient(90deg, transparent, rgba(245,158,11,0.1), transparent); }
.tl-shimmer--red { background: linear-gradient(90deg, transparent, rgba(239,68,68,0.1), transparent); }

.tl-ring--blue::before { background: conic-gradient(#3b82f6, #60a5fa, #93c5fd, #bfdbfe, #3b82f6); }
.tl-circle--blue { background: linear-gradient(145deg, #1d4ed8 0%, #2563eb 50%, #60a5fa 100%); color: white; box-shadow: 0 8px 24px -4px rgba(37,99,235,0.5), inset 0 -3px 8px rgba(0,0,0,0.12), inset 0 2px 6px rgba(255,255,255,0.25); }
.tl-conn--blue { border-color: #3b82f6; }
.tl-beam--blue { background: linear-gradient(90deg, transparent, #3b82f6, transparent); box-shadow: 0 0 10px #3b82f6, 0 0 20px #3b82f6; }
.tl-rect--blue { background: linear-gradient(180deg, rgba(15,23,34,0.95) 0%, rgba(15,23,34,0.85) 100%); border: 3px solid rgba(59,130,246,0.8) !important; box-shadow: 0 0 15px rgba(59,130,246,0.4); }
.tl-border--blue { border-color: rgba(59,130,246,0.3); }
.tl-shimmer--blue { background: linear-gradient(90deg, transparent, rgba(59,130,246,0.1), transparent); }
/* ===== SHAPE ===== */
.tl-circle {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  z-index: 1;
}
.tl-circle-inner {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  position: relative;
  z-index: 1;
}
.tl-circle--morning {
  background: linear-gradient(145deg, #1d4ed8 0%, #2563eb 40%, #3b82f6 100%);
  color: white;
  box-shadow: 0 8px 24px -4px rgba(37,99,235,0.5), inset 0 -3px 8px rgba(0,0,0,0.12), inset 0 2px 6px rgba(255,255,255,0.25);
}
.tl-circle--afternoon {
  background: linear-gradient(145deg, #047857 0%, #10b981 50%, #34d399 100%);
  color: white;
  box-shadow: 0 8px 24px -4px rgba(16,185,129,0.5), inset 0 -3px 8px rgba(0,0,0,0.12), inset 0 2px 6px rgba(255,255,255,0.25);
}

/* Dải sáng chạy quanh viền */
.tl-orbit-trail {
  position: absolute;
  inset: -3px;
  border-radius: 23px;
  padding: 3px;
  z-index: 3;
  pointer-events: none;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  overflow: hidden;
}
.tl-orbit-trail::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  width: 200%; height: 200%;
  transform: translate(-50%, -50%);
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 260deg,
    rgba(255,255,255,0.6) 300deg,
    white 345deg,
    transparent 360deg
  );
  animation: tl-spin-center 2.5s linear infinite;
}

/* Thứ + Buổi — to, đậm, trắng rõ */
.tl-thu-period {
  font-size: 0.62rem; font-weight: 900; opacity: 1;
  text-transform: uppercase; line-height: 1;
  letter-spacing: 0.05em;
  display: flex; align-items: center; gap: 3px;
  color: white;
  text-shadow: 0 1px 3px rgba(0,0,0,0.25);
}
.tl-period {
  font-size: 0.62rem; font-weight: 900;
  padding: 2px 7px; border-radius: 6px;
  text-transform: uppercase; line-height: 1.2;
  letter-spacing: 0.06em;
  background: white;
  text-shadow: none;
}
.tl-period.is-morning {
  color: #2563eb;
}
.tl-period.is-afternoon {
  color: #059669;
}
/* Ngày/tháng/năm — to, đậm, trắng rõ */
.tl-date {
  font-size: 0.62rem; font-weight: 900; opacity: 1;
  line-height: 1; font-feature-settings: 'tnum';
  letter-spacing: 0.01em;
  color: white;
  text-shadow: 0 1px 3px rgba(0,0,0,0.25);
}
/* Giờ:phút — nhỏ */
.tl-time {
  font-size: 0.42rem; font-weight: 600; line-height: 1;
  opacity: 0.7; letter-spacing: 0.01em;
  font-feature-settings: 'tnum';
}
/* STT — nhỏ */
.tl-stt {
  font-size: 0.38rem; font-weight: 600; opacity: 0.6;
  letter-spacing: 0.04em; line-height: 1;
}

/* PC Size Adjustments */
@media (min-width: 769px) {
  .tl-orb-wrap {
    width: 120px;
    min-width: 120px;
    height: 120px;
  }
  .tl-circle-inner {
    gap: 3px;
  }
  .tl-thu-period {
    font-size: 0.85rem;
    gap: 4px;
  }
  .tl-period {
    font-size: 0.75rem;
    padding: 3px 8px;
    border-radius: 8px;
  }
  .tl-date {
    font-size: 0.95rem;
  }
  .tl-time {
    font-size: 0.6rem;
  }
  .tl-stt {
    font-size: 0.55rem;
  }
}

/* ===== CONNECTOR ===== */
.tl-connector {
  width: 16px; min-width: 16px; height: 2px;
  align-self: center; flex-shrink: 0;
  z-index: 3; position: relative;
  margin-left: -2px; margin-right: -2px;
  overflow: visible;
}
.tl-conn--morning { background: linear-gradient(90deg, #3b82f6, rgba(59,130,246,0.15)); }
.tl-conn--afternoon { background: linear-gradient(90deg, #10b981, rgba(16,185,129,0.15)); }
.tl-conn-dot {
  position: absolute; right: -2px; top: 50%; transform: translateY(-50%);
  width: 5px; height: 5px; border-radius: 50%;
  background: inherit; opacity: 0.6;
}

/* ===== LIGHT BEAM — Synced with orbit trail (2.5s) ===== */
.tl-beam-particle {
  position: absolute;
  top: 50%; left: 0;
  width: 5px; height: 5px;
  border-radius: 50%;
  transform: translate(-20px, -50%);
  opacity: 0; z-index: 5;
  will-change: transform, opacity;
  animation: tl-beamTravel 2.5s linear infinite;
}
.tl-beam-particle::after {
  content: '';
  position: absolute; top: 50%; right: 50%;
  width: 24px; height: 2px;
  transform: translateY(-50%);
  border-radius: 1px 0 0 1px;
}
.tl-beam--morning {
  background: radial-gradient(circle, #fff 0%, #60a5fa 50%, transparent 100%);
  box-shadow: 0 0 3px 1px rgba(255,255,255,0.8), 0 0 8px 3px rgba(96,165,250,0.7), 0 0 16px 5px rgba(59,130,246,0.3);
}
.tl-beam--morning::after {
  background: linear-gradient(90deg, transparent, rgba(59,130,246,0.15) 25%, rgba(96,165,250,0.45) 70%, rgba(255,255,255,0.7));
}
.tl-beam--afternoon {
  background: radial-gradient(circle, #fff 0%, #34d399 50%, transparent 100%);
  box-shadow: 0 0 3px 1px rgba(255,255,255,0.8), 0 0 8px 3px rgba(52,211,153,0.7), 0 0 16px 5px rgba(16,185,129,0.3);
}
.tl-beam--afternoon::after {
  background: linear-gradient(90deg, transparent, rgba(16,185,129,0.15) 25%, rgba(52,211,153,0.45) 70%, rgba(255,255,255,0.7));
}
/* Orbit trail bright spot tại 345° đi qua connector (90°) ở ~29% của 2.5s */
@keyframes tl-beamTravel {
  0%   { transform: translate(-20px, -50%); opacity: 0; }
  27%  { transform: translate(-20px, -50%); opacity: 0; }
  30%  { transform: translate(-14px, -50%); opacity: 1; }
  48%  { transform: translate(8px, -50%);   opacity: 1; }
  52%  { transform: translate(8px, -50%);   opacity: 0; }
  100% { transform: translate(8px, -50%);   opacity: 0; }
}

/* ===== IMPACT — Nhẹ nhàng, vừa đủ ===== */
.tl-impact-glow {
  position: absolute; top: 50%; left: -1px;
  width: 10px; height: 35px;
  transform: translate(-50%, -50%) scaleX(0);
  border-radius: 50%;
  pointer-events: none; z-index: 11;
  will-change: transform, opacity;
  animation: tl-impactPulse 2.5s ease infinite;
}
.tl-glow--morning {
  background: radial-gradient(ellipse, rgba(255,255,255,0.9) 0%, rgba(96,165,250,0.4) 40%, transparent 75%);
}
.tl-glow--afternoon {
  background: radial-gradient(ellipse, rgba(255,255,255,0.9) 0%, rgba(52,211,153,0.4) 40%, transparent 75%);
}
@keyframes tl-impactPulse {
  0%   { transform: translate(-50%, -50%) scaleX(0) scaleY(0.3); opacity: 0; }
  46%  { transform: translate(-50%, -50%) scaleX(0) scaleY(0.3); opacity: 0; }
  50%  { transform: translate(-50%, -50%) scaleX(1.2) scaleY(1); opacity: 0.9; }
  60%  { transform: translate(-50%, -50%) scaleX(0.2) scaleY(1.3); opacity: 0; }
  100% { transform: translate(-50%, -50%) scaleX(0.2) scaleY(1.3); opacity: 0; }
}

/* ===== BORDER TRACE — 2 bên: lên + xuống từ cạnh trái ===== */
.tl-rect-beam-spread {
  position: absolute; inset: 0;
  border-radius: inherit;
  pointer-events: none; z-index: 10;
  padding: 2px;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  overflow: hidden;
  opacity: 0.3;
  will-change: opacity;
  animation: tl-traceGlow 2.5s linear infinite;
}

/* ============ FILE ATTACHMENT BADGE ============ */
.file-attach-badge {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.file-attach-badge:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.file-attach-text {
  color: #ffffff;
  word-break: break-word;
  white-space: normal;
  flex: 1;
}

/* ::before đi lên (clockwise: left → top → right) */
.tl-spread--morning::before,
.tl-spread--afternoon::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  width: 200%; height: 200%;
  transform-origin: center;
  transform: translate(-50%, -50%) rotate(0deg);
  will-change: transform;
  animation: tl-chaseUp 2.5s linear infinite;
}
/* ::after đi xuống (counter-clockwise: left → bottom → right) */
.tl-spread--morning::after,
.tl-spread--afternoon::after {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  width: 200%; height: 200%;
  transform-origin: center;
  transform: translate(-50%, -50%) rotate(0deg);
  will-change: transform;
  animation: tl-chaseDown 2.5s linear infinite;
}

.tl-spread--morning::before,
.tl-spread--morning::after {
  background: conic-gradient(
    from 0deg,
    transparent 0deg, transparent 210deg,
    rgba(59,130,246,0.05) 235deg,
    rgba(96,165,250,0.2) 253deg,
    rgba(147,197,253,0.5) 264deg,
    rgba(255,255,255,0.9) 270deg,
    rgba(147,197,253,0.5) 276deg,
    rgba(96,165,250,0.2) 287deg,
    rgba(59,130,246,0.05) 305deg,
    transparent 330deg, transparent 360deg
  );
}
.tl-spread--afternoon::before,
.tl-spread--afternoon::after {
  background: conic-gradient(
    from 0deg,
    transparent 0deg, transparent 210deg,
    rgba(16,185,129,0.05) 235deg,
    rgba(52,211,153,0.2) 253deg,
    rgba(110,231,183,0.5) 264deg,
    rgba(255,255,255,0.9) 270deg,
    rgba(110,231,183,0.5) 276deg,
    rgba(52,211,153,0.2) 287deg,
    rgba(16,185,129,0.05) 305deg,
    transparent 340deg, transparent 360deg
  );
}

/* Trace luôn hiện, pulse sáng khi beam chạm */
@keyframes tl-traceGlow {
  0%   { opacity: 0.3; }
  48%  { opacity: 0.3; }
  52%  { opacity: 1; }
  75%  { opacity: 0.8; }
  100% { opacity: 0.3; }
}
/* Đi lên liên tục: clockwise 180° mỗi chu kỳ */
@keyframes tl-chaseUp {
  0%   { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(180deg); }
}
/* Đi xuống liên tục: counter-clockwise 180° mỗi chu kỳ */
@keyframes tl-chaseDown {
  0%   { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(-180deg); }
}

/* ===== RECTANGLE — Frosted Glass Premium ===== */
.tl-rect {
  flex: 1; min-width: 0;
  border-radius: 20px;
  padding: 1.25rem 1.1rem 0.9rem 1.1rem;
  display: flex; flex-direction: column; gap: 0.55rem;
  position: relative; overflow: hidden;
  transition: all 0.35s ease;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* ===== SHIMMER BORDER ÁNH KIM ===== */
.tl-shimmer-border {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 10;
  padding: 2px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  overflow: hidden;
}

.tl-shimmer-border::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  width: 250%; height: 250%;
  transform: translate(-50%, -50%);
  animation: borderRotate 4s linear infinite;
}

.tl-shimmer--pending::before {
  background: conic-gradient(
    from 0deg,
    transparent 0%,
    rgba(252, 211, 77, 0.1) 40%,
    rgba(252, 211, 77, 0.9) 50%,
    rgba(252, 211, 77, 0.1) 60%,
    transparent 100%
  );
}

.tl-shimmer--done::before {
  background: conic-gradient(
    from 0deg,
    transparent 0%,
    rgba(110, 231, 183, 0.1) 40%,
    rgba(110, 231, 183, 0.9) 50%,
    rgba(110, 231, 183, 0.1) 60%,
    transparent 100%
  );
}

@keyframes borderRotate {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

.tl-rect--done {
  background: rgba(15, 23, 34, 0.6);
  border: 2px solid rgba(16, 185, 129, 0.8) !important;
  border-top-width: 3px !important;
  box-shadow: 0 4px 20px -2px rgba(16, 185, 129, 0.1), inset 0 1px 1px rgba(255,255,255,0.05) !important;
}
.tl-rect--pending {
  background: rgba(15, 23, 34, 0.6);
  border: 2px solid rgba(245, 158, 11, 0.8) !important;
  border-top-width: 3px !important;
  box-shadow: 0 4px 20px -2px rgba(245, 158, 11, 0.1), inset 0 1px 1px rgba(255,255,255,0.05) !important;
}
.tl-border--morning { 
  border: 1px solid rgba(59,130,246,0.45); 
  box-shadow: 0 4px 16px -2px rgba(59,130,246,0.15), 0 2px 6px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.6);
}
.tl-border--afternoon { 
  border: 1px solid rgba(16,185,129,0.45); 
  box-shadow: 0 4px 16px -2px rgba(16,185,129,0.15), 0 2px 6px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.6);
}

/* Accent stripe */
.tl-accent-stripe {
  height: 3px; border-radius: 0;
  margin: 0 -1.1rem; margin-bottom: 0.3rem;
}
.tl-stripe--morning { background: linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6); }
.tl-stripe--afternoon { background: linear-gradient(90deg, #10b981, #34d399, #10b981); }

/* Header */
.tl-rect-header {
  display: flex; align-items: center;
  justify-content: flex-end; gap: 0.35rem;
  min-height: 1.4rem;
}
.tl-rect-tags {
  position: absolute;
  top: 0;
  left: 0;
  display: flex; align-items: stretch;
  gap: 0;
  z-index: 5;
  border-radius: 20px 0 10px 0;
  overflow: hidden;
  box-shadow: 0 2px 8px -2px rgba(0,0,0,0.25);
}
.tl-badge-cat {
  padding: 0.22rem 0.6rem;
  font-size: 0.58rem; font-weight: 800; color: white;
  letter-spacing: 0.05em; text-transform: uppercase;
  display: flex; align-items: center;
}
.tl-badge-cat.cat-work { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }
.tl-badge-cat.cat-life { background: linear-gradient(135deg, #047857, #10b981); }
.tl-badge-cat.cat-default { background: linear-gradient(135deg, #475569, #94a3b8); }
.tl-badge-tag {
  padding: 0.22rem 0.5rem;
  font-size: 0.52rem; font-weight: 800; color: white;
  letter-spacing: 0.04em; text-transform: uppercase;
  display: flex; align-items: center;
}
.tl-badge-tag.tag-priority { background: linear-gradient(135deg, #9f1239, #e11d48); }
.tl-badge-tag.tag-normal { background: linear-gradient(135deg, #374151, #6b7280); }
.tl-badge-tag.tag-default { background: linear-gradient(135deg, #475569, #94a3b8); }

/* Status chip */
.tl-status-chip {
  display: inline-flex; align-items: center; gap: 0.2rem;
  padding: 0.22rem 0.5rem;
  font-size: 0.55rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.05em;
  white-space: nowrap; flex-shrink: 0; color: white;
}
.tl-status-chip.pill-success { background: linear-gradient(135deg, #047857, #10b981) !important; }
.tl-status-chip.pill-warning { background: linear-gradient(135deg, #92400e, #f59e0b) !important; }
.tl-status-chip.pill-default { background: linear-gradient(135deg, #374151, #9ca3af) !important; }

/* Body */
.tl-rect-body { padding: 0.15rem 0.2rem; }
.tl-body-text {
  font-size: 0.92rem; font-weight: 600; color: #ffffff;
  line-height: 1.55; word-break: break-word;
  letter-spacing: -0.01em;
}

/* Note — Quote style */
.tl-rect-note {
  display: flex; align-items: stretch; gap: 0;
  border-radius: 10px; overflow: hidden;
  background: linear-gradient(135deg, rgba(255,228,230,0.45), rgba(254,205,211,0.2));
  backdrop-filter: blur(8px);
}
.tl-note-accent {
  width: 3.5px; min-width: 3.5px; flex-shrink: 0;
  background: linear-gradient(180deg, #fb7185, #e11d48);
  border-radius: 3px 0 0 3px;
}
.tl-note-content {
  display: flex; align-items: flex-start; gap: 0.35rem;
  padding: 0.45rem 0.6rem;
  font-size: 0.78rem; color: #881337;
  font-style: italic; line-height: 1.5;
}
.tl-note-content span { flex: 1; }
.tl-note-icon {
  height: 18px; padding: 0 4px;
  border-radius: 4px;
  background: rgba(244,63,94,0.15);
  display: flex; align-items: center; justify-content: center;
  color: #f87171 !important; flex-shrink: 0;
  font-size: 0.65rem; font-weight: 800; letter-spacing: 0.5px;
}

/* Actions */
.tl-rect-actions {
  display: flex; gap: 0.35rem;
  padding-top: 0.35rem; margin-top: auto;
}
.tl-action-btn {
  flex: 1; display: flex; align-items: center; justify-content: center;
  gap: 0.3rem; padding: 0.5rem 0.6rem;
  border-radius: 10px; font-size: 0.75rem; font-weight: 700;
  letter-spacing: 0.03em; border: none; cursor: pointer;
  transition: all 0.2s ease; position: relative; overflow: hidden;
}
.tl-action-btn::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 45%);
  border-radius: inherit; pointer-events: none;
}
.tl-action-delete {
  background: transparent;
  color: #dc2626; border: 1.5px solid rgba(239,68,68,0.3);
  box-shadow: none;
}
.tl-action-done {
  background: linear-gradient(135deg, #047857, #10b981);
  color: white; box-shadow: 0 3px 10px -3px rgba(16,185,129,0.45);
}
.tl-action-delete:active, .tl-action-done:active {
  transform: scale(0.92); box-shadow: none;
}

.pill-success { background: #10b981 !important; color: white !important; }
.pill-warning { background: #f59e0b !important; color: white !important; }
.pill-default { background: #94a3b8 !important; color: white !important; }

.status-pill-tag {
  display: inline-flex;
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-pill-mini {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  text-transform: uppercase;
  color: white !important;
}

.report-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -8px rgba(0,0,0,0.1);
  border-color: #e2e8f0;
}

.border-status-success { border-left: 5px solid #10b981 !important; }
.border-status-warning { border-left: 5px solid #f59e0b !important; }

/* --- NEW CARD STYLES (REARRANGED) --- */
.card-row-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.card-time-group {
  flex: 1;
}

.time-primary {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
}

.time-primary svg { color: #10b981; }

.time-secondary {
  font-size: 0.8rem;
  color: #047857;
  font-weight: 600;
  margin-top: 0.1rem;
}



.card-row-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.card-row-content {
  margin-bottom: 0.75rem;
}

.content-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
}

.card-row-note {
  background: #fff1f2;
  padding: 0.75rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  border-left: 3px solid #fecdd3;
}

.content-note {
  font-size: 0.85rem;
  color: #9f1239;
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-style: italic;
  line-height: 1.5;
}

.content-note svg {
  margin-top: 0.2rem;
  flex-shrink: 0;
  opacity: 0.7;
}

.card-row-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.btn-action-full {
  flex: 1;
  padding: 0.6rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  transition: all 0.2s;
}

.btn-action-full.success {
  background: #10b981;
  color: white;
  border: 1px solid #059669;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.btn-action-full.delete {
  background: #ef4444;
  color: white;
  border: 1px solid #dc2626;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.btn-action-full:active {
  transform: scale(0.95);
  box-shadow: none;
}

.category-badge {
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  color: white;
}

.cat-work { background: #3b82f6; }
.cat-life { background: #10b981; }
.cat-default { background: #94a3b8; }

.tag-mini {
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: white;
}

.tag-priority { background: #e11d48; }
.tag-normal { background: #64748b; }
.tag-default { background: #94a3b8; }
.filters {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px -2px rgba(0,0,0,0.04);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  margin-bottom: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: #64748b;
}

@keyframes progress-indeterminate {
  0% { left: -50%; width: 50%; }
  50% { left: 25%; width: 80%; }
  100% { left: 100%; width: 50%; }
}

/* CUSTOMER MODAL LIST STYLES */
.customer-list-item {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  background: transparent;
  border-left: 3px solid transparent;
}
.customer-list-item:last-child {
  border-bottom: none;
}
.customer-list-item:hover {
  background: white;
  border-left-color: #10b981;
  box-shadow: 0 4px 12px -4px rgba(0,0,0,0.05);
}
.customer-list-item .c-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 1.05rem;
  transition: color 0.2s;
}
.customer-list-item:hover .c-name {
  color: #059669;
}
.customer-list-item .c-company {
  color: #64748b;
  font-size: 0.85rem;
  margin-top: 0.3rem;
  font-weight: 500;
}
.customer-list-item .c-phone {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: 0.2rem;
  font-family: 'JetBrains Mono', monospace;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.filter-group select {
  min-width: 160px;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8fafc;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.filter-actions {
  margin-left: auto;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-actions {
    margin-left: 0;
  }
  .date-filter {
    flex-direction: column;
    align-items: stretch;
  }
  .modal {
    padding: 1.25rem;
    padding-bottom: 1.5rem;
    border-radius: 16px;
    width: calc(100% - 1.5rem);
  }
  .modal-actions {
    margin-top: 1rem;
    padding-top: 0.75rem;
  }
  .modal-header {
    margin-bottom: 0.75rem;
  }
}

.highlight-row {
  background-color: rgba(34, 197, 94, 0.15) !important;
  transition: background-color 0.5s ease;
}

.highlight-card {
  background: rgba(239, 68, 68, 0.15) !important;
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3) !important;
  transition: all 0.3s ease;
}

/* ============================================
   ELITE FILTER PANEL — Glassmorphism + Accent
   ============================================ */
.elite-filter-panel {
  position: relative;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    0 8px 32px -4px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.02),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
  z-index: 10;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.elite-filter-panel:hover {
  box-shadow:
    0 16px 48px -8px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
.elite-filter-accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10b981 0%, #34d399 40%, #6ee7b7 70%, #a7f3d0 100%);
  border-radius: 20px 20px 0 0;
}
.elite-filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.75rem 0;
}
.elite-filter-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.01em;
}
.elite-filter-title svg { color: #10b981; }
.elite-refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.1rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(52, 211, 153, 0.08) 100%);
  color: #10b981;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(16, 185, 129, 0.12);
  transition: all 0.25s ease;
}
.elite-refresh-btn:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.2);
}
.elite-filter-body {
  padding: 1.25rem 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.elite-filter-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: nowrap;
}
/* Mode Tabs */
.elite-mode-tabs {
  display: flex;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 12px;
  padding: 4px;
  gap: 3px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
}
.elite-mode-tabs button {
  padding: 0.5rem 1.4rem;
  border-radius: 9px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: none;
}
.elite-mode-tabs button.active {
  background: #0f172a;
  color: #34d399;
  box-shadow: 0 2px 8px -1px rgba(15, 23, 42, 0.4), 0 1px 2px rgba(15, 23, 42, 0.2);
}
.elite-mode-tabs button:hover:not(.active) {
  color: #334155;
  background: rgba(255, 255, 255, 0.5);
}
/* Date groups */
.elite-date-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 120px;
  flex: 1;
}
.group-period {
  order: -1;
}
.elite-date-group label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0;
}
.elite-input {
  width: 100%;
  padding: 0.6rem 1.2rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 9999px;
  font-family: inherit;
  font-size: 0.875rem;
  color: #1e293b;
  background: rgba(248, 250, 252, 0.8);
  transition: all 0.25s ease;
  box-sizing: border-box;
  font-weight: 500;
}
textarea.elite-input {
  border-radius: 12px;
  padding: 1rem 1.2rem;
}
.elite-input:focus {
  border-color: #10b981;
  background: white;
  outline: none;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2), 0 2px 8px -2px rgba(16, 185, 129, 0.3);
}
.elite-range-sep {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  color: #10b981;
  font-size: 1.1rem;
  font-weight: 600;
  opacity: 0.6;
}
/* Select groups */
.elite-select-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 150px;
  flex: 1;
}
.elite-select-group label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0;
}
.elite-select {
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 1.2rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 9999px;
  font-family: inherit;
  font-size: 0.875rem;
  color: #1e293b;
  background: rgba(248, 250, 252, 0.8);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 14px;
  transition: all 0.25s ease;
  box-sizing: border-box;
  font-weight: 500;
}
.elite-select:focus {
  border-color: #34d399;
  background-color: white;
  outline: none;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.08), 0 2px 8px -2px rgba(16, 185, 129, 0.12);
}

.elite-select option {
  background-color: #0f172a; /* Nền xanh đậm */
  color: #10b981; /* Chữ xanh lá cây */
  font-weight: 600;
  padding: 8px;
}
.elite-filter-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e2e8f0 30%, #e2e8f0 70%, transparent 100%);
}

/* ============================================
   ELITE TABLE — Dark Header + Premium Rows
   ============================================ */
.elite-table-container {
  background: white;
  border-radius: 20px;
  box-shadow:
    0 8px 32px -4px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.04);
}
.elite-table-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid #d1fae5;
  background: linear-gradient(180deg, #ecfdf5 0%, #f0fdf4 50%, white 100%);
  position: relative;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.toolbar-left svg { color: #10b981; }
.toolbar-left h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: #065f46;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: absolute;
  right: 1.75rem;
}
.record-badge {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #ffffff;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 800;
  border: 1px solid rgba(239, 68, 68, 0.4);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  letter-spacing: 0.02em;
}
.elite-table-scroll { overflow-x: auto; }
.elite-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.elite-table thead tr {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%);
}
.elite-table th {
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  white-space: nowrap;
  position: relative;
}
.elite-table th:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0; top: 28%; height: 44%;
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
}
.elite-table .elite-row {
  animation: fadeIn 0.4s ease forwards;
  opacity: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}
.elite-table .elite-row:nth-child(1) { animation-delay: 0.03s; }
.elite-table .elite-row:nth-child(2) { animation-delay: 0.06s; }
.elite-table .elite-row:nth-child(3) { animation-delay: 0.09s; }
.elite-table .elite-row:nth-child(4) { animation-delay: 0.12s; }
.elite-table .elite-row:nth-child(5) { animation-delay: 0.15s; }
.elite-table .elite-row:nth-child(6) { animation-delay: 0.18s; }
.elite-table .elite-row:nth-child(7) { animation-delay: 0.21s; }
.elite-table .elite-row:nth-child(8) { animation-delay: 0.24s; }
.elite-table .elite-row:nth-child(odd) {
  background: rgba(16, 185, 129, 0.04);
}
.elite-table .elite-row:hover {
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.03) 50%, transparent 100%);
  box-shadow: inset 4px 0 0 #10b981;
}
.elite-table .elite-row:hover td:first-child {
  padding-left: calc(1.5rem + 4px);
}
.elite-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 0.9rem;
  color: #334155;
  transition: padding 0.2s ease;
}

.deleting-row {
  animation: fadeOutDelete 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
  pointer-events: none;
}

@keyframes fadeOutDelete {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.98); opacity: 0.5; background-color: #fef2f2; }
  100% { transform: scale(0.95); opacity: 0; background-color: #fef2f2; }
}
.elite-table .elite-row:last-child td { border-bottom: none; }
/* Row Index Badge */
.row-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px; height: 32px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.78rem;
  color: #475569;
  transition: all 0.2s;
}
.elite-row:hover .row-index {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #10b981;
}
/* Time Cell */
.elite-time-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.elite-time-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.elite-time-hm {
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
  font-feature-settings: 'tnum';
  letter-spacing: 0.02em;
}
.elite-time-thu {
  color: #10b981;
  font-weight: 600;
  font-size: 0.7rem;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  letter-spacing: 0.02em;
}
.elite-time-period {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.elite-time-period.is-morning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.elite-time-period.is-afternoon {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.period-tag-mini {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  margin-left: 0.4rem;
  text-transform: uppercase;
}
.period-tag-mini.is-morning {
  background: #fef3c7;
  color: #d97706;
}
.period-tag-mini.is-afternoon {
  background: #dbeafe;
  color: #2563eb;
}

.elite-time-date {
  font-size: 0.78rem;
  color: #047857;
  font-weight: 600;
  font-feature-settings: 'tnum';
}
/* Elite Action Buttons */
.elite-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  margin-left: 0.35rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
}
.elite-action-btn.success {
  background: #10b981;
  color: white;
  box-shadow: 0 2px 6px -1px rgba(16, 185, 129, 0.3);
}
.elite-action-btn.success:hover {
  background: #059669;
  transform: scale(1.08);
  box-shadow: 0 4px 10px -2px rgba(16, 185, 129, 0.5);
}
.elite-action-btn.delete {
  background: #ef4444;
  color: white;
  box-shadow: 0 2px 6px -1px rgba(239, 68, 68, 0.3);
}
.elite-action-btn.delete:hover {
  background: #dc2626;
  transform: scale(1.08);
  box-shadow: 0 4px 10px -2px rgba(239, 68, 68, 0.5);
}

/* Filter mobile responsive */
@media (max-width: 768px) {
  .mobile-action-btn {
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
    border-radius: 10px;
  }
  .elite-filter-panel {
    border-radius: 12px;
  }
  .elite-filter-header {
    padding: 0.75rem 1rem 0;
  }
  .elite-filter-header .elite-filter-title span {
    font-size: 0.85rem;
  }
  .elite-filter-body {
    padding: 0.75rem 1rem 1rem;
    gap: 0.6rem;
  }
  .elite-filter-divider {
    margin: 0.25rem 0;
  }

  /* Row 1: Mode tabs stay horizontal */
  .elite-filter-row {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 0.5rem;
  }
  .elite-mode-tabs {
    width: 100%;
  }
  .elite-mode-tabs button {
    flex: 1;
    justify-content: center;
    padding: 0.45rem 0.5rem;
    font-size: 0.8rem;
  }

  .elite-date-group {
    flex: 1;
    min-width: 0;
    max-width: none;
  }
  .elite-date-group.group-tabs {
    flex: 1 1 65% !important;
  }
  .elite-date-group.group-period {
    order: 0;
    flex: 1 1 25% !important;
    max-width: none !important;
  }
  .elite-date-group.group-date {
    flex: 1 1 100% !important;
    margin-bottom: 0.2rem;
  }
  
  .elite-date-group label {
    font-size: 0.75rem;
    margin-bottom: 0.35rem;
    color: #f8fafc !important;
  }
  .elite-date-group .elite-input {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
    width: 100%;
    box-sizing: border-box;
  }
  .elite-range-sep {
    display: none !important;
  }

  /* Row 3: Selects in 2x2 grid */
  .elite-filter-row:last-child {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  .elite-select-group {
    min-width: 0;
  }
  .elite-select-group label {
    font-size: 0.7rem;
    margin-bottom: 0.15rem;
  }

  /* Mobile overrides for Modal Form Actions Grid */
  .form-actions-grid {
    gap: 0.6rem;
  }
  .form-actions-grid > button {
    padding: 0.6rem 0.4rem !important;
    font-size: 0.85rem !important;
    min-height: 44px;
  }

  /* Compact Modal Layout for Mobile - LEFT SIDEBAR */
  .elite-modal-overlay {
    justify-content: flex-start !important;
    align-items: stretch !important;
  }
  .elite-modal {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    max-height: 100vh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    margin: 0 !important;
    animation: slideRightMobile 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
  }
  @keyframes slideRightMobile {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  .elite-modal-header {
    padding: 1rem 1.25rem 0.75rem;
  }
  .elite-modal-body {
    padding: 0.8rem 1.25rem 1.25rem;
    padding-bottom: calc(1.25rem + env(safe-area-inset-bottom, 40px));
    gap: 0.8rem;
  }
  .elite-form-row {
    gap: 0.8rem;
  }
  .elite-form-group {
    gap: 0.35rem;
  }
  .elite-form-group label {
    font-size: 0.75rem;
    margin-bottom: 0;
  }
  .elite-time-picker {
    padding: 0.4rem 0.25rem;
    gap: 0.25rem;
    flex-wrap: nowrap;
    justify-content: space-between;
    overflow-x: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .elite-time-picker::-webkit-scrollbar {
    display: none;
  }
  .elite-time-picker .time-part,
  .elite-time-picker .date-part {
    gap: 0.15rem;
  }
  .elite-time-picker .elite-select-mini {
    min-width: unset;
    padding: 0.2rem 0.1rem;
    font-size: 0.8rem;
  }
  .elite-time-picker .picker-item span {
    font-size: 0.55rem;
  }
  .elite-time-picker .time-sep,
  .elite-time-picker .date-sep {
    padding-top: 1rem;
    margin: 0;
    font-size: 0.8rem;
  }
  .elite-quick-times {
    margin-bottom: 0.25rem;
    gap: 0.5rem;
  }
  .elite-quick-btn {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  .elite-modal-actions {
    margin-top: 0.25rem;
    padding-top: 0.75rem;
  }
  .elite-input, .elite-select {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }
}

/* =========================================================
   DARK THEME VIP PRO OVERRIDES (Microsoft / Youtube Theme)
   ========================================================= */
.elite-filter-panel {
  background: rgba(20, 32, 50, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: #f8fafc !important;
  box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05) !important;
}

/* Modal: giữ màu sáng như ban đầu */
.elite-modal {
  background: white !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  color: #0f172a !important;
  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.4) !important;
}

/* Modal Dark Mode Theme (Chiều) */
.elite-modal.dark-mode-modal {
  background: #1e293b !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: #f8fafc !important;
}
.elite-modal.dark-mode-modal .elite-modal-title h2,
.elite-modal.dark-mode-modal label,
.elite-modal.dark-mode-modal .elite-form-group label,
.elite-modal.dark-mode-modal p {
  color: #f8fafc !important;
}
.elite-modal.dark-mode-modal .elite-input,
.elite-modal.dark-mode-modal .elite-select,
.elite-modal.dark-mode-modal .elite-textarea,
.elite-modal.dark-mode-modal .elite-select-mini {
  background: rgba(15, 23, 42, 0.6) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #f8fafc !important;
}
.elite-modal.dark-mode-modal .elite-input:focus,
.elite-modal.dark-mode-modal .elite-select:focus,
.elite-modal.dark-mode-modal .elite-textarea:focus {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25) !important;
}
.elite-modal.dark-mode-modal .elite-btn-save {
  background: linear-gradient(135deg, #a855f7, #7e22ce) !important;
  box-shadow: 0 4px 15px -3px rgba(168, 85, 247, 0.5) !important;
}
.elite-modal.dark-mode-modal .elite-btn-save:hover {
  background: linear-gradient(135deg, #9333ea, #6b21a8) !important;
}
.elite-modal.dark-mode-modal .upload-zone {
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
.elite-modal.dark-mode-modal .upload-zone:hover {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: #a855f7 !important;
}
.elite-modal.dark-mode-modal .elite-modal-title svg {
  color: #ffffff !important;
}
.elite-modal.dark-mode-modal .elite-modal-header {
  border-bottom-color: rgba(255, 255, 255, 0.08) !important;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
}

.elite-modal.dark-mode-modal .elite-btn-cancel {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #cbd5e1 !important;
}
.elite-modal.dark-mode-modal .elite-btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #f8fafc !important;
}
.elite-modal.dark-mode-modal .elite-btn-close {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.2) !important;
}
.elite-modal.dark-mode-modal .elite-btn-close:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

.elite-modal .elite-modal-title h2,
.elite-modal label,
.elite-modal .elite-form-group label,
.elite-modal p {
  color: #1e293b !important;
}

.elite-modal .elite-input,
.elite-modal .elite-select,
.elite-modal .elite-textarea,
.elite-modal .elite-select-mini {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
  color: #0f172a !important;
}

.elite-modal .elite-modal-header {
  border-bottom-color: #f1f5f9 !important;
}

.elite-table-toolbar {
  background: transparent !important;
  color: #f8fafc !important;
}

.elite-filter-title, .toolbar-left h3, .kanban-title h3, .elite-modal-title h2, .tl-body-text {
  color: #f8fafc !important;
}

.elite-input, .elite-select, .elite-textarea, .elite-select-mini, .time-picker-wrapper select {
  background: rgba(0, 0, 0, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #f8fafc !important;
}

.elite-input::placeholder, .elite-textarea::placeholder {
  color: #64748b !important;
}

.elite-mode-tabs {
  background: rgba(0, 0, 0, 0.4) !important;
}

.elite-mode-tabs button[style*="background: white"],
.elite-mode-tabs button.active {
  background: #ffffff !important;
  color: #065f46 !important;
  font-weight: 800 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
}

.elite-mode-tabs button {
  color: #94a3b8 !important;
}

.tl-rect {
  background: rgba(15, 23, 34, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

/* Pending cards: nền trong suốt, viền cam dày */
.tl-rect--pending {
  background: rgba(15, 23, 34, 0.6) !important;
  border: 2px solid rgba(245, 158, 11, 0.8) !important;
  border-top-width: 3px !important;
  box-shadow: 0 4px 20px -2px rgba(245, 158, 11, 0.1) !important;
}

/* Nút trong card pending: xóa = đỏ, xong = xanh lá */
.tl-rect--pending .tl-action-delete {
  background: transparent !important;
  color: #f87171 !important;
  border: 1.5px solid rgba(248, 113, 113, 0.3) !important;
}

.tl-rect--pending .tl-action-delete:hover {
  background: rgba(239, 68, 68, 0.2) !important;
  color: #ef4444 !important;
}

.tl-rect--pending .tl-action-done {
  background: linear-gradient(135deg, #059669, #10b981) !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  border: none !important;
  box-shadow: 0 3px 12px -2px rgba(16, 185, 129, 0.5) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.tl-rect--pending .tl-action-done:hover {
  background: linear-gradient(135deg, #047857, #059669) !important;
  transform: translateY(-1px);
  box-shadow: 0 5px 16px -2px rgba(16, 185, 129, 0.6) !important;
}

.kanban-column {
  background: rgba(15, 23, 34, 0.4) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
}

.kb-col-pending {
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 34, 0.4) 100%) !important;
  border-color: rgba(245, 158, 11, 0.15) !important;
}

.kb-col-done {
  background: linear-gradient(180deg, rgba(20, 50, 60, 0.6) 0%, rgba(15, 23, 34, 0.4) 100%) !important;
  border-color: rgba(16, 185, 129, 0.15) !important;
}

.kanban-badge {
  background: #ef4444 !important;
  color: #ffffff !important;
  border-color: #dc2626 !important;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4) !important;
}

.tl-stt, .tl-date, .tl-time, .tl-thu-period, .elite-form-group label {
  color: #cbd5e1 !important;
}

.tl-note-content {
  color: #f87171 !important; /* Bright Red */
  font-weight: 600 !important;
}

.tl-circle {
  background: #1e293b !important;
}

.tl-circle-inner {
  background: #0f172a !important;
}

.empty-state, .kanban-list .empty-state p {
  color: #94a3b8 !important;
}

/* Global dark action button styles (for done cards) */
.tl-action-btn {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #cbd5e1 !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

/* Nút xóa luôn đỏ */
.tl-action-delete {
  color: #f87171 !important;
  border-color: rgba(248, 113, 113, 0.3) !important;
  background: transparent !important;
}

.tl-action-delete:hover {
  background: rgba(239, 68, 68, 0.2) !important;
  color: #ef4444 !important;
}

/* Nút xong card done: CTA xanh lá */
.tl-action-done {
  background: linear-gradient(135deg, #059669, #10b981) !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  border: none !important;
  box-shadow: 0 3px 12px -2px rgba(16, 185, 129, 0.5) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.tl-action-done:hover {
  background: linear-gradient(135deg, #047857, #059669) !important;
  color: #ffffff !important;
  transform: translateY(-1px);
  box-shadow: 0 5px 16px -2px rgba(16, 185, 129, 0.6) !important;
}

/* Card hoàn thành: viền xanh lá dày, nền trong suốt */
.tl-rect--done {
  background: rgba(15, 23, 34, 0.6) !important;
  border: 2px solid rgba(16, 185, 129, 0.8) !important;
  border-top-width: 3px !important;
  box-shadow: 0 4px 20px -4px rgba(16, 185, 129, 0.1), inset 0 1px 1px rgba(255,255,255,0.05) !important;
}

.elite-quick-btn {
  background: #f1f5f9 !important;
  color: #64748b !important;
  border-color: #e2e8f0 !important;
}

.elite-quick-btn.active {
  background: #0d3b3f !important;
  color: #4ade80 !important;
  border-color: #16a34a !important;
  box-shadow: 0 4px 12px -2px rgba(16, 163, 74, 0.35) !important;
}

/* Fix inline styles on empty days calendar */
div[style*="background: white"], 
div[style*="background: #f8fafc"], 
div[style*="background: #f1f5f9"],
div[style*="background: rgba(248, 250, 252"] {
  background: rgba(15, 23, 34, 0.6) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
  color: #e2e8f0 !important;
}

div[style*="background: #fff7ed"] {
  background: rgba(245, 158, 11, 0.15) !important;
  color: #fbbf24 !important;
  border-color: rgba(245, 158, 11, 0.2) !important;
}

div[style*="background: #fdf4ff"] {
  background: rgba(168, 85, 247, 0.15) !important;
  color: #e879f9 !important;
  border-color: rgba(168, 85, 247, 0.2) !important;
}

/* =========================================================
   DEEP DARK THEME — Report Page: Text & Background Fixes
   ========================================================= */

/* Nền trắng → tối mờ */
.filters,
.table-wrapper,
.status-container,
.elite-quick-note,
.tl-rect-note,
.delete-confirm-modal {
  background: rgba(13, 20, 30, 0.6) !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
}

/* Tất cả màu chữ tối → màu sáng */
.report-table td,
.report-table th,
.col-content,
.col-time,
.col-note,
.elite-label,
.elite-form-group label,
.elite-modal-title h2,
.elite-modal-title p,
.delete-title,
.delete-desc,
.toolbar-left h3,
.record-meta span,
.tl-body-text,
.tl-date,
.tl-time,
.tl-thu-period,
.tl-stt {
  color: #e2e8f0 !important;
}

/* Table header */
.report-table th {
  background: rgba(255, 255, 255, 0.03) !important;
  color: #94a3b8 !important;
  border-bottom-color: rgba(255, 255, 255, 0.06) !important;
}

/* Table rows */
.report-table td {
  border-bottom-color: rgba(255, 255, 255, 0.04) !important;
}

.report-table tr:hover td {
  background-color: rgba(255, 255, 255, 0.03) !important;
}

/* Filter inputs */
.filters input,
.filters select,
.elite-input,
.elite-select,
.elite-textarea {
  background: rgba(0, 0, 0, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: #f1f5f9 !important;
}

.filters input:focus,
.filters select:focus {
  background: rgba(0, 0, 0, 0.4) !important;
  border-color: rgba(34, 211, 238, 0.4) !important;
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.1) !important;
}

/* Stat cards (summary cards) */
.stat-card {
  background: rgba(25, 38, 58, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #e2e8f0 !important;
  box-shadow: 0 4px 16px -4px rgba(0,0,0,0.4) !important;
}

/* Button icon hovers */
.btn-icon:hover {
  background: rgba(255, 255, 255, 0.08) !important;
}

.btn-icon.edit:hover {
  color: #60a5fa !important;
  background: rgba(59, 130, 246, 0.15) !important;
}

.btn-icon.delete:hover {
  color: #f87171 !important;
  background: rgba(239, 68, 68, 0.15) !important;
}

/* Status container pill */
.status-container {
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #e2e8f0 !important;
}

/* Tags */
.tag {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #cbd5e1 !important;
}

/* Section headings inside inline styles */
h3[style*="color: #1e293b"],
span[style*="color: #1e293b"],
span[style*="color: #334155"] {
  color: #e2e8f0 !important;
}

@media (max-width: 768px) {
  .distribute-left-panel {
    display: none !important;
  }
  .distribute-right-panel {
    width: 100% !important;
  }
  .empty-days-filter {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.8rem !important;
  }
  .empty-days-filter > div {
    width: 100% !important;
  }
}

/* Drag & Drop Overrides */
.drag-over-sang {
  background: rgba(59, 130, 246, 0.15) !important;
  border: 2px dashed #3b82f6 !important;
  box-shadow: inset 0 0 15px rgba(59, 130, 246, 0.2);
  padding: 0.6rem 0.4rem !important;
}

.drag-over-chieu {
  background: rgba(16, 185, 129, 0.15) !important;
  border: 2px dashed #10b981 !important;
  box-shadow: inset 0 0 15px rgba(16, 185, 129, 0.2);
  padding: 0.6rem 0.4rem !important;
}

.dragging-task {
  opacity: 0.5 !important;
  transform: scale(0.95) !important;
  box-shadow: none !important;
}

@keyframes dropPulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  50% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.drop-success-pulse {
  animation: dropPulse 0.5s ease-out;
}

/* Tech VIP Add Button */
.tech-vip-btn {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%) !important;
  border: 1px solid rgba(96, 165, 250, 0.4) !important;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.2) !important;
  padding: 0.8rem 3.5rem !important;
  border-radius: 12px !important;
  font-size: 1.15rem !important;
  font-weight: 800 !important;
  letter-spacing: 1.5px !important;
  text-transform: uppercase !important;
  color: #ffffff !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  backdrop-filter: blur(10px);
}

.tech-vip-btn:hover {
  transform: translateY(-3px) scale(1.02) !important;
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.7), inset 0 0 15px rgba(255, 255, 255, 0.3) !important;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%) !important;
}

.tech-vip-btn:active {
  transform: translateY(1px) scale(0.98) !important;
}

@keyframes drop-epic-success {
  0% { transform: scale(1); filter: brightness(1); }
  30% { transform: scale(1.04); filter: brightness(1.2); }
  60% { transform: scale(1.01); filter: brightness(1.1); }
  100% { transform: scale(1); filter: brightness(1); }
}

@keyframes drop-glow {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.8); border-color: #10b981; }
  50% { box-shadow: 0 0 30px 10px rgba(16, 185, 129, 0); border-color: rgba(16, 185, 129, 0.5); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); border-color: rgba(255, 255, 255, 0.05); }
}

@keyframes dropRadiate {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.8); outline: 0px solid rgba(16, 185, 129, 0.8); outline-offset: 0px; }
  50% { transform: scale(1.03); box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); outline: 15px solid rgba(16, 185, 129, 0); outline-offset: 15px; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); outline: 0px solid rgba(16, 185, 129, 0); outline-offset: 0px; }
}

.dropped-success {
  z-index: 50 !important;
  position: relative;
}

.dropped-success .tl-rect {
  animation: dropRadiate 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  border-color: #10b981 !important;
  background: rgba(16, 185, 129, 0.15) !important;
}

.empty-add-btn-simple {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ffffff;
  margin: 1rem auto;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.empty-add-btn-simple:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

@media (min-width: 1024px) {
  /* Biến khối toàn bộ tab "Theo ngày" thành 1 trục timeline dọc duy nhất nối liền các ngày */
  .daily-view-container {
    position: relative;
    padding-left: 0;
  }
  
  /* Trục dọc chính xuyên suốt nối các ngày với nhau */
  .daily-view-container::before {
    content: '';
    position: absolute;
    top: 25px; /* Bắt đầu từ trống đầu tiên */
    bottom: 0;
    left: 240px; /* Dịch line sang phải đủ xa để chứa thẻ VIP */
    width: 2px;
    background-color: rgba(255, 255, 255, 0.08); /* Line mỏng tinh tế cho nền tối */
    z-index: 1;
  }
  
  /* Bỏ nền dạng thẻ card của khối từng ngày */
  .daily-day-block {
    display: flex !important;
    flex-direction: row !important;
    align-items: flex-start !important;
    position: relative;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    margin-bottom: 3.5rem !important; /* Tăng khoảng cách các ngày */
    overflow: visible !important; /* Chống cắt bóng hoặc cắt góc chữ */
  }
  .daily-day-block::before {
    display: none !important; /* Xoá dải gradient màu ở trên cùng */
  }
  
  /* Phần Header (chứa Ngày/Tháng) biến thành cột bên trái đường line */
  .daily-day-header {
    width: 240px !important; /* Tăng width lên 240px để chữ không bao giờ bị cắt */
    box-sizing: border-box !important;
    flex-shrink: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-end !important;
    justify-content: flex-start !important;
    padding: 0 40px 0 20px !important; /* Có padding trái 20px để tránh cấn lề, padding phải 40px để tách xa đường line */
    background: transparent !important;
    border: none !important;
    position: relative;
    z-index: 2;
  }
  
  /* Bỏ hoàn toàn dấu chấm mốc thời gian của Ngày theo yêu cầu */
  .daily-day-header::after {
    display: none !important;
  }
  
  /* Tạo phong cách VIP CARD tách biệt cho Ngày/Tháng */
  .daily-day-badge {
    flex-direction: column !important;
    gap: 10px !important;
    align-items: center !important;
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%) !important;
    border-radius: 16px !important;
    padding: 1.25rem 1rem !important;
    width: 100% !important; /* 240 - 40 - 20 = 180px -> chữ hoàn toàn vừa vặn */
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    backdrop-filter: blur(8px) !important;
  }
  
  .daily-day-badge:hover {
    transform: translateY(-4px) scale(1.02) !important;
  }
  
  
  /* Thay đổi màu đồng nhất (Xanh Lá/Emerald) cho thẻ Card và nút Thứ theo yêu cầu */
  .daily-day-badge {
    border: 1px solid rgba(16, 185, 129, 0.4) !important;
    box-shadow: 0 8px 25px -8px rgba(16, 185, 129, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.05) !important;
  }
  .daily-day-badge:hover {
    box-shadow: 0 12px 35px -8px rgba(16, 185, 129, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.1) !important;
    border-color: rgba(16, 185, 129, 0.8) !important;
  }
  
  .daily-badge-thu {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; /* Xanh lá */
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4) !important;
  }
  
  .daily-badge-date {
    font-size: 1.15rem !important;
    font-weight: 800 !important;
    color: #f8fafc !important; /* Chữ TRẮNG tinh */
    background: transparent !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
    line-height: 1.2;
    text-align: center !important;
    width: 100% !important;
    white-space: nowrap !important; /* Chữ luôn nguyên hàng */
    letter-spacing: 0.5px !important;
  }
  
  .daily-badge-thu {
    font-size: 0.85rem !important;
    color: #ffffff !important;
    font-weight: 800 !important;
    padding: 0.35rem 1rem !important;
    border-radius: 20px !important;
    text-transform: uppercase !important;
    letter-spacing: 1px !important;
    line-height: 1.2;
    text-align: center !important;
    width: fit-content !important;
  }
  
  /* Ẩn cục tổng số việc để giao diện bên trái thoáng đãng và sạch sẽ nhất */
  .daily-count-badge {
    display: none !important;
  }
  
  /* Cột nội dung (Các thẻ công việc Sáng/Chiều) dạt qua phải đường line */
  .daily-periods {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    padding-left: 45px !important; /* Khoảng cách từ trục dọc tới nội dung */
    padding-top: 0 !important;
    padding-right: 0 !important;
    padding-bottom: 0 !important;
    gap: 2rem !important;
  }
}

.tl-rect--pending .tl-action-today, .elite-modal-card .tl-action-today, .tl-action-today {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  border: none !important;
  box-shadow: 0 3px 12px -2px rgba(59, 130, 246, 0.5) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.tl-rect--pending .tl-action-today:hover, .elite-modal-card .tl-action-today:hover, .tl-action-today:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  color: #ffffff !important;
  transform: translateY(-1px);
  box-shadow: 0 5px 16px -2px rgba(59, 130, 246, 0.6) !important;
}

.modal-card-dropped {
  animation: modalDropRadiate 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
  z-index: 50;
  position: relative;
}

@keyframes modalDropRadiate {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.8);
    background: rgba(16, 185, 129, 0.3) !important;
    border-color: #10b981 !important;
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 20px 10px rgba(16, 185, 129, 0);
    background: rgba(16, 185, 129, 0.1) !important;
    border-color: rgba(16, 185, 129, 0.5) !important;
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    background: #1e293b !important;
    border-color: rgba(16, 185, 129, 0.3) !important;
  }
}

.modal-today-dropzone-highlight {
  border: 2px dashed rgba(16, 185, 129, 0.5) !important;
  background: rgba(16, 185, 129, 0.08) !important;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.1) inset !important;
}

.modal-today-dropzone-active {
  border: 2px dashed #10b981 !important;
  background: rgba(16, 185, 129, 0.15) !important;
  box-shadow: 0 0 25px rgba(16, 185, 129, 0.25) inset !important;
  transform: scale(1.02);
}
.pipeline-chip {
  background: #0f172a;
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
  padding: 6px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  color: #34d399;
  font-size: 13px;
  width: 100%;
}
.pipeline-chip:hover {
  background: #1e293b;
  border-color: rgba(16, 185, 129, 0.5);
}
.pipeline-chip-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pipeline-chip-sub {
  color: #059669;
  font-size: 11px;
}
.pipeline-chip-remove {
  color: #ef4444;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(239, 68, 68, 0.1);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.pipeline-chip-remove:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}


/* ================== DẠNG LỊCH SỬ ================== */
.history-view-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

.history-day-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-day-header {
  display: flex;
  align-items: center;
}

.history-day-badge {
  display: inline-flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.history-badge-thu {
  font-weight: 800;
  font-size: 1.1rem;
  color: #38bdf8;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.history-badge-date {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
}

@media (min-width: 768px) {
  .history-view-container::before {
    content: '';
    position: absolute;
    top: 20px;
    bottom: 0;
    left: 175px; /* 160px header + 15px to center of dot */
    width: 2px;
    background-color: rgba(255, 255, 255, 0.1);
    z-index: 1;
  }
  
  .history-day-block {
    flex-direction: row;
    align-items: flex-start;
    gap: 0;
  }
  
  .history-day-header {
    width: 160px;
    flex-shrink: 0;
    justify-content: flex-end;
    padding-right: 2rem;
    position: relative;
    z-index: 3;
  }
  
  .history-day-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-bottom: 2rem;
  }
}


/* --- FILTERS --- */
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
}

.filter-group {
  position: relative;
  flex: 2;
}

.filter-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.filter-group input {
  width: 100%;
  padding-left: 2.75rem !important;
}

.filters input, .filters select {
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;
  font-size: 0.95rem;
  color: #334155;
  transition: all 0.2s;
  background-color: #f8fafc;
}

.filters select {
  flex: 1;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

.filters input:focus, .filters select:focus {
  border-color: #6366f1;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}



/* Filter mobile responsive */
@media (max-width: 768px) {
  .mobile-action-btn {
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
    border-radius: 10px;
  }
  .elite-filter-panel {
    border-radius: 12px;
  }
  .elite-filter-header {
    padding: 0.75rem 1rem 0;
  }
  .elite-filter-header .elite-filter-title span {
    font-size: 0.85rem;
  }
  .elite-filter-body {
    padding: 0.75rem 1rem 1rem;
    gap: 0.6rem;
  }
  .elite-filter-divider {
    margin: 0.25rem 0;
  }

  /* Row 1: Mode tabs stay horizontal */
  .elite-filter-row {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 0.5rem;
  }
  .elite-mode-tabs {
    width: 100%;
  }
  .elite-mode-tabs button {
    flex: 1;
    justify-content: center;
    padding: 0.45rem 0.5rem;
    font-size: 0.8rem;
  }

  .elite-date-group {
    flex: 1;
    min-width: 0;
    max-width: none;
  }
  .elite-date-group.group-tabs {
    flex: 1 1 65% !important;
  }
  .elite-date-group.group-period {
    order: 0;
    flex: 1 1 25% !important;
    max-width: none !important;
  }
  .elite-date-group.group-date {
    flex: 1 1 100% !important;
    margin-bottom: 0.2rem;
  }
  
  .elite-date-group label {
    font-size: 0.75rem;
    margin-bottom: 0.35rem;
    color: #f8fafc !important;
  }
  .elite-date-group .elite-input {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
    width: 100%;
    box-sizing: border-box;
  }
  .elite-range-sep {
    display: none !important;
  }

  /* Row 3: Selects in 2x2 grid */
  .elite-filter-row:last-child {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  .elite-select-group {
    min-width: 0;
  }
  .elite-select-group label {
    font-size: 0.7rem;
    margin-bottom: 0.15rem;
  }

  /* Mobile overrides for Modal Form Actions Grid */
  .form-actions-grid {
    gap: 0.6rem;
  }
  .form-actions-grid > button {
    padding: 0.6rem 0.4rem !important;
    font-size: 0.85rem !important;
    min-height: 44px;
  }

  
}

.attach-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  max-width: 100%;
}
.attach-badge:hover {
  transform: translateY(-1px);
}
.attach-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.badge-pdf { background: rgba(239, 68, 68, 0.4); color: #ffffff !important; border: 1px solid rgba(239, 68, 68, 0.6); }
.badge-pdf:hover { background: rgba(239, 68, 68, 0.15); }
.badge-word { background: rgba(59, 130, 246, 0.4); color: #ffffff !important; border: 1px solid rgba(59, 130, 246, 0.6); }
.badge-word:hover { background: rgba(59, 130, 246, 0.15); }
.badge-excel { background: rgba(16, 185, 129, 0.4); color: #ffffff !important; border: 1px solid rgba(16, 185, 129, 0.6); }
.badge-excel:hover { background: rgba(16, 185, 129, 0.15); }
.badge-default { background: rgba(148, 163, 184, 0.4); color: #ffffff !important; border: 1px solid rgba(148, 163, 184, 0.6); }
.badge-default:hover { background: rgba(148, 163, 184, 0.15); }
.badge-image { background: rgba(168, 85, 247, 0.4); color: #ffffff !important; border: 1px solid rgba(168, 85, 247, 0.6); }
.badge-image:hover { background: rgba(168, 85, 247, 0.15); }


.tl-rect--green .tl-body-text, .tl-rect--done .tl-body-text { color: #10b981 !important; }
.tl-rect--orange .tl-body-text, .tl-rect--pending .tl-body-text { color: #f59e0b !important; }
.tl-rect--red .tl-body-text, .tl-rect--failed .tl-body-text { color: #ef4444 !important; }
.tl-rect--default .tl-body-text { color: #94a3b8 !important; }
.tl-rect--blue .tl-body-text { color: #3b82f6 !important; }


.quick-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.quick-btn.btn-green.active { background: #10b981; border-color: #10b981; color: white; }
.quick-btn.btn-green:hover:not(.active) { border-color: rgba(16, 185, 129, 0.5); color: #10b981; background: rgba(16, 185, 129, 0.1); }

.quick-btn.btn-orange.active { background: #f59e0b; border-color: #f59e0b; color: white; }
.quick-btn.btn-orange:hover:not(.active) { border-color: rgba(245, 158, 11, 0.5); color: #f59e0b; background: rgba(245, 158, 11, 0.1); }

.quick-btn.btn-red.active { background: #ef4444; border-color: #ef4444; color: white; }
.quick-btn.btn-red:hover:not(.active) { border-color: rgba(239, 68, 68, 0.5); color: #ef4444; background: rgba(239, 68, 68, 0.1); }



.quick-delete-btn {
  background: #ef4444;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: auto;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);
  flex-shrink: 0;
}
.quick-delete-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .kanban-board {
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
  }
  .kanban-column {
    display: contents !important;
  }
  .kanban-column::before, .kanban-column::after {
    display: none !important;
  }
  .kanban-header {
    display: none !important;
  }
  .kanban-list {
    display: contents !important;
  }
  .kanban-list .empty-state {
    display: none !important;
  }
  .elite-table-toolbar.mobile-only {
    border-bottom: none !important;
    padding-bottom: 0 !important;
  }
  .tl-status-chip {
    font-size: 0.5rem !important;
    padding: 0.2rem 0.4rem !important;
    letter-spacing: 0 !important;
  }
  .tl-rect-tags {
    flex-wrap: wrap !important;
    max-width: 100% !important;
  }
  .tl-rect-tags + div {
    margin-top: 1.8rem !important;
  }
  .history-view-wrapper {
    padding: 0 !important;
    margin-top: 1rem;
  }
  .history-day-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .history-day-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .history-day-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .elite-modal-overlay {
    z-index: 99999 !important;
  }
  .elite-modal {
    max-height: 95dvh !important;
    max-width: 98vw !important;
    margin: 0 auto;
    display: flex !important;
    flex-direction: column !important;
  }
  .elite-modal-body {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
  }
  .elite-modal-actions {
    padding: 1rem !important;
    flex-wrap: wrap !important;
    flex-shrink: 0 !important;
  }
  .elite-modal-actions button {
    flex: 1 !important;
    padding: 0.8rem 0.5rem !important;
    text-align: center !important;
  }
  .customer-modal [style*="display: grid"] {
    grid-template-columns: 1fr !important;
  }
  .elite-filter-row {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 1rem !important;
  }
  .elite-date-group.group-tabs {
    flex: 0 0 auto !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  .elite-date-group.group-date {
    flex: 0 0 auto !important;
    width: 100% !important;
    max-width: 100% !important;
    margin-bottom: 0 !important;
  }
  .elite-range-sep {
    display: none !important;
  }
}
</style>

