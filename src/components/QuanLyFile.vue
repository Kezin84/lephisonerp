<template>
  <div class="report-container">
    <header class="header" style="position: relative; justify-content: center;">
      <div class="title-section" style="text-align: center;">
        <h1 style="color: #10b981; text-transform: uppercase;">Quản Lý File</h1>
        <p class="subtitle">Theo dõi và quản lý file, báo giá khách hàng</p>
      </div>
      <div class="header-actions" style="position: absolute; right: 0; display: flex; align-items: center; gap: 10px;">
        <button 
          class="elite-btn-export" 
          @click="openJsonExportModal('chain')" 
          style="background: linear-gradient(135deg, #059669, #0d9488); border: 1px solid #10b981; color: white; display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.2s;" 
          title="Xuất file JSON theo chuỗi card liên kết, chọn từng card, khách hàng hoặc toàn bộ"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span>Xuất File JSON</span>
        </button>

        <button 
          class="elite-btn-export" 
          @click="openBatchExportModal" 
          style="background: #2563eb; border: 1px solid #3b82f6; color: white; display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); transition: all 0.2s;" 
          onmouseover="this.style.background='#1d4ed8'; this.style.transform='translateY(-1px)';" 
          onmouseout="this.style.background='#2563eb'; this.style.transform='none';"
          title="Tải toàn bộ file & hình ảnh theo bộ lọc thời gian hoặc từng ID cụ thể (.zip)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Xuất File Hàng Loạt</span>
        </button>

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
              <button type="button" :class="{ 'active': currentViewCategory === 'compareView' }" @click="currentViewCategory = 'compareView'" style="padding: 0.4rem 0.8rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;" :style="currentViewCategory === 'compareView' ? 'background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); color: #10b981;' : 'background: transparent; color: #64748b;'">Dạng so sánh</button>
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
          <button type="button" :class="{ 'active': currentViewCategory === 'compareView' }" @click="currentViewCategory = 'compareView'" style="flex: 1; padding: 0.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;" :style="currentViewCategory === 'compareView' ? 'background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); color: #10b981;' : 'background: transparent; color: #64748b;'">Dạng so sánh</button>
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
              <div style="display: flex; align-items: center; gap: 0.65rem;">
                <button type="button"
                        class="cmp-customer-json-btn"
                        :disabled="isExportingJson"
                        @click.stop="handleExportCustomerJson(tree)"
                        title="Tải file JSON dữ liệu tài chính & hàng hóa của khách hàng này">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span>Tải JSON KH</span>
                </button>
                <span class="badge" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; padding: 4px 12px; border-radius: 20px;">{{ tree.totalFiles }} sự kiện</span>
                <svg :style="{ transform: collapsedCustomers[tree.customer.id] ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
            <div v-if="!collapsedCustomers[tree.customer.id]" class="customer-timeline-body" style="padding-top: 10px;">
              <div style="display: flex; flex-wrap: wrap; gap: 2rem; align-items: flex-start;">
                <!-- Cột trái: Đã có liên kết -->
                <div style="flex: 1 1 55%; min-width: 300px;">
                  <h5 style="margin: 0 0 1rem 0; color: #cbd5e1; font-size: 0.9rem; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">🔗 Luồng công việc</h5>
                  <div v-for="(rootNode, rIdx) in tree.linkedRoots" :key="rootNode.id" class="cmp-linked-chain-block" style="margin-bottom: 1.25rem;">
                    <div class="cmp-chain-action-bar">
                      <div class="cmp-chain-bar-left">
                        <span class="cmp-chain-pill">🔗 Chuỗi #{{ rIdx + 1 }} ({{ getChainCardsFromTreeRoot(rootNode).length }} card)</span>
                        <span class="cmp-chain-flow-text" :title="getChainFlowPreviewText(rootNode)">{{ getChainFlowPreviewText(rootNode) }}</span>
                      </div>
                      <div class="cmp-chain-bar-actions">
                        <button type="button"
                                class="cmp-chain-select-btn"
                                :class="{ active: areAllChainCardsSelectedOnPage(rootNode) }"
                                @click.stop="toggleSelectFullChainOnPage(rootNode)"
                                title="Chọn / bỏ chọn toàn bộ các card trong chuỗi liên kết này trên trang">
                          {{ areAllChainCardsSelectedOnPage(rootNode) ? '☑ Bỏ chọn chuỗi' : '+ Chọn cả chuỗi' }}
                        </button>
                        <button type="button"
                                class="cmp-chain-dl-btn"
                                :disabled="isExportingJson"
                                @click.stop="handleExportChainJson({ node: rootNode, customer: tree.customer })"
                                title="Tải ngay file JSON của toàn bộ chuỗi liên kết này">
                          ⬇ Tải JSON chuỗi ({{ getChainCardsFromTreeRoot(rootNode).length }})
                        </button>
                      </div>
                    </div>
                    <FileTimelineNode
                      :node="rootNode"
                      :customer="tree.customer"
                      :highlighted-id="highlightedFileId"
                      :selected-json-card-ids="selectedPageJsonCardIds"
                      :get-chain-info-for-card="getChainInfoForCard"
                      @edit="editFile"
                      @delete="deleteFile"
                      @export-card-json="handleExportCardJson"
                      @export-chain-json="handleExportChainJson"
                      @open-chain-card-picker="({ node, customer }) => openChainCardPickerModal(node, customer)"
                      @toggle-select-json-card="toggleSelectPageJsonCard"
                    />
                  </div>
                  <div v-if="!tree.linkedRoots || !tree.linkedRoots.length" style="color: #64748b; font-size: 0.85rem; font-style: italic;">Chưa có luồng công việc nào.</div>
                </div>
                <!-- Cột phải: Mồ côi -->
                <div style="flex: 1 1 35%; min-width: 300px;">
                  <h5 style="margin: 0 0 1rem 0; color: #cbd5e1; font-size: 0.9rem; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">📄 File mới / Chưa liên kết</h5>
                  <FileTimelineNode
                    v-for="rootNode in tree.orphanRoots"
                    :key="rootNode.id"
                    :node="rootNode"
                    :customer="tree.customer"
                    :highlighted-id="highlightedFileId"
                    :selected-json-card-ids="selectedPageJsonCardIds"
                    :get-chain-info-for-card="getChainInfoForCard"
                    @edit="editFile"
                    @delete="deleteFile"
                    @export-card-json="handleExportCardJson"
                    @export-chain-json="handleExportChainJson"
                    @open-chain-card-picker="({ node, customer }) => openChainCardPickerModal(node, customer)"
                    @toggle-select-json-card="toggleSelectPageJsonCard"
                  />
                  <div v-if="!tree.orphanRoots || !tree.orphanRoots.length" style="color: #64748b; font-size: 0.85rem; font-style: italic;">Không có card mới.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- COMPARE VIEW (DẠNG SO SÁNH PHÂN CẤP + BỘ CHỈ SỐ TÀI CHÍNH) -->
        <div v-else-if="currentViewCategory === 'compareView'" class="compare-view-wrapper cmp-workstation">
          <!-- ═══ THANH CÔNG CỤ XUẤT JSON (TÀI CHÍNH & HÀNG HÓA) TRONG DẠNG SO SÁNH ═══ -->
          <div class="cmp-json-export-bar">
            <div class="cmp-json-bar-left">
              <div class="cmp-json-bar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <div class="cmp-json-bar-info">
                <div class="cmp-json-bar-title">
                  Xuất Dữ Liệu Tài Chính &amp; Hàng Hóa (.JSON)
                </div>
                <div class="cmp-json-bar-stats">
                  <span><strong>{{ customerTrees.length }}</strong> khách hàng</span>
                  <span class="cmp-stat-dot">•</span>
                  <span><strong>{{ compareOverviewStats.totalCards }}</strong> card</span>
                  <span class="cmp-stat-dot">•</span>
                  <span style="color: #a78bfa;"><strong>{{ allLinkedChains.length }}</strong> chuỗi liên kết</span>
                  <span class="cmp-stat-dot">•</span>
                  <span style="color: #34d399;"><strong>{{ compareOverviewStats.totalReports }}</strong> bản tài chính</span>
                  <span class="cmp-stat-dot">•</span>
                  <span style="color: #38bdf8;"><strong>{{ compareOverviewStats.totalGoods }}</strong> mặt hàng</span>
                </div>
              </div>
            </div>

            <div class="cmp-json-bar-actions">
              <button type="button"
                      class="cmp-json-mode-btn is-chain-btn"
                      @click="openJsonExportModal('chain')"
                      title="Xuất JSON theo từng Chuỗi Card liên kết hoặc chọn các Card trong chuỗi">
                <span>🔗 Xuất Chuỗi Liên Kết ({{ allLinkedChains.length }})</span>
              </button>

              <button type="button"
                      class="cmp-json-mode-btn"
                      @click="openJsonExportModal('card')"
                      title="Chọn xuất dữ liệu JSON theo từng Card cụ thể">
                <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="7" y1="8" x2="17" y2="8"></line><line x1="7" y1="12" x2="13" y2="12"></line></svg>
                <span>Chọn Card tải JSON</span>
              </button>

              <button type="button"
                      class="cmp-json-mode-btn"
                      @click="openJsonExportModal('customer')"
                      title="Chọn xuất dữ liệu JSON theo từng Khách hàng">
                <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>Xuất theo Khách hàng</span>
              </button>

              <button type="button"
                      class="cmp-json-primary-btn"
                      :disabled="isExportingJson"
                      @click="openJsonExportModal('all')"
                      title="Mở bảng tùy chọn & Download file JSON dữ liệu tài chính, hàng hóa (Theo Chuỗi / Card / Khách hàng / Toàn bộ)">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>{{ isExportingJson ? 'Đang xuất JSON...' : 'Download File JSON' }}</span>
              </button>

              <button type="button"
                      class="cmp-json-quick-all-btn"
                      :disabled="isExportingJson"
                      @click="handleQuickExportAllJson"
                      title="Tải nhanh toàn bộ dữ liệu tài chính & hàng hóa đang hiển thị (.json)">
                <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 17 12 21 16 17"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path></svg>
                <span>Tải nhanh Toàn bộ</span>
              </button>
            </div>
          </div>

          <!-- ═══ DANH SÁCH KHÁCH HÀNG & CÂY LUỒNG ĐỐI CHIẾU ═══ -->
          <div v-for="tree in customerTrees" :key="'cmp-' + tree.customer.id" class="cmp-customer-group">
            <div class="cmp-customer-header" @click="toggleCustomer(tree.customer.id)">
              <div class="cmp-customer-title-wrap">
                <span class="cmp-customer-indicator"></span>
                <h4 class="cmp-customer-name">
                  {{ tree.customer.ten_khach_hang || 'Chưa có tên' }}
                  <span v-if="tree.customer.ten_cong_ty" class="cmp-customer-company">{{ tree.customer.ten_cong_ty }}</span>
                </h4>
                <span v-if="tree.customer.tagKH && tree.customer.tagKH.length"
                      v-for="tag in tree.customer.tagKH"
                      :key="tag"
                      class="cmp-customer-tag">
                  {{ tag }}
                </span>
              </div>

              <div class="cmp-customer-actions">
                <button type="button"
                        class="cmp-customer-json-btn"
                        :disabled="isExportingJson"
                        @click.stop="handleExportCustomerJson(tree)"
                        title="Tải file JSON dữ liệu tài chính & hàng hóa của khách hàng này">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span>Tải JSON KH</span>
                </button>
                <button v-if="getCustomerAllCompareKeys(tree).length >= 2"
                        type="button"
                        class="cmp-customer-compare-btn"
                        :class="{ 'is-active': areAllCustomerReportsSelected(tree) }"
                        @click.stop="toggleSelectAllCustomerReports(tree)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                  {{ areAllCustomerReportsSelected(tree) ? 'Bỏ chọn tất cả báo cáo' : 'Đối chiếu toàn bộ (' + getCustomerAllCompareKeys(tree).length + ' bản)' }}
                </button>
                <span class="cmp-event-count">{{ tree.totalFiles }} hồ sơ</span>
                <svg class="cmp-chevron" :class="{ 'is-open': !collapsedCustomers[tree.customer.id] }" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>

            <div v-if="!collapsedCustomers[tree.customer.id]" class="cmp-customer-body">
              <!-- Khối 1: Luồng công việc (Đã có liên kết) -->
              <div v-if="tree.linkedRoots && tree.linkedRoots.length" class="cmp-tree-section">
                <div class="cmp-section-heading">
                  <span class="cmp-section-dot is-emerald"></span>
                  <span>Chuỗi hồ sơ liên kết &amp; Chỉ số tài chính ({{ tree.linkedRoots.length }} chuỗi)</span>
                </div>
                <div v-for="(rootNode, rIdx) in tree.linkedRoots"
                     :key="'cmp-link-wrap-' + rootNode.id"
                     class="cmp-linked-chain-block">
                  <!-- Thanh công cụ riêng cho từng chuỗi liên kết -->
                  <div class="cmp-chain-action-bar">
                    <div class="cmp-chain-bar-left">
                      <span class="cmp-chain-pill">🔗 Chuỗi liên kết #{{ rIdx + 1 }} · {{ getChainCardsFromTreeRoot(rootNode).length }} card</span>
                      <span class="cmp-chain-flow-text" :title="getChainFlowPreviewText(rootNode)">
                        {{ getChainFlowPreviewText(rootNode) }}
                      </span>
                    </div>
                    <div class="cmp-chain-bar-actions">
                      <button type="button"
                              class="cmp-chain-select-btn"
                              :class="{ active: areAllChainCardsSelectedOnPage(rootNode) }"
                              @click.stop="toggleSelectFullChainOnPage(rootNode)"
                              title="Chọn hoặc bỏ chọn tất cả card thuộc chuỗi liên kết này">
                        {{ areAllChainCardsSelectedOnPage(rootNode) ? 'Bỏ chọn chuỗi (' + getChainCardsFromTreeRoot(rootNode).length + ')' : '+ Chọn cả chuỗi (' + getChainCardsFromTreeRoot(rootNode).length + ')' }}
                      </button>
                      <button type="button"
                              class="cmp-chain-dl-btn"
                              :disabled="isExportingJson"
                              @click.stop="handleExportChainJson({ node: rootNode, customer: tree.customer })"
                              title="Tải ngay file JSON của toàn bộ chuỗi liên kết này">
                        ⬇ Tải JSON cả chuỗi ({{ getChainCardsFromTreeRoot(rootNode).length }} card)
                      </button>
                    </div>
                  </div>

                  <FileCompareNode
                    :node="rootNode"
                    :customer="tree.customer"
                    :highlighted-id="highlightedFileId"
                    :compare-mode="compareReportMode"
                    :view-density="compareViewDensity"
                    :get-reports-for-file="getNormalizedReportsForFile"
                    :selected-compare-keys="selectedCompareKeys"
                    :get-reference-report-for-key="getReferenceReportForKey"
                    :selected-json-card-ids="selectedPageJsonCardIds"
                    :get-chain-info-for-card="getChainInfoForCard"
                    @edit="editFile"
                    @delete="deleteFile"
                    @open-sale-report="openSaleReportForFile"
                    @change-density="val => compareViewDensity = val"
                    @toggle-select-compare="toggleSelectCompareKey"
                    @select-card-reports-compare="handleSelectCardReportsCompare"
                    @export-card-json="handleExportCardJson"
                    @export-chain-json="handleExportChainJson"
                    @open-chain-card-picker="({ node, customer }) => openChainCardPickerModal(node, customer)"
                    @toggle-select-json-card="toggleSelectPageJsonCard"
                  />
                </div>
              </div>

              <!-- Khối 2: File mới / Chưa liên kết -->
              <div v-if="tree.orphanRoots && tree.orphanRoots.length" class="cmp-tree-section">
                <div class="cmp-section-heading">
                  <span class="cmp-section-dot"></span>
                  <span>Hồ sơ độc lập / Chưa liên kết</span>
                </div>
                <FileCompareNode
                  v-for="rootNode in tree.orphanRoots"
                  :key="'cmp-orphan-' + rootNode.id"
                  :node="rootNode"
                  :customer="tree.customer"
                  :highlighted-id="highlightedFileId"
                  :compare-mode="compareReportMode"
                  :view-density="compareViewDensity"
                  :get-reports-for-file="getNormalizedReportsForFile"
                  :selected-compare-keys="selectedCompareKeys"
                  :get-reference-report-for-key="getReferenceReportForKey"
                  :selected-json-card-ids="selectedPageJsonCardIds"
                  :get-chain-info-for-card="getChainInfoForCard"
                  @edit="editFile"
                  @delete="deleteFile"
                  @open-sale-report="openSaleReportForFile"
                  @change-density="val => compareViewDensity = val"
                  @toggle-select-compare="toggleSelectCompareKey"
                  @select-card-reports-compare="handleSelectCardReportsCompare"
                  @export-card-json="handleExportCardJson"
                  @export-chain-json="handleExportChainJson"
                  @open-chain-card-picker="({ node, customer }) => openChainCardPickerModal(node, customer)"
                  @toggle-select-json-card="toggleSelectPageJsonCard"
                />
              </div>
            </div>
          </div>

          <!-- ═══ THANH DOCK NỔI DƯỚI ĐÁY KHI ĐANG CHỌN PHIÊN BẢN ĐỂ ĐỐI CHIẾU ═══ -->
          <div v-if="selectedCompareItems.length > 0" class="cmp-floating-dock">
            <div class="cmp-dock-status">
              <span class="cmp-dock-indicator"></span>
              <span>Đã chọn <strong class="cmp-dock-count">{{ String(selectedCompareItems.length).padStart(2, '0') }}</strong> phiên bản Sale Report</span>
            </div>
            <button type="button"
                    class="cmp-dock-primary-btn"
                    @click="showCompareVersionModal = true">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"></path><path d="M21 9H3"></path><path d="M21 15H3"></path><path d="M12 3v18"></path></svg>
              <span>Xem bảng so sánh ({{ selectedCompareItems.length }} bản)</span>
            </button>
            <button type="button"
                    class="cmp-dock-json-btn"
                    :disabled="isExportingJson"
                    @click="handleExportSelectedCompareJson"
                    title="Xuất file JSON cho các phiên bản đang chọn đối chiếu">
              <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Tải JSON ({{ selectedCompareItems.length }} bản)</span>
            </button>
            <button type="button"
                    class="cmp-dock-clear-btn"
                    @click="clearSelectedCompareKeys"
                    title="Bỏ chọn tất cả phiên bản">
              Đặt lại
            </button>
          </div>

          <!-- ═══ MODAL BẢNG MA TRẬN ĐỐI CHIẾU (CHỈ MỞ KHI NGƯỜI DÙNG NHẤN "MỞ MA TRẬN ĐỐI CHIẾU") ═══ -->
          <div v-if="showCompareVersionModal && selectedCompareItems.length >= 1"
               class="cmp-modal-backdrop"
               @click.self="showCompareVersionModal = false">
            <div class="cmp-modal-shell">
              <div class="cmp-modal-header">
                <div>
                  <h3 class="cmp-modal-title">
                    Bảng Ma Trận Đối Chiếu Chỉ Số Tài Chính ({{ selectedCompareItems.length }} phiên bản)
                  </h3>
                  <div class="cmp-modal-subtitle">
                    {{ compareMatrixLayout === 'vertical' ? 'Đang xem theo Chiều dọc (Chỉ số tài chính theo Hàng · Phiên bản theo Cột)' : 'Đang xem theo Chiều ngang (Phiên bản theo Hàng · Chỉ số tài chính theo Cột)' }}
                  </div>
                </div>

                <div class="cmp-modal-controls">
                  <div class="cmp-segmented-track">
                    <button type="button"
                            class="cmp-seg-btn"
                            :class="{ 'is-active': compareMatrixLayout === 'vertical' }"
                            @click="compareMatrixLayout = 'vertical'">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: -1px;"><rect x="3" y="3" width="7" height="18" rx="1"></rect><rect x="14" y="3" width="7" height="18" rx="1"></rect></svg>
                      Chiều dọc
                    </button>
                    <button type="button"
                            class="cmp-seg-btn"
                            :class="{ 'is-active-emerald': compareMatrixLayout === 'horizontal' }"
                            @click="compareMatrixLayout = 'horizontal'">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: -1px;"><rect x="3" y="3" width="18" height="7" rx="1"></rect><rect x="3" y="14" width="18" height="7" rx="1"></rect></svg>
                      Chiều ngang
                    </button>
                  </div>

                  <button type="button"
                          class="cmp-customer-json-btn"
                          :disabled="isExportingJson"
                          @click="handleExportSelectedCompareJson"
                          title="Tải file JSON các phiên bản đang đối chiếu">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    <span>Download JSON ({{ selectedCompareItems.length }} bản)</span>
                  </button>

                  <button type="button"
                          class="cmp-action-btn is-danger"
                          @click="clearSelectedCompareKeys">
                    Đặt lại
                  </button>

                  <button type="button"
                          class="cmp-modal-close-btn"
                          @click="showCompareVersionModal = false">
                    Đóng
                  </button>
                </div>
              </div>

              <div class="cmp-modal-body">
                <!-- Danh sách chip các bản đang chọn ngay trong modal -->
                <div class="cmp-selected-strip" style="margin-top: 0; margin-bottom: 14px;">
                  <div v-for="(item, idx) in selectedCompareItems"
                       :key="'mchip-' + item.selKey"
                       class="cmp-version-chip">
                    <span class="cmp-chip-index">
                      #{{ String(idx + 1).padStart(2, '0') }}
                    </span>
                    <div class="cmp-chip-meta">
                      <span class="cmp-chip-title">
                        {{ item.title }}
                        <span class="cmp-chip-customer">({{ item.customerName }})</span>
                      </span>
                      <span class="cmp-chip-sub">{{ item.subTitle }}</span>
                    </div>
                    <button type="button"
                            class="cmp-chip-remove"
                            @click="toggleSelectCompareKey(item.selKey)"
                            title="Bỏ chọn phiên bản này">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>

                <!-- BỐ CỤC 1: CHIỀU DỌC TRONG MODAL -->
                <table v-if="compareMatrixLayout === 'vertical'" class="cmp-matrix-table is-vertical">
                  <thead>
                    <tr>
                      <th class="cmp-th-sticky">
                        CHỈ SỐ TÀI CHÍNH
                      </th>
                      <th v-for="(item, idx) in selectedCompareItems"
                          :key="'mth-' + item.selKey"
                          class="cmp-th-version">
                        <div class="cmp-th-top">
                          <span class="cmp-chip-index">
                            PHIÊN BẢN #{{ String(idx + 1).padStart(2, '0') }}
                          </span>
                          <div class="cmp-th-actions">
                            <button type="button"
                                    class="cmp-mini-action"
                                    @click="openSaleReportForFile({ file: item.file, tabIndex: item.tabIndex })">
                              Mở báo cáo
                            </button>
                            <button type="button"
                                    class="cmp-mini-action is-danger"
                                    @click="toggleSelectCompareKey(item.selKey)">
                              Bỏ chọn
                            </button>
                          </div>
                        </div>
                        <div class="cmp-th-title">
                          {{ item.title }}
                          <span v-if="item.report.soHD" class="cmp-th-hd">{{ item.report.soHD }}</span>
                        </div>
                        <div class="cmp-th-subtitle">
                          {{ item.customerName }} · {{ item.subTitle }}
                        </div>
                        <div v-if="item.report.productType || item.report.am" class="cmp-th-meta">
                          <span v-if="item.report.productType">NCC: {{ item.report.productType }}</span>
                          <span v-if="item.report.am"> · AM: {{ item.report.am }}</span>
                        </div>
                        <!-- File đính kèm của bản này (có con mắt + tải về) -->
                        <div v-if="(item.report.files && item.report.files.length > 0)" class="cmp-th-files">
                          <div v-for="(fObj, fi) in item.report.files" :key="'mtbl-f-' + idx + '-' + fi" class="cmp-th-file-row">
                            <a :href="fObj.url" target="_blank" @click.stop class="cmp-th-file-badge" :class="getFileBadgeClass(fObj)">
                              <span class="cmp-th-file-role">{{ fObj.role }}</span>
                              <span class="cmp-th-file-name" :title="fObj.name">{{ truncateFileName(fObj.name) }}</span>
                            </a>
                            <a :href="getOfficeViewUrl(fObj.url)" target="_blank" @click.stop title="Xem file (Office Online)" class="cmp-icon-btn">
                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </a>
                            <button type="button" @click.stop.prevent="handleDownloadClick($event, fObj.url, fObj.name)" title="Tải về" class="cmp-icon-btn is-dl">
                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </button>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in compareMetricRows"
                        :key="'mrow-' + row.key"
                        :class="{
                          'is-row-emerald': row.highlight === 'emerald',
                          'is-row-margin': row.highlight === 'margin'
                        }">
                      <td class="cmp-td-sticky">
                        {{ row.label }}
                      </td>
                      <td v-for="item in selectedCompareItems"
                          :key="'mcell-' + row.key + '-' + item.selKey"
                          class="cmp-td-val">
                        <div class="cmp-cell-primary">
                          <span v-if="row.showTaxPct" class="cmp-tax-note">({{ item.report.taxPct }}%)</span>
                          <strong class="cmp-mono-val"
                                  :style="{ color: row.key === 'netMargin' ? (item.report.netMargin >= 0 ? '#10b981' : '#f43f5e') : row.valColor }">
                            {{ row.isRatio ? fmtComparePct(item.report[row.key]) : craftFmt(item.report[row.key]) }}
                          </strong>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- BỐ CỤC 2: CHIỀU NGANG TRONG MODAL -->
                <table v-else class="cmp-matrix-table is-horizontal">
                  <thead>
                    <tr>
                      <th class="cmp-th-sticky cmp-th-sticky-version">
                        PHIÊN BẢN SALE REPORT
                      </th>
                      <th v-for="row in compareMetricRows"
                          :key="'mhth-' + row.key"
                          class="cmp-th-metric-col"
                          :class="{
                            'is-col-emerald': row.highlight === 'emerald',
                            'is-col-margin': row.highlight === 'margin'
                          }">
                        {{ row.label }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in selectedCompareItems"
                        :key="'mhrow-' + item.selKey"
                        class="cmp-tr-horizontal">
                      <td class="cmp-td-sticky cmp-td-version-sticky">
                        <div class="cmp-th-top">
                          <span class="cmp-chip-index">
                            #{{ String(idx + 1).padStart(2, '0') }}
                          </span>
                          <div class="cmp-th-actions">
                            <button type="button"
                                    class="cmp-mini-action"
                                    @click="openSaleReportForFile({ file: item.file, tabIndex: item.tabIndex })">
                              Mở báo cáo
                            </button>
                            <button type="button"
                                    class="cmp-mini-action is-danger"
                                    @click="toggleSelectCompareKey(item.selKey)">
                              Bỏ chọn
                            </button>
                          </div>
                        </div>
                        <div class="cmp-th-title">
                          {{ item.title }}
                          <span v-if="item.report.soHD" class="cmp-th-hd">{{ item.report.soHD }}</span>
                        </div>
                        <div class="cmp-th-subtitle">
                          {{ item.customerName }} · {{ item.subTitle }}
                        </div>
                        <div v-if="item.report.productType || item.report.am" class="cmp-th-meta">
                          <span v-if="item.report.productType">NCC: {{ item.report.productType }}</span>
                          <span v-if="item.report.am"> · AM: {{ item.report.am }}</span>
                        </div>
                        <div v-if="(item.report.files && item.report.files.length > 0)" class="cmp-th-files">
                          <div v-for="(fObj, fi) in item.report.files" :key="'mhtbl-f-' + idx + '-' + fi" class="cmp-th-file-row">
                            <a :href="fObj.url" target="_blank" @click.stop class="cmp-th-file-badge" :class="getFileBadgeClass(fObj)">
                              <span class="cmp-th-file-role">{{ fObj.role }}</span>
                              <span class="cmp-th-file-name" :title="fObj.name">{{ truncateFileName(fObj.name) }}</span>
                            </a>
                            <a :href="getOfficeViewUrl(fObj.url)" target="_blank" @click.stop title="Xem file (Office Online)" class="cmp-icon-btn">
                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </a>
                            <button type="button" @click.stop.prevent="handleDownloadClick($event, fObj.url, fObj.name)" title="Tải về" class="cmp-icon-btn is-dl">
                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </button>
                          </div>
                        </div>
                      </td>

                      <td v-for="row in compareMetricRows"
                          :key="'mhcell-' + item.selKey + '-' + row.key"
                          class="cmp-td-val"
                          :class="{
                            'is-col-emerald': row.highlight === 'emerald',
                            'is-col-margin': row.highlight === 'margin'
                          }">
                        <div class="cmp-cell-primary">
                          <span v-if="row.showTaxPct" class="cmp-tax-note">({{ item.report.taxPct }}%)</span>
                          <strong class="cmp-mono-val"
                                  :style="{ color: row.key === 'netMargin' ? (item.report.netMargin >= 0 ? '#10b981' : '#f43f5e') : row.valColor }">
                            {{ row.isRatio ? fmtComparePct(item.report[row.key]) : craftFmt(item.report[row.key]) }}
                          </strong>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                   :id="'file-card-' + file.id"
                   class="report-card-timeline" 
                   :class="{ 'highlight-card': highlightedFileId === file.id }"
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
              
                            <div class="tl-attachments" v-if="hasCardAttachments(file)" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; padding: 0 0.5rem;">
                <!-- Header vùng đính kèm + Nút Download All ZIP -->
                <div class="tl-attachments-toolbar" style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.3rem; border-bottom: 1px dashed rgba(255,255,255,0.08); margin-bottom: 0.15rem;">
                  <span style="font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.3px; display: inline-flex; align-items: center; gap: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    Tệp &amp; Ảnh ({{ getCardAttachmentCount(file) }})
                  </span>
                  <button type="button"
                          @click.stop.prevent="handleDownloadCardZip(file)"
                          :disabled="downloadingZipMap[file.id]"
                          class="btn-dl-all-zip"
                          :title="'Tải về toàn bộ ' + getCardAttachmentCount(file) + ' file & ảnh (.zip)'">
                    <template v-if="downloadingZipMap[file.id]">
                      <span class="zip-mini-spinner"></span>
                      <span>{{ zipProgressTextMap[file.id] || 'Đang nén...' }}</span>
                    </template>
                    <template v-else>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      <span>Download all</span>
                    </template>
                  </button>
                </div>

                <div v-if="file.linkFileBaoGia && file.linkFileBaoGia.length > 0" style="display: flex; flex-direction: column; gap: 0.4rem;">
                  <template v-if="Array.isArray(file.linkFileBaoGia)">
                    <div v-for="(link, i) in file.linkFileBaoGia" :key="'bg'+i" style="display: flex; align-items: center; justify-content: space-between; gap: 0.4rem;">
                      <a :href="typeof link === 'string' ? link : link.url" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(link)" style="flex: 1; min-width: 0;">
                        <span v-html="getFileIconSvg(link)" style="display: flex; align-items: center;"></span>
                        <span class="attach-text" :title="getFileName(link, 'File', i)">{{ truncateFileName(getFileName(link, 'File', i)) }}</span>
                      </a>
                      <a :href="getOfficeViewUrl(link)" target="_blank" @click.stop title="Xem file (Office Online)" style="background: rgba(59,130,246,0.12); color: #38bdf8; border: 1px solid rgba(59,130,246,0.25); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s; text-decoration: none;" onmouseover="this.style.background='#3b82f6'; this.style.color='white'" onmouseout="this.style.background='rgba(59,130,246,0.12)'; this.style.color='#38bdf8'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </a>
                      <button @click.stop.prevent="handleDownloadClick($event, link, getFileName(link, 'File', i))" title="Tải về" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>
                    </div>
                  </template>
                  <div v-else-if="typeof file.linkFileBaoGia === 'string' && file.linkFileBaoGia !== ''" style="display: flex; align-items: center; justify-content: space-between; gap: 0.4rem;">
                    <a :href="file.linkFileBaoGia" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(file.linkFileBaoGia)" style="flex: 1; min-width: 0;">
                       <span v-html="getFileIconSvg(file.linkFileBaoGia)" style="display: flex; align-items: center;"></span>
                       <span class="attach-text" :title="getFileName(file.linkFileBaoGia, 'File', 0)">{{ truncateFileName(getFileName(file.linkFileBaoGia, 'File', 0)) }}</span>
                    </a>
                    <a :href="getOfficeViewUrl(file.linkFileBaoGia)" target="_blank" @click.stop title="Xem file (Office Online)" style="background: rgba(59,130,246,0.12); color: #38bdf8; border: 1px solid rgba(59,130,246,0.25); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s; text-decoration: none;" onmouseover="this.style.background='#3b82f6'; this.style.color='white'" onmouseout="this.style.background='rgba(59,130,246,0.12)'; this.style.color='#38bdf8'">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </a>
                    <button @click.stop.prevent="handleDownloadClick($event, file.linkFileBaoGia, getFileName(file.linkFileBaoGia, 'File', 0))" title="Tải về" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                  </div>
                </div>

                <div v-if="file.linkImgSave && file.linkImgSave.length > 0" style="display: flex; flex-wrap: wrap; gap: 0.4rem; padding-top: 0.2rem;">
                  <template v-if="Array.isArray(file.linkImgSave)">
                    <a v-for="(link, i) in file.linkImgSave" :key="'img'+i" href="#" @click.stop.prevent="handleDownloadClick($event, link, 'HinhAnh_' + i)" style="width: 45px; height: 45px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                      <img :src="link" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                    </a>
                  </template>
                  <a v-else-if="typeof file.linkImgSave === 'string' && file.linkImgSave !== ''" href="#" @click.stop.prevent="handleDownloadClick($event, file.linkImgSave, 'HinhAnh_0')" style="width: 45px; height: 45px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    <img :src="file.linkImgSave" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                  </a>
                </div>
              </div>
              
              <!-- QUICK ACTIONS -->
              <div class="tl-quick-actions" style="display: flex; align-items: center; gap: 0.4rem; margin-top: auto; padding-top: 0.8rem; border-top: 1px dashed rgba(255,255,255,0.05);">
                
                <div v-if="currentViewCategory === 'mucDoUuTien' || currentViewCategory === 'trangThaiXuLy' || currentViewCategory === 'trangThaiBaoGia'" style="display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;">
                  <!-- Mức độ ưu tiên -->
                  <template v-if="currentViewCategory === 'mucDoUuTien'">
                    <span class="quick-action-text">Ưu tiên:</span>
                    <button @click.stop="quickUpdateStatus(file, 'mucDoUuTien', 'Thấp')" class="quick-btn btn-red" :class="{'active': file.mucDoUuTien === 'Thấp'}">Thấp</button>
                    <button @click.stop="quickUpdateStatus(file, 'mucDoUuTien', 'Bình thường')" class="quick-btn btn-orange" :class="{'active': file.mucDoUuTien === 'Bình thường'}">Bình thường</button>
                    <button @click.stop="quickUpdateStatus(file, 'mucDoUuTien', 'Cao')" class="quick-btn btn-green" :class="{'active': file.mucDoUuTien === 'Cao'}">Cao</button>
                  </template>
                  
                  <!-- Trạng thái xử lý -->
                  <template v-if="currentViewCategory === 'trangThaiXuLy'">
                    <span class="quick-action-text">Xử lý:</span>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiXuLy', 'Chưa gửi')" class="quick-btn btn-orange" :class="{'active': file.trangThaiXuLy === 'Chưa gửi'}">Chưa gửi</button>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiXuLy', 'Đã gửi')" class="quick-btn btn-green" :class="{'active': file.trangThaiXuLy === 'Đã gửi'}">Đã gửi</button>
                  </template>

                  <!-- Trạng thái báo giá -->
                  <template v-if="currentViewCategory === 'trangThaiBaoGia'">
                    <span class="quick-action-text">Báo giá:</span>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiBaoGia', 'Xem xét')" class="quick-btn btn-orange" :class="{'active': file.trangThaiBaoGia === 'Xem xét'}">Xem xét</button>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiBaoGia', 'Thành công')" class="quick-btn btn-green" :class="{'active': file.trangThaiBaoGia === 'Thành công'}">Thành công</button>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiBaoGia', 'Thất bại')" class="quick-btn btn-red" :class="{'active': file.trangThaiBaoGia === 'Thất bại'}">Thất bại</button>
                  </template>
                </div>
                
                <button type="button"
                        @click.stop="toggleSelectPageJsonCard(file.id)"
                        :style="(getPageJsonCardSelectionOrder(file.id) > 0
                          ? 'background: rgba(16,185,129,0.22); color: #34d399; border: 1px solid rgba(16,185,129,0.55);'
                          : 'background: rgba(15,23,42,0.7); color: #94a3b8; border: 1px solid rgba(148,163,184,0.28);') + ' padding: 4px 8px; border-radius: 6px; font-size: 0.72rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 700; font-family: monospace;'">
                  <span v-if="getPageJsonCardSelectionOrder(file.id) > 0">Bỏ chọn JSON (#{{ String(getPageJsonCardSelectionOrder(file.id)).padStart(2, '0') }})</span>
                  <span v-else>+ Chọn tải JSON</span>
                </button>

                <button v-if="hasRelatedFiles(file)" @click.stop="goToFlowViewAndHighlight(file)" type="button" style="margin-left: auto; background: rgba(59,130,246,0.1); color: #3b82f6; border: 1px solid rgba(59,130,246,0.2); padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='#3b82f6'; this.style.color='white'" onmouseout="this.style.background='rgba(59,130,246,0.1)'; this.style.color='#3b82f6'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  Xem file liên kết
                </button>

                <button v-if="hasRelatedFiles(file)" @click.stop="handleExportChainJson({ node: file })" :disabled="isExportingJson" type="button" style="margin-left: 4px; background: rgba(16,185,129,0.14); color: #34d399; border: 1px solid rgba(16,185,129,0.35); padding: 4px 8px; border-radius: 6px; font-size: 0.72rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 700;">
                  🔗 Tải JSON chuỗi ({{ getChainInfoForCard(file)?.totalCards || 1 }})
                </button>

                <button v-if="hasSaleReport(file)" @click.stop="openSaleReportForFile(file)" type="button" :style="(!hasRelatedFiles(file) ? 'margin-left: auto;' : 'margin-left: 6px;') + 'background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.25); padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 600; transition: all 0.2s;'" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  <span>Xem chỉ số ({{ getSaleReportStatsForFile(file).total }})</span>
                  <span v-if="getSaleReportStatsForFile(file).closed > 0" style="background: rgba(16,185,129,0.25); color: #10b981; font-size: 9px; padding: 1px 5px; border-radius: 4px; font-weight: 700; margin-left: 2px; border: 1px solid rgba(16,185,129,0.3);">ĐÃ CHỐT {{ getSaleReportStatsForFile(file).closed }}/{{ getSaleReportStatsForFile(file).total }}</span>
                </button>

                <button class="quick-delete-btn" @click.stop="deleteFile(file.id)" title="Xoá file" :style="(!hasRelatedFiles(file) && !hasSaleReport(file)) ? 'margin-left: auto;' : 'margin-left: 6px;'">
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
                   :id="'file-card-' + file.id"
                   class="report-card-timeline" 
                   :class="{'is-dragging': draggedFileId === file.id, 'highlight-card': highlightedFileId === file.id}"
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
              
                            <div class="tl-attachments" v-if="hasCardAttachments(file)" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; padding: 0 0.5rem;">
                <!-- Header vùng đính kèm + Nút Download All ZIP -->
                <div class="tl-attachments-toolbar" style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.3rem; border-bottom: 1px dashed rgba(255,255,255,0.08); margin-bottom: 0.15rem;">
                  <span style="font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.3px; display: inline-flex; align-items: center; gap: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    Tệp &amp; Ảnh ({{ getCardAttachmentCount(file) }})
                  </span>
                  <button type="button"
                          @click.stop.prevent="handleDownloadCardZip(file)"
                          :disabled="downloadingZipMap[file.id]"
                          class="btn-dl-all-zip"
                          :title="'Tải về toàn bộ ' + getCardAttachmentCount(file) + ' file & ảnh (.zip)'">
                    <template v-if="downloadingZipMap[file.id]">
                      <span class="zip-mini-spinner"></span>
                      <span>{{ zipProgressTextMap[file.id] || 'Đang nén...' }}</span>
                    </template>
                    <template v-else>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      <span>Download all</span>
                    </template>
                  </button>
                </div>

                <div v-if="file.linkFileBaoGia && file.linkFileBaoGia.length > 0" style="display: flex; flex-direction: column; gap: 0.4rem;">
                  <template v-if="Array.isArray(file.linkFileBaoGia)">
                    <div v-for="(link, i) in file.linkFileBaoGia" :key="'bg'+i" style="display: flex; align-items: center; justify-content: space-between; gap: 0.4rem;">
                      <a :href="typeof link === 'string' ? link : link.url" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(link)" style="flex: 1; min-width: 0;">
                        <span v-html="getFileIconSvg(link)" style="display: flex; align-items: center;"></span>
                        <span class="attach-text" :title="getFileName(link, 'File', i)">{{ truncateFileName(getFileName(link, 'File', i)) }}</span>
                      </a>
                      <a :href="getOfficeViewUrl(link)" target="_blank" @click.stop title="Xem file (Office Online)" style="background: rgba(59,130,246,0.12); color: #38bdf8; border: 1px solid rgba(59,130,246,0.25); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s; text-decoration: none;" onmouseover="this.style.background='#3b82f6'; this.style.color='white'" onmouseout="this.style.background='rgba(59,130,246,0.12)'; this.style.color='#38bdf8'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </a>
                      <button @click.stop.prevent="handleDownloadClick($event, link, getFileName(link, 'File', i))" title="Tải về" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>
                    </div>
                  </template>
                  <div v-else-if="typeof file.linkFileBaoGia === 'string' && file.linkFileBaoGia !== ''" style="display: flex; align-items: center; justify-content: space-between; gap: 0.4rem;">
                    <a :href="file.linkFileBaoGia" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(file.linkFileBaoGia)" style="flex: 1; min-width: 0;">
                       <span v-html="getFileIconSvg(file.linkFileBaoGia)" style="display: flex; align-items: center;"></span>
                       <span class="attach-text" :title="getFileName(file.linkFileBaoGia, 'File', 0)">{{ truncateFileName(getFileName(file.linkFileBaoGia, 'File', 0)) }}</span>
                    </a>
                    <a :href="getOfficeViewUrl(file.linkFileBaoGia)" target="_blank" @click.stop title="Xem file (Office Online)" style="background: rgba(59,130,246,0.12); color: #38bdf8; border: 1px solid rgba(59,130,246,0.25); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s; text-decoration: none;" onmouseover="this.style.background='#3b82f6'; this.style.color='white'" onmouseout="this.style.background='rgba(59,130,246,0.12)'; this.style.color='#38bdf8'">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </a>
                    <button @click.stop.prevent="handleDownloadClick($event, file.linkFileBaoGia, getFileName(file.linkFileBaoGia, 'File', 0))" title="Tải về" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                  </div>
                </div>

                <div v-if="file.linkImgSave && file.linkImgSave.length > 0" style="display: flex; flex-wrap: wrap; gap: 0.4rem; padding-top: 0.2rem;">
                  <template v-if="Array.isArray(file.linkImgSave)">
                    <a v-for="(link, i) in file.linkImgSave" :key="'img'+i" :href="link" target="_blank" @click.stop style="width: 45px; height: 45px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                      <img :src="link" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                    </a>
                  </template>
                  <a v-else-if="typeof file.linkImgSave === 'string' && file.linkImgSave !== ''" :href="file.linkImgSave" target="_blank" @click.stop style="width: 45px; height: 45px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    <img :src="file.linkImgSave" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                  </a>
                </div>
              </div>
              
              <!-- QUICK ACTIONS -->
              <div class="tl-quick-actions" style="display: flex; align-items: center; gap: 0.4rem; margin-top: auto; padding-top: 0.8rem; border-top: 1px dashed rgba(255,255,255,0.05);">
                
                <div v-if="currentViewCategory === 'mucDoUuTien' || currentViewCategory === 'trangThaiXuLy' || currentViewCategory === 'trangThaiBaoGia'" style="display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;">
                  <!-- Mức độ ưu tiên -->
                  <template v-if="currentViewCategory === 'mucDoUuTien'">
                    <span class="quick-action-text">Ưu tiên:</span>
                    <button @click.stop="quickUpdateStatus(file, 'mucDoUuTien', 'Thấp')" class="quick-btn btn-red" :class="{'active': file.mucDoUuTien === 'Thấp'}">Thấp</button>
                    <button @click.stop="quickUpdateStatus(file, 'mucDoUuTien', 'Bình thường')" class="quick-btn btn-orange" :class="{'active': file.mucDoUuTien === 'Bình thường'}">Bình thường</button>
                    <button @click.stop="quickUpdateStatus(file, 'mucDoUuTien', 'Cao')" class="quick-btn btn-green" :class="{'active': file.mucDoUuTien === 'Cao'}">Cao</button>
                  </template>
                  
                  <!-- Trạng thái xử lý -->
                  <template v-if="currentViewCategory === 'trangThaiXuLy'">
                    <span class="quick-action-text">Xử lý:</span>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiXuLy', 'Chưa gửi')" class="quick-btn btn-orange" :class="{'active': file.trangThaiXuLy === 'Chưa gửi'}">Chưa gửi</button>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiXuLy', 'Đã gửi')" class="quick-btn btn-green" :class="{'active': file.trangThaiXuLy === 'Đã gửi'}">Đã gửi</button>
                  </template>

                  <!-- Trạng thái báo giá -->
                  <template v-if="currentViewCategory === 'trangThaiBaoGia'">
                    <span class="quick-action-text">Báo giá:</span>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiBaoGia', 'Xem xét')" class="quick-btn btn-orange" :class="{'active': file.trangThaiBaoGia === 'Xem xét'}">Xem xét</button>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiBaoGia', 'Thành công')" class="quick-btn btn-green" :class="{'active': file.trangThaiBaoGia === 'Thành công'}">Thành công</button>
                    <button @click.stop="quickUpdateStatus(file, 'trangThaiBaoGia', 'Thất bại')" class="quick-btn btn-red" :class="{'active': file.trangThaiBaoGia === 'Thất bại'}">Thất bại</button>
                  </template>
                </div>

                <button type="button"
                        @click.stop="toggleSelectPageJsonCard(file.id)"
                        style="margin-left: auto;"
                        :style="(getPageJsonCardSelectionOrder(file.id) > 0
                          ? 'background: rgba(16,185,129,0.22); color: #34d399; border: 1px solid rgba(16,185,129,0.55);'
                          : 'background: rgba(15,23,42,0.7); color: #94a3b8; border: 1px solid rgba(148,163,184,0.28);') + ' padding: 4px 8px; border-radius: 6px; font-size: 0.72rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 700; font-family: monospace;'">
                  <span v-if="getPageJsonCardSelectionOrder(file.id) > 0">Bỏ chọn JSON (#{{ String(getPageJsonCardSelectionOrder(file.id)).padStart(2, '0') }})</span>
                  <span v-else>+ Chọn tải JSON</span>
                </button>
                
                <button class="quick-delete-btn" @click.stop="deleteFile(file.id)" title="Xoá file">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>

              <!-- FILE LIÊN KẾT (FULL WIDTH ROW) -->
              <div v-if="hasRelatedFiles(file)" style="margin-top: 0.6rem; display: flex; flex-direction: column; gap: 6px;">
                <button @click.stop="goToFlowViewAndHighlight(file)" type="button" style="width: 100%; justify-content: center; background: rgba(59,130,246,0.1); color: #3b82f6; border: 1px solid rgba(59,130,246,0.2); padding: 8px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='#3b82f6'; this.style.color='white'" onmouseout="this.style.background='rgba(59,130,246,0.1)'; this.style.color='#3b82f6'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  Xem các file đã liên kết
                </button>
                <div style="display: flex; gap: 6px;">
                  <button @click.stop="handleExportChainJson({ node: file })" :disabled="isExportingJson" type="button" style="width: 100%; justify-content: center; background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.32); padding: 6px 8px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: 700;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    <span>Tải JSON chuỗi ({{ getChainInfoForCard(file)?.totalCards || 1 }})</span>
                  </button>
                </div>
              </div>

              <!-- NÚT XEM CHỈ SỐ SALE REPORT (NẾU ĐÃ CÓ THÔNG TIN SALE REPORT) -->
              <div v-if="hasSaleReport(file)" style="margin-top: 0.6rem;">
                <button @click.stop="openSaleReportForFile(file)" type="button" style="width: 100%; justify-content: center; background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.25); padding: 8px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  <span>Xem chỉ số ({{ getSaleReportStatsForFile(file).total }})</span>
                  <span v-if="getSaleReportStatsForFile(file).closed > 0" style="background: rgba(16,185,129,0.25); color: #10b981; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-left: 2px; border: 1px solid rgba(16,185,129,0.3);">ĐÃ CHỐT {{ getSaleReportStatsForFile(file).closed }}/{{ getSaleReportStatsForFile(file).total }}</span>
                </button>
              </div>
            </div>
          </div>
          </div>
          </div>
        </div>

        <!-- THANH NỔI KHI NGƯỜI DÙNG CLICK CHỌN CÁC CARD TRỰC TIẾP TRÊN TRANG ĐỂ TẢI JSON -->
        <div v-if="selectedPageJsonCardIds.length > 0" class="cmp-floating-dock json-cards-floating-dock" :style="selectedPageJsonCardIds.length > 0 && selectedCompareItems.length > 0 ? 'bottom: 74px;' : 'bottom: 20px;'">
          <div class="cmp-dock-status">
            <span class="cmp-dock-indicator" style="background: #10b981; box-shadow: 0 0 8px #10b981;"></span>
            <span>Đã chọn <strong class="cmp-dock-count" style="color: #34d399;">{{ String(selectedPageJsonCardIds.length).padStart(2, '0') }}</strong> card để tải JSON</span>
          </div>
          <button v-if="canExpandPageSelectionToFullChain"
                  type="button"
                  class="cmp-dock-json-btn"
                  style="background: rgba(245, 158, 11, 0.14); color: #fbbf24; border-color: rgba(245, 158, 11, 0.4);"
                  @click="expandPageSelectionToFullChains"
                  title="Chọn thêm tất cả các card còn lại thuộc cùng chuỗi liên kết với các card đang chọn">
            <span>+ Chọn trọn chuỗi liên kết</span>
          </button>
          <button type="button"
                  class="cmp-dock-primary-btn"
                  style="background: linear-gradient(135deg, #10b981, #059669); border-color: #10b981;"
                  :disabled="isExportingJson"
                  @click="handleExportSelectedPageCardsJson">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>{{ isExportingJson ? 'Đang tải...' : 'Tải JSON (' + selectedPageJsonCardIds.length + ' card đã chọn)' }}</span>
          </button>
          <button type="button"
                  class="cmp-dock-clear-btn"
                  @click="selectedPageJsonCardIds = []"
                  title="Bỏ chọn tất cả card">
            Bỏ chọn tất cả
          </button>
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
                    <div style="font-size: 0.78rem; color: #64748b; font-family: monospace;">
                      Mã KH: <strong style="color: #0284c7;">{{ formData.maKH }}</strong>
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
                <label style="display: flex; justify-content: space-between; align-items: center;">
                  <span>Nội dung File <span style="color: #ef4444; font-weight: 700;">*</span></span>
                  <span v-if="!formData.noiDung && getFallbackFileName()" style="font-size: 11px; font-weight: 600; color: #10b981; font-style: italic; background: rgba(16,185,129,0.08); padding: 1px 8px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.2);">
                    Tự động lấy: {{ getFallbackFileName() }}
                  </span>
                </label>
                <textarea v-model="formData.noiDung" class="elite-textarea" style="flex: 1; min-height: 120px; resize: none;" :placeholder="getFallbackFileName() ? ('Tự động lấy tên file: ' + getFallbackFileName()) : 'Nhập nội dung chi tiết (bắt buộc)...'"></textarea>
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
                  <a :href="getOfficeViewUrl(link)" target="_blank" @click.stop style="color: #3b82f6; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 4px; flex-shrink: 0;" title="Xem file (Office Online)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </a>
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
          <button v-if="editingId" type="button" @click="openCraftModal()" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;padding:0.6rem 1.2rem;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.85rem;display:flex;align-items:center;gap:6px;box-shadow:0 4px 12px rgba(99,102,241,.3);transition:all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span>{{ getSaleReportStatsForFile(formData).total > 0 ? `Sale Report (${getSaleReportStatsForFile(formData).total})` : 'Tạo Sale Report' }}</span>
          </button>
          <button class="elite-btn-cancel" @click="closeModal">Hủy</button>
          <button v-if="!editingId" class="elite-btn-save" @click="saveFile" :disabled="isUploadingFile || isUploadingImage" style="background: #3b82f6; border-color: #3b82f6; padding: 0.6rem 1.5rem;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'" :style="{ opacity: (isUploadingFile || isUploadingImage) ? 0.5 : 1 }">Tạo Mới File</button>
          <button v-else-if="isFileDataChanged" class="elite-btn-save" @click="saveFile" :disabled="isUploadingFile || isUploadingImage" style="background: #10b981; border-color: #10b981; padding: 0.6rem 1.5rem;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'" :style="{ opacity: (isUploadingFile || isUploadingImage) ? 0.5 : 1 }">Lưu Thay Đổi</button>
        </div>
      </div>
    </div>

    <!-- Modal Popup Cảnh báo Khác Khách Hàng giữa Modal File & Modal Craft -->
    <Teleport to="body">
      <Transition name="taste-modal">
        <div v-if="isCustomerMismatchPopupOpen && activeFileCraftCustomerMismatch" class="taste-modal-overlay" style="z-index: 100020;" @click.self="isCustomerMismatchPopupOpen = false" role="dialog" aria-modal="true">
          <div class="taste-modal-shell taste-variant-warning" style="width: 580px; max-width: 95vw;">
            <div class="taste-modal-glow" aria-hidden="true" style="background: #f59e0b;"></div>
            <div class="taste-modal-core">
              <button type="button" class="taste-modal-close" @click="isCustomerMismatchPopupOpen = false" title="Đóng (Esc)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <div class="taste-modal-body" style="align-items: flex-start;">
                <div class="taste-jewel-wrap">
                  <div class="taste-jewel-box" style="background: radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(245, 158, 11, 0.05) 100%); border: 1px solid rgba(245, 158, 11, 0.4); box-shadow: 0 0 24px rgba(245, 158, 11, 0.25);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                </div>

                <div class="taste-modal-text" style="width: 100%;">
                  <div class="taste-eyebrow" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
                    <span class="taste-eyebrow-dot" style="background: #f59e0b;"></span>
                    <span>CẢNH BÁO LỆCH KHÁCH HÀNG</span>
                  </div>
                  <h3 class="taste-title">Khác Khách Hàng Giữa Modal File &amp; Modal Craft</h3>
                  <div class="taste-message">
                    Thông tin Khách hàng ở <strong style="color: #38bdf8;">Modal File</strong> và <strong style="color: #fbbf24;">Modal Craft</strong> đang khác nhau. Nhấn chọn ô Khách hàng bạn muốn áp dụng rồi bấm <strong style="color: #10b981;">Xác nhận</strong>:
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px;">
                    <!-- Ô 1: Khách hàng ở Modal File -->
                    <div
                      @click="activeFileCraftCustomerMismatch.fileMaKH ? (selectedMismatchChoice = 'file') : null"
                      :style="{
                        background: selectedMismatchChoice === 'file' ? 'rgba(56, 189, 248, 0.16)' : 'rgba(15, 23, 42, 0.78)',
                        border: selectedMismatchChoice === 'file' ? '2px solid #38bdf8' : '1px solid rgba(56, 189, 248, 0.35)',
                        boxShadow: selectedMismatchChoice === 'file' ? '0 0 18px rgba(56, 189, 248, 0.28)' : 'none',
                        borderRadius: '10px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        cursor: activeFileCraftCustomerMismatch.fileMaKH ? 'pointer' : 'not-allowed',
                        opacity: activeFileCraftCustomerMismatch.fileMaKH ? 1 : 0.55,
                        transition: 'all 0.18s ease',
                        position: 'relative'
                      }"
                    >
                      <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                        <div style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; color: #38bdf8; letter-spacing: 0.4px;">Khách hàng ở Modal File</div>
                        <span
                          :style="{
                            width: '18px',
                            height: '18px',
                            borderRadius: '999px',
                            border: selectedMismatchChoice === 'file' ? '2px solid #38bdf8' : '1.5px solid #475569',
                            background: selectedMismatchChoice === 'file' ? '#38bdf8' : 'transparent',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.15s'
                          }"
                        >
                          <svg v-if="selectedMismatchChoice === 'file'" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                      </div>
                      <div style="font-size: 13px; font-weight: 700; color: #f8fafc; word-break: break-word;">{{ activeFileCraftCustomerMismatch.fileComp || activeFileCraftCustomerMismatch.fileRec || 'Chưa chọn KH' }}</div>
                      <div style="font-size: 11.5px; color: #cbd5e1; display: flex; flex-direction: column; gap: 3px; margin-top: 2px;">
                        <span>Người nhận: <strong style="color: #fff;">{{ activeFileCraftCustomerMismatch.fileRec || '—' }}</strong></span>
                        <span>MST: <strong style="color: #94a3b8; font-family: monospace;">{{ activeFileCraftCustomerMismatch.fileMst || '—' }}</strong></span>
                        <span v-if="activeFileCraftCustomerMismatch.fileMaKH">Mã KH: <strong style="color: #38bdf8; font-family: monospace;">{{ activeFileCraftCustomerMismatch.fileMaKH }}</strong></span>
                      </div>
                    </div>

                    <!-- Ô 2: Khách hàng ở Modal Craft -->
                    <div
                      @click="(activeFileCraftCustomerMismatch.craftComp || activeFileCraftCustomerMismatch.craftRec || activeFileCraftCustomerMismatch.craftMaKH) ? (selectedMismatchChoice = 'craft') : null"
                      :style="{
                        background: selectedMismatchChoice === 'craft' ? 'rgba(245, 158, 11, 0.16)' : 'rgba(15, 23, 42, 0.78)',
                        border: selectedMismatchChoice === 'craft' ? '2px solid #f59e0b' : '1px solid rgba(245, 158, 11, 0.4)',
                        boxShadow: selectedMismatchChoice === 'craft' ? '0 0 18px rgba(245, 158, 11, 0.28)' : 'none',
                        borderRadius: '10px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        cursor: (activeFileCraftCustomerMismatch.craftComp || activeFileCraftCustomerMismatch.craftRec || activeFileCraftCustomerMismatch.craftMaKH) ? 'pointer' : 'not-allowed',
                        opacity: (activeFileCraftCustomerMismatch.craftComp || activeFileCraftCustomerMismatch.craftRec || activeFileCraftCustomerMismatch.craftMaKH) ? 1 : 0.55,
                        transition: 'all 0.18s ease',
                        position: 'relative'
                      }"
                    >
                      <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                        <div style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; color: #fbbf24; letter-spacing: 0.4px;">Khách hàng ở Modal Craft</div>
                        <span
                          :style="{
                            width: '18px',
                            height: '18px',
                            borderRadius: '999px',
                            border: selectedMismatchChoice === 'craft' ? '2px solid #f59e0b' : '1.5px solid #475569',
                            background: selectedMismatchChoice === 'craft' ? '#f59e0b' : 'transparent',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.15s'
                          }"
                        >
                          <svg v-if="selectedMismatchChoice === 'craft'" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                      </div>
                      <div style="font-size: 13px; font-weight: 700; color: #fef3c7; word-break: break-word;">{{ activeFileCraftCustomerMismatch.craftComp || activeFileCraftCustomerMismatch.craftRec || 'Chưa nhập KH' }}</div>
                      <div style="font-size: 11.5px; color: #cbd5e1; display: flex; flex-direction: column; gap: 3px; margin-top: 2px;">
                        <span>Người nhận: <strong style="color: #fff;">{{ activeFileCraftCustomerMismatch.craftRec || '—' }}</strong></span>
                        <span>MST: <strong style="color: #94a3b8; font-family: monospace;">{{ activeFileCraftCustomerMismatch.craftMst || '—' }}</strong></span>
                        <span v-if="activeFileCraftCustomerMismatch.craftMaKH">Mã KH: <strong style="color: #fbbf24; font-family: monospace;">{{ activeFileCraftCustomerMismatch.craftMaKH }}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="taste-modal-actions">
                <button type="button" @click="isCustomerMismatchPopupOpen = false" class="taste-btn taste-btn-secondary">Đóng</button>
                <button v-if="selectedMismatchChoice" type="button" @click="confirmCustomerMismatchChoice" class="taste-btn taste-btn-primary taste-btn-success">
                  <span>Xác nhận</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Cảnh báo Khác Khách Hàng (Taste-Skill Precision & Double-Bezel Design) -->
    <Teleport to="body">
      <Transition name="taste-modal">
        <div v-if="isWarningCustomerModalOpen" class="taste-modal-overlay" @click.self="isWarningCustomerModalOpen = false" role="dialog" aria-modal="true">
          <div class="taste-modal-shell taste-variant-warning" style="width: 480px;">
            <div class="taste-modal-glow" aria-hidden="true" style="background: #f59e0b;"></div>
            <div class="taste-modal-core">
              <button type="button" class="taste-modal-close" @click="isWarningCustomerModalOpen = false" title="Đóng (Esc)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <div class="taste-modal-body">
                <div class="taste-jewel-wrap">
                  <div class="taste-jewel-box" style="background: radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(245, 158, 11, 0.05) 100%); border: 1px solid rgba(245, 158, 11, 0.4); box-shadow: 0 0 24px rgba(245, 158, 11, 0.25);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                </div>

                <div class="taste-modal-text">
                  <div class="taste-eyebrow" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
                    <span class="taste-eyebrow-dot" style="background: #f59e0b;"></span>
                    <span>CẢNH BÁO LIÊN KẾT KHÁCH HÀNG</span>
                  </div>
                  <h3 class="taste-title">Khác Khách Hàng Gốc</h3>
                  <div class="taste-message">
                    Bạn đang cố liên kết với một Hồ sơ thuộc về <strong style="color: #f8fafc;">Khách hàng khác</strong>:
                    <div style="margin: 12px 0; padding: 12px 14px; border-radius: 12px; background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #94a3b8;">Khách hàng thẻ gốc:</span>
                        <span style="color: #f87171; font-weight: 700; font-family: 'JetBrains Mono', monospace; background: rgba(239,68,68,0.12); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(239,68,68,0.3);">{{ pendingLinkedFile?.maKH }}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #94a3b8;">Khách hàng thẻ hiện tại:</span>
                        <span style="color: #38bdf8; font-weight: 700; font-family: 'JetBrains Mono', monospace; background: rgba(56,189,248,0.12); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(56,189,248,0.3);">{{ formData.maKH }}</span>
                      </div>
                    </div>
                    Bạn có chắc chắn muốn tiếp tục thực hiện liên kết này không?
                  </div>
                </div>
              </div>

              <div class="taste-modal-actions">
                <button type="button" @click="isWarningCustomerModalOpen = false" class="taste-btn taste-btn-secondary">Hủy bỏ</button>
                <button type="button" @click="confirmLinkedFile" class="taste-btn taste-btn-primary taste-btn-warning">
                  <span>Vẫn Liên kết</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    
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
              
              <div class="tl-attachments" v-if="hasCardAttachments(f)" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.8rem; padding-top: 0.5rem; border-top: 1px dashed rgba(255,255,255,0.05);">
                <!-- Header vùng đính kèm + Nút Download All ZIP -->
                <div class="tl-attachments-toolbar" style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.3rem; border-bottom: 1px dashed rgba(255,255,255,0.08); margin-bottom: 0.15rem;">
                  <span style="font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.3px; display: inline-flex; align-items: center; gap: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    Tệp &amp; Ảnh ({{ getCardAttachmentCount(f) }})
                  </span>
                  <button type="button"
                          @click.stop.prevent="handleDownloadCardZip(f)"
                          :disabled="downloadingZipMap[f.id]"
                          class="btn-dl-all-zip"
                          :title="'Tải về toàn bộ ' + getCardAttachmentCount(f) + ' file & ảnh (.zip)'">
                    <template v-if="downloadingZipMap[f.id]">
                      <span class="zip-mini-spinner"></span>
                      <span>{{ zipProgressTextMap[f.id] || 'Đang nén...' }}</span>
                    </template>
                    <template v-else>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      <span>Download all</span>
                    </template>
                  </button>
                </div>
                <div v-if="f.linkFileBaoGia && f.linkFileBaoGia.length > 0" style="display: flex; flex-direction: column; gap: 0.4rem;">
                  <template v-if="Array.isArray(f.linkFileBaoGia)">
                    <div v-for="(link, i) in f.linkFileBaoGia" :key="'bg'+i" style="display: flex; align-items: center; justify-content: space-between; gap: 0.4rem;">
                      <a :href="typeof link === 'string' ? link : link.url" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(link)" style="flex: 1; min-width: 0;">
                        <span v-html="getFileIconSvg(link)" style="display: flex; align-items: center;"></span>
                        <span class="attach-text" :title="getFileName(link, 'File', i)">{{ truncateFileName(getFileName(link, 'File', i)) }}</span>
                      </a>
                      <a :href="getOfficeViewUrl(link)" target="_blank" @click.stop title="Xem file (Office Online)" style="background: rgba(59,130,246,0.12); color: #38bdf8; border: 1px solid rgba(59,130,246,0.25); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s; text-decoration: none;" onmouseover="this.style.background='#3b82f6'; this.style.color='white'" onmouseout="this.style.background='rgba(59,130,246,0.12)'; this.style.color='#38bdf8'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </a>
                      <button @click.stop.prevent="handleDownloadClick($event, typeof link === 'string' ? link : link.url, getFileName(link, 'File', i))" title="Tải về" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>
                    </div>
                  </template>
                  <div v-else-if="typeof f.linkFileBaoGia === 'string' && f.linkFileBaoGia !== ''" style="display: flex; align-items: center; justify-content: space-between; gap: 0.4rem;">
                    <a :href="f.linkFileBaoGia" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(f.linkFileBaoGia)" style="flex: 1; min-width: 0;">
                       <span v-html="getFileIconSvg(f.linkFileBaoGia)" style="display: flex; align-items: center;"></span>
                       <span class="attach-text" :title="getFileName(f.linkFileBaoGia, 'File', 0)">{{ truncateFileName(getFileName(f.linkFileBaoGia, 'File', 0)) }}</span>
                    </a>
                    <a :href="getOfficeViewUrl(f.linkFileBaoGia)" target="_blank" @click.stop title="Xem file (Office Online)" style="background: rgba(59,130,246,0.12); color: #38bdf8; border: 1px solid rgba(59,130,246,0.25); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s; text-decoration: none;" onmouseover="this.style.background='#3b82f6'; this.style.color='white'" onmouseout="this.style.background='rgba(59,130,246,0.12)'; this.style.color='#38bdf8'">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
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
           <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
             <div>
               <label style="font-weight: 600; font-size: 13px; color: #475569;">Trạng thái</label>
               <input type="text" v-model="customerFormData.trang_thai" class="elite-input" placeholder="Active / Tiềm năng" />
             </div>
             <div>
               <label style="font-weight: 600; font-size: 13px; color: #475569;">Hoa hồng (%)</label>
               <input type="text" v-model="customerFormData.hoa_hong" class="elite-input" />
             </div>
             <div>
               <label style="font-weight: 600; font-size: 13px; color: #ef4444;">Công nợ hiện tại (VNĐ)</label>
               <input type="text" :value="Number(customerFormData.cong_no || 0).toLocaleString('vi-VN') + ' đ'" readonly class="elite-input" style="background: #fef2f2; color: #dc2626; font-weight: 700; border-color: #fecaca; cursor: default;" title="Tự động tổng hợp từ công nợ các PO trong Sale Report chính thức" />
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
    <!-- Global Alert/Confirm Modal (Taste-Skill Precision & Double-Bezel Design) -->
    <Teleport to="body">
      <Transition name="taste-modal">
        <div 
          v-if="appDialog.isOpen" 
          class="taste-modal-overlay" 
          @click.self="closeAppDialog(false)"
          role="dialog"
          aria-modal="true"
        >
          <div class="taste-modal-shell" :class="['taste-variant-' + getAppDialogVariant()]">
            <!-- Double-Bezel Ambient Aura Glow -->
            <div class="taste-modal-glow" aria-hidden="true"></div>

            <div class="taste-modal-core">
              <!-- Close cross button -->
              <button 
                type="button" 
                class="taste-modal-close" 
                @click="closeAppDialog(false)" 
                title="Đóng (Esc)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <div class="taste-modal-body">
                <!-- Jewel Icon with ambient aura -->
                <div class="taste-jewel-wrap">
                  <div class="taste-jewel-box">
                    <!-- Success Icon -->
                    <svg v-if="getAppDialogVariant() === 'success'" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <!-- Warning / Danger Icon -->
                    <svg v-else-if="getAppDialogVariant() === 'danger'" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <!-- Confirm Icon -->
                    <svg v-else-if="appDialog.type === 'confirm'" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <!-- Default Info Icon -->
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                </div>

                <!-- Text Content -->
                <div class="taste-modal-text">
                  <div class="taste-eyebrow">
                    <span class="taste-eyebrow-dot"></span>
                    <span>{{ getAppDialogEyebrow() }}</span>
                  </div>
                  <h3 class="taste-title">{{ cleanDialogTitle(appDialog.title) }}</h3>
                  <div class="taste-message">{{ cleanDialogMessage(appDialog.message) }}</div>
                </div>
              </div>

              <!-- Action buttons with tactile physics -->
              <div class="taste-modal-actions">
                <button 
                  v-if="appDialog.type === 'confirm'" 
                  type="button"
                  @click="closeAppDialog(false)" 
                  class="taste-btn taste-btn-secondary"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="button"
                  @click="closeAppDialog(true)" 
                  class="taste-btn taste-btn-primary"
                  :class="['taste-btn-' + getAppDialogVariant()]"
                >
                  <span>{{ appDialog.type === 'confirm' ? 'Xác nhận' : 'Đã hiểu' }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ═══ SALE REPORT CRAFT MODAL (100% layout giống SaleReportFirebase) ═══ -->
    <Teleport to="body">
      <div v-if="craftModal.show && craftModal.item" class="sr-modal-overlay" @click.self="closeCraftModal()" style="z-index: 10000;">
        <div class="sr-modal sr-modal-large">
          <div class="sr-modal-body" style="background: transparent; padding: 0; max-height: 95vh; overflow-y: auto; border-radius: 16px;">
            <!-- Header -->
            <div class="sr-import-card-header" style="border-radius: 16px 16px 0 0; border-top: none; border-left: none; border-right: none; background: linear-gradient(135deg, #1e293b, #0f172a); display: flex; justify-content: space-between; align-items: center;">
              <h4 style="margin:0; font-size: 18px; color:#f8fafc; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span>📊 {{ craftModal.item?.content || 'Sale Report Craft' }}</span>
                <span style="font-size: 12px; font-weight: 600; color: #94a3b8; background: rgba(148,163,184,0.12); padding: 2px 10px; border-radius: 12px; border: 1px solid rgba(148,163,184,0.2);">Tab {{ (craftModal.activeIndex || 0) + 1 }}/{{ (craftModal.items || []).length || 1 }}</span>
                <span v-if="craftModal.item?.chotDeal" style="background:#10b981;color:white;padding:2px 10px;border-radius:12px;font-size:11px;">ĐÃ CHỐT</span>
              </h4>
              <button @click="closeCraftModal()" style="background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 6px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,.15)'; this.style.color='#ef4444'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'" title="Đóng cửa sổ">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <!-- Thanh Tabs quản lý nhiều Sale Report trong cùng 1 File -->
            <div style="background: #0b1120; border-bottom: 1px solid #1e293b; padding: 10px 24px; display: flex; align-items: center; gap: 8px; overflow-x: auto;">
              <div v-for="(tabIt, tIdx) in (craftModal.items || [])" :key="tabIt.craftId || ('tab-' + tIdx)"
                   @click="selectCraftTab(tIdx)"
                   :style="{
                     display: 'inline-flex',
                     alignItems: 'center',
                     gap: '8px',
                     padding: '7px 12px',
                     borderRadius: '8px',
                     cursor: 'pointer',
                     fontSize: '12.5px',
                     fontWeight: craftModal.activeIndex === tIdx ? '700' : '500',
                     background: craftModal.activeIndex === tIdx ? 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(59,130,246,0.18))' : 'rgba(30,41,59,0.6)',
                     color: craftModal.activeIndex === tIdx ? '#f8fafc' : '#94a3b8',
                     border: craftModal.activeIndex === tIdx ? '1px solid #38bdf8' : '1px solid #1e293b',
                     whiteSpace: 'nowrap',
                     transition: 'all 0.15s',
                     flexShrink: 0
                   }">
                <span>#{{ tIdx + 1 }} {{ tabIt.soPO ? ('PO ' + tabIt.soPO) : (tabIt.content ? (tabIt.content.length > 22 ? tabIt.content.slice(0, 22) + '...' : tabIt.content) : ('Báo cáo ' + (tIdx + 1))) }}</span>
                <span v-if="tabIt.chotDeal" style="background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.35); font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 999px;">✓ Đã chốt</span>
                <span v-else-if="tabIt.craftId" style="background: rgba(148,163,184,0.15); color: #cbd5e1; font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 999px;">Nháp</span>
                <span v-else style="background: rgba(245,158,11,0.18); color: #fbbf24; font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 999px;">Mới</span>
                <button v-if="(craftModal.items || []).length > 1 || tabIt.craftId" @click.stop="deleteCraftTab(tIdx)" type="button" title="Xóa Sale Report này" style="background: transparent; border: none; color: #64748b; cursor: pointer; padding: 0 2px; font-size: 13px; line-height: 1; display: inline-flex; align-items: center;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#64748b'">✕</button>
              </div>

              <button type="button" @click="addNewCraftTab()" style="display: inline-flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 8px; cursor: pointer; font-size: 12.5px; font-weight: 700; background: rgba(16,185,129,0.12); color: #10b981; border: 1px dashed rgba(16,185,129,0.45); white-space: nowrap; flex-shrink: 0; transition: all 0.15s;" onmouseover="this.style.background='#10b981'; this.style.color='#ffffff'" onmouseout="this.style.background='rgba(16,185,129,0.12)'; this.style.color='#10b981'">
                + Thêm Sale Report
              </button>
            </div>

            <!-- Hidden file inputs -->
            <input type="file" ref="craftFileInputBG" accept=".xlsx,.xls,.pdf" style="display:none" @change="(e) => onCraftFileSelected(e, 'bao_gia')" />
            <input type="file" ref="craftFileInputMH" accept=".xlsx,.xls,.pdf" style="display:none" @change="(e) => onCraftFileSelected(e, 'mua_hang')" />
            <input type="file" ref="craftScanInput" accept="image/*" style="display:none" @change="onCraftScanSelected" />

            <!-- BODY: 2 COLUMN LAYOUT (giống SaleReportFirebase) -->
            <div class="sr-import-card-body" style="padding: 0; background: transparent;">
              <div style="display: flex; gap: 24px; padding: 24px; height: calc(90vh - 230px); box-sizing: border-box;">
                <!-- ═══ CỘT TRÁI: FILE ĐÍNH KÈM & XEM TRƯỚC (Linear-Clean / Anti-Slop Design) ═══ -->
                <div style="flex: 0 0 500px; display: flex; flex-direction: column; background: #080d16; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden; min-width: 0;">
                  <!-- Header -->
                  <div style="padding: 14px 18px; border-bottom: 1px solid #1e293b; background: #0c121e; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span style="font-size: 13px; font-weight: 600; color: #f1f5f9; letter-spacing: 0.2px;">Hồ sơ đính kèm &amp; Chứng từ</span>
                    </div>
                    <span style="font-size: 10.5px; font-weight: 600; color: #64748b; letter-spacing: 0.8px; text-transform: uppercase;">PO Documents</span>
                  </div>

                  <!-- Content Scroll Area -->
                  <div style="padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; flex: 1; min-height: 0;">

                    <!-- 1. Card Ảnh chứng từ -->
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s;" onmouseover="this.style.borderColor='#334155'" onmouseout="this.style.borderColor='#1e293b'">
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <!-- Thumbnail box -->
                        <div @click="craftScanInput?.click()" style="cursor: pointer; flex-shrink: 0; width: 42px; height: 42px; border-radius: 6px; background: #172033; border: 1px solid #233044; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: border-color 0.2s;" :title="craftModal.item?.base64Img ? 'Bấm để đổi ảnh khác' : 'Chọn ảnh chứng từ'">
                          <img v-if="craftModal.item?.base64Img" :src="'data:image/jpeg;base64,' + craftModal.item.base64Img" style="width: 100%; height: 100%; object-fit: cover;" />
                          <img v-else-if="craftModal.item?.existingImgUrl" :src="craftModal.item.existingImgUrl" style="width: 100%; height: 100%; object-fit: cover;" />
                          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                        </div>

                        <!-- Info -->
                        <div style="flex: 1; min-width: 0;">
                          <div style="font-size: 13px; font-weight: 600; color: #f1f5f9; line-height: 1.2;">Ảnh chứng từ</div>
                          <div style="margin-top: 3px;">
                            <span v-if="craftModal.item?.scanning" style="font-size: 11.5px; color: #f59e0b; display: flex; align-items: center; gap: 4px;">
                              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #f59e0b;"></span>
                              Đang tải và quét OCR...
                            </span>
                            <span v-else-if="craftModal.item?.base64Img || craftModal.item?.existingImgUrl" style="font-size: 11.5px; color: #10b981; display: flex; align-items: center; gap: 4px;">
                              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
                              Đã có ảnh chứng từ
                            </span>
                            <span v-else style="font-size: 11.5px; color: #64748b;">Chưa đính kèm ảnh</span>
                          </div>
                        </div>

                        <!-- Actions -->
                        <div style="display: flex; gap: 6px; flex-shrink: 0;">
                          <button type="button" @click="toggleExistingPicker('image')" style="background: #182234; color: #94a3b8; border: 1px solid #27374f; border-radius: 6px; padding: 5px 9px; font-size: 11.5px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s;" onmouseover="this.style.color='#f1f5f9'; this.style.borderColor='#3b82f6'" onmouseout="this.style.color='#94a3b8'; this.style.borderColor='#27374f'" title="Chọn ảnh đã tải lên trong hồ sơ này">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                            Chọn sẵn có ({{ (formData.linkImgSave || []).length }})
                          </button>
                          <button type="button" @click="craftScanInput?.click()" style="background: #1e293b; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 5px 10px; font-size: 11.5px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s;" onmouseover="this.style.background='#2563eb'; this.style.borderColor='#3b82f6'; this.style.color='#fff'" onmouseout="this.style.background='#1e293b'; this.style.borderColor='#334155'; this.style.color='#e2e8f0'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            {{ (craftModal.item?.base64Img || craftModal.item?.existingImgUrl) ? 'Đổi ảnh' : 'Tải từ máy' }}
                          </button>
                        </div>
                      </div>

                      <!-- Sub-drawer chọn ảnh có sẵn -->
                      <div v-if="craftExistingPicker === 'image'" style="margin-top: 4px; padding: 12px; background: #080d16; border: 1px solid #233044; border-radius: 6px; display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Thư viện ảnh hồ sơ ({{ (formData.linkImgSave || []).length }})</span>
                          <button type="button" @click="craftExistingPicker = null" style="background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 14px; padding: 2px 4px;" title="Đóng">✕</button>
                        </div>
                        <div v-if="!formData.linkImgSave || !formData.linkImgSave.length" style="color: #64748b; font-size: 11.5px; font-style: italic; padding: 6px 0; text-align: center;">
                          Chưa có ảnh nào được tải lên cho hồ sơ này.
                        </div>
                        <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(105px, 1fr)); gap: 8px; max-height: 180px; overflow-y: auto;">
                          <div v-for="(img, idx) in formData.linkImgSave" :key="'ex-img-'+idx" @click="selectExistingImageForCraft(img)" style="background: #111827; border: 1px solid #1f2937; border-radius: 6px; overflow: hidden; cursor: pointer; display: flex; flex-direction: column; gap: 4px; padding: 4px; transition: all 0.15s;" onmouseover="this.style.borderColor='#3b82f6'; this.style.transform='translateY(-1px)'" onmouseout="this.style.borderColor='#1f2937'; this.style.transform='translateY(0)'">
                            <img :src="getExistingUrl(img)" style="width: 100%; height: 60px; object-fit: cover; border-radius: 4px;" />
                            <span style="font-size: 10.5px; color: #cbd5e1; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; padding: 0 2px;">{{ getExistingName(img, 'Ảnh ' + (idx + 1)) }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Preview ảnh chứng từ lớn -->
                      <div v-if="craftModal.item?.base64Img || craftModal.item?.existingImgUrl" style="border-radius: 6px; overflow: hidden; border: 1px solid #1e293b; background: #080d16; padding: 6px; text-align: center; margin-top: 2px;">
                        <img :src="craftModal.item?.base64Img ? ('data:image/jpeg;base64,' + craftModal.item.base64Img) : craftModal.item.existingImgUrl" style="max-height: 380px; max-width: 100%; object-fit: contain; border-radius: 4px;" />
                      </div>
                    </div>

                    <!-- 2. Card File Báo Giá -->
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s;" onmouseover="this.style.borderColor='#334155'" onmouseout="this.style.borderColor='#1e293b'">
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <!-- Icon box -->
                        <div @click="craftFileInputBG?.click()" style="cursor: pointer; flex-shrink: 0; width: 42px; height: 42px; border-radius: 6px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); display: flex; align-items: center; justify-content: center; transition: border-color 0.2s;" title="Chọn file Báo giá">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                        </div>

                        <!-- Info -->
                        <div style="flex: 1; min-width: 0;">
                          <div style="font-size: 13px; font-weight: 600; color: #f1f5f9; line-height: 1.2;">File Báo giá</div>
                          <div style="margin-top: 3px;">
                            <div v-if="craftModal.item?.tenFileBG" style="display: flex; align-items: center; gap: 5px;">
                              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981; flex-shrink: 0;"></span>
                              <span style="color: #38bdf8; font-size: 12px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ craftModal.item.tenFileBG }}</span>
                            </div>
                            <span v-else style="font-size: 11.5px; color: #64748b;">Chưa đính kèm file</span>
                          </div>
                        </div>

                        <!-- Actions -->
                        <div style="display: flex; gap: 6px; flex-shrink: 0;">
                          <a v-if="craftModal.item?.linkBaoGia" :href="getOfficeViewUrl(craftModal.item.linkBaoGia)" target="_blank" style="background: rgba(59,130,246,0.12); color: #38bdf8; border: 1px solid rgba(59,130,246,0.25); border-radius: 6px; padding: 5px 8px; font-size: 11.5px; font-weight: 500; text-decoration: none; display: flex; align-items: center; gap: 4px; transition: all 0.15s;" onmouseover="this.style.background='#3b82f6'; this.style.color='#ffffff'" onmouseout="this.style.background='rgba(59,130,246,0.12)'; this.style.color='#38bdf8'" title="Xem file (Office Online)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </a>
                          <button type="button" @click="toggleExistingPicker('bao_gia')" style="background: #182234; color: #94a3b8; border: 1px solid #27374f; border-radius: 6px; padding: 5px 9px; font-size: 11.5px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s;" onmouseover="this.style.color='#f1f5f9'; this.style.borderColor='#3b82f6'" onmouseout="this.style.color='#94a3b8'; this.style.borderColor='#27374f'" title="Chọn file đã tải lên trong hồ sơ này">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                            Chọn sẵn có ({{ (formData.linkFileBaoGia || []).length }})
                          </button>
                          <button type="button" @click="craftFileInputBG?.click()" style="background: #1e293b; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 5px 10px; font-size: 11.5px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s;" onmouseover="this.style.background='#2563eb'; this.style.borderColor='#3b82f6'; this.style.color='#fff'" onmouseout="this.style.background='#1e293b'; this.style.borderColor='#334155'; this.style.color='#e2e8f0'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            {{ craftModal.item?.tenFileBG ? 'Đổi file' : 'Tải từ máy' }}
                          </button>
                        </div>
                      </div>

                      <!-- Sub-drawer chọn file Báo giá có sẵn -->
                      <div v-if="craftExistingPicker === 'bao_gia'" style="margin-top: 4px; padding: 12px; background: #080d16; border: 1px solid #233044; border-radius: 6px; display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Tài liệu có sẵn trong hồ sơ ({{ (formData.linkFileBaoGia || []).length }})</span>
                          <button type="button" @click="craftExistingPicker = null" style="background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 14px; padding: 2px 4px;" title="Đóng">✕</button>
                        </div>
                        <div v-if="!formData.linkFileBaoGia || !formData.linkFileBaoGia.length" style="color: #64748b; font-size: 11.5px; font-style: italic; padding: 6px 0; text-align: center;">
                          Chưa có file nào được đính kèm ở hồ sơ này.
                        </div>
                        <div v-else style="display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto;">
                          <div v-for="(f, idx) in formData.linkFileBaoGia" :key="'ex-bg-'+idx" @click="selectExistingFileForCraft(f, 'bao_gia')" style="background: #111827; border: 1px solid #1f2937; border-radius: 6px; padding: 7px 10px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 8px; transition: all 0.15s;" onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#172033'" onmouseout="this.style.borderColor='#1f2937'; this.style.background='#111827'">
                            <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
                              <span style="font-size: 9.5px; font-weight: 700; background: rgba(16,185,129,0.15); color: #10b981; padding: 2px 5px; border-radius: 3px; font-family: monospace;">XLS</span>
                              <span style="font-size: 12px; color: #f1f5f9; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ getExistingName(f, 'File ' + (idx + 1)) }}</span>
                            </div>
                            <span style="font-size: 11px; background: #1e293b; color: #38bdf8; padding: 3px 8px; border-radius: 4px; font-weight: 500; flex-shrink: 0;">Chọn</span>
                          </div>
                        </div>
                      </div>

                      <!-- Preview HTML Báo Giá -->
                      <div v-if="craftPreviewHtmlBG" style="border-radius: 6px; overflow: hidden; border: 1px solid #1e293b; margin-top: 4px;">
                        <div style="background: #0c121e; border-bottom: 1px solid #1e293b; padding: 6px 10px; font-size: 11px; color: #94a3b8; display: flex; align-items: center; justify-content: space-between;">
                          <span>Bảng dữ liệu trích xuất</span>
                          <span style="font-family: monospace; font-size: 10px; color: #10b981;">EXCEL PREVIEW</span>
                        </div>
                        <div style="width: 100%; height: 380px; background: #fff; overflow: auto; padding: 12px; color: #334155; font-size: 12px;" v-html="craftPreviewHtmlBG"></div>
                      </div>
                    </div>

                    <!-- 3. Card File Mua Hàng -->
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s;" onmouseover="this.style.borderColor='#334155'" onmouseout="this.style.borderColor='#1e293b'">
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <!-- Icon box -->
                        <div @click="craftFileInputMH?.click()" style="cursor: pointer; flex-shrink: 0; width: 42px; height: 42px; border-radius: 6px; background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2); display: flex; align-items: center; justify-content: center; transition: border-color 0.2s;" title="Chọn file Mua hàng">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        </div>

                        <!-- Info -->
                        <div style="flex: 1; min-width: 0;">
                          <div style="font-size: 13px; font-weight: 600; color: #f1f5f9; line-height: 1.2;">File Mua hàng</div>
                          <div style="margin-top: 3px;">
                            <div v-if="craftModal.item?.tenFileMH" style="display: flex; align-items: center; gap: 5px;">
                              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; flex-shrink: 0;"></span>
                              <span style="color: #38bdf8; font-size: 12px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ craftModal.item.tenFileMH }}</span>
                            </div>
                            <span v-else style="font-size: 11.5px; color: #64748b;">Chưa đính kèm file</span>
                          </div>
                        </div>

                        <!-- Actions -->
                        <div style="display: flex; gap: 6px; flex-shrink: 0;">
                          <a v-if="craftModal.item?.linkMuaHang" :href="getOfficeViewUrl(craftModal.item.linkMuaHang)" target="_blank" style="background: rgba(59,130,246,0.12); color: #38bdf8; border: 1px solid rgba(59,130,246,0.25); border-radius: 6px; padding: 5px 8px; font-size: 11.5px; font-weight: 500; text-decoration: none; display: flex; align-items: center; gap: 4px; transition: all 0.15s;" onmouseover="this.style.background='#3b82f6'; this.style.color='#ffffff'" onmouseout="this.style.background='rgba(59,130,246,0.12)'; this.style.color='#38bdf8'" title="Xem file (Office Online)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </a>
                          <button type="button" @click="toggleExistingPicker('mua_hang')" style="background: #182234; color: #94a3b8; border: 1px solid #27374f; border-radius: 6px; padding: 5px 9px; font-size: 11.5px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s;" onmouseover="this.style.color='#f1f5f9'; this.style.borderColor='#3b82f6'" onmouseout="this.style.color='#94a3b8'; this.style.borderColor='#27374f'" title="Chọn file đã tải lên trong hồ sơ này">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                            Chọn sẵn có ({{ (formData.linkFileBaoGia || []).length }})
                          </button>
                          <button type="button" @click="craftFileInputMH?.click()" style="background: #1e293b; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 5px 10px; font-size: 11.5px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s;" onmouseover="this.style.background='#2563eb'; this.style.borderColor='#3b82f6'; this.style.color='#fff'" onmouseout="this.style.background='#1e293b'; this.style.borderColor='#334155'; this.style.color='#e2e8f0'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            {{ craftModal.item?.tenFileMH ? 'Đổi file' : 'Tải từ máy' }}
                          </button>
                        </div>
                      </div>

                      <!-- Sub-drawer chọn file Mua hàng có sẵn -->
                      <div v-if="craftExistingPicker === 'mua_hang'" style="margin-top: 4px; padding: 12px; background: #080d16; border: 1px solid #233044; border-radius: 6px; display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Tài liệu có sẵn trong hồ sơ ({{ (formData.linkFileBaoGia || []).length }})</span>
                          <button type="button" @click="craftExistingPicker = null" style="background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 14px; padding: 2px 4px;" title="Đóng">✕</button>
                        </div>
                        <div v-if="!formData.linkFileBaoGia || !formData.linkFileBaoGia.length" style="color: #64748b; font-size: 11.5px; font-style: italic; padding: 6px 0; text-align: center;">
                          Chưa có file nào được đính kèm ở hồ sơ này.
                        </div>
                        <div v-else style="display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto;">
                          <div v-for="(f, idx) in formData.linkFileBaoGia" :key="'ex-mh-'+idx" @click="selectExistingFileForCraft(f, 'mua_hang')" style="background: #111827; border: 1px solid #1f2937; border-radius: 6px; padding: 7px 10px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 8px; transition: all 0.15s;" onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#172033'" onmouseout="this.style.borderColor='#1f2937'; this.style.background='#111827'">
                            <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
                              <span style="font-size: 9.5px; font-weight: 700; background: rgba(56,189,248,0.15); color: #38bdf8; padding: 2px 5px; border-radius: 3px; font-family: monospace;">XLS</span>
                              <span style="font-size: 12px; color: #f1f5f9; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ getExistingName(f, 'File ' + (idx + 1)) }}</span>
                            </div>
                            <span style="font-size: 11px; background: #1e293b; color: #38bdf8; padding: 3px 8px; border-radius: 4px; font-weight: 500; flex-shrink: 0;">Chọn</span>
                          </div>
                        </div>
                      </div>

                      <!-- Preview HTML Mua Hàng -->
                      <div v-if="craftPreviewHtmlMH" style="border-radius: 6px; overflow: hidden; border: 1px solid #1e293b; margin-top: 4px;">
                        <div style="background: #0c121e; border-bottom: 1px solid #1e293b; padding: 6px 10px; font-size: 11px; color: #94a3b8; display: flex; align-items: center; justify-content: space-between;">
                          <span>Bảng dữ liệu mua hàng</span>
                          <span style="font-family: monospace; font-size: 10px; color: #38bdf8;">EXCEL PREVIEW</span>
                        </div>
                        <div style="width: 100%; height: 380px; background: #fff; overflow: auto; padding: 12px; color: #334155; font-size: 12px;" v-html="craftPreviewHtmlMH"></div>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- ═══ CỘT PHẢI: THÔNG TIN PO + TÀI CHÍNH ═══ -->
                <div style="flex: 1; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; padding-right: 8px; min-height: 0;">
                  <!-- Thông tin tổng quan PO -->
                  <div style="background: linear-gradient(145deg, rgba(30,41,59,0.7), rgba(15,23,42,0.9)); border: 1px solid rgba(56,189,248,0.2); border-radius: 12px; padding: 20px; box-shadow: inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.3); flex-shrink: 0; position: relative;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #38bdf8, transparent); opacity: 0.5;"></div>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(51,65,85,0.8); padding-bottom: 12px; margin-bottom: 20px;">
                      <h4 style="margin: 0; font-size: 15px; color: #f8fafc; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                        Thông tin tổng quan PO
                      </h4>
                    </div>
                    <!-- PO Fields - Grid 12 cột giống SaleReportFirebase -->
                    <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px;">
                      <!-- Row 1 -->
                      <div class="sr-form-group" style="grid-column: span 2; margin: 0;">
                        <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">PO</label>
                        <input type="text" v-model="craftModal.item.soPO" class="sr-modal-input text-left" style="background: rgba(15,23,42,0.6); border-color: rgba(51,65,85,0.8); transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 2px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(51,65,85,0.8)'; this.style.boxShadow='none'" />
                      </div>
                      <div class="sr-form-group" style="grid-column: span 6; margin: 0;">
                        <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">Content of contract/PO (Tên File)</label>
                        <input type="text" v-model="craftModal.item.content" class="sr-modal-input text-left" style="background: rgba(15,23,42,0.6); border-color: rgba(51,65,85,0.8); color: #38bdf8; transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 2px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(51,65,85,0.8)'; this.style.boxShadow='none'" />
                      </div>
                      <div class="sr-form-group" style="grid-column: span 2; margin: 0;">
                        <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">Product Type</label>
                        <input type="text" v-model="craftModal.item.productType" class="sr-modal-input text-left" style="background: rgba(15,23,42,0.6); border-color: rgba(51,65,85,0.8); transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 2px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(51,65,85,0.8)'; this.style.boxShadow='none'" />
                      </div>
                      <div class="sr-form-group" style="grid-column: span 2; margin: 0;">
                        <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">AM</label>
                        <input type="text" v-model="craftModal.item.am" class="sr-modal-input text-left" style="background: rgba(15,23,42,0.6); border-color: rgba(51,65,85,0.8); transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 2px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(51,65,85,0.8)'; this.style.boxShadow='none'" />
                      </div>

                      <!-- Thanh liên kết & Chọn Khách hàng từ DB (cho MST / Customer / Người nhận) -->
                      <div style="grid-column: span 12; display: flex; flex-direction: column; gap: 8px; padding-top: 8px; border-top: 1px dashed rgba(51,65,85,0.6);">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <!-- Badge trạng thái liên kết DB -->
                            <span v-if="getCraftLinkedCustomer(craftModal.item)" style="display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; color: #34d399; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); padding: 4px 10px; border-radius: 6px;">
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                              Đã liên kết DB: {{ getCraftLinkedCustomer(craftModal.item).ma_khach_hang }} (Mã cố định)
                            </span>
                            <span v-else style="display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; color: #fbbf24; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); padding: 4px 10px; border-radius: 6px;">
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                              Khách mới (Tự tạo vào DB khi lưu)
                            </span>

                            <!-- Nút chuyển đổi nhanh khi tên trong Báo giá khác với DB -->
                            <template v-if="hasCraftCustomerDiffWithQuote(craftModal.item)">
                              <button type="button" @click="applyCraftCustomerSource(craftModal.item, 'db')" style="display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; padding: 4px 9px; border-radius: 6px; cursor: pointer; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35);" title="Điền tên công ty & người nhận chuẩn trong DB">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                                Dùng tên DB
                              </button>
                              <button type="button" @click="applyCraftCustomerSource(craftModal.item, 'quote')" style="display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; padding: 4px 9px; border-radius: 6px; cursor: pointer; background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35);" :title="`Đổi sang tên trong Báo giá: ${craftModal.item.extractedCompany || ''} / ${craftModal.item.extractedRecipient || ''}`">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                Dùng tên Báo giá
                              </button>
                            </template>
                          </div>

                          <!-- Nút mở danh sách chọn KH từ DB -->
                          <div style="position: relative;">
                            <button type="button" @click="toggleCraftCustomerPicker()" style="display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 6px; padding: 5px 12px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s;">
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                              Chọn KH từ DB
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                          </div>
                        </div>

                        <!-- Drawer tìm & chọn Khách hàng từ DB -->
                        <div v-if="craftCustomerPickerOpen" style="background: #0b1120; border: 1px solid #334155; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="position: relative; flex: 1;">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                              <input type="text" v-model="craftCustomerSearchQuery" placeholder="Tìm theo Tên công ty, Người nhận, Mã KH hoặc MST..." class="sr-modal-input text-left" style="width: 100%; padding: 6px 10px 6px 32px; font-size: 12px; background: #1e293b; border-color: #334155;" />
                            </div>
                            <button type="button" @click="craftCustomerPickerOpen = false" style="background: transparent; border: 1px solid #334155; color: #94a3b8; border-radius: 6px; padding: 5px 10px; font-size: 11px; cursor: pointer;">Đóng</button>
                          </div>
                          <div style="max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;" class="custom-scrollbar">
                            <div
                              v-for="c in filteredCraftCustomers"
                              :key="c.id || c.ma_khach_hang"
                              @click="selectCustomerForCraftItem(c)"
                              style="padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(51,65,85,0.6); background: rgba(15,23,42,0.8); cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: all 0.15s;"
                              onmouseover="this.style.borderColor='#10b981'; this.style.background='rgba(16,185,129,0.08)'"
                              onmouseout="this.style.borderColor='rgba(51,65,85,0.6)'; this.style.background='rgba(15,23,42,0.8)'"
                            >
                              <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                <div style="font-size: 12.5px; font-weight: 700; color: #10b981; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                  {{ c.ten_cong_ty || c.ten_khach_hang || c.ma_khach_hang }}
                                </div>
                                <div style="font-size: 11px; color: #94a3b8; display: flex; gap: 10px; flex-wrap: wrap;">
                                  <span>Người nhận: <strong style="color: #e2e8f0;">{{ c.ten_khach_hang || '—' }}</strong></span>
                                  <span>MST: <strong style="color: #cbd5e1; font-family: monospace;">{{ c.mst || '—' }}</strong></span>
                                  <span>Mã KH: <strong style="color: #38bdf8; font-family: monospace;">{{ c.ma_khach_hang }}</strong></span>
                                </div>
                              </div>
                              <span style="font-size: 11px; font-weight: 700; color: #34d399; background: rgba(16,185,129,0.15); padding: 3px 8px; border-radius: 4px; flex-shrink: 0;">Chọn</span>
                            </div>
                            <div v-if="filteredCraftCustomers.length === 0" style="padding: 12px; text-align: center; color: #64748b; font-size: 12px;">
                              Không tìm thấy khách hàng phù hợp trong DB.
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Row 2 -->
                      <div class="sr-form-group" style="grid-column: span 2; margin: 0;">
                        <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">MST</label>
                        <input type="text" v-model="craftModal.item.mst" @blur="checkAndOpenCustomerMismatchPopup" class="sr-modal-input text-left" style="background: rgba(15,23,42,0.6); border-color: rgba(51,65,85,0.8); font-family: monospace; transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 2px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(51,65,85,0.8)'; this.style.boxShadow='none'" />
                      </div>
                      <div class="sr-form-group" style="grid-column: span 6; margin: 0;">
                        <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">Customer (Tên công ty)</label>
                        <input type="text" v-model="craftModal.item.customer" @blur="checkAndOpenCustomerMismatchPopup" class="sr-modal-input text-left" style="background: rgba(15,23,42,0.6); border-color: rgba(51,65,85,0.8); transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 2px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(51,65,85,0.8)'; this.style.boxShadow='none'" />
                      </div>
                      <div class="sr-form-group" style="grid-column: span 4; margin: 0;">
                        <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">Người nhận (Tên KH)</label>
                        <input type="text" v-model="craftModal.item.recipient" @blur="checkAndOpenCustomerMismatchPopup" class="sr-modal-input text-left" style="background: rgba(15,23,42,0.6); border-color: rgba(51,65,85,0.8); transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 2px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(51,65,85,0.8)'; this.style.boxShadow='none'" />
                      </div>
                    </div>
                  </div>

                  <!-- CHỈ SỐ TÀI CHÍNH (3 cột giống SaleReportFirebase) -->
                  <div style="background: rgba(15,23,42,.4); border: 1px solid #1e293b; border-radius: 8px; flex-shrink: 0; display: flex; flex-direction: column; overflow: hidden; margin-top: 8px;">
                    <div style="display: flex; border-bottom: 1px solid #1e293b; background: rgba(30,41,59,.5);">
                      <button @click="craftModal.item.activeTab = 'metrics'" :style="{ padding: '12px 24px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: craftModal.item?.activeTab !== 'goods' ? '#10b981' : '#94a3b8', borderBottom: craftModal.item?.activeTab !== 'goods' ? '2px solid #10b981' : '2px solid transparent', background: 'transparent', cursor: 'pointer', transition: 'all .2s', flex: 1, borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none' }">Chỉ số tài chính</button>
                      <button v-if="craftModal.item?.goodsList && craftModal.item.goodsList.length > 0" @click="craftModal.item.activeTab = 'goods'" :style="{ padding: '12px 24px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: craftModal.item?.activeTab === 'goods' ? '#38bdf8' : '#94a3b8', borderBottom: craftModal.item?.activeTab === 'goods' ? '2px solid #38bdf8' : '2px solid transparent', background: 'transparent', cursor: 'pointer', transition: 'all .2s', flex: 1, borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none' }">Bảng Hàng Hóa</button>
                    </div>
                    <div style="padding: 16px;">
                      <!-- FINANCIAL FIELDS TAB -->
                      <div v-show="craftModal.item?.activeTab !== 'goods'">
                        <div class="sr-modal-finance-grid" style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 16px;">
                          <!-- Cột 1: DSB, Giá mua, Tổng CP -->
                          <div class="sr-modal-fin-col">
                            <div class="sr-form-group" style="margin: 0;">
                              <label class="sr-modal-label" style="color: #ffffff; font-weight: 700; margin-bottom: 6px; display: block;">Doanh số bán</label>
                              <input type="text" :value="craftFmtInput(craftModal.item?.doanhSoBan)" @input="e => formatCraftNumberInput(e, 'doanhSoBan')" class="sr-modal-input text-right" style="padding: 6px 10px;" />
                            </div>
                            <div class="sr-form-group" style="margin: 0;">
                              <label class="sr-modal-label" style="color: #ffffff; font-weight: 700; margin-bottom: 6px; display: block;">Giá mua</label>
                              <input type="text" :value="craftFmtInput(craftModal.item?.giaMua)" @input="e => formatCraftNumberInput(e, 'giaMua')" class="sr-modal-input text-right" style="padding: 6px 10px;" />
                            </div>
                            <div class="sr-form-group" style="margin: 0;">
                              <label class="sr-modal-label" style="color: #ffffff; font-weight: 700; margin-bottom: 6px; display: block;">Tổng CP đơn hàng</label>
                              <input type="text" :value="craftFmtInput(craftModal.item?.tongCP)" @input="e => formatCraftNumberInput(e, 'tongCP')" class="sr-modal-input text-right" style="padding: 6px 10px;" />
                            </div>
                          </div>
                          <!-- Cột 2: Net COM, Gross COM, Thuế, Net PO, Net Margin -->
                          <div class="sr-modal-fin-col">
                            <div class="sr-form-group" style="margin: 0;">
                              <label class="sr-modal-label" style="color: #ffffff; font-weight: 700; margin-bottom: 6px; display: block;">Net COM</label>
                              <input type="text" :value="craftFmtInput(craftModal.item?.netCom)" @input="e => formatCraftNumberInput(e, 'netCom')" class="sr-modal-input text-right" style="color: #34d399; font-weight: 700; padding: 6px 10px; border-color: rgba(16,185,129,.3); background: rgba(16,185,129,.08);" />
                            </div>
                            <div class="sr-form-group" style="margin: 0;">
                              <label class="sr-modal-label" style="color: #ffffff; font-weight: 700; margin-bottom: 6px; display: block;">Gross com</label>
                              <input type="text" :value="craftFmtInput(craftModal.item?.grossCom)" @input="e => formatCraftNumberInput(e, 'grossCom')" class="sr-modal-input text-right" style="padding: 6px 10px;" />
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; gap: 8px;">
                              <span style="font-size: 13px; color: #ffffff; font-weight: 700; white-space: nowrap;">Thuế</span>
                              <input type="number" v-model.number="craftModal.item.taxPct" @input="onCraftFinancialInput('taxPct')" class="sr-modal-input text-right" style="border-color:#38bdf8; background:rgba(56,189,248,.06); padding: 4px 8px; width: 60px; flex-shrink: 0; font-size: 13px;" />
                              <span style="font-size: 13px; color: #94a3b8;">%</span>
                              <strong style="color: #cbd5e1; font-size: 14px; margin-left: auto; white-space: nowrap;">{{ craftFmt((craftModal.item?.grossCom||0) * ((craftModal.item?.taxPct||0) / 100)) }}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                              <span style="font-size: 13px; color: #ffffff; font-weight: 700;">Net PO</span>
                              <strong style="color: #f8fafc; font-size: 14px;">{{ craftFmt((craftModal.item?.doanhSoBan||0) - (craftModal.item?.grossCom||0)) }}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0 0 0; border-top: 1px dashed #334155; margin-top: 6px;">
                              <span style="font-size: 13px; color: #ffffff; font-weight: 700;">Net Margin</span>
                              <strong style="font-size: 14px;" :style="{color: ((craftModal.item?.doanhSoBan||0)-(craftModal.item?.grossCom||0)-(craftModal.item?.tongCP||0)) >= 0 ? '#22c55e' : '#ef4444'}">{{ craftFmt((craftModal.item?.doanhSoBan||0)-(craftModal.item?.grossCom||0)-(craftModal.item?.tongCP||0)) }}</strong>
                            </div>
                          </div>
                          <!-- Cột 3: Ratios + Predict -->
                          <div class="sr-modal-fin-col highlight-col">
                            <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                              <span style="font-size: 12px; color: #ffffff; font-weight: 700;">Net COM / Net PO</span>
                              <strong style="font-size: 13px; color: #22c55e;">{{ ((craftModal.item?.doanhSoBan||0)-(craftModal.item?.grossCom||0)) !== 0 ? (((craftModal.item?.netCom||0)/((craftModal.item?.doanhSoBan||0)-(craftModal.item?.grossCom||0)))*100).toFixed(2)+'%' : '0%' }}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                              <span style="font-size: 12px; color: #ffffff; font-weight: 700;">Net Margin / Net PO</span>
                              <strong style="font-size: 13px;" :style="{color: ((craftModal.item?.doanhSoBan||0)-(craftModal.item?.grossCom||0)) !== 0 && ((craftModal.item?.doanhSoBan||0)-(craftModal.item?.grossCom||0)-(craftModal.item?.tongCP||0))/((craftModal.item?.doanhSoBan||0)-(craftModal.item?.grossCom||0)) >= 0 ? '#22c55e' : '#ef4444'}">{{ ((craftModal.item?.doanhSoBan||0)-(craftModal.item?.grossCom||0)) !== 0 ? ((((craftModal.item?.doanhSoBan||0)-(craftModal.item?.grossCom||0)-(craftModal.item?.tongCP||0))/((craftModal.item?.doanhSoBan||0)-(craftModal.item?.grossCom||0)))*100).toFixed(2)+'%' : '0%' }}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-top: 1px solid rgba(16,185,129,.15); margin-top: 4px; padding-top: 8px;">
                              <span style="font-size: 12px; color: #ffffff; font-weight: 700;">Net COM / DSB</span>
                              <strong style="font-size: 13px; color: #22c55e;">{{ (craftModal.item?.doanhSoBan||0) !== 0 ? (((craftModal.item?.netCom||0)/(craftModal.item?.doanhSoBan||0))*100).toFixed(2)+'%' : '0%' }}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                              <span style="font-size: 12px; color: #ffffff; font-weight: 700;">Net Margin / DSB</span>
                              <strong style="font-size: 13px;" :style="{color: (craftModal.item?.doanhSoBan||0) !== 0 && ((craftModal.item?.doanhSoBan||0)-(craftModal.item?.grossCom||0)-(craftModal.item?.tongCP||0))/(craftModal.item?.doanhSoBan||0) >= 0 ? '#22c55e' : '#ef4444'}">{{ (craftModal.item?.doanhSoBan||0) !== 0 ? ((((craftModal.item?.doanhSoBan||0)-(craftModal.item?.grossCom||0)-(craftModal.item?.tongCP||0))/(craftModal.item?.doanhSoBan||0))*100).toFixed(2)+'%' : '0%' }}</strong>
                            </div>
                            <!-- Dự đoán Net Margin / DSB -->
                            <div style="margin-top: auto; padding: 10px; background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.2); border-radius: 6px;">
                              <label class="sr-modal-label" style="color: #fbbf24; display: flex; align-items: center; gap: 4px; margin-bottom: 6px; font-size: 11px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                                Dự đoán Net Margin / DSB
                              </label>
                              <div style="display: flex; gap: 6px; align-items: center;">
                                <input type="number" placeholder="Nhập %..." v-model="craftModal.item.predictPct" @input="onCraftPredictInput()" class="sr-modal-input text-right" style="border-color: rgba(245,158,11,.3); flex: 1; padding: 4px 8px; font-size: 13px; background: rgba(15,23,42,.8);" />
                                <span style="color: #fbbf24; font-weight: 600; font-size: 13px;">%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- GOODS TABLE TAB -->
                      <div v-show="craftModal.item?.activeTab === 'goods'" style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #e2e8f0; min-width: 800px;">
                          <thead><tr style="background: rgba(15,23,42,.8); border-bottom: 1px solid #334155; text-align: left;"><th style="padding: 8px;">STT</th><th style="padding: 8px;">TÊN HÀNG HÓA</th><th style="padding: 8px;">DVT</th><th style="padding: 8px; text-align: center;">S.L</th><th style="padding: 8px; text-align: right;">ĐƠN GIÁ</th><th style="padding: 8px; text-align: right;">THÀNH TIỀN</th><th style="padding: 8px; text-align: center; width: 40px;"></th></tr></thead>
                          <tbody>
                            <tr v-for="(g, gi) in craftModal.item?.goodsList" :key="gi" style="border-bottom: 1px dashed #1e293b;">
                              <td style="padding: 10px 8px;">{{ gi + 1 }}</td>
                              <td style="padding: 10px 8px;"><textarea v-model="g.ten" @input="onCraftGoodsInput(craftModal.item)" class="sr-modal-input" style="width: 100%; min-width: 150px; padding: 8px; border-color: #334155; font-size: 13px; min-height: 50px; background: rgba(15,23,42,.6); color: #f8fafc; font-weight: 600; resize: vertical; text-align: left;" rows="2"></textarea></td>
                              <td style="padding: 10px 8px;"><input v-model="g.dvt" class="sr-modal-input" style="width: 50px; padding: 6px 4px; border-color: #334155; font-size: 12px; background: rgba(15,23,42,.6); text-align: center;" /></td>
                              <td style="padding: 10px 8px; text-align: center;"><input type="number" v-model.number="g.sl" @input="onCraftGoodsInput(craftModal.item)" class="sr-modal-input text-center" style="width: 50px; padding: 6px 4px; border-color: #334155; font-size: 12px; height: 32px; background: rgba(15,23,42,.6);" /></td>
                              <td style="padding: 10px 8px; text-align: right;"><input type="number" v-model.number="g.donGia" @input="onCraftGoodsInput(craftModal.item)" class="sr-modal-input text-right" style="width: 110px; padding: 6px 4px; border-color: #334155; color: #fbbf24; font-size: 12px; height: 32px; background: rgba(15,23,42,.6);" /></td>
                              <td style="padding: 10px 8px; text-align: right; color: #22c55e; font-weight: 600;">{{ craftFmt((g.sl||0) * (g.donGia||0)) }}</td>
                              <td style="padding: 10px 8px; text-align: center;"><button @click="removeCraftGoodsRow(gi)" type="button" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">✕</button></td>
                            </tr>
                            <tr v-if="craftModal.item?.goodsTotal" style="background: rgba(16,185,129,.1); font-weight: 700; color: #22c55e;">
                              <td style="padding: 10px 8px;"></td>
                              <td colspan="4" style="padding: 10px 8px; text-transform: uppercase;">Tổng Cộng</td>
                              <td style="padding: 10px 8px; text-align: right;">{{ craftFmt(craftModal.item.goodsTotal.ttTruoc) }}</td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- FOOTER (giống SaleReportFirebase) -->
            <div class="sr-import-card-footer" style="padding: 16px 24px; border-top: 1px solid #1e293b; display: flex; align-items: center; background: rgba(15,23,42,.6); border-radius: 0 0 16px 16px;">
              <div style="flex: 1; text-align: left;">
                <button v-if="!craftModal.item?.chotDeal" @click="chotDeal()" :disabled="isChotDealLoading || isCraftSaving" class="sr-btn" style="padding: 8px 16px; font-size: 13px; background: linear-gradient(135deg,#f59e0b,#d97706); color: white; border: none; border-radius: 8px; font-weight: 700; box-shadow: 0 4px 12px rgba(245,158,11,.3); display: inline-flex; align-items: center; gap: 6px;">
                  <svg v-if="!isChotDealLoading" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span>{{ isChotDealLoading ? 'Đang chốt...' : `Chốt Deal (Tab #${(craftModal.activeIndex || 0) + 1})` }}</span>
                </button>
                <span v-else style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; font-size: 12px; font-weight: 700; color: #10b981; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Đã chốt Deal (Tab #{{ (craftModal.activeIndex || 0) + 1 }})
                </span>
              </div>
              <div style="flex: 1; text-align: center; display: flex; justify-content: center;">
                <button v-if="!isCraftAllSaved" class="sr-btn sr-btn-save" @click="saveCraftToFirebase()" :disabled="isCraftSaving" style="padding: 12px 48px; font-size: 15px; font-weight: bold; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 8px; transition: all 0.2s;">
                  <svg v-if="!isCraftSaving" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  <span>{{ isCraftSaving ? 'Đang lưu...' : 'LƯU TẠM' }}</span>
                </button>
                <button v-else type="button" disabled class="sr-btn" style="padding: 12px 48px; font-size: 15px; font-weight: bold; background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 8px; min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 8px; cursor: default;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>ĐÃ LƯU TẠM</span>
                </button>
              </div>
              <div style="flex: 1; text-align: right;">
                <button class="sr-btn sr-btn-cancel" @click="closeCraftModal()" style="padding: 8px 16px; font-size: 13px; background: rgba(100,116,139,.1); color: #cbd5e1; border: 1px solid rgba(100,116,139,.3); border-radius: 6px;">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Craft Scan Confirm Modal (Taste-Skill Precision & Double-Bezel Design) -->
      <Transition name="taste-modal">
        <div v-if="craftScanConfirmModal.show" class="taste-modal-overlay" style="z-index: 100005;" @click.self="closeCraftScanConfirmModal" role="dialog" aria-modal="true">
          <div class="taste-modal-shell taste-variant-info" style="width: 520px; max-width: 95vw;">
            <div class="taste-modal-glow" aria-hidden="true" style="background: #38bdf8;"></div>
            <div class="taste-modal-core">
              <button type="button" class="taste-modal-close" @click="closeCraftScanConfirmModal" title="Đóng (Esc)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <div class="taste-modal-body" style="align-items: flex-start;">
                <div class="taste-jewel-wrap">
                  <div class="taste-jewel-box" style="background: radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(56, 189, 248, 0.05) 100%); border: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 0 24px rgba(56, 189, 248, 0.25);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                </div>

                <div class="taste-modal-text" style="width: 100%;">
                  <div class="taste-eyebrow" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
                    <span class="taste-eyebrow-dot" style="background: #38bdf8;"></span>
                    <span>OCR SMART SCAN</span>
                  </div>
                  <h3 class="taste-title">Kết Quả Nhận Diện Ảnh</h3>
                  <div class="taste-message" style="margin-bottom: 12px;">Kiểm tra và hiệu chỉnh các chỉ số tài chính được quét từ chứng từ:</div>

                  <div v-if="craftScanConfirmModal.imageUrl" style="text-align: center; margin-bottom: 1rem; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: #000; max-height: 180px; display: flex; align-items: center; justify-content: center;">
                    <img :src="craftScanConfirmModal.imageUrl" style="max-height: 180px; max-width: 100%; object-fit: contain;" />
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div style="grid-column: span 2; background: rgba(15,23,42,0.6); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                      <label style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 6px;">Nâng giá (Gross COM)</label>
                      <input type="number" v-model.number="craftScanConfirmModal.nangGia" style="width: 100%; background: #0b1120; color: #34d399; border: 1px solid rgba(52,211,153,0.3); padding: 8px 12px; border-radius: 8px; font-size: 15px; font-weight: 700; font-family: 'JetBrains Mono', monospace; box-sizing: border-box; outline: none;" />
                    </div>
                    <div style="background: rgba(15,23,42,0.6); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                      <label style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 6px;">Thuế (%)</label>
                      <input type="number" v-model.number="craftScanConfirmModal.thuePct" style="width: 100%; background: #0b1120; color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); padding: 8px 12px; border-radius: 8px; font-size: 15px; font-weight: 700; font-family: 'JetBrains Mono', monospace; box-sizing: border-box; outline: none;" />
                    </div>
                    <div style="background: rgba(15,23,42,0.6); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                      <label style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 6px;">Còn lại (Net COM)</label>
                      <input type="number" v-model.number="craftScanConfirmModal.conLai" style="width: 100%; background: #0b1120; color: #a78bfa; border: 1px solid rgba(167,139,250,0.3); padding: 8px 12px; border-radius: 8px; font-size: 15px; font-weight: 700; font-family: 'JetBrains Mono', monospace; box-sizing: border-box; outline: none;" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="taste-modal-actions">
                <button type="button" @click="closeCraftScanConfirmModal" class="taste-btn taste-btn-secondary">Hủy bỏ</button>
                <button type="button" @click="confirmCraftScanResult" class="taste-btn taste-btn-primary taste-btn-success">
                  <span>Áp Dụng Chỉ Số</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- BATCH EXPORT MODAL -->
    <Teleport to="body">
      <div v-if="isBatchExportModalOpen" class="batch-export-overlay" @click.self="closeBatchExportModal">
        <div class="batch-export-modal" role="dialog" aria-modal="true">
          <!-- HEADER -->
          <div class="batch-modal-header">
            <div class="batch-header-title">
              <div class="batch-title-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #f8fafc; letter-spacing: -0.3px;">Xuất File &amp; Hình Ảnh Hàng Loạt (.ZIP)</h3>
                <p style="margin: 2px 0 0; font-size: 13px; color: #94a3b8;">Lọc theo thời gian, khách hàng và chọn các ID hồ sơ cần tải về máy</p>
              </div>
            </div>
            <button class="batch-close-btn" @click="closeBatchExportModal" :disabled="isBatchDownloading" title="Đóng">✕</button>
          </div>

          <!-- BODY -->
          <div class="batch-modal-body">
            <!-- FILTER PANEL -->
            <div class="batch-filter-box">
              <div class="batch-filter-row">
                <!-- Khoảng thời gian -->
                <div class="batch-filter-group" style="flex: 2; min-width: 280px;">
                  <label class="batch-filter-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Khoảng thời gian tạo hồ sơ
                  </label>
                  <div class="batch-date-inputs">
                    <input type="date" v-model="batchFilterDateFrom" class="batch-input" />
                    <span style="color: #64748b; font-weight: 700;">→</span>
                    <input type="date" v-model="batchFilterDateTo" class="batch-input" />
                  </div>
                  <div class="batch-quick-dates">
                    <button type="button" @click="setBatchShortcut('today')" :class="{ active: batchActiveShortcut === 'today' }">Hôm nay</button>
                    <button type="button" @click="setBatchShortcut('this_week')" :class="{ active: batchActiveShortcut === 'this_week' }">Tuần này</button>
                    <button type="button" @click="setBatchShortcut('this_month')" :class="{ active: batchActiveShortcut === 'this_month' }">Tháng này</button>
                    <button type="button" @click="setBatchShortcut('this_year')" :class="{ active: batchActiveShortcut === 'this_year' }">Năm nay</button>
                    <button type="button" @click="setBatchShortcut('all')" :class="{ active: batchActiveShortcut === 'all' }">Tất cả</button>
                  </div>
                </div>

                <!-- Khách hàng -->
                <div class="batch-filter-group" style="flex: 1.5; min-width: 220px;">
                  <label class="batch-filter-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Lọc theo Khách hàng
                  </label>
                  <select v-model="batchFilterCustomer" class="batch-input">
                    <option value="">-- Tất cả khách hàng --</option>
                    <option v-for="c in customers" :key="c.ma_khach_hang" :value="c.ma_khach_hang">
                      {{ c.ten_khach_hang || c.ma_khach_hang }} {{ c.ten_cong_ty ? `(${c.ten_cong_ty})` : '' }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="batch-filter-row" style="margin-top: 10px; align-items: center;">
                <!-- Tìm kiếm nhanh -->
                <div class="batch-filter-group" style="flex: 2;">
                  <div style="position: relative;">
                    <input 
                      type="text" 
                      v-model="batchFilterSearch" 
                      placeholder="Tìm kiếm theo mã ID, tên khách, nội dung, ghi chú..." 
                      class="batch-input" 
                      style="padding-left: 36px; width: 100%; box-sizing: border-box;"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 11px; top: 50%; transform: translateY(-50%);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                </div>

                <!-- Tùy chọn chỉ hiện có file -->
                <div class="batch-filter-group" style="flex: 1.2; display: flex; align-items: center; justify-content: flex-end;">
                  <label class="batch-checkbox-label">
                    <input type="checkbox" v-model="batchFilterOnlyHasFiles" />
                    <span>Chỉ hiện hồ sơ có File hoặc Ảnh</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- TABLE CONTROLS & STATS BAR -->
            <div class="batch-table-toolbar">
              <div class="batch-select-actions">
                <button type="button" @click="selectAllBatchCards" class="batch-btn-secondary">
                  ☑ Chọn tất cả ({{ batchFilteredCards.length }})
                </button>
                <button type="button" @click="deselectAllBatchCards" class="batch-btn-secondary">
                  ☐ Bỏ chọn
                </button>
              </div>

              <div class="batch-selection-badge">
                <span>Đã chọn:</span>
                <strong style="color: #38bdf8;">{{ selectedCardIds.length }}</strong>
                <span>/ {{ batchFilteredCards.length }} hồ sơ</span>
                <span style="color: #64748b;">•</span>
                <span style="color: #10b981; font-weight: 600;">{{ totalSelectedAttachments.files }} file tài liệu</span>
                <span style="color: #64748b;">+</span>
                <span style="color: #a78bfa; font-weight: 600;">{{ totalSelectedAttachments.images }} hình ảnh</span>
              </div>
            </div>

            <!-- TABLE OF CARDS -->
            <div class="batch-table-wrapper">
              <table class="batch-table">
                <thead>
                  <tr>
                    <th style="width: 44px; text-align: center;">
                      <input 
                        type="checkbox" 
                        :checked="isAllBatchSelected" 
                        @change="toggleSelectAll" 
                        title="Chọn/Bỏ chọn tất cả"
                      />
                    </th>
                    <th style="width: 100px;">Mã ID</th>
                    <th style="width: 210px;">Khách Hàng</th>
                    <th>Nội dung / Ghi chú</th>
                    <th style="width: 105px; text-align: center;">Ngày tạo</th>
                    <th style="width: 190px; text-align: center;">Tệp đính kèm</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="batchFilteredCards.length === 0">
                    <td colspan="6" style="text-align: center; padding: 36px; color: #94a3b8;">
                      <div style="font-size: 28px; margin-bottom: 8px;">📂</div>
                      <div>Không tìm thấy hồ sơ nào phù hợp với bộ lọc hiện tại.</div>
                    </td>
                  </tr>
                  <tr 
                    v-for="card in batchFilteredCards" 
                    :key="card.id" 
                    :class="{ 'row-selected': isCardSelected(card.id) }"
                    @click="toggleCardSelection(card.id)"
                    class="batch-table-row"
                  >
                    <td style="text-align: center;" @click.stop>
                      <input 
                        type="checkbox" 
                        :checked="isCardSelected(card.id)" 
                        @change="toggleCardSelection(card.id)"
                      />
                    </td>
                    <td>
                      <span class="batch-id-tag">{{ card.id }}</span>
                    </td>
                    <td>
                      <div class="batch-customer-cell">
                        <strong style="color: #f1f5f9;">{{ getCustomerNameInfo(card.maKH) || card.tenKH || 'Khách hàng' }}</strong>
                        <span v-if="card.maKH" style="color: #64748b; font-size: 11px;">Mã: {{ card.maKH }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="batch-content-cell">
                        <div class="batch-content-main">{{ card.noiDung || '(Không có nội dung)' }}</div>
                        <div v-if="card.ghiChu" class="batch-content-note">📝 {{ card.ghiChu }}</div>
                      </div>
                    </td>
                    <td style="text-align: center;">
                      <span style="color: #94a3b8; font-size: 12px;">{{ formatCardDate(card.createdTime) }}</span>
                    </td>
                    <td style="text-align: center;">
                      <div class="batch-badge-group">
                        <span v-if="getCardFilesCount(card) > 0" class="batch-badge-file">
                          📄 {{ getCardFilesCount(card) }} file
                        </span>
                        <span v-if="getCardImagesCount(card) > 0" class="batch-badge-img">
                          🖼️ {{ getCardImagesCount(card) }} ảnh
                        </span>
                        <span v-if="getCardAttachmentCount(card) === 0" class="batch-badge-empty">
                          Trống
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- PROGRESS BAR PANEL (HIỂN THỊ KHI ĐANG TẢI) -->
            <div v-if="isBatchDownloading" class="batch-progress-overlay">
              <div class="batch-progress-card">
                <div class="batch-progress-header">
                  <div class="batch-spinner"></div>
                  <div>
                    <h4 style="margin: 0; color: #f8fafc; font-size: 16px; font-weight: 700;">Đang đóng gói file ZIP...</h4>
                    <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">{{ batchProgress.message }}</p>
                  </div>
                </div>

                <div class="batch-progress-track">
                  <div class="batch-progress-fill" :style="{ width: batchProgress.percent + '%' }"></div>
                </div>

                <div class="batch-progress-stats">
                  <span>Tiến trình: <strong style="color: #38bdf8;">{{ batchProgress.percent }}%</strong></span>
                  <span>Hồ sơ: <strong>{{ batchProgress.currentCard }}/{{ batchProgress.totalCards }}</strong></span>
                  <span>File: <strong>{{ batchProgress.currentFile }}/{{ batchProgress.totalFiles }}</strong></span>
                </div>

                <div style="text-align: right; margin-top: 14px;">
                  <button type="button" @click="cancelBatchDownload" class="batch-btn-cancel">
                    ✕ Hủy bỏ
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="batch-modal-footer">
            <div class="batch-footer-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span>Cấu trúc lưu: <strong>Export file [Ngày] &gt; Từng Khách hàng &gt; Nội dung (Ghi chú) &gt; File + Ảnh</strong></span>
            </div>
            <div class="batch-footer-buttons">
              <button type="button" @click="closeBatchExportModal" :disabled="isBatchDownloading" class="batch-btn-secondary" style="padding: 10px 20px;">
                Đóng
              </button>
              <button 
                type="button" 
                @click="handleStartBatchExport" 
                :disabled="isBatchDownloading || selectedCardIds.length === 0" 
                class="batch-btn-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Tải Về {{ selectedCardIds.length }} Hồ Sơ (.ZIP)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══ JSON EXPORT MODAL (XUẤT DỮ LIỆU TÀI CHÍNH & HÀNG HÓA - DẠNG SO SÁNH) ═══ -->
    <Teleport to="body">
      <div v-if="isJsonExportModalOpen" class="batch-export-overlay" @click.self="closeJsonExportModal">
        <div class="batch-export-modal json-export-modal" role="dialog" aria-modal="true" style="max-width: 1080px;">
          <!-- HEADER -->
          <div class="batch-modal-header" style="background: linear-gradient(135deg, #090d16, #0f172a); border-bottom: 1px solid rgba(16, 185, 129, 0.25);">
            <div class="batch-header-title">
              <div class="batch-title-icon" style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #f8fafc; letter-spacing: -0.3px;">
                  Download File JSON (Dữ Liệu Tài Chính &amp; Hàng Hóa)
                </h3>
                <p style="margin: 3px 0 0; font-size: 13px; color: #94a3b8;">
                  Tùy chọn xuất dữ liệu theo <strong style="color: #a78bfa;">Chuỗi Card Liên Kết</strong>, <strong style="color: #34d399;">Chọn Từng Card</strong>, <strong style="color: #38bdf8;">Từng Khách Hàng</strong> hoặc <strong style="color: #fbbf24;">Toàn Bộ</strong>
                </p>
              </div>
            </div>
            <button class="batch-close-btn" @click="closeJsonExportModal" :disabled="isExportingJson" title="Đóng">✕</button>
          </div>

          <!-- BODY -->
          <div class="batch-modal-body" style="gap: 14px;">
            <!-- TABS CHỌN CHẾ ĐỘ XUẤT: TOÀN BỘ | CHUỖI LIÊN KẾT | THEO TỪNG CARD | THEO KHÁCH HÀNG -->
            <div class="json-scope-tabs" style="grid-template-columns: repeat(4, 1fr);">
              <button type="button"
                      class="json-scope-tab"
                      :class="{ active: jsonExportScope === 'chain' }"
                      @click="jsonExportScope = 'chain'">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                <span>Chuỗi Liên Kết ({{ jsonFilteredChains.length }} chuỗi)</span>
              </button>
              <button type="button"
                      class="json-scope-tab"
                      :class="{ active: jsonExportScope === 'card' }"
                      @click="jsonExportScope = 'card'">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="7" y1="8" x2="17" y2="8"></line><line x1="7" y1="12" x2="13" y2="12"></line></svg>
                <span>Chọn Card ({{ jsonSelectedCardIds.length }}/{{ jsonFilteredCards.length }})</span>
              </button>
              <button type="button"
                      class="json-scope-tab"
                      :class="{ active: jsonExportScope === 'customer' }"
                      @click="jsonExportScope = 'customer'">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>Theo Khách Hàng ({{ jsonSelectedCustomerIds.length }}/{{ jsonFilteredCustomers.length }})</span>
              </button>
              <button type="button"
                      class="json-scope-tab"
                      :class="{ active: jsonExportScope === 'all' }"
                      @click="jsonExportScope = 'all'">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>Toàn Bộ ({{ jsonAllSummary.totalCustomers }} KH · {{ jsonAllSummary.totalCards }} Card)</span>
              </button>
            </div>

            <!-- ═══ TAB MỚI: THEO CHUỖI CARD LIÊN KẾT (TẢI CẢ CHUỖI HOẶC CHỌN CARD TRONG CHUỖI) ═══ -->
            <template v-if="jsonExportScope === 'chain'">
              <div class="batch-filter-box" style="background: #0d131f; border-color: rgba(255,255,255,0.08); padding: 12px 16px;">
                <div class="batch-filter-row" style="align-items: center;">
                  <div style="flex: 1.8; position: relative; min-width: 220px;">
                    <input
                      type="text"
                      v-model="jsonChainSearch"
                      placeholder="Tìm chuỗi theo nội dung card, số PO, số HĐ, khách hàng..."
                      class="batch-input"
                      style="padding-left: 36px; width: 100%; box-sizing: border-box;"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 11px; top: 50%; transform: translateY(-50%);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>

                  <div style="flex: 1.2; min-width: 190px;">
                    <select v-model="jsonCardCustomerFilter" class="batch-input" style="width: 100%;">
                      <option value="">-- Tất cả khách hàng --</option>
                      <option v-for="c in customers" :key="c.ma_khach_hang" :value="c.ma_khach_hang">
                        {{ c.ten_khach_hang || c.ma_khach_hang }} {{ c.ten_cong_ty ? `(${c.ten_cong_ty})` : '' }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="batch-filter-row" style="margin-top: 10px; align-items: center; justify-content: space-between;">
                  <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                    <label class="batch-checkbox-label">
                      <input type="checkbox" v-model="jsonOnlyWithFinanceOrGoods" />
                      <span>Chỉ hiện Chuỗi có báo cáo Tài chính / Hàng hóa</span>
                    </label>
                    <div v-if="focusedChainRootId" class="focused-chain-banner">
                      <span>🎯 Đang xem riêng 1 chuỗi liên kết đã chọn</span>
                      <button type="button" @click="focusedChainRootId = ''" class="focused-chain-reset-btn">
                        Hiện tất cả ({{ allLinkedChains.length }} chuỗi)
                      </button>
                    </div>
                  </div>

                  <div style="display: flex; gap: 8px;">
                    <button type="button" @click="selectAllJsonChainCards" class="batch-btn-secondary">
                      ☑ Chọn tất cả card các chuỗi ({{ totalCardsInFilteredChains }})
                    </button>
                    <button type="button" @click="jsonSelectedCardIds = []" class="batch-btn-secondary">
                      ☐ Bỏ chọn hết
                    </button>
                  </div>
                </div>
              </div>

              <!-- Danh sách các chuỗi liên kết & từng card bên trong để người dùng tích chọn -->
              <div class="json-chains-scroll-area">
                <div v-if="jsonFilteredChains.length === 0" class="json-chains-empty">
                  Không tìm thấy chuỗi card liên kết nào phù hợp với bộ lọc.
                </div>

                <div v-for="(chain, cIdx) in jsonFilteredChains"
                     :key="'modal-chain-' + chain.chainId"
                     class="json-chain-card-box"
                     :class="{ 'is-chain-selected': getSelectedCountInChainModal(chain) > 0 }">
                  <!-- Header của 1 Chuỗi liên kết -->
                  <div class="json-chain-box-header" @click="toggleChainSelectionInModal(chain)">
                    <div class="json-chain-header-left" @click.stop>
                      <input
                        type="checkbox"
                        :checked="isChainFullySelectedInModal(chain)"
                        @change="toggleChainSelectionInModal(chain)"
                        style="width: 16px; height: 16px; cursor: pointer; accent-color: #10b981;"
                      />
                      <span class="json-chain-index-badge">🔗 Chuỗi #{{ cIdx + 1 }} ({{ chain.totalCards }} card)</span>
                      <div class="json-chain-cus-info">
                        <strong>{{ chain.customerName }}</strong>
                        <span v-if="chain.customer?.ten_cong_ty" class="json-chain-comp"> - {{ chain.customer.ten_cong_ty }}</span>
                        <span class="json-chain-code">({{ chain.rootCard.maKH }})</span>
                      </div>
                    </div>

                    <div class="json-chain-header-right" @click.stop>
                      <div class="batch-badge-group">
                        <span class="batch-badge-file">{{ chain.totalReports }} BC</span>
                        <span v-if="chain.totalGoods > 0" class="batch-badge-img">📦 {{ chain.totalGoods }} HH</span>
                        <span class="json-chain-metric-pill">DSB: <strong>{{ craftFmt(chain.doanhSoBan) }}</strong></span>
                        <span class="json-chain-metric-pill" :style="{ color: chain.netMargin >= 0 ? '#34d399' : '#fb7185' }">
                          Margin: <strong>{{ craftFmt(chain.netMargin) }}</strong>
                        </span>
                      </div>

                      <button type="button"
                              class="batch-btn-secondary"
                              style="padding: 5px 10px; font-size: 11.5px;"
                              @click="toggleChainSelectionInModal(chain)">
                        {{ isChainFullySelectedInModal(chain) ? '☐ Bỏ chọn chuỗi' : '☑ Chọn cả chuỗi (' + chain.totalCards + ')' }}
                      </button>

                      <button type="button"
                              class="json-row-dl-btn"
                              :disabled="isExportingJson"
                              @click="handleExportChainFromModalRow(chain)"
                              :title="getSelectedCountInChainModal(chain) > 0 && getSelectedCountInChainModal(chain) < chain.totalCards
                                ? 'Tải JSON chuỗi này với ' + getSelectedCountInChainModal(chain) + ' card đã tích chọn'
                                : 'Tải JSON toàn bộ ' + chain.totalCards + ' card trong chuỗi liên kết này'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        <span>
                          {{ getSelectedCountInChainModal(chain) > 0 && getSelectedCountInChainModal(chain) < chain.totalCards
                            ? `Tải ${getSelectedCountInChainModal(chain)}/${chain.totalCards} Card đã chọn`
                            : `Tải cả chuỗi (${chain.totalCards} card)` }}
                        </span>
                      </button>
                    </div>
                  </div>

                  <!-- Danh sách từng Card trong chuỗi để người dùng tích chọn -->
                  <div class="json-chain-nodes-list">
                    <div v-for="nItem in chain.nodes"
                         :key="'chain-node-' + nItem.card.id"
                         class="json-chain-node-row"
                         :class="{ 'row-selected': jsonSelectedCardIds.includes(nItem.card.id) }"
                         @click="toggleJsonCardSelection(nItem.card.id)">
                      <div class="json-chain-node-check" @click.stop>
                        <input
                          type="checkbox"
                          :checked="jsonSelectedCardIds.includes(nItem.card.id)"
                          @change="toggleJsonCardSelection(nItem.card.id)"
                          style="width: 15px; height: 15px; cursor: pointer; accent-color: #10b981;"
                        />
                      </div>

                      <div class="json-chain-node-step" :style="{ paddingLeft: Math.min(nItem.depth * 16, 64) + 'px' }">
                        <span v-if="nItem.depth > 0" class="json-chain-tree-branch">↳</span>
                        <span class="json-step-badge" :class="nItem.depth === 0 ? 'is-root' : 'is-child'">
                          {{ nItem.depth === 0 ? `Bước #${nItem.stepIndex} · Gốc` : `Bước #${nItem.stepIndex} · Nối tiếp` }}
                        </span>
                        <span class="json-node-date">{{ formatCardDate(nItem.card.createdTime) }}</span>
                      </div>

                      <div class="json-chain-node-content">
                        <div class="batch-content-main" :title="nItem.card.noiDung">
                          {{ nItem.card.noiDung || '(Không có nội dung)' }}
                        </div>
                        <div v-if="nItem.summary.poSummary" style="color: #38bdf8; font-size: 11px; font-family: 'JetBrains Mono', monospace;">
                          {{ nItem.summary.poSummary }}
                        </div>
                        <div v-if="nItem.card.ghiChu" class="batch-content-note">📝 {{ nItem.card.ghiChu }}</div>
                      </div>

                      <div class="json-chain-node-badges">
                        <span v-if="nItem.summary.reportsCount > 0" class="batch-badge-file">{{ nItem.summary.reportsCount }} BC</span>
                        <span v-else class="batch-badge-empty">0 BC</span>
                        <span v-if="nItem.summary.goodsCount > 0" class="batch-badge-img">📦 {{ nItem.summary.goodsCount }} HH</span>
                      </div>

                      <div class="json-chain-node-money">
                        <div style="font-size: 10.5px; color: #94a3b8;">DSB: <strong style="color: #f8fafc;">{{ craftFmt(nItem.summary.doanhSoBan) }}</strong></div>
                        <div style="font-size: 10.5px; color: #94a3b8;">
                          Margin: <strong :style="{ color: nItem.summary.netMargin >= 0 ? '#10b981' : '#f43f5e' }">{{ craftFmt(nItem.summary.netMargin) }}</strong>
                        </div>
                      </div>

                      <div class="json-chain-node-action" @click.stop>
                        <button type="button"
                                class="batch-btn-secondary"
                                style="padding: 4px 8px; font-size: 11px;"
                                :disabled="isExportingJson"
                                @click="handleExportCardJson({ node: nItem.card, customer: chain.customer, includeChildren: false })"
                                title="Tải riêng 1 card này">
                          ⬇ Tải riêng
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- ═══ TAB 1: XUẤT TOÀN BỘ ═══ -->
            <template v-else-if="jsonExportScope === 'all'">
              <div class="batch-filter-box" style="background: #0d131f; border-color: rgba(255,255,255,0.08);">
                <div class="batch-filter-row" style="align-items: center; justify-content: space-between;">
                  <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
                    <label class="batch-checkbox-label" style="border-color: rgba(16, 185, 129, 0.3);">
                      <input type="radio" value="filtered" v-model="jsonAllDataSource" />
                      <span>Theo bộ lọc hiện tại trên trang ({{ customerTrees.length }} KH - {{ filteredFiles.length }} card)</span>
                    </label>
                    <label class="batch-checkbox-label">
                      <input type="radio" value="system" v-model="jsonAllDataSource" />
                      <span>Toàn bộ hệ thống ({{ customers.length }} KH - {{ files.length }} card)</span>
                    </label>
                  </div>

                  <label class="batch-checkbox-label">
                    <input type="checkbox" v-model="jsonOnlyWithFinanceOrGoods" />
                    <span>Chỉ lấy các Card đã có chỉ số Tài chính / Hàng hóa</span>
                  </label>
                </div>
              </div>

              <!-- Bảng tổng quan dữ liệu sẽ xuất -->
              <div class="json-summary-grid">
                <div class="json-summary-card">
                  <span class="json-sum-label">Tổng số Khách hàng</span>
                  <strong class="json-sum-val" style="color: #38bdf8;">{{ jsonAllSummary.totalCustomers }}</strong>
                </div>
                <div class="json-summary-card">
                  <span class="json-sum-label">Tổng số Card (Hồ sơ)</span>
                  <strong class="json-sum-val" style="color: #f8fafc;">{{ jsonAllSummary.totalCards }}</strong>
                </div>
                <div class="json-summary-card">
                  <span class="json-sum-label">Phiên bản Báo cáo Tài chính</span>
                  <strong class="json-sum-val" style="color: #34d399;">{{ jsonAllSummary.totalReports }} <small style="font-size: 11px; color: #94a3b8;">({{ jsonAllSummary.closedReports }} đã chốt)</small></strong>
                </div>
                <div class="json-summary-card">
                  <span class="json-sum-label">Tổng số Mặt hàng (Hàng hóa)</span>
                  <strong class="json-sum-val" style="color: #fbbf24;">{{ jsonAllSummary.totalGoods }}</strong>
                </div>
              </div>

              <div class="json-finance-preview-box">
                <div class="json-preview-title">
                  <span>📊 TỔNG HỢP CHỈ SỐ TÀI CHÍNH DỰ KIẾN XUẤT TRONG FILE JSON</span>
                </div>
                <div class="json-fin-metrics-row">
                  <div class="json-fin-item">
                    <span>Doanh số bán (Trước VAT)</span>
                    <strong>{{ craftFmt(jsonAllSummary.doanhSoBan) }} đ</strong>
                  </div>
                  <div class="json-fin-item">
                    <span>Giá mua (Chưa VAT)</span>
                    <strong>{{ craftFmt(jsonAllSummary.giaMua) }} đ</strong>
                  </div>
                  <div class="json-fin-item">
                    <span>Tổng CP đơn hàng</span>
                    <strong style="color: #fbbf24;">{{ craftFmt(jsonAllSummary.tongCP) }} đ</strong>
                  </div>
                  <div class="json-fin-item">
                    <span>Gross COM</span>
                    <strong>{{ craftFmt(jsonAllSummary.grossCom) }} đ</strong>
                  </div>
                  <div class="json-fin-item">
                    <span>Thuế chênh lệch</span>
                    <strong>{{ craftFmt(jsonAllSummary.thue) }} đ</strong>
                  </div>
                  <div class="json-fin-item">
                    <span>Net COM</span>
                    <strong style="color: #34d399;">{{ craftFmt(jsonAllSummary.netCom) }} đ</strong>
                  </div>
                  <div class="json-fin-item">
                    <span>Net PO</span>
                    <strong>{{ craftFmt(jsonAllSummary.netPO) }} đ</strong>
                  </div>
                  <div class="json-fin-item">
                    <span>Net Margin</span>
                    <strong :style="{ color: jsonAllSummary.netMargin >= 0 ? '#10b981' : '#f43f5e' }">{{ craftFmt(jsonAllSummary.netMargin) }} đ</strong>
                  </div>
                </div>
              </div>
            </template>

            <!-- ═══ TAB 2: THEO TỪNG KHÁCH HÀNG ═══ -->
            <template v-else-if="jsonExportScope === 'customer'">
              <div class="batch-filter-box" style="background: #0d131f; border-color: rgba(255,255,255,0.08); padding: 12px 16px;">
                <div class="batch-filter-row" style="align-items: center;">
                  <div style="flex: 2; position: relative; min-width: 240px;">
                    <input
                      type="text"
                      v-model="jsonCustomerSearch"
                      placeholder="Tìm kiếm khách hàng theo tên, công ty, mã KH, MST..."
                      class="batch-input"
                      style="padding-left: 36px; width: 100%; box-sizing: border-box;"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 11px; top: 50%; transform: translateY(-50%);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>

                  <label class="batch-checkbox-label">
                    <input type="checkbox" v-model="jsonOnlyWithFinanceOrGoods" />
                    <span>Chỉ hiện KH có dữ liệu Tài chính / Hàng hóa</span>
                  </label>

                  <div style="display: flex; gap: 8px;">
                    <button type="button" @click="selectAllJsonCustomers" class="batch-btn-secondary">
                      ☑ Chọn tất cả ({{ jsonFilteredCustomers.length }})
                    </button>
                    <button type="button" @click="jsonSelectedCustomerIds = []" class="batch-btn-secondary">
                      ☐ Bỏ chọn
                    </button>
                  </div>
                </div>
              </div>

              <div class="batch-table-wrapper" style="max-height: 390px;">
                <table class="batch-table">
                  <thead>
                    <tr>
                      <th style="width: 42px; text-align: center;">
                        <input
                          type="checkbox"
                          :checked="isAllJsonCustomersSelected"
                          @change="toggleSelectAllJsonCustomers"
                        />
                      </th>
                      <th>Khách Hàng / Công Ty</th>
                      <th style="width: 110px; text-align: center;">Số Hồ Sơ</th>
                      <th style="width: 150px; text-align: center;">Tài Chính &amp; Hàng Hóa</th>
                      <th style="width: 150px; text-align: right;">Tổng Doanh Số Bán</th>
                      <th style="width: 140px; text-align: right;">Tổng Net Margin</th>
                      <th style="width: 120px; text-align: center;">Xuất Riêng</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="jsonFilteredCustomers.length === 0">
                      <td colspan="7" style="text-align: center; padding: 36px; color: #94a3b8;">
                        Không tìm thấy khách hàng nào phù hợp.
                      </td>
                    </tr>
                    <tr
                      v-for="cusItem in jsonFilteredCustomers"
                      :key="cusItem.customer.id || cusItem.customer.ma_khach_hang"
                      :class="{ 'row-selected': jsonSelectedCustomerIds.includes(cusItem.customer.ma_khach_hang) }"
                      @click="toggleJsonCustomerSelection(cusItem.customer.ma_khach_hang)"
                      class="batch-table-row"
                    >
                      <td style="text-align: center;" @click.stop>
                        <input
                          type="checkbox"
                          :checked="jsonSelectedCustomerIds.includes(cusItem.customer.ma_khach_hang)"
                          @change="toggleJsonCustomerSelection(cusItem.customer.ma_khach_hang)"
                        />
                      </td>
                      <td>
                        <div class="batch-customer-cell">
                          <strong style="color: #f8fafc; font-size: 13.5px;">
                            {{ cusItem.customer.ten_khach_hang || 'Chưa có tên' }}
                            <span v-if="cusItem.customer.ten_cong_ty" style="color: #94a3b8; font-weight: 500;"> - {{ cusItem.customer.ten_cong_ty }}</span>
                          </strong>
                          <span style="color: #64748b; font-size: 11px;">
                            Mã KH: {{ cusItem.customer.ma_khach_hang }}
                            <template v-if="cusItem.customer.mst"> · MST: {{ cusItem.customer.mst }}</template>
                          </span>
                        </div>
                      </td>
                      <td style="text-align: center;">
                        <span class="batch-id-tag">{{ cusItem.totalCards }} card</span>
                      </td>
                      <td style="text-align: center;">
                        <div class="batch-badge-group">
                          <span class="batch-badge-file">{{ cusItem.totalReports }} BC</span>
                          <span v-if="cusItem.totalGoods > 0" class="batch-badge-img">📦 {{ cusItem.totalGoods }} HH</span>
                        </div>
                      </td>
                      <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #f8fafc;">
                        {{ craftFmt(cusItem.doanhSoBan) }}
                      </td>
                      <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700;"
                          :style="{ color: cusItem.netMargin >= 0 ? '#10b981' : '#f43f5e' }">
                        {{ craftFmt(cusItem.netMargin) }}
                      </td>
                      <td style="text-align: center;" @click.stop>
                        <button type="button"
                                class="json-row-dl-btn"
                                :disabled="isExportingJson"
                                @click="handleExportSingleCustomerByMaKH(cusItem.customer.ma_khach_hang)"
                                title="Tải ngay file JSON của riêng khách hàng này">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          <span>Tải JSON</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <!-- ═══ TAB 3: THEO TỪNG CARD ═══ -->
            <template v-else-if="jsonExportScope === 'card'">
              <div class="batch-filter-box" style="background: #0d131f; border-color: rgba(255,255,255,0.08); padding: 12px 16px;">
                <div class="batch-filter-row" style="align-items: center;">
                  <div style="flex: 1.8; position: relative; min-width: 220px;">
                    <input
                      type="text"
                      v-model="jsonCardSearch"
                      placeholder="Tìm theo ID, nội dung card, số PO, số HĐ, khách hàng..."
                      class="batch-input"
                      style="padding-left: 36px; width: 100%; box-sizing: border-box;"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 11px; top: 50%; transform: translateY(-50%);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>

                  <div style="flex: 1.2; min-width: 190px;">
                    <select v-model="jsonCardCustomerFilter" class="batch-input" style="width: 100%;">
                      <option value="">-- Tất cả khách hàng --</option>
                      <option v-for="c in customers" :key="c.ma_khach_hang" :value="c.ma_khach_hang">
                        {{ c.ten_khach_hang || c.ma_khach_hang }} {{ c.ten_cong_ty ? `(${c.ten_cong_ty})` : '' }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="batch-filter-row" style="margin-top: 10px; align-items: center; justify-content: space-between;">
                  <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <label class="batch-checkbox-label">
                      <input type="checkbox" v-model="jsonOnlyWithFinanceOrGoods" />
                      <span>Chỉ hiện Card có báo cáo Tài chính / Hàng hóa</span>
                    </label>
                    <label class="batch-checkbox-label" title="Nếu tích chọn, khi xuất 1 card cha sẽ đính kèm luôn cây các card con liên kết bên dưới">
                      <input type="checkbox" v-model="jsonIncludeLinkedChildren" />
                      <span>Bao gồm cả các Card con trong chuỗi liên kết</span>
                    </label>
                  </div>

                  <div style="display: flex; gap: 8px;">
                    <button type="button" @click="selectAllJsonCards" class="batch-btn-secondary">
                      ☑ Chọn tất cả ({{ jsonFilteredCards.length }})
                    </button>
                    <button type="button" @click="jsonSelectedCardIds = []" class="batch-btn-secondary">
                      ☐ Bỏ chọn
                    </button>
                  </div>
                </div>
              </div>

              <div class="batch-table-wrapper" style="max-height: 370px;">
                <table class="batch-table">
                  <thead>
                    <tr>
                      <th style="width: 42px; text-align: center;">
                        <input
                          type="checkbox"
                          :checked="isAllJsonCardsSelected"
                          @change="toggleSelectAllJsonCards"
                        />
                      </th>
                      <th style="width: 95px;">Ngày tạo</th>
                      <th style="width: 185px;">Khách Hàng</th>
                      <th>Nội dung Card / PO / HĐ &amp; Chuỗi liên kết</th>
                      <th style="width: 135px; text-align: center;">Tài chính &amp; HH</th>
                      <th style="width: 125px; text-align: right;">Doanh số bán</th>
                      <th style="width: 115px; text-align: right;">Net Margin</th>
                      <th style="width: 185px; text-align: center;">Xuất Riêng / Chuỗi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="jsonFilteredCards.length === 0">
                      <td colspan="8" style="text-align: center; padding: 36px; color: #94a3b8;">
                        Không tìm thấy card nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                    <tr
                      v-for="cRow in jsonFilteredCards"
                      :key="cRow.card.id"
                      :class="{ 'row-selected': jsonSelectedCardIds.includes(cRow.card.id) }"
                      @click="toggleJsonCardSelection(cRow.card.id)"
                      class="batch-table-row"
                    >
                      <td style="text-align: center;" @click.stop>
                        <input
                          type="checkbox"
                          :checked="jsonSelectedCardIds.includes(cRow.card.id)"
                          @change="toggleJsonCardSelection(cRow.card.id)"
                        />
                      </td>
                      <td>
                        <span style="color: #94a3b8; font-size: 11.5px; font-family: monospace;">{{ formatCardDate(cRow.card.createdTime) }}</span>
                      </td>
                      <td>
                        <div class="batch-customer-cell">
                          <strong style="color: #f1f5f9; font-size: 12.5px;">{{ cRow.customerName }}</strong>
                          <span style="color: #64748b; font-size: 11px;">Mã: {{ cRow.card.maKH }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="batch-content-cell" style="max-width: 280px;">
                          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                            <span v-if="cRow.chainInfo && cRow.chainInfo.totalCards > 1"
                                  class="json-card-chain-tag"
                                  :title="'Card này thuộc chuỗi liên kết gồm ' + cRow.chainInfo.totalCards + ' card (Bước #' + cRow.chainInfo.stepIndex + ')'">
                              🔗 Chuỗi {{ cRow.chainInfo.totalCards }} card (#{{ cRow.chainInfo.stepIndex }})
                            </span>
                            <div class="batch-content-main" :title="cRow.card.noiDung">{{ cRow.card.noiDung || '(Không có nội dung)' }}</div>
                          </div>
                          <div v-if="cRow.poSummary" style="color: #38bdf8; font-size: 11px; font-family: 'JetBrains Mono', monospace;">
                            {{ cRow.poSummary }}
                          </div>
                          <div v-if="cRow.card.ghiChu" class="batch-content-note">📝 {{ cRow.card.ghiChu }}</div>
                        </div>
                      </td>
                      <td style="text-align: center;">
                        <div class="batch-badge-group">
                          <span v-if="cRow.reportsCount > 0" class="batch-badge-file">{{ cRow.reportsCount }} BC</span>
                          <span v-else class="batch-badge-empty">0 BC</span>
                          <span v-if="cRow.goodsCount > 0" class="batch-badge-img">📦 {{ cRow.goodsCount }} HH</span>
                        </div>
                      </td>
                      <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #f8fafc;">
                        {{ craftFmt(cRow.doanhSoBan) }}
                      </td>
                      <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700;"
                          :style="{ color: cRow.netMargin >= 0 ? '#10b981' : '#f43f5e' }">
                        {{ craftFmt(cRow.netMargin) }}
                      </td>
                      <td style="text-align: center;" @click.stop>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 5px; flex-wrap: wrap;">
                          <button v-if="cRow.chainInfo && cRow.chainInfo.totalCards > 1"
                                  type="button"
                                  class="batch-btn-secondary"
                                  style="padding: 4px 7px; font-size: 10.5px;"
                                  @click="selectChainCardsInModal(cRow.chainInfo.chain)"
                                  :title="'Tích chọn toàn bộ ' + cRow.chainInfo.totalCards + ' card trong chuỗi liên kết này'">
                            ☑ Chọn chuỗi ({{ cRow.chainInfo.totalCards }})
                          </button>
                          <button v-if="cRow.chainInfo && cRow.chainInfo.totalCards > 1"
                                  type="button"
                                  class="json-row-dl-btn"
                                  style="background: rgba(168, 85, 247, 0.16); color: #c084fc; border-color: rgba(168, 85, 247, 0.4);"
                                  :disabled="isExportingJson"
                                  @click="handleExportChainJson({ node: cRow.card, customer: cRow.customer })"
                                  :title="'Tải ngay file JSON của cả chuỗi liên kết (' + cRow.chainInfo.totalCards + ' card)'">
                            <span>🔗 Tải chuỗi</span>
                          </button>
                          <button type="button"
                                  class="json-row-dl-btn"
                                  :disabled="isExportingJson"
                                  @click="handleExportCardJson({ node: cRow.card, includeChildren: jsonIncludeLinkedChildren })"
                                  title="Tải ngay file JSON của riêng Card này">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            <span>Tải Card</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </div>

          <!-- FOOTER -->
          <div class="batch-modal-footer" style="background: #0d131f;">
            <div class="batch-footer-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span>
                File JSON xuất ra bao gồm đầy đủ:
                <strong style="color: #34d399;">Chỉ số Tài chính (DSB, Giá mua, CP, Gross/Net COM, Thuế, Net PO, Net Margin, Tỷ suất %)</strong>
                &amp;
                <strong style="color: #38bdf8;">Danh sách Hàng hóa chi tiết (Tên, ĐVT, SL, Đơn giá, VAT, Thành tiền)</strong>
              </span>
            </div>
            <div class="batch-footer-buttons">
              <button type="button" @click="closeJsonExportModal" :disabled="isExportingJson" class="batch-btn-secondary" style="padding: 10px 20px;">
                Đóng
              </button>
              <button
                type="button"
                @click="handleConfirmJsonModalExport"
                :disabled="isExportingJson || !canSubmitJsonModalExport"
                class="batch-btn-primary"
                style="background: linear-gradient(135deg, #10b981, #059669); border-color: #10b981; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>{{ jsonModalPrimaryBtnLabel }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

</template>

<script setup>
import { ref, onMounted, computed, watch, toRaw, markRaw, nextTick } from 'vue'
import FileTimelineNode from './FileTimelineNode.vue';
import FileCompareNode from './FileCompareNode.vue';
import { downloadCardFilesAsZip, exportBatchCardsAsZip } from '../utils/cardZipHelper';

const downloadingZipMap = ref({});
const zipProgressTextMap = ref({});

const getCardAttachmentCount = (file) => {
  if (!file) return 0;
  let count = 0;
  if (Array.isArray(file.linkFileBaoGia)) {
    count += file.linkFileBaoGia.length;
  } else if (typeof file.linkFileBaoGia === 'string' && file.linkFileBaoGia.trim() !== '') {
    count += 1;
  }
  if (Array.isArray(file.linkImgSave)) {
    count += file.linkImgSave.length;
  } else if (typeof file.linkImgSave === 'string' && file.linkImgSave.trim() !== '') {
    count += 1;
  }
  return count;
};

const hasCardAttachments = (file) => {
  return getCardAttachmentCount(file) > 0;
};

const handleDownloadCardZip = async (file) => {
  if (!file || downloadingZipMap.value[file.id]) return;
  downloadingZipMap.value[file.id] = true;
  zipProgressTextMap.value[file.id] = 'Đang nén...';

  try {
    const customerName = getCustomerNameInfo(file.maKH) || file.tenKH || file.maKH || 'Khách hàng';
    let fileList = [];
    if (Array.isArray(file.linkFileBaoGia)) {
      fileList = file.linkFileBaoGia;
    } else if (typeof file.linkFileBaoGia === 'string' && file.linkFileBaoGia.trim() !== '') {
      fileList = [file.linkFileBaoGia];
    }
    let imgList = [];
    if (Array.isArray(file.linkImgSave)) {
      imgList = file.linkImgSave;
    } else if (typeof file.linkImgSave === 'string' && file.linkImgSave.trim() !== '') {
      imgList = [file.linkImgSave];
    }

    await downloadCardFilesAsZip({
      customerName,
      noiDung: file.noiDung || '',
      ghiChu: file.ghiChu || '',
      files: fileList,
      images: imgList,
      onProgress: (percent, msg) => {
        zipProgressTextMap.value[file.id] = msg || (percent + '%');
      }
    });
  } catch (err) {
    console.error('Lỗi tải ZIP cho card:', err);
    await showAlert('Không thể tạo file zip: ' + (err.message || 'Lỗi không xác định'), 'Lỗi tải ZIP');
  } finally {
    downloadingZipMap.value[file.id] = false;
    delete zipProgressTextMap.value[file.id];
  }
};
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

const getAppDialogVariant = () => {
  const t = (appDialog.value.title || '').toLowerCase();
  const m = (appDialog.value.message || '').toLowerCase();
  if (t.includes('thành công') || m.includes('thành công') || m.includes('lưu tạm') || m.includes('chốt deal thành công') || t.includes('✅') || m.includes('✅') || m.includes('🎉')) {
    return 'success';
  }
  if (t.includes('lỗi') || m.includes('lỗi') || t.includes('cảnh báo') || m.includes('cảnh báo') || m.includes('xóa') || t.includes('xóa') || m.includes('chốt deal?') || m.includes('🔥') || m.includes('nhân bản')) {
    return 'danger';
  }
  if (appDialog.value.type === 'confirm') {
    return 'confirm';
  }
  return 'info';
};

const getAppDialogEyebrow = () => {
  const v = getAppDialogVariant();
  if (v === 'success') return 'THÀNH CÔNG';
  if (v === 'danger') return appDialog.value.type === 'confirm' ? 'XÁC NHẬN CẦN CHÚ Ý' : 'CẢNH BÁO';
  if (v === 'confirm') return 'XÁC NHẬN HÀNH ĐỘNG';
  return 'THÔNG BÁO HỆ THỐNG';
};

const cleanDialogTitle = (title) => {
  if (!title) return 'Thông báo';
  return title.replace(/^[✅🎉🔥⚠️❗❌ℹ️\s]+/, '').trim() || 'Thông báo';
};

const cleanDialogMessage = (message) => {
  if (!message) return '';
  return message.replace(/^[✅🎉🔥⚠️❗❌ℹ️\s]+/, '').trim();
};

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (appDialog.value && appDialog.value.isOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAppDialog(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        closeAppDialog(true);
      }
    }
  });
}








// --- TRẠNG THÁI ---
const loading = ref(false)
const isModalOpen = ref(false)
const isUploadingFile = ref(false)
const isUploadingImage = ref(false)
const editingId = ref(null)
const originalFormDataStr = ref('')
const originalCustomerFormDataStr = ref('')

const serializeModalFileOwnFields = (fd) => {
  if (!fd) return ''
  return JSON.stringify({
    maKH: fd.maKH || '',
    tagKH: Array.isArray(fd.tagKH) ? fd.tagKH : [],
    noiDung: fd.noiDung || '',
    ghiChu: fd.ghiChu || '',
    trangThaiXuLy: fd.trangThaiXuLy || 'Chưa gửi',
    mucDoUuTien: fd.mucDoUuTien || 'Bình thường',
    trangThaiBaoGia: fd.trangThaiBaoGia || 'Xem xét',
    tenFileBaoGia: fd.tenFileBaoGia || '',
    linkFileBaoGia: Array.isArray(fd.linkFileBaoGia) ? fd.linkFileBaoGia : [],
    linkImgSave: Array.isArray(fd.linkImgSave) ? fd.linkImgSave : [],
    idPrevious: fd.idPrevious || ''
  })
}

const syncOriginalFormDataBaseline = (updatedKeys = null) => {
  if (!updatedKeys || !originalFormDataStr.value) {
    originalFormDataStr.value = serializeModalFileOwnFields(formData.value)
    return
  }
  try {
    const parsed = JSON.parse(originalFormDataStr.value)
    const current = JSON.parse(serializeModalFileOwnFields(formData.value))
    for (const k of updatedKeys) {
      parsed[k] = current[k]
    }
    originalFormDataStr.value = JSON.stringify(parsed)
  } catch {
    originalFormDataStr.value = serializeModalFileOwnFields(formData.value)
  }
}

const isFileDataChanged = computed(() => {
  return serializeModalFileOwnFields(formData.value) !== originalFormDataStr.value;
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

// ==========================================
// --- BATCH EXPORT (XUẤT FILE HÀNG LOẠT) ---
// ==========================================
const isBatchExportModalOpen = ref(false);
const batchFilterDateFrom = ref('');
const batchFilterDateTo = ref('');
const batchActiveShortcut = ref('this_month');
const batchFilterCustomer = ref('');
const batchFilterSearch = ref('');
const batchFilterOnlyHasFiles = ref(true);
const selectedCardIds = ref([]);
const isBatchDownloading = ref(false);
const batchProgress = ref({
  percent: 0,
  currentCard: 0,
  totalCards: 0,
  currentFile: 0,
  totalFiles: 0,
  message: ''
});
const batchCancelSignal = ref({ isCancelled: false });

const getCardFilesCount = (file) => {
  if (!file) return 0;
  if (Array.isArray(file.linkFileBaoGia)) return file.linkFileBaoGia.length;
  if (typeof file.linkFileBaoGia === 'string' && file.linkFileBaoGia.trim() !== '') return 1;
  return 0;
};

const getCardImagesCount = (file) => {
  if (!file) return 0;
  if (Array.isArray(file.linkImgSave)) return file.linkImgSave.length;
  if (typeof file.linkImgSave === 'string' && file.linkImgSave.trim() !== '') return 1;
  return 0;
};

const formatCardDate = (timestamp) => {
  if (!timestamp) return '---';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '---';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const setBatchShortcut = (shortcut) => {
  batchActiveShortcut.value = shortcut;
  const now = new Date();
  const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  if (shortcut === 'today') {
    const today = formatDate(now);
    batchFilterDateFrom.value = today;
    batchFilterDateTo.value = today;
  } else if (shortcut === 'this_week') {
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    batchFilterDateFrom.value = formatDate(monday);
    batchFilterDateTo.value = formatDate(sunday);
  } else if (shortcut === 'this_month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    batchFilterDateFrom.value = formatDate(firstDay);
    batchFilterDateTo.value = formatDate(lastDay);
  } else if (shortcut === 'this_year') {
    batchFilterDateFrom.value = `${now.getFullYear()}-01-01`;
    batchFilterDateTo.value = `${now.getFullYear()}-12-31`;
  } else if (shortcut === 'all') {
    batchFilterDateFrom.value = '';
    batchFilterDateTo.value = '';
  }
};

const batchFilteredCards = computed(() => {
  let list = files.value || [];

  // 1. Khoảng ngày tạo
  if (batchFilterDateFrom.value) {
    const fromTime = new Date(batchFilterDateFrom.value);
    fromTime.setHours(0, 0, 0, 0);
    list = list.filter(f => new Date(f.createdTime || Date.now()) >= fromTime);
  }
  if (batchFilterDateTo.value) {
    const toTime = new Date(batchFilterDateTo.value);
    toTime.setHours(23, 59, 59, 999);
    list = list.filter(f => new Date(f.createdTime || Date.now()) <= toTime);
  }

  // 2. Lọc khách hàng
  if (batchFilterCustomer.value) {
    list = list.filter(f => f.maKH === batchFilterCustomer.value);
  }

  // 3. Chỉ hiện hồ sơ có file hoặc ảnh
  if (batchFilterOnlyHasFiles.value) {
    list = list.filter(f => getCardAttachmentCount(f) > 0);
  }

  // 4. Tìm kiếm từ khóa (ID, tên khách, nội dung, ghi chú)
  if (batchFilterSearch.value && batchFilterSearch.value.trim()) {
    const q = batchFilterSearch.value.trim().toLowerCase();
    list = list.filter(f => {
      const idMatch = String(f.id || '').toLowerCase().includes(q);
      const cusMatch = String(getCustomerNameInfo(f.maKH) || f.tenKH || f.maKH || '').toLowerCase().includes(q);
      const contentMatch = String(f.noiDung || '').toLowerCase().includes(q);
      const noteMatch = String(f.ghiChu || '').toLowerCase().includes(q);
      return idMatch || cusMatch || contentMatch || noteMatch;
    });
  }

  return list;
});

const isCardSelected = (id) => selectedCardIds.value.includes(id);

const toggleCardSelection = (id) => {
  const idx = selectedCardIds.value.indexOf(id);
  if (idx > -1) {
    selectedCardIds.value.splice(idx, 1);
  } else {
    selectedCardIds.value.push(id);
  }
};

const isAllBatchSelected = computed(() => {
  if (batchFilteredCards.value.length === 0) return false;
  return batchFilteredCards.value.every(c => selectedCardIds.value.includes(c.id));
});

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    selectAllBatchCards();
  } else {
    deselectAllBatchCards();
  }
};

const selectAllBatchCards = () => {
  const currentFilteredIds = batchFilteredCards.value.map(c => c.id);
  const newSet = new Set([...selectedCardIds.value, ...currentFilteredIds]);
  selectedCardIds.value = Array.from(newSet);
};

const deselectAllBatchCards = () => {
  const currentFilteredIds = new Set(batchFilteredCards.value.map(c => c.id));
  selectedCardIds.value = selectedCardIds.value.filter(id => !currentFilteredIds.has(id));
};

const totalSelectedAttachments = computed(() => {
  const selectedCards = (files.value || []).filter(f => selectedCardIds.value.includes(f.id));
  let totalF = 0;
  let totalI = 0;
  selectedCards.forEach(c => {
    totalF += getCardFilesCount(c);
    totalI += getCardImagesCount(c);
  });
  return { files: totalF, images: totalI, total: totalF + totalI };
});

const openBatchExportModal = () => {
  // Thừa hưởng bộ lọc từ trang chính nếu có
  if (filterDateFrom.value && filterDateTo.value) {
    batchFilterDateFrom.value = filterDateFrom.value;
    batchFilterDateTo.value = filterDateTo.value;
    batchActiveShortcut.value = '';
  } else {
    setBatchShortcut('this_month');
  }

  if (filterCustomer.value) {
    batchFilterCustomer.value = filterCustomer.value;
  } else {
    batchFilterCustomer.value = '';
  }

  batchFilterSearch.value = '';
  batchFilterOnlyHasFiles.value = true;
  isBatchDownloading.value = false;
  batchCancelSignal.value = { isCancelled: false };

  // Tự động tích chọn tất cả các hồ sơ có file đang thỏa bộ lọc
  const autoSelect = batchFilteredCards.value.filter(c => getCardAttachmentCount(c) > 0).map(c => c.id);
  selectedCardIds.value = autoSelect;

  isBatchExportModalOpen.value = true;
};

const closeBatchExportModal = async () => {
  if (isBatchDownloading.value) {
    if (await showConfirm('Quá trình xuất file đang diễn ra. Bạn có chắc muốn dừng lại?', 'Xác nhận hủy xuất file')) {
      cancelBatchDownload();
      isBatchExportModalOpen.value = false;
    }
    return;
  }
  isBatchExportModalOpen.value = false;
};

const cancelBatchDownload = () => {
  batchCancelSignal.value.isCancelled = true;
  isBatchDownloading.value = false;
};

const handleStartBatchExport = async () => {
  if (selectedCardIds.value.length === 0) {
    await showAlert('Vui lòng chọn ít nhất 1 hồ sơ để xuất file.', 'Chưa chọn hồ sơ');
    return;
  }

  const selectedCards = (files.value || []).filter(f => selectedCardIds.value.includes(f.id));
  const cardsWithAttachments = selectedCards.filter(f => getCardAttachmentCount(f) > 0);

  if (cardsWithAttachments.length === 0) {
    await showAlert('Các hồ sơ đã chọn không có bất kỳ file hoặc hình ảnh nào để tải về.', 'Không có tệp đính kèm');
    return;
  }

  isBatchDownloading.value = true;
  batchCancelSignal.value = { isCancelled: false };
  batchProgress.value = {
    percent: 0,
    currentCard: 0,
    totalCards: cardsWithAttachments.length,
    currentFile: 0,
    totalFiles: totalSelectedAttachments.value.total,
    message: 'Đang chuẩn bị dữ liệu...'
  };

  try {
    const preparedCards = cardsWithAttachments.map(f => {
      let fileList = [];
      if (Array.isArray(f.linkFileBaoGia)) fileList = f.linkFileBaoGia;
      else if (typeof f.linkFileBaoGia === 'string' && f.linkFileBaoGia.trim() !== '') fileList = [f.linkFileBaoGia];

      let imgList = [];
      if (Array.isArray(f.linkImgSave)) imgList = f.linkImgSave;
      else if (typeof f.linkImgSave === 'string' && f.linkImgSave.trim() !== '') imgList = [f.linkImgSave];

      const customerName = getCustomerNameInfo(f.maKH) || f.tenKH || f.maKH || 'Khách hàng';

      return {
        id: f.id,
        customerName,
        noiDung: f.noiDung || '',
        ghiChu: f.ghiChu || '',
        files: fileList,
        images: imgList
      };
    });

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const customZipName = `Export_File_${dd}-${mm}-${yyyy}_${hh}h${min}.zip`;

    const result = await exportBatchCardsAsZip({
      cards: preparedCards,
      zipFileName: customZipName,
      cancelSignal: batchCancelSignal.value,
      onProgress: (prog) => {
        batchProgress.value = {
          percent: prog.percent || 0,
          currentCard: prog.currentCard || 0,
          totalCards: prog.totalCards || preparedCards.length,
          currentFile: prog.currentFile || 0,
          totalFiles: prog.totalFiles || 0,
          message: prog.message || ''
        };
      }
    });

    setTimeout(async () => {
      isBatchDownloading.value = false;
      isBatchExportModalOpen.value = false;
      await showAlert(`🎉 Xuất file thành công!\n\nĐã tải: ${result.totalCards} hồ sơ (${result.completedFiles} file/ảnh)\nTên file: ${result.fileName}`, 'Xuất file thành công');
    }, 600);

  } catch (err) {
    console.error('Lỗi khi xuất file hàng loạt:', err);
    isBatchDownloading.value = false;
    await showAlert('Không thể hoàn tất xuất file: ' + (err.message || 'Lỗi không xác định'), 'Lỗi xuất file');
  }
};


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

const applyLinkedFileToForm = (f) => {
  if (!f) return;
  formData.value.idPrevious = f.id;
  if (!editingId.value) {
    formData.value.maKH = f.maKH || '';
    const cus = customers.value.find(c => c.ma_khach_hang === f.maKH);
    if (cus && Array.isArray(cus.tagKH) && cus.tagKH.length > 0) {
      formData.value.tagKH = [...cus.tagKH];
    } else if (Array.isArray(f.tagKH)) {
      formData.value.tagKH = [...f.tagKH];
    } else {
      formData.value.tagKH = [];
    }
    formData.value.noiDung = f.noiDung || '';
    formData.value.ghiChu = f.ghiChu || '';
  }
};

const selectLinkedFile = (f) => {
  if (editingId.value && f.maKH && formData.value.maKH && f.maKH !== formData.value.maKH) {
    pendingLinkedFile.value = f;
    isWarningCustomerModalOpen.value = true;
  } else {
    applyLinkedFileToForm(f);
    isFileSelectModalOpen.value = false;
  }
};

const confirmLinkedFile = () => {
  if (pendingLinkedFile.value) {
    applyLinkedFileToForm(pendingLinkedFile.value);
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
  cong_no: 0,
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
  idPrevious: '',
  id_sale_report_craft: '',
  id_sale_report: '',
  craft_ids: [],
  sale_report_ids: [],
  craft_chotDeal: false
}

const formData = ref({ ...defaultForm })

// ═══ Sale Report Craft State ═══
const craftModal = ref({ show: false, item: null, items: [], activeIndex: 0 })
const craftReportsMap = ref({})
const officialReportsMap = ref({})
const hdChiTietMap = ref({})
const officialReportsLoaded = ref(false)
const craftFileInputBG = ref(null)
const craftFileInputMH = ref(null)
const craftScanInput = ref(null)
const craftScanConfirmModal = ref({ show: false, item: null, nangGia: 0, thuePct: 25, conLai: 0, imageUrl: '' })
const isCraftSaving = ref(false)
const isChotDealLoading = ref(false)
const craftPreviewHtmlBG = ref('')
const craftPreviewHtmlMH = ref('')
const craftExistingPicker = ref(null) // 'image' | 'bao_gia' | 'mua_hang' | null

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
      const dataToSave = {
        ...customerFormData.value,
        cong_no: Number(customerFormData.value.cong_no || 0)
      };
      delete dataToSave.id;
      await update(cusRef, dataToSave);
      await showAlert('Cập nhật thông tin khách hàng thành công!');
    } else {
      const newCusRef = push(dbRef(db, 'khach_hang'));
      await set(newCusRef, {
        ...customerFormData.value,
        cong_no: Number(customerFormData.value.cong_no || 0),
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

const cleanFileName = (raw) => {
  if (!raw) return ''
  let s = String(raw).trim()
  if (s.startsWith('http://') || s.startsWith('https://')) {
    try {
      const u = new URL(s)
      const parts = u.pathname.split('/')
      s = decodeURIComponent(parts[parts.length - 1] || s)
    } catch (e) {}
  }
  return s.split('?')[0].trim()
}

const getFallbackFileName = () => {
  if (Array.isArray(formData.value.linkFileBaoGia) && formData.value.linkFileBaoGia.length > 0) {
    for (const f of formData.value.linkFileBaoGia) {
      const name = typeof f === 'object' ? (f.name || f.url) : f
      const cleaned = cleanFileName(name)
      if (cleaned) return cleaned
    }
  }
  if (Array.isArray(formData.value.linkImgSave) && formData.value.linkImgSave.length > 0) {
    for (const img of formData.value.linkImgSave) {
      const name = typeof img === 'object' ? (img.name || img.url) : img
      const cleaned = cleanFileName(name)
      if (cleaned) return cleaned
    }
  }
  if (formData.value.tenFileBaoGia && String(formData.value.tenFileBaoGia).trim()) {
    return cleanFileName(formData.value.tenFileBaoGia)
  }
  return ''
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
      if (!formData.value.noiDung || !formData.value.noiDung.trim()) {
        formData.value.noiDung = cleanFileName(result.name || file.name)
      }
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
      if (!formData.value.noiDung || !formData.value.noiDung.trim()) {
        formData.value.noiDung = cleanFileName(result.name || file.name)
      }
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

const getOfficeViewUrl = (fileObj) => {
  const url = typeof fileObj === 'string' ? fileObj : fileObj?.url;
  if (!url || typeof url !== 'string') return '#';
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
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
  craftModal.value = { show: false, item: null, items: [], activeIndex: 0 }
  isModalOpen.value = true
}

const editFile = (file) => {
  editingId.value = file.id
  formData.value = {
    ...file,
    craft_chotDeal: officialReportsLoaded.value ? isFileChotDeal(file) : !!file.craft_chotDeal
  }
  craftModal.value = { show: false, item: null, items: [], activeIndex: 0 }
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

  originalFormDataStr.value = serializeModalFileOwnFields(formData.value)
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  craftModal.value = { show: false, item: null, items: [], activeIndex: 0 }
}

// --- LOGIC FIREBASE ---
import { getDatabase, ref as dbRef, onValue, push, set, update, remove } from "firebase/database"
// Chú ý: Cần import firebase app đã khởi tạo từ file firebase config của bạn
// Giả sử bạn import db từ một file chung, hoặc tạm thời import lại ở đây:
import { initializeApp, getApps, getApp } from "firebase/app"
import ExcelJS from 'exceljs'
import * as XLSX from 'xlsx-js-style'
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
const db = markRaw(getDatabase(app))

function deepUnproxyFirebaseObj(obj, seen = new Set()) {
  if (!obj || typeof obj !== 'object') return obj
  const raw = toRaw(obj)
  if (seen.has(raw)) return raw
  seen.add(raw)
  try { markRaw(raw) } catch {}
  if (raw instanceof Map) {
    const entries = Array.from(raw.entries())
    raw.clear()
    for (const [k, v] of entries) {
      raw.set(deepUnproxyFirebaseObj(k, seen), deepUnproxyFirebaseObj(v, seen))
    }
    return raw
  }
  for (const key of Object.keys(raw)) {
    try {
      const val = raw[key]
      if (val && typeof val === 'object') {
        raw[key] = deepUnproxyFirebaseObj(val, seen)
      }
    } catch {}
  }
  return raw
}

function toPlainFirebaseData(val) {
  if (val === undefined) return null
  return JSON.parse(JSON.stringify(val))
}

deepUnproxyFirebaseObj(db)

const fetchFilesAndCustomers = async () => {
  loading.value = true
  deepUnproxyFirebaseObj(db)
  

  
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
  let autoOpenedFileId = false
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
    reconcileChotDealWithSaleReport()

    if (route.query.id && !autoOpenedFileId) {
      const targetFile = files.value.find(f => f.id === route.query.id)
      if (targetFile) {
        autoOpenedFileId = true
        filterCustomer.value = ''
        if (targetFile.createdTime) {
          const d = new Date(targetFile.createdTime)
          const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          filterMode.value = 'day'
          filterDateFrom.value = dStr
          filterDateTo.value = dStr
        }
        nextTick(() => {
          setTimeout(() => {
            highlightedFileId.value = targetFile.id
            const el = document.getElementById('file-card-' + targetFile.id) || document.getElementById('tl-node-' + targetFile.id)
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            setTimeout(() => {
              if (highlightedFileId.value === targetFile.id) {
                highlightedFileId.value = null
              }
            }, 3000)
          }, 300)
        })
      }
    }
  })

  // Lấy danh sách sale report craft real-time
  const craftRef = dbRef(db, 'sale_report_craft')
  onValue(craftRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      craftReportsMap.value = data
    } else {
      craftReportsMap.value = {}
    }
  })

  // Lấy danh sách sale report chính thức real-time
  const officialSrRef = dbRef(db, 'sale_report')
  onValue(officialSrRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      officialReportsMap.value = data
    } else {
      officialReportsMap.value = {}
    }
    officialReportsLoaded.value = true
    reconcileChotDealWithSaleReport()
  })

  // Lấy danh sách chi tiết hàng hóa hợp đồng real-time
  const hdctRef = dbRef(db, 'hop_dong_chi_tiet')
  onValue(hdctRef, (snapshot) => {
    const data = snapshot.val()
    hdChiTietMap.value = data || {}
  })
}

// ════════════════════════════════════════════════════════════════
// SALE REPORT CRAFT - Full Logic
// ════════════════════════════════════════════════════════════════
const craftFmt = (val) => !val && val !== 0 ? '0' : new Intl.NumberFormat('vi-VN').format(Math.round(val))

const craftFmtInput = (val) => {
  if (!val) return ''
  return Math.round(Number(val) || 0).toLocaleString('vi-VN')
}

function formatCraftNumberInput(e, field) {
  const item = craftModal.value.item
  if (!item) return
  const target = e.target
  const raw = String(target.value || '').replace(/[^0-9-]/g, '')
  const isNegative = raw.startsWith('-')
  const digits = raw.replace(/-/g, '')
  let numericVal = digits ? Number(digits) : 0
  if (isNegative) numericVal = -numericVal

  item[field] = numericVal

  if (raw === '' || raw === '-') {
    target.value = raw
  } else {
    target.value = numericVal.toLocaleString('vi-VN')
  }
  onCraftFinancialInput(field)
}

const getOfficialReportForCraft = (craftId, fileId = '', explicitSrId = '') => {
  const officials = officialReportsMap.value || {}
  if (explicitSrId && officials[explicitSrId]) {
    return { id: explicitSrId, ...officials[explicitSrId] }
  }
  if (craftId) {
    const keyByCraft = Object.keys(officials).find(k =>
      officials[k] && (officials[k].from_craft === craftId || k === craftId)
    )
    if (keyByCraft) {
      return { id: keyByCraft, ...officials[keyByCraft] }
    }
  }
  if (fileId) {
    // Fallback cho dữ liệu cũ chưa có from_craft
    const keyByFile = Object.keys(officials).find(k =>
      officials[k] &&
      !officials[k].from_craft &&
      (officials[k].id_quanlyfile === fileId || officials[k].id_quan_ly_file === fileId)
    )
    if (keyByFile) {
      return { id: keyByFile, ...officials[keyByFile] }
    }
  }
  return null
}

const getAllCraftReportsForFile = (file) => {
  if (!file) return []
  const crafts = craftReportsMap.value || {}
  const fileId = file.id || ''
  const craftIdsSet = new Set()
  const result = []

  const addCraftByKey = (k) => {
    if (k && crafts[k] && !craftIdsSet.has(k)) {
      craftIdsSet.add(k)
      result.push({ id: k, ...crafts[k] })
    }
  }

  if (Array.isArray(file.craft_ids)) {
    file.craft_ids.forEach(addCraftByKey)
  }
  if (file.id_sale_report_craft) {
    addCraftByKey(file.id_sale_report_craft)
  }

  if (fileId) {
    Object.keys(crafts).forEach(k => {
      const c = crafts[k]
      if (c && (c.id_quanlyfile === fileId || c.id_quan_ly_file === fileId)) {
        addCraftByKey(k)
      }
    })
  }

  return result
}

const getAllOfficialReportsForFile = (file) => {
  if (!file) return []
  const officials = officialReportsMap.value || {}
  const fileId = file.id || ''
  const crafts = getAllCraftReportsForFile(file)
  const craftIdSet = new Set(crafts.map(c => c.id))
  if (file.id_sale_report_craft) craftIdSet.add(file.id_sale_report_craft)
  if (Array.isArray(file.craft_ids)) file.craft_ids.forEach(id => id && craftIdSet.add(id))

  const srIdsSet = new Set()
  const result = []

  const addOfficialByKey = (k) => {
    if (k && officials[k] && !srIdsSet.has(k)) {
      srIdsSet.add(k)
      result.push({ id: k, ...officials[k] })
    }
  }

  if (Array.isArray(file.sale_report_ids)) {
    file.sale_report_ids.forEach(addOfficialByKey)
  }
  if (file.id_sale_report) {
    addOfficialByKey(file.id_sale_report)
  }

  Object.keys(officials).forEach(k => {
    const item = officials[k]
    if (!item) return
    if (fileId && (item.id_quanlyfile === fileId || item.id_quan_ly_file === fileId)) {
      addOfficialByKey(k)
    } else if (item.from_craft && craftIdSet.has(item.from_craft)) {
      addOfficialByKey(k)
    } else if (craftIdSet.has(k)) {
      addOfficialByKey(k)
    }
  })

  return result
}

const getSaleReportStatsForFile = (file) => {
  if (!file) return { total: 0, closed: 0 }
  const resolvedFile = (file === formData.value && editingId.value && !file.id)
    ? { ...file, id: editingId.value }
    : file
  const crafts = getAllCraftReportsForFile(resolvedFile)
  const officials = getAllOfficialReportsForFile(resolvedFile)

  const craftIdSet = new Set(crafts.map(c => c.id))
  const standaloneOfficials = officials.filter(o => !o.from_craft || !craftIdSet.has(o.from_craft))
  let total = crafts.length + standaloneOfficials.length
  if (total === 0 && (resolvedFile.id_sale_report_craft || resolvedFile.id_sale_report)) {
    total = 1
  }

  let closed = 0
  if (officialReportsLoaded.value) {
    closed = officials.length
  } else {
    closed = crafts.filter(c => c.chotDeal).length || (resolvedFile.craft_chotDeal ? 1 : 0)
  }
  if (closed > total) total = closed

  return { total, closed }
}

const compareReportMode = ref('split') // 'split' (Xem phân tách) | 'merged' (Xem gộp)
const parsedExcelGoodsCache = ref({})

const getNormalizedReportsForFile = (file) => {
  if (!file) return []
  const crafts = getAllCraftReportsForFile(file)
  const officials = getAllOfficialReportsForFile(file)
  const craftIdSet = new Set(crafts.map(c => c.id))
  const standaloneOfficials = officials.filter(o => !o.from_craft || !craftIdSet.has(o.from_craft))
  const combined = [...crafts, ...standaloneOfficials]

  const fileAttachList = Array.isArray(file.linkFileBaoGia) ? file.linkFileBaoGia : []
  const imgAttachList = Array.isArray(file.linkImgSave) ? file.linkImgSave : []

  const resolveNameByUrl = (url, explicitName, attachArr, fallback) => {
    if (explicitName && String(explicitName).trim()) return String(explicitName).trim()
    if (!url) return fallback
    const matched = attachArr.find(item => (typeof item === 'string' ? item : item?.url) === url)
    if (matched && typeof matched === 'object' && matched.name) return matched.name
    try {
      const seg = String(url).split('/').pop().split('?')[0]
      return decodeURIComponent(seg) || fallback
    } catch {
      return fallback
    }
  }

  return combined.map((r, idx) => {
    const craftId = (r.is_craft !== false ? (r.id || r.ID) : (r.from_craft || '')) || ''
    const offRep = getOfficialReportForCraft(craftId, file.id || '', r.id_sale_report || (r.is_craft === false ? (r.id || r.ID) : ''))
    const src = offRep || r
    const isClosed = officialReportsLoaded.value ? !!offRep : !!(r.chotDeal || offRep)

    const doanhSoBan = Number(src.Tong_tien_truoc_thueVAT ?? src.doanhSoBan ?? r.Tong_tien_truoc_thueVAT ?? r.doanhSoBan ?? src.goodsTotal?.ttTruoc ?? 0)
    const giaMua = Number(src.Tong_thanh_tien_chua_VAT_mua_hang ?? src.giaMua ?? r.Tong_thanh_tien_chua_VAT_mua_hang ?? 0)
    const tongCP = Number(src.Tong_CP_don_hang ?? src.tongCP ?? r.Tong_CP_don_hang ?? 0)
    const grossCom = Number(src.chiet_khau_tong_truoc_thue ?? src.grossCom ?? r.chiet_khau_tong_truoc_thue ?? 0)
    const taxPct = Number(src.phan_tram_thue_chenh_lech_gia ?? src.taxPct ?? r.phan_tram_thue_chenh_lech_gia ?? 25)
    const thue = grossCom * (taxPct / 100)
    const netCom = Number(src.con_lai ?? src.netCom ?? r.con_lai ?? (grossCom * (1 - taxPct / 100)))
    const netPO = doanhSoBan - grossCom
    const netMargin = doanhSoBan - grossCom - tongCP

    const linkBaoGia = src.link_excel_bao_gia || src.linkBaoGia || r.link_excel_bao_gia || r.linkBaoGia || ''
    const tenFileBG = resolveNameByUrl(linkBaoGia, src.ten_file_bao_gia || src.tenFileBG || r.ten_file_bao_gia || r.tenFileBG, fileAttachList, `BaoGia_${idx + 1}.xlsx`)
    const linkMuaHang = src.link_excel_mua_hang || src.linkMuaHang || r.link_excel_mua_hang || r.linkMuaHang || ''
    const tenFileMH = resolveNameByUrl(linkMuaHang, src.ten_file_mua_hang || src.tenFileMH || r.ten_file_mua_hang || r.tenFileMH, fileAttachList, `MuaHang_${idx + 1}.xlsx`)
    const imgUrl = src.img_save || src.existingImgUrl || r.img_save || r.existingImgUrl || ''
    const tenImg = resolveNameByUrl(imgUrl, '', imgAttachList, `ChungTu_${idx + 1}.jpg`)

    const reportFiles = []
    if (linkBaoGia) reportFiles.push({ url: linkBaoGia, name: tenFileBG, role: 'Báo giá' })
    if (linkMuaHang && linkMuaHang !== linkBaoGia) reportFiles.push({ url: linkMuaHang, name: tenFileMH, role: 'Mua hàng' })
    else if (linkMuaHang && linkMuaHang === linkBaoGia) reportFiles[0].role = 'Báo giá & Mua hàng'

    const reportImages = []
    if (imgUrl) reportImages.push({ url: imgUrl, name: tenImg, role: 'Ảnh chứng từ' })

    // Lấy danh sách hàng hóa (goodsList) từ craft / sale_report / hop_dong_chi_tiet / cache Excel
    const maHD = src.ma_hop_dong || r.ma_hop_dong || ''
    let rawGoods = []
    if (Array.isArray(src.goodsList) && src.goodsList.length > 0) {
      rawGoods = src.goodsList
    } else if (Array.isArray(r.goodsList) && r.goodsList.length > 0) {
      rawGoods = r.goodsList
    } else if (maHD && hdChiTietMap.value && typeof hdChiTietMap.value === 'object') {
      const matchedHdct = []
      Object.keys(hdChiTietMap.value).forEach(k => {
        const item = hdChiTietMap.value[k]
        if (!item) return
        if (Array.isArray(item)) {
          if (item[0] === maHD) {
            matchedHdct.push({
              ten: String(item[3] || ''),
              dienGiai: String(item[9] || ''),
              danhMuc: String(item[10] || ''),
              dvt: String(item[12] || ''),
              donGia: Number(item[13] || 0),
              vatPct: Number(item[17] || 0),
              sl: Number(item[18] || 0)
            })
          }
        } else if (item.ma_hop_dong === maHD) {
          matchedHdct.push({
            ten: String(item.ten_hang || item.ten || ''),
            dienGiai: String(item.dien_giai || item.dienGiai || ''),
            danhMuc: String(item.danh_muc || item.danhMuc || ''),
            dvt: String(item.dvt || ''),
            donGia: Number(item.don_gia ?? item.donGia ?? 0),
            vatPct: Number(item.thue_vat ?? item.vatPct ?? 0),
            sl: Number(item.so_luong ?? item.sl ?? 0)
          })
        }
      })
      rawGoods = matchedHdct
    } else if (linkBaoGia && Array.isArray(parsedExcelGoodsCache.value[linkBaoGia])) {
      rawGoods = parsedExcelGoodsCache.value[linkBaoGia]
    }

    const normalizedGoods = rawGoods.map((g, gIdx) => {
      const sl = Number(g.sl ?? g.so_luong ?? 0)
      const donGia = Number(g.donGia ?? g.don_gia ?? 0)
      const vatPct = Number(g.vatPct ?? g.thue_vat ?? 0)
      const thanhTienTruocVAT = Math.round(sl * donGia)
      const tienVAT = Math.round(thanhTienTruocVAT * (vatPct / 100))
      const thanhTienSauVAT = thanhTienTruocVAT + tienVAT
      return {
        stt: gIdx + 1,
        ten: String(g.ten || g.ten_hang || ''),
        dienGiai: String(g.dienGiai || g.dien_giai || ''),
        danhMuc: String(g.danhMuc || g.danh_muc || ''),
        dvt: String(g.dvt || ''),
        sl,
        donGia,
        vatPct,
        thanhTienTruocVAT,
        tienVAT,
        thanhTienSauVAT
      }
    })

    const computedGoodsTruoc = normalizedGoods.reduce((s, g) => s + g.thanhTienTruocVAT, 0)
    const computedGoodsVat = normalizedGoods.reduce((s, g) => s + g.tienVAT, 0)
    const computedGoodsSau = normalizedGoods.reduce((s, g) => s + g.thanhTienSauVAT, 0)
    const rawGoodsTotal = src.goodsTotal || r.goodsTotal || null
    const resolvedGoodsTotal = rawGoodsTotal
      ? {
          ttTruoc: Number(doanhSoBan || rawGoodsTotal.ttTruoc || computedGoodsTruoc || 0),
          vat: Number(rawGoodsTotal.vat ?? computedGoodsVat ?? 0),
          ttSau: Number((doanhSoBan || rawGoodsTotal.ttTruoc || computedGoodsTruoc || 0) + Number(rawGoodsTotal.vat ?? computedGoodsVat ?? 0))
        }
      : (normalizedGoods.length > 0
          ? { ttTruoc: doanhSoBan || computedGoodsTruoc, vat: computedGoodsVat, ttSau: (doanhSoBan || computedGoodsTruoc) + computedGoodsVat }
          : { ttTruoc: doanhSoBan, vat: Number(src.Thue_VAT ?? r.Thue_VAT ?? 0), ttSau: Number(src.Tong_tien_sau_thueVAT ?? r.Tong_tien_sau_thueVAT ?? doanhSoBan) })

    return {
      key: craftId || offRep?.id || r.id || idx,
      craftId,
      srId: offRep?.id || r.id_sale_report || '',
      chotDeal: isClosed,
      soPO: src.So_PO || src.soPO || r.So_PO || '',
      soHD: src.so_hop_dong || r.so_hop_dong || '',
      maHopDong: maHD,
      productType: src.Ten_nha_cung_cap || src.productType || r.Ten_nha_cung_cap || '',
      am: src.account_manager_name || src.am || r.account_manager_name || '',
      content: src.content_of_contract_PO || src.content || r.content_of_contract_PO || file.noiDung || '',
      createdTime: src.created_time || src.createdTime || r.created_time || r.createdTime || '',
      mst: src.MST || src.mst || r.MST || r.mst || '',
      tenCongTy: src.Ten_cong_ty || src.customer || r.Ten_cong_ty || r.customer || '',
      tenKhachHang: src.Ten_khach_hang || src.recipient || r.Ten_khach_hang || r.recipient || '',
      thueVAT: Number(resolvedGoodsTotal?.vat ?? src.Thue_VAT ?? r.Thue_VAT ?? 0),
      tongTienSauVAT: Number(resolvedGoodsTotal?.ttSau ?? src.Tong_tien_sau_thueVAT ?? r.Tong_tien_sau_thueVAT ?? doanhSoBan),
      predictPct: src.predictPct || r.predictPct || '',
      linkBaoGia,
      tenFileBG,
      linkMuaHang,
      tenFileMH,
      imgUrl,
      files: reportFiles,
      images: reportImages,
      goodsList: normalizedGoods,
      goodsTotal: resolvedGoodsTotal,
      doanhSoBan,
      giaMua,
      tongCP,
      grossCom,
      taxPct,
      thue,
      netCom,
      netPO,
      netMargin,
      netComOverNetPO: netPO !== 0 ? (netCom / netPO) * 100 : 0,
      netMarginOverNetPO: netPO !== 0 ? (netMargin / netPO) * 100 : 0,
      netComOverDSB: doanhSoBan !== 0 ? (netCom / doanhSoBan) * 100 : 0,
      netMarginOverDSB: doanhSoBan !== 0 ? (netMargin / doanhSoBan) * 100 : 0
    }
  })
}

// ═══ SO SÁNH CÁC PHIÊN BẢN SALE REPORT (SỐ LIỆU CHÍNH XÁC - CHIỀU DỌC / CHIỀU NGANG) ═══
const selectedCompareKeys = ref([])
const compareMatrixLayout = ref('vertical') // 'vertical' (Chỉ số theo hàng, Phiên bản theo cột) | 'horizontal' (Phiên bản theo hàng, Chỉ số theo cột)
const compareViewDensity = ref('detailed') // 'detailed' (cụ thể) | 'overview' (tổng quan)
const compareDiffBaselineMode = ref('vs_base')
const showCompareVersionPanel = ref(true)
const showCompareVersionModal = ref(false)

const compareMetricRows = [
  { key: 'doanhSoBan', label: 'Doanh số bán (Trước VAT)', isRatio: false, valColor: '#f8fafc' },
  { key: 'giaMua', label: 'Giá mua (Chưa VAT)', isRatio: false, valColor: '#cbd5e1' },
  { key: 'tongCP', label: 'Tổng CP đơn hàng', isRatio: false, valColor: '#fbbf24' },
  { key: 'grossCom', label: 'Gross com (CK trước thuế)', isRatio: false, valColor: '#f8fafc' },
  { key: 'thue', label: 'Thuế chênh lệch giá', isRatio: false, valColor: '#cbd5e1', showTaxPct: true },
  { key: 'netCom', label: 'Net COM (Còn lại)', isRatio: false, valColor: '#34d399', highlight: 'emerald' },
  { key: 'netPO', label: 'Net PO', isRatio: false, valColor: '#f8fafc' },
  { key: 'netMargin', label: 'Net Margin', isRatio: false, valColor: '#22c55e', highlight: 'margin' },
  { key: 'netComOverNetPO', label: 'Tỷ suất: Net COM / Net PO', isRatio: true, valColor: '#22c55e' },
  { key: 'netMarginOverNetPO', label: 'Tỷ suất: Net Margin / Net PO', isRatio: true, valColor: '#22c55e' },
  { key: 'netComOverDSB', label: 'Tỷ suất: Net COM / DSB', isRatio: true, valColor: '#22c55e' },
  { key: 'netMarginOverDSB', label: 'Tỷ suất: Net Margin / DSB', isRatio: true, valColor: '#22c55e' }
]

const buildMergedReportFromList = (list) => {
  const doanhSoBan = list.reduce((s, x) => s + (Number(x.doanhSoBan) || 0), 0)
  const giaMua = list.reduce((s, x) => s + (Number(x.giaMua) || 0), 0)
  const tongCP = list.reduce((s, x) => s + (Number(x.tongCP) || 0), 0)
  const grossCom = list.reduce((s, x) => s + (Number(x.grossCom) || 0), 0)
  const thue = list.reduce((s, x) => s + (Number(x.thue) || 0), 0)
  const taxPct = grossCom !== 0 ? Number(((thue / grossCom) * 100).toFixed(1)) : (list[0]?.taxPct ?? 25)
  const netCom = list.reduce((s, x) => s + (Number(x.netCom) || 0), 0)
  const netPO = doanhSoBan - grossCom
  const netMargin = doanhSoBan - grossCom - tongCP

  const seenFiles = new Set()
  const filesArr = []
  const seenImgs = new Set()
  const imgsArr = []
  const mergedGoodsList = []
  list.forEach((r, rIdx) => {
    ;(r.files || []).forEach(f => {
      if (f && f.url && !seenFiles.has(f.url)) {
        seenFiles.add(f.url)
        filesArr.push({ ...f, role: list.length > 1 ? `#${rIdx + 1} ${f.role || 'File'}` : (f.role || '') })
      }
    })
    ;(r.images || []).forEach(img => {
      if (img && img.url && !seenImgs.has(img.url)) {
        seenImgs.add(img.url)
        imgsArr.push({ ...img, role: list.length > 1 ? `#${rIdx + 1} Chứng từ` : 'Chứng từ' })
      }
    })
    ;(r.goodsList || []).forEach(g => {
      mergedGoodsList.push({
        ...g,
        stt: mergedGoodsList.length + 1,
        nguonBaoCao: r.soPO ? `PO ${r.soPO}` : `Báo cáo #${rIdx + 1}`
      })
    })
  })

  const mergedGoodsTotal = {
    ttTruoc: list.reduce((s, x) => s + (Number(x.goodsTotal?.ttTruoc ?? x.doanhSoBan) || 0), 0),
    vat: list.reduce((s, x) => s + (Number(x.goodsTotal?.vat ?? x.thueVAT) || 0), 0),
    ttSau: list.reduce((s, x) => s + (Number(x.goodsTotal?.ttSau ?? x.tongTienSauVAT ?? x.doanhSoBan) || 0), 0)
  }

  return {
    key: 'merged',
    chotDeal: list.some(x => x.chotDeal),
    soPO: list.map((x, i) => x.soPO ? `PO ${x.soPO}` : `#${i + 1}`).join(' + '),
    soHD: Array.from(new Set(list.map(x => x.soHD).filter(Boolean))).join(', '),
    productType: Array.from(new Set(list.map(x => x.productType).filter(Boolean))).join(', '),
    am: Array.from(new Set(list.map(x => x.am).filter(Boolean))).join(', '),
    files: filesArr,
    images: imgsArr,
    goodsList: mergedGoodsList,
    goodsTotal: mergedGoodsTotal,
    doanhSoBan,
    giaMua,
    tongCP,
    grossCom,
    taxPct,
    thue,
    netCom,
    netPO,
    netMargin,
    netComOverNetPO: netPO !== 0 ? (netCom / netPO) * 100 : 0,
    netMarginOverNetPO: netPO !== 0 ? (netMargin / netPO) * 100 : 0,
    netComOverDSB: doanhSoBan !== 0 ? (netCom / doanhSoBan) * 100 : 0,
    netMarginOverDSB: doanhSoBan !== 0 ? (netMargin / doanhSoBan) * 100 : 0
  }
}

const resolveCompareKeyInfo = (selKey) => {
  if (!selKey || typeof selKey !== 'string') return null
  const parts = selKey.split('::')
  const fileId = parts[0]
  const mode = parts[1]
  const repKey = parts.slice(2).join('::')

  const file = files.value.find(f => String(f.id) === String(fileId))
  if (!file) return null
  const reps = getNormalizedReportsForFile(file)
  if (!reps || reps.length === 0) return null

  const cus = customers.value.find(c => c.ma_khach_hang === file.maKH)
  const customerName = cus ? (cus.ten_khach_hang || cus.ten_cong_ty || file.maKH) : (file.maKH || '')
  const cardSnippet = file.noiDung ? (file.noiDung.length > 36 ? file.noiDung.slice(0, 36) + '...' : file.noiDung) : `Hồ sơ #${file.id}`

  if (mode === 'merged') {
    const merged = buildMergedReportFromList(reps)
    return {
      selKey,
      file,
      customerName,
      isMerged: true,
      tabIndex: 0,
      title: `Tổng gộp (${reps.length} BC)`,
      subTitle: cardSnippet,
      report: merged
    }
  }

  let rIdx = reps.findIndex((r, idx) => String(r.key ?? idx) === String(repKey))
  if (rIdx < 0) {
    const parsedIdx = Number(repKey)
    if (!Number.isNaN(parsedIdx) && reps[parsedIdx]) rIdx = parsedIdx
  }
  if (rIdx < 0) return null

  const rep = reps[rIdx]
  return {
    selKey,
    file,
    customerName,
    isMerged: false,
    tabIndex: rIdx,
    title: rep.soPO ? `PO: ${rep.soPO}` : `Báo cáo #${rIdx + 1}`,
    subTitle: cardSnippet,
    report: rep
  }
}

const selectedCompareItems = computed(() => {
  const result = []
  selectedCompareKeys.value.forEach(k => {
    const info = resolveCompareKeyInfo(k)
    if (info) {
      result.push({
        ...info,
        order: result.length + 1
      })
    }
  })
  return result
})

const toggleSelectCompareKey = (selKey) => {
  if (!selKey) return
  const idx = selectedCompareKeys.value.indexOf(selKey)
  if (idx >= 0) {
    selectedCompareKeys.value.splice(idx, 1)
  } else {
    selectedCompareKeys.value.push(selKey)
    showCompareVersionPanel.value = true
  }
}

const handleSelectCardReportsCompare = ({ keys, allSelected }) => {
  if (!Array.isArray(keys) || keys.length === 0) return
  if (allSelected) {
    selectedCompareKeys.value = selectedCompareKeys.value.filter(k => !keys.includes(k))
  } else {
    keys.forEach(k => {
      if (!selectedCompareKeys.value.includes(k)) {
        selectedCompareKeys.value.push(k)
      }
    })
    showCompareVersionPanel.value = true
  }
}

const setCompareKeyAsBase = (selKey) => {
  const idx = selectedCompareKeys.value.indexOf(selKey)
  if (idx > 0) {
    const [picked] = selectedCompareKeys.value.splice(idx, 1)
    selectedCompareKeys.value.unshift(picked)
  }
}

const clearSelectedCompareKeys = () => {
  selectedCompareKeys.value = []
  showCompareVersionModal.value = false
}

const getCustomerAllCompareKeys = (tree) => {
  if (!tree) return []
  const keys = []
  const walk = (nodes) => {
    ;(nodes || []).forEach(n => {
      const reps = getNormalizedReportsForFile(n)
      if (compareReportMode.value === 'merged' && reps.length > 1) {
        keys.push(`${n.id}::merged`)
      } else {
        reps.forEach((r, rIdx) => {
          keys.push(`${n.id}::rep::${r.key ?? rIdx}`)
        })
      }
      if (n.children && n.children.length > 0) walk(n.children)
    })
  }
  walk(tree.roots || [])
  return keys
}

const areAllCustomerReportsSelected = (tree) => {
  const keys = getCustomerAllCompareKeys(tree)
  if (keys.length < 2) return false
  return keys.every(k => selectedCompareKeys.value.includes(k))
}

const toggleSelectAllCustomerReports = (tree) => {
  const keys = getCustomerAllCompareKeys(tree)
  if (keys.length === 0) return
  const allSel = keys.every(k => selectedCompareKeys.value.includes(k))
  if (allSel) {
    selectedCompareKeys.value = selectedCompareKeys.value.filter(k => !keys.includes(k))
  } else {
    keys.forEach(k => {
      if (!selectedCompareKeys.value.includes(k)) {
        selectedCompareKeys.value.push(k)
      }
    })
    showCompareVersionPanel.value = true
  }
}

const getReferenceReportForKey = (selKey) => {
  const items = selectedCompareItems.value
  const idx = items.findIndex(it => it.selKey === selKey)
  if (idx <= 0) return null
  const refItem = compareDiffBaselineMode.value === 'vs_prev' ? items[idx - 1] : items[0]
  if (!refItem) return null
  return {
    report: refItem.report,
    refLabel: `#${refItem.order} (${refItem.title})`
  }
}

const fmtComparePct = (val) => {
  const n = Number(val) || 0
  if (n === 0) return '0%'
  return n.toFixed(2) + '%'
}

const calcVersionMetricDiff = (currItem, idx, field, isRatio = false) => {
  if (idx <= 0 || !currItem || !currItem.report) return null
  const items = selectedCompareItems.value
  const refItem = compareDiffBaselineMode.value === 'vs_prev' ? items[idx - 1] : items[0]
  if (!refItem || !refItem.report) return null

  const baseVal = Number(refItem.report[field]) || 0
  const currVal = Number(currItem.report[field]) || 0
  const delta = currVal - baseVal

  if (Math.abs(delta) < 0.0001) {
    return {
      delta: 0,
      pct: 0,
      pctText: '0.00%',
      deltaText: isRatio ? '0.00 đpt' : '0 đ',
      dir: 'flat',
      refLabel: `#${refItem.order}`
    }
  }

  let pct = 0
  let pctText = ''
  if (Math.abs(baseVal) < 0.0001) {
    pct = currVal > 0 ? 100 : -100
    pctText = currVal > 0 ? '+Mới' : '-100%'
  } else {
    pct = ((currVal - baseVal) / Math.abs(baseVal)) * 100
    const sign = pct > 0 ? '+' : ''
    pctText = `${sign}${pct.toFixed(2)}%`
  }

  const deltaText = isRatio
    ? `${delta >= 0 ? '+' : ''}${delta.toFixed(2)} đpt`
    : `${delta >= 0 ? '+' : ''}${craftFmt(delta)} đ`

  return {
    delta,
    pct,
    pctText,
    deltaText,
    dir: delta > 0 ? 'up' : 'down',
    refLabel: `#${refItem.order}`
  }
}

// ════════════════════════════════════════════════════════════════
// XUẤT FILE JSON DỮ LIỆU TÀI CHÍNH & HÀNG HÓA (THEO CARD / KHÁCH HÀNG / TOÀN BỘ)
// ════════════════════════════════════════════════════════════════
const isJsonExportModalOpen = ref(false)
const jsonExportScope = ref('chain') // 'chain' | 'card' | 'customer' | 'all'
const jsonAllDataSource = ref('filtered') // 'filtered' | 'system'
const jsonOnlyWithFinanceOrGoods = ref(false)
const jsonIncludeLinkedChildren = ref(true)
const jsonChainSearch = ref('')
const focusedChainRootId = ref('')
const jsonCustomerSearch = ref('')
const jsonCardSearch = ref('')
const jsonCardCustomerFilter = ref('')
const jsonSelectedCustomerIds = ref([])
const jsonSelectedCardIds = ref([])
const selectedPageJsonCardIds = ref([])
const isExportingJson = ref(false)

const isExcelUrl = (urlOrName = '') => {
  const lower = String(urlOrName || '').toLowerCase().split('?')[0]
  return lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')
}

const extractGoodsFromExcelUrl = async (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') return []
  if (Array.isArray(parsedExcelGoodsCache.value[fileUrl])) {
    return parsedExcelGoodsCache.value[fileUrl]
  }
  try {
    const res = await fetch(fileUrl)
    if (!res.ok) return []
    const ab = await res.arrayBuffer()
    const wb = XLSX.read(ab, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    if (!ws) return []
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })
    let headerRowIdx = -1, sttIdx = -1, tenIdx = -1, dvtIdx = -1, slIdx = -1, dgIdx = -1
    const goodsList = []
    let currentCategory = ''
    const isTotalKeyword = (text) => {
      const u = String(text || '').toUpperCase().replace(/\s+/g, ' ').trim()
      return u.includes('TỔNG CỘNG') || u.includes('TOTAL') || u.includes('TỔNG TIỀN') || u.includes('TỔNG GIÁ TRỊ') || u.includes('GRAND TOTAL') || (u.includes('TỔNG') && !u.includes('TỔNG CP') && u.length < 30) || u === 'CỘNG'
    }
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row) continue
      if (headerRowIdx === -1) {
        for (let j = 0; j < row.length; j++) {
          const v = String(row[j] || '').toLowerCase().trim()
          if (v === 'stt' || v === 'no' || v === 'no.') sttIdx = j
          if (v.includes('tên') || v.includes('mô tả') || v.includes('diễn giải') || v.includes('hàng hóa') || v.includes('description')) tenIdx = j
          if (v.includes('đơn vị') || v === 'dvt' || v === 'unit') dvtIdx = j
          if (v.includes('số lượng') || v === 'sl' || v === 'qty') slIdx = j
          if ((v.includes('đơn giá') || v.includes('unit price')) && !v.includes('thành')) dgIdx = j
        }
        if (sttIdx !== -1 || tenIdx !== -1 || slIdx !== -1 || dgIdx !== -1) {
          headerRowIdx = i
          if (tenIdx === -1 && sttIdx !== -1) tenIdx = sttIdx + 1
        }
      } else if (i > headerRowIdx) {
        if (row.some(c => isTotalKeyword(c))) break
        const ten = tenIdx >= 0 ? String(row[tenIdx] || '').trim() : ''
        const sl = slIdx >= 0 ? parseFloat(String(row[slIdx] || '0').replace(/,/g, '')) || 0 : 0
        const dg = dgIdx >= 0 ? parseFloat(String(row[dgIdx] || '0').replace(/,/g, '')) || 0 : 0
        const dvt = dvtIdx >= 0 ? String(row[dvtIdx] || '').trim() : ''
        if (ten && (sl > 0 || dg > 0)) {
          goodsList.push({
            ten,
            dvt,
            sl: sl || 1,
            donGia: dg,
            dienGiai: '',
            danhMuc: currentCategory,
            vatPct: 0
          })
        } else if (ten && sl === 0 && dg === 0 && ten.length > 2 && !ten.toUpperCase().includes('CỘNG')) {
          currentCategory = ten
        }
      }
    }
    parsedExcelGoodsCache.value = {
      ...parsedExcelGoodsCache.value,
      [fileUrl]: goodsList
    }
    return goodsList
  } catch (err) {
    console.warn('[JSON Export] Không thể đọc hàng hóa từ file Excel:', fileUrl, err)
    return []
  }
}

const ensureGoodsLoadedForCards = async (cardList = []) => {
  const urlsToFetch = new Set()
  cardList.forEach(card => {
    if (!card) return
    const reps = getNormalizedReportsForFile(card)
    reps.forEach(r => {
      if ((!r.goodsList || r.goodsList.length === 0) && r.linkBaoGia && isExcelUrl(r.linkBaoGia || r.tenFileBG)) {
        if (!Array.isArray(parsedExcelGoodsCache.value[r.linkBaoGia])) {
          urlsToFetch.add(r.linkBaoGia)
        }
      }
    })
    if (reps.length === 0 && Array.isArray(card.linkFileBaoGia)) {
      card.linkFileBaoGia.forEach(item => {
        const url = typeof item === 'string' ? item : item?.url
        const name = typeof item === 'object' ? item?.name : url
        if (url && isExcelUrl(name || url) && !Array.isArray(parsedExcelGoodsCache.value[url])) {
          urlsToFetch.add(url)
        }
      })
    }
  })
  if (urlsToFetch.size > 0) {
    await Promise.all(Array.from(urlsToFetch).map(u => extractGoodsFromExcelUrl(u)))
  }
}

const getCardFallbackGoodsList = (card) => {
  if (!card) return []
  const attachList = Array.isArray(card.linkFileBaoGia) ? card.linkFileBaoGia : []
  const collected = []
  attachList.forEach(item => {
    const url = typeof item === 'string' ? item : item?.url
    if (url && Array.isArray(parsedExcelGoodsCache.value[url])) {
      parsedExcelGoodsCache.value[url].forEach(g => {
        const sl = Number(g.sl ?? 0)
        const donGia = Number(g.donGia ?? 0)
        const vatPct = Number(g.vatPct ?? 0)
        const thanhTienTruocVAT = Math.round(sl * donGia)
        const tienVAT = Math.round(thanhTienTruocVAT * (vatPct / 100))
        collected.push({
          stt: collected.length + 1,
          ten: String(g.ten || ''),
          dienGiai: String(g.dienGiai || ''),
          danhMuc: String(g.danhMuc || ''),
          dvt: String(g.dvt || ''),
          sl,
          donGia,
          vatPct,
          thanhTienTruocVAT,
          tienVAT,
          thanhTienSauVAT: thanhTienTruocVAT + tienVAT
        })
      })
    }
  })
  return collected
}

const getCardMetricsAndGoodsSummary = (card) => {
  if (!card) {
    return {
      reports: [],
      reportsCount: 0,
      closedReportsCount: 0,
      goodsList: [],
      goodsCount: 0,
      doanhSoBan: 0,
      thueVAT: 0,
      tongTienSauVAT: 0,
      giaMua: 0,
      tongCP: 0,
      grossCom: 0,
      taxPct: 25,
      thue: 0,
      netCom: 0,
      netPO: 0,
      netMargin: 0,
      netComOverNetPO: 0,
      netMarginOverNetPO: 0,
      netComOverDSB: 0,
      netMarginOverDSB: 0,
      poSummary: ''
    }
  }
  const reps = getNormalizedReportsForFile(card)
  const closedReportsCount = reps.filter(r => r.chotDeal).length
  const doanhSoBan = reps.reduce((s, r) => s + (Number(r.doanhSoBan) || 0), 0)
  const thueVAT = reps.reduce((s, r) => s + (Number(r.thueVAT) || 0), 0)
  const tongTienSauVAT = reps.reduce((s, r) => s + (Number(r.tongTienSauVAT) || 0), 0)
  const giaMua = reps.reduce((s, r) => s + (Number(r.giaMua) || 0), 0)
  const tongCP = reps.reduce((s, r) => s + (Number(r.tongCP) || 0), 0)
  const grossCom = reps.reduce((s, r) => s + (Number(r.grossCom) || 0), 0)
  const thue = reps.reduce((s, r) => s + (Number(r.thue) || 0), 0)
  const taxPct = grossCom !== 0 ? Number(((thue / grossCom) * 100).toFixed(2)) : (reps[0]?.taxPct ?? 25)
  const netCom = reps.reduce((s, r) => s + (Number(r.netCom) || 0), 0)
  const netPO = doanhSoBan - grossCom
  const netMargin = doanhSoBan - grossCom - tongCP

  const flatGoods = []
  reps.forEach((r, rIdx) => {
    ;(r.goodsList || []).forEach(g => {
      flatGoods.push({
        ...g,
        stt: flatGoods.length + 1,
        nguonBaoCao: r.soPO ? `PO ${r.soPO}` : `Báo cáo #${rIdx + 1}`,
        soPO: r.soPO || '',
        soHD: r.soHD || '',
        maHopDong: r.maHopDong || ''
      })
    })
  })

  if (flatGoods.length === 0) {
    const fallback = getCardFallbackGoodsList(card)
    fallback.forEach(g => {
      flatGoods.push({
        ...g,
        stt: flatGoods.length + 1,
        nguonBaoCao: 'File Excel đính kèm',
        soPO: '',
        soHD: '',
        maHopDong: ''
      })
    })
  }

  const poArr = reps.map(r => r.soPO ? `PO: ${r.soPO}` : (r.soHD ? `HĐ: ${r.soHD}` : '')).filter(Boolean)

  return {
    reports: reps,
    reportsCount: reps.length,
    closedReportsCount,
    goodsList: flatGoods,
    goodsCount: flatGoods.length,
    doanhSoBan,
    thueVAT,
    tongTienSauVAT,
    giaMua,
    tongCP,
    grossCom,
    taxPct,
    thue,
    netCom,
    netPO,
    netMargin,
    netComOverNetPO: netPO !== 0 ? Number(((netCom / netPO) * 100).toFixed(2)) : 0,
    netMarginOverNetPO: netPO !== 0 ? Number(((netMargin / netPO) * 100).toFixed(2)) : 0,
    netComOverDSB: doanhSoBan !== 0 ? Number(((netCom / doanhSoBan) * 100).toFixed(2)) : 0,
    netMarginOverDSB: doanhSoBan !== 0 ? Number(((netMargin / doanhSoBan) * 100).toFixed(2)) : 0,
    poSummary: poArr.join(' · ')
  }
}

// ════════════════════════════════════════════════════════════════
// XÂY DỰNG DANH SÁCH CÁC CHUỖI CARD LIÊN KẾT TOÀN HỆ THỐNG
// ════════════════════════════════════════════════════════════════
const allLinkedChains = computed(() => {
  const allCards = files.value || []
  if (allCards.length === 0) return []

  const nodeMap = {}
  allCards.forEach(f => {
    nodeMap[f.id] = { ...f, rawCard: f, children: [] }
  })

  const roots = []
  allCards.forEach(f => {
    if (f.idPrevious && nodeMap[f.idPrevious] && f.idPrevious !== f.id) {
      nodeMap[f.idPrevious].children.push(nodeMap[f.id])
    } else {
      roots.push(nodeMap[f.id])
    }
  })

  const sortChildrenChronological = (nodes) => {
    nodes.forEach(n => {
      n.children.sort((a, b) => (a.createdTime || 0) - (b.createdTime || 0))
      sortChildrenChronological(n.children)
    })
  }
  roots.sort((a, b) => (b.createdTime || 0) - (a.createdTime || 0))
  sortChildrenChronological(roots)

  const chains = []
  roots.forEach(root => {
    const isLinked = (root.children && root.children.length > 0) || !!root.idPrevious
    if (!isLinked) return

    const nodes = []
    const walk = (curr, depth) => {
      const cardObj = curr.rawCard || curr
      const summary = getCardMetricsAndGoodsSummary(cardObj)
      nodes.push({
        card: cardObj,
        stepIndex: nodes.length + 1,
        depth,
        summary
      })
      ;(curr.children || []).forEach(ch => walk(ch, depth + 1))
    }
    walk(root, 0)

    const cus = (customers.value || []).find(c => c.ma_khach_hang === root.maKH) || null
    const customerName = cus ? (cus.ten_khach_hang || cus.ten_cong_ty || root.maKH) : (root.maKH || 'Khách hàng')

    let totalReports = 0
    let closedReports = 0
    let totalGoods = 0
    let doanhSoBan = 0
    let thueVAT = 0
    let giaMua = 0
    let tongCP = 0
    let grossCom = 0
    let thue = 0
    let netCom = 0

    nodes.forEach(n => {
      totalReports += n.summary.reportsCount
      closedReports += n.summary.closedReportsCount
      totalGoods += n.summary.goodsCount
      doanhSoBan += n.summary.doanhSoBan
      thueVAT += n.summary.thueVAT
      giaMua += n.summary.giaMua
      tongCP += n.summary.tongCP
      grossCom += n.summary.grossCom
      thue += n.summary.thue
      netCom += n.summary.netCom
    })

    const netPO = doanhSoBan - grossCom
    const netMargin = doanhSoBan - grossCom - tongCP

    chains.push({
      chainId: root.id,
      rootCard: root.rawCard || root,
      customer: cus,
      customerName,
      nodes,
      cards: nodes.map(n => n.card),
      totalCards: nodes.length,
      totalReports,
      closedReports,
      totalGoods,
      doanhSoBan,
      thueVAT,
      giaMua,
      tongCP,
      grossCom,
      thue,
      netCom,
      netPO,
      netMargin
    })
  })

  return chains
})

const cardChainMap = computed(() => {
  const map = {}
  allLinkedChains.value.forEach(chain => {
    chain.nodes.forEach(n => {
      map[n.card.id] = {
        chain,
        rootId: chain.chainId,
        stepIndex: n.stepIndex,
        depth: n.depth,
        totalCards: chain.totalCards
      }
    })
  })
  return map
})

const getChainInfoForCard = (card) => {
  const id = typeof card === 'string' ? card : card?.id
  if (!id) return null
  return cardChainMap.value[id] || null
}

const getChainCardsFromTreeRoot = (node) => {
  if (!node) return []
  const info = getChainInfoForCard(node)
  if (info && info.chain && Array.isArray(info.chain.cards) && info.chain.cards.length > 0) {
    return info.chain.cards
  }
  return collectAllNodesFromRoot(node, [])
}

const getChainFlowPreviewText = (node) => {
  const cards = getChainCardsFromTreeRoot(node)
  if (!cards.length) return ''
  return cards
    .map((c, idx) => `#${idx + 1} (${formatCardDate(c.createdTime)}): ${String(c.noiDung || 'Hồ sơ').slice(0, 26)}`)
    .join(' ➔ ')
}

const jsonFilteredChains = computed(() => {
  const q = (jsonChainSearch.value || '').trim().toLowerCase()
  const cusFilter = jsonCardCustomerFilter.value || ''
  const focusRoot = focusedChainRootId.value || ''

  return allLinkedChains.value.filter(chain => {
    if (focusRoot && chain.chainId !== focusRoot) return false
    if (cusFilter && chain.rootCard.maKH !== cusFilter) return false
    if (jsonOnlyWithFinanceOrGoods.value && chain.totalReports === 0 && chain.totalGoods === 0) {
      return false
    }
    if (q) {
      const matchCus = String(chain.customerName || '').toLowerCase().includes(q) || String(chain.rootCard.maKH || '').toLowerCase().includes(q)
      const matchAnyNode = chain.nodes.some(n => {
        const c = n.card
        return (
          String(c.id || '').toLowerCase().includes(q) ||
          String(c.noiDung || '').toLowerCase().includes(q) ||
          String(c.ghiChu || '').toLowerCase().includes(q) ||
          String(n.summary.poSummary || '').toLowerCase().includes(q)
        )
      })
      if (!matchCus && !matchAnyNode) return false
    }
    return true
  })
})

const totalCardsInFilteredChains = computed(() => {
  return jsonFilteredChains.value.reduce((s, ch) => s + ch.totalCards, 0)
})

const compareOverviewStats = computed(() => {
  let totalCards = 0
  let totalReports = 0
  let totalGoods = 0
  const walk = (nodes) => {
    ;(nodes || []).forEach(n => {
      totalCards++
      const summary = getCardMetricsAndGoodsSummary(n)
      totalReports += summary.reportsCount
      totalGoods += summary.goodsCount
      if (n.children && n.children.length > 0) walk(n.children)
    })
  }
  ;(customerTrees.value || []).forEach(tree => {
    walk(tree.roots || [])
  })
  return { totalCards, totalReports, totalGoods }
})

const jsonAllSummary = computed(() => {
  const baseFiles = jsonAllDataSource.value === 'system' ? (files.value || []) : (filteredFiles.value || [])
  const activeCards = jsonOnlyWithFinanceOrGoods.value
    ? baseFiles.filter(f => {
        const s = getCardMetricsAndGoodsSummary(f)
        return s.reportsCount > 0 || s.goodsCount > 0
      })
    : baseFiles

  const cusSet = new Set()
  let totalReports = 0
  let closedReports = 0
  let totalGoods = 0
  let doanhSoBan = 0
  let giaMua = 0
  let tongCP = 0
  let grossCom = 0
  let thue = 0
  let netCom = 0

  activeCards.forEach(f => {
    if (f.maKH) cusSet.add(f.maKH)
    const s = getCardMetricsAndGoodsSummary(f)
    totalReports += s.reportsCount
    closedReports += s.closedReportsCount
    totalGoods += s.goodsCount
    doanhSoBan += s.doanhSoBan
    giaMua += s.giaMua
    tongCP += s.tongCP
    grossCom += s.grossCom
    thue += s.thue
    netCom += s.netCom
  })

  const netPO = doanhSoBan - grossCom
  const netMargin = doanhSoBan - grossCom - tongCP

  return {
    totalCustomers: cusSet.size,
    totalCards: activeCards.length,
    totalReports,
    closedReports,
    totalGoods,
    doanhSoBan,
    giaMua,
    tongCP,
    grossCom,
    thue,
    netCom,
    netPO,
    netMargin
  }
})

const jsonFilteredCustomers = computed(() => {
  const q = (jsonCustomerSearch.value || '').trim().toLowerCase()
  const list = []

  ;(customers.value || []).forEach(cus => {
    const cusCards = (files.value || []).filter(f => f.maKH === cus.ma_khach_hang)
    if (cusCards.length === 0) return

    let totalReports = 0
    let closedReports = 0
    let totalGoods = 0
    let doanhSoBan = 0
    let giaMua = 0
    let tongCP = 0
    let grossCom = 0
    let thue = 0
    let netCom = 0

    cusCards.forEach(c => {
      const s = getCardMetricsAndGoodsSummary(c)
      totalReports += s.reportsCount
      closedReports += s.closedReportsCount
      totalGoods += s.goodsCount
      doanhSoBan += s.doanhSoBan
      giaMua += s.giaMua
      tongCP += s.tongCP
      grossCom += s.grossCom
      thue += s.thue
      netCom += s.netCom
    })

    if (jsonOnlyWithFinanceOrGoods.value && totalReports === 0 && totalGoods === 0) {
      return
    }

    if (q) {
      const matchName = String(cus.ten_khach_hang || '').toLowerCase().includes(q)
      const matchComp = String(cus.ten_cong_ty || '').toLowerCase().includes(q)
      const matchCode = String(cus.ma_khach_hang || '').toLowerCase().includes(q)
      const matchMst = String(cus.mst || '').toLowerCase().includes(q)
      if (!matchName && !matchComp && !matchCode && !matchMst) return
    }

    const netPO = doanhSoBan - grossCom
    const netMargin = doanhSoBan - grossCom - tongCP

    list.push({
      customer: cus,
      cards: cusCards,
      totalCards: cusCards.length,
      totalReports,
      closedReports,
      totalGoods,
      doanhSoBan,
      giaMua,
      tongCP,
      grossCom,
      thue,
      netCom,
      netPO,
      netMargin
    })
  })

  return list.sort((a, b) => b.doanhSoBan - a.doanhSoBan || b.totalCards - a.totalCards)
})

const isAllJsonCustomersSelected = computed(() => {
  if (jsonFilteredCustomers.value.length === 0) return false
  return jsonFilteredCustomers.value.every(it => jsonSelectedCustomerIds.value.includes(it.customer.ma_khach_hang))
})

const jsonFilteredCards = computed(() => {
  const q = (jsonCardSearch.value || '').trim().toLowerCase()
  const cusFilter = jsonCardCustomerFilter.value || ''
  const rows = []

  ;(files.value || []).forEach(card => {
    if (cusFilter && card.maKH !== cusFilter) return
    const s = getCardMetricsAndGoodsSummary(card)
    if (jsonOnlyWithFinanceOrGoods.value && s.reportsCount === 0 && s.goodsCount === 0) {
      return
    }
    const cus = (customers.value || []).find(c => c.ma_khach_hang === card.maKH)
    const customerName = cus ? (cus.ten_khach_hang || cus.ten_cong_ty || card.maKH) : (card.maKH || 'Khách hàng')
    const chainInfo = getChainInfoForCard(card)

    if (q) {
      const matchId = String(card.id || '').toLowerCase().includes(q)
      const matchContent = String(card.noiDung || '').toLowerCase().includes(q)
      const matchNote = String(card.ghiChu || '').toLowerCase().includes(q)
      const matchCus = String(customerName || '').toLowerCase().includes(q) || String(card.maKH || '').toLowerCase().includes(q)
      const matchPo = String(s.poSummary || '').toLowerCase().includes(q)
      if (!matchId && !matchContent && !matchNote && !matchCus && !matchPo) return
    }

    rows.push({
      card,
      customer: cus || null,
      customerName,
      chainInfo,
      poSummary: s.poSummary,
      reportsCount: s.reportsCount,
      goodsCount: s.goodsCount,
      doanhSoBan: s.doanhSoBan,
      netMargin: s.netMargin
    })
  })

  return rows
})

const isAllJsonCardsSelected = computed(() => {
  if (jsonFilteredCards.value.length === 0) return false
  return jsonFilteredCards.value.every(r => jsonSelectedCardIds.value.includes(r.card.id))
})

const canSubmitJsonModalExport = computed(() => {
  if (jsonExportScope.value === 'all') return jsonAllSummary.value.totalCards > 0
  if (jsonExportScope.value === 'customer') return jsonSelectedCustomerIds.value.length > 0
  if (jsonExportScope.value === 'chain' || jsonExportScope.value === 'card') return jsonSelectedCardIds.value.length > 0
  return false
})

const jsonModalPrimaryBtnLabel = computed(() => {
  if (isExportingJson.value) return 'Đang đóng gói & tải file JSON...'
  if (jsonExportScope.value === 'all') {
    return `Tải JSON Toàn Bộ (${jsonAllSummary.value.totalCustomers} KH · ${jsonAllSummary.value.totalCards} Card)`
  }
  if (jsonExportScope.value === 'customer') {
    return `Tải JSON (${jsonSelectedCustomerIds.value.length} Khách Hàng đã chọn)`
  }
  if (jsonExportScope.value === 'chain') {
    return `Tải JSON Chuỗi Liên Kết (${jsonSelectedCardIds.value.length} Card đã chọn)`
  }
  if (jsonExportScope.value === 'card') {
    return `Tải JSON (${jsonSelectedCardIds.value.length} Card đã chọn)`
  }
  return 'Tải File JSON'
})

const openJsonExportModal = (defaultScope = 'chain') => {
  jsonExportScope.value = defaultScope || 'chain'
  jsonAllDataSource.value = 'filtered'
  jsonOnlyWithFinanceOrGoods.value = false
  focusedChainRootId.value = ''
  jsonChainSearch.value = ''
  jsonCustomerSearch.value = ''
  jsonCardSearch.value = ''
  jsonCardCustomerFilter.value = filterCustomer.value || ''

  // Mặc định chọn các khách hàng đang hiển thị trong bộ lọc hiện tại
  const currentTreeMaKHs = (customerTrees.value || []).map(t => t.customer.ma_khach_hang).filter(Boolean)
  jsonSelectedCustomerIds.value = currentTreeMaKHs.length > 0
    ? [...currentTreeMaKHs]
    : jsonFilteredCustomers.value.map(c => c.customer.ma_khach_hang)

  // Nếu người dùng đã tích chọn các card trên trang thì ưu tiên lấy danh sách đó
  if (selectedPageJsonCardIds.value.length > 0) {
    jsonSelectedCardIds.value = [...selectedPageJsonCardIds.value]
  } else if (defaultScope === 'chain') {
    const chainCardIds = []
    jsonFilteredChains.value.forEach(ch => {
      ch.cards.forEach(c => chainCardIds.push(c.id))
    })
    jsonSelectedCardIds.value = Array.from(new Set(chainCardIds))
  } else {
    const currentCardIds = (filteredFiles.value || []).map(f => f.id).filter(Boolean)
    jsonSelectedCardIds.value = currentCardIds.length > 0
      ? [...currentCardIds]
      : jsonFilteredCards.value.map(r => r.card.id)
  }

  isJsonExportModalOpen.value = true
}

// Mở modal tập trung vào 1 chuỗi liên kết cụ thể để người dùng chọn card trong chuỗi
const openChainCardPickerModal = (nodeOrCard, customer = null) => {
  const card = nodeOrCard?.node || nodeOrCard
  if (!card) return
  const info = getChainInfoForCard(card)
  const chainCards = info?.chain?.cards || collectAllNodesFromRoot(card, [])

  jsonExportScope.value = 'chain'
  jsonOnlyWithFinanceOrGoods.value = false
  jsonChainSearch.value = ''
  jsonCardCustomerFilter.value = ''
  focusedChainRootId.value = info?.rootId || card.id
  jsonSelectedCardIds.value = chainCards.map(c => c.id)
  isJsonExportModalOpen.value = true
}

const openModalWithPageSelectedCards = () => {
  jsonExportScope.value = 'card'
  jsonOnlyWithFinanceOrGoods.value = false
  focusedChainRootId.value = ''
  jsonCardSearch.value = ''
  jsonCardCustomerFilter.value = ''
  jsonSelectedCardIds.value = [...selectedPageJsonCardIds.value]
  isJsonExportModalOpen.value = true
}

const closeJsonExportModal = () => {
  if (isExportingJson.value) return
  isJsonExportModalOpen.value = false
}

// ═══ CÁC HÀM CHỌN CARD / CHUỖI TRỰC TIẾP TRÊN TRANG & TRONG MODAL ═══
const getPageJsonCardSelectionOrder = (cardId) => {
  if (!cardId) return 0
  const idx = selectedPageJsonCardIds.value.indexOf(cardId)
  return idx >= 0 ? idx + 1 : 0
}

const toggleSelectPageJsonCard = (cardId) => {
  if (!cardId) return
  const idx = selectedPageJsonCardIds.value.indexOf(cardId)
  if (idx >= 0) {
    selectedPageJsonCardIds.value.splice(idx, 1)
  } else {
    selectedPageJsonCardIds.value.push(cardId)
  }
}

const areAllChainCardsSelectedOnPage = (rootNode) => {
  const cards = getChainCardsFromTreeRoot(rootNode)
  if (cards.length === 0) return false
  return cards.every(c => selectedPageJsonCardIds.value.includes(c.id))
}

const toggleSelectFullChainOnPage = (rootNode) => {
  const cards = getChainCardsFromTreeRoot(rootNode)
  const ids = cards.map(c => c.id).filter(Boolean)
  if (ids.length === 0) return
  const allSelected = ids.every(id => selectedPageJsonCardIds.value.includes(id))
  if (allSelected) {
    const removeSet = new Set(ids)
    selectedPageJsonCardIds.value = selectedPageJsonCardIds.value.filter(id => !removeSet.has(id))
  } else {
    selectedPageJsonCardIds.value = Array.from(new Set([...selectedPageJsonCardIds.value, ...ids]))
  }
}

const canExpandPageSelectionToFullChain = computed(() => {
  if (selectedPageJsonCardIds.value.length === 0) return false
  const selectedSet = new Set(selectedPageJsonCardIds.value)
  for (const id of selectedPageJsonCardIds.value) {
    const info = cardChainMap.value[id]
    if (info && info.chain && info.chain.cards.some(c => !selectedSet.has(c.id))) {
      return true
    }
  }
  return false
})

const expandPageSelectionToFullChains = () => {
  const expanded = new Set(selectedPageJsonCardIds.value)
  selectedPageJsonCardIds.value.forEach(id => {
    const info = cardChainMap.value[id]
    if (info && info.chain) {
      info.chain.cards.forEach(c => expanded.add(c.id))
    }
  })
  selectedPageJsonCardIds.value = Array.from(expanded)
}

const isChainFullySelectedInModal = (chain) => {
  if (!chain || !Array.isArray(chain.cards) || chain.cards.length === 0) return false
  return chain.cards.every(c => jsonSelectedCardIds.value.includes(c.id))
}

const getSelectedCountInChainModal = (chain) => {
  if (!chain || !Array.isArray(chain.cards)) return 0
  return chain.cards.filter(c => jsonSelectedCardIds.value.includes(c.id)).length
}

const toggleChainSelectionInModal = (chain) => {
  if (!chain || !Array.isArray(chain.cards)) return
  const ids = chain.cards.map(c => c.id)
  if (isChainFullySelectedInModal(chain)) {
    const removeSet = new Set(ids)
    jsonSelectedCardIds.value = jsonSelectedCardIds.value.filter(id => !removeSet.has(id))
  } else {
    jsonSelectedCardIds.value = Array.from(new Set([...jsonSelectedCardIds.value, ...ids]))
  }
}

const selectChainCardsInModal = (chain) => {
  if (!chain || !Array.isArray(chain.cards)) return
  const ids = chain.cards.map(c => c.id)
  jsonSelectedCardIds.value = Array.from(new Set([...jsonSelectedCardIds.value, ...ids]))
}

const selectAllJsonChainCards = () => {
  const ids = []
  jsonFilteredChains.value.forEach(ch => {
    ch.cards.forEach(c => ids.push(c.id))
  })
  jsonSelectedCardIds.value = Array.from(new Set([...jsonSelectedCardIds.value, ...ids]))
}

const selectAllJsonCustomers = () => {
  const ids = jsonFilteredCustomers.value.map(c => c.customer.ma_khach_hang)
  jsonSelectedCustomerIds.value = Array.from(new Set([...jsonSelectedCustomerIds.value, ...ids]))
}

const toggleSelectAllJsonCustomers = (e) => {
  if (e.target.checked) {
    selectAllJsonCustomers()
  } else {
    const filteredSet = new Set(jsonFilteredCustomers.value.map(c => c.customer.ma_khach_hang))
    jsonSelectedCustomerIds.value = jsonSelectedCustomerIds.value.filter(id => !filteredSet.has(id))
  }
}

const toggleJsonCustomerSelection = (maKH) => {
  if (!maKH) return
  const idx = jsonSelectedCustomerIds.value.indexOf(maKH)
  if (idx >= 0) {
    jsonSelectedCustomerIds.value.splice(idx, 1)
  } else {
    jsonSelectedCustomerIds.value.push(maKH)
  }
}

const selectAllJsonCards = () => {
  const ids = jsonFilteredCards.value.map(r => r.card.id)
  jsonSelectedCardIds.value = Array.from(new Set([...jsonSelectedCardIds.value, ...ids]))
}

const toggleSelectAllJsonCards = (e) => {
  if (e.target.checked) {
    selectAllJsonCards()
  } else {
    const filteredSet = new Set(jsonFilteredCards.value.map(r => r.card.id))
    jsonSelectedCardIds.value = jsonSelectedCardIds.value.filter(id => !filteredSet.has(id))
  }
}

const toggleJsonCardSelection = (cardId) => {
  if (!cardId) return
  const idx = jsonSelectedCardIds.value.indexOf(cardId)
  if (idx >= 0) {
    jsonSelectedCardIds.value.splice(idx, 1)
  } else {
    jsonSelectedCardIds.value.push(cardId)
  }
}

const sanitizeJsonFileName = (str) => {
  if (!str) return 'data'
  return removeDiacritics(String(str))
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'data'
}

const triggerDownloadJsonFile = (dataObj, prefix = 'DuLieu_TaiChinh_HangHoa') => {
  const now = new Date()
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
  const fileName = `${prefix}_${datePart}.json`
  const jsonString = JSON.stringify(dataObj, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 200)
}

const buildCardJsonPayload = (card, customerObj = null, options = { includeChildren: false }) => {
  if (!card) return null
  const cus = customerObj || (customers.value || []).find(c => c.ma_khach_hang === card.maKH) || null
  const summary = getCardMetricsAndGoodsSummary(card)
  const chainInfo = getChainInfoForCard(card)

  const rawFiles = Array.isArray(card.linkFileBaoGia)
    ? card.linkFileBaoGia.map(f => (typeof f === 'string' ? { url: f, name: cleanFileName(f) } : { url: f?.url || '', name: f?.name || cleanFileName(f?.url || '') }))
    : []
  const rawImages = Array.isArray(card.linkImgSave)
    ? card.linkImgSave.map(img => (typeof img === 'string' ? { url: img, name: cleanFileName(img) } : { url: img?.url || '', name: img?.name || cleanFileName(img?.url || '') }))
    : []

  const reportPayloads = summary.reports.map((r, idx) => ({
    stt_phien_ban: idx + 1,
    ma_bao_cao: r.key,
    id_sale_report_craft: r.craftId || null,
    id_sale_report_chinh_thuc: r.srId || null,
    da_chot_deal: !!r.chotDeal,
    so_po: r.soPO || '',
    so_hop_dong: r.soHD || '',
    ma_hop_dong: r.maHopDong || '',
    nha_cung_cap_loai_hang: r.productType || '',
    account_manager: r.am || '',
    noi_dung_hop_dong_po: r.content || '',
    ngay_bao_cao: r.createdTime || '',
    chi_so_tai_chinh: {
      doanh_so_ban_truoc_vat: r.doanhSoBan,
      thue_vat_ban: r.thueVAT,
      gia_mua_chua_vat: r.giaMua,
      tong_chi_phi_don_hang: r.tongCP,
      gross_com_truoc_thue: r.grossCom,
      phan_tram_thue_chenh_lech: r.taxPct,
      thue_chenh_lech_gia: Math.round(r.thue),
      net_com_con_lai: Math.round(r.netCom),
      net_po: Math.round(r.netPO),
      net_margin: Math.round(r.netMargin),
      ty_suat_net_com_tren_net_po_pct: Number((r.netComOverNetPO || 0).toFixed(2)),
      ty_suat_net_margin_tren_net_po_pct: Number((r.netMarginOverNetPO || 0).toFixed(2)),
      ty_suat_net_com_tren_dsb_pct: Number((r.netComOverDSB || 0).toFixed(2)),
      ty_suat_net_margin_tren_dsb_pct: Number((r.netMarginOverDSB || 0).toFixed(2))
    },
    hang_hoa: {
      tong_so_mat_hang: (r.goodsList || []).length,
      tong_tien_hang_truoc_vat: r.goodsTotal?.ttTruoc ?? r.doanhSoBan,
      tong_tien_vat: r.goodsTotal?.vat ?? r.thueVAT,
      danh_sach_mat_hang: (r.goodsList || []).map((g, gIdx) => ({
        stt: g.stt || (gIdx + 1),
        ten_hang_hoa: g.ten || '',
        dien_giai: g.dienGiai || '',
        danh_muc: g.danhMuc || '',
        don_vi_tinh: g.dvt || '',
        so_luong: g.sl,
        don_gia: g.donGia,
        thue_vat_pct: g.vatPct,
        thanh_tien_truoc_vat: g.thanhTienTruocVAT,
        tien_vat: g.tienVAT
      }))
    },
    tep_bao_cao: {
      link_file_bao_gia: r.linkBaoGia || '',
      ten_file_bao_gia: r.tenFileBG || '',
      link_file_mua_hang: r.linkMuaHang || '',
      ten_file_mua_hang: r.tenFileMH || '',
      link_anh_chung_tu: r.imgUrl || '',
      files: r.files || [],
      images: r.images || []
    }
  }))

  const goodsTotalTruoc = summary.goodsList.reduce((s, g) => s + (Number(g.thanhTienTruocVAT) || 0), 0)
  const goodsTotalVat = summary.goodsList.reduce((s, g) => s + (Number(g.tienVAT) || 0), 0)

  const payload = {
    id_card: card.id,
    ma_khach_hang: card.maKH || cus?.ma_khach_hang || '',
    ten_khach_hang: cus?.ten_khach_hang || card.tenKH || '',
    ten_cong_ty: cus?.ten_cong_ty || '',
    mst: cus?.mst || summary.reports[0]?.mst || '',
    noi_dung: card.noiDung || '',
    ghi_chu: card.ghiChu || '',
    ngay_tao_timestamp: card.createdTime || null,
    ngay_tao: formatCardDate(card.createdTime),
    id_card_truoc: card.idPrevious || null,
    thong_tin_chuoi_lien_ket: chainInfo
      ? {
          id_chuoi_goc: chainInfo.rootId,
          buoc_trong_chuoi: chainInfo.stepIndex,
          cap_do_cay: chainInfo.depth,
          tong_so_card_trong_chuoi: chainInfo.totalCards
        }
      : null,
    trang_thai: {
      muc_do_uu_tien: card.mucDoUuTien || 'Bình thường',
      trang_thai_xu_ly: card.trangThaiXuLy || 'Chưa gửi',
      trang_thai_bao_gia: card.trangThaiBaoGia || 'Xem xét',
      da_chot_deal: summary.closedReportsCount > 0 || !!card.craft_chotDeal
    },
    du_lieu_tai_chinh: {
      so_luong_bao_cao: summary.reportsCount,
      so_bao_cao_da_chot_deal: summary.closedReportsCount,
      tong_hop_tai_chinh_card: {
        doanh_so_ban_truoc_vat: summary.doanhSoBan,
        thue_vat_ban: summary.thueVAT,
        gia_mua_chua_vat: summary.giaMua,
        tong_chi_phi_don_hang: summary.tongCP,
        gross_com_truoc_thue: summary.grossCom,
        phan_tram_thue_chenh_lech: summary.taxPct,
        thue_chenh_lech_gia: Math.round(summary.thue),
        net_com_con_lai: Math.round(summary.netCom),
        net_po: Math.round(summary.netPO),
        net_margin: Math.round(summary.netMargin),
        ty_suat_net_com_tren_net_po_pct: summary.netComOverNetPO,
        ty_suat_net_margin_tren_net_po_pct: summary.netMarginOverNetPO,
        ty_suat_net_com_tren_dsb_pct: summary.netComOverDSB,
        ty_suat_net_margin_tren_dsb_pct: summary.netMarginOverDSB
      },
      danh_sach_phien_ban_tai_chinh: reportPayloads
    },
    du_lieu_hang_hoa: {
      tong_so_mat_hang: summary.goodsCount,
      tong_tien_hang_truoc_vat: goodsTotalTruoc || summary.doanhSoBan,
      tong_tien_vat: goodsTotalVat || summary.thueVAT,
      danh_sach_hang_hoa: summary.goodsList.map((g, idx) => ({
        stt: idx + 1,
        ten_hang_hoa: g.ten || '',
        dien_giai: g.dienGiai || '',
        danh_muc: g.danhMuc || '',
        don_vi_tinh: g.dvt || '',
        so_luong: g.sl,
        don_gia: g.donGia,
        thue_vat_pct: g.vatPct,
        thanh_tien_truoc_vat: g.thanhTienTruocVAT,
        tien_vat: g.tienVAT,
        nguon_bao_cao: g.nguonBaoCao || '',
        so_po: g.soPO || '',
        so_hop_dong: g.soHD || ''
      }))
    },
    tep_dinh_kem_card: {
      files_bao_gia_mua_hang: rawFiles,
      hinh_anh_chung_tu: rawImages
    }
  }

  if (options.includeChildren) {
    const directChildren = Array.isArray(card.children) && card.children.length > 0
      ? card.children
      : (files.value || []).filter(f => f.idPrevious === card.id)
    if (directChildren.length > 0) {
      payload.cac_card_con_lien_ket = directChildren.map(ch =>
        buildCardJsonPayload(ch, cus, { includeChildren: true })
      )
    }
  }

  return payload
}

// Xây dựng JSON cho 1 Chuỗi Card Liên Kết (toàn bộ chuỗi hoặc các card được chọn trong chuỗi)
const buildChainJsonPayload = (chain, selectedIdsSet = null) => {
  if (!chain) return null
  const cus = chain.customer || (customers.value || []).find(c => c.ma_khach_hang === chain.rootCard?.maKH) || {}
  const activeNodes = selectedIdsSet
    ? chain.nodes.filter(n => selectedIdsSet.has(n.card.id))
    : chain.nodes

  const stepCardPayloads = activeNodes.map((n, idx) => {
    const cardPayload = buildCardJsonPayload(n.card, cus, { includeChildren: false })
    return {
      thu_tu_xuat: idx + 1,
      buoc_trong_chuoi: n.stepIndex,
      cap_do_cay: n.depth,
      la_card_goc: n.depth === 0,
      ...cardPayload
    }
  })

  let totalReports = 0
  let closedReports = 0
  let doanhSoBan = 0
  let thueVAT = 0
  let giaMua = 0
  let tongCP = 0
  let grossCom = 0
  let thue = 0
  let netCom = 0
  const chainGoodsList = []

  activeNodes.forEach(n => {
    const c = n.card
    const s = getCardMetricsAndGoodsSummary(c)
    totalReports += s.reportsCount
    closedReports += s.closedReportsCount
    doanhSoBan += s.doanhSoBan
    thueVAT += s.thueVAT
    giaMua += s.giaMua
    tongCP += s.tongCP
    grossCom += s.grossCom
    thue += s.thue
    netCom += s.netCom

    s.goodsList.forEach(g => {
      chainGoodsList.push({
        stt: chainGoodsList.length + 1,
        buoc_trong_chuoi: n.stepIndex,
        id_card: c.id,
        noi_dung_card: c.noiDung || '',
        ngay_tao_card: formatCardDate(c.createdTime),
        nguon_bao_cao: g.nguonBaoCao || '',
        so_po: g.soPO || '',
        so_hop_dong: g.soHD || '',
        ten_hang_hoa: g.ten || '',
        dien_giai: g.dienGiai || '',
        danh_muc: g.danhMuc || '',
        don_vi_tinh: g.dvt || '',
        so_luong: g.sl,
        don_gia: g.donGia,
        thue_vat_pct: g.vatPct,
        thanh_tien_truoc_vat: g.thanhTienTruocVAT,
        tien_vat: g.tienVAT
      })
    })
  })

  const netPO = doanhSoBan - grossCom
  const netMargin = doanhSoBan - grossCom - tongCP

  return {
    id_chuoi_goc: chain.chainId,
    mo_ta_luong_chuoi: activeNodes
      .map(n => `Bước #${n.stepIndex} (${formatCardDate(n.card.createdTime)}): ${n.card.noiDung || n.card.id}`)
      .join(' -> '),
    thong_tin_khach_hang: {
      id: cus.id || null,
      ma_khach_hang: cus.ma_khach_hang || chain.rootCard?.maKH || '',
      ten_khach_hang: cus.ten_khach_hang || chain.customerName || '',
      ten_cong_ty: cus.ten_cong_ty || '',
      mst: cus.mst || ''
    },
    thong_ke_chuoi: {
      tong_so_card_toan_chuoi: chain.totalCards,
      so_card_da_chon_xuat: activeNodes.length,
      xuat_tron_ven_ca_chuoi: activeNodes.length === chain.totalCards,
      tong_so_bao_cao_tai_chinh: totalReports,
      so_bao_cao_da_chot_deal: closedReports,
      tong_so_mat_hang: chainGoodsList.length
    },
    tong_hop_tai_chinh_chuoi: {
      doanh_so_ban_truoc_vat: doanhSoBan,
      thue_vat_ban: thueVAT,
      gia_mua_chua_vat: giaMua,
      tong_chi_phi_don_hang: tongCP,
      gross_com_truoc_thue: grossCom,
      thue_chenh_lech_gia: Math.round(thue),
      net_com_con_lai: Math.round(netCom),
      net_po: Math.round(netPO),
      net_margin: Math.round(netMargin),
      ty_suat_net_com_tren_net_po_pct: netPO !== 0 ? Number(((netCom / netPO) * 100).toFixed(2)) : 0,
      ty_suat_net_margin_tren_net_po_pct: netPO !== 0 ? Number(((netMargin / netPO) * 100).toFixed(2)) : 0,
      ty_suat_net_com_tren_dsb_pct: doanhSoBan !== 0 ? Number(((netCom / doanhSoBan) * 100).toFixed(2)) : 0,
      ty_suat_net_margin_tren_dsb_pct: doanhSoBan !== 0 ? Number(((netMargin / doanhSoBan) * 100).toFixed(2)) : 0
    },
    tong_hop_hang_hoa_chuoi: {
      tong_so_mat_hang: chainGoodsList.length,
      tong_tien_hang_truoc_vat: chainGoodsList.reduce((s, g) => s + (Number(g.thanh_tien_truoc_vat) || 0), 0),
      tong_tien_vat: chainGoodsList.reduce((s, g) => s + (Number(g.tien_vat) || 0), 0),
      danh_sach_hang_hoa: chainGoodsList
    },
    danh_sach_card_theo_thu_tu_chuoi: stepCardPayloads
  }
}

const buildCustomerJsonPayload = (customerObj, customerCards = []) => {
  const cus = customerObj || {}
  const sortedCards = [...customerCards].sort((a, b) => (b.createdTime || 0) - (a.createdTime || 0))
  const cardPayloads = sortedCards.map(c => buildCardJsonPayload(c, cus, { includeChildren: false }))

  let totalReports = 0
  let closedReports = 0
  let doanhSoBan = 0
  let thueVAT = 0
  let giaMua = 0
  let tongCP = 0
  let grossCom = 0
  let thue = 0
  let netCom = 0
  const customerGoodsList = []

  sortedCards.forEach(c => {
    const s = getCardMetricsAndGoodsSummary(c)
    totalReports += s.reportsCount
    closedReports += s.closedReportsCount
    doanhSoBan += s.doanhSoBan
    thueVAT += s.thueVAT
    giaMua += s.giaMua
    tongCP += s.tongCP
    grossCom += s.grossCom
    thue += s.thue
    netCom += s.netCom

    s.goodsList.forEach(g => {
      customerGoodsList.push({
        stt: customerGoodsList.length + 1,
        id_card: c.id,
        noi_dung_card: c.noiDung || '',
        ngay_tao_card: formatCardDate(c.createdTime),
        nguon_bao_cao: g.nguonBaoCao || '',
        so_po: g.soPO || '',
        so_hop_dong: g.soHD || '',
        ten_hang_hoa: g.ten || '',
        dien_giai: g.dienGiai || '',
        danh_muc: g.danhMuc || '',
        don_vi_tinh: g.dvt || '',
        so_luong: g.sl,
        don_gia: g.donGia,
        thue_vat_pct: g.vatPct,
        thanh_tien_truoc_vat: g.thanhTienTruocVAT,
        tien_vat: g.tienVAT
      })
    })
  })

  const netPO = doanhSoBan - grossCom
  const netMargin = doanhSoBan - grossCom - tongCP

  return {
    thong_tin_khach_hang: {
      id: cus.id || null,
      ma_khach_hang: cus.ma_khach_hang || '',
      ten_khach_hang: cus.ten_khach_hang || '',
      ten_cong_ty: cus.ten_cong_ty || '',
      ma_cong_ty: cus.ma_cong_ty || '',
      mst: cus.mst || '',
      email: cus.email || '',
      so_dien_thoai: cus.sdt || cus.so_dien_thoai || '',
      dia_chi: cus.dia_chi || '',
      tags: Array.isArray(cus.tagKH) ? cus.tagKH : []
    },
    thong_ke_tong_quan: {
      tong_so_card: sortedCards.length,
      tong_so_bao_cao_tai_chinh: totalReports,
      so_bao_cao_da_chot_deal: closedReports,
      tong_so_mat_hang: customerGoodsList.length
    },
    tong_hop_tai_chinh_khach_hang: {
      doanh_so_ban_truoc_vat: doanhSoBan,
      thue_vat_ban: thueVAT,
      gia_mua_chua_vat: giaMua,
      tong_chi_phi_don_hang: tongCP,
      gross_com_truoc_thue: grossCom,
      thue_chenh_lech_gia: Math.round(thue),
      net_com_con_lai: Math.round(netCom),
      net_po: Math.round(netPO),
      net_margin: Math.round(netMargin),
      ty_suat_net_com_tren_net_po_pct: netPO !== 0 ? Number(((netCom / netPO) * 100).toFixed(2)) : 0,
      ty_suat_net_margin_tren_net_po_pct: netPO !== 0 ? Number(((netMargin / netPO) * 100).toFixed(2)) : 0,
      ty_suat_net_com_tren_dsb_pct: doanhSoBan !== 0 ? Number(((netCom / doanhSoBan) * 100).toFixed(2)) : 0,
      ty_suat_net_margin_tren_dsb_pct: doanhSoBan !== 0 ? Number(((netMargin / doanhSoBan) * 100).toFixed(2)) : 0
    },
    tong_hop_hang_hoa_khach_hang: {
      tong_so_mat_hang: customerGoodsList.length,
      tong_tien_hang_truoc_vat: customerGoodsList.reduce((s, g) => s + (Number(g.thanh_tien_truoc_vat) || 0), 0),
      tong_tien_vat: customerGoodsList.reduce((s, g) => s + (Number(g.tien_vat) || 0), 0),
      danh_sach_hang_hoa: customerGoodsList
    },
    danh_sach_card: cardPayloads
  }
}

const collectAllNodesFromRoot = (node, list = []) => {
  if (!node) return list
  list.push(node)
  const children = Array.isArray(node.children) && node.children.length > 0
    ? node.children
    : (files.value || []).filter(f => f.idPrevious === node.id)
  children.forEach(ch => collectAllNodesFromRoot(ch, list))
  return list
}

// 1. Xuất JSON cho 1 Card cụ thể (từ nút trên Card hoặc từ bảng chọn Card)
const handleExportCardJson = async (payload) => {
  const node = payload?.node || payload
  if (!node || isExportingJson.value) return
  const includeChildren = payload?.includeChildren ?? false
  const cus = payload?.customer || (customers.value || []).find(c => c.ma_khach_hang === node.maKH) || null

  isExportingJson.value = true
  try {
    const cardsToEnsure = includeChildren ? collectAllNodesFromRoot(node, []) : [node]
    await ensureGoodsLoadedForCards(cardsToEnsure)

    const cardJson = buildCardJsonPayload(node, cus, { includeChildren })
    const exportDoc = {
      loai_xuat_du_lieu: 'THEO_CARD',
      thoi_gian_xuat: new Date().toISOString(),
      bao_gom_card_con_lien_ket: !!includeChildren,
      du_lieu_card: cardJson
    }
    const cusSlug = sanitizeJsonFileName(cus?.ten_khach_hang || node.maKH || 'Card')
    const contentSlug = sanitizeJsonFileName(node.noiDung || node.id || 'HoSo')
    triggerDownloadJsonFile(exportDoc, `JSON_Card_${cusSlug}_${contentSlug}`)
  } catch (err) {
    console.error('Lỗi khi xuất JSON theo card:', err)
    await showAlert('Không thể xuất file JSON cho card này: ' + (err.message || err), 'Lỗi xuất JSON')
  } finally {
    isExportingJson.value = false
  }
}

// 1B. Xuất JSON cho 1 Chuỗi Card Liên Kết (toàn bộ chuỗi hoặc các card đã chọn trong chuỗi)
const handleExportChainJson = async (payload) => {
  const node = payload?.node || payload
  if (!node || isExportingJson.value) return

  const info = getChainInfoForCard(node)
  let chainObj = info?.chain || null

  if (!chainObj) {
    const rawCards = collectAllNodesFromRoot(node, [])
    const cus = payload?.customer || (customers.value || []).find(c => c.ma_khach_hang === node.maKH) || null
    const nodes = rawCards.map((c, idx) => ({
      card: c,
      stepIndex: idx + 1,
      depth: idx === 0 ? 0 : 1,
      summary: getCardMetricsAndGoodsSummary(c)
    }))
    chainObj = {
      chainId: node.id,
      rootCard: node,
      customer: cus,
      customerName: cus?.ten_khach_hang || node.maKH || 'Khách hàng',
      nodes,
      cards: rawCards,
      totalCards: rawCards.length
    }
  }

  const selectedIds = Array.isArray(payload?.selectedCardIds) && payload.selectedCardIds.length > 0
    ? new Set(payload.selectedCardIds)
    : null

  isExportingJson.value = true
  try {
    const cardsToEnsure = selectedIds
      ? chainObj.cards.filter(c => selectedIds.has(c.id))
      : chainObj.cards
    await ensureGoodsLoadedForCards(cardsToEnsure)

    const chainPayload = buildChainJsonPayload(chainObj, selectedIds)
    const exportDoc = {
      loai_xuat_du_lieu: 'THEO_CHUOI_CARD_LIEN_KET',
      thoi_gian_xuat: new Date().toISOString(),
      du_lieu_chuoi_lien_ket: chainPayload
    }
    const cusSlug = sanitizeJsonFileName(chainObj.customerName || chainObj.rootCard?.maKH || 'KhachHang')
    const rootSlug = sanitizeJsonFileName(chainObj.rootCard?.noiDung || chainObj.chainId || 'Chuoi')
    triggerDownloadJsonFile(exportDoc, `JSON_ChuoiLienKet_${chainPayload.thong_ke_chuoi.so_card_da_chon_xuat}Card_${cusSlug}_${rootSlug}`)
  } catch (err) {
    console.error('Lỗi khi xuất JSON chuỗi liên kết:', err)
    await showAlert('Không thể xuất file JSON cho chuỗi liên kết này: ' + (err.message || err), 'Lỗi xuất JSON')
  } finally {
    isExportingJson.value = false
  }
}

const handleExportChainFromModalRow = async (chain) => {
  if (!chain || isExportingJson.value) return
  const selectedInChain = chain.cards
    .filter(c => jsonSelectedCardIds.value.includes(c.id))
    .map(c => c.id)
  const selectedCardIds = selectedInChain.length > 0 ? selectedInChain : chain.cards.map(c => c.id)
  await handleExportChainJson({
    node: chain.rootCard,
    customer: chain.customer,
    selectedCardIds
  })
}

// 1C. Xuất JSON các Card đang được người dùng click chọn trực tiếp bên ngoài các card (giống như chọn đối chiếu)
const handleExportSelectedPageCardsJson = async () => {
  const selectedIds = [...selectedPageJsonCardIds.value]
  if (selectedIds.length === 0 || isExportingJson.value) return

  const fileMap = {}
  ;(files.value || []).forEach(f => {
    if (f && f.id) fileMap[f.id] = f
  })
  const selectedCards = selectedIds.map(id => fileMap[id]).filter(Boolean)
  if (selectedCards.length === 0) return

  isExportingJson.value = true
  try {
    await ensureGoodsLoadedForCards(selectedCards)

    const cardPayloads = selectedCards.map((c, idx) => {
      const cus = (customers.value || []).find(cu => cu.ma_khach_hang === c.maKH) || null
      return {
        stt_chon: idx + 1,
        ...buildCardJsonPayload(c, cus, { includeChildren: false })
      }
    })

    const sumDSB = cardPayloads.reduce((s, c) => s + (c.du_lieu_tai_chinh.tong_hop_tai_chinh_card.doanh_so_ban_truoc_vat || 0), 0)
    const sumGiaMua = cardPayloads.reduce((s, c) => s + (c.du_lieu_tai_chinh.tong_hop_tai_chinh_card.gia_mua_chua_vat || 0), 0)
    const sumCP = cardPayloads.reduce((s, c) => s + (c.du_lieu_tai_chinh.tong_hop_tai_chinh_card.tong_chi_phi_don_hang || 0), 0)
    const sumGrossCom = cardPayloads.reduce((s, c) => s + (c.du_lieu_tai_chinh.tong_hop_tai_chinh_card.gross_com_truoc_thue || 0), 0)
    const sumThue = cardPayloads.reduce((s, c) => s + (c.du_lieu_tai_chinh.tong_hop_tai_chinh_card.thue_chenh_lech_gia || 0), 0)
    const sumNetCom = cardPayloads.reduce((s, c) => s + (c.du_lieu_tai_chinh.tong_hop_tai_chinh_card.net_com_con_lai || 0), 0)
    const sumNetPO = sumDSB - sumGrossCom
    const sumNetMargin = sumDSB - sumGrossCom - sumCP

    const allGoods = []
    cardPayloads.forEach(c => {
      ;(c.du_lieu_hang_hoa?.danh_sach_hang_hoa || []).forEach(g => {
        allGoods.push({
          ...g,
          stt_tong: allGoods.length + 1,
          stt_chon_card: c.stt_chon,
          id_card: c.id_card,
          ma_khach_hang: c.ma_khach_hang,
          ten_khach_hang: c.ten_khach_hang,
          noi_dung_card: c.noi_dung
        })
      })
    })

    const exportDoc = {
      loai_xuat_du_lieu: 'CAC_CARD_DA_CHON',
      thoi_gian_xuat: new Date().toISOString(),
      tong_so_card_da_chon: cardPayloads.length,
      tong_hop_tai_chinh_cac_card: {
        doanh_so_ban_truoc_vat: sumDSB,
        gia_mua_chua_vat: sumGiaMua,
        tong_chi_phi_don_hang: sumCP,
        gross_com_truoc_thue: sumGrossCom,
        thue_chenh_lech_gia: sumThue,
        net_com_con_lai: sumNetCom,
        net_po: sumNetPO,
        net_margin: sumNetMargin
      },
      tong_hop_hang_hoa_cac_card: {
        tong_so_mat_hang: allGoods.length,
        tong_tien_hang_truoc_vat: allGoods.reduce((s, g) => s + (Number(g.thanh_tien_truoc_vat) || 0), 0),
        tong_tien_vat: allGoods.reduce((s, g) => s + (Number(g.tien_vat) || 0), 0),
        danh_sach_hang_hoa: allGoods
      },
      danh_sach_card: cardPayloads
    }

    const prefix = cardPayloads.length === 1
      ? `JSON_Card_${sanitizeJsonFileName(cardPayloads[0].ten_khach_hang || cardPayloads[0].ma_khach_hang)}_${sanitizeJsonFileName(cardPayloads[0].noi_dung || cardPayloads[0].id_card)}`
      : `JSON_${cardPayloads.length}_Card_DaChon`
    triggerDownloadJsonFile(exportDoc, prefix)
  } catch (err) {
    console.error('Lỗi khi xuất JSON các card đã chọn:', err)
    await showAlert('Không thể xuất file JSON các card đã chọn: ' + (err.message || err), 'Lỗi xuất JSON')
  } finally {
    isExportingJson.value = false
  }
}

// 2. Xuất JSON cho 1 Khách hàng cụ thể (từ nút "Tải JSON KH" trên header khách hàng)
const handleExportCustomerJson = async (tree) => {
  if (!tree || !tree.customer || isExportingJson.value) return
  isExportingJson.value = true
  try {
    const cus = tree.customer
    const cusCards = []
    const walk = (nodes) => {
      ;(nodes || []).forEach(n => {
        cusCards.push(n)
        if (n.children && n.children.length > 0) walk(n.children)
      })
    }
    if (Array.isArray(tree.roots) && tree.roots.length > 0) {
      walk(tree.roots)
    } else {
      const fallback = (filteredFiles.value || []).filter(f => f.maKH === cus.ma_khach_hang)
      cusCards.push(...fallback)
    }

    await ensureGoodsLoadedForCards(cusCards)
    const customerPayload = buildCustomerJsonPayload(cus, cusCards)
    const exportDoc = {
      loai_xuat_du_lieu: 'THEO_KHACH_HANG',
      thoi_gian_xuat: new Date().toISOString(),
      du_lieu_khach_hang: customerPayload
    }
    const cusSlug = sanitizeJsonFileName(cus.ten_khach_hang || cus.ma_khach_hang || 'KhachHang')
    triggerDownloadJsonFile(exportDoc, `JSON_KhachHang_${cusSlug}`)
  } catch (err) {
    console.error('Lỗi khi xuất JSON khách hàng:', err)
    await showAlert('Không thể xuất file JSON cho khách hàng này: ' + (err.message || err), 'Lỗi xuất JSON')
  } finally {
    isExportingJson.value = false
  }
}

const handleExportSingleCustomerByMaKH = async (maKH) => {
  if (!maKH || isExportingJson.value) return
  const cus = (customers.value || []).find(c => c.ma_khach_hang === maKH)
  if (!cus) return
  let cards = (files.value || []).filter(f => f.maKH === maKH)
  if (jsonOnlyWithFinanceOrGoods.value) {
    cards = cards.filter(c => {
      const s = getCardMetricsAndGoodsSummary(c)
      return s.reportsCount > 0 || s.goodsCount > 0
    })
  }
  await handleExportCustomerJson({ customer: cus, roots: cards.map(c => ({ ...c, children: [] })) })
}

// 3. Xuất nhanh toàn bộ dữ liệu đang hiển thị ở Dạng so sánh
const handleQuickExportAllJson = async () => {
  if (isExportingJson.value) return
  isExportingJson.value = true
  try {
    const targetCards = filteredFiles.value || []
    await ensureGoodsLoadedForCards(targetCards)

    const customerPayloads = (customerTrees.value || []).map(tree => {
      const cusCards = []
      const walk = (nodes) => {
        ;(nodes || []).forEach(n => {
          cusCards.push(n)
          if (n.children && n.children.length > 0) walk(n.children)
        })
      }
      walk(tree.roots || [])
      return buildCustomerJsonPayload(tree.customer, cusCards)
    })

    const allGoodsFlat = []
    customerPayloads.forEach(cp => {
      ;(cp.tong_hop_hang_hoa_khach_hang?.danh_sach_hang_hoa || []).forEach(g => {
        allGoodsFlat.push({
          ...g,
          stt_toan_bo: allGoodsFlat.length + 1,
          ma_khach_hang: cp.thong_tin_khach_hang.ma_khach_hang,
          ten_khach_hang: cp.thong_tin_khach_hang.ten_khach_hang,
          ten_cong_ty: cp.thong_tin_khach_hang.ten_cong_ty
        })
      })
    })

    const sumDSB = customerPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_khach_hang.doanh_so_ban_truoc_vat || 0), 0)
    const sumGiaMua = customerPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_khach_hang.gia_mua_chua_vat || 0), 0)
    const sumCP = customerPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_khach_hang.tong_chi_phi_don_hang || 0), 0)
    const sumGrossCom = customerPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_khach_hang.gross_com_truoc_thue || 0), 0)
    const sumThue = customerPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_khach_hang.thue_chenh_lech_gia || 0), 0)
    const sumNetCom = customerPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_khach_hang.net_com_con_lai || 0), 0)
    const sumNetPO = sumDSB - sumGrossCom
    const sumNetMargin = sumDSB - sumGrossCom - sumCP

    const exportDoc = {
      loai_xuat_du_lieu: 'TOAN_BO_DANG_SO_SANH',
      thoi_gian_xuat: new Date().toISOString(),
      thong_ke_tong_hop: {
        tong_so_khach_hang: customerPayloads.length,
        tong_so_card: targetCards.length,
        tong_so_bao_cao_tai_chinh: customerPayloads.reduce((s, c) => s + c.thong_ke_tong_quan.tong_so_bao_cao_tai_chinh, 0),
        tong_so_mat_hang: allGoodsFlat.length
      },
      tong_hop_tai_chinh_toan_bo: {
        doanh_so_ban_truoc_vat: sumDSB,
        gia_mua_chua_vat: sumGiaMua,
        tong_chi_phi_don_hang: sumCP,
        gross_com_truoc_thue: sumGrossCom,
        thue_chenh_lech_gia: sumThue,
        net_com_con_lai: sumNetCom,
        net_po: sumNetPO,
        net_margin: sumNetMargin,
        ty_suat_net_com_tren_net_po_pct: sumNetPO !== 0 ? Number(((sumNetCom / sumNetPO) * 100).toFixed(2)) : 0,
        ty_suat_net_margin_tren_net_po_pct: sumNetPO !== 0 ? Number(((sumNetMargin / sumNetPO) * 100).toFixed(2)) : 0,
        ty_suat_net_com_tren_dsb_pct: sumDSB !== 0 ? Number(((sumNetCom / sumDSB) * 100).toFixed(2)) : 0,
        ty_suat_net_margin_tren_dsb_pct: sumDSB !== 0 ? Number(((sumNetMargin / sumDSB) * 100).toFixed(2)) : 0
      },
      tong_hop_hang_hoa_toan_bo: {
        tong_so_mat_hang: allGoodsFlat.length,
        danh_sach_hang_hoa: allGoodsFlat
      },
      danh_sach_khach_hang: customerPayloads
    }

    triggerDownloadJsonFile(exportDoc, 'JSON_ToanBo_TaiChinh_HangHoa')
  } catch (err) {
    console.error('Lỗi khi xuất nhanh toàn bộ JSON:', err)
    await showAlert('Không thể xuất file JSON: ' + (err.message || err), 'Lỗi xuất JSON')
  } finally {
    isExportingJson.value = false
  }
}

// 4. Xuất JSON các phiên bản đang được tích chọn trong Bảng Ma Trận Đối Chiếu
const handleExportSelectedCompareJson = async () => {
  const items = selectedCompareItems.value || []
  if (items.length === 0 || isExportingJson.value) return
  isExportingJson.value = true
  try {
    const uniqueFiles = Array.from(new Set(items.map(it => it.file).filter(Boolean)))
    await ensureGoodsLoadedForCards(uniqueFiles)

    const refreshedItems = selectedCompareKeys.value.map((k, idx) => {
      const info = resolveCompareKeyInfo(k)
      return info ? { ...info, order: idx + 1 } : null
    }).filter(Boolean)

    const exportVersions = refreshedItems.map((it, idx) => {
      const r = it.report || {}
      const diffObj = {}
      if (idx > 0) {
        compareMetricRows.forEach(m => {
          const d = calcVersionMetricDiff(it, idx, m.key, m.isRatio)
          if (d) {
            diffObj[m.key] = {
              chenh_lech: d.delta,
              chenh_lech_hien_thi: d.deltaText,
              ty_le_thay_doi_pct: d.pctText,
              so_voi_moc: d.refLabel
            }
          }
        })
      }
      return {
        thu_tu_so_sanh: it.order,
        la_moc_goc: idx === 0,
        tieu_de_phien_ban: it.title,
        id_card: it.file?.id || '',
        ma_khach_hang: it.file?.maKH || '',
        ten_khach_hang: it.customerName || '',
        noi_dung_card: it.file?.noiDung || '',
        ngay_tao_card: formatCardDate(it.file?.createdTime),
        che_do_gop: !!it.isMerged,
        da_chot_deal: !!r.chotDeal,
        so_po: r.soPO || '',
        so_hop_dong: r.soHD || '',
        nha_cung_cap_loai_hang: r.productType || '',
        account_manager: r.am || '',
        chi_so_tai_chinh: {
          doanh_so_ban_truoc_vat: r.doanhSoBan || 0,
          gia_mua_chua_vat: r.giaMua || 0,
          tong_chi_phi_don_hang: r.tongCP || 0,
          gross_com_truoc_thue: r.grossCom || 0,
          phan_tram_thue_chenh_lech: r.taxPct ?? 25,
          thue_chenh_lech_gia: Math.round(r.thue || 0),
          net_com_con_lai: Math.round(r.netCom || 0),
          net_po: Math.round(r.netPO || 0),
          net_margin: Math.round(r.netMargin || 0),
          ty_suat_net_com_tren_net_po_pct: Number((r.netComOverNetPO || 0).toFixed(2)),
          ty_suat_net_margin_tren_net_po_pct: Number((r.netMarginOverNetPO || 0).toFixed(2)),
          ty_suat_net_com_tren_dsb_pct: Number((r.netComOverDSB || 0).toFixed(2)),
          ty_suat_net_margin_tren_dsb_pct: Number((r.netMarginOverDSB || 0).toFixed(2))
        },
        chenh_lech_so_voi_moc_goc: idx === 0 ? null : diffObj,
        hang_hoa: {
          tong_so_mat_hang: (r.goodsList || []).length,
          tong_tien_hang_truoc_vat: r.goodsTotal?.ttTruoc ?? r.doanhSoBan ?? 0,
          tong_tien_vat: r.goodsTotal?.vat ?? r.thueVAT ?? 0,
          danh_sach_mat_hang: (r.goodsList || []).map((g, gIdx) => ({
            stt: g.stt || (gIdx + 1),
            ten_hang_hoa: g.ten || '',
            dien_giai: g.dienGiai || '',
            danh_muc: g.danhMuc || '',
            don_vi_tinh: g.dvt || '',
            so_luong: g.sl,
            don_gia: g.donGia,
            thue_vat_pct: g.vatPct,
            thanh_tien_truoc_vat: g.thanhTienTruocVAT,
            tien_vat: g.tienVAT
          }))
        }
      }
    })

    const exportDoc = {
      loai_xuat_du_lieu: 'DOI_CHIEU_CAC_PHIEN_BAN_DA_CHON',
      thoi_gian_xuat: new Date().toISOString(),
      che_do_so_sanh: compareDiffBaselineMode.value === 'vs_prev' ? 'So với phiên bản liền trước' : 'So với mốc chuẩn #1',
      tong_so_phien_ban: exportVersions.length,
      danh_sach_phien_ban_doi_chieu: exportVersions
    }

    triggerDownloadJsonFile(exportDoc, `JSON_DoiChieu_${exportVersions.length}_PhienBan`)
  } catch (err) {
    console.error('Lỗi khi xuất JSON đối chiếu:', err)
    await showAlert('Không thể xuất file JSON đối chiếu: ' + (err.message || err), 'Lỗi xuất JSON')
  } finally {
    isExportingJson.value = false
  }
}

// 5. Xác nhận xuất JSON từ Modal tùy chọn (Theo Chuỗi / Theo Card / Theo Khách Hàng / Toàn bộ)
const handleConfirmJsonModalExport = async () => {
  if (isExportingJson.value || !canSubmitJsonModalExport.value) return
  isExportingJson.value = true

  try {
    if (jsonExportScope.value === 'all') {
      const baseFiles = jsonAllDataSource.value === 'system' ? (files.value || []) : (filteredFiles.value || [])
      await ensureGoodsLoadedForCards(baseFiles)

      const activeCards = jsonOnlyWithFinanceOrGoods.value
        ? baseFiles.filter(f => {
            const s = getCardMetricsAndGoodsSummary(f)
            return s.reportsCount > 0 || s.goodsCount > 0
          })
        : baseFiles

      const cardsByMaKH = {}
      activeCards.forEach(c => {
        const key = c.maKH || 'CHUA_PHAN_LOAI'
        if (!cardsByMaKH[key]) cardsByMaKH[key] = []
        cardsByMaKH[key].push(c)
      })

      const customerPayloads = Object.keys(cardsByMaKH).map(maKH => {
        const cusObj = (customers.value || []).find(c => c.ma_khach_hang === maKH) || {
          ma_khach_hang: maKH,
          ten_khach_hang: getCustomerNameInfo(maKH) || maKH
        }
        return buildCustomerJsonPayload(cusObj, cardsByMaKH[maKH])
      })

      const allGoodsFlat = []
      customerPayloads.forEach(cp => {
        ;(cp.tong_hop_hang_hoa_khach_hang?.danh_sach_hang_hoa || []).forEach(g => {
          allGoodsFlat.push({
            ...g,
            stt_toan_bo: allGoodsFlat.length + 1,
            ma_khach_hang: cp.thong_tin_khach_hang.ma_khach_hang,
            ten_khach_hang: cp.thong_tin_khach_hang.ten_khach_hang,
            ten_cong_ty: cp.thong_tin_khach_hang.ten_cong_ty
          })
        })
      })

      const summary = jsonAllSummary.value
      const exportDoc = {
        loai_xuat_du_lieu: 'TOAN_BO',
        pham_vi_nguon: jsonAllDataSource.value === 'system' ? 'Toàn bộ hệ thống' : 'Theo bộ lọc hiện tại trên trang',
        chi_lay_card_co_tai_chinh_hang_hoa: !!jsonOnlyWithFinanceOrGoods.value,
        thoi_gian_xuat: new Date().toISOString(),
        thong_ke_tong_hop: {
          tong_so_khach_hang: customerPayloads.length,
          tong_so_card: activeCards.length,
          tong_so_bao_cao_tai_chinh: summary.totalReports,
          so_bao_cao_da_chot_deal: summary.closedReports,
          tong_so_mat_hang: allGoodsFlat.length
        },
        tong_hop_tai_chinh_toan_bo: {
          doanh_so_ban_truoc_vat: summary.doanhSoBan,
          gia_mua_chua_vat: summary.giaMua,
          tong_chi_phi_don_hang: summary.tongCP,
          gross_com_truoc_thue: summary.grossCom,
          thue_chenh_lech_gia: Math.round(summary.thue),
          net_com_con_lai: Math.round(summary.netCom),
          net_po: Math.round(summary.netPO),
          net_margin: Math.round(summary.netMargin),
          ty_suat_net_com_tren_net_po_pct: summary.netPO !== 0 ? Number(((summary.netCom / summary.netPO) * 100).toFixed(2)) : 0,
          ty_suat_net_margin_tren_net_po_pct: summary.netPO !== 0 ? Number(((summary.netMargin / summary.netPO) * 100).toFixed(2)) : 0,
          ty_suat_net_com_tren_dsb_pct: summary.doanhSoBan !== 0 ? Number(((summary.netCom / summary.doanhSoBan) * 100).toFixed(2)) : 0,
          ty_suat_net_margin_tren_dsb_pct: summary.doanhSoBan !== 0 ? Number(((summary.netMargin / summary.doanhSoBan) * 100).toFixed(2)) : 0
        },
        tong_hop_hang_hoa_toan_bo: {
          tong_so_mat_hang: allGoodsFlat.length,
          danh_sach_hang_hoa: allGoodsFlat
        },
        danh_sach_khach_hang: customerPayloads
      }

      triggerDownloadJsonFile(exportDoc, 'JSON_ToanBo_TaiChinh_HangHoa')
    } else if (jsonExportScope.value === 'customer') {
      const selectedMaKHs = jsonSelectedCustomerIds.value || []
      const targetCards = (files.value || []).filter(f => selectedMaKHs.includes(f.maKH))
      await ensureGoodsLoadedForCards(targetCards)

      const customerPayloads = []
      selectedMaKHs.forEach(maKH => {
        const cusObj = (customers.value || []).find(c => c.ma_khach_hang === maKH)
        if (!cusObj) return
        let cusCards = (files.value || []).filter(f => f.maKH === maKH)
        if (jsonOnlyWithFinanceOrGoods.value) {
          cusCards = cusCards.filter(c => {
            const s = getCardMetricsAndGoodsSummary(c)
            return s.reportsCount > 0 || s.goodsCount > 0
          })
        }
        if (cusCards.length > 0) {
          customerPayloads.push(buildCustomerJsonPayload(cusObj, cusCards))
        }
      })

      const sumDSB = customerPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_khach_hang.doanh_so_ban_truoc_vat || 0), 0)
      const sumGiaMua = customerPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_khach_hang.gia_mua_chua_vat || 0), 0)
      const sumCP = customerPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_khach_hang.tong_chi_phi_don_hang || 0), 0)
      const sumGrossCom = customerPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_khach_hang.gross_com_truoc_thue || 0), 0)
      const sumThue = customerPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_khach_hang.thue_chenh_lech_gia || 0), 0)
      const sumNetCom = customerPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_khach_hang.net_com_con_lai || 0), 0)
      const sumNetPO = sumDSB - sumGrossCom
      const sumNetMargin = sumDSB - sumGrossCom - sumCP

      const exportDoc = {
        loai_xuat_du_lieu: 'THEO_KHACH_HANG',
        thoi_gian_xuat: new Date().toISOString(),
        tong_so_khach_hang_da_chon: customerPayloads.length,
        tong_hop_tai_chinh_cac_khach_hang: {
          doanh_so_ban_truoc_vat: sumDSB,
          gia_mua_chua_vat: sumGiaMua,
          tong_chi_phi_don_hang: sumCP,
          gross_com_truoc_thue: sumGrossCom,
          thue_chenh_lech_gia: sumThue,
          net_com_con_lai: sumNetCom,
          net_po: sumNetPO,
          net_margin: sumNetMargin
        },
        danh_sach_khach_hang: customerPayloads
      }

      const prefix = customerPayloads.length === 1
        ? `JSON_KhachHang_${sanitizeJsonFileName(customerPayloads[0].thong_tin_khach_hang.ten_khach_hang || customerPayloads[0].thong_tin_khach_hang.ma_khach_hang)}`
        : `JSON_${customerPayloads.length}_KhachHang_TaiChinh_HangHoa`
      triggerDownloadJsonFile(exportDoc, prefix)
    } else if (jsonExportScope.value === 'chain') {
      const selectedSet = new Set(jsonSelectedCardIds.value || [])
      const targetChains = allLinkedChains.value.filter(ch =>
        ch.cards.some(c => selectedSet.has(c.id))
      )
      const cardsToEnsure = []
      targetChains.forEach(ch => {
        ch.cards.forEach(c => {
          if (selectedSet.has(c.id)) cardsToEnsure.push(c)
        })
      })
      await ensureGoodsLoadedForCards(cardsToEnsure)

      const chainPayloads = targetChains.map(ch => buildChainJsonPayload(ch, selectedSet)).filter(Boolean)

      const sumDSB = chainPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_chuoi.doanh_so_ban_truoc_vat || 0), 0)
      const sumGiaMua = chainPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_chuoi.gia_mua_chua_vat || 0), 0)
      const sumCP = chainPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_chuoi.tong_chi_phi_don_hang || 0), 0)
      const sumGrossCom = chainPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_chuoi.gross_com_truoc_thue || 0), 0)
      const sumThue = chainPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_chuoi.thue_chenh_lech_gia || 0), 0)
      const sumNetCom = chainPayloads.reduce((s, c) => s + (c.tong_hop_tai_chinh_chuoi.net_com_con_lai || 0), 0)
      const sumNetPO = sumDSB - sumGrossCom
      const sumNetMargin = sumDSB - sumGrossCom - sumCP

      const exportDoc = {
        loai_xuat_du_lieu: 'THEO_CHUOI_CARD_LIEN_KET',
        thoi_gian_xuat: new Date().toISOString(),
        tong_so_chuoi_lien_ket: chainPayloads.length,
        tong_so_card_da_chon: cardsToEnsure.length,
        tong_hop_tai_chinh_cac_chuoi: {
          doanh_so_ban_truoc_vat: sumDSB,
          gia_mua_chua_vat: sumGiaMua,
          tong_chi_phi_don_hang: sumCP,
          gross_com_truoc_thue: sumGrossCom,
          thue_chenh_lech_gia: sumThue,
          net_com_con_lai: sumNetCom,
          net_po: sumNetPO,
          net_margin: sumNetMargin
        },
        danh_sach_chuoi_lien_ket: chainPayloads
      }

      const prefix = chainPayloads.length === 1
        ? `JSON_ChuoiLienKet_${chainPayloads[0].thong_ke_chuoi.so_card_da_chon_xuat}Card_${sanitizeJsonFileName(chainPayloads[0].thong_tin_khach_hang.ten_khach_hang || chainPayloads[0].thong_tin_khach_hang.ma_khach_hang)}`
        : `JSON_${chainPayloads.length}_ChuoiLienKet_${cardsToEnsure.length}Card`
      triggerDownloadJsonFile(exportDoc, prefix)
    } else if (jsonExportScope.value === 'card') {
      const selectedIds = jsonSelectedCardIds.value || []
      const selectedCards = (files.value || []).filter(f => selectedIds.includes(f.id))
      const allNodesToEnsure = []
      selectedCards.forEach(c => {
        if (jsonIncludeLinkedChildren.value) {
          collectAllNodesFromRoot(c, allNodesToEnsure)
        } else {
          allNodesToEnsure.push(c)
        }
      })
      await ensureGoodsLoadedForCards(allNodesToEnsure)

      const cardPayloads = selectedCards.map(c => {
        const cus = (customers.value || []).find(cu => cu.ma_khach_hang === c.maKH) || null
        return buildCardJsonPayload(c, cus, { includeChildren: jsonIncludeLinkedChildren.value })
      })

      const sumDSB = cardPayloads.reduce((s, c) => s + (c.du_lieu_tai_chinh.tong_hop_tai_chinh_card.doanh_so_ban_truoc_vat || 0), 0)
      const sumGiaMua = cardPayloads.reduce((s, c) => s + (c.du_lieu_tai_chinh.tong_hop_tai_chinh_card.gia_mua_chua_vat || 0), 0)
      const sumCP = cardPayloads.reduce((s, c) => s + (c.du_lieu_tai_chinh.tong_hop_tai_chinh_card.tong_chi_phi_don_hang || 0), 0)
      const sumGrossCom = cardPayloads.reduce((s, c) => s + (c.du_lieu_tai_chinh.tong_hop_tai_chinh_card.gross_com_truoc_thue || 0), 0)
      const sumThue = cardPayloads.reduce((s, c) => s + (c.du_lieu_tai_chinh.tong_hop_tai_chinh_card.thue_chenh_lech_gia || 0), 0)
      const sumNetCom = cardPayloads.reduce((s, c) => s + (c.du_lieu_tai_chinh.tong_hop_tai_chinh_card.net_com_con_lai || 0), 0)
      const sumNetPO = sumDSB - sumGrossCom
      const sumNetMargin = sumDSB - sumGrossCom - sumCP

      const allGoods = []
      cardPayloads.forEach(c => {
        ;(c.du_lieu_hang_hoa?.danh_sach_hang_hoa || []).forEach(g => {
          allGoods.push({
            ...g,
            stt_tong: allGoods.length + 1,
            id_card: c.id_card,
            ma_khach_hang: c.ma_khach_hang,
            ten_khach_hang: c.ten_khach_hang,
            noi_dung_card: c.noi_dung
          })
        })
      })

      const exportDoc = {
        loai_xuat_du_lieu: 'THEO_CARD',
        thoi_gian_xuat: new Date().toISOString(),
        bao_gom_card_con_lien_ket: !!jsonIncludeLinkedChildren.value,
        tong_so_card_da_chon: cardPayloads.length,
        tong_hop_tai_chinh_cac_card: {
          doanh_so_ban_truoc_vat: sumDSB,
          gia_mua_chua_vat: sumGiaMua,
          tong_chi_phi_don_hang: sumCP,
          gross_com_truoc_thue: sumGrossCom,
          thue_chenh_lech_gia: sumThue,
          net_com_con_lai: sumNetCom,
          net_po: sumNetPO,
          net_margin: sumNetMargin
        },
        tong_hop_hang_hoa_cac_card: {
          tong_so_mat_hang: allGoods.length,
          danh_sach_hang_hoa: allGoods
        },
        danh_sach_card: cardPayloads
      }

      const prefix = cardPayloads.length === 1
        ? `JSON_Card_${sanitizeJsonFileName(cardPayloads[0].ten_khach_hang || cardPayloads[0].ma_khach_hang)}_${sanitizeJsonFileName(cardPayloads[0].noi_dung || cardPayloads[0].id_card)}`
        : `JSON_${cardPayloads.length}_Card_TaiChinh_HangHoa`
      triggerDownloadJsonFile(exportDoc, prefix)
    }
  } catch (err) {
    console.error('Lỗi khi xuất file JSON từ modal:', err)
    await showAlert('Không thể xuất file JSON: ' + (err.message || err), 'Lỗi xuất JSON')
  } finally {
    isExportingJson.value = false
  }
}

const getOfficialSaleReportForFile = (file) => {
  const officials = getAllOfficialReportsForFile(file)
  return officials.length > 0 ? officials[0] : null
}

const isFileChotDeal = (file) => {
  if (!file) return false
  return getSaleReportStatsForFile(file).closed > 0
}

const reconcileChotDealWithSaleReport = async () => {
  if (!officialReportsLoaded.value || isChotDealLoading.value) return

  // 1. Kiểm tra từng bản nháp trong sale_report_craft xem bản ghi sale_report tương ứng còn tồn tại không
  const crafts = craftReportsMap.value || {}
  for (const craftKey of Object.keys(crafts)) {
    const c = crafts[craftKey]
    if (!c || !c.chotDeal) continue
    const offRep = getOfficialReportForCraft(craftKey, c.id_quanlyfile || c.id_quan_ly_file || '', c.id_sale_report || '')
    if (!offRep) {
      try {
        await update(dbRef(db, 'sale_report_craft/' + craftKey), {
          chotDeal: false,
          id_sale_report: ''
        })
        if (craftModal.value.show && Array.isArray(craftModal.value.items)) {
          craftModal.value.items.forEach(tabIt => {
            if (tabIt.craftId === craftKey) {
              tabIt.chotDeal = false
              tabIt.srId = ''
            }
          })
        }
      } catch (e) {
        console.error('Lỗi gỡ trạng thái chotDeal trên craft:', e)
      }
    }
  }

  // 2. Kiểm tra trên từng file của quan_ly_file
  for (const file of files.value) {
    if (!file || !file.id) continue
    const officialReps = getAllOfficialReportsForFile(file)

    // Backfill id_quanlyfile cho các bản ghi sale_report cũ nếu chưa có
    for (const offRep of officialReps) {
      if (offRep && offRep.id && !offRep.id_quanlyfile) {
        try {
          await update(dbRef(db, 'sale_report/' + offRep.id), {
            id_quanlyfile: file.id,
            id_quan_ly_file: file.id
          })
        } catch (e) {
          console.warn('Lỗi cập nhật id_quanlyfile:', e)
        }
      }
    }

    // Nếu file đang đánh dấu đã chốt deal nhưng tất cả bản ghi bên sale_report đã bị xóa -> gỡ trạng thái đã chốt
    if (file.craft_chotDeal && officialReps.length === 0) {
      try {
        await update(dbRef(db, 'quan_ly_file/' + file.id), {
          craft_chotDeal: false,
          id_sale_report: '',
          sale_report_ids: []
        })
        if (editingId.value === file.id) {
          formData.value.craft_chotDeal = false
          formData.value.id_sale_report = ''
          formData.value.sale_report_ids = []
        }
      } catch (e) {
        console.error('Lỗi đồng bộ trạng thái xóa chốt deal:', e)
      }
    }
  }
}

const getSaleReportForFile = (file) => {
  if (!file) return null
  const crafts = getAllCraftReportsForFile(file)
  if (crafts.length > 0) return crafts[0]
  const officials = getAllOfficialReportsForFile(file)
  if (officials.length > 0) return officials[0]
  return null
}

const hasSaleReport = (file) => {
  if (!file) return false
  return getSaleReportStatsForFile(file).total > 0
}

function serializeCraftItem(it) {
  if (!it) return ''
  return JSON.stringify({
    doanhSoBan: Number(it.doanhSoBan || 0),
    giaMua: Number(it.giaMua || 0),
    tongCP: Number(it.tongCP || 0),
    grossCom: Number(it.grossCom || 0),
    taxPct: Number(it.taxPct ?? 25),
    netCom: Number(it.netCom || 0),
    soPO: String(it.soPO || ''),
    productType: String(it.productType || ''),
    customer: String(it.customer || ''),
    recipient: String(it.recipient || ''),
    mst: String(it.mst || ''),
    content: String(it.content || ''),
    am: String(it.am || ''),
    createdTime: String(it.createdTime || ''),
    predictPct: String(it.predictPct || ''),
    existingImgUrl: String(it.existingImgUrl || ''),
    base64Img: String(it.base64Img || ''),
    linkBaoGia: String(it.linkBaoGia || ''),
    linkMuaHang: String(it.linkMuaHang || ''),
    tenFileBG: String(it.tenFileBG || ''),
    tenFileMH: String(it.tenFileMH || ''),
    goodsList: (it.goodsList || []).map(g => ({
      ten: String(g.ten || ''),
      dvt: String(g.dvt || ''),
      sl: Number(g.sl || 0),
      donGia: Number(g.donGia || 0),
      dienGiai: String(g.dienGiai || ''),
      danhMuc: String(g.danhMuc || ''),
      vatPct: Number(g.vatPct || 0)
    }))
  })
}

const isCraftAllSaved = computed(() => {
  const list = craftModal.value.items || []
  if (!list.length) return false
  return list.every(it => Boolean(it.craftId || it.srId) && Boolean(it._savedSnapshot) && serializeCraftItem(it) === it._savedSnapshot)
})

const craftCustomerPickerOpen = ref(false)
const craftCustomerSearchQuery = ref('')

const filteredCraftCustomers = computed(() => {
  const list = Array.isArray(customers.value) ? customers.value : []
  const q = String(craftCustomerSearchQuery.value || '').trim().toLowerCase()
  if (!q) return list.slice(0, 60)
  return list.filter(c => {
    if (!c) return false
    const searchStr = [
      c.ten_cong_ty,
      c.ten_khach_hang,
      c.ma_khach_hang,
      c.ma_cong_ty,
      c.mst,
      c.sdt,
      c.email
    ].filter(Boolean).join(' ').toLowerCase()
    return searchStr.includes(q)
  }).slice(0, 60)
})

function toggleCraftCustomerPicker() {
  craftCustomerPickerOpen.value = !craftCustomerPickerOpen.value
  if (craftCustomerPickerOpen.value) {
    craftCustomerSearchQuery.value = ''
  }
}

function normalizeCustomerCompareStr(s) {
  return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

function findDbCustomerByFields(mst, comp, rec, fallbackMaKH = '') {
  const list = Array.isArray(customers.value) ? customers.value : []
  if (!list.length) return null

  const mstClean = String(mst || '').replace(/[^0-9A-Za-z-]/g, '').trim()
  if (mstClean && mstClean.length >= 8) {
    const byMst = list.find(c => c && String(c.mst || '').replace(/[^0-9A-Za-z-]/g, '').trim() === mstClean)
    if (byMst) return byMst
  }

  const compTrim = String(comp || '').trim()
  const recTrim = String(rec || '').trim()
  if (compTrim || recTrim) {
    const genKH = genMaKhachHang(recTrim, compTrim)
    const genCT = genMaCongTy(compTrim || recTrim)
    if (genKH) {
      const byGenKH = list.find(c => c && String(c.ma_khach_hang || '').trim() === genKH)
      if (byGenKH) return byGenKH
    }
    if (genCT) {
      const byGenCT = list.find(c => c && (String(c.ma_cong_ty || '').trim() === genCT || String(c.ma_khach_hang || '').trim() === genCT))
      if (byGenCT) return byGenCT
    }
    if (compTrim) {
      const normComp = normalizeCustomerCompareStr(compTrim)
      const byName = list.find(c => c && (normalizeCustomerCompareStr(c.ten_cong_ty) === normComp || normalizeCustomerCompareStr(c.ten_khach_hang) === normComp))
      if (byName) return byName
    }
    if (recTrim && !compTrim) {
      const normRec = normalizeCustomerCompareStr(recTrim)
      const byRec = list.find(c => c && normalizeCustomerCompareStr(c.ten_khach_hang) === normRec)
      if (byRec) return byRec
    }
  }

  const targetMa = String(fallbackMaKH || '').trim()
  if (targetMa) {
    const byMa = list.find(c => c && String(c.ma_khach_hang || '').trim() === targetMa)
    if (byMa) return byMa
  }

  return null
}

function getCraftLinkedCustomer(item) {
  if (!item) return null
  const list = Array.isArray(customers.value) ? customers.value : []
  if (!list.length) return null

  // 1. Tra cứu theo MST / Tên công ty / Người nhận đang nhập trong Craft trước
  const byFields = findDbCustomerByFields(item.mst, item.customer, item.recipient, '')
  if (byFields) return byFields

  // 2. Fallback theo linkedMaKH của tab Craft hoặc maKH của File bên ngoài
  const targetMaKH = String(item.linkedMaKH || formData.value?.maKH || '').trim()
  if (targetMaKH) {
    const byMaKH = list.find(c => c && String(c.ma_khach_hang || '').trim() === targetMaKH)
    if (byMaKH) return byMaKH
  }
  return null
}

function getCraftVsFileCustomerMismatch(item) {
  if (!item) return null
  const list = Array.isArray(customers.value) ? customers.value : []
  const fileMaKH = String(formData.value?.maKH || '').trim()
  const fileCus = fileMaKH ? (list.find(c => c && String(c.ma_khach_hang || '').trim() === fileMaKH) || null) : null
  const fileComp = String(fileCus?.ten_cong_ty || '').trim()
  const fileRec = String(fileCus?.ten_khach_hang || fileMaKH).trim()
  const fileMst = String(fileCus?.mst || '').trim()

  const craftComp = String(item.customer || '').trim()
  const craftRec = String(item.recipient || '').trim()
  const craftMst = String(item.mst || '').trim()

  // Nếu cả hai bên đều trống -> không cảnh báo
  if (!fileMaKH && !craftComp && !craftRec && !craftMst) return null

  const matchedByCraftFields = findDbCustomerByFields(craftMst, craftComp, craftRec, '')
  const explicitLinkedMa = String(item.linkedMaKH || '').trim()
  const craftMaKH = String(
    matchedByCraftFields?.ma_khach_hang ||
    (explicitLinkedMa && explicitLinkedMa !== fileMaKH ? explicitLinkedMa : '') ||
    ((craftComp || craftRec) ? genMaKhachHang(craftRec, craftComp) : '')
  ).trim()

  // Trường hợp 1: Modal File chưa chọn KH nhưng Modal Craft đã có thông tin KH
  if (!fileMaKH && (craftComp || craftRec)) {
    return {
      type: 'file_empty',
      fileMaKH: '',
      fileComp: '',
      fileRec: 'Chưa chọn khách hàng',
      fileMst: '',
      craftMaKH,
      craftComp: craftComp || craftRec,
      craftRec: craftRec || craftComp,
      craftMst,
      canUpdateCurrentDbName: false
    }
  }

  // Trường hợp 2: Modal File đã có KH nhưng Modal Craft bị xóa trống hoàn toàn
  if (fileMaKH && !craftComp && !craftRec && !craftMst) {
    return {
      type: 'craft_empty',
      fileMaKH,
      fileComp: fileComp || fileRec,
      fileRec,
      fileMst,
      craftMaKH: '',
      craftComp: '',
      craftRec: 'Chưa nhập khách hàng',
      craftMst: '',
      canUpdateCurrentDbName: false
    }
  }

  // Trường hợp 3: Cả Modal File và Modal Craft đều có thông tin -> kiểm tra độ lệch
  const expectedCraftComp = fileComp || fileRec
  const compDiff = Boolean(
    craftComp && expectedCraftComp &&
    normalizeCustomerCompareStr(craftComp) !== normalizeCustomerCompareStr(expectedCraftComp)
  )
  const recDiff = Boolean(
    craftRec && fileRec &&
    normalizeCustomerCompareStr(craftRec) !== normalizeCustomerCompareStr(fileRec)
  )
  const mstCleanFile = fileMst.replace(/[^0-9A-Za-z-]/g, '')
  const mstCleanCraft = craftMst.replace(/[^0-9A-Za-z-]/g, '')
  const mstDiff = Boolean(mstCleanFile && mstCleanCraft && mstCleanFile !== mstCleanCraft)
  const codeDiff = Boolean(
    (matchedByCraftFields && String(matchedByCraftFields.ma_khach_hang || '').trim() !== fileMaKH) ||
    (explicitLinkedMa && explicitLinkedMa !== fileMaKH && (compDiff || recDiff || mstDiff))
  )

  if (!compDiff && !recDiff && !mstDiff && !codeDiff) {
    return null
  }

  return {
    type: codeDiff ? 'different_customer' : 'name_or_mst_diff',
    fileMaKH,
    fileComp: fileComp || fileRec,
    fileRec,
    fileMst,
    craftMaKH: matchedByCraftFields?.ma_khach_hang || (codeDiff ? craftMaKH : fileMaKH),
    craftComp: craftComp || craftRec,
    craftRec: craftRec || craftComp,
    craftMst,
    canUpdateCurrentDbName: Boolean(fileCus && (compDiff || recDiff || mstDiff))
  }
}

const outerModalFileCraftMismatch = computed(() => {
  if (!isModalOpen.value) return null
  const fd = formData.value || {}
  const fileMaKH = String(fd.maKH || '').trim()
  const list = Array.isArray(customers.value) ? customers.value : []
  const fileCus = fileMaKH ? (list.find(c => c && String(c.ma_khach_hang || '').trim() === fileMaKH) || null) : null
  const fileLabel = fileMaKH
    ? `${fileCus?.ten_cong_ty || fileCus?.ten_khach_hang || fileMaKH}${fileCus?.ten_khach_hang && fileCus?.ten_cong_ty ? ' - ' + fileCus.ten_khach_hang : ''} (Mã: ${fileMaKH})`
    : 'Chưa chọn khách hàng'

  // Kiểm tra các tab đang mở/tạm trong craftModal nếu cùng file, hoặc các bản ghi sale_report_craft của file này
  let candidateItems = []
  if (Array.isArray(craftModal.value.items) && craftModal.value.items.length > 0) {
    candidateItems = craftModal.value.items
  } else {
    const fileWithId = editingId.value ? { ...fd, id: editingId.value } : fd
    const crafts = getAllCraftReportsForFile(fileWithId)
    const officials = getAllOfficialReportsForFile(fileWithId)
    const craftIdSet = new Set(crafts.map(c => c.id))
    const standaloneOfficials = officials.filter(o => !o.from_craft || !craftIdSet.has(o.from_craft))
    const combined = [...crafts, ...standaloneOfficials]
    candidateItems = combined.map(r => ({
      craftId: r.is_craft !== false ? (r.id || r.ID || '') : (r.from_craft || ''),
      srId: r.is_craft === false ? (r.id || r.ID || '') : (r.id_sale_report || ''),
      customer: r.Ten_cong_ty || r.customer || '',
      recipient: r.Ten_khach_hang || r.recipient || '',
      mst: r.MST || r.mst || '',
      linkedMaKH: r.Ma_khach_hang || '',
      linkedMaCongTy: r.Ma_cong_ty || ''
    }))
  }

  for (const it of candidateItems) {
    const m = getCraftVsFileCustomerMismatch(it)
    if (m) {
      const craftLabel = `${m.craftComp || m.craftRec || 'Chưa rõ'}${m.craftRec && m.craftComp && m.craftRec !== m.craftComp ? ' - ' + m.craftRec : ''}${m.craftMaKH ? ' (Mã: ' + m.craftMaKH + ')' : ''}`
      return {
        ...m,
        fileLabel,
        craftLabel,
        sourceItem: it
      }
    }
  }
  return null
})

const isCustomerMismatchPopupOpen = ref(false)
const selectedMismatchChoice = ref('')

const activeFileCraftCustomerMismatch = computed(() => {
  if (craftModal.value.show && craftModal.value.item) {
    const m = getCraftVsFileCustomerMismatch(craftModal.value.item)
    if (!m) return null
    const fileLabel = m.fileMaKH
      ? `${m.fileComp || m.fileRec || m.fileMaKH}${m.fileRec && m.fileComp && m.fileRec !== m.fileComp ? ' - ' + m.fileRec : ''} (Mã: ${m.fileMaKH})`
      : 'Chưa chọn khách hàng'
    const craftLabel = `${m.craftComp || m.craftRec || 'Chưa rõ'}${m.craftRec && m.craftComp && m.craftRec !== m.craftComp ? ' - ' + m.craftRec : ''}${m.craftMaKH ? ' (Mã: ' + m.craftMaKH + ')' : ''}`
    return {
      ...m,
      fileLabel,
      craftLabel,
      sourceItem: craftModal.value.item,
      context: 'craft'
    }
  }
  if (isModalOpen.value && outerModalFileCraftMismatch.value) {
    return {
      ...outerModalFileCraftMismatch.value,
      context: 'file'
    }
  }
  return null
})

function checkAndOpenCustomerMismatchPopup() {
  if (activeFileCraftCustomerMismatch.value) {
    selectedMismatchChoice.value = ''
    isCustomerMismatchPopupOpen.value = true
  } else {
    selectedMismatchChoice.value = ''
    isCustomerMismatchPopupOpen.value = false
  }
}

watch(
  () => [
    isModalOpen.value,
    craftModal.value.show,
    craftModal.value.activeIndex,
    formData.value?.maKH,
    craftModal.value.item?.linkedMaKH
  ],
  () => {
    checkAndOpenCustomerMismatchPopup()
  }
)

async function handleMismatchPopupUseModalFile() {
  const m = activeFileCraftCustomerMismatch.value
  if (!m) return
  if (m.context === 'file') {
    await syncAllCraftReportsToOuterFileCustomer()
  } else {
    await resolveMismatchUseModalFile(m.sourceItem)
  }
  selectedMismatchChoice.value = ''
  isCustomerMismatchPopupOpen.value = false
}

async function handleMismatchPopupUseModalCraft() {
  const m = activeFileCraftCustomerMismatch.value
  if (!m) return
  await resolveMismatchUseModalCraft(m.sourceItem)
  selectedMismatchChoice.value = ''
  isCustomerMismatchPopupOpen.value = false
}

async function confirmCustomerMismatchChoice() {
  if (selectedMismatchChoice.value === 'file') {
    await handleMismatchPopupUseModalFile()
  } else if (selectedMismatchChoice.value === 'craft') {
    await handleMismatchPopupUseModalCraft()
  }
}

async function handleMismatchPopupUpdateDbName() {
  const m = activeFileCraftCustomerMismatch.value
  if (!m) return
  await updateCurrentDbCustomerNameFromCraft(m.sourceItem)
  isCustomerMismatchPopupOpen.value = false
}

async function resolveMismatchUseModalFile(targetItem) {
  const item = targetItem || craftModal.value.item
  if (!item) return
  const fileMaKH = String(formData.value?.maKH || '').trim()
  if (!fileMaKH) return
  const list = Array.isArray(customers.value) ? customers.value : []
  const fileCus = list.find(c => c && String(c.ma_khach_hang || '').trim() === fileMaKH)

  const newComp = fileCus?.ten_cong_ty || fileCus?.ten_khach_hang || fileMaKH
  const newRec = fileCus?.ten_khach_hang || fileCus?.ten_cong_ty || fileMaKH
  const newMst = fileCus?.mst || ''
  const newMaCT = fileCus?.ma_cong_ty || genMaCongTy(newComp)

  item.customer = newComp
  item.recipient = newRec
  item.mst = newMst
  item.linkedMaKH = fileMaKH
  item.linkedMaCongTy = newMaCT
  item._approvedDbNameUpdate = false

  if (item.craftId) {
    try {
      deepUnproxyFirebaseObj(db)
      await update(dbRef(db, 'sale_report_craft/' + item.craftId), {
        Ma_khach_hang: fileMaKH,
        Ma_cong_ty: newMaCT,
        Ten_cong_ty: newComp,
        Ten_khach_hang: newRec,
        MST: newMst
      })
    } catch (e) {
      console.warn('Lỗi cập nhật sale_report_craft theo Modal File:', e)
    }
  }
}

async function syncAllCraftReportsToOuterFileCustomer() {
  const fileMaKH = String(formData.value?.maKH || '').trim()
  if (!fileMaKH) return
  if (Array.isArray(craftModal.value.items) && craftModal.value.items.length > 0) {
    for (const it of craftModal.value.items) {
      await resolveMismatchUseModalFile(it)
    }
  }
  const fileWithId = editingId.value ? { ...formData.value, id: editingId.value } : formData.value
  const crafts = getAllCraftReportsForFile(fileWithId)
  for (const c of crafts) {
    if (c && c.id) {
      await resolveMismatchUseModalFile({
        craftId: c.id,
        customer: c.Ten_cong_ty || '',
        recipient: c.Ten_khach_hang || '',
        mst: c.MST || ''
      })
    }
  }
}

async function updateCurrentDbCustomerNameFromCraft(targetItem) {
  const item = targetItem || craftModal.value.item
  if (!item) return
  const fileMaKH = String(formData.value?.maKH || '').trim()
  if (!fileMaKH) return
  const list = Array.isArray(customers.value) ? customers.value : []
  const fileCus = list.find(c => c && String(c.ma_khach_hang || '').trim() === fileMaKH)
  if (!fileCus || !fileCus.id) return

  const rawComp = String(item.customer || '').trim()
  const rawRec = String(item.recipient || '').trim()
  const rawMst = String(item.mst || '').trim()

  const updates = {}
  if (rawComp) updates.ten_cong_ty = rawComp
  if (rawRec) updates.ten_khach_hang = rawRec
  if (rawMst) updates.mst = rawMst

  // QUY TẮC BẤT BIẾN: Giữ cố định 100% ma_khach_hang và ma_cong_ty
  const fixedMaKH = fileCus.ma_khach_hang
  const fixedMaCT = fileCus.ma_cong_ty || genMaCongTy(rawComp || fileCus.ten_cong_ty || rawRec || fileCus.ten_khach_hang)

  try {
    deepUnproxyFirebaseObj(db)
    if (Object.keys(updates).length > 0) {
      await update(dbRef(db, 'khach_hang/' + fileCus.id), toPlainFirebaseData(updates))
    }
    item.linkedMaKH = fixedMaKH
    item.linkedMaCongTy = fixedMaCT
    if (!item.customer && (updates.ten_cong_ty || fileCus.ten_cong_ty)) item.customer = updates.ten_cong_ty || fileCus.ten_cong_ty
    if (!item.recipient && (updates.ten_khach_hang || fileCus.ten_khach_hang)) item.recipient = updates.ten_khach_hang || fileCus.ten_khach_hang
    if (!item.mst && (updates.mst || fileCus.mst)) item.mst = updates.mst || fileCus.mst
    item._approvedDbNameUpdate = true

    if (item.craftId) {
      await update(dbRef(db, 'sale_report_craft/' + item.craftId), {
        Ma_khach_hang: fixedMaKH,
        Ma_cong_ty: fixedMaCT,
        Ten_cong_ty: rawComp || fileCus.ten_cong_ty || '',
        Ten_khach_hang: rawRec || fileCus.ten_khach_hang || '',
        MST: rawMst || fileCus.mst || ''
      })
    }
  } catch (e) {
    console.warn('Lỗi cập nhật tên khách hàng vào DB:', e)
  }
}

async function resolveMismatchUseModalCraft(targetItem) {
  const item = targetItem || craftModal.value.item
  if (!item) return
  const rawComp = String(item.customer || '').trim()
  const rawRec = String(item.recipient || '').trim()
  const rawMst = String(item.mst || '').trim()
  if (!rawComp && !rawRec && !item.linkedMaKH) return

  deepUnproxyFirebaseObj(db)
  // Tìm xem thông tin trên Craft có khớp với KH nào đã có trong DB không
  const matchedCus = findDbCustomerByFields(rawMst, rawComp, rawRec, item.linkedMaKH && item.linkedMaKH !== formData.value?.maKH ? item.linkedMaKH : '')
  let finalMaKH = ''
  let finalMaCT = ''
  let finalComp = rawComp || rawRec
  let finalRec = rawRec || rawComp
  let finalMst = rawMst

  if (matchedCus) {
    // Giữ nguyên 100% mã KH & mã công ty trong DB
    finalMaKH = String(matchedCus.ma_khach_hang || '').trim()
    finalMaCT = String(matchedCus.ma_cong_ty || '').trim() || genMaCongTy(matchedCus.ten_cong_ty || matchedCus.ten_khach_hang || finalComp)
    const khUpdates = {}
    if (rawComp && normalizeCustomerCompareStr(rawComp) !== normalizeCustomerCompareStr(matchedCus.ten_cong_ty)) {
      khUpdates.ten_cong_ty = rawComp
    }
    if (rawRec && normalizeCustomerCompareStr(rawRec) !== normalizeCustomerCompareStr(matchedCus.ten_khach_hang)) {
      khUpdates.ten_khach_hang = rawRec
    }
    if (rawMst && rawMst !== matchedCus.mst) {
      khUpdates.mst = rawMst
    }
    if (Object.keys(khUpdates).length > 0 && matchedCus.id) {
      try {
        await update(dbRef(db, 'khach_hang/' + matchedCus.id), toPlainFirebaseData(khUpdates))
      } catch (e) {
        console.warn('Lỗi cập nhật thông tin KH từ Craft:', e)
      }
    }
    finalComp = rawComp || matchedCus.ten_cong_ty || matchedCus.ten_khach_hang || finalComp
    finalRec = rawRec || matchedCus.ten_khach_hang || matchedCus.ten_cong_ty || finalRec
    finalMst = rawMst || matchedCus.mst || ''
  } else {
    // Tạo khách hàng mới trong bảng khach_hang
    finalMaKH = genMaKhachHang(finalRec, finalComp) || ('KH_' + Date.now())
    finalMaCT = genMaCongTy(finalComp || finalRec) || ('CTY_' + Date.now())
    try {
      const newKhRef = push(dbRef(db, 'khach_hang'))
      await set(newKhRef, toPlainFirebaseData({
        mst: finalMst,
        ma_cong_ty: finalMaCT,
        ten_cong_ty: finalComp,
        ma_khach_hang: finalMaKH,
        ten_khach_hang: finalRec,
        sdt: '',
        email: '',
        dia_chi: '',
        ngay_thanh_lap: '',
        doanh_so: 0,
        cong_no: 0,
        ghi_chu: 'Tạo tự động từ Sale Report Craft',
        createdAt: Date.now()
      }))
    } catch (e) {
      console.warn('Lỗi tạo mới KH từ Craft:', e)
    }
  }

  item.customer = finalComp
  item.recipient = finalRec
  item.mst = finalMst
  item.linkedMaKH = finalMaKH
  item.linkedMaCongTy = finalMaCT
  item._approvedDbNameUpdate = true

  if (formData.value) {
    formData.value.maKH = finalMaKH
  }
  if (editingId.value && finalMaKH) {
    try {
      await update(dbRef(db, 'quan_ly_file/' + editingId.value), { maKH: finalMaKH, updatedTime: Date.now() })
      syncOriginalFormDataBaseline(['maKH'])
    } catch (e) {
      console.warn('Lỗi đồng bộ maKH vào quan_ly_file:', e)
    }
  }
  if (item.craftId && finalMaKH) {
    try {
      await update(dbRef(db, 'sale_report_craft/' + item.craftId), {
        Ma_khach_hang: finalMaKH,
        Ma_cong_ty: finalMaCT,
        Ten_cong_ty: finalComp,
        Ten_khach_hang: finalRec,
        MST: finalMst
      })
    } catch (e) {
      console.warn('Lỗi đồng bộ sale_report_craft:', e)
    }
  }
}

async function syncOuterFileCustomerToCraftReport() {
  const mismatch = outerModalFileCraftMismatch.value
  if (!mismatch || !mismatch.sourceItem) return
  await resolveMismatchUseModalCraft(mismatch.sourceItem)
}

function hasCraftCustomerDiffWithQuote(item) {
  if (!item) return false
  const dbCus = getCraftLinkedCustomer(item)
  if (!dbCus) return false
  const extComp = String(item.extractedCompany || '').trim()
  const extRec = String(item.extractedRecipient || '').trim()
  if (!extComp && !extRec) return false
  const dbComp = String(dbCus.ten_cong_ty || '').trim()
  const dbRec = String(dbCus.ten_khach_hang || '').trim()
  const compDiff = extComp && dbComp && normalizeCustomerCompareStr(extComp) !== normalizeCustomerCompareStr(dbComp)
  const recDiff = extRec && dbRec && normalizeCustomerCompareStr(extRec) !== normalizeCustomerCompareStr(dbRec)
  return Boolean(compDiff || recDiff)
}

function applyCraftCustomerSource(item, source) {
  if (!item) return
  const dbCus = getCraftLinkedCustomer(item)
  if (source === 'db' && dbCus) {
    item.customer = dbCus.ten_cong_ty || dbCus.ten_khach_hang || item.customer || ''
    item.recipient = dbCus.ten_khach_hang || item.recipient || ''
    item.mst = dbCus.mst || item.mst || ''
    item.linkedMaKH = dbCus.ma_khach_hang
    item.linkedMaCongTy = dbCus.ma_cong_ty || genMaCongTy(dbCus.ten_cong_ty || dbCus.ten_khach_hang)
    item._approvedDbNameUpdate = false
  } else if (source === 'quote') {
    if (item.extractedCompany) item.customer = item.extractedCompany
    if (item.extractedRecipient) item.recipient = item.extractedRecipient
    if (item.extractedMST) item.mst = item.extractedMST
    const matchedQuoteCus = findDbCustomerByFields(item.extractedMST || '', item.extractedCompany || '', item.extractedRecipient || '', '')
    if (matchedQuoteCus) {
      item.linkedMaKH = matchedQuoteCus.ma_khach_hang
      item.linkedMaCongTy = matchedQuoteCus.ma_cong_ty || genMaCongTy(matchedQuoteCus.ten_cong_ty || matchedQuoteCus.ten_khach_hang)
    } else {
      item.linkedMaKH = ''
      item.linkedMaCongTy = ''
    }
  }
  checkAndOpenCustomerMismatchPopup()
}

async function selectCustomerForCraftItem(cus) {
  const item = craftModal.value.item
  if (!item || !cus) return

  const currentOuterMaKH = String(formData.value?.maKH || '').trim()
  const newMaKH = String(cus.ma_khach_hang || '').trim()

  item.mst = cus.mst || item.mst || ''
  item.customer = cus.ten_cong_ty || cus.ten_khach_hang || ''
  item.recipient = cus.ten_khach_hang || ''
  item.linkedMaKH = newMaKH
  item.linkedMaCongTy = cus.ma_cong_ty || genMaCongTy(cus.ten_cong_ty || cus.ten_khach_hang)
  item._approvedDbNameUpdate = false
  craftCustomerPickerOpen.value = false

  if (currentOuterMaKH && currentOuterMaKH !== newMaKH) {
    checkAndOpenCustomerMismatchPopup()
    return
  }

  if (formData.value) {
    formData.value.maKH = newMaKH
  }
  if (editingId.value && newMaKH) {
    try {
      deepUnproxyFirebaseObj(db)
      await update(dbRef(db, 'quan_ly_file/' + editingId.value), { maKH: newMaKH, updatedTime: Date.now() })
      syncOriginalFormDataBaseline(['maKH'])
    } catch (e) {
      console.warn('Lỗi đồng bộ maKH vào quan_ly_file:', e)
    }
  }
}

function buildCraftItemFromRecord(r = {}, file = {}, cus = null) {
  const fd = formData.value || {}
  const resolvedFileId = file.id || editingId.value || fd.id || ''
  const hasOwnRecordCustomer = Boolean(r.Ma_khach_hang || r.Ten_cong_ty || r.Ten_khach_hang || r.customer || r.recipient)
  const recordMaKH = r.Ma_khach_hang || (!hasOwnRecordCustomer ? (fd.maKH || file.maKH || '') : '')
  const customerObj = hasOwnRecordCustomer
    ? (customers.value.find(c => c.ma_khach_hang === r.Ma_khach_hang) || null)
    : (cus || customers.value.find(c => c.ma_khach_hang === recordMaKH))
  const craftId = (r.is_craft !== false ? (r.id || r.ID) : (r.from_craft || '')) || ''
  const officialRep = getOfficialReportForCraft(craftId, resolvedFileId, r.id_sale_report || (r.is_craft === false ? (r.id || r.ID) : ''))
  const isClosed = officialReportsLoaded.value ? !!officialRep : !!(r.chotDeal || officialRep)

  const doanhSo = Number(r.Tong_tien_truoc_thueVAT ?? r.doanhSoBan ?? r.goodsTotal?.ttTruoc ?? 0)
  const giaMua = Number(r.Tong_thanh_tien_chua_VAT_mua_hang ?? r.giaMua ?? 0)
  const tongCP = Number(r.Tong_CP_don_hang ?? r.tongCP ?? 0)
  const grossCom = Number(r.chiet_khau_tong_truoc_thue ?? r.grossCom ?? 0)
  const taxPct = Number(r.phan_tram_thue_chenh_lech_gia ?? r.taxPct ?? 25)
  const netCom = Number(r.con_lai ?? r.netCom ?? (grossCom * (1 - taxPct / 100)))

  let resolvedGoodsTotal = r.goodsTotal ? JSON.parse(JSON.stringify(r.goodsTotal)) : null
  if (resolvedGoodsTotal && doanhSo > 0) {
    const vatVal = Number(resolvedGoodsTotal.vat || 0)
    resolvedGoodsTotal.ttTruoc = doanhSo
    resolvedGoodsTotal.vat = vatVal
    resolvedGoodsTotal.ttSau = doanhSo + vatVal
  }

  const itemObj = {
    craftId: craftId,
    srId: officialRep?.id || r.id_sale_report || '',
    chotDeal: isClosed,
    doanhSoBan: doanhSo,
    giaMua: giaMua,
    tongCP: tongCP,
    grossCom: grossCom,
    taxPct: taxPct,
    netCom: netCom,
    soPO: r.So_PO || r.soPO || '',
    productType: r.Ten_nha_cung_cap || r.productType || '',
    customer: r.Ten_cong_ty || r.customer || customerObj?.ten_cong_ty || customerObj?.ten_khach_hang || (!hasOwnRecordCustomer ? (fd.maKH || file.maKH || '') : ''),
    recipient: r.Ten_khach_hang || r.recipient || customerObj?.ten_khach_hang || '',
    mst: r.MST || r.mst || customerObj?.mst || '',
    linkedMaKH: r.Ma_khach_hang || customerObj?.ma_khach_hang || (!hasOwnRecordCustomer ? (fd.maKH || file.maKH || '') : ''),
    linkedMaCongTy: r.Ma_cong_ty || customerObj?.ma_cong_ty || '',
    extractedCompany: '',
    extractedRecipient: '',
    extractedMST: '',
    _approvedDbNameUpdate: false,
    content: r.content_of_contract_PO || r.content || fd.noiDung || file.noiDung || '',
    am: r.account_manager_name || r.am || '',
    createdTime: r.created_time || r.createdTime || '',
    ma_hop_dong: r.ma_hop_dong || officialRep?.ma_hop_dong || '',
    so_hop_dong: r.so_hop_dong || officialRep?.so_hop_dong || '',
    scanning: false,
    scanned: !!(r.img_save || r.base64Img),
    base64Img: r.base64Img || '',
    existingImgUrl: r.img_save || r.existingImgUrl || '',
    rawFileBaoGia: null,
    rawFileMuaHang: null,
    linkBaoGia: r.link_excel_bao_gia || r.linkBaoGia || '',
    linkMuaHang: r.link_excel_mua_hang || r.linkMuaHang || '',
    tenFileBG: r.ten_file_bao_gia || r.tenFileBG || (r.link_excel_bao_gia ? 'File báo giá đã lưu' : ''),
    tenFileMH: r.ten_file_mua_hang || r.tenFileMH || (r.link_excel_mua_hang ? 'File mua hàng đã lưu' : ''),
    previewHtmlBG: '',
    previewHtmlMH: '',
    goodsList: Array.isArray(r.goodsList) ? JSON.parse(JSON.stringify(r.goodsList)) : [],
    goodsTotal: resolvedGoodsTotal,
    predictPct: r.predictPct || '',
    _origGross: grossCom,
    _origNet: netCom,
    activeTab: 'metrics',
    _savedSnapshot: ''
  }
  if (!itemObj.content && (itemObj.tenFileBG || itemObj.tenFileMH)) {
    updateCraftContentFromFiles(itemObj)
  }
  if (itemObj.craftId || itemObj.srId) {
    itemObj._savedSnapshot = serializeCraftItem(itemObj)
  }
  return itemObj
}

function selectCraftTab(idx) {
  const items = craftModal.value.items || []
  if (idx < 0 || idx >= items.length) return
  craftModal.value.activeIndex = idx
  craftModal.value.item = items[idx]
  craftPreviewHtmlBG.value = items[idx]?.previewHtmlBG || ''
  craftPreviewHtmlMH.value = items[idx]?.previewHtmlMH || ''
  craftExistingPicker.value = null
  craftCustomerPickerOpen.value = false
}

function addNewCraftTab() {
  const fd = formData.value || {}
  const cus = customers.value.find(c => c.ma_khach_hang === fd.maKH)
  const newItem = buildCraftItemFromRecord({}, fd, cus)
  if (!Array.isArray(craftModal.value.items)) {
    craftModal.value.items = []
  }
  craftModal.value.items.push(newItem)
  selectCraftTab(craftModal.value.items.length - 1)
}

async function deleteCraftTab(idx) {
  const items = craftModal.value.items || []
  const target = items[idx]
  if (!target) return

  const tabName = target.soPO ? `PO ${target.soPO}` : `Báo cáo #${idx + 1}`
  if (target.craftId || target.srId) {
    const msg = target.chotDeal
      ? `"${tabName}" đã Chốt Deal.\nBạn có chắc muốn xóa cả bản nháp và bản Sale Report chính thức của tab này không?`
      : `Bạn có chắc muốn xóa bản Sale Report "${tabName}"?`
    if (!(await showConfirm(msg))) return
    try {
      if (target.craftId) {
        await remove(dbRef(db, 'sale_report_craft/' + target.craftId))
      }
      if (target.srId) {
        await remove(dbRef(db, 'sale_report/' + target.srId))
        await syncCustomerCongNoFromSaleReport()
      }
    } catch (e) {
      console.error('Lỗi xóa tab sale report:', e)
      await showAlert('Lỗi khi xóa: ' + (e.message || e))
      return
    }
  } else if (items.length > 1) {
    if (!(await showConfirm(`Bỏ tab "${tabName}" chưa lưu?`))) return
  }

  items.splice(idx, 1)
  await syncFileSaleReportMetadata()

  if (items.length === 0) {
    closeCraftModal()
  } else {
    const nextIdx = Math.min(idx, items.length - 1)
    selectCraftTab(nextIdx)
  }
}

async function openSaleReportForFile(payload, maybeTabIndex = 0) {
  const file = payload && payload.file ? payload.file : payload
  const targetTabIndex = payload && typeof payload.tabIndex === 'number'
    ? payload.tabIndex
    : (typeof maybeTabIndex === 'number' ? maybeTabIndex : 0)
  if (!file) return

  // Đồng bộ ngữ cảnh file được chọn vào editingId và formData (không ghi đè formData đang sửa nếu Modal File đang mở)
  const resolvedFileId = file.id || editingId.value || null
  editingId.value = resolvedFileId
  const fileWithId = { ...file, id: resolvedFileId || '' }
  if (!isModalOpen.value) {
    formData.value = { ...file }

    // Chuẩn hóa linkFileBaoGia & linkImgSave
    if (typeof formData.value.linkFileBaoGia === 'string') {
      formData.value.linkFileBaoGia = formData.value.linkFileBaoGia ? formData.value.linkFileBaoGia.split('\n') : []
    }
    if (typeof formData.value.linkImgSave === 'string') {
      formData.value.linkImgSave = formData.value.linkImgSave ? formData.value.linkImgSave.split('\n') : []
    }
    if (Array.isArray(formData.value.linkFileBaoGia)) {
      formData.value.linkFileBaoGia = formData.value.linkFileBaoGia.map(item => {
        if (typeof item === 'string') {
          const parts = item.split('/')
          let name = parts[parts.length - 1] || 'File'
          return { url: item, name: decodeURIComponent(name.split('?')[0]) }
        }
        return item
      })
    }
    if (Array.isArray(formData.value.linkImgSave)) {
      formData.value.linkImgSave = formData.value.linkImgSave.map(item => {
        if (typeof item === 'string') {
          const parts = item.split('/')
          let name = parts[parts.length - 1] || 'Ảnh'
          return { url: item, name: decodeURIComponent(name.split('?')[0]) }
        }
        return item
      })
    }
    syncOriginalFormDataBaseline()
  }

  // Tìm tất cả báo cáo sale report của file này
  let craftList = getAllCraftReportsForFile(fileWithId)
  const officialList = getAllOfficialReportsForFile(fileWithId)

  // Fallback đọc trực tiếp từ Firebase nếu local cache chưa kịp nạp
  if (craftList.length === 0 && fileWithId.id_sale_report_craft) {
    try {
      const { get } = await import('firebase/database')
      const snap = await get(dbRef(db, 'sale_report_craft/' + fileWithId.id_sale_report_craft))
      if (snap.exists()) {
        craftList = [{ id: fileWithId.id_sale_report_craft, ...snap.val() }]
      }
    } catch (e) {
      console.error('Lỗi fetch sale report craft:', e)
    }
  }

  if (craftList.length === 0 && fileWithId.id) {
    try {
      const { get } = await import('firebase/database')
      const snap = await get(dbRef(db, 'sale_report_craft'))
      if (snap.exists()) {
        const val = snap.val()
        for (const k in val) {
          if (val[k] && (val[k].id_quanlyfile === fileWithId.id || val[k].id_quan_ly_file === fileWithId.id)) {
            craftList.push({ id: k, ...val[k] })
          }
        }
      }
    } catch (e) {
      console.error('Lỗi tìm sale report craft theo file id:', e)
    }
  }

  const fd = formData.value
  const cus = customers.value.find(c => c.ma_khach_hang === (fd.maKH || file.maKH))

  // Gộp danh sách craft + các bản ghi official chưa có craft tương ứng
  const craftIdSet = new Set(craftList.map(c => c.id))
  const standaloneOfficials = officialList.filter(o => !o.from_craft || !craftIdSet.has(o.from_craft))
  const combinedRecords = [...craftList, ...standaloneOfficials]

  let builtItems = []
  if (combinedRecords.length > 0) {
    builtItems = combinedRecords.map(rec => buildCraftItemFromRecord(rec, fileWithId, cus))
  } else {
    builtItems = [buildCraftItemFromRecord({}, fileWithId, cus)]
  }

  formData.value.craft_ids = builtItems.map(it => it.craftId).filter(Boolean)
  formData.value.sale_report_ids = builtItems.map(it => it.srId).filter(Boolean)
  formData.value.id_sale_report_craft = formData.value.craft_ids[0] || file.id_sale_report_craft || ''
  formData.value.id_sale_report = formData.value.sale_report_ids[0] || file.id_sale_report || ''
  formData.value.craft_chotDeal = builtItems.some(it => it.chotDeal)

  const safeIdx = Math.min(Math.max(0, targetTabIndex), Math.max(0, builtItems.length - 1))
  craftModal.value = {
    show: true,
    items: builtItems,
    activeIndex: safeIdx,
    item: builtItems[safeIdx]
  }

  craftPreviewHtmlBG.value = ''
  craftPreviewHtmlMH.value = ''
  craftCustomerPickerOpen.value = false
}

function openCraftModal() {
  if (!editingId.value) return
  if (Array.isArray(craftModal.value.items) && craftModal.value.items.length > 0) {
    const safeIdx = Math.min(Math.max(0, craftModal.value.activeIndex || 0), craftModal.value.items.length - 1)
    craftModal.value.activeIndex = safeIdx
    craftModal.value.item = craftModal.value.items[safeIdx]
    craftModal.value.show = true
    craftCustomerPickerOpen.value = false
    return
  }
  if (hasSaleReport(formData.value)) {
    openSaleReportForFile(formData.value)
    return
  }
  const fd = formData.value
  const cus = customers.value.find(c => c.ma_khach_hang === fd.maKH)
  const firstItem = buildCraftItemFromRecord({}, fd, cus)
  craftModal.value = {
    show: true,
    items: [firstItem],
    activeIndex: 0,
    item: firstItem
  }
  craftPreviewHtmlBG.value = ''; craftPreviewHtmlMH.value = ''
  craftCustomerPickerOpen.value = false
}
function closeCraftModal() {
  craftModal.value.show = false
  craftExistingPicker.value = null
  craftCustomerPickerOpen.value = false
  if (!isModalOpen.value) {
    craftModal.value.item = null
    craftModal.value.items = []
    craftModal.value.activeIndex = 0
  }
}

function toggleExistingPicker(type) {
  if (craftExistingPicker.value === type) {
    craftExistingPicker.value = null
  } else {
    craftExistingPicker.value = type
  }
}

function getExistingUrl(item) {
  if (!item) return ''
  return typeof item === 'string' ? item : (item.url || '')
}

function getExistingName(item, defaultName = 'File') {
  if (!item) return defaultName
  if (typeof item === 'object' && item.name) return item.name
  const url = typeof item === 'string' ? item : (item.url || '')
  if (!url) return defaultName
  try {
    const seg = url.split('/').pop().split('?')[0]
    return decodeURIComponent(seg) || defaultName
  } catch {
    return defaultName
  }
}

function updateCraftContentFromFiles(item) {
  if (!item) return
  const bg = (item.tenFileBG && item.tenFileBG !== 'File báo giá đã lưu') ? item.tenFileBG.trim() : ''
  const mh = (item.tenFileMH && item.tenFileMH !== 'File mua hàng đã lưu') ? item.tenFileMH.trim() : ''
  if (bg && mh) {
    item.content = `${bg} - ${mh}`
  } else if (bg) {
    item.content = bg
  } else if (mh) {
    item.content = mh
  }
}

async function parseExcelBufferAndApply(ab, fileName, linkUrl, type) {
  const item = craftModal.value.item
  if (!item) return
  const isImportMH = type === 'mua_hang'
  const wb = XLSX.read(ab, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) { console.warn('[CraftImport] No worksheet found'); return }
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })
  console.log('[CraftImport] Parsed rows:', rows.length)
  let extractedDSB = 0, extractedCompany = '', extractedRecipient = '', extractedMST = ''
  let headerRowIdx = -1, sttIdx = -1, tenIdx = -1, dvtIdx = -1, slIdx = -1, dgIdx = -1, ttTruocIdx = -1
  let goodsList = [], currentCategory = ''
  const isTotalKeyword = (text) => {
    const u = String(text||'').toUpperCase().replace(/\s+/g,' ').trim()
    return u.includes('TỔNG CỘNG') || u.includes('TOTAL') || u.includes('TỔNG TIỀN') || u.includes('TỔNG GIÁ TRỊ') || u.includes('GRAND TOTAL') || (u.includes('TỔNG') && !u.includes('TỔNG CP') && u.length < 30) || u === 'CỘNG'
  }
  const extractNum = (text) => {
    const s = String(text||'').replace(/[,\s]/g,'').replace(/\.(\d{3})/g,'$1')
    const n = parseFloat(s)
    return !isNaN(n) && n > 0 ? n : 0
  }
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]; if (!row) continue
    if (headerRowIdx === -1) {
      for (let j = 0; j < row.length; j++) {
        const v = String(row[j] || '').toLowerCase().trim()
        if (v === 'stt' || v === 'no' || v === 'no.') sttIdx = j
        if (v.includes('tên') || v.includes('mô tả') || v.includes('diễn giải') || v.includes('hàng hóa') || v.includes('description')) tenIdx = j
        if (v.includes('đơn vị') || v === 'dvt' || v === 'unit') dvtIdx = j
        if (v.includes('số lượng') || v === 'sl' || v === 'qty') slIdx = j
        if ((v.includes('đơn giá') || v.includes('unit price')) && !v.includes('thành')) dgIdx = j
        if (v.includes('thành tiền') && !v.includes('vat') && !v.includes('sau')) ttTruocIdx = j
      }
      if (sttIdx !== -1 || tenIdx !== -1 || slIdx !== -1 || dgIdx !== -1) {
        headerRowIdx = i; if (tenIdx === -1 && sttIdx !== -1) tenIdx = sttIdx + 1
      }
    }
    if (headerRowIdx !== -1 && i > headerRowIdx) {
      const isTotalRow = row.some(c => isTotalKeyword(c))
      if (isTotalRow && !extractedDSB) {
        for (let j = 0; j < row.length; j++) {
          const nv = extractNum(row[j])
          if (nv > 1000) { extractedDSB = nv; break }
        }
      } else if (!isImportMH && !extractedDSB) {
        let ten = tenIdx >= 0 ? String(row[tenIdx]||'').trim() : ''
        let sl = slIdx >= 0 ? parseFloat(String(row[slIdx]||'0').replace(/,/g,''))||0 : 0
        let dg = dgIdx >= 0 ? parseFloat(String(row[dgIdx]||'0').replace(/,/g,''))||0 : 0
        let dvt = dvtIdx >= 0 ? String(row[dvtIdx]||'').trim() : ''
        if (ten && (sl > 0 || dg > 0)) goodsList.push({ ten, dvt, sl: sl||1, donGia: dg, dienGiai: '', danhMuc: currentCategory, vatPct: 0 })
        else if (ten && sl === 0 && dg === 0 && ten.length > 2 && !ten.toUpperCase().includes('CỘNG')) currentCategory = ten
      }
    }
    if (i <= 18 && (!extractedCompany || !extractedRecipient || !extractedMST)) {
      for (let j = 0; j < (row.length||0); j++) {
        const v = String(row[j]||'').trim(); if (!v) continue
        const vl = v.toLowerCase()
        if (!extractedCompany && (vl.includes('kính gởi') || vl.includes('kính gửi') || vl.includes('bên mua') || vl.includes('khách hàng'))) {
          const ci = v.indexOf(':')
          if (ci !== -1 && v.substring(ci+1).trim()) extractedCompany = v.substring(ci+1).trim()
          else if (rows[i+1]) { const nv = String(rows[i+1][j]||'').trim(); if (nv && nv.length > 2) extractedCompany = nv }
        }
        if (!extractedRecipient && vl.includes('người nhận')) {
          const ci = v.indexOf(':')
          if (ci !== -1 && v.substring(ci+1).trim()) extractedRecipient = v.substring(ci+1).trim()
        }
        if (!extractedMST && (vl.includes('mã số thuế') || vl.includes('mst') || vl.includes('tax code'))) {
          const ci = v.indexOf(':')
          let candidate = ci !== -1 ? v.substring(ci + 1).trim() : ''
          if (!candidate && row[j + 1]) candidate = String(row[j + 1] || '').trim()
          const mstMatch = candidate.match(/[0-9]{8,14}(?:-[0-9]{1,4})?/)
          if (mstMatch) extractedMST = mstMatch[0]
        }
      }
    }
  }
  if (!extractedDSB) {
    for (let i = rows.length-1; i >= 0; i--) {
      const row = rows[i]; if (!row) continue
      let foundKeyword = false
      for (let j = 0; j < row.length; j++) {
        if (isTotalKeyword(row[j])) {
          foundKeyword = true
          for (let k = j; k < row.length; k++) {
            const nv = extractNum(row[k])
            if (nv > 1000) { extractedDSB = nv; break }
          }
        }
      }
      if (extractedDSB) break
    }
  }
  if (!extractedDSB) {
    let maxVal = 0
    for (let i = Math.max(0, rows.length-10); i < rows.length; i++) {
      const row = rows[i]; if (!row) continue
      for (let j = 0; j < row.length; j++) {
        const nv = extractNum(row[j])
        if (nv > maxVal) maxVal = nv
      }
    }
    if (maxVal > 1000) extractedDSB = maxVal
  }

  let pHtml = XLSX.utils.sheet_to_html(ws)
  pHtml = pHtml.replace(/<table/gi, '<table style="border-collapse:collapse; font-size: 12px; color: #1e293b; background: white; width: 100%;"')
  pHtml = pHtml.replace(/<td/gi, '<td style="border: 1px solid #cbd5e1; padding: 4px 6px; white-space: nowrap;"')

  if (isImportMH) {
    item.giaMua = extractedDSB; item.tongCP = extractedDSB; item.linkMuaHang = linkUrl; item.tenFileMH = fileName; craftPreviewHtmlMH.value = pHtml; item.previewHtmlMH = pHtml
  } else {
    item.doanhSoBan = extractedDSB
    item.linkBaoGia = linkUrl
    item.tenFileBG = fileName
    craftPreviewHtmlBG.value = pHtml
    item.previewHtmlBG = pHtml
    item.extractedCompany = extractedCompany || ''
    item.extractedRecipient = extractedRecipient || ''
    item.extractedMST = extractedMST || ''

    if (extractedCompany || extractedRecipient || extractedMST) {
      if (extractedCompany) item.customer = extractedCompany
      if (extractedRecipient) item.recipient = extractedRecipient
      if (extractedMST) item.mst = extractedMST

      const matchedExcelCus = findDbCustomerByFields(extractedMST || '', extractedCompany || '', extractedRecipient || '', '')
      if (matchedExcelCus) {
        item.linkedMaKH = matchedExcelCus.ma_khach_hang
        item.linkedMaCongTy = matchedExcelCus.ma_cong_ty || genMaCongTy(matchedExcelCus.ten_cong_ty || matchedExcelCus.ten_khach_hang)
        if (!item.mst && matchedExcelCus.mst) item.mst = matchedExcelCus.mst
        if (!item.customer && matchedExcelCus.ten_cong_ty) item.customer = matchedExcelCus.ten_cong_ty
        if (!item.recipient && matchedExcelCus.ten_khach_hang) item.recipient = matchedExcelCus.ten_khach_hang
      } else {
        item.linkedMaKH = ''
        item.linkedMaCongTy = ''
      }
    }

    if (goodsList.length > 0) {
      item.goodsList = goodsList
      let tt = 0; for (const g of goodsList) tt += (parseFloat(g.sl)||0)*(parseFloat(g.donGia)||0)
      const resolvedTruoc = Number(item.doanhSoBan) > 0 ? Math.round(Number(item.doanhSoBan)) : Math.round(tt)
      if (!item.doanhSoBan && resolvedTruoc > 0) item.doanhSoBan = resolvedTruoc
      if (resolvedTruoc > 0) item.goodsTotal = { ttTruoc: resolvedTruoc, vat: 0, ttSau: resolvedTruoc }
    }
  }
  updateCraftContentFromFiles(item)
  onCraftFinancialInput()
  checkAndOpenCustomerMismatchPopup()
}

async function selectExistingFileForCraft(fileItem, type) {
  const item = craftModal.value.item
  if (!item) return
  const fileUrl = getExistingUrl(fileItem)
  const fileName = getExistingName(fileItem, type === 'bao_gia' ? 'BaoGia.xlsx' : 'MuaHang.xlsx')
  craftExistingPicker.value = null
  if (!fileUrl) return

  try {
    const lowerName = fileName.toLowerCase()
    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv') || fileUrl.includes('.xlsx') || fileUrl.includes('.xls')) {
      const res = await fetch(fileUrl)
      const ab = await res.arrayBuffer()
      await parseExcelBufferAndApply(ab, fileName, fileUrl, type)
    } else {
      if (type === 'mua_hang') {
        item.linkMuaHang = fileUrl
        item.tenFileMH = fileName
      } else {
        item.linkBaoGia = fileUrl
        item.tenFileBG = fileName
      }
      updateCraftContentFromFiles(item)
    }
  } catch (err) {
    console.error('[CraftSelectExistingFile] Error:', err)
    if (type === 'mua_hang') {
      item.linkMuaHang = fileUrl
      item.tenFileMH = fileName
    } else {
      item.linkBaoGia = fileUrl
      item.tenFileBG = fileName
    }
    updateCraftContentFromFiles(item)
  }
}

async function selectExistingImageForCraft(imgItem) {
  const item = craftModal.value.item
  if (!item) return
  const imgUrl = getExistingUrl(imgItem)
  craftExistingPicker.value = null
  if (!imgUrl) return

  item.scanning = true
  item.existingImgUrl = imgUrl
  try {
    const { base64, url } = await new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 1200
        let w = img.width, h = img.height
        if (w > MAX) { h *= MAX/w; w = MAX }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h)
        const cu = canvas.toDataURL('image/jpeg', 0.7)
        resolve({ base64: cu.split(',')[1], url: cu })
      }
      img.onerror = () => {
        fetch(imgUrl)
          .then(r => r.blob())
          .then(blob => {
            const reader = new FileReader()
            reader.onload = (e) => {
              const res = e.target?.result
              if (typeof res === 'string') resolve({ base64: res.split(',')[1], url: res })
              else reject(new Error('Cannot read blob'))
            }
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
          .catch(reject)
      }
      img.src = imgUrl
    })

    item.base64Img = base64

    // OCR scan
    const Tesseract = await import('tesseract.js')
    const worker = await Tesseract.createWorker('vie', 1, { logger: m => console.log(m) })
    const result = await worker.recognize(url)
    await worker.terminate()
    const lines = (result.data.text || '').split('\n').map(l => l.trim().toLowerCase()).filter(l => l)
    let nangGia = 0, thuePct = 25, conLai = 0
    const extractMoney = (text) => { const m = text.match(/\d[\d,\.]+/g); return m ? Number(m[m.length-1].replace(/[,.]/g,'')) : 0 }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.includes('nâng giá')) { let v = extractMoney(line.replace('nâng giá','')); if (!v&&i+1<lines.length) v=extractMoney(lines[i+1]); if (v) nangGia=v }
      if (line.includes('thuế')||line.includes('thue')) { const pm = line.match(/(\d+)\s*%/); if (pm) thuePct=Number(pm[1]) }
      if (line.includes('còn lại')) { let v = extractMoney(line.replace('còn lại','')); if (!v&&i+1<lines.length) v=extractMoney(lines[i+1]); if (v) conLai=v }
    }
    craftScanConfirmModal.value = { show: true, item, nangGia, thuePct, conLai, imageUrl: url }
  } catch (err) {
    console.error('Lỗi quét ảnh sẵn có:', err)
  } finally {
    item.scanning = false
  }
}

function onCraftFinancialInput(fieldChanged) {
  const item = craftModal.value.item; if (!item) return
  if (fieldChanged === 'doanhSoBan' && item.goodsTotal) {
    const dsbVal = Number(item.doanhSoBan) || 0
    const vatVal = Number(item.goodsTotal.vat) || 0
    item.goodsTotal = {
      ...item.goodsTotal,
      ttTruoc: dsbVal,
      vat: vatVal,
      ttSau: dsbVal + vatVal
    }
  }
  const pct = (Number(item.taxPct) || 0) / 100
  if (fieldChanged === 'netCom') { if (pct < 1) item.grossCom = item.netCom / (1 - pct) }
  else if (fieldChanged === 'grossCom' || fieldChanged === 'taxPct') { item.netCom = item.grossCom * (1 - pct) }
  else { item.netCom = item.grossCom * (1 - pct) }
  item._origGross = item.grossCom; item._origNet = item.netCom
}

function onCraftPredictInput() {
  const item = craftModal.value.item; if (!item) return
  const pctVal = parseFloat(item.predictPct)
  if (isNaN(pctVal) || pctVal <= 0 || pctVal >= 100) return
  const pct = pctVal / 100, taxPctNum = (Number(item.taxPct) || 25) / 100
  if (item.doanhSoBan > 0) { item.netCom = item.doanhSoBan * pct; item.grossCom = taxPctNum < 1 ? item.netCom / (1 - taxPctNum) : item.netCom }
}

function onCraftGoodsInput(item) {
  if (!item || !item.goodsList) return
  let ttTruoc = 0, vat = 0
  for (const g of item.goodsList) { ttTruoc += (parseFloat(g.sl)||0) * (parseFloat(g.donGia)||0); vat += (parseFloat(g.sl)||0) * (parseFloat(g.donGia)||0) * ((parseFloat(g.vatPct)||0)/100) }
  item.goodsTotal = { ttTruoc: Math.round(ttTruoc), vat: Math.round(vat), ttSau: Math.round(ttTruoc + vat) }
  item.doanhSoBan = Math.round(ttTruoc); onCraftFinancialInput()
}
function addCraftGoodsRow() { const item = craftModal.value.item; if (!item) return; if (!item.goodsList) item.goodsList = []; item.goodsList.push({ ten: '', dvt: 'Bộ', sl: 1, donGia: 0, dienGiai: '', danhMuc: '', vatPct: 0 }) }
function removeCraftGoodsRow(idx) { const item = craftModal.value.item; if (!item) return; item.goodsList.splice(idx, 1); onCraftGoodsInput(item) }

const craftUploadCloudinary = async (file) => {
  console.log('[CraftUpload] Uploading to Cloudinary:', file.name, file.size)
  try { const fd = new FormData(); fd.append('upload_preset', 'upload_file'); fd.append('file', file); const res = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', { method: 'POST', body: fd }).then(r => r.json()); console.log('[CraftUpload] Upload result:', res.secure_url ? 'OK' : 'NO URL', res.error || ''); return res.secure_url || '' } catch (e) { console.error('[CraftUpload] Upload error:', e); return '' }
}

async function onCraftFileSelected(e, type) {
  const target = e.target; if (!target.files || !target.files.length) return
  const item = craftModal.value.item; if (!item) return
  const file = target.files[0]
  console.log('[CraftImport]', type, file.name, file.size)
  try {
    const ab = await file.arrayBuffer()
    const link = await craftUploadCloudinary(file)
    if (type === 'mua_hang') {
      item.rawFileMuaHang = file
      item.tenFileMH = file.name
      item.linkMuaHang = link
    } else {
      item.rawFileBaoGia = file
      item.tenFileBG = file.name
      item.linkBaoGia = link
    }

    const lowerName = file.name.toLowerCase()
    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv')) {
      await parseExcelBufferAndApply(ab, file.name, link, type)
    } else {
      updateCraftContentFromFiles(item)
    }
  } catch (err) {
    console.error('Lỗi parse file:', err)
    if (type === 'mua_hang') {
      item.tenFileMH = file.name
    } else {
      item.tenFileBG = file.name
    }
    updateCraftContentFromFiles(item)
    await showAlert('Lỗi khi đọc file: ' + (err.message || err))
  }
  target.value = '' // Reset để có thể chọn lại cùng file
}

async function onCraftScanSelected(e) {
  const target = e.target; if (!target.files || !target.files.length) return
  const item = craftModal.value.item; if (!item) return; const file = target.files[0]; item.scanning = true
  try {
    const { base64, url } = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = (event) => { const img = new Image(); img.src = event.target?.result; img.onload = () => { const canvas = document.createElement('canvas'); const MAX = 1200; let w = img.width, h = img.height; if (w > MAX) { h *= MAX/w; w = MAX }; canvas.width = w; canvas.height = h; canvas.getContext('2d')?.drawImage(img,0,0,w,h); const cu = canvas.toDataURL('image/jpeg',0.7); resolve({ base64: cu.split(',')[1], url: cu }) }; img.onerror = reject }; reader.onerror = reject })
    item.base64Img = base64
    item.scanFileName = file.name

    // Upload ảnh lên Cloudinary gắn vào item của Craft (sẽ đồng bộ vào File khi bấm Lưu trong Modal Craft)
    craftUploadCloudinary(file).then(cUrl => {
      if (cUrl) {
        item.existingImgUrl = cUrl
      }
    }).catch(err => console.error('[CraftScanUploadSync] Error:', err))

    const Tesseract = await import('tesseract.js')
    const worker = await Tesseract.createWorker('vie', 1, { logger: m => console.log(m) })
    const result = await worker.recognize(url); await worker.terminate()
    const lines = (result.data.text || '').split('\n').map(l => l.trim().toLowerCase()).filter(l => l)
    let nangGia = 0, thuePct = 25, conLai = 0
    const extractMoney = (text) => { const m = text.match(/\d[\d,\.]+/g); return m ? Number(m[m.length-1].replace(/[,.]/g,'')) : 0 }
    for (let i = 0; i < lines.length; i++) { const line = lines[i]; if (line.includes('nâng giá')) { let v = extractMoney(line.replace('nâng giá','')); if (!v&&i+1<lines.length) v=extractMoney(lines[i+1]); if (v) nangGia=v }; if (line.includes('thuế')||line.includes('thue')) { const pm = line.match(/(\d+)\s*%/); if (pm) thuePct=Number(pm[1]) }; if (line.includes('còn lại')) { let v = extractMoney(line.replace('còn lại','')); if (!v&&i+1<lines.length) v=extractMoney(lines[i+1]); if (v) conLai=v } }
    craftScanConfirmModal.value = { show: true, item, nangGia, thuePct, conLai, imageUrl: url }
  } catch (err) { console.error('Lỗi quét ảnh:', err); await showAlert('Lỗi quét ảnh: '+(err.message||err)) } finally { item.scanning = false }
}
function confirmCraftScanResult() { const m = craftScanConfirmModal.value; if (m.item) { if (m.nangGia) m.item.grossCom = m.nangGia; if (m.conLai) m.item.netCom = m.conLai; m.item.taxPct = m.thuePct; m.item.scanned = true }; closeCraftScanConfirmModal() }
function closeCraftScanConfirmModal() { if (craftScanConfirmModal.value.imageUrl) URL.revokeObjectURL(craftScanConfirmModal.value.imageUrl); craftScanConfirmModal.value.show = false; craftScanConfirmModal.value.imageUrl = '' }

function getFormattedNow() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function formatNgayTaoHopDong() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

function formatCreatedTimeDateOnly() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

function genMaCongTy(company) {
  if (!company) return ''
  const baseName = String(company).replace(/\s*-\s*\d+.*$/, '')
  return baseName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

function genMaKhachHang(recipient, company) {
  const r = (recipient || '').trim()
  const c = (company || '').trim()
  if (r && c && r.toLowerCase() !== c.toLowerCase()) {
    return genMaCongTy(r) + '-' + genMaCongTy(c)
  }
  return genMaCongTy(r || c)
}

async function upsertCustomerFromCraftItem(item) {
  deepUnproxyFirebaseObj(db)
  const rawComp = String(item?.customer || '').trim()
  const rawRec = String(item?.recipient || '').trim()
  const rawMst = String(item?.mst || '').trim()

  const existingCus = getCraftLinkedCustomer(item)
  if (existingCus) {
    // QUY TẮC BẤT BIẾN: Giữ cố định 100% ma_khach_hang và ma_cong_ty của khách hàng đã có trong DB
    const maKHGen = String(existingCus.ma_khach_hang || '').trim() || genMaKhachHang(rawRec, rawComp)
    const maCongTyGen = String(existingCus.ma_cong_ty || '').trim() || genMaCongTy(existingCus.ten_cong_ty || existingCus.ten_khach_hang || rawComp || rawRec)

    const dbComp = String(existingCus.ten_cong_ty || '').trim()
    const dbRec = String(existingCus.ten_khach_hang || '').trim()
    const dbMst = String(existingCus.mst || '').trim()

    const khUpdates = {}
    // Tự động điền các trường còn trống trong DB
    if (!dbMst && rawMst) khUpdates.mst = rawMst
    if (!dbComp && rawComp) khUpdates.ten_cong_ty = rawComp
    if (!dbRec && rawRec) khUpdates.ten_khach_hang = rawRec

    // Kiểm tra nếu người dùng sửa tay hoặc chọn lấy tên từ Báo giá lệch với tên trong DB
    const compChanged = dbComp && rawComp && normalizeCustomerCompareStr(dbComp) !== normalizeCustomerCompareStr(rawComp)
    const recChanged = dbRec && rawRec && normalizeCustomerCompareStr(dbRec) !== normalizeCustomerCompareStr(rawRec)
    const mstChanged = dbMst && rawMst && dbMst !== rawMst

    if (compChanged || recChanged || mstChanged) {
      let allowUpdate = Boolean(item._approvedDbNameUpdate)
      if (!allowUpdate) {
        let diffMsg = `Thông tin khách hàng trên phiếu đang khác với dữ liệu gốc trong DB (Mã KH giữ nguyên: ${maKHGen}):\n\n`
        if (compChanged) diffMsg += `- Tên công ty: "${dbComp}" -> "${rawComp}"\n`
        if (recChanged) diffMsg += `- Người nhận (Tên KH): "${dbRec}" -> "${rawRec}"\n`
        if (mstChanged) diffMsg += `- MST: "${dbMst}" -> "${rawMst}"\n`
        diffMsg += `\nBạn có muốn cập nhật lại tên hiển thị / MST mới này vào bảng Khách Hàng (khach_hang) không?\n(Lưu ý: Mã KH "${maKHGen}" và Mã công ty "${maCongTyGen}" được giữ nguyên 100% để không ảnh hưởng Công nợ).`
        allowUpdate = await showConfirm(diffMsg, 'Xác nhận cập nhật Khách hàng')
      }
      if (allowUpdate) {
        if (compChanged) khUpdates.ten_cong_ty = rawComp
        if (recChanged) khUpdates.ten_khach_hang = rawRec
        if (mstChanged) khUpdates.mst = rawMst
        item._approvedDbNameUpdate = true
      }
    }

    if (Object.keys(khUpdates).length > 0 && existingCus.id) {
      try {
        await update(dbRef(db, 'khach_hang/' + existingCus.id), toPlainFirebaseData(khUpdates))
      } catch (e) {
        console.warn('Lỗi cập nhật khach_hang từ Craft:', e)
      }
    }

    item.linkedMaKH = maKHGen
    item.linkedMaCongTy = maCongTyGen

    // Đồng bộ ra Modal File bên ngoài nếu chưa có hoặc nếu người dùng đồng ý
    if (formData.value) {
      const outerMa = String(formData.value.maKH || '').trim()
      if (!outerMa) {
        formData.value.maKH = maKHGen
      } else if (outerMa !== maKHGen) {
        const okOuter = await showConfirm(
          `Thông tin khách hàng trong Sale Report thuộc về Mã KH "${maKHGen}", khác với khách hàng đang chọn ở Modal File bên ngoài ("${outerMa}").\n\nBạn có muốn đồng bộ đổi khách hàng ở Modal File bên ngoài sang "${maKHGen}" luôn không?`,
          'Đồng bộ Khách hàng ra File bên ngoài'
        )
        if (okOuter) {
          formData.value.maKH = maKHGen
        }
      }
    }

    return {
      maKHGen,
      maCongTyGen,
      tenCongTy: rawComp || dbComp || rawRec || dbRec,
      tenKhachHang: rawRec || dbRec || rawComp || dbComp,
      mstVal: rawMst || dbMst
    }
  }

  // Trường hợp Khách hàng mới hoàn toàn (chưa có trong bảng khach_hang)
  const tenCongTy = rawComp || rawRec
  const tenKhachHang = rawRec || rawComp || formData.value?.maKH || ''
  const maKHGen = genMaKhachHang(tenKhachHang, tenCongTy) || formData.value?.maKH || ('KH_UNKNOWN_' + Date.now())
  const maCongTyGen = genMaCongTy(tenCongTy || tenKhachHang) || ('CTY_UNKNOWN_' + Date.now())
  const mstVal = rawMst

  if (tenCongTy || tenKhachHang) {
    try {
      const newKhRef = push(dbRef(db, 'khach_hang'))
      const newKhPayload = toPlainFirebaseData({
        mst: mstVal,
        ma_cong_ty: maCongTyGen,
        ten_cong_ty: tenCongTy || tenKhachHang,
        ma_khach_hang: maKHGen,
        ten_khach_hang: tenKhachHang || tenCongTy,
        sdt: '',
        email: '',
        dia_chi: '',
        ngay_thanh_lap: '',
        doanh_so: 0,
        cong_no: 0,
        ghi_chu: 'Tạo tự động từ Sale Report / Báo giá',
        createdAt: Date.now()
      })
      await set(newKhRef, newKhPayload)
      item.linkedMaKH = maKHGen
      item.linkedMaCongTy = maCongTyGen

      if (formData.value) {
        const outerMa = String(formData.value.maKH || '').trim()
        if (!outerMa) {
          formData.value.maKH = maKHGen
        } else if (outerMa !== maKHGen) {
          const okSwitch = await showConfirm(
            `Đã tạo khách hàng mới "${tenCongTy || tenKhachHang}" (Mã KH: ${maKHGen}) vào DB.\nBạn có muốn gán luôn khách hàng này cho Modal File bên ngoài (thay cho "${outerMa}") không?`,
            'Đồng bộ Khách hàng mới ra File bên ngoài'
          )
          if (okSwitch) {
            formData.value.maKH = maKHGen
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi tạo mới khach_hang từ Craft:', e)
    }
  }

  return {
    maKHGen,
    maCongTyGen,
    tenCongTy: tenCongTy || tenKhachHang,
    tenKhachHang,
    mstVal
  }
}

async function prepareCraftItemAssetsAndData(item) {
  let imgUrl = item.existingImgUrl || ''
  if (!imgUrl && item.base64Img) {
    imgUrl = await craftUploadCloudinary('data:image/jpeg;base64,' + item.base64Img)
    if (imgUrl) item.existingImgUrl = imgUrl
  }
  let linkBG = item.linkBaoGia || ''
  let linkMH = item.linkMuaHang || ''
  let tenBG = item.tenFileBG || ''
  let tenMH = item.tenFileMH || ''
  if (item.rawFileBaoGia && !linkBG) {
    linkBG = await craftUploadCloudinary(item.rawFileBaoGia)
    tenBG = tenBG || item.rawFileBaoGia.name || ''
    item.linkBaoGia = linkBG
    item.tenFileBG = tenBG
  }
  if (item.rawFileMuaHang && !linkMH) {
    linkMH = await craftUploadCloudinary(item.rawFileMuaHang)
    tenMH = tenMH || item.rawFileMuaHang.name || ''
    item.linkMuaHang = linkMH
    item.tenFileMH = tenMH
  }

  const {
    maKHGen,
    maCongTyGen,
    tenCongTy,
    tenKhachHang,
    mstVal
  } = await upsertCustomerFromCraftItem(item)

  const tTruoc = Number(item.doanhSoBan ?? item.goodsTotal?.ttTruoc ?? 0)
  const tVat = Number(item.goodsTotal?.vat || 0)
  const tSau = tTruoc + tVat
  if (item.goodsTotal) {
    item.goodsTotal = {
      ...item.goodsTotal,
      ttTruoc: tTruoc,
      vat: tVat,
      ttSau: tSau
    }
  }
  const grossComVal = Number(item.grossCom) || 0
  const taxPctVal = Number(item.taxPct) || 25
  const thueVal = grossComVal * (taxPctVal / 100)
  const giaMuaVal = Number(item.giaMua) || 0
  const tongCPVal = Number(item.tongCP) || 0
  const netComVal = Number(item.netCom) || 0
  const createdTimeStr = item.createdTime || getFormattedNow()

  return {
    imgUrl, linkBG, linkMH, tenBG, tenMH,
    tenCongTy: tenCongTy || tenKhachHang,
    tenKhachHang,
    maKHGen,
    maCongTyGen,
    mstVal,
    tTruoc, tVat, tSau,
    grossComVal, taxPctVal, thueVal, giaMuaVal, tongCPVal, netComVal,
    createdTimeStr
  }
}

async function syncFileSaleReportMetadata() {
  deepUnproxyFirebaseObj(db)
  const list = craftModal.value.items || []
  const craftIds = list.map(it => it.craftId).filter(Boolean)
  const srIds = list.map(it => it.srId).filter(Boolean)
  const hasClosed = list.some(it => Boolean(it.chotDeal))

  // Đồng bộ các file / ảnh từ các tab Craft sang danh sách file / ảnh của File khi lưu từ Modal Craft
  if (!Array.isArray(formData.value.linkFileBaoGia)) formData.value.linkFileBaoGia = []
  if (!Array.isArray(formData.value.linkImgSave)) formData.value.linkImgSave = []
  for (const it of list) {
    if (it.linkBaoGia) {
      const hasBG = formData.value.linkFileBaoGia.some(f => (typeof f === 'string' ? f : f.url) === it.linkBaoGia)
      if (!hasBG) formData.value.linkFileBaoGia.push({ name: it.tenFileBG || 'File báo giá', url: it.linkBaoGia })
    }
    if (it.linkMuaHang) {
      const hasMH = formData.value.linkFileBaoGia.some(f => (typeof f === 'string' ? f : f.url) === it.linkMuaHang)
      if (!hasMH) formData.value.linkFileBaoGia.push({ name: it.tenFileMH || 'File mua hàng', url: it.linkMuaHang })
    }
    if (it.existingImgUrl) {
      const hasImg = formData.value.linkImgSave.some(f => (typeof f === 'string' ? f : f.url) === it.existingImgUrl)
      if (!hasImg) formData.value.linkImgSave.push({ name: it.scanFileName || 'Ảnh chụp CK', url: it.existingImgUrl })
    }
  }

  formData.value.craft_ids = craftIds
  formData.value.id_sale_report_craft = craftIds[0] || ''
  formData.value.sale_report_ids = srIds
  formData.value.id_sale_report = srIds[0] || ''
  formData.value.craft_chotDeal = hasClosed
  if (hasClosed) {
    formData.value.trangThaiBaoGia = 'Thành công'
  }

  if (editingId.value) {
    const updatePayload = toPlainFirebaseData({
      maKH: formData.value.maKH || '',
      linkFileBaoGia: formData.value.linkFileBaoGia || [],
      linkImgSave: formData.value.linkImgSave || [],
      id_sale_report_craft: formData.value.id_sale_report_craft || '',
      craft_ids: craftIds,
      id_sale_report: formData.value.id_sale_report || '',
      sale_report_ids: srIds,
      craft_chotDeal: hasClosed,
      updatedTime: Date.now()
    })
    if (hasClosed) {
      updatePayload.trangThaiBaoGia = 'Thành công'
    }
    await update(dbRef(db, 'quan_ly_file/' + editingId.value), updatePayload)
  }

  // Cập nhật lại baseline của Modal File đối với các trường đã được Modal Craft lưu trực tiếp vào File,
  // để nút "Lưu Thay Đổi" ở Modal File hoàn toàn độc lập với thay đổi của Sale Report
  syncOriginalFormDataBaseline(['maKH', 'trangThaiBaoGia', 'linkFileBaoGia', 'linkImgSave'])
}

async function syncCustomerCongNoFromSaleReport() {
  try {
    deepUnproxyFirebaseObj(db)
    const { get } = await import('firebase/database')
    const [srSnap, khSnap] = await Promise.all([
      get(dbRef(db, 'sale_report')),
      get(dbRef(db, 'khach_hang'))
    ])
    const srVal = srSnap.val() || {}
    const khVal = khSnap.val() || {}
    const debtByMaKH = {}
    for (const k of Object.keys(srVal)) {
      const r = srVal[k]
      if (!r || typeof r !== 'object') continue
      const maKH = String(r.Ma_khach_hang || r.Ma_cong_ty || '').trim()
      if (!maKH) continue
      const sauVat = Number(r.Tong_tien_sau_thueVAT || 0)
      const daTT = Number(r.so_tien_da_thanh_toan || 0)
      const cn = r.cong_no !== undefined && r.cong_no !== null
        ? Math.max(0, Number(r.cong_no))
        : Math.max(0, sauVat - daTT)
      debtByMaKH[maKH] = (debtByMaKH[maKH] || 0) + cn
    }
    const updates = {}
    for (const [khKey, khObj] of Object.entries(khVal)) {
      if (!khObj || typeof khObj !== 'object') continue
      const ma = String(khObj.ma_khach_hang || khObj.Ma_khach_hang || khKey).trim()
      const expected = debtByMaKH[ma] || 0
      if (Number(khObj.cong_no) !== expected) {
        updates[`khach_hang/${khKey}/cong_no`] = expected
      }
    }
    if (Object.keys(updates).length > 0) {
      await update(dbRef(db), updates)
    }
  } catch (e) {
    console.warn('Lỗi đồng bộ công nợ khách hàng:', e)
  }
}

async function saveOneCraftItemToFirebase(targetItem) {
  if (!targetItem) return
  deepUnproxyFirebaseObj(db)
  const prep = await prepareCraftItemAssetsAndData(targetItem)
  const fileId = editingId.value || formData.value.id || ''
  const craftData = toPlainFirebaseData({
    id_quanlyfile: fileId,
    id_quan_ly_file: fileId,
    ma_hop_dong: targetItem.ma_hop_dong || '',
    so_hop_dong: targetItem.so_hop_dong || '',
    So_PO: targetItem.soPO || '',
    Ten_nha_cung_cap: targetItem.productType || '',
    Ma_khach_hang: prep.maKHGen,
    Ten_khach_hang: prep.tenKhachHang,
    Ma_cong_ty: prep.maCongTyGen,
    Ten_cong_ty: prep.tenCongTy,
    MST: prep.mstVal,
    created_time: prep.createdTimeStr,
    content_of_contract_PO: targetItem.content || formData.value.noiDung || '',
    Tong_tien_truoc_thueVAT: prep.tTruoc,
    Tong_thueVAT: prep.tVat,
    Tong_tien_sau_thueVAT: prep.tSau,
    chiet_khau_tong_truoc_thue: prep.grossComVal,
    phan_tram_thue_chenh_lech_gia: prep.taxPctVal,
    thue_chenh_lech_gia: prep.thueVal,
    Tong_thanh_tien_chua_VAT_mua_hang: prep.giaMuaVal,
    Tong_CP_don_hang: prep.tongCPVal,
    con_lai: prep.netComVal,
    account_manager_name: targetItem.am || '',
    img_save: prep.imgUrl,
    link_excel_bao_gia: prep.linkBG,
    link_excel_mua_hang: prep.linkMH,
    ten_file_bao_gia: prep.tenBG,
    ten_file_mua_hang: prep.tenMH,
    goodsList: targetItem.goodsList || [],
    goodsTotal: targetItem.goodsTotal || null,
    predictPct: targetItem.predictPct || '',
    is_craft: true,
    chotDeal: Boolean(targetItem.chotDeal),
    id_sale_report: targetItem.srId || ''
  })

  if (targetItem.craftId) {
    await update(dbRef(db, 'sale_report_craft/' + targetItem.craftId), craftData)
  } else {
    const newRef = push(dbRef(db, 'sale_report_craft'))
    craftData.ID = newRef.key
    await set(newRef, craftData)
    targetItem.craftId = newRef.key
  }

  // Nếu tab này đã chốt deal, đồng bộ cập nhật luôn bản ghi tương ứng trong sale_report chính thức
  if (targetItem.chotDeal) {
    const officials = officialReportsMap.value || {}
    const craftKey = targetItem.craftId
    const offKey = (targetItem.srId && officials[targetItem.srId])
      ? targetItem.srId
      : Object.keys(officials).find(k =>
          officials[k] && craftKey && (officials[k].from_craft === craftKey || k === craftKey)
        )
    if (offKey) {
      targetItem.srId = offKey
      const existingPaid = Number(officials[offKey]?.so_tien_da_thanh_toan || 0)
      const existingPayTime = String(officials[offKey]?.thoi_gian_thanh_toan || '')
      const calcCongNo = Math.max(0, Number(prep.tSau || 0) - existingPaid)
      const offUpdate = toPlainFirebaseData({
        ...craftData,
        is_craft: false,
        from_craft: craftKey,
        so_tien_da_thanh_toan: existingPaid,
        cong_no: calcCongNo,
        thoi_gian_thanh_toan: existingPayTime
      })
      delete offUpdate.ID
      delete offUpdate.id_sale_report
      delete offUpdate.chotDeal
      await update(dbRef(db, 'sale_report/' + offKey), offUpdate)
      await syncCustomerCongNoFromSaleReport()
    }
  }
  targetItem._savedSnapshot = serializeCraftItem(targetItem)
}

async function saveCraftToFirebase() {
  const list = (craftModal.value.items && craftModal.value.items.length)
    ? craftModal.value.items
    : (craftModal.value.item ? [craftModal.value.item] : [])
  if (!list.length) return
  isCraftSaving.value = true
  try {
    deepUnproxyFirebaseObj(db)
    for (const tabItem of list) {
      await saveOneCraftItemToFirebase(tabItem)
    }
    await syncFileSaleReportMetadata()
    await showAlert('Đã lưu tạm dữ liệu Sale Report Craft!')
  } catch (err) {
    console.error('Lỗi save craft:', err)
    await showAlert('Lỗi: ' + (err.message || err))
  } finally {
    isCraftSaving.value = false
  }
}

async function chotDeal() {
  const item = craftModal.value.item
  if (!item) { await showAlert('Không tìm thấy dữ liệu Sale Report!'); return }
  const tabNumber = (craftModal.value.activeIndex || 0) + 1
  if (!(await showConfirm(`Chốt Deal (Báo cáo #${tabNumber})?\nDữ liệu tab này sẽ được lưu và chuyển sang Sale Report chính thức.`))) return
  isChotDealLoading.value = true
  try {
    deepUnproxyFirebaseObj(db)
    const { get } = await import('firebase/database')
    const prep = await prepareCraftItemAssetsAndData(item)
    const fileId = editingId.value || formData.value.id || ''

    // 1. Lấy số lượng hop_dong_tong_quat từ Firebase giống hệt SaleReportFirebase.vue
    let hdLen = 0
    try {
      const hdSnapshot = await get(dbRef(db, 'hop_dong_tong_quat'))
      const hdData = hdSnapshot.val()
      if (hdData && typeof hdData === 'object') hdLen = Object.keys(hdData).length
    } catch (e) {
      console.warn('Lấy count hop_dong_tong_quat từ Firebase thất bại:', e)
    }

    const maHD = item.ma_hop_dong || ('HD' + Date.now() + Math.floor(Math.random() * 10000))
    let soHD = item.so_hop_dong
    if (!soHD || !String(soHD).trim()) {
      hdLen++
      soHD = `HĐ ${hdLen}`
    }
    item.ma_hop_dong = maHD
    item.so_hop_dong = soHD

    // 2. Lưu / cập nhật bản ghi của tab hiện tại trong sale_report_craft trước
    let craftId = item.craftId || ''
    const craftData = toPlainFirebaseData({
      id_quanlyfile: fileId,
      id_quan_ly_file: fileId,
      ma_hop_dong: maHD,
      so_hop_dong: soHD,
      So_PO: item.soPO || '',
      Ten_nha_cung_cap: item.productType || '',
      Ma_khach_hang: prep.maKHGen,
      Ten_khach_hang: prep.tenKhachHang,
      Ma_cong_ty: prep.maCongTyGen,
      Ten_cong_ty: prep.tenCongTy,
      MST: prep.mstVal,
      created_time: prep.createdTimeStr,
      content_of_contract_PO: item.content || formData.value.noiDung || '',
      Tong_tien_truoc_thueVAT: prep.tTruoc,
      Tong_thueVAT: prep.tVat,
      Tong_tien_sau_thueVAT: prep.tSau,
      chiet_khau_tong_truoc_thue: prep.grossComVal,
      phan_tram_thue_chenh_lech_gia: prep.taxPctVal,
      thue_chenh_lech_gia: prep.thueVal,
      Tong_thanh_tien_chua_VAT_mua_hang: prep.giaMuaVal,
      Tong_CP_don_hang: prep.tongCPVal,
      con_lai: prep.netComVal,
      account_manager_name: item.am || '',
      img_save: prep.imgUrl,
      link_excel_bao_gia: prep.linkBG,
      link_excel_mua_hang: prep.linkMH,
      ten_file_bao_gia: prep.tenBG,
      ten_file_mua_hang: prep.tenMH,
      goodsList: item.goodsList || [],
      goodsTotal: item.goodsTotal || null,
      predictPct: item.predictPct || '',
      is_craft: true,
      chotDeal: true,
      chotDealTime: Date.now()
    })

    if (craftId) {
      await update(dbRef(db, 'sale_report_craft/' + craftId), craftData)
    } else {
      const newCraftRef = push(dbRef(db, 'sale_report_craft'))
      craftId = newCraftRef.key
      craftData.ID = craftId
      await set(newCraftRef, craftData)
      item.craftId = craftId
    }

    // 3. Tạo (hoặc cập nhật nếu tab này đã có) bản ghi trong sale_report đúng chuẩn SaleReportFirebase.vue
    const officials = officialReportsMap.value || {}
    const existingOffKey = (item.srId && officials[item.srId])
      ? item.srId
      : Object.keys(officials).find(k =>
          officials[k] && craftId && (officials[k].from_craft === craftId || k === craftId)
        )

    const existingPaid = existingOffKey ? Number(officials[existingOffKey]?.so_tien_da_thanh_toan || 0) : 0
    const existingPayTime = existingOffKey ? String(officials[existingOffKey]?.thoi_gian_thanh_toan || '') : ''
    const calcCongNo = Math.max(0, Number(prep.tSau || 0) - existingPaid)

    const srID = 'SR_' + Date.now() + '_' + Math.floor(Math.random() * 10000)
    const srPayload = toPlainFirebaseData({
      ID: srID,
      ma_hop_dong: maHD,
      so_hop_dong: soHD,
      So_PO: item.soPO || '',
      Ten_nha_cung_cap: item.productType || '',
      Ma_khach_hang: prep.maKHGen,
      Ten_khach_hang: prep.tenKhachHang,
      Ma_cong_ty: prep.maCongTyGen,
      Ten_cong_ty: prep.tenCongTy,
      MST: prep.mstVal,
      created_time: prep.createdTimeStr,
      content_of_contract_PO: item.content || formData.value.noiDung || '',
      Tong_tien_truoc_thueVAT: prep.tTruoc,
      Tong_thueVAT: prep.tVat,
      Tong_tien_sau_thueVAT: prep.tSau,
      so_tien_da_thanh_toan: existingPaid,
      cong_no: calcCongNo,
      thoi_gian_thanh_toan: existingPayTime,
      chiet_khau_tong_truoc_thue: prep.grossComVal,
      phan_tram_thue_chenh_lech_gia: prep.taxPctVal,
      thue_chenh_lech_gia: prep.thueVal,
      Tong_thanh_tien_chua_VAT_mua_hang: prep.giaMuaVal,
      Tong_CP_don_hang: prep.tongCPVal,
      con_lai: prep.netComVal,
      account_manager_name: item.am || '',
      img_save: prep.imgUrl,
      link_excel_bao_gia: prep.linkBG,
      link_excel_mua_hang: prep.linkMH,
      ten_file_bao_gia: prep.tenBG,
      ten_file_mua_hang: prep.tenMH,
      id_quanlyfile: fileId,
      id_quan_ly_file: fileId,
      from_craft: craftId,
      is_craft: false,
      goodsList: item.goodsList || [],
      goodsTotal: item.goodsTotal || null
    })

    let finalSrKey = existingOffKey
    if (existingOffKey) {
      srPayload.ID = officials[existingOffKey].ID || existingOffKey
      await update(dbRef(db, 'sale_report/' + existingOffKey), srPayload)
    } else {
      const srRef = push(dbRef(db, 'sale_report'))
      finalSrKey = srRef.key
      await set(srRef, srPayload)
    }

    await syncCustomerCongNoFromSaleReport()

    item.srId = finalSrKey || ''
    item.chotDeal = true
    item._savedSnapshot = serializeCraftItem(item)
    await update(dbRef(db, 'sale_report_craft/' + craftId), {
      id_sale_report: finalSrKey || '',
      chotDeal: true
    })

    // 4. Lưu hop_dong_tong_quat và hop_dong_chi_tiet giống SaleReportFirebase.vue
    const hdTongData = toPlainFirebaseData({
      ma_hop_dong: maHD,
      so_hop_dong: soHD,
      ma_khach_hang: prep.maKHGen,
      ten_khach_hang: prep.tenKhachHang,
      ngay_tao: formatNgayTaoHopDong(),
      tong_truoc_vat: prep.tTruoc,
      tong_vat: prep.tVat,
      tong_sau_vat: prep.tSau,
      da_thanh_toan: existingPaid,
      con_phai_thu: calcCongNo,
      trang_thai_thanh_toan: calcCongNo <= 0 && prep.tSau > 0
        ? 'Đã thanh toán đủ'
        : (existingPaid > 0 ? 'Thanh toán 1 phần' : 'Chưa thanh toán đủ'),
      loai_hop_dong: 'Chính thức',
      content: item.content || formData.value.noiDung || '',
      don_vi_tien_te: 'VND',
      ti_gia: 1,
      ghi_chu: '',
      tong_truoc_vat_goc: prep.tTruoc,
      ngay_tao_date: formatCreatedTimeDateOnly(),
      so_po: item.soPO || '',
      po_content: '',
      content_po: item.content || formData.value.noiDung || '',
      gross_com: prep.grossComVal,
      phan_tram_chiet_khau: 0,
      thue_chenh_lech_gia: prep.thueVal,
      phan_tram_thue: prep.taxPctVal,
      tong_chiet_khau: 0,
      con_lai: prep.netComVal,
      tong_cp: 0
    })
    await set(dbRef(db, `hop_dong_tong_quat/${maHD}`), hdTongData)

    let hdChiTietRows = []
    if (item.goodsList && item.goodsList.length > 0) {
      hdChiTietRows = item.goodsList.map(g => toPlainFirebaseData({
        ma_hop_dong: maHD,
        so_hop_dong: soHD,
        ma_hang: '',
        ten_hang: g.ten || '',
        main_img: '',
        ma_ncc: '',
        ten_ncc: item.productType || '',
        mo_ta_chung: '',
        mo_ta_chi_tiet: '',
        dien_giai: g.dienGiai || '',
        danh_muc: g.danhMuc || '',
        ghi_chu: '',
        dvt: g.dvt || '',
        don_gia: g.donGia || 0,
        gia_tieu_chuan: g.donGia || 0,
        don_vi_tien_te: 'VND',
        ti_gia: 1,
        thue_vat: g.vatPct || 0,
        so_luong: g.sl || 1,
        features: '',
        gia_hardware: 0,
        gia_nhap: 0,
        muc_phan_tram_off: 0
      }))
    } else {
      hdChiTietRows = [toPlainFirebaseData({
        ma_hop_dong: maHD,
        so_hop_dong: soHD,
        ma_hang: '',
        ten_hang: 'Hàng hóa mặc định',
        main_img: '',
        ma_ncc: '',
        ten_ncc: item.productType || '',
        mo_ta_chung: '',
        mo_ta_chi_tiet: '',
        dien_giai: item.content || formData.value.noiDung || '',
        danh_muc: '',
        ghi_chu: '',
        dvt: 'Cái',
        don_gia: prep.tTruoc,
        gia_tieu_chuan: prep.tTruoc,
        don_vi_tien_te: 'VND',
        ti_gia: 1,
        thue_vat: 0,
        so_luong: 1,
        features: '',
        gia_hardware: 0,
        gia_nhap: 0,
        muc_phan_tram_off: 0
      })]
    }

    const chiTietUpdates = {}
    for (const ct of hdChiTietRows) {
      const newCtKey = push(dbRef(db, 'hop_dong_chi_tiet')).key
      if (newCtKey) {
        chiTietUpdates[`hop_dong_chi_tiet/${newCtKey}`] = ct
      }
    }
    if (Object.keys(chiTietUpdates).length > 0) {
      await update(dbRef(db), chiTietUpdates)
    }

    // 5. Đồng bộ metadata của tất cả các tab lên formData và quan_ly_file
    await syncFileSaleReportMetadata()

    const hasRemainingOpenTabs = (craftModal.value.items || []).some(it => !it.chotDeal)
    if (!hasRemainingOpenTabs) {
      closeCraftModal()
    }
    await showAlert(`CHỐT DEAL THÀNH CÔNG (Báo cáo #${tabNumber} - ${soHD})!\nĐã lưu dữ liệu vào Sale Report chính thức.`)
  } catch (err) { console.error('Lỗi chốt deal:', err); await showAlert('Lỗi: ' + (err.message || err)) } finally { isChotDealLoading.value = false }
}

const saveFile = async () => {
  try {
    if (!formData.value.maKH) {
      await showAlert("Vui lòng nhập mã khách hàng!", "Thiếu thông tin")
      return
    }

    // Kiểm tra nội dung file không được để trống, nếu trống thì fall back tên file nếu có
    if (!formData.value.noiDung || !formData.value.noiDung.trim()) {
      const fallback = getFallbackFileName()
      if (fallback) {
        formData.value.noiDung = fallback
      } else {
        await showAlert("Nội dung file không được để trống! Vui lòng nhập nội dung chi tiết hoặc đính kèm file/ảnh.", "Thiếu nội dung file")
        return
      }
    }

    isUploadingFile.value = true // Just using it as loading state for save
    deepUnproxyFirebaseObj(db)
    const sanitize = (obj) => { if (obj === null || obj === undefined) return null; if (Array.isArray(obj)) return obj.map(sanitize); if (typeof obj === 'object') { const cleaned = {}; for (const [k, v] of Object.entries(obj)) { if (v !== undefined) cleaned[k] = sanitize(v) }; return cleaned }; return obj }


    // --- KIỂM TRA & THÊM KHÁCH HÀNG MỚI NẾU CHƯA CÓ ---
    if (isNewCustomer.value) {
      const newCusRef = push(dbRef(db, 'khach_hang'))
      await set(newCusRef, {
        ma_khach_hang: formData.value.maKH,
        ten_khach_hang: formData.value.maKH, // Tạm lấy mã làm tên
        trang_thai: 'Tiềm năng',
        tagKH: [],
        cong_no: 0,
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
      // Sửa: Chỉ lưu các trường thuộc về Modal File, không can thiệp vào dữ liệu/metadata của Sale Report
      const updateRef = dbRef(db, `quan_ly_file/${editingId.value}`)
      const modalFilePayload = {
        maKH: formData.value.maKH || '',
        tagKH: Array.isArray(formData.value.tagKH) ? formData.value.tagKH : [],
        noiDung: formData.value.noiDung || '',
        ghiChu: formData.value.ghiChu || '',
        trangThaiXuLy: formData.value.trangThaiXuLy || 'Chưa xử lý',
        mucDoUuTien: formData.value.mucDoUuTien || 'Trung bình',
        trangThaiBaoGia: formData.value.trangThaiBaoGia || 'Đợi phản hồi',
        tenFileBaoGia: formData.value.tenFileBaoGia || '',
        linkFileBaoGia: Array.isArray(formData.value.linkFileBaoGia) ? formData.value.linkFileBaoGia : [],
        linkImgSave: Array.isArray(formData.value.linkImgSave) ? formData.value.linkImgSave : [],
        idPrevious: finalIdPrevious,
        updatedTime: Date.now()
      }
      await update(updateRef, toPlainFirebaseData(modalFilePayload))
    } else {
      // Thêm mới
      const newRef = push(listRef)
      const newFileId = newRef.key
      await set(newRef, toPlainFirebaseData({ ...formData.value, idPrevious: finalIdPrevious, id: newFileId, createdTime: Date.now(), updatedTime: Date.now() }))
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

/* ═══ TASTE SKILL LUXURY MODAL DESIGN SYSTEM ═══ */
.taste-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(3, 7, 18, 0.76);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
}

.taste-modal-shell {
  position: relative;
  width: 450px;
  max-width: 95vw;
  border-radius: 22px;
  padding: 1.5px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.03) 50%, rgba(255, 255, 255, 0.08) 100%);
  box-shadow: 
    0 32px 80px -16px rgba(0, 0, 0, 0.85),
    0 12px 32px -8px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.06);
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.taste-modal-glow {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  height: 120px;
  border-radius: 50%;
  filter: blur(48px);
  pointer-events: none;
  opacity: 0.35;
  transition: all 0.3s ease;
}
.taste-variant-success .taste-modal-glow { background: #10b981; }
.taste-variant-danger .taste-modal-glow { background: #ef4444; }
.taste-variant-warning .taste-modal-glow { background: #f59e0b; }
.taste-variant-confirm .taste-modal-glow { background: #38bdf8; }
.taste-variant-info .taste-modal-glow { background: #6366f1; }

.taste-modal-core {
  position: relative;
  border-radius: 20px;
  background: linear-gradient(165deg, #0d1527 0%, #080d19 100%);
  padding: 24px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.taste-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;
}
.taste-modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  transform: scale(1.05);
}

.taste-modal-body {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.taste-jewel-wrap {
  flex-shrink: 0;
  position: relative;
}
.taste-jewel-box {
  width: 52px;
  height: 52px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.taste-variant-success .taste-jewel-box {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 24px rgba(16, 185, 129, 0.25);
}
.taste-variant-danger .taste-jewel-box {
  background: radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, rgba(239, 68, 68, 0.05) 100%);
  border: 1px solid rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 24px rgba(239, 68, 68, 0.25);
}
.taste-variant-warning .taste-jewel-box {
  background: radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(245, 158, 11, 0.05) 100%);
  border: 1px solid rgba(245, 158, 11, 0.4);
  box-shadow: 0 0 24px rgba(245, 158, 11, 0.25);
}
.taste-variant-confirm .taste-jewel-box,
.taste-variant-info .taste-jewel-box {
  background: radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(56, 189, 248, 0.05) 100%);
  border: 1px solid rgba(56, 189, 248, 0.4);
  box-shadow: 0 0 24px rgba(56, 189, 248, 0.25);
}

.taste-modal-text {
  flex: 1;
  min-width: 0;
}

.taste-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2.5px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.taste-variant-success .taste-eyebrow {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}
.taste-variant-danger .taste-eyebrow {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.taste-variant-warning .taste-eyebrow {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.taste-variant-confirm .taste-eyebrow,
.taste-variant-info .taste-eyebrow {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.taste-eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: tastePulse 2s ease-in-out infinite;
}
.taste-variant-success .taste-eyebrow-dot { background: #10b981; }
.taste-variant-danger .taste-eyebrow-dot { background: #ef4444; }
.taste-variant-warning .taste-eyebrow-dot { background: #f59e0b; }
.taste-variant-confirm .taste-eyebrow-dot,
.taste-variant-info .taste-eyebrow-dot { background: #38bdf8; }

@keyframes tastePulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; }
}

.taste-title {
  margin: 0 0 8px 0;
  font-size: 17px;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.02em;
  line-height: 1.35;
}

.taste-message {
  font-size: 13.5px;
  font-weight: 400;
  color: #94a3b8;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.taste-modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.taste-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: 11px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
  line-height: 1;
}
.taste-btn:active {
  transform: scale(0.97);
}

.taste-btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.taste-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}

.taste-btn-primary {
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-weight: 700;
}
.taste-btn-primary:hover {
  filter: brightness(1.12);
  transform: translateY(-1.5px);
}

.taste-btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
.taste-btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
.taste-btn-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
.taste-btn-confirm,
.taste-btn-info {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

/* ═══ TASTE SPRING CHOREOGRAPHY ═══ */
.taste-modal-enter-active {
  animation: tasteOverlayFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.taste-modal-leave-active {
  animation: tasteOverlayFadeOut 0.2s cubic-bezier(0.4, 0, 1, 1);
}
.taste-modal-enter-active .taste-modal-shell {
  animation: tasteShellSpring 0.38s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.taste-modal-leave-active .taste-modal-shell {
  animation: tasteShellOut 0.2s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes tasteOverlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes tasteOverlayFadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes tasteShellSpring {
  from { opacity: 0; transform: scale(0.92) translateY(16px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes tasteShellOut {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.94) translateY(10px); }
}

/* ═══ SALE REPORT CRAFT MODAL CSS (mirror from SaleReportFirebase) ═══ */
.sr-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 10000;
  animation: srFadeIn .2s ease;
}
@keyframes srFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.sr-modal {
  background: #020617;
  border-radius: 16px;
  width: 420px;
  max-width: 92vw;
  box-shadow: 0 25px 60px rgba(0,0,0,.5);
  animation: slideUp .25s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
  border: none;
}
.sr-modal-large { width: 1920px !important; max-width: 96vw; }
.sr-modal-body { padding: 24px 20px; }
.sr-form-group { margin-bottom: 16px; }
.sr-form-group:last-child { margin-bottom: 0; }
.sr-modal-label {
  display: block; font-size: 11px; font-weight: 700;
  color: #94a3b8; text-transform: uppercase;
  letter-spacing: .06em; margin-bottom: 8px;
}
.sr-modal-input {
  width: 100%; padding: 10px 14px;
  background: rgba(15,23,42,.8); border: 1px solid #334155;
  border-radius: 8px; font-family: 'JetBrains Mono', monospace;
  font-size: 14px; font-weight: 600; text-align: right;
  color: #e2e8f0; outline: none; transition: all .2s;
  box-sizing: border-box;
}
.sr-modal-input.text-left { text-align: left !important; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; }
.sr-modal-input.text-right { text-align: right; }
.sr-modal-input.text-center { text-align: center; }
.sr-modal-input:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,.15); background: rgba(15,23,42,1); }
.sr-import-card-header {
  background: linear-gradient(135deg, rgba(30,41,59,.8), rgba(15,23,42,.8));
  padding: 14px 20px; border-bottom: 1px solid #1e293b;
  display: flex; justify-content: space-between; align-items: center;
}
.sr-import-card-header h4 { margin: 0; font-size: 14px; color: #e2e8f0; font-weight: 600; }
.sr-import-card-body { padding: 20px; }
.sr-import-card-footer { padding: 16px 24px; border-top: 1px solid #1e293b; display: flex; align-items: center; background: rgba(15,23,42,.6); }
.sr-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all .2s; font-family: inherit;
}
.sr-btn-cancel { background: rgba(255,255,255,.05); color: #94a3b8; border: 1px solid #334155; }
.sr-btn-cancel:hover { background: rgba(255,255,255,.1); color: #e2e8f0; border-color: #475569; }
.sr-btn-save { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #fff; border: none; box-shadow: 0 4px 14px rgba(14,165,233,.35); }
.sr-btn-save:hover:not(:disabled) { background: linear-gradient(135deg, #38bdf8, #0ea5e9); }
.sr-btn-save:disabled { opacity: .5; cursor: not-allowed; }
.sr-modal-fin-col { display: flex; flex-direction: column; gap: 12px; }
.sr-modal-fin-col.highlight-col { background: rgba(15,23,42,.6); border: 1px solid #1e293b; border-radius: 8px; padding: 12px; }
.text-green { color: #22c55e !important; }
.text-red { color: #ef4444 !important; }

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



.quick-action-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  margin-right: 2px;
  user-select: none;
}

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

/* =========================================================
   COMPARE VIEW WORKSTATION — ANTI-SLOP FINANCIAL ARCHITECTURE
   Double-Bezel · Tabular-Nums · Hairline Refraction
   ========================================================= */
.cmp-workstation {
  padding: 0.75rem 0.5rem 5.5rem;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #f8fafc;
}

.cmp-toolbar-shell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 1.25rem;
  padding: 14px 18px;
  background: #090d16;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.cmp-toolbar-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cmp-toolbar-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
  flex-shrink: 0;
}

.cmp-toolbar-title {
  color: #f8fafc;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.cmp-toolbar-subtitle {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 2px;
}

.cmp-inline-code {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 0 5px;
}

.cmp-toolbar-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.cmp-control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cmp-control-label {
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 600;
}

.cmp-segmented-track {
  display: inline-flex;
  background: #05080f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 7px;
  padding: 3px;
  gap: 3px;
}

.cmp-seg-btn {
  padding: 5px 11px;
  border-radius: 5px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 11.5px;
  font-weight: 600;
  background: transparent;
  color: #64748b;
  transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
}

.cmp-seg-btn:hover {
  color: #cbd5e1;
}

.cmp-seg-btn.is-active {
  background: #161f33;
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.cmp-seg-btn.is-active-emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.35);
}

.cmp-seg-btn.is-active-amber {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.35);
}

/* Matrix Comparison Panel */
.cmp-matrix-shell {
  margin-bottom: 1.5rem;
  background: #090d16;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.cmp-matrix-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.cmp-matrix-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cmp-active-counter {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 3px 9px;
  border-radius: 4px;
}

.cmp-matrix-hint {
  color: #94a3b8;
  font-size: 12px;
}

.cmp-matrix-hint.is-warning {
  color: #fbbf24;
  font-weight: 500;
}

.cmp-matrix-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cmp-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
}

.cmp-action-btn:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.2);
}

.cmp-action-btn.is-danger {
  color: #fb7185;
  border-color: rgba(244, 63, 94, 0.25);
  background: rgba(244, 63, 94, 0.08);
}

.cmp-action-btn.is-danger:hover {
  background: rgba(244, 63, 94, 0.18);
  color: #ffe4e6;
}

/* Selected Version Chips */
.cmp-selected-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.cmp-version-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 7px;
  font-size: 12px;
  background: #0d131f;
  border: 1px solid rgba(255, 255, 255, 0.09);
}

.cmp-version-chip.is-base-chip {
  background: rgba(245, 158, 11, 0.06);
  border-color: rgba(245, 158, 11, 0.35);
}

.cmp-chip-index {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.cmp-chip-index.is-base {
  background: rgba(245, 158, 11, 0.16);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.38);
}

.cmp-chip-meta {
  display: flex;
  flex-direction: column;
}

.cmp-chip-title {
  color: #f8fafc;
  font-weight: 600;
  font-size: 12px;
}

.cmp-chip-customer {
  color: #94a3b8;
  font-weight: 400;
}

.cmp-chip-sub {
  color: #64748b;
  font-size: 10.5px;
}

.cmp-chip-promote {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.28);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
}

.cmp-chip-promote:hover {
  background: rgba(245, 158, 11, 0.2);
}

.cmp-chip-remove {
  background: transparent;
  color: #64748b;
  border: none;
  cursor: pointer;
  padding: 3px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cmp-chip-remove:hover {
  color: #fb7185;
  background: rgba(244, 63, 94, 0.1);
}

/* Matrix Table */
.cmp-table-scroll {
  margin-top: 14px;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: #070a12;
}

.cmp-matrix-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
  font-size: 12.5px;
}

.cmp-th-sticky {
  text-align: left;
  padding: 12px 14px;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  width: 215px;
  min-width: 195px;
  position: sticky;
  left: 0;
  background: #090d16;
  z-index: 2;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  border-right: 1px solid rgba(255, 255, 255, 0.07);
}

.cmp-th-version {
  text-align: right;
  padding: 10px 14px;
  min-width: 235px;
  vertical-align: top;
  background: #090d16;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.cmp-th-version.is-base-col {
  background: rgba(245, 158, 11, 0.04);
}

.cmp-th-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 6px;
}

.cmp-th-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cmp-mini-action {
  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.cmp-mini-action:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.cmp-mini-action.is-amber {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}

.cmp-mini-action.is-danger {
  background: rgba(244, 63, 94, 0.1);
  color: #fb7185;
  border-color: rgba(244, 63, 94, 0.25);
}

.cmp-th-title {
  color: #f8fafc;
  font-weight: 700;
  font-size: 12.5px;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  text-align: left;
}

.cmp-th-hd {
  color: #94a3b8;
  font-weight: 500;
  font-size: 11px;
  margin-left: 4px;
}

.cmp-th-subtitle {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.cmp-th-meta {
  color: #64748b;
  font-size: 10.5px;
  text-align: left;
  margin-top: 2px;
}

.cmp-th-files {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 6px;
  text-align: left;
}

.cmp-th-file-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cmp-th-file-badge {
  flex: 1;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  color: #e2e8f0;
  font-size: 10.5px;
  text-decoration: none;
}

.cmp-th-file-role {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  padding: 1px 4px;
  border-radius: 3px;
}

.cmp-th-file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cmp-icon-btn {
  background: rgba(255, 255, 255, 0.03);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  width: 21px;
  height: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-decoration: none;
  cursor: pointer;
}

.cmp-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.cmp-icon-btn.is-dl:hover {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.35);
}

.cmp-matrix-table tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.cmp-matrix-table tbody tr.is-row-emerald {
  background: rgba(16, 185, 129, 0.045);
}

.cmp-matrix-table tbody tr.is-row-margin {
  background: rgba(255, 255, 255, 0.02);
}

.cmp-td-sticky {
  padding: 9px 14px;
  color: #cbd5e1;
  font-weight: 600;
  font-size: 12px;
  position: sticky;
  left: 0;
  background: #090d16;
  z-index: 1;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
}

.cmp-th-sticky-version {
  width: 245px;
  min-width: 235px;
}

.cmp-th-metric-col {
  text-align: right;
  padding: 11px 14px;
  min-width: 155px;
  color: #94a3b8;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #090d16;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}

.cmp-th-metric-col.is-col-emerald {
  color: #34d399;
  background: rgba(16, 185, 129, 0.06);
}

.cmp-th-metric-col.is-col-margin {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.03);
}

.cmp-td-version-sticky {
  padding: 10px 14px;
  min-width: 235px;
  max-width: 265px;
  vertical-align: top;
}

.cmp-td-val {
  padding: 9px 14px;
  text-align: right;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
}

.cmp-td-val.is-col-emerald {
  background: rgba(16, 185, 129, 0.045);
}

.cmp-td-val.is-col-margin {
  background: rgba(255, 255, 255, 0.02);
}

.cmp-td-val.is-base-col {
  background: rgba(245, 158, 11, 0.025);
}

.cmp-cell-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}

.cmp-cell-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}

.cmp-tax-note {
  color: #64748b;
  font-size: 10.5px;
  font-family: 'JetBrains Mono', monospace;
}

.cmp-mono-val {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 12.5px;
  font-weight: 600;
}

.cmp-cell-delta {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.cmp-delta-pill {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 10.5px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
}

.cmp-delta-pill.is-up {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.28);
}

.cmp-delta-pill.is-down {
  background: rgba(244, 63, 94, 0.12);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.28);
}

.cmp-delta-pill.is-flat {
  background: rgba(255, 255, 255, 0.04);
  color: #64748b;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cmp-delta-abs {
  color: #64748b;
  font-size: 10.5px;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
}

/* Customer Group Shell */
.cmp-customer-group {
  margin-bottom: 1.5rem;
  background: #090d16;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 6px 20px -6px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.cmp-customer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
}

.cmp-customer-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cmp-customer-indicator {
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: #10b981;
}

.cmp-customer-name {
  margin: 0;
  color: #f8fafc;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.cmp-customer-company {
  color: #94a3b8;
  font-weight: 500;
  margin-left: 6px;
}

.cmp-customer-tag {
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 4px;
  padding: 2px 7px;
  font-size: 10.5px;
  font-weight: 600;
}

.cmp-customer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cmp-customer-compare-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.03);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
}

.cmp-customer-compare-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

.cmp-customer-compare-btn.is-active {
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.35);
}

.cmp-event-count {
  background: rgba(255, 255, 255, 0.04);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.cmp-chevron {
  color: #64748b;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.cmp-chevron.is-open {
  transform: rotate(180deg);
}

.cmp-customer-body {
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cmp-section-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.cmp-section-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #64748b;
}

.cmp-section-dot.is-emerald {
  background: #10b981;
}

/* Floating Bottom Dock */
.cmp-floating-dock {
  position: fixed;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9990;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(203, 213, 225, 0.85);
  border-radius: 14px;
  padding: 8px 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 
    0 20px 45px -10px rgba(15, 23, 42, 0.16),
    0 4px 16px rgba(15, 23, 42, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(16px);
  max-width: 95vw;
  flex-wrap: wrap;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.cmp-dock-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
}

.cmp-dock-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.cmp-dock-count {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  color: #059669;
  font-weight: 800;
  background: rgba(16, 185, 129, 0.12);
  padding: 1px 7px;
  border-radius: 5px;
  border: 1px solid rgba(16, 185, 129, 0.28);
}

.cmp-dock-primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  border: 1px solid rgba(5, 150, 105, 0.3);
  border-radius: 8px;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.cmp-dock-primary-btn:hover {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
  transform: translateY(-1px);
}

.cmp-dock-primary-btn:active {
  transform: scale(0.98);
}

.cmp-dock-hint {
  color: #d97706;
  font-size: 11.5px;
  font-weight: 500;
}

.cmp-dock-clear-btn {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.cmp-dock-clear-btn:hover {
  background: rgba(239, 68, 68, 0.16);
  color: #b91c1c;
  border-color: rgba(239, 68, 68, 0.35);
  transform: translateY(-0.5px);
}

.cmp-dock-clear-btn:active {
  transform: scale(0.98);
}

/* Fullscreen Matrix Modal */
.cmp-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10050;
  background: rgba(3, 6, 14, 0.84);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.cmp-modal-shell {
  background: #090d16;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  width: 96vw;
  max-width: 1480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.07);
}

.cmp-modal-header {
  padding: 16px 22px;
  background: #0d131f;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.cmp-modal-title {
  margin: 0;
  color: #f8fafc;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.cmp-modal-subtitle {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 3px;
}

.cmp-modal-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cmp-modal-close-btn {
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.cmp-modal-close-btn:hover {
  background: rgba(244, 63, 94, 0.16);
  color: #fb7185;
  border-color: rgba(244, 63, 94, 0.35);
}

.cmp-modal-body {
  padding: 18px;
  overflow: auto;
  flex: 1;
}

.btn-dl-all-zip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 5px;
  padding: 3px 8px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.2;
}
.btn-dl-all-zip:hover:not(:disabled) {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}
.btn-dl-all-zip:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.zip-mini-spinner {
  width: 10px;
  height: 10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #34d399;
  border-radius: 50%;
  animation: zipSpin 0.7s linear infinite;
  display: inline-block;
}
/* ===== BATCH EXPORT MODAL STYLES ===== */
.batch-export-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 16px;
  animation: batchFadeIn 0.2s ease-out;
}

@keyframes batchFadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.batch-export-modal {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 16px;
  width: 100%;
  max-width: 980px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  color: #f8fafc;
}

.batch-modal-header {
  padding: 18px 24px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.batch-header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.batch-title-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
  flex-shrink: 0;
}

.batch-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s;
}
.batch-close-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.batch-modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  flex: 1;
}

.batch-filter-box {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 16px 18px;
}

.batch-filter-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.batch-filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.batch-filter-label {
  font-size: 12px;
  font-weight: 700;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.batch-input {
  background: #0f172a;
  border: 1px solid #334155;
  color: #f8fafc;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}
.batch-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.batch-date-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-quick-dates {
  display: flex;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.batch-quick-dates button {
  background: #0f172a;
  border: 1px solid #334155;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.batch-quick-dates button:hover {
  color: #38bdf8;
  border-color: #38bdf8;
}
.batch-quick-dates button.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.batch-checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #e2e8f0;
  cursor: pointer;
  user-select: none;
  padding: 8px 12px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
}
.batch-checkbox-label input {
  cursor: pointer;
  accent-color: #2563eb;
}

.batch-table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 2px 0;
}

.batch-select-actions {
  display: flex;
  gap: 8px;
}

.batch-btn-secondary {
  background: #1e293b;
  border: 1px solid #334155;
  color: #cbd5e1;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.batch-btn-secondary:hover:not(:disabled) {
  background: #334155;
  color: white;
}

.batch-selection-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #cbd5e1;
  background: rgba(30, 41, 59, 0.7);
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(51, 65, 85, 0.6);
}

.batch-table-wrapper {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
  max-height: 380px;
  overflow-y: auto;
}

.batch-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}

.batch-table thead th {
  background: #0f172a;
  padding: 10px 14px;
  color: #94a3b8;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  z-index: 2;
  border-bottom: 1px solid #334155;
}

.batch-table-row {
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
  cursor: pointer;
  transition: background 0.15s ease;
}
.batch-table-row:hover {
  background: rgba(59, 130, 246, 0.08);
}
.batch-table-row.row-selected {
  background: rgba(37, 99, 235, 0.15);
}

.batch-table td {
  padding: 12px 14px;
  vertical-align: middle;
}

.batch-id-tag {
  font-family: monospace;
  font-weight: 700;
  font-size: 12px;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.batch-customer-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.batch-content-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 320px;
}
.batch-content-main {
  color: #e2e8f0;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.batch-content-note {
  color: #f59e0b;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.batch-badge-group {
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}
.batch-badge-file {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}
.batch-badge-img {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}
.batch-badge-empty {
  color: #64748b;
  font-size: 11px;
  font-style: italic;
}

.batch-modal-footer {
  padding: 16px 24px;
  background: #1e293b;
  border-top: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
}

.batch-footer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #94a3b8;
}

.batch-footer-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.batch-btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border: 1px solid #3b82f6;
  color: white;
  padding: 10px 22px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
  transition: all 0.2s;
}
.batch-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  transform: translateY(-1px);
}
.batch-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

/* PROGRESS OVERLAY */
.batch-progress-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  border-radius: 12px;
  animation: batchFadeIn 0.2s ease;
  padding: 24px;
}

.batch-progress-card {
  background: #1e293b;
  border: 1px solid #3b82f6;
  border-radius: 14px;
  padding: 24px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.batch-progress-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.batch-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: zipSpin 0.8s linear infinite;
  flex-shrink: 0;
}

.batch-progress-track {
  width: 100%;
  height: 10px;
  background: #0f172a;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #334155;
  margin-bottom: 12px;
}

.batch-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 999px;
  transition: width 0.25s ease;
}

.batch-progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #cbd5e1;
}

.batch-btn-cancel {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.batch-btn-cancel:hover {
  background: #ef4444;
  color: white;
}

/* ═══ JSON EXPORT BAR & MODAL STYLES (DẠNG SO SÁNH) ═══ */
.cmp-json-export-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  padding: 12px 18px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(9, 13, 22, 0.98));
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.cmp-json-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cmp-json-bar-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.35));
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cmp-json-bar-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cmp-json-bar-title {
  font-size: 14px;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.2px;
}

.cmp-json-bar-stats {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
}

.cmp-json-bar-stats strong {
  color: #f1f5f9;
  font-weight: 700;
}

.cmp-stat-dot {
  color: #475569;
}

.cmp-json-bar-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.cmp-json-mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.25);
  cursor: pointer;
  transition: all 0.18s ease;
}

.cmp-json-mode-btn:hover {
  background: rgba(51, 65, 85, 0.95);
  border-color: rgba(56, 189, 248, 0.5);
  color: #38bdf8;
  transform: translateY(-1px);
}

.cmp-json-primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  border: 1px solid rgba(52, 211, 153, 0.45);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  cursor: pointer;
  transition: all 0.18s ease;
}

.cmp-json-primary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.42);
  transform: translateY(-1px);
}

.cmp-json-primary-btn:disabled,
.cmp-json-quick-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cmp-json-quick-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(14, 165, 233, 0.14);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
  cursor: pointer;
  transition: all 0.18s ease;
}

.cmp-json-quick-all-btn:hover:not(:disabled) {
  background: rgba(14, 165, 233, 0.25);
  color: #e0f2fe;
  border-color: rgba(56, 189, 248, 0.6);
  transform: translateY(-1px);
}

.cmp-customer-json-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.32);
  cursor: pointer;
  transition: all 0.18s ease;
}

.cmp-customer-json-btn:hover:not(:disabled) {
  background: #10b981;
  color: #ffffff;
  border-color: #059669;
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.28);
}

.cmp-dock-json-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(14, 165, 233, 0.12);
  color: #0284c7;
  border: 1px solid rgba(14, 165, 233, 0.3);
  border-radius: 8px;
  padding: 7px 13px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cmp-dock-json-btn:hover:not(:disabled) {
  background: #0284c7;
  color: #ffffff;
  border-color: #0369a1;
}

.json-scope-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  background: #090d16;
  padding: 6px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.json-scope-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.18s ease;
}

.json-scope-tab:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.04);
}

.json-scope-tab.active {
  color: #34d399;
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.38);
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.15);
}

.json-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.json-summary-card {
  background: #0d131f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.json-sum-label {
  font-size: 11.5px;
  color: #94a3b8;
  font-weight: 600;
}

.json-sum-val {
  font-size: 20px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
}

.json-finance-preview-box {
  background: #0d131f;
  border: 1px solid rgba(16, 185, 129, 0.22);
  border-radius: 10px;
  padding: 14px 16px;
}

.json-preview-title {
  font-size: 11.5px;
  font-weight: 800;
  color: #34d399;
  letter-spacing: 0.4px;
  margin-bottom: 12px;
}

.json-fin-metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.json-fin-item {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 9px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.json-fin-item span {
  font-size: 11px;
  color: #94a3b8;
}

.json-fin-item strong {
  font-size: 13.5px;
  font-weight: 700;
  color: #f8fafc;
  font-family: 'JetBrains Mono', monospace;
}

.json-row-dl-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
  cursor: pointer;
  transition: all 0.16s ease;
}

.json-row-dl-btn:hover:not(:disabled) {
  background: #10b981;
  color: #ffffff;
  border-color: #059669;
}

.cmp-json-mode-btn.is-chain-btn {
  background: rgba(168, 85, 247, 0.14);
  color: #d8b4fe;
  border-color: rgba(168, 85, 247, 0.4);
}
.cmp-json-mode-btn.is-chain-btn:hover {
  background: rgba(168, 85, 247, 0.28);
  color: #ffffff;
  border-color: #a855f7;
}

/* ═══ THANH CÔNG CỤ CHUỖI CARD LIÊN KẾT TRÊN TRANG ═══ */
.cmp-linked-chain-block {
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
  background: rgba(15, 23, 42, 0.35);
}

.cmp-chain-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px 12px;
  margin-bottom: 12px;
  border-radius: 9px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.85));
  border: 1px solid rgba(56, 189, 248, 0.28);
}

.cmp-chain-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.cmp-chain-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.38);
  white-space: nowrap;
}

.cmp-chain-flow-text {
  font-size: 11.5px;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cmp-chain-bar-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.cmp-chain-select-btn,
.cmp-chain-picker-btn,
.cmp-chain-dl-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
}

.cmp-chain-select-btn {
  background: rgba(30, 41, 59, 0.9);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.32);
}
.cmp-chain-select-btn:hover,
.cmp-chain-select-btn.active {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.55);
}

.cmp-chain-picker-btn {
  background: rgba(245, 158, 11, 0.14);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.38);
}
.cmp-chain-picker-btn:hover {
  background: #f59e0b;
  color: #0f172a;
  border-color: #d97706;
}

.cmp-chain-dl-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  border: 1px solid rgba(52, 211, 153, 0.5);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
}
.cmp-chain-dl-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
}
.cmp-chain-dl-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ═══ DANH SÁCH CHUỖI LIÊN KẾT TRONG MODAL XUẤT JSON ═══ */
.focused-chain-banner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fbbf24;
  font-size: 11.5px;
  font-weight: 700;
}

.focused-chain-reset-btn {
  background: rgba(15, 23, 42, 0.8);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}
.focused-chain-reset-btn:hover {
  background: #f59e0b;
  color: #0f172a;
}

.json-chains-scroll-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 390px;
  overflow-y: auto;
  padding-right: 4px;
}

.json-chains-empty {
  text-align: center;
  padding: 36px;
  color: #94a3b8;
  background: #0d131f;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}

.json-chain-card-box {
  background: #0d131f;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.json-chain-card-box.is-chain-selected {
  border-color: rgba(16, 185, 129, 0.48);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.1);
}

.json-chain-box-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #131c2e, #0f172a);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  cursor: pointer;
}

.json-chain-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.json-chain-index-badge {
  background: rgba(168, 85, 247, 0.18);
  color: #d8b4fe;
  border: 1px solid rgba(168, 85, 247, 0.4);
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.json-chain-cus-info {
  font-size: 13px;
  color: #f8fafc;
}

.json-chain-comp {
  color: #94a3b8;
  font-size: 12px;
}

.json-chain-code {
  color: #38bdf8;
  font-size: 11.5px;
  font-family: monospace;
  margin-left: 4px;
}

.json-chain-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.json-chain-metric-pill {
  font-size: 11px;
  color: #cbd5e1;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 2px 8px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
}

.json-chain-nodes-list {
  display: flex;
  flex-direction: column;
}

.json-chain-node-row {
  display: grid;
  grid-template-columns: 36px 210px 1fr 125px 150px 95px;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.4);
  cursor: pointer;
  transition: background 0.15s ease;
}

.json-chain-node-row:last-child {
  border-bottom: none;
}

.json-chain-node-row:hover {
  background: rgba(59, 130, 246, 0.08);
}

.json-chain-node-row.row-selected {
  background: rgba(16, 185, 129, 0.1);
}

.json-chain-node-check {
  display: flex;
  align-items: center;
  justify-content: center;
}

.json-chain-node-step {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.json-chain-tree-branch {
  color: #10b981;
  font-weight: 800;
  font-family: monospace;
}

.json-step-badge {
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 10.5px;
  font-weight: 700;
}

.json-step-badge.is-root {
  background: rgba(245, 158, 11, 0.16);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.json-step-badge.is-child {
  background: rgba(56, 189, 248, 0.14);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.32);
}

.json-node-date {
  font-size: 11px;
  color: #94a3b8;
  font-family: monospace;
}

.json-chain-node-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.json-chain-node-badges {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;
}

.json-chain-node-money {
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
}

.json-chain-node-action {
  text-align: right;
}

.json-card-chain-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  background: rgba(168, 85, 247, 0.16);
  color: #d8b4fe;
  border: 1px solid rgba(168, 85, 247, 0.38);
}
</style>

