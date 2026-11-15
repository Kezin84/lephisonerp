<template>
  <div class="qlbg-page" :class="{ 'theme-light-blue': uiTheme === 'light' }">
    <!-- TOPBAR ĐỒNG BỘ CHUẨN HỆ THỐNG FIREBASE -->
    <header class="bg-topbar">
      <div class="bg-topbar-left">
        <div class="bg-brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="bg-title-wrap">
          <div class="bg-title-row">
            <h1 class="bg-title">Quản Lý Báo Giá</h1>
            <span class="bg-count-pill tabular-nums">
              {{ totalGroups }} nhóm · {{ filteredContracts.length }} bản
            </span>
          </div>
        </div>
      </div>

      <div class="bg-topbar-right">
        <!-- Segmented: Giá Hợp Đồng / Giá Khách -->
        <div class="qlbg-seg-group" role="tablist" aria-label="Chế độ hiển thị giá">
          <button
            type="button"
            class="qlbg-seg-btn"
            :class="{ active: priceViewMode === 'hd' }"
            @click="priceViewMode = 'hd'"
            title="Hiển thị các chỉ số theo Giá hợp đồng (bao gồm chênh lệch COM)"
          >
            <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>Giá HĐ</span>
          </button>
          <button
            type="button"
            class="qlbg-seg-btn is-khach"
            :class="{ active: priceViewMode === 'khach' }"
            @click="priceViewMode = 'khach'"
            title="Hiển thị các chỉ số theo Giá khách thực tế"
          >
            <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Giá Khách</span>
          </button>
        </div>

        <!-- Segmented: Card / Table -->
        <div class="qlbg-seg-group hide-xs" role="tablist" aria-label="Chế độ bố cục">
          <button
            type="button"
            class="qlbg-seg-btn is-icon-only"
            :class="{ active: layoutMode === 'card' }"
            @click="layoutMode = 'card'"
            title="Xem dạng Thẻ nhóm phiên bản"
          >
            <svg width="14.5" height="14.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
            <span class="hide-md">Thẻ nhóm</span>
          </button>
          <button
            type="button"
            class="qlbg-seg-btn is-icon-only"
            :class="{ active: layoutMode === 'table' }"
            @click="layoutMode = 'table'"
            title="Xem dạng Bảng gọn mật độ cao"
          >
            <svg width="14.5" height="14.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            <span class="hide-md">Bảng gọn</span>
          </button>
        </div>

        <!-- Theme Toggle -->
        <button
          type="button"
          class="qlbg-icon-btn"
          @click="toggleUiTheme"
          :title="uiTheme === 'dark' ? 'Chuyển sang giao diện Sáng (Light Blue)' : 'Chuyển sang giao diện Tối (Dark Navy)'"
        >
          <svg v-if="uiTheme === 'dark'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>

        <!-- Refresh -->
        <button
          type="button"
          class="qlbg-icon-btn"
          :disabled="loading"
          @click="fetchData(true)"
          title="Đồng bộ lại dữ liệu"
        >
          <svg :class="{ 'is-spin': loading }" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>

        <!-- Primary Create Quote CTA -->
        <button type="button" class="qlbg-btn-primary" @click="goCreateNewQuote">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Tạo báo giá</span>
        </button>
      </div>
    </header>

    <!-- DẢI 4 THẺ BENTO KPI -->
    <section class="qlbg-kpi-grid">
      <button
        type="button"
        class="qlbg-kpi-card is-sky"
        :class="{ active: dashboardFilter === 'ALL' }"
        @click="dashboardFilter = 'ALL'"
      >
        <div class="kpi-head">
          <span class="kpi-label">Tổng Nhóm Báo Giá</span>
          <span class="kpi-icon is-sky">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </span>
        </div>
        <div class="kpi-val tabular-nums">{{ totalGroups }}</div>
        <div class="kpi-sub tabular-nums">{{ filteredContracts.length }} phiên bản lưu trữ</div>
      </button>

      <button
        type="button"
        class="qlbg-kpi-card is-amber"
        :class="{ active: dashboardFilter === 'PROCESSING' }"
        @click="dashboardFilter = dashboardFilter === 'PROCESSING' ? 'ALL' : 'PROCESSING'"
      >
        <div class="kpi-head">
          <span class="kpi-label">Đang Xử Lý (Bản Tạm)</span>
          <span class="kpi-icon is-amber">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </span>
        </div>
        <div class="kpi-val tabular-nums">{{ processingGroups }}</div>
        <div class="kpi-sub tabular-nums">{{ formatCompactVND(kpiMetrics.draftSauThue) }} đang thương thảo</div>
      </button>

      <button
        type="button"
        class="qlbg-kpi-card is-emerald"
        :class="{ active: dashboardFilter === 'COMPLETED' }"
        @click="dashboardFilter = dashboardFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED'"
      >
        <div class="kpi-head">
          <span class="kpi-label">Chính Thức (Đã Chốt PO)</span>
          <span class="kpi-icon is-emerald">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </span>
        </div>
        <div class="kpi-val tabular-nums">{{ completedGroups }}</div>
        <div class="kpi-sub tabular-nums">Tỷ lệ chốt {{ kpiMetrics.winRate }}%</div>
      </button>

      <div class="qlbg-kpi-card is-summary">
        <div class="kpi-head">
          <span class="kpi-label">
            Doanh Số Lọc ({{ priceViewMode === 'hd' ? 'Giá HĐ' : 'Giá Khách' }})
          </span>
          <span v-if="kpiMetrics.totalNetCom > 0" class="kpi-com-pill tabular-nums" title="Tổng Net COM / Còn lại của các bản mới nhất đang hiển thị">
            COM: {{ formatCompactVND(kpiMetrics.totalNetCom) }}
          </span>
        </div>
        <div class="kpi-val is-money tabular-nums">{{ formatVND(kpiMetrics.activeSauThue) }}<small>đ</small></div>
        <div class="kpi-sub tabular-nums">Trước thuế: {{ formatVND(kpiMetrics.activeTruocThue) }} đ</div>
      </div>
    </section>

    <!-- THANH BỘ LỌC HỢP NHẤT -->
    <section class="qlbg-filter-bar">
      <div class="qlbg-filter-row-main">
        <!-- Ô tìm kiếm đa năng -->
        <div class="qlbg-search-box">
          <svg class="qlbg-search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="searchKeyword"
            type="text"
            class="qlbg-search-input"
            placeholder="Tìm mã HĐ, số PO, khách hàng, công ty, MST, nội dung PO, tên hàng/SKU..."
          />
          <button
            v-if="searchKeyword"
            type="button"
            class="qlbg-search-clear"
            @click="searchKeyword = ''"
          >
            Xóa
          </button>
        </div>

        <!-- Nút mở Modal lọc Khách hàng -->
        <button
          type="button"
          class="qlbg-picker-btn"
          :class="{ 'is-active': customerFilter !== 'ALL' }"
          @click="openCustomerModal"
        >
          <svg width="14.5" height="14.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span class="picker-btn-text">{{ selectedCustomerLabel }}</span>
          <span
            v-if="customerFilter !== 'ALL'"
            class="picker-clear-dot"
            title="Bỏ lọc khách hàng"
            @click.stop="customerFilter = 'ALL'"
          >✕</span>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.65; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        <!-- Sắp xếp -->
        <div class="qlbg-select-wrap">
          <svg class="qlbg-select-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
          <select v-model="sortMode" class="qlbg-select">
            <option value="DESC">Ngày tạo: Mới → Cũ</option>
            <option value="ASC">Ngày tạo: Cũ → Mới</option>
            <option value="AMOUNT_DESC">Giá trị: Cao → Thấp</option>
            <option value="AMOUNT_ASC">Giá trị: Thấp → Cao</option>
          </select>
        </div>

        <!-- Thu gọn / Mở rộng nhóm -->
        <button
          v-if="layoutMode === 'card' && displayedGroupedContracts.length > 0"
          type="button"
          class="qlbg-ghost-btn hide-xs"
          @click="toggleAllGroupsCollapse"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            <polyline v-if="areAllGroupsCollapsed" points="6 9 12 15 18 9"/>
            <polyline v-else points="18 15 12 9 6 15"/>
          </svg>
          <span>{{ areAllGroupsCollapsed ? 'Mở rộng nhóm' : 'Thu gọn nhóm' }}</span>
        </button>

        <!-- Đặt lại bộ lọc -->
        <button
          v-if="hasActiveFilters"
          type="button"
          class="qlbg-reset-btn"
          @click="resetAllFilters"
        >
          <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <span>Đặt lại</span>
        </button>
      </div>

      <!-- Dải lọc nhanh thời gian -->
      <div class="qlbg-filter-row-sub">
        <div class="qlbg-date-chips">
          <span class="date-chip-label">Thời gian:</span>
          <button
            v-for="opt in dateQuickOptions"
            :key="opt.value"
            type="button"
            class="qlbg-date-chip"
            :class="{ active: dateQuickRange === opt.value }"
            @click="setDateQuickRange(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>

        <div v-if="dateQuickRange === 'custom'" class="qlbg-custom-dates">
          <label class="custom-date-field">
            <span>Từ</span>
            <input v-model="customDateFrom" type="date" :max="customDateTo || undefined" />
          </label>
          <span class="custom-date-sep">→</span>
          <label class="custom-date-field">
            <span>Đến</span>
            <input v-model="customDateTo" type="date" :min="customDateFrom || undefined" />
          </label>
        </div>

        <!-- Mobile Layout Toggle -->
        <div class="qlbg-mobile-layout-toggle show-xs-flex">
          <button type="button" class="qlbg-date-chip" :class="{ active: layoutMode === 'card' }" @click="layoutMode = 'card'">Thẻ</button>
          <button type="button" class="qlbg-date-chip" :class="{ active: layoutMode === 'table' }" @click="layoutMode = 'table'">Bảng</button>
        </div>
      </div>
    </section>

    <!-- LOADING SKELETON -->
    <div v-if="loading && contracts.length === 0" class="qlbg-skeleton-wrap">
      <div class="qlbg-skeleton-bar"></div>
      <div class="qlbg-cards-grid">
        <div v-for="n in 6" :key="'sk-' + n" class="qlbg-skeleton-card">
          <div class="sk-top"></div>
          <div class="sk-body">
            <div class="sk-line w75"></div>
            <div class="sk-line w55"></div>
            <div class="sk-box"></div>
          </div>
          <div class="sk-foot"></div>
        </div>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="!hasAnyDisplayedData" class="qlbg-empty-state">
      <div class="empty-ico">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
      </div>
      <h3>Không tìm thấy báo giá phù hợp</h3>
      <p>Thử điều chỉnh từ khóa, khoảng thời gian hoặc tạo báo giá mới cho khách hàng.</p>
      <div class="empty-actions">
        <button v-if="hasActiveFilters" type="button" class="qlbg-ghost-btn" @click="resetAllFilters">Xóa toàn bộ bộ lọc</button>
        <button type="button" class="qlbg-btn-primary" @click="goCreateNewQuote">+ Tạo báo giá mới</button>
      </div>
    </div>

    <!-- =========================================================
         CHẾ ĐỘ 1: XEM DẠNG THẺ NHÓM PHIÊN BẢN & THẺ LẺ (CARD VIEW)
    ========================================================== -->
    <div v-else-if="layoutMode === 'card'" class="qlbg-content-stack">
      <!-- NHÓM BÁO GIÁ CÓ NHIỀU PHIÊN BẢN / HỢP ĐỒNG GỐC -->
      <div v-if="paginatedGroupedContracts.length > 0" class="qlbg-groups-list">
        <section
          v-for="group in paginatedGroupedContracts"
          :key="group.goc"
          class="qlbg-group-block"
          :class="{ 'is-group-official': isGroupCompleted(group) }"
        >
          <!-- Group Header tinh tế (bỏ hoàn toàn dải vàng cũ) -->
          <div class="qlbg-group-header" @click="toggleGroup(group.goc)">
            <div class="gh-left">
              <span class="gh-chevron" :class="{ 'is-collapsed': collapsedGroups[group.goc] }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
              <span class="gh-folder-ico" :class="isGroupCompleted(group) ? 'is-emerald' : 'is-amber'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </span>
              <div class="gh-titles">
                <div class="gh-title-main">
                  <span
                    class="gh-company"
                    v-html="highlightText(getCustomerInfo(group.latest.ma_khach_hang).tenCongTy || group.latest.ten_khach_hang || 'Chưa rõ khách hàng', searchKeyword)"
                  ></span>
                  <span
                    v-if="getCustomerInfo(group.latest.ma_khach_hang).tenCongTy && group.latest.ten_khach_hang"
                    class="gh-contact-sub"
                    v-html="'· ' + highlightText(group.latest.ten_khach_hang, searchKeyword)"
                  ></span>
                </div>
                <div class="gh-meta-row">
                  <span
                    v-if="group.latest.content_of_contract_po"
                    class="gh-po-content"
                    v-html="highlightText(group.latest.content_of_contract_po, searchKeyword)"
                  ></span>
                  <span class="gh-root-code tabular-nums">Gốc: {{ group.goc }}</span>
                </div>
              </div>
            </div>

            <div class="gh-right">
              <span v-if="getGroupOfficialPo(group)" class="gh-status-pill is-emerald tabular-nums">
                Đã chốt · PO #{{ getGroupOfficialPo(group) }}
              </span>
              <span v-else class="gh-status-pill is-amber">
                Đang thương thảo
              </span>
              <span class="gh-ver-count tabular-nums">{{ group.versions.length }} bản</span>
              <span class="gh-latest-amount tabular-nums">{{ formatVND(getContractSauThue(group.latest)) }} đ</span>
            </div>
          </div>

          <!-- Danh sách Card Phiên Bản trong nhóm -->
          <div v-show="!collapsedGroups[group.goc]" class="qlbg-cards-grid is-inside-group">
            <article
              v-for="(c, vIdx) in group.versions"
              :key="c.ma_hop_dong"
              class="qlbg-quote-card"
              :class="[c.is_completed ? 'is-official' : 'is-draft', { 'is-latest-ver': vIdx === 0 }]"
              @click="viewDetails(c)"
            >
              <div class="qc-top">
                <div class="qc-top-left">
                  <span v-if="c.so_po" class="qc-po-badge tabular-nums">PO #{{ c.so_po }}</span>
                </div>
                <div class="qc-top-right">
                  <span class="qc-date tabular-nums">{{ c.created_time || c.ngay_tao }}</span>
                  <button
                    v-if="!c.is_completed"
                    type="button"
                    class="qc-del-btn"
                    title="Xóa bản báo giá tạm này"
                    @click.stop="requestDeleteDraft(c)"
                  >
                    <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                  </button>
                </div>
              </div>

              <div class="qc-badges">
                <span class="qc-status-badge" :class="c.is_completed ? 'is-emerald' : 'is-amber'">
                  <span class="status-dot"></span>
                  {{ c.is_completed ? 'Chính thức' : 'Bản tạm' }}
                </span>
                <span v-if="getVersionNumberLabel(c)" class="qc-ver-tag tabular-nums">{{ getVersionNumberLabel(c) }}</span>
                <span v-if="vIdx === 0 && group.versions.length > 1" class="qc-latest-tag">Mới nhất</span>
                <button
                  v-if="!c.is_completed && isActiveOnSaleReportCraft(c)"
                  type="button"
                  class="qc-sr-active-pill"
                  title="Phiên bản này đang hiển thị trên Sale Report Tạm — bấm để mở"
                  @click.stop="openInSaleReport(c, true)"
                >
                  Đang hiện trên SR Tạm ↗
                </button>
                <button
                  v-else-if="canPinToSaleReportCraft(c)"
                  type="button"
                  class="qc-pin-sr-btn"
                  :disabled="pinningSrCraftMa === c.ma_hop_dong"
                  title="Chọn phiên bản này làm phương án đại diện trên Sale Report Tạm"
                  @click.stop="pinContractToSaleReportCraft(c)"
                >
                  {{ pinningSrCraftMa === c.ma_hop_dong ? 'Đang ghim...' : 'Đưa lên SR Tạm' }}
                </button>
              </div>

              <div class="qc-code-row">
                <span class="qc-code tabular-nums" v-html="highlightText(c.so_hop_dong || c.ma_hop_dong, searchKeyword)"></span>
                <span v-if="c.so_hop_dong && c.so_hop_dong !== c.ma_hop_dong" class="qc-sub-id tabular-nums">{{ c.ma_hop_dong }}</span>
              </div>

              <!-- Khối Khách Hàng: Tên công ty (chính, không khuyết) -> Tên KH -> MST -->
              <div class="qc-cust-list" @click.stop="openCustomerInfoModal(c.ma_khach_hang)" title="Xem thông tin khách hàng">
                <div v-if="getCustomerInfo(c.ma_khach_hang).tenCongTy" class="qc-cust-line is-company">
                  <svg class="qc-cust-ico" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/></svg>
                  <span class="qc-cust-text" v-html="highlightText(getCustomerInfo(c.ma_khach_hang).tenCongTy, searchKeyword)"></span>
                </div>
                <div class="qc-cust-line is-name">
                  <svg class="qc-cust-ico" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span class="qc-cust-text" v-html="highlightText(c.ten_khach_hang || getCustomerInfo(c.ma_khach_hang).tenKH || 'Chưa có người nhận', searchKeyword)"></span>
                </div>
                <div v-if="getCustomerInfo(c.ma_khach_hang).mst" class="qc-cust-line is-mst tabular-nums">
                  <svg class="qc-cust-ico" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
                  <span class="qc-cust-text">MST: <span v-html="highlightText(getCustomerInfo(c.ma_khach_hang).mst, searchKeyword)"></span></span>
                </div>
              </div>

              <!-- Nội dung PO / Ghi chú -->
              <div v-if="c.content_of_contract_po || c.ghi_chu" class="qc-content-note">
                <div v-if="c.content_of_contract_po" class="qc-po-line" :title="c.content_of_contract_po">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span v-html="highlightText(c.content_of_contract_po, searchKeyword)"></span>
                </div>
                <div v-if="c.ghi_chu" class="qc-note-line" :title="c.ghi_chu">
                  Ghi chú: <span v-html="highlightText(c.ghi_chu, searchKeyword)"></span>
                </div>
              </div>

              <!-- Khối Tài chính -->
              <div class="qc-fin-box">
                <div class="qc-fin-row">
                  <span>Chênh lệch giá</span>
                  <span
                    class="tabular-nums qc-fin-diff"
                    :class="c.chenh_lech_gia > 0 ? 'is-pos' : c.chenh_lech_gia < 0 ? 'is-neg' : ''"
                  >
                    {{ c.chenh_lech_gia > 0 ? '+' : '' }}{{ formatVND(c.chenh_lech_gia) }} đ
                  </span>
                </div>
                <div class="qc-fin-row">
                  <span>Còn lại</span>
                  <span class="tabular-nums qc-fin-val-strong">{{ formatVND(c.con_lai) }} đ</span>
                </div>
                <div class="qc-fin-discount">
                  <span>Tổng chiết khấu</span>
                  <strong class="tabular-nums">{{ formatVND(c.tong_chiet_khau) }} đ</strong>
                </div>

                <div class="qc-fin-row is-actual">
                  <span>Tổng giá thực tế</span>
                  <span class="tabular-nums">{{ formatVND(c.tong_truoc_thue_khach) }} đ</span>
                </div>
                <div class="qc-fin-row">
                  <span>Tổng tiền trước thuế ({{ priceViewMode === 'hd' ? 'HĐ' : 'Khách' }})</span>
                  <span class="tabular-nums">{{ formatVND(getContractTruocThue(c)) }} đ</span>
                </div>
                <div class="qc-fin-row">
                  <span>Thuế VAT</span>
                  <span class="tabular-nums">{{ formatVND(getContractVat(c)) }} đ</span>
                </div>
                <div class="qc-fin-total">
                  <span>Tổng tiền sau thuế</span>
                  <strong class="tabular-nums">{{ formatVND(getContractSauThue(c)) }} đ</strong>
                </div>

                <!-- Strip phụ: Công nợ / Số SP / File -->
                <div class="qc-meta-pills">
                  <span
                    v-if="getPaymentStatusBadge(c)"
                    class="qc-mini-pill tabular-nums"
                    :class="getPaymentStatusBadge(c)!.cls"
                  >
                    {{ getPaymentStatusBadge(c)!.label }}
                  </span>
                  <span class="qc-mini-pill is-slate tabular-nums">
                    {{ getContractItemCount(c.ma_hop_dong) }} SP
                  </span>
                  <span v-if="getTotalContractFilesCount(c) > 0" class="qc-mini-pill is-sky tabular-nums">
                    {{ getTotalContractFilesCount(c) }} file
                  </span>
                </div>
              </div>

              <!-- Thao tác chân Card -->
              <div class="qc-actions" @click.stop>
                <button type="button" class="qc-btn" @click="viewDetails(c)">Chi tiết</button>
                <button
                  type="button"
                  class="qc-btn"
                  :disabled="c.is_completed"
                  :title="c.is_completed ? 'Hợp đồng chính thức không thể sửa trực tiếp — hãy dùng Nhân bản' : 'Mở chỉnh sửa trong Tạo Báo Giá'"
                  @click="!c.is_completed && editContract(c)"
                >
                  Sửa
                </button>
                <button type="button" class="qc-btn" @click="duplicateContract(c)">Nhân bản</button>
                <button
                  v-if="c.is_completed"
                  type="button"
                  class="qc-btn is-sr-link"
                  title="Mở đơn hàng PO tương ứng trong Sale Report"
                  @click="openInSaleReport(c)"
                >
                  Sale Report ↗
                </button>
                <button
                  v-else
                  type="button"
                  class="qc-btn is-chot-deal"
                  :disabled="chotDealLoading"
                  @click="chotDealAndSaleReport(c)"
                >
                  Chốt Deal
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>

      <!-- BÁO GIÁ ĐƠN LẺ (STANDALONE) -->
      <section v-if="paginatedStandaloneContracts.length > 0" class="qlbg-standalone-section">
        <div v-if="displayedGroupedContracts.length > 0" class="qlbg-section-divider">
          <span>Báo giá đơn lẻ ({{ displayedStandaloneContracts.length }})</span>
        </div>

        <div class="qlbg-cards-grid">
          <article
            v-for="c in paginatedStandaloneContracts"
            :key="c.ma_hop_dong"
            class="qlbg-quote-card"
            :class="c.is_completed ? 'is-official' : 'is-draft'"
            @click="viewDetails(c)"
          >
            <div class="qc-top">
              <div class="qc-top-left">
                <span v-if="c.so_po" class="qc-po-badge tabular-nums">PO #{{ c.so_po }}</span>
              </div>
              <div class="qc-top-right">
                <span class="qc-date tabular-nums">{{ c.created_time || c.ngay_tao }}</span>
                <button
                  v-if="!c.is_completed"
                  type="button"
                  class="qc-del-btn"
                  title="Xóa bản báo giá tạm này"
                  @click.stop="requestDeleteDraft(c)"
                >
                  <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                </button>
              </div>
            </div>

            <div class="qc-badges">
              <span class="qc-status-badge" :class="c.is_completed ? 'is-emerald' : 'is-amber'">
                <span class="status-dot"></span>
                {{ c.is_completed ? 'Chính thức' : 'Bản tạm' }}
              </span>
              <button
                v-if="!c.is_completed && isActiveOnSaleReportCraft(c)"
                type="button"
                class="qc-sr-active-pill"
                title="Đang hiển thị trên Sale Report Tạm — bấm để mở"
                @click.stop="openInSaleReport(c, true)"
              >
                Đang hiện trên SR Tạm ↗
              </button>
              <button
                v-else-if="canPinToSaleReportCraft(c)"
                type="button"
                class="qc-pin-sr-btn"
                :disabled="pinningSrCraftMa === c.ma_hop_dong"
                title="Đưa bản báo giá tạm này lên Sale Report Tạm"
                @click.stop="pinContractToSaleReportCraft(c)"
              >
                {{ pinningSrCraftMa === c.ma_hop_dong ? 'Đang ghim...' : 'Đưa lên SR Tạm' }}
              </button>
            </div>

            <div class="qc-code-row">
              <span class="qc-code tabular-nums" v-html="highlightText(c.so_hop_dong || c.ma_hop_dong, searchKeyword)"></span>
              <span v-if="c.so_hop_dong && c.so_hop_dong !== c.ma_hop_dong" class="qc-sub-id tabular-nums">{{ c.ma_hop_dong }}</span>
            </div>

            <div class="qc-cust-list" @click.stop="openCustomerInfoModal(c.ma_khach_hang)" title="Xem thông tin khách hàng">
              <div v-if="getCustomerInfo(c.ma_khach_hang).tenCongTy" class="qc-cust-line is-company">
                <svg class="qc-cust-ico" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/></svg>
                <span class="qc-cust-text" v-html="highlightText(getCustomerInfo(c.ma_khach_hang).tenCongTy, searchKeyword)"></span>
              </div>
              <div class="qc-cust-line is-name">
                <svg class="qc-cust-ico" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span class="qc-cust-text" v-html="highlightText(c.ten_khach_hang || getCustomerInfo(c.ma_khach_hang).tenKH || 'Chưa có người nhận', searchKeyword)"></span>
              </div>
              <div v-if="getCustomerInfo(c.ma_khach_hang).mst" class="qc-cust-line is-mst tabular-nums">
                <svg class="qc-cust-ico" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
                <span class="qc-cust-text">MST: <span v-html="highlightText(getCustomerInfo(c.ma_khach_hang).mst, searchKeyword)"></span></span>
              </div>
            </div>

            <div v-if="c.content_of_contract_po || c.ghi_chu" class="qc-content-note">
              <div v-if="c.content_of_contract_po" class="qc-po-line" :title="c.content_of_contract_po">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span v-html="highlightText(c.content_of_contract_po, searchKeyword)"></span>
              </div>
              <div v-if="c.ghi_chu" class="qc-note-line" :title="c.ghi_chu">
                Ghi chú: <span v-html="highlightText(c.ghi_chu, searchKeyword)"></span>
              </div>
            </div>

            <div class="qc-fin-box">
              <div class="qc-fin-row">
                <span>Chênh lệch giá</span>
                <span
                  class="tabular-nums qc-fin-diff"
                  :class="c.chenh_lech_gia > 0 ? 'is-pos' : c.chenh_lech_gia < 0 ? 'is-neg' : ''"
                >
                  {{ c.chenh_lech_gia > 0 ? '+' : '' }}{{ formatVND(c.chenh_lech_gia) }} đ
                </span>
              </div>
              <div class="qc-fin-row">
                <span>Còn lại</span>
                <span class="tabular-nums qc-fin-val-strong">{{ formatVND(c.con_lai) }} đ</span>
              </div>
              <div class="qc-fin-discount">
                <span>Tổng chiết khấu</span>
                <strong class="tabular-nums">{{ formatVND(c.tong_chiet_khau) }} đ</strong>
              </div>

              <div class="qc-fin-row is-actual">
                <span>Tổng giá thực tế</span>
                <span class="tabular-nums">{{ formatVND(c.tong_truoc_thue_khach) }} đ</span>
              </div>
              <div class="qc-fin-row">
                <span>Tổng tiền trước thuế ({{ priceViewMode === 'hd' ? 'HĐ' : 'Khách' }})</span>
                <span class="tabular-nums">{{ formatVND(getContractTruocThue(c)) }} đ</span>
              </div>
              <div class="qc-fin-row">
                <span>Thuế VAT</span>
                <span class="tabular-nums">{{ formatVND(getContractVat(c)) }} đ</span>
              </div>
              <div class="qc-fin-total">
                <span>Tổng tiền sau thuế</span>
                <strong class="tabular-nums">{{ formatVND(getContractSauThue(c)) }} đ</strong>
              </div>

              <div class="qc-meta-pills">
                <span
                  v-if="getPaymentStatusBadge(c)"
                  class="qc-mini-pill tabular-nums"
                  :class="getPaymentStatusBadge(c)!.cls"
                >
                  {{ getPaymentStatusBadge(c)!.label }}
                </span>
                <span class="qc-mini-pill is-slate tabular-nums">
                  {{ getContractItemCount(c.ma_hop_dong) }} SP
                </span>
                <span v-if="getTotalContractFilesCount(c) > 0" class="qc-mini-pill is-sky tabular-nums">
                  {{ getTotalContractFilesCount(c) }} file
                </span>
              </div>
            </div>

            <div class="qc-actions" @click.stop>
              <button type="button" class="qc-btn" @click="viewDetails(c)">Chi tiết</button>
              <button
                type="button"
                class="qc-btn"
                :disabled="c.is_completed"
                @click="!c.is_completed && editContract(c)"
              >
                Sửa
              </button>
              <button type="button" class="qc-btn" @click="duplicateContract(c)">Nhân bản</button>
              <button
                v-if="c.is_completed"
                type="button"
                class="qc-btn is-sr-link"
                @click="openInSaleReport(c)"
              >
                Sale Report ↗
              </button>
              <button
                v-else
                type="button"
                class="qc-btn is-chot-deal"
                :disabled="chotDealLoading"
                @click="chotDealAndSaleReport(c)"
              >
                Chốt Deal
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- INTERSECTION OBSERVER SENTINEL CHO CARD VIEW -->
      <div v-if="hasMoreCards" ref="cardLazySentinelRef" class="qlbg-lazy-sentinel">
        <span class="lazy-info tabular-nums">
          Đang hiển thị {{ visibleCardUnitsCount }} / {{ totalCardUnitsCount }} mục
        </span>
        <button type="button" class="qlbg-ghost-btn" @click="loadMoreCards">Tải thêm</button>
      </div>
    </div>

    <!-- =========================================================
         CHẾ ĐỘ 2: XEM DẠNG BẢNG GỌN MẬT ĐỘ CAO (TABLE VIEW)
    ========================================================== -->
    <div v-else class="qlbg-table-card">
      <div class="qlbg-table-scroll">
        <table class="qlbg-data-table">
          <thead>
            <tr>
              <th>Trạng thái</th>
              <th>Số / Mã HĐ</th>
              <th>Khách hàng &amp; Công ty</th>
              <th>Nội dung PO</th>
              <th>Ngày tạo</th>
              <th class="text-right">Trước thuế</th>
              <th class="text-right">Sau thuế ({{ priceViewMode === 'hd' ? 'HĐ' : 'Khách' }})</th>
              <th class="text-right">Net COM</th>
              <th class="text-center">SP / File</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in paginatedTableContracts"
              :key="'tbl-' + c.ma_hop_dong"
              class="qlbg-table-row"
              @click="viewDetails(c)"
            >
              <td>
                <div class="tbl-status-cell">
                  <span class="qc-status-badge" :class="c.is_completed ? 'is-emerald' : 'is-amber'">
                    <span class="status-dot"></span>
                    {{ c.is_completed ? 'Chính thức' : 'Bản tạm' }}
                  </span>
                  <span v-if="getVersionNumberLabel(c)" class="qc-ver-tag tabular-nums">{{ getVersionNumberLabel(c) }}</span>
                  <span v-if="c.so_po" class="qc-po-badge tabular-nums">PO #{{ c.so_po }}</span>
                  <button
                    v-if="!c.is_completed && isActiveOnSaleReportCraft(c)"
                    type="button"
                    class="qc-sr-active-pill is-compact"
                    title="Đang hiện trên Sale Report Tạm — bấm để mở"
                    @click.stop="openInSaleReport(c, true)"
                  >
                    SR Tạm ↗
                  </button>
                </div>
              </td>
              <td>
                <div class="tbl-code-main tabular-nums" v-html="highlightText(c.so_hop_dong || c.ma_hop_dong, searchKeyword)"></div>
                <div v-if="c.ma_hop_dong_goc && c.ma_hop_dong_goc !== c.ma_hop_dong" class="tbl-code-sub tabular-nums">Gốc: {{ c.ma_hop_dong_goc }}</div>
              </td>
              <td @click.stop="openCustomerInfoModal(c.ma_khach_hang)">
                <div class="tbl-cust-name" v-html="highlightText(getCustomerInfo(c.ma_khach_hang).tenCongTy || c.ten_khach_hang || '—', searchKeyword)"></div>
                <div v-if="getCustomerInfo(c.ma_khach_hang).tenCongTy && c.ten_khach_hang" class="tbl-cust-sub" v-html="highlightText(c.ten_khach_hang, searchKeyword)"></div>
              </td>
              <td>
                <div class="tbl-po-content" :title="c.content_of_contract_po || c.ghi_chu">
                  <span v-html="highlightText(c.content_of_contract_po || c.ghi_chu || '—', searchKeyword)"></span>
                </div>
              </td>
              <td class="tabular-nums nowrap">{{ c.created_time || c.ngay_tao }}</td>
              <td class="text-right tabular-nums nowrap">{{ formatVND(getContractTruocThue(c)) }}</td>
              <td class="text-right tabular-nums nowrap tbl-amount-strong">{{ formatVND(getContractSauThue(c)) }} đ</td>
              <td class="text-right tabular-nums nowrap">
                <span v-if="getContractNetCom(c) > 0" class="tbl-com-val">{{ formatVND(getContractNetCom(c)) }}</span>
                <span v-else class="tbl-muted">—</span>
              </td>
              <td class="text-center tabular-nums nowrap">
                <span class="qc-mini-pill is-slate">{{ getContractItemCount(c.ma_hop_dong) }} SP</span>
                <span v-if="getTotalContractFilesCount(c) > 0" class="qc-mini-pill is-sky" style="margin-left: 4px;">{{ getTotalContractFilesCount(c) }}F</span>
              </td>
              <td class="text-right nowrap" @click.stop>
                <div class="tbl-actions">
                  <button type="button" class="tbl-act-btn" title="Xem chi tiết" @click="viewDetails(c)">Chi tiết</button>
                  <button type="button" class="tbl-act-btn" :disabled="c.is_completed" title="Chỉnh sửa" @click="!c.is_completed && editContract(c)">Sửa</button>
                  <button type="button" class="tbl-act-btn" title="Nhân bản" @click="duplicateContract(c)">Nhân bản</button>
                  <button
                    v-if="canPinToSaleReportCraft(c)"
                    type="button"
                    class="tbl-act-btn is-sr"
                    :disabled="pinningSrCraftMa === c.ma_hop_dong"
                    title="Đưa phiên bản này lên Sale Report Tạm"
                    @click="pinContractToSaleReportCraft(c)"
                  >
                    Lên SR Tạm
                  </button>
                  <button v-if="c.is_completed" type="button" class="tbl-act-btn is-sr" @click="openInSaleReport(c)">SR ↗</button>
                  <button v-else type="button" class="tbl-act-btn is-chot" @click="chotDealAndSaleReport(c)">Chốt</button>
                  <button v-if="!c.is_completed" type="button" class="tbl-act-btn is-del" title="Xóa bản tạm" @click="requestDeleteDraft(c)">✕</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="hasMoreTableRows" ref="tableLazySentinelRef" class="qlbg-lazy-sentinel">
        <span class="lazy-info tabular-nums">
          Đang hiển thị {{ paginatedTableContracts.length }} / {{ displayedTableContracts.length }} dòng
        </span>
        <button type="button" class="qlbg-ghost-btn" @click="loadMoreTableRows">Tải thêm</button>
      </div>
    </div>

    <!-- =========================================================
         MODAL 1: CHI TIẾT BÁO GIÁ (3 CHẾ ĐỘ GIÁ + USD/VND CHUẨN + 2 SLOT FILE)
    ========================================================== -->
    <Teleport to="body">
      <div
        v-if="showDetailModal && selectedContract"
        class="modal-overlay qlbg-overlay qlbg-detail-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light' }"
        @click.self="showDetailModal = false"
      >
        <div class="qlbg-detail-modal">
          <div class="mob-sheet-grabber"></div>

          <!-- Header Modal -->
          <div class="dm-head">
            <div class="dm-head-left">
              <div class="dm-title-row">
                <span class="qc-status-badge" :class="selectedContract.is_completed ? 'is-emerald' : 'is-amber'">
                  <span class="status-dot"></span>
                  {{ selectedContract.is_completed ? 'Chính thức' : 'Bản tạm' }}
                </span>
                <span v-if="getVersionNumberLabel(selectedContract)" class="qc-ver-tag tabular-nums">{{ getVersionNumberLabel(selectedContract) }}</span>
                <h2 class="dm-code tabular-nums">{{ selectedContract.so_hop_dong || selectedContract.ma_hop_dong }}</h2>
                <span v-if="selectedContract.so_po" class="qc-po-badge tabular-nums">PO #{{ selectedContract.so_po }}</span>
                <button
                  v-if="!selectedContract.is_completed && isActiveOnSaleReportCraft(selectedContract)"
                  type="button"
                  class="qc-sr-active-pill"
                  @click="openInSaleReport(selectedContract, true)"
                >
                  Đang hiện trên SR Tạm ↗
                </button>
              </div>
              <div class="dm-sub-row tabular-nums">
                <span>Mã lưu: {{ selectedContract.ma_hop_dong }}</span>
                <span v-if="selectedContract.ngay_tao">· Ngày: {{ selectedContract.ngay_tao }}</span>
                <span v-if="selectedContract.content_of_contract_po">· {{ selectedContract.content_of_contract_po }}</span>
              </div>
            </div>

            <div class="dm-head-controls">
              <!-- Chế độ giá trong Modal -->
              <div class="qlbg-seg-group">
                <button
                  type="button"
                  class="qlbg-seg-btn"
                  :class="{ active: detailViewMode === 'hd' }"
                  @click="detailViewMode = 'hd'"
                >
                  Giá HĐ
                </button>
                <button
                  type="button"
                  class="qlbg-seg-btn is-khach"
                  :class="{ active: detailViewMode === 'khach' }"
                  @click="detailViewMode = 'khach'"
                >
                  Giá Khách
                </button>
                <button
                  type="button"
                  class="qlbg-seg-btn is-noibo"
                  :class="{ active: detailViewMode === 'noibo' }"
                  @click="detailViewMode = 'noibo'"
                >
                  Nội bộ / Đối chiếu
                </button>
              </div>

              <!-- Tiền tệ VND / USD -->
              <div class="qlbg-seg-group">
                <button type="button" class="qlbg-seg-btn" :class="{ active: quoteCurrency === 'VND' }" @click="quoteCurrency = 'VND'">VND</button>
                <button type="button" class="qlbg-seg-btn" :class="{ active: quoteCurrency === 'USD' }" @click="quoteCurrency = 'USD'">USD</button>
              </div>

              <!-- Xuất Excel (Chữ xanh lá + SVG Excel chuẩn) -->
              <button
                type="button"
                class="qlbg-excel-btn"
                :disabled="exportingExcel || !selectedContractDetails.length"
                @click="downloadDetailExcel"
                :title="`Xuất file Excel theo ${detailViewMode === 'khach' ? 'Giá Khách' : 'Giá Hợp Đồng'}`"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="m9 13 3 4"/>
                  <path d="m12 13-3 4"/>
                </svg>
                <span>{{ exportingExcel ? 'Đang xuất...' : 'Xuất Excel' }}</span>
              </button>

              <button type="button" class="dm-close-btn" @click="showDetailModal = false" title="Đóng">✕</button>
            </div>
          </div>

          <!-- Mobile Sub-Tab Switcher -->
          <div class="dm-mobile-tabs">
            <button
              type="button"
              class="dm-mob-tab"
              :class="{ active: activeMobileSubTab === 'chitiet' }"
              @click="activeMobileSubTab = 'chitiet'"
            >
              Hàng hóa ({{ selectedContractDetails.length }})
            </button>
            <button
              type="button"
              class="dm-mob-tab"
              :class="{ active: activeMobileSubTab === 'tongket' }"
              @click="activeMobileSubTab = 'tongket'"
            >
              Tổng kết &amp; Hồ sơ file ({{ detailFilesTotalCount }})
            </button>
          </div>

          <!-- Body 2 cột -->
          <div class="dm-body" :class="{ 'is-side-collapsed': !showCompareFinancePanel }">
            <!-- CỘT TRÁI: BẢNG HÀNG HÓA -->
            <div class="dm-main-col" :class="{ 'mob-hidden': activeMobileSubTab !== 'chitiet' }">
              <div v-if="loadingDetails" class="dm-loading-state">
                <div class="dm-spinner"></div>
                <span>Đang tải chi tiết hàng hóa...</span>
              </div>

              <div v-else-if="selectedContractDetails.length === 0" class="dm-empty-items">
                Không có dữ liệu mặt hàng cho báo giá này.
              </div>

              <div v-else class="dm-table-wrap">
                <table class="dm-items-table">
                  <thead>
                    <tr>
                      <th class="col-stt">STT</th>
                      <th class="col-sku">Mã / SKU</th>
                      <th class="col-name">Tên hàng hóa / Diễn giải</th>
                      <th class="col-dvt">ĐVT</th>
                      <th class="col-sl text-right">SL</th>
                      <template v-if="detailViewMode === 'noibo'">
                        <th class="text-right">Giá vốn TC</th>
                        <th class="text-right">Đơn giá Khách</th>
                        <th class="text-right">Đơn giá HĐ</th>
                        <th class="text-right">TT HĐ (Trước thuế)</th>
                        <th class="text-right">Chênh lệch</th>
                        <th class="text-right">Net Margin</th>
                      </template>
                      <template v-else>
                        <th class="text-right">Đơn giá ({{ detailViewMode === 'khach' ? 'Khách' : 'HĐ' }})</th>
                        <th class="text-right">TT Trước thuế</th>
                        <th class="text-center">VAT</th>
                        <th class="text-right">TT Sau thuế</th>
                      </template>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(grp, gIdx) in groupedDetails" :key="grp.key + '-' + gIdx">
                      <tr v-if="grp.title" class="dm-group-row">
                        <td class="col-stt font-bold">{{ toRoman(gIdx + 1) }}</td>
                        <td :colspan="detailViewMode === 'noibo' ? 10 : 8" class="dm-group-title">
                          {{ grp.title }}
                        </td>
                      </tr>
                      <tr v-for="(d, dIdx) in grp.items" :key="d.ma_hang + '-' + dIdx" class="dm-item-row">
                        <td data-label="STT" class="col-stt tabular-nums">{{ dIdx + 1 }}</td>
                        <td data-label="Mã / SKU" class="col-sku">
                          <div class="sku-primary tabular-nums">{{ d.sku_code || d.ma_hang || '—' }}</div>
                          <div v-if="d.ten_ncc" class="sku-vendor">{{ d.ten_ncc }}</div>
                        </td>
                        <td data-label="Tên hàng" class="col-name">
                          <div class="item-title-main">{{ d.ten_hang_bao_gia || d.ten_hang }}</div>
                          <div
                            v-if="d.ten_hang_bao_gia && d.ten_hang && d.ten_hang_bao_gia !== d.ten_hang"
                            class="item-origin-name"
                          >
                            Tên gốc: {{ d.ten_hang }}
                          </div>
                          <div v-if="getDisplayItemDesc(d)" class="item-desc-text">
                            {{ getDisplayItemDesc(d) }}
                          </div>
                          <div v-if="d.license_duration || d.thoi_han_bao_hanh || d.volume" class="item-specs-pills">
                            <span v-if="d.license_duration" class="spec-pill">License: {{ d.license_duration }}</span>
                            <span v-if="d.thoi_han_bao_hanh" class="spec-pill">BH: {{ d.thoi_han_bao_hanh }}</span>
                            <span v-if="d.volume" class="spec-pill">Vol: {{ d.volume }}</span>
                          </div>
                        </td>
                        <td data-label="ĐVT" class="col-dvt">{{ d.dvt || '—' }}</td>
                        <td data-label="Số lượng" class="col-sl text-right tabular-nums font-bold">{{ d.so_luong }}</td>

                        <template v-if="detailViewMode === 'noibo'">
                          <td data-label="Giá vốn TC" class="text-right tabular-nums">{{ formatModalMoney(lineUnitCost(d)) }}</td>
                          <td data-label="Đơn giá Khách" class="text-right tabular-nums">{{ formatModalMoney(lineUnitKhach(d)) }}</td>
                          <td data-label="Đơn giá HĐ" class="text-right tabular-nums font-semibold">{{ formatModalMoney(lineUnitHD(d)) }}</td>
                          <td data-label="TT HĐ (Trước VAT)" class="text-right tabular-nums font-bold">{{ formatModalMoney(lineTruocHD(d)) }}</td>
                          <td data-label="Chênh lệch" class="text-right tabular-nums" :class="lineDeltaHDKhach(d) > 0 ? 'text-sky' : 'text-muted'">
                            {{ lineDeltaHDKhach(d) !== 0 ? formatModalMoney(lineDeltaHDKhach(d)) : '—' }}
                          </td>
                          <td data-label="Net Margin" class="text-right tabular-nums" :class="lineNetMargin(d) >= 0 ? 'text-emerald' : 'text-rose'">
                            {{ formatModalMoney(lineNetMargin(d)) }}
                          </td>
                        </template>
                        <template v-else>
                          <td data-label="Đơn giá" class="text-right tabular-nums font-semibold">
                            {{ formatModalMoney(detailViewMode === 'khach' ? lineUnitKhach(d) : lineUnitHD(d)) }}
                          </td>
                          <td data-label="TT Trước thuế" class="text-right tabular-nums">
                            {{ formatModalMoney(detailViewMode === 'khach' ? lineTruocKhach(d) : lineTruocHD(d)) }}
                          </td>
                          <td data-label="VAT" class="text-center tabular-nums">{{ d.thue_vat }}%</td>
                          <td data-label="TT Sau thuế" class="text-right tabular-nums font-bold text-strong">
                            {{ formatModalMoney(detailViewMode === 'khach' ? lineSauKhach(d) : lineSauHD(d)) }}
                          </td>
                        </template>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- CỘT PHẢI: 3 BỘ CHỈ SỐ + DOCK KHÁCH / HỒ SƠ / CHIẾT KHẤU / TÀI CHÍNH (100% NHƯ BAOGIAFIREBASE) -->
            <aside
              class="dm-side-col"
              :class="{
                'mob-hidden': activeMobileSubTab !== 'tongket',
                'is-collapsed': !showCompareFinancePanel
              }"
            >
              <!-- Thanh dọc thu gọn khi đóng panel -->
              <div v-if="!showCompareFinancePanel" class="cmp-sr-collapsed-rail">
                <button
                  type="button"
                  class="cmp-sr-expand-btn"
                  title="Mở bảng chỉ số & tài chính"
                  @click="showCompareFinancePanel = true"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <span class="cmp-sr-rail-text">CHỈ SỐ &amp; TÀI CHÍNH</span>
                </button>
              </div>

              <div v-else class="cmp-sr-po1-blocks">
                <!-- Thanh chọn nguồn giá & thao tác nhanh -->
                <div class="cmp-sr-source-bar">
                  <div class="cmp-sr-source-pills" role="tablist" aria-label="Nguồn giá tính chỉ số">
                    <button
                      type="button"
                      class="cmp-sr-source-pill"
                      :class="{ active: cmpSrPriceSource === 'hopdong' }"
                      @click="cmpSrPriceSource = 'hopdong'"
                    >
                      Giá Hợp đồng
                    </button>
                    <button
                      type="button"
                      class="cmp-sr-source-pill"
                      :class="{ active: cmpSrPriceSource === 'khach' }"
                      @click="cmpSrPriceSource = 'khach'"
                    >
                      Giá Khách
                    </button>
                  </div>
                  <div class="cmp-sr-source-actions">
                    <span v-if="savingModalMetrics" class="cmp-sr-sync-badge">Đang lưu...</span>
                    <button
                      v-if="hasCmpSrOverrides"
                      type="button"
                      class="cmp-sr-reset-btn"
                      title="Khôi phục chỉ số gốc từ bảng báo giá"
                      @click="resetCurrentCmpSrBucket"
                    >
                      ↺ Mặc định
                    </button>
                    <button
                      type="button"
                      class="cmp-sr-collapse-btn"
                      title="Thu gọn cột phải"
                      @click="showCompareFinancePanel = false"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Vùng cuộn 3 bộ chỉ số -->
                <div class="cmp-sr-blocks-scroll">
                  <!-- BỘ 1: Doanh số & Chi phí -->
                  <div class="cmp-sr-po1-block">
                    <div class="cmp-sr-po1-block-title">Doanh số &amp; Chi phí</div>
                    <div class="cmp-sr-po1-list">
                      <div class="cmp-sr-po1-item">
                        <span class="cmp-sr-po1-lbl">Doanh số bán</span>
                        <FormattedInput
                          :modelValue="Math.round(cmpSrDoanhSoBan)"
                          class="cmp-sr-po1-input"
                          @update:modelValue="(val) => onCmpSrFieldChange('doanhSoBan', val)"
                        />
                      </div>
                      <div class="cmp-sr-po1-item">
                        <span class="cmp-sr-po1-lbl">Giá mua</span>
                        <FormattedInput
                          :modelValue="Math.round(cmpSrGiaMua)"
                          class="cmp-sr-po1-input"
                          @update:modelValue="(val) => onCmpSrFieldChange('giaMua', val)"
                        />
                      </div>
                      <div class="cmp-sr-po1-item">
                        <span class="cmp-sr-po1-lbl">Tổng CP đơn hàng</span>
                        <FormattedInput
                          :modelValue="Math.round(cmpSrTongCP)"
                          class="cmp-sr-po1-input"
                          @update:modelValue="(val) => onCmpSrFieldChange('tongCP', val)"
                        />
                      </div>
                      <div class="cmp-sr-po1-item is-readonly-accent">
                        <span class="cmp-sr-po1-lbl">Tổng tiền sau VAT</span>
                        <span class="cmp-sr-po1-val is-accent">{{ fmtCmpSrMoney(cmpSrTongSauVat) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- BỘ 2: COM, Thuế & Margin -->
                  <div class="cmp-sr-po1-block">
                    <div class="cmp-sr-po1-block-title">COM, Thuế &amp; Margin</div>
                    <div class="cmp-sr-po1-list">
                      <!-- Gross COM -->
                      <div class="cmp-sr-po1-item is-inline-dual is-com-adjustable">
                        <div class="cmp-sr-po1-lbl-group">
                          <div class="cmp-sr-po1-lbl-main-row">
                            <span class="cmp-sr-po1-lbl">Gross COM</span>
                            <div class="cmp-sr-pct-wrap">
                              <input
                                type="number"
                                step="any"
                                class="cmp-sr-pct-input"
                                :value="Number(cmpSrGrossComPct.toFixed(2))"
                                @change="(e) => onCmpSrFieldChange('grossComPct', (e.target as HTMLInputElement).value)"
                              />
                              <span class="cmp-sr-pct-unit">%</span>
                            </div>
                          </div>
                          <div
                            v-if="lastCmpSrComAdjust && lastCmpSrComAdjust.target === 'grossCom'"
                            class="cmp-sr-com-delta-hint"
                          >
                            <span
                              class="cmp-sr-com-delta-val"
                              :class="lastCmpSrComAdjust.delta >= 0 ? 'is-plus' : 'is-minus'"
                            >
                              {{ lastCmpSrComAdjust.delta >= 0 ? '+' : '−' }}{{ fmtCmpSrMoney(Math.abs(lastCmpSrComAdjust.delta)) }}
                            </span>
                            <button
                              type="button"
                              class="cmp-sr-com-undo-btn"
                              title="Hoàn tác lần cộng/trừ gần nhất"
                              @click="undoCmpSrComAdjust"
                            >
                              Hoàn tác
                            </button>
                          </div>
                        </div>
                        <div class="cmp-sr-com-val-group">
                          <FormattedInput
                            :modelValue="Math.round(cmpSrGrossCom)"
                            class="cmp-sr-po1-input"
                            @update:modelValue="(val) => onCmpSrFieldChange('grossCom', val)"
                          />
                          <button
                            type="button"
                            class="cmp-sr-com-plus-btn"
                            :class="{ active: cmpSrComAdjustMode === 'grossCom' }"
                            title="Cộng / Trừ thêm số tiền vào Gross COM"
                            @click="toggleCmpSrComAdjustPanel('grossCom')"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <!-- Thuế -->
                      <div class="cmp-sr-po1-item is-inline-dual">
                        <div class="cmp-sr-po1-lbl-group">
                          <span class="cmp-sr-po1-lbl">Thuế</span>
                          <div class="cmp-sr-pct-wrap">
                            <input
                              type="number"
                              step="any"
                              class="cmp-sr-pct-input"
                              :value="Number(cmpSrTaxPct.toFixed(2))"
                              @change="(e) => onCmpSrFieldChange('taxPct', (e.target as HTMLInputElement).value)"
                            />
                            <span class="cmp-sr-pct-unit">%</span>
                          </div>
                        </div>
                        <span class="cmp-sr-po1-val is-warn">{{ fmtCmpSrMoney(cmpSrTaxAmount) }}</span>
                      </div>

                      <!-- Net COM -->
                      <div class="cmp-sr-po1-item is-com-adjustable">
                        <div class="cmp-sr-po1-lbl-col">
                          <span class="cmp-sr-po1-lbl">Net COM</span>
                          <div
                            v-if="lastCmpSrComAdjust && lastCmpSrComAdjust.target === 'netCom'"
                            class="cmp-sr-com-delta-hint"
                          >
                            <span
                              class="cmp-sr-com-delta-val"
                              :class="lastCmpSrComAdjust.delta >= 0 ? 'is-plus' : 'is-minus'"
                            >
                              {{ lastCmpSrComAdjust.delta >= 0 ? '+' : '−' }}{{ fmtCmpSrMoney(Math.abs(lastCmpSrComAdjust.delta)) }}
                            </span>
                            <button
                              type="button"
                              class="cmp-sr-com-undo-btn"
                              title="Hoàn tác lần cộng/trừ gần nhất"
                              @click="undoCmpSrComAdjust"
                            >
                              Hoàn tác
                            </button>
                          </div>
                        </div>
                        <div class="cmp-sr-com-val-group">
                          <FormattedInput
                            :modelValue="Math.round(cmpSrNetCom)"
                            class="cmp-sr-po1-input"
                            @update:modelValue="(val) => onCmpSrFieldChange('netCom', val)"
                          />
                          <button
                            type="button"
                            class="cmp-sr-com-plus-btn"
                            :class="{ active: cmpSrComAdjustMode === 'netCom' }"
                            title="Cộng / Trừ thêm số tiền vào Net COM"
                            @click="toggleCmpSrComAdjustPanel('netCom')"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <!-- Inline popover cộng / trừ nhanh Gross COM hoặc Net COM -->
                      <div v-if="cmpSrComAdjustMode" class="cmp-sr-com-adjust-popover">
                        <div class="cmp-sr-com-adjust-head">
                          <span>
                            Điều chỉnh <strong>{{ cmpSrComAdjustMode === 'grossCom' ? 'Gross COM' : 'Net COM' }}</strong>
                          </span>
                          <button type="button" class="cmp-sr-com-adjust-close" @click="closeCmpSrComAdjustPanel">✕</button>
                        </div>
                        <div class="cmp-sr-com-adjust-controls">
                          <input
                            ref="cmpSrComAdjustInputRef"
                            v-model="cmpSrComAdjustRaw"
                            type="text"
                            inputmode="numeric"
                            class="cmp-sr-com-adjust-input"
                            placeholder="Nhập số tiền..."
                            @keydown.enter.prevent="applyCmpSrComAdjust(1)"
                            @keydown.esc.prevent="closeCmpSrComAdjustPanel"
                          />
                          <button type="button" class="cmp-sr-com-act-btn is-plus" @click="applyCmpSrComAdjust(1)">+ Cộng</button>
                          <button type="button" class="cmp-sr-com-act-btn is-minus" @click="applyCmpSrComAdjust(-1)">− Trừ</button>
                        </div>
                      </div>

                      <!-- Net PO -->
                      <div class="cmp-sr-po1-item">
                        <span class="cmp-sr-po1-lbl">Net PO</span>
                        <span class="cmp-sr-po1-val is-accent">{{ fmtCmpSrMoney(cmpSrNetPO) }}</span>
                      </div>

                      <!-- Net Margin -->
                      <div class="cmp-sr-po1-item">
                        <span class="cmp-sr-po1-lbl">Net Margin</span>
                        <span class="cmp-sr-po1-val is-profit">{{ fmtCmpSrMoney(cmpSrNetMargin) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- BỘ 3: Tỉ suất (%) -->
                  <div class="cmp-sr-po1-block is-ratio-block">
                    <div class="cmp-sr-po1-block-head">
                      <div class="cmp-sr-po1-block-title">Tỉ suất (%)</div>
                      <button
                        type="button"
                        class="cmp-sr-round-toggle-btn"
                        :class="{ 'is-active': cmpSrIsRatioRounded }"
                        title="Bật/tắt làm tròn số phần trăm"
                        @click="toggleCmpSrRatioRounding"
                      >
                        Làm tròn {{ cmpSrIsRatioRounded ? '✓' : '' }}
                      </button>
                    </div>
                    <div class="cmp-sr-po1-list">
                      <div class="cmp-sr-po1-item">
                        <span class="cmp-sr-po1-lbl">Net COM / Net PO</span>
                        <span class="cmp-sr-po1-val is-ratio">{{ fmtCmpSrPct(cmpSrNetComOnNetPoPct) }}</span>
                      </div>
                      <div class="cmp-sr-po1-item">
                        <span class="cmp-sr-po1-lbl">Net Margin / Net PO</span>
                        <span class="cmp-sr-po1-val is-ratio is-profit">{{ fmtCmpSrPct(cmpSrNetMarginOnNetPoPct) }}</span>
                      </div>
                      <div class="cmp-sr-po1-item">
                        <span class="cmp-sr-po1-lbl">Net COM / Doanh số bán</span>
                        <span class="cmp-sr-po1-val is-ratio">{{ fmtCmpSrPct(cmpSrNetComOnDsbPct) }}</span>
                      </div>
                      <div class="cmp-sr-po1-item">
                        <span class="cmp-sr-po1-lbl">Net Margin / Doanh số bán</span>
                        <span class="cmp-sr-po1-val is-ratio is-profit">{{ fmtCmpSrPct(cmpSrNetMarginOnDsbPct) }}</span>
                      </div>
                    </div>

                    <!-- CHỈ SỐ NET MARGIN / DSB MONG MUỐN -->
                    <div class="cmp-sr-predict-box">
                      <div class="cmp-sr-predict-row">
                        <div class="cmp-sr-predict-lbl-wrap">
                          <span class="cmp-sr-predict-title">CHỈ SỐ NET MARGIN/DSB MONG MUỐN</span>
                        </div>
                        <div class="cmp-sr-predict-actions">
                          <div class="cmp-sr-pct-wrap is-predict">
                            <input
                              type="number"
                              step="any"
                              class="cmp-sr-pct-input"
                              placeholder="Nhập %"
                              :value="cmpSrOverrides.predictMarginOnDsbPct !== null ? cmpSrOverrides.predictMarginOnDsbPct : Number(cmpSrNetMarginOnDsbPct.toFixed(2))"
                              @change="onCmpSrPredictInput"
                              @keydown.enter.prevent="onCmpSrPredictInput"
                            />
                            <span class="cmp-sr-pct-unit">%</span>
                          </div>
                          <button
                            v-if="cmpSrOverrides.predictMarginOnDsbPct !== null"
                            type="button"
                            class="cmp-sr-predict-reset"
                            title="Hoàn tác dự đoán về mặc định"
                            @click="resetCmpSrPredictPct"
                          >
                            Hoàn tác
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- DOCK BÊN DƯỚI: KHÁCH / HỒ SƠ / CHIẾT KHẤU / TÀI CHÍNH -->
                <div class="pc-right-finance-dock">
                  <!-- Hidden file inputs luôn sẵn sàng cho tab Hồ sơ -->
                  <input
                    ref="contractFileInputHd"
                    type="file"
                    multiple
                    style="display: none"
                    @change="handleSlotFileUpload($event, 'hd')"
                  />
                  <input
                    ref="contractFileInputKhach"
                    type="file"
                    multiple
                    style="display: none"
                    @change="handleSlotFileUpload($event, 'khach')"
                  />

                  <div class="sidebar-dock-tabs" role="tablist" aria-label="Thông tin khách hàng, hồ sơ, chiết khấu và tài chính">
                    <button
                      type="button"
                      role="tab"
                      class="dock-tab-btn"
                      :class="{ active: activeDetailDockTab === 'customer' }"
                      :aria-selected="activeDetailDockTab === 'customer'"
                      @click="toggleDetailDockTab('customer')"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Khách</span>
                    </button>

                    <button
                      type="button"
                      role="tab"
                      class="dock-tab-btn"
                      :class="{ active: activeDetailDockTab === 'files' }"
                      :aria-selected="activeDetailDockTab === 'files'"
                      @click="toggleDetailDockTab('files')"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      <span>Hồ sơ ({{ detailFilesTotalCount }})</span>
                    </button>

                    <button
                      type="button"
                      role="tab"
                      class="dock-tab-btn"
                      :class="{ active: activeDetailDockTab === 'discount' }"
                      :aria-selected="activeDetailDockTab === 'discount'"
                      @click="toggleDetailDockTab('discount')"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="5" x2="5" y2="19"></line>
                        <circle cx="6.5" cy="6.5" r="2.5"></circle>
                        <circle cx="17.5" cy="17.5" r="2.5"></circle>
                      </svg>
                      <span>Chiết khấu</span>
                    </button>

                    <button
                      type="button"
                      role="tab"
                      class="dock-tab-btn"
                      :class="{ active: activeDetailDockTab === 'finance' }"
                      :aria-selected="activeDetailDockTab === 'finance'"
                      @click="toggleDetailDockTab('finance')"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                        <line x1="2" y1="10" x2="22" y2="10"></line>
                      </svg>
                      <span>Tài chính</span>
                    </button>
                  </div>

                  <!-- TAB 1: THÔNG TIN KHÁCH HÀNG (CHỈNH SỬA & CHỌN KHÁCH Y NHƯ BAOGIAFIREBASE) -->
                  <div v-if="activeDetailDockTab === 'customer'" class="dock-tab-panel customer-dock-panel">
                    <div class="customer-dock-micro-bar">
                      <span class="customer-dock-title">Thông tin KH</span>
                      <div class="customer-dock-actions">
                        <button
                          v-if="selectedContract.ma_khach_hang"
                          type="button"
                          class="btn-customer-detail-pill"
                          title="Xem hồ sơ chi tiết khách hàng"
                          @click="openCustomerInfoModal(selectedContract.ma_khach_hang)"
                        >
                          Chi tiết →
                        </button>
                      </div>
                    </div>

                    <div class="customer-dock-grid">
                      <div class="cd-row">
                        <label class="cd-lbl">MST</label>
                        <div class="cd-input-group">
                          <input
                            v-model="modalCustEdit.mst"
                            type="text"
                            class="cd-input tabular-nums"
                            placeholder="Mã số thuế..."
                            @change="onModalCustomerFieldCommit"
                          />
                          <button
                            type="button"
                            class="cd-btn-pick"
                            title="Chọn từ danh sách khách hàng"
                            @click="openCustomerModal(true)"
                          >
                            Chọn
                          </button>
                        </div>
                      </div>

                      <div class="cd-row">
                        <label class="cd-lbl">Khách</label>
                        <input
                          v-model="modalCustEdit.tenKH"
                          type="text"
                          class="cd-input"
                          placeholder="Tên người nhận / khách hàng..."
                          @change="onModalCustomerFieldCommit"
                        />
                      </div>

                      <div class="cd-row">
                        <label class="cd-lbl">Công ty</label>
                        <input
                          v-model="modalCustEdit.tenCongTy"
                          type="text"
                          class="cd-input"
                          placeholder="Tên công ty..."
                          @change="onModalCustomerFieldCommit"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- TAB 2: HỒ SƠ FILE & TIẾN ĐỘ SALE REPORT -->
                  <div v-if="activeDetailDockTab === 'files'" class="dock-tab-panel files-dock-panel">
                    <div v-if="selectedLinkedSaleReport" class="dock-sr-payment-box">
                      <div class="dock-sr-payment-head">
                        <span>Tiến độ Thanh toán (SR)</span>
                        <button type="button" class="dm-inline-link" @click="openInSaleReport(selectedContract)">Mở SR ↗</button>
                      </div>
                      <div class="dock-sr-payment-rows">
                        <div class="dock-sr-row">
                          <span>Đã thanh toán</span>
                          <strong class="tabular-nums text-emerald">{{ formatVND(selectedLinkedSaleReport.paid) }} đ</strong>
                        </div>
                        <div class="dock-sr-row">
                          <span>Công nợ còn thu</span>
                          <strong class="tabular-nums" :class="selectedLinkedSaleReport.debt > 0 ? 'text-rose' : 'text-emerald'">
                            {{ formatVND(selectedLinkedSaleReport.debt) }} đ
                          </strong>
                        </div>
                      </div>
                    </div>

                    <!-- Slot 1: File Hợp đồng -->
                    <div class="dm-file-slot">
                      <div class="slot-head">
                        <span class="slot-label">File Báo giá Hợp đồng ({{ parsedFilesHd.length }})</span>
                        <button
                          type="button"
                          class="slot-upload-btn"
                          :disabled="uploadingFileSlot !== null"
                          @click="contractFileInputHd?.click()"
                        >
                          {{ uploadingFileSlot === 'hd' ? 'Đang tải...' : '+ Đính kèm' }}
                        </button>
                      </div>
                      <div v-if="parsedFilesHd.length === 0" class="slot-empty">Chưa có file hợp đồng</div>
                      <div v-else class="slot-file-list">
                        <div v-for="(f, idx) in parsedFilesHd" :key="'fhd-' + idx" class="slot-file-item">
                          <a :href="f.link" target="_blank" rel="noopener noreferrer" class="slot-file-link" :title="f.name">
                            {{ f.name }}
                          </a>
                          <button type="button" class="slot-file-del" title="Gỡ file" @click="removeSlotFile('hd', idx)">✕</button>
                        </div>
                      </div>
                    </div>

                    <!-- Slot 2: File Khách -->
                    <div class="dm-file-slot">
                      <div class="slot-head">
                        <span class="slot-label">File Báo giá Khách ({{ parsedFilesKhach.length }})</span>
                        <button
                          type="button"
                          class="slot-upload-btn"
                          :disabled="uploadingFileSlot !== null"
                          @click="contractFileInputKhach?.click()"
                        >
                          {{ uploadingFileSlot === 'khach' ? 'Đang tải...' : '+ Đính kèm' }}
                        </button>
                      </div>
                      <div v-if="parsedFilesKhach.length === 0" class="slot-empty">Chưa có file báo giá khách</div>
                      <div v-else class="slot-file-list">
                        <div v-for="(f, idx) in parsedFilesKhach" :key="'fkh-' + idx" class="slot-file-item">
                          <a :href="f.link" target="_blank" rel="noopener noreferrer" class="slot-file-link" :title="f.name">
                            {{ f.name }}
                          </a>
                          <button type="button" class="slot-file-del" title="Gỡ file" @click="removeSlotFile('khach', idx)">✕</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- TAB 3: CHIẾT KHẤU & CHÊNH LỆCH GIÁ (CHỈNH ĐƯỢC % Y NHƯ BAOGIAFIREBASE) -->
                  <div v-if="activeDetailDockTab === 'discount'" class="dock-tab-panel discount-dock-panel">
                    <div class="fin-row">
                      <div class="fin-lbl-inline">
                        <span class="fin-lbl">Chiết khấu tổng trước thuế</span>
                        <div class="fin-pct-inline">
                          <FormattedInput
                            :modelValue="modalChietKhauTruocThuePct"
                            :isDecimal="true"
                            class="fin-pct-input"
                            @update:modelValue="(val) => onModalDiscountPctChange('ckPct', val)"
                          />
                          <span class="fin-pct-unit">%</span>
                        </div>
                      </div>
                      <span class="fin-val is-discount tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.tongChietKhau) }}</span>
                    </div>

                    <div class="fin-row">
                      <div class="fin-lbl-inline">
                        <span class="fin-lbl">Thuế chênh lệch giá</span>
                        <div class="fin-pct-inline">
                          <FormattedInput
                            :modelValue="modalThueChenhLechPct"
                            :isDecimal="true"
                            class="fin-pct-input"
                            @update:modelValue="(val) => onModalDiscountPctChange('taxPct', val)"
                          />
                          <span class="fin-pct-unit">%</span>
                        </div>
                      </div>
                      <span class="fin-val is-warn tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.thueCL) }}</span>
                    </div>

                    <div class="fin-row">
                      <span class="fin-lbl">Chênh lệch giá</span>
                      <span class="fin-val is-accent tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.chenhLechGia) }}</span>
                    </div>

                    <div class="fin-row">
                      <span class="fin-lbl">Còn lại</span>
                      <span class="fin-val is-emerald tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.conLai) }}</span>
                    </div>

                    <div class="fin-row is-total">
                      <span class="fin-lbl">Tổng Chiết khấu</span>
                      <span class="fin-val is-discount tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.tongChietKhau) }}</span>
                    </div>
                  </div>

                  <!-- TAB 4: TÀI CHÍNH TỔNG HỢP -->
                  <div v-if="activeDetailDockTab === 'finance'" class="dock-tab-panel finance-dock-panel">
                    <div class="fin-row">
                      <span class="fin-lbl">TT trước thuế (Khách)</span>
                      <span class="fin-val tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.khachTruoc) }}</span>
                    </div>
                    <div class="fin-row">
                      <span class="fin-lbl">TT trước thuế (HĐ)</span>
                      <span class="fin-val is-accent tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.hdTruoc) }}</span>
                    </div>
                    <div class="fin-row">
                      <span class="fin-lbl">Tổng VAT ({{ detailViewMode === 'khach' ? 'Khách' : 'HĐ' }})</span>
                      <span class="fin-val tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.activeVat) }}</span>
                    </div>
                    <div class="fin-row is-grand-total">
                      <span class="fin-lbl">TT sau thuế ({{ detailViewMode === 'khach' ? 'Khách' : 'HĐ' }})</span>
                      <span class="fin-val is-grand tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.activeSau) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <!-- Footer Modal -->
          <div class="dm-foot">
            <div class="dm-foot-left">
              <button
                v-if="!selectedContract.is_completed"
                type="button"
                class="qlbg-btn-danger-ghost"
                @click="requestDeleteDraft(selectedContract, true)"
              >
                Xóa bản tạm
              </button>
            </div>
            <div class="dm-foot-right">
              <button
                v-if="!selectedContract.is_completed && isActiveOnSaleReportCraft(selectedContract)"
                type="button"
                class="qlbg-ghost-btn"
                @click="openInSaleReport(selectedContract, true)"
              >
                Mở SR Tạm ↗
              </button>
              <button
                v-else-if="canPinToSaleReportCraft(selectedContract)"
                type="button"
                class="qlbg-ghost-btn"
                :disabled="pinningSrCraftMa === selectedContract.ma_hop_dong"
                @click="pinContractToSaleReportCraft(selectedContract)"
              >
                {{ pinningSrCraftMa === selectedContract.ma_hop_dong ? 'Đang ghim...' : 'Đưa lên SR Tạm' }}
              </button>
              <button
                type="button"
                class="qlbg-ghost-btn"
                :disabled="selectedContract.is_completed"
                @click="!selectedContract.is_completed && editContract(selectedContract)"
              >
                Sửa báo giá
              </button>
              <button type="button" class="qlbg-ghost-btn" @click="duplicateContract(selectedContract)">
                Nhân bản
              </button>
              <button
                v-if="selectedContract.is_completed"
                type="button"
                class="qlbg-btn-primary"
                @click="openInSaleReport(selectedContract)"
              >
                Mở trong Sale Report ↗
              </button>
              <button
                v-else
                type="button"
                class="qlbg-btn-emerald"
                :disabled="chotDealLoading"
                @click="chotDealAndSaleReport(selectedContract)"
              >
                Chốt Deal &amp; Lưu Sale Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         MODAL 2: LỌC THEO KHÁCH HÀNG (CÓ LAZY LOADING INTERSECTIONOBSERVER)
    ========================================================== -->
    <Teleport to="body">
      <div
        v-if="showCustomerModal"
        class="modal-overlay qlbg-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light' }"
        @click.self="showCustomerModal = false"
      >
        <div class="qlbg-picker-modal">
          <div class="mob-sheet-grabber"></div>
          <div class="pm-head">
            <div class="pm-title-wrap">
              <h3>Lọc theo Khách hàng</h3>
              <span class="pm-count tabular-nums">{{ filteredModalCustomers.length }} khách hàng</span>
            </div>
            <button type="button" class="dm-close-btn" @click="showCustomerModal = false">✕</button>
          </div>

          <div class="pm-search-bar">
            <svg class="pm-search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              v-model="customerModalSearch"
              type="text"
              class="pm-search-input"
              placeholder="Tìm tên khách hàng, tên công ty, MST..."
            />
            <button
              v-if="customerModalSearch"
              type="button"
              class="pm-search-clear"
              @click="customerModalSearch = ''"
            >
              Xóa
            </button>
          </div>

          <div class="pm-list">
            <button
              type="button"
              class="pm-item"
              :class="{ active: customerFilter === 'ALL' }"
              @click="selectCustomerFilter('ALL')"
            >
              <div class="pm-avatar is-all">ALL</div>
              <div class="pm-info">
                <div class="pm-name">Tất cả khách hàng</div>
                <div class="pm-sub">Hiển thị toàn bộ {{ contracts.length }} báo giá</div>
              </div>
              <span v-if="customerFilter === 'ALL'" class="pm-check">✓</span>
            </button>

            <button
              v-for="c in visibleModalCustomers"
              :key="c.id"
              type="button"
              class="pm-item"
              :class="{ active: customerFilter === c.id }"
              @click="selectCustomerFilter(c.id)"
            >
              <div class="pm-avatar">{{ getInitials(c.tenCongTy || c.name) }}</div>
              <div class="pm-info">
                <div class="pm-name">{{ c.name }}</div>
                <div v-if="c.tenCongTy" class="pm-sub">{{ c.tenCongTy }}</div>
                <div v-if="c.mst" class="pm-mst tabular-nums">MST: {{ c.mst }}</div>
              </div>
              <span class="pm-quote-count tabular-nums">{{ c.quoteCount }} BG</span>
              <span v-if="customerFilter === c.id" class="pm-check">✓</span>
            </button>

            <div v-if="hasMoreModalCustomers" ref="customerModalSentinelRef" class="pm-lazy-more">
              <span class="tabular-nums">Hiển thị {{ visibleModalCustomers.length }} / {{ filteredModalCustomers.length }}</span>
            </div>

            <div v-if="filteredModalCustomers.length === 0" class="pm-empty">
              Không tìm thấy khách hàng phù hợp với từ khóa.
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         MODAL 3: HỒ SƠ NHANH KHÁCH HÀNG
    ========================================================== -->
    <Teleport to="body">
      <div
        v-if="showCustomerInfoModal"
        class="modal-overlay qlbg-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light' }"
        @click.self="showCustomerInfoModal = false"
      >
        <div class="qlbg-cust-modal">
          <div class="mob-sheet-grabber"></div>
          <div class="pm-head">
            <div class="pm-title-wrap">
              <h3>Hồ sơ Khách hàng</h3>
              <span v-if="customerInfoData.maKH" class="pm-count tabular-nums">{{ customerInfoData.maKH }}</span>
            </div>
            <button type="button" class="dm-close-btn" @click="showCustomerInfoModal = false">✕</button>
          </div>

          <div class="cm-body">
            <div class="cm-hero">
              <div class="cm-avatar">{{ getInitials(customerInfoData.tenCongTy || customerInfoData.tenKH) }}</div>
              <div>
                <div class="cm-company">{{ customerInfoData.tenCongTy || customerInfoData.company || customerInfoData.tenKH || 'Chưa cập nhật tên' }}</div>
                <div v-if="customerInfoData.mst" class="cm-mst tabular-nums">MST: {{ customerInfoData.mst }}</div>
              </div>
            </div>

            <div class="cm-grid">
              <div class="cm-field">
                <span>Người liên hệ</span>
                <strong>{{ customerInfoData.tenKH || '—' }}</strong>
              </div>
              <div class="cm-field">
                <span>Số điện thoại</span>
                <strong class="tabular-nums">{{ customerInfoData.sdt || customerInfoData.sdtCongTy || customerInfoData.tel || '—' }}</strong>
              </div>
              <div class="cm-field">
                <span>Email</span>
                <strong>{{ customerInfoData.email || customerInfoData.emailCongTy || '—' }}</strong>
              </div>
              <div class="cm-field">
                <span>Website</span>
                <strong>{{ customerInfoData.website || '—' }}</strong>
              </div>
              <div class="cm-field is-full">
                <span>Địa chỉ</span>
                <strong>{{ customerInfoData.diaChi || customerInfoData.address || '—' }}</strong>
              </div>
              <div v-if="customerInfoData.tenKHPhu || customerInfoData.sdtPhu" class="cm-field is-full">
                <span>Liên hệ phụ</span>
                <strong>{{ [customerInfoData.tenKHPhu, customerInfoData.sdtPhu, customerInfoData.emailPhu].filter(Boolean).join(' · ') }}</strong>
              </div>
              <div v-if="customerInfoData.ghiChu" class="cm-field is-full">
                <span>Ghi chú</span>
                <strong>{{ customerInfoData.ghiChu }}</strong>
              </div>
            </div>
          </div>

          <div class="cm-foot">
            <button
              v-if="customerInfoData.maKH"
              type="button"
              class="qlbg-ghost-btn"
              @click="filterByCustomerFromProfile(customerInfoData.maKH)"
            >
              Lọc báo giá của KH này
            </button>
            <button type="button" class="qlbg-btn-primary" @click="router.push('/customerfirebase')">
              Mở trang Khách hàng ↗
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         MODAL 4: QUEUED PROMISE CONFIRMATION DIALOG (CHỐT DEAL / XÓA NHÁP)
    ========================================================== -->
    <Teleport to="body">
      <div
        v-if="confirmDialog.visible"
        class="modal-overlay qlbg-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light' }"
        style="z-index: 10040;"
        @click.self="resolveConfirmDialog(false)"
      >
        <div class="qlbg-confirm-modal" :class="'is-' + confirmDialog.variant">
          <div class="cfm-icon" :class="'is-' + confirmDialog.variant">
            <svg v-if="confirmDialog.variant === 'danger'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3 class="cfm-title">{{ confirmDialog.title }}</h3>
          <p class="cfm-desc">{{ confirmDialog.message }}</p>
          <div v-if="confirmDialog.metaLines.length" class="cfm-meta-box">
            <div v-for="(line, idx) in confirmDialog.metaLines" :key="idx" class="cfm-meta-line tabular-nums">
              <span>{{ line.label }}</span>
              <strong>{{ line.value }}</strong>
            </div>
          </div>
          <div class="cfm-actions">
            <button
              ref="confirmCancelBtnRef"
              type="button"
              class="qlbg-ghost-btn"
              @click="resolveConfirmDialog(false)"
            >
              {{ confirmDialog.cancelText }}
            </button>
            <button
              ref="confirmOkBtnRef"
              type="button"
              :class="confirmDialog.variant === 'danger' ? 'qlbg-btn-danger' : 'qlbg-btn-emerald'"
              @click="resolveConfirmDialog(true)"
            >
              {{ confirmDialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         MODAL 5: ASYNC PROGRESS OVERLAY & SINGLE SMART TOAST
    ========================================================== -->
    <Teleport to="body">
      <div
        v-if="asyncResultModal.show"
        class="modal-overlay qlbg-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light' }"
        style="z-index: 10060;"
        @click.self="asyncResultModal.type !== 'loading' && (asyncResultModal.show = false)"
      >
        <div class="qlbg-async-card" :class="'is-' + asyncResultModal.type">
          <div v-if="asyncResultModal.type === 'loading'" class="dm-spinner is-lg"></div>
          <div v-else-if="asyncResultModal.type === 'success'" class="async-badge is-emerald">✓</div>
          <div v-else class="async-badge is-rose">✕</div>

          <div class="async-title">{{ asyncResultModal.title }}</div>
          <div v-if="asyncResultModal.msg" class="async-msg">{{ asyncResultModal.msg }}</div>
          <button
            v-if="asyncResultModal.type === 'error'"
            type="button"
            class="qlbg-ghost-btn"
            style="margin-top: 12px;"
            @click="asyncResultModal.show = false"
          >
            Đóng
          </button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <Transition name="qlbg-toast">
        <div
          v-if="smartToast.visible"
          class="qlbg-smart-toast"
          :class="['is-' + smartToast.type, { 'theme-light-blue': uiTheme === 'light' }]"
        >
          <span class="toast-dot"></span>
          <span class="toast-text">{{ smartToast.message }}</span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts">
export default {
  name: 'QuanLyBaoGiaFirebase'
}
</script>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, onUnmounted, onActivated, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, ref as dbRef, get, set, update, push, onValue } from 'firebase/database'
import ExcelJS from 'exceljs'
import FormattedInput from './FormattedInput.vue'
import { buildQuoteFileName } from '../utils/printTemplateEngine'

const firebaseConfig = {
  apiKey: 'AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8',
  authDomain: 'chusonproject.firebaseapp.com',
  databaseURL: 'https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'chusonproject',
  storageBucket: 'chusonproject.firebasestorage.app',
  messagingSenderId: '929199941311',
  appId: '1:929199941311:web:ca8d86f9fd7f8dff61480a',
  measurementId: 'G-48VVPGFSFK'
}
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const database = getDatabase(firebaseApp)

const router = useRouter()
const route = useRoute()

/* ======================
   THEME & VIEW MODES
====================== */
const QUOTE_THEME_MODE_STORAGE_KEY = 'nts_quote_theme_mode_v1'
function loadSavedTheme(): 'dark' | 'light' {
  try {
    return localStorage.getItem(QUOTE_THEME_MODE_STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}
const uiTheme = ref<'dark' | 'light'>(loadSavedTheme())
function toggleUiTheme() {
  uiTheme.value = uiTheme.value === 'dark' ? 'light' : 'dark'
  try {
    localStorage.setItem(QUOTE_THEME_MODE_STORAGE_KEY, uiTheme.value)
  } catch {}
}

const priceViewMode = ref<'hd' | 'khach'>('hd')
const layoutMode = ref<'card' | 'table'>('card')
const quoteCurrency = ref<'VND' | 'USD'>('VND')
const detailViewMode = ref<'hd' | 'khach' | 'noibo'>('hd')

/* ======================
   SMART TOAST & QUEUED CONFIRM DIALOG
====================== */
const smartToast = reactive<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
  visible: false,
  message: '',
  type: 'info'
})
let smartToastTimer: ReturnType<typeof setTimeout> | null = null

function triggerToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (smartToastTimer) clearTimeout(smartToastTimer)
  smartToast.message = message
  smartToast.type = type
  smartToast.visible = true
  smartToastTimer = setTimeout(() => {
    smartToast.visible = false
  }, 2800)
}

interface ConfirmQueueItem {
  title: string
  message: string
  confirmText: string
  cancelText: string
  variant: 'primary' | 'danger'
  metaLines: { label: string; value: string }[]
  resolve: (ok: boolean) => void
}
const confirmQueue: ConfirmQueueItem[] = []
const confirmCancelBtnRef = ref<HTMLButtonElement | null>(null)
const confirmOkBtnRef = ref<HTMLButtonElement | null>(null)
const confirmDialog = reactive<{
  visible: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  variant: 'primary' | 'danger'
  metaLines: { label: string; value: string }[]
  activeResolve: ((ok: boolean) => void) | null
}>({
  visible: false,
  title: '',
  message: '',
  confirmText: 'Xác nhận',
  cancelText: 'Hủy',
  variant: 'primary',
  metaLines: [],
  activeResolve: null
})

function pumpConfirmQueue() {
  if (confirmDialog.visible || confirmQueue.length === 0) return
  const next = confirmQueue.shift()!
  confirmDialog.title = next.title
  confirmDialog.message = next.message
  confirmDialog.confirmText = next.confirmText
  confirmDialog.cancelText = next.cancelText
  confirmDialog.variant = next.variant
  confirmDialog.metaLines = next.metaLines
  confirmDialog.activeResolve = next.resolve
  confirmDialog.visible = true
  nextTick(() => {
    if (next.variant === 'danger') {
      confirmCancelBtnRef.value?.focus()
    } else {
      confirmOkBtnRef.value?.focus()
    }
  })
}

function askConfirm(opts: {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger'
  metaLines?: { label: string; value: string }[]
}): Promise<boolean> {
  return new Promise(resolve => {
    confirmQueue.push({
      title: opts.title,
      message: opts.message,
      confirmText: opts.confirmText || 'Xác nhận',
      cancelText: opts.cancelText || 'Hủy',
      variant: opts.variant || 'primary',
      metaLines: opts.metaLines || [],
      resolve
    })
    pumpConfirmQueue()
  })
}

function resolveConfirmDialog(ok: boolean) {
  const resolver = confirmDialog.activeResolve
  confirmDialog.visible = false
  confirmDialog.activeResolve = null
  if (resolver) resolver(ok)
  setTimeout(pumpConfirmQueue, 60)
}

const asyncResultModal = ref<{ show: boolean; type: 'loading' | 'success' | 'error'; title: string; msg: string }>({
  show: false,
  type: 'loading',
  title: '',
  msg: ''
})
let asyncResultTimeout: ReturnType<typeof setTimeout> | null = null

function showAsyncLoading(title: string) {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'loading', title, msg: '' }
}
function showAsyncSuccess(title: string, msg = '') {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'success', title, msg }
  asyncResultTimeout = setTimeout(() => {
    asyncResultModal.value.show = false
  }, 1400)
}
function showAsyncError(title: string, msg = '') {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'error', title, msg }
}

/* ======================
   INTERFACES & 47/54-COL MAPPERS (ĐỒNG BỘ 100% VỚI BAOGIAFIREBASE)
====================== */
interface Contract {
  _fbKey: string
  ma_hop_dong: string
  so_hop_dong: string
  ma_khach_hang: string
  ten_khach_hang: string
  ngay_tao: string
  tong_truoc_thue: number
  tong_vat: number
  tong_sau_thue: number
  tong_truoc_thue_khach: number
  tong_vat_khach: number
  tong_sau_thue_khach: number
  tong_truoc_thue_list: number
  gia_mua: number
  tong_cp: number
  trang_thai: string
  ghi_chu: string
  don_vi_tien_te: string
  ti_gia: number
  created_time: string
  so_po: string
  content_of_contract_po: string
  ma_hop_dong_goc: string
  chiet_khau_truoc_thue: number
  chiet_khau_truoc_thue_pct: number
  thue_chenh_lech: number
  thue_chenh_lech_pct: number
  chenh_lech_gia: number
  con_lai: number
  tong_chiet_khau: number
  is_completed: boolean
  ten_file: string
  link_file: string
  ten_file_khach: string
  link_file_khach: string
  structure: string
  id_sale_report_craft: string
  id_sale_report: string
  lam_tron_ti_suat: boolean
}

interface ContractDetail {
  ma_hang: string
  sku_code: string
  ten_hang: string
  ten_hang_bao_gia: string
  dien_giai_bao_gia: string
  description: string
  dvt: string
  so_luong: number
  don_gia: number
  gia_tieu_chuan: number
  ten_ncc: string
  ma_ncc: string
  features: string
  danh_muc: string
  mo_ta_chung: string
  mo_ta_chi_tiet: string
  thue_vat: number
  gia_hardware: number
  gia_nhap: number
  muc_off: number
  license_duration: string
  thoi_han_bao_hanh: string
  volume: string
  don_vi_tien_te: string
  ti_gia: number
  don_vi_tien_te_usd: string
  ti_gia_usd: number
  gia_tieu_chuan_usd: number
  don_gia_usd: number
  gia_nhap_usd: number
  don_gia_goc: number
  don_gia_goc_usd: number
  muc_off_goc: number
  gia_hardware_goc: number
  gia_nhap_goc: number
  list_price_vnd: number
  don_gia_hop_dong_saved: number
  tt_truoc_hd_saved: number
  don_gia_khach_saved: number
  tt_truoc_khach_saved: number
  has_explicit_khach: boolean
}

interface ContractGroup {
  goc: string
  latest: Contract
  versions: Contract[]
}

function toNum(v: any, def = 0): number {
  if (v === null || v === undefined || v === '') return def
  const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, '').trim())
  return Number.isFinite(n) ? n : def
}

function round2(n: number): number {
  return Math.round((Number(n) || 0) * 100) / 100
}

function fbHopDongTongQuatToRow(item: any, fbKey = ''): any[] {
  if (Array.isArray(item)) {
    const r = item.slice(0, 47)
    while (r.length < 47) r.push('')
    return r
  }
  if (!item || typeof item !== 'object') return new Array(47).fill('')
  const truocHD = toNum(item.Tong_tien_truoc_thueVAT ?? item.tong_truoc_vat ?? item.tong_tien, 0)
  const truocKhach = toNum(
    item.Tong_gia_thuc_te ??
      item.Tong_tien_truoc_thueVAT_khach ??
      item.tong_truoc_vat_khach ??
      item.tong_gia_thuc_te ??
      item.tong_truoc_vat_goc,
    truocHD
  )
  const vatHD = toNum(item.Tong_thueVAT ?? item.tong_vat, 0)
  const sauHD = toNum(item.Tong_tien_sau_thueVAT ?? item.tong_sau_vat ?? item.tong_tien, 0)
  const vatKhach = toNum(item.Tong_thueVAT_khach ?? item.tong_vat_khach, truocKhach === truocHD ? vatHD : Math.round(truocKhach * (truocHD > 0 ? vatHD / truocHD : 0)))
  const sauKhach = toNum(item.Tong_tien_sau_thueVAT_khach ?? item.tong_sau_vat_khach, truocKhach + vatKhach)
  return [
    String(item.ma_hop_dong ?? item.Ma_hop_dong ?? fbKey ?? ''),
    String(item.so_hop_dong ?? item.So_hop_dong ?? ''),
    String(item.ma_khach_hang ?? item.Ma_khach_hang ?? ''),
    String(item.ten_khach_hang ?? item.Ten_khach_hang ?? ''),
    String(item.ngay_tao_hop_dong ?? item.ngay_tao ?? item.ngay_tao_date ?? item.ngay_ky ?? ''),
    truocHD,
    vatHD,
    sauHD,
    toNum(item.Tong_giam_gia, 0),
    toNum(item.Tong_cong ?? sauHD, 0),
    toNum(item.Tong_thanh_toan ?? item.da_thanh_toan, 0),
    toNum(item.Tong_hoa_hong_khach_hang, 0),
    toNum(item.Tong_hoa_hong_ca_nhan, 0),
    toNum(item.Cong_no_cu, 0),
    String(item.Trang_thai_thanh_toan ?? item.trang_thai_thanh_toan ?? 'Chưa thanh toán đủ'),
    String(item.Trang_thai_hop_dong ?? item['Trang_thai_hop_dong '] ?? item.loai_hop_dong ?? item.trang_thai_hop_dong ?? ''),
    String(item.Ghi_chu ?? item.ghi_chu ?? ''),
    String(item.Don_vi_tien_te ?? item.don_vi_tien_te ?? 'VND'),
    toNum(item.Ti_gia ?? item.ti_gia, 1),
    String(item.ma_hop_dong_cu ?? ''),
    truocKhach,
    String(item.created_time ?? ''),
    String(item.So_PO ?? item.so_po ?? ''),
    String(item.Ten_PO ?? item.ten_po ?? item.po_content ?? ''),
    String(item['content_of_contract/PO'] ?? item.content_of_contract_PO ?? item.content_of_contract_po ?? item.content_po ?? item.content ?? item.ten_hop_dong ?? ''),
    toNum(item.chiet_khau_tong_truoc_thue ?? item.gross_com, 0),
    toNum(item.phan_tram_chiet_khau_tong_truoc_thue ?? item.phan_tram_chiet_khau, 0),
    toNum(item.thue_chenh_lech_gia, 0),
    toNum(item.phan_tram_thue_chenh_lech_gia ?? item.phan_tram_thue, 0),
    toNum(item.chenh_lech_gia, 0),
    toNum(item.con_lai ?? item.net_com ?? item.netCom, 0),
    toNum(item.tong_chiet_khau, 0),
    String(item.ma_hop_dong_goc ?? item.ma_hop_dong ?? fbKey ?? ''),
    item.isCompleted === true || String(item.isCompleted).toUpperCase() === 'TRUE',
    String(item.ten_file ?? item.ten_file_bao_gia ?? item.ten_file_bao_gia_hd ?? ''),
    String(item.link_file ?? item.link_excel_bao_gia ?? item.link_excel_bao_gia_hd ?? ''),
    String(item.structure ?? ''),
    vatKhach,
    sauKhach,
    toNum(item.Tong_tien_truoc_thueVAT_list ?? item.tong_truoc_vat_list, 0),
    toNum(item.Tong_thanh_tien_chua_VAT_mua_hang ?? item.giaMua ?? item.gia_mua ?? item.tong_gia_von_mua_hang, 0),
    String(item.id_sale_report_craft ?? ''),
    String(item.id_sale_report ?? ''),
    String(item.ten_file_khach ?? item.ten_file_bao_gia_khach ?? ''),
    String(item.link_file_khach ?? item.link_excel_bao_gia_khach ?? ''),
    toNum(item.Tong_CP_don_hang ?? item.tongCP ?? item.tong_cp ?? item.Tong_thanh_tien_chua_VAT_mua_hang ?? item.giaMua ?? 0, 0),
    Boolean(item.lam_tron_ti_suat ?? item.lamTronTiSuat ?? false)
  ]
}

function rowToFbHopDongTongQuat(r: any[]) {
  const row = Array.isArray(r) ? r.slice(0, 47) : []
  while (row.length < 47) row.push('')
  const isCompletedBool = row[33] === true || String(row[33]).toUpperCase() === 'TRUE'
  const truoc = toNum(row[5], 0)
  const vat = toNum(row[6], 0)
  const sau = toNum(row[7], 0)
  const daTT = toNum(row[10], 0)
  const truocKhach = toNum(row[20], truoc) || truoc
  const vatKhach = toNum(row[37], truocKhach === truoc ? vat : Math.round(truocKhach * (truoc > 0 ? vat / truoc : 0)))
  const sauKhach = toNum(row[38], truocKhach + vatKhach) || (truocKhach + vatKhach)
  const truocList = toNum(row[39], truocKhach)
  const giaMuaVnd = toNum(row[40], 0)
  const tongCpVnd = toNum(row[45], giaMuaVnd) || giaMuaVnd
  const contentVal = String(row[24] ?? '')
  const tenFileHD = String(row[34] ?? '')
  const linkFileHD = String(row[35] ?? '')
  const tenFileKhach = String(row[43] ?? '')
  const linkFileKhach = String(row[44] ?? '')
  const grossCom = toNum(row[25], 0) || toNum(row[29], 0)
  const netCom = toNum(row[30], 0) || toNum(row[31], 0)
  return {
    ma_hop_dong: String(row[0] ?? ''),
    so_hop_dong: String(row[1] ?? ''),
    ma_khach_hang: String(row[2] ?? ''),
    ten_khach_hang: String(row[3] ?? ''),
    ngay_tao_hop_dong: String(row[4] ?? ''),
    ngay_tao: String(row[4] ?? ''),
    Tong_tien_truoc_thueVAT: truoc,
    tong_truoc_vat: truoc,
    tong_truoc_vat_goc: truocKhach,
    Tong_thueVAT: vat,
    tong_vat: vat,
    Tong_tien_sau_thueVAT: sau,
    tong_sau_vat: sau,
    Tong_giam_gia: toNum(row[8], 0),
    Tong_cong: toNum(row[9], sau),
    Tong_thanh_toan: daTT,
    da_thanh_toan: daTT,
    con_phai_thu: Math.max(0, sau - daTT),
    Tong_hoa_hong_khach_hang: toNum(row[11], 0),
    Tong_hoa_hong_ca_nhan: toNum(row[12], 0),
    Cong_no_cu: toNum(row[13], 0),
    Trang_thai_thanh_toan: String(row[14] || 'Chưa thanh toán đủ'),
    trang_thai_thanh_toan: String(row[14] || 'Chưa thanh toán đủ'),
    Trang_thai_hop_dong: String(row[15] || 'Tạm'),
    loai_hop_dong: String(row[15] || 'Tạm'),
    Ghi_chu: String(row[16] ?? ''),
    ghi_chu: String(row[16] ?? ''),
    Don_vi_tien_te: String(row[17] || 'VND'),
    don_vi_tien_te: String(row[17] || 'VND'),
    Ti_gia: toNum(row[18], 1),
    ti_gia: toNum(row[18], 1),
    ma_hop_dong_cu: String(row[19] ?? ''),
    Tong_gia_thuc_te: truocKhach,
    Tong_tien_truoc_thueVAT_khach: truocKhach,
    Tong_thueVAT_khach: vatKhach,
    Tong_tien_sau_thueVAT_khach: sauKhach,
    Tong_tien_truoc_thueVAT_list: truocList,
    Tong_thanh_tien_chua_VAT_mua_hang: giaMuaVnd,
    giaMua: giaMuaVnd,
    Tong_CP_don_hang: tongCpVnd,
    tongCP: tongCpVnd,
    created_time: String(row[21] ?? ''),
    So_PO: String(row[22] ?? ''),
    so_po: String(row[22] ?? ''),
    Ten_PO: String(row[23] ?? ''),
    po_content: String(row[23] ?? ''),
    content_of_contract_PO: contentVal,
    content_of_contract_po: contentVal,
    content_po: contentVal,
    content: contentVal,
    chiet_khau_tong_truoc_thue: toNum(row[25], 0),
    gross_com: grossCom,
    grossCom: grossCom,
    phan_tram_chiet_khau_tong_truoc_thue: toNum(row[26], 0),
    phan_tram_chiet_khau: toNum(row[26], 0),
    thue_chenh_lech_gia: toNum(row[27], 0),
    phan_tram_thue_chenh_lech_gia: toNum(row[28], 0),
    phan_tram_thue: toNum(row[28], 0),
    chenh_lech_gia: toNum(row[29], 0),
    con_lai: toNum(row[30], 0),
    net_com: netCom,
    netCom: netCom,
    tong_chiet_khau: toNum(row[31], 0),
    ma_hop_dong_goc: String(row[32] || row[0] || ''),
    isCompleted: isCompletedBool,
    ten_file: tenFileHD,
    link_file: linkFileHD,
    ten_file_bao_gia: tenFileHD,
    link_excel_bao_gia: linkFileHD,
    ten_file_bao_gia_hd: tenFileHD,
    link_excel_bao_gia_hd: linkFileHD,
    ten_file_khach: tenFileKhach,
    link_file_khach: linkFileKhach,
    ten_file_bao_gia_khach: tenFileKhach,
    link_excel_bao_gia_khach: linkFileKhach,
    structure: String(row[36] ?? ''),
    id_sale_report_craft: String(row[41] ?? ''),
    id_sale_report: String(row[42] ?? ''),
    lam_tron_ti_suat: Boolean(row[46] === true || String(row[46]).toUpperCase() === 'TRUE')
  }
}

function fbHopDongChiTietToRow(item: any): any[] {
  if (Array.isArray(item)) {
    const r = item.slice(0, 54)
    while (r.length < 54) r.push('')
    return r
  }
  if (!item || typeof item !== 'object') return new Array(54).fill('')
  return [
    String(item.ma_hop_dong ?? item.Ma_hop_dong ?? ''),
    String(item.so_hop_dong ?? item.So_hop_dong ?? ''),
    String(item.Ma_hang ?? item.ma_hang ?? ''),
    String(item.Ten_hang ?? item.ten_hang ?? ''),
    String(item.Main_img ?? item.main_img ?? ''),
    String(item.Ma_nha_cung_cap ?? item.ma_ncc ?? ''),
    String(item.Ten_nha_cung_cap ?? item.ten_ncc ?? ''),
    String(item.Mo_ta_chung ?? item.mo_ta_chung ?? ''),
    String(item.Mo_ta_chi_tiet ?? item.mo_ta_chi_tiet ?? ''),
    String(item.Features ?? item.features ?? item.dien_giai ?? ''),
    String(item.Danh_muc ?? item.danh_muc ?? ''),
    String(item.License_duration ?? item.license_duration ?? ''),
    String(item.DVT ?? item.dvt ?? ''),
    toNum(item.Gia_tieu_chuan ?? item.gia_tieu_chuan, 0),
    toNum(item.Don_gia ?? item.don_gia, 0),
    String(item.Don_vi_tien_te ?? item.don_vi_tien_te ?? 'VND'),
    toNum(item.Ti_gia ?? item.ti_gia, 1),
    toNum(item.Thue_VAT ?? item.thue_vat, 0),
    Math.max(1, toNum(item.So_luong ?? item.so_luong, 1)),
    String(item.Trang_thai_hop_dong ?? item.trang_thai_hop_dong ?? item.ghi_chu ?? ''),
    toNum(item.gia_hardware, 0),
    toNum(item.gia_nhap, 0),
    toNum(item['muc_%_off'] ?? item.muc_phan_tram_off, 0),
    String(item.don_vi_tien_te_USD ?? ''),
    toNum(item.Ti_giaUSD, 0),
    toNum(item.Gia_tieu_chuanUSD, 0),
    toNum(item.Don_giaUS ?? item.Don_giaUSD, 0),
    toNum(item.gia_nhapUSD, 0),
    String(item.start_date ?? ''),
    String(item.end_date ?? ''),
    String(item.is_giahan ?? ''),
    String(item.thoi_gian_bao_hanh ?? item.thoi_han_bao_hanh ?? ''),
    String(item.volume ?? ''),
    String(item.Description ?? item.description ?? ''),
    String(item.sku_code ?? item.SKU ?? item.sku ?? item.ma_sku ?? ''),
    item.Don_gia_goc !== undefined && item.Don_gia_goc !== '' ? toNum(item.Don_gia_goc, 0) : (item.don_gia_goc !== undefined && item.don_gia_goc !== '' ? toNum(item.don_gia_goc, 0) : (item.don_gia_khach !== undefined && item.don_gia_khach !== '' ? toNum(item.don_gia_khach, 0) : '')),
    item.Don_gia_goc_USD !== undefined && item.Don_gia_goc_USD !== '' ? toNum(item.Don_gia_goc_USD, 0) : '',
    item.muc_phan_tram_off_goc !== undefined && item.muc_phan_tram_off_goc !== '' ? toNum(item.muc_phan_tram_off_goc, 0) : '',
    item.gia_hardware_goc !== undefined && item.gia_hardware_goc !== '' ? toNum(item.gia_hardware_goc, 0) : '',
    item.gia_nhap_goc !== undefined && item.gia_nhap_goc !== '' ? toNum(item.gia_nhap_goc, 0) : '',
    item.Don_gia_kho !== undefined && item.Don_gia_kho !== '' ? toNum(item.Don_gia_kho, 0) : '',
    item.muc_phan_tram_off_kho !== undefined && item.muc_phan_tram_off_kho !== '' ? toNum(item.muc_phan_tram_off_kho, 0) : '',
    item.List_price_vnd !== undefined && item.List_price_vnd !== '' ? toNum(item.List_price_vnd, 0) : '',
    item.Don_gia_hop_dong !== undefined && item.Don_gia_hop_dong !== '' ? toNum(item.Don_gia_hop_dong, 0) : (item.don_gia_hop_dong !== undefined && item.don_gia_hop_dong !== '' ? toNum(item.don_gia_hop_dong, 0) : ''),
    item.Thanh_tien_truoc_thue_hop_dong !== undefined && item.Thanh_tien_truoc_thue_hop_dong !== '' ? toNum(item.Thanh_tien_truoc_thue_hop_dong, 0) : (item.thanh_tien_truoc_thue !== undefined && item.thanh_tien_truoc_thue !== '' ? toNum(item.thanh_tien_truoc_thue, 0) : ''),
    item.Tien_thue_vat_hop_dong !== undefined && item.Tien_thue_vat_hop_dong !== '' ? toNum(item.Tien_thue_vat_hop_dong, 0) : (item.tien_thue_vat !== undefined && item.tien_thue_vat !== '' ? toNum(item.tien_thue_vat, 0) : ''),
    item.Thanh_tien_sau_thue_hop_dong !== undefined && item.Thanh_tien_sau_thue_hop_dong !== '' ? toNum(item.Thanh_tien_sau_thue_hop_dong, 0) : (item.thanh_tien_sau_thue !== undefined && item.thanh_tien_sau_thue !== '' ? toNum(item.thanh_tien_sau_thue, 0) : ''),
    item.Don_gia_khach !== undefined && item.Don_gia_khach !== '' ? toNum(item.Don_gia_khach, 0) : (item.don_gia_khach !== undefined && item.don_gia_khach !== '' ? toNum(item.don_gia_khach, 0) : ''),
    item.Thanh_tien_truoc_thue_khach !== undefined && item.Thanh_tien_truoc_thue_khach !== '' ? toNum(item.Thanh_tien_truoc_thue_khach, 0) : (item.thanh_tien_truoc_thue_khach !== undefined && item.thanh_tien_truoc_thue_khach !== '' ? toNum(item.thanh_tien_truoc_thue_khach, 0) : ''),
    item.Tien_thue_vat_khach !== undefined && item.Tien_thue_vat_khach !== '' ? toNum(item.Tien_thue_vat_khach, 0) : (item.tien_thue_vat_khach !== undefined && item.tien_thue_vat_khach !== '' ? toNum(item.tien_thue_vat_khach, 0) : ''),
    item.Thanh_tien_sau_thue_khach !== undefined && item.Thanh_tien_sau_thue_khach !== '' ? toNum(item.Thanh_tien_sau_thue_khach, 0) : (item.thanh_tien_sau_thue_khach !== undefined && item.thanh_tien_sau_thue_khach !== '' ? toNum(item.thanh_tien_sau_thue_khach, 0) : ''),
    item.Chenh_lech_truoc_thue !== undefined && item.Chenh_lech_truoc_thue !== '' ? toNum(item.Chenh_lech_truoc_thue, 0) : '',
    String(item.Ten_hang_bao_gia ?? item.ten_hang_bao_gia ?? ''),
    String(item.Dien_giai_bao_gia ?? item.dien_giai_bao_gia ?? '')
  ]
}

function rowToFbHopDongChiTiet(r: any[], trangThaiHopDong: string) {
  const row = Array.isArray(r) ? r.slice(0, 54) : []
  while (row.length < 54) row.push('')
  const maHang = String(row[2] ?? '')
  const tenHang = String(row[3] ?? '')
  const mainImg = String(row[4] ?? '')
  const maNcc = String(row[5] ?? '')
  const tenNcc = String(row[6] ?? '')
  const moTaChung = String(row[7] ?? '')
  const moTaChiTiet = String(row[8] ?? '')
  const features = String(row[9] ?? '')
  const danhMuc = String(row[10] ?? '')
  const licDur = String(row[11] ?? '')
  const dvt = String(row[12] ?? '')
  const giaTC = toNum(row[13], 0)
  const donGia = toNum(row[14], 0)
  const dvtien = String(row[15] || 'VND').trim()
  const tiGia = toNum(row[16], 1)
  const thueVat = toNum(row[17], 0)
  const soLuong = Math.max(1, toNum(row[18], 1))
  const statusHD = trangThaiHopDong || String(row[19] || '')
  const mucOff = toNum(row[22], 0)
  const desc = String(row[33] ?? '')
  const skuCode = String(row[34] ?? '')
  const donGiaGocVnd = row[35] !== undefined && row[35] !== '' ? toNum(row[35], donGia) : donGia
  const tenHangBaoGia = String(row[52] ?? '')
  const dienGiaiBaoGia = String(row[53] ?? '')
  return {
    ma_hop_dong: String(row[0] ?? ''),
    so_hop_dong: String(row[1] ?? ''),
    Ma_hang: maHang,
    ma_hang: maHang,
    sku_code: skuCode,
    SKU: skuCode,
    Ten_hang: tenHang,
    ten_hang: tenHang,
    Ten_hang_bao_gia: tenHangBaoGia,
    ten_hang_bao_gia: tenHangBaoGia,
    Main_img: mainImg,
    main_img: mainImg,
    Ma_nha_cung_cap: maNcc,
    ma_ncc: maNcc,
    Ten_nha_cung_cap: tenNcc,
    ten_ncc: tenNcc,
    Mo_ta_chung: moTaChung,
    mo_ta_chung: moTaChung,
    Mo_ta_chi_tiet: moTaChiTiet,
    mo_ta_chi_tiet: moTaChiTiet,
    Features: features,
    features: features,
    dien_giai: features,
    Dien_giai_bao_gia: dienGiaiBaoGia,
    dien_giai_bao_gia: dienGiaiBaoGia,
    Danh_muc: danhMuc,
    danh_muc: danhMuc,
    License_duration: licDur,
    license_duration: licDur,
    DVT: dvt,
    dvt: dvt,
    Gia_tieu_chuan: giaTC,
    gia_tieu_chuan: giaTC,
    Don_gia: donGia,
    don_gia: donGia,
    Don_vi_tien_te: dvtien,
    don_vi_tien_te: dvtien,
    Ti_gia: tiGia,
    ti_gia: tiGia,
    Thue_VAT: thueVat,
    thue_vat: thueVat,
    So_luong: soLuong,
    so_luong: soLuong,
    Trang_thai_hop_dong: statusHD,
    trang_thai_hop_dong: statusHD,
    gia_hardware: toNum(row[20], 0),
    gia_nhap: toNum(row[21], 0),
    'muc_%_off': mucOff,
    muc_phan_tram_off: mucOff,
    don_vi_tien_te_USD: String(row[23] ?? ''),
    Ti_giaUSD: toNum(row[24], 0),
    Gia_tieu_chuanUSD: toNum(row[25], 0),
    Don_giaUS: toNum(row[26], 0),
    Don_giaUSD: toNum(row[26], 0),
    gia_nhapUSD: toNum(row[27], 0),
    start_date: String(row[28] ?? ''),
    end_date: String(row[29] ?? ''),
    is_giahan: String(row[30] ?? ''),
    thoi_gian_bao_hanh: String(row[31] ?? ''),
    thoi_han_bao_hanh: String(row[31] ?? ''),
    volume: String(row[32] ?? ''),
    Description: desc,
    description: desc,
    Don_gia_goc: donGiaGocVnd,
    Don_gia_goc_USD: row[36] !== undefined && row[36] !== '' ? toNum(row[36], toNum(row[26], 0)) : toNum(row[26], 0),
    muc_phan_tram_off_goc: row[37] !== undefined && row[37] !== '' ? toNum(row[37], mucOff) : mucOff,
    gia_hardware_goc: row[38] !== undefined && row[38] !== '' ? toNum(row[38], toNum(row[20], 0)) : toNum(row[20], 0),
    gia_nhap_goc: row[39] !== undefined && row[39] !== '' ? toNum(row[39], toNum(row[21], 0)) : toNum(row[21], 0),
    Don_gia_kho: row[40] !== undefined && row[40] !== '' ? toNum(row[40], 0) : '',
    muc_phan_tram_off_kho: row[41] !== undefined && row[41] !== '' ? toNum(row[41], 0) : '',
    List_price_vnd: row[42] !== undefined && row[42] !== '' ? toNum(row[42], 0) : donGiaGocVnd,
    Don_gia_hop_dong: row[43] !== undefined && row[43] !== '' ? toNum(row[43], donGia) : donGia,
    Thanh_tien_truoc_thue_hop_dong: row[44] !== undefined && row[44] !== '' ? toNum(row[44], donGia * soLuong) : donGia * soLuong,
    Tien_thue_vat_hop_dong: row[45] !== undefined && row[45] !== '' ? toNum(row[45], 0) : 0,
    Thanh_tien_sau_thue_hop_dong: row[46] !== undefined && row[46] !== '' ? toNum(row[46], 0) : 0,
    Don_gia_khach: row[47] !== undefined && row[47] !== '' ? toNum(row[47], donGiaGocVnd) : donGiaGocVnd,
    Thanh_tien_truoc_thue_khach: row[48] !== undefined && row[48] !== '' ? toNum(row[48], donGiaGocVnd * soLuong) : donGiaGocVnd * soLuong,
    Tien_thue_vat_khach: row[49] !== undefined && row[49] !== '' ? toNum(row[49], 0) : 0,
    Thanh_tien_sau_thue_khach: row[50] !== undefined && row[50] !== '' ? toNum(row[50], 0) : 0,
    Chenh_lech_truoc_thue: row[51] !== undefined && row[51] !== '' ? toNum(row[51], 0) : 0,
    ghi_chu: ''
  }
}

function fbKhachHangToRow(item: any, fbKey = ''): any[] {
  if (Array.isArray(item)) {
    const r = item.slice(0, 23)
    while (r.length < 23) r.push('')
    return r
  }
  if (!item || typeof item !== 'object') return new Array(23).fill('')
  return [
    String(item.ma_khach_hang ?? item.Ma_khach_hang ?? fbKey ?? ''),
    String(item.ten_khach_hang ?? item.Ten_khach_hang ?? ''),
    String(item.email_ca_nhan ?? item.Email_ca_nhan ?? ''),
    String(item.so_dien_thoai_ca_nhan ?? item.So_dien_thoai_ca_nhan ?? ''),
    String(item.ma_cong_ty ?? item.Ma_cong_ty ?? ''),
    String(item.ten_cong_ty ?? item.Ten_cong_ty ?? ''),
    String(item.so_dien_thoai_cong_ty ?? item.So_dien_thoai_cong_ty ?? ''),
    String(item.so_fax_cong_ty ?? item.So_fax_cong_ty ?? ''),
    String(item.dia_chi_cong_ty ?? item.Dia_chi_cong_ty ?? ''),
    String(item.email_cong_ty ?? item.Email_cong_ty ?? ''),
    String(item.website_cong_ty ?? item.Website_cong_ty ?? ''),
    String(item.hoa_hong ?? item.Hoa_hong ?? ''),
    String(item.tong_chi_tieu ?? item.Tong_chi_tieu ?? ''),
    String(item.tong_loi_nhuan ?? item.Tong_loi_nhuan ?? ''),
    String(item.trang_thai ?? item.Trang_thai ?? ''),
    String(item.ghi_chu ?? item.Ghi_chu ?? ''),
    String(item.ten_khach_hang_phu ?? item.Ten_khach_hang_phu ?? ''),
    String(item.so_dien_thoai_ca_nhan_phu ?? item.So_dien_thoai_ca_nhan_phu ?? ''),
    String(item.email_ca_nhan_phu ?? item.Email_ca_nhan_phu ?? ''),
    String(item.mst ?? item.MST ?? ''),
    String(item.company ?? item.COMPANY ?? ''),
    String(item.address ?? item.ADDRESS ?? ''),
    String(item.tel ?? item.TEL ?? '')
  ]
}

/* ======================
   REACTIVE DATA STORES & REALTIME LISTENERS
====================== */
const loading = ref(true)
const contracts = ref<Contract[]>([])
const allHdRaw = ref<any[][]>([])
const allDetailsRaw = ref<any[][]>([])
const detailFbKeysByContract = ref<Record<string, string[]>>({})
const detailItemCountMap = ref<Record<string, number>>({})
const detailSearchIndexMap = ref<Record<string, string>>({})
const customersRaw = ref<any[][]>([])
const hangHoaDescMap = ref<Record<string, string>>({})
const hangHoaSkuMap = ref<Record<string, string>>({})
const saleReportMapByKeyOrPo = ref<Record<string, { key: string; soPo: string; paid: number; debt: number; total: number }>>({})
const saleReportCraftMap = ref<Record<string, any>>({})
const pinningSrCraftMa = ref('')

function mapRowToContract(r: any[], fbKey: string): Contract {
  const truocHD = toNum(r[5], 0)
  const vatHD = toNum(r[6], 0)
  const sauHD = toNum(r[7], 0)
  const truocKhach = toNum(r[20], 0) > 0 ? toNum(r[20], 0) : truocHD
  const vatKhach = toNum(r[37], 0) > 0 || truocKhach === 0
    ? toNum(r[37], 0)
    : (truocKhach === truocHD ? vatHD : Math.round(truocKhach * (truocHD > 0 ? vatHD / truocHD : 0)))
  const sauKhach = toNum(r[38], 0) > 0 ? toNum(r[38], 0) : (truocKhach + vatKhach)
  return {
    _fbKey: fbKey,
    ma_hop_dong: String(r[0] || ''),
    so_hop_dong: String(r[1] || ''),
    ma_khach_hang: String(r[2] || ''),
    ten_khach_hang: String(r[3] || ''),
    ngay_tao: String(r[4] || ''),
    tong_truoc_thue: truocHD,
    tong_vat: vatHD,
    tong_sau_thue: sauHD,
    tong_truoc_thue_khach: truocKhach,
    tong_vat_khach: vatKhach,
    tong_sau_thue_khach: sauKhach,
    tong_truoc_thue_list: toNum(r[39], truocKhach),
    gia_mua: toNum(r[40], 0),
    tong_cp: toNum(r[45], toNum(r[40], 0)),
    trang_thai: String(r[15] || ''),
    ghi_chu: String(r[16] || ''),
    don_vi_tien_te: String(r[17] || 'VND'),
    ti_gia: toNum(r[18], 1),
    created_time: String(r[21] || ''),
    so_po: String(r[22] || ''),
    content_of_contract_po: String(r[24] || ''),
    chiet_khau_truoc_thue: toNum(r[25], 0),
    chiet_khau_truoc_thue_pct: toNum(r[26], 0),
    thue_chenh_lech: toNum(r[27], 0),
    thue_chenh_lech_pct: toNum(r[28], 0),
    chenh_lech_gia: toNum(r[29], 0),
    con_lai: toNum(r[30], 0),
    tong_chiet_khau: toNum(r[31], 0),
    ma_hop_dong_goc: String(r[32] || ''),
    is_completed: r[33] === true || r[33] === 'true' || r[33] === 'TRUE' || String(r[15] || '') === 'Chính thức',
    ten_file: String(r[34] || ''),
    link_file: String(r[35] || ''),
    structure: String(r[36] || ''),
    id_sale_report_craft: String(r[41] || ''),
    id_sale_report: String(r[42] || ''),
    ten_file_khach: String(r[43] || ''),
    link_file_khach: String(r[44] || ''),
    lam_tron_ti_suat: Boolean(r[46] === true || String(r[46]).toUpperCase() === 'TRUE')
  }
}

function applyHdSnapshot(data: any) {
  if (!data || typeof data !== 'object') {
    allHdRaw.value = []
    contracts.value = []
    return
  }
  const rows: any[][] = []
  const mapped: Contract[] = []
  for (const [k, v] of Object.entries(data)) {
    const rawObj = v && typeof v === 'object' && !Array.isArray(v) ? (v as any) : null
    const r = fbHopDongTongQuatToRow(v, k)
    const c = mapRowToContract(r, k)
    if (!c.ma_hop_dong) continue
    // Bỏ qua các bản nháp upload ngoài / nhân bản tạo từ SaleReport (HD_CRAFT_*) khi chưa chốt deal
    const isExternalCraft =
      !c.is_completed &&
      (c.ma_hop_dong.startsWith('HD_CRAFT_') || String(rawObj?.source_type || '').trim() === 'external_craft')
    if (isExternalCraft) continue
    rows.push(r)
    mapped.push(c)
  }
  allHdRaw.value = rows
  contracts.value = mapped.reverse()
  // Sync selectedContract if Detail Modal is currently open
  if (selectedContract.value) {
    const updated = contracts.value.find(c => c.ma_hop_dong === selectedContract.value?.ma_hop_dong)
    if (updated) selectedContract.value = updated
  }
}

function applyDetailsSnapshot(data: any) {
  if (!data || typeof data !== 'object') {
    allDetailsRaw.value = []
    detailFbKeysByContract.value = {}
    detailItemCountMap.value = {}
    detailSearchIndexMap.value = {}
    return
  }
  const rows: any[][] = []
  const keysMap: Record<string, string[]> = {}
  const countMap: Record<string, number> = {}
  const searchBuckets: Record<string, string[]> = {}

  for (const [k, v] of Object.entries(data)) {
    const r = fbHopDongChiTietToRow(v)
    rows.push(r)
    const maHD = String(r[0] || '').trim()
    if (!maHD) continue
    if (!keysMap[maHD]) keysMap[maHD] = []
    keysMap[maHD].push(k)
    countMap[maHD] = (countMap[maHD] || 0) + 1
    if (!searchBuckets[maHD]) searchBuckets[maHD] = []
    const token = [r[2], r[3], r[6], r[34], r[52]].filter(Boolean).join(' ').toLowerCase()
    if (token) searchBuckets[maHD].push(token)
  }

  const searchMap: Record<string, string> = {}
  for (const [mhd, arr] of Object.entries(searchBuckets)) {
    searchMap[mhd] = arr.join(' | ')
  }

  allDetailsRaw.value = rows
  detailFbKeysByContract.value = keysMap
  detailItemCountMap.value = countMap
  detailSearchIndexMap.value = searchMap

  if (showDetailModal.value && selectedContract.value) {
    rebuildSelectedContractDetails(selectedContract.value.ma_hop_dong)
  }
}

function applyCustomersSnapshot(data: any) {
  if (!data || typeof data !== 'object') {
    customersRaw.value = []
    return
  }
  customersRaw.value = Object.entries(data).map(([k, v]) => fbKhachHangToRow(v, k))
}

function applyHangHoaSnapshot(data: any) {
  if (!data || typeof data !== 'object') return
  const descMap: Record<string, string> = {}
  const skuMap: Record<string, string> = {}
  Object.values(data).forEach((item: any) => {
    if (!item || typeof item !== 'object') return
    const ma = String(item.Ma_hang ?? item.ma_hang ?? '').trim()
    const desc = String(item.Description ?? item.description ?? '').trim()
    const sku = String(item.sku_code ?? item.SKU ?? item.sku ?? item.ma_sku ?? '').trim()
    if (ma && desc) descMap[ma] = desc
    if (ma && sku) skuMap[ma] = sku
  })
  hangHoaDescMap.value = descMap
  hangHoaSkuMap.value = skuMap
}

function applySaleReportSnapshot(data: any) {
  const map: Record<string, { key: string; soPo: string; paid: number; debt: number; total: number }> = {}
  if (data && typeof data === 'object') {
    for (const [k, v] of Object.entries(data) as [string, any][]) {
      if (!v || typeof v !== 'object') continue
      const total = toNum(v.Tong_tien_sau_thueVAT ?? v.tong_sau_vat, 0)
      const paid = toNum(v.so_tien_da_thanh_toan, 0)
      const debt = v.cong_no !== undefined && v.cong_no !== '' ? toNum(v.cong_no, 0) : Math.max(0, total - paid)
      const soPo = String(v.So_PO ?? v.so_po ?? v.soPO ?? '').trim()
      const maHD = String(v.ma_hop_dong ?? v.Ma_hop_dong ?? '').trim()
      const info = { key: k, soPo, paid, debt, total }
      map[`KEY:${k}`] = info
      if (maHD) map[`HD:${maHD}`] = info
      if (soPo) map[`PO:${soPo}`] = info
    }
  }
  saleReportMapByKeyOrPo.value = map
}

function applySaleReportCraftSnapshot(data: any) {
  const map: Record<string, any> = {}
  if (data && typeof data === 'object') {
    for (const [k, v] of Object.entries(data) as [string, any][]) {
      if (!v || typeof v !== 'object') continue
      map[k] = v
    }
  }
  saleReportCraftMap.value = map
}

const unsubscribers: Array<() => void> = []

function setupRealtimeSubscriptions() {
  let initialResolved = 0
  const markReady = () => {
    initialResolved++
    if (initialResolved >= 2) loading.value = false
  }

  unsubscribers.push(
    onValue(dbRef(database, 'hop_dong_tong_quat'), snap => {
      applyHdSnapshot(snap.val())
      markReady()
    }, () => markReady())
  )
  unsubscribers.push(
    onValue(dbRef(database, 'hop_dong_chi_tiet'), snap => {
      applyDetailsSnapshot(snap.val())
      markReady()
    }, () => markReady())
  )
  unsubscribers.push(
    onValue(dbRef(database, 'khach_hang'), snap => {
      applyCustomersSnapshot(snap.val())
    })
  )
  unsubscribers.push(
    onValue(dbRef(database, 'hang_hoa'), snap => {
      applyHangHoaSnapshot(snap.val())
    })
  )
  unsubscribers.push(
    onValue(dbRef(database, 'sale_report'), snap => {
      applySaleReportSnapshot(snap.val())
    })
  )
  unsubscribers.push(
    onValue(dbRef(database, 'sale_report_craft'), snap => {
      applySaleReportCraftSnapshot(snap.val())
    })
  )
}

async function fetchData(showToastOnDone = false) {
  loading.value = true
  try {
    const [hdSnap, ctSnap, khSnap, hhSnap, srSnap, srCraftSnap] = await Promise.all([
      get(dbRef(database, 'hop_dong_tong_quat')),
      get(dbRef(database, 'hop_dong_chi_tiet')),
      get(dbRef(database, 'khach_hang')),
      get(dbRef(database, 'hang_hoa')),
      get(dbRef(database, 'sale_report')),
      get(dbRef(database, 'sale_report_craft'))
    ])
    applyHdSnapshot(hdSnap.val())
    applyDetailsSnapshot(ctSnap.val())
    applyCustomersSnapshot(khSnap.val())
    applyHangHoaSnapshot(hhSnap.val())
    applySaleReportSnapshot(srSnap.val())
    applySaleReportCraftSnapshot(srCraftSnap.val())
    if (showToastOnDone) triggerToast('Đã đồng bộ dữ liệu báo giá mới nhất', 'success')
  } catch (err) {
    console.error(err)
    triggerToast('Không thể tải dữ liệu từ Firebase', 'error')
  } finally {
    loading.value = false
  }
}

/* ======================
   CUSTOMER & LOOKUP HELPERS
====================== */
const customerMap = computed(() => {
  const m = new Map<string, any[]>()
  customersRaw.value.forEach(r => {
    const id = String(r[0] || '').trim()
    if (id) m.set(id, r)
  })
  return m
})

function getCustomerInfo(maKH: string) {
  const row = customerMap.value.get(String(maKH || '').trim())
  if (!row) return { mst: '', tenCongTy: '', diaChi: '', tenKH: '' }
  return {
    mst: String(row[19] || ''),
    tenCongTy: String(row[5] || row[20] || ''),
    diaChi: String(row[8] || row[21] || ''),
    tenKH: String(row[1] || '')
  }
}

function getHangHoaDescription(maHang: string): string {
  const ma = String(maHang || '').trim()
  if (!ma) return ''
  if (hangHoaDescMap.value[ma]) return hangHoaDescMap.value[ma]
  return hangHoaDescMap.value[ma.replace(/-V\d+$/, '')] || ''
}

function getHangHoaSkuCode(maHang: string): string {
  const ma = String(maHang || '').trim()
  if (!ma) return ''
  if (hangHoaSkuMap.value[ma]) return hangHoaSkuMap.value[ma]
  return hangHoaSkuMap.value[ma.replace(/-V\d+$/, '')] || ''
}

function getContractItemCount(maHD: string): number {
  return detailItemCountMap.value[maHD] || 0
}

function getContractTruocThue(c: Contract): number {
  return priceViewMode.value === 'khach' ? c.tong_truoc_thue_khach : c.tong_truoc_thue
}
function getContractVat(c: Contract): number {
  return priceViewMode.value === 'khach' ? c.tong_vat_khach : c.tong_vat
}
function getContractSauThue(c: Contract): number {
  return priceViewMode.value === 'khach' ? c.tong_sau_thue_khach : c.tong_sau_thue
}
function getContractNetCom(c: Contract): number {
  return c.con_lai || c.tong_chiet_khau || 0
}
function hasPriceDiff(c: Contract): boolean {
  return Math.abs(c.tong_sau_thue - c.tong_sau_thue_khach) > 10
}

function getLinkedSaleReportRecord(c: Contract | null) {
  if (!c) return null
  const map = saleReportMapByKeyOrPo.value
  if (c.id_sale_report && map[`KEY:${c.id_sale_report}`]) return map[`KEY:${c.id_sale_report}`]
  if (c.ma_hop_dong && map[`HD:${c.ma_hop_dong}`]) return map[`HD:${c.ma_hop_dong}`]
  if (c.so_po && map[`PO:${c.so_po}`]) return map[`PO:${c.so_po}`]
  return null
}

function getPaymentStatusBadge(c: Contract): { label: string; cls: string } | null {
  if (!c.is_completed) return null
  const sr = getLinkedSaleReportRecord(c)
  if (!sr) return null
  if (sr.debt <= 0 && sr.total > 0) {
    return { label: 'Đã thu đủ', cls: 'is-emerald' }
  }
  if (sr.paid > 0 && sr.debt > 0) {
    return { label: `Nợ ${formatCompactVND(sr.debt)}`, cls: 'is-amber' }
  }
  if (sr.debt > 0) {
    return { label: `Chưa thu ${formatCompactVND(sr.debt)}`, cls: 'is-rose' }
  }
  return null
}

/* ======================
   SEARCH, FILTERING & SORTING
====================== */
const searchKeyword = ref('')
const customerFilter = ref('ALL')
const dashboardFilter = ref<'ALL' | 'PROCESSING' | 'COMPLETED'>('ALL')
const sortMode = ref<'DESC' | 'ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('DESC')
const dateQuickRange = ref<'all' | 'today' | '7d' | 'month' | 'quarter' | 'year' | 'custom'>('all')
const customDateFrom = ref('')
const customDateTo = ref('')

const dateQuickOptions: { value: typeof dateQuickRange.value; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'today', label: 'Hôm nay' },
  { value: '7d', label: '7 ngày' },
  { value: 'month', label: 'Tháng này' },
  { value: 'quarter', label: 'Quý này' },
  { value: 'year', label: 'Năm nay' },
  { value: 'custom', label: 'Tùy chọn' }
]

function setDateQuickRange(val: typeof dateQuickRange.value) {
  dateQuickRange.value = val
  if (val === 'custom' && !customDateFrom.value && !customDateTo.value) {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    customDateTo.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    customDateFrom.value = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`
  }
}

const hasActiveFilters = computed(() => {
  return (
    Boolean(searchKeyword.value.trim()) ||
    customerFilter.value !== 'ALL' ||
    dashboardFilter.value !== 'ALL' ||
    dateQuickRange.value !== 'all'
  )
})

function resetAllFilters() {
  searchKeyword.value = ''
  customerFilter.value = 'ALL'
  dashboardFilter.value = 'ALL'
  dateQuickRange.value = 'all'
  customDateFrom.value = ''
  customDateTo.value = ''
}

function stripVN(s: string): string {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

function parseVietnameseDate(str: string): Date | null {
  if (!str) return null
  const s = str.trim()
  const mTimeFirst = s.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?[.,\s]+(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (mTimeFirst) {
    return new Date(+mTimeFirst[6], +mTimeFirst[5] - 1, +mTimeFirst[4], +mTimeFirst[1], +mTimeFirst[2], +(mTimeFirst[3] || 0))
  }
  const mDateFirst = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/)
  if (mDateFirst) {
    return new Date(+mDateFirst[3], +mDateFirst[2] - 1, +mDateFirst[1], +(mDateFirst[4] || 0), +(mDateFirst[5] || 0), +(mDateFirst[6] || 0))
  }
  const iso = new Date(s)
  return isNaN(iso.getTime()) ? null : iso
}

function getActiveDateBounds(): { from: Date | null; to: Date | null } {
  const mode = dateQuickRange.value
  if (mode === 'all') return { from: null, to: null }
  const now = new Date()
  if (mode === 'today') {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
      to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    }
  }
  if (mode === '7d') {
    const f = new Date(now)
    f.setDate(now.getDate() - 6)
    f.setHours(0, 0, 0, 0)
    return { from: f, to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999) }
  }
  if (mode === 'month') {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    }
  }
  if (mode === 'quarter') {
    const qStart = Math.floor(now.getMonth() / 3) * 3
    return {
      from: new Date(now.getFullYear(), qStart, 1, 0, 0, 0, 0),
      to: new Date(now.getFullYear(), qStart + 3, 0, 23, 59, 59, 999)
    }
  }
  if (mode === 'year') {
    return {
      from: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0),
      to: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
    }
  }
  if (mode === 'custom') {
    const from = customDateFrom.value ? new Date(customDateFrom.value + 'T00:00:00') : null
    const to = customDateTo.value ? new Date(customDateTo.value + 'T23:59:59.999') : null
    return { from, to }
  }
  return { from: null, to: null }
}

function compareContracts(a: Contract, b: Contract): number {
  if (sortMode.value === 'AMOUNT_DESC') return getContractSauThue(b) - getContractSauThue(a)
  if (sortMode.value === 'AMOUNT_ASC') return getContractSauThue(a) - getContractSauThue(b)
  const da = parseVietnameseDate(a.created_time || a.ngay_tao)?.getTime() || 0
  const db = parseVietnameseDate(b.created_time || b.ngay_tao)?.getTime() || 0
  return sortMode.value === 'ASC' ? da - db : db - da
}

const filteredContracts = computed(() => {
  const kwRaw = searchKeyword.value.trim().toLowerCase()
  const kwPlain = kwRaw ? stripVN(kwRaw) : ''
  const kwTokens = kwPlain ? kwPlain.split(/\s+/).filter(Boolean) : []
  const { from, to } = getActiveDateBounds()

  const list = contracts.value.filter(c => {
    if (customerFilter.value !== 'ALL' && c.ma_khach_hang !== customerFilter.value) {
      return false
    }
    if (from || to) {
      const d = parseVietnameseDate(c.ngay_tao || c.created_time)
      if (!d) return false
      if (from && d < from) return false
      if (to && d > to) return false
    }
    if (kwTokens.length > 0) {
      const cust = getCustomerInfo(c.ma_khach_hang)
      const detailBlob = detailSearchIndexMap.value[c.ma_hop_dong] || ''
      const haystack = stripVN(
        [
          c.ma_hop_dong,
          c.so_hop_dong,
          c.ma_hop_dong_goc,
          c.so_po,
          c.ten_khach_hang,
          cust.tenCongTy,
          cust.mst,
          c.content_of_contract_po,
          c.ghi_chu,
          detailBlob
        ].join(' ')
      )
      if (!kwTokens.every(t => haystack.includes(t))) return false
    }
    return true
  })

  return list.sort(compareContracts)
})

const groupedContracts = computed((): ContractGroup[] => {
  const byGoc = new Map<string, Contract[]>()
  // Group all contracts that share ma_hop_dong_goc where count >= 2 OR ma_hop_dong_goc !== ma_hop_dong
  const tempBucket = new Map<string, Contract[]>()
  filteredContracts.value.forEach(c => {
    const gocKey = String(c.ma_hop_dong_goc || c.ma_hop_dong).trim()
    if (!tempBucket.has(gocKey)) tempBucket.set(gocKey, [])
    const arr = tempBucket.get(gocKey)!
    if (!arr.some(x => x.ma_hop_dong === c.ma_hop_dong)) arr.push(c)
  })

  tempBucket.forEach((vers, goc) => {
    const isMultiOrChild = vers.length > 1 || vers.some(v => v.ma_hop_dong_goc && v.ma_hop_dong_goc !== v.ma_hop_dong)
    if (isMultiOrChild) {
      // Sort versions inside a group newest first so latest[0] is always the most recent version
      const sortedVers = [...vers].sort((a, b) => {
        if (a.is_completed !== b.is_completed) return a.is_completed ? -1 : 1
        const da = parseVietnameseDate(a.created_time || a.ngay_tao)?.getTime() || 0
        const db = parseVietnameseDate(b.created_time || b.ngay_tao)?.getTime() || 0
        return db - da
      })
      byGoc.set(goc, sortedVers)
    }
  })

  const groups: ContractGroup[] = []
  byGoc.forEach((versions, goc) => {
    if (versions.length > 0) groups.push({ goc, latest: versions[0], versions })
  })
  return groups.sort((a, b) => compareContracts(a.latest, b.latest))
})

const standaloneContracts = computed((): Contract[] => {
  const groupedIds = new Set<string>()
  groupedContracts.value.forEach(g => {
    g.versions.forEach(v => groupedIds.add(v.ma_hop_dong))
  })
  return filteredContracts.value.filter(c => !groupedIds.has(c.ma_hop_dong))
})

function isGroupCompleted(g: ContractGroup): boolean {
  return g.versions.some(v => v.is_completed || v.trang_thai === 'Chính thức')
}

function getGroupOfficialPo(g: ContractGroup): string {
  const off = g.versions.find(v => v.is_completed || v.trang_thai === 'Chính thức')
  return off?.so_po || (off ? 'Đã chốt' : '')
}

const totalGroups = computed(() => groupedContracts.value.length + standaloneContracts.value.length)
const completedGroups = computed(() => {
  return (
    groupedContracts.value.filter(g => isGroupCompleted(g)).length +
    standaloneContracts.value.filter(c => c.is_completed).length
  )
})
const processingGroups = computed(() => {
  return (
    groupedContracts.value.filter(g => !isGroupCompleted(g)).length +
    standaloneContracts.value.filter(c => !c.is_completed).length
  )
})

const displayedGroupedContracts = computed(() => {
  if (dashboardFilter.value === 'ALL') return groupedContracts.value
  if (dashboardFilter.value === 'COMPLETED') return groupedContracts.value.filter(g => isGroupCompleted(g))
  return groupedContracts.value.filter(g => !isGroupCompleted(g))
})

const displayedStandaloneContracts = computed(() => {
  if (dashboardFilter.value === 'ALL') return standaloneContracts.value
  if (dashboardFilter.value === 'COMPLETED') return standaloneContracts.value.filter(c => c.is_completed)
  return standaloneContracts.value.filter(c => !c.is_completed)
})

const displayedTableContracts = computed(() => {
  if (dashboardFilter.value === 'ALL') return filteredContracts.value
  if (dashboardFilter.value === 'COMPLETED') return filteredContracts.value.filter(c => c.is_completed)
  return filteredContracts.value.filter(c => !c.is_completed)
})

const kpiMetrics = computed(() => {
  const repUnits: Contract[] = [
    ...displayedGroupedContracts.value.map(g => g.latest),
    ...displayedStandaloneContracts.value
  ]
  let activeTruocThue = 0
  let activeSauThue = 0
  let totalNetCom = 0
  repUnits.forEach(c => {
    activeTruocThue += getContractTruocThue(c)
    activeSauThue += getContractSauThue(c)
    totalNetCom += getContractNetCom(c)
  })

  const draftUnits: Contract[] = [
    ...groupedContracts.value.filter(g => !isGroupCompleted(g)).map(g => g.latest),
    ...standaloneContracts.value.filter(c => !c.is_completed)
  ]
  const draftSauThue = draftUnits.reduce((acc, c) => acc + getContractSauThue(c), 0)
  const winRate = totalGroups.value > 0 ? Math.round((completedGroups.value / totalGroups.value) * 100) : 0

  return { activeTruocThue, activeSauThue, totalNetCom, draftSauThue, winRate }
})

const hasAnyDisplayedData = computed(() => {
  return layoutMode.value === 'table'
    ? displayedTableContracts.value.length > 0
    : displayedGroupedContracts.value.length > 0 || displayedStandaloneContracts.value.length > 0
})

/* ======================
   COLLAPSE GROUPS & INTERSECTIONOBSERVER LAZY LOADING
====================== */
const collapsedGroups = reactive<Record<string, boolean>>({})
function toggleGroup(goc: string) {
  collapsedGroups[goc] = !collapsedGroups[goc]
}
const areAllGroupsCollapsed = computed(() => {
  const list = displayedGroupedContracts.value
  return list.length > 0 && list.every(g => Boolean(collapsedGroups[g.goc]))
})
function toggleAllGroupsCollapse() {
  const target = !areAllGroupsCollapsed.value
  displayedGroupedContracts.value.forEach(g => {
    collapsedGroups[g.goc] = target
  })
}

const CARD_LAZY_BATCH = 16
const TABLE_LAZY_BATCH = 30
const MODAL_CUST_LAZY_BATCH = 25

const cardDisplayLimit = ref(CARD_LAZY_BATCH)
const tableDisplayLimit = ref(TABLE_LAZY_BATCH)

const totalCardUnitsCount = computed(
  () => displayedGroupedContracts.value.length + displayedStandaloneContracts.value.length
)

const paginatedGroupedContracts = computed(() => {
  return displayedGroupedContracts.value.slice(0, cardDisplayLimit.value)
})

const paginatedStandaloneContracts = computed(() => {
  const rem = cardDisplayLimit.value - paginatedGroupedContracts.value.length
  if (rem <= 0) return []
  return displayedStandaloneContracts.value.slice(0, rem)
})

const visibleCardUnitsCount = computed(
  () => paginatedGroupedContracts.value.length + paginatedStandaloneContracts.value.length
)

const hasMoreCards = computed(() => visibleCardUnitsCount.value < totalCardUnitsCount.value)
function loadMoreCards() {
  if (hasMoreCards.value) cardDisplayLimit.value += CARD_LAZY_BATCH
}

const paginatedTableContracts = computed(() => displayedTableContracts.value.slice(0, tableDisplayLimit.value))
const hasMoreTableRows = computed(() => paginatedTableContracts.value.length < displayedTableContracts.value.length)
function loadMoreTableRows() {
  if (hasMoreTableRows.value) tableDisplayLimit.value += TABLE_LAZY_BATCH
}

watch([searchKeyword, customerFilter, dashboardFilter, dateQuickRange, customDateFrom, customDateTo, sortMode], () => {
  cardDisplayLimit.value = CARD_LAZY_BATCH
  tableDisplayLimit.value = TABLE_LAZY_BATCH
})

const cardLazySentinelRef = ref<HTMLElement | null>(null)
const tableLazySentinelRef = ref<HTMLElement | null>(null)
const customerModalSentinelRef = ref<HTMLElement | null>(null)

let cardObserver: IntersectionObserver | null = null
let tableObserver: IntersectionObserver | null = null
let custModalObserver: IntersectionObserver | null = null

watch(cardLazySentinelRef, el => {
  if (cardObserver) {
    cardObserver.disconnect()
    cardObserver = null
  }
  if (el && typeof IntersectionObserver !== 'undefined') {
    cardObserver = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) loadMoreCards()
      },
      { rootMargin: '260px' }
    )
    cardObserver.observe(el)
  }
})

watch(tableLazySentinelRef, el => {
  if (tableObserver) {
    tableObserver.disconnect()
    tableObserver = null
  }
  if (el && typeof IntersectionObserver !== 'undefined') {
    tableObserver = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) loadMoreTableRows()
      },
      { rootMargin: '260px' }
    )
    tableObserver.observe(el)
  }
})

/* ======================
   CUSTOMER FILTER MODAL (LAZY LOADED) & PROFILE MODAL
====================== */
const showCustomerModal = ref(false)
const customerModalSearch = ref('')
const customerModalLimit = ref(MODAL_CUST_LAZY_BATCH)

const uniqueCustomersForFilter = computed(() => {
  const counts = new Map<string, { id: string; name: string; tenCongTy: string; mst: string; quoteCount: number }>()
  contracts.value.forEach(c => {
    const id = String(c.ma_khach_hang || '').trim()
    if (!id) return
    const existing = counts.get(id)
    if (existing) {
      existing.quoteCount++
    } else {
      const info = getCustomerInfo(id)
      counts.set(id, {
        id,
        name: c.ten_khach_hang || info.tenKH || id,
        tenCongTy: info.tenCongTy,
        mst: info.mst,
        quoteCount: 1
      })
    }
  })
  return Array.from(counts.values()).sort((a, b) => (a.tenCongTy || a.name).localeCompare(b.tenCongTy || b.name, 'vi'))
})

const filteredModalCustomers = computed(() => {
  const q = stripVN(customerModalSearch.value.trim())
  if (!q) return uniqueCustomersForFilter.value
  return uniqueCustomersForFilter.value.filter(c => {
    return (
      stripVN(c.name).includes(q) ||
      stripVN(c.tenCongTy).includes(q) ||
      stripVN(c.mst).includes(q) ||
      stripVN(c.id).includes(q)
    )
  })
})

const visibleModalCustomers = computed(() => filteredModalCustomers.value.slice(0, customerModalLimit.value))
const hasMoreModalCustomers = computed(() => visibleModalCustomers.value.length < filteredModalCustomers.value.length)

watch(customerModalSearch, () => {
  customerModalLimit.value = MODAL_CUST_LAZY_BATCH
})

watch(customerModalSentinelRef, el => {
  if (custModalObserver) {
    custModalObserver.disconnect()
    custModalObserver = null
  }
  if (el && typeof IntersectionObserver !== 'undefined') {
    custModalObserver = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting) && hasMoreModalCustomers.value) {
          customerModalLimit.value += MODAL_CUST_LAZY_BATCH
        }
      },
      { rootMargin: '160px' }
    )
    custModalObserver.observe(el)
  }
})

const customerPickerForDetail = ref(false)

function openCustomerModal(forDetail = false) {
  customerPickerForDetail.value = forDetail
  customerModalSearch.value = ''
  customerModalLimit.value = MODAL_CUST_LAZY_BATCH
  showCustomerModal.value = true
}

function selectCustomerFilter(id: string) {
  if (customerPickerForDetail.value && selectedContract.value) {
    customerPickerForDetail.value = false
    showCustomerModal.value = false
    applyPickedCustomerToDetailModal(id)
    return
  }
  customerPickerForDetail.value = false
  customerFilter.value = id
  showCustomerModal.value = false
}

const selectedCustomerLabel = computed(() => {
  if (customerFilter.value === 'ALL') return 'Tất cả khách hàng'
  const found = uniqueCustomersForFilter.value.find(c => c.id === customerFilter.value)
  if (found) return found.tenCongTy || found.name
  const info = getCustomerInfo(customerFilter.value)
  return info.tenCongTy || info.tenKH || customerFilter.value
})

const showCustomerInfoModal = ref(false)
const customerInfoData = ref<any>({})

function openCustomerInfoModal(maKH: string) {
  const row = customerMap.value.get(String(maKH || '').trim())
  if (row) {
    customerInfoData.value = {
      maKH: String(row[0] || ''),
      tenKH: String(row[1] || ''),
      email: String(row[2] || ''),
      sdt: String(row[3] || ''),
      tenCongTy: String(row[5] || ''),
      sdtCongTy: String(row[6] || ''),
      fax: String(row[7] || ''),
      diaChi: String(row[8] || ''),
      emailCongTy: String(row[9] || ''),
      website: String(row[10] || ''),
      congNo: String(row[13] || ''),
      trangThai: String(row[14] || ''),
      ghiChu: String(row[15] || ''),
      tenKHPhu: String(row[16] || ''),
      sdtPhu: String(row[17] || ''),
      emailPhu: String(row[18] || ''),
      mst: String(row[19] || ''),
      company: String(row[20] || ''),
      address: String(row[21] || ''),
      tel: String(row[22] || '')
    }
  } else {
    customerInfoData.value = { maKH }
  }
  showCustomerInfoModal.value = true
}

function filterByCustomerFromProfile(maKH: string) {
  customerFilter.value = maKH
  showCustomerInfoModal.value = false
  triggerToast('Đã lọc báo giá theo khách hàng đã chọn', 'info')
}

/* ======================
   DETAIL MODAL & 3-MODE PRICING + USD/VND ENGINE
====================== */
const showDetailModal = ref(false)
const activeMobileSubTab = ref<'chitiet' | 'tongket'>('chitiet')
const selectedContract = ref<Contract | null>(null)
const loadingDetails = ref(false)
const selectedContractDetails = ref<ContractDetail[]>([])

function rebuildSelectedContractDetails(maHopDong: string) {
  selectedContractDetails.value = allDetailsRaw.value
    .filter(r => String(r[0] || '').trim() === maHopDong)
    .map(r => {
      const maHang = String(r[2] || '')
      const hasExplicitKhach = (r[35] !== undefined && r[35] !== '') || (r[47] !== undefined && r[47] !== '')
      return {
        ma_hang: maHang,
        sku_code: String(r[34] || getHangHoaSkuCode(maHang) || ''),
        ten_hang: String(r[3] || ''),
        ten_hang_bao_gia: String(r[52] || ''),
        dien_giai_bao_gia: String(r[53] || ''),
        description: String(r[33] || getHangHoaDescription(maHang) || ''),
        dvt: String(r[12] || ''),
        so_luong: Math.max(1, toNum(r[18], 1)),
        don_gia: toNum(r[14], 0),
        gia_tieu_chuan: toNum(r[13], 0),
        ma_ncc: String(r[5] || ''),
        ten_ncc: String(r[6] || ''),
        mo_ta_chung: String(r[7] || ''),
        mo_ta_chi_tiet: String(r[8] || ''),
        features: String(r[9] || ''),
        danh_muc: String(r[10] || ''),
        license_duration: String(r[11] || ''),
        thue_vat: toNum(r[17], 0),
        gia_hardware: toNum(r[20], 0),
        gia_nhap: toNum(r[21], 0),
        muc_off: toNum(r[22], 0),
        don_vi_tien_te: String(r[15] || 'VND'),
        ti_gia: toNum(r[16], 1),
        don_vi_tien_te_usd: String(r[23] || ''),
        ti_gia_usd: toNum(r[24], 0),
        gia_tieu_chuan_usd: toNum(r[25], 0),
        don_gia_usd: toNum(r[26], 0),
        gia_nhap_usd: toNum(r[27], 0),
        thoi_han_bao_hanh: String(r[31] || ''),
        volume: String(r[32] || ''),
        don_gia_goc: toNum(r[35], 0),
        don_gia_goc_usd: toNum(r[36], 0),
        muc_off_goc: r[37] !== undefined && r[37] !== '' ? toNum(r[37], 0) : toNum(r[22], 0),
        gia_hardware_goc: r[38] !== undefined && r[38] !== '' ? toNum(r[38], 0) : toNum(r[20], 0),
        gia_nhap_goc: r[39] !== undefined && r[39] !== '' ? toNum(r[39], 0) : toNum(r[21], 0),
        list_price_vnd: toNum(r[42], 0),
        don_gia_hop_dong_saved: toNum(r[43], 0),
        tt_truoc_hd_saved: toNum(r[44], 0),
        don_gia_khach_saved: toNum(r[47], 0),
        tt_truoc_khach_saved: toNum(r[48], 0),
        has_explicit_khach: hasExplicitKhach
      }
    })
}

const showCompareFinancePanel = ref(true)
const cmpSrPriceSource = ref<'contract' | 'customer'>('contract')
const activeDetailDockTab = ref<'customer' | 'files' | 'discount' | 'finance' | ''>('discount')
const modalChietKhauTruocThuePct = ref(0)
const modalThueChenhLechPct = ref(25)
const modalCustEdit = reactive({
  maKH: '',
  mst: '',
  tenKH: '',
  tenCongTy: ''
})
const savingModalMetrics = ref(false)
let suppressModalPersist = false
let persistModalTimer: ReturnType<typeof setTimeout> | null = null

function toggleDetailDockTab(tab: 'customer' | 'files' | 'discount' | 'finance') {
  activeDetailDockTab.value = activeDetailDockTab.value === tab ? '' : tab
}

type CmpSrComAdjustHistoryEntry = {
  field: 'grossCom' | 'netCom'
  prevGrossOverride: number | null
  prevNetOverride: number | null
  prevGrossPctOverride: number | null
  prevComPctActive: boolean
  prevPredictPct: string
  prevDisplayGross: number
  prevDisplayNet: number
  delta: number
}

type CmpSrOverrideBucket = {
  doanhSoBan: number | null
  giaMua: number | null
  tongCP: number | null
  grossCom: number | null
  netCom: number | null
  grossComPct: number | null
  _comPctActive: boolean
  taxPct: number | null
  predictPct: string
  lamTronTiSuat: boolean
  _origGross: number | null
  _origNet: number | null
  _hasOrigSaved: boolean
  _comAdjustOpenField?: 'grossCom' | 'netCom' | null
  _comAdjustSign?: 1 | -1
  _comAdjustAmount?: number
  _comAdjustHistory?: CmpSrComAdjustHistoryEntry[]
}

function createEmptyCmpSrBucket(): CmpSrOverrideBucket {
  return {
    doanhSoBan: null,
    giaMua: null,
    tongCP: null,
    grossCom: null,
    netCom: null,
    grossComPct: null,
    _comPctActive: false,
    taxPct: null,
    predictPct: '',
    lamTronTiSuat: false,
    _origGross: null,
    _origNet: null,
    _hasOrigSaved: false,
    _comAdjustOpenField: null,
    _comAdjustSign: 1,
    _comAdjustAmount: 0,
    _comAdjustHistory: []
  }
}

const cmpSrOverridesMap = reactive<{
  contract: CmpSrOverrideBucket
  customer: CmpSrOverrideBucket
}>({
  contract: createEmptyCmpSrBucket(),
  customer: createEmptyCmpSrBucket()
})

const cmpSrOverrides = computed(() => cmpSrOverridesMap[cmpSrPriceSource.value])

function resetAllCmpSrOverrides() {
  Object.assign(cmpSrOverridesMap.contract, createEmptyCmpSrBucket())
  Object.assign(cmpSrOverridesMap.customer, createEmptyCmpSrBucket())
}

function viewDetails(contract: Contract) {
  suppressModalPersist = true
  selectedContract.value = contract
  detailViewMode.value = priceViewMode.value
  cmpSrPriceSource.value = priceViewMode.value === 'khach' ? 'customer' : 'contract'
  quoteCurrency.value = 'VND'
  activeMobileSubTab.value = 'chitiet'
  showCompareFinancePanel.value = true
  if (!activeDetailDockTab.value) activeDetailDockTab.value = 'discount'
  showDetailModal.value = true
  loadingDetails.value = true
  rebuildSelectedContractDetails(contract.ma_hop_dong)
  initModalMetricsFromContract(contract)
  loadingDetails.value = false
  nextTick(() => {
    suppressModalPersist = false
  })
}

const effectiveModalExchangeRate = computed(() => {
  const itemWithUsdRate = selectedContractDetails.value.find(d => d.ti_gia_usd > 100)
  if (itemWithUsdRate) return itemWithUsdRate.ti_gia_usd
  const itemWithTg = selectedContractDetails.value.find(d => d.ti_gia > 100)
  if (itemWithTg) return itemWithTg.ti_gia
  if (selectedContract.value && selectedContract.value.ti_gia > 100) return selectedContract.value.ti_gia
  return 25400
})

function vndToModalCurrency(vndVal: number): number {
  if (quoteCurrency.value === 'USD') {
    return round2(vndVal / effectiveModalExchangeRate.value)
  }
  return Math.round(vndVal)
}

function lineUnitHDVnd(d: ContractDetail): number {
  if (d.ti_gia_usd > 1) {
    const usd = (d.gia_hardware + d.don_gia_usd) * (1 - d.muc_off / 100) + d.gia_nhap_usd
    return usd * d.ti_gia_usd
  }
  const effTg = d.ti_gia > 1 ? d.ti_gia : 1
  return ((d.gia_hardware + d.don_gia) * (1 - d.muc_off / 100) + d.gia_nhap) * effTg
}

function lineUnitKhachVnd(d: ContractDetail): number {
  if (!d.has_explicit_khach) return lineUnitHDVnd(d)
  if (d.ti_gia_usd > 1) {
    const baseUsd = d.don_gia_goc_usd > 0 ? d.don_gia_goc_usd : (d.don_gia_goc > 0 ? d.don_gia_goc / d.ti_gia_usd : d.don_gia_usd)
    const nhapUsd = d.gia_nhap_goc
    const usd = (d.gia_hardware_goc + baseUsd) * (1 - d.muc_off_goc / 100) + nhapUsd
    return usd * d.ti_gia_usd
  }
  const baseVnd = d.don_gia_goc > 0 ? d.don_gia_goc : (d.don_gia_khach_saved > 0 ? d.don_gia_khach_saved : d.don_gia)
  return (d.gia_hardware_goc + baseVnd) * (1 - d.muc_off_goc / 100) + d.gia_nhap_goc
}

function lineUnitCostVnd(d: ContractDetail): number {
  if (d.ti_gia_usd > 1 && d.gia_tieu_chuan_usd > 0) {
    return d.gia_tieu_chuan_usd * d.ti_gia_usd
  }
  const effTg = d.ti_gia > 1 ? d.ti_gia : 1
  return d.gia_tieu_chuan * effTg
}

function lineUnitHD(d: ContractDetail) { return vndToModalCurrency(lineUnitHDVnd(d)) }
function lineUnitKhach(d: ContractDetail) { return vndToModalCurrency(lineUnitKhachVnd(d)) }
function lineUnitCost(d: ContractDetail) { return vndToModalCurrency(lineUnitCostVnd(d)) }

function lineTruocHD(d: ContractDetail) { return vndToModalCurrency(lineUnitHDVnd(d) * d.so_luong) }
function lineSauHD(d: ContractDetail) {
  const tr = lineUnitHDVnd(d) * d.so_luong
  return vndToModalCurrency(tr * (1 + d.thue_vat / 100))
}
function lineTruocKhach(d: ContractDetail) { return vndToModalCurrency(lineUnitKhachVnd(d) * d.so_luong) }
function lineSauKhach(d: ContractDetail) {
  const tr = lineUnitKhachVnd(d) * d.so_luong
  return vndToModalCurrency(tr * (1 + d.thue_vat / 100))
}
function lineDeltaHDKhach(d: ContractDetail) {
  return vndToModalCurrency((lineUnitHDVnd(d) - lineUnitKhachVnd(d)) * d.so_luong)
}
function lineNetMargin(d: ContractDetail) {
  return vndToModalCurrency((lineUnitKhachVnd(d) - lineUnitCostVnd(d)) * d.so_luong)
}

function getDisplayItemDesc(d: ContractDetail): string {
  if (d.dien_giai_bao_gia) return d.dien_giai_bao_gia
  if (d.description) return d.description
  return [d.mo_ta_chung, d.mo_ta_chi_tiet, d.features].filter(Boolean).join(' · ')
}

const groupedDetails = computed(() => {
  const rows = selectedContractDetails.value
  const groups: { key: string; title: string; items: ContractDetail[] }[] = []
  let currentGroup = '__init__'
  rows.forEach(d => {
    const cat = String(d.danh_muc || '').trim()
    if (cat !== currentGroup) {
      currentGroup = cat
      groups.push({ key: cat || '__ungrouped__', title: cat, items: [] })
    }
    groups[groups.length - 1].items.push(d)
  })
  return groups
})

const modalRawLineSums = computed(() => {
  const rows = selectedContractDetails.value
  let calcHdTruoc = 0
  let calcHdVat = 0
  let calcKhachTruoc = 0
  let calcKhachVat = 0
  let calcCost = 0
  let calcList = 0

  rows.forEach(d => {
    const trHd = lineUnitHDVnd(d) * d.so_luong
    const vatHd = trHd * (d.thue_vat / 100)
    const trKh = lineUnitKhachVnd(d) * d.so_luong
    const vatKh = trKh * (d.thue_vat / 100)
    const cost = lineUnitCostVnd(d) * d.so_luong
    const listVnd = (d.list_price_vnd > 0 ? d.list_price_vnd : lineUnitKhachVnd(d)) * d.so_luong

    calcHdTruoc += trHd
    calcHdVat += vatHd
    calcKhachTruoc += trKh
    calcKhachVat += vatKh
    calcCost += cost
    calcList += listVnd
  })

  return {
    calcHdTruoc: Math.round(calcHdTruoc),
    calcHdVat: Math.round(calcHdVat),
    calcKhachTruoc: Math.round(calcKhachTruoc),
    calcKhachVat: Math.round(calcKhachVat),
    calcCost: Math.round(calcCost),
    calcList: Math.round(calcList)
  }
})

function initModalMetricsFromContract(c: Contract) {
  resetAllCmpSrOverrides()
  const custInfo = getCustomerInfo(c.ma_khach_hang)
  modalCustEdit.maKH = c.ma_khach_hang || ''
  modalCustEdit.mst = custInfo.mst || ''
  modalCustEdit.tenKH = c.ten_khach_hang || custInfo.tenKH || ''
  modalCustEdit.tenCongTy = custInfo.tenCongTy || ''

  modalChietKhauTruocThuePct.value = toNum(c.chiet_khau_truoc_thue_pct, 0)
  modalThueChenhLechPct.value = c.thue_chenh_lech_pct > 0 ? toNum(c.thue_chenh_lech_pct, 25) : 25

  const sums = modalRawLineSums.value
  const baseGiaMua = sums.calcCost
  const savedGiaMua = Math.round(toNum(c.gia_mua, 0))
  const savedTongCP = Math.round(toNum(c.tong_cp, 0))

  if (savedGiaMua > 0 && Math.abs(savedGiaMua - baseGiaMua) > 1) {
    cmpSrOverridesMap.contract.giaMua = savedGiaMua
    cmpSrOverridesMap.customer.giaMua = savedGiaMua
  }
  const giaMuaRef = savedGiaMua > 0 ? savedGiaMua : baseGiaMua
  if (savedTongCP > 0 && Math.abs(savedTongCP - giaMuaRef) > 1) {
    cmpSrOverridesMap.contract.tongCP = savedTongCP
    cmpSrOverridesMap.customer.tongCP = savedTongCP
  }

  const savedTruocHD = Math.round(toNum(c.tong_truoc_thue, 0))
  const savedTruocKhach = Math.round(toNum(c.tong_truoc_thue_khach, savedTruocHD))
  if (savedTruocHD > 0 && sums.calcHdTruoc > 0 && Math.abs(savedTruocHD - sums.calcHdTruoc) > 1) {
    cmpSrOverridesMap.contract.doanhSoBan = savedTruocHD
  }
  if (savedTruocKhach > 0 && sums.calcKhachTruoc > 0 && Math.abs(savedTruocKhach - sums.calcKhachTruoc) > 1) {
    cmpSrOverridesMap.customer.doanhSoBan = savedTruocKhach
  }

  const baseTruocHD = savedTruocHD || sums.calcHdTruoc
  const baseTruocKhach = savedTruocKhach || sums.calcKhachTruoc
  const baseClGia = Math.round(baseTruocHD - baseTruocKhach)
  const baseCkTruocThue = Math.round((baseTruocKhach * modalChietKhauTruocThuePct.value) / 100)
  const baseGross = baseCkTruocThue || baseClGia

  const savedGross = Math.round(toNum(c.chiet_khau_truoc_thue, 0) || toNum(c.chenh_lech_gia, 0))
  const savedNet = Math.round(toNum(c.con_lai, 0) || toNum(c.tong_chiet_khau, 0))
  if (savedGross > 0 && Math.abs(savedGross - baseGross) > 1) {
    cmpSrOverridesMap.contract.grossCom = savedGross
    if (savedNet > 0) cmpSrOverridesMap.contract.netCom = savedNet
    if (baseClGia === 0) {
      cmpSrOverridesMap.customer.grossCom = savedGross
      if (savedNet > 0) cmpSrOverridesMap.customer.netCom = savedNet
    }
  }

  const isRounded = Boolean(c.lam_tron_ti_suat)
  cmpSrOverridesMap.contract.lamTronTiSuat = isRounded
  cmpSrOverridesMap.customer.lamTronTiSuat = isRounded
}

watch(detailViewMode, mode => {
  if (mode === 'khach') {
    cmpSrPriceSource.value = 'customer'
  } else if (mode === 'hd') {
    cmpSrPriceSource.value = 'contract'
  }
})

watch(quoteCurrency, (newCur, oldCur) => {
  if (!oldCur || newCur === oldCur) return
  const rate = effectiveModalExchangeRate.value || 25400
  const convert = (v: number | null) => {
    if (v === null || v === undefined) return null
    return newCur === 'USD' ? round2(v / rate) : Math.round(v * rate)
  }
  ;(['contract', 'customer'] as const).forEach(mode => {
    const b = cmpSrOverridesMap[mode]
    b.doanhSoBan = convert(b.doanhSoBan)
    b.giaMua = convert(b.giaMua)
    b.tongCP = convert(b.tongCP)
    b.grossCom = convert(b.grossCom)
    b.netCom = convert(b.netCom)
    b._origGross = convert(b._origGross)
    b._origNet = convert(b._origNet)
  })
})

function cmpSrRound(val: number): number {
  const n = Number(val) || 0
  return quoteCurrency.value === 'USD' ? round2(n) : Math.round(n)
}

function modalCurrencyToVnd(val: number | null | undefined): number | null {
  if (val === null || val === undefined) return null
  const n = Number(val) || 0
  return quoteCurrency.value === 'USD'
    ? Math.round(n * effectiveModalExchangeRate.value)
    : Math.round(n)
}

const modalBaseTotalsVnd = computed(() => {
  const c = selectedContract.value
  const sums = modalRawLineSums.value
  const hdTruoc = sums.calcHdTruoc > 0 ? sums.calcHdTruoc : (c ? c.tong_truoc_thue : 0)
  const hdVat = sums.calcHdTruoc > 0 ? sums.calcHdVat : (c ? c.tong_vat : 0)
  const hdSau = hdTruoc + hdVat

  const khachTruoc = sums.calcKhachTruoc > 0 ? sums.calcKhachTruoc : (c ? c.tong_truoc_thue_khach : hdTruoc)
  const khachVat = sums.calcKhachTruoc > 0 ? sums.calcKhachVat : (c ? c.tong_vat_khach : hdVat)
  const khachSau = khachTruoc + khachVat

  const cost = sums.calcCost > 0 ? sums.calcCost : (c ? c.gia_mua : 0)
  return { hdTruoc, hdVat, hdSau, khachTruoc, khachVat, khachSau, cost }
})

const cmpSrBaseDoanhSoBan = computed(() => {
  const b = modalBaseTotalsVnd.value
  const vnd = cmpSrPriceSource.value === 'customer' ? b.khachTruoc : b.hdTruoc
  return vndToModalCurrency(vnd)
})

const cmpSrBaseTongSauVat = computed(() => {
  const b = modalBaseTotalsVnd.value
  const vnd = cmpSrPriceSource.value === 'customer' ? b.khachSau : b.hdSau
  return vndToModalCurrency(vnd)
})

const cmpSrBaseGiaMua = computed(() => vndToModalCurrency(modalBaseTotalsVnd.value.cost))

const cmpSrBaseGrossCom = computed(() => {
  const b = modalBaseTotalsVnd.value
  const ckPct = toNum(modalChietKhauTruocThuePct.value, 0)
  if (cmpSrPriceSource.value === 'customer') {
    if (ckPct <= 0) return 0
    return vndToModalCurrency((b.khachTruoc * ckPct) / 100)
  }
  const diffVnd = Math.round(b.hdTruoc - b.khachTruoc)
  if (diffVnd === 0 && ckPct > 0) {
    return vndToModalCurrency((b.khachTruoc * ckPct) / 100)
  }
  return vndToModalCurrency(diffVnd)
})

const cmpSrBaseTaxPct = computed(() => Math.max(0, toNum(modalThueChenhLechPct.value, 25)))

const cmpSrDoanhSoBan = computed(() =>
  cmpSrOverrides.value.doanhSoBan !== null ? cmpSrOverrides.value.doanhSoBan : cmpSrBaseDoanhSoBan.value
)

const cmpSrGiaMua = computed(() =>
  cmpSrOverrides.value.giaMua !== null ? cmpSrOverrides.value.giaMua : cmpSrBaseGiaMua.value
)

const cmpSrTongCP = computed(() => {
  if (cmpSrOverrides.value.tongCP !== null) return cmpSrOverrides.value.tongCP
  if (cmpSrOverrides.value.giaMua !== null) return cmpSrOverrides.value.giaMua
  return cmpSrBaseGiaMua.value
})

function roundCmpSrComPct(val: number): number {
  if (!Number.isFinite(val) || Math.abs(val) < 1e-9) return 0
  return Math.round(val * 100) / 100
}

const cmpSrTaxPct = computed(() => cmpSrBaseTaxPct.value)

const cmpSrGrossCom = computed(() =>
  cmpSrOverrides.value.grossCom !== null ? cmpSrOverrides.value.grossCom : cmpSrBaseGrossCom.value
)

const cmpSrGrossComPct = computed(() => {
  const b = cmpSrOverrides.value
  if (b._comPctActive && b.grossComPct !== null) {
    return b.grossComPct
  }
  const dsb = cmpSrDoanhSoBan.value
  const gc = cmpSrGrossCom.value
  if (!dsb || !gc) return 0
  return roundCmpSrComPct((gc / dsb) * 100)
})

const cmpSrNetCom = computed(() => {
  if (cmpSrOverrides.value.netCom !== null) return cmpSrOverrides.value.netCom
  return cmpSrRound(cmpSrGrossCom.value * (1 - cmpSrTaxPct.value / 100))
})

const cmpSrTaxAmount = computed(() =>
  cmpSrRound(cmpSrGrossCom.value * (cmpSrTaxPct.value / 100))
)

const cmpSrNetPO = computed(() =>
  cmpSrRound(cmpSrDoanhSoBan.value - cmpSrGrossCom.value)
)

const cmpSrNetMargin = computed(() =>
  cmpSrRound(cmpSrDoanhSoBan.value - cmpSrGrossCom.value - cmpSrTongCP.value)
)

const cmpSrTongSauVat = computed(() => {
  if (cmpSrOverrides.value.doanhSoBan !== null) {
    const b = modalBaseTotalsVnd.value
    const vatVal = vndToModalCurrency(cmpSrPriceSource.value === 'customer' ? b.khachVat : b.hdVat)
    return cmpSrRound(cmpSrOverrides.value.doanhSoBan + vatVal)
  }
  return cmpSrBaseTongSauVat.value
})

const cmpSrNetComOnNetPoPct = computed(() =>
  cmpSrNetPO.value !== 0 ? (cmpSrNetCom.value / cmpSrNetPO.value) * 100 : 0
)

const cmpSrNetMarginOnNetPoPct = computed(() =>
  cmpSrNetPO.value !== 0 ? (cmpSrNetMargin.value / cmpSrNetPO.value) * 100 : 0
)

const cmpSrNetComOnDsbPct = computed(() =>
  cmpSrDoanhSoBan.value !== 0 ? (cmpSrNetCom.value / cmpSrDoanhSoBan.value) * 100 : 0
)

const cmpSrNetMarginOnDsbPct = computed(() =>
  cmpSrDoanhSoBan.value !== 0 ? (cmpSrNetMargin.value / cmpSrDoanhSoBan.value) * 100 : 0
)

function fmtCmpSrMoney(val: number): string {
  return formatModalMoney(val)
}

const cmpSrIsRatioRounded = computed(() =>
  Boolean(cmpSrOverridesMap.contract.lamTronTiSuat || cmpSrOverridesMap.customer.lamTronTiSuat)
)

function fmtCmpSrPct(val: number): string {
  const num = Number.isFinite(val) ? Number(val) : 0
  if (cmpSrIsRatioRounded.value) {
    return Math.round(num) + '%'
  }
  return num.toFixed(1) + '%'
}

function toggleCmpSrRatioRounding() {
  const next = !cmpSrIsRatioRounded.value
  cmpSrOverridesMap.contract.lamTronTiSuat = next
  cmpSrOverridesMap.customer.lamTronTiSuat = next
  schedulePersistModalAdjustments()
}

function onCmpSrFieldChange(
  field: 'doanhSoBan' | 'giaMua' | 'tongCP' | 'netCom' | 'grossCom' | 'grossComPct' | 'taxPct',
  rawVal: number | string
) {
  const bucket = cmpSrOverrides.value
  const numVal = toNum(rawVal, 0)
  const nextVal =
    field === 'taxPct'
      ? Math.max(0, round2(numVal))
      : field === 'grossComPct'
        ? roundCmpSrComPct(numVal)
        : cmpSrRound(numVal)
  const currentVal =
    field === 'doanhSoBan'
      ? cmpSrDoanhSoBan.value
      : field === 'giaMua'
        ? cmpSrGiaMua.value
        : field === 'tongCP'
          ? cmpSrTongCP.value
          : field === 'netCom'
            ? cmpSrNetCom.value
            : field === 'grossCom'
              ? cmpSrGrossCom.value
              : field === 'grossComPct'
                ? cmpSrGrossComPct.value
                : cmpSrTaxPct.value

  if (Math.abs(currentVal - nextVal) < 1e-6) return

  if (field === 'taxPct') {
    modalThueChenhLechPct.value = nextVal
  } else if (field === 'giaMua' || field === 'tongCP') {
    cmpSrOverridesMap.contract[field] = nextVal
    cmpSrOverridesMap.customer[field] = nextVal
  } else if (field === 'grossComPct') {
    bucket.grossComPct = nextVal
    bucket._comPctActive = nextVal !== 0
  } else {
    bucket[field] = nextVal
  }
  const pct = (field === 'taxPct' ? nextVal : cmpSrTaxPct.value) / 100

  if (field === 'grossComPct') {
    const gc = cmpSrRound(cmpSrDoanhSoBan.value * (nextVal / 100))
    bucket.grossCom = gc
    bucket.netCom = cmpSrRound(gc * (1 - pct))
  } else if (field === 'doanhSoBan') {
    if (bucket._comPctActive && (Number(bucket.grossComPct) || 0) !== 0) {
      const gc = cmpSrRound(nextVal * ((Number(bucket.grossComPct) || 0) / 100))
      bucket.grossCom = gc
      bucket.netCom = cmpSrRound(gc * (1 - pct))
    }
  } else if (field === 'netCom') {
    if (pct < 1) {
      bucket.grossCom = cmpSrRound(nextVal / (1 - pct))
    }
    bucket._comPctActive = false
    bucket.grossComPct = null
  } else if (field === 'grossCom') {
    bucket.netCom = cmpSrRound(nextVal * (1 - pct))
    bucket._comPctActive = false
    bucket.grossComPct = null
  } else if (field === 'taxPct') {
    const gc = cmpSrGrossCom.value
    bucket.netCom = cmpSrRound(gc * (1 - pct))
  }

  bucket.predictPct = ''
  bucket._origGross = null
  bucket._origNet = null
  bucket._hasOrigSaved = false
  schedulePersistModalAdjustments()
}

function onModalDiscountPctChange(field: 'ckPct' | 'taxPct', rawVal: number | string) {
  const numVal = Math.max(0, round2(toNum(rawVal, 0)))
  if (field === 'ckPct') {
    if (Math.abs(modalChietKhauTruocThuePct.value - numVal) < 1e-6) return
    modalChietKhauTruocThuePct.value = numVal
    // Nếu chưa có chênh lệch giá dòng, cập nhật lại Gross/Net COM theo % chiết khấu trước thuế
    const b = modalBaseTotalsVnd.value
    if (Math.abs(b.hdTruoc - b.khachTruoc) <= 1) {
      cmpSrOverridesMap.contract.grossCom = null
      cmpSrOverridesMap.contract.netCom = null
      cmpSrOverridesMap.customer.grossCom = null
      cmpSrOverridesMap.customer.netCom = null
    }
  } else {
    if (Math.abs(modalThueChenhLechPct.value - numVal) < 1e-6) return
    modalThueChenhLechPct.value = numVal
    const tp = numVal / 100
    ;(['contract', 'customer'] as const).forEach(mode => {
      const b = cmpSrOverridesMap[mode]
      if (mode === cmpSrPriceSource.value && b.predictPct !== '') {
        applyCmpSrPredictPct(b.predictPct)
      } else if (b.netCom !== null || b.grossCom !== null) {
        const gc = b.grossCom !== null ? b.grossCom : cmpSrBaseGrossCom.value
        b.netCom = cmpSrRound(gc * (1 - tp))
      }
    })
  }
  schedulePersistModalAdjustments()
}

function applyCmpSrPredictPct(rawStr: string) {
  const bucket = cmpSrOverrides.value
  bucket.predictPct = rawStr

  if (rawStr === '') {
    if (bucket._hasOrigSaved) {
      bucket.grossCom = bucket._origGross
      bucket.netCom = bucket._origNet
      bucket._origGross = null
      bucket._origNet = null
      bucket._hasOrigSaved = false
    }
    schedulePersistModalAdjustments()
    return
  }

  const normalized = rawStr.replace(/,/g, '.')
  if (normalized === '-' || normalized === '.' || normalized === '-.') return
  const desiredPct = Number(normalized)
  if (isNaN(desiredPct)) return

  if (!bucket._hasOrigSaved) {
    bucket._origGross = bucket.grossCom
    bucket._origNet = bucket.netCom
    bucket._hasOrigSaved = true
  }

  const pct = desiredPct / 100
  const tax = cmpSrTaxPct.value / 100
  const dsb = cmpSrDoanhSoBan.value
  const tcp = cmpSrTongCP.value

  const targetNetMargin = dsb * pct
  const requiredGrossCom = cmpSrRound(dsb - tcp - targetNetMargin)
  const requiredNetCom = cmpSrRound(requiredGrossCom * (1 - tax))

  bucket.grossCom = requiredGrossCom
  bucket.netCom = requiredNetCom
  bucket._comPctActive = false
  bucket.grossComPct = null
  schedulePersistModalAdjustments()
}

function resetCmpSrPredictPct() {
  applyCmpSrPredictPct('')
}

function onCmpSrPredictInput(e: Event) {
  const target = e.target as HTMLInputElement
  const cleaned = target.value.replace(/[^0-9.,-]/g, '')
  if (target.value !== cleaned) {
    target.value = cleaned
  }
  applyCmpSrPredictPct(cleaned)
}

function resetCurrentCmpSrBucket() {
  Object.assign(cmpSrOverridesMap[cmpSrPriceSource.value], createEmptyCmpSrBucket())
  const otherMode = cmpSrPriceSource.value === 'contract' ? 'customer' : 'contract'
  cmpSrOverridesMap[otherMode].giaMua = null
  cmpSrOverridesMap[otherMode].tongCP = null
  schedulePersistModalAdjustments()
}

const hasCmpSrOverrides = computed(() => {
  const b = cmpSrOverrides.value
  return (
    b.doanhSoBan !== null ||
    b.giaMua !== null ||
    b.tongCP !== null ||
    b.grossCom !== null ||
    b.netCom !== null ||
    b.grossComPct !== null ||
    b._comPctActive ||
    b.taxPct !== null ||
    b.predictPct !== ''
  )
})

const lastCmpSrComAdjust = computed(() => {
  const hist = cmpSrOverrides.value._comAdjustHistory
  return hist && hist.length > 0 ? hist[hist.length - 1] : null
})

function toggleCmpSrComAdjustPanel(field: 'grossCom' | 'netCom') {
  const bucket = cmpSrOverrides.value
  if (bucket._comAdjustOpenField === field) {
    closeCmpSrComAdjustPanel()
    return
  }
  bucket._comAdjustOpenField = field
  bucket._comAdjustSign = 1
  bucket._comAdjustAmount = 0
  nextTick(() => {
    const el = document.getElementById('qlbg-cmp-sr-input-comAdjust') as HTMLInputElement | null
    if (el) {
      el.focus()
      el.select()
    }
  })
}

function closeCmpSrComAdjustPanel() {
  const bucket = cmpSrOverrides.value
  bucket._comAdjustOpenField = null
  bucket._comAdjustAmount = 0
  bucket._comAdjustSign = 1
}

function applyCmpSrComAdjust() {
  const bucket = cmpSrOverrides.value
  const field = bucket._comAdjustOpenField
  if (!field) return
  const sign = (bucket._comAdjustSign ?? 1) >= 0 ? 1 : -1
  const rawAmt = Math.abs(Number(bucket._comAdjustAmount) || 0)
  const amt = quoteCurrency.value === 'USD' ? round2(rawAmt) : Math.round(rawAmt)
  if (!amt) return

  const delta = quoteCurrency.value === 'USD' ? round2(sign * amt) : sign * amt
  if (!Array.isArray(bucket._comAdjustHistory)) {
    bucket._comAdjustHistory = []
  }
  bucket._comAdjustHistory.push({
    field,
    prevGrossOverride: bucket.grossCom,
    prevNetOverride: bucket.netCom,
    prevGrossPctOverride: bucket.grossComPct,
    prevComPctActive: Boolean(bucket._comPctActive),
    prevPredictPct: bucket.predictPct || '',
    prevDisplayGross: cmpSrGrossCom.value,
    prevDisplayNet: cmpSrNetCom.value,
    delta
  })

  const baseVal = field === 'grossCom' ? cmpSrGrossCom.value : cmpSrNetCom.value
  const nextVal = cmpSrRound(baseVal + delta)
  onCmpSrFieldChange(field, nextVal)
  closeCmpSrComAdjustPanel()
}

function undoCmpSrComAdjust() {
  const bucket = cmpSrOverrides.value
  const hist = bucket._comAdjustHistory
  if (!hist || hist.length === 0) return
  const snap = hist.pop()!
  bucket.grossCom = snap.prevGrossOverride
  bucket.netCom = snap.prevNetOverride
  bucket.grossComPct = snap.prevGrossPctOverride
  bucket._comPctActive = snap.prevComPctActive
  bucket.predictPct = snap.prevPredictPct
  schedulePersistModalAdjustments()
}

const resolvedModalMetricsVnd = computed(() => {
  const base = modalBaseTotalsVnd.value
  const isSameBasePrice = Math.abs(base.hdTruoc - base.khachTruoc) <= 1

  const rawDsbHD = modalCurrencyToVnd(cmpSrOverridesMap.contract.doanhSoBan)
  const rawDsbKhach = modalCurrencyToVnd(cmpSrOverridesMap.customer.doanhSoBan)
  const overrideDsbHD = isSameBasePrice ? (rawDsbHD ?? rawDsbKhach) : rawDsbHD
  const overrideDsbKhach = isSameBasePrice ? (rawDsbKhach ?? rawDsbHD) : rawDsbKhach

  const truocHD = overrideDsbHD !== null ? overrideDsbHD : base.hdTruoc
  const vatHD = base.hdVat
  const sauHD = overrideDsbHD !== null ? truocHD + vatHD : base.hdSau

  const truocKhach = overrideDsbKhach !== null ? overrideDsbKhach : base.khachTruoc
  const vatKhach = base.khachVat
  const sauKhach = overrideDsbKhach !== null ? truocKhach + vatKhach : base.khachSau

  const rawGiaMua = modalCurrencyToVnd(
    cmpSrOverridesMap[cmpSrPriceSource.value].giaMua ??
      cmpSrOverridesMap.contract.giaMua ??
      cmpSrOverridesMap.customer.giaMua
  )
  const giaMuaVnd = rawGiaMua !== null ? rawGiaMua : base.cost

  const rawTongCP = modalCurrencyToVnd(
    cmpSrOverridesMap[cmpSrPriceSource.value].tongCP ??
      cmpSrOverridesMap.contract.tongCP ??
      cmpSrOverridesMap.customer.tongCP
  )
  const tongCpVnd = rawTongCP !== null ? rawTongCP : giaMuaVnd

  const thueCLPct = Math.max(0, toNum(modalThueChenhLechPct.value, 25))
  const ckTruocThuePct = Math.max(0, toNum(modalChietKhauTruocThuePct.value, 0))
  const baseCkTruocThue = Math.round((truocKhach * ckTruocThuePct) / 100)
  const baseClGia = Math.round(truocHD - truocKhach)
  const baseGrossCom = baseCkTruocThue || baseClGia

  const activeB = cmpSrOverridesMap[cmpSrPriceSource.value]
  const otherB = cmpSrOverridesMap[cmpSrPriceSource.value === 'contract' ? 'customer' : 'contract']
  const comBucket =
    activeB.grossCom !== null || activeB.netCom !== null
      ? activeB
      : otherB.grossCom !== null || otherB.netCom !== null
        ? otherB
        : null

  let grossComVal = baseGrossCom
  let netComVal = 0
  let thueCL = 0
  let conLaiVal = 0
  let tongCKVal = 0
  let ckTruocThue = baseCkTruocThue
  let clGia = baseClGia

  if (comBucket) {
    grossComVal = modalCurrencyToVnd(comBucket.grossCom) ?? baseGrossCom
    netComVal = modalCurrencyToVnd(comBucket.netCom) ?? Math.round(grossComVal * (1 - thueCLPct / 100))
    thueCL = Math.max(0, Math.round(grossComVal - netComVal))
    conLaiVal = netComVal
    tongCKVal = netComVal + (baseClGia !== 0 ? baseCkTruocThue : 0)
    if (baseClGia === 0 && ckTruocThuePct > 0) {
      ckTruocThue = grossComVal
      clGia = 0
      tongCKVal = netComVal
    } else {
      clGia = grossComVal
    }
  } else {
    grossComVal = baseGrossCom
    thueCL = baseClGia !== 0 ? Math.round((baseClGia * thueCLPct) / 100) : Math.round((grossComVal * thueCLPct) / 100)
    conLaiVal = baseClGia !== 0 ? Math.round(baseClGia - thueCL) : Math.round(grossComVal - thueCL)
    netComVal = conLaiVal
    tongCKVal = baseClGia !== 0 ? Math.round(conLaiVal + baseCkTruocThue) : netComVal
    ckTruocThue = baseCkTruocThue
    clGia = baseClGia
  }

  return {
    truocHD,
    vatHD,
    sauHD,
    truocKhach,
    vatKhach,
    sauKhach,
    giaMuaVnd,
    tongCpVnd,
    ckTruocThue,
    ckTruocThuePct,
    thueCL,
    thueCLPct,
    clGia,
    conLaiVal,
    tongCKVal,
    grossComVal,
    netComVal,
    lamTronTiSuat: cmpSrIsRatioRounded.value
  }
})

const detailSummary = computed(() => {
  const m = resolvedModalMetricsVnd.value
  const useKhach = detailViewMode.value === 'khach'
  return {
    activeTruoc: vndToModalCurrency(useKhach ? m.truocKhach : m.truocHD),
    activeVat: vndToModalCurrency(useKhach ? m.vatKhach : m.vatHD),
    activeSau: vndToModalCurrency(useKhach ? m.sauKhach : m.sauHD),
    hdTruoc: vndToModalCurrency(m.truocHD),
    hdVat: vndToModalCurrency(m.vatHD),
    hdSau: vndToModalCurrency(m.sauHD),
    khachTruoc: vndToModalCurrency(m.truocKhach),
    khachVat: vndToModalCurrency(m.vatKhach),
    khachSau: vndToModalCurrency(m.sauKhach),
    costTotal: vndToModalCurrency(m.giaMuaVnd),
    tongCpTotal: vndToModalCurrency(m.tongCpVnd),
    netMargin: vndToModalCurrency(m.truocHD - m.grossComVal - m.tongCpVnd),
    ckTruocThue: vndToModalCurrency(m.ckTruocThue),
    clGia: vndToModalCurrency(m.clGia),
    conLai: vndToModalCurrency(m.conLaiVal),
    tongChietKhau: vndToModalCurrency(m.tongCKVal),
    grossCom: vndToModalCurrency(m.grossComVal),
    thueCL: vndToModalCurrency(m.thueCL),
    netCom: vndToModalCurrency(m.netComVal)
  }
})

function schedulePersistModalAdjustments() {
  if (suppressModalPersist || !selectedContract.value) return
  const c = selectedContract.value
  const m = resolvedModalMetricsVnd.value

  // Cập nhật ngay lập tức trên object đang chọn để UI card ngoài & modal đồng bộ tức thì
  c.tong_truoc_thue = m.truocHD
  c.tong_vat = m.vatHD
  c.tong_sau_thue = m.sauHD
  c.tong_truoc_thue_khach = m.truocKhach
  c.tong_vat_khach = m.vatKhach
  c.tong_sau_thue_khach = m.sauKhach
  c.gia_mua = m.giaMuaVnd
  c.tong_cp = m.tongCpVnd
  c.chiet_khau_truoc_thue = m.ckTruocThue
  c.chiet_khau_truoc_thue_pct = m.ckTruocThuePct
  c.thue_chenh_lech = m.thueCL
  c.thue_chenh_lech_pct = m.thueCLPct
  c.chenh_lech_gia = m.clGia
  c.con_lai = m.conLaiVal
  c.tong_chiet_khau = m.tongCKVal
  c.lam_tron_ti_suat = m.lamTronTiSuat

  if (persistModalTimer) clearTimeout(persistModalTimer)
  persistModalTimer = setTimeout(() => {
    persistModalFinancialAdjustments(c, m)
  }, 450)
}

async function persistModalFinancialAdjustments(
  c: Contract,
  m: ReturnType<typeof resolvedModalMetricsVnd.value extends infer T ? () => T : never>
) {
  const targetKey = c._fbKey || c.ma_hop_dong
  if (!targetKey) return
  savingModalMetrics.value = true
  try {
    const snap = await get(dbRef(database, `hop_dong_tong_quat/${targetKey}`))
    if (snap.exists()) {
      const val = snap.val()
      if (Array.isArray(val)) {
        const copy = [...val]
        while (copy.length < 47) copy.push('')
        copy[2] = modalCustEdit.maKH || copy[2]
        copy[3] = modalCustEdit.tenKH || copy[3]
        copy[5] = m.truocHD
        copy[6] = m.vatHD
        copy[7] = m.sauHD
        copy[9] = m.sauHD
        copy[20] = m.truocKhach
        copy[25] = m.ckTruocThue
        copy[26] = m.ckTruocThuePct
        copy[27] = m.thueCL
        copy[28] = m.thueCLPct
        copy[29] = m.clGia
        copy[30] = m.conLaiVal
        copy[31] = m.tongCKVal
        copy[37] = m.vatKhach
        copy[38] = m.sauKhach
        copy[40] = m.giaMuaVnd
        copy[45] = m.tongCpVnd
        copy[46] = m.lamTronTiSuat
        await set(dbRef(database, `hop_dong_tong_quat/${targetKey}`), copy)
      } else {
        await update(dbRef(database, `hop_dong_tong_quat/${targetKey}`), {
          ma_khach_hang: modalCustEdit.maKH || c.ma_khach_hang,
          ten_khach_hang: modalCustEdit.tenKH || c.ten_khach_hang,
          Tong_tien_truoc_thueVAT: m.truocHD,
          tong_truoc_vat: m.truocHD,
          Tong_thueVAT: m.vatHD,
          tong_vat: m.vatHD,
          Tong_tien_sau_thueVAT: m.sauHD,
          tong_sau_vat: m.sauHD,
          Tong_cong: m.sauHD,
          Tong_gia_thuc_te: m.truocKhach,
          Tong_tien_truoc_thueVAT_khach: m.truocKhach,
          tong_truoc_vat_goc: m.truocKhach,
          Tong_thueVAT_khach: m.vatKhach,
          Tong_tien_sau_thueVAT_khach: m.sauKhach,
          Tong_thanh_tien_chua_VAT_mua_hang: m.giaMuaVnd,
          giaMua: m.giaMuaVnd,
          Tong_CP_don_hang: m.tongCpVnd,
          tongCP: m.tongCpVnd,
          chiet_khau_tong_truoc_thue: m.ckTruocThue,
          gross_com: m.grossComVal,
          grossCom: m.grossComVal,
          phan_tram_chiet_khau_tong_truoc_thue: m.ckTruocThuePct,
          phan_tram_chiet_khau: m.ckTruocThuePct,
          thue_chenh_lech_gia: m.thueCL,
          phan_tram_thue_chenh_lech_gia: m.thueCLPct,
          phan_tram_thue: m.thueCLPct,
          chenh_lech_gia: m.clGia,
          con_lai: m.conLaiVal,
          net_com: m.netComVal,
          netCom: m.netComVal,
          tong_chiet_khau: m.tongCKVal,
          lam_tron_ti_suat: m.lamTronTiSuat
        })
      }
    }

    const srPatch = {
      Ma_khach_hang: modalCustEdit.maKH || c.ma_khach_hang,
      Ten_khach_hang: modalCustEdit.tenKH || c.ten_khach_hang,
      Ten_cong_ty: modalCustEdit.tenCongTy || getCustomerInfo(c.ma_khach_hang).tenCongTy,
      MST: modalCustEdit.mst || getCustomerInfo(c.ma_khach_hang).mst,
      Tong_tien_truoc_thueVAT: m.truocHD,
      Tong_thueVAT: m.vatHD,
      Tong_tien_sau_thueVAT: m.sauHD,
      doanhSoBan: m.truocHD,
      Tong_gia_thuc_te: m.truocKhach,
      Tong_tien_truoc_thueVAT_khach: m.truocKhach,
      tong_truoc_vat_goc: m.truocKhach,
      Tong_thueVAT_khach: m.vatKhach,
      Tong_tien_sau_thueVAT_khach: m.sauKhach,
      doanhSoBan_khach: m.truocKhach,
      Tong_thanh_tien_chua_VAT_mua_hang: m.giaMuaVnd,
      giaMua: m.giaMuaVnd,
      Tong_CP_don_hang: m.tongCpVnd,
      tongCP: m.tongCpVnd,
      chiet_khau_tong_truoc_thue: m.ckTruocThue,
      phan_tram_chiet_khau_tong_truoc_thue: m.ckTruocThuePct,
      thue_chenh_lech_gia: m.thueCL,
      phan_tram_thue_chenh_lech_gia: m.thueCLPct,
      taxPct: m.thueCLPct,
      chenh_lech_gia: m.clGia,
      gross_com: m.grossComVal,
      grossCom: m.grossComVal,
      con_lai: m.conLaiVal,
      tong_chiet_khau: m.tongCKVal,
      net_com: m.netComVal,
      netCom: m.netComVal,
      lam_tron_ti_suat: m.lamTronTiSuat,
      updated_at: Date.now()
    }

    const craftEntry = findCraftEntryForFamily(c)
    if (craftEntry && (!craftEntry.data?.ma_hop_dong || String(craftEntry.data.ma_hop_dong).trim() === c.ma_hop_dong)) {
      await update(dbRef(database, `sale_report_craft/${craftEntry.key}`), srPatch).catch(() => {})
    }
    if (c.id_sale_report) {
      await update(dbRef(database, `sale_report/${c.id_sale_report}`), srPatch).catch(() => {})
    }
  } catch (err) {
    console.warn('Lỗi đồng bộ chỉ số báo giá:', err)
  } finally {
    savingModalMetrics.value = false
  }
}

async function applyPickedCustomerToDetailModal(newMaKH: string) {
  if (!selectedContract.value || !newMaKH || newMaKH === 'ALL') return
  const info = getCustomerInfo(newMaKH)
  modalCustEdit.maKH = newMaKH
  modalCustEdit.mst = info.mst || ''
  modalCustEdit.tenKH = info.tenKH || selectedContract.value.ten_khach_hang || ''
  modalCustEdit.tenCongTy = info.tenCongTy || ''
  selectedContract.value.ma_khach_hang = newMaKH
  if (info.tenKH) selectedContract.value.ten_khach_hang = info.tenKH
  schedulePersistModalAdjustments()
}

async function onModalCustomerFieldCommit() {
  if (!selectedContract.value) return
  const c = selectedContract.value
  c.ten_khach_hang = modalCustEdit.tenKH.trim()
  const maKH = String(modalCustEdit.maKH || c.ma_khach_hang || '').trim()
  if (maKH) {
    const row = customerMap.value.get(maKH)
    if (row) {
      row[1] = modalCustEdit.tenKH.trim()
      row[5] = modalCustEdit.tenCongTy.trim()
      row[19] = modalCustEdit.mst.trim()
    }
    const custFound = await findCustomerInFirebase(maKH).catch(() => null)
    if (custFound?.key) {
      await update(dbRef(database, `khach_hang/${custFound.key}`), {
        ten_khach_hang: modalCustEdit.tenKH.trim(),
        Ten_khach_hang: modalCustEdit.tenKH.trim(),
        ten_cong_ty: modalCustEdit.tenCongTy.trim(),
        Ten_cong_ty: modalCustEdit.tenCongTy.trim(),
        mst: modalCustEdit.mst.trim(),
        MST: modalCustEdit.mst.trim()
      }).catch(() => {})
    }
  }
  schedulePersistModalAdjustments()
}

const selectedLinkedSaleReport = computed(() => getLinkedSaleReportRecord(selectedContract.value))

/* ======================
   DUAL-SLOT FILE MANAGEMENT (HĐ & KHÁCH + ĐỒNG BỘ SALE REPORT / QUAN LY FILE)
====================== */
const contractFileInputHd = ref<HTMLInputElement | null>(null)
const contractFileInputKhach = ref<HTMLInputElement | null>(null)
const uploadingFileSlot = ref<'hd' | 'khach' | null>(null)

function parseJsonArray(val: string): string[] {
  if (!val) return []
  const s = String(val).trim()
  if (!s) return []
  if (s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s)
      return Array.isArray(parsed) ? parsed.map(x => String(x || '')).filter(Boolean) : [s]
    } catch {
      return [s]
    }
  }
  return [s]
}

function extractFilePairs(tenStr: string, linkStr: string): { name: string; link: string }[] {
  const names = parseJsonArray(tenStr)
  const links = parseJsonArray(linkStr)
  const res: { name: string; link: string }[] = []
  for (let i = 0; i < Math.max(names.length, links.length); i++) {
    if (links[i]) res.push({ name: names[i] || 'File báo giá', link: links[i] })
  }
  return res
}

function getTotalContractFilesCount(c: Contract): number {
  return extractFilePairs(c.ten_file, c.link_file).length + extractFilePairs(c.ten_file_khach, c.link_file_khach).length
}

const parsedFilesHd = computed(() =>
  selectedContract.value ? extractFilePairs(selectedContract.value.ten_file, selectedContract.value.link_file) : []
)
const parsedFilesKhach = computed(() =>
  selectedContract.value ? extractFilePairs(selectedContract.value.ten_file_khach, selectedContract.value.link_file_khach) : []
)
const detailFilesTotalCount = computed(() => parsedFilesHd.value.length + parsedFilesKhach.value.length)

async function persistContractSlotFiles(
  contract: Contract,
  slot: 'hd' | 'khach',
  names: string[],
  links: string[]
) {
  const tenJson = names.length === 0 ? '' : names.length === 1 ? names[0] : JSON.stringify(names)
  const linkJson = links.length === 0 ? '' : links.length === 1 ? links[0] : JSON.stringify(links)
  const targetKey = contract._fbKey || contract.ma_hop_dong

  const snap = await get(dbRef(database, `hop_dong_tong_quat/${targetKey}`))
  if (snap.exists()) {
    const val = snap.val()
    if (Array.isArray(val)) {
      const copy = [...val]
      while (copy.length < 47) copy.push('')
      if (slot === 'hd') {
        copy[34] = tenJson
        copy[35] = linkJson
      } else {
        copy[43] = tenJson
        copy[44] = linkJson
      }
      await set(dbRef(database, `hop_dong_tong_quat/${targetKey}`), copy)
    } else {
      const patch =
        slot === 'hd'
          ? {
              ten_file: tenJson,
              link_file: linkJson,
              ten_file_bao_gia: tenJson,
              link_excel_bao_gia: linkJson,
              ten_file_bao_gia_hd: tenJson,
              link_excel_bao_gia_hd: linkJson
            }
          : {
              ten_file_khach: tenJson,
              link_file_khach: linkJson,
              ten_file_bao_gia_khach: tenJson,
              link_excel_bao_gia_khach: linkJson
            }
      await update(dbRef(database, `hop_dong_tong_quat/${targetKey}`), patch)
    }
  }

  // Sync file links to sale_report / sale_report_craft / quan_ly_file if linked
  const multiPatch: Record<string, any> = {}
  const firstTen = names[0] || ''
  const firstLink = links[0] || ''
  if (contract.id_sale_report) {
    if (slot === 'hd') {
      multiPatch[`sale_report/${contract.id_sale_report}/ten_file_bao_gia`] = firstTen
      multiPatch[`sale_report/${contract.id_sale_report}/link_excel_bao_gia`] = firstLink
      multiPatch[`sale_report/${contract.id_sale_report}/ten_file_bao_gia_hd`] = firstTen
      multiPatch[`sale_report/${contract.id_sale_report}/link_excel_bao_gia_hd`] = firstLink
    } else {
      multiPatch[`sale_report/${contract.id_sale_report}/ten_file_bao_gia_khach`] = firstTen
      multiPatch[`sale_report/${contract.id_sale_report}/link_excel_bao_gia_khach`] = firstLink
    }
  }
  if (contract.id_sale_report_craft) {
    const craftSnap = await get(dbRef(database, `sale_report_craft/${contract.id_sale_report_craft}`))
    if (craftSnap.exists()) {
      const craftVal = craftSnap.val() || {}
      if (slot === 'hd') {
        multiPatch[`sale_report_craft/${contract.id_sale_report_craft}/ten_file_bao_gia`] = firstTen
        multiPatch[`sale_report_craft/${contract.id_sale_report_craft}/link_excel_bao_gia`] = firstLink
      } else {
        multiPatch[`sale_report_craft/${contract.id_sale_report_craft}/ten_file_bao_gia_khach`] = firstTen
        multiPatch[`sale_report_craft/${contract.id_sale_report_craft}/link_excel_bao_gia_khach`] = firstLink
      }
      const qfId = String(craftVal.id_quanlyfile || craftVal.id_quan_ly_file || '').trim()
      if (qfId) {
        if (slot === 'hd') {
          multiPatch[`quan_ly_file/${qfId}/ten_file_bao_gia`] = firstTen
          multiPatch[`quan_ly_file/${qfId}/link_excel_bao_gia`] = firstLink
        } else {
          multiPatch[`quan_ly_file/${qfId}/ten_file_bao_gia_khach`] = firstTen
          multiPatch[`quan_ly_file/${qfId}/link_excel_bao_gia_khach`] = firstLink
        }
      }
    }
  }
  if (Object.keys(multiPatch).length > 0) {
    await update(dbRef(database), multiPatch).catch(() => {})
  }

  if (slot === 'hd') {
    contract.ten_file = tenJson
    contract.link_file = linkJson
  } else {
    contract.ten_file_khach = tenJson
    contract.link_file_khach = linkJson
  }
}

async function handleSlotFileUpload(e: Event, slot: 'hd' | 'khach') {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files || !files.length || !selectedContract.value) return

  uploadingFileSlot.value = slot
  try {
    const curPairs = slot === 'hd' ? [...parsedFilesHd.value] : [...parsedFilesKhach.value]
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('upload_preset', 'upload_file')
      formData.append('file', file)
      const uploadRes = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', {
        method: 'POST',
        body: formData
      }).then(r => r.json())

      const secureUrl = String(uploadRes?.secure_url || '').trim()
      if (secureUrl) {
        curPairs.push({ name: file.name, link: secureUrl })
      }
    }

    await persistContractSlotFiles(
      selectedContract.value,
      slot,
      curPairs.map(p => p.name),
      curPairs.map(p => p.link)
    )
    triggerToast('Đã tải lên và đồng bộ file báo giá', 'success')
  } catch (err: any) {
    console.error('Lỗi upload file:', err)
    triggerToast('Lỗi tải file lên: ' + String(err?.message || err), 'error')
  } finally {
    uploadingFileSlot.value = null
    input.value = ''
  }
}

async function removeSlotFile(slot: 'hd' | 'khach', idx: number) {
  if (!selectedContract.value) return
  const curPairs = slot === 'hd' ? [...parsedFilesHd.value] : [...parsedFilesKhach.value]
  const removed = curPairs[idx]
  if (!removed) return

  const ok = await askConfirm({
    title: 'Gỡ file đính kèm?',
    message: `Bạn có chắc muốn gỡ file "${removed.name}" khỏi báo giá này?`,
    confirmText: 'Gỡ file',
    variant: 'danger'
  })
  if (!ok || !selectedContract.value) return

  curPairs.splice(idx, 1)
  try {
    await persistContractSlotFiles(
      selectedContract.value,
      slot,
      curPairs.map(p => p.name),
      curPairs.map(p => p.link)
    )
    triggerToast('Đã gỡ file đính kèm', 'success')
  } catch (err: any) {
    triggerToast('Lỗi khi gỡ file: ' + String(err?.message || err), 'error')
  }
}

/* ======================
   NAVIGATION ACTIONS: CREATE, EDIT, DUPLICATE, OPEN SALE REPORT, DELETE DRAFT
====================== */
function goCreateNewQuote() {
  router.push('/baogiafirebase')
}

function editContract(c: Contract | null) {
  if (!c || c.is_completed) return
  const ma = String(c.ma_hop_dong || '').trim()
  if (!ma) return
  localStorage.setItem('pendingEditQuoteMaHopDong', ma)
  showDetailModal.value = false
  router.push({ path: '/baogiafirebase', query: { ma, _ts: String(Date.now()) } })
}

function duplicateContract(c: Contract | null) {
  if (!c) return
  const rawDetails = allDetailsRaw.value.filter(r => String(r[0] || '').trim() === c.ma_hop_dong)
  localStorage.setItem('cloneQuoteProductsRaw', JSON.stringify(rawDetails))
  localStorage.setItem(
    'cloneQuoteMeta',
    JSON.stringify({
      chietKhauTruocThuePct: c.chiet_khau_truoc_thue_pct || 0,
      thueChenhLechPct: c.thue_chenh_lech_pct || 25,
      structure: c.structure || ''
    })
  )
  showDetailModal.value = false
  router.push({ path: '/baogiafirebase', query: { clone: '1', _ts: String(Date.now()) } })
}

function openInSaleReport(c: Contract | null, forceCraft = false) {
  if (!c) return
  showDetailModal.value = false
  const query: Record<string, string> = {}
  if (forceCraft) {
    const craftEntry = findCraftEntryForFamily(c)
    if (craftEntry?.key) query.openPoKey = craftEntry.key
    else if (c.id_sale_report_craft) query.openPoKey = c.id_sale_report_craft
    query.srMode = 'craft'
    router.push({ path: '/sale-report-firebase', query })
    return
  }
  const srRec = getLinkedSaleReportRecord(c)
  if (srRec?.key) query.openPoKey = srRec.key
  else if (c.id_sale_report) query.openPoKey = c.id_sale_report
  else if (c.id_sale_report_craft) {
    query.openPoKey = c.id_sale_report_craft
    query.srMode = 'craft'
  }
  if (c.so_po) query.openSoPo = c.so_po
  router.push({ path: '/sale-report-firebase', query })
}

/* ======================
   ĐỒNG BỘ PHIÊN BẢN VỚI SALE REPORT TẠM (1 ĐẠI DIỆN ACTIVE + CHUYỂN ĐỔI 2 CHIỀU + AUTO-ROLLBACK)
====================== */
const familyVersionsMap = computed(() => {
  const m = new Map<string, Contract[]>()
  contracts.value.forEach(c => {
    const goc = String(c.ma_hop_dong_goc || c.ma_hop_dong).trim()
    if (!goc) return
    if (!m.has(goc)) m.set(goc, [])
    const arr = m.get(goc)!
    if (!arr.some(x => x.ma_hop_dong === c.ma_hop_dong)) arr.push(c)
  })
  m.forEach((arr, goc) => {
    arr.sort((a, b) => {
      const da = parseVietnameseDate(a.created_time || a.ngay_tao)?.getTime() || 0
      const db = parseVietnameseDate(b.created_time || b.ngay_tao)?.getTime() || 0
      if (da !== db) return da - db
      return a.ma_hop_dong.localeCompare(b.ma_hop_dong)
    })
    m.set(goc, arr)
  })
  return m
})

function getVersionNumberLabel(c: Contract | null): string {
  if (!c) return ''
  const goc = String(c.ma_hop_dong_goc || c.ma_hop_dong).trim()
  const arr = familyVersionsMap.value.get(goc) || []
  if (arr.length <= 1) return ''
  const idx = arr.findIndex(x => x.ma_hop_dong === c.ma_hop_dong)
  return idx >= 0 ? `V${idx + 1}` : ''
}

function isFamilyCompleted(c: Contract | null): boolean {
  if (!c) return false
  if (c.is_completed || c.trang_thai === 'Chính thức') return true
  const goc = String(c.ma_hop_dong_goc || c.ma_hop_dong).trim()
  const arr = familyVersionsMap.value.get(goc) || []
  return arr.some(v => v.is_completed || v.trang_thai === 'Chính thức')
}

function findCraftEntryForFamily(c: Contract | null): { key: string; data: any } | null {
  if (!c) return null
  const craftMap = saleReportCraftMap.value
  const goc = String(c.ma_hop_dong_goc || c.ma_hop_dong).trim()
  const siblings = familyVersionsMap.value.get(goc) || [c]
  const siblingIds = new Set(siblings.map(s => s.ma_hop_dong))

  // 1) Kiểm tra id_sale_report_craft trực tiếp trên c hoặc anh em cùng gốc
  if (c.id_sale_report_craft && craftMap[c.id_sale_report_craft] && craftMap[c.id_sale_report_craft].chotDeal !== true) {
    return { key: c.id_sale_report_craft, data: craftMap[c.id_sale_report_craft] }
  }
  for (const s of siblings) {
    const ck = String(s.id_sale_report_craft || '').trim()
    if (ck && craftMap[ck] && craftMap[ck].chotDeal !== true) {
      return { key: ck, data: craftMap[ck] }
    }
  }

  // 2) Quét theo ma_hop_dong_goc hoặc ma_hop_dong trong sale_report_craft
  let bestMatch: { key: string; data: any } | null = null
  for (const [k, v] of Object.entries(craftMap)) {
    if (!v || typeof v !== 'object' || v.chotDeal === true) continue
    const vGoc = String(v.ma_hop_dong_goc || '').trim()
    const vMa = String(v.ma_hop_dong || '').trim()
    if ((vGoc && vGoc === goc) || (vMa && siblingIds.has(vMa))) {
      if (!bestMatch || Number(v.updated_at || 0) > Number(bestMatch.data?.updated_at || 0)) {
        bestMatch = { key: k, data: v }
      }
    }
  }
  return bestMatch
}

function isActiveOnSaleReportCraft(c: Contract | null): boolean {
  if (!c || c.is_completed || isFamilyCompleted(c)) return false
  const entry = findCraftEntryForFamily(c)
  if (!entry) return false
  const activeMa = String(entry.data?.ma_hop_dong || '').trim()
  if (activeMa) return activeMa === c.ma_hop_dong
  const goc = String(c.ma_hop_dong_goc || c.ma_hop_dong).trim()
  const siblings = (familyVersionsMap.value.get(goc) || [c]).filter(v => !v.is_completed)
  return siblings.length > 0 && siblings[siblings.length - 1].ma_hop_dong === c.ma_hop_dong
}

function canPinToSaleReportCraft(c: Contract | null): boolean {
  if (!c || c.is_completed || isFamilyCompleted(c)) return false
  return !isActiveOnSaleReportCraft(c)
}

function buildCraftSyncPayloadFromContract(item: Contract, existingCraft: any, craftKey: string) {
  const maGocFinal = String(item.ma_hop_dong_goc || item.ma_hop_dong).trim()
  const custInfo = getCustomerInfo(item.ma_khach_hang)
  const custRawRow = customerMap.value.get(String(item.ma_khach_hang || '').trim())
  const maCongTy = custRawRow ? String(custRawRow[4] || '') : String(existingCraft?.Ma_cong_ty || '')

  const ctRows = allDetailsRaw.value
    .filter(r => String(r[0] || '').trim() === item.ma_hop_dong)
    .map(r => r.slice())

  let calcMuaChuaVat = 0
  let calcListVnd = 0

  const goodsList = ctRows.map((r, idx) => {
    const sl = toNum(r[13], 0)
    const vatPct = toNum(r[20], 0)
    const curStr = String(r[24] || 'VND').trim().toUpperCase()
    const tgRow = toNum(r[25], 1) || 1
    const tgUsd = toNum(r[28], tgRow > 1 ? tgRow : 1) || 1

    let giaMuaUnit = toNum(r[14], 0)
    if (curStr === 'USD' && toNum(r[29], 0) > 0) giaMuaUnit = round2(toNum(r[29], 0) * tgUsd)
    const ttMua = round2(giaMuaUnit * sl)
    calcMuaChuaVat += ttMua

    let unitHD = toNum(r[43], 0)
    if (unitHD <= 0) {
      const savedDg = toNum(r[15], 0)
      unitHD = curStr === 'USD' && toNum(r[30], 0) > 0 && savedDg < 100000 ? round2(toNum(r[30], 0) * tgUsd) : savedDg
    }
    const ttTruocHD = toNum(r[44], 0) > 0 ? toNum(r[44], 0) : round2(unitHD * sl)
    const vatHD = toNum(r[45], 0) > 0 || vatPct === 0 ? toNum(r[45], 0) : round2(ttTruocHD * (vatPct / 100))
    const ttSauHD = toNum(r[46], 0) > 0 ? toNum(r[46], 0) : round2(ttTruocHD + vatHD)

    const hasSavedKh = toNum(r[47], 0) > 0 || toNum(r[48], 0) > 0
    let unitKhach = toNum(r[47], 0)
    if (!hasSavedKh) {
      const offG = toNum(r[37], toNum(r[22], 0))
      const hwG = toNum(r[38], toNum(r[16], 0))
      const nhapG = toNum(r[39], toNum(r[17], 0))
      if (curStr === 'USD') {
        const baseUsd = toNum(r[36], 0) > 0 ? toNum(r[36], 0) : toNum(r[29], 0)
        unitKhach = round2(((hwG + baseUsd) * (1 - offG / 100) + nhapG) * tgUsd)
      } else {
        const baseVnd = toNum(r[35], 0) > 0 ? toNum(r[35], 0) : toNum(r[47], toNum(r[14], 0))
        unitKhach = round2((hwG + baseVnd) * (1 - offG / 100) + nhapG)
      }
    }
    const ttTruocKhach = toNum(r[48], 0) > 0 ? toNum(r[48], 0) : round2(unitKhach * sl)
    const vatKhach = toNum(r[49], 0) > 0 || vatPct === 0 ? toNum(r[49], 0) : round2(ttTruocKhach * (vatPct / 100))
    const ttSauKhach = toNum(r[50], 0) > 0 ? toNum(r[50], 0) : round2(ttTruocKhach + vatKhach)

    const lpVnd = toNum(r[42], 0) > 0 ? toNum(r[42], 0) : unitKhach
    calcListVnd += lpVnd * sl

    const maHang = String(r[2] || '')
    const skuVal = String(r[34] || getHangHoaSkuCode(maHang) || '')
    const tenHang = String(r[3] || '')
    const dienGiaiStr = String(r[33] || r[7] || tenHang).trim()

    return {
      stt: idx + 1,
      maHang,
      danhMuc: String(r[10] || r[6] || ''),
      ten: tenHang,
      dienGiai: dienGiaiStr,
      dvt: String(r[12] || ''),
      sl,
      donGia: unitHD,
      ttTruoc: ttTruocHD,
      vat: vatHD,
      ttSau: ttSauHD,
      vatPct: String(vatPct),
      ma_hang_hoa: maHang,
      sku_code: skuVal,
      ten_hang_hoa: tenHang,
      hang: String(r[6] || r[10] || ''),
      don_gia: unitHD,
      thanh_tien_truoc_vat: ttTruocHD,
      vat_pct: vatPct,
      tien_vat: vatHD,
      thanh_tien_sau_vat: ttSauHD,
      don_gia_hop_dong: unitHD,
      thanh_tien_truoc_vat_hop_dong: ttTruocHD,
      tien_vat_hop_dong: vatHD,
      thanh_tien_sau_vat_hop_dong: ttSauHD,
      don_gia_khach: unitKhach,
      thanh_tien_truoc_vat_khach: ttTruocKhach,
      tien_vat_khach: vatKhach,
      thanh_tien_sau_vat_khach: ttSauKhach,
      list_price_vnd: lpVnd,
      gia_tieu_chuan_vnd: giaMuaUnit,
      thanh_tien_mua_chua_vat: ttMua,
      muc_phan_tram_off_hop_dong: toNum(r[22], 0),
      chenh_lech_truoc_vat: round2(ttTruocHD - ttTruocKhach)
    }
  })

  const giaMuaFinal = item.gia_mua > 0 ? item.gia_mua : round2(calcMuaChuaVat)
  const tongCpFinal = item.tong_cp > 0 ? item.tong_cp : (toNum(existingCraft?.Tong_CP_don_hang ?? existingCraft?.tongCP, 0) || giaMuaFinal)
  const truocListFinal = item.tong_truoc_thue_list > 0 ? item.tong_truoc_thue_list : round2(calcListVnd)

  const firstDetail = ctRows[0] || []
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const nowCreatedStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const contentPO = item.content_of_contract_po || item.so_hop_dong
  const existingSoPo = String(existingCraft?.So_PO ?? existingCraft?.soPO ?? item.so_po ?? '').trim()

  const hdFiles = extractFilePairs(item.ten_file, item.link_file)
  const khFiles = extractFilePairs(item.ten_file_khach, item.link_file_khach)
  const tenFileHD = hdFiles[0]?.name || ''
  const linkFileHD = hdFiles[0]?.link || ''
  const tenFileKhach = khFiles[0]?.name || ''
  const linkFileKhach = khFiles[0]?.link || ''

  const grossComVal = item.chiet_khau_truoc_thue || item.chenh_lech_gia || 0
  const netComVal = item.con_lai || item.tong_chiet_khau || 0
  const grossComPctVal = item.tong_truoc_thue > 0 ? round2((grossComVal / item.tong_truoc_thue) * 100) : item.chiet_khau_truoc_thue_pct
  const daTT = toNum(existingCraft?.so_tien_da_thanh_toan, 0)

  const goodsTotal = {
    ttTruoc: item.tong_truoc_thue,
    vat: item.tong_vat,
    ttSau: item.tong_sau_thue,
    truoc_vat: item.tong_truoc_thue,
    sau_vat: item.tong_sau_thue,
    truoc_vat_hop_dong: item.tong_truoc_thue,
    vat_hop_dong: item.tong_vat,
    sau_vat_hop_dong: item.tong_sau_thue,
    truoc_vat_khach: item.tong_truoc_thue_khach,
    vat_khach: item.tong_vat_khach,
    sau_vat_khach: item.tong_sau_thue_khach,
    truoc_vat_list: truocListFinal,
    tong_mua_hang_chua_vat: giaMuaFinal,
    tong_cp_don_hang: tongCpFinal,
    chenh_lech_truoc_vat: round2(item.tong_truoc_thue - item.tong_truoc_thue_khach)
  }

  return {
    ...(existingCraft && typeof existingCraft === 'object' ? existingCraft : {}),
    ID: craftKey,
    source_type: 'baogia_goc',
    created_time: String(existingCraft?.created_time || item.created_time || '').trim() || nowCreatedStr,
    updated_at: Date.now(),
    ma_hop_dong: item.ma_hop_dong,
    so_hop_dong: item.so_hop_dong,
    ma_hop_dong_goc: maGocFinal,
    So_PO: existingSoPo,
    soPO: existingSoPo,
    content_of_contract_po: contentPO,
    content_of_contract_PO: contentPO,
    content: contentPO,
    Ma_khach_hang: item.ma_khach_hang,
    Ten_khach_hang: item.ten_khach_hang,
    Ma_cong_ty: maCongTy,
    Ten_cong_ty: custInfo.tenCongTy,
    customer: custInfo.tenCongTy || item.ten_khach_hang,
    recipient: item.ten_khach_hang,
    MST: custInfo.mst,
    mst: custInfo.mst,
    Ma_nha_cung_cap: String(firstDetail[5] || existingCraft?.Ma_nha_cung_cap || ''),
    Ten_nha_cung_cap: String(firstDetail[6] || existingCraft?.Ten_nha_cung_cap || ''),
    productType: String(firstDetail[6] || firstDetail[10] || existingCraft?.productType || ''),
    ghi_chu: item.ghi_chu || '',
    ghiChu: item.ghi_chu || '',
    Tong_tien_truoc_thueVAT: item.tong_truoc_thue,
    Tong_thueVAT: item.tong_vat,
    Tong_tien_sau_thueVAT: item.tong_sau_thue,
    doanhSoBan: item.tong_truoc_thue,
    Tong_gia_thuc_te: item.tong_truoc_thue_khach,
    Tong_tien_truoc_thueVAT_khach: item.tong_truoc_thue_khach,
    tong_truoc_vat_goc: item.tong_truoc_thue_khach,
    Tong_thueVAT_khach: item.tong_vat_khach,
    Tong_tien_sau_thueVAT_khach: item.tong_sau_thue_khach,
    doanhSoBan_khach: item.tong_truoc_thue_khach,
    Tong_tien_truoc_thueVAT_list: truocListFinal,
    Tong_thanh_tien_chua_VAT_mua_hang: giaMuaFinal,
    giaMua: giaMuaFinal,
    Tong_CP_don_hang: tongCpFinal,
    tongCP: tongCpFinal,
    chiet_khau_tong_truoc_thue: item.chiet_khau_truoc_thue,
    phan_tram_chiet_khau_tong_truoc_thue: item.chiet_khau_truoc_thue_pct,
    thue_chenh_lech_gia: item.thue_chenh_lech,
    phan_tram_thue_chenh_lech_gia: item.thue_chenh_lech_pct,
    taxPct: item.thue_chenh_lech_pct,
    chenh_lech_gia: item.chenh_lech_gia,
    gross_com: grossComVal,
    grossCom: grossComVal,
    phan_tram_com: grossComPctVal,
    gross_com_pct: grossComPctVal,
    con_lai: item.con_lai,
    tong_chiet_khau: item.tong_chiet_khau,
    net_com: netComVal,
    netCom: netComVal,
    account_manager_name: String(existingCraft?.account_manager_name || 'LÊ PHI SƠN'),
    am: String(existingCraft?.am || 'LÊ PHI SƠN'),
    link_excel_bao_gia: linkFileHD,
    link_excel_bao_gia_hd: linkFileHD,
    linkBaoGia: linkFileHD,
    ten_file_bao_gia: tenFileHD,
    ten_file_bao_gia_hd: tenFileHD,
    tenFileBG: tenFileHD,
    link_excel_bao_gia_khach: linkFileKhach,
    linkBaoGiaKhach: linkFileKhach,
    ten_file_bao_gia_khach: tenFileKhach,
    tenFileBGKhach: tenFileKhach,
    cong_no: Math.max(0, item.tong_sau_thue - daTT),
    so_tien_da_thanh_toan: daTT,
    thoi_gian_thanh_toan: String(existingCraft?.thoi_gian_thanh_toan || ''),
    loai_thanh_toan: String(existingCraft?.loai_thanh_toan || 'mot_lan'),
    han_thanh_toan: String(existingCraft?.han_thanh_toan || ''),
    ke_hoach_thanh_toan: Array.isArray(existingCraft?.ke_hoach_thanh_toan) ? existingCraft.ke_hoach_thanh_toan : [],
    goodsList: goodsList.length > 0 ? goodsList : (Array.isArray(existingCraft?.goodsList) ? existingCraft.goodsList : []),
    goodsTotal,
    lam_tron_ti_suat: item.lam_tron_ti_suat,
    is_craft: true,
    chotDeal: false
  }
}

async function pinContractToSaleReportCraft(c: Contract | null) {
  if (!c || c.is_completed || isFamilyCompleted(c)) return
  pinningSrCraftMa.value = c.ma_hop_dong
  try {
    const existingEntry = findCraftEntryForFamily(c)
    const craftKey =
      existingEntry?.key ||
      c.id_sale_report_craft ||
      push(dbRef(database, 'sale_report_craft')).key ||
      `CRAFT_${Date.now()}`
    const existingCraft = existingEntry?.data || {}
    const craftPayload = buildCraftSyncPayloadFromContract(c, existingCraft, craftKey)

    const updates: Record<string, any> = {
      [`sale_report_craft/${craftKey}`]: craftPayload
    }
    const goc = String(c.ma_hop_dong_goc || c.ma_hop_dong).trim()
    const siblings = familyVersionsMap.value.get(goc) || [c]
    siblings.forEach(s => {
      if (!s.is_completed && s.id_sale_report_craft !== craftKey) {
        const sKey = s._fbKey || s.ma_hop_dong
        updates[`hop_dong_tong_quat/${sKey}/id_sale_report_craft`] = craftKey
      }
    })

    await update(dbRef(database), updates)
    const verLbl = getVersionNumberLabel(c)
    triggerToast(
      `Đã đưa ${verLbl ? verLbl + ' · ' : ''}${c.so_hop_dong || c.ma_hop_dong} lên Sale Report Tạm`,
      'success'
    )
  } catch (e: any) {
    console.error(e)
    triggerToast('Không thể cập nhật Sale Report Tạm: ' + String(e?.message || e), 'error')
  } finally {
    pinningSrCraftMa.value = ''
  }
}

async function requestDeleteDraft(c: Contract, closeDetailAfter = false) {
  if (!c || c.is_completed || c.trang_thai === 'Chính thức') return
  const cust = getCustomerInfo(c.ma_khach_hang)
  const goc = String(c.ma_hop_dong_goc || c.ma_hop_dong).trim()
  const remainingSiblings = (familyVersionsMap.value.get(goc) || []).filter(
    other => other.ma_hop_dong !== c.ma_hop_dong && !other.is_completed && other.trang_thai !== 'Chính thức'
  )
  // Phiên bản dự phòng mới nhất còn lại (mảng đã sort cũ -> mới nên phần tử cuối là mới nhất)
  const fallbackSibling = remainingSiblings.length > 0 ? remainingSiblings[remainingSiblings.length - 1] : null
  const activeCraftEntry = findCraftEntryForFamily(c)
  const wasActiveOnCraft = isActiveOnSaleReportCraft(c)

  const metaLines: { label: string; value: string }[] = [
    { label: 'Số / Mã HĐ', value: c.so_hop_dong || c.ma_hop_dong },
    { label: 'Khách hàng', value: cust.tenCongTy || c.ten_khach_hang || '—' },
    { label: 'Giá trị sau thuế', value: `${formatVND(c.tong_sau_thue)} đ` }
  ]
  if (activeCraftEntry && wasActiveOnCraft) {
    metaLines.push({
      label: 'Sale Report Tạm',
      value: fallbackSibling
        ? `Tự động lùi về ${fallbackSibling.so_hop_dong || fallbackSibling.ma_hop_dong}`
        : 'Gỡ khỏi Sale Report Tạm'
    })
  }

  const ok = await askConfirm({
    title: 'Xóa bản báo giá tạm?',
    message: 'Bản báo giá tạm và các dòng hàng chi tiết của phiên bản này sẽ bị xóa vĩnh viễn.',
    confirmText: 'Xóa vĩnh viễn',
    cancelText: 'Giữ lại',
    variant: 'danger',
    metaLines
  })
  if (!ok) return

  showAsyncLoading('Đang xóa bản báo giá tạm...')
  try {
    const updates: Record<string, any> = {}
    const hdKey = c._fbKey || c.ma_hop_dong
    updates[`hop_dong_tong_quat/${hdKey}`] = null
    updates[`hop_dong_version/${c.ma_hop_dong}`] = null

    const ctKeys = detailFbKeysByContract.value[c.ma_hop_dong] || []
    ctKeys.forEach(k => {
      updates[`hop_dong_chi_tiet/${k}`] = null
    })

    const craftKey = activeCraftEntry?.key || c.id_sale_report_craft
    if (craftKey) {
      if (fallbackSibling) {
        // Nếu bản đang xóa là bản Active trên SR Tạm, tự động rollback sang phiên bản mới nhất còn lại
        if (wasActiveOnCraft || String(activeCraftEntry?.data?.ma_hop_dong || '').trim() === c.ma_hop_dong) {
          const rollbackPayload = buildCraftSyncPayloadFromContract(
            fallbackSibling,
            activeCraftEntry?.data || {},
            craftKey
          )
          updates[`sale_report_craft/${craftKey}`] = rollbackPayload
          const fbFallbackKey = fallbackSibling._fbKey || fallbackSibling.ma_hop_dong
          updates[`hop_dong_tong_quat/${fbFallbackKey}/id_sale_report_craft`] = craftKey
        }
      } else if (!isFamilyCompleted(c)) {
        // Không còn phiên bản nào khác trong chuỗi -> dọn luôn sale_report_craft
        updates[`sale_report_craft/${craftKey}`] = null
      }
    }

    await update(dbRef(database), updates)
    if (closeDetailAfter || selectedContract.value?.ma_hop_dong === c.ma_hop_dong) {
      showDetailModal.value = false
      selectedContract.value = null
    }
    asyncResultModal.value.show = false
    if (fallbackSibling && wasActiveOnCraft && craftKey) {
      triggerToast(
        `Đã xóa ${c.so_hop_dong || c.ma_hop_dong} · SR Tạm tự lùi về ${fallbackSibling.so_hop_dong || fallbackSibling.ma_hop_dong}`,
        'success'
      )
    } else {
      triggerToast(`Đã xóa bản tạm ${c.so_hop_dong || c.ma_hop_dong}`, 'success')
    }
  } catch (err: any) {
    showAsyncError('Xóa thất bại', String(err?.message || err))
  }
}

/* ======================
   CHỐT DEAL & ĐỒNG BỘ TOÀN DIỆN (47 CỘT + SALE_REPORT + SALE_REPORT_CRAFT + QUAN_LY_FILE + PO_DXMH)
====================== */
const chotDealLoading = ref(false)

async function findCustomerInFirebase(maKH: string): Promise<{ key: string; data: any } | null> {
  const target = String(maKH || '').trim()
  if (!target) return null
  try {
    const directSnap = await get(dbRef(database, `khach_hang/${target}`))
    if (directSnap.exists()) return { key: target, data: directSnap.val() }
    const allSnap = await get(dbRef(database, 'khach_hang'))
    const allData = allSnap.val()
    if (allData && typeof allData === 'object') {
      for (const [k, v] of Object.entries(allData)) {
        if (!v || typeof v !== 'object') continue
        const recMa = String((v as any).ma_khach_hang ?? (v as any).Ma_khach_hang ?? k ?? '').trim()
        if (recMa === target) return { key: k, data: v }
      }
    }
  } catch {}
  return null
}

async function findExistingSaleReportCraftInfo(
  maMoi: string,
  maCu: string,
  maGoc: string,
  linkedCraftHint: string
): Promise<{ craftKey: string; existingData: any | null }> {
  if (linkedCraftHint) {
    try {
      const snap = await get(dbRef(database, `sale_report_craft/${linkedCraftHint}`))
      if (snap.exists()) return { craftKey: linkedCraftHint, existingData: snap.val() }
    } catch {}
  }
  const candidates = new Set([maMoi, maCu, maGoc].map(s => String(s || '').trim()).filter(Boolean))
  try {
    const allCraftSnap = await get(dbRef(database, 'sale_report_craft'))
    if (allCraftSnap.exists()) {
      const allCrafts = allCraftSnap.val() || {}
      for (const [k, v] of Object.entries(allCrafts) as [string, any][]) {
        if (!v || typeof v !== 'object') continue
        const mhd = String(v.ma_hop_dong || '').trim()
        const mhdGoc = String(v.ma_hop_dong_goc || '').trim()
        if ((mhd && candidates.has(mhd)) || (mhdGoc && candidates.has(mhdGoc))) {
          return { craftKey: k, existingData: v }
        }
      }
    }
  } catch {}
  const newKey = push(dbRef(database, 'sale_report_craft')).key || `CRAFT_${Date.now()}`
  return { craftKey: newKey, existingData: null }
}

function formatDateTimeVN(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

async function saveContractVersionFirebase(maMoi: string, soHopDongStr: string, maCu: string) {
  const nowStr = formatDateTimeVN(new Date())
  const updates: Record<string, any> = {}
  if (maCu) {
    try {
      const verSnap = await get(dbRef(database, 'hop_dong_version'))
      const verData = verSnap.val()
      if (verData && typeof verData === 'object') {
        for (const [k, v] of Object.entries(verData)) {
          const recMa = Array.isArray(v) ? String(v[0] || '') : String((v as any)?.ma_hop_dong || k || '')
          if (recMa === maCu) {
            if (Array.isArray(v)) {
              const copy = [...v]
              copy[4] = false
              updates[`hop_dong_version/${k}`] = copy
            } else {
              updates[`hop_dong_version/${k}/is_active`] = false
            }
          }
        }
      }
    } catch {}
  }
  updates[`hop_dong_version/${maMoi}`] = {
    ma_hop_dong: maMoi,
    so_hop_dong: soHopDongStr,
    ma_hop_dong_cu: maCu || '',
    ma_hop_dong_truoc: maCu || '',
    created_time: nowStr,
    created_at: nowStr,
    is_active: true
  }
  await update(dbRef(database), updates)
}

async function markDraftsAsCompletedFirebase(maGoc: string, excludeMaHD: string) {
  if (!maGoc) return
  try {
    const snap = await get(dbRef(database, 'hop_dong_tong_quat'))
    const data = snap.val()
    if (!data || typeof data !== 'object') return
    const updates: Record<string, any> = {}
    for (const [k, v] of Object.entries(data)) {
      const row = fbHopDongTongQuatToRow(v, k)
      const rowMaHD = String(row[0] || '').trim()
      const rowMaGoc = String(row[32] || '').trim()
      const rowCompleted = row[33] === true || String(row[33]).toUpperCase() === 'TRUE'
      if (rowMaGoc === maGoc && rowMaHD !== excludeMaHD && !rowCompleted) {
        if (Array.isArray(v)) {
          const copy = [...v]
          while (copy.length < 47) copy.push('')
          copy[33] = true
          updates[`hop_dong_tong_quat/${k}`] = copy
        } else {
          updates[`hop_dong_tong_quat/${k}/isCompleted`] = true
        }
      }
    }
    if (Object.keys(updates).length > 0) await update(dbRef(database), updates)
  } catch (e) {
    console.warn('markDraftsAsCompletedFirebase error:', e)
  }
}

async function chotDealAndSaleReport(item: Contract) {
  if (!item || item.is_completed) return
  const custInfo = getCustomerInfo(item.ma_khach_hang)
  const ok = await askConfirm({
    title: 'Xác nhận Chốt Deal & Tạo PO?',
    message: 'Hệ thống sẽ phát hành Hợp đồng Chính thức, cấp số PO tự động và đồng bộ đầy đủ sang Sale Report, PO_DXMH & Quản lý File.',
    confirmText: 'Xác nhận Chốt Deal',
    cancelText: 'Hủy',
    variant: 'primary',
    metaLines: [
      { label: 'Số / Mã báo giá', value: item.so_hop_dong || item.ma_hop_dong },
      { label: 'Khách hàng', value: custInfo.tenCongTy || item.ten_khach_hang || '—' },
      { label: 'Tổng HĐ (Sau thuế)', value: `${formatVND(item.tong_sau_thue)} đ` },
      ...(getContractNetCom(item) > 0
        ? [{ label: 'Net COM dự kiến', value: `${formatVND(getContractNetCom(item))} đ` }]
        : [])
    ]
  })
  if (!ok) return

  chotDealLoading.value = true
  showAsyncLoading('Đang chốt deal & đồng bộ Sale Report...')
  try {
    const rawRow = allHdRaw.value.find(r => String(r[0] || '').trim() === item.ma_hop_dong)
    if (!rawRow) throw new Error('Không tìm thấy dữ liệu hợp đồng gốc')

    const ctRows = allDetailsRaw.value
      .filter(r => String(r[0] || '').trim() === item.ma_hop_dong)
      .map(r => [...r])
    if (!ctRows.length) throw new Error('Không tìm thấy chi tiết hàng hóa của báo giá này')

    // 1) Tự động lấy Số PO kế tiếp từ PO_DXMH
    let nextPO = ''
    try {
      const poSnap = await get(dbRef(database, 'PO_DXMH'))
      const poObj = poSnap.val()
      let maxPO = 0
      if (poObj && typeof poObj === 'object') {
        Object.values(poObj).forEach((v: any) => {
          const rawPo = Array.isArray(v) ? v[2] : (v?.so_po ?? v?.So_PO)
          const parsed = parseInt(String(rawPo || '').replace(/\D/g, ''), 10)
          if (!isNaN(parsed) && parsed > maxPO) maxPO = parsed
        })
      }
      nextPO = String(maxPO + 1)
    } catch {
      nextPO = String(Date.now()).slice(-4)
    }

    const maHopDongMoi = `HD${new Date().toISOString().replace(/\D/g, '')}`
    const maGocFinal = String(item.ma_hop_dong_goc || item.ma_hop_dong).trim()
    const srKey = push(dbRef(database, 'sale_report')).key || `SR_${Date.now()}`
    const craftInfo = await findExistingSaleReportCraftInfo(
      maHopDongMoi,
      item.ma_hop_dong,
      maGocFinal,
      item.id_sale_report_craft
    )
    const craftKey = craftInfo.craftKey
    const existingCraft = craftInfo.existingData || {}

    // 2) Dựng goodsList & tính chuẩn Giá vốn / Tổng CP / Giá Khách / Giá HĐ từ chi tiết
    let calcMuaChuaVat = 0
    let calcListVnd = 0
    const goodsList = ctRows.map((r, idx) => {
      const sl = Math.max(1, toNum(r[18], 1))
      const vatPct = toNum(r[17], 0)
      const tgUsd = toNum(r[24], 0)
      const effTg = tgUsd > 1 ? tgUsd : (toNum(r[16], 1) > 1 ? toNum(r[16], 1) : 1)

      const giaMuaUnit = tgUsd > 1 && toNum(r[25], 0) > 0 ? round2(toNum(r[25], 0) * tgUsd) : round2(toNum(r[13], 0) * effTg)
      const ttMua = round2(giaMuaUnit * sl)
      calcMuaChuaVat += ttMua

      const unitHD = tgUsd > 1
        ? round2(((toNum(r[20], 0) + toNum(r[26], 0)) * (1 - toNum(r[22], 0) / 100) + toNum(r[27], 0)) * tgUsd)
        : round2(((toNum(r[20], 0) + toNum(r[14], 0)) * (1 - toNum(r[22], 0) / 100) + toNum(r[21], 0)) * effTg)
      const ttTruocHD = round2(unitHD * sl)
      const vatHD = round2(ttTruocHD * (vatPct / 100))
      const ttSauHD = round2(ttTruocHD + vatHD)

      const hasKhach = (r[35] !== undefined && r[35] !== '') || (r[47] !== undefined && r[47] !== '')
      let unitKhach = unitHD
      if (hasKhach) {
        const hwG = r[38] !== undefined && r[38] !== '' ? toNum(r[38], 0) : toNum(r[20], 0)
        const nhapG = r[39] !== undefined && r[39] !== '' ? toNum(r[39], 0) : (tgUsd > 1 ? toNum(r[27], 0) : toNum(r[21], 0))
        const offG = r[37] !== undefined && r[37] !== '' ? toNum(r[37], 0) : toNum(r[22], 0)
        if (tgUsd > 1) {
          const baseUsd = toNum(r[36], 0) > 0 ? toNum(r[36], 0) : (toNum(r[35], 0) > 0 ? toNum(r[35], 0) / tgUsd : toNum(r[26], 0))
          unitKhach = round2(((hwG + baseUsd) * (1 - offG / 100) + nhapG) * tgUsd)
        } else {
          const baseVnd = toNum(r[35], 0) > 0 ? toNum(r[35], 0) : toNum(r[47], toNum(r[14], 0))
          unitKhach = round2((hwG + baseVnd) * (1 - offG / 100) + nhapG)
        }
      }
      const ttTruocKhach = round2(unitKhach * sl)
      const vatKhach = round2(ttTruocKhach * (vatPct / 100))
      const ttSauKhach = round2(ttTruocKhach + vatKhach)

      const lpVnd = toNum(r[42], 0) > 0 ? toNum(r[42], 0) : unitKhach
      calcListVnd += lpVnd * sl

      const maHang = String(r[2] || '')
      const skuVal = String(r[34] || getHangHoaSkuCode(maHang) || '')
      const tenHang = String(r[3] || '')
      const dienGiaiStr = String(r[33] || r[7] || tenHang).trim()

      return {
        stt: idx + 1,
        maHang,
        danhMuc: String(r[10] || r[6] || ''),
        ten: tenHang,
        dienGiai: dienGiaiStr,
        dvt: String(r[12] || ''),
        sl,
        donGia: unitHD,
        ttTruoc: ttTruocHD,
        vat: vatHD,
        ttSau: ttSauHD,
        vatPct: String(vatPct),
        ma_hang_hoa: maHang,
        sku_code: skuVal,
        ten_hang_hoa: tenHang,
        hang: String(r[6] || r[10] || ''),
        don_gia: unitHD,
        thanh_tien_truoc_vat: ttTruocHD,
        vat_pct: vatPct,
        tien_vat: vatHD,
        thanh_tien_sau_vat: ttSauHD,
        don_gia_hop_dong: unitHD,
        thanh_tien_truoc_vat_hop_dong: ttTruocHD,
        tien_vat_hop_dong: vatHD,
        thanh_tien_sau_vat_hop_dong: ttSauHD,
        don_gia_khach: unitKhach,
        thanh_tien_truoc_vat_khach: ttTruocKhach,
        tien_vat_khach: vatKhach,
        thanh_tien_sau_vat_khach: ttSauKhach,
        list_price_vnd: lpVnd,
        gia_tieu_chuan_vnd: giaMuaUnit,
        thanh_tien_mua_chua_vat: ttMua,
        muc_phan_tram_off_hop_dong: toNum(r[22], 0),
        chenh_lech_truoc_vat: round2(ttTruocHD - ttTruocKhach)
      }
    })

    const giaMuaFinal = item.gia_mua > 0 ? item.gia_mua : round2(calcMuaChuaVat)
    const tongCpFinal = item.tong_cp > 0 ? item.tong_cp : (toNum(existingCraft.Tong_CP_don_hang ?? existingCraft.tongCP, 0) || giaMuaFinal)
    const truocListFinal = item.tong_truoc_thue_list > 0 ? item.tong_truoc_thue_list : round2(calcListVnd)

    // 3) Chuẩn bị dòng 47 cột đầy đủ cho hop_dong_tong_quat
    const hdRow = rawRow.slice(0, 47)
    while (hdRow.length < 47) hdRow.push('')
    hdRow[0] = maHopDongMoi
    hdRow[15] = 'Chính thức'
    hdRow[19] = item.ma_hop_dong
    hdRow[22] = nextPO
    hdRow[32] = maGocFinal
    hdRow[33] = true
    hdRow[37] = item.tong_vat_khach
    hdRow[38] = item.tong_sau_thue_khach
    hdRow[39] = truocListFinal
    hdRow[40] = giaMuaFinal
    hdRow[41] = craftKey
    hdRow[42] = srKey
    hdRow[45] = tongCpFinal

    // Cập nhật công nợ khách hàng
    let congNoCu = 0
    if (item.ma_khach_hang) {
      const custFound = await findCustomerInFirebase(item.ma_khach_hang)
      if (custFound && custFound.data) {
        const cData = custFound.data
        const curChiTieu = toNum(cData.tong_chi_tieu ?? cData.Tong_chi_tieu, 0)
        congNoCu = toNum(cData.tong_loi_nhuan ?? cData.Tong_loi_nhuan, 0)
        const curHoaHong = toNum(cData.hoa_hong ?? cData.Hoa_hong, 0)
        const hhHD = toNum(hdRow[11], 0)
        const daTT = toNum(hdRow[10], 0)
        const ps = Math.max(0, item.tong_sau_thue - daTT)
        await update(dbRef(database, `khach_hang/${custFound.key}`), {
          hoa_hong: curHoaHong + hhHD,
          Hoa_hong: curHoaHong + hhHD,
          tong_chi_tieu: curChiTieu + item.tong_sau_thue,
          Tong_chi_tieu: curChiTieu + item.tong_sau_thue,
          tong_loi_nhuan: congNoCu + ps,
          Tong_loi_nhuan: congNoCu + ps,
          last_updated: new Date().toISOString()
        })
      }
    }
    hdRow[13] = congNoCu

    await set(dbRef(database, `hop_dong_tong_quat/${maHopDongMoi}`), rowToFbHopDongTongQuat(hdRow))
    await saveContractVersionFirebase(maHopDongMoi, item.so_hop_dong, item.ma_hop_dong)
    await markDraftsAsCompletedFirebase(maGocFinal, maHopDongMoi)

    // Lưu chi tiết hợp đồng chính thức (54 cột đầy đủ)
    const ctUpdates: Record<string, any> = {}
    ctRows.forEach(r => {
      r[0] = maHopDongMoi
      const key = push(dbRef(database, 'hop_dong_chi_tiet')).key
      if (key) ctUpdates[`hop_dong_chi_tiet/${key}`] = rowToFbHopDongChiTiet(r, 'Chính thức')
    })
    if (Object.keys(ctUpdates).length > 0) await update(dbRef(database), ctUpdates)

    // 4) Lưu vào sale_report, đồng bộ sale_report_craft & quan_ly_file
    const custRawRow = customerMap.value.get(String(item.ma_khach_hang || '').trim())
    const maCongTy = custRawRow ? String(custRawRow[4] || '') : ''
    const firstDetail = ctRows[0] || []
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const nowCreatedStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    const contentPO = item.content_of_contract_po || item.so_hop_dong

    const hdFiles = extractFilePairs(item.ten_file, item.link_file)
    const khFiles = extractFilePairs(item.ten_file_khach, item.link_file_khach)
    const tenFileHD = hdFiles[0]?.name || String(existingCraft.ten_file_bao_gia || '')
    const linkFileHD = hdFiles[0]?.link || String(existingCraft.link_excel_bao_gia || '')
    const tenFileKhach = khFiles[0]?.name || String(existingCraft.ten_file_bao_gia_khach || '')
    const linkFileKhach = khFiles[0]?.link || String(existingCraft.link_excel_bao_gia_khach || '')

    const grossComVal = item.chiet_khau_truoc_thue || item.chenh_lech_gia || 0
    const netComVal = item.con_lai || item.tong_chiet_khau || 0
    const grossComPctVal = item.tong_truoc_thue_khach > 0 ? round2((grossComVal / item.tong_truoc_thue_khach) * 100) : item.chiet_khau_truoc_thue_pct

    const srPayload = {
      ID: srKey,
      created_time: nowCreatedStr,
      ma_hop_dong: maHopDongMoi,
      so_hop_dong: item.so_hop_dong,
      ma_hop_dong_goc: maGocFinal,
      So_PO: nextPO,
      content_of_contract_po: contentPO,
      content_of_contract_PO: contentPO,
      Ma_khach_hang: item.ma_khach_hang,
      Ten_khach_hang: item.ten_khach_hang,
      Ma_cong_ty: maCongTy,
      Ten_cong_ty: custInfo.tenCongTy,
      MST: custInfo.mst,
      Ma_nha_cung_cap: String(firstDetail[5] || ''),
      Ten_nha_cung_cap: String(firstDetail[6] || ''),
      ghi_chu: item.ghi_chu || '',
      Tong_tien_truoc_thueVAT: item.tong_truoc_thue,
      Tong_thueVAT: item.tong_vat,
      Tong_tien_sau_thueVAT: item.tong_sau_thue,
      doanhSoBan: item.tong_truoc_thue,
      Tong_gia_thuc_te: item.tong_truoc_thue_khach,
      Tong_tien_truoc_thueVAT_khach: item.tong_truoc_thue_khach,
      tong_truoc_vat_goc: item.tong_truoc_thue_khach,
      Tong_thueVAT_khach: item.tong_vat_khach,
      Tong_tien_sau_thueVAT_khach: item.tong_sau_thue_khach,
      doanhSoBan_khach: item.tong_truoc_thue_khach,
      Tong_tien_truoc_thueVAT_list: truocListFinal,
      Tong_thanh_tien_chua_VAT_mua_hang: giaMuaFinal,
      giaMua: giaMuaFinal,
      Tong_CP_don_hang: tongCpFinal,
      tongCP: tongCpFinal,
      chiet_khau_tong_truoc_thue: item.chiet_khau_truoc_thue,
      phan_tram_chiet_khau_tong_truoc_thue: item.chiet_khau_truoc_thue_pct,
      thue_chenh_lech_gia: item.thue_chenh_lech,
      phan_tram_thue_chenh_lech_gia: item.thue_chenh_lech_pct,
      taxPct: item.thue_chenh_lech_pct,
      chenh_lech_gia: item.chenh_lech_gia,
      gross_com: grossComVal,
      grossCom: grossComVal,
      phan_tram_com: grossComPctVal,
      gross_com_pct: grossComPctVal,
      con_lai: item.con_lai,
      tong_chiet_khau: item.tong_chiet_khau,
      net_com: netComVal,
      netCom: netComVal,
      account_manager_name: String(existingCraft.account_manager_name || 'LÊ PHI SƠN'),
      link_excel_bao_gia: linkFileHD,
      link_excel_bao_gia_hd: linkFileHD,
      linkBaoGia: linkFileHD,
      ten_file_bao_gia: tenFileHD,
      ten_file_bao_gia_hd: tenFileHD,
      tenFileBG: tenFileHD,
      link_excel_bao_gia_khach: linkFileKhach,
      linkBaoGiaKhach: linkFileKhach,
      ten_file_bao_gia_khach: tenFileKhach,
      tenFileBGKhach: tenFileKhach,
      cong_no: item.tong_sau_thue,
      so_tien_da_thanh_toan: 0,
      thoi_gian_thanh_toan: '',
      loai_thanh_toan: 'mot_lan',
      han_thanh_toan: '',
      ke_hoach_thanh_toan: [],
      goodsList,
      goodsTotal: item.tong_sau_thue,
      lam_tron_ti_suat: item.lam_tron_ti_suat,
      from_craft: craftKey,
      is_craft: false
    }

    const craftChotPayload = {
      ...existingCraft,
      ...srPayload,
      ID: craftKey,
      created_time: String(existingCraft.created_time || '').trim() || nowCreatedStr,
      updated_at: Date.now(),
      is_craft: true,
      chotDeal: true,
      chotDealTime: Date.now(),
      id_sale_report: srKey,
      So_PO: nextPO,
      soPO: nextPO,
      ma_hop_dong: maHopDongMoi,
      so_hop_dong: item.so_hop_dong,
      ma_hop_dong_goc: maGocFinal
    }

    const officialUpdates: Record<string, any> = {
      [`sale_report/${srKey}`]: srPayload,
      [`sale_report_craft/${craftKey}`]: craftChotPayload
    }

    // Đóng luôn mọi phương án tạm khác thuộc cùng chuỗi ma_hop_dong_goc (nếu có) để tránh sót bản tạm trùng
    for (const [ck, cv] of Object.entries(saleReportCraftMap.value)) {
      if (ck === craftKey || !cv || typeof cv !== 'object' || cv.chotDeal === true) continue
      if (String(cv.ma_hop_dong_goc || '').trim() === maGocFinal) {
        officialUpdates[`sale_report_craft/${ck}/chotDeal`] = true
        officialUpdates[`sale_report_craft/${ck}/chotDealTime`] = Date.now()
        officialUpdates[`sale_report_craft/${ck}/id_sale_report`] = srKey
        officialUpdates[`sale_report_craft/${ck}/So_PO`] = nextPO
        officialUpdates[`sale_report_craft/${ck}/soPO`] = nextPO
      }
    }

    const existingFileId = String(existingCraft.id_quanlyfile || existingCraft.id_quan_ly_file || '').trim()
    if (existingFileId) {
      officialUpdates[`quan_ly_file/${existingFileId}/craft_chotDeal`] = true
      officialUpdates[`quan_ly_file/${existingFileId}/id_sale_report`] = srKey
      officialUpdates[`quan_ly_file/${existingFileId}/trangThaiBaoGia`] = 'Thành công'
      if (linkFileHD) {
        officialUpdates[`quan_ly_file/${existingFileId}/link_excel_bao_gia`] = linkFileHD
        officialUpdates[`quan_ly_file/${existingFileId}/ten_file_bao_gia`] = tenFileHD
      }
      if (linkFileKhach) {
        officialUpdates[`quan_ly_file/${existingFileId}/link_excel_bao_gia_khach`] = linkFileKhach
        officialUpdates[`quan_ly_file/${existingFileId}/ten_file_bao_gia_khach`] = tenFileKhach
      }
    }
    await update(dbRef(database), officialUpdates)

    // 5) Lưu PO_DXMH & chi_tiet_mua_hang
    if (contentPO) {
      const poCreatedDateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`
      const poPayload = {
        ma_hop_dong: maHopDongMoi,
        Ma_hop_dong: maHopDongMoi,
        so_hop_dong: item.so_hop_dong,
        so_po: nextPO,
        So_PO: nextPO,
        ten_po: contentPO,
        Ten_PO: contentPO,
        content_of_contract_po: contentPO,
        content_of_contract_PO: contentPO,
        ma_khach_hang: item.ma_khach_hang,
        Ma_khach_hang: item.ma_khach_hang,
        company: custInfo.tenCongTy,
        COMPANY: custInfo.tenCongTy,
        mst: custInfo.mst,
        MST: custInfo.mst,
        address: custInfo.diaChi,
        ADDRESS: custInfo.diaChi,
        tel: custRawRow ? String(custRawRow[6] || custRawRow[22] || '') : '',
        TEL: custRawRow ? String(custRawRow[6] || custRawRow[22] || '') : '',
        contact: item.ten_khach_hang,
        CONTACT: item.ten_khach_hang,
        email: custRawRow ? String(custRawRow[9] || custRawRow[2] || '') : '',
        EMAIL: custRawRow ? String(custRawRow[9] || custRawRow[2] || '') : '',
        created_time: poCreatedDateStr,
        Created_time: poCreatedDateStr
      }
      await set(dbRef(database, `PO_DXMH/${maHopDongMoi}`), poPayload).catch(() => {})

      const ctmhUpdates: Record<string, any> = {}
      goodsList.forEach(g => {
        const k = push(dbRef(database, 'chi_tiet_mua_hang')).key
        if (k) {
          ctmhUpdates[`chi_tiet_mua_hang/${k}`] = {
            ma_hop_dong: maHopDongMoi,
            Ma_hop_dong: maHopDongMoi,
            so_hop_dong: item.so_hop_dong,
            so_po: nextPO,
            So_PO: nextPO,
            ten_po: contentPO,
            Ten_PO: contentPO,
            ma_hang_hoa: g.ma_hang_hoa,
            Ma_hang_hoa: g.ma_hang_hoa,
            sku_code: g.sku_code,
            SKU: g.sku_code,
            ten_hang_hoa: g.ten_hang_hoa,
            Ten_hang_hoa: g.ten_hang_hoa,
            ma_nha_cung_cap: '',
            Ma_nha_cung_cap: '',
            ten_nha_cung_cap: g.hang,
            Ten_nha_cung_cap: g.hang,
            sl: g.sl,
            Sl: g.sl,
            don_gia: g.don_gia_hop_dong,
            Don_gia: g.don_gia_hop_dong,
            thanh_tien: g.thanh_tien_truoc_vat_hop_dong,
            Thanh_tien: g.thanh_tien_truoc_vat_hop_dong,
            content_of_contract_po: contentPO,
            content_of_contract_PO: contentPO
          }
        }
      })
      if (Object.keys(ctmhUpdates).length > 0) await update(dbRef(database), ctmhUpdates).catch(() => {})
    }

    showDetailModal.value = false
    showAsyncSuccess('Chốt Deal thành công!', `Đã tạo Hợp đồng chính thức · PO #${nextPO}`)
  } catch (e: any) {
    console.error(e)
    showAsyncError('Chốt Deal thất bại', String(e?.message || e))
  } finally {
    chotDealLoading.value = false
  }
}

/* ======================
   EXCEL EXPORT (ƯU TIÊN TÊN HÀNG / DIỄN GIẢI BÁO GIÁ & CHẾ ĐỘ GIÁ ĐANG CHỌN)
====================== */
const exportingExcel = ref(false)

async function downloadDetailExcel() {
  if (!selectedContract.value || !selectedContractDetails.value.length) return
  exportingExcel.value = true
  try {
    const c = selectedContract.value
    const useKhach = detailViewMode.value === 'khach'
    const custInfo = getCustomerInfo(c.ma_khach_hang)

    const workbook = new ExcelJS.Workbook()
    const response = await fetch('/template_goc.xlsx')
    const buffer = await response.arrayBuffer()
    await workbook.xlsx.load(buffer)
    const ws = workbook.worksheets[0]

    let headerRowIdx = -1
    let totalRowIdx = -1
    ws.eachRow((row, rowNumber) => {
      if (row.getCell(1).value === 'STT' && String(row.getCell(2).value).includes('TÊN HÀNG HÓA')) {
        headerRowIdx = rowNumber
      }
      const rowText = String(row.getCell(1).value || '') + ' ' + String(row.getCell(2).value || '')
      if (rowText.includes('TỔNG CỘNG + THUẾ')) {
        totalRowIdx = rowNumber
      }
    })

    if (headerRowIdx === -1 || totalRowIdx === -1) {
      triggerToast('Không đọc được file mẫu template_goc.xlsx', 'error')
      return
    }

    const groupStyle: any = {}
    const dataRowStyle: any = {}
    const totalRowStyle: any = {}
    for (let col = 1; col <= 9; col++) {
      groupStyle[col] = ws.getRow(headerRowIdx + 1).getCell(col).style
      dataRowStyle[col] = ws.getRow(headerRowIdx + 2).getCell(col).style
      totalRowStyle[col] = ws.getRow(totalRowIdx).getCell(col).style
    }

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
      if (merge.model.top > totalRowIdx) footerMerges.push(merge.model)
      if (merge.model.top >= headerRowIdx) {
        ws.unMergeCells(merge.model.top, merge.model.left, merge.model.bottom, merge.model.right)
      }
    })

    ws.spliceRows(headerRowIdx + 1, totalRowIdx - headerRowIdx)
    for (let r = headerRowIdx + 1; r <= maxRow + 200; r++) {
      ;(ws.getRow(r) as any).height = undefined
      ws.getRow(r).hidden = false
    }

    let insertIdx = headerRowIdx + 1
    let groupNum = 0
    let sumTruoc = 0
    let sumVat = 0
    let sumSau = 0

    groupedDetails.value.forEach(group => {
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
        const unitVnd = Math.round(useKhach ? lineUnitKhachVnd(d) : lineUnitHDVnd(d))
        const truoc = Math.round(unitVnd * d.so_luong)
        const vat = Math.round((truoc * d.thue_vat) / 100)
        const sau = truoc + vat

        sumTruoc += truoc
        sumVat += vat
        sumSau += sau

        const exportName = d.ten_hang_bao_gia || d.ten_hang
        const exportDesc =
          d.dien_giai_bao_gia ||
          d.description ||
          [d.mo_ta_chung, d.mo_ta_chi_tiet, d.features].filter(Boolean).join('\n')

        row.getCell(1).value = di + 1
        row.getCell(2).value = exportName
        row.getCell(3).value = exportDesc
        row.getCell(4).value = d.dvt
        row.getCell(5).value = Number(d.so_luong) || 0
        row.getCell(6).value = unitVnd
        row.getCell(7).value = truoc
        row.getCell(8).value = vat
        row.getCell(9).value = sau

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

    ws.spliceRows(insertIdx, 0, [])
    const totRow = ws.getRow(insertIdx)
    totRow.getCell(1).value = 'TỔNG CỘNG + THUẾ'
    totRow.getCell(7).value = sumTruoc
    totRow.getCell(8).value = sumVat
    totRow.getCell(9).value = sumSau
    for (let col = 1; col <= 9; col++) totRow.getCell(col).style = totalRowStyle[col]
    ws.mergeCells(insertIdx, 1, insertIdx, 6)

    const diff = insertIdx - totalRowIdx
    footerMerges.forEach(m => {
      try {
        ws.mergeCells(m.top + diff, m.left, m.bottom + diff, m.right)
      } catch {}
    })

    let currentFooterIdx = insertIdx + 1
    footerRowProps.forEach(props => {
      if (props.height !== undefined) ws.getRow(currentFooterIdx).height = props.height
      if (props.hidden !== undefined) ws.getRow(currentFooterIdx).hidden = props.hidden
      if (props.outlineLevel !== undefined) ws.getRow(currentFooterIdx).outlineLevel = props.outlineLevel
      currentFooterIdx++
    })

    ws.getCell('A7').value = `Kính gởi: ${custInfo.tenCongTy || c.ten_khach_hang || ''}`
    const cellA8 = ws.getCell('A8')
    cellA8.value = `Địa chỉ: ${custInfo.diaChi || ''}`
    cellA8.font = { ...cellA8.font, italic: true }

    const cellA9 = ws.getCell('A9')
    cellA9.value = `Người nhận: ${c.ten_khach_hang || ''}`
    cellA9.font = { ...cellA9.font, italic: true }

    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    ws.getCell('G7').value = `Ngày : ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`

    if (diff !== 0) {
      ws.getImages().forEach((img: any) => {
        if (img.range?.tl && img.range.tl.row > headerRowIdx) {
          img.range.tl.row += diff
          img.range.br.row += diff
        }
      })
    }

    const outBuffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([outBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const dlBaseName = buildQuoteFileName({
      tenKhachHang: c.ten_khach_hang || custInfo.tenKH,
      tenCongTy: custInfo.tenCongTy,
      contentPO: c.content_of_contract_po,
      fallbackCode: c.so_hop_dong || c.ma_hop_dong,
      date: c.ngay_tao,
      prefix: useKhach ? 'BG_Khach' : undefined
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${dlBaseName}.xlsx`
    link.click()
    URL.revokeObjectURL(link.href)
    triggerToast(`Đã xuất file Excel (${useKhach ? 'Giá Khách' : 'Giá HĐ'})`, 'success')
  } catch (e: any) {
    console.error('Excel export error:', e)
    triggerToast('Lỗi xuất Excel: ' + String(e?.message || e), 'error')
  } finally {
    exportingExcel.value = false
  }
}

/* ======================
   FORMATTING & HIGHLIGHT HELPERS
====================== */
function formatVND(n: number): string {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(Number(n) || 0))
}

function formatCompactVND(n: number): string {
  const val = Math.abs(Number(n) || 0)
  const sign = n < 0 ? '-' : ''
  if (val >= 1_000_000_000) return `${sign}${(val / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')} tỷ`
  if (val >= 1_000_000) return `${sign}${(val / 1_000_000).toFixed(1).replace(/\.0$/, '')} tr`
  if (val >= 1_000) return `${sign}${Math.round(val / 1_000)}k`
  return `${sign}${Math.round(val)} đ`
}

function formatModalMoney(n: number): string {
  if (quoteCurrency.value === 'USD') {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(n) || 0)
  }
  return formatVND(n)
}

function formatModalMoneyWithUnit(n: number): string {
  return quoteCurrency.value === 'USD' ? `$${formatModalMoney(n)}` : `${formatVND(n)} đ`
}

function toRoman(n: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
  let num = n
  let res = ''
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) {
      res += syms[i]
      num -= vals[i]
    }
  }
  return res
}

function getInitials(name: string): string {
  const clean = String(name || '').trim()
  if (!clean) return 'KH'
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return clean.slice(0, 2).toUpperCase()
}

function escapeHtml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function highlightText(text: string, search: string): string {
  const safe = escapeHtml(text)
  const kw = String(search || '').trim()
  if (!safe || !kw) return safe
  const words = kw.split(/\s+/).filter(Boolean)
  if (!words.length) return safe

  const vnMap: Record<string, string> = {
    a: '[aáàảãạăắằẳẵặâấầẩẫậ]',
    e: '[eéèẻẽẹêếềểễệ]',
    i: '[iíìỉĩị]',
    o: '[oóòỏõọôốồổỗộơớờởỡợ]',
    u: '[uúùủũụưứừửữự]',
    y: '[yýỳỷỹỵ]',
    d: '[dđ]'
  }

  let out = safe
  for (const w of words) {
    const plain = stripVN(w)
    if (!plain) continue
    const pat = plain
      .split('')
      .map(ch => vnMap[ch] || ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('')
    try {
      const rx = new RegExp(`(${pat})`, 'gi')
      out = out.replace(rx, '<mark class="qlbg-hl">$1</mark>')
    } catch {}
  }
  return out
}

/* ======================
   ROUTE QUERY HANDLING (COMPATIBLE WITH CUSTOMERFIREBASE & DASHBOARDFIREBASE)
====================== */
function applyIncomingRouteQuery() {
  const q = route.query
  if (!q || Object.keys(q).length === 0) return

  let consumed = false
  if (q.dashboard) {
    const d = String(q.dashboard).toUpperCase()
    if (d === 'ALL' || d === 'PROCESSING' || d === 'COMPLETED') {
      dashboardFilter.value = d
      consumed = true
    }
  }
  if (q.customerid) {
    customerFilter.value = String(q.customerid).trim()
    consumed = true
  } else if (q.customer) {
    const custName = stripVN(String(q.customer).trim())
    const found = customersRaw.value.find(
      r => stripVN(String(r[5] || '')) === custName || stripVN(String(r[1] || '')) === custName
    )
    if (found && found[0]) {
      customerFilter.value = String(found[0]).trim()
    } else {
      searchKeyword.value = String(q.customer).trim()
    }
    consumed = true
  }
  if (q.sort) {
    const s = String(q.sort).toUpperCase()
    if (s === 'ASC' || s === 'DESC') sortMode.value = s
    consumed = true
  }
  if (q.search) {
    searchKeyword.value = String(q.search).trim()
    consumed = true
  }
  if (q.goc) {
    const gocCode = String(q.goc).trim()
    if (gocCode) {
      if (!q.search) searchKeyword.value = gocCode
      collapsedGroups[gocCode] = false
      consumed = true
    }
  }
  if (q.tab) consumed = true

  if (consumed) {
    router.replace({ path: '/quanlybaogiafirebase' }).catch(() => {})
  }
}

onMounted(() => {
  uiTheme.value = loadSavedTheme()
  setupRealtimeSubscriptions()
  applyIncomingRouteQuery()
})

onActivated(() => {
  uiTheme.value = loadSavedTheme()
  applyIncomingRouteQuery()
})

onUnmounted(() => {
  unsubscribers.forEach(fn => {
    try {
      fn()
    } catch {}
  })
  unsubscribers.length = 0
  if (cardObserver) cardObserver.disconnect()
  if (tableObserver) tableObserver.disconnect()
  if (custModalObserver) custModalObserver.disconnect()
  if (smartToastTimer) clearTimeout(smartToastTimer)
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
})
</script>


<style scoped>
/* ==========================================================================
   QUANLYBAOGIAFIREBASE — DUAL-THEME DESIGN SYSTEM (DARK NAVY & LIGHT BLUE)
   Follows BaoGia UI/UX Blueprint: 5-Role Palette, Tabular-Nums, PC + Mobile
========================================================================== */
.qlbg-page,
.qlbg-overlay,
.qlbg-smart-toast {
  --font-sans: 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  /* Dark Navy Default Tokens */
  --bg-canvas: radial-gradient(ellipse 80% 50% at 10% 0%, rgba(14, 165, 233, 0.11) 0%, transparent 52%),
    radial-gradient(ellipse 60% 40% at 90% 100%, rgba(16, 185, 129, 0.07) 0%, transparent 52%), #09090b;
  --bg-surface: #0f172a;
  --bg-surface-elevated: linear-gradient(180deg, #111c30 0%, #0b1322 100%);
  --bg-card: rgba(15, 23, 42, 0.78);
  --bg-card-hover: rgba(20, 31, 56, 0.94);
  --bg-well: rgba(2, 6, 23, 0.56);
  --bg-input: #0b1324;
  --bg-modal: #0b1322;
  --bg-modal-head: #0f172a;
  --bg-table-head: #0d1629;
  --bg-row-hover: rgba(56, 189, 248, 0.06);

  --border-subtle: rgba(148, 163, 184, 0.15);
  --border-control: rgba(148, 163, 184, 0.24);
  --border-strong: rgba(56, 189, 248, 0.34);

  --ink-primary: #f8fafc;
  --ink-strong: #ffffff;
  --ink-secondary: #cbd5e1;
  --ink-muted: #94a3b8;
  --ink-faint: #64748b;

  /* 5 Semantic Roles (Dark) */
  --sky-text: #38bdf8;
  --sky-bg: rgba(14, 165, 233, 0.15);
  --sky-border: rgba(56, 189, 248, 0.38);

  --emerald-text: #34d399;
  --emerald-bg: rgba(16, 185, 129, 0.14);
  --emerald-border: rgba(16, 185, 129, 0.36);

  --amber-text: #fbbf24;
  --amber-bg: rgba(245, 158, 11, 0.13);
  --amber-border: rgba(245, 158, 11, 0.35);

  --rose-text: #f87171;
  --rose-bg: rgba(239, 68, 68, 0.14);
  --rose-border: rgba(239, 68, 68, 0.35);

  --slate-text: #cbd5e1;
  --slate-bg: rgba(148, 163, 184, 0.12);
  --slate-border: rgba(148, 163, 184, 0.24);

  --shadow-card: 0 10px 28px -10px rgba(0, 0, 0, 0.55);
  --shadow-modal: 0 26px 60px -12px rgba(0, 0, 0, 0.78);
}

/* Enterprise Light Blue Theme (.theme-light-blue) */
.qlbg-page.theme-light-blue,
.qlbg-overlay.theme-light-blue,
.qlbg-smart-toast.theme-light-blue {
  --bg-canvas: linear-gradient(180deg, #eef4fb 0%, #e2ecf8 100%);
  --bg-surface: #ffffff;
  --bg-surface-elevated: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  --bg-card: #ffffff;
  --bg-card-hover: #f8fbff;
  --bg-well: #f1f5f9;
  --bg-input: #f8fafc;
  --bg-modal: #ffffff;
  --bg-modal-head: #f8fbff;
  --bg-table-head: #f1f5f9;
  --bg-row-hover: #eff6ff;

  --border-subtle: #dbeafe;
  --border-control: #cbd5e1;
  --border-strong: #60a5fa;

  --ink-primary: #0f172a;
  --ink-strong: #020617;
  --ink-secondary: #334155;
  --ink-muted: #475569;
  --ink-faint: #64748b;

  /* 5 Semantic Roles (Light Blue) */
  --sky-text: #0284c7;
  --sky-bg: #eff6ff;
  --sky-border: #93c5fd;

  --emerald-text: #059669;
  --emerald-bg: #ecfdf5;
  --emerald-border: #6ee7b7;

  --amber-text: #d97706;
  --amber-bg: #fffbeb;
  --amber-border: #fcd34d;

  --rose-text: #dc2626;
  --rose-bg: #fef2f2;
  --rose-border: #fecaca;

  --slate-text: #334155;
  --slate-bg: #f1f5f9;
  --slate-border: #cbd5e1;

  --shadow-card: 0 8px 24px -8px rgba(15, 23, 42, 0.08);
  --shadow-modal: 0 24px 52px -12px rgba(15, 23, 42, 0.22);
}

.qlbg-page {
  min-height: 100vh;
  background: var(--bg-canvas);
  color: var(--ink-primary);
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.48;
  padding: 14px 18px 40px;
  box-sizing: border-box;
}

.qlbg-page *,
.qlbg-overlay * {
  box-sizing: border-box;
}

/* Utilities */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
.nowrap {
  white-space: nowrap;
}
.text-right {
  text-align: right !important;
}
.text-center {
  text-align: center !important;
}
.font-bold {
  font-weight: 700;
}
.font-semibold {
  font-weight: 600;
}
.text-emerald {
  color: var(--emerald-text) !important;
}
.text-rose {
  color: var(--rose-text) !important;
}
.text-sky {
  color: var(--sky-text) !important;
}
.text-muted {
  color: var(--ink-muted) !important;
}
.text-strong {
  color: var(--ink-strong) !important;
}
.show-xs-flex {
  display: none;
}

:deep(mark.qlbg-hl) {
  background: rgba(250, 204, 21, 0.28);
  color: inherit;
  padding: 0 2px;
  border-radius: 3px;
  font-weight: 700;
}
.theme-light-blue :deep(mark.qlbg-hl) {
  background: #fef08a;
  color: #0f172a;
}

/* Custom Thin Scrollbars */
.qlbg-page ::-webkit-scrollbar,
.qlbg-overlay ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.qlbg-page ::-webkit-scrollbar-track,
.qlbg-overlay ::-webkit-scrollbar-track {
  background: transparent;
}
.qlbg-page ::-webkit-scrollbar-thumb,
.qlbg-overlay ::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.45);
  border-radius: 4px;
}
.qlbg-page ::-webkit-scrollbar-thumb:hover,
.qlbg-overlay ::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.72);
}

/* ==========================================================================
   1. TOPBAR
========================================================================== */
.bg-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 11px 16px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
  margin-bottom: 14px;
}

.bg-topbar-left {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.bg-brand-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sky-bg);
  color: var(--sky-text);
  border: 1px solid var(--sky-border);
  flex-shrink: 0;
}

.bg-title-wrap {
  min-width: 0;
}

.bg-title-row {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.bg-title {
  margin: 0;
  font-size: 16.5px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--ink-strong);
}

.bg-count-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  background: var(--sky-bg);
  color: var(--sky-text);
  border: 1px solid var(--sky-border);
  white-space: nowrap;
}

.bg-topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* Segmented Controls */
.qlbg-seg-group {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  background: var(--bg-input);
  border: 1px solid var(--border-control);
  border-radius: 9px;
}

.qlbg-seg-btn {
  width: auto;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--ink-muted);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.16s ease;
}

.qlbg-seg-btn:hover {
  color: var(--ink-primary);
}

.qlbg-seg-btn.active {
  background: var(--sky-bg);
  color: var(--sky-text);
  box-shadow: inset 0 0 0 1px var(--sky-border);
}

.qlbg-seg-btn.is-khach.active {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  box-shadow: inset 0 0 0 1px var(--emerald-border);
}

.qlbg-seg-btn.is-noibo.active {
  background: var(--amber-bg);
  color: var(--amber-text);
  box-shadow: inset 0 0 0 1px var(--amber-border);
}

/* Standard Buttons */
.qlbg-icon-btn {
  width: 34px;
  height: 34px;
  margin: 0;
  padding: 0;
  border-radius: 9px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
  color: var(--ink-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.16s ease;
}

.qlbg-icon-btn:hover:not(:disabled) {
  border-color: var(--sky-border);
  color: var(--sky-text);
  background: var(--sky-bg);
}

.qlbg-icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes qlbgSpin {
  to {
    transform: rotate(360deg);
  }
}
.is-spin {
  animation: qlbgSpin 0.85s linear infinite;
}

.qlbg-btn-primary,
.qlbg-btn-emerald,
.qlbg-btn-danger,
.qlbg-btn-danger-ghost,
.qlbg-ghost-btn,
.qlbg-excel-btn {
  width: auto;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 13px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.16s ease;
}

.qlbg-btn-primary {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  color: #ffffff;
  border: 1px solid rgba(56, 189, 248, 0.4);
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.26);
}
.qlbg-btn-primary:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.qlbg-btn-emerald {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border: 1px solid rgba(16, 185, 129, 0.45);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}
.qlbg-btn-emerald:hover:not(:disabled) {
  filter: brightness(1.07);
  transform: translateY(-1px);
}

.qlbg-btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  border: 1px solid rgba(239, 68, 68, 0.5);
}
.qlbg-btn-danger:hover:not(:disabled) {
  filter: brightness(1.07);
}

.qlbg-btn-danger-ghost {
  background: var(--rose-bg);
  color: var(--rose-text);
  border: 1px solid var(--rose-border);
}
.qlbg-btn-danger-ghost:hover:not(:disabled) {
  background: #ef4444;
  color: #ffffff;
}

.qlbg-ghost-btn {
  background: var(--bg-input);
  color: var(--ink-secondary);
  border: 1px solid var(--border-control);
}
.qlbg-ghost-btn:hover:not(:disabled) {
  border-color: var(--sky-border);
  color: var(--sky-text);
  background: var(--sky-bg);
}

.qlbg-excel-btn {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border: 1px solid var(--emerald-border);
}
.qlbg-excel-btn:hover:not(:disabled) {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
}

.qlbg-btn-primary:disabled,
.qlbg-btn-emerald:disabled,
.qlbg-ghost-btn:disabled,
.qlbg-excel-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

/* ==========================================================================
   2. BENTO KPI GRID
========================================================================== */
.qlbg-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.qlbg-kpi-card {
  width: 100%;
  margin: 0;
  text-align: left;
  padding: 13px 15px;
  border-radius: 13px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
  color: var(--ink-primary);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  transition: all 0.18s ease;
}

.qlbg-kpi-card.is-summary {
  cursor: default;
}

.qlbg-kpi-card:not(.is-summary):hover {
  background: var(--bg-card-hover);
  transform: translateY(-1px);
}

.qlbg-kpi-card.is-sky.active {
  border-color: var(--sky-border);
  box-shadow: inset 3px 0 0 #0ea5e9, var(--shadow-card);
}
.qlbg-kpi-card.is-amber.active {
  border-color: var(--amber-border);
  box-shadow: inset 3px 0 0 #f59e0b, var(--shadow-card);
}
.qlbg-kpi-card.is-emerald.active {
  border-color: var(--emerald-border);
  box-shadow: inset 3px 0 0 #10b981, var(--shadow-card);
}

.kpi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.kpi-label {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--ink-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kpi-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-icon.is-sky {
  background: var(--sky-bg);
  color: var(--sky-text);
}
.kpi-icon.is-amber {
  background: var(--amber-bg);
  color: var(--amber-text);
}
.kpi-icon.is-emerald {
  background: var(--emerald-bg);
  color: var(--emerald-text);
}

.kpi-com-pill {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border: 1px solid var(--emerald-border);
  white-space: nowrap;
  flex-shrink: 0;
}

.kpi-val {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.18;
  color: var(--ink-strong);
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kpi-val.is-money {
  font-size: 19px;
  color: var(--emerald-text);
}
.kpi-val.is-money small {
  font-size: 12.5px;
  margin-left: 3px;
  font-weight: 700;
  opacity: 0.85;
}

.kpi-sub {
  font-size: 11.5px;
  color: var(--ink-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ==========================================================================
   3. UNIFIED SMART FILTER BAR
========================================================================== */
.qlbg-filter-bar {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 13px;
  padding: 11px 14px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qlbg-filter-row-main {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.qlbg-search-box {
  flex: 1 1 280px;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 10px;
  background: var(--bg-input);
  border: 1px solid var(--border-control);
  border-radius: 9px;
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.qlbg-search-box:focus-within {
  border-color: var(--border-strong);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.14);
}

.qlbg-search-ico {
  color: var(--ink-faint);
  flex-shrink: 0;
}

.qlbg-search-input {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--ink-primary);
  font-size: 13px;
  font-family: inherit;
}
.qlbg-search-input::placeholder {
  color: var(--ink-faint);
}

.qlbg-search-clear,
.pm-search-clear {
  width: auto !important;
  flex: 0 0 auto !important;
  margin: 0 !important;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-control);
  background: var(--slate-bg);
  color: var(--ink-secondary);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}
.qlbg-search-clear:hover,
.pm-search-clear:hover {
  color: var(--rose-text);
  border-color: var(--rose-border);
  background: var(--rose-bg);
}

.qlbg-picker-btn {
  width: auto;
  margin: 0;
  height: 36px;
  max-width: 260px;
  padding: 0 11px;
  border-radius: 9px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
  color: var(--ink-primary);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  min-width: 0;
  transition: all 0.16s ease;
}
.qlbg-picker-btn:hover {
  border-color: var(--sky-border);
}
.qlbg-picker-btn.is-active {
  background: var(--sky-bg);
  border-color: var(--sky-border);
  color: var(--sky-text);
}

.picker-btn-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.picker-clear-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  background: rgba(239, 68, 68, 0.18);
  color: var(--rose-text);
  flex-shrink: 0;
}

.qlbg-select-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 36px;
  background: var(--bg-input);
  border: 1px solid var(--border-control);
  border-radius: 9px;
  padding: 0 8px 0 10px;
  gap: 6px;
}

.qlbg-select-ico {
  color: var(--ink-muted);
  flex-shrink: 0;
}

.qlbg-select {
  border: none;
  outline: none;
  background: transparent;
  color: var(--ink-primary);
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  padding-right: 4px;
}
.qlbg-select option {
  background: var(--bg-modal);
  color: var(--ink-primary);
}

.qlbg-reset-btn {
  width: auto;
  margin: 0;
  height: 36px;
  padding: 0 11px;
  border-radius: 9px;
  border: 1px solid var(--rose-border);
  background: var(--rose-bg);
  color: var(--rose-text);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.qlbg-reset-btn:hover {
  background: #ef4444;
  color: #ffffff;
}

.qlbg-filter-row-sub {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px dashed var(--border-subtle);
}

.qlbg-date-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.date-chip-label {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--ink-muted);
  margin-right: 2px;
}

.qlbg-date-chip {
  width: auto;
  margin: 0;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
  color: var(--ink-secondary);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.qlbg-date-chip:hover {
  border-color: var(--sky-border);
  color: var(--sky-text);
}
.qlbg-date-chip.active {
  background: var(--sky-bg);
  color: var(--sky-text);
  border-color: var(--sky-border);
  font-weight: 700;
}

.qlbg-custom-dates {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.custom-date-field {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 8px;
  background: var(--bg-input);
  border: 1px solid var(--border-control);
  font-size: 11.5px;
  color: var(--ink-muted);
}
.custom-date-field input {
  border: none;
  outline: none;
  background: transparent;
  color: var(--ink-primary);
  font-family: inherit;
  font-size: 12px;
}
.custom-date-sep {
  color: var(--ink-faint);
}

/* ==========================================================================
   4. SKELETON & EMPTY STATE
========================================================================== */
@keyframes qlbgShimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.qlbg-skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.qlbg-skeleton-bar,
.qlbg-skeleton-card .sk-top,
.qlbg-skeleton-card .sk-line,
.qlbg-skeleton-card .sk-box,
.qlbg-skeleton-card .sk-foot {
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.08) 25%,
    rgba(148, 163, 184, 0.18) 50%,
    rgba(148, 163, 184, 0.08) 75%
  );
  background-size: 200% 100%;
  animation: qlbgShimmer 1.4s ease-in-out infinite;
  border-radius: 8px;
}

.qlbg-skeleton-bar {
  height: 48px;
  border-radius: 12px;
}

.qlbg-skeleton-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sk-top {
  height: 22px;
  width: 55%;
}
.sk-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sk-line.w75 {
  height: 14px;
  width: 75%;
}
.sk-line.w55 {
  height: 14px;
  width: 55%;
}
.sk-box {
  height: 68px;
  margin-top: 4px;
}
.sk-foot {
  height: 32px;
}

.qlbg-empty-state {
  background: var(--bg-card);
  border: 1px dashed var(--border-control);
  border-radius: 16px;
  padding: 48px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.empty-ico {
  width: 62px;
  height: 62px;
  border-radius: 16px;
  background: var(--sky-bg);
  color: var(--sky-text);
  border: 1px solid var(--sky-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.qlbg-empty-state h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--ink-strong);
}
.qlbg-empty-state p {
  margin: 0;
  font-size: 13px;
  color: var(--ink-muted);
  max-width: 440px;
}
.empty-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
}

/* ==========================================================================
   5. GROUP FOLDERS & QUOTE CARDS (CARD VIEW)
========================================================================== */
.qlbg-content-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.qlbg-groups-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.qlbg-group-block {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-left: 3px solid #f59e0b;
  border-radius: 14px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.qlbg-group-block.is-group-official {
  border-left-color: #10b981;
}

.qlbg-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-surface-elevated);
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease;
}
.qlbg-group-header:hover {
  background: var(--bg-card-hover);
}

.gh-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1 1 auto;
}

.gh-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
.gh-chevron.is-collapsed {
  transform: rotate(-90deg);
}

.gh-folder-ico {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.gh-folder-ico.is-emerald {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border: 1px solid var(--emerald-border);
}
.gh-folder-ico.is-amber {
  background: var(--amber-bg);
  color: var(--amber-text);
  border: 1px solid var(--amber-border);
}

.gh-titles {
  min-width: 0;
  flex: 1 1 auto;
}

.gh-title-main {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.gh-company {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink-strong);
}

.gh-contact-sub {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-secondary);
}

.gh-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.gh-po-content {
  font-size: 12px;
  color: var(--sky-text);
  font-weight: 600;
  max-width: 520px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gh-root-code {
  font-size: 11px;
  color: var(--ink-muted);
  font-family: var(--font-mono);
}

.gh-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  flex-shrink: 0;
}

.gh-status-pill {
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.gh-status-pill.is-emerald {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border: 1px solid var(--emerald-border);
}
.gh-status-pill.is-amber {
  background: var(--amber-bg);
  color: var(--amber-text);
  border: 1px solid var(--amber-border);
}

.gh-ver-count {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: var(--slate-bg);
  color: var(--slate-text);
  border: 1px solid var(--slate-border);
  white-space: nowrap;
}

.gh-latest-amount {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--emerald-text);
  white-space: nowrap;
}

/* Cards Grid */
.qlbg-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 13px;
}

.qlbg-cards-grid.is-inside-group {
  padding: 14px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-well);
}

.qlbg-quote-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 13px;
  padding: 13px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.qlbg-quote-card:hover {
  transform: translateY(-2px);
  background: var(--bg-card-hover);
  border-color: var(--border-strong);
}

.qlbg-quote-card.is-official {
  border-top: 2.5px solid #10b981;
}

.qlbg-quote-card.is-draft {
  border-top: 2.5px solid rgba(245, 158, 11, 0.7);
}

.qc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.qc-top-left {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  flex: 1 1 auto;
}

.qc-badges {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  min-width: 0;
}

.qc-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2.5px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.qc-status-badge .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.qc-status-badge.is-emerald {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border: 1px solid var(--emerald-border);
}
.qc-status-badge.is-amber {
  background: var(--amber-bg);
  color: var(--amber-text);
  border: 1px solid var(--amber-border);
}

.qc-po-badge {
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: var(--sky-bg);
  color: var(--sky-text);
  border: 1px solid var(--sky-border);
  white-space: nowrap;
}

.qc-latest-tag {
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  background: var(--slate-bg);
  color: var(--ink-secondary);
  border: 1px solid var(--slate-border);
  white-space: nowrap;
}

.qc-ver-tag {
  padding: 2px 6.5px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 800;
  font-family: var(--font-mono);
  background: var(--slate-bg);
  color: var(--ink-strong);
  border: 1px solid var(--slate-border);
  white-space: nowrap;
}

.qc-sr-active-pill {
  width: auto;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  background: var(--sky-bg);
  color: var(--sky-text);
  border: 1px solid var(--sky-border);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.qc-sr-active-pill.is-compact {
  padding: 1.5px 6.5px;
  font-size: 10px;
}
.qc-sr-active-pill:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

.qc-pin-sr-btn {
  width: auto;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  background: var(--bg-input);
  color: var(--ink-secondary);
  border: 1px dashed var(--border-control);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.qc-pin-sr-btn:hover:not(:disabled) {
  background: var(--sky-bg);
  color: var(--sky-text);
  border-style: solid;
  border-color: var(--sky-border);
}
.qc-pin-sr-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

.qc-top-right {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.qc-date {
  font-size: 11px;
  color: var(--ink-muted);
  white-space: nowrap;
}

.qc-del-btn {
  width: 24px;
  height: 24px;
  margin: 0;
  padding: 0;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink-faint);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}
.qc-del-btn:hover {
  background: var(--rose-bg);
  color: var(--rose-text);
  border-color: var(--rose-border);
}

.qc-code-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.qc-code {
  font-size: 12.5px;
  font-weight: 400;
  color: var(--ink-secondary);
  font-family: var(--font-mono);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qc-sub-id {
  font-size: 11px;
  color: var(--ink-faint);
  font-family: var(--font-mono);
  white-space: nowrap;
}

/* Customer Lines inside Card (icon + nhãn + tên, không khung badge) */
.qc-cust-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  cursor: pointer;
}

.qc-cust-line {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 12px;
  line-height: 1.35;
}

.qc-cust-ico {
  flex-shrink: 0;
  color: var(--ink-faint);
}

.qc-cust-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qc-cust-line.is-company {
  align-items: flex-start;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-strong);
  line-height: 1.38;
}
.qc-cust-line.is-company .qc-cust-ico {
  color: var(--sky-text);
  margin-top: 2px;
}
.qc-cust-line.is-company .qc-cust-text {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  word-break: break-word;
}
.qc-cust-list:hover .qc-cust-line.is-company .qc-cust-text {
  color: var(--sky-text);
}

.qc-cust-line.is-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-secondary);
}

.qc-cust-line.is-mst {
  font-size: 11.5px;
  color: var(--ink-muted);
}

/* PO Content / Note (chữ đậm cỡ lớn, không đóng khung badge) */
.qc-content-note {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 2px 0;
}

.qc-po-line {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 800;
  line-height: 1.38;
  color: var(--ink-strong);
  min-width: 0;
}
.qc-po-line svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--sky-text);
}
.qc-po-line span {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.qc-note-line {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--rose-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

/* Finance Box inside Card */
.qc-fin-box {
  margin-top: auto;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.qc-fin-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: var(--ink-muted);
}
.qc-fin-row.is-actual {
  color: var(--rose-text);
  font-weight: 600;
}
.qc-fin-val-strong {
  color: var(--ink-primary);
  font-weight: 600;
}
.qc-fin-diff {
  font-weight: 600;
  color: var(--ink-secondary);
}
.qc-fin-diff.is-pos {
  color: var(--emerald-text);
}
.qc-fin-diff.is-neg {
  color: var(--rose-text);
}

.qc-fin-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding-top: 6px;
  margin-top: 2px;
  border-top: 1px dashed var(--border-subtle);
  font-size: 12.5px;
  color: var(--ink-secondary);
}
.qc-fin-total strong {
  font-size: 15px;
  font-weight: 800;
  color: var(--emerald-text);
}

.qc-fin-discount {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 6px;
  margin-bottom: 2px;
  border-bottom: 1px dashed var(--border-control);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--amber-text);
}
.qc-fin-discount strong {
  font-size: 14px;
  font-weight: 800;
  color: var(--amber-text);
}

.qc-meta-pills {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 5px;
}

.qc-mini-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
}
.qc-mini-pill.is-sky {
  background: var(--sky-bg);
  color: var(--sky-text);
  border: 1px solid var(--sky-border);
}
.qc-mini-pill.is-emerald {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border: 1px solid var(--emerald-border);
}
.qc-mini-pill.is-amber {
  background: var(--amber-bg);
  color: var(--amber-text);
  border: 1px solid var(--amber-border);
}
.qc-mini-pill.is-rose {
  background: var(--rose-bg);
  color: var(--rose-text);
  border: 1px solid var(--rose-border);
}
.qc-mini-pill.is-slate {
  background: var(--slate-bg);
  color: var(--slate-text);
  border: 1px solid var(--slate-border);
}

/* Card Footer Actions */
.qc-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  padding-top: 4px;
}

.qc-btn {
  width: 100%;
  margin: 0;
  padding: 6px 6px;
  border-radius: 8px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
  color: var(--ink-secondary);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.15s ease;
}
.qc-btn:hover:not(:disabled) {
  border-color: var(--sky-border);
  color: var(--sky-text);
  background: var(--sky-bg);
}
.qc-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.qc-btn.is-chot-deal {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border-color: var(--emerald-border);
}
.qc-btn.is-chot-deal:hover:not(:disabled) {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
}

.qc-btn.is-sr-link {
  background: var(--sky-bg);
  color: var(--sky-text);
  border-color: var(--sky-border);
}
.qc-btn.is-sr-link:hover {
  background: #0284c7;
  color: #ffffff;
}

/* Standalone Divider & Sentinel */
.qlbg-standalone-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qlbg-section-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--ink-muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.qlbg-section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-subtle);
}

.qlbg-lazy-sentinel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px;
  color: var(--ink-muted);
  font-size: 12px;
}

/* ==========================================================================
   6. COMPACT HIGH-DENSITY TABLE VIEW
========================================================================== */
.qlbg-table-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.qlbg-table-scroll {
  overflow-x: auto;
}

.qlbg-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}

.qlbg-data-table thead th {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--bg-table-head);
  color: var(--ink-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  text-align: left;
  padding: 11px 12px;
  border-bottom: 1px solid var(--border-subtle);
  white-space: nowrap;
}

.qlbg-table-row {
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background 0.14s ease;
}
.qlbg-table-row:hover {
  background: var(--bg-row-hover);
}

.qlbg-data-table td {
  padding: 10px 12px;
  vertical-align: middle;
  color: var(--ink-primary);
}

.tbl-status-cell {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.tbl-code-main {
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--ink-strong);
}
.tbl-code-sub {
  font-size: 11px;
  color: var(--ink-faint);
  font-family: var(--font-mono);
}

.tbl-cust-name {
  font-weight: 700;
  color: var(--ink-strong);
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tbl-cust-sub {
  font-size: 11.5px;
  color: var(--ink-muted);
}

.tbl-po-content {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ink-secondary);
}

.tbl-amount-strong {
  font-weight: 800;
  color: var(--emerald-text) !important;
}

.tbl-com-val {
  color: var(--sky-text);
  font-weight: 700;
}
.tbl-muted {
  color: var(--ink-faint);
}

.tbl-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tbl-act-btn {
  width: auto;
  margin: 0;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
  color: var(--ink-secondary);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.tbl-act-btn:hover:not(:disabled) {
  border-color: var(--sky-border);
  color: var(--sky-text);
  background: var(--sky-bg);
}
.tbl-act-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.tbl-act-btn.is-chot {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border-color: var(--emerald-border);
}
.tbl-act-btn.is-sr {
  background: var(--sky-bg);
  color: var(--sky-text);
  border-color: var(--sky-border);
}
.tbl-act-btn.is-del:hover {
  background: var(--rose-bg);
  color: var(--rose-text);
  border-color: var(--rose-border);
}

/* ==========================================================================
   7. TELEPORTED MODALS — OVERLAY & DETAIL MODAL
========================================================================== */
.qlbg-overlay {
  position: fixed;
  inset: 0;
  z-index: 10015;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  font-family: var(--font-sans);
  color: var(--ink-primary);
}

.mob-sheet-grabber {
  display: none;
}

.qlbg-detail-overlay {
  padding: 0 !important;
}

.qlbg-detail-modal {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  background: var(--bg-modal);
  border: none;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dm-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 13px 18px;
  background: var(--bg-modal-head);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.dm-head-left {
  min-width: 0;
  flex: 1 1 280px;
}

.dm-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dm-code {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--ink-strong);
}

.dm-sub-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 3px;
  font-size: 12px;
  color: var(--ink-muted);
}

.dm-head-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dm-close-btn {
  width: 32px;
  height: 32px;
  margin: 0;
  padding: 0;
  border-radius: 8px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
  color: var(--ink-secondary);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dm-close-btn:hover {
  background: var(--rose-bg);
  color: var(--rose-text);
  border-color: var(--rose-border);
}

.dm-mobile-tabs {
  display: none;
}

.dm-body {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 365px;
  overflow: hidden;
  transition: grid-template-columns 0.2s ease;
}

.dm-body.is-side-collapsed {
  grid-template-columns: minmax(0, 1fr) 40px;
}

.dm-main-col {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 16px;
}

.dm-loading-state,
.dm-empty-items {
  padding: 48px 16px;
  text-align: center;
  color: var(--ink-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.dm-spinner {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2.5px solid var(--border-control);
  border-top-color: var(--sky-text);
  animation: qlbgSpin 0.8s linear infinite;
}
.dm-spinner.is-lg {
  width: 34px;
  height: 34px;
  border-width: 3px;
}

.dm-table-wrap {
  border: 1px solid var(--border-subtle);
  border-radius: 11px;
  overflow-x: auto;
}

.dm-items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}

.dm-items-table thead th {
  position: sticky;
  top: 0;
  z-index: 4;
  background: var(--bg-table-head);
  color: var(--ink-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  text-align: left;
  padding: 10px 10px;
  border-bottom: 1px solid var(--border-subtle);
  white-space: nowrap;
}

.dm-items-table td {
  padding: 10px 10px;
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: top;
  color: var(--ink-primary);
}

.dm-group-row td {
  background: var(--sky-bg);
  color: var(--sky-text);
  font-weight: 800;
  padding: 8px 10px;
}

.dm-item-row:hover td {
  background: var(--bg-row-hover);
}

.col-stt {
  width: 44px;
  text-align: center !important;
}
.col-sku {
  width: 130px;
}
.col-dvt {
  width: 66px;
}
.col-sl {
  width: 58px;
}

.sku-primary {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 12px;
  color: var(--sky-text);
  word-break: break-word;
}
.sku-vendor {
  font-size: 11px;
  color: var(--ink-muted);
  margin-top: 2px;
}

.item-title-main {
  font-weight: 700;
  color: var(--ink-strong);
  line-height: 1.4;
}
.item-origin-name {
  font-size: 11px;
  color: var(--amber-text);
  margin-top: 2px;
}
.item-desc-text {
  font-size: 11.5px;
  color: var(--ink-muted);
  margin-top: 4px;
  white-space: pre-line;
  line-height: 1.45;
}
.item-specs-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}
.spec-pill {
  padding: 1.5px 6px;
  border-radius: 5px;
  font-size: 10.5px;
  font-weight: 600;
  background: var(--slate-bg);
  color: var(--ink-secondary);
  border: 1px solid var(--slate-border);
}

/* Right Summary Column in Detail Modal (100% baogiaFirebase right panel) */
.dm-side-col {
  border-left: 1px solid var(--border-subtle);
  background: var(--bg-well);
  padding: 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dm-side-col.is-collapsed {
  width: 40px;
}

.cmp-sr-collapsed-rail {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12px;
  background: var(--bg-card);
}

.cmp-sr-expand-btn {
  width: 30px;
  margin: 0;
  padding: 12px 4px;
  border-radius: 8px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
  color: var(--sky-text);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.cmp-sr-expand-btn:hover {
  border-color: var(--sky-border);
  background: var(--sky-bg);
}

.cmp-sr-rail-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.cmp-sr-po1-blocks {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cmp-sr-source-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 8px 10px;
  background: var(--bg-modal-head);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.cmp-sr-source-pills {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: 8px;
  background: var(--bg-input);
  border: 1px solid var(--border-control);
}

.cmp-sr-source-pill {
  width: auto;
  margin: 0;
  padding: 4px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--ink-muted);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.cmp-sr-source-pill.active {
  background: var(--sky-bg);
  color: var(--sky-text);
  box-shadow: 0 1px 2px rgba(2, 6, 23, 0.2);
}

.cmp-sr-source-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.cmp-sr-sync-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--amber-text);
  background: var(--amber-bg);
  border: 1px solid var(--amber-border);
  padding: 2px 6px;
  border-radius: 999px;
}

.cmp-sr-reset-btn {
  width: auto;
  margin: 0;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--amber-border);
  background: var(--amber-bg);
  color: var(--amber-text);
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
}
.cmp-sr-reset-btn:hover {
  filter: brightness(1.08);
}

.cmp-sr-collapse-btn {
  width: 26px;
  height: 26px;
  margin: 0;
  padding: 0;
  border-radius: 6px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
  color: var(--ink-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.cmp-sr-collapse-btn:hover {
  color: var(--sky-text);
  border-color: var(--sky-border);
}

.cmp-sr-blocks-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cmp-sr-po1-block {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cmp-sr-po1-block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.cmp-sr-po1-block-title {
  font-size: 10.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--sky-text);
}

.cmp-sr-round-toggle-btn {
  width: auto;
  margin: 0;
  padding: 2px 7px;
  border-radius: 6px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
  color: var(--ink-muted);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}
.cmp-sr-round-toggle-btn.is-active {
  background: var(--sky-bg);
  color: var(--sky-text);
  border-color: var(--sky-border);
}

.cmp-sr-po1-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cmp-sr-po1-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 26px;
}

.cmp-sr-po1-lbl-group,
.cmp-sr-po1-lbl-main-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cmp-sr-po1-lbl-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cmp-sr-po1-lbl {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ink-secondary);
}

.cmp-sr-po1-val {
  font-size: 12.5px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--ink-strong);
}
.cmp-sr-po1-val.is-accent {
  color: var(--sky-text);
}
.cmp-sr-po1-val.is-warn {
  color: var(--rose-text);
}
.cmp-sr-po1-val.is-profit {
  color: var(--emerald-text);
}
.cmp-sr-po1-val.is-ratio {
  font-size: 12px;
}

.cmp-sr-po1-input {
  width: 126px !important;
  height: 26px !important;
  margin: 0 !important;
  padding: 2px 7px !important;
  border-radius: 6px !important;
  border: 1px solid var(--border-control) !important;
  background: var(--bg-input) !important;
  color: var(--ink-strong) !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  text-align: right !important;
  font-variant-numeric: tabular-nums;
}
.cmp-sr-po1-input:focus {
  border-color: var(--sky-border) !important;
  outline: none;
}

.cmp-sr-pct-wrap {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 5px;
  border-radius: 5px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
}
.cmp-sr-pct-wrap.is-predict {
  height: 25px;
}

.cmp-sr-pct-input {
  width: 44px !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  color: var(--amber-text) !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  text-align: right !important;
  font-variant-numeric: tabular-nums;
}
.cmp-sr-pct-input:focus {
  outline: none;
}

.cmp-sr-pct-unit {
  font-size: 10px;
  font-weight: 700;
  color: var(--ink-muted);
  margin-left: 2px;
}

.cmp-sr-com-val-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.cmp-sr-com-plus-btn {
  width: 24px;
  height: 24px;
  margin: 0;
  padding: 0;
  border-radius: 6px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
  color: var(--sky-text);
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.cmp-sr-com-plus-btn.active,
.cmp-sr-com-plus-btn:hover {
  background: var(--sky-bg);
  border-color: var(--sky-border);
}

.cmp-sr-com-delta-hint {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
}
.cmp-sr-com-delta-val.is-plus {
  color: var(--emerald-text);
  font-weight: 700;
}
.cmp-sr-com-delta-val.is-minus {
  color: var(--rose-text);
  font-weight: 700;
}
.cmp-sr-com-undo-btn {
  width: auto;
  margin: 0;
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
  color: var(--ink-muted);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.cmp-sr-com-adjust-popover {
  padding: 8px;
  border-radius: 8px;
  background: var(--bg-well);
  border: 1px solid var(--sky-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cmp-sr-com-adjust-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--ink-secondary);
}
.cmp-sr-com-adjust-close {
  width: 20px;
  height: 20px;
  margin: 0;
  padding: 0;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--ink-muted);
  cursor: pointer;
}
.cmp-sr-com-adjust-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}
.cmp-sr-com-adjust-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 26px !important;
  margin: 0 !important;
  padding: 2px 7px !important;
  border-radius: 6px !important;
  border: 1px solid var(--border-control) !important;
  background: var(--bg-input) !important;
  color: var(--ink-strong) !important;
  font-size: 12px !important;
}
.cmp-sr-com-act-btn {
  width: auto;
  margin: 0;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}
.cmp-sr-com-act-btn.is-plus {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border-color: var(--emerald-border);
}
.cmp-sr-com-act-btn.is-minus {
  background: var(--rose-bg);
  color: var(--rose-text);
  border-color: var(--rose-border);
}

.cmp-sr-predict-box {
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px dashed var(--border-subtle);
}
.cmp-sr-predict-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.cmp-sr-predict-title {
  font-size: 10px;
  font-weight: 800;
  color: var(--amber-text);
  letter-spacing: 0.02em;
}
.cmp-sr-predict-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.cmp-sr-predict-reset {
  width: auto;
  margin: 0;
  padding: 2px 6px;
  border-radius: 5px;
  border: 1px solid var(--amber-border);
  background: var(--amber-bg);
  color: var(--amber-text);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

/* Bottom Dock: Khách / Hồ sơ / Chiết khấu / Tài chính */
.pc-right-finance-dock {
  flex-shrink: 0;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
}

.sidebar-dock-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 3px;
  padding: 5px 6px;
  background: var(--bg-modal-head);
  border-bottom: 1px solid var(--border-subtle);
}

.dock-tab-btn {
  width: 100%;
  margin: 0;
  padding: 5px 4px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink-muted);
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.dock-tab-btn:hover {
  color: var(--ink-primary);
  background: var(--bg-row-hover);
}
.dock-tab-btn.active {
  background: var(--sky-bg);
  color: var(--sky-text);
  border-color: var(--sky-border);
}

.dock-tab-panel {
  padding: 8px 10px;
  max-height: 225px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.customer-dock-micro-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.customer-dock-title {
  font-size: 10.5px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--ink-muted);
}
.btn-customer-detail-pill {
  width: auto;
  margin: 0;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--sky-border);
  background: var(--sky-bg);
  color: var(--sky-text);
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
}

.customer-dock-grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.cd-row {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  align-items: center;
  gap: 6px;
}
.cd-lbl {
  font-size: 11px;
  font-weight: 700;
  color: var(--ink-muted);
}
.cd-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
}
.cd-input {
  width: 100% !important;
  height: 26px !important;
  margin: 0 !important;
  padding: 2px 8px !important;
  border-radius: 6px !important;
  border: 1px solid var(--border-control) !important;
  background: var(--bg-input) !important;
  color: var(--ink-strong) !important;
  font-size: 11.5px !important;
  font-weight: 600 !important;
}
.cd-input:focus {
  border-color: var(--sky-border) !important;
  outline: none;
}
.cd-btn-pick {
  width: auto;
  height: 26px;
  margin: 0;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid var(--sky-border);
  background: var(--sky-bg);
  color: var(--sky-text);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
}

.dock-sr-payment-box {
  padding: 7px 9px;
  border-radius: 8px;
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dock-sr-payment-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10.5px;
  font-weight: 800;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.dock-sr-payment-rows {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.dock-sr-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--ink-secondary);
}

.fin-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 24px;
  font-size: 11.5px;
}
.fin-row.is-total,
.fin-row.is-grand-total {
  padding-top: 5px;
  margin-top: 2px;
  border-top: 1px dashed var(--border-control);
}
.fin-lbl-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.fin-lbl {
  color: var(--ink-secondary);
  font-weight: 600;
}
.fin-pct-inline {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 5px;
  border-radius: 5px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
}
.fin-pct-input {
  width: 42px !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  color: var(--amber-text) !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  text-align: right !important;
}
.fin-pct-unit {
  font-size: 10px;
  font-weight: 700;
  color: var(--ink-muted);
  margin-left: 2px;
}
.fin-val {
  font-weight: 800;
  color: var(--ink-strong);
}
.fin-val.is-discount {
  color: var(--amber-text);
}
.fin-val.is-warn {
  color: var(--rose-text);
}
.fin-val.is-accent {
  color: var(--sky-text);
}
.fin-val.is-emerald {
  color: var(--emerald-text);
}
.fin-val.is-grand {
  font-size: 13.5px;
  color: var(--emerald-text);
}

.dm-panel-box {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 11px;
  padding: 11px 13px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dm-panel-box.is-clickable {
  cursor: pointer;
  transition: border-color 0.15s ease;
}
.dm-panel-box.is-clickable:hover {
  border-color: var(--sky-border);
}

.dm-box-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.dm-box-title {
  font-size: 11.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--ink-muted);
}
.dm-link-hint {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--sky-text);
}
.dm-currency-tag {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  background: var(--sky-bg);
  color: var(--sky-text);
  border: 1px solid var(--sky-border);
}
.dm-inline-link {
  width: auto;
  margin: 0;
  padding: 2px 7px;
  border-radius: 6px;
  border: 1px solid var(--sky-border);
  background: var(--sky-bg);
  color: var(--sky-text);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.dm-cust-company {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink-strong);
}
.dm-cust-line {
  font-size: 12px;
  color: var(--ink-secondary);
  margin-top: 2px;
}

.dm-fin-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dm-fin-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  font-size: 12.5px;
  color: var(--ink-secondary);
}
.dm-fin-item strong {
  color: var(--ink-strong);
}
.dm-fin-item.is-grand {
  padding-top: 7px;
  margin-top: 2px;
  border-top: 1px dashed var(--border-control);
  font-weight: 700;
}
.dm-fin-item.is-grand strong {
  font-size: 15.5px;
  font-weight: 800;
  color: var(--emerald-text);
}
.dm-fin-item.is-sub {
  font-size: 11.5px;
  color: var(--ink-muted);
}
.dm-fin-item.is-com-net {
  padding-top: 6px;
  border-top: 1px dashed var(--border-subtle);
  font-weight: 700;
}
.dm-fin-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 2px 0;
}

/* Dual File Slots */
.dm-file-slot {
  padding: 9px 10px;
  border-radius: 9px;
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.slot-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.slot-label {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--ink-secondary);
}
.slot-upload-btn {
  width: auto;
  margin: 0;
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid var(--sky-border);
  background: var(--sky-bg);
  color: var(--sky-text);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.slot-upload-btn:hover:not(:disabled) {
  background: #0284c7;
  color: #ffffff;
}
.slot-empty {
  font-size: 11.5px;
  color: var(--ink-faint);
  font-style: italic;
}
.slot-file-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.slot-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 7px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
}
.slot-file-link {
  font-size: 12px;
  font-weight: 600;
  color: var(--sky-text);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.slot-file-link:hover {
  text-decoration: underline;
}
.slot-file-del {
  width: 22px;
  height: 22px;
  margin: 0;
  padding: 0;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: var(--ink-faint);
  font-size: 11px;
  cursor: pointer;
  flex-shrink: 0;
}
.slot-file-del:hover {
  background: var(--rose-bg);
  color: var(--rose-text);
}

.dm-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 12px 18px;
  background: var(--bg-modal-head);
  border-top: 1px solid var(--border-subtle);
  flex-shrink: 0;
}
.dm-foot-left,
.dm-foot-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* ==========================================================================
   8. CUSTOMER PICKER MODAL, PROFILE MODAL, CONFIRM & SMART TOAST
========================================================================== */
.qlbg-picker-modal,
.qlbg-cust-modal {
  width: min(560px, 100%);
  max-height: 84vh;
  background: var(--bg-modal);
  border: 1px solid var(--border-control);
  border-radius: 16px;
  box-shadow: var(--shadow-modal);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pm-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 16px;
  background: var(--bg-modal-head);
  border-bottom: 1px solid var(--border-subtle);
}
.pm-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.pm-title-wrap h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: var(--ink-strong);
}
.pm-count {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: var(--sky-bg);
  color: var(--sky-text);
  border: 1px solid var(--sky-border);
}

.pm-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 16px 8px;
  padding: 0 11px;
  height: 38px;
  border-radius: 10px;
  background: var(--bg-input);
  border: 1px solid var(--border-control);
  flex-shrink: 0;
}
.pm-search-bar:focus-within {
  border-color: var(--border-strong);
}
.pm-search-ico {
  color: var(--ink-faint);
  flex-shrink: 0;
}
.pm-search-input {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--ink-primary);
  font-size: 13px;
  font-family: inherit;
}

.pm-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 6px 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pm-item {
  width: 100%;
  margin: 0;
  text-align: left;
  padding: 9px 11px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink-primary);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.14s ease;
}
.pm-item:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-subtle);
}
.pm-item.active {
  background: var(--sky-bg);
  border-color: var(--sky-border);
}

.pm-avatar {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--slate-bg);
  color: var(--ink-secondary);
  border: 1px solid var(--slate-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}
.pm-avatar.is-all {
  background: var(--sky-bg);
  color: var(--sky-text);
  border-color: var(--sky-border);
}

.pm-info {
  flex: 1 1 auto;
  min-width: 0;
}
.pm-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-strong);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pm-sub {
  font-size: 11.5px;
  color: var(--ink-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pm-mst {
  font-size: 11px;
  color: var(--ink-muted);
}

.pm-quote-count {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: var(--slate-bg);
  color: var(--ink-secondary);
  flex-shrink: 0;
}
.pm-check {
  color: var(--sky-text);
  font-weight: 900;
  font-size: 14px;
  flex-shrink: 0;
}
.pm-lazy-more,
.pm-empty {
  text-align: center;
  padding: 14px;
  font-size: 12px;
  color: var(--ink-muted);
}

/* Customer Profile Modal */
.cm-body {
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.cm-hero {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
}
.cm-avatar {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  background: var(--sky-bg);
  color: var(--sky-text);
  border: 1px solid var(--sky-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
}
.cm-company {
  font-size: 14.5px;
  font-weight: 800;
  color: var(--ink-strong);
}
.cm-mst {
  font-size: 12px;
  color: var(--sky-text);
  margin-top: 2px;
}
.cm-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.cm-field {
  padding: 9px 11px;
  border-radius: 9px;
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.cm-field.is-full {
  grid-column: 1 / -1;
}
.cm-field span {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-muted);
}
.cm-field strong {
  font-size: 12.5px;
  color: var(--ink-strong);
  word-break: break-word;
}
.cm-foot {
  padding: 12px 16px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-modal-head);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* Queued Confirm Dialog */
.qlbg-confirm-modal {
  width: min(440px, 100%);
  background: var(--bg-modal);
  border: 1px solid var(--border-control);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-modal);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cfm-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cfm-icon.is-danger {
  background: var(--rose-bg);
  color: var(--rose-text);
  border: 1px solid var(--rose-border);
}
.cfm-icon.is-emerald {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border: 1px solid var(--emerald-border);
}
.cfm-icon.is-sky {
  background: var(--sky-bg);
  color: var(--sky-text);
  border: 1px solid var(--sky-border);
}
.cfm-title {
  margin: 2px 0 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--ink-strong);
}
.cfm-desc {
  margin: 0;
  font-size: 13px;
  color: var(--ink-secondary);
  line-height: 1.5;
}
.cfm-meta-box {
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.cfm-meta-line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
}
.cfm-meta-line span {
  color: var(--ink-muted);
}
.cfm-meta-line strong {
  color: var(--ink-strong);
  text-align: right;
}
.cfm-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
}

/* Async Progress Card */
.qlbg-async-card {
  width: min(360px, 100%);
  background: var(--bg-modal);
  border: 1px solid var(--border-control);
  border-radius: 16px;
  padding: 24px 20px;
  box-shadow: var(--shadow-modal);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}
.async-badge {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 900;
}
.async-badge.is-emerald {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border: 1px solid var(--emerald-border);
}
.async-badge.is-rose {
  background: var(--rose-bg);
  color: var(--rose-text);
  border: 1px solid var(--rose-border);
}
.async-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--ink-strong);
}
.async-msg {
  font-size: 12.5px;
  color: var(--ink-muted);
}

/* Single Merged Smart Toast */
.qlbg-smart-toast {
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000000;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 10px 16px;
  border-radius: 999px;
  background: var(--bg-modal);
  color: var(--ink-strong);
  border: 1px solid var(--border-control);
  box-shadow: var(--shadow-modal);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  max-width: calc(100vw - 28px);
}
.qlbg-smart-toast .toast-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--sky-text);
}
.qlbg-smart-toast.is-success {
  border-color: var(--emerald-border);
}
.qlbg-smart-toast.is-success .toast-dot {
  background: var(--emerald-text);
}
.qlbg-smart-toast.is-error {
  border-color: var(--rose-border);
}
.qlbg-smart-toast.is-error .toast-dot {
  background: var(--rose-text);
}
.qlbg-smart-toast.is-warning {
  border-color: var(--amber-border);
}
.qlbg-smart-toast.is-warning .toast-dot {
  background: var(--amber-text);
}

.qlbg-toast-enter-active,
.qlbg-toast-leave-active {
  transition: all 0.22s ease;
}
.qlbg-toast-enter-from,
.qlbg-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -12px);
}

/* ==========================================================================
   9. RESPONSIVE — TABLET & MOBILE BOTTOM-SHEET ARCHITECTURE
========================================================================== */
@media (max-width: 1080px) {
  .qlbg-kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .hide-md {
    display: none;
  }
  .dm-body {
    grid-template-columns: 1fr;
  }
  .dm-mobile-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    padding: 8px 14px;
    background: var(--bg-modal-head);
    border-bottom: 1px solid var(--border-subtle);
    flex-shrink: 0;
  }
  .dm-mob-tab {
    width: 100%;
    margin: 0;
    padding: 7px 10px;
    border-radius: 8px;
    border: 1px solid var(--border-control);
    background: var(--bg-input);
    color: var(--ink-muted);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  .dm-mob-tab.active {
    background: var(--sky-bg);
    color: var(--sky-text);
    border-color: var(--sky-border);
  }
  .mob-hidden {
    display: none !important;
  }
  .dm-side-col {
    border-left: none;
  }
}

@media (max-width: 768px) {
  .qlbg-page {
    padding: 10px 10px 32px;
  }

  .hide-xs {
    display: none !important;
  }
  .show-xs-flex {
    display: inline-flex !important;
    gap: 5px;
  }

  .bg-topbar {
    padding: 10px 12px;
  }
  .bg-title {
    font-size: 15px;
  }
  .bg-topbar-right {
    width: 100%;
    justify-content: space-between;
  }

  .qlbg-kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
  .qlbg-kpi-card {
    padding: 10px 11px;
  }
  .kpi-val {
    font-size: 18px;
  }
  .kpi-val.is-money {
    font-size: 15.5px;
  }

  .qlbg-picker-btn,
  .qlbg-select-wrap {
    flex: 1 1 calc(50% - 6px);
    max-width: none;
  }

  .qlbg-group-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 11px 12px;
  }
  .gh-right {
    width: 100%;
    justify-content: flex-start;
    padding-left: 26px;
  }

  .qlbg-cards-grid {
    grid-template-columns: 1fr;
  }
  .qlbg-cards-grid.is-inside-group {
    padding: 10px;
  }

  /* Bottom-Sheet Modals on Mobile (except compact confirm/async cards) */
  .qlbg-overlay {
    padding: 0;
    align-items: flex-end;
  }
  .qlbg-confirm-modal,
  .qlbg-async-card {
    margin: auto 14px;
  }
  .qlbg-detail-modal,
  .qlbg-picker-modal,
  .qlbg-cust-modal {
    width: 100%;
    max-height: 94vh;
    border-radius: 18px 18px 0 0;
    border-bottom: none;
  }
  .mob-sheet-grabber {
    display: block;
    width: 40px;
    height: 4px;
    border-radius: 999px;
    background: var(--border-control);
    margin: 8px auto 2px;
    flex-shrink: 0;
  }

  /* Responsive Mobile Line-Item Cards inside Detail Modal */
  .dm-table-wrap {
    border: none;
    overflow: visible;
  }
  .dm-items-table thead {
    display: none;
  }
  .dm-items-table,
  .dm-items-table tbody {
    display: block;
    width: 100%;
  }
  .dm-group-row {
    display: block;
    margin-bottom: 8px;
    border-radius: 8px;
    overflow: hidden;
  }
  .dm-group-row td {
    display: inline-block;
    border: none;
  }
  .dm-item-row {
    display: block;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: 11px;
    padding: 8px 11px;
    margin-bottom: 9px;
  }
  .dm-item-row td {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    width: 100% !important;
    padding: 5px 0;
    border-bottom: 1px dashed var(--border-subtle);
    text-align: right !important;
  }
  .dm-item-row td:last-child {
    border-bottom: none;
  }
  .dm-item-row td::before {
    content: attr(data-label);
    font-size: 11px;
    font-weight: 700;
    color: var(--ink-muted);
    text-align: left;
    flex-shrink: 0;
  }
  .dm-item-row td.col-name {
    flex-direction: column;
    align-items: flex-start;
    text-align: left !important;
  }

  .cm-grid {
    grid-template-columns: 1fr;
  }

  .dm-foot {
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
  }
  .dm-foot-right {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .dm-foot-right > button:last-child {
    grid-column: 1 / -1;
  }
}
</style>
