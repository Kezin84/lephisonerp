<template>
  <div class="report-container">
    <header class="header" style="position: relative; justify-content: center;">
      <div class="title-section" style="text-align: center;">
        <h1 style="color: #10b981; text-transform: uppercase;">Quản Lý Báo Cáo</h1>
        <p class="subtitle">Theo dõi và cập nhật trạng thái công việc</p>
      </div>
      <div class="header-actions" style="position: absolute; right: 0;">
        <button class="btn-excel" @click="exportExcel">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Xuất Excel</span>
        </button>
        <button class="btn-primary" @click="openAddModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Thêm Báo Cáo Mới</span>
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
        <button class="elite-refresh-btn" @click="fetchReports">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
          Làm mới
        </button>
      </div>

      <div class="elite-filter-body">
        <div class="elite-filter-row">
          <div class="elite-date-group group-tabs" style="flex: 0 0 auto; min-width: auto; max-width: none;">
            <label style="opacity: 0; user-select: none;" class="mobile-hidden-label">Chế độ</label>
            <div class="elite-mode-tabs">
              <button type="button" :class="{ active: filters.filterMode === 'day' }" @click="filters.filterMode = 'day'">Ngày</button>
              <button type="button" :class="{ active: filters.filterMode === 'month' }" @click="filters.filterMode = 'month'">Tháng</button>
              <button type="button" :class="{ active: filters.filterMode === 'year' }" @click="filters.filterMode = 'year'">Năm</button>
            </div>
          </div>

          <div class="elite-date-group group-period" style="min-width: 90px; max-width: 140px;">
            <label>Buổi</label>
            <CustomSelect v-model="filters.period" :options="periodOptions" />
          </div>

          <template v-if="filters.filterMode === 'day'">
            <div class="elite-date-group group-date">
              <label>Từ ngày</label>
              <input type="date" v-model="filters.dateFrom" :max="filters.dateTo" @change="fetchReports" @click="e => e.target.showPicker && e.target.showPicker()" class="elite-input" />
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date">
              <label>Đến ngày</label>
              <input type="date" v-model="filters.dateTo" :min="filters.dateFrom" @change="fetchReports" @click="e => e.target.showPicker && e.target.showPicker()" class="elite-input" />
            </div>
          </template>

          <template v-if="filters.filterMode === 'month'">
            <div class="elite-date-group group-date">
              <label>Từ tháng</label>
              <input type="month" v-model="filters.monthFrom" :max="filters.monthTo" @change="fetchReports" @click="e => e.target.showPicker && e.target.showPicker()" class="elite-input" />
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date">
              <label>Đến tháng</label>
              <input type="month" v-model="filters.monthTo" :min="filters.monthFrom" @change="fetchReports" @click="e => e.target.showPicker && e.target.showPicker()" class="elite-input" />
            </div>
          </template>

          <template v-if="filters.filterMode === 'year'">
            <div class="elite-date-group group-date">
              <label>Từ năm</label>
              <input type="number" v-model="filters.yearFrom" :max="filters.yearTo" @change="fetchReports" placeholder="2024" class="elite-input" />
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date">
              <label>Đến năm</label>
              <input type="number" v-model="filters.yearTo" :min="filters.yearFrom" @change="fetchReports" placeholder="2025" class="elite-input" />
            </div>
          </template>
        </div>

        <div v-show="isMobile" class="elite-filter-divider"></div>

        <button v-show="isMobile" class="filter-expand-btn" @click="isExpandedFilters = !isExpandedFilters">
          <span style="font-weight: 700; font-size: 0.85rem; color: #475569;">{{ isExpandedFilters ? 'Thu gọn bộ lọc nâng cao' : 'Mở rộng bộ lọc nâng cao' }}</span>
          <svg :class="{'rotate-180': isExpandedFilters}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.3s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>

        <transition name="filter-expand">
          <div v-show="isExpandedFilters && isMobile" class="elite-filter-row" style="margin-top: 1rem;">
            <div class="elite-select-group">
              <label>Sắp xếp</label>
              <CustomSelect v-model="filters.sortOrder" :options="sortOptions" />
            </div>
            <div class="elite-select-group">
              <label>Độ quan trọng</label>
              <CustomSelect v-model="filters.tag" :options="priorityOptions" />
            </div>
            <div class="elite-select-group">
              <label>Phân loại</label>
              <CustomSelect v-model="filters.phan_loai" :options="typeOptions" />
            </div>
            <div class="elite-select-group">
              <label>Trạng thái</label>
              <CustomSelect v-model="filters.trang_thai" :options="statusOptions" />
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Thẻ thống kê -->
    <div class="stats-row">
      <div class="stat-card card-total" 
           :class="{ 'elite-active': filters.trang_thai === 'Tất cả' || !filters.trang_thai }"
           @click="onCardClick('Tất cả')">
        <div class="stat-icon total">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Tổng cộng</span>
          <span class="stat-value">{{ totalCount }} <span class="unit-text">việc</span></span>
        </div>
      </div>
      <div class="stat-card card-pending" 
           :class="{ 'elite-active': filters.trang_thai === 'Chưa xử lý' }"
           @click="onCardClick('Chưa xử lý')">
        <div class="stat-icon pending">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Chưa hoàn thành</span>
          <span class="stat-value">{{ pendingCount }} <span class="unit-text">việc</span></span>
        </div>
      </div>
      <div class="stat-card card-done" 
           :class="{ 'elite-active': filters.trang_thai === 'Hoàn thành' }"
           @click="onCardClick('Hoàn thành')">
        <div class="stat-icon done">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Đã hoàn thành</span>
          <span class="stat-value">{{ completedCount }} <span class="unit-text">việc</span></span>
        </div>
      </div>
    </div>

    <!-- Action Buttons & PC Filters -->
    <div class="action-bar-container">
      <!-- Action Buttons (Now on the left) -->
      <div class="action-bar">
        <button v-if="isMobile" class="mobile-action-btn add" @click="openAddModal">
          <div class="icon-white-bg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          THÊM
        </button>
        <button class="mobile-action-btn empty-days" @click="showEmptyDays">
          <div class="icon-white-bg">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          LỊCH TRỐNG
        </button>
        <button class="mobile-action-btn distribute-tasks" @click="openDistributeModal">
          <div class="icon-white-bg">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"></path><path d="M4 20L21 3"></path><path d="M21 16v5h-5"></path><path d="M15 15l6 6"></path><path d="M4 4l5 5"></path></svg>
          </div>
          CHIA VIỆC
        </button>
        <button v-if="!isMobile" class="mobile-action-btn move-tasks" @click="openMoveModal">
          <div class="icon-white-bg">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l4-4 4 4"/><path d="M9 5v14"/><path d="M19 15l-4 4-4-4"/><path d="M15 19V5"/></svg>
          </div>
          CHUYỂN VIỆC
        </button>
        <button class="mobile-action-btn excel" @click="exportExcel">
          <div class="icon-white-bg">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </div>
          XUẤT EXCEL
        </button>
      </div>

      <!-- PC Filters (ẩn trên mobile) - Now on the right -->
      <div v-if="!isMobile" class="elite-filter-row pc-filters">
        <div class="elite-select-group">
          <label>Sắp xếp</label>
          <CustomSelect v-model="filters.sortOrder" :options="sortOptions" />
        </div>
        <div class="elite-select-group">
          <label>Độ quan trọng</label>
          <CustomSelect v-model="filters.tag" :options="priorityOptions" />
        </div>
        <div class="elite-select-group">
          <label>Phân loại</label>
          <CustomSelect v-model="filters.phan_loai" :options="typeOptions" />
        </div>
        <div class="elite-select-group">
          <label>Trạng thái</label>
          <CustomSelect v-model="filters.trang_thai" :options="statusOptions" />
        </div>
      </div>
    </div>

    <!-- Bảng Dữ Liệu (PC) -->
    <!-- Bảng Dữ Liệu -->
    <div ref="tableSection">
      <!-- Toolbar (PC only) -->
      <div class="elite-table-toolbar desktop-only" style="margin-bottom: 1.5rem; position: relative;">
        <!-- Nút THÊM căn trái tuyệt đối -->
        <button class="tech-vip-btn" @click="openAddModal" style="position: absolute; left: 0; z-index: 10; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer;">
          <div style="background: rgba(255,255,255,0.25); border-radius: 50%; padding: 0.3rem; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          THÊM
        </button>

        <div class="toolbar-left" style="display: flex; align-items: center; gap: 0.5rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          <h3>DANH SÁCH BÁO CÁO</h3>
        </div>
        <div class="toolbar-right" style="margin-left: 1rem; display: flex; align-items: center; gap: 0.75rem;">
          <span class="record-badge">{{ filteredReports.length }} việc</span>
        </div>
      </div>
      <!-- View Mode Toggle Row -->
      <div v-if="!isMobile" class="view-mode-row">
        <div class="view-mode-tabs">
          <button type="button" :class="{ 'active-green': desktopViewMode === 'detail' }" @click="desktopViewMode = 'detail'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Chi tiết
          </button>
          <button type="button" :class="{ 'active-blue': desktopViewMode === 'daily' }" @click="desktopViewMode = 'daily'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            Theo ngày
          </button>
        </div>
      </div>

      <!-- Kanban Board: chỉ hiện trên desktop khi mode = detail -->
      <div v-if="!isMobile && desktopViewMode === 'detail'" class="kanban-board">
        <div v-for="col in kanbanColumns" :key="col.status" 
             class="kanban-column"
             :class="[
               col.status === 'Hoàn thành' ? 'kb-col-done' : 'kb-col-pending'
             ]">
          <div class="kanban-header">
            <div class="kanban-title">
              <span class="status-dot" :class="col.dotClass"></span>
              <h3>{{ col.title }}</h3>
            </div>
            <span class="kanban-badge">{{ col.reports.length }}</span>
          </div>

          <div class="kanban-inner-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; flex: 1;">
            <!-- Cột Sáng -->
            <div class="inner-col inner-col-morning"
                 :class="{ 'kb-col-drag-over': dragOverColumn === col.status + '-Sáng' }"
                 @dragover.prevent
                 @dragenter.prevent="onDragEnterColumn(col.status, 'Sáng')"
                 @dragleave="onDragLeaveColumn($event, $el)"
                 @drop="onDropReport($event, col.status, 'Sáng')"
                 style="display: flex; flex-direction: column; gap: 0.5rem; height: 100%; border-radius: 12px; padding: 0.5rem; background: rgba(59, 130, 246, 0.02); border: 1px dashed rgba(59, 130, 246, 0.1);">
              <div class="inner-col-header" style="text-align: center; font-size: 1.1rem; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Buổi sáng</div>
              <div class="kanban-list" style="padding: 0; min-height: 100px;">
                <div v-if="loading" class="loading-state">
                  <div class="spinner"></div>
                </div>
                <div v-else-if="col.reports.filter(r => formatDisplayTime(r.thoi_gian).period === 'Sáng').length === 0" class="empty-state" style="padding: 2rem 1rem;">
                  <div v-if="col.status === 'Chưa xử lý'" class="empty-add-btn-simple" @click="openAddModalForPeriod('Sáng')" title="Thêm công việc">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </div>
                  <span v-else style="font-size: 0.75rem; opacity: 0.5;">Trống</span>
                </div>
                <template v-else>
                  <div v-for="(report, index) in col.reports.filter(r => formatDisplayTime(r.thoi_gian).period === 'Sáng')" :key="'card-' + report.id" 
                       class="report-card-timeline" :class="{ 'highlight-card': report.id === highlightedReportId, 'deleting-row': deletingIds.includes(report.id), 'dropped-success': report.id === droppedReportId }" 
                       :style="{ animationDelay: (index * 0.07) + 's' }"
                       draggable="true"
                       @dragstart="onDragStartReport($event, report)"
                       @dragend="onDragEndReport"
                       @click="openEditModal(report)">
                    <!-- Hình tròn: STT + Thời gian -->
                    <div class="tl-orb-wrap">
                      <div class="tl-orb-ring" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-ring--morning' : 'tl-ring--afternoon'"></div>
                      <div class="tl-circle" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-circle--morning' : 'tl-circle--afternoon'">
                        <div class="tl-circle-inner">
                          <span class="tl-thu-period">{{ formatDisplayTime(report.thoi_gian).thu }} <span class="tl-period" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'is-morning' : 'is-afternoon'">{{ formatDisplayTime(report.thoi_gian).period }}</span></span>
                          <span class="tl-date">{{ formatDisplayTime(report.thoi_gian).date }}</span>
                          <span class="tl-time">{{ formatDisplayTime(report.thoi_gian).time }}</span>
                          <span class="tl-stt">#{{ index + 1 }}</span>
                        </div>
                      </div>
                      <div class="tl-orbit-trail"></div>
                    </div>
                    <!-- Connector -->
                    <div class="tl-connector" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-conn--morning' : 'tl-conn--afternoon'">
                      <div class="tl-conn-dot"></div>
                      <div class="tl-beam-particle" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-beam--morning' : 'tl-beam--afternoon'"></div>
                    </div>
                    <!-- Hình chữ nhật: Nội dung còn lại -->
                    <div class="tl-rect" :class="[report.trang_thai === 'Hoàn thành' ? 'tl-rect--done' : 'tl-rect--pending', formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-border--morning' : 'tl-border--afternoon']">
                      <div class="tl-shimmer-border" :class="report.trang_thai === 'Hoàn thành' ? 'tl-shimmer--done' : 'tl-shimmer--pending'"></div>
                      <div class="tl-rect-header">
                        <div class="tl-rect-tags">
                          <span class="tl-badge-cat" :class="getCategoryClass(report.phan_loai)">{{ report.phan_loai }}</span>
                          <div class="tl-status-chip" :class="getStatusPillClass(report.trang_thai)">
                            <svg v-if="report.trang_thai === 'Hoàn thành'" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            {{ report.trang_thai }}
                          </div>
                          <span v-if="report.tag" v-for="t in splitTags(report.tag)" :key="t" v-show="t !== 'BÌNH THƯỜNG'" class="tl-badge-tag" :class="getTagClass(t)">{{ t }}</span>
                        </div>
                      </div>
                      <div v-if="report.img_save" style="display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0.5rem 0.5rem 0 0.5rem;">
                        <a v-for="(link, i) in report.img_save.split('\n').filter(Boolean)" :key="'img'+i" href="#" @click.prevent.stop="selectedImage = link" style="width: 45px; height: 45px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                           <img :src="link" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                        </a>
                      </div>
                      <div class="tl-rect-body">
                        <div class="tl-body-text">{{ report.noi_dung }}</div>
                      </div>
                      <div class="tl-rect-note" v-if="report.ghi_chu">
                        <div class="tl-note-accent"></div>
                        <div class="tl-note-content">
                          <div class="tl-note-icon">NOTE</div>
                          <span>{{ report.ghi_chu }}</span>
                        </div>
                      </div>

                      <div class="tl-attachments" v-if="report.link_excel_bao_gia || report.link_excel_mua_hang" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; padding: 0 0.5rem;">
                        <div v-if="report.link_excel_bao_gia" style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                          <a v-for="(link, i) in report.link_excel_bao_gia.split('\n').filter(Boolean)" :key="'bg'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá'))"  class="file-attach-badge" :title="getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá')">
                            <span v-html="getFileIconSvg(getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá'))" style="display:flex;align-items:center;"></span>
                            <span class="file-attach-text">{{ getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá') }}</span>
                          </a>
                        </div>
                        <div v-if="report.link_excel_mua_hang" style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                          <a v-for="(link, i) in report.link_excel_mua_hang.split('\n').filter(Boolean)" :key="'mh'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng'))"  class="file-attach-badge" :title="getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng')">
                            <span v-html="getFileIconSvg(getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng'))" style="display:flex;align-items:center;"></span>
                            <span class="file-attach-text">{{ getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng') }}</span>
                          </a>
                        </div>
                      </div>
                      <div class="tl-rect-actions">
                        <button class="tl-action-btn tl-action-delete" @click.stop="confirmDelete(report.id)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          Xoá
                        </button>
                        <button v-if="report.trang_thai !== 'Hoàn thành'" class="tl-action-btn tl-action-done" @click.stop="markAsCompleted(report)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          Xong
                        </button>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- Cột Chiều -->
            <div class="inner-col inner-col-afternoon"
                 :class="{ 'kb-col-drag-over': dragOverColumn === col.status + '-Chiều' }"
                 @dragover.prevent
                 @dragenter.prevent="onDragEnterColumn(col.status, 'Chiều')"
                 @dragleave="onDragLeaveColumn($event, $el)"
                 @drop="onDropReport($event, col.status, 'Chiều')"
                 style="display: flex; flex-direction: column; gap: 0.5rem; height: 100%; border-radius: 12px; padding: 0.5rem; background: rgba(168, 85, 247, 0.02); border: 1px dashed rgba(168, 85, 247, 0.1);">
              <div class="inner-col-header" style="text-align: center; font-size: 1.1rem; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Buổi chiều</div>
              <div class="kanban-list" style="padding: 0; min-height: 100px;">
                <div v-if="loading" class="loading-state">
                  <div class="spinner"></div>
                </div>
                <div v-else-if="col.reports.filter(r => formatDisplayTime(r.thoi_gian).period === 'Chiều').length === 0" class="empty-state" style="padding: 2rem 1rem;">
                  <div v-if="col.status === 'Chưa xử lý'" class="empty-add-btn-simple" @click="openAddModalForPeriod('Chiều')" title="Thêm công việc">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </div>
                  <span v-else style="font-size: 0.75rem; opacity: 0.5;">Trống</span>
                </div>
                <template v-else>
                  <div v-for="(report, index) in col.reports.filter(r => formatDisplayTime(r.thoi_gian).period === 'Chiều')" :key="'card-' + report.id" 
                       class="report-card-timeline" :class="{ 'highlight-card': report.id === highlightedReportId, 'deleting-row': deletingIds.includes(report.id), 'dropped-success': report.id === droppedReportId }" 
                       :style="{ animationDelay: (index * 0.07) + 's' }"
                       draggable="true"
                       @dragstart="onDragStartReport($event, report)"
                       @dragend="onDragEndReport"
                       @click="openEditModal(report)">
                    <!-- Hình tròn: STT + Thời gian -->
                    <div class="tl-orb-wrap">
                      <div class="tl-orb-ring" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-ring--morning' : 'tl-ring--afternoon'"></div>
                      <div class="tl-circle" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-circle--morning' : 'tl-circle--afternoon'">
                        <div class="tl-circle-inner">
                          <span class="tl-thu-period">{{ formatDisplayTime(report.thoi_gian).thu }} <span class="tl-period" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'is-morning' : 'is-afternoon'">{{ formatDisplayTime(report.thoi_gian).period }}</span></span>
                          <span class="tl-date">{{ formatDisplayTime(report.thoi_gian).date }}</span>
                          <span class="tl-time">{{ formatDisplayTime(report.thoi_gian).time }}</span>
                          <span class="tl-stt">#{{ index + 1 }}</span>
                        </div>
                      </div>
                      <div class="tl-orbit-trail"></div>
                    </div>
                    <!-- Connector -->
                    <div class="tl-connector" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-conn--morning' : 'tl-conn--afternoon'">
                      <div class="tl-conn-dot"></div>
                      <div class="tl-beam-particle" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-beam--morning' : 'tl-beam--afternoon'"></div>
                    </div>
                    <!-- Hình chữ nhật: Nội dung còn lại -->
                    <div class="tl-rect" :class="[report.trang_thai === 'Hoàn thành' ? 'tl-rect--done' : 'tl-rect--pending', formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-border--morning' : 'tl-border--afternoon']">
                      <div class="tl-shimmer-border" :class="report.trang_thai === 'Hoàn thành' ? 'tl-shimmer--done' : 'tl-shimmer--pending'"></div>
                      <div class="tl-rect-header">
                        <div class="tl-rect-tags">
                          <span class="tl-badge-cat" :class="getCategoryClass(report.phan_loai)">{{ report.phan_loai }}</span>
                          <div class="tl-status-chip" :class="getStatusPillClass(report.trang_thai)">
                            <svg v-if="report.trang_thai === 'Hoàn thành'" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            {{ report.trang_thai }}
                          </div>
                          <span v-if="report.tag" v-for="t in splitTags(report.tag)" :key="t" v-show="t !== 'BÌNH THƯỜNG'" class="tl-badge-tag" :class="getTagClass(t)">{{ t }}</span>
                        </div>
                      </div>
                      <div v-if="report.img_save" style="display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0.5rem 0.5rem 0 0.5rem;">
                        <a v-for="(link, i) in report.img_save.split('\n').filter(Boolean)" :key="'img'+i" href="#" @click.prevent.stop="selectedImage = link" style="width: 45px; height: 45px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" :title="`Ảnh ${i + 1}`">
                           <img :src="link" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                        </a>
                      </div>
                      <div class="tl-rect-body">
                        <div class="tl-body-text">{{ report.noi_dung }}</div>
                      </div>
                      <div class="tl-rect-note" v-if="report.ghi_chu">
                        <div class="tl-note-accent"></div>
                        <div class="tl-note-content">
                          <div class="tl-note-icon">NOTE</div>
                          <span>{{ report.ghi_chu }}</span>
                        </div>
                      </div>

                      <div class="tl-attachments" v-if="report.link_excel_bao_gia || report.link_excel_mua_hang" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; padding: 0 0.5rem;">
                        <div v-if="report.link_excel_bao_gia" style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                          <a v-for="(link, i) in report.link_excel_bao_gia.split('\n').filter(Boolean)" :key="'bg'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá'))"  class="file-attach-badge" :title="getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá')">
                            <span v-html="getFileIconSvg(getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá'))" style="display:flex;align-items:center;"></span>
                            <span class="file-attach-text">{{ getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá') }}</span>
                          </a>
                        </div>
                        <div v-if="report.link_excel_mua_hang" style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                          <a v-for="(link, i) in report.link_excel_mua_hang.split('\n').filter(Boolean)" :key="'mh'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng'))"  class="file-attach-badge" :title="getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng')">
                            <span v-html="getFileIconSvg(getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng'))" style="display:flex;align-items:center;"></span>
                            <span class="file-attach-text">{{ getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng') }}</span>
                          </a>
                        </div>
                      </div>
                      <div class="tl-rect-actions">
                        <button class="tl-action-btn tl-action-delete" @click.stop="confirmDelete(report.id)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          Xoá
                        </button>
                        <button v-if="report.trang_thai !== 'Hoàn thành'" class="tl-action-btn tl-action-done" @click.stop="markAsCompleted(report)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          Xong
                        </button>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily View: 1 cột theo từng ngày -->
      <div v-if="!isMobile && desktopViewMode === 'daily'" class="daily-view-container">
        <div v-if="loading" class="loading-state" style="padding: 3rem;"><div class="spinner"></div></div>
        <div v-else-if="dailyColumns.length === 0" class="empty-state" style="padding: 4rem 2rem; text-align: center;">
          <p style="opacity: 0.5; font-size: 0.9rem;">Không có dữ liệu trong khoảng thời gian này.</p>
        </div>
        <div v-else v-for="day in dailyColumns" :key="day.dateKey" class="daily-day-block">
          <!-- Day Header Badge -->
          <div class="daily-day-header">
            <div class="daily-day-badge">
              <span class="daily-badge-thu">{{ day.thuLabel }}</span>
              <span class="daily-badge-date">{{ day.dateLabel }}</span>
            </div>
            <span class="daily-count-badge">{{ day.morning.length + day.afternoon.length }} việc</span>
          </div>
          <!-- Two Period Sections -->
          <div class="daily-periods">
            <!-- Buổi Sáng -->
            <div class="daily-period-section daily-period-morning"
                 :class="{ 'kb-col-drag-over': dragOverColumn === 'daily-' + day.dateKey + '-Sáng' }"
                 @dragover.prevent
                 @dragenter.prevent="onDragEnterColumn('daily-' + day.dateKey, 'Sáng')"
                 @dragleave="onDragLeaveColumn($event, $el)"
                 @drop="onDropReport($event, null, 'Sáng')">
              <div class="daily-period-label-v2">BUỔI SÁNG</div>
              <div v-if="day.morning.length === 0" class="daily-empty-slot">
                <div class="empty-add-btn-simple" @click="openAddModalForPeriod('Sáng')" title="Thêm công việc buổi sáng">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
              </div>
              <div v-else class="daily-task-list">
                <div v-for="(report, index) in day.morning" :key="'dm-'+report.id"
                     class="report-card-timeline" :class="{ 'highlight-card': report.id === highlightedReportId, 'deleting-row': deletingIds.includes(report.id), 'dropped-success': report.id === droppedReportId }"
                     :style="{ animationDelay: (index * 0.07) + 's' }"
                     draggable="true"
                     @dragstart="onDragStartReport($event, report)"
                     @dragend="onDragEndReport"
                     @click="openEditModal(report)">
                  <div class="tl-orb-wrap">
                    <div class="tl-orb-ring tl-ring--morning"></div>
                    <div class="tl-circle tl-circle--morning">
                      <div class="tl-circle-inner">
                        <span class="tl-thu-period">{{ formatDisplayTime(report.thoi_gian).thu }} <span class="tl-period is-morning">{{ formatDisplayTime(report.thoi_gian).period }}</span></span>
                        <span class="tl-date">{{ formatDisplayTime(report.thoi_gian).date }}</span>
                        <span class="tl-time">{{ formatDisplayTime(report.thoi_gian).time }}</span>
                        <span class="tl-stt">#{{ index + 1 }}</span>
                      </div>
                    </div>
                    <div class="tl-orbit-trail"></div>
                  </div>
                  <div class="tl-connector tl-conn--morning">
                    <div class="tl-conn-dot"></div>
                    <div class="tl-beam-particle tl-beam--morning"></div>
                  </div>
                  <div class="tl-rect" :class="[report.trang_thai === 'Hoàn thành' ? 'tl-rect--done' : 'tl-rect--pending', 'tl-border--morning']">
                    <div class="tl-shimmer-border" :class="report.trang_thai === 'Hoàn thành' ? 'tl-shimmer--done' : 'tl-shimmer--pending'"></div>
                    <div class="tl-rect-header">
                      <div class="tl-rect-tags">
                        <span class="tl-badge-cat" :class="getCategoryClass(report.phan_loai)">{{ report.phan_loai }}</span>
                        <div class="tl-status-chip" :class="getStatusPillClass(report.trang_thai)">
                          <svg v-if="report.trang_thai === 'Hoàn thành'" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <svg v-else xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          {{ report.trang_thai }}
                        </div>
                        <span v-if="report.tag" v-for="t in splitTags(report.tag)" :key="t" v-show="t !== 'BÌNH THƯỜNG'" class="tl-badge-tag" :class="getTagClass(t)">{{ t }}</span>
                      </div>
                    </div>
                    <div v-if="report.img_save" style="display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0.5rem 0.5rem 0 0.5rem;">
                      <a v-for="(link, i) in report.img_save.split('\n').filter(Boolean)" :key="'img'+i" href="#" @click.prevent.stop="selectedImage = link" style="width: 45px; height: 45px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                         <img :src="link" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                      </a>
                    </div>
                    <div class="tl-rect-body">
                      <div class="tl-body-text">{{ report.noi_dung }}</div>
                    </div>
                    <div class="tl-rect-note" v-if="report.ghi_chu">
                      <div class="tl-note-accent"></div>
                      <div class="tl-note-content">
                        <div class="tl-note-icon">NOTE</div>
                        <span>{{ report.ghi_chu }}</span>
                      </div>
                    </div>
                    
                    <div class="tl-attachments" v-if="report.link_excel_bao_gia || report.link_excel_mua_hang" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; padding: 0 0.5rem;">
                      <div v-if="report.link_excel_bao_gia" style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                        <a v-for="(link, i) in report.link_excel_bao_gia.split('\n').filter(Boolean)" :key="'bg'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá'))"  class="file-attach-badge" :title="getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá')">
                          <span v-html="getFileIconSvg(getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá'))" style="display:flex;align-items:center;"></span>
                          <span class="file-attach-text">{{ getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá') }}</span>
                        </a>
                      </div>
                      <div v-if="report.link_excel_mua_hang" style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                        <a v-for="(link, i) in report.link_excel_mua_hang.split('\n').filter(Boolean)" :key="'mh'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng'))"  class="file-attach-badge" :title="getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng')">
                          <span v-html="getFileIconSvg(getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng'))" style="display:flex;align-items:center;"></span>
                          <span class="file-attach-text">{{ getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng') }}</span>
                        </a>
                      </div>
                    </div>

                    <div class="tl-rect-actions">
                      <button class="tl-action-btn tl-action-delete" @click.stop="confirmDelete(report.id)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Xoá
                      </button>
                      <button v-if="report.trang_thai !== 'Hoàn thành'" class="tl-action-btn tl-action-done" @click.stop="markAsCompleted(report)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Xong
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Buổi Chiều -->
            <div class="daily-period-section daily-period-afternoon"
                 :class="{ 'kb-col-drag-over': dragOverColumn === 'daily-' + day.dateKey + '-Chiều' }"
                 @dragover.prevent
                 @dragenter.prevent="onDragEnterColumn('daily-' + day.dateKey, 'Chiều')"
                 @dragleave="onDragLeaveColumn($event, $el)"
                 @drop="onDropReport($event, null, 'Chiều')">
              <div class="daily-period-label-v2">BUỔI CHIỀU</div>
              <div v-if="day.afternoon.length === 0" class="daily-empty-slot">
                <div class="empty-add-btn-simple" @click="openAddModalForPeriod('Chiều')" title="Thêm công việc buổi chiều">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
              </div>
              <div v-else class="daily-task-list">
                <div v-for="(report, index) in day.afternoon" :key="'da-'+report.id"
                     class="report-card-timeline" :class="{ 'highlight-card': report.id === highlightedReportId, 'deleting-row': deletingIds.includes(report.id), 'dropped-success': report.id === droppedReportId }"
                     :style="{ animationDelay: (index * 0.07) + 's' }"
                     draggable="true"
                     @dragstart="onDragStartReport($event, report)"
                     @dragend="onDragEndReport"
                     @click="openEditModal(report)">
                  <div class="tl-orb-wrap">
                    <div class="tl-orb-ring tl-ring--afternoon"></div>
                    <div class="tl-circle tl-circle--afternoon">
                      <div class="tl-circle-inner">
                        <span class="tl-thu-period">{{ formatDisplayTime(report.thoi_gian).thu }} <span class="tl-period is-afternoon">{{ formatDisplayTime(report.thoi_gian).period }}</span></span>
                        <span class="tl-date">{{ formatDisplayTime(report.thoi_gian).date }}</span>
                        <span class="tl-time">{{ formatDisplayTime(report.thoi_gian).time }}</span>
                        <span class="tl-stt">#{{ index + 1 }}</span>
                      </div>
                    </div>
                    <div class="tl-orbit-trail"></div>
                  </div>
                  <div class="tl-connector tl-conn--afternoon">
                    <div class="tl-conn-dot"></div>
                    <div class="tl-beam-particle tl-beam--afternoon"></div>
                  </div>
                  <div class="tl-rect" :class="[report.trang_thai === 'Hoàn thành' ? 'tl-rect--done' : 'tl-rect--pending', 'tl-border--afternoon']">
                    <div class="tl-shimmer-border" :class="report.trang_thai === 'Hoàn thành' ? 'tl-shimmer--done' : 'tl-shimmer--pending'"></div>
                    <div class="tl-rect-header">
                      <div class="tl-rect-tags">
                        <span class="tl-badge-cat" :class="getCategoryClass(report.phan_loai)">{{ report.phan_loai }}</span>
                        <div class="tl-status-chip" :class="getStatusPillClass(report.trang_thai)">
                          <svg v-if="report.trang_thai === 'Hoàn thành'" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <svg v-else xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          {{ report.trang_thai }}
                        </div>
                        <span v-if="report.tag" v-for="t in splitTags(report.tag)" :key="t" v-show="t !== 'BÌNH THƯỜNG'" class="tl-badge-tag" :class="getTagClass(t)">{{ t }}</span>
                      </div>
                    </div>
                    <div v-if="report.img_save" style="display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0.5rem 0.5rem 0 0.5rem;">
                      <a v-for="(link, i) in report.img_save.split('\n').filter(Boolean)" :key="'img'+i" href="#" @click.prevent.stop="selectedImage = link" style="width: 45px; height: 45px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                         <img :src="link" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                      </a>
                    </div>
                    <div class="tl-rect-body">
                      <div class="tl-body-text">{{ report.noi_dung }}</div>
                    </div>
                    <div class="tl-rect-note" v-if="report.ghi_chu">
                      <div class="tl-note-accent"></div>
                      <div class="tl-note-content">
                        <div class="tl-note-icon">NOTE</div>
                        <span>{{ report.ghi_chu }}</span>
                      </div>
                    </div>
                    
                    <div class="tl-attachments" v-if="report.link_excel_bao_gia || report.link_excel_mua_hang" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; padding: 0 0.5rem;">
                      <div v-if="report.link_excel_bao_gia" style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                        <a v-for="(link, i) in report.link_excel_bao_gia.split('\n').filter(Boolean)" :key="'bg'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá'))"  class="file-attach-badge" :title="getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá')">
                          <span v-html="getFileIconSvg(getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá'))" style="display:flex;align-items:center;"></span>
                          <span class="file-attach-text">{{ getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá') }}</span>
                        </a>
                      </div>
                      <div v-if="report.link_excel_mua_hang" style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                        <a v-for="(link, i) in report.link_excel_mua_hang.split('\n').filter(Boolean)" :key="'mh'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng'))"  class="file-attach-badge" :title="getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng')">
                          <span v-html="getFileIconSvg(getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng'))" style="display:flex;align-items:center;"></span>
                          <span class="file-attach-text">{{ getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng') }}</span>
                        </a>
                      </div>
                    </div>

                    <div class="tl-rect-actions">
                      <button class="tl-action-btn tl-action-delete" @click.stop="confirmDelete(report.id)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Xoá
                      </button>
                      <button v-if="report.trang_thai !== 'Hoàn thành'" class="tl-action-btn tl-action-done" @click.stop="markAsCompleted(report)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Xong
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile: danh sách đơn, không phân cột -->
      <div v-if="isMobile" class="mobile-card-list">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải dữ liệu báo cáo...</p>
        </div>
        <div v-else-if="filteredReports.length === 0" class="empty-state" style="padding: 4rem 2rem;">
          <div class="empty-add-btn-simple" @click="openAddModal" title="Thêm công việc">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          <p style="opacity: 0.5; font-size: 0.85rem; margin-top: 1rem;">Trống</p>
        </div>
        <div v-else v-for="(report, index) in filteredReports" :key="'mob-' + report.id"
             class="report-card-timeline" :class="{ 'highlight-card': report.id === highlightedReportId, 'deleting-row': deletingIds.includes(report.id), 'dropped-success': report.id === droppedReportId }"
             :style="{ animationDelay: (index * 0.07) + 's' }"
             @click="openEditModal(report)">

          <!-- Hình tròn: STT + Thời gian -->
          <div class="tl-orb-wrap">
            <div class="tl-orb-ring" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-ring--morning' : 'tl-ring--afternoon'"></div>
            <div class="tl-circle" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-circle--morning' : 'tl-circle--afternoon'">
              <div class="tl-circle-inner">
                <span class="tl-thu-period">{{ formatDisplayTime(report.thoi_gian).thu }} <span class="tl-period" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'is-morning' : 'is-afternoon'">{{ formatDisplayTime(report.thoi_gian).period }}</span></span>
                <span class="tl-date">{{ formatDisplayTime(report.thoi_gian).date }}</span>
                <span class="tl-time">{{ formatDisplayTime(report.thoi_gian).time }}</span>
                <span class="tl-stt">#{{ index + 1 }}</span>
              </div>
            </div>
            <div class="tl-orbit-trail"></div>
          </div>

          <!-- Connector -->
          <div class="tl-connector" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-conn--morning' : 'tl-conn--afternoon'">
            <div class="tl-conn-dot"></div>
            <div class="tl-beam-particle" :class="formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-beam--morning' : 'tl-beam--afternoon'"></div>
          </div>

          <!-- Nội dung -->
          <div class="tl-rect" :class="[report.trang_thai === 'Hoàn thành' ? 'tl-rect--done' : 'tl-rect--pending', formatDisplayTime(report.thoi_gian).period === 'Sáng' ? 'tl-border--morning' : 'tl-border--afternoon']">
            <!-- Ánh kim chạy viền -->
            <div class="tl-shimmer-border" :class="report.trang_thai === 'Hoàn thành' ? 'tl-shimmer--done' : 'tl-shimmer--pending'"></div>
            <div class="tl-rect-header">
              <div class="tl-rect-tags">
                <span class="tl-badge-cat" :class="getCategoryClass(report.phan_loai)">{{ report.phan_loai }}</span>
                <div class="tl-status-chip" :class="getStatusPillClass(report.trang_thai)">
                  <svg v-if="report.trang_thai === 'Hoàn thành'" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {{ report.trang_thai }}
                </div>
                <span v-if="report.tag" v-for="t in splitTags(report.tag)" :key="t" v-show="t !== 'BÌNH THƯỜNG'" class="tl-badge-tag" :class="getTagClass(t)">{{ t }}</span>
              </div>
            </div>
            <div v-if="report.img_save" style="display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0.5rem 0.5rem 0 0.5rem;">
              <a v-for="(link, i) in report.img_save.split('\n').filter(Boolean)" :key="'img'+i" href="#" @click.prevent.stop="selectedImage = link" style="width: 45px; height: 45px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" :title="`Ảnh ${i + 1}`">
                 <img :src="link" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
              </a>
            </div>
            <div class="tl-rect-body">
              <div class="tl-body-text">{{ report.noi_dung }}</div>
            </div>
            <div class="tl-rect-note" v-if="report.ghi_chu">
              <div class="tl-note-accent"></div>
              <div class="tl-note-content">
                <div class="tl-note-icon">NOTE</div>
                <span>{{ report.ghi_chu }}</span>
              </div>
            </div>

            <div class="tl-attachments" v-if="report.link_excel_bao_gia || report.link_excel_mua_hang" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; padding: 0 0.5rem;">
              <div v-if="report.link_excel_bao_gia" style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                <a v-for="(link, i) in report.link_excel_bao_gia.split('\n').filter(Boolean)" :key="'bg'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá'))"  class="file-attach-badge" :title="getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá')">
                  <span v-html="getFileIconSvg(getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá'))" style="display:flex;align-items:center;"></span>
                  <span class="file-attach-text">{{ getExcelFileName(report, 'link_excel_bao_gia', i, 'Báo giá') }}</span>
                </a>
              </div>
              <div v-if="report.link_excel_mua_hang" style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                <a v-for="(link, i) in report.link_excel_mua_hang.split('\n').filter(Boolean)" :key="'mh'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng'))"  class="file-attach-badge" :title="getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng')">
                  <span v-html="getFileIconSvg(getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng'))" style="display:flex;align-items:center;"></span>
                  <span class="file-attach-text">{{ getExcelFileName(report, 'link_excel_mua_hang', i, 'Mua hàng') }}</span>
                </a>
              </div>
            </div>
            <div class="tl-rect-actions">
              <button class="tl-action-btn tl-action-delete" @click.stop="confirmDelete(report.id)">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Xoá
              </button>
              <button v-if="report.trang_thai !== 'Hoàn thành'" class="tl-action-btn tl-action-done" @click.stop="markAsCompleted(report)">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Xong
              </button>
            </div>
          </div>
        </div>
      </div>
    </div><!-- end tableSection -->

    <!-- Elite Modal Form -->
    <div class="elite-modal-overlay" v-if="isModalOpen" @click.self="closeModal">
      <div class="elite-modal" :class="{'dark-mode-modal': isAfternoon}">
        <div class="elite-modal-header">
          <div class="elite-modal-title-wrapper" style="display: flex; flex-direction: column; gap: 0.25rem;">
            <div class="elite-modal-title">
              <svg v-if="!isEditing" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <h2>{{ isEditing ? 'Chỉnh Sửa Báo Cáo' : 'Thêm Báo Cáo Mới' }}</h2>
            </div>
            <div v-if="isEditing && formData.created_time" class="mobile-only" style="font-size: 0.75rem; color: #64748b; font-style: italic; margin-left: 1.8rem;">
              Được tạo lúc: {{ formData.created_time }}
            </div>
          </div>
          <button class="elite-btn-close" @click="closeModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <form @submit.prevent="saveReport" class="elite-modal-body">
          <div class="elite-form-row">
            <div class="elite-form-group">
              <label>Phân Loại</label>
              <select v-model="formData.phan_loai" class="elite-select">
                <option value="CÔNG VIỆC">CÔNG VIỆC</option>
                <option value="ĐỜI SỐNG">ĐỜI SỐNG</option>
              </select>
            </div>
            <div class="elite-form-group">
              <label>Độ quan trọng</label>
              <select v-model="formData.tag" class="elite-select">
                <option value="BÌNH THƯỜNG">BÌNH THƯỜNG</option>
                <option value="ƯU TIÊN">ƯU TIÊN</option>
              </select>
            </div>
            <div class="elite-form-group" v-if="isEditing">
              <label>Trạng Thái</label>
              <div class="elite-status-toggle">
                <button 
                  type="button" 
                  :class="['toggle-btn', formData.trang_thai === 'Hoàn thành' ? 'active-success' : '']"
                  @click="formData.trang_thai = 'Hoàn thành'"
                >
                  Hoàn thành
                </button>
                <button 
                  type="button" 
                  :class="['toggle-btn', formData.trang_thai === 'Chưa xử lý' ? 'active-warning' : '']"
                  @click="formData.trang_thai = 'Chưa xử lý'"
                >
                  Chưa xử lý
                </button>
              </div>
            </div>
          </div>

          <div class="elite-form-group">
            <label>Thời Gian</label>
            <div class="elite-quick-times">
              <button type="button" class="elite-quick-btn" :class="{ active: isMorning }" @click="setMorningTime">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                SÁNG
              </button>
              <button type="button" class="elite-quick-btn" :class="{ active: isAfternoon }" @click="setAfternoonTime">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                CHIỀU
              </button>
            </div>
            
            <div class="elite-time-picker">
              <div class="time-part">
                <div class="picker-item">
                  <span>Giờ</span>
                  <select v-model="timeInputs.hour" class="elite-select-mini">
                    <option v-for="h in 24" :key="h" :value="String(h-1).padStart(2, '0')">{{ String(h-1).padStart(2, '0') }}</option>
                  </select>
                </div>
                <span class="time-sep">:</span>
                <div class="picker-item">
                  <span>Phút</span>
                  <select v-model="timeInputs.minute" class="elite-select-mini">
                    <option v-for="m in 60" :key="m" :value="String(m-1).padStart(2, '0')">{{ String(m-1).padStart(2, '0') }}</option>
                  </select>
                </div>
              </div>
              
              <div class="date-part">
                <div class="picker-item">
                  <span>Thứ</span>
                  <select v-model="timeInputs.thu" class="elite-select-mini">
                    <option value="2">Thứ 2</option>
                    <option value="3">Thứ 3</option>
                    <option value="4">Thứ 4</option>
                    <option value="5">Thứ 5</option>
                    <option value="6">Thứ 6</option>
                    <option value="7">Thứ 7</option>
                    <option value="8">CN</option>
                  </select>
                </div>
                <div class="picker-item">
                  <span>Ngày</span>
                  <select v-model="timeInputs.day" class="elite-select-mini">
                    <option v-for="d in daysInMonth" :key="d" :value="String(d).padStart(2, '0')">{{ String(d).padStart(2, '0') }}</option>
                  </select>
                </div>
                <span class="date-sep">/</span>
                <div class="picker-item">
                  <span>Tháng</span>
                  <select v-model="timeInputs.month" class="elite-select-mini">
                    <option v-for="m in 12" :key="m" :value="String(m).padStart(2, '0')">{{ String(m).padStart(2, '0') }}</option>
                  </select>
                </div>
                <span class="date-sep">/</span>
                <div class="picker-item">
                  <span>Năm</span>
                  <select v-model="timeInputs.year" class="elite-select-mini">
                    <option v-for="y in 20" :key="y" :value="String(2023 + y)">{{ 2023 + y }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div class="elite-form-row" style="flex-direction: column;">
            <div class="elite-form-group">
              <div class="form-group-header">
                <label>Nội Dung <span class="required">*</span></label>
                <div class="header-actions-group">
                  <button type="button" class="elite-voice-btn" @click="startVoiceRecognition('noi_dung')" :class="{ 'is-recording': isRecordingVoice === 'noi_dung' }" title="Nhập liệu bằng giọng nói">
                    <svg v-if="isRecordingVoice !== 'noi_dung'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>
                  </button>
                  <button type="button" class="elite-quote-btn" @click="openCustomerModal">
                    BÁO GIÁ
                  </button>
                </div>
              </div>
              <textarea v-model="formData.noi_dung" required placeholder="Mô tả chi tiết nội dung báo cáo..." rows="3" class="elite-input"></textarea>
            </div>

            <div class="elite-form-group">
              <div class="form-group-header">
                <label style="color: #ef4444 !important; font-weight: 700 !important;">Ghi Chú</label>
                <button type="button" class="elite-voice-btn" @click="startVoiceRecognition('ghi_chu')" :class="{ 'is-recording': isRecordingVoice === 'ghi_chu' }" title="Nhập liệu bằng giọng nói">
                  <svg v-if="isRecordingVoice !== 'ghi_chu'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>
                </button>
              </div>
              <textarea v-model="formData.ghi_chu" placeholder="Các ghi chú bổ sung nếu có..." rows="1" class="elite-input" style="color: #ef4444 !important; font-weight: 700 !important;"></textarea>
            </div>
          </div>

          <!-- Upload Files -->
          <div class="elite-form-group">
            <label style="display: flex; justify-content: space-between;">
              <span>Đính Kèm (Ảnh / Excel)</span>
            </label>
            <div style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
              <!-- Image Upload Row -->
              <div class="file-upload-wrapper" style="width: 100%;">
                <button type="button" style="width: 100%; padding: 0.5rem; font-size: 0.85rem; background: #0f172a; color: #f8fafc; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 600; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" @click="$refs.imgUploadInput.click()" :disabled="isUploadingFiles" onmouseover="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 8px rgba(59,130,246,0.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.2)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'">
                  <svg v-if="isUploadingFiles !== 'img'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px; animation: spin 0.8s linear infinite; transform-origin: center;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" style="opacity: 0.25;"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style="opacity: 0.75;"></path></svg>
                  {{ isUploadingFiles === 'img' ? 'Đang tải...' : 'Tải Ảnh' }}
                </button>
                <input type="file" accept="image/*" multiple ref="imgUploadInput" style="display: none;" @change="handleImgUpload" />
                <div v-if="formData.img_save" class="upload-preview-gallery" style="margin-top: 0.8rem; display: flex; flex-wrap: wrap; gap: 0.8rem;">
                  <div v-for="(link, i) in formData.img_save.split('\n').filter(Boolean)" :key="i" style="display: flex; flex-direction: column; align-items: center; gap: 0.4rem; width: 80px;">
                    <a href="#" @click.prevent.stop="selectedImage = link" style="display: block; width: 80px; height: 80px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.4); transition: transform 0.2s, border-color 0.2s;" onmouseover="this.style.transform='scale(1.05)'; this.style.borderColor='#3b82f6'" onmouseout="this.style.transform='scale(1)'; this.style.borderColor='rgba(255,255,255,0.1)'" :title="`Xem Ảnh ${i + 1}`">
                      <img :src="link" style="width: 100%; height: 100%; object-fit: cover;" />
                    </a>
                    <button type="button" @click="removeLink('img_save', i)" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; cursor: pointer; padding: 4px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; transition: background 0.2s; width: 100%; display: flex; align-items: center; justify-content: center; gap: 4px;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'">
                      ✕ Xóa
                    </button>
                  </div>
                </div>
              </div>

              <!-- Excel Files Row -->
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <div class="file-upload-wrapper" style="flex: 1; min-width: 140px;">
                  <button type="button" style="width: 100%; padding: 0.5rem; font-size: 0.85rem; background: #0f172a; color: #34d399; border: 1px solid rgba(16,185,129,0.3); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 600; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" @click="$refs.bgUploadInput.click()" :disabled="isUploadingFiles" onmouseover="this.style.borderColor='#10b981'; this.style.boxShadow='0 0 8px rgba(16,185,129,0.3)'" onmouseout="this.style.borderColor='rgba(16,185,129,0.3)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'">
                    <svg v-if="isUploadingFiles !== 'bg'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px; animation: spin 0.8s linear infinite; transform-origin: center;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" style="opacity: 0.25;"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style="opacity: 0.75;"></path></svg>
                    {{ isUploadingFiles === 'bg' ? 'Đang tải...' : 'File Báo Giá' }}
                  </button>
                  <input type="file" accept=".xlsx,.xls" multiple ref="bgUploadInput" style="display: none;" @change="e => handleExcelUpload(e, 'link_excel_bao_gia')" />
                  <div v-if="formData.link_excel_bao_gia" class="upload-preview-list" style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.3rem;">
                    <div v-for="(link, i) in formData.link_excel_bao_gia.split('\n').filter(Boolean)" :key="i" style="display: flex; justify-content: space-between; align-items: center; background: rgba(16,185,129,0.05); padding: 0.3rem 0.5rem; border-radius: 4px; border: 1px solid rgba(16,185,129,0.1);">
                      <a href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(formData, 'link_excel_bao_gia', i, 'Báo giá'))" style="color: #34d399; font-size: 0.75rem; font-weight: 600; text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%;" :title="getExcelFileName(formData, 'link_excel_bao_gia', i, 'Báo giá')">{{ getExcelFileName(formData, 'link_excel_bao_gia', i, 'Báo giá') }}</a>
                      <button type="button" @click="removeLink('link_excel_bao_gia', i)" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px;">✕</button>
                    </div>
                  </div>
                </div>

                <div class="file-upload-wrapper" style="flex: 1; min-width: 140px;">
                <button type="button" style="width: 100%; padding: 0.5rem; font-size: 0.85rem; background: #0f172a; color: #a78bfa; border: 1px solid rgba(139,92,246,0.3); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 600; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" @click="$refs.mhUploadInput.click()" :disabled="isUploadingFiles" onmouseover="this.style.borderColor='#8b5cf6'; this.style.boxShadow='0 0 8px rgba(139,92,246,0.3)'" onmouseout="this.style.borderColor='rgba(139,92,246,0.3)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'">
                  <svg v-if="isUploadingFiles !== 'mh'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px; animation: spin 0.8s linear infinite; transform-origin: center;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" style="opacity: 0.25;"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style="opacity: 0.75;"></path></svg>
                  {{ isUploadingFiles === 'mh' ? 'Đang tải...' : 'File Mua Hàng' }}
                </button>
                <input type="file" accept=".xlsx,.xls" multiple ref="mhUploadInput" style="display: none;" @change="e => handleExcelUpload(e, 'link_excel_mua_hang')" />
                <div v-if="formData.link_excel_mua_hang" class="upload-preview-list" style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.3rem;">
                  <div v-for="(link, i) in formData.link_excel_mua_hang.split('\n').filter(Boolean)" :key="i" style="display: flex; justify-content: space-between; align-items: center; background: rgba(139,92,246,0.05); padding: 0.3rem 0.5rem; border-radius: 4px; border: 1px solid rgba(139,92,246,0.1);">
                    <a href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(formData, 'link_excel_mua_hang', i, 'Mua hàng'))" style="color: #a78bfa; font-size: 0.75rem; font-weight: 600; text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%;" :title="getExcelFileName(formData, 'link_excel_mua_hang', i, 'Mua hàng')">{{ getExcelFileName(formData, 'link_excel_mua_hang', i, 'Mua hàng') }}</a>
                    <button type="button" @click="removeLink('link_excel_mua_hang', i)" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px;">✕</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          <div class="elite-modal-actions form-actions-grid">
            <button type="button" class="elite-btn-cancel" @click="closeModal" :disabled="saving">Huỷ Bỏ</button>
            <button v-if="!isEditing" type="button" class="btn-add-empty" @click="saveReport({ openEmpty: true })" :disabled="saving">
              THÊM & LÀM TIẾP MỤC TRỐNG
            </button>
            <button v-if="!isEditing" type="button" class="btn-add-continue" @click="saveReport({ continue: true })" :disabled="saving">
              <span v-if="saving" class="spinner-small"></span>
              THÊM & LÀM TIẾP
            </button>
            <button v-if="!isEditing || hasChanges" type="submit" class="elite-btn-primary btn-add-primary" :disabled="saving">
              <span v-if="saving" class="spinner-small"></span>
              <template v-if="saving">
                {{ isEditing ? 'Đang Lưu...' : 'Đang Thêm...' }}
              </template>
              <template v-else>
                {{ isEditing ? 'Lưu Báo Cáo' : 'THÊM & XONG' }}
              </template>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Chọn Tháng/Năm Tải Excel -->
    <div class="elite-modal-overlay" v-if="isExportModalOpen" @click.self="isExportModalOpen = false">
      <div class="elite-modal" style="max-width: 420px;">
        <div class="elite-modal-header">
          <div class="elite-modal-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <h2>Tải Báo Cáo Excel</h2>
          </div>
          <button class="elite-btn-close" @click="isExportModalOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="elite-modal-body">
          <div class="elite-form-row" style="gap: 1rem;">
            <div class="elite-form-group" style="flex: 1;">
              <label>Tháng</label>
              <select v-model="exportInputs.month" class="elite-select">
                <option v-for="m in 12" :key="m" :value="String(m).padStart(2, '0')">Tháng {{ m }}</option>
              </select>
            </div>
            <div class="elite-form-group" style="flex: 1;">
              <label>Năm</label>
              <select v-model="exportInputs.year" class="elite-select">
                <option v-for="y in 20" :key="y" :value="String(2023 + y)">{{ 2023 + y }}</option>
              </select>
            </div>
          </div>
          <div class="elite-modal-actions">
            <button type="button" class="elite-btn-cancel" @click="isExportModalOpen = false">Huỷ Bỏ</button>
            <button type="button" class="elite-btn-primary" @click="doExportExcel">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Tải Xuống
            </button>
          </div>
        </div>
      </div>
    </div>



    <!-- Modal Chọn Khách Hàng -->
    <div class="elite-modal-overlay" v-if="showCustomerModal" @click.self="showCustomerModal = false">
      <div class="elite-modal" style="max-width: 550px; display: flex; flex-direction: column; max-height: 85vh;">
        <div class="elite-modal-header" style="flex-shrink: 0;">
          <div class="elite-modal-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <h2>Chọn Khách Hàng</h2>
          </div>
          <button class="elite-btn-close" @click="showCustomerModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="elite-modal-body" style="flex: 1; overflow-y: hidden; display: flex; flex-direction: column; gap: 1.2rem;">
          <div class="elite-form-group" style="margin-bottom: 0; flex-shrink: 0;">
            <input type="text" v-model="customerSearch" placeholder="Tìm tên khách hàng hoặc công ty..." class="elite-input" style="width: 100%; box-sizing: border-box; padding: 0.8rem 1.2rem; border-radius: 9999px;" />
          </div>
          
          <div style="max-height: 240px; overflow-y: auto; border: 1.5px solid #e2e8f0; border-radius: 16px; background: rgba(248, 250, 252, 0.6); margin-bottom: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div v-if="loadingCustomers" style="padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;">
              <span style="color: #10b981; font-weight: 600; font-size: 0.95rem; letter-spacing: 0.02em;">Đang tải dữ liệu khách hàng...</span>
              <div style="width: 100%; max-width: 200px; height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden; position: relative;">
                <div style="position: absolute; top: 0; left: 0; height: 100%; background: #10b981; border-radius: 999px; animation: progress-indeterminate 1.5s infinite ease-in-out;"></div>
              </div>
            </div>
            <ul v-else class="customer-list-modal" style="list-style: none; padding: 0; margin: 0;">
              <li v-for="c in filteredCustomersList" :key="c.ma_khach_hang" @click="insertCustomerQuote(c)" class="customer-list-item">
                <span class="c-name">{{ c.ten_khach_hang }}</span>
                <span v-if="c.ten_cong_ty" class="c-company">{{ c.ten_cong_ty }}</span>
                <span v-if="c.so_dien_thoai_ca_nhan" class="c-phone">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  {{ c.so_dien_thoai_ca_nhan }}
                </span>
              </li>
              <li v-if="filteredCustomersList.length === 0 && !loadingCustomers" style="padding: 3rem; text-align: center; color: #94a3b8; font-style: italic; font-weight: 500;">
                Không tìm thấy khách hàng nào.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Lịch Trống (Empty Schedule) -->
    <div class="elite-modal-overlay" v-if="isEmptyDaysModalOpen" @click.self="isEmptyDaysModalOpen = false" style="z-index: 999999; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);">
      <div class="elite-modal dark-mode-modal" style="max-width: 900px; width: 95%; max-height: 95vh; display: flex; flex-direction: column; background: #0f172a !important; border: 1px solid rgba(255,255,255,0.1) !important; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
        <div class="elite-modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.05) !important; background: transparent !important;">
          <div class="elite-modal-title" style="display: flex; align-items: flex-start; gap: 0.6rem;">
            <div style="margin-top: 0.15rem; color: #3b82f6;">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.4rem; flex: 1;">
              <h2 style="margin: 0; line-height: 1.3; color: #f8fafc !important;">DANH SÁCH NGÀY TRỐNG</h2>
              <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; gap: 1rem;">
                <span v-if="emptyDays.length > 0" style="background: rgba(16,185,129,0.1); color: #34d399; padding: 0.2rem 0.6rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; border: 1px solid rgba(16,185,129,0.2); white-space: nowrap;">Có {{ emptyDays.length }} buổi</span>
                <div style="display: flex; background: rgba(255,255,255,0.05); padding: 3px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
                  <button @click="emptyDaysViewMode = 'list'" :style="emptyDaysViewMode === 'list' ? 'background: #3b82f6; color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);' : 'background: transparent; color: #94a3b8;'" style="padding: 4px 10px; border: none; font-size: 0.75rem; font-weight: 700; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Danh Sách</button>
                  <button @click="emptyDaysViewMode = 'calendar'" :style="emptyDaysViewMode === 'calendar' ? 'background: #3b82f6; color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);' : 'background: transparent; color: #94a3b8;'" style="padding: 4px 10px; border: none; font-size: 0.75rem; font-weight: 700; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Lịch</button>
                </div>
              </div>
            </div>
          </div>
          <button class="elite-btn-close" @click="isEmptyDaysModalOpen = false" style="color: #94a3b8;">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="elite-modal-body" style="padding: 1.5rem;">
          <div class="empty-days-filter" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; background: linear-gradient(to right, #1e293b, #0f172a); padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="display: flex; flex-direction: column; flex: 1;">
              <label style="font-size: 0.75rem; font-weight: 700; color: #f8fafc !important; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em;">Từ ngày</label>
              <input type="date" v-model="emptyFilterDateFrom" @change="recalcEmptyDays" style="padding: 0.6rem 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); font-family: inherit; font-size: 0.95rem; color: #f8fafc; background: #0f172a; outline: none; transition: border-color 0.2s; color-scheme: dark;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'" />
            </div>
            <div style="display: flex; flex-direction: column; flex: 1;">
              <label style="font-size: 0.75rem; font-weight: 700; color: #f8fafc !important; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em;">Đến ngày</label>
              <input type="date" v-model="emptyFilterDateTo" @change="recalcEmptyDays" style="padding: 0.6rem 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); font-family: inherit; font-size: 0.95rem; color: #f8fafc; background: #0f172a; outline: none; transition: border-color 0.2s; color-scheme: dark;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'" />
            </div>
          </div>
          <div v-if="emptyDaysViewMode === 'list'">
            <div v-if="emptyDays.length === 0" class="empty-state" style="padding: 2rem; text-align: center; color: #94a3b8;">
              <p>Không có buổi nào trống trong khoảng thời gian này.</p>
            </div>
            <div v-else class="empty-days-list" style="max-height: 400px; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.8rem; padding: 0.2rem;">
              <div v-for="(slot, idx) in emptyDays" :key="idx" class="empty-day-item" @click="openAddModalWithSlot(slot)" style="padding: 0.8rem; background: #1e293b; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; gap: 0.2rem; transition: all 0.2s; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onmouseover="this.style.borderColor='#3b82f6'; this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'; this.style.transform='none'">
                <span style="font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">{{ getThuText(slot.date) }}</span>
                <span style="font-size: 0.95rem; font-weight: 700; color: #f8fafc;">{{ formatDateDMY(slot.date) }}</span>
                <span :style="slot.period === 'Sáng' ? 'background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2);' : 'background: rgba(168,85,247,0.1); color: #c084fc; border: 1px solid rgba(168,85,247,0.2);'" style="margin-top: 0.4rem; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">
                  {{ slot.period === 'Sáng' ? 'Trống Sáng' : 'Trống Chiều' }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="empty-calendar-view" style="max-height: 450px; overflow-y: auto; padding: 0.5rem;">
            <div v-for="month in emptyDaysCalendar" :key="month.year + '-' + month.month" style="margin-bottom: 1.5rem;">
              <h3 style="font-size: 1rem; color: #f8fafc; font-weight: 700; margin-bottom: 0.8rem; border-bottom: 2px solid rgba(255,255,255,0.05); padding-bottom: 0.6rem; display: flex; align-items: center; gap: 0.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Tháng {{ month.month }} / {{ month.year }}
              </h3>
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center; margin-bottom: 0.6rem;">
                <div v-for="day in ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']" :key="day" style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; padding: 0.4rem 0; background: rgba(255,255,255,0.05); border-radius: 6px;">{{ day }}</div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
                <div v-for="(day, idx) in month.days" :key="idx" 
                     style="min-height: 75px; border-radius: 8px; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; padding: 6px 4px; position: relative; transition: all 0.2s;"
                     :style="day ? (day.inRange ? 'background: #1e293b; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 1px 2px rgba(0,0,0,0.1);' : 'background: transparent; border: 1px dashed rgba(255,255,255,0.1); opacity: 0.4;') : 'background: transparent;'">
                  <span v-if="day" style="font-size: 0.8rem; font-weight: 700; margin-bottom: 0.2rem;" :style="day.isSunday ? 'color: #f87171;' : 'color: #cbd5e1;'">{{ day.dayNum }}</span>
                  <div v-if="day && !day.inRange" style="font-size: 0.55rem; color: #475569; font-weight: 700; text-align: center; margin-top: auto; text-transform: uppercase; line-height: 1.2;">Ngoài<br>khoảng</div>
                  <div v-if="day && day.inRange" style="display: flex; flex-direction: column; gap: 3px; margin-top: auto; width: 100%;">
                    <div v-if="!day.isSunday && day.emptyMorning" @click="openAddModalWithSlot({ date: day.date, period: 'Sáng' })" style="background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); font-size: 0.65rem; font-weight: 700; border-radius: 6px; width: 100%; cursor: pointer; text-align: center; padding: 3px 0; transition: all 0.2s;" onmouseover="this.style.background='rgba(59,130,246,0.2)'; this.style.transform='scale(1.02)'" onmouseout="this.style.background='rgba(59,130,246,0.1)'; this.style.transform='none'">Sáng</div>
                    <div v-if="!day.isSunday && !day.isSaturday && day.emptyAfternoon" @click="openAddModalWithSlot({ date: day.date, period: 'Chiều' })" style="background: rgba(168,85,247,0.1); color: #c084fc; border: 1px solid rgba(168,85,247,0.2); font-size: 0.65rem; font-weight: 700; border-radius: 6px; width: 100%; cursor: pointer; text-align: center; padding: 3px 0; transition: all 0.2s;" onmouseover="this.style.background='rgba(168,85,247,0.2)'; this.style.transform='scale(1.02)'" onmouseout="this.style.background='rgba(168,85,247,0.1)'; this.style.transform='none'">Chiều</div>
                    <div v-if="!day.isSunday && !day.emptyMorning && (day.isSaturday || !day.emptyAfternoon)" style="font-size: 0.65rem; color: #10b981; font-weight: 800; text-align: center; padding: 3px 0; background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.1); border-radius: 6px; width: 100%;">ĐỦ</div>
                    <div v-if="day.isSunday" style="font-size: 0.65rem; color: #ef4444; font-weight: 800; text-align: center; padding: 3px 0; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 6px; width: 100%;">NGHỈ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="elite-modal-actions" style="margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
            <button type="button" class="elite-btn-primary" @click="isEmptyDaysModalOpen = false" style="width: 100%; justify-content: center; background: #3b82f6; border-color: #3b82f6; border-radius: 10px; font-weight: 700; font-size: 0.95rem; padding: 0.8rem;">Đóng</button>
          </div>
        </div>
      </div>
    </div>
    
    
    <!-- Modal Chuyển Việc (Move Tasks) -->
    <div class="elite-modal-overlay" v-if="isMoveModalOpen" @click.self="isMoveModalOpen = false" style="z-index: 999999; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);">
      <div class="elite-modal dark-mode-modal move-modal-pc" style="width: 96vw; height: 96vh; max-width: 1800px; display: flex; flex-direction: column; background: #0f172a !important; border: 1px solid rgba(255,255,255,0.08) !important; box-shadow: 0 25px 60px -12px rgba(0,0,0,0.7); border-radius: 12px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 42px; height: 42px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l4-4 4 4"/><path d="M9 5v14"/><path d="M19 15l-4 4-4-4"/><path d="M15 19V5"/></svg>
            </div>
            <div>
              <h2 style="color: #f8fafc; margin: 0; font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em;">CHUYỂN VIỆC (KÉO THẢ)</h2>
              <p style="color: #94a3b8; margin: 0.1rem 0 0 0; font-size: 0.8rem;">Kéo thẻ công việc từ ô này sang ô khác để đổi lịch làm việc. (Sáng = Xanh dương, Chiều = Xanh lá)</p>
            </div>
          </div>
          <button @click="isMoveModalOpen = false" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #94a3b8; font-size: 1.1rem; transition: all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.2)'; this.style.color='#f87171'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#94a3b8'">✕</button>
        </div>
        
        <!-- Calendar Body -->
        <div style="flex: 1; overflow-y: auto; padding: 1.5rem; background: #0b1118;">
          <div v-for="month in moveDaysCalendar" :key="month.year + '-' + month.month" style="margin-bottom: 2rem;">
            
            <!-- Month Header -->
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
              <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 0.3rem 0.8rem; border-radius: 6px;">
                <span style="color: white; font-weight: 800; font-size: 0.95rem;">Tháng {{ month.month }}</span>
              </div>
              <span style="color: #64748b; font-size: 0.9rem; font-weight: 600;">/ {{ month.year }}</span>
              <div style="flex: 1; height: 1px; background: rgba(255,255,255,0.05);"></div>
            </div>
            
            <!-- Weekday Header Row -->
            <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.5rem; margin-bottom: 0.5rem;">
              <div v-for="dayName in ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']" :key="dayName" 
                   :style="dayName === 'CN' ? 'color: #f87171; background: rgba(239,68,68,0.05);' : 'color: #94a3b8; background: rgba(255,255,255,0.03);'"
                   style="text-align: center; font-weight: 700; font-size: 0.8rem; padding: 0.4rem 0; border-radius: 6px; letter-spacing: 0.02em;">
                {{ dayName }}
              </div>
            </div>
            
            <!-- Calendar Grid -->
            <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.5rem; grid-auto-rows: minmax(220px, auto);">
              <div v-for="(day, idx) in month.days" :key="idx"
                   :style="!day ? 'visibility: hidden;' : day.isSunday ? 'background: rgba(239,68,68,0.02); border-color: rgba(239,68,68,0.1);' : ''"
                   style="background: #1e293b; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; transition: border-color 0.2s; height: 100%;">
                
                <template v-if="day">
                  <!-- Day Number Bar -->
                  <div style="padding: 0.3rem 0.6rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.03); background: rgba(0,0,0,0.2);">
                    <span style="font-weight: 800; font-size: 0.95rem;" :style="day.isSunday ? 'color: #f87171;' : 'color: #e2e8f0;'">{{ day.dayNum }}</span>
                    <span v-if="!day.isSunday && (day.morningTasks.length + day.afternoonTasks.length) > 0" style="font-size: 0.75rem; color: #94a3b8; background: rgba(255,255,255,0.08); padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 700;">{{ day.morningTasks.length + day.afternoonTasks.length }} việc</span>
                  </div>
                  
                  <!-- Drop Zones Container -->
                  <div v-if="!day.isSunday" style="flex: 1; display: flex; flex-direction: column; padding: 0.4rem; gap: 0.5rem; overflow-y: auto;" class="custom-scrollbar">
                    
                    <!-- Sáng Zone -->
                    <div style="display: flex; flex-direction: column; flex-shrink: 0; border-radius: 6px; padding: 0.4rem; background: rgba(59,130,246,0.05); border: 1px dashed rgba(59,130,246,0.3); transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); min-height: 80px;"
                         @dragover.prevent="$event.currentTarget.classList.add('drag-over-sang')"
                         @dragleave.prevent="$event.currentTarget.classList.remove('drag-over-sang')"
                         @drop.prevent="$event.currentTarget.classList.remove('drag-over-sang'); onMoveTaskDrop($event, day.dateStr, 'Sáng')">
                      
                      <div style="font-size: 0.75rem; color: #60a5fa; font-weight: 800; margin-bottom: 0.4rem; text-transform: uppercase; display: flex; justify-content: space-between;">
                        <span>SÁNG</span>
                      </div>
                      
                      <div v-for="task in day.morningTasks" :key="task.id" draggable="true" 
                           @dragstart="onMoveTaskDragStart($event, task)" @dragend="draggedMoveTask = null"
                           :class="{ 'dragging-task': draggedMoveTask && draggedMoveTask.id === task.id, 'drop-success-pulse': successDropTaskId === task.id }"
                           style="background: linear-gradient(135deg, #1e3a8a, #1d4ed8); border-left: 4px solid #60a5fa; color: white; padding: 0.6rem 0.75rem; border-radius: 6px; font-size: 0.9rem; margin-bottom: 0.65rem; cursor: grab; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.15s;"
                           onmouseover="if(!this.classList.contains('dragging-task')){this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(37,99,235,0.3)'}" 
                           onmouseout="if(!this.classList.contains('dragging-task')){this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.2)'}">
                        <div style="font-weight: 700; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">{{ task.noi_dung }}</div>
                        <div v-if="task.ghi_chu" style="font-size: 0.8rem; color: #bfdbfe; line-height: 1.35; margin-top: 4px; padding-top: 4px; border-top: 1px dotted rgba(191,219,254,0.3); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                          {{ task.ghi_chu }}
                        </div>
                        <div v-if="task.img_save || task.link_excel_bao_gia || task.link_excel_mua_hang" style="display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 6px; padding-top: 6px; border-top: 1px dotted rgba(255,255,255,0.2);">
                          <template v-if="task.img_save">
                            <a v-for="(link, i) in task.img_save.split('\n').filter(Boolean)" :key="'m-img'+i" href="#" @click.prevent.stop="selectedImage = link" style="width: 24px; height: 24px; border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block;" :title="`Ảnh ${i + 1}`">
                              <img :src="link" style="width: 100%; height: 100%; object-fit: cover;" />
                            </a>
                          </template>
                          <template v-if="task.link_excel_bao_gia">
                            <a v-for="(link, i) in task.link_excel_bao_gia.split('\n').filter(Boolean)" :key="'m-bg'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(task, 'link_excel_bao_gia', i, 'Báo giá'))"  style="background: rgba(16,185,129,0.2); color: #a7f3d0; padding: 2px 4px; border-radius: 4px; font-size: 0.65rem; text-decoration: none; display: flex; align-items: center; gap: 2px; border: 1px solid rgba(16,185,129,0.3);" :title="getExcelFileName(task, 'link_excel_bao_gia', i, 'Báo giá')">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                              {{ getExcelFileName(task, 'link_excel_bao_gia', i, 'Báo giá') }}
                            </a>
                          </template>
                          <template v-if="task.link_excel_mua_hang">
                            <a v-for="(link, i) in task.link_excel_mua_hang.split('\n').filter(Boolean)" :key="'m-mh'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(task, 'link_excel_mua_hang', i, 'Mua hàng'))"  style="background: rgba(139,92,246,0.2); color: #ddd6fe; padding: 2px 4px; border-radius: 4px; font-size: 0.65rem; text-decoration: none; display: flex; align-items: center; gap: 2px; border: 1px solid rgba(139,92,246,0.3);" :title="getExcelFileName(task, 'link_excel_mua_hang', i, 'Mua hàng')">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                              {{ getExcelFileName(task, 'link_excel_mua_hang', i, 'Mua hàng') }}
                            </a>
                          </template>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Chiều Zone -->
                    <div style="display: flex; flex-direction: column; flex-shrink: 0; border-radius: 6px; padding: 0.4rem; background: rgba(16,185,129,0.05); border: 1px dashed rgba(16,185,129,0.3); transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); min-height: 80px;"
                         @dragover.prevent="$event.currentTarget.classList.add('drag-over-chieu')"
                         @dragleave.prevent="$event.currentTarget.classList.remove('drag-over-chieu')"
                         @drop.prevent="$event.currentTarget.classList.remove('drag-over-chieu'); onMoveTaskDrop($event, day.dateStr, 'Chiều')">
                      
                      <div style="font-size: 0.75rem; color: #34d399; font-weight: 800; margin-bottom: 0.4rem; text-transform: uppercase; display: flex; justify-content: space-between;">
                        <span>CHIỀU</span>
                      </div>
                      
                      <div v-for="task in day.afternoonTasks" :key="task.id" draggable="true" 
                           @dragstart="onMoveTaskDragStart($event, task)" @dragend="draggedMoveTask = null"
                           :class="{ 'dragging-task': draggedMoveTask && draggedMoveTask.id === task.id, 'drop-success-pulse': successDropTaskId === task.id }"
                           style="background: linear-gradient(135deg, #064e3b, #047857); border-left: 4px solid #34d399; color: white; padding: 0.6rem 0.75rem; border-radius: 6px; font-size: 0.9rem; margin-bottom: 0.65rem; cursor: grab; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.15s;"
                           onmouseover="if(!this.classList.contains('dragging-task')){this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(16,185,129,0.3)'}" 
                           onmouseout="if(!this.classList.contains('dragging-task')){this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.2)'}">
                        <div style="font-weight: 700; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">{{ task.noi_dung }}</div>
                        <div v-if="task.ghi_chu" style="font-size: 0.8rem; color: #a7f3d0; line-height: 1.35; margin-top: 4px; padding-top: 4px; border-top: 1px dotted rgba(167,243,208,0.3); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                          {{ task.ghi_chu }}
                        </div>
                        <div v-if="task.img_save || task.link_excel_bao_gia || task.link_excel_mua_hang" style="display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 6px; padding-top: 6px; border-top: 1px dotted rgba(255,255,255,0.2);">
                          <template v-if="task.img_save">
                            <a v-for="(link, i) in task.img_save.split('\n').filter(Boolean)" :key="'a-img'+i" href="#" @click.prevent.stop="selectedImage = link" style="width: 24px; height: 24px; border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: block;" :title="`Ảnh ${i + 1}`">
                              <img :src="link" style="width: 100%; height: 100%; object-fit: cover;" />
                            </a>
                          </template>
                          <template v-if="task.link_excel_bao_gia">
                            <a v-for="(link, i) in task.link_excel_bao_gia.split('\n').filter(Boolean)" :key="'a-bg'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(task, 'link_excel_bao_gia', i, 'Báo giá'))"  style="background: rgba(16,185,129,0.2); color: #a7f3d0; padding: 2px 4px; border-radius: 4px; font-size: 0.65rem; text-decoration: none; display: flex; align-items: center; gap: 2px; border: 1px solid rgba(16,185,129,0.3);" :title="getExcelFileName(task, 'link_excel_bao_gia', i, 'Báo giá')">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                              {{ getExcelFileName(task, 'link_excel_bao_gia', i, 'Báo giá') }}
                            </a>
                          </template>
                          <template v-if="task.link_excel_mua_hang">
                            <a v-for="(link, i) in task.link_excel_mua_hang.split('\n').filter(Boolean)" :key="'a-mh'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(task, 'link_excel_mua_hang', i, 'Mua hàng'))"  style="background: rgba(139,92,246,0.2); color: #ddd6fe; padding: 2px 4px; border-radius: 4px; font-size: 0.65rem; text-decoration: none; display: flex; align-items: center; gap: 2px; border: 1px solid rgba(139,92,246,0.3);" :title="getExcelFileName(task, 'link_excel_mua_hang', i, 'Mua hàng')">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                              {{ getExcelFileName(task, 'link_excel_mua_hang', i, 'Mua hàng') }}
                            </a>
                          </template>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                  
                  <!-- Sunday empty state -->
                  <div v-else style="flex: 1; display: flex; align-items: center; justify-content: center; color: #475569; font-size: 0.75rem; font-style: italic; background: rgba(0,0,0,0.1);">Nghỉ</div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Chia Việc (Distribute Tasks) -->
    <div class="elite-modal-overlay" v-if="isDistributeModalOpen" @click.self="isDistributeModalOpen = false" style="z-index: 999999; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);">
      <div class="elite-modal dark-mode-modal" :style="{ maxWidth: distributeStep === 2 ? '1400px' : '900px', height: distributeStep === 2 ? '95vh' : 'auto' }" style="width: 95%; max-height: 95vh; display: flex; flex-direction: column; transition: all 0.3s ease; background: #0f172a !important; border: 1px solid rgba(255,255,255,0.1) !important; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
        <div class="elite-modal-header" style="flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.05) !important; background: transparent !important;">
          <div class="elite-modal-title" style="display: flex; align-items: flex-start; gap: 0.6rem;">
            <div style="margin-top: 0.15rem; color: #10b981;">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"></path><path d="M4 20L21 3"></path><path d="M21 16v5h-5"></path><path d="M15 15l6 6"></path><path d="M4 4l5 5"></path></svg>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.4rem; flex: 1;">
              <h2 style="margin: 0; line-height: 1.3; color: #f8fafc !important;">CHIA ĐỀU VIỆC</h2>
              <div style="font-size: 0.85rem; color: #94a3b8; font-weight: 500;">
                {{ distributeStep === 1 ? 'Bước 1: Chọn các việc từ những buổi đang bị quá tải.' : 'Bước 2: Chọn các buổi trống để phân bổ việc.' }}
              </div>
            </div>
          </div>
          <button class="elite-btn-close" @click="isDistributeModalOpen = false" style="color: #94a3b8;">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div class="elite-modal-body" style="flex: 1; overflow-y: hidden; display: flex; flex-direction: column; padding: 1.5rem;">
          
          <div class="empty-days-filter" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; background: linear-gradient(to right, #1e293b, #0f172a); padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); align-items: center; flex-shrink: 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="display: flex; flex-direction: column; flex: 1;">
              <label style="font-size: 0.75rem; font-weight: 700; color: #f8fafc !important; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em;">Từ ngày</label>
              <input type="date" v-model="distributeFilterDateFrom" @change="recalcDistributeTasks" style="padding: 0.6rem 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); font-family: inherit; font-size: 0.95rem; color: #f8fafc; background: #0f172a; outline: none; transition: border-color 0.2s; color-scheme: dark;" onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'" />
            </div>
            <div style="display: flex; flex-direction: column; flex: 1;">
              <label style="font-size: 0.75rem; font-weight: 700; color: #f8fafc !important; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em;">Đến ngày</label>
              <input type="date" v-model="distributeFilterDateTo" @change="recalcDistributeTasks" style="padding: 0.6rem 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); font-family: inherit; font-size: 0.95rem; color: #f8fafc; background: #0f172a; outline: none; transition: border-color 0.2s; color-scheme: dark;" onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'" />
            </div>
          </div>
          <!-- BƯỚC 1 -->
          <div v-if="distributeStep === 1" style="flex: 1; overflow-y: auto; padding-right: 0.5rem;" class="distribute-step-1">
            <div v-if="overloadedPeriods.length === 0" class="empty-state" style="padding: 3rem; text-align: center;">
              <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(16,185,129,0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto; border: 1px solid rgba(16,185,129,0.2);">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h3 style="color: #f8fafc; margin-bottom: 0.5rem; font-size: 1.2rem; font-weight: 700;">Tất cả đều ổn!</h3>
              <p style="color: #94a3b8; font-size: 0.95rem;">Không có buổi nào bị quá tải (dư việc) trong khoảng thời gian này.</p>
            </div>
            
            <div v-else>
              <div style="margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.8rem;">
                <p style="color: #94a3b8; font-size: 0.9rem; margin: 0;">Vui lòng tick chọn các việc bạn muốn san sẻ sang buổi khác:</p>
                <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                  <!-- Số buổi có từ 2 việc -->
                  <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; padding: 0.6rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    Số buổi có từ 2 việc: <span style="font-weight: 800; color: #f87171; font-size: 1rem;">{{ overloadedPeriods.length }}</span>
                  </div>
                  
                  <!-- Số buổi trống -->
                  <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: #93c5fd; padding: 0.6rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                    Số buổi trống: <span style="font-weight: 800; color: #60a5fa; font-size: 1rem;">{{ emptyPeriodsForDistribute.length }}</span>
                  </div>

                  <!-- Đã chọn -->
                  <div :style="isTaskSelectionFull ? 'color: #fca5a5; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);' : 'color: #34d399; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);'" style="padding: 0.6rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; transition: all 0.3s;">
                    <svg v-if="!isTaskSelectionFull" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    Đã chọn: <span style="font-weight: 800; font-size: 1rem;" :style="isTaskSelectionFull ? 'color: #f87171;' : 'color: #10b981;'">{{ selectedTasksToDistribute.length }} / {{ maxTasksToDistribute }}</span> việc
                  </div>
                </div>
              </div>
              
              <div v-for="(period, idx) in overloadedPeriods" :key="idx" style="margin-bottom: 1.5rem; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(to right, #1e293b, #0f172a); padding: 0.85rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span style="font-weight: 700; color: #f8fafc; font-size: 0.95rem;">{{ getThuText(period.date) }}, {{ formatDateDMY(period.date) }} <span style="color: #475569; margin: 0 0.2rem;">|</span> <span :style="period.period === 'Sáng' ? 'color: #fb923c;' : 'color: #a78bfa;'">{{ period.period }}</span></span>
                  </div>
                  <span style="font-size: 0.75rem; font-weight: 700; background: rgba(239,68,68,0.15); color: #f87171; padding: 0.25rem 0.7rem; border-radius: 999px; box-shadow: inset 0 0 0 1px rgba(239,68,68,0.2);">{{ period.tasks.length }} việc</span>
                </div>
                
                <div style="padding: 0.75rem;">
                  <div v-for="task in period.tasks" :key="task.id" 
                       @click="!isTaskDisabled(task, period) && toggleTaskDistribute(task, period)"
                       class="distribute-task-item"
                       style="display: flex; align-items: flex-start; gap: 0.8rem; padding: 0.8rem 1rem; border-radius: 10px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); margin-bottom: 0.4rem;"
                       :style="selectedTasksToDistribute.some(t => t.id === task.id) ? 'background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15); cursor: pointer;' : (isTaskDisabled(task, period) ? 'background: rgba(15,23,42,0.5); border: 1px dashed rgba(255,255,255,0.1); opacity: 0.5; cursor: not-allowed;' : 'background: #0f172a; border: 1px solid rgba(255,255,255,0.05); cursor: pointer;')"
                       onmouseover="if(this.style.cursor === 'pointer' && !this.style.transform) this.style.backgroundColor='#1e293b'" onmouseout="if(!this.style.transform && this.style.cursor === 'pointer') this.style.backgroundColor='#0f172a'">
                    <div style="margin-top: 0.15rem;">
                      <div style="width: 20px; height: 20px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                           :style="selectedTasksToDistribute.some(t => t.id === task.id) ? 'background: #10b981; border: 1px solid #10b981; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);' : 'border: 2px solid #475569; background: transparent;'">
                        <svg v-if="selectedTasksToDistribute.some(t => t.id === task.id)" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    </div>
                    <div style="flex: 1;">
                      <div style="font-weight: 600; font-size: 0.95rem; line-height: 1.4; transition: color 0.2s;" :style="selectedTasksToDistribute.some(t => t.id === task.id) ? 'color: #34d399;' : 'color: #f8fafc;'">{{ task.noi_dung }}</div>
                      <div v-if="task.ghi_chu" style="font-size: 0.8rem; margin-top: 0.35rem; display: flex; align-items: center; gap: 0.4rem;" :style="selectedTasksToDistribute.some(t => t.id === task.id) ? 'color: #6ee7b7;' : 'color: #94a3b8;'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        {{ task.ghi_chu }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- BƯỚC 2 -->
          <div v-if="distributeStep === 2" style="flex: 1; display: flex; gap: 1.5rem; overflow: hidden;" class="distribute-step-2">
            <!-- Left panel: Selected tasks -->
            <div class="distribute-left-panel" style="width: 35%; display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; background: #0f172a; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(to right, #1e293b, #0f172a); padding: 0.85rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 0.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                <span style="font-weight: 700; color: #f8fafc; font-size: 0.95rem;">{{ selectedTasksToDistribute.length }} việc sẽ chia</span>
              </div>
              <div style="flex: 1; overflow-y: auto; padding: 0.85rem; background: #0f172a;">
                <div v-for="task in selectedTasksToDistribute" :key="task.id" 
                     draggable="true" 
                     @dragstart="onTaskDragStart(task, $event)"
                     @dragend="onTaskDragEnd($event)"
                     style="padding: 0.8rem; background: #1e293b; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.6rem; font-size: 0.85rem; font-weight: 600; color: #cbd5e1; line-height: 1.5; box-shadow: 0 1px 2px rgba(0,0,0,0.1); border-left: 3px solid #10b981; cursor: grab; transition: all 0.2s;"
                     :style="assignedTaskIds.includes(task.id) ? 'opacity: 0.5; pointer-events: none; border-left-color: #64748b; background: rgba(30,41,59,0.5); transform: scale(0.98);' : ''">
                  {{ task.noi_dung }}
                  <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.4rem; font-weight: 500; display: flex; align-items: center; gap: 0.3rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Lịch cũ: <span :style="assignedTaskIds.includes(task.id) ? 'text-decoration: line-through; opacity: 0.7;' : 'color: #94a3b8;'">{{ task.old_thoi_gian || task.thoi_gian }}</span>
                  </div>
                  <div v-if="assignedTaskIds.includes(task.id)" style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed rgba(255,255,255,0.1); font-size: 0.75rem; font-weight: 700; color: #10b981; display: flex; align-items: center; gap: 0.4rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Lịch mới: {{ task.thoi_gian }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Right panel: Empty periods -->
            <div class="distribute-right-panel" style="width: 65%; display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; background: #0f172a; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(to right, #1e293b, #0f172a); padding: 0.85rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(16,185,129,0.1); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(16,185,129,0.2);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                    <span style="font-weight: 700; color: #f8fafc; font-size: 0.95rem;">Chọn buổi nhận việc</span>
                    <span style="font-size: 0.75rem; font-weight: 700;" :style="isEmptySlotFull ? 'color: #34d399;' : 'color: #94a3b8;'">
                      Đã chọn {{ selectedEmptyPeriodsForDistribute.length }}/{{ maxEmptySlots }} buổi
                    </span>
                  </div>
                </div>
                <div style="display: flex; gap: 0.6rem; align-items: center;">
                  <div style="display: flex; background: rgba(255,255,255,0.05); padding: 3px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
                    <button @click="distributeStep2ViewMode = 'calendar'" :style="distributeStep2ViewMode === 'calendar' ? 'background: #3b82f6; color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);' : 'background: transparent; color: #94a3b8;'" style="padding: 4px 10px; border: none; font-size: 0.75rem; font-weight: 700; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Lịch</button>
                    <button @click="distributeStep2ViewMode = 'list'" :style="distributeStep2ViewMode === 'list' ? 'background: #3b82f6; color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);' : 'background: transparent; color: #94a3b8;'" style="padding: 4px 10px; border: none; font-size: 0.75rem; font-weight: 700; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Danh Sách</button>
                  </div>
                  <button @click="selectAllEmptyPeriods" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; color: #e2e8f0; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                    {{ selectedEmptyPeriodsForDistribute.length > 0 ? 'Bỏ chọn' : 'Chọn tất cả' }}
                  </button>
                </div>
              </div>
              
              <div v-if="distributeStep2ViewMode === 'list'" style="flex: 1; overflow-y: auto; padding: 1rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.8rem; align-content: flex-start;">
                <div v-if="emptyPeriodsForDistribute.length === 0" style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: #64748b;">
                  Không có buổi nào trống trong khoảng thời gian này.
                </div>
                
                <div v-else v-for="period in emptyPeriodsForDistribute" :key="period.id" 
                     @click="toggleEmptyPeriodDistribute(period.id)"
                     @dragover.prevent
                     @dragenter.prevent="$event.currentTarget.style.transform='scale(1.08)'; $event.currentTarget.style.boxShadow='0 0 15px rgba(16,185,129,0.4)'"
                     @dragleave.prevent="$event.currentTarget.style.transform='scale(1)'; $event.currentTarget.style.boxShadow='none'"
                     @drop="onTaskDropToPeriod(period.id, $event); $event.currentTarget.style.transform='scale(1)'; $event.currentTarget.style.boxShadow='none'"
                     style="padding: 0.8rem; border-radius: 12px; border: 2px solid transparent; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 0.2rem; position: relative;"
                     :style="successDropPeriods.includes(period.id) ? 'background: #10b981; border-color: #10b981; transform: scale(0.9); opacity: 0; pointer-events: none;' : (selectedEmptyPeriodsForDistribute.includes(period.id) ? 'background: rgba(16,185,129,0.1); border-color: #10b981; cursor: pointer;' : (isEmptySlotFull ? 'background: rgba(15,23,42,0.5); border-color: rgba(255,255,255,0.05); opacity: 0.4; cursor: not-allowed;' : 'background: #1e293b; border-color: rgba(255,255,255,0.1); cursor: pointer;'))">
                  
                  <div v-if="selectedEmptyPeriodsForDistribute.includes(period.id)" style="position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(16,185,129,0.3); pointer-events: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  
                  <span style="font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; pointer-events: none;">{{ getThuText(period.date) }}</span>
                  <span style="font-size: 0.95rem; font-weight: 700; color: #f8fafc; pointer-events: none;">{{ formatDateDMY(period.date) }}</span>
                  <span :style="period.period === 'Sáng' ? 'background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2);' : 'background: rgba(168,85,247,0.1); color: #c084fc; border: 1px solid rgba(168,85,247,0.2);'" style="margin-top: 0.4rem; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; pointer-events: none;">
                    {{ period.period === 'Sáng' ? 'Trống Sáng' : 'Trống Chiều' }}
                  </span>
                </div>
              </div>
              
              <div v-else class="empty-calendar-view" style="flex: 1; overflow-y: auto; padding: 1rem;">
                <div v-for="month in distributeDaysCalendar" :key="month.year + '-' + month.month" style="margin-bottom: 1.5rem;">
                  <h3 style="font-size: 1rem; color: #f8fafc; font-weight: 700; margin-bottom: 0.8rem; border-bottom: 2px solid rgba(255,255,255,0.05); padding-bottom: 0.6rem; display: flex; align-items: center; gap: 0.5rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Tháng {{ month.month }} / {{ month.year }}
                  </h3>
                  <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center; margin-bottom: 0.6rem;">
                    <div v-for="day in ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']" :key="day" style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; padding: 0.4rem 0; background: rgba(255,255,255,0.05); border-radius: 6px;">{{ day }}</div>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
                    <div v-for="(day, idx) in month.days" :key="idx" 
                         style="min-height: 75px; border-radius: 8px; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; padding: 6px 4px; position: relative; transition: all 0.2s;"
                         :style="day ? (day.inRange ? 'background: #1e293b; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 1px 2px rgba(0,0,0,0.1);' : 'background: transparent; border: 1px dashed rgba(255,255,255,0.1); opacity: 0.4;') : 'background: transparent;'">
                      <span v-if="day" style="font-size: 0.8rem; font-weight: 700; margin-bottom: 0.2rem;" :style="day.isSunday ? 'color: #f87171;' : 'color: #cbd5e1;'">{{ day.dayNum }}</span>
                      <div v-if="day && !day.inRange" style="font-size: 0.55rem; color: #475569; font-weight: 700; text-align: center; margin-top: auto; text-transform: uppercase; line-height: 1.2;">Ngoài<br>khoảng</div>
                      <div v-if="day && day.inRange" style="display: flex; flex-direction: column; gap: 3px; margin-top: auto; width: 100%;">
                        <div v-if="!day.isSunday && day.emptyMorning" 
                             @click="toggleEmptyPeriodDistribute(day.emptyMorning.id)" 
                             @dragover.prevent
                             @dragenter.prevent="$event.currentTarget.style.transform='scale(1.15)'; $event.currentTarget.style.boxShadow='0 0 12px rgba(59,130,246,0.6)'"
                             @dragleave.prevent="$event.currentTarget.style.transform='scale(1)'; $event.currentTarget.style.boxShadow='none'"
                             @drop="onTaskDropToPeriod(day.emptyMorning.id, $event); $event.currentTarget.style.transform='scale(1)'; $event.currentTarget.style.boxShadow='none'"
                             style="font-size: 0.65rem; font-weight: 700; border-radius: 6px; width: 100%; text-align: center; padding: 3px 0; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); user-select: none;"
                             :style="successDropPeriods.includes(day.emptyMorning.id) ? 'background: #10b981; color: white; transform: scale(0.9); opacity: 0; pointer-events: none;' : (selectedEmptyPeriodsForDistribute.includes(day.emptyMorning.id) ? 'background: #10b981; color: #0f172a; border: 1px solid #10b981; box-shadow: 0 2px 4px rgba(16,185,129,0.3); transform: scale(1.02); cursor: pointer;' : (isEmptySlotFull ? 'background: rgba(15,23,42,0.5); color: #64748b; border: 1px solid rgba(255,255,255,0.1); opacity: 0.5; cursor: not-allowed;' : 'background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); cursor: pointer;'))"
                             onmouseover="if(!this.style.opacity && this.style.backgroundColor !== 'rgb(16, 185, 129)') this.style.filter='brightness(1.2)'" onmouseout="this.style.filter='none'">{{ successDropPeriods.includes(day.emptyMorning.id) ? '✓' : 'Sáng' }}</div>
                        <div v-if="!day.isSunday && !day.isSaturday && day.emptyAfternoon" 
                             @click="toggleEmptyPeriodDistribute(day.emptyAfternoon.id)" 
                             @dragover.prevent
                             @dragenter.prevent="$event.currentTarget.style.transform='scale(1.15)'; $event.currentTarget.style.boxShadow='0 0 12px rgba(168,85,247,0.6)'"
                             @dragleave.prevent="$event.currentTarget.style.transform='scale(1)'; $event.currentTarget.style.boxShadow='none'"
                             @drop="onTaskDropToPeriod(day.emptyAfternoon.id, $event); $event.currentTarget.style.transform='scale(1)'; $event.currentTarget.style.boxShadow='none'"
                             style="font-size: 0.65rem; font-weight: 700; border-radius: 6px; width: 100%; text-align: center; padding: 3px 0; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); user-select: none;"
                             :style="successDropPeriods.includes(day.emptyAfternoon.id) ? 'background: #10b981; color: white; transform: scale(0.9); opacity: 0; pointer-events: none;' : (selectedEmptyPeriodsForDistribute.includes(day.emptyAfternoon.id) ? 'background: #10b981; color: #0f172a; border: 1px solid #10b981; box-shadow: 0 2px 4px rgba(16,185,129,0.3); transform: scale(1.02); cursor: pointer;' : (isEmptySlotFull ? 'background: rgba(15,23,42,0.5); color: #64748b; border: 1px solid rgba(255,255,255,0.1); opacity: 0.5; cursor: not-allowed;' : 'background: rgba(168,85,247,0.1); color: #c084fc; border: 1px solid rgba(168,85,247,0.2); cursor: pointer;'))"
                             onmouseover="if(!this.style.opacity && this.style.backgroundColor !== 'rgb(16, 185, 129)') this.style.filter='brightness(1.2)'" onmouseout="this.style.filter='none'">{{ successDropPeriods.includes(day.emptyAfternoon.id) ? '✓' : 'Chiều' }}</div>
                        <div v-if="!day.isSunday && !day.emptyMorning && (day.isSaturday || !day.emptyAfternoon)" style="font-size: 0.65rem; color: #10b981; font-weight: 800; text-align: center; padding: 3px 0; background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.1); border-radius: 6px; width: 100%;">ĐỦ</div>
                        <div v-if="day.isSunday" style="font-size: 0.65rem; color: #ef4444; font-weight: 800; text-align: center; padding: 3px 0; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 6px; width: 100%;">NGHỈ</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="elite-modal-actions" style="margin-top: 1.5rem; flex-shrink: 0; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between;">
            <div style="display: flex; gap: 0.8rem;">
              <button v-if="distributeStep === 2" type="button" class="elite-btn-cancel" style="background: rgba(255,255,255,0.05); color: #cbd5e1; border-color: rgba(255,255,255,0.1);" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'" @click="distributeStep = 1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.3rem;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Quay Lại
              </button>
            </div>
            
            <div style="display: flex; gap: 0.8rem;">
              <button type="button" class="elite-btn-cancel" style="background: rgba(255,255,255,0.05); color: #cbd5e1; border-color: rgba(255,255,255,0.1);" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'" @click="isDistributeModalOpen = false" :disabled="distributeLoading">Huỷ</button>
              
              <button v-if="distributeStep === 1" type="button" class="elite-btn-primary" style="background: #10b981; border-color: #10b981;" @click="nextDistributeStep" :disabled="selectedTasksToDistribute.length === 0">
                Tiếp Tục ({{ selectedTasksToDistribute.length }} việc)
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 0.3rem;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
              
              <button v-else type="button" class="elite-btn-primary" style="background: #3b82f6; border-color: #3b82f6;" @click="executeDistribute" :disabled="!isEmptySlotFull || distributeLoading">
                <span v-if="distributeLoading" class="spinner-small" style="margin-right: 0.5rem;"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.3rem;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Chia Đều Việc
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Xác Nhận Xóa -->
    <div class="elite-modal-overlay" v-if="isDeleteModalOpen" @click.self="isDeleteModalOpen = false" style="z-index: 999999;">
      <div class="elite-modal" style="max-width: 400px;">
        <div class="elite-modal-header">
          <div class="elite-modal-title" style="display: flex; align-items: flex-start; gap: 0.6rem;">
            <div style="margin-top: 0.15rem; color: #ef4444;">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <h2 style="margin: 0; line-height: 1.3;">Xóa báo cáo?</h2>
          </div>
          <button class="elite-btn-close" @click="isDeleteModalOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="elite-modal-body">
          <p style="color: #475569; font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.5;">Bạn có chắc chắn muốn xóa báo cáo này không? Hành động này không thể hoàn tác.</p>
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
            <button class="btn-secondary" @click="isDeleteModalOpen = false" style="padding: 0.6rem 1.25rem;">Hủy</button>
            <button class="btn-primary" @click="executeDelete" style="background: #ef4444; padding: 0.6rem 1.25rem; display: flex; align-items: center; gap: 0.5rem; border: none; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Xóa ngay
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác Nhận Hoàn Thành -->
    <div class="elite-modal-overlay" v-if="isDoneModalOpen" @click.self="isDoneModalOpen = false" style="z-index: 999999;">
      <div class="elite-modal" style="max-width: 400px;">
        <div class="elite-modal-header">
          <div class="elite-modal-title" style="display: flex; align-items: flex-start; gap: 0.6rem;">
            <div style="margin-top: 0.15rem; color: #10b981;">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h2 style="margin: 0; line-height: 1.3;">Xác nhận hoàn thành?</h2>
          </div>
          <button class="elite-btn-close" @click="isDoneModalOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="elite-modal-body">
          <p style="color: #475569; font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.5;">Đánh dấu báo cáo này là đã hoàn thành? Hệ thống sẽ tự động cập nhật trạng thái.</p>
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
            <button class="btn-secondary" @click="isDoneModalOpen = false" style="padding: 0.6rem 1.25rem;">Hủy</button>
            <button class="btn-primary" @click="executeMarkAsCompleted" style="background: linear-gradient(135deg, #047857, #10b981); padding: 0.6rem 1.25rem; display: flex; align-items: center; gap: 0.5rem; border: none; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Hoàn thành
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ghi Âm Giọng Nói -->
    <div class="elite-modal-overlay" v-if="isVoiceModalOpen" @click.self="cancelVoiceRecording" style="z-index: 999999;">
      <div class="elite-modal" style="max-width: 420px;">
        <div class="elite-modal-header" style="justify-content: center; padding-bottom: 0; border-bottom: none;">
          <div class="elite-modal-title" style="flex-direction: column; align-items: center; gap: 0.8rem; margin: 0 auto;">
            <div class="voice-recording-indicator" :class="{ 'is-listening': isListening }">
              <svg v-if="isListening" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect></svg>
            </div>
            <h2 style="font-size: 1.25rem;">{{ isListening ? 'Đang nghe...' : 'Đã tạm dừng' }}</h2>
          </div>
        </div>
        <div class="elite-modal-body" style="padding-top: 1rem;">
          <div class="voice-transcript-box">
            <span v-if="voiceTranscript">{{ voiceTranscript }}</span>
            <span v-else class="voice-placeholder">Hãy nói nội dung bạn muốn nhập...</span>
          </div>
          <div class="elite-modal-actions" style="justify-content: center; gap: 0.8rem; margin-top: 1.5rem;">
            <button type="button" class="elite-btn-cancel" @click="cancelVoiceRecording">Huỷ</button>
            <button type="button" class="elite-btn-secondary" @click="retryVoiceRecording" style="background: rgba(245, 158, 11, 0.1); color: #d97706; border-color: rgba(245, 158, 11, 0.2);">Nói lại</button>
            <button type="button" class="elite-btn-primary" @click="confirmVoiceRecording">Xong</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Custom Alert Modal -->
    <div class="elite-modal-overlay" v-if="customAlertState.isOpen" @click.self="closeAlert" style="z-index: 9999999; background: rgba(15,23,42,0.8); backdrop-filter: blur(8px);">
      <div class="elite-modal dark-mode-modal" style="width: 400px; max-width: 90vw; background: #1e293b !important; border: 1px solid rgba(255,255,255,0.1) !important; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border-radius: 16px; overflow: hidden; transform: scale(1); animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
        <div style="padding: 1.5rem; text-align: center;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: center;">
            <div v-if="customAlertState.type === 'error'" style="width: 56px; height: 56px; border-radius: 50%; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); display: flex; align-items: center; justify-content: center; color: #ef4444;">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </div>
            <div v-else-if="customAlertState.type === 'success'" style="width: 56px; height: 56px; border-radius: 50%; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); display: flex; align-items: center; justify-content: center; color: #10b981;">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div v-else style="width: 56px; height: 56px; border-radius: 50%; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); display: flex; align-items: center; justify-content: center; color: #3b82f6;">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #f8fafc; margin-bottom: 0.6rem;">Thông báo</h3>
          <p style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 1.5rem;">{{ customAlertState.message }}</p>
          <button @click="closeAlert" style="width: 100%; padding: 0.8rem; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(59,130,246,0.3);" onmouseover="this.style.background='#2563eb'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#3b82f6'; this.style.transform='none'">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
    <!-- Image Preview Modal -->
    <div v-if="selectedImage" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; align-items: center; z-index: 999999; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px);" @click="selectedImage = null">
      <div style="position: relative; max-width: 90vw; max-height: 90vh; display: flex; justify-content: center; align-items: center;" @click.stop>
        <button @click="selectedImage = null" style="position: absolute; top: -40px; right: 0; background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.4)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)'">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <img :src="selectedImage" style="max-width: 100%; max-height: 90vh; border-radius: 8px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); object-fit: contain;" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as XLSX from 'xlsx-js-style'
import CustomSelect from './CustomSelect.vue'

const isMobile = ref(window.innerWidth <= 768)
const onResize = () => { isMobile.value = window.innerWidth <= 768 }
const selectedImage = ref(null)

// Custom Alert System
const customAlertState = ref({ isOpen: false, message: '', type: 'info' })
const closeAlert = () => { customAlertState.value.isOpen = false }
const alert = (message) => {
  const msgLower = String(message).toLowerCase()
  let type = 'info'
  if (msgLower.includes('lỗi') || msgLower.includes('không thể') || msgLower.includes('vui lòng') || msgLower.includes('chặn')) type = 'error'
  else if (msgLower.includes('thành công') || msgLower.includes('xong')) type = 'success'
  
  customAlertState.value = { isOpen: true, message, type }
}

const isExpandedFilters = ref(false)

const sortOptions = [
  { value: 'desc', label: 'Mới nhất' },
  { value: 'asc', label: 'Cũ nhất' }
]

const periodOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'Sáng', label: 'Sáng' },
  { value: 'Chiều', label: 'Chiều' }
]

const priorityOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'ƯU TIÊN', label: 'Ưu tiên' },
  { value: 'BÌNH THƯỜNG', label: 'Bình thường' }
]

const typeOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'CÔNG VIỆC', label: 'Công việc' },
  { value: 'ĐỜI SỐNG', label: 'Đời sống' }
]

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'Chưa xử lý', label: 'Chưa xử lý' },
  { value: 'Hoàn thành', label: 'Hoàn thành' }
]

// ==========================================
// THAY THẾ URL WEB APP CỦA BẠN VÀO ĐÂY
// ==========================================
const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

const reports = ref([])
const loading = ref(false)
const saving = ref(false)

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

const filters = ref({
  tag: '',
  phan_loai: '',
  trang_thai: '',
  filterMode: 'day',
  dateFrom: getTodayStr(),
  dateTo: getTodayStr(),
  monthFrom: getThisMonthStr(),
  monthTo: getThisMonthStr(),
  yearFrom: getThisYearStr(),
  yearTo: getThisYearStr(),
  sortOrder: 'desc',
  period: ''
})

const isRecordingVoice = ref(null);
const isVoiceModalOpen = ref(false);
const voiceTargetField = ref('');
const voiceTranscript = ref('');
const isListening = ref(false);
let recognition = null;

const startVoiceRecognition = (field) => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  if (ua.indexOf("Zalo") > -1) {
    alert("Trình duyệt nội bộ của Zalo bị chặn quyền Micro nên không thể ghi âm. Vui lòng bấm vào biểu tượng dấu 3 chấm '...' ở góc màn hình và chọn 'Mở bằng trình duyệt' (Safari/Chrome) để dùng tính năng này.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome, Edge hoặc Safari.");
    return;
  }

  voiceTargetField.value = field;
  voiceTranscript.value = '';
  isVoiceModalOpen.value = true;
  
  startListening();
}

const startListening = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (recognition) recognition.stop();

  recognition = new SpeechRecognition();
  recognition.lang = 'vi-VN';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening.value = true;
    isRecordingVoice.value = voiceTargetField.value;
  };

  recognition.onresult = (event) => {
    let fullTranscript = '';
    for (let i = 0; i < event.results.length; ++i) {
      fullTranscript += event.results[i][0].transcript;
    }
    voiceTranscript.value = fullTranscript;
  };

  recognition.onerror = (event) => {
    console.error('Lỗi nhận diện giọng nói:', event.error);
    isListening.value = false;
  };

  recognition.onend = () => {
    isListening.value = false;
    isRecordingVoice.value = null;
  };

  recognition.start();
}

const cancelVoiceRecording = () => {
  if (recognition) recognition.stop();
  isVoiceModalOpen.value = false;
  isListening.value = false;
  isRecordingVoice.value = null;
  voiceTranscript.value = '';
}

const retryVoiceRecording = () => {
  voiceTranscript.value = '';
  startListening();
}

const confirmVoiceRecording = () => {
  if (recognition) recognition.stop();
  if (voiceTranscript.value) {
    if (formData.value[voiceTargetField.value]) {
      formData.value[voiceTargetField.value] += ' ' + voiceTranscript.value;
    } else {
      formData.value[voiceTargetField.value] = voiceTranscript.value;
    }
  }
  isVoiceModalOpen.value = false;
  isListening.value = false;
  isRecordingVoice.value = null;
  voiceTranscript.value = '';
}

const tableSection = ref(null)

const scrollToTable = () => {
  nextTick(() => {
    if (tableSection.value) {
      tableSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

const onCardClick = (status) => {
  filters.value.trang_thai = status;
  scrollToTable();
}

// Parse ngày từ chuỗi thời gian backend: "HH:MM /thu /DD/MM/YYYY"
const parseDateFromReport = (thoi_gian) => {
  try {
    const parts = thoi_gian.split(' /');
    if (parts.length === 3) {
      const timePart = parts[0];
      const datePart = parts[2];
      const [hour, minute] = timePart.split(':');
      const [d, m, y] = datePart.split('/');
      return new Date(Number(y), Number(m) - 1, Number(d), Number(hour), Number(minute));
    }
  } catch (e) {}
  return null;
}

// Helper định dạng hiển thị thời gian
const formatDisplayTime = (thoi_gian) => {
  if (!thoi_gian) return { time: '', thu: '', date: '' };
  const parts = thoi_gian.split(' /');
  if (parts.length === 3) {
    const timePart = parts[0];
    const thuPart = parts[1].trim();
    const datePart = parts[2];
    
    const [h, m] = timePart.split(':');
    const thuText = thuPart === '8' ? 'CN' : `Thứ ${thuPart}`;
    const hourNum = parseInt(h);
    const periodText = hourNum < 12 ? 'Sáng' : 'Chiều';
    
    return {
      time: `${h} : ${m}`,
      thu: thuText,
      date: datePart.split('/').join(' / '),
      period: periodText
    };
  }
  return { time: thoi_gian, thu: '', date: '', period: '' };
}

const baseFilteredReports = computed(() => {
  let result = reports.value.filter(r => {
    if (filters.value.tag && r.tag !== filters.value.tag) return false;
    if (filters.value.phan_loai && r.phan_loai !== filters.value.phan_loai) return false;
    if (filters.value.period) {
      const displayTime = formatDisplayTime(r.thoi_gian);
      if (displayTime.period !== filters.value.period) return false;
    }
    
    if (filters.value.filterMode === 'day' && (filters.value.dateFrom || filters.value.dateTo)) {
      const reportDate = parseDateFromReport(r.thoi_gian);
      if (!reportDate) return false;
      if (filters.value.dateFrom) {
        const from = new Date(filters.value.dateFrom);
        from.setHours(0, 0, 0, 0);
        if (reportDate < from) return false;
      }
      if (filters.value.dateTo) {
        const to = new Date(filters.value.dateTo);
        to.setHours(23, 59, 59, 999);
        if (reportDate > to) return false;
      }
    } else if (filters.value.filterMode === 'month' && (filters.value.monthFrom || filters.value.monthTo)) {
      const reportDate = parseDateFromReport(r.thoi_gian);
      if (!reportDate) return false;
      if (filters.value.monthFrom) {
        const [y, m] = filters.value.monthFrom.split('-');
        const from = new Date(Number(y), Number(m) - 1, 1, 0, 0, 0, 0);
        if (reportDate < from) return false;
      }
      if (filters.value.monthTo) {
        const [y, m] = filters.value.monthTo.split('-');
        const to = new Date(Number(y), Number(m), 0, 23, 59, 59, 999);
        if (reportDate > to) return false;
      }
    } else if (filters.value.filterMode === 'year' && (filters.value.yearFrom || filters.value.yearTo)) {
      const reportDate = parseDateFromReport(r.thoi_gian);
      if (!reportDate) return false;
      if (filters.value.yearFrom) {
        const from = new Date(Number(filters.value.yearFrom), 0, 1, 0, 0, 0, 0);
        if (reportDate < from) return false;
      }
      if (filters.value.yearTo) {
        const to = new Date(Number(filters.value.yearTo), 11, 31, 23, 59, 59, 999);
        if (reportDate > to) return false;
      }
    }
    return true;
  });

  // Sắp xếp
  result.sort((a, b) => {
    const dateA = parseDateFromReport(a.thoi_gian) || 0;
    const dateB = parseDateFromReport(b.thoi_gian) || 0;
    if (filters.value.sortOrder === 'desc') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  return result;
})

const filteredReports = computed(() => {
  return baseFilteredReports.value.filter(r => {
    if (filters.value.trang_thai && filters.value.trang_thai !== 'Tất cả' && r.trang_thai !== filters.value.trang_thai) return false;
    return true;
  });
});

const totalCount = computed(() => baseFilteredReports.value.length)
const pendingCount = computed(() => baseFilteredReports.value.filter(r => r.trang_thai === 'Chưa xử lý').length)
const completedCount = computed(() => baseFilteredReports.value.filter(r => r.trang_thai === 'Hoàn thành').length)

const pendingReports = computed(() => filteredReports.value.filter(r => r.trang_thai !== 'Hoàn thành'));
const completedReports = computed(() => filteredReports.value.filter(r => r.trang_thai === 'Hoàn thành'));

const kanbanColumns = computed(() => [
  {
    status: 'Chưa xử lý',
    title: 'CHƯA XỬ LÝ',
    dotClass: 'bg-amber-500 shadow-amber-500/50',
    reports: pendingReports.value
  },
  {
    status: 'Hoàn thành',
    title: 'HOÀN THÀNH',
    dotClass: 'bg-emerald-500 shadow-emerald-500/50',
    reports: completedReports.value
  }
]);

// View mode: 'detail' (kanban) or 'daily' (single column by day)
const desktopViewMode = ref('detail');

const dailyColumns = computed(() => {
  const grouped = {};
  filteredReports.value.forEach(r => {
    const parsed = parseDateFromReport(r.thoi_gian);
    if (!parsed) return;
    const dateKey = `${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,'0')}-${String(parsed.getDate()).padStart(2,'0')}`;
    if (!grouped[dateKey]) {
      const display = formatDisplayTime(r.thoi_gian);
      grouped[dateKey] = {
        dateKey,
        dateObj: new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()),
        dateLabel: display.date,
        thuLabel: display.thu,
        morning: [],
        afternoon: []
      };
    }
    const ft = formatDisplayTime(r.thoi_gian);
    if (ft.period === 'Sáng') grouped[dateKey].morning.push(r);
    else grouped[dateKey].afternoon.push(r);
  });
  const arr = Object.values(grouped);
  arr.sort((a, b) => filters.value.sortOrder === 'desc' ? b.dateObj - a.dateObj : a.dateObj - b.dateObj);
  return arr;
});

const draggedReportId = ref(null);
const droppedReportId = ref(null);
const dragOverColumn = ref(null); // track cột đang hover khi kéo

const onDragStartReport = (e, report) => {
  draggedReportId.value = report.id;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', report.id);
};

const onDragEndReport = () => {
  draggedReportId.value = null;
  dragOverColumn.value = null;
};

const onDragEnterColumn = (status, period) => {
  if (draggedReportId.value) dragOverColumn.value = status + '-' + period;
};

const onDragLeaveColumn = (e, colEl) => {
  // Chỉ clear khi thực sự rời khỏi column (không phải vào card con)
  if (colEl && colEl.contains && colEl.contains(e.relatedTarget)) return;
  dragOverColumn.value = null;
};

const onDropReport = async (e, newStatus, newPeriod) => {
  const id = draggedReportId.value;
  if (!id) return;
  const report = reports.value.find(r => r.id === id);
  if (report) {
    // Nếu newStatus null (daily view), giữ nguyên trạng thái hiện tại
    const effectiveStatus = newStatus !== null && newStatus !== undefined ? newStatus : report.trang_thai;
    const currentPeriod = formatDisplayTime(report.thoi_gian).period;
    if (report.trang_thai !== effectiveStatus || currentPeriod !== newPeriod) {
      if (API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
         alert("Tính năng này cần cấu hình API_URL");
         return;
      }
      const originalStatus = report.trang_thai;
      const originalTime = report.thoi_gian;
      
      report.trang_thai = effectiveStatus;

      droppedReportId.value = report.id;
      setTimeout(() => {
        if (droppedReportId.value === report.id) droppedReportId.value = null;
      }, 800);
      
      if (currentPeriod !== newPeriod) {
        const timeObj = parseTimeString(report.thoi_gian);
        timeObj.hour = newPeriod === 'Sáng' ? '08' : '14';
        timeObj.minute = '00';
        let validDayStr = timeObj.day;
        const maxDay = new Date(Number(timeObj.year), Number(timeObj.month), 0).getDate();
        if (Number(validDayStr) > maxDay) validDayStr = String(maxDay).padStart(2, '0');
        report.thoi_gian = `${timeObj.hour}:${timeObj.minute} /${timeObj.thu} /${validDayStr}/${timeObj.month}/${timeObj.year}`;
      }
      
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'update', ...report })
        });
        const result = await response.json();
        if (result.status !== 'success') {
          report.trang_thai = originalStatus;
          report.thoi_gian = originalTime;
          alert('Lỗi cập nhật: ' + result.message);
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
        report.trang_thai = originalStatus;
        report.thoi_gian = originalTime;
      }
    }
  }
  draggedReportId.value = null;
  dragOverColumn.value = null;
};

watch(() => filters.value.dateFrom, (newVal) => {
  if (newVal && filters.value.dateTo && newVal > filters.value.dateTo) {
    filters.value.dateTo = newVal;
  }
})

watch(() => filters.value.dateTo, (newVal) => {
  if (newVal && filters.value.dateFrom && newVal < filters.value.dateFrom) {
    filters.value.dateFrom = newVal;
  }
})

watch(() => filters.value.monthFrom, (newVal) => {
  if (newVal && filters.value.monthTo && newVal > filters.value.monthTo) filters.value.monthTo = newVal;
})

watch(() => filters.value.monthTo, (newVal) => {
  if (newVal && filters.value.monthFrom && newVal < filters.value.monthFrom) filters.value.monthFrom = newVal;
})

watch(() => filters.value.yearFrom, (newVal) => {
  if (newVal && filters.value.yearTo && Number(newVal) > Number(filters.value.yearTo)) filters.value.yearTo = newVal;
})

watch(() => filters.value.yearTo, (newVal) => {
  if (newVal && filters.value.yearFrom && Number(newVal) < Number(filters.value.yearFrom)) filters.value.yearFrom = newVal;
})

const applyFilters = () => {
  // filteredReports là computed, nó sẽ tự động cập nhật giao diện khi filters thay đổi.
  // Chúng ta không cần gọi fetchReports() ở đây trừ khi muốn lọc từ server.
}

const isModalOpen = ref(false)
const isEditing = ref(false)
const formData = ref({
  id: '',
  phan_loai: 'CÔNG VIỆC',
  noi_dung: '',
  ghi_chu: '',
  tag: 'BÌNH THƯỜNG',
  trang_thai: 'Chưa xử lý',
  img_save: '',
  link_excel_bao_gia: '',
  link_excel_mua_hang: ''
})

const isUploadingFiles = ref(false)

const timeInputs = ref({
  hour: '00',
  minute: '00',
  thu: '2',
  day: '01',
  month: '01',
  year: '2026'
})

const daysInMonth = computed(() => {
  return new Date(Number(timeInputs.value.year), Number(timeInputs.value.month), 0).getDate();
})

let isUpdatingDateFromThu = false;
let isUpdatingThuFromDate = false;

watch(() => timeInputs.value.thu, (newThu) => {
  if (isUpdatingThuFromDate) return;
  isUpdatingDateFromThu = true;

  const { day, month, year } = timeInputs.value;
  const dObj = new Date(Number(year), Number(month) - 1, Number(day));
  const currentJsDay = dObj.getDay();
  
  // Tính khoảng cách từ thứ 2 (0: thứ 2, 1: thứ 3,... 6: chủ nhật)
  const offsetFromMonday = currentJsDay === 0 ? 6 : currentJsDay - 1;
  
  // Tìm ngày Thứ 2 của tuần hiện tại
  const mondayObj = new Date(dObj);
  mondayObj.setDate(dObj.getDate() - offsetFromMonday);
  
  // Tính khoảng cách của Thứ mới so với Thứ 2
  const targetThu = Number(newThu);
  const targetOffset = targetThu === 8 ? 6 : targetThu - 2;
  
  // Áp dụng khoảng cách mới để ra ngày tương ứng
  const targetDateObj = new Date(mondayObj);
  targetDateObj.setDate(mondayObj.getDate() + targetOffset);
  
  timeInputs.value.day = String(targetDateObj.getDate()).padStart(2, '0');
  timeInputs.value.month = String(targetDateObj.getMonth() + 1).padStart(2, '0');
  timeInputs.value.year = String(targetDateObj.getFullYear());

  // Nhả flag sau một chút để tránh vòng lặp watch
  setTimeout(() => { isUpdatingDateFromThu = false; }, 10);
})

watch([() => timeInputs.value.day, () => timeInputs.value.month, () => timeInputs.value.year], ([d, m, y]) => {
  if (isUpdatingDateFromThu) return;
  isUpdatingThuFromDate = true;

  let validDay = Number(d);
  const maxDay = new Date(Number(y), Number(m), 0).getDate();
  if (validDay > maxDay) validDay = maxDay; 

  const dObj = new Date(Number(y), Number(m) - 1, validDay);
  if (!isNaN(dObj.getTime())) {
    const thu = dObj.getDay();
    timeInputs.value.thu = String(thu === 0 ? 8 : thu + 1);
  }

  setTimeout(() => { isUpdatingThuFromDate = false; }, 10);
})

const setMorningTime = () => {
  timeInputs.value.hour = '08';
  timeInputs.value.minute = '00';
}

const setAfternoonTime = () => {
  timeInputs.value.hour = '13';
  timeInputs.value.minute = '00';
}

const isMorning = computed(() => {
  const h = Number(timeInputs.value.hour);
  return h >= 0 && h < 12;
})

const isAfternoon = computed(() => {
  const h = Number(timeInputs.value.hour);
  return h >= 12 && h < 24;
})

const getNowTimeInputs = () => {
  const now = new Date();
  const thu = now.getDay();
  return {
    hour: String(now.getHours()).padStart(2, '0'),
    minute: String(now.getMinutes()).padStart(2, '0'),
    thu: String(thu === 0 ? 8 : thu + 1),
    day: String(now.getDate()).padStart(2, '0'),
    month: String(now.getMonth() + 1).padStart(2, '0'),
    year: String(now.getFullYear())
  };
}

const parseTimeString = (timeStr) => {
  try {
    const parts = timeStr.split(' /');
    if (parts.length === 3) {
      const timePart = parts[0]; 
      const thuPart = parts[1].trim(); 
      const datePart = parts[2]; 
      
      const [hour, minute] = timePart.split(':');
      const [d, m, y] = datePart.split('/');
      
      return { 
        hour, minute, 
        thu: thuPart,
        day: d.padStart(2, '0'), 
        month: m.padStart(2, '0'), 
        year: y 
      };
    }
  } catch (e) {
    console.error("Lỗi parse ngày:", e);
  }
  return getNowTimeInputs();
}

const formatTimeString = () => {
  const { hour, minute, thu, day, month, year } = timeInputs.value;
  let validDay = Number(day);
  const maxDay = new Date(Number(year), Number(month), 0).getDate();
  if (validDay > maxDay) validDay = maxDay;

  const validDayStr = String(validDay).padStart(2, '0');
  
  return `${hour}:${minute} /${thu} /${validDayStr}/${month}/${year}`;
}

// Chia tags ra mảng để render giao diện đẹp hơn
const splitTags = (tagString) => {
  if (!tagString) return [];
  return tagString.split(',').map(t => t.trim()).filter(t => t);
}

// Fetch dữ liệu từ Google App Script
const fetchReports = async () => {
  if (API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
     console.warn("Vui lòng cập nhật API_URL của Google Apps Script.");
     // Dữ liệu mẫu tạm thời để xem giao diện
     reports.value = [
       { id: '1', phan_loai: 'CÔNG VIỆC', thoi_gian: '14:30 /3 /22/4/2026', noi_dung: 'Hoàn thiện báo cáo', ghi_chu: 'Gửi sếp lúc 5h', tag: 'ƯU TIÊN', trang_thai: 'Chưa xử lý' },
       { id: '2', phan_loai: 'ĐỜI SỐNG', thoi_gian: '09:15 /2 /21/4/2026', noi_dung: 'Mua cà phê', ghi_chu: '', tag: 'BÌNH THƯỜNG', trang_thai: 'Hoàn thành' }
     ];
     return;
  }

  loading.value = true
  try {
    const url = new URL(API_URL)
    url.searchParams.append('action', 'get')
    if (filters.value.tag) url.searchParams.append('tag', filters.value.tag)
    if (filters.value.phan_loai) url.searchParams.append('phan_loai', filters.value.phan_loai)
    if (filters.value.trang_thai) url.searchParams.append('trang_thai', filters.value.trang_thai)

    const response = await fetch(url.toString())
    const result = await response.json()
    if (result.status === 'success') {
      reports.value = result.data
    } else {
      alert('Lỗi khi tải dữ liệu: ' + result.message)
    }
  } catch (error) {
    console.error('Lỗi fetch data:', error)
  } finally {
    loading.value = false
  }
}

// Mở Modal
const openAddModal = () => {
  isEditing.value = false
  formData.value = {
    id: '',
    phan_loai: 'CÔNG VIỆC',
    noi_dung: '',
    ghi_chu: '',
    tag: 'BÌNH THƯỜNG',
    trang_thai: 'Chưa xử lý',
    img_save: '',
    link_excel_bao_gia: '',
    link_excel_mua_hang: '',
    ten_file_bao_gia: '',
    ten_file_mua_hang: ''
  }
  timeInputs.value = getNowTimeInputs();
  isModalOpen.value = true
}

const openAddModalForPeriod = (period) => {
  openAddModal();
  if (period === 'Sáng') {
    timeInputs.value.hour = '08';
    timeInputs.value.minute = '00';
  } else if (period === 'Chiều') {
    timeInputs.value.hour = '14';
    timeInputs.value.minute = '00';
  }
};

const openAddModalWithSlot = (slot) => {
  isEmptyDaysModalOpen.value = false;
  isEditing.value = false;
  formData.value = {
    id: '',
    phan_loai: 'CÔNG VIỆC',
    noi_dung: '',
    ghi_chu: '',
    tag: 'BÌNH THƯỜNG',
    trang_thai: 'Chưa xử lý',
    img_save: '',
    link_excel_bao_gia: '',
    link_excel_mua_hang: '',
    ten_file_bao_gia: '',
    ten_file_mua_hang: ''
  };
  
  const d = slot.date;
  const thu = d.getDay();
  timeInputs.value = {
    hour: slot.period === 'Sáng' ? '08' : '14',
    minute: '00',
    thu: String(thu === 0 ? 8 : thu + 1),
    day: String(d.getDate()).padStart(2, '0'),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    year: String(d.getFullYear())
  };
  isModalOpen.value = true;
}

const originalData = ref(null);
const originalTimeInputs = ref(null);

const hasChanges = computed(() => {
  if (!isEditing.value) return true;
  if (!originalData.value || !originalTimeInputs.value) return false;
  
  const formKeys = ['phan_loai', 'noi_dung', 'ghi_chu', 'tag', 'trang_thai', 'img_save', 'link_excel_bao_gia', 'link_excel_mua_hang', 'ten_file_bao_gia', 'ten_file_mua_hang'];
  for (const k of formKeys) {
    if (formData.value[k] !== originalData.value[k]) return true;
  }
  
  const timeKeys = ['hour', 'minute', 'thu', 'day', 'month', 'year'];
  for (const k of timeKeys) {
    if (timeInputs.value[k] !== originalTimeInputs.value[k]) return true;
  }
  
  return false;
});

const openEditModal = (report) => {
  isEditing.value = true
  formData.value = { ...report }
  if (!formData.value.img_save) formData.value.img_save = ''
  if (!formData.value.link_excel_bao_gia) formData.value.link_excel_bao_gia = ''
  if (!formData.value.link_excel_mua_hang) formData.value.link_excel_mua_hang = ''
  if (!formData.value.ten_file_bao_gia) formData.value.ten_file_bao_gia = ''
  if (!formData.value.ten_file_mua_hang) formData.value.ten_file_mua_hang = ''
  originalData.value = { ...report }
  timeInputs.value = parseTimeString(report.thoi_gian);
  originalTimeInputs.value = { ...timeInputs.value }
  isModalOpen.value = true
}

const closeModal = () => {
  if (saving.value) return; // Không đóng khi đang lưu
  isModalOpen.value = false
}

// --- BÁO GIÁ KHÁCH HÀNG ---
const customersList = ref([])
const showCustomerModal = ref(false)
const customerSearch = ref('')
const loadingCustomers = ref(false)

const fetchCustomersForQuote = async () => {
  loadingCustomers.value = true;
  try {
    const url = new URL(API_URL)
    url.searchParams.append('sheet', 'khach_hang')
    url.searchParams.append('action', 'get')
    const response = await fetch(url.toString())
    const result = await response.json()
    if (result.status === 'success') {
      customersList.value = result.data || []
    }
  } catch(e) {
    console.error(e)
  } finally {
    loadingCustomers.value = false;
  }
}

const openCustomerModal = () => {
  showCustomerModal.value = true;
  if (customersList.value.length === 0) {
    fetchCustomersForQuote();
  }
}

const filteredCustomersList = computed(() => {
  if (!customerSearch.value) return customersList.value;
  const q = customerSearch.value.toLowerCase();
  return customersList.value.filter(c => 
    (c.ten_khach_hang && c.ten_khach_hang.toLowerCase().includes(q)) ||
    (c.ten_cong_ty && c.ten_cong_ty.toLowerCase().includes(q))
  );
})

const insertCustomerQuote = (customer) => {
  const nameToUse = customer.ten_cong_ty || customer.ten_khach_hang;
  const quoteText = `Báo giá ${nameToUse}`;
  formData.value.noi_dung = quoteText;
  showCustomerModal.value = false;
  customerSearch.value = '';
}

const handleImgUpload = async (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return
  
  isUploadingFiles.value = 'img'
  try {
    for (const file of files) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      await new Promise(r => reader.onload = r)
      const base64 = String(reader.result).split(',')[1]
      
      const fd = new FormData()
      fd.append('key', 'b202a4bdc79bf1dc72f6f6ded6b74501')
      fd.append('image', base64)
      const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: fd }).then(r => r.json())
      
      if (res.success) {
        formData.value.img_save = formData.value.img_save ? formData.value.img_save + '\n' + res.data.url : res.data.url
      } else {
        alert('Lỗi tải ảnh: ' + (res.error?.message || 'Không rõ'))
      }
    }
  } catch (err) {
    console.error(err)
    alert('Lỗi mạng khi tải ảnh lên')
  } finally {
    isUploadingFiles.value = false
    e.target.value = ''
  }
}

const handleExcelUpload = async (e, field) => {
  const files = e.target.files
  if (!files || files.length === 0) return
  
  isUploadingFiles.value = field === 'link_excel_bao_gia' ? 'bg' : 'mh'
  try {
    for (const file of files) {
      const fd = new FormData()
      fd.append('upload_preset', 'upload_file')
      fd.append('file', file)
      const res = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', { method: 'POST', body: fd }).then(r => r.json())
      
      if (res.secure_url) {
        formData.value[field] = formData.value[field] ? formData.value[field] + '\n' + res.secure_url : res.secure_url
        const nameField = field.replace('link_excel_', 'ten_file_')
        formData.value[nameField] = formData.value[nameField] ? formData.value[nameField] + '\n' + file.name : file.name
      } else {
        alert('Lỗi tải file: ' + (res.error?.message || 'Không rõ'))
      }
    }
  } catch (err) {
    console.error(err)
    alert('Lỗi mạng khi tải file lên Cloudinary')
  } finally {
    isUploadingFiles.value = false
    e.target.value = ''
  }
}

const removeLink = (field, index) => {
  const links = formData.value[field].split('\n').filter(Boolean)
  links.splice(index, 1)
  formData.value[field] = links.join('\n')

  if (field.startsWith('link_excel_')) {
    const nameField = field.replace('link_excel_', 'ten_file_')
    if (formData.value[nameField]) {
      const names = formData.value[nameField].split('\n').filter(Boolean)
      names.splice(index, 1)
      formData.value[nameField] = names.join('\n')
    }
  }
}

// Lưu (Thêm/Sửa)
const highlightedReportId = ref(null)

const saveReport = async (options = {}) => {
  const isContinue = !!options.continue;
  const isOpenEmpty = !!options.openEmpty;
  
  if ((isContinue || isOpenEmpty) && !formData.value.noi_dung) {
    return;
  }

  if (API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
     alert("Vui lòng cập nhật API_URL của Google Apps Script để lưu thực tế.");
     if (!isContinue) closeModal();
     return;
  }

  formData.value.thoi_gian = formatTimeString();

  saving.value = true
  if (isUploadingFiles.value) {
    alert('Vui lòng đợi file đang được tải lên xong trước khi lưu.')
    saving.value = false
    return
  }
  
  // Tạo độ trễ giả 500ms để hiển thị trạng thái "Đang lưu..." (UX)
  await new Promise(r => setTimeout(r, 500));

  const action = isEditing.value ? 'update' : 'add'
  const payload = {
    action: action,
    ...formData.value
  }

  // Cập nhật UI ngay lập tức
  const tempId = action === 'add' ? `temp_${Date.now()}` : formData.value.id;
  
  let newCreatedTime = formData.value.created_time;
  if (action === 'add') {
    const now = new Date();
    const pad = n => String(n).padStart(2, "0");
    newCreatedTime = `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`;
  }

  const newReport = {
    ...formData.value,
    id: tempId,
    created_time: newCreatedTime
  };

  if (action === 'add') {
    reports.value.unshift(newReport);
  } else {
    const index = reports.value.findIndex(r => r.id === tempId);
    if (index !== -1) {
      reports.value[index] = newReport;
    }
  }

  // Tắt loading và xử lý đóng modal/reset
  if (!isContinue && !isOpenEmpty) {
    isModalOpen.value = false;
  } else if (isOpenEmpty) {
    isModalOpen.value = false;
    showEmptyDays();
  } else {
    formData.value.noi_dung = '';
  }
  saving.value = false;

  // Highlight dòng vừa tác động
  highlightedReportId.value = tempId;
  setTimeout(() => {
    if (highlightedReportId.value === tempId) {
      highlightedReportId.value = null;
    }
  }, 3000);

  // Xử lý gửi dữ liệu ngầm
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    
    const result = await response.json()
    if (result.status === 'success') {
      if (action === 'add' && result.id) {
        const idx = reports.value.findIndex(r => r.id === tempId);
        if (idx !== -1) {
          reports.value[idx].id = result.id;
        }
        if (highlightedReportId.value === tempId) {
          highlightedReportId.value = result.id;
        }
      }
    } else {
      console.error('Lưu ngầm thất bại:', result.message)
    }
  } catch (error) {
    console.error('Lỗi khi lưu ngầm:', error)
  }
}

// Chọn hàng loạt
const selectedReports = ref([])

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedReports.value = filteredReports.value.map(r => r.id);
  } else {
    selectedReports.value = [];
  }
}

const isAllSelected = computed(() => {
  return filteredReports.value.length > 0 && selectedReports.value.length === filteredReports.value.length;
})

const bulkMarkCompleted = async () => {
  if (selectedReports.value.length === 0) return;
  if (!confirm(`Xác nhận đánh dấu hoàn thành ${selectedReports.value.length} công việc đã chọn?`)) return;
  
  saving.value = true;
  try {
    const promises = selectedReports.value.map(async id => {
      const report = reports.value.find(r => r.id === id);
      if (report && report.trang_thai !== 'Hoàn thành') {
        report.trang_thai = 'Hoàn thành';
        await fetch(API_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'update', ...report })
        });
      }
    });
    await Promise.all(promises);
    selectedReports.value = [];
  } catch (error) {
    console.error('Lỗi bulk update', error);
    alert('Có lỗi xảy ra khi cập nhật hàng loạt.');
  }
  saving.value = false;
}

const bulkDelete = async () => {
  if (selectedReports.value.length === 0) return;
  if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedReports.value.length} công việc đã chọn? Hành động này không thể hoàn tác.`)) return;
  
  saving.value = true;
  try {
    const promises = selectedReports.value.map(id => fetch(`${API_URL}?action=delete&id=${id}`));
    await Promise.all(promises);
    reports.value = reports.value.filter(r => !selectedReports.value.includes(r.id));
    selectedReports.value = [];
  } catch (error) {
    console.error('Lỗi bulk delete', error);
    alert('Có lỗi xảy ra khi xóa hàng loạt.');
  }
  saving.value = false;
}

// Đánh dấu hoàn thành nhanh từ List
const isDoneModalOpen = ref(false)
const doneTarget = ref(null)

const markAsCompleted = (report) => {
  if (API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
     alert("Tính năng này cần cấu hình API_URL");
     return;
  }
  doneTarget.value = report;
  isDoneModalOpen.value = true;
}

const executeMarkAsCompleted = async () => {
  if (!doneTarget.value) return;
  const report = doneTarget.value;
  isDoneModalOpen.value = false;

  const originalStatus = report.trang_thai;
  report.trang_thai = 'Hoàn thành';
  
  try {
    const payload = {
      action: 'update',
      ...report
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    
    const result = await response.json()
    if (result.status !== 'success') {
      alert('Lỗi cập nhật: ' + result.message)
      report.trang_thai = originalStatus;
    }
  } catch (error) {
    console.error('Lỗi khi lưu:', error)
    report.trang_thai = originalStatus;
  }
}

// Xoá
const isDeleteModalOpen = ref(false)
const deleteTarget = ref(null)
const isDeleting = ref(false)
const deletingIds = ref([])

const confirmDelete = (id) => {
  if (API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
      alert("Tính năng xoá cần cấu hình API_URL");
      return;
  }
  deleteTarget.value = id;
  isDeleteModalOpen.value = true;
}

const executeDelete = async () => {
  if (!deleteTarget.value) return;
  const id = deleteTarget.value;
  
  isDeleting.value = true;
  deletingIds.value = [id];
  isDeleteModalOpen.value = false;
  
  try {
    // Gọi API xoá
    const response = await fetch(`${API_URL}?action=delete&id=${id}`)
    const result = await response.json()
    
    if (result.status === 'success') {
      // Đợi hiệu ứng animation chạy xong (400ms)
      await new Promise(r => setTimeout(r, 400));
      reports.value = reports.value.filter(r => r.id !== id);
    } else {
      alert('Lỗi khi xoá: ' + result.message)
    }
  } catch (error) {
    console.error('Lỗi delete:', error)
  }
  
  deletingIds.value = [];
  isDeleting.value = false;
  deleteTarget.value = null;
}

// Helpers giao diện
const getCategoryClass = (cat) => {
  switch (cat?.toUpperCase()) {
    case 'CÔNG VIỆC': return 'cat-work'
    case 'ĐỜI SỐNG': return 'cat-life'
    default: return 'cat-default'
  }
}

const getStatusDotClass = (status) => {
  switch (status) {
    case 'Hoàn thành': return 'bg-emerald-500 shadow-emerald-500/50'
    case 'Chưa xử lý': return 'bg-amber-500 shadow-amber-500/50'
    default: return 'bg-slate-300'
  }
}


const downloadExcelFile = async (url, fileName) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    a.remove();
  } catch (error) {
    console.error('Lỗi khi tải file', error);
    window.open(url, '_blank');
  }
}

const getExcelFileName = (dataObj, field, index, prefix) => {
  const nameField = field.replace('link_excel_', 'ten_file_');
  if (dataObj && dataObj[nameField]) {
    const names = String(dataObj[nameField]).split('\n').filter(Boolean);
    if (names[index]) return names[index];
  }
  return `${prefix} ${index + 1}`;
}

const getFileIconSvg = (fileName) => {
  const ext = fileName ? fileName.split('.').pop().toLowerCase() : '';
  const isExcel = ['xls', 'xlsx', 'csv'].includes(ext) || (fileName || '').toLowerCase().includes('excel') || (fileName || '').toLowerCase().includes('báo giá') || (fileName || '').toLowerCase().includes('mua hàng');
  const isWord = ['doc', 'docx'].includes(ext) || (fileName || '').toLowerCase().includes('word');
  const isPdf = ['pdf'].includes(ext);
  const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(ext);
  const isArchive = ['zip', 'rar', '7z'].includes(ext);

  if (isExcel) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#10b981"/><path d="M14 2v6h6" fill="#047857" opacity="0.3"/><path d="M9 12l2 3-2 3h2l1-1.5 1 1.5h2l-2-3 2-3h-2l-1 1.5-1-1.5H9z" fill="#ffffff"/></svg>`;
  } else if (isWord) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#3b82f6"/><path d="M14 2v6h6" fill="#1d4ed8" opacity="0.3"/><path d="M8 12l1 6 1.5-4 1.5 4 1-6h-1.5l-.5 4-.5-4h-1.5l-.5 4-.5-4H8z" fill="#ffffff"/></svg>`;
  } else if (isPdf) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#ef4444"/><path d="M14 2v6h6" fill="#b91c1c" opacity="0.3"/><path d="M8.5 16v-4h2a1.5 1.5 0 0 1 0 3h-1v1h-1zm1-2h1a.5.5 0 0 0 0-1h-1v1zm3 2v-4h2a1.5 1.5 0 0 1 0 3h-1v1h-1zm1-1.5h1a.5.5 0 0 0 0-1h-1v1zm2 1.5v-4h2.5v1h-1.5v.5h1v1h-1v1.5h-1z" fill="#ffffff"/></svg>`;
  } else if (isImage) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#8b5cf6"/><path d="M14 2v6h6" fill="#6d28d9" opacity="0.3"/><circle cx="10" cy="12" r="1.5" fill="#ffffff"/><path d="M7 18l3.5-4.5 2 2.5 3-4L17 18H7z" fill="#ffffff"/></svg>`;
  } else if (isArchive) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#f59e0b"/><path d="M14 2v6h6" fill="#d97706" opacity="0.3"/><path d="M10 12h4v1h-4v-1zm0 2h4v1h-4v-1zm0 2h4v1h-4v-1z" fill="#ffffff"/></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#94a3b8"/><path d="M14 2v6h6" fill="#64748b" opacity="0.3"/></svg>`;
}

const getStatusPillClass = (status) => {
  switch (status) {
    case 'Hoàn thành': return 'pill-success'
    case 'Chưa xử lý': return 'pill-warning'
    default: return 'pill-default'
  }
}

const getTagClass = (tag) => {
  switch (tag?.toUpperCase()) {
    case 'ƯU TIÊN': return 'tag-priority'
    case 'BÌNH THƯỜNG': return 'tag-normal'
    default: return 'tag-default'
  }
}

const getStatusBorderClass = (status) => {
  switch (status) {
    case 'Hoàn thành': return 'border-status-success'
    case 'Chưa xử lý': return 'border-status-warning'
    default: return ''
  }
}

const isExportModalOpen = ref(false)
const exportInputs = ref({
  month: String(new Date().getMonth() + 1).padStart(2, '0'),
  year: String(new Date().getFullYear())
})

const isEmptyDaysModalOpen = ref(false)
const emptyDays = ref([])
const emptyDaysViewMode = ref('list'); // 'list' or 'calendar'
const emptyDaysStartDate = ref(null);
const emptyDaysEndDate = ref(null);
const emptyFilterDateFrom = ref('');
const emptyFilterDateTo = ref('');
// Range riêng cho tab Tổng Quan: luôn là toàn bộ thời gian
const calendarAllStart = ref(null);
const calendarAllEnd = ref(null);

// State cho chức năng Chia Việc
const isDistributeModalOpen = ref(false)
const distributeStep = ref(1) // 1: Chọn việc dư, 2: Chọn buổi nhận
const overloadedPeriods = ref([])
const emptyPeriodsForDistribute = ref([])
const selectedTasksToDistribute = ref([])
const selectedEmptyPeriodsForDistribute = ref([])
const distributeLoading = ref(false)
const successDropPeriods = ref([])
const assignedTaskIds = ref([])

const distributeFilterDateFrom = ref('')
const distributeFilterDateTo = ref('')

const recalcDistributeTasks = () => {
  const currentReports = reports.value || []
  const workReports = currentReports.filter(r => r.phan_loai === 'CÔNG VIỆC')
  
  if (!distributeFilterDateFrom.value || !distributeFilterDateTo.value) return;

  const filterStart = new Date(distributeFilterDateFrom.value);
  const filterEnd = new Date(distributeFilterDateTo.value);

  if (isNaN(filterStart.getTime()) || isNaN(filterEnd.getTime())) {
    return;
  }
  
  filterStart.setHours(0, 0, 0, 0);
  filterEnd.setHours(23, 59, 59, 999);

  const reportMap = new Map() 
  workReports.forEach(r => {
    const d = parseDateFromReport(r.thoi_gian)
    if (d && d >= filterStart && d <= filterEnd) {
      const displayTime = formatDisplayTime(r.thoi_gian)
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}`
      const key = `${dateStr}|${displayTime.period}`
      if (!reportMap.has(key)) {
        reportMap.set(key, [])
      }
      reportMap.get(key).push(r)
    }
  })

  const overloaded = []
  reportMap.forEach((tasks, key) => {
    if (tasks.length >= 2) {
      const [dateStr, period] = key.split('|')
      const [dd, mm, yyyy] = dateStr.split('/')
      const d = new Date(yyyy, mm - 1, dd)
      overloaded.push({ date: d, period, tasks })
    }
  })
  overloaded.sort((a, b) => a.date - b.date || (a.period === 'Sáng' ? -1 : 1))
  overloadedPeriods.value = overloaded

  const tempDate = new Date(filterStart)
  tempDate.setHours(0,0,0,0)
  const finalDate = new Date(filterEnd)
  finalDate.setHours(23,59,59,999)
  
  const empty = []
  while (tempDate <= finalDate) {
    const d = new Date(tempDate)
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}`
    const dayOfWeek = d.getDay() 
    
    if (dayOfWeek !== 0) {
      if (!reportMap.has(`${dateStr}|Sáng`)) {
        empty.push({ date: d, period: 'Sáng', id: `${dateStr}|Sáng` })
      }
      if (dayOfWeek !== 6) {
        if (!reportMap.has(`${dateStr}|Chiều`)) {
          empty.push({ date: d, period: 'Chiều', id: `${dateStr}|Chiều` })
        }
      }
    }
    
    tempDate.setDate(tempDate.getDate() + 1)
  }
  emptyPeriodsForDistribute.value = empty

  // Reset selections when dates change
  selectedTasksToDistribute.value = []
  selectedEmptyPeriodsForDistribute.value = []
  assignedTaskIds.value = []
}

const openDistributeModal = () => {
  let startDate, endDate;
  
  if (filters.value.filterMode === 'day') {
    startDate = new Date(filters.value.dateFrom);
    endDate = new Date(filters.value.dateTo);
  } else if (filters.value.filterMode === 'month') {
    const [y, m] = filters.value.monthFrom.split('-');
    startDate = new Date(Number(y), Number(m) - 1, 1);
    const [ye, me] = filters.value.monthTo.split('-');
    endDate = new Date(Number(ye), Number(me), 0);
  } else {
    startDate = new Date(Number(filters.value.yearFrom), 0, 1);
    endDate = new Date(Number(filters.value.yearTo), 11, 31);
  }
  
  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
    distributeFilterDateFrom.value = formatToYYYYMMDD(startDate);
    distributeFilterDateTo.value = formatToYYYYMMDD(endDate);
  }
  
  recalcDistributeTasks()
  
  distributeStep.value = 1
  isDistributeModalOpen.value = true
}

const maxTasksToDistribute = computed(() => emptyPeriodsForDistribute.value.length)
const isTaskSelectionFull = computed(() => selectedTasksToDistribute.value.length >= maxTasksToDistribute.value)

const isTaskDisabled = (task, period) => {
  if (selectedTasksToDistribute.value.some(t => t.id === task.id)) return false;
  if (isTaskSelectionFull.value) return true;
  
  const selectedFromPeriodCount = period.tasks.filter(pt => selectedTasksToDistribute.value.some(st => st.id === pt.id)).length;
  if (selectedFromPeriodCount >= period.tasks.length - 1) return true;
  
  return false;
}

const toggleTaskDistribute = (task, period) => {
  if (isTaskDisabled(task, period) && !selectedTasksToDistribute.value.some(t => t.id === task.id)) {
    return;
  }

  const idx = selectedTasksToDistribute.value.findIndex(t => t.id === task.id)
  if (idx >= 0) {
    selectedTasksToDistribute.value.splice(idx, 1)
  } else {
    selectedTasksToDistribute.value.push(task)
  }
}

const maxEmptySlots = computed(() => selectedTasksToDistribute.value.length)

const isEmptySlotFull = computed(() => selectedEmptyPeriodsForDistribute.value.length >= maxEmptySlots.value)

const toggleEmptyPeriodDistribute = (periodId) => {
  if (distributeStep.value === 2) {
    // Chế độ gán nhanh khi click: Lấy công việc đầu tiên chưa được phân công
    const unassignedTask = selectedTasksToDistribute.value.find(t => !assignedTaskIds.value.includes(t.id))
    
    if (unassignedTask) {
      assignTaskToPeriod(unassignedTask.id, periodId)
    } else {
      alert("Tất cả công việc đã được phân công!")
    }
  } else {
    // Chế độ cũ (nếu có dùng cho giao diện khác)
    const idx = selectedEmptyPeriodsForDistribute.value.indexOf(periodId)
    if (idx >= 0) {
      selectedEmptyPeriodsForDistribute.value.splice(idx, 1)
    } else {
      if (selectedEmptyPeriodsForDistribute.value.length >= maxEmptySlots.value) return
      selectedEmptyPeriodsForDistribute.value.push(periodId)
    }
  }
}

const selectAllEmptyPeriods = () => {
  if (selectedEmptyPeriodsForDistribute.value.length > 0) {
    selectedEmptyPeriodsForDistribute.value = []
  } else {
    // Chỉ chọn tối đa = số việc
    selectedEmptyPeriodsForDistribute.value = emptyPeriodsForDistribute.value.slice(0, maxEmptySlots.value).map(p => p.id)
  }
}

const distributeStep2ViewMode = ref('calendar')

const distributeDaysCalendar = computed(() => {
  if (!distributeFilterDateFrom.value || !distributeFilterDateTo.value) return [];
  const result = [];
  
  const start = new Date(distributeFilterDateFrom.value);
  start.setHours(0,0,0,0);
  const end = new Date(distributeFilterDateTo.value);
  end.setHours(23,59,59,999);
  
  let currMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  
  while (currMonth <= endMonth) {
    const year = currMonth.getFullYear();
    const month = currMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
    
    // Adjust firstDayOfWeek if we want Monday to be first (0 = Monday, 6 = Sunday)
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null); // empty padding
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      // Only include if dateObj is within search range
      const inRange = dateObj >= start && dateObj <= end;
      
      const dayOfWeek = dateObj.getDay();
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      
      const dateStr = `${String(d).padStart(2, '0')}/${String(month+1).padStart(2, '0')}/${year}`;
      const emptyMorning = emptyPeriodsForDistribute.value.find(e => e.id === `${dateStr}|Sáng`);
      const emptyAfternoon = emptyPeriodsForDistribute.value.find(e => e.id === `${dateStr}|Chiều`);
      
      days.push({
        date: dateObj,
        dayNum: d,
        inRange,
        isSunday,
        isSaturday,
        emptyMorning: emptyMorning || null,
        emptyAfternoon: emptyAfternoon || null
      });
    }
    
    result.push({
      year,
      month: month + 1,
      days
    });
    
    currMonth.setMonth(currMonth.getMonth() + 1);
  }
  
  return result;
});

const nextDistributeStep = () => {
  if (selectedTasksToDistribute.value.length === 0) {
    alert("Vui lòng chọn ít nhất 1 việc để chia.")
    return
  }
  distributeStep.value = 2
}
const onTaskDragStart = (task, event) => {
  event.dataTransfer.setData('taskId', task.id)
  event.dataTransfer.effectAllowed = 'move'
  setTimeout(() => {
    if (event.target && event.target.style) {
      event.target.style.boxShadow = '0 0 15px rgba(16,185,129,0.3)'
    }
  }, 0)
}

const onTaskDragEnd = (event) => {
  if (event.target && event.target.style) {
    event.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)'
  }
}

const assignTaskToPeriod = (taskId, periodId) => {
  const task = selectedTasksToDistribute.value.find(t => t.id === taskId)
  const period = emptyPeriodsForDistribute.value.find(p => p.id === periodId)
  
  if (!task || !period) return
  
  try {
    const d = new Date(period.date)
    const hour = period.period === 'Sáng' ? '08' : '14'
    const minute = '00'
    const dayOfWeek = d.getDay()
    const thu = dayOfWeek === 0 ? 8 : dayOfWeek + 1
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    
    const newThoiGian = `${hour}:${minute} /${thu} /${dd}/${mm}/${yyyy}`
    
    // Cập nhật Optimistic UI lập tức
    const reportInList = reports.value.find(r => r.id === task.id)
    if (reportInList) {
      reportInList.thoi_gian = newThoiGian
    }
    
    // Thêm hiệu ứng thành công
    successDropPeriods.value.push(periodId)
    
    // Đánh dấu là đã phân công và lưu lại lịch cũ
    assignedTaskIds.value.push(task.id)
    if (!task.old_thoi_gian) {
      task.old_thoi_gian = task.thoi_gian
    }
    task.thoi_gian = newThoiGian
    
    setTimeout(() => {
      // Xoá hiệu ứng và xoá buổi trống khỏi lịch
      successDropPeriods.value = successDropPeriods.value.filter(id => id !== periodId)
      emptyPeriodsForDistribute.value = emptyPeriodsForDistribute.value.filter(p => p.id !== periodId)
      
      if (assignedTaskIds.value.length === selectedTasksToDistribute.value.length) {
        setTimeout(() => {
          alert("Đã chia xong tất cả công việc!")
          isDistributeModalOpen.value = false
          // Refresh full data after completely done
          fetchReports()
        }, 100)
      }
    }, 600)
    
    // Gửi data ngầm lên server (không await để không làm lag UI)
    const updatedReport = { ...task, thoi_gian: newThoiGian }
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', ...updatedReport })
    })
    .then(response => response.json())
    .then(result => {
      if (result.status !== 'success') {
        console.error('Lỗi cập nhật từ server', result)
      }
    })
    .catch(error => {
      console.error("Lỗi mạng khi chia việc:", error)
    })
  } catch (error) {
    console.error("Lỗi gán việc:", error)
  }
}

const onTaskDropToPeriod = (periodId, event) => {
  event.preventDefault()
  const taskId = event.dataTransfer.getData('taskId')
  if (taskId) {
    assignTaskToPeriod(taskId, periodId)
  }
}

const executeDistribute = async () => {
  if (selectedEmptyPeriodsForDistribute.value.length === 0) {
    alert("Vui lòng chọn ít nhất 1 buổi trống để nhận việc.")
    return
  }


  const emptyPeriods = emptyPeriodsForDistribute.value.filter(p => selectedEmptyPeriodsForDistribute.value.includes(p.id))
  
  distributeLoading.value = true
  try {
    for (let i = 0; i < selectedTasksToDistribute.value.length; i++) {
      const task = selectedTasksToDistribute.value[i]
      const period = emptyPeriods[i % emptyPeriods.length] 
      
      const d = new Date(period.date)
      const hour = period.period === 'Sáng' ? '08' : '14'
      const minute = '00'
      const dayOfWeek = d.getDay()
      const thu = dayOfWeek === 0 ? 8 : dayOfWeek + 1
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      
      // Format: "HH:MM /thu /DD/MM/YYYY"
      const newThoiGian = `${hour}:${minute} /${thu} /${dd}/${mm}/${yyyy}`
      
      // Cập nhật UI ngay (optimistic update)
      const reportInList = reports.value.find(r => r.id === task.id)
      if (reportInList) {
        reportInList.thoi_gian = newThoiGian
      }
      
      // Gửi lên Google Apps Script
      const updatedReport = { ...task, thoi_gian: newThoiGian }
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'update', ...updatedReport })
      })
      const result = await response.json()
      if (result.status !== 'success') {
        throw new Error(result.message || 'Lỗi cập nhật từ server')
      }
    }
    
    alert("Chia việc thành công!")
    isDistributeModalOpen.value = false
    await fetchReports()
  } catch (error) {
    console.error("Lỗi chia việc:", error)
    alert("Có lỗi xảy ra khi chia việc: " + error.message)
    await fetchReports() // Reload to get correct state
  } finally {
    distributeLoading.value = false
  }
}

// ====== CHUYỂN VIỆC (MOVE TASKS) LOGIC ======
const isMoveModalOpen = ref(false)
const draggedMoveTask = ref(null)

const openMoveModal = () => {
  isMoveModalOpen.value = true
}

const moveDaysCalendar = computed(() => {
  let startStr, endStr;
  if (filters.value.filterMode === 'day') {
    startStr = filters.value.dateFrom;
    endStr = filters.value.dateTo;
  } else if (filters.value.filterMode === 'month') {
    startStr = `${filters.value.monthFrom}-01`;
    const [y, m] = filters.value.monthTo.split('-');
    const lastDay = new Date(y, m, 0).getDate();
    endStr = `${filters.value.monthTo}-${lastDay}`;
  } else {
    startStr = `${filters.value.yearFrom}-01-01`;
    endStr = `${filters.value.yearTo}-12-31`;
  }

  if (!startStr || !endStr) {
    const today = new Date();
    startStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    endStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()}`;
  }

  const result = [];
  
  const start = new Date(startStr);
  start.setHours(0,0,0,0);
  const end = new Date(endStr);
  end.setHours(23,59,59,999);
  
  let currMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  
  while (currMonth <= endMonth) {
    const year = currMonth.getFullYear();
    const month = currMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const inRange = dateObj >= start && dateObj <= end;
      
      const dayOfWeek = dateObj.getDay();
      const isSunday = dayOfWeek === 0;
      const dateStr = `${String(d).padStart(2, '0')}/${String(month+1).padStart(2, '0')}/${year}`;
      
      const morningTasks = reports.value.filter(r => {
        const rd = parseDateFromReport(r.thoi_gian);
        if (!rd) return false;
        const rdStr = `${String(rd.getDate()).padStart(2, '0')}/${String(rd.getMonth()+1).padStart(2, '0')}/${rd.getFullYear()}`;
        return rdStr === dateStr && rd.getHours() < 12;
      });
      
      const afternoonTasks = reports.value.filter(r => {
        const rd = parseDateFromReport(r.thoi_gian);
        if (!rd) return false;
        const rdStr = `${String(rd.getDate()).padStart(2, '0')}/${String(rd.getMonth()+1).padStart(2, '0')}/${rd.getFullYear()}`;
        return rdStr === dateStr && rd.getHours() >= 12;
      });
      
      days.push({
        date: dateObj,
        dayNum: d,
        inRange,
        isSunday,
        morningTasks,
        afternoonTasks,
        dateStr
      });
    }
    
    result.push({ year, month: month + 1, days });
    currMonth.setMonth(currMonth.getMonth() + 1);
  }
  return result;
});

const successDropTaskId = ref(null);

const onMoveTaskDragStart = (e, task) => {
  draggedMoveTask.value = task;
  e.dataTransfer.effectAllowed = 'move';
  // Required for Firefox
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', task.id);
  }
};

const onMoveTaskDrop = async (e, dateStr, period) => {
  if (!draggedMoveTask.value) return;
  const task = draggedMoveTask.value;
  draggedMoveTask.value = null;
  
  const [d, m, y] = dateStr.split('/');
  const targetDate = new Date(`${y}-${m}-${d}`);
  
  const hour = period === 'Sáng' ? '08' : '14';
  const minute = '00';
  const dayOfWeek = targetDate.getDay();
  const thu = dayOfWeek === 0 ? 8 : dayOfWeek + 1;
  const newThoiGian = `${hour}:${minute} /${thu} /${d}/${m}/${y}`;
  
  const td = parseDateFromReport(task.thoi_gian);
  if (!td) return;
  const oldDateStr = `${String(td.getDate()).padStart(2, '0')}/${String(td.getMonth()+1).padStart(2, '0')}/${td.getFullYear()}`;
  const oldPeriod = td.getHours() < 12 ? 'Sáng' : 'Chiều';
  
  // Do nothing if dropping in same slot
  if (oldDateStr === dateStr && oldPeriod === period) return; 
  
  try {
    const updatedTask = { ...task, thoi_gian: newThoiGian };
    
    // Optimistic UI Update
    const idx = reports.value.findIndex(r => r.id === task.id);
    if (idx !== -1) {
      reports.value[idx].thoi_gian = updatedTask.thoi_gian;
    }
    
    // Add success animation
    successDropTaskId.value = task.id;
    setTimeout(() => {
      if (successDropTaskId.value === task.id) {
        successDropTaskId.value = null;
      }
    }, 800);
    
    // Background API Sync
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', ...updatedTask })
    }).catch(e => {
      console.error("API Update Move Task error:", e);
      alert("Đồng bộ server thất bại, vui lòng tải lại trang.");
    });
    
  } catch (error) {
    console.error(error);
  }
};

const emptyDaysCalendar = computed(() => {
  if (!emptyDaysStartDate.value || !emptyDaysEndDate.value) return [];
  const result = [];
  
  const start = new Date(emptyDaysStartDate.value);
  start.setHours(0,0,0,0);
  const end = new Date(emptyDaysEndDate.value);
  end.setHours(23,59,59,999);
  
  let currMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  
  while (currMonth <= endMonth) {
    const year = currMonth.getFullYear();
    const month = currMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
    
    // Adjust firstDayOfWeek if we want Monday to be first (0 = Monday, 6 = Sunday)
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null); // empty padding
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      // Only include if dateObj is within search range
      const inRange = dateObj >= start && dateObj <= end;
      
      const dayOfWeek = dateObj.getDay();
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      
      const dateStr = `${String(d).padStart(2, '0')}/${String(month+1).padStart(2, '0')}/${year}`;
      
      const emptyMorning = emptyDays.value.find(e => e.id === `${dateStr}|Sáng`);
      const emptyAfternoon = emptyDays.value.find(e => e.id === `${dateStr}|Chiều`);
      
      days.push({
        date: dateObj,
        dayNum: d,
        inRange,
        isSunday,
        isSaturday,
        emptyMorning: !!emptyMorning,
        emptyAfternoon: !!emptyAfternoon
      });
    }
    
    result.push({
      year,
      month: month + 1,
      days
    });
    
    currMonth.setMonth(currMonth.getMonth() + 1);
  }
  return result;
});

const getThuText = (date) => {
  const day = date.getDay();
  return day === 0 ? 'Chủ Nhật' : `Thứ ${day + 1}`;
}

const formatDateDMY = (date) => {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

const formatToYYYYMMDD = (d) => {
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const showEmptyDays = () => {
  let startDate, endDate;
  
  if (filters.value.filterMode === 'day') {
    startDate = new Date(filters.value.dateFrom);
    endDate = new Date(filters.value.dateTo);
  } else if (filters.value.filterMode === 'month') {
    const [y, m] = filters.value.monthFrom.split('-');
    startDate = new Date(Number(y), Number(m) - 1, 1);
    const [ye, me] = filters.value.monthTo.split('-');
    endDate = new Date(Number(ye), Number(me), 0);
  } else {
    startDate = new Date(Number(filters.value.yearFrom), 0, 1);
    endDate = new Date(Number(filters.value.yearTo), 11, 31);
  }
  
  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
    emptyFilterDateFrom.value = formatToYYYYMMDD(startDate);
    emptyFilterDateTo.value = formatToYYYYMMDD(endDate);
  }
  
  emptyDaysViewMode.value = 'list';
  recalcEmptyDays();
  isEmptyDaysModalOpen.value = true;
};

const recalcEmptyDays = () => {
  try {
    if (!emptyFilterDateFrom.value || !emptyFilterDateTo.value) return;

    const startDate = new Date(emptyFilterDateFrom.value);
    const endDate = new Date(emptyFilterDateTo.value);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      alert("Vui lòng chọn khoảng thời gian hợp lệ.");
      return;
    }

    const currentReports = reports.value || [];
    const workReports = currentReports.filter(r => r.phan_loai === 'CÔNG VIỆC');
    
    const reportSlots = new Set();
    workReports.forEach(r => {
      const d = parseDateFromReport(r.thoi_gian);
      if (d) {
        const displayTime = formatDisplayTime(r.thoi_gian);
        const dateStr = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
        reportSlots.add(`${dateStr}|${displayTime.period}`);
      }
    });
    
    const tempDate = new Date(startDate);
    tempDate.setHours(0,0,0,0);
    const finalDate = new Date(endDate);
    finalDate.setHours(23,59,59,999);
    
    emptyDaysStartDate.value = new Date(tempDate);
    emptyDaysEndDate.value = new Date(finalDate);
    
    const slots = [];
    while (tempDate <= finalDate) {
      const dateStr = `${tempDate.getDate()}/${tempDate.getMonth()+1}/${tempDate.getFullYear()}`;
      const paddedDateStr = `${String(tempDate.getDate()).padStart(2, '0')}/${String(tempDate.getMonth()+1).padStart(2, '0')}/${tempDate.getFullYear()}`;
      const dayOfWeek = tempDate.getDay(); 
      
      if (dayOfWeek !== 0) {
        if (!reportSlots.has(`${dateStr}|Sáng`)) {
          slots.push({ date: new Date(tempDate), period: 'Sáng', id: `${paddedDateStr}|Sáng` });
        }
        if (dayOfWeek !== 6) {
          if (!reportSlots.has(`${dateStr}|Chiều`)) {
            slots.push({ date: new Date(tempDate), period: 'Chiều', id: `${paddedDateStr}|Chiều` });
          }
        }
      }
      
      tempDate.setDate(tempDate.getDate() + 1);
      if (slots.length > 1000) break;
    }
    
    emptyDays.value = slots;
  } catch (error) {
    console.error("Lỗi recalcEmptyDays:", error);
    alert("Có lỗi xảy ra khi tính toán lịch trống.");
  }
}

const exportExcel = () => {
  exportInputs.value.month = String(new Date().getMonth() + 1).padStart(2, '0');
  exportInputs.value.year = String(new Date().getFullYear());
  isExportModalOpen.value = true;
}

const doExportExcel = () => {
  const exportMonth = exportInputs.value.month;
  const exportYear = exportInputs.value.year;
  isExportModalOpen.value = false;

  const excelData = [
    ['BẢNG THEO DÕI CÔNG VIỆC', '', '', ''],
    [`THÁNG ${exportMonth}/${exportYear}`, '', '', ''],
    ['Công ty: Cổ Phần Tích Hợp Hệ Thống Nam Trường Sơn', '', '', ''],
    ['Nhân viên:  LÊ PHI SƠN', '', '', ''],
    ['', '', '', ''],
    ['Ngày', 'Thứ', 'Buổi sáng ', 'Buổi chiều']
  ];

  const daysInExportMonth = new Date(Number(exportYear), Number(exportMonth), 0).getDate();

  for (let d = 1; d <= daysInExportMonth; d++) {
    const dateObj = new Date(Number(exportYear), Number(exportMonth) - 1, d);
    const jsDay = dateObj.getDay();
    const thuStr = jsDay === 0 ? 'CN' : String(jsDay + 1);

    const targetDateStr = `${String(d).padStart(2, '0')}/${String(exportMonth).padStart(2, '0')}/${exportYear}`;
    
    const dayReports = reports.value.filter(r => 
      r.phan_loai === 'CÔNG VIỆC' && r.thoi_gian.includes(targetDateStr)
    );

    let morningTasks = [];
    let afternoonTasks = [];

    dayReports.forEach(r => {
      const parts = r.thoi_gian.split(' /');
      if (parts.length > 0) {
        const timePart = parts[0];
        const [h, m] = timePart.split(':');
        const hour = parseInt(h, 10) || 0;
        const minute = parseInt(m, 10) || 0;
        const timeVal = hour + minute / 60;
        
        if (timeVal >= 4 && timeVal <= 12) {
          morningTasks.push(r.noi_dung);
        } else if (timeVal > 12 && timeVal <= 19) {
          afternoonTasks.push(r.noi_dung);
        }
      }
    });

    excelData.push([
      d,
      thuStr,
      morningTasks.length > 0 ? morningTasks.join('\n') : '',
      afternoonTasks.length > 0 ? afternoonTasks.join('\n') : ''
    ]);
  }

  // Footer: 4 dòng liên tục có border, merge 4 cột
  const footerStartRow = excelData.length;
  excelData.push(['Nhận xét của Trưởng bộ phận', '', '', '']);
  excelData.push(['', '', '', '']);
  excelData.push(['Nhận xét của BGĐ', '', '', '']);
  excelData.push(['', '', '', '']);

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  
  // Định dạng style
  const borderAll = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" }
  };

  const titleStyle = { font: { bold: true, sz: 14, name: "Arial" }, alignment: { horizontal: "center", vertical: "center" } };
  const subtitleStyle = { font: { bold: true, sz: 12, name: "Arial" }, alignment: { horizontal: "center", vertical: "center" } };
  const infoStyle = { font: { bold: true, sz: 12, name: "Arial" }, alignment: { horizontal: "left", vertical: "center" } };
  const headerStyle = { font: { bold: true, sz: 12, name: "Arial" }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border: borderAll };
  const dateStyle = { font: { sz: 12, name: "Arial" }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border: borderAll };
  const contentStyle = { font: { sz: 12, name: "Arial" }, alignment: { horizontal: "left", vertical: "center", wrapText: true }, border: borderAll };
  const contentEmptyStyle = { font: { sz: 12, name: "Arial" }, alignment: { horizontal: "left", vertical: "center", wrapText: true }, border: borderAll, fill: { fgColor: { rgb: "B8CCE4" } } };
  const footerLabelStyle = { font: { bold: true, sz: 12, name: "Arial" }, alignment: { horizontal: "left", vertical: "center" }, border: borderAll };
  const footerEmptyStyle = { font: { sz: 12, name: "Arial" }, border: borderAll };

  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };
      
      const cell = ws[cellAddress];
      if (R === 0) cell.s = titleStyle;
      else if (R === 1) cell.s = subtitleStyle;
      else if (R === 2 || R === 3) cell.s = infoStyle;
      else if (R === 5) cell.s = headerStyle;
      else if (R > 5 && R <= 5 + daysInExportMonth) {
        if (C === 0 || C === 1) cell.s = dateStyle;
        else {
          // Cột buổi sáng / buổi chiều: trống thì tô màu xanh nhạt
          cell.s = (!cell.v || cell.v === '') ? contentEmptyStyle : contentStyle;
        }
      } else if (R >= footerStartRow) {
        // Footer rows: tất cả đều có border
        if (R === footerStartRow || R === footerStartRow + 2) {
          cell.s = footerLabelStyle; // Dòng có text: in đậm + border
        } else {
          cell.s = footerEmptyStyle; // Dòng trống: chỉ border
        }
      }
    }
  }

  // Gộp ô (Merge cells)
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }, // Subtitle
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }, // Info 1
    { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } }, // Info 2
    // Footer: merge 4 dòng
    { s: { r: footerStartRow, c: 0 }, e: { r: footerStartRow, c: 3 } },
    { s: { r: footerStartRow + 1, c: 0 }, e: { r: footerStartRow + 1, c: 3 } },
    { s: { r: footerStartRow + 2, c: 0 }, e: { r: footerStartRow + 2, c: 3 } },
    { s: { r: footerStartRow + 3, c: 0 }, e: { r: footerStartRow + 3, c: 3 } },
  ];

  ws['!cols'] = [
    { wch: 8 }, 
    { wch: 8 }, 
    { wch: 60 }, 
    { wch: 60 }  
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Báo Cáo");
  
  XLSX.writeFile(wb, `Bao_Cao_Cong_Viec_${exportMonth}_${exportYear}.xlsx`);
}

onMounted(() => {
  fetchReports()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
/* =========================================
   THIẾT KẾ: MODERN, CLEAN & PREMIUM 
   Dựa trên CSS thuần, với Micro-animations
========================================= */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

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
  background: linear-gradient(180deg, rgba(248,250,252,0.6) 0%, white 100%);
}

.elite-modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.elite-modal-title svg {
  color: #4f46e5;
}

.elite-modal-title h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.elite-btn-close {
  background: #f1f5f9;
  color: #64748b;
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
  background: #e2e8f0;
  color: #0f172a;
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

/* Modal Actions */
.elite-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
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
  .mobile-action-btn.add .icon-white-bg {
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
  .mobile-action-btn.add {
    order: 2;
    flex-basis: 100%;
    flex-direction: row;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    box-shadow: 0 4px 15px -2px rgba(37, 99, 235, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3);
    border-radius: 14px;
  }
  .mobile-action-btn.add:active {
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
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

/* VIP Pro styling cho cột Hoàn thành */
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
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.25);
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
  font-size: 0.92rem; font-weight: 600; color: #0f172a;
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
  border-color: #22c55e !important;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3) !important;
  transition: all 0.5s ease;
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
.elite-input:focus {
  border-color: #34d399;
  background: white;
  outline: none;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.08), 0 2px 8px -2px rgba(16, 185, 129, 0.12);
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
  border-color: #a855f7 !important;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15) !important;
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
  color: #a855f7 !important;
}
.elite-modal.dark-mode-modal .elite-modal-header {
  border-bottom-color: rgba(255, 255, 255, 0.08) !important;
  background: rgba(15, 23, 42, 0.4) !important;
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
  color: #94a3b8 !important;
}
.elite-modal.dark-mode-modal .elite-btn-close:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #f8fafc !important;
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
  background: rgba(255, 255, 255, 0.1) !important;
  color: #cbd5e1 !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
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
</style>

